// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/WorldBankData
 * @description Utility functions for World Bank economic data integration.
 *
 * Provides EU member state → World Bank country code mapping,
 * CSV parsing for MCP responses, indicator formatting, and economic
 * context building for EU Parliament article enrichment.
 *
 * Functions in this module are designed to be stateless and avoid observable
 * side effects, with the exception of explicitly recording metadata such as
 * data timestamps in returned objects.
 */

import type {
  EconomicContext,
  EconomicIndicatorSummary,
  PolicyRelevantIndicators,
  WorldBankIndicator,
} from '../types/world-bank.js';
import { escapeHTML } from './file-utils.js';

// ─── EU Member State → World Bank Country Code Mapping ───────────────────────

/**
 * Maps EU member state ISO 3166-1 alpha-2 codes to World Bank alpha-3 codes.
 * Covers all 27 EU member states.
 */
export const EU_COUNTRY_CODES: Readonly<Record<string, string>> = {
  AT: 'AUT', // Austria
  BE: 'BEL', // Belgium
  BG: 'BGR', // Bulgaria
  HR: 'HRV', // Croatia
  CY: 'CYP', // Cyprus
  CZ: 'CZE', // Czech Republic
  DK: 'DNK', // Denmark
  EE: 'EST', // Estonia
  FI: 'FIN', // Finland
  FR: 'FRA', // France
  DE: 'DEU', // Germany
  GR: 'GRC', // Greece
  HU: 'HUN', // Hungary
  IE: 'IRL', // Ireland
  IT: 'ITA', // Italy
  LV: 'LVA', // Latvia
  LT: 'LTU', // Lithuania
  LU: 'LUX', // Luxembourg
  MT: 'MLT', // Malta
  NL: 'NLD', // Netherlands
  PL: 'POL', // Poland
  PT: 'PRT', // Portugal
  RO: 'ROU', // Romania
  SK: 'SVK', // Slovakia
  SI: 'SVN', // Slovenia
  ES: 'ESP', // Spain
  SE: 'SWE', // Sweden
} as const;

/** EU aggregate code in World Bank (European Union) */
export const EU_AGGREGATE_CODE = 'EUU';

/**
 * World Bank indicator IDs relevant to EU Parliament policy analysis.
 * These indicators map to common policy areas discussed in EP legislation.
 */
export const POLICY_INDICATORS: PolicyRelevantIndicators = {
  gdp: 'NY.GDP.MKTP.CD',
  gdpGrowth: 'NY.GDP.MKTP.KD.ZG',
  inflation: 'FP.CPI.TOTL.ZG',
  unemployment: 'SL.UEM.TOTL.ZS',
  trade: 'NE.TRD.GNFS.ZS',
  co2Emissions: 'EN.ATM.CO2E.PC',
  population: 'SP.POP.TOTL',
  rdExpenditure: 'GB.XPD.RSDV.GD.ZS',
} as const;

// ─── CSV Parsing ─────────────────────────────────────────────────────────────

/** Known CSV header aliases for each World Bank field */
const HEADER_ALIASES: Readonly<Record<string, readonly string[]>> = {
  country: ['country.id', 'countryiso3code', 'country_id'],
  countryName: ['country.value', 'country_name', 'country'],
  indicator: ['indicator.id', 'indicator_id'],
  indicatorName: ['indicator.value', 'indicator_name', 'indicator'],
  date: ['date', 'year'],
  value: ['value'],
};

/**
 * Find the column index for a field by matching header aliases.
 *
 * @param headers - Lowercase header names
 * @param aliases - Allowed header aliases for the field
 * @returns Column index or -1 if not found
 */
function findColumnIndex(headers: readonly string[], aliases: readonly string[]): number {
  return headers.findIndex((h) => aliases.includes(h));
}

/**
 * Safely read a column value from a row.
 *
 * @param cols - Split row columns
 * @param idx - Column index (-1 means absent)
 * @returns Column value or empty string
 */
