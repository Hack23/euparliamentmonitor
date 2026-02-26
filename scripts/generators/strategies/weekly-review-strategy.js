// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { WEEKLY_REVIEW_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchVotingRecords, fetchVotingPatterns, fetchMotionsAnomalies, fetchParliamentaryQuestionsForMotions, } from '../pipeline/fetch-stage.js';
import { generateMotionsContent } from '../motions-content.js';
/** Keywords shared by all Weekly Review articles */
const WEEKLY_REVIEW_KEYWORDS = [
    'European Parliament',
    'weekly review',
    'voting records',
    'parliamentary activity',
];
// ─── Date-range helper ────────────────────────────────────────────────────────
/**
 * Compute the review period covering the 7 days ending on `baseDate`.
 *
 * @param baseDate - ISO 8601 publication date (YYYY-MM-DD)
 * @returns Date range covering the past 7 days
 */
function computeWeeklyReviewDateRange(baseDate) {
    const end = new Date(`${baseDate}T00:00:00Z`);
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 7);
    const startParts = start.toISOString().split('T');
    const endParts = end.toISOString().split('T');
    if (!startParts[0] || !endParts[0]) {
        throw new Error('Invalid date format generated in computeWeeklyReviewDateRange');
    }
    return {
        start: startParts[0],
        end: endParts[0],
    };
}
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.WEEK_IN_REVIEW}.
 * Fetches voting records, anomalies, patterns, and questions for the
 * past 7 days and builds a retrospective analysis article.
 */
export class WeeklyReviewStrategy {
    type = ArticleCategory.WEEK_IN_REVIEW;
    requiredMCPTools = [
        'get_voting_records',
        'analyze_voting_patterns',
        'detect_voting_anomalies',
        'get_parliamentary_questions',
    ];
    /**
     * Fetch weekly review data from MCP.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated weekly review data payload
     */
    async fetchData(client, date) {
        const dateRange = computeWeeklyReviewDateRange(date);
        console.log(`  📊 Weekly review range: ${dateRange.start} to ${dateRange.end}`);
        const [votingRecords, votingPatterns, anomalies, questions] = await Promise.all([
            fetchVotingRecords(client, dateRange.start, dateRange.end),
            fetchVotingPatterns(client, dateRange.start, dateRange.end),
            fetchMotionsAnomalies(client, dateRange.start, dateRange.end),
            fetchParliamentaryQuestionsForMotions(client, dateRange.start, dateRange.end),
        ]);
        return {
            date,
            dateRange,
            dateFromStr: dateRange.start,
            votingRecords,
            votingPatterns,
            anomalies,
            questions,
        };
    }
    /**
     * Build the weekly review HTML body for the specified language.
     *
     * @param data - Weekly review data payload
     * @param lang - Target language code used for editorial strings
     * @returns Article HTML body
     */
    buildContent(data, lang) {
        return generateMotionsContent(data.dateRange.start, data.dateRange.end, [...data.votingRecords], [...data.votingPatterns], [...data.anomalies], [...data.questions], lang);
    }
    /**
     * Return language-specific metadata for the weekly review article.
     *
     * @param data - Weekly review data payload
     * @param lang - Target language code
     * @returns Localised metadata
     */
    getMetadata(data, lang) {
        const titleFn = getLocalizedString(WEEKLY_REVIEW_TITLES, lang);
        const { title, subtitle } = titleFn(data.dateRange.start, data.dateRange.end);
        return {
            title,
            subtitle,
            keywords: [...WEEKLY_REVIEW_KEYWORDS],
            category: ArticleCategory.WEEK_IN_REVIEW,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const weeklyReviewStrategy = new WeeklyReviewStrategy();
//# sourceMappingURL=weekly-review-strategy.js.map