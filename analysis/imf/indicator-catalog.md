# 🌐 IMF Indicator Catalog — EU Parliament Monitor

> Canonical catalog of IMF indicators relevant to European Parliament
> intelligence, organised by policy domain. Complements
> `analysis/worldbank/indicator-catalog.md`; together they cover the full
> economic/social/environmental surface required by policy article types.

**📅 Last Updated:** 2026-04-25 | **🏷️ Classification:** Public | **🌀 Wave:** 4

---

## 1. Database Inventory (policy-relevant subset)

| Database | Name | Frequency | Forecasts | Typical EP use |
|:--------:|------|:---------:|:---------:|----------------|
| `WEO` | World Economic Outlook | Annual (+Q in some series) | ✅ +5y | ECON/BUDG/AFET macro/fiscal backdrop |
| `FM` | Fiscal Monitor | Annual | ✅ +5y | BUDG debt/deficit, primary/structural balance |
| `GFSR` | Global Financial Stability Report | Semi-annual (Apr + Oct) | — | ECON financial-stability commentary |
| `EREO` | Regional Economic Outlook — Europe | Semi-annual (May + Nov) | ✅ +3y | ECON/AFET Europe-specific narrative |
| `IFS` | International Financial Statistics | Monthly / Quarterly | — | ECON policy-rate tracking, quarterly growth context |
| `CPI` | Consumer Price Index | Monthly | — | Breaking news inflation context |
| `BOP_AGG` | Balance of Payments — Aggregates | Quarterly | — | INTA trade balance, FDI flow monitoring |
| `BOP` | Balance of Payments — detailed components | Quarterly | — | INTA component drill-down |
| `DOT` | Direction of Trade Statistics | Monthly / Quarterly | — | INTA bilateral trade flows EU ↔ RoW |
| `ER` | Exchange Rates (REER / NEER) | Monthly | — | ECON FX-competitiveness framing |
| `PCPS` | Primary Commodity Price System | Monthly | — | ITRE energy, AGRI food price context |
| `CDIS` | Coordinated Direct Investment Survey | Annual | — | INTA long-run bilateral FDI stock |
| `CPIS` | Coordinated Portfolio Investment Survey | Semi-annual | — | ECON cross-border portfolio holdings |
| `IRFCL` | International Reserves & FX Liquidity | Monthly | — | ECON monetary-policy & reserve commentary |
| `SRF` | Standardized Report Forms (monetary) | Monthly | — | ECON central-bank balance sheet |
| `GFS` | Government Finance Statistics | Annual (+Q subset) | — | BUDG revenue structure, ECON fiscal stance |
| `FSI` | Financial Soundness Indicators | Quarterly | — | ECON banking-sector stability |
| `HSG` | Historical Spending Dataset | Episodic | — | Long-run fiscal context (historical-baseline) |
| `HPDD` | Historical Public Debt Database | Episodic | — | Long-run debt-to-GDP comparisons |
| `HISTINF` | Historical Inflation Dataset | Episodic | — | Long-run inflation context |
| `SDG` | Sustainable Development Goals (IMF) | Annual | — | ENVI / DEVE SDG monitoring |

The full upstream inventory includes ~155 databases — see
[`database-directory.md`](database-directory.md) for the complete
editorial-relevance map. Use `imf-search-databases` to discover any
database not pre-listed.

---

## 2. Policy Domain → IMF Indicator Mapping

### 2.1 Macroeconomic / ECON

| Indicator key | Database | SDMX code | Freq | Forecast | Display label |
|---------------|:--------:|:---------:|:----:|:--------:|---------------|
| `gdp` | WEO | `NGDPD` | A | ✅ | GDP, current USD |
| `gdpGrowth` | WEO | `NGDP_RPCH` | A | ✅ | Real GDP growth |
| `gdpPerCapita` | WEO | `NGDPDPC` | A | ✅ | GDP per capita, current USD |
| `inflation` | WEO | `PCPIPCH` | A | ✅ | CPI inflation |
| `unemployment` | WEO | `LUR` | A | ✅ | Unemployment rate |
| `currentAccount` | WEO | `BCA_NGDPD` | A | ✅ | Current account, % of GDP |
| `policyRate` | IFS | `FPOLM_PA` | M | — | Monetary policy rate |
| `realEffectiveExchangeRate` | ER | `EREER_IX` | M | — | Real effective exchange rate |

### 2.2 Fiscal / BUDG

| Indicator key | Database | SDMX code | Freq | Forecast | Display label |
|---------------|:--------:|:---------:|:----:|:--------:|---------------|
| `govDebt` | FM | `GGXWDG_NGDP` | A | ✅ | General government gross debt, % of GDP |
| `primaryBalance` | FM | `GGXONLB_NGDP` | A | ✅ | Primary balance, % of GDP |
| `structuralBalance` | FM | `GGSB_NPGDP` | A | ✅ | Structural balance, % of potential GDP |

### 2.3 Trade / INTA

| Indicator key | Database | SDMX code | Freq | Forecast | Display label |
|---------------|:--------:|:---------:|:----:|:--------:|---------------|
| `exportsGdp` | WEO | `TX_RPCH` | A | ✅ | Export volume growth |
| `fdiInflow` | BOP_AGG | `BFD_BP6_USD` | Q | — | FDI inflow, USD |

### 2.4 Defence / AFET / SEDE

