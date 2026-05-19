// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Run/Manifest
 * @description Thin re-exports of `aggregator/manifest/index.js` helpers used
 * by the analysis aggregator. Preserved here so external callers
 * (`backport-article-seo`, curator scripts) that consumed these names from
 * `analysis-aggregator.ts` keep resolving through the barrel.
 */

import {
  flattenManifestFiles as _flattenManifestFiles,
  latestGateResult as _latestGateResult,
  resolveArticleType as _resolveArticleType,
  type Manifest,
  type ManifestFiles,
} from '../manifest/index.js';

/**
 * Normalise `manifest.files` into a flat list of `runRelPath` strings.
 *
 * Thin re-export of {@link _flattenManifestFiles} from
 * `aggregator/manifest/index.js`; preserved here so external callers
 * (`backport-article-seo`, curator scripts) keep resolving.
 *
 * @param files - Manifest `files` section (nested or flat)
 * @returns De-duplicated list of run-relative artifact paths
 */
export function flattenManifestFiles(files: ManifestFiles | undefined): string[] {
  return _flattenManifestFiles(files);
}

/**
 * Pick the latest non-PENDING gateResult from `manifest.history[]`, falling
 * back to `PENDING` if none is recorded.
 *
 * Thin re-export of {@link _latestGateResult} from
 * `aggregator/manifest/index.js`.
 *
 * @param manifest - Parsed manifest object
 * @returns The latest non-PENDING gate result, or `"PENDING"` when none found
 */
export function latestGateResult(manifest: Manifest): string {
  return _latestGateResult(manifest);
}

/**
 * Resolve the article-type slug from a manifest, tolerating historic schemas.
 *
 * Thin re-export of {@link _resolveArticleType} from
 * `aggregator/manifest/index.js`. Resolution order: `articleType` →
 * `articleTypeSlug` → `articleTypes[0]` → `runType` → `'unknown'`.
 *
 * @param manifest - Parsed manifest (any of the supported schemas)
 * @returns Article-type slug usable as a filename component
 */
export function resolveArticleTypeFromManifest(manifest: Manifest): string {
  return _resolveArticleType(manifest);
}

/**
 * Extract a `YYYY-MM-DD` date from a path like
 * `analysis/daily/2026-01-15/run`. Falls back to the epoch date when no
 * ISO date is embedded in the path.
 *
 * @param runDirRelPath - Repo-relative path of the run directory
 * @returns ISO date string in `YYYY-MM-DD` form
 */
export function guessDateFromRunDir(runDirRelPath: string): string {
  const match = /(\d{4}-\d{2}-\d{2})/.exec(runDirRelPath);
  return match ? (match[1] ?? '1970-01-01') : '1970-01-01';
}
