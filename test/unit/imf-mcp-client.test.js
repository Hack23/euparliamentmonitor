// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for imf-mcp-client.js (native TypeScript IMF SDMX REST client).
 *
 * Mocks `fetch()` (injected via the `fetchImpl` option) so the tests are
 * network-free and deterministic. Covers:
 * - IMF_MCP_TOOLS drift guard
 * - Client construction (defaults, env vars, explicit options)
 * - Each semantic tool wrapper (listDatabases, searchDatabases,
 *   getParameterDefs, getParameterCodes, fetchData) — success path,
 *   input-validation path, and transport-error fallback path.
 * - Singleton lifecycle.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  IMFMCPClient,
  IMFClient,
  IMF_MCP_TOOLS,
  getIMFMCPClient,
  closeIMFMCPClient,
  countIMFSDMXObservations,
} from '../../scripts/mcp/imf-mcp-client.js';
import { mockConsole } from '../helpers/test-utils.js';

/**
 * Build a minimal `fetch`-compatible mock that returns the given body
 * and status for a single call. Accepts a string body (JSON or SDMX-JSON)
 * and produces a `Response`-like object with the subset of methods the
 * client actually uses (`ok`, `status`, `statusText`, `text()`).
 */
function mockFetchResponse(body, { status = 200, statusText = 'OK' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    async text() {
      return body;
    },
  };
}

