// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/EPMCPClient
 * @description Client for connecting to European-Parliament-MCP-Server.
 * Communicates via JSON-RPC 2.0 over stdio with retry logic.
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
/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 30000;
/** Connection startup delay in milliseconds */
const CONNECTION_STARTUP_DELAY_MS = 500;
/** Fallback payload for analyze_legislative_effectiveness when validation fails or tool is unavailable */
const EFFECTIVENESS_FALLBACK = '{"effectiveness": null}';
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
    /**
     * Get Members of European Parliament
     *
     * @param options - Filter options
     * @returns List of MEPs
     */
    async getMEPs(options = {}) {
        try {
            return await this.callTool('get_meps', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_meps not available:', message);
            return { content: [{ type: 'text', text: '{"meps": []}' }] };
        }
    }
    /**
     * Get plenary sessions
     *
     * @param options - Filter options
     * @returns Plenary sessions data
     */
    async getPlenarySessions(options = {}) {
        try {
            return await this.callTool('get_plenary_sessions', options);
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
     * @param options - Search options (normalizes `keyword` to `query` if `query` is absent)
     * @returns Search results
     */
    async searchDocuments(options = {}) {
        try {
            const { keyword, ...rest } = options;
            const normalizedOptions = { ...rest };
            if (normalizedOptions['query'] === undefined && keyword !== undefined) {
                const trimmed = String(keyword).trim();
                if (trimmed.length > 0) {
                    normalizedOptions['query'] = trimmed;
                }
            }
            return await this.callTool('search_documents', normalizedOptions);
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
     * @param options - Filter options. `dateFrom` is mapped to `startDate` per the tool schema.
     *   `dateTo` is intentionally ignored because the `get_parliamentary_questions` tool schema
     *   only supports `startDate` as a date filter; passing `dateTo` would have no effect.
     * @returns Parliamentary questions data
     */
    async getParliamentaryQuestions(options = {}) {
        try {
            const { dateFrom, dateTo: _dateTo, ...rest } = options;
            const toolOptions = { ...rest };
            if (toolOptions['startDate'] === undefined && dateFrom !== undefined) {
                toolOptions['startDate'] = dateFrom;
            }
            return await this.callTool('get_parliamentary_questions', toolOptions);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_parliamentary_questions not available:', message);
            return { content: [{ type: 'text', text: '{"questions": []}' }] };
        }
    }
    /**
     * Get committee information
     *
     * @param options - Filter options
     * @returns Committee info data
     */
    async getCommitteeInfo(options = {}) {
        try {
            return await this.callTool('get_committee_info', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_committee_info not available:', message);
            return { content: [{ type: 'text', text: '{"committees": []}' }] };
        }
    }
    /**
     * Monitor legislative pipeline
     *
     * @param options - Filter options
     * @returns Legislative pipeline data
     */
    async monitorLegislativePipeline(options = {}) {
        try {
            return await this.callTool('monitor_legislative_pipeline', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('monitor_legislative_pipeline not available:', message);
            return { content: [{ type: 'text', text: '{"procedures": []}' }] };
        }
    }
    /**
     * Analyze legislative effectiveness of an MEP or committee
     *
     * @param options - Options including subjectType and subjectId
     * @returns Legislative effectiveness data
     */
    async analyzeLegislativeEffectiveness(options = {}) {
        const subjectType = options.subjectType;
        const subjectId = options.subjectId;
        if (subjectType !== 'MEP' && subjectType !== 'COMMITTEE') {
            console.warn('analyze_legislative_effectiveness called without valid subjectType (must be "MEP" or "COMMITTEE")');
            return { content: [{ type: 'text', text: EFFECTIVENESS_FALLBACK }] };
        }
        if (typeof subjectId !== 'string' || subjectId.trim().length === 0) {
            console.warn('analyze_legislative_effectiveness called without valid subjectId (non-empty string required)');
            return { content: [{ type: 'text', text: EFFECTIVENESS_FALLBACK }] };
        }
        const trimmedSubjectId = subjectId.trim();
        try {
            return await this.callTool('analyze_legislative_effectiveness', {
                ...options,
                subjectType,
                subjectId: trimmedSubjectId,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('analyze_legislative_effectiveness not available:', message);
            return { content: [{ type: 'text', text: EFFECTIVENESS_FALLBACK }] };
        }
    }
    /**
     * Assess MEP influence using 5-dimension scoring model
     *
     * @param options - Options including required mepId and optional date range
     * @returns MEP influence score and breakdown
     */
    async assessMEPInfluence(options) {
        const trimmedMepId = options && typeof options.mepId === 'string' ? options.mepId.trim() : '';
        if (trimmedMepId.length === 0) {
            console.warn('assess_mep_influence called without valid mepId (non-empty string required)');
            return { content: [{ type: 'text', text: '{"influence": {}}' }] };
        }
        try {
            return await this.callTool('assess_mep_influence', { ...options, mepId: trimmedMepId });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('assess_mep_influence not available:', message);
            return { content: [{ type: 'text', text: '{"influence": {}}' }] };
        }
    }
    /**
     * Analyze coalition dynamics and cohesion
     *
     * @param options - Options including optional political groups and date range
     * @returns Coalition cohesion and stress analysis
     */
    async analyzeCoalitionDynamics(options = {}) {
        try {
            return await this.callTool('analyze_coalition_dynamics', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('analyze_coalition_dynamics not available:', message);
            return { content: [{ type: 'text', text: '{"coalitions": []}' }] };
        }
    }
    /**
     * Detect voting anomalies and party defections
     *
     * @param options - Options including optional MEP id, political group, and date
     * @returns Anomaly detection results
     */
    async detectVotingAnomalies(options = {}) {
        try {
            return await this.callTool('detect_voting_anomalies', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('detect_voting_anomalies not available:', message);
            return { content: [{ type: 'text', text: '{"anomalies": []}' }] };
        }
    }
    /**
     * Compare political groups across dimensions
     *
     * @param options - Options including required groups and optional metrics and date
     * @returns Cross-group comparative analysis
     */
    async comparePoliticalGroups(options) {
        const rawGroups = options && Array.isArray(options.groups) ? options.groups : [];
        const groups = rawGroups
            .map((g) => (typeof g === 'string' ? g.trim() : ''))
            .filter((g) => g.length > 0);
        if (groups.length === 0) {
            console.warn('compare_political_groups called without valid groups (non-empty string array required)');
            return { content: [{ type: 'text', text: '{"comparison": {}}' }] };
        }
        try {
            return await this.callTool('compare_political_groups', { ...options, groups });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('compare_political_groups not available:', message);
            return { content: [{ type: 'text', text: '{"comparison": {}}' }] };
        }
    }
    /**
     * Get detailed information about a specific MEP
     *
     * @param id - MEP identifier (must be non-empty)
     * @returns Detailed MEP information including biography, contact, and activities
     */
    async getMEPDetails(id) {
        if (typeof id !== 'string' || id.trim().length === 0) {
            console.warn('get_mep_details called without valid id (non-empty string required)');
            return { content: [{ type: 'text', text: '{"mep": null}' }] };
        }
        try {
            return await this.callTool('get_mep_details', { id: id.trim() });
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
     * @param options - Filter options (mepId, sessionId, limit)
     * @returns Voting records data
     */
    async getVotingRecords(options = {}) {
        try {
            return await this.callTool('get_voting_records', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('get_voting_records not available:', message);
            return { content: [{ type: 'text', text: '{"votes": []}' }] };
        }
    }
    /**
     * Analyze voting behavior patterns for an MEP
     *
     * @param options - Analysis options (mepId required non-empty, dateFrom, compareWithGroup)
     * @returns Voting pattern analysis
     */
    async analyzeVotingPatterns(options) {
        if (typeof options.mepId !== 'string' || options.mepId.trim().length === 0) {
            console.warn('analyze_voting_patterns called without valid mepId (non-empty string required)');
            return { content: [{ type: 'text', text: '{"patterns": null}' }] };
        }
        try {
            return await this.callTool('analyze_voting_patterns', {
                ...options,
                mepId: options.mepId.trim(),
            });
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
     * @param procedureId - Legislative procedure identifier (must be non-empty)
     * @returns Procedure status and timeline
     */
    async trackLegislation(procedureId) {
        if (typeof procedureId !== 'string' || procedureId.trim().length === 0) {
            console.warn('track_legislation called without valid procedureId (non-empty string required)');
            return { content: [{ type: 'text', text: '{"procedure": null}' }] };
        }
        try {
            return await this.callTool('track_legislation', { procedureId: procedureId.trim() });
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
     * @param options - Report options (reportType required non-empty, subjectId, dateFrom)
     * @returns Generated report data
     */
    async generateReport(options) {
        if (typeof options.reportType !== 'string' || options.reportType.trim().length === 0) {
            console.warn('generate_report called without valid reportType (non-empty string required)');
            return { content: [{ type: 'text', text: '{"report": null}' }] };
        }
        try {
            return await this.callTool('generate_report', {
                ...options,
                reportType: options.reportType.trim(),
            });
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