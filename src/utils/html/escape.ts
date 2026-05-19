// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Html/Escape
 * @description Single repo-wide HTML escaping and decoding utilities.
 *
 * `escapeHTML` is the canonical XSS-prevention encoder for the codebase —
 * its behaviour must not change. `decodeHtmlEntities` is the inverse used
 * when extracting plain text from our own generated HTML.
 */

/**
 * Decode the 5 HTML entities produced by escapeHTML() back to plain text.
 * Used when extracting text from our own generated HTML to obtain unescaped values.
 *
 * IMPORTANT: `&amp;` MUST be decoded last. Decoding it first would convert
 * `&amp;lt;` to `&lt;` before the `&lt;` → `<` replacement runs, causing
 * double-decoding. The correct order is: decode all specific entities first,
 * then decode `&amp;` as the final step.
 *
 * @param str - HTML string with entities
 * @returns Plain text with entities decoded
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Escape special HTML characters to prevent XSS
 *
 * @param str - Raw string to escape
 * @returns HTML-safe string
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
