// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * NewsArticle JSON-LD deep-structure validation.
 *
 * The matrix test (`seo-headers-matrix.test.js`) asserts JSON-LD presence
 * and top-level `@type` values via regex. This test parses the JSON-LD
 * graph as actual JSON for the article surface across all 14 locales and
 * asserts the enrichment fields landed in this SEO PR are emitted
 * correctly and survive locale rendering:
 *
 *  - `NewsArticle.image` is an array of ≥1 absolute https URLs
 *  - `NewsArticle.mainEntityOfPage` is an object with `@type: WebPage` + `@id`
 *  - `NewsArticle.wordCount` is a positive integer
 *  - `NewsArticle.speakable` is a SpeakableSpecification with `cssSelector`
 *  - `NewsArticle.articleSection` is a non-empty localized string
 *  - `NewsArticle.publisher.@id` resolves to the NewsMediaOrganization node
 *  - `NewsArticle.headline` length ≤ 110 (schema.org NewsArticle constraint)
 *  - `NewsArticle.inLanguage` matches the locale (BCP-47 or 2-letter)
 *  - `NewsArticle.datePublished` is an ISO-8601 date
 */

/* eslint-disable no-undef */

import { describe, it, expect } from 'vitest';
import { wrapArticleHtml } from '../../scripts/aggregator/article-html.js';

const LANGS = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];

function extractJsonLdGraph(html) {
  const blocks = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script[^>]*>/g);
  if (!blocks) return [];
  return blocks.flatMap((block) => {
    const m = block.match(/<script[^>]*>([\s\S]*?)<\/script[^>]*>/i);
    if (!m) return [];
    try {
      const parsed = JSON.parse(m[1].trim());
      // Surfaces emit either a top-level array, an object with @graph, or a single node.
      if (Array.isArray(parsed)) return parsed;
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) return parsed['@graph'];
      return [parsed];
    } catch {
      return [];
    }
  });
}

function findByType(nodes, type) {
  return nodes.find((n) => {
    const t = n['@type'];
    if (Array.isArray(t)) return t.includes(type);
    return t === type;
  });
}

function renderArticle(lang) {
  return wrapArticleHtml({
    articleSlug: '2026-01-01-jsonld-deep-test',
    articleType: 'breaking',
    date: '2026-01-01',
    lang,
    title: 'JSON-LD deep validation headline within 110 chars',
    description:
      'JSON-LD deep description for validation — long enough to exercise truncation but well under any cap.',
    extendedDescription:
      'Extended description for JSON-LD validation across all 14 supported locales. ' +
      'Padding text padding text padding text padding text padding text padding text padding text.',
    body: '<p>Sample body for JSON-LD validation. Word one two three four five six seven eight nine ten.</p>',
    sourceMarkdownRelPath: 'news/2026-01-01-jsonld-deep-test/test.md',
  });
}

describe.each(LANGS)('NewsArticle JSON-LD enrichment — %s', (lang) => {
  let nodes;
  let newsArticle;
  let publisher;

  it('parses cleanly', () => {
    const html = renderArticle(lang);
    nodes = extractJsonLdGraph(html);
    expect(nodes.length).toBeGreaterThan(0);
    newsArticle = findByType(nodes, 'NewsArticle');
    // Publisher may be a standalone @graph node or inlined on NewsArticle.publisher
    publisher =
      findByType(nodes, 'NewsMediaOrganization') ??
      (newsArticle?.publisher && typeof newsArticle.publisher === 'object'
        ? newsArticle.publisher
        : undefined);
    expect(newsArticle, `${lang} NewsArticle node missing`).toBeDefined();
    expect(publisher, `${lang} NewsMediaOrganization node missing`).toBeDefined();
  });

  it('image is an array of ≥1 absolute https URLs', () => {
    const images = Array.isArray(newsArticle.image) ? newsArticle.image : [newsArticle.image];
    expect(images.length).toBeGreaterThan(0);
    for (const img of images) {
      const url = typeof img === 'string' ? img : img?.url;
      expect(url, `${lang} image URL missing`).toMatch(/^https:\/\//);
    }
  });

  it('mainEntityOfPage is WebPage with @id', () => {
    const mep = newsArticle.mainEntityOfPage;
    expect(mep, `${lang} mainEntityOfPage missing`).toBeDefined();
    expect(mep['@type']).toBe('WebPage');
    expect(mep['@id']).toMatch(/^https:\/\//);
  });

  it('wordCount is a positive integer', () => {
    expect(typeof newsArticle.wordCount).toBe('number');
    expect(Number.isInteger(newsArticle.wordCount)).toBe(true);
    expect(newsArticle.wordCount).toBeGreaterThan(0);
  });

  it('speakable is SpeakableSpecification with cssSelector', () => {
    const sp = newsArticle.speakable;
    expect(sp, `${lang} speakable missing`).toBeDefined();
    expect(sp['@type']).toBe('SpeakableSpecification');
    expect(Array.isArray(sp.cssSelector) || typeof sp.cssSelector === 'string').toBe(true);
  });

  it('articleSection is a non-empty string', () => {
    expect(typeof newsArticle.articleSection).toBe('string');
    expect(newsArticle.articleSection.trim().length).toBeGreaterThan(0);
  });

  it('publisher reference resolves to NewsMediaOrganization node', () => {
    const pubRef = newsArticle.publisher;
    expect(pubRef, `${lang} publisher reference missing`).toBeDefined();
    // Accept any of: (1) inline NewsMediaOrganization object,
    // (2) @id reference to a standalone NewsMediaOrganization node,
    // (3) inline object with publisher fields (name/url).
    const refId = typeof pubRef === 'string' ? pubRef : pubRef['@id'];
    if (refId && publisher['@id']) {
      expect(refId).toBe(publisher['@id']);
    } else if (typeof pubRef === 'object') {
      const inlineType = pubRef['@type'];
      expect(
        inlineType === 'NewsMediaOrganization' || inlineType === 'Organization',
        `${lang} inline publisher @type should be NewsMediaOrganization (got ${inlineType})`,
      ).toBe(true);
    }
  });

  it('headline length is ≤ 110 characters (schema.org NewsArticle constraint)', () => {
    expect(typeof newsArticle.headline).toBe('string');
    expect(newsArticle.headline.length).toBeLessThanOrEqual(110);
  });

  it('inLanguage matches the locale', () => {
    const il = newsArticle.inLanguage;
    expect(il, `${lang} inLanguage missing`).toBeDefined();
    // Accept either 2-letter or BCP-47 (e.g. en-GB) — must start with the locale code
    expect(il.toLowerCase().split(/[-_]/)[0]).toBe(lang);
  });

  it('datePublished is a parseable ISO-8601 date', () => {
    expect(typeof newsArticle.datePublished).toBe('string');
    const d = new Date(newsArticle.datePublished);
    expect(Number.isNaN(d.getTime())).toBe(false);
  });
});
