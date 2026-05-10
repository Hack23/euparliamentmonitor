// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// ─── Defaults ────────────────────────────────────────────────────────────────
/** Default base URL for the IMF Data Portal SDMX 3.0 REST API. */
const DEFAULT_IMF_API_BASE_URL = 'https://api.imf.org/external/sdmx/3.0';
/** Default per-request timeout (milliseconds). */
const DEFAULT_IMF_API_TIMEOUT_MS = 90_000;
/** Product identifier sent to IMF SDMX endpoints. */
const IMF_USER_AGENT = 'euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)';
/** IMF SDMX accepts JSON data; keep a fallback for proxy/content negotiation. */
const IMF_ACCEPT_HEADER = 'application/json, application/vnd.sdmx.data+json, */*;q=0.8';
/** Common headers for direct IMF SDMX REST requests (auth header added per-request). */
const IMF_REQUEST_HEADERS = Object.freeze({
    Accept: IMF_ACCEPT_HEADER,
    'User-Agent': IMF_USER_AGENT,
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
});
/** Azure APIM subscription-key header expected by `api.imf.org`. */
const IMF_SUBSCRIPTION_KEY_HEADER = 'Ocp-Apim-Subscription-Key';
/**
 * Per-dataflow → maintainer agency map for the post-September-2025 IMF
 * Data Portal, where the umbrella `IMF` agency was retired in favour of
 * sub-departmental agency IDs (`IMF.RES`, `IMF.STA`, `IMF.FAD`, `IMF.WHD`,
 * `IMF.MCM`, …). Discovered live against
 * `GET /structure/dataflow` on `api.imf.org/external/sdmx/3.0`.
 *
 * Keys are uppercased dataflow IDs; values are the canonical agency that
 * publishes them. Unknown / vintage-suffixed IDs (e.g. `WEO_2025_OCT_VINTAGE`)
 * fall through to {@link DEFAULT_IMF_AGENCY}.
 */
const IMF_DATAFLOW_AGENCY = Object.freeze({
    // IMF.RES — Research Department (forecasts + commodity prices)
    WEO: 'IMF.RES',
    PCPS: 'IMF.RES',
    ITS: 'IMF.RES',
    // IMF.FAD — Fiscal Affairs Department
    FM: 'IMF.FAD',
    // IMF.STA — Statistics Department (everything else editorial)
    CPI: 'IMF.STA',
    CPI_WCA: 'IMF.STA',
    BOP: 'IMF.STA',
    BOP_AGG: 'IMF.STA',
    ER: 'IMF.STA',
    IFS: 'IMF.STA',
    DOT: 'IMF.STA',
    CDIS: 'IMF.STA',
    CPIS: 'IMF.STA',
    GFS: 'IMF.STA',
    GFS_SOO: 'IMF.STA',
    GFS_BS: 'IMF.STA',
    GFS_COFOG: 'IMF.STA',
    GFS_SSUC: 'IMF.STA',
    GFS_SOEF: 'IMF.STA',
    GFS_SFCP: 'IMF.STA',
    FSI: 'IMF.STA',
    MFS: 'IMF.STA',
    MFS_FC: 'IMF.STA',
    FA: 'IMF.STA',
    GFSR: 'IMF.STA',
});
/** Fallback agency when {@link IMF_DATAFLOW_AGENCY} has no entry — most editorial dataflows are STA-published. */
const DEFAULT_IMF_AGENCY = 'IMF.STA';
/**
 * Parse an SDMX URN into its three salient parts:
 * agency (optional), id, and concept-id (only present for Concept URNs).
 *
 * Examples handled:
 *   - `urn:sdmx:org.sdmx.infomodel.codelist.Codelist=IMF.RES:CL_WEO_INDICATOR(2.0+.0)`
 *     → `{ agency: 'IMF.RES', id: 'CL_WEO_INDICATOR', conceptId: undefined }`
 *   - `urn:sdmx:org.sdmx.infomodel.conceptscheme.Concept=IMF.RES:CS_WEO(4.0+.0).INDICATOR`
 *     → `{ agency: 'IMF.RES', id: 'CS_WEO', conceptId: 'INDICATOR' }`
 *
 * Pure string-split parsing (no regex) so the static-analysis "unsafe regex"
 * detector has nothing to object to and the extraction stays linear.
 *
 * @param urn - SDMX URN to parse.
 * @returns Parsed parts (any field may be empty if absent in the URN).
 * @internal
 */
