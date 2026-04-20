// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/IMFData
 * @description Utility functions for IMF economic data integration.
 *
 * Provides EU member state → IMF country code mapping (mostly the same
 * ISO-3166-1 alpha-3 codes as the World Bank, with a few diffs flagged
 * in `IMF_COUNTRY_CODE_OVERRIDES`), SDMX-JSON response parsing,
 * indicator formatting with forecast awareness, and the
 * `IMFEconomicContext` builder for EU Parliament article enrichment.
 *
 * Functions in this module are designed to be stateless and avoid
 * observable side effects, matching the pattern established by
 * `world-bank-data.ts`. A raw IMF SDMX response may include attribute
 * flags (`OBS_STATUS=F` for forecast), multi-dimensional keyed
 * observations, and partial data — see {@link parseSDMXJSON} for the
 * normalisation rules.
 *
 * ## ⚠️ For AI Agents / Agentic Workflows
 *
 * The constants below ({@link IMF_POLICY_INDICATORS}, {@link IMF_EU_COUNTRY_CODES})
 * are a **convenience subset** used by TypeScript code for formatting
 * and parsing. They do **NOT** represent the full IMF database
 * inventory. For indicator selection in articles and analysis:
 *
 * 1. Read `analysis/methodologies/imf-indicator-mapping.md` — canonical
 *    committee → IMF indicator mapping enforced by the validator.
 * 2. Read `analysis/imf/indicator-catalog.md` — IMF WEO/IFS/FM/BOP/ER
 *    indicators by EP policy domain.
 * 3. Use `imf-search-databases` / `imf-get-parameter-codes` to discover
 *    additional series on demand.
 */

import type {
  IMFDatabaseId,
  IMFEconomicContext,
  IMFEconomicIndicatorSummary,
  IMFForecastPoint,
  IMFFrequency,
  IMFMacroIndicatorKey,
  IMFObservation,
  IMFPolicyIndicatorMapping,
  IMFSeries,
} from '../types/imf.js';
import { escapeHTML } from './file-utils.js';

// ─── EU Member State → IMF Country Code Mapping ───────────────────────────────

/**
 * Maps EU member state ISO 3166-1 alpha-2 codes to IMF country codes.
 *
 * The IMF SDMX 3.0 API uses ISO-3166-1 alpha-3 codes for every EU
 * member state, which matches the World Bank code set exactly. This
 * constant is kept as a standalone copy (rather than re-exporting
 * `EU_COUNTRY_CODES` from `world-bank-data.ts`) so the IMF module
 * remains self-contained and so future IMF-specific overrides
 * (e.g. Kosovo = `UVK` at IMF vs. `XKX` at WB) can land without
 * disturbing the World Bank map.
 */
export const IMF_EU_COUNTRY_CODES: Readonly<Record<string, string>> = {
  AT: 'AUT',
  BE: 'BEL',
  BG: 'BGR',
  HR: 'HRV',
  CY: 'CYP',
  CZ: 'CZE',
  DK: 'DNK',
  EE: 'EST',
  FI: 'FIN',
  FR: 'FRA',
  DE: 'DEU',
  GR: 'GRC',
  HU: 'HUN',
  IE: 'IRL',
  IT: 'ITA',
  LV: 'LVA',
  LT: 'LTU',
  LU: 'LUX',
  MT: 'MLT',
  NL: 'NLD',
  PL: 'POL',
  PT: 'PRT',
  RO: 'ROU',
  SK: 'SVK',
  SI: 'SVN',
  ES: 'ESP',
  SE: 'SWE',
} as const;

/**
 * IMF-specific country-code overrides — cases where the IMF's codelist
 * differs from the World Bank's. Keep this documented explicitly so
 * the drift surface stays visible in one place.
 */
export const IMF_COUNTRY_CODE_OVERRIDES: Readonly<Record<string, string>> = {
  // Kosovo: WB uses XKX, IMF uses UVK on some datasets; add more entries here as drift is discovered.
  XK: 'UVK',
} as const;

/** IMF aggregate code for the Euro Area (most widely used EU aggregation on WEO). */
export const IMF_EURO_AREA_CODE = 'EA19'; // Historical; `EA` covers the current membership.

/**
 * IMF aggregate labels used in EU Parliament article headings.
 */
