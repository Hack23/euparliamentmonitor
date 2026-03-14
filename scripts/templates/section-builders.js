// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module section-builders
 * @description Reusable section builder utilities for article template architecture.
 * Provides quality scoring, table of contents generation, and quality badge rendering.
 */
import { escapeHTML } from '../utils/file-utils.js';
/**
 * Count occurrences of a regex pattern in a string.
 *
 * @param content - String to search.
 * @param pattern - Global regex pattern to match.
 * @returns Number of matches found.
 */
function countMatches(content, pattern) {
  const matches = content.match(pattern);
  return matches !== null ? matches.length : 0;
}
/**
 * Compute an article quality score by analysing the rendered HTML content.
 *
 * @param content - Full HTML content string of the article body.
 * @returns {@link ArticleQualityScore} with word count, section counts, and overall rating.
 */
export function computeArticleQualityScore(content) {
  // Remove script blocks before tag-stripping to avoid inflating word count
  const noScripts = content.replace(/<script[^>]*>[\s\S]*?<\/script>/giu, ' ');
  // Strip HTML tags to get plain text, then count words
  const plainText = noScripts
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount =
    plainText.length > 0 ? plainText.split(' ').filter((w) => w.length > 0).length : 0;
  // Count total <section tags, then subtract known visualization sections
  const totalSections = countMatches(content, /<section/g);
  // Count data visualizations: data-chart-config, dashboard, mindmap-section, swot-analysis
  const chartCount = countMatches(content, /data-chart-config/g);
  const dashboardCount = countMatches(content, /class="dashboard"/g);
  const mindmapCount = countMatches(content, /class="mindmap-section"/g);
  const swotCount = countMatches(content, /class="swot-analysis"/g);
  const visualizationCount = chartCount + dashboardCount + mindmapCount + swotCount;
  // Exclude visualization sections from analysis section count
  const analysisSections = totalSections - dashboardCount - mindmapCount - swotCount;
  // Count external EP document links as evidence references
  const evidenceReferences = countMatches(content, /href="https:\/\/www\.europarl\.europa\.eu/g);
  // Determine overall quality score
  let overallScore;
  if (wordCount >= 800 && analysisSections >= 3 && visualizationCount >= 2) {
    overallScore = 'excellent';
  } else if (wordCount >= 500 && analysisSections >= 2) {
    overallScore = 'good';
  } else if (wordCount >= 200 && analysisSections >= 1) {
    overallScore = 'adequate';
  } else {
    overallScore = 'needs-improvement';
  }
  return { wordCount, analysisSections, visualizationCount, evidenceReferences, overallScore };
}
/**
 * Build an HTML table of contents navigation element from a list of entries.
 *
 * @param entries - Ordered list of {@link TOCEntry} items to render.
 * @param lang - Language code for the article (reserved for future i18n label).
 * @returns HTML string for the TOC `<nav>` element, or empty string when entries is empty.
 */
export function buildTableOfContents(entries, lang) {
  if (entries.length === 0) {
    return '';
  }
  // lang is accepted for future i18n use (aria-label localisation)
  void lang;
  const items = entries
    .map((entry) => {
      const safeLabel = escapeHTML(entry.label);
      // Strip leading # to prevent href="##foo"
      const safeId = escapeHTML(entry.id.replace(/^#/, ''));
      const classAttr = entry.level === 2 ? ' class="toc-sub"' : '';
      return `<li${classAttr}><a href="#${safeId}">${safeLabel}</a></li>`;
    })
    .join('\n      ');
  return `<nav class="article-toc" aria-label="Table of contents">
  <ol>
      ${items}
  </ol>
</nav>`;
}
/**
 * Build an HTML quality score badge element for an article.
 *
 * The badge is `aria-hidden` since it conveys metadata, not primary content.
 * Returns an empty string for articles with a 'needs-improvement' score to avoid
 * surfacing poor-quality signals to readers.
 *
 * @param score - {@link ArticleQualityScore} to render.
 * @returns HTML string for the badge `<div>`, or empty string for needs-improvement.
 */
export function buildQualityScoreBadge(score) {
  if (score.overallScore === 'needs-improvement') {
    return '';
  }
  const safeScore = escapeHTML(score.overallScore);
  return `<div class="article-quality-score" data-score="${safeScore}" aria-hidden="true">
  <span class="qs-words">${score.wordCount}</span>
  <span class="qs-sections">${score.analysisSections}</span>
  <span class="qs-visuals">${score.visualizationCount}</span>
  <span class="qs-evidence">${score.evidenceReferences}</span>
</div>`;
}
//# sourceMappingURL=section-builders.js.map
