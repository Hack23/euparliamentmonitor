// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { getEPMCPClient } from '../../mcp/ep-mcp-client.js';
import { parsePlenarySessions, parseCommitteeMeetings, parseLegislativeDocuments, parseLegislativePipeline, parseParliamentaryQuestions, parseEPEvents, PLACEHOLDER_EVENTS, } from '../week-ahead-content.js';
import { applyCommitteeInfo, applyDocuments, applyEffectiveness } from '../committee-helpers.js';
import { getMotionsFallbackData } from '../motions-content.js';
import { escapeHTML } from '../../utils/file-utils.js';
// ─── Shared string constants ─────────────────────────────────────────────────
/** Log prefix for MCP fetch operations */
const MCP_FETCH_PREFIX = '  📡';
/** Warning prefix for MCP failures */
const WARN_PREFIX = '  ⚠️';
/** Info prefix for fallback messages */
const INFO_PREFIX = '  ℹ️';
/**
 * Circuit breaker preventing cascading MCP failures.
 *
 * - **CLOSED** — normal operation; all requests pass through.
 * - **OPEN** — fast-fail; requests are rejected for `resetTimeoutMs` ms.
 * - **HALF_OPEN** — probe state; one request is allowed to test recovery.
 */
export class CircuitBreaker {
    state = 'CLOSED';
    consecutiveFailures = 0;
    nextAttemptAt = 0;
    halfOpenProbeInFlight = false;
    failureThreshold;
    resetTimeoutMs;
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold ?? 3;
        this.resetTimeoutMs = options.resetTimeoutMs ?? 60_000;
    }
    /**
     * Whether a request may proceed given the current circuit state.
     *
     * In HALF_OPEN state only a single probe is allowed at a time; subsequent
     * calls return `false` until the in-flight probe records success or failure.
     *
     * @returns `true` when the circuit is CLOSED, or HALF_OPEN with no probe in flight
     */
    canRequest() {
        if (this.state === 'CLOSED')
            return true;
        if (this.state === 'OPEN') {
            if (Date.now() >= this.nextAttemptAt) {
                this.state = 'HALF_OPEN';
                this.halfOpenProbeInFlight = false;
                // Fall through to HALF_OPEN probe logic below
            }
            else {
                return false;
            }
        }
        // HALF_OPEN: allow exactly one probe in flight at a time
        if (this.halfOpenProbeInFlight)
            return false;
        this.halfOpenProbeInFlight = true;
        return true;
    }
    /** Record a successful request and close the circuit */
    recordSuccess() {
        this.consecutiveFailures = 0;
        this.halfOpenProbeInFlight = false;
        this.state = 'CLOSED';
    }
    /**
     * Record a failed request.
     *
     * - When in **HALF_OPEN** the circuit re-opens immediately (the probe failed).
     * - When in **CLOSED** the circuit opens only once the failure threshold is reached.
     */
    recordFailure() {
        this.halfOpenProbeInFlight = false;
        if (this.state === 'HALF_OPEN') {
            // Probe failed — immediately re-open and back off again
            this.state = 'OPEN';
            this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
            console.warn('⚡ Circuit breaker re-OPEN after HALF_OPEN probe failure');
            return;
        }
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttemptAt = Date.now() + this.resetTimeoutMs;
            console.warn(`⚡ Circuit breaker OPEN after ${this.consecutiveFailures} consecutive failures`);
        }
    }
    /**
     * Return the current circuit state.
     *
     * @returns Current circuit state
     */
    getState() {
        return this.state;
    }
    /**
     * Return current statistics for observability.
     *
     * @returns Snapshot of state and consecutive failure count
     */
    getStats() {
        return { state: this.state, consecutiveFailures: this.consecutiveFailures };
    }
}
/** Module-level circuit breaker shared across all MCP fetch operations */
export const mcpCircuitBreaker = new CircuitBreaker();
/**
 * Execute a single MCP API call through the module-level circuit breaker.
 * Short-circuits with `fallback` whenever the circuit breaker is not
 * accepting requests (for example when OPEN, or in HALF_OPEN with no
 * probe slots available).
 * Records success or failure after each call, opening the circuit when
 * {@link CircuitBreakerOptions.failureThreshold} consecutive failures occur.
 *
 * @param fn - Async factory that performs the MCP call
 * @param fallback - Value returned when the circuit is not accepting requests
 * @param context - Label used in warning messages
 * @returns Result of `fn` or `fallback`
 */
