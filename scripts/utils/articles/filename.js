// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/Articles/Filename
 * @description Article-filename parsing, directory enumeration, and
 * per-language grouping helpers.
 */
import fs from 'fs';
import path from 'path';
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN } from '../../constants/config.js';
import { ALL_LANGUAGES } from '../../constants/language-core.js';
/**
 * Get all news article HTML files from the news directory
 *
 * @param newsDir - News directory path (defaults to NEWS_DIR)
 * @returns List of article filenames
 */
export function getNewsArticles(newsDir = NEWS_DIR) {
    if (!fs.existsSync(newsDir)) {
        console.log('📁 News directory does not exist yet');
        return [];
    }
    const files = fs.readdirSync(newsDir);
    return files.filter((f) => f.endsWith('.html') && !f.startsWith('index-'));
}
/**
 * Parse article filename to extract metadata
 *
 * @param filename - Article filename (e.g., "2025-01-15-week-ahead-en.html")
 * @returns Parsed metadata or null if filename doesn't match pattern
 */
export function parseArticleFilename(filename) {
    const match = filename.match(ARTICLE_FILENAME_PATTERN);
    if (!match) {
        return null;
    }
    const langCandidate = match[3];
    if (!ALL_LANGUAGES.includes(langCandidate)) {
        return null;
    }
    return {
        date: match[1],
        slug: match[2],
        lang: langCandidate,
        filename,
    };
}
/**
 * Group articles by language code
 *
 * @param articles - List of article filenames
 * @param languages - Supported language codes
 * @returns Articles grouped by language, sorted newest first
 */
export function groupArticlesByLanguage(articles, languages) {
    const grouped = {};
    for (const lang of languages) {
        grouped[lang] = [];
    }
    for (const article of articles) {
        const parsed = parseArticleFilename(article);
        if (parsed) {
            const bucket = grouped[parsed.lang];
            if (bucket) {
                bucket.push(parsed);
            }
        }
    }
    for (const lang in grouped) {
        const bucket = grouped[lang];
        if (bucket) {
            bucket.sort((a, b) => b.date.localeCompare(a.date));
        }
    }
    return grouped;
}
/**
 * Check whether a news article file already exists on disk.
 *
 * This is used by generation pipelines to skip work when a prior workflow run
 * (or the same run) has already produced the article, avoiding unnecessary
 * regeneration and potential merge conflicts.
 *
 * @param slug - Article slug including date prefix (e.g. `"2025-01-15-week-ahead"`)
 * @param lang - Language code (e.g. `"en"`)
 * @param newsDir - Absolute path to the news output directory (defaults to NEWS_DIR)
 * @returns `true` when the article file exists
 */
export function checkArticleExists(slug, lang, newsDir = NEWS_DIR) {
    const filename = `${slug}-${lang}.html`;
    return fs.existsSync(path.join(newsDir, filename));
}
//# sourceMappingURL=filename.js.map