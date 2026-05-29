// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/ResolveScriptUtils
 * @description Script-aware SEO helpers extracted from
 * `per-language-resolver.ts` to keep that module below the 600-line
 * drift-guard cap (see `test/unit/source-file-size.test.js`).
 *
 * This leaf module owns the locale-script probes and the small,
 * pure decision helpers that depend on them:
 *
 *   - {@link contentMatchesLocaleScript} — does the copy carry a glyph in
 *     the locale's expected script family?
 *   - {@link shouldEnrichDescription} — should the raw description be
 *     pushed through the localized enrichment path? (Gate 4b)
 *   - {@link pickResolvedTitle} — pick the `<title>` from the candidate
 *     ladder, skipping pure-ASCII summary titles for non-Latin locales
 *     (Gate 4a).
 *   - {@link pickResolvedTitleCandidate} — gate the H1/document-derived
 *     title candidate.
 *   - {@link appendRunNumberSuffix} — preserved no-op for backward
 *     compatibility.
 *
 * Pure, leaf module: no I/O. Imports only from the sibling SEO leaf
 * modules (`seo-budgets`, `resolve-helpers`, `text-utils`).
 */

import type { LanguageCode } from '../../types/index.js';
import { budgetFor, classifyScript } from './seo-budgets.js';
import {
  deriveHeadlineFromSummary,
  hasLeakySeoToken,
  isUsableResolvedTitle,
  pickFirstNonEmpty,
  sanitizeTitleCandidate,
} from './resolve-helpers.js';
import { findTitleRejectionReason } from './title-rejection.js';
import { ENRICHMENT_TRIGGER_LENGTH, truncateTitle } from './text-utils.js';

/**
 * Unicode glyph probes used to detect whether resolved SEO copy actually
 * matches the publishing locale's expected script. The CJK range covers
 * Hiragana / Katakana (Japanese), Han ideographs (Chinese + Japanese kanji)
 * and Hangul (Korean). The RTL range covers Hebrew (U+0590–U+05FF) and
 * Arabic + supplements (U+0600–U+06FF).
 *
 * These probes drive the script-aware description clamp and the
 * English-summary-derived title rejection gate below.
 */
