// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for mcp-config-reader.js (TypeScript MCP config reader).
 *
 * Covers:
 * - stripBearerPrefix — strips "Bearer " prefix (case-insensitive)
 * - extractApiKey — tries 4 priority paths in order
 * - readMcpConfig — file read + parse (injected readFileImpl)
 * - resolveMcpConfigPath — env var + fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  stripBearerPrefix,
  extractApiKey,
  readMcpConfig,
  resolveMcpConfigPath,
} from '../../scripts/mcp/mcp-config-reader.js';

// ─── stripBearerPrefix ────────────────────────────────────────────────────────

describe('stripBearerPrefix', () => {
  it('strips "Bearer " prefix', () => {
    expect(stripBearerPrefix('Bearer mytoken')).toBe('mytoken');
  });

  it('strips lowercase "bearer " prefix', () => {
    expect(stripBearerPrefix('bearer mytoken')).toBe('mytoken');
  });

  it('strips mixed-case "BeArEr " prefix', () => {
    expect(stripBearerPrefix('BeArEr mytoken')).toBe('mytoken');
  });

  it('returns value unchanged when no prefix', () => {
    expect(stripBearerPrefix('rawtoken')).toBe('rawtoken');
  });

  it('returns empty string for empty input', () => {
    expect(stripBearerPrefix('')).toBe('');
  });
});

// ─── extractApiKey ────────────────────────────────────────────────────────────

