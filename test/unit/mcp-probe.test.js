// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  formatProbeReport,
  redactSecrets,
  renderHealthMatrix,
  classifyProbeResult,
  classifyProbeError,
  getEPArgs,
  getWBArgs,
  withTimeout,
  callWithTimeoutRetry,
} from '../../scripts/utils/mcp-probe.js';

describe('mcp-probe', () => {
  describe('redactSecrets', () => {
    it('redacts bearer tokens and api keys from output', () => {
      const redacted = redactSecrets(
        'Authorization: Bearer abc.def.ghi and apiKey="super-secret-value"'
      );
      expect(redacted).toContain('Bearer [REDACTED]');
      expect(redacted).toContain('apiKey="[REDACTED]"');
      expect(redacted).not.toContain('super-secret-value');
    });

    it('handles strings with no secrets', () => {
      expect(redactSecrets('plain text')).toBe('plain text');
    });

    it('handles empty strings', () => {
      expect(redactSecrets('')).toBe('');
    });

    it('redacts multiple bearer tokens', () => {
      const input = 'Bearer abc123 and Bearer xyz789';
      const result = redactSecrets(input);
      expect(result).toBe('Bearer [REDACTED] and Bearer [REDACTED]');
    });

    it('redacts api-key variants', () => {
      const input = 'api-key="secret123"';
      const result = redactSecrets(input);
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('secret123');
    });
  });

  describe('formatProbeReport', () => {
    it('renders machine-readable JSON report format', () => {
      const report = {
        generatedAt: '2026-05-14T00:00:00.000Z',
        timeoutMs: 15000,
        timeoutRetries: 1,
        summary: { total: 2, green: 1, yellow: 1, red: 0 },
        results: [
          {
            server: 'ep',
            tool: 'get_server_health',
            severity: 'green',
            durationMs: 45,
            message: 'ok',
          },
          {
            server: 'imf',
            tool: 'imf-fetch-data',
            severity: 'yellow',
            durationMs: 120,
            message: 'UPSTREAM_TIMEOUT',
          },
        ],
      };

      expect(formatProbeReport(report)).toMatchInlineSnapshot(`
      "{
        \"generatedAt\": \"2026-05-14T00:00:00.000Z\",
        \"timeoutMs\": 15000,
        \"timeoutRetries\": 1,
        \"summary\": {
          \"total\": 2,
          \"green\": 1,
          \"yellow\": 1,
          \"red\": 0
        },
        \"results\": [
          {
            \"server\": \"ep\",
            \"tool\": \"get_server_health\",
            \"severity\": \"green\",
            \"durationMs\": 45,
            \"message\": \"ok\"
          },
          {
            \"server\": \"imf\",
            \"tool\": \"imf-fetch-data\",
            \"severity\": \"yellow\",
            \"durationMs\": 120,
            \"message\": \"UPSTREAM_TIMEOUT\"
          }
        ]
      }"
    `);
    });
  });

  describe('renderHealthMatrix', () => {
    it('renders green/yellow/red health matrix', () => {
      const text = renderHealthMatrix({
        generatedAt: '2026-05-14T00:00:00.000Z',
        timeoutMs: 15000,
        timeoutRetries: 1,
        summary: { total: 3, green: 1, yellow: 1, red: 1 },
        results: [
          {
            server: 'ep',
            tool: 'get_server_health',
            severity: 'green',
            durationMs: 10,
            message: 'ok',
          },
          {
            server: 'imf',
            tool: 'imf-fetch-data',
            severity: 'yellow',
            durationMs: 20,
            message: 'timeout',
          },
          {
            server: 'world-bank',
            tool: 'get-country-info',
            severity: 'red',
            durationMs: 30,
            message: 'connection refused',
          },
        ],
      });

      expect(text).toContain('🟢 [ep] get_server_health');
      expect(text).toContain('🟡 [imf] imf-fetch-data');
      expect(text).toContain('🔴 [world-bank] get-country-info');
      expect(text).toContain('Summary: total=3 green=1 yellow=1 red=1');
    });

    it('renders empty report', () => {
      const text = renderHealthMatrix({
        generatedAt: '2026-05-14T00:00:00.000Z',
        timeoutMs: 15000,
        timeoutRetries: 1,
        summary: { total: 0, green: 0, yellow: 0, red: 0 },
        results: [],
      });
      expect(text).toContain('MCP Reliability Probe');
      expect(text).toContain('total=0');
    });
  });

  describe('classifyProbeResult', () => {
    it('returns red for error results', () => {
      expect(classifyProbeResult({ content: [{ type: 'text', text: 'fail' }], isError: true })).toBe('red');
    });

    it('returns yellow for empty text', () => {
      expect(classifyProbeResult({ content: [{ type: 'text', text: '' }] })).toBe('yellow');
    });

    it('returns yellow for whitespace-only text', () => {
      expect(classifyProbeResult({ content: [{ type: 'text', text: '   ' }] })).toBe('yellow');
    });

    it('returns yellow for unavailable status (compact)', () => {
      expect(classifyProbeResult({
        content: [{ type: 'text', text: '{"status":"unavailable"}' }],
      })).toBe('yellow');
    });

    it('returns yellow for unavailable status (spaced)', () => {
      expect(classifyProbeResult({
        content: [{ type: 'text', text: '{"status": "unavailable"}' }],
      })).toBe('yellow');
    });

    it('returns green for valid result', () => {
      expect(classifyProbeResult({
        content: [{ type: 'text', text: '{"data": [1,2,3]}' }],
      })).toBe('green');
    });

    it('returns yellow when content array is empty', () => {
      expect(classifyProbeResult({ content: [] })).toBe('yellow');
    });

    it('returns yellow when content is undefined', () => {
      expect(classifyProbeResult({})).toBe('yellow');
    });
  });

  describe('classifyProbeError', () => {
    it('returns yellow for timeout errors', () => {
      expect(classifyProbeError('UPSTREAM_TIMEOUT: tool exceeded 15000ms')).toBe('yellow');
    });

    it('returns yellow for not found errors', () => {
      expect(classifyProbeError('Resource not found')).toBe('yellow');
    });

    it('returns yellow for unavailable errors', () => {
      expect(classifyProbeError('Service unavailable')).toBe('yellow');
    });

    it('returns yellow for invalid errors', () => {
      expect(classifyProbeError('Invalid parameter')).toBe('yellow');
    });

    it('returns yellow for required errors', () => {
      expect(classifyProbeError('Parameter required')).toBe('yellow');
    });

    it('returns red for connection refused', () => {
      expect(classifyProbeError('Connection refused')).toBe('red');
    });

    it('returns red for generic errors', () => {
      expect(classifyProbeError('Something went wrong')).toBe('red');
    });
  });

  describe('getEPArgs', () => {
    it('returns timeframe for feed tools', () => {
      expect(getEPArgs('get_meps_feed')).toEqual({ timeframe: 'one-week' });
      expect(getEPArgs('get_events_feed')).toEqual({ timeframe: 'one-week' });
      expect(getEPArgs('get_procedures_feed')).toEqual({ timeframe: 'one-week' });
    });

    it('returns null for meeting tools requiring sittingId', () => {
      expect(getEPArgs('get_meeting_activities')).toBeNull();
      expect(getEPArgs('get_meeting_decisions')).toBeNull();
      expect(getEPArgs('get_meeting_foreseen_activities')).toBeNull();
      expect(getEPArgs('get_meeting_plenary_session_documents')).toBeNull();
      expect(getEPArgs('get_meeting_plenary_session_document_items')).toBeNull();
    });

    it('returns MEP ID for MEP-specific tools', () => {
      expect(getEPArgs('get_mep_details')).toEqual({ id: 'MEP-124810' });
      expect(getEPArgs('analyze_voting_patterns')).toEqual({ mepId: 'MEP-124810' });
      expect(getEPArgs('assess_mep_influence')).toEqual({ mepId: 'MEP-124810' });
    });

    it('returns procedure ID for procedure tools', () => {
      expect(getEPArgs('get_procedure_events')).toEqual({ processId: '2024/0001(COD)' });
      expect(getEPArgs('track_legislation')).toEqual({ procedureId: '2024/0001(COD)' });
    });

    it('returns committee args for committee tools', () => {
      expect(getEPArgs('analyze_committee_activity')).toEqual({ committeeId: 'ENVI' });
    });

    it('returns country args for delegation tools', () => {
      expect(getEPArgs('analyze_country_delegation')).toEqual({ country: 'DE' });
    });

    it('returns group args for group tools', () => {
      expect(getEPArgs('compare_political_groups')).toEqual({ groupIds: ['EPP', 'S&D'] });
      expect(getEPArgs('detect_voting_anomalies')).toEqual({ groupId: 'EPP' });
      expect(getEPArgs('analyze_coalition_dynamics')).toEqual({ groupIds: ['EPP', 'S&D'] });
    });

    it('returns search args for search tools', () => {
      expect(getEPArgs('search_documents')).toEqual({ keyword: 'climate', limit: 1 });
    });

    it('returns default limit for unknown tools', () => {
      expect(getEPArgs('unknown_tool')).toEqual({ limit: 1 });
    });

    it('returns comparative_intelligence args', () => {
      expect(getEPArgs('comparative_intelligence')).toEqual({ mepIds: [124810, 197443] });
    });

    it('returns correlate_intelligence args', () => {
      expect(getEPArgs('correlate_intelligence')).toEqual({ mepIds: ['MEP-124810'] });
    });

    it('returns generate_report args', () => {
      expect(getEPArgs('generate_report')).toEqual({ reportType: 'VOTING_STATISTICS' });
    });

    it('returns track_mep_attendance args', () => {
      expect(getEPArgs('track_mep_attendance')).toEqual({ country: 'DE' });
    });

    it('returns analyze_legislative_effectiveness args', () => {
      expect(getEPArgs('analyze_legislative_effectiveness')).toEqual({
        subjectType: 'COMMITTEE',
        subjectId: 'ENVI',
      });
    });

    it('returns get_procedure_event_by_id args', () => {
      expect(getEPArgs('get_procedure_event_by_id')).toEqual({
        processId: '2024/0001(COD)',
        eventId: '1',
      });
    });
  });

  describe('getWBArgs', () => {
    it('returns keyword for search-indicators', () => {
      expect(getWBArgs('search-indicators')).toEqual({ keyword: 'health' });
    });

    it('returns empty for get-countries', () => {
      expect(getWBArgs('get-countries')).toEqual({});
    });

    it('returns country code for get-country-info', () => {
      expect(getWBArgs('get-country-info')).toEqual({ countryCode: 'DE' });
    });

    it('returns economic data args', () => {
      expect(getWBArgs('get-economic-data')).toEqual({
        countryCode: 'DE',
        indicator: 'GDP',
        years: 1,
      });
    });

    it('returns social data args', () => {
      expect(getWBArgs('get-social-data')).toEqual({
        countryCode: 'DE',
        indicator: 'POPULATION',
        years: 1,
      });
    });

    it('returns education data args', () => {
      expect(getWBArgs('get-education-data')).toEqual({
        countryCode: 'DE',
        indicator: 'SCHOOL_ENROLLMENT',
        years: 1,
      });
    });

    it('returns health data args', () => {
      expect(getWBArgs('get-health-data')).toEqual({
        countryCode: 'DE',
        indicator: 'HEALTH_EXPENDITURE',
        years: 1,
      });
    });

    it('returns empty for unknown tools', () => {
      expect(getWBArgs('unknown-tool')).toEqual({});
    });
  });

  describe('withTimeout', () => {
    it('resolves when promise completes before timeout', async () => {
      const result = await withTimeout(Promise.resolve('ok'), 5000, 'test-tool');
      expect(result).toBe('ok');
    });

    it('rejects when promise exceeds timeout', async () => {
      const slow = new Promise((resolve) => setTimeout(resolve, 5000));
      await expect(withTimeout(slow, 50, 'slow-tool')).rejects.toThrow('UPSTREAM_TIMEOUT');
    });

    it('preserves original rejection', async () => {
      const failing = Promise.reject(new Error('original error'));
      await expect(withTimeout(failing, 5000, 'test-tool')).rejects.toThrow('original error');
    });
  });

  describe('callWithTimeoutRetry', () => {
    it('resolves on first attempt when successful', async () => {
      const result = await callWithTimeoutRetry(
        () => Promise.resolve('ok'),
        5000,
        1,
        'test-tool'
      );
      expect(result).toBe('ok');
    });

    it('retries on timeout and succeeds on second attempt', async () => {
      let attempt = 0;
      const fn = () => {
        attempt++;
        if (attempt === 1) {
          return new Promise((_, reject) =>
            setTimeout(() => reject(new Error('UPSTREAM_TIMEOUT: exceeded')), 10)
          );
        }
        return Promise.resolve('ok');
      };
      const result = await callWithTimeoutRetry(fn, 50, 1, 'test-tool');
      expect(result).toBe('ok');
      expect(attempt).toBe(2);
    });

    it('does not retry on non-timeout errors', async () => {
      let attempt = 0;
      const fn = () => {
        attempt++;
        return Promise.reject(new Error('connection refused'));
      };
      await expect(callWithTimeoutRetry(fn, 5000, 1, 'test-tool')).rejects.toThrow(
        'connection refused'
      );
      expect(attempt).toBe(1);
    });

    it('throws after exhausting retries on timeout', async () => {
      let attempt = 0;
      const fn = () => {
        attempt++;
        return new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout exceeded')), 10)
        );
      };
      await expect(callWithTimeoutRetry(fn, 50, 1, 'test-tool')).rejects.toThrow('timeout');
      expect(attempt).toBe(2);
    });

    it('handles non-Error throws', async () => {
      const fn = () => Promise.reject('string error');
      await expect(callWithTimeoutRetry(fn, 5000, 0, 'test-tool')).rejects.toThrow('string error');
    });
  });
});
