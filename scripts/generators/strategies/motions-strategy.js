// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { MOTIONS_TITLES, getLocalizedString } from '../../constants/languages.js';
import { fetchMotionsData, fetchEPFeedData } from '../pipeline/fetch-stage.js';
import { generateMotionsContent, buildPoliticalAlignmentSection, buildAdoptedTextsSection, PLACEHOLDER_MARKER, } from '../motions-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import { buildVotingAnalysis, buildVotingSwot, buildVotingDashboard, buildVotingMindmap, } from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
import { buildIntelligenceMindmapSection } from '../mindmap-content.js';
import { pl } from '../../utils/metadata-utils.js';
/** Base keywords shared by all Motions articles */
const MOTIONS_BASE_KEYWORDS = [
    'European Parliament',
    'motions',
    'voting records',
    'party cohesion',
    'parliamentary questions',
];
/**
 * Extract content-aware keywords from motions data.
 *
 * Adds voting record titles, anomaly descriptions, question topics,
 * and adopted text titles to the base keyword set.
 *
 * @param data - Motions article data payload
 * @returns Deduplicated keyword array
 */
function buildMotionsKeywords(data) {
    const keywords = [...MOTIONS_BASE_KEYWORDS];
    for (const r of data.votingRecords.slice(0, 5)) {
        if (r.title)
            keywords.push(r.title.slice(0, 60));
    }
    for (const a of data.anomalies.slice(0, 3)) {
        if (a.type)
            keywords.push(a.type);
    }
    for (const q of data.questions.slice(0, 3)) {
        if (q.topic)
            keywords.push(q.topic);
    }
    if (data.feedData?.adoptedTexts) {
        for (const text of data.feedData.adoptedTexts.slice(0, 3)) {
            if (text.title)
                keywords.push(text.title.slice(0, 60));
        }
    }
    return [...new Set(keywords)];
}
/**
 * Build a content-aware description from motions data.
 * Summarises voting record count, anomaly count, and key vote highlights.
 *
 * @param data - Motions article data payload
 * @returns SEO-friendly description (≤ 200 chars)
 */
function buildMotionsDescription(data) {
    const parts = [];
    if (data.votingRecords.length > 0)
        parts.push(`${pl(data.votingRecords.length, 'vote', 'votes')} analysed`);
    if (data.anomalies.length > 0)
        parts.push(`${pl(data.anomalies.length, 'anomaly', 'anomalies')} detected`);
    if (data.questions.length > 0)
        parts.push(pl(data.questions.length, 'parliamentary question', 'parliamentary questions'));
    const adoptedCount = data.feedData?.adoptedTexts?.length ?? 0;
    if (adoptedCount > 0)
        parts.push(pl(adoptedCount, 'adopted text', 'adopted texts'));
    if (parts.length === 0) {
        return `European Parliament plenary votes and resolutions from ${data.dateFromStr} to ${data.date}.`;
    }
    const highlight = data.votingRecords[0]?.title ?? '';
    const base = `EP voting analysis: ${parts.join(', ')}`;
    if (highlight) {
        const full = `${base}. Key vote: ${highlight}`;
        return full.length > 200 ? full.slice(0, 197) + '...' : full;
    }
    return base.length > 200 ? base.slice(0, 197) + '...' : base;
}
/**
 * Build a content-aware title suffix from motions data counts.
 *
 * @param data - Motions article data payload
 * @returns Short suffix for the title, or empty string
 */
function buildMotionsTitleSuffix(data) {
    const parts = [];
    if (data.votingRecords.length > 0) {
        parts.push(pl(data.votingRecords.length, 'Vote', 'Votes'));
    }
    if (data.anomalies.length > 0) {
        parts.push(pl(data.anomalies.length, 'Anomaly', 'Anomalies'));
    }
    const adoptedCount = data.feedData?.adoptedTexts?.length ?? 0;
    if (adoptedCount > 0) {
        parts.push(pl(adoptedCount, 'Adopted Text', 'Adopted Texts'));
    }
    return parts.join(', ');
}
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
        'get_adopted_texts_feed',
        'get_parliamentary_questions_feed',
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
        // Fetch voting data and EP feed data in parallel
        const feedDateRange = { start: dateFromStr, end: date };
        const [motionsDataResult, feedData] = await Promise.all([
            fetchMotionsData(client, dateFromStr, date),
            fetchEPFeedData(client, 'one-month', feedDateRange),
        ]);
        const { votingRecords, votingPatterns, anomalies, questions } = motionsDataResult;
        return {
            date,
            dateFromStr,
            votingRecords,
            votingPatterns,
            anomalies,
            questions,
            feedData,
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
        const adoptedTextsSection = data.feedData?.adoptedTexts
            ? buildAdoptedTextsSection(data.feedData.adoptedTexts, lang)
            : '';
        const alignmentSection = buildPoliticalAlignmentSection([...data.votingRecords], [], lang);
        const analysis = buildVotingAnalysis(data.dateFromStr, data.date, data.votingRecords, data.votingPatterns, data.anomalies, data.questions);
        const deepSection = buildDeepAnalysisSection(analysis, lang, 'en');
        const mindmapData = buildVotingMindmap(data.votingRecords, data.votingPatterns, data.anomalies, lang);
        const mindmapSection = buildIntelligenceMindmapSection(mindmapData, lang);
        const swotData = buildVotingSwot(data.votingRecords, data.votingPatterns, data.anomalies, lang);
        const swotSection = buildSwotSection(swotData, lang);
        const hasRealVotingData = data.votingRecords.some((r) => r.result !== PLACEHOLDER_MARKER);
        const dashboardData = hasRealVotingData
            ? buildVotingDashboard(data.votingRecords, data.votingPatterns, data.anomalies, lang)
            : null;
        const dashboardSection = buildDashboardSection(dashboardData, lang);
        // Inject at the explicit <!-- /article-content --> marker so the section
        // stays inside the .article-content styling scope. The marker is always
        // emitted by generateMotionsContent as the last child of that wrapper and
        // is removed from the final HTML during this replacement.
        const injection = adoptedTextsSection +
            (alignmentSection || '') +
            deepSection +
            mindmapSection +
            swotSection +
            dashboardSection;
        if (injection) {
            return base.replace('<!-- /article-content -->', `${injection}\n`);
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
        const { title: baseTitle, subtitle: baseSubtitle } = titleFn(data.date);
        const suffix = lang === 'en' ? buildMotionsTitleSuffix(data) : '';
        const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
        const description = lang === 'en' ? buildMotionsDescription(data) : '';
        const subtitle = description || baseSubtitle;
        return {
            title,
            subtitle,
            keywords: buildMotionsKeywords(data),
            category: ArticleCategory.MOTIONS,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const motionsStrategy = new MotionsStrategy();
//# sourceMappingURL=motions-strategy.js.map