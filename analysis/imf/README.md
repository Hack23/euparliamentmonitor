# 🌐 IMF Data Integration — EU Parliament Monitor

> **Purpose**: Central reference for integrating IMF (International Monetary
> Fund) data into EU Parliament intelligence analysis. This directory is the
> IMF counterpart to `analysis/worldbank/` and is the source-of-truth for AI
> workflows that enrich articles with **fresher macro/fiscal context and
> native multi-year forecasts** sourced from the IMF SDMX 3.0 REST API
> (`https://dataservices.imf.org/REST/SDMX_3.0/`) via the native TypeScript
> client in [`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts).
>
> **Transport note:** the first Wave 1 iteration proxied through the Python
> [`c-cf/imf-data-mcp`](https://github.com/c-cf/imf-data-mcp) MCP server.
> That dependency was replaced with a native TypeScript HTTP client so the
> stack stays npm-pure and pinnable per ISMS §7. The five "tool" identifiers
> are preserved verbatim as the content-validator fingerprint anchors.

**📅 Last Updated:** 2026-04-24 | **🏷️ Classification:** Public | **🌀 Wave:** 3 — IMF is the **sole authoritative source** for economic context (macro / monetary / fiscal / trade / FDI / exchange-rate). World Bank retained **only** for non-economic domains (social, health, education, environment, demographics, defence, agriculture, innovation, governance).

---

## 📂 Directory Contents

| Document | Description | Audience |
|----------|-------------|----------|
| [`database-directory.md`](database-directory.md) | Full SDMX dataflow inventory (~155 databases) grouped by IMF publisher unit, tagged 🟢/🟡/⚪ for EP editorial relevance | AI workflows, developers |
| [`indicator-catalog.md`](indicator-catalog.md) | ~80 IMF indicators across WEO, IFS, FM, BOP, ER, PCPS, organised by 10 EP policy domains with SDMX codes, frequency, and forecast horizon | AI workflows, developers |
| [`sdmx-dimensions-reference.md`](sdmx-dimensions-reference.md) | Canonical SDMX 3.0 dimensions (`FREQ`, `REF_AREA`, `INDICATOR`, `COUNTERPART_AREA`, `OBS_STATUS`, `SCALE`, `METHODOLOGY`) with EP handling rules | AI workflows, developers |
| [`eu-country-mapping.md`](eu-country-mapping.md) | EU-27 + comparison groups with IMF country codes and aggregation codelists (`EA`, `EU`, `G7`, `G20`) | AI workflows, analysis |
| [`release-calendar.md`](release-calendar.md) | Rolling 18-month calendar of WEO/FM/GFSR/EREO vintages + monthly IFS/CPI/ER/PCPS cadence with editorial-trigger SLAs | AI workflows, product |
| [`forecast-accuracy-baseline.md`](forecast-accuracy-baseline.md) | Per-horizon MAE bands for WEO/FM forecasts driving the mandatory optimism-bias acknowledgement on horizons ≥3y | AI workflows, news-journalist |
| [`cross-source-triangulation.md`](cross-source-triangulation.md) | When IMF figures must be cross-checked against ECB SDW / Eurostat / OECD / BIS, keyed to significance tier & indicator class | AI workflows, quality-engineer |
| [`chart-integration-guide.md`](chart-integration-guide.md) | Chart.js templates with forecast-shaded overlay + Mermaid `xychart-beta` patterns for IMF data visualisation | AI workflows, frontend |
| [`use-cases.md`](use-cases.md) | When IMF adds editorial value per article type (Wave-3 IMF-primary matrix) | AI workflows, product |

---

## 🔑 Quick Reference

### IMF Virtual Tool Surface

The native TypeScript client exposes five semantic methods, each mapped
to a single SDMX 3.0 REST endpoint. The historical "tool" identifiers
are retained as virtual tool names for the content-validator
fingerprint and the workflow probe.

| Virtual tool | Method | REST endpoint |
|---|---|---|
| `imf-list-databases` | `listDatabases()` | `GET /dataflow/IMF` |
| `imf-search-databases` | `searchDatabases(keyword)` | `/dataflow/IMF` + client-side filter |
| `imf-get-parameter-defs` | `getParameterDefs(databaseId)` | `GET /datastructure/{id}` |
| `imf-get-parameter-codes` | `getParameterCodes(db, param, search?)` | `GET /datastructure/{id}?references=codelist` |
| `imf-fetch-data` | `fetchData({ databaseId, startYear, endYear, filters })` | `GET /data/{dataflow}/{key}?startPeriod=…` |

The canonical identifier list is duplicated in `IMF_MCP_TOOLS` in
[`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts) and guarded by the
integration test `test/integration/mcp/imf-mcp.test.js`.

