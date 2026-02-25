// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Strategies/ArticleStrategy
 * @description Base interface and shared types for article generation strategies.
 * Each strategy encapsulates the fetch, build, and metadata logic for one
 * {@link ArticleCategory}, making it trivial to add new article types without
 * touching the orchestration layer.
 */

import type { ArticleCategory } from '../../types/index.js';
import type { LanguageCode } from '../../types/index.js';
import type { ArticleSource } from '../../types/index.js';
import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';

/**
 * Minimum payload every strategy must carry: the article's publication date.
 * Strategy-specific data interfaces extend this base.
 */
export interface ArticleData {
  /** ISO 8601 publication date (YYYY-MM-DD) */
  readonly date: string;
}

/**
 * Resolved title, subtitle, keywords, and optional sources for one
 * language version of an article.
 */
export interface ArticleMetadata {
  /** Localized article title */
  readonly title: string;
  /** Localized article subtitle */
  readonly subtitle: string;
  /** SEO keywords */
  readonly keywords: readonly string[];
  /** Article category */
  readonly category: ArticleCategory;
  /** Optional source references */
  readonly sources?: readonly ArticleSource[];
}

/**
 * Strategy interface for article generation.
 *
 * Each concrete implementation handles one {@link ArticleCategory}:
 * - {@link module:Generators/Strategies/WeekAheadStrategy}
 * - {@link module:Generators/Strategies/BreakingNewsStrategy}
 * - {@link module:Generators/Strategies/CommitteeReportsStrategy}
 * - {@link module:Generators/Strategies/PropositionsStrategy}
 * - {@link module:Generators/Strategies/MotionsStrategy}
 *
 * @template TData - Concrete data payload type returned by {@link fetchData}
 */
export interface ArticleStrategy<TData extends ArticleData = ArticleData> {
  /** The article category this strategy handles */
  readonly type: ArticleCategory;
  /** Names of MCP tools this strategy calls */
  readonly requiredMCPTools: readonly string[];
  /**
   * Fetch all domain data needed to render this article type.
   *
   * @param client - Connected MCP client, or null when MCP is unavailable
   * @param date - ISO 8601 publication date (YYYY-MM-DD)
   * @returns Populated article data payload
   */
  fetchData(client: EuropeanParliamentMCPClient | null, date: string): Promise<TData>;
  /**
   * Build the article HTML body for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article body HTML string
   */
  buildContent(data: TData, lang: LanguageCode): string;
  /**
   * Return title, subtitle, keywords, and sources for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article metadata
   */
  getMetadata(data: TData, lang: LanguageCode): ArticleMetadata;
}
