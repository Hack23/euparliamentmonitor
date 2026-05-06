# IMF Data Integration Skill

> **Skill**: Invoke IMF economic data in EU Parliament Monitor articles
> and analysis via the **native TypeScript SDMX 3.0 REST client**
> (`src/mcp/imf-mcp-client.ts`), which calls
> `https://dataservices.imf.org/REST/SDMX_3.0/` through the shared
> `fetch-proxy` MCP gateway in gh-aw/AWF and directly in local/non-AWF
> contexts. Under
> ** editorial policy (April 2026)** IMF is the **sole
> authoritative source for every economic claim** in EU Parliament
> Monitor articles — macro, fiscal, monetary, trade, FDI,
> exchange-rate, and banking-soundness. World Bank is used for
> non-economic domains (health, education, social, environment,
> demographics, defence, agriculture, innovation, governance).

IMF-primary editorial policy is enforced at Stage-C completeness
review. Every new article citing an economic indicator MUST cite IMF
with SDMX code + vintage prose + HTML `data-vintage` attribute +
forecast marker within 30 words of any projected number.

> **Transport note:** The first iteration proxied through the
> Python `c-cf/imf-data-mcp` MCP server. That transport was replaced
> with a native TypeScript HTTP client plus the repo-local IMF-only
> `fetch-proxy` MCP gateway for AWF sandbox egress — the public API
> (`IMFMCPClient`, five tool methods, `MCPToolResult`-shaped return
> envelope) is identical.

---

## When to use IMF

Under, IMF is **mandatory** for every economic claim
specifically:

- Any mention of GDP (level, growth, per capita, potential, output gap),
  inflation (CPI, core, energy, food), unemployment, current account,
  trade balance, fiscal balance (primary or overall), government debt,
  FDI, exchange rate (nominal or real effective), policy rate, reserve
  assets, bank capital adequacy, or NPL ratio.
- Any forecast with a horizon ≥1 year requires an IMF WEO or FM
  citation (WB WDI does not publish multi-year forecasts).
- Quarterly or monthly granularity is required — IFS, CPI monthly,
  BOP, ER, PCPS.
- The committee context is ECON, BUDG, AFET, SEDE, INTA, ITRE (for
  energy-driven inflation), EMPL (for unemployment).
- The article is a look-ahead (`news-week-ahead`,
  `news-month-ahead`) — forecast anchor IMF-only.

**Retain World Bank for** social / health / education /
environment / demographics / defence (WB military expenditure) /
agriculture / innovation / governance (WGI) indicators — IMF does
not cover those domains.

**Per-article-type IMF indicator floor** (editorial policy, enforced
at Stage C completeness review): see
[`analysis/methodologies/imf-indicator-mapping.md §8`](../../analysis/methodologies/imf-indicator-mapping.md)
`committee-reports/ECON` ≥ 4, `/BUDG` ≥ 3, `/INTA` ≥ 3;
`week-ahead` / `month-ahead` / `monthly-review` ≥ 2;
`breaking` / `weekly-review` / `motions` / `propositions` ≥ 1.

---

## Virtual Tool Surface

Five semantic methods on the native client, each mapped to a single
SDMX 3.0 REST endpoint:

| Method (virtual tool)                         | REST endpoint                                |
|-----------------------------------------------|----------------------------------------------|
| `listDatabases` (`imf-list-databases`)        | `GET /dataflow/IMF`                          |
| `searchDatabases` (`imf-search-databases`)    | Reuses `/dataflow/IMF` + client-side filter  |
| `getParameterDefs` (`imf-get-parameter-defs`) | `GET /datastructure/{id}`                    |
| `getParameterCodes` (`imf-get-parameter-codes`)| `GET /datastructure/{id}?references=codelist`|
| `fetchData` (`imf-fetch-data`)                | `GET /data/{dataflow}/{key}?startPeriod=…`   |

All five identifiers are exported as `IMF_MCP_TOOLS` from
`src/mcp/imf-mcp-client.ts` and wrapped with domain-safe helpers
(`listDatabases`, `searchDatabases`, `getParameterDefs`,
`getParameterCodes`, `fetchData`).

---

## Typical Discovery → Fetch Flow

