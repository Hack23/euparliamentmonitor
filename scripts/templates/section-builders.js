// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Templates/SectionBuilders
 * @description Reusable section builder utilities for article template architecture.
 * Provides quality scoring, table of contents generation, quality badge rendering,
 * timeline sections, comparison tables, and key figures bars.
 */
import { escapeHTML } from '../utils/file-utils.js';
import { getLocalizedString, TOC_ARIA_LABELS } from '../constants/languages.js';
import { stripScriptBlocks, stripHtmlTags } from '../utils/html-sanitize.js';
// ─── Localized heading maps (inline, no new language-constants module needed) ─
/** Localized headings for buildTimelineSection */
const TIMELINE_HEADINGS = {
    en: 'Legislative Timeline',
    de: 'Legislativer Zeitplan',
    fr: 'Calendrier législatif',
    es: 'Cronograma legislativo',
    nl: 'Wetgevend tijdpad',
    sv: 'Lagstiftande tidslinje',
    da: 'Lovgivningstidslinje',
    no: 'Lovgivningstidslinje',
    fi: 'Lainsäädäntöaikajana',
    ar: 'الجدول الزمني التشريعي',
    he: 'ציר הזמן החקיקתי',
    ja: '立法タイムライン',
    ko: '입법 일정',
    zh: '立法时间轴',
};
/** Localized "Before" labels for buildComparisonTable */
const COMPARISON_BEFORE = {
    en: 'Before',
    de: 'Vorher',
    fr: 'Avant',
    es: 'Antes',
    nl: 'Vóór',
    sv: 'Före',
    da: 'Før',
    no: 'Før',
    fi: 'Ennen',
    ar: 'قبل',
    he: 'לפני',
    ja: '前',
    ko: '이전',
    zh: '之前',
};
/** Localized "After" labels for buildComparisonTable */
const COMPARISON_AFTER = {
    en: 'After',
    de: 'Nachher',
    fr: 'Après',
    es: 'Después',
    nl: 'Na',
    sv: 'Efter',
    da: 'Efter',
    no: 'Etter',
    fi: 'Jälkeen',
    ar: 'بعد',
    he: 'אחרי',
    ja: '後',
    ko: '이후',
    zh: '之后',
};
/** Localized headings for buildKeyFiguresBar */
const KEY_FIGURES_HEADINGS = {
    en: 'Key Figures',
    de: 'Schlüsselzahlen',
    fr: 'Chiffres clés',
    es: 'Cifras clave',
    nl: 'Kerngetallen',
    sv: 'Nyckeltal',
    da: 'Nøgletal',
    no: 'Nøkkeltall',
    fi: 'Avainluvut',
    ar: 'الأرقام الرئيسية',
    he: 'נתונים מרכזיים',
    ja: '主要数値',
    ko: '주요 수치',
    zh: '关键数据',
};
/**
 * Get a localized label from an inline map, falling back to English.
 *
 * @param map - Map of language codes to strings
 * @param lang - Target language code
 * @returns Localized string or English fallback
 */
function getInlineLabel(map, lang) {
    return map[lang] ?? map['en'] ?? '';
}
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
// stripScriptBlocks is imported from html-sanitize.ts
/**
 * Compute an article quality score by analysing the rendered HTML content.
 *
 * @param content - Full HTML content string of the article body.
 * @returns {@link ArticleQualityScore} with word count, section counts, and overall rating.
 */
