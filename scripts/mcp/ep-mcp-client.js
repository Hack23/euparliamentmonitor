// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/EPMCPClient
 * @description European Parliament MCP client — domain-specific tool wrappers
 * built on top of the generic {@link MCPConnection} transport.
 */
import { MCPConnection } from './mcp-connection.js';
import { ProcedureSeenCache } from './procedure-seen-cache.js';
import { recordPendingDocument, markDocumentResolved, getPendingDocumentsForReprobe, escalateExpiredDocuments, getPendingDocumentsSummary, } from './pending-documents.js';
import { EP_NEXT_ELECTION_START, EP_NEXT_ELECTION_END, EP_CURRENT_TERM, EP_NEXT_TERM, } from '../constants/config.js';
/**
 * Canonical list of tools exposed by the European Parliament MCP gateway
 * (`european-parliament-mcp-server@1.2.19`). The news workflows, prompt
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
/** Fallback payload for adopted texts tools */
const ADOPTED_TEXTS_FALLBACK = '{"texts": []}';
/**
 * Substring matched (case-insensitively) in error messages to identify the
 * EP Open Data Portal indexing lag (5–15 days between identifier publication
 * and content availability).  Must not be changed without updating tests.
 */
const CONTENT_NOT_YET_AVAILABLE_SUBSTRING = 'document indexed but content not yet available';
/**
 * Classify an error message into a diagnostic error category.
 *
 * Maps EP MCP Server v1.2.19 structured error codes and generic HTTP/network
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
    // EP MCP Server v1.2.19 structured error codes (matched case-insensitively)
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
 *    `european-parliament-mcp-server@1.2.19`) —
 *    `{status:"unavailable", items:[], generatedAt:"..."}` established by
 *    Hack23/European-Parliament-MCP-Server#301 and extended to
 *    `get_events_feed`/`get_procedures_feed` by
 *    Hack23/European-Parliament-MCP-Server#380 (which closed #378).
 * 2. **Pre-v1.2.13 raw upstream 404 shape** (historically emitted pre-v1.2.13 by
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
    // Shape 2 — pre-v1.2.13 raw upstream 404 leak (historically pre-v1.2.13, #378).
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
 * Year threshold for detecting historical-only (recess-mode) procedures feed responses.
 * Any response where ALL dated items are from this year or earlier is considered recess mode.
 * See `.github/prompts/07-mcp-reference.md` §11 row #5.
 */
const PROCEDURES_RECESS_YEAR_THRESHOLD = 1995;
/**
 * Minimum plausible year for EP procedure dates.
 * The European Parliament was established in 1952; anything earlier is malformed.
 */
const MIN_VALID_PROCEDURE_YEAR = 1952;
/**
 * Maximum plausible year for EP procedure dates.
 * Used as an upper sanity bound to reject obviously malformed 4-digit strings.
 */
const MAX_VALID_PROCEDURE_YEAR = 2100;
/**
 * Extract the first valid 4-digit year from an EP procedure item.
 * Checks `dateInitiated`, then `dateLastActivity`, then the first 4 characters
 * of `reference` (e.g. `"1972/0001(SYN)"`), returning `NaN` when none found.
 *
 * @param obj - Procedure item as a plain record
 * @returns 4-digit year number, or `NaN` if no valid year field exists
 */
function extractProcedureItemYear(obj) {
    const dateFields = [obj['dateInitiated'], obj['dateLastActivity'], obj['reference']];
    for (const field of dateFields) {
        if (typeof field !== 'string' || field.length < 4)
            continue;
        const year = Number(field.slice(0, 4));
        if (!Number.isNaN(year) &&
            year >= MIN_VALID_PROCEDURE_YEAR &&
            year <= MAX_VALID_PROCEDURE_YEAR) {
            return year;
        }
    }
    return NaN;
}
/**
 * Detect whether a procedures feed response is in "recess mode" — i.e., all items
 * have dates from {@link PROCEDURES_RECESS_YEAR_THRESHOLD} or earlier (historical archive).
 *
 * During parliamentary recesses the EP procedures/feed endpoint may return historical
 * archive data in ID order rather than current procedures. This function detects that
 * condition so callers can emit a `🟡 procedures-feed: recess mode` audit row instead
 * of treating the response as usable current data.
 *
 * Date extraction order per item: `dateInitiated`, then `dateLastActivity`, then
 * `reference` (first four characters). The first valid 4-digit year found in the
 * range `[1952, 2100]` is used.
 *
 * Returns `false` when the payload is `undefined`, contains no items, or any item
 * yields a year later than the threshold (the feed has current data).
 *
 * @param payload - Parsed procedures feed payload
 * @returns `true` when all dated items are from {@link PROCEDURES_RECESS_YEAR_THRESHOLD} or earlier
 */
