// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/BreakingNewsStrategy
 * @description Article strategy for the Breaking News article type.
 * Fetches OSINT intelligence signals (voting anomalies, coalition dynamics,
 * voting report) and renders a real-time alert article.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type { LanguageCode } from '../../types/index.js';
import { BREAKING_NEWS_TITLES, getLocalizedString } from '../../constants/languages.js';
import {
  fetchVotingAnomalies,
  fetchCoalitionDynamics,
  fetchVotingReport,
} from '../pipeline/fetch-stage.js';
import { buildBreakingNewsContent } from '../breaking-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';

/** Keywords shared by all Breaking News articles */
const BREAKING_NEWS_KEYWORDS = [
  'European Parliament',
  'breaking news',
  'voting anomalies',
  'coalition dynamics',
] as const;

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link BreakingNewsStrategy} */
export interface BreakingNewsArticleData extends ArticleData {
  /** Raw voting anomaly text from MCP */
  readonly anomalyRaw: string;
  /** Raw coalition dynamics text from MCP */
  readonly coalitionRaw: string;
  /** Raw voting statistics report text from MCP */
  readonly reportRaw: string;
}

// ─── Strategy implementation ──────────────────────────────────────────────────

/**
 * Article strategy for {@link ArticleCategory.BREAKING_NEWS}.
 * Aggregates OSINT signals from MCP and surfaces political intelligence.
 */
export class BreakingNewsStrategy implements ArticleStrategy<BreakingNewsArticleData> {
  readonly type = ArticleCategory.BREAKING_NEWS;

  readonly requiredMCPTools = [
    'detect_voting_anomalies',
    'analyze_coalition_dynamics',
    'generate_report',
  ] as const;

  /**
   * Fetch all OSINT signals in parallel.
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
      console.log('  📡 Fetching OSINT intelligence data from MCP...');
    }

    const [anomalyRaw, coalitionRaw, reportRaw] = await Promise.all([
      fetchVotingAnomalies(client),
      fetchCoalitionDynamics(client),
      fetchVotingReport(client),
    ]);

    return { date, anomalyRaw, coalitionRaw, reportRaw };
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
      lang
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
