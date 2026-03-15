// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/IntelligenceIndex
 * @description Cross-article intelligence indexing system for parliamentary trend tracking.
 *
 * Provides functions to build, query, and persist an {@link IntelligenceIndex} that
 * tracks relationships between generated articles, detects recurring trends, and groups
 * related articles into series. The index is JSON-serialisable for disk persistence.
 */
import fs from 'fs';
import path from 'path';
import { ArticleCategory } from '../types/index.js';
import { RELATED_ANALYSIS_LABELS, getLocalizedString } from '../constants/languages.js';
// ─── Minimum article count to confirm a trend ────────────────────────────────
/** Minimum number of articles required to recognise a trend */
const MIN_TREND_ARTICLES = 2;
/** Maximum cross-reference results when no limit is specified */
const DEFAULT_MAX_RELATED = 10;
/**
 * Keys that must never be used as lookup-map indices to prevent
 * prototype-pollution attacks from untrusted article metadata.
 *
 * - `__proto__` — directly sets the prototype chain of plain objects
 * - `constructor` — can be used to reach `Object` and mutate shared prototypes
 * - `prototype` — when combined with `constructor`, enables prototype injection
 */
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
/**
 * Return `true` when `key` is safe to use as a plain-object property.
 * Rejects `__proto__`, `constructor`, and `prototype` to avoid prototype
 * pollution when indexing untrusted topic/actor/procedure strings.
 *
 * @param key - The key to validate
 * @returns `true` if the key is safe to use as an object property
 */
function isSafeKey(key) {
    return !DANGEROUS_KEYS.has(key);
}
/**
 * Create a null-prototype object suitable for use as a lookup map.
 * Unlike `{}`, these objects have no inherited keys, providing an extra
 * layer of defence against prototype-pollution.
 *
 * @returns A fresh null-prototype Record for use as a lookup map
 */
function createNullMap() {
    return Object.create(null);
}
// ─── createEmptyIndex ────────────────────────────────────────────────────────
/**
 * Create a fresh, empty {@link IntelligenceIndex}.
 *
 * @returns An empty index with no articles, actors, domains, trends, or series
 */