export function detectProceduresFeedRecessMode(payload) {
    if (!payload)
        return false;
    // Collect items from feed shape (`items[]`) or direct-endpoint shape (`procedures[]`)
    const rawItems = payload['items'] ?? payload['procedures'];
    const items = Array.isArray(rawItems) ? rawItems : [];
    if (items.length === 0)
        return false;
    const years = [];
    for (const item of items) {
        if (!item || typeof item !== 'object')
            continue;
        const year = extractProcedureItemYear(item);
        if (!Number.isNaN(year)) {
            years.push(year);
        }
    }
    // Recess mode: items exist but every dated item is from the historical-archive window
    return years.length > 0 && years.every((y) => y <= PROCEDURES_RECESS_YEAR_THRESHOLD);
}
/**
 * Compute the election calendar context for the EP10 → EP11 transition.
 * Returns deterministic output for any reference date (defaults to `new Date()`).
 *
 * Tier mapping (per `analysis/methodologies/electoral-cycle-methodology.md`):
 * - `daysToElection > 180`  → `NONE`
 * - `180 ≥ d > 90`          → `T-180`
 * - `90 ≥ d > 30`           → `T-90`
 * - `30 ≥ d`                → `T-30`
 *
 * @param referenceDate - Date to compute from (default: now)
 * @returns Election calendar context with term, window, days, and tier
 */
