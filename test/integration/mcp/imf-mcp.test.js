// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test: IMF REST client surface.
 *
 * Drift guard for the native TypeScript IMF SDMX 3.0 REST client. Pins
 * the URL shape for each of the five virtual "tool" methods so a
 * refactor that silently changes the HTTP endpoint (e.g. drops
 * `/dataflow/IMF`, reorders SDMX key dimensions, or loses the
 * `format=jsondata` query param) fails a fast, network-free test.
 *
 * Mirrors the pattern of `test/integration/mcp/worldbank-mcp.test.js`
 * (except that mocking happens at the `fetch()` layer because this
 * client no longer talks to an MCP server — the "MCP" prefix in the
 * file name is preserved for discoverability).
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { IMFMCPClient, IMF_MCP_TOOLS } from '../../../scripts/mcp/imf-mcp-client.js';

afterEach(() => {
  vi.restoreAllMocks();
});

const TEST_BASE_URL = 'https://dataservices.imf.org/REST/SDMX_3.0';

/**
 * Build an `IMFMCPClient` whose `fetch` implementation is a vitest mock
 * returning an empty-but-valid SDMX payload for every call. The mock is
 * returned alongside the client so tests can inspect the recorded URL.
 *
 * @returns {{client: IMFMCPClient, fetchSpy: import('vitest').MockInstance}}
 */
function buildMockedClient(body = '{"data":{}}') {
  const fetchSpy = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    async text() {
      return body;
    },
  });
  const client = new IMFMCPClient({
    apiBaseUrl: TEST_BASE_URL,
    fetchImpl: fetchSpy,
  });
  return { client, fetchSpy };
}

describe('integration — IMF REST client surface', () => {
  it('imf-list-databases hits /dataflow/IMF', async () => {
    const { client, fetchSpy } = buildMockedClient(
      JSON.stringify({ data: { dataflows: [{ id: 'WEO', name: 'World Economic Outlook' }] } })
    );
    const result = await client.listDatabases();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe(`${TEST_BASE_URL}/dataflow/IMF`);
    const payload = JSON.parse(result.content[0].text);
    expect(payload[0]).toEqual({ id: 'WEO', name: 'World Economic Outlook', description: '' });
  });

  it('imf-search-databases reuses /dataflow/IMF and filters client-side', async () => {
    const { client, fetchSpy } = buildMockedClient(
      JSON.stringify({
        data: {
          dataflows: [
            { id: 'WEO', name: 'World Economic Outlook' },
            { id: 'CPI', name: 'Consumer Price Index' },
          ],
        },
      })
    );
    const result = await client.searchDatabases('price');
    expect(fetchSpy.mock.calls[0][0]).toBe(`${TEST_BASE_URL}/dataflow/IMF`);
    const rows = JSON.parse(result.content[0].text);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('CPI');
  });

  it('imf-get-parameter-defs hits /datastructure/{id}', async () => {
    const { client, fetchSpy } = buildMockedClient(
      JSON.stringify({
        data: {
          dataStructures: [
            {
              dataStructureComponents: {
                dimensionList: { dimensions: [{ id: 'country' }, { id: 'indicator' }] },
              },
            },
          ],
        },
      })
    );
    const result = await client.getParameterDefs('WEO');
    expect(fetchSpy.mock.calls[0][0]).toBe(`${TEST_BASE_URL}/datastructure/WEO`);
    const rows = JSON.parse(result.content[0].text);
    expect(rows.map((r) => r.id)).toEqual(['country', 'indicator']);
  });

  it('imf-get-parameter-codes hits /datastructure/{id}?references=codelist', async () => {
    const { client, fetchSpy } = buildMockedClient(
      JSON.stringify({
        data: {
          dataStructures: [
            {
              dataStructureComponents: {
                dimensionList: {
                  dimensions: [
                    { id: 'indicator', values: [{ id: 'NGDP_RPCH', name: 'Real GDP growth' }] },
                  ],
                },
              },
            },
          ],
        },
      })
    );
    await client.getParameterCodes('WEO', 'indicator');
    expect(fetchSpy.mock.calls[0][0]).toBe(
      `${TEST_BASE_URL}/datastructure/WEO?references=codelist`
    );
  });

  it('imf-fetch-data builds the canonical SDMX key and query string', async () => {
    const { client, fetchSpy } = buildMockedClient('{"data":{}}');
    await client.fetchData({
      databaseId: 'WEO',
      startYear: 2020,
      endYear: 2030,
      filters: { country: ['DEU', 'FRA'], indicator: ['NGDP_RPCH'] },
    });
    const url = fetchSpy.mock.calls[0][0];
    // `country` is a union of two alphanumeric codes joined with SDMX's
    // literal `+` separator ("DEU+FRA" — URI-encoding each code is
    // idempotent for A-Z). `indicator` is a single code. `frequency` is
    // the wildcard (empty string). Query string carries startPeriod,
    // endPeriod, and format=jsondata.
    expect(url).toContain(`${TEST_BASE_URL}/data/WEO/DEU+FRA.NGDP_RPCH.?`);
    expect(url).toContain('startPeriod=2020');
    expect(url).toContain('endPeriod=2030');
    expect(url).toContain('format=jsondata');
  });

  it('uses the fetch-proxy gateway before direct IMF fetch when configured', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      async text() {
        return JSON.stringify({
          result: { content: [{ text: '{"data":{"dataSets":[{"observations":{"0":1}}]}}' }] },
        });
      },
    });
    const client = new IMFMCPClient({
      apiBaseUrl: TEST_BASE_URL,
      fetchProxyGatewayUrl: 'http://host.docker.internal:8080/mcp/fetch-proxy',
      fetchProxyApiKey: 'test-token',
      fetchImpl: fetchSpy,
    });

    const result = await client.fetchData({
      databaseId: 'WEO',
      startYear: 2025,
      endYear: 2026,
      filters: { country: ['EA'], indicator: ['NGDP_RPCH'] },
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('http://host.docker.internal:8080/mcp/fetch-proxy');
    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBe('Bearer test-token');
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).params.arguments.url).toContain(
      `${TEST_BASE_URL}/data/WEO/EA.NGDP_RPCH.?`
    );
    expect(result.content[0].text).toContain('dataSets');
  });

  it('non-2xx responses surface as the empty fallback (caller-friendly)', async () => {
    const client = new IMFMCPClient({
      apiBaseUrl: TEST_BASE_URL,
      fetchImpl: vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        async text() {
          return '';
        },
      }),
    });
    // Silence the intentional console.warn for cleaner test output.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await client.fetchData({
      databaseId: 'WEO',
      startYear: 2020,
      endYear: 2025,
      filters: { country: ['DEU'] },
    });
    expect(result.content[0].text).toBe('');
  });

  it('covers all canonical IMF virtual tools exported by the client', () => {
    // Drift guard: assert the exported tool list and the endpoints pinned
    // above describe the same surface. If a new method lands on the
    // client but no endpoint test covers it, this fails.
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
