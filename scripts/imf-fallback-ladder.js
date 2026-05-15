#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/imf-fallback-ladder
 * @description IMF economic data fallback ladder for EU Parliament Monitor.
 *
 * Implements a four-rung fallback strategy for IMF economic-context data:
 *
 *   Rung 1 — IMF SDMX 3.0 REST API (`api.imf.org/external/sdmx/3.0`)
 *   Rung 2 — IMF WEO DataMapper REST API (`imf.org/external/datamapper/api/v1`)
 *   Rung 3 — World Bank API country-level aggregation (EU27 proxy sum)
 *   Rung 4 — Cached IMF WEO vintage snapshot from prior run
 *
 * Each rung is tried in order. The first rung that returns usable data wins.
 * The output JSON includes a `provenance` map recording which rung supplied
 * each field, so downstream analysis can cite the data source accurately.
 *
 * Output: `<outputDir>/economic-context-data.json`
 *
 * Invocation:
 *   node scripts/imf-fallback-ladder.js \
 *     --output-dir analysis/daily/2026-05-14/breaking/data \
 *     [--run-id breaking-run-1234] \
 *     [--cache-dir analysis/daily/2026-05-14/breaking/cache/imf] \
 *     [--vintage-file path/to/cached-weo.json]
 *
 * Exports (for unit testing):
 *   tryImfSdmx(options)
 *   tryImfDataMapper(options)
 *   tryWorldBank(options)
 *   tryCache(cacheFile)
 *   runFallbackLadder(outputDir, options)
 *   buildEconomicContextPayload(data, provenance, rung)
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default IMF SDMX 3.0 base URL. */
const IMF_SDMX_BASE = 'https://api.imf.org/external/sdmx/3.0';

/** IMF DataMapper API base URL (lighter alternative to SDMX 3.0). */
const IMF_DATAMAPPER_BASE = 'https://www.imf.org/external/datamapper/api/v1';

/** World Bank API base URL for country-level indicators. */
const WORLD_BANK_API_BASE = 'https://api.worldbank.org/v2';

/** All EU27 member state ISO-3166-1 alpha-3 codes for World Bank proxy aggregation. */
const EU_PROXY_COUNTRIES = [
  'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA',
  'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD',
  'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE',
];

/** World Bank indicator → IMF indicator mapping. */
const WB_TO_IMF_INDICATOR = {
  'NY.GDP.MKTP.KD.ZG': 'NGDP_RPCH',
  'FP.CPI.TOTL.ZG': 'PCPIPCH',
};

/** IMF DataMapper indicators to fetch. */
const IMF_DATAMAPPER_INDICATORS = ['NGDP_RPCH', 'PCPIPCH', 'GGXCNL_NGDP', 'LUR', 'BCA_NGDPD'];

/** Target IMF area code for Euro Area. */
const IMF_EURO_AREA = 'EAQ';

/** Request timeout in milliseconds. */
const FETCH_TIMEOUT_MS = 30_000;

/** Output filename. */
const OUTPUT_FILENAME = 'economic-context-data.json';

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a URL with a timeout and return the JSON-parsed body.
 *
 * @param {string} url
 * @param {{ fetchImpl?: Function, timeoutMs?: number, headers?: Record<string,string> }} [options]
 * @returns {Promise<{ok: boolean, status: number, data: unknown}>}
 */
