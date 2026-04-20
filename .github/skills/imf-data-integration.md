# IMF Data Integration Skill

> **Skill**: Invoke IMF economic data in EU Parliament Monitor articles
> and analysis via the `c-cf/imf-data-mcp` MCP server (SDMX 3.0 API at
> `data.imf.org`). Provides fresher macro/fiscal context and native
> multi-year forecasts relative to the World Bank WDI.

**🌀 Wave:** 1 (Additive dual-source; World Bank remains the validator's primary gate)

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

## MCP Tool Surface

Five tools exposed by the upstream server:

| Tool | Purpose |
|---|---|
| `imf-list-databases` | Enumerate every IMF database |
| `imf-search-databases` | Free-text keyword search across databases |
| `imf-get-parameter-defs` | List the dimensions of a database |
| `imf-get-parameter-codes` | List the valid code values for one dimension |
| `imf-fetch-data` | Fetch a time-series slice for given dimension codes |

All five are exported as `IMF_MCP_TOOLS` from `src/mcp/imf-mcp-client.ts`
and wrapped with domain-safe helpers (`listDatabases`,
`searchDatabases`, `getParameterDefs`, `getParameterCodes`, `fetchData`).

---

## Typical Discovery → Fetch Flow

```ts
import { getIMFMCPClient } from '../mcp/imf-mcp-client.js';
import { parseSDMXJSON, getIMFCountryCode, IMF_POLICY_INDICATORS } from '../utils/imf-data.js';

const client = await getIMFMCPClient();

// 1. Confirm the database (optional — the mapping already knows WEO).
const dbs = await client.searchDatabases('world economic outlook');

// 2. Fetch a slice. IMF MCP requires snake_case keys on args.
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

| Helper | Wave | Purpose |
|---|:---:|---|
| `hasIMFEvidence(text)` | 1 | Detects IMF sourcing (tool names, product names, SDMX codes) |
| `articlePolicyHasEconomicContext(html, type)` | 1 (helper) / 2 (default) | OR-gate: passes when WB **or** IMF evidence is present |
| `articlePolicyHasWorldBank(html, type)` | 1 (default) | Legacy gate; retained for non-breaking transition |

Fingerprint sources: `IMF_STRONG_FINGERPRINTS` and `IMF_INDICATOR_CODES`
(`src/utils/content-validator.ts`), drift-guarded by
`test/unit/content-validator-imf.test.js`.

---

## Firewall Allow-list

When adding IMF to a gh-aw workflow (Wave 2+), add exactly:

```yaml
network:
  allowed:
    - data.imf.org
```

Do **NOT** add `dataservices.imf.org` unless the MCP server explicitly
requires it for fallback — the principle of least surface applies per
`.github/skills/gh-aw-firewall.md`.

---

## Gateway Configuration

`scripts/mcp-setup.sh` exports:

```bash
export IMF_MCP_SERVER_URL="http://host.docker.internal:80/mcp/imf-data"
```

Authentication falls back to `EP_MCP_GATEWAY_API_KEY` when the
IMF-specific `IMF_MCP_GATEWAY_API_KEY` is not set; both envelopes route
through the same gateway.

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

Max 2 HTTP calls, 30 s wall-clock ceiling.

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