describe('extractApiKey', () => {
  it('Priority 1: returns gateway.apiKey when present', () => {
    expect(extractApiKey({ gateway: { apiKey: 'key-from-gateway' } })).toBe('key-from-gateway');
  });

  it('Priority 1: strips Bearer prefix from gateway.apiKey', () => {
    expect(extractApiKey({ gateway: { apiKey: 'Bearer stripped-key' } })).toBe('stripped-key');
  });

  it('Priority 2: falls through to EP server Authorization header', () => {
    const config = {
      mcpServers: {
        'european-parliament': { headers: { Authorization: 'Bearer ep-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('ep-key');
  });

  it('Priority 3: falls through to fetch-proxy Authorization header', () => {
    const config = {
      mcpServers: {
        'fetch-proxy': { headers: { Authorization: 'Bearer fp-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('fp-key');
  });

  it('Priority 4: falls through to any server Authorization header', () => {
    const config = {
      mcpServers: {
        'some-other-server': { headers: { Authorization: 'Bearer other-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('other-key');
  });

  it('returns undefined when no key found anywhere', () => {
    expect(extractApiKey({ gateway: {}, mcpServers: {} })).toBeUndefined();
  });

  it('returns undefined for empty config object', () => {
    expect(extractApiKey({})).toBeUndefined();
  });

  it('ignores empty-string candidates and uses next priority', () => {
    const config = {
      gateway: { apiKey: '' },
      mcpServers: {
        'european-parliament': { headers: { Authorization: '' } },
        'fetch-proxy': { headers: { Authorization: 'Bearer real-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('real-key');
  });

  it('Priority 1 wins over Priority 2 when both present', () => {
    const config = {
      gateway: { apiKey: 'p1-key' },
      mcpServers: {
        'european-parliament': { headers: { Authorization: 'Bearer p2-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('p1-key');
  });
});

// ─── readMcpConfig — injectable readFileImpl ──────────────────────────────────

describe('readMcpConfig', () => {
  it('returns all-undefined when readFileImpl throws (file absent)', () => {
    const readFileImpl = () => { throw new Error('ENOENT'); };
    expect(readMcpConfig('/fake/config.json', readFileImpl)).toEqual({
      apiKey: undefined,
      port: undefined,
      domain: undefined,
    });
  });

  it('returns all-undefined when the file contains invalid JSON', () => {
    const readFileImpl = () => 'not-json';
    expect(readMcpConfig('/fake/config.json', readFileImpl)).toEqual({
      apiKey: undefined,
      port: undefined,
      domain: undefined,
    });
  });

  it('reads apiKey from gateway.apiKey', () => {
    const json = JSON.stringify({
      gateway: { apiKey: 'mykey', port: 8080, domain: 'host.docker.internal' },
    });
    const result = readMcpConfig('/fake/config.json', () => json);
    expect(result.apiKey).toBe('mykey');
    expect(result.port).toBe(8080);
    expect(result.domain).toBe('host.docker.internal');
  });

  it('reads apiKey from mcpServers EP header when gateway.apiKey absent', () => {
    const json = JSON.stringify({
      mcpServers: {
        'european-parliament': { headers: { Authorization: 'Bearer ep-key' } },
      },
      gateway: { port: 9000, domain: 'ep.local' },
    });
    const result = readMcpConfig('/fake/config.json', () => json);
    expect(result.apiKey).toBe('ep-key');
    expect(result.port).toBe(9000);
  });

  it('reads apiKey from fetch-proxy header (Priority 3)', () => {
    const json = JSON.stringify({
      mcpServers: {
        'fetch-proxy': { headers: { Authorization: 'Bearer fp-key' } },
      },
    });
    expect(readMcpConfig('/fake/config.json', () => json).apiKey).toBe('fp-key');
  });

  it('falls through to any server header (Priority 4)', () => {
    const json = JSON.stringify({
      mcpServers: {
        'other-server': { headers: { Authorization: 'Bearer fallback-key' } },
      },
    });
    expect(readMcpConfig('/fake/config.json', () => json).apiKey).toBe('fallback-key');
  });

  it('returns port as number even when stored as a string', () => {
    const json = JSON.stringify({ gateway: { port: '8080', domain: 'localhost' } });
    expect(readMcpConfig('/fake/config.json', () => json).port).toBe(8080);
  });

  it('returns undefined port when gateway.port is absent', () => {
    const json = JSON.stringify({ gateway: { domain: 'localhost' } });
    expect(readMcpConfig('/fake/config.json', () => json).port).toBeUndefined();
  });

  it('returns undefined domain when gateway.domain is absent', () => {
    const json = JSON.stringify({ gateway: { port: 8080 } });
    expect(readMcpConfig('/fake/config.json', () => json).domain).toBeUndefined();
  });

  it('returns all-undefined on empty config', () => {
    expect(readMcpConfig('/fake/config.json', () => '{}')).toEqual({
      apiKey: undefined,
      port: undefined,
      domain: undefined,
    });
  });

  it('falls back to real fs when readFileImpl not supplied (non-existent file)', () => {
    // Default behaviour — real fs, file does not exist
    expect(readMcpConfig('/tmp/does-not-exist-mcp-reader-12345.json')).toEqual({
      apiKey: undefined,
      port: undefined,
      domain: undefined,
    });
  });
});

// ─── resolveMcpConfigPath ─────────────────────────────────────────────────────

describe('resolveMcpConfigPath', () => {
  beforeEach(() => { delete process.env['GH_AW_MCP_CONFIG']; });
  afterEach(() => { delete process.env['GH_AW_MCP_CONFIG']; });

  it('returns $GH_AW_MCP_CONFIG when set', () => {
    process.env['GH_AW_MCP_CONFIG'] = '/custom/path/mcp-config.json';
    expect(resolveMcpConfigPath()).toBe('/custom/path/mcp-config.json');
  });

  it('falls back to ~/.copilot/mcp-config.json', () => {
    expect(resolveMcpConfigPath()).toMatch(/\.copilot[/\\]mcp-config\.json$/);
  });

  it('ignores whitespace-only GH_AW_MCP_CONFIG', () => {
    process.env['GH_AW_MCP_CONFIG'] = '   ';
    expect(resolveMcpConfigPath()).toMatch(/\.copilot[/\\]mcp-config\.json$/);
  });
});

// ─── stripBearerPrefix ────────────────────────────────────────────────────────

describe('stripBearerPrefix', () => {
  it('strips "Bearer " prefix', () => {
    expect(stripBearerPrefix('Bearer mytoken')).toBe('mytoken');
  });

  it('strips lowercase "bearer " prefix', () => {
    expect(stripBearerPrefix('bearer mytoken')).toBe('mytoken');
  });

  it('strips mixed-case "BeArEr " prefix', () => {
    expect(stripBearerPrefix('BeArEr mytoken')).toBe('mytoken');
  });

  it('returns value unchanged when no prefix', () => {
    expect(stripBearerPrefix('rawtoken')).toBe('rawtoken');
  });

  it('returns empty string for empty input', () => {
    expect(stripBearerPrefix('')).toBe('');
  });
});

// ─── extractApiKey ────────────────────────────────────────────────────────────

describe('extractApiKey', () => {
  it('Priority 1: returns gateway.apiKey when present', () => {
    expect(extractApiKey({ gateway: { apiKey: 'key-from-gateway' } })).toBe('key-from-gateway');
  });

  it('Priority 1: strips Bearer prefix from gateway.apiKey', () => {
    expect(extractApiKey({ gateway: { apiKey: 'Bearer stripped-key' } })).toBe('stripped-key');
  });

  it('Priority 2: falls through to EP server Authorization header', () => {
    const config = {
      mcpServers: {
        'european-parliament': { headers: { Authorization: 'Bearer ep-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('ep-key');
  });

  it('Priority 3: falls through to fetch-proxy Authorization header', () => {
    const config = {
      mcpServers: {
        'fetch-proxy': { headers: { Authorization: 'Bearer fp-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('fp-key');
  });

  it('Priority 4: falls through to any server Authorization header', () => {
    const config = {
      mcpServers: {
        'some-other-server': { headers: { Authorization: 'Bearer other-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('other-key');
  });

  it('returns undefined when no key found anywhere', () => {
    expect(extractApiKey({ gateway: {}, mcpServers: {} })).toBeUndefined();
  });

  it('returns undefined for empty config object', () => {
    expect(extractApiKey({})).toBeUndefined();
  });

  it('ignores empty-string candidates and uses next priority', () => {
    const config = {
      gateway: { apiKey: '' },
      mcpServers: {
        'european-parliament': { headers: { Authorization: '' } },
        'fetch-proxy': { headers: { Authorization: 'Bearer real-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('real-key');
  });

  it('Priority 1 wins over Priority 2 when both present', () => {
    const config = {
      gateway: { apiKey: 'p1-key' },
      mcpServers: {
        'european-parliament': { headers: { Authorization: 'Bearer p2-key' } },
      },
    };
    expect(extractApiKey(config)).toBe('p1-key');
  });
});
