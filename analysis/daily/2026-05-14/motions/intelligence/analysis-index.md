<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Motions, May 14 2026
## Read-Me-First: Artifact Inventory & Recommended Reading Order

**Article Type:** Motions | **Session:** Strasbourg April 28–30, 2026 | **Run:** motions-run306-1778742150

---

## 🗺️ Artifact Map

```mermaid
%%{init: {"theme":"dark","themeVariables":{"primaryColor":"#1565C0","primaryTextColor":"#ffffff","lineColor":"#90CAF9","secondaryColor":"#2E7D32","tertiaryColor":"#FF9800"}}}%%
flowchart LR
    BRIEF["📋 executive-brief.md\n(Lead findings)"]
    INDEX["📑 analysis-index.md\n(This file)"]
    
    subgraph INTEL["🧠 intelligence/"]
        SYN["synthesis-summary.md"]
        STAKE["stakeholder-map.md"]
        SCEN["scenario-forecast.md"]
        PESTLE["pestle-analysis.md"]
        THREAT["threat-model.md"]
        COAL["coalition-dynamics.md"]
        VOTE["voting-patterns.md"]
        HIST["historical-baseline.md"]
        ECON["economic-context.md"]
        WILD["wildcards-blackswans.md"]
        CROSS["cross-session-intelligence.md"]
        MCP["mcp-reliability-audit.md"]
        QUAL["reference-analysis-quality.md"]
        AUDIT["workflow-audit.md"]
        DIFF["cross-run-diff.md"]
        METH["methodology-reflection.md"]
    end
    
    subgraph CLASS["🏷️ classification/"]
        SIG["significance-classification.md"]
        ACT["actor-mapping.md"]
        FOR["forces-analysis.md"]
        IMP["impact-matrix.md"]
    end
    
    subgraph RISK["⚠️ risk-scoring/"]
        RM["risk-matrix.md"]
        SWOT["quantitative-swot.md"]
        PCR["political-capital-risk.md"]
        LVR["legislative-velocity-risk.md"]
    end
    
    subgraph THREAT2["🎭 threat-assessment/"]
        PTL["political-threat-landscape.md"]
        ATP["actor-threat-profiles.md"]
        CT["consequence-trees.md"]
        LD["legislative-disruption.md"]
    end
    
    DOCS["📄 documents/document-analysis-index.md"]
    DEEP["📜 existing/deep-analysis.md"]
    BASE["📜 existing/session-baseline.md"]
    
    INDEX --> BRIEF
    BRIEF --> INTEL
    INTEL --> CLASS
    CLASS --> RISK
    RISK --> THREAT2
    THREAT2 --> DOCS
    DOCS --> DEEP
```

---

## 📖 Recommended Reading Order

| Step | File | Purpose | Estimated Read Time |
|------|------|---------|---------------------|
| 1 | `executive-brief.md` | Top findings and lead stories | 5 min |
| 2 | `intelligence/synthesis-summary.md` | Cross-artifact intelligence synthesis | 8 min |
| 3 | `intelligence/voting-patterns.md` | Group voting behavior, coalitions, anomalies | 6 min |
| 4 | `intelligence/stakeholder-map.md` | Power × Alignment of key actors | 6 min |
| 5 | `intelligence/coalition-dynamics.md` | Alliance analysis, group cohesion data | 5 min |
| 6 | `intelligence/scenario-forecast.md` | 3+ probability-weighted futures | 6 min |
| 7 | `classification/significance-classification.md` | Tier 1–4 impact triage | 4 min |
| 8 | `existing/deep-analysis.md` | Full text deep analysis of all 13 texts | 15 min |
| 9 | `risk-scoring/quantitative-swot.md` | Scored SWOT for EP 10th term positioning | 4 min |
| 10 | `intelligence/economic-context.md` | IMF fiscal and trade data for policy context | 5 min |
| 11 | All remaining artifacts | Supporting methodology and cross-checks | 20 min |

---

## 🔑 Key Adopted Texts This Period