async function callMCP(fn, fallback, context) {
    if (!mcpCircuitBreaker.canRequest()) {
        console.warn(`${WARN_PREFIX} Circuit breaker not accepting requests (${mcpCircuitBreaker.getState()}) — skipping ${context}`);
        return fallback;
    }
    try {
        const result = await fn();
        mcpCircuitBreaker.recordSuccess();
        return result;
    }
    catch (error) {
        mcpCircuitBreaker.recordFailure();
        throw error;
    }
}
// ─── Internal helpers ─────────────────────────────────────────────────────────
/**
 * Parse JSON text, returning `null` and logging a warning on parse failure.
 *
 * @param text - Raw JSON string
 * @param context - Label used in the warning message
 * @returns Parsed value or null
 */
function parseJSON(text, context) {
    try {
        return JSON.parse(text);
    }
    catch {
        console.warn(`${WARN_PREFIX} Failed to parse JSON for ${context}`);
        return null;
    }
}
// ─── MCP client initialisation ───────────────────────────────────────────────
/**
 * Attempt to connect to the European Parliament MCP server.
 * Returns `null` (with a warning) if the connection fails or MCP is disabled.
 *
 * @param useMCP - Whether MCP should be used at all
 * @returns Connected client or null
 */
export async function initializeMCPClient(useMCP) {
    if (!useMCP) {
        console.log(`${INFO_PREFIX} MCP client disabled via USE_EP_MCP=false`);
        return null;
    }
    try {
        console.log('🔌 Attempting to connect to European Parliament MCP Server...');
        const client = await getEPMCPClient();
        console.log('✅ MCP client connected successfully');
        return client;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ Could not connect to MCP server:', message);
        console.warn('⚠️ Falling back to placeholder content');
        return null;
    }
}
// ─── Week-Ahead fetches ──────────────────────────────────────────────────────
/**
 * Fetch aggregated week-ahead data from multiple MCP sources in parallel.
 * Returns placeholder data when the client is unavailable.
 *
 * @param client - MCP client or null
 * @param dateRange - Date range for the week-ahead period
 * @returns Aggregated week-ahead data
 */
export async function fetchWeekAheadData(client, dateRange) {
    if (!client) {
        console.log(`${INFO_PREFIX} MCP unavailable — using placeholder events`);
        return {
            events: PLACEHOLDER_EVENTS.map((e) => ({ ...e, date: dateRange.start })),
            committees: [],
            documents: [],
            pipeline: [],
            questions: [],
        };
    }
    if (!mcpCircuitBreaker.canRequest()) {
        console.warn(`${WARN_PREFIX} Circuit breaker not accepting requests (${mcpCircuitBreaker.getState()}) — using placeholder events`);
        return {
            events: PLACEHOLDER_EVENTS.map((e) => ({ ...e, date: dateRange.start })),
            committees: [],
            documents: [],
            pipeline: [],
            questions: [],
        };
    }
    // Record whether we entered as a HALF_OPEN probe so any rejection triggers
    // an immediate re-open (normal circuit-breaker probe semantics).
    const wasHalfOpen = mcpCircuitBreaker.getState() === 'HALF_OPEN';
    console.log(`${MCP_FETCH_PREFIX} Fetching week-ahead data from MCP (parallel)...`);
    const [plenarySessions, committeeInfo, documents, pipeline, questions, epEvents] = await Promise.allSettled([
        client.getPlenarySessions({ startDate: dateRange.start, endDate: dateRange.end, limit: 50 }),
        client.getCommitteeInfo({ limit: 20 }),
        client.searchDocuments({ query: 'parliament', limit: 20 }),
        client.monitorLegislativePipeline({
            dateFrom: dateRange.start,
            dateTo: dateRange.end,
            status: 'ACTIVE',
            limit: 20,
        }),
        client.getParliamentaryQuestions({ startDate: dateRange.start, limit: 20 }),
        client.getEvents({ dateFrom: dateRange.start, dateTo: dateRange.end, limit: 20 }),
    ]);
    const allFailed = [
        plenarySessions,
        committeeInfo,
        documents,
        pipeline,
        questions,
        epEvents,
    ].every((r) => r.status === 'rejected');
    const anyFailed = [plenarySessions, committeeInfo, documents, pipeline, questions, epEvents].some((r) => r.status === 'rejected');
    // In HALF_OPEN any single rejection means the probe failed — re-open immediately.
    if (allFailed || (wasHalfOpen && anyFailed)) {
        mcpCircuitBreaker.recordFailure();
    }
    else {
        mcpCircuitBreaker.recordSuccess();
    }
    const plenaryEvents = parsePlenarySessions(plenarySessions, dateRange.start);
    const additionalEvents = parseEPEvents(epEvents, dateRange.start);
    const events = [...plenaryEvents, ...additionalEvents];
    return {
        events: events.length > 0 ? events : [{ ...PLACEHOLDER_EVENTS[0], date: dateRange.start }],
        committees: parseCommitteeMeetings(committeeInfo, dateRange.start),
        documents: parseLegislativeDocuments(documents),
        pipeline: parseLegislativePipeline(pipeline),
        questions: parseParliamentaryQuestions(questions),
    };
}
// ─── Breaking-News fetches ───────────────────────────────────────────────────
/**
 * Fetch voting anomaly text from MCP, returning empty string on failure.
 *
 * @param client - MCP client or null
 * @returns Raw anomaly data text
 */
