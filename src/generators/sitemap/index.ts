// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Sitemap
 * @description Public re-exports for the sitemap bounded context. The
 * package decomposes into four coherent sub-contexts:
 *
 * - {@link ./xml-utils} — XML-entity escaping shared by every XML output
 * - {@link ./rss}       — RSS 2.0 feed generation
 * - {@link ./xml}       — `sitemap.xml` document with hreflang alternates
 * - {@link ./html}      — per-language `sitemap_<lang>.html` pages
 * - {@link ./copy}      — localized copy tables (14 languages) + category order
 *
 * The CLI entry that orchestrates all four contexts (writes
 * `sitemap.xml`, `rss.xml`, the 14 sitemap HTML pages, and the 14
 * political-intelligence pages) lives in `src/generators/sitemap.ts`.
 * That file imports from this barrel and is the single executable
 * shipped under `scripts/generators/sitemap.js`.
 */

export { escapeXML } from './xml-utils.js';
export { generateRssFeed, type RssItem } from './rss.js';
export {
  generateSitemap,
  collectDocsHtmlFiles,
  type SitemapUrlWithAlternates,
  SITEMAP_DOCS_DIR,
} from './xml.js';
export {
  generateSitemapHTML,
  getSitemapFilename,
  getIndexFilename,
  type SitemapArticleInfo,
} from './html.js';
export {
  SITEMAP_TITLES,
  SITEMAP_SECTIONS,
  SITEMAP_COPY,
  DOCS_LABELS,
  DEFAULT_SITEMAP_TITLE,
  CATEGORY_ORDER,
  getSitemapCopy,
  type SitemapCopy,
} from './copy.js';
