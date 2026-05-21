// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/transport/connection
 * @description MCPConnection — JSON-RPC 2.0 transport over stdio or HTTP gateway.
 * Supports two transport modes:
 * - **stdio**: Spawns the EP MCP server binary as a child process (default)
 * - **gateway**: Connects to an MCP Gateway via HTTP (for agentic workflow environments)
 *
 * Gateway mode is activated when `EP_MCP_GATEWAY_URL` env var is set or
 * `gatewayUrl` is provided in options.
 */

import type { ChildProcess } from 'child_process';
import type {
  MCPClientOptions,
  MCPToolResult,
  JSONRPCRequest,
  PendingRequest,
} from '../../types/index.js';
import { MCPRateLimitError, MCPSessionExpiredError } from './errors.js';
import { attemptGatewayConnection, sendGatewayRequest, type GatewayContext } from './gateway.js';
import {
  REQUEST_TIMEOUT_MS,
  DEFAULT_SERVER_BINARY,
  type SpawnContext,
  attemptStdioConnection,
  handleIncomingMessage,
} from './process.js';
import { type ReconnectOps, performReconnect, runWithRetry } from './reconnect.js';

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
  private maxRetries: number;
  private reconnectingPromise: Promise<void> | null;
  private timeoutCount: number;
  private reconnectCount: number;

  /** Gateway URL for HTTP transport mode */
  private gatewayUrl: string | null;

  /** API key for gateway authentication */
  private gatewayApiKey: string | null;

  /** MCP session ID returned by the gateway */
  private mcpSessionId: string | null;

  /** Human-readable server name for log messages */
  protected serverLabel: string;

  /**
   * Create a new MCP connection.
   *
   * Resolves the server binary path, gateway URL, and authentication options
   * from the explicit `options`, then from environment variables, and finally
   * module-level defaults. The connection is not opened until {@link connect}
   * is called.
   *
   * @param options - Connection options including server path, gateway URL,
   *   API key, retry policy, and human-readable server label for log messages.
   */
  constructor(options: MCPClientOptions = {}) {
    this.serverPath =
      options.serverPath ?? process.env['EP_MCP_SERVER_PATH'] ?? DEFAULT_SERVER_BINARY;
    this.connected = false;
    this.process = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = Math.max(1, options.maxConnectionAttempts ?? 3);
    this.connectionRetryDelay = options.connectionRetryDelay ?? 1000;
    this.maxRetries = options.maxRetries ?? 2;
    this.reconnectingPromise = null;
    this.timeoutCount = 0;
    this.reconnectCount = 0;
    this.serverLabel = options.serverLabel ?? 'European Parliament MCP Server';

    const rawGatewayUrl = (options.gatewayUrl ?? process.env['EP_MCP_GATEWAY_URL'] ?? '').trim();
    this.gatewayUrl = rawGatewayUrl || null;
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
    return Boolean(this.gatewayUrl);
  }

  /**
   * Get the configured gateway URL
   *
   * @returns Gateway URL or null if using stdio transport
   */
  getGatewayUrl(): string | null {
    return this.gatewayUrl;
  }

  /**
   * Get the configured gateway API key
   *
   * @returns Gateway API key or null if not set
   */
  getGatewayApiKey(): string | null {
    return this.gatewayApiKey;
  }

  /**
   * Get the current MCP session ID
   *
   * @returns Session ID returned by the gateway, or null if not yet connected
   */
  getMcpSessionId(): string | null {
    return this.mcpSessionId;
  }

  /**
   * Get connection health metrics for telemetry
   *
   * @returns Object with timeout count, reconnection count, and current connection status
   */
  getConnectionHealth(): { timeoutCount: number; reconnectCount: number; connected: boolean } {
    return {
      timeoutCount: this.timeoutCount,
      reconnectCount: this.reconnectCount,
      connected: this.connected,
    };
  }

  /**
   * Connect to the MCP server with retry logic
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (this.gatewayUrl) {
      console.log(`🔌 Connecting to ${this.serverLabel} via gateway...`);
      console.log(`   Gateway URL: ${this.gatewayUrl}`);
    } else {
      console.log(`🔌 Connecting to ${this.serverLabel}...`);
    }

    this.connectionAttempts = 0;
    while (this.connectionAttempts < this.maxConnectionAttempts) {
      try {
        if (this.gatewayUrl) {
          await attemptGatewayConnection(this._gatewayContext());
        } else {
          await this._attemptConnection();
        }
        this.connectionAttempts = 0;
        return;
      } catch (error) {
        const delay = this._nextConnectionDelay(error);
        console.warn(
          `⚠️ Connection attempt ${this.connectionAttempts} failed. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Advance the attempt counter and compute the next retry delay.
   * Throws immediately for non-retriable errors or when exhausted.
   *
   * @param error - The error from the failed attempt
   * @returns Delay in milliseconds to wait before the next attempt
   */
  private _nextConnectionDelay(error: unknown): number {
    if (error instanceof MCPSessionExpiredError) throw error;
    this.connectionAttempts++;
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error(
        '❌ Failed to connect to MCP server after',
        this.maxConnectionAttempts,
        'attempts'
      );
      throw error;
    }
    if (error instanceof MCPRateLimitError && error.retryAfterMs > 0) {
      return error.retryAfterMs;
    }
    return this.connectionRetryDelay * Math.pow(2, this.connectionAttempts - 1);
  }

  /**
   * Build a {@link GatewayContext} adapter for gateway.ts helpers.
   *
   * @returns Context adapter for gateway.ts helpers
   */
  private _gatewayContext(): GatewayContext {
    return {
      gatewayUrl: this.gatewayUrl,
      gatewayApiKey: this.gatewayApiKey,
      serverLabel: this.serverLabel,
      getMcpSessionId: () => this.mcpSessionId,
      nextRequestId: () => ++this.requestId,
      setMcpSessionId: (id) => {
        this.mcpSessionId = id;
      },
      setConnected: (v) => {
        this.connected = v;
      },
    };
  }

  /**
   * Build a {@link SpawnContext} adapter for process.ts spawn helpers.
   *
   * @returns Context adapter for stdio spawn helpers
   */
  private _spawnContext(): SpawnContext {
    return {
      serverPath: this.serverPath,
      serverLabel: this.serverLabel,
      requestTimeoutMs: REQUEST_TIMEOUT_MS,
      setProcess: (p) => {
        this.process = p;
      },
      setConnected: (v) => {
        this.connected = v;
      },
      onMessage: (line) => this.handleMessage(line),
      rejectAllPending: (msg) => {
        for (const [id, { reject }] of this.pendingRequests.entries()) {
          reject(new Error(msg));
          this.pendingRequests.delete(id);
        }
      },
    };
  }

  /**
   * Attempt a single connection via stdio (spawns server binary).
   * Delegates to {@link attemptStdioConnection} in process.ts.
   *
   * @returns Resolves when the spawn has completed (or rejects on spawn failure)
   */
  private async _attemptConnection(): Promise<void> {
    return attemptStdioConnection(this._spawnContext());
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
   * Handle incoming messages from MCP server (stdio mode only).
   * Delegates to {@link handleIncomingMessage} in process.ts.
   *
   * @param line - JSON message line from server
   */
  handleMessage(line: string): void {
    handleIncomingMessage(line, this.pendingRequests);
  }

  /**
   * Send a request to the MCP server
   *
   * @param method - RPC method name
   * @param params - Method parameters
   * @returns Server response
   */
  async sendRequest<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    if (this.gatewayUrl) {
      return (await sendGatewayRequest(method, params, this._gatewayContext())) as T;
    }

    const id = ++this.requestId;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return await new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

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
    return this.sendRequest<MCPToolResult>('tools/call', { name, arguments: args });
  }

  /**
   * Build a {@link ReconnectOps} adapter for reconnect.ts helpers.
   *
   * @returns Context adapter for reconnect/retry helpers
   */
  private _reconnectOps(): ReconnectOps {
    return {
      maxConnectionAttempts: this.maxConnectionAttempts,
      connectionRetryDelay: this.connectionRetryDelay,
      serverLabel: this.serverLabel,
      callTool: (n, a) => this.callTool(n, a),
      isConnected: () => this.connected,
      connect: () => this.connect(),
      setConnected: (v) => {
        this.connected = v;
      },
      getReconnectCount: () => this.reconnectCount,
      setReconnectCount: (n) => {
        this.reconnectCount = n;
      },
      getReconnectingPromise: () => this.reconnectingPromise,
      setReconnectingPromise: (p) => {
        this.reconnectingPromise = p;
      },
      getTimeoutCount: () => this.timeoutCount,
      setTimeoutCount: (n) => {
        this.timeoutCount = n;
      },
    };
  }

  /**
   * Attempt to reconnect to the MCP server.
   * Deduplicates concurrent calls — only one reconnect runs at a time.
   *
   * @returns Resolves when reconnect succeeds or all attempts are exhausted
   */
  async reconnect(): Promise<void> {
    return performReconnect(this._reconnectOps());
  }

  /**
   * Call an MCP tool with automatic retry on timeout or connection loss.
   * Reconnects automatically if the connection was lost between attempts.
   *
   * Only transient failures are retried (see `isRetriableError`). Non-retriable
   * errors — rate-limit (429), session-expired (401), and programmer errors such
   * as `TypeError` — are re-thrown immediately without consuming any retry budget.
   *
   * @param name - Tool name
   * @param args - Tool arguments (plain object, non-null, not an array)
   * @param maxRetries - Override the default retry count from options
   * @returns Tool execution result
   */
  async callToolWithRetry(
    name: string,
    args: object = {},
    maxRetries?: number
  ): Promise<MCPToolResult> {
    const retries = maxRetries ?? this.maxRetries;
    if (retries < 0) {
      throw new RangeError(`maxRetries must be >= 0, received ${retries}`);
    }
    return runWithRetry(name, args, retries, this._reconnectOps());
  }
}
