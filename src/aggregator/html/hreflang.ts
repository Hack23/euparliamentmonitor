// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Html/Hreflang
 * @description Hreflang / language-switcher helpers used by the article
 * HTML shell. Produces the canonical per-language filename, the
 * `<link rel="alternate" hreflang="…">` set, and the language switcher
 * nav rendered in the article header.
 */

import { BASE_URL } from '../../constants/config.js';
import {
  ALL_LANGUAGES,
  LANGUAGE_FLAGS,
  LANGUAGE_NAMES,
  getLocalizedString,
} from '../../constants/languages.js';
import { escapeHTML } from '../../utils/file-utils.js';
import type { LanguageCode } from '../../types/index.js';

/**
 * Build the canonical filename for an article in a given language. English
 * uses the bare stem (`2026-01-15-breaking-en.html`); other languages share
 * the same pattern so every language is a first-class variant. Matches the
 * existing `news/<date>-<slug>-<lang>.html` convention.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @param lang - Target language code
 * @returns Filename string without any directory prefix
 */
export function getArticleFilename(articleSlug: string, lang: LanguageCode): string {
  return `${articleSlug}-${lang}.html`;
}

/**
 * Build the hreflang `<link rel="alternate">` block for an article.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @returns Newline-joined `<link>` tags for every supported language plus
 *          an `x-default` fallback pointing at the English variant
 */
export function buildArticleHreflangLinks(articleSlug: string): string {
  const entries = ALL_LANGUAGES.map(
    (code) =>
      `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/news/${getArticleFilename(articleSlug, code)}">`
  );
  entries.push(
    `  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/news/${getArticleFilename(articleSlug, 'en')}">`
  );
  return entries.join('\n');
}

/**
 * Build the language-switcher nav block for the article header.
 *
 * @param articleSlug - Slug of the form `<date>-<type>` (no extension)
 * @param current - Language currently being rendered (used for active state)
 * @returns HTML fragment containing one `<a class="lang-link">` per language
 */
export function buildLanguageSwitcher(articleSlug: string, current: LanguageCode): string {
  return ALL_LANGUAGES.map((code) => {
    const flag = getLocalizedString(LANGUAGE_FLAGS, code);
    const name = getLocalizedString(LANGUAGE_NAMES, code);
    const safeName = escapeHTML(name);
    const active = code === current ? ' active' : '';
    const ariaCurrent = code === current ? ' aria-current="page"' : '';
    const href = getArticleFilename(articleSlug, code);
    return `<a href="${href}" class="lang-link${active}" hreflang="${code}" lang="${code}" title="${safeName}" aria-label="${safeName}"${ariaCurrent}>${flag} ${code.toUpperCase()}</a>`;
  }).join('\n        ');
}
