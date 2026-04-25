// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/EPMCPClient
 * @description European Parliament MCP client — domain-specific tool wrappers
 * built on top of the generic {@link MCPConnection} transport.
 */
import { MCPConnection } from './mcp-connection.js';
/**
 * Canonical list of tools exposed by the European Parliament MCP gateway
 * (`european-parliament-mcp-server@1.2.13`). The news workflows, prompt
 * library (`.github/prompts/07-mcp-reference.md`), and the integration test
 * suite all reference this list so a regression that adds/removes a tool
 * fails a single drift guard
 * (`test/integration/mcp/ep-mcp.test.js`) instead of silently breaking
 * prompt/validator/probe coverage.
 *
 * Kept in sync with every `this.safeCallTool('<name>', ...)` call below.
 */
export const EP_MCP_TOOLS = [
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
/** Fallback payload for analyze_legislative_effectiveness when validation fails or tool is unavailable */
const EFFECTIVENESS_FALLBACK = '{"effectiveness": null}';
/** Fallback payload for MEP list tools */
const MEPS_FALLBACK = '{"meps": []}';
/** Fallback payload for document list tools */
const DOCUMENTS_FALLBACK = '{"documents": []}';
/** Fallback payload for event list tools */
const EVENTS_FALLBACK = '{"events": []}';
/** Fallback payload for activity list tools */
const ACTIVITIES_FALLBACK = '{"activities": []}';
/** Fallback payload for item list tools */
const ITEMS_FALLBACK = '{"items": []}';
/** Fallback payload for intelligence analysis tools */
const INTELLIGENCE_FALLBACK = '{"analysis": null}';
/** Fallback payload for precomputed statistics */
const STATS_FALLBACK = '{"stats": null}';
/** Fallback payload for single procedure event lookup */
const PROCEDURE_EVENT_FALLBACK = '{"event": null}';
/** Fallback payload for server health status */
const SERVER_HEALTH_FALLBACK = '{"server": null, "feeds": []}';
/**
 * Classify an error message into a diagnostic error category.
 *
 * Maps EP MCP Server v1.2.13 structured error codes and generic HTTP/network
 * errors into one of six broad categories used for logging and retry decisions:
 *
 * Returned categories (priority order):
 * 1. `INTERNAL_ERROR` — EP MCP `INTERNAL_ERROR` (catch-all for DNS, TLS, unclassified upstream failures)
 * 2. `SERVER_ERROR`   — EP MCP `UPSTREAM_500`/`UPSTREAM_503`/`SERVER_ERROR`, or gateway 5xx patterns
 * 3. `TIMEOUT`        — EP MCP `UPSTREAM_TIMEOUT`, or generic "timeout" strings
 * 4. `RATE_LIMIT`     — EP MCP `RATE_LIMITED`, HTTP 429, or "rate limit"/"too many requests" strings
 * 5. `NOT_FOUND`      — EP MCP `UPSTREAM_404`, or generic "404" strings
 * 6. `UNKNOWN`        — everything else
 *
 * @param message - Raw error message
 * @returns Diagnostic error category string
 */
function classifyToolError(message) {
    const lowerMsg = message.toLowerCase();
    // EP MCP Server v1.2.13 structured error codes (matched case-insensitively)
    if (lowerMsg.includes('internal_error')) {
        return 'INTERNAL_ERROR';
    }
    if (lowerMsg.includes('upstream_500') ||
        lowerMsg.includes('upstream_503') ||
        lowerMsg.includes('server_error')) {
        return 'SERVER_ERROR';
    }
    if (lowerMsg.includes('upstream_timeout')) {
        return 'TIMEOUT';
    }
    if (lowerMsg.includes('gateway timeout') ||
        lowerMsg.includes('gateway error 500') ||
        lowerMsg.includes('gateway error 502') ||
        lowerMsg.includes('gateway error 503') ||
        lowerMsg.includes('gateway error 504')) {
        return 'SERVER_ERROR';
    }
    if (lowerMsg.includes('429') ||
        lowerMsg.includes('rate limit') ||
        lowerMsg.includes('too many requests') ||
        lowerMsg.includes('rate_limited')) {
        return 'RATE_LIMIT';
    }
    if (lowerMsg.includes('404') || lowerMsg.includes('upstream_404'))
        return 'NOT_FOUND';
    if (lowerMsg.includes('timeout'))
        return 'TIMEOUT';
    return 'UNKNOWN';
}
/**
 * Parse the text payload of an {@link MCPToolResult} as JSON, returning
 * `undefined` when the payload is missing or malformed. Small helper used by
 * the unavailable-envelope detectors below.
 *
 * @param result - Raw MCP tool result
 * @returns Parsed JSON object, or `undefined` if the payload is not a JSON object
 */
function _parseResultPayload(result) {
    const text = result?.content?.[0]?.text;
    if (typeof text !== 'string' || text.length === 0)
        return undefined;
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
        }
    }
    catch {
        return undefined;
    }
    return undefined;
}
/**
 * Detect whether an MCP feed result represents an "unavailable" response,
 * covering the two shapes historically emitted by the EP MCP server.
 *
 * 1. **Uniform envelope** (all feeds as of
 *    `european-parliament-mcp-server@1.2.13`) —
 *    `{status:"unavailable", items:[], generatedAt:"..."}` established by
 *    Hack23/European-Parliament-MCP-Server#301 and extended to
 *    `get_events_feed`/`get_procedures_feed` by
 *    Hack23/European-Parliament-MCP-Server#380 (which closed #378).
 * 2. **Legacy raw upstream 404 shape** (historically emitted pre-v1.2.13 by
 *    `get_events_feed` / `get_procedures_feed`, fixed upstream in PR #380) —
 *    `{"@id":"https://data.europarl.europa.eu/eli/dl/...","error":"404 N..."}`.
 *    Retained purely as defense-in-depth for older pinned server versions or
 *    any future regression of #378, so such payloads do not silently poison
 *    downstream analysis.
 *
 * Returning `true` from this helper lets callers treat both shapes as
 * "known-empty" rather than "success with garbage payload".
 *
 * @param result - Raw MCP tool result
 * @returns `true` when the payload matches either unavailable envelope
 */
