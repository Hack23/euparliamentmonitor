<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Propositions
**Date:** 2026-04-27 | **Run:** propositions | **Stage:** B (Pass 1+2)

---

## How to Read This Run

This analysis covers the EU Parliament's active legislative propositions pipeline as of April 27, 2026. The primary focus is on **three intersecting legislative streams**: banking/financial regulation (SRMR3 publication), rule-of-law/anti-corruption (new directive adopted), and trade/economic defense (US tariff trilogue). Each artifact below provides a distinct analytical lens on these interconnected themes.

**Reading order for intelligence consumers:**
1. `executive-brief.md` — 60-second situational awareness
2. `intelligence/synthesis-summary.md` — strategic narrative and judgments
3. `intelligence/scenario-forecast.md` — probabilistic outcomes
4. `intelligence/pestle-analysis.md` — contextual framework
5. `intelligence/stakeholder-map.md` — who controls the outcomes
6. `intelligence/threat-model.md` — legislative disruption risks
7. `intelligence/economic-context.md` — financial/economic indicators
8. `risk-scoring/risk-matrix.md` — risk prioritization

---

## Artifact Registry

### Mandatory Artifacts

| Artifact | Path | Lines | Status | Confidence |
|----------|------|-------|--------|-----------|
| Executive Brief | `executive-brief.md` | 180+ | ✅ Complete | 🟡 Medium |
| Analysis Index | `intelligence/analysis-index.md` | 100+ | ✅ This file | 🟢 High |
| Synthesis Summary | `intelligence/synthesis-summary.md` | 160+ | ✅ Complete | 🟡 Medium |
| Historical Baseline | `intelligence/historical-baseline.md` | 120+ | ✅ Complete | 🟡 Medium |
| Economic Context | `intelligence/economic-context.md` | 120+ | ✅ Complete | 🟡 Medium |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | 180+ | ✅ Complete | 🟡 Medium |
| Stakeholder Map | `intelligence/stakeholder-map.md` | 200+ | ✅ Complete | 🟡 Medium |
| Scenario Forecast | `intelligence/scenario-forecast.md` | 180+ | ✅ Complete | 🟡 Medium |
| Threat Model | `intelligence/threat-model.md` | 160+ | ✅ Complete | 🟡 Medium |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | 180+ | ✅ Complete | 🔴 Low |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | 200+ | ✅ Complete | 🟢 High |
| Reference Analysis Quality | `intelligence/reference-analysis-quality.md` | 140+ | ✅ Complete | 🟢 High |
| Risk Matrix | `risk-scoring/risk-matrix.md` | 100+ | ✅ Complete | 🟡 Medium |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | 100+ | ✅ Complete | 🟡 Medium |
| Methodology Reflection | `intelligence/methodology-reflection.md` | 180+ | ✅ Complete | 🟢 High |

### Structural Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Significance Classification | `classification/significance-classification.md` | ✅ Complete |
| Impact Matrix | `classification/impact-matrix.md` | ✅ Complete |
| Forces Analysis | `classification/forces-analysis.md` | ✅ Complete |
| Actor Mapping | `classification/actor-mapping.md` | ✅ Complete |
| Political Threat Landscape | `threat-assessment/political-threat-landscape.md` | ✅ Complete |
| Actor Threat Profiles | `threat-assessment/actor-threat-profiles.md` | ✅ Complete |
| Consequence Trees | `threat-assessment/consequence-trees.md` | ✅ Complete |
| Legislative Disruption | `threat-assessment/legislative-disruption.md` | ✅ Complete |
| Political Capital Risk | `risk-scoring/political-capital-risk.md` | ✅ Complete |
| Legislative Velocity Risk | `risk-scoring/legislative-velocity-risk.md` | ✅ Complete |
| Pipeline Health | `existing/pipeline-health.md` | ✅ Complete |
| Workflow Audit | `intelligence/workflow-audit.md` | ✅ Complete |

---

## Key Judgments (Master Summary)

**JDG-001** 🟡 WEP LIKELY (65–80%): The Anti-Corruption Directive will face significant Council resistance from at least 3–5 Member States, extending second reading negotiations into Q3–Q4 2026.

**JDG-002** 🟢 WEP ALMOST CERTAINLY (>95%): SRMR3 transposition clock started April 20, 2026 (OJ publication). All 27 Member States must implement bank resolution reforms by the statutory deadline.

**JDG-003** 🟡 WEP LIKELY (60–75%): The first US tariff counter-measure trilogue (April 13) will require at least 3–4 additional rounds before a final text is agreed, putting formal adoption at Q4 2026 at earliest.

**JDG-004** 🟡 WEP ROUGHLY EVEN (45–55%): The EPP will seek to conclude at least one major legislation (Defence Industrial Projects or SAFE instrument) before the summer recess to consolidate its legislative record.

**JDG-005** 🔴 WEP UNLIKELY (15–25%): An emergency plenary session specifically addressing US tariffs will be triggered before June, unless the trade dispute escalates dramatically.

---

## Data Quality Summary

| Feed | Status | Items Returned | Quality Flag |
|------|--------|----------------|-------------|
| `get_procedures_feed` | 🔴 RECESS_MODE | Historical items only (1972–1987) | ⚠️ Known degraded-upstream pattern |
| `get_external_documents_feed` | 🟢 OPERATIONAL | 6 items (ACT_FOLLOWUP) | ✅ Fresh (April 22, 2026) |
| `get_committee_documents_feed` | 🔴 UNAVAILABLE | 0 items | ⚠️ EP API error in body |
| `get_adopted_texts` | 🟢 OPERATIONAL | 71 items (2026) | ✅ Complete catalog |
| `get_adopted_texts_feed` | 🟢 OPERATIONAL | 67 items with 2026 IDs | ✅ Operational |
| `get_plenary_sessions` | 🟢 OPERATIONAL | 10 sessions (Jan–Feb 2026) | 🟡 Recent missing (EP API lag) |
| `track_legislation` | 🟡 PARTIAL | 3 procedures tracked | 🟡 No amendments/votes |
| `monitor_legislative_pipeline` | 🔴 EMPTY | 0 active procedures | ⚠️ Known enrichment gap |
| `analyze_coalition_dynamics` | 🟡 PARTIAL | 8 groups, size-proxy only | 🟡 No vote-level cohesion |
| `get_voting_records` | 🔴 UNAVAILABLE | 0 items (April 2026) | ⚠️ EP publication delay (4–6 weeks) |
| `generate_political_landscape` | 🟢 OPERATIONAL | 9 groups, 719 MEPs | ✅ Current |
| `get_all_generated_stats` | 🟢 OPERATIONAL | 2024–2026 data | ✅ High confidence |

---

## Run Parameters

| Parameter | Value |
|-----------|-------|
| Run Date | 2026-04-27 |
| Article Type | propositions |
| Data Window | Last 7 days (2026-04-20 to 2026-04-27) |
| ANALYSIS_DIR | analysis/daily/2026-04-27/propositions |
| Total Procedures Tracked | 3 (SRMR3, Anti-Corruption, US Tariffs) |
| Adopted Texts 2026 | 71 (through early April) |
| Analytical Frameworks Applied | 10 (PESTLE, SWOT, Stakeholder Map, ACH, Scenario Planning, Risk Matrix, Threat Modeling, Coalition Analysis, OSINT, Historical Baseline) |
| MCP Server | european-parliament-mcp-server@1.2.15 |

---

*Index compiled: 2026-04-27 | Analyst: Automated pipeline | Stage: B complete*
