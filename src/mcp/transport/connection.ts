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

import { spawn, type ChildProcess } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  MCPClientOptions,
  MCPToolResult,
  JSONRPCRequest,
  JSONRPCResponse,
  PendingRequest,
} from '../../types/index.js';
import { MCPSessionExpiredError, MCPRateLimitError } from './errors.js';
import {
  parseRetryAfterMs,
  isRetriableError,
  formatRetryAfter,
  RECONNECT_MAX_DELAY_MS,
  RETRY_AFTER_HEADER,
  RATE_LIMIT_MSG,
} from './retry-policy.js';
import { parseSSEResponse } from './sse-parser.js';

/** npm binary name for the European Parliament MCP server */
const BINARY_NAME = 'european-parliament-mcp-server';

/** Platform-specific binary filename (Windows uses .cmd shim) */
const BINARY_FILE = process.platform === 'win32' ? `${BINARY_NAME}.cmd` : BINARY_NAME;

/** Default binary resolved from node_modules/.bin relative to this file's compiled location */
const DEFAULT_SERVER_BINARY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  `../../../node_modules/.bin/${BINARY_FILE}`
);

/** Default request timeout in milliseconds — EU Parliament API responses commonly take 30-120+ seconds for large datasets */
const DEFAULT_REQUEST_TIMEOUT_MS = 180_000;

/**
 * Effective request timeout, configurable via `EP_REQUEST_TIMEOUT_MS` env var.
 * This keeps the client-side timeout aligned with the MCP server timeout set
 * in workflow configs and copilot-mcp.json.
 */