export function isFeedUnavailable(result) {
    const envelope = _parseResultPayload(result);
    if (!envelope)
        return false;
    // Shape 1 — uniform {status:"unavailable"} envelope (#301 / #380).
    if (envelope['status'] === 'unavailable')
        return true;
    // Shape 2 — legacy raw upstream 404 leak (historically pre-v1.2.13, #378).
    const error = envelope['error'];
    const idField = envelope['@id'];
    if (typeof error === 'string' &&
        typeof idField === 'string' &&
        idField.startsWith('https://data.europarl.europa.eu/') &&
        error.includes('404')) {
        return true;
    }
    return false;
}
/**
 * Detect the "all string fields empty" sentinel emitted by
 * `get_adopted_texts({docId})` for documents that are indexed but whose
 * content has not yet been populated by the EP Open Data Portal. The server
 * returns a JSON-schema-valid response in which every string field is the
 * empty string, which bypasses standard error handling — see upstream issue
 * Hack23/European-Parliament-MCP-Server#369.
 *
 * Only treats a payload as a sentinel when it has at least three string
 * fields (to avoid false positives on intentionally sparse payloads) AND
 * all string fields are the empty string.
 *
 * @param payload - Parsed JSON payload object (or `undefined`)
 * @returns `true` when the payload matches the CONTENT_PENDING sentinel
 */
function _isEmptyStringSentinel(payload) {
    if (!payload)
        return false;
    let totalStringFields = 0;
    let emptyStringFields = 0;
    for (const value of Object.values(payload)) {
        if (typeof value === 'string') {
            totalStringFields++;
            if (value.length === 0)
                emptyStringFields++;
        }
    }
    return totalStringFields >= 3 && totalStringFields === emptyStringFields;
}
/**
 * MCP Client for European Parliament data access.
 * Extends {@link MCPConnection} with EP-specific tool wrapper methods.
 */
