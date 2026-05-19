// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/Resolve
 * @description Top-level orchestrator for per-language `{title,
 * description}` resolution. Composes the leaf metadata helpers
 * (h1-extractor, lede-extractor, heading-rules, slug, artifact-highlight,
 * template-fallback, text-utils) plus the editorial-brief-resolver into
 * the priority ladder documented at the top of `article-metadata.ts`.
 *
 * Imports siblings directly rather than going through the
 * `article-metadata.ts` barrel so this module stays out of the
 * `editorial-brief-resolver.ts` ↔ `article-metadata.ts` cycle.
 */
import { ALL_LANGUAGES, getLocalizedString } from '../../constants/language-core.js';
import { LOCALIZED_KEYWORDS } from '../../constants/language-articles.js';
import { resolveLocalizedBriefHighlight } from '../editorial-brief-resolver.js';
import { extractArtifactHighlight } from './artifact-highlight.js';
import { extractFirstH1 } from './h1-extractor.js';
import { extractExtendedLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import { isGenericHeading } from './heading-rules.js';
import { humanizeSlug } from './slug.js';
import { SEO_CONTEXT_LABELS, buildTemplateFallback } from './template-fallback.js';
import { ENRICHMENT_TRIGGER_LENGTH, extractFirstSentence, truncateDescription, truncateExtendedDescription, truncateTitle, } from './text-utils.js';
/**
 * Extract a manifest override value for a single language. Accepts either
 * a plain string (applied to every language) or a `LanguageMap` object.
 *
 * @param value - Raw manifest value (string or per-lang object)
 * @param lang - Target language code
 * @returns Override string, or empty string when absent
 */
function manifestOverrideFor(value, lang) {
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
 * tiers 2–4.
 *
 * @param opts - Resolver inputs
 * @returns Editorial content derived from English source
 */
function resolveEditorialContent(opts) {
    const { articleType, date, markdown, runDir } = opts;
    let artefactSummary = '';
    if (runDir) {
        const highlight = extractArtifactHighlight(runDir, articleType, date);
        if (highlight?.headline) {
            return {
                headline: highlight.headline,
                summary: highlight.summary,
                extendedSummary: extractExtendedLedeAfterHeading(markdown),
            };
        }
        if (highlight?.summary) {
            artefactSummary = highlight.summary;
        }
    }
    const aggregatedH1 = extractFirstH1(markdown);
    const aggregatedSummary = extractStrongProseLine(markdown);
    const aggregatedExtended = extractExtendedLedeAfterHeading(markdown);
    if (aggregatedH1 && !isGenericHeading(aggregatedH1, articleType, date)) {
        return {
            headline: truncateTitle(aggregatedH1),
            summary: artefactSummary || aggregatedSummary,
            extendedSummary: aggregatedExtended,
        };
    }
    const summary = artefactSummary || aggregatedSummary;
    if (summary) {
        // The H1 is generic (category-noun, bare-institutional, or
        // template-style) so we have to derive `<title>` from the BLUF/
        // lede paragraph. Extract the first complete sentence so the
        // resulting title is grammatically self-contained — falling back
        // to clause-boundary truncation downstream when the sentence
        // itself overruns TITLE_MAX_LENGTH.
        const firstSentence = extractFirstSentence(summary);
        return {
            headline: truncateTitle(firstSentence),
            summary,
            extendedSummary: aggregatedExtended,
        };
    }
    return { headline: '', summary: '', extendedSummary: '' };
}
/**
 * Pick the per-language SEO title from the resolved editorial pair and
 * the localized template fallback. The decision tree mirrors the priority
 * ladder in the module header:
 *
 *   - When an editorial headline exists (either translated brief or
 *     English brief / aggregated source), use it **verbatim** — no
 *     concatenation with the localized type/date template. Concatenation
 *     historically produced strings like
 *     `Senaste Nytt: Betydande Parlamentariska Händelser — 2026-05-15 — Breaking News: EP April 2026 Plenary Outcomes`
 *     which mix two languages in a single `<title>` and are blocked by
 *     `scripts/validate-manifest-seo.js`'s `english-fallthrough` gate.
 *   - When no editorial headline exists at all, fall back to the
 *     localized type/date template plus a run qualifier so same-type pages
 *     remain distinguishable.
 *
 * @param fallbackTitle - Localized article-type template title
 * @param editorialHeadline - Editorial headline (localized or English)
 * @param runId - Optional run id used only when no editorial headline exists
 * @returns SEO title candidate
 */
function composeContextualTitle(fallbackTitle, editorialHeadline, runId) {
    if (editorialHeadline)
        return editorialHeadline;
    return withRunQualifier(fallbackTitle, runId);
}
/**
 * Add localized article context to short or duplicate-prone meta
 * descriptions. This turns generic type-level subtitles into
 * page-specific descriptions suitable for search snippets.
 *
 * Internal artefact identifiers (`runId`) are deliberately NOT included
 * in the description: they leak into Google snippets as opaque tokens
 * like `breaking-run255-1778894853` and provide no value to readers.
 * The verbose `evidence` boilerplate (`with source-linked voting,
 * committee and legislative intelligence`) is also dropped — it pads
 * bytes without adding editorial information and was the dominant
 * source of mid-sentence ellipsis truncation observed in production.
 *
 * The reader-hint suffix (`labels.reader`) is preserved because it
 * supplies a stable localized intent signal even when the lede is
 * very short.
 *
 * @param lang - Target language code
 * @param baseDescription - Best description from manifest/editorial/template
 * @param editorial - Artifact-derived headline and summary
 * @param editorial.headline - Artifact-derived headline
 * @param editorial.summary - Artifact-derived summary
 * @param date - ISO article date
 * @param _runId - Reserved (formerly emitted; no longer used)
 * @returns Description in the target language context, capped for SEO snippets
 */
function composeContextualDescription(lang, baseDescription, editorial, date, _runId) {
    const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
    const parts = [baseDescription.trim()];
    parts.push(`${labels.date} ${date}.`);
    const context = pickFirstNonEmpty([editorial.summary, editorial.headline]);
    if (context && !containsNormalized(parts[0] ?? '', context)) {
        parts.push(`${labels.context}: ${context}`);
    }
    parts.push(labels.reader);
    return truncateDescription(parts.join(' '));
}
/**
 * Append a short run qualifier to otherwise duplicate-prone fallback
 * titles. Sanitizes the raw `runId` (which is an internal artefact
 * identifier of the shape `<slug>-run<N>[-<unix-ts>]`) so user-facing
 * `<title>` strings never expose Unix timestamps or the full opaque
 * token. Only the short ordinal `N` is retained.
 *
 * Examples:
 * - `breaking-run255-1778894853` → `Run 255`
 * - `committee-reports-run330-1778735854` → `Run 330`
 * - `breaking-run-001` → `Run 001`
 *
 * When the runId does not match the canonical shape, the qualifier is
 * omitted entirely rather than leak an unknown-format token into SEO
 * surfaces.
 *
 * @param title - Base title
 * @param runId - Optional run id (sanitized before use)
 * @returns Title with short run qualifier, or unchanged when sanitization fails
 */
function withRunQualifier(title, runId) {
    if (!runId)
        return title;
    // Walk segments backwards: find the last `run<digits>` token. The
    // runId shape is `<slug>-run<N>[-<unix-ts>]` — we explicitly avoid a
    // single regex with overlapping `\d+` groups, which the SonarJS
    // unsafe-regex rule flags as catastrophic-backtracking-prone.
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
function containsNormalized(haystack, needle) {
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
    const localized = getLocalizedString(LOCALIZED_KEYWORDS, lang);
    const base = Object.getOwnPropertyDescriptor(localized, articleType)?.value;
    const fallback = ['EU Parliament', 'European Parliament', 'political intelligence'];
    const candidates = [
        ...(base ?? fallback),
        humanizeSlug(articleType),
        date,
        ...(runId ? [`run ${runId}`] : []),
        ...extractKeywordTerms(`${title} ${description}`),
    ];
    return dedupeKeywords(candidates).slice(0, 16);
}
/**
 * Extract short keyword terms from resolved SEO copy.
 *
 * @param text - Title and description text
 * @returns Candidate terms
 */
function extractKeywordTerms(text) {
    return text
        .split(/[^\p{L}\p{N}]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 4 && !/^\d+$/.test(token))
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
 * Resolve per-language `{title, description}` for one article following
 * the priority ladder documented at the top of `article-metadata.ts`.
 *
 * @param opts - Resolver inputs ({@link ResolveMetadataOptions})
 * @returns One `{title, description}` entry per supported language
 */
export function resolveArticleMetadata(opts) {
    const manifest = opts.manifest ?? {};
    const englishEditorial = resolveEditorialContent(opts);
    const template = buildTemplateFallback(opts.articleType, opts.date, manifest.committee);
    const runId = manifest.runId?.trim() ?? '';
    const result = Object.create(null);
    for (const lang of ALL_LANGUAGES) {
        const entry = resolveOneLanguage({
            lang,
            manifest,
            englishEditorial,
            template: template[lang],
            runDir: opts.runDir,
            articleType: opts.articleType,
            date: opts.date,
            runId,
        });
        Object.defineProperty(result, lang, {
            value: entry,
            enumerable: true,
            writable: true,
            configurable: true,
        });
    }
    return result;
}
/**
 * Resolve `{title, description, keywords, source}` for one language. The
 * priority ladder is:
 *
 *   1. manifest override (per-language wins, then string fall-through)
 *   2. localized executive brief (`executive-brief_<lang>.md`) headline +
 *      summary — only for non-English `<lang>`
 *   3. English executive brief / aggregated editorial — verbatim for
 *      non-English locales that have no translated brief yet, so the
 *      SEO surfaces never collapse to a boring type/date template while a
 *      real editorial highlight exists
 *   4. localized template fallback
 *
 * @param input - Per-language inputs
 * @returns One resolved metadata entry
 */
function resolveOneLanguage(input) {
    const manifestTitle = manifestOverrideFor(input.manifest.title, input.lang);
    const manifestDescription = manifestOverrideFor(input.manifest.description, input.lang);
    const perLanguage = resolvePerLanguageEditorial(input);
    const editorial = perLanguage.editorial;
    const contextualTitle = composeContextualTitle(input.template.title, editorial.headline, input.runId);
    const title = pickFirstNonEmpty([manifestTitle, contextualTitle, input.template.title]);
    const rawDescription = pickFirstNonEmpty([
        manifestDescription,
        editorial.summary,
        input.template.subtitle,
    ]);
    const description = rawDescription.length >= ENRICHMENT_TRIGGER_LENGTH
        ? rawDescription
        : composeContextualDescription(input.lang, rawDescription, editorial, input.date, input.runId);
    const truncatedTitle = truncateTitle(title);
    const truncatedDescription = truncateDescription(description);
    // The extended description tracks the same source as the short
    // description: when a manifest description overrides, use it
    // verbatim (no point synthesising an extended form from the brief
    // when the editor explicitly chose the manifest copy); otherwise
    // use the editorial extended summary lifted from the brief BLUF.
    // `truncateExtendedDescription` returns `''` when the candidate
    // wouldn't be longer than the regular meta description, so callers
    // can fall back to {@link description} via a simple `||`.
    const extendedSource = manifestDescription
        ? manifestDescription
        : editorial.extendedSummary || rawDescription;
    const truncatedExtendedDescription = truncateExtendedDescription(extendedSource);
    const source = manifestTitle || manifestDescription ? 'manifest' : perLanguage.source;
    return {
        title: truncatedTitle,
        description: truncatedDescription,
        extendedDescription: truncatedExtendedDescription,
        keywords: buildSeoKeywords(input.lang, input.articleType, input.date, input.runId, truncatedTitle, truncatedDescription),
        source,
    };
}
/**
 * Select the editorial `{headline, summary}` pair for one language,
 * preferring the translated `executive-brief_<lang>.md` over the English
 * brief. Records which tier provided the content so the caller can wire
 * up the editorial fallback note and the manifest-SEO validator without
 * re-scanning the run directory.
 *
 * - For `lang === 'en'`: always returns the English `englishEditorial`
 *   pair (whose source is the canonical English brief / aggregated
 *   Markdown / artefact ladder in {@link resolveEditorialContent}).
 * - For non-English `<lang>`: probes `runDir` for
 *   `executive-brief_<lang>.md` (and the `extended/` sibling) and
 *   prefers its headline + lede. Falls through to the English editorial
 *   when no translated brief exists.
 *
 * @param input - Per-language inputs
 * @returns Editorial pair plus the tier that produced it
 */
function resolvePerLanguageEditorial(input) {
    if (input.lang !== 'en' && input.runDir) {
        const localized = resolveLocalizedBriefHighlight(input.runDir, input.lang, input.articleType, input.date);
        if (localized && (localized.headline || localized.summary)) {
            // Prefer the localized headline; if missing, allow the localized
            // summary to drive the title via {@link composeContextualTitle}'s
            // `editorialHeadline || fallbackTitle` path while still feeding the
            // localized summary into the description.
            return {
                editorial: {
                    headline: localized.headline,
                    summary: localized.summary,
                    extendedSummary: localized.extendedSummary,
                },
                source: 'localized-brief',
            };
        }
    }
    // No localized brief — fall through to the English editorial pair.
    if (input.englishEditorial.headline || input.englishEditorial.summary) {
        return {
            editorial: input.englishEditorial,
            source: input.lang === 'en' ? 'english-editorial' : 'english-brief',
        };
    }
    // Nothing editorial at all → caller will fall back to the localized
    // template.
    return {
        editorial: { headline: '', summary: '', extendedSummary: '' },
        source: 'template',
    };
}
/**
 * Return the first non-empty, trimmed entry from a candidate list, or
 * the empty string when every entry is blank.
 *
 * @param candidates - Ordered list of candidate strings
 * @returns First non-empty entry
 */
function pickFirstNonEmpty(candidates) {
    for (const c of candidates) {
        if (typeof c === 'string' && c.trim().length > 0)
            return c.trim();
    }
    return '';
}
//# sourceMappingURL=resolve.js.map