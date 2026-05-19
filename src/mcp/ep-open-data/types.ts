// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep-open-data/types
 * @description TypeScript interfaces for the EP Open Data Portal client.
 */

import type { MCPToolResult, MCPClientOptions } from '../../types/index.js';

export interface EPDecisionRecord {
  identifier?: string;
  date?: string;
  activityType?: string;
  prefLabel?: string | Record<string, string>;
  favorable?: number;
  against?: number;
  abstention?: number;
  /** Raw @id URI (used when `identifier` is absent). */
  '@id'?: string;
}

export interface EPDecisionResponse {
  data?: EPDecisionRecord[];
}

/**
 * Source tag for a voting-records result.
 * - `"mcp"` — the EP MCP server returned non-empty data.
 * - `"ep-open-data-portal"` — MCP was empty; the fallback portal query succeeded.
 * - `"unavailable"` — both sources returned empty; a `🔴` marker was emitted.
 */
export type VotingDataSource = 'mcp' | 'ep-open-data-portal' | 'unavailable';

/**
 * Result envelope from {@link getVotingRecordsWithFallback}.
 */
export interface VotingRecordsFallbackResult {
  /** MCP-shaped voting records (or 🔴 marker when unavailable). */
  result: MCPToolResult;
  /** Which source delivered the data. */
  source: VotingDataSource;
  /**
   * Human-readable freshness string for the `voting-data-freshness` audit row.
   */
  freshnessLabel: string;
}

/**
 * Options for {@link getVotingRecordsWithFallback} and
 * {@link EPOpenDataClient.getVotingRecords}.
 */
export interface VotingRecordsFallbackOptions extends MCPClientOptions {
  /** Inclusive start date (YYYY-MM-DD). */
  dateFrom: string;
  /** Inclusive end date (YYYY-MM-DD). */
  dateTo: string;
  /** Maximum records to return (default 50). */
  limit?: number;
  /** Pagination offset (default 0). */
  offset?: number;
  /** Optional `fetch` implementation injection for testing. */
  fetchImpl?: typeof fetch;
  /** Override the EP Open Data base URL. */
  apiBaseUrl?: string;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number;
}
