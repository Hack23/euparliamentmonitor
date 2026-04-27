// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/EPOpenDataClient
 * @description Direct HTTP fallback client for the European Parliament Open Data
 * Portal (`https://data.europarl.europa.eu/api/v2/`) — specifically the
 * `/decision` endpoint that exposes roll-call voting records.
 *
 * ## Why this exists (Defect D-02)
 *
 * The EP MCP server tool `get_voting_records` relies on an EP feed that
 * publishes roll-call data with a 4–6 week delay (documented limitation,
 * see `.github/prompts/07-mcp-reference.md` §11 item #6). That lag can
 * leave the most recent voting window empty in MCP even when the EP Open
 * Data Portal `/api/v2/decision` endpoint already exposes the underlying
 * roll-call records directly. This client therefore queries that endpoint
 * whenever the MCP layer returns an empty votes array, improving freshness
 * without limiting the fallback to older date ranges.
 *
 * ## Three-state fallback logic
 *
 * Call {@link getVotingRecordsWithFallback} to execute the decision tree:
 *
 * ```
 * (a) MCP returns non-empty votes  → use MCP result (source: "mcp")
 * (b) MCP empty, Portal has data   → use Portal result (source: "ep-open-data-portal")
 * (c) Both empty                   → emit 🔴 unavailable marker (source: "unavailable")
 * ```
 *
 * ## Transport
 *
 * - Uses the native Node 25 `fetch()` — no extra runtime dependency.
 * - Every call has an independent `AbortController` with a configurable
 *   timeout (`EP_OPEN_DATA_TIMEOUT_MS`, default 30 s).
 * - Errors (HTTP 4xx/5xx, network faults, JSON parse failures, abort) are
 *   caught and converted to an empty-votes envelope matching the MCP fallback
 *   shape, so consumers that already expect `response.content[0]?.text` to
 *   hold a JSON blob keep working without change.
 *
 * ## Attribution
 *
 * All data returned by this client originates from the EP Open Data Portal
 * which is published under the CC BY 4.0 licence. Every fallback response
 * includes a `_attribution` field with the canonical citation string.
 *
 * Environment variables:
 * - `EP_OPEN_DATA_BASE_URL` — override base URL (default
 *   `https://data.europarl.europa.eu/api/v2`).
 * - `EP_OPEN_DATA_TIMEOUT_MS` — per-request timeout (default `30000`).
 */

import type { MCPToolResult, MCPClientOptions } from '../types/index.js';

// ─── Defaults ────────────────────────────────────────────────────────────────

/** Default base URL for the EP Open Data Portal API v2. */
const DEFAULT_EP_OPEN_DATA_BASE_URL = 'https://data.europarl.europa.eu/api/v2';

/** Default per-request timeout (milliseconds). */
const DEFAULT_EP_OPEN_DATA_TIMEOUT_MS = 30_000;

/**
 * Attribution string required by the EP Open Data Portal licence (CC BY 4.0).
 * Appended to every fallback response.
 */
const EP_OPEN_DATA_ATTRIBUTION =
  'European Parliament Open Data Portal — https://data.europarl.europa.eu — CC BY 4.0';

/**
 * Generic empty-votes fallback payload returned when the portal call cannot
 * produce usable voting data, including invalid input, missing dates, empty
 * portal responses, and HTTP/network/parse/timeout failures.
 */
const EMPTY_VOTES_FALLBACK: MCPToolResult = {
  content: [{ type: 'text', text: '{"votes":[]}' }],
};

// ─── Virtual tool list ────────────────────────────────────────────────────────

/** Canonical tool name for EP voting records (kept DRY for tools list and warnings). */
const EP_GET_VOTING_RECORDS_TOOL = 'ep-get-voting-records';

/**
 * Virtual tool names exposed by this client. The list is used as a drift
 * guard in `test/unit/ep-open-data-client.test.js` and in the Stage-C
 * editorial fingerprint for `voting-patterns.md` (the article must cite
 * at least one of these when the fallback is active).
 */
export const EP_OPEN_DATA_TOOLS: readonly string[] = [EP_GET_VOTING_RECORDS_TOOL];

// ─── Response types (EP Open Data Portal JSON-LD narrow subset) ──────────────

interface EPDecisionRecord {
  identifier?: string;
  date?: string;
  activityType?: string;
  prefLabel?: string | Record<string, string>;
  favorable?: number;
  against?: number;
  abstention?: number;
  /** Raw @id URI (used when `identifier` is absent). */
  '@id'?: string;
}

interface EPDecisionResponse {
  data?: EPDecisionRecord[];
}

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * Source tag for a voting-records result.
 * - `"mcp"` — the EP MCP server returned non-empty data.
 * - `"ep-open-data-portal"` — MCP was empty; the fallback portal query succeeded.
 * - `"unavailable"` — both sources returned empty; a `🔴` marker was emitted.
 */
export type VotingDataSource = 'mcp' | 'ep-open-data-portal' | 'unavailable';

/**
 * Result envelope from {@link getVotingRecordsWithFallback}.
 * Exposes the raw MCP-shaped result plus provenance metadata consumed
 * by `voting-patterns.md` §"Voting Data Freshness".
 */
export interface VotingRecordsFallbackResult {
  /** MCP-shaped voting records (or 🔴 marker when unavailable). */
  result: MCPToolResult;
  /** Which source delivered the data. */
  source: VotingDataSource;
  /**
   * Human-readable freshness string for the `voting-data-freshness` audit row.
   * E.g. `"🟢 MCP (2026-04-01 → 2026-04-26)"`,
   *      `"🟡 EP Open Data Portal fallback (2026-03-01 → 2026-04-01)"`, or
   *      `"🔴 voting data unavailable for window 2026-04-01 → 2026-04-26"`.
   */
  freshnessLabel: string;
}

/**
 * Options for {@link getVotingRecordsWithFallback} and
 * {@link EPOpenDataClient.getVotingRecords}.
 */
export interface VotingRecordsFallbackOptions extends MCPClientOptions {
  /** Inclusive start date (YYYY-MM-DD). */
  dateFrom: string;
  /** Inclusive end date (YYYY-MM-DD). */
  dateTo: string;
  /** Maximum records to return (default 50). */
  limit?: number;
  /** Pagination offset (default 0). */
  offset?: number;
  /** Optional `fetch` implementation injection for testing. */
  fetchImpl?: typeof fetch;
  /** Override the EP Open Data base URL. */
  apiBaseUrl?: string;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Unwrap a multilingual JSON-LD label to a plain string.
 * Prefers the English value; falls back to the first available string value.
 *
 * @param raw - Raw label (string, locale object, or undefined).
 * @returns Plain string (empty when no label is available).
 * @internal
 */
function unwrapLabel(raw: string | Record<string, string> | undefined): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw['en'] === 'string') return raw['en'];
  for (const v of Object.values(raw)) {
    if (typeof v === 'string') return v;
  }
  return '';
}

