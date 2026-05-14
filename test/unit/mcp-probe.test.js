// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { formatProbeReport, redactSecrets, renderHealthMatrix } from '../../scripts/utils/mcp-probe.js';

describe('mcp-probe', () => {
  it('redacts bearer tokens and api keys from output', () => {
    const redacted = redactSecrets(
      'Authorization: Bearer abc.def.ghi and apiKey="super-secret-value"'
    );
    expect(redacted).toContain('Bearer [REDACTED]');
    expect(redacted).toContain('apiKey="[REDACTED]"');
    expect(redacted).not.toContain('super-secret-value');
  });

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
});
