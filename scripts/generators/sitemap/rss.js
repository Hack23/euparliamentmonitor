// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Sitemap/Rss
 * @description Generates the `rss.xml` feed for the homepage. The feed
 * surfaces every news article across all 14 supported languages — items
 * are sorted newest-first by `pubDate` and tagged with `<dc:language>`
 * so feed readers can filter or split per locale.
 *
 * Extracted from the monolithic `sitemap.ts` so RSS generation can be
 * unit-tested in isolation and so any future feed format (Atom,
 * JSON-Feed, news-specific RSS) reuses the same item shape and escaping.
 */
import { BASE_URL } from '../../constants/config.js';
import { escapeXML } from './xml-utils.js';
/**
 * Generate an RSS 2.0 XML feed for the homepage.
 *
 * Every item is escaped via {@link escapeXML} so titles or descriptions
 * containing `&`/`<`/etc. don't break feed readers. The channel-level
 * `<lastBuildDate>` reflects "now" — callers that need deterministic
 * output for tests should pass an explicit `buildDate` override.
 *
 * @param articleInfos - Articles, ideally already sorted newest-first
 * @param buildDate - Optional override for the channel-level
 *   `<lastBuildDate>` (RFC-822 string). Defaults to `new Date().toUTCString()`.
 * @returns Complete RSS 2.0 XML document
 */
export function generateRssFeed(articleInfos, buildDate = new Date().toUTCString()) {
    const items = articleInfos
        .map((item) => `    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${escapeXML(item.link)}</link>
      <description>${escapeXML(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXML(item.link)}</guid>
      <dc:language>${escapeXML(item.lang)}</dc:language>
    </item>`)
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>EU Parliament Monitor</title>
    <link>${BASE_URL}</link>
    <description>European Parliament Intelligence Platform — monitoring political activity with systematic transparency.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
//# sourceMappingURL=rss.js.map