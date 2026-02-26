// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { MONTHLY_REVIEW_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchVotingRecords, fetchVotingPatterns, fetchMotionsAnomalies, fetchParliamentaryQuestionsForMotions, } from '../pipeline/fetch-stage.js';
import { generateMotionsContent } from '../motions-content.js';
/** Keywords shared by all Monthly Review articles */
const MONTHLY_REVIEW_KEYWORDS = [
    'European Parliament',
    'monthly review',
    'legislative output',
    'coalition dynamics',
];
// ─── Date-range helper ────────────────────────────────────────────────────────
/**
 * Compute the review period covering the 30 days ending on `baseDate`.
 *
 * @param baseDate - ISO 8601 publication date (YYYY-MM-DD)
 * @returns Date range covering the past 30 days
 */
function computeMonthlyReviewDateRange(baseDate) {
    const end = new Date(`${baseDate}T00:00:00Z`);
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 30);
    const startParts = start.toISOString().split('T');
    const endParts = end.toISOString().split('T');
    if (!startParts[0] || !endParts[0]) {
        throw new Error('Invalid date format generated in computeMonthlyReviewDateRange');
    }
    return {
        start: startParts[0],
        end: endParts[0],
    };
}
/**
 * Format a month label from a date string (e.g. "February 2026").
 *
 * @param dateStr - ISO 8601 date
 * @returns Human-readable month label
 */
function formatMonthLabel(dateStr) {
    const date = new Date(`${dateStr}T00:00:00Z`);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.MONTH_IN_REVIEW}.
 * Fetches voting records, anomalies, patterns, and questions for the
 * past 30 days and builds a comprehensive retrospective analysis.
 */
export class MonthlyReviewStrategy {
    type = ArticleCategory.MONTH_IN_REVIEW;
    requiredMCPTools = [
        'get_voting_records',
        'analyze_voting_patterns',
        'detect_voting_anomalies',
        'get_parliamentary_questions',
    ];
    /**
     * Fetch monthly review data from MCP.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated monthly review data payload
     */
    async fetchData(client, date) {
        const dateRange = computeMonthlyReviewDateRange(date);
        console.log(`  📊 Monthly review range: ${dateRange.start} to ${dateRange.end}`);
        const [votingRecords, votingPatterns, anomalies, questions] = await Promise.all([
            fetchVotingRecords(client, dateRange.start, dateRange.end),
            fetchVotingPatterns(client, dateRange.start, dateRange.end),
            fetchMotionsAnomalies(client, dateRange.start, dateRange.end),
            fetchParliamentaryQuestionsForMotions(client, dateRange.start, dateRange.end),
        ]);
        const monthLabel = formatMonthLabel(dateRange.start);
        return {
            date,
            dateRange,
            dateFromStr: dateRange.start,
            votingRecords,
            votingPatterns,
            anomalies,
            questions,
            monthLabel,
        };
    }
    /**
     * Build the monthly review HTML body for the specified language.
     *
     * @param data - Monthly review data payload
     * @param lang - Target language code used for editorial strings
     * @returns Article HTML body
     */
    buildContent(data, lang) {
        return generateMotionsContent(data.dateRange.start, data.dateRange.end, data.votingRecords, data.votingPatterns, data.anomalies, data.questions, lang);
    }
    /**
     * Return language-specific metadata for the monthly review article.
     *
     * @param data - Monthly review data payload
     * @param lang - Target language code
     * @returns Localised metadata
     */
    getMetadata(data, lang) {
        const titleFn = getLocalizedString(MONTHLY_REVIEW_TITLES, lang);
        const { title, subtitle } = titleFn(data.monthLabel);
        return {
            title,
            subtitle,
            keywords: [...MONTHLY_REVIEW_KEYWORDS],
            category: ArticleCategory.MONTH_IN_REVIEW,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const monthlyReviewStrategy = new MonthlyReviewStrategy();
//# sourceMappingURL=monthly-review-strategy.js.map