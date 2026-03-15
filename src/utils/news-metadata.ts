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
import {
  getNewsArticles,
  parseArticleFilename,
  formatSlug,
  extractArticleMeta,
} from './file-utils.js';
import type {
  ArticleMetadataEntry,
  NewsMetadataDatabase,
  IntelligenceIndex,
} from '../types/index.js';
import {
  createEmptyIndex,
  addArticleToIndex,
  detectTrends,
  saveIntelligenceIndex,
} from './intelligence-index.js';
import { detectCategory } from './article-category.js';

/** Default path for the metadata database file */
const METADATA_DB_PATH = path.join(NEWS_DIR, 'articles-metadata.json');

/**
 * Build metadata database from news article files
 *
 * @param newsDir - News directory path
 * @returns News metadata database object
 */
export function buildMetadataDatabase(newsDir: string = NEWS_DIR): NewsMetadataDatabase {
  const articleFiles = getNewsArticles(newsDir);
  const articles: ArticleMetadataEntry[] = [];

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
export function writeMetadataDatabase(
  database: NewsMetadataDatabase,
  outputPath: string = METADATA_DB_PATH
): void {
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
export function readMetadataDatabase(
  inputPath: string = METADATA_DB_PATH
): NewsMetadataDatabase | null {
  if (!fs.existsSync(inputPath)) {
    return null;
  }

  const content = fs.readFileSync(inputPath, 'utf-8');
  return JSON.parse(content) as NewsMetadataDatabase;
}

/**
 * Update metadata database by rescanning the news directory
 *
 * @param newsDir - News directory to scan
 * @param outputPath - Output path for metadata JSON
 * @returns Updated metadata database
 */
export function updateMetadataDatabase(
  newsDir: string = NEWS_DIR,
  outputPath: string = METADATA_DB_PATH
): NewsMetadataDatabase {
  const database = buildMetadataDatabase(newsDir);
  writeMetadataDatabase(database, outputPath);
  return database;
}

/** Default path for the intelligence index JSON file */
const INTELLIGENCE_INDEX_PATH = path.join(NEWS_DIR, 'intelligence-index.json');

/**
 * Scan the news directory, rebuild the intelligence index from article metadata,
 * and persist the updated index to disk.
 *
 * Starts from a fresh empty index on every call so that articles that have been
 * deleted or renamed are automatically pruned — no stale entries can survive.
 *
 * Each article file is parsed to extract its date, type, language, and metadata.
 * The resulting {@link ArticleIndexEntry} objects are accumulated into an
 * {@link IntelligenceIndex} whose trend detections are refreshed on every call.
 *
 * @param newsDir - News directory to scan for article HTML files
 * @param indexPath - Path to the intelligence index JSON file
 * @returns The rebuilt {@link IntelligenceIndex}
 */
export function updateIntelligenceIndex(
  newsDir: string = NEWS_DIR,
  indexPath: string = INTELLIGENCE_INDEX_PATH
): IntelligenceIndex {
  // Start from a fresh empty index so that deleted/renamed articles are pruned
  let index = createEmptyIndex();

  const articleFiles = getNewsArticles(newsDir);

  for (const filename of articleFiles) {
    const parsed = parseArticleFilename(filename);
    if (!parsed) continue;

    const articleId = `${parsed.date}-${parsed.slug}-${parsed.lang}`;

    const filepath = path.join(newsDir, filename);
    const meta = extractArticleMeta(filepath);

    // Derive the ArticleCategory from the slug using the shared detection logic
    const category = detectCategory(parsed.slug);

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
 * Stop-words excluded from key topic extraction.
 * Common English function words that carry no policy-domain meaning.
 * Expand this set as needed for EU Parliament domain-specific noise.
 */
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'has',
  'have',
  'had',
  'this',
  'that',
  'it',
  'its',
  'as',
  'not',
  'no',
]);

/**
 * Article-type taxonomy tokens that should be excluded from keyTopics
 * to prevent unrelated articles of the same type from appearing "related".
 */
const ARTICLE_TYPE_NOISE = new Set([
  'week',
  'month',
  'year',
  'ahead',
  'review',
  'breaking',
  'committee',
  'motions',
  'motion',
  'propositions',
  'proposition',
  'proposal',
  'deep',
  'analysis',
  'reports',
  'report',
  'news',
]);

/**
 * Extract meaningful words from a text string, excluding stop-words and
 * tokens shorter than `minLength`.
 *
 * Uses Unicode-aware character classes to preserve accented characters
 * (e.g. "é", "ü") and non-Latin scripts (AR, HE, JA, KO, ZH).
 *
 * @param text - Input text to tokenise
 * @param tokens - Set to accumulate tokens into
 * @param minLength - Minimum cleaned token length (inclusive)
 */
function extractTokens(text: string, tokens: Set<string>, minLength: number): void {
  for (const word of text.toLowerCase().split(/[\s\-_]+/)) {
    const cleaned = word.replace(/[^\p{L}\p{N}]/gu, '');
    if (
      cleaned.length >= minLength &&
      !STOP_WORDS.has(cleaned) &&
      !ARTICLE_TYPE_NOISE.has(cleaned)
    ) {
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
function deriveKeyTopics(slug: string, title?: string, description?: string): string[] {
  const tokens = new Set<string>();
  extractTokens(slug, tokens, MIN_SLUG_TOKEN_LENGTH);
  if (title) extractTokens(title, tokens, MIN_METADATA_TOKEN_LENGTH);
  if (description) extractTokens(description, tokens, MIN_METADATA_TOKEN_LENGTH);
  return [...tokens];
}
