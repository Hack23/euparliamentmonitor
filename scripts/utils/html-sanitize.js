// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/HtmlSanitize
 * @description Shared HTML sanitization helpers used across the generation,
 * validation, and quality-scoring pipelines.
 */
/**
 * Remove all `<script>…</script>` blocks from an HTML string, replacing each
 * with a single space.
 *
 * Uses iterative index-based scanning instead of a single-pass regex so that
 * CodeQL does not flag the pattern as an insecure HTML tag filter
 * (`js/bad-tag-filter`).
 *
 * @param html - HTML string to strip
 * @returns The HTML with script blocks replaced by spaces
 */
/**
 * Strip all HTML tags from a string, replacing each tag with a single space.
 *
 * Uses iterative index-based scanning instead of regex to avoid polynomial
 * backtracking (CodeQL `js/polynomial-redos`).
 *
 * @param html - HTML string to strip
 * @returns The text content with tags replaced by spaces
 */
export function stripHtmlTags(html) {
    let result = '';
    let pos = 0;
    while (pos < html.length) {
        const openIdx = html.indexOf('<', pos);
        if (openIdx < 0) {
            result += html.slice(pos);
            break;
        }
        // Copy text before the tag
        result += html.slice(pos, openIdx);
        // Find the closing '>'
        const closeIdx = html.indexOf('>', openIdx + 1);
        if (closeIdx < 0) {
            // Unclosed tag — keep the rest as-is
            result += html.slice(openIdx);
            break;
        }
        result += ' ';
        pos = closeIdx + 1;
    }
    return result;
}
export function stripScriptBlocks(html) {
    const OPEN = '<script';
    const CLOSE = '</script';
    let result = '';
    let pos = 0;
    const lower = html.toLowerCase();
    while (pos < html.length) {
        const openIdx = lower.indexOf(OPEN, pos);
        if (openIdx < 0) {
            result += html.slice(pos);
            break;
        }
        // Copy everything before the opening <script
        result += html.slice(pos, openIdx);
        // Find the end of the opening tag
        const openEnd = html.indexOf('>', openIdx);
        if (openEnd < 0) {
            // Malformed — no closing `>`, keep rest as-is
            result += html.slice(openIdx);
            break;
        }
        // Find the closing </script...> tag
        const closeIdx = lower.indexOf(CLOSE, openEnd + 1);
        if (closeIdx < 0) {
            // No closing tag — drop the rest
            result += ' ';
            break;
        }
        const closeEnd = html.indexOf('>', closeIdx);
        if (closeEnd < 0) {
            result += ' ';
            break;
        }
        result += ' ';
        pos = closeEnd + 1;
    }
    return result;
}
//# sourceMappingURL=html-sanitize.js.map