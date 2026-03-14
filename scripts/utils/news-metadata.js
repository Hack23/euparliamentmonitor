// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/NewsMetadata
 * @description News metadata database management.
 * Maintains a JSON database of article metadata that can be loaded
 * by client-side JavaScript, removing the need to edit all index HTML
 * files when adding new articles.
 */
import fs from 'fs';
import path from 'path';
import { NEWS_DIR } from '../constants/config.js';
import { getNewsArticles, parseArticleFilename, formatSlug, extractArticleMeta, } from './file-utils.js';
import { loadIntelligenceIndex, addArticleToIndex, detectTrends, saveIntelligenceIndex, } from './intelligence-index.js';
import { ArticleCategory } from '../types/common.js';
/** Default path for the metadata database file */
const METADATA_DB_PATH = path.join(NEWS_DIR, 'articles-metadata.json');
/**
 * Build metadata database from news article files
 *
 * @param newsDir - News directory path
 * @returns News metadata database object
 */
export function buildMetadataDatabase(newsDir = NEWS_DIR) {
    const articleFiles = getNewsArticles(newsDir);
    const articles = [];
    for (const filename of articleFiles) {
        const parsed = parseArticleFilename(filename);
        if (parsed) {
            const filepath = path.join(newsDir, filename);
            const meta = extractArticleMeta(filepath);
            articles.push({
                filename: parsed.filename,
                date: parsed.date,
                slug: parsed.slug,
                lang: parsed.lang,
                title: meta.title || formatSlug(parsed.slug),
                description: meta.description,
            });
        }
    }
    // Sort by date (newest first)
    articles.sort((a, b) => b.date.localeCompare(a.date));
    return {
        lastUpdated: new Date().toISOString(),
        articles,
    };
}
/**
 * Write metadata database to JSON file
 *
 * @param database - Metadata database to write
 * @param outputPath - Output file path (defaults to news/articles-metadata.json)
 */
export function writeMetadataDatabase(database, outputPath = METADATA_DB_PATH) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(database, null, 2), 'utf-8');
}
/**
 * Read metadata database from JSON file
 *
 * @param inputPath - Input file path (defaults to news/articles-metadata.json)
 * @returns Metadata database or null if file doesn't exist
 */
export function readMetadataDatabase(inputPath = METADATA_DB_PATH) {
    if (!fs.existsSync(inputPath)) {
        return null;
    }
    const content = fs.readFileSync(inputPath, 'utf-8');
    return JSON.parse(content);
}
/**
 * Update metadata database by rescanning the news directory
 *
 * @param newsDir - News directory to scan
 * @param outputPath - Output path for metadata JSON
 * @returns Updated metadata database
 */
export function updateMetadataDatabase(newsDir = NEWS_DIR, outputPath = METADATA_DB_PATH) {
    const database = buildMetadataDatabase(newsDir);
    writeMetadataDatabase(database, outputPath);
    return database;
}
/** Default path for the intelligence index JSON file */
const INTELLIGENCE_INDEX_PATH = path.join(NEWS_DIR, 'intelligence-index.json');
/**
 * Scan the news directory, build or update the intelligence index from article metadata,
 * and persist the updated index to disk.
 *
 * Each article file is parsed to extract its date, type, language, and metadata.
 * The resulting {@link ArticleIndexEntry} objects are accumulated into an
 * {@link IntelligenceIndex} whose trend detections are refreshed on every call.
 *
 * @param newsDir - News directory to scan for article HTML files
 * @param indexPath - Path to the intelligence index JSON file
 * @returns The updated {@link IntelligenceIndex}
 */
