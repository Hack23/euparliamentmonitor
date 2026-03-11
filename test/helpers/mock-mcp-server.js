// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Mock MCP Server for testing
 * Simulates European Parliament MCP Server responses
 */

import { mockPlenarySession, mockParliamentaryQuestions, mockDocuments, mockMEPs } from '../fixtures/ep-data.js';

/**
 * @typedef {{ method: string, params: Record<string, unknown> }} MockRequest
 */

/**
 * @typedef {{ type: string, text: string }} MCPContent
 */

/**
 * @typedef {{ content: MCPContent[] }} MCPToolResponse
 */

/**
 * @typedef {{ tools: Array<{ name: string, description: string }> }} MCPToolsList
 */

/**
 * Mock MCP Server class
 */
export class MockMCPServer {
  constructor() {
    /** @type {boolean} */
    this.connected = false;
    /** @type {MockRequest[]} */
    this.requests = [];
    /** @type {boolean} */
    this.shouldFail = false;
    /** @type {string} */
    this.failureMessage = 'Mock server error';
  }

  /**
   * Simulate connection
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }
    this.connected = true;
  }

  /**
   * Simulate disconnection
   * @returns {void}
   */
  disconnect() {
    this.connected = false;
  }

  /**
   * Mock sendRequest
   * @param {string} method - The RPC method name
   * @param {Record<string, unknown>} [params] - The request parameters
   * @returns {Promise<MCPToolsList | MCPToolResponse>}
   */
  async sendRequest(method, params = {}) {
    this.requests.push({ method, params });

    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    // Simulate different responses based on method
    switch (method) {
      case 'tools/list':
        return {
          tools: [
            { name: 'get_plenary_sessions', description: 'Get plenary sessions' },
            { name: 'search_documents', description: 'Search documents' },
            { name: 'get_parliamentary_questions', description: 'Get questions' },
            { name: 'get_meps', description: 'Get MEPs' },
          ],
        };

      case 'tools/call':
        return this._handleToolCall(/** @type {string} */ (params['name']));

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  /**
   * Handle tool call
   * @param {string} toolName - The tool name to call
   * @returns {MCPToolResponse}
   */
  _handleToolCall(toolName) {
    switch (toolName) {
      case 'get_plenary_sessions':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ sessions: [mockPlenarySession] }),
            },
          ],
        };

      case 'search_documents':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(mockDocuments),
            },
          ],
        };

      case 'get_parliamentary_questions':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(mockParliamentaryQuestions),
            },
          ],
        };

      case 'get_meps':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ meps: mockMEPs }),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Mock getPlenarySessions
   * @param {Record<string, unknown>} [options] - Query options
   * @returns {Promise<MCPToolResponse>}
   */
  async getPlenarySessions(options = {}) {
    this.requests.push({ method: 'tools/call', params: { name: 'get_plenary_sessions', arguments: options } });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ sessions: [mockPlenarySession] }),
        },
      ],
    };
  }

  /**
   * Mock searchDocuments
   * @param {Record<string, unknown>} [options] - Search options
   * @returns {Promise<MCPToolResponse>}
   */
  async searchDocuments(options = {}) {
    this.requests.push({ method: 'tools/call', params: { name: 'search_documents', arguments: options } });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockDocuments),
        },
      ],
    };
  }

  /**
   * Mock getParliamentaryQuestions
   * @param {Record<string, unknown>} [options] - Query options
   * @returns {Promise<MCPToolResponse>}
   */
  async getParliamentaryQuestions(options = {}) {
    this.requests.push({ method: 'tools/call', params: { name: 'get_parliamentary_questions', arguments: options } });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockParliamentaryQuestions),
        },
      ],
    };
  }

  /**
   * Mock getMEPs
   * @returns {Promise<MCPToolResponse>}
   */
  async getMEPs() {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ meps: mockMEPs }),
        },
      ],
    };
  }

  /**
   * Set mock to fail
   * @param {boolean} shouldFail - Whether mock should fail
   * @param {string} [message] - Error message
   * @returns {void}
   */
  setFailure(shouldFail, message = 'Mock server error') {
    this.shouldFail = shouldFail;
    this.failureMessage = message;
  }

  /**
   * Get all requests made
   * @returns {MockRequest[]}
   */
  getRequests() {
    return this.requests;
  }

  /**
   * Clear request history
   * @returns {void}
   */
  clearRequests() {
    this.requests = [];
  }
}

/**
 * Create a mock MCP client
 * @returns {MockMCPServer}
 */
export function createMockMCPClient() {
  return new MockMCPServer();
}
