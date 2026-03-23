// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Pipeline/FetchStage
 * @description MCP data-fetching pipeline stage with circuit breaker protection.
 *
 * MCP-facing functions accept an explicit `client` argument instead of reading
 * module-level state, making them straightforward to unit-test with a mock
 * client.  The {@link loadFeedDataFromFile} and {@link loadEPFeedDataFromFile}
 * helpers introduce filesystem I/O to load pre-fetched feed JSON produced by
 * agentic workflows.
 *
 * The {@link CircuitBreaker} (imported from `mcp/mcp-retry`) prevents cascading
 * failures when the MCP server is degraded: after
 * {@link CircuitBreakerOptions.failureThreshold} consecutive errors the circuit
 * opens and subsequent calls short-circuit immediately.
 */
import fs from 'fs';
import { getEPMCPClient } from '../../mcp/ep-mcp-client.js';
import { parsePlenarySessions, parseCommitteeMeetings, parseLegislativeDocuments, parseLegislativePipeline, parseParliamentaryQuestions, parseEPEvents, PLACEHOLDER_EVENTS, } from '../week-ahead-content.js';
import { applyCommitteeInfo, applyDocuments, applyEffectiveness, PLACEHOLDER_CHAIR, PLACEHOLDER_MEMBERS, } from '../committee-helpers.js';
import { getMotionsFallbackData } from '../motions-content.js';
import { escapeHTML } from '../../utils/file-utils.js';
// ─── Circuit Breaker (re-exported from mcp-retry bounded context) ────────────
export { CircuitBreaker, } from '../../mcp/mcp-retry.js';
import { CircuitBreaker } from '../../mcp/mcp-retry.js';
/** Module-level circuit breaker shared across all MCP fetch operations */
export const mcpCircuitBreaker = new CircuitBreaker();
// ─── Shared string constants ─────────────────────────────────────────────────
/** Log prefix for MCP fetch operations */
const MCP_FETCH_PREFIX = '  📡';
/** Warning prefix for MCP failures */
const WARN_PREFIX = '  ⚠️';
/** Info prefix for fallback messages */
const INFO_PREFIX = '  ℹ️';
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
/**
 * Normalize a feed-item date into canonical UTC `YYYY-MM-DD` form.
 *
 * @param value - Raw date string from MCP or a prefetched feed file
 * @returns Canonical date string, or undefined when the value is missing/invalid
 */
function normalizeFeedItemDate(value) {
    const trimmed = value.trim();
    if (trimmed === '')
        return undefined;
    const directDate = trimmed.slice(0, 10);
    if (directDate.length === 10) {
        const direct = new Date(`${directDate}T00:00:00Z`);
        if (!Number.isNaN(direct.getTime())) {
            return directDate;
        }
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime()))
        return undefined;
    const parts = parsed.toISOString().split('T');
    return parts[0];
}
/**
 * Filter dated feed items to an inclusive UTC date window.
 *
 * Items without a parseable `date` are dropped when a window is supplied.
 *
 * @param items - Feed items to filter
 * @param dateRange - Inclusive UTC window, or undefined to keep all items
 * @param label - Human-readable label used in logs
 * @returns Filtered array
 */
function filterFeedItemsByDateRange(items, dateRange, label) {
    if (!dateRange)
        return [...items];
    const filtered = items.filter((item) => {
        const normalized = normalizeFeedItemDate(item.date);
        return normalized !== undefined && normalized >= dateRange.start && normalized <= dateRange.end;
    });
    if (filtered.length !== items.length) {
        console.log(`${INFO_PREFIX} Filtered ${label} to ${filtered.length}/${items.length} items within ` +
            `${dateRange.start}..${dateRange.end}`);
    }
    return filtered;
}
/**
 * Apply a date-range filter across all breaking-news feed arrays.
 *
 * @param feedData - Feed data to filter
 * @param dateRange - Inclusive UTC window, or undefined to keep all items
 * @returns Filtered feed payload
 */