async function fetchJson(url, options = {}) {
  const fetchFn = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetchFn(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json, */*;q=0.8',
        'User-Agent': 'euparliamentmonitor/0.9.0 (+https://github.com/Hack23/euparliamentmonitor)',
        ...options.headers,
      },
    });

    if (!resp.ok) {
      return { ok: false, status: resp.status, data: null };
    }

    const text = await resp.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    return { ok: true, status: resp.status, data };
  } catch (err) {
    const isAbort = err && err.name === 'AbortError';
    return { ok: false, status: isAbort ? 408 : 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Rung 1 — IMF SDMX 3.0
// ---------------------------------------------------------------------------

/**
 * Try to fetch GDP growth and inflation data for the Euro Area from IMF SDMX 3.0.
 *
 * @param {{ fetchImpl?: Function, baseUrl?: string }} [options]
 * @returns {Promise<{data: EconomicData|null, provenance: string}>}
 */
export async function tryImfSdmx(options = {}) {
  const baseUrl = options.baseUrl ?? IMF_SDMX_BASE;
  const query = `data/dataflow/IMF.RES/WEO/+/${IMF_EURO_AREA}.NGDP_RPCH+PCPIPCH+GGXCNL_NGDP.A?startPeriod=2024&endPeriod=2027&format=jsondata`;
  const url = `${baseUrl}/${query}`;

  // IMF SDMX 3.0 requires Ocp-Apim-Subscription-Key since 2025
  const headers = {};
  const primaryKey = process.env.IMF_API_PRIMARY_KEY;
  const secondaryKey = process.env.IMF_API_SECONDARY_KEY;
  if (primaryKey) {
    headers['Ocp-Apim-Subscription-Key'] = primaryKey;
  } else if (secondaryKey) {
    headers['Ocp-Apim-Subscription-Key'] = secondaryKey;
  }

  const result = await fetchJson(url, { fetchImpl: options.fetchImpl, headers });

  if (!result.ok || !result.data) {
    return { data: null, provenance: `imf-sdmx:unavailable(${result.status})` };
  }

  const extracted = _extractSdmxObservations(result.data);
  if (!extracted || Object.keys(extracted).length === 0) {
    return { data: null, provenance: 'imf-sdmx:no-observations' };
  }

  return { data: extracted, provenance: 'imf-sdmx-3.0' };
}

/**
 * Extract observations from an SDMX JSON data response into a flat map.
 *
 * @param {unknown} payload - Parsed SDMX JSON
 * @returns {Record<string, number|null>|null}
 */
function _extractSdmxObservations(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const result = {};

  const sdmxData = /** @type {any} */ (payload).data;
  if (!sdmxData) return null;

  const dataSets = Array.isArray(sdmxData.dataSets) ? sdmxData.dataSets : [];
  const structure = sdmxData.structure;
  const dimensions = structure?.dimensions ?? {};

  // Build dimension value lookups from structure metadata
  const seriesDims = Array.isArray(dimensions.series) ? dimensions.series : [];
  const obsDims = Array.isArray(dimensions.observation) ? dimensions.observation : [];

  // Find the INDICATOR dimension (could be in series or observation dims)
  const indicatorDim = seriesDims.find((d) => d.id === 'INDICATOR') ??
    obsDims.find((d) => d.id === 'INDICATOR');
  const indicatorValues = indicatorDim?.values ?? [];

  // Find the TIME_PERIOD dimension (typically in observation dims)
  const timeDim = obsDims.find((d) => d.id === 'TIME_PERIOD') ??
    seriesDims.find((d) => d.id === 'TIME_PERIOD');
  const timeValues = timeDim?.values ?? [];

  for (const dataSet of dataSets) {
    // Handle flat observations format (key = colon-separated dimension indices)
    const observations = dataSet?.observations ?? {};
    for (const [key, value] of Object.entries(observations)) {
      const parts = key.split(':');
      const indicatorIdx = parseInt(parts[2] ?? '0', 10);
      const periodIdx = parseInt(parts[parts.length - 1] ?? '0', 10);
      const obsValue = Array.isArray(value) ? value[0] : null;

      const indicatorName = indicatorValues[indicatorIdx]?.id ?? `indicator_${indicatorIdx}`;
      const periodName = timeValues[periodIdx]?.id ?? `period_${periodIdx}`;

      if (typeof obsValue === 'number') {
        if (!result[indicatorName]) result[indicatorName] = {};
        result[indicatorName][periodName] = obsValue;
      }
    }

    // Handle series-based format (series key encodes dimension indices)
    const series = dataSet?.series ?? {};
    for (const [seriesKey, seriesData] of Object.entries(series)) {
      const seriesParts = seriesKey.split(':');
      // Find indicator index — typically the position matching the INDICATOR dim
      const indicatorDimPos = seriesDims.findIndex((d) => d.id === 'INDICATOR');
      const indicatorIdx = indicatorDimPos >= 0
        ? parseInt(seriesParts[indicatorDimPos] ?? '0', 10)
        : parseInt(seriesParts[0] ?? '0', 10);
      const indicatorName = indicatorValues[indicatorIdx]?.id ?? `series_${seriesKey}`;

      const seriesObs = /** @type {any} */ (seriesData)?.observations ?? {};
      for (const [periodKey, obsVal] of Object.entries(seriesObs)) {
        const periodIdx = parseInt(periodKey, 10);
        const periodName = timeValues[periodIdx]?.id ?? periodKey;
        const val = Array.isArray(obsVal) ? obsVal[0] : null;

        if (typeof val === 'number') {
          if (!result[indicatorName]) result[indicatorName] = {};
          result[indicatorName][periodName] = val;
        }
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

// ---------------------------------------------------------------------------
// Rung 2 — IMF DataMapper API (lighter / no auth required)
// ---------------------------------------------------------------------------

/**
 * Try to fetch economic data from the IMF DataMapper REST API.
 * This endpoint requires no authentication and returns data in a simpler format.
 *
 * @param {{ fetchImpl?: Function, baseUrl?: string }} [options]
 * @returns {Promise<{data: object|null, provenance: string}>}
 */
export async function tryImfDataMapper(options = {}) {
  const baseUrl = options.baseUrl ?? IMF_DATAMAPPER_BASE;
  const indicators = IMF_DATAMAPPER_INDICATORS.join('+');
  const url = `${baseUrl}/${indicators}/${IMF_EURO_AREA}?periods=2024,2025,2026,2027`;

  const result = await fetchJson(url, { fetchImpl: options.fetchImpl });

  if (!result.ok || !result.data) {
    return { data: null, provenance: `imf-datamapper:unavailable(${result.status})` };
  }

  const payload = /** @type {any} */ (result.data);
  const values = payload?.values;

  if (!values || typeof values !== 'object') {
    return { data: null, provenance: 'imf-datamapper:no-values' };
  }

  const extracted = {};
  for (const indicator of IMF_DATAMAPPER_INDICATORS) {
    const indValues = values[indicator];
    if (indValues && typeof indValues === 'object') {
      const areaValues = indValues[IMF_EURO_AREA];
      if (areaValues && typeof areaValues === 'object') {
        extracted[indicator] = areaValues;
      }
    }
  }

  if (Object.keys(extracted).length === 0) {
    return { data: null, provenance: 'imf-datamapper:no-euro-area-data' };
  }

  return { data: extracted, provenance: 'imf-datamapper-v1' };
}

// ---------------------------------------------------------------------------
// Rung 3 — World Bank country-level aggregation (EU proxy)
// ---------------------------------------------------------------------------

/**
 * Try World Bank API for key EU country indicators, then compute a simple
 * unweighted average as a proxy for Euro-area figures.
 *
 * @param {{ fetchImpl?: Function, baseUrl?: string, countries?: string[] }} [options]
 * @returns {Promise<{data: object|null, provenance: string}>}
 */
export async function tryWorldBank(options = {}) {
  const baseUrl = options.baseUrl ?? WORLD_BANK_API_BASE;
  const countries = options.countries ?? EU_PROXY_COUNTRIES;

  const results = {};
  let fetchedCount = 0;

  for (const [wbIndicator, imfName] of Object.entries(WB_TO_IMF_INDICATOR)) {
    const countryStr = countries.join(';');
    const url = `${baseUrl}/country/${countryStr}/indicator/${wbIndicator}?format=json&mrv=3&per_page=100`;

    const resp = await fetchJson(url, { fetchImpl: options.fetchImpl });
    if (!resp.ok || !Array.isArray(resp.data)) continue;

    const items = resp.data[1] ?? [];
    const byYear = {};

    for (const item of items) {
      const year = item?.date;
      const val = item?.value;
      if (year && typeof val === 'number') {
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(val);
      }
    }

    const averaged = {};
    for (const [year, vals] of Object.entries(byYear)) {
      const sum = vals.reduce((a, b) => a + b, 0);
      averaged[year] = sum / vals.length;
    }

    if (Object.keys(averaged).length > 0) {
      results[imfName] = averaged;
      fetchedCount += 1;
    }
  }

  if (fetchedCount === 0) {
    return { data: null, provenance: 'worldbank:no-data' };
  }

  return {
    data: results,
    provenance: `worldbank-country-avg(${countries.slice(0, 5).join(',')})`,
  };
}

// ---------------------------------------------------------------------------
// Rung 4 — Cached vintage snapshot
// ---------------------------------------------------------------------------

/**
 * Try to load a previously-cached `economic-context-data.json` file.
 *
 * @param {string} cacheFile - Path to the cached file
 * @returns {Promise<{data: object|null, provenance: string}>}
 */
export async function tryCache(cacheFile) {
  if (!cacheFile || !fs.existsSync(cacheFile)) {
    return { data: null, provenance: 'cache:file-not-found' };
  }

  try {
    const raw = fs.readFileSync(cacheFile, 'utf8');
    const parsed = JSON.parse(raw);
    const dataField = parsed.data ?? parsed;
    if (!dataField || typeof dataField !== 'object') {
      return { data: null, provenance: 'cache:malformed' };
    }
    return { data: dataField, provenance: `cache:${cacheFile}` };
  } catch {
    return { data: null, provenance: 'cache:read-error' };
  }
}

// ---------------------------------------------------------------------------
// Payload builder
// ---------------------------------------------------------------------------

/**
 * Build the canonical economic-context-data.json payload.
 *
 * @param {object} data           - The economic data object
 * @param {string} provenance     - Human-readable provenance string
 * @param {number} rung           - Which fallback rung succeeded (1–4)
 * @returns {object}
 */
export function buildEconomicContextPayload(data, provenance, rung) {
  /** @type {Record<number, string>} */
  const RUNG_LABELS = {
    1: 'imf-sdmx-3.0',
    2: 'imf-datamapper',
    3: 'worldbank-proxy',
    4: 'cached-vintage',
  };
  const rungLabel = RUNG_LABELS[rung] ?? 'unknown';
  const quality = rung === 1 ? 'authoritative' : rung === 2 ? 'good' : rung === 3 ? 'proxy' : 'stale';

  // Attach per-field provenance so downstream agents can cite sources accurately
  const fieldProvenance = {};
  if (data && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      fieldProvenance[key] = { rung, rungLabel, quality, source: provenance };
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    provenance,
    rung,
    rungLabel,
    data,
    quality,
    fieldProvenance,
  };
}

// ---------------------------------------------------------------------------
// Ladder runner
// ---------------------------------------------------------------------------

/**
 * Run the full IMF fallback ladder, trying each rung in order.
 *
 * @param {string} outputDir - Directory to write the output file into
 * @param {{
 *   fetchImpl?: Function,
 *   cacheFile?: string,
 *   dryRun?: boolean,
 *   imfSdmxBase?: string,
 *   imfDataMapperBase?: string,
 *   worldBankBase?: string,
 *   wbCountries?: string[]
 * }} [options]
 * @returns {Promise<{
 *   success: boolean,
 *   rung: number,
 *   provenance: string,
 *   outputFile: string|null,
 *   error?: string
 * }>}
 */
export async function runFallbackLadder(outputDir, options = {}) {
  const { dryRun = false, fetchImpl, cacheFile } = options;

  const rungs = [
    {
      n: 1,
      label: 'IMF SDMX 3.0',
      fn: () =>
        tryImfSdmx({
          fetchImpl,
          baseUrl: options.imfSdmxBase,
        }),
    },
    {
      n: 2,
      label: 'IMF DataMapper',
      fn: () =>
        tryImfDataMapper({
          fetchImpl,
          baseUrl: options.imfDataMapperBase,
        }),
    },
    {
      n: 3,
      label: 'World Bank country proxy',
      fn: () =>
        tryWorldBank({
          fetchImpl,
          baseUrl: options.worldBankBase,
          countries: options.wbCountries,
        }),
    },
    {
      n: 4,
      label: 'Cached vintage',
      fn: () => tryCache(cacheFile ?? ''),
    },
  ];

  for (const rung of rungs) {
    let result;
    try {
      result = await rung.fn();
    } catch (err) {
      process.stderr.write(`⚠️  Rung ${rung.n} (${rung.label}) threw: ${err}\n`);
      continue;
    }

    if (result.data !== null) {
      const payload = buildEconomicContextPayload(result.data, result.provenance, rung.n);
      const outputFile = path.join(outputDir, OUTPUT_FILENAME);

      if (!dryRun) {
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2), 'utf8');
      }

      process.stderr.write(
        `✅ Economic context data from rung ${rung.n} (${rung.label}): ${result.provenance}\n`,
      );

      return {
        success: true,
        rung: rung.n,
        provenance: result.provenance,
        outputFile: dryRun ? null : outputFile,
      };
    }

    process.stderr.write(`⚠️  Rung ${rung.n} (${rung.label}): ${result.provenance}\n`);
  }

  return {
    success: false,
    rung: 0,
    provenance: 'all-rungs-failed',
    outputFile: null,
    error: 'All four fallback rungs returned no usable data',
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

/**
 * Parse minimalist `--key value` CLI args.
 *
 * @param {string[]} argv
 * @returns {Record<string, string|boolean>}
 */
/* c8 ignore start */
function parseArgs(argv) {
  const out = {};
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
        i += 1;
      } else {
        out[key] = next;
        i += 2;
      }
    } else {
      i += 1;
    }
  }
  return out;
}

/**
 * CLI main entry point.
 *
 * @param {string[]} [argv]
 * @returns {Promise<void>}
 */
export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  const outputDir = args['output-dir']
    ? String(args['output-dir'])
    : path.join(process.cwd(), 'analysis', 'cache', 'imf');
  const cacheFile = args['vintage-file'] ? String(args['vintage-file']) : undefined;
  const dryRun = args['dry-run'] === true;

  const result = await runFallbackLadder(outputDir, { cacheFile, dryRun });

  if (!result.success) {
    process.stderr.write(`❌ IMF fallback ladder exhausted: ${result.error ?? 'unknown'}\n`);
    process.exit(1);
  }

  process.stdout.write(
    JSON.stringify({
      status: 'ok',
      rung: result.rung,
      provenance: result.provenance,
      outputFile: result.outputFile,
    }) + '\n',
  );
}

// Standard ESM CLI guard
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/imf-fallback-ladder.js'));

if (isMain) {
  main().catch((err) => {
    process.stderr.write(`Fatal: ${err}\n`);
    process.exit(1);
  });
}
/* c8 ignore stop */
