# 🌍 World Bank Indicator Inventory — EU Parliament Monitor

> **Purpose**: Comprehensive reference for World Bank MCP server indicators mapped to European Parliament political entities, committees, and article types.

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-04-11 (UTC) | **🏷️ Classification:** Public

---

## 📚 Inventory Documents

| Document | Description |
|----------|-------------|
| **[Indicator Catalog](indicator-catalog.md)** | Complete reference of ALL World Bank MCP tools and indicators with IDs, descriptions, and data availability |
| **[EU Country Mapping](eu-country-mapping.md)** | EU-27 member states → World Bank country codes with EP seat counts and political entity mapping |
| **[Use Cases](use-cases.md)** | Analysis of when each indicator type adds value to EU Parliament articles, with priority rankings |
| **[Chart Integration Guide](chart-integration-guide.md)** | How to embed World Bank data as Chart.js/D3.js visualizations in generated articles |

---

## 🔑 Quick Reference: World Bank MCP Tools

The `worldbank-mcp` MCP server (v1.0.1) exposes these tools:

| Tool | Parameters | Description |
|------|-----------|-------------|
| `get-economic-data` | `countryCode`, `indicator`, `years` | GDP, inflation, unemployment, trade, FDI |
| `get-social-data` | `countryCode`, `indicator`, `years` | Population, life expectancy, internet users |
| `get-health-data` | `countryCode`, `indicator`, `years` | Health expenditure, hospital beds, physicians |
| `get-education-data` | `countryCode`, `indicator`, `years` | Education expenditure, enrollment, literacy |
| `get-country-info` | `countryCode` | Country metadata (region, income level, capital) |
| `get-countries` | `region`, `incomeLevel` | List countries by region/income filter |
| `search-indicators` | `keyword` | Search available indicators by keyword |

---

## 🎯 Key Indicator Categories for EU Parliament

### Macro-Economic (via `get-economic-data`)

| Indicator Key | WB ID | Name | EU Policy Relevance |
|--------------|-------|------|---------------------|
| `GDP` | NY.GDP.MKTP.CD | GDP (current US$) | EU budget contributions, economic weight |
| `GDP_GROWTH` | NY.GDP.MKTP.KD.ZG | GDP growth (annual %) | Stability Pact compliance, fiscal governance |
| `GDP_PER_CAPITA` | NY.GDP.PCAP.CD | GDP per capita | Cohesion fund eligibility, convergence |
| `GNI_PER_CAPITA` | NY.GNP.PCAP.CD | GNI per capita (Atlas) | ODA commitments (0.7% target) |
| `INFLATION` | FP.CPI.TOTL.ZG | Inflation (CPI annual %) | ECB policy, cost-of-living legislation |
| `UNEMPLOYMENT` | SL.UEM.TOTL.ZS | Unemployment rate | Employment policy, social fund targeting |
| `EXPORTS_GDP` | NE.EXP.GNFS.ZS | Exports (% of GDP) | Trade policy, single market health |
| `FDI_NET` | BN.KLT.DINV.CD | FDI net inflows (BoP) | Investment screening, trade agreements |

### Social (via `get-social-data`)

| Indicator Key | WB ID | Name | EU Policy Relevance |
|--------------|-------|------|---------------------|
| `POPULATION` | SP.POP.TOTL | Population total | EP seat allocation, burden-sharing |
| `LIFE_EXPECTANCY` | SP.DYN.LE00.IN | Life expectancy | Health policy, SDG benchmarks |
| `BIRTH_RATE` | SP.DYN.CBRT.IN | Birth rate (per 1,000) | Demographics, social protection |
| `DEATH_RATE` | SP.DYN.CDRT.IN | Death rate (per 1,000) | Public health outcomes |
| `INTERNET_USERS` | IT.NET.USER.ZS | Internet users (% population) | Digital single market, connectivity |

### Health (via `get-health-data`)

