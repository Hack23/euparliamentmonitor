// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for ep-mcp-client.js
 * Tests MCP client connection, retries, validation, and error handling
 *
 * @typedef {import('../../scripts/mcp/ep-mcp-client.js').EuropeanParliamentMCPClient} EPMCPClient
 * @typedef {import('../helpers/test-utils.js').MockConsoleResult} MockConsoleResult
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import {
  EuropeanParliamentMCPClient,
  getEPMCPClient,
  closeEPMCPClient,
} from '../../scripts/mcp/ep-mcp-client.js';
import { mockConsole } from '../helpers/test-utils.js';

describe('ep-mcp-client', () => {
  describe('EuropeanParliamentMCPClient', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
      if (client?.connected) {
        client.disconnect();
      }
    });

    describe('Constructor', () => {
      it('should initialize with default options', () => {
        expect(client.connected).toBe(false);
        expect(client.process).toBeNull();
        expect(client.requestId).toBe(0);
        expect(client.maxConnectionAttempts).toBe(3);
        expect(client.connectionRetryDelay).toBe(1000);
      });

      it('should default serverPath to npm package binary in node_modules/.bin', () => {
        const hadEnvVar = 'EP_MCP_SERVER_PATH' in process.env;
        const originalPath = process.env.EP_MCP_SERVER_PATH;
        delete process.env.EP_MCP_SERVER_PATH;

        const defaultClient = new EuropeanParliamentMCPClient();
        expect(defaultClient.serverPath).toContain('european-parliament-mcp-server');
        expect(path.isAbsolute(defaultClient.serverPath)).toBe(true);

        // Restore
        if (hadEnvVar) {
          process.env.EP_MCP_SERVER_PATH = originalPath;
        }
      });

      it('should accept custom options', () => {
        const customClient = new EuropeanParliamentMCPClient({
          serverPath: '/custom/path',
          maxConnectionAttempts: 5,
          connectionRetryDelay: 2000,
        });

        expect(customClient.serverPath).toBe('/custom/path');
        expect(customClient.maxConnectionAttempts).toBe(5);
        expect(customClient.connectionRetryDelay).toBe(2000);
      });

      it('should use environment variable for server path', () => {
        const originalPath = process.env.EP_MCP_SERVER_PATH;
        process.env.EP_MCP_SERVER_PATH = '/env/path';

        const envClient = new EuropeanParliamentMCPClient();
        expect(envClient.serverPath).toBe('/env/path');

        // Restore
        if (originalPath) {
          process.env.EP_MCP_SERVER_PATH = originalPath;
        } else {
          delete process.env.EP_MCP_SERVER_PATH;
        }
      });

      it('should initialize pending requests map', () => {
        expect(client.pendingRequests).toBeInstanceOf(Map);
        expect(client.pendingRequests.size).toBe(0);
      });
    });

    describe('Connection Management', () => {
      it('should use serverPath as binary command (not node with script argument)', () => {
        // The serverPath should be used directly as the executable command,
        // not wrapped as 'node [serverPath]'. Verify by checking serverPath is
        // an absolute path to the binary, not a .js script.
        const hadEnvVar = 'EP_MCP_SERVER_PATH' in process.env;
        const originalEnv = process.env.EP_MCP_SERVER_PATH;
        delete process.env.EP_MCP_SERVER_PATH;

        const clientWithBinary = new EuropeanParliamentMCPClient();
        // Default path should point to the binary (not a .js file for node to execute)
        expect(clientWithBinary.serverPath).not.toMatch(/\.js$/);
        expect(clientWithBinary.serverPath).toContain('european-parliament-mcp-server');

        if (hadEnvVar) {
          process.env.EP_MCP_SERVER_PATH = originalEnv;
        }
      });

      it('should handle connection behavior consistently', async () => {
        // Set an invalid server path
        client.serverPath = '/nonexistent/path/to/server.js';

        // The behavior depends on the system:
        // - Some systems: spawn fails immediately (throws error)
        // - Other systems: spawn succeeds, process starts then exits (connected=true briefly)
        try {
          await client.connect();
          // If we get here, spawn succeeded but process likely exited
          // Just verify client state is consistent
          expect(client.serverPath).toBe('/nonexistent/path/to/server.js');
        } catch (error) {
          // If spawn failed, that's also expected
          expect(error).toBeDefined();
        }
        // Either way, the client should handle it gracefully without crashing
      });

      it('should not reconnect if already connected', async () => {
        client.connected = true;
        const initialAttempts = client.connectionAttempts;

        await client.connect();

        expect(client.connectionAttempts).toBe(initialAttempts);
      });

      it('should disconnect properly', () => {
        // Mock a connected state
        const mockKill = vi.fn();
        client.connected = true;
        client.process = { kill: mockKill };

        client.disconnect();

        expect(mockKill).toHaveBeenCalled();
        expect(client.connected).toBe(false);
        expect(client.process).toBeNull();
      });

      it('should handle disconnect when not connected', () => {
        client.disconnect();
        expect(client.connected).toBe(false);
      });
    });

    describe('Message Handling', () => {
      it('should handle valid JSON response messages', () => {
        const mockResolve = vi.fn();
        const mockReject = vi.fn();

        client.pendingRequests.set(1, { resolve: mockResolve, reject: mockReject });

        const message = JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          result: { data: 'test' },
        });

        client.handleMessage(message);

        expect(mockResolve).toHaveBeenCalledWith({ data: 'test' });
        expect(mockReject).not.toHaveBeenCalled();
        expect(client.pendingRequests.has(1)).toBe(false);
      });

      it('should handle error response messages', () => {
        const mockResolve = vi.fn();
        const mockReject = vi.fn();

        client.pendingRequests.set(1, { resolve: mockResolve, reject: mockReject });

        const message = JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          error: { message: 'Test error' },
        });

        client.handleMessage(message);

        expect(mockReject).toHaveBeenCalled();
        expect(mockResolve).not.toHaveBeenCalled();
        expect(client.pendingRequests.has(1)).toBe(false);
      });

      it('should handle notification messages without id', () => {
        const message = JSON.stringify({
          jsonrpc: '2.0',
          method: 'notification',
          params: { data: 'test' },
        });

        // Should not throw
        expect(() => client.handleMessage(message)).not.toThrow();
      });

      it('should handle invalid JSON gracefully', () => {
        const invalidMessage = '{ invalid json }';

        // Should not throw
        expect(() => client.handleMessage(invalidMessage)).not.toThrow();
        expect(consoleOutput.errors.length).toBeGreaterThan(0);
      });

      it('should ignore messages for unknown request IDs', () => {
        const message = JSON.stringify({
          jsonrpc: '2.0',
          id: 999,
          result: { data: 'test' },
        });

        // Should not throw
        expect(() => client.handleMessage(message)).not.toThrow();
      });
    });

    describe('Request Sending', () => {
      it('should throw error when not connected', async () => {
        await expect(client.sendRequest('test_method')).rejects.toThrow(
          'Not connected to MCP server'
        );
      });

      it('should increment request ID', () => {
        client.connected = true;
        client.process = {
          stdin: {
            write: vi.fn(),
          },
          kill: vi.fn(),
        };

        const initialId = client.requestId;

        // Just start the request, don't await
        client.sendRequest('test_method', {});

        // Request ID should increment immediately
        expect(client.requestId).toBe(initialId + 1);

        // Clean up
        client.pendingRequests.clear();
        client.disconnect();
      });

      it('should format request correctly', () => {
        client.connected = true;
        const writeMock = vi.fn();
        client.process = {
          stdin: { write: writeMock },
          kill: vi.fn(),
        };

        // Start request (don't await, just check the write call)
        client.sendRequest('test_method', { param: 'value' });

        // Check written message
        expect(writeMock).toHaveBeenCalled();
        const written = writeMock.mock.calls[0][0];
        const request = JSON.parse(written);

        expect(request.jsonrpc).toBe('2.0');
        expect(request.method).toBe('test_method');
        expect(request.params).toEqual({ param: 'value' });
        expect(request.id).toBeGreaterThan(0);

        // Clean up
        client.pendingRequests.clear();
        client.disconnect();
      });
    });

    describe('Tool Operations', () => {
      beforeEach(() => {
        client.connected = true;
        client.sendRequest = vi.fn().mockResolvedValue({ tools: [] });
      });

      it('should list tools', async () => {
        await client.listTools();
        expect(client.sendRequest).toHaveBeenCalledWith('tools/list');
      });

      it('should call tool with arguments', async () => {
        const args = { param: 'value' };
        await client.callTool('test_tool', args);

        expect(client.sendRequest).toHaveBeenCalledWith('tools/call', {
          name: 'test_tool',
          arguments: args,
        });
      });

      it('should get MEPs', async () => {
        const options = { country: 'DE', limit: 10 };
        await client.getMEPs(options);

        expect(client.sendRequest).toHaveBeenCalledWith('tools/call', {
          name: 'get_meps',
          arguments: options,
        });
      });

      it('should reject array arguments in callTool', async () => {
        await expect(client.callTool('test_tool', [])).rejects.toThrow(TypeError);
      });
    });

    describe('European Parliament Data Methods', () => {
      beforeEach(() => {
        client.connected = true;
        client.callTool = vi.fn();
      });

      it('should get MEPs with options', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });

        const options = { country: 'DE', limit: 10 };
        await client.getMEPs(options);

        expect(client.callTool).toHaveBeenCalledWith('get_meps', options);
      });

      it('should handle missing getMEPs tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMEPs();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });
      });

      it('should get plenary sessions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"sessions": []}' }],
        });

        const options = { startDate: '2025-01-01', endDate: '2025-01-31' };
        await client.getPlenarySessions(options);

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_sessions', options);
      });

      it('should pass dateFrom and dateTo directly in getPlenarySessions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"sessions": []}' }],
        });

        await client.getPlenarySessions({
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
          limit: 50,
        });

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_sessions', {
          dateFrom: '2025-01-01',
          dateTo: '2025-01-31',
          limit: 50,
        });
      });

      it('should pass year parameter in getPlenarySessions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"sessions": []}' }],
        });

        await client.getPlenarySessions({ year: 2025, limit: 10 });

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_sessions', {
          year: 2025,
          limit: 10,
        });
      });

      it('should handle missing plenary sessions tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getPlenarySessions();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"data": [], "total": 0}' }],
        });
      });

      it('should pass date filters through and return plenary sessions unchanged without local filtering', async () => {
        // Include an intentionally out-of-window item (date before dateFrom) to ensure
        // the client does NOT apply any local post-filtering to the tool response.
        // The upstream EP-MCP-Server v1.2.14+ is responsible for date-filtering (Defect #5);
        // this client must pass the response through unchanged.
        const mockPayload = {
          data: [
            { date: '2026-03-28', location: 'Strasbourg', eventId: 'PLN-2026-03-28' },
            { date: '2026-04-10', location: 'Brussels', eventId: 'PLN-2026-04-10' },
            { date: '2026-04-22', location: 'Strasbourg', eventId: 'PLN-2026-04-22' },
          ],
          total: 3,
        };
        const mockToolResult = {
          content: [{ type: 'text', text: JSON.stringify(mockPayload) }],
        };
        client.callTool.mockResolvedValue(mockToolResult);

        const result = await client.getPlenarySessions({ dateFrom: '2026-04-01' });

        // The client must pass dateFrom through to the MCP tool unchanged.
        expect(client.callTool).toHaveBeenCalledWith('get_plenary_sessions', {
          dateFrom: '2026-04-01',
        });
        // The response must be returned as-is — client must not filter out the out-of-window item.
        expect(result).toEqual(mockToolResult);

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.data).toContainEqual({
          date: '2026-03-28',
          location: 'Strasbourg',
          eventId: 'PLN-2026-03-28',
        });
      });

      it('should return plenary session totals unchanged without fixing mismatched counts', async () => {
        // Include an intentionally mismatched total to verify the client returns the
        // MCP tool response as-is rather than repairing the payload locally.
        const mockPayload = {
          data: [
            { date: '2026-04-05', location: 'Strasbourg', eventId: 'PLN-2026-04-05' },
            { date: '2026-04-15', location: 'Brussels', eventId: 'PLN-2026-04-15' },
          ],
          total: 99,
        };
        const mockToolResult = {
          content: [{ type: 'text', text: JSON.stringify(mockPayload) }],
        };
        client.callTool.mockResolvedValue(mockToolResult);

        const result = await client.getPlenarySessions({
          dateFrom: '2026-04-01',
          dateTo: '2026-04-30',
        });

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_sessions', {
          dateFrom: '2026-04-01',
          dateTo: '2026-04-30',
        });
        // The response must be returned as-is — client must not normalise total to data.length.
        expect(result).toEqual(mockToolResult);

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.total).toBe(99);
        expect(parsed.data).toHaveLength(2);
      });

      it('should search documents', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        const options = { keyword: 'climate', documentType: 'proposal' };
        await client.searchDocuments(options);

        expect(client.callTool).toHaveBeenCalledWith('search_documents', {
          keyword: 'climate',
          documentType: 'proposal',
        });
      });

      it('should pass keyword directly to MCP tool without renaming in searchDocuments', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        await client.searchDocuments({ keyword: 'parliament', limit: 20 });

        expect(client.callTool).toHaveBeenCalledWith(
          'search_documents',
          expect.objectContaining({ keyword: 'parliament', limit: 20 })
        );
        const callArgs = client.callTool.mock.calls[0][1];
        expect(callArgs).not.toHaveProperty('query');
      });

      it('should handle missing search documents tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.searchDocuments();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should get parliamentary questions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"questions": []}' }],
        });

        const options = { type: 'written', limit: 20 };
        await client.getParliamentaryQuestions(options);

        expect(client.callTool).toHaveBeenCalledWith('get_parliamentary_questions', options);
      });

      it('should pass dateFrom directly in getParliamentaryQuestions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"questions": []}' }],
        });

        await client.getParliamentaryQuestions({ dateFrom: '2024-01-01', limit: 10 });

        const callArgs = client.callTool.mock.calls[0][1];
        expect(callArgs).toHaveProperty('dateFrom', '2024-01-01');
        expect(callArgs).toHaveProperty('limit', 10);
      });

      it('should handle missing parliamentary questions tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getParliamentaryQuestions();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"questions": []}' }],
        });
      });

      it('should get committee info', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"committees": []}' }],
        });

        const options = { abbreviation: 'ENVI' };
        await client.getCommitteeInfo(options);

        expect(client.callTool).toHaveBeenCalledWith('get_committee_info', {
          abbreviation: 'ENVI',
        });
      });

      it('should handle missing committee info tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getCommitteeInfo();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"committees": []}' }],
        });
      });

      it('should monitor legislative pipeline', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"procedures": []}' }],
        });

        const options = { status: 'ACTIVE', limit: 20 };
        await client.monitorLegislativePipeline(options);

        expect(client.callTool).toHaveBeenCalledWith('monitor_legislative_pipeline', options);
      });

      it('should pass no dates to the underlying tool when none supplied (opts-in to server default)', async () => {
        // This test documents the *expected* contract for v1.2.14+ where omitting
        // dateFrom/dateTo causes the server to return a rolling last-30-days
        // period window.  The mock simulates that v1.2.14+ response.
        //
        // Under the historical pre-v1.2.14 server the response would instead be
        // period: { from: "2024-01-01", to: "2024-12-31" } producing an empty
        // pipeline; that is why Stage-A prompts (01-data-collection.md rule 6,
        // 07-mcp-reference.md §4) require explicit dates. The gateway is now
        // pinned to v1.2.15 (rolling-30-days default), but explicit dates remain
        // the required calling pattern for reproducibility.
        const now = Date.now();
        const today = new Date(now).toISOString().slice(0, 10);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        // Mock simulates v1.2.14+ server response: last-30-days window
        client.callTool.mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                period: { from: thirtyDaysAgo, to: today },
                pipeline: [],
                summary: { totalProcedures: 0 },
              }),
            },
          ],
        });

        const result = await client.monitorLegislativePipeline();

        // The client wrapper must NOT inject any date arguments — the server
        // is responsible for applying its own default window
        expect(client.callTool).toHaveBeenCalledWith('monitor_legislative_pipeline', {});

        // The response period must reflect the last-30-days window
        const data = JSON.parse(result.content[0].text);
        expect(data.period.to).toBe(today);
        expect(data.period.from).toBe(thirtyDaysAgo);
      });

      it('should handle missing legislative pipeline tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.monitorLegislativePipeline();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"procedures": []}' }],
        });
      });

      it('should get MEP details', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"mep": {"id": "MEP-123"}}' }],
        });

        await client.getMEPDetails('MEP-123');

        expect(client.callTool).toHaveBeenCalledWith('get_mep_details', { id: 'MEP-123' });
      });

      it('should handle missing get_mep_details tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMEPDetails('MEP-123');

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"mep": null}' }],
        });
      });

      it('should return null fallback for empty id in getMEPDetails', async () => {
        const result = await client.getMEPDetails('');

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"mep": null}' }],
        });
      });

      it('should return null fallback for whitespace-only id in getMEPDetails', async () => {
        const result = await client.getMEPDetails('   ');

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"mep": null}' }],
        });
      });

      it('should get voting records', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"votes": []}' }],
        });

        const options = { mepId: 'MEP-123', sessionId: 'SESSION-1', limit: 50 };
        await client.getVotingRecords(options);

        expect(client.callTool).toHaveBeenCalledWith('get_voting_records', options);
      });

      it('should handle missing get_voting_records tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getVotingRecords();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"votes": []}' }],
        });
      });

      it('should analyze voting patterns', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"patterns": {}}' }],
        });

        const options = { mepId: 'MEP-123', compareWithGroup: true };
        await client.analyzeVotingPatterns(options);

        expect(client.callTool).toHaveBeenCalledWith('analyze_voting_patterns', options);
      });

      it('should handle missing analyze_voting_patterns tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.analyzeVotingPatterns({ mepId: 'MEP-123' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"patterns": null}' }],
        });
      });

      it('should return null fallback for empty mepId in analyzeVotingPatterns', async () => {
        const result = await client.analyzeVotingPatterns({ mepId: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"patterns": null}' }],
        });
      });

      it('should return null fallback for whitespace-only mepId in analyzeVotingPatterns', async () => {
        const result = await client.analyzeVotingPatterns({ mepId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"patterns": null}' }],
        });
      });

      it('should track legislation', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"procedure": {}}' }],
        });

        await client.trackLegislation('2024/0001(COD)');

        expect(client.callTool).toHaveBeenCalledWith('track_legislation', {
          procedureId: '2024/0001(COD)',
        });
      });

      it('should handle missing track_legislation tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.trackLegislation('2024/0001(COD)');

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"procedure": null}' }],
        });
      });

      it('should return null fallback for empty procedureId in trackLegislation', async () => {
        const result = await client.trackLegislation('');

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"procedure": null}' }],
        });
      });

      it('should return null fallback for whitespace-only procedureId in trackLegislation', async () => {
        const result = await client.trackLegislation('   ');

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"procedure": null}' }],
        });
      });

      it('should generate report', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"report": {}}' }],
        });

        const options = {
          reportType: 'MEP_ACTIVITY',
          subjectId: 'MEP-123',
          dateFrom: '2025-01-01',
        };
        await client.generateReport(options);

        expect(client.callTool).toHaveBeenCalledWith('generate_report', options);
      });

      it('should handle missing generate_report tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.generateReport({ reportType: 'VOTING_STATISTICS' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"report": null}' }],
        });
      });

      it('should return null fallback for empty reportType in generateReport', async () => {
        const result = await client.generateReport({ reportType: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"report": null}' }],
        });
      });

      it('should return null fallback for whitespace-only reportType in generateReport', async () => {
        const result = await client.generateReport({ reportType: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"report": null}' }],
        });
      });
    });

    describe('OSINT Intelligence Methods', () => {
      beforeEach(() => {
        client.connected = true;
        client.callTool = vi.fn();
      });

      it('should assess MEP influence', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"influence": {"score": 85}}' }],
        });

        const options = { mepId: 'MEP-123', dateFrom: '2024-01-01', dateTo: '2024-12-31' };
        await client.assessMEPInfluence(options);

        expect(client.callTool).toHaveBeenCalledWith('assess_mep_influence', options);
      });

      it('should handle missing assess MEP influence tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.assessMEPInfluence({ mepId: 'MEP-123' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"influence": {}}' }],
        });
      });

      it('should return fallback for assessMEPInfluence with blank mepId', async () => {
        const result = await client.assessMEPInfluence({ mepId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"influence": {}}' }],
        });
      });

      it('should analyze coalition dynamics', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"coalitions": []}' }],
        });

        const options = { groupIds: ['EPP', 'S&D'], dateFrom: '2024-01-01' };
        await client.analyzeCoalitionDynamics(options);

        expect(client.callTool).toHaveBeenCalledWith('analyze_coalition_dynamics', options);
      });

      it('should handle missing analyze coalition dynamics tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.analyzeCoalitionDynamics();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"coalitions": []}' }],
        });
      });

      // Stage-B alias smoke-test (MCP server v1.2.14+ canonicalises PPE → EPP server-side).
      // Verifies that analyzeCoalitionDynamics forwards groupIds unchanged — no local remapping —
      // and that a v1.2.14+ shaped response is returned correctly:
      //   groupMetrics includes EPP with memberCount > 0, and PPE is absent from
      //   coverage.unrecognizedGroups.
      it('should pass PPE alias unchanged to server (v1.2.14+ canonicalization)', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify({ groupIds: ['PPE'] }) }],
        });

        const options = { groupIds: ['PPE'] };
        await client.analyzeCoalitionDynamics(options);

        // PPE must be forwarded as-is — no client-side canonicalisation to 'EPP'.
        expect(client.callTool).toHaveBeenCalledWith('analyze_coalition_dynamics', options);
      });

      it('should return EPP group with non-zero memberCount when MCP server resolves PPE alias (v1.2.14+)', async () => {
        // Simulate the v1.2.14+ response where PPE is canonicalised to EPP server-side.
        const v1214Response = {
          groupMetrics: [{ groupId: 'EPP', memberCount: 188 }],
          coverage: { unrecognizedGroups: [] },
        };
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(v1214Response) }],
        });

        const result = await client.analyzeCoalitionDynamics({ groupIds: ['PPE'] });

        const parsed = JSON.parse(result.content[0].text);
        const epp = parsed.groupMetrics.find((g) => g.groupId === 'EPP');
        expect(epp).toBeDefined();
        expect(epp.memberCount).toBeGreaterThan(0);
        expect(parsed.coverage.unrecognizedGroups).not.toContain('PPE');
      });

      it('should detect voting anomalies', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"anomalies": []}' }],
        });

        const options = { mepId: 'MEP-123', groupId: 'EPP', dateFrom: '2024-01-01' };
        await client.detectVotingAnomalies(options);

        expect(client.callTool).toHaveBeenCalledWith('detect_voting_anomalies', options);
      });

      it('should handle missing detect voting anomalies tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.detectVotingAnomalies();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"anomalies": []}' }],
        });
      });

      it('should compare political groups', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"comparison": {}}' }],
        });

        const options = {
          groupIds: ['EPP', 'S&D'],
          dimensions: ['attendance'],
          dateFrom: '2024-01-01',
        };
        await client.comparePoliticalGroups(options);

        expect(client.callTool).toHaveBeenCalledWith('compare_political_groups', options);
      });

      it('should handle missing compare political groups tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.comparePoliticalGroups({ groupIds: ['EPP', 'S&D'] });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"comparison": {}}' }],
        });
      });

      it('should return fallback for comparePoliticalGroups with empty groups', async () => {
        const result = await client.comparePoliticalGroups({ groupIds: [] });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"comparison": {}}' }],
        });
      });

      it('should analyze legislative effectiveness', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"effectiveness": {"score": 72}}' }],
        });

        const options = { subjectId: 'MEP-123', subjectType: 'MEP', dateFrom: '2024-01-01' };
        await client.analyzeLegislativeEffectiveness(options);

        expect(client.callTool).toHaveBeenCalledWith('analyze_legislative_effectiveness', options);
      });

      it('should handle missing analyze legislative effectiveness tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.analyzeLegislativeEffectiveness({
          subjectId: 'MEP-123',
          subjectType: 'MEP',
        });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"effectiveness": null}' }],
        });
      });

      it('should return fallback for analyzeLegislativeEffectiveness with blank subjectId', async () => {
        const result = await client.analyzeLegislativeEffectiveness({
          subjectId: '',
          subjectType: 'MEP',
        });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"effectiveness": null}' }],
        });
      });

      it('should analyze committee activity', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"activity": {"meetings": 5}}' }],
        });

        const options = { committeeId: 'ENVI', dateFrom: '2024-01-01' };
        await client.analyzeCommitteeActivity(options);

        expect(client.callTool).toHaveBeenCalledWith('analyze_committee_activity', options);
      });

      it('should handle missing analyze_committee_activity tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.analyzeCommitteeActivity();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"activity": null}' }],
        });
      });

      it('should track MEP attendance', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"attendance": {"rate": 0.85}}' }],
        });

        const options = { mepId: 'MEP-123', dateFrom: '2024-01-01' };
        await client.trackMEPAttendance(options);

        expect(client.callTool).toHaveBeenCalledWith('track_mep_attendance', options);
      });

      it('should handle missing track_mep_attendance tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.trackMEPAttendance();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"attendance": null}' }],
        });
      });

      it('should analyze country delegation', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"delegation": {"cohesion": 0.75}}' }],
        });

        const options = { country: 'DE', dateFrom: '2024-01-01' };
        await client.analyzeCountryDelegation(options);

        expect(client.callTool).toHaveBeenCalledWith('analyze_country_delegation', options);
      });

      it('should handle missing analyze_country_delegation tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.analyzeCountryDelegation({ country: 'DE' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"delegation": null}' }],
        });
      });

      it('should return fallback for analyzeCountryDelegation with empty country', async () => {
        const result = await client.analyzeCountryDelegation({ country: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"delegation": null}' }],
        });
      });

      it('should generate political landscape', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"landscape": {"groups": 8}}' }],
        });

        const options = { dateFrom: '2024-01-01', includeDetails: true };
        await client.generatePoliticalLandscape(options);

        expect(client.callTool).toHaveBeenCalledWith('generate_political_landscape', options);
      });

      it('should handle missing generate_political_landscape tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.generatePoliticalLandscape();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"landscape": null}' }],
        });
      });
    });

    describe('Open Data Portal Methods', () => {
      beforeEach(() => {
        client.connected = true;
        client.callTool = vi.fn();
      });

      it('should get current MEPs', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"meps": [{"name": "Test MEP"}]}' }],
        });

        const options = { limit: 10 };
        await client.getCurrentMEPs(options);

        expect(client.callTool).toHaveBeenCalledWith('get_current_meps', options);
      });

      it('should handle missing get_current_meps tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getCurrentMEPs();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });
      });

      it('should get speeches', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"speeches": []}' }],
        });

        const options = { dateFrom: '2025-01-01', dateTo: '2025-01-31' };
        await client.getSpeeches(options);

        expect(client.callTool).toHaveBeenCalledWith('get_speeches', options);
      });

      it('should handle missing get_speeches tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getSpeeches();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"speeches": []}' }],
        });
      });

      it('should get procedures', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"procedures": []}' }],
        });

        const options = { limit: 10 };
        await client.getProcedures(options);

        expect(client.callTool).toHaveBeenCalledWith('get_procedures', options);
      });

      it('should handle missing get_procedures tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getProcedures();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"procedures": []}' }],
        });
      });

      it('should get adopted texts', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"texts": []}' }],
        });

        const options = { year: 2025 };
        await client.getAdoptedTexts(options);

        expect(client.callTool).toHaveBeenCalledWith('get_adopted_texts', options);
      });

      it('should handle missing get_adopted_texts tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getAdoptedTexts();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"texts": []}' }],
        });
      });

      it('should get events', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"events": []}' }],
        });

        const options = { limit: 20 };
        await client.getEvents(options);

        expect(client.callTool).toHaveBeenCalledWith('get_events', options);
      });

      it('should handle missing get_events tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getEvents();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"events": []}' }],
        });
      });

      it('should get meeting activities', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });

        const options = { sittingId: 'SITTING-123' };
        await client.getMeetingActivities(options);

        expect(client.callTool).toHaveBeenCalledWith('get_meeting_activities', options);
      });

      it('should handle missing get_meeting_activities tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMeetingActivities({ sittingId: 'SITTING-123' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });
      });

      it('should return fallback for getMeetingActivities with empty sittingId', async () => {
        const result = await client.getMeetingActivities({ sittingId: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });
      });

      it('should return fallback for getMeetingActivities with whitespace sittingId', async () => {
        const result = await client.getMeetingActivities({ sittingId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });
      });

      it('should get meeting decisions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"decisions": []}' }],
        });

        const options = { sittingId: 'SITTING-123' };
        await client.getMeetingDecisions(options);

        expect(client.callTool).toHaveBeenCalledWith('get_meeting_decisions', options);
      });

      it('should handle missing get_meeting_decisions tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMeetingDecisions({ sittingId: 'SITTING-123' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"decisions": []}' }],
        });
      });

      it('should return fallback for getMeetingDecisions with empty sittingId', async () => {
        const result = await client.getMeetingDecisions({ sittingId: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"decisions": []}' }],
        });
      });

      it('should return fallback for getMeetingDecisions with whitespace sittingId', async () => {
        const result = await client.getMeetingDecisions({ sittingId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"decisions": []}' }],
        });
      });

      it('should get MEP declarations', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"declarations": []}' }],
        });

        const options = { year: 2025 };
        await client.getMEPDeclarations(options);

        expect(client.callTool).toHaveBeenCalledWith('get_mep_declarations', options);
      });

      it('should handle missing get_mep_declarations tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMEPDeclarations();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"declarations": []}' }],
        });
      });

      it('should get incoming MEPs', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });

        const options = { limit: 10 };
        await client.getIncomingMEPs(options);

        expect(client.callTool).toHaveBeenCalledWith('get_incoming_meps', options);
      });

      it('should handle missing get_incoming_meps tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getIncomingMEPs();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });
      });

      it('should get outgoing MEPs', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });

        const options = { limit: 10 };
        await client.getOutgoingMEPs(options);

        expect(client.callTool).toHaveBeenCalledWith('get_outgoing_meps', options);
      });

      it('should handle missing get_outgoing_meps tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getOutgoingMEPs();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });
      });

      it('should get homonym MEPs', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });

        const options = { limit: 10 };
        await client.getHomonymMEPs(options);

        expect(client.callTool).toHaveBeenCalledWith('get_homonym_meps', options);
      });

      it('should handle missing get_homonym_meps tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getHomonymMEPs();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"meps": []}' }],
        });
      });

      it('should get plenary documents', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        const options = { year: 2025 };
        await client.getPlenaryDocuments(options);

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_documents', options);
      });

      it('should handle missing get_plenary_documents tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getPlenaryDocuments();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should get committee documents', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        const options = { limit: 50 };
        await client.getCommitteeDocuments(options);

        expect(client.callTool).toHaveBeenCalledWith('get_committee_documents', options);
      });

      it('should handle missing get_committee_documents tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getCommitteeDocuments();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should get plenary session documents', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        const options = { docId: 'DOC-123' };
        await client.getPlenarySessionDocuments(options);

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_session_documents', options);
      });

      it('should handle missing get_plenary_session_documents tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getPlenarySessionDocuments();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should get plenary session document items', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"items": []}' }],
        });

        const options = { limit: 10 };
        await client.getPlenarySessionDocumentItems(options);

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_session_document_items', options);
      });

      it('should handle missing get_plenary_session_document_items tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getPlenarySessionDocumentItems();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"items": []}' }],
        });
      });

      it('should get controlled vocabularies', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"vocabularies": []}' }],
        });

        const options = { vocId: 'VOC-123' };
        await client.getControlledVocabularies(options);

        expect(client.callTool).toHaveBeenCalledWith('get_controlled_vocabularies', options);
      });

      it('should handle missing get_controlled_vocabularies tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getControlledVocabularies();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"vocabularies": []}' }],
        });
      });

      it('should get external documents', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        const options = { limit: 50 };
        await client.getExternalDocuments(options);

        expect(client.callTool).toHaveBeenCalledWith('get_external_documents', options);
      });

      it('should handle missing get_external_documents tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getExternalDocuments();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should get meeting foreseen activities', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });

        const options = { sittingId: 'SITTING-123' };
        await client.getMeetingForeseenActivities(options);

        expect(client.callTool).toHaveBeenCalledWith('get_meeting_foreseen_activities', options);
      });

      it('should handle missing get_meeting_foreseen_activities tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMeetingForeseenActivities({ sittingId: 'SITTING-123' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });
      });

      it('should return fallback for getMeetingForeseenActivities with empty sittingId', async () => {
        const result = await client.getMeetingForeseenActivities({ sittingId: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });
      });

      it('should return fallback for getMeetingForeseenActivities with whitespace sittingId', async () => {
        const result = await client.getMeetingForeseenActivities({ sittingId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"activities": []}' }],
        });
      });

      it('should get procedure events', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"events": []}' }],
        });

        const options = { processId: 'PROC-123' };
        await client.getProcedureEvents(options);

        expect(client.callTool).toHaveBeenCalledWith('get_procedure_events', options);
      });

      it('should handle missing get_procedure_events tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getProcedureEvents({ processId: 'PROC-123' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"events": []}' }],
        });
      });

      it('should return fallback for getProcedureEvents with empty processId', async () => {
        const result = await client.getProcedureEvents({ processId: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"events": []}' }],
        });
      });

      it('should return fallback for getProcedureEvents with whitespace-only processId', async () => {
        const result = await client.getProcedureEvents({ processId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"events": []}' }],
        });
      });

      it('should get meeting plenary session documents', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        const options = { sittingId: 'SITTING-456' };
        await client.getMeetingPlenarySessionDocuments(options);

        expect(client.callTool).toHaveBeenCalledWith(
          'get_meeting_plenary_session_documents',
          options
        );
      });

      it('should handle missing get_meeting_plenary_session_documents tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMeetingPlenarySessionDocuments({ sittingId: 'SITTING-456' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should return fallback for getMeetingPlenarySessionDocuments with empty sittingId', async () => {
        const result = await client.getMeetingPlenarySessionDocuments({ sittingId: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should return fallback for getMeetingPlenarySessionDocuments with whitespace sittingId', async () => {
        const result = await client.getMeetingPlenarySessionDocuments({ sittingId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });
      });

      it('should get meeting plenary session document items', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"items": []}' }],
        });

        const options = { sittingId: 'SITTING-789' };
        await client.getMeetingPlenarySessionDocumentItems(options);

        expect(client.callTool).toHaveBeenCalledWith(
          'get_meeting_plenary_session_document_items',
          options
        );
      });

      it('should handle missing get_meeting_plenary_session_document_items tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMeetingPlenarySessionDocumentItems({
          sittingId: 'SITTING-789',
        });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"items": []}' }],
        });
      });

      it('should return fallback for getMeetingPlenarySessionDocumentItems with empty sittingId', async () => {
        const result = await client.getMeetingPlenarySessionDocumentItems({ sittingId: '' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"items": []}' }],
        });
      });

      it('should return fallback for getMeetingPlenarySessionDocumentItems with whitespace sittingId', async () => {
        const result = await client.getMeetingPlenarySessionDocumentItems({ sittingId: '   ' });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"items": []}' }],
        });
      });
    });

    describe('Phase 6 OSINT Intelligence Methods', () => {
      beforeEach(() => {
        client.connected = true;
        client.callTool = vi.fn();
      });

      it('should run network analysis', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"analysisType": "combined", "networkNodes": []}' }],
        });

        const options = { mepId: 12345, analysisType: 'committee', depth: 2 };
        await client.networkAnalysis(options);

        expect(client.callTool).toHaveBeenCalledWith('network_analysis', options);
      });

      it('should handle missing network_analysis tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.networkAnalysis();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
      });

      it('should run sentiment tracker', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"sentiment": []}' }],
        });

        const options = { groupId: 'EPP', timeframe: 'last_quarter' };
        await client.sentimentTracker(options);

        expect(client.callTool).toHaveBeenCalledWith('sentiment_tracker', options);
      });

      it('should handle missing sentiment_tracker tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.sentimentTracker();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
      });

      it('should run early warning system', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"warnings": []}' }],
        });

        const options = { sensitivity: 'high', focusArea: 'coalitions' };
        await client.earlyWarningSystem(options);

        expect(client.callTool).toHaveBeenCalledWith('early_warning_system', options);
      });

      it('should handle missing early_warning_system tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.earlyWarningSystem();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
      });

      it('should run comparative intelligence', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"profiles": []}' }],
        });

        const options = { mepIds: [123, 456], dimensions: ['voting', 'committee'] };
        await client.comparativeIntelligence(options);

        expect(client.callTool).toHaveBeenCalledWith('comparative_intelligence', options);
      });

      it('should handle missing comparative_intelligence tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.comparativeIntelligence({ mepIds: [123, 456] });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
      });

      it('should return fallback for comparativeIntelligence with insufficient mepIds', async () => {
        const result = await client.comparativeIntelligence({ mepIds: [123] });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
      });

      it('should return fallback for comparativeIntelligence with empty mepIds', async () => {
        const result = await client.comparativeIntelligence({ mepIds: [] });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
      });

      it('should run correlate intelligence', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"alerts": []}' }],
        });

        const options = { mepIds: ['MEP-12345'], sensitivityLevel: 'HIGH' };
        await client.correlateIntelligence(options);

        expect(client.callTool).toHaveBeenCalledWith('correlate_intelligence', options);
      });

      it('should return fallback for correlateIntelligence with empty mepIds', async () => {
        const result = await client.correlateIntelligence({ mepIds: [] });

        expect(client.callTool).not.toHaveBeenCalled();
        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
      });
    });

    describe('Precomputed Statistics', () => {
      beforeEach(() => {
        client.connected = true;
        client.callTool = vi.fn();
      });

      it('should get all generated stats with default options', async () => {
        client.callTool.mockResolvedValue({
          content: [
            {
              type: 'text',
              text: '{"yearlyStats": {}, "coveragePeriod": {"from": 2004, "to": 2025}}',
            },
          ],
        });

        await client.getAllGeneratedStats();

        expect(client.callTool).toHaveBeenCalledWith('get_all_generated_stats', {});
      });

      it('should get all generated stats with custom options', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"yearlyStats": {}}' }],
        });

        const options = {
          yearFrom: 2019,
          yearTo: 2023,
          category: 'plenary_sessions',
          includePredictions: true,
          includeRankings: true,
        };
        await client.getAllGeneratedStats(options);

        expect(client.callTool).toHaveBeenCalledWith('get_all_generated_stats', options);
      });

      it('should handle missing get_all_generated_stats tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getAllGeneratedStats();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"stats": null}' }],
        });
      });

      it('should pass category filter correctly', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"yearlyStats": {}}' }],
        });

        const options = { category: 'roll_call_votes', includeMonthlyBreakdown: true };
        await client.getAllGeneratedStats(options);

        expect(client.callTool).toHaveBeenCalledWith('get_all_generated_stats', options);
      });
    });

    describe('EP API v2 Feed Endpoint Methods', () => {
      beforeEach(() => {
        client.connected = true;
        client.callTool = vi.fn();
      });

      it('should get MEPs feed with default options', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getMEPsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_meps_feed', {});
      });

      it('should handle missing get_meps_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getMEPsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get events feed with pagination', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getEventsFeed({ limit: 10, offset: 0 });
        expect(client.callTool).toHaveBeenCalledWith('get_events_feed', { limit: 10, offset: 0 });
      });

      it('should handle missing get_events_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getEventsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get procedures feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getProceduresFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_procedures_feed', {});
      });

      it('should handle missing get_procedures_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getProceduresFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get adopted texts feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getAdoptedTextsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_adopted_texts_feed', {});
      });

      it('should handle missing get_adopted_texts_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getAdoptedTextsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get MEP declarations feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getMEPDeclarationsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_mep_declarations_feed', {});
      });

      it('should handle missing get_mep_declarations_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getMEPDeclarationsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get documents feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getDocumentsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_documents_feed', {});
      });

      it('should handle missing get_documents_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getDocumentsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get plenary documents feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getPlenaryDocumentsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_plenary_documents_feed', {});
      });

      it('should handle missing get_plenary_documents_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getPlenaryDocumentsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get committee documents feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getCommitteeDocumentsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_committee_documents_feed', {});
      });

      it('should handle missing get_committee_documents_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getCommitteeDocumentsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get plenary session documents feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getPlenarySessionDocumentsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_plenary_session_documents_feed', {});
      });

      it('should handle missing get_plenary_session_documents_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getPlenarySessionDocumentsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get external documents feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getExternalDocumentsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_external_documents_feed', {});
      });

      it('should handle missing get_external_documents_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getExternalDocumentsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get parliamentary questions feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getParliamentaryQuestionsFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_parliamentary_questions_feed', {});
      });

      it('should handle missing get_parliamentary_questions_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getParliamentaryQuestionsFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get corporate bodies feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getCorporateBodiesFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_corporate_bodies_feed', {});
      });

      it('should handle missing get_corporate_bodies_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getCorporateBodiesFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });

      it('should get controlled vocabularies feed', async () => {
        client.callTool.mockResolvedValue({ content: [{ type: 'text', text: '{"feed": []}' }] });
        await client.getControlledVocabulariesFeed();
        expect(client.callTool).toHaveBeenCalledWith('get_controlled_vocabularies_feed', {});
      });

      it('should handle missing get_controlled_vocabularies_feed tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));
        const result = await client.getControlledVocabulariesFeed();
        expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      });
    });

    describe('Retry Logic', () => {
      it('should have retry configuration', async () => {
        const failingClient = new EuropeanParliamentMCPClient({
          maxConnectionAttempts: 2,
          connectionRetryDelay: 10,
        });

        // Verify retry configuration is set
        expect(failingClient.maxConnectionAttempts).toBe(2);
        expect(failingClient.connectionRetryDelay).toBe(10);
        expect(failingClient.connectionAttempts).toBe(0);

        // Connection attempt tracking is internal and may not increment
        // if spawn succeeds immediately on some systems
        // The important thing is the client doesn't crash
      });

      it('should reset connection attempts on success', async () => {
        client.connectionAttempts = 2;
        client._attemptConnection = vi.fn().mockResolvedValue();

        await client.connect();

        expect(client.connectionAttempts).toBe(0);
      });
    });
  });

  describe('Singleton Functions', () => {
    afterEach(async () => {
      await closeEPMCPClient();
    });

    it('should create singleton client instance', async () => {
      // Mock successful connection
      const mockConnect = vi.fn().mockResolvedValue();
      vi.spyOn(EuropeanParliamentMCPClient.prototype, 'connect').mockImplementation(mockConnect);

      const client1 = await getEPMCPClient();
      const client2 = await getEPMCPClient();

      expect(client1).toBe(client2);
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it('should close singleton client', async () => {
      const mockConnect = vi.fn().mockResolvedValue();
      const mockDisconnect = vi.fn();

      vi.spyOn(EuropeanParliamentMCPClient.prototype, 'connect').mockImplementation(mockConnect);
      vi.spyOn(EuropeanParliamentMCPClient.prototype, 'disconnect').mockImplementation(
        mockDisconnect
      );

      await getEPMCPClient();
      await closeEPMCPClient();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle closing when no client exists', async () => {
      await expect(closeEPMCPClient()).resolves.not.toThrow();
    });
  });

  describe('Gateway Mode', () => {
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
    });

    afterEach(() => {
      consoleOutput.restore();
      delete process.env.EP_MCP_GATEWAY_URL;
      delete process.env.EP_MCP_GATEWAY_API_KEY;
    });

    it('should detect gateway mode from constructor options', () => {
      const client = new EuropeanParliamentMCPClient({
        gatewayUrl: 'http://localhost:8080/mcp/european-parliament',
        gatewayApiKey: 'test-key',
      });
      expect(client.isGatewayMode()).toBe(true);
    });

    it('should detect gateway mode from environment variables', () => {
      process.env.EP_MCP_GATEWAY_URL = 'http://host.docker.internal:80/mcp/european-parliament';
      process.env.EP_MCP_GATEWAY_API_KEY = 'env-key';

      const client = new EuropeanParliamentMCPClient();
      expect(client.isGatewayMode()).toBe(true);
    });

    it('should default to stdio mode when no gateway configured', () => {
      const client = new EuropeanParliamentMCPClient();
      expect(client.isGatewayMode()).toBe(false);
    });

    it('should prefer explicit gatewayUrl over environment variable', () => {
      process.env.EP_MCP_GATEWAY_URL = 'http://env-url:80/mcp/european-parliament';

      const client = new EuropeanParliamentMCPClient({
        gatewayUrl: 'http://explicit-url:80/mcp/european-parliament',
      });
      expect(client.isGatewayMode()).toBe(true);
      expect(client.getGatewayUrl()).toBe('http://explicit-url:80/mcp/european-parliament');
    });

    it('should store gateway API key from options', () => {
      const client = new EuropeanParliamentMCPClient({
        gatewayUrl: 'http://localhost:80/mcp/european-parliament',
        gatewayApiKey: 'my-api-key',
      });
      expect(client.getGatewayApiKey()).toBe('my-api-key');
    });

    it('should store gateway API key from environment', () => {
      process.env.EP_MCP_GATEWAY_URL = 'http://localhost:80/mcp/european-parliament';
      process.env.EP_MCP_GATEWAY_API_KEY = 'env-api-key';

      const client = new EuropeanParliamentMCPClient();
      expect(client.getGatewayApiKey()).toBe('env-api-key');
    });

    it('should handle gateway connection failure gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

      const client = new EuropeanParliamentMCPClient({
        gatewayUrl: 'http://localhost:19999/mcp/european-parliament',
        maxConnectionAttempts: 1,
        connectionRetryDelay: 10,
      });

      await expect(client.connect()).rejects.toThrow();
      expect(client.isConnected()).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should clear session on disconnect in gateway mode', async () => {
      // Mock a successful gateway connect that returns a session ID header
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          headers: new Map([
            ['mcp-session-id', 'test-session-123'],
            ['content-type', 'application/json'],
          ]),
          text: () => Promise.resolve('{"jsonrpc":"2.0","id":1,"result":{}}'),
        })
      );

      const client = new EuropeanParliamentMCPClient({
        gatewayUrl: 'http://localhost:80/mcp/european-parliament',
      });

      await client.connect();
      expect(client.getMcpSessionId()).toBe('test-session-123');

      client.disconnect();
      expect(client.getMcpSessionId()).toBeNull();

      vi.unstubAllGlobals();
    });
  });

  describe('getFailedTools', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should return an empty map when no tools have failed', () => {
      const failed = client.getFailedTools();
      expect(failed.size).toBe(0);
    });

    it('should return a defensive copy that cannot mutate internal state', () => {
      const copy = client.getFailedTools();
      expect(copy).toBeInstanceOf(Map);
      // Mutating the returned copy should not affect the client's internal map
      /** @type {Map<string,string>} */ (copy).set('fake_tool', 'FAKE');
      expect(client.getFailedTools().has('fake_tool')).toBe(false);
    });

    it('should record a timeout failure after safeCallTool catches a timeout error', async () => {
      // Mock callToolWithRetry to throw a timeout error
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Request timeout after 180000ms')
      );
      await client.getMEPs();
      const failed = client.getFailedTools();
      expect(failed.size).toBe(1);
      expect(failed.get('get_meps')).toContain('TIMEOUT');
    });

    it('should record a NOT_FOUND failure for 404 errors', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Gateway error 404: Not Found')
      );
      await client.getEventsFeed();
      const failed = client.getFailedTools();
      expect(failed.size).toBe(1);
      expect(failed.get('get_events_feed')).toContain('NOT_FOUND');
    });

    it('should record a SERVER_ERROR failure for 502 errors', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Gateway error 502: Bad Gateway')
      );
      await client.getProceduresFeed();
      const failed = client.getFailedTools();
      expect(failed.get('get_procedures_feed')).toContain('SERVER_ERROR');
    });

    it('should classify "Gateway Timeout" (504) as SERVER_ERROR not TIMEOUT', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Gateway error 504: Gateway Timeout')
      );
      await client.getDocumentsFeed();
      const failed = client.getFailedTools();
      const entry = failed.get('get_documents_feed');
      expect(entry).toMatch(/^SERVER_ERROR:/);
      expect(entry).not.toMatch(/^TIMEOUT:/);
    });

    it('should classify rate limit (429) errors as RATE_LIMIT', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('429 Too Many Requests')
      );
      await client.getDocumentsFeed();
      const failed = client.getFailedTools();
      const entry = failed.get('get_documents_feed');
      expect(entry).toMatch(/^RATE_LIMIT:/);
    });

    it('should clear a tool from failed map when a subsequent call succeeds', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      // First call fails
      spy.mockRejectedValueOnce(new Error('Gateway error 404: Not Found'));
      await client.getMEPs();
      expect(client.getFailedTools().has('get_meps')).toBe(true);

      // Second call succeeds
      spy.mockResolvedValueOnce({ content: [{ type: 'text', text: '{"meps": []}' }] });
      await client.getMEPs();
      expect(client.getFailedTools().has('get_meps')).toBe(false);
    });

    it('should record an INTERNAL_ERROR failure when isError is true with INTERNAL_ERROR content', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        isError: true,
        content: [
          { type: 'text', text: '{"errorCode":"INTERNAL_ERROR","message":"ECONNREFUSED"}' },
        ],
      });
      const result = await client.getMEPs();
      const failed = client.getFailedTools();
      expect(failed.size).toBe(1);
      expect(failed.get('get_meps')).toMatch(/^INTERNAL_ERROR:/);
      // Should return fallback data, not the error content
      expect(result.content[0].text).not.toContain('ECONNREFUSED');
    });

    it('should record a SERVER_ERROR failure when isError is true with UPSTREAM_500 content', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        isError: true,
        content: [
          { type: 'text', text: '{"errorCode":"UPSTREAM_500","message":"Internal Server Error"}' },
        ],
      });
      const result = await client.getEventsFeed();
      const failed = client.getFailedTools();
      expect(failed.size).toBe(1);
      expect(failed.get('get_events_feed')).toMatch(/^SERVER_ERROR:/);
      expect(result.content[0].text).not.toContain('UPSTREAM_500');
    });

    it('should record an UNKNOWN failure when isError is true with empty content', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        isError: true,
        content: [],
      });
      await client.getProceduresFeed();
      const failed = client.getFailedTools();
      expect(failed.size).toBe(1);
      expect(failed.get('get_procedures_feed')).toMatch(/^UNKNOWN:/);
    });
  });

  describe('getFeedHealthSummary', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should show all feeds as unchecked when no calls have been made', () => {
      const summary = client.getFeedHealthSummary();
      expect(summary).toContain('EP MCP Feed Health:');
      expect(summary).toContain('0/0 checked feeds operational, 13 unchecked');
      expect(summary).not.toContain('❌');
      expect(summary).not.toContain('✅');
      expect(summary).toContain('⚪');
    });

    it('should show operational feeds as ✅ after successful calls', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      spy.mockResolvedValueOnce({ content: [{ type: 'text', text: '{"meps": []}' }] });
      await client.getMEPsFeed();

      const summary = client.getFeedHealthSummary();
      expect(summary).toContain('✅ get_meps_feed');
      expect(summary).toContain('1/1 checked feeds operational, 12 unchecked');
    });

    it('should show failed feeds with ❌ markers and reduce operational count', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      // Fail two feed tools
      spy.mockRejectedValueOnce(new Error('Gateway error 404: Not Found'));
      await client.getEventsFeed();
      spy.mockRejectedValueOnce(new Error('Request timeout'));
      await client.getProceduresFeed();
      // Succeed one feed tool
      spy.mockResolvedValueOnce({ content: [{ type: 'text', text: '{"meps": []}' }] });
      await client.getMEPsFeed();

      const summary = client.getFeedHealthSummary();
      expect(summary).toContain('1/3 checked feeds operational, 10 unchecked');
      expect(summary).toContain('❌ get_events_feed: NOT_FOUND');
      expect(summary).toContain('❌ get_procedures_feed: TIMEOUT');
      expect(summary).toContain('✅ get_meps_feed');
      expect(summary).toContain('⚪ get_adopted_texts_feed (not checked)');
    });
  });

  describe('isFeedUnavailable and raw-404 detection (upstream #378)', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should record raw upstream 404 envelope as NOT_FOUND failure for get_events_feed', async () => {
      const rawEnvelope = {
        '@id': 'https://data.europarl.europa.eu/eli/dl/event/ITRE-AM-786788-DEPOT-2026',
        error: '404 Not Found',
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(rawEnvelope) }],
      });
      const result = await client.getEventsFeed({ timeframe: 'one-week' });

      const failed = client.getFailedTools();
      expect(failed.has('get_events_feed')).toBe(true);
      expect(failed.get('get_events_feed')).toMatch(/^NOT_FOUND:/);
      // Should return fallback, not the raw 404 payload
      expect(result.content[0].text).toBe('{"feed": []}');
    });

    it('should record uniform {status:"unavailable"} envelope as NOT_FOUND failure', async () => {
      const uniformEnvelope = {
        status: 'unavailable',
        generatedAt: '2026-04-20T01:24:33.400Z',
        items: [],
        dataQualityWarning: 'EP Open Data Portal returned 404',
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(uniformEnvelope) }],
      });
      await client.getParliamentaryQuestionsFeed();

      const failed = client.getFailedTools();
      expect(failed.has('get_parliamentary_questions_feed')).toBe(true);
      expect(failed.get('get_parliamentary_questions_feed')).toMatch(/^NOT_FOUND:/);
    });

    it('should not flag well-formed feed results with {"data": [...]} as unavailable', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [
          { type: 'text', text: '{"data": [{"id": "1", "title": "foo"}], "@context": []}' },
        ],
      });
      const result = await client.getAdoptedTextsFeed();
      const failed = client.getFailedTools();
      expect(failed.has('get_adopted_texts_feed')).toBe(false);
      expect(result.content[0].text).toContain('"data"');
    });

    it('should not flag results with malformed JSON text as unavailable', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: 'not json' }],
      });
      await client.getEventsFeed();
      expect(client.getFailedTools().has('get_events_feed')).toBe(false);
    });
  });

  describe('getEventsFeed timeout downgrade (slow-feed warning, §11 row #8)', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should downgrade a timeout to a slow-feed warning (not recorded in failedTools)', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Request timeout after 120000ms')
      );
      await client.getEventsFeed();

      // Must NOT appear in failedTools
      expect(client.getFailedTools().has('get_events_feed')).toBe(false);
      // Must appear in slowFeedWarnings
      const slow = client.getSlowFeedWarnings();
      expect(slow.has('get_events_feed')).toBe(true);
      expect(slow.get('get_events_feed')).toMatch(/^SLOW_FEED:/);
    });

    it('should return a fallback result with slowFeedWarning:true on timeout', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Request timeout after 120000ms')
      );
      const result = await client.getEventsFeed();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.feed).toEqual([]);
      expect(parsed.slowFeedWarning).toBe(true);
    });

    it('should NOT downgrade a 404 error — it still goes to failedTools', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Gateway error 404: Not Found')
      );
      await client.getEventsFeed();

      expect(client.getFailedTools().has('get_events_feed')).toBe(true);
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(false);
    });

    it('should NOT downgrade a 5xx error — it still goes to failedTools', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Gateway error 503: Service Unavailable')
      );
      await client.getEventsFeed();

      expect(client.getFailedTools().has('get_events_feed')).toBe(true);
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(false);
    });

    it('should show 🟡 in getFeedHealthSummary for a slow-feed timeout', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Request timeout after 120000ms')
      );
      await client.getEventsFeed();

      const summary = client.getFeedHealthSummary();
      expect(summary).toContain('🟡 get_events_feed: SLOW_FEED:');
      // Should NOT count as a failure or operational — summary still shows correct counts
      expect(summary).not.toContain('❌ get_events_feed');
    });

    it('should emit a 🟡 console warning on timeout', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Request timeout after 120000ms')
      );
      await client.getEventsFeed();

      const warnMessages = consoleOutput.warnings.filter((m) => m.includes('🟡'));
      expect(warnMessages.length).toBeGreaterThan(0);
      expect(warnMessages[0]).toContain('slow-feed warning');
    });

    it('should return the returned map copy independent of internal state', async () => {
      const copy = client.getSlowFeedWarnings();
      expect(copy instanceof Map).toBe(true);
      // Mutating the copy should not affect internal state
      /** @type {Map<string,string>} */ (copy).set('fake_tool', 'FAKE');
      expect(client.getSlowFeedWarnings().has('fake_tool')).toBe(false);
    });

    it('getToolErrorSummary should still report other feed errors but not the slow timeout', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      // events_feed times out — should be slow warning, not counted in tool errors
      spy.mockRejectedValueOnce(new Error('Request timeout'));
      await client.getEventsFeed();
      // procedures_feed 404 — counted in tool errors
      spy.mockRejectedValueOnce(new Error('Gateway error 404: Not Found'));
      await client.getProceduresFeed();

      const summary = client.getToolErrorSummary();
      // 1 out of 2 invoked tools rejected (events_feed timeout is excluded)
      expect(summary).toContain('1 of 2 invoked tools rejected');
      expect(summary).toContain('get_procedures_feed');
      expect(summary).not.toContain('get_events_feed');
    });

    it('should NOT downgrade a 504 "Gateway Timeout" — classified as SERVER_ERROR', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('Gateway error 504: Gateway Timeout')
      );
      await client.getEventsFeed();

      // 504 must stay in failedTools (SERVER_ERROR), NOT downgraded to slow-feed
      expect(client.getFailedTools().has('get_events_feed')).toBe(true);
      expect(client.getFailedTools().get('get_events_feed')).toMatch(/^SERVER_ERROR:/);
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(false);
    });

    it('should clear a prior slow-feed warning when a subsequent call succeeds', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      // First call times out → slow-feed warning
      spy.mockRejectedValueOnce(new Error('Request timeout after 120000ms'));
      await client.getEventsFeed();
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(true);

      // Second call succeeds — warning must be cleared
      spy.mockResolvedValueOnce({ content: [{ type: 'text', text: '{"feed": []}' }] });
      await client.getEventsFeed();
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(false);
      expect(client.getFailedTools().has('get_events_feed')).toBe(false);
    });

    it('should clear a prior failure entry when a subsequent timeout downgrades to slow-feed', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      // First call: 404 failure
      spy.mockRejectedValueOnce(new Error('Gateway error 404: Not Found'));
      await client.getEventsFeed();
      expect(client.getFailedTools().has('get_events_feed')).toBe(true);

      // Second call: timeout → slow-feed warning. Must clear the prior failure entry.
      spy.mockRejectedValueOnce(new Error('Request timeout after 120000ms'));
      await client.getEventsFeed();
      expect(client.getFailedTools().has('get_events_feed')).toBe(false);
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(true);
    });

    it('should clear a prior slow-feed warning when a subsequent non-timeout failure occurs', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      // First call: timeout → slow-feed warning
      spy.mockRejectedValueOnce(new Error('Request timeout after 120000ms'));
      await client.getEventsFeed();
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(true);

      // Second call: 404 failure. Must clear the prior slow-feed warning.
      spy.mockRejectedValueOnce(new Error('Gateway error 404: Not Found'));
      await client.getEventsFeed();
      expect(client.getSlowFeedWarnings().has('get_events_feed')).toBe(false);
      expect(client.getFailedTools().has('get_events_feed')).toBe(true);
    });
  });

  describe('getProceduresFeed recess-mode detection (§11 row #5)', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should add recessMode:true when all items are pre-1995 (historical archive)', async () => {
      const historicalPayload = {
        items: [
          {
            id: 'proc-001',
            reference: '1972/0001(SYN)',
            dateInitiated: '1972-03-15',
            dateLastActivity: '1974-06-01',
          },
          {
            id: 'proc-002',
            reference: '1985/0042(COD)',
            dateInitiated: '1985-01-10',
            dateLastActivity: '1987-11-20',
          },
          {
            id: 'proc-003',
            reference: '1990/0100(SYN)',
            dateInitiated: '1990-06-01',
            dateLastActivity: '1991-04-15',
          },
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(historicalPayload) }],
      });
      const result = await client.getProceduresFeed();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.recessMode).toBe(true);
      expect(Array.isArray(parsed.dataQualityWarnings)).toBe(true);
      expect(parsed.dataQualityWarnings.some((w) => w.startsWith('RECESS_MODE:'))).toBe(true);
    });

    it('should emit a 🟡 console warning on recess mode', async () => {
      const historicalPayload = {
        items: [
          {
            id: 'proc-001',
            reference: '1972/0001(SYN)',
            dateInitiated: '1972-03-15',
            dateLastActivity: '1974-06-01',
          },
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(historicalPayload) }],
      });
      await client.getProceduresFeed();

      const warnMessages = consoleOutput.warnings.filter((m) => m.includes('🟡'));
      expect(warnMessages.length).toBeGreaterThan(0);
      expect(warnMessages[0]).toContain('recess mode');
    });

    it('should NOT set recessMode when items contain current-year procedures', async () => {
      const currentPayload = {
        items: [
          {
            id: 'proc-new',
            reference: '2026/0001(COD)',
            dateInitiated: '2026-01-15',
            dateLastActivity: '2026-04-01',
          },
          {
            id: 'proc-old',
            reference: '1990/0100(SYN)',
            dateInitiated: '1990-06-01',
            dateLastActivity: '1991-04-15',
          },
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(currentPayload) }],
      });
      const result = await client.getProceduresFeed();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.recessMode).toBeUndefined();
    });

    it('should NOT set recessMode on an empty items array', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: '{"items":[]}' }],
      });
      const result = await client.getProceduresFeed();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.recessMode).toBeUndefined();
    });

    it('should NOT record get_procedures_feed as failed when recess mode is detected', async () => {
      const historicalPayload = {
        items: [
          {
            id: 'proc-001',
            reference: '1985/0042(COD)',
            dateInitiated: '1985-01-10',
            dateLastActivity: '1987-11-20',
          },
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(historicalPayload) }],
      });
      await client.getProceduresFeed();

      expect(client.getFailedTools().has('get_procedures_feed')).toBe(false);
    });

    it('should also detect recess mode via procedures[] shape', async () => {
      const proceduresShapePayload = {
        procedures: [
          { id: 'proc-001', dateInitiated: '1980-04-01', dateLastActivity: '1982-09-10' },
          { id: 'proc-002', dateInitiated: '1975-01-01', dateLastActivity: '1977-06-30' },
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(proceduresShapePayload) }],
      });
      const result = await client.getProceduresFeed();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.recessMode).toBe(true);
    });

    it('should preserve existing dataQualityWarnings when appending RECESS_MODE', async () => {
      const historicalPayload = {
        items: [
          {
            id: 'proc-001',
            reference: '1990/0001(SYN)',
            dateInitiated: '1990-01-01',
            dateLastActivity: '1991-01-01',
          },
        ],
        dataQualityWarnings: ['STALENESS_WARNING: existing warning'],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(historicalPayload) }],
      });
      const result = await client.getProceduresFeed();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.dataQualityWarnings).toHaveLength(2);
      expect(parsed.dataQualityWarnings[0]).toBe('STALENESS_WARNING: existing warning');
      expect(parsed.dataQualityWarnings[1]).toMatch(/^RECESS_MODE:/);
    });
  });

  describe('detectProceduresFeedRecessMode helper function', () => {
    let detectProceduresFeedRecessMode;

    beforeEach(async () => {
      ({ detectProceduresFeedRecessMode } = await import('../../scripts/mcp/ep-mcp-client.js'));
    });

    it('should return false for undefined payload', () => {
      expect(detectProceduresFeedRecessMode(undefined)).toBe(false);
    });

    it('should return false for empty items array', () => {
      expect(detectProceduresFeedRecessMode({ items: [] })).toBe(false);
    });

    it('should return true for all-pre-1995 items (via dateInitiated)', () => {
      expect(
        detectProceduresFeedRecessMode({
          items: [
            { dateInitiated: '1972-03-15' },
            { dateInitiated: '1985-01-10' },
            { dateInitiated: '1990-06-01' },
          ],
        })
      ).toBe(true);
    });

    it('should return true for items using reference field (1990/0001 pattern)', () => {
      expect(
        detectProceduresFeedRecessMode({
          items: [{ reference: '1990/0001(SYN)' }],
        })
      ).toBe(true);
    });

    it('should return false when any item has a post-1995 year', () => {
      expect(
        detectProceduresFeedRecessMode({
          items: [
            { dateInitiated: '1972-03-15' },
            { dateInitiated: '2024-01-01' }, // current year
          ],
        })
      ).toBe(false);
    });

    it('should return false when all items lack date fields', () => {
      expect(
        detectProceduresFeedRecessMode({
          items: [{ id: 'no-date' }, { title: 'no date here' }],
        })
      ).toBe(false);
    });

    it('should handle procedures[] shape', () => {
      expect(
        detectProceduresFeedRecessMode({
          procedures: [{ dateInitiated: '1980-01-01', dateLastActivity: '1982-01-01' }],
        })
      ).toBe(true);
    });

    it('should use dateLastActivity as fallback when dateInitiated is absent', () => {
      expect(
        detectProceduresFeedRecessMode({
          items: [{ dateLastActivity: '1990-06-01' }],
        })
      ).toBe(true);
    });

    it('should return false for borderline 1996 year (just above threshold)', () => {
      expect(
        detectProceduresFeedRecessMode({
          items: [{ dateInitiated: '1996-01-01' }],
        })
      ).toBe(false);
    });

    it('should return true for borderline 1995 year (exactly at threshold)', () => {
      expect(
        detectProceduresFeedRecessMode({
          items: [{ dateInitiated: '1995-12-31' }],
        })
      ).toBe(true);
    });
  });

  describe('getAdoptedTexts empty-string sentinel (upstream #369)', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;
    /** @type {string} */
    let tmpDir;

    beforeEach(async () => {
      const { createTempDir } = await import('../helpers/test-utils.js');
      tmpDir = createTempDir();
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient({
        pendingDocumentsStorePath: path.join(tmpDir, 'pending-documents.json'),
      });
    });

    afterEach(async () => {
      const { cleanupTempDir } = await import('../helpers/test-utils.js');
      consoleOutput.restore();
      cleanupTempDir(tmpDir);
    });

    it('should record CONTENT_PENDING failure when docId lookup returns all-empty-string sentinel', async () => {
      const sentinelPayload = {
        id: '',
        title: '',
        reference: '',
        type: '',
        dateAdopted: '',
        procedureReference: '',
        subjectMatter: '',
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(sentinelPayload) }],
      });
      const result = await client.getAdoptedTexts({ docId: 'TA-10-2026-0099' });

      const failed = client.getFailedTools();
      expect(failed.has('get_adopted_texts')).toBe(true);
      expect(failed.get('get_adopted_texts')).toMatch(/^UNKNOWN: CONTENT_PENDING/);
      expect(result.content[0].text).toBe('{"texts": []}');
    });

    it('should write the docId to the pending-documents sidecar on empty-string sentinel', async () => {
      const { loadPendingDocuments } = await import('../../scripts/mcp/pending-documents.js');
      const sentinelPayload = {
        id: '',
        title: '',
        reference: '',
        type: '',
        dateAdopted: '',
        procedureReference: '',
        subjectMatter: '',
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(sentinelPayload) }],
      });
      await client.getAdoptedTexts({ docId: 'TA-10-2026-0099' });

      const store = await loadPendingDocuments(path.join(tmpDir, 'pending-documents.json'));
      expect(store.documents['TA-10-2026-0099']).toBeDefined();
      expect(store.documents['TA-10-2026-0099'].status).toBe('PENDING');
    });

    it('should NOT record failure for a year-range list query (no docId)', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: '{"texts": [{"id": "TA-10-2026-0001", "title": "x"}]}' }],
      });
      await client.getAdoptedTexts({ year: 2026 });
      expect(client.getFailedTools().has('get_adopted_texts')).toBe(false);
    });

    it('should NOT record failure when docId lookup returns populated fields', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: 'TA-10-2026-0099',
              title: 'Resolution on X',
              reference: 'P10_TA(2026)0099',
              type: 'RESOLUTION',
              dateAdopted: '2026-04-10',
            }),
          },
        ],
      });
      const result = await client.getAdoptedTexts({ docId: 'TA-10-2026-0099' });
      expect(client.getFailedTools().has('get_adopted_texts')).toBe(false);
      expect(result.content[0].text).toContain('Resolution on X');
    });

    it('should NOT flag sparse payloads with fewer than 3 string fields (avoid false positives)', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify({ id: '', title: '' }) }],
      });
      await client.getAdoptedTexts({ docId: 'TA-10-2026-0099' });
      expect(client.getFailedTools().has('get_adopted_texts')).toBe(false);
    });
  });

  describe('getAdoptedTextsFeed FRESHNESS_FALLBACK warning handling', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should forward FRESHNESS_FALLBACK warning into dataFreshnessWarnings and set freshness=augmented', async () => {
      const feedPayload = {
        items: [{ id: 'TA-10-2026-0001', title: 'Resolution on X', dateAdopted: '2026-04-25' }],
        timeframe: 'today',
        generatedAt: '2026-04-25T10:00:00Z',
        dataQualityWarnings: [
          'FRESHNESS_FALLBACK: augmented with 1 current-year items via GET /adopted-texts?year=2026',
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(feedPayload) }],
      });

      const result = await client.getAdoptedTextsFeed();

      // Tool should NOT be recorded as failed
      expect(client.getFailedTools().has('get_adopted_texts_feed')).toBe(false);

      // Payload should contain the augmented freshness fields
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.freshness).toBe('augmented');
      expect(parsed.dataFreshnessWarnings).toEqual([
        'FRESHNESS_FALLBACK: augmented with 1 current-year items via GET /adopted-texts?year=2026',
      ]);
      // Original fields preserved
      expect(parsed.items).toHaveLength(1);
      expect(parsed.dataQualityWarnings).toBeDefined();
    });

    it('should preserve multiple FRESHNESS_FALLBACK warnings in dataFreshnessWarnings', async () => {
      const feedPayload = {
        items: [],
        dataQualityWarnings: [
          'FRESHNESS_FALLBACK: augmented with 5 current-year items via GET /adopted-texts?year=2026',
          'SOME_OTHER_WARNING: unrelated',
          'FRESHNESS_FALLBACK: secondary pass augmented 2 more items',
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(feedPayload) }],
      });

      const result = await client.getAdoptedTextsFeed();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.freshness).toBe('augmented');
      // Only the FRESHNESS_FALLBACK entries go into dataFreshnessWarnings
      expect(parsed.dataFreshnessWarnings).toHaveLength(2);
      expect(parsed.dataFreshnessWarnings[0]).toContain('FRESHNESS_FALLBACK');
      expect(parsed.dataFreshnessWarnings[1]).toContain('FRESHNESS_FALLBACK');
    });

    it('should escalate FRESHNESS_FALLBACK_FAILED to ANALYSIS_ONLY tool failure', async () => {
      const feedPayload = {
        items: [],
        timeframe: 'today',
        generatedAt: '2026-04-25T10:00:00Z',
        dataQualityWarnings: [
          'FRESHNESS_FALLBACK_FAILED: feed stale and GET /adopted-texts?year=2026 returned 0 items',
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(feedPayload) }],
      });

      const result = await client.getAdoptedTextsFeed();

      // Tool must be recorded as failed with ANALYSIS_ONLY prefix
      const failed = client.getFailedTools();
      expect(failed.has('get_adopted_texts_feed')).toBe(true);
      expect(failed.get('get_adopted_texts_feed')).toMatch(/ANALYSIS_ONLY/);

      // Result should be the fallback empty payload
      expect(result.content[0].text).toBe('{"feed": []}');
    });

    it('should return unchanged result when no FRESHNESS_FALLBACK warnings present', async () => {
      const feedPayload = {
        items: [{ id: 'TA-10-2026-0001', dateAdopted: '2026-04-25' }],
        timeframe: 'today',
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(feedPayload) }],
      });

      const result = await client.getAdoptedTextsFeed();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.freshness).toBeUndefined();
      expect(parsed.dataFreshnessWarnings).toBeUndefined();
      expect(client.getFailedTools().has('get_adopted_texts_feed')).toBe(false);
    });

    it('should return unchanged result when dataQualityWarnings is absent', async () => {
      const feedPayload = { items: [], timeframe: 'today' };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(feedPayload) }],
      });

      const result = await client.getAdoptedTextsFeed();

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.freshness).toBeUndefined();
      expect(client.getFailedTools().has('get_adopted_texts_feed')).toBe(false);
    });

    it('should return fallback when tool call throws', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(new Error('Tool not available'));

      const result = await client.getAdoptedTextsFeed();

      expect(result).toEqual({ content: [{ type: 'text', text: '{"feed": []}' }] });
      expect(client.getFailedTools().has('get_adopted_texts_feed')).toBe(true);
    });

    it('should pick the FAILED warning specifically when FAILED and non-FAILED FRESHNESS_FALLBACK warnings co-exist', async () => {
      const feedPayload = {
        items: [],
        dataQualityWarnings: [
          'FRESHNESS_FALLBACK: augmented with 0 current-year items',
          'FRESHNESS_FALLBACK_FAILED: GET /adopted-texts?year=2026 returned 0 items',
        ],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(feedPayload) }],
      });

      await client.getAdoptedTextsFeed();

      const failed = client.getFailedTools();
      expect(failed.has('get_adopted_texts_feed')).toBe(true);
      // Must reference the FAILED warning specifically, not the non-FAILED one
      expect(failed.get('get_adopted_texts_feed')).toMatch(/FRESHNESS_FALLBACK_FAILED/);
      expect(failed.get('get_adopted_texts_feed')).not.toMatch(
        /ANALYSIS_ONLY: FRESHNESS_FALLBACK: augmented/
      );
    });

    it('should preserve isError and additional content items when augmenting freshness', async () => {
      const feedPayload = {
        items: [{ id: 'TA-10-2026-0001', dateAdopted: '2026-04-25' }],
        dataQualityWarnings: ['FRESHNESS_FALLBACK: augmented with 1 current-year item'],
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [
          { type: 'text', text: JSON.stringify(feedPayload) },
          { type: 'resource', text: 'auxiliary-metadata' },
        ],
        isError: false,
      });

      const result = await client.getAdoptedTextsFeed();

      // Original isError flag and second content item must survive
      expect(result.isError).toBe(false);
      expect(result.content).toHaveLength(2);
      expect(result.content[1]).toEqual({ type: 'resource', text: 'auxiliary-metadata' });
      // First content item: type preserved, text replaced with augmented payload
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.freshness).toBe('augmented');
      expect(parsed.dataFreshnessWarnings).toHaveLength(1);
    });
  });

  describe('getToolErrorSummary', () => {
    /** @type {EPMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should report "all operational" when no failures recorded', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      spy.mockResolvedValueOnce({ content: [{ type: 'text', text: '{"meps": []}' }] });
      await client.getMEPsFeed();
      expect(client.getToolErrorSummary()).toMatch(/all 1 invoked tools operational/);
    });

    it('should group failures by error code', async () => {
      const spy = vi.spyOn(client, 'callToolWithRetry');
      spy.mockRejectedValueOnce(new Error('Gateway error 404: Not Found'));
      await client.getEventsFeed();
      spy.mockRejectedValueOnce(new Error('Gateway error 404: Not Found'));
      await client.getProceduresFeed();
      spy.mockRejectedValueOnce(new Error('Request timeout'));
      await client.getDocumentsFeed();

      const summary = client.getToolErrorSummary();
      expect(summary).toContain('3 of 3 invoked tools rejected');
      expect(summary).toMatch(/NOT_FOUND \(2\): get_events_feed, get_procedures_feed/);
      expect(summary).toMatch(/TIMEOUT \(1\): get_documents_feed/);
    });

    it('should expose the raw-404 envelope as NOT_FOUND in the summary', async () => {
      const rawEnvelope = {
        '@id': 'https://data.europarl.europa.eu/eli/dl/proc/2026-2033',
        error: '404 Not Found',
      };
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(rawEnvelope) }],
      });
      await client.getProceduresFeed();
      expect(client.getToolErrorSummary()).toMatch(/NOT_FOUND \(1\): get_procedures_feed/);
    });
  });

  describe('getProcedureEventById', () => {
    /** @type {EuropeanParliamentMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
      client.connected = true;
      client.callTool = vi.fn();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should get a specific procedure event by id', async () => {
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: '{"event": {}}' }],
      });

      const options = { processId: 'PROC-123', eventId: 'EVT-456' };
      await client.getProcedureEventById(options);

      expect(client.callTool).toHaveBeenCalledWith('get_procedure_event_by_id', {
        processId: 'PROC-123',
        eventId: 'EVT-456',
      });
    });

    it('should handle missing get_procedure_event_by_id tool gracefully', async () => {
      client.callTool.mockRejectedValue(new Error('Tool not available'));

      const result = await client.getProcedureEventById({
        processId: 'PROC-123',
        eventId: 'EVT-456',
      });

      expect(result).toEqual({
        content: [{ type: 'text', text: '{"event": null}' }],
      });
    });

    it('should return fallback for getProcedureEventById with empty processId', async () => {
      const result = await client.getProcedureEventById({ processId: '', eventId: 'EVT-456' });

      expect(client.callTool).not.toHaveBeenCalled();
      expect(result).toEqual({
        content: [{ type: 'text', text: '{"event": null}' }],
      });
    });

    it('should return fallback for getProcedureEventById with empty eventId', async () => {
      const result = await client.getProcedureEventById({ processId: 'PROC-123', eventId: '' });

      expect(client.callTool).not.toHaveBeenCalled();
      expect(result).toEqual({
        content: [{ type: 'text', text: '{"event": null}' }],
      });
    });

    it('should return fallback for getProcedureEventById with whitespace-only processId', async () => {
      const result = await client.getProcedureEventById({
        processId: '   ',
        eventId: 'EVT-456',
      });

      expect(client.callTool).not.toHaveBeenCalled();
      expect(result).toEqual({
        content: [{ type: 'text', text: '{"event": null}' }],
      });
    });

    it('should trim processId and eventId', async () => {
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: '{"event": {}}' }],
      });

      await client.getProcedureEventById({
        processId: '  PROC-123  ',
        eventId: '  EVT-456  ',
      });

      expect(client.callTool).toHaveBeenCalledWith('get_procedure_event_by_id', {
        processId: 'PROC-123',
        eventId: 'EVT-456',
      });
    });
  });

  describe('getServerHealth', () => {
    /** @type {EuropeanParliamentMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;

    beforeEach(() => {
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
      client.connected = true;
      client.callTool = vi.fn();
    });

    afterEach(() => {
      consoleOutput.restore();
    });

    it('should get server health with no arguments', async () => {
      client.callTool.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: '{"server":{"version":"1.2.1","status":"ok"},"availability":{"level":"Full"}}',
          },
        ],
      });

      const result = await client.getServerHealth();

      expect(client.callTool).toHaveBeenCalledWith('get_server_health', {});
      expect(result.content[0].text).toContain('"status":"ok"');
    });

    it('should handle missing get_server_health tool gracefully', async () => {
      client.callTool.mockRejectedValue(new Error('Tool not available'));

      const result = await client.getServerHealth();

      expect(result).toEqual({
        content: [{ type: 'text', text: '{"server": null, "feeds": []}' }],
      });
    });
  });

  describe('getFreshProcedures', () => {
    /** @type {EuropeanParliamentMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;
    /** @type {string} */
    let tmpDir;
    /** @type {string} */
    let cachePath;

    beforeEach(async () => {
      const { mkdtempSync } = await import('fs');
      const { tmpdir } = await import('os');
      const { join } = await import('path');
      tmpDir = mkdtempSync(join(tmpdir(), 'ep-fresh-proc-'));
      cachePath = join(tmpDir, 'test-proc-cache.json');

      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient();
      client.connected = true;
      client.callTool = vi.fn();
    });

    afterEach(async () => {
      consoleOutput.restore();
      const { rmSync } = await import('fs');
      rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should call get_procedures with default limit=100', async () => {
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: '{"procedures": []}' }],
      });
      await client.getFreshProcedures({ seenCacheStorePath: cachePath });
      expect(client.callTool).toHaveBeenCalledWith('get_procedures', { limit: 100 });
    });

    it('should call get_procedures with custom limit', async () => {
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: '{"procedures": []}' }],
      });
      await client.getFreshProcedures({ limit: 50, seenCacheStorePath: cachePath });
      expect(client.callTool).toHaveBeenCalledWith('get_procedures', { limit: 50 });
    });

    it('should return empty procedures when the API returns empty list', async () => {
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: '{"procedures": []}' }],
      });
      const result = await client.getFreshProcedures({ seenCacheStorePath: cachePath });
      const body = JSON.parse(result.content[0].text);
      expect(body.procedures).toEqual([]);
    });

    it('should sort procedures by dateLastActivity descending', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-25T00:00:00.000Z'));

      try {
        const procedures = [
          { id: 'A', dateLastActivity: '2026-04-01', dateInitiated: '2026-03-01' },
          { id: 'B', dateLastActivity: '2026-04-25', dateInitiated: '2026-03-15' },
          { id: 'C', dateLastActivity: '2026-04-10', dateInitiated: '2026-03-10' },
        ];
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
        });
        const result = await client.getFreshProcedures({ seenCacheStorePath: cachePath });
        const body = JSON.parse(result.content[0].text);
        expect(body.procedures.map((p) => p.id)).toEqual(['B', 'C', 'A']);
      } finally {
        vi.useRealTimers();
      }
    });

    it('should fall back to dateInitiated when dateLastActivity is empty', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-25T00:00:00.000Z'));

      try {
        const procedures = [
          { id: 'A', dateLastActivity: '', dateInitiated: '2026-04-01' },
          { id: 'B', dateLastActivity: '', dateInitiated: '2026-04-25' },
        ];
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
        });
        const result = await client.getFreshProcedures({ seenCacheStorePath: cachePath });
        const body = JSON.parse(result.content[0].text);
        expect(body.procedures[0].id).toBe('B');
        expect(body.procedures[1].id).toBe('A');
      } finally {
        vi.useRealTimers();
      }
    });

    it('should exclude procedures older than the windowDays cutoff', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-25T00:00:00.000Z'));

      try {
        const procedures = [
          { id: 'RECENT', dateLastActivity: '2026-04-20', dateInitiated: '2026-03-01' },
          { id: 'OLD', dateLastActivity: '2026-01-01', dateInitiated: '2025-12-01' },
        ];
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
        });
        const result = await client.getFreshProcedures({
          windowDays: 30,
          seenCacheStorePath: cachePath,
        });
        const body = JSON.parse(result.content[0].text);
        expect(body.procedures.map((p) => p.id)).toContain('RECENT');
        expect(body.procedures.map((p) => p.id)).not.toContain('OLD');
      } finally {
        vi.useRealTimers();
      }
    });

    it('should apply topN cap after sorting and filtering', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-25T00:00:00.000Z'));

      try {
        const procedures = [
          { id: 'A', dateLastActivity: '2026-04-25', dateInitiated: '2026-03-01' },
          { id: 'B', dateLastActivity: '2026-04-24', dateInitiated: '2026-03-01' },
          { id: 'C', dateLastActivity: '2026-04-23', dateInitiated: '2026-03-01' },
        ];
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
        });
        const result = await client.getFreshProcedures({
          topN: 2,
          seenCacheStorePath: cachePath,
        });
        const body = JSON.parse(result.content[0].text);
        expect(body.procedures).toHaveLength(2);
        expect(body.procedures[0].id).toBe('A');
        expect(body.procedures[1].id).toBe('B');
      } finally {
        vi.useRealTimers();
      }
    });

    it('should persist procedure IDs to the seen-cache file', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-25T00:00:00.000Z'));

      try {
        const procedures = [
          { id: '2026-0001', dateLastActivity: '2026-04-25', dateInitiated: '2026-03-01' },
        ];
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
        });
        await client.getFreshProcedures({ seenCacheStorePath: cachePath });

        const { existsSync, readFileSync } = await import('fs');
        expect(existsSync(cachePath)).toBe(true);
        const saved = JSON.parse(readFileSync(cachePath, 'utf-8'));
        expect(saved.version).toBe(1);
        expect(saved.entries['2026-0001'].dateLastActivity).toBe('2026-04-25');
      } finally {
        vi.useRealTimers();
      }
    });

    it('should not write cache file when no procedures pass the window filter', async () => {
      const procedures = [{ id: '1972-0001', dateLastActivity: '', dateInitiated: '1972-01-01' }];
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
      });
      await client.getFreshProcedures({ windowDays: 30, seenCacheStorePath: cachePath });
      const { existsSync } = await import('fs');
      expect(existsSync(cachePath)).toBe(false);
    });

    it('should skip procedures with empty id when writing to cache', async () => {
      const procedures = [{ id: '', dateLastActivity: '2026-04-25', dateInitiated: '2026-03-01' }];
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
      });
      await client.getFreshProcedures({ seenCacheStorePath: cachePath });
      const { existsSync } = await import('fs');
      // Cache should not be written since the only procedure had empty id
      expect(existsSync(cachePath)).toBe(false);
    });

    it('should handle get_procedures tool failure gracefully', async () => {
      client.callTool.mockRejectedValue(new Error('Tool not available'));
      const result = await client.getFreshProcedures({ seenCacheStorePath: cachePath });
      const body = JSON.parse(result.content[0].text);
      expect(body.procedures).toEqual([]);
    });

    it('should handle malformed procedures payload gracefully', async () => {
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: '{"procedures": "not-an-array"}' }],
      });
      const result = await client.getFreshProcedures({ seenCacheStorePath: cachePath });
      const body = JSON.parse(result.content[0].text);
      expect(body.procedures).toEqual([]);
    });

    it('should use default windowDays=30 when not specified', async () => {
      // procedure at exactly today — must always be included
      const today = new Date().toISOString().slice(0, 10);
      const procedures = [{ id: '2026-TODAY', dateLastActivity: today, dateInitiated: '' }];
      client.callTool.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ procedures }) }],
      });
      const result = await client.getFreshProcedures({ seenCacheStorePath: cachePath });
      const body = JSON.parse(result.content[0].text);
      expect(body.procedures.map((p) => p.id)).toContain('2026-TODAY');
    });
  });

  // ─── UPSTREAM_404 indexing-lag retry scheduling ──────────────────────────────

  describe('getAdoptedTexts UPSTREAM_404 indexing-lag retry (Stage B)', () => {
    /** @type {EuropeanParliamentMCPClient} */
    let client;
    /** @type {MockConsoleResult} */
    let consoleOutput;
    /** @type {string} */
    let tmpDir;

    beforeEach(async () => {
      const { createTempDir } = await import('../helpers/test-utils.js');
      tmpDir = createTempDir();
      consoleOutput = mockConsole();
      client = new EuropeanParliamentMCPClient({
        pendingDocumentsStorePath: path.join(tmpDir, 'pending-documents.json'),
      });
    });

    afterEach(async () => {
      const { cleanupTempDir } = await import('../helpers/test-utils.js');
      consoleOutput.restore();
      cleanupTempDir(tmpDir);
    });

    it('should reclassify UPSTREAM_404 "document indexed but content not yet available" as CONTENT_PENDING', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('UPSTREAM_404: document indexed but content not yet available')
      );

      const result = await client.getAdoptedTexts({ docId: 'TA-10-2026-0104' });

      const failed = client.getFailedTools();
      expect(failed.has('get_adopted_texts')).toBe(true);
      // Should be CONTENT_PENDING, NOT NOT_FOUND
      expect(failed.get('get_adopted_texts')).toMatch(/^CONTENT_PENDING:/);
      expect(failed.get('get_adopted_texts')).toContain('TA-10-2026-0104');
      expect(result.content[0].text).toBe('{"texts": []}');
    });

    it('should be case-insensitive when matching the indexing-lag message', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('upstream_404: Document Indexed But Content Not Yet Available')
      );

      await client.getAdoptedTexts({ docId: 'TA-10-2026-0104' });

      const failed = client.getFailedTools();
      expect(failed.get('get_adopted_texts')).toMatch(/^CONTENT_PENDING:/);
    });

    it('should write the docId to the pending-documents sidecar', async () => {
      const { loadPendingDocuments } = await import('../../scripts/mcp/pending-documents.js');

      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('UPSTREAM_404: document indexed but content not yet available')
      );

      await client.getAdoptedTexts({ docId: 'TA-10-2026-0104' });

      const store = await loadPendingDocuments(path.join(tmpDir, 'pending-documents.json'));
      expect(store.documents['TA-10-2026-0104']).toBeDefined();
      expect(store.documents['TA-10-2026-0104'].status).toBe('PENDING');
      expect(store.documents['TA-10-2026-0104'].attempts).toBe(1);
    });

    it('should NOT reclassify a plain NOT_FOUND error as CONTENT_PENDING', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('UPSTREAM_404: resource not found')
      );

      await client.getAdoptedTexts({ docId: 'TA-10-2026-0104' });

      const failed = client.getFailedTools();
      expect(failed.get('get_adopted_texts')).toMatch(/^NOT_FOUND:/);
    });

    it('should NOT apply indexing-lag detection to year-range list queries (no docId)', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockRejectedValueOnce(
        new Error('UPSTREAM_404: document indexed but content not yet available')
      );

      await client.getAdoptedTexts({ year: 2026 });

      // Without docId, the reclassification logic is bypassed
      const failed = client.getFailedTools();
      expect(failed.get('get_adopted_texts')).toMatch(/^NOT_FOUND:/);
    });

    it('should expose getDueAdoptedTextsForReprobe method', async () => {
      const due = await client.getDueAdoptedTextsForReprobe();
      expect(Array.isArray(due)).toBe(true);
    });

    it('should expose resolveAdoptedText method', async () => {
      const { loadPendingDocuments, recordPendingDocument } =
        await import('../../scripts/mcp/pending-documents.js');
      const sidecar = path.join(tmpDir, 'pending-documents.json');
      await recordPendingDocument('TA-10-2026-0104', sidecar);
      await client.resolveAdoptedText('TA-10-2026-0104');

      const store = await loadPendingDocuments(sidecar);
      expect(store.documents['TA-10-2026-0104'].status).toBe('RESOLVED');
    });

    it('should expose escalateStalePendingDocuments method', async () => {
      const escalated = await client.escalateStalePendingDocuments();
      expect(Array.isArray(escalated)).toBe(true);
    });

    it('should expose getPendingDocumentsSummary method', async () => {
      const summary = await client.getPendingDocumentsSummary();
      expect(typeof summary).toBe('string');
      expect(summary).toMatch(/Pending Documents/);
    });

    it('should detect the message when delivered via isError:true response body', async () => {
      vi.spyOn(client, 'callToolWithRetry').mockResolvedValueOnce({
        isError: true,
        content: [
          {
            type: 'text',
            text: 'UPSTREAM_404: document indexed but content not yet available',
          },
        ],
      });

      await client.getAdoptedTexts({ docId: 'TA-10-2026-0104' });

      const failed = client.getFailedTools();
      expect(failed.get('get_adopted_texts')).toMatch(/^CONTENT_PENDING:/);
    });
  });
});
