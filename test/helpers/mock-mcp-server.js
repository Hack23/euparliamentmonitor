/**
 * Mock MCP Server for testing
 * Simulates European Parliament MCP Server responses
 */

import { mockPlenarySession, mockParliamentaryQuestions, mockDocuments, mockMEPs } from '../fixtures/ep-data.js';

/**
 * Mock MCP Server class
 */
export class MockMCPServer {
  constructor() {
    this.connected = false;
    this.requests = [];
    this.shouldFail = false;
    this.failureMessage = 'Mock server error';
  }

  /**
   * Simulate connection
   */
  async connect() {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }
    this.connected = true;
  }

  /**
   * Simulate disconnection
   */
  disconnect() {
    this.connected = false;
  }

  /**
   * Mock sendRequest
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
        return this._handleToolCall(params.name, params.arguments);

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  /**
   * Handle tool call
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
   */
  setFailure(shouldFail, message = 'Mock server error') {
    this.shouldFail = shouldFail;
    this.failureMessage = message;
  }

  /**
   * Get all requests made
   */
  getRequests() {
    return this.requests;
  }

  /**
   * Clear request history
   */
  clearRequests() {
    this.requests = [];
  }
}

/**
 * Create a mock MCP client
 */
export function createMockMCPClient() {
  return new MockMCPServer();
}
