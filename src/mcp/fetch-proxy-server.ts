// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/FetchProxyServer
 * @description IMF-only MCP fetch-proxy server.
 *
 * Implements the Model Context Protocol (JSON-RPC 2.0 over stdio) with a
 * single tool — `fetch_url` — that proxies HTTPS GET requests to the IMF
 * Data Portal SDMX 3.0 REST API at `https://api.imf.org/external/sdmx/3.0/`.
 *
 * ## Why this exists
 *
 * The Agent Workflow Firewall (AWF) runs a Squid proxy that blocks outbound
 * HTTPS even to allowlisted domains such as `api.imf.org`. This server is
 * mounted as an MCP container in gh-aw workflows; because MCP containers
 * run in a Docker network with direct outbound access (bypassing Squid),
 * `fetch_url` can reach the IMF API while the main runner cannot.
 *
 * The server only allows calls to `https://api.imf.org/external/sdmx/3.0/`
 * — SDMX 2.1 paths and any other URLs are rejected with an error message.
 *
 * ## Authentication
 *
 * The IMF Data Portal API is fronted by Azure API Management and requires
 * a subscription key in the `Ocp-Apim-Subscription-Key` header for every
 * request. The server reads the key from `IMF_API_PRIMARY_KEY` (with
 * `IMF_API_SECONDARY_KEY` as a warm-standby fallback used on `401`/`403`
 * responses to enable zero-downtime key rotation). When neither env var
 * is set, the request is sent unauthenticated and IMF will return `204`
 * (no subscription matched) — useful for diagnosing auth misconfiguration.
 *
 * The header is injected server-side; agent prompts never see the key.
 *
 * ## Usage
 *
 * ```
 * node scripts/mcp/fetch-proxy-server.js
 * ```
 *
 * Or via `node -e <inlined-code>` in the gh-aw `entrypointArgs` (see
 * `.github/workflows/shared/mcp/news-mcp-servers.md`).
 *
 * ## MCP tools exposed
 *
 * - `fetch_url` — fetches an IMF SDMX URL and returns its body as text.
 *
 * @author Hack23 AB
 * @license Apache-2.0
 */

import * as readline from 'node:readline';

// ─── Constants ────────────────────────────────────────────────────────────────

const IMF_ALLOWED_HOSTNAME = 'api.imf.org';
const IMF_ALLOWED_PATH_PREFIX = '/external/sdmx/3.0/';
const IMF_ALLOWED_PROTOCOL = 'https:';

/** Per-request fetch timeout (ms). */
const FETCH_TIMEOUT_MS = 180_000;

/** Product identifier sent to IMF SDMX endpoints. */
const IMF_USER_AGENT = 'euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)';

/** Common headers for IMF SDMX REST requests (auth header added per-request). */
const IMF_REQUEST_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  Accept: 'application/json, application/vnd.sdmx.data+json, */*;q=0.8',
  'User-Agent': IMF_USER_AGENT,
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
});

/** Azure APIM subscription-key header expected by `api.imf.org`. */
const IMF_SUBSCRIPTION_KEY_HEADER = 'Ocp-Apim-Subscription-Key';

// ─── Types ───────────────────────────────────────────────────────────────────

/** JSON-RPC 2.0 request (minimal surface). */
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

/** JSON-RPC 2.0 response (success). */
export interface JsonRpcSuccess {
  jsonrpc: '2.0';
  id: number | string | null;
  result: unknown;
}

/** JSON-RPC 2.0 response (error). */
export interface JsonRpcError {
  jsonrpc: '2.0';
  id: number | string | null;
  error: { code: number; message: string };
}

/** MCP tool-call content item. */
export interface McpContentItem {
  type: 'text';
  text: string;
}

/** MCP tool-call result envelope. */
export interface McpToolResult {
  content: McpContentItem[];
}

// ─── Allowlist check ─────────────────────────────────────────────────────────

/**
 * Returns `true` when `url` is allowed by the IMF-only fetch-proxy policy.
 *
 * Allowed: `https://api.imf.org/external/sdmx/3.0/...` (SDMX 2.1 rejected).
 *
 * @param url - Raw URL string to validate.
 * @returns Whether the URL is permitted.
 */
