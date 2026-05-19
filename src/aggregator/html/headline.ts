// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Html/Headline
 * @description Headline / title-related helpers used by the article
 * HTML shell: localized article-type labels (with and without leading
 * icon), the page-title separator that respects bidi direction, and the
 * Schema.org-compatible truncated headline used in JSON-LD.
 */

import { ARTICLE_TYPE_LABELS, ARTICLE_TYPE_ICONS, getLocalizedString, getTextDirection } from '../../constants/languages.js';
import type { LanguageCode } from '../../types/index.js';
import { ArticleCategory } from '../../types/index.js';

/**
 * Resolve a localized article type label *without* the leading icon
 * emoji. Used for the OpenGraph `article:section` meta and the JSON-LD
 * `articleSection` field, where emoji break Google's NewsArticle
 * structured-data validator.
 *
 * @param slug - Raw article type slug (e.g. "motions", "week-ahead")
 * @param lang - Target language code
 * @returns Localized label without icon (e.g. "Plenary Votes & Resolutions")
 */
export function getLocalizedArticleTypePlain(slug: string, lang: LanguageCode): string {
  const labels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
  return (labels as Record<string, string>)[slug] ?? slug.replace(/-/g, ' ');
}

/**
 * Google's NewsArticle structured-data validator hard-caps the
 * `headline` field at 110 characters. Page `<title>` can be longer
 * (we already truncate to a higher limit in
 * `article-metadata.ts::truncateTitle`), but the JSON-LD headline
 * needs its own, tighter cap or the article loses Top Stories
 * carousel eligibility.
 *
 * Truncation prefers the last sentence boundary or em-dash within
 * the 110-char window so we don't slice through a noun phrase.
 *
 * @param title - Resolved article title (already escaped-safe text)
 * @returns Headline ≤ 110 characters, suitable for `NewsArticle.headline`
 */
export const HEADLINE_LIMIT = 110;
export function truncateHeadline(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length <= HEADLINE_LIMIT) return trimmed;
  // Prefer the last em-dash, en-dash, colon, or sentence boundary
  // before the limit so the truncated headline still reads as a
  // self-contained phrase.
  const window = trimmed.slice(0, HEADLINE_LIMIT);
  const breakIdx = Math.max(
    window.lastIndexOf(' — '),
    window.lastIndexOf(' – '),
    window.lastIndexOf(': '),
    window.lastIndexOf('. '),
    window.lastIndexOf(' ')
  );
  return breakIdx > 60 ? window.slice(0, breakIdx).trimEnd() : window.trimEnd();
}

/**
 * Build the localized `<title>` separator for the
 * `{articleTitle} {sep} {siteTitle}` pattern. LTR locales use the
 * right-pointing guillemet (»); RTL locales (Arabic, Hebrew) use the
 * left-pointing guillemet («) so the visual hierarchy reads from the
 * primary title towards the site name without breaking bidi flow.
 *
 * The previous em-dash separator collided with em-dashes inside
 * article titles (the editorial style uses `Title — Subtitle`) and
 * rendered ambiguously in screen readers.
 *
 * @param lang - Target language code
 * @returns `" » "` for LTR locales, `" « "` for RTL
 */
export function getTitleSeparator(lang: LanguageCode): string {
  return getTextDirection(lang) === 'rtl' ? ' « ' : ' » ';
}

/**
 * Resolve a localized article type label with icon. Falls back to the
 * humanised slug when a translation isn't available.
 *
 * @param slug - Raw article type slug (e.g. "motions", "week-ahead")
 * @param lang - Target language code
 * @returns Localized label with preceding emoji icon (e.g. "🗳️ Plenary Votes & Resolutions")
 */
export function getLocalizedArticleType(slug: string, lang: LanguageCode): string {
  const labels = getLocalizedString(ARTICLE_TYPE_LABELS, lang);
  const label = (labels as Record<string, string>)[slug] ?? slug.replace(/-/g, ' ');
  const categoryValues = Object.values(ArticleCategory) as string[];
  const iconEmoji = categoryValues.includes(slug)
    ? ARTICLE_TYPE_ICONS[slug as ArticleCategory]
    : '📄';
  return `${iconEmoji} ${label}`;
}