/**
 * Wrap a value in the canonical MCP tool-result shape.
 *
 * @param payload - Serialisable payload.
 * @returns MCP tool-result envelope.
 * @internal
 */
function wrapAsMCPResult(payload: unknown): MCPToolResult {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload ?? null);
  return { content: [{ type: 'text', text }] };
}

/**
 * Extract an identifier from an EP decision record.
 *
 * @param record - Raw EP Open Data Portal decision record.
 * @returns Best-effort identifier string.
 * @internal
 */
function extractIdentifier(record: EPDecisionRecord): string {
  if (record.identifier) return record.identifier;
  const rawId = record['@id'] ?? '';
  if (!rawId) return '';
  // Strip the URI prefix — last path segment is the local id.
  const lastSlash = rawId.lastIndexOf('/');
  return lastSlash >= 0 ? rawId.slice(lastSlash + 1) : rawId;
}

// ─── Client ──────────────────────────────────────────────────────────────────

/**
 * Direct HTTP client for EP Open Data Portal roll-call vote data.
 *
 * Queries `GET /api/v2/decision` with `date-of-vote-start` and
 * `date-of-vote-end` parameters. The response is JSON-LD; we extract
 * the `data` array and normalise each entry to the same `votes[]` shape
 * that the MCP `get_voting_records` tool returns, augmented with
 * `_source` and `_attribution` metadata.
 *
 * @example
 * ```ts
 * const client = new EPOpenDataClient();
 * const result = await client.getVotingRecords({
 *   dateFrom: '2026-03-01',
 *   dateTo:   '2026-04-01',
 * });
 * ```
 */
export class EPOpenDataClient {
  private readonly _apiBaseUrl: string;
  private readonly _timeoutMs: number;
  private readonly _fetchImpl: typeof fetch;
  private _connected = false;

