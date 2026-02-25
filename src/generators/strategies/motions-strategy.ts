// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/MotionsStrategy
 * @description Article strategy for the Motions article type.
 * Fetches voting records, patterns, anomalies and parliamentary questions
 * over a rolling 30-day window then renders a voting-behaviour overview.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type {
  LanguageCode,
  VotingRecord,
  VotingPattern,
  VotingAnomaly,
  MotionsQuestion,
} from '../../types/index.js';
import { MOTIONS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchMotionsData } from '../pipeline/fetch-stage.js';
import { generateMotionsContent, buildPoliticalAlignmentSection } from '../motions-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';

/** Keywords shared by all Motions articles */
const MOTIONS_KEYWORDS = [
  'European Parliament',
  'motions',
  'voting records',
  'party cohesion',
  'parliamentary questions',
] as const;

/** Number of days to look back when fetching motions data */
const MOTIONS_LOOKBACK_DAYS = 30;

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link MotionsStrategy} */
export interface MotionsArticleData extends ArticleData {
  /** Start of the 30-day look-back window */
  readonly dateFromStr: string;
  /** Voting records for the period */
  readonly votingRecords: readonly VotingRecord[];
  /** Voting patterns for the period */
  readonly votingPatterns: readonly VotingPattern[];
  /** Voting anomalies detected in the period */
  readonly anomalies: readonly VotingAnomaly[];
  /** Parliamentary questions raised in the period */
  readonly questions: readonly MotionsQuestion[];
}

// ─── Strategy implementation ──────────────────────────────────────────────────

/**
 * Article strategy for {@link ArticleCategory.MOTIONS}.
 * Aggregates voting data over a rolling 30-day window and surfaces
 * patterns, anomalies and parliamentary questions.
 */
export class MotionsStrategy implements ArticleStrategy<MotionsArticleData> {
  readonly type = ArticleCategory.MOTIONS;

  readonly requiredMCPTools = [
    'get_voting_records',
    'analyze_voting_patterns',
    'detect_voting_anomalies',
    'get_parliamentary_questions',
  ] as const;

  /**
   * Fetch all motions data for the last 30 days.
   *
   * @param client - MCP client or null
   * @param date - ISO 8601 publication date (end of the look-back window)
   * @returns Populated motions data payload
   */
  async fetchData(
    client: EuropeanParliamentMCPClient | null,
    date: string
  ): Promise<MotionsArticleData> {
    const dateFrom = new Date(`${date}T00:00:00Z`);
    dateFrom.setUTCDate(dateFrom.getUTCDate() - MOTIONS_LOOKBACK_DAYS);
    const dateFromParts = dateFrom.toISOString().split('T');
    if (!dateFromParts[0]) {
      throw new Error('Invalid date format generated for motions look-back window');
    }
    const dateFromStr = dateFromParts[0];

    const { votingRecords, votingPatterns, anomalies, questions } = await fetchMotionsData(
      client,
      dateFromStr,
      date
    );

    return {
      date,
      dateFromStr,
      votingRecords,
      votingPatterns,
      anomalies,
      questions,
    };
  }

  /**
   * Build the motions HTML body for the specified language.
   *
   * @param data - Motions data payload
   * @param lang - Target language code used for editorial strings
   * @returns Article HTML body
   */
  buildContent(data: MotionsArticleData, lang: LanguageCode): string {
    const base = generateMotionsContent(
      data.dateFromStr,
      data.date,
      [...data.votingRecords],
      [...data.votingPatterns],
      [...data.anomalies],
      [...data.questions],
      lang
    );
    const alignmentSection = buildPoliticalAlignmentSection([...data.votingRecords], [], lang);
    if (alignmentSection) {
      // Inject before the explicit <!-- /article-content --> marker so the section
      // stays inside the .article-content styling scope. The marker is always
      // emitted by generateMotionsContent as the last child of that wrapper.
      return base.replace(
        '<!-- /article-content -->',
        `${alignmentSection}\n      <!-- /article-content -->`
      );
    }
    return base;
  }

  /**
   * Return language-specific metadata for the motions article.
   *
   * @param data - Motions data payload
   * @param lang - Target language code
   * @returns Localised metadata
   */
  getMetadata(data: MotionsArticleData, lang: LanguageCode): ArticleMetadata {
    const titleFn = getLocalizedString(MOTIONS_TITLES, lang);
    const { title, subtitle } = titleFn(data.date);
    return {
      title,
      subtitle,
      keywords: [...MOTIONS_KEYWORDS],
      category: ArticleCategory.MOTIONS,
      sources: [],
    };
  }
}

/** Singleton instance for use by the strategy registry */
export const motionsStrategy = new MotionsStrategy();