export const IMF_AGGREGATE_LABELS: Readonly<Record<string, string>> = {
  EU: 'European Union',
  EA: 'Euro Area',
  EA19: 'Euro Area (19 members)',
  OECD: 'OECD members',
  WLD: 'World',
  G7: 'G7',
  G20: 'G20',
} as const;

/**
 * Curated IMF indicator mapping — policy-relevant macro/fiscal/trade
 * series that the EU Parliament Monitor uses across article types.
 *
 * Keyed by the stable {@link IMFMacroIndicatorKey} so prompts and
 * templates reference semantic names ("gdpGrowth", "govDebt") rather
 * than raw SDMX codes. When an indicator has forecasts in WEO/FM,
 * `hasForecast` is `true` and the default query horizon should extend
 * to at least `currentYear + 5`.
 */
export const IMF_POLICY_INDICATORS: Readonly<
  Record<IMFMacroIndicatorKey, IMFPolicyIndicatorMapping>
> = {
  gdp: { database: 'WEO', indicator: 'NGDPD', frequency: 'A', label: 'GDP (current USD)', hasForecast: true },
  gdpGrowth: {
    database: 'WEO',
    indicator: 'NGDP_RPCH',
    frequency: 'A',
    label: 'Real GDP growth',
    hasForecast: true,
  },
  gdpPerCapita: {
    database: 'WEO',
    indicator: 'NGDPDPC',
    frequency: 'A',
    label: 'GDP per capita (current USD)',
    hasForecast: true,
  },
  inflation: {
    database: 'WEO',
    indicator: 'PCPIPCH',
    frequency: 'A',
    label: 'Consumer price inflation',
    hasForecast: true,
  },
  unemployment: {
    database: 'WEO',
    indicator: 'LUR',
    frequency: 'A',
    label: 'Unemployment rate',
    hasForecast: true,
  },
  population: {
    database: 'WEO',
    indicator: 'LP',
    frequency: 'A',
    label: 'Population (millions)',
    hasForecast: true,
  },
  currentAccount: {
    database: 'WEO',
    indicator: 'BCA_NGDPD',
    frequency: 'A',
    label: 'Current account balance (% of GDP)',
    hasForecast: true,
  },
  exportsGdp: {
    database: 'WEO',
    indicator: 'TX_RPCH',
    frequency: 'A',
    label: 'Export volume growth',
    hasForecast: true,
  },
  govDebt: {
    database: 'FM',
    indicator: 'GGXWDG_NGDP',
    frequency: 'A',
    label: 'General government gross debt (% of GDP)',
    hasForecast: true,
  },
  primaryBalance: {
    database: 'FM',
    indicator: 'GGXONLB_NGDP',
    frequency: 'A',
    label: 'Primary balance (% of GDP)',
    hasForecast: true,
  },
  structuralBalance: {
    database: 'FM',
    indicator: 'GGSB_NPGDP',
    frequency: 'A',
    label: 'Structural balance (% of potential GDP)',
    hasForecast: true,
  },
  fdiInflow: {
    database: 'BOP_AGG',
    indicator: 'BFD_BP6_USD',
    frequency: 'Q',
    label: 'FDI inflow (BoP, current USD)',
    hasForecast: false,
  },
  realEffectiveExchangeRate: {
    database: 'ER',
    indicator: 'EREER_IX',
    frequency: 'M',
    label: 'Real effective exchange rate',
    hasForecast: false,
  },
  policyRate: {
    database: 'IFS',
    indicator: 'FPOLM_PA',
    frequency: 'M',
    label: 'Monetary policy rate',
    hasForecast: false,
  },
};

/**
 * Short indicator codes — the single source of truth for the content
 * validator's IMF fingerprints list. Derived from the SDMX codes in
 * {@link IMF_POLICY_INDICATORS}. Consumers should prefer this constant
 * over hand-rolled string lists so validator drift is impossible.
 */
export const IMF_INDICATOR_SDMX_CODES: readonly string[] = Array.from(
  new Set(Object.values(IMF_POLICY_INDICATORS).map((m) => m.indicator))
);

// ─── Country Code Lookup ───────────────────────────────────────────────────────

