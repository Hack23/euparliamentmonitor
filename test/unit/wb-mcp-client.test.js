// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for wb-mcp-client.js
 * Tests World Bank MCP client construction, tool wrapper methods, and singleton lifecycle
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorldBankMCPClient, closeWBMCPClient } from '../../scripts/mcp/wb-mcp-client.js';
import { mockConsole } from '../helpers/test-utils.js';

describe('wb-mcp-client', () => {
  describe('WorldBankMCPClient', () => {
    let client;
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new WorldBankMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
      if (client?.isConnected?.()) {
        client.disconnect();
      }
    });

    describe('Constructor', () => {
      it('should initialize with default options', () => {
        expect(client).toBeInstanceOf(WorldBankMCPClient);
        expect(client.isConnected()).toBe(false);
      });

      it('should accept custom options', () => {
        const customClient = new WorldBankMCPClient({
          serverPath: '/custom/wb-path',
          maxConnectionAttempts: 5,
          connectionRetryDelay: 2000,
        });
        expect(customClient).toBeInstanceOf(WorldBankMCPClient);
        expect(customClient.isConnected()).toBe(false);
      });
    });

    describe('getIndicatorForCountry', () => {
      it('should return fallback when not connected', async () => {
        // Force the callTool to throw (not connected)
        const result = await client.getIndicatorForCountry('DEU', 'NY.GDP.MKTP.CD');
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(result.content[0].type).toBe('text');
      });

      it('should return fallback when countryId is empty', async () => {
        const result = await client.getIndicatorForCountry('', 'NY.GDP.MKTP.CD');
        expect(result.content[0].text).toBe('');
      });

      it('should return fallback when indicatorId is empty', async () => {
        const result = await client.getIndicatorForCountry('DEU', '');
        expect(result.content[0].text).toBe('');
      });

      it('should call callTool with correct tool name and arguments', async () => {
        // Mock callTool
        const mockResult = { content: [{ type: 'text', text: 'csv,data' }] };
        vi.spyOn(client, 'callTool').mockResolvedValue(mockResult);

        const result = await client.getIndicatorForCountry('DEU', 'NY.GDP.MKTP.CD');
        expect(client.callTool).toHaveBeenCalledWith('get_indicator_for_country', {
          country_id: 'DEU',
          indicator_id: 'NY.GDP.MKTP.CD',
        });
        expect(result).toEqual(mockResult);
      });

      it('should gracefully handle callTool errors', async () => {
        vi.spyOn(client, 'callTool').mockRejectedValue(new Error('Connection refused'));
        const result = await client.getIndicatorForCountry('DEU', 'NY.GDP.MKTP.CD');
        expect(result.content[0].text).toBe('');
      });
    });
  });

  describe('Singleton lifecycle', () => {
    afterEach(async () => {
      await closeWBMCPClient();
    });

    it('closeWBMCPClient should be safe to call when no instance exists', async () => {
      await closeWBMCPClient(); // Should not throw
    });
  });
});
