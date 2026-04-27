// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence
 * @description Generates the localized `political-intelligence_<lang>.html`
 * pages — a curated index of every political-intelligence methodology,
 * artifact template, and daily analysis run shipped in this repository.
 *
 * Each page links to the matching Markdown source on GitHub so that readers
 * can inspect the raw tradecraft behind every published article. The English
 * variant lives at `political-intelligence.html`; all 13 other locales live
 * at `political-intelligence_<lang>.html`.
 *
 * **This file is now a thin re-export shim.** The implementation has been
 * carved into focused sub-modules under `./political-intelligence/`:
 *
 * - `./political-intelligence/types`       — type-only contracts
 * - `./political-intelligence/icons`       — `pickDocumentIcon`, `pickRunIcon`
 * - `./political-intelligence/markdown`    — Markdown parsing helpers
 * - `./political-intelligence/copy`        — `PICopy`, `DEFAULT_COPY`, `PI_COPY`, `getPICopy` (14 langs)
 * - `./political-intelligence/data`        — `collectPoliticalIntelligenceData` and helpers
 * - `./political-intelligence/html`        — `generatePoliticalIntelligenceHTML`, `getPoliticalIntelligenceFilename`
 *
 * Every public symbol is re-exported below so existing import sites
 * (`from './generators/political-intelligence.js'`) continue to resolve
 * without churn.
 */

// Type contracts
export type {
  PIDocument,
  PIDailyDateGroup,
  PIDailyRun,
  PIDailyArtifact,
  PIPageData,
} from './political-intelligence/types.js';

// Icon picking
export { pickDocumentIcon, pickRunIcon } from './political-intelligence/icons.js';

// Markdown parsing
export { parseMarkdownMeta } from './political-intelligence/markdown.js';

// Data collection
export { collectPoliticalIntelligenceData } from './political-intelligence/data.js';

// HTML rendering + filename helper
export {
  generatePoliticalIntelligenceHTML,
  getPoliticalIntelligenceFilename,
} from './political-intelligence/html.js';
