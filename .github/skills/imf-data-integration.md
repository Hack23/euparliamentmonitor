# IMF Data Integration Skill

> **Skill**: Invoke IMF economic data in EU Parliament Monitor articles
> and analysis via the **native TypeScript SDMX 3.0 REST client**
> (`src/mcp/imf-mcp-client.ts`), which calls
> `https://dataservices.imf.org/REST/SDMX_3.0/` directly. Provides
> fresher macro/fiscal context and native multi-year forecasts relative
> to the World Bank WDI.

**🌀 Wave:** 1 IMF integration + Wave-2 validation enforcement (strict validator uses the WB-or-IMF OR-gate `articlePolicyHasEconomicContext`; IMF citations alone satisfy the policy gate)

> **Transport note:** The first Wave 1 iteration proxied through the
> Python `c-cf/imf-data-mcp` MCP server. That transport was replaced
> with a native TypeScript HTTP client — the public API
> (`IMFMCPClient`, five tool methods, `MCPToolResult`-shaped return
> envelope) is identical, and the five tool identifiers remain the
> content-validator fingerprint source and workflow-probe heartbeat
> anchors.

---

## When to use IMF

Choose IMF over World Bank when **any** of these is true:

- The article or analysis needs **2025 actuals** or **2026-2030
  forecasts** for GDP, inflation, unemployment, gov debt, primary
  balance, current account — WEO ships these; WDI does not.
- Quarterly or monthly granularity is required (IFS, CPI, BOP, ER,
  PCPS).
- The committee context is ECON, BUDG, AFET, SEDE, or INTA.
- The article is a look-ahead (`news-week-ahead`, `news-month-ahead`) —
  these cannot be grounded in WDI's annual retrospective series.

Retain **World Bank** for social / health / education / environment /
innovation indicators — IMF does not cover them.

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
rather than throwing, so the article pipeline can fall back to World
Bank when IMF is unreachable.

---

## Validator Hooks

| Helper | Status | Purpose |
|---|:---:|---|
| `hasIMFEvidence(text)` | shipped | Detects IMF sourcing (tool names, product names, SDMX codes); case-insensitive on short tokens `IMF`/`WEO` |
| `articlePolicyHasEconomicContext(html, type)` | **default gate** | OR-gate: passes when WB **or** IMF evidence is present. Wired into `src/utils/validate-articles.ts`. |
| `articlePolicyHasWorldBank(html, type)` | legacy | Retained as a non-breaking helper for the transition; no longer the default validator gate |

Fingerprint sources: `IMF_STRONG_FINGERPRINTS` and `IMF_INDICATOR_CODES`
(`src/utils/content-validator.ts`), drift-guarded by
`test/unit/content-validator-imf.test.js`.

---

## Firewall Allow-list

When adding IMF to a gh-aw workflow (Wave 2+), add exactly:

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
  echo "IMF offline ($IMF_MCP_PROBE_ERROR) — fall back to World Bank"
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
