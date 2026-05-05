// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/FetchProxyServer
 * @description IMF-only MCP fetch-proxy server.
 *
 * Implements the Model Context Protocol (JSON-RPC 2.0 over stdio) with a
 * single tool — `fetch_url` — that proxies HTTPS GET requests to the IMF
 * SDMX 3.0 REST API at `https://dataservices.imf.org/REST/SDMX_3.0/`.
 *
 * ## Why this exists
 *
 * The Agent Workflow Firewall (AWF) runs a Squid proxy that blocks outbound
 * HTTPS even to allowlisted domains such as `dataservices.imf.org`. This
 * server is mounted as an MCP container in gh-aw workflows; because MCP
 * containers run in a Docker network with direct outbound access (bypassing
 * Squid), `fetch_url` can reach the IMF API while the main runner cannot.
 *
 * The server only allows calls to `https://dataservices.imf.org/REST/SDMX_3.0/`
 * — all other URLs are rejected with an error message.
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
const IMF_ALLOWED_HOSTNAME = 'dataservices.imf.org';
const IMF_ALLOWED_PATH_PREFIX = '/REST/SDMX_3.0/';
const IMF_ALLOWED_PROTOCOL = 'https:';
/** Per-request fetch timeout (ms). */
const FETCH_TIMEOUT_MS = 180_000;
// ─── Allowlist check ─────────────────────────────────────────────────────────
/**
 * Returns `true` when `url` is allowed by the IMF-only fetch-proxy policy.
 *
 * Allowed: `https://dataservices.imf.org/REST/SDMX_3.0/...`
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
 * Execute the `fetch_url` tool call.
 *
 * Only URLs matching the IMF SDMX 3.0 allowlist are permitted. Non-matching
 * or malformed URLs receive a JSON-RPC error response; HTTP errors and network
 * failures also surface as errors.
 *
 * @param id - Request id to echo.
 * @param url - URL to fetch.
 * @param fetchImpl - Injectable `fetch` implementation (defaults to global).
 * @returns JSON-RPC success or error.
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
    try {
        const response = await fetchImpl(url, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { jsonrpc: '2.0', id, error: { code: -1, message } };
    }
}
// ─── Main server loop ─────────────────────────────────────────────────────────
/**
 * Run the fetch-proxy MCP server, reading JSON-RPC messages from `input` and
 * writing responses to `output`.
 *
 * This function never resolves — it blocks until the input stream closes.
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
            let requestId = 0;
            void (async () => {
                try {
                    const msg = JSON.parse(line);
                    requestId = msg.id ?? 0;
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