// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Templates/Sections/KeyFigures
 * @description Key-figures bar builder for quick-scan numeric highlights.
 * Split out of `section-builders.ts` (Refactor 8/8).
 */
import { escapeHTML } from '../../utils/file-utils.js';
import { getLocalizedString, KEY_FIGURES_HEADINGS } from '../../constants/languages.js';
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
    const heading = escapeHTML(getLocalizedString(KEY_FIGURES_HEADINGS, lang));
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
    return `<section class="key-figures-bar" aria-label="${heading}">
  <h2 class="sr-only">${heading}</h2>
  <div class="key-figures-grid" role="list">
      ${cards}
  </div>
</section>`;
}
//# sourceMappingURL=key-figures.js.map