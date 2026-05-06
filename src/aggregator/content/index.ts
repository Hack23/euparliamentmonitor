// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Content
 * @description Public re-exports for the content extraction bounded context.
 * Provides lead extraction, key takeaways synthesis, and intelligence guide
 * generation.
 */

export type { ExtractedLead, SynthesisedTakeaway, KeyTakeawaysResult } from './types.js';

export {
  extractExecutiveLead,
  extractLeadParagraph,
  trimToLeadSentence,
  MAX_LEAD_CHARS,
} from '../lead-extractor.js';

export type { Takeaway, BuildKeyTakeawaysOptions } from '../key-takeaways.js';
export {
  buildKeyTakeaways,
  MIN_TAKEAWAYS,
  MAX_TAKEAWAYS,
  KEY_TAKEAWAYS_SECTION_ID,
  KEY_TAKEAWAYS_SECTION_TITLE,
} from '../key-takeaways.js';

export {
  buildReaderIntelligenceGuideHtml,
} from '../reader-intelligence-guide.js';

export {
  READER_GUIDE_SECTION_ID,
  READER_GUIDE_SECTION_IDS,
  READER_GUIDE_SECTION_TITLE,
} from '../reader-guide-constants.js';

export type { TocSection, IncludedArtifact } from '../reader-guide-constants.js';
