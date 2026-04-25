<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🌳 Consequence Trees Template — Multi-Level Threat Consequence Analysis

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/threat-assessment/consequence-trees.md`. Per‑threat consequence tree mapping action → first‑order consequence → second‑order consequence → democratic outcome. Include a **convergence diagram** showing where multiple threats hit the same outcome, and an **intervention‑points** map. See [methodologies/per-artifact-methodologies.md §consequence-trees](../methodologies/per-artifact-methodologies.md#consequence-trees).

> **🎯 Purpose:** Structured consequence mapping showing how named threats cascade through multiple causal levels to reach democratic outcomes (rule‑of‑law erosion, electoral capture, single‑market fragmentation, etc.), with explicit intervention‑point identification. **Multi‑national extension over Riksdagsmonitor:** every consequence chain carries cluster impact tags so cross‑border cascades surface explicitly.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: CT-YYYY-MM-DD-runNN]` |
| **Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Threats Analyzed** | `[REQUIRED: count ≥3]` |
| **Tree Depth** | `[REQUIRED: ≥3 levels per tree]` |
| **Convergence Outcomes Identified** | `[REQUIRED: count ≥1]` |
| **Confidence** | `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]` |
| **PIR Tags** | `[REQUIRED]` |

---

## 1️⃣ Threat Roster

| # | Threat name | Source actor / mechanism | Cluster origin | Triggering event window |
|:-:|-------------|--------------------------|:--------------:|-------------------------|
| 1 | `[REQUIRED]` | `[REQUIRED]` | `[N/W/S/CE/external]` | `[REQUIRED: date range]` |
| 2 | `[REQUIRED]` | `[REQUIRED]` | `[…]` | `[REQUIRED]` |
| 3 | `[REQUIRED]` | `[REQUIRED]` | `[…]` | `[REQUIRED]` |

*(≥3 threats.)*

---

## 2️⃣ Consequence Tree — Threat 1: `[REQUIRED: name]`

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart TD
    ROOT[🔴 ACTION:<br/>Threat 1] -->|P=high| FIRST1[🟧 1st‑order:<br/>Consequence A]
    ROOT -->|P=med| FIRST2[🟧 1st‑order:<br/>Consequence B]
    ROOT -->|P=low| FIRST3[🟧 1st‑order:<br/>Consequence C]

    FIRST1 -->|sev=high| SECOND1[🟡 2nd‑order:<br/>Consequence A1]
    FIRST1 -->|sev=med| SECOND2[🟡 2nd‑order:<br/>Consequence A2]
    FIRST2 -->|sev=med| SECOND3[🟡 2nd‑order:<br/>Consequence B1]
    FIRST3 -->|sev=high| SECOND4[🟡 2nd‑order:<br/>Consequence C1]

    SECOND1 -->|impact| OUTCOME1[⚠️ Democratic outcome:<br/>Final state X]
    SECOND2 -->|impact| OUTCOME2[⚠️ Democratic outcome:<br/>Final state Y]
    SECOND3 -->|impact| OUTCOME1
    SECOND4 -->|impact| OUTCOME3[⚠️ Democratic outcome:<br/>Final state Z]

    classDef root fill:#D32F2F,stroke:#B71C1C,color:#ffffff;
    classDef first fill:#FF9800,stroke:#E65100,color:#000000;
    classDef second fill:#FFC107,stroke:#F57F17,color:#000000;
    classDef out fill:#1565C0,stroke:#0A3F7F,color:#ffffff;
    class ROOT root;
    class FIRST1,FIRST2,FIRST3 first;
    class SECOND1,SECOND2,SECOND3,SECOND4 second;
    class OUTCOME1,OUTCOME2,OUTCOME3 out;
