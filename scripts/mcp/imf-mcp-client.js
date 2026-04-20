// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/IMFMCPClient
 * @description IMF MCP client — domain-specific tool wrappers for the
 * IMF Data MCP server ({@link https://github.com/c-cf/imf-data-mcp}),
 * which fronts the SDMX 3.0 API at {@link https://data.imf.org/}.
 *
 * Extends {@link MCPConnection} with IMF-specific tool methods.
 * Provides fresher macroeconomic indicators (WEO, IFS, Fiscal Monitor,
 * BOP, ER, PCPS) than the World Bank WDI — including native multi-year
 * forecasts — to enrich European Parliament news articles with genuine
 * forward-looking macro context.
 *
 * ## Transport
 *
 * The IMF MCP server is a Python process (`uvx imf-data-mcp` or
 * `pipx run imf-data-mcp`); because Node stdio spawning of Python
 * binaries is brittle in the agentic-workflow sandbox, this client is
 * **gateway-only**. The `serverPath` is left as an empty fallback and
 * the gateway URL (set by `scripts/mcp-setup.sh`) is the supported
 * transport. If only the server path is configured (no gateway), the
 * client will fail fast on connect so callers can degrade gracefully.
 *
 * Environment variables:
 * - `IMF_MCP_GATEWAY_URL` — HTTP gateway URL (preferred transport).
 * - `IMF_MCP_GATEWAY_API_KEY` — gateway API key; falls back to
 *   `EP_MCP_GATEWAY_API_KEY` (both route through the same gateway in
 *   the default deployment).
 * - `IMF_MCP_SERVER_PATH` — optional stdio fallback for local dev.
 */
import { MCPConnection } from './mcp-connection.js';
/** Fallback payload shape when an IMF call fails or the server is offline. */
const IMF_FALLBACK = {
    content: [{ type: 'text', text: '' }],
};
/**
 * Canonical list of tools exposed by the IMF Data MCP server. The news
 * workflows, probe script, and the integration test suite all reference
 * this list so a regression that adds/removes a tool fails a single
 * drift guard (`test/integration/mcp/imf-mcp.test.js`) instead of
 * silently breaking prompt/validator/probe coverage.
 *
 * Kept in sync with `analysis/methodologies/imf-indicator-mapping.md`
 * and the upstream `c-cf/imf-data-mcp` README.
 */
export const IMF_MCP_TOOLS = [
    'imf-list-databases',
    'imf-search-databases',
    'imf-get-parameter-defs',
    'imf-get-parameter-codes',
    'imf-fetch-data',
];
/**
 * MCP client for the IMF Data MCP server.
 *
 * Extends {@link MCPConnection} with semantic wrappers over the five
 * upstream discovery/fetch tools. The wrappers validate required
 * arguments client-side and return a standard {@link IMF_FALLBACK}
 * payload on error rather than throwing, so callers upstream can keep
 * running even when IMF is unavailable — matching the `WorldBankMCPClient`
 * pattern.
 */
export class IMFMCPClient extends MCPConnection {
    constructor(options = {}) {
        super({
            ...options,
            // Python-backed server; stdio is best-effort. Gateway mode is the
            // supported transport (set by workflow prompts via `scripts/mcp-setup.sh`).
            serverPath: options.serverPath ?? process.env['IMF_MCP_SERVER_PATH'] ?? '',
            gatewayUrl: options.gatewayUrl ?? process.env['IMF_MCP_GATEWAY_URL'] ?? '',
            gatewayApiKey: options.gatewayApiKey ??
                process.env['IMF_MCP_GATEWAY_API_KEY'] ??
                process.env['EP_MCP_GATEWAY_API_KEY'] ??
                '',
            serverLabel: options.serverLabel ?? 'IMF Data MCP Server',
        });
    }
    /**
     * List every IMF database exposed by the MCP server.
     *
     * Wraps the `imf-list-databases` tool.
     *
     * @returns MCP tool result with a JSON payload of `{id,name,description}` rows.
     */
    async listDatabases() {
        try {
            return await this.callTool('imf-list-databases', {});
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-list-databases not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * Search IMF databases by free-text keyword.
     *
     * Wraps the `imf-search-databases` tool.
     *
     * @param keyword - Free-text keyword (e.g. `"inflation"`, `"trade"`).
     * @returns MCP tool result filtered to matching databases, or fallback on error.
     */
    async searchDatabases(keyword) {
        if (!keyword) {
            console.warn('imf-search-databases called without a keyword');
            return IMF_FALLBACK;
        }
        try {
            return await this.callTool('imf-search-databases', { keyword });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-search-databases not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * Get the parameter (dimension) definitions for a specific IMF database.
     *
     * Wraps the `imf-get-parameter-defs` tool — essential before calling
     * `imf-fetch-data` because each database has its own dimension set
     * (country, frequency, indicator, ...).
     *
     * @param databaseId - IMF database identifier (e.g. `"WEO"`, `"IFS"`).
     * @returns MCP tool result listing the dimension IDs, or fallback on error.
     */
    async getParameterDefs(databaseId) {
        if (!databaseId) {
            console.warn('imf-get-parameter-defs called without databaseId');
            return IMF_FALLBACK;
        }
        try {
            return await this.callTool('imf-get-parameter-defs', { database_id: databaseId });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-get-parameter-defs not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * List valid codes for a specific dimension of an IMF database —
     * with optional free-text search to narrow the result set.
     *
     * Wraps the `imf-get-parameter-codes` tool.
     *
     * @param databaseId - IMF database identifier.
     * @param parameter - Dimension name (e.g. `"country"`, `"indicator"`).
     * @param search - Optional free-text search term.
     * @returns MCP tool result listing matching code values, or fallback on error.
     */
    async getParameterCodes(databaseId, parameter, search) {
        if (!databaseId || !parameter) {
            console.warn('imf-get-parameter-codes requires databaseId and parameter');
            return IMF_FALLBACK;
        }
        try {
            const args = {
                database_id: databaseId,
                parameter,
            };
            if (search) {
                args['search'] = search;
            }
            return await this.callTool('imf-get-parameter-codes', args);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-get-parameter-codes not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * Fetch a time series from an IMF database.
     *
     * Wraps the `imf-fetch-data` tool. Callers MUST populate the
     * `filters` object with the dimension codes returned by
     * {@link getParameterCodes} — at minimum `country` (ISO-3 code) and
     * typically `indicator` plus `frequency`.
     *
     * @param options - Fetch parameters.
     * @param options.databaseId - IMF database ID (`WEO`, `IFS`, ...).
     * @param options.startYear - Inclusive start year (e.g. `2015`).
     * @param options.endYear - Inclusive end year (e.g. `2030` for WEO forecasts).
     * @param options.filters - Map of dimension name to list of codes.
     * @returns MCP tool result carrying the SDMX-JSON payload, or fallback on error.
     */
    async fetchData(options) {
        const { databaseId, startYear, endYear, filters } = options;
        if (!databaseId || !filters || Object.keys(filters).length === 0) {
            console.warn('imf-fetch-data requires databaseId and a non-empty filters map');
            return IMF_FALLBACK;
        }
        if (!Number.isFinite(startYear) || !Number.isFinite(endYear) || endYear < startYear) {
            console.warn(`imf-fetch-data invalid year range: ${startYear}-${endYear}`);
            return IMF_FALLBACK;
        }
        try {
            return await this.callTool('imf-fetch-data', {
                database_id: databaseId,
                start_year: startYear,
                end_year: endYear,
                filters,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-fetch-data not available:', message);
            return IMF_FALLBACK;
        }
    }
}
/** Singleton IMF MCP client instance. */
let imfClientInstance = null;
/**
 * Get or create the singleton IMF MCP client.
 *
 * Uses `IMF_MCP_GATEWAY_URL` / `IMF_MCP_GATEWAY_API_KEY` (falling back
 * to `EP_MCP_GATEWAY_API_KEY`) for gateway configuration. Throws if the
 * connect fails so callers can branch to a World Bank fallback.
 *
 * @param options - Client options (override env vars).
 * @returns The shared IMF MCP client instance, connected on first call.
 */
export async function getIMFMCPClient(options = {}) {
    if (!imfClientInstance) {
        const mergedOptions = {
            ...options,
            maxConnectionAttempts: options.maxConnectionAttempts ?? 2,
            connectionRetryDelay: options.connectionRetryDelay ?? 1000,
        };
        const client = new IMFMCPClient(mergedOptions);
        try {
            await client.connect();
            imfClientInstance = client;
        }
        catch (error) {
            imfClientInstance = null;
            throw error;
        }
    }
    return imfClientInstance;
}
/** Close and cleanup the singleton IMF MCP client. */
export async function closeIMFMCPClient() {
    if (imfClientInstance) {
        imfClientInstance.disconnect();
        imfClientInstance = null;
    }
}
//# sourceMappingURL=imf-mcp-client.js.map