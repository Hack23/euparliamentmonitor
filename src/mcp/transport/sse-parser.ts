// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/transport/sse-parser
 * @description Server-Sent Events parser for MCP Streamable HTTP responses.
 */

import type { JSONRPCResponse } from '../../types/index.js';

/**
 * Parse an SSE (Server-Sent Events) response body to extract the first valid JSON-RPC message.
 *
 * The MCP Streamable HTTP protocol sends JSON-RPC responses as SSE `data:` lines.
 * This function returns the **first** successfully parsed JSON-RPC message; any
 * subsequent `data:` lines are ignored. This matches the MCP protocol expectation
 * of one JSON-RPC response per HTTP request/response cycle.
 *
 * @param body - Raw SSE response text (may contain multiple lines including `event:` and `data:`)
 * @returns The first valid JSON-RPC response found, or null if no valid message exists
 */
export function parseSSEResponse(body: string): JSONRPCResponse | null {
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr) {
        try {
          return JSON.parse(jsonStr) as JSONRPCResponse;
        } catch {
          // Continue to next data line
        }
      }
    }
  }
  return null;
}