describe('imf-mcp-client', () => {
  describe('IMF_MCP_TOOLS drift guard', () => {
    it('exposes exactly the five virtual IMF tool names', () => {
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

  describe('IMFClient alias', () => {
    it('is the same class as IMFMCPClient (forward-looking alias)', () => {
      expect(IMFClient).toBe(IMFMCPClient);
    });
  });

  describe('countIMFSDMXObservations', () => {
    it('counts observations nested under SDMX series rows', () => {
      const payload = {
        data: {
          dataSets: [
            {
              series: {
                '0:0:0': { observations: { 0: [1.2], 1: [1.4] } },
                '1:0:0': { observations: { 0: [0.8] } },
              },
            },
          ],
        },
      };

      expect(countIMFSDMXObservations(JSON.stringify(payload))).toBe(3);
      expect(countIMFSDMXObservations(payload)).toBe(3);
    });

    it('counts flat dataset observations and returns zero for invalid JSON', () => {
      expect(
        countIMFSDMXObservations({
          data: {
            dataSets: [{ observations: { 0: [2.1], 1: [2.2] } }],
          },
        })
      ).toBe(2);
      expect(countIMFSDMXObservations('not-json')).toBe(0);
      expect(countIMFSDMXObservations({ data: { dataSets: [] } })).toBe(0);
    });
  });

  describe('IMFMCPClient construction', () => {
    let consoleOutput;
    const originalEnv = { ...process.env };

    beforeEach(() => {
      consoleOutput = mockConsole();
    });

    afterEach(() => {
      consoleOutput.restore();
      for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) {
          delete process.env[key];
        }
      }
      for (const [key, value] of Object.entries(originalEnv)) {
        process.env[key] = value;
      }
    });

    it('uses the default SDMX 3.0 base URL and timeout', () => {
      delete process.env['IMF_API_BASE_URL'];
      delete process.env['IMF_API_TIMEOUT_MS'];
      const c = new IMFMCPClient();
      expect(c.getApiBaseUrl()).toBe('https://dataservices.imf.org/REST/SDMX_3.0');
      expect(c.getTimeoutMs()).toBe(30_000);
      expect(c.isConnected()).toBe(false);
    });

    it('honours IMF_API_BASE_URL env var and strips trailing slashes', () => {
      process.env['IMF_API_BASE_URL'] = 'https://custom.example.com/api///';
      const c = new IMFMCPClient();
      expect(c.getApiBaseUrl()).toBe('https://custom.example.com/api');
    });

    it('honours IMF_API_TIMEOUT_MS env var', () => {
      process.env['IMF_API_TIMEOUT_MS'] = '15000';
      const c = new IMFMCPClient();
      expect(c.getTimeoutMs()).toBe(15_000);
    });

    it('prefers explicit options over env vars', () => {
      process.env['IMF_API_BASE_URL'] = 'https://env.example.com';
      process.env['IMF_API_TIMEOUT_MS'] = '5000';
      const c = new IMFMCPClient({
        apiBaseUrl: 'https://explicit.example.com',
        timeoutMs: 12_345,
      });
      expect(c.getApiBaseUrl()).toBe('https://explicit.example.com');
      expect(c.getTimeoutMs()).toBe(12_345);
    });

    it('ignores a malformed timeout env var and falls back to the default', () => {
      process.env['IMF_API_TIMEOUT_MS'] = 'not-a-number';
      const c = new IMFMCPClient();
      expect(c.getTimeoutMs()).toBe(30_000);
    });

    it('connect() accepts a valid base URL and disconnect() clears it', async () => {
      const c = new IMFMCPClient({ apiBaseUrl: 'https://dataservices.imf.org/REST/SDMX_3.0' });
      await c.connect();
      expect(c.isConnected()).toBe(true);
      c.disconnect();
      expect(c.isConnected()).toBe(false);
    });

    it('connect() rejects a malformed base URL', async () => {
      const c = new IMFMCPClient({ apiBaseUrl: 'not a url' });
      await expect(c.connect()).rejects.toThrow(/Invalid IMF_API_BASE_URL/);
    });
  });

  describe('listDatabases', () => {
    let consoleOutput;
    beforeEach(() => {
      consoleOutput = mockConsole();
    });
    afterEach(() => consoleOutput.restore());

    it('requests the /dataflow/IMF endpoint and normalises the payload', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(
        mockFetchResponse(
          JSON.stringify({
            data: {
              dataflows: [
                { id: 'WEO', name: { en: 'World Economic Outlook' }, description: 'Forecasts' },
                { id: 'IFS', name: 'International Financial Statistics' },
              ],
            },
          })
        )
      );
      const client = new IMFMCPClient({
        apiBaseUrl: 'https://dataservices.imf.org/REST/SDMX_3.0',
        fetchImpl,
      });
      const result = await client.listDatabases();

      expect(fetchImpl).toHaveBeenCalledTimes(1);
      const calledUrl = fetchImpl.mock.calls[0][0];
      expect(calledUrl).toBe('https://dataservices.imf.org/REST/SDMX_3.0/dataflow/IMF');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual([
        { id: 'WEO', name: 'World Economic Outlook', description: 'Forecasts' },
        { id: 'IFS', name: 'International Financial Statistics', description: '' },
      ]);
    });

    it('returns empty fallback on HTTP error', async () => {
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(mockFetchResponse('gateway error', { status: 502, statusText: 'Bad Gateway' }));
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.listDatabases();
      expect(result.content[0].text).toBe('');
    });

    it('returns empty fallback on network/abort error', async () => {
      const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.listDatabases();
      expect(result.content[0].text).toBe('');
    });
  });

  describe('searchDatabases', () => {
    let consoleOutput;
    beforeEach(() => {
      consoleOutput = mockConsole();
    });
    afterEach(() => consoleOutput.restore());

    it('filters the dataflow list by case-insensitive substring', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(
        mockFetchResponse(
          JSON.stringify({
            data: {
              dataflows: [
                { id: 'CPI', name: 'Consumer Price Index', description: 'Inflation series' },
                { id: 'WEO', name: 'World Economic Outlook', description: '' },
                { id: 'BOP_AGG', name: 'Balance of Payments', description: '' },
              ],
            },
          })
        )
      );
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.searchDatabases('Inflation');
      const rows = JSON.parse(result.content[0].text);
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe('CPI');
    });

    it('returns empty fallback without calling fetch when keyword is blank', async () => {
      const fetchImpl = vi.fn();
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.searchDatabases('');
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('');
    });
  });

  describe('getParameterDefs', () => {
    let consoleOutput;
    beforeEach(() => {
      consoleOutput = mockConsole();
    });
    afterEach(() => consoleOutput.restore());

    it('requests /datastructure/{id} and extracts the dimension list', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(
        mockFetchResponse(
          JSON.stringify({
            data: {
              dataStructures: [
                {
                  id: 'WEO',
                  dataStructureComponents: {
                    dimensionList: {
                      dimensions: [
                        { id: 'country', name: { en: 'Country' } },
                        { id: 'indicator', name: 'Indicator' },
                        { id: 'frequency' },
                      ],
                    },
                  },
                },
              ],
            },
          })
        )
      );
      const client = new IMFMCPClient({
        apiBaseUrl: 'https://dataservices.imf.org/REST/SDMX_3.0',
        fetchImpl,
      });
      const result = await client.getParameterDefs('WEO');

      const url = fetchImpl.mock.calls[0][0];
      expect(url).toBe('https://dataservices.imf.org/REST/SDMX_3.0/datastructure/WEO');

      const rows = JSON.parse(result.content[0].text);
      expect(rows).toEqual([
        { id: 'country', name: 'Country' },
        { id: 'indicator', name: 'Indicator' },
        { id: 'frequency', name: '' },
      ]);
    });

    it('validates the databaseId argument', async () => {
      const fetchImpl = vi.fn();
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.getParameterDefs('');
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('');
    });

    it('URI-encodes the databaseId', async () => {
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(mockFetchResponse(JSON.stringify({ data: { dataStructures: [] } })));
      const client = new IMFMCPClient({
        apiBaseUrl: 'https://example.com',
        fetchImpl,
      });
      await client.getParameterDefs('DB/ID WITH SPACES');
      const url = fetchImpl.mock.calls[0][0];
      expect(url).toContain('/datastructure/DB%2FID%20WITH%20SPACES');
    });
  });

  describe('getParameterCodes', () => {
    let consoleOutput;
    beforeEach(() => {
      consoleOutput = mockConsole();
    });
    afterEach(() => consoleOutput.restore());

    it('requires databaseId and parameter', async () => {
      const fetchImpl = vi.fn();
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.getParameterCodes('', 'country');
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('');
    });

    it('returns codes from an inlined `values` array when present', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(
        mockFetchResponse(
          JSON.stringify({
            data: {
              dataStructures: [
                {
                  id: 'WEO',
                  dataStructureComponents: {
                    dimensionList: {
                      dimensions: [
                        {
                          id: 'indicator',
                          name: 'Indicator',
                          values: [
                            { id: 'NGDP_RPCH', name: { en: 'Real GDP growth' } },
                            { id: 'PCPIPCH', name: 'CPI inflation' },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
            },
          })
        )
      );
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.getParameterCodes('WEO', 'indicator');
      const rows = JSON.parse(result.content[0].text);
      expect(rows).toEqual([
        { id: 'NGDP_RPCH', name: 'Real GDP growth' },
        { id: 'PCPIPCH', name: 'CPI inflation' },
      ]);
    });

    it('resolves codes from a referenced codelist when inline values are empty', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(
        mockFetchResponse(
          JSON.stringify({
            data: {
              dataStructures: [
                {
                  id: 'WEO',
                  dataStructureComponents: {
                    dimensionList: {
                      dimensions: [
                        {
                          id: 'country',
                          localRepresentation: {
                            enumeration: 'urn:sdmx:infomodel.codelist.Codelist=IMF:CL_AREA(1.0)',
                          },
                        },
                      ],
                    },
                  },
                },
              ],
              codelists: [
                {
                  id: 'CL_AREA',
                  codes: [
                    { id: 'DEU', name: 'Germany' },
                    { id: 'FRA', name: 'France' },
                  ],
                },
              ],
            },
          })
        )
      );
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.getParameterCodes('WEO', 'country');
      const rows = JSON.parse(result.content[0].text);
      expect(rows).toEqual([
        { id: 'DEU', name: 'Germany' },
        { id: 'FRA', name: 'France' },
      ]);
    });

    it('applies the search filter as a case-insensitive substring', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(
        mockFetchResponse(
          JSON.stringify({
            data: {
              dataStructures: [
                {
                  id: 'WEO',
                  dataStructureComponents: {
                    dimensionList: {
                      dimensions: [
                        {
                          id: 'indicator',
                          values: [
                            { id: 'NGDP', name: 'Nominal GDP' },
                            { id: 'NGDP_RPCH', name: 'Real GDP growth' },
                            { id: 'PCPIPCH', name: 'CPI inflation' },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
            },
          })
        )
      );
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.getParameterCodes('WEO', 'indicator', 'ngdp');
      const rows = JSON.parse(result.content[0].text);
      expect(rows.map((r) => r.id)).toEqual(['NGDP', 'NGDP_RPCH']);
    });

    it('returns an empty list when the requested dimension is not declared', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(
        mockFetchResponse(
          JSON.stringify({
            data: {
              dataStructures: [
                {
                  id: 'WEO',
                  dataStructureComponents: {
                    dimensionList: { dimensions: [{ id: 'country' }] },
                  },
                },
              ],
            },
          })
        )
      );
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.getParameterCodes('WEO', 'no-such-dim');
      expect(result.content[0].text).toBe('[]');
    });
  });

  describe('fetchData', () => {
    let consoleOutput;
    beforeEach(() => {
      consoleOutput = mockConsole();
    });
    afterEach(() => consoleOutput.restore());

    it('builds the SDMX URL using the default dimension order for WEO', async () => {
      const sdmxPayload = JSON.stringify({ data: { dataSets: [{ series: {} }], structure: {} } });
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse(sdmxPayload));
      const client = new IMFMCPClient({
        apiBaseUrl: 'https://dataservices.imf.org/REST/SDMX_3.0',
        fetchImpl,
      });
      const result = await client.fetchData({
        databaseId: 'WEO',
        startYear: 2020,
        endYear: 2030,
        filters: { country: ['DEU', 'FRA'], indicator: ['NGDP_RPCH'] },
      });

      expect(fetchImpl).toHaveBeenCalledTimes(1);
      const url = fetchImpl.mock.calls[0][0];
      // WEO order is country.indicator.frequency; `country` carries a
      // union of two codes joined with SDMX's `+` separator (each code
      // URI-encoded first — idempotent for alphanumeric), `frequency`
      // is omitted so the slot becomes the empty-string wildcard.
      expect(url).toContain('/data/WEO/DEU+FRA.NGDP_RPCH.?');
      expect(url).toContain('startPeriod=2020');
      expect(url).toContain('endPeriod=2030');
      expect(url).toContain('format=jsondata');
      expect(result.content[0].text).toBe(sdmxPayload);
    });

    it('honours a caller-supplied dimensionOrder override', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse('{}'));
      const client = new IMFMCPClient({
        apiBaseUrl: 'https://example.com',
        fetchImpl,
      });
      await client.fetchData({
        databaseId: 'IFS',
        startYear: 2024,
        endYear: 2025,
        filters: { frequency: ['M'], country: ['DEU'], indicator: ['FPOLM_PA'] },
        dimensionOrder: ['frequency', 'country', 'indicator'],
      });
      const url = fetchImpl.mock.calls[0][0];
      expect(url).toContain('/data/IFS/M.DEU.FPOLM_PA?');
    });

    it('rejects an empty filters map', async () => {
      const fetchImpl = vi.fn();
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.fetchData({
        databaseId: 'WEO',
        startYear: 2020,
        endYear: 2025,
        filters: {},
      });
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('');
    });

    it('rejects an inverted year range', async () => {
      const fetchImpl = vi.fn();
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.fetchData({
        databaseId: 'WEO',
        startYear: 2030,
        endYear: 2020,
        filters: { country: ['DEU'] },
      });
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('');
    });

    it('rejects non-finite year inputs', async () => {
      const fetchImpl = vi.fn();
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.fetchData({
        databaseId: 'WEO',
        startYear: Number.NaN,
        endYear: 2025,
        filters: { country: ['DEU'] },
      });
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('');
    });

    it('returns empty fallback when the transport fails', async () => {
      const fetchImpl = vi.fn().mockRejectedValue(new Error('upstream-5xx'));
      const client = new IMFMCPClient({ fetchImpl });
      const result = await client.fetchData({
        databaseId: 'WEO',
        startYear: 2020,
        endYear: 2025,
        filters: { country: ['DEU'], indicator: ['NGDP_RPCH'] },
      });
      expect(result.content[0].text).toBe('');
    });

    it('URI-encodes dimension codes containing reserved characters', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse('{}'));
      const client = new IMFMCPClient({
        apiBaseUrl: 'https://example.com',
        fetchImpl,
      });
      await client.fetchData({
        databaseId: 'WEO',
        startYear: 2024,
        endYear: 2024,
        filters: { country: ['DEU+FRA'], indicator: ['NGDP_RPCH'] },
      });
      const url = fetchImpl.mock.calls[0][0];
      // `+` inside a single country code must be %-encoded so SDMX does
      // not interpret it as the "union-of-codes" separator.
      expect(url).toContain('/data/WEO/DEU%2BFRA.NGDP_RPCH.?');
    });
  });

  describe('Singleton lifecycle', () => {
    afterEach(async () => {
      await closeIMFMCPClient();
    });

    it('closeIMFMCPClient is safe to call when no instance exists', async () => {
      await closeIMFMCPClient();
    });

    it('closeIMFMCPClient is idempotent', async () => {
      await closeIMFMCPClient();
      await closeIMFMCPClient();
      await closeIMFMCPClient();
    });

    it('getIMFMCPClient returns a connected singleton', async () => {
      const c = await getIMFMCPClient({
        apiBaseUrl: 'https://dataservices.imf.org/REST/SDMX_3.0',
      });
      expect(c).toBeInstanceOf(IMFMCPClient);
      expect(c.isConnected()).toBe(true);

      const c2 = await getIMFMCPClient();
      expect(c2).toBe(c);
    });

    it('getIMFMCPClient rejects a malformed base URL', async () => {
      await expect(getIMFMCPClient({ apiBaseUrl: 'not a url' })).rejects.toThrow(/Invalid IMF_API_BASE_URL/);
    });
  });
});
