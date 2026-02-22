// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/EPMCPClient
 * @description Client for connecting to European-Parliament-MCP-Server.
 * Communicates via JSON-RPC 2.0 over stdio with retry logic.
 */
import { spawn } from 'child_process';
/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 30000;
/** Connection startup delay in milliseconds */
const CONNECTION_STARTUP_DELAY_MS = 500;
/**
 * MCP Client for European Parliament data access
 */
export class EuropeanParliamentMCPClient {
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
            this.process = spawn('node', [this.serverPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            let buffer = '';
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
            this.process.on('error', (_error) => {
                this.connected = false;
            });
            await new Promise((resolve) => setTimeout(resolve, CONNECTION_STARTUP_DELAY_MS));
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
     * @param args - Tool arguments
     * @returns Tool execution result
     */
    async callTool(name, args = {}) {
        return await this.sendRequest('tools/call', { name, arguments: args });
    }
    /**
     * Get Members of European Parliament
     *
     * @param options - Filter options
     * @returns List of MEPs
     */
    async getMEPs(options = {}) {
        return await this.callTool('get_meps', options);
    }
    /**
     * Get plenary sessions
     *
     * @param options - Filter options
     * @returns Plenary sessions data
     */
    async getPlenarySessions(options = {}) {
        try {
            return (await this.callTool('get_plenary_sessions', options));
        }
        catch (error) {
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
    async searchDocuments(options = {}) {
        try {
            return (await this.callTool('search_documents', options));
        }
        catch (error) {
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
    async getParliamentaryQuestions(options = {}) {
        try {
            return (await this.callTool('get_parliamentary_questions', options));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_parliamentary_questions not available:', message);
            return { content: [{ type: 'text', text: '{"questions": []}' }] };
        }
    }
    /**
     * Get detailed information about a specific MEP
     *
     * @param id - MEP identifier
     * @returns Detailed MEP information including biography, contact, and activities
     */
    async getMEPDetails(id) {
        try {
            return (await this.callTool('get_mep_details', { id }));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_mep_details not available:', message);
            return { content: [{ type: 'text', text: '{"mep": null}' }] };
        }
    }
    /**
     * Retrieve voting records with optional filters
     *
     * @param options - Filter options (mepId, sessionId, topic, dateFrom)
     * @returns Voting records data
     */
    async getVotingRecords(options = {}) {
        try {
            return (await this.callTool('get_voting_records', options));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_voting_records not available:', message);
            return { content: [{ type: 'text', text: '{"votes": []}' }] };
        }
    }
    /**
     * Get committee information by id or abbreviation
     *
     * @param options - Options with id or abbreviation
     * @returns Committee information
     */
    async getCommitteeInfo(options) {
        try {
            const { id, abbreviation } = options;
            let requestPayload = null;
            if (typeof id === 'string' && id.trim().length > 0) {
                requestPayload = { id: id.trim() };
            }
            else if (typeof abbreviation === 'string' && abbreviation.trim().length > 0) {
                requestPayload = { abbreviation: abbreviation.trim() };
            }
            if (requestPayload === null) {
                console.warn('get_committee_info called without valid identifier (non-empty id or abbreviation)');
                return { content: [{ type: 'text', text: '{"committee": null}' }] };
            }
            return (await this.callTool('get_committee_info', requestPayload));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_committee_info not available:', message);
            return { content: [{ type: 'text', text: '{"committee": null}' }] };
        }
    }
    /**
     * Analyze voting behavior patterns for an MEP
     *
     * @param options - Analysis options (mepId required, dateFrom, compareWithGroup)
     * @returns Voting pattern analysis
     */
    async analyzeVotingPatterns(options) {
        try {
            return (await this.callTool('analyze_voting_patterns', options));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('analyze_voting_patterns not available:', message);
            return { content: [{ type: 'text', text: '{"patterns": null}' }] };
        }
    }
    /**
     * Track a legislative procedure by its identifier
     *
     * @param procedureId - Legislative procedure identifier
     * @returns Procedure status and timeline
     */
    async trackLegislation(procedureId) {
        try {
            return (await this.callTool('track_legislation', { procedureId }));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('track_legislation not available:', message);
            return { content: [{ type: 'text', text: '{"procedure": null}' }] };
        }
    }
    /**
     * Generate an analytical report
     *
     * @param options - Report options (reportType required, subjectId, dateFrom)
     * @returns Generated report data
     */
    async generateReport(options) {
        try {
            return (await this.callTool('generate_report', options));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('generate_report not available:', message);
            return { content: [{ type: 'text', text: '{"report": null}' }] };
        }
    }
}
// Singleton instance management
let clientInstance = null;
/**
 * Get or create singleton MCP client instance
 *
 * @param options - Client options
 * @returns Connected MCP client
 */
export async function getEPMCPClient(options = {}) {
    if (!clientInstance) {
        clientInstance = new EuropeanParliamentMCPClient(options);
        await clientInstance.connect();
    }
    return clientInstance;
}
/**
 * Close and cleanup singleton MCP client
 */
export async function closeEPMCPClient() {
    if (clientInstance) {
        clientInstance.disconnect();
        clientInstance = null;
    }
}
//# sourceMappingURL=ep-mcp-client.js.map