export async function fetchVotingAnomalies(client) {
    if (!client)
        return '';
    try {
        const result = await callMCP(() => client.callTool('detect_voting_anomalies', { sensitivityThreshold: 0.3 }), undefined, 'detect_voting_anomalies');
        return result?.content?.[0]?.text ?? '';
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} detect_voting_anomalies failed:`, message);
        return '';
    }
}
/**
 * Fetch coalition dynamics analysis text from MCP.
 *
 * @param client - MCP client or null
 * @returns Raw coalition dynamics text
 */
export async function fetchCoalitionDynamics(client) {
    if (!client)
        return '';
    try {
        const result = await callMCP(() => client.callTool('analyze_coalition_dynamics', {}), undefined, 'analyze_coalition_dynamics');
        return result?.content?.[0]?.text ?? '';
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} analyze_coalition_dynamics failed:`, message);
        return '';
    }
}
/**
 * Fetch voting statistics report text from MCP.
 *
 * @param client - MCP client or null
 * @returns Raw voting report text
 */
export async function fetchVotingReport(client) {
    if (!client)
        return '';
    try {
        const result = await callMCP(() => client.callTool('generate_report', { reportType: 'VOTING_STATISTICS' }), undefined, 'generate_report');
        return result?.content?.[0]?.text ?? '';
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} generate_report failed:`, message);
        return '';
    }
}
/**
 * Fetch MEP influence assessment text from MCP.
 * Short-circuits immediately when `mepId` is empty.
 *
 * @param client - MCP client or null
 * @param mepId - MEP identifier; pass empty string to skip the call
 * @returns Raw influence data text
 */
export async function fetchMEPInfluence(client, mepId) {
    if (!mepId || !client)
        return '';
    try {
        const result = await callMCP(() => client.callTool('assess_mep_influence', { mepId, includeDetails: true }), undefined, 'assess_mep_influence');
        return result?.content?.[0]?.text ?? '';
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} assess_mep_influence failed:`, message);
        return '';
    }
}
// ─── Committee-Reports fetches ───────────────────────────────────────────────
/**
 * Fetch committee data from three MCP sources for the given abbreviation.
 * Each source failure is caught individually so partial data is still returned.
 *
 * @param client - MCP client or null
 * @param abbreviation - Committee code (e.g. `"ENVI"`)
 * @returns Populated committee data
 */
