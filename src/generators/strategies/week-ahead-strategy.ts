// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/WeekAheadStrategy
 * @description Article strategy for the Week Ahead article type.
 * Fetches plenary sessions, committee meetings, documents, pipeline and
 * parliamentary questions then renders a forward-looking HTML article.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type { LanguageCode, DateRange, WeekAheadData, EPFeedData } from '../../types/index.js';
import { WEEK_AHEAD_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchWeekAheadData, fetchEPFeedData } from '../pipeline/fetch-stage.js';
import {
  buildWeekAheadContent,
  buildKeywords,
  buildWhatToWatchSection,
} from '../week-ahead-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import {
  buildProspectiveAnalysis,
  buildProspectiveSwot,
  buildProspectiveDashboard,
} from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link WeekAheadStrategy} */
export interface WeekAheadArticleData extends ArticleData {
  /** Week-ahead date range */
  readonly dateRange: DateRange;
  /** Aggregated week-ahead domain data */
  readonly weekData: WeekAheadData;
  /** SEO keywords derived from the week-ahead data */
  readonly keywords: readonly string[];
  /** EP feed data for enrichment (when available) */
  readonly feedData?: EPFeedData;
}

// ─── Date-range helper ────────────────────────────────────────────────────────

/**
 * Compute the week-ahead date range starting the day after `baseDate`.
 *
 * @param baseDate - ISO 8601 publication date (YYYY-MM-DD)
 * @returns Date range spanning the next 7 days
 */
function computeWeekAheadDateRange(baseDate: string): DateRange {
  const base = new Date(`${baseDate}T00:00:00Z`);
  const startDate = new Date(base);
  startDate.setUTCDate(base.getUTCDate() + 1);

  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 7);

  const startParts = startDate.toISOString().split('T');
  const endParts = endDate.toISOString().split('T');

  if (!startParts[0] || !endParts[0]) {
    throw new Error('Invalid date format generated in computeWeekAheadDateRange');
  }

  return {
    start: startParts[0],
    end: endParts[0],
  };
}

// ─── Strategy implementation ──────────────────────────────────────────────────

/**
 * Article strategy for {@link ArticleCategory.WEEK_AHEAD}.
 * Fetches plenary, committee, document, pipeline and question data then builds
 * a forward-looking preview of the upcoming parliamentary week.
 */
export class WeekAheadStrategy implements ArticleStrategy<WeekAheadArticleData> {
  readonly type = ArticleCategory.WEEK_AHEAD;

  readonly requiredMCPTools = [
    'get_plenary_sessions',
    'get_committee_info',
    'search_documents',
    'monitor_legislative_pipeline',
    'get_parliamentary_questions',
    'get_events',
    'get_events_feed',
    'get_plenary_documents_feed',
    'get_adopted_texts_feed',
  ] as const;

  /**
   * Fetch week-ahead data from MCP.
   *
   * @param client - MCP client or null
   * @param date - ISO 8601 publication date
   * @returns Populated week-ahead data payload
   */
  async fetchData(
    client: EuropeanParliamentMCPClient | null,
    date: string
  ): Promise<WeekAheadArticleData> {
    const dateRange = computeWeekAheadDateRange(date);
    console.log(`  📆 Date range: ${dateRange.start} to ${dateRange.end}`);

    // Fetch traditional MCP data and EP feeds in parallel
    const [weekData, feedData] = await Promise.all([
      fetchWeekAheadData(client, dateRange),
      fetchEPFeedData(client, 'one-week', dateRange),
    ]);
    const keywords = buildKeywords(weekData);

    return { date, dateRange, weekData, keywords, feedData };
  }

  /**
   * Build the week-ahead HTML body for the specified language.
   *
   * @param data - Week-ahead data payload
   * @param lang - Target language code used for editorial strings
   * @returns Article HTML body
   */
  buildContent(data: WeekAheadArticleData, lang: LanguageCode): string {
    const base = buildWeekAheadContent(data.weekData, data.dateRange, lang);
    const watchSection = buildWhatToWatchSection(data.weekData.pipeline, [], lang);
    const analysis = buildProspectiveAnalysis(data.weekData, data.dateRange, 'week');
    const analysisSection = buildDeepAnalysisSection(analysis, lang, 'en');
    const swotData = buildProspectiveSwot(data.weekData, 'week');
    const swotSection = buildSwotSection(swotData, lang);
    const dashboardData = buildProspectiveDashboard(data.weekData, 'week');
    const dashboardSection = buildDashboardSection(dashboardData, lang);
    // Inject at the explicit <!-- /article-content --> marker position so the
    // section stays inside the .article-content styling scope. The marker is
    // removed from the final HTML output to avoid unnecessary bytes.
    const injection = (watchSection || '') + analysisSection + swotSection + dashboardSection;
    if (injection) {
      return base.replace('<!-- /article-content -->', injection);
    }
    return base.replace('<!-- /article-content -->', '');
  }

  /**
   * Return language-specific metadata for the week-ahead article.
   *
   * @param data - Week-ahead data payload
   * @param lang - Target language code
   * @returns Localised metadata
   */
  getMetadata(data: WeekAheadArticleData, lang: LanguageCode): ArticleMetadata {
    const titleFn = getLocalizedString(WEEK_AHEAD_TITLES, lang);
    const { title, subtitle } = titleFn(data.dateRange.start, data.dateRange.end);
    return {
      title,
      subtitle,
      keywords: data.keywords,
      category: ArticleCategory.WEEK_AHEAD,
      sources: [],
    };
  }
}

/** Singleton instance for use by the strategy registry */
export const weekAheadStrategy = new WeekAheadStrategy();
