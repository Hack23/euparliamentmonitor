// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/McpConfigReader
 * @description Reads the gh-aw MCP config JSON (`mcp-config.json`) and
 * extracts the gateway API key and address (port + domain).
 *
 * ## Config format
 *
 * The gh-aw runtime writes a JSON file at
 * `~/.copilot/mcp-config.json` (or `$GH_AW_MCP_CONFIG`) with the
 * following shape (several optional paths across gh-aw versions):
 *
 * ```json
 * {
 *   "gateway": {
 *     "apiKey": "<key>",    // gh-aw <= v0.68 (legacy)
 *     "port": 8080,
 *     "domain": "host.docker.internal"
 *   },
 *   "mcpServers": {
 *     "european-parliament": {
 *       "headers": { "Authorization": "<key>" }
 *     },
 *     "fetch-proxy": {
 *       "headers": { "Authorization": "<key>" }
 *     }
 *   }
 * }
 * ```
 *
 * The API key is tried at four locations in priority order:
 * 1. `gateway.apiKey`                        (gh-aw ≤ v0.68)
 * 2. `mcpServers.european-parliament.headers.Authorization`  (v0.69–v0.71)
 * 3. `mcpServers.fetch-proxy.headers.Authorization`          (v0.72+)
 * 4. First `mcpServers[*].headers.Authorization` found       (catch-all)
 *
 * @author Hack23 AB
 * @license Apache-2.0
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Resolved gateway connection details. */
export interface GatewayConfig {
  /** Raw API key (without "Bearer " prefix), or `undefined` if absent. */
  readonly apiKey: string | undefined;
  /** Gateway TCP port, or `undefined` if not present in the config. */
  readonly port: number | undefined;
  /** Gateway hostname/domain, or `undefined` if not present. */
  readonly domain: string | undefined;
}

/** Internal shape of the JSON the gh-aw runtime writes. */
interface McpConfigJson {
  gateway?: {
    apiKey?: string;
    port?: number | string;
    domain?: string;
  };
  mcpServers?: Record<
    string,
    {
      headers?: Record<string, string>;
    }
  >;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strip a leading `Bearer ` prefix (case-insensitive) from an auth string.
 *
 * @param raw - Raw header value that may include the prefix.
 * @returns The bare token.
 */
export function stripBearerPrefix(raw: string): string {
  return raw.replace(/^bearer\s+/i, '');
}

/**
 * Extract the API key from a parsed config object.
 *
 * Tries four locations in priority order (see module docblock).
 *
 * @param config - Parsed `mcp-config.json` object.
 * @returns The extracted key (Bearer-prefix stripped), or `undefined`.
 */
export function extractApiKey(config: McpConfigJson): string | undefined {
  const candidates: Array<string | undefined> = [
    // Priority 1 — legacy gateway.apiKey
    config.gateway?.apiKey,
    // Priority 2 — EP MCP server header
    config.mcpServers?.['european-parliament']?.headers?.['Authorization'],
    // Priority 3 — fetch-proxy server header
    config.mcpServers?.['fetch-proxy']?.headers?.['Authorization'],
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim() !== '') {
      return stripBearerPrefix(candidate.trim());
    }
  }

  // Priority 4 — first server with a non-empty Authorization header
  if (config.mcpServers) {
    for (const server of Object.values(config.mcpServers)) {
      const auth = server?.headers?.['Authorization'];
      if (auth && auth.trim() !== '') {
        return stripBearerPrefix(auth.trim());
      }
    }
  }

  return undefined;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Read and parse the gh-aw MCP config file, returning gateway connection
 * details. Returns `undefined` fields when the config file is absent, the
 * relevant fields are missing, or parsing fails.
 *
 * Never throws — all errors are silently swallowed and result in an empty
 * config so that callers can always fall back to defaults.
 *
 * @param configPath - Absolute path to `mcp-config.json`.
 * @param readFileImpl - Injectable file-read function (default: `fs.readFileSync`).
 *   Accepts the same `(path, encoding)` signature. Used for unit-test injection.
 * @returns Parsed gateway config (fields may be `undefined`).
 */
export function readMcpConfig(
  configPath: string,
  readFileImpl: (path: string, encoding: BufferEncoding) => string = fs.readFileSync,
): GatewayConfig {
  let raw: string;
  try {
    raw = readFileImpl(configPath, 'utf8');
  } catch {
    return { apiKey: undefined, port: undefined, domain: undefined };
  }

  let config: McpConfigJson;
  try {
    config = JSON.parse(raw) as McpConfigJson;
  } catch {
    return { apiKey: undefined, port: undefined, domain: undefined };
  }

  const apiKey = extractApiKey(config);

  const rawPort = config.gateway?.port;
  const port =
    rawPort !== undefined && rawPort !== ''
      ? Number.parseInt(String(rawPort), 10)
      : undefined;
  const parsedPort = port !== undefined && Number.isFinite(port) ? port : undefined;

  const domain =
    config.gateway?.domain !== undefined && config.gateway.domain !== ''
      ? config.gateway.domain
      : undefined;

  return { apiKey, port: parsedPort, domain };
}

/**
 * Resolve the canonical MCP config file path.
 *
 * Prefers `$GH_AW_MCP_CONFIG` env var, then falls back to
 * `~/.copilot/mcp-config.json`.
 *
 * @returns Absolute config file path.
 */
export function resolveMcpConfigPath(): string {
  const envPath = process.env['GH_AW_MCP_CONFIG'];
  if (envPath && envPath.trim() !== '') return envPath.trim();
  const home = process.env['HOME'] ?? process.env['USERPROFILE'] ?? '/home/runner';
  return path.join(home, '.copilot', 'mcp-config.json');
}
