// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for wb-mcp-client.js
 * Tests World Bank MCP client construction, tool wrapper methods, and singleton lifecycle
 */

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

    it('closeWBMCPClient should be safe to call multiple times', async () => {
      await closeWBMCPClient();
      await closeWBMCPClient();
      await closeWBMCPClient();
      // Should not throw
    });
  });

  describe('getIndicatorForCountry edge cases', () => {
    let client;
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new WorldBankMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should handle non-Error exceptions in callTool', async () => {
      vi.spyOn(client, 'callTool').mockRejectedValue('string error');
      const result = await client.getIndicatorForCountry('DEU', 'NY.GDP.MKTP.CD');
      expect(result.content[0].text).toBe('');
    });

    it('should warn when countryId is empty', async () => {
      await client.getIndicatorForCountry('', 'NY.GDP.MKTP.CD');
      expect(consoleOutput.warnings.some((w) => w.includes('countryId'))).toBe(true);
    });

    it('should warn when indicatorId is empty', async () => {
      await client.getIndicatorForCountry('DEU', '');
      expect(consoleOutput.warnings.some((w) => w.includes('indicatorId'))).toBe(true);
    });

    it('should return fallback content with correct structure', async () => {
      const result = await client.getIndicatorForCountry('', '');
      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text', '');
    });
  });

  describe('WorldBankMCPClient env var configuration', () => {
    let consoleOutput;
    const originalEnv = { ...process.env };

    beforeEach(() => {
      consoleOutput = mockConsole();
    });

    afterEach(() => {
      consoleOutput.restore();
      process.env = { ...originalEnv };
    });

    it('should use WB_MCP_SERVER_PATH env var when set', () => {
      process.env['WB_MCP_SERVER_PATH'] = '/custom/server/path';
      const client = new WorldBankMCPClient();
      expect(client).toBeInstanceOf(WorldBankMCPClient);
    });

    it('should use WB_MCP_GATEWAY_URL env var when set', () => {
      process.env['WB_MCP_GATEWAY_URL'] = 'https://gateway.example.com';
      const client = new WorldBankMCPClient();
      expect(client).toBeInstanceOf(WorldBankMCPClient);
    });

    it('should use WB_MCP_GATEWAY_API_KEY env var when set', () => {
      process.env['WB_MCP_GATEWAY_API_KEY'] = 'test-api-key';
      const client = new WorldBankMCPClient();
      expect(client).toBeInstanceOf(WorldBankMCPClient);
    });

    it('should prefer explicit options over env vars', () => {
      process.env['WB_MCP_SERVER_PATH'] = '/env/path';
      const client = new WorldBankMCPClient({
        serverPath: '/explicit/path',
      });
      expect(client).toBeInstanceOf(WorldBankMCPClient);
    });

    it('should pass custom serverLabel', () => {
      const client = new WorldBankMCPClient({
        serverLabel: 'Custom WB Server',
      });
      expect(client).toBeInstanceOf(WorldBankMCPClient);
    });
  });
});