function parseSDMXUrn(urn) {
    const eqIdx = urn.indexOf('=');
    const body = eqIdx >= 0 ? urn.slice(eqIdx + 1) : urn;
    const parenIdx = body.indexOf('(');
    const head = parenIdx >= 0 ? body.slice(0, parenIdx) : body;
    // Concept URNs have a trailing `.CONCEPT_ID` after the closing paren or
    // — when the version block is absent — after the codelist id itself.
    // We extract it from the part *after* the version block to avoid
    // mistaking the dots inside the version string for a concept separator.
    const tail = parenIdx >= 0 ? body.slice(body.indexOf(')', parenIdx) + 1) : '';
    const conceptId = tail.startsWith('.') ? tail.slice(1) : '';
    const colonIdx = head.indexOf(':');
    const agency = colonIdx >= 0 ? head.slice(0, colonIdx) : '';
    const id = colonIdx >= 0 ? head.slice(colonIdx + 1) : head;
    return { agency, id, conceptId };
}
/**
 * Resolve the codelist URN for a single dimension by walking the SDMX
 * 3.0 dimension → concept → codelist binding chain.
 *
 * Tries the legacy SDMX 2.1 shape first (`localRepresentation.enumeration`
 * directly on the dimension) before falling back to the SDMX 3.0 shape
 * where the binding lives on the concept (`coreRepresentation.enumeration`).
 *
 * @param dim - DSD dimension entry.
 * @param conceptSchemes - Inlined conceptSchemes from the same payload.
 * @returns Codelist URN, or `undefined` when no binding is declared.
 * @internal
 */
function resolveCodelistUrn(dim, conceptSchemes) {
    const direct = dim.localRepresentation?.enumeration;
    if (direct)
        return direct;
    if (!dim.conceptIdentity)
        return undefined;
    const { agency, id, conceptId } = parseSDMXUrn(dim.conceptIdentity);
    if (!conceptId)
        return undefined;
    const cs = conceptSchemes.find((s) => s.id === id && (agency === '' || s.agencyID === agency));
    const concept = cs?.concepts?.find((c) => c.id === conceptId);
    return concept?.coreRepresentation?.enumeration;
}
/**
 * Resolve the actual list of codes for a single dimension by looking up
 * the bound codelist in the inlined codelists payload. Falls back to
 * any inlined `dim.values` array when present.
 *
 * @param dim - DSD dimension entry.
 * @param payload - The `data` block of an SDMX `references=all` response
 *   (must contain `conceptSchemes` and `codelists`).
 * @returns Ordered list of `{ id, name }` codes; empty when the
 *   dimension has neither inlined values nor a resolvable codelist.
 * @internal
 */
function resolveCodelistCodes(dim, payload) {
    if (dim.values && dim.values.length > 0)
        return dim.values;
    const urn = resolveCodelistUrn(dim, payload.conceptSchemes ?? []);
    if (!urn)
        return [];
    const { agency, id } = parseSDMXUrn(urn);
    if (!id)
        return [];
    const cls = payload.codelists ?? [];
    const exact = cls.find((c) => c.id === id && (!agency || c.agencyID === agency));
    const cl = exact ?? cls.find((c) => c.id === id);
    return cl?.codes ?? [];
}
/**
 * Resolve the SDMX agency for a dataflow.
 *
 * Strips any `_YYYY_MMM_VINTAGE` suffix before lookup so monthly vintage
 * IDs (`WEO_2025_OCT_VINTAGE`) inherit the same agency as their
 * canonical "latest" sibling (`WEO`).
 *
 * @param databaseId - IMF dataflow identifier.
 * @returns Agency code (e.g. `"IMF.RES"`).
 * @internal
 */
