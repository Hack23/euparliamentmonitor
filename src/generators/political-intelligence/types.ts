// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence/Types
 * @description Pure type-only contracts shared between the
 * political-intelligence sub-modules (data collection, HTML rendering,
 * tests). Lifted out of the monolithic `political-intelligence.ts` so
 * consumers can import the types without dragging in `fs`, `path`, the
 * 600-line copy table, or the curated-description data.
 *
 * **No runtime exports** — this file is a pure type module. The TypeScript
 * compiler erases it; the emitted JS file is a no-op.
 */

/** Metadata for a single methodology / template Markdown file */
export interface PIDocument {
  /** Path relative to the repo root (e.g. "analysis/methodologies/foo.md") */
  readonly relPath: string;
  /** Filename stem without extension */
  readonly stem: string;
  /** Human-readable title extracted from the first H1 heading or derived from the stem */
  readonly title: string;
  /** Short summary (first non-empty paragraph, truncated to ~220 chars) */
  readonly description: string;
  /** Emoji/icon that represents this document in the UI */
  readonly icon: string;
}

/** A grouped set of daily analysis runs for one date */
export interface PIDailyDateGroup {
  /** ISO date (YYYY-MM-DD) */
  readonly date: string;
  /** Runs produced on that date, sorted alphabetically */
  readonly runs: PIDailyRun[];
}

/** A single daily analysis run directory */
export interface PIDailyRun {
  /** Run slug (e.g. "breaking-run190", "motions-run46") */
  readonly slug: string;
  /** Number of Markdown artifacts inside the run directory (recursive) */
  readonly artifactCount: number;
  /** Path relative to the repo root of the run directory */
  readonly relPath: string;
  /** Emoji/icon derived from the run slug */
  readonly icon: string;
  /** Individual Markdown artifacts inside the run, sorted by path */
  readonly artifacts: PIDailyArtifact[];
}

/** A single Markdown artifact file inside a daily run directory */
export interface PIDailyArtifact {
  /** Path relative to the repo root (e.g. "analysis/daily/2026-04-22/breaking-run1/intelligence/swot.md") */
  readonly relPath: string;
  /** Path relative to the run directory (e.g. "intelligence/swot.md") */
  readonly shortPath: string;
}

/** Input payload used by the political-intelligence HTML renderer */
export interface PIPageData {
  /** Methodology files from `analysis/methodologies/` */
  readonly methodologies: PIDocument[];
  /** Template files from `analysis/templates/` */
  readonly templates: PIDocument[];
  /**
   * Reference & data-source documentation bundling `analysis/reference/`,
   * `analysis/imf/`, and `analysis/worldbank/` — ISMS adaptations, chart
   * integration guides, indicator catalogs, EU country mappings, and use
   * cases. Ensures every authored analysis artifact surfaces on the
   * political-intelligence index.
   */
  readonly referenceDocs: PIDocument[];
  /** Daily analysis runs grouped by date, newest date first */
  readonly dailyGroups: PIDailyDateGroup[];
}
