// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Sitemap
 * @description Public re-exports for the sitemap bounded context.
 *
 * The sitemap package owns three coherent sub-contexts:
 * - {@link ./xml-utils} — XML-entity escaping shared by every XML output
 * - {@link ./rss} — RSS 2.0 feed generation
 *
 * The remaining XML sitemap and HTML chrome implementations still live
 * in `src/generators/sitemap.ts` for now. They will be promoted into
 * sibling sub-modules under this directory in follow-up work — every
 * import resolves through this barrel so callers can switch at any time
 * without touching their import paths.
 */

export { escapeXML } from './xml-utils.js';
export { generateRssFeed, type RssItem } from './rss.js';
