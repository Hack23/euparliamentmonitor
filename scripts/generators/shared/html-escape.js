// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Shared/HtmlEscape
 * @description Centralized HTML/XML escaping utilities for the generation
 * layer. Wraps the existing `escapeHTML` from `utils/file-utils.ts` and
 * `escapeXML` from `sitemap/xml-utils.ts` with branded-type producers so
 * downstream code can prove at compile-time that a string has been
 * sanitized before interpolation.
 *
 * This module is the **single gateway** for creating branded
 * {@link SafeHtmlString} and {@link SafeXmlString} values. Template code
 * should accept only these types — never raw `string` — to prevent XSS.
 */
import { escapeHTML } from '../../utils/file-utils.js';
import { escapeXML } from '../sitemap/xml-utils.js';
/**
 * HTML-entity-escape a raw string and brand the result as safe for HTML
 * interpolation. Escapes `&`, `<`, `>`, `"`, and `'`.
 *
 * @param raw - Untrusted string (user input, file content, etc.)
 * @returns Branded {@link SafeHtmlString} safe for use in HTML templates
 */
export function toSafeHtml(raw) {
    return escapeHTML(raw);
}
/**
 * XML-entity-escape a raw string and brand the result as safe for XML
 * interpolation. Escapes `&`, `<`, `>`, `"`, and `'`.
 *
 * @param raw - Untrusted string (user input, file content, etc.)
 * @returns Branded {@link SafeXmlString} safe for use in XML templates
 */
export function toSafeXml(raw) {
    return escapeXML(raw);
}
/**
 * Validate and brand a string as an absolute HTTPS URL.
 * Throws if the input does not start with `https://`.
 *
 * @param url - Candidate URL string
 * @returns Branded {@link AbsoluteUrl}
 * @throws {Error} when `url` is not an absolute HTTPS URL
 */
export function toAbsoluteUrl(url) {
    if (!url.startsWith('https://')) {
        throw new Error(`Expected absolute HTTPS URL, got: ${url.slice(0, 60)}`);
    }
    return url;
}
/**
 * Normalize and brand a file path as a relative POSIX path.
 * Strips leading slashes and converts backslashes to forward slashes.
 *
 * @param filePath - Raw file path
 * @returns Branded {@link RelativeFilePath}
 */
export function toRelativeFilePath(filePath) {
    const normalized = filePath
        .replace(/\\/g, '/')
        .replace(/^\/+/, '');
    return normalized;
}
//# sourceMappingURL=html-escape.js.map