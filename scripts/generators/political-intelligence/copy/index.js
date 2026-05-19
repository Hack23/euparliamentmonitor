// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/PoliticalIntelligence/Copy/Index
 * @description Aggregates the per-language override files and exposes the
 * canonical `PI_COPY` map plus the `getPICopy(lang)` resolver. Per-language
 * overrides fall back to the English {@link DEFAULT_COPY} for any missing key.
 */
import { DEFAULT_COPY } from './types.js';
import { SV_COPY, DA_COPY, NO_COPY, FI_COPY } from './nordic.js';
import { DE_COPY, FR_COPY, ES_COPY, NL_COPY } from './eu-core.js';
import { AR_COPY, HE_COPY, JA_COPY, KO_COPY, ZH_COPY } from './other.js';
/** Per-language overrides; fall back to English for any missing key */
export const PI_COPY = {
    en: {},
    sv: SV_COPY,
    da: DA_COPY,
    no: NO_COPY,
    fi: FI_COPY,
    de: DE_COPY,
    fr: FR_COPY,
    es: ES_COPY,
    nl: NL_COPY,
    ar: AR_COPY,
    he: HE_COPY,
    ja: JA_COPY,
    ko: KO_COPY,
    zh: ZH_COPY,
};
/**
 * Resolve the localized copy for the political-intelligence page,
 * merging the locale-specific overrides on top of the English
 * defaults. Unknown language codes (including prototype-pollution
 * payloads like `__proto__`) silently fall back to English — the
 * caller is responsible for validating `lang` against the supported
 * language allow-list.
 *
 * @param lang - Language code
 * @returns Fully-populated {@link PICopy}
 */
export function getPICopy(lang) {
    const overrides = PI_COPY[lang] ?? {};
    return { ...DEFAULT_COPY, ...overrides };
}
//# sourceMappingURL=index.js.map