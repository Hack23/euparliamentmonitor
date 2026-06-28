// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ReaderGuide/Builder
 * @description Build a translated Reader Intelligence Guide as an HTML
 * section. Composes the localized chrome labels (`./labels.js`), the
 * per-section row data (`./rows.js`), and the shared section icons
 * (`./icons.js`).
 */

import type { LanguageCode } from '../../types/index.js';
import { getLocalizedString, getTextDirection } from '../../constants/language-core.js';
import { escapeHTML } from '../../utils/file-utils.js';
import type { TocSection, IncludedArtifact } from '../reader-guide-constants.js';
import { READER_GUIDE_SECTION_ID } from '../reader-guide-constants.js';
import {
  READER_GUIDE_TITLE_LABELS,
  READER_GUIDE_INTRO_LABELS,
  READER_GUIDE_TIP_LABELS,
  READER_GUIDE_COL_NEED_LABELS,
  READER_GUIDE_COL_VALUE_LABELS,
} from './labels.js';
import { READER_GUIDE_ROWS, type GuideRowData } from './rows.js';
import { getReaderGuideSectionIcon } from './icons.js';

/**
 * Build a translated Reader Intelligence Guide as an HTML section.
 * Emits exactly one component with `data-component="reader-intelligence-guide"`
 * for de-duplication detection by E2E tests.
 *
 * The guide renders one row per emitted article section that has a
 * curated reader-need translation (see `READER_GUIDE_ROWS`). The
 * `included` list is no longer surfaced — the previous "source artifact"
 * column duplicated the per-section navigation that the Analysis Index
 * appendix already presents, and clutters the headline reader lens. The
 * parameter is kept on the signature for backward compatibility with
 * callers that may pre-compute the run manifest.
 *
 * @param lang - Target language code
 * @param sections - Emitted section TOC entries, in document order
 * @param _included - (Unused) Included artifacts; kept for API stability
 * @returns HTML fragment for the guide, or empty string if no rows match
 */
export function buildReaderIntelligenceGuideHtml(
  lang: LanguageCode,
  sections: readonly TocSection[],
  _included: readonly IncludedArtifact[] = []
): string {
  const dir = getTextDirection(lang);
  const rows: string[] = [];

  for (const section of sections) {
    const rowData = Object.getOwnPropertyDescriptor(READER_GUIDE_ROWS, section.id)?.value as
      GuideRowData | undefined;
    if (!rowData) continue;

    const need = getLocalizedString(rowData.need, lang);
    const value = getLocalizedString(rowData.value, lang);
    const sectionIcon = getReaderGuideSectionIcon(section.id);

    rows.push(
      `<tr><td><span class="guide-icon" aria-hidden="true">${sectionIcon}</span> <a href="#${escapeHTML(section.id)}">${escapeHTML(need)}</a></td><td>${escapeHTML(value)}</td></tr>`
    );
  }

  if (rows.length === 0) return '';

  const title = getLocalizedString(READER_GUIDE_TITLE_LABELS, lang);
  const intro = getLocalizedString(READER_GUIDE_INTRO_LABELS, lang);
  const tip = getLocalizedString(READER_GUIDE_TIP_LABELS, lang);
  const colNeed = getLocalizedString(READER_GUIDE_COL_NEED_LABELS, lang);
  const colValue = getLocalizedString(READER_GUIDE_COL_VALUE_LABELS, lang);

  return `<section id="${READER_GUIDE_SECTION_ID}" data-component="reader-intelligence-guide" aria-label="${escapeHTML(title)}"${dir === 'rtl' ? ' dir="rtl"' : ''}>
<h2 id="${READER_GUIDE_SECTION_ID}-heading"><span class="guide-icon" aria-hidden="true">🧭</span> ${escapeHTML(title)}</h2>
<p class="reader-guide-intro">${escapeHTML(intro)}</p>
<p class="reader-guide-tip"><span class="guide-icon" aria-hidden="true">💡</span> ${escapeHTML(tip)}</p>
<div class="table-scroll" role="region" tabindex="0" aria-labelledby="${READER_GUIDE_SECTION_ID}-heading">
<table class="reader-guide-table">
<caption class="sr-only">${escapeHTML(title)}</caption>
<thead><tr><th scope="col">${escapeHTML(colNeed)}</th><th scope="col">${escapeHTML(colValue)}</th></tr></thead>
<tbody>
${rows.join('\n')}
</tbody>
</table>
</div>
</section>`;
}
