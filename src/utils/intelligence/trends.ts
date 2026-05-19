// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Intelligence/Trends
 * @description Trend detection across the intelligence index.
 */

import type { IntelligenceIndex, TrendDetection } from './types.js';
import { slugify } from './internals.js';

/** Minimum number of articles required to recognise a trend */
const MIN_TREND_ARTICLES = 2;

/**
 * Resolve confidence level from the number of article references.
 *
 * @param count - Number of articles referencing the topic
 * @returns Confidence level
 */
function resolveConfidence(count: number): TrendDetection['confidence'] {
  if (count >= 5) return 'high';
  if (count >= 3) return 'medium';
  return 'low';
}

/**
 * Resolve date range from a list of articles matching a set of IDs.
 *
 * @param index - The intelligence index
 * @param articleIds - IDs of articles to consider
 * @returns firstSeen and lastUpdated date strings
 */
function resolveDateRange(
  index: IntelligenceIndex,
  articleIds: string[]
): { firstSeen: string; lastUpdated: string } {
  const fallback = new Date().toISOString().slice(0, 10);
  const dates = index.articles
    .filter((a) => articleIds.includes(a.id))
    .map((a) => a.date)
    .sort();
  return {
    firstSeen: dates[0] ?? fallback,
    lastUpdated: dates[dates.length - 1] ?? fallback,
  };
}

/**
 * Build a topic-based trend entry.
 *
 * @param index - Intelligence index
 * @param topic - Topic key
 * @param articleIds - Article IDs covering this topic
 * @returns TrendDetection entry
 */
function buildTopicTrend(
  index: IntelligenceIndex,
  topic: string,
  articleIds: string[]
): TrendDetection {
  const { firstSeen, lastUpdated } = resolveDateRange(index, articleIds);
  const confidence = resolveConfidence(articleIds.length);
  const direction: TrendDetection['direction'] =
    articleIds.length >= 4 ? 'strengthening' : 'emerging';
  return {
    id: `trend-topic-${slugify(topic)}`,
    name: `${topic} trend`,
    category: 'political',
    direction,
    firstSeen,
    lastUpdated,
    articleReferences: [...articleIds],
    evidence: [`Topic "${topic}" covered in ${articleIds.length} articles`],
    confidence,
  };
}

/**
 * Build a procedure-based trend entry.
 *
 * @param index - Intelligence index
 * @param proc - Procedure reference
 * @param articleIds - Article IDs covering this procedure
 * @returns TrendDetection entry
 */
function buildProcedureTrend(
  index: IntelligenceIndex,
  proc: string,
  articleIds: string[]
): TrendDetection {
  const { firstSeen, lastUpdated } = resolveDateRange(index, articleIds);
  const confidence = resolveConfidence(articleIds.length);
  return {
    id: `trend-proc-${slugify(proc)}`,
    name: `Procedure ${proc} tracking`,
    category: 'legislative',
    direction: 'stable',
    firstSeen,
    lastUpdated,
    articleReferences: [...articleIds],
    evidence: [`Procedure "${proc}" tracked across ${articleIds.length} articles`],
    confidence,
  };
}

/**
 * Detect parliamentary trends from patterns across all indexed articles.
 *
 * A trend is formed when a topic or procedure appears in at least
 * `MIN_TREND_ARTICLES` articles. The returned array replaces any
 * previously detected trends stored in the index.
 *
 * @param index - Intelligence index to analyse
 * @returns Array of detected {@link TrendDetection} objects
 */
export function detectTrends(index: IntelligenceIndex): TrendDetection[] {
  const trends: TrendDetection[] = [];

  for (const [topic, articleIds] of Object.entries(index.policyDomains)) {
    if (articleIds.length >= MIN_TREND_ARTICLES) {
      trends.push(buildTopicTrend(index, topic, articleIds));
    }
  }

  for (const [proc, articleIds] of Object.entries(index.procedures)) {
    if (articleIds.length >= MIN_TREND_ARTICLES) {
      trends.push(buildProcedureTrend(index, proc, articleIds));
    }
  }

  return trends;
}
