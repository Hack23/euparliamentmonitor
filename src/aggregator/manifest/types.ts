// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Manifest/Types
 * @description Canonical manifest schema for analysis runs and the narrower
 * projection consumed by the editorial-metadata resolver. Centralises every
 * historic schema variant (canonical `articleType`, legacy plural
 * `articleTypes[]`, very-legacy `runType`) into one type that downstream
 * modules can read against.
 */

import type { LanguageCode } from '../../types/index.js';

/** `manifest.files` can be nested category → paths or flat path → description. */
export type ManifestFiles = Record<string, readonly string[] | Record<string, string>>;

/** One entry in `manifest.history[]`; only fields we read are typed. */
export interface ManifestHistoryEntry {
  readonly stage?: string;
  readonly completedAt?: string;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly runId?: string;
  readonly gateResult?: string;
  readonly summary?: string;
  readonly filesWritten?: readonly string[];
}

/**
 * Optional editorial-metadata override. `string` is applied to every
 * language; an object allows explicit per-language overrides.
 */
export type ManifestMetadataOverride = string | Partial<Record<LanguageCode, string>>;

/**
 * Raw manifest shape as committed by the analysis pipeline. Matches every
 * schema variant the pipeline has ever emitted; readers consult
 * {@link resolveArticleType} rather than `articleType` directly so legacy
 * runs stay readable.
 */
export interface Manifest {
  /** Canonical singular form (current pipeline). */
  readonly articleType?: string;
  /**
   * Legacy plural form emitted by some pre-aggregator-pipeline workflows.
   * When present, `articleTypes[0]` is treated as the article type.
   */
  readonly articleTypes?: readonly string[];
  /**
   * Very-legacy field on older breaking-run manifests. Used as the last
   * fallback when neither `articleType` nor `articleTypes` is present.
   */
  readonly runType?: string;
  /** Stable run identifier; falls back to the run-dir basename. */
  readonly runId?: string | number;
  /** ISO date (`YYYY-MM-DD`); falls back to the run-dir path. */
  readonly date?: string;
  /** Repo-relative analysis directory hint emitted by some workflows. */
  readonly analysisDir?: string;
  /** Manifest-declared file inventory (nested or flat). */
  readonly files?: ManifestFiles;
  /** Stage-history audit log used to read the latest gate result. */
  readonly history?: readonly ManifestHistoryEntry[];
  /** Optional editorial title override. */
  readonly title?: ManifestMetadataOverride;
  /** Optional editorial description override. */
  readonly description?: ManifestMetadataOverride;
  /** Committee code (e.g. `ENVI`) used by committee-reports templates. */
  readonly committee?: string;
}

/**
 * Narrower manifest projection consumed by {@link resolveArticleMetadata}
 * in `aggregator/article-metadata.ts`. The metadata resolver only needs a
 * subset; keeping this projection separate means string-only callers
 * (backport, legacy curators) don't have to construct a full {@link Manifest}.
 */
export interface MetadataManifest {
  readonly articleType?: string;
  readonly date?: string;
  readonly runId?: string;
  readonly title?: ManifestMetadataOverride;
  readonly description?: ManifestMetadataOverride;
  readonly committee?: string;
}
