// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/SectionBuilders
 * @description Reusable section builder utilities for article template architecture.
 * Provides quality scoring, table of contents generation, and quality badge rendering.
 */

import { escapeHTML } from '../utils/file-utils.js';
import type { ArticleQualityScore, TOCEntry, LanguageCode } from '../types/index.js';
import { getLocalizedString, TOC_ARIA_LABELS } from '../constants/languages.js';

/**
 * Count occurrences of a regex pattern in a string.
 *
 * @param content - String to search.
 * @param pattern - Global regex pattern to match.
 * @returns Number of matches found.
 */
function countMatches(content: string, pattern: RegExp): number {
  const matches = content.match(pattern);
  return matches !== null ? matches.length : 0;
}

/**
 * Count elements whose `class` attribute contains a given CSS class token.
 *
 * Extracts every `class="…"` attribute, splits the value into tokens, and
 * checks for an exact match — so `"dashboard"` will NOT match nested
 * classes like `"dashboard-grid"` or `"dashboard-panel"`.
 *
 * @param content - HTML string to search.
 * @param token - Exact CSS class name to look for.
 * @returns Number of elements that have the given class token.
 */
function countClassToken(content: string, token: string): number {
  let count = 0;
  for (const m of content.matchAll(/class="([^"]*)"/g)) {
    const value = m[1] ?? '';
    if (value.split(/\s+/).includes(token)) {
      count += 1;
    }
  }
  return count;
}

/**
 * Remove all `<script>…</script>` blocks from HTML using iterative
 * index-based scanning instead of regex, avoiding CodeQL `js/bad-tag-filter`
 * alerts that fire on regex-based `<script>` stripping.
 *
 * @param html - HTML string to process.
 * @returns HTML with all script blocks replaced by a single space.
 */
function stripScriptBlocks(html: string): string {
  let result = '';
  let pos = 0;
  const lower = html.toLowerCase();

  while (pos < html.length) {
    const openIdx = lower.indexOf('<script', pos);
    if (openIdx === -1) {
      result += html.slice(pos);
      break;
    }
    // Copy everything before the <script tag
    result += html.slice(pos, openIdx);
    result += ' ';

    // Find the closing </script> tag
    const closeTag = '</script';
    const closeIdx = lower.indexOf(closeTag, openIdx);
    if (closeIdx === -1) {
      // No closing tag found — discard the rest
      break;
    }
    // Skip past the closing `>` of </script…>
    const endIdx = html.indexOf('>', closeIdx + closeTag.length);
    pos = endIdx === -1 ? html.length : endIdx + 1;
  }

  return result;
}

/**
 * Compute an article quality score by analysing the rendered HTML content.
 *
 * @param content - Full HTML content string of the article body.
 * @returns {@link ArticleQualityScore} with word count, section counts, and overall rating.
 */
export function computeArticleQualityScore(content: string): ArticleQualityScore {
  // Remove script blocks before tag-stripping to avoid inflating word count.
  // Uses iterative scanning instead of regex to avoid CodeQL js/bad-tag-filter.
  const noScripts = stripScriptBlocks(content);
  // Strip HTML tags to get plain text, then count words
  const plainText = noScripts
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount =
    plainText.length > 0 ? plainText.split(' ').filter((w) => w.length > 0).length : 0;

  // All further counting uses script-stripped HTML to avoid false positives
  // from embedded JSON-LD or interactive script blocks.
  const totalSections = countMatches(noScripts, /<section\b/g);

  // Count data visualizations using exact class-token matching.
  // countClassToken splits the class attribute value into tokens, so nested
  // classes like "dashboard-grid" or "dashboard-panel" are NOT counted.
  const chartCount = countMatches(noScripts, /data-chart-config/g);
  const dashboardCount = countClassToken(noScripts, 'dashboard');
  const mindmapCount = countClassToken(noScripts, 'mindmap-section');
  const swotCount = countClassToken(noScripts, 'swot-analysis');
  const visualizationCount = chartCount + dashboardCount + mindmapCount + swotCount;

  // Exclude visualization sections from analysis section count
  const analysisSections = totalSections - dashboardCount - mindmapCount - swotCount;

  // Count EP document links (with a real path, not just the bare homepage).
  // This excludes the generic footer link `https://www.europarl.europa.eu/`
  // while counting links to specific EP resources like /doceo/, /plenary/, etc.
  const evidenceReferences = countMatches(
    noScripts,
    /href="https:\/\/www\.europarl\.europa\.eu\/\w[^"]*"/g
  );

  // Determine overall quality score
  let overallScore: ArticleQualityScore['overallScore'];
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
 * @param lang - Language code used for the localised aria-label.
 * @returns HTML string for the TOC `<nav>` element, or empty string when entries is empty.
 */
export function buildTableOfContents(entries: TOCEntry[], lang: LanguageCode): string {
  if (entries.length === 0) {
    return '';
  }

  const ariaLabel = escapeHTML(getLocalizedString(TOC_ARIA_LABELS, lang));

  const items = entries
    .map((entry) => {
      const safeLabel = escapeHTML(entry.label);
      // Strip leading # to prevent href="##foo"
      const safeId = escapeHTML(entry.id.replace(/^#/, ''));
      const classAttr = entry.level === 2 ? ' class="toc-sub"' : '';
      return `<li${classAttr}><a href="#${safeId}">${safeLabel}</a></li>`;
    })
    .join('\n      ');

  return `<nav class="article-toc" aria-label="${ariaLabel}">
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
export function buildQualityScoreBadge(score: ArticleQualityScore): string {
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
