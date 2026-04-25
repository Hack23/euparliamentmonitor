# 🌍 World Bank Indicator Integration — EU Parliament Monitor

> **Purpose**: Central reference for integrating World Bank economic data into EU Parliament intelligence analysis. This directory contains the complete indicator inventory, country mappings, chart templates, and use case analysis for AI workflows generating news articles and analysis documents.

**📅 Last Updated:** 2026-04-22 | **🏷️ Classification:** Public

> ### ⚡ Scope (Wave-4, April 2026)
>
> **World Bank is the source for non-economic indicators only** — health,
> education, social, environment, demographics, defence, agriculture,
> innovation, governance. **Economic/monetary/fiscal context (GDP,
> inflation, unemployment, FDI, trade, fiscal balance, debt, monetary,
> exchange rates) is sourced from IMF** — see [`analysis/imf/`](../imf/).
> Enforced editorially at Stage-C review per
> [`.github/prompts/04-article-generation.md`](../../.github/prompts/04-article-generation.md);
> the legacy runtime gate `articlePolicyHasEconomicContext` in
> `src/utils/content-validator.ts` was purged in the April-2026
> aggregator-pipeline migration.

---

## 📂 Directory Contents

| Document | Description | Audience |
|----------|------------|----------|
| [`indicator-catalog.md`](indicator-catalog.md) | **200+ indicators** organized by 10 EP policy domains with WB IDs, tools, and priorities (§1 "Economic" redirects to IMF) | AI workflows, developers |
| [`eu-country-mapping.md`](eu-country-mapping.md) | EU-27 + comparison groups (G7, BRICS, candidates, trade partners) with WB codes; aggregate codes **not supported** by MCP | AI workflows, analysis |
| [`chart-integration-guide.md`](chart-integration-guide.md) | Chart.js templates (6) + Mermaid templates (7) for WB data visualization | AI workflows, frontend |
| [`use-cases.md`](use-cases.md) | When each **non-economic** indicator type adds value, ranked by priority | AI workflows, product |

---

## 🔑 Quick Reference

### World Bank MCP Tools

| Tool | # Indicators | Data Type | Key Use |
|------|:-----------:|-----------|---------|
| `get-economic-data` | 9 | GDP, inflation, unemployment, trade | **⚠️ Deprecated for new articles — use IMF `imf-fetch-data`** ([`src/mcp/imf-mcp-client.ts`](../../src/mcp/imf-mcp-client.ts)) |
| `get-social-data` | 5 | Population, life expectancy, internet | Demographics, social policy |
| `get-health-data` | 7 | Health spending, physicians, disease | Health policy, pandemic |
| `get-education-data` | 5 | Education spending, enrollment | Education, skills agenda |
| `get-country-info` | — | Metadata (region, income, capital) | Country context |
| `get-countries` | — | Country listing by filters | Comparison groups |
| `search-indicators` | — | Keyword search | Discover new indicators (including non-catalogued ones) |

> **⚠️ Country code guard**: `worldbank-mcp@1.0.1` rejects aggregate
> codes (`EUU`, `EMU`, `ECS`, `OED`, `WLD`, `NAC`, `EAS`, `SSF`) and the
> informal `UK` alias. Agents must avoid these codes at Stage A. The
> earlier runtime helper `isMCPSupportedWBCountryCode(code)` in
> `src/utils/world-bank-data.ts` was purged in the April-2026
> aggregator-pipeline migration; the allow-list is now an editorial
> rule — use the ISO-3166 codes listed in
> [`eu-country-mapping.md`](eu-country-mapping.md) and the comparison
> groups in §2 below. For EU-aggregate economic context, use IMF
> `EU`/`EA` aggregates (accepted by the IMF API).

### Total Indicator Coverage

| Source | Count | Description |
|--------|:-----:|-------------|
| MCP Tool indicators (direct keys) | 26 | Fetchable by name via MCP tools |
| Extended indicators (WB API IDs) | 140+ | Mapped in committee-indicator-map.ts |
| **Total catalog** | **200+** | Documented in indicator-catalog.md |

### Country Coverage

| Group | Count | Countries |
|-------|:-----:|-----------|
| EU-27 | 27 | All EU member states |
| EU Aggregate | 3 | EUU, EMU, ECS |
| G7 Non-EU | 4 | US, GB, JP, CA |
| BRICS | 5 | CN, IN, BR, RU, ZA |
| EU Candidates | 9 | UA, TR, RS, ME, AL, MK, MD, BA, GE |
| Trade Partners | 5 | KR, AU, NO, CH, IL |
| WB Aggregates | 5 | OED, WLD, NAC, EAS, SSF |

