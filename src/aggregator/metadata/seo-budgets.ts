// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/SeoBudgets
 * @description Per-script SEO byte budgets and a script-aware clamp.
 *
 * Background. Google Search Central and Bing Webmaster Guidelines both
 * document SERP snippet limits in **pixels**, not characters. Latin
 * glyphs render at roughly half the pixel width of CJK glyphs, while
 * Arabic/Hebrew letterforms sit between the two. A single `length`
 * budget for `<title>` / `<meta description>` will always be wrong for
 * at least one of the 14 publishing languages — typically over-truncating
 * Latin copy and over-running CJK by a factor of two.
 *
 * This module provides:
 *
 *  - {@link classifyScript} — three-way `latin | cjk | rtl` family
 *    classifier driven by the locale code (no glyph inspection — the
 *    BCP-47 language tag is authoritative because every publishing
 *    pipeline emits one full output per language).
 *  - {@link SEO_BUDGETS} — per-surface × per-script byte caps derived
 *    from the documented platform envelopes (Google ≤580 px title /
 *    ≤155 char description; Bing slightly more generous; Facebook ≤95
 *    chars on `og:title`; Twitter ≤70 / ≤200; LinkedIn shares OG).
 *  - {@link budgetFor} — typed accessor returning the byte cap for a
 *    `(lang, surface)` pair, with a uniform fallback to the strictest
 *    Latin budget when the locale is unknown.
 *  - {@link clampForBudget} — script-aware truncator that prefers
 *    natural clause boundaries (CJK full-width punctuation, RTL
 *    sentence punctuation, Latin clause separators) before falling
 *    back to whitespace breaks. Returns the input verbatim when it
 *    already fits.
 *
 * Pure, leaf module. No I/O, no dependencies on other aggregator
 * modules beyond the existing `text-utils.ts` clause-boundary
 * vocabulary.
 */

import type { LanguageCode } from '../../types/index.js';
import { HEADLINE_CLAUSE_BOUNDARIES } from './text-utils.js';

// ────────────────────────────────────────────────────────────────────────
// Script-family classifier
// ────────────────────────────────────────────────────────────────────────

/**
 * Three-way script family used as the column key in {@link SEO_BUDGETS}.
 * `cjk` covers Chinese / Japanese / Korean (~2× Latin pixel width per
 * glyph); `rtl` covers Arabic / Hebrew (bidi + ligature handling).
 */
export type ScriptFamily = 'latin' | 'cjk' | 'rtl';

/**
 * Iteration helper — all three script families in a deterministic
 * order (latin → cjk → rtl). Exported so test matrices and downstream
 * tooling can walk every column of {@link SEO_BUDGETS} without
 * duplicating the literal list.
 */
export const ALL_SCRIPT_FAMILIES: readonly ScriptFamily[] = ['latin', 'cjk', 'rtl'] as const;

/**
 * Classify a locale code into a script family. Used to look up the
 * correct byte cap in {@link SEO_BUDGETS}.
 *
 * @param lang - BCP-47 language tag (one of the 14 publishing locales)
 * @returns Script family for SEO budget lookup
 */
export function classifyScript(lang: string): ScriptFamily {
  if (lang === 'ar' || lang === 'he') return 'rtl';
  if (lang === 'ja' || lang === 'ko' || lang === 'zh') return 'cjk';
  return 'latin';
}

// ────────────────────────────────────────────────────────────────────────
// Surface catalogue + per-script byte budgets
// ────────────────────────────────────────────────────────────────────────

/**
 * Public SEO surfaces this module budgets for. Each one has documented
 * truncation behaviour by at least one major search engine or social
 * platform.
 *
 * - `title` — HTML `<title>` (Google ≤580 px ≈ 60 Latin / 30 CJK / 55 RTL)
 * - `metaDescription` — `<meta name="description">` (Google ≤~155 char)
 * - `ogTitle` — Facebook / LinkedIn `og:title` (~95 Latin)
 * - `ogDescription` — Facebook / LinkedIn `og:description` (~200 Latin)
 * - `twitterTitle` — Twitter card title (≤70 Latin)
 * - `twitterDescription` — Twitter card description (≤200 Latin)
 * - `imageAlt` — `og:image:alt` / social card alt text (≤125 Latin)
 * - `jsonLdHeadline` — Schema.org `NewsArticle.headline` (Google ≤110)
 */
export type SeoSurface =
  | 'title'
  | 'metaDescription'
  | 'ogTitle'
  | 'ogDescription'
  | 'twitterTitle'
  | 'twitterDescription'
  | 'imageAlt'
  | 'jsonLdHeadline';

/**
 * Per-surface × per-script byte cap table. Numbers reflect the
 * narrower of Google / Bing / Facebook / Twitter documented envelopes,
 * with a ~5 % safety margin so a snippet on the edge of the budget
 * isn't truncated mid-glyph by the rendering platform.
 *
 * For `jsonLdHeadline` the Schema.org `NewsArticle.headline` cap is
 * script-independent (Google validates the literal character count at
 * 110) — same value across the row.
 */
