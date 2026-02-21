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
import { getNewsArticles, parseArticleFilename } from './file-utils.js';
import { formatSlug } from './file-utils.js';
import type { ArticleMetadataEntry, NewsMetadataDatabase } from '../types/index.js';

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
      articles.push({
        filename: parsed.filename,
        date: parsed.date,
        slug: parsed.slug,
        lang: parsed.lang,
        title: formatSlug(parsed.slug),
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
