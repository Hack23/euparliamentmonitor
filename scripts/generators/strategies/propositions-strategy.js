// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { escapeHTML } from '../../utils/file-utils.js';
import { PROPOSITIONS_TITLES, PROPOSITIONS_STRINGS, getLocalizedString, } from '../../constants/languages.js';
import { fetchProposalsFromMCP, fetchPipelineFromMCP, fetchProcedureStatusFromMCP, fetchEPFeedData, } from '../pipeline/fetch-stage.js';
import { buildPropositionsContent } from '../propositions-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import { buildPropositionsAnalysis } from '../analysis-builders.js';
/** Keywords shared by all Propositions articles */
const PROPOSITIONS_KEYWORDS = [
    'European Parliament',
    'legislation',
    'proposals',
    'procedure',
    'OLP',
];
/**
 * Build proposals HTML from EP feed data when search_documents returns empty.
 * Uses procedures and adopted texts from the feed as fallback content.
 *
 * @param feedData - EP feed data containing procedures and adopted texts
 * @returns Pre-sanitized HTML for the proposals section
 */
function buildProposalsFromFeed(feedData) {
    const items = [];
    for (const proc of feedData.procedures.slice(0, 8)) {
        items.push(`
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
        items.push(`
      <div class="proposal-card">
        <h3>${escapeHTML(text.title || text.id)}</h3>
        <div class="proposal-meta">
          <span class="proposal-id">${escapeHTML(text.identifier ?? text.id)}</span>
          ${text.date ? `<span class="proposal-date">${escapeHTML(text.date)}</span>` : ''}
        </div>
      </div>`);
    }
    return items.join('\n');
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
        const feedWindowStart = new Date(`${date}T00:00:00Z`);
        feedWindowStart.setUTCDate(feedWindowStart.getUTCDate() - 7);
        const feedWindowStartParts = feedWindowStart.toISOString().split('T');
        if (!feedWindowStartParts[0]) {
            throw new Error('Invalid date format generated for propositions feed window');
        }
        const feedDateRange = { start: feedWindowStartParts[0], end: date };
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
        if (!finalProposalsHtml && feedResult) {
            const hasFeedItems = feedResult.procedures.length > 0 || feedResult.adoptedTexts.length > 0;
            if (hasFeedItems) {
                console.log(`  📰 Building proposals from feed data: ${feedResult.procedures.length} procedures, ${feedResult.adoptedTexts.length} adopted texts`);
                finalProposalsHtml = buildProposalsFromFeed(feedResult);
            }
        }
        if (!finalProposalsHtml) {
            console.log('  ℹ️ No proposals from MCP — pipeline article will be data-free');
        }
        return {
            date,
            proposalsHtml: finalProposalsHtml,
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
        const base = buildPropositionsContent(data.proposalsHtml, data.pipelineData, data.procedureHtml, strings, lang);
        const analysis = buildPropositionsAnalysis(data.proposalsHtml, data.pipelineData, data.date, lang);
        const deepSection = buildDeepAnalysisSection(analysis, lang, 'en');
        // Inject deep analysis before the closing </div> of .article-content
        if (deepSection) {
            const closingTag = '</div>';
            const lastIdx = base.lastIndexOf(closingTag);
            if (lastIdx !== -1) {
                return base.slice(0, lastIdx) + deepSection + '\n' + base.slice(lastIdx);
            }
        }
        return base;
    }
    /**
     * Return language-specific metadata for the propositions article.
     *
     * @param _data - Propositions data payload (unused — metadata is data-independent)
     * @param lang - Target language code
     * @returns Localised metadata
     */
    getMetadata(_data, lang) {
        const titleFn = getLocalizedString(PROPOSITIONS_TITLES, lang);
        const { title, subtitle } = titleFn();
        return {
            title,
            subtitle,
            keywords: [...PROPOSITIONS_KEYWORDS],
            category: ArticleCategory.PROPOSITIONS,
            sources: [],
        };
    }
}
/** Singleton instance for use by the strategy registry */
export const propositionsStrategy = new PropositionsStrategy();
//# sourceMappingURL=propositions-strategy.js.map