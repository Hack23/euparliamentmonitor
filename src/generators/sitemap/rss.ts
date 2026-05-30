// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Sitemap/Rss
 * @description Generates the per-language RSS feeds. English articles are
 * published to `rss.xml`; every other supported language gets its own
 * `rss_<lang>.xml` so feed readers subscribe to a single locale instead
 * of a mixed-language stream. Each feed carries a localized
 * `<title>`/`<description>` channel and items sorted newest-first by
 * `pubDate` and tagged with `<dc:language>`.
 *
 * Extracted from the monolithic `sitemap.ts` so RSS generation can be
 * unit-tested in isolation and so any future feed format (Atom,
 * JSON-Feed, news-specific RSS) reuses the same item shape and escaping.
 */

import { BASE_URL } from '../../constants/config.js';
import {
  getLocalizedString,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  FOOTER_RSS_LABELS,
} from '../../constants/languages.js';
import type { LanguageCode } from '../../types/index.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { escapeXML } from './xml-utils.js';

/**
 * Single RSS feed entry.
 *
 * `pubDate` is expected to already be RFC-822 formatted (the same format
 * the consuming `<pubDate>` element uses). The wrapper does not reformat
 * dates so callers can opt into different cadences (per-day, per-article)
 * without surprising rounding.
 */
export interface RssItem {
  /** Article title */
  readonly title: string;
  /** Absolute article URL */
  readonly link: string;
  /** Plain-text article description */
  readonly description: string;
  /** RFC-822 publication timestamp */
  readonly pubDate: string;
  /** ISO 639-1 language code (e.g. `en`, `sv`, `de`) */
  readonly lang: string;
}

/**
 * Channel-level metadata for an RSS feed (the localized envelope wrapped
 * around the `<item>` list).
 */
export interface RssChannel {
  /** Localized channel title (shown in feed-reader subscription lists) */
  readonly title: string;
  /** Localized channel description */
  readonly description: string;
  /** ISO 639-1 language code for the `<language>` element */
  readonly language: string;
  /** Absolute URL of this feed document (used in `atom:link rel="self"`) */
  readonly selfUrl: string;
}

/**
 * English brand channel — also the default envelope used when
 * {@link generateRssFeed} is called without an explicit channel. Kept as
 * a stable constant so the homepage `rss.xml` channel stays
 * byte-identical across runs and refactors.
 */
export const DEFAULT_RSS_CHANNEL: RssChannel = {
  title: 'EU Parliament Monitor',
  description:
    'European Parliament Intelligence Platform — monitoring political activity with systematic transparency.',
  language: 'en',
  selfUrl: `${BASE_URL}/rss.xml`,
};

/**
 * Resolve the feed filename for a language. English publishes to the
 * canonical `rss.xml`; every other language gets `rss_<lang>.xml`.
 *
 * @param lang - Language code
 * @returns Feed filename (e.g. `rss.xml`, `rss_sv.xml`)
 */
export function getRssFilename(lang: string): string {
  return lang === 'en' ? 'rss.xml' : `rss_${lang}.xml`;
}

/**
 * Build the localized channel envelope for a language's feed. English
 * reuses {@link DEFAULT_RSS_CHANNEL} (the established brand channel);
 * other languages source their title/description from the localized
 * page-metadata maps so subscribers see native-language copy.
 *
 * @param lang - Language code
 * @returns Localized {@link RssChannel}
 */
export function buildRssChannel(lang: LanguageCode): RssChannel {
  if (lang === 'en') return DEFAULT_RSS_CHANNEL;
  return {
    title: getLocalizedString(PAGE_TITLES, lang),
    description: getLocalizedString(PAGE_DESCRIPTIONS, lang),
    language: lang,
    selfUrl: `${BASE_URL}/${getRssFilename(lang)}`,
  };
}

/**
 * Build the `<head>` discovery `<link rel="alternate" type="application/rss+xml">`
 * tag for a page, pointing feed-autodiscovery at the language-matched
 * feed (`rss.xml` for English, `rss_<lang>.xml` otherwise) with a
 * localized title.
 *
 * @param lang - Page language code
 * @param pathPrefix - Prefix prepended to the relative feed filename
 *   (`''` for root pages, `'../'` for pages under `news/`, or an absolute
 *   `${BASE_URL}/` to emit an absolute href).
 * @returns A complete `<link>` element string
 */
export function buildRssAlternateLink(lang: string, pathPrefix = ''): string {
  const href = `${pathPrefix}${getRssFilename(lang)}`;
  const title = `EU Parliament Monitor — ${getLocalizedString(FOOTER_RSS_LABELS, lang)}`;
  return `<link rel="alternate" type="application/rss+xml" title="${escapeHTML(title)}" href="${escapeHTML(href)}">`;
}

/**
 * Generate an RSS 2.0 XML feed for a single language.
 *
 * Every item is escaped via {@link escapeXML} so titles or descriptions
 * containing `&`/`<`/etc. don't break feed readers. The channel-level
 * `<lastBuildDate>` reflects "now" — callers that need deterministic
 * output for tests should pass an explicit `buildDate` override.
 *
 * @param articleInfos - Articles, ideally already sorted newest-first
 * @param buildDate - Optional override for the channel-level
 *   `<lastBuildDate>` (RFC-822 string). Defaults to `new Date().toUTCString()`.
 * @param channel - Optional localized channel envelope. Defaults to the
 *   English {@link DEFAULT_RSS_CHANNEL} so existing call sites stay
 *   byte-compatible.
 * @returns Complete RSS 2.0 XML document
 */
export function generateRssFeed(
  articleInfos: readonly RssItem[],
  buildDate: string = new Date().toUTCString(),
  channel: RssChannel = DEFAULT_RSS_CHANNEL
): string {
  const items = articleInfos
    .map(
      (item) => `    <item>
      <title>${escapeXML(item.title)}</title>
      <link>${escapeXML(item.link)}</link>
      <description>${escapeXML(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXML(item.link)}</guid>
      <dc:language>${escapeXML(item.lang)}</dc:language>
    </item>`
    )
    .join('\n');

  // REUSE-IgnoreStart
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXML(channel.title)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXML(channel.description)}</description>
    <language>${escapeXML(channel.language)}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXML(channel.selfUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
  // REUSE-IgnoreEnd
}
