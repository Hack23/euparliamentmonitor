// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Extended unit tests for mcp-connection.js — covers handleMessage,
 * _validateGatewayResponseBody, _sendGatewayRequest success paths,
 * sendRequest (stdio mode), disconnect, and callTool validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MCPConnection,
  MCPSessionExpiredError,
  MCPRateLimitError,
  parseSSEResponse,
} from '../../scripts/mcp/mcp-connection.js';
import { mockConsole } from '../helpers/test-utils.js';

describe('mcp-connection extended', () => {
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

  describe('handleMessage', () => {
    it('should resolve a pending request with the result', () => {
      const resolveFn = vi.fn();
      const rejectFn = vi.fn();
      client.pendingRequests.set(42, { resolve: resolveFn, reject: rejectFn });

      client.handleMessage('{"jsonrpc":"2.0","id":42,"result":{"tools":[]}}');

      expect(resolveFn).toHaveBeenCalledWith({ tools: [] });
      expect(rejectFn).not.toHaveBeenCalled();
      expect(client.pendingRequests.has(42)).toBe(false);
    });

    it('should reject a pending request when response has an error', () => {
      const resolveFn = vi.fn();
      const rejectFn = vi.fn();
      client.pendingRequests.set(7, { resolve: resolveFn, reject: rejectFn });

      client.handleMessage('{"jsonrpc":"2.0","id":7,"error":{"code":-32600,"message":"Invalid"}}');

      expect(rejectFn).toHaveBeenCalledWith(expect.any(Error));
      expect(rejectFn.mock.calls[0][0].message).toBe('Invalid');
      expect(resolveFn).not.toHaveBeenCalled();
    });

    it('should log a notification when message has method but no id', () => {
      client.handleMessage('{"jsonrpc":"2.0","method":"$/progress","params":{}}');

      expect(consoleOutput.logs.some((l) => l.includes('Notification'))).toBe(true);
    });

    it('should log an error for invalid JSON', () => {
      client.handleMessage('not valid json {{{');

      expect(consoleOutput.errors.some((e) => e.includes('Error parsing MCP message'))).toBe(true);
    });

    it('should ignore messages with no matching pending request', () => {
      // No pending request set for id=999
      client.handleMessage('{"jsonrpc":"2.0","id":999,"result":"orphan"}');

      // Should not crash, no resolve/reject called
      expect(client.pendingRequests.size).toBe(0);
    });

    it('should handle message with null id and no method gracefully', () => {
      // Neither a response (no matching pending) nor a notification (no method)
      client.handleMessage('{"jsonrpc":"2.0","id":null}');
      // Should not crash
      expect(consoleOutput.errors).toHaveLength(0);
    });

    it('should reject with default error message when error.message is missing', () => {
      const resolveFn = vi.fn();
      const rejectFn = vi.fn();
      client.pendingRequests.set(10, { resolve: resolveFn, reject: rejectFn });

      client.handleMessage('{"jsonrpc":"2.0","id":10,"error":{"code":-32000}}');

      expect(rejectFn).toHaveBeenCalled();
      expect(rejectFn.mock.calls[0][0].message).toBe('MCP server error');
    });
  });

  describe('_validateGatewayResponseBody', () => {
    it('should not throw for empty body', () => {
      expect(() => client._validateGatewayResponseBody('application/json', '')).not.toThrow();
    });

    it('should not throw for valid JSON without error', () => {
      expect(() =>
        client._validateGatewayResponseBody(
          'application/json',
          '{"jsonrpc":"2.0","id":1,"result":{}}'
        )
      ).not.toThrow();
    });

    it('should throw for JSON body with error containing MCP gateway message', () => {
      expect(() =>
        client._validateGatewayResponseBody(
          'application/json',
          '{"jsonrpc":"2.0","id":1,"error":{"message":"MCP gateway initialization error"}}'
        )
      ).toThrow('MCP gateway initialization error');
    });

    it('should not throw for JSON body with non-gateway error message', () => {
      // Non-MCP-gateway errors are swallowed by the catch block
      expect(() =>
        client._validateGatewayResponseBody(
          'application/json',
          '{"jsonrpc":"2.0","id":1,"error":{"message":"Init failed"}}'
        )
      ).not.toThrow();
    });

    it('should throw for SSE body with error field', () => {
      const body = 'data: {"jsonrpc":"2.0","id":1,"error":{"message":"SSE init error"}}\n';
      expect(() =>
        client._validateGatewayResponseBody('text/event-stream', body)
      ).toThrow('SSE init error');
    });

    it('should not throw for SSE body without error', () => {
      const body = 'data: {"jsonrpc":"2.0","id":1,"result":{}}\n';
      expect(() =>
        client._validateGatewayResponseBody('text/event-stream', body)
      ).not.toThrow();
    });

    it('should not throw for non-JSON body (plain text)', () => {
      expect(() =>
        client._validateGatewayResponseBody('text/plain', 'OK')
      ).not.toThrow();
    });

    it('should throw default error message when error.message is missing in JSON', () => {
      // When error.message is undefined, it uses 'MCP gateway initialization error'
      // which contains 'MCP gateway' so the catch-block re-throws it
      expect(() =>
        client._validateGatewayResponseBody(
          'application/json',
          '{"jsonrpc":"2.0","id":1,"error":{"code":-1}}'
        )
      ).toThrow('MCP gateway initialization error');
    });

    it('should use default error message when error.message is missing in SSE', () => {
      const body = 'data: {"jsonrpc":"2.0","id":1,"error":{"code":-1}}\n';
      expect(() =>
        client._validateGatewayResponseBody('text/event-stream', body)
      ).toThrow('MCP gateway initialization error');
    });
  });

  describe('_sendGatewayRequest success paths', () => {
    it('should return result from JSON response', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: () => null },
          text: async () => '{"jsonrpc":"2.0","id":1,"result":{"tools":["a","b"]}}',
        })
      );

      const result = await client._sendGatewayRequest('tools/list');
      expect(result).toEqual({ tools: ['a', 'b'] });
    });

    it('should return result from SSE response', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: (name) => (name === 'content-type' ? 'text/event-stream' : null) },
          text: async () => 'data: {"jsonrpc":"2.0","id":1,"result":{"data":"hello"}}\n',
        })
      );

      const result = await client._sendGatewayRequest('tools/call', { name: 'test' });
      expect(result).toEqual({ data: 'hello' });
    });

    it('should throw when SSE response cannot be parsed', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: (name) => (name === 'content-type' ? 'text/event-stream' : null) },
          text: async () => 'event: ping\n\n',
        })
      );

      await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
        'Failed to parse SSE response'
      );
    });

    it('should throw when SSE response contains an error', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: (name) => (name === 'content-type' ? 'text/event-stream' : null) },
          text: async () => 'data: {"jsonrpc":"2.0","id":1,"error":{"message":"Tool not found"}}\n',
        })
      );

      await expect(client._sendGatewayRequest('tools/call')).rejects.toThrow('Tool not found');
    });

    it('should throw when JSON response contains an error', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: () => null },
          text: async () => '{"jsonrpc":"2.0","id":1,"error":{"message":"Internal error"}}',
        })
      );

      await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow('Internal error');
    });

    it('should update mcpSessionId from response headers', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: (name) => (name === 'mcp-session-id' ? 'new-session-42' : null) },
          text: async () => '{"jsonrpc":"2.0","id":1,"result":{}}',
        })
      );

      await client._sendGatewayRequest('tools/list');
      expect(client.getMcpSessionId()).toBe('new-session-42');
    });

    it('should throw when gateway URL is not configured', async () => {
      client.gatewayUrl = null;
      client.connected = true;

      await expect(client._sendGatewayRequest('tools/list')).rejects.toThrow(
        'Gateway URL not configured'
      );
    });

    it('should include Mcp-Session-Id header when session is set', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;
      client.mcpSessionId = 'existing-session-1';

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => '{"jsonrpc":"2.0","id":1,"result":{}}',
      });
      vi.stubGlobal('fetch', fetchMock);

      await client._sendGatewayRequest('tools/list');

      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[1].headers['Mcp-Session-Id']).toBe('existing-session-1');
    });

    it('should include Authorization header when API key is set', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.gatewayApiKey = 'my-secret-key';
      client.connected = true;

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => '{"jsonrpc":"2.0","id":1,"result":{}}',
      });
      vi.stubGlobal('fetch', fetchMock);

      await client._sendGatewayRequest('tools/list');

      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[1].headers['Authorization']).toBe('my-secret-key');
    });
  });

  describe('sendRequest', () => {
    it('should throw when not connected', async () => {
      client.connected = false;
      await expect(client.sendRequest('tools/list')).rejects.toThrow('Not connected');
    });

    it('should delegate to _sendGatewayRequest when gatewayUrl is set', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';
      client.connected = true;

      const spy = vi.spyOn(client, '_sendGatewayRequest').mockResolvedValue({ tools: [] });

      const result = await client.sendRequest('tools/list', { foo: 'bar' });
      expect(result).toEqual({ tools: [] });
      expect(spy).toHaveBeenCalledWith('tools/list', { foo: 'bar' });
    });
  });

  describe('callTool', () => {
    it('should throw TypeError for null args', async () => {
      client.connected = true;
      await expect(client.callTool('test', null)).rejects.toThrow(TypeError);
    });

    it('should throw TypeError for array args', async () => {
      client.connected = true;
      await expect(client.callTool('test', [])).rejects.toThrow(TypeError);
    });

    it('should send correct request format via sendRequest', async () => {
      client.connected = true;
      const spy = vi.spyOn(client, 'sendRequest').mockResolvedValue({ content: [] });

      await client.callTool('get_meps', { country: 'SE' });
      expect(spy).toHaveBeenCalledWith('tools/call', {
        name: 'get_meps',
        arguments: { country: 'SE' },
      });
    });
  });

  describe('disconnect', () => {
    it('should reset connected state', () => {
      client.connected = true;
      client.mcpSessionId = 'session-1';
      client.disconnect();
      expect(client.isConnected()).toBe(false);
      expect(client.getMcpSessionId()).toBeNull();
    });

    it('should kill process if present', () => {
      const killFn = vi.fn();
      client.process = { kill: killFn };
      client.connected = true;

      client.disconnect();

      expect(killFn).toHaveBeenCalled();
      expect(client.process).toBeNull();
    });

    it('should be safe to call when no process exists', () => {
      client.process = null;
      expect(() => client.disconnect()).not.toThrow();
    });
  });

  describe('isConnected / isGatewayMode / getGatewayUrl / getGatewayApiKey', () => {
    it('isGatewayMode returns true when gatewayUrl is set', () => {
      const c = new MCPConnection({ gatewayUrl: 'http://gw/mcp' });
      expect(c.isGatewayMode()).toBe(true);
    });

    it('isGatewayMode returns false when gatewayUrl is empty', () => {
      const c = new MCPConnection({});
      expect(c.isGatewayMode()).toBe(false);
    });

    it('getGatewayUrl returns the configured URL', () => {
      const c = new MCPConnection({ gatewayUrl: 'http://gw/mcp' });
      expect(c.getGatewayUrl()).toBe('http://gw/mcp');
    });

    it('getGatewayApiKey returns the configured key', () => {
      const c = new MCPConnection({ gatewayApiKey: 'secret-key' });
      expect(c.getGatewayApiKey()).toBe('secret-key');
    });
  });

  describe('_computeConnectionDelay', () => {
    it('should use retryAfterMs from MCPRateLimitError', () => {
      const err = new MCPRateLimitError(45000, 'rate limited');
      const delay = client._computeConnectionDelay(err, 1);
      expect(delay).toBe(45000);
    });

    it('should use exponential backoff for non-rate-limit errors', () => {
      const err = new Error('connection refused');
      client.connectionRetryDelay = 1000;
      expect(client._computeConnectionDelay(err, 1)).toBe(1000); // 1000 * 2^0
      expect(client._computeConnectionDelay(err, 2)).toBe(2000); // 1000 * 2^1
      expect(client._computeConnectionDelay(err, 3)).toBe(4000); // 1000 * 2^2
    });
  });

  describe('_handleConnectionAttemptError', () => {
    it('should throw MCPSessionExpiredError immediately', () => {
      const err = new MCPSessionExpiredError('Unauthorized');
      expect(() => client._handleConnectionAttemptError(err)).toThrow(MCPSessionExpiredError);
    });

    it('should increment connection attempts', () => {
      client.maxConnectionAttempts = 5;
      client.connectionAttempts = 0;
      const delay = client._handleConnectionAttemptError(new Error('fail'));
      expect(client.connectionAttempts).toBe(1);
      expect(delay).toBeGreaterThanOrEqual(0);
    });

    it('should throw after max attempts exhausted', () => {
      client.maxConnectionAttempts = 2;
      client.connectionAttempts = 1;
      expect(() => client._handleConnectionAttemptError(new Error('fail'))).toThrow('fail');
    });
  });

  describe('_attemptGatewayConnection', () => {
    it('should throw when gatewayUrl is null', async () => {
      client.gatewayUrl = null;
      await expect(client._attemptGatewayConnection()).rejects.toThrow(
        'Gateway URL not configured'
      );
    });

    it('should set connected=true on success', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: () => null },
          text: async () => '{"jsonrpc":"2.0","id":1,"result":{}}',
        })
      );

      await client._attemptGatewayConnection();
      expect(client.isConnected()).toBe(true);
    });

    it('should extract session ID from response header', async () => {
      client.gatewayUrl = 'http://fake-gateway/mcp';

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: (name) => (name === 'mcp-session-id' ? 'sess-abc' : null),
          },
          text: async () => '',
        })
      );

      await client._attemptGatewayConnection();
      expect(client.getMcpSessionId()).toBe('sess-abc');
    });
  });

  describe('MCPRateLimitError', () => {
    it('should carry retryAfterMs value', () => {
      const err = new MCPRateLimitError(5000, 'Rate limited');
      expect(err.retryAfterMs).toBe(5000);
      expect(err.name).toBe('MCPRateLimitError');
      expect(err).toBeInstanceOf(Error);
    });

    it('should have zero retryAfterMs when header is missing', () => {
      const err = new MCPRateLimitError(0, 'Rate limited, no header');
      expect(err.retryAfterMs).toBe(0);
    });
  });

  describe('serverLabel option', () => {
    it('should default to European Parliament MCP Server', () => {
      expect(client.serverLabel).toBe('European Parliament MCP Server');
    });

    it('should accept a custom label', () => {
      const c = new MCPConnection({ serverLabel: 'IMF Data Client' });
      expect(c.serverLabel).toBe('IMF Data Client');
    });
  });
});
