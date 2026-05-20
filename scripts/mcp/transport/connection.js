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
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MCPRateLimitError, MCPSessionExpiredError } from './errors.js';
import { isRetriableError, RECONNECT_MAX_DELAY_MS } from './retry-policy.js';
import { attemptGatewayConnection, sendGatewayRequest } from './gateway.js';
/** npm binary name for the European Parliament MCP server */
const BINARY_NAME = 'european-parliament-mcp-server';
/** Platform-specific binary filename (Windows uses .cmd shim) */
const BINARY_FILE = process.platform === 'win32' ? `${BINARY_NAME}.cmd` : BINARY_NAME;
/** Default binary resolved from node_modules/.bin relative to this file's compiled location */
const DEFAULT_SERVER_BINARY = resolve(dirname(fileURLToPath(import.meta.url)), `../../../node_modules/.bin/${BINARY_FILE}`);
/** Default request timeout in milliseconds — EU Parliament API responses commonly take 30-120+ seconds for large datasets */
const DEFAULT_REQUEST_TIMEOUT_MS = 180_000;
/**
 * Effective request timeout, configurable via `EP_REQUEST_TIMEOUT_MS` env var.
 * This keeps the client-side timeout aligned with the MCP server timeout set
 * in workflow configs and copilot-mcp.json.
 */
