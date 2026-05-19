// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Generator/Slug
 * @description Slug + default-description helpers used by the article
 * generator. Thin re-exports of the canonical slug helpers in
 * `aggregator/slug/index.js`, plus the strict default-description
 * extractor used when neither the manifest nor the article-metadata
 * resolver supplies a description.
 */
import { extractStrongProseLine } from '../article-metadata.js';
import { buildArticleSlug as _buildArticleSlug, sanitizeRunSuffix as _sanitizeRunSuffix, } from '../slug/index.js';
/**
 * Build the article slug `YYYY-MM-DD-<article-type>[-<runSuffix>]`.
 *
 * Thin re-export of the canonical implementation in
 * `aggregator/slug/index.js` preserved here for back-compat with the
 * existing test suite.
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @param articleType - Article-type slug (e.g. `breaking`)
 * @param runSuffix - Optional collision-suffix (e.g. `run191`)
 * @returns Combined slug used as the file-stem for every language variant
 */
export function buildArticleSlug(date, articleType, runSuffix) {
    return _buildArticleSlug(date, articleType, runSuffix);
}
/**
 * Turn an arbitrary run-id string into a short, filename-safe suffix.
 *
 * Thin re-export of the canonical implementation in
 * `aggregator/slug/index.js`.
 *
 * @param runId - Raw run identifier from the manifest (or directory name)
 * @returns Sanitised suffix usable in a filename
 */
export function sanitizeRunSuffix(runId) {
    return _sanitizeRunSuffix(runId);
}
/**
 * Return `true` when a line should be skipped when hunting for the default
 * description. Thin wrapper preserved for back-compat — real logic lives
 * in `src/aggregator/article-metadata.ts`'s `shouldSkipDescriptionLine`.
 *
 * @param line - Trimmed line from the aggregated Markdown source
 * @returns `true` when the line is not prose and should be skipped
 */
function shouldSkipDescriptionLine(line) {
    if (line.length === 0)
        return true;
    if (line.startsWith('#'))
        return true;
    if (line.startsWith('>'))
        return true;
    if (line.startsWith('<'))
        return true;
    if (line.startsWith('|'))
        return true;
    return false;
}
/** Description used when no prose paragraph qualifies. */
const FALLBACK_DESCRIPTION = 'EU Parliament intelligence summary derived from committed analysis artifacts.';
/**
 * Extract a short description from the first prose paragraph of the
 * aggregated Markdown — used as the default `<meta name="description">`.
 * Uses the stricter `extractStrongProseLine` filter from
 * `article-metadata.ts` so mermaid `%%{init}` blocks, `title …` directives,
 * emoji-banner metadata rows, and `Analysis Date:` / `Run:` / `Window:`
 * style banners no longer leak into `<meta description>`. Kept as an
 * exported thin wrapper for back-compat with the existing test suite.
 *
 * @param markdown - Aggregated Markdown document
 * @returns Plain-text description, truncated to ≤300 characters
 */
export function extractDefaultDescription(markdown) {
    void shouldSkipDescriptionLine;
    const strong = extractStrongProseLine(markdown);
    return strong.length > 0 ? strong : FALLBACK_DESCRIPTION;
}
//# sourceMappingURL=slug.js.map