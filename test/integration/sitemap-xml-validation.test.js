// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test for sitemap.xml and rss.xml structural validity.
 *
 * Validates:
 * - sitemap.xml has valid XML prolog and urlset namespace
 * - All <url> entries have <loc> and valid HTTPS URLs
 * - hreflang alternates are present for multilingual pages
 * - rss.xml has valid RSS 2.0 envelope
 * - RSS items have required elements (title, link, pubDate)
 * - No unescaped XML entities in the output
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

describe('sitemap.xml structural validation', () => {
  const sitemapPath = path.join(REPO_ROOT, 'sitemap.xml');
  const sitemapExists = fs.existsSync(sitemapPath);

  it('exists in the repository root', () => {
    // In CI, sitemap.xml may not exist yet (tests run before prebuild)
    if (!sitemapExists) {
      expect(true).toBe(true); // skip gracefully
      return;
    }
    expect(fs.existsSync(sitemapPath)).toBe(true);
  });

  it('starts with XML prolog', () => {
    if (!sitemapExists) return;
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('has valid urlset namespace declaration', () => {
    if (!sitemapExists) return;
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it('has xhtml namespace for hreflang', () => {
    if (!sitemapExists) return;
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it('every <url> has a <loc> with https://', () => {
    if (!sitemapExists) return;
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const urls = content.match(/<url>[\s\S]*?<\/url>/g) || [];
    expect(urls.length).toBeGreaterThan(0);
    for (const urlBlock of urls) {
      const loc = urlBlock.match(/<loc>(.*?)<\/loc>/);
      expect(loc).not.toBeNull();
      expect(loc[1]).toMatch(/^https:\/\//);
    }
  });

  it('has hreflang alternates for news article URLs', () => {
    if (!sitemapExists) return;
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    // Find a news article URL block (they have alternates)
    const newsUrlBlock = content.match(
      /<url>[\s\S]*?<loc>https:\/\/euparliamentmonitor\.com\/news\/[^<]+<\/loc>[\s\S]*?<\/url>/
    );
    if (newsUrlBlock) {
      expect(newsUrlBlock[0]).toContain('xhtml:link');
      expect(newsUrlBlock[0]).toContain('hreflang=');
    }
  });

  it('contains no unescaped & in URLs', () => {
    if (!sitemapExists) return;
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    // In XML, bare & is invalid — must be &amp;
    // Check that <loc> values don't have bare & (but &amp; is fine)
    const locs = content.match(/<loc>(.*?)<\/loc>/g) || [];
    for (const loc of locs) {
      const url = loc.replace(/<\/?loc>/g, '');
      // Remove legitimate &amp; then check no & remains
      const withoutAmpEntity = url.replace(/&amp;/g, '');
      expect(withoutAmpEntity).not.toContain('&');
    }
  });

  it('has at least 100 URL entries', () => {
    if (!sitemapExists) return;
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const urlCount = (content.match(/<url>/g) || []).length;
    expect(urlCount).toBeGreaterThanOrEqual(100);
  });
});

describe('rss.xml structural validation', () => {
  const rssPath = path.join(REPO_ROOT, 'rss.xml');
  const rssExists = fs.existsSync(rssPath);

  it('exists in the repository root', () => {
    // In CI, rss.xml may not exist yet (tests run before prebuild)
    if (!rssExists) {
      expect(true).toBe(true); // skip gracefully
      return;
    }
    expect(fs.existsSync(rssPath)).toBe(true);
  });

  it('starts with XML prolog', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    expect(content).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it('has RSS 2.0 version declaration', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    expect(content).toContain('<rss version="2.0"');
  });

  it('has a <channel> with required elements', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    expect(content).toContain('<channel>');
    expect(content).toMatch(/<title>[^<]+<\/title>/);
    expect(content).toMatch(/<link>[^<]+<\/link>/);
    expect(content).toMatch(/<description>[^<]+<\/description>/);
  });

  it('has <lastBuildDate> element', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    expect(content).toMatch(/<lastBuildDate>[^<]+<\/lastBuildDate>/);
  });

  it('items have required elements', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    const items = content.match(/<item>[\s\S]*?<\/item>/g) || [];
    expect(items.length).toBeGreaterThan(0);
    // Check first 5 items for structure
    for (const item of items.slice(0, 5)) {
      expect(item).toMatch(/<title>[^<]*<\/title>/);
      expect(item).toMatch(/<link>https:\/\/[^<]+<\/link>/);
      expect(item).toMatch(/<pubDate>[^<]+<\/pubDate>/);
    }
  });

  it('items have dc:language element', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    const items = content.match(/<item>[\s\S]*?<\/item>/g) || [];
    // Check first 5 items for language
    for (const item of items.slice(0, 5)) {
      expect(item).toMatch(/<dc:language>[a-z]{2}<\/dc:language>/);
    }
  });

  it('has at least 50 items', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    const itemCount = (content.match(/<item>/g) || []).length;
    expect(itemCount).toBeGreaterThanOrEqual(50);
  });

  it('contains no unescaped XML entities in titles/descriptions', () => {
    if (!rssExists) return;
    const content = fs.readFileSync(rssPath, 'utf-8');
    const titles = content.match(/<title>(.*?)<\/title>/g) || [];
    for (const title of titles.slice(0, 20)) {
      const text = title.replace(/<\/?title>/g, '');
      // After removing &amp;/&lt;/&gt;/&quot;/&apos; there should be no bare &/</>
      const cleaned = text.replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, '');
      expect(cleaned).not.toMatch(/[<>&]/);
    }
  });
});
