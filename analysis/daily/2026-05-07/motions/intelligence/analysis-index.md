<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EP Motions April 28–30, 2026
**Date:** 2026-05-07 | **Article Type:** motions | **Run ID:** motions-run540-1778167043

This file is the master index of all analysis artifacts produced for this run.

## Artifact Map

### Root Level

| File | Description | Lines (approx) | Confidence |
|------|-------------|----------------|------------|
| `executive-brief.md` | BLUF/60-second read — 13 motions, key political signals | ~120 | 🟡 MEDIUM |
| `manifest.json` | Machine-readable artifact manifest | N/A | N/A |

---

### intelligence/ — Core Political Intelligence

| File | Description | Lines (approx) | Confidence |
|------|-------------|----------------|------------|
| `synthesis-summary.md` | 7-finding synthesis, key intelligence output | ~200 | 🟡 MEDIUM |
| `pestle-analysis.md` | Full PESTLE (6 dimensions × multiple motions) | ~300 | 🟡 MEDIUM |
| `stakeholder-map.md` | 9 EP groups + 10 external actors, stakes + positions | ~280 | 🟡 MEDIUM |
| `scenario-forecast.md` | 4-scenario matrix, probability/impact grid | ~220 | 🟡 MEDIUM |
| `historical-baseline.md` | EP term stats, precedents, fragmentation | ~200 | 🟡 MEDIUM |
| `economic-context.md` | Economic stakes per motion — 🔴 IMF unavailable | ~180 | 🔴 LOW |
| `coalition-dynamics.md` | Coalition math, cohesion, fragmentation index | ~175 | 🟡 MEDIUM |
| `wildcards-blackswans.md` | 5 wildcards + 4 black swan scenarios | ~210 | 🟡 LOW-MEDIUM |
| `mcp-reliability-audit.md` | MCP tool status, data quality, mitigations | ~140 | 🔴 HIGH |

---

### classification/ — Significance & Actor Analysis

| File | Description | Lines (approx) | Confidence |
|------|-------------|----------------|------------|
| `significance-classification.md` | 5-dimension scoring per motion; Tier 1-5 rankings | ~170 | 🟡 MEDIUM |
| `actor-mapping.md` | 5-layer actor map (EP, EU, member state, external, non-state) | ~185 | 🟡 MEDIUM |
| `forces-analysis.md` | Porter's Five Forces (political adaptation) | ~190 | 🟡 MEDIUM |
| `impact-matrix.md` | Breadth/depth/duration/reversibility per motion | ~200 | 🟡 MEDIUM |

---

### risk-scoring/ — Risk Quantification

| File | Description | Lines (approx) | Confidence |
|------|-------------|----------------|------------|
| `risk-matrix.md` | 14-risk register; ISO 31000 scoring; heat map | ~200 | 🟡 MEDIUM |
| `quantitative-swot.md` | Magnitude × Certainty per SWOT factor; strategic score -12 | ~185 | 🟡 MEDIUM |
| `political-capital-risk.md` | Coalition/Electoral/Institutional/International capitals per actor | ~175 | 🟡 MEDIUM |
| `legislative-velocity-risk.md` | Timeline risk for 5 legislative follow-on outcomes | ~165 | 🟡 MEDIUM |

---

### threat-assessment/ — Political Threat Analysis

| File | Description | Lines (approx) | Confidence |
|------|-------------|----------------|------------|
| `political-threat-landscape.md` | 6-dimension threat framework; PfE kill chain analysis | ~250 | 🟡 MEDIUM |
| `actor-threat-profiles.md` | 6 actor profiles (ICO model); threat priority table | ~210 | 🟡 MEDIUM |
| `consequence-trees.md` | 4 consequence trees (DMA, livestock, PfE debate, Ukraine) | ~195 | 🟡 MEDIUM |
| `legislative-disruption.md` | 3 disruption types; disruption matrix; monitoring schedule | ~155 | 🟡 MEDIUM |

