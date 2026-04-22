// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { escapeHTML } from './file-utils.js';
// ─── EU Member State → World Bank Country Code Mapping ───────────────────────
/**
 * Maps EU member state ISO 3166-1 alpha-2 codes to World Bank alpha-3 codes.
 * Covers all 27 EU member states.
 */
export const EU_COUNTRY_CODES = {
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
};
/**
 * EU aggregate code in World Bank (European Union).
 *
 * ⚠️ **Not accepted by `worldbank-mcp@1.0.1`** — the MCP server returns
 * `Error: Country not found` when this code is passed to any of
 * `get-country-info`, `get-economic-data`, `get-social-data`,
 * `get-health-data`, or `get-education-data`. The code is valid only
 * against the raw World Bank REST API.
 *
 * For EU-wide **economic** context (GDP, inflation, unemployment,
 * fiscal, trade), use the IMF client
 * (`src/mcp/imf-mcp-client.ts`) with IMF aggregate `EU` or `EA` — see
 * {@link IMF_AGGREGATE_LABELS} in `src/utils/imf-data.ts`.
 *
 * Retained as a constant for back-compatibility with raw-REST call paths
 * (e.g., `committee-indicator-map.ts`). Guard every MCP invocation with
 * {@link isMCPSupportedWBCountryCode} to avoid silent empty responses.
 */
export const EU_AGGREGATE_CODE = 'EUU';
/**
 * Comparison country codes for benchmarking EU performance against global peers.
 * Organized by geopolitical relevance to EU Parliament policy analysis.
 */
export const COMPARISON_COUNTRIES = {
    // ── G7 Non-EU ──
    US: 'USA', // United States
    GB: 'GBR', // United Kingdom (post-Brexit benchmark)
    JP: 'JPN', // Japan
    CA: 'CAN', // Canada
    // ── BRICS ──
    CN: 'CHN', // China
    IN: 'IND', // India
    BR: 'BRA', // Brazil
    RU: 'RUS', // Russia
    ZA: 'ZAF', // South Africa
    // ── EU Candidate States ──
    UA: 'UKR', // Ukraine
    TR: 'TUR', // Türkiye
    RS: 'SRB', // Serbia
    ME: 'MNE', // Montenegro
    AL: 'ALB', // Albania
    MK: 'MKD', // North Macedonia
    MD: 'MDA', // Moldova
    BA: 'BIH', // Bosnia & Herzegovina
    GE: 'GEO', // Georgia
    // ── Key Trade Partners ──
    KR: 'KOR', // South Korea
    AU: 'AUS', // Australia
    NO: 'NOR', // Norway (EEA)
    CH: 'CHE', // Switzerland (EFTA)
    IL: 'ISR', // Israel
};
/**
 * Aggregate/region codes useful for EU benchmarking via the raw World
 * Bank REST API.
 *
 * ⚠️ **Not accepted by `worldbank-mcp@1.0.1`** — every code in this
 * table is rejected by the MCP server with `Error: Country not found`.
 * The codes are valid only against the raw WB REST API
 * (`https://api.worldbank.org/v2/country/{code}/indicator/...`).
 *
 * For EU-aggregate **economic** queries, use the IMF client instead
 * (see `src/mcp/imf-mcp-client.ts` and `IMF_AGGREGATE_LABELS` in
 * `src/utils/imf-data.ts`). For non-economic EU-level context, build an
 * explicit country list (e.g., Big Four `DE`+`FR`+`IT`+`ES` as an
 * EU-GDP proxy) and query the MCP per-country.
 *
 * Always gate MCP calls with {@link isMCPSupportedWBCountryCode}.
 *
 * Keys are World Bank group codes; values are human-readable labels.
 */
export const WB_AGGREGATE_LABELS = {
    EUU: 'European Union',
    EMU: 'Euro area',
    OED: 'OECD members',
    WLD: 'World',
    ECS: 'Europe & Central Asia',
    NAC: 'North America',
    EAS: 'East Asia & Pacific',
    SSF: 'Sub-Saharan Africa',
};
/**
 * Set of aggregate codes that the `worldbank-mcp@1.0.1` server rejects.
 * Used by {@link isMCPSupportedWBCountryCode} as the primary denylist.
 *
 * Kept in sync with {@link WB_AGGREGATE_LABELS}; `as const` preserves the
 * literal-string type so consumers can narrow against known values.
 */
const WB_UNSUPPORTED_MCP_AGGREGATES = new Set([
    'EUU',
    'EMU',
    'OED',
    'WLD',
    'ECS',
    'NAC',
    'EAS',
    'SSF',
]);
/**
 * Set of informal country aliases that the `worldbank-mcp@1.0.1` server
 * rejects even though the underlying country is available under a
 * different code. E.g., the informal `UK` alias is rejected; use the
 * ISO 3166-1 alpha-2 code `GB` instead.
 */
