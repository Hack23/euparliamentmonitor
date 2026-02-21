#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Sitemap
 * @description Generates sitemap.xml for all news articles
 */
import fs from 'fs';
import path from 'path';
import { NEWS_DIR, BASE_URL, PROJECT_ROOT } from '../constants/config.js';
import { ALL_LANGUAGES } from '../constants/languages.js';
import { getNewsArticles, getModifiedDate } from '../utils/file-utils.js';
/**
 * Generate sitemap XML
 *
 * @param articles - List of article filenames
 * @returns Complete sitemap XML string
 */
export function generateSitemap(articles) {
    const urls = [];
    // Add home pages for each language
    for (const lang of ALL_LANGUAGES) {
        urls.push({
            loc: `${BASE_URL}/index-${lang}.html`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: '1.0',
        });
    }
    // Add news articles
    for (const article of articles) {
        const filepath = path.join(NEWS_DIR, article);
        const lastmod = getModifiedDate(filepath);
        urls.push({
            loc: `${BASE_URL}/news/${article}`,
            lastmod,
            changefreq: 'monthly',
            priority: '0.8',
        });
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map((url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`)
        .join('\n')}
</urlset>`;
}
/**
 * Main execution
 */
function main() {
    console.log('🗺️ Generating sitemap...');
    const articles = getNewsArticles();
    console.log(`📊 Found ${articles.length} articles`);
    const sitemap = generateSitemap(articles);
    const filepath = path.join(PROJECT_ROOT, 'sitemap.xml');
    fs.writeFileSync(filepath, sitemap, 'utf-8');
    console.log(`✅ Generated sitemap.xml with ${articles.length + 14} URLs`);
}
main();
//# sourceMappingURL=sitemap.js.map