export function createEmptyIndex() {
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
// ─── addArticleToIndex ───────────────────────────────────────────────────────
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
export function addArticleToIndex(index, entry) {
    // Replace or append
    const existingIdx = index.articles.findIndex((a) => a.id === entry.id);
    const oldEntry = existingIdx >= 0 ? index.articles[existingIdx] : undefined; // eslint-disable-line security/detect-object-injection -- existingIdx from findIndex
    const articles = existingIdx >= 0
        ? [...index.articles.slice(0, existingIdx), entry, ...index.articles.slice(existingIdx + 1)]
        : [...index.articles, entry];
    // Clone lookup maps (null-prototype to prevent pollution)
    const actors = Object.assign(createNullMap(), index.actors);
    const policyDomains = Object.assign(createNullMap(), index.policyDomains);
    const procedures = Object.assign(createNullMap(), index.procedures);
    // Remove stale associations from the old entry (if replacing)
    if (oldEntry) {
        removeIdFromMap(actors, oldEntry.keyActors, entry.id);
        removeIdFromMap(policyDomains, oldEntry.keyTopics, entry.id);
        removeIdFromMap(procedures, oldEntry.procedures, entry.id);
    }
    // Add new associations
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
// ─── buildIndexFromEntries ────────────────────────────────────────────────────
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
export function buildIndexFromEntries(entries) {
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
// ─── findRelatedArticles ─────────────────────────────────────────────────────
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
export function findRelatedArticles(index, topics, actors, maxResults = DEFAULT_MAX_RELATED) {
    if (topics.length === 0 && actors.length === 0) {
        return [];
    }
    const topicSet = new Set(topics);
    const actorSet = new Set(actors);
    const scored = index.articles.map((article) => {
        let score = 0;
        for (const t of article.keyTopics) {
            if (topicSet.has(t))
                score++;
        }
        for (const a of article.keyActors) {
            if (actorSet.has(a))
                score++;
        }
        return { article, score };
    });
    return scored
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)
        .map(({ article }) => article);
}
// ─── generateCrossReferences ─────────────────────────────────────────────────
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
export function generateCrossReferences(index, entry) {
    const related = findRelatedArticles(index, entry.keyTopics, entry.keyActors);
    return related
        .filter((a) => a.id !== entry.id)
        .map((a) => {
        const topicOverlap = a.keyTopics.filter((t) => entry.keyTopics.includes(t)).length;
        const actorOverlap = a.keyActors.filter((ac) => entry.keyActors.includes(ac)).length;
        const totalOverlap = topicOverlap + actorOverlap;
        const strength = totalOverlap >= 3 ? 'strong' : totalOverlap === 2 ? 'moderate' : 'weak';
        const relationship = a.date < entry.date ? 'follows_up' : a.date > entry.date ? 'preceded_by' : 'related';
        const context = topicOverlap > 0 && actorOverlap > 0
            ? `Shares ${topicOverlap} topic(s) and ${actorOverlap} actor(s)`
            : topicOverlap > 0
                ? `Shares ${topicOverlap} topic(s)`
                : `Shares ${actorOverlap} actor(s)`;
        const ref = {
            targetArticleId: a.id,
            relationship,
            context,
            strength,
        };
        return ref;
    });
}
// ─── detectTrends ────────────────────────────────────────────────────────────
/**
 * Resolve confidence level from the number of article references.
 * @param count - Number of articles referencing the topic
 * @returns Confidence level
 */
function resolveConfidence(count) {
    if (count >= 5)
        return 'high';
    if (count >= 3)
        return 'medium';
    return 'low';
}
/**
 * Resolve date range from a list of articles matching a set of IDs.
 * @param index - The intelligence index
 * @param articleIds - IDs of articles to consider
 * @returns firstSeen and lastUpdated date strings
 */
function resolveDateRange(index, articleIds) {
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
 * @param index - Intelligence index
 * @param topic - Topic key
 * @param articleIds - Article IDs covering this topic
 * @returns TrendDetection entry
 */
function buildTopicTrend(index, topic, articleIds) {
    const { firstSeen, lastUpdated } = resolveDateRange(index, articleIds);
    const confidence = resolveConfidence(articleIds.length);
    const direction = articleIds.length >= 4 ? 'strengthening' : 'emerging';
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
 * @param index - Intelligence index
 * @param proc - Procedure reference
 * @param articleIds - Article IDs covering this procedure
 * @returns TrendDetection entry
 */
function buildProcedureTrend(index, proc, articleIds) {
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
 * {@link MIN_TREND_ARTICLES} articles. The returned array replaces any
 * previously detected trends stored in the index.
 *
 * @param index - Intelligence index to analyse
 * @returns Array of detected {@link TrendDetection} objects
 */
export function detectTrends(index) {
    const trends = [];
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
// ─── findOrCreateSeries ──────────────────────────────────────────────────────
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
export function findOrCreateSeries(index, procedureRef, name) {
    const existing = index.series.find((s) => s.procedureRef === procedureRef);
    if (existing) {
        return existing;
    }
    const newSeries = {
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
// ─── normalizeArticleEntry ────────────────────────────────────────────────────
/**
 * Ensure an {@link ArticleIndexEntry} loaded from disk has all required fields.
 *
 * Persisted JSON may be missing arrays or strings after schema evolution; this
 * function fills safe defaults so downstream code never crashes on `undefined`.
 *
 * @param entry - Potentially partial article entry from parsed JSON
 * @returns A fully populated {@link ArticleIndexEntry}
 */
function normalizeArticleEntry(entry) {
    const VALID_CATEGORIES = new Set(Object.values(ArticleCategory));
    return {
        id: typeof entry.id === 'string' ? entry.id : '',
        date: typeof entry.date === 'string' ? entry.date : '',
        type: typeof entry.type === 'string' && VALID_CATEGORIES.has(entry.type)
            ? entry.type
            : ArticleCategory.WEEK_AHEAD,
        lang: typeof entry.lang === 'string' ? entry.lang : 'en',
        keyTopics: Array.isArray(entry.keyTopics) ? entry.keyTopics : [],
        keyActors: Array.isArray(entry.keyActors) ? entry.keyActors : [],
        procedures: Array.isArray(entry.procedures) ? entry.procedures : [],
        crossReferences: Array.isArray(entry.crossReferences) ? entry.crossReferences : [],
        trendContributions: Array.isArray(entry.trendContributions) ? entry.trendContributions : [],
        ...(typeof entry.seriesId === 'string' && { seriesId: entry.seriesId }),
    };
}
// ─── rebuildLookupMaps ──────────────────────────────────────────────────────
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
function rebuildLookupMaps(articles) {
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
// ─── loadIntelligenceIndex ───────────────────────────────────────────────────
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
export function loadIntelligenceIndex(indexPath) {
    if (!fs.existsSync(indexPath)) {
        return createEmptyIndex();
    }
    try {
        const content = fs.readFileSync(indexPath, 'utf-8');
        const parsed = JSON.parse(content);
        return mergeOntoEmpty(parsed);
    }
    catch {
        return createEmptyIndex();
    }
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
function mergeOntoEmpty(parsed) {
    const empty = createEmptyIndex();
    const articles = Array.isArray(parsed.articles)
        ? parsed.articles.map(normalizeArticleEntry)
        : empty.articles;
    const { actors, policyDomains, procedures, rebuilt } = resolveOrRebuildMaps(parsed, articles, empty);
    // Build a temporary index so detectTrends can recompute from articles
    const base = {
        articles,
        actors,
        policyDomains,
        procedures,
        trends: empty.trends,
        series: Array.isArray(parsed.series) ? parsed.series : empty.series,
        lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : empty.lastUpdated,
    };
    // Recompute trends when maps were rebuilt or when persisted trends are missing/invalid
    const trends = rebuilt || !Array.isArray(parsed.trends) ? detectTrends(base) : parsed.trends;
    return { ...base, trends };
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
function isValidMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const record = value;
    return Object.values(record).every((v) => Array.isArray(v) && v.every((item) => typeof item === 'string'));
}
/**
 * Copy a structurally valid parsed map into a fresh null-prototype object,
 * filtering out dangerous keys to maintain prototype-pollution protection
 * even when loading from potentially tampered JSON.
 *
 * @param source - Validated lookup map from parsed JSON
 * @returns A sanitised null-prototype copy with dangerous keys removed
 */
function sanitizeMap(source) {
    const safe = createNullMap();
    for (const key of Object.keys(source)) {
        if (!isSafeKey(key))
            continue;
        // eslint-disable-next-line security/detect-object-injection -- key validated via isSafeKey
        const val = source[key];
        if (val) {
            // eslint-disable-next-line security/detect-object-injection -- key validated via isSafeKey
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
function resolveOrRebuildMaps(parsed, articles, empty) {
    const validActors = isValidMap(parsed.actors);
    const validDomains = isValidMap(parsed.policyDomains);
    const validProcedures = isValidMap(parsed.procedures);
    if (articles.length > 0 && (!validActors || !validDomains || !validProcedures)) {
        return { ...rebuildLookupMaps(articles), rebuilt: true };
    }
    return {
        actors: validActors ? sanitizeMap(parsed.actors) : empty.actors,
        policyDomains: validDomains
            ? sanitizeMap(parsed.policyDomains)
            : empty.policyDomains,
        procedures: validProcedures
            ? sanitizeMap(parsed.procedures)
            : empty.procedures,
        rebuilt: false,
    };
}
// ─── saveIntelligenceIndex ───────────────────────────────────────────────────
/**
 * Persist an {@link IntelligenceIndex} to a JSON file.
 *
 * Creates any missing parent directories automatically.
 *
 * @param index - Intelligence index to save
 * @param indexPath - Absolute or relative path to the output JSON file
 */
export function saveIntelligenceIndex(index, indexPath) {
    const dir = path.dirname(indexPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
}
// ─── buildRelatedArticlesHTML ────────────────────────────────────────────────
/**
 * Generate an HTML `<section>` listing related articles, cross-references, and
 * emerging trends for embedding in a generated article.
 *
 * Produces accessible markup with `aria-label` and `rel="noopener noreferrer"`.
 * UI strings and date formatting are localised based on the `lang` parameter.
 *
 * @param relatedArticles - Articles related to the current article
 * @param crossRefs - Cross-references from the current article
 * @param trends - Trends relevant to the current article
 * @param lang - Language code for localisation (defaults to 'en')
 * @returns HTML string for the "Related Analysis" section, or empty string if nothing to show
 */
export function buildRelatedArticlesHTML(relatedArticles, crossRefs, trends, lang) {
    if (relatedArticles.length === 0 && crossRefs.length === 0 && trends.length === 0) {
        return '';
    }
    const strings = getLocalizedString(RELATED_ANALYSIS_LABELS, lang ?? 'en');
    const listItems = crossRefs
        .map((ref) => {
        const article = relatedArticles.find((a) => a.id === ref.targetArticleId);
        const label = strings.relationships[ref.relationship] ??
            strings.relatedArticle;
        if (article) {
            const displayDate = formatDisplayDate(article.date, lang);
            const filename = `${article.id}.html`;
            return `    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">${escapeText(label)}: ${escapeText(ref.context)} (${escapeText(displayDate)})</a></li>`;
        }
        // Fallback: render using targetArticleId when full article metadata is unavailable
        const filename = `${ref.targetArticleId}.html`;
        return `    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">${escapeText(label)}: ${escapeText(ref.context)}</a></li>`;
    })
        .filter(Boolean);
    // Fall back: show related articles without explicit cross-refs
    if (listItems.length === 0 && relatedArticles.length > 0) {
        for (const article of relatedArticles) {
            const displayDate = formatDisplayDate(article.date, lang);
            const filename = `${article.id}.html`;
            listItems.push(`    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">${escapeText(strings.relatedArticle)}: ${escapeText(article.type)} (${escapeText(displayDate)})</a></li>`);
        }
    }
    const trendBlocks = trends
        .map((trend) => {
        const count = trend.articleReferences.length;
        return `  <div class="emerging-trends">
    <h4>${escapeText(strings.emergingTrend)}: ${escapeText(trend.name)}</h4>
    <p>${count} ${escapeText(strings.trendTracking)} ${escapeText(trend.name.toLowerCase())} (${escapeText(strings.confidence)}: ${escapeText(trend.confidence)})</p>
  </div>`;
    })
        .join('\n');
    const listSection = listItems.length > 0 ? `  <ul>\n${listItems.join('\n')}\n  </ul>` : '';
    const parts = [
        `<section class="related-articles" aria-label="${escapeAttr(strings.sectionLabel)}">`,
    ];
    parts.push(`  <h3>${escapeText(strings.heading)}</h3>`);
    if (listSection)
        parts.push(listSection);
    if (trendBlocks)
        parts.push(trendBlocks);
    parts.push('</section>');
    return parts.join('\n');
}
// ─── Private helpers ──────────────────────────────────────────────────────────
/**
 * Remove an article ID from every key's list in a lookup map.
 * Cleans up empty arrays left behind.
 * Skips dangerous keys (`__proto__`, `constructor`, `prototype`) to prevent
 * prototype pollution.
 * @param map - Lookup map (actor/domain/procedure → article IDs)
 * @param keys - Keys to remove the article ID from
 * @param articleId - Article ID to remove
 */
function removeIdFromMap(map, keys, articleId) {
    for (const key of keys) {
        if (!isSafeKey(key))
            continue;
        // eslint-disable-next-line security/detect-object-injection -- key validated via isSafeKey
        const list = map[key];
        if (!list)
            continue;
        const filtered = list.filter((id) => id !== articleId);
        if (filtered.length === 0) {
            // eslint-disable-next-line security/detect-object-injection -- key validated via isSafeKey
            delete map[key];
        }
        else {
            // eslint-disable-next-line security/detect-object-injection -- key validated via isSafeKey
            map[key] = filtered;
        }
    }
}
/**
 * Add an article ID to every key's list in a lookup map (deduplicating).
 * Skips dangerous keys (`__proto__`, `constructor`, `prototype`) to prevent
 * prototype pollution.
 * @param map - Lookup map (actor/domain/procedure → article IDs)
 * @param keys - Keys under which to register the article ID
 * @param articleId - Article ID to add
 */
function addIdToMap(map, keys, articleId) {
    for (const key of keys) {
        if (!isSafeKey(key))
            continue;
        // eslint-disable-next-line security/detect-object-injection -- key validated via isSafeKey
        const existing = map[key] ?? [];
        if (!existing.includes(articleId)) {
            // eslint-disable-next-line security/detect-object-injection -- key validated via isSafeKey
            map[key] = [...existing, articleId];
        }
    }
}
/**
 * Convert a string to a URL-safe slug.
 *
 * Uses Unicode-aware character classes so non-Latin scripts (e.g. Arabic,
 * Hebrew, CJK) produce meaningful slugs instead of collapsing to `""`.
 * When the result would still be empty (e.g. purely punctuation input) a
 * short deterministic hash is returned as a fallback.
 *
 * @param text - Input string
 * @returns Slugified string (never empty)
 */
function slugify(text) {
    const slug = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '');
    if (slug.length > 0)
        return slug;
    // Deterministic fallback: simple DJB2-style hash of the original text
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
    }
    return `h${Math.abs(hash).toString(36)}`;
}
/**
 * Escape HTML attribute special characters.
 * @param text - Raw text
 * @returns Escaped text safe for HTML attributes
 */
function escapeAttr(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
/**
 * Escape HTML text content special characters.
 * @param text - Raw text
 * @returns Escaped text safe for HTML text nodes
 */
function escapeText(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/** Map from 2-letter language codes to BCP 47 locale tags for date formatting */
const LANG_TO_LOCALE = {
    en: 'en-GB',
    sv: 'sv-SE',
    da: 'da-DK',
    no: 'nb-NO',
    fi: 'fi-FI',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-ES',
    nl: 'nl-NL',
    ar: 'ar-SA',
    he: 'he-IL',
    ja: 'ja-JP',
    ko: 'ko-KR',
    zh: 'zh-CN',
};
/**
 * Format an ISO date string as a human-readable date in the given locale.
 * @param date - ISO date string (YYYY-MM-DD)
 * @param lang - Language code (defaults to 'en')
 * @returns Formatted date string
 */
function formatDisplayDate(date, lang) {
    const parts = date.split('-');
    const year = parts[0] ?? '';
    const month = parts[1] ?? '';
    const day = parts[2] ?? '';
    if (!year || !month || !day)
        return date;
    const d = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)));
    const locale = LANG_TO_LOCALE[lang ?? 'en'] ?? 'en-GB';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
//# sourceMappingURL=intelligence-index.js.map