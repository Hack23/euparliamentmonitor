# 🎯 World Bank Indicator Use Cases for EU Parliament Articles

> **Purpose**: Detailed analysis of when and how each World Bank indicator category adds maximum value to EU Parliament news articles, with priority rankings and integration guidance for AI workflows.

**📅 Last Updated:** 2026-04-22 | **🏷️ Classification:** Public

> ### ⚡ (April 2026)
>
> **World Bank is used for non-economic indicators**: health,
> education, social, environment, demographics, defence, agriculture,
> innovation, governance. **Economic context (GDP, inflation,
> unemployment, fiscal, trade, FDI, monetary) is sourced from IMF**
> see [`analysis/imf/use-cases.md`](../imf/use-cases.md).

---

## 📋 Use Case Priority Matrix

| Use Case | Article Types | Indicators | Value Rating | Chart Type |
|----------|--------------|------------|-------------|------------|
| **Economic backdrop** | ALL | *→ see [IMF use-cases](../imf/use-cases.md)* | — | — |
| **Defence spending** | AFET/SEDE motions, breaking | Military Expenditure | ⭐⭐⭐⭐⭐ | Bar chart (comparison) |
| **Climate progress** | ENVI reports, Green Deal | CO₂, Renewable Energy | ⭐⭐⭐⭐ | Dual-axis line chart |
| **Employment crisis** | EMPL motions, social policy | Youth Unemployment, GINI, Labour participation (labour-social; macro unemployment → IMF) | ⭐⭐⭐⭐ | Stacked bar chart |
| **Health preparedness** | ENVI reports, pandemic | Health Expenditure, Hospital Beds, Physicians | ⭐⭐⭐ | Bar chart |
| **Digital divide** | ITRE/IMCO reports | Internet Users, High-tech Exports (innovation) | ⭐⭐⭐ | Bar chart |
| **Education investment** | CULT propositions | Education Expenditure, Tertiary Enrollment | ⭐⭐⭐ | Scatter plot |
| **Migration context** | LIBE motions | Net Migration, Population | ⭐⭐⭐ | Area chart |
| **Agricultural reform** | AGRI reports | Agriculture GDP, Cereal Yield | ⭐⭐ | Bar chart |
| **Demographic trends** | AFCO, social policy | Population, Birth Rate, Death Rate, Life Expectancy | ⭐⭐ | Line chart (multi) |
| **Regional convergence** | REGI reports | Social/health indicators (GDP per Capita → IMF) | ⭐⭐⭐ | Divergence bar |

---

## 🔴 Critical Use Cases — Always Include

### 1. Economic Backdrop — Moved to IMF

> **⚡  flip**: economic backdrop is no longer sourced from World
> Bank. See [`analysis/imf/use-cases.md § 1`](../imf/use-cases.md) for
> the IMF-sourced equivalent — including the AI prompt pattern using
> `imf-fetch-data` with WEO indicators `NGDP_RPCH` (GDP growth),
> `PCPIPCH` (inflation), and `LUR` (unemployment). Aggregate codes `EU`
> and `EA` are accepted by the IMF API (unlike WB MCP which rejects
> `EUU`/`EMU`).

---

### 2. Defence Spending (Military Expenditure)

**When**: AFET/SEDE committee reports, defence policy motions, NATO-related debates, breaking news on security
**Why**: NATO 2% GDP target is a constant benchmark; EU defence integration growing
**Indicators**: Military Expenditure (% of GDP) for key members (DE, FR, PL, IT, ES)
**Chart**: Horizontal bar chart with 2% NATO target annotation line

```
Recommended Chart.js config:
- Type: bar (horizontal)
- Datasets: Military expenditure per country
- Annotation: Horizontal line at 2.0% (NATO target)
- Title: "EU Defence Spending vs NATO 2% Target"
- Color: Countries meeting target in green, below in amber
```

**AI Prompt Pattern**:
> "For defence-related articles, first use `search-indicators` to confirm the World Bank indicator `MS.MIL.XPND.GD.ZS` (Military expenditure, % of GDP). Do not use `get-economic-data` for this API-ID-based indicator. Then fetch the data for individual member states (DE, FR, PL, IT, ES) using the documented indicator fetch path, e.g. `get_indicator_for_country` with indicatorId `MS.MIL.XPND.GD.ZS`. **Do NOT pass the `EUU` aggregate** — `worldbank-mcp@1.0.1` rejects it; build an EU-aggregate by summing individual member-state expenditures, or cite the IMF `EU` aggregate where macro framing is required. Create a bar chart comparing spending vs the NATO 2% GDP target. Highlight which states meet/exceed the target."

---

### 3. Tax Revenue Analysis — Moved to IMF

> **⚡  flip**: tax-revenue / fiscal-capacity analysis is now
> sourced from **IMF Fiscal Monitor** (`FM` dataflow) and **WEO**. See
> [`analysis/imf/use-cases.md`](../imf/use-cases.md) for the IMF
> counterpart — including WEO indicators `GGR_NGDP` (gov revenue % GDP)
> and `GGXCNL_NGDP` (gov net lending/borrowing % GDP). The WB raw-REST
> IDs `GC.TAX.TOTL.GD.ZS` / `NE.CON.GOVT.ZS` remain valid for
> backward-compatibility searches but new articles **must** cite IMF.

---

## 🟡 High-Value Use Cases — Include When Relevant

