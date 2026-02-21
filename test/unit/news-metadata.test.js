// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/news-metadata module
 * Tests news metadata database operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';
import {
  buildMetadataDatabase,
  writeMetadataDatabase,
  readMetadataDatabase,
} from '../../scripts/utils/news-metadata.js';

describe('utils/news-metadata', () => {
  let tempDir;
  let newsDir;

  beforeEach(() => {
    tempDir = createTempDir();
    newsDir = path.join(tempDir, 'news');
    fs.mkdirSync(newsDir);
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('buildMetadataDatabase', () => {
    it('should build database from article files', () => {
      fs.writeFileSync(path.join(newsDir, '2025-01-15-week-ahead-en.html'), '<html></html>');
      fs.writeFileSync(path.join(newsDir, '2025-01-16-analysis-de.html'), '<html></html>');

      const db = buildMetadataDatabase(newsDir);

      expect(db.articles).toHaveLength(2);
      expect(db.lastUpdated).toBeDefined();
      expect(db.articles[0].date).toBe('2025-01-16'); // Sorted newest first
      expect(db.articles[1].date).toBe('2025-01-15');
    });

    it('should extract metadata from filenames', () => {
      fs.writeFileSync(path.join(newsDir, '2025-03-01-committee-report-fr.html'), '<html></html>');

      const db = buildMetadataDatabase(newsDir);

      expect(db.articles).toHaveLength(1);
      expect(db.articles[0].filename).toBe('2025-03-01-committee-report-fr.html');
      expect(db.articles[0].date).toBe('2025-03-01');
      expect(db.articles[0].slug).toBe('committee-report');
      expect(db.articles[0].lang).toBe('fr');
      expect(db.articles[0].title).toBe('Committee Report');
    });

    it('should handle empty news directory', () => {
      const db = buildMetadataDatabase(newsDir);
      expect(db.articles).toHaveLength(0);
    });

    it('should skip non-article files', () => {
      fs.writeFileSync(path.join(newsDir, 'index-en.html'), '<html></html>');
      fs.writeFileSync(path.join(newsDir, 'metadata.json'), '{}');
      fs.writeFileSync(path.join(newsDir, '2025-01-15-article-en.html'), '<html></html>');

      const db = buildMetadataDatabase(newsDir);
      expect(db.articles).toHaveLength(1);
    });
  });

  describe('writeMetadataDatabase / readMetadataDatabase', () => {
    it('should write and read metadata database', () => {
      const dbPath = path.join(tempDir, 'test-metadata.json');
      const database = {
        lastUpdated: '2025-01-15T00:00:00Z',
        articles: [
          {
            filename: '2025-01-15-article-en.html',
            date: '2025-01-15',
            slug: 'article',
            lang: 'en',
            title: 'Article',
          },
        ],
      };

      writeMetadataDatabase(database, dbPath);
      const result = readMetadataDatabase(dbPath);

      expect(result).toEqual(database);
    });

    it('should return null for non-existent file', () => {
      const result = readMetadataDatabase(path.join(tempDir, 'nonexistent.json'));
      expect(result).toBeNull();
    });

    it('should create parent directory if it does not exist', () => {
      const deepPath = path.join(tempDir, 'deep', 'nested', 'metadata.json');
      const database = { lastUpdated: '2025-01-15T00:00:00Z', articles: [] };

      writeMetadataDatabase(database, deepPath);
      expect(fs.existsSync(deepPath)).toBe(true);
      const result = readMetadataDatabase(deepPath);
      expect(result).toEqual(database);
    });
  });

  describe('updateMetadataDatabase', () => {
    it('should build and write metadata in one step', async () => {
      const { updateMetadataDatabase } = await import('../../scripts/utils/news-metadata.js');
      fs.writeFileSync(path.join(newsDir, '2025-01-15-article-en.html'), '<html></html>');
      const outputPath = path.join(tempDir, 'update-test.json');

      const result = updateMetadataDatabase(newsDir, outputPath);

      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].slug).toBe('article');
      expect(fs.existsSync(outputPath)).toBe(true);
    });
  });
});
