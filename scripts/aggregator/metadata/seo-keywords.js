// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/SeoKeywords
 * @description `<meta name="keywords">` builder extracted from
 * `resolve-helpers.ts` so that module stays below the 600-line drift-guard
 * cap (see `test/unit/source-file-size.test.js`). Pure leaf module — depends
 * only on localized-keyword tables, the slug humanizer, and the cross-site
 * noise / portfolio filters.
 */
import { getLocalizedString } from '../../constants/language-core.js';
import { LOCALIZED_KEYWORDS } from '../../constants/language-articles.js';
import { CROSS_SITE_KEYWORDS, isNoiseKeywordToken } from './keyword-filters.js';
import { humanizeSlug } from './slug.js';
/**
 * Build a stable, localized keyword list from the article type plus the
 * resolved title/description context.
 *
 * @param lang - Target language code
 * @param articleType - Article type slug
 * @param date - ISO article date
 * @param runId - Optional run id (currently unused — preserved for callsite
 *                backward compatibility; see implementation note below)
 * @param title - Resolved title
 * @param description - Resolved description
 * @returns De-duplicated keywords for `<meta name="keywords">`
 */
export function buildSeoKeywords(lang, articleType, date, runId, title, description) {
    // `runId` is intentionally unused: the previous implementation
    // emitted `run <runId>` as a synthetic keyword, which surfaced
    // opaque tokens like `run propositions-run261-1779431162` in
    // `<meta name="keywords">`. The argument is preserved for callsite
    // backward compatibility.
    void runId;
    const localized = getLocalizedString(LOCALIZED_KEYWORDS, lang);
    const base = Object.getOwnPropertyDescriptor(localized, articleType)?.value;
    const fallback = ['EU Parliament', 'European Parliament', 'political intelligence'];
    const candidates = [
        // Always-on cross-site portfolio keywords lead the list so they
        // are guaranteed to survive the 16-entry budget cap.
        ...CROSS_SITE_KEYWORDS,
        ...(base ?? fallback),
        humanizeSlug(articleType),
        date,
        ...extractKeywordTerms(`${title} ${description}`),
    ];
    return dedupeKeywords(candidates).slice(0, 16);
}
/**
 * Extract short keyword terms from resolved SEO copy.
 *
 * Filters out tokens that look like UUID hex fragments, run-id slugs,
 * or digit-dominated noise (see {@link isNoiseKeywordToken}) so the
 * keyword list never leaks internal aggregator identifiers into
 * `<meta name="keywords">`.
 *
 * @param text - Title and description text
 * @returns Candidate terms
 */
function extractKeywordTerms(text) {
    return text
        .split(/[^\p{L}\p{N}]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 4 && !isNoiseKeywordToken(token))
        .slice(0, 18);
}
/**
 * De-duplicate keywords case-insensitively while preserving original order.
 *
 * @param candidates - Raw keyword candidates
 * @returns De-duplicated keyword list
 */
function dedupeKeywords(candidates) {
    const seen = new Set();
    const out = [];
    for (const candidate of candidates) {
        const trimmed = candidate.trim();
        if (!trimmed)
            continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(trimmed);
    }
    return out;
}
//# sourceMappingURL=seo-keywords.js.map