function resolveAgency(databaseId) {
    const upper = databaseId.toUpperCase();
    // Avoid dynamic object indexing so the security lint does not flag user input as a sink.
    const direct = Object.entries(IMF_DATAFLOW_AGENCY).find(([k]) => k === upper)?.[1];
    if (direct)
        return direct;
    // Vintage suffix: WEO_2025_OCT_VINTAGE → WEO
    const vintageIdx = upper.indexOf('_VINTAGE');
    if (vintageIdx > 0) {
        const trimmed = upper.slice(0, vintageIdx).split('_').slice(0, -2).join('_');
        if (trimmed) {
            const fromBase = Object.entries(IMF_DATAFLOW_AGENCY).find(([k]) => k === trimmed)?.[1];
            if (fromBase)
                return fromBase;
        }
    }
    return DEFAULT_IMF_AGENCY;
}
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
 * If a declared dimension is absent from `filters`, the slot is filled
 * with the SDMX 3.0 wildcard `*` (the post-Sept-2025 IMF Data Portal
 * rejects bare empty positions — `DEU..A` returns 0 series, `DEU.*.A`
 * returns the full set). Extra filter keys not present in the declared
 * order are ignored — the caller is expected to have discovered the
 * correct dimension names via {@link IMFMCPClient.getParameterDefs}.
 *
 * Filter keys are matched case-insensitively against declared dimension
 * names so callers can keep using the legacy lowercase aliases
 * (`country`, `indicator`, `frequency`) even though the IMF SDMX 3.0
 * DSDs use uppercase (`COUNTRY`, `INDICATOR`, `FREQUENCY`).
 *
 * @param dimensions - Declared dimension order (e.g. `["COUNTRY","INDICATOR","FREQUENCY"]`).
 * @param filters - Map of dimension → selected codes.
 * @returns SDMX key (e.g. `"DEU.NGDP_RPCH.A"` or `"DEU.*.A"` for wildcard indicator).
 * @internal
 */
