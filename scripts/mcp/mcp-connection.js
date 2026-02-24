// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/MCPConnection
 * @description Base MCP client — JSON-RPC 2.0 transport over stdio with retry logic.
 * Handles connection lifecycle, message framing, and request/response correlation.
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
 * Base MCP connection managing JSON-RPC 2.0 transport over stdio.
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
     * Connect to the MCP server with retry logic
     */
    async connect() {
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
     * Attempt a single connection
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
    }
    /**
     * Handle incoming messages from MCP server
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