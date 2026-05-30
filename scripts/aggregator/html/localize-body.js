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
import { TRADECRAFT_HEADING_LABELS, TRADECRAFT_INTRO_LABELS, TRADECRAFT_METHODOLOGIES_LABELS, TRADECRAFT_TEMPLATES_LABELS, ANALYSIS_INDEX_HEADING_LABELS, ANALYSIS_INDEX_INTRO_LABELS, ANALYSIS_INDEX_COL_SECTION_LABELS, ANALYSIS_INDEX_COL_ARTIFACT_LABELS, ANALYSIS_INDEX_COL_PATH_LABELS, KEY_TAKEAWAYS_HEADING_LABELS, SUPPLEMENTARY_HEADING_LABELS, getLocalizedString, } from '../../constants/languages.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { TRADECRAFT_SECTION_ID, MANIFEST_SECTION_ID, SUPPLEMENTARY_SECTION_ID, } from '../artifact-order.js';
import { KEY_TAKEAWAYS_SECTION_ID } from '../key-takeaways.js';
import { READER_GUIDE_SECTION_ID } from '../reader-guide-constants.js';
/**
 * Top-level section anchors that mark the **end** of the Executive Brief
 * body. Canonical analysis sections are matched by the shared
 * `id="section-…"` prefix (see {@link findExecutiveBriefSectionCut});
 * the appendix and reader-guide sections below carry bespoke ids that do
 * **not** share that prefix, so they are matched explicitly. Including
 * them ensures the localized brief splice also fires on sparse runs where
 * the Executive Brief is the last canonical section and only appendix
 * blocks follow it.
 */
const EXECUTIVE_BRIEF_BOUNDARY_ID_MARKERS = [
    `id="${READER_GUIDE_SECTION_ID}"`,
    `id="${TRADECRAFT_SECTION_ID}"`,
    `id="${MANIFEST_SECTION_ID}"`,
    `id="${SUPPLEMENTARY_SECTION_ID}"`,
];
/**
 * Localize the Tradecraft References and Analysis Index sections in the
 * rendered article body HTML. Replaces English headings, introductions,
 * sub-headings, and table headers with translated equivalents.
 *
 * @param bodyHtml - The rendered HTML body (from Markdown)
 * @param lang - Target language code
 * @returns HTML body with localized appendix sections
 */
