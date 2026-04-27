// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for ep-open-data-client.js (EP Open Data Portal voting fallback).
 *
 * Mocks `fetch()` (injected via the `fetchImpl` option) so the tests are
 * network-free and deterministic. Covers:
 *
 * - EP_OPEN_DATA_TOOLS drift guard
 * - Client construction (defaults, env vars, explicit options)
 * - getVotingRecords — success path, input-validation path, HTTP error,
 *   network error
 * - isVotingDataEmpty — various shapes
 * - buildVotingUnavailableMarker — shape and content
 * - Three-state fallback (getVotingRecordsWithFallback):
 *   (a) MCP returns non-empty data → source: "mcp"
 *   (b) MCP empty, Portal has data → source: "ep-open-data-portal"
 *   (c) Both empty                 → source: "unavailable" with 🔴 marker
 * - Singleton lifecycle (getEPOpenDataClient / closeEPOpenDataClient)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  EPOpenDataClient,
  EPOpenDataPortalClient,
  EP_OPEN_DATA_TOOLS,
  getVotingRecordsWithFallback,
  getEPOpenDataClient,
  closeEPOpenDataClient,
} from '../../scripts/mcp/ep-open-data-client.js';
import { mockConsole } from '../helpers/test-utils.js';

/**
 * Build a minimal `fetch`-compatible mock that returns the given body
 * and status for a single call.
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

/** Helper: build a non-empty MCP votes result (as returned by get_voting_records). */
function buildMCPVotesResult(votes = []) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ votes }) }],
  };
}

/** Helper: the standard EP Open Data Portal JSON-LD response with one decision. */
const SAMPLE_DECISION_RESPONSE = JSON.stringify({
  '@context': 'https://data.europarl.europa.eu/api/v2/contexts/decisions.jsonld',
  data: [
    {
      '@id': 'https://data.europarl.europa.eu/decision/A9-2026-0123',
      identifier: 'A9-2026-0123',
      date: '2026-04-10',
      activityType: 'ep-activities:VOTE',
      prefLabel: { en: 'Critical Raw Materials Act — final' },
      favorable: 412,
      against: 189,
      abstention: 68,
    },
  ],
});

/** Helper: EP Open Data Portal response with zero decisions. */
const EMPTY_DECISIONS_RESPONSE = JSON.stringify({ data: [] });

