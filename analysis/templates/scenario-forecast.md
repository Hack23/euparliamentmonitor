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

## 🛠️ Worked example — three-scenario forecast on Critical Raw Materials Act

### Scenario A — Adoption Q4 2026 in original scope (40%)

**Driver**: Council and EP align on "strategic raw material" definitions.
**Indicators that confirm**: trilogue rounds <4; Council position
unchanged from December 2025; rapporteur's report adopted by IMCO with
≥80% margin.

### Scenario B — Adoption Q1 2027 with softened scope (35%)

**Driver**: industry mobilisation forces threshold raises during trilogue.
**Indicators that confirm**: ≥3 industry letters during trilogue; 2-3
amendments narrowing strategic-supplier definitions; Council adds
implementation-cost rider.

### Scenario C — Adoption delayed past 2027 (20%)

**Driver**: HUN veto in Council on financing model OR CJEU referral on
legal base. **Indicators that confirm**: HUN bilateral signals; legal
challenge filed; rapporteur withdrawn or replaced; Commission tables
revised proposal.

### Scenario D — Adoption fails entirely (5%, residual)

**Driver**: external geopolitical shock (China-EU rare-earths embargo
freezes negotiations, or unrelated political crisis displaces agenda).
Indicators: China rare-earths export controls escalate; major EU MS
political crisis dominates Council agenda.

**Probability sum**: 100%. Scenarios are exhaustive and mutually
exclusive.

## 🚫 Anti-patterns — scenario-forecast failures

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Probabilities sum to ≠ 100% | Not a coherent forecast | Re-normalise; document residual |
| Two scenarios that overlap | Not mutually exclusive | Distinguish on a single decisive variable |
| Probabilities all equal (33/33/33) | "I don't know" disguised | Differentiate; if uniform, cite reasoning |
| Scenario without driver | Cannot be tested | Each scenario has ≥1 named causal driver |
| Scenario without indicator | Cannot be monitored | Each scenario has ≥3 falsifiable indicators |
| Probabilities outside WEP grid | Non-standard | Use WEP bands: very likely (75-90%), likely (55-75%), possible (35-55%), unlikely (15-35%) |
| Update without version-stamp | Loses audit trail | Date-stamp each forecast revision |
| 5+ scenarios | Too granular for human interpretation | Cap at 3-4 main + 1 residual |
| "Black swan" scenario in main 3 | Misclassification | Black swans → `wildcards-blackswans.md` |
| Forecast without monitoring plan | Cannot be revised | §6 monitoring plan with dates and decision points |

## 🎯 EP MCP tool inputs

| Tool | Used for |
|---|---|
| `track_legislation` | Procedure status feeds Scenario A/B distinction |
| `monitor_legislative_pipeline` | Bottleneck signals feed Scenario C |
| `analyze_coalition_dynamics` | Coalition-arithmetic sensitivity |
| `get_voting_records` | Discipline trend across time |
| `get_plenary_sessions` | Calendar constraint |
| `get_procedure_events` | Trilogue round count |

## 🔗 Controlling methodology cross-references

- [`../methodologies/strategic-extensions-methodology.md`](../methodologies/strategic-extensions-methodology.md) §Scenarios
- [`../methodologies/osint-tradecraft-standards.md §3 WEP`](../methodologies/osint-tradecraft-standards.md)
- [`forward-indicators.md`](forward-indicators.md) — companion artifact for tripwire signposts
- [`wildcards-blackswans.md`](wildcards-blackswans.md) — for ≤5% probability tail risks

## ✅ Stage-C completeness signals

- Line floor: 280 lines
- ≥ 3 main scenarios with WEP-band probabilities summing to 100%
- Each scenario has ≥1 named driver and ≥3 monitorable indicators
- §5 cross-scenario sensitivity (single pivot variable)
- §6 monitoring plan with at least 3 dated decision points
- Confidence label per scenario (🟢/🟡/🔴) with rationale

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/scenario-forecast.md` · Template v1.2 · Depth floor: 280 lines.
