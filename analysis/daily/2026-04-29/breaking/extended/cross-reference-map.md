<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Reference Map — EU Parliament April 28, 2026

**Classification:** PUBLIC | **Confidence:** 🟢 HIGH
**Date:** 2026-04-29 | **Article Type:** breaking

---

## Purpose

This artifact maps the cross-references and interdependencies between all analysis artifacts produced for the April 28, 2026 EP breaking news run. It serves as a navigation guide for readers and as a coherence check for the analysis set.

---

## Artifact Cross-Reference Index

### Primary Narrative Documents

| Artifact | Key Themes | Cross-References |
|----------|-----------|-----------------|
| `intelligence/synthesis-summary.md` | Strategic overview, MFF analysis, immunity pattern, coalition overview | → scenario-forecast, stakeholder-map, coalition-dynamics, historical-baseline |
| `executive-brief.md` | Top-level executive summary with WEP judgments | → synthesis-summary, scenario-forecast, significance-scoring |
| `intelligence/scenario-forecast.md` | Six scenarios with WEP probabilities | → coalition-dynamics, economic-context, wildcards-blackswans |

### Classification Documents

| Artifact | Key Themes | Cross-References |
|----------|-----------|-----------------|
| `classification/significance-classification.md` | Event significance scoring | → impact-matrix, actor-mapping |
| `classification/impact-matrix.md` | Stakeholder impact, cascade analysis, Heat Map | → forces-analysis, actor-mapping, consequence-trees |
| `classification/forces-analysis.md` | Driving/restraining forces, force field balance | → actor-mapping, political-capital-risk, coalition-mathematics |
| `classification/actor-mapping.md` | Actor roster, influence network, alliance matrix | → stakeholder-map, coalition-dynamics, political-capital-risk |

### Risk Documents

| Artifact | Key Themes | Cross-References |
|----------|-----------|-----------------|
| `risk-scoring/risk-matrix.md` | Risk register, risk heat map | → threat-model, political-capital-risk |
| `risk-scoring/quantitative-swot.md` | Quantified SWOT analysis | → forces-analysis, scenario-forecast |
| `risk-scoring/political-capital-risk.md` | Capital flows per actor, risk exposures | → actor-mapping, stakeholder-map |
| `risk-scoring/legislative-velocity-risk.md` | Pipeline velocity, bottleneck analysis | → consequence-trees, forward-indicators |

### Intelligence Documents

| Artifact | Key Themes | Cross-References |
|----------|-----------|-----------------|
| `intelligence/coalition-dynamics.md` | Coalition analysis, fragmentation index | → actor-mapping, coalition-mathematics |
| `intelligence/economic-context.md` | IMF economic data, fiscal context | → scenario-forecast (Scenario 5), legislative-velocity-risk |
| `intelligence/historical-baseline.md` | Historical EP patterns, comparative | → historical-parallels |
| `intelligence/mcp-reliability-audit.md` | Data quality assessment | → document-analysis-index |
| `intelligence/pestle-analysis.md` | PESTLE framework analysis | → economic-context, threat-model |
| `intelligence/political-threat-landscape.md` | Threat actors, threat landscape | → actor-threat-profiles |
| `intelligence/scenario-forecast.md` | Scenario tree | → consequence-trees |
| `intelligence/significance-scoring.md` | Significance metrics | → significance-classification |
| `intelligence/stakeholder-map.md` | Stakeholder profiles | → actor-mapping |
| `intelligence/synthesis-summary.md` | Main intelligence synthesis | → all artifacts |
| `intelligence/threat-model.md` | Threat model | → actor-threat-profiles, consequence-trees |
| `intelligence/voting-patterns.md` | Voting analysis | → coalition-dynamics, coalition-mathematics |
| `intelligence/wildcards-blackswans.md` | Black swan scenarios | → scenario-forecast |
| `intelligence/workflow-audit.md` | Workflow process audit | → mcp-reliability-audit |
| `intelligence/cross-run-diff.md` | Diff with prior runs | → cross-session-intelligence |
| `intelligence/cross-session-intelligence.md` | Cross-session patterns | → historical-baseline |
| `intelligence/reference-analysis-quality.md` | Quality assessment | → mcp-reliability-audit |
| `intelligence/methodology-reflection.md` | SAT documentation | → all analytical artifacts |
| `intelligence/analysis-index.md` | Index of all intelligence artifacts | → all intelligence artifacts |

