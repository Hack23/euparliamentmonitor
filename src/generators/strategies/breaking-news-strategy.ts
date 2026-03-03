// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/BreakingNewsStrategy
 * @description Article strategy for the Breaking News article type.
 * Uses a **feed-first** approach: EP feed endpoints (adopted texts, events,
 * procedures, MEPs) provide the primary news content, while analytical tools
 * (voting anomalies, coalition dynamics) supply optional context only.
 *
 * Precomputed statistics from `get_all_generated_stats` are **never** the
 * primary news content and are used solely for historical comparison.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type { LanguageCode, BreakingNewsFeedData } from '../../types/index.js';
import { BREAKING_NEWS_TITLES, getLocalizedString } from '../../constants/languages.js';
import {
  fetchBreakingNewsFeedData,
  fetchVotingAnomalies,
  fetchCoalitionDynamics,
} from '../pipeline/fetch-stage.js';
import { buildBreakingNewsContent } from '../breaking-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';

/** Keywords shared by all Breaking News articles */
const BREAKING_NEWS_KEYWORDS = [
  'European Parliament',
  'breaking news',
  'adopted texts',
  'legislative updates',
  'parliamentary events',
] as const;

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link BreakingNewsStrategy} */
export interface BreakingNewsArticleData extends ArticleData {
  /** Feed data — adopted texts, events, procedures, MEP updates (PRIMARY) */
  readonly feedData: BreakingNewsFeedData;
  /** Raw voting anomaly text from MCP (CONTEXT ONLY) */
  readonly anomalyRaw: string;
  /** Raw coalition dynamics text from MCP (CONTEXT ONLY) */
  readonly coalitionRaw: string;
  /** Raw voting statistics report text from MCP (KEPT FOR BACKWARD COMPAT) */
  readonly reportRaw: string;
}

// ─── Strategy implementation ──────────────────────────────────────────────────

/**
 * Article strategy for {@link ArticleCategory.BREAKING_NEWS}.
 *
 * **Feed-first**: EP feed endpoints are the primary data source.
 * Analytical tools provide supplementary context only.
 * Stats are NEVER the news itself.
 */
export class BreakingNewsStrategy implements ArticleStrategy<BreakingNewsArticleData> {
  readonly type = ArticleCategory.BREAKING_NEWS;

  readonly requiredMCPTools = [
    'get_adopted_texts_feed',
    'get_events_feed',
    'get_procedures_feed',
    'get_meps_feed',
    'detect_voting_anomalies',
    'analyze_coalition_dynamics',
  ] as const;

  /**
   * Fetch EP feed data (primary) and analytical context (secondary) in parallel.
   *
   * @param client - MCP client or null
   * @param date - ISO 8601 publication date
   * @returns Populated breaking news data payload
   */
  async fetchData(
    client: EuropeanParliamentMCPClient | null,
    date: string
  ): Promise<BreakingNewsArticleData> {
    if (client) {
      console.log('  📡 Fetching EP feed data (primary) and analytical context...');
    }

    const [feedData, anomalyRaw, coalitionRaw] = await Promise.all([
      fetchBreakingNewsFeedData(client),
      fetchVotingAnomalies(client),
      fetchCoalitionDynamics(client),
    ]);

    const totalFeedItems =
      feedData.adoptedTexts.length +
      feedData.events.length +
      feedData.procedures.length +
      feedData.mepUpdates.length;

    if (totalFeedItems > 0) {
      console.log(
        `  📰 Feed data: ${feedData.adoptedTexts.length} adopted texts, ` +
          `${feedData.events.length} events, ${feedData.procedures.length} procedures, ` +
          `${feedData.mepUpdates.length} MEP updates`
      );
    } else {
      console.log('  ⚠️ No feed data available — article will contain context-only content');
    }

    return { date, feedData, anomalyRaw, coalitionRaw, reportRaw: '' };
  }

  /**
   * Build the breaking news HTML body for the specified language.
   *
   * @param data - Breaking news data payload
   * @param lang - Target language code used for editorial strings
   * @returns Article HTML body
   */
  buildContent(data: BreakingNewsArticleData, lang: LanguageCode): string {
    return buildBreakingNewsContent(
      data.date,
      data.anomalyRaw,
      data.coalitionRaw,
      data.reportRaw,
      '',
      lang,
      [],
      [],
      [],
      data.feedData
    );
  }

  /**
   * Return language-specific metadata for the breaking news article.
   *
   * @param data - Breaking news data payload
   * @param lang - Target language code
   * @returns Localised metadata
   */
  getMetadata(data: BreakingNewsArticleData, lang: LanguageCode): ArticleMetadata {
    const titleFn = getLocalizedString(BREAKING_NEWS_TITLES, lang);
    const { title, subtitle } = titleFn(data.date);
    return {
      title,
      subtitle,
      keywords: [...BREAKING_NEWS_KEYWORDS],
      category: ArticleCategory.BREAKING_NEWS,
      sources: [],
    };
  }
}

/** Singleton instance for use by the strategy registry */
export const breakingNewsStrategy = new BreakingNewsStrategy();
