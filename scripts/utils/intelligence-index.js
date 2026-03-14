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
// ─── Minimum article count to confirm a trend ────────────────────────────────
/** Minimum number of articles required to recognise a trend */
const MIN_TREND_ARTICLES = 2;
/** Maximum cross-reference results when no limit is specified */
const DEFAULT_MAX_RELATED = 10;
// ─── createEmptyIndex ────────────────────────────────────────────────────────
/**
 * Create a fresh, empty {@link IntelligenceIndex}.
 *
 * @returns An empty index with no articles, actors, domains, trends, or series
 */
export function createEmptyIndex() {
    return {
        articles: [],
        actors: {},
        policyDomains: {},
        procedures: {},
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
    const oldEntry = existingIdx >= 0 ? index.articles[existingIdx] : undefined;
    const articles = existingIdx >= 0
        ? [...index.articles.slice(0, existingIdx), entry, ...index.articles.slice(existingIdx + 1)]
        : [...index.articles, entry];
    // Clone lookup maps
    const actors = { ...index.actors };
    const policyDomains = { ...index.policyDomains };
    const procedures = { ...index.procedures };
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
 * - Target article is the same date or newer → `related`
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
        const relationship = a.date < entry.date ? 'follows_up' : 'related';
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
// ─── loadIntelligenceIndex ───────────────────────────────────────────────────
/**
 * Load an {@link IntelligenceIndex} from a JSON file.
 *
 * Returns an empty index (via {@link createEmptyIndex}) if the file does not exist
 * or cannot be parsed.
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
        // Merge onto an empty index to ensure all fields are present and safe
        // even after schema evolution or partial/corrupt files.
        const empty = createEmptyIndex();
        return {
            articles: Array.isArray(parsed.articles) ? parsed.articles : empty.articles,
            actors: parsed.actors && typeof parsed.actors === 'object' && !Array.isArray(parsed.actors)
                ? parsed.actors
                : empty.actors,
            policyDomains: parsed.policyDomains &&
                typeof parsed.policyDomains === 'object' &&
                !Array.isArray(parsed.policyDomains)
                ? parsed.policyDomains
                : empty.policyDomains,
            procedures: parsed.procedures &&
                typeof parsed.procedures === 'object' &&
                !Array.isArray(parsed.procedures)
                ? parsed.procedures
                : empty.procedures,
            trends: Array.isArray(parsed.trends) ? parsed.trends : empty.trends,
            series: Array.isArray(parsed.series) ? parsed.series : empty.series,
            lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : empty.lastUpdated,
        };
    }
    catch {
        return createEmptyIndex();
    }
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
/** Labels used in HTML output for link text prefixes */
const RELATIONSHIP_LABELS = {
    follows_up: 'Previous',
    preceded_by: 'Next',
    related: 'Related',
    contradicts: 'Contrast',
    deepens: 'Deeper analysis',
};
/**
 * Generate an HTML `<section>` listing related articles, cross-references, and
 * emerging trends for embedding in a generated article.
 *
 * Produces accessible markup with `aria-label` and `rel="noopener noreferrer"`.
 *
 * @param relatedArticles - Articles related to the current article
 * @param crossRefs - Cross-references from the current article
 * @param trends - Trends relevant to the current article
 * @param _lang - Language code (reserved for future localisation, currently unused)
 * @returns HTML string for the "Related Analysis" section, or empty string if nothing to show
 */
export function buildRelatedArticlesHTML(relatedArticles, crossRefs, trends, _lang) {
    if (relatedArticles.length === 0 && trends.length === 0) {
        return '';
    }
    const listItems = crossRefs
        .map((ref) => {
        const article = relatedArticles.find((a) => a.id === ref.targetArticleId);
        if (!article)
            return '';
        const label = RELATIONSHIP_LABELS[ref.relationship] ?? 'Related';
        const displayDate = formatDisplayDate(article.date);
        const filename = `${article.id}.html`;
        return `    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">${escapeText(label)}: ${escapeText(ref.context)} (${escapeText(displayDate)})</a></li>`;
    })
        .filter(Boolean);
    // Fall back: show related articles without explicit cross-refs
    if (listItems.length === 0 && relatedArticles.length > 0) {
        for (const article of relatedArticles) {
            const displayDate = formatDisplayDate(article.date);
            const filename = `${article.id}.html`;
            listItems.push(`    <li><a href="${escapeAttr(filename)}" rel="noopener noreferrer">Related: ${escapeText(article.type)} article (${escapeText(displayDate)})</a></li>`);
        }
    }
    const trendBlocks = trends
        .map((trend) => {
        const count = trend.articleReferences.length;
        return `  <div class="emerging-trends">
    <h4>Emerging Trend: ${escapeText(trend.name)}</h4>
    <p>This is the ${count}${ordinalSuffix(count)} article tracking ${escapeText(trend.name.toLowerCase())} (confidence: ${escapeText(trend.confidence)})</p>
  </div>`;
    })
        .join('\n');
    const listSection = listItems.length > 0 ? `  <ul>\n${listItems.join('\n')}\n  </ul>` : '';
    const parts = ['<section class="related-articles" aria-label="Related Analysis">'];
    parts.push('  <h3>Related Analysis</h3>');
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
 * @param map - Lookup map (actor/domain/procedure → article IDs)
 * @param keys - Keys to remove the article ID from
 * @param articleId - Article ID to remove
 */
function removeIdFromMap(map, keys, articleId) {
    for (const key of keys) {
        const list = map[key];
        if (!list)
            continue;
        const filtered = list.filter((id) => id !== articleId);
        if (filtered.length === 0) {
            delete map[key];
        }
        else {
            map[key] = filtered;
        }
    }
}
/**
 * Add an article ID to every key's list in a lookup map (deduplicating).
 * @param map - Lookup map (actor/domain/procedure → article IDs)
 * @param keys - Keys under which to register the article ID
 * @param articleId - Article ID to add
 */
function addIdToMap(map, keys, articleId) {
    for (const key of keys) {
        const existing = map[key] ?? [];
        if (!existing.includes(articleId)) {
            map[key] = [...existing, articleId];
        }
    }
}
/**
 * Convert a string to a URL-safe slug.
 * @param text - Input string
 * @returns Slugified string
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
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
/**
 * Format an ISO date string as a human-readable date.
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string
 */
function formatDisplayDate(date) {
    const parts = date.split('-');
    const year = parts[0] ?? '';
    const month = parts[1] ?? '';
    const day = parts[2] ?? '';
    if (!year || !month || !day)
        return date;
    const d = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
/**
 * Return the English ordinal suffix for a positive integer (1st, 2nd, 3rd, …).
 * @param n - Positive integer
 * @returns Ordinal suffix string
 */
function ordinalSuffix(n) {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13)
        return 'th';
    const mod10 = n % 10;
    if (mod10 === 1)
        return 'st';
    if (mod10 === 2)
        return 'nd';
    if (mod10 === 3)
        return 'rd';
    return 'th';
}
//# sourceMappingURL=intelligence-index.js.map