// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/WorldBank
 * @description Types for World Bank MCP client and economic data integration.
 * Used to enrich EU Parliament articles with economic context from World Bank indicators.
 */

/**
 * World Bank MCP client connection options.
 *
 * Alias for {@link MCPClientOptions} to ensure all base connection options
 * (including `serverLabel`) are always available for the World Bank client.
 */
export type WBMCPClientOptions = import('./mcp.js').MCPClientOptions;

/** World Bank indicator data point */
export interface WorldBankIndicator {
  /** Country ISO code (e.g., 'DEU', 'FRA') */
  countryId: string;
  /** Country name */
  countryName: string;
  /** Indicator ID (e.g., 'NY.GDP.MKTP.CD') */
  indicatorId: string;
  /** Indicator name (e.g., 'GDP (current US$)') */
  indicatorName: string;
  /** Year of the data point */
  year: number;
  /** Value of the indicator */
  value: number | null;
}

/** World Bank country reference */
export interface WorldBankCountry {
  /** ISO2 code (e.g., 'DE', 'FR') */
  iso2Code: string;
  /** Country name */
  name: string;
  /** World Bank region */
  region: string;
  /** Income level classification */
  incomeLevel: string;
}

/** Economic context enrichment for EU Parliament articles */
export interface EconomicContext {
  /** EU member state ISO2 code */
  countryCode: string;
  /** Country name */
  countryName: string;
  /** Key economic indicators */
  indicators: EconomicIndicatorSummary[];
  /** Data freshness timestamp */
  dataTimestamp: string;
}

/** Summary of a single economic indicator */
export interface EconomicIndicatorSummary {
  /** Human-readable indicator name */
  name: string;
  /** World Bank indicator ID */
  indicatorId: string;
  /** Most recent value */
  value: number | null;
  /** Year of the most recent value */
  year: number;
  /** Formatted display string (e.g., '$4.2T', '3.1%') */
  formatted: string;
}

/** Mapping of EU member state ISO2 codes to World Bank country codes */
export type EUCountryCodeMap = Readonly<Record<string, string>>;

/** Key World Bank indicators relevant to EU Parliament policy analysis */
export interface PolicyRelevantIndicators {
  /** GDP (current US$) — NY.GDP.MKTP.CD */
  gdp: string;
  /** GDP growth (annual %) — NY.GDP.MKTP.KD.ZG */
  gdpGrowth: string;
  /** Inflation, consumer prices (annual %) — FP.CPI.TOTL.ZG */
  inflation: string;
  /** Unemployment, total (% of total labor force) — SL.UEM.TOTL.ZS */
  unemployment: string;
  /** Trade (% of GDP) — NE.TRD.GNFS.ZS */
  trade: string;
  /** CO2 emissions (metric tons per capita) — EN.ATM.CO2E.PC */
  co2Emissions: string;
  /** Population, total — SP.POP.TOTL */
  population: string;
  /** Research and development expenditure (% of GDP) — GB.XPD.RSDV.GD.ZS */
  rdExpenditure: string;
}
