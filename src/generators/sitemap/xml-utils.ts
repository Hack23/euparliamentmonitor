// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Sitemap/XmlUtils
 * @description Tiny string-escaping helpers shared by the XML sitemap and
 * RSS-feed generators. Lifted out of `sitemap.ts` so the helpers can be
 * tested in isolation and so any future XML output (Atom, news-sitemap,
 * etc.) can reuse the same canonical escape function instead of growing a
 * fourth copy.
 *
 * The single function below escapes the **five predefined XML entities**
 * (`&`, `<`, `>`, `"`, `'`). The order matters — `&` MUST be escaped first
 * so that subsequent `&lt;`/`&gt;` etc. aren't double-encoded.
 */

/**
 * Escape a string for safe embedding inside an XML text node or attribute.
 *
 * @param str - Raw string
 * @returns XML-safe string with the five predefined entities escaped
 */
export function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
