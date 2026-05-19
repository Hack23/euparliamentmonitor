// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Intelligence/Build
 * @description Index construction, querying, cross-reference generation,
 * and series management.
 */

import type {
  ArticleCrossReference,
  ArticleIndexEntry,
  ArticleSeries,
  IntelligenceIndex,
} from './types.js';
import { addIdToMap, createNullMap, removeIdFromMap, slugify } from './internals.js';

/** Maximum cross-reference results when no limit is specified */
const DEFAULT_MAX_RELATED = 10;

/**
 * Create a fresh, empty {@link IntelligenceIndex}.
 *
 * @returns An empty index with no articles, actors, domains, trends, or series
 */
export function createEmptyIndex(): IntelligenceIndex {
  return {
    articles: [],
    actors: createNullMap(),
    policyDomains: createNullMap(),
    procedures: createNullMap(),
    trends: [],
    series: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Add an {@link ArticleIndexEntry} to the index and keep all lookup maps in sync.
 *
 * The function is immutable-safe: it returns a new index object rather than
 * mutating the supplied one. Duplicate entries (same `id`) are replaced.
 *
 * @param index - Existing intelligence index
 * @param entry - Article index entry to add
 * @returns Updated index with the new entry reflected in all maps
 */
export function addArticleToIndex(
  index: IntelligenceIndex,
  entry: ArticleIndexEntry
): IntelligenceIndex {
  const existingIdx = index.articles.findIndex((a) => a.id === entry.id);
  const oldEntry = existingIdx >= 0 ? index.articles[existingIdx] : undefined;
  const articles =
    existingIdx >= 0
      ? [...index.articles.slice(0, existingIdx), entry, ...index.articles.slice(existingIdx + 1)]
      : [...index.articles, entry];

  const actors = Object.assign(createNullMap(), index.actors);
  const policyDomains = Object.assign(createNullMap(), index.policyDomains);
  const procedures = Object.assign(createNullMap(), index.procedures);

  if (oldEntry) {
    removeIdFromMap(actors, oldEntry.keyActors, entry.id);
    removeIdFromMap(policyDomains, oldEntry.keyTopics, entry.id);
    removeIdFromMap(procedures, oldEntry.procedures, entry.id);
  }

  addIdToMap(actors, entry.keyActors, entry.id);
  addIdToMap(policyDomains, entry.keyTopics, entry.id);
  addIdToMap(procedures, entry.procedures, entry.id);

  return {
    ...index,
    articles,
    actors,
    policyDomains,
    procedures,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Build a complete index from an array of entries in O(n) time.
 *
 * Unlike calling {@link addArticleToIndex} in a loop (which clones maps on every
 * call, yielding O(n²) behaviour), this function mutates local maps in a single
 * pass and returns a final immutable index.
 *
 * @param entries - All article entries to include
 * @returns A fully populated {@link IntelligenceIndex}
 */
export function buildIndexFromEntries(entries: ArticleIndexEntry[]): IntelligenceIndex {
  const actors = createNullMap();
  const policyDomains = createNullMap();
  const procedures = createNullMap();

  for (const entry of entries) {
    addIdToMap(actors, entry.keyActors, entry.id);
    addIdToMap(policyDomains, entry.keyTopics, entry.id);
    addIdToMap(procedures, entry.procedures, entry.id);
  }

  return {
    articles: [...entries],
    actors,
    policyDomains,
    procedures,
    trends: [],
    series: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Find articles that share topics or actors with the supplied lists.
 *
 * Results are scored by overlap count and returned in descending relevance order.
 *
 * @param index - Intelligence index to search
 * @param topics - Key topics to match against `keyTopics`
 * @param actors - Key actors to match against `keyActors`
 * @param maxResults - Maximum number of results to return (default: 10)
 * @returns Scored, sorted array of matching article entries
 */
export function findRelatedArticles(
  index: IntelligenceIndex,
  topics: string[],
  actors: string[],
  maxResults: number = DEFAULT_MAX_RELATED
): ArticleIndexEntry[] {
  if (topics.length === 0 && actors.length === 0) {
    return [];
  }

  const topicSet = new Set(topics);
  const actorSet = new Set(actors);

  const scored = index.articles.map((article) => {
    let score = 0;
    for (const t of article.keyTopics) {
      if (topicSet.has(t)) score++;
    }
    for (const a of article.keyActors) {
      if (actorSet.has(a)) score++;
    }
    return { article, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ article }) => article);
}

/**
 * Auto-generate {@link ArticleCrossReference} objects for an article based on
 * topic and actor overlap with existing index entries.
 *
 * **Strength** is determined by total overlap (topics + actors):
 * - ≥3 shared items → `strong`
 * - 2 shared items → `moderate`
 * - 1 shared item  → `weak`
 *
 * **Relationship** is determined by date comparison:
 * - Target article is older (`date < entry.date`) → `follows_up`
 * - Target article is newer (`date > entry.date`) → `preceded_by`
 * - Target article has the same date → `related`
 *
 * @param index - Intelligence index containing previously indexed articles
 * @param entry - The article for which cross-references should be generated
 * @returns Array of auto-generated cross-references (excludes self-references)
 */
export function generateCrossReferences(
  index: IntelligenceIndex,
  entry: ArticleIndexEntry
): ArticleCrossReference[] {
  const related = findRelatedArticles(index, entry.keyTopics, entry.keyActors);

  return related
    .filter((a) => a.id !== entry.id)
    .map((a) => {
      const topicOverlap = a.keyTopics.filter((t) => entry.keyTopics.includes(t)).length;
      const actorOverlap = a.keyActors.filter((ac) => entry.keyActors.includes(ac)).length;
      const totalOverlap = topicOverlap + actorOverlap;

      const strength: ArticleCrossReference['strength'] =
        totalOverlap >= 3 ? 'strong' : totalOverlap === 2 ? 'moderate' : 'weak';

      const relationship: ArticleCrossReference['relationship'] =
        a.date < entry.date ? 'follows_up' : a.date > entry.date ? 'preceded_by' : 'related';

      const context =
        topicOverlap > 0 && actorOverlap > 0
          ? `Shares ${topicOverlap} topic(s) and ${actorOverlap} actor(s)`
          : topicOverlap > 0
            ? `Shares ${topicOverlap} topic(s)`
            : `Shares ${actorOverlap} actor(s)`;

      const ref: ArticleCrossReference = {
        targetArticleId: a.id,
        relationship,
        context,
        strength,
      };
      return ref;
    });
}

/**
 * Find an existing {@link ArticleSeries} for the given procedure reference, or
 * create a new one and add it to the index.
 *
 * **Note:** This function mutates `index.series` for convenience. Callers that
 * require immutability should replace the series array after calling this.
 *
 * @param index - Intelligence index to search / mutate
 * @param procedureRef - EP procedure reference (e.g. "2024/0001(COD)")
 * @param name - Display name for the series if it needs to be created
 * @returns The found or newly created series
 */
export function findOrCreateSeries(
  index: IntelligenceIndex,
  procedureRef: string,
  name: string
): ArticleSeries {
  const existing = index.series.find((s) => s.procedureRef === procedureRef);
  if (existing) {
    return existing;
  }

  const newSeries: ArticleSeries = {
    id: `series-${slugify(procedureRef)}`,
    name,
    procedureRef,
    articles: [],
    status: 'ongoing',
    summary: `Tracking legislative procedure ${procedureRef}`,
  };

  index.series.push(newSeries);
  return newSeries;
}
