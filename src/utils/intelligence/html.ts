// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Intelligence/Html
 * @description Localised HTML rendering for the "Related Analysis" section
 * embedded in every generated article.
 */

import type { RelationshipLabels } from '../../constants/languages.js';
import { RELATED_ANALYSIS_LABELS, getLocalizedString } from '../../constants/languages.js';
import type { ArticleCrossReference, ArticleIndexEntry, TrendDetection } from './types.js';
import { escapeAttr, escapeText } from './internals.js';

/** Map from 2-letter language codes to BCP 47 locale tags for date formatting */
const LANG_TO_LOCALE: Record<string, string> = {
  en: 'en-GB',
  sv: 'sv-SE',
  da: 'da-DK',
  no: 'nb-NO',
  fi: 'fi-FI',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  nl: 'nl-NL',
  ar: 'ar-SA',
  he: 'he-IL',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
};

/**
 * Format an ISO date string as a human-readable date in the given locale.
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @param lang - Language code (defaults to 'en')
 * @returns Formatted date string
 */
function formatDisplayDate(date: string, lang?: string): string {
  const parts = date.split('-');
  const year = parts[0] ?? '';
  const month = parts[1] ?? '';
  const day = parts[2] ?? '';
  if (!year || !month || !day) return date;
  const d = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)));
  const locale = LANG_TO_LOCALE[lang ?? 'en'] ?? 'en-GB';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/**
 * Generate an HTML `<section>` listing related articles, cross-references, and
 * emerging trends for embedding in a generated article.
 *
 * Produces accessible markup with `aria-label` and `rel="noopener noreferrer"`.
 * UI strings and date formatting are localised based on the `lang` parameter.
 *
 * @param relatedArticles - Articles related to the current article
 * @param crossRefs - Cross-references from the current article
 * @param trends - Trends relevant to the current article
 * @param lang - Language code for localisation (defaults to 'en')
 * @returns HTML string for the "Related Analysis" section, or empty string if nothing to show
 */
export function buildRelatedArticlesHTML(
  relatedArticles: ArticleIndexEntry[],
  crossRefs: ArticleCrossReference[],
  trends: TrendDetection[],
  lang?: string
): string {
  if (relatedArticles.length === 0 && crossRefs.length === 0 && trends.length === 0) {
    return '';
  }

  const strings = getLocalizedString(RELATED_ANALYSIS_LABELS, lang ?? 'en');

  const listItems = crossRefs
    .map((ref) => {
      const article = relatedArticles.find((a) => a.id === ref.targetArticleId);
      const label =
        strings.relationships[ref.relationship as keyof RelationshipLabels] ??
        strings.relatedArticle;
      if (article) {
        const displayDate = formatDisplayDate(article.date, lang);
        const filename = `${article.id}.html`;
        return `    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">${escapeText(label)}: ${escapeText(ref.context)} (${escapeText(displayDate)})</a></li>`;
      }
      const filename = `${ref.targetArticleId}.html`;
      return `    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">${escapeText(label)}: ${escapeText(ref.context)}</a></li>`;
    })
    .filter(Boolean);

  if (listItems.length === 0 && relatedArticles.length > 0) {
    for (const article of relatedArticles) {
      const displayDate = formatDisplayDate(article.date, lang);
      const filename = `${article.id}.html`;
      listItems.push(
        `    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">${escapeText(strings.relatedArticle)}: ${escapeText(article.type)} (${escapeText(displayDate)})</a></li>`
      );
    }
  }

  const trendBlocks = trends
    .map((trend) => {
      const count = trend.articleReferences.length;
      return `  <div class="emerging-trends">
    <h4>${escapeText(strings.emergingTrend)}: ${escapeText(trend.name)}</h4>
    <p>${count} ${escapeText(strings.trendTracking)} ${escapeText(trend.name.toLowerCase())} (${escapeText(strings.confidence)}: ${escapeText(trend.confidence)})</p>
  </div>`;
    })
    .join('\n');

  const listSection = listItems.length > 0 ? `  <ul>\n${listItems.join('\n')}\n  </ul>` : '';

  const parts = [
    `<section class="related-articles" aria-label="${escapeAttr(strings.sectionLabel)}">`,
  ];
  parts.push(`  <h3>${escapeText(strings.heading)}</h3>`);
  if (listSection) parts.push(listSection);
  if (trendBlocks) parts.push(trendBlocks);
  parts.push('</section>');

  return parts.join('\n');
}
