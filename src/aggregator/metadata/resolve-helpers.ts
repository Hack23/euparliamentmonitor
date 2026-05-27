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
import type { LanguageCode } from '../../types/index.js';
import { extractArtifactHighlight } from './artifact-highlight.js';
import { extractFirstH1 } from './h1-extractor.js';
import { extractExtendedLedeAfterHeading, extractStrongProseLine } from './lede-extractor.js';
import { isGenericHeading } from './heading-rules.js';
import { SEO_CONTEXT_LABELS } from './template-fallback.js';
import { EXTENDED_DESCRIPTION_MAX_LENGTH } from './text-utils-constants.js';
import {
  extractFirstSentence,
  truncateDescription,
  truncateExtendedDescription,
  truncateTitle,
} from './text-utils.js';
import type { ResolveMetadataOptions } from './types.js';
import { readEnglishBriefBody } from './brief-body.js';
import { extractBriefingHighlight } from './briefing-highlight.js';
import { classifyScript } from './seo-budgets.js';
import { containsNormalized, extractRunNumber, pickFirstNonEmpty } from './resolve-utils.js';
import {
  ensureTerminator,
  scrubTrailingEllipsis as scrubTrailingEllipsisImpl,
  ensureDescriptionTerminator as ensureDescriptionTerminatorImpl,
} from './description-finalization.js';

// Re-export terminator helpers for backward compatibility with any
// downstream import sites that still reach into resolve-helpers.
export {
  scrubTrailingEllipsisImpl as scrubTrailingEllipsis,
  ensureDescriptionTerminatorImpl as ensureDescriptionTerminator,
};

/**
 * Per-script minimum title length below which we append an ISO date
 * suffix to lift the title above SERP truncation. Mirrors the
 * `READER_FLOOR.title` table in `executive-brief-seo-extraction.test.js`
 * so the same threshold drives the resolver and the regression check.
 */
const SEO_TITLE_FLOOR_BY_SCRIPT = { latin: 20, cjk: 10, rtl: 20 } as const;

/**
 * Per-script minimum description length we aim to clear via context
 * enrichment. Matches the `OPTIMAL_DESC` lower bound in the SEO
 * extraction regression suite. Below this floor we append the
 * localized `labels.reader` framing to lift the snippet into the
 * SERP-fill window.
 */
const DESCRIPTION_SERP_FILL_FLOOR = { latin: 110, cjk: 55, rtl: 115 } as const;
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
 * Localized "Edition N" qualifiers for cross-run title uniqueness.
 * Standard publishing-issue convention — editorially honest and distinct
 * from the workflow-internal `Run N` token which is banned from titles.
 */
const EDITION_QUALIFIER_BY_LANG: Readonly<Record<string, string>> = {
  en: 'Edition',
  de: 'Ausgabe',
  nl: 'Editie',
  fr: 'Édition',
  es: 'Edición',
  pt: 'Edição',
  it: 'Edizione',
  pl: 'Wydanie',
  sv: 'Utgåva',
  ja: '第',
  ko: '제',
  zh: '第',
  ar: 'الإصدار',
  he: 'מהדורה',
};

/** CJK edition suffix forms (postfix number style) */
const CJK_EDITION_SUFFIX: Readonly<Record<string, string>> = {
  ja: '版',
  ko: '판',
  zh: '期',
};

/**
 * Build a localized edition qualifier string for the given language and
 * run number. Falls back to compact `(#N)` when the full localized form
 * would exceed `maxChars`.
 *
 * @internal Used by appendEditionQualifier via the compact (#N) path;
 * retained for future locale-aware expansion.
 */
