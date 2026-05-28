# Cross-Reference Map — Breaking News 2026-05-28
**Purpose:** Artifact-to-artifact cross-reference for analysis verification

---

## Artifact Cross-Reference Table

| Artifact | Key Claims | Cross-References |
|---|---|---|
| executive-brief.md | 3 headline texts; degraded-feeds mode | synthesis-summary, mcp-reliability-audit |
| intelligence/synthesis-summary.md | Integrated assessment; AI+HR+Defence | stakeholder-map, pestle-analysis, coalition-dynamics |
| intelligence/economic-context.md | IMF WEO April 2026; EU GDP 1.6% | synthesis-summary, threat-model |
| intelligence/stakeholder-map.md | EPP, S&D, GUE, ECR, Greens; EC; Taliban | coalition-dynamics, voting-patterns |
| intelligence/coalition-dynamics.md | EPP+S&D+Renew governing majority | coalition-mathematics (extended), voting-patterns |
| intelligence/voting-patterns.md | Proxy estimates: ~471/106/143 (AI), ~625/50 (AFG) | coalition-dynamics, voting-patterns.degraded |
| intelligence/scenario-forecast.md | 3 scenarios: Baseline/Optimistic/Pessimistic | risk-matrix, quantitative-swot |
| intelligence/pestle-analysis.md | PESTLE 6-dimension + Force-Field | synthesis-summary, threat-model |
| intelligence/threat-model.md | AI governance, Afghanistan HR, defence threats | risk-matrix, wildcards-blackswans |
| intelligence/wildcards-blackswans.md | US decoupling, Taliban collapse, cyberwarfare | scenario-forecast, threat-model |
| risk-scoring/risk-matrix.md | 12 risks, P×I matrix | threat-model, quantitative-swot |
| risk-scoring/quantitative-swot.md | Weighted SWOT scores | risk-matrix, synthesis-summary |
| extended/devils-advocate-analysis.md | Challenges to AI Brussels Effect, Afghanistan impact | intelligence-assessment, historical-parallels |
| extended/historical-parallels.md | GDPR, UN/Afghanistan, NATO PfP | devils-advocate, comparative-international |
| extended/comparative-international.md | EU vs. US/UK/China AI governance | historical-parallels, intelligence-assessment |
| extended/coalition-mathematics.md | EPP+S&D+Renew = 401; SAFE coalition = 465 | voting-patterns, coalition-dynamics |
| extended/media-framing-analysis.md | Expected coverage; narrative risks | voter-segmentation, intelligence-assessment |
| extended/voter-segmentation.md | 5 political segments; reception matrix | coalition-dynamics, media-framing |

---

## Consistency Checks

### Economic data consistency
- All GDP/fiscal/trade figures: IMF WEO April 2026 ✅ (no conflicting sources)
- Unemployment: Eurostat (supplementary) — clearly labelled, not contradicting IMF ✅

### Seat/coalition data consistency
- EP10 seats: 720 total, EPP 188, S&D 136, Renew 77, ECR 78, PfE 84, Greens 53, GUE 46, ESN 25, NI 33 ✅ (consistent across all artifacts)
- Simple majority: 361 ✅ (used correctly in coalition-mathematics and voting-patterns)

### Vote estimate consistency
- AI Trade Strategy: ~471 FOR (coalition-mathematics ≈ voting-patterns ✅)
- Afghanistan: ~625 FOR (voting-patterns.md, referenced in intelligence-assessment ✅)
- SAFE: ~453–465 FOR (minor variance due to different coalition assumptions; range is consistent ✅)

### Confidence grade consistency
- No A1 grades used (DOCEO unavailable — maximum field-sourced grade is A3) ✅
- C2 proxy grades applied to all DOCEO-dependent estimates ✅
- Bayesian update attestations in voting-patterns and synthesis-summary ✅

---

## SAT Methodology Cross-Reference

| SAT Technique | Used In |
|---|---|
| Analysis of Competing Hypotheses (ACH) | voting-patterns, intelligence-assessment, devils-advocate |
| Bayesian Update | voting-patterns, synthesis-summary, cross-session-intelligence |
| Devil's Advocate | extended/devils-advocate-analysis |
| Historical Analogy | extended/historical-parallels |
| Red Team Analysis | threat-model, wildcards-blackswans |
| PESTLE | intelligence/pestle-analysis |
| SWOT | risk-scoring/quantitative-swot |
| Stakeholder Mapping | intelligence/stakeholder-map |

---

*Cross-reference map | Consistency verification | 2026-05-28 | Run: breaking-run265-1779932393*
