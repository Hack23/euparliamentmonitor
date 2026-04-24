# IMF Data Integration Skill

> **Skill**: Invoke IMF economic data in EU Parliament Monitor articles
> and analysis via the **native TypeScript SDMX 3.0 REST client**
> (`src/mcp/imf-mcp-client.ts`), which calls
> `https://dataservices.imf.org/REST/SDMX_3.0/` directly. Under
> **Wave-3 editorial policy (April 2026)** IMF is the **sole
> authoritative source for every economic claim** in EU Parliament
> Monitor articles — macro, fiscal, monetary, trade, FDI,
> exchange-rate, and banking-soundness. World Bank is retained only
> for non-economic domains (health, education, social, environment,
> demographics, defence, agriculture, innovation, governance).

**🌀 Wave:** 3 — IMF-primary editorial policy enforced by
`articlePolicyHasEconomicContext` (existing OR-gate retained for
back-compat with pre-Wave-2 articles) and the dark-launched strict
helper `articlePolicyHasIMFEconomicEvidence` (behind the
`WAVE3_IMF_STRICT` environment flag). Every new article citing an
economic indicator MUST cite IMF with SDMX code + vintage prose +
HTML `data-vintage` attribute + forecast marker within 30 words of
any projected number.

> **Transport note:** The first Wave 1 iteration proxied through the
> Python `c-cf/imf-data-mcp` MCP server. That transport was replaced
> with a native TypeScript HTTP client — the public API
> (`IMFMCPClient`, five tool methods, `MCPToolResult`-shaped return
> envelope) is identical, and the five tool identifiers remain the
> content-validator fingerprint source and workflow-probe heartbeat
> anchors.

---

## When to use IMF (Wave-3: always for economic context)

Under Wave-3, IMF is **mandatory** for every economic claim —
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

**Per-article-type IMF indicator floor** (enforced at Stage C by
`validate-analysis-completeness` when `WAVE3_IMF_STRICT=true`; soft
warning otherwise): see [`analysis/methodologies/imf-indicator-mapping.md §8`](../../analysis/methodologies/imf-indicator-mapping.md) —
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
import { getIMFMCPClient } from '../mcp/imf-mcp-client.js';
import { parseSDMXJSON, getIMFCountryCode, IMF_POLICY_INDICATORS } from '../utils/imf-data.js';

const client = await getIMFMCPClient();

// 1. Confirm the database (optional — the mapping already knows WEO).
const dbs = await client.searchDatabases('world economic outlook');

// 2. Fetch a slice. Options use camelCase; the client handles the
//    SDMX key construction and URL-encoding internally.
const mapping = IMF_POLICY_INDICATORS.gdpGrowth; // { database: 'WEO', indicator: 'NGDP_RPCH', ... }
const response = await client.fetchData({
  databaseId: mapping.database,
  startYear: 2015,
  endYear: 2030,
  filters: {
    country: ['DEU', 'FRA', 'ITA'].map((c) => getIMFCountryCode(c) ?? c),
    indicator: [mapping.indicator],
  },
});

// 3. Normalise SDMX-JSON → IMFObservation[] per series.
const text = response.content[0]?.text ?? '';
const seriesMap = parseSDMXJSON(text);
```

`parseSDMXJSON` is tolerant: malformed responses become an empty Map
rather than throwing, so the article pipeline can fall back to
prior-run IMF cache (or — as last resort — World Bank non-economic
cross-refs) when IMF is unreachable.

---

## Validator Hooks

| Helper | Status | Purpose |
|---|:---:|---|
| `hasIMFEvidence(text)` | shipped | Detects IMF sourcing (tool names, product names, SDMX codes); case-insensitive on short tokens `IMF`/`WEO` |
| `articlePolicyHasEconomicContext(html, type)` | **default gate (Wave-3)** | OR-gate: passes when WB **or** IMF evidence is present. Wired into `src/utils/validate-articles.ts`. Retained for pre-Wave-2 back-compat. |
| `articlePolicyHasIMFEconomicEvidence(html, type)` | **strict, dark-launched (Wave-3)** | IMF-only gate: passes only when IMF fingerprints + SDMX codes + forecast markers + vintage attribute are present. Activated when `WAVE3_IMF_STRICT=true` environment flag is set. Will become the default in Wave-4. |
| `articlePolicyHasWorldBank(html, type)` | legacy | Retained as a non-breaking helper for historical tests; no longer used by the default validator path |

Fingerprint sources: `IMF_STRONG_FINGERPRINTS` and `IMF_INDICATOR_CODES`
(`src/utils/content-validator.ts`), drift-guarded by
`test/unit/content-validator-imf.test.js`.

---

## Firewall Allow-list

When adding IMF to a gh-aw workflow (Wave 2+, mandatory under Wave-3), add exactly:

```yaml
network:
  allowed:
    - dataservices.imf.org
```

This is the SDMX 3.0 REST host the native TypeScript client calls. Do
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

Per-request timeout: 30 s (override with `IMF_API_TIMEOUT_MS`).

---

## Probe Pattern

```bash
source scripts/mcp-setup.sh
source scripts/imf-mcp-probe.sh
if [ "$IMF_MCP_OK" = "true" ]; then
  echo "IMF data available — prefer IMF for macro context"
else
  echo "IMF offline ($IMF_MCP_PROBE_ERROR) — escalate per Wave-3 policy: IMF is mandatory for economic context. Fall back to prior-run IMF cache first; only use World Bank non-economic cross-refs when no economic claim is being made."
fi
```

Max 2 HTTP calls, 30 s wall-clock ceiling. The probe keeps its historic
filename and env-var names (`IMF_MCP_OK`, `IMF_MCP_PROBE_ERROR`) so
existing workflow prompts do not need to change.

---

## Editorial Rules

1. **Label forecasts**: Any number from WEO/FM beyond the latest
   actual MUST be labelled "forecast" / "projection" / "IMF projects"
   in prose, with the vintage (e.g. "IMF WEO April 2026").
2. **Acknowledge bias**: Horizons ≥3 years add one sentence noting
   IMF's documented medium-term optimism bias.
3. **Prefer actuals**: When both an actual and a forecast exist for
   the same year, use the actual. `getMostRecentObservation` enforces this.
4. **Cite source**: `Source: IMF, World Economic Outlook, April 2026.`

---

## Reference Docs

- `analysis/imf/README.md` — overview + scope boundaries
- `analysis/imf/indicator-catalog.md` — ~80 indicators across 10 databases
- `analysis/imf/eu-country-mapping.md` — codelists + drift vs World Bank
- `analysis/imf/chart-integration-guide.md` — Chart.js / Mermaid forecast patterns
- `analysis/imf/use-cases.md` — when IMF adds value per article type
- `analysis/methodologies/imf-indicator-mapping.md` — committee → indicator map (validator-backed)