function buildSDMXKey(dimensions, filters) {
    const lowercasedFilters = Object.entries(filters).map(([key, value]) => [key.toLowerCase(), value]);
    return dimensions
        .map((dim) => {
        const dimLc = dim.toLowerCase();
        const codes = lowercasedFilters.find(([key]) => key === dimLc)?.[1];
        // SDMX 3.0 wildcard for "match every code in this dimension" is `*`.
        // The legacy SDMX 2.1 convention of leaving the segment bare is
        // rejected by `api.imf.org` post-Sept-2025 (returns 0 series).
        return Array.isArray(codes) && codes.length > 0 ? encodeSDMXDimension(codes) : '*';
    })
        .join('.');
}
/**
 * Infer the dimension order for a given dataflow when
 * {@link IMFMCPClient.getParameterDefs} has not been called yet. Used as a
 * fallback because the WEO datastructure in particular is so widely used
 * that encoding a well-known default eliminates one round-trip per fetch.
 *
 * Order mirrors the IMF SDMX 3.0 DSDs catalogued live against
 * `api.imf.org/external/sdmx/3.0/structure/dataflow/{agency}/{id}/+?references=datastructure`
 * (post-Sept-2025 Data Portal migration). All dimension names are
 * UPPERCASE and `FREQUENCY` is the **last** series-level dimension —
 * the legacy SDMX 2.1 convention of leading with `FREQ` no longer
 * applies on `api.imf.org`.
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
        case 'BOP_AGG':
            return ['COUNTRY', 'INDICATOR', 'FREQUENCY'];
        case 'CPI':
        case 'CPI_WCA':
            return ['COUNTRY', 'INDEX_TYPE', 'COICOP_1999', 'TYPE_OF_TRANSFORMATION', 'FREQUENCY'];
        case 'BOP':
            return ['COUNTRY', 'BOP_ACCOUNTING_ENTRY', 'INDICATOR', 'UNIT', 'FREQUENCY'];
        case 'ER':
            return ['COUNTRY', 'INDICATOR', 'TYPE_OF_TRANSFORMATION', 'FREQUENCY'];
        case 'PCPS':
            return ['COUNTRY', 'INDICATOR', 'DATA_TRANSFORMATION', 'FREQUENCY'];
        case 'DOT':
            return ['COUNTRY', 'COUNTERPART_AREA', 'INDICATOR', 'FREQUENCY'];
        case 'CDIS':
            return ['COUNTRY', 'COUNTERPART_AREA', 'SECTOR', 'INDICATOR', 'FREQUENCY'];
        case 'CPIS':
            return ['COUNTRY', 'COUNTERPART_AREA', 'INSTRUMENT', 'INDICATOR', 'FREQUENCY'];
        case 'FSI':
            return ['COUNTRY', 'INDICATOR', 'SECTOR', 'FREQUENCY'];
        case 'GFSR':
            return ['COUNTRY', 'INDICATOR', 'SECTOR', 'FREQUENCY'];
        case 'GFS':
        case 'GFS_SOO':
        case 'GFS_BS':
        case 'GFS_COFOG':
        case 'GFS_SSUC':
        case 'GFS_SOEF':
        case 'GFS_SFCP':
            return ['COUNTRY', 'SECTOR', 'UNIT', 'INDICATOR', 'FREQUENCY'];
        default:
            return ['COUNTRY', 'INDICATOR', 'FREQUENCY'];
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
 * Filter-key matching is case-insensitive so callers using legacy
 * lowercase aliases (`frequency`) do not double-inject when the DSD
 * uses the SDMX 3.0 uppercase form (`FREQUENCY`).
 *
 * @param databaseId - Dataflow identifier.
 * @param filters - Caller-supplied SDMX dimension filters.
 * @returns The original filters or a shallow copy with `FREQUENCY` populated.
 * @internal
 */
function withDefaultFrequency(databaseId, filters) {
    const hasFrequency = Object.entries(filters).some(([key]) => {
        const k = key.toLowerCase();
        return k === 'frequency' || k === 'freq';
    });
    const frequency = defaultFrequency(databaseId);
    return !hasFrequency && frequency ? { ...filters, FREQUENCY: [frequency] } : filters;
}
/**
 * Resolve the IMF base URL and per-request timeout from constructor options
 * and environment variables. Extracted so the {@link IMFMCPClient}
 * constructor stays under SonarJS's cognitive-complexity threshold.
 *
 * @param options - Caller-supplied options (take precedence over env).
 * @returns Resolved `base` (raw, may have trailing slashes) and `timeout`.
 * @internal
 */
function readBaseAndTimeout(options) {
    const envBase = process.env['IMF_API_BASE_URL'];
    const envTimeout = process.env['IMF_API_TIMEOUT_MS'];
    const parsedEnvTimeout = envTimeout !== undefined && envTimeout !== '' ? Number.parseInt(envTimeout, 10) : Number.NaN;
    const base = options.apiBaseUrl ?? (envBase && envBase !== '' ? envBase : DEFAULT_IMF_API_BASE_URL);
    let timeout;
    if (options.timeoutMs !== undefined &&
        Number.isFinite(options.timeoutMs) &&
        options.timeoutMs > 0) {
        timeout = options.timeoutMs;
    }
    else if (Number.isFinite(parsedEnvTimeout) && parsedEnvTimeout > 0) {
        timeout = parsedEnvTimeout;
    }
    else {
        timeout = DEFAULT_IMF_API_TIMEOUT_MS;
    }
    return { base, timeout };
}
/**
 * Strip trailing slashes without using a regex, so the CodeQL polynomial-
 * ReDoS detector has nothing to flag. Single linear pass from the right.
 *
 * @param s - Input string.
 * @returns The input with all trailing `/` characters removed.
 * @internal
 */
