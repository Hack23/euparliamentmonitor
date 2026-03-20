// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { PROPOSITIONS_TITLES, PROPOSITIONS_STRINGS, getLocalizedString, } from '../../constants/languages.js';
import { computeRollingDateRange, fetchProposalsFromMCP, fetchPipelineFromMCP, fetchProcedureStatusFromMCP, fetchEPFeedData, } from '../pipeline/fetch-stage.js';
import { buildPropositionsContent } from '../propositions-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import { buildPropositionsAnalysis, buildPropositionsSwot, buildPropositionsDashboard, } from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
/**
 * Singular/plural helper for metadata labels.
 *
 * @param n - Count
 * @param singular - Singular form
 * @param plural - Plural form
 * @returns `"N singular"` or `"N plural"`
 */
function pl(n, singular, plural) {
    return `${n} ${n === 1 ? singular : plural}`;
}
/** Base keywords shared by all Propositions articles */
const PROPOSITIONS_BASE_KEYWORDS = [
    'European Parliament',
    'legislation',
    'proposals',
    'procedure',
    'OLP',
];
/**
 * Extract content-aware keywords from propositions data and feed.
 *
 * Adds procedure titles, adopted text titles, and pipeline health
 * indicators to the base keyword set.
 *
 * @param data - Propositions article data payload
 * @returns Deduplicated keyword array
 */
function buildPropositionsKeywords(data) {
    const keywords = [...PROPOSITIONS_BASE_KEYWORDS];
    if (data.feedData?.procedures) {
        for (const proc of data.feedData.procedures.slice(0, 5)) {
            if (proc.title)
                keywords.push(proc.title.slice(0, 60));
        }
    }
    if (data.feedData?.adoptedTexts) {
        for (const text of data.feedData.adoptedTexts.slice(0, 3)) {
            if (text.title)
                keywords.push(text.title.slice(0, 60));
        }
    }
    if (data.pipelineData) {
        keywords.push('legislative pipeline');
        if (data.pipelineData.healthScore >= 0.8)
            keywords.push('healthy pipeline');
    }
    return [...new Set(keywords)];
}
/**
 * Build a content-aware description from propositions data.
 * Summarises pipeline health, procedure counts, and adopted text counts.
 *
 * @param data - Propositions article data payload
 * @returns SEO-friendly description (≤ 200 chars)
 */
function buildPropositionsDescription(data) {
    const parts = [];
    const procCount = data.feedData?.procedures?.length ?? 0;
    const adoptedCount = data.feedData?.adoptedTexts?.length ?? 0;
    // Count proposals by the number of proposal-card divs in the HTML
    const proposalMatches = data.proposalsHtml.match(/proposal-card/gu);
    const proposalCount = proposalMatches ? proposalMatches.length : 0;
    if (proposalCount > 0)
        parts.push(`${proposalCount} active proposals`);
    if (procCount > 0)
        parts.push(`${procCount} procedures tracked`);
    if (adoptedCount > 0)
        parts.push(`${adoptedCount} recently adopted texts`);
    if (data.pipelineData) {
        const healthPct = Math.round(data.pipelineData.healthScore * 100);
        parts.push(`pipeline health ${healthPct}%`);
    }
    if (parts.length === 0) {
        return 'Recent legislative proposals, procedure tracking, and pipeline status in the European Parliament';
    }
    const desc = `EP legislative tracker: ${parts.join(', ')}.`;
    return desc.length > 200 ? desc.slice(0, 197) + '...' : desc;
}
/**
 * Build a content-aware title suffix from propositions data.
 *
 * @param data - Propositions article data payload
 * @returns Short suffix for the title, or empty string
 */
function buildPropositionsTitleSuffix(data) {
    const parts = [];
    const procCount = data.feedData?.procedures?.length ?? 0;
    const adoptedCount = data.feedData?.adoptedTexts?.length ?? 0;
    if (procCount > 0)
        parts.push(pl(procCount, 'Procedure', 'Procedures'));
    if (adoptedCount > 0)
        parts.push(pl(adoptedCount, 'Adopted Text', 'Adopted Texts'));
    if (data.pipelineData && parts.length === 0) {
        const healthPct = Math.round(data.pipelineData.healthScore * 100);
        parts.push(`Pipeline ${healthPct}%`);
    }
    return parts.join(', ');
}
/**
 * Build procedures and adopted-texts HTML separately from EP feed data when
 * search_documents returns empty. Uses procedures and adopted texts from the
 * feed as fallback content, rendering each as a distinct section.
 *
 * @param feedData - EP feed data containing procedures and adopted texts
 * @returns Pre-sanitized HTML for procedures and adopted texts sections separately
 */
