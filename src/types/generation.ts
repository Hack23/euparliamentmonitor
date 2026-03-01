// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Generation
 * @description Types for the article generation pipeline — article options, metadata,
 * sitemap entries, and generation statistics.
 */

import type { AnalysisPerspective, ArticleCategory } from './common.js';

/** Parsed article metadata from filename */
export interface ParsedArticle {
  date: string;
  slug: string;
  lang: string;
  filename: string;
}

/** Article source reference */
export interface ArticleSource {
  title: string;
  url: string;
}

/** Options for generating article HTML */
export interface ArticleOptions {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: ArticleCategory;
  readTime: number;
  lang: string;
  content: string;
  keywords?: string[];
  sources?: ArticleSource[];
  analysisPerspectives?: AnalysisPerspective[];
  /** SHA-384 SRI hash for the styles.css link (e.g. "sha384-…"). If provided, adds integrity/crossorigin attributes. */
  stylesHash?: string;
}

/** Sitemap URL entry */
export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/** News article metadata entry */
export interface ArticleMetadataEntry {
  filename: string;
  date: string;
  slug: string;
  lang: string;
  title: string;
  description?: string;
  type?: string;
}

/** News metadata database */
export interface NewsMetadataDatabase {
  lastUpdated: string;
  articles: ArticleMetadataEntry[];
}

/** Date range for article generation */
export interface DateRange {
  start: string;
  end: string;
}

/** Generation statistics */
export interface GenerationStats {
  generated: number;
  skipped: number;
  dryRun: number;
  errors: number;
  articles: string[];
  timestamp: string;
}

/** Generation result */
export interface GenerationResult {
  success: boolean;
  files?: number;
  slug?: string;
  error?: string;
}
