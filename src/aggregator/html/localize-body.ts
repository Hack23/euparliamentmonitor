// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Html/LocalizeBody
 * @description Localize the Tradecraft References and Analysis Index
 * appendix sections inside the rendered article body. Replaces English
 * headings, intro paragraphs, sub-headings, and table column headers
 * with their translated equivalents, using indexOf-based search to stay
 * within CodeQL's safe-regex envelope.
 */

import {
  TRADECRAFT_HEADING_LABELS,
  TRADECRAFT_INTRO_LABELS,
  TRADECRAFT_METHODOLOGIES_LABELS,
  TRADECRAFT_TEMPLATES_LABELS,
  ANALYSIS_INDEX_HEADING_LABELS,
  ANALYSIS_INDEX_INTRO_LABELS,
  ANALYSIS_INDEX_COL_SECTION_LABELS,
  ANALYSIS_INDEX_COL_ARTIFACT_LABELS,
  ANALYSIS_INDEX_COL_PATH_LABELS,
  KEY_TAKEAWAYS_HEADING_LABELS,
  SUPPLEMENTARY_HEADING_LABELS,
  getLocalizedString,
} from '../../constants/languages.js';
import { escapeHTML } from '../../utils/file-utils.js';
import type { LanguageCode } from '../../types/index.js';
import {
  TRADECRAFT_SECTION_ID,
  MANIFEST_SECTION_ID,
  SUPPLEMENTARY_SECTION_ID,
} from '../artifact-order.js';
import { KEY_TAKEAWAYS_SECTION_ID } from '../key-takeaways.js';

/**
 * Localize the Tradecraft References and Analysis Index sections in the
 * rendered article body HTML. Replaces English headings, introductions,
 * sub-headings, and table headers with translated equivalents.
 *
 * @param bodyHtml - The rendered HTML body (from Markdown)
 * @param lang - Target language code
 * @returns HTML body with localized appendix sections
 */
export function localizeArticleBody(bodyHtml: string, lang: LanguageCode): string {
  if (lang === 'en') return bodyHtml;

  let html = bodyHtml;

  const tradecraftHeading = getLocalizedString(TRADECRAFT_HEADING_LABELS, lang);
  html = replaceHeadingById(
    html,
    TRADECRAFT_SECTION_ID,
    'Tradecraft References',
    tradecraftHeading
  );

  const tradecraftIntroRaw = getLocalizedString(TRADECRAFT_INTRO_LABELS, lang);
  const introSentenceStart = 'This article is produced under the ';
  const introIdx = html.indexOf(introSentenceStart);
  if (introIdx !== -1) {
    const sentenceEnd = html.indexOf('</p>', introIdx);
    if (sentenceEnd !== -1) {
      const escapedIntro = escapeHTML(tradecraftIntroRaw);
      const localizedWithLink = escapedIntro.replace(
        escapeHTML('Hack23 AB'),
        '<a href="https://hack23.com">Hack23 AB</a>'
      );
      html = html.slice(0, introIdx) + localizedWithLink + html.slice(sentenceEnd);
    }
  }

  const methodsLabel = getLocalizedString(TRADECRAFT_METHODOLOGIES_LABELS, lang);
  html = replaceFirstStringIn(
    html,
    '<span>Methodologies</span>',
    `<span>${escapeHTML(methodsLabel)}</span>`
  );
  html = replaceFirstStringIn(
    html,
    '<h3>Methodologies</h3>',
    `<h3>${escapeHTML(methodsLabel)}</h3>`
  );

  const templatesLabel = getLocalizedString(TRADECRAFT_TEMPLATES_LABELS, lang);
  html = replaceFirstStringIn(
    html,
    '<span>Artifact templates</span>',
    `<span>${escapeHTML(templatesLabel)}</span>`
  );
  html = replaceFirstStringIn(
    html,
    '<h3>Artifact templates</h3>',
    `<h3>${escapeHTML(templatesLabel)}</h3>`
  );

  const analysisIndexHeading = getLocalizedString(ANALYSIS_INDEX_HEADING_LABELS, lang);
  html = replaceHeadingById(html, MANIFEST_SECTION_ID, 'Analysis Index', analysisIndexHeading);

  const analysisIndexIntroRaw = getLocalizedString(ANALYSIS_INDEX_INTRO_LABELS, lang);
  const manifestLinkPrefix = 'href="';
  const manifestJsonLiteral = 'manifest.json';
  const manifestLinkIdx = html.indexOf(manifestJsonLiteral);
  let manifestUrl = '';
  if (manifestLinkIdx !== -1) {
    const hrefIdx = html.lastIndexOf(manifestLinkPrefix, manifestLinkIdx);
    if (hrefIdx !== -1 && manifestLinkIdx - hrefIdx < 200) {
      const urlStart = hrefIdx + manifestLinkPrefix.length;
      const urlEnd = html.indexOf('"', urlStart);
      if (urlEnd !== -1) {
        manifestUrl = html.slice(urlStart, urlEnd);
      }
    }
  }
  const escapedAnalysisIntro = escapeHTML(analysisIndexIntroRaw);
  const localizedIntroWithLink = manifestUrl
    ? escapedAnalysisIntro.replace(
        'manifest.json',
        `<a href="${escapeHTML(manifestUrl)}">manifest.json</a>`
      )
    : escapedAnalysisIntro;
  const analysisIntroStart = 'Every artifact below was read by the aggregator';
  const analysisIntroIdx = html.indexOf(analysisIntroStart);
  if (analysisIntroIdx !== -1) {
    const analysisIntroEnd = html.indexOf('gate-result history.', analysisIntroIdx);
    if (analysisIntroEnd !== -1) {
      const endOffset = analysisIntroEnd + 'gate-result history.'.length;
      html = html.slice(0, analysisIntroIdx) + localizedIntroWithLink + html.slice(endOffset);
    }
  }

  const colSection = getLocalizedString(ANALYSIS_INDEX_COL_SECTION_LABELS, lang);
  const colArtifact = getLocalizedString(ANALYSIS_INDEX_COL_ARTIFACT_LABELS, lang);
  const colPath = getLocalizedString(ANALYSIS_INDEX_COL_PATH_LABELS, lang);
  html = html.replace(
    '<th>Section</th><th>Artifact</th><th>Path</th>',
    `<th>${escapeHTML(colSection)}</th><th>${escapeHTML(colArtifact)}</th><th>${escapeHTML(colPath)}</th>`
  );

  const keyTakeawaysHeading = getLocalizedString(KEY_TAKEAWAYS_HEADING_LABELS, lang);
  html = replaceHeadingById(html, KEY_TAKEAWAYS_SECTION_ID, 'Key Takeaways', keyTakeawaysHeading);

  const supplementaryHeading = getLocalizedString(SUPPLEMENTARY_HEADING_LABELS, lang);
  html = replaceHeadingById(
    html,
    SUPPLEMENTARY_SECTION_ID,
    'Supplementary Intelligence',
    supplementaryHeading
  );

  return html;
}

