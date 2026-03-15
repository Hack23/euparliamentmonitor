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
  updateIntelligenceIndex,
} from '../../scripts/utils/news-metadata.js';
import { loadIntelligenceIndex } from '../../scripts/utils/intelligence-index.js';

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

    it('should use real title from h1 when present in HTML', () => {
      const html =
        '<h1>Real Committee Title</h1><meta name="description" content="Real description here">';
      fs.writeFileSync(path.join(newsDir, '2025-03-01-committee-report-fr.html'), html);

      const db = buildMetadataDatabase(newsDir);

      expect(db.articles[0].title).toBe('Real Committee Title');
      expect(db.articles[0].description).toBe('Real description here');
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

  // ─── updateIntelligenceIndex ────────────────────────────────────────────────

  describe('updateIntelligenceIndex', () => {
    it('should build an intelligence index from article files and persist it', () => {
      // Create two articles with overlapping topics so trends are generated
      fs.writeFileSync(
        path.join(newsDir, '2025-01-15-green-deal-week-ahead-en.html'),
        '<html><head><meta name="description" content="Green Deal analysis"></head><body><h1>Green Deal Week Ahead</h1></body></html>'
      );
      fs.writeFileSync(
        path.join(newsDir, '2025-01-22-green-deal-week-ahead-en.html'),
        '<html><head><meta name="description" content="Green Deal follow-up"></head><body><h1>Green Deal Week Ahead 2</h1></body></html>'
      );

      const indexPath = path.join(tempDir, 'intelligence-index.json');
      const index = updateIntelligenceIndex(newsDir, indexPath);

      expect(index.articles).toHaveLength(2);
      expect(fs.existsSync(indexPath)).toBe(true);
      expect(index.lastUpdated).toBeDefined();
    });

    it('should extract key topics from article slugs and metadata', () => {
      fs.writeFileSync(
        path.join(newsDir, '2025-02-10-ai-regulation-committee-en.html'),
        '<html><head><meta name="description" content="Committee analysis of artificial intelligence"></head><body><h1>AI Regulation Committee Report</h1></body></html>'
      );

      const indexPath = path.join(tempDir, 'intelligence-index.json');
      const index = updateIntelligenceIndex(newsDir, indexPath);

      expect(index.articles).toHaveLength(1);
      const entry = index.articles[0];
      // Key topics should include tokens from slug ('regulation') and h1 title ('regulation')
      expect(entry.keyTopics.length).toBeGreaterThan(0);
      expect(entry.keyTopics).toContain('regulation');
    });

    it('should prune deleted articles when rebuilt', () => {
      // Create two articles
      const file1 = path.join(newsDir, '2025-01-15-week-ahead-en.html');
      const file2 = path.join(newsDir, '2025-01-22-analysis-en.html');
      fs.writeFileSync(file1, '<html></html>');
      fs.writeFileSync(file2, '<html></html>');

      const indexPath = path.join(tempDir, 'intelligence-index.json');

      // First build: 2 articles
      const index1 = updateIntelligenceIndex(newsDir, indexPath);
      expect(index1.articles).toHaveLength(2);

      // Delete one article
      fs.unlinkSync(file2);

      // Rebuild: should only have 1 article now
      const index2 = updateIntelligenceIndex(newsDir, indexPath);
      expect(index2.articles).toHaveLength(1);

      // Verify persisted index also has 1 article
      const loaded = loadIntelligenceIndex(indexPath);
      expect(loaded.articles).toHaveLength(1);
    });

    it('should detect trends when articles share topics', () => {
      // Create articles sharing the topic "digital" via slug
      fs.writeFileSync(
        path.join(newsDir, '2025-03-01-digital-regulation-week-ahead-en.html'),
        '<html><head></head><body><h1>Digital Regulation</h1></body></html>'
      );
      fs.writeFileSync(
        path.join(newsDir, '2025-03-08-digital-markets-week-ahead-en.html'),
        '<html><head></head><body><h1>Digital Markets</h1></body></html>'
      );

      const indexPath = path.join(tempDir, 'intelligence-index.json');
      const index = updateIntelligenceIndex(newsDir, indexPath);

      // Both articles should share "digital" topic, triggering trend detection
      expect(index.trends.length).toBeGreaterThanOrEqual(1);
      const digitalTrend = index.trends.find((t) => t.name.toLowerCase().includes('digital'));
      expect(digitalTrend).toBeDefined();
      expect(digitalTrend.articleReferences.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty news directory', () => {
      const indexPath = path.join(tempDir, 'intelligence-index.json');
      const index = updateIntelligenceIndex(newsDir, indexPath);

      expect(index.articles).toHaveLength(0);
      expect(index.trends).toHaveLength(0);
    });

    it('should only use slug tokens for non-English articles', () => {
      // Non-English article: title/description tokens should be excluded
      // because STOP_WORDS is English-only
      fs.writeFileSync(
        path.join(newsDir, '2025-04-01-environnement-politique-fr.html'),
        '<html><head><meta name="description" content="Analyse de la politique"></head><body><h1>Environnement et politique européenne</h1></body></html>'
      );

      const indexPath = path.join(tempDir, 'intelligence-index.json');
      const index = updateIntelligenceIndex(newsDir, indexPath);

      expect(index.articles).toHaveLength(1);
      const entry = index.articles[0];
      // Slug tokens should be present
      expect(entry.keyTopics).toContain('environnement');
      expect(entry.keyTopics).toContain('politique');
      // Title/description tokens like "analyse", "européenne" should NOT be present
      // because non-English articles only use slug tokenisation
      expect(entry.keyTopics).not.toContain('analyse');
      expect(entry.keyTopics).not.toContain('européenne');
    });
  });
});