export function isAllowedImfUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return (
    parsed.protocol === IMF_ALLOWED_PROTOCOL &&
    parsed.hostname === IMF_ALLOWED_HOSTNAME &&
    (parsed.port === '' || parsed.port === '443') &&
    parsed.username === '' &&
    parsed.password === '' &&
    parsed.pathname.startsWith(IMF_ALLOWED_PATH_PREFIX)
  );
}

// ─── Transport helpers ───────────────────────────────────────────────────────

/**
 * Serialize a JSON-RPC response to a newline-terminated string.
 *
 * Uses `String.fromCharCode(10)` instead of `'\n'` so that inlined
 * (minified) versions of this code remain safe in single-quoted strings
 * (the AWF YAML serializer rejects bare newlines in entrypointArgs).
 *
 * @param obj - Serializable object.
 * @returns `JSON.stringify(obj) + '\n'`
 */
export function toWire(obj: unknown): string {
  return JSON.stringify(obj) + String.fromCharCode(10);
}

// ─── MCP handlers ────────────────────────────────────────────────────────────

/**
 * Build a success response for the `initialize` handshake.
 *
 * @param id - Request id to echo.
 * @returns JSON-RPC success with MCP 2024-11-05 capabilities.
 */
export function handleInitialize(id: number | string | null): JsonRpcSuccess {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
    },
  };
}

/**
 * Build the `tools/list` response advertising the single `fetch_url` tool.
 *
 * @param id - Request id to echo.
 * @returns JSON-RPC success with the tool descriptor array.
 */
export function handleToolsList(id: number | string | null): JsonRpcSuccess {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      tools: [
        {
          name: 'fetch_url',
          description: 'Fetch an IMF SDMX URL and return its content',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'IMF SDMX URL to fetch',
              },
            },
            required: ['url'],
          },
        },
      ],
    },
  };
}

/**
 * Read IMF subscription keys from the environment, in priority order.
 *
 * Returns up to two keys: the primary (first attempt) and the secondary
 * (used to retry on `401`/`403` so live key rotation never breaks a run).
 * Empty / unset keys are filtered out so `[]` is returned only when no
 * key is configured at all.
 *
 * @returns Ordered list of candidate API keys (length 0–2).
 * @internal
 */
function readImfSubscriptionKeys(): readonly string[] {
  const candidates = [process.env['IMF_API_PRIMARY_KEY'], process.env['IMF_API_SECONDARY_KEY']];
  const keys: string[] = [];
  for (const k of candidates) {
    if (typeof k === 'string' && k.length > 0 && !keys.includes(k)) {
      keys.push(k);
    }
  }
  return keys;
}

/**
 * Build the request headers for an outbound IMF call. The `Ocp-Apim-Subscription-Key`
 * header is added when a key is supplied; otherwise the request is sent
 * unauthenticated (and IMF will return `204 No Content`).
 *
 * @param key - Subscription key, or `undefined` to send unauthenticated.
 * @returns Plain object suitable for `fetch(..., { headers })`.
 * @internal
 */
function buildImfHeaders(key: string | undefined): Record<string, string> {
  const headers: Record<string, string> = { ...IMF_REQUEST_HEADERS };
  if (key !== undefined && key.length > 0) {
    headers[IMF_SUBSCRIPTION_KEY_HEADER] = key;
  }
  return headers;
}

/**
 * Execute the `fetch_url` tool call.
 *
 * Only URLs matching the IMF SDMX 3.0 allowlist are permitted. Non-matching
 * or malformed URLs receive a JSON-RPC error response; HTTP errors and network
 * failures also surface as errors.
 *
 * The `Ocp-Apim-Subscription-Key` header is injected from `IMF_API_PRIMARY_KEY`
 * (with `IMF_API_SECONDARY_KEY` as a fallback retried once on `401`/`403`).
 *
 * @param id - Request id to echo.
 * @param url - URL to fetch.
 * @param fetchImpl - Injectable `fetch` implementation (defaults to global).
 * @returns JSON-RPC success or error.
 */
