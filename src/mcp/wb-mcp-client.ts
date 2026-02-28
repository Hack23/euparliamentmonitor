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
 */

import { MCPConnection } from './mcp-connection.js';
import type { MCPToolResult, MCPClientOptions } from '../types/index.js';

/** Default World Bank MCP server binary (npm package) */
const WB_DEFAULT_SERVER = 'worldbank-mcp';

/** Fallback payload when indicator data is unavailable (empty CSV) */
const INDICATOR_FALLBACK = '';

/**
 * MCP Client for World Bank economic data access.
 * Extends {@link MCPConnection} with World Bank-specific tool wrapper methods.
 *
 * Always supplies an explicit World Bank server path so the base class never
 * falls back to the European Parliament MCP server defaults.
 */
export class WorldBankMCPClient extends MCPConnection {
  constructor(options: MCPClientOptions = {}) {
    super({
      ...options,
      serverPath: options.serverPath ?? process.env['WB_MCP_SERVER_PATH'] ?? WB_DEFAULT_SERVER,
      gatewayUrl: options.gatewayUrl ?? process.env['WB_MCP_GATEWAY_URL'] ?? '',
      gatewayApiKey: options.gatewayApiKey ?? process.env['WB_MCP_GATEWAY_API_KEY'] ?? undefined,
    });
  }

  /**
   * Get economic indicator data for a specific country.
   *
   * Calls the `get_indicator_for_country` tool on the World Bank MCP server.
   *
   * @param countryId - World Bank country code (e.g., 'DEU' for Germany, 'FRA' for France)
   * @param indicatorId - World Bank indicator ID (e.g., 'NY.GDP.MKTP.CD' for GDP)
   * @returns MCP tool result with CSV-formatted indicator data, or empty text on error
   */
  async getIndicatorForCountry(
    countryId: string,
    indicatorId: string
  ): Promise<MCPToolResult> {
    if (!countryId || !indicatorId) {
      console.warn('get_indicator_for_country called without required countryId or indicatorId');
      return { content: [{ type: 'text', text: INDICATOR_FALLBACK }] };
    }
    try {
      return await this.callTool('get_indicator_for_country', {
        country_id: countryId,
        indicator_id: indicatorId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('get_indicator_for_country not available:', message);
      return { content: [{ type: 'text', text: INDICATOR_FALLBACK }] };
    }
  }
}

/** Singleton World Bank MCP client instance */
let wbClientInstance: WorldBankMCPClient | null = null;

/**
 * Get or create singleton World Bank MCP client instance.
 *
 * Uses `WB_MCP_SERVER_PATH`, `WB_MCP_GATEWAY_URL`, and `WB_MCP_GATEWAY_API_KEY`
 * environment variables for configuration. Falls back to stdio transport
 * with the `worldbank-mcp` npm binary.
 *
 * @param options - Client options (overrides env vars)
 * @returns Connected World Bank MCP client
 */
export async function getWBMCPClient(
  options: MCPClientOptions = {}
): Promise<WorldBankMCPClient> {
  if (!wbClientInstance) {
    const mergedOptions: MCPClientOptions = {
      serverPath: options.serverPath,
      gatewayUrl: options.gatewayUrl,
      gatewayApiKey: options.gatewayApiKey,
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
export async function closeWBMCPClient(): Promise<void> {
  if (wbClientInstance) {
    wbClientInstance.disconnect();
    wbClientInstance = null;
  }
}
