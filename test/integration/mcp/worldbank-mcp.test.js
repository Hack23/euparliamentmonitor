// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test: World Bank MCP tool surface.
 *
 * Verifies that the World Bank MCP client produces the correct JSON-RPC
 * `tools/call` request for every canonical World Bank tool used by
 * news-generation workflows and article-level analysis:
 *
 *   1. search-indicators   — indicator discovery by keyword
 *   2. get-countries       — listing supported countries
 *   3. get-country-info    — country metadata lookup
 *   4. get-economic-data   — GDP, inflation, unemployment series
 *   5. get-social-data     — population, life expectancy, internet users
 *   6. get-education-data  — literacy, enrolment, education expenditure
 *   7. get-health-data     — health expenditure, physicians, immunisation
 *
 * The low-level `sendRequest()` transport is mocked so the real
 * `callTool()` implementation (argument validation, JSON-RPC envelope
 * construction) is exercised while the suite remains network-free. This
 * makes the suite a meaningful drift guard: a regression in tool name
 * mapping or request-payload shape will fail these tests.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  WorldBankMCPClient,
  WORLD_BANK_MCP_TOOLS,
} from '../../../scripts/mcp/wb-mcp-client.js';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Canonical payload returned by the mocked MCP transport. */
const MOCK_TEXT_RESULT = {
  content: [{ type: 'text', text: '{"ok":true}' }],
};

/**
 * Build a WorldBankMCPClient with the lower-level `sendRequest()` mocked
 * out. Returns both the client and the spy so each test can assert the
 * JSON-RPC `method` + `params` produced by the real `callTool()`.
 *
 * @returns {{client: WorldBankMCPClient, sendRequestSpy: import('vitest').MockInstance}}
 */
function buildMockedClient() {
  const client = new WorldBankMCPClient({
    gatewayUrl: 'http://host.docker.internal:80/mcp/world-bank',
    gatewayApiKey: 'test-key',
  });
  const sendRequestSpy = vi.spyOn(client, 'sendRequest').mockResolvedValue(MOCK_TEXT_RESULT);
  return { client, sendRequestSpy };
}

describe('integration — World Bank MCP tool surface', () => {
  it('invokes search-indicators with a keyword argument', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const result = await client.callTool('search-indicators', { keyword: 'GDP' });
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'search-indicators',
      arguments: { keyword: 'GDP' },
    });
    expect(result.content[0].type).toBe('text');
  });

  it('invokes get-countries with no arguments', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const result = await client.callTool('get-countries', {});
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'get-countries',
      arguments: {},
    });
    expect(result).toEqual(MOCK_TEXT_RESULT);
  });

  it('invokes get-country-info with an ISO country code', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const result = await client.callTool('get-country-info', { countryCode: 'DE' });
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'get-country-info',
      arguments: { countryCode: 'DE' },
    });
    expect(result.content).toBeDefined();
  });

  it('invokes get-economic-data with countryCode + indicator + years', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const args = { countryCode: 'DE', indicator: 'GDP_GROWTH', years: 5 };
    await client.callTool('get-economic-data', args);
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'get-economic-data',
      arguments: args,
    });
  });

  it('invokes get-social-data with a population-family indicator', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const args = { countryCode: 'FR', indicator: 'LIFE_EXPECTANCY', years: 10 };
    await client.callTool('get-social-data', args);
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'get-social-data',
      arguments: args,
    });
  });

  it('invokes get-education-data with an education indicator', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const args = { countryCode: 'IT', indicator: 'EDUCATION_EXPENDITURE', years: 5 };
    await client.callTool('get-education-data', args);
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'get-education-data',
      arguments: args,
    });
  });

  it('invokes get-health-data with a health indicator', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    const args = { countryCode: 'PL', indicator: 'HEALTH_EXPENDITURE', years: 5 };
    await client.callTool('get-health-data', args);
    expect(sendRequestSpy).toHaveBeenCalledWith('tools/call', {
      name: 'get-health-data',
      arguments: args,
    });
  });

  it('rejects non-object tool arguments before touching the transport', async () => {
    const { client, sendRequestSpy } = buildMockedClient();
    // Real `callTool()` guards against arrays / null / primitives.
    await expect(client.callTool('get-countries', [])).rejects.toThrow(TypeError);
    await expect(client.callTool('get-countries', null)).rejects.toThrow(TypeError);
    expect(sendRequestSpy).not.toHaveBeenCalled();
  });

  it('surfaces transport errors from the underlying MCP connection', async () => {
    const client = new WorldBankMCPClient({
      gatewayUrl: 'http://host.docker.internal:80/mcp/world-bank',
      gatewayApiKey: 'test-key',
    });
    vi.spyOn(client, 'sendRequest').mockRejectedValue(new Error('Connection refused'));
    await expect(
      client.callTool('get-economic-data', { countryCode: 'DE', indicator: 'GDP' })
    ).rejects.toThrow('Connection refused');
  });

  it('covers all canonical World Bank MCP tools exported by the client', () => {
    // True drift guard: assert equality between the client's exported tool
    // list and the tools exercised above. If a new tool is added to
    // `wb-mcp-client.ts` but no integration test covers it, this fails.
    const toolsUnderTest = [
      'search-indicators',
      'get-countries',
      'get-country-info',
      'get-economic-data',
      'get-social-data',
      'get-education-data',
      'get-health-data',
    ];
    // The exported list is the single source of truth shared with the probe
    // script and the indicator-mapping methodology.
    expect([...WORLD_BANK_MCP_TOOLS].sort()).toEqual([...toolsUnderTest].sort());
    expect(WORLD_BANK_MCP_TOOLS).toHaveLength(toolsUnderTest.length);
  });
});