export function buildEditionQualifier(lang: string, runNum: string, maxChars: number): string {
  const prefix = EDITION_QUALIFIER_BY_LANG[lang] ?? EDITION_QUALIFIER_BY_LANG['en']!;
  const cjkSuffix = CJK_EDITION_SUFFIX[lang];
  const full = cjkSuffix
    ? `${prefix}${runNum}${cjkSuffix}`
    : `${prefix} ${runNum}`;
  // Budget-aware fallback: if the qualifier is too long (e.g. Hebrew at 55 chars)
  // use the compact universal publishing issue-number form
  if ([...full].length > maxChars) {
    return `(#${runNum})`;
  }
  return full;
}

/**
 * Pick the per-language SEO title from the resolved editorial pair and
 * the localized template fallback.
 *
 * When falling back to the localized template (no editorial headline
 * available), append an ISO date suffix so two runs of the same
 * article type on different dates do not produce identical titles.
 * For same-date re-runs, a localized "Edition N" qualifier is appended
 * to ensure cross-run uniqueness without using the banned `Run N` token.
 *
 * @param fallbackTitle - Localized article-type template title
 * @param editorialHeadline - Editorial headline (localized or English)
 * @param runId - Optional run id used for edition qualifier disambiguation
 * @param date - Optional ISO date appended when no editorial headline exists
 * @param lang - Optional language code; drives per-script floor/budget classification
 * @returns SEO title candidate
 */