  constructor(options: VotingRecordsFallbackOptions = { dateFrom: '', dateTo: '' }) {
    const envBase = process.env['EP_OPEN_DATA_BASE_URL'];
    const envTimeout = process.env['EP_OPEN_DATA_TIMEOUT_MS'];
    const parsedEnvTimeout =
      envTimeout !== undefined && envTimeout !== '' ? Number.parseInt(envTimeout, 10) : Number.NaN;

    const base =
      options.apiBaseUrl ?? (envBase && envBase !== '' ? envBase : DEFAULT_EP_OPEN_DATA_BASE_URL);

    // Strip trailing slashes without a regex (avoids polynomial-ReDoS flags).
    let end = base.length;
    while (end > 0 && base.charCodeAt(end - 1) === 47 /* '/' */) {
      end -= 1;
    }
    this._apiBaseUrl = end === base.length ? base : base.slice(0, end);

    this._timeoutMs =
      options.timeoutMs !== undefined && Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
        ? options.timeoutMs
        : Number.isFinite(parsedEnvTimeout) && parsedEnvTimeout > 0
          ? parsedEnvTimeout
          : DEFAULT_EP_OPEN_DATA_TIMEOUT_MS;

    this._fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Base URL currently in use (set at construction time).
   *
   * @returns The fully-qualified EP Open Data Portal base URL (no trailing slash).
   */
  getApiBaseUrl(): string {
    return this._apiBaseUrl;
  }

  /**
   * Per-request timeout in milliseconds.
   *
   * @returns The timeout applied to every `fetch()` call.
   */
  getTimeoutMs(): number {
    return this._timeoutMs;
  }

  /**
   * Mark the client as ready (HTTP is stateless; validates URL shape only).
   *
   * @returns A resolved promise; never throws for valid URLs.
   * @throws When the base URL is malformed (e.g. missing protocol).
   */
  async connect(): Promise<void> {
    try {
      new URL(this._apiBaseUrl);
      this._connected = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid EP_OPEN_DATA_BASE_URL "${this._apiBaseUrl}": ${message}`, {
        cause: error,
      });
    }
  }

  /**
   * Whether {@link connect} has been called successfully.
   *
   * @returns `true` after a successful {@link connect}.
   */
  isConnected(): boolean {
    return this._connected;
  }

  /** Reset the connected flag. No real socket to close. */
  disconnect(): void {
    this._connected = false;
  }

  /**
   * Fetch roll-call voting records from the EP Open Data Portal.
   *
   * Virtual tool: `ep-get-voting-records` (see {@link EP_GET_VOTING_RECORDS_TOOL}).
   *
   * Queries `/decision?date-of-vote-start=<dateFrom>&date-of-vote-end=<dateTo>`
   * and normalises the JSON-LD response to a `{ votes: VoteEntry[] }`
   * envelope whose shape mirrors `get_voting_records` from the EP MCP server,
   * augmented with `_source` and `_attribution` metadata.
   *
   * Returns the EMPTY_VOTES_FALLBACK envelope on any error so callers can
   * safely chain the result through {@link EPOpenDataClient.isVotingDataEmpty}
   * without defensive try/catch.
   *
   * @param options - Query options. `dateFrom` and `dateTo` are required and
   *   must be non-empty YYYY-MM-DD strings.
   * @returns MCP-shaped result with `votes[]` array (possibly empty on error).
   */
  async getVotingRecords(
    options: Pick<VotingRecordsFallbackOptions, 'dateFrom' | 'dateTo' | 'limit' | 'offset'>
  ): Promise<MCPToolResult> {
    const { dateFrom, dateTo } = options;
    if (!dateFrom || !dateTo) {
      console.warn(`${EP_GET_VOTING_RECORDS_TOOL}: dateFrom and dateTo are required`);
      return EMPTY_VOTES_FALLBACK;
    }
    try {
      const qs = new URLSearchParams({
        'date-of-vote-start': dateFrom,
        'date-of-vote-end': dateTo,
        limit: String(options.limit ?? 50),
        offset: String(options.offset ?? 0),
        format: 'application/ld+json',
      });
      const json = await this._getJSON<EPDecisionResponse>(`/decision?${qs.toString()}`);
      const records = json?.data ?? [];
      const votes = records.map((r) => ({
        identifier: extractIdentifier(r),
        date: r.date ?? '',
        title: unwrapLabel(r.prefLabel),
        activityType: r.activityType ?? '',
        for: r.favorable ?? 0,
        against: r.against ?? 0,
        abstain: r.abstention ?? 0,
      }));
      return wrapAsMCPResult({
        votes,
        _source: 'ep-open-data-portal',
        _attribution: EP_OPEN_DATA_ATTRIBUTION,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`${EP_GET_VOTING_RECORDS_TOOL} not available:`, message);
      return EMPTY_VOTES_FALLBACK;
    }
  }

  // ─── Static helpers ──────────────────────────────────────────────────────

  /**
   * Return `true` when a `get_voting_records` (or fallback) result carries
   * zero votes. Used to decide whether to proceed to the next fallback tier.
   *
   * Handles both the `{"votes":[]}` MCP empty shape and the plain
   * `{"votes":null}` edge case.
   *
   * @param result - MCP tool result to inspect.
   * @returns `true` when the votes array is absent or empty.
   */
  static isVotingDataEmpty(result: MCPToolResult): boolean {
    try {
      const text = result.content?.[0]?.text ?? '';
      if (!text) return true;
      const parsed = JSON.parse(text) as { votes?: unknown[] | null };
      return !Array.isArray(parsed.votes) || parsed.votes.length === 0;
    } catch {
      return true;
    }
  }

  /**
   * Build the canonical `🔴 voting data unavailable` marker emitted when
   * both MCP and the EP Open Data Portal fallback return empty.
   *
   * The returned payload remains a normal MCP JSON envelope containing an
   * empty `votes` array plus human-readable marker metadata (`_marker`,
   * `_reason`, `_unavailable`). This preserves compatibility with consumers
   * that parse `response.content[0]?.text` as JSON, while still exposing a
   * clear alert message for downstream display or diagnostics.
   *
   * @param dateFrom - Analysis period start (YYYY-MM-DD).
   * @param dateTo   - Analysis period end (YYYY-MM-DD).
   * @returns MCP-shaped result containing the 🔴 unavailability marker.
   */
  static buildVotingUnavailableMarker(dateFrom: string, dateTo: string): MCPToolResult {
    return wrapAsMCPResult({
      votes: [],
      _unavailable: true,
      _marker: `🔴 voting data unavailable for window ${dateFrom} → ${dateTo}`,
      _reason:
        'EP MCP server returned no roll-call votes and EP Open Data Portal returned no decisions ' +
        'for the requested window. This is expected when the window lies within the 4–6 week EP ' +
        'publication delay AND no older data has been published. Do not substitute with ' +
        'structural-proxy cohesion scores without an explicit LOW-confidence flag per ' +
        'osint-tradecraft-standards.md §3.1.',
    });
  }

  // ─── Private transport helpers ────────────────────────────────────────────

  /**
   * Build a full URL and GET it as text, enforcing the client-wide timeout.
   *
   * @param path - Path (already URL-encoded) to append to the base URL.
   * @returns Response body as a string.
   * @throws When the HTTP status is not 2xx, the request times out, or
   *   the network layer raises.
   * @internal
   */
  private async _getText(path: string): Promise<string> {
    const url = `${this._apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this._timeoutMs);
    try {
      const response = await this._fetchImpl(url, {
        method: 'GET',
        headers: { Accept: 'application/ld+json, application/json;q=0.9' },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
      }
      return await response.text();
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * GET a URL and parse the response body as JSON.
   *
   * @template T - Narrow response type declared by the caller.
   * @param path - Path to append to the base URL.
   * @returns Parsed JSON value.
   * @throws When the response is not JSON, not 2xx, or the request fails.
   * @internal
   */
  private async _getJSON<T>(path: string): Promise<T> {
    const raw = await this._getText(path);
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse EP Open Data response as JSON: ${message}`, {
        cause: error,
      });
    }
  }
}

/** Forward-looking alias (preferred for new code). */
export const EPOpenDataPortalClient = EPOpenDataClient;

// ─── Top-level three-state fallback helper ────────────────────────────────────

/**
 * Execute the three-state voting-data fallback decision tree.
 *
 * Given an already-retrieved MCP result and fallback options (dateFrom /
 * dateTo / fetchImpl / …), returns a {@link VotingRecordsFallbackResult}
 * that records both the data and the provenance label consumed by the
 * `voting-patterns.md` §"Voting Data Freshness" section.
 *
 * Decision tree:
 * ```
 * (a) mcpResult has votes  → source: "mcp",                freshness: 🟢
 * (b) MCP empty, portal ok → source: "ep-open-data-portal", freshness: 🟡
 * (c) both empty           → source: "unavailable",          freshness: 🔴
 * ```
 *
 * @param mcpResult - Result of `get_voting_records` from the EP MCP server.
 * @param options   - Fallback options; `dateFrom` and `dateTo` are required
 *   non-empty YYYY-MM-DD strings.
 * @returns Fallback result with source tag and human-readable freshness label.
 * @throws When `dateFrom` or `dateTo` is missing/blank, or when the EP Open
 *   Data Portal base URL is malformed (configuration error — distinct from
 *   the 🔴 `unavailable` data-empty path).
 *
 * @example
 * ```ts
 * const mcp = await epClient.getVotingRecords({ dateFrom, dateTo, limit: 50 });
 * const { result, source, freshnessLabel } = await getVotingRecordsWithFallback(mcp, {
 *   dateFrom, dateTo,
 * });
 * // Write freshnessLabel into voting-patterns.md §"Voting Data Freshness"
 * ```
 */
export async function getVotingRecordsWithFallback(
  mcpResult: MCPToolResult,
  options: VotingRecordsFallbackOptions
): Promise<VotingRecordsFallbackResult> {
  const { dateFrom, dateTo } = options;

  // Fail fast on missing/blank dates so we don't emit misleading freshness
  // labels like "🟢 MCP ( → )" or empty-window 🔴 markers downstream.
  if (typeof dateFrom !== 'string' || dateFrom.trim() === '') {
    throw new Error('getVotingRecordsWithFallback: dateFrom is required (non-empty YYYY-MM-DD)');
  }
  if (typeof dateTo !== 'string' || dateTo.trim() === '') {
    throw new Error('getVotingRecordsWithFallback: dateTo is required (non-empty YYYY-MM-DD)');
  }

  // (a) MCP returned real data — use it.
  if (!EPOpenDataClient.isVotingDataEmpty(mcpResult)) {
    return {
      result: mcpResult,
      source: 'mcp',
      freshnessLabel: `🟢 MCP (${dateFrom} → ${dateTo})`,
    };
  }

  // (b) MCP was empty — try the EP Open Data Portal fallback.
  const portalClient = new EPOpenDataClient(options);

  // Validate base URL up front so misconfiguration surfaces as a hard error
  // rather than being swallowed into the 🔴 "unavailable" path (which is
  // reserved for genuine "both sources empty" outcomes).
  try {
    await portalClient.connect();
  } catch (error) {
    throw new Error(
      'Invalid EP Open Data Portal configuration: unable to validate EP_OPEN_DATA_BASE_URL',
      { cause: error }
    );
  }

  try {
    const portalResult = await portalClient.getVotingRecords({
      dateFrom,
      dateTo,
      ...(options.limit !== undefined ? { limit: options.limit } : {}),
      ...(options.offset !== undefined ? { offset: options.offset } : {}),
    });

    if (!EPOpenDataClient.isVotingDataEmpty(portalResult)) {
      return {
        result: portalResult,
        source: 'ep-open-data-portal',
        freshnessLabel: `🟡 EP Open Data Portal fallback (${dateFrom} → ${dateTo}) — attribution: ${EP_OPEN_DATA_ATTRIBUTION}`,
      };
    }

    // (c) Both empty — emit the 🔴 unavailability marker.
    return {
      result: EPOpenDataClient.buildVotingUnavailableMarker(dateFrom, dateTo),
      source: 'unavailable',
      freshnessLabel: `🔴 voting data unavailable for window ${dateFrom} → ${dateTo}`,
    };
  } finally {
    portalClient.disconnect();
  }
}

// ─── Singleton lifecycle ──────────────────────────────────────────────────────

/** Singleton instance, created lazily by {@link getEPOpenDataClient}. */
let epOpenDataClientInstance: EPOpenDataClient | null = null;

/**
 * Get or create the singleton EP Open Data client, validating the base URL
 * on first use. Subsequent calls return the cached instance.
 *
 * @param options - Client options (override env vars and defaults).
 * @returns Connected singleton client.
 * @throws When the base URL is malformed.
 */
export async function getEPOpenDataClient(
  options: VotingRecordsFallbackOptions = { dateFrom: '', dateTo: '' }
): Promise<EPOpenDataClient> {
  if (!epOpenDataClientInstance) {
    const client = new EPOpenDataClient(options);
    try {
      await client.connect();
      epOpenDataClientInstance = client;
    } catch (error) {
      epOpenDataClientInstance = null;
      throw error;
    }
  }
  return epOpenDataClientInstance;
}

/** Close and clear the singleton instance (idempotent). */
export async function closeEPOpenDataClient(): Promise<void> {
  if (epOpenDataClientInstance) {
    epOpenDataClientInstance.disconnect();
    epOpenDataClientInstance = null;
  }
}
