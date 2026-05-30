// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/ReaderFriendlyTransform
 * @description Reader-facing post-processing transform for rendered article
 * HTML. Expands first-use jargon, links EP adopted-text references, and
 * contextualizes internal pipeline markers for public output.
 */
import { escapeHTML } from '../utils/file-utils.js';
const GLOSSARY_ID = 'reader-friendly-glossary';
const ACRONYM_EXPANSIONS = {
    BLUF: 'Bottom Line Up Front',
    KIF: 'Key Intelligence Findings',
    OIR: 'Own-Initiative Resolution',
    INI: 'Own-initiative procedure',
    EPCA: 'European Parliament Committee Analysis',
};
const WEP_PHRASES = {
    ALMOSTCERTAINLY: 'almost certainly',
    HIGHLYLIKELY: 'highly likely',
    VERYLIKELY: 'very likely',
    LIKELY: 'likely',
    PROBABLE: 'probably',
    POSSIBLE: 'possibly',
    UNLIKELY: 'unlikely',
    HIGHLYUNLIKELY: 'highly unlikely',
    VERYUNLIKELY: 'very unlikely',
};
const ADMIRALTY_LABELS = {
    A1: 'Source: Official EP records (highest reliability)',
    A2: 'Source: Verified institutional reporting (very high reliability)',
    B1: 'Source: Corroborated reporting (high reliability)',
    B2: 'Source: Corroborated reporting (good reliability)',
    B3: 'Source: Multi-source reporting (moderate reliability)',
    'B2-B3': 'Source: Multi-source reporting (moderate reliability)',
    C1: 'Source: Partially corroborated reporting (medium reliability)',
    C2: 'Source: Partially corroborated reporting (medium reliability)',
    C3: 'Source: Limited corroboration (lower reliability)',
};
/**
 * Transform rendered article HTML into a reader-friendlier presentation.
 *
 * @param html - Rendered HTML body fragment
 * @returns Reader-friendly HTML body fragment
 */
