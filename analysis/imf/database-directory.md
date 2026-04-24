<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📚 IMF Database Directory — EU Parliament Monitor

> **Purpose**: Full enumeration of the SDMX 3.0 dataflows advertised by
> `GET https://dataservices.imf.org/REST/SDMX_3.0/dataflow/IMF`, grouped
> by IMF publisher unit, with each database tagged for EP editorial
> relevance. Companion to [`indicator-catalog.md`](indicator-catalog.md)
> — this file enumerates the **databases** (dataflows); the catalog
> enumerates the **indicators** (SDMX codes) inside them.

**📅 Last Updated:** 2026-04-24 | **🏷️ Classification:** Public | **🌀 Wave:** 3

---

## 🔑 Relevance Legend

| Tag | Meaning | EP editorial use |
|:---:|---------|------------------|
| 🟢 | **Actively wired** | Cited by at least one article type today; mapped in `imf-indicator-mapping.md`. Indicators enumerated in `indicator-catalog.md §2`. |
| 🟡 | **On-demand** | Not wired to a recurring article-type mapping but may be queried ad-hoc via `imf-search-databases` + `imf-fetch-data` when an editorial brief requires it. |
| ⚪ | **Out of scope** | Not applicable to EU Parliament Monitor editorial surface (e.g. regional REOs covering non-European geographies, or specialised IMF-operational series). |

Discovery is always possible: any agent can call
`imf-list-databases` or `imf-search-databases("keyword")` to surface a
database not pre-listed here. This file is the **editorial relevance
map**, not a hard allowlist.

---

## 1. Flagship Publications (🟢 all wired)

| Database ID | Full name | Cadence | Forecasts | Relevance | EP usage |
|:-----------:|-----------|:-------:|:---------:|:---------:|----------|
| `WEO` | World Economic Outlook | A (April + October) | +5y | 🟢 | ECON/BUDG/AFET macro + all forward-looking article types |
| `FM` | Fiscal Monitor | A (April + October) | +5y | 🟢 | BUDG debt/deficit, primary + structural balance |
| `GFSR` | Global Financial Stability Report | S (April + October) | — | 🟢 | ECON banking-sector stability; financial-stability risk commentary |
| `EREO` (alias `EUREO`) | Regional Economic Outlook — Europe | S (May + November) | +3y | 🟢 | ECON/AFET Europe-specific macro narrative + policy risk callouts |
| `IFS` | International Financial Statistics | M / Q | — | 🟢 | ECON policy-rate tracking; quarterly growth + monetary aggregates |

> **Note on EREO vs EUREO**: the SDMX dataflow ID is `EREO` in the
> Wave-1 REST surface; some legacy documents still use `EUREO`. The
> TypeScript client accepts either alias and normalises to `EREO`
> before issuing the request.

---

## 2. Statistics Department Series

| Database ID | Full name | Cadence | Forecasts | Relevance | Notes |
|:-----------:|-----------|:-------:|:---------:|:---------:|-------|
| `CPI` | Consumer Price Index | M | — | 🟢 | Breaking-news inflation context |
| `BOP_AGG` | Balance of Payments — Aggregates | Q | — | 🟢 | INTA trade/capital flows, FDI |
| `BOP` | Balance of Payments — detailed | Q | — | 🟡 | Drill-down for components (goods, services, primary/secondary income) |
| `DOT` | Direction of Trade Statistics | M / Q | — | 🟢 | INTA bilateral trade flows EU ↔ RoW (US, CN, RU) |
| `ER` | Exchange Rates (REER / NEER) | M | — | 🟢 | ECON FX competitiveness framing |
| `PCPS` | Primary Commodity Price System | M | — | 🟢 | ITRE energy, AGRI food-price, ENVI raw-material context |
| `CDIS` | Coordinated Direct Investment Survey | A | — | 🟡 | INTA long-run bilateral FDI stock |
| `CPIS` | Coordinated Portfolio Investment Survey | S | — | 🟡 | ECON cross-border portfolio holdings |
| `IRFCL` | International Reserves & Foreign Currency Liquidity | M | — | 🟡 | ECON monetary-policy & FX-reserve commentary |
| `PGI` | Principal Global Indicators | M | — | 🟡 | G20-scoped snapshot for international comparisons |

---

## 3. Fiscal Affairs Department Series

| Database ID | Full name | Cadence | Forecasts | Relevance | Notes |
|:-----------:|-----------|:-------:|:---------:|:---------:|-------|
| `GFS` | Government Finance Statistics | A (+Q subset) | — | 🟢 | BUDG revenue structure, tax-to-GDP, expenditure functional breakdown |
| `GFSM` | GFS Manual reference dataset | A | — | ⚪ | Documentation dataset; use `GFS` for data |
| `FAD_EXPREV` | Expenditure & revenue by economic function | A | — | 🟡 | ECON/BUDG functional allocation |
| `TAXREV` | Tax Revenue (aggregate) | A | — | 🟡 | BUDG tax structure comparisons |

---

