# 📊 World Bank Indicator Catalog — Complete Reference

> **Purpose**: Exhaustive catalog of ALL World Bank indicators accessible via the `worldbank-mcp` MCP server, organized by tool and policy domain.

**📅 Last Updated:** 2026-04-11 | **🏷️ Classification:** Public

---

## 🔧 Tool: `get-economic-data`

Parameters: `countryCode` (ISO2), `indicator` (key), `years` (default: 10)

| Indicator Key | World Bank ID | Full Name | Unit | EU Parliament Relevance | Priority |
|--------------|---------------|-----------|------|------------------------|----------|
| `GDP` | NY.GDP.MKTP.CD | GDP (current US$) | US$ | EU budget contributions proportional to GNI; economic weight in Council voting | 🔴 Critical |
| `GDP_GROWTH` | NY.GDP.MKTP.KD.ZG | GDP growth (annual %) | % | Stability & Growth Pact compliance; fiscal governance; recession indicators | 🔴 Critical |
| `GDP_PER_CAPITA` | NY.GDP.PCAP.CD | GDP per capita (current US$) | US$ | Cohesion fund eligibility (75% EU avg threshold); convergence measurement | 🟡 High |
| `GNI` | NY.GNP.MKTP.CD | GNI (current US$) | US$ | EU budget own resources calculation; development aid base | 🟡 High |
| `GNI_PER_CAPITA` | NY.GNP.PCAP.CD | GNI per capita, Atlas method (current US$) | US$ | ODA commitment tracking (0.7% GNI target); development policy | 🟡 High |
| `EXPORTS_GDP` | NE.EXP.GNFS.ZS | Exports of goods & services (% of GDP) | % | Trade policy; export dependency; single market integration | 🟢 Medium |
| `FDI_NET` | BN.KLT.DINV.CD | Foreign direct investment, net inflows (BoP, current US$) | US$ | Investment screening regulation; trade agreement impacts | 🟢 Medium |
| `INFLATION` | FP.CPI.TOTL.ZG | Inflation, consumer prices (annual %) | % | ECB monetary policy; cost-of-living legislation; wage negotiations | 🔴 Critical |
| `UNEMPLOYMENT` | SL.UEM.TOTL.ZS | Unemployment (% of total labor force, ILO modeled) | % | Employment policy; social fund targeting; European Pillar of Social Rights | 🔴 Critical |

### Extended Economic Indicators (via WB API directly)

These indicators are available via the WB API but mapped through our `committee-indicator-map.ts`:

| Constant Name | World Bank ID | Full Name | Unit | Policy Relevance |
|--------------|---------------|-----------|------|-----------------|
| `TRADE` | NE.TRD.GNFS.ZS | Trade (% of GDP) | % | Single market openness; trade agreement impact |
| `TAX_REVENUE` | GC.TAX.TOTL.GD.ZS | Tax revenue (% of GDP) | % | EU tax harmonization; fiscal capacity |
| `GOV_EXPENDITURE` | NE.CON.GOVT.ZS | Government final consumption (% of GDP) | % | Fiscal discipline; Stability Pact |
| `MILITARY_EXPENDITURE` | MS.MIL.XPND.GD.ZS | Military expenditure (% of GDP) | % | NATO 2% target; EU defence fund; CSDP |
| `YOUTH_UNEMPLOYMENT` | SL.UEM.1524.ZS | Youth unemployment (% ages 15-24) | % | Youth Guarantee; skills mismatch |
| `LABOR_PARTICIPATION` | SL.TLF.CACT.ZS | Labor force participation (% pop 15+) | % | Structural employment challenges |
| `EMPLOYMENT_RATIO` | SL.EMP.TOTL.SP.ZS | Employment to population ratio, 15+ | % | Broad employment health |
| `RD_EXPENDITURE` | GB.XPD.RSDV.GD.ZS | R&D expenditure (% of GDP) | % | Horizon Europe; 3% GDP R&D target |
| `FDI_NET_PCT` | BX.KLT.DINV.WD.GD.ZS | FDI net inflows (% of GDP) | % | Investment screening; economic sovereignty |

---

## 🔧 Tool: `get-social-data`

Parameters: `countryCode` (ISO2), `indicator` (key), `years` (default: 10)

