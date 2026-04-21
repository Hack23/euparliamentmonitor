<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🌳 Consequence Trees Template — Multi-Level Threat Consequence Analysis

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/threat-assessment/consequence-trees.md`. Consequence tree per named threat: action → first-order → second-order → democratic outcome. See [methodologies/per-artifact-methodologies.md §consequence-trees](../methodologies/per-artifact-methodologies.md#consequence-trees).

> **🎯 Purpose:** Structured consequence mapping showing how threats cascade through multiple causal levels to democratic outcomes.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: CT-YYYY-MM-DD-runNN]` |
| **Threats Analyzed** | `[REQUIRED: count ≥3]` |

---

## 1️⃣ Threat Roster

1. `[REQUIRED: named threat]`
2-3. *(≥3 required)*

---

## 2️⃣ Consequence Tree: Threat 1

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
graph TD
    ROOT[Action:<br/>[THREAT NAME]] -->|P=X%| FIRST1[1st-Order:<br/>[CONSEQUENCE]]
    ROOT -->|P=Y%| FIRST2[1st-Order:<br/>[CONSEQUENCE]]
    
    FIRST1 -->|severity| SECOND1[2nd-Order:<br/>[CONSEQUENCE]]
    FIRST2 -->|severity| SECOND2[2nd-Order:<br/>[CONSEQUENCE]]
    
    SECOND1 -->|impact| OUTCOME1[Democratic Outcome:<br/>[FINAL STATE]]
    SECOND2 -->|impact| OUTCOME2[Democratic Outcome:<br/>[FINAL STATE]]
    
    style ROOT fill:#D32F2F,color:#ffffff
    style FIRST1 fill:#FF9800,color:#000000
    style FIRST2 fill:#FF9800,color:#000000
    style SECOND1 fill:#FFC107,color:#000000
    style SECOND2 fill:#FFC107,color:#000000
```

**Tree depth:** ≥3 levels (action → first-order → second-order)

| Branch | Probability/Severity | Explanation |
|--------|:--------------------:|-------------|
| `[REQUIRED: branch path]` | `[P=%, Severity=High/Med/Low]` | `[REQUIRED: ≥40 words explaining mechanism]` |

*(Repeat for ≥3 threats)*

---

## 3️⃣ Cross-Tree Convergence

`[REQUIRED: ≥60 words — where multiple threats hit same democratic outcome]`

---

## 4️⃣ Intervention Points

`[REQUIRED: ≥60 words — where tree can be pruned by EP/EU action]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/threat-assessment/consequence-trees.md` · Template v1.0 · Depth floor: 30 lines.
