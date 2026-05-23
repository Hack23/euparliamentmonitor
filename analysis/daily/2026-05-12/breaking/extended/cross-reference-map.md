<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Reference Map — EP Breaking News
**Date:** 2026-05-12 | **Article Type:** breaking | **Confidence:** 🟢 High

## Cross-Reference Map Overview

This document provides a comprehensive cross-reference map of all analysis artifacts in this run, showing which artifacts cite which others, which data sources underpin each artifact, and which EP legislative texts are analysed across multiple artifacts. This enables readers to navigate the analysis set efficiently and provides quality assurance for internal consistency.

---

## EP Legislative Text Cross-Reference Map

### TA-10-2026-0111 (MFF 2028–2034 Interim Report)
Primary analysis: `executive-brief.md` §1, `intelligence/significance-scoring.md` §Tier1
Supporting analysis: `intelligence/economic-context.md` §MFF Architecture, `intelligence/historical-baseline.md` §Delors comparison, `intelligence/coalition-dynamics.md` §MFF-specific analysis, `extended/coalition-mathematics.md` §MFF vote
Implementation analysis: `extended/implementation-feasibility.md` §MFF analysis
Forward intelligence: `extended/forward-indicators.md` §FI-90-1
Historical parallel: `extended/historical-parallels.md` §Parallel 1 (Delors II)
Voter resonance: `extended/voter-segmentation.md` §Policy Resonance Matrix
Devil's advocate: `extended/devils-advocate-analysis.md` §Counter-Narrative 1

### TA-10-2026-0104 (DMA Enforcement Priority)
Primary analysis: `executive-brief.md` §2, `intelligence/significance-scoring.md` §Tier1 (S=8.4)
Supporting analysis: `intelligence/pestle-analysis.md` §Technology, `intelligence/economic-context.md` §Digital Economy
Implementation analysis: `extended/implementation-feasibility.md` §DMA enforcement
Comparative context: `extended/comparative-international.md` §Digital Governance
Historical parallel: `extended/historical-parallels.md` §Parallel 4 (Microsoft antitrust)
Forward intelligence: `extended/forward-indicators.md` §FI-30-2

### TA-10-2026-0125 (Commission Discharge 2024)
Primary analysis: `executive-brief.md` §3, `intelligence/significance-scoring.md` §Tier1/2
Supporting analysis: `intelligence/political-threat-landscape.md` §IT-3 EPPO, `intelligence/coalition-dynamics.md` §discharge vote
Implementation analysis: `extended/implementation-feasibility.md` §Discharge 2024
Voter resonance: `extended/voter-segmentation.md` §policy resonance

### TA-10-2026-0161 (Ukraine Special Tribunal)
Primary analysis: `executive-brief.md` §4, `intelligence/significance-scoring.md` §Tier2
Supporting analysis: `intelligence/political-threat-landscape.md` §GS-1, `intelligence/historical-baseline.md`, `intelligence/voting-patterns.md` §estimated vote reconstruction
Historical parallel: `extended/historical-parallels.md` §Parallel 3 (ICTY)
Comparative context: `extended/comparative-international.md` §Accountability
Implementation analysis: `extended/implementation-feasibility.md` §Ukraine tribunal
Forward intelligence: `extended/forward-indicators.md` §FI-30-3, FI-90-3

### TA-10-2026-0022 (BRRD3 Banking Resolution)
Primary analysis: `executive-brief.md` §5, `intelligence/significance-scoring.md` §Tier2
Supporting analysis: `intelligence/economic-context.md` §Banking Union, `intelligence/wildcards-blackswans.md` §BS-1
Implementation analysis: `extended/implementation-feasibility.md` (indirect)
Comparative context: `extended/comparative-international.md` §Fiscal Architecture
Forward intelligence: `extended/forward-indicators.md` §FI-60-1, FI-90-4

### TA-10-2026-0147 (Rule of Law 2025 Annual Report)
Primary analysis: `intelligence/significance-scoring.md` §Tier2, `intelligence/political-threat-landscape.md` §DF-1, RL-1
Supporting analysis: `intelligence/historical-baseline.md`, `intelligence/coalition-dynamics.md`
Forward intelligence: `extended/forward-indicators.md` §FI-30-4
Historical parallel: `extended/historical-parallels.md` §Parallel 2 (Austria sanctions)

