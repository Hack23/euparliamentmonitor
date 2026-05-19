// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/Sections/QualityScore
 * @description Quality scoring helpers and badge rendering for article HTML.
 * Counts words, sections, visualizations, and evidence references on rendered
 * article HTML and emits an `aria-hidden` badge element summarizing the
 * result. Split out of `section-builders.ts` (Refactor 8/8) so each section
 * builder can be unit-tested in isolation.
 */

import { escapeHTML } from '../../utils/file-utils.js';
import type { ArticleQualityScore } from '../../types/index.js';
import { stripScriptBlocks, stripHtmlTags } from '../../utils/html-sanitize.js';

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
 * Compute an article quality score by analysing the rendered HTML content.
 *
 * @param content - Full HTML content string of the article body.
 * @returns `ArticleQualityScore` with word count, section counts, and overall rating.
 */
export function computeArticleQualityScore(content: string): ArticleQualityScore {
  const noScripts = stripScriptBlocks(content);
  const plainText = stripHtmlTags(noScripts).replace(/\s+/g, ' ').trim();
  const wordCount =
    plainText.length > 0 ? plainText.split(' ').filter((w) => w.length > 0).length : 0;

  const totalSections = countMatches(noScripts, /<section\b/g);

  const chartCount = countMatches(noScripts, /data-chart-config/g);
  const dashboardCount = countClassToken(noScripts, 'dashboard');
  const mindmapCount = countClassToken(noScripts, 'mindmap-section');
  const swotCount = countClassToken(noScripts, 'swot-analysis');
  const visualizationCount = chartCount + dashboardCount + mindmapCount + swotCount;

  const analysisSections = totalSections - dashboardCount - mindmapCount - swotCount;

  const evidenceReferences = countMatches(
    noScripts,
    /href="https:\/\/www\.europarl\.europa\.eu\/\w[^"]*"/g
  );

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
 * Build an HTML quality score badge element for an article.
 *
 * The badge is `aria-hidden` since it conveys metadata, not primary content.
 * Returns an empty string for articles with a 'needs-improvement' score to avoid
 * surfacing poor-quality signals to readers.
 *
 * @param score - `ArticleQualityScore` to render.
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
