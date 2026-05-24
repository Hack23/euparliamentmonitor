// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/KeywordFilters
 * @description Cross-site keyword catalogue and noise-token filter used
 * by {@link buildSeoKeywords} in `resolve-helpers.ts`.
 *
 * Two responsibilities:
 *
 *   1. **Always-on cross-site keywords** ({@link CROSS_SITE_KEYWORDS})
 *      are prepended to every article's `<meta name="keywords">` list
 *      regardless of language, so search-engine discovery of the
 *      Hack23 civic-tech portfolio (EU Parliament Monitor +
 *      Riksdagsmonitor + CIA) is consistent across all 14 localized
 *      surfaces. The user explicitly requested
 *      `riksdagsmonitor, political intelligence, riksdag, regeringen`
 *      (the sister Swedish-Parliament project) plus EP analogues.
 *
 *   2. **Noise-token rejection** ({@link isNoiseKeywordToken}) drops
 *      the UUID-fragment tokens (`77fc920c`, `3a76`, `9db5`, …) and
 *      synthetic run-id slugs (`propositions-run261-1779431162`) that
 *      the previous keyword extractor leaked into `<head>` when a
 *      brief mentioned its own run id editorially (e.g.
 *      `Analysis run 77fc920c-3a76-4813-9db5-43a7e9acc25e returned
 *      0 classified actors`).
 *
 * Pure leaf module — no imports.
 */

/**
 * Cross-site SEO keywords prepended to every article in every
 * language. Order is meaningful: stronger civic-tech-portfolio terms
 * first so they appear ahead of the per-article-type keywords when
 * the 16-entry budget is exceeded.
 */
export const CROSS_SITE_KEYWORDS: readonly string[] = [
  'EU Parliament Monitor',
  'European Parliament',
  'European Commission',
  'political intelligence',
  'Riksdagsmonitor',
  'Riksdag',
  'Regeringen',
];

/**
 * Lower-case allowlist of common English words that the noise filter
 * must always keep, even when their shape would otherwise match the
 * "looks like a hex token" heuristic (e.g. `face`, `dead`, `beef`).
 * Kept intentionally tiny to avoid lexicon drift.
 */
const HEX_ALPHABETIC_ALLOWLIST = new Set<string>([
  'face',
  'fade',
  'dead',
  'beef',
  'cafe',
  'feed',
  'deed',
  'fed',
  'add',
  'dad',
  'bad',
]);

/**
 * Decide whether a single keyword token should be discarded as noise.
 *
 * The current rules reject tokens that:
 *
 *   - Look like a UUID hex chunk: ≥4 chars and consist solely of the
 *     `[0-9a-f]` alphabet **and** contain at least one digit (so
 *     real English words like `dead` / `face` survive). Tokens of
 *     length ≥8 are always rejected (a real English word of that
 *     length composed exclusively of hex letters is vanishingly rare;
 *     the allowlist guards the short cases).
 *   - Are mostly digits (≥80 % digit characters) — runtime epoch
 *     suffixes such as `1779431162` and committee-codeoid mashes like
 *     `2024k1234`.
 *   - Start with `run` and end with all-digits (`run261`, `run17`),
 *     the per-run slug suffix the aggregator stamps onto run ids.
 *   - Match the full opaque-runId shape `<type>-run<digits>-<digits>`
 *     after a strip / normalization round-trip.
 *
 * Returns `false` for normal vocabulary so the keyword list stays
 * useful — every reject path is intentionally narrow.
 *
 * @param token - Single token candidate
 * @returns `true` when the token should be dropped from keywords
 */
export function isNoiseKeywordToken(token: string): boolean {
  if (!token) return true;
  const trimmed = token.trim();
  if (trimmed.length < 4) return true;
  const lower = trimmed.toLowerCase();

  // Reject pure-digit and digit-dominated tokens.
  if (/^\d+$/u.test(lower)) return true;
  const digitCount = (lower.match(/\d/gu) ?? []).length;
  if (digitCount > 0 && digitCount / lower.length >= 0.8) return true;

  // Reject `run<digits>` slugs and `…-run<digits>-<digits>` chains.
  if (/^run\d+$/u.test(lower)) return true;
  if (/^[a-z][a-z-]*-run\d+(?:-\d+)*$/u.test(lower)) return true;

  // Reject hex-shaped tokens unless they are common English words.
  const isHex = /^[0-9a-f]+$/u.test(lower);
  if (isHex) {
    if (lower.length >= 8) return true;
    if (digitCount > 0) return true;
    if (HEX_ALPHABETIC_ALLOWLIST.has(lower)) return false;
    // Short all-letter hex words: keep (avoids overfitting).
    return false;
  }

  return false;
}
