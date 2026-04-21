<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# ⚡ Legislative Velocity Risk Template — Pipeline Throughput & Deadline Exposure

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/risk-scoring/legislative-velocity-risk.md`. Throughput, stalled procedures, and deadline exposure vs. term end. See [methodologies/per-artifact-methodologies.md §legislative-velocity-risk](../methodologies/per-artifact-methodologies.md#legislative-velocity-risk) and [political-risk-methodology.md §Velocity](../methodologies/political-risk-methodology.md).

> **🎯 Purpose:** Pipeline health assessment tracking which procedures risk expiry and where bottlenecks slow legislative progress.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: LVR-YYYY-MM-DD-runNN]` |
| **Pipeline Status Date** | `[REQUIRED: YYYY-MM-DD]` |

---

## 1️⃣ Pipeline Summary

| Stage | Open Procedures | Throughput (per week) | Median Time-in-Stage |
|-------|:---------------:|:---------------------:|:--------------------:|
| `[REQUIRED: e.g. Committee]` | `[#]` | `[#]` | `[weeks]` |
| `[REQUIRED: e.g. Plenary 1st reading]` | `[#]` | `[#]` | `[weeks]` |
| *(all stages)* | | | |

---

## 2️⃣ Stalled Procedures

| Procedure ID | Title | Time-in-Stage | Likely Cause | Rescue Path |
|--------------|-------|:-------------:|--------------|-------------|
| `[REQUIRED]` | `[REQUIRED]` | `[weeks]` | `[REQUIRED: ≥30 words]` | `[REQUIRED]` |
| *(≥3 required)* | | | | |

---

## 3️⃣ Deadline Exposure

**Procedures at risk of expiry before term end:**

`[REQUIRED: list with procedure IDs + estimated expiry dates]`

---

## 4️⃣ Bottleneck Map

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    COMM[Committee] --> PLEN1[Plenary 1st]
    PLEN1 --> TRIL[Trilogue]
    TRIL -->|bottleneck| PLEN2[Plenary 2nd]
```

`[REQUIRED: ≥60 words explaining where slowest + why]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/risk-scoring/legislative-velocity-risk.md` · Template v1.0 · Depth floor: 30 lines.
