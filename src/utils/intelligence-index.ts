// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/IntelligenceIndex
 * @description Stable barrel re-export of the cross-article intelligence
 * indexing system. The original 858-LOC module was split (issue #2032)
 * into focused submodules under `src/utils/intelligence/`. This barrel
 * preserves every public import path used by consumers in `src/` and
 * `scripts/`.
 *
 * Sub-module layout:
 *
 * - `src/utils/intelligence/types.js`     — re-export of the index data types
 * - `src/utils/intelligence/build.js`     — index construction & queries
 * - `src/utils/intelligence/persist.js`   — load / save with schema normalisation
 * - `src/utils/intelligence/trends.js`    — trend detection
 * - `src/utils/intelligence/html.js`      — "Related Analysis" HTML renderer
 * - `src/utils/intelligence/internals.js` — shared helpers (private)
 */

export {
  createEmptyIndex,
  addArticleToIndex,
  buildIndexFromEntries,
  findRelatedArticles,
  generateCrossReferences,
  findOrCreateSeries,
} from './intelligence/build.js';

export { detectTrends } from './intelligence/trends.js';

export { loadIntelligenceIndex, saveIntelligenceIndex } from './intelligence/persist.js';

export { buildRelatedArticlesHTML } from './intelligence/html.js';
