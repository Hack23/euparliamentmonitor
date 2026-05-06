// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata
 * @description Public re-exports for the metadata bounded context.
 * Provides article metadata building, SEO metadata resolution,
 * and structured data contracts.
 */

export type { PerLanguageMetadata, ArticleMetaSidecar } from './types.js';

export type { ArticleMeta, BuildArticleMetaOptions } from '../article-meta.js';
export { buildArticleMeta } from '../article-meta.js';

export type { ResolvedMetadataEntry, ResolvedMetadata } from '../article-metadata.js';
export { resolveArticleMetadata, stripInlineMarkdown } from '../article-metadata.js';
