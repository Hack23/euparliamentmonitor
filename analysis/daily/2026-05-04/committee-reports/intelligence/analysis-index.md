<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EP Committee Reports Week 27 Apr–4 May 2026

**Article Type:** committee-reports | **Date:** 2026-05-04
**Purpose:** Master index of all analysis artifacts in this run

---

## Run Metadata

| Field | Value |
|-------|-------|
| Article type | committee-reports |
| Analysis date | 2026-05-04 |
| Data window | 2026-04-27 to 2026-05-04 |
| Primary data source | EP MCP Server: get_adopted_texts (year=2026) |
| Items analyzed | 9 adopted texts from the data window |
| IMF status | 🔴 Degraded (proxy timeout) |
| EP feeds status | ⚠️ committee_documents_feed unavailable; events_feed unavailable |
| EP direct endpoints | ✅ get_adopted_texts, track_legislation, analyze_committee_activity |

---

## Stage A Data Files

| File | Description | Status |
|------|-------------|--------|
| `data/adopted-texts-2026-04-27-to-2026-05-04.json` | 9 adopted texts with metadata | ✅ |
| `cache/imf/probe-summary.json` | IMF probe result (unavailable) | ✅ |

---

## Stage B Pass 1 — Analysis Artifacts

### Mandatory Artifacts (Required for committee-reports)

| Artifact | File | Lines | Status |
|----------|------|-------|--------|
| Executive Brief | `executive-brief.md` | ~180+ | ✅ Pass 1 |
| Synthesis Summary | `intelligence/synthesis-summary.md` | ~200+ | ✅ Pass 1 |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | ~220+ | ✅ Pass 1 |
| Stakeholder Map | `intelligence/stakeholder-map.md` | ~310+ | ✅ Pass 1 |
| Scenario Forecast | `intelligence/scenario-forecast.md` | ~200+ | ✅ Pass 1 |
| Significance Classification | `classification/significance-classification.md` | ~140+ | ✅ Pass 1 |
| Risk Assessment | `risk-scoring/risk-assessment.md` | ~170+ | ✅ Pass 1 |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | ~240+ | ✅ Pass 1 |
| Political Threat Landscape | `threat-assessment/political-threat-landscape.md` | ~210+ | ✅ Pass 1 |
| Actor Mapping | `classification/actor-mapping.md` | ~200+ | ✅ Pass 1 |
| Economic Context | `intelligence/economic-context.md` | ~120+ | ✅ Pass 1 |
| Historical Baseline | `intelligence/historical-baseline.md` | ~160+ | ✅ Pass 1 |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | ~150+ | ✅ Pass 1 |
| Coalition Dynamics | `intelligence/coalition-dynamics.md` | ~170+ | ✅ Pass 1 |
| Forces Analysis | `classification/forces-analysis.md` | — | ⏳ Pending |
| Impact Matrix | `classification/impact-matrix.md` | — | ⏳ Pending |
| Risk Matrix | `risk-scoring/risk-matrix.md` | — | ⏳ Pending |
| Political Capital Risk | `risk-scoring/political-capital-risk.md` | — | ⏳ Pending |
| Legislative Velocity Risk | `risk-scoring/legislative-velocity-risk.md` | — | ⏳ Pending |
| Consequence Trees | `threat-assessment/consequence-trees.md` | — | ⏳ Pending |
| Legislative Disruption | `threat-assessment/legislative-disruption.md` | — | ⏳ Pending |
| Actor Threat Profiles | `threat-assessment/actor-threat-profiles.md` | — | ⏳ Pending |
| Document Analysis Index | `documents/document-analysis-index.md` | — | ⏳ Pending |
| Committee Productivity | `existing/committee-productivity.md` | — | ⏳ Pending |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | — | ⏳ Pending |
| Workflow Audit | `intelligence/workflow-audit.md` | — | ⏳ Pending |
| Methodology Reflection | `methodology-reflection.md` | — | ⏳ Pending (final artifact) |
| Manifest | `manifest.json` | — | ⏳ Pending |

---

## Evidence Citations Master Map

| Artifact | Primary Evidence Sources |
|----------|------------------------|
| executive-brief.md | TA-10-2026-0112, 0160, 0161, 0162, 0163, 0164, 0165 |
| synthesis-summary.md | All 9 adopted texts; procedure 2025-2246(BUI) timeline |
| pestle-analysis.md | All 9 adopted texts; geopolitical context |
| stakeholder-map.md | All 9 adopted texts; committee assignments |
| scenario-forecast.md | TA-10-2026-0160 (DMA); TA-10-2026-0112 (Budget) |
| significance-classification.md | Tiered scoring of all 9 texts |
| risk-assessment.md | TA-10-2026-0160, 0112, 0161 as primary risk drivers |
| quantitative-swot.md | All 9 adopted texts; structural analysis |
| political-threat-landscape.md | TA-10-2026-0160, 0161 as primary threat context |
| actor-mapping.md | Committee assignments, political group affiliations |
| economic-context.md | TA-10-2026-0112, 0160 (structural only — IMF degraded) |
| historical-baseline.md | Historical precedents for DMA, PNR, Budget, AFET |
| wildcards-blackswans.md | Scenario analysis across all 9 texts |
| coalition-dynamics.md | Political group arithmetic; vote coalitions |

---

## Analysis Quality Summary (Pass 1 Preliminary)

| Dimension | Self-Assessment | Notes |
|-----------|-----------------|-------|
| Evidence coverage | 🟡 MEDIUM | 9 adopted texts fully analyzed; no voting data (API delay) |
| Economic analysis depth | 🔴 LIMITED | IMF unavailable; structural analysis only |
| Stakeholder granularity | 🟢 HIGH | 12 stakeholder profiles across 5 clusters |
| Scenario quality | 🟡 MEDIUM | 4 scenarios; indicators identified |
| Historical grounding | 🟢 HIGH | Multiple precedent chains established |
| IMF compliance | 🔴 DEGRADED | No IMF figures; all qualitative |
| SWOT completeness | 🟢 HIGH | Weighted scores; 80+ words per item |

---

## Pass 2 Targets

The following artifacts require deepening in Pass 2 (read-back and rewrite):
1. `economic-context.md` — Expand structural analysis; add more sectoral depth
2. `scenario-forecast.md` — Add quantitative probability ranges where possible
3. `synthesis-summary.md` — Ensure 3+ evidence citations per cluster
4. `significance-classification.md` — Add historical comparators for each tier
5. All risk artifacts — Ensure cross-reference to specific TA-10-2026-XXXX documents
