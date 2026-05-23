<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Breaking News — 2026-04-28

**Run:** breaking-run1777360024 | **Date:** 2026-04-28 | **Session:** Strasbourg April 27-30, 2026

---

## Overview

This index maps all analysis artifacts produced in this run, their status, line counts, and cross-references. Use this as the navigation map for the full analysis package.

---

## 1. Artifact Status Inventory

### Intelligence Artifacts (`intelligence/`)

| Artifact | Status | Lines | Floor | Mermaid | Confidence |
|---------|--------|-------|-------|---------|------------|
| political-dynamics.md | UPDATED | 92 | 80 | No | MEDIUM |
| voting-patterns.md | UPDATED | 106 | 150 | Needed | LOW |
| swot-analysis.md | UPDATED | 83 | 80 | No | MEDIUM |
| stakeholder-analysis.md | PRESENT | 116 | 80 | No | MEDIUM |
| coalition-dynamics.md | UPDATED | 110 | 135 | No | MEDIUM |
| mcp-reliability-audit.md | PRESENT | 347 | 385 | No | HIGH |
| legislative-timeline.md | PRESENT | 70 | 60 | No | MEDIUM |
| geopolitical-risk.md | PRESENT | 95 | 80 | No | HIGH |
| procedure-tracker.md | PRESENT | 68 | 60 | No | MEDIUM |
| synthesis-summary.md | TO CREATE | - | 205 | Required | - |
| stakeholder-map.md | TO CREATE | - | 305 | No | - |
| scenario-forecast.md | TO CREATE | - | 280 | No | - |
| pestle-analysis.md | TO CREATE | - | 250 | No | - |
| threat-model.md | TO CREATE | - | 250 | Required | - |
| economic-context.md | TO CREATE | - | 185 | No | - |
| wildcards-blackswans.md | TO CREATE | - | 275 | No | - |
| workflow-audit.md | TO CREATE | - | 100 | No | - |
| methodology-reflection.md | TO CREATE | - | 220 | No | - |
| historical-baseline.md | TO CREATE | - | 190 | No | - |
| political-threat-landscape.md | TO CREATE | - | 90 | No | - |
| significance-scoring.md | TO CREATE | - | 105 | No | - |
| cross-run-diff.md | TO CREATE | - | 100 | No | - |
| cross-session-intelligence.md | TO CREATE | - | 150 | No | - |
| reference-analysis-quality.md | TO CREATE | - | 190 | No | - |
| analysis-index.md | THIS FILE | - | 160 | No | - |

### Classification Artifacts (`classification/`)

| Artifact | Status | Lines | Floor | Mermaid | Confidence |
|---------|--------|-------|-------|---------|------------|
| document-classification.md | PRESENT | 95 | 80 | No | MEDIUM |
| significance-classification.md | CREATED | 120+ | 105 | No | HIGH |
| actor-mapping.md | CREATED | 150+ | 80 | Required | HIGH |
| forces-analysis.md | CREATED | 150+ | 80 | Required | HIGH |
| impact-matrix.md | CREATED | 150+ | 80 | Required | HIGH |

### Risk Scoring Artifacts (`risk-scoring/`)

| Artifact | Status | Lines | Floor | Mermaid | Confidence |
|---------|--------|-------|-------|---------|------------|
| risk-register.md | PRESENT | 67 | 60 | No | MEDIUM |
| risk-matrix.md | TO CREATE | - | 150 | No | - |
| quantitative-swot.md | TO CREATE | - | 140 | No | - |
| political-capital-risk.md | TO CREATE | - | 80 | Required | - |
| legislative-velocity-risk.md | TO CREATE | - | 80 | Required | - |

### Threat Assessment Artifacts (`threat-assessment/`)

