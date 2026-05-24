// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { HEADLINE_CLAUSE_BOUNDARIES } from './text-utils.js';
/**
 * Iteration helper — all three script families in a deterministic
 * order (latin → cjk → rtl). Exported so test matrices and downstream
 * tooling can walk every column of {@link SEO_BUDGETS} without
 * duplicating the literal list.
 */
export const ALL_SCRIPT_FAMILIES = ['latin', 'cjk', 'rtl'];
/**
 * Classify a locale code into a script family. Used to look up the
 * correct byte cap in {@link SEO_BUDGETS}.
 *
 * @param lang - BCP-47 language tag (one of the 14 publishing locales)
 * @returns Script family for SEO budget lookup
 */
export function classifyScript(lang) {
    if (lang === 'ar' || lang === 'he')
        return 'rtl';
    if (lang === 'ja' || lang === 'ko' || lang === 'zh')
        return 'cjk';
    return 'latin';
}
/**
 * Per-surface × per-script byte cap table. Numbers reflect the
 * narrower of Google / Bing / Facebook / Twitter documented envelopes,
 * with a ~5 % safety margin so a snippet on the edge of the budget
 * isn't truncated mid-glyph by the rendering platform.
 *
 * For `jsonLdHeadline` the Schema.org `NewsArticle.headline` cap is
 * script-independent (Google validates the literal character count at
 * 110) — same value across the row.
 */
export const SEO_BUDGETS = {
    title: { latin: 60, cjk: 30, rtl: 55 },
    metaDescription: { latin: 155, cjk: 78, rtl: 150 },
    ogTitle: { latin: 95, cjk: 47, rtl: 90 },
    ogDescription: { latin: 200, cjk: 100, rtl: 195 },
    twitterTitle: { latin: 70, cjk: 35, rtl: 70 },
    twitterDescription: { latin: 200, cjk: 100, rtl: 195 },
    imageAlt: { latin: 125, cjk: 60, rtl: 120 },
    jsonLdHeadline: { latin: 110, cjk: 110, rtl: 110 },
};
/**
 * Resolve the byte cap for one `(lang, surface)` pair.
 *
 * @param lang - Publishing locale
 * @param surface - SEO surface (see {@link SeoSurface})
 * @returns Byte cap (positive integer)
 */
export function budgetFor(lang, surface) {
    const family = classifyScript(lang);
    return SEO_BUDGETS[surface][family];
}
// ────────────────────────────────────────────────────────────────────────
// Script-aware truncator
// ────────────────────────────────────────────────────────────────────────
/**
 * CJK full-width clause boundaries — the breakpoints CJK readers
 * expect a snippet to end at. Listed in preferred-break order: a
 * sentence-final mark beats a comma which beats a middle-dot.
 */
const CJK_CLAUSE_BOUNDARIES = [
    '。',
    '！',
    '？',
    '、',
    '；',
    '：',
    '——',
    '—',
    '・',
];
/**
 * RTL sentence punctuation. Arabic uses U+061F (؟) for question mark
 * and U+060C (،) for comma; full stop is the ASCII `.` (Hebrew uses
 * `.` and `,` directly). Listed in preferred-break order.
 */
const RTL_CLAUSE_BOUNDARIES = ['. ', '؟ ', '! ', '، ', '؛ ', ' — ', ' – '];
/**
 * Soft-minimum fraction of the budget at which a clause-boundary break
 * is acceptable. Below this fraction we fall through to whitespace
 * truncation so we never ship a near-empty snippet just because the
 * input started with a short clause.
 */
const SOFT_MIN_RATIO = 0.55;
/**
 * Trim trailing punctuation that would otherwise leave a snippet
 * ending on a dangling separator or ellipsis. Mirrors the spirit of
 * `text-utils.ts::TRAILING_PUNCT` but keeps full-width CJK marks
 * intact when they sit at a natural sentence boundary.
 *
 * @param s - Input string to trim
 * @returns Input with trailing separator-class characters removed
 */
function trimTrailingSeparators(s) {
    return s.replace(/[\s,;:—\-–·•…]+$/u, '');
}
/**
 * Pick the highest-priority clause boundary inside a candidate window.
 * Iterates the boundary vocabulary in declared (preference) order and
 * returns the first index that sits past the soft minimum.
 *
 * @param window - Candidate cut window (`text.slice(0, budget)`)
 * @param boundaries - Boundary vocabulary, in preference order
 * @param softMin - Soft-minimum cut position (chars)
 * @returns Cut index, or -1 when no boundary qualifies
 */