/**
 * Resolve an ISO 3166-1 alpha-2 code to the IMF country code.
 *
 * Applies {@link IMF_COUNTRY_CODE_OVERRIDES} first so IMF-specific
 * overrides win, then falls back to the EU alpha-3 map, then returns
 * `null` when the code is not recognised.
 *
 * @param iso2Code - Country ISO 3166-1 alpha-2 code (case-insensitive).
 * @returns IMF country code or `null`.
 */
export function getIMFCountryCode(iso2Code: string): string | null {
  if (!iso2Code) return null;
  const upper = iso2Code.toUpperCase();
  const override = IMF_COUNTRY_CODE_OVERRIDES[upper];
  if (override) return override;
  return IMF_EU_COUNTRY_CODES[upper] ?? null;
}

/**
 * Check whether `iso2Code` is one of the 27 EU member states covered
 * by the IMF codelist.
 *
 * @param iso2Code - Country ISO 3166-1 alpha-2 code.
 * @returns `true` when the code maps to an EU member state.
 */
export function isIMFEUMemberState(iso2Code: string): boolean {
  if (!iso2Code) return false;
  return iso2Code.toUpperCase() in IMF_EU_COUNTRY_CODES;
}

// ─── SDMX-JSON Parser ─────────────────────────────────────────────────────────

/**
 * Narrowed shape of an SDMX-JSON 2.0 / 3.0 data response. The IMF API
 * returns `dataSets[0].series` keyed by concatenated dimension indices
 * with an `observations` map. We only consume the fields we need so
 * new SDMX attributes (reserved by future IMF releases) are ignored
 * silently rather than raising parse errors.
 */
interface SDMXJSONResponse {
  data?: {
    dataSets?: Array<{
      series?: Record<string, { observations?: Record<string, Array<number | string | null>> }>;
    }>;
    structure?: {
      dimensions?: {
        series?: Array<{
          id: string;
          values?: Array<{ id: string; name?: string }>;
        }>;
        observation?: Array<{
          id: string;
          values?: Array<{ id: string; name?: string }>;
        }>;
      };
      attributes?: {
        observation?: Array<{
          id: string;
          values?: Array<{ id: string; name?: string }>;
        }>;
      };
    };
  };
}

/**
 * Return `true` when the raw SDMX observation attributes flag the
 * observation as a forecast (`OBS_STATUS=F`) — the IMF convention.
 * Tolerates missing/partial attribute arrays so malformed responses
 * simply default to `isForecast=false`.
 *
 * @param obsAttributes - Attribute values for the observation (the
 *   slice after the observation value in the SDMX `observations` array).
 * @param obsStatusAttributeIndex - Position of `OBS_STATUS` in the
 *   observation-attribute structure (or `-1` when absent).
 * @param forecastCodeIndex - Position of the `F` code in the
 *   `OBS_STATUS` code list (or `-1` when absent).
 * @returns `true` when the observation is flagged as a forecast.
 * @internal
 */
function observationIsForecast(
  obsAttributes: ReadonlyArray<number | string | null> | undefined,
  obsStatusAttributeIndex: number,
  forecastCodeIndex: number
): boolean {
  if (!obsAttributes) return false;
  if (obsStatusAttributeIndex < 0) return false;
  const flag = obsAttributes[obsStatusAttributeIndex];
  if (flag === null || flag === undefined) return false;
  // The IMF SDMX response encodes attribute values either as the code
  // index (numeric) or the literal code string. `F` → forecast.
  if (typeof flag === 'number') {
    return flag === forecastCodeIndex;
  }
  return String(flag).toUpperCase() === 'F';
}

/**
 * Deserialise a raw SDMX payload (string or already-parsed object)
 * into a typed {@link SDMXJSONResponse}. Returns `null` when the
 * payload is missing, empty, or not valid JSON.
 *
 * @param raw - Raw payload.
 * @returns Parsed object or `null`.
 * @internal
 */
function deserialiseSDMXPayload(
  raw: string | SDMXJSONResponse | null | undefined
): SDMXJSONResponse | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as SDMXJSONResponse;
    } catch {
      return null;
    }
  }
  return raw;
}

/**
 * Context extracted once per response: the time-label map and the
 * precomputed OBS_STATUS attribute indexes used to detect forecasts.
 *
 * @internal
 */
interface SDMXDecodingContext {
  timeLabels: ReadonlyArray<{ id: string; name?: string }>;
  obsStatusAttrIndex: number;
  forecastCodeIndex: number;
}

