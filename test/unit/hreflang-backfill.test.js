// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for backfillArticleHreflang in news-indexes.
 * Tests hreflang injection, relative-to-absolute URL conversion, and idempotency.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Create a stable temp directory for the test session
const SESSION_TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hreflang-test-'));
const TEST_NEWS_DIR = path.join(SESSION_TMP, 'news');

vi.mock('../../scripts/constants/config.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    NEWS_DIR: TEST_NEWS_DIR,
    METADATA_DIR: path.join(TEST_NEWS_DIR, 'metadata'),
  };
});

const { backfillArticleHreflang } = await import('../../scripts/generators/news-indexes.js');

describe('backfillArticleHreflang', () => {
  beforeEach(() => {
    fs.mkdirSync(TEST_NEWS_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up test files but keep the directory structure
    const files = fs.readdirSync(TEST_NEWS_DIR).filter((f) => f.endsWith('.html'));
    for (const f of files) {
      fs.unlinkSync(path.join(TEST_NEWS_DIR, f));
    }
    vi.restoreAllMocks();
  });

  it('should inject hreflang links into articles missing them', () => {
    const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test Article</title>
  <meta name="description" content="Test description">
</head>
<body><p>Content</p></body>
</html>`;
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), articleHtml);

    const updated = backfillArticleHreflang(['2026-01-15-week-ahead-en.html']);

    expect(updated).toBe(1);
    const result = fs.readFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), 'utf8');
    expect(result).toContain('hreflang="en"');
    expect(result).toContain('hreflang="sv"');
    expect(result).toContain('hreflang="x-default"');
    expect(result).toContain('href="https://');
    expect(result).toContain('2026-01-15-week-ahead-en.html');
    expect(result).toContain('2026-01-15-week-ahead-sv.html');
  });

  it('should fix relative hreflang URLs to absolute', () => {
    const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test Article</title>
  <link rel="alternate" hreflang="en" href="2026-01-15-week-ahead-en.html">
  <link rel="alternate" hreflang="sv" href="2026-01-15-week-ahead-sv.html">
  <link rel="alternate" hreflang="x-default" href="2026-01-15-week-ahead-en.html">
</head>
<body><p>Content</p></body>
</html>`;
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), articleHtml);

    const updated = backfillArticleHreflang(['2026-01-15-week-ahead-en.html']);

    expect(updated).toBe(1);
    const result = fs.readFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), 'utf8');
    // Should now have absolute URLs
    expect(result).toContain('href="https://');
    // Should not have relative URLs in hreflang
    expect(result).not.toMatch(/<link rel="alternate" hreflang="[^"]*" href="2026/);
  });

  it('should skip articles that already have absolute hreflang URLs', () => {
    const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test Article</title>
  <link rel="alternate" hreflang="en" href="https://euparliamentmonitor.com/news/2026-01-15-week-ahead-en.html">
  <link rel="alternate" hreflang="x-default" href="https://euparliamentmonitor.com/news/2026-01-15-week-ahead-en.html">
</head>
<body><p>Content</p></body>
</html>`;
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), articleHtml);

    const updated = backfillArticleHreflang(['2026-01-15-week-ahead-en.html']);

    expect(updated).toBe(0);
  });

  it('should skip non-parseable filenames', () => {
    const updated = backfillArticleHreflang(['not-a-valid-name.html']);
    expect(updated).toBe(0);
  });

  it('should produce 15 hreflang links (14 languages + x-default)', () => {
    const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test</title>
</head>
<body></body>
</html>`;
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), articleHtml);

    backfillArticleHreflang(['2026-01-15-week-ahead-en.html']);

    const result = fs.readFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), 'utf8');
    const hreflangMatches = result.match(/<link rel="alternate" hreflang="/g);
    expect(hreflangMatches).not.toBeNull();
    expect(hreflangMatches.length).toBe(15); // 14 languages + x-default
  });

  it('should be idempotent when run twice', () => {
    const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test</title>
</head>
<body></body>
</html>`;
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), articleHtml);

    // First run: should update
    const firstRun = backfillArticleHreflang(['2026-01-15-week-ahead-en.html']);
    expect(firstRun).toBe(1);

    // Second run: should skip (already absolute)
    const secondRun = backfillArticleHreflang(['2026-01-15-week-ahead-en.html']);
    expect(secondRun).toBe(0);
  });

  it('should handle multiple files in a batch', () => {
    const baseHtml = (lang) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <title>Test</title>
</head>
<body></body>
</html>`;
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), baseHtml('en'));
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-sv.html'), baseHtml('sv'));
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-de.html'), baseHtml('de'));

    const updated = backfillArticleHreflang([
      '2026-01-15-week-ahead-en.html',
      '2026-01-15-week-ahead-sv.html',
      '2026-01-15-week-ahead-de.html',
    ]);

    expect(updated).toBe(3);
    // Each file should have all 14 language variants
    for (const lang of ['en', 'sv', 'de']) {
      const result = fs.readFileSync(
        path.join(TEST_NEWS_DIR, `2026-01-15-week-ahead-${lang}.html`),
        'utf8'
      );
      expect(result).toContain('hreflang="en"');
      expect(result).toContain('hreflang="x-default"');
      expect(result).toContain('href="https://');
    }
  });

  it('should place hreflang links before the closing head tag', () => {
    const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body></body>
</html>`;
    fs.writeFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), articleHtml);

    backfillArticleHreflang(['2026-01-15-week-ahead-en.html']);

    const result = fs.readFileSync(path.join(TEST_NEWS_DIR, '2026-01-15-week-ahead-en.html'), 'utf8');
    const headEndPos = result.indexOf('</head>');
    const lastHreflangPos = result.lastIndexOf('hreflang=');
    // hreflang links should appear before </head>
    expect(lastHreflangPos).toBeLessThan(headEndPos);
    // stylesheet should still be there
    expect(result).toContain('link rel="stylesheet"');
  });
});
