// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Shared/TemplateHelpers
 * @description Common template utility functions shared across all HTML
 * generation bounded contexts. These helpers standardize repetitive
 * patterns (cache-bust URLs, lang attribute emission, conditional blocks)
 * so every generator produces consistent markup.
 */

import type { LanguageCode } from '../../types/index.js';
import { getTextDirection } from '../../constants/languages.js';
import type { CacheBustConfig } from './types.js';

/**
 * Append a cache-busting query parameter to an asset URL.
 *
 * @param assetPath - Relative path to the asset (e.g. `css/styles.css`)
 * @param config - Cache-bust configuration with the build hash
 * @returns URL with `?v=<buildShort>` appended
 *
 * @example
 * ```ts
 * cacheBustUrl('css/styles.css', { buildShort: 'abc1234', appVersion: '0.8.59' })
 * // → 'css/styles.css?v=abc1234'
 * ```
 */
export function cacheBustUrl(assetPath: string, config: CacheBustConfig): string {
  return `${assetPath}?v=${config.buildShort}`;
}

/**
 * Build the `<html>` opening tag with language and direction attributes.
 *
 * @param lang - ISO 639-1 language code
 * @returns Opening `<html>` tag string with `lang` and `dir` attributes
 */
export function buildHtmlOpenTag(lang: LanguageCode): string {
  const dir = getTextDirection(lang);
  return `<html lang="${lang}" dir="${dir}">`;
}

/**
 * Build a complete `<meta>` tag.
 *
 * @param name - Meta tag name attribute
 * @param content - Meta tag content attribute (pre-escaped if necessary)
 * @returns Complete `<meta>` tag string
 */
export function buildMetaTag(name: string, content: string): string {
  return `  <meta name="${name}" content="${content}">`;
}

/**
 * Build an Open Graph `<meta>` tag.
 *
 * @param property - OG property (e.g. `og:title`)
 * @param content - Property value
 * @returns Complete `<meta property="…">` tag string
 */
export function buildOgMetaTag(property: string, content: string): string {
  return `  <meta property="${property}" content="${content}">`;
}

/**
 * Determine text direction for a language code.
 *
 * @param lang - ISO 639-1 language code
 * @returns `'rtl'` for Arabic and Hebrew, `'ltr'` for all others
 */
export function getDirection(lang: LanguageCode): 'ltr' | 'rtl' {
  return getTextDirection(lang) as 'ltr' | 'rtl';
}

/**
 * Build an hreflang `<link rel="alternate">` tag.
 *
 * @param hreflang - Language code (or `x-default`)
 * @param href - Absolute URL of the alternate page
 * @returns Complete `<link>` tag string
 */
export function buildHreflangLink(hreflang: string, href: string): string {
  return `  <link rel="alternate" hreflang="${hreflang}" href="${href}">`;
}
