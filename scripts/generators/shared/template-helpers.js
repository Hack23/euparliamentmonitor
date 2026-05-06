// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getTextDirection } from '../../constants/languages.js';
import { escapeHTML } from '../../utils/file-utils.js';
/**
 * Append a cache-busting query parameter to an asset URL.
 *
 * @param assetPath - Relative path to the asset (e.g. `css/styles.css`)
 * @param config - Cache-bust configuration with the build hash
 * @returns URL with `?v=<buildShort>` appended
 *
 * @example
 * ```ts
 * cacheBustUrl('css/styles.css', { buildShort: 'abc1234', appVersion: '0.8.59' })
 * // → 'css/styles.css?v=abc1234'
 * ```
 */
export function cacheBustUrl(assetPath, config) {
    const separator = assetPath.includes('?') ? '&' : '?';
    return `${assetPath}${separator}v=${config.buildShort}`;
}
/**
 * Build the `<html>` opening tag with language and direction attributes.
 *
 * @param lang - ISO 639-1 language code
 * @returns Opening `<html>` tag string with `lang` and `dir` attributes
 */
export function buildHtmlOpenTag(lang) {
    const dir = getTextDirection(lang);
    return `<html lang="${lang}" dir="${dir}">`;
}
/**
 * Build a complete `<meta>` tag. The `content` value is HTML-attribute-
 * escaped to prevent injection via quotes or angle brackets.
 *
 * @param name - Meta tag name attribute (should be a known-safe token)
 * @param content - Meta tag content attribute (will be escaped)
 * @returns Complete `<meta>` tag string
 */
export function buildMetaTag(name, content) {
    return `  <meta name="${escapeHTML(name)}" content="${escapeHTML(content)}">`;
}
/**
 * Build an Open Graph `<meta>` tag. The `content` value is HTML-attribute-
 * escaped to prevent injection via quotes or angle brackets.
 *
 * @param property - OG property (e.g. `og:title`)
 * @param content - Property value (will be escaped)
 * @returns Complete `<meta property="…">` tag string
 */
export function buildOgMetaTag(property, content) {
    return `  <meta property="${escapeHTML(property)}" content="${escapeHTML(content)}">`;
}
/**
 * Determine text direction for a language code.
 *
 * @param lang - ISO 639-1 language code
 * @returns `'rtl'` for Arabic and Hebrew, `'ltr'` for all others
 */
export function getDirection(lang) {
    return getTextDirection(lang);
}
/**
 * Check whether a value is a valid hreflang — BCP-47 language tags or `x-default`.
 * Uses simple string checks instead of regex to avoid ESLint unsafe-regex warnings.
 *
 * @param value - The hreflang value to validate
 * @returns `true` if the value is a valid BCP-47 tag or `x-default`
 */
function isValidHreflang(value) {
    if (value === 'x-default')
        return true;
    // BCP-47 primary subtag: 2-3 lowercase, optional region/script subtag
    if (value.length < 2 || value.length > 12)
        return false;
    const parts = value.split('-');
    if (parts.length > 2)
        return false;
    const primary = parts[0];
    if (primary.length < 2 || primary.length > 3)
        return false;
    if (!/^[a-z]+$/.test(primary))
        return false;
    if (parts.length === 2) {
        const subtag = parts[1];
        if (subtag.length < 2 || subtag.length > 8)
            return false;
        if (!/^[A-Za-z]+$/.test(subtag))
            return false;
    }
    return true;
}
/**
 * Build an hreflang `<link rel="alternate">` tag.
 * Validates `hreflang` against BCP-47 / `x-default` pattern and requires
 * a branded {@link AbsoluteUrl} for the href to prevent injection.
 *
 * @param hreflang - Language code (or `x-default`)
 * @param href - Branded absolute URL of the alternate page
 * @returns Complete `<link>` tag string
 * @throws {Error} when hreflang does not match expected pattern
 */
export function buildHreflangLink(hreflang, href) {
    if (!isValidHreflang(hreflang)) {
        throw new Error(`Invalid hreflang value: ${hreflang.slice(0, 30)}`);
    }
    return `  <link rel="alternate" hreflang="${escapeHTML(hreflang)}" href="${href}">`;
}
//# sourceMappingURL=template-helpers.js.map