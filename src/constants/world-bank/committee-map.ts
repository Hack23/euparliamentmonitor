// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/WorldBank/CommitteeMap
 * @description EP standing committee → World Bank indicator declarative map (barrel).
 *
 * Covers all 20 EP standing committees. Types live in committee-map-types.ts;
 * entries are split across committee-map-part1.ts (first half) and
 * committee-map-part2.ts (second half) to keep individual files under 600 LOC.
 */

export type { IndicatorMapping, CommitteeIndicatorEntry } from "./committee-map-types.js";
import type { CommitteeIndicatorEntry } from "./committee-map-types.js";
import { COMMITTEE_INDICATOR_MAP_PART1 } from "./committee-map-part1.js";
import { COMMITTEE_INDICATOR_MAP_PART2 } from "./committee-map-part2.js";

/**
 * Combined committee → indicator map. Merges both parts at module load.
 */
export const COMMITTEE_INDICATOR_MAP: Readonly<Record<string, CommitteeIndicatorEntry>> = {
  ...COMMITTEE_INDICATOR_MAP_PART1,
  ...COMMITTEE_INDICATOR_MAP_PART2,
} as const;