function filterBreakingNewsFeedDataByDateRange(feedData, dateRange) {
    const filteredMEPUpdates = filterFeedItemsByDateRange(feedData.mepUpdates, dateRange, 'MEP updates');
    return {
        adoptedTexts: filterFeedItemsByDateRange(feedData.adoptedTexts, dateRange, 'adopted texts'),
        events: filterFeedItemsByDateRange(feedData.events, dateRange, 'events'),
        procedures: filterFeedItemsByDateRange(feedData.procedures, dateRange, 'procedures'),
        mepUpdates: filteredMEPUpdates,
        // When a date-range filter is applied the API-reported total covers the full
        // feed window, not the filtered subset — clear it to avoid a misleading
        // truncation note ("showing 10 of 525" on a single-day slice).
        totalMEPUpdates: dateRange === undefined ? feedData.totalMEPUpdates : undefined,
    };
}
/**
 * Apply a date-range filter across all comprehensive EP feed arrays.
 *
 * @param feedData - Feed data to filter
 * @param dateRange - Inclusive UTC window, or undefined to keep all items
 * @returns Filtered feed payload
 */
function filterEPFeedDataByDateRange(feedData, dateRange) {
    return {
        adoptedTexts: filterFeedItemsByDateRange(feedData.adoptedTexts, dateRange, 'adopted texts'),
        events: filterFeedItemsByDateRange(feedData.events, dateRange, 'events'),
        procedures: filterFeedItemsByDateRange(feedData.procedures, dateRange, 'procedures'),
        mepUpdates: filterFeedItemsByDateRange(feedData.mepUpdates, dateRange, 'MEP updates'),
        documents: filterFeedItemsByDateRange(feedData.documents, dateRange, 'documents'),
        plenaryDocuments: filterFeedItemsByDateRange(feedData.plenaryDocuments, dateRange, 'plenary documents'),
        committeeDocuments: filterFeedItemsByDateRange(feedData.committeeDocuments, dateRange, 'committee documents'),
        plenarySessionDocuments: filterFeedItemsByDateRange(feedData.plenarySessionDocuments, dateRange, 'plenary session documents'),
        externalDocuments: filterFeedItemsByDateRange(feedData.externalDocuments, dateRange, 'external documents'),
        questions: filterFeedItemsByDateRange(feedData.questions, dateRange, 'questions'),
        declarations: filterFeedItemsByDateRange(feedData.declarations, dateRange, 'declarations'),
        corporateBodies: filterFeedItemsByDateRange(feedData.corporateBodies, dateRange, 'corporate bodies'),
    };
}
/**
 * Compute an inclusive UTC date window ending on `endDate`.
 *
 * @param endDate - Inclusive UTC end date in `YYYY-MM-DD` form
 * @param lookbackDays - Number of calendar days to subtract for the start date
 * @param context - Label used in error messages
 * @returns Inclusive date range
 */
