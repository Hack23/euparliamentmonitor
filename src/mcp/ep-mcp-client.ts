// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/EPMCPClient
 * @description Client for connecting to European-Parliament-MCP-Server.
 * Communicates via JSON-RPC 2.0 over stdio with retry logic.
 */

import { spawn, type ChildProcess } from 'child_process';
import type {
  MCPClientOptions,
  MCPToolResult,
  JSONRPCRequest,
  JSONRPCResponse,
  PendingRequest,
} from '../types/index.js';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 30000;

/** Connection startup delay in milliseconds */
const CONNECTION_STARTUP_DELAY_MS = 500;

/**
 * MCP Client for European Parliament data access
 */
export class EuropeanParliamentMCPClient {
  private serverPath: string;
  private connected: boolean;
  private process: ChildProcess | null;
  private requestId: number;
  private pendingRequests: Map<number, PendingRequest>;
  private connectionAttempts: number;
  private maxConnectionAttempts: number;
  private connectionRetryDelay: number;

  constructor(options: MCPClientOptions = {}) {
    this.serverPath =
      options.serverPath ?? process.env['EP_MCP_SERVER_PATH'] ?? 'european-parliament-mcp';
    this.connected = false;
    this.process = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = options.maxConnectionAttempts ?? 3;
    this.connectionRetryDelay = options.connectionRetryDelay ?? 1000;
  }

  /**
   * Check if client is connected
   *
   * @returns Connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Connect to the MCP server with retry logic
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    console.log('🔌 Connecting to European Parliament MCP Server...');

    this.connectionAttempts = 0;
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
  private async _attemptConnection(): Promise<void> {
    try {
      this.process = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let buffer = '';

      this.process.stdout?.on('data', (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.trim()) {
            this.handleMessage(line);
          }
        }
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        const message = data.toString().trim();
        if (message) {
          console.error(`MCP Server: ${message}`);
        }
      });

      this.process.on('close', (code: number | null) => {
        console.log(`MCP Server exited with code ${code}`);
        this.connected = false;

        for (const [id, { reject }] of this.pendingRequests.entries()) {
          reject(new Error('MCP server connection closed'));
          this.pendingRequests.delete(id);
        }
      });

      this.process.on('error', (_error: Error) => {
        this.connected = false;
      });

      await new Promise((resolve) => setTimeout(resolve, CONNECTION_STARTUP_DELAY_MS));

      this.connected = true;
      console.log('✅ Connected to European Parliament MCP Server');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to spawn MCP server:', message);
      throw error;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  disconnect(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.connected = false;
  }

  /**
   * Handle incoming messages from MCP server
   *
   * @param line - JSON message line from server
   */
  handleMessage(line: string): void {
    try {
      const message = JSON.parse(line) as JSONRPCResponse;

      if (message.id && this.pendingRequests.has(message.id)) {
        const pending = this.pendingRequests.get(message.id)!;
        this.pendingRequests.delete(message.id);

        if (message.error) {
          pending.reject(new Error(message.error.message ?? 'MCP server error'));
        } else {
          pending.resolve(message.result);
        }
      } else if (!message.id && message.method) {
        console.log(`MCP Notification: ${message.method}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error parsing MCP message:', errorMessage);
      console.error('Problematic line:', line);
    }
  }

  /**
   * Send a request to the MCP server
   *
   * @param method - RPC method name
   * @param params - Method parameters
   * @returns Server response
   */
  async sendRequest(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    const id = ++this.requestId;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return await new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      const message = JSON.stringify(request) + '\n';
      this.process?.stdin?.write(message);

      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, REQUEST_TIMEOUT_MS);
    });
  }

  /**
   * List available MCP tools
   *
   * @returns List of available tools
   */
  async listTools(): Promise<unknown> {
    return await this.sendRequest('tools/list');
  }

  /**
   * Call an MCP tool
   *
   * @param name - Tool name
   * @param args - Tool arguments
   * @returns Tool execution result
   */
  async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
    return await this.sendRequest('tools/call', { name, arguments: args });
  }

  /**
   * Get Members of European Parliament
   *
   * @param options - Filter options
   * @returns List of MEPs
   */
  async getMEPs(options: Record<string, unknown> = {}): Promise<unknown> {
    return await this.callTool('get_meps', options);
  }

  /**
   * Get plenary sessions
   *
   * @param options - Filter options
   * @returns Plenary sessions data
   */
  async getPlenarySessions(options: Record<string, unknown> = {}): Promise<MCPToolResult> {
    try {
      return (await this.callTool('get_plenary_sessions', options)) as MCPToolResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('get_plenary_sessions not available:', message);
      return { content: [{ type: 'text', text: '{"sessions": []}' }] };
    }
  }

  /**
   * Search legislative documents
   *
   * @param options - Search options
   * @returns Search results
   */
  async searchDocuments(options: Record<string, unknown> = {}): Promise<MCPToolResult> {
    try {
      return (await this.callTool('search_documents', options)) as MCPToolResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('search_documents not available:', message);
      return { content: [{ type: 'text', text: '{"documents": []}' }] };
    }
  }

  /**
   * Get parliamentary questions
   *
   * @param options - Filter options
   * @returns Parliamentary questions data
   */
  async getParliamentaryQuestions(options: Record<string, unknown> = {}): Promise<MCPToolResult> {
    try {
      return (await this.callTool('get_parliamentary_questions', options)) as MCPToolResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('get_parliamentary_questions not available:', message);
      return { content: [{ type: 'text', text: '{"questions": []}' }] };
    }
  }
}

// Singleton instance management
let clientInstance: EuropeanParliamentMCPClient | null = null;

/**
 * Get or create singleton MCP client instance
 *
 * @param options - Client options
 * @returns Connected MCP client
 */
export async function getEPMCPClient(
  options: MCPClientOptions = {}
): Promise<EuropeanParliamentMCPClient> {
  if (!clientInstance) {
    clientInstance = new EuropeanParliamentMCPClient(options);
    await clientInstance.connect();
  }
  return clientInstance;
}

/**
 * Close and cleanup singleton MCP client
 */
export async function closeEPMCPClient(): Promise<void> {
  if (clientInstance) {
    clientInstance.disconnect();
    clientInstance = null;
  }
}
