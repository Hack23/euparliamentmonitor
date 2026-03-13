// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Intelligence
 * @description Cross-article intelligence types for parliamentary trend tracking.
 * Enables trend detection, historical context linking, and unified intelligence
 * reporting across all article types.
 */

import type { ArticleCategory, LanguageCode } from './common.js';

/**
 * Describes a directional relationship between two articles.
 * - `follows_up`: Current article is a follow-up to the target
 * - `preceded_by`: Target article preceded the current article
 * - `related`: Articles share significant topic/actor overlap
 * - `contradicts`: Articles present opposing analyses
 * - `deepens`: Current article provides deeper analysis of the target
 */
export type CrossReferenceRelationship =
  | 'follows_up'
  | 'preceded_by'
  | 'related'
  | 'contradicts'
  | 'deepens';

/** Signal strength of a cross-reference link */
export type CrossReferenceStrength = 'strong' | 'moderate' | 'weak';

/**
 * A directional reference from one article to another.
 * Used to build navigational and analytical links between related content.
 */
export interface ArticleCrossReference {
  /** Identifier of the referenced article (YYYY-MM-DD-type-lang) */
  targetArticleId: string;
  /** Nature of the relationship from the source article's perspective */
  relationship: CrossReferenceRelationship;
  /** Human-readable description of why these articles are linked */
  context: string;
  /** How strongly the two articles are related */
  strength: CrossReferenceStrength;
}

/** Trend category classifying the political domain */
export type TrendCategory = 'coalition' | 'legislative' | 'procedural' | 'political';

/** Direction of trend movement over time */
export type TrendDirection = 'strengthening' | 'weakening' | 'stable' | 'emerging';

/** Confidence level in a detected trend */
export type TrendConfidence = 'high' | 'medium' | 'low';

/**
 * A parliamentary trend detected across multiple articles.
 * Requires a minimum of 2 article references to be valid.
 */
export interface TrendDetection {
  /** Unique trend identifier */
  id: string;
  /** Human-readable trend name */
  name: string;
  /** Political domain this trend belongs to */
  category: TrendCategory;
  /** Current momentum direction */
  direction: TrendDirection;
  /** ISO date when this trend was first observed */
  firstSeen: string;
  /** ISO date when this trend was most recently updated */
  lastUpdated: string;
  /** Identifiers of articles that contribute evidence for this trend */
  articleReferences: string[];
  /** Key evidence points supporting the trend */
  evidence: string[];
  /** Reliability of the trend detection */
  confidence: TrendConfidence;
}

/** Lifecycle status of an article series */
export type ArticleSeriesStatus = 'ongoing' | 'concluded';

/**
 * A named series of articles tracking a single legislative procedure or topic.
 */
export interface ArticleSeries {
  /** Unique series identifier */
  id: string;
  /** Human-readable series name */
  name: string;
  /** Optional EP procedure reference (e.g. "2024/0001(COD)") */
  procedureRef?: string | undefined;
  /** Ordered list of article IDs in this series */
  articles: string[];
  /** Whether the series is still being updated */
  status: ArticleSeriesStatus;
  /** Brief editorial summary of the series arc */
  summary: string;
}

/**
 * Lightweight index entry for a single generated article.
 * The `id` follows the convention YYYY-MM-DD-type-lang.
 */
export interface ArticleIndexEntry {
  /** Article identifier: YYYY-MM-DD-type-lang */
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Article category / type */
  type: ArticleCategory;
  /** Language code */
  lang: LanguageCode;
  /** Key topics covered in the article */
  keyTopics: string[];
  /** Key actors (MEPs, committees, political groups) mentioned */
  keyActors: string[];
  /** EP procedure references covered in the article */
  procedures: string[];
  /** Cross-references to other articles */
  crossReferences: ArticleCrossReference[];
  /** Trend IDs this article contributes evidence for */
  trendContributions: string[];
  /** Series ID if this article belongs to a series */
  seriesId?: string | undefined;
}

/**
 * The top-level intelligence index that aggregates cross-article analytics.
 * Uses `Record<string, string[]>` (not Map) for JSON serialisation compatibility.
 */
export interface IntelligenceIndex {
  /** All indexed articles */
  articles: ArticleIndexEntry[];
  /** Actor name → list of article IDs mentioning that actor */
  actors: Record<string, string[]>;
  /** Policy domain keyword → list of article IDs covering that domain */
  policyDomains: Record<string, string[]>;
  /** EP procedure reference → list of article IDs covering that procedure */
  procedures: Record<string, string[]>;
  /** Detected trends across articles */
  trends: TrendDetection[];
  /** Article series groupings */
  series: ArticleSeries[];
  /** ISO timestamp of last index update */
  lastUpdated: string;
}
