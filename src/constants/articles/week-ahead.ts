// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/Articles/WeekAhead
 * @description Week-ahead strings for all 14 languages — assembled from EU and global sub-modules.
 */

import type { LanguageMap, WeekAheadStrings, WeekAheadStakeholderStrings } from '../../types/index.js';
import {
  WEEK_AHEAD_TITLES_EU,
  WEEK_AHEAD_STRINGS_EU,
  WEEK_AHEAD_STAKEHOLDER_STRINGS_EU,
} from './week-ahead-eu.js';
import {
  WEEK_AHEAD_TITLES_GLOBAL,
  WEEK_AHEAD_STRINGS_GLOBAL,
  WEEK_AHEAD_STAKEHOLDER_STRINGS_GLOBAL,
} from './week-ahead-global.js';

/** Week-ahead titles for all 14 languages */
export const WEEK_AHEAD_TITLES: LanguageMap<(n: number) => string> = {
  ...WEEK_AHEAD_TITLES_EU,
  ...WEEK_AHEAD_TITLES_GLOBAL,
};

/** Week-ahead strings for all 14 languages */
export const WEEK_AHEAD_STRINGS: LanguageMap<WeekAheadStrings> = {
  ...WEEK_AHEAD_STRINGS_EU,
  ...WEEK_AHEAD_STRINGS_GLOBAL,
};

/** Week-ahead stakeholder strings for all 14 languages */
export const WEEK_AHEAD_STAKEHOLDER_STRINGS: LanguageMap<WeekAheadStakeholderStrings> = {
  ...WEEK_AHEAD_STAKEHOLDER_STRINGS_EU,
  ...WEEK_AHEAD_STAKEHOLDER_STRINGS_GLOBAL,
};
