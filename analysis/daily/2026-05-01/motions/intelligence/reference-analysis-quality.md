<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Reference Analysis Quality — EP Motions, 2026-05-01

**Admiralty Code:** A1 (Reliable source / Confirmed)
**WEP Assessment:** HIGH confidence

---

## Quality Assessment Against Reference Standards

This artifact documents how this analysis run compares to the reference quality thresholds defined in `analysis/methodologies/reference-quality-thresholds.json`.

### Artifact Line Count vs. Reference Floors

| Artifact | Actual Lines | Reference Floor | Status |
|----------|:-----------:|:---------------:|:------:|
| executive-brief.md | 70 | 180 | 🔴 SHORT |
| significance-classification.md | 145 | 120 | ✅ OK |
| actor-mapping.md | 102 | 80 | ✅ OK |
| forces-analysis.md | 119 | 100 | ✅ OK |
| impact-matrix.md | 122 | 100 | ✅ OK |
| political-threat-landscape.md | 139 | 120 | ✅ OK |
| actor-threat-profiles.md | 129 | 100 | ✅ OK |
| consequence-trees.md | 129 | 100 | ✅ OK |
| legislative-disruption.md | 125 | 100 | ✅ OK |
| risk-matrix.md | 126 | 100 | ✅ OK |
| quantitative-swot.md | 116 | 100 | ✅ OK |
| political-capital-risk.md | 120 | 100 | ✅ OK |
| legislative-velocity-risk.md | 123 | 100 | ✅ OK |
| pestle-analysis.md | 104 | 180 | 🔴 SHORT |
| stakeholder-map.md | 152 | 200 | 🟡 SHORT (−48) |
| scenario-forecast.md | 141 | 180 | 🟡 SHORT (−39) |
| economic-context.md | 79 | 120 | 🔴 SHORT (IMF unavailable) |
| coalition-dynamics.md | 134 | 100 | ✅ OK |
| synthesis-summary.md | 101 | 160 | 🔴 SHORT |
| mcp-reliability-audit.md | 110 | 200 | 🔴 SHORT |
| methodology-reflection.md | 110 | 200 | 🔴 SHORT |
| stakeholder-impact.md | 98 | 80 | ✅ OK |
| voting-patterns.md | 151 | 120 | ✅ OK |

### Quality Notes

1. **executive-brief.md short** (70/180): First artifact created; truncated due to session compaction during Pass 1. Extending in Pass 3 is recommended but time-constrained.

2. **economic-context.md short** (79/120): IMF data unavailable. This artifact is intentionally limited — fabricating economic data would violate the IMF degraded-mode rule. 🔴 flag appropriately placed.

3. **Mermaid diagrams**: Several artifacts are missing Mermaid diagrams per validator requirements. Existing Mermaid diagrams present in: actor-mapping.md, forces-analysis.md, consequence-trees.md, political-threat-landscape.md, legislative-velocity-risk.md, voting-patterns.md, threat-model.md.

4. **Pass 2 confirmation**: All 6 Pass 2 reviews confirmed substantive content; no placeholder text remaining.

### Overall Quality Score

**Completeness:** 15 of 23 artifacts meet line floors (65%)
**Coverage:** All mandatory artifacts present including stakeholder-map (motions-mandatory), stakeholder-impact (motions-mandatory), impact-matrix (motions-mandatory)
**Evidence quality:** 🟡 MEDIUM-HIGH — structural analysis strong; content-specific limited by data gaps

**Quality gate assessment:** ANALYSIS_ONLY is the appropriate gate result given data limitations, time constraints, and several artifacts below floor. The article renderer should be invoked with degraded-mode flag.
