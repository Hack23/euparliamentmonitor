// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Templates/Sections/Timeline
 * @description Timeline section builder for legislative or procedural events.
 * Split out of `section-builders.ts` (Refactor 8/8).
 */
import { escapeHTML } from '../../utils/file-utils.js';
import { getLocalizedString, TIMELINE_HEADINGS } from '../../constants/languages.js';
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
    const heading = escapeHTML(getLocalizedString(TIMELINE_HEADINGS, lang));
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
    return `<section class="timeline-section" aria-label="${heading}">
  <h2>${heading}</h2>
  <ol class="timeline-list" role="list">
      ${listItems}
  </ol>
</section>`;
}
//# sourceMappingURL=timeline.js.map