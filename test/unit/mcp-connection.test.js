// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for mcp-connection.js
 * Tests reconnection, retriable requests, health metrics, and rate limit handling
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MCPConnection, parseSSEResponse } from '../../scripts/mcp/mcp-connection.js';
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

  describe('MCPConnection', () => {
    let client;
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new MCPConnection({ connectionRetryDelay: 0 });
    });

    afterEach(() => {
      consoleOutput.restore();
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
          .mockRejectedValueOnce(new Error('temporary error'))
          .mockResolvedValueOnce({ content: [] });
        client.connected = true;

        const reconnectSpy = vi.spyOn(client, 'reconnect').mockResolvedValue(undefined);

        await client.callToolWithRetry('tool_name', {}, 1);
        expect(reconnectSpy).not.toHaveBeenCalled();
      });

      it('should use instance maxRetries when no override provided', async () => {
        const c = new MCPConnection({ maxRetries: 1, connectionRetryDelay: 0 });
        const err = new Error('fail');
        c.callTool = vi.fn().mockRejectedValue(err);
        c.connected = true;

        await expect(c.callToolWithRetry('tool_name')).rejects.toThrow('fail');
        expect(c.callTool).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
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

      it('should not run concurrently when reconnecting flag is set', async () => {
        client.reconnecting = true;
        const connectSpy = vi.spyOn(client, 'connect');

        await client.reconnect();
        expect(connectSpy).not.toHaveBeenCalled();
      });

      it('should reset reconnecting flag after success', async () => {
        client.connect = vi.fn().mockResolvedValue(undefined);
        client.connected = false;

        await client.reconnect();
        expect(client.reconnecting).toBe(false);
      });

      it('should reset reconnecting flag after all attempts fail', async () => {
        client.connect = vi.fn().mockRejectedValue(new Error('cannot connect'));
        client.maxConnectionAttempts = 2;
        client.connected = false;

        await client.reconnect();
        expect(client.reconnecting).toBe(false);
        expect(consoleOutput.errors.length).toBeGreaterThan(0);
      });
    });

    describe('Gateway session expiry (401)', () => {
      it('should clear session and mark disconnected on 401', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.mcpSessionId = 'old-session-id';
        client.connected = true;

        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: { get: () => null },
          text: async () => '',
        });

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'MCP session expired (401)'
        );
        expect(client.mcpSessionId).toBeNull();
        expect(client.connected).toBe(false);

        delete globalThis.fetch;
      });
    });

    describe('Rate limit handling (X-Retry-After)', () => {
      it('should throw rate limit error with retry delay from X-Retry-After', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            get: (name) => {
              if (name === 'X-Retry-After') return '30';
              return null;
            },
          },
          text: async () => '',
        });

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'Rate limited. Retry after 30s'
        );
        expect(consoleOutput.warnings.some((w) => w.includes('30s'))).toBe(true);

        delete globalThis.fetch;
      });

      it('should fall back to Retry-After header if X-Retry-After is absent', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            get: (name) => {
              if (name === 'Retry-After') return '60';
              return null;
            },
          },
          text: async () => '',
        });

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'Rate limited. Retry after 60s'
        );

        delete globalThis.fetch;
      });

      it('should throw generic gateway error when no rate-limit header present', async () => {
        client.gatewayUrl = 'http://fake-gateway/mcp';
        client.connected = true;

        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          headers: { get: () => null },
          text: async () => '',
        });

        await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
          'Gateway error 503'
        );

        delete globalThis.fetch;
      });
    });
  });
});