| Indicator Key | World Bank ID | Full Name | Unit | EU Parliament Relevance | Priority |
|--------------|---------------|-----------|------|------------------------|----------|
| `POPULATION` | SP.POP.TOTL | Population, total | Count | EP seat allocation; degressive proportionality; burden-sharing | 🔴 Critical |
| `LIFE_EXPECTANCY` | SP.DYN.LE00.IN | Life expectancy at birth (years) | Years | Health policy outcomes; SDG benchmarks | 🟡 High |
| `BIRTH_RATE` | SP.DYN.CBRT.IN | Birth rate, crude (per 1,000) | Rate | Demographic challenges; social protection; pension systems | 🟢 Medium |
| `DEATH_RATE` | SP.DYN.CDRT.IN | Death rate, crude (per 1,000) | Rate | Public health outcomes; aging population policy | 🟢 Medium |
| `INTERNET_USERS` | IT.NET.USER.ZS | Individuals using Internet (% of population) | % | Digital single market; connectivity targets; digital divide | 🟡 High |

### Extended Social Indicators

| Constant Name | World Bank ID | Full Name | Unit | Policy Relevance |
|--------------|---------------|-----------|------|-----------------|
| `POPULATION_GROWTH` | SP.POP.GROW | Population growth (annual %) | % | Rural depopulation; territorial cohesion |
| `NET_MIGRATION` | SM.POP.NETM | Net migration | Count | Migration policy; asylum reform; burden-sharing |
| `GINI_INDEX` | SI.POV.GINI | GINI index (World Bank estimate) | Index | Income inequality; social pillar discussions |

---

## 🔧 Tool: `get-health-data`

Parameters: `countryCode` (ISO2), `indicator` (key), `years` (default: 10)

| Indicator Key | World Bank ID | Full Name | Unit | EU Parliament Relevance | Priority |
|--------------|---------------|-----------|------|------------------------|----------|
| `HEALTH_EXPENDITURE` | SH.XPD.CHEX.GD.ZS | Current health expenditure (% of GDP) | % | EU4Health programme; pandemic preparedness | 🟡 High |
| `PHYSICIANS` | SH.MED.PHYS.ZS | Physicians (per 1,000 people) | Per 1,000 | Healthcare capacity; cross-border health | 🟢 Medium |
| `HOSPITAL_BEDS` | SH.MED.BEDS.ZS | Hospital beds (per 1,000 people) | Per 1,000 | Health infrastructure; pandemic resilience | 🟢 Medium |
| `IMMUNIZATION` | SH.IMM.MEAS | Immunization, measles (% children 12-23 months) | % | Vaccine mandates; public health coordination | 🟢 Medium |
| `HIV_PREVALENCE` | SH.DYN.AIDS.ZS | Prevalence of HIV (% pop ages 15-49) | % | Cross-border health policy | ⚪ Low |
| `MALNUTRITION` | SH.STA.MALN.ZS | Prevalence of undernourishment (% pop) | % | Food security; CAP reform | 🟢 Medium |
| `TUBERCULOSIS` | SH.TBS.INCD | Incidence of tuberculosis (per 100,000) | Per 100k | Cross-border health threats | ⚪ Low |

---

## 🔧 Tool: `get-education-data`

Parameters: `countryCode` (ISO2), `indicator` (key), `years` (default: 10)

| Indicator Key | World Bank ID | Full Name | Unit | EU Parliament Relevance | Priority |
|--------------|---------------|-----------|------|------------------------|----------|
| `LITERACY_RATE` | SE.ADT.LITR.ZS | Literacy rate, adult total (% 15+) | % | Education benchmarks; digital literacy | ⚪ Low |
| `SCHOOL_ENROLLMENT` | SE.PRM.ENRR | School enrollment, primary (% gross) | % | Education access; SDG 4 | ⚪ Low |
| `SCHOOL_COMPLETION` | SE.PRM.CMPT.ZS | Primary completion rate | % | Education outcomes | ⚪ Low |
| `TEACHERS_PRIMARY` | SE.PRM.TCHR | Teachers in primary education | Count | Education investment | ⚪ Low |
| `EDUCATION_EXPENDITURE` | SE.XPD.TOTL.GD.ZS | Government expenditure on education (% GDP) | % | Erasmus+; skills agenda; European Education Area | 🟡 High |

