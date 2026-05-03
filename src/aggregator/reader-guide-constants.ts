// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderGuideConstants
 * @description Shared constants and types for the Reader Intelligence Guide,
 * used by both `analysis-aggregator.ts` (Markdown renderer) and
 * `reader-intelligence-guide.ts` (HTML renderer). Extracted into a
 * standalone module to avoid circular ES module dependencies.
 */

/** A section entry in the article's Table of Contents. */
export interface TocSection {
  /** Fragment identifier — matches the `id="…"` on the rendered H2. */
  readonly id: string;
  /** Display title shown in the sidebar nav. */
  readonly title: string;
}

/** Metadata for one artifact included in the aggregate. */
export interface IncludedArtifact {
  /** Path relative to the run dir. */
  readonly runRelPath: string;
  /** Path relative to the repo root. */
  readonly repoRelPath: string;
  /** Id of the section this artifact belongs to. */
  readonly sectionId: string;
}

/** Id of the generated reader guide section. */
export const READER_GUIDE_SECTION_ID = 'reader-intelligence-guide';

/** Display title of the generated reader guide section (English). */
export const READER_GUIDE_SECTION_TITLE = 'Reader Intelligence Guide';

/**
 * Canonical ordered list of section IDs included in the Reader Intelligence
 * Guide. Both the Markdown and HTML renderers use this as the single source
 * of truth; adding or removing a section here automatically propagates to
 * both code paths.
 */
export const READER_GUIDE_SECTION_IDS: readonly string[] = [
  'section-executive-brief',
  'section-synthesis',
  'section-significance',
  'section-coalitions-voting',
  'section-stakeholder-map',
  'section-economic-context',
  'section-scenarios',
  'section-risk',
] as const;