```ts
// Client lives at `src/mcp/imf-mcp-client.ts` (TypeScript) and is
// compiled to `scripts/mcp/imf-mcp-client.js` for Node consumers.
// Pick the import form that matches your caller:
//
//   - From `src/**.ts`            →  import { getIMFMCPClient } from './mcp/imf-mcp-client.js';
//   - From `scripts/**.js`        →  import { getIMFMCPClient } from './mcp/imf-mcp-client.js';
//   - From a repo-root tsx script →  import { getIMFMCPClient } from './src/mcp/imf-mcp-client.ts';
//
// The example below uses the in-`src/**` form. The `.js` extension is
// required by the project's NodeNext ESM module resolution even though
// the source file is `.ts` (TypeScript rewrites the extension at compile
// time); reserve `.ts` extensions for ad-hoc `tsx` execution from the
// repo root.
import { getIMFMCPClient } from './mcp/imf-mcp-client.js';

const client = await getIMFMCPClient();

// 1. Confirm the database (optional — see indicator-catalog.md §2 for
//    the per-article-type mapping; WEO is the default for macro
//    forecasts).
const dbs = await client.searchDatabases('world economic outlook');

// 2. Fetch a slice. Options use camelCase; the client handles the
//    SDMX key construction and URL-encoding internally. ISO-3 country
//    codes map 1:1 with WB for EU-27 — see
//    `analysis/imf/eu-country-mapping.md`.
const response = await client.fetchData({
  databaseId: 'WEO',
  startYear: 2015,
  endYear: 2030,
  filters: {
    country: ['DEU', 'FRA', 'ITA'],
    indicator: ['NGDP_RPCH'],
  },
});

// 3. Parse the SDMX-JSON envelope returned by the IMF REST endpoint.
//    The client returns an empty `text` string on the IMF_FALLBACK path
//    (upstream errors / firewall blocks), so guard the JSON.parse call
//    before reading the envelope — see `IMFMCPClient.fetchData` JSDoc.
const text = response.content[0]?.text ?? '';
let sdmx = null;
if (text) {
  try {
    sdmx = JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse IMF SDMX-JSON response:', error);
  }
}
if (!sdmx) {
  // Fallback path — record the gap in `intelligence/mcp-reliability-audit.md`
  // and either retry, switch databases, or skip the indicator. Do NOT
  // fabricate observations.
  return;
}
```

The IMF REST endpoint returns an SDMX-JSON envelope. Parse it with any
standard SDMX-JSON reader (agents typically read the series under
`data.dataSets[0].series` and match observation keys against
`data.structures[0].dimensions.observation`). The `OBS_STATUS=F`
(forecast) attribute should be propagated to the rendered HTML as
`data-forecast="true"` on the corresponding table row — see
[`analysis/imf/indicator-catalog.md §4`](../../analysis/imf/indicator-catalog.md#4-observation-attributes).

> The earlier helper-module surface (`parseSDMXJSON`, `getIMFCountryCode`,
> `isIMFEUMemberState`, `IMF_POLICY_INDICATORS`,
> `IMF_PER_ARTICLE_INDICATOR_FLOORS`, `IMF_AGGREGATE_LABELS`,
> `IMF_COUNTRY_CODE_OVERRIDES`, `buildIMFEconomicContextHTML`,
> `validateIMFVintageMetadata`, `validateIMFForecastMarker`) lived in
> `src/utils/imf-data.ts` and were purged in the April-2026
> aggregator-pipeline migration. Agents consult the markdown catalogues
> under `analysis/imf/` directly.

---

## Validator Hooks

Stage-C completeness review enforces IMF/WB fingerprint conventions —
see [`analysis/imf/indicator-catalog.md`](../../analysis/imf/indicator-catalog.md)
for the canonical SDMX code list and
[`analysis/methodologies/imf-indicator-mapping.md`](../../analysis/methodologies/imf-indicator-mapping.md)
for the per-committee mapping.

---

## Firewall Allow-list

When adding IMF to a gh-aw workflow (mandatory), add exactly:

```yaml
network:
  allowed:
    - dataservices.imf.org
```

This is the SDMX 3.0 REST host the native TypeScript client calls directly
outside AWF and the shared `fetch-proxy` MCP server calls inside AWF. Do
**NOT** add `data.imf.org` (DataMapper site) or `api.imf.org` unless
those endpoints are actually being hit.

---

## Client Configuration

`scripts/mcp-setup.sh` exports:

```bash
export IMF_API_BASE_URL="https://dataservices.imf.org/REST/SDMX_3.0"
```

Override via `IMF_API_BASE_URL` when mirroring. IMF SDMX 3.0 is an
unauthenticated public endpoint — no API key is required.

Per-request timeout: 90 s in the TypeScript client by default, raised to
120 s by `scripts/mcp-setup.sh` for gh-aw runs and 180 s in Copilot setup
contexts (override with `IMF_API_TIMEOUT_MS`).

---

## Probe Pattern

```bash
source scripts/mcp-setup.sh
mkdir -p "${ANALYSIS_DIR}/cache/imf"
source scripts/imf-mcp-probe.sh > "${ANALYSIS_DIR}/cache/imf/probe-summary.json"
if [ "$IMF_MCP_OK" = "true" ]; then
  echo "IMF data available — prefer IMF for macro context"
else
  echo "IMF offline ($IMF_MCP_PROBE_ERROR) — IMF is mandatory for economic context. Fall back to prior-run IMF cache first; use World Bank for non-economic cross-refs."
fi
```

Max 2 canonical IMF queries, with each gateway/direct transport leg capped at
30 s so Stage A records degraded IMF mode quickly when the sandbox or upstream
endpoint is unavailable. The probe keeps its historic filename and env-var names
(`IMF_MCP_OK`, `IMF_MCP_PROBE_ERROR`) so existing workflow prompts do not need
to change.

### Live Probe Contract (Stage A)

- **Endpoint:** `https://dataservices.imf.org/REST/SDMX_3.0` (override with
  `IMF_API_BASE_URL` only for an approved mirror).
- **Transport:** `FETCH_MCP_GATEWAY_URL` first in gh-aw/AWF, direct HTTPS
  fallback for local/non-AWF runs. A fetch-proxy registration failure is an
  infrastructure defect, not an IMF data outage.
- **Authentication:** none. IMF SDMX 3.0 is public HTTPS; do not send GitHub,
  MCP gateway, or other bearer tokens to the IMF host.
- **TLS / attribution:** use HTTPS only and attribute article claims as
  `Source: IMF, World Economic Outlook, <vintage>`.
- **Cache location:** `analysis/daily/<date>/<slug>/cache/imf/`. Same-day
  reruns must read cache before making live calls.
- **Failure semantics:** the probe always exits 0 and emits
  `{"available": false...}` on timeout, firewall denial, HTTP error, or
  empty canonical WEO data. Stage A continues, but Stage C must block any
  economic-context artifact that relies on `knowledge-only` IMF figures.

Canonical Stage-A query set (one dataflow probe + one WEO slice, so the live
probe remains inside the ≤4 min Stage-A budget):

| Purpose | IMF REST path | Coverage |
|---------|---------------|----------|
| Availability / dataflow drift | `/dataflow/IMF` | Confirms SDMX 3.0 service and WEO dataflow listing |
| Macro WEO slice | `/data/WEO/A.EA+DEU+FRA+ITA.NGDP_RPCH+PCPIPCH+GGXCNL_NGDP?startPeriod=2025&endPeriod=2026&format=jsondata` | Annual WEO (`A`) for Eurozone aggregate (`EA`) plus DE/FR/IT real GDP growth (`NGDP_RPCH`), inflation (`PCPIPCH`), and fiscal balance (`GGXCNL_NGDP`) |

`economic-context.md` must set `IMF Source` to `live` when the current run
created the cache files, `cache` when it reused same-day cache, or
`knowledge-only` only as an explicit failure marker. `knowledge-only` fails the
Stage-C validator and must not be published as sourced economic evidence.

---

## Editorial Rules

1. **Label forecasts**: Any number from WEO/FM beyond the latest
   actual MUST be labelled "forecast" / "projection" / "IMF projects"
   in prose, with the vintage (e.g. "IMF WEO April 2026").
2. **Acknowledge bias**: Horizons ≥3 years add one sentence noting
   IMF's documented medium-term optimism bias.
3. **Prefer actuals**: When both an actual and a forecast exist for
   the same year, use the actual (the raw SDMX-JSON response carries
   `OBS_STATUS=A` vs `F` on each observation — see
   [`analysis/imf/indicator-catalog.md §4`](../../analysis/imf/indicator-catalog.md#4-observation-attributes)).
4. **Cite source**: `Source: IMF, World Economic Outlook, April 2026.`

---

## Reference Docs

- `analysis/imf/README.md` — overview + scope boundaries
- `analysis/imf/indicator-catalog.md` — ~80 indicators across 10 databases
- `analysis/imf/eu-country-mapping.md` — codelists + drift vs World Bank
- `analysis/imf/chart-integration-guide.md` — Chart.js / Mermaid forecast patterns
- `analysis/imf/use-cases.md` — when IMF adds value per article type
- `analysis/methodologies/imf-indicator-mapping.md` — committee → indicator map (Stage-C editorial review)
