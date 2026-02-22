// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/EPMCPClient
 * @description Client for connecting to European-Parliament-MCP-Server.
 * Communicates via JSON-RPC 2.0 over stdio with retry logic.
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
  GetMEPsOptions,
  GetPlenarySessionsOptions,
  SearchDocumentsOptions,
  GetParliamentaryQuestionsOptions,
  GetCommitteeInfoOptions,
  MonitorLegislativePipelineOptions,
  AssessMEPInfluenceOptions,
  AnalyzeCoalitionDynamicsOptions,
  DetectVotingAnomaliesOptions,
  ComparePoliticalGroupsOptions,
  AnalyzeLegislativeEffectivenessOptions,
  VotingRecordsOptions,
  VotingPatternsOptions,
  GenerateReportOptions,
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
   * @param args - Tool arguments (must be a plain object, not an array or function)
   * @returns Tool execution result
   */
  async callTool(name: string, args: object = {}): Promise<unknown> {
    if (Array.isArray(args)) {
      throw new TypeError('MCP tool arguments must be a plain object, not an array');
    }
    return await this.sendRequest('tools/call', { name, arguments: args });
  async callTool(name: string, args: object = {}): Promise<MCPToolResult> {
    return (await this.sendRequest('tools/call', {
      name,
      arguments: args,
    })) as MCPToolResult;
  }

  /**
   * Get Members of European Parliament
   *
   * @param options - Filter options
   * @returns List of MEPs
   */
  async getMEPs(options: GetMEPsOptions = {}): Promise<MCPToolResult> {
    try {
      return (await this.callTool('get_meps', options)) as MCPToolResult;
  async getMEPs(options: Record<string, unknown> = {}): Promise<MCPToolResult> {
    try {
      return await this.callTool('get_meps', options);
    } catch (error) {
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
  async getPlenarySessions(options: GetPlenarySessionsOptions = {}): Promise<MCPToolResult> {
    try {
      return await this.callTool('get_plenary_sessions', options);
    } catch (error) {
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
  async searchDocuments(options: SearchDocumentsOptions = {}): Promise<MCPToolResult> {
    try {
      const { keyword, ...rest } = options;
      const normalizedOptions: Record<string, unknown> = { ...rest };
      if (normalizedOptions['query'] === undefined && keyword !== undefined) {
        const trimmed = String(keyword).trim();
        if (trimmed.length > 0) {
          normalizedOptions['query'] = trimmed;
        }
      }
      return (await this.callTool('search_documents', normalizedOptions)) as MCPToolResult;
      return await this.callTool('search_documents', options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('search_documents not available:', message);
      return { content: [{ type: 'text', text: '{"documents": []}' }] };
    }
  }

  /**
   * Get parliamentary questions
   *
   * @param options - Filter options (maps `dateFrom` to `startDate` per tool schema)
   * @returns Parliamentary questions data
   */
  async getParliamentaryQuestions(
    options: GetParliamentaryQuestionsOptions = {}
  ): Promise<MCPToolResult> {
    try {
      const { dateFrom, dateTo: _dateTo, ...rest } = options;
      const toolOptions: Record<string, unknown> = { ...rest };
      if (toolOptions['startDate'] === undefined && dateFrom !== undefined) {
        toolOptions['startDate'] = dateFrom;
      }
      return (await this.callTool('get_parliamentary_questions', toolOptions)) as MCPToolResult;
      return await this.callTool('get_parliamentary_questions', options);
    } catch (error) {
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
  async getCommitteeInfo(options: GetCommitteeInfoOptions = {}): Promise<MCPToolResult> {
    try {
      return await this.callTool('get_committee_info', options);
    } catch (error) {
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
  async monitorLegislativePipeline(
    options: MonitorLegislativePipelineOptions = {}
  ): Promise<MCPToolResult> {
    try {
      return await this.callTool('monitor_legislative_pipeline', options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('monitor_legislative_pipeline not available:', message);
      return { content: [{ type: 'text', text: '{"procedures": []}' }] };
    }
  }

  /**
   * Assess MEP influence using 5-dimension scoring model
   *
   * @param options - Options including required mepId and optional date range
   * @returns MEP influence score and breakdown
   */
  async assessMEPInfluence(options: AssessMEPInfluenceOptions): Promise<MCPToolResult> {
    try {
      return (await this.callTool('assess_mep_influence', options)) as MCPToolResult;
    } catch (error) {
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
  async analyzeCoalitionDynamics(
    options: AnalyzeCoalitionDynamicsOptions = {}
  ): Promise<MCPToolResult> {
    try {
      return (await this.callTool('analyze_coalition_dynamics', options)) as MCPToolResult;
    } catch (error) {
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
  async detectVotingAnomalies(options: DetectVotingAnomaliesOptions = {}): Promise<MCPToolResult> {
    try {
      return (await this.callTool('detect_voting_anomalies', options)) as MCPToolResult;
    } catch (error) {
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
  async comparePoliticalGroups(options: ComparePoliticalGroupsOptions): Promise<MCPToolResult> {
    try {
      return (await this.callTool('compare_political_groups', options)) as MCPToolResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('compare_political_groups not available:', message);
      return { content: [{ type: 'text', text: '{"comparison": {}}' }] };
    }
  }

  /**
   * Analyze legislative effectiveness of an MEP or committee
   *
   * @param options - Options including required subjectId and optional subjectType and date
   * @returns Legislative effectiveness scoring
   */
  async analyzeLegislativeEffectiveness(
    options: AnalyzeLegislativeEffectivenessOptions
  ): Promise<MCPToolResult> {
    try {
      return (await this.callTool('analyze_legislative_effectiveness', options)) as MCPToolResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('analyze_legislative_effectiveness not available:', message);
      return { content: [{ type: 'text', text: '{"effectiveness": {}}' }] };
   * Get detailed information about a specific MEP
   *
   * @param id - MEP identifier (must be non-empty)
   * @returns Detailed MEP information including biography, contact, and activities
   */
  async getMEPDetails(id: string): Promise<MCPToolResult> {
    if (typeof id !== 'string' || id.trim().length === 0) {
      console.warn('get_mep_details called without valid id (non-empty string required)');
      return { content: [{ type: 'text', text: '{"mep": null}' }] };
    }
    try {
      return await this.callTool('get_mep_details', { id: id.trim() });
    } catch (error) {
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
  async getVotingRecords(options: VotingRecordsOptions = {}): Promise<MCPToolResult> {
    try {
      return await this.callTool('get_voting_records', options);
    } catch (error) {
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
  async analyzeVotingPatterns(options: VotingPatternsOptions): Promise<MCPToolResult> {
    if (typeof options.mepId !== 'string' || options.mepId.trim().length === 0) {
      console.warn(
        'analyze_voting_patterns called without valid mepId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: '{"patterns": null}' }] };
    }
    try {
      return await this.callTool('analyze_voting_patterns', {
        ...options,
        mepId: options.mepId.trim(),
      });
    } catch (error) {
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
  async trackLegislation(procedureId: string): Promise<MCPToolResult> {
    if (typeof procedureId !== 'string' || procedureId.trim().length === 0) {
      console.warn(
        'track_legislation called without valid procedureId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: '{"procedure": null}' }] };
    }
    try {
      return await this.callTool('track_legislation', { procedureId: procedureId.trim() });
    } catch (error) {
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
  async generateReport(options: GenerateReportOptions): Promise<MCPToolResult> {
    if (typeof options.reportType !== 'string' || options.reportType.trim().length === 0) {
      console.warn('generate_report called without valid reportType (non-empty string required)');
      return { content: [{ type: 'text', text: '{"report": null}' }] };
    }
    try {
      return await this.callTool('generate_report', {
        ...options,
        reportType: options.reportType.trim(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('generate_report not available:', message);
      return { content: [{ type: 'text', text: '{"report": null}' }] };
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