export function localizeArticleBody(bodyHtml, lang) {
    if (lang === 'en')
        return bodyHtml;
    let html = bodyHtml;
    const tradecraftHeading = getLocalizedString(TRADECRAFT_HEADING_LABELS, lang);
    html = replaceHeadingById(html, TRADECRAFT_SECTION_ID, 'Tradecraft References', tradecraftHeading);
    const tradecraftIntroRaw = getLocalizedString(TRADECRAFT_INTRO_LABELS, lang);
    const introSentenceStart = 'This article is produced under the ';
    const introIdx = html.indexOf(introSentenceStart);
    if (introIdx !== -1) {
        const sentenceEnd = html.indexOf('</p>', introIdx);
        if (sentenceEnd !== -1) {
            const escapedIntro = escapeHTML(tradecraftIntroRaw);
            const localizedWithLink = escapedIntro.replace(escapeHTML('Hack23 AB'), '<a href="https://hack23.com">Hack23 AB</a>');
            html = html.slice(0, introIdx) + localizedWithLink + html.slice(sentenceEnd);
        }
    }
    const methodsLabel = getLocalizedString(TRADECRAFT_METHODOLOGIES_LABELS, lang);
    html = replaceFirstStringIn(html, '<span>Methodologies</span>', `<span>${escapeHTML(methodsLabel)}</span>`);
    html = replaceFirstStringIn(html, '<h3>Methodologies</h3>', `<h3>${escapeHTML(methodsLabel)}</h3>`);
    const templatesLabel = getLocalizedString(TRADECRAFT_TEMPLATES_LABELS, lang);
    html = replaceFirstStringIn(html, '<span>Artifact templates</span>', `<span>${escapeHTML(templatesLabel)}</span>`);
    html = replaceFirstStringIn(html, '<h3>Artifact templates</h3>', `<h3>${escapeHTML(templatesLabel)}</h3>`);
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
        ? escapedAnalysisIntro.replace('manifest.json', `<a href="${escapeHTML(manifestUrl)}">manifest.json</a>`)
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
    html = html.replace('<th>Section</th><th>Artifact</th><th>Path</th>', `<th>${escapeHTML(colSection)}</th><th>${escapeHTML(colArtifact)}</th><th>${escapeHTML(colPath)}</th>`);
    const keyTakeawaysHeading = getLocalizedString(KEY_TAKEAWAYS_HEADING_LABELS, lang);
    html = replaceHeadingById(html, KEY_TAKEAWAYS_SECTION_ID, 'Key Takeaways', keyTakeawaysHeading);
    const supplementaryHeading = getLocalizedString(SUPPLEMENTARY_HEADING_LABELS, lang);
    html = replaceHeadingById(html, SUPPLEMENTARY_SECTION_ID, 'Supplementary Intelligence', supplementaryHeading);
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
export function replaceFirstStringIn(haystack, needle, replacement) {
    const idx = haystack.indexOf(needle);
    if (idx === -1)
        return haystack;
    return haystack.slice(0, idx) + replacement + haystack.slice(idx + needle.length);
}
/**
 * Locate the cut point that ends the Executive Brief body — the start of
 * the next top-level boundary heading after `afterHeading`. A boundary is
 * any `<h2>` whose `id` either starts with the canonical `section-` prefix
 * or exactly matches one of {@link EXECUTIVE_BRIEF_BOUNDARY_ID_MARKERS}
 * (Reader Guide / Tradecraft / Analysis Index / Supplementary appendices).
 *
 * Critically, this only matches **top-level** section anchors — never the
 * brief's own internal `<h2>` sub-headings (`## BLUF`, `## 60-Second Read`,
 * …), which carry slugified ids without the `section-` prefix. That is why
 * we cannot simply look for the next `<h2`.
 *
 * Uses `indexOf`/`lastIndexOf` exclusively (no regex) to stay within
 * CodeQL's safe-regex envelope.
 *
 * @param html - Full article body HTML
 * @param afterHeading - Index immediately after the Executive Brief `</h2>`
 * @returns Index of the next boundary `<h2`, or `-1` when the Executive
 *          Brief is the last block in the body.
 */
export function findExecutiveBriefSectionCut(html, afterHeading) {
    let best = -1;
    const consider = (markerIdx) => {
        if (markerIdx === -1)
            return;
        const h2 = html.lastIndexOf('<h2', markerIdx);
        if (h2 === -1 || h2 < afterHeading)
            return;
        if (best === -1 || h2 < best)
            best = h2;
    };
    consider(html.indexOf('id="section-', afterHeading));
    for (const marker of EXECUTIVE_BRIEF_BOUNDARY_ID_MARKERS) {
        consider(html.indexOf(marker, afterHeading));
    }
    return best;
}
/**
 * Replace the **inner body** of the Executive Brief section (the
 * `<h2 id="section-executive-brief">…</h2>` heading and everything that
 * follows it up to — but not including — the next top-level boundary
 * heading) with the supplied replacement HTML. The Executive Brief
 * heading itself is preserved by emitting it inline ahead of the
 * replacement, so the in-page anchor (`#section-executive-brief`) and
 * the table-of-contents link continue to work.
 *
 * Used by the article-generator HTML pipeline to inject the rendered
 * markdown of a translated `executive-brief_<lang>.md` into the
 * non-English language variants without forking the whole aggregated
 * article into 14 source-language copies — see
 * `editorial-brief-resolver.readLocalizedBriefBody` and
 * `render-one.writeLanguageVariant`.
 *
 * Implementation uses `indexOf`/slice exclusively to stay within
 * CodeQL's safe-regex envelope. The replacement spans from the heading to
 * the next top-level boundary (see {@link findExecutiveBriefSectionCut});
 * when the Executive Brief is the last block in the body the replacement
 * extends to end-of-body. Returns `html` unchanged only when the Executive
 * Brief heading is absent or malformed.
 *
 * @param html - Full article body HTML
 * @param localizedHeading - Localized text for the Executive Brief H2
 *                           (e.g. `"Sammanfattning"` for `sv`). Must be
 *                           plain text — caller is responsible for any
 *                           escaping (it's passed through `escapeHTML`).
 * @param replacementBodyHtml - HTML to splice in **after** the heading.
 *                              Should not contain its own `<h2>` for
 *                              the Executive Brief — the heading is
 *                              re-emitted by this helper.
 * @returns Updated HTML with the localized brief body in place.
 */
export function replaceExecutiveBriefSection(html, localizedHeading, replacementBodyHtml) {
    const idMarker = 'id="section-executive-brief"';
    const idIdx = html.indexOf(idMarker);
    if (idIdx === -1)
        return html;
    // Walk back to the opening `<h2` of the Executive Brief heading.
    const h2Open = html.lastIndexOf('<h2', idIdx);
    if (h2Open === -1)
        return html;
    // Find the end of the heading element.
    const h2CloseTagIdx = html.indexOf('</h2>', idIdx);
    if (h2CloseTagIdx === -1)
        return html;
    const afterHeading = h2CloseTagIdx + '</h2>'.length;
    // Find the next top-level boundary heading — the start of the following
    // article section or appendix. When none exists the Executive Brief is
    // the last block, so we replace through end-of-body. This guarantees the
    // localized brief is spliced even on sparse runs (previously the splice
    // bailed and non-English readers were stranded on the English brief).
    const nextH2 = findExecutiveBriefSectionCut(html, afterHeading);
    let cutEnd;
    if (nextH2 === -1) {
        cutEnd = html.length;
    }
    else {
        // Start of the line containing the next `<h2` so we don't strip
        // leading whitespace from the next section.
        cutEnd = nextH2;
        const prevNewline = html.lastIndexOf('\n', nextH2 - 1);
        if (prevNewline !== -1 && prevNewline >= afterHeading) {
            cutEnd = prevNewline + 1;
        }
    }
    const newHeading = `<h2 id="section-executive-brief">${escapeHTML(localizedHeading)}</h2>\n`;
    const trimmedReplacement = replacementBodyHtml.endsWith('\n')
        ? replacementBodyHtml
        : `${replacementBodyHtml}\n`;
    return html.slice(0, h2Open) + newHeading + trimmedReplacement + html.slice(cutEnd);
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
export function replaceHeadingById(html, sectionId, englishTitle, localizedTitle) {
    const idMarker = `id="${sectionId}"`;
    let idIdx = html.indexOf(idMarker);
    if (idIdx === -1) {
        const idMarkerSingle = `id='${sectionId}'`;
        idIdx = html.indexOf(idMarkerSingle);
    }
    if (idIdx === -1)
        return html;
    const tagCloseIdx = html.indexOf('>', idIdx);
    if (tagCloseIdx === -1)
        return html;
    const titleStart = tagCloseIdx + 1;
    const titleEnd = html.indexOf('<', titleStart);
    if (titleEnd === -1)
        return html;
    const existingTitle = html.slice(titleStart, titleEnd);
    if (existingTitle.trim() !== englishTitle)
        return html;
    return html.slice(0, titleStart) + escapeHTML(localizedTitle) + html.slice(titleEnd);
}
//# sourceMappingURL=localize-body.js.map