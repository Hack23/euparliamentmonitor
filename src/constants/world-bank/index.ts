// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank
 * @description Barrel for the World Bank indicator catalog and the
 * committee/category mapping helpers used by news-generation strategies.
 *
 * Split by data dimension:
 * - {@link Constants/WorldBank/IndicatorCatalog} — the 34 curated `WB_INDICATORS`
 *   records (id, units, display name) plus shared `PRI`/`SEC` priority constants
 * - {@link Constants/WorldBank/CommitteeMap} — EP committee code → indicator-id arrays
 * - {@link Constants/WorldBank/CategoryMap} — `ArticleCategory` → indicator-id arrays
 *
 * ## ⚠️ For AI Agents / Agentic Workflows
 *
 * The 34 indicators are a **curated subset** of the World Bank catalog (200+).
 * Use the `search-indicators` MCP tool for on-demand dynamic discovery — never
 * assume the embedded list is exhaustive.
 */

import { ArticleCategory } from '../../types/common.js';
import { COMMITTEE_INDICATOR_MAP, type IndicatorMapping } from './committee-map.js';
import { CATEGORY_INDICATOR_MAP, type CategoryIndicatorEntry } from './category-map.js';

// ─── Re-exports ──────────────────────────────────────────────────────────────

export { WB_INDICATORS, type WBIndicatorId } from './indicator-catalog.js';
export {
  COMMITTEE_INDICATOR_MAP,
  type IndicatorMapping,
  type CommitteeIndicatorEntry,
} from './committee-map.js';
export { CATEGORY_INDICATOR_MAP, type CategoryIndicatorEntry } from './category-map.js';

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Get World Bank indicators relevant to a specific EP committee.
 *
 * @param abbreviation - Committee abbreviation (e.g. 'ECON', 'ENVI')
 * @returns Array of indicator mappings, or empty array if committee not found
 */
export function getCommitteeIndicators(abbreviation: string): readonly IndicatorMapping[] {
  const entry = COMMITTEE_INDICATOR_MAP[abbreviation.toUpperCase()];
  return entry?.indicators ?? [];
}

/**
 * Get primary (must-fetch) indicators for a committee.
 *
 * @param abbreviation - Committee abbreviation
 * @returns Array of primary indicator mappings
 */
export function getCommitteePrimaryIndicators(abbreviation: string): readonly IndicatorMapping[] {
  return getCommitteeIndicators(abbreviation).filter((i) => i.priority === 'primary');
}

/**
 * Get World Bank indicators relevant to an article category.
 *
 * @param category - Article category
 * @returns Category indicator entry with enrichment guidance
 */
export function getCategoryIndicators(category: ArticleCategory): CategoryIndicatorEntry {
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
export function getIndicatorIdsForCommittees(
  abbreviations: readonly string[],
  primaryOnly: boolean = false
): readonly string[] {
  const ids = new Set<string>();
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
export function getAllCategoryIndicatorIds(category: ArticleCategory): readonly string[] {
  const entry = getCategoryIndicators(category);
  const ids = new Set<string>();
  for (const ind of entry.primaryIndicators) {
    ids.add(ind.indicatorId);
  }
  for (const ind of entry.secondaryIndicators) {
    ids.add(ind.indicatorId);
  }
  return [...ids];
}
