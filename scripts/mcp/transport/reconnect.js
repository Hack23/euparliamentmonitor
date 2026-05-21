// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { isRetriableError, RECONNECT_MAX_DELAY_MS } from './retry-policy.js';
// ─── Exported helpers ─────────────────────────────────────────────────────────
/**
 * Reconnect with exponential back-off. Concurrent callers await the same
 * in-flight reconnect promise instead of spawning parallel attempts.
 *
 * @param ops - Reconnect operations adapter from MCPConnection
 * @returns Promise that resolves when reconnection succeeds or all attempts are exhausted
 */
export async function performReconnect(ops) {
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
    }
    finally {
        ops.setReconnectingPromise(null);
    }
}
/**
 * Internal reconnect helper. Waits for an exponential back-off delay then
 * delegates to `connect()`, which handles its own retry loop.
 *
 * @param ops - Reconnect operations adapter
 */
async function doReconnect(ops) {
    const normalizedMax = Math.max(1, ops.maxConnectionAttempts);
    const attemptIndex = Math.min(Math.max(0, ops.getReconnectCount() - 1), normalizedMax - 1);
    const delay = Math.min(ops.connectionRetryDelay * Math.pow(2, attemptIndex), RECONNECT_MAX_DELAY_MS);
    await new Promise((r) => setTimeout(r, delay));
    try {
        ops.setConnected(false);
        await ops.connect();
    }
    catch (error) {
        console.error(`❌ Reconnection to ${ops.serverLabel} failed: ${error instanceof Error ? error.message : String(error)}`);
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
export async function handleRetryAttempt(lastError, attempt, retries, ops) {
    if (lastError.message.toLowerCase().includes('timeout')) {
        ops.setTimeoutCount(ops.getTimeoutCount() + 1);
        console.warn(`⏱️ Request timeout (total: ${ops.getTimeoutCount()}), retrying ${attempt + 1}/${retries}...`);
    }
    else {
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
export async function runWithRetry(name, args, retries, ops) {
    let lastError = new Error(`Failed to call tool '${name}' after ${retries} retries`);
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await ops.callTool(name, args);
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (!isRetriableError(lastError))
                throw lastError;
            if (attempt === retries)
                break;
            await handleRetryAttempt(lastError, attempt, retries, ops);
        }
    }
    throw lastError;
}
//# sourceMappingURL=reconnect.js.map