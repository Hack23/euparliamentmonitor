// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Artifacts/Types
 * @description Strict type definitions for the artifacts bounded context.
 * Defines the shape of artifact content, section mappings, and sanitization
 * options used throughout the aggregator pipeline.
 */

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
 * Represents cleaned artifact content after sanitization. The cleaning
 * process strips front-matter, banners, demotes headings, and rewrites links.
 */
export interface CleanedArtifact {
  /** Run-relative path of the source artifact. */
  readonly path: string;
  /** Cleaned Markdown ready for aggregation. */
  readonly markdown: string;
  /** Number of H1 headings that were stripped. */
  readonly strippedH1s: number;
  /** Number of banner/metadata lines removed. */
  readonly strippedBannerLines: number;
  /** Number of operational metadata preamble lines removed. */
  readonly strippedMetaLines: number;
  /** Number of mermaid blocks deduplicated. */
  readonly dedupedMermaidBlocks: number;
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