function readCol(cols: readonly string[], idx: number): string {
  return idx >= 0 ? (cols[idx] ?? '') : '';
}

/**
 * Split a CSV line respecting quoted fields (RFC 4180).
 * Commas inside double-quoted values are preserved as part of the field.
 * Escaped quotes (`""`) inside a quoted field are treated as a literal `"`.
 *
 * @param line - A single CSV row
 * @returns Array of field values with surrounding quotes removed
 */
function splitCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // RFC 4180 escaped quote: "" → literal "
        current += '"';
        i++; // skip the second quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parse CSV data from World Bank MCP response into structured indicator objects.
 * The World Bank MCP server returns indicator data as CSV text via pandas.
 * Handles quoted fields that may contain commas (e.g., indicator names).
 *
 * @param csvText - Raw CSV text from the MCP tool response (accepts null/undefined for convenience)
 * @returns Array of parsed World Bank indicator data points
 */
export function parseWorldBankCSV(csvText: string | null | undefined): WorldBankIndicator[] {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return [];
  }

  const headers = splitCSVLine(lines[0]!).map((h) => h.toLowerCase());
  const colMap = Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([key, aliases]) => [key, findColumnIndex(headers, aliases)])
  );

  const results: WorldBankIndicator[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]!);
    const rawValue = readCol(cols, colMap['value'] ?? -1);
    const parsedValue = rawValue !== '' ? Number(rawValue) : null;
    const yearStr = readCol(cols, colMap['date'] ?? -1);
    const year = yearStr ? parseInt(yearStr, 10) : 0;

    if (year > 0) {
      results.push({
        countryId: readCol(cols, colMap['country'] ?? -1),
        countryName: readCol(cols, colMap['countryName'] ?? -1),
        indicatorId: readCol(cols, colMap['indicator'] ?? -1),
        indicatorName: readCol(cols, colMap['indicatorName'] ?? -1),
        year,
        value: Number.isFinite(parsedValue) ? parsedValue : null,
      });
    }
  }

  return results;
}

// ─── Value Formatting ────────────────────────────────────────────────────────

/**
 * Format a numeric value for display based on the indicator type.
 *
 * @param value - The numeric value to format
 * @param indicatorId - The World Bank indicator ID (determines formatting style)
 * @returns Formatted display string
 */
