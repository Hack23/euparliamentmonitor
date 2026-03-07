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
  loadFeedDataFromFile,
} from '../pipeline/fetch-stage.js';
import { buildBreakingNewsContent } from '../breaking-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import {
  buildBreakingAnalysis,
  buildBreakingSwot,
  buildBreakingDashboard,
} from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
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
  /** Feed data — adopted texts, events, procedures, MEP updates (PRIMARY). Undefined when MCP unavailable. */
  readonly feedData: BreakingNewsFeedData | undefined;
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
   * Fetch EP feed data (primary) first, then conditionally fetch analytical
   * context (secondary) in a second phase.
   *
   * @param client - MCP client or null
   * @param date - ISO 8601 publication date
   * @returns Populated breaking news data payload
   */
  async fetchData(
    client: EuropeanParliamentMCPClient | null,
    date: string
  ): Promise<BreakingNewsArticleData> {
    // Step 0: Check for pre-fetched feed data file (set by --feed-data CLI arg).
    // This allows agentic workflows to pass MCP data fetched via framework tools
    // into the generator without requiring a direct MCP connection.
    const feedDataFile = process.env['EP_FEED_DATA_FILE'];
    if (feedDataFile) {
      console.log(`  📂 Loading pre-fetched feed data from: ${feedDataFile}`);
      const fileFeedData = loadFeedDataFromFile(feedDataFile, { start: date, end: date });
      if (fileFeedData) {
        const totalItems =
          fileFeedData.adoptedTexts.length +
          fileFeedData.events.length +
          fileFeedData.procedures.length +
          fileFeedData.mepUpdates.length;
        console.log(`  📰 Pre-fetched feed data: ${totalItems} total items`);

        // Fetch analytical context from MCP if client available, else skip
        let anomalyRaw = '';
        let coalitionRaw = '';
        if (client && totalItems > 0) {
          [anomalyRaw, coalitionRaw] = await Promise.all([
            fetchVotingAnomalies(client),
            fetchCoalitionDynamics(client),
          ]);
        }
        return { date, feedData: fileFeedData, anomalyRaw, coalitionRaw, reportRaw: '' };
      }
      console.log('  ⚠️ Pre-fetched feed data failed to load — falling through to MCP fetch');
    }

    if (client) {
      console.log('  📡 Fetching EP feed data (primary) and analytical context...');
    }

    // Step 1: Fetch feed data (PRIMARY news content) — 'today' for realtime breaking news
    const feedData = await fetchBreakingNewsFeedData(client, 'today');

    // When client is null, feedData is undefined — MCP unavailable
    if (!feedData) {
      console.log('  ⚠️ MCP unavailable — no feed data or analytical context');
      return { date, feedData, anomalyRaw: '', coalitionRaw: '', reportRaw: '' };
    }

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
      console.log('  ⚠️ No feed data available — skipping analytical context fetch');
      return { date, feedData, anomalyRaw: '', coalitionRaw: '', reportRaw: '' };
    }

    // Step 2: Fetch analytical context only when at least one feed item is available
    const [anomalyRaw, coalitionRaw] = await Promise.all([
      fetchVotingAnomalies(client),
      fetchCoalitionDynamics(client),
    ]);

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
    const base = buildBreakingNewsContent(
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
    const analysis = buildBreakingAnalysis(
      data.date,
      data.feedData,
      data.anomalyRaw,
      data.coalitionRaw,
      lang
    );
    const deepSection = buildDeepAnalysisSection(analysis, lang);
    const swotData = buildBreakingSwot(data.feedData, data.anomalyRaw, data.coalitionRaw, lang);
    const swotSection = buildSwotSection(swotData, lang);
    const dashboardData = buildBreakingDashboard(data.feedData, lang);
    const dashboardSection = buildDashboardSection(dashboardData, lang);
    const injection = deepSection + swotSection + dashboardSection;
    // Inject before the closing </div> of .article-content
    if (injection) {
      const closingTag = '</div>';
      const lastIdx = base.lastIndexOf(closingTag);
      if (lastIdx !== -1) {
        return base.slice(0, lastIdx) + injection + '\n' + base.slice(lastIdx);
      }
    }
    return base;
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
