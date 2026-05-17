// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ALL_LANGUAGES } from '../language-core.js';
/**
 * BCP-47 OpenGraph locale code per supported language.
 *
 * The values follow `<language>_<TERRITORY>` (underscore-separated)
 * as required by the OpenGraph protocol. Use the helpers below rather
 * than reading the map directly so the locale logic stays in one
 * place.
 */
export const OG_LOCALES = {
    en: 'en_GB',
    sv: 'sv_SE',
    da: 'da_DK',
    no: 'nb_NO',
    fi: 'fi_FI',
    de: 'de_DE',
    fr: 'fr_FR',
    es: 'es_ES',
    nl: 'nl_NL',
    ar: 'ar_SA',
    he: 'he_IL',
    ja: 'ja_JP',
    ko: 'ko_KR',
    zh: 'zh_CN',
};
/**
 * Return the BCP-47 locale code for a given ISO 639-1 language code.
 * Falls back to `en_GB` for unknown languages — the same fallback the
 * rest of the site uses for missing translations.
 *
 * @param lang - ISO 639-1 language code (e.g., `"en"`, `"sv"`)
 * @returns BCP-47 `language_TERRITORY` locale (e.g., `"en_GB"`)
 */
export function getOgLocale(lang) {
    return Object.hasOwn(OG_LOCALES, lang)
        ? (OG_LOCALES[lang] ?? OG_LOCALES.en)
        : OG_LOCALES.en;
}
/**
 * Build the OpenGraph locale meta tag block — one canonical
 * `og:locale` for the current language plus an `og:locale:alternate`
 * for every other supported language. Emitting the alternates lets the
 * Facebook/LinkedIn crawler discover the localized siblings without
 * having to follow the `<link rel="alternate" hreflang>` chain.
 *
 * The output is intentionally indented with two spaces to match the
 * surrounding `<head>` formatting in the four generators.
 *
 * @param currentLang - Language being rendered (drives `og:locale`)
 * @returns Multi-line HTML fragment ready to drop into `<head>`
 */
export function buildOgLocaleTags(currentLang) {
    const primary = getOgLocale(currentLang);
    const alternates = ALL_LANGUAGES.filter((code) => code !== currentLang).map((code) => `  <meta property="og:locale:alternate" content="${getOgLocale(code)}">`);
    return [`  <meta property="og:locale" content="${primary}">`, ...alternates].join('\n');
}
//# sourceMappingURL=og-locales.js.map