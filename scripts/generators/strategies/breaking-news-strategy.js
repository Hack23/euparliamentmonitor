// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { BREAKING_NEWS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchVotingAnomalies, fetchCoalitionDynamics, fetchVotingReport, } from '../pipeline/fetch-stage.js';
import { buildBreakingNewsContent } from '../breaking-content.js';
/** Keywords shared by all Breaking News articles */
const BREAKING_NEWS_KEYWORDS = [
    'European Parliament',
    'breaking news',
    'voting anomalies',
    'coalition dynamics',
];
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.BREAKING_NEWS}.
 * Aggregates OSINT signals from MCP and surfaces political intelligence.
 */
export class BreakingNewsStrategy {
    type = ArticleCategory.BREAKING_NEWS;
    requiredMCPTools = [
        'detect_voting_anomalies',
        'analyze_coalition_dynamics',
        'generate_report',
    ];
    /**
     * Fetch all OSINT signals in parallel.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated breaking news data payload
     */
    async fetchData(client, date) {
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
    buildContent(data, lang) {
        return buildBreakingNewsContent(data.date, data.anomalyRaw, data.coalitionRaw, data.reportRaw, '', lang);
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