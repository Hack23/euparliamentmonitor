// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/MCPConnection
 * @description Base MCP client — JSON-RPC 2.0 transport over stdio or HTTP gateway.
 * Supports two transport modes:
 * - **stdio**: Spawns the EP MCP server binary as a child process (default)
 * - **gateway**: Connects to an MCP Gateway via HTTP (for agentic workflow environments)
 *
 * Gateway mode is activated when `EP_MCP_GATEWAY_URL` env var is set or
 * `gatewayUrl` is provided in options.
 */

import { spawn, type ChildProcess } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  MCPClientOptions,
  MCPToolResult,
  JSONRPCRequest,
  JSONRPCResponse,
  PendingRequest,
} from '../types/index.js';

/** npm binary name for the European Parliament MCP server */
const BINARY_NAME = 'european-parliament-mcp-server';

/** Platform-specific binary filename (Windows uses .cmd shim) */
const BINARY_FILE = process.platform === 'win32' ? `${BINARY_NAME}.cmd` : BINARY_NAME;

/** Default binary resolved from node_modules/.bin relative to this file's compiled location */
const DEFAULT_SERVER_BINARY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  `../../node_modules/.bin/${BINARY_FILE}`
);

/** Request timeout in milliseconds — EU Parliament API responses commonly take 30+ seconds */
const REQUEST_TIMEOUT_MS = 60000;

/** Connection startup delay in milliseconds */
const CONNECTION_STARTUP_DELAY_MS = 500;

/**
 * Parse an SSE (Server-Sent Events) response body to extract JSON-RPC messages.
 *
 * @param body - Raw SSE response text
 * @returns Parsed JSON-RPC response or null
 */
function parseSSEResponse(body: string): JSONRPCResponse | null {
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr) {
        try {
          return JSON.parse(jsonStr) as JSONRPCResponse;
        } catch {
          // Continue to next data line
        }
      }
    }
  }
  return null;
}

/**
 * Base MCP connection managing JSON-RPC 2.0 transport over stdio or HTTP gateway.
 * Extended by domain-specific clients to add tool wrapper methods.
 */
export class MCPConnection {
  private serverPath: string;
  private connected: boolean;
  private process: ChildProcess | null;
  private requestId: number;
  private pendingRequests: Map<number, PendingRequest>;
  private connectionAttempts: number;
  private maxConnectionAttempts: number;
  private connectionRetryDelay: number;

  /** Gateway URL for HTTP transport mode */
  private gatewayUrl: string | null;

  /** API key for gateway authentication */
  private gatewayApiKey: string | null;

  /** MCP session ID returned by the gateway */
  private mcpSessionId: string | null;

  constructor(options: MCPClientOptions = {}) {
    this.serverPath =
      options.serverPath ?? process.env['EP_MCP_SERVER_PATH'] ?? DEFAULT_SERVER_BINARY;
    this.connected = false;
    this.process = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = options.maxConnectionAttempts ?? 3;
    this.connectionRetryDelay = options.connectionRetryDelay ?? 1000;

    this.gatewayUrl = options.gatewayUrl ?? process.env['EP_MCP_GATEWAY_URL'] ?? null;
    this.gatewayApiKey = options.gatewayApiKey ?? process.env['EP_MCP_GATEWAY_API_KEY'] ?? null;
    this.mcpSessionId = null;
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
   * Check if using gateway HTTP transport
   *
   * @returns True if gateway mode is active
   */
  isGatewayMode(): boolean {
    return this.gatewayUrl !== null;
  }

  /**
   * Connect to the MCP server with retry logic
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (this.gatewayUrl) {
      console.log('🔌 Connecting to European Parliament MCP Server via gateway...');
      console.log(`   Gateway URL: ${this.gatewayUrl}`);
    } else {
      console.log('🔌 Connecting to European Parliament MCP Server...');
    }

    this.connectionAttempts = 0;
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        if (this.gatewayUrl) {
          await this._attemptGatewayConnection();
        } else {
          await this._attemptConnection();
        }
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
   * Attempt a single connection via MCP Gateway (HTTP transport)
   */
  private async _attemptGatewayConnection(): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      };
      if (this.gatewayApiKey) {
        headers['Authorization'] = `Bearer ${this.gatewayApiKey}`;
      }

      const initRequest: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: ++this.requestId,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'ep-mcp-client', version: '1.0.0' },
        },
      };

      const response = await fetch(this.gatewayUrl!, {
        method: 'POST',
        headers,
        body: JSON.stringify(initRequest),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Gateway returned ${response.status}: ${response.statusText}`);
      }

      const sessionId = response.headers.get('mcp-session-id');
      if (sessionId) {
        this.mcpSessionId = sessionId;
      }

      this.connected = true;
      console.log('✅ Connected to European Parliament MCP Server via gateway');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to connect to MCP gateway:', message);
      throw error;
    }
  }

  /**
   * Attempt a single connection via stdio (spawns server binary)
   */
  private async _attemptConnection(): Promise<void> {
    try {
      const isJavaScriptFile: boolean = this.serverPath.toLowerCase().endsWith('.js');
      const command: string = isJavaScriptFile ? process.execPath : this.serverPath;
      const args: string[] = isJavaScriptFile ? [this.serverPath] : [];

      this.process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let buffer = '';
      let startupError: Error | null = null;

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

      this.process.on('error', (err: Error) => {
        startupError = err;
        this.connected = false;
      });

      await new Promise((resolve) => setTimeout(resolve, CONNECTION_STARTUP_DELAY_MS));

      if (startupError) {
        throw startupError;
      }

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
    this.mcpSessionId = null;
  }

  /**
   * Handle incoming messages from MCP server (stdio mode only)
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
   * Send a request via MCP Gateway (HTTP transport)
   *
   * @param method - RPC method name
   * @param params - Method parameters
   * @returns Server response
   */
  private async _sendGatewayRequest(
    method: string,
    params: Record<string, unknown> = {}
  ): Promise<unknown> {
    const id = ++this.requestId;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    };
    if (this.gatewayApiKey) {
      headers['Authorization'] = `Bearer ${this.gatewayApiKey}`;
    }
    if (this.mcpSessionId) {
      headers['Mcp-Session-Id'] = this.mcpSessionId;
    }

    const response = await fetch(this.gatewayUrl!, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Gateway error ${response.status}: ${response.statusText}`);
    }

    const sessionId = response.headers.get('mcp-session-id');
    if (sessionId) {
      this.mcpSessionId = sessionId;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const body = await response.text();

    if (contentType.includes('text/event-stream')) {
      const parsed = parseSSEResponse(body);
      if (!parsed) {
        throw new Error('Failed to parse SSE response from gateway');
      }
      if (parsed.error) {
        throw new Error(parsed.error.message ?? 'MCP gateway error');
      }
      return parsed.result;
    }

    const jsonResponse = JSON.parse(body) as JSONRPCResponse;
    if (jsonResponse.error) {
      throw new Error(jsonResponse.error.message ?? 'MCP gateway error');
    }
    return jsonResponse.result;
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

    if (this.gatewayUrl) {
      return await this._sendGatewayRequest(method, params);
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
   * @param args - Tool arguments (must be a plain object, non-null, not an array)
   * @returns Tool execution result
   */
  async callTool(name: string, args: object = {}): Promise<MCPToolResult> {
    if (args === null || Array.isArray(args) || typeof args !== 'object') {
      throw new TypeError(
        'MCP tool arguments must be a plain object (non-null object, not an array or function)'
      );
    }
    return (await this.sendRequest('tools/call', { name, arguments: args })) as MCPToolResult;
  }
}