---

## 🏛️ EP Committee → Indicator Mapping

All 22 EP committees are mapped to relevant World Bank indicators in `src/constants/committee-indicator-map.ts` (1,350 lines). Key mappings:

| Committee | Policy Domain | Primary Indicators |
|-----------|-------------|-------------------|
| **ECON** | Economic & Monetary | *→ IMF WEO/FM (`NGDP_RPCH`, `PCPIPCH`, `LUR`, `GGXWDG_NGDP`)* — see [`analysis/imf/`](../imf/) |
| **BUDG** | Budgets | *→ IMF FM (`GGR_NGDP`, `GGXCNL_NGDP`)* + WB own-resources metadata |
| **EMPL** | Employment & Social | Youth Unemployment (WB `SL.UEM.1524.ZS`), GINI, Labor Participation; macro unemployment → IMF `LUR` |
| **ENVI** | Environment & Health | CO₂ Emissions, Renewable Energy, Health Expenditure |
| **ITRE** | Industry & Energy | R&D Expenditure, Energy Use, High-tech Exports |
| **AFET** | Foreign Affairs | Military Expenditure, Net ODA; FDI → IMF BOP |
| **SEDE** | Security & Defence | Military Expenditure, Armed Forces |
| **AGRI** | Agriculture | Agriculture % GDP, Cereal Yield, Arable Land |
| **DEVE** | Development | GNI per Capita (IMF), Net ODA (WB), Life Expectancy (WB) |
| **FEMM** | Women's Rights | Female Labor Participation, Women in Parliament |

---

## 📊 Visualization Options

### For HTML Articles (Chart.js)
- **Line charts**: GDP growth, inflation, unemployment trends over time
- **Bar charts**: Country comparisons, defence spending vs NATO 2% target
- **Pie/doughnut**: GDP share, energy mix composition
- **Radar**: Multi-dimension country profiles
- **Scatter/bubble**: R&D vs high-tech exports correlation

### For Analysis Documents (Mermaid)
- **`xychart-beta`**: Bar/line charts for indicator comparisons
- **`quadrantChart`**: Country positioning (growth vs employment)
- **`pie`**: GDP share, energy composition
- **`graph`**: Indicator flow to stakeholder impact
- **`gantt`**: Defence spending timeline, target progress

---

## 🔗 Integration Points

### TypeScript Source Files

| File | Purpose |
|------|---------|
| `src/types/world-bank.ts` | PolicyRelevantIndicators (25 fields), WBToolIndicatorKeys, WBMCPToolName |
| `src/utils/world-bank-data.ts` | COMPARISON_COUNTRIES, WB_AGGREGATE_LABELS, EU_COUNTRY_CODES, formatIndicatorValue() |
| `src/constants/committee-indicator-map.ts` | WB_INDICATORS (34 IDs), committee→indicator mappings |
| `src/generators/dashboard-content.ts` | buildDashboardSection(), Chart.js config generation |
| `js/chart-init.js` | Client-side Chart.js hydration with EU Parliament color palette |

### Workflow Integration

All 9 content workflow `.md` files include:
- **Full Reference Documents** block pointing to this directory
- **Available WB MCP Tools** table with all 7 tools
- **Extended Indicators** table with fiscal, defence, climate, labor, agriculture, innovation, demographics, governance indicators
- **Chart Integration** guidance specific to each article type
- **Max WB call limits** per workflow type

### Analysis Template Integration

Three analysis templates include data sections; note the Wave-2 split:

- `analysis/templates/per-file-political-intelligence.md` — Economic Context section sourced from **IMF** (WEO vintage); non-economic context (health/edu/env) from WB
- `analysis/templates/stakeholder-impact.md` — WB indicators per stakeholder group (non-economic); macro-economic stakeholder framing via IMF
- `analysis/templates/synthesis-summary.md` — Period Economic Snapshot sourced from **IMF** (moved from WB in Wave 2); non-economic movers remain on WB

---

## ⚠️ ISMS Compliance

| Framework | Requirement | Implementation |
|-----------|------------|---------------|
| ISO 27001 A.5.10 | Appropriate use of information | Public World Bank data only |
| GDPR | Data minimization | Country-level aggregates only (no personal data) |
| ISO 27001 A.8.28 | Secure coding | Input validation via escapeHTML() before embedding |
| NIST CSF ID.AM | Asset identification | All data sources attributed to World Bank |