/**
 * Build the one-response decoding context: time labels and the
 * OBS_STATUS attribute indexes.
 *
 * @param structure - `structure` block of the SDMX payload.
 * @returns Decoding context used by {@link decodeObservations}.
 * @internal
 */
function buildDecodingContext(
  structure: NonNullable<NonNullable<SDMXJSONResponse['data']>['structure']>
): SDMXDecodingContext {
  const timeDimension = structure.dimensions?.observation?.[0];
  const timeLabels = timeDimension?.values ?? [];
  const obsAttributes = structure.attributes?.observation ?? [];
  const obsStatusAttrIndex = obsAttributes.findIndex((a) => a.id === 'OBS_STATUS');
  const forecastCodeIndex =
    obsStatusAttrIndex >= 0
      ? (obsAttributes[obsStatusAttrIndex]?.values ?? []).findIndex(
          (v) => v.id.toUpperCase() === 'F'
        )
      : -1;
  return { timeLabels, obsStatusAttrIndex, forecastCodeIndex };
}

/**
 * Coerce a raw SDMX observation cell to a finite number or `null`.
 *
 * @param rawValue - First element of the SDMX observation array.
 * @returns Number or `null`.
 * @internal
 */
function coerceObservationValue(rawValue: unknown): number | null {
  if (rawValue === null || rawValue === undefined || rawValue === '') return null;
  const n = typeof rawValue === 'number' ? rawValue : Number(rawValue);
  return Number.isFinite(n) ? n : null;
}

/**
 * Decode every observation within a single SDMX series into the
 * normalised {@link IMFObservation} shape.
 *
 * @param seriesObservations - `observations` map keyed by observation index.
 * @param ctx - Decoding context from {@link buildDecodingContext}.
 * @returns Ordered array of normalised observations.
 * @internal
 */
function decodeObservations(
  seriesObservations: Record<string, Array<number | string | null>>,
  ctx: SDMXDecodingContext
): IMFObservation[] {
  const out: IMFObservation[] = [];
  for (const [obsIdx, obsArr] of Object.entries(seriesObservations)) {
    const timeIdx = Number.parseInt(obsIdx, 10);
    const labelEntry = Number.isFinite(timeIdx) ? ctx.timeLabels[timeIdx] : undefined;
    const period = labelEntry?.id ?? String(obsIdx);
    const year = parsePeriodYear(period);
    if (year === null) continue;
    const arr = Array.isArray(obsArr) ? obsArr : [];
    const value = coerceObservationValue(arr[0]);
    const attrs = arr.slice(1);
    out.push({
      period,
      year,
      value,
      isForecast: observationIsForecast(attrs, ctx.obsStatusAttrIndex, ctx.forecastCodeIndex),
    });
  }
  out.sort((a, b) => a.period.localeCompare(b.period));
  return out;
}

/**
 * Parse an SDMX-JSON response into a map of series key → ordered
 * observations.
 *
 * This parser is intentionally tolerant: missing observations,
 * attribute arrays, or structure blocks all degrade to an empty result
 * rather than throwing. That lets the caller pipeline treat a broken
 * response as "no data" and fall through to a World Bank fallback.
 *
 * @param raw - Raw SDMX-JSON payload as returned by the IMF MCP server
 *   (accepts string, object, null, or undefined).
 * @returns Map of series key → ordered observations.
 */
export function parseSDMXJSON(
  raw: string | SDMXJSONResponse | null | undefined
): Map<string, IMFObservation[]> {
  const result = new Map<string, IMFObservation[]>();
  const payload = deserialiseSDMXPayload(raw);
  if (!payload) return result;
  const dataSet = payload.data?.dataSets?.[0];
  const structure = payload.data?.structure;
  const series = dataSet?.series;
  if (!series || !structure) return result;
  const ctx = buildDecodingContext(structure);
  for (const [seriesKey, seriesPayload] of Object.entries(series)) {
    const obs = seriesPayload.observations ?? {};
    result.set(seriesKey, decodeObservations(obs, ctx));
  }
  return result;
}

/**
 * Extract the year component from an IMF period label. Supports
 * annual (`2026`), quarterly (`2026-Q1`), and monthly (`2026-04`)
 * formats. Returns `null` when the label is unparseable so callers
 * can skip corrupt rows.
 *
 * @param period - Period label (e.g. `"2026"`, `"2026-Q1"`, `"2026-04"`).
 * @returns Numeric year or `null`.
 * @internal
 */
