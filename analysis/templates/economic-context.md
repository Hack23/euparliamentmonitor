<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 💹 Economic Context Template — IMF Primary Anchor + World Bank Non-Economic Cross-Refs

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/economic-context.md`. Anchor EP policy topics in **IMF** macro/fiscal/trade/monetary data as the primary source (Wave-4 policy). Use **World Bank** only for non-economic cross-refs (health, education, social, environment, demographics). See [methodologies/per-artifact-methodologies.md §economic-context](../methodologies/per-artifact-methodologies.md#economic-context).

> **🎯 Purpose:** Bridge EP legislative activity to real-economy fundamentals using IMF indicators (WEO / Fiscal Monitor / IFS / BOP / ER / PCPS / GFSR / EREO / FSI / GFS / DOT). Under the **Wave-4 IMF-primary editorial policy** IMF is the required primary source for every economic claim; WB is additive for non-economic context only. Enforced at Stage-C editorial review per [`.github/prompts/04-article-generation.md §5`](../../.github/prompts/04-article-generation.md) — the legacy runtime gates (`articlePolicyHasEconomicContext` / `articlePolicyHasIMFEconomicEvidence` in `src/utils/content-validator.ts`, surrounded by `src/utils/validate-articles.ts`) were purged in the April-2026 aggregator-pipeline migration.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: EC-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Primary Data Source** | `IMF (vintage: [REQUIRED: e.g. WEO-April-2026])` |
| **Secondary (non-economic)** | `[REQUIRED: World Bank or "None"]` |
| **IMF Indicators Cited** | `[REQUIRED: count — must meet article-type floor from imf-indicator-mapping.md §8]` |
| **Forecast Horizon** | `[REQUIRED: current / t+1 / t+3 / t+5 — sizes the optimism-bias caveat per forecast-accuracy-baseline.md]` |
| **Triangulation Performed** | `[REQUIRED: Yes/No — required for Tier-1 + high-sensitivity indicators per cross-source-triangulation.md]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Topic-to-Indicator Mapping

| EP Policy Topic | IMF Indicator (primary) | IMF Database | WB Indicator (non-economic cross-ref only) | Latest Value | Vintage Date |
|-----------------|-------------------------|:-------------|--------------------------------------------|:------------:|:------------:|
| `[REQUIRED: e.g. Green Deal / Digital Single Market]` | `[REQUIRED: SDMX code + name]` | `[REQUIRED: WEO/FM/IFS/etc.]` | `[OPTIONAL: WB code for non-economic only, or "N/A"]` | `[REQUIRED: value + unit]` | `[REQUIRED: YYYY-MM-DD]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[OPTIONAL]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[OPTIONAL]` | `[REQUIRED]` | `[REQUIRED]` |

**Mapping rationale:**

`[REQUIRED: ≥100 words explaining why these IMF indicators were chosen for these policy topics. Cite imf-indicator-mapping.md per-type floors. Where a WB indicator appears, justify it is non-economic (health/education/social/env/demographics/defence/agriculture/innovation/governance only).]`

---

## 2️⃣ EU-27 Headline Indicators

**Primary indicator:** `[REQUIRED: name, e.g. "GDP growth rate (annual %)"]`

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
xychart-beta
    title "EU-27 [INDICATOR NAME] — 5-Year Trend"
    x-axis [2020, 2021, 2022, 2023, 2024]
    y-axis "[UNIT]" 0 --> 10
    line [[value], [value], [value], [value], [value]]