---

### existing/ — Mirror Artifacts

| File | Source | Notes |
|------|--------|-------|
| `synthesis-summary.md` | Mirror of intelligence/synthesis-summary.md | Identical copy |
| `stakeholder-map.md` | Mirror of intelligence/stakeholder-map.md | Identical copy |

---

### data/

| File | Description | Source |
|------|-------------|--------|
| `political-landscape.json` | Full EP10 political landscape API response | EP MCP API, 2026-05-07 |

---

### cache/imf/

| File | Description |
|------|-------------|
| `probe-summary.json` | IMF API probe result: `{"available": false}` — proxy timeout |

---

### runs/

| File | Description |
|------|-------------|
| `workflow-audit.md` | Run parameters, stage timeline, compliance checks |
| `methodology-reflection.md` | Final artifact — methodological self-assessment (to be written) |

---

## Coverage Assessment

| Policy Domain | Artifacts Covering It | Coverage Rating |
|---------------|-----------------------|-----------------|
| DMA/Digital governance | PESTLE, stakeholder-map, significance-classification, threat-landscape, consequence-trees, legislative-disruption, wildcards, forces-analysis | 🔴 HIGH |
| Agricultural policy (livestock) | PESTLE, stakeholder-map, significance-classification, impact-matrix, risk-matrix, political-capital, wildcards | 🔴 HIGH |
| Ukraine accountability | PESTLE, stakeholder-map, significance-classification, consequence-trees, actor-threat-profiles, risk-matrix | 🔴 HIGH |
| EU Budget | PESTLE, economic-context, significance-classification, legislative-velocity-risk | 🟡 MEDIUM |
| EIB oversight | PESTLE, significance-classification, actor-mapping | 🟢 LOW |
| Haiti/trafficking | PESTLE, significance-classification, impact-matrix | 🟢 LOW |
| Coalition dynamics | coalition-dynamics, forces-analysis, political-capital, quantitative-swot | 🔴 HIGH |

---

## Key Analytical Findings Cross-Reference

| Finding | Primary Artifact | Supporting Artifacts |
|---------|-----------------|---------------------|
| DMA enforcement = EP10's most significant motion | significance-classification (Tier 1, score 22) | impact-matrix, legislative-disruption, threat-landscape |
| Agricultural coalition is EP10's most durable | coalition-dynamics (structural) | forces-analysis, quantitative-swot, risk-matrix |
| EU climate target miss risk is HIGH | risk-matrix (R-01, score 20) | quantitative-swot, wildcards, PESTLE |
| Hungary's veto is the decisive obstruction | actor-threat-profiles (ICO 125 Council) | consequence-trees, legislative-velocity-risk |
| PfE's Stage 4-5 institutional kill chain | political-threat-landscape | actor-threat-profiles, wildcards |

---

## Minimum Line Floor Compliance Status

**Note:** Formal validation via `npm run validate-analysis` at Stage C. Pre-Stage-C agent estimate:

| Artifact | Estimated Lines | Floor (per reference-quality-thresholds.json) | Status |
|----------|----------------|----------------------------------------------|--------|
| executive-brief.md | ~120 | 50 | ✅ |
| synthesis-summary.md | ~200 | 100 | ✅ |
| pestle-analysis.md | ~300 | 150 | ✅ |
| stakeholder-map.md | ~280 | 100 | ✅ |
| scenario-forecast.md | ~220 | 100 | ✅ |
| risk-matrix.md | ~200 | 100 | ✅ |
| quantitative-swot.md | ~185 | 100 | ✅ |

**Pre-check assessment: All major artifacts appear to exceed minimum line floors.**

---

## Sources

1. All artifacts in this run (above)
2. `analysis/methodologies/artifact-catalog.md` (artifact registry)
3. `analysis/methodologies/reference-quality-thresholds.json` (line floors)


```mermaid
graph LR
    A[EP Parliament] --> B[Analysis]
    B --> C[Policy]
```
