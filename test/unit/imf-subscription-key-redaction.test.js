// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests: IMF subscription key redaction.
 *
 * Verifies that:
 * - Primary and secondary keys are read from environment variables correctly.
 * - Empty/unset keys are filtered out (not returned).
 * - Duplicate keys are deduplicated (only first occurrence kept).
 * - Subscription keys never appear in console output or thrown Error messages
 *   under 401, 403, and network-error failure paths.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readImfSubscriptionKeysFromEnv } from '../../scripts/mcp/imf-mcp-client.js';

describe('readImfSubscriptionKeysFromEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env['IMF_API_PRIMARY_KEY'];
    delete process.env['IMF_API_SECONDARY_KEY'];
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns empty array when no keys are set', () => {
    const keys = readImfSubscriptionKeysFromEnv();
    expect(keys).toEqual([]);
  });

  it('returns only primary key when only primary is set', () => {
    process.env['IMF_API_PRIMARY_KEY'] = 'primary-key-123';
    const keys = readImfSubscriptionKeysFromEnv();
    expect(keys).toEqual(['primary-key-123']);
  });

  it('returns only secondary key when only secondary is set', () => {
    process.env['IMF_API_SECONDARY_KEY'] = 'secondary-key-456';
    const keys = readImfSubscriptionKeysFromEnv();
    expect(keys).toEqual(['secondary-key-456']);
  });

  it('returns both keys in order [primary, secondary]', () => {
    process.env['IMF_API_PRIMARY_KEY'] = 'primary-key-abc';
    process.env['IMF_API_SECONDARY_KEY'] = 'secondary-key-def';
    const keys = readImfSubscriptionKeysFromEnv();
    expect(keys).toEqual(['primary-key-abc', 'secondary-key-def']);
    expect(keys[0]).toBe('primary-key-abc');
    expect(keys[1]).toBe('secondary-key-def');
  });

  it('deduplicates identical primary and secondary keys', () => {
    process.env['IMF_API_PRIMARY_KEY'] = 'same-key-xyz';
    process.env['IMF_API_SECONDARY_KEY'] = 'same-key-xyz';
    const keys = readImfSubscriptionKeysFromEnv();
    expect(keys).toEqual(['same-key-xyz']);
    expect(keys).toHaveLength(1);
  });

  it('filters out empty string primary key', () => {
    process.env['IMF_API_PRIMARY_KEY'] = '';
    process.env['IMF_API_SECONDARY_KEY'] = 'secondary-key-789';
    const keys = readImfSubscriptionKeysFromEnv();
    expect(keys).toEqual(['secondary-key-789']);
  });

  it('filters out empty string secondary key', () => {
    process.env['IMF_API_PRIMARY_KEY'] = 'primary-key-001';
    process.env['IMF_API_SECONDARY_KEY'] = '';
    const keys = readImfSubscriptionKeysFromEnv();
    expect(keys).toEqual(['primary-key-001']);
  });

  it('returns readonly array (length is accessible)', () => {
    process.env['IMF_API_PRIMARY_KEY'] = 'pk';
    const keys = readImfSubscriptionKeysFromEnv();
    expect(typeof keys.length).toBe('number');
    expect(keys.length).toBe(1);
  });
});

describe('IMF client key redaction on failure paths', () => {
  const SECRET_PRIMARY = 'SECRET_PRIMARY_KEY_abc123xyz';
  const SECRET_SECONDARY = 'SECRET_SECONDARY_KEY_def456uvw';
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env['IMF_API_PRIMARY_KEY'] = SECRET_PRIMARY;
    process.env['IMF_API_SECONDARY_KEY'] = SECRET_SECONDARY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('does not leak subscription key in console.warn on HTTP 401', async () => {
    const { IMFMCPClient } = await import('../../scripts/mcp/imf-mcp-client.js');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Unauthorized',
    });
    const client = new IMFMCPClient({ fetchImpl: mockFetch });
    await client.connect();

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await client.listDatabases();

    for (const call of consoleSpy.mock.calls) {
      const msg = call.join(' ');
      expect(msg).not.toContain(SECRET_PRIMARY);
      expect(msg).not.toContain(SECRET_SECONDARY);
    }

    // Verify the result text does not contain the key
    const text = result?.content?.[0]?.text ?? '';
    expect(text).not.toContain(SECRET_PRIMARY);
    expect(text).not.toContain(SECRET_SECONDARY);

    consoleSpy.mockRestore();
  });

  it('does not leak subscription key in console.warn on network error', async () => {
    const { IMFMCPClient } = await import('../../scripts/mcp/imf-mcp-client.js');
    const mockFetch = vi.fn().mockRejectedValue(new Error('fetch failed: ECONNREFUSED'));
    const client = new IMFMCPClient({ fetchImpl: mockFetch });
    await client.connect();

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await client.listDatabases();

    for (const call of consoleSpy.mock.calls) {
      const msg = call.join(' ');
      expect(msg).not.toContain(SECRET_PRIMARY);
      expect(msg).not.toContain(SECRET_SECONDARY);
    }

    const text = result?.content?.[0]?.text ?? '';
    expect(text).not.toContain(SECRET_PRIMARY);
    expect(text).not.toContain(SECRET_SECONDARY);

    consoleSpy.mockRestore();
  });

  it('does not leak subscription key in console.warn on HTTP 403', async () => {
    const { IMFMCPClient } = await import('../../scripts/mcp/imf-mcp-client.js');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => 'Forbidden',
    });
    const client = new IMFMCPClient({ fetchImpl: mockFetch });
    await client.connect();

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await client.listDatabases();

    for (const call of consoleSpy.mock.calls) {
      const msg = call.join(' ');
      expect(msg).not.toContain(SECRET_PRIMARY);
      expect(msg).not.toContain(SECRET_SECONDARY);
    }

    const text = result?.content?.[0]?.text ?? '';
    expect(text).not.toContain(SECRET_PRIMARY);
    expect(text).not.toContain(SECRET_SECONDARY);

    consoleSpy.mockRestore();
  });

  it('does not leak subscription key in Error.message when all keys exhausted', async () => {
    const { IMFMCPClient } = await import('../../scripts/mcp/imf-mcp-client.js');
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Unauthorized',
    });
    const client = new IMFMCPClient({ fetchImpl: mockFetch });
    await client.connect();

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await client.fetchData({
      databaseId: 'WEO',
      filters: { COUNTRY: ['US'], INDICATOR: ['NGDP_RPCH'] },
    });

    for (const call of consoleSpy.mock.calls) {
      const msg = call.join(' ');
      expect(msg).not.toContain(SECRET_PRIMARY);
      expect(msg).not.toContain(SECRET_SECONDARY);
    }

    const text = result?.content?.[0]?.text ?? '';
    expect(text).not.toContain(SECRET_PRIMARY);
    expect(text).not.toContain(SECRET_SECONDARY);

    consoleSpy.mockRestore();
  });
});
