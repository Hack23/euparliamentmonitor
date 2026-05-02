// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for wb-mcp-client.js
 * Tests World Bank MCP client construction, tool wrapper methods, and singleton lifecycle
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WorldBankMCPClient, closeWBMCPClient, getWBMCPClient } from '../../scripts/mcp/wb-mcp-client.js';
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

  describe('getWBMCPClient singleton creation', () => {
    beforeEach(async () => {
      // Always start with a clean singleton state
      await closeWBMCPClient();
    });

    afterEach(async () => {
      await closeWBMCPClient();
    });

    it('should create a new client when none exists (connect succeeds)', async () => {
      // Arrange: mock connect to succeed immediately
      vi.spyOn(WorldBankMCPClient.prototype, 'connect').mockResolvedValue(undefined);

      // Act
      const client = await getWBMCPClient({ maxConnectionAttempts: 1, connectionRetryDelay: 0 });

      // Assert
      expect(client).toBeInstanceOf(WorldBankMCPClient);
      expect(WorldBankMCPClient.prototype.connect).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls (singleton behaviour)', async () => {
      // Arrange
      vi.spyOn(WorldBankMCPClient.prototype, 'connect').mockResolvedValue(undefined);

      // Act
      const first = await getWBMCPClient({ maxConnectionAttempts: 1, connectionRetryDelay: 0 });
      const second = await getWBMCPClient({ maxConnectionAttempts: 1, connectionRetryDelay: 0 });

      // Assert: same object reference, connect only called once
      expect(first).toBe(second);
      expect(WorldBankMCPClient.prototype.connect).toHaveBeenCalledTimes(1);
    });

    it('should propagate and reset singleton when connect throws', async () => {
      // Arrange
      vi.spyOn(WorldBankMCPClient.prototype, 'connect').mockRejectedValue(
        new Error('Connection failed')
      );

      // Act & Assert: should throw and reset
      await expect(
        getWBMCPClient({ maxConnectionAttempts: 1, connectionRetryDelay: 0 })
      ).rejects.toThrow('Connection failed');

      // After failure, a new call should attempt a fresh connect
      vi.spyOn(WorldBankMCPClient.prototype, 'connect').mockResolvedValue(undefined);
      const recovered = await getWBMCPClient({ maxConnectionAttempts: 1, connectionRetryDelay: 0 });
      expect(recovered).toBeInstanceOf(WorldBankMCPClient);
    });

    it('should apply default maxConnectionAttempts when not provided', async () => {
      // Arrange
      vi.spyOn(WorldBankMCPClient.prototype, 'connect').mockResolvedValue(undefined);

      // Act
      const client = await getWBMCPClient({});

      // Assert: client created without error
      expect(client).toBeInstanceOf(WorldBankMCPClient);
    });

    it('should close singleton and allow re-creation after closeWBMCPClient', async () => {
      // Arrange
      vi.spyOn(WorldBankMCPClient.prototype, 'connect').mockResolvedValue(undefined);

      // Act: create, close, re-create
      const first = await getWBMCPClient({ maxConnectionAttempts: 1, connectionRetryDelay: 0 });
      await closeWBMCPClient();
      const second = await getWBMCPClient({ maxConnectionAttempts: 1, connectionRetryDelay: 0 });

      // Assert: second creation produced a fresh instance
      expect(second).toBeInstanceOf(WorldBankMCPClient);
      // connect called twice (once for each creation)
      expect(WorldBankMCPClient.prototype.connect).toHaveBeenCalledTimes(2);
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
      // Restore process.env by mutating the existing object instead of reassigning it
      for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) {
          delete process.env[key];
        }
      }
      for (const [key, value] of Object.entries(originalEnv)) {
        process.env[key] = value;
      }
    });

    it('should use WB_MCP_GATEWAY_URL env var when set', () => {
      process.env['WB_MCP_GATEWAY_URL'] = 'https://gateway.example.com';
      const client = new WorldBankMCPClient();
      expect(client.isGatewayMode()).toBe(true);
      expect(client.getGatewayUrl()).toBe('https://gateway.example.com');
    });

    it('should use WB_MCP_GATEWAY_API_KEY env var when set', () => {
      process.env['WB_MCP_GATEWAY_URL'] = 'https://gateway.example.com';
      process.env['WB_MCP_GATEWAY_API_KEY'] = 'test-api-key';
      const client = new WorldBankMCPClient();
      expect(client.getGatewayApiKey()).toBe('test-api-key');
    });

    it('should not enable gateway mode without gateway URL', () => {
      process.env['WB_MCP_SERVER_PATH'] = '/custom/server/path';
      const client = new WorldBankMCPClient();
      expect(client.isGatewayMode()).toBe(false);
      expect(client.getGatewayUrl()).toBeNull();
    });

    it('should prefer explicit options over env vars', () => {
      process.env['WB_MCP_GATEWAY_URL'] = 'https://env-gateway.example.com';
      const client = new WorldBankMCPClient({
        gatewayUrl: 'https://explicit-gateway.example.com',
      });
      expect(client.getGatewayUrl()).toBe('https://explicit-gateway.example.com');
    });

    it('should pass custom serverLabel', () => {
      const client = new WorldBankMCPClient({
        serverLabel: 'Custom WB Server',
      });
      expect(client.serverLabel).toBe('Custom WB Server');
    });
  });
});
