// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/EditorialBriefResolver
 * @description Language-aware editorial brief lookup.
 *
 * Companion to `article-metadata.ts`. Where that module's
 * `extractArtifactHighlight` is intentionally language-agnostic (the first
 * canonical editorial artefact wins, regardless of locale), this module
 * answers the **per-language** question:
 *
 *   "Given a run directory and a target language `<lang>`, is there a
 *   sibling `executive-brief_<lang>.md` (or `extended/…` variant) that
 *   the article-metadata resolver should prefer over the English brief?"
 *
 * The answer drives the localized-brief precedence rule documented in
 * [`.github/prompts/04-article-generation.md`](../../.github/prompts/04-article-generation.md) § 6.2:
 *
 *   1. translated `executive-brief_<lang>.md` (this module's job)
 *   2. translated `extended/executive-brief_<lang>.md` (also this module)
 *   3. English `executive-brief.md` — `article-metadata.ts` already
 *      handles this via the canonical candidate list
 *
 * The module is intentionally small and side-effect-free; it composes
 * the existing low-level helpers (`extractFirstH1`,
 * `extractLedeAfterHeading`, `extractStrongProseLine`, `isGenericHeading`,
 * `stripArtifactCategoryAffix`, `truncateTitle`) so the parsing rules
 * stay identical across the English and localized paths.
 */
import fs from 'fs';
import path from 'path';
import { extractFirstH1, extractLedeAfterHeading, extractStrongProseLine, isGenericHeading, stripArtifactCategoryAffix, truncateTitle, } from './article-metadata.js';
/**
 * Run-relative candidate paths for a translated brief, in precedence
 * order. Mirrors the `executive-brief.md` → `extended/executive-brief.md`
 * progression used by the English path so the localized resolution stays
 * symmetric.
 *
 * @param lang - Target language code
 * @returns Ordered run-relative paths to probe
 */
export function localizedBriefCandidates(lang) {
    if (lang === 'en')
        return [];
    return [`executive-brief_${lang}.md`, `extended/executive-brief_${lang}.md`];
}
/**
 * Read an editorial artefact body while skipping any SPDX HTML-comment
 * preamble. Kept private here so the localized path doesn't depend on
 * non-exported helpers from `article-metadata.ts`.
 *
 * Both single-line (`<!-- … -->`) and multi-line comment blocks (where
 * `<!--` and `-->` appear on different lines) are stripped, so SPDX
 * headers written as
 *
 *   ```
 *   <!--
 *     SPDX-FileCopyrightText: 2024-2026 Hack23 AB
 *     SPDX-License-Identifier: Apache-2.0
 *   -->
 *   ```
 *
 * are handled symmetrically with the single-line form. An unterminated
 * `<!--` block (no closing `-->`) is treated as malformed and the body
 * is returned starting at that line — downstream `extractFirstH1` will
 * then fail to find a heading and the caller will return `null`, which
 * is the safe behaviour for a broken brief.
 *
 * @param abs - Absolute file path
 * @returns File contents with SPDX comment lines dropped, or `''` on error
 */
function readArtefactBody(abs) {
    let text;
    try {
        text = fs.readFileSync(abs, 'utf8');
    }
    catch {
        return '';
    }
    const lines = text.split('\n');
    let i = 0;
    while (i < lines.length) {
        const line = (lines[i] ?? '').trim();
        if (line === '') {
            i++;
            continue;
        }
        if (line.startsWith('<!--') && line.endsWith('-->') && line.length >= 7) {
            i++;
            continue;
        }
        if (line.startsWith('<!--')) {
            // Multi-line comment block — scan forward to the closing `-->`.
            const closeIdx = findCommentClose(lines, i);
            if (closeIdx === -1)
                break; // malformed: bail out, retain content
            i = closeIdx + 1;
            continue;
        }
        break;
    }
    return lines.slice(i).join('\n');
}
/**
 * Locate the line index of the first line that ends with `-->` at or
 * after `start`. The terminator must appear at end-of-line (after a
 * trim) so an inline `-->` embedded in editorial prose cannot be
 * mis-read as the close of an SPDX preamble block.
 *
 * @param lines - File lines being scanned (read-only)
 * @param start - Line index where the unterminated `<!--` was seen
 * @returns Closing line index, or `-1` when no terminator is found.
 */
function findCommentClose(lines, start) {
    for (let j = start; j < lines.length; j++) {
        if ((lines[j] ?? '').trimEnd().endsWith('-->'))
            return j;
    }
    return -1;
}
/**
 * Compute the editorial headline from a localized brief body. Returns
 * `''` when the H1 is fully generic and the stripped variant is also
 * generic. Kept private so callers don't need to know about generic-H1
 * stripping rules.
 *
 * @param body - Brief body with the SPDX preamble already stripped
 * @param articleType - Article-type slug (for {@link isGenericHeading})
 * @param date - ISO run date (for {@link isGenericHeading})
 * @returns Editorial headline, possibly empty
 */
function deriveHeadline(body, articleType, date) {
    const rawHeadline = extractFirstH1(body);
    if (!rawHeadline)
        return '';
    if (!isGenericHeading(rawHeadline, articleType, date)) {
        return truncateTitle(rawHeadline);
    }
    const stripped = stripArtifactCategoryAffix(rawHeadline);
    if (stripped && !isGenericHeading(stripped, articleType, date)) {
        return truncateTitle(stripped);
    }
    return '';
}
/**
 * Attempt to resolve the localized brief highlight for one language.
 * Returns `null` when no `executive-brief_<lang>.md` (or extended
 * variant) exists in `runDir`. For `lang === 'en'` always returns `null`
 * — the English brief is handled by the canonical
 * `extractArtifactHighlight` resolver.
 *
 * The body of the localized brief is parsed with the same lede/H1
 * extractors used for the English path, so the semantic rules are
 * symmetric. Generic artefact-category headings
 * (e.g. `# Executive Brief — Breaking News (2026-05-15)`) are detected
 * and stripped via {@link stripArtifactCategoryAffix} so they cannot
 * leak into the SEO surfaces.
 *
 * @param runDir - Absolute run directory (the parent of the brief)
 * @param lang - Target language code
 * @param articleType - Article-type slug (for {@link isGenericHeading})
 * @param date - ISO run date (for {@link isGenericHeading})
 * @returns Resolved localized highlight, or `null` when no brief exists
 */
export function resolveLocalizedBriefHighlight(runDir, lang, articleType, date) {
    if (lang === 'en')
        return null;
    if (!runDir || !fs.existsSync(runDir))
        return null;
    for (const rel of localizedBriefCandidates(lang)) {
        const abs = path.join(runDir, rel);
        if (!fs.existsSync(abs))
            continue;
        const body = readArtefactBody(abs);
        if (!body)
            continue;
        const headline = deriveHeadline(body, articleType, date);
        const lede = extractLedeAfterHeading(body);
        const summary = lede || extractStrongProseLine(body);
        if (headline || summary) {
            return {
                headline,
                summary,
                sourceFile: rel,
                sourceLang: lang,
            };
        }
    }
    return null;
}
/**
 * Return the set of language codes for which a translated brief is
 * present in `runDir`. Useful for telemetry and for the `metadataFallback`
 * accounting that records which locales fall back to English.
 *
 * @param runDir - Absolute run directory
 * @param languages - Ordered list of language codes to probe
 * @returns Subset of {@link languages} for which at least one localized
 * brief candidate file exists
 */
export function discoverLocalizedBriefs(runDir, languages) {
    if (!runDir || !fs.existsSync(runDir))
        return [];
    const out = [];
    for (const lang of languages) {
        if (lang === 'en')
            continue;
        for (const rel of localizedBriefCandidates(lang)) {
            const abs = path.join(runDir, rel);
            if (fs.existsSync(abs)) {
                out.push(lang);
                break;
            }
        }
    }
    return out;
}
//# sourceMappingURL=editorial-brief-resolver.js.map