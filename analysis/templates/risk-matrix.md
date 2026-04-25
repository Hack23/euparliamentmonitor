<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📊 Risk Matrix Template — 5×5 Likelihood × Impact Political Risk Grid

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/risk-scoring/risk-matrix.md`. 5×5 Likelihood × Impact matrix with ≥5 named political risks and monitoring triggers. See [methodologies/per-artifact-methodologies.md §risk-matrix](../methodologies/per-artifact-methodologies.md#risk-matrix) and [political-risk-methodology.md](../methodologies/political-risk-methodology.md).

> **🎯 Purpose:** Canonical political risk assessment tool mapping named risks to a probability-impact grid with actionable monitoring triggers.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: RM-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Risks Identified** | `[REQUIRED: count ≥5]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Risk Roster

| # | Risk Name | Likelihood (1-5) | Impact (1-5) | Score (L×I) | Category |
|:-:|-----------|:----------------:|:------------:|:-----------:|----------|
| 1 | `[REQUIRED: specific, named risk — e.g. "Grand Coalition fracture on climate policy"]` | `[1-5]` | `[1-5]` | `[#]` | `[Coalition/Policy/Institutional/External/Data]` |
| 2 | `[REQUIRED]` | `[1-5]` | `[1-5]` | `[#]` | `[...]` |
| 3 | `[REQUIRED]` | `[1-5]` | `[1-5]` | `[#]` | `[...]` |
| 4 | `[REQUIRED]` | `[1-5]` | `[1-5]` | `[#]` | `[...]` |
| 5 | `[REQUIRED]` | `[1-5]` | `[1-5]` | `[#]` | `[...]` |

**Score validation:** `[REQUIRED: ✅ All scores = L × I / ❌ Errors detected]`

---

## 2️⃣ 5×5 Risk Matrix

```mermaid
%%{init: {"theme":"dark","themeVariables":{"quadrant1Fill":"#1565C0","quadrant2Fill":"#2E7D32","quadrant3Fill":"#FF9800","quadrant4Fill":"#D32F2F","quadrantTitleFill":"#ffffff","quadrantPointFill":"#ffffff","quadrantPointTextFill":"#ffffff","quadrantXAxisTextFill":"#ffffff","quadrantYAxisTextFill":"#ffffff"},"quadrantChart":{"chartWidth":700,"chartHeight":700,"pointLabelFontSize":14,"titleFontSize":22,"quadrantLabelFontSize":18,"xAxisLabelFontSize":16,"yAxisLabelFontSize":16}}}%%
quadrantChart
    title Risk Matrix — Likelihood × Impact
    x-axis "Low Likelihood" --> "High Likelihood"
    y-axis "Low Impact" --> "High Impact"
    quadrant-1 "🔴 Critical Zone (High L, High I)"
    quadrant-2 "🟢 Elevated Zone (Low L, High I)"
    quadrant-3 "🟠 Monitored Zone (Low L, Low I)"
    quadrant-4 "🔵 Managed Zone (High L, Low I)"
    "Risk 1": [0.2, 0.8]
    "Risk 2": [0.7, 0.9]
    "Risk 3": [0.5, 0.4]
    "Risk 4": [0.1, 0.9]
    "Risk 5": [0.8, 0.6]
```

**Note:** Scale L and I scores (1-5) to (0.2-1.0) for plotting. Per [political-style-guide.md §Standard quadrantChart init block](../methodologies/political-style-guide.md), quadrant charts **MUST** use the dedicated quadrant init block above (not the universal init block).

**Zone colors** (aligned with quadrant labels above):
- 🔴 Critical (High L, High I): Immediate mitigation required
- 🟢 Elevated (Low L, High I): Prepare contingency
- 🟠 Monitored (Low L, Low I): Watch only
- 🔵 Managed (High L, Low I): Accept and monitor

---

## 3️⃣ Top-3 Risk Narratives

### Risk 1: `[REQUIRED: Name]`

**Likelihood:** `[1-5]` · **Impact:** `[1-5]` · **Score:** `[#]`

**Evidence:**

`[REQUIRED: ≥100 words explaining why this risk is likely and what its impact would be. Cite specific EP activity, coalition behavior, procedure IDs, or actor positions. Include stakeholder exposure analysis.]`

**Stakeholder exposure:**

| Stakeholder | Exposure Level |
|-------------|:--------------:|
| `[REQUIRED]` | `[🟢 Low / 🟡 Medium / 🔴 High]` |
| `[REQUIRED]` | `[...]` |

**Monitoring trigger:**

`[REQUIRED: ≥40 words describing time-bounded trigger event or threshold that would signal risk escalation. Examples: "EPP cohesion on ENVI votes drops below 80% for 2 consecutive sessions", "2026-06-15: ENVI committee vote on XYZ regulation".]`

---

### Risk 2: `[REQUIRED]`

*(Repeat structure for top-3 risks by score)*

---

### Risk 3: `[REQUIRED]`

---

## 4️⃣ Trend vs. Prior Run

| Risk | Prior L×I | Current L×I | Delta | Explanation |
|------|:---------:|:-----------:|:-----:|-------------|
| `[REQUIRED: risk name]` | `[#]` | `[#]` | `[±#]` | `[REQUIRED: ≥30 words — what changed?]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[±#]` | `[REQUIRED]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[±#]` | `[REQUIRED]` |

**New risks this run:** `[REQUIRED: list or "none"]`  
**Retired risks (no longer material):** `[REQUIRED: list or "none"]`

---

## 5️⃣ Accept / Prepare / Monitor Decisions

| Risk | Decision | Rationale |
|------|:--------:|-----------|
| `[REQUIRED: risk name]` | `[Accept / Prepare / Monitor]` | `[REQUIRED: ≥30 words — why this decision?]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |

**Decision definitions:**
- **Accept:** Risk score <10, no mitigation action required, routine monitoring
- **Prepare:** Risk score 10-15, develop contingency plan, active monitoring
- **Monitor:** Risk score ≥16, immediate mitigation required, continuous watch

---

## 6️⃣ Data Sources

**EP MCP tools used:** `get_procedures`, `analyze_coalition_dynamics`, `monitor_legislative_pipeline`, `get_voting_records`

---

## 7️⃣ Confidence Assessment

**Overall confidence:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence by risk:**

| Risk | Confidence | Rationale |
|------|:----------:|-----------|
| `[REQUIRED]` | `[🟢/🟡/🔴]` | `[REQUIRED: one-line — where L/I scores are data-backed vs. judgment]` |
| `[REQUIRED]` | `[🟢/🟡/🔴]` | `[REQUIRED]` |

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/risk-scoring/risk-matrix.md` · Template v1.1 · Depth floor: 150 lines.