### Why IMF (and why now)

The World Bank WDI publishes most EU macro indicators on a **biannual
batch cadence** with substantial national-account reconciliation lag. As
of April 2026 the WDI still surfaces `null` for most 2025 values. The
IMF publishes the **WEO vintages in April and October** and ships, for
every EU-27 country:

- 2025 **actuals** for GDP, inflation, unemployment, gov debt, primary balance, current account
- 2026–2030 **forecasts** for the same series
- Quarterly IFS + monthly CPI/ER/PCPS data with ~4–8 weeks reference lag

This directly fixes the "stale context" editorial problem for
`news-breaking`, `news-weekly-review`, `news-monthly-review`,
`news-week-ahead`, `news-month-ahead`, and the ECON/BUDG/AFET committee
report articles.

### Scope Boundaries

IMF is the **primary source** for the macro/fiscal/trade/monetary
subset. It does **not** cover:

- Social: life expectancy, birth/death rates, internet users
- Health: physicians, hospital beds, immunisation
- Education: enrolment, literacy
- Environment: CO₂, renewable energy
- Innovation: R&D spending, high-tech exports

World Bank WDI remains the authoritative source for those domains —
see [`analysis/worldbank/`](../worldbank/) and
[`analysis/methodologies/worldbank-indicator-mapping.md`](../methodologies/worldbank-indicator-mapping.md)
for the WB-only indicator inventory.

---

## 🔒 Compliance & Data Governance

- **License**: IMF data is public and redistribution is permitted under the
  [IMF Copyright and Usage terms](https://www.imf.org/external/terms.htm);
  articles and analysis cite `IMF, World Economic Outlook, April 2026` (or
  the applicable FM/IFS vintage) per the attribution rules.
- **GDPR**: No personal data is handled by IMF data flows.
- **ISMS**: Supply-chain vetted per ISO 27001 A.5.23 and A.8.28; the native
  TypeScript IMF client has no third-party runtime dependencies beyond
  Node's built-in `fetch`, side-stepping the pinning issue that blocked
  the earlier Python `c-cf/imf-data-mcp` integration.
- **Firewall**: Only `dataservices.imf.org` is added to the `network.allowed`
  block in workflow frontmatter. The earlier iteration's `data.imf.org`
  (DataMapper UI) is **NOT** added — the SDMX REST host is the only
  endpoint the client actually hits.
- **Forecast provenance**: Every article citing an IMF projection MUST label
  it as "forecast" or "projection" and cite the vintage (e.g.
  "WEO April 2026"). This is enforced prospectively by the
  `articlePolicyHasEconomicContext` Wave 2 validator flip.

---

## 🔁 Relationship to World Bank

Under Wave-3 (April 2026) the WB↔IMF split is enforced at the
editorial-surface level:

| Domain class | Primary source | Notes |
|-------------|:--------------:|-------|
| Economic / macro / monetary / fiscal / trade / FDI / exchange-rate | **IMF** | Mandatory for policy-required article types |
| Social / health / education / environment / demographics / defence / agriculture / innovation / governance | **World Bank** | IMF does not cover these domains |

The Wave-2 OR-gate (`articlePolicyHasEconomicContext`) remains in
`src/utils/validate-articles.ts` as the enforced gate for backward
compatibility; the Wave-3 strict helper
`articlePolicyHasIMFEconomicEvidence` is dark-launched behind the
`WAVE3_IMF_STRICT` feature flag for data-driven promotion. See
[`../methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md)
for the committee-level mapping and the Wave-3/4 migration sequence.
