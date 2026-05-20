// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { COMMITTEE_INDICATOR_MAP_PART1 } from './committee-map-part1.js';
import { COMMITTEE_INDICATOR_MAP_PART2 } from './committee-map-part2.js';
/**
 * Combined committee → indicator map. Merges both parts at module load.
 */
export const COMMITTEE_INDICATOR_MAP = {
    ...COMMITTEE_INDICATOR_MAP_PART1,
    ...COMMITTEE_INDICATOR_MAP_PART2,
};
//# sourceMappingURL=committee-map.js.map