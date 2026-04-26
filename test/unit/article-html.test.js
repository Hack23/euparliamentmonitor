// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/article-html — chrome reuse, hreflang
 * alternates, skip-link, CSP-safe asset references.
 */

import { describe, it, expect } from 'vitest';
import {
  buildArticleHreflangLinks,
  buildArticleToc,
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

  it('references the same-origin Mermaid initializer with a version cache-bust (CSP-safe)', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).toMatch(/\.\.\/js\/mermaid-init\.js\?v=\d+\.\d+\.\d+/);
  });

  it('renders a reader-facing article hero before the artifact body', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).toContain('class="article-hero"');
    expect(html).toContain('class="article-dek"');
    expect(html).toContain('Short description of the test article.');
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

  it('renders the article TOC sidebar when toc entries are supplied', () => {
    const html = wrapArticleHtml({
      ...baseOptions,
      toc: [
        { id: 'executive-brief', title: 'Executive Brief' },
        { id: 'synthesis', title: 'Synthesis Summary' },
      ],
    });
    expect(html).toContain('class="article-toc-container"');
    expect(html).toContain('href="#executive-brief"');
    expect(html).toContain('href="#synthesis"');
    expect(html).toContain('Synthesis Summary');
  });

  it('omits the sidebar entirely when toc is empty or absent', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).not.toContain('article-toc-container');
    const htmlEmpty = wrapArticleHtml({ ...baseOptions, toc: [] });
    expect(htmlEmpty).not.toContain('article-toc-container');
  });

  it('embeds the language switcher INSIDE the header using site-header__langs (matches index chrome)', () => {
    const html = wrapArticleHtml(baseOptions);
    // The stacked header variant matches index.html so the article and the
    // landing page share the same top-of-page visual rhythm.
    expect(html).toContain('site-header__inner--stacked');
    // Language switcher must live inside the <header>, not as a standalone
    // <nav class="language-switcher"> bar below it.
    expect(html).not.toContain('class="language-switcher"');
    expect(html).toContain('<nav class="site-header__langs"');
    // All 14 languages must be present inside the header nav.
    const headerMatch = html.match(/<header[\s\S]*?<\/header>/);
    expect(headerMatch).not.toBeNull();
    const header = headerMatch?.[0] ?? '';
    for (const code of ALL_LANGUAGES) {
      expect(header).toContain(`hreflang="${code}"`);
      expect(header).toContain(`lang="${code}"`);
    }
  });

  it('uses the larger 72×48 header-logo asset in the header (matches index chrome)', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).toContain('../images/header-logo.webp');
    expect(html).toContain('../images/header-logo.png');
    expect(html).toContain('site-header__logo--header');
    expect(html).toContain('width="72" height="48"');
  });

  it('surfaces the footer-stats line when articleCount is provided', () => {
    const html = wrapArticleHtml({ ...baseOptions, articleCount: 197 });
    expect(html).toContain('class="footer-stats"');
    expect(html).toContain('197');
  });

  it('omits the footer-stats line when articleCount is absent', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).not.toContain('class="footer-stats"');
  });

  it('embeds isBasedOn in JSON-LD when source artifact URLs are provided', () => {
    const html = wrapArticleHtml({
      ...baseOptions,
      isBasedOn: [
        'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/x/synthesis-summary.md',
      ],
    });
    expect(html).toContain('"isBasedOn"');
    expect(html).toContain('synthesis-summary.md');
    expect(html).toContain('"CreativeWork"');
  });

  it('omits isBasedOn from JSON-LD when the option is absent', () => {
    const html = wrapArticleHtml(baseOptions);
    expect(html).not.toContain('"isBasedOn"');
  });

  it('omits isBasedOn from JSON-LD when an empty array is provided', () => {
    const html = wrapArticleHtml({ ...baseOptions, isBasedOn: [] });
    expect(html).not.toContain('"isBasedOn"');
  });
});

describe('buildArticleToc', () => {
  it('returns an empty string when there are no entries', () => {
    expect(buildArticleToc([], 'en')).toBe('');
  });

  it('renders an <aside><details><nav><ol> tree with stable anchors', () => {
    const html = buildArticleToc(
      [
        { id: 'synthesis', title: 'Synthesis Summary' },
        { id: 'risk', title: 'Risk Assessment' },
      ],
      'en'
    );
    expect(html).toContain('<aside class="article-toc-container"');
    expect(html).toContain('<details class="article-toc-details" open>');
    expect(html).toContain('<nav class="article-toc">');
    expect(html).toContain('<ol class="article-toc-list">');
    expect(html).toMatch(/<li><a href="#synthesis">Synthesis Summary<\/a><\/li>/);
    expect(html).toMatch(/<li><a href="#risk">Risk Assessment<\/a><\/li>/);
  });

  it('escapes HTML in entry titles and ids to prevent injection', () => {
    const html = buildArticleToc(
      [{ id: 'id"><script>alert(1)</script>', title: '<b>xss</b>' }],
      'en'
    );
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>xss</b>');
    expect(html).toContain('&lt;b&gt;xss&lt;/b&gt;');
  });

  it('localises the nav label from TOC_ARIA_LABELS', () => {
    const sv = buildArticleToc([{ id: 'x', title: 'X' }], 'sv');
    expect(sv).toContain('Innehållsförteckning');
    const de = buildArticleToc([{ id: 'x', title: 'X' }], 'de');
    expect(de).toContain('Inhaltsverzeichnis');
  });
});
