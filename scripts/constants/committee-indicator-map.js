// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/CommitteeIndicatorMap
 * @description Thin re-export barrel preserving the legacy import path.
 *
 * The implementation now lives split by data dimension under
 * {@link Constants/WorldBank}:
 *
 * - `world-bank/indicator-catalog.ts` — the 34 curated `WB_INDICATORS` records
 * - `world-bank/committee-map.ts`     — EP committee code → indicator-id arrays
 * - `world-bank/category-map.ts`      — `ArticleCategory` → indicator-id arrays
 * - `world-bank/index.ts`             — barrel + `getIndicatorsFor*` helpers
 *
 * New code should import from `../constants/world-bank/index.js` directly.
 *
 * ## ⚠️ For AI Agents / Agentic Workflows
 *
 * The 34 indicators here are a **curated subset** of the World Bank catalog
 * (200+). Use the `search-indicators` MCP tool for on-demand discovery —
 * never assume the embedded list is exhaustive.
 */
export { WB_INDICATORS, COMMITTEE_INDICATOR_MAP, CATEGORY_INDICATOR_MAP, getCommitteeIndicators, getCommitteePrimaryIndicators, getCategoryIndicators, getIndicatorIdsForCommittees, getAllCategoryIndicatorIds, } from './world-bank/index.js';
//# sourceMappingURL=committee-indicator-map.js.map