function stripTrailingSlashes(s) {
    let end = s.length;
    while (end > 0 && s.charCodeAt(end - 1) === 47 /* '/' */) {
        end -= 1;
    }
    return end === s.length ? s : s.slice(0, end);
}
/**
 * Read IMF Azure-APIM subscription keys from the environment, in priority
 * order (primary, then secondary). Empty / unset / duplicate keys are
 * filtered out so the returned array is `[]` only when no key is set at all.
 *
 * @returns Ordered list of candidate API keys (length 0–2).
 * @internal
 */
function readImfSubscriptionKeysFromEnv() {
    const candidates = [process.env['IMF_API_PRIMARY_KEY'], process.env['IMF_API_SECONDARY_KEY']];
    const keys = [];
    for (const k of candidates) {
        if (typeof k === 'string' && k.length > 0 && !keys.includes(k))
            keys.push(k);
    }
    return keys;
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
    _imfSubscriptionKeys;
    _connected = false;
    constructor(options = {}) {
        const { base, timeout } = readBaseAndTimeout(options);
        this._apiBaseUrl = stripTrailingSlashes(base);
        this._timeoutMs = timeout;
        this._fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
        // MCP fetch-proxy gateway for AWF sandbox (bypasses Squid proxy)
        this._fetchProxyGatewayUrl =
            options.fetchProxyGatewayUrl ?? process.env['FETCH_MCP_GATEWAY_URL'] ?? undefined;
        this._fetchProxyApiKey =
            options.fetchProxyApiKey ?? process.env['EP_MCP_GATEWAY_API_KEY'] ?? undefined;
        // IMF Azure-APIM subscription keys (primary + secondary). The fetch-proxy
        // server already injects the same header when it is the transport, so this
        // is mainly for the direct-fetch fallback used outside the AWF sandbox.
        this._imfSubscriptionKeys = readImfSubscriptionKeysFromEnv();
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
     * Virtual tool: `imf-list-databases`. Hits the umbrella
     * `/structure/dataflow` endpoint which returns every published
     * dataflow across all IMF sub-agencies (`IMF.RES`, `IMF.STA`,
     * `IMF.FAD`, `IMF.WHD`, `IMF.MCM`, …) — typically ~190 entries.
     * Each row includes the publishing `agency` so callers know which
     * agency to use when calling {@link getParameterDefs} or {@link fetchData}.
     *
     * @returns MCP-shaped result whose `content[0].text` carries a JSON
     *   array of `{ id, name, description, agency, version }` entries.
     *   Empty on error.
     */
    async listDatabases() {
        try {
            const json = await this._getJSON('/structure/dataflow');
            const flows = json?.data?.dataflows ?? [];
            const rows = flows.map((f) => ({
                id: f.id ?? '',
                name: unwrapLocalisedLabel(f.name),
                description: unwrapLocalisedLabel(f.description),
                agency: f.agencyID ?? '',
                version: f.version ?? '',
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
            const json = await this._getJSON('/structure/dataflow');
            const flows = json?.data?.dataflows ?? [];
            const needle = keyword.toLowerCase();
            const rows = flows
                .map((f) => ({
                id: f.id ?? '',
                name: unwrapLocalisedLabel(f.name),
                description: unwrapLocalisedLabel(f.description),
                agency: f.agencyID ?? '',
                version: f.version ?? '',
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
     * Virtual tool: `imf-get-parameter-defs`. Uses the
     * `/structure/dataflow/{agency}/{id}/+?references=datastructure`
     * endpoint because the legacy `/structure/datastructure/IMF/{id}/+`
     * shape returns 204 on `api.imf.org` after the September-2025 IMF
     * Data Portal migration retired the umbrella `IMF` agency.
     *
     * @param databaseId - IMF dataflow identifier (e.g. `"WEO"`, `"FM"`).
     * @param agencyId - Optional override; defaults to {@link resolveAgency}.
     * @returns MCP-shaped result whose `content[0].text` carries the
     *   ordered list of dimensions (`[{ id, name }]`). Empty on error.
     */
    async getParameterDefs(databaseId, agencyId) {
        if (!databaseId) {
            console.warn('imf-get-parameter-defs called without databaseId');
            return IMF_FALLBACK;
        }
        try {
            const agency = agencyId ?? resolveAgency(databaseId);
            const json = await this._getJSON(`/structure/dataflow/${encodeURIComponent(agency)}/${encodeURIComponent(databaseId)}/+?references=datastructure`);
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
     * Virtual tool: `imf-get-parameter-codes`. Uses
     * `/structure/dataflow/{agency}/{id}/+?references=children` to fetch
     * the DSD plus its referenced codelists in one round-trip.
     *
     * @param databaseId - IMF dataflow identifier.
     * @param parameter - Dimension name (e.g. `"COUNTRY"`, `"INDICATOR"`;
     *   matched case-insensitively).
     * @param search - Optional free-text search (case-insensitive substring).
     * @param agencyId - Optional agency override; defaults to {@link resolveAgency}.
     * @returns MCP-shaped result with `[{ id, name }]` rows; empty on error.
     */
    async getParameterCodes(databaseId, parameter, search, agencyId) {
        if (!databaseId || !parameter) {
            console.warn('imf-get-parameter-codes requires databaseId and parameter');
            return IMF_FALLBACK;
        }
        try {
            const agency = agencyId ?? resolveAgency(databaseId);
            // `references=all` returns DSD + conceptSchemes + codelists in one
            // round-trip. The IMF SDMX 3.0 DSDs put the codelist binding on
            // the *concept* (`coreRepresentation.enumeration`), not on the
            // dimension itself, so we need both the DSD (for the dimension →
            // concept link) and the conceptScheme (for the concept → codelist
            // link). The payload is large (~2-3 MB for WEO) — it's fetched
            // once per workflow run by gh-aw and cached upstream.
            const structure = await this._getJSON(`/structure/dataflow/${encodeURIComponent(agency)}/${encodeURIComponent(databaseId)}/+?references=all`);
            const ds = structure?.data?.dataStructures?.[0];
            const dims = ds?.dataStructureComponents?.dimensionList?.dimensions ?? [];
            const dim = dims.find((d) => d.id.toLowerCase() === parameter.toLowerCase());
            if (!dim) {
                return wrapAsMCPResult([]);
            }
            const codes = resolveCodelistCodes(dim, structure?.data ?? {});
            const needle = (search ?? '').toLowerCase();
            const rows = codes
                .map((c) => ({ id: c.id, name: unwrapLocalisedLabel(c.name) }))
                .filter((r) => !needle || `${r.id} ${r.name}`.toLowerCase().includes(needle));
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
     * @param options.databaseId - IMF dataflow ID (`"WEO"`, `"FM"`, ...).
     * @param options.startYear - Inclusive start year (e.g. `2015`).
     * @param options.endYear - Inclusive end year (e.g. `2030` for WEO forecasts).
     * @param options.filters - Map of dimension → selected codes. Filter
     *   keys are matched case-insensitively against the DSD dimensions
     *   (legacy lowercase `country`/`indicator`/`frequency` continue to work).
     * @param options.dimensionOrder - Optional override of the dimension order
     *   used to build the SDMX key. Defaults to
     *   {@link defaultDimensionOrder} for the database.
     * @param options.agencyId - Optional SDMX agency override (e.g. `"IMF.RES"`,
     *   `"IMF.STA"`). Defaults to {@link resolveAgency}.
     * @returns MCP-shaped result whose `content[0].text` carries the raw
     *   SDMX-JSON response. Empty on error or invalid inputs.
     */
    async fetchData(options) {
        const { databaseId, startYear, endYear, filters, dimensionOrder, agencyId } = options;
        if (!databaseId || !filters || Object.keys(filters).length === 0) {
            console.warn('imf-fetch-data requires databaseId and a non-empty filters map');
            return IMF_FALLBACK;
        }
        if (!Number.isFinite(startYear) || !Number.isFinite(endYear) || endYear < startYear) {
            console.warn(`imf-fetch-data invalid year range: ${startYear}-${endYear}`);
            return IMF_FALLBACK;
        }
        try {
            const agency = agencyId ?? resolveAgency(databaseId);
            const dims = dimensionOrder ?? defaultDimensionOrder(databaseId);
            const key = buildSDMXKey(dims, withDefaultFrequency(databaseId, filters));
            const qs = new URLSearchParams({
                startPeriod: String(startYear),
                endPeriod: String(endYear),
                format: 'jsondata',
            });
            const url = `/data/dataflow/${encodeURIComponent(agency)}/${encodeURIComponent(databaseId)}/+/${key}?${qs.toString()}`;
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
        // Tries the primary subscription key first, falling back to the secondary
        // on 401/403 so live IMF key rotation never breaks an in-flight run.
        return this._fetchDirectWithKeyRotation(url);
    }
    /**
     * Direct-fetch strategy with subscription-key rotation.
     *
     * Iterates configured `IMF_API_PRIMARY_KEY` → `IMF_API_SECONDARY_KEY`,
     * retrying only on `401`/`403`. Network errors short-circuit immediately.
     *
     * @param url - Fully-qualified IMF SDMX URL.
     * @returns Response body text on success.
     * @throws The last HTTP/network error when all configured keys are exhausted.
     * @internal
     */
    async _fetchDirectWithKeyRotation(url) {
        const attempts = this._imfSubscriptionKeys.length > 0 ? [...this._imfSubscriptionKeys] : [undefined];
        let lastError;
        for (let i = 0; i < attempts.length; i += 1) {
            const isLast = i + 1 >= attempts.length;
            const outcome = await this._fetchOnceWithKey(url, attempts[i]);
            if (outcome.kind === 'ok')
                return outcome.text;
            lastError = outcome.error;
            if (outcome.kind === 'auth' && !isLast)
                continue;
            throw outcome.error;
        }
        if (lastError !== undefined)
            throw lastError;
        throw new Error(`IMF request to ${url} failed without producing a response`);
    }
    /**
     * Single direct-fetch attempt with one subscription key. Classifies the
     * outcome so {@link _fetchDirectWithKeyRotation} can decide whether to
     * rotate keys or surface the error.
     *
     * @param url - Fully-qualified IMF SDMX URL.
     * @param key - Subscription key for this attempt, or `undefined` to send unauthenticated.
     * @returns `'ok'` with body text, `'auth'` with the 401/403 error, or `'error'` for everything else.
     * @internal
     */
    async _fetchOnceWithKey(url, key) {
        const headers = { ...IMF_REQUEST_HEADERS };
        if (key !== undefined && key.length > 0) {
            headers[IMF_SUBSCRIPTION_KEY_HEADER] = key;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this._timeoutMs);
        try {
            const response = await this._fetchImpl(url, {
                method: 'GET',
                headers,
                signal: controller.signal,
            });
            if (response.ok) {
                // `api.imf.org` returns 204 when the request reached Azure APIM
                // but no Ocp-Apim-Subscription-Key matched. 204 is technically
                // 2xx, so without this explicit branch the empty body would be
                // returned as a successful SDMX-JSON envelope and downstream
                // parsers would silently produce empty series. Treat 204 as an
                // error so missing/invalid keys are caught at Stage A.
                if (response.status === 204) {
                    return {
                        kind: 'error',
                        error: new Error(`HTTP 204 No Content for ${url} — likely missing or invalid ${IMF_SUBSCRIPTION_KEY_HEADER} (set IMF_API_PRIMARY_KEY)`),
                    };
                }
                return { kind: 'ok', text: await response.text() };
            }
            const error = new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
            const isAuthFailure = response.status === 401 || response.status === 403;
            return { kind: isAuthFailure ? 'auth' : 'error', error };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { kind: 'error', error };
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