export async function fetchCommitteeData(client, abbreviation) {
    const defaultResult = {
        name: `${abbreviation} Committee`,
        abbreviation,
        chair: 'N/A',
        members: 0,
        documents: [],
        effectiveness: null,
    };
    if (!client)
        return defaultResult;
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching committee info for ${abbreviation}...`);
        const committeeResult = await callMCP(() => client.getCommitteeInfo({ committeeId: abbreviation }), null, `getCommitteeInfo(${abbreviation})`);
        if (committeeResult)
            applyCommitteeInfo(committeeResult, defaultResult, abbreviation);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`${WARN_PREFIX} getCommitteeInfo failed for ${abbreviation}:`, message);
    }
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching documents for ${abbreviation}...`);
        const docsResult = await callMCP(() => client.searchDocuments({ query: abbreviation, limit: 5 }), null, `searchDocuments(${abbreviation})`);
        if (docsResult)
            applyDocuments(docsResult, defaultResult);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`${WARN_PREFIX} searchDocuments failed for ${abbreviation}:`, message);
    }
    try {
        const effectivenessResult = await callMCP(() => client.analyzeLegislativeEffectiveness({
            subjectType: 'COMMITTEE',
            subjectId: abbreviation,
        }), null, `analyzeLegislativeEffectiveness(${abbreviation})`);
        if (effectivenessResult)
            applyEffectiveness(effectivenessResult, defaultResult);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`${WARN_PREFIX} analyzeLegislativeEffectiveness failed for ${abbreviation}:`, message);
    }
    return defaultResult;
}
// ─── Motions fetches ─────────────────────────────────────────────────────────
/**
 * Fetch recent voting records from MCP.
 *
 * @param client - MCP client or null
 * @param dateFromStr - Start date (YYYY-MM-DD)
 * @param dateStr - End date (YYYY-MM-DD)
 * @returns Array of voting records
 */
export async function fetchVotingRecords(client, dateFromStr, dateStr) {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching voting records from MCP server...`);
        const votingResult = (await callMCP(() => client.callTool('get_voting_records', {
            dateFrom: dateFromStr,
            dateTo: dateStr,
            limit: 20,
        }), undefined, 'get_voting_records'));
        if (votingResult?.content?.[0]) {
            const data = parseJSON(votingResult.content[0].text, 'voting records');
            if (data?.records && data.records.length > 0) {
                console.log(`  ✅ Fetched ${data.records.length} voting records from MCP`);
                return data.records.map((r) => ({
                    title: r.title ?? 'Parliamentary Vote',
                    date: r.date ?? dateStr,
                    result: r.result ?? 'Adopted',
                    votes: {
                        for: r.votes?.for ?? 0,
                        against: r.votes?.against ?? 0,
                        abstain: r.votes?.abstain ?? 0,
                    },
                }));
            }
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} MCP voting records fetch failed:`, message);
    }
    return [];
}
/**
 * Fetch voting patterns from MCP.
 *
 * @param client - MCP client or null
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Array of voting patterns
 */
export async function fetchVotingPatterns(client, dateFromStr, dateStr) {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching voting patterns from MCP server...`);
        const patternsResult = (await callMCP(() => client.callTool('analyze_voting_patterns', {
            dateFrom: dateFromStr,
            dateTo: dateStr,
        }), undefined, 'analyze_voting_patterns'));
        if (patternsResult?.content?.[0]) {
            const data = parseJSON(patternsResult.content[0].text, 'voting patterns');
            if (data?.patterns && data.patterns.length > 0) {
                console.log(`  ✅ Fetched ${data.patterns.length} voting patterns from MCP`);
                return data.patterns.map((p) => ({
                    group: p.group ?? 'Unknown Group',
                    cohesion: p.cohesion ?? 0,
                    participation: p.participation ?? 0,
                }));
            }
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} MCP voting patterns fetch failed:`, message);
    }
    return [];
}
/**
 * Fetch voting anomalies for a date range from MCP.
 *
 * @param client - MCP client or null
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Array of voting anomalies
 */
export async function fetchMotionsAnomalies(client, dateFromStr, dateStr) {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching voting anomalies from MCP server...`);
        const anomaliesResult = (await callMCP(() => client.callTool('detect_voting_anomalies', {
            dateFrom: dateFromStr,
            dateTo: dateStr,
        }), undefined, 'detect_voting_anomalies'));
        if (anomaliesResult?.content?.[0]) {
            const data = parseJSON(anomaliesResult.content[0].text, 'voting anomalies');
            if (data?.anomalies && data.anomalies.length > 0) {
                console.log(`  ✅ Fetched ${data.anomalies.length} voting anomalies from MCP`);
                return data.anomalies.map((a) => ({
                    type: a.type ?? 'Unusual Pattern',
                    description: a.description ?? 'No description available',
                    severity: a.severity ?? 'MEDIUM',
                }));
            }
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} MCP voting anomalies fetch failed:`, message);
    }
    return [];
}
/**
 * Fetch parliamentary questions from MCP for the given date range.
 *
 * @param client - MCP client or null
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns Array of parliamentary questions
 */
