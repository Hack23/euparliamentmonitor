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
const IMF_REQUEST_HEADERS = Object.freeze({
    Accept: 'application/json, application/vnd.sdmx.data+json, */*;q=0.8',
    'User-Agent': IMF_USER_AGENT,
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
});
/** Azure APIM subscription-key header expected by `api.imf.org`. */
const IMF_SUBSCRIPTION_KEY_HEADER = 'Ocp-Apim-Subscription-Key';
// ─── Allowlist check ─────────────────────────────────────────────────────────
/**
 * Returns `true` when `url` is allowed by the IMF-only fetch-proxy policy.
 *
 * Allowed: `https://api.imf.org/external/sdmx/3.0/...` (SDMX 2.1 rejected).
 *
 * @param url - Raw URL string to validate.
 * @returns Whether the URL is permitted.
 */
export function isAllowedImfUrl(url) {
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        return false;
    }
    return (parsed.protocol === IMF_ALLOWED_PROTOCOL &&
        parsed.hostname === IMF_ALLOWED_HOSTNAME &&
        (parsed.port === '' || parsed.port === '443') &&
        parsed.username === '' &&
        parsed.password === '' &&
        parsed.pathname.startsWith(IMF_ALLOWED_PATH_PREFIX));
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
export function toWire(obj) {
    return JSON.stringify(obj) + String.fromCharCode(10);
}
// ─── MCP handlers ────────────────────────────────────────────────────────────
/**
 * Build a success response for the `initialize` handshake.
 *
 * @param id - Request id to echo.
 * @returns JSON-RPC success with MCP 2024-11-05 capabilities.
 */
export function handleInitialize(id) {
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
export function handleToolsList(id) {
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
function readImfSubscriptionKeys() {
    const candidates = [process.env['IMF_API_PRIMARY_KEY'], process.env['IMF_API_SECONDARY_KEY']];
    const keys = [];
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
function buildImfHeaders(key) {
    const headers = { ...IMF_REQUEST_HEADERS };
    if (key !== undefined && key.length > 0) {
        headers[IMF_SUBSCRIPTION_KEY_HEADER] = key;
    }
    return headers;
}
/**
 * Classify a single `fetch()` response from `api.imf.org` so
 * {@link handleFetchUrl} can decide whether to rotate keys, return
 * success, or surface an explicit error.
 *
 * - `204 No Content` → explicit error (Azure APIM accepted the request
 *   but no Ocp-Apim-Subscription-Key matched; without this guard the
 *   empty body would be indistinguishable from a successful 200).
 * - `401`/`403` with another key available → auth-retry signal.
 * - Any other non-2xx → error with the HTTP status.
 *
 * @internal Exported for tests.
 *
 * @param response - The HTTP response returned by `fetch()`.
 * @param hasNextAttempt - `true` when another subscription key is available for retry.
 * @returns A classified outcome — `'ok'` with body text, `'auth-retry'` to rotate keys,
 *   or `'error'` with a JSON-RPC error envelope.
 */
async function classifyFetchResponse(response, hasNextAttempt) {
    if ((response.status === 401 || response.status === 403) && hasNextAttempt) {
        return { kind: 'auth-retry', response };
    }
    if (response.status === 204) {
        return {
            kind: 'error',
            rpcError: {
                code: -1,
                message: `HTTP 204 No Content from ${IMF_ALLOWED_HOSTNAME} — likely missing or invalid ${IMF_SUBSCRIPTION_KEY_HEADER} (set IMF_API_PRIMARY_KEY)`,
            },
            response,
        };
    }
    if (!response.ok) {
        return {
            kind: 'error',
            rpcError: { code: -1, message: `HTTP ${response.status} ${response.statusText}` },
            response,
        };
    }
    return { kind: 'ok', text: await response.text() };
}
/**
 * JSON-RPC handler for the proxy's `fetch_url` method.
 *
 * Validates the requested URL against the IMF allow-list (protocol, hostname,
 * path prefix), forwards it via `fetchImpl`, and returns the response body
 * wrapped in a JSON-RPC success envelope. Disallowed URLs return a JSON-RPC
 * error envelope rather than throwing.
 *
 * @param id - JSON-RPC request id to echo back in the response.
 * @param url - Absolute URL the agent is requesting.
 * @param fetchImpl - `fetch` implementation (overridable for tests).
 * @returns A JSON-RPC success envelope with the response body, or an error
 *          envelope describing why the URL was rejected.
 */
export async function handleFetchUrl(id, url, fetchImpl = globalThis.fetch) {
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
    const keys = readImfSubscriptionKeys();
    const attempts = keys.length > 0 ? [...keys] : [undefined];
    let lastResponse;
    let lastError;
    for (let i = 0; i < attempts.length; i += 1) {
        const key = attempts[i];
        try {
            const response = (await fetchImpl(url, {
                headers: buildImfHeaders(key),
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            }));
            lastResponse = response;
            const outcome = await classifyFetchResponse(response, i + 1 < attempts.length);
            if (outcome.kind === 'auth-retry') {
                continue;
            }
            if (outcome.kind === 'error') {
                return { jsonrpc: '2.0', id, error: outcome.rpcError };
            }
            return {
                jsonrpc: '2.0',
                id,
                result: { content: [{ type: 'text', text: outcome.text }] },
            };
        }
        catch (err) {
            lastError = err;
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
export function runServer(input = process.stdin, output = process.stdout, fetchImpl = globalThis.fetch) {
    const send = (obj) => {
        output.write(toWire(obj));
    };
    const rl = readline.createInterface({ input, terminal: false });
    return new Promise((resolve) => {
        rl.on('line', (line) => {
            let requestId = null;
            void (async () => {
                try {
                    const msg = JSON.parse(line);
                    requestId = msg.id ?? null;
                    if (msg.method === 'initialize') {
                        send(handleInitialize(msg.id ?? null));
                    }
                    else if (msg.method === 'notifications/initialized') {
                        // No-op — notification, no response required.
                    }
                    else if (msg.method === 'tools/list') {
                        send(handleToolsList(msg.id ?? null));
                    }
                    else if (msg.method === 'tools/call') {
                        const params = msg.params;
                        if (params?.name === 'fetch_url') {
                            const url = params.arguments?.url;
                            const result = await handleFetchUrl(msg.id ?? null, url, fetchImpl);
                            send(result);
                        }
                        else {
                            send({
                                jsonrpc: '2.0',
                                id: msg.id ?? null,
                                result: { content: [{ type: 'text', text: 'unknown tool' }] },
                            });
                        }
                    }
                    else {
                        send({
                            jsonrpc: '2.0',
                            id: msg.id ?? null,
                            result: { content: [{ type: 'text', text: 'unknown method' }] },
                        });
                    }
                }
                catch (err) {
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
if (process.argv[1] !== undefined &&
    (process.argv[1].endsWith('fetch-proxy-server.js') ||
        process.argv[1].endsWith('fetch-proxy-server.ts'))) {
    void runServer();
}
//# sourceMappingURL=fetch-proxy-server.js.map