## 4. Monetary & Capital Markets Department Series

| Database ID | Full name | Cadence | Forecasts | Relevance | Notes |
|:-----------:|-----------|:-------:|:---------:|:---------:|-------|
| `FSI` | Financial Soundness Indicators | Q | — | 🟢 | ECON banking-sector health — NPLs, capital adequacy, ROA, ROE |
| `MCM_FSAP` | Financial Sector Assessment Program | Episodic | — | 🟡 | ECON country-level financial-sector stress snapshots |
| `SRF` | Standardized Report Forms (monetary statistics) | M | — | 🟡 | ECON central-bank balance sheet + monetary aggregates |

---

## 5. Regional Economic Outlooks (REOs)

| Database ID | Region covered | Cadence | Forecasts | Relevance |
|:-----------:|----------------|:-------:|:---------:|:---------:|
| `EREO` / `EUREO` | Europe | S (May + November) | +3y | 🟢 |
| `MCDREO` | Middle East & Central Asia | S (May + October) | +3y | 🟡 (cited in AFET Middle-East briefs) |
| `APDREO` | Asia & Pacific | S (April + October) | +3y | 🟡 (cited in INTA China-trade + AFET Indo-Pacific briefs) |
| `WHDREO` | Western Hemisphere | S (April + October) | +3y | 🟡 (AFET transatlantic briefs) |
| `AFRREO` | Sub-Saharan Africa | S (April + October) | +3y | ⚪ (DEVE only — rarely cited) |

---

## 6. Research & Analytical Datasets

| Database ID | Full name | Cadence | Relevance | Notes |
|:-----------:|-----------|:-------:|:---------:|-------|
| `HSG` | Historical Spending Dataset (incl. pre-1900) | Episodic | 🟡 | `historical-baseline.md` long-run fiscal context |
| `HPDD` | Historical Public Debt Database | Episodic | 🟡 | BUDG long-run debt-to-GDP comparisons |
| `HISTINF` | Historical Inflation Dataset | Episodic | 🟡 | `historical-baseline.md` long-run inflation context |
| `NMS` | New Member States convergence set | A | 🟡 | ECON convergence-criteria tracking for Bulgaria, Romania, etc. |
| `IMFDB` | Legacy all-indicator composite | — | ⚪ | Superseded by per-domain dataflows |

---

## 7. Specialised / Operational (⚪ mostly)

| Database ID | Full name | Relevance | Notes |
|:-----------:|-----------|:---------:|-------|
| `COFR` | Currency Composition of Foreign Reserves | 🟡 | ECON reserve-currency narrative |
| `IMFSDDS` | Special Data Dissemination Standard | ⚪ | Metadata about national data-publication compliance |
| `GCR` | Global Competitiveness Report dataset | ⚪ | Not an IMF core dataset; sometimes confused with World Economic Forum |
| `SDG` | Sustainable Development Goals (IMF surface) | 🟡 | ENVI/DEVE SDG monitoring — prefer UN SDG dataset for primary sourcing |

---

## 8. Discovery Workflow (agent-usable)

When an editorial brief needs a database not listed above:

1. Call `imf-search-databases("<keyword>")` — returns matching dataflows.
2. Call `imf-get-parameter-defs("<database_id>")` — returns the SDMX
   data-structure definition listing dimensions.
3. Call `imf-get-parameter-codes("<database_id>", "<dimension>", "<optional_search>")`
   — returns the codelist for each dimension (e.g. the set of valid
   `INDICATOR` codes for `WEO`).
4. Call `imf-fetch-data({ databaseId, startYear, endYear, filters })`
   with the discovered codes.

The five-step sequence is the canonical pattern for safe ad-hoc data
fetching and is documented in
[`chart-integration-guide.md §Discovery examples`](chart-integration-guide.md).

---

## 9. Drift Guard

The canonical list of "🟢 actively wired" databases is duplicated in:

- This markdown table (source of truth for editors and agents).
- The integration test
  [`test/integration/mcp/imf-mcp.test.js`](../../test/integration/mcp/imf-mcp.test.js)
  which exercises each 🟢 dataflow against the live SDMX 3.0 endpoint.
- The indicator map in [`indicator-catalog.md`](indicator-catalog.md).

> The earlier `IMF_ACTIVELY_WIRED_DATABASES` / `IMF_POLICY_INDICATORS`
> TypeScript constants lived in `src/utils/imf-data.ts` and were purged
> in the April-2026 aggregator-pipeline migration — the agent now reads
> this document and the indicator catalogue directly at Stage A.

---

## 10. See also

- [`indicator-catalog.md`](indicator-catalog.md) — per-database indicator codes
- [`sdmx-dimensions-reference.md`](sdmx-dimensions-reference.md) — SDMX dimension semantics
- [`release-calendar.md`](release-calendar.md) — rolling vintage calendar
- [`use-cases.md`](use-cases.md) — article-type → database decision matrix
- [`../methodologies/imf-indicator-mapping.md`](../methodologies/imf-indicator-mapping.md) — validator wiring & policy
