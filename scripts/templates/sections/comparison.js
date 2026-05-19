// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Templates/Sections/Comparison
 * @description Before/after comparison table builder for legislative change visualisation.
 * Split out of `section-builders.ts` (Refactor 8/8).
 */
import { escapeHTML } from '../../utils/file-utils.js';
import { getLocalizedString, COMPARISON_BEFORE_LABELS, COMPARISON_AFTER_LABELS, } from '../../constants/languages.js';
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
    const beforeLabel = escapeHTML(getLocalizedString(COMPARISON_BEFORE_LABELS, lang));
    const afterLabel = escapeHTML(getLocalizedString(COMPARISON_AFTER_LABELS, lang));
    const maxRows = Math.max(before.length, after.length);
    const rows = Array.from({ length: maxRows }, (_, i) => {
        const beforeCell = escapeHTML(before[i] ?? '');
        const afterCell = escapeHTML(after[i] ?? '');
        return (`<tr>` +
            `<td class="comparison-before">${beforeCell}</td>` +
            `<td class="comparison-after">${afterCell}</td>` +
            `</tr>`);
    }).join('\n      ');
    return `<div class="comparison-table-wrapper" role="region" aria-label="${beforeLabel} / ${afterLabel}">
  <table class="comparison-table">
    <caption class="sr-only">${beforeLabel} / ${afterLabel}</caption>
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
//# sourceMappingURL=comparison.js.map