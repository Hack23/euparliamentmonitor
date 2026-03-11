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
import { escapeHTML } from '../../utils/file-utils.js';
import {
  PROPOSITIONS_TITLES,
  PROPOSITIONS_STRINGS,
  getLocalizedString,
} from '../../constants/languages.js';
import {
  computeRollingDateRange,
  fetchProposalsFromMCP,
  fetchPipelineFromMCP,
  fetchProcedureStatusFromMCP,
  fetchEPFeedData,
} from '../pipeline/fetch-stage.js';
import { buildPropositionsContent } from '../propositions-content.js';
import { buildDeepAnalysisSection } from '../deep-analysis-content.js';
import {
  buildPropositionsAnalysis,
  buildPropositionsSwot,
  buildPropositionsDashboard,
} from '../analysis-builders.js';
import { buildSwotSection } from '../swot-content.js';
import { buildDashboardSection } from '../dashboard-content.js';
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

/**
 * Build procedures and adopted-texts HTML separately from EP feed data when
 * search_documents returns empty. Uses procedures and adopted texts from the
 * feed as fallback content, rendering each as a distinct section.
 *
 * @param feedData - EP feed data containing procedures and adopted texts
 * @returns Pre-sanitized HTML for procedures and adopted texts sections separately
 */
function buildProceduresAndAdoptedTextsFromFeed(feedData: EPFeedData): {
  proceduresHtml: string;
  adoptedTextsHtml: string;
} {
  const procedureItems: string[] = [];
  const adoptedTextItems: string[] = [];

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

// ─── Data payload ─────────────────────────────────────────────────────────────

/** Data fetched and pre-processed by {@link PropositionsStrategy} */
export interface PropositionsArticleData extends ArticleData {
  /** Pre-sanitised HTML for the legislative procedures list section */
  readonly proposalsHtml: string;
  /** Pre-sanitised HTML for the recently adopted texts section */
  readonly adoptedTextsHtml: string;
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

    const { html: proposalsHtml, firstProcedureId } =
      proposalsResult.status === 'fulfilled'
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
        console.log(
          `  📰 Building procedures/adopted-texts from feed data: ${feedResult.procedures.length} procedures, ${feedResult.adoptedTexts.length} adopted texts`
        );
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
  buildContent(data: PropositionsArticleData, lang: LanguageCode): string {
    const strings = getLocalizedString(PROPOSITIONS_STRINGS, lang);
    const base = buildPropositionsContent(
      data.proposalsHtml,
      data.adoptedTextsHtml,
      data.pipelineData,
      data.procedureHtml,
      strings,
      lang
    );
    const analysis = buildPropositionsAnalysis(
      data.proposalsHtml,
      data.pipelineData,
      data.date,
      lang
    );
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
