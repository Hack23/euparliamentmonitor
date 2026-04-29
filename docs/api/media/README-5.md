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
> are preserved verbatim as the drift-guard fingerprint for
> `test/integration/mcp/imf-mcp.test.js` and the editorial Stage-C completeness
> review over `intelligence/economic-context.md`.

**📅 Last Updated:** 2026-04-24 | **🏷️ Classification:** Public | **🌀 Wave:** 4 — IMF is the **sole authoritative source** for economic context (macro / monetary / fiscal / trade / FDI / exchange-rate). World Bank retained **only** for non-economic domains (social, health, education, environment, demographics, defence, agriculture, innovation, governance). Enforcement is editorial at **Stage C** of the agentic news workflows; the legacy runtime gate helpers were purged in the April-2026 aggregator-pipeline migration (see [`Compliance & Data Governance §4`](#-compliance--data-governance)).

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
| [`use-cases.md`](use-cases.md) | When IMF adds editorial value per article type | AI workflows, product |

---

## 🔑 Quick Reference

### IMF Virtual Tool Surface

The native TypeScript client exposes five semantic methods, each mapped
to a single SDMX 3.0 REST endpoint. The historical "tool" identifiers
are retained as virtual tool names for the Stage-C editorial fingerprint
and the workflow probe.

| Virtual tool | Method | REST endpoint |
|---|---|---|
| `imf-list-databases` | `listDatabases` | `GET /dataflow/IMF` |
| `imf-search-databases` | `searchDatabases(keyword)` | `/dataflow/IMF` + client-side filter |
| `imf-get-parameter-defs` | `getParameterDefs(databaseId)` | `GET /datastructure/{id}` |
| `imf-get-parameter-codes` | `getParameterCodes(db, param, search?)` | `GET /datastructure/{id}?references=codelist` |
| `imf-fetch-data` | `fetchData({ databaseId, startYear, endYear, filters })` | `GET /data/{dataflow}/{key}?startPeriod=…` |

The canonical identifier list is duplicated in `IMF_MCP_TOOLS` in
[`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts) and guarded by the
integration test `test/integration/mcp/imf-mcp.test.js`. Stage-C editorial
review treats the five tool names plus the product strings (`IMF`, `WEO`,
`Fiscal Monitor`, `International Monetary Fund`, `data.imf.org`) and the
SDMX indicator codes catalogued in [`indicator-catalog.md §2`](indicator-catalog.md#2-policy-domain--imf-indicator-mapping)
as the authoritative IMF-citation fingerprints.

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

World Bank WDI remains the authoritative source for those domains
see [`analysis/worldbank/`](../worldbank/) and
[`analysis/methodologies/worldbank-indicator-mapping.md`](../methodologies/worldbank-indicator-mapping.md)
for the WB-only indicator inventory.

### Quick Start — Agentic Workflow Usage

IMF data enters an agentic news workflow in three steps. This is the
canonical happy-path flow; each step is covered in depth by the linked
file.

1. **Firewall allow-list.** Every `news-*.md` workflow that hits IMF
   lists `dataservices.imf.org` in the frontmatter `network.allowed`
   block. Do **not** add `data.imf.org` (DataMapper UI) or `api.imf.org`
   — the SDMX 3.0 REST host is the only endpoint the client calls. See
   [`.github/skills/imf-data-integration.md`](../../.github/skills/imf-data-integration.md).

2. **Probe.** `scripts/imf-mcp-probe.sh` verifies the IMF API is
   reachable in ≤ 2 HTTP calls / 30 s wall-clock, exporting
   `IMF_MCP_OK` and `IMF_MCP_PROBE_ERROR` when sourced. Macro-context
   workflows run it after `scripts/mcp-setup.sh` and cache JSON under
   `analysis/daily/<date>/<slug>/cache/imf/`.

3. **Fetch.** The agent calls the five virtual tools (via the native
   client wrapper in `scripts/mcp/imf-mcp-client.js` or an inline `tsx`
   call to `src/mcp/imf-mcp-client.ts`) to pull the indicators required
   by [`indicator-catalog.md §2`](indicator-catalog.md#2-policy-domain--imf-indicator-mapping)
   for the article type, then writes the results into
   `analysis/daily/<run>/intelligence/economic-context.md` following
   the [`analysis/templates/economic-context.md`](../templates/economic-context.md)
   shape.

Stage-C editorial review then checks that the artifact satisfies:

- Per-article-type indicator floor (see
  [`../methodologies/imf-indicator-mapping.md §8`](../methodologies/imf-indicator-mapping.md#8-per-article-type-indicator-minimums)).
- `data-vintage="WEO-April-2026"` (or the applicable FM/IFS vintage)
  on an explicit
  `<section class="economic-context imf-economic-context">` block in
  the artifact body.
- Forecast marker (`forecast` / `projection` / `projects` / `expects`)
  within 30 words of every projected number.
- Optimism-bias acknowledgement sentence for horizons ≥ 3 years, sized
  per the MAE bands in [`forecast-accuracy-baseline.md`](forecast-accuracy-baseline.md).
- Triangulation log in `manifest.crossSourceTriangulation[]` for
  Tier-1 high-sensitivity indicators, per
  [`cross-source-triangulation.md`](cross-source-triangulation.md).

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
  "WEO April 2026"). This is enforced editorially at Stage-C of every
  agentic news workflow — see
  [`.github/prompts/04-article-generation.md §5`](../../.github/prompts/04-article-generation.md)
  and [`.github/skills/imf-data-integration.md`](../../.github/skills/imf-data-integration.md)
  for the reviewer checklist.

---

## 🔁 Relationship to World Bank

Under ** (April 2026)** the WB↔IMF split is enforced editorially at
Stage C:

| Domain class | Primary source | Notes |
|-------------|:--------------:|-------|
| Economic / macro / monetary / fiscal / trade / FDI / exchange-rate | **IMF** | Mandatory for policy-required article types |
| Social / health / education / environment / demographics / defence / agriculture / innovation / governance | **World Bank** | IMF does not cover these domains |

For per-committee indicator selection, see
[`../methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md).
The editorial rules survive in the review checklist in
[`.github/prompts/04-article-generation.md`](../../.github/prompts/04-article-generation.md)
and in the per-committee mapping of
[`../methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md).
