// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/Types
 * @description Strict type definitions for the metadata bounded context.
 * Covers article metadata, SEO metadata, and structured data contracts.
 */

import type { LanguageCode } from '../../types/index.js';

/**
 * Per-language resolved metadata entry containing the title and
 * description that will be rendered into HTML meta tags and
 * structured data (JSON-LD).
 */
export interface PerLanguageMetadata {
  /** Language code this entry is for. */
  readonly lang: LanguageCode;
  /** Resolved title for the article in this language. */
  readonly title: string;
  /** Resolved description for the article in this language. */
  readonly description: string;
}

/**
 * Complete article metadata sidecar shape (`article-meta.json`).
 * This is the canonical contract between the aggregator pipeline
 * and downstream consumers (HTML, RSS, sitemap, news indexes).
 */
export interface ArticleMetaSidecar {
  /** ISO date of the run (`YYYY-MM-DD`). */
  readonly date: string;
  /** Article type slug (e.g. `breaking`). */
  readonly articleType: string;
  /** Stable run identifier from the manifest. */
  readonly runId: string;
  /** Latest non-PENDING gate result. */
  readonly gateResult: string;
  /** Article slug used by the news pages. */
  readonly slug: string;
  /** Run-relative path of the canonical `article.md`. */
  readonly articlePath: string;
  /** One-sentence executive lead — the strongest finding, distilled. */
  readonly topFinding: string;
  /** 3–7 deterministic key takeaways harvested from synthesis-summary. */
  readonly keyTakeaways: readonly string[];
  /** Top political risks (artifact-driven, may be empty). */
  readonly topRisks: readonly string[];
  /** Key dated triggers / "what to watch" items. */
  readonly keyDates: readonly string[];
  /** Key actors / political groups identified by the artifacts. */
  readonly keyActors: readonly string[];
  /** Optional IMF / WorldBank macro hook surfaced as a sidebar callout. */
  readonly macroContext: string;
  /** Run-relative paths of every artifact whose content fed into this meta record. */
  readonly sources: readonly string[];
}
