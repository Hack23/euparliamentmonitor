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
 * This is a type alias for the canonical {@link ArticleMeta} interface
 * defined in `article-meta.ts`. Use this name when referring to the
 * sidecar contract in downstream consumers (HTML, RSS, sitemap, news
 * indexes).
 */
export type { ArticleMeta as ArticleMetaSidecar } from '../article-meta.js';