export async function fetchParliamentaryQuestionsForMotions(client, dateFromStr, dateStr) {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching parliamentary questions from MCP server...`);
        const questionsResult = await callMCP(() => client.getParliamentaryQuestions({
            dateFrom: dateFromStr,
            dateTo: dateStr,
            limit: 10,
        }), undefined, 'get_parliamentary_questions');
        if (questionsResult?.content?.[0]) {
            const data = parseJSON(questionsResult.content[0].text, 'parliamentary questions');
            if (data?.questions && data.questions.length > 0) {
                console.log(`  ✅ Fetched ${data.questions.length} parliamentary questions from MCP`);
                return data.questions.map((q) => ({
                    author: q.author ?? 'Unknown MEP',
                    topic: q.topic ?? q.subject ?? 'General inquiry',
                    date: q.date ?? dateStr,
                    status: q.status ?? 'PENDING',
                }));
            }
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} MCP parliamentary questions fetch failed:`, message);
    }
    return [];
}
/**
 * Fetch all motions data in parallel, applying fallback arrays for any
 * section where MCP returned nothing.
 *
 * @param client - MCP client or null
 * @param dateFromStr - Start date
 * @param dateStr - End date
 * @returns All motions data with fallbacks applied
 */
export async function fetchMotionsData(client, dateFromStr, dateStr) {
    const [votingRecordsResult, votingPatternsResult, anomaliesResult, questionsResult] = await Promise.allSettled([
        fetchVotingRecords(client, dateFromStr, dateStr),
        fetchVotingPatterns(client, dateFromStr, dateStr),
        fetchMotionsAnomalies(client, dateFromStr, dateStr),
        fetchParliamentaryQuestionsForMotions(client, dateFromStr, dateStr),
    ]);
    let votingRecords = votingRecordsResult.status === 'fulfilled' ? votingRecordsResult.value : [];
    if (votingRecordsResult.status === 'rejected') {
        console.warn(`${WARN_PREFIX} Failed to fetch voting records from MCP`);
    }
    let votingPatterns = votingPatternsResult.status === 'fulfilled' ? votingPatternsResult.value : [];
    if (votingPatternsResult.status === 'rejected') {
        console.warn(`${WARN_PREFIX} Failed to fetch voting patterns from MCP`);
    }
    let anomalies = anomaliesResult.status === 'fulfilled' ? anomaliesResult.value : [];
    if (anomaliesResult.status === 'rejected') {
        console.warn(`${WARN_PREFIX} Failed to fetch voting anomalies from MCP`);
    }
    let questions = questionsResult.status === 'fulfilled' ? questionsResult.value : [];
    if (questionsResult.status === 'rejected') {
        console.warn(`${WARN_PREFIX} Failed to fetch parliamentary questions from MCP`);
    }
    const fallback = getMotionsFallbackData(dateStr, dateFromStr);
    if (votingRecords.length === 0) {
        console.log(`${INFO_PREFIX} Using placeholder voting records`);
        votingRecords = fallback.votingRecords;
    }
    if (votingPatterns.length === 0) {
        console.log(`${INFO_PREFIX} Using placeholder voting patterns`);
        votingPatterns = fallback.votingPatterns;
    }
    if (anomalies.length === 0) {
        console.log(`${INFO_PREFIX} Using placeholder voting anomalies`);
        anomalies = fallback.anomalies;
    }
    if (questions.length === 0) {
        console.log(`${INFO_PREFIX} Using placeholder parliamentary questions`);
        questions = fallback.questions;
    }
    return { votingRecords, votingPatterns, anomalies, questions };
}
// ─── Propositions fetches ─────────────────────────────────────────────────────
/**
 * Fetch legislative proposals from MCP and build pre-sanitised HTML.
 *
 * @param client - MCP client or null
 * @returns Proposals HTML and the first procedure ID found (if any)
 */