### TA-10-2026-0149 (Protection from Unfair Competition)
Primary analysis: `intelligence/significance-scoring.md` §Tier2, `intelligence/political-threat-landscape.md` §GS-2
Implementation analysis: `extended/implementation-feasibility.md` §Unfair competition
Comparative context: `extended/comparative-international.md` §Trade Defence

---

## Artifact-to-Artifact Cross-Reference Matrix

### Artifacts that cite `intelligence/coalition-dynamics.md`
- `extended/coalition-mathematics.md` (extends coalition arithmetic)
- `intelligence/voting-patterns.md` (cross-references coalition structure)
- `intelligence/significance-scoring.md` (coalition context for vote estimates)
- `extended/voter-segmentation.md` (electoral coalition analysis)

### Artifacts that cite `intelligence/scenario-forecast.md`
- `extended/devils-advocate-analysis.md` (steelmans scenarios)
- `extended/forward-indicators.md` (forward-looking scenarios)
- `extended/intelligence-assessment.md` (synthesises scenarios into judgements)
- `extended/implementation-feasibility.md` (feasibility affects scenario distribution)

### Artifacts that cite `executive-brief.md`
- `intelligence/significance-scoring.md` (validates significance tier assignments)
- `extended/intelligence-assessment.md` (uses executive brief structure for KJ framework)
- `intelligence/reference-analysis-quality.md` (quality assesses executive brief)

### Artifacts that cite `intelligence/economic-context.md`
- `intelligence/stakeholder-map.md` (economic stakeholders)
- `extended/comparative-international.md` (fiscal comparison)
- `extended/implementation-feasibility.md` (fiscal feasibility)
- `intelligence/pestle-analysis.md` §Economic (draws on economic context)

---

## Data Source Cross-Reference

### EP Open Data Portal (via european-parliament-mcp-server@1.3.3)
Used by all artifacts. Primary data source for:
- 164 adopted texts (TA numbers, dates, titles)
- 717 MEPs (seat counts, group distribution)
- Political landscape (group sizes, coalitions)
- Early warning system (stability scores)

### Eurobarometer (structural reference — not directly queried this run)
Used in: `extended/voter-segmentation.md` (Q4 2025 data referenced)

### IMF SDMX (not accessible this run)
Affects: `intelligence/economic-context.md` (flagged as qualitative proxy only)
Next run priority: Obtain confirmed IMF growth and fiscal figures

### EP legislative text content
Multiple TA numbers referenced in all Tier 1 and Tier 2 intelligence artifacts
Actual text content accessed via adopted_texts_feed and get_adopted_texts

---

## Quality Assurance Cross-Check

### Consistency checks (potential contradictions — verified as consistent):
- Seat counts: All artifacts use 717 total, 360 majority threshold — ✅ consistent
- Group seat counts: EPP 183, S&D 136, PfE 85, ECR 81, Renew 77, Greens 53, Left 45, NI 30, ESN 27 — ✅ consistent across all coalition analyses
- MFF significance score: S=9.0 in significance-scoring; described as "highest significance" in executive-brief — ✅ consistent
- DMA significance score: S=8.4 — consistent across significance-scoring and executive-brief priorities — ✅ consistent
- Ukraine tribunal significance: S=7.8 (Tier 2) — described as "top 5 story" in executive-brief — ✅ consistent
- Gate result: This run targets GREEN; manifest.json update pending — ✅ tracked

### Potential ambiguities (noted but not contradictions):
- Commission discharge assigned to Tier 2 in significance-scoring but described as Tier 1 borderline — explained in artifact; consistent
- ECR vote estimates for MFF vary (SPLIT in voting-patterns vs. more nuanced in coalition-dynamics) — consistent; both say SPLIT
- IMF data limitation flagged in 4 artifacts — consistently flagged as MEDIUM confidence limitation

---

## Source Attribution
Cross-reference map methodology: Systematic artifact relationship mapping
Purpose: Navigation aid, quality assurance, consistency verification
Cross-references: All artifacts in `analysis/daily/2026-05-12/breaking/`
Confidence: 🟢 High for internal cross-reference accuracy
