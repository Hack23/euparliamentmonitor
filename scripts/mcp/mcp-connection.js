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
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
/** npm binary name for the European Parliament MCP server */
const BINARY_NAME = 'european-parliament-mcp-server';
/** Platform-specific binary filename (Windows uses .cmd shim) */
const BINARY_FILE = process.platform === 'win32' ? `${BINARY_NAME}.cmd` : BINARY_NAME;
/** Default binary resolved from node_modules/.bin relative to this file's compiled location */
const DEFAULT_SERVER_BINARY = resolve(dirname(fileURLToPath(import.meta.url)), `../../node_modules/.bin/${BINARY_FILE}`);
/** Request timeout in milliseconds — EU Parliament API responses commonly take 30+ seconds */
const REQUEST_TIMEOUT_MS = 60000;
/** Connection startup delay in milliseconds */
const CONNECTION_STARTUP_DELAY_MS = 500;
/**
 * Parse an SSE (Server-Sent Events) response body to extract the first valid JSON-RPC message.
 *
 * The MCP Streamable HTTP protocol sends JSON-RPC responses as SSE `data:` lines.
 * This function returns the **first** successfully parsed JSON-RPC message; any
 * subsequent `data:` lines are ignored. This matches the MCP protocol expectation
 * of one JSON-RPC response per HTTP request/response cycle.
 *
 * @param body - Raw SSE response text (may contain multiple lines including `event:` and `data:`)
 * @returns The first valid JSON-RPC response found, or null if no valid message exists
 */
export function parseSSEResponse(body) {
    const lines = body.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.slice(5).trim();
            if (jsonStr) {
                try {
                    return JSON.parse(jsonStr);
                }
                catch {
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
    serverPath;
    connected;
    process;
    requestId;
    pendingRequests;
    connectionAttempts;
    maxConnectionAttempts;
    connectionRetryDelay;
    /** Gateway URL for HTTP transport mode */
    gatewayUrl;
    /** API key for gateway authentication */
    gatewayApiKey;
    /** MCP session ID returned by the gateway */
    mcpSessionId;
    constructor(options = {}) {
        this.serverPath =
            options.serverPath ?? process.env['EP_MCP_SERVER_PATH'] ?? DEFAULT_SERVER_BINARY;
        this.connected = false;
        this.process = null;
        this.requestId = 0;
        this.pendingRequests = new Map();
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = options.maxConnectionAttempts ?? 3;
        this.connectionRetryDelay = options.connectionRetryDelay ?? 1000;
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
     * Connect to the MCP server with retry logic
     */
    async connect() {
        if (this.connected) {
            return;
        }
        if (this.gatewayUrl) {
            console.log('🔌 Connecting to European Parliament MCP Server via gateway...');
            console.log(`   Gateway URL: ${this.gatewayUrl}`);
        }
        else {
            console.log('🔌 Connecting to European Parliament MCP Server...');
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
                this.connectionAttempts = 0; // Reset on success
                return;
            }
            catch (error) {
                this.connectionAttempts++;
                if (this.connectionAttempts < this.maxConnectionAttempts) {
                    const delay = this.connectionRetryDelay * Math.pow(2, this.connectionAttempts - 1);
                    console.warn(`⚠️ Connection attempt ${this.connectionAttempts} failed. Retrying in ${delay}ms...`);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
                else {
                    console.error('❌ Failed to connect to MCP server after', this.maxConnectionAttempts, 'attempts');
                    throw error;
                }
            }
        }
    }
    /**
     * Validate a gateway response body, throwing on JSON-RPC errors.
     *
     * @param contentType - Response content-type header
     * @param body - Raw response body text
     */
    _validateGatewayResponseBody(contentType, body) {
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
            const jsonResponse = JSON.parse(body);
            if (jsonResponse.error) {
                throw new Error(jsonResponse.error.message ?? 'MCP gateway initialization error');
            }
        }
        catch (e) {
            // Non-JSON body is acceptable for init — some gateways return empty/plain text
            if (e instanceof Error && e.message.includes('MCP gateway')) {
                throw e;
            }
        }
    }
    /**
     * Attempt a single connection via MCP Gateway (HTTP transport)
     */
    async _attemptGatewayConnection() {
        try {
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json, text/event-stream',
            };
            if (this.gatewayApiKey) {
                headers['Authorization'] = `Bearer ${this.gatewayApiKey}`;
            }
            const initRequest = {
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
                throw new Error(`Gateway returned ${response.status}: ${response.statusText}`);
            }
            const sessionId = response.headers.get('mcp-session-id');
            if (sessionId) {
                this.mcpSessionId = sessionId;
            }
            // Parse and validate the initialization response body
            const contentType = response.headers.get('content-type') ?? '';
            const body = await response.text();
            this._validateGatewayResponseBody(contentType, body);
            this.connected = true;
            console.log('✅ Connected to European Parliament MCP Server via gateway');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('❌ Failed to connect to MCP gateway:', message);
            throw error;
        }
    }
    /**
     * Attempt a single connection via stdio (spawns server binary)
     */
    async _attemptConnection() {
        try {
            const isJavaScriptFile = this.serverPath.toLowerCase().endsWith('.js');
            const command = isJavaScriptFile ? process.execPath : this.serverPath;
            const args = isJavaScriptFile ? [this.serverPath] : [];
            this.process = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
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
            console.log('✅ Connected to European Parliament MCP Server');
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
            if (message.id && this.pendingRequests.has(message.id)) {
                const pending = this.pendingRequests.get(message.id);
                this.pendingRequests.delete(message.id);
                if (message.error) {
                    pending.reject(new Error(message.error.message ?? 'MCP server error'));
                }
                else {
                    pending.resolve(message.result);
                }
            }
            else if (!message.id && message.method) {
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
     * Send a request via MCP Gateway (HTTP transport)
     *
     * @param method - RPC method name
     * @param params - Method parameters
     * @returns Server response
     */
    async _sendGatewayRequest(method, params = {}) {
        const id = ++this.requestId;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params,
        };
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
        };
        if (this.gatewayApiKey) {
            headers['Authorization'] = `Bearer ${this.gatewayApiKey}`;
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
        const jsonResponse = JSON.parse(body);
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
    async sendRequest(method, params = {}) {
        if (!this.connected) {
            throw new Error('Not connected to MCP server');
        }
        if (this.gatewayUrl) {
            return await this._sendGatewayRequest(method, params);
        }
        const id = ++this.requestId;
        const request = {
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
        return (await this.sendRequest('tools/call', { name, arguments: args }));
    }
}
//# sourceMappingURL=mcp-connection.js.map