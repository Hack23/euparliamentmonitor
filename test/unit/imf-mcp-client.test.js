// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for imf-mcp-client.js
 * Tests IMF MCP client construction, tool wrapper methods, and singleton lifecycle.
 * Covers the Wave 1 additive IMF data surface introduced in the migration plan.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  IMFMCPClient,
  IMF_MCP_TOOLS,
  closeIMFMCPClient,
} from '../../scripts/mcp/imf-mcp-client.js';
import { mockConsole } from '../helpers/test-utils.js';

describe('imf-mcp-client', () => {
  describe('IMF_MCP_TOOLS drift guard', () => {
    it('exposes exactly the five upstream c-cf/imf-data-mcp tools', () => {
      expect([...IMF_MCP_TOOLS].sort()).toEqual([
        'imf-fetch-data',
        'imf-get-parameter-codes',
        'imf-get-parameter-defs',
        'imf-list-databases',
        'imf-search-databases',
      ]);
    });

    it('is a readonly array of strings', () => {
      expect(Array.isArray(IMF_MCP_TOOLS)).toBe(true);
      for (const t of IMF_MCP_TOOLS) {
        expect(typeof t).toBe('string');
      }
    });
  });

  describe('IMFMCPClient', () => {
    let client;
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new IMFMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
      if (client?.isConnected?.()) {
        client.disconnect();
      }
    });

    describe('Constructor', () => {
      it('should initialize with default options', () => {
        expect(client).toBeInstanceOf(IMFMCPClient);
        expect(client.isConnected()).toBe(false);
      });

      it('should accept custom options', () => {
        const customClient = new IMFMCPClient({
          gatewayUrl: 'http://host.docker.internal:80/mcp/imf-data',
          gatewayApiKey: 'test-key',
        });
        expect(customClient).toBeInstanceOf(IMFMCPClient);
        expect(customClient.isGatewayMode()).toBe(true);
        expect(customClient.getGatewayUrl()).toBe(
          'http://host.docker.internal:80/mcp/imf-data'
        );
      });
    });

    describe('listDatabases', () => {
      it('calls the upstream imf-list-databases tool', async () => {
        const mockResult = { content: [{ type: 'text', text: '[]' }] };
        vi.spyOn(client, 'callTool').mockResolvedValue(mockResult);
        const result = await client.listDatabases();
        expect(client.callTool).toHaveBeenCalledWith('imf-list-databases', {});
        expect(result).toEqual(mockResult);
      });

      it('returns empty fallback on transport error', async () => {
        vi.spyOn(client, 'callTool').mockRejectedValue(new Error('Connection refused'));
        const result = await client.listDatabases();
        expect(result.content[0].type).toBe('text');
        expect(result.content[0].text).toBe('');
      });
    });

    describe('searchDatabases', () => {
      it('passes the keyword through to the upstream tool', async () => {
        vi.spyOn(client, 'callTool').mockResolvedValue({ content: [{ type: 'text', text: '[]' }] });
        await client.searchDatabases('inflation');
        expect(client.callTool).toHaveBeenCalledWith('imf-search-databases', {
          keyword: 'inflation',
        });
      });

      it('returns fallback without calling the tool when keyword is empty', async () => {
        const spy = vi.spyOn(client, 'callTool');
        const result = await client.searchDatabases('');
        expect(spy).not.toHaveBeenCalled();
        expect(result.content[0].text).toBe('');
      });
    });

    describe('getParameterDefs', () => {
      it('uses database_id snake_case for the upstream schema', async () => {
        vi.spyOn(client, 'callTool').mockResolvedValue({ content: [{ type: 'text', text: '[]' }] });
        await client.getParameterDefs('WEO');
        expect(client.callTool).toHaveBeenCalledWith('imf-get-parameter-defs', {
          database_id: 'WEO',
        });
      });

      it('validates the databaseId argument', async () => {
        const spy = vi.spyOn(client, 'callTool');
        const result = await client.getParameterDefs('');
        expect(spy).not.toHaveBeenCalled();
        expect(result.content[0].text).toBe('');
      });
    });

    describe('getParameterCodes', () => {
      it('requires databaseId and parameter', async () => {
        const spy = vi.spyOn(client, 'callTool');
        const result = await client.getParameterCodes('', 'country');
        expect(spy).not.toHaveBeenCalled();
        expect(result.content[0].text).toBe('');
      });

      it('omits the search field when not provided', async () => {
        vi.spyOn(client, 'callTool').mockResolvedValue({ content: [{ type: 'text', text: '[]' }] });
        await client.getParameterCodes('WEO', 'indicator');
        expect(client.callTool).toHaveBeenCalledWith('imf-get-parameter-codes', {
          database_id: 'WEO',
          parameter: 'indicator',
        });
      });

      it('includes the search field when provided', async () => {
        vi.spyOn(client, 'callTool').mockResolvedValue({ content: [{ type: 'text', text: '[]' }] });
        await client.getParameterCodes('WEO', 'indicator', 'NGDP');
        expect(client.callTool).toHaveBeenCalledWith('imf-get-parameter-codes', {
          database_id: 'WEO',
          parameter: 'indicator',
          search: 'NGDP',
        });
      });
    });

    describe('fetchData', () => {
      it('forwards all fetch parameters in snake_case', async () => {
        vi.spyOn(client, 'callTool').mockResolvedValue({
          content: [{ type: 'text', text: '{"data":{}}' }],
        });
        await client.fetchData({
          databaseId: 'WEO',
          startYear: 2020,
          endYear: 2030,
          filters: { country: ['DEU'], indicator: ['NGDP_RPCH'] },
        });
        expect(client.callTool).toHaveBeenCalledWith('imf-fetch-data', {
          database_id: 'WEO',
          start_year: 2020,
          end_year: 2030,
          filters: { country: ['DEU'], indicator: ['NGDP_RPCH'] },
        });
      });

      it('rejects an empty filters map', async () => {
        const spy = vi.spyOn(client, 'callTool');
        const result = await client.fetchData({
          databaseId: 'WEO',
          startYear: 2020,
          endYear: 2025,
          filters: {},
        });
        expect(spy).not.toHaveBeenCalled();
        expect(result.content[0].text).toBe('');
      });

      it('rejects an inverted year range', async () => {
        const spy = vi.spyOn(client, 'callTool');
        const result = await client.fetchData({
          databaseId: 'WEO',
          startYear: 2030,
          endYear: 2020,
          filters: { country: ['DEU'] },
        });
        expect(spy).not.toHaveBeenCalled();
        expect(result.content[0].text).toBe('');
      });

      it('rejects non-finite year inputs', async () => {
        const spy = vi.spyOn(client, 'callTool');
        const result = await client.fetchData({
          databaseId: 'WEO',
          startYear: Number.NaN,
          endYear: 2025,
          filters: { country: ['DEU'] },
        });
        expect(spy).not.toHaveBeenCalled();
        expect(result.content[0].text).toBe('');
      });

      it('returns empty fallback when the transport fails', async () => {
        vi.spyOn(client, 'callTool').mockRejectedValue(new Error('upstream-5xx'));
        const result = await client.fetchData({
          databaseId: 'WEO',
          startYear: 2020,
          endYear: 2025,
          filters: { country: ['DEU'] },
        });
        expect(result.content[0].text).toBe('');
      });
    });

    describe('env var configuration', () => {
      const originalEnv = { ...process.env };

      afterEach(() => {
        for (const key of Object.keys(process.env)) {
          if (!(key in originalEnv)) {
            delete process.env[key];
          }
        }
        for (const [key, value] of Object.entries(originalEnv)) {
          process.env[key] = value;
        }
      });

      it('honours IMF_MCP_GATEWAY_URL', () => {
        process.env['IMF_MCP_GATEWAY_URL'] = 'https://gateway.example.com/mcp/imf-data';
        const c = new IMFMCPClient();
        expect(c.isGatewayMode()).toBe(true);
        expect(c.getGatewayUrl()).toBe('https://gateway.example.com/mcp/imf-data');
      });

      it('falls back to EP_MCP_GATEWAY_API_KEY when IMF-specific key missing', () => {
        process.env['IMF_MCP_GATEWAY_URL'] = 'https://gateway.example.com/mcp/imf-data';
        delete process.env['IMF_MCP_GATEWAY_API_KEY'];
        process.env['EP_MCP_GATEWAY_API_KEY'] = 'ep-shared-key';
        const c = new IMFMCPClient();
        expect(c.getGatewayApiKey()).toBe('ep-shared-key');
      });

      it('prefers IMF-specific key when both are set', () => {
        process.env['IMF_MCP_GATEWAY_URL'] = 'https://gateway.example.com/mcp/imf-data';
        process.env['IMF_MCP_GATEWAY_API_KEY'] = 'imf-specific';
        process.env['EP_MCP_GATEWAY_API_KEY'] = 'ep-shared-key';
        const c = new IMFMCPClient();
        expect(c.getGatewayApiKey()).toBe('imf-specific');
      });

      it('prefers explicit options over env vars', () => {
        process.env['IMF_MCP_GATEWAY_URL'] = 'https://env-gateway.example.com';
        const c = new IMFMCPClient({ gatewayUrl: 'https://explicit.example.com' });
        expect(c.getGatewayUrl()).toBe('https://explicit.example.com');
      });
    });
  });

  describe('Singleton lifecycle', () => {
    afterEach(async () => {
      await closeIMFMCPClient();
    });

    it('closeIMFMCPClient should be safe to call when no instance exists', async () => {
      await closeIMFMCPClient();
    });

    it('closeIMFMCPClient should be idempotent', async () => {
      await closeIMFMCPClient();
      await closeIMFMCPClient();
      await closeIMFMCPClient();
    });
  });
});