### Extended Education Indicators

| Constant Name | World Bank ID | Full Name | Unit | Policy Relevance |
|--------------|---------------|-----------|------|-----------------|
| `TERTIARY_ENROLLMENT` | SE.TER.ENRR | Tertiary enrollment (% gross) | % | Higher education; European Education Area |

---

## 🔧 Tool: `get-country-info`

Parameters: `countryCode` (ISO2)

Returns: Country name, region, income level, capital city, coordinates.

Useful for: Verifying country metadata, income classification for cohesion policy analysis.

---

## 🔧 Tool: `get-countries`

Parameters: `region` (optional), `incomeLevel` (optional)

Returns: List of countries with ISO2 codes, regions, and income levels.

Useful for: Generating EU-27 comparison tables, filtering by income classification.

---

## 🔧 Tool: `search-indicators`

Parameters: `keyword`

Returns: Matching indicator IDs and descriptions.

Useful for: Discovering new indicators relevant to specific policy debates.

---

## 🔧 Environment & Energy Indicators (via WB API)

These are available through the `committee-indicator-map.ts` but not directly as named keys in the MCP tool:

| Constant Name | World Bank ID | Full Name | Unit | Policy Relevance |
|--------------|---------------|-----------|------|-----------------|
| `CO2_EMISSIONS` | EN.ATM.CO2E.PC | CO₂ emissions (metric tons per capita) | t/capita | Green Deal; 55% reduction target; net-zero 2050 |
| `RENEWABLE_ENERGY` | EG.FEC.RNEW.ZS | Renewable energy (% of total consumption) | % | REPowerEU; energy transition targets |
| `ENERGY_USE` | EG.USE.PCAP.KG.OE | Energy use (kg oil equiv per capita) | kg/capita | Energy efficiency directive |
| `FOREST_AREA` | AG.LND.FRST.ZS | Forest area (% of land area) | % | Biodiversity strategy; deforestation regulation |

---

## 🔧 Agriculture & Food Indicators (via WB API)

| Constant Name | World Bank ID | Full Name | Unit | Policy Relevance |
|--------------|---------------|-----------|------|-----------------|
| `AGRICULTURE_GDP` | NV.AGR.TOTL.ZS | Agriculture, forestry, fishing (% of GDP) | % | CAP budget; agricultural sector weight |
| `CEREAL_YIELD` | AG.YLD.CREL.KG | Cereal yield (kg per hectare) | kg/ha | Food security; agricultural productivity |
| `ARABLE_LAND` | AG.LND.ARBL.ZS | Arable land (% of land area) | % | Land use policy; CAP conditionality |

---

## 🔧 Digital & Technology Indicators (via WB API)

| Constant Name | World Bank ID | Full Name | Unit | Policy Relevance |
|--------------|---------------|-----------|------|-----------------|
| `HIGHTECH_EXPORTS` | TX.VAL.TECH.MF.ZS | High-technology exports (% manufactured exports) | % | Strategic autonomy; technology sovereignty |

---

## 📈 Data Availability Notes

1. **Most recent year**: Typically 2023-2024 for economic data; 2022-2023 for social/health
2. **EU aggregate**: Use country code `EUU` for EU aggregate data (not all indicators available)
3. **Data gaps**: Some education indicators have sparse data for EU member states
4. **Update frequency**: World Bank updates most indicators annually
5. **Military expenditure**: Available for most EU members; critical for AFET/SEDE committee work
6. **Tax revenue**: Available for most EU members; essential for ECON/BUDG committee analysis

---

## 🎯 Indicator Priority Guide for AI Workflows

### 🔴 Always Include (when article covers related policy)
- GDP Growth, Inflation, Unemployment, Population

### 🟡 Include When Relevant
- GDP per capita, Health expenditure, Internet users, Military expenditure, Education expenditure, Life expectancy

### 🟢 Optional Context
- Trade, FDI, Birth/death rates, Hospital beds, Physicians, Renewable energy, CO₂

### ⚪ Specialized (committee-specific only)
- Cereal yield, Arable land, Forest area, High-tech exports, GINI index, TB incidence
