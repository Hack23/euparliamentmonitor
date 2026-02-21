// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/file-utils module
 * Tests shared file utilities and article parsing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';
import {
  getNewsArticles,
  parseArticleFilename,
  groupArticlesByLanguage,
  formatSlug,
  getModifiedDate,
  formatDateForSlug,
  calculateReadTime,
} from '../../scripts/utils/file-utils.js';

describe('utils/file-utils', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('parseArticleFilename', () => {
    it('should parse valid article filename', () => {
      const result = parseArticleFilename('2025-01-15-week-ahead-en.html');
      expect(result).toEqual({
        date: '2025-01-15',
        slug: 'week-ahead',
        lang: 'en',
        filename: '2025-01-15-week-ahead-en.html',
      });
    });

    it('should parse filename with complex slug', () => {
      const result = parseArticleFilename('2025-02-20-breaking-news-urgent-update-de.html');
      expect(result).toBeTruthy();
      expect(result.slug).toBe('breaking-news-urgent-update');
      expect(result.lang).toBe('de');
    });

    it('should return null for invalid filename', () => {
      expect(parseArticleFilename('invalid.html')).toBeNull();
      expect(parseArticleFilename('25-01-15-article-en.html')).toBeNull();
      expect(parseArticleFilename('2025-01-15-article.html')).toBeNull();
    });
  });

  describe('getNewsArticles', () => {
    it('should return empty array for non-existent directory', () => {
      const result = getNewsArticles(path.join(tempDir, 'non-existent'));
      expect(result).toEqual([]);
    });

    it('should filter only article HTML files', () => {
      const newsDir = path.join(tempDir, 'news');
      fs.mkdirSync(newsDir);
      fs.writeFileSync(path.join(newsDir, '2025-01-15-article-en.html'), 'content');
      fs.writeFileSync(path.join(newsDir, 'index-en.html'), 'content');
      fs.writeFileSync(path.join(newsDir, 'metadata.json'), 'content');

      const result = getNewsArticles(newsDir);
      expect(result).toHaveLength(1);
      expect(result).toContain('2025-01-15-article-en.html');
    });
  });

  describe('groupArticlesByLanguage', () => {
    it('should group articles by language code', () => {
      const articles = [
        '2025-01-15-article-en.html',
        '2025-01-16-article-en.html',
        '2025-01-15-article-de.html',
      ];

      const result = groupArticlesByLanguage(articles, ['en', 'de', 'fr']);
      expect(result.en).toHaveLength(2);
      expect(result.de).toHaveLength(1);
      expect(result.fr).toHaveLength(0);
    });

    it('should sort articles by date (newest first)', () => {
      const articles = [
        '2025-01-10-old-en.html',
        '2025-01-20-new-en.html',
        '2025-01-15-mid-en.html',
      ];

      const result = groupArticlesByLanguage(articles, ['en']);
      expect(result.en[0].date).toBe('2025-01-20');
      expect(result.en[1].date).toBe('2025-01-15');
      expect(result.en[2].date).toBe('2025-01-10');
    });
  });

  describe('formatSlug', () => {
    it('should format slug to title case', () => {
      expect(formatSlug('week-ahead')).toBe('Week Ahead');
    });

    it('should handle single word', () => {
      expect(formatSlug('breaking')).toBe('Breaking');
    });

    it('should handle empty string', () => {
      expect(formatSlug('')).toBe('');
    });
  });

  describe('getModifiedDate', () => {
    it('should return YYYY-MM-DD format', () => {
      const testFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(testFile, 'content');

      const result = getModifiedDate(testFile);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatDateForSlug', () => {
    it('should format current date as YYYY-MM-DD', () => {
      const result = formatDateForSlug();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should format specific date', () => {
      const result = formatDateForSlug(new Date('2025-06-15T12:00:00Z'));
      expect(result).toBe('2025-06-15');
    });
  });

  describe('calculateReadTime', () => {
    it('should calculate read time based on word count', () => {
      const content = Array(500).fill('word').join(' '); // 500 words
      expect(calculateReadTime(content)).toBe(2); // 500/250 = 2 min
    });

    it('should return at least 1 minute', () => {
      expect(calculateReadTime('short')).toBe(1);
    });

    it('should use custom words per minute', () => {
      const content = Array(100).fill('word').join(' ');
      expect(calculateReadTime(content, 100)).toBe(1);
    });
  });
});