| Text | Date | Title (Short) | Type | Priority |
|------|------|---------------|------|----------|
| T10-0161/2026 | 2026-04-30 | Russia accountability / Ukraine | RESOLUTION | 🔴 High |
| T10-0151/2026 | 2026-04-30 | Haiti trafficking | URGENCY RES. | 🟠 High |
| T10-0162/2026 | 2026-04-30 | Armenia democratic resilience | URGENCY RES. | 🟠 High |
| T10-0163/2026 | 2026-04-30 | Cyberbullying / platform liability | RESOLUTION | 🟡 Medium |
| T10-0160/2026 | 2026-04-30 | Digital Markets Act enforcement | RESOLUTION | 🟡 Medium |
| T10-0157/2026 | 2026-04-30 | EU livestock sector sustainability | A-REPORT | 🟡 Medium |
| T10-0112/2026 | 2026-04-28 | 2027 Budget Guidelines | BUDGET RES. | 🔴 High |
| T10-0105/2026 | 2026-04-28 | Patryk Jaki immunity waiver | IMMUNITY | 🟡 Medium |
| T10-0115/2026 | 2026-04-28 | Dog/cat welfare and traceability | A-REPORT | 🟡 Medium |
| T10-0119/2026 | 2026-04-28 | EIB financial control 2024 | A-REPORT | 🟡 Medium |
| T10-0122/2026 | 2026-04-28 | Performance-based instruments | A-REPORT | 🟡 Medium |
| T10-0132/2026 | 2026-04-29 | Discharge 2024: Committee of Regions | DISCHARGE | 🟡 Medium |
| T10-0142/2026 | 2026-04-29 | EU-Iceland PNR agreement | A-REPORT | 🟡 Medium |

---

## 📊 Session Political Landscape Summary

**Dominant coalition this session:** EPP + S&D + Renew Europe (progressive-centrist bloc, ≈430/716 seats)

**Opposition:** PfE + ECR + ESN (right-populist bloc, ≈185/716 seats); GUE/NGL (left, ≈46 seats) selectively aligned

**Notable dynamics:**
- ECR split on Ukraine sanctions provisions (Polish MEPs PiS abstaining vs. Baltic MEPs for)
- PfE cohesion tested by Armenia resolution (Hungary's Fidesz group objecting to EU-Armenia association framing)
- Greens punching above seat weight on DMA enforcement and budget climate earmarks

---

## 📁 Complete Artifact Inventory

### intelligence/ (17 files)
- `analysis-index.md` — this file
- `synthesis-summary.md` — integrated intelligence synthesis
- `stakeholder-map.md` — power × alignment quadrant with 12+ named actors
- `scenario-forecast.md` — 3 probability-weighted scenarios
- `pestle-analysis.md` — PESTLE scan
- `threat-model.md` — Diamond model + attack trees
- `coalition-dynamics.md` — group cohesion and cross-party pairs
- `voting-patterns.md` — vote-by-vote breakdown and anomaly detection
- `historical-baseline.md` — precedent analysis
- `economic-context.md` — IMF/WB economic data integration
- `wildcards-blackswans.md` — low-probability high-impact scenarios
- `cross-session-intelligence.md` — continuity with prior sessions
- `mcp-reliability-audit.md` — data source reliability audit
- `reference-analysis-quality.md` — self-assessed quality check
- `workflow-audit.md` — pipeline audit log
- `cross-run-diff.md` — delta vs. prior runs
- `methodology-reflection.md` — Step 10.5 mandatory reflection

### classification/ (4 files)
- `significance-classification.md`
- `actor-mapping.md`
- `forces-analysis.md`
- `impact-matrix.md`

### risk-scoring/ (4 files)
- `risk-matrix.md`
- `quantitative-swot.md`
- `political-capital-risk.md`
- `legislative-velocity-risk.md`

### threat-assessment/ (4 files)
- `political-threat-landscape.md`
- `actor-threat-profiles.md`
- `consequence-trees.md`
- `legislative-disruption.md`

### documents/ (1 file)
- `document-analysis-index.md`

### existing/ (2 files)
- `deep-analysis.md`
- `session-baseline.md`

### Root (2 files)
- `executive-brief.md`
- `manifest.json`

**Total: 36 artifact files**
