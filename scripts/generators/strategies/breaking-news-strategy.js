// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { BREAKING_NEWS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchBreakingNewsFeedData, fetchVotingAnomalies, fetchCoalitionDynamics, loadFeedDataFromFile, } from '../pipeline/fetch-stage.js';
import { buildBreakingNewsContent, scoreBreakingNewsSignificance, SIGNIFICANCE_THRESHOLD, } from '../breaking-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import { buildBreakingAnalysis, buildBreakingSwot, buildBreakingDashboard, buildBreakingMindmap, } from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
import { buildIntelligenceMindmapSection } from '../mindmap-content.js';
import { pl } from '../../utils/metadata-utils.js';
/** Base keywords shared by all Breaking News articles */
const BREAKING_NEWS_BASE_KEYWORDS = [
    'European Parliament',
    'breaking news',
    'adopted texts',
    'legislative updates',
    'parliamentary events',
];
/**
 * Extract content-aware keywords from breaking news feed data.
 *
 * Scans adopted text titles, event titles, and procedure titles for
 * topic-relevant terms that enrich SEO keywords beyond the static base set.
 *
 * @param feedData - Breaking news feed data (may be undefined)
 * @returns Deduplicated array of keywords including base + content-derived terms
 */
function buildBreakingKeywords(feedData) {
    const keywords = [...BREAKING_NEWS_BASE_KEYWORDS];
    if (!feedData)
        return keywords;
    for (const text of feedData.adoptedTexts.slice(0, 5)) {
        if (text.title)
            keywords.push(text.title.slice(0, 60));
    }
    for (const evt of feedData.events.slice(0, 3)) {
        if (evt.title)
            keywords.push(evt.title.slice(0, 60));
    }
    for (const proc of feedData.procedures.slice(0, 3)) {
        if (proc.title)
            keywords.push(proc.title.slice(0, 60));
    }
    return [...new Set(keywords)];
}
/**
 * Build a content-aware description from breaking news feed data.
 * Summarises the count of adopted texts, events, procedures, and MEP updates
 * and highlights the first adopted text title when available.
 *
 * @param date - Publication date
 * @param feedData - Breaking news feed data (may be undefined)
 * @returns SEO-friendly description string (≤ 200 chars)
 */
function buildBreakingDescription(date, feedData) {
    if (!feedData)
        return `European Parliament breaking developments for ${date}.`;
    const counts = [];
    if (feedData.adoptedTexts.length > 0)
        counts.push(pl(feedData.adoptedTexts.length, 'adopted text', 'adopted texts'));
    if (feedData.events.length > 0)
        counts.push(pl(feedData.events.length, 'event', 'events'));
    if (feedData.procedures.length > 0)
        counts.push(pl(feedData.procedures.length, 'procedure', 'procedures'));
    if (feedData.mepUpdates.length > 0)
        counts.push(pl(feedData.mepUpdates.length, 'MEP update', 'MEP updates'));
    if (counts.length === 0)
        return `European Parliament breaking developments for ${date}.`;
    const highlight = feedData.adoptedTexts[0]?.title ?? feedData.events[0]?.title ?? '';
    const base = `EP breaking: ${counts.join(', ')}`;
    if (highlight) {
        const full = `${base}. Highlights: ${highlight}`;
        return full.length > 200 ? full.slice(0, 197) + '...' : full;
    }
    return base.length > 200 ? base.slice(0, 197) + '...' : base;
}
/**
 * Build a content-aware title suffix from feed data item counts.
 *
 * @param feedData - Breaking news feed data (may be undefined)
 * @returns Short suffix string for appending to the base title, or empty string
 */
