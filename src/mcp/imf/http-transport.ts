// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/imf/http-transport
 * @description HTTP fetch helpers for IMF SDMX 3.0 client: direct fetch with
 * subscription-key rotation, gateway proxy fallback, and key redaction.
 *
 * Extracted from `client.ts` to keep individual file sizes under 400 LOC.
 * Operates on an explicit {@link IMFHttpContext} adapter rather than `this`.
 */

import { IMF_REQUEST_HEADERS, IMF_SUBSCRIPTION_KEY_HEADER } from './config.js';
import { parseSSEResponse } from '../transport/sse-parser.js';

// ─── Context interface ────────────────────────────────────────────────────────

/**
 * Adapter passed by {@link IMFMCPClient} to HTTP transport helpers.
 * Bundles the fields required for authenticated IMF SDMX 3.0 requests
 * without requiring helpers to reference the client class directly.
 */
export interface IMFHttpContext {
  /** Fully-qualified IMF SDMX base URL (no trailing slash) */
  readonly apiBaseUrl: string;
  /** Per-request timeout in milliseconds */
  readonly timeoutMs: number;
  /** Fetch implementation (allows injection in tests) */
  readonly fetchImpl: typeof fetch;
  /** Optional fetch-proxy gateway URL (bypasses AWF Squid proxy) */
  readonly fetchProxyGatewayUrl: string | undefined;
  /** Optional API key for the fetch-proxy gateway */
  readonly fetchProxyApiKey: string | undefined;
  /** Configured Azure-APIM subscription keys (primary / secondary) */
  readonly imfSubscriptionKeys: readonly string[];
}

// ─── Public helpers ────────────────────────────────────────────────────────────

/**
 * Build a full URL from `path` and GET it as text, applying the configured
 * timeout. Tries the IMF-only MCP fetch-proxy gateway first when configured
 * (bypasses AWF Squid proxy in agentic workflow sandbox), then falls back to
 * direct fetch with subscription-key rotation.
 *
 * @param path - Path (already URL-encoded) to append to the base URL.
 * @param ctx - HTTP context adapter from the client instance.
 * @returns Response body as a string.
 * @throws When the HTTP status is not 2xx, the request times out, or
 *   the network layer raises.
 */
export async function getText(path: string, ctx: IMFHttpContext): Promise<string> {
  const url = `${ctx.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  if (ctx.fetchProxyGatewayUrl) {
    try {
      const result = await fetchViaGateway(url, ctx);
      if (result !== null) return result;
    } catch {
      // Gateway unavailable — fall through to direct fetch
    }
  }

  return fetchDirectWithKeyRotation(url, ctx);
}

/**
 * GET a URL, parse the response body as JSON, and return the typed value.
 *
 * @template T - Narrow response type declared by the caller.
 * @param path - Path to append to the base URL.
 * @param ctx - HTTP context adapter from the client instance.
 * @returns Parsed JSON value.
 * @throws When the response is not JSON, not 2xx, or the request fails.
 */
export async function getJSON<T>(path: string, ctx: IMFHttpContext): Promise<T> {
  const raw = await getText(path, ctx);
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse IMF response as JSON: ${message}`, { cause: error });
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Direct-fetch strategy with subscription-key rotation.
 *
 * Iterates configured `IMF_API_PRIMARY_KEY` → `IMF_API_SECONDARY_KEY`,
 * retrying only on `401`/`403`. Network errors short-circuit immediately.
 *
 * @param url - Fully-qualified IMF SDMX URL.
 * @param ctx - HTTP context adapter.
 * @returns Response body text on success.
 * @throws The last HTTP/network error when all configured keys are exhausted.
 */
export async function fetchDirectWithKeyRotation(url: string, ctx: IMFHttpContext): Promise<string> {
  const attempts: (string | undefined)[] =
    ctx.imfSubscriptionKeys.length > 0 ? [...ctx.imfSubscriptionKeys] : [undefined];
  let lastError: unknown;
  for (let i = 0; i < attempts.length; i += 1) {
    const isLast = i + 1 >= attempts.length;
    const outcome = await fetchOnceWithKey(url, attempts[i], ctx);
    if (outcome.kind === 'ok') return outcome.text;
    lastError = outcome.error;
    if (outcome.kind === 'auth' && !isLast) continue;
    throw outcome.error;
  }
  if (lastError !== undefined) throw lastError;
  throw new Error(`IMF request to ${url} failed without producing a response`);
}

/**
 * Single direct-fetch attempt with one subscription key.
 *
 * @param url - Fully-qualified IMF SDMX URL.
 * @param key - Subscription key for this attempt, or `undefined` to send unauthenticated.
 * @param ctx - HTTP context adapter.
 * @returns `'ok'` with body text, `'auth'` with the 401/403 error, or `'error'` for everything else.
 */
