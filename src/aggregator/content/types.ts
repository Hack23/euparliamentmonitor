// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Content/Types
 * @description Strict type definitions for the content extraction bounded
 * context. Covers lead paragraph extraction, key takeaways synthesis,
 * and section-to-artifact mapping.
 */

/**
 * Extracted lead paragraph — the journalistic "nut graf" from the article.
 */
export interface ExtractedLead {
  /** The extracted lead text (plain, no Markdown). */
  readonly text: string;
  /** Run-relative source artifact the lead was extracted from. */
  readonly source: string;
  /** Character length of the extracted lead. */
  readonly length: number;
}

/**
 * One synthesised key takeaway bullet ready for rendering.
 */
export interface SynthesisedTakeaway {
  /** Bullet body in Markdown (trimmed; no leading `- `). */
  readonly body: string;
  /** Run-relative path of the source artifact. */
  readonly source: string;
}

/**
 * Result of key-takeaways synthesis for the entire article.
 */
export interface KeyTakeawaysResult {
  /** Ordered list of synthesised takeaways (3–7 items). */
  readonly takeaways: readonly SynthesisedTakeaway[];
  /** Rendered Markdown block (empty string when below minimum threshold). */
  readonly markdown: string;
}
