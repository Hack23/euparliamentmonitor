// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { stripHtmlTags } from '../utils/html-sanitize.js';
export const QUICK_LAYER_SECTION_IDS = new Set([
    'executive-brief',
    'key-takeaways',
    'reader-intelligence-guide',
]);
export const ANALYSIS_LAYER_SECTION_IDS = new Set([
    'synthesis',
    'significance',
    'actors-forces',
    'coalitions-voting',
    'stakeholder-map',
    'economic-context',
    'risk',
]);
function countWordsInHtml(html) {
    return stripHtmlTags(html)
        .split(/\s+/u)
        .filter((word) => word.length > 0).length;
}
function normalizeSectionId(id) {
    return id.replace(/^section-/, '');
}
function splitSectionSlices(bodyHtml) {
    const sections = [];
    const headingPattern = /<h2\b[^>]*\bid=(["'])([^"']+)\1[^>]*>/giu;
    const matches = Array.from(bodyHtml.matchAll(headingPattern));
    if (matches.length === 0) {
        return { preface: bodyHtml, sections };
    }
    for (let index = 0; index < matches.length; index += 1) {
        const match = matches[index];
        const start = match.index ?? 0;
        const end = matches[index + 1]?.index ?? bodyHtml.length;
        const id = match[2] ?? '';
        sections.push({ id, html: bodyHtml.slice(start, end) });
    }
    const first = matches[0]?.index ?? 0;
    return { preface: bodyHtml.slice(0, first), sections };
}
export function resolveDisclosureLayer(sectionId) {
    const normalized = normalizeSectionId(sectionId);
    if (QUICK_LAYER_SECTION_IDS.has(normalized))
        return 'quick';
    if (ANALYSIS_LAYER_SECTION_IDS.has(normalized))
        return 'analysis';
    return 'intelligence';
}
export function splitBodyIntoDisclosureLayers(bodyHtml) {
    const { preface, sections } = splitSectionSlices(bodyHtml);
    const quickParts = preface.trim().length > 0 ? [preface] : [];
    const analysisParts = [];
    const intelligenceParts = [];
    for (const section of sections) {
        const layer = resolveDisclosureLayer(section.id);
        if (layer === 'quick')
            quickParts.push(section.html);
        else if (layer === 'analysis')
            analysisParts.push(section.html);
        else
            intelligenceParts.push(section.html);
    }
    const quickHtml = quickParts.join('\n');
    const analysisHtml = analysisParts.join('\n');
    const intelligenceHtml = intelligenceParts.join('\n');
    const wordCounts = {
        quick: countWordsInHtml(quickHtml),
        analysis: countWordsInHtml(analysisHtml),
        intelligence: countWordsInHtml(intelligenceHtml),
    };
    return { quickHtml, analysisHtml, intelligenceHtml, wordCounts };
}
export function estimateReadingMinutes(wordCount) {
    return Math.ceil(wordCount / 238);
}
export function buildLayerReadingTimes(words) {
    const quick = words.quick;
    const analysis = words.quick + words.analysis;
    const complete = words.quick + words.analysis + words.intelligence;
    return {
        quickRead: estimateReadingMinutes(quick),
        fullAnalysis: estimateReadingMinutes(analysis),
        completeIntelligence: estimateReadingMinutes(complete),
    };
}
export function buildProgressiveDisclosureBody(bodyHtml) {
    const layers = splitBodyIntoDisclosureLayers(bodyHtml);
    const output = [
        `<section class="article-layer article-layer--quick" data-disclosure-layer="quick" aria-label="Quick read">`,
        layers.quickHtml,
        `</section>`,
    ];
    if (layers.analysisHtml.trim().length > 0) {
        output.push(`<details class="article-layer article-layer--analysis article-layer-details" data-disclosure-layer="analysis" id="article-layer-analysis">`, `<summary class="article-layer-summary"><span class="article-layer-summary__title">Read full analysis ↓</span></summary>`, `<section class="article-layer-content" aria-label="Full analysis">`, layers.analysisHtml, `</section>`, `</details>`);
    }
    if (layers.intelligenceHtml.trim().length > 0) {
        output.push(`<details class="article-layer article-layer--intelligence article-layer-details" data-disclosure-layer="intelligence" id="article-layer-intelligence">`, `<summary class="article-layer-summary"><span class="article-layer-summary__title">Open complete intelligence ↓</span></summary>`, `<section class="article-layer-content" aria-label="Complete intelligence">`, layers.intelligenceHtml, `</section>`, `</details>`);
    }
    return { bodyHtml: output.join('\n'), wordCounts: layers.wordCounts };
}
//# sourceMappingURL=progressive-disclosure.js.map
