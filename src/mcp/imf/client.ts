// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/imf/client
 * @description IMF SDMX 3.0 client class, singleton lifecycle, and IMFClient alias.
 */

import type { MCPToolResult } from '../../types/index.js';
import type {
  IMFClientOptions,
  SDMXDataflowListResponse,
  SDMXDataStructureResponse,
} from './types.js';
import { IMF_FALLBACK } from './config.js';
import {
  resolveAgency,
  resolveCodelistCodes,
  defaultDimensionOrder,
  buildSDMXKey,
  withDefaultFrequency,
} from './sdmx.js';
import { unwrapLocalisedLabel, wrapAsMCPResult } from './observations.js';
import {
  readBaseAndTimeout,
  stripTrailingSlashes,
  readImfSubscriptionKeysFromEnv,
} from './utils.js';
import {
  type IMFHttpContext,
  getText,
  getJSON,
} from './http-transport.js';

export class IMFMCPClient {
  private readonly _apiBaseUrl: string;
  private readonly _timeoutMs: number;
  private readonly _fetchImpl: typeof fetch;
  private readonly _fetchProxyGatewayUrl: string | undefined;
  private readonly _fetchProxyApiKey: string | undefined;
  private readonly _imfSubscriptionKeys: readonly string[];
  private _connected = false;

  /**
   * Create a new IMF SDMX 3.0 client.
   *
   * Resolves the API base URL, timeout, fetch implementation, and Azure-APIM
   * subscription keys from the explicit `options`, then from environment
   * variables (`IMF_API_BASE_URL`, `IMF_API_TIMEOUT_MS`, `IMF_API_PRIMARY_KEY`,
   * `IMF_API_SECONDARY_KEY`, `FETCH_MCP_GATEWAY_URL`,
   * `EP_MCP_GATEWAY_API_KEY`), and finally module-level defaults.
   *
   * @param options - Optional overrides for base URL, timeout, fetch impl,
   *   and the optional fetch-proxy gateway used for restricted networks.
   */
  constructor(options: IMFClientOptions = {}) {
    const { base, timeout } = readBaseAndTimeout(options);
    this._apiBaseUrl = stripTrailingSlashes(base);
    this._timeoutMs = timeout;
    this._fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this._fetchProxyGatewayUrl =
      options.fetchProxyGatewayUrl ?? process.env['FETCH_MCP_GATEWAY_URL'] ?? undefined;
    this._fetchProxyApiKey =
      options.fetchProxyApiKey ?? process.env['EP_MCP_GATEWAY_API_KEY'] ?? undefined;
    this._imfSubscriptionKeys = readImfSubscriptionKeysFromEnv();
  }

  /**
   * Base URL currently in use (read-only — set at construction time).
   *
   * @returns The fully-qualified IMF SDMX base URL (no trailing slash).
   */
  getApiBaseUrl(): string {
    return this._apiBaseUrl;
  }

