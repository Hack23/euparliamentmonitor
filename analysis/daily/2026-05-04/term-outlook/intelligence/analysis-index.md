<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EP10 Term Outlook
**Date:** 2026-05-04 | **Horizon:** 2026–2029 | **Run:** term-outlook-run-1777895963

## Purpose
Master index of all analysis artifacts produced in this run. Each section lists the artifact, its analytical methodology, key findings, and cross-reference links.

## Artifact Registry

| # | Artifact | Method | Status | Lines Floor |
|---|---------|--------|--------|-------------|
| 1 | `executive-brief.md` | Executive Summary | ✅ Complete | 220 |
| 2 | `intelligence/synthesis-summary.md` | ACH + SAT | ✅ Complete | 280 |
| 3 | `intelligence/coalition-dynamics.md` | Coalition Mapping | ✅ Complete | 240 |
| 4 | `intelligence/economic-context.md` | Macro Analysis (degraded) | ✅ Complete | 240 |
| 5 | `intelligence/historical-baseline.md` | Historical Comparison | ✅ Complete | 240 |
| 6 | `intelligence/mcp-reliability-audit.md` | Data Provenance | ✅ Complete | 240 |
| 7 | `intelligence/pestle-analysis.md` | PESTLE Framework | ✅ Complete | 280 |
| 8 | `intelligence/scenario-forecast.md` | Scenario Planning (≥6) | ✅ Complete | 360 |
| 9 | `intelligence/stakeholder-map.md` | Power/Interest Matrix | ✅ Complete | 300 |
| 10 | `intelligence/threat-model.md` | Political Threat Framework | ✅ Complete | 260 |
| 11 | `intelligence/wildcards-blackswans.md` | STEEP + Black Swan | ✅ Complete | 280 |
| 12 | `intelligence/forward-projection.md` | Time-series Projection | ✅ Complete | 360 |
| 13 | `intelligence/term-arc.md` | Term Narrative Arc | ✅ Complete | 320 |
| 14 | `intelligence/seat-projection.md` | Electoral Modelling | ✅ Complete | 280 |
| 15 | `intelligence/mandate-fulfilment-scorecard.md` | Scorecard Methodology | ✅ Complete | 280 |
| 16 | `intelligence/presidency-trio-context.md` | Council Presidency Analysis | ✅ Complete | 220 |
| 17 | `intelligence/commission-wp-alignment.md` | Policy Alignment Matrix | ✅ Complete | 220 |
| 18 | `intelligence/methodology-reflection.md` | SAT Documentation | ✅ Complete | 240 |
| 19 | `risk-scoring/risk-matrix.md` | Risk Probability × Impact | ✅ Complete | 160 |
| 20 | `risk-scoring/quantitative-swot.md` | Weighted SWOT | ✅ Complete | 160 |
| 21 | `classification/significance-classification.md` | Significance Triage | ✅ Complete | 120 |
| 22 | `extended/forward-indicators.md` | Leading Indicator Watch | ✅ Complete | 260 |
| 23 | `extended/historical-parallels.md` | Comparative Historical | ✅ Complete | 240 |
| 24 | `extended/comparative-international.md` | Comparative Legislature | ✅ Complete | 240 |

## Key Analytical Themes (Cross-Cutting)

### Theme 1: Structural Fragmentation → Complex Coalition Mathematics
The single most analytically significant finding across all artifacts is the **structural shift in EP coalition arithmetic**. The Herfindahl-Hirschman Index (HHI) of 0.1516 confirms deconcentration from a historical near-duopoly (EPP+S&D, HHI ~0.23 in 2004) to a multi-polar system requiring ≥3 groups per majority. This structural change — not any individual policy vote — is the dominant determinant of EP10 legislative outcomes.

Cross-referenced in: `coalition-dynamics.md`, `scenario-forecast.md`, `term-arc.md`, `risk-matrix.md`, `historical-baseline.md`

### Theme 2: Defence-Competitiveness Legislative Axis
The convergence of the European Defence Industrial Strategy (EDIS), Clean Industrial Deal (CID), and AI Act implementation creates a dominant legislative programme for 2026–2028. These three dossiers share a common coalition basis (EPP + ECR + Renew on defence; EPP + S&D + Renew on CID-social) but diverge on details, creating predictable fracture lines.

Cross-referenced in: `pestle-analysis.md`, `forward-projection.md`, `commission-wp-alignment.md`, `stakeholder-map.md`

### Theme 3: Electoral Horizon Pressure (2029)
From Q3 2027 onwards, legislative productivity will be shaped by electoral positioning for EP11. Historical patterns (EP7→EP8: -38% last-year output) suggest a sharp productivity cliff in 2029-H1. The current 2027 peak-output prediction (120 acts) must be discounted by ~30% for 2029.

Cross-referenced in: `seat-projection.md`, `mandate-fulfilment-scorecard.md`, `historical-baseline.md`, `wildcards-blackswans.md`

### Theme 4: Right-Bloc Consolidation vs. Democratic Resilience
The 52.3% combined right-bloc seat share creates structural tension with progressive-bloc resistance. PfE (11.7%), ECR (11.0%), and ESN (3.9%) hold the balance on migration, sovereignty, and EU integration questions. The eurosceptic bloc (15.6%) represents a credible blocking minority on treaty change and deep integration measures.

Cross-referenced in: `threat-model.md`, `political-threat-landscape.md`, `coalition-dynamics.md`, `wildcards-blackswans.md`

## Data Quality Assessment

| Source | Quality | Notes |
|--------|---------|-------|
| EP Open Data — MEP composition | 🟢 High | Live API, 720 MEPs verified |
| EP Adopted Texts 2026 | 🟢 High | 51 texts confirmed Q1 2026 |
| Legislative statistics | 🟢 High | Pre-computed weekly refresh |
| IMF economic data | 🔴 Unavailable | Proxy block — degraded mode |
| World Bank (non-economic) | 🟡 Medium | Available but not queried in time budget |
| Forward projections | 🟡 Medium | Model-based ±12–18% uncertainty |

## Methodology Summary
- **SATs applied:** 10 (see `methodology-reflection.md`)
- **Passes:** 2 (Pass 1 = write, Pass 2 = extend/deepen)
- **WEP bands:** Applied to all probabilistic artifacts
- **Admiralty grades:** B2 for EP data, C3 for projections
- **Confidence distribution:** 🟢 High (5 artifacts), 🟡 Medium (14 artifacts), 🔴 Low (5 artifacts, projection-heavy)