The WEO does not publish `MS.MIL.XPND.GD.ZS` directly; use World Bank for
military-expenditure-to-GDP and cross-reference with IMF general-government
expenditure aggregates where needed.

### 2.5 Not covered by IMF — remain on World Bank

- Social (population, life expectancy, internet users) — WB `SP.POP.*`, `SP.DYN.LE00.IN`, `IT.NET.USER.ZS`
- Health (physicians, hospital beds, immunisation) — WB `SH.MED.*`, `SH.IMM.*`
- Education (literacy, enrolment, teachers) — WB `SE.*`
- Environment (CO₂, renewable energy) — WB `EN.ATM.CO2E.PC`, `EG.FEC.RNEW.ZS`
- Innovation (R&D, high-tech exports) — WB `GB.XPD.RSDV.GD.ZS`, `TX.VAL.TECH.MF.ZS`

---

## 3. Frequency & Release Cadence

| Dataset | Release cadence | Typical lag (actuals) | Forecast horizon |
|---------|-----------------|-----------------------|------------------|
| WEO | April + October | 3 months | Current + 5 years |
| FM (Fiscal Monitor) | April + October | 3 months | Current + 5 years |
| IFS | Monthly auto-publication (SDMX 3.0) | 4–8 weeks (Q) | — |
| CPI | Monthly | 4–6 weeks | — |
| BOP_AGG | Quarterly | ~10–13 weeks | — |
| ER | Monthly | ~2 weeks | — |
| PCPS | Monthly | ~2 weeks | — |

---

## 4. Observation Attributes

IMF SDMX-JSON responses may carry `OBS_STATUS` with the following codes
relevant to EU Parliament Monitor:

| Code | Meaning | EP handling |
|:----:|---------|-------------|
| `A` | Actual | Default; no marker required |
| `F` | Forecast / Projection | **MUST** be labelled "forecast" or "projection" in prose, with vintage |
| `E` | Estimate | Labelled "IMF estimate" with vintage |
| `B` | Break in series | Cite methodological footnote |
| `P` | Provisional | Treated like `A` with "provisional" prose label |

The native TypeScript client in [`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts)
returns the raw SDMX-JSON payload inside the `MCPToolResult` envelope
(`response.content[0].text`). Agents parse it with any standard
SDMX-JSON reader. This catalog does **not** imply that the aggregator or
client automatically propagates `OBS_STATUS` into rendered HTML. If a row
represents an `F` (forecast) observation, the authoring/template layer
MUST add `data-forecast="true"` explicitly to that table row after
inspecting the source data. That explicit markup enables the Chart.js and
CSS hooks described in
[`chart-integration-guide.md §7`](chart-integration-guide.md#7-html-template-hook).

---

## 5. Confidence & Methodological Caveats

- **IMF optimism bias**: WEO forecasts historically overstate medium-term
  growth (see IMF's own 2015 Forecast Accuracy Review). Articles citing
  forecasts SHOULD include one sentence acknowledging the methodological
  caveat, especially for 3+ year horizons.
- **Vintage drift**: Each WEO vintage revises prior forecasts. Record
  vintage in the article HTML (`data-vintage="WEO-April-2026"`) so
  reprocessing surfaces the original data-as-of time.
- **Membership aggregates**: `EA` (Euro Area) membership historically
  grew (Croatia joined in 2023); timeseries use the current membership,
  not the contemporaneous one. Cite "EA current membership" in charts.
- **Country code drift**: Kosovo is `UVK` at IMF on some legacy datasets
  vs. `XKX` at WB. See [`eu-country-mapping.md §4`](eu-country-mapping.md#4-codelist-drift-vs-world-bank).

---

## 6. Fingerprint Convention

Stage-C editorial review uses the following SDMX-code and product-name
strings as the authoritative fingerprints for an "IMF citation" in any
article:

- **Product names**: `IMF`, `International Monetary Fund`, `WEO`,
  `World Economic Outlook`, `Fiscal Monitor`, `data.imf.org`,
  `dataservices.imf.org`.
- **Virtual tool names** (the five exposed by
  [`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts)):
  `imf-list-databases`, `imf-search-databases`, `imf-get-parameter-defs`,
  `imf-get-parameter-codes`, `imf-fetch-data`.
- **SDMX indicator codes**: every code in Section 2 above
  (`NGDPD`, `NGDP_RPCH`, `PCPIPCH`, `LUR`, `GGXWDG_NGDP`,
  `GGXONLB_NGDP`, `FPOLM_PA`, `BFD_BP6_USD`, `EREER_IX`, …).

Drift guard: [`test/integration/mcp/imf-mcp.test.js`](../../test/integration/mcp/imf-mcp.test.js)
fails if the five tool names in `IMF_MCP_TOOLS` (exported from
[`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts)) diverge
from the list above.

> The earlier runtime fingerprint tables (`IMF_STRONG_FINGERPRINTS`,
> `IMF_INDICATOR_CODES`, `IMF_INDICATOR_SDMX_CODES`, `IMF_POLICY_INDICATORS`)
> lived in `src/utils/content-validator.ts` and `src/utils/imf-data.ts`
> and were purged in the April-2026 aggregator-pipeline migration.
> Fingerprinting is now an editorial responsibility enforced at Stage C
> per [`.github/prompts/04-article-generation.md §5`](../../.github/prompts/04-article-generation.md).
