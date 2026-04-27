// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/PoliticalIntelligence
 * @description Public re-exports for the political-intelligence
 * bounded context. Sub-modules so far:
 *
 * - {@link ./types}    — interface contracts (`PIDocument`, `PIDailyRun`, etc.)
 * - {@link ./icons}    — `pickDocumentIcon`, `pickRunIcon`, defaults
 * - {@link ./markdown} — `parseMarkdownMeta`, `extractH1Title`, `humanize`, `stripLeadingEmoji`
 *
 * The remaining ~1400 LOC of localized copy, data collection, and HTML
 * rendering still live in `src/generators/political-intelligence.ts`
 * for now. They will be carved out in a follow-up PR; the data and
 * rendering have non-trivial coupling to the curated-description table
 * and need byte-equality fixtures before being moved.
 */

export type {
  PIDocument,
  PIDailyDateGroup,
  PIDailyRun,
  PIDailyArtifact,
  PIPageData,
} from './types.js';
export {
  pickDocumentIcon,
  pickRunIcon,
  DEFAULT_DOCUMENT_ICON,
  DEFAULT_RUN_ICON,
} from './icons.js';
export {
  parseMarkdownMeta,
  extractH1Title,
  humanize,
  stripLeadingEmoji,
} from './markdown.js';
