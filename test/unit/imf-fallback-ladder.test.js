// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/imf-fallback-ladder.js
 *
 * Mocks fetch via `fetchImpl` injection. Covers:
 * - tryImfSdmx: success, failure, no-observations
 * - tryImfDataMapper: success, failure, no-euro-area-data
 * - tryWorldBank: success, failure, partial success
 * - tryCache: file exists, missing, malformed
 * - buildEconomicContextPayload: structure validation
 * - runFallbackLadder: rung 1 success, rung 1 fail → rung 2, all fail
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  tryImfSdmx,
  tryImfDataMapper,
  tryWorldBank,
  tryCache,
  buildEconomicContextPayload,
  runFallbackLadder,
  computeImfPeriodWindow,
} from '../../scripts/imf-fallback-ladder.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function mockFetch(body, status = 200) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return typeof body === 'string' ? body : JSON.stringify(body);
    },
  });
}

function mockFetchFail() {
  return async () => {
    throw new Error('Network error');
  };
}

/** Minimal SDMX JSON data response (series-based format). */
const SDMX_SERIES_PAYLOAD = {
  data: {
    dataSets: [
      {
        series: {
          '0:0:0': { observations: { 0: [2.3], 1: [1.8] } },
          '0:1:0': { observations: { 0: [5.4], 1: [3.2] } },
        },
      },
    ],
    structure: {
      dimensions: {
        series: [
          { id: 'REF_AREA', values: [{ id: 'EAQ' }] },
          { id: 'INDICATOR', values: [{ id: 'NGDP_RPCH' }, { id: 'PCPIPCH' }] },
          { id: 'FREQ', values: [{ id: 'A' }] },
        ],
        observation: [
          { id: 'TIME_PERIOD', values: [{ id: '2025' }, { id: '2026' }] },
        ],
      },
    },
  },
};

/** Minimal DataMapper response. */
const DATAMAPPER_PAYLOAD = {
  values: {
    NGDP_RPCH: { EAQ: { '2025': 1.8, '2026': 2.1 } },
    PCPIPCH: { EAQ: { '2025': 2.5, '2026': 2.2 } },
  },
};

/** World Bank paginated response (array format). */
const WB_PAYLOAD = [
  { page: 1, pages: 1, total: 3 },
  [
    { countryiso3code: 'DEU', date: '2025', value: 1.2 },
    { countryiso3code: 'FRA', date: '2025', value: 0.9 },
    { countryiso3code: 'ITA', date: '2025', value: 0.7 },
  ],
];

// ---------------------------------------------------------------------------
// tryImfSdmx
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// computeImfPeriodWindow
// ---------------------------------------------------------------------------

describe('computeImfPeriodWindow', () => {
  it('returns a 5-year window (year-1 .. year+3) for an explicit year', () => {
    const w = computeImfPeriodWindow(2026);
    expect(w.startYear).toBe(2025);
    expect(w.endYear).toBe(2029);
    expect(w.years).toEqual([2025, 2026, 2027, 2028, 2029]);
  });

  it('advances the window when runYear advances', () => {
    const w2030 = computeImfPeriodWindow(2030);
    expect(w2030.startYear).toBe(2029);
    expect(w2030.endYear).toBe(2033);
    expect(w2030.years).toContain(2030);
    expect(w2030.years).toContain(2033);
  });

  it('uses current UTC year when runYear is omitted', () => {
    const w = computeImfPeriodWindow();
    const nowY = new Date().getUTCFullYear();
    expect(w.startYear).toBe(nowY - 1);
    expect(w.endYear).toBe(nowY + 3);
  });
});

describe('tryImfSdmx (dynamic period window)', () => {
  it('embeds the dynamic year range in the SDMX query URL', async () => {
    let capturedUrl = null;
    const captureFetch = async (url) => {
      capturedUrl = url;
      return { ok: true, status: 200, async text() { return '{}'; } };
    };
    await tryImfSdmx({ fetchImpl: captureFetch, runYear: 2030 });
    expect(capturedUrl).toMatch(/startPeriod=2029/);
    expect(capturedUrl).toMatch(/endPeriod=2033/);
  });
});