### Threat Assessment Documents

| Artifact | Key Themes | Cross-References |
|----------|-----------|-----------------|
| `threat-assessment/actor-threat-profiles.md` | Threat actor profiles | → political-threat-landscape, consequence-trees |
| `threat-assessment/legislative-disruption.md` | Disruption vectors | → legislative-velocity-risk, consequence-trees |
| `threat-assessment/consequence-trees.md` | Decision trees, branching outcomes | → scenario-forecast, forward-indicators |

### Extended Analysis Documents

| Artifact | Key Themes | Cross-References |
|----------|-----------|-----------------|
| `extended/intelligence-assessment.md` | Key judgments, strategic overview | → synthesis-summary, scenario-forecast |
| `extended/devils-advocate-analysis.md` | Counter-hypotheses | → synthesis-summary, scenario-forecast |
| `extended/historical-parallels.md` | Prior cycle comparisons | → historical-baseline, scenario-forecast |
| `extended/comparative-international.md` | International benchmarking | → historical-parallels |
| `extended/forward-indicators.md` | Monitoring indicators | → consequence-trees, scenario-forecast |
| `extended/coalition-mathematics.md` | Quantitative coalition analysis | → coalition-dynamics, actor-mapping |
| `extended/media-framing-analysis.md` | Narrative analysis | → political-threat-landscape |
| `extended/voter-segmentation.md` | Voter segment analysis | → stakeholder-map, political-capital-risk |
| `extended/implementation-feasibility.md` | Implementation assessment | → legislative-velocity-risk |
| `extended/data-download-manifest.md` | Data provenance | → mcp-reliability-audit |

### Data Documents

| Artifact | Key Themes | Cross-References |
|----------|-----------|-----------------|
| `documents/document-analysis-index.md` | Document analysis | → data/adopted-texts-*.json |
| `data/adopted-texts-2026-04-28.json` | Raw EP data | → document-analysis-index |
| `data/political-landscape.json` | Raw political data | → coalition-dynamics, actor-mapping |

---

## Key Analytical Threads

### Thread A: MFF Budget Architecture
`synthesis-summary.md` → `scenario-forecast.md (Scenarios 1, 2, 5)` → `economic-context.md` → `coalition-mathematics.md` → `legislative-velocity-risk.md` → `consequence-trees.md (Tree 1)` → `forward-indicators.md (Domain 1)` → `historical-parallels.md (Parallel 1)`

### Thread B: Immunity Accountability
`synthesis-summary.md` → `stakeholder-map.md (ECR/affected MEPs)` → `actor-threat-profiles.md (Profiles 2, 4)` → `political-capital-risk.md` → `legislative-disruption.md (Vector 2)` → `consequence-trees.md (Tree 2)` → `forward-indicators.md (Domain 2)` → `historical-parallels.md (Parallel 2)`

### Thread C: Gender Rights Legislation
`synthesis-summary.md` → `scenario-forecast.md (Scenario 4)` → `legislative-velocity-risk.md (Domain 3)` → `legislative-disruption.md (Vector 3)` → `consequence-trees.md (Tree 3)` → `forward-indicators.md (Domain 3)` → `historical-parallels.md (Parallel 3)` → `comparative-international.md (Dimension 3)`

---

## Confidence Coherence Check

All artifacts have been reviewed for internal consistency:
- ✅ WEP probability bands are consistent across artifacts (±5pp tolerance)
- ✅ Key actors appear consistently across actor-mapping, stakeholder-map, actor-threat-profiles
- ✅ Scenario probabilities in scenario-forecast align with consequence-tree branches
- ✅ IMF economic data appears consistently in economic-context and legislative-velocity-risk
- ✅ Coalition seat counts consistent across coalition-dynamics, coalition-mathematics, actor-mapping

---

*EU Parliament Monitor | Cross-Reference Map | 2026-04-29*
