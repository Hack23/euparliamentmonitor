// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep-open-data/config
 * @description Module-level constants for the EP Open Data Portal client.
 */

import type { MCPToolResult } from '../../types/index.js';

/** Default base URL for the EP Open Data Portal API v2. */
export const DEFAULT_EP_OPEN_DATA_BASE_URL = 'https://data.europarl.europa.eu/api/v2';

/** Default per-request timeout (milliseconds). */
export const DEFAULT_EP_OPEN_DATA_TIMEOUT_MS = 30_000;

/**
 * Attribution string required by the EP Open Data Portal licence (CC BY 4.0).
 * Appended to every fallback response.
 */
export const EP_OPEN_DATA_ATTRIBUTION =
  'European Parliament Open Data Portal — https://data.europarl.europa.eu — CC BY 4.0';

/**
 * Generic empty-votes fallback payload returned when the portal call cannot
 * produce usable voting data.
 */
export const EMPTY_VOTES_FALLBACK: MCPToolResult = {
  content: [{ type: 'text', text: '{"votes":[]}' }],
};

/** Canonical tool name for EP voting records. */
export const EP_GET_VOTING_RECORDS_TOOL = 'ep-get-voting-records';

/**
 * Virtual tool names exposed by this client.
 */
export const EP_OPEN_DATA_TOOLS: readonly string[] = [EP_GET_VOTING_RECORDS_TOOL];
