// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// ─── Defaults ────────────────────────────────────────────────────────────────
/** Default base URL for the IMF SDMX 3.0 REST API. */
const DEFAULT_IMF_API_BASE_URL = 'https://dataservices.imf.org/REST/SDMX_3.0';
/** Default per-request timeout (milliseconds). */
const DEFAULT_IMF_API_TIMEOUT_MS = 90_000;
/** Product identifier sent to IMF SDMX endpoints. */
const IMF_USER_AGENT = 'euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)';
/** IMF SDMX accepts JSON data; keep a fallback for proxy/content negotiation. */
const IMF_ACCEPT_HEADER = 'application/json, application/vnd.sdmx.data+json, */*;q=0.8';
/** Common unauthenticated headers for direct IMF SDMX REST requests. */
const IMF_REQUEST_HEADERS = Object.freeze({
    Accept: IMF_ACCEPT_HEADER,
    'User-Agent': IMF_USER_AGENT,
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
});
/** Fallback payload shape when an IMF call fails or the server is offline. */
const IMF_FALLBACK = {
    content: [{ type: 'text', text: '' }],
};
/**
 * Canonical list of "virtual tools" exposed by this client. The client no
 * longer talks to an MCP server, but the tool-name list is preserved so
 * it continues to serve as:
 *
 * 1. The Stage-C editorial fingerprint source for "IMF is cited" (see
 *    `analysis/imf/indicator-catalog.md §6` — the earlier runtime
 *    fingerprint table `IMF_STRONG_FINGERPRINTS` in
 *    `src/utils/content-validator.ts` was purged in the April-2026
 *    aggregator-pipeline migration).
 * 2. The workflow probe's heartbeat identifiers.
 * 3. A drift guard against method additions: if a new helper method lands
 *    here, `test/integration/mcp/imf-mcp.test.js` fails unless the list
 *    and the test are updated in lock-step.
 *
 * Kept in sync with `analysis/methodologies/imf-indicator-mapping.md`.
 */
export const IMF_MCP_TOOLS = [
    'imf-list-databases',
    'imf-search-databases',
    'imf-get-parameter-defs',
    'imf-get-parameter-codes',
    'imf-fetch-data',
];
// ─── Utilities ───────────────────────────────────────────────────────────────
/**
 * Unwrap SDMX localised labels to a plain string.
 *
 * SDMX 3.0 sometimes returns `name`/`description` as a language-keyed
 * object (`{ en: "World Economic Outlook" }`); older payloads return a
 * raw string. Prefer English, fall back to the first available value.
 *
 * @param raw - Raw label (string, locale object, or undefined).
 * @returns Plain string (empty when no label is available).
 * @internal
 */
function unwrapLocalisedLabel(raw) {
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
 * Wrap a JSON-serialisable value in the canonical MCP tool-result shape
 * so consumers that already expect `response.content[0]?.text` to hold a
 * JSON blob keep working without change.
 *
 * @param payload - Serialisable payload (object, array, or already-stringified JSON).
 * @returns MCP tool-result envelope with a single text content item.
 * @internal
 */
function wrapAsMCPResult(payload) {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload ?? null);
    return { content: [{ type: 'text', text }] };
}
/**
 * Count observations in an IMF SDMX-JSON data payload.
 *
 * The IMF API can return observations either directly on a dataset or nested
 * under `data.dataSets[].series[*].observations`. The Stage-A probe uses this
 * parser to distinguish a reachable endpoint from an empty WEO slice without
 * interpreting the economic values themselves.
 *
 * @param payload - Raw JSON string or already-parsed SDMX-JSON payload.
 * @returns Number of observation cells found; `0` for invalid or empty input.
 */
