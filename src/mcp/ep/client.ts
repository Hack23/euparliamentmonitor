// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/client
 * @description European Parliament MCP client — domain-specific tool wrappers
 * built on top of the generic {@link MCPConnection} transport.
 */

import { MCPConnection } from '../mcp-connection.js';
import { ProcedureSeenCache } from '../procedure-seen-cache.js';
import {
  recordPendingDocument,
  markDocumentResolved,
  getPendingDocumentsForReprobe,
  escalateExpiredDocuments,
  getPendingDocumentsSummary,
} from '../pending-documents.js';
import type {
  MCPClientOptions,
  MCPToolResult,
  MCPContentItem,
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
  VotingRecordsOptions,
  VotingPatternsOptions,
  GenerateReportOptions,
  AnalyzeLegislativeEffectivenessOptions,
  AnalyzeCommitteeActivityOptions,
  TrackMEPAttendanceOptions,
  AnalyzeCountryDelegationOptions,
  GeneratePoliticalLandscapeOptions,
  GetCurrentMEPsOptions,
  GetSpeechesOptions,
  GetProceduresOptions,
  GetAdoptedTextsOptions,
  GetEventsOptions,
  GetMeetingActivitiesOptions,
  GetMeetingDecisionsOptions,
  GetMEPDeclarationsOptions,
  GetIncomingMEPsOptions,
  GetOutgoingMEPsOptions,
  GetHomonymMEPsOptions,
  GetLatestVotesOptions,
  GetPlenaryDocumentsOptions,
  GetCommitteeDocumentsOptions,
  GetPlenarySessionDocumentsOptions,
  GetPlenarySessionDocumentItemsOptions,
  GetControlledVocabulariesOptions,
  GetExternalDocumentsOptions,
  GetMeetingForeseenActivitiesOptions,
  GetProcedureEventsOptions,
  GetMeetingPlenarySessionDocumentsOptions,
  GetMeetingPlenarySessionDocumentItemsOptions,
  NetworkAnalysisOptions,
  SentimentTrackerOptions,
  EarlyWarningSystemOptions,
  ComparativeIntelligenceOptions,
  CorrelateIntelligenceOptions,
  GetAllGeneratedStatsOptions,
  GetMEPsFeedOptions,
  GetEventsFeedOptions,
  GetProceduresFeedOptions,
  GetAdoptedTextsFeedOptions,
  GetMEPDeclarationsFeedOptions,
  GetDocumentsFeedOptions,
  GetPlenaryDocumentsFeedOptions,
  GetCommitteeDocumentsFeedOptions,
  GetPlenarySessionDocumentsFeedOptions,
  GetExternalDocumentsFeedOptions,
  GetParliamentaryQuestionsFeedOptions,
  GetCorporateBodiesFeedOptions,
  GetControlledVocabulariesFeedOptions,
  GetProcedureEventByIdOptions,
  GetFreshProceduresOptions,
} from '../../types/index.js';
import {
  EFFECTIVENESS_FALLBACK,
  MEPS_FALLBACK,
  DOCUMENTS_FALLBACK,
  EVENTS_FALLBACK,
  ACTIVITIES_FALLBACK,
  ITEMS_FALLBACK,
  INTELLIGENCE_FALLBACK,
  STATS_FALLBACK,
  PROCEDURE_EVENT_FALLBACK,
  SERVER_HEALTH_FALLBACK,
  ADOPTED_TEXTS_FALLBACK,
  FEED_UNAVAILABLE_REASON,
  CONTENT_NOT_YET_AVAILABLE_SUBSTRING,
} from './fallbacks.js';
import { _parseResultPayload, _isEmptyStringSentinel } from './parse.js';
import { classifyToolError, isFeedUnavailable } from './error-classifier.js';
import { detectProceduresFeedStaleTail } from './staleness.js';
import { TOOL_RELIABILITY_TIMEOUT_MS, TOOL_RELIABILITY_TIMEOUT_RETRIES } from './reliability.js';

export const EP_MCP_TOOLS: readonly string[] = [
  'analyze_coalition_dynamics',
  'analyze_committee_activity',
  'analyze_country_delegation',
  'analyze_legislative_effectiveness',
  'analyze_voting_patterns',
  'assess_mep_influence',
  'comparative_intelligence',
  'compare_political_groups',
  'correlate_intelligence',
  'detect_voting_anomalies',
  'early_warning_system',
  'generate_political_landscape',
  'generate_report',
  'get_adopted_texts',
  'get_adopted_texts_feed',
  'get_all_generated_stats',
  'get_committee_documents',
  'get_committee_documents_feed',
  'get_committee_info',
  'get_controlled_vocabularies',
  'get_controlled_vocabularies_feed',
  'get_corporate_bodies_feed',
  'get_current_meps',
  'get_documents_feed',
  'get_events',
  'get_events_feed',
  'get_external_documents',
  'get_external_documents_feed',
  'get_homonym_meps',
  'get_incoming_meps',
  'get_latest_votes',
  'get_meeting_activities',
  'get_meeting_decisions',
  'get_meeting_foreseen_activities',
  'get_meeting_plenary_session_document_items',
  'get_meeting_plenary_session_documents',
  'get_mep_declarations',
  'get_mep_declarations_feed',
  'get_mep_details',
  'get_meps',
  'get_meps_feed',
  'get_outgoing_meps',
  'get_parliamentary_questions',
  'get_parliamentary_questions_feed',
  'get_plenary_documents',
  'get_plenary_documents_feed',
  'get_plenary_session_document_items',
  'get_plenary_session_documents',
  'get_plenary_session_documents_feed',
  'get_plenary_sessions',
  'get_procedure_event_by_id',
  'get_procedure_events',
  'get_procedures',
  'get_procedures_feed',
  'get_server_health',
  'get_speeches',
  'get_voting_records',
  'monitor_legislative_pipeline',
  'network_analysis',
  'search_documents',
  'sentiment_tracker',
  'track_legislation',
  'track_mep_attendance',
];

export class EuropeanParliamentMCPClient extends MCPConnection {
  /** Tracks tools that returned fallback data in the current session */
  private readonly _failedTools = new Map<string, string>();
  /** Tracks tools that have been called (attempted) in the current session */
  private readonly _calledTools = new Set<string>();
  /**
   * Tracks tools that experienced a timeout but the failure was downgraded to a warning.
   * Unlike `_failedTools`, entries here are NOT counted against the reliability score.
   * Currently used by {@link getEventsFeed} whose documented latency is 30–120 s+.
   */
  private readonly _slowFeedWarnings = new Map<string, string>();
  /**
   * Path to the pending-documents sidecar file.
   * Undefined means "use the module-level default (`<cwd>/data/pending-documents.json`)".
   */
  private readonly _pendingDocumentsStorePath: string | undefined;

  /**
   * Create a new EP MCP client.
   *
   * @param options - Connection and gateway options forwarded to {@link MCPConnection},
   *   plus an optional `pendingDocumentsStorePath` that overrides the
   *   default `<cwd>/data/pending-documents.json` sidecar location.
   */
  constructor(options: MCPClientOptions = {}) {
    super(options);
    this._pendingDocumentsStorePath = options.pendingDocumentsStorePath;
  }

  /**
   * Record a tool failure and log a warning.
   *
   * @param toolName - MCP tool name that failed
   * @param errorText - Raw error text from the failure
   * @param fallbackText - JSON text for the fallback result
   * @returns Fallback MCPToolResult
   */
  private _recordToolFailure(
    toolName: string,
    errorText: string,
    fallbackText: string
  ): MCPToolResult {
    const errorType = classifyToolError(errorText);
    this._failedTools.set(toolName, `${errorType}: ${errorText.slice(0, 200)}`);
    console.warn(`⚠️ ${toolName} failed [${errorType}]:`, errorText.slice(0, 200));
    return { content: [{ type: 'text', text: fallbackText }] };
  }