export function getElectionCalendarContext(referenceDate) {
    const ref = referenceDate ?? new Date();
    const electionStart = new Date(EP_NEXT_ELECTION_START + 'T00:00:00Z');
    const diffMs = electionStart.getTime() - ref.getTime();
    const daysToElection = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    let electionImminentTier;
    if (daysToElection > 180) {
        electionImminentTier = 'NONE';
    }
    else if (daysToElection > 90) {
        electionImminentTier = 'T-180';
    }
    else if (daysToElection > 30) {
        electionImminentTier = 'T-90';
    }
    else {
        electionImminentTier = 'T-30';
    }
    // If we're past the election end, the current term is EP11
    const electionEnd = new Date(EP_NEXT_ELECTION_END + 'T23:59:59Z');
    const termId = ref.getTime() > electionEnd.getTime() ? EP_NEXT_TERM : EP_CURRENT_TERM;
    return {
        termId,
        nextElectionWindow: { start: EP_NEXT_ELECTION_START, end: EP_NEXT_ELECTION_END },
        daysToElection,
        electionImminentTier,
    };
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
     * Tracks tools that experienced a timeout but the failure was downgraded to a warning.
     * Unlike `_failedTools`, entries here are NOT counted against the reliability score.
     * Currently used by {@link getEventsFeed} whose documented latency is 30–120 s+.
     */
    _slowFeedWarnings = new Map();
    /**
     * Path to the pending-documents sidecar file.
     * Undefined means "use the module-level default (`<cwd>/data/pending-documents.json`)".
     */
    _pendingDocumentsStorePath;
    constructor(options = {}) {
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
            // (all feeds as of v1.2.13, #301/#380) as well as the pre-v1.2.13 raw upstream
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
     * Get tools that experienced a timeout but the failure was downgraded to a warning.
     * Unlike {@link getFailedTools}, entries here are **not** counted against the
     * reliability score — they represent expected-slow tools whose timeouts are
     * classified as 🟢 LIMITATION (see `.github/prompts/07-mcp-reference.md` §11 row #8).
     *
     * @returns Map of tool name to `"SLOW_FEED: <message>"` warning description
     */
    getSlowFeedWarnings() {
        return new Map(this._slowFeedWarnings);
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
            const slowWarning = this._slowFeedWarnings.get(tool);
            if (error) {
                lines.push(`  ❌ ${tool}: ${error}`);
            }
            else if (slowWarning) {
                // Slow-feed warning: timeout was downgraded — not counted as a failure or success
                lines.push(`  🟡 ${tool}: ${slowWarning}`);
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
     * This repository is currently documented/configured against
     * `european-parliament-mcp-server@1.2.19`.
     *
     * **Upstream date-filter contract (v1.2.14+, active on the pinned v1.2.19 server):** the upstream server
     * applies a server-side post-filter on `dateFrom`/`dateTo` before serialisation, because the
     * EP Open Data Portal `/meetings` endpoint silently ignores its `date-from`/`date-to` query
     * parameters (Defect #5). Under this contract:
     * - `data[]` contains only sessions within the requested window.
     * - `total` reflects the **filtered** count, not the raw upstream count.
     * - Per-window session counts are reproducible because the EP-side regression is masked by
     *   the upstream post-filter.
     *
     * No local post-filter is applied here. The repository is pinned to v1.2.19, so the
     * date-filter guarantees above apply; consumers running against an older server image
     * (pre-v1.2.14) must not assume them.
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
    async getFreshProcedures(options = {}) {
        const { limit = 100, windowDays = 30, topN, seenCacheStorePath } = options;
        // Step 1 — fetch from stable (non-feed) endpoint
        const raw = await this.getProcedures({ limit });
        const payload = _parseResultPayload(raw);
        const payloadProcedures = payload?.['procedures'];
        const allProcedures = Array.isArray(payloadProcedures) ? payloadProcedures : [];
        // Step 2 — sort client-side by dateLastActivity DESC (fall back to dateInitiated)
        const todayMinus = new Date();
        todayMinus.setUTCDate(todayMinus.getUTCDate() - windowDays);
        const cutoff = todayMinus.toISOString().slice(0, 10); // YYYY-MM-DD
        const normalised = allProcedures.filter((p) => p !== null && typeof p === 'object' && !Array.isArray(p));
        const withSortKey = normalised.map((p) => {
            const dla = typeof p['dateLastActivity'] === 'string' ? p['dateLastActivity'] : '';
            const di = typeof p['dateInitiated'] === 'string' ? p['dateInitiated'] : '';
            return { item: p, effectiveDate: dla.length > 0 ? dla : di };
        });
        withSortKey.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
        // Step 3 — filter to window
        const inWindow = withSortKey
            .filter(({ effectiveDate }) => effectiveDate >= cutoff)
            .map(({ item }) => item);
        const result = topN !== undefined ? inWindow.slice(0, topN) : inWindow;
        // Step 4 — persist to seen-cache (new IDs and changed dateLastActivity)
        const cache = new ProcedureSeenCache(seenCacheStorePath);
        for (const p of result) {
            const id = typeof p['id'] === 'string' ? p['id'] : '';
            const dateLastActivity = typeof p['dateLastActivity'] === 'string' ? p['dateLastActivity'] : '';
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
    async getAdoptedTexts(options = {}) {
        // docId lookups use a contextual wrapper so the initial log category is
        // CONTENT_PENDING, not NOT_FOUND followed by a post-hoc reclassification.
        if (typeof options.docId === 'string' && options.docId.trim().length > 0) {
            return this._fetchAdoptedTextByDocId(options.docId.trim());
        }
        // Year-range list queries use the standard wrapper.
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
     *    message contains {@link CONTENT_NOT_YET_AVAILABLE_SUBSTRING}.
     *
     * 2. **Empty-string sentinel** (`isError:false`, pre-v1.2.13 defence-in-depth):
     *    every string field is `""`.
     *
     * @param docId - Trimmed document identifier
     * @returns Adopted texts data or `ADOPTED_TEXTS_FALLBACK`
     */
    async _fetchAdoptedTextByDocId(docId) {
        this._calledTools.add('get_adopted_texts');
        const persistPending = (label) => recordPendingDocument(docId, this._pendingDocumentsStorePath)
            .then(() => undefined)
            .catch((err) => {
            console.warn(`⚠️ pending-documents: failed to record pending doc (${label}):`, err.message);
        });
        try {
            const result = await this.callToolWithRetry('get_adopted_texts', { docId });
            // ── isError structured response ──
            if (result.isError === true) {
                const text = result.content?.[0]?.text ?? '';
                if (text.toLowerCase().includes(CONTENT_NOT_YET_AVAILABLE_SUBSTRING)) {
                    this._failedTools.set('get_adopted_texts', `CONTENT_PENDING: ${docId} EP indexing lag (tracked in pending-documents sidecar)`);
                    console.warn(`⚠️ get_adopted_texts [CONTENT_PENDING]: ${docId} EP indexing lag`);
                    await persistPending('isError');
                    return { content: [{ type: 'text', text: ADOPTED_TEXTS_FALLBACK }] };
                }
                return this._recordToolFailure('get_adopted_texts', text, ADOPTED_TEXTS_FALLBACK);
            }
            // ── Empty-string sentinel (pre-v1.2.13 defence-in-depth) ──
            const payload = _parseResultPayload(result);
            if (_isEmptyStringSentinel(payload)) {
                await persistPending('sentinel');
                return this._recordToolFailure('get_adopted_texts', `CONTENT_PENDING: docId=${docId} returned empty-string sentinel (upstream #369)`, ADOPTED_TEXTS_FALLBACK);
            }
            this._failedTools.delete('get_adopted_texts');
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            // ── Primary: UPSTREAM_404 indexing lag (thrown exception) ──
            if (message.toLowerCase().includes(CONTENT_NOT_YET_AVAILABLE_SUBSTRING)) {
                this._failedTools.set('get_adopted_texts', `CONTENT_PENDING: ${docId} EP indexing lag (tracked in pending-documents sidecar)`);
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
    async getDueAdoptedTextsForReprobe() {
        return getPendingDocumentsForReprobe(this._pendingDocumentsStorePath);
    }
    /**
     * Mark a previously-pending adopted text as resolved (content is now
     * available and has been successfully retrieved).
     *
     * @param docId - Adopted-text identifier (e.g., "TA-10-2026-0104")
     */
    async resolveAdoptedText(docId) {
        await markDocumentResolved(docId, this._pendingDocumentsStorePath);
    }
    /**
     * Escalate PENDING adopted texts that have exceeded the 14-day maximum
     * tracking age.  Escalated documents are excluded from future reprobes and
     * should be handled by the wildcards-blackswans family.
     *
     * @returns Array of docIds that were escalated
     */
    async escalateStalePendingDocuments() {
        return escalateExpiredDocuments(this._pendingDocumentsStorePath);
    }
    /**
     * Return a human-readable summary of the pending-documents sidecar for
     * Stage B observability logging.
     *
     * @returns Formatted summary string
     */
    async getPendingDocumentsSummary() {
        return getPendingDocumentsSummary(this._pendingDocumentsStorePath);
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
    async getEventsFeed(options = {}) {
        this._calledTools.add('get_events_feed');
        try {
            const result = await this.callToolWithRetry('get_events_feed', options);
            // Inspect for structured error responses (isError flag) from the EP MCP server
            if (result.isError === true) {
                this._slowFeedWarnings.delete('get_events_feed');
                return this._recordToolFailure('get_events_feed', result.content?.[0]?.text ?? '', EuropeanParliamentMCPClient.FEED_FALLBACK);
            }
            // Detect unavailable-feed envelope (uniform {status:"unavailable"} or pre-v1.2.13 404)
            if (isFeedUnavailable(result)) {
                this._slowFeedWarnings.delete('get_events_feed');
                return this._recordToolFailure('get_events_feed', `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? 'feed unavailable'}`, EuropeanParliamentMCPClient.FEED_FALLBACK);
            }
            // Success — clear any prior failure or slow-feed warning so health summary stays accurate
            this._failedTools.delete('get_events_feed');
            this._slowFeedWarnings.delete('get_events_feed');
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            // Downgrade genuine TIMEOUT errors to slow-feed warnings — not counted against success rate.
            // The events feed latency is 30–120 s+; timeouts are expected during EP API load
            // and classified as 🟢 LIMITATION per 07-mcp-reference.md §11 row #8.
            // Use classifyToolError so 504 "Gateway Timeout" stays in SERVER_ERROR, not slow-feed.
            if (classifyToolError(message) === 'TIMEOUT') {
                const warningMsg = `SLOW_FEED: ${message.slice(0, 200)}`;
                // Clear any prior failure entry so health summary doesn't show ❌ alongside 🟡
                this._failedTools.delete('get_events_feed');
                this._slowFeedWarnings.set('get_events_feed', warningMsg);
                console.warn('🟡 get_events_feed slow-feed warning [SLOW_FEED]:', message.slice(0, 200));
                return { content: [{ type: 'text', text: '{"feed":[],"slowFeedWarning":true}' }] };
            }
            // Non-timeout failure: clear any stale slow-feed warning so health summary reflects reality
            this._slowFeedWarnings.delete('get_events_feed');
            return this._recordToolFailure('get_events_feed', message, EuropeanParliamentMCPClient.FEED_FALLBACK);
        }
    }
    /**
     * Get procedures feed (most recent updates via EP API v2)
     *
     * Post-processes the response to detect "recess mode" — when the EP procedures
     * feed returns historical archive data (all items dated ≤ 1995) instead of
     * current procedures. This happens during parliamentary recesses when the EP API
     * serves its historical archive in ID order.
     *
     * When recess mode is detected:
     * - `recessMode: true` is added to the payload
     * - A `RECESS_MODE: …` entry is appended to `dataQualityWarnings[]`
     * - A `🟡 procedures-feed: recess mode` console warning is emitted
     *
     * The tool is **not** recorded as failed — this is documented EP API behaviour
     * classified as 🟢 LIMITATION in `.github/prompts/07-mcp-reference.md` §11 row #5.
     * Downstream Stage A consumers should fall back to
     * `get_adopted_texts({ year: $YEAR })` or `track_legislation({ procedureId })`.
     *
     * @param options - Pagination options
     * @returns Procedures feed data, possibly with `recessMode: true` added to the payload
     */
    async getProceduresFeed(options = {}) {
        const result = await this.safeCallTool('get_procedures_feed', options, EuropeanParliamentMCPClient.FEED_FALLBACK);
        // Recess-mode detection: if all dated items are from ≤1995, the feed returned
        // historical archive data instead of current procedures (EP API recess behaviour).
        // See .github/prompts/07-mcp-reference.md §11 row #5.
        const payload = _parseResultPayload(result);
        if (detectProceduresFeedRecessMode(payload)) {
            console.warn('🟡 procedures-feed: recess mode — response contains only historical procedures (≤1995); use get_adopted_texts({ year: $YEAR }) or track_legislation({ procedureId }) instead');
            const existingWarnings = Array.isArray(payload?.['dataQualityWarnings'])
                ? payload['dataQualityWarnings']
                : [];
            const augmented = {
                ...payload,
                recessMode: true,
                dataQualityWarnings: [
                    ...existingWarnings,
                    'RECESS_MODE: procedures-feed returned historical archive (all items ≤1995) — likely parliamentary recess; fallback: get_adopted_texts({ year: $YEAR }) or track_legislation({ procedureId })',
                ],
            };
            const augmentedText = JSON.stringify(augmented);
            const originalContent = result.content;
            const updatedContent = Array.isArray(originalContent) && originalContent.length > 0
                ? originalContent.map((item, index) => index === 0 ? { ...item, text: augmentedText } : item)
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
     * Get Commission Work Programme documents from the external documents feed.
     * Convenience wrapper that filters `get_external_documents_feed` by
     * `workType: 'COM_WORK_PROGRAMME'`.
     *
     * @param options - Additional feed options (timeframe, startDate)
     * @returns External documents feed data filtered to Commission WP
     */
    async getCommissionWorkProgramme(options = {}) {
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
    async getCouncilPresidencyProgramme(options = {}) {
        return this.getExternalDocumentsFeed({ ...options, workType: 'COUNCIL_PRESIDENCY_PROGRAMME' });
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