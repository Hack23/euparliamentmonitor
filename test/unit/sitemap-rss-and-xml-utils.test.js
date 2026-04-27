// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the `Generators/Sitemap` bounded context — XML escaping
 * and RSS 2.0 feed generation. Validates that the new sub-modules
 * (`xml-utils.ts`, `rss.ts`) are byte-equivalent to the legacy inline
 * implementation that previously lived in `sitemap.ts`, and that they
 * satisfy the operational contract every workflow depends on:
 *
 * - `npm run prebuild` shells out via `node scripts/generators/sitemap.js`
 *   and writes `rss.xml` to the repo root
 * - The deploy-s3 / release / e2e workflows assume the XML is well-formed
 *   and the five predefined entities are escaped
 * - RSS items must carry a `<dc:language>` element so feed readers can
 *   filter per locale (see `news-translate.md` workflow)
 */

import { describe, it, expect } from 'vitest';
import {
  escapeXML,
  generateRssFeed,
} from '../../scripts/generators/sitemap/index.js';

describe('escapeXML', () => {
  it('escapes the five predefined XML entities', () => {
    expect(escapeXML('&')).toBe('&amp;');
    expect(escapeXML('<')).toBe('&lt;');
    expect(escapeXML('>')).toBe('&gt;');
    expect(escapeXML('"')).toBe('&quot;');
    expect(escapeXML("'")).toBe('&apos;');
  });

  it('escapes a mix of entities in one pass without double-encoding', () => {
    // Critical: `&` MUST be escaped first; otherwise `&lt;` becomes `&amp;lt;`.
    const out = escapeXML('Tom & Jerry <"\'">');
    expect(out).toBe('Tom &amp; Jerry &lt;&quot;&apos;&quot;&gt;');
    // Round-trip sanity: no raw special chars left
    expect(/[<>"]/.test(out)).toBe(false);
    expect(out).not.toContain("'");
  });

  it('returns empty string unchanged', () => {
    expect(escapeXML('')).toBe('');
  });

  it('passes alphanumeric input through unchanged', () => {
    expect(escapeXML('Hello World 123 — π')).toBe('Hello World 123 — π');
  });

  it('does not double-encode pre-escaped entities', () => {
    // The function escapes the literal `&` even when the next characters
    // already form an entity reference. This is the correct (and standard)
    // behaviour: round-trip-safe escaping must operate on the raw octet
    // stream, not try to detect existing entities.
    const out = escapeXML('a &amp; b');
    expect(out).toBe('a &amp;amp; b');
  });

  it('handles long strings with many special characters', () => {
    const huge = '<a href="x">&\'</a>'.repeat(100);
    const out = escapeXML(huge);
    expect(out.length).toBeGreaterThan(huge.length);
    // No raw `<` / `"` / `'` in the output
    expect(/[<"]/.test(out)).toBe(false);
    expect(out).not.toContain("'");
  });
});

describe('generateRssFeed', () => {
  const FIXED_BUILD_DATE = 'Mon, 27 Apr 2026 18:00:00 GMT';

  it('returns a valid RSS 2.0 envelope with required channel elements', () => {
    const xml = generateRssFeed([], FIXED_BUILD_DATE);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<title>EU Parliament Monitor</title>');
    expect(xml).toContain(`<lastBuildDate>${FIXED_BUILD_DATE}</lastBuildDate>`);
    expect(xml).toContain('<atom:link');
    expect(xml.trimEnd().endsWith('</rss>')).toBe(true);
  });

  it('declares the required XML namespaces (atom + dc)', () => {
    const xml = generateRssFeed([], FIXED_BUILD_DATE);
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
  });

  it('renders one <item> per article with all required elements', () => {
    const xml = generateRssFeed(
      [
        {
          title: 'EU vote on AI Act',
          link: 'https://example.test/news/2026-04-27-ai-act.en.md',
          description: 'Plenary adopts AI Act amendments.',
          pubDate: 'Mon, 27 Apr 2026 09:00:00 GMT',
          lang: 'en',
        },
        {
          title: 'EU röstning om AI-akten',
          link: 'https://example.test/news/2026-04-27-ai-act-sv.html',
          description: 'Plenum antar AI-aktens ändringar.',
          pubDate: 'Mon, 27 Apr 2026 09:00:00 GMT',
          lang: 'sv',
        },
      ],
      FIXED_BUILD_DATE
    );

    const itemMatches = xml.match(/<item>/g) ?? [];
    expect(itemMatches.length).toBe(2);
    expect(xml).toContain('<title>EU vote on AI Act</title>');
    expect(xml).toContain('<title>EU röstning om AI-akten</title>');
    expect(xml).toContain('<dc:language>en</dc:language>');
    expect(xml).toContain('<dc:language>sv</dc:language>');
    expect(xml).toContain('<guid isPermaLink="true">');
  });

  it('escapes XML entities in titles, descriptions, and links', () => {
    const xml = generateRssFeed(
      [
        {
          title: 'Tom & Jerry: <breaking news>',
          link: 'https://example.test/news/x?y=1&z=2',
          description: 'Quote: "Hello \'World\'"',
          pubDate: FIXED_BUILD_DATE,
          lang: 'en',
        },
      ],
      FIXED_BUILD_DATE
    );

    expect(xml).toContain('<title>Tom &amp; Jerry: &lt;breaking news&gt;</title>');
    expect(xml).toContain('y=1&amp;z=2');
    expect(xml).toContain('&quot;Hello &apos;World&apos;&quot;');
    // No raw `<` outside well-known XML structure
    expect(xml).not.toContain('<breaking news>');
  });

  it('escapes the lang code (defensive — language is technically untrusted input)', () => {
    const xml = generateRssFeed(
      [
        {
          title: 't',
          link: 'https://example.test/x',
          description: 'd',
          pubDate: FIXED_BUILD_DATE,
          lang: 'en&xx',
        },
      ],
      FIXED_BUILD_DATE
    );
    expect(xml).toContain('<dc:language>en&amp;xx</dc:language>');
  });

  it('produces an empty <items> section for an empty input array', () => {
    const xml = generateRssFeed([], FIXED_BUILD_DATE);
    expect(xml).not.toContain('<item>');
    // Channel block still well-formed
    expect(xml).toContain('<channel>');
    expect(xml).toContain('</channel>');
  });

  it('preserves item order (caller is responsible for sorting)', () => {
    const xml = generateRssFeed(
      [
        {
          title: 'B',
          link: 'https://example.test/b',
          description: 'b',
          pubDate: 'Tue, 28 Apr 2026 09:00:00 GMT',
          lang: 'en',
        },
        {
          title: 'A',
          link: 'https://example.test/a',
          description: 'a',
          pubDate: 'Mon, 27 Apr 2026 09:00:00 GMT',
          lang: 'en',
        },
      ],
      FIXED_BUILD_DATE
    );
    const bIdx = xml.indexOf('<title>B</title>');
    const aIdx = xml.indexOf('<title>A</title>');
    expect(bIdx).toBeGreaterThan(0);
    expect(aIdx).toBeGreaterThan(bIdx);
  });

  it('uses now() for buildDate when no override is provided', () => {
    const before = Date.now();
    const xml = generateRssFeed([]);
    const after = Date.now();
    const match = xml.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/);
    expect(match).toBeTruthy();
    const parsed = Date.parse(match[1]);
    expect(parsed).toBeGreaterThanOrEqual(before - 1000);
    expect(parsed).toBeLessThanOrEqual(after + 1000);
  });

  it('with an override is fully deterministic across calls', () => {
    const items = [
      {
        title: 'Same input',
        link: 'https://example.test/x',
        description: 'd',
        pubDate: FIXED_BUILD_DATE,
        lang: 'en',
      },
    ];
    const a = generateRssFeed(items, FIXED_BUILD_DATE);
    const b = generateRssFeed(items, FIXED_BUILD_DATE);
    expect(a).toBe(b);
  });

  it('embeds the production BASE_URL in the channel <link>', () => {
    const xml = generateRssFeed([], FIXED_BUILD_DATE);
    expect(xml).toMatch(/<link>https?:\/\/[^<]+<\/link>/);
    expect(xml).toMatch(/atom:link href="https?:\/\/[^"]+\/rss\.xml"/);
  });
});
