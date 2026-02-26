// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/MonthlyReviewStrategy
 * @description Article strategy for the Month In Review article type.
 * Fetches voting records, committee reports, documents, and parliamentary
 * questions from the past 30 days, then renders a comprehensive
 * retrospective analysis article.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type {
  LanguageCode,
  DateRange,
  VotingRecord,
  VotingPattern,
  VotingAnomaly,
  MotionsQuestion,
} from '../../types/index.js';
import { MONTHLY_REVIEW_TITLES, getLocalizedString } from '../../constants/languages.js';
import {
  fetchVotingRecords,
  fetchVotingPatterns,
  fetchMotionsAnomalies,
  fetchParliamentaryQuestionsForMotions,
} from '../pipeline/fetch-stage.js';
import { generateMotionsContent } from '../motions-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link MonthlyReviewStrategy} */
export interface MonthlyReviewArticleData extends ArticleData {
  /** Review period date range (30 days) */
  readonly dateRange: DateRange;
  /** Voting records from the review period */
  readonly votingRecords: readonly VotingRecord[];
  /** Voting patterns analysis */
  readonly votingPatterns: readonly VotingPattern[];
  /** Detected voting anomalies */
  readonly anomalies: readonly VotingAnomaly[];
  /** Parliamentary questions from the period */
  readonly questions: readonly MotionsQuestion[];
  /** Start date string for display */
  readonly dateFromStr: string;
  /** Display label for the review month */
  readonly monthLabel: string;
}

/** Keywords shared by all Monthly Review articles */
const MONTHLY_REVIEW_KEYWORDS = [
  'European Parliament',
  'monthly review',
  'legislative output',
  'coalition dynamics',
] as const;

// ─── Date-range helper ────────────────────────────────────────────────────────

/**
 * Compute the review period covering the 30 days ending on `baseDate`.
 *
 * @param baseDate - ISO 8601 publication date (YYYY-MM-DD)
 * @returns Date range covering the past 30 days
 */
function computeMonthlyReviewDateRange(baseDate: string): DateRange {
  const end = new Date(`${baseDate}T00:00:00Z`);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 30);

  const startParts = start.toISOString().split('T');
  const endParts = end.toISOString().split('T');

  if (!startParts[0] || !endParts[0]) {
    throw new Error('Invalid date format generated in computeMonthlyReviewDateRange');
  }

  return {
    start: startParts[0],
    end: endParts[0],
  };
}

/**
 * Format a month label from a date string (e.g. "February 2026").
 *
 * @param dateStr - ISO 8601 date
 * @returns Human-readable month label
 */
function formatMonthLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// ─── Strategy implementation ──────────────────────────────────────────────────

/**
 * Article strategy for {@link ArticleCategory.MONTH_IN_REVIEW}.
 * Fetches voting records, anomalies, patterns, and questions for the
 * past 30 days and builds a comprehensive retrospective analysis.
 */
export class MonthlyReviewStrategy implements ArticleStrategy<MonthlyReviewArticleData> {
  readonly type = ArticleCategory.MONTH_IN_REVIEW;

  readonly requiredMCPTools = [
    'get_voting_records',
    'analyze_voting_patterns',
    'detect_voting_anomalies',
    'get_parliamentary_questions',
  ] as const;

  /**
   * Fetch monthly review data from MCP.
   *
   * @param client - MCP client or null
   * @param date - ISO 8601 publication date
   * @returns Populated monthly review data payload
   */
  async fetchData(
    client: EuropeanParliamentMCPClient | null,
    date: string
  ): Promise<MonthlyReviewArticleData> {
    const dateRange = computeMonthlyReviewDateRange(date);
    console.log(`  📊 Monthly review range: ${dateRange.start} to ${dateRange.end}`);

    const [votingRecords, votingPatterns, anomalies, questions] = await Promise.all([
      fetchVotingRecords(client, dateRange.start, dateRange.end),
      fetchVotingPatterns(client, dateRange.start, dateRange.end),
      fetchMotionsAnomalies(client, dateRange.start, dateRange.end),
      fetchParliamentaryQuestionsForMotions(client, dateRange.start, dateRange.end),
    ]);

    const monthLabel = formatMonthLabel(dateRange.start);

    return {
      date,
      dateRange,
      dateFromStr: dateRange.start,
      votingRecords,
      votingPatterns,
      anomalies,
      questions,
      monthLabel,
    };
  }

  /**
   * Build the monthly review HTML body for the specified language.
   *
   * @param data - Monthly review data payload
   * @param lang - Target language code used for editorial strings
   * @returns Article HTML body
   */
  buildContent(data: MonthlyReviewArticleData, lang: LanguageCode): string {
    return generateMotionsContent(
      data.dateRange.start,
      data.dateRange.end,
      data.votingRecords as VotingRecord[],
      data.votingPatterns as VotingPattern[],
      data.anomalies as VotingAnomaly[],
      data.questions as MotionsQuestion[],
      lang
    );
  }

  /**
   * Return language-specific metadata for the monthly review article.
   *
   * @param data - Monthly review data payload
   * @param lang - Target language code
   * @returns Localised metadata
   */
  getMetadata(data: MonthlyReviewArticleData, lang: LanguageCode): ArticleMetadata {
    const titleFn = getLocalizedString(MONTHLY_REVIEW_TITLES, lang);
    const { title, subtitle } = titleFn(data.monthLabel);
    return {
      title,
      subtitle,
      keywords: [...MONTHLY_REVIEW_KEYWORDS],
      category: ArticleCategory.MONTH_IN_REVIEW,
      sources: [],
    };
  }
}

/** Singleton instance for use by the strategy registry */
export const monthlyReviewStrategy = new MonthlyReviewStrategy();