export function countIMFSDMXObservations(payload) {
    let parsed = payload;
    if (typeof payload === 'string') {
        if (!payload.trim())
            return 0;
        try {
            parsed = JSON.parse(payload);
        }
        catch {
            return 0;
        }
    }
    const dataSets = parsed?.data?.dataSets;
    if (!Array.isArray(dataSets))
        return 0;
    return dataSets.reduce((total, dataSet) => {
        let count = 0;
        if (dataSet.observations && typeof dataSet.observations === 'object') {
            count += Object.keys(dataSet.observations).length;
        }
        if (dataSet.series && typeof dataSet.series === 'object') {
            for (const row of Object.values(dataSet.series)) {
                if (row?.observations && typeof row.observations === 'object') {
                    count += Object.keys(row.observations).length;
                }
            }
        }
        return total + count;
    }, 0);
}
/**
 * Simple value-encoder for SDMX URL dimension components. SDMX uses `+`
 * to join alternative codes inside a single dimension slot and `.` as
 * the dimension separator, so the value must be URI-encoded first to
 * avoid collisions with user-supplied codes that happen to contain
 * those characters.
 *
 * @param codes - Ordered code values for a single dimension (may be empty = wildcard).
 * @returns URL-safe dimension component (`""` for wildcard, `"A+B"` for union).
 * @internal
 */
function encodeSDMXDimension(codes) {
    return codes.map((c) => encodeURIComponent(c)).join('+');
}
/**
 * Build an SDMX key from a filters map + declared dimension order.
 *
 * If a declared dimension is absent from `filters`, the slot is left as
 * the wildcard (empty string). Extra filter keys not present in the
 * declared order are ignored — the caller is expected to have discovered
 * the correct dimension names via {@link IMFMCPClient.getParameterDefs}.
 *
 * @param dimensions - Declared dimension order (e.g. `["frequency","country","indicator"]`).
 * @param filters - Map of dimension → selected codes.
 * @returns SDMX key (e.g. `"A.DEU.NGDP_RPCH"`).
 * @internal
 */
function buildSDMXKey(dimensions, filters) {
    return dimensions
        .map((dim) => {
        // Avoid direct dynamic object indexing here so the security lint rule
        // does not flag caller-supplied SDMX dimension names as an injection sink.
        const codes = Object.entries(filters).find(([key]) => key === dim)?.[1];
        return Array.isArray(codes) ? encodeSDMXDimension(codes) : '';
    })
        .join('.');
}
/**
 * Infer the dimension order for a given dataflow when
 * {@link IMFMCPClient.getParameterDefs} has not been called yet. Used as a
 * fallback because the WEO datastructure in particular is so widely used
 * that encoding a well-known default eliminates one round-trip per fetch.
 *
 * Order mirrors the IMF SDMX 3.0 DSDs catalogued in
 * `analysis/imf/sdmx-dimensions-reference.md`.
 *
 * @param databaseId - Dataflow identifier (case-insensitive).
 * @returns Default dimension order used when the caller omits it.
 * @internal
 */
function defaultDimensionOrder(databaseId) {
    switch (databaseId.toUpperCase()) {
        case 'WEO':
        case 'FM':
        case 'IFS':
        case 'CPI':
        case 'BOP_AGG':
        case 'ER':
        case 'FSI':
            return ['frequency', 'country', 'indicator'];
        case 'DOT':
            return ['frequency', 'country', 'counterpartArea', 'indicator'];
        case 'CDIS':
            return ['frequency', 'country', 'counterpartArea', 'sector', 'indicator'];
        case 'CPIS':
            return ['frequency', 'country', 'counterpartArea', 'instrument', 'indicator'];
        case 'PCPS':
            return ['frequency', 'indicator'];
        case 'GFSR':
            return ['frequency', 'country', 'indicator', 'sector'];
        case 'GFS':
            return ['frequency', 'country', 'sector', 'unit', 'indicator'];
        default:
            return ['frequency', 'country', 'indicator'];
    }
}
/**
 * Infer the natural frequency for IMF dataflows whose editorial use is stable.
 *
 * Callers can still override this by passing `filters.frequency`; the default
 * only prevents malformed WEO/FM URLs when agents omit frequency in Stage A.
 *
 * @param databaseId - Dataflow identifier (case-insensitive).
 * @returns A frequency code, or `undefined` when the dataflow has no safe default.
 * @internal
 */
