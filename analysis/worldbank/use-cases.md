# 🎯 World Bank Indicator Use Cases for EU Parliament Articles

> **Purpose**: Detailed analysis of when and how each World Bank indicator category adds maximum value to EU Parliament news articles, with priority rankings and integration guidance for AI workflows.

**📅 Last Updated:** 2026-04-11 | **🏷️ Classification:** Public

---

## 📋 Use Case Priority Matrix

| Use Case | Article Types | Indicators | Value Rating | Chart Type |
|----------|--------------|------------|-------------|------------|
| **Economic backdrop** | ALL | GDP Growth, Inflation, Unemployment | ⭐⭐⭐⭐⭐ | Line chart (trend) |
| **Defence spending** | AFET/SEDE motions, breaking | Military Expenditure | ⭐⭐⭐⭐⭐ | Bar chart (comparison) |
| **Tax & fiscal** | ECON/BUDG propositions | Tax Revenue, Gov Expenditure | ⭐⭐⭐⭐ | Grouped bar chart |
| **Climate progress** | ENVI reports, Green Deal | CO₂, Renewable Energy | ⭐⭐⭐⭐ | Dual-axis line chart |
| **Employment crisis** | EMPL motions, social policy | Unemployment, Youth Unemployment, GINI | ⭐⭐⭐⭐ | Stacked bar chart |
| **Trade policy impact** | INTA propositions, trade | Trade, Exports, FDI | ⭐⭐⭐⭐ | Line chart |
| **Health preparedness** | ENVI reports, pandemic | Health Expenditure, Hospital Beds, Physicians | ⭐⭐⭐ | Bar chart |
| **Digital divide** | ITRE/IMCO reports | Internet Users, High-tech Exports | ⭐⭐⭐ | Bar chart |
| **Education investment** | CULT propositions | Education Expenditure, Tertiary Enrollment | ⭐⭐⭐ | Scatter plot |
| **Migration context** | LIBE motions | Net Migration, Population | ⭐⭐⭐ | Area chart |
| **Agricultural reform** | AGRI reports | Agriculture GDP, Cereal Yield | ⭐⭐ | Bar chart |
| **Demographic trends** | AFCO, social policy | Population, Birth Rate, Death Rate, Life Expectancy | ⭐⭐ | Line chart (multi) |
| **Regional convergence** | REGI reports | GDP per Capita (cross-country) | ⭐⭐⭐ | Divergence bar |

---

## 🔴 Critical Use Cases — Always Include

### 1. Economic Backdrop for Any Legislative Activity

**When**: Every article that covers legislative proposals, votes, or committee decisions
**Why**: Economic context answers "why this matters now" for citizens
**Indicators**: GDP Growth (EU aggregate + key member states), Inflation, Unemployment
**Chart**: Line chart showing 5-year trends for EU-27

```
Recommended Chart.js config:
- Type: line
- Datasets: GDP Growth (EU), Inflation (EU), Unemployment (EU)
- X-axis: Years (5-year range)
- Y-axis: Percentage (%)
- Title: "EU Economic Context"
```

**AI Prompt Pattern**:
> "Use `get-economic-data` with countryCode 'DE' (or relevant member state) and indicator keys GDP_GROWTH, INFLATION, UNEMPLOYMENT for 5 years. WB indicator IDs: NY.GDP.MKTP.KD.ZG, FP.CPI.TOTL.ZG, SL.UEM.TOTL.ZS. Include a line chart showing trends. Use this data to explain WHY the current legislative agenda matters in economic context."

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
> "For defence-related articles, fetch military expenditure (MS.MIL.XPND.GD.ZS) for DE, FR, PL, IT, ES, and the EU (EUU). Create a bar chart comparing spending vs the NATO 2% GDP target. Highlight which states meet/exceed the target."

---

### 3. Tax Revenue Analysis

**When**: ECON/BUDG committee work, EU budget debates, tax harmonization proposals, Pillar Two/minimum tax discussions
**Why**: Tax capacity differences across EU drive fiscal governance debates
**Indicators**: Tax Revenue (% of GDP), Government Expenditure (% of GDP)
**Chart**: Grouped bar chart comparing tax revenue across EU member states

```
Recommended Chart.js config:
- Type: bar (grouped)
- Datasets: Tax Revenue, Government Expenditure per country
- Title: "Fiscal Capacity: Tax Revenue & Government Spending"
- Sort: By tax revenue descending
```

**AI Prompt Pattern**:
> "For fiscal policy articles, fetch tax revenue (GC.TAX.TOTL.GD.ZS) and government expenditure (NE.CON.GOVT.ZS) for the Big Four (DE, FR, IT, ES) plus NL and PL. Create a grouped bar chart showing fiscal capacity differences."

---

## 🟡 High-Value Use Cases — Include When Relevant

### 4. Climate Progress Tracking

**When**: ENVI committee reports, Green Deal legislation, climate targets
**Indicators**: CO₂ Emissions per capita, Renewable Energy share
**Chart**: Dual-axis line chart (CO₂ declining, Renewable increasing)

**AI Prompt Pattern**:
> "For Green Deal/climate articles, compare CO₂ emissions (EN.ATM.CO2E.PC) and renewable energy share (EG.FEC.RNEW.ZS) for EU aggregate and 3 key member states. Show convergence toward climate targets."

### 5. Youth Unemployment Crisis

**When**: EMPL committee, Youth Guarantee debates, education-employment transition
**Indicators**: Youth Unemployment, overall Unemployment, GINI index
**Chart**: Stacked bar chart showing youth vs. total unemployment by country

**AI Prompt Pattern**:
> "For employment articles, compare youth unemployment (SL.UEM.1524.ZS) vs total unemployment (SL.UEM.TOTL.ZS) for Southern European states (ES, GR, IT, PT) plus EU average. Include GINI index (SI.POV.GINI) for inequality context."

### 6. Trade & Investment Analysis

**When**: INTA trade agreements, investment screening, sanctions impact
**Indicators**: Trade (% GDP), Exports (% GDP), FDI net inflows
**Chart**: Line chart showing trade openness trends

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
| **Breaking News** | GDP Growth (if economic) | — | — |
| **Week Ahead** | GDP Growth | Unemployment | Topic-specific |
| **Weekly Review** | GDP Growth | Trade (if relevant) | — |
| **Month Ahead** | GDP Growth, Inflation | Unemployment | R&D, CO₂ |
| **Monthly Review** | GDP Growth, Unemployment | Inflation, FDI | — |
| **Propositions** | GDP Growth, Unemployment | Inflation, Trade, CO₂ | Topic-specific |
| **Committee Reports** | Per-committee primary | Per-committee secondary | — |
| **Motions** | Topic-specific only | — | — |
| **Deep Analysis** | GDP Growth, Unemployment, CO₂ | GINI, Trade | Full committee set |

---

## ⚠️ Anti-Patterns: When NOT to Use World Bank Data

1. **Translation workflow** — Never fetch WB data during translation; preserve existing data
2. **Breaking news with no economic angle** — Don't force economic context on procedural/rights-focused stories
3. **Outdated data caveat** — Always note the data year; don't present 2022 data as "current"
4. **Over-enrichment** — Do not exceed the workflow's maxWBCalls; don't drown political analysis in charts
5. **Misleading comparisons** — Don't compare Luxembourg GDP per capita with Romania without noting population differences