function findClauseCut(window, boundaries, softMin) {
    for (const boundary of boundaries) {
        const idx = window.lastIndexOf(boundary);
        if (idx >= softMin) {
            return idx + boundary.length;
        }
    }
    return -1;
}
/**
 * Truncate `text` to fit `(lang, surface)` SEO byte budget. Prefers a
 * natural clause boundary inside the script's punctuation vocabulary
 * (CJK / RTL / Latin) before falling back to a whitespace break.
 *
 * Always returns `text` verbatim when it already fits (no ellipsis
 * appended). When truncation happens an ellipsis (`…`) is appended for
 * Latin / RTL; for CJK the full-width ellipsis (`…`) reads as a
 * partial-thought marker and is also appended — Schema.org and Google
 * accept either glyph in `headline` / `description`.
 *
 * @param text - Source text (already plain-text — no Markdown / HTML)
 * @param lang - Publishing locale
 * @param surface - Target SEO surface
 * @returns Clamped text ≤ `budgetFor(lang, surface)` characters
 */
export function clampForBudget(text, lang, surface) {
    const trimmed = text.trim();
    const budget = budgetFor(lang, surface);
    if (trimmed.length <= budget)
        return trimmed;
    const family = classifyScript(lang);
    const softMin = Math.floor(budget * SOFT_MIN_RATIO);
    // Reserve one char for the ellipsis we may append.
    const window = trimmed.slice(0, budget - 1);
    const boundaries = family === 'cjk'
        ? CJK_CLAUSE_BOUNDARIES
        : family === 'rtl'
            ? RTL_CLAUSE_BOUNDARIES
            : HEADLINE_CLAUSE_BOUNDARIES;
    const clauseCut = findClauseCut(window, boundaries, softMin);
    if (clauseCut > 0) {
        const cleaned = trimTrailingSeparators(trimmed.slice(0, clauseCut));
        if (cleaned.length >= softMin)
            return cleaned;
    }
    // Whitespace-aware fallback. CJK text often has no ASCII spaces, so
    // skip this step for CJK and fall straight through to the hard cut.
    if (family !== 'cjk') {
        const lastSpace = window.lastIndexOf(' ');
        if (lastSpace >= softMin) {
            const safe = trimTrailingSeparators(window.slice(0, lastSpace));
            return `${safe}…`;
        }
    }
    const hardCut = trimTrailingSeparators(window);
    return `${hardCut}…`;
}
/**
 * Compose `{title}{separator}{siteTitle}` while honouring the
 * `(lang, surface)` budget. Drops the brand suffix entirely when the
 * article title alone is already at or past the budget. Prefers the
 * short site title when supplied and the full suffix doesn't fit.
 *
 * @param title - Article title (plain text)
 * @param lang - Publishing locale
 * @param surface - Target SEO surface (`title` / `ogTitle` / `twitterTitle`)
 * @param opts - Optional brand suffix wiring
 * @returns Composed title ≤ budget
 */
export function clampTitleForSurface(title, lang, surface, opts = {}) {
    const budget = budgetFor(lang, surface);
    const cleanTitle = title.trim();
    const sep = opts.separator ?? '';
    const full = opts.siteTitle ?? '';
    const short = opts.shortSiteTitle ?? '';
    // No brand suffix wiring — just clamp the title in isolation.
    if (!full)
        return clampForBudget(cleanTitle, lang, surface);
    const fullSuffix = `${sep}${full}`;
    const shortSuffix = short ? `${sep}${short}` : '';
    // Best case: title + full suffix fits.
    if (cleanTitle.length + fullSuffix.length <= budget) {
        return `${cleanTitle}${fullSuffix}`;
    }
    // Second best: title + short suffix fits.
    if (shortSuffix && cleanTitle.length + shortSuffix.length <= budget) {
        return `${cleanTitle}${shortSuffix}`;
    }
    // Third: keep the title (clamped), drop the brand. Better SERP than
    // a truncated headline followed by a clipped brand suffix.
    return clampForBudget(cleanTitle, lang, surface);
}
//# sourceMappingURL=seo-budgets.js.map