// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/transport/reconnect
 * @description Exponential back-off reconnect loop and tool-call retry logic
 * for MCPConnection.
 *
 * Extracted from `connection.ts` to keep individual file sizes under 400 LOC.
 * Operates on an explicit {@link ReconnectOps} adapter rather than `this`.
 */

import type { MCPToolResult } from '../../types/index.js';
import { isRetriableError, RECONNECT_MAX_DELAY_MS } from './retry-policy.js';

// ─── Context interface ────────────────────────────────────────────────────────

/**
 * Adapter passed by {@link MCPConnection} to reconnect/retry helpers.
 * Exposes the handful of connection fields these helpers need through
 * getter/setter callbacks so the fields remain on the connection class
 * (preserving external observability via `getConnectionHealth()`).
 */
export interface ReconnectOps {
  /** Maximum consecutive connection attempts before giving up */
  readonly maxConnectionAttempts: number;
  /** Base delay (ms) between retry attempts */
  readonly connectionRetryDelay: number;
  /** Human-readable label for log messages */
  readonly serverLabel: string;
  /** Call the underlying MCP tool (used by the retry loop) */
  readonly callTool: (name: string, args: object) => Promise<MCPToolResult>;
  /** Whether the transport is currently connected */
  readonly isConnected: () => boolean;
  /** Trigger a full reconnect cycle */
  readonly connect: () => Promise<void>;
  /** Mark the transport as (dis)connected */
  readonly setConnected: (v: boolean) => void;
  /** Current reconnect-attempt counter */
  readonly getReconnectCount: () => number;
  /** Update the reconnect-attempt counter */
  readonly setReconnectCount: (n: number) => void;
  /** Current in-flight reconnect promise (or null) */
  readonly getReconnectingPromise: () => Promise<void> | null;
  /** Persist or clear the in-flight reconnect promise */
  readonly setReconnectingPromise: (p: Promise<void> | null) => void;
  /** Current cumulative timeout counter */
  readonly getTimeoutCount: () => number;
  /** Update the cumulative timeout counter */
  readonly setTimeoutCount: (n: number) => void;
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

/**
 * Reconnect with exponential back-off. Concurrent callers await the same
 * in-flight reconnect promise instead of spawning parallel attempts.
 *
 * @param ops - Reconnect operations adapter from MCPConnection
 * @returns Promise that resolves when reconnection succeeds or all attempts are exhausted
 */
export async function performReconnect(ops: ReconnectOps): Promise<void> {
  const inflight = ops.getReconnectingPromise();
  if (inflight !== null) {
    return inflight;
  }
  ops.setReconnectCount(ops.getReconnectCount() + 1);
  console.log(`🔄 Reconnecting to ${ops.serverLabel} (attempt ${ops.getReconnectCount()})...`);
  const p = doReconnect(ops);
  ops.setReconnectingPromise(p);
  try {
    await p;
  } finally {
    ops.setReconnectingPromise(null);
  }
}

/**
 * Internal reconnect helper. Waits for an exponential back-off delay then
 * delegates to `connect()`, which handles its own retry loop.
 *
 * @param ops - Reconnect operations adapter
 */
async function doReconnect(ops: ReconnectOps): Promise<void> {
  const normalizedMax = Math.max(1, ops.maxConnectionAttempts);
  const attemptIndex = Math.min(Math.max(0, ops.getReconnectCount() - 1), normalizedMax - 1);
  const delay = Math.min(
    ops.connectionRetryDelay * Math.pow(2, attemptIndex),
    RECONNECT_MAX_DELAY_MS
  );
  await new Promise((r) => setTimeout(r, delay));
  try {
    ops.setConnected(false);
    await ops.connect();
  } catch (error) {
    console.error(
      `❌ Reconnection to ${ops.serverLabel} failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Log a retry warning and, if disconnected, attempt to reconnect before waiting.
 *
 * @param lastError - The error from the failed attempt
 * @param attempt - Zero-based current attempt index
 * @param retries - Total retry count
 * @param ops - Reconnect operations adapter
 * @returns Promise that resolves after logging, optional reconnect, and inter-retry delay
 */
export async function handleRetryAttempt(
  lastError: Error,
  attempt: number,
  retries: number,
  ops: ReconnectOps
): Promise<void> {
  if (lastError.message.toLowerCase().includes('timeout')) {
    ops.setTimeoutCount(ops.getTimeoutCount() + 1);
    console.warn(
      `⏱️ Request timeout (total: ${ops.getTimeoutCount()}), retrying ${attempt + 1}/${retries}...`
    );
  } else {
    console.warn(`⚠️ Request failed, retrying ${attempt + 1}/${retries}: ${lastError.message}`);
  }
  if (!ops.isConnected()) {
    await performReconnect(ops);
  }
  await new Promise((r) => setTimeout(r, ops.connectionRetryDelay * (attempt + 1)));
}

/**
 * Call an MCP tool with automatic retry on timeout or connection loss.
 * Non-retriable errors are re-thrown immediately without consuming retry budget.
 *
 * @param name - Tool name
 * @param args - Tool arguments (plain object, non-null, not an array)
 * @param retries - Maximum number of retries (validated ≥ 0 by caller)
 * @param ops - Reconnect operations adapter
 * @returns Tool execution result
 */
export async function runWithRetry(
  name: string,
  args: object,
  retries: number,
  ops: ReconnectOps
): Promise<MCPToolResult> {
  let lastError: Error = new Error(`Failed to call tool '${name}' after ${retries} retries`);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ops.callTool(name, args);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!isRetriableError(lastError)) throw lastError;
      if (attempt === retries) break;
      await handleRetryAttempt(lastError, attempt, retries, ops);
    }
  }
  throw lastError;
}