export async function fetchOnceWithKey(
  url: string,
  key: string | undefined,
  ctx: IMFHttpContext
): Promise<{ kind: 'ok'; text: string } | { kind: 'auth' | 'error'; error: Error }> {
  const headers: Record<string, string> = { ...IMF_REQUEST_HEADERS };
  if (key !== undefined && key.length > 0) {
    headers[IMF_SUBSCRIPTION_KEY_HEADER] = key;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ctx.timeoutMs);
  try {
    const response = await ctx.fetchImpl(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    if (response.ok) {
      if (response.status === 204) {
        return {
          kind: 'error',
          error: new Error(
            `HTTP 204 No Content for ${url} — likely missing or invalid ${IMF_SUBSCRIPTION_KEY_HEADER} (set IMF_API_PRIMARY_KEY)`
          ),
        };
      }
      return { kind: 'ok', text: await response.text() };
    }
    const error = redactSubscriptionKeys(
      new Error(`HTTP ${response.status} ${response.statusText} for ${url}`),
      ctx.imfSubscriptionKeys
    );
    const isAuthFailure = response.status === 401 || response.status === 403;
    return { kind: isAuthFailure ? 'auth' : 'error', error };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { kind: 'error', error: redactSubscriptionKeys(error, ctx.imfSubscriptionKeys) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Remove any configured IMF subscription keys from an Error's message and
 * stack so that downstream `console.warn` / fallback envelopes cannot leak
 * the secret even if the underlying fetch implementation embeds request headers
 * in its thrown error.
 *
 * @param error - Error returned by `fetchImpl` or constructed from a non-Error throw.
 * @param keys - IMF subscription keys to redact.
 * @returns A new {@link Error} whose `message` (and `stack` when present) have
 *   each configured subscription key replaced with `[REDACTED]`. Returns the
 *   original error untouched when no keys are configured.
 */
export function redactSubscriptionKeys(error: Error, keys: readonly string[]): Error {
  if (keys.length === 0) return error;
  const redact = (s: string): string => {
    let out = s;
    for (const key of keys) {
      if (!key) continue;
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(escaped, 'g'), '[REDACTED]');
    }
    return out;
  };
  const redacted = new Error(redact(error.message));
  if (error.stack) {
    redacted.stack = redact(error.stack);
  }
  return redacted;
}

/**
 * Fetch a URL via the MCP fetch-proxy gateway (JSON-RPC 2.0 over HTTP).
 * The fetch-proxy server runs in a container that bypasses the AWF Squid proxy.
 *
 * @param url - Fully-qualified URL to fetch.
 * @param ctx - HTTP context adapter.
 * @returns Response text, or null if the gateway call fails.
 */
export async function fetchViaGateway(url: string, ctx: IMFHttpContext): Promise<string | null> {
  const gatewayUrl = ctx.fetchProxyGatewayUrl;
  if (!gatewayUrl) return null;

  const rpcRequest = {
    jsonrpc: '2.0' as const,
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'fetch_url',
      arguments: { url },
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (ctx.fetchProxyApiKey) {
    // Reject CR/LF in the API key to prevent HTTP header injection (mirrors
    // buildAuthorizationHeader in transport/gateway.ts).
    if (/[\r\n]/.test(ctx.fetchProxyApiKey)) {
      console.warn(
        'Invalid IMF fetch-proxy API key: control characters (CR/LF) are not allowed; skipping gateway fallback.'
      );
      return null;
    }
    headers['Authorization'] = `Bearer ${ctx.fetchProxyApiKey}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ctx.timeoutMs);
  try {
    const response = await ctx.fetchImpl(gatewayUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(rpcRequest),
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const body = await response.text();
    // Use the shared SSE parser to extract the first valid JSON-RPC message
    // (matches MCP Streamable HTTP protocol expectation of one response per
    // request). Falls back to plain JSON parsing for non-SSE responses.
    type ProxyResponse = {
      result?: { content?: Array<{ text?: string }> };
      error?: { message?: string };
    };
    const trimmed = body.trimStart();
    let parsed: ProxyResponse | null = null;
    if (trimmed.startsWith('data:') || trimmed.startsWith('event:')) {
      parsed = parseSSEResponse(body) as ProxyResponse | null;
    } else {
      try {
        parsed = JSON.parse(body) as ProxyResponse;
      } catch {
        return null;
      }
    }
    if (!parsed || parsed.error) return null;
    const text = parsed.result?.content?.[0]?.text;
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
