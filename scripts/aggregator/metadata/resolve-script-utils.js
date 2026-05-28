// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { classifyScript } from './seo-budgets.js';
import { hasLeakySeoToken, isUsableResolvedTitle, pickFirstNonEmpty } from './resolve-helpers.js';
import { ENRICHMENT_TRIGGER_LENGTH, truncateTitle } from './text-utils.js';
/**
 * Unicode glyph probes used to detect whether resolved SEO copy actually
 * matches the publishing locale's expected script. The CJK range covers
 * Hiragana / Katakana (Japanese), Han ideographs (Chinese + Japanese kanji)
 * and Hangul (Korean). The RTL range covers Hebrew (U+0590–U+05FF) and
 * Arabic + supplements (U+0600–U+06FF).
 *
 * These probes drive the script-aware description clamp and the
 * English-summary-derived title rejection gate below.
 */
export const CJK_GLYPH_RE = /[\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u;
export const RTL_GLYPH_RE = /[\u0590-\u05FF\u0600-\u06FF]/u;
// eslint-disable-next-line no-control-regex
export const ASCII_ONLY_RE = /^[\x00-\x7F]*$/u;
/**
 * Test whether `text` contains a glyph in the script family expected for
 * `lang`. Latin locales return `true` unconditionally — their content is
 * always Latin glyphs by definition.
 *
 * @param text - SEO copy under inspection
 * @param lang - Publishing locale
 * @returns True when `text` carries at least one glyph in the locale's script
 */
export function contentMatchesLocaleScript(text, lang) {
    const family = classifyScript(lang);
    if (family === 'latin')
        return true;
    if (family === 'cjk')
        return CJK_GLYPH_RE.test(text);
    return RTL_GLYPH_RE.test(text);
}
/**
 * No-op: run numbers must never appear in user-facing article titles.
 * Titles should always be readable article headlines without workflow
 * identifiers. This function is preserved for callsite backward
 * compatibility.
 *
 * @param seoTitle - SEO title (returned unchanged)
 * @param _lang - Language code (ignored)
 * @param _runId - Manifest run identifier (ignored)
 * @returns The unchanged input title
 */
export function appendRunNumberSuffix(seoTitle, _lang, _runId) {
    // Run numbers must never appear in user-facing article titles.
    // Titles should always be readable article headlines without
    // workflow identifiers. This function is preserved as a no-op
    // for callsite backward compatibility.
    return seoTitle;
}
/**
 * Decide whether to push the raw description through
 * {@link composeContextualDescription}'s enrichment path. Triggers when
 * the raw description is below {@link ENRICHMENT_TRIGGER_LENGTH} (the
 * historical "too short" gate) **or** when the locale is non-Latin and
 * the raw description is pure ASCII (the English-fallback all-ASCII
 * description failure mode reported by Gate 4b in
 * `executive-brief-seo-extraction.test.js`).
 *
 * The second branch is the key fix for ar/he descriptions that fell
 * through from the English brief without any localized labels — even
 * though the raw English summary cleared the 100-char trigger, leaving
 * it untouched produced a pure-ASCII snippet that the SEO regression
 * suite (correctly) rejects as a resolver leak.
 *
 * @param rawDescription - Composed description before enrichment
 * @param lang - Publishing locale
 * @returns True when enrichment must run
 */
export function shouldEnrichDescription(rawDescription, lang) {
    if (rawDescription.length < ENRICHMENT_TRIGGER_LENGTH)
        return true;
    if (lang === 'en')
        return false;
    if (classifyScript(lang) === 'latin')
        return false;
    return ASCII_ONLY_RE.test(rawDescription);
}
/**
 * Pick the SEO `<title>` from the candidate ladder. Skips the
 * summary-derived candidate for non-Latin locales when its content is
 * pure ASCII so we never leak an English summary-derived title (e.g.
 * `*Q1 2026 is the master-synthe`) into a CJK / RTL page (Gate 4a in
 * `executive-brief-seo-extraction.test.js`).
 *
 * @param lang - Publishing locale
 * @param candidates - Title candidate inputs (in priority order)
 * @param candidates.explicitTitle - Manifest operator override title
 * @param candidates.resolvedTitleCandidate - H1/document-derived title
 * @param candidates.summaryDerivedTitle - Summary-first-sentence title
 * @param candidates.contextualFallback - Final fallback title
 * @returns Picked title (always non-empty when the contextual fallback fires)
 */
export function pickResolvedTitle(lang, candidates) {
    const family = classifyScript(lang);
    const summaryTitleAllowed = candidates.summaryDerivedTitle &&
        isUsableResolvedTitle(candidates.summaryDerivedTitle, { allowFullSentence: true }) &&
        !(family !== 'latin' && !contentMatchesLocaleScript(candidates.summaryDerivedTitle, lang));
    return pickFirstNonEmpty([
        candidates.explicitTitle,
        candidates.resolvedTitleCandidate,
        summaryTitleAllowed ? candidates.summaryDerivedTitle : '',
        truncateTitle(candidates.contextualFallback),
        candidates.contextualFallback,
    ]);
}
/**
 * Decide whether `clippedTitle` is usable as the resolved title candidate.
 * Extracted from `resolveOneLanguage` to keep cognitive complexity under
 * the SonarJS threshold (15).
 *
 * @param args - Title candidate inputs
 * @param args.clippedTitle - The truncated editorial/manifest title to evaluate
 * @param args.headlineWasContaminated - True when the editorial headline was rejected by sanitize
 * @param args.nonLatinFamily - True for CJK/RTL locales requiring locale-script glyphs
 * @param args.allowShortResolvedTitle - True when the source is a localized brief
 * @param args.lang - Target language code
 * @returns The clipped title when usable, '' otherwise
 */
export function pickResolvedTitleCandidate(args) {
    const { clippedTitle, headlineWasContaminated, nonLatinFamily, allowShortResolvedTitle, lang } = args;
    if (headlineWasContaminated || !clippedTitle)
        return '';
    if (hasLeakySeoToken(clippedTitle))
        return '';
    if (nonLatinFamily && !contentMatchesLocaleScript(clippedTitle, lang))
        return '';
    if (!allowShortResolvedTitle && !isUsableResolvedTitle(clippedTitle))
        return '';
    return clippedTitle;
}
//# sourceMappingURL=resolve-script-utils.js.map