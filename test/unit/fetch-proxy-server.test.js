// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for fetch-proxy-server.js (TypeScript IMF-only MCP fetch-proxy).
 *
 * Covers:
 * - isAllowedImfUrl — allow/reject logic
 * - toWire — JSON serialization + newline suffix; newline-safe check
 * - handleInitialize — MCP handshake
 * - handleToolsList — tool descriptor
 * - handleFetchUrl — allowlist rejection, HTTP errors, success, network errors
 * - runServer — full request/response round-trips via stream mocks
 */

import { describe, it, expect, vi } from 'vitest';
import { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  isAllowedImfUrl,
  toWire,
  handleInitialize,
  handleToolsList,
  handleFetchUrl,
  runServer,
} from '../../scripts/mcp/fetch-proxy-server.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// ─── isAllowedImfUrl ─────────────────────────────────────────────────────────

describe('isAllowedImfUrl', () => {
  it('allows a valid IMF SDMX 3.0 URL', () => {
    expect(
      isAllowedImfUrl(
        'https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/DEU.NGDP_RPCH.?startPeriod=2024',
      ),
    ).toBe(true);
  });

  it('rejects http (non-HTTPS)', () => {
    expect(isAllowedImfUrl('http://dataservices.imf.org/REST/SDMX_3.0/data/WEO/')).toBe(false);
  });

  it('rejects a different hostname', () => {
    expect(isAllowedImfUrl('https://example.com/REST/SDMX_3.0/data/WEO/')).toBe(false);
  });

  it('rejects a non-SDMX path on the correct hostname', () => {
    expect(isAllowedImfUrl('https://dataservices.imf.org/admin/something')).toBe(false);
  });

  it('rejects a malformed URL string', () => {
    expect(isAllowedImfUrl('not a url')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isAllowedImfUrl('')).toBe(false);
  });

  it('allows the SDMX path root without further segments', () => {
    expect(isAllowedImfUrl('https://dataservices.imf.org/REST/SDMX_3.0/')).toBe(true);
  });

  it('rejects a URL with a non-standard port', () => {
    expect(isAllowedImfUrl('https://dataservices.imf.org:8443/REST/SDMX_3.0/')).toBe(false);
  });

  it('allows explicit port 443', () => {
    expect(isAllowedImfUrl('https://dataservices.imf.org:443/REST/SDMX_3.0/')).toBe(true);
  });

  it('rejects a URL with embedded credentials', () => {
    expect(isAllowedImfUrl('https://user:pass@dataservices.imf.org/REST/SDMX_3.0/')).toBe(false);
  });

  it('rejects a URL with username only', () => {
    expect(isAllowedImfUrl('https://user@dataservices.imf.org/REST/SDMX_3.0/')).toBe(false);
  });
});

// ─── toWire ──────────────────────────────────────────────────────────────────

describe('toWire', () => {
  it('returns JSON + newline', () => {
    expect(toWire({ foo: 'bar' })).toBe('{"foo":"bar"}\n');
  });

  it('ends with char code 10 (LF)', () => {
    const result = toWire({});
    expect(result.charCodeAt(result.length - 1)).toBe(10);
  });

  it('compiled source uses String.fromCharCode(10), not bare \\n literal', async () => {
    // Read the compiled JS to verify the newline-safe form is preserved
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(path.join(REPO_ROOT, 'scripts/mcp/fetch-proxy-server.js'), 'utf8');
    expect(src).toContain('String.fromCharCode(10)');
  });
});

// ─── handleInitialize ────────────────────────────────────────────────────────

describe('handleInitialize', () => {
  it('echoes the request id', () => {
    expect(handleInitialize(7).id).toBe(7);
  });

  it('returns the 2024-11-05 protocol version', () => {
    expect(handleInitialize(null).result).toMatchObject({ protocolVersion: '2024-11-05' });
  });

  it('exposes an empty tools capability object', () => {
    expect(handleInitialize(1).result).toMatchObject({ capabilities: { tools: {} } });
  });
});

// ─── handleToolsList ─────────────────────────────────────────────────────────

describe('handleToolsList', () => {
  it('advertises exactly one tool named fetch_url', () => {
    const { result } = handleToolsList(2);
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].name).toBe('fetch_url');
    expect(result.tools[0].inputSchema.required).toContain('url');
  });

  it('echoes the request id', () => {
    expect(handleToolsList('abc').id).toBe('abc');
  });
});

