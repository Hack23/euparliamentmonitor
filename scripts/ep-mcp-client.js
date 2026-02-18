// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP Client for European Parliament
 * @description Client for connecting to European-Parliament-MCP-Server
 *
 * This module provides a client interface for communicating with the
 * European Parliament MCP Server to retrieve parliamentary data.
 *
 * Enhanced with retry logic, better error handling, and connection pooling.
 *
 * @author Hack23 AB
 * @license Apache-2.0
 */

import { spawn } from 'child_process';

/**
 * MCP Client for European Parliament data access
 */
export class EuropeanParliamentMCPClient {
  constructor(options = {}) {
    this.serverPath =
      options.serverPath || process.env.EP_MCP_SERVER_PATH || 'european-parliament-mcp';
    this.connected = false;
    this.process = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = options.maxConnectionAttempts || 3;
    this.connectionRetryDelay = options.connectionRetryDelay || 1000; // ms
  }

  /**
   * Connect to the MCP server with retry logic
   */
  async connect() {
    if (this.connected) {
      return;
    }

    console.log('🔌 Connecting to European Parliament MCP Server...');

    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        await this._attemptConnection();
        this.connectionAttempts = 0; // Reset on success
        return;
      } catch (error) {
        this.connectionAttempts++;
        if (this.connectionAttempts < this.maxConnectionAttempts) {
          const delay = this.connectionRetryDelay * Math.pow(2, this.connectionAttempts - 1);
          console.warn(
            `⚠️ Connection attempt ${this.connectionAttempts} failed. Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(
            '❌ Failed to connect to MCP server after',
            this.maxConnectionAttempts,
            'attempts'
          );
          throw error;
        }
      }
    }
  }

  /**
   * Attempt a single connection
   */
  async _attemptConnection() {
    try {
      // Spawn the MCP server process
      this.process = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Buffer for incomplete messages
      let buffer = '';

      // Handle stdout (MCP protocol messages)
      this.process.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            this.handleMessage(line);
          }
        }
      });

      // Handle stderr (logging)
      this.process.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          console.error(`MCP Server: ${message}`);
        }
      });

      // Handle process exit
      this.process.on('close', (code) => {
        console.log(`MCP Server exited with code ${code}`);
        this.connected = false;

        // Reject all pending requests
        for (const [id, { reject }] of this.pendingRequests.entries()) {
          reject(new Error('MCP server connection closed'));
          this.pendingRequests.delete(id);
        }
      });

      // Handle process errors
      this.process.on('error', (error) => {
        console.error('MCP Server process error:', error);
        this.connected = false;
      });

      // Wait a moment for the server to start
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.connected = true;
      console.log('✅ Connected to European Parliament MCP Server');
    } catch (error) {
      console.error('❌ Failed to spawn MCP server:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  disconnect() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.connected = false;
  }

  /**
   * Handle incoming messages from MCP server
   * @param {string} line - JSON message line from server
   */
  handleMessage(line) {
    try {
      const message = JSON.parse(line);

      // Handle responses to our requests
      if (message.id && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          reject(new Error(message.error.message || 'MCP server error'));
        } else {
          resolve(message.result);
        }
      }

      // Handle notifications (messages without id)
      else if (!message.id && message.method) {
        console.log(`MCP Notification: ${message.method}`);
      }
    } catch (error) {
      console.error('Error parsing MCP message:', error.message);
      console.error('Problematic line:', line);
    }
  }

  /**
   * Send a request to the MCP server
   * @param {string} method - RPC method name
   * @param {object} params - Method parameters
   * @returns {Promise<any>} Server response
   */
  // eslint-disable-next-line require-await
  async sendRequest(method, params = {}) {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const message = JSON.stringify(request) + '\n';
      this.process.stdin.write(message);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * List available MCP tools
   * @returns {Promise<Array>} List of available tools
   */
  // eslint-disable-next-line require-await
  async listTools() {
    return this.sendRequest('tools/list');
  }

  /**
   * Call an MCP tool
   * @param {string} name - Tool name
   * @param {object} args - Tool arguments
   * @returns {Promise<any>} Tool execution result
   */
  // eslint-disable-next-line require-await
  async callTool(name, args = {}) {
    return this.sendRequest('tools/call', { name, arguments: args });
  }

  /**
   * Get Members of European Parliament
   * @param {object} options - Filter options
   * @param {string} options.country - ISO country code
   * @param {string} options.group - Political group
   * @param {number} options.limit - Result limit
   * @returns {Promise<Array>} List of MEPs
   */
  // eslint-disable-next-line require-await
  async getMEPs(options = {}) {
    return this.callTool('get_meps', options);
  }

  /**
   * Get plenary sessions
   * @param {object} options - Filter options
   * @param {string} options.startDate - Start date (YYYY-MM-DD)
   * @param {string} options.endDate - End date (YYYY-MM-DD)
   * @param {number} options.limit - Result limit
   * @returns {Promise<object>} Plenary sessions data
   */
  async getPlenarySessions(options = {}) {
    try {
      return await this.callTool('get_plenary_sessions', options);
    } catch (error) {
      // Tool might not be implemented yet, return empty array
      console.warn('get_plenary_sessions not available:', error.message);
      return { content: [{ type: 'text', text: '{"sessions": []}' }] };
    }
  }

  /**
   * Search legislative documents
   * @param {object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.type - Document type
   * @param {number} options.limit - Result limit
   * @returns {Promise<object>} Search results
   */
  async searchDocuments(options = {}) {
    try {
      return await this.callTool('search_documents', options);
    } catch (error) {
      // Tool might not be implemented yet, return empty array
      console.warn('search_documents not available:', error.message);
      return { content: [{ type: 'text', text: '{"documents": []}' }] };
    }
  }

  /**
   * Get parliamentary questions
   * @param {object} options - Filter options
   * @param {string} options.type - Question type (written/oral)
   * @param {string} options.startDate - Start date
   * @param {number} options.limit - Result limit
   * @returns {Promise<object>} Parliamentary questions data
   */
  async getParliamentaryQuestions(options = {}) {
    try {
      return await this.callTool('get_parliamentary_questions', options);
    } catch (error) {
      // Tool might not be implemented yet, return empty array
      console.warn('get_parliamentary_questions not available:', error.message);
      return { content: [{ type: 'text', text: '{"questions": []}' }] };
    }
  }
}

// Export singleton instance
let clientInstance = null;

export async function getEPMCPClient(options = {}) {
  if (!clientInstance) {
    clientInstance = new EuropeanParliamentMCPClient(options);
    await clientInstance.connect();
  }
  return clientInstance;
}

export async function closeEPMCPClient() {
  if (clientInstance) {
    await clientInstance.disconnect();
    clientInstance = null;
  }
}
