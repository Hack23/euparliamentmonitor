// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for mcp-connection.js
 * Tests reconnection, retriable requests, health metrics, and rate limit handling
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MCPConnection,
  MCPSessionExpiredError,
  parseSSEResponse,
  formatRetryAfter,
  isRetriableError,
} from '../../scripts/mcp/mcp-connection.js';
import { mockConsole } from '../helpers/test-utils.js';

describe('mcp-connection', () => {
  describe('parseSSEResponse', () => {
    it('should return null for empty string', () => {
      expect(parseSSEResponse('')).toBeNull();
    });

    it('should parse a single data line', () => {
      const body = 'data: {"jsonrpc":"2.0","id":1,"result":{"tools":[]}}';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
    });

    it('should return first valid data line when multiple exist', () => {
      const body = [
        'event: message',
        'data: {"jsonrpc":"2.0","id":1,"result":{"tools":[]}}',
        '',
        'data: {"jsonrpc":"2.0","id":2,"result":{}}',
      ].join('\n');
      const result = parseSSEResponse(body);
      expect(result?.id).toBe(1);
    });

    it('should skip invalid JSON and return the first valid one', () => {
      const body = 'data: not-json\ndata: {"jsonrpc":"2.0","id":3,"result":{}}';
      const result = parseSSEResponse(body);
      expect(result?.id).toBe(3);
    });

    it('should return null when no valid data lines exist', () => {
      const body = 'event: ping\ncomment: keep-alive\n';
      expect(parseSSEResponse(body)).toBeNull();
    });
  });

  describe('formatRetryAfter', () => {
    it('should format numeric seconds', () => {
      expect(formatRetryAfter('30')).toBe('30s');
    });

    it('should format numeric seconds with trailing s suffix', () => {
      expect(formatRetryAfter('30s')).toBe('30s');
    });

    it('should format zero seconds', () => {
      expect(formatRetryAfter('0')).toBe('0s');
    });

    it('should format a future HTTP-date as seconds until that time', () => {
      const futureDate = new Date(Date.now() + 45000).toUTCString();
      const result = formatRetryAfter(futureDate);
      expect(result).toMatch(/^\d+s \(until /);
    });

    it('should format a past HTTP-date as just the UTC string', () => {
      const pastDate = new Date(Date.now() - 5000).toUTCString();
      const result = formatRetryAfter(pastDate);
      expect(result).toMatch(/GMT$/);
      expect(result).not.toMatch(/^\d+s/);
    });

    it('should return the raw value when not numeric and not a valid date', () => {
      expect(formatRetryAfter('invalid-value')).toBe('invalid-value');
    });
  });

  describe('MCPSessionExpiredError', () => {
    it('should be an instance of Error', () => {
      const err = new MCPSessionExpiredError('Unauthorized');
      expect(err).toBeInstanceOf(Error);
    });

    it('should be an instance of MCPSessionExpiredError', () => {
      const err = new MCPSessionExpiredError('Unauthorized');
      expect(err).toBeInstanceOf(MCPSessionExpiredError);
    });

    it('should have name MCPSessionExpiredError', () => {
      const err = new MCPSessionExpiredError('Unauthorized');
      expect(err.name).toBe('MCPSessionExpiredError');
    });

    it('should include 401 and statusText in the message', () => {
      const err = new MCPSessionExpiredError('Unauthorized');
      expect(err.message).toContain('401');
      expect(err.message).toContain('Unauthorized');
    });
  });

  describe('isRetriableError', () => {
    it('should return true for a timeout error', () => {
      expect(isRetriableError(new Error('Request timeout after 60000ms'))).toBe(true);
    });

    it('should return true for a connection-closed error', () => {
      expect(isRetriableError(new Error('connection closed'))).toBe(true);
    });

    it('should return true for a connection-reset error', () => {
      expect(isRetriableError(new Error('ECONNRESET'))).toBe(true);
    });

    it('should return true for a not-connected error', () => {
      expect(isRetriableError(new Error('Not connected to MCP server'))).toBe(true);
    });

    it('should return false for a generic unknown error (allow-list)', () => {
      expect(isRetriableError(new Error('some unknown tool error'))).toBe(false);
    });

    it('should return false for MCPSessionExpiredError', () => {
      expect(isRetriableError(new MCPSessionExpiredError('Unauthorized'))).toBe(false);
    });

    it('should return false for a TypeError', () => {
      expect(isRetriableError(new TypeError('args must be a plain object'))).toBe(false);
    });

    it('should return false for a rate-limit error', () => {
      expect(isRetriableError(new Error('Rate limited. Retry after 30s'))).toBe(false);
    });
  });

  describe('MCPConnection', () => {
    let client;
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new MCPConnection({ connectionRetryDelay: 0 });
    });

    afterEach(() => {
      consoleOutput.restore();
      vi.unstubAllGlobals();
      client.disconnect();
    });

    describe('Constructor', () => {
      it('should initialize health metrics to zero', () => {
        const health = client.getConnectionHealth();
        expect(health.timeoutCount).toBe(0);
        expect(health.reconnectCount).toBe(0);
        expect(health.connected).toBe(false);
      });

      it('should accept maxRetries option', () => {
        const c = new MCPConnection({ maxRetries: 5 });
        expect(c.maxRetries).toBe(5);
      });

      it('should default maxRetries to 2', () => {
        expect(client.maxRetries).toBe(2);
      });

      it('should initialize reconnectingPromise to null', () => {
        expect(client.reconnectingPromise).toBeNull();
      });
    });

    describe('getConnectionHealth', () => {
      it('should reflect connected state', () => {
        client.connected = true;
        const health = client.getConnectionHealth();
        expect(health.connected).toBe(true);
      });

      it('should accumulate timeout count', async () => {
        client.connected = true;
        client.callTool = vi
          .fn()
          .mockRejectedValueOnce(new Error('Request timeout'))
          .mockResolvedValueOnce({ content: [] });

        await client.callToolWithRetry('test_tool', {});

        const health = client.getConnectionHealth();
        expect(health.timeoutCount).toBe(1);
      });
    });

    describe('callToolWithRetry', () => {
      it('should succeed on first attempt without retrying', async () => {
        const expected = { content: [{ type: 'text', text: 'ok' }] };
        client.callTool = vi.fn().mockResolvedValue(expected);

        const result = await client.callToolWithRetry('tool_name', {});
        expect(result).toEqual(expected);
        expect(client.callTool).toHaveBeenCalledTimes(1);
      });

      it('should retry on timeout and succeed', async () => {
        const expected = { content: [] };
        client.callTool = vi
          .fn()
          .mockRejectedValueOnce(new Error('Request timeout'))
          .mockResolvedValueOnce(expected);
        client.connected = true;

        const result = await client.callToolWithRetry('tool_name', {}, 1);
        expect(result).toEqual(expected);
        expect(client.callTool).toHaveBeenCalledTimes(2);
      });

      it('should increment timeoutCount on each timeout', async () => {
        client.callTool = vi
          .fn()
          .mockRejectedValueOnce(new Error('Request timeout'))
          .mockRejectedValueOnce(new Error('Request timeout'))
          .mockResolvedValueOnce({ content: [] });
        client.connected = true;

        await client.callToolWithRetry('tool_name', {}, 3);

        expect(client.getConnectionHealth().timeoutCount).toBe(2);
      });

      it('should throw after exhausting all retries', async () => {
        const err = new Error('Request timeout');
        client.callTool = vi.fn().mockRejectedValue(err);
        client.connected = true;

        await expect(client.callToolWithRetry('tool_name', {}, 2)).rejects.toThrow(
          'Request timeout'
        );
        // 1 initial + 2 retries = 3 total attempts
        expect(client.callTool).toHaveBeenCalledTimes(3);
      });

      it('should trigger reconnect when disconnected mid-retry', async () => {
        client.callTool = vi
          .fn()
          .mockRejectedValueOnce(new Error('connection closed'))
          .mockResolvedValueOnce({ content: [] });
        client.connected = false;

        const reconnectSpy = vi.spyOn(client, 'reconnect').mockResolvedValue(undefined);

        const result = await client.callToolWithRetry('tool_name', {}, 1);
        expect(result).toEqual({ content: [] });
        expect(reconnectSpy).toHaveBeenCalledTimes(1);
      });

      it('should not reconnect when still connected on retry', async () => {
        client.callTool = vi
          .fn()
          .mockRejectedValueOnce(new Error('connection closed'))
          .mockResolvedValueOnce({ content: [] });
        client.connected = true;

        const reconnectSpy = vi.spyOn(client, 'reconnect').mockResolvedValue(undefined);

        await client.callToolWithRetry('tool_name', {}, 1);
        expect(reconnectSpy).not.toHaveBeenCalled();
      });

      it('should use instance maxRetries when no override provided', async () => {
        const c = new MCPConnection({ maxRetries: 1, connectionRetryDelay: 0 });
        const err = new Error('Request timeout');
        c.callTool = vi.fn().mockRejectedValue(err);
        c.connected = true;

        await expect(c.callToolWithRetry('tool_name')).rejects.toThrow('Request timeout');
        expect(c.callTool).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
      });

      it('should throw immediately without retrying on rate-limit (429) error', async () => {
        const rateLimitErr = new Error('Rate limited. Retry after 30s');
        client.callTool = vi.fn().mockRejectedValue(rateLimitErr);
        client.connected = true;

        await expect(client.callToolWithRetry('tool_name', {}, 3)).rejects.toThrow(
          'Rate limited. Retry after 30s'
        );
        // Must NOT retry — only 1 attempt
        expect(client.callTool).toHaveBeenCalledTimes(1);
      });

      it('should throw immediately without retrying on MCPSessionExpiredError', async () => {
        const sessionErr = new MCPSessionExpiredError('Unauthorized');
        client.callTool = vi.fn().mockRejectedValue(sessionErr);
        client.connected = true;

        await expect(client.callToolWithRetry('tool_name', {}, 3)).rejects.toBeInstanceOf(
          MCPSessionExpiredError
        );
        expect(client.callTool).toHaveBeenCalledTimes(1);
      });

      it('should throw immediately without retrying on TypeError (programmer error)', async () => {
        const typeErr = new TypeError('args must be a plain object');
        client.callTool = vi.fn().mockRejectedValue(typeErr);
        client.connected = true;

        await expect(client.callToolWithRetry('tool_name', {}, 3)).rejects.toBeInstanceOf(
          TypeError
        );
        expect(client.callTool).toHaveBeenCalledTimes(1);
      });
      it('should throw RangeError for negative maxRetries', async () => {
        await expect(client.callToolWithRetry('tool_name', {}, -1)).rejects.toThrow(RangeError);
        await expect(client.callToolWithRetry('tool_name', {}, -1)).rejects.toThrow(
          'maxRetries must be >= 0'
        );
      });
    });

    describe('reconnect', () => {
      it('should increment reconnectCount on each call', async () => {
        client.connect = vi.fn().mockResolvedValue(undefined);
        client.connected = false;

        await client.reconnect();
        expect(client.getConnectionHealth().reconnectCount).toBe(1);

        client.connected = false;
        await client.reconnect();
        expect(client.getConnectionHealth().reconnectCount).toBe(2);
      });

      it('should await the same in-flight promise when called concurrently', async () => {
        let resolveConnect;
        const connectPromise = new Promise((res) => {
          resolveConnect = res;
        });
        client.connect = vi.fn().mockReturnValue(connectPromise);
        client.connected = false;

        // Fire two concurrent reconnect calls
        const p1 = client.reconnect();
        const p2 = client.reconnect();

        // Only one reconnectCount increment should have happened (shared in-flight)
        expect(client.getConnectionHealth().reconnectCount).toBe(1);

        resolveConnect();
        await Promise.all([p1, p2]);

        // Still only 1 reconnect was initiated
        expect(client.getConnectionHealth().reconnectCount).toBe(1);
      });

      it('should clear reconnectingPromise after success', async () => {
        client.connect = vi.fn().mockResolvedValue(undefined);
        client.connected = false;

        await client.reconnect();
        expect(client.reconnectingPromise).toBeNull();
      });

      it('should clear reconnectingPromise after all attempts fail', async () => {
        client.connect = vi.fn().mockRejectedValue(new Error('cannot connect'));
        client.maxConnectionAttempts = 2;
        client.connected = false;

        await client.reconnect();
        expect(client.reconnectingPromise).toBeNull();
        expect(consoleOutput.errors.length).toBeGreaterThan(0);
      });
    });

    describe('Gateway session expiry (401)', () => {
      it('should throw MCPSessionExpiredError and clear session on 401', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.mcpSessionId = 'old-session-id';
        client.connected = true;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            headers: { get: () => null },
            text: async () => '',
          })
        );

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          MCPSessionExpiredError
        );
        expect(client.mcpSessionId).toBeNull();
        expect(client.connected).toBe(false);
      });

      it('should include statusText in the MCPSessionExpiredError message', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            headers: { get: () => null },
            text: async () => '',
          })
        );

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'MCP session expired (401)'
        );
      });
    });

    describe('Rate limit handling (X-Retry-After)', () => {
      it('should throw rate limit error with numeric delay from X-Retry-After', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
              get: (name) => (name === 'X-Retry-After' ? '30' : null),
            },
            text: async () => '',
          })
        );

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'Rate limited. Retry after 30s'
        );
        expect(consoleOutput.warnings.some((w) => w.includes('30s'))).toBe(true);
      });

      it('should fall back to Retry-After header if X-Retry-After is absent', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
              get: (name) => (name === 'Retry-After' ? '60' : null),
            },
            text: async () => '',
          })
        );

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'Rate limited. Retry after 60s'
        );
      });

      it('should format HTTP-date Retry-After as seconds until expiry', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        const futureDate = new Date(Date.now() + 90000).toUTCString();
        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
              get: (name) => (name === 'X-Retry-After' ? futureDate : null),
            },
            text: async () => '',
          })
        );

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          /Rate limited\. Retry after \d+s \(until /
        );
      });

      it('should throw generic gateway error when no rate-limit header present', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            headers: { get: () => null },
            text: async () => '',
          })
        );

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow('Gateway error 503');
      });

      it('should throw RATE_LIMIT_MSG for 429 without Retry-After header', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: { get: () => null },
            text: async () => '',
          })
        );

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'Rate limited. Retry after'
        );
      });

      it('should throw generic gateway error (not rate-limit) for non-429 with Retry-After header', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        vi.stubGlobal(
          'fetch',
          vi.fn().mockResolvedValue({
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            // Retry-After present but status is 503, not 429
            headers: { get: (name) => (name === 'Retry-After' ? '30' : null) },
            text: async () => '',
          })
        );

        // Must throw 'Gateway error 503', not a rate-limit error, even with a Retry-After header
        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow('Gateway error 503');
      });
    });
  });
});