```

| Indicator | Code | Latest | EU-27 Avg | Delta vs. Avg | 5Y Trend |
|-----------|------|:------:|:---------:|:-------------:|:--------:|
| `[REQUIRED: indicator 1]` | `[WB/IMF code]` | `[value]` | `[value]` | `[±value]` | `[↑ / → / ↓]` |
| `[REQUIRED: indicator 2]` | `[code]` | `[value]` | `[value]` | `[±value]` | `[↑ / → / ↓]` |
| `[REQUIRED: indicator 3]` | `[code]` | `[value]` | `[value]` | `[±value]` | `[↑ / → / ↓]` |

**Headline narrative:**

`[REQUIRED: ≥100 words interpreting the headline indicators. What do these numbers tell us about the EU-27 economic state? What pressures do they create for EP legislative priorities?]`

---

## 3️⃣ Affected Member-State Focus

**Member states most exposed to the period's dominant policy:**

### Member State 1: `[REQUIRED: ISO 2-letter code + name]`

| Indicator | Value | EU-27 Avg | Delta | Exposure Level |
|-----------|:-----:|:---------:|:-----:|:--------------:|
| `[REQUIRED: indicator 1]` | `[value]` | `[value]` | `[±value]` | `[🟢 Low / 🟡 Medium / 🔴 High]` |
| `[REQUIRED: indicator 2]` | `[value]` | `[value]` | `[±value]` | `[...]` |

**Exposure narrative:** `[REQUIRED: ≥80 words explaining why this member state is particularly exposed. What makes their position unique or vulnerable?]`

---

### Member State 2: `[REQUIRED]`

*(repeat structure)*

---

### Member State 3: `[REQUIRED]`

*(repeat structure)*

---

## 4️⃣ Forward Outlook

**IMF WEO / Fiscal Monitor projections (+5 years):**

| Indicator | 2025 | 2026 | 2027 | 2028 | 2029 | Trajectory | Horizon confidence |
|-----------|:----:|:----:|:----:|:----:|:----:|:----------:|:------------------:|
| `[REQUIRED: indicator 1]` | `[value]` | `[value]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢 t / 🟡 t+1-2 / 🔴 t+3+]` |
| `[REQUIRED: indicator 2]` | `[value]` | `[value]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` | `[🟢/🟡/🔴]` |

**Projection narrative:**

`[REQUIRED: ≥100 words interpreting forward projections. What do these forecasts imply for EP legislative timeline and priorities? Where are divergences vs. consensus?]`

**Forecast marker:** `[REQUIRED: confirm each forecast number is within 30 words of "forecast"/"projection"/"projects"/"expects" — validator regex-enforced]`

**Caveats:**

`[REQUIRED: for horizons ≥3y, include optimism-bias acknowledgement sized per analysis/imf/forecast-accuracy-baseline.md — typical MAE 1.8–2.4pp for GDP at t+3, 4–6pp for debt/GDP at t+3. Cite the vintage explicitly.]`

---

## 5️⃣ Analytical Bridge to Political Reading

**How macro data shapes political assessment:**

`[REQUIRED: ≥150 words connecting economic indicators to EP political dynamics. Examples:
- "Rising unemployment in Southern member states (ES, IT, GR) increases pressure on S&D to prioritize social policy over fiscal consolidation"
- "IMF forecast of 2.1% EU growth creates fiscal headroom for Green Deal investment, reducing EPP-Greens tension on budget constraints"
- "Widening GDP-per-capita gaps between North/South strengthen nationalist narratives, complicating EPP-Renew coalition on single-market deepening"

Cite specific indicators and explain political mechanism.]`

---

## 6️⃣ Data-Source Bridge

**Wave-4 IMF-primary status:**

| Source | Available? | Records Retrieved | Used in This Run? | Role |
|--------|:----------:|:-----------------:|:------------------:|------|
| IMF SDMX REST (primary economic) | `[✅/❌]` | `[#]` | `[✅/❌]` | **Primary** — Wave-4 mandatory for economic context |
| World Bank MCP (non-economic only) | `[✅/❌]` | `[#]` | `[✅/❌]` | Additive — health/edu/social/env/demographics/defence/agri/innov/gov only |

**Cross-source triangulation** (required for Tier-1 articles citing high-sensitivity indicators):

| Indicator | IMF value | Cross-source | Cross-source value | Delta (pp) | Decision | Reconciliation note |
|-----------|:--------:|--------------|:------------------:|:----------:|----------|---------------------|
| `[REQUIRED or "N/A — not Tier-1"]` | `[value]` | `[Eurostat/ECB/OECD/BIS]` | `[value]` | `[±value]` | `[consistent/material-delta]` | `[≥30 words when material]` |

**Bridge narrative:**

`[REQUIRED: explain the IMF source selection (vintage + database). If WB non-economic data is included, explain which non-economic domain and why. If triangulation was performed, cite the outcome. If neither source was available, explain fallback (prior-run cache, Eurostat, manual sourcing).]`

**Indicator mapping references:**
- `[REQUIRED: cite imf-indicator-mapping.md §2 per-type floor satisfaction]`
- `[OPTIONAL: cite worldbank-indicator-mapping.md only for non-economic cross-refs, or note "N/A"]`

---

## 7️⃣ Confidence Assessment

**Overall confidence:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence by data source:**

| Source | Confidence | Rationale |
|--------|:----------:|-----------|
| World Bank | `[🟢/🟡/🔴]` | `[REQUIRED: data vintage, completeness, relevance]` |
| IMF | `[🟢/🟡/🔴]` | `[REQUIRED]` |
| Member-state data | `[🟢/🟡/🔴]` | `[REQUIRED]` |

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/economic-context.md` · Template v1.0 · Depth floor: 185 lines.
