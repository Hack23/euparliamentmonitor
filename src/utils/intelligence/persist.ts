// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/Intelligence/Persist
 * @description Disk persistence (load/save) for the intelligence index,
 * including schema normalisation, lookup-map rebuild, and prototype-pollution
 * filtering on potentially tampered JSON.
 */

import fs from 'fs';
import path from 'path';
import { ArticleCategory } from '../../types/index.js';
import type { ArticleIndexEntry, IntelligenceIndex } from './types.js';
import { addIdToMap, createNullMap, isSafeKey } from './internals.js';
import { createEmptyIndex } from './build.js';
import { detectTrends } from './trends.js';

/**
 * Ensure an {@link ArticleIndexEntry} loaded from disk has all required fields.
 *
 * Persisted JSON may be missing arrays or strings after schema evolution; this
 * function fills safe defaults so downstream code never crashes on `undefined`.
 *
 * @param entry - Potentially partial article entry from parsed JSON
 * @returns A fully populated {@link ArticleIndexEntry}
 */
function normalizeArticleEntry(entry: Partial<ArticleIndexEntry>): ArticleIndexEntry {
  const VALID_CATEGORIES = new Set<string>(Object.values(ArticleCategory));
  return {
    id: typeof entry.id === 'string' ? entry.id : '',
    date: typeof entry.date === 'string' ? entry.date : '',
    type:
      typeof entry.type === 'string' && VALID_CATEGORIES.has(entry.type)
        ? entry.type
        : (ArticleCategory.WEEK_AHEAD as ArticleIndexEntry['type']),
    lang: typeof entry.lang === 'string' ? entry.lang : 'en',
    keyTopics: Array.isArray(entry.keyTopics) ? entry.keyTopics : [],
    keyActors: Array.isArray(entry.keyActors) ? entry.keyActors : [],
    procedures: Array.isArray(entry.procedures) ? entry.procedures : [],
    crossReferences: Array.isArray(entry.crossReferences) ? entry.crossReferences : [],
    trendContributions: Array.isArray(entry.trendContributions) ? entry.trendContributions : [],
    ...(typeof entry.seriesId === 'string' && { seriesId: entry.seriesId }),
  };
}

/**
 * Rebuild the actor/policyDomain/procedure reverse-lookup maps from scratch
 * by scanning all articles.
 *
 * Used during index loading when persisted maps are missing or invalid (e.g.
 * after a schema evolution), so that trend detection and lookups stay correct.
 *
 * @param articles - Normalised article entries to rebuild maps from
 * @returns Rebuilt lookup maps
 */
function rebuildLookupMaps(articles: readonly ArticleIndexEntry[]): {
  actors: Record<string, string[]>;
  policyDomains: Record<string, string[]>;
  procedures: Record<string, string[]>;
} {
  const actors = createNullMap();
  const policyDomains = createNullMap();
  const procedures = createNullMap();
  for (const article of articles) {
    addIdToMap(actors, article.keyActors, article.id);
    addIdToMap(policyDomains, article.keyTopics, article.id);
    addIdToMap(procedures, article.procedures, article.id);
  }
  return { actors, policyDomains, procedures };
}

/**
 * Check whether a value is a valid lookup map (`Record<string, string[]>`).
 *
 * Validates that the value is a non-array object **and** that every entry
 * is an array of strings.  Malformed/corrupt JSON (e.g. `{ EPP: "a1" }`)
 * will return `false`, triggering a map rebuild from articles on load.
 *
 * @param value - Value to validate
 * @returns `true` if the value is a well-formed lookup map
 */
function isValidMap(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.values(record).every(
    (v) => Array.isArray(v) && v.every((item) => typeof item === 'string')
  );
}

/**
 * Copy a structurally valid parsed map into a fresh null-prototype object,
 * filtering out dangerous keys to maintain prototype-pollution protection
 * even when loading from potentially tampered JSON.
 *
 * @param source - Validated lookup map from parsed JSON
 * @returns A sanitised null-prototype copy with dangerous keys removed
 */
function sanitizeMap(source: Record<string, string[]>): Record<string, string[]> {
  const safe = createNullMap();
  for (const key of Object.keys(source)) {
    if (!isSafeKey(key)) continue;

    const val = source[key];
    if (val) {
      safe[key] = val;
    }
  }
  return safe;
}

