// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// ─── Defaults ────────────────────────────────────────────────────────────────
/** Default base URL for the EP Open Data Portal API v2. */
const DEFAULT_EP_OPEN_DATA_BASE_URL = 'https://data.europarl.europa.eu/api/v2';
/** Default per-request timeout (milliseconds). */
const DEFAULT_EP_OPEN_DATA_TIMEOUT_MS = 30_000;
/**
 * Attribution string required by the EP Open Data Portal licence (CC BY 4.0).
 * Appended to every fallback response.
 */
const EP_OPEN_DATA_ATTRIBUTION = 'European Parliament Open Data Portal — https://data.europarl.europa.eu — CC BY 4.0';
/** Fallback empty-votes payload returned when both MCP and the portal are empty. */
const EMPTY_VOTES_FALLBACK = {
    content: [{ type: 'text', text: '{"votes":[]}' }],
};
// ─── Virtual tool list ────────────────────────────────────────────────────────
/**
 * Virtual tool names exposed by this client. The list is used as a drift
 * guard in `test/unit/ep-open-data-client.test.js` and in the Stage-C
 * editorial fingerprint for `voting-patterns.md` (the article must cite
 * at least one of these when the fallback is active).
 */
export const EP_OPEN_DATA_TOOLS = ['ep-get-voting-records'];
// ─── Utilities ────────────────────────────────────────────────────────────────
/**
 * Unwrap a multilingual JSON-LD label to a plain string.
 * Prefers the English value; falls back to the first available string value.
 *
 * @param raw - Raw label (string, locale object, or undefined).
 * @returns Plain string (empty when no label is available).
 * @internal
 */