export const SEO_BUDGETS: Readonly<Record<SeoSurface, Readonly<Record<ScriptFamily, number>>>> = {
  title: { latin: 60, cjk: 30, rtl: 55 },
  metaDescription: { latin: 155, cjk: 78, rtl: 150 },
  ogTitle: { latin: 95, cjk: 47, rtl: 90 },
  ogDescription: { latin: 200, cjk: 100, rtl: 195 },
  twitterTitle: { latin: 70, cjk: 35, rtl: 70 },
  twitterDescription: { latin: 200, cjk: 100, rtl: 195 },
  imageAlt: { latin: 125, cjk: 60, rtl: 120 },
  jsonLdHeadline: { latin: 110, cjk: 110, rtl: 110 },
};

/**
 * Resolve the byte cap for one `(lang, surface)` pair.
 *
 * @param lang - Publishing locale
 * @param surface - SEO surface (see {@link SeoSurface})
 * @returns Byte cap (positive integer)
 */
export function budgetFor(lang: LanguageCode | string, surface: SeoSurface): number {
  const family = classifyScript(lang);
  return SEO_BUDGETS[surface][family];
}

// ────────────────────────────────────────────────────────────────────────
// Script-aware truncator
// ────────────────────────────────────────────────────────────────────────

/**
 * CJK full-width clause boundaries — the breakpoints CJK readers
 * expect a snippet to end at. Listed in preferred-break order: a
 * sentence-final mark beats a semicolon which beats a middle-dot.
 *
 * **Note**: `、` (U+3001, enumeration comma) is deliberately excluded.
 * Cutting at an enumeration comma leaves a grammatically broken list
 * fragment (e.g. "民主问责、") which downstream `ensureTerminator`
 * closes with `。`, producing nonsensical "民主问责、。". The enumeration
 * comma is semantically equivalent to Latin `,` — a list separator,
 * not a sentence boundary.
 */
const CJK_CLAUSE_BOUNDARIES: readonly string[] = ['。', '！', '？', '；', '：', '——', '—', '・'];

/**
 * RTL sentence punctuation. Arabic uses U+061F (؟) for question mark
 * and U+060C (،) for comma; full stop is the ASCII `.` (Hebrew uses
 * `.` and `,` directly). Listed in preferred-break order.
 */
const RTL_CLAUSE_BOUNDARIES: readonly string[] = ['. ', '؟ ', '! ', '، ', '؛ ', ' — ', ' – '];

/**
 * Soft-minimum fraction of the budget at which a clause-boundary break
 * is acceptable. Below this fraction we fall through to whitespace
 * truncation so we never ship a near-empty snippet just because the
 * input started with a short clause.
 */
const SOFT_MIN_RATIO = 0.55;

/**
 * Trim trailing punctuation that would otherwise leave a snippet
 * ending on a dangling separator or ellipsis. Mirrors the spirit of
 * `text-utils.ts::TRAILING_PUNCT` but keeps full-width CJK marks
 * intact when they sit at a natural sentence boundary.
 *
 * Includes `、` (U+3001, CJK enumeration comma) which should never
 * appear at the end of a truncated snippet — it signals a list
 * continuation that never arrives.
 *
 * @param s - Input string to trim
 * @returns Input with trailing separator-class characters removed
 */
function trimTrailingSeparators(s: string): string {
  return s.replace(/[\s,;:—\-–·•…、]+$/u, '');
}

/**
 * Pick the highest-priority clause boundary inside a candidate window.
 * Iterates the boundary vocabulary in declared (preference) order and
 * returns the first index that sits past the soft minimum.
 *
 * @param window - Candidate cut window (`text.slice(0, budget)`)
 * @param boundaries - Boundary vocabulary, in preference order
 * @param softMin - Soft-minimum cut position (chars)
 * @returns Cut index, or -1 when no boundary qualifies
 */
function findClauseCut(window: string, boundaries: readonly string[], softMin: number): number {
  for (const boundary of boundaries) {
    const idx = window.lastIndexOf(boundary);
    if (idx >= softMin) {
      return idx + boundary.length;
    }
  }
  return -1;
}

/**
 * Truncate `text` to fit `(lang, surface)` SEO byte budget. Prefers a
 * natural clause boundary inside the script's punctuation vocabulary
 * (CJK / RTL / Latin) before falling back to a whitespace break.
 *
 * Always returns `text` verbatim when it already fits (no ellipsis
 * appended). When truncation happens an ellipsis (`…`) is appended for
 * Latin / RTL; for CJK the full-width ellipsis (`…`) reads as a
 * partial-thought marker and is also appended — Schema.org and Google
 * accept either glyph in `headline` / `description`.
 *
 * @param text - Source text (already plain-text — no Markdown / HTML)
 * @param lang - Publishing locale
 * @param surface - Target SEO surface
 * @returns Clamped text ≤ `budgetFor(lang, surface)` characters
 */