const WB_UNSUPPORTED_MCP_ALIASES = new Set(['UK']);
/**
 * Guard: returns `true` if `code` is safe to pass to any
 * `worldbank-mcp@1.0.1` tool (`get-country-info`, `get-economic-data`,
 * `get-social-data`, `get-health-data`, `get-education-data`), and
 * `false` if the code would cause the MCP server to return
 * `Error: Country not found` — which is handled as an empty-data
 * fallback upstream and therefore fails silently.
 *
 * The guard accepts any 2-letter (ISO 3166-1 alpha-2) or 3-letter
 * (alpha-3) country code and rejects:
 *
 * - The 8 aggregate codes listed in {@link WB_AGGREGATE_LABELS}
 *   (`EUU`, `EMU`, `OED`, `WLD`, `ECS`, `NAC`, `EAS`, `SSF`). These
 *   work only against the raw WB REST API — use the IMF client for
 *   EU-aggregate economic context.
 * - The informal alias `UK` — use `GB` instead.
 * - Empty, non-string, or malformed inputs.
 *
 * The guard is case-insensitive: `'euu'` and `'EUU'` both return
 * `false`, `'de'` and `'DE'` both return `true`.
 *
 * @param code - Country code candidate
 * @returns `true` when the code is a per-country identifier accepted by the
 *   MCP server, `false` when it is an aggregate, an informal alias, or invalid
 *
 * @example
 * isMCPSupportedWBCountryCode('DE');   // → true
 * isMCPSupportedWBCountryCode('DEU');  // → true
 * isMCPSupportedWBCountryCode('EUU');  // → false (aggregate)
 * isMCPSupportedWBCountryCode('UK');   // → false (use 'GB')
 * isMCPSupportedWBCountryCode('');     // → false
 */
export function isMCPSupportedWBCountryCode(code) {
    if (typeof code !== 'string')
        return false;
    const trimmed = code.trim();
    if (trimmed.length !== 2 && trimmed.length !== 3)
        return false;
    if (!/^[A-Za-z]+$/u.test(trimmed))
        return false;
    const upper = trimmed.toUpperCase();
    if (WB_UNSUPPORTED_MCP_AGGREGATES.has(upper))
        return false;
    if (WB_UNSUPPORTED_MCP_ALIASES.has(upper))
        return false;
    return true;
}
/**
 * World Bank indicator IDs relevant to EU Parliament policy analysis.
 *
 * ⚠️ **AI Agents**: This is a convenience subset of 25 core indicators used by
 * TypeScript formatting code. The World Bank has **thousands** of indicators.
 * For article/analysis generation:
 * - Read `analysis/worldbank/indicator-catalog.md` for the full **200+ indicator** reference
 * - Use `search-indicators` MCP tool to discover indicators on demand by keyword
 * - See `analysis/worldbank/use-cases.md` for when each indicator type adds value
 */
