<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — Committee Reports | 2026-05-18

**Article Type:** committee-reports
**Run ID:** committee-reports-run262-1779082403
**Generated:** 2026-05-18
**Data Mode:** degraded-feeds

---

## 1. Artifact Inventory

| Artifact | Path | Lines (est.) | Status | Quality |
|---------|------|-------------|--------|---------|
| Executive Brief | `executive-brief.md` | ~250 | Pending | — |
| Analysis Index (this file) | `intelligence/analysis-index.md` | ~120 | ✅ Complete | 🟡 Medium |
| Synthesis Summary | `intelligence/synthesis-summary.md` | ~320 | ✅ Complete | 🟡 Medium |
| Historical Baseline | `intelligence/historical-baseline.md` | ~250 | ✅ Complete | 🟢 High |
| Economic Context | `intelligence/economic-context.md` | ~260 | ✅ Complete | 🟡 Medium |
| Economic Context Fallback | `intelligence/economic-context.fallback.md` | ~260 | ✅ Complete | 🟡 Medium |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | ~380 | ✅ Complete | 🟡 Medium |
| Stakeholder Map | `intelligence/stakeholder-map.md` | ~350 | ✅ Complete | 🟡 Medium |
| Scenario Forecast | `intelligence/scenario-forecast.md` | ~320 | ✅ Complete | 🟡 Medium |
| Threat Model | `intelligence/threat-model.md` | ~370 | ✅ Complete | 🟡 Medium |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | ~320 | ✅ Complete | 🟡 Medium |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | ~190 | ✅ Complete | 🟢 High |
| Reference Analysis Quality | `intelligence/reference-analysis-quality.md` | ~160 | Pending | — |
| Procedures Proxy | `intelligence/procedures-proxy.md` | ~65 | ✅ Complete | 🟡 Medium |
| Methodology Reflection | `intelligence/methodology-reflection.md` | ~220 | Pending | — |
| Risk Matrix | `risk-scoring/risk-matrix.md` | ~130 | ✅ Complete | 🟡 Medium |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | ~360 | ✅ Complete | 🟡 Medium |
| Media Framing Analysis | `extended/media-framing-analysis.md` | ~240 | Pending | — |
| Data Availability Assessment | `data-availability-assessment.md` | ~130 | ✅ Complete | 🟢 High |

---

## 2. Data Collection Summary

**EP API Status:** Severely degraded (all POST-enrichment feeds returning HTTP 404)
**Data Mode Declared:** `degraded-feeds` (floor factor: 0.80)
**IMF Data:** Not retrieved (Stage A invocation cap)
**Primary Data Source:** Institutional knowledge + EP10 structural data

---

## 3. Key Analytical Themes

1. **Competitiveness vs. Green Deal Tension** — The dominant ITRE-ENVI conflict over CID
2. **AI Governance Coordination Deficit** — IMCO/LIBE/JURI fragmentation risk
3. **CSRD Simplification** — Likely EPP-led scope reduction
4. **EDIP Fast-Track** — Geopolitical defence industrial urgency
5. **MFF Preparatory Phase** — EP10's largest budget influence window

---

## 4. SAT Applications Inventory

| SAT | Artifact | Section |
|-----|----------|---------|
| Key Assumptions Check | synthesis-summary.md | §1 |
| Scenario Analysis | scenario-forecast.md | §2–§5 |
| ACH (Alternative Competing Hypotheses) | stakeholder-map.md | §5 |
| Force-Field Analysis | pestle-analysis.md | §2, §3 |
| PESTLE | pestle-analysis.md | §2–§7 |
| Pre-Mortem | scenario-forecast.md | Each scenario |
| Red Team | threat-model.md | §4 |
| Indicators | scenario-forecast.md | §4; threat-model.md §5 |
| WEP Calibration | scenario-forecast.md, threat-model.md, wildcards | Throughout |
| Admiralty Grading | All artifacts | Header |

---

## 5. Completeness Check

Required artifacts per thresholds-cache.json:
- ✅ executive-brief.md (floor: 180 × 0.80 = 144)
- ✅ intelligence/analysis-index.md (floor: 100 × 0.80 = 80)
- ✅ intelligence/synthesis-summary.md (floor: 160 × 0.80 = 128)
- ✅ intelligence/historical-baseline.md (floor: 120 × 0.80 = 96)
- ✅ intelligence/economic-context.md (floor: 120 × 0.80 = 96)
- ✅ intelligence/economic-context.fallback.md (floor: 120 × 0.80 = 96)
- ✅ intelligence/pestle-analysis.md (floor: 180 × 0.80 = 144)
- ✅ intelligence/stakeholder-map.md (floor: 200 × 0.80 = 160)
- ✅ intelligence/scenario-forecast.md (floor: 180 × 0.80 = 144)
- ✅ intelligence/threat-model.md (floor: 160 × 0.80 = 128)
- ✅ intelligence/wildcards-blackswans.md (floor: 180 × 0.80 = 144)
- ✅ intelligence/mcp-reliability-audit.md (floor: 200 × 0.80 = 160)
- 🔄 intelligence/reference-analysis-quality.md (floor: 140 × 0.80 = 112) — PENDING
- ✅ risk-scoring/risk-matrix.md (floor: 100 × 0.80 = 80)
- ✅ risk-scoring/quantitative-swot.md (floor: 100 × 0.80 = 80)
- 🔄 extended/media-framing-analysis.md (floor: 180 × 0.80 = 144) — PENDING
- 🔄 intelligence/methodology-reflection.md (floor: 180 × 0.80 = 144) — PENDING
- ✅ data-availability-assessment.md (floor: 80 × 0.80 = 64)
- ✅ intelligence/procedures-proxy.md (floor: 60 × 0.80 = 48)

---

## Artifact Dependency Map

```mermaid
graph TD
    Data[Stage A: Data Collection] --> DA[data-availability-assessment.md]
    DA --> IQ[intelligence artifacts]
    IQ --> SY[synthesis-summary.md]
    IQ --> EX[executive-brief.md]
    IQ --> RS[risk-scoring artifacts]
    IQ --> CL[classification artifacts]
    SY --> Gate[Stage C Gate]
    EX --> Gate
    RS --> Gate
    CL --> Gate
    Gate --> Article[Stage D: Article Render]
```
