<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🦢 Wildcards & Black Swans Template — Low-Probability / High-Impact Events

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/wildcards-blackswans.md`. Low-probability / high-impact reserve watchlist of events that would invalidate main scenarios if they occurred. See [methodologies/per-artifact-methodologies.md §wildcards-blackswans](../methodologies/per-artifact-methodologies.md#wildcards-blackswans).

> **🎯 Purpose:** Systematically identify tail-risk events that are unlikely but consequential. Provides early-warning signals and cascade analysis for scenario-invalidating shocks.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: WBS-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Wildcards Identified** | `[REQUIRED: count ≥5]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Wildcard Roster

| # | Wildcard Name | Probability (0-10%) | Impact | Trigger Signals |
|:-:|---------------|:-------------------:|:------:|-----------------|
| 1 | `[REQUIRED: Specific, named wildcard — e.g. "Unexpected ECJ ruling invalidates key Green Deal regulation"]` | `[%]` | `[High / Severe]` | `[REQUIRED: ≥2 signals, e.g. "Case C-XXX/24 oral hearing scheduled", "Advocate General opinion released"]` |
| 2 | `[REQUIRED]` | `[%]` | `[High / Severe]` | `[REQUIRED]` |
| 3 | `[REQUIRED]` | `[%]` | `[High / Severe]` | `[REQUIRED]` |
| 4 | `[REQUIRED]` | `[%]` | `[High / Severe]` | `[REQUIRED]` |
| 5 | `[REQUIRED]` | `[%]` | `[High / Severe]` | `[REQUIRED]` |

**Impact definitions:**
- **High:** Disrupts current legislative session or coalition arithmetic
- **Severe:** Invalidates multiple baseline scenarios or fundamentally alters EP power balance

---

## 2️⃣ Probability × Impact Quadrant Chart

```mermaid
%%{init: {"theme":"dark","themeVariables":{"quadrant1Fill":"#1565C0","quadrant2Fill":"#2E7D32","quadrant3Fill":"#FF9800","quadrant4Fill":"#D32F2F","quadrantTitleFill":"#ffffff","quadrantPointFill":"#ffffff","quadrantPointTextFill":"#ffffff","quadrantXAxisTextFill":"#ffffff","quadrantYAxisTextFill":"#ffffff"},"quadrantChart":{"chartWidth":700,"chartHeight":700,"pointLabelFontSize":14,"titleFontSize":22,"quadrantLabelFontSize":18,"xAxisLabelFontSize":16,"yAxisLabelFontSize":16}}}%%
quadrantChart
    title Wildcards & Black Swans — Probability × Impact
    x-axis "Low Probability" --> "High Probability"
    y-axis "Low Impact" --> "Severe Impact"
    quadrant-1 "🔴 Monitor Zone (Higher Prob, Severe Impact)"
    quadrant-2 "🟢 Black Swan Zone (Low Prob, Severe Impact)"
    quadrant-3 "🟠 Noise Zone (Low Prob, Low Impact)"
    quadrant-4 "🔵 Recurring Zone (Higher Prob, Low Impact)"
    "Wildcard 1": [0.05, 0.9]
    "Wildcard 2": [0.03, 0.95]
    "Wildcard 3": [0.08, 0.85]
    "Wildcard 4": [0.02, 0.98]
    "Wildcard 5": [0.06, 0.88]
```

**Note:** Replace `Wildcard N` with actual names and plot probabilities (0-0.1 = 0-10%) on x-axis, impact severity (0.7-1.0) on y-axis. Per [political-style-guide.md §Standard quadrantChart init block](../methodologies/political-style-guide.md), quadrant charts **MUST** use the dedicated quadrant init block above (not the universal init block).

**Black Swan Zone (low prob, severe impact):** `[REQUIRED: list which wildcards fall here]`

---

## 3️⃣ Per-Wildcard Analysis

### Wildcard 1: `[REQUIRED: Name]`

**Probability:** `[REQUIRED: 0-10%]`  
**Impact:** `[REQUIRED: High / Severe]`

**Scenario:**

`[REQUIRED: ≥100 words describing how this wildcard would unfold. What sequence of events? Which EP procedures, coalitions, or institutional functions would be affected? How does this differ from baseline scenarios? Cite named actors, procedure IDs, or institutional mechanisms where relevant.]`

**Trigger signals:**

1. `[REQUIRED: specific, measurable early-warning indicator]`
2. `[REQUIRED]`
3. `[REQUIRED]`

**Why this would invalidate baseline scenarios:**

