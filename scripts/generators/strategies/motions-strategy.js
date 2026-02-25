// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { MOTIONS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchMotionsData } from '../pipeline/fetch-stage.js';
import { generateMotionsContent, buildPoliticalAlignmentSection } from '../motions-content.js';
/** Keywords shared by all Motions articles */
const MOTIONS_KEYWORDS = [
    'European Parliament',
    'motions',
    'voting records',
    'party cohesion',
    'parliamentary questions',
];
/** Number of days to look back when fetching motions data */
const MOTIONS_LOOKBACK_DAYS = 30;
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.MOTIONS}.
 * Aggregates voting data over a rolling 30-day window and surfaces
 * patterns, anomalies and parliamentary questions.
 */
export class MotionsStrategy {
    type = ArticleCategory.MOTIONS;
    requiredMCPTools = [
        'get_voting_records',
        'analyze_voting_patterns',
        'detect_voting_anomalies',
        'get_parliamentary_questions',
    ];
    /**
     * Fetch all motions data for the last 30 days.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date (end of the look-back window)
     * @returns Populated motions data payload
     */
    async fetchData(client, date) {
        const dateFrom = new Date(`${date}T00:00:00Z`);
        dateFrom.setUTCDate(dateFrom.getUTCDate() - MOTIONS_LOOKBACK_DAYS);
        const dateFromParts = dateFrom.toISOString().split('T');
        if (!dateFromParts[0]) {
            throw new Error('Invalid date format generated for motions look-back window');
        }
        const dateFromStr = dateFromParts[0];
        const { votingRecords, votingPatterns, anomalies, questions } = await fetchMotionsData(client, dateFromStr, date);
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
    buildContent(data, lang) {
        const base = generateMotionsContent(data.dateFromStr, data.date, [...data.votingRecords], [...data.votingPatterns], [...data.anomalies], [...data.questions], lang);
        const alignmentSection = buildPoliticalAlignmentSection([...data.votingRecords], [], lang);
        // Inject at the explicit <!-- /article-content --> marker so the section
        // stays inside the .article-content styling scope. The marker is always
        // emitted by generateMotionsContent as the last child of that wrapper and
        // is removed from the final HTML during this replacement.
        if (alignmentSection) {
            return base.replace('<!-- /article-content -->', `${alignmentSection}\n`);
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
    getMetadata(data, lang) {
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
//# sourceMappingURL=motions-strategy.js.map