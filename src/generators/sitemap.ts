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
import { BASE_URL, BUILD_TIME, NEWS_DIR, PROJECT_ROOT } from '../constants/config.js';
import { ALL_LANGUAGES } from '../constants/languages.js';
import {
  getNewsArticles,
  parseArticleFilename,
  formatSlug,
  extractArticleMeta,
  writeFileIfChanged,
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

/** Console label for a freshly written file. */
const LABEL_GENERATED = '✅ Generated';
/** Console label for a file left untouched (byte-identical to existing). */
const LABEL_UNCHANGED = '·  Unchanged';

/**
 * Pick the appropriate write/unchanged label for log output.
 *
 * @param wrote - `true` when the underlying writer actually wrote bytes
 *                (file was created or content changed); `false` when the
 *                writer skipped because the destination was already
 *                byte-identical.
 * @returns Human-readable status label including emoji prefix.
 */
function writeLabel(wrote: boolean): string {
  return wrote ? LABEL_GENERATED : LABEL_UNCHANGED;
}

/**
 * Render every `political-intelligence_<lang>.html` page idempotently —
 * extracted from {@link main} to keep its cognitive complexity in check.
 *
 * @param piData - Pre-collected political-intelligence dataset shared
 *                 across every language render (avoids re-walking the
 *                 analysis tree per language).
 */
function writePoliticalIntelligencePages(
  piData: ReturnType<typeof collectPoliticalIntelligenceData>
): void {
  let written = 0;
  let unchanged = 0;
  for (const lang of ALL_LANGUAGES) {
    const piHtml = generatePoliticalIntelligenceHTML(lang, piData);
    const piFilename = getPoliticalIntelligenceFilename(lang);
    const piPath = path.join(PROJECT_ROOT, piFilename);
    const wrote = writeFileIfChanged(piPath, piHtml);
    console.log(`  ${writeLabel(wrote)} ${piFilename}`);
    if (wrote) written++;
    else unchanged++;
  }
  console.log(`✅ Political-intelligence HTML: ${written} written, ${unchanged} unchanged`);
}

/**
 * Build the per-language article info buckets and the flat RSS-item list
 * from a list of news article filenames.
 *
 * @param articles - Article filenames returned by {@link getNewsArticles}
 *                   (each in the canonical `YYYY-MM-DD-slug-<lang>.html`
 *                   form parsed by {@link parseArticleFilename}).
 * @returns Object with `articlesByLang` (per-language bucket map) and a
 *          flat `rssItems` array suitable for {@link generateRssFeed}.
 */
function partitionArticles(articles: string[]): {
  articlesByLang: Map<string, SitemapArticleInfo[]>;
  rssItems: RssItem[];
} {
  const articlesByLang = new Map<string, SitemapArticleInfo[]>();
  const rssItems: RssItem[] = [];
  for (const lang of ALL_LANGUAGES) {
    articlesByLang.set(lang, []);
  }
  for (const filename of articles) {
    const parsed = parseArticleFilename(filename);
    if (!parsed) continue;
    const meta = extractArticleMeta(path.join(NEWS_DIR, filename));
    const info: SitemapArticleInfo = {
      filename: parsed.filename,
      date: parsed.date,
      title: meta.title || formatSlug(parsed.slug),
      description: meta.description,
      slug: parsed.slug,
    };
    const bucket = articlesByLang.get(parsed.lang);
    if (bucket) bucket.push(info);
    rssItems.push({
      title: info.title,
      link: `${BASE_URL}/news/${info.filename}`,
      description: info.description || info.title,
      pubDate: new Date(parsed.date).toUTCString(),
      lang: parsed.lang,
    });
  }
  return { articlesByLang, rssItems };
}

/**
 * Render every `sitemap_<lang>.html` page idempotently.
 *
 * @param articlesByLang - Per-language article buckets returned by
 *                         {@link partitionArticles}.
 * @param hasDocsDir - Whether the `docs/` directory exists; controls
 *                     whether the rendered HTML includes the docs section.
 */
function writeSitemapHtmlPages(
  articlesByLang: Map<string, SitemapArticleInfo[]>,
  hasDocsDir: boolean
): void {
  let written = 0;
  let unchanged = 0;
  for (const lang of ALL_LANGUAGES) {
    const langArticles = articlesByLang.get(lang) ?? [];
    langArticles.sort((a, b) => b.date.localeCompare(a.date));

    const html = generateSitemapHTML(lang, langArticles, hasDocsDir);
    const sitemapFilename = getSitemapFilename(lang);
    const sitemapPath = path.join(PROJECT_ROOT, sitemapFilename);
    const wrote = writeFileIfChanged(sitemapPath, html);
    console.log(
      `  ${writeLabel(wrote)} ${sitemapFilename} (${langArticles.length} articles)`
    );
    if (wrote) written++;
    else unchanged++;
  }
  console.log(`✅ Sitemap HTML: ${written} written, ${unchanged} unchanged`);
}

/**
 * Main execution — generates `sitemap.xml`, the 14 `political-intelligence_<lang>.html`
 * pages, the 14 `sitemap_<lang>.html` pages, and `rss.xml`.
 */
function main(): void {
  console.log('🗺️ Generating sitemap...');

  const articles = getNewsArticles();
  console.log(`📊 Found ${articles.length} articles`);

  const docsFiles = collectDocsHtmlFiles(SITEMAP_DOCS_DIR);
  console.log(`📚 Found ${docsFiles.length} docs files`);

  const sitemap = generateSitemap(articles, docsFiles);
  const filepath = path.join(PROJECT_ROOT, 'sitemap.xml');
  const sitemapWrote = writeFileIfChanged(filepath, sitemap);
  const totalUrls = articles.length + ALL_LANGUAGES.length * 3 + docsFiles.length + 1;
  console.log(`${writeLabel(sitemapWrote)} sitemap.xml with ${totalUrls} URLs`);

  const piData = collectPoliticalIntelligenceData(PROJECT_ROOT);
  console.log(
    `🧭 Scanned analysis tradecraft: ${piData.methodologies.length} methodologies, ${piData.templates.length} templates, ${piData.dailyGroups.length} daily groups`
  );
  writePoliticalIntelligencePages(piData);

  const { articlesByLang, rssItems } = partitionArticles(articles);
  const hasDocsDir = fs.existsSync(SITEMAP_DOCS_DIR);
  writeSitemapHtmlPages(articlesByLang, hasDocsDir);

  rssItems.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate));

  // Pin <lastBuildDate> to BUILD_TIME so re-running on the same source
  // produces a byte-identical rss.xml — keeps `aws s3 sync` from
  // re-uploading the feed on every deploy when no articles changed.
  const buildDateRfc822 = new Date(BUILD_TIME).toUTCString();
  const rss = generateRssFeed(rssItems, buildDateRfc822);
  const rssPath = path.join(PROJECT_ROOT, 'rss.xml');
  const rssWrote = writeFileIfChanged(rssPath, rss);
  console.log(`${writeLabel(rssWrote)} rss.xml with ${rssItems.length} items`);
}

// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
