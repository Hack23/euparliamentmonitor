// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/WorldBank
 * @description Types for World Bank MCP client and economic data integration.
 * Used to enrich EU Parliament articles with economic context from World Bank indicators.
 */

import type { MCPClientOptions } from './mcp.js';

/**
 * World Bank MCP client connection options.
 *
 * Alias for {@link MCPClientOptions} to ensure all base connection options
 * (including `serverLabel`) are always available for the World Bank client.
 */
export type WBMCPClientOptions = MCPClientOptions;

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
  // ── Macro-economic (get-economic-data) ──
  /** GDP (current US$) — NY.GDP.MKTP.CD */
  gdp: string;
  /** GDP growth (annual %) — NY.GDP.MKTP.KD.ZG */
  gdpGrowth: string;
  /** GDP per capita (current US$) — NY.GDP.PCAP.CD */
  gdpPerCapita: string;
  /** GNI per capita, Atlas method (current US$) — NY.GNP.PCAP.CD */
  gniPerCapita: string;
  /** Inflation, consumer prices (annual %) — FP.CPI.TOTL.ZG */
  inflation: string;
  /** Unemployment, total (% of total labor force) — SL.UEM.TOTL.ZS */
  unemployment: string;
  /** Exports of goods and services (% of GDP) — NE.EXP.GNFS.ZS */
  exportsGdp: string;
  /** Foreign direct investment, net inflows (BoP, current US$) — BN.KLT.DINV.CD */
  fdiNet: string;

  // ── Trade & fiscal ──
  /** Trade (% of GDP) — NE.TRD.GNFS.ZS */
  trade: string;
  /** Tax revenue (% of GDP) — GC.TAX.TOTL.GD.ZS */
  taxRevenue: string;
  /** General government final consumption expenditure (% of GDP) — NE.CON.GOVT.ZS */
  govExpenditure: string;
  /** Military expenditure (% of GDP) — MS.MIL.XPND.GD.ZS */
  militaryExpenditure: string;

  // ── Social (get-social-data) ──
  /** Population, total — SP.POP.TOTL */
  population: string;
  /** Life expectancy at birth, total (years) — SP.DYN.LE00.IN */
  lifeExpectancy: string;
  /** Birth rate, crude (per 1,000 people) — SP.DYN.CBRT.IN */
  birthRate: string;
  /** Death rate, crude (per 1,000 people) — SP.DYN.CDRT.IN */
  deathRate: string;
  /** Individuals using the Internet (% of population) — IT.NET.USER.ZS */
  internetUsers: string;

  // ── Health (get-health-data) ──
  /** Current health expenditure (% of GDP) — SH.XPD.CHEX.GD.ZS */
  healthExpenditure: string;
  /** Physicians (per 1,000 people) — SH.MED.PHYS.ZS */
  physicians: string;
  /** Hospital beds (per 1,000 people) — SH.MED.BEDS.ZS */
  hospitalBeds: string;

  // ── Education (get-education-data) ──
  /** Government expenditure on education, total (% of GDP) — SE.XPD.TOTL.GD.ZS */
  educationExpenditure: string;

  // ── Environment & energy ──
  /** CO2 emissions (metric tons per capita) — EN.ATM.CO2E.PC */
  co2Emissions: string;
  /** Renewable energy consumption (% of total) — EG.FEC.RNEW.ZS */
  renewableEnergy: string;

  // ── Research & innovation ──
  /** Research and development expenditure (% of GDP) — GB.XPD.RSDV.GD.ZS */
  rdExpenditure: string;
  /** High-technology exports (% of manufactured exports) — TX.VAL.TECH.MF.ZS */
  hightechExports: string;
}

/**
 * World Bank MCP tool names available for data fetching.
 * Maps to the tool functions on the worldbank-mcp server.
 *
 * These type literals use **kebab-case** (e.g., `get-economic-data`) to match
 * the underlying tool registration names in worldbank-mcp@1.0.1
 * (`server.tool('get-economic-data', ...)`).
 * When called via the MCP gateway prefix in this repository's workflows, use
 * the corresponding **snake_case** form, for example
 * `world_bank___get_economic_data(...)`.
 *
 * **Note:** The codebase also has a `WorldBankMCPClient.getIndicatorForCountry()`
 * wrapper (in `src/mcp/wb-mcp-client.ts`) that calls the `get_indicator_for_country`
 * tool — this is a back-compat convenience method not listed in this type union since it
 * is not part of the standard worldbank-mcp tool surface.
 */
export type WBMCPToolName =
  | 'get-economic-data'
  | 'get-social-data'
  | 'get-health-data'
  | 'get-education-data'
  | 'get-country-info'
  | 'get-countries'
  | 'search-indicators';

/**
 * World Bank MCP tool indicator key mapping.
 * Maps each tool to the indicator key literals it accepts.
 */
export interface WBToolIndicatorKeys {
  /** Economic indicators accepted by `get-economic-data` */
  'get-economic-data':
    | 'GDP'
    | 'GDP_GROWTH'
    | 'GDP_PER_CAPITA'
    | 'GNI'
    | 'GNI_PER_CAPITA'
    | 'EXPORTS_GDP'
    | 'FDI_NET'
    | 'INFLATION'
    | 'UNEMPLOYMENT';
  /** Social indicators accepted by `get-social-data` */
  'get-social-data':
    | 'POPULATION'
    | 'LIFE_EXPECTANCY'
    | 'BIRTH_RATE'
    | 'DEATH_RATE'
    | 'INTERNET_USERS';
  /** Health indicators accepted by `get-health-data` */
  'get-health-data':
    | 'HEALTH_EXPENDITURE'
    | 'PHYSICIANS'
    | 'HOSPITAL_BEDS'
    | 'IMMUNIZATION'
    | 'HIV_PREVALENCE'
    | 'MALNUTRITION'
    | 'TUBERCULOSIS';
  /** Education indicators accepted by `get-education-data` */
  'get-education-data':
    | 'LITERACY_RATE'
    | 'SCHOOL_ENROLLMENT'
    | 'SCHOOL_COMPLETION'
    | 'TEACHERS_PRIMARY'
    | 'EDUCATION_EXPENDITURE';
}