export async function fetchProposalsFromMCP(client) {
    if (!client)
        return { html: '', firstProcedureId: '' };
    const docsResult = await callMCP(() => client.searchDocuments({ keyword: 'legislative proposal', limit: 10 }), undefined, 'search_documents(proposals)');
    if (!docsResult?.content?.[0])
        return { html: '', firstProcedureId: '' };
    const data = parseJSON(docsResult.content[0].text, 'proposals');
    if (!data?.documents?.length)
        return { html: '', firstProcedureId: '' };
    console.log(`  ✅ Fetched ${data.documents.length} proposals from MCP`);
    const firstProcedureId = data.documents.find((d) => /\d{4}\/\d+\(.+\)/.test(d.id ?? ''))?.id ?? '';
    const html = data.documents
        .map((doc) => `
      <div class="proposal-card">
        <h3>${escapeHTML(doc.title ?? 'Legislative Proposal')}</h3>
        <div class="proposal-meta">
          ${doc.id ? `<span class="proposal-id">${escapeHTML(doc.id)}</span>` : ''}
          ${doc.date ? `<span class="proposal-date">${escapeHTML(doc.date)}</span>` : ''}
          ${doc.status ? `<span class="proposal-status">${escapeHTML(doc.status)}</span>` : ''}
        </div>
        ${doc.committee ? `<p class="proposal-committee">${escapeHTML(doc.committee)}</p>` : ''}
        ${doc.rapporteur ? `<p class="proposal-rapporteur">${escapeHTML(doc.rapporteur)}</p>` : ''}
      </div>`)
        .join('');
    return { html, firstProcedureId };
}
/**
 * Fetch active legislative pipeline data from MCP.
 *
 * @param client - MCP client or null
 * @returns Structured pipeline data or null when unavailable
 */
export async function fetchPipelineFromMCP(client) {
    if (!client)
        return null;
    const pipelineResult = await callMCP(() => client.monitorLegislativePipeline({ status: 'ACTIVE', limit: 5 }), undefined, 'monitor_legislative_pipeline');
    if (!pipelineResult?.content?.[0])
        return null;
    const pipeData = parseJSON(pipelineResult.content[0].text, 'pipeline');
    if (!pipeData)
        return null;
    const healthScore = pipeData.pipelineHealthScore ?? 0;
    const throughput = pipeData.throughputRate ?? 0;
    const procRowsHtml = pipeData.procedures
        ?.map((proc) => `
      <div class="procedure-item">
        ${proc.id ? `<span class="procedure-id">${escapeHTML(proc.id)}</span>` : ''}
        ${proc.title ? `<span class="procedure-title">${escapeHTML(proc.title)}</span>` : ''}
        ${proc.stage ? `<span class="procedure-stage">${escapeHTML(proc.stage)}</span>` : ''}
      </div>`)
        .join('') ?? '';
    return { healthScore, throughput, procRowsHtml };
}
/**
 * Fetch a specific procedure's tracked-status HTML from MCP.
 * Returns empty string when `procedureId` is empty or MCP is unavailable.
 *
 * @param client - MCP client or null
 * @param procedureId - Procedure ID (e.g. `"2024/0001(COD)"`)
 * @returns HTML snippet for the procedure status section
 */
