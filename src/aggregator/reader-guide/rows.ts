// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderGuide/Rows
 * @description Barrel that merges the core and extended reader-guide row
 * data maps into a single `READER_GUIDE_ROWS` export consumed by
 * `./builder.ts`. Split into `./rows-core.ts` and `./rows-extended.ts`
 * to keep each file under the 1 000-line project limit.
 */

export type { GuideRowData } from './rows-types.js';

import type { GuideRowData } from './rows-types.js';
import { READER_GUIDE_ROWS_CORE } from './rows-core.js';
import { READER_GUIDE_ROWS_EXTENDED } from './rows-extended.js';

export const READER_GUIDE_ROWS: Readonly<Record<string, GuideRowData>> = {
  ...READER_GUIDE_ROWS_CORE,
  ...READER_GUIDE_ROWS_EXTENDED,
};
