<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Reference Map — Breaking News
**Date:** 2026-05-18 | **Article Type:** breaking

---

## 1. Purpose

Navigation map linking EP source documents to analysis artifacts, for the article renderer and Pass 2 review.

---

## 2. EP Source Documents to Artifacts

| Doc ID | Tier | Referenced Artifacts |
|--------|------|---------------------|
| TA-10-2026-0160 (DMA) | 1 | executive-brief, synthesis-summary, stakeholder-map, scenario-forecast, implementation-feasibility, devils-advocate-analysis, media-framing-analysis |
| TA-10-2026-0161 (Ukraine) | 1 | executive-brief, synthesis-summary, historical-parallels, comparative-international, threat-model |
| TA-10-2026-0162 (Armenia) | 1 | executive-brief, synthesis-summary, extended/executive-brief, voter-segmentation, implementation-feasibility |
| TA-10-2026-0163 (Cyberbullying) | 2 | executive-brief, implementation-feasibility, media-framing-analysis, voter-segmentation |
| TA-10-2026-0112 (Budget 2027) | 2 | executive-brief, economic-context, coalition-mathematics, voter-segmentation |
| TA-10-2026-0151 | 3 | document-analysis-index |
| TA-10-2026-0115 (Dog/cat welfare) | 3 | document-analysis-index |
| TA-10-2026-0010 (Ukraine macro-finance) | 3 | economic-context, historical-baseline |

---

## 3. Artifact Cross-Dependencies

| Artifact | Requires | Used By |
|----------|---------|--------|
| executive-brief.md | synthesis-summary, stakeholder-map | article-renderer, extended/executive-brief |
| intelligence/synthesis-summary.md | ALL data files | executive-brief |
| intelligence/stakeholder-map.md | pestle-analysis | executive-brief |
| intelligence/scenario-forecast.md | risk-matrix, stakeholder-map | extended/forward-indicators |
| extended/forward-indicators.md | scenario-forecast | article-renderer |
| extended/coalition-mathematics.md | significance-classification | article-renderer |
| extended/devils-advocate-analysis.md | intelligence-assessment | article-renderer |
| intelligence/economic-context.md | IMF data (unavailable) | article-renderer |
| manifest.json | ALL artifact paths | npm run validate-analysis, npm run generate-article |

---

## 4. Missing Cross-References (Data Gaps)

- **Roll-call voting data**: Zero artifacts can reference actual vote tallies.
- **Full resolution texts**: Only summaries available; extended/executive-brief uses inferred language.
- **Events feed**: No plenary debate data available for cross-reference.

*Generated: 2026-05-18 | Run: breaking-run262-1779068047*

---

## EXTEND-FROM-PRIOR: Cross-Reference Map Extension (Run 268)

### 3. Article Section to Artifact Mapping

For Stage D article rendering, each article section must cite specific artifacts:

| Article Section | Primary Artifact | Secondary Artifacts |
|----------------|-----------------|---------------------|
| Executive Summary / BLUF | executive-brief.md | intelligence/synthesis-summary.md |
| Context / Background | intelligence/historical-baseline.md | extended/historical-parallels.md |
| DMA Enforcement Analysis | intelligence/economic-context.md | intelligence/stakeholder-map.md, extended/intelligence-assessment.md |
| Foreign Policy (Ukraine + Armenia) | intelligence/coalition-dynamics.md | intelligence/scenario-forecast.md, extended/devils-advocate-analysis.md |
| Budget / Defence | intelligence/pestle-analysis.md | extended/coalition-mathematics.md, risk-scoring/risk-matrix.md |
| Social Legislation (Cyberbullying) | intelligence/significance-scoring.md | extended/voter-segmentation.md |
| Risk Assessment | intelligence/threat-model.md | risk-scoring/quantitative-swot.md, intelligence/wildcards-blackswans.md |
| Outlook / Forward Look | intelligence/scenario-forecast.md | extended/forward-indicators.md, intelligence/political-threat-landscape.md |

### 4. Artifact Dependency Graph

```
executive-brief.md
  ├── intelligence/synthesis-summary.md (aggregates all intelligence/)
  │   ├── coalition-dynamics.md
  │   ├── stakeholder-map.md
  │   ├── scenario-forecast.md
  │   └── significance-scoring.md
  ├── extended/intelligence-assessment.md
  │   ├── extended/devils-advocate-analysis.md
  │   └── extended/historical-parallels.md
  ├── risk-scoring/risk-matrix.md
  │   └── risk-scoring/quantitative-swot.md
  └── classification/significance-classification.md
      └── documents/document-analysis-index.md
```

### 5. Methodology Reference Map

| Artifact | Primary Methodology | Template Reference |
|----------|--------------------|--------------------|
| executive-brief.md | Intelligence brief format (bottom-line up front) | templates/executive-brief.md |
| synthesis-summary.md | Synthesis + BLUF | templates/synthesis-summary.md |
| coalition-dynamics.md | CIA coalition analysis | methodologies/per-artifact-methodologies.md §coalition-dynamics |
| scenario-forecast.md | Alternative futures analysis | methodologies/per-artifact-methodologies.md §scenario-forecast |
| threat-model.md | STRIDE-adapted + PESTLE threat dimension | methodologies/per-artifact-methodologies.md §threat-model |
| wildcards-blackswans.md | Black swan theory (Taleb) + low-probability/high-impact | methodologies/per-artifact-methodologies.md §wildcards |
| stakeholder-map.md | Interest-power grid (Mendelow) | methodologies/per-artifact-methodologies.md §stakeholder-map |
| pestle-analysis.md | PESTLE political intelligence variant | methodologies/per-artifact-methodologies.md §pestle |
| significance-scoring.md | Multi-dimensional scoring (Impact/Urgency/Novelty/Coalition/Media) | templates/significance-scoring.md |


### 6. Stage D Render Contract

The article renderer (`npm run generate-article`) must:
1. Read `manifest.json` to identify all artifact paths
2. Consume each artifact listed in the Article Section mapping (Section 3 above)
3. Output `news/2026-05-18-breaking.en.md` with section-by-section provenance citations
4. Render to `news/2026-05-18-breaking-en.html`

**Renderer artifact consumption order:** executive-brief.md → synthesis-summary.md → analysis-index.md → classification/significance-classification.md → [per-section artifacts per Section 3 table above] → extended/data-download-manifest.md → extended/cross-reference-map.md (this file)


*This cross-reference map is the canonical routing document for Stage D article rendering. Any rendering that bypasses the artifact-to-section mapping in Section 3 violates the Read-Before-Write contract and will fail Stage C validation on the next run.*



