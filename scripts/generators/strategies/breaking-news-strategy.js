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
import { loadAnalysisContext, buildAnalysisInsightsSection, extractAnalysisSummary, } from './article-strategy.js';
import { deriveAnalysisOverrides } from '../../utils/parse-analysis-stakeholders.js';
import { truncateTitle, MIN_MEANINGFUL_TITLE_LENGTH } from '../../utils/metadata-utils.js';
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
    // Priority 1: Use the title of the most significant adopted text
    const topAdopted = feedData.adoptedTexts.find((t) => t.title && t.title.length > MIN_MEANINGFUL_TITLE_LENGTH);
    if (topAdopted) {
        const desc = `European Parliament adopts ${topAdopted.title}`;
        return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
    }
    // Priority 2: Use the most significant event title
    const topEvent = feedData.events.find((e) => e.title && e.title.length > MIN_MEANINGFUL_TITLE_LENGTH);
    if (topEvent) {
        const desc = `EP parliamentary event: ${topEvent.title}`;
        return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
    }
    // Priority 3: Use the most significant procedure
    const topProc = feedData.procedures.find((p) => p.title && p.title.length > MIN_MEANINGFUL_TITLE_LENGTH);
    if (topProc) {
        const desc = `EP legislative procedure: ${topProc.title}`;
        return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
    }
    return `European Parliament breaking developments for ${date}.`;
}
/**
 * Build a content-aware title suffix from the most significant feed item.
 * Uses actual legislation/event titles, not data counts.
 *
 * @param feedData - Breaking news feed data (may be undefined)
 * @returns Short analytical suffix, or empty string
 */
function buildBreakingTitleSuffix(feedData) {
    if (!feedData)
        return '';
    // Priority 1: Name the most significant adopted text
    const topAdopted = feedData.adoptedTexts.find((t) => t.title && t.title.length > MIN_MEANINGFUL_TITLE_LENGTH);
    if (topAdopted) {
        return truncateTitle(topAdopted.title);
    }
    // Priority 2: Name the most significant event
    const topEvent = feedData.events.find((e) => e.title && e.title.length > MIN_MEANINGFUL_TITLE_LENGTH);
    if (topEvent) {
        return truncateTitle(topEvent.title);
    }
    // Priority 3: Name the most significant procedure
    const topProc = feedData.procedures.find((p) => p.title && p.title.length > MIN_MEANINGFUL_TITLE_LENGTH);
    if (topProc) {
        return truncateTitle(topProc.title);
    }
    return '';
}
/**
 * Extract a substantive summary from an analysis file if available.
 *
 * @param ctx - Analysis context
 * @param method - Analysis method to look up
 * @param maxLength - Maximum summary length
 * @returns Extracted summary or empty string
 */
function extractAISummaryFromMethod(ctx, method, maxLength) {
    const file = ctx.files.get(method);
    if (!file)
        return '';
    // `extractAnalysisSummary()` already runs `prepareAnalysisBody()` which
    // returns empty for scaffold content and strips non-prose blocks, so no
    // separate `hasSubstantiveAIContent()` pre-check is needed.
    const summary = extractAnalysisSummary(file.content, maxLength);
    return summary.length > 50 ? summary : '';
}
/**
 * Enrich script-generated DeepAnalysis fields with substantive AI analysis
 * content when available.  AI-produced analysis files (deep-analysis,
 * synthesis-summary) contain real political intelligence that should
 * replace generic boilerplate text in the "what", "why", and "outlook" fields.
 *
 * @param analysis - Script-generated DeepAnalysis object
 * @param ctx - Loaded analysis context (may be null)
 * @returns Enriched DeepAnalysis with AI content replacing boilerplate where available
 */
function enrichAnalysisWithAIContent(analysis, ctx) {
    if (!ctx)
        return analysis;
    const aiDeep = extractAISummaryFromMethod(ctx, 'deep-analysis', 800);
    const aiSynth = extractAISummaryFromMethod(ctx, 'synthesis-summary', 600);
    const aiCoalition = extractAISummaryFromMethod(ctx, 'coalition-analysis', 400);
    // Distribute AI content across the deep analysis fields
    const aiWhat = aiDeep || aiSynth;
    const aiWhy = aiDeep && aiSynth ? aiSynth : '';
    return {
        ...analysis,
        what: aiWhat || analysis.what,
        why: aiWhy || analysis.why,
        outlook: aiCoalition || analysis.outlook,
    };
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
        // Load analysis context once for all return paths (graceful: null if absent)
        const analysisContext = loadAnalysisContext(date, 'breaking');
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
                return {
                    date,
                    feedData: fileFeedData,
                    anomalyRaw,
                    coalitionRaw,
                    reportRaw: '',
                    analysisContext,
                };
            }
            console.log('  ⚠️ Pre-fetched feed data failed to load — falling through to MCP fetch');
        }
        if (client) {
            console.log('  📡 Fetching EP feed data (primary) and analytical context...');
        }
        // Step 1: Fetch feed data (PRIMARY news content) — 'one-week' to avoid
        // 404s during EP recess / low-activity periods when 'today' has no data
        const feedData = await fetchBreakingNewsFeedData(client, 'one-week');
        // When client is null, feedData is undefined — MCP unavailable
        if (!feedData) {
            console.log('  ⚠️ MCP unavailable — no feed data or analytical context');
            return {
                date,
                feedData,
                anomalyRaw: '',
                coalitionRaw: '',
                reportRaw: '',
                analysisContext,
            };
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
            return {
                date,
                feedData,
                anomalyRaw: '',
                coalitionRaw: '',
                reportRaw: '',
                analysisContext,
            };
        }
        // Step 2: Fetch analytical context only when at least one feed item is available
        const [anomalyRaw, coalitionRaw] = await Promise.all([
            fetchVotingAnomalies(client),
            fetchCoalitionDynamics(client),
        ]);
        return {
            date,
            feedData,
            anomalyRaw,
            coalitionRaw,
            reportRaw: '',
            analysisContext,
        };
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
        const analysis = buildBreakingAnalysis(data.date, data.feedData, data.anomalyRaw, data.coalitionRaw, lang, deriveAnalysisOverrides(data.analysisContext));
        // Enrich script-generated analysis with AI-produced content when available
        const enriched = enrichAnalysisWithAIContent(analysis, data.analysisContext);
        const deepSection = buildDeepAnalysisSection(enriched, lang);
        const mindmapData = buildBreakingMindmap(data.feedData, lang);
        const mindmapSection = buildIntelligenceMindmapSection(mindmapData, lang);
        const swotData = buildBreakingSwot(data.feedData, data.anomalyRaw, data.coalitionRaw, lang);
        const swotSection = buildSwotSection(swotData, lang);
        const dashboardData = buildBreakingDashboard(data.feedData, lang);
        const dashboardSection = buildDashboardSection(dashboardData, lang);
        const analysisInsights = buildAnalysisInsightsSection(data.analysisContext, [
            'deep-analysis',
            'synthesis-summary',
            'stakeholder-analysis',
            'coalition-analysis',
            'cross-session-intelligence',
            'voting-patterns',
            'risk-matrix',
            'quantitative-swot',
            'significance-classification',
            'political-threat-landscape',
        ], lang);
        const injection = deepSection + mindmapSection + swotSection + dashboardSection + analysisInsights;
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