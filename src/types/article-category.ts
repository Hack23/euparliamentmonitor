// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/ArticleCategory
 * @description Article-category enum + temporal-perspective / time-period
 * companion enums and their mappings. The foundational classifier for every
 * content pipeline (template selection, editorial voice, horizon math).
 */

/**
 * Article category — the primary classifier for content generation.
 * Each value represents a distinct article type with its own data pipeline,
 * template structure, and editorial voice.
 */
export enum ArticleCategory {
  // Prospective — looking ahead
  WEEK_AHEAD = 'week-ahead',
  MONTH_AHEAD = 'month-ahead',
  /** Rolling 90-day (≈ one Strasbourg cycle plus mini-sessions) horizon */
  QUARTER_AHEAD = 'quarter-ahead',
  YEAR_AHEAD = 'year-ahead',

  // Retrospective — looking back
  WEEK_IN_REVIEW = 'week-in-review',
  MONTH_IN_REVIEW = 'month-in-review',
  /** Trailing 90-day quarter retrospective */
  QUARTER_IN_REVIEW = 'quarter-in-review',
  YEAR_IN_REVIEW = 'year-in-review',

  // Real-time
  BREAKING_NEWS = 'breaking',

  // Domain-specific
  COMMITTEE_REPORTS = 'committee-reports',
  MOTIONS = 'motions',
  PROPOSITIONS = 'propositions',

  // Electoral / multi-year horizon
  /** Mid-term to next-EP-election horizon (today → June 2029 for EP10) */
  TERM_OUTLOOK = 'term-outlook',
  /** EP-election window ± 6 months — dual retrospective + forecast */
  ELECTION_CYCLE = 'election-cycle',

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
  /** Multi-year electoral horizon: term outlook, election cycle */
  ELECTORAL = 'electoral',
}

/**
 * Time period scope for periodic articles (look-ahead or in-review).
 */
export enum TimePeriod {
  WEEK = 'week',
  MONTH = 'month',
  /** Rolling 90-day horizon — quarter / parliamentary cycle */
  QUARTER = 'quarter',
  YEAR = 'year',
  /** Multi-year electoral / term horizon */
  TERM = 'term',
  /** EP election cycle (5-year democratic cycle) */
  ELECTION_CYCLE = 'election-cycle',
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
  [ArticleCategory.QUARTER_AHEAD]: ArticlePerspective.PROSPECTIVE,
  [ArticleCategory.YEAR_AHEAD]: ArticlePerspective.PROSPECTIVE,
  [ArticleCategory.WEEK_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.MONTH_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.QUARTER_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.YEAR_IN_REVIEW]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.BREAKING_NEWS]: ArticlePerspective.REAL_TIME,
  [ArticleCategory.COMMITTEE_REPORTS]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.MOTIONS]: ArticlePerspective.RETROSPECTIVE,
  [ArticleCategory.PROPOSITIONS]: ArticlePerspective.PROSPECTIVE,
  [ArticleCategory.TERM_OUTLOOK]: ArticlePerspective.ELECTORAL,
  [ArticleCategory.ELECTION_CYCLE]: ArticlePerspective.ELECTORAL,
  [ArticleCategory.DEEP_ANALYSIS]: ArticlePerspective.ANALYTICAL,
};

/** Mapping from periodic categories to their time period scope */
export const CATEGORY_TIME_PERIOD: Partial<Record<ArticleCategory, TimePeriod>> = {
  [ArticleCategory.WEEK_AHEAD]: TimePeriod.WEEK,
  [ArticleCategory.MONTH_AHEAD]: TimePeriod.MONTH,
  [ArticleCategory.QUARTER_AHEAD]: TimePeriod.QUARTER,
  [ArticleCategory.YEAR_AHEAD]: TimePeriod.YEAR,
  [ArticleCategory.WEEK_IN_REVIEW]: TimePeriod.WEEK,
  [ArticleCategory.MONTH_IN_REVIEW]: TimePeriod.MONTH,
  [ArticleCategory.QUARTER_IN_REVIEW]: TimePeriod.QUARTER,
  [ArticleCategory.YEAR_IN_REVIEW]: TimePeriod.YEAR,
  [ArticleCategory.TERM_OUTLOOK]: TimePeriod.TERM,
  [ArticleCategory.ELECTION_CYCLE]: TimePeriod.ELECTION_CYCLE,
};

/** Article category labels for a single language — one entry per ArticleCategory */
export type ArticleCategoryLabels = Record<ArticleCategory, string>;

/** Language-specific title and subtitle */
export interface LangTitleSubtitle {
  title: string;
  subtitle: string;
}
