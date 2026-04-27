// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Manifest
 * @description Public re-exports for the manifest bounded context.
 */

export type {
  Manifest,
  ManifestFiles,
  ManifestHistoryEntry,
  ManifestMetadataOverride,
  MetadataManifest,
} from './types.js';
export {
  resolveArticleType,
  resolveDate,
  resolveRunId,
  latestGateResult,
  flattenManifestFiles,
  UNKNOWN_ARTICLE_TYPE,
} from './resolver.js';
export { readManifest, parseManifest, type ReadManifestResult } from './reader.js';
