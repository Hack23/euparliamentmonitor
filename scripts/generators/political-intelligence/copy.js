// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/PoliticalIntelligence/Copy
 * @description Thin re-export barrel for the Political Intelligence
 * landing-page localized copy. Refactor 8/8 split the original 617-LOC
 * monolithic copy.ts into per-language-group sub-modules under `./copy/`
 * so each translator can edit one bounded file. Every public name
 * (`PICopy`, `DEFAULT_COPY`, `PI_COPY`, `getPICopy`) is preserved.
 */
export { DEFAULT_COPY } from './copy/types.js';
export { PI_COPY, getPICopy } from './copy/index.js';
//# sourceMappingURL=copy.js.map