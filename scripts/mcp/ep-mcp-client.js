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
/**
 * MCP Client for European Parliament data access.
 * Extends {@link MCPConnection} with EP-specific tool wrapper methods.
 */
export class EuropeanParliamentMCPClient extends MCPConnection {
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
     * @param options - Filter options. `dateFrom` is mapped to `startDate` and `dateTo` to `endDate`
     *   per the tool schema when the canonical fields are absent.
     * @returns Plenary sessions data
     */
    async getPlenarySessions(options = {}) {
        try {
            const { dateFrom, dateTo, ...rest } = options;
            const normalizedOptions = { ...rest };
            if (normalizedOptions['startDate'] === undefined && dateFrom !== undefined) {
                normalizedOptions['startDate'] = dateFrom;
            }
            if (normalizedOptions['endDate'] === undefined && dateTo !== undefined) {
                normalizedOptions['endDate'] = dateTo;
            }
            return await this.callTool('get_plenary_sessions', normalizedOptions);
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
    async analyzeLegislativeEffectiveness(options) {
        const { subjectType, subjectId } = options;
        if (subjectId.trim().length === 0) {
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
    /**
     * Analyze committee activity, workload, and engagement
     *
     * @param options - Options including optional committeeId and date range
     * @returns Committee activity analysis data
     */
    async analyzeCommitteeActivity(options = {}) {
        try {
            return await this.callTool('analyze_committee_activity', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('analyze_committee_activity not available:', message);
            return { content: [{ type: 'text', text: '{"activity": null}' }] };
        }
    }
    /**
     * Track MEP attendance patterns and trends
     *
     * @param options - Options including optional mepId and date range
     * @returns MEP attendance data
     */
    async trackMEPAttendance(options = {}) {
        try {
            return await this.callTool('track_mep_attendance', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('track_mep_attendance not available:', message);
            return { content: [{ type: 'text', text: '{"attendance": null}' }] };
        }
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
        try {
            return await this.callTool('analyze_country_delegation', {
                ...options,
                country: options.country.trim(),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('analyze_country_delegation not available:', message);
            return { content: [{ type: 'text', text: '{"delegation": null}' }] };
        }
    }
    /**
     * Generate a parliament-wide political landscape overview
     *
     * @param options - Options including optional date range and detail level
     * @returns Political landscape overview data
     */
    async generatePoliticalLandscape(options = {}) {
        try {
            return await this.callTool('generate_political_landscape', options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('generate_political_landscape not available:', message);
            return { content: [{ type: 'text', text: '{"landscape": null}' }] };
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