function defaultFrequency(databaseId) {
    switch (databaseId.toUpperCase()) {
        case 'WEO':
        case 'FM':
        case 'DOT':
        case 'CDIS':
        case 'CPIS':
        case 'GFSR':
            return 'A';
        case 'BOP_AGG':
        case 'FSI':
        case 'GFS':
            return 'Q';
        case 'IFS':
        case 'CPI':
        case 'ER':
        case 'PCPS':
            return 'M';
        default:
            return undefined;
    }
}
/**
 * Add a dataflow-specific default frequency when the caller omitted one.
 *
 * @param databaseId - Dataflow identifier.
 * @param filters - Caller-supplied SDMX dimension filters.
 * @returns The original filters or a shallow copy with `frequency` populated.
 * @internal
 */
function withDefaultFrequency(databaseId, filters) {
    const hasFrequency = Object.entries(filters).some(([key]) => key === 'frequency');
    const frequency = defaultFrequency(databaseId);
    return !hasFrequency && frequency ? { ...filters, frequency: [frequency] } : filters;
}
// ─── Client ──────────────────────────────────────────────────────────────────
/**
 * Native TypeScript client for the IMF SDMX 3.0 REST API.
 *
 * Despite the historical class name, no MCP server process is involved —
 * the class keeps the name `IMFMCPClient` purely to avoid breaking the
 * existing import surface (`src/index.ts`, test suites, documentation).
 * New code is welcome to import it as `IMFClient` (alias below).
 */