export function applyReaderFriendlyTransform(html) {
    const state = createInitialState(html);
    const withGlossary = injectReaderGlossary(html);
    const parts = withGlossary.split(/(<[^<>]+>)/g);
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i] ?? '';
        if (part.startsWith('<')) {
            updateTagContext(part, state);
            continue;
        }
        if (state.insideAbbr)
            continue;
        let text = part;
        text = contextualizeInternalMarkers(text);
        text = replaceFirstWepBand(text, state);
        text = replaceFirstAdmiraltyGrade(text, state);
        if (!state.insideAnchor) {
            text = linkEpAdoptedTextRefs(text);
            text = injectFirstUseAbbr(text, state.expandedAcronyms);
        }
        parts[i] = text;
    }
    return parts.join('');
}
function createInitialState(html) {
    const expandedAcronyms = new Set();
    const expandedWepBands = new Set();
    const expandedAdmiraltyGrades = new Set();
    for (const acronym of Object.keys(ACRONYM_EXPANSIONS)) {
        const matcher = new RegExp(`<abbr[^>]*>\\s*${acronym}\\s*</abbr>`, 'iu');
        if (matcher.test(html))
            expandedAcronyms.add(acronym);
    }
    for (const match of html.matchAll(/data-wep-band="([A-Z]+)"/g)) {
        const key = match[1];
        if (key)
            expandedWepBands.add(key);
    }
    for (const match of html.matchAll(/data-admiralty-grade="([A-Z0-9-]+)"/g)) {
        const key = match[1];
        if (key)
            expandedAdmiraltyGrades.add(key);
    }
    return {
        expandedAcronyms,
        expandedWepBands,
        expandedAdmiraltyGrades,
        insideAnchor: false,
        insideAbbr: false,
    };
}
function updateTagContext(tag, state) {
    if (/^<a\b/i.test(tag))
        state.insideAnchor = true;
    if (/^<\/a\b/i.test(tag))
        state.insideAnchor = false;
    if (/^<abbr\b/i.test(tag))
        state.insideAbbr = true;
    if (/^<\/abbr\b/i.test(tag))
        state.insideAbbr = false;
}
function contextualizeInternalMarkers(input) {
    return input
        .replace(/\bdegraded-feeds mode\b/giu, 'limited-source mode')
        .replace(/\bdegraded-feeds\b/giu, 'limited-source')
        .replace(/\bKB-ESTIMATE\b/gu, 'analysis estimate');
}
function replaceFirstWepBand(input, state) {
    return input.replace(/\bWEP:\s*([A-Za-z][A-Za-z -]+?)\s*\(([^)]+)\)/giu, (match, rawBand, range) => {
        const band = String(rawBand ?? '').trim();
        const key = normalizeBandKey(band);
        const phrase = WEP_PHRASES[key];
        if (!phrase || state.expandedWepBands.has(key))
            return match;
        state.expandedWepBands.add(key);
        const wepRange = String(range ?? '').trim();
        return `<span class="reader-friendly-wep" data-wep-band="${escapeHTML(key)}">${escapeHTML(phrase)} (WEP: ${escapeHTML(wepRange)})</span>`;
    });
}
function replaceFirstAdmiraltyGrade(input, state) {
    const withRanges = input.replace(/\bAdmiralty\s+([A-F])\s*([1-6])\s*-\s*([A-F])?\s*([1-6])\b/giu, (match, leftClass, leftScore, rightClass, rightScore) => {
        const effectiveRightClass = String(rightClass ?? '').trim() || String(leftClass ?? '');
        const key = `${String(leftClass ?? '').toUpperCase()}${String(leftScore ?? '')}-${effectiveRightClass.toUpperCase()}${String(rightScore ?? '')}`;
        return replaceAdmiraltyWithLabel(match, key, state);
    });
    return withRanges.replace(/\bAdmiralty\s+([A-F])\s*([1-6])\b/giu, (match, cls, score) => {
        const key = `${String(cls ?? '').toUpperCase()}${String(score ?? '')}`;
        return replaceAdmiraltyWithLabel(match, key, state);
    });
}
function linkEpAdoptedTextRefs(input) {
    return input.replace(/\b(TA-(\d+)-(\d+)-(\d+))\b/g, (_match, full, term, year, serial) => {
        const href = `https://www.europarl.europa.eu/doceo/document/TA-${term}-${year}-${serial}_EN.html`;
        return `<a href="${href}" rel="noopener external" target="_blank">${full}</a>`;
    });
}
function injectFirstUseAbbr(input, expandedAcronyms) {
    let text = input;
    for (const [acronym, full] of Object.entries(ACRONYM_EXPANSIONS)) {
        if (expandedAcronyms.has(acronym))
            continue;
        const matcher = new RegExp(`\\b${acronym}\\b`, 'u');
        if (!matcher.test(text))
            continue;
        expandedAcronyms.add(acronym);
        text = text.replace(matcher, `<abbr title="${escapeHTML(full)}">${escapeHTML(acronym)}</abbr>`);
    }
    return text;
}
function normalizeBandKey(raw) {
    return raw.replace(/[^A-Za-z]/g, '').toUpperCase();
}
function normalizeAdmiraltyKey(raw) {
    const compact = raw.toUpperCase().replace(/\s+/g, '');
    const impliedRange = compact.match(/^([A-F])([1-6])-([1-6])$/);
    if (impliedRange) {
        return `${impliedRange[1]}${impliedRange[2]}-${impliedRange[1]}${impliedRange[3]}`;
    }
    return compact;
}
function replaceAdmiraltyWithLabel(match, key, state) {
    const normalized = normalizeAdmiraltyKey(key);
    const label = ADMIRALTY_LABELS[normalized];
    if (!label || state.expandedAdmiraltyGrades.has(normalized))
        return match;
    state.expandedAdmiraltyGrades.add(normalized);
    return `<span class="reader-friendly-admiralty" data-admiralty-grade="${escapeHTML(normalized)}">${escapeHTML(label)}</span>`;
}
function injectReaderGlossary(html) {
    if (html.includes(`id="${GLOSSARY_ID}"`))
        return html;
    const hasGuideSection = html.indexOf('id="reader-intelligence-guide"') !== -1 ||
        html.indexOf("id='reader-intelligence-guide'") !== -1;
    if (!hasGuideSection)
        return html;
    const glossary = buildReaderGlossary();
    const headingAnchor = html.indexOf('id="reader-intelligence-guide-heading"') !== -1
        ? html.indexOf('id="reader-intelligence-guide-heading"')
        : html.indexOf("id='reader-intelligence-guide-heading'");
    if (headingAnchor === -1)
        return `${glossary}\n${html}`;
    const headingClose = html.indexOf('</h2>', headingAnchor);
    if (headingClose === -1)
        return `${glossary}\n${html}`;
    const insertAt = headingClose + '</h2>'.length;
    return `${html.slice(0, insertAt)}\n${glossary}${html.slice(insertAt)}`;
}
function buildReaderGlossary() {
    return `<details id="${GLOSSARY_ID}" class="reader-friendly-glossary"><summary>How to read this analysis</summary><p>This article uses confidence and source-quality notation. The guide below translates specialist shorthand into plain-English wording for general readers.</p><ul><li><strong>Source confidence:</strong> Admiralty grades are shown in reader-friendly text on first use.</li><li><strong>Probability language:</strong> WEP bands are translated to phrases like “likely” or “almost certainly”.</li><li><strong>Acronyms:</strong> first uses are expanded with abbreviations for accessibility.</li></ul></details>`;
}
//# sourceMappingURL=reader-friendly-transform.js.map