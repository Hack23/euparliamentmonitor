// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/ResolveHelpers
 * @description Pure helper functions for the metadata resolver. These
 * have no runtime dependency on any aggregator module outside the
 * `metadata/` bounded context, so they live as a leaf module under
 * `src/aggregator/metadata/`. The `resolveArticleMetadata` orchestrator
 * itself stays in `src/aggregator/article-metadata.ts` (the barrel)
 * because it needs `resolveLocalizedBriefHighlight` from
 * `editorial-brief-resolver.ts`, which is an upward-pointing import
 * forbidden by the `metadata/` leaf-module rule (see
 * `test/unit/cross-context-imports.test.js`).
 */
import { getLocalizedString } from '../../constants/language-core.js';
import { LOCALIZED_KEYWORDS } from '../../constants/language-articles.js';
import { extractArtifactHighlight } from './artifact-highlight.js';
import { extractFirstH1 } from './h1-extractor.js';
import { extractExtendedLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import { isGenericHeading } from './heading-rules.js';
import { humanizeSlug } from './slug.js';
import { SEO_CONTEXT_LABELS } from './template-fallback.js';
import { EXTENDED_DESCRIPTION_MAX_LENGTH } from './text-utils-constants.js';
import { extractFirstSentence, shouldSkipDescriptionLine, truncateDescription, truncateExtendedDescription, truncateTitle, } from './text-utils.js';
import { readEnglishBriefBody } from './brief-body.js';
import { extractBriefingHighlight } from './briefing-highlight.js';
import { CROSS_SITE_KEYWORDS, isNoiseKeywordToken } from './keyword-filters.js';
import { findTitleRejectionReason } from './title-rejection.js';
const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;
const SEO_TITLE_FLOOR = 20;
/**
 * Extract a manifest override value for a single language. Accepts either
 * a plain string (applied to every language) or a `LanguageMap` object.
 *
 * @param value - Raw manifest value (string or per-lang object)
 * @param lang - Target language code
 * @returns Override string, or empty string when absent
 */
export function manifestOverrideFor(value, lang) {
    if (typeof value === 'string')
        return value.trim();
    if (!value)
        return '';
    const map = new Map();
    for (const key of Object.keys(value)) {
        const v = value[key];
        if (typeof v === 'string')
            map.set(key, v);
    }
    const entry = map.get(lang);
    return typeof entry === 'string' ? entry.trim() : '';
}
/**
 * Internal: best editorial `{headline, summary}` pair available from the
 * aggregator output and artefacts, independent of language. Used for
 * tiers 2–4 of the resolver priority ladder.
 *
 * @param opts - Resolver inputs
 * @returns Editorial content derived from English source
 */
export function resolveEditorialContent(opts) {
    const { articleType, date, markdown, runDir } = opts;
    // Tier 1 (NEW, May-2026): structural extraction of `## Strategic
    // Intelligence Summary` and `## Reader Briefing` from the English
    // brief. These two sections are the editorial heart of every
    // current-style executive brief — they are journalistically richer
    // than the first non-generic H1 the legacy walker picks up, so we
    // try them first. Returns `null` for the ~200 historical briefs
    // that pre-date the style guide, in which case we fall through.
    const briefBody = readEnglishBriefBody(runDir ?? '');
    const briefing = briefBody ? extractBriefingHighlight(briefBody) : null;
    // Bridge the briefing's `string | undefined` fields into plain
    // strings so the downstream `||` fallback chains satisfy the
    // `prefer-nullish-coalescing` lint rule (no nullable LHS).
    const briefingHeadline = briefing?.headline ?? '';
    const briefingSummary = briefing?.summary ?? '';
    const briefingExtended = briefing?.extendedSummary ?? '';
    if (briefingHeadline) {
        return {
            headline: briefingHeadline,
            summary: briefingSummary,
            extendedSummary: briefingExtended || extractExtendedLedeAfterHeading(markdown),
        };
    }
    let artefactSummary = '';
    if (runDir) {
        const highlight = extractArtifactHighlight(runDir, articleType, date);
        const highlightHeadline = highlight?.headline ?? '';
        const highlightSummary = highlight?.summary ?? '';
        if (highlightHeadline) {
            return {
                headline: highlightHeadline,
                summary: briefingSummary || highlightSummary,
                extendedSummary: briefingExtended || extractExtendedLedeAfterHeading(markdown),
            };
        }
        if (highlightSummary) {
            artefactSummary = highlightSummary;
        }
    }
    // Per the brief-only SEO contract (2026-05-24): when an executive
    // brief is present, we **never** fall through to the aggregated
    // `markdown` content (which is the assembled `article.md` body
    // including all artefact prose). The brief is the only sanctioned
    // source for `<title>` / `<meta description>` / keywords; if it
    // failed to yield a usable headline above, the resolver returns
    // empty so the localized template fallback (Breaking | YYYY-MM-DD,
    // etc.) wins. Only legacy runs that ship without a brief at all are
    // allowed to reach the aggregated-markdown fallback.
    const briefPresent = briefBody.trim().length > 0;
    if (briefPresent) {
        if (artefactSummary) {
            const firstSentence = extractFirstSentence(artefactSummary);
            return {
                headline: truncateTitle(firstSentence || artefactSummary),
                summary: briefingSummary || artefactSummary,
                extendedSummary: briefingExtended || extractExtendedLedeAfterHeading(markdown),
            };
        }
        return {
            headline: '',
            summary: briefingSummary,
            extendedSummary: briefingExtended,
        };
    }
    const aggregatedH1 = extractFirstH1(markdown);
    const aggregatedSummary = extractStrongProseLine(markdown);
    const aggregatedExtended = extractExtendedLedeAfterHeading(markdown);
    if (aggregatedH1 && !isGenericHeading(aggregatedH1, articleType, date)) {
        return {
            headline: truncateTitle(aggregatedH1),
            summary: briefingSummary || artefactSummary || aggregatedSummary,
            extendedSummary: briefingExtended || aggregatedExtended,
        };
    }
    const summary = briefingSummary || artefactSummary || aggregatedSummary;
    if (summary) {
        // The H1 is generic (category-noun, bare-institutional, or
        // template-style) so we have to derive `<title>` from the BLUF/
        // lede paragraph. Extract the first complete sentence so the
        // resulting title is grammatically self-contained — falling back
        // to clause-boundary truncation downstream when the sentence
        // itself overruns TITLE_MAX_LENGTH.
        // Fall back to the raw summary when the first-sentence extractor
        // returns '' — happens when the source is a single sentence with no
        // `. ` terminator inside the soft-min window. `truncateTitle` will
        // still apply clause-boundary truncation downstream.
        const firstSentence = extractFirstSentence(summary);
        return {
            headline: truncateTitle(firstSentence || summary),
            summary,
            extendedSummary: briefingExtended || aggregatedExtended,
        };
    }
    return { headline: '', summary: '', extendedSummary: '' };
}
/**
 * Pick the per-language SEO title from the resolved editorial pair and
 * the localized template fallback.
 *
 * When falling back to the localized template (no editorial headline
 * available), append an ISO date suffix so two runs of the same
 * article type on different dates do not produce identical titles.
 * The user's bug report explicitly allows this prefix: "ok to prefix
 * with 'article type date' in short form if no real data exist".
 *
 * The ISO suffix uses an en-dash separator (` — YYYY-MM-DD`) which
 * is locale-neutral, fits CJK/RTL clamping behaviour (see
 * `seo-budgets.ts` clause boundaries), and is already used by
 * {@link withRunQualifier}.
 *
 * @param fallbackTitle - Localized article-type template title
 * @param editorialHeadline - Editorial headline (localized or English)
 * @param runId - Optional run id used only when no editorial headline exists
 * @param date - Optional ISO date appended when no editorial headline exists
 * @returns SEO title candidate
 */
export function composeContextualTitle(fallbackTitle, editorialHeadline, runId, date) {
    if (editorialHeadline)
        return editorialHeadline;
    const withRun = withRunQualifier(fallbackTitle, runId);
    // If withRunQualifier added a "— Run N" suffix, that already
    // disambiguates same-date sub-runs. For canonical (no-runN) runs
    // we still need to disambiguate across dates → append the ISO date.
    if (date && withRun === fallbackTitle && !containsNormalized(fallbackTitle, date)) {
        return `${fallbackTitle} — ${date}`;
    }
    return withRun;
}
/**
 * Add localized article context to short or duplicate-prone meta
 * descriptions.
 *
 * @param lang - Target language code
 * @param baseDescription - Best description from manifest/editorial/template
 * @param editorial - Artifact-derived headline and summary
 * @param editorial.headline - Artifact-derived headline
 * @param editorial.summary - Artifact-derived summary
 * @param date - ISO article date
 * @param _runId - Reserved (formerly emitted; no longer used)
 * @returns Description in the target language context
 */
export function composeContextualDescription(lang, baseDescription, editorial, date, _runId) {
    const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
    const base = baseDescription.trim();
    const parts = [base];
    const datePart = `${labels.date} ${date}.`;
    if (!containsNormalized(base, `${labels.date} ${date}`)) {
        parts.push(datePart);
    }
    const context = pickFirstNonEmpty([editorial.summary, editorial.headline]);
    if (context && !containsNormalized(parts[0] ?? '', context)) {
        parts.push(`${labels.context}: ${context}`);
    }
    // NOTE: the localized `labels.reader` "for democratic-accountability
    // readers …" hint is intentionally **not** appended here. That
    // boilerplate inflates `<meta description>` past the 160-char SERP
    // cutoff without surfacing any article-specific signal, so it is
    // restricted to the longer {@link composeContextualExtendedDescription}
    // path (used by `og:description` / AI-overview surfaces, which have
    // a 250–300 char budget where the framing carries real value).
    return truncateDescription(parts.join(' '));
}
/**
 * Build a per-article `extendedDescription` (used for
 * `og:description`, Twitter cards, and AI-overview surfaces) that is
 * always ≥ {@link DESCRIPTION_MAX_LENGTH} characters whenever the
 * editorial source paragraph is too short to satisfy
 * {@link truncateExtendedDescription} on its own.
 *
 * This is the *only* code path that surfaces the localized
 * `labels.reader` framing — the short `<meta description>` no longer
 * carries it (see comment in {@link composeContextualDescription}).
 * The structure is: `<base> <Date: YYYY-MM-DD.> <Context: …> <reader>`,
 * passed through {@link truncateExtendedDescription} (300-char max with
 * a 200-char min) so it occupies the Open Graph / Discover budget
 * without exceeding it.
 *
 * @param lang - Target language code
 * @param baseDescription - Best description from manifest/editorial/template
 * @param editorial - Artifact-derived headline and summary
 * @param editorial.headline - Artifact-derived headline
 * @param editorial.summary - Artifact-derived summary
 * @param date - ISO article date
 * @returns Extended description ≥180 chars when feasible, otherwise `''`
 */
export function composeContextualExtendedDescription(lang, baseDescription, editorial, date) {
    const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
    const base = baseDescription.trim();
    const parts = base ? [base] : [];
    const datePart = `${labels.date} ${date}.`;
    if (!containsNormalized(base, `${labels.date} ${date}`)) {
        parts.push(datePart);
    }
    const context = pickFirstNonEmpty([editorial.summary, editorial.headline]);
    if (context && !containsNormalized(parts.join(' '), context)) {
        parts.push(`${labels.context}: ${context}`);
    }
    if (!containsNormalized(parts.join(' '), labels.reader)) {
        parts.push(labels.reader);
    }
    // Synthesizer path: clamp to the 300-char og:description budget
    // *without* enforcing the 181-char sentence-boundary floor that
    // {@link truncateExtendedDescription} applies. The whole point of
    // this helper is to produce a non-empty extended description when
    // the editorial source paragraph was too short — accepting a
    // 130-char synthesized string is strictly better than the empty
    // fallback that was previously emitted on 56 breaking briefs.
    // We delegate the actual clamp to {@link truncateDescription} on
    // the joined buffer first (which won't trip because the buffer is
    // already under 300), then truncate again only if it overruns
    // the larger 300-char budget.
    const joined = parts.join(' ').trim();
    if (!joined)
        return '';
    if (joined.length <= EXTENDED_DESCRIPTION_MAX_LENGTH)
        return joined;
    // Overran the 300-char budget — apply the same sentence-boundary
    // preserving truncation as truncateExtendedDescription.
    return truncateExtendedDescription(joined);
}
export function hasLeakySeoToken(value) {
    if (!value)
        return false;
    return value.toLowerCase().includes('analysis run') || LEAKY_RUNID_RE.test(value);
}
function stripLeadingFragmentSeparator(value) {
    return value.replace(/^[:;—–-]\s+/u, '').trim();
}
function stripLeakySentences(value) {
    if (!value)
        return '';
    const parts = value
        .split(/(?<=[.!?])\s+/u)
        .map((part) => part.trim())
        .filter(Boolean);
    const clean = parts.filter((part) => !hasLeakySeoToken(part));
    return (clean.length > 0 ? clean : parts).join(' ').trim();
}
function sanitizeDescriptionCandidate(value) {
    const cleaned = stripLeadingFragmentSeparator(stripLeakySentences(value));
    return cleaned && !shouldSkipDescriptionLine(cleaned) ? cleaned : '';
}
function isUsableResolvedTitle(value, options) {
    const cleaned = stripLeadingFragmentSeparator(value);
    if (cleaned.length < SEO_TITLE_FLOOR)
        return false;
    if (hasLeakySeoToken(cleaned))
        return false;
    // Reject section-header leaks, ellipsis-truncated strings, doc-IDs,
    // and full-sentence fragments. See `title-rejection.ts` for the
    // canonical denylist + structural rules. Without these guards, the
    // 216-article audit (2026-05-24) showed `Strategic significance`,
    // `Threat Level`, `Convergence themes`, `TA-10-2026-0160`, and
    // ellipsis-cut paragraphs reaching the `<title>` surface.
    //
    // When `allowFullSentence` is true, the `sentence-fragment` reason is
    // tolerated. This is used for summary-derived titles where the first
    // sentence of the summary is the intended payload (e.g. recess days
    // whose summary leads with `No new breaking developments on …`).
    const reason = findTitleRejectionReason(cleaned);
    if (reason && !(options?.allowFullSentence && reason === 'sentence-fragment')) {
        return false;
    }
    return true;
}
function deriveHeadlineFromSummary(summary) {
    const cleaned = sanitizeDescriptionCandidate(summary);
    if (!cleaned)
        return '';
    return truncateTitle(extractFirstSentence(cleaned) || cleaned);
}
/**
 * Append a short run qualifier to otherwise duplicate-prone fallback
 * titles. Sanitizes the raw `runId` so user-facing `<title>` strings
 * never expose Unix timestamps or the full opaque token.
 *
 * @param title - Base title
 * @param runId - Optional run id (sanitized before use)
 * @returns Title with short run qualifier, or unchanged when sanitization fails
 */
export function withRunQualifier(title, runId) {
    if (!runId)
        return title;
    // Accept bare numeric runId (manifests carry just "44" or "188" for
    // multi-run days — observed in committee-reports-run44 and
    // breaking-run188). Without this branch, same-date sub-runs collapse
    // to byte-identical titles, and the duplicate-title gate fires.
    if (/^\d+$/u.test(runId))
        return `${title} — Run ${runId}`;
    const segments = runId.split('-');
    for (const seg of segments) {
        const m = /^run(\d+)$/u.exec(seg);
        if (m)
            return `${title} — Run ${m[1]}`;
        const m2 = /^run$/u.exec(seg);
        if (m2) {
            const idx = segments.indexOf(seg);
            const next = segments[idx + 1];
            if (next && /^\d+$/u.test(next))
                return `${title} — Run ${next}`;
        }
    }
    return title;
}
/**
 * Case-insensitive containment check after whitespace normalization.
 *
 * @param haystack - Text to search
 * @param needle - Text to locate
 * @returns True when `needle` is already present in `haystack`
 */
export function containsNormalized(haystack, needle) {
    const cleanHaystack = haystack.toLowerCase().replace(/\s+/g, ' ');
    const cleanNeedle = needle.toLowerCase().replace(/\s+/g, ' ');
    return cleanNeedle.length > 0 && cleanHaystack.includes(cleanNeedle);
}
/**
 * Build a stable, localized keyword list from the article type plus the
 * resolved title/description context.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param date - ISO article date
 * @param runId - Optional run id
 * @param title - Resolved title
 * @param description - Resolved description
 * @returns De-duplicated keywords for `<meta name="keywords">`
 */
export function buildSeoKeywords(lang, articleType, date, runId, title, description) {
    // `runId` is intentionally unused: the previous implementation
    // emitted `run <runId>` as a synthetic keyword, which surfaced
    // opaque tokens like `run propositions-run261-1779431162` in
    // `<meta name="keywords">`. The argument is preserved for callsite
    // backward compatibility.
    void runId;
    const localized = getLocalizedString(LOCALIZED_KEYWORDS, lang);
    const base = Object.getOwnPropertyDescriptor(localized, articleType)?.value;
    const fallback = ['EU Parliament', 'European Parliament', 'political intelligence'];
    const candidates = [
        // Always-on cross-site portfolio keywords lead the list so they
        // are guaranteed to survive the 16-entry budget cap.
        ...CROSS_SITE_KEYWORDS,
        ...(base ?? fallback),
        humanizeSlug(articleType),
        date,
        ...extractKeywordTerms(`${title} ${description}`),
    ];
    return dedupeKeywords(candidates).slice(0, 16);
}
/**
 * Extract short keyword terms from resolved SEO copy.
 *
 * Filters out tokens that look like UUID hex fragments, run-id slugs,
 * or digit-dominated noise (see {@link isNoiseKeywordToken}) so the
 * keyword list never leaks internal aggregator identifiers into
 * `<meta name="keywords">`.
 *
 * @param text - Title and description text
 * @returns Candidate terms
 */
function extractKeywordTerms(text) {
    return text
        .split(/[^\p{L}\p{N}]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 4 && !isNoiseKeywordToken(token))
        .slice(0, 18);
}
/**
 * De-duplicate keywords case-insensitively while preserving original order.
 *
 * @param candidates - Raw keyword candidates
 * @returns De-duplicated keyword list
 */
function dedupeKeywords(candidates) {
    const seen = new Set();
    const out = [];
    for (const candidate of candidates) {
        const trimmed = candidate.trim();
        if (!trimmed)
            continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(trimmed);
    }
    return out;
}
/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 *
 * @param candidates - Ordered list of candidate strings
 * @returns First non-empty entry
 */
export function pickFirstNonEmpty(candidates) {
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim().length > 0)
            return c.trim();
    }
    return '';
}
export { deriveHeadlineFromSummary, isUsableResolvedTitle, sanitizeDescriptionCandidate };
//# sourceMappingURL=resolve-helpers.js.map