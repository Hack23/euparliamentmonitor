// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/WBMCPClient
 * @description World Bank MCP client — domain-specific tool wrappers for
 * the World Bank MCP server ({@link https://github.com/anshumax/world_bank_mcp_server}).
 *
 * Extends {@link MCPConnection} with World Bank-specific tool methods.
 * Provides economic indicator data for EU member states to enrich
 * European Parliament news articles with macroeconomic context.
 *
 * Environment variables:
 * - `WB_MCP_SERVER_PATH` — Override default server binary path
 * - `WB_MCP_GATEWAY_URL` — Use HTTP gateway transport instead of stdio
 * - `WB_MCP_GATEWAY_API_KEY` — API key for gateway authentication
 * - `USE_WB_MCP` — Set to 'false' to disable World Bank data enrichment
 */
import { MCPConnection } from './mcp-connection.js';
/** Fallback payload when indicator data is unavailable */
const INDICATOR_FALLBACK = '{"data": []}';
/**
 * MCP Client for World Bank economic data access.
 * Extends {@link MCPConnection} with World Bank-specific tool wrapper methods.
 */
export class WorldBankMCPClient extends MCPConnection {
    /**
     * Get economic indicator data for a specific country.
     *
     * Calls the `get_indicator_for_country` tool on the World Bank MCP server.
     *
     * @param countryId - World Bank country code (e.g., 'DEU' for Germany, 'FRA' for France)
     * @param indicatorId - World Bank indicator ID (e.g., 'NY.GDP.MKTP.CD' for GDP)
     * @returns CSV-formatted indicator data or fallback on error
     */
    async getIndicatorForCountry(countryId, indicatorId) {
        if (!countryId || !indicatorId) {
            console.warn('get_indicator_for_country called without required countryId or indicatorId');
            return { content: [{ type: 'text', text: INDICATOR_FALLBACK }] };
        }
        try {
            return await this.callTool('get_indicator_for_country', {
                country_id: countryId,
                indicator_id: indicatorId,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_indicator_for_country not available:', message);
            return { content: [{ type: 'text', text: INDICATOR_FALLBACK }] };
        }
    }
}
/** Singleton World Bank MCP client instance */
let wbClientInstance = null;
/**
 * Get or create singleton World Bank MCP client instance.
 *
 * Uses `WB_MCP_SERVER_PATH`, `WB_MCP_GATEWAY_URL`, and `WB_MCP_GATEWAY_API_KEY`
 * environment variables for configuration. Falls back to stdio transport
 * with default server binary.
 *
 * @param options - Client options (overrides env vars)
 * @returns Connected World Bank MCP client
 */
export async function getWBMCPClient(options = {}) {
    if (!wbClientInstance) {
        const mergedOptions = {
            serverPath: options.serverPath ?? process.env['WB_MCP_SERVER_PATH'],
            gatewayUrl: options.gatewayUrl ?? process.env['WB_MCP_GATEWAY_URL'],
            gatewayApiKey: options.gatewayApiKey ?? process.env['WB_MCP_GATEWAY_API_KEY'],
            maxConnectionAttempts: options.maxConnectionAttempts ?? 2,
            connectionRetryDelay: options.connectionRetryDelay ?? 1000,
        };
        wbClientInstance = new WorldBankMCPClient(mergedOptions);
        await wbClientInstance.connect();
    }
    return wbClientInstance;
}
/**
 * Close and cleanup singleton World Bank MCP client
 */
export async function closeWBMCPClient() {
    if (wbClientInstance) {
        wbClientInstance.disconnect();
        wbClientInstance = null;
    }
}
//# sourceMappingURL=wb-mcp-client.js.map