export async function fetchProcedureStatusFromMCP(client, procedureId) {
    if (!procedureId || !client)
        return '';
    try {
        const result = await callMCP(() => client.trackLegislation(procedureId), undefined, `track_legislation(${procedureId})`);
        if (!result?.content?.[0])
            return '';
        const raw = result.content[0].text;
        return `<pre class="data-summary">${escapeHTML(raw.slice(0, 2000))}</pre>`;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} track_legislation failed:`, message);
        return '';
    }
}
// ─── EP Feed-based fetches (Breaking News) ──────────────────────────────────
/**
 * Parse a feed result from MCP into a flat array of items.
 * EP API v2 feeds return items under the `data` key:
 * `{ data: [{ id, type, work_type, identifier, label }], "@context": [...] }`
 *
 * Also handles legacy shapes (`feed`, `entries`, `items`) and bare arrays.
 *
 * @param result - Raw MCP tool result
 * @returns Array of parsed feed entry objects (may be empty)
 */
function parseFeedResult(result) {
    if (!result?.content?.[0]?.text)
        return [];
    const parsed = parseJSON(result.content[0].text, 'feed');
    if (!parsed)
        return [];
    // EP API v2 feeds use `data` key; also check legacy shapes
    const candidates = [
        parsed['data'],
        parsed['feed'],
        parsed['entries'],
        parsed['items'],
        parsed,
    ];
    for (const candidate of candidates) {
        if (Array.isArray(candidate))
            return candidate;
    }
    return [];
}
/**
 * Map a raw EP API v2 feed item to a normalized feed item.
 * EP feeds return `{ id, type, work_type, identifier, label }` — we normalize
 * these into the domain feed item shape, using `label` as `title` when no title exists.
 *
 * @param item - Raw feed item record
 * @returns Common feed item fields
 */
function mapFeedItemBase(item) {
    return {
        id: String(item['id'] ?? item['docId'] ?? ''),
        title: String(item['title'] ?? item['label'] ?? item['name'] ?? item['identifier'] ?? 'Untitled'),
        date: String(item['date'] ?? item['published'] ?? item['updated'] ?? ''),
        type: item['type']
            ? String(item['type'])
            : item['work_type']
                ? String(item['work_type'])
                : undefined,
        url: item['url'] ? String(item['url']) : undefined,
        identifier: item['identifier'] ? String(item['identifier']) : undefined,
        label: item['label'] ? String(item['label']) : undefined,
    };
}
/**
 * Fetch adopted texts feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of adopted text feed items
 */
export async function fetchAdoptedTextsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching adopted texts feed (${timeframe})...`);
        const result = await callMCP(() => client.getAdoptedTextsFeed({ timeframe, limit: 20 }), undefined, 'get_adopted_texts_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_adopted_texts_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch events feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of event feed items
 */
export async function fetchEventsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching events feed (${timeframe})...`);
        const result = await callMCP(() => client.getEventsFeed({ timeframe, limit: 20 }), undefined, 'get_events_feed');
        return parseFeedResult(result).map((item) => ({
            ...mapFeedItemBase(item),
            location: item['location'] ? String(item['location']) : undefined,
        }));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_events_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch procedures feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of procedure feed items
 */
export async function fetchProceduresFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching procedures feed (${timeframe})...`);
        const result = await callMCP(() => client.getProceduresFeed({ timeframe, limit: 20 }), undefined, 'get_procedures_feed');
        return parseFeedResult(result).map((item) => ({
            ...mapFeedItemBase(item),
            stage: item['stage'] ? String(item['stage']) : undefined,
        }));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_procedures_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch MEPs feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of MEP feed items
 */
export async function fetchMEPsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching MEPs feed (${timeframe})...`);
        const result = await callMCP(() => client.getMEPsFeed({ timeframe, limit: 20 }), undefined, 'get_meps_feed');
        return parseFeedResult(result).map((item) => ({
            id: String(item['id'] ?? item['mepId'] ?? ''),
            name: String(item['name'] ?? item['label'] ?? item['title'] ?? 'Unknown'),
            date: String(item['date'] ?? item['published'] ?? item['updated'] ?? ''),
            country: item['country'] ? String(item['country']) : undefined,
            group: item['group'] ? String(item['group']) : undefined,
            url: item['url'] ? String(item['url']) : undefined,
            identifier: item['identifier'] ? String(item['identifier']) : undefined,
            label: item['label'] ? String(item['label']) : undefined,
        }));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_meps_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch documents feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of document feed items
 */
export async function fetchDocumentsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching documents feed (${timeframe})...`);
        const result = await callMCP(() => client.getDocumentsFeed({ timeframe, limit: 20 }), undefined, 'get_documents_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_documents_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch plenary documents feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of document feed items
 */
export async function fetchPlenaryDocumentsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching plenary documents feed (${timeframe})...`);
        const result = await callMCP(() => client.getPlenaryDocumentsFeed({ timeframe, limit: 20 }), undefined, 'get_plenary_documents_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_plenary_documents_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch committee documents feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of document feed items
 */
export async function fetchCommitteeDocumentsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching committee documents feed (${timeframe})...`);
        const result = await callMCP(() => client.getCommitteeDocumentsFeed({ timeframe, limit: 20 }), undefined, 'get_committee_documents_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_committee_documents_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch plenary session documents feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of document feed items
 */
export async function fetchPlenarySessionDocumentsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching plenary session documents feed (${timeframe})...`);
        const result = await callMCP(() => client.getPlenarySessionDocumentsFeed({ timeframe, limit: 20 }), undefined, 'get_plenary_session_documents_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_plenary_session_documents_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch external documents feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of document feed items
 */
export async function fetchExternalDocumentsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching external documents feed (${timeframe})...`);
        const result = await callMCP(() => client.getExternalDocumentsFeed({ timeframe, limit: 20 }), undefined, 'get_external_documents_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_external_documents_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch parliamentary questions feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of question feed items
 */
export async function fetchQuestionsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching parliamentary questions feed (${timeframe})...`);
        const result = await callMCP(() => client.getParliamentaryQuestionsFeed({ timeframe, limit: 20 }), undefined, 'get_parliamentary_questions_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_parliamentary_questions_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch MEP declarations feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of declaration feed items
 */
export async function fetchDeclarationsFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching MEP declarations feed (${timeframe})...`);
        const result = await callMCP(() => client.getMEPDeclarationsFeed({ timeframe, limit: 20 }), undefined, 'get_mep_declarations_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_mep_declarations_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch corporate bodies feed from MCP.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Array of corporate body feed items
 */
export async function fetchCorporateBodiesFeed(client, timeframe = 'one-day') {
    if (!client)
        return [];
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching corporate bodies feed (${timeframe})...`);
        const result = await callMCP(() => client.getCorporateBodiesFeed({ timeframe, limit: 20 }), undefined, 'get_corporate_bodies_feed');
        return parseFeedResult(result).map((item) => mapFeedItemBase(item));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_corporate_bodies_feed failed:`, message);
        return [];
    }
}
/**
 * Fetch all EP feed data for breaking news articles.
 * Calls adopted texts, events, procedures, and MEPs feeds in parallel.
 * Returns `undefined` when client is null (MCP unavailable).
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Aggregated feed data for breaking news, or undefined when client is null
 */