```

**Tree depth:** ≥3 levels (action → first‑order → second‑order → democratic outcome)

**Branch table — Threat 1:**

| Branch path | Probability (WEP band) | Severity | Cluster impact | Mechanism (≥40 words) |
|-------------|:----------------------:|:--------:|:--------------:|------------------------|
| ROOT → A → A1 → X | `[Almost Certain / Very Likely / Likely / Even Chance / Unlikely / Very Unlikely / Almost No Chance]` | `[High/Med/Low]` | `[N/W/S/CE]` | `[REQUIRED: ≥40 words]` |
| ROOT → A → A2 → Y | `[…]` | `[…]` | `[…]` | `[REQUIRED]` |
| ROOT → B → B1 → X | `[…]` | `[…]` | `[…]` | `[REQUIRED]` |
| ROOT → C → C1 → Z | `[…]` | `[…]` | `[…]` | `[REQUIRED]` |

*(≥4 branches enumerated.)*

---

## 3️⃣ Consequence Tree — Threat 2: `[REQUIRED]`

*(Repeat full Mermaid + branch table structure.)*

---

## 4️⃣ Consequence Tree — Threat 3: `[REQUIRED]`

*(Repeat full Mermaid + branch table structure.)*

---

## 5️⃣ Cross‑Tree Convergence Map

Where multiple threats funnel into the same democratic outcome — these are the highest‑priority intervention points.

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
flowchart LR
    T1[🔴 Threat 1] --> CONV1[⚠️ Convergence outcome A]
    T2[🔴 Threat 2] --> CONV1
    T1 --> CONV2[⚠️ Convergence outcome B]
    T3[🔴 Threat 3] --> CONV2
    T3 --> CONV3[⚠️ Outcome C — single‑threat]

    classDef threat fill:#D32F2F,stroke:#B71C1C,color:#ffffff;
    classDef conv fill:#FF9800,stroke:#E65100,color:#000000;
    classDef single fill:#FFC107,stroke:#F57F17,color:#000000;
    class T1,T2,T3 threat;
    class CONV1,CONV2 conv;
    class CONV3 single;
```

**Convergence narrative:** `[REQUIRED: ≥100 words — which democratic outcome is hit by the most threats, why this matters more than single‑threat outcomes, and what the compound effect would look like in practice.]`

---

## 6️⃣ Intervention‑Points Catalog

For each tree, identify the earliest branch where intervention can prevent escalation to the democratic outcome — and the institutional actor empowered to act.

| # | Tree | Branch intercepted | Intervention lever | Empowered actor | Time horizon | Reversibility |
|:-:|------|---------------------|---------------------|------------------|:------------:|:-------------:|
| 1 | Threat 1 | `[REQUIRED: branch]` | `[REQUIRED: ≥30 words]` | `[Commission / EP committee / Council / Court / member state]` | `[weeks]` | `[Hard / Soft]` |
| 2 | Threat 2 | `[REQUIRED]` | `[REQUIRED]` | `[…]` | `[weeks]` | `[…]` |
| 3 | Threat 3 | `[REQUIRED]` | `[REQUIRED]` | `[…]` | `[weeks]` | `[…]` |
| 4 | Convergence A | `[REQUIRED]` | `[REQUIRED]` | `[…]` | `[weeks]` | `[…]` |

*(≥4 intervention points; convergence outcomes get a dedicated row.)*

**Intervention narrative:** `[REQUIRED: ≥80 words — which intervention has highest leverage and which is most reversible if applied prematurely.]`

---

## 7️⃣ Cross‑Cluster Cascade Impact

| Cluster | Threat 1 cascade severity | Threat 2 cascade severity | Threat 3 cascade severity | Composite |
|---------|:-------------------------:|:-------------------------:|:-------------------------:|:---------:|
| Northern | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` |
| Western | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` |
| Southern | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` |
| Central‑Eastern | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` | `[🟢/🟡/🔴]` |

**Cluster narrative:** `[REQUIRED: ≥60 words — which cluster bears the largest aggregated cascade severity.]`

---

## 8️⃣ Reader Briefing — Plain Language

> 📰 **Newsroom hook:** `[REQUIRED: one‑sentence summary.]`

- **The threat that matters most this period:** `[REQUIRED: ≥40 words]`
- **What it could lead to in plain language:** `[REQUIRED: ≥40 words]`
- **The earliest moment to act:** `[REQUIRED: ≥40 words]`
- **Who is empowered to intervene:** `[REQUIRED: ≥40 words]`

---

## 9️⃣ Data Sources & Provenance

**EP MCP tools used:** `correlate_intelligence`, `early_warning_system`, `analyze_coalition_dynamics`, `track_legislation`, `get_procedures` *(REQUIRED: ≥3)*

| Source | Type | Admiralty | Link |
|--------|------|:---------:|------|
| `[REQUIRED]` | `[Primary EP / Court / Press / Analyst]` | `[A1‑F6]` | `[URL]` |
| `[REQUIRED]` | `[…]` | `[…]` | `[…]` |

---

## 🔟 Confidence & Caveats

- **Overall confidence:** `[REQUIRED: 🟢/🟡/🔴]`
- **Top uncertainty:** `[REQUIRED: ≥40 words]`
- **Counter‑evidence:** `[REQUIRED: ≥30 words on the strongest reason any of these trees might NOT cascade as drawn.]`
- **Validity window:** `[REQUIRED: how long these trees remain accurate before next refresh.]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/threat-assessment/consequence-trees.md` · Template v2.1 · Depth floor: 150 lines · Mermaid diagrams: ≥4 (one tree per threat + convergence map) · Reader briefing: required.
