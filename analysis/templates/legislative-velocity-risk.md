<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# ⚡ Legislative Velocity Risk Template — Pipeline Throughput & Deadline Exposure

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/risk-scoring/legislative-velocity-risk.md`. Pipeline health assessment: throughput, stalled procedures, deadline exposure vs. term end / Council presidency rotation, bottleneck mapping, and EU‑27 cluster impact. See [methodologies/per-artifact-methodologies.md §legislative-velocity-risk](../methodologies/per-artifact-methodologies.md#legislative-velocity-risk) and [political-risk-methodology.md §Velocity](../methodologies/political-risk-methodology.md).

> **🎯 Purpose:** Pipeline‑health assessment showing which procedures are at risk of expiring before term end, where bottlenecks slow legislative progress, which clusters' priorities are most exposed, and which interventions could restore velocity. **Multi‑national extension over Riksdagsmonitor:** every pipeline metric is split by Council presidency cluster + EP committee origin so cross‑institutional drag becomes visible.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: LVR-YYYY-MM-DD-runNN]` |
| **Pipeline Snapshot Date** | `[REQUIRED: YYYY-MM-DD]` |
| **Procedures Tracked** | `[REQUIRED: count ≥10]` |
| **Stalled Procedures** | `[REQUIRED: count]` |
| **Procedures At Expiry Risk** | `[REQUIRED: count]` |
| **Confidence** | `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]` |
| **PIR Tags** | `[REQUIRED]` |

---

## 1️⃣ Pipeline Summary

| Stage | Open Procedures | Throughput (per 4 weeks) | Median time‑in‑stage (weeks) | Trend vs prior 4 weeks |
|-------|:---------------:|:------------------------:|:----------------------------:|:----------------------:|
| Committee — assigned | `[#]` | `[#]` | `[#]` | `[🟢 ↑ / ⚪ → / 🔴 ↓]` |
| Committee — vote | `[#]` | `[#]` | `[#]` | `[…]` |
| Plenary 1st reading | `[#]` | `[#]` | `[#]` | `[…]` |
| Trilogue | `[#]` | `[#]` | `[#]` | `[…]` |
| Plenary 2nd reading / final | `[#]` | `[#]` | `[#]` | `[…]` |
| Council common position | `[#]` | `[#]` | `[#]` | `[…]` |
| Adopted | `[#]` | `[#]` | `[#]` | `[…]` |

*(All stages REQUIRED.)*

**Headline throughput:** `[REQUIRED: ≥40 words — total procedures completed in window vs. expected, and explicit comparison to prior 4 weeks.]`

---

## 2️⃣ Throughput Timeline (Last 12 Weeks)

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
timeline
    title Procedures advanced past committee per week
    Week -12 : 12 procedures
    Week -10 : 14 procedures
    Week -8 : 9 procedures
    Week -6 : 7 procedures (drop)
    Week -4 : 11 procedures
    Week -2 : 10 procedures
    Week 0 : 13 procedures
