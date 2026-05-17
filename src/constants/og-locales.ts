// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/OgLocales
 * @description BCP-47 OpenGraph locale codes (`en_GB`, `sv_SE`, …) for
 * the 14 supported languages, plus helpers to emit the canonical
 * `og:locale` and 13 `og:locale:alternate` meta tags on every page.
 *
 * **Why this matters.** OpenGraph (Facebook, LinkedIn, Slack, Discord)
 * and Twitter/X expect `og:locale` to follow the BCP-47 underscore
 * form (`language_TERRITORY`). The ISO 639-1 bare code (`en`, `sv`)
 * that the rest of the site uses internally is accepted by Google's
 * `inLanguage` schema but breaks social-card locale routing — Facebook
 * silently falls back to `en_US` and serves the English preview to
 * Swedish/German/Arabic users.
 *
 * **Choice of region tag.** Where a language has an obvious primary EU
 * jurisdiction we use it (`sv_SE`, `de_DE`, `fr_FR`, `es_ES`, `nl_NL`).
 * For Arabic, Hebrew, Japanese, Korean, Chinese, Norwegian, Danish,
 * Finnish we pick the canonical CLDR/ISO 3166 region. English is
 * `en_GB` (not `en_US`) — the editorial voice targets EU readers.
 *
 * The mapping table is the **single source of truth** for the social-
 * card surface and is consumed by every HTML generator in
 * `src/generators/` plus `src/aggregator/article-html.ts`. Tests
 * assert byte-equivalent output across the four surfaces.
 */

import type { LanguageCode } from '../types/index.js';
import { ALL_LANGUAGES } from './language-core.js';

/**
 * BCP-47 OpenGraph locale code per supported language.
 *
 * The values follow `<language>_<TERRITORY>` (underscore-separated)
 * as required by the OpenGraph protocol. Use the helpers below rather
 * than reading the map directly so the locale logic stays in one
 * place.
 */
export const OG_LOCALES: Readonly<Record<LanguageCode, string>> = {
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
export function getOgLocale(lang: string): string {
  return Object.hasOwn(OG_LOCALES, lang)
    ? (OG_LOCALES[lang as LanguageCode] ?? OG_LOCALES.en)
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
export function buildOgLocaleTags(currentLang: string): string {
  const primary = getOgLocale(currentLang);
  const alternates = ALL_LANGUAGES.filter((code) => code !== currentLang).map(
    (code) => `  <meta property="og:locale:alternate" content="${getOgLocale(code)}">`
  );
  return [`  <meta property="og:locale" content="${primary}">`, ...alternates].join('\n');
}
