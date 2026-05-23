<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Committee Reports
## Week of 24–30 April 2026

**Run:** committee-reports | **Date:** 2026-05-01 | **Status:** Stage B Pass 1 Complete

---

## 📋 READING ORDER

```mermaid
%%{init: {"theme":"dark"}}%%
flowchart LR
    EB["📋 executive-brief.md\n(start here)"]
    AI["🗺️ analysis-index.md\n(this file)"]
    SS["🧠 synthesis-summary.md"]
    HB["📅 historical-baseline.md"]
    EC["💶 economic-context.md"]
    PA["🌐 pestle-analysis.md"]
    SM["👥 stakeholder-map.md"]
    SF["🔮 scenario-forecast.md"]
    TM["⚠️ threat-model.md"]
    WB["🦅 wildcards-blackswans.md"]
    RM["📊 risk-matrix.md"]
    QS["⚖️ quantitative-swot.md"]
    MR["🔍 mcp-reliability-audit.md"]
    RQ["📐 reference-analysis-quality.md"]
    MX["🪞 methodology-reflection.md"]
    CP["🏛️ existing/committee-productivity.md"]

    EB --> AI --> SS --> HB --> EC --> PA --> SM --> SF --> TM --> WB --> RM --> QS --> MR --> RQ --> CP --> MX
    style EB fill:#1565C0,color:#fff
    style SS fill:#7B1FA2,color:#fff
    style SM fill:#7B1FA2,color:#fff
    style TM fill:#D32F2F,color:#fff
    style WB fill:#D32F2F,color:#fff
    style RM fill:#FF9800,color:#000
    style CP fill:#2E7D32,color:#fff
    style MX fill:#FFC107,color:#000
```

---

## 📁 ARTIFACT INVENTORY

| # | File | Lines (target) | Status | Description |
|---|------|----------------|--------|-------------|
| 1 | `executive-brief.md` | ≥180 | ✅ Written | Top-line intelligence brief |
| 2 | `intelligence/analysis-index.md` | ≥100 | ✅ This file | Artifact index & reading order |
| 3 | `intelligence/synthesis-summary.md` | ≥160 | ✅ Written | Executive intelligence synthesis |
| 4 | `intelligence/historical-baseline.md` | ≥120 | ✅ Written | Historical context & EP productivity |
| 5 | `intelligence/economic-context.md` | ≥120 | ✅ Written | Macro context for committee dossiers |
| 6 | `intelligence/pestle-analysis.md` | ≥180 | ✅ Written | PESTLE scan of April 2026 committee landscape |
| 7 | `intelligence/stakeholder-map.md` | ≥200 | ✅ Written | Stakeholder power × alignment map |
| 8 | `intelligence/scenario-forecast.md` | ≥180 | ✅ Written | 3 scenarios for May–June 2026 |
| 9 | `intelligence/threat-model.md` | ≥160 | ✅ Written | Threat landscape for legislative pipeline |
| 10 | `intelligence/wildcards-blackswans.md` | ≥180 | ✅ Written | Low-probability, high-impact risks |
| 11 | `intelligence/mcp-reliability-audit.md` | ≥200 | ✅ Written | Data quality & MCP tool reliability |
| 12 | `intelligence/reference-analysis-quality.md` | ≥140 | ✅ Written | Analysis quality self-assessment |
| 13 | `risk-scoring/risk-matrix.md` | ≥100 | ✅ Written | Scored risk registry |
| 14 | `risk-scoring/quantitative-swot.md` | ≥100 | ✅ Written | Quantitative SWOT for EP10 committee system |
| 15 | `existing/committee-productivity.md` | ≥150 | ✅ Written | Committee-specific productivity intelligence |
| 16 | `intelligence/methodology-reflection.md` | ≥180 | ✅ Written | Analytical methodology retrospective |

---

## 🎯 DOMINANT INTELLIGENCE THEME

**EP10 committee system at peak productivity — April 2026 close confirms record trajectory**

