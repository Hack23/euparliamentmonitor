// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test for the HTML article generation pipeline.
 *
 * Validates that generated news HTML files meet quality gates:
 * - Valid HTML5 structure (doctype, lang, dir attributes)
 * - Cache-busting parameters present on asset URLs
 * - Hreflang alternate links for all 14 supported languages
 * - JSON-LD structured data present and parseable
 * - RTL direction set correctly for Arabic and Hebrew
 * - No unsanitized `<script>` injection vectors
 * - Skip link and accessibility landmarks present
 * - Breadcrumb navigation rendered
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const NEWS_DIR = path.join(REPO_ROOT, 'news');

/** Pick a sample article in each category for validation */
function findSampleArticles() {
  const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('-en.html'));
  // Sort to ensure deterministic selection across filesystems
  files.sort();
  // Pick up to 3 recent English articles (last alphabetically = newest by date)
  return files.slice(-3);
}

/** Find an Arabic variant for RTL testing */
function findArabicArticle() {
  const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('-ar.html'));
  files.sort();
  return files.length > 0 ? files[files.length - 1] : null;
}

/** Find a Hebrew variant for RTL testing */
function findHebrewArticle() {
  const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith('-he.html'));
  files.sort();
  return files.length > 0 ? files[files.length - 1] : null;
}

describe('HTML article generation pipeline', () => {
  const sampleArticles = findSampleArticles();

  it('has at least one generated article to test', () => {
    expect(sampleArticles.length).toBeGreaterThan(0);
  });

  describe('HTML5 structure', () => {
    it.each(sampleArticles)('%s has valid HTML5 doctype', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toMatch(/^<!DOCTYPE html>/i);
    });

    it.each(sampleArticles)('%s has <html lang="en">', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toContain('<html lang="en"');
    });

    it.each(sampleArticles)('%s has dir="ltr"', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toContain('dir="ltr"');
    });

    it.each(sampleArticles)('%s has a <title> element', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toMatch(/<title>[^<]+<\/title>/);
    });

    it.each(sampleArticles)('%s has a <meta name="description">', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    });
  });

  describe('cache-busting', () => {
    it.each(sampleArticles)('%s has cache-bust query on styles.css', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toMatch(/styles\.css\?v=[a-f0-9]+/);
    });
  });

  describe('hreflang alternates', () => {
    it.each(sampleArticles)('%s has 14+ hreflang links', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      const hreflangMatches = html.match(/rel="alternate" hreflang="/g);
      // 14 languages + x-default = 15
      expect(hreflangMatches).not.toBeNull();
      expect(hreflangMatches.length).toBeGreaterThanOrEqual(15);
    });

    it.each(sampleArticles)('%s has x-default hreflang', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toContain('hreflang="x-default"');
    });
  });

  describe('JSON-LD structured data', () => {
    it.each(sampleArticles)('%s contains a parseable JSON-LD block', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
      );
      expect(jsonLdMatch).not.toBeNull();
      // Parse should not throw — may be array or object
      const data = JSON.parse(jsonLdMatch[1]);
      const primary = Array.isArray(data) ? data[0] : data;
      expect(primary['@context']).toBe('https://schema.org');
      expect(primary['@type']).toBeDefined();
    });
  });

  describe('accessibility landmarks', () => {
    it.each(sampleArticles)('%s has a skip link', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toMatch(/class="skip-link"/);
    });

    it.each(sampleArticles)('%s has a <main> element', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toContain('<main');
    });

    it.each(sampleArticles)('%s has a <nav> element', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      expect(html).toContain('<nav');
    });
  });

  describe('security', () => {
    it.each(sampleArticles)('%s has no inline <script> in body (CSP)', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      // Only allowed scripts are type="application/ld+json" and type="module" src=
      const scriptTags = html.match(/<script(?![^>]*type="application\/ld\+json")[^>]*>/g) || [];
      for (const tag of scriptTags) {
        // Must have src= attribute (external script, not inline)
        expect(tag).toMatch(/src="/);
      }
    });
  });

  describe('RTL rendering', () => {
    const arFile = findArabicArticle();
    const heFile = findHebrewArticle();

    it('Arabic article has dir="rtl"', () => {
      if (!arFile) return; // Skip if no Arabic articles
      const html = fs.readFileSync(path.join(NEWS_DIR, arFile), 'utf-8');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
    });

    it('Hebrew article has dir="rtl"', () => {
      if (!heFile) return; // Skip if no Hebrew articles
      const html = fs.readFileSync(path.join(NEWS_DIR, heFile), 'utf-8');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="he"');
    });
  });

  describe('breadcrumb navigation', () => {
    it.each(sampleArticles)('%s has breadcrumb (HTML nav or JSON-LD BreadcrumbList)', (filename) => {
      const html = fs.readFileSync(path.join(NEWS_DIR, filename), 'utf-8');
      // Breadcrumb may be an HTML nav with aria-label, OR a JSON-LD BreadcrumbList
      const hasHtmlBreadcrumb = /aria-label="[^"]*[Bb]readcrumb/.test(html);
      const hasJsonLdBreadcrumb = /BreadcrumbList/.test(html);
      expect(hasHtmlBreadcrumb || hasJsonLdBreadcrumb).toBe(true);
    });
  });
});
