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
