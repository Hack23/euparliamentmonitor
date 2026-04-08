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
  EPFeedData,
} from '../../types/index.js';
import { MOTIONS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchMotionsData, fetchEPFeedData } from '../pipeline/fetch-stage.js';
import {
  generateMotionsContent,
  buildPoliticalAlignmentSection,
  buildAdoptedTextsSection,
  PLACEHOLDER_MARKER,
} from '../motions-content.js';
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
import { loadAnalysisContext, buildAnalysisInsightsSection } from './article-strategy.js';
import { pl } from '../../utils/metadata-utils.js';
import { isPlaceholderText } from '../../constants/analysis-constants.js';

/** Base keywords shared by all Motions articles */
const MOTIONS_BASE_KEYWORDS = [
  'European Parliament',
  'motions',
  'voting records',
  'party cohesion',
  'parliamentary questions',
] as const;

/**
 * Extract content-aware keywords from motions data.
 *
 * Adds voting record titles, anomaly descriptions, question topics,
 * and adopted text titles to the base keyword set.
 * Placeholder / fallback entries (e.g. "Example motion") are excluded.
 *
 * @param data - Motions article data payload
 * @returns Deduplicated keyword array
 */
function buildMotionsKeywords(data: MotionsArticleData): string[] {
  const keywords: string[] = [...MOTIONS_BASE_KEYWORDS];

  const realRecords = data.votingRecords
    .filter((r) => r.title && !isPlaceholderText(r.title))
    .slice(0, 5);
  for (const r of realRecords) keywords.push(r.title.slice(0, 60));

  const realAnomalies = data.anomalies
    .filter((a) => a.type && !isPlaceholderText(a.type))
    .slice(0, 3);
  for (const a of realAnomalies) keywords.push(a.type);

  const realQuestions = data.questions
    .filter((q) => q.topic && !isPlaceholderText(q.topic))
    .slice(0, 3);
  for (const q of realQuestions) keywords.push(q.topic);

  if (data.feedData?.adoptedTexts) {
    const realTexts = data.feedData.adoptedTexts
      .filter((t) => t.title && !isPlaceholderText(t.title))
      .slice(0, 3);
    for (const text of realTexts) keywords.push(text.title.slice(0, 60));
  }

  return [...new Set(keywords)];
}

/**
 * Build a content-aware description from motions data.
 * Prioritises the most significant adopted text or voting record title
 * to produce a description that reflects political substance rather
 * than mechanical data counts.
 *
 * @param data - Motions article data payload
 * @returns SEO-friendly description (≤ 200 chars)
 */
function buildMotionsDescription(data: MotionsArticleData): string {
  // Priority 1: Use the title of the most significant adopted text
  const topAdopted = data.feedData?.adoptedTexts?.find(
    (t) => t.title && !isPlaceholderText(t.title)
  );
  if (topAdopted) {
    const desc = `European Parliament adopts ${topAdopted.title}`;
    return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
  }

  // Priority 2: Use the title of the key voting record
  const topVote = data.votingRecords.find((v) => v.title);
  if (topVote) {
    const desc = `EP plenary vote: ${topVote.title}`;
    return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
  }

  return `European Parliament plenary votes and resolutions from ${data.dateFromStr} to ${data.date}.`;
}

/**
 * Build a content-aware title suffix from the most significant
 * motions item.  Produces an analytical phrase describing the
 * primary political content, not data counts.
 *
 * @param data - Motions article data payload
 * @returns Short analytical suffix for the title, or empty string
 */
function buildMotionsTitleSuffix(data: MotionsArticleData): string {
  // Priority 1: Name the most significant adopted text
  const topAdopted = data.feedData?.adoptedTexts?.find(
    (t) => t.title && !isPlaceholderText(t.title) && t.title.length > 10
  );
  if (topAdopted) {
    const title = topAdopted.title.length > 60
      ? topAdopted.title.slice(0, 57) + '...'
      : topAdopted.title;
    return title;
  }

  // Priority 2: Name the key voting record
  const topVote = data.votingRecords.find((v) => v.title && v.title.length > 10);
  if (topVote) {
    const title = topVote.title.length > 60
      ? topVote.title.slice(0, 57) + '...'
      : topVote.title;
    return title;
  }

  // Priority 3 (last resort): If we only have anomalies, mention those
  if (data.anomalies.length > 0) {
    return `${pl(data.anomalies.length, 'Voting Anomaly', 'Voting Anomalies')} Detected`;
  }

  return '';
}

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
  /** EP feed data for enrichment (when available) */
  readonly feedData?: EPFeedData | undefined;
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
    'get_adopted_texts_feed',
    'get_parliamentary_questions_feed',
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

    // Fetch voting data and EP feed data in parallel
    const feedDateRange = { start: dateFromStr, end: date };
    const [motionsDataResult, feedData] = await Promise.all([
      fetchMotionsData(client, dateFromStr, date),
      fetchEPFeedData(client, 'one-month', feedDateRange),
    ]);

    const { votingRecords, votingPatterns, anomalies, questions } = motionsDataResult;

    return {
      date,
      dateFromStr,
      votingRecords,
      votingPatterns,
      anomalies,
      questions,
      feedData,
      analysisContext: loadAnalysisContext(date, 'motions'),
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
    const adoptedTextsSection = data.feedData?.adoptedTexts
      ? buildAdoptedTextsSection(data.feedData.adoptedTexts, lang)
      : '';
    const alignmentSection = buildPoliticalAlignmentSection([...data.votingRecords], [], lang);
    const analysis = buildVotingAnalysis(
      data.dateFromStr,
      data.date,
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
    const hasRealVotingData = data.votingRecords.some((r) => r.result !== PLACEHOLDER_MARKER);
    const dashboardData = hasRealVotingData
      ? buildVotingDashboard(data.votingRecords, data.votingPatterns, data.anomalies, lang)
      : null;
    const dashboardSection = buildDashboardSection(dashboardData, lang);
    const analysisInsights = buildAnalysisInsightsSection(
      data.analysisContext,
      [
        'deep-analysis',
        'synthesis-summary',
        'stakeholder-analysis',
        'coalition-analysis',
        'cross-session-intelligence',
        'voting-patterns',
        'political-threat-landscape',
        'risk-matrix',
        'actor-mapping',
      ],
      lang
    );
    // Inject at the explicit <!-- /article-content --> marker so the section
    // stays inside the .article-content styling scope. The marker is always
    // emitted by generateMotionsContent as the last child of that wrapper and
    // is removed from the final HTML during this replacement.
    const injection =
      adoptedTextsSection +
      (alignmentSection || '') +
      deepSection +
      mindmapSection +
      swotSection +
      dashboardSection +
      analysisInsights;
    if (injection) {
      return base.replace('<!-- /article-content -->', `${injection}\n`);
    }
    return base.replace('<!-- /article-content -->', '');
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
    const { title: baseTitle, subtitle: baseSubtitle } = titleFn(data.date);
    const suffix = lang === 'en' ? buildMotionsTitleSuffix(data) : '';
    const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
    const description = lang === 'en' ? buildMotionsDescription(data) : '';
    const subtitle = description || baseSubtitle;
    return {
      title,
      subtitle,
      keywords: buildMotionsKeywords(data),
      category: ArticleCategory.MOTIONS,
      sources: [],
    };
  }
}

/** Singleton instance for use by the strategy registry */
export const motionsStrategy = new MotionsStrategy();