export const CJK_GLYPH_RE = /[\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u;
export const RTL_GLYPH_RE = /[\u0590-\u05FF\u0600-\u06FF]/u;
// eslint-disable-next-line no-control-regex
export const ASCII_ONLY_RE = /^[\x00-\x7F]*$/u;

/**
 * Test whether `text` contains a glyph in the script family expected for
 * `lang`. Latin locales return `true` unconditionally — their content is
 * always Latin glyphs by definition.
 *
 * @param text - SEO copy under inspection
 * @param lang - Publishing locale
 * @returns True when `text` carries at least one glyph in the locale's script
 */
export function contentMatchesLocaleScript(text: string, lang: LanguageCode): boolean {
  const family = classifyScript(lang);
  if (family === 'latin') return true;
  if (family === 'cjk') return CJK_GLYPH_RE.test(text);
  return RTL_GLYPH_RE.test(text);
}

/**
 * No-op: run numbers must never appear in user-facing article titles.
 * Titles should always be readable article headlines without workflow
 * identifiers. This function is preserved for callsite backward
 * compatibility.
 *
 * @param seoTitle - SEO title (returned unchanged)
 * @param _lang - Language code (ignored)
 * @param _runId - Manifest run identifier (ignored)
 * @returns The unchanged input title
 */
export function appendRunNumberSuffix(
  seoTitle: string,
  _lang: LanguageCode,
  _runId: string
): string {
  // Run numbers must never appear in user-facing article titles.
  // Titles should always be readable article headlines without
  // workflow identifiers. This function is preserved as a no-op
  // for callsite backward compatibility.
  return seoTitle;
}

/**
 * Decide whether to push the raw description through
 * {@link composeContextualDescription}'s enrichment path. Triggers when
 * the raw description is below {@link ENRICHMENT_TRIGGER_LENGTH} (the
 * historical "too short" gate) **or** when the locale is non-Latin and
 * the raw description is pure ASCII (the English-fallback all-ASCII
 * description failure mode reported by Gate 4b in
 * `executive-brief-seo-extraction.test.js`).
 *
 * The second branch is the key fix for ar/he descriptions that fell
 * through from the English brief without any localized labels — even
 * though the raw English summary cleared the 100-char trigger, leaving
 * it untouched produced a pure-ASCII snippet that the SEO regression
 * suite (correctly) rejects as a resolver leak.
 *
 * @param rawDescription - Composed description before enrichment
 * @param lang - Publishing locale
 * @returns True when enrichment must run
 */
export function shouldEnrichDescription(rawDescription: string, lang: LanguageCode): boolean {
  if (rawDescription.length < ENRICHMENT_TRIGGER_LENGTH) return true;
  if (lang === 'en') return false;
  if (classifyScript(lang) === 'latin') return false;
  return ASCII_ONLY_RE.test(rawDescription);
}

/**
 * Pick the SEO `<title>` from the candidate ladder. Skips the
 * summary-derived candidate for non-Latin locales when its content is
 * pure ASCII so we never leak an English summary-derived title (e.g.
 * `*Q1 2026 is the master-synthe`) into a CJK / RTL page (Gate 4a in
 * `executive-brief-seo-extraction.test.js`).
 *
 * @param lang - Publishing locale
 * @param candidates - Title candidate inputs (in priority order)
 * @param candidates.explicitTitle - Manifest operator override title
 * @param candidates.resolvedTitleCandidate - H1/document-derived title
 * @param candidates.summaryDerivedTitle - Summary-first-sentence title
 * @param candidates.contextualFallback - Final fallback title
 * @returns Picked title (always non-empty when the contextual fallback fires)
 */
export function pickResolvedTitle(
  lang: LanguageCode,
  candidates: {
    readonly explicitTitle: string;
    readonly resolvedTitleCandidate: string;
    readonly summaryDerivedTitle: string;
    readonly contextualFallback: string;
  }
): string {
  const family = classifyScript(lang);
  const summaryTitleAllowed =
    candidates.summaryDerivedTitle &&
    isUsableResolvedTitle(candidates.summaryDerivedTitle, { allowFullSentence: true }) &&
    !(family !== 'latin' && !contentMatchesLocaleScript(candidates.summaryDerivedTitle, lang));
  return pickFirstNonEmpty([
    candidates.explicitTitle,
    candidates.resolvedTitleCandidate,
    summaryTitleAllowed ? candidates.summaryDerivedTitle : '',
    truncateTitle(candidates.contextualFallback),
    candidates.contextualFallback,
  ]);
}

/**
 * Decide whether `clippedTitle` is usable as the resolved title candidate.
 * Extracted from `resolveOneLanguage` to keep cognitive complexity under
 * the SonarJS threshold (15).
 *
 * @param args - Title candidate inputs
 * @param args.clippedTitle - The truncated editorial/manifest title to evaluate
 * @param args.headlineWasContaminated - True when the editorial headline was rejected by sanitize
 * @param args.nonLatinFamily - True for CJK/RTL locales requiring locale-script glyphs
 * @param args.allowShortResolvedTitle - True when the source is a localized brief
 * @param args.lang - Target language code
 * @returns The clipped title when usable, '' otherwise
 */
export function pickResolvedTitleCandidate(args: {
  clippedTitle: string;
  headlineWasContaminated: boolean;
  nonLatinFamily: boolean;
  allowShortResolvedTitle: boolean;
  lang: LanguageCode;
}): string {
  const { clippedTitle, headlineWasContaminated, nonLatinFamily, allowShortResolvedTitle, lang } =
    args;
  if (headlineWasContaminated || !clippedTitle) return '';
  if (hasLeakySeoToken(clippedTitle)) return '';
  if (nonLatinFamily && !contentMatchesLocaleScript(clippedTitle, lang)) return '';
  if (!allowShortResolvedTitle && !isUsableResolvedTitle(clippedTitle)) return '';
  return clippedTitle;
}

/**
 * Minimum number of characters that must remain after the localized base
 * label + separator before a distinctive English topic fragment is worth
 * splicing in. Below this the fragment would be a single clipped word and
 * read as noise rather than a differentiator.
 */
const MIN_DISTINCTIVE_FRAGMENT_ROOM = 12;
/** Minimum length of a distinctive English topic fragment (post-clamp). */
const MIN_DISTINCTIVE_FRAGMENT_CHARS = 6;

/**
 * Leading filler / linking words that, when they open a salvaged English
 * fragment, leave it reading as a mid-sentence clause (`is a T-2 …`)
 * rather than a headline. Stripped from the front of a candidate before it
 * is spliced into a localized title.
 */
const LEADING_FILLER_WORDS: ReadonlySet<string> = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'in',
  'is',
  'its',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'which',
  'with',
]);

/**
 * Extract the leading locale-script clause of a localized template title.
 *
 * Localized template titles are shaped `"<localized label>: <qualifier>"`
 * where the qualifier is either an English topic tail (e.g.
 * `"Main Committees"`) or an ISO date (`"2026-04-13"`). The leading clause
 * before the first ASCII colon is the pure locale-script label we reuse as
 * the prefix for a content-differentiated title.
 *
 * @param templateTitle - Localized template title
 * @returns The leading clause, trimmed, or '' when none can be isolated
 */
function extractLocaleBaseLabel(templateTitle: string): string {
  const colonIdx = templateTitle.indexOf(':');
  const base = (colonIdx >= 0 ? templateTitle.slice(0, colonIdx) : templateTitle).trim();
  return base;
}

