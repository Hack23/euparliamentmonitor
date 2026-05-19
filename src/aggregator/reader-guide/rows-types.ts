// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderGuide/RowsTypes
 * @description Shape of one translated reader-guide row. Extracted to a
 * neutral file so `./rows-core.ts` and `./rows-extended.ts` can both
 * reference it without one depending on the other.
 */

import type { LanguageMap } from '../../types/index.js';

/** Translated reader-guide row data keyed by section ID. */
export interface GuideRowData {
  readonly need: LanguageMap;
  readonly value: LanguageMap;
}
