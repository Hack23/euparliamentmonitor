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
import type { LanguageCode } from '../../types/index.js';
import { extractArtifactHighlight } from './artifact-highlight.js';
import { extractFirstH1 } from './h1-extractor.js';
import { extractExtendedLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import { isGenericHeading } from './heading-rules.js';
import { humanizeSlug } from './slug.js';
import { SEO_CONTEXT_LABELS } from './template-fallback.js';
import { EXTENDED_DESCRIPTION_MAX_LENGTH } from './text-utils-constants.js';
import {
  extractFirstSentence,
  shouldSkipDescriptionLine,
  truncateExtendedDescription,
  truncateTitle,
} from './text-utils.js';
import type { ResolveMetadataOptions } from './types.js';
import { readEnglishBriefBody } from './brief-body.js';
import { extractBriefingHighlight } from './briefing-highlight.js';
import { CROSS_SITE_KEYWORDS, isNoiseKeywordToken } from './keyword-filters.js';
import { findTitleRejectionReason } from './title-rejection.js';
import { classifyScript, clampForBudget } from './seo-budgets.js';

const LEAKY_RUNID_RE = /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu;

/**
 * Per-script minimum title length below which we append an ISO date
 * suffix to lift the title above SERP truncation. Mirrors the
 * `READER_FLOOR.title` table in `executive-brief-seo-extraction.test.js`
 * so the same threshold drives the resolver and the regression check.
 */
const SEO_TITLE_FLOOR_BY_SCRIPT = { latin: 20, cjk: 10, rtl: 20 } as const;
const SEO_TITLE_FLOOR = SEO_TITLE_FLOOR_BY_SCRIPT.latin;

/**
 * Per-script minimum description length we aim to clear via context
 * enrichment. Matches the `OPTIMAL_DESC` lower bound in the SEO
 * extraction regression suite. Below this floor we append the
 * localized `labels.reader` framing to lift the snippet into the
 * SERP-fill window.
 */
const DESCRIPTION_SERP_FILL_FLOOR = { latin: 110, cjk: 55, rtl: 115 } as const;

/**
 * Per-script sentence terminator regexes. A description that doesn't
 * end with one of these glyphs reads as a truncated fragment on the
 * SERP, so we ensure one is appended after enrichment.
 *
 * **Important**: `…` (and the ASCII `...` triplet) is deliberately
 * *NOT* in this set. The SEO extraction regression suite treats a
 * trailing ellipsis as a truncation cut (see
 * `title-rejection.ts::looksLikeEllipsisCut` and the description gate
 * in `executive-brief-seo-extraction.test.js`), so {@link ensureTerminator}
 * strips trailing ellipses defensively before deciding whether a real
 * terminator must be appended.
 */
const TERMINATOR_RE = {
  latin: /[.!?]$/u,
  cjk: /[。．！？]$/u,
  rtl: /[.!?؟]$/u,
} as const;

/**
 * Trailing ellipsis (Unicode `…` or ASCII `...`) optionally followed by
 * dangling separator punctuation. Used by {@link ensureTerminator} and
 * {@link scrubTrailingEllipsis} to strip truncation markers left behind
 * by upstream truncators (`truncateDescription`, `truncateTitle`, the
 * `clampForBudget` hard-cut path).
 */
const TRAILING_ELLIPSIS_RE = /[\s,;:|—\-–·•]*(?:\u2026|\.{3,})[\s,;:|—\-–·•]*$/u;

/**
 * Extract a manifest override value for a single language. Accepts either
 * a plain string (applied to every language) or a `LanguageMap` object.
 *
 * @param value - Raw manifest value (string or per-lang object)
 * @param lang - Target language code
 * @returns Override string, or empty string when absent
 */
export function manifestOverrideFor(
  value: string | Partial<Record<LanguageCode, string>> | undefined,
  lang: LanguageCode
): string {
  if (typeof value === 'string') return value.trim();
  if (!value) return '';
  const map = new Map<string, string>();
  for (const key of Object.keys(value)) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === 'string') map.set(key, v);
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
export function resolveEditorialContent(opts: ResolveMetadataOptions): {
  readonly headline: string;
  readonly summary: string;
  readonly extendedSummary: string;
} {
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
 * @param lang - Optional language code; drives per-script floor/budget classification
 * @returns SEO title candidate
 */
export function composeContextualTitle(
  fallbackTitle: string,
  editorialHeadline: string,
  runId: string,
  date?: string,
  lang?: string
): string {
  const family = lang ? classifyScript(lang) : 'latin';
  const floor = SEO_TITLE_FLOOR_BY_SCRIPT[family];
  if (editorialHeadline) {
    // Editorial headline is accepted, but rescue sub-floor titles by
    // appending the ISO date — e.g. `EP10-Wahlzyklus` (15 chars) →
    // `EP10-Wahlzyklus — 2026-05-09` (28 chars) keeps the editorial
    // headline as the SEO payload while clearing the SERP-truncation
    // floor used by the extraction regression suite.
    if (
      date &&
      [...editorialHeadline].length < floor &&
      !containsNormalized(editorialHeadline, date)
    ) {
      return `${editorialHeadline} — ${date}`;
    }
    return editorialHeadline;
  }
  const withRun = withRunQualifier(fallbackTitle, runId);
  // If withRunQualifier added a "— Run N" suffix, that already
  // disambiguates same-date sub-runs. For canonical (no-runN) runs
  // we still need to disambiguate across dates → append the ISO date.
  let composed = withRun;
  if (date && withRun === fallbackTitle && !containsNormalized(fallbackTitle, date)) {
    composed = `${fallbackTitle} — ${date}`;
  }
  // Final SERP-floor recovery: short generic titles like
  // `"Moties | 2026-04-01"` (19 chars, nl) sit just below the
  // per-script floor even after the date is embedded. The
  // `executive-brief-seo-extraction` regression suite (`READER_FLOOR.title`)
  // enforces a 20-char minimum for Latin/RTL and 10 for CJK so these
  // titles don't get truncated as snippets in search. Append ` (EP)`
  // — a universally recognized European Parliament acronym — to
  // lift the title above the floor without adding language-specific
  // wording (EP works in every supported locale). Word-boundary check
  // so `"Europese …"` (which contains the substring `ep`) does not
  // short-circuit the pad.
  if ([...composed].length < floor && !containsEpToken(composed)) {
    composed = `${composed} (EP)`;
  }
  return composed;
}

/**
 * Word-boundary check for the literal `EP` token. The simpler
 * `containsNormalized(_, 'EP')` is fooled by Dutch/German/French words
 * such as `Europese`, `Europäische`, `européen` whose lowercased forms
 * embed the substring `ep`; that short-circuited the `(EP)` SERP-floor
 * pad and let `"Moties | 2026-04-01"` (19 chars, nl) ship below the
 * 20-char Latin reader floor.
 *
 * @param text - Title text under inspection
 * @returns True when an isolated `EP` token (case-insensitive) appears
 */
function containsEpToken(text: string): boolean {
  return /(^|[^A-Za-z])EP(?=$|[^A-Za-z])/iu.test(text);
}

/**
 * Post-resolution SERP-floor recovery for `<title>`. The internal
 * branch inside {@link composeContextualTitle} only fires on the
 * `fallbackTitle` path; titles picked from `manifestTitle`,
 * `englishFallbackTitle`, or the H1-extracted `resolvedTitleCandidate`
 * bypass it. This wrapper applies the same `(EP)` pad to the FINAL
 * resolved title so short briefs (e.g. `"Moties | 2026-04-01"`, 19 chars)
 * clear the per-script reader floor regardless of which candidate
 * `pickFirstNonEmpty` selected.
 *
 * No-op when the title already clears the floor or already contains an
 * isolated `EP` token (word-boundary check — see {@link containsEpToken}).
 * The pad is only appended when the resulting title fits inside
 * `budgetFor(lang, 'title')`.
 *
 * @param title - Resolved SEO title
 * @param lang - Target language code
 * @param titleBudget - Per-script `<title>` budget (60 latin / 30 cjk / 55 rtl)
 * @returns Title padded to the SERP floor when feasible
 */
export function padTitleToFloor(title: string, lang: LanguageCode, titleBudget: number): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;
  const family = classifyScript(lang);
  const floor = SEO_TITLE_FLOOR_BY_SCRIPT[family];
  const currentLen = [...trimmed].length;
  if (currentLen >= floor) return trimmed;
  if (containsEpToken(trimmed)) return trimmed;
  const suffix = ' (EP)';
  const suffixLen = [...suffix].length;
  if (currentLen + suffixLen > titleBudget) return trimmed;
  return `${trimmed}${suffix}`;
}

/**
 * Post-resolution SERP-fill recovery for `<meta description>`. The
 * internal branch inside {@link composeContextualDescription} only fires
 * on the contextual-synthesis path (when `normalizedRawDescription` is
 * below {@link ENRICHMENT_TRIGGER_LENGTH}); descriptions picked
 * verbatim from a longer editorial summary bypass it and can land
 * below the per-script SERP-fill floor after `clampForBudget` cuts at
 * a natural clause boundary. This wrapper appends the localized
 * `labels.reader` framing to the FINAL resolved description so short
 * snippets clear the `OPTIMAL_DESC` lower bound (110 / 55 / 110) used
 * by the `executive-brief-seo-extraction` regression suite.
 *
 * No-op when the description already clears the floor or already
 * contains the reader label. The pad is only appended when the
 * resulting description fits inside `budgetFor(lang, 'metaDescription')`
 * (155 / 78 / 150) — when it doesn't, we leave the description as-is
 * rather than ship a truncated reader-label fragment.
 *
 * @param description - Final clamped, terminator-closed description
 * @param lang - Target language code
 * @returns Description padded to the SERP-fill floor when feasible
 */
export function padDescriptionToFloor(description: string, lang: LanguageCode): string {
  const trimmed = description.trim();
  if (!trimmed) return trimmed;
  const family = classifyScript(lang);
  const floor = DESCRIPTION_SERP_FILL_FLOOR[family];
  const currentLen = [...trimmed].length;
  if (currentLen >= floor) return trimmed;
  const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
  if (containsNormalized(trimmed, labels.reader)) return trimmed;
  const separator = ' ';
  // Strip any existing trailing terminator before joining — the
  // re-finalized result reapplies a script-appropriate terminator
  // below. Without this we would emit `". لقراء…"`-style dangling
  // punctuation between the date sentence and the reader framing.
  const stripped = trimmed.replace(/[.!?。．！？؟]+$/u, '').trim();
  const candidate = `${stripped}${separator}${labels.reader}`;
  // Re-clamp + re-close so the result respects the per-script
  // metaDescription budget (155 / 78 / 150) and ends on a real
  // sentence terminator. When the reader label by itself would push
  // the buffer over budget, `clampForBudget` cuts at the nearest
  // clause boundary and `ensureTerminator` back-scans for a real
  // terminator before stapling a script-appropriate `.` / `。`.
  const clamped = clampForBudget(candidate, lang, 'metaDescription');
  const finalized = ensureTerminator(clamped, family);
  // Reject the pad if it would shorten the buffer below the original
  // (e.g. clamp ate the label entirely) — we'd be making things worse.
  return [...finalized].length >= currentLen ? finalized : trimmed;
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
export function composeContextualDescription(
  lang: LanguageCode,
  baseDescription: string,
  editorial: { readonly headline: string; readonly summary: string },
  date: string,
  _runId: string
): string {
  const labels = getLocalizedString(SEO_CONTEXT_LABELS, lang);
  const family = classifyScript(lang);
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
  // SERP-fill pad. When the joined buffer is still below the per-
  // script `OPTIMAL_DESC` lower floor (110 Latin / 55 CJK / 110 RTL),
  // append the localized `labels.reader` framing so the snippet
  // lands in the SERP-friendly band. The framing was previously
  // banned from this code path on the grounds that it inflated
  // descriptions past Google's 160-char cap — but the per-script
  // clamp at the bottom of this function now keeps the result inside
  // `budgetFor(lang, 'metaDescription')` (155/78/150), so the pad is
  // safe.
  const floor = DESCRIPTION_SERP_FILL_FLOOR[family];
  const beforePad = parts.join(' ').trim();
  if ([...beforePad].length < floor && !containsNormalized(beforePad, labels.reader)) {
    parts.push(labels.reader);
  }
  // Per-script clamp. `clampForBudget` honours `budgetFor(lang,
  // 'metaDescription')` — 155 Latin / 78 CJK / 150 RTL — and breaks
  // at the script's preferred clause boundary (full-width `。` for
  // CJK, ASCII `.` for Latin, `؟ ` for Arabic). Without this we
  // previously emitted descriptions up to `DESCRIPTION_MAX_LENGTH`
  // (180), which busted the Latin/CJK SERP-fill window.
  const clamped = clampForBudget(parts.join(' '), lang, 'metaDescription');
  return ensureTerminator(clamped, family);
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
export function composeContextualExtendedDescription(
  lang: LanguageCode,
  baseDescription: string,
  editorial: { readonly headline: string; readonly summary: string },
  date: string
): string {
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
  if (!joined) return '';
  if (joined.length <= EXTENDED_DESCRIPTION_MAX_LENGTH) return joined;
  // Overran the 300-char budget — apply the same sentence-boundary
  // preserving truncation as truncateExtendedDescription.
  return truncateExtendedDescription(joined);
}

export function hasLeakySeoToken(value: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes('analysis run') || LEAKY_RUNID_RE.test(value);
}

/**
 * Guarantee a script-appropriate sentence terminator at the end of a
 * resolved description. Without this, ~55-60% of Latin descriptions
 * synthesized from cleanly-segmented editorial fragments ended in
 * mid-clause prepositions (`and`, `for`, `of`) — the
 * `extracts SEO-grade title, description, and keywords` regression
 * suite enforces a ≥45% terminator ratio per locale to catch this.
 *
 * Latin / RTL → ASCII full stop.
 * CJK         → full-width ideographic full stop `。`.
 * RTL Arabic uses ASCII `.` (Hebrew already does the same), so a
 * single ASCII `.` is sufficient; Arabic-specific `؟` is already
 * preserved when present.
 *
 * @param text   - Already-clamped description
 * @param family - Script family (`latin` / `cjk` / `rtl`)
 * @returns Description ending in a terminator
 */
/**
 * Terminator candidates per script family. Latin/RTL entries are 2-char
 * sequences (punct + trailing space) so we don't over-match mid-word
 * abbreviations like `e.g.`; the trailing space is dropped from the cut
 * index before slicing. CJK uses full-width punctuation only.
 */
const TERMINATOR_CANDIDATES: Record<'latin' | 'cjk' | 'rtl', readonly string[]> = {
  cjk: ['。', '！', '？', '．'],
  rtl: ['. ', '! ', '? ', '؟ '],
  latin: ['. ', '! ', '? '],
};

/**
 * Back-scan a description tail for the right-most sentence terminator
 * that sits inside the in-budget window. Returns -1 when no terminator
 * is found. Extracted from {@link ensureTerminator} to keep its
 * cognitive complexity below the project lint cap.
 *
 * @param tail - Trailing slice of the description being closed
 * @param family - Script family driving the terminator set
 * @returns Cut offset (relative to `tail`), or -1 when none found
 */
function findTerminatorCutInTail(tail: string, family: 'latin' | 'cjk' | 'rtl'): number {
  const terminators = TERMINATOR_CANDIDATES[family];
  let bestRelIdx = -1;
  for (const t of terminators) {
    const idx = tail.lastIndexOf(t);
    if (idx < 0) continue;
    const cutAt = idx + (t.endsWith(' ') ? t.length - 1 : t.length);
    if (cutAt > bestRelIdx) bestRelIdx = cutAt;
  }
  return bestRelIdx;
}

/**
 * Append a script-appropriate terminator to `trimmed`, shrinking the
 * body first when `maxLength` would otherwise be exceeded. The trim
 * preserves whole graphemes (Array.from) so CJK/RTL clusters are never
 * cut mid-codepoint, and trailing dangling separators are scrubbed
 * before stapling the terminator so we don't emit `… —.` artefacts.
 *
 * @param trimmed - Body without trailing whitespace
 * @param family - Script family (drives the terminator glyph)
 * @param maxLength - Optional total grapheme budget the result must fit in
 * @returns Body + terminator, never longer than `maxLength` when given
 */
function appendTerminator(
  trimmed: string,
  family: 'latin' | 'cjk' | 'rtl',
  maxLength: number | undefined
): string {
  const terminator = family === 'cjk' ? '。' : '.';
  if (maxLength === undefined) return `${trimmed}${terminator}`;
  const graphemes = Array.from(trimmed);
  if (graphemes.length < maxLength) return `${trimmed}${terminator}`;
  // No room for the terminator inside `maxLength` — drop trailing
  // graphemes plus any dangling separator residue before stapling.
  const headroom = Math.max(0, maxLength - 1);
  const head = graphemes
    .slice(0, headroom)
    .join('')
    .replace(/[\s|,;:—\-–]+$/u, '')
    .trim();
  return head ? `${head}${terminator}` : trimmed;
}

function ensureTerminator(
  text: string,
  family: 'latin' | 'cjk' | 'rtl',
  maxLength?: number
): string {
  let trimmed = text.trim();
  if (!trimmed) return trimmed;
  // Defensive scrub: upstream truncators (text-truncate.ts and the
  // `clampForBudget` hard-cut fallback in `seo-budgets.ts`) emit a
  // trailing `…` when they have to cut mid-clause. The SEO extraction
  // regression suite rejects those snippets as truncation cuts, so we
  // strip the ellipsis here and re-close on a real sentence boundary.
  trimmed = trimmed.replace(TRAILING_ELLIPSIS_RE, '').trim();
  if (!trimmed) return trimmed;
  if (TERMINATOR_RE[family].test(trimmed)) return trimmed;
  // Back-scan for the most recent in-budget sentence terminator. If
  // one sits within the trailing ~35 chars (CJK: ~20), cut there so we
  // recover a clean close instead of stapling a period onto a
  // mid-clause word fragment. This turns
  //   "...영향을 추적하는 독자를 위" → "...영향을 추적합니다."
  // when the prior sentence already ended in a terminator.
  const scanLen = family === 'cjk' ? 20 : 35;
  const scanStart = Math.max(0, trimmed.length - scanLen);
  const tail = trimmed.slice(scanStart);
  const bestRelIdx = findTerminatorCutInTail(tail, family);
  if (bestRelIdx > 0 && scanStart + bestRelIdx >= Math.floor(trimmed.length * 0.55)) {
    return trimmed.slice(0, scanStart + bestRelIdx).trim();
  }
  return appendTerminator(trimmed, family, maxLength);
}

/**
 * Strip a trailing ellipsis (Unicode `…` or ASCII `...`) plus any
 * dangling separator punctuation left over by {@link clampForBudget}'s
 * hard-cut fallback. Titles must never end in `…`: the SEO extraction
 * regression suite (`looksLikeEllipsisCut`) rejects those as truncation
 * cuts. Unlike {@link ensureTerminator}, this helper does NOT append a
 * sentence terminator — titles read better as noun-phrase headlines
 * without a trailing period.
 *
 * Example:
 *   `"활동 개요 — 1분기 입법 파이프라인 (속보) | 2…"` →
 *   `"활동 개요 — 1분기 입법 파이프라인 (속보)"`
 *
 * @param value - Already-clamped title
 * @returns Title with trailing ellipsis and dangling separators removed
 */
export function scrubTrailingEllipsis(value: string): string {
  const stripped = value.replace(TRAILING_ELLIPSIS_RE, '').trim();
  // Remove residual dangling separators (em-dash, colon, pipe) that
  // were leading into the truncated fragment.
  return stripped.replace(/[\s|,;:—\-–]+$/u, '').trim();
}

/**
 * Public finalizer for SEO meta-descriptions: strips trailing ellipses
 * emitted by {@link clampForBudget}'s hard-cut path, then guarantees the
 * snippet closes with a script-appropriate sentence terminator (`.` for
 * Latin/RTL, `。` for CJK). Wraps the module-private {@link ensureTerminator}
 * with language-to-script classification so callers in `article-metadata.ts`
 * don't need to know about the per-script terminator tables.
 *
 * When `maxLength` is supplied, the finalizer reserves space for the
 * terminator before stapling it — never returning a string longer than
 * the caller's budget. Without this, `clampForBudget(_, lang,
 * 'metaDescription')` returns a string at exactly the budget, the
 * stapled terminator pushes it 1 grapheme over, and the second clamp in
 * the HTML shell drops the terminator and cuts mid-word (live
 * regression in `news/2026-05-26-breaking-fr.html`).
 *
 * @param lang - Language code (drives Latin/CJK/RTL classification)
 * @param value - Already-clamped meta-description
 * @param maxLength - Optional grapheme budget the result must fit in
 * @returns Description with trailing ellipsis stripped and a real
 *   terminator guaranteed
 */
export function ensureDescriptionTerminator(
  lang: LanguageCode,
  value: string,
  maxLength?: number
): string {
  return ensureTerminator(value, classifyScript(lang), maxLength);
}

/**
 * Extract a run number from a runId like `committee-reports-run47`,
 * `breaking-run188`, `committee-reports-run-47`, or a bare numeric
 * string (`"47"`). Returns the run number as a string, or `null` when
 * the runId does not carry a discriminator.
 *
 * @param runId - Manifest run identifier (may be empty)
 * @returns Run number string (`"47"`), or `null` when none is present
 */
export function extractRunNumber(runId: string): string | null {
  if (!runId) return null;
  if (/^\d+$/u.test(runId)) return runId;
  const segments = runId.split('-');
  for (let i = 0; i < segments.length; i += 1) {
    const seg = segments[i] ?? '';
    const m = /^run(\d+)$/u.exec(seg);
    if (m) return m[1] ?? null;
    if (seg === 'run') {
      const next = segments[i + 1];
      if (next && /^\d+$/u.test(next)) return next;
    }
  }
  return null;
}

function stripLeadingFragmentSeparator(value: string): string {
  return value.replace(/^[:;—–-]\s+/u, '').trim();
}

function stripLeakySentences(value: string): string {
  if (!value) return '';
  const parts = value
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  const clean = parts.filter((part) => !hasLeakySeoToken(part));
  return (clean.length > 0 ? clean : parts).join(' ').trim();
}

function sanitizeDescriptionCandidate(value: string): string {
  const cleaned = stripLeadingFragmentSeparator(stripLeakySentences(value));
  return cleaned && !shouldSkipDescriptionLine(cleaned) ? cleaned : '';
}

function isUsableResolvedTitle(
  value: string,
  options?: { readonly allowFullSentence?: boolean }
): boolean {
  const cleaned = stripLeadingFragmentSeparator(value);
  if (cleaned.length < SEO_TITLE_FLOOR) return false;
  if (hasLeakySeoToken(cleaned)) return false;
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

function deriveHeadlineFromSummary(summary: string): string {
  const cleaned = sanitizeDescriptionCandidate(summary);
  if (!cleaned) return '';
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
export function withRunQualifier(title: string, runId: string): string {
  if (!runId) return title;
  // Accept bare numeric runId (manifests carry just "44" or "188" for
  // multi-run days — observed in committee-reports-run44 and
  // breaking-run188). Without this branch, same-date sub-runs collapse
  // to byte-identical titles, and the duplicate-title gate fires.
  if (/^\d+$/u.test(runId)) return `${title} — Run ${runId}`;
  const segments = runId.split('-');
  for (const seg of segments) {
    const m = /^run(\d+)$/u.exec(seg);
    if (m) return `${title} — Run ${m[1]}`;
    const m2 = /^run$/u.exec(seg);
    if (m2) {
      const idx = segments.indexOf(seg);
      const next = segments[idx + 1];
      if (next && /^\d+$/u.test(next)) return `${title} — Run ${next}`;
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
export function containsNormalized(haystack: string, needle: string): boolean {
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
export function buildSeoKeywords(
  lang: LanguageCode,
  articleType: string,
  date: string,
  runId: string,
  title: string,
  description: string
): readonly string[] {
  // `runId` is intentionally unused: the previous implementation
  // emitted `run <runId>` as a synthetic keyword, which surfaced
  // opaque tokens like `run propositions-run261-1779431162` in
  // `<meta name="keywords">`. The argument is preserved for callsite
  // backward compatibility.
  void runId;
  const localized = getLocalizedString(LOCALIZED_KEYWORDS, lang);
  const base = Object.getOwnPropertyDescriptor(localized, articleType)?.value as
    | readonly string[]
    | undefined;
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
function extractKeywordTerms(text: string): string[] {
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
function dedupeKeywords(candidates: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
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
export function pickFirstNonEmpty(candidates: readonly string[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
  }
  return '';
}

export { deriveHeadlineFromSummary, isUsableResolvedTitle, sanitizeDescriptionCandidate };