  /**
   * Per-request timeout in milliseconds.
   *
   * @returns The timeout currently applied to every `fetch()` call.
   */
  getTimeoutMs(): number {
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
  async connect(): Promise<void> {
    try {
      new URL(this._apiBaseUrl);
      this._connected = true;
    } catch (error) {
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
  isConnected(): boolean {
    return this._connected;
  }

  /** Reset the connected flag. No real socket to close. */
  disconnect(): void {
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
  async listDatabases(): Promise<MCPToolResult> {
    try {
      const json = await getJSON<SDMXDataflowListResponse>('/structure/dataflow', this._httpCtx());
      const flows = json?.data?.dataflows ?? [];
      const rows = flows.map((f) => ({
        id: f.id ?? '',
        name: unwrapLocalisedLabel(f.name),
        description: unwrapLocalisedLabel(f.description),
        agency: f.agencyID ?? '',
        version: f.version ?? '',
      }));
      return wrapAsMCPResult(rows);
    } catch (error) {
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
  async searchDatabases(keyword: string): Promise<MCPToolResult> {
    if (!keyword) {
      console.warn('imf-search-databases called without a keyword');
      return IMF_FALLBACK;
    }
    try {
      const json = await getJSON<SDMXDataflowListResponse>('/structure/dataflow', this._httpCtx());
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
    } catch (error) {
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
   * @param agencyId - Optional override; defaults to `resolveAgency`.
   * @returns MCP-shaped result whose `content[0].text` carries the
   *   ordered list of dimensions (`[{ id, name }]`). Empty on error.
   */
  async getParameterDefs(databaseId: string, agencyId?: string): Promise<MCPToolResult> {
    if (!databaseId) {
      console.warn('imf-get-parameter-defs called without databaseId');
      return IMF_FALLBACK;
    }
    try {
      const agency = agencyId ?? resolveAgency(databaseId);
      const json = await getJSON<SDMXDataStructureResponse>(
        `/structure/dataflow/${encodeURIComponent(agency)}/${encodeURIComponent(databaseId)}/+?references=datastructure`,
        this._httpCtx()
      );
      const ds = json?.data?.dataStructures?.[0];
      const dims = ds?.dataStructureComponents?.dimensionList?.dimensions ?? [];
      const rows = dims.map((d) => ({ id: d.id, name: unwrapLocalisedLabel(d.name) }));
      return wrapAsMCPResult(rows);
    } catch (error) {
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
   * `/structure/dataflow/{agency}/{id}/+?references=all` to fetch the
   * DSD plus its referenced conceptSchemes and codelists in one
   * round-trip — SDMX 3.0 binds the codelist on the *concept*
   * (`coreRepresentation.enumeration`), so resolving codes requires
   * walking dim → conceptIdentity → conceptScheme → concept → codelist.
   *
   * @param databaseId - IMF dataflow identifier.
   * @param parameter - Dimension name (e.g. `"COUNTRY"`, `"INDICATOR"`;
   *   matched case-insensitively).
   * @param search - Optional free-text search (case-insensitive substring).
   * @param agencyId - Optional agency override; defaults to `resolveAgency`.
   * @returns MCP-shaped result with `[{ id, name }]` rows; empty on error.
   */
  async getParameterCodes(
    databaseId: string,
    parameter: string,
    search?: string,
    agencyId?: string
  ): Promise<MCPToolResult> {
    if (!databaseId || !parameter) {
      console.warn('imf-get-parameter-codes requires databaseId and parameter');
      return IMF_FALLBACK;
    }
    try {
      const agency = agencyId ?? resolveAgency(databaseId);
      const structure = await getJSON<SDMXDataStructureResponse>(
        `/structure/dataflow/${encodeURIComponent(agency)}/${encodeURIComponent(databaseId)}/+?references=all`,
        this._httpCtx()
      );
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
    } catch (error) {
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
   *   `defaultDimensionOrder` for the database.
   * @param options.agencyId - Optional SDMX agency override (e.g. `"IMF.RES"`,
   *   `"IMF.STA"`). Defaults to `resolveAgency`.
   * @returns MCP-shaped result whose `content[0].text` carries the raw
   *   SDMX-JSON response. Empty on error or invalid inputs.
   */
  async fetchData(options: {
    databaseId: string;
    startYear: number;
    endYear: number;
    filters: Readonly<Record<string, readonly string[]>>;
    dimensionOrder?: readonly string[];
    agencyId?: string;
  }): Promise<MCPToolResult> {
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
      const normalisedFilters = withDefaultFrequency(databaseId, filters);
      const key = buildSDMXKey(dims, normalisedFilters);
      const slots = key.split('.');
      const hasConcreteNonFreqSlot = dims.some(
        (dim, i) => dim.toUpperCase() !== 'FREQUENCY' && slots[i] !== '*'
      );
      if (!hasConcreteNonFreqSlot) {
        console.warn(
          `imf-fetch-data refusing unbounded request for ${databaseId} (${dims.join('.')}=${key}): ` +
            `at least one non-FREQUENCY dimension must have a concrete filter value. ` +
            `Filter keys received: ${Object.keys(filters).join(', ') || '<none>'}`
        );
        return IMF_FALLBACK;
      }
      const qs = new URLSearchParams({
        startPeriod: String(startYear),
        endPeriod: String(endYear),
        format: 'jsondata',
      });
      const url = `/data/dataflow/${encodeURIComponent(agency)}/${encodeURIComponent(databaseId)}/+/${key}?${qs.toString()}`;
      const text = await getText(url, this._httpCtx());
      return wrapAsMCPResult(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('imf-fetch-data not available:', message);
      return IMF_FALLBACK;
    }
  }

  // ─── private HTTP context factory ─────────────────────────────────────────

  /**
   * Build an {@link IMFHttpContext} adapter for http-transport.ts helpers.
   *
   * @returns Context adapter for IMF HTTP transport helpers
   */
  private _httpCtx(): IMFHttpContext {
    return {
      apiBaseUrl: this._apiBaseUrl,
      timeoutMs: this._timeoutMs,
      fetchImpl: this._fetchImpl,
      fetchProxyGatewayUrl: this._fetchProxyGatewayUrl,
      fetchProxyApiKey: this._fetchProxyApiKey,
      imfSubscriptionKeys: this._imfSubscriptionKeys,
    };
  }
}

/**
 * Forward-looking alias for `IMFMCPClient`. New code should prefer
 * `IMFClient`; the `IMFMCPClient` name is retained for backward
 * compatibility with the MCP-backed iteration shipped in Wave 1.
 */
export const IMFClient = IMFMCPClient;

// ─── Singleton lifecycle ─────────────────────────────────────────────────────
// Extracted to ./lifecycle.ts to keep this file under 600 LOC.
// Re-exported here so existing `import { getIMFMCPClient } from './client.js'`
// callers continue to work.
export { getIMFMCPClient, closeIMFMCPClient } from './lifecycle.js';