```

**Trend narrative:** `[REQUIRED: ≥80 words — overall direction, dips, recovery, and any explanation tied to plenary calendar / Council presidency / recess.]`

---

## 3️⃣ Stalled Procedures

A procedure is **stalled** if its current stage has held for >2× the historical median for that stage.

| # | Procedure ID | Title | Current stage | Time‑in‑stage (weeks) | Likely cause | EU‑27 cluster carrying drag | Rescue path |
|:-:|--------------|-------|---------------|:---------------------:|--------------|:---------------------------:|-------------|
| 1 | `[REQUIRED]` | `[REQUIRED]` | `[stage]` | `[#]` | `[REQUIRED: ≥30 words]` | `[N/W/S/CE]` | `[REQUIRED: ≥30 words]` |
| 2 | `[REQUIRED]` | `[REQUIRED]` | `[…]` | `[#]` | `[REQUIRED]` | `[…]` | `[REQUIRED]` |
| 3 | `[REQUIRED]` | `[REQUIRED]` | `[…]` | `[#]` | `[REQUIRED]` | `[…]` | `[REQUIRED]` |

*(≥3 stalled procedures.)*

---

## 4️⃣ Deadline Exposure — Term End / Presidency Rotation

Procedures most at risk of expiring before EP term end OR before the rotating Council presidency hands over to a less‑aligned cluster.

| # | Procedure ID | Earliest expiry trigger | Estimated expiry date | Stages remaining | Cluster losing most if expired |
|:-:|--------------|-------------------------|:---------------------:|:----------------:|:------------------------------:|
| 1 | `[REQUIRED]` | `[Term end / presidency rotation / Commission withdrawal]` | `[YYYY-MM-DD]` | `[count]` | `[N/W/S/CE]` |
| 2 | `[REQUIRED]` | `[…]` | `[YYYY-MM-DD]` | `[count]` | `[…]` |
| 3 | `[REQUIRED]` | `[…]` | `[YYYY-MM-DD]` | `[count]` | `[…]` |

*(≥3 entries.)*

**Deadline narrative:** `[REQUIRED: ≥80 words — which expiry would have largest political impact, and the calendar leverage point that could rescue it.]`

---

## 5️⃣ Bottleneck Map

Color‑coded flowchart of pipeline drag.

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    COMM[🟢 Committee<br/>median 6w] --> PLEN1[🟡 Plenary 1st<br/>median 8w]
    PLEN1 --> TRIL[🔴 Trilogue<br/>median 22w 🚧 BOTTLENECK]
    TRIL --> PLEN2[🟡 Plenary 2nd<br/>median 6w]
    PLEN2 --> ADOPT[🟢 Adopted]

    classDef good fill:#2E7D32,stroke:#1B5E20,color:#ffffff;
    classDef warn fill:#FF9800,stroke:#E65100,color:#000000;
    classDef bad fill:#D32F2F,stroke:#B71C1C,color:#ffffff;
    classDef done fill:#1565C0,stroke:#0A3F7F,color:#ffffff;
    class COMM good;
    class PLEN1,PLEN2 warn;
    class TRIL bad;
    class ADOPT done;
```

**Bottleneck narrative:** `[REQUIRED: ≥80 words — which stage is the slowest, why (Council asymmetry, committee workload, rapporteur turnover, etc.), and which file is the canonical example.]`

---

## 6️⃣ Velocity by Committee (Top‑5)

Which committees are pulling the pipeline forward, and which are holding it back?

| Committee | Open files | Files advanced this 4‑week window | Median time‑in‑stage (weeks) | Velocity rank |
|-----------|:----------:|:---------------------------------:|:----------------------------:|:-------------:|
| `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[1‑5]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[1‑5]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[1‑5]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[1‑5]` |
| `[REQUIRED]` | `[#]` | `[#]` | `[#]` | `[1‑5]` |

---

## 7️⃣ Cross‑Cluster Pipeline Impact

| Cluster | Procedures-of‑interest in pipeline | At expiry risk | Net velocity impression |
|---------|:----------------------------------:|:--------------:|:-----------------------:|
| Northern | `[#]` | `[#]` | `[🟢/🟡/🔴]` |
| Western | `[#]` | `[#]` | `[🟢/🟡/🔴]` |
| Southern | `[#]` | `[#]` | `[🟢/🟡/🔴]` |
| Central‑Eastern | `[#]` | `[#]` | `[🟢/🟡/🔴]` |

**Cluster narrative:** `[REQUIRED: ≥60 words — which cluster's priorities are most slipping and the political consequence.]`

---

## 8️⃣ Reader Briefing — Plain Language

> 📰 **Newsroom hook:** `[REQUIRED: one‑sentence summary.]`

- **Is the legislative pipeline speeding up or slowing down:** `[REQUIRED: ≥30 words]`
- **What's stuck and why it matters:** `[REQUIRED: ≥30 words]`
- **What citizens lose if these files expire:** `[REQUIRED: ≥30 words]`
- **Earliest decision point that could unstick:** `[REQUIRED: date + venue]`

---

## 9️⃣ Data Sources & Provenance

**EP MCP tools used:** `monitor_legislative_pipeline`, `get_procedures`, `analyze_committee_activity`, `track_legislation`, `get_procedure_events` *(REQUIRED: ≥3)*

| Source | Type | Admiralty | Link |
|--------|------|:---------:|------|
| `[REQUIRED]` | `[Primary EP / Council / Press]` | `[A1‑F6]` | `[URL]` |
| `[REQUIRED]` | `[…]` | `[…]` | `[…]` |

---

## 🔟 Confidence & Caveats

- **Overall confidence:** `[REQUIRED: 🟢/🟡/🔴]`
- **Top uncertainty:** `[REQUIRED: ≥40 words]`
- **What would change my mind:** `[REQUIRED: ≥30 words observable trigger.]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/risk-scoring/legislative-velocity-risk.md` · Template v2.0 · Depth floor: 130 lines · Mermaid diagrams: ≥2 (throughput timeline + bottleneck flowchart) · Reader briefing: required.
