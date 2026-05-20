// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/ep/client
 * @description European Parliament MCP client — domain-specific tool wrappers
 * built on top of the generic {@link MCPConnection} transport.
 *
 * The class skeleton (fields, constructor, core utility methods, and diagnostics)
 * is defined here. Domain method groups are mixed into the prototype via
 * side-effect imports of the `tools-*.ts` sibling modules.
 */
import { MCPConnection } from '../mcp-connection.js';
import { classifyToolError, isFeedUnavailable } from './error-classifier.js';
import { FEED_UNAVAILABLE_REASON } from './fallbacks.js';
import { TOOL_RELIABILITY_TIMEOUT_MS, TOOL_RELIABILITY_TIMEOUT_RETRIES } from './reliability.js';
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
    _failedTools = new Map();
    /** Tracks tools that have been called (attempted) in the current session */
    _calledTools = new Set();
    /**
     * Tracks tools that experienced a timeout but the failure was downgraded to a warning.
     * Unlike `_failedTools`, entries here are NOT counted against the reliability score.
     */
    _slowFeedWarnings = new Map();
    /**
     * Path to the pending-documents sidecar file.
     * Undefined means "use the module-level default (`<cwd>/data/pending-documents.json`)".
     */
    _pendingDocumentsStorePath;
    /**
     * Create a new EP MCP client.
     *
     * @param options - Connection and gateway options forwarded to {@link MCPConnection},
     *   plus an optional `pendingDocumentsStorePath` that overrides the
     *   default `<cwd>/data/pending-documents.json` sidecar location.
     */
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
        console.warn(`\u26a0\ufe0f ${toolName} failed [${errorType}]:`, errorText.slice(0, 200));
        return { content: [{ type: 'text', text: fallbackText }] };
    }
    /**
     * Generic error-safe wrapper around {@link callToolWithRetry}.
     * Catches any error thrown by the tool (or by the args factory), logs a warning,
     * and returns a fallback payload.
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
            if (result.isError === true) {
                return this._recordToolFailure(toolName, result.content?.[0]?.text ?? '', fallbackText);
            }
            if (isFeedUnavailable(result)) {
                return this._recordToolFailure(toolName, `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? FEED_UNAVAILABLE_REASON}`, fallbackText);
            }
            this._failedTools.delete(toolName);
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return this._recordToolFailure(toolName, message, fallbackText);
        }
    }
    /**
     * Build a standardized per-tool timeout error.
     * @param toolName - MCP tool identifier
     * @param timeoutMs - Timeout threshold in milliseconds
     * @param cause - Optional underlying error
     * @returns Formatted timeout error
     */
    _buildReliabilityTimeoutError(toolName, timeoutMs, cause) {
        return new Error(`UPSTREAM_TIMEOUT: ${toolName} exceeded per-tool timeout (${timeoutMs}ms)`, {
            cause,
        });
    }
    /**
     * Execute one MCP tool attempt with a per-tool timeout guard.
     * @param toolName - MCP tool identifier
     * @param args - Tool arguments
     * @param timeoutMs - Timeout threshold in milliseconds
     * @returns Tool result or throws on timeout
     */
    async _callToolOnceWithReliabilityTimeout(toolName, args, timeoutMs) {
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => reject(this._buildReliabilityTimeoutError(toolName, timeoutMs)), timeoutMs);
        });
        try {
            return await Promise.race([this.callToolWithRetry(toolName, args, 0), timeoutPromise]);
        }
        finally {
            if (timer)
                clearTimeout(timer);
        }
    }
    /**
     * Decide retry/throw behavior for a failed reliability-timed attempt.
     * @param toolName - MCP tool identifier
     * @param timeoutMs - Timeout threshold in milliseconds
     * @param error - The error that occurred
     * @param timeoutObserved - Whether a timeout was previously observed
     * @param attempt - Current attempt number
     * @param timeoutRetries - Maximum allowed timeout retries
     * @returns Decision object with retry flag and error details
     */
    _decideReliabilityAttemptError(toolName, timeoutMs, error, timeoutObserved, attempt, timeoutRetries) {
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
     * @param toolName - MCP tool identifier
     * @param args - Tool arguments
     * @param timeoutMs - Timeout threshold in milliseconds
     * @param timeoutRetries - Maximum allowed timeout retries
     * @returns Tool result
     */
    async callToolWithReliabilityTimeout(toolName, args, timeoutMs = TOOL_RELIABILITY_TIMEOUT_MS, timeoutRetries = TOOL_RELIABILITY_TIMEOUT_RETRIES) {
        let lastError = new Error(`Timed out calling ${toolName}`);
        let timeoutObserved = false;
        for (let attempt = 0; attempt <= timeoutRetries; attempt++) {
            try {
                return await this._callToolOnceWithReliabilityTimeout(toolName, args, timeoutMs);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                const decision = this._decideReliabilityAttemptError(toolName, timeoutMs, lastError, timeoutObserved, attempt, timeoutRetries);
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
    async safeCallToolWithReliabilityTimeout(toolName, args, fallbackText) {
        this._calledTools.add(toolName);
        try {
            const resolvedArgs = typeof args === 'function' ? args() : args;
            const result = await this.callToolWithReliabilityTimeout(toolName, resolvedArgs);
            if (result.isError === true) {
                return this._recordToolFailure(toolName, result.content?.[0]?.text ?? '', fallbackText);
            }
            if (isFeedUnavailable(result)) {
                return this._recordToolFailure(toolName, `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? FEED_UNAVAILABLE_REASON}`, fallbackText);
            }
            this._failedTools.delete(toolName);
            return result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return this._recordToolFailure(toolName, message, fallbackText);
        }
    }
    // \u2500\u2500\u2500 Diagnostics \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    /**
     * Get a summary of tools that returned fallback data in the current session.
     *
     * @returns Map of tool name to error description
     */
    getFailedTools() {
        return new Map(this._failedTools);
    }
    /**
     * Get tools that experienced a timeout but the failure was downgraded to a warning.
     *
     * @returns Map of tool name to warning description
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
                lines.push(`  \u274c ${tool}: ${error}`);
            }
            else if (slowWarning) {
                lines.push(`  \ud83d\udfe1 ${tool}: ${slowWarning}`);
            }
            else if (this._calledTools.has(tool)) {
                lines.push(`  \u2705 ${tool}`);
                operational++;
            }
            else {
                lines.push(`  \u26aa ${tool} (not checked)`);
                unchecked++;
            }
        }
        const checked = feedTools.length - unchecked;
        lines.push(`  Summary: ${operational}/${checked} checked feeds operational${unchecked > 0 ? `, ${unchecked} unchecked` : ''}`);
        return lines.join('\n');
    }
    /**
     * Get a per-error-code breakdown of tool-level rejections.
     *
     * @returns Formatted summary of tool errors by code
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
}
// \u2500\u2500\u2500 Singleton factory \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
let clientInstance = null;
/**
 * Get or create singleton MCP client instance
 *
 * @param options - Client options
 * @returns Connected MCP client
 */
export async function getEPMCPClient(options = {}) {
    if (!clientInstance) {
        const client = new EuropeanParliamentMCPClient(options);
        try {
            await client.connect();
            clientInstance = client;
        }
        catch (error) {
            clientInstance = null;
            throw error;
        }
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
// Side-effect mixin imports live in the barrel (ep-mcp-client.ts) to avoid
// circular-dependency issues. ES module static imports are hoisted, so
// importing tools-*.ts from here causes the class to be accessed before it
// is initialised. See ep-mcp-client.ts for the actual imports.
//# sourceMappingURL=client.js.map