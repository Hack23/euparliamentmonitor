// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/parse
 * @description JSON payload parsing helpers for EP MCP tool results.
 */

import type { MCPToolResult } from '../../types/index.js';

/**
 * Parse the text payload of an {@link MCPToolResult} as JSON, returning
 * `undefined` when the payload is missing or malformed. Small helper used by
 * the unavailable-envelope detectors below.
 *
 * @param result - Raw MCP tool result
 * @returns Parsed JSON object, or `undefined` if the payload is not a JSON object
 */
export function _parseResultPayload(
  result: MCPToolResult | undefined
): Record<string, unknown> | undefined {
  const text = result?.content?.[0]?.text;
  if (typeof text !== 'string' || text.length === 0) return undefined;
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Detect the "all string fields empty" sentinel emitted by
 * `get_adopted_texts({docId})` for documents that are indexed but whose
 * content has not yet been populated by the EP Open Data Portal. The server
 * returns a JSON-schema-valid response in which every string field is the
 * empty string, which bypasses standard error handling — see upstream issue
 * Hack23/European-Parliament-MCP-Server#369.
 *
 * Only treats a payload as a sentinel when it has at least three string
 * fields (to avoid false positives on intentionally sparse payloads) AND
 * all string fields are the empty string.
 *
 * @param payload - Parsed JSON payload object (or `undefined`)
 * @returns `true` when the payload matches the CONTENT_PENDING sentinel
 */
export function _isEmptyStringSentinel(payload: Record<string, unknown> | undefined): boolean {
  if (!payload) return false;
  let totalStringFields = 0;
  let emptyStringFields = 0;
  for (const value of Object.values(payload)) {
    if (typeof value === 'string') {
      totalStringFields++;
      if (value.length === 0) emptyStringFields++;
    }
  }
  return totalStringFields >= 3 && totalStringFields === emptyStringFields;
}
