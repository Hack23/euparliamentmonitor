// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CategoryMap
 * @description Category indicator map — assembled from legislative, periodic, and analysis sub-modules.
 */

import { ArticleCategory } from '../../types/index.js';
import { WB_INDICATORS, N, PRI, SEC } from './indicator-catalog.js';
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

export type { CategoryIndicatorEntry };

/** Full category indicator map for all article categories */
export const CATEGORY_INDICATOR_MAP: Record<ArticleCategory, IndicatorMapping> = {
  ...CATEGORY_INDICATOR_MAP_LEGISLATIVE,
  ...CATEGORY_INDICATOR_MAP_PERIODIC,
  ...CATEGORY_INDICATOR_MAP_ANALYSIS,
} as Record<ArticleCategory, IndicatorMapping>;