| Artifact | Status | Lines | Floor | Mermaid | Confidence |
|---------|--------|-------|-------|---------|------------|
| political-threat-assessment.md | PRESENT | 113 | 80 | No | HIGH |
| actor-threat-profiles.md | TO CREATE | - | 80 | Required | - |
| consequence-trees.md | TO CREATE | - | 80 | Required | - |
| legislative-disruption.md | TO CREATE | - | 80 | Required | - |

### Extended Artifacts (`extended/`)

| Artifact | Status | Floor |
|---------|--------|-------|
| coalition-mathematics.md | TO CREATE | 200 |
| comparative-international.md | TO CREATE | 200 |
| cross-reference-map.md | TO CREATE | 150 |
| data-download-manifest.md | TO CREATE | 160 |
| devils-advocate-analysis.md | TO CREATE | 250 |
| forward-indicators.md | TO CREATE | 180 |
| historical-parallels.md | TO CREATE | 220 |
| implementation-feasibility.md | TO CREATE | 200 |
| intelligence-assessment.md | TO CREATE | 220 |
| media-framing-analysis.md | TO CREATE | 180 |
| voter-segmentation.md | TO CREATE | 200 |

---

## 2. Run Metadata

- **Run ID:** breaking-run1777360024
- **Run Date:** 2026-04-28
- **Article Type:** breaking
- **Analysis Dir:** analysis/daily/2026-04-28/breaking/
- **Prior Run:** breaking-run1777336869 (ANALYSIS_ONLY, 13 artifacts)
- **This Run Target:** Complete all required artifacts (35+ total)
- **Gate Target:** GREEN (all floors met, all required artifacts present)

---

## 3. Data Provenance Summary

| Tool Invoked | Result | Items |
|-------------|--------|-------|
| get_adopted_texts_feed | SUCCESS | 18 texts |
| get_adopted_texts (2026) | SUCCESS | 21 texts |
| get_plenary_sessions (Apr 2026) | PARTIAL | 0 (data lag) |
| get_voting_records | EMPTY | 0 (EP delay) |
| generate_political_landscape | SUCCESS | 719 MEPs |
| early_warning_system | SUCCESS | 3 warnings |
| analyze_coalition_dynamics | SUCCESS (partial) | 9 groups |
| compare_political_groups | PARTIAL | Size only |

---

## 4. Cross-Reference Architecture

```
executive-brief.md
    |-- intelligence/synthesis-summary.md [top-level assessment]
    |   |-- intelligence/political-dynamics.md
    |   |-- intelligence/coalition-dynamics.md
    |   |-- intelligence/voting-patterns.md
    |   |-- intelligence/scenario-forecast.md
    |   |-- intelligence/stakeholder-map.md
    |-- intelligence/geopolitical-risk.md
    |-- intelligence/economic-context.md
    |-- intelligence/pestle-analysis.md
    |-- classification/significance-classification.md
    |   |-- classification/impact-matrix.md
    |   |-- classification/actor-mapping.md
    |   |-- classification/forces-analysis.md
    |-- risk-scoring/risk-matrix.md
    |   |-- risk-scoring/quantitative-swot.md
    |   |-- risk-scoring/political-capital-risk.md
    |   |-- risk-scoring/legislative-velocity-risk.md
    |-- threat-assessment/political-threat-assessment.md
    |   |-- threat-assessment/actor-threat-profiles.md
    |   |-- threat-assessment/consequence-trees.md
    |   |-- threat-assessment/legislative-disruption.md
    |-- documents/document-analysis-index.md
    |-- extended/[extended analysis suite]
    |-- intelligence/methodology-reflection.md [meta-analysis]
```

---

## 5. Quality Assurance Checklist

- [ ] All Tier-1 artifacts at or above floor thresholds
- [ ] WEP bands on all probability-bearing artifacts
- [ ] Admiralty grades on external source citations
- [ ] Mermaid diagrams on all required artifacts
- [ ] No placeholder text remaining
- [ ] Cross-references verified
- [ ] Economic context with IMF data for policy articles
- [ ] SAT documentation in methodology-reflection.md

**Last Updated:** 2026-04-28T07:09 UTC
