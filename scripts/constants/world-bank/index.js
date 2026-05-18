// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/WorldBank
 * @description Barrel for the World Bank indicator catalog and the
 * committee/category mapping helpers used by news-generation strategies.
 *
 * Split by data dimension:
 * - {@link Constants/WorldBank/IndicatorCatalog} — the 34 curated `WB_INDICATORS`
 *   records (id-only map; human-readable names are in the `N` table; per-indicator
 *   units appear in inline JSDoc) plus shared `PRI`/`SEC` priority constants
 * - {@link Constants/WorldBank/CommitteeMap} — EP committee code → indicator-id arrays
 * - {@link Constants/WorldBank/CategoryMap} — `ArticleCategory` → indicator-id arrays
 *
 * ## ⚠️ For AI Agents / Agentic Workflows
 *
 * The 34 indicators are a **curated subset** of the World Bank catalog (200+).
 * Use the `search-indicators` MCP tool for on-demand dynamic discovery — never
 * assume the embedded list is exhaustive.
 */
import { ArticleCategory } from '../../types/index.js';
import { PRI } from './indicator-catalog.js';
import { COMMITTEE_INDICATOR_MAP } from './committee-map.js';
import { CATEGORY_INDICATOR_MAP } from './category-map.js';
// ─── Re-exports ──────────────────────────────────────────────────────────────
export { WB_INDICATORS } from './indicator-catalog.js';
export { COMMITTEE_INDICATOR_MAP, } from './committee-map.js';
export { CATEGORY_INDICATOR_MAP } from './category-map.js';
// ─── Helper Functions ────────────────────────────────────────────────────────
/**
 * Get World Bank indicators relevant to a specific EP committee.
 *
 * @param abbreviation - Committee abbreviation (e.g. 'ECON', 'ENVI')
 * @returns Array of indicator mappings, or empty array if committee not found
 */
export function getCommitteeIndicators(abbreviation) {
    const entry = COMMITTEE_INDICATOR_MAP[abbreviation.toUpperCase()];
    return entry?.indicators ?? [];
}
/**
 * Get primary (must-fetch) indicators for a committee.
 *
 * @param abbreviation - Committee abbreviation
 * @returns Array of primary indicator mappings
 */
export function getCommitteePrimaryIndicators(abbreviation) {
    return getCommitteeIndicators(abbreviation).filter((i) => i.priority === PRI);
}
/**
 * Get World Bank indicators relevant to an article category.
 *
 * @param category - Article category
 * @returns Category indicator entry with enrichment guidance
 */
export function getCategoryIndicators(category) {
    if (!Object.hasOwn(CATEGORY_INDICATOR_MAP, category)) {
        return getCategoryIndicators(ArticleCategory.BREAKING_NEWS);
    }
    return CATEGORY_INDICATOR_MAP[category];
}
/**
 * Get all unique indicator IDs needed for a set of committees.
 * Useful for batch-fetching indicator data for multi-committee articles.
 *
 * @param abbreviations - Committee abbreviation array
 * @param primaryOnly - If true, only return primary indicators
 * @returns Deduplicated array of World Bank indicator IDs
 */
export function getIndicatorIdsForCommittees(abbreviations, primaryOnly = false) {
    const ids = new Set();
    for (const abbr of abbreviations) {
        const indicators = primaryOnly
            ? getCommitteePrimaryIndicators(abbr)
            : getCommitteeIndicators(abbr);
        for (const ind of indicators) {
            ids.add(ind.indicatorId);
        }
    }
    return [...ids];
}
/**
 * Get all indicator IDs needed for an article category, including both
 * primary and secondary indicators.
 *
 * @param category - Article category
 * @returns Deduplicated array of World Bank indicator IDs
 */
export function getAllCategoryIndicatorIds(category) {
    const entry = getCategoryIndicators(category);
    const ids = new Set();
    for (const ind of entry.primaryIndicators) {
        ids.add(ind.indicatorId);
    }
    for (const ind of entry.secondaryIndicators) {
        ids.add(ind.indicatorId);
    }
    return [...ids];
}
//# sourceMappingURL=index.js.map