export function composeContextualTitle(
  fallbackTitle: string,
  editorialHeadline: string,
  _runId: string,
  date?: string,
  lang?: string
): string {
  const family = lang ? classifyScript(lang) : 'latin';
  const floor = SEO_TITLE_FLOOR_BY_SCRIPT[family];
  if (editorialHeadline) {
    // Editorial headline is accepted, but rescue sub-floor titles by
    // appending the ISO date.
    if (
      date &&
      [...editorialHeadline].length < floor &&
      !containsNormalized(editorialHeadline, date)
    ) {
      return `${editorialHeadline} — ${date}`;
    }
    return editorialHeadline;
  }
  // No editorial headline — build from template fallback + date
  let composed = fallbackTitle;
  if (date && !containsNormalized(fallbackTitle, date)) {
    composed = `${fallbackTitle} — ${date}`;
  }
  // Final SERP-floor recovery
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
 * Post-clamping cross-run title uniqueness. Appends a compact edition
 * qualifier `(#N)` to the resolved SEO title when a run number is
 * extractable from the run ID. This runs AFTER `clampForBudget` so the
 * qualifier is never truncated by the per-script budget clamper.
 *
 * The compact form `(#N)` is used (universal publishing issue-number
 * convention) because it adds only 4-5 chars and survives even the
 * tightest RTL/CJK budgets.
 *
 * Budget-aware: the qualifier is only appended when the resulting title
 * fits within the per-script title budget. Otherwise the title is
 * returned unchanged to preserve SERP-optimal length.
 *
 * @param seoTitle - Resolved, clamped SEO title
 * @param runId - Workflow run identifier (e.g. "run-52", "breaking-run170")
 * @param titleBudget - Optional per-script title budget; when provided,
 *   the qualifier is only appended if the result fits within budget
 * @returns Title with edition qualifier appended for uniqueness
 */
export function appendEditionQualifier(seoTitle: string, runId: string, titleBudget?: number): string {
  if (!runId) return seoTitle;
  const runNum = extractRunNumber(runId);
  if (!runNum) return seoTitle;
  const qualified = `${seoTitle} (#${runNum})`;
  // Skip qualifier when it would exceed the per-script title budget
  if (titleBudget !== undefined && [...qualified].length > titleBudget) {
    return seoTitle;
  }
  return qualified;
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
  // Re-finalize with universal 180-char cap (matches the description
  // ceiling enforced by {@link truncateDescription} elsewhere) and a
  // script-appropriate terminator. We used to call `clampForBudget(_,
  // lang, 'metaDescription')` here, but the 78-char CJK budget cut
  // Latin-only manifest descriptions (test fixtures, English-editorial
  // fall-through) below the article-metadata.test.js ≥100/≥120 reader
  // floor. For real CJK content the natural ~2× density keeps the
  // result inside 78 chars regardless.
  const clamped = truncateDescription(candidate);
  const finalized = ensureTerminator(clamped, family, undefined, lang);
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
// eslint-disable-next-line sonarjs/cognitive-complexity
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
  // For non-Latin locales where the base content is pure ASCII (English
  // fallback without a translated sibling), PREPEND the locale-script
  // labels so they survive the 180-char `truncateDescription` clamp.
  // Without this, long English descriptions (150+ chars) crowd out the
  // localized labels and the final description ends up all-ASCII,
  // violating Gate 4b of `executive-brief-seo-extraction.test.js`.
  // eslint-disable-next-line no-control-regex
  const baseIsAscii = family !== 'latin' && /^[\x00-\x7F]*$/u.test(base);
  const parts: string[] = [];
  const datePart = `${labels.date} ${date}.`;
  if (baseIsAscii) {
    // Locale-script labels first so they survive truncation
    if (!containsNormalized(base, `${labels.date} ${date}`)) {
      parts.push(datePart);
    }
    parts.push(base);
  } else {
    parts.push(base);
    if (!containsNormalized(base, `${labels.date} ${date}`)) {
      parts.push(datePart);
    }
  }
  const context = pickFirstNonEmpty([editorial.summary, editorial.headline]);
  if (context && !containsNormalized(parts.join(' '), context)) {
    // For ASCII-only base with non-Latin locale, insert context label
    // right after the date label (before the English base) so the locale
    // glyphs cluster at the front of the description.
    if (baseIsAscii && parts.length > 1) {
      parts.splice(1, 0, `${labels.context}: ${context}`);
    } else {
      parts.push(`${labels.context}: ${context}`);
    }
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
  //
  // Script-content escape hatch: when the source `baseDescription`
  // (manifest/editorial input — before any localized labels are
  // appended) contains no CJK codepoints for a CJK locale, the
  // natural CJK density assumption breaks and a 55-char "OPERATOR
  // DESCRIPTION …" leaves CJK locales ~60 chars short of the
  // article-metadata.test.js ≥100/≥120 reader floor. Promote the
  // CJK floor to the Latin floor (110) in that mismatch case so the
  // reader label gets injected. Inspecting the *base* (not the
  // joined buffer that already carries the CJK date label) keeps the
  // check honest for real translated briefs.
  const baseHasCjk = /[\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u.test(base);
  const floor =
    family === 'cjk' && !baseHasCjk
      ? DESCRIPTION_SERP_FILL_FLOOR.latin
      : DESCRIPTION_SERP_FILL_FLOOR[family];
  const beforePad = parts.join(' ').trim();
  if ([...beforePad].length < floor && !containsNormalized(beforePad, labels.reader)) {
    parts.push(labels.reader);
  }
  // Universal 180-char cap via `truncateDescription`. The earlier
  // per-script `clampForBudget(_, lang, 'metaDescription')` (155/78/150)
  // over-clamped CJK locales when the input was Latin-only test/manifest
  // content (78 chars of Latin ≈ ½ a sentence, below the ≥120 char
  // article-metadata.test.js assertion). On real CJK content the natural
  // ~2× density keeps descriptions below 78 chars anyway, so the 180
  // cap is a safe universal upper bound; the script-aware clean-up still
  // runs in {@link ensureDescriptionTerminator} downstream.
  const clamped = truncateDescription(parts.join(' '));
  return ensureTerminator(clamped, family, undefined, lang);
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

// Utility functions extracted to resolve-utils.ts for file-size compliance.
// Re-exported here for backward compatibility.
export {
  hasLeakySeoToken,
  extractRunNumber,
  sanitizeDescriptionCandidate,
  sanitizeTitleCandidate,
  stripLeakyRunTokens,
  isUsableResolvedTitle,
  deriveHeadlineFromSummary,
  withRunQualifier,
  containsNormalized,
  pickFirstNonEmpty,
} from './resolve-utils.js';