export async function handleFetchUrl(
  id: number | string | null,
  url: string | undefined,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<JsonRpcSuccess | JsonRpcError> {
  if (!url || !isAllowedImfUrl(url)) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -1,
        message: `fetch_url only allows ${IMF_ALLOWED_PROTOCOL}//${IMF_ALLOWED_HOSTNAME}${IMF_ALLOWED_PATH_PREFIX} URLs`,
      },
    };
  }

  // Try the primary key, then the secondary key on 401/403 (live rotation).
  // When no keys are configured, fall through to a single unauthenticated
  // attempt so the diagnostic surface (e.g. 204 No Content from IMF) is
  // visible to the caller.
  const keys = readImfSubscriptionKeys();
  const attempts: (string | undefined)[] = keys.length > 0 ? [...keys] : [undefined];

  let lastResponse:
    | { ok: boolean; status: number; statusText: string; text: () => Promise<string> }
    | undefined;
  let lastError: unknown;

  for (let i = 0; i < attempts.length; i += 1) {
    const key = attempts[i];
    try {
      const response = await fetchImpl(url, {
        headers: buildImfHeaders(key),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      lastResponse = response;
      // Retry only on auth-class failures with the next configured key.
      if ((response.status === 401 || response.status === 403) && i + 1 < attempts.length) {
        continue;
      }
      if (!response.ok) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -1, message: `HTTP ${response.status} ${response.statusText}` },
        };
      }
      const text = await response.text();
      return {
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text }] },
      };
    } catch (err) {
      lastError = err;
      // Network errors are not auth-class — do not retry with the secondary
      // key (the IMF endpoint is the same, only the header differs). Clear
      // any HTTP response captured by an earlier attempt so the post-loop
      // branch does not surface a stale 401/403 in place of this thrown
      // error (the caller needs to see the real failure mode).
      lastResponse = undefined;
      break;
    }
  }

  if (lastError !== undefined) {
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    return { jsonrpc: '2.0', id, error: { code: -1, message } };
  }
  if (lastResponse !== undefined && !lastResponse.ok) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -1,
        message: `HTTP ${lastResponse.status} ${lastResponse.statusText}`,
      },
    };
  }
  return {
    jsonrpc: '2.0',
    id,
    error: { code: -1, message: 'fetch_url failed without a response' },
  };
}

// ─── Main server loop ─────────────────────────────────────────────────────────

/**
 * Run the fetch-proxy MCP server, reading JSON-RPC messages from `input` and
 * writing responses to `output`.
 *
 * Does not resolve until the input stream closes.
 *
 * @param input - Readable stream to read JSON-RPC lines from (default: stdin).
 * @param output - Writable stream to write responses to (default: stdout).
 * @param fetchImpl - Injectable fetch (default: global fetch).
 * @returns Promise that resolves when the input stream closes.
 */
export function runServer(
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout,
  fetchImpl: typeof fetch = globalThis.fetch
): Promise<void> {
  const send = (obj: unknown): void => {
    output.write(toWire(obj));
  };

  const rl = readline.createInterface({ input, terminal: false });

  return new Promise((resolve) => {
    rl.on('line', (line: string) => {
      let requestId: number | string | null = null;
      void (async () => {
        try {
          const msg = JSON.parse(line) as JsonRpcRequest;
          requestId = msg.id ?? null;

          if (msg.method === 'initialize') {
            send(handleInitialize(msg.id ?? null));
          } else if (msg.method === 'notifications/initialized') {
            // No-op — notification, no response required.
          } else if (msg.method === 'tools/list') {
            send(handleToolsList(msg.id ?? null));
          } else if (msg.method === 'tools/call') {
            const params = msg.params as
              | { name?: string; arguments?: { url?: string } }
              | undefined;
            if (params?.name === 'fetch_url') {
              const url = params.arguments?.url;
              const result = await handleFetchUrl(msg.id ?? null, url, fetchImpl);
              send(result);
            } else {
              send({
                jsonrpc: '2.0',
                id: msg.id ?? null,
                result: { content: [{ type: 'text', text: 'unknown tool' }] },
              });
            }
          } else {
            send({
              jsonrpc: '2.0',
              id: msg.id ?? null,
              result: { content: [{ type: 'text', text: 'unknown method' }] },
            });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          send({ jsonrpc: '2.0', id: requestId, error: { code: -1, message } });
        }
      })();
    });

    rl.on('close', resolve);
  });
}

// ─── Entry point ─────────────────────────────────────────────────────────────

// Run when executed directly (not imported as a module).
if (
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('fetch-proxy-server.js') ||
    process.argv[1].endsWith('fetch-proxy-server.ts'))
) {
  void runServer();
}