export function updateIntelligenceIndex(newsDir = NEWS_DIR, indexPath = INTELLIGENCE_INDEX_PATH) {
    let index = loadIntelligenceIndex(indexPath);
    const articleFiles = getNewsArticles(newsDir);
    for (const filename of articleFiles) {
        const parsed = parseArticleFilename(filename);
        if (!parsed)
            continue;
        const articleId = `${parsed.date}-${parsed.slug}-${parsed.lang}`;
        // Skip if already indexed
        if (index.articles.some((a) => a.id === articleId))
            continue;
        const filepath = path.join(newsDir, filename);
        const meta = extractArticleMeta(filepath);
        // Derive the ArticleCategory from the slug; fall back to a sensible default
        const category = deriveArticleCategory(parsed.slug);
        // Extract meaningful key topics from the slug and article metadata
        const keyTopics = deriveKeyTopics(parsed.slug, meta.title, meta.description);
        const entry = {
            id: articleId,
            date: parsed.date,
            type: category,
            lang: parsed.lang,
            keyTopics,
            keyActors: [],
            procedures: [],
            crossReferences: [],
            trendContributions: [],
        };
        index = addArticleToIndex(index, entry);
    }
    // Refresh trend detections
    const trends = detectTrends(index);
    index = { ...index, trends, lastUpdated: new Date().toISOString() };
    saveIntelligenceIndex(index, indexPath);
    return index;
}
/**
 * Derive the closest matching {@link ArticleCategory} from an article slug.
 *
 * @param slug - Article slug extracted from filename
 * @returns Best-matching {@link ArticleCategory}
 */
function deriveArticleCategory(slug) {
    const lower = slug.toLowerCase();
    if (lower.includes('week-ahead') || lower.includes('weekahead'))
        return ArticleCategory.WEEK_AHEAD;
    if (lower.includes('month-ahead') || lower.includes('monthahead'))
        return ArticleCategory.MONTH_AHEAD;
    if (lower.includes('year-ahead') || lower.includes('yearahead'))
        return ArticleCategory.YEAR_AHEAD;
    if (lower.includes('week-in-review') || lower.includes('weekinreview'))
        return ArticleCategory.WEEK_IN_REVIEW;
    if (lower.includes('month-in-review') || lower.includes('monthinreview'))
        return ArticleCategory.MONTH_IN_REVIEW;
    if (lower.includes('year-in-review') || lower.includes('yearinreview'))
        return ArticleCategory.YEAR_IN_REVIEW;
    if (lower.includes('breaking'))
        return ArticleCategory.BREAKING_NEWS;
    if (lower.includes('committee'))
        return ArticleCategory.COMMITTEE_REPORTS;
    if (lower.includes('motion'))
        return ArticleCategory.MOTIONS;
    if (lower.includes('proposition') || lower.includes('proposal'))
        return ArticleCategory.PROPOSITIONS;
    if (lower.includes('deep') || lower.includes('analysis'))
        return ArticleCategory.DEEP_ANALYSIS;
    return ArticleCategory.WEEK_AHEAD;
}
/**
 * Stop-words excluded from key topic extraction.
 * Common English function words that carry no policy-domain meaning.
 * Expand this set as needed for EU Parliament domain-specific noise.
 */
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'has', 'have', 'had', 'this', 'that', 'it', 'its', 'as', 'not', 'no',
]);
/**
 * Extract meaningful words from a text string, excluding stop-words and
 * tokens shorter than `minLength`.
 *
 * @param text - Input text to tokenise
 * @param tokens - Set to accumulate tokens into
 * @param minLength - Minimum cleaned token length (inclusive)
 */
function extractTokens(text, tokens, minLength) {
    for (const word of text.toLowerCase().split(/[\s\-_]+/)) {
        const cleaned = word.replace(/[^a-z0-9]/g, '');
        if (cleaned.length >= minLength && !STOP_WORDS.has(cleaned)) {
            tokens.add(cleaned);
        }
    }
}
/** Minimum token length for slug-derived topics (shorter segments are too generic) */
const MIN_SLUG_TOKEN_LENGTH = 3;
/** Minimum token length for title/description-derived topics (stricter to reduce noise) */
const MIN_METADATA_TOKEN_LENGTH = 4;
/**
 * Derive key topics from the article slug and extracted metadata.
 *
 * Splits the slug on hyphens to produce topic tokens and appends any
 * meaningful words from the title and description. Common stop-words
 * and very short tokens are filtered out.
 *
 * @param slug - Article slug (e.g. "week-ahead" or "breaking")
 * @param title - Article title extracted from HTML (may be empty)
 * @param description - Article description extracted from HTML (may be empty)
 * @returns Deduplicated array of key topic strings
 */
function deriveKeyTopics(slug, title, description) {
    const tokens = new Set();
    extractTokens(slug, tokens, MIN_SLUG_TOKEN_LENGTH);
    if (title)
        extractTokens(title, tokens, MIN_METADATA_TOKEN_LENGTH);
    if (description)
        extractTokens(description, tokens, MIN_METADATA_TOKEN_LENGTH);
    return [...tokens];
}
//# sourceMappingURL=news-metadata.js.map