/**
 * Drop leading filler / linking words from a salvaged fragment so it opens
 * on a content word (`is a T-2 …` → `T-2 …`).
 *
 * @param words - Tokenized fragment words
 * @returns Words with leading filler removed (at least one word retained)
 */
function dropLeadingFiller(words: readonly string[]): string[] {
  let start = 0;
  while (start < words.length - 1 && LEADING_FILLER_WORDS.has((words[start] ?? '').toLowerCase())) {
    start += 1;
  }
  return words.slice(start);
}

/**
 * Build a short, distinctive, reader-facing English topic fragment from a
 * raw English editorial candidate (headline / summary / extended summary).
 *
 * The fragment is stripped of parentheticals and leaky workflow tokens,
 * reduced to its first sentence, opened on a content word, word-clamped to
 * `room` glyphs, and stripped of trailing punctuation so the spliced title
 * never reads as a full sentence (`sentence-fragment` rejection) or a
 * truncation (`ellipsis-cut`).
 *
 * @param rawEnglish - Raw English editorial text
 * @param room - Glyph budget available after the localized prefix
 * @returns A distinctive fragment, or '' when none can be salvaged
 */
function buildDistinctiveFragment(rawEnglish: string, room: number): string {
  if (!rawEnglish) return '';
  // Drop parentheticals (`(T-0 = 15 April …)`, `(second motions-track …)`)
  // before salvage so they neither leak run tokens nor open the fragment
  // on an unbalanced bracket.
  const deparenthesized = rawEnglish.replace(/\([^)]*\)/gu, ' ').replace(/\s{2,}/gu, ' ');
  const sanitized = sanitizeTitleCandidate(deriveHeadlineFromSummary(deparenthesized));
  if (!sanitized) return '';
  const words = dropLeadingFiller(sanitized.split(/\s+/u).filter(Boolean));
  let fragment = '';
  for (const word of words) {
    const next = fragment ? `${fragment} ${word}` : word;
    if ([...next].length > room) break;
    fragment = next;
  }
  // Drop trailing punctuation so the splice never trips the
  // sentence-fragment / ellipsis-cut rejection predicates.
  fragment = fragment.replace(/[\s.,;:!?\u2026\u2013\u2014-]+$/u, '').trim();
  if ([...fragment].length < MIN_DISTINCTIVE_FRAGMENT_CHARS) return '';
  return fragment;
}

/**
 * Compose a content-differentiated `<title>` for a non-Latin locale that
 * would otherwise fall back to the date-suffixed template title.
 *
 * Two same-date / same-articleType runs whose English brief differs but
 * whose localized template title is identical (e.g. two `2026-04-13`
 * `motions` re-runs) collide on the SERP. Run-number / "Edition N"
 * disambiguators are forbidden in titles, so the differentiator must be
 * content-based: we reuse the localized template's leading locale-script
 * clause as the prefix and splice in a short distinctive English topic
 * fragment derived from the run's own English headline / summary. The
 * resulting mixed-script title still carries a locale glyph (Gate 4a) and
 * mirrors the existing `"<localized label>: Main Committees"` precedent.
 *
 * Returns '' (caller keeps the date-suffixed fallback) whenever the locale
 * is Latin, the base label lacks a locale glyph, the per-script title
 * budget leaves no room for a meaningful fragment, or no candidate yields a
 * clean, leak-free, budget-fitting fragment.
 *
 * @param args - Composition inputs
 * @param args.lang - Publishing locale
 * @param args.templateTitle - Localized template title (prefix source)
 * @param args.englishCandidates - Raw English editorial texts (priority order)
 * @returns A distinctive mixed-script title, or '' when none can be built
 */
export function composeNonLatinDistinctiveTitle(args: {
  readonly lang: LanguageCode;
  readonly templateTitle: string;
  readonly englishCandidates: readonly string[];
}): string {
  const { lang, templateTitle, englishCandidates } = args;
  if (classifyScript(lang) === 'latin') return '';
  const baseLabel = extractLocaleBaseLabel(templateTitle);
  if (!baseLabel || !contentMatchesLocaleScript(baseLabel, lang)) return '';
  const budget = budgetFor(lang, 'title');
  const prefix = `${baseLabel}: `;
  const room = budget - [...prefix].length;
  if (room < MIN_DISTINCTIVE_FRAGMENT_ROOM) return '';
  for (const candidate of englishCandidates) {
    const fragment = buildDistinctiveFragment(candidate, room);
    if (!fragment) continue;
    const composed = `${prefix}${fragment}`;
    if ([...composed].length > budget) continue;
    if (hasLeakySeoToken(composed)) continue;
    if (findTitleRejectionReason(composed)) continue;
    if (!contentMatchesLocaleScript(composed, lang)) continue;
    return composed;
  }
  return '';
}