describe('ep-open-data-client', () => {
  // ──────────────────────────────────────────────────────────────────────────
  describe('EP_OPEN_DATA_TOOLS drift guard', () => {
    it('exposes exactly the one virtual tool name', () => {
      expect([...EP_OPEN_DATA_TOOLS].sort()).toEqual(['ep-get-voting-records']);
    });

    it('is a readonly array of strings', () => {
      expect(Array.isArray(EP_OPEN_DATA_TOOLS)).toBe(true);
      for (const t of EP_OPEN_DATA_TOOLS) {
        expect(typeof t).toBe('string');
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('EPOpenDataPortalClient alias', () => {
    it('is the same class as EPOpenDataClient', () => {
      expect(EPOpenDataPortalClient).toBe(EPOpenDataClient);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('EPOpenDataClient construction', () => {
    let consoleOutput;
    const originalEnv = { ...process.env };

    beforeEach(() => {
      consoleOutput = mockConsole();
    });

    afterEach(() => {
      consoleOutput.restore();
      for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) delete process.env[key];
      }
      for (const [key, value] of Object.entries(originalEnv)) {
        process.env[key] = value;
      }
    });

    it('uses the default EP Open Data base URL and timeout', () => {
      delete process.env['EP_OPEN_DATA_BASE_URL'];
      delete process.env['EP_OPEN_DATA_TIMEOUT_MS'];
      const c = new EPOpenDataClient({ dateFrom: '', dateTo: '' });
      expect(c.getApiBaseUrl()).toBe('https://data.europarl.europa.eu/api/v2');
      expect(c.getTimeoutMs()).toBe(30_000);
      expect(c.isConnected()).toBe(false);
    });

    it('honours EP_OPEN_DATA_BASE_URL env var and strips trailing slashes', () => {
      process.env['EP_OPEN_DATA_BASE_URL'] = 'https://custom.example.com/api///';
      const c = new EPOpenDataClient({ dateFrom: '', dateTo: '' });
      expect(c.getApiBaseUrl()).toBe('https://custom.example.com/api');
    });

    it('honours EP_OPEN_DATA_TIMEOUT_MS env var', () => {
      process.env['EP_OPEN_DATA_TIMEOUT_MS'] = '15000';
      const c = new EPOpenDataClient({ dateFrom: '', dateTo: '' });
      expect(c.getTimeoutMs()).toBe(15_000);
    });

    it('prefers explicit options over env vars', () => {
      process.env['EP_OPEN_DATA_BASE_URL'] = 'https://env.example.com';
      process.env['EP_OPEN_DATA_TIMEOUT_MS'] = '5000';
      const c = new EPOpenDataClient({
        dateFrom: '',
        dateTo: '',
        apiBaseUrl: 'https://explicit.example.com',
        timeoutMs: 12_345,
      });
      expect(c.getApiBaseUrl()).toBe('https://explicit.example.com');
      expect(c.getTimeoutMs()).toBe(12_345);
    });

    it('ignores a malformed timeout env var and falls back to the default', () => {
      process.env['EP_OPEN_DATA_TIMEOUT_MS'] = 'not-a-number';
      const c = new EPOpenDataClient({ dateFrom: '', dateTo: '' });
      expect(c.getTimeoutMs()).toBe(30_000);
    });

    it('connect() accepts a valid base URL and disconnect() clears it', async () => {
      const c = new EPOpenDataClient({
        dateFrom: '',
        dateTo: '',
        apiBaseUrl: 'https://data.europarl.europa.eu/api/v2',
      });
      await c.connect();
      expect(c.isConnected()).toBe(true);
      c.disconnect();
      expect(c.isConnected()).toBe(false);
    });

    it('connect() rejects a malformed base URL', async () => {
      const c = new EPOpenDataClient({ dateFrom: '', dateTo: '', apiBaseUrl: 'not a url' });
      await expect(c.connect()).rejects.toThrow(/Invalid EP_OPEN_DATA_BASE_URL/);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('getVotingRecords', () => {
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
    });
    afterEach(() => consoleOutput.restore());

    it('requests /decision with correct query parameters and normalises the response', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse(SAMPLE_DECISION_RESPONSE));
      const client = new EPOpenDataClient({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
        fetchImpl,
        apiBaseUrl: 'https://data.europarl.europa.eu/api/v2',
      });
      const result = await client.getVotingRecords({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      });

      expect(fetchImpl).toHaveBeenCalledTimes(1);
      const calledUrl = fetchImpl.mock.calls[0][0];
      expect(calledUrl).toContain('/decision?');
      expect(calledUrl).toContain('date-of-vote-start=2026-04-01');
      expect(calledUrl).toContain('date-of-vote-end=2026-04-30');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.votes).toHaveLength(1);
      expect(parsed.votes[0].identifier).toBe('A9-2026-0123');
      expect(parsed.votes[0].for).toBe(412);
      expect(parsed.votes[0].against).toBe(189);
      expect(parsed.votes[0].abstain).toBe(68);
      expect(parsed.votes[0].title).toBe('Critical Raw Materials Act — final');
      expect(parsed._source).toBe('ep-open-data-portal');
      expect(parsed._attribution).toContain('europarl.europa.eu');
    });

    it('extracts identifier from @id URI when identifier field is absent', async () => {
      const responseWithoutIdentifier = JSON.stringify({
        data: [
          {
            '@id': 'https://data.europarl.europa.eu/decision/A9-2026-0456',
            date: '2026-04-15',
            favorable: 300,
            against: 100,
            abstention: 20,
          },
        ],
      });
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse(responseWithoutIdentifier));
      const client = new EPOpenDataClient({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
        fetchImpl,
      });
      const result = await client.getVotingRecords({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.votes[0].identifier).toBe('A9-2026-0456');
    });

    it('returns empty votes on empty data array', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse(EMPTY_DECISIONS_RESPONSE));
      const client = new EPOpenDataClient({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
        fetchImpl,
      });
      const result = await client.getVotingRecords({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      });
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.votes).toHaveLength(0);
    });

    it('returns empty-votes fallback without calling fetch when dateFrom is missing', async () => {
      const fetchImpl = vi.fn();
      const client = new EPOpenDataClient({ dateFrom: '', dateTo: '', fetchImpl });
      const result = await client.getVotingRecords({ dateFrom: '', dateTo: '2026-04-30' });
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('{"votes":[]}');
    });

    it('returns empty-votes fallback without calling fetch when dateTo is missing', async () => {
      const fetchImpl = vi.fn();
      const client = new EPOpenDataClient({ dateFrom: '', dateTo: '', fetchImpl });
      const result = await client.getVotingRecords({ dateFrom: '2026-04-01', dateTo: '' });
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(result.content[0].text).toBe('{"votes":[]}');
    });

    it('returns empty-votes fallback on HTTP error', async () => {
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(mockFetchResponse('bad gateway', { status: 502, statusText: 'Bad Gateway' }));
      const client = new EPOpenDataClient({ dateFrom: '', dateTo: '', fetchImpl });
      const result = await client.getVotingRecords({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      });
      expect(result.content[0].text).toBe('{"votes":[]}');
    });

    it('returns empty-votes fallback on network error', async () => {
      const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      const client = new EPOpenDataClient({ dateFrom: '', dateTo: '', fetchImpl });
      const result = await client.getVotingRecords({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      });
      expect(result.content[0].text).toBe('{"votes":[]}');
    });

    it('returns empty-votes fallback on non-JSON response', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse('not json at all'));
      const client = new EPOpenDataClient({ dateFrom: '', dateTo: '', fetchImpl });
      const result = await client.getVotingRecords({
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      });
      expect(result.content[0].text).toBe('{"votes":[]}');
    });

    it('uses Accept header for JSON-LD', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(mockFetchResponse(SAMPLE_DECISION_RESPONSE));
      const client = new EPOpenDataClient({ dateFrom: '', dateTo: '', fetchImpl });
      await client.getVotingRecords({ dateFrom: '2026-04-01', dateTo: '2026-04-30' });
      const headers = fetchImpl.mock.calls[0][1]?.headers;
      expect(headers?.Accept ?? headers?.accept).toMatch(/ld\+json/);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('isVotingDataEmpty (static)', () => {
    it('returns true for empty votes array', () => {
      expect(EPOpenDataClient.isVotingDataEmpty(buildMCPVotesResult([]))).toBe(true);
    });

    it('returns false for non-empty votes array', () => {
      expect(
        EPOpenDataClient.isVotingDataEmpty(
          buildMCPVotesResult([{ identifier: 'A9-0001', for: 400 }])
        )
      ).toBe(false);
    });

    it('returns true for {"votes":null}', () => {
      expect(
        EPOpenDataClient.isVotingDataEmpty({
          content: [{ type: 'text', text: '{"votes":null}' }],
        })
      ).toBe(true);
    });

    it('returns true for missing content array', () => {
      expect(EPOpenDataClient.isVotingDataEmpty({ content: undefined })).toBe(true);
    });

    it('returns true for empty content text', () => {
      expect(EPOpenDataClient.isVotingDataEmpty({ content: [{ type: 'text', text: '' }] })).toBe(
        true
      );
    });

    it('returns true for non-JSON content text', () => {
      expect(
        EPOpenDataClient.isVotingDataEmpty({ content: [{ type: 'text', text: 'bad json' }] })
      ).toBe(true);
    });

    it('returns true for the 🔴 unavailability marker (votes:[]) shape', () => {
      const marker = EPOpenDataClient.buildVotingUnavailableMarker('2026-04-01', '2026-04-26');
      expect(EPOpenDataClient.isVotingDataEmpty(marker)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('buildVotingUnavailableMarker (static)', () => {
    it('returns an MCP-shaped result with empty votes array', () => {
      const result = EPOpenDataClient.buildVotingUnavailableMarker('2026-04-01', '2026-04-26');
      expect(result.content).toHaveLength(1);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.votes).toEqual([]);
      expect(parsed._unavailable).toBe(true);
    });

    it('includes the 🔴 marker string with the date window', () => {
      const result = EPOpenDataClient.buildVotingUnavailableMarker('2026-04-01', '2026-04-26');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed._marker).toContain('🔴');
      expect(parsed._marker).toContain('2026-04-01');
      expect(parsed._marker).toContain('2026-04-26');
    });

    it('includes a reason string with guidance on structural-proxy use', () => {
      const result = EPOpenDataClient.buildVotingUnavailableMarker('2026-04-01', '2026-04-26');
      const parsed = JSON.parse(result.content[0].text);
      expect(typeof parsed._reason).toBe('string');
      expect(parsed._reason.length).toBeGreaterThan(50);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('getVotingRecordsWithFallback — three-state decision tree', () => {
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
    });
    afterEach(() => consoleOutput.restore());

    it('(a) uses MCP result when it contains non-empty votes', async () => {
      const mcpResult = buildMCPVotesResult([{ identifier: 'A9-0001', for: 400 }]);
      const fetchImpl = vi.fn();
      const { result, source, freshnessLabel } = await getVotingRecordsWithFallback(mcpResult, {
        dateFrom: '2026-04-01',
        dateTo: '2026-04-26',
        fetchImpl,
      });
      // Should NOT call fetch — data came from MCP
      expect(fetchImpl).not.toHaveBeenCalled();
      expect(source).toBe('mcp');
      expect(freshnessLabel).toContain('🟢');
      expect(freshnessLabel).toContain('2026-04-01');
      expect(result).toBe(mcpResult);
    });

    it('(b) falls back to EP Open Data Portal when MCP returns empty', async () => {
      const mcpResult = buildMCPVotesResult([]);
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(mockFetchResponse(SAMPLE_DECISION_RESPONSE));
      const { result, source, freshnessLabel } = await getVotingRecordsWithFallback(mcpResult, {
        dateFrom: '2026-04-01',
        dateTo: '2026-04-26',
        fetchImpl,
      });
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      expect(source).toBe('ep-open-data-portal');
      expect(freshnessLabel).toContain('🟡');
      expect(freshnessLabel).toContain('europarl.europa.eu');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.votes).toHaveLength(1);
      expect(parsed._source).toBe('ep-open-data-portal');
    });

    it('(c) emits 🔴 unavailability marker when both MCP and portal are empty', async () => {
      const mcpResult = buildMCPVotesResult([]);
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(mockFetchResponse(EMPTY_DECISIONS_RESPONSE));
      const { result, source, freshnessLabel } = await getVotingRecordsWithFallback(mcpResult, {
        dateFrom: '2026-04-01',
        dateTo: '2026-04-26',
        fetchImpl,
      });
      expect(source).toBe('unavailable');
      expect(freshnessLabel).toContain('🔴');
      expect(freshnessLabel).toContain('2026-04-01');
      expect(freshnessLabel).toContain('2026-04-26');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed._unavailable).toBe(true);
      expect(parsed._marker).toContain('🔴');
    });

    it('(c) also emits 🔴 marker when portal fetch errors out', async () => {
      const mcpResult = buildMCPVotesResult([]);
      const fetchImpl = vi.fn().mockRejectedValue(new Error('timeout'));
      const { source, freshnessLabel } = await getVotingRecordsWithFallback(mcpResult, {
        dateFrom: '2026-03-01',
        dateTo: '2026-03-31',
        fetchImpl,
      });
      expect(source).toBe('unavailable');
      expect(freshnessLabel).toContain('🔴');
    });

    it('propagates limit option to the portal query string', async () => {
      const mcpResult = buildMCPVotesResult([]);
      const fetchImpl = vi
        .fn()
        .mockResolvedValue(mockFetchResponse(SAMPLE_DECISION_RESPONSE));
      await getVotingRecordsWithFallback(mcpResult, {
        dateFrom: '2026-04-01',
        dateTo: '2026-04-26',
        limit: 25,
        fetchImpl,
      });
      const calledUrl = fetchImpl.mock.calls[0][0];
      expect(calledUrl).toContain('limit=25');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('Singleton lifecycle', () => {
    let consoleOutput;

    beforeEach(async () => {
      consoleOutput = mockConsole();
      await closeEPOpenDataClient();
    });
    afterEach(async () => {
      consoleOutput.restore();
      await closeEPOpenDataClient();
    });

    it('getEPOpenDataClient returns a connected singleton', async () => {
      const c1 = await getEPOpenDataClient({ dateFrom: '', dateTo: '' });
      const c2 = await getEPOpenDataClient({ dateFrom: '', dateTo: '' });
      expect(c1).toBe(c2);
      expect(c1.isConnected()).toBe(true);
    });

    it('closeEPOpenDataClient disconnects and clears the singleton', async () => {
      const c = await getEPOpenDataClient({ dateFrom: '', dateTo: '' });
      expect(c.isConnected()).toBe(true);
      await closeEPOpenDataClient();
      expect(c.isConnected()).toBe(false);
      // Next call creates a fresh instance
      const c2 = await getEPOpenDataClient({ dateFrom: '', dateTo: '' });
      expect(c2).not.toBe(c);
    });

    it('getEPOpenDataClient throws and clears singleton on malformed base URL', async () => {
      await expect(
        getEPOpenDataClient({ dateFrom: '', dateTo: '', apiBaseUrl: 'not a url' })
      ).rejects.toThrow(/Invalid EP_OPEN_DATA_BASE_URL/);
    });
  });
});