export function computeRollingDateRange(endDate, lookbackDays, context) {
    const startDate = new Date(`${endDate}T00:00:00Z`);
    startDate.setUTCDate(startDate.getUTCDate() - lookbackDays);
    const startDateParts = startDate.toISOString().split('T');
    if (!startDateParts[0]) {
        throw new Error(`Invalid date format generated for ${context}`);
    }
    return { start: startDateParts[0], end: endDate };
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
// ─── Pre-fetched feed data loading ───────────────────────────────────────────
/**
 * Check whether a value is a non-null, non-array plain object.
 *
 * @param v - Value to check
 * @returns True when v is a plain object
 */
function isPlainObject(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}
/**
 * Sanitize an array of raw items into feed items with title-based required fields.
 * Filters out non-objects and coerces `id`, `title`, `date` to strings.
 *
 * Uses `as unknown as T` because the spread preserves optional properties from
 * the source JSON while the explicit field assignments guarantee the required
 * base fields — TypeScript cannot infer this mixed provenance automatically.
 *
 * @param items - Raw array of unknown values from JSON
 * @returns Sanitized array of typed feed items
 */
function sanitizeTitleItems(items) {
    return items
        .filter(isPlainObject)
        .filter((item) => (item['id'] !== undefined && item['id'] !== null) ||
        (item['title'] !== undefined && item['title'] !== null))
        .map((item) => ({
        ...item,
        id: String(item['id'] ?? ''),
        title: String(item['title'] ?? ''),
        date: String(item['date'] ?? ''),
    }));
}
/**
 * Sanitize an array of raw items into MEP feed items.
 * Filters out non-objects and coerces `id`, `name`, `date` to strings.
 *
 * @param items - Raw array of unknown values from JSON
 * @returns Sanitized array of MEP feed items
 */
function sanitizeMEPItems(items) {
    return items
        .filter(isPlainObject)
        .filter((item) => (item['id'] !== undefined && item['id'] !== null) ||
        (item['name'] !== undefined && item['name'] !== null))
        .map((item) => ({
        ...item,
        id: String(item['id'] ?? ''),
        name: String(item['name'] ?? ''),
        date: String(item['date'] ?? ''),
    }));
}
/**
 * Load pre-fetched feed data from a JSON file on disk.
 *
 * Agentic workflows fetch EP data via framework MCP tools but the TypeScript
 * generator cannot access those tools directly.  The workflow saves the MCP
 * results to a JSON file and the generator reads them via this function,
 * avoiding the need to manually construct article HTML.
 *
 * The file must contain a JSON object. The optional keys
 * `adoptedTexts`, `events`, `procedures`, and `mepUpdates` are treated as
 * arrays and default to empty arrays when missing (an empty object `{}` is valid).
 *
 * @param filePath - Absolute or relative path to the JSON file
 * @param dateRange - Optional inclusive UTC window for filtering loaded items
 * @returns Parsed {@link BreakingNewsFeedData}, or `undefined` on any error
 */
export function loadFeedDataFromFile(filePath, dateRange) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`${WARN_PREFIX} Feed data file not found: ${filePath}`);
            return undefined;
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            console.warn(`${WARN_PREFIX} Feed data file must contain a JSON object`);
            return undefined;
        }
        const obj = parsed;
        const adoptedTexts = sanitizeTitleItems(Array.isArray(obj['adoptedTexts']) ? obj['adoptedTexts'] : []);
        const events = sanitizeTitleItems(Array.isArray(obj['events']) ? obj['events'] : []);
        const procedures = sanitizeTitleItems(Array.isArray(obj['procedures']) ? obj['procedures'] : []);
        const mepUpdates = sanitizeMEPItems(Array.isArray(obj['mepUpdates']) ? obj['mepUpdates'] : []);
        const totalMEPUpdates = typeof obj['totalMEPUpdates'] === 'number' ? obj['totalMEPUpdates'] : undefined;
        const filteredData = filterBreakingNewsFeedDataByDateRange({
            adoptedTexts,
            events,
            procedures,
            mepUpdates,
            totalMEPUpdates,
        }, dateRange);
        console.log(`${INFO_PREFIX} Loaded feed data from file: ` +
            `${filteredData.adoptedTexts.length} adopted texts, ${filteredData.events.length} events, ` +
            `${filteredData.procedures.length} procedures, ${filteredData.mepUpdates.length} MEP updates`);
        return filteredData;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} Failed to load feed data from file: ${message}`);
        return undefined;
    }
}
/**
 * Load pre-fetched comprehensive EP feed data from a JSON file on disk.
 *
 * Agentic workflows fetch EP data via framework MCP tools but the TypeScript
 * generator cannot access those tools directly.  The workflow saves the MCP
 * results to a JSON file and the generator reads them via this function,
 * avoiding the need to manually construct article HTML.
 *
 * The file must contain a JSON object with EP feed data keys.
 * Missing keys default to empty arrays.
 *
 * @param filePath - Absolute or relative path to the JSON file
 * @param dateRange - Optional inclusive UTC window for filtering loaded items
 * @returns Parsed {@link EPFeedData}, or `undefined` on any error
 */
export function loadEPFeedDataFromFile(filePath, dateRange) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`${WARN_PREFIX} EP feed data file not found: ${filePath}`);
            return undefined;
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            console.warn(`${WARN_PREFIX} EP feed data file must contain a JSON object`);
            return undefined;
        }
        const obj = parsed;
        const safeArray = (key) => Array.isArray(obj[key]) ? obj[key] : [];
        const adoptedTexts = sanitizeTitleItems(safeArray('adoptedTexts'));
        const events = sanitizeTitleItems(safeArray('events'));
        const procedures = sanitizeTitleItems(safeArray('procedures'));
        const mepUpdates = sanitizeMEPItems(safeArray('mepUpdates'));
        const documents = sanitizeTitleItems(safeArray('documents'));
        const plenaryDocuments = sanitizeTitleItems(safeArray('plenaryDocuments'));
        const committeeDocuments = sanitizeTitleItems(safeArray('committeeDocuments'));
        const plenarySessionDocuments = sanitizeTitleItems(safeArray('plenarySessionDocuments'));
        const externalDocuments = sanitizeTitleItems(safeArray('externalDocuments'));
        const questions = sanitizeTitleItems(safeArray('questions'));
        const declarations = sanitizeTitleItems(safeArray('declarations'));
        const corporateBodies = sanitizeTitleItems(safeArray('corporateBodies'));
        const filteredData = filterEPFeedDataByDateRange({
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
        }, dateRange);
        const totalItems = filteredData.adoptedTexts.length +
            filteredData.events.length +
            filteredData.procedures.length +
            filteredData.mepUpdates.length +
            filteredData.documents.length +
            filteredData.plenaryDocuments.length +
            filteredData.committeeDocuments.length +
            filteredData.plenarySessionDocuments.length +
            filteredData.externalDocuments.length +
            filteredData.questions.length +
            filteredData.declarations.length +
            filteredData.corporateBodies.length;
        console.log(`${INFO_PREFIX} Loaded EP feed data from file: ${totalItems} total items across 12 keys`);
        return filteredData;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} Failed to load EP feed data from file: ${message}`);
        return undefined;
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
 * Load pre-fetched committee data for a given abbreviation from a JSON file.
 *
 * The file must be a JSON object keyed by committee abbreviation, where each
 * value conforms to {@link CommitteeData}.  This allows agentic workflows to
 * inject real EP committee data into the generator without a live MCP
 * connection (same pattern as {@link loadEPFeedDataFromFile}).
 *
 * @param filePath - Path to the JSON file
 * @param abbreviation - Committee code (e.g. `"ENVI"`)
 * @returns Parsed {@link CommitteeData} for the committee, or `undefined`
 */
