// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/FetchStage
 * @description MCP data-fetching pipeline stage with circuit breaker protection.
 *
 * All functions are pure with respect to I/O: they accept an explicit
 * `client` argument instead of reading module-level state, making them
 * straightforward to unit-test with a mock client.
 *
 * The {@link CircuitBreaker} prevents cascading failures when the MCP server
 * is degraded: after {@link CircuitBreakerOptions.failureThreshold} consecutive
 * errors the circuit opens and subsequent calls short-circuit immediately.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { getEPMCPClient } from '../../mcp/ep-mcp-client.js';
import type {
  WeekAheadData,
  DateRange,
  CommitteeData,
  MCPToolResult,
  VotingRecord,
  VotingPattern,
  VotingAnomaly,
  MotionsQuestion,
  LegislativeDocument,
} from '../../types/index.js';
import {
  parsePlenarySessions,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  parseParliamentaryQuestions,
  PLACEHOLDER_EVENTS,
} from '../week-ahead-content.js';
import { applyCommitteeInfo, applyDocuments, applyEffectiveness } from '../committee-helpers.js';
import { getMotionsFallbackData } from '../motions-content.js';
import { escapeHTML } from '../../utils/file-utils.js';
import type { PipelineData } from '../propositions-content.js';

// ─── Shared string constants ─────────────────────────────────────────────────

/** Log prefix for MCP fetch operations */
const MCP_FETCH_PREFIX = '  📡';

/** Warning prefix for MCP failures */
const WARN_PREFIX = '  ⚠️';

/** Info prefix for fallback messages */
const INFO_PREFIX = '  ℹ️';

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

/** Possible circuit breaker states */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/** Constructor options for {@link CircuitBreaker} */
export interface CircuitBreakerOptions {
  /** Consecutive failures before opening the circuit (default: 3) */
  failureThreshold?: number;
  /** Milliseconds to wait before probing recovery (default: 60 000) */
  resetTimeoutMs?: number;
}

