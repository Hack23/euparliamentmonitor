// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Templates/SectionBuilders
 * @description Reusable section builder utilities for article template architecture.
 * Provides quality scoring, table of contents generation, and quality badge rendering.
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, TOC_ARIA_LABELS } from '../constants/languages.js';
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
function countClassToken(content, token) {
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
 * Remove all `<script>…</script>` blocks from an HTML string, replacing each
 * with a single space.
 *
 * Uses iterative index-based scanning instead of a single-pass regex so that
 * CodeQL does not flag the pattern as an insecure HTML tag filter
 * (`js/bad-tag-filter`).
 *
 * @param html - HTML string to strip
 * @returns The HTML with script blocks replaced by spaces
 */
function stripScriptBlocks(html) {
    let result = '';
    let pos = 0;
    const lower = html.toLowerCase();
    while (pos < html.length) {
        const openIdx = lower.indexOf('<script', pos);
        if (openIdx < 0) {
            result += html.slice(pos);
            break;
        }
        result += html.slice(pos, openIdx);
        const openEnd = html.indexOf('>', openIdx);
        if (openEnd < 0) {
            result += html.slice(openIdx);
            break;
        }
        const closeIdx = lower.indexOf('</script', openEnd + 1);
        if (closeIdx < 0) {
            result += ' ';
            break;
        }
        const closeEnd = html.indexOf('>', closeIdx);
        if (closeEnd < 0) {
            result += ' ';
            break;
        }
        result += ' ';
        pos = closeEnd + 1;
    }
    return result;
}
/**
 * Compute an article quality score by analysing the rendered HTML content.
 *
 * @param content - Full HTML content string of the article body.
 * @returns {@link ArticleQualityScore} with word count, section counts, and overall rating.
 */
export function computeArticleQualityScore(content) {
    // Remove script blocks before tag-stripping to avoid inflating word count
    // Remove script blocks before tag-stripping to avoid inflating word count.
    // Uses iterative scanning instead of regex to avoid CodeQL js/bad-tag-filter.
    const noScripts = stripScriptBlocks(content);
    // Strip HTML tags to get plain text, then count words
    const plainText = noScripts
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const wordCount = plainText.length > 0 ? plainText.split(' ').filter((w) => w.length > 0).length : 0;
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
    const evidenceReferences = countMatches(noScripts, /href="https:\/\/www\.europarl\.europa\.eu\/\w[^"]*"/g);
    // Determine overall quality score
    let overallScore;
    if (wordCount >= 800 && analysisSections >= 3 && visualizationCount >= 2) {
        overallScore = 'excellent';
    }
    else if (wordCount >= 500 && analysisSections >= 2) {
        overallScore = 'good';
    }
    else if (wordCount >= 200 && analysisSections >= 1) {
        overallScore = 'adequate';
    }
    else {
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
export function buildTableOfContents(entries, lang) {
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