function parsePeriodYear(period: string): number | null {
  if (!period) return null;
  const match = /^(\d{4})/u.exec(period);
  if (!match) return null;
  const year = Number.parseInt(match[1] ?? '', 10);
  return Number.isFinite(year) ? year : null;
}

// ─── Series / Observation Helpers ─────────────────────────────────────────────

/**
 * Extract the most recent observation (by year) from a series,
 * preferring published actuals over forecasts when both are present
 * for the same latest year.
 *
 * Returns `null` when the series contains only null values or is empty.
 *
 * @param observations - Series observations (in any order).
 * @returns Most recent observation with a non-null value, or `null`.
 */
export function getMostRecentObservation(
  observations: readonly IMFObservation[]
): IMFObservation | null {
  if (observations.length === 0) return null;
  const withValues = observations.filter((o) => o.value !== null);
  if (withValues.length === 0) return null;
  withValues.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    // Prefer actual (isForecast=false) over forecast at the same year.
    if (a.isForecast !== b.isForecast) return a.isForecast ? 1 : -1;
    return b.period.localeCompare(a.period);
  });
  return withValues[0] ?? null;
}

/**
 * Return just the forecast points from a series, oldest first.
 * Useful for Chart.js dashed-line overlays.
 *
 * @param observations - Series observations.
 * @param vintage - Optional IMF vintage label to stamp on each point.
 * @returns Ordered forecast points.
 */
export function getForecastPoints(
  observations: readonly IMFObservation[],
  vintage?: string
): IMFForecastPoint[] {
  return observations
    .filter((o) => o.isForecast && o.value !== null)
    .map((o) => {
      const point: IMFForecastPoint = {
        period: o.period,
        year: o.year,
        value: o.value as number,
      };
      if (vintage !== undefined) {
        point.vintage = vintage;
      }
      return point;
    })
    .sort((a, b) => a.year - b.year);
}

// ─── Value Formatting ────────────────────────────────────────────────────────

/** Magnitude threshold for trillion formatting. */
const TRILLION = 1e12;
/** Magnitude threshold for billion formatting. */
const BILLION = 1e9;
/** Magnitude threshold for million formatting. */
const MILLION = 1e6;

/**
 * Format a numeric IMF value for display, based on the indicator
 * mapping's label hints.
 *
 * Percentage-family indicators render as `X.Y %`; GDP renders with
 * the T/B/M magnitude suffix; population renders in millions to
 * match the WEO publication convention. Unknown indicators fall back
 * to two decimal places.
 *
 * @param value - Numeric value, or `null` for N/A.
 * @param mapping - Indicator mapping entry (from {@link IMF_POLICY_INDICATORS}).
 */
