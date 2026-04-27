// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Slug
 * @description Pure naming functions used to build article slugs and
 * filename suffixes. Extracted into a dedicated module so the
 * `news/<date>-<type>[-<suffix>]-<lang>.html` filename convention has one
 * authoritative implementation that batch mode, single-run mode, and the
 * back-compat shim in `article-generator.ts` all defer to.
 *
 * Every function here is referentially transparent — no I/O, no global
 * state, deterministic for the same inputs.
 */

/**
 * Maximum length of a sanitised run-suffix. Caps filename length so the
 * full `<date>-<articleType>-<suffix>-<lang>.html` stays comfortably below
 * common filesystem path-length limits (255 on most filesystems, 260 on
 * Windows MAX_PATH).
 */
export const RUN_SUFFIX_MAX_LENGTH = 32;

/**
 * Default suffix returned by {@link sanitizeRunSuffix} when the input
 * contains no characters that survive the sanitiser. Chosen so a degenerate
 * input ("---", "@@@", whitespace) still produces a usable, non-empty
 * filename suffix instead of `<date>-<type>--<lang>.html`.
 */
export const DEFAULT_RUN_SUFFIX = 'run';

/**
 * Build the article slug `YYYY-MM-DD-<article-type>[-<runSuffix>]`. The
 * slug is the file-stem shared by every language variant
 * (`<slug>.en.md`, `<slug>-<lang>.html`, …).
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @param articleType - Article-type slug (e.g. `breaking`)
 * @param runSuffix - Optional collision-suffix (e.g. `run191`) appended
 *        when multiple runs share the same (date, articleType) pair
 * @returns Combined slug used as the file-stem for every language variant
 */
export function buildArticleSlug(date: string, articleType: string, runSuffix?: string): string {
  const base = `${date}-${articleType}`;
  return runSuffix ? `${base}-${runSuffix}` : base;
}

/**
 * Turn an arbitrary run-id string into a short, filename-safe suffix.
 * Keeps ASCII word/dash characters only, trims leading/trailing dashes,
 * and caps the length at {@link RUN_SUFFIX_MAX_LENGTH} to avoid filesystem
 * path-length surprises. Falls back to {@link DEFAULT_RUN_SUFFIX} when no
 * characters survive the sanitiser.
 *
 * @param runId - Raw run identifier from the manifest (or directory name)
 * @returns Sanitised suffix usable in a filename
 */
export function sanitizeRunSuffix(runId: string): string {
  const cleaned = runId.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned.slice(0, RUN_SUFFIX_MAX_LENGTH) || DEFAULT_RUN_SUFFIX;
}