export function loadCommitteeDataFromFile(filePath, abbreviation) {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`${WARN_PREFIX} Committee data file not found: ${filePath}`);
            return undefined;
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            console.warn(`${WARN_PREFIX} Committee data file must contain a JSON object`);
            return undefined;
        }
        const obj = parsed;
        const entry = obj[abbreviation];
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            return undefined;
        }
        const e = entry;
        const docs = Array.isArray(e['documents'])
            ? e['documents']
                .filter((d) => typeof d === 'object' && d !== null && !Array.isArray(d))
                .map((doc) => ({
                title: typeof doc['title'] === 'string' ? doc['title'] : 'Document',
                type: typeof doc['type'] === 'string' ? doc['type'] : 'Document',
                date: typeof doc['date'] === 'string' ? doc['date'] : '',
            }))
            : [];
        const result = {
            name: typeof e['name'] === 'string' ? e['name'] : `${abbreviation} Committee`,
            abbreviation,
            chair: typeof e['chair'] === 'string' ? e['chair'] : 'N/A',
            members: typeof e['members'] === 'number' && Number.isFinite(e['members']) ? e['members'] : 0,
            documents: docs,
            effectiveness: typeof e['effectiveness'] === 'string' ? e['effectiveness'] : null,
        };
        console.log(`${INFO_PREFIX} Loaded committee data from file: ${result.name} (${docs.length} documents)`);
        return result;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} Failed to load committee data from file: ${message}`);
        return undefined;
    }
}
/**
 * Try to load committee data from the `EP_COMMITTEE_DATA_FILE` env var.
 * Returns the loaded {@link CommitteeData} when available, or `undefined` when
 * the env var is unset or the file does not contain an entry for the given
 * committee abbreviation.  Logs a warning when the file exists but the entry
 * is missing so callers can fall through to an MCP fetch.
 *
 * @param abbreviation - Committee code (e.g. `"ENVI"`)
 * @returns Pre-fetched committee data or `undefined`
 */
function tryLoadCommitteeDataFromEnv(abbreviation) {
    const filePath = process.env['EP_COMMITTEE_DATA_FILE'];
    if (!filePath)
        return undefined;
    const data = loadCommitteeDataFromFile(filePath, abbreviation);
    if (!data && fs.existsSync(filePath)) {
        console.warn(`${WARN_PREFIX} Committee data for ${abbreviation} not found in file — falling through to MCP fetch`);
    }
    return data;
}
// ─── EP v2 API direct fallback ──────────────────────────────────────────────
/** Base URL for the EP Open Data Portal v2 API */
const EP_API_V2_BASE = 'https://data.europarl.europa.eu/api/v2';
/** Timeout for direct EP API requests (ms) */
const EP_API_TIMEOUT_MS = 15_000;
/**
 * Fetch committee info directly from the EP v2 API as a fallback when MCP
 * returns placeholder data.  Uses `GET /corporate-bodies/{abbreviation}` which
 * is the canonical lookup for a committee by its code (e.g. `ENVI`).
 *
 * This function is intentionally conservative: it primarily populates `name`
 * and `abbreviation`, and may populate `members` from `inverse_isVersionOf`
 * when available. Placeholder status is broken by changing `members` from `0`
 * (placeholder criteria is chair='N/A' AND members=0 AND docs=[]).
 *
 * @param abbreviation - Committee abbreviation (e.g. `"ENVI"`)
 * @param data - Existing committee data to enrich
 */
export async function fetchCommitteeInfoFromEPAPI(abbreviation, data) {
    const url = `${EP_API_V2_BASE}/corporate-bodies/${encodeURIComponent(abbreviation)}?format=application%2Fld%2Bjson`;
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), EP_API_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(url, {
                signal: controller.signal,
                headers: { Accept: 'application/ld+json' },
            });
        }
        finally {
            clearTimeout(timer);
        }
        if (!response.ok) {
            console.warn(`${WARN_PREFIX} EP API direct lookup for ${abbreviation} returned ${String(response.status)}`);
            return;
        }
        const body = (await response.json());
        const items = body.data;
        if (!Array.isArray(items) || items.length === 0)
            return;
        const item = items[0];
        if (!item)
            return;
        // Extract name: prefer English prefLabel, then English altLabel, then label
        const name = item.prefLabel?.['en'] ?? item.altLabel?.['en'] ?? item.label ?? undefined;
        if (name && name.length > 0) {
            data.name = name;
        }
        // Extract abbreviation: the label field holds the abbreviation code
        const abbr = item.label;
        if (abbr && abbr.length > 0 && !abbr.startsWith('org/')) {
            data.abbreviation = abbr;
        }
        console.log(`  ✅ EP API fallback: ${data.name} (${data.abbreviation})`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`${WARN_PREFIX} EP API direct fallback failed for ${abbreviation}:`, message);
    }
}
/**
 * Check whether a single committee data entry is still in placeholder state.
 *
 * @param data - Committee data to inspect
 * @returns `true` when the entry matches all placeholder criteria
 */
function isPlaceholderEntry(data) {
    return (data.chair === PLACEHOLDER_CHAIR &&
        data.members === PLACEHOLDER_MEMBERS &&
        data.documents.length === 0);
}
/**
 * Fetch committee data from three MCP sources for the given abbreviation.
 * Each source failure is caught individually so partial data is still returned.
 *
 * When the environment variable `EP_COMMITTEE_DATA_FILE` is set, pre-fetched
 * committee data is loaded from that JSON file instead of calling the MCP
 * client.  This enables agentic workflows to inject real EP data.
 *
 * When MCP returns placeholder data (chair=N/A, members=0, docs=[]),
 * a direct call to the EP v2 API is attempted as a fallback to populate
 * at least the committee name and abbreviation.
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
    // Check for pre-fetched committee data file (set by EP_COMMITTEE_DATA_FILE env var).
    // This mirrors the EP_FEED_DATA_FILE pattern for fetchEPFeedData.
    const fromFile = tryLoadCommitteeDataFromEnv(abbreviation);
    if (fromFile)
        return fromFile;
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
    // Fallback: when MCP left the committee in placeholder state, try the EP v2
    // API directly.  This provides resilience when the MCP server has issues
    // parsing committee data (see European-Parliament-MCP-Server#233).
    if (isPlaceholderEntry(defaultResult)) {
        console.log(`${INFO_PREFIX} Committee ${abbreviation} still placeholder after MCP — trying EP v2 API directly...`);
        await fetchCommitteeInfoFromEPAPI(abbreviation, defaultResult);
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
 * Parse an EP API v2 feed response envelope in a single JSON parse, returning
 * both the array of feed items and the API-reported total count.
 * Avoids parsing the same JSON payload twice when both values are needed.
 *
 * @param result - Raw MCP tool result
 * @returns Object with `items` array and `total` count from the API
 */
function parseFeedEnvelope(result) {
    if (!result?.content?.[0]?.text)
        return { items: [], total: 0 };
    const parsed = parseJSON(result.content[0].text, 'feed');
    if (!parsed || typeof parsed !== 'object')
        return { items: [], total: 0 };
    const envelope = parsed;
    const total = typeof envelope['total'] === 'number' ? envelope['total'] : 0;
    const candidates = [
        envelope['data'],
        envelope['feed'],
        envelope['entries'],
        envelope['items'],
        parsed,
    ];
    for (const candidate of candidates) {
        if (Array.isArray(candidate))
            return { items: candidate, total };
    }
    return { items: [], total };
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
    return (await fetchMEPsFeedWithTotal(client, timeframe)).items;
}
/**
 * Fetch MEPs feed from MCP, returning both items and the API's reported total count.
 * The `total` from the API response reflects all matching records in the feed,
 * which may exceed the `limit` parameter (currently capped at 100 per request).
 *
 * The limit is set to 100 (the EP API maximum) so the fetched sample is large
 * enough to populate a meaningful truncation note ("showing 10 of N") while
 * keeping each request bounded.  When the feed contains more than 100 MEP
 * updates, the `total` field in the API response carries the true count.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @returns Object with `items` array and `total` count from the API
 */
export async function fetchMEPsFeedWithTotal(client, timeframe = 'one-day') {
    if (!client)
        return { items: [], total: 0 };
    try {
        console.log(`${MCP_FETCH_PREFIX} Fetching MEPs feed (${timeframe})...`);
        const result = await callMCP(() => client.getMEPsFeed({ timeframe, limit: 100 }), undefined, 'get_meps_feed');
        const { items: rawItems, total } = parseFeedEnvelope(result);
        const items = rawItems.map((item) => ({
            id: String(item['id'] ?? item['mepId'] ?? ''),
            name: String(item['name'] ?? item['label'] ?? item['title'] ?? 'Unknown'),
            date: String(item['date'] ?? item['published'] ?? item['updated'] ?? ''),
            country: item['country'] ? String(item['country']) : undefined,
            group: item['group'] ? String(item['group']) : undefined,
            url: item['url'] ? String(item['url']) : undefined,
            identifier: item['identifier'] ? String(item['identifier']) : undefined,
            label: item['label'] ? String(item['label']) : undefined,
        }));
        return { items, total };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`${WARN_PREFIX} get_meps_feed failed:`, message);
        return { items: [], total: 0 };
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
    const [adoptedTexts, events, procedures, mepFeedResult] = await Promise.all([
        fetchAdoptedTextsFeed(client, timeframe),
        fetchEventsFeed(client, timeframe),
        fetchProceduresFeed(client, timeframe),
        fetchMEPsFeedWithTotal(client, timeframe),
    ]);
    const { items: mepUpdates, total: totalMEPUpdates } = mepFeedResult;
    return {
        adoptedTexts,
        events,
        procedures,
        mepUpdates,
        totalMEPUpdates: totalMEPUpdates > 0 ? totalMEPUpdates : undefined,
    };
}
/**
 * Fetch comprehensive EP feed data from all 12 feed endpoints in parallel.
 * This is the primary data source for all article strategies.
 *
 * @param client - MCP client or null
 * @param timeframe - How far back to look (default: 'one-day')
 * @param dateRange - Optional inclusive UTC window for filtering feed items
 * @returns Full EPFeedData or undefined when client is null
 */
export async function fetchEPFeedData(client, timeframe = 'one-day', dateRange) {
    // Check for pre-fetched feed data file (set by --feed-data CLI arg).
    // This allows agentic workflows to pass MCP data fetched via framework tools
    // into the generator without requiring a direct MCP connection.
    const feedDataFile = process.env['EP_FEED_DATA_FILE'];
    if (feedDataFile) {
        const fileData = loadEPFeedDataFromFile(feedDataFile, dateRange);
        if (fileData)
            return fileData;
        console.log(`${WARN_PREFIX} Pre-fetched EP feed data failed to load — falling through to MCP fetch`);
    }
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
    const filteredData = filterEPFeedDataByDateRange({
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
    }, dateRange);
    const totalItems = filteredData.adoptedTexts.length +
        filteredData.events.length +
        filteredData.procedures.length +
        filteredData.mepUpdates.length +
        filteredData.documents.length +
        filteredData.plenaryDocuments.length +
        filteredData.committeeDocuments.length +
        filteredData.plenarySessionDocuments.length +
        filteredData.externalDocuments.length +
        filteredData.questions.length +
        filteredData.declarations.length +
        filteredData.corporateBodies.length;
    console.log(`  ✅ Fetched ${totalItems} total feed items across 12 endpoints`);
    return filteredData;
}
//# sourceMappingURL=fetch-stage.js.map