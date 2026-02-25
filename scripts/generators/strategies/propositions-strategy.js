// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { PROPOSITIONS_TITLES, PROPOSITIONS_STRINGS, getLocalizedString, } from '../../constants/languages.js';
import { fetchProposalsFromMCP, fetchPipelineFromMCP, fetchProcedureStatusFromMCP, } from '../pipeline/fetch-stage.js';
import { buildPropositionsContent } from '../propositions-content.js';
/** Keywords shared by all Propositions articles */
const PROPOSITIONS_KEYWORDS = [
    'European Parliament',
    'legislation',
    'proposals',
    'procedure',
    'OLP',
];
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
    ];
    /**
     * Fetch legislative proposals and pipeline data in parallel.
     *
     * @param client - MCP client or null
     * @param date - ISO 8601 publication date
     * @returns Populated propositions data payload
     */
    async fetchData(client, date) {
        if (client) {
            console.log('  📡 Fetching legislative data from MCP server...');
        }
        const [proposalsResult, pipelineResult] = await Promise.allSettled([
            fetchProposalsFromMCP(client),
            fetchPipelineFromMCP(client),
        ]);
        const { html: proposalsHtml, firstProcedureId } = proposalsResult.status === 'fulfilled'
            ? proposalsResult.value
            : { html: '', firstProcedureId: '' };
        const pipelineData = pipelineResult.status === 'fulfilled' ? pipelineResult.value : null;
        const procedureHtml = await fetchProcedureStatusFromMCP(client, firstProcedureId);
        if (!proposalsHtml) {
            console.log('  ℹ️ No proposals from MCP — pipeline article will be data-free');
        }
        return { date, proposalsHtml, pipelineData, procedureHtml };
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
        return buildPropositionsContent(data.proposalsHtml, data.pipelineData, data.procedureHtml, strings, lang);
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