export function formatIndicatorValue(value: number | null, indicatorId: string): string {
  if (value === null || !Number.isFinite(value)) {
    return 'N/A';
  }

  // GDP - format as currency with magnitude suffix
  if (indicatorId === POLICY_INDICATORS.gdp) {
    if (Math.abs(value) >= 1e12) {
      return `$${(value / 1e12).toFixed(1)}T`;
    }
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    }
    return `$${value.toFixed(0)}`;
  }

  // Population - format with magnitude suffix
  if (indicatorId === POLICY_INDICATORS.population) {
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`;
    }
    return `${value.toFixed(0)}`;
  }

  // Percentage indicators
  if (
    indicatorId === POLICY_INDICATORS.gdpGrowth ||
    indicatorId === POLICY_INDICATORS.inflation ||
    indicatorId === POLICY_INDICATORS.unemployment ||
    indicatorId === POLICY_INDICATORS.trade ||
    indicatorId === POLICY_INDICATORS.rdExpenditure
  ) {
    return `${value.toFixed(1)}%`;
  }

  // CO2 emissions - metric tons per capita
  if (indicatorId === POLICY_INDICATORS.co2Emissions) {
    return `${value.toFixed(1)} t/cap`;
  }

  return value.toFixed(2);
}

// ─── Most Recent Value ───────────────────────────────────────────────────────

/**
 * Extract the most recent non-null data point from a series of World Bank indicators.
 *
 * @param indicators - Array of indicator data points
 * @returns The most recent data point with a non-null value, or null if none found
 */
export function getMostRecentValue(
  indicators: readonly WorldBankIndicator[]
): WorldBankIndicator | null {
  const withValues = indicators.filter((i) => i.value !== null);
  if (withValues.length === 0) {
    return null;
  }
  withValues.sort((a, b) => b.year - a.year);
  return withValues[0] ?? null;
}

// ─── Economic Context Builder ────────────────────────────────────────────────

/**
 * Build an economic context summary from raw World Bank indicator data.
 *
 * @param countryCode - EU member state ISO2 code
 * @param countryName - Country display name
 * @param indicatorData - Map of indicator ID to parsed data points
 * @returns Structured economic context for article enrichment
 */
export function buildEconomicContext(
  countryCode: string,
  countryName: string,
  indicatorData: ReadonlyMap<string, readonly WorldBankIndicator[]>
): EconomicContext {
  const indicators: EconomicIndicatorSummary[] = [];

  const indicatorNames: Record<string, string> = {
    [POLICY_INDICATORS.gdp]: 'GDP',
    [POLICY_INDICATORS.gdpGrowth]: 'GDP Growth',
    [POLICY_INDICATORS.inflation]: 'Inflation',
    [POLICY_INDICATORS.unemployment]: 'Unemployment',
    [POLICY_INDICATORS.trade]: 'Trade (% of GDP)',
    [POLICY_INDICATORS.co2Emissions]: 'CO₂ Emissions',
    [POLICY_INDICATORS.population]: 'Population',
    [POLICY_INDICATORS.rdExpenditure]: 'R&D Expenditure',
  };

  for (const [indicatorId, dataPoints] of indicatorData) {
    const recent = getMostRecentValue(dataPoints);
    if (recent) {
      indicators.push({
        name: indicatorNames[indicatorId] ?? indicatorId,
        indicatorId,
        value: recent.value,
        year: recent.year,
        formatted: formatIndicatorValue(recent.value, indicatorId),
      });
    }
  }

  return {
    countryCode,
    countryName,
    indicators,
    dataTimestamp: new Date().toISOString(),
  };
}

// ─── EU Country Lookup ───────────────────────────────────────────────────────

/**
 * Get the World Bank country code for an EU member state.
 *
 * @param iso2Code - EU member state ISO 3166-1 alpha-2 code (e.g., 'DE', 'FR')
 * @returns World Bank alpha-3 code or null if not an EU member state
 */
export function getWorldBankCountryCode(iso2Code: string): string | null {
  const upper = iso2Code.toUpperCase();
  return EU_COUNTRY_CODES[upper] ?? null;
}

/**
 * Check if a country code corresponds to an EU member state.
 *
 * @param iso2Code - ISO 3166-1 alpha-2 country code
 * @returns True if the country is an EU member state
 */
export function isEUMemberState(iso2Code: string): boolean {
  return iso2Code.toUpperCase() in EU_COUNTRY_CODES;
}

// ─── HTML Context Section ────────────────────────────────────────────────────

/**
 * Generate an HTML section with economic context data for article embedding.
 *
 * Note: UI strings are currently in English. A future enhancement should accept
 * a `lang` parameter and use localized string maps (similar to `WEEK_AHEAD_STRINGS`)
 * to support all 14 article languages.
 *
 * @param context - Economic context data
 * @returns Sanitized HTML string for the economic context section
 */
export function buildEconomicContextHTML(context: EconomicContext): string {
  if (context.indicators.length === 0) {
    return '';
  }

  const rows = context.indicators
    .map(
      (ind) =>
        `<tr><td>${escapeHTML(ind.name)}</td><td>${escapeHTML(ind.formatted)}</td><td>${escapeHTML(String(ind.year))}</td></tr>`
    )
    .join('\n');

  return `<section class="economic-context" aria-label="Economic indicators for ${escapeHTML(context.countryName)}">
<h3>Economic Context: ${escapeHTML(context.countryName)}</h3>
<table>
<thead><tr><th>Indicator</th><th>Value</th><th>Year</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<p class="data-source">Source: World Bank Open Data</p>
</section>`;
}
