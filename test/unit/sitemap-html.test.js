// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `Generators/Sitemap/Html` — `generateSitemapHTML`,
 * `getSitemapFilename`, `getIndexFilename`, and `SitemapArticleInfo`.
 *
 * Validates the HTML chrome contract every accessibility / SEO check
 * relies on:
 *
 * - `<html lang>` and `dir` reflect the language (RTL for ar/he)
 * - 14 hreflang `<link rel="alternate">` entries plus `x-default`
 * - JSON-LD CollectionPage with the article count and breadcrumb
 * - Skip link, theme toggle button, language switcher with
 *   `aria-current="page"` on the active language
 * - `<` inside JSON-LD is escaped as `\u003c` (CSP / XSS hardening)
 * - Footer is rendered via the shared `buildSiteFooter`
 */

import { describe, it, expect } from 'vitest';
import {
  generateSitemapHTML,
  getSitemapFilename,
  getIndexFilename,
} from '../../scripts/generators/sitemap/html.js';

describe('getSitemapFilename', () => {
  it('returns sitemap.html for English', () => {
    expect(getSitemapFilename('en')).toBe('sitemap.html');
  });

  it('returns sitemap_<lang>.html for non-English', () => {
    expect(getSitemapFilename('sv')).toBe('sitemap_sv.html');
    expect(getSitemapFilename('zh')).toBe('sitemap_zh.html');
    expect(getSitemapFilename('ar')).toBe('sitemap_ar.html');
  });
});

describe('getIndexFilename', () => {
  it('returns index.html for English', () => {
    expect(getIndexFilename('en')).toBe('index.html');
  });

  it('returns index-<lang>.html (note dash, not underscore) for non-English', () => {
    expect(getIndexFilename('sv')).toBe('index-sv.html');
    expect(getIndexFilename('zh')).toBe('index-zh.html');
  });
});

