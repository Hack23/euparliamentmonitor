<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🔮 Scenario Forecast Template — Probability-Weighted Futures

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/scenario-forecast.md`. Develop 3-5 forward scenarios with probability weights, early-warning indicators, and trigger events. See [methodologies/per-artifact-methodologies.md §scenario-forecast](../methodologies/per-artifact-methodologies.md#scenario-forecast).

> **🎯 Purpose:** Forward-looking analysis mapping plausible futures for the next 7/30/90 days. Each scenario includes probability, narrative, early-warning indicators, trigger events, and stakeholder impact.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: SF-YYYY-MM-DD-runNN]` |
| **Analysis Date** | `[REQUIRED: YYYY-MM-DD]` |
| **Horizon** | `[REQUIRED: 7 days / 30 days / 90 days]` |
| **Scenarios Developed** | `[REQUIRED: count 3-5]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Horizon Statement

**Timeframe covered:** `[REQUIRED: e.g. "Next 30 days (2026-05-15 to 2026-06-15)"]`

**Forecast window rationale:** `[REQUIRED: ≥60 words explaining why this horizon was chosen — e.g. proximity to next plenary session, pending Commission decision, Council deadline, etc.]`

---

## 2️⃣ Baseline Assumption

**Current-state claim from which scenarios branch:**

`[REQUIRED: ≥150 words stating the single most important current-state political fact or condition that all scenarios share as their starting point. Example: "EPP-S&D coalition currently holds 55% of votes but faces internal fracture on Green Deal implementation." Cite evidence.]`

---

## 3️⃣ Scenarios

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart TD
    BASELINE[Baseline:<br/>[CURRENT STATE]]
    
    BASELINE -->|[probability %]| S1[Scenario 1:<br/>[NAME]]
    BASELINE -->|[probability %]| S2[Scenario 2:<br/>[NAME]]
    BASELINE -->|[probability %]| S3[Scenario 3:<br/>[NAME]]
    
    S1 -->|indicator| EW1A[Early Warning:<br/>[indicator 1]]
    S1 -->|indicator| EW1B[Early Warning:<br/>[indicator 2]]
    S1 -->|trigger| T1[Trigger:<br/>[event + date]]
    
    S2 -->|indicator| EW2A[Early Warning:<br/>[indicator 1]]
    S2 -->|trigger| T2[Trigger:<br/>[event + date]]
    
    S3 -->|indicator| EW3A[Early Warning:<br/>[indicator 1]]
    S3 -->|trigger| T3[Trigger:<br/>[event + date]]
    
    style BASELINE fill:#1565C0,color:#ffffff
    style S1 fill:#2E7D32,color:#ffffff
    style S2 fill:#FF9800,color:#000000
    style S3 fill:#D32F2F,color:#ffffff
```

---

### Scenario 1: `[REQUIRED: Name]`

**Probability:** `[REQUIRED: %]`  
**Likelihood:** `[REQUIRED: Most Likely / Plausible / Tail Risk]`

#### Narrative

`[REQUIRED: ≥150 words describing how this scenario unfolds. Include named actors, specific procedures, coalitions, and decision points. What changes from the baseline? What sequence of events leads to this outcome? Cite at least one procedure ID or plenary date.]`

#### Early-Warning Indicators

1. `[REQUIRED: specific, measurable indicator with threshold — e.g. "EPP cohesion on ENVI votes drops below 85%"]`
2. `[REQUIRED: indicator 2]`
3. `[REQUIRED: indicator 3]`

*≥3 indicators required per scenario.*

#### Trigger Events

1. `[REQUIRED: named event with date bound — e.g. "2026-06-03: ENVI committee vote on regulation XYZ"]`
2. `[REQUIRED: trigger event 2 with date]`

*≥2 date-bounded trigger events required per scenario.*

#### Stakeholder Impact Summary

| Stakeholder | Impact | Explanation |
|-------------|:------:|-------------|
| `[REQUIRED: actor name]` | `[🟢 Positive / 🟡 Mixed / 🔴 Negative]` | `[REQUIRED: one-line]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |

---

### Scenario 2: `[REQUIRED: Name]`

**Probability:** `[REQUIRED: %]`  
**Likelihood:** `[REQUIRED: Most Likely / Plausible / Tail Risk]`

#### Narrative

`[REQUIRED: ≥150 words]`

#### Early-Warning Indicators

1. `[REQUIRED]`
2. `[REQUIRED]`
3. `[REQUIRED]`

#### Trigger Events

1. `[REQUIRED: event + date]`
2. `[REQUIRED: event + date]`

#### Stakeholder Impact Summary

| Stakeholder | Impact | Explanation |
|-------------|:------:|-------------|
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |

---

### Scenario 3: `[REQUIRED: Name]`

**Probability:** `[REQUIRED: %]`  
**Likelihood:** `[REQUIRED: Most Likely / Plausible / Tail Risk]`

#### Narrative

`[REQUIRED: ≥150 words]`

#### Early-Warning Indicators

1. `[REQUIRED]`
2. `[REQUIRED]`
3. `[REQUIRED]`

#### Trigger Events

1. `[REQUIRED: event + date]`
2. `[REQUIRED: event + date]`

#### Stakeholder Impact Summary

| Stakeholder | Impact | Explanation |
|-------------|:------:|-------------|
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |
| `[REQUIRED]` | `[...]` | `[REQUIRED]` |

---

## 4️⃣ Probability Check

| Scenario | Probability |
|----------|:-----------:|
| Scenario 1 | `[%]` |
| Scenario 2 | `[%]` |
| Scenario 3 | `[%]` |
| **Total** | **`[REQUIRED: must = 100%]`** |

---

## 5️⃣ Cross-Scenario Sensitivity

**Single variable whose movement flips probability weights:**

`[REQUIRED: ≥100 words identifying the one factor (political, economic, procedural, or external) that most determines which scenario materializes. Examples: "EPP internal cohesion on climate votes", "Commission timing of Next Generation EU disbursement", "Council agreement on Treaty article invocation". Explain how changes in this variable redistribute scenario probabilities.]`

---

## 6️⃣ Monitoring Plan

| Check Date | What to Monitor | Decision Point |
|------------|-----------------|----------------|
| `[REQUIRED: YYYY-MM-DD]` | `[REQUIRED: specific indicator or event]` | `[REQUIRED: what decision this informs]` |
| `[REQUIRED: YYYY-MM-DD]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED: YYYY-MM-DD]` | `[REQUIRED]` | `[REQUIRED]` |

**Next scenario update recommended:** `[REQUIRED: date or trigger event]`

---

## 7️⃣ Data Sources & Confidence

**EP MCP tools used:** `track_legislation`, `monitor_legislative_pipeline`, `analyze_coalition_dynamics`, `get_plenary_sessions`, `get_procedure_events`

**Confidence level:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`  
**Confidence rationale:** `[REQUIRED: where probabilities are data-backed vs. expert judgment]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/scenario-forecast.md` · Template v1.1 · Depth floor: 280 lines.
