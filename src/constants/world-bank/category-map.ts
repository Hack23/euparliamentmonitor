// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CategoryMap
 * @description Category indicator map — assembled from legislative, periodic, and analysis sub-modules.
 */

import type { ArticleCategory } from '../../types/index.js';
import type { IndicatorMapping } from './committee-map.js';

export interface CategoryIndicatorEntry {
  /** Article category value */
  readonly category: ArticleCategory;
  /** Description of how economic data enriches this article type */
  readonly enrichmentStrategy: string;
  /** Primary indicators — always fetch for this category */
  readonly primaryIndicators: readonly IndicatorMapping[];
  /** Secondary indicators — fetch when the article covers specific policy areas */
  readonly secondaryIndicators: readonly IndicatorMapping[];
  /** Maximum recommended World Bank MCP calls per article generation run */
  readonly maxWBCalls: number;
}

import {
  CATEGORY_INDICATOR_MAP_LEGISLATIVE,
} from './category-map-legislative.js';
import {
  CATEGORY_INDICATOR_MAP_PERIODIC,
} from './category-map-periodic.js';
import {
  CATEGORY_INDICATOR_MAP_ANALYSIS,
} from './category-map-analysis.js';

/** Full category indicator map for all article categories */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- sub-modules are Partial; combined map is guaranteed complete
export const CATEGORY_INDICATOR_MAP = {
  ...CATEGORY_INDICATOR_MAP_LEGISLATIVE,
  ...CATEGORY_INDICATOR_MAP_PERIODIC,
  ...CATEGORY_INDICATOR_MAP_ANALYSIS,
} as Readonly<Record<ArticleCategory, CategoryIndicatorEntry>>;
