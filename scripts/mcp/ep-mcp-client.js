// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/EPMCPClient
 * @description European Parliament MCP client — domain-specific tool wrappers
 * built on top of the generic {@link MCPConnection} transport.
 */
import { MCPConnection } from './mcp-connection.js';
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
/**
 * MCP Client for European Parliament data access.
 * Extends {@link MCPConnection} with EP-specific tool wrapper methods.
 */
export class EuropeanParliamentMCPClient extends MCPConnection {
    /**
     * Generic error-safe wrapper around {@link callToolWithRetry}.
     * Retries transient failures (timeouts, connection drops) with exponential
     * back-off before falling back. Non-retriable errors (session expiry, rate
     * limits, programmer errors) are caught immediately without additional delay.
     * Catches any error thrown by the tool (or by the args factory), logs a warning,
     * and returns a fallback payload.
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
        try {
            const resolvedArgs = typeof args === 'function' ? args() : args;
            return await this.callToolWithRetry(toolName, resolvedArgs);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`${toolName} not available:`, message);
            return { content: [{ type: 'text', text: fallbackText }] };
        }
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
     * @param options - Filter options. `dateFrom` is mapped to `startDate` and `dateTo` to `endDate`
     *   per the tool schema when the canonical fields are absent.
     * @returns Plenary sessions data
     */
    async getPlenarySessions(options = {}) {
        return this.safeCallTool('get_plenary_sessions', () => {
            const { dateFrom, dateTo, ...rest } = options;
            const normalizedOptions = { ...rest };
            if (normalizedOptions['startDate'] === undefined && dateFrom !== undefined) {
                normalizedOptions['startDate'] = dateFrom;
            }
            if (normalizedOptions['endDate'] === undefined && dateTo !== undefined) {
                normalizedOptions['endDate'] = dateTo;
            }
            return normalizedOptions;
        }, '{"sessions": []}');
    }
    /**
     * Search legislative documents
     *
     * @param options - Search options (normalizes `keyword` to `query` if `query` is absent)
     * @returns Search results
     */
    async searchDocuments(options = {}) {
        return this.safeCallTool('search_documents', () => {
            const { keyword, ...rest } = options;
            const normalizedOptions = { ...rest };
            if (normalizedOptions['query'] === undefined && keyword !== undefined) {
                const trimmed = String(keyword).trim();
                if (trimmed.length > 0) {
                    normalizedOptions['query'] = trimmed;
                }
            }
            return normalizedOptions;
        }, DOCUMENTS_FALLBACK);
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
        return this.safeCallTool('get_parliamentary_questions', () => {
            const { dateFrom, dateTo: _dateTo, ...rest } = options;
            const toolOptions = { ...rest };
            if (toolOptions['startDate'] === undefined && dateFrom !== undefined) {
                toolOptions['startDate'] = dateFrom;
            }
            return toolOptions;
        }, '{"questions": []}');
    }
    /**
     * Get committee information
     *
     * @param options - Filter options
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
     * @param options - Options including optional political groups and date range
     * @returns Coalition cohesion and stress analysis
     */
    async analyzeCoalitionDynamics(options = {}) {
        return this.safeCallTool('analyze_coalition_dynamics', options, '{"coalitions": []}');
    }
    /**
     * Detect voting anomalies and party defections
     *
     * @param options - Options including optional MEP id, political group, and date
     * @returns Anomaly detection results
     */
    async detectVotingAnomalies(options = {}) {
        return this.safeCallTool('detect_voting_anomalies', options, '{"anomalies": []}');
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
        return this.safeCallTool('compare_political_groups', { ...options, groups }, '{"comparison": {}}');
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
     * @param options - Filter options (mepId, sessionId, limit)
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
     * @param options - Filter options including optional speechId or date range
     * @returns Speeches data
     */
    async getSpeeches(options = {}) {
        return this.safeCallTool('get_speeches', options, '{"speeches": []}');
    }
    /**
     * Get legislative procedures
     *
     * @param options - Filter options including optional processId or year
     * @returns Procedures data
     */
    async getProcedures(options = {}) {
        return this.safeCallTool('get_procedures', options, '{"procedures": []}');
    }
    /**
     * Get adopted texts (legislative resolutions, positions, non-legislative resolutions)
     *
     * @param options - Filter options including optional docId or year
     * @returns Adopted texts data
     */
    async getAdoptedTexts(options = {}) {
        return this.safeCallTool('get_adopted_texts', options, '{"texts": []}');
    }
    /**
     * Get European Parliament events (hearings, conferences, seminars)
     *
     * @param options - Filter options including optional eventId or date range
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
     * @param options - Filter options including optional docId or year
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
     * @param options - Filter options including optional docId or year
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
     * @param options - Options including optional mepId and correlation scenarios
     * @returns Correlated intelligence alerts and insights
     */
    async correlateIntelligence(options = {}) {
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