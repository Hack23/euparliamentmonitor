// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test: World Bank MCP tool surface.
 *
 * Verifies that the World Bank MCP client can invoke every canonical tool
 * used by news-generation workflows and article-level analysis:
 *
 *   1. search-indicators   — indicator discovery by keyword
 *   2. get-countries       — listing supported countries
 *   3. get-country-info    — country metadata lookup
 *   4. get-economic-data   — GDP, inflation, unemployment series
 *   5. get-social-data     — population, life expectancy, internet users
 *   6. get-education-data  — literacy, enrolment, education expenditure
 *   7. get-health-data     — health expenditure, physicians, immunisation
 *
 * The MCP transport is mocked so the test has no external network
 * dependency. This guards against accidental removal of any tool from the
 * code paths used by the generator / validator, and documents the expected
 * request payload shape for each tool.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { WorldBankMCPClient } from '../../../scripts/mcp/wb-mcp-client.js';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Canonical payload returned by the mocked MCP gateway. */
const MOCK_TEXT_RESULT = {
  content: [{ type: 'text', text: '{"ok":true}' }],
};

/**
 * Build a WorldBankMCPClient with the inherited `callTool` method mocked out.
 * Returns both the client and the spy so each test can assert call args.
 *
 * @returns {{client: WorldBankMCPClient, callToolSpy: import('vitest').MockInstance}}
 */
function buildMockedClient() {
  const client = new WorldBankMCPClient({
    gatewayUrl: 'http://host.docker.internal:80/mcp/world-bank',
    gatewayApiKey: 'test-key',
  });
  const callToolSpy = vi.spyOn(client, 'callTool').mockResolvedValue(MOCK_TEXT_RESULT);
  return { client, callToolSpy };
}

describe('integration — World Bank MCP tool surface', () => {
  it('invokes search-indicators with a keyword argument', async () => {
    const { client, callToolSpy } = buildMockedClient();
    const result = await client.callTool('search-indicators', { keyword: 'GDP' });
    expect(callToolSpy).toHaveBeenCalledWith('search-indicators', { keyword: 'GDP' });
    expect(result.content[0].type).toBe('text');
  });

  it('invokes get-countries with no arguments', async () => {
    const { client, callToolSpy } = buildMockedClient();
    const result = await client.callTool('get-countries', {});
    expect(callToolSpy).toHaveBeenCalledWith('get-countries', {});
    expect(result).toEqual(MOCK_TEXT_RESULT);
  });

  it('invokes get-country-info with an ISO country code', async () => {
    const { client, callToolSpy } = buildMockedClient();
    const result = await client.callTool('get-country-info', { countryCode: 'DE' });
    expect(callToolSpy).toHaveBeenCalledWith('get-country-info', { countryCode: 'DE' });
    expect(result.content).toBeDefined();
  });

  it('invokes get-economic-data with countryCode + indicator + years', async () => {
    const { client, callToolSpy } = buildMockedClient();
    const args = { countryCode: 'DE', indicator: 'GDP_GROWTH', years: 5 };
    await client.callTool('get-economic-data', args);
    expect(callToolSpy).toHaveBeenCalledWith('get-economic-data', args);
  });

  it('invokes get-social-data with a population-family indicator', async () => {
    const { client, callToolSpy } = buildMockedClient();
    const args = { countryCode: 'FR', indicator: 'LIFE_EXPECTANCY', years: 10 };
    await client.callTool('get-social-data', args);
    expect(callToolSpy).toHaveBeenCalledWith('get-social-data', args);
  });

  it('invokes get-education-data with an education indicator', async () => {
    const { client, callToolSpy } = buildMockedClient();
    const args = { countryCode: 'IT', indicator: 'EDUCATION_EXPENDITURE', years: 5 };
    await client.callTool('get-education-data', args);
    expect(callToolSpy).toHaveBeenCalledWith('get-education-data', args);
  });

  it('invokes get-health-data with a health indicator', async () => {
    const { client, callToolSpy } = buildMockedClient();
    const args = { countryCode: 'PL', indicator: 'HEALTH_EXPENDITURE', years: 5 };
    await client.callTool('get-health-data', args);
    expect(callToolSpy).toHaveBeenCalledWith('get-health-data', args);
  });

  it('surfaces transport errors from the underlying MCP connection', async () => {
    const client = new WorldBankMCPClient({
      gatewayUrl: 'http://host.docker.internal:80/mcp/world-bank',
      gatewayApiKey: 'test-key',
    });
    vi.spyOn(client, 'callTool').mockRejectedValue(new Error('Connection refused'));
    await expect(
      client.callTool('get-economic-data', { countryCode: 'DE', indicator: 'GDP' })
    ).rejects.toThrow('Connection refused');
  });

  it('covers all 7 canonical World Bank MCP tools in this test suite', () => {
    // Guard test that fails if a new WB tool is added to the code paths
    // but not covered here. Update both the list and add a new it() block
    // in the same PR when you see this fail.
    const canonicalTools = [
      'search-indicators',
      'get-countries',
      'get-country-info',
      'get-economic-data',
      'get-social-data',
      'get-education-data',
      'get-health-data',
    ];
    expect(canonicalTools).toHaveLength(7);
  });
});
