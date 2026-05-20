// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { MCPSessionExpiredError, MCPRateLimitError } from './errors.js';
import { parseRetryAfterMs, formatRetryAfter, RETRY_AFTER_HEADER, RATE_LIMIT_MSG, } from './retry-policy.js';
import { parseSSEResponse } from './sse-parser.js';
/** Default request timeout in milliseconds (EU Parliament APIs can take 30-120+ s). */
const DEFAULT_REQUEST_TIMEOUT_MS = 180_000;
/**
 * Effective request timeout, configurable via `EP_REQUEST_TIMEOUT_MS` env var.
 */
export const GATEWAY_REQUEST_TIMEOUT_MS = (() => {
    const envVal = process.env['EP_REQUEST_TIMEOUT_MS'];
    if (envVal) {
        const parsed = Number(envVal);
        if (!Number.isNaN(parsed) && parsed > 0)
            return parsed;
    }
    return DEFAULT_REQUEST_TIMEOUT_MS;
})();
/**
 * Validate a gateway response body, throwing on JSON-RPC errors.
 *
 * @param contentType - Response content-type header
 * @param body - Raw response body text
 */
export function validateGatewayResponseBody(contentType, body) {
    if (contentType.includes('text/event-stream')) {
        const parsed = parseSSEResponse(body);
        if (parsed?.error) {
            throw new Error(parsed.error.message ?? 'MCP gateway initialization error');
        }
        return;
    }
    if (!body) {
        return;
    }
    try {
        const jsonResponse = JSON.parse(body);
        if (jsonResponse.error) {
            throw new Error(jsonResponse.error.message ?? 'MCP gateway initialization error');
        }
    }
    catch (e) {
        if (e instanceof SyntaxError) {
            // Non-JSON body — not a protocol error, safe to ignore
            return;
        }
        throw e;
    }
}
/**
 * Build the Authorization header value for gateway requests.
 *
 * Keys that already contain a valid RFC 7235 scheme token followed by
 * whitespace (e.g. "Bearer …", "Token …", "AWS4-HMAC-SHA256 …") are passed
 * through unchanged. Otherwise the raw key is sent directly unless
 * `EP_MCP_GATEWAY_AUTH_SCHEME` is set to a valid token, in which case that
 * scheme prefix is prepended. The EP MCP gateway expects raw-token auth by
 * default (no "Bearer " prefix).
 *
 * @param apiKey - Raw or pre-prefixed gateway API key
 * @returns Authorization header value, or empty string for empty keys
 * @throws {Error} When the API key contains CR or LF (header injection risk)
 */
export function buildAuthorizationHeader(apiKey) {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
        return '';
    }
    if (/[\r\n]/.test(trimmedKey)) {
        throw new Error('Invalid gateway API key: control characters (CR/LF) are not allowed in Authorization header values.');
    }
    const tokenRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    const firstSpaceIndex = trimmedKey.indexOf(' ');
    if (firstSpaceIndex > 0) {
        const possibleScheme = trimmedKey.slice(0, firstSpaceIndex);
        if (tokenRegex.test(possibleScheme)) {
            return trimmedKey;
        }
    }
    const rawScheme = typeof process !== 'undefined' && process.env?.['EP_MCP_GATEWAY_AUTH_SCHEME'];
    const scheme = typeof rawScheme === 'string' ? rawScheme.trim() : '';
    if (scheme && tokenRegex.test(scheme)) {
        return `${scheme} ${trimmedKey}`;
    }
    return trimmedKey;
}
/**
 * Throw an appropriate error for a non-OK gateway response. Extracted to
 * keep `sendGatewayRequest`'s cognitive complexity manageable.
 *
 * @param response - The non-OK fetch Response
 * @param ctx - Gateway context (used to clear session on 401)
 */