export function computeArticleQualityScore(content) {
    // Remove script blocks before tag-stripping to avoid inflating word count.
    // Uses iterative scanning instead of regex to avoid CodeQL js/bad-tag-filter.
    const noScripts = stripScriptBlocks(content);
    // Strip HTML tags to get plain text, then count words
    const plainText = stripHtmlTags(noScripts).replace(/\s+/g, ' ').trim();
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
// ─── New section builders ────────────────────────────────────────────────────
/**
 * Build an HTML timeline section for legislative or procedural events.
 *
 * Renders an ordered list of dated events. Each item includes a date badge
 * and a label. An optional description is included as visible text when
 * provided. Empty items array returns an empty string.
 *
 * @param items - Ordered list of {@link TimelineItem} events to render.
 * @param lang - Language code used for the section heading.
 * @returns HTML string for the timeline `<section>`, or empty string when items is empty.
 */
export function buildTimelineSection(items, lang) {
    if (items.length === 0)
        return '';
    const heading = escapeHTML(getInlineLabel(TIMELINE_HEADINGS, lang));
    const sectionId = 'timeline-section';
    const listItems = items
        .map((item) => {
        const safeDate = escapeHTML(item.date);
        const safeLabel = escapeHTML(item.label);
        const descPart = item.description
            ? `<span class="timeline-description">${escapeHTML(item.description)}</span>`
            : '';
        return (`<li class="timeline-item">` +
            `<span class="timeline-date">${safeDate}</span>` +
            `<span class="timeline-label">${safeLabel}</span>` +
            descPart +
            `</li>`);
    })
        .join('\n      ');
    return `<section class="timeline-section" aria-labelledby="${sectionId}-heading">
  <h2 id="${sectionId}-heading">${heading}</h2>
  <ol class="timeline-list" role="list">
      ${listItems}
  </ol>
</section>`;
}
/**
 * Build an HTML before/after comparison table for legislative changes.
 *
 * Renders a two-column table comparing the state of something before and after
 * a legislative action. When the input arrays have different lengths, the
 * table uses the longer length and renders missing cells as empty strings.
 * Returns an empty string when either array is empty.
 *
 * @param before - Array of "before" state descriptions for the first column.
 * @param after - Array of "after" state descriptions for the second column.
 * @param lang - Language code used for column headings.
 * @returns HTML string for the comparison `<table>`, or empty string when either array is empty.
 */
export function buildComparisonTable(before, after, lang) {
    if (before.length === 0 || after.length === 0)
        return '';
    const beforeLabel = escapeHTML(getInlineLabel(COMPARISON_BEFORE, lang));
    const afterLabel = escapeHTML(getInlineLabel(COMPARISON_AFTER, lang));
    const tableId = 'comparison-table';
    const maxRows = Math.max(before.length, after.length);
    const rows = Array.from({ length: maxRows }, (_, i) => {
        const beforeCell = escapeHTML(before[i] ?? '');
        const afterCell = escapeHTML(after[i] ?? '');
        return (`<tr>` +
            `<td class="comparison-before">${beforeCell}</td>` +
            `<td class="comparison-after">${afterCell}</td>` +
            `</tr>`);
    }).join('\n      ');
    return `<div class="comparison-table-wrapper" role="region" aria-labelledby="${tableId}-caption">
  <table class="comparison-table">
    <caption id="${tableId}-caption" class="sr-only">${beforeLabel} / ${afterLabel}</caption>
    <thead>
      <tr>
        <th scope="col">${beforeLabel}</th>
        <th scope="col">${afterLabel}</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`;
}
/**
 * Build an HTML key figures bar for quick-scan numeric highlights.
 *
 * Renders a horizontal strip of numeric summary cards. Each card shows a
 * value (with optional unit), a label, and an optional screen-reader-only
 * description. Empty figures array returns an empty string.
 *
 * @param figures - Array of {@link KeyFigure} items to render.
 * @param lang - Language code used for the section heading.
 * @returns HTML string for the key figures `<section>`, or empty string when figures is empty.
 */
export function buildKeyFiguresBar(figures, lang) {
    if (figures.length === 0)
        return '';
    const heading = escapeHTML(getInlineLabel(KEY_FIGURES_HEADINGS, lang));
    const sectionId = 'key-figures-bar';
    const cards = figures
        .map((fig) => {
        const safeLabel = escapeHTML(fig.label);
        const safeValue = escapeHTML(fig.value);
        const safeUnit = fig.unit ? escapeHTML(fig.unit) : '';
        const unitSpan = safeUnit
            ? ` <span class="kf-unit" aria-hidden="true">${safeUnit}</span>`
            : '';
        const descriptionPart = fig.description
            ? `<span class="sr-only">${escapeHTML(fig.description)}</span>`
            : '';
        return (`<div class="key-figure-card" role="listitem" aria-label="${safeLabel}: ${safeValue}${safeUnit ? ' ' + safeUnit : ''}">` +
            `<span class="kf-value">${safeValue}${unitSpan}</span>` +
            `<span class="kf-label">${safeLabel}</span>` +
            descriptionPart +
            `</div>`);
    })
        .join('\n      ');
    return `<section class="key-figures-bar" aria-labelledby="${sectionId}-heading">
  <h2 id="${sectionId}-heading" class="sr-only">${heading}</h2>
  <div class="key-figures-grid" role="list">
      ${cards}
  </div>
</section>`;
}
//# sourceMappingURL=section-builders.js.map