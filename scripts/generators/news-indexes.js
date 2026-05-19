#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/NewsIndexes
 * @description Generates index.html files for each language listing all news
 * articles. English is the primary homepage (index.html); other languages use
 * index-{lang}.html. Design follows riksdagsmonitor patterns: compact language
 * switcher, Hack23 AB footer.
 *
 * Refactor 8/8 split the original 959-LOC monolith into three modules:
 *   - {@link ./news-indexes/per-language.js} — pure HTML composer
 *     (`generateIndexHTML`, `getIndexFilename`) — no file I/O.
 *   - {@link ./news-indexes/backfill.js} — legacy SEO/hreflang/JSON-LD healing
 *     (`backfillLegacyArticleSeo`, `healJsonLdDescriptionCorruption`,
 *     `backfillArticleHreflang`, `applyArticleSeoBackfill`,
 *     `buildLegacyBackfillDescription`).
 *   - This file — top-level `main()` orchestration: discovery,
 *     metadata-map construction, database write, per-language atomic write.
 *
 * All previously-public exports are re-exported here so existing callers and
 * the regression test suites in `test/unit/news-indexes-*.test.js` keep
 * working unchanged.
 */
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import { PROJECT_ROOT, NEWS_DIR } from '../constants/config.js';
import { ALL_LANGUAGES } from '../constants/languages.js';
import { getNewsArticles, groupArticlesByLanguage, formatSlug, parseArticleFilename, extractArticleMeta, atomicWrite, } from '../utils/file-utils.js';
import { writeMetadataDatabase } from '../utils/news-metadata.js';
import { generateIndexHTML, getIndexFilename } from './news-indexes/per-language.js';
import { backfillLegacyArticleSeo, backfillArticleHreflang, healJsonLdDescriptionCorruption, applyArticleSeoBackfill, buildLegacyBackfillDescription, } from './news-indexes/backfill.js';
// Re-export the public API surface — tests and other generators import from
// the barrel, the file split is an internal implementation detail.
export { generateIndexHTML, getIndexFilename, backfillLegacyArticleSeo, backfillArticleHreflang, healJsonLdDescriptionCorruption, applyArticleSeoBackfill, buildLegacyBackfillDescription, };
/**
 * Main execution - generates index files for all languages.
 * English generates index.html (primary homepage), others generate index-{lang}.html.
 */
function main() {
    console.log('📰 Generating news indexes...');
    const articles = getNewsArticles();
    console.log(`📊 Found ${articles.length} articles`);
    const backfilled = backfillLegacyArticleSeo(articles);
    if (backfilled > 0) {
        console.log(`🔎 Backfilled SEO metadata for ${backfilled} legacy article file(s)`);
    }
    const healed = healJsonLdDescriptionCorruption(articles);
    if (healed > 0) {
        console.log(`🩹 Healed JSON-LD description corruption in ${healed} article file(s)`);
    }
    const hreflangBackfilled = backfillArticleHreflang(articles);
    if (hreflangBackfilled > 0) {
        console.log(`🔗 Backfilled hreflang links for ${hreflangBackfilled} article file(s)`);
    }
    const grouped = groupArticlesByLanguage(articles, ALL_LANGUAGES);
    const metaBuildTimerLabel = `⏱️ Built metadata map for ${articles.length} articles`;
    console.time(metaBuildTimerLabel);
    const metaMap = new Map();
    for (const filename of articles) {
        const filepath = path.join(NEWS_DIR, filename);
        metaMap.set(filename, extractArticleMeta(filepath));
    }
    console.timeEnd(metaBuildTimerLabel);
    const dbArticles = articles
        .map((filename) => {
        const parsed = parseArticleFilename(filename);
        if (!parsed)
            return null;
        const meta = metaMap.get(filename) ?? { title: '', description: '' };
        return {
            filename: parsed.filename,
            date: parsed.date,
            slug: parsed.slug,
            lang: parsed.lang,
            title: meta.title || formatSlug(parsed.slug),
            description: meta.description,
        };
    })
        .filter((e) => e !== null);
    dbArticles.sort((a, b) => b.date.localeCompare(a.date));
    writeMetadataDatabase({ lastUpdated: new Date().toISOString(), articles: dbArticles });
    console.log('📝 Updated articles metadata database');
    let generated = 0;
    for (const lang of ALL_LANGUAGES) {
        const langArticles = grouped[lang] ?? [];
        const html = generateIndexHTML(lang, langArticles, metaMap);
        const filename = getIndexFilename(lang);
        const filepath = path.join(PROJECT_ROOT, filename);
        atomicWrite(filepath, html);
        console.log(`  ✅ Generated ${filename} (${langArticles.length} articles)`);
        generated++;
    }
    console.log(`✅ Generated ${generated} index files`);
}
// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main();
}
//# sourceMappingURL=news-indexes.js.map