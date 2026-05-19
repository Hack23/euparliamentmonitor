// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderIntelligenceGuide
 * @description Barrel re-export for the Reader Intelligence Guide
 * component. The previous monolithic module was split (Refactor 7/8)
 * into focused sub-modules under `./reader-guide/`:
 *
 *   - `./reader-guide/labels.ts`  — top-level chrome labels (14 langs)
 *   - `./reader-guide/rows.ts`    — per-section reader-need / value rows
 *   - `./reader-guide/icons.ts`   — section icons + lookup helper
 *   - `./reader-guide/builder.ts` — `buildReaderIntelligenceGuideHtml`
 *   - `./reader-guide/strip.ts`   — `stripInlineReaderGuide`
 *
 * Public API is preserved for downstream importers (production code in
 * `src/aggregator/article-generator.ts`, tests in
 * `test/unit/reader-intelligence-guide.test.js`, and any compiled
 * `scripts/aggregator/*.js` consumers).
 */

export type { TocSection, IncludedArtifact } from './reader-guide-constants.js';
export {
  READER_GUIDE_SECTION_ID,
  READER_GUIDE_SECTION_IDS,
  READER_GUIDE_SECTION_TITLE,
} from './reader-guide-constants.js';

export {
  READER_GUIDE_TITLE_LABELS,
  READER_GUIDE_INTRO_LABELS,
  READER_GUIDE_COL_NEED_LABELS,
  READER_GUIDE_COL_VALUE_LABELS,
  READER_GUIDE_COL_SOURCE_LABELS,
} from './reader-guide/labels.js';

export { getReaderGuideSectionIcon } from './reader-guide/icons.js';
export { buildReaderIntelligenceGuideHtml } from './reader-guide/builder.js';
export { stripInlineReaderGuide } from './reader-guide/strip.js';
