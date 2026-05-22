// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Structured-data completeness contract.
 *
 * Locks in invariants across every HTML surface so that AI crawlers
 * (GPTBot, ClaudeBot, PerplexityBot, Googlebot, Bingbot) and Google's
 * structured-data validators always receive a complete JSON-LD graph.
 *
 * Surfaces validated here:
 *  1. Static `offline.html` — minimal WebPage + NewsMediaOrganization
 *     graph (kept `noindex` for search engines but still useful to
 *     AI assistants).
 *  2. News-index pages — `CollectionPage` with `dateModified` and a
 *     `mainEntity.ItemList` carousel using typed `NewsArticle` items.
 *  3. Sitemap pages — same `CollectionPage` + carousel shape contract.
 *  4. Political-intelligence page — `CollectionPage` referencing the
 *     publisher via `@id` only (no inline duplicate) and the section
 *     ItemList wrapped in typed `WebPageElement` items.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateIndexHTML } from '../../scripts/generators/news-indexes/per-language.js';
import { generateSitemapHTML } from '../../scripts/generators/sitemap/html.js';
import { generatePoliticalIntelligenceHTML } from '../../scripts/generators/political-intelligence/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Extract every `<script type="application/ld+json">` block from an
 * HTML string and parse each one. Throws if any block fails to parse,
 * because malformed JSON-LD breaks Google Rich Results and AI ingestion.
 */
function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return matches.map((m, idx) => {
    try {
      return JSON.parse(m[1]);
    } catch (err) {
      throw new Error(`JSON-LD block #${idx + 1} failed to parse: ${err.message}\nContent: ${m[1].slice(0, 200)}`);
    }
  });
}

const ISO_8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

describe('offline.html structured-data graph', () => {
  const html = readFileSync(path.join(REPO_ROOT, 'offline.html'), 'utf-8');
  const blocks = extractJsonLd(html);

  it('emits at least two JSON-LD blocks (WebPage + NewsMediaOrganization)', () => {
    expect(blocks.length).toBeGreaterThanOrEqual(2);
  });

  it('preserves the noindex robots directive', () => {
    // Offline is a degraded UX shell, not search-visible content.
    expect(html).toContain('<meta name="robots" content="noindex">');
  });

  it('declares a WebPage node with @id, name, description, inLanguage', () => {
    const webPage = blocks.find((b) => b['@type'] === 'WebPage');
    expect(webPage, 'no WebPage block found').toBeDefined();
    expect(webPage['@context']).toBe('https://schema.org');
    expect(webPage['@id']).toMatch(/^https:\/\/euparliamentmonitor\.com\/offline\.html$/);
    expect(webPage.url).toBe(webPage['@id']);
    expect(typeof webPage.name).toBe('string');
    expect(webPage.name.length).toBeGreaterThan(0);
    expect(typeof webPage.description).toBe('string');
    expect(webPage.inLanguage).toBe('en');
    expect(webPage.isPartOf).toBeDefined();
    expect(webPage.publisher).toEqual({ '@id': 'https://euparliamentmonitor.com/#organization' });
  });

  it('declares a NewsMediaOrganization with sameAs[] and ImageObject logo', () => {
    const org = blocks.find((b) => b['@type'] === 'NewsMediaOrganization');
    expect(org, 'no NewsMediaOrganization block found').toBeDefined();
    expect(org['@id']).toBe('https://euparliamentmonitor.com/#organization');
    expect(org.name).toBe('Hack23 AB');
    expect(org.url).toBe('https://hack23.com');
    expect(org.logo).toMatchObject({ '@type': 'ImageObject', width: 192, height: 192 });
    expect(Array.isArray(org.sameAs)).toBe(true);
    expect(org.sameAs).toContain('https://hack23.com');
    expect(org.sameAs.some((u) => u.startsWith('https://github.com/Hack23'))).toBe(true);
  });
});