const REQUEST_TIMEOUT_MS = (() => {
    const envVal = process.env['EP_REQUEST_TIMEOUT_MS'];
    if (envVal) {
        const parsed = Number(envVal);
        if (!Number.isNaN(parsed) && parsed > 0)
            return parsed;
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
    serverPath;
    connected;
    process;
    requestId;
    pendingRequests;
    connectionAttempts;
    maxConnectionAttempts;
    connectionRetryDelay;
    maxRetries;
    reconnectingPromise;
    timeoutCount;
    reconnectCount;
    /** Gateway URL for HTTP transport mode */
    gatewayUrl;
    /** API key for gateway authentication */
    gatewayApiKey;
    /** MCP session ID returned by the gateway */
    mcpSessionId;
    /** Human-readable server name for log messages */
    serverLabel;
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
    constructor(options = {}) {
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
    isConnected() {
        return this.connected;
    }
    /**
     * Check if using gateway HTTP transport
     *
     * @returns True if gateway mode is active
     */
    isGatewayMode() {
        return Boolean(this.gatewayUrl);
    }
    /**
     * Get the configured gateway URL
     *
     * @returns Gateway URL or null if using stdio transport
     */
    getGatewayUrl() {
        return this.gatewayUrl;
    }
    /**
     * Get the configured gateway API key
     *
     * @returns Gateway API key or null if not set
     */
    getGatewayApiKey() {
        return this.gatewayApiKey;
    }
    /**
     * Get the current MCP session ID
     *
     * @returns Session ID returned by the gateway, or null if not yet connected
     */
    getMcpSessionId() {
        return this.mcpSessionId;
    }
    /**
     * Get connection health metrics for telemetry
     *
     * @returns Object with timeout count, reconnection count, and current connection status
     */
    getConnectionHealth() {
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
    _computeConnectionDelay(error, attempt) {
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
    _handleConnectionAttemptError(error) {
        if (error instanceof MCPSessionExpiredError) {
            throw error;
        }
        this.connectionAttempts++;
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
            console.error('❌ Failed to connect to MCP server after', this.maxConnectionAttempts, 'attempts');
            throw error;
        }
        return this._computeConnectionDelay(error, this.connectionAttempts);
    }
    /**
     * Connect to the MCP server with retry logic
     */
    async connect() {
        if (this.connected) {
            return;
        }
        if (this.gatewayUrl) {
            console.log(`🔌 Connecting to ${this.serverLabel} via gateway...`);
            console.log(`   Gateway URL: ${this.gatewayUrl}`);
        }
        else {
            console.log(`🔌 Connecting to ${this.serverLabel}...`);
        }
        this.connectionAttempts = 0;
        while (this.connectionAttempts < this.maxConnectionAttempts) {
            try {
                if (this.gatewayUrl) {
                    await this._attemptGatewayConnection();
                }
                else {
                    await this._attemptConnection();
                }
                this.connectionAttempts = 0;
                return;
            }
            catch (error) {
                const delay = this._handleConnectionAttemptError(error);
                console.warn(`⚠️ Connection attempt ${this.connectionAttempts} failed. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    /**
     * Build a {@link GatewayContext} adapter for delegating to gateway helpers.
     *
     * @returns A context adapter exposing the connection-level fields the
     *   gateway helpers need (URL, API key, session ID accessors, request-ID
     *   counter, connection-state setter).
     */
    _gatewayContext() {
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
    /** Attempt a single connection via MCP Gateway (HTTP transport). */
    async _attemptGatewayConnection() {
        await attemptGatewayConnection(this._gatewayContext());
    }
    /**
     * Attempt a single connection via stdio (spawns server binary)
     */
    async _attemptConnection() {
        try {
            const isJavaScriptFile = this.serverPath.toLowerCase().endsWith('.js');
            const command = isJavaScriptFile ? process.execPath : this.serverPath;
            const args = isJavaScriptFile ? [this.serverPath] : [];
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
            let startupError = null;
            this.process.stdout?.on('data', (data) => {
                buffer += data.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    if (line.trim()) {
                        this.handleMessage(line);
                    }
                }
            });
            this.process.stderr?.on('data', (data) => {
                const message = data.toString().trim();
                if (message) {
                    console.error(`MCP Server: ${message}`);
                }
            });
            this.process.on('close', (code) => {
                console.log(`MCP Server exited with code ${code}`);
                this.connected = false;
                for (const [id, { reject }] of this.pendingRequests.entries()) {
                    reject(new Error('MCP server connection closed'));
                    this.pendingRequests.delete(id);
                }
            });
            this.process.on('error', (err) => {
                startupError = err;
                this.connected = false;
            });
            await new Promise((resolve) => setTimeout(resolve, CONNECTION_STARTUP_DELAY_MS));
            if (startupError) {
                throw startupError;
            }
            this.connected = true;
            console.log(`✅ Connected to ${this.serverLabel}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('❌ Failed to spawn MCP server:', message);
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
        this.mcpSessionId = null;
    }
    /**
     * Handle incoming messages from MCP server (stdio mode only)
     *
     * @param line - JSON message line from server
     */
    handleMessage(line) {
        try {
            const message = JSON.parse(line);
            if (message.id !== null && message.id !== undefined && this.pendingRequests.has(message.id)) {
                const pending = this.pendingRequests.get(message.id);
                if (pending) {
                    this.pendingRequests.delete(message.id);
                    if (message.error) {
                        pending.reject(new Error(message.error.message ?? 'MCP server error'));
                    }
                    else {
                        pending.resolve(message.result);
                    }
                }
                else {
                    this.pendingRequests.delete(message.id);
                    console.error(`MCP pending request ${String(message.id)} vanished before handling`);
                }
            }
            else if ((message.id === null || message.id === undefined) && message.method) {
                console.log(`MCP Notification: ${message.method}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Error parsing MCP message:', errorMessage);
            console.error('Problematic line:', line);
        }
    }
    /**
     * Send a request via MCP Gateway (HTTP transport). Delegates to the
     * gateway helper module.
     *
     * @param method - RPC method name
     * @param params - Method parameters
     * @returns Server response result payload
     */
    async _sendGatewayRequest(method, params = {}) {
        return sendGatewayRequest(method, params, this._gatewayContext());
    }
    /**
     * Send a request to the MCP server
     *
     * @param method - RPC method name
     * @param params - Method parameters
     * @returns Server response
     */
    async sendRequest(method, params = {}) {
        if (!this.connected) {
            throw new Error('Not connected to MCP server');
        }
        if (this.gatewayUrl) {
            return (await this._sendGatewayRequest(method, params));
        }
        const id = ++this.requestId;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params,
        };
        return await new Promise((resolve, reject) => {
            this.pendingRequests.set(id, {
                resolve: resolve,
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
    async listTools() {
        return await this.sendRequest('tools/list');
    }
    /**
     * Call an MCP tool
     *
     * @param name - Tool name
     * @param args - Tool arguments (must be a plain object, non-null, not an array)
     * @returns Tool execution result
     */
    async callTool(name, args = {}) {
        if (args === null || Array.isArray(args) || typeof args !== 'object') {
            throw new TypeError('MCP tool arguments must be a plain object (non-null object, not an array or function)');
        }
        return this.sendRequest('tools/call', { name, arguments: args });
    }
    /**
     * Attempt to reconnect to the MCP server with exponential back-off.
     * Concurrent callers await the same in-flight reconnect instead of no-oping,
     * ensuring the connection is re-established before all waiting callers continue.
     *
     * @returns Promise that resolves when reconnection succeeds or all attempts are exhausted
     */
    async reconnect() {
        if (this.reconnectingPromise !== null) {
            return this.reconnectingPromise;
        }
        this.reconnectCount++;
        console.log(`🔄 Reconnecting to ${this.serverLabel} (attempt ${this.reconnectCount})...`);
        this.reconnectingPromise = this._doReconnect();
        try {
            await this.reconnectingPromise;
        }
        finally {
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
    async _doReconnect() {
        const normalizedMaxAttempts = Math.max(1, this.maxConnectionAttempts);
        const attemptIndex = Math.min(Math.max(0, this.reconnectCount - 1), normalizedMaxAttempts - 1);
        const delay = Math.min(this.connectionRetryDelay * Math.pow(2, attemptIndex), RECONNECT_MAX_DELAY_MS);
        await new Promise((r) => setTimeout(r, delay));
        try {
            this.connected = false;
            await this.connect();
        }
        catch (error) {
            console.error(`❌ Reconnection to ${this.serverLabel} failed: ${error instanceof Error ? error.message : String(error)}`);
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
    async _handleRetryAttempt(lastError, attempt, retries) {
        if (lastError.message.toLowerCase().includes('timeout')) {
            this.timeoutCount++;
            console.warn(`⏱️ Request timeout (total: ${this.timeoutCount}), retrying ${attempt + 1}/${retries}...`);
        }
        else {
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
    async callToolWithRetry(name, args = {}, maxRetries) {
        const retries = maxRetries ?? this.maxRetries;
        if (retries < 0) {
            throw new RangeError(`maxRetries must be >= 0, received ${retries}`);
        }
        let lastError = new Error(`Failed to call tool '${name}' after ${retries} retries`);
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                return await this.callTool(name, args);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (!isRetriableError(lastError))
                    throw lastError;
                if (attempt === retries)
                    break;
                await this._handleRetryAttempt(lastError, attempt, retries);
            }
        }
        throw lastError;
    }
}
//# sourceMappingURL=connection.js.map