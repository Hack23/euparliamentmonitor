// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/IMF
 * @description Types for IMF (International Monetary Fund) economic data
 * integration via the native TypeScript SDMX 3.0 REST client
 * (`src/mcp/imf-mcp-client.ts`), which calls
 * `https://dataservices.imf.org/REST/SDMX_3.0/` directly.
 *
 * Used to enrich EU Parliament articles with **fresher** macroeconomic context
 * than the World Bank WDI provides (IMF WEO ships 2025 actuals + 2026-2030
 * forecasts; WDI typically lags by 12+ months for the most recent vintage).
 *
 * ## Wave 1 dual-source note
 *
 * This module is additive. The World Bank types in `./world-bank.ts` remain
 * the authoritative source for social/health/education/environment indicators
 * that IMF SDMX does not publish. IMF types cover the macro/fiscal/trade/
 * monetary subset plus native multi-year forecasts.
 *
 * ## Transport history
 *
 * The first Wave 1 iteration proxied through the Python
 * `c-cf/imf-data-mcp` MCP server. That transport was replaced with a
 * native TypeScript HTTP client so the stack remains npm-pure and
 * pinned per ISMS §7. The `IMF_MCP_TOOLS` identifier list is retained
 * as a stable "virtual tool" surface for the Stage-C editorial
 * fingerprint (see `analysis/imf/indicator-catalog.md §6`) and the
 * workflow probe. The earlier companion module `src/utils/imf-data.ts`
 * (parsers, indicator/country maps, HTML builders) was purged in the
 * April-2026 aggregator-pipeline migration.
 *
 * @see {@link https://dataservices.imf.org/REST/SDMX_3.0 | IMF SDMX 3.0 REST API}
 * @see `analysis/methodologies/imf-indicator-mapping.md` for the committee →
 *   IMF indicator mapping enforced at Stage-C editorial review.
 */

import type { MCPClientOptions } from './mcp.js';

/**
 * IMF client connection options, as accepted by the native TypeScript
 * SDMX 3.0 REST client in `src/mcp/imf-mcp-client.ts`.
 *
 * Extends {@link MCPClientOptions} so existing call-sites that pass the
 * shared base options continue to compile, but adds the three fields
 * actually consumed by the native HTTP transport:
 *
 * - `apiBaseUrl` — override the IMF REST base URL (default
 *   `https://dataservices.imf.org/REST/SDMX_3.0`).
 * - `timeoutMs` — per-request timeout in milliseconds.
 * - `fetchImpl` — optional `fetch` injection for tests.
 *
 * The inherited legacy MCP transport fields (`serverPath`, `gatewayUrl`,
 * `gatewayApiKey`, `maxConnectionAttempts`, `connectionRetryDelay`) are
 * accepted for backwards compatibility but **ignored** by the native
 * client — they date from the earlier `c-cf/imf-data-mcp` proxy
 * transport and are retained only so existing callers do not break.
 */
export interface IMFMCPClientOptions extends MCPClientOptions {
  /** Override the IMF REST base URL. */
  apiBaseUrl?: string;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number;
  /** Optional `fetch` implementation injection for testing. */
  fetchImpl?: typeof fetch;
}

/**
 * Canonical IMF dataset (database) identifier.
 *
 * The IMF SDMX 3.0 API exposes ~155 databases (WEO, IFS, CPI, FM, BOP_AGG,
 * ER, PCPS, GFS, FSI, SDG, ...). Only the subset relevant to EU Parliament
 * analysis is enumerated here; use the `imf-search-databases` tool to
 * discover additional datasets.
 */
export type IMFDatabaseId =
  | 'WEO' // World Economic Outlook (GDP, inflation, unemployment, fiscal balance, current account — with forecasts)
  | 'IFS' // International Financial Statistics (monthly/quarterly financial data)
  | 'CPI' // Consumer Price Index (monthly)
  | 'PPI' // Producer Price Index
  | 'FM' // Fiscal Monitor (government debt, primary balance, structural balance)
  | 'BOP_AGG' // Balance of Payments (current account, FDI, portfolio flows)
  | 'ER' // Exchange Rates (nominal/real effective exchange rate)
  | 'PCPS' // Primary Commodity Price System
  | 'GFS' // Government Finance Statistics
  | 'FSI' // Financial Soundness Indicators
  | 'SDG' // Sustainable Development Goals
  | 'ANEA'; // National Accounts — Annual

/**
 * Data-observation frequency as published by the IMF SDMX 3.0 API.
 * Annual datasets (WEO, FM) use `A`; quarterly (IFS, BOP_AGG) use `Q`;
 * monthly (CPI, ER, PCPS) use `M`.
 */
export type IMFFrequency = 'A' | 'Q' | 'M';

/**
 * A single observation (one time-period, one value) in an IMF series.
 *
 * `isForecast` is `true` when the period is beyond the IMF's most recent
 * published actual for that series — relevant mainly for WEO projections
 * (spring 2026 release carries actuals through 2025 and forecasts for
 * 2026-2030 for most series). Callers should surface this flag in the UI
 * so readers can distinguish actuals from projections.
 */
export interface IMFObservation {
  /** ISO-8601 period string — `YYYY` (annual), `YYYY-QN` (quarterly), `YYYY-MM` (monthly). */
  period: string;
  /** Primary year component of the period (convenience for sorting). */
  year: number;
  /** Numeric value of the observation, or `null` when the cell is empty/suppressed. */
  value: number | null;
  /** Whether the observation is an IMF forecast/projection rather than a published actual. */
  isForecast: boolean;
}

/**
 * A single IMF time series — one country × one indicator × one frequency,
 * with all observations for the requested year range.
 */
export interface IMFSeries {
  /** IMF database the series was drawn from. */
  databaseId: IMFDatabaseId | string;
  /** ISO-3166-1 alpha-3 country code as used by IMF (mostly identical to WB codes; see `getIMFCountryCode`). */
  countryId: string;
  /** Country display name as published by the IMF codelist. */
  countryName: string;
  /** IMF indicator/dimension code (e.g. `NGDP_RPCH` for WEO real GDP growth). */
  indicatorId: string;
  /** Human-readable indicator name, as published on the IMF codelist. */
  indicatorName: string;
  /** Series frequency (A/Q/M). */
  frequency: IMFFrequency;
  /** Observations sorted by ascending period. */
  observations: readonly IMFObservation[];
}

/**
 * IMF database metadata returned by `imf-list-databases` and
 * `imf-search-databases`.
 */
export interface IMFDatabase {
  /** Database identifier (e.g. `WEO`, `IFS`). */
  id: string;
  /** Human-readable database title. */
  name: string;
  /** Short description as published by the IMF. */
  description?: string;
  /** Publication cadence summary (e.g. "Spring and Autumn"). */
  cadence?: string;
}

/**
 * A single forecast point — the subset of an {@link IMFObservation} where
 * `isForecast === true`. Kept as a distinct narrow type so article generators
 * and Chart.js panel builders can hold forecast-only arrays without
 * ambiguity.
 */
export interface IMFForecastPoint {
  /** Period (annual WEO forecasts use `YYYY`). */
  period: string;
  /** Year component. */
  year: number;
  /** Forecast value (non-null by construction of this type). */
  value: number;
  /** IMF vintage label (e.g. `WEO-April-2026`) when known — for audit trail. */
  vintage?: string;
}

/**
 * Curated set of IMF indicator keys used across the EU Parliament Monitor.
 *
 * These map onto specific IMF database + SDMX dimension codes — see
 * the indicator catalogue in
 * [`analysis/imf/indicator-catalog.md §2`](../../analysis/imf/indicator-catalog.md#2-core-indicators)
 * and the per-committee mapping in
 * [`analysis/methodologies/imf-indicator-mapping.md §1`](../../analysis/methodologies/imf-indicator-mapping.md)
 * for the concrete mapping. (The earlier runtime constant
 * `IMF_POLICY_INDICATORS` in `src/utils/imf-data.ts` was purged in the
 * April-2026 aggregator-pipeline migration.) The key names are chosen
 * to parallel the World Bank `PolicyRelevantIndicators` keys where an
 * equivalent series exists, so article generators and templates can
 * migrate incrementally.
 */
export type IMFMacroIndicatorKey =
  // ── WEO (annual, with forecasts) ──
  | 'gdp' // NGDPD — GDP, current USD
  | 'gdpGrowth' // NGDP_RPCH — real GDP growth, annual %
  | 'gdpPerCapita' // NGDPDPC — GDP per capita, current USD
  | 'inflation' // PCPIPCH — consumer price inflation, annual %
  | 'unemployment' // LUR — unemployment rate, % of labour force
  | 'population' // LP — population, millions
  | 'currentAccount' // BCA_NGDPD — current account balance, % of GDP
  | 'exportsGdp' // TX_RPCH — export volume growth, annual % (closest WEO proxy)
  // ── Fiscal Monitor (annual, with forecasts) ──
  | 'govDebt' // GGXWDG_NGDP — general government gross debt, % of GDP
  | 'primaryBalance' // GGXONLB_NGDP — primary balance, % of GDP
  | 'structuralBalance' // GGSB_NPGDP — structural balance, % of potential GDP
  // ── IFS / BOP / ER (higher frequency) ──
  | 'fdiInflow' // BOP_AGG: direct investment inflow, current USD (quarterly)
  | 'realEffectiveExchangeRate' // ER: EREER_IX (monthly)
  | 'policyRate'; // IFS policy rate (monthly)

/**
 * Mapping of `IMFMacroIndicatorKey` to the concrete IMF database + SDMX
 * indicator code + default frequency. Mirrors the shape of World Bank's
 * `PolicyRelevantIndicators`.
 */
export interface IMFPolicyIndicatorMapping {
  /** IMF database the indicator lives in. */
  database: IMFDatabaseId;
  /** SDMX indicator code (WEO concept, IFS indicator, etc.). */
  indicator: string;
  /** Default frequency for this series — some are available at multiple frequencies. */
  frequency: IMFFrequency;
  /** Human-readable display name. */
  label: string;
  /** `true` when the indicator carries IMF forecasts beyond the latest actual. */
  hasForecast: boolean;
}

/**
 * Summary row for one indicator used in article/HTML embedding. Distinct
 * from the World Bank `EconomicIndicatorSummary` because an IMF row carries
 * a forecast flag and optional IMF vintage attribution.
 */
export interface IMFEconomicIndicatorSummary {
  /** Indicator display name (e.g. "Real GDP growth"). */
  name: string;
  /** IMF indicator code. */
  indicatorId: string;
  /** IMF database code (WEO, FM, IFS, ...). */
  database: string;
  /** Most recent reported value. */
  value: number | null;
  /** Period label of the reported value. */
  period: string;
  /** Year component. */
  year: number;
  /** `true` when the reported value is a forecast rather than an actual. */
  isForecast: boolean;
  /** Pre-formatted display string (e.g. `"3.1 %"`, `"$4.2T"`). */
  formatted: string;
  /** IMF data vintage label (e.g. `WEO-April-2026`) when the MCP response surfaces it. */
  vintage?: string;
}

/**
 * Economic context payload built from IMF indicator data, parallel to
 * the World Bank `EconomicContext` shape.
 */
export interface IMFEconomicContext {
  /** ISO-3166 alpha-2 or alpha-3 country code used as the primary key. */
  countryCode: string;
  /** Country display name. */
  countryName: string;
  /** Indicator summaries, most recent value + forecast flag. */
  indicators: readonly IMFEconomicIndicatorSummary[];
  /** Forward-looking projection horizon (e.g. `2030`) when the payload carries forecasts. */
  forecastHorizonYear?: number;
  /** Data retrieval timestamp (not the IMF publication date). */
  dataTimestamp: string;
}

/**
 * Canonical IMF "virtual tool" names used by the native TypeScript
 * client. These identifiers are preserved from the earlier MCP-backed
 * iteration so the Stage-C editorial fingerprint list (see
 * `analysis/imf/indicator-catalog.md §6`) and the workflow probe
 * (`scripts/imf-mcp-probe.sh`) remain stable across the transport
 * swap. Each name maps to a semantic method on {@link IMFMCPClient}
 * rather than to a remote MCP tool call.
 */
export type IMFMCPToolName =
  | 'imf-list-databases'
  | 'imf-search-databases'
  | 'imf-get-parameter-defs'
  | 'imf-get-parameter-codes'
  | 'imf-fetch-data';
