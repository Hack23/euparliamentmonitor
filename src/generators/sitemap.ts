#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Sitemap
 * @description CLI entry that orchestrates every sitemap output:
 * `sitemap.xml`, `rss.xml`, the 14 `sitemap_<lang>.html` pages, and the
 * 14 `political-intelligence_<lang>.html` pages.
 *
 * The actual implementation lives in `src/generators/sitemap/` —
 * `xml-utils`, `rss`, `xml`, `html`, `copy`. This file is the single
 * executable shipped under `scripts/generators/sitemap.js`, invoked by
 * `npm run prebuild` and the deploy/release/e2e workflows.
 *
 * **Re-exports preserved for back-compat**: existing call sites that
 * import `generateSitemap`, `generateSitemapHTML`, `generateRssFeed`,
 * `getSitemapFilename`, `RssItem`, or `collectDocsHtmlFiles` from this
 * module keep resolving. New code should import directly from
 * `./sitemap/index.js` (the barrel) or from a specific sub-module for
 * the tightest dependency surface.
 */

import fs from 'fs';
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import { BASE_URL, NEWS_DIR, PROJECT_ROOT } from '../constants/config.js';
import { ALL_LANGUAGES } from '../constants/languages.js';
import {
  getNewsArticles,
  parseArticleFilename,
  formatSlug,
  extractArticleMeta,
} from '../utils/file-utils.js';
import {
  collectDocsHtmlFiles,
  generateRssFeed,
  generateSitemap,
  generateSitemapHTML,
  getSitemapFilename,
  SITEMAP_DOCS_DIR,
  type RssItem,
  type SitemapArticleInfo,
} from './sitemap/index.js';
import {
  collectPoliticalIntelligenceData,
  generatePoliticalIntelligenceHTML,
  getPoliticalIntelligenceFilename,
} from './political-intelligence.js';

// ─── Back-compat re-exports ─────────────────────────────────────────
// New code should import from `./sitemap/index.js` directly. These
// re-exports keep existing call sites and external imports stable.

export {
  collectDocsHtmlFiles,
  generateRssFeed,
  generateSitemap,
  generateSitemapHTML,
  getSitemapFilename,
} from './sitemap/index.js';
export type { RssItem, SitemapArticleInfo } from './sitemap/index.js';

/**
 * Main execution — generates `sitemap.xml`, the 14 `political-intelligence_<lang>.html`
 * pages, the 14 `sitemap_<lang>.html` pages, and `rss.xml`.
 */
function main(): void {
  console.log('🗺️ Generating sitemap...');

  const articles = getNewsArticles();
  console.log(`📊 Found ${articles.length} articles`);

  // Collect docs HTML files (gracefully empty when docs/ is absent)
  const docsFiles = collectDocsHtmlFiles(SITEMAP_DOCS_DIR);
  console.log(`📚 Found ${docsFiles.length} docs files`);

  const sitemap = generateSitemap(articles, docsFiles);
  const filepath = path.join(PROJECT_ROOT, 'sitemap.xml');
  fs.writeFileSync(filepath, sitemap, 'utf-8');
  const totalUrls =
    articles.length +
    ALL_LANGUAGES.length * 3 + // index pages + sitemap HTML + political-intelligence HTML
    docsFiles.length +
    1; // rss.xml
  console.log(`✅ Generated sitemap.xml with ${totalUrls} URLs`);

  // Generate political-intelligence pages (one per language)
  const piData = collectPoliticalIntelligenceData(PROJECT_ROOT);
  console.log(
    `🧭 Scanned analysis tradecraft: ${piData.methodologies.length} methodologies, ${piData.templates.length} templates, ${piData.dailyGroups.length} daily groups`
  );
  let piGenerated = 0;
  for (const lang of ALL_LANGUAGES) {
    const piHtml = generatePoliticalIntelligenceHTML(lang, piData);
    const piFilename = getPoliticalIntelligenceFilename(lang);
    const piPath = path.join(PROJECT_ROOT, piFilename);
    fs.writeFileSync(piPath, piHtml, 'utf-8');
    console.log(`  ✅ Generated ${piFilename}`);
    piGenerated++;
  }
  console.log(`✅ Generated ${piGenerated} political-intelligence HTML files`);

  // Build article metadata map for sitemap HTML pages and RSS,
  // pre-grouped by language for O(N) iteration
  const articlesByLang = new Map<string, SitemapArticleInfo[]>();
  const rssItems: RssItem[] = [];
  for (const lang of ALL_LANGUAGES) {
    articlesByLang.set(lang, []);
  }
  for (const filename of articles) {
    const parsed = parseArticleFilename(filename);
    if (parsed) {
      const meta = extractArticleMeta(path.join(NEWS_DIR, filename));
      const info: SitemapArticleInfo = {
        filename: parsed.filename,
        date: parsed.date,
        title: meta.title || formatSlug(parsed.slug),
        description: meta.description,
        slug: parsed.slug,
      };
      const bucket = articlesByLang.get(parsed.lang);
      if (bucket) {
        bucket.push(info);
      }
      rssItems.push({
        title: info.title,
        link: `${BASE_URL}/news/${info.filename}`,
        description: info.description || info.title,
        pubDate: new Date(parsed.date).toUTCString(),
        lang: parsed.lang,
      });
    }
  }

  // Check if docs directory exists
  const hasDocsDir = fs.existsSync(SITEMAP_DOCS_DIR);

  // Generate sitemap HTML for each language
  let htmlGenerated = 0;
  for (const lang of ALL_LANGUAGES) {
    const langArticles = articlesByLang.get(lang) ?? [];
    // Sort newest first
    langArticles.sort((a, b) => b.date.localeCompare(a.date));

    const html = generateSitemapHTML(lang, langArticles, hasDocsDir);
    const sitemapFilename = getSitemapFilename(lang);
    const sitemapPath = path.join(PROJECT_ROOT, sitemapFilename);
    fs.writeFileSync(sitemapPath, html, 'utf-8');
    console.log(`  ✅ Generated ${sitemapFilename} (${langArticles.length} articles)`);
    htmlGenerated++;
  }

  console.log(`✅ Generated ${htmlGenerated} sitemap HTML files`);

  // Sort RSS items newest first using numeric timestamps
  rssItems.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));

  const rss = generateRssFeed(rssItems);
  const rssPath = path.join(PROJECT_ROOT, 'rss.xml');
  fs.writeFileSync(rssPath, rss, 'utf-8');
  console.log(`✅ Generated rss.xml with ${rssItems.length} items`);
}

// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
