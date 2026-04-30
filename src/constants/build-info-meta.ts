// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Constants/BuildInfoMeta
 * @description Shared helper that emits the `<head>` freshness tags every
 * generator must include so the PWA layer (`js/pwa-register.js`) can:
 *
 *   - Read the embedded build commit SHA + timestamp from `<meta>` tags.
 *   - Preload `build-info.json` for cache-bust polling.
 *   - Load the same-origin service-worker registration script.
 *   - Tell browsers + intermediate proxies to revalidate every navigation
 *     (`Cache-Control: no-cache`, `Pragma: no-cache`).
 *
 * Every value is HTML-escaped — `BUILD_ID`/`BUILD_TIME` are tightly
 * formatted (40-char hex / ISO 8601) but defence-in-depth is cheap.
 *
 * The output is a multi-line string; callers should drop it into the
 * `<head>` block alongside other `<meta>` tags. CSP stays `script-src
 * 'self'` because the only emitted `<script>` references a same-origin
 * file with a `defer` attribute.
 */

import { BUILD_ID, BUILD_TIME } from './config.js';
import { escapeHTML } from '../utils/file-utils.js';

/**
 * Build the shared freshness/PWA `<head>` block.
 *
 * @param pathPrefix - Asset path prefix (`''` for root pages, `'../'`
 *                     for `news/` pages).
 * @returns Multi-line HTML string. Caller is responsible for placing it
 *          inside `<head>…</head>`. The result is already HTML-escaped.
 */
export function buildHeadFreshnessTags(pathPrefix: string): string {
  const safeBuildId = escapeHTML(BUILD_ID);
  const safeBuildTime = escapeHTML(BUILD_TIME);
  // Path prefix is built from controlled string literals (`''` or `'../'`),
  // but escape it anyway to keep the helper safe under future callers.
  const safePrefix = escapeHTML(pathPrefix);
  return [
    `  <meta name="build-id" content="${safeBuildId}">`,
    `  <meta name="build-time" content="${safeBuildTime}">`,
    `  <meta http-equiv="Cache-Control" content="no-cache">`,
    `  <meta http-equiv="Pragma" content="no-cache">`,
    `  <link rel="preload" href="${safePrefix}build-info.json" as="fetch" crossorigin="anonymous">`,
    `  <script src="${safePrefix}js/pwa-register.js" defer></script>`,
  ].join('\n');
}
