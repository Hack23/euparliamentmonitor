# 🌐 IMF Indicator Catalog — EU Parliament Monitor

> Canonical catalog of IMF indicators relevant to European Parliament
> intelligence, organised by policy domain. Complements
> `analysis/worldbank/indicator-catalog.md`; together they cover the full
> economic/social/environmental surface required by policy article types.

**📅 Last Updated:** 2026-04-20 | **🏷️ Classification:** Public | **🌀 Wave:** 1

---

## 1. Database Inventory (policy-relevant subset)

| Database | Name | Frequency | Forecasts | Typical EP use |
|:--------:|------|:---------:|:---------:|----------------|
| `WEO` | World Economic Outlook | Annual (+Q in some series) | ✅ +5y | ECON/BUDG/AFET macro/fiscal backdrop |
| `IFS` | International Financial Statistics | Monthly / Quarterly | — | ECON policy-rate tracking, quarterly growth context |
| `CPI` | Consumer Price Index | Monthly | — | Breaking news inflation context |
| `FM` | Fiscal Monitor | Annual | ✅ +5y | BUDG debt/deficit, primary/structural balance |
| `BOP_AGG` | Balance of Payments | Quarterly | — | INTA trade balance, FDI flow monitoring |
| `ER` | Exchange Rates (REER / NEER) | Monthly | — | ECON FX-competitiveness framing |
| `PCPS` | Primary Commodity Price System | Monthly | — | ITRE energy, AGRI food price context |
| `GFS` | Government Finance Statistics | Annual | — | BUDG revenue structure, ECON fiscal stance |
| `FSI` | Financial Soundness Indicators | Quarterly | — | ECON banking-sector stability |
| `SDG` | Sustainable Development Goals | Annual | — | ENVI / DEVE SDG monitoring |

The full upstream inventory includes ~155 databases; only those above are
cited by EU Parliament Monitor today. Use `imf-search-databases` to
discover others on demand.

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

The TypeScript parser in `src/utils/imf-data.ts` (`parseSDMXJSON`)
flags `F` values as `isForecast=true`; other codes are retained in the
raw response but not currently consumed by the Wave-1 pipeline.

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
  vs. `XKX` at WB. See `IMF_COUNTRY_CODE_OVERRIDES` in
  `src/utils/imf-data.ts`.

---

## 6. Validator Wiring

- `IMF_STRONG_FINGERPRINTS` in `src/utils/content-validator.ts` includes
  every tool identifier and the product names (`IMF`, `World Economic
  Outlook`, `Fiscal Monitor`).
- `IMF_INDICATOR_CODES` contains all SDMX codes listed in Section 2 and
  is kept in lock-step with `IMF_INDICATOR_SDMX_CODES` in
  `src/utils/imf-data.ts` (itself derived from `IMF_POLICY_INDICATORS`).
- Drift guard: `test/integration/mcp/imf-mcp.test.js` and
  `test/unit/imf-data.test.js` fail if the indicator list or tool list
  changes without the corresponding documentation update.
