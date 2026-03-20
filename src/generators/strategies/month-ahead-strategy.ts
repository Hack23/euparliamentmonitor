// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/MonthAheadStrategy
 * @description Article strategy for the Month Ahead article type.
 * Fetches plenary sessions, committee meetings, documents, and legislative
 * pipeline data for the upcoming 30 days, then renders a forward-looking
 * strategic outlook article.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type { LanguageCode, DateRange, WeekAheadData, EPFeedData } from '../../types/index.js';
import { MONTH_AHEAD_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchWeekAheadData, fetchEPFeedData } from '../pipeline/fetch-stage.js';
import { buildWeekAheadContent, buildKeywords } from '../week-ahead-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import {
  buildProspectiveAnalysis,
  buildProspectiveSwot,
  buildProspectiveDashboard,
} from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';
import { pl } from '../../utils/metadata-utils.js';

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link MonthAheadStrategy} */
export interface MonthAheadArticleData extends ArticleData {
  /** Month-ahead date range (30 days) */
  readonly dateRange: DateRange;
  /** Aggregated month-ahead domain data */
  readonly monthData: WeekAheadData;
  /** SEO keywords derived from the data */
  readonly keywords: readonly string[];
  /** Display label for the target month */
  readonly monthLabel: string;
  /** EP feed data for enrichment (when available) */
  readonly feedData?: EPFeedData | undefined;
}

/** Keywords shared by all Month Ahead articles */
const MONTH_AHEAD_KEYWORDS = [
  'European Parliament',
  'month ahead',
  'strategic outlook',
  'legislative calendar',
] as const;

/**
 * Build a content-aware title suffix from month-ahead data counts.
 *
 * @param monthData - Aggregated month-ahead domain data
 * @returns Short suffix for the title, or empty string
 */
function buildMonthAheadTitleSuffix(monthData: WeekAheadData): string {
  const parts: string[] = [];
  if (monthData.events.length > 0) parts.push(pl(monthData.events.length, 'Event', 'Events'));
  if (monthData.committees.length > 0)
    parts.push(pl(monthData.committees.length, 'Committee Meeting', 'Committee Meetings'));
  if (monthData.pipeline.length > 0)
    parts.push(pl(monthData.pipeline.length, 'Pipeline Item', 'Pipeline Items'));
  return parts.join(', ');
}

/**
 * Build a content-aware description from month-ahead data.
 *
 * @param monthData - Aggregated month-ahead domain data
 * @param monthLabel - Display label for the target month
 * @returns SEO-friendly description (≤ 200 chars)
 */
function buildMonthAheadDescription(monthData: WeekAheadData, monthLabel: string): string {
  const parts: string[] = [];
  if (monthData.events.length > 0)
    parts.push(pl(monthData.events.length, 'scheduled event', 'scheduled events'));
  if (monthData.committees.length > 0)
    parts.push(pl(monthData.committees.length, 'committee meeting', 'committee meetings'));
  if (monthData.pipeline.length > 0)
    parts.push(pl(monthData.pipeline.length, 'pipeline procedure', 'pipeline procedures'));
  if (monthData.questions.length > 0)
    parts.push(pl(monthData.questions.length, 'parliamentary question', 'parliamentary questions'));

  if (parts.length === 0) {
    return `European Parliament strategic outlook for ${monthLabel} — legislative milestones and policy agenda.`;
  }

  const desc = `EP month ahead (${monthLabel}): ${parts.join(', ')}.`;
  return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
}

// ─── Date-range helper ────────────────────────────────────────────────────────

/**
 * Compute the month-ahead date range spanning 30 days from the day after `baseDate`.
 *
 * @param baseDate - ISO 8601 publication date (YYYY-MM-DD)
 * @returns Date range spanning the next 30 days
 */