export const POLICY_INDICATORS = {
    // Macro-economic (get-economic-data)
    gdp: 'NY.GDP.MKTP.CD',
    gdpGrowth: 'NY.GDP.MKTP.KD.ZG',
    gdpPerCapita: 'NY.GDP.PCAP.CD',
    gniPerCapita: 'NY.GNP.PCAP.CD',
    inflation: 'FP.CPI.TOTL.ZG',
    unemployment: 'SL.UEM.TOTL.ZS',
    exportsGdp: 'NE.EXP.GNFS.ZS',
    fdiNet: 'BN.KLT.DINV.CD',
    // Trade & fiscal
    trade: 'NE.TRD.GNFS.ZS',
    taxRevenue: 'GC.TAX.TOTL.GD.ZS',
    govExpenditure: 'NE.CON.GOVT.ZS',
    militaryExpenditure: 'MS.MIL.XPND.GD.ZS',
    // Social (get-social-data)
    population: 'SP.POP.TOTL',
    lifeExpectancy: 'SP.DYN.LE00.IN',
    birthRate: 'SP.DYN.CBRT.IN',
    deathRate: 'SP.DYN.CDRT.IN',
    internetUsers: 'IT.NET.USER.ZS',
    // Health (get-health-data)
    healthExpenditure: 'SH.XPD.CHEX.GD.ZS',
    physicians: 'SH.MED.PHYS.ZS',
    hospitalBeds: 'SH.MED.BEDS.ZS',
    // Education (get-education-data)
    educationExpenditure: 'SE.XPD.TOTL.GD.ZS',
    // Environment & energy
    co2Emissions: 'EN.ATM.CO2E.PC',
    renewableEnergy: 'EG.FEC.RNEW.ZS',
    // Research & innovation
    rdExpenditure: 'GB.XPD.RSDV.GD.ZS',
    hightechExports: 'TX.VAL.TECH.MF.ZS',
};
// ─── CSV Parsing ─────────────────────────────────────────────────────────────
/** Known CSV header aliases for each World Bank field */
const HEADER_ALIASES = {
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
function findColumnIndex(headers, aliases) {
    return headers.findIndex((h) => aliases.includes(h));
}
/**
 * Safely read a column value from a row.
 *
 * @param cols - Split row columns
 * @param idx - Column index (-1 means absent)
 * @returns Column value or empty string
 */
function readCol(cols, idx) {
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
function splitCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i] ?? '';
        if (ch === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                // RFC 4180 escaped quote: "" → literal "
                current += '"';
                i++; // skip the second quote
            }
            else {
                inQuotes = !inQuotes;
            }
        }
        else if (ch === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        }
        else {
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
export function parseWorldBankCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') {
        return [];
    }
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
        return [];
    }
    const headers = splitCSVLine(lines[0] ?? '').map((h) => h.toLowerCase());
    const colMap = Object.fromEntries(Object.entries(HEADER_ALIASES).map(([key, aliases]) => [key, findColumnIndex(headers, aliases)]));
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = splitCSVLine(lines[i] ?? '');
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
export function formatIndicatorValue(value, indicatorId) {
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
    if (indicatorId === POLICY_INDICATORS.gdpGrowth ||
        indicatorId === POLICY_INDICATORS.inflation ||
        indicatorId === POLICY_INDICATORS.unemployment ||
        indicatorId === POLICY_INDICATORS.trade ||
        indicatorId === POLICY_INDICATORS.taxRevenue ||
        indicatorId === POLICY_INDICATORS.govExpenditure ||
        indicatorId === POLICY_INDICATORS.militaryExpenditure ||
        indicatorId === POLICY_INDICATORS.exportsGdp ||
        indicatorId === POLICY_INDICATORS.healthExpenditure ||
        indicatorId === POLICY_INDICATORS.educationExpenditure ||
        indicatorId === POLICY_INDICATORS.internetUsers ||
        indicatorId === POLICY_INDICATORS.renewableEnergy ||
        indicatorId === POLICY_INDICATORS.rdExpenditure ||
        indicatorId === POLICY_INDICATORS.hightechExports) {
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
export function getMostRecentValue(indicators) {
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
export function buildEconomicContext(countryCode, countryName, indicatorData) {
    const indicators = [];
    const indicatorNames = {
        [POLICY_INDICATORS.gdp]: 'GDP',
        [POLICY_INDICATORS.gdpGrowth]: 'GDP Growth',
        [POLICY_INDICATORS.gdpPerCapita]: 'GDP per Capita',
        [POLICY_INDICATORS.gniPerCapita]: 'GNI per Capita',
        [POLICY_INDICATORS.inflation]: 'Inflation',
        [POLICY_INDICATORS.unemployment]: 'Unemployment',
        [POLICY_INDICATORS.exportsGdp]: 'Exports (% of GDP)',
        [POLICY_INDICATORS.fdiNet]: 'FDI Net Inflows',
        [POLICY_INDICATORS.trade]: 'Trade (% of GDP)',
        [POLICY_INDICATORS.taxRevenue]: 'Tax Revenue (% of GDP)',
        [POLICY_INDICATORS.govExpenditure]: 'Gov. Expenditure (% of GDP)',
        [POLICY_INDICATORS.militaryExpenditure]: 'Military Expenditure (% of GDP)',
        [POLICY_INDICATORS.population]: 'Population',
        [POLICY_INDICATORS.lifeExpectancy]: 'Life Expectancy',
        [POLICY_INDICATORS.birthRate]: 'Birth Rate',
        [POLICY_INDICATORS.deathRate]: 'Death Rate',
        [POLICY_INDICATORS.internetUsers]: 'Internet Users (%)',
        [POLICY_INDICATORS.healthExpenditure]: 'Health Expenditure (% of GDP)',
        [POLICY_INDICATORS.physicians]: 'Physicians (per 1,000)',
        [POLICY_INDICATORS.hospitalBeds]: 'Hospital Beds (per 1,000)',
        [POLICY_INDICATORS.educationExpenditure]: 'Education Expenditure (% of GDP)',
        [POLICY_INDICATORS.co2Emissions]: 'CO₂ Emissions',
        [POLICY_INDICATORS.renewableEnergy]: 'Renewable Energy (%)',
        [POLICY_INDICATORS.rdExpenditure]: 'R&D Expenditure (% of GDP)',
        [POLICY_INDICATORS.hightechExports]: 'High-Tech Exports (%)',
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
export function getWorldBankCountryCode(iso2Code) {
    const upper = iso2Code.toUpperCase();
    return EU_COUNTRY_CODES[upper] ?? null;
}
/**
 * Check if a country code corresponds to an EU member state.
 *
 * @param iso2Code - ISO 3166-1 alpha-2 country code
 * @returns True if the country is an EU member state
 */
export function isEUMemberState(iso2Code) {
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
export function buildEconomicContextHTML(context) {
    if (context.indicators.length === 0) {
        return '';
    }
    const rows = context.indicators
        .map((ind) => `<tr><td>${escapeHTML(ind.name)}</td><td>${escapeHTML(ind.formatted)}</td><td>${escapeHTML(String(ind.year))}</td></tr>`)
        .join('\n');
    return `<section class="economic-context" aria-label="Economic indicators for ${escapeHTML(context.countryName)}">
<h2>Economic Context: ${escapeHTML(context.countryName)}</h2>
<table>
<caption>Economic indicators for ${escapeHTML(context.countryName)}</caption>
<thead><tr><th scope="col">Indicator</th><th scope="col">Value</th><th scope="col">Year</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<p class="data-source">Source: World Bank Open Data</p>
</section>`;
}
//# sourceMappingURL=world-bank-data.js.map