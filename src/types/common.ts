// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Common
 * @description Core shared types — language codes, article enums, and category mappings.
 * These foundational types are used across all bounded contexts.
 */

/** Supported language codes */
export type LanguageCode =
  | 'en'
  | 'sv'
  | 'da'
  | 'no'
  | 'fi'
  | 'de'
  | 'fr'
  | 'es'
  | 'nl'
  | 'ar'
  | 'he'
  | 'ja'
  | 'ko'
  | 'zh';

/** RTL language codes */
export type RTLLanguageCode = 'ar' | 'he';

/** All possible language codes (including RTL) */
export type AnyLanguageCode = LanguageCode;

/**
 * Article category — the primary classifier for content generation.
 * Each value represents a distinct article type with its own data pipeline,
 * template structure, and editorial voice.
 */
export enum ArticleCategory {
  // Prospective — looking ahead
  WEEK_AHEAD = 'week-ahead',
  MONTH_AHEAD = 'month-ahead',
  YEAR_AHEAD = 'year-ahead',

  // Retrospective — looking back
  WEEK_IN_REVIEW = 'week-in-review',
  MONTH_IN_REVIEW = 'month-in-review',
  YEAR_IN_REVIEW = 'year-in-review',

  // Real-time
  BREAKING_NEWS = 'breaking',

  // Domain-specific
  COMMITTEE_REPORTS = 'committee-reports',
  MOTIONS = 'motions',
  PROPOSITIONS = 'propositions',

  // Analytical
  DEEP_ANALYSIS = 'deep-analysis',
}

/**
 * Temporal perspective of an article — derived from its category.
 * Determines the editorial framing and verb tense.
 */
export enum ArticlePerspective {
  /** Forward-looking: previews, agendas, upcoming events */
  PROSPECTIVE = 'prospective',
  /** Backward-looking: reviews, summaries, retrospectives */
  RETROSPECTIVE = 'retrospective',
  /** Live/current: breaking news, urgent developments */
  REAL_TIME = 'real-time',
  /** Deep dive: multi-perspective analysis, root cause */
  ANALYTICAL = 'analytical',
}

/**
 * Time period scope for periodic articles (look-ahead or in-review).
 */
export enum TimePeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * Analysis perspective for "5 Whys" deep analysis articles.
 * Each perspective frames the same events through a different lens,
 * asking "why" iteratively to uncover root causes.
 */
export enum AnalysisPerspective {
  /** Party dynamics, power shifts, political strategy */
  POLITICAL = 'political',
  /** Budget impact, market effects, fiscal policy */
  ECONOMIC = 'economic',
  /** Citizen impact, public opinion, social equity */
  SOCIAL = 'social',
  /** Treaty basis, legal competence, compliance */
  LEGAL = 'legal',
  /** Climate, sustainability, green transition */
  ENVIRONMENTAL = 'environmental',
  /** EU external relations, global positioning */
  GEOPOLITICAL = 'geopolitical',
  /** EU institutional mechanics, inter-institutional balance */
  INSTITUTIONAL = 'institutional',
}

/** Mapping from ArticleCategory to its inherent ArticlePerspective */
export const CATEGORY_PERSPECTIVE: Record<ArticleCategory, ArticlePerspective> = {
  [ArticleCategory.WEEK_AHEAD]: ArticlePerspective.PROSPECTIVE,
  [ArticleCategory.MONTH_AHEAD]: ArticlePerspective.PROSPECTIVE,
  [ArticleCategory.YEAR_AHEAD]: ArticlePerspective.PROSPECTIVE,
  [ArticleCategory.WEEK_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.MONTH_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.YEAR_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.BREAKING_NEWS]: ArticlePerspective.REAL_TIME,
  [ArticleCategory.COMMITTEE_REPORTS]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.MOTIONS]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.PROPOSITIONS]: ArticlePerspective.PROSPECTIVE,
  [ArticleCategory.DEEP_ANALYSIS]: ArticlePerspective.ANALYTICAL,
};

/** Mapping from periodic categories to their time period scope */
export const CATEGORY_TIME_PERIOD: Partial<Record<ArticleCategory, TimePeriod>> = {
  [ArticleCategory.WEEK_AHEAD]: TimePeriod.WEEK,
  [ArticleCategory.MONTH_AHEAD]: TimePeriod.MONTH,
  [ArticleCategory.YEAR_AHEAD]: TimePeriod.YEAR,
  [ArticleCategory.WEEK_IN_REVIEW]: TimePeriod.WEEK,
  [ArticleCategory.MONTH_IN_REVIEW]: TimePeriod.MONTH,
  [ArticleCategory.YEAR_IN_REVIEW]: TimePeriod.YEAR,
};

/** Language preset names */
export type LanguagePreset = 'all' | 'eu-core' | 'nordic';

/** Map from language code to translated string */
export type LanguageMap<T = string> = Record<LanguageCode, T>;

/** Article category labels for a single language — one entry per ArticleCategory */
export type ArticleCategoryLabels = Record<ArticleCategory, string>;

/** Language-specific title and subtitle */
export interface LangTitleSubtitle {
  title: string;
  subtitle: string;
}

/** Localized strings for propositions articles */
export interface PropositionsStrings {
  lede: string;
  proposalsHeading: string;
  pipelineHeading: string;
  procedureHeading: string;
  analysisHeading: string;
  analysis: string;
  pipelineHealthLabel: string;
  throughputRateLabel: string;
}