const REQUEST_TIMEOUT_MS: number = (() => {
  const envVal = process.env['EP_REQUEST_TIMEOUT_MS'];
  if (envVal) {
    const parsed = Number(envVal);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_REQUEST_TIMEOUT_MS;
})();

/** Connection startup delay in milliseconds */
const CONNECTION_STARTUP_DELAY_MS = 500;

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
   * Compute the delay before the next connection attempt.
   * Respects `Retry-After` carried by {@link MCPRateLimitError}; otherwise uses
   * exponential back-off (`connectionRetryDelay * 2^(attempt - 1)`).
   *
   * @param error - The error from the failed attempt
   * @param attempt - Number of attempts made so far (1-indexed)
   * @returns Delay in milliseconds
   */
  private _computeConnectionDelay(error: unknown, attempt: number): number {
    if (error instanceof MCPRateLimitError && error.retryAfterMs > 0) {
      return error.retryAfterMs;
    }
    return this.connectionRetryDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Handle a single connection attempt error: re-throw immediately for non-retriable errors
   * (e.g. session expiry), increment the attempt counter, and return the delay to wait
   * before the next attempt. Throws when the maximum attempts have been exhausted.
   *
   * @param error - The error from the failed attempt
   * @returns Delay in milliseconds to wait before the next attempt
   */
  private _handleConnectionAttemptError(error: unknown): number {
    if (error instanceof MCPSessionExpiredError) {
      throw error;
    }
    this.connectionAttempts++;
    if (this.connectionAttempts >= this.maxConnectionAttempts) {
      console.error(
        '❌ Failed to connect to MCP server after',
        this.maxConnectionAttempts,
        'attempts'
      );
      throw error;
    }
    return this._computeConnectionDelay(error, this.connectionAttempts);
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
          await this._attemptGatewayConnection();
        } else {
          await this._attemptConnection();
        }
        this.connectionAttempts = 0;
        return;
      } catch (error) {
        const delay = this._handleConnectionAttemptError(error);
        console.warn(
          `⚠️ Connection attempt ${this.connectionAttempts} failed. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Validate a gateway response body, throwing on JSON-RPC errors.
   *
   * @param contentType - Response content-type header
   * @param body - Raw response body text
   */
  private _validateGatewayResponseBody(contentType: string, body: string): void {
    if (contentType.includes('text/event-stream')) {
      const parsed = parseSSEResponse(body);
      if (parsed?.error) {
        throw new Error(parsed.error.message ?? 'MCP gateway initialization error');
      }
      return;
    }

    if (!body) {
      return;
    }

    try {
      const jsonResponse = JSON.parse(body) as JSONRPCResponse;
      if (jsonResponse.error) {
        throw new Error(jsonResponse.error.message ?? 'MCP gateway initialization error');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('MCP gateway')) {
        throw e;
      }
    }
  }

  /**
   * Build the Authorization header value for gateway requests.
   * Keys that already contain a valid RFC 7235 scheme token followed by
   * whitespace (e.g. "Bearer …", "Token …", "AWS4-HMAC-SHA256 …") are passed
   * through unchanged. Otherwise the raw key is sent directly unless
   * EP_MCP_GATEWAY_AUTH_SCHEME is set to a valid token, in which case that
   * scheme prefix is prepended. The EP MCP gateway expects raw-token auth by
   * default (no "Bearer " prefix).
   *
   * @param apiKey - Raw or pre-prefixed gateway API key
   * @returns The full Authorization header value, or empty string for empty keys
   * @throws {Error} When the API key contains CR or LF characters (header injection risk)
   */
  private _buildAuthorizationHeader(apiKey: string): string {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      return '';
    }

    if (/[\r\n]/.test(trimmedKey)) {
      throw new Error(
        'Invalid gateway API key: control characters (CR/LF) are not allowed in Authorization header values.'
      );
    }

    const tokenRegex = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

    const firstSpaceIndex = trimmedKey.indexOf(' ');
    if (firstSpaceIndex > 0) {
      const possibleScheme = trimmedKey.slice(0, firstSpaceIndex);
      if (tokenRegex.test(possibleScheme)) {
        return trimmedKey;
      }
    }

    const rawScheme = typeof process !== 'undefined' && process.env?.['EP_MCP_GATEWAY_AUTH_SCHEME'];
    const scheme = typeof rawScheme === 'string' ? rawScheme.trim() : '';

    if (scheme && tokenRegex.test(scheme)) {
      return `${scheme} ${trimmedKey}`;
    }

    return trimmedKey;
  }

  /**
   * Attempt a single connection via MCP Gateway (HTTP transport)
   */
  private async _attemptGatewayConnection(): Promise<void> {
    if (!this.gatewayUrl) {
      throw new Error(
        'Gateway URL not configured. Set the EP_MCP_GATEWAY_URL environment variable or provide the gatewayUrl constructor option.'
      );
    }
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      };
      if (this.gatewayApiKey) {
        headers['Authorization'] = this._buildAuthorizationHeader(this.gatewayApiKey);
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

      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(initRequest),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        this._throwGatewayResponseError(response);
      }

      const sessionId = response.headers.get('mcp-session-id');
      if (sessionId) {
        this.mcpSessionId = sessionId;
      }

      const contentType = response.headers.get('content-type') ?? '';
      const body = await response.text();
      this._validateGatewayResponseBody(contentType, body);

      this.connected = true;
      console.log(`✅ Connected to ${this.serverLabel} via gateway`);
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

      const childEnv = { ...process.env };
      const effectiveTimeoutMs = childEnv['EP_REQUEST_TIMEOUT_MS']
        ? Number(childEnv['EP_REQUEST_TIMEOUT_MS'])
        : REQUEST_TIMEOUT_MS;
      childEnv['EP_REQUEST_TIMEOUT_MS'] = String(effectiveTimeoutMs);

      if (!isJavaScriptFile) {
        args.push('--timeout', String(effectiveTimeoutMs));
      }

      this.process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: childEnv,
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
      console.log(`✅ Connected to ${this.serverLabel}`);
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

      if (message.id !== null && message.id !== undefined && this.pendingRequests.has(message.id)) {
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          this.pendingRequests.delete(message.id);
          if (message.error) {
            pending.reject(new Error(message.error.message ?? 'MCP server error'));
          } else {
            pending.resolve(message.result);
          }
        } else {
          this.pendingRequests.delete(message.id);
          console.error(`MCP pending request ${String(message.id)} vanished before handling`);
        }
      } else if ((message.id === null || message.id === undefined) && message.method) {
        console.log(`MCP Notification: ${message.method}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error parsing MCP message:', errorMessage);
      console.error('Problematic line:', line);
    }
  }

  /**
   * Throw an appropriate error for a non-OK gateway response.
   * Extracted to keep `_sendGatewayRequest` within cognitive-complexity limits.
   *
   * @param response - The non-OK fetch Response
   */
  private _throwGatewayResponseError(response: Response): never {
    if (response.status === 401) {
      this.mcpSessionId = null;
      this.connected = false;
      throw new MCPSessionExpiredError(response.statusText);
    }
    if (response.status === 429) {
      const rawRetryAfter =
        response.headers.get(RETRY_AFTER_HEADER) ?? response.headers.get('Retry-After');
      const retryAfter = (rawRetryAfter ?? '').trim();
      if (retryAfter !== '') {
        const retryMessage = formatRetryAfter(retryAfter);
        const retryAfterMs = parseRetryAfterMs(retryAfter);
        console.warn(`⏳ ${RATE_LIMIT_MSG} ${retryMessage}`);
        throw new MCPRateLimitError(retryAfterMs, `${RATE_LIMIT_MSG} ${retryMessage}`);
      }
      const statusText = response.statusText || 'Too Many Requests';
      throw new MCPRateLimitError(
        0,
        `${RATE_LIMIT_MSG} (status ${response.status} ${statusText}; ${RETRY_AFTER_HEADER}/Retry-After header missing)`
      );
    }
    throw new Error(`Gateway error ${response.status}: ${response.statusText}`);
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
    if (!this.gatewayUrl) {
      throw new Error(
        'Gateway URL not configured. Set EP_MCP_GATEWAY_URL or provide gatewayUrl in MCP client options.'
      );
    }
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
      headers['Authorization'] = this._buildAuthorizationHeader(this.gatewayApiKey);
    }
    if (this.mcpSessionId) {
      headers['Mcp-Session-Id'] = this.mcpSessionId;
    }

    const response = await fetch(this.gatewayUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      this._throwGatewayResponseError(response);
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
  async sendRequest<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    if (this.gatewayUrl) {
      return (await this._sendGatewayRequest(method, params)) as T;
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
   * Attempt to reconnect to the MCP server with exponential back-off.
   * Concurrent callers await the same in-flight reconnect instead of no-oping,
   * ensuring the connection is re-established before all waiting callers continue.
   *
   * @returns Promise that resolves when reconnection succeeds or all attempts are exhausted
   */
  private async reconnect(): Promise<void> {
    if (this.reconnectingPromise !== null) {
      return this.reconnectingPromise;
    }
    this.reconnectCount++;
    console.log(`🔄 Reconnecting to ${this.serverLabel} (attempt ${this.reconnectCount})...`);
    this.reconnectingPromise = this._doReconnect();
    try {
      await this.reconnectingPromise;
    } finally {
      this.reconnectingPromise = null;
    }
  }

  /**
   * Internal reconnect helper.
   *
   * Waits for an exponential back-off delay derived from the current
   * `reconnectCount`, then delegates to `connect()` which handles its own
   * retry loop. This avoids composing N×N attempts.
   *
   * @returns Promise that resolves when reconnection succeeds or logs on failure
   */
  private async _doReconnect(): Promise<void> {
    const normalizedMaxAttempts = Math.max(1, this.maxConnectionAttempts);
    const attemptIndex = Math.min(Math.max(0, this.reconnectCount - 1), normalizedMaxAttempts - 1);
    const delay = Math.min(
      this.connectionRetryDelay * Math.pow(2, attemptIndex),
      RECONNECT_MAX_DELAY_MS
    );
    await new Promise((r) => setTimeout(r, delay));
    try {
      this.connected = false;
      await this.connect();
    } catch (error) {
      console.error(
        `❌ Reconnection to ${this.serverLabel} failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Log a retry warning and, if disconnected, attempt to reconnect before waiting.
   *
   * @param lastError - The error from the failed attempt
   * @param attempt - Zero-based current attempt index
   * @param retries - Total retry count
   * @returns Promise that resolves after logging, optional reconnect, and inter-retry delay
   */
  private async _handleRetryAttempt(
    lastError: Error,
    attempt: number,
    retries: number
  ): Promise<void> {
    if (lastError.message.toLowerCase().includes('timeout')) {
      this.timeoutCount++;
      console.warn(
        `⏱️ Request timeout (total: ${this.timeoutCount}), retrying ${attempt + 1}/${retries}...`
      );
    } else {
      console.warn(`⚠️ Request failed, retrying ${attempt + 1}/${retries}: ${lastError.message}`);
    }
    if (!this.connected) {
      await this.reconnect();
    }
    await new Promise((r) => setTimeout(r, this.connectionRetryDelay * (attempt + 1)));
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
    let lastError: Error = new Error(`Failed to call tool '${name}' after ${retries} retries`);
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.callTool(name, args);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (!isRetriableError(lastError)) throw lastError;
        if (attempt === retries) break;
        await this._handleRetryAttempt(lastError, attempt, retries);
      }
    }
    throw lastError;
  }
}