describe('news-index CollectionPage JSON-LD', () => {
  const articles = [
    { filename: '2026-05-20-foo-en.html', slug: 'foo', date: '2026-05-20', lang: 'en' },
    { filename: '2026-05-19-bar-en.html', slug: 'bar', date: '2026-05-19', lang: 'en' },
  ];
  const metaMap = new Map([
    ['2026-05-20-foo-en.html', { title: 'Foo headline', description: 'Foo description.' }],
    ['2026-05-19-bar-en.html', { title: 'Bar headline', description: 'Bar description.' }],
  ]);
  const html = generateIndexHTML('en', articles, metaMap);
  const blocks = extractJsonLd(html);
  const collectionPage = blocks.find((b) => b['@type'] === 'CollectionPage');

  it('emits a CollectionPage with datePublished and dateModified in ISO-8601', () => {
    expect(collectionPage, 'no CollectionPage block found').toBeDefined();
    expect(ISO_8601_RE.test(collectionPage.datePublished)).toBe(true);
    expect(ISO_8601_RE.test(collectionPage.dateModified)).toBe(true);
  });

  it('references publisher by @id (no inline NewsMediaOrganization duplicate)', () => {
    expect(collectionPage.publisher).toEqual({
      '@id': 'https://euparliamentmonitor.com/#organization',
    });
  });

  it('emits a mainEntity ItemList carousel with typed NewsArticle items', () => {
    const list = collectionPage.mainEntity;
    expect(list['@type']).toBe('ItemList');
    expect(list.numberOfItems).toBe(articles.length);
    expect(list.itemListElement.length).toBe(articles.length);
    list.itemListElement.forEach((entry, idx) => {
      expect(entry['@type']).toBe('ListItem');
      expect(entry.position).toBe(idx + 1);
      expect(typeof entry.url).toBe('string');
      expect(entry.item['@type']).toBe('NewsArticle');
      expect(entry.item['@id']).toBe(entry.url);
      expect(entry.item.headline).toBeTruthy();
      expect(ISO_DATE_RE.test(entry.item.datePublished)).toBe(true);
      expect(entry.item.inLanguage).toBe('en');
    });
  });
});

describe('sitemap CollectionPage JSON-LD', () => {
  const articleInfos = [
    { filename: '2026-05-20-foo-en.html', date: '2026-05-20', title: 'Foo', description: 'd1', slug: 'foo' },
    { filename: '2026-05-19-bar-sv.html', date: '2026-05-19', title: 'Bar', description: 'd2', slug: 'bar' },
  ];
  const html = generateSitemapHTML('en', articleInfos);
  const blocks = extractJsonLd(html);
  const collectionPage = blocks.find((b) => b['@type'] === 'CollectionPage');

  it('emits CollectionPage with dateModified and publisher @id ref', () => {
    expect(collectionPage).toBeDefined();
    expect(ISO_8601_RE.test(collectionPage.dateModified)).toBe(true);
    expect(collectionPage.publisher).toEqual({
      '@id': 'https://euparliamentmonitor.com/#organization',
    });
  });

  it('emits ItemList with typed items and per-article inLanguage parsed from filename', () => {
    const list = collectionPage.mainEntity;
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement.length).toBe(articleInfos.length);
    expect(list.itemListElement[0].item.inLanguage).toBe('en');
    // Per-article lang must come from the filename suffix, not the page lang.
    expect(list.itemListElement[1].item.inLanguage).toBe('sv');
    list.itemListElement.forEach((entry, idx) => {
      expect(entry.position).toBe(idx + 1);
      expect(entry.item['@type']).toBe('NewsArticle');
      expect(entry.item['@id']).toBe(entry.url);
      expect(ISO_DATE_RE.test(entry.item.datePublished)).toBe(true);
    });
  });
});

describe('political-intelligence CollectionPage JSON-LD', () => {
  // Minimal data shape — empty arrays produce a valid (if sparse) page.
  const piData = {
    methodologies: [],
    templates: [],
    referenceDocs: [],
    dailyGroups: [],
  };
  const html = generatePoliticalIntelligenceHTML('en', piData);
  const blocks = extractJsonLd(html);
  const collectionPage = blocks.find((b) => b['@type'] === 'CollectionPage');

  it('emits CollectionPage with dateModified and @id-only publisher/author refs', () => {
    expect(collectionPage).toBeDefined();
    expect(ISO_8601_RE.test(collectionPage.datePublished)).toBe(true);
    expect(ISO_8601_RE.test(collectionPage.dateModified)).toBe(true);
    expect(collectionPage.publisher).toEqual({
      '@id': 'https://euparliamentmonitor.com/#organization',
    });
    expect(collectionPage.author).toEqual({
      '@id': 'https://euparliamentmonitor.com/#organization',
    });
    // No inline NewsMediaOrganization duplicate inside the CollectionPage.
    expect(collectionPage.publisher.name).toBeUndefined();
  });

  it('emits ItemList with 4 typed WebPageElement section items', () => {
    const list = collectionPage.mainEntity;
    expect(list['@type']).toBe('ItemList');
    expect(list.numberOfItems).toBe(4);
    expect(list.itemListElement.length).toBe(4);
    list.itemListElement.forEach((entry, idx) => {
      expect(entry['@type']).toBe('ListItem');
      expect(entry.position).toBe(idx + 1);
      expect(entry.item['@type']).toBe('WebPageElement');
      expect(entry.item['@id']).toBe(entry.url);
      expect(entry.item.inLanguage).toBe('en');
      expect(typeof entry.item.name).toBe('string');
    });
  });

  it('still emits a top-level NewsMediaOrganization with sameAs[] (separate block)', () => {
    const org = blocks.find((b) => b['@type'] === 'NewsMediaOrganization');
    expect(org).toBeDefined();
    expect(Array.isArray(org.sameAs)).toBe(true);
    expect(org.sameAs.length).toBeGreaterThanOrEqual(3);
  });
});