`[REQUIRED: ≥60 words explaining which baseline assumptions this wildcard breaks and how scenario probabilities would shift if this occurred.]`

---

### Wildcard 2: `[REQUIRED]`

*(Repeat structure for all ≥5 wildcards)*

---

### Wildcard 3: `[REQUIRED]`

---

### Wildcard 4: `[REQUIRED]`

---

### Wildcard 5: `[REQUIRED]`

---

## 4️⃣ Early-Warning Matrix

**What signals would elevate a wildcard to a scenario:**

| Wildcard | Current Signal Strength | Threshold for Elevation | Action if Threshold Crossed |
|----------|:-----------------------:|------------------------|----------------------------|
| `[REQUIRED: wildcard name]` | `[🟢 Absent / 🟡 Weak / 🔴 Present]` | `[REQUIRED: e.g. "≥2 of 3 trigger signals observed within 7 days"]` | `[REQUIRED: e.g. "Promote to Scenario 4 in next run with 15% probability"]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` | `[REQUIRED]` |

**Monitoring frequency:**

`[REQUIRED: ≥60 words explaining how often these signals should be checked and by whom. Are some wildcards on continuous watch (media monitoring) vs. periodic check (quarterly CJEU docket review)?]`

---

## 5️⃣ Cascade Map — Cross-Wildcard Triggers

**Which wildcard triggering would activate which other wildcards:**

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
graph TD
    WC1[Wildcard 1]
    WC2[Wildcard 2]
    WC3[Wildcard 3]
    WC4[Wildcard 4]
    WC5[Wildcard 5]
    
    WC1 -->|triggers| WC3
    WC1 -->|triggers| WC5
    WC2 -->|triggers| WC4
    WC3 -->|triggers| WC5
    
    style WC1 fill:#D32F2F,color:#ffffff
    style WC2 fill:#FF9800,color:#000000
    style WC3 fill:#FF9800,color:#000000
    style WC4 fill:#FFC107,color:#000000
    style WC5 fill:#D32F2F,color:#ffffff
```

**Cascade table:**

| Primary Wildcard | Secondary Wildcard(s) Triggered | Mechanism |
|------------------|--------------------------------|-----------|
| `[REQUIRED: wildcard name]` | `[REQUIRED: which other wildcard(s) this activates]` | `[REQUIRED: ≥30 words explaining causal link]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |

**Worst-case cascade:**

`[REQUIRED: ≥80 words identifying the single wildcard whose triggering would activate the most severe chain reaction. What is the domino sequence? What would be the ultimate political outcome?]`

---

## 6️⃣ Institutional Preparedness

**EP contingency mechanisms for wildcard scenarios:**

| Wildcard | Existing EP Tool / Procedure | Adequacy |
|----------|------------------------------|:--------:|
| `[REQUIRED: wildcard name]` | `[REQUIRED: EP Rule of Procedure, treaty provision, or institutional practice that provides response capacity]` | `[🟢 Adequate / 🟡 Partial / 🔴 Insufficient]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` |
| `[REQUIRED]` | `[REQUIRED]` | `[...]` |

**Preparedness gaps:**

`[REQUIRED: ≥80 words identifying wildcards for which the EP has no established response protocol. What would need to be improvised? What pre-positioned agreements or fallback procedures would reduce chaos?]`

---

## 7️⃣ Historical Precedents

**Past wildcards that materialized:**

| Event | Date | Probability Estimate (Pre-Event) | Actual Impact | Lessons |
|-------|:----:|:--------------------------------:|:-------------:|---------|
| `[REQUIRED: e.g. "Brexit referendum result"]` | `[YYYY-MM-DD]` | `[%]` | `[REQUIRED: one-line]` | `[REQUIRED: ≥30 words on what this teaches about current wildcards]` |
| `[REQUIRED]` | `[YYYY-MM-DD]` | `[%]` | `[REQUIRED]` | `[REQUIRED]` |

---

## 8️⃣ Data Sources

**EP MCP tools used:** `track_legislation`, `get_procedures`, `get_plenary_sessions`  
**External sources:** `[REQUIRED: list CJEU docket, Council press releases, media monitoring, or other sources consulted for wildcard identification]`

---

## 9️⃣ Confidence Assessment

**Overall confidence:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence rationale:** `[REQUIRED: ≥60 words explaining where wildcard identification is data-informed vs. speculative. Note: by definition, wildcards are low-confidence on probability but should be high-confidence on plausibility and impact if triggered.]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/wildcards-blackswans.md` · Template v1.1 · Depth floor: 275 lines.
