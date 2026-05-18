// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/MCP/EPFeeds
 * @description EP API v2 *feed* endpoint option shapes — distinct from the
 * one-shot tool calls in {@link ./ep-tools.ts} because feeds share a base
 * `timeframe` / `startDate` window contract and split between
 * sliding-window and fixed-window subtypes.
 */

/**
 * Allowed timeframe values for EP API v2 feed endpoints.
 * Controls how far back the feed looks for recently updated items.
 */
export type FeedTimeframe = 'today' | 'one-day' | 'one-week' | 'one-month' | 'custom';

/**
 * Options accepted by the fixed-window EP API v2 feed endpoints
 * (`documents`, `plenary_documents`, `committee_documents`,
 * `plenary_session_documents`, `parliamentary_questions`,
 * `corporate_bodies`, `controlled_vocabularies`).
 *
 * These feeds serve a server-defined window. Historically (pre-v1.2.13) they
 * rejected `timeframe`/`startDate` with `INVALID_PARAMS`
 * (Hack23/European-Parliament-MCP-Server#377); as of
 * `european-parliament-mcp-server@1.2.15` (PR #379) the server silently
 * ignores those params on fixed-window tools. The client continues to omit
 * them so intent matches behaviour and so we remain compatible with any
 * older pinned server version in downstream environments.
 */
export interface FixedWindowFeedOptions {
  /** Maximum number of results to return */
  limit?: number | undefined;
  /** Pagination offset */
  offset?: number | undefined;
}

/**
 * Common options shared by the sliding-window EP API v2 feed endpoints
 * (`meps`, `events`, `procedures`, `adopted_texts`, `mep_declarations`,
 * `external_documents`). Accepts `timeframe` and `startDate` in addition to
 * the pagination options inherited from {@link FixedWindowFeedOptions}.
 */
export interface FeedBaseOptions extends FixedWindowFeedOptions {
  /** How far back to look for recently-updated items (default: `'one-day'`) */
  timeframe?: FeedTimeframe | undefined;
  /** Explicit start date (YYYY-MM-DD) — overrides `timeframe` when specified */
  startDate?: string | undefined;
}

/** Options for getMEPsFeed */
export interface GetMEPsFeedOptions extends FeedBaseOptions {}

/** Options for getEventsFeed */
export interface GetEventsFeedOptions extends FeedBaseOptions {
  /** Filter by activity type */
  activityType?: string | undefined;
}

/** Options for getProceduresFeed */
export interface GetProceduresFeedOptions extends FeedBaseOptions {
  /** Filter by process type */
  processType?: string | undefined;
}

/** Options for getAdoptedTextsFeed */
export interface GetAdoptedTextsFeedOptions extends FeedBaseOptions {
  /** Filter by work type */
  workType?: string | undefined;
}

/** Options for getMEPDeclarationsFeed */
export interface GetMEPDeclarationsFeedOptions extends FeedBaseOptions {
  /** Filter by work type */
  workType?: string | undefined;
}

/** Options for getDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getPlenaryDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetPlenaryDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getCommitteeDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetCommitteeDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getPlenarySessionDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetPlenarySessionDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getExternalDocumentsFeed */
export interface GetExternalDocumentsFeedOptions extends FeedBaseOptions {
  /** Filter by work type */
  workType?: string | undefined;
}

/** Options for getParliamentaryQuestionsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetParliamentaryQuestionsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getCorporateBodiesFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetCorporateBodiesFeedOptions extends FixedWindowFeedOptions {}

/** Options for getControlledVocabulariesFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetControlledVocabulariesFeedOptions extends FixedWindowFeedOptions {}
