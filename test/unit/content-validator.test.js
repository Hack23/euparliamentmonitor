// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for utils/content-validator module
 */

import { describe, it, expect } from 'vitest';
import { validateArticleContent } from '../../scripts/utils/content-validator.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal valid article HTML string with the given body text */
function buildArticleHtml(bodyText) {
  return `<!DOCTYPE html>
<html lang="en">
<head><title>Test Article</title></head>
<body>
  <nav class="skip-link"></nav>
  <div class="reading-progress"></div>
  <header class="site-header"><div class="site-header__inner"><h1>Test</h1><nav class="site-header__langs"><a href="#">EN</a></nav></div></header>
  <nav class="article-top-nav"><a href="#">Back</a></nav>
  <main id="main">
    <article>${bodyText}</article>
  </main>
  <footer class="site-footer"></footer>
</body>
</html>`;
}

/** Generate a string with approximately `n` words */
function words(n) {
  return Array(n).fill('word').join(' ');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('utils/content-validator', () => {
  describe('validateArticleContent', () => {
    describe('valid content', () => {
      it('should return valid=true for well-formed article meeting word count', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metrics.hasPlaceholders).toBe(false);
        expect(result.metrics.htmlValid).toBe(true);
        expect(result.metrics.wordCount).toBeGreaterThanOrEqual(600);
      });

      it('should pass for breaking-news with 300 words', () => {
        const html = buildArticleHtml(`<p>${words(350)}</p>`);
        const result = validateArticleContent(html, 'de', 'breaking');

        expect(result.valid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should pass for monthly-review with 600 words', () => {
        const html = buildArticleHtml(`<p>${words(650)}</p>`);
        const result = validateArticleContent(html, 'fr', 'month-in-review');

        expect(result.valid).toBe(true);
      });

      it('should pass for unknown article type using default threshold', () => {
        const html = buildArticleHtml(`<p>${words(350)}</p>`);
        const result = validateArticleContent(html, 'en', 'unknown-type');

        expect(result.valid).toBe(true);
      });
    });

    describe('too-short content (warn)', () => {
      it('should warn when week-ahead article has fewer than 500 words', () => {
        const html = buildArticleHtml(`<p>${words(100)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(true); // warnings don't make it invalid
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('500');
      });

      it('should warn when committee-reports article has fewer than 400 words', () => {
        const html = buildArticleHtml(`<p>${words(50)}</p>`);
        const result = validateArticleContent(html, 'en', 'committee-reports');

        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('400');
      });

      it('should include word count in warning message', () => {
        const html = buildArticleHtml('<p>short</p>');
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.warnings[0]).toMatch(/\d+ words/);
      });
    });

    describe('placeholder text detection (fail)', () => {
      it('should fail when {{mustache}} placeholders are present', () => {
        const html = buildArticleHtml(`<p>${words(600)} {{TOPIC_NAME}} more text</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });

      it('should fail when [TODO] markers are present', () => {
        const html = buildArticleHtml(`<p>${words(600)} [TODO: fill this in]</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });

      it('should fail when PLACEHOLDER word is present', () => {
        const html = buildArticleHtml(`<p>${words(600)} PLACEHOLDER text here</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });

      it('should fail for case-insensitive [todo] marker', () => {
        const html = buildArticleHtml(`<p>${words(600)} [todo: add content]</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.hasPlaceholders).toBe(true);
      });
    });

    describe('missing required HTML elements (fail)', () => {
      it('should fail when language switcher is missing', () => {
        const html = `<!DOCTYPE html><html><body>
          <header class="site-header"><div class="site-header__inner"></div></header>
          <nav class="article-top-nav"></nav>
          <main id="main"><p>${words(600)}</p></main>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.htmlValid).toBe(false);
        expect(result.errors.join(' ')).toContain('language switcher');
      });

      it('should fail when article-top-nav is missing', () => {
        const html = `<!DOCTYPE html><html><body>
          <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
          <main id="main"><p>${words(600)}</p></main>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toContain('article-top-nav');
      });

      it('should fail when site-header is missing', () => {
        const html = `<!DOCTYPE html><html><body>
          <nav class="site-header__langs"></nav>
          <nav class="article-top-nav"></nav>
          <main id="main"><p>${words(600)}</p></main>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toContain('site-header');
      });

      it('should fail when main content wrapper is missing', () => {
        const html = `<!DOCTYPE html><html><body>
          <header class="site-header"><div class="site-header__inner"><nav class="site-header__langs"></nav></div></header>
          <nav class="article-top-nav"></nav>
          <div><p>${words(600)}</p></div>
        </body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.errors.join(' ')).toContain('main content wrapper');
      });

      it('should list all missing elements in the error', () => {
        const html = `<html><body><p>${words(600)}</p></body></html>`;
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.valid).toBe(false);
        expect(result.metrics.htmlValid).toBe(false);
        expect(result.errors[0]).toContain('Missing required HTML element');
      });
    });

    describe('metrics', () => {
      it('should report word count in metrics', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.wordCount).toBeGreaterThan(0);
      });

      it('should report htmlValid=true when all elements present', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.htmlValid).toBe(true);
      });

      it('should report hasPlaceholders=false for clean content', () => {
        const html = buildArticleHtml(`<p>${words(600)}</p>`);
        const result = validateArticleContent(html, 'en', 'week-ahead');

        expect(result.metrics.hasPlaceholders).toBe(false);
      });
    });
  });
});