/**
 * Circuit breaker preventing cascading MCP failures.
 *
 * - **CLOSED** — normal operation; all requests pass through.
 * - **OPEN** — fast-fail; requests are rejected for `resetTimeoutMs` ms.
 * - **HALF_OPEN** — probe state; one request is allowed to test recovery.
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private nextAttemptAt = 0;
  private halfOpenProbeInFlight = false;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
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
  canRequest(): boolean {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttemptAt) {
        this.state = 'HALF_OPEN';
        this.halfOpenProbeInFlight = false;
        // Fall through to HALF_OPEN probe logic below
      } else {
        return false;
      }
    }
    // HALF_OPEN: allow exactly one probe in flight at a time
    if (this.halfOpenProbeInFlight) return false;
    this.halfOpenProbeInFlight = true;
    return true;
  }

  /** Record a successful request and close the circuit */
  recordSuccess(): void {
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
  recordFailure(): void {
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
      console.warn(
        `⚡ Circuit breaker OPEN after ${this.consecutiveFailures} consecutive failures`
      );
    }
  }

  /**
   * Return the current circuit state.
   *
   * @returns Current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Return current statistics for observability.
   *
   * @returns Snapshot of state and consecutive failure count
   */
  getStats(): Readonly<{ state: CircuitState; consecutiveFailures: number }> {
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
async function callMCP<T>(fn: () => Promise<T>, fallback: T, context: string): Promise<T> {
  if (!mcpCircuitBreaker.canRequest()) {
    console.warn(
      `${WARN_PREFIX} Circuit breaker not accepting requests (${mcpCircuitBreaker.getState()}) — skipping ${context}`
    );
    return fallback;
  }
  try {
    const result = await fn();
    mcpCircuitBreaker.recordSuccess();
    return result;
  } catch (error) {
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
function parseJSON<T>(text: string, context: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
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
export async function initializeMCPClient(
  useMCP: boolean
): Promise<EuropeanParliamentMCPClient | null> {
  if (!useMCP) {
    console.log(`${INFO_PREFIX} MCP client disabled via USE_EP_MCP=false`);
    return null;
  }
  try {
    console.log('🔌 Attempting to connect to European Parliament MCP Server...');
    const client = await getEPMCPClient();
    console.log('✅ MCP client connected successfully');
    return client;
  } catch (error) {
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
export async function fetchWeekAheadData(
  client: EuropeanParliamentMCPClient | null,
  dateRange: DateRange
): Promise<WeekAheadData> {
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
    console.warn(
      `${WARN_PREFIX} Circuit breaker not accepting requests (${mcpCircuitBreaker.getState()}) — using placeholder events`
    );
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

  const [plenarySessions, committeeInfo, documents, pipeline, questions] = await Promise.allSettled(
    [
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
    ]
  );

  const allFailed = [plenarySessions, committeeInfo, documents, pipeline, questions].every(
    (r) => r.status === 'rejected'
  );
  const anyFailed = [plenarySessions, committeeInfo, documents, pipeline, questions].some(
    (r) => r.status === 'rejected'
  );
  // In HALF_OPEN any single rejection means the probe failed — re-open immediately.
  if (allFailed || (wasHalfOpen && anyFailed)) {
    mcpCircuitBreaker.recordFailure();
  } else {
    mcpCircuitBreaker.recordSuccess();
  }

  const events = parsePlenarySessions(plenarySessions, dateRange.start);

  return {
    events: events.length > 0 ? events : [{ ...PLACEHOLDER_EVENTS[0]!, date: dateRange.start }],
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
export async function fetchVotingAnomalies(
  client: EuropeanParliamentMCPClient | null
): Promise<string> {
  if (!client) return '';
  try {
    const result = await callMCP(
      () => client.callTool('detect_voting_anomalies', { sensitivityThreshold: 0.3 }),
      undefined,
      'detect_voting_anomalies'
    );
    return result?.content?.[0]?.text ?? '';
  } catch (error) {
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
export async function fetchCoalitionDynamics(
  client: EuropeanParliamentMCPClient | null
): Promise<string> {
  if (!client) return '';
  try {
    const result = await callMCP(
      () => client.callTool('analyze_coalition_dynamics', {}),
      undefined,
      'analyze_coalition_dynamics'
    );
    return result?.content?.[0]?.text ?? '';
  } catch (error) {
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
export async function fetchVotingReport(
  client: EuropeanParliamentMCPClient | null
): Promise<string> {
  if (!client) return '';
  try {
    const result = await callMCP(
      () => client.callTool('generate_report', { reportType: 'VOTING_STATISTICS' }),
      undefined,
      'generate_report'
    );
    return result?.content?.[0]?.text ?? '';
  } catch (error) {
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
export async function fetchMEPInfluence(
  client: EuropeanParliamentMCPClient | null,
  mepId: string
): Promise<string> {
  if (!mepId || !client) return '';
  try {
    const result = await callMCP(
      () => client.callTool('assess_mep_influence', { mepId, includeDetails: true }),
      undefined,
      'assess_mep_influence'
    );
    return result?.content?.[0]?.text ?? '';
  } catch (error) {
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
export async function fetchCommitteeData(
  client: EuropeanParliamentMCPClient | null,
  abbreviation: string
): Promise<CommitteeData> {
  const defaultResult: CommitteeData = {
    name: `${abbreviation} Committee`,
    abbreviation,
    chair: 'N/A',
    members: 0,
    documents: [],
    effectiveness: null,
  };

  if (!client) return defaultResult;

  try {
    console.log(`${MCP_FETCH_PREFIX} Fetching committee info for ${abbreviation}...`);
    const committeeResult = await callMCP(
      () => client.getCommitteeInfo({ committeeId: abbreviation }),
      null,
      `getCommitteeInfo(${abbreviation})`
    );
    if (committeeResult) applyCommitteeInfo(committeeResult, defaultResult, abbreviation);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`${WARN_PREFIX} getCommitteeInfo failed for ${abbreviation}:`, message);
  }

  try {
    console.log(`${MCP_FETCH_PREFIX} Fetching documents for ${abbreviation}...`);
    const docsResult = await callMCP(
      () => client.searchDocuments({ query: abbreviation, limit: 5 }),
      null,
      `searchDocuments(${abbreviation})`
    );
    if (docsResult) applyDocuments(docsResult, defaultResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`${WARN_PREFIX} searchDocuments failed for ${abbreviation}:`, message);
  }

  try {
    const effectivenessResult = await callMCP(
      () =>
        client.analyzeLegislativeEffectiveness({
          subjectType: 'COMMITTEE',
          subjectId: abbreviation,
        }),
      null,
      `analyzeLegislativeEffectiveness(${abbreviation})`
    );
    if (effectivenessResult) applyEffectiveness(effectivenessResult, defaultResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `${WARN_PREFIX} analyzeLegislativeEffectiveness failed for ${abbreviation}:`,
      message
    );
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
export async function fetchVotingRecords(
  client: EuropeanParliamentMCPClient | null,
  dateFromStr: string,
  dateStr: string
): Promise<VotingRecord[]> {
  if (!client) return [];
  try {
    console.log(`${MCP_FETCH_PREFIX} Fetching voting records from MCP server...`);
    const votingResult = (await callMCP(
      () =>
        client.callTool('get_voting_records', {
          dateFrom: dateFromStr,
          dateTo: dateStr,
          limit: 20,
        }),
      undefined,
      'get_voting_records'
    )) as MCPToolResult | undefined;

    if (votingResult?.content?.[0]) {
      const data = parseJSON<{
        records?: Array<{
          title?: string;
          date?: string;
          result?: string;
          votes?: { for?: number; against?: number; abstain?: number };
        }>;
      }>(votingResult.content[0].text, 'voting records');

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
  } catch (error) {
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
export async function fetchVotingPatterns(
  client: EuropeanParliamentMCPClient | null,
  dateFromStr: string,
  dateStr: string
): Promise<VotingPattern[]> {
  if (!client) return [];
  try {
    console.log(`${MCP_FETCH_PREFIX} Fetching voting patterns from MCP server...`);
    const patternsResult = (await callMCP(
      () =>
        client.callTool('analyze_voting_patterns', {
          dateFrom: dateFromStr,
          dateTo: dateStr,
        }),
      undefined,
      'analyze_voting_patterns'
    )) as MCPToolResult | undefined;

    if (patternsResult?.content?.[0]) {
      const data = parseJSON<{
        patterns?: Array<{ group?: string; cohesion?: number; participation?: number }>;
      }>(patternsResult.content[0].text, 'voting patterns');

      if (data?.patterns && data.patterns.length > 0) {
        console.log(`  ✅ Fetched ${data.patterns.length} voting patterns from MCP`);
        return data.patterns.map((p) => ({
          group: p.group ?? 'Unknown Group',
          cohesion: p.cohesion ?? 0,
          participation: p.participation ?? 0,
        }));
      }
    }
  } catch (error) {
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
export async function fetchMotionsAnomalies(
  client: EuropeanParliamentMCPClient | null,
  dateFromStr: string,
  dateStr: string
): Promise<VotingAnomaly[]> {
  if (!client) return [];
  try {
    console.log(`${MCP_FETCH_PREFIX} Fetching voting anomalies from MCP server...`);
    const anomaliesResult = (await callMCP(
      () =>
        client.callTool('detect_voting_anomalies', {
          dateFrom: dateFromStr,
          dateTo: dateStr,
        }),
      undefined,
      'detect_voting_anomalies'
    )) as MCPToolResult | undefined;

    if (anomaliesResult?.content?.[0]) {
      const data = parseJSON<{
        anomalies?: Array<{ type?: string; description?: string; severity?: string }>;
      }>(anomaliesResult.content[0].text, 'voting anomalies');

      if (data?.anomalies && data.anomalies.length > 0) {
        console.log(`  ✅ Fetched ${data.anomalies.length} voting anomalies from MCP`);
        return data.anomalies.map((a) => ({
          type: a.type ?? 'Unusual Pattern',
          description: a.description ?? 'No description available',
          severity: a.severity ?? 'MEDIUM',
        }));
      }
    }
  } catch (error) {
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
export async function fetchParliamentaryQuestionsForMotions(
  client: EuropeanParliamentMCPClient | null,
  dateFromStr: string,
  dateStr: string
): Promise<MotionsQuestion[]> {
  if (!client) return [];
  try {
    console.log(`${MCP_FETCH_PREFIX} Fetching parliamentary questions from MCP server...`);
    const questionsResult = await callMCP(
      () =>
        client.getParliamentaryQuestions({
          dateFrom: dateFromStr,
          dateTo: dateStr,
          limit: 10,
        }),
      undefined,
      'get_parliamentary_questions'
    );

    if (questionsResult?.content?.[0]) {
      const data = parseJSON<{
        questions?: Array<{
          author?: string;
          topic?: string;
          subject?: string;
          date?: string;
          status?: string;
        }>;
      }>(questionsResult.content[0].text, 'parliamentary questions');

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
  } catch (error) {
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
export async function fetchMotionsData(
  client: EuropeanParliamentMCPClient | null,
  dateFromStr: string,
  dateStr: string
): Promise<{
  votingRecords: VotingRecord[];
  votingPatterns: VotingPattern[];
  anomalies: VotingAnomaly[];
  questions: MotionsQuestion[];
}> {
  const [votingRecordsResult, votingPatternsResult, anomaliesResult, questionsResult] =
    await Promise.allSettled([
      fetchVotingRecords(client, dateFromStr, dateStr),
      fetchVotingPatterns(client, dateFromStr, dateStr),
      fetchMotionsAnomalies(client, dateFromStr, dateStr),
      fetchParliamentaryQuestionsForMotions(client, dateFromStr, dateStr),
    ]);

  let votingRecords: VotingRecord[] =
    votingRecordsResult.status === 'fulfilled' ? votingRecordsResult.value : [];
  if (votingRecordsResult.status === 'rejected') {
    console.warn(`${WARN_PREFIX} Failed to fetch voting records from MCP`);
  }

  let votingPatterns: VotingPattern[] =
    votingPatternsResult.status === 'fulfilled' ? votingPatternsResult.value : [];
  if (votingPatternsResult.status === 'rejected') {
    console.warn(`${WARN_PREFIX} Failed to fetch voting patterns from MCP`);
  }

  let anomalies: VotingAnomaly[] =
    anomaliesResult.status === 'fulfilled' ? anomaliesResult.value : [];
  if (anomaliesResult.status === 'rejected') {
    console.warn(`${WARN_PREFIX} Failed to fetch voting anomalies from MCP`);
  }

  let questions: MotionsQuestion[] =
    questionsResult.status === 'fulfilled' ? questionsResult.value : [];
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
export async function fetchProposalsFromMCP(
  client: EuropeanParliamentMCPClient | null
): Promise<{ html: string; firstProcedureId: string }> {
  if (!client) return { html: '', firstProcedureId: '' };

  const docsResult = await callMCP(
    () => client.searchDocuments({ keyword: 'legislative proposal', limit: 10 }),
    undefined,
    'search_documents(proposals)'
  );
  if (!docsResult?.content?.[0]) return { html: '', firstProcedureId: '' };

  const data = parseJSON<{ documents?: Array<Partial<LegislativeDocument>> }>(
    docsResult.content[0].text,
    'proposals'
  );
  if (!data?.documents?.length) return { html: '', firstProcedureId: '' };

  console.log(`  ✅ Fetched ${data.documents.length} proposals from MCP`);

  const firstProcedureId =
    data.documents.find((d) => /\d{4}\/\d+\(.+\)/.test(d.id ?? ''))?.id ?? '';

  const html = data.documents
    .map(
      (doc) => `
      <div class="proposal-card">
        <h3>${escapeHTML(doc.title ?? 'Legislative Proposal')}</h3>
        <div class="proposal-meta">
          ${doc.id ? `<span class="proposal-id">${escapeHTML(doc.id)}</span>` : ''}
          ${doc.date ? `<span class="proposal-date">${escapeHTML(doc.date)}</span>` : ''}
          ${doc.status ? `<span class="proposal-status">${escapeHTML(doc.status)}</span>` : ''}
        </div>
        ${doc.committee ? `<p class="proposal-committee">${escapeHTML(doc.committee)}</p>` : ''}
        ${doc.rapporteur ? `<p class="proposal-rapporteur">${escapeHTML(doc.rapporteur)}</p>` : ''}
      </div>`
    )
    .join('');

  return { html, firstProcedureId };
}

/**
 * Fetch active legislative pipeline data from MCP.
 *
 * @param client - MCP client or null
 * @returns Structured pipeline data or null when unavailable
 */
export async function fetchPipelineFromMCP(
  client: EuropeanParliamentMCPClient | null
): Promise<PipelineData | null> {
  if (!client) return null;

  const pipelineResult = await callMCP(
    () => client.monitorLegislativePipeline({ status: 'ACTIVE', limit: 5 }),
    undefined,
    'monitor_legislative_pipeline'
  );
  if (!pipelineResult?.content?.[0]) return null;

  const pipeData = parseJSON<{
    pipelineHealthScore?: number;
    throughputRate?: number;
    procedures?: Array<{ id?: string; title?: string; stage?: string }>;
  }>(pipelineResult.content[0].text, 'pipeline');

  if (!pipeData) return null;

  const healthScore = pipeData.pipelineHealthScore ?? 0;
  const throughput = pipeData.throughputRate ?? 0;
  const procRowsHtml =
    pipeData.procedures
      ?.map(
        (proc) => `
      <div class="procedure-item">
        ${proc.id ? `<span class="procedure-id">${escapeHTML(proc.id)}</span>` : ''}
        ${proc.title ? `<span class="procedure-title">${escapeHTML(proc.title)}</span>` : ''}
        ${proc.stage ? `<span class="procedure-stage">${escapeHTML(proc.stage)}</span>` : ''}
      </div>`
      )
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
export async function fetchProcedureStatusFromMCP(
  client: EuropeanParliamentMCPClient | null,
  procedureId: string
): Promise<string> {
  if (!procedureId || !client) return '';
  try {
    const result = await callMCP(
      () => client.trackLegislation(procedureId),
      undefined,
      `track_legislation(${procedureId})`
    );
    if (!result?.content?.[0]) return '';
    const raw = result.content[0].text;
    return `<pre class="data-summary">${escapeHTML(raw.slice(0, 2000))}</pre>`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`${WARN_PREFIX} track_legislation failed:`, message);
    return '';
  }
}
