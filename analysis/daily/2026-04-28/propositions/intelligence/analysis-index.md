<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Propositions
## 2026-04-28 | Run: propositions-run-1777356258

**Article Type:** propositions | **Data Window:** 2026-04-21 → 2026-04-28

---

## Artifact Inventory

| Artifact | Path | Status | Lines (est.) | Floor |
|---------|------|--------|-------------|-------|
| Executive Brief | executive-brief.md | ✅ Complete | ~220 | 180 |
| Analysis Index | intelligence/analysis-index.md | ✅ This file | ~110 | 100 |
| Synthesis Summary | intelligence/synthesis-summary.md | ✅ Complete | ~200 | 160 |
| Historical Baseline | intelligence/historical-baseline.md | ✅ Complete | ~140 | 120 |
| Economic Context | intelligence/economic-context.md | ✅ Complete | ~145 | 120 |
| PESTLE Analysis | intelligence/pestle-analysis.md | ✅ Complete | ~200 | 180 |
| Stakeholder Map | intelligence/stakeholder-map.md | ✅ Complete | ~220 | 200 |
| Scenario Forecast | intelligence/scenario-forecast.md | ✅ Complete | ~200 | 180 |
| Threat Model | intelligence/threat-model.md | ✅ Complete | ~185 | 160 |
| Wildcards & Black Swans | intelligence/wildcards-blackswans.md | ✅ Complete | ~200 | 180 |
| MCP Reliability Audit | intelligence/mcp-reliability-audit.md | ✅ Complete | ~215 | 200 |
| Reference Analysis Quality | intelligence/reference-analysis-quality.md | ✅ Complete | ~160 | 140 |
| Risk Matrix | risk-scoring/risk-matrix.md | ✅ Complete | ~120 | 100 |
| Quantitative SWOT | risk-scoring/quantitative-swot.md | ✅ Complete | ~115 | 100 |
| Methodology Reflection | intelligence/methodology-reflection.md | ✅ Complete | ~200 | 180 |
| Impact Matrix | classification/impact-matrix.md | ✅ Complete | ~90 | 30 |
| Forces Analysis | classification/forces-analysis.md | ✅ Complete | ~90 | 30 |
| Actor Mapping | classification/actor-mapping.md | ✅ Complete | ~90 | 30 |
| Political Capital Risk | risk-scoring/political-capital-risk.md | ✅ Complete | ~90 | 30 |
| Legislative Velocity Risk | risk-scoring/legislative-velocity-risk.md | ✅ Complete | ~90 | 30 |
| Actor Threat Profiles | threat-assessment/actor-threat-profiles.md | ✅ Complete | ~90 | 30 |
| Legislative Disruption | threat-assessment/legislative-disruption.md | ✅ Complete | ~90 | 30 |
| Consequence Trees | threat-assessment/consequence-trees.md | ✅ Complete | ~90 | 30 |
| Pipeline Health | existing/pipeline-health.md | ✅ Complete | ~80 | 30 |

---

## Key Findings Summary

### Legislative Activity

- **104 texts adopted** in 2026 (January–March), pace ~35% above EP9 equivalent
- **Banking Union Trilogy** (SRMR3/BRRD3/DGSD2) adopted March 26 — landmark completion
- **AI Act Omnibus** and **Climate Neutrality Framework** adopted in Q1 2026
- **Current session**: Strasbourg mini-plenary (April 27–30) — votes ongoing

### Political Dynamics

- EPP dominant at 37.5%; grand coalition with S&D (combined ~58%) is the default majority-building pathway
- **HIGH fragmentation** — 9 political groups require complex cross-group alliances
- Stability score: **84/100** (MEDIUM risk)
- Procedures feed in **RECESS_MODE** — no live procedure pipeline data available

### Data Quality

- EP Open Data Portal adopted texts: ✅ **RELIABLE** (104 records)
- Procedures feed: 🔴 **RECESS_MODE** (historical archive only)
- Voting records: 🔴 **UNAVAILABLE** (4–6 week delay)
- Political landscape: 🟡 **PARTIAL** (200 MEP sample)
- Council responses (external docs): ✅ **AVAILABLE** (6 items, April 22)

---

## Data Sources Used

| Source | Tool | Status | Notes |
|-------|------|--------|-------|
| EP Adopted Texts 2026 | `get_adopted_texts(year=2026)` | ✅ | 104 records, pages 1–3 |
| EP Procedures Feed | `get_procedures_feed(one-week)` | 🔴 RECESS | Historical archive only |
| External Documents Feed | `get_external_documents_feed` | ✅ | 6 Council responses, April 22 |
| Plenary Sessions 2026 | `get_plenary_sessions(year=2026)` | ✅ | 21 sessions confirmed |
| Political Landscape | `generate_political_landscape` | ✅ | 200 MEP sample |
| Coalition Dynamics | `analyze_coalition_dynamics` | 🟡 | Size-proxy only, no vote data |
| Early Warning | `early_warning_system` | ✅ | 3 warnings, MEDIUM risk |
| Voting Records | `get_voting_records(2026-03-01...)` | 🔴 | EP publication delay |

---

## Analytical Frameworks Applied

1. **Political Intelligence Analysis** (CIA methodology) — actor motivations, coalition mathematics
2. **PESTLE Analysis** — six-domain environmental scan
3. **Threat Modelling** — legislative blocking risks, geopolitical spillovers
4. **Scenario Forecasting** — three plausible futures (6-month horizon)
5. **SWOT Analysis (Quantitative)** — legislative pipeline strengths/weaknesses
6. **WEP Probability Bands** — epistemic uncertainty quantified on all key judgements
7. **Admiralty Grading** — source reliability A–E, information quality 1–5

---

*Generated: 2026-04-28 | Run: propositions-run-1777356258 | EP Open Data Portal*
