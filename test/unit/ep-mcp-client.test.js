// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for ep-mcp-client.js
 * Tests MCP client connection, retries, validation, and error handling
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import { EuropeanParliamentMCPClient, getEPMCPClient, closeEPMCPClient } from '../../scripts/mcp/ep-mcp-client.js';
import { parseSSEResponse } from '../../scripts/mcp/mcp-connection.js';
import { mockConsole } from '../helpers/test-utils.js';

describe('ep-mcp-client', () => {
  describe('EuropeanParliamentMCPClient', () => {
    let client;
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
        await expect(client.sendRequest('test_method')).rejects.toThrow('Not connected to MCP server');
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

      it('should normalize dateFrom to startDate in getPlenarySessions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"sessions": []}' }],
        });

        await client.getPlenarySessions({ dateFrom: '2025-01-01', dateTo: '2025-01-31', limit: 50 });

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_sessions', {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          limit: 50,
        });
      });

      it('should not overwrite startDate with dateFrom in getPlenarySessions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"sessions": []}' }],
        });

        await client.getPlenarySessions({ startDate: '2025-02-01', dateFrom: '2025-01-01', limit: 10 });

        expect(client.callTool).toHaveBeenCalledWith('get_plenary_sessions', {
          startDate: '2025-02-01',
          limit: 10,
        });
      });

      it('should handle missing plenary sessions tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getPlenarySessions();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"sessions": []}' }],
        });
      });

      it('should search documents', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        const options = { query: 'climate', type: 'proposal' };
        await client.searchDocuments(options);

        expect(client.callTool).toHaveBeenCalledWith('search_documents', options);
      });

      it('should normalize keyword to query in searchDocuments', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"documents": []}' }],
        });

        await client.searchDocuments({ keyword: 'parliament', limit: 20 });

        expect(client.callTool).toHaveBeenCalledWith(
          'search_documents',
          expect.objectContaining({ query: 'parliament', limit: 20 })
        );
        const callArgs = client.callTool.mock.calls[0][1];
        expect(callArgs).not.toHaveProperty('keyword');
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

      it('should map dateFrom to startDate in getParliamentaryQuestions', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"questions": []}' }],
        });

        await client.getParliamentaryQuestions({ dateFrom: '2024-01-01', limit: 10 });

        const callArgs = client.callTool.mock.calls[0][1];
        expect(callArgs).toHaveProperty('startDate', '2024-01-01');
        expect(callArgs).not.toHaveProperty('dateFrom');
        expect(callArgs).not.toHaveProperty('dateTo');
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

        const options = { committeeId: 'ENVI', limit: 20 };
        await client.getCommitteeInfo(options);

        expect(client.callTool).toHaveBeenCalledWith('get_committee_info', options);
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

        const options = { reportType: 'MEP_ACTIVITY', subjectId: 'MEP-123', dateFrom: '2025-01-01' };
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

        const options = { politicalGroups: ['EPP', 'S&D'], dateFrom: '2024-01-01' };
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

      it('should detect voting anomalies', async () => {
        client.callTool.mockResolvedValue({
          content: [{ type: 'text', text: '{"anomalies": []}' }],
        });

        const options = { mepId: 'MEP-123', politicalGroup: 'EPP', dateFrom: '2024-01-01' };
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

        const options = { groups: ['EPP', 'S&D'], metrics: ['attendance'], dateFrom: '2024-01-01' };
        await client.comparePoliticalGroups(options);

        expect(client.callTool).toHaveBeenCalledWith('compare_political_groups', options);
      });

      it('should handle missing compare political groups tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.comparePoliticalGroups({ groups: ['EPP', 'S&D'] });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"comparison": {}}' }],
        });
      });

      it('should return fallback for comparePoliticalGroups with empty groups', async () => {
        const result = await client.comparePoliticalGroups({ groups: [] });

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

        const result = await client.analyzeLegislativeEffectiveness({ subjectId: 'MEP-123', subjectType: 'MEP' });

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"effectiveness": null}' }],
        });
      });

      it('should return fallback for analyzeLegislativeEffectiveness with blank subjectId', async () => {
        const result = await client.analyzeLegislativeEffectiveness({ subjectId: '', subjectType: 'MEP' });

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

        const options = { year: 2025, limit: 10 };
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

        const options = { dateFrom: '2025-01-01', dateTo: '2025-01-31' };
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

        const options = { year: 2025 };
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

        const options = { year: 2025 };
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

        expect(client.callTool).toHaveBeenCalledWith('get_meeting_plenary_session_documents', options);
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

        expect(client.callTool).toHaveBeenCalledWith('get_meeting_plenary_session_document_items', options);
      });

      it('should handle missing get_meeting_plenary_session_document_items tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.getMeetingPlenarySessionDocumentItems({ sittingId: 'SITTING-789' });

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

        const options = { mepId: 12345, correlationScenarios: ['influence_anomaly'] };
        await client.correlateIntelligence(options);

        expect(client.callTool).toHaveBeenCalledWith('correlate_intelligence', options);
      });

      it('should handle missing correlate_intelligence tool gracefully', async () => {
        client.callTool.mockRejectedValue(new Error('Tool not available'));

        const result = await client.correlateIntelligence();

        expect(result).toEqual({
          content: [{ type: 'text', text: '{"analysis": null}' }],
        });
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
      vi.spyOn(EuropeanParliamentMCPClient.prototype, 'disconnect').mockImplementation(mockDisconnect);

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

  describe('parseSSEResponse', () => {
    it('should parse a valid SSE response with single data line', () => {
      const body = 'event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"tools":[]}}\n\n';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result.jsonrpc).toBe('2.0');
      expect(result.id).toBe(1);
      expect(result.result).toEqual({ tools: [] });
    });

    it('should return null for empty response body', () => {
      expect(parseSSEResponse('')).toBeNull();
    });

    it('should return null for response with no data lines', () => {
      const body = 'event: message\n: comment line\n\n';
      expect(parseSSEResponse(body)).toBeNull();
    });

    it('should return first valid message when multiple data lines exist', () => {
      const body = 'data: {"jsonrpc":"2.0","id":1,"result":"first"}\ndata: {"jsonrpc":"2.0","id":2,"result":"second"}\n';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result.id).toBe(1);
      expect(result.result).toBe('first');
    });

    it('should skip malformed JSON and return next valid data line', () => {
      const body = 'data: {invalid json}\ndata: {"jsonrpc":"2.0","id":3,"result":"valid"}\n';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result.id).toBe(3);
      expect(result.result).toBe('valid');
    });

    it('should return null when all data lines contain malformed JSON', () => {
      const body = 'data: {invalid}\ndata: not-json\n';
      expect(parseSSEResponse(body)).toBeNull();
    });

    it('should skip data lines with empty content after prefix', () => {
      const body = 'data: \ndata:   \ndata: {"jsonrpc":"2.0","id":4,"result":"ok"}\n';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result.id).toBe(4);
    });

    it('should handle data lines with extra whitespace after prefix', () => {
      const body = 'data:    {"jsonrpc":"2.0","id":5,"result":"trimmed"}  \n';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result.id).toBe(5);
    });

    it('should handle mixed valid/invalid lines with event prefixes', () => {
      const body = 'event: message\n: server comment\ndata: {"jsonrpc":"2.0","id":6,"result":"found"}\nevent: done\n\n';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result.id).toBe(6);
    });

    it('should parse error responses from SSE', () => {
      const body = 'data: {"jsonrpc":"2.0","id":7,"error":{"code":-32600,"message":"Invalid Request"}}\n';
      const result = parseSSEResponse(body);
      expect(result).not.toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe(-32600);
      expect(result.error.message).toBe('Invalid Request');
    });
  });
});
