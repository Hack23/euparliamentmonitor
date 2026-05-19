// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/transport/errors
 * @description Typed errors for MCP transport layer.
 */
/**
 * Typed error thrown when the MCP gateway returns 401 (session expired).
 * Callers can detect this with `instanceof MCPSessionExpiredError` to trigger re-authentication.
 */
export class MCPSessionExpiredError extends Error {
    /**
     * Construct a new session-expired error.
     *
     * @param statusText - Raw HTTP status text returned by the gateway with the 401.
     */
    constructor(statusText) {
        super(`MCP session expired (401): ${statusText}`);
        this.name = 'MCPSessionExpiredError';
    }
}
/**
 * Typed error thrown when the MCP gateway returns 429 (rate limited).
 * Carries the parsed `retryAfterMs` delay so callers can honour the back-off period.
 * `retryAfterMs` is 0 when no Retry-After / X-Retry-After header was present.
 */
export class MCPRateLimitError extends Error {
    /** Suggested back-off delay in milliseconds parsed from the gateway response. */
    retryAfterMs;
    /**
     * Construct a new rate-limit error.
     *
     * @param retryAfterMs - Parsed Retry-After delay in ms (0 when no header was present).
     * @param message - Human-readable error message including endpoint and delay.
     */
    constructor(retryAfterMs, message) {
        super(message);
        this.name = 'MCPRateLimitError';
        this.retryAfterMs = retryAfterMs;
    }
}
//# sourceMappingURL=errors.js.map