// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/file-utils module
 * Tests shared file utilities and article parsing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
  mergeManifestHistory,
  readLatestGateResult,
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

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', async () => {
      const { ensureDirectoryExists } = await import('../../scripts/utils/file-utils.js');
      const newDir = path.join(tempDir, 'new-dir', 'sub-dir');
      expect(fs.existsSync(newDir)).toBe(false);
      ensureDirectoryExists(newDir);
      expect(fs.existsSync(newDir)).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
      const { ensureDirectoryExists } = await import('../../scripts/utils/file-utils.js');
      ensureDirectoryExists(tempDir);
      expect(fs.existsSync(tempDir)).toBe(true);
    });
  });

  describe('writeFileContent', () => {
    it('should write content to file and create parent dirs', async () => {
      const { writeFileContent } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'sub', 'test-output.txt');
      writeFileContent(filePath, 'hello world');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('hello world');
    });

    it('should overwrite existing file', async () => {
      const { writeFileContent } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'overwrite.txt');
      writeFileContent(filePath, 'first');
      writeFileContent(filePath, 'second');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('second');
    });
  });

  describe('extractArticleMeta', () => {
    it('should extract title from h1 element', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'article.html');
      fs.writeFileSync(
        filePath,
        '<h1>My Real Title</h1><meta name="description" content="My description">'
      );
      const meta = extractArticleMeta(filePath);
      expect(meta.title).toBe('My Real Title');
    });

    it('should extract description from meta description tag', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'article2.html');
      fs.writeFileSync(
        filePath,
        '<h1>Title</h1><meta name="description" content="The real description here">'
      );
      const meta = extractArticleMeta(filePath);
      expect(meta.description).toBe('The real description here');
    });

    it('should return empty strings for file with no matching elements', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'empty.html');
      fs.writeFileSync(filePath, '<html><body><p>No h1 here</p></body></html>');
      const meta = extractArticleMeta(filePath);
      expect(meta.title).toBe('');
      expect(meta.description).toBe('');
    });

    it('should decode HTML entities in extracted values', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'article-entities.html');
      fs.writeFileSync(
        filePath,
        '<h1>EU &amp; Parliament: Tom&#39;s &quot;Report&quot;</h1><meta name="description" content="Cost &lt;100&gt; &amp; more">'
      );
      const meta = extractArticleMeta(filePath);
      expect(meta.title).toBe('EU & Parliament: Tom\'s "Report"');
      expect(meta.description).toBe('Cost <100> & more');
    });

    it('should use the first h1 when multiple h1 tags are present', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'article-multiple-h1.html');
      fs.writeFileSync(
        filePath,
        '<h1>First Title</h1><p>Some content</p><h1>Second Title</h1><meta name="description" content="Description">'
      );
      const meta = extractArticleMeta(filePath);
      expect(meta.title).toBe('First Title');
    });

    it('should use the first meta description when multiple description tags are present', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'article-multiple-meta.html');
      fs.writeFileSync(
        filePath,
        '<h1>Title</h1><meta name="description" content="First description"><meta name="description" content="Second description">'
      );
      const meta = extractArticleMeta(filePath);
      expect(meta.description).toBe('First description');
    });

    it('should handle malformed or unclosed tags gracefully', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'article-malformed.html');
      fs.writeFileSync(
        filePath,
        '<html><body><h1>Broken Title<p>Some text<meta name="description" content="Desc"></body></html>'
      );
      const meta = extractArticleMeta(filePath);
      expect(typeof meta.title).toBe('string');
      expect(typeof meta.description).toBe('string');
    });

    it('should extract title when h1 has custom attributes', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'article-h1-attr.html');
      fs.writeFileSync(
        filePath,
        '<h1 class="main-title">Title with attributes</h1><meta name="description" content="Desc">'
      );
      const meta = extractArticleMeta(filePath);
      expect(meta.title).toBe('Title with attributes');
    });

    it('should return empty strings for non-existent file', async () => {
      const { extractArticleMeta } = await import('../../scripts/utils/file-utils.js');
      const meta = extractArticleMeta(path.join(tempDir, 'nonexistent.html'));
      expect(meta.title).toBe('');
      expect(meta.description).toBe('');
    });
  });

  describe('atomicWrite', () => {
    it('should write content to a new file atomically', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'atomic.txt');
      atomicWrite(filePath, 'atomic content');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('atomic content');
    });

    it('should overwrite existing file atomically', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'atomic-overwrite.txt');
      fs.writeFileSync(filePath, 'old content', 'utf-8');
      atomicWrite(filePath, 'new content');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('new content');
    });

    it('should create parent directories if they do not exist', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'sub', 'dir', 'atomic-nested.txt');
      atomicWrite(filePath, 'nested content');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('nested content');
    });

    it('should not leave a temp file after successful write', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'atomic-clean.txt');
      atomicWrite(filePath, 'clean');
      // Unique temp files use pattern: {filepath}.{pid}-{uuid}.tmp
      const targetBase = path.basename(filePath);
      const siblings = fs.readdirSync(tempDir);
      const temps = siblings.filter((f) => f.startsWith(`${targetBase}.`) && f.endsWith('.tmp'));
      expect(temps).toHaveLength(0);
    });

    it('should produce a file with the exact expected content (no partial writes)', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'atomic-integrity.txt');
      const longContent = 'x'.repeat(10_000);
      atomicWrite(filePath, longContent);
      expect(fs.readFileSync(filePath, 'utf-8')).toBe(longContent);
      expect(fs.readFileSync(filePath, 'utf-8')).toHaveLength(10_000);
    });

    it('should handle EEXIST/EPERM fallback when renameSync cannot overwrite', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'atomic-fallback.txt');
      fs.writeFileSync(filePath, 'original', 'utf-8');

      // Mock renameSync to throw EEXIST on first call (simulating Windows),
      // then succeed on retry after unlink
      const originalRenameSync = fs.renameSync;
      let callCount = 0;
      const renameSpy = vi.spyOn(fs, 'renameSync').mockImplementation((...args) => {
        callCount++;
        if (callCount === 1) {
          const err = new Error('EEXIST: file already exists');
          err.code = 'EEXIST';
          throw err;
        }
        return originalRenameSync.apply(fs, args);
      });

      try {
        atomicWrite(filePath, 'fallback content');
        expect(fs.readFileSync(filePath, 'utf-8')).toBe('fallback content');
        expect(callCount).toBe(2); // first call throws, second succeeds
      } finally {
        renameSpy.mockRestore();
      }
    });

    it('should clean up temp file when all rename attempts fail', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'atomic-always-fail.txt');

      // Mock renameSync to always throw so both initial and retry attempts fail
      let renameCallCount = 0;
      const renameSpy = vi.spyOn(fs, 'renameSync').mockImplementation(() => {
        renameCallCount++;
        const err = new Error('EEXIST: file already exists');
        err.code = 'EEXIST';
        throw err;
      });

      try {
        expect(() => atomicWrite(filePath, 'doomed')).toThrow('EEXIST');
        // 1 initial attempt + 3 bounded retries = 4 total rename calls
        expect(renameCallCount).toBe(4);
        // Verify no temp files are left behind
        const targetBase = path.basename(filePath);
        const siblings = fs.readdirSync(tempDir);
        const temps = siblings.filter((f) => f.startsWith(`${targetBase}.`) && f.endsWith('.tmp'));
        expect(temps).toHaveLength(0);
      } finally {
        renameSpy.mockRestore();
      }
    });

    it('should log console.warn when temp cleanup fails with non-ENOENT error', async () => {
      const { atomicWrite } = await import('../../scripts/utils/file-utils.js');
      const filePath = path.join(tempDir, 'atomic-warn-cleanup.txt');

      // Make renameSync throw ENODEV so the outer catch re-throws (not EEXIST/EPERM)
      const renameSpy = vi.spyOn(fs, 'renameSync').mockImplementation(() => {
        const err = new Error('ENODEV: no such device');
        err.code = 'ENODEV';
        throw err;
      });

      // Make unlinkSync throw EBUSY for temp files (the cleanup call)
      const originalUnlinkSync = fs.unlinkSync;
      const unlinkSpy = vi.spyOn(fs, 'unlinkSync').mockImplementation((p) => {
        if (String(p).endsWith('.tmp')) {
          const err = new Error('EBUSY: resource busy');
          err.code = 'EBUSY';
          throw err;
        }
        return originalUnlinkSync.call(fs, p);
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        expect(() => atomicWrite(filePath, 'content')).toThrow('ENODEV');
        expect(warnSpy).toHaveBeenCalledOnce();
        expect(warnSpy.mock.calls[0][0]).toContain(
          'atomicWrite: failed to remove temporary file'
        );
        expect(warnSpy.mock.calls[0][0]).toContain('EBUSY');
      } finally {
        renameSpy.mockRestore();
        unlinkSpy.mockRestore();
        warnSpy.mockRestore();
      }
    });
  });

  describe('checkArticleExists', () => {
    it('should return true when article file exists', async () => {
      const { checkArticleExists } = await import('../../scripts/utils/file-utils.js');
      const newsDir = path.join(tempDir, 'news');
      fs.mkdirSync(newsDir, { recursive: true });
      fs.writeFileSync(path.join(newsDir, '2025-01-15-week-ahead-en.html'), 'content');
      expect(checkArticleExists('2025-01-15-week-ahead', 'en', newsDir)).toBe(true);
    });

    it('should return false when article file does not exist', async () => {
      const { checkArticleExists } = await import('../../scripts/utils/file-utils.js');
      const newsDir = path.join(tempDir, 'news');
      fs.mkdirSync(newsDir, { recursive: true });
      expect(checkArticleExists('2025-01-15-week-ahead', 'en', newsDir)).toBe(false);
    });

    it('should return false when news directory does not exist', async () => {
      const { checkArticleExists } = await import('../../scripts/utils/file-utils.js');
      const newsDir = path.join(tempDir, 'nonexistent-news');
      expect(checkArticleExists('2025-01-15-week-ahead', 'en', newsDir)).toBe(false);
    });

    it('should distinguish between different languages', async () => {
      const { checkArticleExists } = await import('../../scripts/utils/file-utils.js');
      const newsDir = path.join(tempDir, 'news');
      fs.mkdirSync(newsDir, { recursive: true });
      fs.writeFileSync(path.join(newsDir, '2025-01-15-week-ahead-en.html'), 'content');
      expect(checkArticleExists('2025-01-15-week-ahead', 'en', newsDir)).toBe(true);
      expect(checkArticleExists('2025-01-15-week-ahead', 'de', newsDir)).toBe(false);
    });
  });

  describe('discoverAnalysisFileEntries', () => {
    it('should return empty array for non-existent directory', async () => {
      const { discoverAnalysisFileEntries } = await import(
        '../../scripts/utils/file-utils.js'
      );
      const result = discoverAnalysisFileEntries(path.join(tempDir, 'nonexistent'));
      expect(result).toEqual([]);
    });

    it('should discover .md files in known subdirectories', async () => {
      const { discoverAnalysisFileEntries } = await import(
        '../../scripts/utils/file-utils.js'
      );
      const analysisDir = path.join(tempDir, 'analysis');
      fs.mkdirSync(path.join(analysisDir, 'classification'), { recursive: true });
      fs.mkdirSync(path.join(analysisDir, 'risk-scoring'), { recursive: true });
      fs.writeFileSync(
        path.join(analysisDir, 'classification', 'significance-classification.md'),
        '# Test'
      );
      fs.writeFileSync(
        path.join(analysisDir, 'risk-scoring', 'risk-matrix.md'),
        '# Risk'
      );

      const result = discoverAnalysisFileEntries(analysisDir);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        method: 'significance-classification',
        outputFile: 'classification/significance-classification.md',
      });
      expect(result).toContainEqual({
        method: 'risk-matrix',
        outputFile: 'risk-scoring/risk-matrix.md',
      });
    });

    it('should discover root-level .md files', async () => {
      const { discoverAnalysisFileEntries } = await import(
        '../../scripts/utils/file-utils.js'
      );
      const analysisDir = path.join(tempDir, 'analysis-root');
      fs.mkdirSync(analysisDir, { recursive: true });
      fs.writeFileSync(
        path.join(analysisDir, 'synthesis-summary.md'),
        '# Synthesis'
      );
      fs.writeFileSync(
        path.join(analysisDir, 'weekly-intelligence-brief.md'),
        '# Brief'
      );

      const result = discoverAnalysisFileEntries(analysisDir);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        method: 'synthesis-summary',
        outputFile: 'synthesis-summary.md',
      });
      expect(result).toContainEqual({
        method: 'weekly-intelligence-brief',
        outputFile: 'weekly-intelligence-brief.md',
      });
    });

    it('should discover files in documents/ subdirectory', async () => {
      const { discoverAnalysisFileEntries } = await import(
        '../../scripts/utils/file-utils.js'
      );
      const analysisDir = path.join(tempDir, 'analysis-docs');
      fs.mkdirSync(path.join(analysisDir, 'documents'), { recursive: true });
      fs.writeFileSync(
        path.join(analysisDir, 'documents', 'document-analysis-index.md'),
        '# Index'
      );

      const result = discoverAnalysisFileEntries(analysisDir);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        method: 'document-analysis',
        outputFile: 'documents/document-analysis-index.md',
      });
    });

    it('should ignore non-.md files', async () => {
      const { discoverAnalysisFileEntries } = await import(
        '../../scripts/utils/file-utils.js'
      );
      const analysisDir = path.join(tempDir, 'analysis-mixed');
      fs.mkdirSync(path.join(analysisDir, 'classification'), { recursive: true });
      fs.writeFileSync(
        path.join(analysisDir, 'classification', 'significance-classification.md'),
        '# Test'
      );
      fs.writeFileSync(
        path.join(analysisDir, 'classification', 'data.json'),
        '{}'
      );
      fs.writeFileSync(path.join(analysisDir, 'manifest.json'), '{}');

      const result = discoverAnalysisFileEntries(analysisDir);
      expect(result).toHaveLength(1);
      expect(result[0].outputFile).toBe(
        'classification/significance-classification.md'
      );
    });

    it('should discover files across all known subdirectories', async () => {
      const { discoverAnalysisFileEntries } = await import(
        '../../scripts/utils/file-utils.js'
      );
      const analysisDir = path.join(tempDir, 'analysis-full');
      const subdirs = [
        'classification',
        'threat-assessment',
        'risk-scoring',
        'existing',
        'documents',
      ];
      for (const subdir of subdirs) {
        fs.mkdirSync(path.join(analysisDir, subdir), { recursive: true });
        fs.writeFileSync(
          path.join(analysisDir, subdir, 'test-file.md'),
          '# Test'
        );
      }

      const result = discoverAnalysisFileEntries(analysisDir);
      expect(result).toHaveLength(5);
      for (const subdir of subdirs) {
        expect(result).toContainEqual({
          method: 'test-file',
          outputFile: `${subdir}/test-file.md`,
        });
      }
    });

    it('should map known filenames to canonical method IDs', async () => {
      const { discoverAnalysisFileEntries } = await import(
        '../../scripts/utils/file-utils.js'
      );
      const analysisDir = path.join(tempDir, 'analysis-canonical');
      fs.mkdirSync(path.join(analysisDir, 'existing'), { recursive: true });
      fs.mkdirSync(path.join(analysisDir, 'documents'), { recursive: true });
      fs.writeFileSync(
        path.join(analysisDir, 'existing', 'stakeholder-impact.md'),
        '# Stakeholder'
      );
      fs.writeFileSync(
        path.join(analysisDir, 'existing', 'coalition-dynamics.md'),
        '# Coalition'
      );
      fs.writeFileSync(
        path.join(analysisDir, 'documents', 'document-analysis-index.md'),
        '# Index'
      );

      const result = discoverAnalysisFileEntries(analysisDir);
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({
        method: 'stakeholder-analysis',
        outputFile: 'existing/stakeholder-impact.md',
      });
      expect(result).toContainEqual({
        method: 'coalition-analysis',
        outputFile: 'existing/coalition-dynamics.md',
      });
      expect(result).toContainEqual({
        method: 'document-analysis',
        outputFile: 'documents/document-analysis-index.md',
      });
    });
  });

  describe('mergeManifestHistory', () => {
    it('creates a manifest with a history array when file does not exist', () => {
      const manifestPath = path.join(tempDir, 'manifest.json');
      mergeManifestHistory(manifestPath, {
        runId: 'run-1',
        startedAt: '2026-04-22T10:00:00Z',
        finishedAt: '2026-04-22T10:30:00Z',
        gateResult: 'GREEN',
        filesWritten: ['intelligence/synthesis-summary.md'],
      });
      const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(parsed.history).toHaveLength(1);
      expect(parsed.history[0].runId).toBe('run-1');
      expect(parsed.updatedAt).toBe('2026-04-22T10:30:00Z');
    });

    it('appends to an existing history array without clobbering top-level fields', () => {
      const manifestPath = path.join(tempDir, 'manifest.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({
          date: '2026-04-22',
          articleType: 'breaking',
          history: [
            {
              runId: 'run-1',
              startedAt: '2026-04-22T10:00:00Z',
              finishedAt: '2026-04-22T10:30:00Z',
              gateResult: 'PENDING',
              filesWritten: [],
            },
          ],
        })
      );
      mergeManifestHistory(manifestPath, {
        runId: 'run-2',
        startedAt: '2026-04-22T14:00:00Z',
        finishedAt: '2026-04-22T14:25:00Z',
        gateResult: 'GREEN',
        filesWritten: ['intelligence/pestle-analysis.md'],
      });
      const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(parsed.date).toBe('2026-04-22');
      expect(parsed.articleType).toBe('breaking');
      expect(parsed.history).toHaveLength(2);
      expect(parsed.history[0].runId).toBe('run-1');
      expect(parsed.history[1].runId).toBe('run-2');
      expect(parsed.history[1].gateResult).toBe('GREEN');
    });

    it('recovers from a corrupt manifest by starting fresh', () => {
      const manifestPath = path.join(tempDir, 'manifest.json');
      fs.writeFileSync(manifestPath, 'not-json{{{');
      mergeManifestHistory(manifestPath, {
        runId: 'run-1',
        startedAt: '2026-04-22T10:00:00Z',
        finishedAt: '2026-04-22T10:30:00Z',
        gateResult: 'ANALYSIS_ONLY',
        filesWritten: [],
      });
      const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(parsed.history).toHaveLength(1);
      expect(parsed.corruptManifestRecoveredAt).toBeTruthy();
    });
  });

  describe('readLatestGateResult', () => {
    it('returns PENDING when the manifest does not exist', () => {
      expect(readLatestGateResult(path.join(tempDir, 'missing.json'))).toBe('PENDING');
    });

    it('returns the gateResult from the last history entry', () => {
      const manifestPath = path.join(tempDir, 'manifest.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({
          history: [
            { runId: 'a', gateResult: 'PENDING', startedAt: '', finishedAt: '', filesWritten: [] },
            { runId: 'b', gateResult: 'GREEN', startedAt: '', finishedAt: '', filesWritten: [] },
          ],
        })
      );
      expect(readLatestGateResult(manifestPath)).toBe('GREEN');
    });

    it('falls back to a top-level gateResult when history is missing (back-compat)', () => {
      const manifestPath = path.join(tempDir, 'manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify({ gateResult: 'ANALYSIS_ONLY' }));
      expect(readLatestGateResult(manifestPath)).toBe('ANALYSIS_ONLY');
    });

    it('returns PENDING for an invalid/unknown gateResult', () => {
      const manifestPath = path.join(tempDir, 'manifest.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({
          history: [
            { runId: 'a', gateResult: 'NOT_A_STATUS', startedAt: '', finishedAt: '', filesWritten: [] },
          ],
        })
      );
      expect(readLatestGateResult(manifestPath)).toBe('PENDING');
    });
  });

  describe('readLatestResolvedGateResult', () => {
    let readLatestResolvedGateResult;

    beforeEach(async () => {
      const mod = await import('../../scripts/utils/file-utils.js');
      readLatestResolvedGateResult = mod.readLatestResolvedGateResult;
    });

    it('returns PENDING when the manifest does not exist', () => {
      expect(readLatestResolvedGateResult(path.join(tempDir, 'missing.json'))).toBe('PENDING');
    });

    it('returns PENDING when all history entries are PENDING', () => {
      const manifestPath = path.join(tempDir, 'manifest-all-pending.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({
          history: [
            { runId: 'a', gateResult: 'PENDING', startedAt: '', finishedAt: '', filesWritten: [] },
            { runId: 'b', gateResult: 'PENDING', startedAt: '', finishedAt: '', filesWritten: [] },
          ],
        })
      );
      expect(readLatestResolvedGateResult(manifestPath)).toBe('PENDING');
    });

    it('skips a trailing PENDING to return the last resolved result (GREEN)', () => {
      // This is the key regression: the --analysis-only wrap-up appended a
      // PENDING entry AFTER the AI had written a GREEN stage-c entry.
      // readLatestResolvedGateResult must skip trailing PENDINGs.
      const manifestPath = path.join(tempDir, 'manifest-trailing-pending.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({
          history: [
            { runId: 'stage-a', gateResult: 'PENDING', startedAt: '', finishedAt: '', filesWritten: [] },
            { runId: 'stage-c', gateResult: 'GREEN', startedAt: '', finishedAt: '', filesWritten: [] },
            { runId: 'wrapup', gateResult: 'PENDING', startedAt: '', finishedAt: '', filesWritten: [] },
          ],
        })
      );
      expect(readLatestResolvedGateResult(manifestPath)).toBe('GREEN');
    });

    it('returns ANALYSIS_ONLY when that is the last resolved result', () => {
      const manifestPath = path.join(tempDir, 'manifest-analysis-only.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({
          history: [
            { runId: 'a', gateResult: 'ANALYSIS_ONLY', startedAt: '', finishedAt: '', filesWritten: [] },
            { runId: 'b', gateResult: 'PENDING', startedAt: '', finishedAt: '', filesWritten: [] },
          ],
        })
      );
      expect(readLatestResolvedGateResult(manifestPath)).toBe('ANALYSIS_ONLY');
    });

    it('returns GREEN_WITH_WARNINGS when that is the last resolved result', () => {
      const manifestPath = path.join(tempDir, 'manifest-green-warnings.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({
          history: [
            { runId: 'a', gateResult: 'GREEN_WITH_WARNINGS', startedAt: '', finishedAt: '', filesWritten: [] },
            { runId: 'b', gateResult: 'PENDING', startedAt: '', finishedAt: '', filesWritten: [] },
          ],
        })
      );
      expect(readLatestResolvedGateResult(manifestPath)).toBe('GREEN_WITH_WARNINGS');
    });

    it('returns PENDING for a missing or empty history', () => {
      const manifestPath = path.join(tempDir, 'manifest-no-history.json');
      fs.writeFileSync(manifestPath, JSON.stringify({ articleType: 'breaking' }));
      expect(readLatestResolvedGateResult(manifestPath)).toBe('PENDING');
    });

    it('returns GREEN from top-level gateResult when history is absent (back-compat)', () => {
      const manifestPath = path.join(tempDir, 'manifest-compat-green.json');
      fs.writeFileSync(manifestPath, JSON.stringify({ gateResult: 'GREEN' }));
      expect(readLatestResolvedGateResult(manifestPath)).toBe('GREEN');
    });

    it('returns ANALYSIS_ONLY from top-level gateResult when history is absent (back-compat)', () => {
      const manifestPath = path.join(tempDir, 'manifest-compat-analysis-only.json');
      fs.writeFileSync(manifestPath, JSON.stringify({ gateResult: 'ANALYSIS_ONLY' }));
      expect(readLatestResolvedGateResult(manifestPath)).toBe('ANALYSIS_ONLY');
    });

    it('returns PENDING for top-level gateResult of PENDING (back-compat does not promote PENDING)', () => {
      const manifestPath = path.join(tempDir, 'manifest-compat-pending.json');
      fs.writeFileSync(manifestPath, JSON.stringify({ gateResult: 'PENDING' }));
      expect(readLatestResolvedGateResult(manifestPath)).toBe('PENDING');
    });

    it('returns PENDING for corrupt JSON', () => {
      const manifestPath = path.join(tempDir, 'manifest-corrupt.json');
      fs.writeFileSync(manifestPath, 'not-json{{{');
      expect(readLatestResolvedGateResult(manifestPath)).toBe('PENDING');
    });
  });
});
