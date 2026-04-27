// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence
 * @description Public re-exports for the political-intelligence
 * bounded context. Sub-modules:
 *
 * - {@link ./types}    — interface contracts (`PIDocument`, `PIDailyRun`, etc.)
 * - {@link ./icons}    — `pickDocumentIcon`, `pickRunIcon`, defaults
 * - {@link ./markdown} — `parseMarkdownMeta`, `extractH1Title`, `humanize`, `stripLeadingEmoji`
 * - {@link ./copy}     — `PICopy`, `DEFAULT_COPY`, `PI_COPY` (14 langs), `getPICopy`
 * - {@link ./data}     — `collectPoliticalIntelligenceData` (filesystem scan)
 * - {@link ./html}     — `generatePoliticalIntelligenceHTML`, `getPoliticalIntelligenceFilename`
 */

export type {
  PIDocument,
  PIDailyDateGroup,
  PIDailyRun,
  PIDailyArtifact,
  PIPageData,
} from './types.js';
export { pickDocumentIcon, pickRunIcon, DEFAULT_DOCUMENT_ICON, DEFAULT_RUN_ICON } from './icons.js';
export { parseMarkdownMeta, extractH1Title, humanize, stripLeadingEmoji } from './markdown.js';
export { DEFAULT_COPY, PI_COPY, getPICopy, type PICopy } from './copy.js';
export { collectPoliticalIntelligenceData } from './data.js';
export { generatePoliticalIntelligenceHTML, getPoliticalIntelligenceFilename } from './html.js';
