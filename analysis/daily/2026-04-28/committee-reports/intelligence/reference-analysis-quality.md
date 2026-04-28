<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Reference Analysis Quality — EP Committee Reports | 28 April 2026

**Purpose:** Assess quality of analysis artifacts produced in this run against established reference benchmarks. Identifies artifacts that meet quality floors and those requiring Pass 2 attention.

## Quality Assessment Framework

Quality is evaluated against three dimensions:
1. **Quantitative:** Line count vs. `reference-quality-thresholds.json` floor
2. **Qualitative:** Evidence citations, confidence labels, Mermaid diagrams, structural requirements
3. **Coverage:** Are all required topics addressed? Are gaps documented?

---

## Artifact Quality Inventory

### executive-brief.md
**Floor:** 180 lines | **Current:** ~100 lines | **Status:** 🔴 BELOW FLOOR  
**Issues:** Needs expansion of key judgement section, additional evidence citations, expanded risk table.  
**Pass 2 priority:** HIGH

### intelligence/analysis-index.md
**Floor:** 100 lines | **Current:** ~110 lines | **Status:** 🟢 AT FLOOR  
**Issues:** None critical. Pass 2 should add final artifact status after all Pass 1 artifacts written.  
**Pass 2 priority:** LOW

### intelligence/synthesis-summary.md
**Floor:** 160 lines | **Current:** ~120 lines | **Status:** 🔴 BELOW FLOOR  
**Issues:** Scenario probabilities need more detailed justification; forward signals section is brief.  
**Pass 2 priority:** HIGH

### intelligence/historical-baseline.md
**Floor:** 140 lines | **Current:** ~120 lines | **Status:** 🟡 APPROACHING FLOOR  
**Issues:** EP term comparisons could include specific turnover data and committee evolution arcs. Needs a few more EP10 vs. EP9 comparison data points.  
**Pass 2 priority:** MEDIUM

### intelligence/economic-context.md
**Floor:** 160 lines | **Current:** ~130 lines | **Status:** 🔴 BELOW FLOOR  
**Issues:** IMF data not retrieved live. US tariff impact quantification needed. ECB section thin.  
**Pass 2 priority:** HIGH — economic context is mandatory for committee-reports article type with macroeconomic dimension.

### intelligence/pestle-analysis.md
**Floor:** 180 lines | **Current:** ~190 lines | **Status:** 🟢 ABOVE FLOOR  
**Issues:** None critical. Most comprehensive artifact in this run.  
**Pass 2 priority:** LOW

### intelligence/stakeholder-map.md
**Floor:** 200 lines | **Current:** ~180 lines | **Status:** 🟡 APPROACHING FLOOR  
**Issues:** Actor threat profiles in stakeholder sections are solid. Information environment section could be expanded.  
**Pass 2 priority:** MEDIUM

### intelligence/scenario-forecast.md
**Floor:** 180 lines | **Current:** ~155 lines | **Status:** 🔴 BELOW FLOOR  
**Issues:** Scenarios are solid but need more historical precedent evidence; quantitative assessment table needs more granular impact metrics.  
**Pass 2 priority:** HIGH

### intelligence/threat-model.md
**Floor:** 160 lines | **Current:** ~175 lines | **Status:** 🟢 AT/ABOVE FLOOR  
**Issues:** Good coverage across 5 dimensions. Threat matrix summary is well-structured.  
**Pass 2 priority:** LOW

### intelligence/wildcards-blackswans.md
**Floor:** 180 lines | **Current:** ~175 lines | **Status:** 🟡 APPROACHING FLOOR  
**Issues:** Black swan analysis at floor. Compound event section is valuable.  
**Pass 2 priority:** LOW

### intelligence/mcp-reliability-audit.md
**Floor:** 200 lines | **Current:** ~175 lines | **Status:** 🟡 APPROACHING FLOOR  
**Issues:** All tool audits complete. IMF probe section flagged. Could add more detail on alternative data strategies.  
**Pass 2 priority:** LOW

### classification/impact-matrix.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + source diversity + 6 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### classification/forces-analysis.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + 6 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### classification/actor-mapping.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + source diversity + 6 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### risk-scoring/risk-matrix.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines  
**Pass 2 priority:** REQUIRED before Stage C

### risk-scoring/quantitative-swot.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines  
**Pass 2 priority:** REQUIRED before Stage C

### risk-scoring/political-capital-risk.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + source diversity + 7 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### risk-scoring/legislative-velocity-risk.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + source diversity + 6 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### threat-assessment/actor-threat-profiles.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + source diversity + 6 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### threat-assessment/legislative-disruption.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + source diversity + 6 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### threat-assessment/consequence-trees.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Structural requirements:** Mermaid + reader block + source diversity + 5 required sections  
**Pass 2 priority:** REQUIRED before Stage C

### existing/committee-productivity.md
**Status:** ⚪ NOT YET WRITTEN  
**Floor:** 100 lines | **Note:** committee-reports-specific required artifact  
**Pass 2 priority:** REQUIRED before Stage C

---

## Quality Score Summary (Pass 1 artifacts)

| Metric | Value |
|--------|-------|
| Artifacts written (Pass 1) | 11/22 (50%) |
| Above floor | 3 (27%) |
| At/approaching floor | 4 (36%) |
| Below floor | 4 (36%) |
| Not yet written | 11 |
| Mermaid diagrams written | 1 (synthesis-summary forecast table) |
| Reader briefing sections | 0 (structural requirement — needed in classification/risk/threat artifacts) |
| AI_ANALYSIS_REQUIRED markers | 0 |
| Confidence labels present | All written artifacts include 🟡/🟢/🔴 labels |

**Overall Pass 1 quality: 🟡 PARTIAL** — 50% artifacts written; floor compliance inconsistent. Standard Pass 2 protocol applies.

## Recommended Pass 2 Focus Order

1. executive-brief.md — expand to 180+ lines
2. intelligence/synthesis-summary.md — expand to 160+ lines
3. intelligence/economic-context.md — expand to 160+ lines, add more quantitative data
4. intelligence/scenario-forecast.md — expand to 180+ lines

*Remaining unwritten artifacts (classification/risk-scoring/threat-assessment) are the primary Pass 2 creation targets — they contribute most of the Mermaid + structural requirement content.*

*Assessment produced at Stage B Pass 1 completion. Updated at Pass 2 completion per ai-driven-analysis-guide.md §10.*