  /**
   * Generic error-safe wrapper around {@link callToolWithRetry}.
   * Retries transient failures (timeouts, connection drops) with a bounded
   * back-off delay before falling back. Non-retriable errors (session expiry,
   * rate limits, programmer errors) are caught immediately without additional delay.
   * Catches any error thrown by the tool (or by the args factory), logs a warning,
   * and returns a fallback payload.
   *
   * Also inspects the tool result for the MCP protocol `isError` flag. When
   * `isError === true`, the first content item's text is passed through
   * `classifyToolError` for diagnostic categorization, and the tool is
   * recorded as failed via {@link _recordToolFailure}. This handles EP MCP
   * Server error responses that are returned (not thrown) as structured results.
   *
   * Accepts either a plain args object or a factory function `() => object`.
   * Using a factory ensures that options normalization/destructuring runs inside
   * the try/catch so invalid runtime inputs fall back gracefully.
   *
   * @param toolName - MCP tool name
   * @param args - Tool arguments or a factory that builds them
   * @param fallbackText - JSON text to return when the tool is unavailable
   * @returns Tool result or fallback
   */
  private async safeCallTool(
    toolName: string,
    args: object | (() => object),
    fallbackText: string
  ): Promise<MCPToolResult> {
    this._calledTools.add(toolName);
    try {
      const resolvedArgs = typeof args === 'function' ? args() : args;
      const result = await this.callToolWithRetry(toolName, resolvedArgs);

      if (result.isError === true) {
        return this._recordToolFailure(toolName, result.content?.[0]?.text ?? '', fallbackText);
      }

      if (isFeedUnavailable(result)) {
        return this._recordToolFailure(
          toolName,
          `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? FEED_UNAVAILABLE_REASON}`,
          fallbackText
        );
      }

      this._failedTools.delete(toolName);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this._recordToolFailure(toolName, message, fallbackText);
    }
  }

  /**
   * Build a standardized per-tool timeout error.
   *
   * @param toolName - MCP tool name
   * @param timeoutMs - Timeout budget per attempt in milliseconds
   * @param cause - Optional underlying error cause
   * @returns Timeout error with optional cause attached
   */
  private _buildReliabilityTimeoutError(toolName: string, timeoutMs: number, cause?: Error): Error {
    return new Error(`UPSTREAM_TIMEOUT: ${toolName} exceeded per-tool timeout (${timeoutMs}ms)`, {
      cause,
    });
  }

