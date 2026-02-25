// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { WEEK_AHEAD_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchWeekAheadData } from '../pipeline/fetch-stage.js';
import { buildWeekAheadContent, buildKeywords, buildWhatToWatchSection } from '../week-ahead-content.js';
// ─── Date-range helper ────────────────────────────────────────────────────────
/**
 * Compute the week-ahead date range starting the day after `baseDate`.
 *
 * @param baseDate - ISO 8601 publication date (YYYY-MM-DD)
 * @returns Date range spanning the next 7 days
 */
function computeWeekAheadDateRange(baseDate) {
    const base = new Date(`${baseDate}T00:00:00Z`);
    const startDate = new Date(base);
    startDate.setUTCDate(base.getUTCDate() + 1);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 7);
    const startParts = startDate.toISOString().split('T');
    const endParts = endDate.toISOString().split('T');
    if (!startParts[0] || !endParts[0]) {
        throw new Error('Invalid date format generated in computeWeekAheadDateRange');
    }
    return {
        start: startParts[0],
        end: endParts[0],
    };
}
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.WEEK_AHEAD}.
 * Fetches plenary, committee, document, pipeline and question data then builds
 * a forward-looking preview of the upcoming parliamentary week.
 */
export class WeekAheadStrategy {
    type = ArticleCategory.WEEK_AHEAD;
    requiredMCPTools = [
        'get_plenary_sessions',
        'get_committee_info',
        'search_documents',
        'monitor_legislative_pipeline',
        'get_parliamentary_questions',
    ];
    /**
     * Fetch week-ahead data from MCP.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated week-ahead data payload
     */
    async fetchData(client, date) {
        const dateRange = computeWeekAheadDateRange(date);
        console.log(`  📆 Date range: ${dateRange.start} to ${dateRange.end}`);
        const weekData = await fetchWeekAheadData(client, dateRange);
        const keywords = buildKeywords(weekData);
        return { date, dateRange, weekData, keywords };
    }
    /**
     * Build the week-ahead HTML body for the specified language.
     *
     * @param data - Week-ahead data payload
     * @param lang - Target language code used for editorial strings
     * @returns Article HTML body
     */
    buildContent(data, lang) {
        const base = buildWeekAheadContent(data.weekData, data.dateRange, lang);
        const watchSection = buildWhatToWatchSection(data.weekData.pipeline, [], lang);
        if (watchSection) {
            return base.replace(/(<\/div>\s*)$/, `${watchSection}$1`);
        }
        return base;
    }
    /**
     * Return language-specific metadata for the week-ahead article.
     *
     * @param data - Week-ahead data payload
     * @param lang - Target language code
     * @returns Localised metadata
     */
    getMetadata(data, lang) {
        const titleFn = getLocalizedString(WEEK_AHEAD_TITLES, lang);
        const { title, subtitle } = titleFn(data.dateRange.start, data.dateRange.end);
        return {
            title,
            subtitle,
            keywords: data.keywords,
            category: ArticleCategory.WEEK_AHEAD,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const weekAheadStrategy = new WeekAheadStrategy();
//# sourceMappingURL=week-ahead-strategy.js.map