function buildProceduresAndAdoptedTextsFromFeed(feedData) {
    const procedureItems = [];
    const adoptedTextItems = [];
    for (const proc of feedData.procedures.slice(0, 8)) {
        procedureItems.push(`
      <div class="proposal-card">
        <h3>${escapeHTML(proc.title || proc.id)}</h3>
        <div class="proposal-meta">
          <span class="proposal-id">${escapeHTML(proc.identifier ?? proc.id)}</span>
          ${proc.date ? `<span class="proposal-date">${escapeHTML(proc.date)}</span>` : ''}
          ${proc.stage ? `<span class="proposal-status">${escapeHTML(proc.stage)}</span>` : ''}
        </div>
      </div>`);
    }
    for (const text of feedData.adoptedTexts.slice(0, 8)) {
        adoptedTextItems.push(`
      <div class="proposal-card">
        <h3>${escapeHTML(text.title || text.id)}</h3>
        <div class="proposal-meta">
          <span class="proposal-id">${escapeHTML(text.identifier ?? text.id)}</span>
          ${text.date ? `<span class="proposal-date">${escapeHTML(text.date)}</span>` : ''}
        </div>
      </div>`);
    }
    return {
        proceduresHtml: procedureItems.join('\n'),
        adoptedTextsHtml: adoptedTextItems.join('\n'),
    };
}
// ─── Strategy implementation ──────────────────────────────────────────────────
/**
 * Article strategy for {@link ArticleCategory.PROPOSITIONS}.
 * Fetches legislative proposals, active pipeline status, and procedure detail
 * then renders a language-specific article.
 */
export class PropositionsStrategy {
    type = ArticleCategory.PROPOSITIONS;
    requiredMCPTools = [
        'search_documents',
        'monitor_legislative_pipeline',
        'track_legislation',
        'get_procedures_feed',
        'get_adopted_texts_feed',
    ];
    /**
     * Fetch legislative proposals and pipeline data in parallel.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated propositions data payload
     */
    async fetchData(client, date) {
        const feedDateRange = computeRollingDateRange(date, 7, 'propositions feed window');
        if (client) {
            console.log('  📡 Fetching legislative data from MCP server...');
        }
        // Fetch proposals, pipeline, and EP feed data in parallel
        const [proposalsResult, pipelineResult, feedData] = await Promise.allSettled([
            fetchProposalsFromMCP(client),
            fetchPipelineFromMCP(client),
            fetchEPFeedData(client, 'one-week', feedDateRange),
        ]);
        const { html: proposalsHtml, firstProcedureId } = proposalsResult.status === 'fulfilled'
            ? proposalsResult.value
            : { html: '', firstProcedureId: '' };
        const pipelineData = pipelineResult.status === 'fulfilled' ? pipelineResult.value : null;
        const feedResult = feedData.status === 'fulfilled' ? feedData.value : undefined;
        const procedureHtml = await fetchProcedureStatusFromMCP(client, firstProcedureId);
        // When search_documents returns empty but feed data has procedures/adopted texts,
        // build proposals HTML from the feed data as fallback
        let finalProposalsHtml = proposalsHtml;
        let finalAdoptedTextsHtml = '';
        if (!finalProposalsHtml && feedResult) {
            const hasFeedItems = feedResult.procedures.length > 0 || feedResult.adoptedTexts.length > 0;
            if (hasFeedItems) {
                console.log(`  📰 Building procedures/adopted-texts from feed data: ${feedResult.procedures.length} procedures, ${feedResult.adoptedTexts.length} adopted texts`);
                const feedHtml = buildProceduresAndAdoptedTextsFromFeed(feedResult);
                finalProposalsHtml = feedHtml.proceduresHtml;
                finalAdoptedTextsHtml = feedHtml.adoptedTextsHtml;
            }
        }
        if (!finalProposalsHtml && !finalAdoptedTextsHtml) {
            console.log('  ℹ️ No proposals from MCP — pipeline article will be data-free');
        }
        return {
            date,
            proposalsHtml: finalProposalsHtml,
            adoptedTextsHtml: finalAdoptedTextsHtml,
            pipelineData,
            procedureHtml,
            feedData: feedResult,
        };
    }
    /**
     * Build the propositions HTML body using language-specific strings.
     *
     * @param data - Propositions data payload
     * @param lang - Target language code
     * @returns Article HTML body
     */
    buildContent(data, lang) {
        const strings = getLocalizedString(PROPOSITIONS_STRINGS, lang);
        const base = buildPropositionsContent(data.proposalsHtml, data.adoptedTextsHtml, data.pipelineData, data.procedureHtml, strings, lang);
        const analysis = buildPropositionsAnalysis(data.proposalsHtml, data.pipelineData, data.date, lang, data.adoptedTextsHtml);
        const deepSection = buildDeepAnalysisSection(analysis, lang, 'en');
        const swotData = buildPropositionsSwot(data.pipelineData, lang);
        const swotSection = buildSwotSection(swotData, lang);
        const dashboardData = buildPropositionsDashboard(data.pipelineData, lang);
        const dashboardSection = buildDashboardSection(dashboardData, lang);
        const injection = deepSection + swotSection + dashboardSection;
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
     * Return language-specific metadata for the propositions article.
     *
     * @param data - Propositions data payload
     * @param lang - Target language code
     * @returns Localised metadata
     */
    getMetadata(data, lang) {
        const titleFn = getLocalizedString(PROPOSITIONS_TITLES, lang);
        const { title: baseTitle, subtitle: baseSubtitle } = titleFn();
        const suffix = lang === 'en' ? buildPropositionsTitleSuffix(data) : '';
        const title = suffix ? `${baseTitle} — ${suffix}` : baseTitle;
        const helperSubtitle = lang === 'en' ? buildPropositionsDescription(data) : '';
        const subtitle = helperSubtitle || baseSubtitle;
        return {
            title,
            subtitle,
            keywords: buildPropositionsKeywords(data),
            category: ArticleCategory.PROPOSITIONS,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const propositionsStrategy = new PropositionsStrategy();
//# sourceMappingURL=propositions-strategy.js.map