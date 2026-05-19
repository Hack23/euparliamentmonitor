// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/** Default base URL for the IMF Data Portal SDMX 3.0 REST API. */
export const DEFAULT_IMF_API_BASE_URL = 'https://api.imf.org/external/sdmx/3.0';
/** Default per-request timeout (milliseconds). */
export const DEFAULT_IMF_API_TIMEOUT_MS = 90_000;
/** Product identifier sent to IMF SDMX endpoints. */
export const IMF_USER_AGENT = 'euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)';
/** IMF SDMX accepts JSON data; keep a fallback for proxy/content negotiation. */
export const IMF_ACCEPT_HEADER = 'application/json, application/vnd.sdmx.data+json, */*;q=0.8';
/** Common headers for direct IMF SDMX REST requests (auth header added per-request). */
export const IMF_REQUEST_HEADERS = Object.freeze({
    Accept: IMF_ACCEPT_HEADER,
    'User-Agent': IMF_USER_AGENT,
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
});
/** Azure APIM subscription-key header expected by `api.imf.org`. */
export const IMF_SUBSCRIPTION_KEY_HEADER = 'Ocp-Apim-Subscription-Key';
/**
 * Per-dataflow → maintainer agency map for the post-September-2025 IMF
 * Data Portal, where the umbrella `IMF` agency was retired in favour of
 * sub-departmental agency IDs (`IMF.RES`, `IMF.STA`, `IMF.FAD`, `IMF.WHD`,
 * `IMF.MCM`, …).
 */
export const IMF_DATAFLOW_AGENCY = Object.freeze({
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
/** Fallback agency when {@link IMF_DATAFLOW_AGENCY} has no entry. */
export const DEFAULT_IMF_AGENCY = 'IMF.STA';
/** Fallback payload shape when an IMF call fails or the server is offline. */
export const IMF_FALLBACK = {
    content: [{ type: 'text', text: '' }],
};
/**
 * Canonical list of "virtual tools" exposed by this client.
 * Drift-guarded by `test/integration/mcp/imf-mcp.test.js`.
 */
export const IMF_MCP_TOOLS = [
    'imf-list-databases',
    'imf-search-databases',
    'imf-get-parameter-defs',
    'imf-get-parameter-codes',
    'imf-fetch-data',
];
//# sourceMappingURL=config.js.map