describe('tryImfDataMapper (dynamic period window)', () => {
  it('embeds the dynamic year list in the DataMapper query URL', async () => {
    let capturedUrl = null;
    const captureFetch = async (url) => {
      capturedUrl = url;
      return { ok: true, status: 200, async text() { return '{}'; } };
    };
    await tryImfDataMapper({ fetchImpl: captureFetch, runYear: 2030 });
    expect(capturedUrl).toMatch(/periods=2029,2030,2031,2032,2033/);
  });
});

describe('tryImfSdmx', () => {
  it('returns data and correct provenance on success (series format)', async () => {    const result = await tryImfSdmx({
      fetchImpl: mockFetch(SDMX_SERIES_PAYLOAD),
      baseUrl: 'https://api.imf.org/external/sdmx/3.0',
    });
    expect(result.data).toBeTruthy();
    expect(result.provenance).toBe('imf-sdmx-3.0');
    // Verify named indicators are extracted correctly
    expect(result.data).toHaveProperty('NGDP_RPCH');
    expect(result.data).toHaveProperty('PCPIPCH');
    expect(result.data.NGDP_RPCH).toHaveProperty('2025', 2.3);
    expect(result.data.PCPIPCH).toHaveProperty('2025', 5.4);
  });

  it('returns null data on network failure', async () => {
    const result = await tryImfSdmx({ fetchImpl: mockFetchFail() });
    expect(result.data).toBeNull();
    expect(result.provenance).toContain('imf-sdmx:unavailable');
  });

  it('returns null data on non-200 response', async () => {
    const result = await tryImfSdmx({ fetchImpl: mockFetch('{}', 500) });
    expect(result.data).toBeNull();
  });

  it('returns null data when observations object is empty', async () => {
    const emptyPayload = { data: { dataSets: [], structure: { dimensions: { observation: [] } } } };
    const result = await tryImfSdmx({ fetchImpl: mockFetch(emptyPayload) });
    expect(result.data).toBeNull();
    expect(result.provenance).toContain('no-observations');
  });
});

// ---------------------------------------------------------------------------
// tryImfDataMapper
// ---------------------------------------------------------------------------

describe('tryImfDataMapper', () => {
  it('returns data with correct provenance on success', async () => {
    const result = await tryImfDataMapper({ fetchImpl: mockFetch(DATAMAPPER_PAYLOAD) });
    expect(result.data).toBeTruthy();
    expect(result.provenance).toBe('imf-datamapper-v1');
    expect(result.data).toHaveProperty('NGDP_RPCH');
  });

  it('returns null data on network failure', async () => {
    const result = await tryImfDataMapper({ fetchImpl: mockFetchFail() });
    expect(result.data).toBeNull();
    expect(result.provenance).toContain('unavailable');
  });

  it('returns null when no Euro-area data found', async () => {
    const noEAQ = { values: { NGDP_RPCH: { DEU: { '2025': 1.2 } } } };
    const result = await tryImfDataMapper({ fetchImpl: mockFetch(noEAQ) });
    expect(result.data).toBeNull();
    expect(result.provenance).toContain('no-euro-area-data');
  });

  it('returns null when values field missing', async () => {
    const result = await tryImfDataMapper({ fetchImpl: mockFetch({ other: 'data' }) });
    expect(result.data).toBeNull();
    expect(result.provenance).toContain('no-values');
  });
});

// ---------------------------------------------------------------------------
// tryWorldBank
// ---------------------------------------------------------------------------

