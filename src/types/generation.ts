// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Generation
 * @description Types for the article generation pipeline — article options, metadata,
 * sitemap entries, and generation statistics.
 */

import type { AnalysisPerspective, ArticleCategory, LanguageCode } from './common.js';

/** Parsed article metadata from filename */
export interface ParsedArticle {
  date: string;
  slug: string;
  lang: LanguageCode;
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
  lang: LanguageCode;
  content: string;
  keywords?: string[] | undefined;
  sources?: ArticleSource[] | undefined;
  analysisPerspectives?: AnalysisPerspective[] | undefined;
  /** SRI hash (sha256/sha384/sha512) for the styles.css link (e.g. "sha384-…"). If provided, adds integrity and crossorigin attributes. */
  stylesHash?: string | undefined;
  /** Languages for which this article has been generated. When provided, the language switcher only shows links for these languages. Defaults to all supported languages. */
  availableLanguages?: ReadonlyArray<LanguageCode> | undefined;
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
  lang: LanguageCode;
  title: string;
  description?: string | undefined;
  type?: string | undefined;
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
  files?: number | undefined;
  slug?: string | undefined;
  error?: string | undefined;
}

/** Article quality score metadata */
export interface ArticleQualityScore {
  /** Approximate word count (HTML-stripped) */
  wordCount: number;
  /** Number of analysis sections (excludes visualization sections like dashboard, mindmap, SWOT) */
  analysisSections: number;
  /** Number of data visualizations (charts, dashboards, mindmaps) */
  visualizationCount: number;
  /** Number of external evidence references (links to EP documents) */
  evidenceReferences: number;
  /** Overall quality rating */
  overallScore: 'excellent' | 'good' | 'adequate' | 'needs-improvement';
}

/** Table of contents entry */
export interface TOCEntry {
  /** Anchor id (without #) */
  id: string;
  /** Display label */
  label: string;
  /** Nesting level (1 = top-level) */
  level: 1 | 2;
}
