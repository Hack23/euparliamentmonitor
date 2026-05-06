// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Artifacts/Types
 * @description Strict type definitions for the artifacts bounded context.
 * Defines the shape of artifact content, section mappings, and sanitization
 * options used throughout the aggregator pipeline.
 */

import type { CleanArtifactResult } from '../clean-artifact.js';

/**
 * Represents raw artifact content read from an analysis run directory.
 * Carries the original Markdown body along with its provenance metadata.
 */
export interface ArtifactContent {
  /** Run-relative path of the artifact (e.g. `intelligence/synthesis-summary.md`). */
  readonly path: string;
  /** Raw Markdown body as read from disk. */
  readonly body: string;
  /** Byte length of the raw content (before cleaning). */
  readonly byteLength: number;
}

/**
 * A {@link CleanArtifactResult} extended with provenance (the run-relative
 * path of the source artifact). Use this type when you need to track which
 * artifact produced a given cleaned output — e.g. for telemetry or
 * source-mapping in `article-meta.json`.
 *
 * `CleanArtifactResult` is the raw return of `cleanArtifact()`;
 * `CleanedArtifactWithPath` adds the origin path for pipeline bookkeeping.
 */
export interface CleanedArtifactWithPath extends CleanArtifactResult {
  /** Run-relative path of the source artifact. */
  readonly path: string;
}

/**
 * Represents a fully resolved section in the aggregated article, mapping
 * from the canonical section definition to the actual artifact paths found
 * in the run directory.
 */
export interface ResolvedSection {
  /** Stable section id used for HTML anchors. */
  readonly id: string;
  /** English section title. */
  readonly title: string;
  /** Ordered list of resolved artifact paths present in this section. */
  readonly resolvedArtifacts: readonly string[];
}