### 4. Climate Progress Tracking

**When**: ENVI committee reports, Green Deal legislation, climate targets
**Indicators**: CO₂ Emissions per capita, Renewable Energy share
**Chart**: Dual-axis line chart (CO₂ declining, Renewable increasing)

**AI Prompt Pattern**:
> "For Green Deal/climate articles, compare CO₂ emissions (EN.ATM.CO2E.PC) and renewable energy share (EG.FEC.RNEW.ZS) for 3 key member states (DE, FR, PL). **Do not use the `EUU` aggregate** — it is rejected by the MCP; build a member-state list or cite the IMF `EU` aggregate for the macro framing and overlay the WB environmental indicator on top. Show convergence toward climate targets."

### 5. Youth Unemployment Crisis

**When**: EMPL committee, Youth Guarantee debates, education-employment transition
**Indicators**: Youth Unemployment, Labour participation (WB labour-social); **macro unemployment → IMF `LUR`**, GINI index
**Chart**: Stacked bar chart showing youth vs. total unemployment by country

**AI Prompt Pattern**:
> "For employment articles, combine WB youth unemployment (`SL.UEM.1524.ZS`) with IMF `LUR` (overall unemployment, WEO) for Southern European states (ES, GR, IT, PT). Overall unemployment is macro-economic and comes from IMF. Include GINI index (`SI.POV.GINI`) for inequality context."

### 6. Trade & Investment Analysis — Moved to IMF

> **⚡  flip**: trade-volume + FDI + current-account analysis
> comes from **IMF BOP / WEO** — see
> [`analysis/imf/use-cases.md`](../imf/use-cases.md). WB export/import
> indicators remain valid raw-REST IDs but not the preferred source.

### 7. Health System Capacity

**When**: ENVI health legislation, pandemic preparedness, cross-border health
**Indicators**: Health Expenditure (% GDP), Hospital Beds, Physicians per 1,000
**Chart**: Bar chart comparing health infrastructure across member states

### 8. R&D and Innovation Gap

**When**: ITRE industrial policy, Horizon Europe, digital transformation
**Indicators**: R&D Expenditure (% GDP), High-tech Exports, Internet Users
**Chart**: Scatter plot (R&D spending vs. high-tech exports)

---

## 🟢 Contextual Use Cases — Optional Enrichment

### 9. Regional Convergence

**When**: REGI cohesion policy, structural fund debates
**Indicators**: GDP per Capita comparison across member states
**Chart**: Divergence bar chart showing distance from EU average

### 10. Migration Context

**When**: LIBE migration policy, asylum reform, Schengen debates
**Indicators**: Net Migration, Population
**Chart**: Area chart showing migration trends for key receiving countries

### 11. Agricultural Transformation

**When**: AGRI CAP reform, food security, farm sustainability
**Indicators**: Agriculture (% GDP), Cereal Yield, Arable Land
**Chart**: Multi-metric dashboard for agricultural sector health

### 12. Demographic Futures

**When**: AFCO institutional reform, pension debates, population projections
**Indicators**: Population, Birth Rate, Death Rate, Life Expectancy, Population Growth
**Chart**: Demographic pyramid or trend comparison

### 13. Education Investment

**When**: CULT education policy, Erasmus+, European Education Area
**Indicators**: Education Expenditure, Tertiary Enrollment
**Chart**: Scatter plot (education spending vs. outcomes)

---

## 📊 Article Type → Indicator Priority

| Article Type | Critical Indicators | High-Value | Optional |
|-------------|-------------------|------------|---------|
| **Breaking News** | Topic-specific WB (if health/edu/env) | — | — |
| **Week Ahead** | Per-topic non-economic WB | — | Topic-specific |
| **Weekly Review** | Non-economic WB | — | — |
| **Month Ahead** | Non-economic WB (R&D, CO₂) | — | Topic-specific |
| **Monthly Review** | Non-economic WB | — | — |
| **Propositions** | Topic-specific non-economic WB | — | Topic-specific |
| **Committee Reports** | Per-committee primary (non-economic) | Per-committee secondary | — |
| **Motions** | Topic-specific only | — | — |
| **Deep Analysis** | Non-economic WB (CO₂, GINI, health, edu) | Environmental, R&D | Full non-economic set |

> Economic/macro rows (GDP, inflation, unemployment, trade, FDI,
> fiscal) are sourced from IMF — see
> [`analysis/imf/use-cases.md § 5`](../imf/use-cases.md).

---

## ⚠️ Anti-Patterns: When NOT to Use World Bank Data

1. **Translation workflow** — Never fetch WB data during translation; preserve existing data
2. **Economic context** — ⚡: **use IMF, not WB**, for GDP/inflation/unemployment/FDI/trade/fiscal/monetary
3. **Aggregate codes (`EUU`, `EMU`, `ECS`, `OED`, `WLD`...)** — Rejected by `worldbank-mcp@1.0.1`; cite IMF `EU`/`EA` aggregates instead
4. **Breaking news with no policy angle** — Don't force context on procedural/rights-focused stories
5. **Outdated data caveat** — Always note the data year; don't present 2022 data as "current"
6. **Over-enrichment** — Do not exceed the workflow's maxWBCalls; don't drown political analysis in charts
7. **Misleading comparisons** — Don't compare Luxembourg demographics with Romania without noting population differences
