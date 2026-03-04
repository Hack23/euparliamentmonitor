// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { BREAKING_NEWS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchBreakingNewsFeedData, fetchVotingAnomalies, fetchCoalitionDynamics, } from '../pipeline/fetch-stage.js';
import { buildBreakingNewsContent } from '../breaking-content.js';
/** Keywords shared by all Breaking News articles */
const BREAKING_NEWS_KEYWORDS = [
    'European Parliament',
    'breaking news',
    'adopted texts',
    'legislative updates',
    'parliamentary events',
];
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
        if (client) {
            console.log('  📡 Fetching EP feed data (primary) and analytical context...');
        }
        // Step 1: Fetch feed data (PRIMARY news content)
        const feedData = await fetchBreakingNewsFeedData(client, 'one-day');
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
        return buildBreakingNewsContent(data.date, data.anomalyRaw, data.coalitionRaw, data.reportRaw, '', lang, [], [], [], data.feedData);
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
//# sourceMappingURL=breaking-news-strategy.js.map