// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Html/Headline
 * @description Headline / title-related helpers used by the article
 * HTML shell: localized article-type labels (with and without leading
 * icon), the page-title separator that respects bidi direction, and the
 * Schema.org-compatible truncated headline used in JSON-LD.
 */

import {
  ARTICLE_TYPE_LABELS,
  ARTICLE_TYPE_ICONS,
  getLocalizedString,
} from '../../constants/languages.js';
import type { LanguageCode, LanguageMap } from '../../types/index.js';
import { ArticleCategory } from '../../types/index.js';
import { classifyScript, clampTitleForSurface, type SeoSurface } from '../metadata/seo-budgets.js';

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
 * `{articleTitle} {sep} {siteTitle}` pattern.
 *
 * Latin scripts use the policy-mandated ASCII pipe (`" | "`), which
 * scans cleanly in SERP cards and never collides with em-dashes that
 * the editorial style routinely uses inside titles. CJK locales use
 * the Katakana middle-dot (`" ・ "`, U+30FB) which is the documented
 * Google CJK separator and renders correctly in JP / KO / ZH fonts.
 * RTL locales use the Hebrew paseq (`" ׀ "`, U+05C0) — a vertical
 * stroke that preserves bidi flow without injecting a Latin guillemet
 * that would force a direction change mid-title.
 *
 * @param lang - Target language code
 * @returns Per-script separator
 */
export function getTitleSeparator(lang: LanguageCode): string {
  const family = classifyScript(lang);
  if (family === 'cjk') return ' ・ ';
  if (family === 'rtl') return ' ׀ ';
  return ' | ';
}

/**
 * Short brand fallback per script family. Used by
 * {@link buildPageTitle} when the full `SITE_NAME` would push the
 * `<title>` past the SERP budget but a shorter variant would fit.
 *
 * - Latin → "EPM" (3 chars, ASCII-safe in news cards)
 * - CJK → "EPM" (Latin abbreviation reads correctly in JP / KO / ZH SERPs)
 * - RTL → Arabic abbreviation "EPM" works in both Arabic and Hebrew
 *   SERP cards (Bing/Google render the Latin token RTL-isolated)
 *
 * Per-locale overrides live in {@link SHORT_SITE_NAMES} below so a
 * future editorial change (e.g. a registered Arabic brand) only
 * touches the table.
 */
export const SHORT_SITE_NAMES: LanguageMap = {
  en: 'EPM',
  sv: 'EPM',
  da: 'EPM',
  no: 'EPM',
  fi: 'EPM',
  de: 'EPM',
  fr: 'EPM',
  es: 'EPM',
  nl: 'EPM',
  ar: 'EPM',
  he: 'EPM',
  ja: 'EPM',
  ko: 'EPM',
  zh: 'EPM',
};

/**
 * Compose a title for one SEO surface using the per-script byte
 * budget from `metadata/seo-budgets.ts`. Drops the brand suffix when
 * the article title alone fills the budget (better SERP than a
 * truncated headline followed by a clipped brand) and falls through
 * to a short-brand variant when that fits but the full one does not.
 *
 * @param title - Article title (plain text, already markdown-stripped)
 * @param lang - Target language code
 * @param siteTitle - Full brand suffix (e.g. "EU Parliament Monitor")
 * @param surface - Optional SEO surface; defaults to `<title>` budget
 * @returns Composed, budget-clamped title
 */
export function buildPageTitle(
  title: string,
  lang: LanguageCode,
  siteTitle: string,
  surface: SeoSurface = 'title'
): string {
  const shortSiteTitle = getLocalizedString(SHORT_SITE_NAMES, lang);
  return clampTitleForSurface(title, lang, surface, {
    siteTitle,
    shortSiteTitle,
    separator: getTitleSeparator(lang),
  });
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
