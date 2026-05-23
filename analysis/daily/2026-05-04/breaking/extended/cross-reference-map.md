<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Reference Map — EP Breaking News | April 28–30, 2026

**Date:** 2026-05-04 | **Type:** Artifact Cross-Reference Index

## Purpose

Maps thematic and evidential connections between analysis artifacts to ensure consistency and enable rapid cross-artifact synthesis.

---

## Primary Document → Artifact Map

| Document | Artifacts Referencing This Source |
|----------|----------------------------------|
| TA-10-2026-0160 (DMA enforcement) | executive-brief, swot-analysis, intelligence/pestle-analysis, intelligence/scenario-forecast, extended/devils-advocate-analysis, extended/comparative-international, extended/historical-parallels |
| TA-10-2026-0161 (Ukraine STCA) | executive-brief, swot-analysis, intelligence/threat-model, intelligence/coalition-dynamics, extended/historical-parallels, extended/comparative-international, extended/devils-advocate-analysis |
| TA-10-2026-0162 (Armenia) | executive-brief, stakeholder-analysis, intelligence/political-threat-landscape, intelligence/historical-baseline, extended/comparative-international |
| EP Political Landscape API | coalition-dynamics (root), intelligence/coalition-dynamics, extended/coalition-mathematics, risk-scoring/risk-matrix |
| Early Warning System | intelligence/political-threat-landscape, risk-scoring/risk-matrix, executive-brief |
| TA-10-2026-04-30-ANN01 (EP Budget 2027) | executive-brief, extended/executive-brief, extended/coalition-mathematics |
| Patryk Jaki immunity waiver | classification/significance-classification, extended/historical-parallels, extended/comparative-international |
| MFF 2028–2034 opening debate | extended/executive-brief, extended/coalition-mathematics, extended/forward-indicators, risk-scoring/risk-matrix |

---

## Artifact Thematic Cluster Map

### Cluster A: Political Coalition Analysis
- `coalition-dynamics.md` (root) — primary
- `intelligence/coalition-dynamics.md` — extended
- `extended/coalition-mathematics.md` — quantitative
- `extended/comparative-international.md` (§ Rule of Law)
- `risk-scoring/risk-matrix.md` (R-01, R-09)

### Cluster B: Digital Policy (DMA)
- `executive-brief.md` (§ DMA)
- `intelligence/pestle-analysis.md` (Technology, Economic axes)
- `intelligence/scenario-forecast.md` (Scenario 1)
- `extended/devils-advocate-analysis.md` (Contrarian Thesis 1)
- `extended/comparative-international.md` (§ Digital Regulation)
- `extended/historical-parallels.md` (Parallel 1)
- `extended/executive-brief.md` (§ DMA Extended Context)
- `risk-scoring/risk-matrix.md` (R-DMA-01, R-DMA-02, R-DMA-03)

### Cluster C: Ukraine / STCA / Accountability
- `executive-brief.md` (§ Ukraine STCA)
- `intelligence/threat-model.md` (Russia threat axis)
- `intelligence/historical-baseline.md` (Ukraine resolution history)
- `extended/historical-parallels.md` (Parallel 2)
- `extended/comparative-international.md` (§ STCA)
- `extended/devils-advocate-analysis.md` (Contrarian Thesis 2)
- `risk-scoring/risk-matrix.md` (R-STK-01, R-STK-02, R-STK-03)

### Cluster D: Budget / MFF
- `executive-brief.md` (§ Budget 2027)
- `extended/executive-brief.md` (§ MFF 2028–2034)
- `extended/coalition-mathematics.md` (§ Coalition Stress Points, MFF)
- `extended/historical-parallels.md` (Parallel 3)
- `extended/comparative-international.md` (§ Budget/MFF)
- `extended/devils-advocate-analysis.md` (Contrarian Thesis 3)
- `risk-scoring/risk-matrix.md` (R-01)

### Cluster E: Risk Assessment
- `risk-assessment.md` (root) — primary
- `risk-scoring/risk-matrix.md` — quantitative
- `risk-scoring/quantitative-swot.md` — SWOT scoring
- `intelligence/wildcards-blackswans.md` — tail risks
- `intelligence/scenario-forecast.md` — scenario risks

### Cluster F: Coalition Quality Assessment
- `swot-analysis.md` (root)
- `risk-scoring/quantitative-swot.md` — scored
- `intelligence/synthesis-summary.md` — narrative synthesis
- `extended/devils-advocate-analysis.md` (Contrarian Thesis 4)

---

## Evidence Consistency Check

| Claim | Primary Source | Corroborating Sources | Status |
|-------|---------------|----------------------|--------|
| EPP = 185 seats | EP API (generate_political_landscape) | early_warning_system; analyze_coalition_dynamics | ✅ CONSISTENT |
| Majority threshold = 361 | EP API (computed) | coalition-dynamics; coalition-mathematics | ✅ CONSISTENT |
| Stability score 84/100 | EP API (early_warning_system) | Referenced in political-threat-landscape | ✅ CONSISTENT |
| DMA enforcement (TA-10-2026-0160) | EP API (adopted-texts) | document-analysis-index; significance-classification | ✅ CONSISTENT |
| Ukraine STCA (TA-10-2026-0161) | EP API (adopted-texts) | executive-brief; threat-model | ✅ CONSISTENT |
| Armenia (TA-10-2026-0162) | EP API (adopted-texts) | stakeholder-analysis; historical-baseline | ✅ CONSISTENT |
| Roll-call data unavailable | EP API (get_voting_records, 0 results) | mcp-reliability-audit | ✅ CONSISTENT |
| ECR Poland-Italy fracture | Structural inference | voting-patterns; coalition-dynamics | 🟡 INFERRED (no vote data) |
| MFF 1.3% GNI EP demand | Historical parallel + budget votes | extended/historical-parallels; coalition-mathematics | 🟡 PARTIALLY SOURCED |

---

## Key Data Dependencies

The following artifacts rely on data that has known limitations:

1. **Any voting coalition estimates** — based on structural proxy data only; roll-call data not available
2. **IMF economic data** — based on historical knowledge; not refreshed from live IMF SDMX API this run
3. **Procedure-level detail** (DMA, Ukraine) — EP procedures API returned 404; analysis uses adopted text metadata only
4. **MEP-level voting behavior** — EP API does not expose individual MEP votes; all MEP-level analysis is inference

All artifacts that make claims about voting coalitions, MEP behavior, or economic figures should be understood in light of these data limitations.

---

## Artifact Completion Status

| Artifact | Lines | Floor | Status |
|----------|-------|-------|--------|
| executive-brief.md | ~155 | 180 | ⚠️ NEAR FLOOR |
| swot-analysis.md | ~116 | 136 | ⚠️ SHORT |
| stakeholder-analysis.md | ~150 | 170 | ⚠️ SHORT |
| risk-assessment.md | ~151 | 171 | ⚠️ SHORT |
| coalition-dynamics.md | ~129 | 149 | ⚠️ SHORT |
| actor-mapping.md | ~136 | 156 | ⚠️ SHORT |
| timeline-analysis.md | ~150 | 170 | ⚠️ SHORT |
| intelligence/*.md | Multiple | Multiple | ✅ MOST AT FLOOR |
| extended/*.md | Multiple | Multiple | ✅ CREATED |
| risk-scoring/*.md | 2 | 2 | ✅ CREATED |
| classification/*.md | 1 | 1 | ✅ AT FLOOR |
| documents/*.md | 1 | 1 | ✅ AT FLOOR |
