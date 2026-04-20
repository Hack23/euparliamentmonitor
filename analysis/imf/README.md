# 🌐 IMF Data Integration — EU Parliament Monitor

> **Purpose**: Central reference for integrating IMF (International Monetary
> Fund) data into EU Parliament intelligence analysis. This directory is the
> IMF counterpart to `analysis/worldbank/` and is the source-of-truth for AI
> workflows that enrich articles with **fresher macro/fiscal context and
> native multi-year forecasts** sourced from the IMF SDMX 3.0 API via the
> [`c-cf/imf-data-mcp`](https://github.com/c-cf/imf-data-mcp) MCP server.

**📅 Last Updated:** 2026-04-20 | **🏷️ Classification:** Public | **🌀 Wave:** 1 (Additive dual-source; WB remains the validator's primary gate)

---

## 📂 Directory Contents

| Document | Description | Audience |
|----------|-------------|----------|
| [`indicator-catalog.md`](indicator-catalog.md) | ~80 IMF indicators across WEO, IFS, FM, BOP, ER, PCPS, organised by 10 EP policy domains with SDMX codes, frequency, and forecast horizon | AI workflows, developers |
| [`eu-country-mapping.md`](eu-country-mapping.md) | EU-27 + comparison groups with IMF country codes and aggregation codelists (`EA`, `EU`, `G7`, `G20`) | AI workflows, analysis |
| [`chart-integration-guide.md`](chart-integration-guide.md) | Chart.js templates with forecast-shaded overlay + Mermaid `xychart-beta` patterns for IMF data visualisation | AI workflows, frontend |
| [`use-cases.md`](use-cases.md) | When IMF WEO/IFS/FM adds value beyond World Bank WDI, ranked by article type | AI workflows, product |

---

## 🔑 Quick Reference

### IMF MCP Tools

| Tool | Purpose | Typical arguments |
|------|---------|-------------------|
| `imf-list-databases` | Enumerate every IMF database on the server | — |
| `imf-search-databases` | Free-text search databases by keyword | `keyword` |
| `imf-get-parameter-defs` | List dimensions for a database (country / indicator / frequency / …) | `database_id` |
| `imf-get-parameter-codes` | List valid codes for a single dimension (+ optional search) | `database_id`, `parameter`, `search` |
| `imf-fetch-data` | Fetch a time series slice for given dimension codes | `database_id`, `start_year`, `end_year`, `filters` |

The canonical tool list is duplicated in `IMF_MCP_TOOLS` in
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
- **ISMS**: Supply-chain vetted per ISO 27001 A.5.23 and A.8.28;
  `c-cf/imf-data-mcp` is pinned in `.github/copilot-mcp.json` (Wave 2+) and
  scanned via `gh-advisory-database`.
- **Firewall**: Only `data.imf.org` is added to the `network.allowed` block
  in workflow frontmatter. The legacy `dataservices.imf.org` domain is **NOT**
  added unless the MCP server explicitly requires it.
- **Forecast provenance**: Every article citing an IMF projection MUST label
  it as "forecast" or "projection" and cite the vintage (e.g.
  "WEO April 2026"). This is enforced prospectively by the
  `articlePolicyHasEconomicContext` Wave 2 validator flip.

---

## 🔁 Relationship to World Bank

In Wave 1 (this release), the World Bank validator gate
(`articlePolicyHasWorldBank`) remains the enforced quality gate.
`articlePolicyHasEconomicContext` is **available** in the validator as
an OR-gate helper so articles can satisfy the requirement via either
source, but it is not yet the default. See
[`analysis/methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md)
for the committee-level mapping and migration sequence.
