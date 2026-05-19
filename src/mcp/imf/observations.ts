// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/imf/observations
 * @description SDMX observation counting and MCP result-wrapping helpers.
 */

import type { MCPToolResult } from '../../types/index.js';
import type { SDMXObservationPayload } from './types.js';

/**
 * Unwrap SDMX localised labels to a plain string.
 *
 * SDMX 3.0 sometimes returns `name`/`description` as a language-keyed
 * object (`{ en: "World Economic Outlook" }`); older payloads return a
 * raw string. Prefer English, fall back to the first available value.
 * @param raw - Raw label value from SDMX API response.
 * @returns Plain string, or empty string when `raw` is empty/undefined.
 */
export function unwrapLocalisedLabel(raw: string | Record<string, string> | undefined): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw['en'] === 'string') return raw['en'];
  for (const v of Object.values(raw)) {
    if (typeof v === 'string') return v;
  }
  return '';
}

/**
 * Wrap a JSON-serialisable value in the canonical MCP tool-result shape.
 * @param payload - Any JSON-serialisable value to embed.
 * @returns MCP tool result with `content[0].type === 'text'`.
 */
export function wrapAsMCPResult(payload: unknown): MCPToolResult {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload ?? null);
  return { content: [{ type: 'text', text }] };
}

/**
 * Count observations in an IMF SDMX-JSON data payload.
 *
 * The IMF API can return observations either directly on a dataset or nested
 * under `data.dataSets[].series[*].observations`.
 *
 * @param payload - Raw JSON string or already-parsed SDMX-JSON payload.
 * @returns Number of observation cells found; `0` for invalid or empty input.
 */
export function countIMFSDMXObservations(payload: string | unknown): number {
  let parsed: unknown = payload;
  if (typeof payload === 'string') {
    if (!payload.trim()) return 0;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return 0;
    }
  }

  const dataSets = (parsed as SDMXObservationPayload | null)?.data?.dataSets;
  if (!Array.isArray(dataSets)) return 0;

  return dataSets.reduce((total, dataSet) => {
    let count = 0;
    if (dataSet.observations && typeof dataSet.observations === 'object') {
      count += Object.keys(dataSet.observations).length;
    }
    if (dataSet.series && typeof dataSet.series === 'object') {
      for (const row of Object.values(dataSet.series)) {
        if (row?.observations && typeof row.observations === 'object') {
          count += Object.keys(row.observations).length;
        }
      }
    }
    return total + count;
  }, 0);
}
