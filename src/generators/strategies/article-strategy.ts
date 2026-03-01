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
 * Non-generic base interface for {@link ArticleStrategy} used by the strategy
 * registry.  Expresses the common operations with {@link ArticleData} as the
 * data payload type so that concrete strategies parameterised on a subtype can
 * be stored in a single {@link StrategyRegistry} map without unsafe casts.
 *
 * This interface deliberately relies on TypeScript's bivariant method-parameter
 * checking: a concrete strategy whose methods accept a narrower `TData`
 * (extending {@link ArticleData}) still satisfies this interface structurally.
 * That means the type is not fully sound — a caller that only sees
 * {@link ArticleStrategyBase} could, in principle, pass an {@link ArticleData}
 * value that does not match the concrete strategy's expected `TData` shape.
 *
 * To use this interface safely:
 * - Only pass the `data` object returned by a given strategy's own
 *   {@link ArticleStrategyBase.fetchData | fetchData} to that same strategy's
 *   {@link ArticleStrategyBase.buildContent | buildContent} and
 *   {@link ArticleStrategyBase.getMetadata | getMetadata} methods.
 * - Never mix data payloads between different strategies, even if they share
 *   the {@link ArticleData} base type.
 *
 * External callers that need strong typing for a specific strategy should
 * prefer the generic {@link ArticleStrategy} interface, which preserves the
 * concrete `TData` type and avoids this intentional unsoundness. The
 * {@link ArticleStrategyBase} interface is intended primarily for the internal
 * orchestration / pipeline layer that manages a heterogeneous strategy
 * registry.
 */
export interface ArticleStrategyBase {
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
  fetchData(client: EuropeanParliamentMCPClient | null, date: string): Promise<ArticleData>;
  /**
   * Build the article HTML body for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article body HTML string
   */
  buildContent(data: ArticleData, lang: LanguageCode): string;
  /**
   * Return title, subtitle, keywords, and sources for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article metadata
   */
  getMetadata(data: ArticleData, lang: LanguageCode): ArticleMetadata;
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
export interface ArticleStrategy<
  TData extends ArticleData = ArticleData,
> extends ArticleStrategyBase {
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
