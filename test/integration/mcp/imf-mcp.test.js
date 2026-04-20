// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test: IMF MCP tool surface.
 *
 * Mirrors `test/integration/mcp/worldbank-mcp.test.js`. Mocks the
 * low-level `sendRequest()` transport so the real `callTool()`
 * implementation (argument validation, JSON-RPC envelope construction)
 * is exercised while the suite remains network-free. Acts as a drift
 * guard: a regression in tool-name mapping or request-payload shape
 * fails these tests.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { IMFMCPClient, IMF_MCP_TOOLS } from '../../../scripts/mcp/imf-mcp-client.js';

afterEach(() => {
  vi.restoreAllMocks();
});

const MOCK_TEXT_RESULT = {
  content: [{ type: 'text', text: '{"ok":true}' }],
};

/**
 * Build an IMFMCPClient with `sendRequest()` mocked out.
 *
 * @returns {{client: IMFMCPClient, sendRequestSpy: import('vitest').MockInstance}}
 */
function buildMockedClient() {
  const client = new IMFMCPClient({
    gatewayUrl: 'http://host.docker.internal:80/mcp/imf-data',
    gatewayApiKey: 'test-key',
  });
  const sendRequestSpy = vi.spyOn(client, 'sendRequest').mockResolvedValue(MOCK_TEXT_RESULT);
  return { client, sendRequestSpy };
}

describe('integration — IMF MCP tool surface', () => {
  it('invokes imf-list-databases with no arguments', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const result = await client.callTool('imf-list-databases', {});
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'imf-list-databases',
      arguments: {},
    });
    expect(result).toEqual(MOCK_TEXT_RESULT);
  });

  it('invokes imf-search-databases with a keyword', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    await client.callTool('imf-search-databases', { keyword: 'inflation' });
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'imf-search-databases',
      arguments: { keyword: 'inflation' },
    });
  });

  it('invokes imf-get-parameter-defs with a database_id', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    await client.callTool('imf-get-parameter-defs', { database_id: 'WEO' });
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'imf-get-parameter-defs',
      arguments: { database_id: 'WEO' },
    });
  });

  it('invokes imf-get-parameter-codes with a parameter filter', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const args = { database_id: 'WEO', parameter: 'indicator', search: 'NGDP' };
    await client.callTool('imf-get-parameter-codes', args);
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'imf-get-parameter-codes',
      arguments: args,
    });
  });

  it('invokes imf-fetch-data with the canonical filter shape', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const args = {
      database_id: 'WEO',
      start_year: 2020,
      end_year: 2030,
      filters: { country: ['DEU', 'FRA'], indicator: ['NGDP_RPCH'] },
    };
    await client.callTool('imf-fetch-data', args);
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'imf-fetch-data',
      arguments: args,
    });
  });

  it('rejects non-object tool arguments before touching the transport', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    await expect(client.callTool('imf-list-databases', [])).rejects.toThrow(TypeError);
    await expect(client.callTool('imf-list-databases', null)).rejects.toThrow(TypeError);
    expect(sendRequestSpy).not.toHaveBeenCalled();
  });

  it('surfaces transport errors from the underlying MCP connection', async () => {
    const client = new IMFMCPClient({
      gatewayUrl: 'http://host.docker.internal:80/mcp/imf-data',
      gatewayApiKey: 'test-key',
    });
    vi.spyOn(client, 'sendRequest').mockRejectedValue(new Error('Connection refused'));
    await expect(
      client.callTool('imf-fetch-data', {
        database_id: 'WEO',
        start_year: 2020,
        end_year: 2025,
        filters: { country: ['DEU'] },
      })
    ).rejects.toThrow('Connection refused');
  });

  it('covers all canonical IMF MCP tools exported by the client', () => {
    // Drift guard: assert equality between the client's exported tool
    // list and the tools exercised above. If a new tool is added to
    // `imf-mcp-client.ts` but no integration test covers it, this fails.
    const toolsUnderTest = [
      'imf-list-databases',
      'imf-search-databases',
      'imf-get-parameter-defs',
      'imf-get-parameter-codes',
      'imf-fetch-data',
    ];
    expect([...IMF_MCP_TOOLS].sort()).toEqual([...toolsUnderTest].sort());
    expect(IMF_MCP_TOOLS).toHaveLength(toolsUnderTest.length);
  });
});