export function clampForBudget(
  text: string,
  lang: LanguageCode | string,
  surface: SeoSurface
): string {
  const trimmed = text.trim();
  const budget = budgetFor(lang, surface);
  if (trimmed.length <= budget) return trimmed;

  const family = classifyScript(lang);
  const softMin = Math.floor(budget * SOFT_MIN_RATIO);
  // Reserve one char for the ellipsis we may append.
  const window = trimmed.slice(0, budget - 1);

  // Korean uses Western-style punctuation (. ! ? ,) and inter-word
  // spaces despite being classified as CJK for pixel-budget purposes.
  // Use Latin clause boundaries and allow the whitespace fallback so we
  // don't hard-cut mid-token (e.g. splitting "2026-04-26" → "2026-0").
  const useLatinBoundaries = lang === 'ko';
  const boundaries = useLatinBoundaries
    ? HEADLINE_CLAUSE_BOUNDARIES
    : family === 'cjk'
      ? CJK_CLAUSE_BOUNDARIES
      : family === 'rtl'
        ? RTL_CLAUSE_BOUNDARIES
        : HEADLINE_CLAUSE_BOUNDARIES;

  const clauseCut = findClauseCut(window, boundaries, softMin);
  if (clauseCut > 0) {
    const cleaned = trimTrailingSeparators(trimmed.slice(0, clauseCut));
    if (cleaned.length >= softMin) return cleaned;
  }

  // Whitespace-aware fallback. Runs for every script: an ASCII space
  // past the soft minimum is a safe break that drops a partial trailing
  // segment whole rather than slicing it mid-token. Chinese and Japanese
  // prose has no inter-word spaces, so `lastIndexOf(' ')` returns -1 and
  // this is a no-op for them — but composed SEO snippets join clauses
  // (body, dateline, reader label) with ASCII spaces, so honouring that
  // boundary prevents hard-cutting the reader label mid-word. Korean
  // uses inter-word spaces natively and benefits the same way.
  const lastSpace = window.lastIndexOf(' ');
  if (lastSpace >= softMin) {
    const safe = trimTrailingSeparators(window.slice(0, lastSpace));
    return `${safe}…`;
  }

  const hardCut = trimTrailingSeparators(window);
  return `${hardCut}…`;
}

/**
 * Optional inputs to {@link clampTitleForSurface}.
 *
 * `siteTitle` is the brand suffix (e.g. "EU Parliament Monitor") and
 * `separator` is the localized glue (e.g. `" | "` / `" ・ "` / `" ׀ "`).
 * When both are provided the function tries to keep the brand suffix
 * inside the budget; when the article title alone already fills the
 * budget the suffix is *dropped* (better SERP outcome than a truncated
 * headline followed by a clipped brand).
 *
 * `shortSiteTitle` is the optional fallback used when the full brand
 * suffix can't fit but a shorter variant would (e.g. `"EPM"` for CJK).
 */
export interface TitleSurfaceOptions {
  readonly siteTitle?: string;
  readonly shortSiteTitle?: string;
  readonly separator?: string;
}

/**
 * Compose `{title}{separator}{siteTitle}` while honouring the
 * `(lang, surface)` budget. Drops the brand suffix entirely when the
 * article title alone is already at or past the budget. Prefers the
 * short site title when supplied and the full suffix doesn't fit.
 *
 * @param title - Article title (plain text)
 * @param lang - Publishing locale
 * @param surface - Target SEO surface (`title` / `ogTitle` / `twitterTitle`)
 * @param opts - Optional brand suffix wiring
 * @returns Composed title ≤ budget
 */
export function clampTitleForSurface(
  title: string,
  lang: LanguageCode | string,
  surface: SeoSurface,
  opts: TitleSurfaceOptions = {}
): string {
  const budget = budgetFor(lang, surface);
  const cleanTitle = title.trim();
  const sep = opts.separator ?? '';
  const full = opts.siteTitle ?? '';
  const short = opts.shortSiteTitle ?? '';

  // No brand suffix wiring — just clamp the title in isolation.
  if (!full) return clampForBudget(cleanTitle, lang, surface);

  const fullSuffix = `${sep}${full}`;
  const shortSuffix = short ? `${sep}${short}` : '';

  // Best case: title + full suffix fits.
  if (cleanTitle.length + fullSuffix.length <= budget) {
    return `${cleanTitle}${fullSuffix}`;
  }

  // Second best: title + short suffix fits.
  if (shortSuffix && cleanTitle.length + shortSuffix.length <= budget) {
    return `${cleanTitle}${shortSuffix}`;
  }

  // Third: keep the title (clamped), drop the brand. Better SERP than
  // a truncated headline followed by a clipped brand suffix.
  return clampForBudget(cleanTitle, lang, surface);
}
