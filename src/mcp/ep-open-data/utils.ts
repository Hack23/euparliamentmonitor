// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep-open-data/utils
 * @description Internal helper utilities for the EP Open Data Portal client.
 */

import type { MCPToolResult } from '../../types/index.js';
import type { EPDecisionRecord } from './types.js';

/**
 * Unwrap a multilingual JSON-LD label to a plain string.
 * Prefers the English value; falls back to the first available string value.
 * @param raw - Raw label value from the EP Open Data response.
 * @returns Plain string, or empty string when `raw` is empty/undefined.
 * @internal
 */
export function unwrapLabel(raw: string | Record<string, string> | undefined): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw['en'] === 'string') return raw['en'];
  for (const v of Object.values(raw)) {
    if (typeof v === 'string') return v;
  }
  return '';
}

/**
 * Wrap a value in the canonical MCP tool-result shape.
 * @param payload - Any JSON-serialisable value to embed.
 * @returns MCP tool result with `content[0].type === 'text'`.
 * @internal
 */
export function wrapAsMCPResult(payload: unknown): MCPToolResult {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload ?? null);
  return { content: [{ type: 'text', text }] };
}

/**
 * Extract an identifier from an EP decision record.
 * @param record - EP decision record from the Open Data Portal.
 * @returns The `identifier` field, or the final path segment of `@id`, or empty string.
 * @internal
 */
export function extractIdentifier(record: EPDecisionRecord): string {
  if (record.identifier) return record.identifier;
  const rawId = record['@id'] ?? '';
  if (!rawId) return '';
  const lastSlash = rawId.lastIndexOf('/');
  return lastSlash >= 0 ? rawId.slice(lastSlash + 1) : rawId;
}
