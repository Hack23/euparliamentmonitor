<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 💹 Economic Context Template — World Bank & IMF Data Anchors

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/economic-context.md`. Anchor EP policy topics in World Bank and/or IMF macro, fiscal, trade, monetary, and sectoral data. See [methodologies/per-artifact-methodologies.md §economic-context](../methodologies/per-artifact-methodologies.md#economic-context).

> **🎯 Purpose:** Bridge EP legislative activity to real-economy fundamentals using World Bank and IMF indicators. Satisfies Wave-2 OR-gate: either World Bank MCP or IMF native client is acceptable.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: EC-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Data Source** | `[REQUIRED: World Bank MCP / IMF API / Both]` |
| **Indicators Cited** | `[REQUIRED: count]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Topic-to-Indicator Mapping

| EP Policy Topic | World Bank Indicator | IMF Series | Latest Value | Vintage Date |
|-----------------|---------------------|------------|:------------:|:------------:|
| `[REQUIRED: e.g. Green Deal / Digital Single Market]` | `[REQUIRED: indicator code + name OR "N/A"]` | `[REQUIRED: series code + name OR "N/A"]` | `[REQUIRED: value + unit]` | `[REQUIRED: YYYY-MM-DD]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |

**Mapping rationale:**

`[REQUIRED: ≥100 words explaining why these indicators were chosen for these policy topics. Cite worldbank-indicator-mapping.md or imf-indicator-mapping.md where relevant.]`

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

**IMF WEO or World Bank projections (+5 years):**

| Indicator | 2025 | 2026 | 2027 | 2028 | 2029 | Trajectory |
|-----------|:----:|:----:|:----:|:----:|:----:|:----------:|
| `[REQUIRED: indicator 1]` | `[value]` | `[value]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` |
| `[REQUIRED: indicator 2]` | `[value]` | `[value]` | `[value]` | `[value]` | `[value]` | `[↑ / → / ↓]` |

**Projection narrative:**

`[REQUIRED: ≥100 words interpreting forward projections. What do these forecasts imply for EP legislative timeline and priorities? Where are divergences vs. consensus?]`

**Caveats:** `[REQUIRED: note projection vintage, methodology assumptions, or uncertainty ranges where available]`

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

**Wave-2 OR-gate status:**

| Source | Available? | Records Retrieved | Used in This Run? |
|--------|:----------:|:-----------------:|:------------------:|
| World Bank MCP | `[✅/❌]` | `[#]` | `[✅/❌]` |
| IMF API | `[✅/❌]` | `[#]` | `[✅/❌]` |

**Bridge narrative:**

`[REQUIRED: If only one source was available, explain which and why. If both were available, explain preference. If neither was available, explain fallback (prior-run cache, Eurostat, manual sourcing).]`

**Indicator mapping references:**
- `[REQUIRED: cite worldbank-indicator-mapping.md sections used]`
- `[REQUIRED: cite imf-indicator-mapping.md sections used, or note "N/A"]`

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
