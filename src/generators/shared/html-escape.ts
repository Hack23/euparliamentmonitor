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
import type { AbsoluteUrl, RelativeFilePath, SafeHtmlString, SafeXmlString } from './types.js';

/**
 * HTML-entity-escape a raw string and brand the result as safe for HTML
 * interpolation. Escapes `&`, `<`, `>`, `"`, and `'`.
 *
 * @param raw - Untrusted string (user input, file content, etc.)
 * @returns Branded {@link SafeHtmlString} safe for use in HTML templates
 */
export function toSafeHtml(raw: string): SafeHtmlString {
  return escapeHTML(raw) as SafeHtmlString;
}

/**
 * XML-entity-escape a raw string and brand the result as safe for XML
 * interpolation. Escapes `&`, `<`, `>`, `"`, and `'`.
 *
 * @param raw - Untrusted string (user input, file content, etc.)
 * @returns Branded {@link SafeXmlString} safe for use in XML templates
 */
export function toSafeXml(raw: string): SafeXmlString {
  return escapeXML(raw) as SafeXmlString;
}

/**
 * Test whether a string contains characters unsafe inside an HTML attribute
 * value — any of these in a URL would allow attribute breakout / injection.
 *
 * @param value - The string to test
 * @returns `true` if the string contains unsafe characters
 */
function hasUnsafeAttrChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const ch = value[i];
    if (
      ch === '"' ||
      ch === "'" ||
      ch === '<' ||
      ch === '>' ||
      code <= 0x1f ||
      code === 0x7f ||
      ch === ' ' ||
      ch === '\t' ||
      ch === '\n' ||
      ch === '\r'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Validate and brand a string as an absolute HTTPS URL.
 * Validates using `new URL()` to ensure structural correctness, checks
 * that the protocol is `https:`, and rejects characters that are unsafe
 * in HTML attribute contexts (quotes, angle brackets, whitespace, control
 * characters) to prevent attribute-injection/XSS.
 *
 * @param url - Candidate URL string
 * @returns Branded {@link AbsoluteUrl}
 * @throws {Error} when `url` is not a valid absolute HTTPS URL or
 *   contains characters unsafe for HTML attribute interpolation
 */
export function toAbsoluteUrl(url: string): AbsoluteUrl {
  if (hasUnsafeAttrChars(url)) {
    throw new Error(`URL contains characters unsafe for HTML attributes: ${url.slice(0, 60)}`);
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url.slice(0, 60)}`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`Expected absolute HTTPS URL, got: ${url.slice(0, 60)}`);
  }
  return url as AbsoluteUrl;
}

/**
 * Normalize and brand a file path as a relative POSIX path.
 * Strips leading slashes, converts backslashes to forward slashes, and
 * rejects path-traversal sequences (`..`) to prevent directory escape.
 *
 * @param filePath - Raw file path
 * @returns Branded {@link RelativeFilePath}
 * @throws {Error} when the path contains `..` traversal segments
 */
export function toRelativeFilePath(filePath: string): RelativeFilePath {
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  // Reject path traversal
  if (/(^|\/)\.\.($|\/)/.test(normalized)) {
    throw new Error(`Path traversal not allowed in relative file path: ${filePath.slice(0, 60)}`);
  }
  return normalized as RelativeFilePath;
}