/**
 * Replace the first literal occurrence of `needle` in `haystack` with
 * `replacement`. Uses `indexOf` rather than `String.prototype.replace`
 * with a regex so we don't fall foul of the security/detect-unsafe-regex
 * lint rule, and so we never accidentally interpret regex metacharacters
 * inside `needle` or `$1`-style references inside `replacement`.
 *
 * @param haystack - String to search in
 * @param needle - Literal substring to replace
 * @param replacement - Literal replacement text (no `$` escaping needed)
 * @returns Modified string, or `haystack` unchanged when `needle` is absent
 */
export function replaceFirstStringIn(haystack: string, needle: string, replacement: string): string {
  const idx = haystack.indexOf(needle);
  if (idx === -1) return haystack;
  return haystack.slice(0, idx) + replacement + haystack.slice(idx + needle.length);
}

/**
 * Replace an H2 heading's text content by locating it via its `id` attribute.
 * Uses indexOf-based search to avoid polynomial regex backtracking (CodeQL).
 *
 * @param html - Full HTML string
 * @param sectionId - The id attribute value of the target `<h2>`
 * @param englishTitle - The English title text to replace
 * @param localizedTitle - The localized title to insert
 * @returns Updated HTML string
 */
export function replaceHeadingById(
  html: string,
  sectionId: string,
  englishTitle: string,
  localizedTitle: string
): string {
  const idMarker = `id="${sectionId}"`;
  let idIdx = html.indexOf(idMarker);
  if (idIdx === -1) {
    const idMarkerSingle = `id='${sectionId}'`;
    idIdx = html.indexOf(idMarkerSingle);
  }
  if (idIdx === -1) return html;

  const tagCloseIdx = html.indexOf('>', idIdx);
  if (tagCloseIdx === -1) return html;

  const titleStart = tagCloseIdx + 1;
  const titleEnd = html.indexOf('<', titleStart);
  if (titleEnd === -1) return html;

  const existingTitle = html.slice(titleStart, titleEnd);
  if (existingTitle.trim() !== englishTitle) return html;

  return html.slice(0, titleStart) + escapeHTML(localizedTitle) + html.slice(titleEnd);
}