The week of 24–30 April 2026 crystallised three concurrent dynamics that define the
current phase of EP10's legislative calendar:

1. **Platform Economy Governance**: IMCO's DMA enforcement resolution (TA-10-2026-0160)
   signals Parliament's intent to serve as an active oversight institution, not merely
   a ratification chamber, for the Commission's Digital Markets Act enforcement apparatus.

2. **Institutional Budget Autonomy**: BUDG's twin passage of 2027 budget guidelines and
   EP's own expenditure estimates in the same plenary week demonstrates coordination
   between the committee and the Conference of Presidents at an unusually early stage
   of the budget cycle, signalling a strategic intent to pre-empt Council cuts.

3. **Consensus-Mode Animal Welfare Legislation**: The dogs and cats welfare regulation
   achieved cross-spectrum support (estimated 520+ votes), marking a rare instance of
   near-unanimity in a Parliament otherwise characterised by three-way coalition arithmetic.

---

## 🗺️ DATA COLLECTION COVERAGE

| Source | Tools Used | Coverage |
|--------|-----------|----------|
| EP Committee Documents | `get_committee_documents`, `get_committee_documents_feed` | Feed unavailable; direct endpoint: 50+ AFCO documents |
| EP Adopted Texts | `get_adopted_texts` (year=2026), `get_adopted_texts_feed` (one-week) | 31 TA 2026 texts; feed: 164 items |
| EP Political Landscape | `generate_political_landscape` | Full 9-group landscape, 719 MEPs |
| Early Warning | `early_warning_system` | Stability 84/100, MEDIUM risk |
| Coalition Dynamics | `analyze_coalition_dynamics` | Size-proxy; vote-level cohesion unavailable |
| Committee Activity | `analyze_committee_activity` (ENVI, BUDG, IMCO, ECON) | Quantitative workload; attendance unavailable |
| Generated Stats | `get_all_generated_stats` (committee_meetings, 2024–2026) | Historical trend data |
| Plenary Sessions | `get_plenary_sessions` (year=2026) | 10+ sessions, 431–671 attendance range |
| Procedures Feed | `get_procedures_feed` (one-week) | Degraded mode (2025-era procedures); filtered |
| IMF Economic | `scripts/imf-mcp-probe.sh` | Probe run; context derived from available data |
| World Bank Non-Economic | `worldbank-mcp` | Available for non-economic indicators |

---

## 🔑 KEY DOCUMENT IDs FOR THIS RUN

| Document ID | Title | Committee | Date |
|-------------|-------|-----------|------|
| TA-10-2026-0160 | DMA Enforcement | IMCO | 30 Apr 2026 |
| TA-10-2026-0112 | 2027 Budget Guidelines | BUDG | 28 Apr 2026 |
| TA-10-2026-0115 | Dogs/Cats Welfare Regulation | ENVI | 28 Apr 2026 |
| TA-10-2026-0119 | EIB Annual Control 2024 | BUDG/CONT | 28 Apr 2026 |
| TA-10-2026-0122 | Performance Instruments Transparency | BUDG | 28 Apr 2026 |
| TA-10-2026-0142 | EU-Iceland PNR Agreement | LIBE | 29 Apr 2026 |
| TA-10-2026-0105 | Jaki Immunity Waiver | JURI | 28 Apr 2026 |
| TA-10-2026-0160 | DMA Enforcement Resolution | IMCO | 30 Apr 2026 |
| TA-10-2026-0161 | Ukraine Accountability | AFET | 30 Apr 2026 |
| TA-10-2026-0162 | Armenia Democratic Resilience | AFET | 30 Apr 2026 |
| TA-10-2026-0151 | Haiti Trafficking | DEVE | 30 Apr 2026 |
| TA-10-2026-04-30-ANN01 | EP 2027 Budget Estimates | BUDG | 30 Apr 2026 |

---

*Run context: 2026-05-01 | EP MCP Server v1.2.18 | committee-reports | Stage B Pass 1*
