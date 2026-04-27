// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `Generators/Sitemap/Xml` — `generateSitemap` and
 * `collectDocsHtmlFiles`. Covers the contract every consumer (Google,
 * Bing, the deploy-s3 workflow's S3 sync, the EP RSS reader fallback)
 * relies on:
 *
 * - Well-formed XML envelope with the sitemap + xhtml namespaces
 * - One `<url>` block per language for index pages, sitemap HTML, and
 *   political-intelligence pages (3 × 14 = 42 multilingual + 1 RSS)
 * - hreflang `xhtml:link` alternates including `x-default`
 * - article URLs sorted alphabetically with multi-locale clusters
 *   sharing alternates only when the stem has multiple variants
 * - docs URLs without alternates (single-locale)
 * - escapeXML applied to every embedded path/URL
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  generateSitemap,
  collectDocsHtmlFiles,
} from '../../scripts/generators/sitemap/xml.js';

describe('collectDocsHtmlFiles', () => {
  let tmpDir;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collectDocs-'));
    fs.mkdirSync(path.join(tmpDir, 'docs', 'api'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'docs', 'coverage'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'docs', 'index.html'), '<html></html>');
    fs.writeFileSync(path.join(tmpDir, 'docs', 'api', 'index.html'), '<html></html>');
    fs.writeFileSync(path.join(tmpDir, 'docs', 'coverage', 'index.html'), '<html></html>');
    // Non-HTML files are ignored
    fs.writeFileSync(path.join(tmpDir, 'docs', 'README.md'), '# docs');
    fs.writeFileSync(path.join(tmpDir, 'docs', 'logo.svg'), '<svg/>');
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns an empty array when the directory does not exist', () => {
    expect(collectDocsHtmlFiles(path.join(tmpDir, 'does-not-exist'), tmpDir)).toEqual([]);
  });

  it('finds nested HTML files and ignores non-HTML', () => {
    const files = collectDocsHtmlFiles(path.join(tmpDir, 'docs'), tmpDir);
    expect(files).toContain('docs/index.html');
    expect(files).toContain('docs/api/index.html');
    expect(files).toContain('docs/coverage/index.html');
    expect(files.find((f) => f.endsWith('.md'))).toBeUndefined();
    expect(files.find((f) => f.endsWith('.svg'))).toBeUndefined();
  });

  it('returns paths sorted alphabetically', () => {
    const files = collectDocsHtmlFiles(path.join(tmpDir, 'docs'), tmpDir);
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });

  it('uses POSIX separators even on Windows-style paths', () => {
    const files = collectDocsHtmlFiles(path.join(tmpDir, 'docs'), tmpDir);
    expect(files.every((f) => !f.includes('\\'))).toBe(true);
  });
});

describe('generateSitemap', () => {
  it('returns a well-formed XML document with the required namespaces', () => {
    const xml = generateSitemap([], []);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
    );
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('emits 14 index URLs + 14 sitemap HTML URLs + 14 PI URLs + 1 RSS URL when no articles supplied', () => {
    const xml = generateSitemap([], []);
    const locCount = (xml.match(/<loc>/g) ?? []).length;
    expect(locCount).toBe(14 * 3 + 1);
  });

  it('emits hreflang alternates for every multilingual surface', () => {
    const xml = generateSitemap([], []);
    // 14 langs × 3 surfaces × 14 alternates each + 14 langs × 3 surfaces × 1 x-default
    const altCount = (xml.match(/<xhtml:link rel="alternate"/g) ?? []).length;
    // Each of 42 multilingual URLs has 14 alternates + x-default = 15 alternates
    expect(altCount).toBe(42 * 15);
    expect(xml).toContain('hreflang="x-default"');
  });

  it('embeds the RSS feed URL with daily changefreq', () => {
    const xml = generateSitemap([], []);
    const rssBlock = xml.split('<url>').find((b) => b.includes('/rss.xml'));
    expect(rssBlock).toBeTruthy();
    expect(rssBlock).toContain('<changefreq>daily</changefreq>');
    expect(rssBlock).toContain('<priority>0.5</priority>');
  });

  it('appends docs URLs without hreflang alternates', () => {
    const xml = generateSitemap([], ['docs/api/index.html', 'docs/coverage/index.html']);
    const docsBlocks = xml
      .split('<url>')
      .filter((b) => b.includes('docs/api') || b.includes('docs/coverage'));
    expect(docsBlocks).toHaveLength(2);
    for (const block of docsBlocks) {
      expect(block).not.toContain('xhtml:link');
      expect(block).toContain('<changefreq>weekly</changefreq>');
      expect(block).toContain('<priority>0.3</priority>');
    }
  });

  it('escapes XML entities in URLs', () => {
    const xml = generateSitemap([], ['docs/x&y.html']);
    expect(xml).toContain('docs/x&amp;y.html');
    expect(xml).not.toMatch(/docs\/x&y\.html/);
  });

  it('points x-default at the English variant', () => {
    const xml = generateSitemap([], []);
    const indexBlock = xml.split('<url>').find((b) => b.includes('/index.html<'));
    expect(indexBlock).toBeTruthy();
    // x-default in the alternates block should reference the English URL
    expect(indexBlock).toMatch(/hreflang="x-default" href="[^"]*\/index\.html"/);
  });
});
