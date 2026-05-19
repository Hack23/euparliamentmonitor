// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Html/Toc
 * @description Article-level Table-of-Contents builder. Renders a
 * labelled `<nav class="article-toc">` sidebar with one entry per
 * emitted H2 section; entries are prefixed with a contextual emoji icon
 * that mirrors the Reader Intelligence Guide so the two navigation
 * surfaces share a single visual vocabulary.
 */
import { TOC_ARIA_LABELS, TRADECRAFT_HEADING_LABELS, ANALYSIS_INDEX_HEADING_LABELS, KEY_TAKEAWAYS_HEADING_LABELS, SUPPLEMENTARY_HEADING_LABELS, SECTION_TITLE_LABELS, getLocalizedString, } from '../../constants/languages.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { READER_GUIDE_SECTION_ID } from '../reader-guide-constants.js';
import { READER_GUIDE_TITLE_LABELS, getReaderGuideSectionIcon, } from '../reader-intelligence-guide.js';
import { TRADECRAFT_SECTION_ID, MANIFEST_SECTION_ID, SUPPLEMENTARY_SECTION_ID, } from '../artifact-order.js';
import { KEY_TAKEAWAYS_SECTION_ID } from '../key-takeaways.js';
/**
 * Resolve a localized title for a TOC entry based on its section ID.
 * Falls back to the original English title if no translation is available.
 *
 * @param sectionId - The fragment identifier of the section
 * @param fallbackTitle - The English title to fall back to
 * @param lang - Target language code
 * @returns Localized title string
 */
export function getLocalizedTocTitle(sectionId, fallbackTitle, lang) {
    if (sectionId === READER_GUIDE_SECTION_ID) {
        return getLocalizedString(READER_GUIDE_TITLE_LABELS, lang);
    }
    if (sectionId === TRADECRAFT_SECTION_ID) {
        return getLocalizedString(TRADECRAFT_HEADING_LABELS, lang);
    }
    if (sectionId === MANIFEST_SECTION_ID) {
        return getLocalizedString(ANALYSIS_INDEX_HEADING_LABELS, lang);
    }
    if (sectionId === KEY_TAKEAWAYS_SECTION_ID) {
        return getLocalizedString(KEY_TAKEAWAYS_HEADING_LABELS, lang);
    }
    if (sectionId === SUPPLEMENTARY_SECTION_ID) {
        return getLocalizedString(SUPPLEMENTARY_HEADING_LABELS, lang);
    }
    const sectionKey = sectionId.replace(/^section-/, '');
    const sectionLabels = SECTION_TITLE_LABELS[sectionKey];
    if (sectionLabels) {
        return getLocalizedString(sectionLabels, lang);
    }
    return fallbackTitle;
}
/**
 * Resolve the visual icon glyph used as the Table-of-Contents bullet for
 * a given section. Reuses {@link getReaderGuideSectionIcon} for the
 * canonical artifact sections (so the TOC and the Reader Intelligence
 * Guide share the same visual vocabulary), and adds dedicated icons for
 * the aggregator-owned appendix anchors that the guide does not list.
 *
 * @param sectionId - Anchor id of the section (e.g. `section-risk`,
 *                    `aggregator-tradecraft-references`)
 * @returns Single emoji glyph used as the `guide-icon` for that entry
 */
export function getTocSectionIcon(sectionId) {
    if (sectionId === READER_GUIDE_SECTION_ID)
        return '🧭';
    if (sectionId === KEY_TAKEAWAYS_SECTION_ID)
        return '🔑';
    if (sectionId === SUPPLEMENTARY_SECTION_ID)
        return '🗂️';
    if (sectionId === TRADECRAFT_SECTION_ID)
        return '🛠️';
    if (sectionId === MANIFEST_SECTION_ID)
        return '📚';
    return getReaderGuideSectionIcon(sectionId);
}
/**
 * Build the article-level Table of Contents nav. Renders a labelled
 * `<nav class="article-toc">` with one `<a>` per H2 section, keyed by the
 * stable fragment ids produced by the aggregator. The containing `<aside>`
 * is styled as a sticky, full-height sidebar on wide viewports and
 * collapses into a `<details>` disclosure on narrow viewports via
 * `styles.css`. Each entry is prefixed with a contextual emoji icon so
 * readers can scan the navigation visually as well as textually.
 *
 * Returns an empty string when `entries` is empty so low-signal
 * `ANALYSIS_ONLY` articles (few sections, no value in a TOC) stay compact.
 *
 * @param entries - Ordered list of emitted H2 sections
 * @param lang - Language code used to localise the nav label
 * @returns HTML fragment for the sidebar, or `""` when no TOC is needed
 */
export function buildArticleToc(entries, lang) {
    if (entries.length === 0)
        return '';
    const label = escapeHTML(getLocalizedString(TOC_ARIA_LABELS, lang));
    const items = entries
        .map((e) => {
        const displayTitle = getLocalizedTocTitle(e.id, e.title, lang);
        const icon = getTocSectionIcon(e.id);
        return `        <li><a href="#${escapeHTML(e.id)}"><span class="article-toc-icon" aria-hidden="true">${icon}</span> <span class="article-toc-text">${escapeHTML(displayTitle)}</span></a></li>`;
    })
        .join('\n');
    return [
        `  <aside class="article-toc-container" aria-labelledby="article-toc-heading">`,
        `    <details class="article-toc-details" open>`,
        `      <summary class="article-toc-summary" id="article-toc-heading"><span class="guide-icon" aria-hidden="true">📑</span> ${label}</summary>`,
        `      <nav class="article-toc" aria-labelledby="article-toc-heading">`,
        `        <ol class="article-toc-list">`,
        items,
        `        </ol>`,
        `      </nav>`,
        `    </details>`,
        `  </aside>`,
        '',
    ].join('\n');
}
//# sourceMappingURL=toc.js.map