function unwrapLabel(raw) {
    if (!raw)
        return '';
    if (typeof raw === 'string')
        return raw;
    if (typeof raw['en'] === 'string')
        return raw['en'];
    for (const v of Object.values(raw)) {
        if (typeof v === 'string')
            return v;
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
function wrapAsMCPResult(payload) {
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
function extractIdentifier(record) {
    if (record.identifier)
        return record.identifier;
    const rawId = record['@id'] ?? '';
    if (!rawId)
        return '';
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
    _apiBaseUrl;
    _timeoutMs;
    _fetchImpl;
    _connected = false;
    constructor(options = { dateFrom: '', dateTo: '' }) {
        const envBase = process.env['EP_OPEN_DATA_BASE_URL'];
        const envTimeout = process.env['EP_OPEN_DATA_TIMEOUT_MS'];
        const parsedEnvTimeout = envTimeout !== undefined && envTimeout !== '' ? Number.parseInt(envTimeout, 10) : Number.NaN;
        const base = options.apiBaseUrl ?? (envBase && envBase !== '' ? envBase : DEFAULT_EP_OPEN_DATA_BASE_URL);
        // Strip trailing slashes without a regex (avoids polynomial-ReDoS flags).
        let end = base.length;
        while (end > 0 && base.charCodeAt(end - 1) === 47 /* '/' */) {
            end -= 1;
        }
        this._apiBaseUrl = end === base.length ? base : base.slice(0, end);
        this._timeoutMs =
            options.timeoutMs !== undefined &&
                Number.isFinite(options.timeoutMs) &&
                options.timeoutMs > 0
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
    getApiBaseUrl() {
        return this._apiBaseUrl;
    }
    /**
     * Per-request timeout in milliseconds.
     *
     * @returns The timeout applied to every `fetch()` call.
     */
    getTimeoutMs() {
        return this._timeoutMs;
    }
    /**
     * Mark the client as ready (HTTP is stateless; validates URL shape only).
     *
     * @returns A resolved promise; never throws for valid URLs.
     * @throws When the base URL is malformed (e.g. missing protocol).
     */
    async connect() {
        try {
            new URL(this._apiBaseUrl);
            this._connected = true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid EP_OPEN_DATA_BASE_URL "${this._apiBaseUrl}": ${message}`, { cause: error });
        }
    }
    /**
     * Whether {@link connect} has been called successfully.
     *
     * @returns `true` after a successful {@link connect}.
     */
    isConnected() {
        return this._connected;
    }
    /** Reset the connected flag. No real socket to close. */
    disconnect() {
        this._connected = false;
    }
    /**
     * Fetch roll-call voting records from the EP Open Data Portal.
     *
     * Virtual tool: `ep-get-voting-records`.
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
    async getVotingRecords(options) {
        const { dateFrom, dateTo } = options;
        if (!dateFrom || !dateTo) {
            console.warn('ep-get-voting-records: dateFrom and dateTo are required');
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
            const json = await this._getJSON(`/decision?${qs.toString()}`);
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('ep-get-voting-records not available:', message);
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
    static isVotingDataEmpty(result) {
        try {
            const text = result.content?.[0]?.text ?? '';
            if (!text)
                return true;
            const parsed = JSON.parse(text);
            return !Array.isArray(parsed.votes) || parsed.votes.length === 0;
        }
        catch {
            return true;
        }
    }
    /**
     * Build the canonical `🔴 voting data unavailable` marker emitted when
     * both MCP and the EP Open Data Portal fallback return empty.
     *
     * The marker text is intentionally not a JSON votes array so consumers
     * that read raw text for display purposes see the human-readable alert.
     * {@link isVotingDataEmpty} treats this as "empty" so it can be passed
     * safely through the existing pipeline.
     *
     * @param dateFrom - Analysis period start (YYYY-MM-DD).
     * @param dateTo   - Analysis period end (YYYY-MM-DD).
     * @returns MCP-shaped result containing the 🔴 unavailability marker.
     */
    static buildVotingUnavailableMarker(dateFrom, dateTo) {
        return wrapAsMCPResult({
            votes: [],
            _unavailable: true,
            _marker: `🔴 voting data unavailable for window ${dateFrom} → ${dateTo}`,
            _reason: 'EP MCP server returned no roll-call votes and EP Open Data Portal returned no decisions ' +
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
    async _getText(path) {
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
        }
        finally {
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
    async _getJSON(path) {
        const raw = await this._getText(path);
        try {
            return JSON.parse(raw);
        }
        catch (error) {
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
 * @param options   - Fallback options; `dateFrom` and `dateTo` are required.
 * @returns Fallback result with source tag and human-readable freshness label.
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
export async function getVotingRecordsWithFallback(mcpResult, options) {
    const { dateFrom, dateTo } = options;
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
    const portalCallOptions = { dateFrom, dateTo };
    if (options.limit !== undefined)
        portalCallOptions.limit = options.limit;
    if (options.offset !== undefined)
        portalCallOptions.offset = options.offset;
    const portalResult = await portalClient.getVotingRecords(portalCallOptions);
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
}
// ─── Singleton lifecycle ──────────────────────────────────────────────────────
/** Singleton instance, created lazily by {@link getEPOpenDataClient}. */
let epOpenDataClientInstance = null;
/**
 * Get or create the singleton EP Open Data client, validating the base URL
 * on first use. Subsequent calls return the cached instance.
 *
 * @param options - Client options (override env vars and defaults).
 * @returns Connected singleton client.
 * @throws When the base URL is malformed.
 */
export async function getEPOpenDataClient(options = { dateFrom: '', dateTo: '' }) {
    if (!epOpenDataClientInstance) {
        const client = new EPOpenDataClient(options);
        try {
            await client.connect();
            epOpenDataClientInstance = client;
        }
        catch (error) {
            epOpenDataClientInstance = null;
            throw error;
        }
    }
    return epOpenDataClientInstance;
}
/** Close and clear the singleton instance (idempotent). */
export async function closeEPOpenDataClient() {
    if (epOpenDataClientInstance) {
        epOpenDataClientInstance.disconnect();
        epOpenDataClientInstance = null;
    }
}
//# sourceMappingURL=ep-open-data-client.js.map