/**
 * Return lookup maps from the parsed JSON when all three are valid, or rebuild
 * them from the article entries when any map is missing/invalid.
 *
 * Valid parsed maps are always copied into fresh null-prototype objects with
 * unsafe keys filtered out, so that tampered index JSON cannot reintroduce
 * prototype-pollution vectors (e.g. `__proto__` keys).
 *
 * @param parsed - Partially parsed index from disk
 * @param articles - Normalised article entries
 * @param empty - Fallback empty index for defaults
 * @returns Resolved or rebuilt lookup maps
 */
function resolveOrRebuildMaps(
  parsed: Partial<IntelligenceIndex>,
  articles: ArticleIndexEntry[],
  empty: IntelligenceIndex
): {
  actors: Record<string, string[]>;
  policyDomains: Record<string, string[]>;
  procedures: Record<string, string[]>;
  rebuilt: boolean;
} {
  const validActors = isValidMap(parsed.actors);
  const validDomains = isValidMap(parsed.policyDomains);
  const validProcedures = isValidMap(parsed.procedures);

  if (articles.length > 0 && (!validActors || !validDomains || !validProcedures)) {
    return { ...rebuildLookupMaps(articles), rebuilt: true };
  }
  return {
    actors: validActors ? sanitizeMap(parsed.actors as Record<string, string[]>) : empty.actors,
    policyDomains: validDomains
      ? sanitizeMap(parsed.policyDomains as Record<string, string[]>)
      : empty.policyDomains,
    procedures: validProcedures
      ? sanitizeMap(parsed.procedures as Record<string, string[]>)
      : empty.procedures,
    rebuilt: false,
  };
}

/**
 * Merge partially-parsed JSON onto a fresh empty index, normalising articles and
 * rebuilding lookup maps when they are missing or invalid. When maps are rebuilt
 * (or when persisted trends are missing), trends are also recomputed from articles
 * so trend detection stays correct across schema upgrades.
 *
 * @param parsed - Potentially partial index from disk
 * @returns Fully populated {@link IntelligenceIndex}
 */
function mergeOntoEmpty(parsed: Partial<IntelligenceIndex>): IntelligenceIndex {
  const empty = createEmptyIndex();
  const articles = Array.isArray(parsed.articles)
    ? parsed.articles.map(normalizeArticleEntry)
    : empty.articles;

  const { actors, policyDomains, procedures, rebuilt } = resolveOrRebuildMaps(
    parsed,
    articles,
    empty
  );

  const base: IntelligenceIndex = {
    articles,
    actors,
    policyDomains,
    procedures,
    trends: empty.trends,
    series: Array.isArray(parsed.series) ? parsed.series : empty.series,
    lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : empty.lastUpdated,
  };

  const trends = rebuilt || !Array.isArray(parsed.trends) ? detectTrends(base) : parsed.trends;

  return { ...base, trends };
}

/**
 * Load an {@link IntelligenceIndex} from a JSON file.
 *
 * Returns an empty index (via {@link createEmptyIndex}) if the file does not exist
 * or cannot be parsed.
 *
 * Each loaded {@link ArticleIndexEntry} is normalised so that missing arrays
 * and strings are filled with safe defaults, preventing crashes in downstream
 * code that iterates over `keyTopics`, `keyActors`, etc.
 *
 * When any lookup map (actors, policyDomains, procedures) is missing or invalid
 * but articles are present, all maps are rebuilt from the article entries so that
 * trend detection and lookups remain correct across schema upgrades.
 *
 * @param indexPath - Absolute or relative path to the index JSON file
 * @returns Loaded index, or a fresh empty index on failure
 */
export function loadIntelligenceIndex(indexPath: string): IntelligenceIndex {
  if (!fs.existsSync(indexPath)) {
    return createEmptyIndex();
  }

  try {
    const content = fs.readFileSync(indexPath, 'utf-8');
    const parsed = JSON.parse(content) as Partial<IntelligenceIndex>;
    return mergeOntoEmpty(parsed);
  } catch {
    return createEmptyIndex();
  }
}

/**
 * Persist an {@link IntelligenceIndex} to a JSON file.
 *
 * Creates any missing parent directories automatically.
 *
 * @param index - Intelligence index to save
 * @param indexPath - Absolute or relative path to the output JSON file
 */
export function saveIntelligenceIndex(index: IntelligenceIndex, indexPath: string): void {
  const dir = path.dirname(indexPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}