export class EuropeanParliamentMCPClient extends MCPConnection {
    /** Tracks tools that returned fallback data in the current session */
    _failedTools = new Map();
    /** Tracks tools that have been called (attempted) in the current session */
    _calledTools = new Set();
    /**
     * Record a tool failure and log a warning.
     *
     * @param toolName - MCP tool name that failed
     * @param errorText - Raw error text from the failure
     * @param fallbackText - JSON text for the fallback result
     * @returns Fallback MCPToolResult
     */
    _recordToolFailure(toolName, errorText, fallbackText) {
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
     * {@link classifyToolError} for diagnostic categorization, and the tool is
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
    async safeCallTool(toolName, args, fallbackText) {
        this._calledTools.add(toolName);
        try {
            const resolvedArgs = typeof args === 'function' ? args() : args;
            const result = await this.callToolWithRetry(toolName, resolvedArgs);
            // Inspect the result for structured error responses from the EP MCP server.
            // The server may return isError: true with JSON content containing errorCode
            // (e.g., INTERNAL_ERROR, UPSTREAM_500) instead of throwing an exception.
            if (result.isError === true) {
                return this._recordToolFailure(toolName, result.content?.[0]?.text ?? '', fallbackText);
            }
            // Detect the unavailable-feed envelope — uniform `{status:"unavailable"}`
            // (all feeds as of v1.2.13, #301/#380) as well as the legacy raw upstream
            // 404 shape `{"@id":..., "error":"404 ..."}` that pre-v1.2.13
            // get_events_feed / get_procedures_feed emitted
            // (Hack23/European-Parliament-MCP-Server#378, closed by PR #380). The
            // server returns HTTP 200 with a payload that bypasses isError — record
            // it as a NOT_FOUND failure so it is visible in getFailedTools() and the
            // error summary instead of silently passing through as garbage data.
            if (isFeedUnavailable(result)) {
                return this._recordToolFailure(toolName, `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? 'feed unavailable'}`, fallbackText);
            }
            // Clear from failed tools on success
            this._failedTools.delete(toolName);
            return result;
        }
        catch (error) {
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
    getFailedTools() {
        return new Map(this._failedTools);
    }
    /**
     * Get a human-readable feed health summary for diagnostics.
     *
     * @returns Formatted summary of feed availability
     */
    getFeedHealthSummary() {
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
        const lines = ['EP MCP Feed Health:'];
        let operational = 0;
        let unchecked = 0;
        for (const tool of feedTools) {
            const error = this._failedTools.get(tool);
            if (error) {
                lines.push(`  ❌ ${tool}: ${error}`);
            }
            else if (this._calledTools.has(tool)) {
                lines.push(`  ✅ ${tool}`);
                operational++;
            }
            else {
                lines.push(`  ⚪ ${tool} (not checked)`);
                unchecked++;
            }
        }
        const checked = feedTools.length - unchecked;
        lines.push(`  Summary: ${operational}/${checked} checked feeds operational${unchecked > 0 ? `, ${unchecked} unchecked` : ''}`);
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
    getToolErrorSummary() {
        if (this._failedTools.size === 0) {
            return `EP MCP Tool Errors: 0 (all ${this._calledTools.size} invoked tools operational)`;
        }
        const byCode = new Map();
        for (const [tool, entry] of this._failedTools.entries()) {
            const sepIdx = entry.indexOf(':');
            const code = sepIdx > 0 ? entry.slice(0, sepIdx) : 'UNKNOWN';
            const existing = byCode.get(code);
            if (existing) {
                existing.push(tool);
            }
            else {
                byCode.set(code, [tool]);
            }
        }
        const lines = [
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
    async getMEPs(options = {}) {
        return this.safeCallTool('get_meps', options, MEPS_FALLBACK);
    }
    /**
     * Get plenary sessions
     *
     * @param options - Filter options including dateFrom, dateTo, eventId, year, location
     * @returns Plenary sessions data
     *
     * @remarks
     * **Date-filter contract (v1.2.14+):** The upstream EP-MCP server applies a client-side
     * post-filter on `dateFrom`/`dateTo` before serialisation, because the EP Open Data Portal
     * `/meetings` endpoint silently ignores its `date-from`/`date-to` query parameters (Defect #5).
     * As a result:
     * - `data[]` contains only sessions within the requested window.
     * - `total` reflects the **filtered** count, not the raw upstream count.
     * - Per-window session counts are reproducible; the EP-side regression is masked by the filter.
     *
     * No local post-filter is applied here — the upstream contract is the single source of truth.
     */
    async getPlenarySessions(options = {}) {
        return this.safeCallTool('get_plenary_sessions', options, '{"data": [], "total": 0}');
    }
    /**
     * Search legislative documents
     *
     * @param options - Search options using v1.2.13 parameters: keyword, documentType, docId, etc.
     * @returns Search results
     */
    async searchDocuments(options = {}) {
        return this.safeCallTool('search_documents', options, DOCUMENTS_FALLBACK);
    }
    /**
     * Get parliamentary questions
     *
     * @param options - Filter options including docId, type, author, topic, status, dateFrom, dateTo
     * @returns Parliamentary questions data
     */
    async getParliamentaryQuestions(options = {}) {
        return this.safeCallTool('get_parliamentary_questions', options, '{"questions": []}');
    }
    /**
     * Get committee information
     *
     * @param options - Filter options: id, abbreviation, showCurrent
     * @returns Committee info data
     */
    async getCommitteeInfo(options = {}) {
        return this.safeCallTool('get_committee_info', options, '{"committees": []}');
    }
    /**
     * Monitor legislative pipeline
     *
     * @param options - Filter options
     * @returns Legislative pipeline data
     */
    async monitorLegislativePipeline(options = {}) {
        return this.safeCallTool('monitor_legislative_pipeline', options, '{"procedures": []}');
    }
    /**
     * Analyze legislative effectiveness of an MEP or committee
     *
     * @param options - Options including subjectType and subjectId
     * @returns Legislative effectiveness data
     */
    async analyzeLegislativeEffectiveness(options) {
        const { subjectType, subjectId } = options;
        if (subjectId.trim().length === 0) {
            console.warn('analyze_legislative_effectiveness called without valid subjectId (non-empty string required)');
            return { content: [{ type: 'text', text: EFFECTIVENESS_FALLBACK }] };
        }
        const trimmedSubjectId = subjectId.trim();
        return this.safeCallTool('analyze_legislative_effectiveness', { ...options, subjectType, subjectId: trimmedSubjectId }, EFFECTIVENESS_FALLBACK);
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
        return this.safeCallTool('assess_mep_influence', { ...options, mepId: trimmedMepId }, '{"influence": {}}');
    }
    /**
     * Analyze coalition dynamics and cohesion
     *
     * @param options - Options including optional groupIds and date range
     * @returns Coalition cohesion and stress analysis
     */
    async analyzeCoalitionDynamics(options = {}) {
        return this.safeCallTool('analyze_coalition_dynamics', options, '{"coalitions": []}');
    }
    /**
     * Detect voting anomalies and party defections
     *
     * @param options - Options including optional MEP id, groupId, and date range
     * @returns Anomaly detection results
     */
    async detectVotingAnomalies(options = {}) {
        return this.safeCallTool('detect_voting_anomalies', options, '{"anomalies": []}');
    }
    /**
     * Compare political groups across dimensions
     *
     * @param options - Options including required groupIds and optional dimensions and date range
     * @returns Cross-group comparative analysis
     */
    async comparePoliticalGroups(options) {
        const groupIds = (Array.isArray(options.groupIds) ? options.groupIds : [])
            .map((g) => (typeof g === 'string' ? g.trim() : ''))
            .filter((g) => g.length > 0);
        if (groupIds.length === 0) {
            console.warn('compare_political_groups called without valid groupIds (non-empty string array required)');
            return { content: [{ type: 'text', text: '{"comparison": {}}' }] };
        }
        return this.safeCallTool('compare_political_groups', { ...options, groupIds }, '{"comparison": {}}');
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
        return this.safeCallTool('get_mep_details', { id: id.trim() }, '{"mep": null}');
    }
    /**
     * Retrieve voting records with optional filters
     *
     * @param options - Filter options (sessionId, mepId, topic, dateFrom, dateTo, limit, offset)
     * @returns Voting records data
     */
    async getVotingRecords(options = {}) {
        return this.safeCallTool('get_voting_records', options, '{"votes": []}');
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
        return this.safeCallTool('analyze_voting_patterns', { ...options, mepId: options.mepId.trim() }, '{"patterns": null}');
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
        return this.safeCallTool('track_legislation', { procedureId: procedureId.trim() }, '{"procedure": null}');
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
        return this.safeCallTool('generate_report', { ...options, reportType: options.reportType.trim() }, '{"report": null}');
    }
    /**
     * Analyze committee activity, workload, and engagement
     *
     * @param options - Options including optional committeeId and date range
     * @returns Committee activity analysis data
     */
    async analyzeCommitteeActivity(options = {}) {
        return this.safeCallTool('analyze_committee_activity', options, '{"activity": null}');
    }
    /**
     * Track MEP attendance patterns and trends
     *
     * @param options - Options including optional mepId and date range
     * @returns MEP attendance data
     */
    async trackMEPAttendance(options = {}) {
        return this.safeCallTool('track_mep_attendance', options, '{"attendance": null}');
    }
    /**
     * Analyze country delegation voting behavior and composition
     *
     * @param options - Options including required country code and optional date range
     * @returns Country delegation analysis data
     */
    async analyzeCountryDelegation(options) {
        if (typeof options.country !== 'string' || options.country.trim().length === 0) {
            console.warn('analyze_country_delegation called without valid country (non-empty string required)');
            return { content: [{ type: 'text', text: '{"delegation": null}' }] };
        }
        return this.safeCallTool('analyze_country_delegation', { ...options, country: options.country.trim() }, '{"delegation": null}');
    }
    /**
     * Generate a parliament-wide political landscape overview
     *
     * @param options - Options including optional date range and detail level
     * @returns Political landscape overview data
     */
    async generatePoliticalLandscape(options = {}) {
        return this.safeCallTool('generate_political_landscape', options, '{"landscape": null}');
    }
    /**
     * Get currently active Members of European Parliament
     *
     * @param options - Pagination options
     * @returns Active MEPs data
     */
    async getCurrentMEPs(options = {}) {
        return this.safeCallTool('get_current_meps', options, MEPS_FALLBACK);
    }
    /**
     * Get plenary speeches and debate contributions
     *
     * @param options - Filter options including optional speechId, dateFrom/dateTo (v1.2.13: year removed)
     * @returns Speeches data
     */
    async getSpeeches(options = {}) {
        return this.safeCallTool('get_speeches', options, '{"speeches": []}');
    }
    /**
     * Get legislative procedures
     *
     * @param options - Filter options including optional processId (v1.2.13: year removed)
     * @returns Procedures data
     */
    async getProcedures(options = {}) {
        return this.safeCallTool('get_procedures', options, '{"procedures": []}');
    }
    /**
     * Get adopted texts (legislative resolutions, positions, non-legislative resolutions)
     *
     * When called with `options.docId` and the EP server returns a
     * "CONTENT_PENDING sentinel" (every string field empty — upstream issue
     * Hack23/European-Parliament-MCP-Server#369), this method records the tool as
     * failed and returns the empty fallback so downstream consumers do not
     * render blank title/reference/date fields.
     *
     * @param options - Filter options including optional docId or year
     * @returns Adopted texts data
     */
    async getAdoptedTexts(options = {}) {
        const result = await this.safeCallTool('get_adopted_texts', options, '{"texts": []}');
        // Only apply the sentinel guard to docId lookups — year-range list queries
        // return `{texts: [...]}` which would never match the sentinel heuristic.
        if (typeof options.docId === 'string' && options.docId.trim().length > 0) {
            const payload = _parseResultPayload(result);
            if (_isEmptyStringSentinel(payload)) {
                return this._recordToolFailure('get_adopted_texts', `CONTENT_PENDING: docId=${options.docId} returned empty-string sentinel (upstream #369)`, '{"texts": []}');
            }
        }
        return result;
    }
    /**
     * Get European Parliament events (hearings, conferences, seminars)
     *
     * @param options - Filter options including optional eventId, pagination only (v1.2.13: year/dateFrom/dateTo removed — EP API /events has no date filtering)
     * @returns Events data
     */
    async getEvents(options = {}) {
        return this.safeCallTool('get_events', options, EVENTS_FALLBACK);
    }
    /**
     * Get activities linked to a specific plenary sitting
     *
     * @param options - Options including required sittingId
     * @returns Meeting activities data
     */
    async getMeetingActivities(options) {
        if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
            console.warn('get_meeting_activities called without valid sittingId (non-empty string required)');
            return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
        }
        return this.safeCallTool('get_meeting_activities', { ...options, sittingId: options.sittingId.trim() }, ACTIVITIES_FALLBACK);
    }
    /**
     * Get decisions made in a specific plenary sitting
     *
     * @param options - Options including required sittingId
     * @returns Meeting decisions data
     */
    async getMeetingDecisions(options) {
        if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
            console.warn('get_meeting_decisions called without valid sittingId (non-empty string required)');
            return { content: [{ type: 'text', text: '{"decisions": []}' }] };
        }
        return this.safeCallTool('get_meeting_decisions', { ...options, sittingId: options.sittingId.trim() }, '{"decisions": []}');
    }
    /**
     * Get MEP declarations of financial interests
     *
     * @param options - Filter options including optional docId or year
     * @returns MEP declarations data
     */
    async getMEPDeclarations(options = {}) {
        return this.safeCallTool('get_mep_declarations', options, '{"declarations": []}');
    }
    /**
     * Get incoming Members of European Parliament
     *
     * @param options - Pagination options
     * @returns Incoming MEPs data
     */
    async getIncomingMEPs(options = {}) {
        return this.safeCallTool('get_incoming_meps', options, MEPS_FALLBACK);
    }
    /**
     * Get outgoing Members of European Parliament
     *
     * @param options - Pagination options
     * @returns Outgoing MEPs data
     */
    async getOutgoingMEPs(options = {}) {
        return this.safeCallTool('get_outgoing_meps', options, MEPS_FALLBACK);
    }
    /**
     * Get homonym MEPs (MEPs with identical names)
     *
     * @param options - Pagination options
     * @returns Homonym MEPs data
     */
    async getHomonymMEPs(options = {}) {
        return this.safeCallTool('get_homonym_meps', options, MEPS_FALLBACK);
    }
    /**
     * Get plenary documents
     *
     * @param options - Filter options including optional docId or year
     * @returns Plenary documents data
     */
    async getPlenaryDocuments(options = {}) {
        return this.safeCallTool('get_plenary_documents', options, DOCUMENTS_FALLBACK);
    }
    /**
     * Get committee documents
     *
     * @param options - Filter options including optional docId (v1.2.13: year removed)
     * @returns Committee documents data
     */
    async getCommitteeDocuments(options = {}) {
        return this.safeCallTool('get_committee_documents', options, DOCUMENTS_FALLBACK);
    }
    /**
     * Get plenary session documents (agendas, minutes, voting lists)
     *
     * @param options - Filter options including optional docId
     * @returns Plenary session documents data
     */
    async getPlenarySessionDocuments(options = {}) {
        return this.safeCallTool('get_plenary_session_documents', options, DOCUMENTS_FALLBACK);
    }
    /**
     * Get plenary session document items
     *
     * @param options - Pagination options
     * @returns Plenary session document items data
     */
    async getPlenarySessionDocumentItems(options = {}) {
        return this.safeCallTool('get_plenary_session_document_items', options, ITEMS_FALLBACK);
    }
    /**
     * Get controlled vocabularies (standardized classification terms)
     *
     * @param options - Filter options including optional vocId
     * @returns Controlled vocabularies data
     */
    async getControlledVocabularies(options = {}) {
        return this.safeCallTool('get_controlled_vocabularies', options, '{"vocabularies": []}');
    }
    /**
     * Get external documents (non-EP documents such as Council positions)
     *
     * @param options - Filter options including optional docId (v1.2.13: year removed)
     * @returns External documents data
     */
    async getExternalDocuments(options = {}) {
        return this.safeCallTool('get_external_documents', options, DOCUMENTS_FALLBACK);
    }
    /**
     * Get foreseen (planned) activities for a specific plenary sitting
     *
     * @param options - Options including required sittingId
     * @returns Foreseen activities data
     */
    async getMeetingForeseenActivities(options) {
        if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
            console.warn('get_meeting_foreseen_activities called without valid sittingId (non-empty string required)');
            return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
        }
        return this.safeCallTool('get_meeting_foreseen_activities', { ...options, sittingId: options.sittingId.trim() }, ACTIVITIES_FALLBACK);
    }
    /**
     * Get events linked to a specific legislative procedure
     *
     * @param options - Options including required processId
     * @returns Procedure events data
     */
    async getProcedureEvents(options) {
        if (typeof options.processId !== 'string' || options.processId.trim().length === 0) {
            console.warn('get_procedure_events called without valid processId (non-empty string required)');
            return { content: [{ type: 'text', text: EVENTS_FALLBACK }] };
        }
        return this.safeCallTool('get_procedure_events', { ...options, processId: options.processId.trim() }, EVENTS_FALLBACK);
    }
    /**
     * Get plenary session documents linked to a specific meeting
     *
     * @param options - Options including required sittingId
     * @returns Meeting plenary session documents data
     */
    async getMeetingPlenarySessionDocuments(options) {
        if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
            console.warn('get_meeting_plenary_session_documents called without valid sittingId (non-empty string required)');
            return { content: [{ type: 'text', text: DOCUMENTS_FALLBACK }] };
        }
        return this.safeCallTool('get_meeting_plenary_session_documents', { ...options, sittingId: options.sittingId.trim() }, DOCUMENTS_FALLBACK);
    }
    /**
     * Get plenary session document items linked to a specific meeting
     *
     * @param options - Options including required sittingId
     * @returns Meeting plenary session document items data
     */
    async getMeetingPlenarySessionDocumentItems(options) {
        if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
            console.warn('get_meeting_plenary_session_document_items called without valid sittingId (non-empty string required)');
            return { content: [{ type: 'text', text: ITEMS_FALLBACK }] };
        }
        return this.safeCallTool('get_meeting_plenary_session_document_items', { ...options, sittingId: options.sittingId.trim() }, ITEMS_FALLBACK);
    }
    /**
     * MEP relationship network mapping using committee co-membership
     *
     * @param options - Options including optional mepId, analysisType, and depth
     * @returns Network analysis with centrality scores and clusters
     */
    async networkAnalysis(options = {}) {
        return this.safeCallTool('network_analysis', options, INTELLIGENCE_FALLBACK);
    }
    /**
     * Track political group institutional positioning and sentiment
     *
     * @param options - Options including optional groupId and timeframe
     * @returns Sentiment tracking data
     */
    async sentimentTracker(options = {}) {
        return this.safeCallTool('sentiment_tracker', options, INTELLIGENCE_FALLBACK);
    }
    /**
     * Detect emerging political shifts and coalition fracture signals
     *
     * @param options - Options including optional sensitivity and focusArea
     * @returns Early warning alerts and trend indicators
     */
    async earlyWarningSystem(options = {}) {
        return this.safeCallTool('early_warning_system', options, INTELLIGENCE_FALLBACK);
    }
    /**
     * Cross-reference MEP activities for comparative multi-dimensional profiling
     *
     * @param options - Options including required mepIds array and optional dimensions
     * @returns Comparative intelligence profiles
     */
    async comparativeIntelligence(options) {
        if (!Array.isArray(options.mepIds) || options.mepIds.length < 2) {
            console.warn('comparative_intelligence called without valid mepIds (array of at least 2 required)');
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
    async correlateIntelligence(options) {
        if (!Array.isArray(options.mepIds) || options.mepIds.length === 0) {
            console.warn('correlate_intelligence called without valid mepIds (non-empty string array required)');
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
    async getAllGeneratedStats(options = {}) {
        return this.safeCallTool('get_all_generated_stats', options, STATS_FALLBACK);
    }
    // ─── EP API v2 Feed Endpoint Methods ────────────────────────────────────────
    /** Fallback payload for feed tools */
    static FEED_FALLBACK = '{"feed": []}';
    /**
     * Get MEPs feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns MEPs feed data
     */
    async getMEPsFeed(options = {}) {
        return this.safeCallTool('get_meps_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get events feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Events feed data
     */
    async getEventsFeed(options = {}) {
        return this.safeCallTool('get_events_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get procedures feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Procedures feed data
     */
    async getProceduresFeed(options = {}) {
        return this.safeCallTool('get_procedures_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
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
    async getAdoptedTextsFeed(options = {}) {
        const result = await this.safeCallTool('get_adopted_texts_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
        const payload = _parseResultPayload(result);
        const rawWarnings = payload?.['dataQualityWarnings'];
        const warnings = Array.isArray(rawWarnings)
            ? rawWarnings.filter((w) => typeof w === 'string')
            : [];
        const freshnessWarnings = warnings.filter((w) => w.startsWith('FRESHNESS_FALLBACK'));
        if (freshnessWarnings.length === 0) {
            return result;
        }
        // FRESHNESS_FALLBACK_FAILED: feed broken AND fallback also empty — escalate.
        // Pick the first FAILED warning specifically so the recorded reason is
        // accurate even when both FAILED and non-FAILED FRESHNESS_FALLBACK entries
        // co-exist in the same response.
        const failedWarning = freshnessWarnings.find((w) => w.startsWith('FRESHNESS_FALLBACK_FAILED'));
        if (failedWarning !== undefined) {
            return this._recordToolFailure('get_adopted_texts_feed', `ANALYSIS_ONLY: ${failedWarning.slice(0, 200)}`, EuropeanParliamentMCPClient.FEED_FALLBACK);
        }
        // FRESHNESS_FALLBACK (non-FAILED): server augmented with current-year items.
        // Keep the result but surface the freshness metadata so Stage-A consumers
        // can detect augmentation without re-parsing raw dataQualityWarnings.
        // Preserve the full MCPToolResult shape (isError, additional content items,
        // etc.) — only rewrite content[0].text with the augmented JSON.
        const augmented = {
            ...payload,
            freshness: 'augmented',
            dataFreshnessWarnings: freshnessWarnings,
        };
        const augmentedText = JSON.stringify(augmented);
        const originalContent = result.content;
        const updatedContent = Array.isArray(originalContent) && originalContent.length > 0
            ? originalContent.map((item, index) => index === 0 ? { ...item, text: augmentedText } : item)
            : [{ type: 'text', text: augmentedText }];
        return { ...result, content: updatedContent };
    }
    /**
     * Get MEP declarations feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns MEP declarations feed data
     */
    async getMEPDeclarationsFeed(options = {}) {
        return this.safeCallTool('get_mep_declarations_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get documents feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Documents feed data
     */
    async getDocumentsFeed(options = {}) {
        return this.safeCallTool('get_documents_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get plenary documents feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Plenary documents feed data
     */
    async getPlenaryDocumentsFeed(options = {}) {
        return this.safeCallTool('get_plenary_documents_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get committee documents feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Committee documents feed data
     */
    async getCommitteeDocumentsFeed(options = {}) {
        return this.safeCallTool('get_committee_documents_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get plenary session documents feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Plenary session documents feed data
     */
    async getPlenarySessionDocumentsFeed(options = {}) {
        return this.safeCallTool('get_plenary_session_documents_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get external documents feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns External documents feed data
     */
    async getExternalDocumentsFeed(options = {}) {
        return this.safeCallTool('get_external_documents_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get parliamentary questions feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Parliamentary questions feed data
     */
    async getParliamentaryQuestionsFeed(options = {}) {
        return this.safeCallTool('get_parliamentary_questions_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get corporate bodies feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Corporate bodies feed data
     */
    async getCorporateBodiesFeed(options = {}) {
        return this.safeCallTool('get_corporate_bodies_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get controlled vocabularies feed (most recent updates via EP API v2)
     *
     * @param options - Pagination options
     * @returns Controlled vocabularies feed data
     */
    async getControlledVocabulariesFeed(options = {}) {
        return this.safeCallTool('get_controlled_vocabularies_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
    }
    /**
     * Get a specific event linked to a legislative procedure.
     * Returns a single event for the specified procedure and event identifiers.
     *
     * @param options - Options including required processId and eventId
     * @returns Procedure event data
     */
    async getProcedureEventById(options) {
        if (typeof options.processId !== 'string' || options.processId.trim().length === 0) {
            console.warn('get_procedure_event_by_id called without valid processId (non-empty string required)');
            return { content: [{ type: 'text', text: PROCEDURE_EVENT_FALLBACK }] };
        }
        if (typeof options.eventId !== 'string' || options.eventId.trim().length === 0) {
            console.warn('get_procedure_event_by_id called without valid eventId (non-empty string required)');
            return { content: [{ type: 'text', text: PROCEDURE_EVENT_FALLBACK }] };
        }
        return this.safeCallTool('get_procedure_event_by_id', { processId: options.processId.trim(), eventId: options.eventId.trim() }, PROCEDURE_EVENT_FALLBACK);
    }
    /**
     * Check server health and feed availability status.
     * Returns server version, uptime, per-feed health status, and overall availability.
     * Does not make upstream API calls — reports cached status from recent tool invocations.
     *
     * @returns Server health and feed availability data
     */
    async getServerHealth() {
        return this.safeCallTool('get_server_health', {}, SERVER_HEALTH_FALLBACK);
    }
}
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