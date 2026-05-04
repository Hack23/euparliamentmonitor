// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Constants/BuildInfoMeta
 * @description Shared helper that emits the `<head>` build-identity and PWA
 * script tags every generator must include.
 *
 * The `build-id` / `build-time` meta tags are informational only — they
 * identify which deploy produced the page (useful for debugging / cache
 * audits) but are **not** consumed by any client-side JavaScript.
 *
 * The `pwa-register.js` script tag loads the service-worker registration
 * and relative-time formatting IIFE. A `?v=<BUILD_SHORT>` query string
 * is appended so that immutable-cached old versions are automatically
 * evicted when a new build is deployed.
 *
 * Every value is HTML-escaped — `BUILD_ID`/`BUILD_TIME` are tightly
 * formatted (40-char hex / ISO 8601) but defence-in-depth is cheap.
 *
 * The output is a multi-line string; callers should drop it into the
 * `<head>` block alongside other `<meta>` tags. CSP stays `script-src
 * 'self'` because the only emitted `<script>` references a same-origin
 * file with a `defer` attribute.
 */
import { BUILD_ID, BUILD_SHORT, BUILD_TIME } from './config.js';
import { escapeHTML } from '../utils/file-utils.js';
/**
 * Build the shared build-identity + PWA `<head>` block.
 *
 * @param pathPrefix - Asset path prefix (`''` for root pages, `'../'`
 *                     for `news/` pages).
 * @returns Multi-line HTML string. Caller is responsible for placing it
 *          inside `<head>…</head>`. The result is already HTML-escaped.
 */
export function buildHeadFreshnessTags(pathPrefix) {
    const safeBuildId = escapeHTML(BUILD_ID);
    const safeBuildTime = escapeHTML(BUILD_TIME);
    const safeBuildShort = escapeHTML(BUILD_SHORT);
    // Path prefix is built from controlled string literals (`''` or `'../'`),
    // but escape it anyway to keep the helper safe under future callers.
    const safePrefix = escapeHTML(pathPrefix);
    return [
        `  <meta name="build-id" content="${safeBuildId}">`,
        `  <meta name="build-time" content="${safeBuildTime}">`,
        `  <script src="${safePrefix}js/pwa-register.js?v=${safeBuildShort}" defer></script>`,
    ].join('\n');
}
//# sourceMappingURL=build-info-meta.js.map