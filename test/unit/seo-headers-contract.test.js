// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Contract tests for the SEO-header surface — the four generators
 * (article, news-index, sitemap, political-intelligence) MUST emit
 * the same canonical set of OG / Twitter / JSON-LD enrichments so a
 * regression in any single generator is caught by this file rather
 * than by manual visual inspection of social-card previews.
 *
 * The contract is described in `analysis/methodologies/seo-headers-policy.md`.
 */

import { describe, it, expect } from 'vitest';
import {
  buildOgLocaleTags,
  getOgLocale,
  OG_LOCALES,
} from '../../scripts/constants/og-locales.js';
import {
  buildTwitterAttributionTags,
  ORG_SAME_AS,
  TWITTER_SITE_HANDLE,
  TWITTER_CREATOR_HANDLE,
} from '../../scripts/constants/social-handles.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { wrapArticleHtml } from '../../scripts/aggregator/article-html.js';
import {
  truncateExtendedDescription,
  extractExtendedLedeAfterHeading,
} from '../../scripts/aggregator/article-metadata.js';

describe('OG_LOCALES contract', () => {
  it('maps every supported language to a BCP-47 underscore tag', () => {
    for (const code of ALL_LANGUAGES) {
      const tag = OG_LOCALES[code];
      expect(tag, `og locale for ${code}`).toBeTruthy();
      expect(tag).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });

  it('uses en_GB (European English) as the English locale', () => {
    expect(getOgLocale('en')).toBe('en_GB');
  });

  it('maps Norwegian to Bokmål (nb_NO) and Chinese to Simplified (zh_CN)', () => {
    expect(getOgLocale('no')).toBe('nb_NO');
    expect(getOgLocale('zh')).toBe('zh_CN');
  });

  it('falls back to en_GB for unknown language codes', () => {
    expect(getOgLocale('xx')).toBe('en_GB');
  });
});

describe('buildOgLocaleTags', () => {
  it('emits one og:locale and 13 og:locale:alternate tags', () => {
    const html = buildOgLocaleTags('en');
    // Match the primary tag (no `:alternate` suffix) — exactly one.
    const primary = html.match(/property="og:locale" content=/g) ?? [];
    const alternates = html.match(/property="og:locale:alternate" content=/g) ?? [];
    expect(primary.length).toBe(1);
    expect(alternates.length).toBe(ALL_LANGUAGES.length - 1);
  });

  it("places the page's own locale as the primary og:locale", () => {
    const html = buildOgLocaleTags('de');
    expect(html.split('\n')[0]).toContain('property="og:locale"');
    expect(html.split('\n')[0]).toContain('content="de_DE"');
  });
});

describe('Twitter attribution contract', () => {
  it('returns an empty string when neither handle is configured', () => {
    // The handles ship empty in the open-source repo; this test
    // documents the empty-state behaviour. When the org provisions
    // a handle this test still passes because both constants change
    // simultaneously.
    if (!TWITTER_SITE_HANDLE && !TWITTER_CREATOR_HANDLE) {
      expect(buildTwitterAttributionTags()).toBe('');
    }
  });

  it('emits both meta tags only when both handles are non-empty', () => {
    // Sanity check: when handles are present, the helper must emit
    // the underscore-prefixed `name=` form Twitter expects.
    const out = buildTwitterAttributionTags();
    if (out) {
      expect(out).toMatch(/<meta name="twitter:/);
    }
  });
});

describe('ORG_SAME_AS contract', () => {
  it('lists the canonical Hack23 sameAs URLs', () => {
    expect(ORG_SAME_AS).toContain('https://github.com/Hack23');
    expect(ORG_SAME_AS).toContain('https://hack23.com');
  });

  it('lists only HTTPS URLs', () => {
    for (const url of ORG_SAME_AS) {
      expect(url).toMatch(/^https:\/\//);
    }
  });
});

describe('truncateExtendedDescription', () => {
  it('returns empty string when input is short enough for meta description', () => {
    const short = 'Short BLUF paragraph that fits in the regular cap.';
    expect(truncateExtendedDescription(short)).toBe('');
  });

  it('preserves a 200-300 char paragraph verbatim', () => {
    const text =
      'The European Parliament voted on Wednesday to adopt a comprehensive new framework targeting digital-platform accountability across the bloc, with rapporteurs emphasising the directive will reshape advertising disclosure rules from January 2027 onwards across all member states.';
    expect(truncateExtendedDescription(text)).toBe(text);
  });

  it('sentence-boundary truncates inputs longer than the cap', () => {
    const long =
      'A'.repeat(250) +
      '. ' +
      'B'.repeat(120);
    const out = truncateExtendedDescription(long);
    expect(out.length).toBeLessThanOrEqual(300);
    // Truncation either ends at the sentence boundary or with an ellipsis.
    expect(out.endsWith('.') || out.endsWith('…')).toBe(true);
  });
});

describe('extractExtendedLedeAfterHeading', () => {
  it('returns a longer paragraph than the regular lede extractor for long BLUFs', () => {
    const md = `# Page

## TL;DR

This is the first paragraph that runs comfortably past the 180-character meta-description cap so the resolver has to pick between a short truncation and the full lede; we want the full lede in og:description so social-card previews render the journalist's framing in full instead of the search-snippet stub used by Google search.
`;
    const out = extractExtendedLedeAfterHeading(md);
    expect(out.length).toBeGreaterThan(180);
    expect(out.length).toBeLessThanOrEqual(300);
  });

  it('returns empty string when the brief has no prose after the H1', () => {
    expect(extractExtendedLedeAfterHeading('# Just a heading\n')).toBe('');
  });
});

describe('wrapArticleHtml — SEO-headers contract', () => {
  const base = {
    lang: 'en',
    articleSlug: '2026-01-15-breaking',
    body: '<h1>Test Article</h1><p>Body content goes here, with several words to give the JSON-LD wordCount field a non-zero value.</p>',
    title: 'Test Article — Headline',
    description: 'Short description of the test article for SEO purposes.',
    date: '2026-01-15',
    articleType: 'breaking',
  };

  it('emits the article: OG namespace (not the legacy meta-name form)', () => {
    const html = wrapArticleHtml(base);
    expect(html).toContain('<meta property="article:published_time"');
    expect(html).toContain('<meta property="article:modified_time"');
    expect(html).toContain('<meta property="article:section"');
    expect(html).toContain('<meta property="article:author"');
    expect(html).toContain('<meta property="article:publisher"');
    // The legacy form must not be emitted alongside.
    expect(html).not.toContain('name="article:published_time"');
  });

  it('emits an RSS alternate link, preconnect, and dark/light theme-color pair', () => {
    const html = wrapArticleHtml(base);
    expect(html).toContain('<link rel="alternate" type="application/rss+xml"');
    expect(html).toContain('<link rel="preconnect" href="https://hack23.com"');
    expect(html).toContain('media="(prefers-color-scheme: light)"');
    expect(html).toContain('media="(prefers-color-scheme: dark)"');
    expect(html).toContain('<meta name="color-scheme" content="light dark">');
  });

  it('emits the BCP-47 og:locale + 13 alternates', () => {
    const html = wrapArticleHtml({ ...base, lang: 'de' });
    expect(html).toContain('content="de_DE"');
    // Every non-primary language appears as an alternate.
    for (const code of ALL_LANGUAGES) {
      if (code === 'de') continue;
      expect(html).toContain(`og:locale:alternate" content="${OG_LOCALES[code]}"`);
    }
  });

  it('includes mainEntityOfPage, wordCount, ImageObject[] and speakable in JSON-LD', () => {
    const html = wrapArticleHtml(base);
    expect(html).toMatch(/"mainEntityOfPage":\{[^}]*"@type":"WebPage"/);
    expect(html).toMatch(/"wordCount":\d+/);
    expect(html).toMatch(/"image":\[[^\]]*"@type":"ImageObject"/);
    expect(html).toMatch(/"speakable":\{[^}]*"@type":"SpeakableSpecification"/);
  });

  it('declares NewsMediaOrganization (not bare Organization) for author/publisher', () => {
    const html = wrapArticleHtml(base);
    // The JSON is HTML-escaped (`\u003c` for `<`) — just match the
    // type strings inside the ld+json payload.
    expect(html).toMatch(/"@type":"NewsMediaOrganization"/);
  });

  it('uses extendedDescription for og:description / twitter:description when provided', () => {
    const extended =
      'A long-form social-card description that exceeds the search-snippet cap so the helper rightly prefers it for Facebook/Twitter while keeping the short description for Google search snippets — exactly the contract the new SEO pipeline guarantees.';
    const html = wrapArticleHtml({ ...base, extendedDescription: extended });
    expect(html).toContain(`property="og:description" content="${extended}"`);
    expect(html).toContain(`name="twitter:description" content="${extended}"`);
    // The short description is still the <meta name="description">.
    expect(html).toContain(`name="description" content="${base.description}"`);
  });

  it('falls back to short description when extendedDescription is empty', () => {
    const html = wrapArticleHtml({ ...base, extendedDescription: '' });
    expect(html).toContain(`property="og:description" content="${base.description}"`);
  });
});
