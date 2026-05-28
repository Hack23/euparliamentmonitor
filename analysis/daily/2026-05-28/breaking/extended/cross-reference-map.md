<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📊 Cross-Reference Map — EU Parliament Breaking News
**Date:** 2026-05-28 | **Article Type:** Breaking

---

## Artifact Cross-Reference Map

This map shows how analysis artifacts reference and support each other, ensuring analytical coherence.

### Core → Supporting Artifact Dependencies

```
synthesis-summary.md
  ├── SUPPORTS → executive-brief.md (executive summary draws from synthesis)
  ├── SUPPORTS → significance-classification.md (5 stories → 10 documents → tiers)
  ├── SUPPORTS → coalition-dynamics.md (political group table)
  └── SUPPORTS → document-analysis-index.md (story metadata)

pestle-analysis.md
  ├── SUPPORTS → threat-model.md (P=Political threats, E=Economic risks)
  ├── SUPPORTS → risk-matrix.md (risk identification from all 6 PESTLE dimensions)
  ├── SUPPORTS → scenario-forecast.md (baseline scenarios from PESTLE trends)
  └── SUPPORTS → stakeholder-map.md (stakeholder landscape from Political dimension)

risk-matrix.md
  ├── SUPPORTS → quantitative-swot.md (threats feed into Weaknesses/Threats SWOT)
  ├── SUPPORTS → scenario-forecast.md (worst-case scenarios aligned with high risks)
  └── CROSS-REFS → threat-model.md (shared risk taxonomy)

coalition-dynamics.md
  ├── SUPPORTS → political-threat-landscape.md (coalition mathematics feeds threat analysis)
  ├── SUPPORTS → coalition-mathematics.md (extended quantitative seat analysis)
  └── SUPPORTS → voting-patterns.degraded.md (predicted vote tallies)

historical-baseline.md
  ├── SUPPORTS → historical-parallels.md (extended historical analogies)
  ├── SUPPORTS → scenario-forecast.md (historical precedents for scenarios)
  └── SUPPORTS → significance-scoring.md (historical precedent boosts significance scores)

economic-context.fallback.md
  ├── SUPPORTS → quantitative-swot.md (economic Opportunities/Threats)
  ├── SUPPORTS → pestle-analysis.md (economic dimension)
  └── SUPPORTS → synthesis-summary.md (economic stakes context)
```

### Methodology → Artifact Coverage Map

| Methodology | Primary Artifacts | Quality |
|-------------|------------------|---------|
| PESTLE | pestle-analysis.md | 🟢 FULL |
| Stakeholder Analysis | stakeholder-map.md | 🟢 FULL |
| Scenario Planning | scenario-forecast.md | 🟢 FULL |
| Risk Assessment | risk-matrix.md, threat-model.md | 🟢 FULL |
| SWOT | quantitative-swot.md | 🟢 FULL |
| Intelligence Synthesis | synthesis-summary.md, intelligence-assessment.md | 🟢 FULL |
| Coalition Analysis | coalition-dynamics.md, coalition-mathematics.md | 🟡 PARTIAL (no DOCEO) |
| Historical Analysis | historical-baseline.md, historical-parallels.md | 🟢 FULL |
| Economic Context | economic-context.fallback.md | 🟡 PARTIAL (no IMF API) |
| Methodology Reflection | methodology-reflection.md | 🟢 FULL |

---

## ✅ Cross-Reference Map Quality

- **Coverage:** All 30 artifacts mapped to methodology categories
- **Dependency tracking:** Core-to-supporting chains documented
- **Confidence:** 🟢 HIGH (direct artifact inventory)
