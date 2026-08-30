// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/error-classifier
 * @description Error classification and feed-unavailability detection for EP MCP tools.
 */

import type { MCPToolResult } from '../../types/index.js';
import { _parseResultPayload } from './parse.js';

/**
 * Classify an error message into a diagnostic error category.
 *
 * Maps EP MCP Server v1.4.0 structured error codes and generic HTTP/network
 * errors into one of six broad categories used for logging and retry decisions:
 *
 * Returned categories (priority order):
 * 1. `INTERNAL_ERROR` — EP MCP `INTERNAL_ERROR` (catch-all for DNS, TLS, unclassified upstream failures)
 * 2. `SERVER_ERROR`   — EP MCP `UPSTREAM_500`/`UPSTREAM_503`/`SERVER_ERROR`, or gateway 5xx patterns
 * 3. `TIMEOUT`        — EP MCP `UPSTREAM_TIMEOUT`, or generic "timeout" strings
 * 4. `RATE_LIMIT`     — EP MCP `RATE_LIMITED`, HTTP 429, or "rate limit"/"too many requests" strings
 * 5. `NOT_FOUND`      — EP MCP `UPSTREAM_404`, or generic "404" strings
 * 6. `UNKNOWN`        — everything else
 *
 * @param message - Raw error message
 * @returns Diagnostic error category string
 */
export function classifyToolError(message: string): string {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('internal_error')) {
    return 'INTERNAL_ERROR';
  }
  if (
    lowerMsg.includes('upstream_500') ||
    lowerMsg.includes('upstream_503') ||
    lowerMsg.includes('server_error')
  ) {
    return 'SERVER_ERROR';
  }
  if (lowerMsg.includes('upstream_timeout')) {
    return 'TIMEOUT';
  }
  if (
    lowerMsg.includes('gateway timeout') ||
    lowerMsg.includes('gateway error 500') ||
    lowerMsg.includes('gateway error 502') ||
    lowerMsg.includes('gateway error 503') ||
    lowerMsg.includes('gateway error 504')
  ) {
    return 'SERVER_ERROR';
  }
  if (
    lowerMsg.includes('429') ||
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('too many requests') ||
    lowerMsg.includes('rate_limited')
  ) {
    return 'RATE_LIMIT';
  }
  if (lowerMsg.includes('404') || lowerMsg.includes('upstream_404')) return 'NOT_FOUND';
  if (lowerMsg.includes('timeout')) return 'TIMEOUT';
  return 'UNKNOWN';
}

/**
 * Detect whether an MCP feed result represents an "unavailable" response,
 * covering the two shapes historically emitted by the EP MCP server.
 *
 * 1. **Uniform envelope** (all feeds as of
 *    `european-parliament-mcp-server@1.4.30`) —
 *    `{status:"unavailable", items:[], generatedAt:"..."}` established by
 *    Hack23/European-Parliament-MCP-Server#301 and extended to
 *    `get_events_feed`/`get_procedures_feed` by
 *    Hack23/European-Parliament-MCP-Server#380 (which closed #378).
 * 2. **Pre-v1.2.13 raw upstream 404 shape** (historically emitted pre-v1.2.13 by
 *    `get_events_feed` / `get_procedures_feed`, fixed upstream in PR #380) —
 *    `{"@id":"https://data.europarl.europa.eu/eli/dl/...","error":"404 N..."}`.
 *    Retained purely as defense-in-depth for older pinned server versions or
 *    any future regression of #378, so such payloads do not silently poison
 *    downstream analysis.
 *
 * Returning `true` from this helper lets callers treat both shapes as
 * "known-empty" rather than "success with garbage payload".
 *
 * @param result - Raw MCP tool result
 * @returns `true` when the payload matches either unavailable envelope
 */
export function isFeedUnavailable(result: MCPToolResult | undefined): boolean {
  const envelope = _parseResultPayload(result);
  if (!envelope) return false;

  if (envelope['status'] === 'unavailable') return true;

  const error = envelope['error'];
  const idField = envelope['@id'];
  if (
    typeof error === 'string' &&
    typeof idField === 'string' &&
    idField.startsWith('https://data.europarl.europa.eu/') &&
    error.includes('404')
  ) {
    return true;
  }

  return false;
}

/**
 * Item-count threshold above which a `get_meps_feed` response is treated as an
 * oversized full-census dump rather than a recently-updated delta.
 *
 * The EP MCP server's delta-pagination for `/meps/feed` has a known failure
 * mode (documented in the `get_meps_feed` tool schema and surfaced as an
 * `OVERSIZED_PAYLOAD` entry in `dataQualityWarnings`) where it falls back to a
 * full ~720-MEP census dump (~7–9 MB) instead of the recent-changes window.
 * Such a payload is structurally valid (HTTP 200, parseable JSON) but is
 * effectively useless as a "what changed recently" signal and bloats the
 * agent's prefetch / patch budget. `200` is the server's own documented
 * trigger boundary.
 */
export const MEPS_FEED_OVERSIZED_ITEM_THRESHOLD = 200;

/**
 * Detect whether a `get_meps_feed` response is an oversized full-census dump.
 *
 * Two detection signals (either is sufficient):
 *
 * 1. **Mechanical (primary).** The EP MCP server surfaces an
 *    `OVERSIZED_PAYLOAD` entry in `dataQualityWarnings[]` when the
 *    delta-pagination falls back to a full-census dump (> 200 items). This is
 *    the authoritative, version-stable signal.
 * 2. **Item-count (defense-in-depth).** When the warning is absent (e.g. an
 *    older pinned server build, or a future regression that drops the
 *    warning), a populated `items`/`data` array longer than
 *    {@link MEPS_FEED_OVERSIZED_ITEM_THRESHOLD} is treated as oversized.
 *
 * Returning `true` lets {@link EuropeanParliamentMCPClient.getMEPsFeed} augment
 * the payload with `oversizedPayload: true` and an `OVERSIZED_PAYLOAD: …`
 * `dataQualityWarnings` entry so Stage-A consumers can mechanically detect the
 * condition and fall back to a targeted `get_meps({ active: true, limit: 100 })`
 * roster lookup instead of treating the dump as a fresh delta.
 *
 * @param payload - Parsed `get_meps_feed` payload (or `undefined`)
 * @returns `true` when the response is an oversized full-census dump
 */
export function detectOversizedMEPsFeed(payload: Record<string, unknown> | undefined): boolean {
  if (!payload) return false;

  const rawWarnings = payload['dataQualityWarnings'];
  if (
    Array.isArray(rawWarnings) &&
    rawWarnings.some((w) => typeof w === 'string' && w.includes('OVERSIZED_PAYLOAD'))
  ) {
    return true;
  }

  const rawItems = payload['items'] ?? payload['data'] ?? payload['feed'];
  const items = Array.isArray(rawItems) ? rawItems : [];
  return items.length > MEPS_FEED_OVERSIZED_ITEM_THRESHOLD;
}