export async function fetchBreakingNewsFeedData(client, timeframe = 'one-day') {
    if (!client)
        return undefined;
    if (!mcpCircuitBreaker.canRequest()) {
        console.warn(`${WARN_PREFIX} Circuit breaker OPEN — treating as MCP unavailable for breaking news feeds`);
        return undefined;
    }
    const [adoptedTexts, events, procedures, mepUpdates] = await Promise.all([
        fetchAdoptedTextsFeed(client, timeframe),
        fetchEventsFeed(client, timeframe),
        fetchProceduresFeed(client, timeframe),
        fetchMEPsFeed(client, timeframe),
    ]);
    return { adoptedTexts, events, procedures, mepUpdates };
}
/**
 * Fetch comprehensive EP feed data from all 12 feed endpoints in parallel.
 * This is the primary data source for all article strategies.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Full EPFeedData or undefined when client is null
 */
export async function fetchEPFeedData(client, timeframe = 'one-day') {
    if (!client)
        return undefined;
    if (!mcpCircuitBreaker.canRequest()) {
        console.warn(`${WARN_PREFIX} Circuit breaker OPEN — treating as MCP unavailable for EP feeds`);
        return undefined;
    }
    console.log(`${MCP_FETCH_PREFIX} Fetching comprehensive EP feed data (${timeframe})...`);
    const [adoptedTexts, events, procedures, mepUpdates, documents, plenaryDocuments, committeeDocuments, plenarySessionDocuments, externalDocuments, questions, declarations, corporateBodies,] = await Promise.all([
        fetchAdoptedTextsFeed(client, timeframe),
        fetchEventsFeed(client, timeframe),
        fetchProceduresFeed(client, timeframe),
        fetchMEPsFeed(client, timeframe),
        fetchDocumentsFeed(client, timeframe),
        fetchPlenaryDocumentsFeed(client, timeframe),
        fetchCommitteeDocumentsFeed(client, timeframe),
        fetchPlenarySessionDocumentsFeed(client, timeframe),
        fetchExternalDocumentsFeed(client, timeframe),
        fetchQuestionsFeed(client, timeframe),
        fetchDeclarationsFeed(client, timeframe),
        fetchCorporateBodiesFeed(client, timeframe),
    ]);
    const totalItems = adoptedTexts.length +
        events.length +
        procedures.length +
        mepUpdates.length +
        documents.length +
        plenaryDocuments.length +
        committeeDocuments.length +
        plenarySessionDocuments.length +
        externalDocuments.length +
        questions.length +
        declarations.length +
        corporateBodies.length;
    console.log(`  ✅ Fetched ${totalItems} total feed items across 12 endpoints`);
    return {
        adoptedTexts,
        events,
        procedures,
        mepUpdates,
        documents,
        plenaryDocuments,
        committeeDocuments,
        plenarySessionDocuments,
        externalDocuments,
        questions,
        declarations,
        corporateBodies,
    };
}
//# sourceMappingURL=fetch-stage.js.map