| Indicator Key | WB ID | Name | EU Policy Relevance |
|--------------|-------|------|---------------------|
| `HEALTH_EXPENDITURE` | SH.XPD.CHEX.GD.ZS | Health expenditure (% GDP) | EU4Health, pandemic preparedness |
| `PHYSICIANS` | SH.MED.PHYS.ZS | Physicians per 1,000 | Healthcare capacity |
| `HOSPITAL_BEDS` | SH.MED.BEDS.ZS | Hospital beds per 1,000 | Health infrastructure |
| `IMMUNIZATION` | SH.IMM.MEAS | Measles immunization (%) | Public health mandates |
| `HIV_PREVALENCE` | SH.DYN.AIDS.ZS | HIV prevalence | Health policy |
| `MALNUTRITION` | SH.STA.MALN.ZS | Undernourishment prevalence | Food security policy |
| `TUBERCULOSIS` | SH.TBS.INCD | TB incidence (per 100k) | Cross-border health |

### Education (via `get-education-data`)

| Indicator Key | WB ID | Name | EU Policy Relevance |
|--------------|-------|------|---------------------|
| `LITERACY_RATE` | SE.ADT.LITR.ZS | Adult literacy rate | Education benchmarks |
| `SCHOOL_ENROLLMENT` | SE.PRM.ENRR | Primary enrollment (gross) | Education access |
| `SCHOOL_COMPLETION` | SE.PRM.CMPT.ZS | Primary completion rate | Education outcomes |
| `TEACHERS_PRIMARY` | SE.PRM.TCHR | Primary teachers count | Education investment |
| `EDUCATION_EXPENDITURE` | SE.XPD.TOTL.GD.ZS | Education spending (% GDP) | Erasmus+, skills agenda |

---

## 🏛️ EP Committee → Indicator Mapping Summary

See [indicator-catalog.md](indicator-catalog.md) for full details. Key committee mappings:

| Committee | Primary Indicators | Policy Domain |
|-----------|-------------------|---------------|
| **ECON** | GDP Growth, Inflation, Unemployment | Economic governance |
| **ENVI** | CO₂ Emissions, Renewable Energy, Health Expenditure | Climate, health |
| **EMPL** | Unemployment, Youth Unemployment, GINI | Employment, social |
| **AFET** | Military Expenditure, Trade, FDI | Foreign affairs, defence |
| **ITRE** | R&D Expenditure, Renewable Energy, High-tech Exports | Industry, research |
| **AGRI** | Agriculture GDP, Cereal Yield, Arable Land | Agriculture, food |
| **BUDG** | GDP, Government Expenditure, Tax Revenue | EU budget |
| **SEDE** | Military Expenditure, GDP | Security, defence |
| **INTA** | Trade, Exports, FDI, High-tech Exports | International trade |
| **LIBE** | Net Migration, Population | Civil liberties, migration |

---

## 📊 Integration Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Agentic Workflow│     │ World Bank MCP   │     │ Article Generator   │
│  (.md prompts)   │────▶│ Server (worldbank │────▶│ (TypeScript pipeline)│
│                  │     │  -mcp@1.0.1)     │     │                     │
│ • EP MCP data    │     │ • get-economic   │     │ • Chart.js config   │
│ • WB indicators  │     │ • get-social     │     │ • Dashboard panels  │
│ • Analysis       │     │ • get-health     │     │ • Metric cards      │
└─────────────────┘     │ • get-education  │     │ • D3 visualizations │
                         │ • get-countries  │     └─────────────────────┘
                         └──────────────────┘
```

---

## 🔒 ISMS Compliance

| Control | Implementation |
|---------|---------------|
| **ISO 27001 A.5.10** | Only public World Bank Open Data used |
| **GDPR Data Minimization** | Country-level aggregates only, no personal data |
| **ISO 27001 A.8.28** | All inputs validated before embedding in HTML |
| **NIST CSF ID.AM** | Data sources clearly attributed to World Bank |

---

## 📖 Related Documentation

- [`src/constants/committee-indicator-map.ts`](../../src/constants/committee-indicator-map.ts) — TypeScript mappings
- [`src/types/world-bank.ts`](../../src/types/world-bank.ts) — Type definitions
- [`src/mcp/wb-mcp-client.ts`](../../src/mcp/wb-mcp-client.ts) — WB MCP client
- [`src/generators/dashboard-content.ts`](../../src/generators/dashboard-content.ts) — Chart.js integration
- [`js/chart-init.js`](../../js/chart-init.js) — Client-side Chart.js hydration