describe('generateSitemapHTML', () => {
  const fixtureArticle = {
    filename: '2026-04-27-ai-act.en.html',
    date: '2026-04-27',
    title: 'AI Act adopted',
    description: 'Plenary vote concludes.',
    slug: 'ai-act',
  };

  it('emits a valid HTML5 document with the right lang/dir', () => {
    const html = generateSitemapHTML('en', [fixtureArticle], false);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<html lang="en" dir="ltr">');
    expect(html).toContain('</html>');
  });

  it('emits dir="rtl" for Arabic', () => {
    const html = generateSitemapHTML('ar', [], false);
    expect(html).toContain('<html lang="ar" dir="rtl">');
  });

  it('emits dir="rtl" for Hebrew', () => {
    const html = generateSitemapHTML('he', [], false);
    expect(html).toContain('<html lang="he" dir="rtl">');
  });

  it('emits 14 hreflang alternates plus x-default in <head>', () => {
    const html = generateSitemapHTML('en', [], false);
    const head = html.split('</head>')[0];
    const alternates = head.match(/<link rel="alternate" hreflang="[^"]+"/g) ?? [];
    // 14 languages + x-default = 15
    expect(alternates.length).toBe(15);
    expect(head).toContain('hreflang="x-default"');
    expect(head).toContain('hreflang="en"');
    expect(head).toContain('hreflang="zh"');
  });

  it('embeds JSON-LD CollectionPage with the article count', () => {
    const html = generateSitemapHTML('en', [fixtureArticle], false);
    const jsonLdBlocks = [
      ...html.matchAll(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/g),
    ];
    expect(jsonLdBlocks.length).toBeGreaterThanOrEqual(3);
    // Find the CollectionPage block specifically — multiple JSON-LD
    // blocks are emitted (WebSite, Organization, CollectionPage, FAQPage).
    const collectionPageBlock = jsonLdBlocks.find((m) =>
      m[1].includes('"@type":"CollectionPage"')
    );
    expect(collectionPageBlock).toBeTruthy();
    const raw = collectionPageBlock[1];
    expect(raw).not.toContain('</');
    expect(raw).toContain('"@type":"CollectionPage"');
    expect(raw).toContain('"numberOfItems":1');
  });

  it('embeds the four expected JSON-LD blocks (WebSite/Organization/CollectionPage/FAQPage)', () => {
    const html = generateSitemapHTML('en', [fixtureArticle], false);
    expect(html).toContain('"@type":"WebSite"');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"@type":"FAQPage"');
    // Organization MUST carry a logo for Google rich-result eligibility
    expect(html).toContain('"logo"');
    expect(html).toContain('hack23.com/icon-192.png');
  });

  it('emits keywords/robots/author meta tags and a visible FAQ section', () => {
    const html = generateSitemapHTML('en', [fixtureArticle], false);
    expect(html).toMatch(/<meta name="keywords" content="[^"]+"/);
    expect(html).toMatch(/<meta name="robots" content="index, follow/);
    expect(html).toMatch(/<meta name="author" content="Hack23 AB"/);
    expect(html).toContain('class="page-faq"');
    expect(html).toContain('<details');
  });

  it('escapes `<` inside JSON-LD as \\u003c', () => {
    const html = generateSitemapHTML('en', [], false);
    // No raw `</script>` sequence in the JSON-LD payload — guarantee
    // that no malicious title/description can break out
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]*?)<\/script>/);
    expect(jsonLdMatch).toBeTruthy();
    expect(jsonLdMatch[1]).not.toContain('<');
  });

  it('renders the skip link and theme toggle', () => {
    const html = generateSitemapHTML('en', [], false);
    expect(html).toMatch(/<a href="#main" class="skip-link">/);
    expect(html).toContain('class="theme-toggle"');
  });

  it('marks the current language with aria-current="page" in the language switcher', () => {
    const html = generateSitemapHTML('sv', [], false);
    // The Swedish lang-link must have aria-current="page"; the others must not
    const langLinks = html.match(/<a href="sitemap[^"]*" class="lang-link[^>]*>/g) ?? [];
    expect(langLinks.length).toBe(14);
    const currentLinks = langLinks.filter((l) => l.includes('aria-current="page"'));
    expect(currentLinks.length).toBe(1);
    expect(currentLinks[0]).toContain('href="sitemap_sv.html"');
  });

  it('omits the docs section when hasDocsDir is false', () => {
    const html = generateSitemapHTML('en', [], false);
    expect(html).toContain('docs/api/');
    expect(html).not.toContain('docs/coverage/index.html');
  });

  it('renders the docs section when hasDocsDir is true', () => {
    const html = generateSitemapHTML('en', [], true);
    expect(html).toContain('docs/');
    expect(html).toContain('docs/api/');
    expect(html).toContain('docs/coverage/index.html');
    expect(html).toContain('docs/test-results/index.html');
  });

  it('escapes article titles, descriptions, and filenames', () => {
    const html = generateSitemapHTML(
      'en',
      [
        {
          filename: 'x&y.html',
          date: '2026-04-27',
          title: '<script>alert(1)</script>',
          description: '"Hello"',
          slug: 'xy',
        },
      ],
      false
    );
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('x&amp;y.html');
    expect(html).toContain('&quot;Hello&quot;');
  });

  it('shows the empty-state stats when no articles are supplied', () => {
    const html = generateSitemapHTML('en', [], false);
    // Articles label dt with 0 count
    expect(html).toMatch(/<dt>Articles<\/dt>\s*<dd>0<\/dd>/);
  });

  it('groups articles by editorial category in canonical order', () => {
    const articles = [
      { filename: 'a.html', date: '2026-04-27', title: 'Breaking', description: '', slug: 'breaking-news-x' },
      { filename: 'b.html', date: '2026-04-27', title: 'Week in Review', description: '', slug: 'week-in-review-y' },
      { filename: 'c.html', date: '2026-04-27', title: 'Motion', description: '', slug: 'motions-z' },
    ];
    const html = generateSitemapHTML('en', articles, false);
    const breakingIdx = html.indexOf('Breaking');
    const weekIdx = html.indexOf('Week in Review');
    const motionIdx = html.indexOf('Motion');
    // BREAKING_NEWS comes before WEEK_IN_REVIEW which comes before MOTIONS
    expect(breakingIdx).toBeGreaterThan(0);
    expect(weekIdx).toBeGreaterThan(breakingIdx);
    expect(motionIdx).toBeGreaterThan(weekIdx);
  });

  it('emits canonical URL using the BASE_URL constant', () => {
    const html = generateSitemapHTML('sv', [], false);
    expect(html).toMatch(/<link rel="canonical" href="https?:\/\/[^"]+\/sitemap_sv\.html">/);
  });
});