function computeMonthAheadDateRange(baseDate: string): DateRange {
  const base = new Date(`${baseDate}T00:00:00Z`);
  const startDate = new Date(base);
  startDate.setUTCDate(base.getUTCDate() + 1);

  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 30);

  const startParts = startDate.toISOString().split('T');
  const endParts = endDate.toISOString().split('T');

  if (!startParts[0] || !endParts[0]) {
    throw new Error('Invalid date format generated in computeMonthAheadDateRange');
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
 * Article strategy for {@link ArticleCategory.MONTH_AHEAD}.
 * Fetches plenary, committee, document, and pipeline data then builds
 * a forward-looking 30-day strategic outlook of parliamentary activity.
 */
export class MonthAheadStrategy implements ArticleStrategy<MonthAheadArticleData> {
  readonly type = ArticleCategory.MONTH_AHEAD;

  readonly requiredMCPTools = [
    'get_plenary_sessions',
    'get_committee_info',
    'search_documents',
    'monitor_legislative_pipeline',
    'get_parliamentary_questions',
    'get_events',
    'get_events_feed',
    'get_adopted_texts_feed',
    'get_procedures_feed',
  ] as const;

  /**
   * Fetch month-ahead data from MCP.
   *
   * @param client - MCP client or null
   * @param date - ISO 8601 publication date
   * @returns Populated month-ahead data payload
   */
  async fetchData(
    client: EuropeanParliamentMCPClient | null,
    date: string
  ): Promise<MonthAheadArticleData> {
    const dateRange = computeMonthAheadDateRange(date);
    console.log(`  📆 Month-ahead range: ${dateRange.start} to ${dateRange.end}`);

    // Fetch traditional MCP data and EP feeds in parallel
    const [monthData, feedData] = await Promise.all([
      fetchWeekAheadData(client, dateRange),
      fetchEPFeedData(client, 'one-month', dateRange),
    ]);
    const keywords = [...MONTH_AHEAD_KEYWORDS, ...buildKeywords(monthData)];
    const monthLabel = formatMonthLabel(dateRange.start);

    return { date, dateRange, monthData, keywords, monthLabel, feedData };
  }

  /**
   * Build the month-ahead HTML body for the specified language.
   *
   * @param data - Month-ahead data payload
   * @param lang - Target language code used for editorial strings
   * @returns Article HTML body
   */
  buildContent(data: MonthAheadArticleData, lang: LanguageCode): string {
    const base = buildWeekAheadContent(data.monthData, data.dateRange, lang);
    const analysis = buildProspectiveAnalysis(data.monthData, data.dateRange, 'month');
    const analysisSection = buildDeepAnalysisSection(analysis, lang, 'en');
    const swotData = buildProspectiveSwot(data.monthData, 'month', lang);
    const swotSection = buildSwotSection(swotData, lang);
    const dashboardData = buildProspectiveDashboard(data.monthData, 'month', lang);
    const dashboardSection = buildDashboardSection(dashboardData, lang);
    return base.replace(
      '<!-- /article-content -->',
      analysisSection + swotSection + dashboardSection
    );
  }

  /**
   * Return language-specific metadata for the month-ahead article.
   *
   * @param data - Month-ahead data payload
   * @param lang - Target language code
   * @returns Localised metadata
   */
  getMetadata(data: MonthAheadArticleData, lang: LanguageCode): ArticleMetadata {
    const titleFn = getLocalizedString(MONTH_AHEAD_TITLES, lang);
    const { title: baseTitle, subtitle: baseSubtitle } = titleFn(data.monthLabel);
    const suffix = lang === 'en' ? buildMonthAheadTitleSuffix(data.monthData) : '';
    const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
    const subtitle =
      lang === 'en'
        ? buildMonthAheadDescription(data.monthData, data.monthLabel) || baseSubtitle
        : baseSubtitle;
    return {
      title,
      subtitle,
      keywords: data.keywords,
      category: ArticleCategory.MONTH_AHEAD,
      sources: [],
    };
  }
}

/** Singleton instance for use by the strategy registry */
export const monthAheadStrategy = new MonthAheadStrategy();
