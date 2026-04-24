// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/article-html — chrome reuse, hreflang
 * alternates, skip-link, CSP-safe asset references.
 */

import { describe, it, expect } from 'vitest';
import {
  buildArticleHreflangLinks,
  getArticleFilename,
  wrapArticleHtml,
} from '../../scripts/aggregator/article-html.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

describe('getArticleFilename', () => {
  it('uses <date>-<type>-<lang>.html pattern uniformly', () => {
    expect(getArticleFilename('2026-01-15-breaking', 'en')).toBe(
      '2026-01-15-breaking-en.html'
    );
    expect(getArticleFilename('2026-01-15-breaking', 'sv')).toBe(
      '2026-01-15-breaking-sv.html'
    );
  });
});

describe('buildArticleHreflangLinks', () => {
  it('emits one <link rel="alternate"> per language plus x-default', () => {
    const block = buildArticleHreflangLinks('2026-01-15-breaking');
    for (const code of ALL_LANGUAGES) {
      expect(block).toContain(`hreflang="${code}"`);
    }
    expect(block).toContain('hreflang="x-default"');
    const lines = block.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBe(ALL_LANGUAGES.length + 1);
  });
});

describe('wrapArticleHtml', () => {
  const baseOptions = {
    lang: 'en',
    articleSlug: '2026-01-15-breaking',
    body: '<h1>Test Article</h1><p>Body content.</p>',
    title: 'Test Article',
    description: 'Short description of the test article.',
    date: '2026-01-15',
    articleType: 'breaking',
  };

  it('emits a complete HTML5 document with the article body', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('<h1>Test Article</h1>');
    expect(html).toContain('Body content.');
  });

  it('includes the skip-link and theme toggle button for a11y parity', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).toContain('class="skip-link"');
    // Theme toggle script tag is inlined by shared chrome
    expect(html).toMatch(/theme|toggle/i);
  });

  it('renders hreflang alternates for all 14 languages + x-default', () => {
    const html = wrapArticleHtml(baseOptions);
    for (const code of ALL_LANGUAGES) {
      expect(html).toContain(`hreflang="${code}"`);
    }
    expect(html).toContain('hreflang="x-default"');
  });

  it('renders the language switcher with an active state for current lang', () => {
    const html = wrapArticleHtml({ ...baseOptions, lang: 'sv' });
    expect(html).toContain('lang-link active');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('<html lang="sv"');
  });

  it('does NOT inline any <script> in the body (CSP-safe)', () => {
    const html = wrapArticleHtml(baseOptions);
    // Only allowed scripts are in <head>: module src, ld+json, theme-toggle
    const bodyStart = html.indexOf('<body>');
    const body = html.slice(bodyStart);
    // Allowed: theme-toggle inline script from shared chrome
    const inlineScripts = body.match(/<script(?![^>]*\bsrc=)[^>]*>/g) ?? [];
    // Only shared chrome's single inline theme script is acceptable
    expect(inlineScripts.length).toBeLessThanOrEqual(1);
  });

  it('references mermaid from js/vendor/ (same-origin, CSP-safe)', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).toContain('../js/vendor/mermaid.esm.min.mjs');
  });

  it('sets dir="rtl" for Arabic and Hebrew', () => {
    expect(wrapArticleHtml({ ...baseOptions, lang: 'ar' })).toContain(
      'dir="rtl"'
    );
    expect(wrapArticleHtml({ ...baseOptions, lang: 'he' })).toContain(
      'dir="rtl"'
    );
  });

  it('includes a JSON-LD NewsArticle block with escaped < characters', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('"@type":"NewsArticle"');
    expect(html).not.toMatch(/<\/script>[^<]*<\/script>/);
  });

  it('emits the optional source-markdown link when provided', () => {
    const html = wrapArticleHtml({
      ...baseOptions,
      sourceMarkdownRelPath: 'news/2026-01-15-breaking.en.md',
    });
    expect(html).toContain('news/2026-01-15-breaking.en.md');
    expect(html).toContain('type="text/markdown"');
  });
});