export function throwGatewayResponseError(response, ctx) {
    if (response.status === 401) {
        ctx.setMcpSessionId(null);
        ctx.setConnected(false);
        throw new MCPSessionExpiredError(response.statusText);
    }
    if (response.status === 429) {
        const rawRetryAfter = response.headers.get(RETRY_AFTER_HEADER) ?? response.headers.get('Retry-After');
        const retryAfter = (rawRetryAfter ?? '').trim();
        if (retryAfter !== '') {
            const retryMessage = formatRetryAfter(retryAfter);
            const retryAfterMs = parseRetryAfterMs(retryAfter);
            console.warn(`⏳ ${RATE_LIMIT_MSG} ${retryMessage}`);
            throw new MCPRateLimitError(retryAfterMs, `${RATE_LIMIT_MSG} ${retryMessage}`);
        }
        const statusText = response.statusText || 'Too Many Requests';
        throw new MCPRateLimitError(0, `${RATE_LIMIT_MSG} (status ${response.status} ${statusText}; ${RETRY_AFTER_HEADER}/Retry-After header missing)`);
    }
    throw new Error(`Gateway error ${response.status}: ${response.statusText}`);
}
/**
 * Attempt a single connection via MCP Gateway (HTTP transport).
 *
 * @param ctx - Gateway context adapter from MCPConnection
 */
export async function attemptGatewayConnection(ctx) {
    if (!ctx.gatewayUrl) {
        throw new Error('Gateway URL not configured. Set the EP_MCP_GATEWAY_URL environment variable or provide the gatewayUrl constructor option.');
    }
    try {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
        };
        if (ctx.gatewayApiKey) {
            headers['Authorization'] = buildAuthorizationHeader(ctx.gatewayApiKey);
        }
        const initRequest = {
            jsonrpc: '2.0',
            id: ctx.nextRequestId(),
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'ep-mcp-client', version: '1.0.0' },
            },
        };
        const response = await fetch(ctx.gatewayUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(initRequest),
            signal: AbortSignal.timeout(GATEWAY_REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) {
            throwGatewayResponseError(response, ctx);
        }
        const sessionId = response.headers.get('mcp-session-id');
        if (sessionId) {
            ctx.setMcpSessionId(sessionId);
        }
        const contentType = response.headers.get('content-type') ?? '';
        const body = await response.text();
        validateGatewayResponseBody(contentType, body);
        ctx.setConnected(true);
        console.log(`✅ Connected to ${ctx.serverLabel} via gateway`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Failed to connect to MCP gateway:', message);
        throw error;
    }
}
/**
 * Send a request via MCP Gateway (HTTP transport).
 *
 * @param method - RPC method name
 * @param params - Method parameters
 * @param ctx - Gateway context adapter
 * @returns Server result payload
 */
export async function sendGatewayRequest(method, params, ctx) {
    if (!ctx.gatewayUrl) {
        throw new Error('Gateway URL not configured. Set EP_MCP_GATEWAY_URL or provide gatewayUrl in MCP client options.');
    }
    const id = ctx.nextRequestId();
    const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
    };
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
    };
    if (ctx.gatewayApiKey) {
        headers['Authorization'] = buildAuthorizationHeader(ctx.gatewayApiKey);
    }
    const sid = ctx.getMcpSessionId();
    if (sid) {
        headers['Mcp-Session-Id'] = sid;
    }
    const response = await fetch(ctx.gatewayUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(GATEWAY_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
        throwGatewayResponseError(response, ctx);
    }
    const sessionId = response.headers.get('mcp-session-id');
    if (sessionId) {
        ctx.setMcpSessionId(sessionId);
    }
    const contentType = response.headers.get('content-type') ?? '';
    const body = await response.text();
    if (contentType.includes('text/event-stream')) {
        const parsed = parseSSEResponse(body);
        if (!parsed) {
            throw new Error('Failed to parse SSE response from gateway');
        }
        if (parsed.error) {
            throw new Error(parsed.error.message ?? 'MCP gateway error');
        }
        return parsed.result;
    }
    const jsonResponse = JSON.parse(body);
    if (jsonResponse.error) {
        throw new Error(jsonResponse.error.message ?? 'MCP gateway error');
    }
    return jsonResponse.result;
}
//# sourceMappingURL=gateway.js.map