  /**
   * Execute one MCP tool attempt with a per-tool timeout guard.
   *
   * @param toolName - MCP tool name
   * @param args - Tool arguments
   * @param timeoutMs - Timeout budget per attempt in milliseconds
   * @returns Tool result for a single attempt
   */
  private async _callToolOnceWithReliabilityTimeout(
    toolName: string,
    args: object,
    timeoutMs: number
  ): Promise<MCPToolResult> {
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<MCPToolResult>((_, reject) => {
      timer = setTimeout(
        () => reject(this._buildReliabilityTimeoutError(toolName, timeoutMs)),
        timeoutMs
      );
    });
    try {
      return await Promise.race([this.callToolWithRetry(toolName, args, 0), timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Decide retry/throw behavior for a failed reliability-timed attempt.
   *
   * @param toolName - MCP tool name
   * @param timeoutMs - Timeout budget per attempt in milliseconds
   * @param error - Last attempt error
   * @param timeoutObserved - Whether a timeout has already been observed in this call
   * @param attempt - Current attempt index (0-based)
   * @param timeoutRetries - Maximum timeout retry count
   * @returns Retry decision state
   */
  private _decideReliabilityAttemptError(
    toolName: string,
    timeoutMs: number,
    error: Error,
    timeoutObserved: boolean,
    attempt: number,
    timeoutRetries: number
  ): { retry: boolean; timeoutObserved: boolean; error?: Error } {
    const isTimeout = classifyToolError(error.message) === 'TIMEOUT';
    if (isTimeout) {
      if (attempt < timeoutRetries) {
        return { retry: true, timeoutObserved: true };
      }
      return { retry: false, timeoutObserved: true, error };
    }
    if (timeoutObserved) {
      return {
        retry: false,
        timeoutObserved: true,
        error: this._buildReliabilityTimeoutError(toolName, timeoutMs, error),
      };
    }
    return { retry: false, timeoutObserved, error };
  }

  /**
   * Call a tool with per-tool timeout and one timeout-only retry budget.
   * Non-timeout errors are surfaced immediately unless a timeout was observed
   * first, in which case a normalized `UPSTREAM_TIMEOUT` error is thrown to
   * preserve timeout classification for downstream diagnostics.
   *
   * @param toolName - MCP tool name
   * @param args - Tool arguments
   * @param timeoutMs - Timeout budget per attempt in milliseconds
   * @param timeoutRetries - Additional attempts when timeout is detected
   * @returns Tool result when call succeeds within timeout budget
   */
  private async callToolWithReliabilityTimeout(
    toolName: string,
    args: object,
    timeoutMs: number = TOOL_RELIABILITY_TIMEOUT_MS,
    timeoutRetries: number = TOOL_RELIABILITY_TIMEOUT_RETRIES
  ): Promise<MCPToolResult> {
    let lastError: Error = new Error(`Timed out calling ${toolName}`);
    let timeoutObserved = false;
    for (let attempt = 0; attempt <= timeoutRetries; attempt++) {
      try {
        return await this._callToolOnceWithReliabilityTimeout(toolName, args, timeoutMs);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const decision = this._decideReliabilityAttemptError(
          toolName,
          timeoutMs,
          lastError,
          timeoutObserved,
          attempt,
          timeoutRetries
        );
        timeoutObserved = decision.timeoutObserved;
        if (decision.retry) {
          continue;
        }
        throw decision.error ?? lastError;
      }
    }
    throw lastError;
  }

  /**
   * Wrapper variant of {@link safeCallTool} that enforces per-tool timeout/retry policy.
   *
   * @param toolName - MCP tool name
   * @param args - Tool arguments or arg factory
   * @param fallbackText - JSON fallback payload
   * @returns Tool result or fallback
   */
  private async safeCallToolWithReliabilityTimeout(
    toolName: string,
    args: object | (() => object),
    fallbackText: string
  ): Promise<MCPToolResult> {
    this._calledTools.add(toolName);
    try {
      const resolvedArgs = typeof args === 'function' ? args() : args;
      const result = await this.callToolWithReliabilityTimeout(toolName, resolvedArgs);

      if (result.isError === true) {
        return this._recordToolFailure(toolName, result.content?.[0]?.text ?? '', fallbackText);
      }

      if (isFeedUnavailable(result)) {
        return this._recordToolFailure(
          toolName,
          `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? FEED_UNAVAILABLE_REASON}`,
          fallbackText
        );
      }

      this._failedTools.delete(toolName);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this._recordToolFailure(toolName, message, fallbackText);
    }
  }

  /**
   * Get a summary of tools that returned fallback data in the current session.
   * Useful for diagnosing feed availability and data quality issues.
   *
   * @returns Map of tool name to error description
   */
  getFailedTools(): ReadonlyMap<string, string> {
    return new Map(this._failedTools);
  }

  /**
   * Get tools that experienced a timeout but the failure was downgraded to a warning.
   * Unlike {@link getFailedTools}, entries here are **not** counted against the
   * reliability score — they represent expected-slow tools whose timeouts are
   * classified as 🟢 LIMITATION (see `.github/prompts/07-mcp-reference.md` §11 row #8).
   *
   * @returns Map of tool name to `"SLOW_FEED: <message>"` warning description
   */
  getSlowFeedWarnings(): ReadonlyMap<string, string> {
    return new Map(this._slowFeedWarnings);
  }

  /**
   * Get a human-readable feed health summary for diagnostics.
   *
   * @returns Formatted summary of feed availability
   */
  getFeedHealthSummary(): string {
    const feedTools = [
      'get_meps_feed',
      'get_events_feed',
      'get_procedures_feed',
      'get_adopted_texts_feed',
      'get_mep_declarations_feed',
      'get_documents_feed',
      'get_plenary_documents_feed',
      'get_committee_documents_feed',
      'get_plenary_session_documents_feed',
      'get_external_documents_feed',
      'get_parliamentary_questions_feed',
      'get_corporate_bodies_feed',
      'get_controlled_vocabularies_feed',
    ];

    const lines: string[] = ['EP MCP Feed Health:'];
    let operational = 0;
    let unchecked = 0;
    for (const tool of feedTools) {
      const error = this._failedTools.get(tool);
      const slowWarning = this._slowFeedWarnings.get(tool);
      if (error) {
        lines.push(`  ❌ ${tool}: ${error}`);
      } else if (slowWarning) {
        lines.push(`  🟡 ${tool}: ${slowWarning}`);
      } else if (this._calledTools.has(tool)) {
        lines.push(`  ✅ ${tool}`);
        operational++;
      } else {
        lines.push(`  ⚪ ${tool} (not checked)`);
        unchecked++;
      }
    }
    const checked = feedTools.length - unchecked;
    lines.push(
      `  Summary: ${operational}/${checked} checked feeds operational${unchecked > 0 ? `, ${unchecked} unchecked` : ''}`
    );
    return lines.join('\n');
  }

  /**
   * Get a per-error-code breakdown of tool-level rejections recorded during the
   * current session. Designed for end-of-run observability so regressions like
   * Hack23/European-Parliament-MCP-Server#378 (raw upstream 404 leaking
   * through as "successful" feed calls) surface in agent-stdio without needing
   * to hand-comb the MCP gateway logs.
   *
   * Each entry in `_failedTools` is stored as `"${errorCode}: ${message}"` by
   * {@link _recordToolFailure}. This method splits on the first colon to
   * group tool names by error code.
   *
   * @returns Formatted summary: one line per error code, with affected tools,
   *   terminated by a final counts line. Returns a single "all operational"
   *   line when no failures have been recorded.
   */
  getToolErrorSummary(): string {
    if (this._failedTools.size === 0) {
      return `EP MCP Tool Errors: 0 (all ${this._calledTools.size} invoked tools operational)`;
    }
    const byCode = new Map<string, string[]>();
    for (const [tool, entry] of this._failedTools.entries()) {
      const sepIdx = entry.indexOf(':');
      const code = sepIdx > 0 ? entry.slice(0, sepIdx) : 'UNKNOWN';
      const existing = byCode.get(code);
      if (existing) {
        existing.push(tool);
      } else {
        byCode.set(code, [tool]);
      }
    }
    const lines: string[] = [
      `EP MCP Tool Errors: ${this._failedTools.size} of ${this._calledTools.size} invoked tools rejected`,
    ];
    const sortedCodes = [...byCode.keys()].sort();
    for (const code of sortedCodes) {
      const tools = byCode.get(code) ?? [];
      lines.push(`  ${code} (${tools.length}): ${tools.sort().join(', ')}`);
    }
    return lines.join('\n');
  }

  /**
   * Get Members of European Parliament
   *
   * @param options - Filter options
   * @returns List of MEPs
   */
  async getMEPs(options: GetMEPsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_meps', options, MEPS_FALLBACK);
  }

  /**
   * Get plenary sessions
   *
   * @param options - Filter options including dateFrom, dateTo, eventId, year, location
   * @returns Plenary sessions data
   *
   * @remarks
   * This repository is currently documented/configured against
   * `european-parliament-mcp-server@1.3.9`.
   *
   * **Upstream date-filter contract (v1.2.14+, active on the pinned v1.3.9 server):** the upstream server
   * applies a server-side post-filter on `dateFrom`/`dateTo` before serialisation, because the
   * EP Open Data Portal `/meetings` endpoint silently ignores its `date-from`/`date-to` query
   * parameters (Defect #5). Under this contract:
   * - `data[]` contains only sessions within the requested window.
   * - `total` reflects the **filtered** count, not the raw upstream count.
   * - Per-window session counts are reproducible because the EP-side regression is masked by
   *   the upstream post-filter.
   *
   * No local post-filter is applied here. The repository is pinned to v1.3.9, so the
   * date-filter guarantees above apply; consumers running against an older server image
   * (pre-v1.2.14) must not assume them.
   */
  async getPlenarySessions(options: GetPlenarySessionsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallToolWithReliabilityTimeout(
      'get_plenary_sessions',
      options,
      '{"data": [], "total": 0}'
    );
  }

  /**
   * Search legislative documents
   *
   * @param options - Search options using v1.2.13 parameters: keyword, documentType, docId, etc.
   * @returns Search results
   */
  async searchDocuments(options: SearchDocumentsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('search_documents', options, DOCUMENTS_FALLBACK);
  }

  /**
   * Get parliamentary questions
   *
   * @param options - Filter options including docId, type, author, topic, status, dateFrom, dateTo
   * @returns Parliamentary questions data
   */
  async getParliamentaryQuestions(
    options: GetParliamentaryQuestionsOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool('get_parliamentary_questions', options, '{"questions": []}');
  }

  /**
   * Get committee information
   *
   * @param options - Filter options: id, abbreviation, showCurrent
   * @returns Committee info data
   */
  async getCommitteeInfo(options: GetCommitteeInfoOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_committee_info', options, '{"committees": []}');
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
    return this.safeCallToolWithReliabilityTimeout(
      'monitor_legislative_pipeline',
      options,
      '{"procedures": []}'
    );
  }

  /**
   * Analyze legislative effectiveness of an MEP or committee
   *
   * @param options - Options including subjectType and subjectId
   * @returns Legislative effectiveness data
   */
  async analyzeLegislativeEffectiveness(
    options: AnalyzeLegislativeEffectivenessOptions
  ): Promise<MCPToolResult> {
    const { subjectType, subjectId } = options;
    if (subjectId.trim().length === 0) {
      console.warn(
        'analyze_legislative_effectiveness called without valid subjectId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: EFFECTIVENESS_FALLBACK }] };
    }
    const trimmedSubjectId = subjectId.trim();
    return this.safeCallTool(
      'analyze_legislative_effectiveness',
      { ...options, subjectType, subjectId: trimmedSubjectId },
      EFFECTIVENESS_FALLBACK
    );
  }

  /**
   * Assess MEP influence using 5-dimension scoring model
   *
   * @param options - Options including required mepId and optional date range
   * @returns MEP influence score and breakdown
   */
  async assessMEPInfluence(options: AssessMEPInfluenceOptions): Promise<MCPToolResult> {
    const trimmedMepId = options && typeof options.mepId === 'string' ? options.mepId.trim() : '';
    if (trimmedMepId.length === 0) {
      console.warn('assess_mep_influence called without valid mepId (non-empty string required)');
      return { content: [{ type: 'text', text: '{"influence": {}}' }] };
    }
    return this.safeCallTool(
      'assess_mep_influence',
      { ...options, mepId: trimmedMepId },
      '{"influence": {}}'
    );
  }

  /**
   * Analyze coalition dynamics and cohesion
   *
   * @param options - Options including optional groupIds and date range
   * @returns Coalition cohesion and stress analysis
   */
  async analyzeCoalitionDynamics(
    options: AnalyzeCoalitionDynamicsOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool('analyze_coalition_dynamics', options, '{"coalitions": []}');
  }

  /**
   * Detect voting anomalies and party defections
   *
   * @param options - Options including optional MEP id, groupId, and date range
   * @returns Anomaly detection results
   */
  async detectVotingAnomalies(options: DetectVotingAnomaliesOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('detect_voting_anomalies', options, '{"anomalies": []}');
  }

  /**
   * Compare political groups across dimensions
   *
   * @param options - Options including required groupIds and optional dimensions and date range
   * @returns Cross-group comparative analysis
   */
  async comparePoliticalGroups(options: ComparePoliticalGroupsOptions): Promise<MCPToolResult> {
    const groupIds = (Array.isArray(options.groupIds) ? options.groupIds : [])
      .map((g) => (typeof g === 'string' ? g.trim() : ''))
      .filter((g) => g.length > 0);
    if (groupIds.length === 0) {
      console.warn(
        'compare_political_groups called without valid groupIds (non-empty string array required)'
      );
      return { content: [{ type: 'text', text: '{"comparison": {}}' }] };
    }
    return this.safeCallTool(
      'compare_political_groups',
      { ...options, groupIds },
      '{"comparison": {}}'
    );
  }

  /**
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
    return this.safeCallTool('get_mep_details', { id: id.trim() }, '{"mep": null}');
  }

  /**
   * Retrieve voting records with optional filters
   *
   * @param options - Filter options (sessionId, mepId, topic, dateFrom, dateTo, limit, offset)
   * @returns Voting records data
   */
  async getVotingRecords(options: VotingRecordsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_voting_records', options, '{"votes": []}');
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
    return this.safeCallTool(
      'analyze_voting_patterns',
      { ...options, mepId: options.mepId.trim() },
      '{"patterns": null}'
    );
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
    return this.safeCallTool(
      'track_legislation',
      { procedureId: procedureId.trim() },
      '{"procedure": null}'
    );
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
    return this.safeCallTool(
      'generate_report',
      { ...options, reportType: options.reportType.trim() },
      '{"report": null}'
    );
  }

  /**
   * Analyze committee activity, workload, and engagement
   *
   * @param options - Options including optional committeeId and date range
   * @returns Committee activity analysis data
   */
  async analyzeCommitteeActivity(
    options: AnalyzeCommitteeActivityOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool('analyze_committee_activity', options, '{"activity": null}');
  }

  /**
   * Track MEP attendance patterns and trends
   *
   * @param options - Options including optional mepId and date range
   * @returns MEP attendance data
   */
  async trackMEPAttendance(options: TrackMEPAttendanceOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('track_mep_attendance', options, '{"attendance": null}');
  }

  /**
   * Analyze country delegation voting behavior and composition
   *
   * @param options - Options including required country code and optional date range
   * @returns Country delegation analysis data
   */
  async analyzeCountryDelegation(options: AnalyzeCountryDelegationOptions): Promise<MCPToolResult> {
    if (typeof options.country !== 'string' || options.country.trim().length === 0) {
      console.warn(
        'analyze_country_delegation called without valid country (non-empty string required)'
      );
      return { content: [{ type: 'text', text: '{"delegation": null}' }] };
    }
    return this.safeCallTool(
      'analyze_country_delegation',
      { ...options, country: options.country.trim() },
      '{"delegation": null}'
    );
  }

  /**
   * Generate a parliament-wide political landscape overview
   *
   * @param options - Options including optional date range and detail level
   * @returns Political landscape overview data
   */
  async generatePoliticalLandscape(
    options: GeneratePoliticalLandscapeOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallToolWithReliabilityTimeout(
      'generate_political_landscape',
      options,
      '{"landscape": null}'
    );
  }

  /**
   * Get currently active Members of European Parliament
   *
   * @param options - Pagination options
   * @returns Active MEPs data
   */
  async getCurrentMEPs(options: GetCurrentMEPsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_current_meps', options, MEPS_FALLBACK);
  }

  /**
   * Get plenary speeches and debate contributions
   *
   * @param options - Filter options including optional speechId, dateFrom/dateTo (v1.2.13: year removed)
   * @returns Speeches data
   */
  async getSpeeches(options: GetSpeechesOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_speeches', options, '{"speeches": []}');
  }

  /**
   * Get legislative procedures
   *
   * @param options - Filter options including optional processId (v1.2.13: year removed)
   * @returns Procedures data
   */
  async getProcedures(options: GetProceduresOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_procedures', options, '{"procedures": []}');
  }

  /**
   * Get fresh legislative procedures using client-side date filtering as a
   * workaround for the broken EP `/procedures/feed` timeframe filter.
   *
   * **Background**: the EP Open Data Portal `/procedures/feed` endpoint stopped
   * honouring the `timeframe` parameter on or around 2026-04-19 and began
   * returning historical-tail pagination (oldest records first, all metadata
   * empty). This regression is tracked as Defect #3 in
   * `analysis/daily/2026-04-24/propositions/intelligence/mcp-reliability-audit.md`
   * and has been reported to open-data-helpdesk@europarl.europa.eu.
   *
   * **Strategy**:
   * 1. Call `get_procedures(limit=100, offset=0)` — the stable non-feed endpoint.
   * 2. Sort results client-side by `dateLastActivity` DESC, falling back to
   *    `dateInitiated` when `dateLastActivity` is empty.
   * 3. Keep procedures where the effective date >= today minus `windowDays`
   *    (default 30 days). Apply optional `topN` cap.
   * 4. Persist `(procedureId, dateLastActivity)` pairs to the seen-cache so
   *    subsequent runs can detect new/updated IDs without re-paginating.
   *
   * @param options - Discovery options (limit, windowDays, topN, seenCacheStorePath)
   * @returns Sorted, filtered procedure list in `{"procedures": [...]}` envelope
   */
  async getFreshProcedures(options: GetFreshProceduresOptions = {}): Promise<MCPToolResult> {
    const { limit = 100, windowDays = 30, topN, seenCacheStorePath } = options;

    const raw = await this.getProcedures({ limit });
    const payload = _parseResultPayload(raw);
    const payloadProcedures = payload?.['procedures'];
    const allProcedures: unknown[] = Array.isArray(payloadProcedures) ? payloadProcedures : [];

    const todayMinus = new Date();
    todayMinus.setUTCDate(todayMinus.getUTCDate() - windowDays);
    const cutoff = todayMinus.toISOString().slice(0, 10);

    const normalised = allProcedures.filter(
      (p): p is Record<string, unknown> => p !== null && typeof p === 'object' && !Array.isArray(p)
    );

    const withSortKey = normalised.map((p) => {
      const dla = typeof p['dateLastActivity'] === 'string' ? p['dateLastActivity'] : '';
      const di = typeof p['dateInitiated'] === 'string' ? p['dateInitiated'] : '';
      return { item: p, effectiveDate: dla.length > 0 ? dla : di };
    });

    withSortKey.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

    const inWindow = withSortKey
      .filter(({ effectiveDate }) => effectiveDate >= cutoff)
      .map(({ item }) => item);

    const result = topN !== undefined ? inWindow.slice(0, topN) : inWindow;

    const cache = new ProcedureSeenCache(seenCacheStorePath);
    for (const p of result) {
      const id = typeof p['id'] === 'string' ? p['id'] : '';
      const dateLastActivity =
        typeof p['dateLastActivity'] === 'string' ? p['dateLastActivity'] : '';
      if (id.length > 0) {
        cache.upsert(id, dateLastActivity);
      }
    }
    cache.save();

    return {
      content: [{ type: 'text', text: JSON.stringify({ procedures: result }) }],
    };
  }

  /**
   * Get adopted texts (legislative resolutions, positions, non-legislative resolutions)
   *
   * When called with `options.docId` this method delegates to
   * {@link _fetchAdoptedTextByDocId} which handles two CONTENT_PENDING conditions
   * with the correct classification from the first log entry:
   *
   * 1. **UPSTREAM_404 indexing lag** (primary, v1.2.13+): The EP MCP Server
   *    throws `UPSTREAM_404: document indexed but content not yet available`
   *    when the EP Open Data Portal has indexed a document identifier but the
   *    content body has not yet been populated (typically 5–15-day lag).
   *    The docId is recorded in the pending-documents sidecar with exponential
   *    back-off scheduling so subsequent runs can re-probe without over-reporting
   *    the lag as a reliability defect.
   *
   * 2. **Empty-string sentinel** (secondary, pre-v1.2.13 defence-in-depth):
   *    Every string field is `""` — upstream issue
   *    Hack23/European-Parliament-MCP-Server#369.
   *
   * In both cases the method returns the empty `{"texts": []}` fallback so
   * downstream consumers do not render blank title/reference/date fields.
   *
   * Year-range list queries (no `docId`) use the standard {@link safeCallTool}
   * wrapper and are not affected by content-availability detection.
   *
   * @param options - Filter options including optional docId or year
   * @returns Adopted texts data
   */
  async getAdoptedTexts(options: GetAdoptedTextsOptions = {}): Promise<MCPToolResult> {
    if (typeof options.docId === 'string' && options.docId.trim().length > 0) {
      return this._fetchAdoptedTextByDocId(options.docId.trim());
    }
    return this.safeCallTool('get_adopted_texts', options, ADOPTED_TEXTS_FALLBACK);
  }

  /**
   * Contextual fetcher for single-document `get_adopted_texts` lookups.
   *
   * Wraps {@link callToolWithRetry} directly so content-availability lag is
   * classified as `CONTENT_PENDING` from the first log entry — not reclassified
   * from `NOT_FOUND` after the fact.  Two conditions are handled:
   *
   * 1. **UPSTREAM_404 indexing lag** (thrown exception or `isError:true` body):
   *    message contains `CONTENT_NOT_YET_AVAILABLE_SUBSTRING`.
   *
   * 2. **Empty-string sentinel** (`isError:false`, pre-v1.2.13 defence-in-depth):
   *    every string field is `""`.
   *
   * @param docId - Trimmed document identifier
   * @returns Adopted texts data or `ADOPTED_TEXTS_FALLBACK`
   */
  private async _fetchAdoptedTextByDocId(docId: string): Promise<MCPToolResult> {
    this._calledTools.add('get_adopted_texts');
    const persistPending = (label: string): Promise<void> =>
      recordPendingDocument(docId, this._pendingDocumentsStorePath)
        .then(() => undefined)
        .catch((err) => {
          console.warn(
            `⚠️ pending-documents: failed to record pending doc (${label}):`,
            (err as Error).message
          );
        });
    try {
      const result = await this.callToolWithRetry('get_adopted_texts', { docId });

      if (result.isError === true) {
        const text = result.content?.[0]?.text ?? '';
        if (text.toLowerCase().includes(CONTENT_NOT_YET_AVAILABLE_SUBSTRING)) {
          this._failedTools.set(
            'get_adopted_texts',
            `CONTENT_PENDING: ${docId} EP indexing lag (tracked in pending-documents sidecar)`
          );
          console.warn(`⚠️ get_adopted_texts [CONTENT_PENDING]: ${docId} EP indexing lag`);
          await persistPending('isError');
          return { content: [{ type: 'text', text: ADOPTED_TEXTS_FALLBACK }] };
        }
        return this._recordToolFailure('get_adopted_texts', text, ADOPTED_TEXTS_FALLBACK);
      }

      const payload = _parseResultPayload(result);
      if (_isEmptyStringSentinel(payload)) {
        await persistPending('sentinel');
        return this._recordToolFailure(
          'get_adopted_texts',
          `CONTENT_PENDING: docId=${docId} returned empty-string sentinel (upstream #369)`,
          ADOPTED_TEXTS_FALLBACK
        );
      }

      this._failedTools.delete('get_adopted_texts');
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.toLowerCase().includes(CONTENT_NOT_YET_AVAILABLE_SUBSTRING)) {
        this._failedTools.set(
          'get_adopted_texts',
          `CONTENT_PENDING: ${docId} EP indexing lag (tracked in pending-documents sidecar)`
        );
        console.warn(`⚠️ get_adopted_texts [CONTENT_PENDING]: ${docId} EP indexing lag`);
        await persistPending('upstream_404');
        return { content: [{ type: 'text', text: ADOPTED_TEXTS_FALLBACK }] };
      }
      return this._recordToolFailure('get_adopted_texts', message, ADOPTED_TEXTS_FALLBACK);
    }
  }

  /**
   * Return the docIds of pending adopted texts that are due for a re-probe
   * according to their exponential back-off schedule.
   *
   * Call this at the start of each Stage B deep-fetch run to obtain the list
   * of identifiers to re-probe.  For each returned docId, call
   * {@link getAdoptedTexts} with `{ docId }`.  If the fetch succeeds (real
   * content returned), call {@link resolveAdoptedText} to mark it resolved.
   *
   * @returns Array of docIds due for reprobe (may be empty)
   */
  async getDueAdoptedTextsForReprobe(): Promise<string[]> {
    return getPendingDocumentsForReprobe(this._pendingDocumentsStorePath);
  }

  /**
   * Mark a previously-pending adopted text as resolved (content is now
   * available and has been successfully retrieved).
   *
   * @param docId - Adopted-text identifier (e.g., "TA-10-2026-0104")
   */
  async resolveAdoptedText(docId: string): Promise<void> {
    await markDocumentResolved(docId, this._pendingDocumentsStorePath);
  }

  /**
   * Escalate PENDING adopted texts that have exceeded the 14-day maximum
   * tracking age.  Escalated documents are excluded from future reprobes and
   * should be handled by the wildcards-blackswans family.
   *
   * @returns Array of docIds that were escalated
   */
  async escalateStalePendingDocuments(): Promise<string[]> {
    return escalateExpiredDocuments(this._pendingDocumentsStorePath);
  }

  /**
   * Return a human-readable summary of the pending-documents sidecar for
   * Stage B observability logging.
   *
   * @returns Formatted summary string
   */
  async getPendingDocumentsSummary(): Promise<string> {
    return getPendingDocumentsSummary(this._pendingDocumentsStorePath);
  }

  /**
   * Get European Parliament events (hearings, conferences, seminars)
   *
   * @param options - Filter options including optional eventId, pagination only (v1.2.13: year/dateFrom/dateTo removed — EP API /events has no date filtering)
   * @returns Events data
   */
  async getEvents(options: GetEventsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_events', options, EVENTS_FALLBACK);
  }

  /**
   * Get activities linked to a specific plenary sitting
   *
   * @param options - Options including required sittingId
   * @returns Meeting activities data
   */
  async getMeetingActivities(options: GetMeetingActivitiesOptions): Promise<MCPToolResult> {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
      console.warn(
        'get_meeting_activities called without valid sittingId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
    }
    return this.safeCallTool(
      'get_meeting_activities',
      { ...options, sittingId: options.sittingId.trim() },
      ACTIVITIES_FALLBACK
    );
  }

  /**
   * Get decisions made in a specific plenary sitting
   *
   * @param options - Options including required sittingId
   * @returns Meeting decisions data
   */
  async getMeetingDecisions(options: GetMeetingDecisionsOptions): Promise<MCPToolResult> {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
      console.warn(
        'get_meeting_decisions called without valid sittingId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: '{"decisions": []}' }] };
    }
    return this.safeCallTool(
      'get_meeting_decisions',
      { ...options, sittingId: options.sittingId.trim() },
      '{"decisions": []}'
    );
  }

  /**
   * Get MEP declarations of financial interests
   *
   * @param options - Filter options including optional docId or year
   * @returns MEP declarations data
   */
  async getMEPDeclarations(options: GetMEPDeclarationsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_mep_declarations', options, '{"declarations": []}');
  }

  /**
   * Get incoming Members of European Parliament
   *
   * @param options - Pagination options
   * @returns Incoming MEPs data
   */
  async getIncomingMEPs(options: GetIncomingMEPsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_incoming_meps', options, MEPS_FALLBACK);
  }

  /**
   * Get outgoing Members of European Parliament
   *
   * @param options - Pagination options
   * @returns Outgoing MEPs data
   */
  async getOutgoingMEPs(options: GetOutgoingMEPsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_outgoing_meps', options, MEPS_FALLBACK);
  }

  /**
   * Get homonym MEPs (MEPs with identical names)
   *
   * @param options - Pagination options
   * @returns Homonym MEPs data
   */
  async getHomonymMEPs(options: GetHomonymMEPsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_homonym_meps', options, MEPS_FALLBACK);
  }

  /**
   * Retrieve latest EP plenary votes via DOCEO XML endpoint.
   *
   * Returns near-realtime vote records (dataFreshness: NEAR_REALTIME,
   * dataSource: EP_DOCEO_XML) — typically available within minutes of a
   * plenary vote, unlike the regular EP API which has a multi-week delay.
   *
   * New in `european-parliament-mcp-server@1.3.1`.
   *
   * @param options - Pagination options
   * @returns Latest plenary vote records with NEAR_REALTIME freshness
   */
  async getLatestVotes(options: GetLatestVotesOptions = {}): Promise<MCPToolResult> {
    return this.safeCallToolWithReliabilityTimeout(
      'get_latest_votes',
      options,
      '{"votes": [], "dataFreshness": "NEAR_REALTIME"}'
    );
  }

  /**
   * Get plenary documents
   *
   * @param options - Filter options including optional docId or year
   * @returns Plenary documents data
   */
  async getPlenaryDocuments(options: GetPlenaryDocumentsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_plenary_documents', options, DOCUMENTS_FALLBACK);
  }

  /**
   * Get committee documents
   *
   * @param options - Filter options including optional docId (v1.2.13: year removed)
   * @returns Committee documents data
   */
  async getCommitteeDocuments(options: GetCommitteeDocumentsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_committee_documents', options, DOCUMENTS_FALLBACK);
  }

  /**
   * Get plenary session documents (agendas, minutes, voting lists)
   *
   * @param options - Filter options including optional docId
   * @returns Plenary session documents data
   */
  async getPlenarySessionDocuments(
    options: GetPlenarySessionDocumentsOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool('get_plenary_session_documents', options, DOCUMENTS_FALLBACK);
  }

  /**
   * Get plenary session document items
   *
   * @param options - Pagination options
   * @returns Plenary session document items data
   */
  async getPlenarySessionDocumentItems(
    options: GetPlenarySessionDocumentItemsOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool('get_plenary_session_document_items', options, ITEMS_FALLBACK);
  }

  /**
   * Get controlled vocabularies (standardized classification terms)
   *
   * @param options - Filter options including optional vocId
   * @returns Controlled vocabularies data
   */
  async getControlledVocabularies(
    options: GetControlledVocabulariesOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool('get_controlled_vocabularies', options, '{"vocabularies": []}');
  }

  /**
   * Get external documents (non-EP documents such as Council positions)
   *
   * @param options - Filter options including optional docId (v1.2.13: year removed)
   * @returns External documents data
   */
  async getExternalDocuments(options: GetExternalDocumentsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_external_documents', options, DOCUMENTS_FALLBACK);
  }

  /**
   * Get foreseen (planned) activities for a specific plenary sitting
   *
   * @param options - Options including required sittingId
   * @returns Foreseen activities data
   */
  async getMeetingForeseenActivities(
    options: GetMeetingForeseenActivitiesOptions
  ): Promise<MCPToolResult> {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
      console.warn(
        'get_meeting_foreseen_activities called without valid sittingId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
    }
    return this.safeCallTool(
      'get_meeting_foreseen_activities',
      { ...options, sittingId: options.sittingId.trim() },
      ACTIVITIES_FALLBACK
    );
  }

  /**
   * Get events linked to a specific legislative procedure
   *
   * @param options - Options including required processId
   * @returns Procedure events data
   */
  async getProcedureEvents(options: GetProcedureEventsOptions): Promise<MCPToolResult> {
    if (typeof options.processId !== 'string' || options.processId.trim().length === 0) {
      console.warn(
        'get_procedure_events called without valid processId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: EVENTS_FALLBACK }] };
    }
    return this.safeCallTool(
      'get_procedure_events',
      { ...options, processId: options.processId.trim() },
      EVENTS_FALLBACK
    );
  }

  /**
   * Get plenary session documents linked to a specific meeting
   *
   * @param options - Options including required sittingId
   * @returns Meeting plenary session documents data
   */
  async getMeetingPlenarySessionDocuments(
    options: GetMeetingPlenarySessionDocumentsOptions
  ): Promise<MCPToolResult> {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
      console.warn(
        'get_meeting_plenary_session_documents called without valid sittingId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: DOCUMENTS_FALLBACK }] };
    }
    return this.safeCallTool(
      'get_meeting_plenary_session_documents',
      { ...options, sittingId: options.sittingId.trim() },
      DOCUMENTS_FALLBACK
    );
  }

  /**
   * Get plenary session document items linked to a specific meeting
   *
   * @param options - Options including required sittingId
   * @returns Meeting plenary session document items data
   */
  async getMeetingPlenarySessionDocumentItems(
    options: GetMeetingPlenarySessionDocumentItemsOptions
  ): Promise<MCPToolResult> {
    if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
      console.warn(
        'get_meeting_plenary_session_document_items called without valid sittingId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: ITEMS_FALLBACK }] };
    }
    return this.safeCallTool(
      'get_meeting_plenary_session_document_items',
      { ...options, sittingId: options.sittingId.trim() },
      ITEMS_FALLBACK
    );
  }

  /**
   * MEP relationship network mapping using committee co-membership
   *
   * @param options - Options including optional mepId, analysisType, and depth
   * @returns Network analysis with centrality scores and clusters
   */
  async networkAnalysis(options: NetworkAnalysisOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('network_analysis', options, INTELLIGENCE_FALLBACK);
  }

  /**
   * Track political group institutional positioning and sentiment
   *
   * @param options - Options including optional groupId and timeframe
   * @returns Sentiment tracking data
   */
  async sentimentTracker(options: SentimentTrackerOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('sentiment_tracker', options, INTELLIGENCE_FALLBACK);
  }

  /**
   * Detect emerging political shifts and coalition fracture signals
   *
   * @param options - Options including optional sensitivity and focusArea
   * @returns Early warning alerts and trend indicators
   */
  async earlyWarningSystem(options: EarlyWarningSystemOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('early_warning_system', options, INTELLIGENCE_FALLBACK);
  }

  /**
   * Cross-reference MEP activities for comparative multi-dimensional profiling
   *
   * @param options - Options including required mepIds array and optional dimensions
   * @returns Comparative intelligence profiles
   */
  async comparativeIntelligence(options: ComparativeIntelligenceOptions): Promise<MCPToolResult> {
    if (!Array.isArray(options.mepIds) || options.mepIds.length < 2) {
      console.warn(
        'comparative_intelligence called without valid mepIds (array of at least 2 required)'
      );
      return { content: [{ type: 'text', text: INTELLIGENCE_FALLBACK }] };
    }
    return this.safeCallTool('comparative_intelligence', options, INTELLIGENCE_FALLBACK);
  }

  /**
   * Cross-tool OSINT intelligence correlation engine
   *
   * @param options - Options including required mepIds, optional groups, sensitivityLevel, includeNetworkAnalysis
   * @returns Correlated intelligence alerts and insights
   */
  async correlateIntelligence(options: CorrelateIntelligenceOptions): Promise<MCPToolResult> {
    if (!Array.isArray(options.mepIds) || options.mepIds.length === 0) {
      console.warn(
        'correlate_intelligence called without valid mepIds (non-empty string array required)'
      );
      return { content: [{ type: 'text', text: INTELLIGENCE_FALLBACK }] };
    }
    return this.safeCallTool('correlate_intelligence', options, INTELLIGENCE_FALLBACK);
  }

  /**
   * Retrieve precomputed European Parliament activity statistics (EP6–EP10, 2004–2025).
   * Includes yearly stats, category rankings, political landscape history, and
   * average-based predictions for 2026–2030. Static data refreshed weekly — no live API calls.
   *
   * @param options - Filter options including optional year range, category, and flags
   * @returns Precomputed EP statistics data
   */
  async getAllGeneratedStats(options: GetAllGeneratedStatsOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_all_generated_stats', options, STATS_FALLBACK);
  }

  // ─── EP API v2 Feed Endpoint Methods ────────────────────────────────────────

  /** Fallback payload for feed tools */
  private static readonly FEED_FALLBACK = '{"feed": []}';

  /**
   * Get MEPs feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns MEPs feed data
   */
  async getMEPsFeed(options: GetMEPsFeedOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool('get_meps_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
  }

  /**
   * Get events feed (most recent updates via EP API v2)
   *
   * Implements special timeout-downgrade handling: when the call throws a timeout
   * error, the failure is recorded in {@link _slowFeedWarnings} (not
   * {@link _failedTools}) so it does **not** reduce the session reliability score.
   * The events feed is documented as significantly slower than other feeds
   * (30–120 s+); timeouts during heavy EP API load are expected behaviour, classified
   * as 🟢 LIMITATION in `.github/prompts/07-mcp-reference.md` §11 row #8.
   *
   * A fallback result with `slowFeedWarning: true` is returned so Stage A consumers
   * can detect the condition and fall back to `get_plenary_sessions({ year })`.
   *
   * Non-timeout errors (404, 5xx, rate-limit, etc.) are still recorded as failures.
   *
   * @param options - Pagination options
   * @returns Events feed data, or `{ "feed": [], "slowFeedWarning": true }` on timeout
   */
  async getEventsFeed(options: GetEventsFeedOptions = {}): Promise<MCPToolResult> {
    this._calledTools.add('get_events_feed');
    try {
      const result = await this.callToolWithRetry('get_events_feed', options);

      if (result.isError === true) {
        this._slowFeedWarnings.delete('get_events_feed');
        return this._recordToolFailure(
          'get_events_feed',
          result.content?.[0]?.text ?? '',
          EuropeanParliamentMCPClient.FEED_FALLBACK
        );
      }

      if (isFeedUnavailable(result)) {
        this._slowFeedWarnings.delete('get_events_feed');
        return this._recordToolFailure(
          'get_events_feed',
          `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? 'feed unavailable'}`,
          EuropeanParliamentMCPClient.FEED_FALLBACK
        );
      }

      this._failedTools.delete('get_events_feed');
      this._slowFeedWarnings.delete('get_events_feed');
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (classifyToolError(message) === 'TIMEOUT') {
        const warningMsg = `SLOW_FEED: ${message.slice(0, 200)}`;
        this._failedTools.delete('get_events_feed');
        this._slowFeedWarnings.set('get_events_feed', warningMsg);
        console.warn('🟡 get_events_feed slow-feed warning [SLOW_FEED]:', message.slice(0, 200));
        return { content: [{ type: 'text', text: '{"feed":[],"slowFeedWarning":true}' }] };
      }

      this._slowFeedWarnings.delete('get_events_feed');
      return this._recordToolFailure(
        'get_events_feed',
        message,
        EuropeanParliamentMCPClient.FEED_FALLBACK
      );
    }
  }

  /**
   * Get procedures feed (most recent updates via EP API v2)
   *
   * Post-processes the response to detect stale historical tail — when the EP procedures
   * feed returns archive data (newest dated item < 2020) instead of
   * current procedures. This happens when the EP API serves its historical archive
   * in ID order due to upstream ordering degradation.
   *
   * When a stale tail is detected:
   * - `staleTail: true` is added to the payload
   * - A `STALE_TAIL: …` entry is appended to `dataQualityWarnings[]`
   * - A `🟡 procedures-feed: stale historical tail` console warning is emitted
   *
   * The tool is **not** recorded as failed — this is documented EP API behaviour
   * classified as 🟢 LIMITATION in `.github/prompts/07-mcp-reference.md` §11 row #5.
   * Downstream Stage A consumers should fall back to
   * `get_adopted_texts({ year: $YEAR })` or `track_legislation({ procedureId })`.
   *
   * @param options - Pagination options
   * @returns Procedures feed data, possibly with `staleTail: true` added to the payload
   */
  async getProceduresFeed(options: GetProceduresFeedOptions = {}): Promise<MCPToolResult> {
    const result = await this.safeCallTool(
      'get_procedures_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );

    const payload = _parseResultPayload(result);
    if (detectProceduresFeedStaleTail(payload)) {
      console.warn(
        '🟡 procedures-feed: stale historical tail — newest procedure year is <2020; use get_adopted_texts({ year: $YEAR }) or track_legislation({ procedureId }) instead'
      );
      const existingWarnings = Array.isArray(payload?.['dataQualityWarnings'])
        ? (payload['dataQualityWarnings'] as string[])
        : [];
      const augmented: Record<string, unknown> = {
        ...(payload as Record<string, unknown>),
        staleTail: true,
        dataQualityWarnings: [
          ...existingWarnings,
          'STALE_TAIL: procedures-feed returned stale historical tail (max year <2020) — likely upstream ordering degradation; fallback: get_adopted_texts({ year: $YEAR }) or track_legislation({ procedureId })',
        ],
      };
      const augmentedText = JSON.stringify(augmented);
      const originalContent = result.content;
      const updatedContent: MCPContentItem[] =
        Array.isArray(originalContent) && originalContent.length > 0
          ? originalContent.map((item, index) =>
              index === 0 ? { ...item, text: augmentedText } : item
            )
          : [{ type: 'text', text: augmentedText }];
      return { ...result, content: updatedContent };
    }

    return result;
  }

  /**
   * Get adopted texts feed (most recent updates via EP API v2)
   *
   * Post-processes the response to honour upstream freshness-fallback warnings
   * added by `Hack23/European-Parliament-MCP-Server` when the feed payload
   * contains no items from the current calendar year:
   *
   * - `FRESHNESS_FALLBACK: …` in `dataQualityWarnings[]` indicates the server
   *   augmented the response with `GET /adopted-texts?year={currentYear}`.
   *   The result is kept (do NOT downgrade to C4 — the augmented items are
   *   confirmable, current-year, EP-published documents) and two fields are
   *   added to the payload:
   *   - `freshness: "augmented"` — callers can detect the augmentation
   *   - `dataFreshnessWarnings: string[]` — the subset of `dataQualityWarnings`
   *     that starts with `FRESHNESS_FALLBACK`, forwarded for Stage-A consumers
   *
   * - `FRESHNESS_FALLBACK_FAILED: …` indicates the feed was stale AND the
   *   fallback `GET /adopted-texts?year=…` also returned no items.  The tool
   *   is recorded as failed (escalated to `ANALYSIS_ONLY`) so downstream
   *   consumers do not treat an empty-year dataset as fresh evidence.
   *
   * @param options - Pagination options
   * @returns Adopted texts feed data, possibly with augmented freshness fields
   */
  async getAdoptedTextsFeed(options: GetAdoptedTextsFeedOptions = {}): Promise<MCPToolResult> {
    const result = await this.safeCallTool(
      'get_adopted_texts_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );

    const payload = _parseResultPayload(result);
    const rawWarnings = payload?.['dataQualityWarnings'];
    const warnings: string[] = Array.isArray(rawWarnings)
      ? rawWarnings.filter((w): w is string => typeof w === 'string')
      : [];

    const freshnessWarnings = warnings.filter((w) => w.startsWith('FRESHNESS_FALLBACK'));

    if (freshnessWarnings.length === 0) {
      return result;
    }

    const failedWarning = freshnessWarnings.find((w) => w.startsWith('FRESHNESS_FALLBACK_FAILED'));
    if (failedWarning !== undefined) {
      return this._recordToolFailure(
        'get_adopted_texts_feed',
        `ANALYSIS_ONLY: ${failedWarning.slice(0, 200)}`,
        EuropeanParliamentMCPClient.FEED_FALLBACK
      );
    }

    const augmented: Record<string, unknown> = {
      ...(payload as Record<string, unknown>),
      freshness: 'augmented',
      dataFreshnessWarnings: freshnessWarnings,
    };
    const augmentedText = JSON.stringify(augmented);
    const originalContent = result.content;
    const updatedContent: MCPContentItem[] =
      Array.isArray(originalContent) && originalContent.length > 0
        ? originalContent.map((item, index) =>
            index === 0 ? { ...item, text: augmentedText } : item
          )
        : [{ type: 'text', text: augmentedText }];
    return { ...result, content: updatedContent };
  }

  /**
   * Get MEP declarations feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns MEP declarations feed data
   */
  async getMEPDeclarationsFeed(
    options: GetMEPDeclarationsFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool(
      'get_mep_declarations_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get documents feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns Documents feed data
   */
  async getDocumentsFeed(options: GetDocumentsFeedOptions = {}): Promise<MCPToolResult> {
    return this.safeCallTool(
      'get_documents_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get plenary documents feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns Plenary documents feed data
   */
  async getPlenaryDocumentsFeed(
    options: GetPlenaryDocumentsFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool(
      'get_plenary_documents_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get committee documents feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns Committee documents feed data
   */
  async getCommitteeDocumentsFeed(
    options: GetCommitteeDocumentsFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallToolWithReliabilityTimeout(
      'get_committee_documents_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get plenary session documents feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns Plenary session documents feed data
   */
  async getPlenarySessionDocumentsFeed(
    options: GetPlenarySessionDocumentsFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool(
      'get_plenary_session_documents_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get external documents feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns External documents feed data
   */
  async getExternalDocumentsFeed(
    options: GetExternalDocumentsFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallToolWithReliabilityTimeout(
      'get_external_documents_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get Commission Work Programme documents from the external documents feed.
   * Convenience wrapper that filters `get_external_documents_feed` by
   * `workType: 'COM_WORK_PROGRAMME'`.
   *
   * @param options - Additional feed options (timeframe, startDate)
   * @returns External documents feed data filtered to Commission WP
   */
  async getCommissionWorkProgramme(
    options: Omit<GetExternalDocumentsFeedOptions, 'workType'> = {}
  ): Promise<MCPToolResult> {
    return this.getExternalDocumentsFeed({ ...options, workType: 'COM_WORK_PROGRAMME' });
  }

  /**
   * Get Council Presidency Programme documents from the external documents feed.
   * Convenience wrapper that filters `get_external_documents_feed` by
   * `workType: 'COUNCIL_PRESIDENCY_PROGRAMME'`.
   *
   * @param options - Additional feed options (timeframe, startDate)
   * @returns External documents feed data filtered to Council Presidency Programme
   */
  async getCouncilPresidencyProgramme(
    options: Omit<GetExternalDocumentsFeedOptions, 'workType'> = {}
  ): Promise<MCPToolResult> {
    return this.getExternalDocumentsFeed({ ...options, workType: 'COUNCIL_PRESIDENCY_PROGRAMME' });
  }

  /**
   * Get parliamentary questions feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns Parliamentary questions feed data
   */
  async getParliamentaryQuestionsFeed(
    options: GetParliamentaryQuestionsFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool(
      'get_parliamentary_questions_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get corporate bodies feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns Corporate bodies feed data
   */
  async getCorporateBodiesFeed(
    options: GetCorporateBodiesFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool(
      'get_corporate_bodies_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get controlled vocabularies feed (most recent updates via EP API v2)
   *
   * @param options - Pagination options
   * @returns Controlled vocabularies feed data
   */
  async getControlledVocabulariesFeed(
    options: GetControlledVocabulariesFeedOptions = {}
  ): Promise<MCPToolResult> {
    return this.safeCallTool(
      'get_controlled_vocabularies_feed',
      options,
      EuropeanParliamentMCPClient.FEED_FALLBACK
    );
  }

  /**
   * Get a specific event linked to a legislative procedure.
   * Returns a single event for the specified procedure and event identifiers.
   *
   * @param options - Options including required processId and eventId
   * @returns Procedure event data
   */
  async getProcedureEventById(options: GetProcedureEventByIdOptions): Promise<MCPToolResult> {
    if (typeof options.processId !== 'string' || options.processId.trim().length === 0) {
      console.warn(
        'get_procedure_event_by_id called without valid processId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: PROCEDURE_EVENT_FALLBACK }] };
    }
    if (typeof options.eventId !== 'string' || options.eventId.trim().length === 0) {
      console.warn(
        'get_procedure_event_by_id called without valid eventId (non-empty string required)'
      );
      return { content: [{ type: 'text', text: PROCEDURE_EVENT_FALLBACK }] };
    }
    return this.safeCallTool(
      'get_procedure_event_by_id',
      { processId: options.processId.trim(), eventId: options.eventId.trim() },
      PROCEDURE_EVENT_FALLBACK
    );
  }

  /**
   * Check server health and feed availability status.
   * Returns server version, uptime, per-feed health status, and overall availability.
   * Does not make upstream API calls — reports cached status from recent tool invocations.
   *
   * @returns Server health and feed availability data
   */
  async getServerHealth(): Promise<MCPToolResult> {
    return this.safeCallTool('get_server_health', {}, SERVER_HEALTH_FALLBACK);
  }
}
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
    const client = new EuropeanParliamentMCPClient(options);
    try {
      await client.connect();
      clientInstance = client;
    } catch (error) {
      clientInstance = null;
      throw error;
    }
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
