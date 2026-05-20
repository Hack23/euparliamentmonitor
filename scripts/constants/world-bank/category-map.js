// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { CATEGORY_INDICATOR_MAP_LEGISLATIVE, } from './category-map-legislative.js';
import { CATEGORY_INDICATOR_MAP_PERIODIC, } from './category-map-periodic.js';
import { CATEGORY_INDICATOR_MAP_ANALYSIS, } from './category-map-analysis.js';
/** Full category indicator map for all article categories */
export const CATEGORY_INDICATOR_MAP = {
    ...CATEGORY_INDICATOR_MAP_LEGISLATIVE,
    ...CATEGORY_INDICATOR_MAP_PERIODIC,
    ...CATEGORY_INDICATOR_MAP_ANALYSIS,
};
//# sourceMappingURL=category-map.js.map