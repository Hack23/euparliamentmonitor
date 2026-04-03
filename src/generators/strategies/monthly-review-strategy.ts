// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/MonthlyReviewStrategy
 * @description Article strategy for the Month In Review article type.
 * Fetches voting records, voting patterns, voting anomalies, and
 * parliamentary questions from the past 30 days, then renders a
 * comprehensive retrospective analysis article.
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
  EPFeedData,
} from '../../types/index.js';
import { MONTHLY_REVIEW_TITLES, getLocalizedString } from '../../constants/languages.js';
import {
  fetchVotingRecords,
  fetchVotingPatterns,
  fetchMotionsAnomalies,
  fetchParliamentaryQuestionsForMotions,
  fetchEPFeedData,
} from '../pipeline/fetch-stage.js';
import { generateMotionsContent } from '../motions-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import {
  buildVotingAnalysis,
  buildVotingSwot,
  buildVotingDashboard,
  buildVotingMindmap,
} from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
import { buildIntelligenceMindmapSection } from '../mindmap-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';
import { pl } from '../../utils/metadata-utils.js';

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
  /** EP feed data for enrichment (when available) */
  readonly feedData?: EPFeedData | undefined;
}

/** Base keywords shared by all Monthly Review articles */
const MONTHLY_REVIEW_BASE_KEYWORDS = [
  'European Parliament',
  'monthly review',
  'legislative output',
  'coalition dynamics',
] as const;

/**
 * Test whether a text string is placeholder/fallback content.
 *
 * @param text - Candidate text to test
 * @returns `true` when the text matches known placeholder patterns
 */
function isPlaceholderText(text: string): boolean {
  return /placeholder|data.unavailable|example\s+(motion|amendment|group)/i.test(text);
}

/**
 * Extract content-aware keywords from monthly review data.
 *
 * @param data - Monthly review article data payload
 * @returns Deduplicated keyword array
 */
function buildMonthlyReviewKeywords(data: MonthlyReviewArticleData): string[] {
  const keywords: string[] = [...MONTHLY_REVIEW_BASE_KEYWORDS];

  for (const r of data.votingRecords.slice(0, 5)) {
    if (r.title && !isPlaceholderText(r.title)) keywords.push(r.title.slice(0, 60));
  }
  for (const a of data.anomalies.slice(0, 3)) {
    if (a.type && !isPlaceholderText(a.type)) keywords.push(a.type);
  }
  for (const q of data.questions.slice(0, 3)) {
    if (q.topic && !isPlaceholderText(q.topic)) keywords.push(q.topic);
  }

  return [...new Set(keywords)];
}

/**
 * Build a content-aware description from monthly review data.
 *
 * @param data - Monthly review article data payload
 * @returns SEO-friendly description (≤ 200 chars)
 */
function buildMonthlyReviewDescription(data: MonthlyReviewArticleData): string {
  const parts: string[] = [];

  if (data.votingRecords.length > 0)
    parts.push(`${pl(data.votingRecords.length, 'vote', 'votes')} analysed`);
  if (data.anomalies.length > 0)
    parts.push(pl(data.anomalies.length, 'voting anomaly', 'voting anomalies'));
  if (data.questions.length > 0)
    parts.push(`${pl(data.questions.length, 'question', 'questions')} tabled`);

  if (parts.length === 0) {
    return `European Parliament monthly review for ${data.monthLabel} — legislative output and coalition dynamics.`;
  }

  const highlight = data.votingRecords[0]?.title ?? '';
  const base = `EP month in review (${data.monthLabel}): ${parts.join(', ')}`;
  if (highlight) {
    const full = `${base}. Key: ${highlight}`;
    return full.length > 200 ? full.slice(0, 197) + '...' : full;
  }
  return base.length > 200 ? base.slice(0, 197) + '...' : base;
}

/**
 * Build a content-aware title suffix from monthly review data counts.
 *
 * @param data - Monthly review article data payload
 * @returns Short suffix for the title, or empty string
 */
function buildMonthlyReviewTitleSuffix(data: MonthlyReviewArticleData): string {
  const parts: string[] = [];
  if (data.votingRecords.length > 0) parts.push(pl(data.votingRecords.length, 'Vote', 'Votes'));
  if (data.anomalies.length > 0) parts.push(pl(data.anomalies.length, 'Anomaly', 'Anomalies'));
  return parts.join(', ');
}

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
 * @returns Human-readable month label, using the runtime's default locale
 */
function formatMonthLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' });
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
    'get_adopted_texts_feed',
    'get_procedures_feed',
    'get_events_feed',
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

    // Fetch voting data and EP feed data in parallel
    const [votingRecords, votingPatterns, anomalies, questions, feedData] = await Promise.all([
      fetchVotingRecords(client, dateRange.start, dateRange.end),
      fetchVotingPatterns(client, dateRange.start, dateRange.end),
      fetchMotionsAnomalies(client, dateRange.start, dateRange.end),
      fetchParliamentaryQuestionsForMotions(client, dateRange.start, dateRange.end),
      fetchEPFeedData(client, 'one-month', dateRange),
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
      feedData,
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
    const base = generateMotionsContent(
      data.dateRange.start,
      data.dateRange.end,
      [...data.votingRecords],
      [...data.votingPatterns],
      [...data.anomalies],
      [...data.questions],
      lang
    );
    const analysis = buildVotingAnalysis(
      data.dateRange.start,
      data.dateRange.end,
      data.votingRecords,
      data.votingPatterns,
      data.anomalies,
      data.questions
    );
    const deepSection = buildDeepAnalysisSection(analysis, lang, 'en');
    const mindmapData = buildVotingMindmap(
      data.votingRecords,
      data.votingPatterns,
      data.anomalies,
      lang
    );
    const mindmapSection = buildIntelligenceMindmapSection(mindmapData, lang);
    const swotData = buildVotingSwot(data.votingRecords, data.votingPatterns, data.anomalies, lang);
    const swotSection = buildSwotSection(swotData, lang);
    const dashboardData = buildVotingDashboard(
      data.votingRecords,
      data.votingPatterns,
      data.anomalies,
      lang
    );
    const dashboardSection = buildDashboardSection(dashboardData, lang);
    return base.replace(
      '<!-- /article-content -->',
      deepSection + mindmapSection + swotSection + dashboardSection
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
    const { title: baseTitle, subtitle: baseSubtitle } = titleFn(data.monthLabel);
    const suffix = lang === 'en' ? buildMonthlyReviewTitleSuffix(data) : '';
    const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
    const description = lang === 'en' ? buildMonthlyReviewDescription(data) : '';
    const subtitle = description || baseSubtitle;
    return {
      title,
      subtitle,
      keywords: buildMonthlyReviewKeywords(data),
      category: ArticleCategory.MONTH_IN_REVIEW,
      sources: [],
    };
  }
}

/** Singleton instance for use by the strategy registry */
export const monthlyReviewStrategy = new MonthlyReviewStrategy();
