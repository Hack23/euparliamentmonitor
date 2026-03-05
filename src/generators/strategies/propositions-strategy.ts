// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/PropositionsStrategy
 * @description Article strategy for the Propositions article type.
 * Fetches legislative proposals and active pipeline data from MCP, then
 * renders a language-specific legislative overview article.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type { LanguageCode, EPFeedData } from '../../types/index.js';
import {
  PROPOSITIONS_TITLES,
  PROPOSITIONS_STRINGS,
  getLocalizedString,
} from '../../constants/languages.js';
import {
  fetchProposalsFromMCP,
  fetchPipelineFromMCP,
  fetchProcedureStatusFromMCP,
  fetchEPFeedData,
} from '../pipeline/fetch-stage.js';
import { buildPropositionsContent } from '../propositions-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import { buildPropositionsAnalysis } from '../analysis-builders.js';
import type { PipelineData } from '../propositions-content.js';
import type { ArticleStrategy, ArticleData, ArticleMetadata } from './article-strategy.js';

/** Keywords shared by all Propositions articles */
const PROPOSITIONS_KEYWORDS = [
  'European Parliament',
  'legislation',
  'proposals',
  'procedure',
  'OLP',
] as const;

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link PropositionsStrategy} */
export interface PropositionsArticleData extends ArticleData {
  /** Pre-sanitised HTML for the proposals list section */
  readonly proposalsHtml: string;
  /** Active legislative pipeline data (null when MCP unavailable) */
  readonly pipelineData: PipelineData | null;
  /** Pre-sanitised HTML for the tracked procedure section */
  readonly procedureHtml: string;
  /** EP feed data for enrichment (when available) */
  readonly feedData?: EPFeedData;
}

// ─── Strategy implementation ──────────────────────────────────────────────────

/**
 * Article strategy for {@link ArticleCategory.PROPOSITIONS}.
 * Fetches legislative proposals, active pipeline status, and procedure detail
 * then renders a language-specific article.
 */
export class PropositionsStrategy implements ArticleStrategy<PropositionsArticleData> {
  readonly type = ArticleCategory.PROPOSITIONS;

  readonly requiredMCPTools = [
    'search_documents',
    'monitor_legislative_pipeline',
    'track_legislation',
    'get_procedures_feed',
    'get_adopted_texts_feed',
  ] as const;

  /**
   * Fetch legislative proposals and pipeline data in parallel.
   *
   * @param client - MCP client or null
   * @param date - ISO 8601 publication date
   * @returns Populated propositions data payload
   */
  async fetchData(
    client: EuropeanParliamentMCPClient | null,
    date: string
  ): Promise<PropositionsArticleData> {
    if (client) {
      console.log('  📡 Fetching legislative data from MCP server...');
    }

    // Fetch proposals, pipeline, and EP feed data in parallel
    const [proposalsResult, pipelineResult, feedData] = await Promise.allSettled([
      fetchProposalsFromMCP(client),
      fetchPipelineFromMCP(client),
      fetchEPFeedData(client, 'one-month'),
    ]);

    const { html: proposalsHtml, firstProcedureId } =
      proposalsResult.status === 'fulfilled'
        ? proposalsResult.value
        : { html: '', firstProcedureId: '' };

    const pipelineData = pipelineResult.status === 'fulfilled' ? pipelineResult.value : null;
    const feedResult = feedData.status === 'fulfilled' ? feedData.value : undefined;

    const procedureHtml = await fetchProcedureStatusFromMCP(client, firstProcedureId);

    if (!proposalsHtml) {
      console.log('  ℹ️ No proposals from MCP — pipeline article will be data-free');
    }

    return { date, proposalsHtml, pipelineData, procedureHtml, feedData: feedResult };
  }

  /**
   * Build the propositions HTML body using language-specific strings.
   *
   * @param data - Propositions data payload
   * @param lang - Target language code
   * @returns Article HTML body
   */
  buildContent(data: PropositionsArticleData, lang: LanguageCode): string {
    const strings = getLocalizedString(PROPOSITIONS_STRINGS, lang);
    const base = buildPropositionsContent(
      data.proposalsHtml,
      data.pipelineData,
      data.procedureHtml,
      strings,
      lang
    );
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
  getMetadata(_data: PropositionsArticleData, lang: LanguageCode): ArticleMetadata {
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