// ─── handleFetchUrl ──────────────────────────────────────────────────────────

describe('handleFetchUrl', () => {
  it('rejects a non-IMF URL with an error containing the allowed hostname', async () => {
    const result = await handleFetchUrl(1, 'https://example.com/');
    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('dataservices.imf.org');
  });

  it('rejects undefined url', async () => {
    const result = await handleFetchUrl(2, undefined);
    expect(result.error).toBeDefined();
  });

  it('returns success with body text on a valid URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => '{"data":"test"}',
    });
    const url = 'https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/DEU.NGDP_RPCH.?';
    const result = await handleFetchUrl(3, url, mockFetch);
    expect(result.result.content[0].text).toBe('{"data":"test"}');
  });

  it('returns an error on non-2xx HTTP response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: async () => 'error body',
    });
    const url = 'https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/';
    const result = await handleFetchUrl(4, url, mockFetch);
    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('503');
  });

  it('returns an error when fetch throws a network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    const url = 'https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/';
    const result = await handleFetchUrl(5, url, mockFetch);
    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('ECONNREFUSED');
  });

  it('echoes request id in all responses', async () => {
    const result1 = await handleFetchUrl(99, 'https://example.com/');
    expect(result1.id).toBe(99);

    const mockFetch = vi.fn().mockRejectedValue(new Error('network'));
    const url = 'https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/';
    const result2 = await handleFetchUrl(77, url, mockFetch);
    expect(result2.id).toBe(77);
  });
});

// ─── runServer (stream integration) ──────────────────────────────────────────

function makeReadable(lines) {
  const r = new Readable({ read() {} });
  for (const line of lines) r.push(line + '\n');
  r.push(null);
  return r;
}

function makeWritable() {
  const output = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      output.push(chunk.toString());
      cb();
    },
  });
  return { stream, output };
}

describe('runServer', () => {
  it('handles initialize + tools/list via stdin/stdout streams', async () => {
    const input = makeReadable([
      JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
      JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    ]);
    const { stream, output } = makeWritable();
    await runServer(input, stream);
    const responses = output.map((l) => JSON.parse(l.trim()));
    expect(responses[0].result.protocolVersion).toBe('2024-11-05');
    expect(responses[1].result.tools[0].name).toBe('fetch_url');
  });

  it('rejects a non-IMF fetch_url call', async () => {
    const input = makeReadable([
      JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'fetch_url', arguments: { url: 'https://evil.com' } },
      }),
    ]);
    const { stream, output } = makeWritable();
    await runServer(input, stream);
    const responses = output.map((l) => JSON.parse(l.trim()));
    expect(responses[1].error).toBeDefined();
    expect(responses[1].error.message).toContain('dataservices.imf.org');
  });

  it('handles unknown methods gracefully', async () => {
    const input = makeReadable([
      JSON.stringify({ jsonrpc: '2.0', id: 10, method: 'unknown/method' }),
    ]);
    const { stream, output } = makeWritable();
    await runServer(input, stream);
    const responses = output.map((l) => JSON.parse(l.trim()));
    expect(responses[0].result).toBeDefined();
  });

  it('handles malformed JSON on a line without crashing', async () => {
    const input = makeReadable([
      'not-json-at-all',
      JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
    ]);
    const { stream, output } = makeWritable();
    await runServer(input, stream);
    const responses = output.map((l) => JSON.parse(l.trim()));
    expect(responses[0].error).toBeDefined();
    expect(responses[1].result.protocolVersion).toBe('2024-11-05');
  });

  it('ignores notifications/initialized (no response emitted)', async () => {
    const input = makeReadable([
      JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
      JSON.stringify({ jsonrpc: '2.0', id: null, method: 'notifications/initialized' }),
      JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    ]);
    const { stream, output } = makeWritable();
    await runServer(input, stream);
    const responses = output.map((l) => JSON.parse(l.trim()));
    // notification produces no response → only 2 responses
    expect(responses).toHaveLength(2);
    expect(responses[0].result.protocolVersion).toBe('2024-11-05');
    expect(responses[1].result.tools[0].name).toBe('fetch_url');
  });
});
