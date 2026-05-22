<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Reference Map — EP Breaking News | 2026-05-22

**SATs:** Key Assumptions Check, Quality of Information Check
**Classification:** PUBLIC | **Data Mode:** degraded-feeds | **Confidence:** 🟡 MEDIUM

---

## Overview

This artifact maps the cross-references between all analysis artifacts in this run, identifying how findings in one artifact inform and constrain findings in others. It serves as the analytical coherence audit for the complete artifact set.

---

## Artifact Dependency Map

### Tier 1: Primary Evidence Sources
All artifacts in this run depend ultimately on EP adopted texts from the May 19-22, 2026 Strasbourg plenary:

- **TA-10-2026-0183** (AI trade strategy) → Core reference for: executive-brief.md, intelligence/synthesis-summary.md, intelligence/coalition-dynamics.md, extended/devils-advocate-analysis.md, extended/coalition-mathematics.md, extended/comparative-international.md, intelligence/economic-context.md
- **TA-10-2026-0174** (Uzbekistan EPCA) → Core reference for: executive-brief.md, intelligence/historical-baseline.md, extended/historical-parallels.md, extended/comparative-international.md, extended/voter-segmentation.md
- **Fisheries protocols** (São Tomé, Cook Islands) → Core reference for: documents/document-analysis-index.md, intelligence/significance-scoring.md, extended/implementation-feasibility.md
- **EU-Lebanon/Eurojust** → Core reference for: documents/document-analysis-index.md, extended/implementation-feasibility.md
- **Immunity waivers** → Core reference for: intelligence/procedures-proxy.md, classification/significance-classification.md

---

## Cross-Reference Matrix: Key Finding Consistencies

| Finding | Supporting Artifacts | Contradicting Artifacts | Net Confidence |
|---------|--------------------|-----------------------|----------------|
| AI resolution is legislative first | synthesis-summary, executive-brief, intelligence-assessment | devils-advocate-analysis (performativity challenge) | 🟢 HIGH |
| Commission follow-through likely | forward-indicators (Scenario A) | devils-advocate-analysis, implementation-feasibility | 🟡 MEDIUM |
| Broad EP majority for AI trade resolution | coalition-dynamics, coalition-mathematics | devils-advocate-analysis (Challenge 4) | 🟡 MEDIUM |
| EPCA conditionality unlikely to be enforced | historical-baseline, comparative-international | — | 🟢 HIGH for enforcement gap |
| Fisheries protocols will implement | implementation-feasibility, significance-scoring | — | 🟢 HIGH |
| Data mode degradation limits analysis quality | data-availability-assessment, mcp-reliability-audit | — | 🟢 HIGH |

---

## Artifact-to-Article Citation Map

Per the read-before-article contract (`.github/prompts/05-analysis-to-article-contract.md`), the rendered article must cite these artifacts per section:

| Article Section | Primary Artifacts | Secondary Artifacts |
|----------------|-----------------|-------------------|
| BLUF/Introduction | executive-brief.md | intelligence/synthesis-summary.md |
| AI trade significance | intelligence/synthesis-summary.md §Finding 1 | intelligence/economic-context.md |
| Coalition analysis | intelligence/coalition-dynamics.md | extended/coalition-mathematics.md |
| Geopolitical context | intelligence/historical-baseline.md | extended/comparative-international.md |
| Scenario forecast | intelligence/scenario-forecast.md | extended/forward-indicators.md |
| Risk assessment | risk-scoring/risk-matrix.md | intelligence/wildcards-blackswans.md |
| Implementation | extended/implementation-feasibility.md | intelligence/procedures-proxy.md |

---

## Quality Coherence Checks

### Consistency Audit:
1. **Economic figures:** intelligence/economic-context.md uses knowledge-base estimates (degraded-imf mode). All other artifacts referencing economic data should carry same 🟡 MEDIUM confidence flag. ✅ Verified consistent.
2. **Coalition vote estimates:** coalition-dynamics.md and coalition-mathematics.md both use C3 Admiralty grade with explicit degraded-voting disclaimer. ✅ Consistent.
3. **EPCA conditionality assessment:** historical-baseline.md, comparative-international.md, implementation-feasibility.md all consistently assess conditionality enforcement as LOW feasibility. ✅ Consistent.
4. **WEP bands:** executive-brief.md uses "Likely (>55%)" as headline WEP; synthesis-summary.md uses same band. scenario-forecast.md provides differentiated WEP by scenario. ✅ Consistent.

### Known Incoherencies (flagged for Pass 2 review):
- intelligence/mcp-reliability-audit.md may contain run-specific data that conflicts with static analysis artifacts (by design — documents actual run behaviour)
- extended/devils-advocate-analysis.md intentionally contradicts dominant narrative artifacts (structural feature, not incoherence)
- extended/voter-segmentation.md uses population share estimates that are approximate and not sourced to specific demographic surveys (knowledge base only)

---

## Artifact Completeness Summary

| Category | Artifacts Expected | Artifacts Produced | Status |
|---------|------------------|------------------|--------|
| Core intelligence | 15 | 15 | ✅ Complete |
| Risk scoring | 2 | 2 | ✅ Complete |
| Classification | 3 | 3 | ✅ Complete |
| Documents | 1 | 1 | ✅ Complete |
| Extended analysis | 12 | 12 | ✅ Complete (this run) |
| Data availability | 1 | 1 | ✅ Complete |
| Voting patterns | 2 (standard + degraded) | 2 | ✅ Complete |
| **Total** | **38+** | **38+** | ✅ |
