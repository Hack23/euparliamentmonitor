// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/transport/retry-policy
 * @description Retry-policy helpers, back-off constants, and Retry-After header parsing.
 */
import { MCPSessionExpiredError, MCPRateLimitError } from './errors.js';
/** Maximum reconnect back-off delay in milliseconds */
export const RECONNECT_MAX_DELAY_MS = 30000;
/** HTTP header for API rate-limit retry delay */
export const RETRY_AFTER_HEADER = 'X-Retry-After';
/** Log prefix for rate-limit warnings */
export const RATE_LIMIT_MSG = 'Rate limited. Retry after';
/**
 * Parse a `Retry-After` or `X-Retry-After` header value into milliseconds.
 * Accepts delta-seconds ("30"), numeric-with-suffix ("30s"), or an HTTP-date string.
 * Returns 0 when the value is empty or unparseable.
 *
 * @param retryAfter - Raw Retry-After / X-Retry-After header value
 * @returns Delay in milliseconds, or 0 if the value cannot be parsed
 */
export function parseRetryAfterMs(retryAfter) {
    const normalized = retryAfter.trim().replace(/s$/i, '');
    if (!normalized)
        return 0;
    const numericDelay = Number(normalized);
    if (!Number.isNaN(numericDelay))
        return numericDelay * 1000;
    const retryDate = new Date(retryAfter);
    if (!Number.isNaN(retryDate.getTime())) {
        return Math.max(0, retryDate.getTime() - Date.now());
    }
    return 0;
}
/**
 * Returns true only for transient, retriable failures: request timeouts,
 * network-level connection-closed/reset errors, "not connected" states,
 * and transient HTTP gateway errors (502, 503, 504).
 *
 * Uses an allow-list of known transient error patterns so that unknown or
 * server-level errors (e.g., tool runtime failures) are NOT retried:
 * - timeout — AbortSignal timeout or custom timeout message
 * - connection closed / reset / refused — network-level transport failures
 * - not connected — local "not yet connected" guard error
 * - socket hang up — Node.js HTTP socket-level disconnection
 * - gateway error 502/503/504 — transient upstream server errors
 *
 * Everything else (MCPSessionExpiredError, TypeError, rate-limit errors,
 * unknown errors) returns false so `callToolWithRetry` surfaces them immediately.
 *
 * @param error - The caught error to classify
 * @returns `true` if the error is safe to retry
 */
export function isRetriableError(error) {
    if (error instanceof MCPSessionExpiredError || error instanceof TypeError) {
        return false;
    }
    const msg = error.message?.toLowerCase() ?? '';
    if (error instanceof MCPRateLimitError || msg.startsWith(RATE_LIMIT_MSG.toLowerCase())) {
        return false;
    }
    return (msg.includes('timeout') ||
        msg.includes('connection closed') ||
        msg.includes('connection reset') ||
        msg.includes('not connected') ||
        msg.includes('econnreset') ||
        msg.includes('econnrefused') ||
        msg.includes('socket hang up') ||
        msg.includes('gateway error 502') ||
        msg.includes('gateway error 503') ||
        msg.includes('gateway error 504'));
}
/**
 * Parse a `Retry-After` or `X-Retry-After` header value (which may be either a
 * delay-in-seconds number, a numeric string with an optional trailing "s" suffix
 * (e.g. "30s"), or an HTTP-date string) into a human-readable message.
 *
 * @param retryAfter - Raw header value
 * @returns Formatted string describing the delay (e.g. "30s" or "45s (until Thu, 01 Jan 2026 …)")
 */
export function formatRetryAfter(retryAfter) {
    const normalized = retryAfter.trim().replace(/s$/i, '');
    if (!normalized) {
        return retryAfter;
    }
    const numericDelay = Number(normalized);
    if (!Number.isNaN(numericDelay)) {
        return `${numericDelay}s`;
    }
    const retryDate = new Date(retryAfter);
    if (Number.isNaN(retryDate.getTime())) {
        return retryAfter;
    }
    const delayMs = retryDate.getTime() - Date.now();
    if (delayMs > 0) {
        const delaySeconds = Math.ceil(delayMs / 1000);
        return `${delaySeconds}s (until ${retryDate.toUTCString()})`;
    }
    return retryDate.toUTCString();
}
//# sourceMappingURL=retry-policy.js.map