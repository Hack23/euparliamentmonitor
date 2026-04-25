<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🛡️ Threat Model Template — Democratic & Institutional Threat Analysis

> **📌 Template Instructions:** Copy to `analysis/daily/{date}/{article-type}-run{N}/intelligence/threat-model.md`. Multi-framework threat view: Diamond Model + Attack Trees + Kill Chain applied to democratic/institutional threats. See [methodologies/per-artifact-methodologies.md §threat-model](../methodologies/per-artifact-methodologies.md#threat-model) and [political-threat-framework.md](../methodologies/political-threat-framework.md).

> **🎯 Purpose:** Structured threat analysis using cybersecurity-inspired frameworks adapted for political/democratic threats. Identifies adversaries, capabilities, attack paths, and institutional safeguards.

---

## 📋 Document Metadata

| Field | Value |
|-------|-------|
| **Report ID** | `[REQUIRED: TM-YYYY-MM-DD-runNN]` |
| **Analysis Period** | `[REQUIRED: YYYY-MM-DD to YYYY-MM-DD]` |
| **Top Threats Analyzed** | `[REQUIRED: count]` |
| **Confidence** | `[REQUIRED: 🟢/🟡/🔴]` |

---

## 1️⃣ Threat Landscape Summary

**Six-dimension threat posture** (per [`political-threat-framework.md`](../methodologies/political-threat-framework.md)):

| Dimension | Score (0-5) | Evidence |
|-----------|:-----------:|----------|
| **Institutional Capture** | `[0-5]` | `[REQUIRED: one-sentence evidence]` |
| **Procedural Manipulation** | `[0-5]` | `[REQUIRED]` |
| **Coalition Fracture** | `[0-5]` | `[REQUIRED]` |
| **Accountability Erosion** | `[0-5]` | `[REQUIRED]` |
| **Information Distortion** | `[0-5]` | `[REQUIRED]` |
| **External Interference** | `[0-5]` | `[REQUIRED]` |

**Aggregate threat level:** `[REQUIRED: sum/30 or average, with 🟢/🟡/🔴 indicator]`

---

## 2️⃣ Diamond Model — Top Threat

**Threat name:** `[REQUIRED: specific, named threat — not generic]`

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
graph TD
    ADV[Adversary:<br/>[NAMED]]
    CAP[Capability:<br/>[SPECIFIC]]
    INF[Infrastructure:<br/>[MECHANISM]]
    VIC[Victim:<br/>[INSTITUTION]]
    
    ADV -->|leverages| CAP
    CAP -->|via| INF
    INF -->|targets| VIC
    VIC -->|exposes| ADV
    
    style ADV fill:#D32F2F,color:#ffffff
    style CAP fill:#FF9800,color:#000000
    style INF fill:#FFC107,color:#000000
    style VIC fill:#1565C0,color:#ffffff
```

| Element | Description |
|---------|-------------|
| **Adversary** | `[REQUIRED: named political group, member state, external actor, or institutional faction with intent]` |
| **Capability** | `[REQUIRED: what tools, leverage, or procedural advantage the adversary possesses — e.g. "committee chair position", "qualified minority in Council", "amendment flooding capacity"]` |
| **Infrastructure** | `[REQUIRED: mechanisms or platforms through which capability is exercised — e.g. "ENVI committee rules", "trilogue process", "media channels"]` |
| **Victim** | `[REQUIRED: named EP institution, procedure, or democratic function under threat — e.g. "ordinary legislative procedure integrity", "plenary vote transparency"]` |

**Narrative:** `[REQUIRED: ≥150 words explaining how these four elements interact to produce the threat. What is the adversary's goal? How does capability + infrastructure = impact on victim?]`

---

## 3️⃣ Attack Tree — Threat Decomposition

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","primaryBorderColor":"#0A3F7F","lineColor":"#90CAF9","secondaryColor":"#2E7D32","secondaryTextColor":"#ffffff","tertiaryColor":"#FF9800","tertiaryTextColor":"#000000","mainBkg":"#1565C0","secondBkg":"#2E7D32","tertiaryBkg":"#FF9800","noteBkgColor":"#FFC107","noteTextColor":"#000000","errorBkgColor":"#D32F2F","fontFamily":"Inter, Helvetica, Arial, sans-serif"}}}%%
graph TD
    ROOT[Goal:<br/>[ADVERSARY OBJECTIVE]]
    
    ROOT -->|subgoal 1| SG1[Subgoal:<br/>[INTERMEDIATE OUTCOME]]
    ROOT -->|subgoal 2| SG2[Subgoal:<br/>[INTERMEDIATE OUTCOME]]
    ROOT -->|subgoal 3| SG3[Subgoal:<br/>[INTERMEDIATE OUTCOME]]
    
    SG1 -->|action| A1[Action:<br/>[SPECIFIC MANEUVER]]
    SG1 -->|action| A2[Action:<br/>[SPECIFIC MANEUVER]]
    
    SG2 -->|action| A3[Action:<br/>[SPECIFIC MANEUVER]]
    SG2 -->|action| A4[Action:<br/>[SPECIFIC MANEUVER]]
    
    SG3 -->|action| A5[Action:<br/>[SPECIFIC MANEUVER]]
    
    style ROOT fill:#D32F2F,color:#ffffff
    style SG1 fill:#FF9800,color:#000000
    style SG2 fill:#FF9800,color:#000000
    style SG3 fill:#FF9800,color:#000000
    style A1 fill:#FFC107,color:#000000
    style A2 fill:#FFC107,color:#000000
    style A3 fill:#FFC107,color:#000000
    style A4 fill:#FFC107,color:#000000
    style A5 fill:#FFC107,color:#000000
```

**Root goal:** `[REQUIRED: adversary's ultimate objective]`

**Subgoals and actions:**

1. **Subgoal 1:** `[REQUIRED: intermediate outcome needed]`
   - Action 1.1: `[REQUIRED: specific parliamentary maneuver, e.g. "File 50+ amendments to stall committee vote"]`
   - Action 1.2: `[REQUIRED: specific action, include procedure IDs or named MEPs where relevant]`

2. **Subgoal 2:** `[REQUIRED]`
   - Action 2.1: `[REQUIRED]`
   - Action 2.2: `[REQUIRED]`

3. **Subgoal 3:** `[REQUIRED]`
   - Action 3.1: `[REQUIRED]`

---

## 4️⃣ Kill Chain — Threat Lifecycle

**Phases of the attack:**

| Phase | Description | EP-Specific Activity | Detection Opportunity |
|-------|-------------|---------------------|----------------------|
| **Reconnaissance** | `[REQUIRED: how adversary gathers intelligence]` | `[REQUIRED: e.g. "Monitor committee agendas, map rapporteur positions"]` | `[REQUIRED: what would reveal this phase]` |
| **Weaponisation** | `[REQUIRED: how capability is prepared]` | `[REQUIRED: e.g. "Draft blocking amendments, recruit co-signers"]` | `[REQUIRED]` |
| **Delivery** | `[REQUIRED: how weapon is deployed]` | `[REQUIRED: e.g. "Submit amendments at deadline, invoke Rule X"]` | `[REQUIRED]` |
| **Exploitation** | `[REQUIRED: how vulnerability is exploited]` | `[REQUIRED: e.g. "Force procedural delays via amendment voting"]` | `[REQUIRED]` |
| **Objectives** | `[REQUIRED: end-state achieved]` | `[REQUIRED: e.g. "Procedure stalled past session deadline"]` | `[REQUIRED]` |

**Narrative:** `[REQUIRED: ≥100 words explaining how the kill chain progresses from reconnaissance to objectives in the EP political context.]`

---

## 5️⃣ Mitigation Posture

**Existing institutional safeguards:**

| Safeguard | Source | Coverage | Residual Gap |
|-----------|--------|----------|--------------|
| `[REQUIRED: e.g. "Amendment deadline (Rule 193)"]` | `[REQUIRED: EP Rule of Procedure, treaty article, or institutional practice]` | `[REQUIRED: what this protects]` | `[REQUIRED: what it doesn't protect]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |
| `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` | `[REQUIRED]` |

**Gaps requiring attention:**

`[REQUIRED: ≥100 words identifying institutional vulnerabilities not covered by existing safeguards. What rule changes, procedural innovations, or monitoring mechanisms would close these gaps?]`

---

## 6️⃣ Named Threats (Additional)

### Threat 2: `[REQUIRED: name]`

**Diamond Model summary:** Adversary: `[...]` | Capability: `[...]` | Infrastructure: `[...]` | Victim: `[...]`

**Narrative:** `[REQUIRED: ≥80 words]`

---

### Threat 3: `[REQUIRED: name]`

**Diamond Model summary:** Adversary: `[...]` | Capability: `[...]` | Infrastructure: `[...]` | Victim: `[...]`

**Narrative:** `[REQUIRED: ≥80 words]`

---

## 7️⃣ Data Sources

**EP MCP tools used:** `get_meps`, `get_parliamentary_questions`, `get_mep_declarations`, `get_voting_records`

**Additional sources:** `[REQUIRED: list any external threat intelligence, civil society reports, or academic studies consulted]`

---

## 8️⃣ Confidence Assessment

**Overall confidence:** `[REQUIRED: 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW]`

**Confidence rationale:** `[REQUIRED: where threat assessments are evidence-based vs. inference-based. Note any gaps in roll-call data, declaration filings, or procedural transparency.]`

---

**Document Control:** `/analysis/daily/{date}/{type}-run{N}/intelligence/threat-model.md` · Template v1.1 · Depth floor: 250 lines.
