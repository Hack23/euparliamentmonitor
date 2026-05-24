// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Manifest/Resolver
 * @description Pure resolution helpers over a parsed {@link Manifest}.
 * Consolidates the article-type precedence ladder (`articleType` →
 * `articleTypeSlug` → `articleTypes[0]` → `runType`), the latest-gate-result
 * lookup, and the `manifest.files` flattener so they live in one bounded
 * context instead of being duplicated across `analysis-aggregator.ts` and
 * `article-generator.ts`.
 */

import type { Manifest, ManifestFiles } from './types.js';

/** Sentinel used when no schema variant supplies a usable article type. */
export const UNKNOWN_ARTICLE_TYPE = 'unknown';

/**
 * Canonical article-type slugs published by the EU Parliament Monitor
 * aggregator. Used by {@link stripRunSuffix} to reject any normalisation
 * that would yield a non-canonical leading token.
 */
const CANONICAL_ARTICLE_TYPES: ReadonlySet<string> = new Set([
  'breaking',
  'committee-reports',
  'motions',
  'propositions',
  'week-ahead',
  'week-in-review',
  'month-ahead',
  'month-in-review',
  'quarter-in-review',
  'year-ahead',
  'year-in-review',
  'term-outlook',
  'election-cycle',
]);

/**
 * Pattern matching trailing `-run<N>` taxonomy noise that historic
 * Stage-B writers occasionally encode into `articleType` (e.g.
 * `committee-reports-run47`, `motions-run41`, `breaking-run193`). Also
 * tolerates the legacy double-prefixed `motions-runmotions-run-1777010709`
 * pattern observed in 2025 manifests where the writer concatenated the
 * articleType and runId. The leading `-run` makes the match greedy enough
 * to catch both single-suffix and double-prefixed forms.
 *
 * Exported for unit tests.
 */
export const RUN_SUFFIX_PATTERN: RegExp = /-run[a-zA-Z0-9-]*\d+$/u;

/**
 * Strip a trailing `-run<N>` taxonomy-noise suffix from an article-type
 * slug, but only when doing so yields a {@link CANONICAL_ARTICLE_TYPES}
 * token. This is conservative: a non-canonical leading token (e.g.
 * `custom-type-run5`) is returned untouched so we never silently
 * collapse a genuinely new article type into something it isn't.
 *
 * @param slug - Raw article-type slug from a manifest field
 * @returns Canonical slug when the suffix was successfully stripped,
 *   otherwise the original input
 */
export function stripRunSuffix(slug: string): string {
  if (!slug || !RUN_SUFFIX_PATTERN.test(slug)) {
    return slug;
  }
  const stripped = slug.replace(RUN_SUFFIX_PATTERN, '');
  if (CANONICAL_ARTICLE_TYPES.has(stripped)) {
    return stripped;
  }
  return slug;
}

/**
 * Resolve the article-type slug from a manifest, tolerating historic schemas.
 *
 * Resolution order (highest precedence first):
 *   1. `articleType` — canonical singular field
 *   2. `articleTypeSlug` — gh-aw workflow slug field
 *   3. `articleTypes[0]` — pre-aggregator-pipeline plural array
 *   4. `runType` — historic field on older breaking-run manifests
 *
 * Each candidate is passed through {@link stripRunSuffix} so trailing
 * `-run<N>` taxonomy noise never leaks into JSON-LD `articleSection`,
 * the filesystem slug, or the SEO dump's article-type histogram. Falls
 * back to `'unknown'` when none of the above is a non-empty string.
 *
 * @param manifest - Parsed manifest (any of the supported schemas)
 * @returns Article-type slug usable as a filename component
 */
export function resolveArticleType(manifest: Manifest): string {
  if (typeof manifest.articleType === 'string' && manifest.articleType) {
    return stripRunSuffix(manifest.articleType);
  }
  if (typeof manifest.articleTypeSlug === 'string' && manifest.articleTypeSlug) {
    return stripRunSuffix(manifest.articleTypeSlug);
  }
  const first = manifest.articleTypes?.[0];
  if (typeof first === 'string' && first) {
    return stripRunSuffix(first);
  }
  if (typeof manifest.runType === 'string' && manifest.runType) {
    return stripRunSuffix(manifest.runType);
  }
  return UNKNOWN_ARTICLE_TYPE;
}

/**
 * Resolve the run-id from a manifest, falling back to a caller-provided
 * default (typically the run-directory basename) when the manifest carries
 * neither a string nor a numeric `runId`.
 *
 * @param manifest - Parsed manifest
 * @param fallback - Default returned when `runId` is missing or non-string
 * @returns Best-effort run identifier
 */
export function resolveRunId(manifest: Manifest, fallback: string): string {
  if (typeof manifest.runId === 'string' && manifest.runId) {
    return manifest.runId;
  }
  if (typeof manifest.runId === 'number') {
    return String(manifest.runId);
  }
  return fallback;
}

/**
 * Resolve the ISO date for a manifest, accepting only a strictly-formed
 * `YYYY-MM-DD` value. Returns `undefined` when the manifest has no usable
 * date so callers can fall through to a path-based heuristic.
 *
 * @param manifest - Parsed manifest
 * @returns Strict ISO date or `undefined`
 */
export function resolveDate(manifest: Manifest): string | undefined {
  const candidate = typeof manifest.date === 'string' ? manifest.date : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : undefined;
}

/**
 * Pick the latest non-`PENDING` `gateResult` from `manifest.history[]`,
 * falling back to `'PENDING'` when no closed gate is recorded.
 *
 * @param manifest - Parsed manifest
 * @returns Latest non-PENDING gate result, or `'PENDING'`
 */
export function latestGateResult(manifest: Manifest): string {
  const history = manifest.history ?? [];
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    const gr = entry?.gateResult;
    if (gr && gr !== 'PENDING') return gr;
  }
  return 'PENDING';
}

/**
 * Extract every string entry from a single `files` value (which may be an
 * array of strings or a `path → description` object).
 *
 * @param value - One value from `Object.values(files)`
 * @returns Strings contained within, or `[]` when the shape is unknown
 */
function extractFileEntries(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((e): e is string => typeof e === 'string');
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>);
  }
  return [];
}

/**
 * Normalise `manifest.files` into a flat list of `runRelPath` strings.
 *
 * De-duplicates while preserving first-seen order so callers downstream
 * (the aggregator's `availableSet`, `materialiseManifestFiles`, etc.)
 * never observe the same path twice when a manifest section accidentally
 * lists it under two top-level keys.
 *
 * @param files - Manifest `files` section (nested or flat)
 * @returns De-duplicated, first-seen-ordered list of run-relative artifact paths
 */
export function flattenManifestFiles(files: ManifestFiles | undefined): string[] {
  if (!files) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of Object.values(files)) {
    for (const entry of extractFileEntries(value)) {
      if (seen.has(entry)) continue;
      seen.add(entry);
      out.push(entry);
    }
  }
  return out;
}
