// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { WEEKLY_REVIEW_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchVotingRecords, fetchVotingPatterns, fetchMotionsAnomalies, fetchParliamentaryQuestionsForMotions, fetchEPFeedData, } from '../pipeline/fetch-stage.js';
import { generateMotionsContent, buildAdoptedTextsSection } from '../motions-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import { buildVotingAnalysis, buildVotingSwot, buildVotingDashboard, buildVotingMindmap, } from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
import { buildIntelligenceMindmapSection } from '../mindmap-content.js';
import { pl } from '../../utils/metadata-utils.js';
import { isPlaceholderText } from '../../constants/analysis-constants.js';
/** Base keywords shared by all Weekly Review articles */
const WEEKLY_REVIEW_BASE_KEYWORDS = [
    'European Parliament',
    'weekly review',
    'voting records',
    'parliamentary activity',
];
/**
 * Extract content-aware keywords from weekly review data.
 *
 * @param data - Weekly review article data payload
 * @returns Deduplicated keyword array
 */
function buildWeeklyReviewKeywords(data) {
    const keywords = [...WEEKLY_REVIEW_BASE_KEYWORDS];
    const realRecords = data.votingRecords
        .slice(0, 5)
        .filter((r) => r.title && !isPlaceholderText(r.title));
    for (const r of realRecords)
        keywords.push(r.title.slice(0, 60));
    const realAnomalies = data.anomalies
        .slice(0, 3)
        .filter((a) => a.type && !isPlaceholderText(a.type));
    for (const a of realAnomalies)
        keywords.push(a.type);
    const realQuestions = data.questions
        .slice(0, 3)
        .filter((q) => q.topic && !isPlaceholderText(q.topic));
    for (const q of realQuestions)
        keywords.push(q.topic);
    if (data.feedData?.adoptedTexts) {
        const realTexts = data.feedData.adoptedTexts
            .slice(0, 3)
            .filter((t) => t.title && !isPlaceholderText(t.title));
        for (const text of realTexts)
            keywords.push(text.title.slice(0, 60));
    }
    return [...new Set(keywords)];
}
/**
 * Build a content-aware description from weekly review data.
 *
 * @param data - Weekly review article data payload
 * @returns SEO-friendly description (≤ 200 chars)
 */
function buildWeeklyReviewDescription(data) {
    const parts = [];
    if (data.votingRecords.length > 0)
        parts.push(`${pl(data.votingRecords.length, 'vote', 'votes')} analysed`);
    if (data.anomalies.length > 0)
        parts.push(pl(data.anomalies.length, 'voting anomaly', 'voting anomalies'));
    if (data.questions.length > 0)
        parts.push(`${pl(data.questions.length, 'question', 'questions')} tabled`);
    const adoptedCount = data.feedData?.adoptedTexts?.length ?? 0;
    if (adoptedCount > 0)
        parts.push(`${adoptedCount} adopted ${adoptedCount === 1 ? 'text' : 'texts'}`);
    if (parts.length === 0) {
        return `European Parliament weekly review for ${data.dateRange.start} to ${data.dateRange.end}.`;
    }
    const highlight = data.votingRecords[0]?.title ?? '';
    const base = `EP week in review (${data.dateRange.start}–${data.dateRange.end}): ${parts.join(', ')}`;
    if (highlight) {
        const full = `${base}. Key: ${highlight}`;
        return full.length > 200 ? full.slice(0, 197) + '...' : full;
    }
    return base.length > 200 ? base.slice(0, 197) + '...' : base;
}
/**
 * Build a content-aware title suffix from weekly review data counts.
 *
 * @param data - Weekly review article data payload
 * @returns Short suffix for the title, or empty string
 */
function buildWeeklyReviewTitleSuffix(data) {
    const parts = [];
    if (data.votingRecords.length > 0) {
        parts.push(pl(data.votingRecords.length, 'Vote', 'Votes'));
    }
    if (data.anomalies.length > 0) {
        parts.push(pl(data.anomalies.length, 'Anomaly', 'Anomalies'));
    }
    const adoptedCount = data.feedData?.adoptedTexts?.length ?? 0;
    if (adoptedCount > 0) {
        parts.push(pl(adoptedCount, 'Text', 'Texts'));
    }
    return parts.join(', ');
}
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
        'get_adopted_texts_feed',
        'get_procedures_feed',
        'get_events_feed',
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
        // Fetch voting data and EP feed data in parallel
        const [votingRecords, votingPatterns, anomalies, questions, feedData] = await Promise.all([
            fetchVotingRecords(client, dateRange.start, dateRange.end),
            fetchVotingPatterns(client, dateRange.start, dateRange.end),
            fetchMotionsAnomalies(client, dateRange.start, dateRange.end),
            fetchParliamentaryQuestionsForMotions(client, dateRange.start, dateRange.end),
            fetchEPFeedData(client, 'one-week', dateRange),
        ]);
        return {
            date,
            dateRange,
            dateFromStr: dateRange.start,
            votingRecords,
            votingPatterns,
            anomalies,
            questions,
            feedData,
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
        const base = generateMotionsContent(data.dateRange.start, data.dateRange.end, [...data.votingRecords], [...data.votingPatterns], [...data.anomalies], [...data.questions], lang);
        const analysis = buildVotingAnalysis(data.dateRange.start, data.dateRange.end, data.votingRecords, data.votingPatterns, data.anomalies, data.questions);
        const deepSection = buildDeepAnalysisSection(analysis, lang, 'en');
        // Enrich with adopted texts from feed data when available
        const adoptedTextsHtml = data.feedData && data.feedData.adoptedTexts.length > 0
            ? buildAdoptedTextsSection(data.feedData.adoptedTexts, lang)
            : '';
        const mindmapData = buildVotingMindmap(data.votingRecords, data.votingPatterns, data.anomalies, lang);
        const mindmapSection = buildIntelligenceMindmapSection(mindmapData, lang);
        const swotData = buildVotingSwot(data.votingRecords, data.votingPatterns, data.anomalies, lang);
        const swotSection = buildSwotSection(swotData, lang);
        const dashboardData = buildVotingDashboard(data.votingRecords, data.votingPatterns, data.anomalies, lang);
        const dashboardSection = buildDashboardSection(dashboardData, lang);
        return base.replace('<!-- /article-content -->', adoptedTextsHtml + deepSection + mindmapSection + swotSection + dashboardSection);
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
        const { title: baseTitle, subtitle: baseSubtitle } = titleFn(data.dateRange.start, data.dateRange.end);
        const suffix = lang === 'en' ? buildWeeklyReviewTitleSuffix(data) : '';
        const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
        const description = lang === 'en' ? buildWeeklyReviewDescription(data) : '';
        const subtitle = description || baseSubtitle;
        return {
            title,
            subtitle,
            keywords: buildWeeklyReviewKeywords(data),
            category: ArticleCategory.WEEK_IN_REVIEW,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const weeklyReviewStrategy = new WeeklyReviewStrategy();
//# sourceMappingURL=weekly-review-strategy.js.map