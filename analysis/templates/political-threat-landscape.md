<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# ⚠️ Political Threat Landscape Template — Six-Dimension Democratic Threat View

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/political-threat-landscape.md`. Apply the six purpose-built EP democratic-threat dimensions from political-threat-framework.md. See [methodologies/per-artifact-methodologies.md §political-threat-landscape](../methodologies/per-artifact-methodologies.md#political-threat-landscape).

> **🎯 Purpose:** Threat Landscape overview scoring six EP-specific democratic-threat dimensions with named threats, institutional resilience assessment, and concrete watchlist.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: PTL-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Named Threats** | `[REQUIRED: count 3-5]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Six-Dimension Scoreboard

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
graph TD
    ROOT[EP Democratic<br/>Integrity]
    
    ROOT -->|score| D1[Institutional Capture<br/>[0-5]]
    ROOT -->|score| D2[Procedural Manipulation<br/>[0-5]]
    ROOT -->|score| D3[Coalition Fracture<br/>[0-5]]
    ROOT -->|score| D4[Accountability Erosion<br/>[0-5]]
    ROOT -->|score| D5[Information Distortion<br/>[0-5]]
    ROOT -->|score| D6[External Interference<br/>[0-5]]
    
    style ROOT fill:#1565C0,color:#ffffff
    style D1 fill:#FF9800,color:#000000
    style D2 fill:#FF9800,color:#000000
    style D3 fill:#FFC107,color:#000000
    style D4 fill:#2E7D32,color:#ffffff
    style D5 fill:#FF9800,color:#000000
    style D6 fill:#2E7D32,color:#ffffff
```

| Dimension | Score (0-5) | Evidence |
|-----------|:-----------:|----------|
| **Institutional Capture** | `[0-5]` | `[REQUIRED: one-sentence evidence — e.g. "No signs of captured committee chairs; rapporteur assignments remain transparent"]` |
| **Procedural Manipulation** | `[0-5]` | `[REQUIRED: one-sentence evidence]` |
| **Coalition Fracture** | `[0-5]` | `[REQUIRED: one-sentence evidence]` |
| **Accountability Erosion** | `[0-5]` | `[REQUIRED: one-sentence evidence]` |
| **Information Distortion** | `[0-5]` | `[REQUIRED: one-sentence evidence]` |
| **External Interference** | `[0-5]` | `[REQUIRED: one-sentence evidence]` |

**Aggregate threat level:** `[REQUIRED: sum/30 = X.X → 🟢 Low (<1.5) / 🟡 Moderate (1.5-3.0) / 🔴 High (>3.0)]`

**Scoring methodology:** See [`political-threat-framework.md`](../methodologies/political-threat-framework.md) for dimension definitions.

---

## 2️⃣ Top Named Threats

### Threat 1: `[REQUIRED: Specific, named threat — not generic]`

**Dimension:** `[REQUIRED: which of the six dimensions this threat targets]`  
**Severity:** `[REQUIRED: 🟢 Low / 🟡 Moderate / 🔴 High]`

**Actor:** `[REQUIRED: named political group, member state faction, external entity, or institutional actor]`

**Mechanism:** `[REQUIRED: ≥60 words explaining how the threat operates. What procedural tool, institutional leverage, or information channel does the actor use? Cite specific EP activity where observable.]`

**Affected institution:** `[REQUIRED: which EP function, procedure, or democratic norm is under threat — e.g. "ordinary legislative procedure transparency", "committee independence", "plenary vote integrity"]`

---

### Threat 2: `[REQUIRED]`

*(Repeat structure — include 3-5 named threats total)*

---

### Threat 3: `[REQUIRED]`

---

## 3️⃣ Institutional Resilience

**EP rules and practices offsetting threats:**

| Threat | Safeguard | Source | Effectiveness |
|--------|-----------|--------|:-------------:|
| `[REQUIRED: threat name]` | `[REQUIRED: EP rule, treaty provision, or institutional practice]` | `[REQUIRED: e.g. "Rule of Procedure 193", "TEU Article 14", "Committee practice since 2019"]` | `[🟢 Strong / 🟡 Partial / 🔴 Weak]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[...]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[...]` |

**Resilience narrative:**

`[REQUIRED: ≥100 words assessing overall institutional capacity to resist or mitigate the identified threats. Where are EP safeguards robust? Where are they vulnerable? What rule changes or institutional innovations would strengthen resilience?]`

---

## 4️⃣ Watchlist — Concrete Events to Monitor

| Event | Date/Trigger | What to Watch | Threshold |
|-------|--------------|---------------|-----------|
| `[REQUIRED: e.g. "ENVI committee vote on XYZ regulation"]` | `[REQUIRED: YYYY-MM-DD or trigger condition]` | `[REQUIRED: specific indicator — e.g. "Amendment count >50", "Rapporteur replacement motion"]` | `[REQUIRED: what level signals escalation]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |

**Monitoring plan:**

`[REQUIRED: ≥60 words explaining who should monitor (next-run workflow, external watchdog, EP Secretariat) and at what frequency. What signals would escalate a threat from watchlist to active mitigation?]`

---

## 5️⃣ Data Sources

**EP MCP tools used:** `get_meps`, `get_parliamentary_questions`, `get_mep_declarations`, `get_voting_records`, `get_procedures`

**External sources:** `[REQUIRED: list any civil society reports, transparency NGO findings, academic studies, or media investigations consulted]`

---

## 6️⃣ Confidence Assessment

**Overall confidence:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence by dimension:**

| Dimension | Confidence | Rationale |
|-----------|:----------:|-----------|
| Institutional Capture | `[🟢/🟡/🔴]` | `[REQUIRED: one-line — e.g. "HIGH — rapporteur assignment data is public and complete"]` |
| Procedural Manipulation | `[🟢/🟡/🔴]` | `[REQUIRED]` |
| Coalition Fracture | `[🟢/🟡/🔴]` | `[REQUIRED]` |
| Accountability Erosion | `[🟢/🟡/🔴]` | `[REQUIRED]` |
| Information Distortion | `[🟢/🟡/🔴]` | `[REQUIRED]` |
| External Interference | `[🟢/🟡/🔴]` | `[REQUIRED]` |

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/political-threat-landscape.md` · Template v1.1 · Depth floor: 90 lines.