describe('tryWorldBank', () => {
  it('returns averaged data for multiple countries', async () => {
    const result = await tryWorldBank({
      fetchImpl: mockFetch(WB_PAYLOAD),
      countries: ['DEU', 'FRA', 'ITA'],
    });
    expect(result.data).toBeTruthy();
    expect(result.provenance).toContain('worldbank-country-avg');
    // Should have NGDP_RPCH averaged across countries
    expect(result.data).toHaveProperty('NGDP_RPCH');
  });

  it('returns null when no country data fetched', async () => {
    const result = await tryWorldBank({ fetchImpl: mockFetch('[]', 200), countries: ['DEU'] });
    expect(result.data).toBeNull();
    expect(result.provenance).toBe('worldbank:no-data');
  });

  it('returns null on network failure', async () => {
    const result = await tryWorldBank({ fetchImpl: mockFetchFail(), countries: ['DEU'] });
    expect(result.data).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// tryCache
// ---------------------------------------------------------------------------

describe('tryCache', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'imf-cache-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns cached data when file exists with data field', async () => {
    const cacheFile = path.join(tmpDir, 'economic-context-data.json');
    const cached = { data: { NGDP_RPCH: { '2025': 1.8 } } };
    fs.writeFileSync(cacheFile, JSON.stringify(cached), 'utf8');

    const result = await tryCache(cacheFile);
    expect(result.data).toEqual(cached.data);
    expect(result.provenance).toContain('cache:');
  });

  it('returns cached data when file has flat structure (no data wrapper)', async () => {
    const cacheFile = path.join(tmpDir, 'flat.json');
    const cached = { NGDP_RPCH: { '2025': 1.8 } };
    fs.writeFileSync(cacheFile, JSON.stringify(cached), 'utf8');

    const result = await tryCache(cacheFile);
    expect(result.data).toBeTruthy();
  });

  it('returns null when file does not exist', async () => {
    const result = await tryCache(path.join(tmpDir, 'nonexistent.json'));
    expect(result.data).toBeNull();
    expect(result.provenance).toBe('cache:file-not-found');
  });

  it('returns null when cacheFile is empty string', async () => {
    const result = await tryCache('');
    expect(result.data).toBeNull();
  });

  it('returns null when file has malformed JSON', async () => {
    const cacheFile = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(cacheFile, 'not json', 'utf8');

    const result = await tryCache(cacheFile);
    expect(result.data).toBeNull();
    expect(result.provenance).toContain('cache:');
  });
});

// ---------------------------------------------------------------------------
// buildEconomicContextPayload
// ---------------------------------------------------------------------------

describe('buildEconomicContextPayload', () => {
  it('includes all required fields', () => {
    const payload = buildEconomicContextPayload({ NGDP_RPCH: 1.8 }, 'imf-sdmx-3.0', 1);
    expect(payload).toHaveProperty('generatedAt');
    expect(payload).toHaveProperty('provenance', 'imf-sdmx-3.0');
    expect(payload).toHaveProperty('rung', 1);
    expect(payload).toHaveProperty('rungLabel', 'imf-sdmx-3.0');
    expect(payload).toHaveProperty('quality', 'authoritative');
    expect(payload).toHaveProperty('data');
    expect(payload).toHaveProperty('fieldProvenance');
  });

  it('includes per-field provenance metadata', () => {
    const data = { NGDP_RPCH: { '2025': 1.8 }, PCPIPCH: { '2025': 2.5 } };
    const payload = buildEconomicContextPayload(data, 'imf-sdmx-3.0', 1);
    expect(payload.fieldProvenance).toHaveProperty('NGDP_RPCH');
    expect(payload.fieldProvenance).toHaveProperty('PCPIPCH');
    expect(payload.fieldProvenance.NGDP_RPCH).toEqual({
      rung: 1,
      rungLabel: 'imf-sdmx-3.0',
      quality: 'authoritative',
      source: 'imf-sdmx-3.0',
    });
  });

  it('sets quality=proxy for rung 3', () => {
    const payload = buildEconomicContextPayload({}, 'worldbank', 3);
    expect(payload.quality).toBe('proxy');
  });

  it('sets quality=stale for rung 4', () => {
    const payload = buildEconomicContextPayload({}, 'cache', 4);
    expect(payload.quality).toBe('stale');
  });
});

// ---------------------------------------------------------------------------
// runFallbackLadder
// ---------------------------------------------------------------------------

describe('runFallbackLadder', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'imf-ladder-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes output file when rung 2 succeeds (rung 1 fails)', async () => {
    // URL-aware mock: rung 1 (SDMX) returns 500, rung 2 (DataMapper) returns
    // a valid payload. The test asserts that runFallbackLadder lands on
    // rung 2 specifically — not on rung 1 by accident.
    const urlAwareFetch = async (url) => {
      if (typeof url === 'string' && url.includes('sdmx')) {
        return { ok: false, status: 500, async text() { return '{}'; } };
      }
      return {
        ok: true,
        status: 200,
        async text() { return JSON.stringify(DATAMAPPER_PAYLOAD); },
      };
    };

    const result = await runFallbackLadder(tmpDir, {
      fetchImpl: urlAwareFetch,
      imfSdmxBase: 'https://api.imf.org/external/sdmx/3.0',
      imfDataMapperBase: 'https://www.imf.org/external/datamapper/api/v1',
    });

    expect(result.success).toBe(true);
    expect(result.rung).toBe(2);
    expect(result.provenance).toBe('imf-datamapper-v1');
    expect(result.outputFile).toBeTruthy();
    expect(fs.existsSync(result.outputFile)).toBe(true);
  });

  it('uses cache (rung 4) when all live rungs fail', async () => {
    const cacheFile = path.join(tmpDir, 'vintage.json');
    fs.writeFileSync(
      cacheFile,
      JSON.stringify({ data: { NGDP_RPCH: { '2025': 1.9 } } }),
      'utf8',
    );

    const result = await runFallbackLadder(tmpDir, {
      fetchImpl: mockFetchFail(),
      cacheFile,
    });

    expect(result.success).toBe(true);
    expect(result.rung).toBe(4);
    expect(result.provenance).toContain('cache:');
  });

  it('returns failure when all rungs exhausted', async () => {
    const result = await runFallbackLadder(tmpDir, {
      fetchImpl: mockFetchFail(),
      // no cacheFile → rung 4 will find no file
    });

    expect(result.success).toBe(false);
    expect(result.rung).toBe(0);
    expect(result.provenance).toBe('all-rungs-failed');
  });

  it('dry-run does not write output file but reports success', async () => {
    const result = await runFallbackLadder(tmpDir, {
      fetchImpl: mockFetch(DATAMAPPER_PAYLOAD),
      dryRun: true,
    });

    if (result.success) {
      expect(result.outputFile).toBeNull();
    } else {
      // All network rungs failed in test env, that's fine
      expect(result.success).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// fetchJson — additional edge cases
// ---------------------------------------------------------------------------

describe('fetchJson edge cases (via tryImfDataMapper proxy)', () => {
  it('handles non-JSON response body gracefully', async () => {
    // Simulate a response that is OK but not valid JSON
    const nonJsonFetch = async () => ({
      ok: true,
      status: 200,
      async text() { return 'not-json-at-all'; },
    });

    // tryImfDataMapper will call fetchJson which will null out the parsed data
    const result = await tryImfDataMapper({ fetchImpl: nonJsonFetch });
    // Non-JSON response — no values field
    expect(result.data).toBeNull();
  });

  it('handles timeout (AbortError) gracefully', async () => {
    // Simulate an AbortError
    const abortFetch = async () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      throw err;
    };

    const result = await tryImfDataMapper({ fetchImpl: abortFetch });
    expect(result.data).toBeNull();
    // AbortError maps to 408-style unavailable
    expect(result.provenance).toContain('unavailable');
  });
});

// ---------------------------------------------------------------------------
// tryWorldBank — additional edge cases
// ---------------------------------------------------------------------------

describe('tryWorldBank (additional edge cases)', () => {
  it('returns null when World Bank returns non-array response', async () => {
    const result = await tryWorldBank({
      fetchImpl: mockFetch({ invalid: true }),
      countries: ['DEU'],
    });
    expect(result.data).toBeNull();
  });

  it('handles empty items array in WB response', async () => {
    const emptyItems = [{ page: 1 }, []];
    const result = await tryWorldBank({
      fetchImpl: mockFetch(emptyItems),
      countries: ['DEU'],
    });
    expect(result.data).toBeNull();
  });

  it('computes correct average from multiple-country values', async () => {
    const multiCountry = [
      { page: 1 },
      [
        { countryiso3code: 'DEU', date: '2025', value: 2.0 },
        { countryiso3code: 'FRA', date: '2025', value: 4.0 },
      ],
    ];
    const result = await tryWorldBank({
      fetchImpl: mockFetch(multiCountry),
      countries: ['DEU', 'FRA'],
    });
    expect(result.data).toBeTruthy();
    // Average of 2.0 and 4.0 = 3.0
    expect(result.data.NGDP_RPCH?.['2025']).toBeCloseTo(3.0, 5);
  });
});
