// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/NewsIndexes/BackfillHreflang
 * @description Hreflang alternate-link backfill for article HTML files.
 * Extracted from `backfill.ts` to keep source files ≤600 lines.
 */
import path from 'path';
import fs from 'fs';
import { NEWS_DIR, BASE_URL } from '../../constants/config.js';
import { ALL_LANGUAGES } from '../../constants/languages.js';
import { parseArticleFilename, atomicWrite } from '../../utils/file-utils.js';
/**
 * Read an article HTML file, returning an empty string when unavailable.
 *
 * @param filepath - Absolute HTML file path
 * @returns File content or empty string
 */
function readArticleHtml(filepath) {
    try {
        return path.isAbsolute(filepath) ? fs.readFileSync(filepath, 'utf8') : '';
    }
    catch {
        return '';
    }
}
/**
 * Build hreflang `<link rel="alternate">` tags for an article slug.
 * Produces one tag per supported language plus an `x-default` pointing at
 * the English variant, all using absolute URLs.
 *
 * @param articleSlug - Slug without language suffix (e.g. `2026-02-24-propositions`)
 * @returns Newline-joined `<link>` tags
 */
function buildArticleHreflang(articleSlug) {
    const entries = ALL_LANGUAGES.map((code) => `  <link rel="alternate" hreflang="${code}" href="${BASE_URL}/news/${articleSlug}-${code}.html">`);
    entries.push(`  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/news/${articleSlug}-en.html">`);
    return entries.join('\n');
}
/**
 * Inject hreflang links into an article that has none.
 *
 * @param html - Article HTML content
 * @param hreflangBlock - Pre-built hreflang link block
 * @returns Updated HTML, or original if no change needed
 */
function injectHreflangLinks(html, hreflangBlock) {
    return html.replace(/(<\/head>)/u, `${hreflangBlock}\n$1`);
}
/**
 * Replace existing relative hreflang links with absolute URLs.
 *
 * @param html - Article HTML content
 * @param hreflangBlock - Pre-built hreflang link block with absolute URLs
 * @returns Updated HTML, or original if no change needed
 */
function fixRelativeHreflangLinks(html, hreflangBlock) {
    const stripped = html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*">\n?/gu, '');
    return stripped.replace(/(<\/head>)/u, `${hreflangBlock}\n$1`);
}
/**
 * Backfill hreflang alternate links for all article HTML files.
 *
 * Handles three cases:
 * 1. Articles with no hreflang links at all → inject the full block before `</head>`
 * 2. Articles with relative hreflang URLs → replace with absolute URLs
 * 3. Articles already correct → skip
 *
 * @param filenames - News article filenames
 * @returns Number of HTML files updated
 */
export function backfillArticleHreflang(filenames) {
    let updated = 0;
    for (const filename of filenames) {
        if (backfillOneArticleHreflang(filename))
            updated++;
    }
    return updated;
}
/**
 * Backfill hreflang for a single article file.
 *
 * @param filename - News article filename
 * @returns True when the file was updated
 */
function backfillOneArticleHreflang(filename) {
    const parsed = parseArticleFilename(filename);
    if (!parsed)
        return false;
    const filepath = path.join(NEWS_DIR, filename);
    const html = readArticleHtml(filepath);
    if (!html)
        return false;
    const articleSlug = `${parsed.date}-${parsed.slug}`;
    const hreflangBlock = buildArticleHreflang(articleSlug);
    const hasHreflang = /<link\s+rel="alternate"\s+hreflang="/u.test(html);
    let next;
    if (!hasHreflang) {
        next = injectHreflangLinks(html, hreflangBlock);
    }
    else {
        const hasRelative = /<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="(?!https?:\/\/)/u.test(html);
        if (!hasRelative)
            return false;
        next = fixRelativeHreflangLinks(html, hreflangBlock);
    }
    if (next === html)
        return false;
    atomicWrite(filepath, next);
    return true;
}
//# sourceMappingURL=backfill-hreflang.js.map