export class IMFMCPClient {
    _apiBaseUrl;
    _timeoutMs;
    _fetchImpl;
    _fetchProxyGatewayUrl;
    _fetchProxyApiKey;
    _connected = false;
    constructor(options = {}) {
        const envBase = process.env['IMF_API_BASE_URL'];
        const envTimeout = process.env['IMF_API_TIMEOUT_MS'];
        const parsedEnvTimeout = envTimeout !== undefined && envTimeout !== '' ? Number.parseInt(envTimeout, 10) : Number.NaN;
        const base = options.apiBaseUrl ?? (envBase && envBase !== '' ? envBase : DEFAULT_IMF_API_BASE_URL);
        // Strip trailing slashes without a regex so the CodeQL polynomial-ReDoS
        // detector has nothing to flag. Single linear pass from the right.
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
                    : DEFAULT_IMF_API_TIMEOUT_MS;
        this._fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
        // MCP fetch-proxy gateway for AWF sandbox (bypasses Squid proxy)
        this._fetchProxyGatewayUrl =
            options.fetchProxyGatewayUrl ?? process.env['FETCH_MCP_GATEWAY_URL'] ?? undefined;
        this._fetchProxyApiKey =
            options.fetchProxyApiKey ?? process.env['EP_MCP_GATEWAY_API_KEY'] ?? undefined;
    }
    /**
     * Base URL currently in use (read-only — set at construction time).
     *
     * @returns The fully-qualified IMF SDMX base URL (no trailing slash).
     */
    getApiBaseUrl() {
        return this._apiBaseUrl;
    }
    /**
     * Per-request timeout in milliseconds.
     *
     * @returns The timeout currently applied to every `fetch()` call.
     */
    getTimeoutMs() {
        return this._timeoutMs;
    }
    /**
     * Mark the client as ready. HTTP is stateless so there is no real
     * connection, but callers historically invoke `connect()` before use —
     * this is preserved for API compatibility and also exercises the
     * base URL to catch misconfiguration early.
     *
     * @returns A resolved promise; never throws for valid URLs.
     */
    async connect() {
        try {
            // Validate the base URL shape without making a network request so
            // construction-time errors surface immediately.
            new URL(this._apiBaseUrl);
            this._connected = true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid IMF_API_BASE_URL "${this._apiBaseUrl}": ${message}`, {
                cause: error,
            });
        }
    }
    /**
     * Whether {@link connect} has been called successfully.
     *
     * @returns `true` after a successful {@link connect}; reset by {@link disconnect}.
     */
    isConnected() {
        return this._connected;
    }
    /** Reset the connected flag. No real socket to close. */
    disconnect() {
        this._connected = false;
    }
    /**
     * List every IMF database (dataflow) exposed by the SDMX 3.0 API.
     *
     * Virtual tool: `imf-list-databases`.
     *
     * @returns MCP-shaped result whose `content[0].text` carries a JSON
     *   array of `{ id, name, description }` entries. Empty on error.
     */
    async listDatabases() {
        try {
            const json = await this._getJSON('/dataflow/IMF');
            const flows = json?.data?.dataflows ?? [];
            const rows = flows.map((f) => ({
                id: f.id ?? '',
                name: unwrapLocalisedLabel(f.name),
                description: unwrapLocalisedLabel(f.description),
            }));
            return wrapAsMCPResult(rows);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-list-databases not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * Search IMF databases by free-text keyword (case-insensitive
     * substring match against id / name / description).
     *
     * Virtual tool: `imf-search-databases`. Runs client-side over the
     * full dataflow list so a single SDMX round-trip serves every
     * keyword query in a workflow run.
     *
     * @param keyword - Free-text keyword (e.g. `"inflation"`, `"trade"`).
     * @returns Filtered list in MCP-shaped result; empty on error or when keyword is blank.
     */
    async searchDatabases(keyword) {
        if (!keyword) {
            console.warn('imf-search-databases called without a keyword');
            return IMF_FALLBACK;
        }
        try {
            const json = await this._getJSON('/dataflow/IMF');
            const flows = json?.data?.dataflows ?? [];
            const needle = keyword.toLowerCase();
            const rows = flows
                .map((f) => ({
                id: f.id ?? '',
                name: unwrapLocalisedLabel(f.name),
                description: unwrapLocalisedLabel(f.description),
            }))
                .filter((r) => {
                const hay = `${r.id} ${r.name} ${r.description}`.toLowerCase();
                return hay.includes(needle);
            });
            return wrapAsMCPResult(rows);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-search-databases not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * Fetch the dimension (parameter) definitions for a specific IMF
     * dataflow. Essential before building an SDMX key for
     * {@link fetchData} because each database has its own dimension set.
     *
     * Virtual tool: `imf-get-parameter-defs`.
     *
     * @param databaseId - IMF dataflow identifier (e.g. `"WEO"`, `"IFS"`).
     * @returns MCP-shaped result whose `content[0].text` carries the
     *   ordered list of dimensions (`[{ id, name }]`). Empty on error.
     */
    async getParameterDefs(databaseId) {
        if (!databaseId) {
            console.warn('imf-get-parameter-defs called without databaseId');
            return IMF_FALLBACK;
        }
        try {
            const json = await this._getJSON(`/datastructure/${encodeURIComponent(databaseId)}`);
            const ds = json?.data?.dataStructures?.[0];
            const dims = ds?.dataStructureComponents?.dimensionList?.dimensions ?? [];
            const rows = dims.map((d) => ({ id: d.id, name: unwrapLocalisedLabel(d.name) }));
            return wrapAsMCPResult(rows);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-get-parameter-defs not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * List valid codes for a single dimension of an IMF dataflow, with
     * an optional free-text filter to narrow the result.
     *
     * Virtual tool: `imf-get-parameter-codes`. The underlying SDMX
     * `/codelist/` endpoint is used, looked up from the datastructure so
     * the caller does not need to know the codelist identifier ahead of
     * time.
     *
     * @param databaseId - IMF dataflow identifier.
     * @param parameter - Dimension name (e.g. `"country"`, `"indicator"`).
     * @param search - Optional free-text search (case-insensitive substring).
     * @returns MCP-shaped result with `[{ id, name }]` rows; empty on error.
     */
    async getParameterCodes(databaseId, parameter, search) {
        if (!databaseId || !parameter) {
            console.warn('imf-get-parameter-codes requires databaseId and parameter');
            return IMF_FALLBACK;
        }
        try {
            // 1. Discover the codelist id for the requested dimension.
            const structure = await this._getJSON(`/datastructure/${encodeURIComponent(databaseId)}?references=codelist`);
            const ds = structure?.data?.dataStructures?.[0];
            const dims = ds?.dataStructureComponents?.dimensionList?.dimensions ?? [];
            const dim = dims.find((d) => d.id.toLowerCase() === parameter.toLowerCase());
            if (!dim) {
                return wrapAsMCPResult([]);
            }
            // The SDMX codelist reference URN looks like
            //   "urn:sdmx:org.sdmx.infomodel.codelist.Codelist=IMF:CL_AREA(1.0)"
            // We only need the codelist id — use string-split parsing
            // (no regex) so the static-analysis "unsafe regex" detector has
            // nothing to object to and the extraction stays obviously linear.
            let codelistId = dim.localRepresentation?.enumeration;
            if (codelistId) {
                const afterEquals = codelistId.includes('=')
                    ? (codelistId.split('=')[1] ?? '')
                    : codelistId;
                const beforeParen = afterEquals.split('(')[0] ?? '';
                const parts = beforeParen.split(':');
                codelistId = (parts[parts.length - 1] ?? beforeParen).trim() || codelistId;
            }
            // Some payloads inline the values directly; prefer those when present.
            let codes = dim.values ?? [];
            if (codes.length === 0 && codelistId) {
                const cl = structure?.data?.codelists?.find((c) => c.id === codelistId);
                codes = cl?.codes ?? [];
            }
            const needle = (search ?? '').toLowerCase();
            const rows = codes
                .map((c) => ({ id: c.id, name: unwrapLocalisedLabel(c.name) }))
                .filter((r) => {
                if (!needle)
                    return true;
                return `${r.id} ${r.name}`.toLowerCase().includes(needle);
            });
            return wrapAsMCPResult(rows);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-get-parameter-codes not available:', message);
            return IMF_FALLBACK;
        }
    }
    /**
     * Fetch a time-series slice from an IMF dataflow as SDMX-JSON.
     *
     * Virtual tool: `imf-fetch-data`. The response is already in SDMX-JSON
     * format; callers read the series under `data.dataSets[0].series`
     * using any standard SDMX-JSON reader. (The earlier helper
     * `parseSDMXJSON` in `src/utils/imf-data.ts` was purged in the
     * April-2026 aggregator-pipeline migration.)
     *
     * @param options - Fetch parameters.
     * @param options.databaseId - IMF dataflow ID (`"WEO"`, `"IFS"`, ...).
     * @param options.startYear - Inclusive start year (e.g. `2015`).
     * @param options.endYear - Inclusive end year (e.g. `2030` for WEO forecasts).
     * @param options.filters - Map of dimension → selected codes.
     * @param options.dimensionOrder - Optional override of the dimension order
     *   used to build the SDMX key. Defaults to
     *   {@link defaultDimensionOrder} for the database.
     * @returns MCP-shaped result whose `content[0].text` carries the raw
     *   SDMX-JSON response. Empty on error or invalid inputs.
     */
    async fetchData(options) {
        const { databaseId, startYear, endYear, filters, dimensionOrder } = options;
        if (!databaseId || !filters || Object.keys(filters).length === 0) {
            console.warn('imf-fetch-data requires databaseId and a non-empty filters map');
            return IMF_FALLBACK;
        }
        if (!Number.isFinite(startYear) || !Number.isFinite(endYear) || endYear < startYear) {
            console.warn(`imf-fetch-data invalid year range: ${startYear}-${endYear}`);
            return IMF_FALLBACK;
        }
        try {
            const dims = dimensionOrder ?? defaultDimensionOrder(databaseId);
            const key = buildSDMXKey(dims, withDefaultFrequency(databaseId, filters));
            const qs = new URLSearchParams({
                startPeriod: String(startYear),
                endPeriod: String(endYear),
                format: 'jsondata',
            });
            const url = `/data/${encodeURIComponent(databaseId)}/${key}?${qs.toString()}`;
            const text = await this._getText(url);
            return wrapAsMCPResult(text);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn('imf-fetch-data not available:', message);
            return IMF_FALLBACK;
        }
    }
    // ─── private transport helpers ─────────────────────────────────────────────
    /**
     * Build a full URL and GET it as text, enforcing the client-wide timeout.
     * Tries the IMF-only MCP fetch-proxy gateway first (bypasses AWF Squid
     * proxy in agentic workflow sandbox), then falls back to direct fetch.
     *
     * @param path - Path (already URL-encoded) to append to the base URL.
     * @returns Response body (`text/*` or `application/*`) as a string.
     * @throws When the HTTP status is not 2xx, the request times out, or
     *   the network layer raises.
     * @internal
     */
    async _getText(path) {
        const url = `${this._apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
        // Strategy 1: MCP fetch-proxy gateway (bypasses AWF Squid proxy).
        // The API key is optional — the gateway adds the Authorization header only
        // when the key is present. Without a key the request is sent unauthenticated,
        // which is sufficient for local AWF container-to-container traffic (same
        // Docker network). Requiring the key here caused IMF degraded mode whenever
        // EP_MCP_GATEWAY_API_KEY extraction from mcp-config.json failed silently.
        if (this._fetchProxyGatewayUrl) {
            try {
                const result = await this._fetchViaGateway(url);
                if (result !== null)
                    return result;
            }
            catch {
                // Gateway unavailable — fall through to direct fetch
            }
        }
        // Strategy 2: Direct fetch (works outside AWF sandbox)
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this._timeoutMs);
        try {
            const response = await this._fetchImpl(url, {
                method: 'GET',
                headers: IMF_REQUEST_HEADERS,
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
     * Fetch a URL via the MCP fetch-proxy gateway (JSON-RPC 2.0 over HTTP).
     * The fetch-proxy server runs in a container that bypasses the AWF Squid proxy.
     *
     * @param url - Fully-qualified URL to fetch.
     * @returns Response text, or null if the gateway call fails.
     * @internal
     */
    async _fetchViaGateway(url) {
        const gatewayUrl = this._fetchProxyGatewayUrl;
        if (!gatewayUrl)
            return null;
        const rpcRequest = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
                name: 'fetch_url',
                arguments: { url },
            },
        };
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
        };
        if (this._fetchProxyApiKey) {
            headers['Authorization'] = `Bearer ${this._fetchProxyApiKey}`;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this._timeoutMs);
        try {
            const response = await this._fetchImpl(gatewayUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(rpcRequest),
                signal: controller.signal,
            });
            if (!response.ok)
                return null;
            let body = await response.text();
            // Handle SSE format (data: lines)
            if (body.trimStart().startsWith('data:')) {
                const lines = body.split('\n').filter((l) => l.startsWith('data:'));
                body = lines.map((l) => l.slice(5).trim()).join('');
            }
            const parsed = JSON.parse(body);
            if (parsed.error)
                return null;
            const text = parsed.result?.content?.[0]?.text;
            return text && text.length > 0 ? text : null;
        }
        catch {
            return null;
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
            throw new Error(`Failed to parse IMF response as JSON: ${message}`, { cause: error });
        }
    }
}
/**
 * Forward-looking alias for {@link IMFMCPClient}. New code should prefer
 * `IMFClient`; the `IMFMCPClient` name is retained for backward
 * compatibility with the MCP-backed iteration shipped in Wave 1.
 */
export const IMFClient = IMFMCPClient;
// ─── Singleton lifecycle ─────────────────────────────────────────────────────
/** Singleton instance, created lazily by {@link getIMFMCPClient}. */
let imfClientInstance = null;
/**
 * Get or create the singleton IMF client, validating the base URL on
 * first use. Subsequent calls return the cached instance.
 *
 * @param options - Client options (override env vars and defaults).
 * @returns Connected singleton client.
 * @throws When the base URL is malformed (e.g. missing protocol).
 */
export async function getIMFMCPClient(options = {}) {
    if (!imfClientInstance) {
        const client = new IMFMCPClient(options);
        try {
            await client.connect();
            imfClientInstance = client;
        }
        catch (error) {
            imfClientInstance = null;
            throw error;
        }
    }
    return imfClientInstance;
}
/** Close and clear the singleton instance (idempotent). */
export async function closeIMFMCPClient() {
    if (imfClientInstance) {
        imfClientInstance.disconnect();
        imfClientInstance = null;
    }
}
//# sourceMappingURL=imf-mcp-client.js.map