export function formatIMFValue(
  value: number | null,
  mapping: IMFPolicyIndicatorMapping
): string {
  if (value === null || !Number.isFinite(value)) return 'N/A';
  const label = mapping.label.toLowerCase();
  if (label.includes('% of gdp') || label.includes('growth') || label.includes('inflation') || label.includes('unemployment')) {
    return `${value.toFixed(1)}%`;
  }
  if (label.includes('gdp') && !label.includes('per capita')) {
    const abs = Math.abs(value);
    if (abs >= TRILLION) return `$${(value / TRILLION).toFixed(1)}T`;
    if (abs >= BILLION) return `$${(value / BILLION).toFixed(1)}B`;
    if (abs >= MILLION) return `$${(value / MILLION).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
  }
  if (label.includes('population')) {
    return `${value.toFixed(1)}M`;
  }
  if (label.includes('exchange rate') || label.includes('policy rate')) {
    return value.toFixed(2);
  }
  return value.toFixed(2);
}

// ─── Economic Context Builder ─────────────────────────────────────────────────

/**
 * Build an {@link IMFEconomicContext} from an indexed series map.
 *
 * Each entry in `seriesByKey` should be keyed by the {@link IMFMacroIndicatorKey}
 * so the builder can look up the mapping and produce a stable display row.
 * Rows with no observations are skipped silently. When ANY indicator
 * carries a forecast, `forecastHorizonYear` is set to the maximum
 * forecast year so the caller can render a dashed overlay region
 * starting from that year.
 *
 * @param countryCode - EU member state ISO2 code or IMF aggregate code.
 * @param countryName - Country display name.
 * @param seriesByKey - Map of {@link IMFMacroIndicatorKey} to series.
 * @param vintage - IMF data vintage label (e.g. `WEO-April-2026`).
 */
export function buildIMFEconomicContext(
  countryCode: string,
  countryName: string,
  seriesByKey: ReadonlyMap<IMFMacroIndicatorKey, IMFSeries>,
  vintage?: string
): IMFEconomicContext {
  const indicators: IMFEconomicIndicatorSummary[] = [];
  let forecastHorizonYear: number | undefined;

  for (const [key, series] of seriesByKey) {
    const mapping = IMF_POLICY_INDICATORS[key];
    if (!mapping) continue;
    const latest = getMostRecentObservation(series.observations);
    if (!latest) continue;
    const row: IMFEconomicIndicatorSummary = {
      name: mapping.label,
      indicatorId: mapping.indicator,
      database: mapping.database,
      value: latest.value,
      period: latest.period,
      year: latest.year,
      isForecast: latest.isForecast,
      formatted: formatIMFValue(latest.value, mapping),
    };
    if (vintage !== undefined) {
      row.vintage = vintage;
    }
    indicators.push(row);

    const forecasts = series.observations.filter((o) => o.isForecast);
    for (const f of forecasts) {
      if (forecastHorizonYear === undefined || f.year > forecastHorizonYear) {
        forecastHorizonYear = f.year;
      }
    }
  }

  const context: IMFEconomicContext = {
    countryCode,
    countryName,
    indicators,
    dataTimestamp: new Date().toISOString(),
  };
  if (forecastHorizonYear !== undefined) {
    context.forecastHorizonYear = forecastHorizonYear;
  }
  return context;
}

// ─── HTML Context Section ─────────────────────────────────────────────────────

/**
 * Build a WCAG-compliant HTML `<section>` summarising the IMF
 * economic context for a single country.
 *
 * Forecast rows are marked with a `data-forecast="true"` attribute on
 * the `<tr>` so CSS/Chart.js can visually differentiate them from
 * actuals. Source attribution cites the IMF WEO/FM vintage when
 * available. Safe against XSS via `escapeHTML`.
 *
 * @param context - Economic context payload.
 */
export function buildIMFEconomicContextHTML(context: IMFEconomicContext): string {
  if (context.indicators.length === 0) return '';
  const rows = context.indicators
    .map((ind) => {
      const forecastAttr = ind.isForecast ? ' data-forecast="true"' : '';
      const forecastLabel = ind.isForecast ? ' <span class="forecast-flag">(forecast)</span>' : '';
      const vintageCell = ind.vintage ? `<td>${escapeHTML(ind.vintage)}</td>` : '<td></td>';
      return `<tr${forecastAttr}><td>${escapeHTML(ind.name)}${forecastLabel}</td><td>${escapeHTML(ind.formatted)}</td><td>${escapeHTML(ind.period)}</td>${vintageCell}</tr>`;
    })
    .join('\n');

  const horizonNote = context.forecastHorizonYear
    ? ` <span class="forecast-horizon">Projections extend through ${escapeHTML(String(context.forecastHorizonYear))}.</span>`
    : '';

  return `<section class="economic-context imf-economic-context" aria-label="IMF economic indicators for ${escapeHTML(context.countryName)}">
<h2>Economic Context (IMF): ${escapeHTML(context.countryName)}</h2>
<table>
<caption>IMF economic indicators for ${escapeHTML(context.countryName)}.${horizonNote}</caption>
<thead><tr><th scope="col">Indicator</th><th scope="col">Value</th><th scope="col">Period</th><th scope="col">Vintage</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
<p class="data-source">Source: IMF (<a href="https://data.imf.org/" rel="noopener noreferrer">data.imf.org</a>)</p>
</section>`;
}

// ─── Type Re-Exports (convenience) ────────────────────────────────────────────

export type {
  IMFDatabaseId,
  IMFEconomicContext,
  IMFEconomicIndicatorSummary,
  IMFForecastPoint,
  IMFFrequency,
  IMFMacroIndicatorKey,
  IMFObservation,
  IMFPolicyIndicatorMapping,
  IMFSeries,
};