function buildBreakingTitleSuffix(feedData) {
    if (!feedData)
        return '';
    const total = feedData.adoptedTexts.length +
        feedData.events.length +
        feedData.procedures.length +
        feedData.mepUpdates.length;
    if (total === 0)
        return '';
    const parts = [];
    if (feedData.adoptedTexts.length > 0)
        parts.push(pl(feedData.adoptedTexts.length, 'Text', 'Texts'));
    if (feedData.events.length > 0)
        parts.push(pl(feedData.events.length, 'Event', 'Events'));
    if (feedData.procedures.length > 0)
        parts.push(pl(feedData.procedures.length, 'Procedure', 'Procedures'));
    return parts.join(', ');
}
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.BREAKING_NEWS}.
 *
 * **Feed-first**: EP feed endpoints are the primary data source.
 * Analytical tools provide supplementary context only.
 * Stats are NEVER the news itself.
 */
export class BreakingNewsStrategy {
    type = ArticleCategory.BREAKING_NEWS;
    requiredMCPTools = [
        'get_adopted_texts_feed',
        'get_events_feed',
        'get_procedures_feed',
        'get_meps_feed',
        'detect_voting_anomalies',
        'analyze_coalition_dynamics',
    ];
    /**
     * Fetch EP feed data (primary) first, then conditionally fetch analytical
     * context (secondary) in a second phase.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated breaking news data payload
     */
    async fetchData(client, date) {
        // Step 0: Check for pre-fetched feed data file (set by --feed-data CLI arg).
        // This allows agentic workflows to pass MCP data fetched via framework tools
        // into the generator without requiring a direct MCP connection.
        const feedDataFile = process.env['EP_FEED_DATA_FILE'];
        if (feedDataFile) {
            console.log(`  📂 Loading pre-fetched feed data from: ${feedDataFile}`);
            const fileFeedData = loadFeedDataFromFile(feedDataFile, { start: date, end: date });
            if (fileFeedData) {
                const totalItems = fileFeedData.adoptedTexts.length +
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
        const totalFeedItems = feedData.adoptedTexts.length +
            feedData.events.length +
            feedData.procedures.length +
            feedData.mepUpdates.length;
        if (totalFeedItems > 0) {
            console.log(`  📰 Feed data: ${feedData.adoptedTexts.length} adopted texts, ` +
                `${feedData.events.length} events, ${feedData.procedures.length} procedures, ` +
                `${feedData.mepUpdates.length} MEP updates`);
        }
        else {
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
    buildContent(data, lang) {
        const base = buildBreakingNewsContent(data.date, data.anomalyRaw, data.coalitionRaw, data.reportRaw, '', lang, [], [], [], data.feedData);
        const analysis = buildBreakingAnalysis(data.date, data.feedData, data.anomalyRaw, data.coalitionRaw, lang);
        const deepSection = buildDeepAnalysisSection(analysis, lang);
        const mindmapData = buildBreakingMindmap(data.feedData, lang);
        const mindmapSection = buildIntelligenceMindmapSection(mindmapData, lang);
        const swotData = buildBreakingSwot(data.feedData, data.anomalyRaw, data.coalitionRaw, lang);
        const swotSection = buildSwotSection(swotData, lang);
        const dashboardData = buildBreakingDashboard(data.feedData, lang);
        const dashboardSection = buildDashboardSection(dashboardData, lang);
        const injection = deepSection + mindmapSection + swotSection + dashboardSection;
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
    getMetadata(data, lang) {
        const titleFn = getLocalizedString(BREAKING_NEWS_TITLES, lang);
        const { title: baseTitle, subtitle: baseSubtitle } = titleFn(data.date);
        const suffix = lang === 'en' ? buildBreakingTitleSuffix(data.feedData) : '';
        const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
        const description = lang === 'en' ? buildBreakingDescription(data.date, data.feedData) : '';
        const subtitle = description || baseSubtitle;
        const keywords = buildBreakingKeywords(data.feedData);
        if (data.feedData) {
            const score = scoreBreakingNewsSignificance(data.feedData);
            if (score.overallScore >= SIGNIFICANCE_THRESHOLD) {
                keywords.push(`significance:${score.overallScore}`);
            }
        }
        return {
            title,
            subtitle,
            keywords,
            category: ArticleCategory.BREAKING_NEWS,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const breakingNewsStrategy = new BreakingNewsStrategy();
//# sourceMappingURL=breaking-news-strategy.js.map