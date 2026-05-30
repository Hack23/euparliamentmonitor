// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/Sections/RssDiscovery
 * @description Neutral, shared helpers for resolving per-language RSS feed
 * filenames and emitting the `<head>` feed-autodiscovery `<link>` tag.
 *
 * These helpers live in the shared `templates/` zone (rather than inside the
 * `generators/sitemap/` context) because both the aggregator article shell
 * (`aggregator/html/shell.ts`) and the page generators
 * (`generators/sitemap/html.ts`, `generators/news-indexes/per-language.ts`,
 * `generators/political-intelligence/html.ts`) need them. Keeping them here
 * avoids an aggregator→generators cross-context import (see
 * `test/unit/cross-context-imports.test.js`).
 *
 * `generators/sitemap/rss.ts` re-exports both helpers so the sitemap feed
 * generator keeps a single public surface.
 */

import { escapeHTML } from '../../utils/file-utils.js';
import { getLocalizedString, FOOTER_RSS_LABELS } from '../../constants/languages.js';

/**
 * Resolve the feed filename for a language. English publishes to the
 * canonical `rss.xml`; every other language gets `rss_<lang>.xml`.
 *
 * @param lang - Language code
 * @returns Feed filename (e.g. `rss.xml`, `rss_sv.xml`)
 */
export function getRssFilename(lang: string): string {
  return lang === 'en' ? 'rss.xml' : `rss_${lang}.xml`;
}

/**
 * Build the `<head>` discovery `<link rel="alternate" type="application/rss+xml">`
 * tag for a page, pointing feed-autodiscovery at the language-matched
 * feed (`rss.xml` for English, `rss_<lang>.xml` otherwise) with a
 * localized title.
 *
 * @param lang - Page language code
 * @param pathPrefix - Prefix prepended to the relative feed filename
 *   (`''` for root pages, `'../'` for pages under `news/`, or an absolute
 *   `${BASE_URL}/` to emit an absolute href).
 * @returns A complete `<link>` element string
 */
export function buildRssAlternateLink(lang: string, pathPrefix = ''): string {
  const href = `${pathPrefix}${getRssFilename(lang)}`;
  const title = `EU Parliament Monitor — ${getLocalizedString(FOOTER_RSS_LABELS, lang)}`;
  return `<link rel="alternate" type="application/rss+xml" title="${escapeHTML(title)}" href="${escapeHTML(href)}">`;
}
