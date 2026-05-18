<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Breaking News
**Date:** 2026-05-18 | **Article Type:** breaking | **Data Mode:** degraded-feeds

---

## Overview

This index maps all analysis artifacts produced in this run against the April 28–30, 2026 European Parliament plenary session output. The primary breaking news cluster comprises nine adopted texts, with the Digital Markets Act enforcement resolution (TA-10-2026-0160), Ukraine accountability resolution (TA-10-2026-0161), and Armenia democratic resilience endorsement (TA-10-2026-0162) as tier-1 stories.

**Run ID:** breaking-run262-1779068047
**Workflow Start:** 2026-05-18T01:33:58Z
**Stage A completed:** ~01:36Z (5 EP MCP calls, within 5-call cap)
**Stage B started:** ~01:37Z

---

## Artifact Registry

### Core Intelligence

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| Executive Brief | `executive-brief.md` | ≥180 | WRITTEN | Top-5 breaking stories, macro context |
| Synthesis Summary | `intelligence/synthesis-summary.md` | ≥205 | WRITTEN | Cross-cutting themes, Bayesian update |
| Analysis Index | `intelligence/analysis-index.md` | ≥160 | THIS FILE | Artifact registry |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | ≥385 | WRITTEN | Tool call log, degraded modes |
| Methodology Reflection | `intelligence/methodology-reflection.md` | ≥220 | WRITTEN | SAT log, quality review |
| Workflow Audit | `intelligence/workflow-audit.md` | ≥100 | WRITTEN | Stage timings, invocation tracking |

### Political Intelligence

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| Coalition Dynamics | `intelligence/coalition-dynamics.md` | ≥135 | WRITTEN | EPP-S&D-Renew alignment on digital |
| Stakeholder Map | `intelligence/stakeholder-map.md` | ≥305 | WRITTEN | Commission, Big Tech, Ukraine, Armenia actors |
| Political Threat Landscape | `intelligence/political-threat-landscape.md` | ≥90 | WRITTEN | ECR/PfE opposition vectors |
| Significance Scoring | `intelligence/significance-scoring.md` | ≥105 | WRITTEN | Tier classification of April 30 texts |
| Scenario Forecast | `intelligence/scenario-forecast.md` | ≥280 | WRITTEN | 3 scenarios per major story |
| Wildcards / Black Swans | `intelligence/wildcards-blackswans.md` | ≥275 | WRITTEN | Low-probability, high-impact events |
| Voting Patterns (degraded) | `intelligence/voting-patterns.degraded.md` | ≥150 | WRITTEN | Inferred patterns, no roll-call data |
| Cross-Session Intelligence | `intelligence/cross-session-intelligence.md` | ≥150 | WRITTEN | EP10 trajectory context |
| Cross-Run Diff | `intelligence/cross-run-diff.md` | ≥100 | WRITTEN | First run, baseline established |

### Risk & Threat Assessment

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| PESTLE Analysis | `intelligence/pestle-analysis.md` | ≥250 | WRITTEN | 6-dimension analysis of April 30 cluster |
| Threat Model | `intelligence/threat-model.md` | ≥250 | WRITTEN | DMA enforcement, Russia, Armenia risks |
| Risk Matrix | `risk-scoring/risk-matrix.md` | ≥150 | WRITTEN | WEP-banded risk registry |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | ≥140 | WRITTEN | EP legislative cluster SWOT |

### Economic & Historical Analysis

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| Economic Context | `intelligence/economic-context.md` | ≥185 | WRITTEN | EU growth, DMA fine potential, defence |
| Historical Baseline | `intelligence/historical-baseline.md` | ≥190 | WRITTEN | Comparable EP legislative clusters |
| Reference Analysis Quality | `intelligence/reference-analysis-quality.md` | ≥190 | WRITTEN | Data quality assessment |
| Procedures Proxy | `intelligence/procedures-proxy.md` | ≥60 | WRITTEN | Procedures feed metadata |

### Classification

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| Significance Classification | `classification/significance-classification.md` | ≥105 | WRITTEN | Tier 1/2/3 assignments |

### Document Analysis

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| Document Analysis Index | `documents/document-analysis-index.md` | ≥95 | WRITTEN | EP adopted texts corpus |

### Data Availability

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| Data Availability Assessment | `data-availability-assessment.md` | ≥80 | WRITTEN | Feed degradation summary |

### Extended Intelligence

| Artifact | Path | Lines (target) | Status | Key Insight |
|---------|------|----------------|--------|------------|
| Extended Executive Brief | `extended/executive-brief.md` | ≥180 | WRITTEN | Deep policy analysis |
| Devil's Advocate Analysis | `extended/devils-advocate-analysis.md` | ≥250 | WRITTEN | Counter-narratives |
| Historical Parallels | `extended/historical-parallels.md` | ≥220 | WRITTEN | Analogous EP legislative moments |
| Coalition Mathematics | `extended/coalition-mathematics.md` | ≥200 | WRITTEN | Vote arithmetic, margin analysis |
| Forward Indicators | `extended/forward-indicators.md` | ≥180 | WRITTEN | Leading signals for follow-up |
| Intelligence Assessment | `extended/intelligence-assessment.md` | ≥220 | WRITTEN | Multi-source intelligence fusion |
| Implementation Feasibility | `extended/implementation-feasibility.md` | ≥200 | WRITTEN | Policy delivery timelines |
| Media Framing Analysis | `extended/media-framing-analysis.md` | ≥270 | WRITTEN | How major outlets cover this cluster |
| Comparative International | `extended/comparative-international.md` | ≥200 | WRITTEN | G7 digital regulation comparison |
| Voter Segmentation | `extended/voter-segmentation.md` | ≥200 | WRITTEN | Constituency impact analysis |
| Cross-Reference Map | `extended/cross-reference-map.md` | ≥150 | WRITTEN | Artifact cross-links |
| Data Download Manifest | `extended/data-download-manifest.md` | ≥160 | WRITTEN | All data sources used |

---

## Data Sources

| Source | Endpoint | Coverage | Mode |
|--------|---------|----------|------|
| EP Adopted Texts (direct) | `get_adopted_texts?year=2026&limit=30` | 31 texts, Jan–Apr 2026 | FULL |
| EP Adopted Texts Feed (one-week) | `get_adopted_texts_feed?timeframe=one-week` | 131 text IDs, no detail | PARTIAL |
| EP Procedures Feed | `get_procedures_feed?timeframe=one-week` | 50 historical stubs | DEGRADED |
| EP Events Feed | `get_events_feed?timeframe=one-week` | 0 items (404 error) | UNAVAILABLE |
| EP Latest Votes (DOCEO XML) | `get_latest_votes` | 0 items (no week available) | UNAVAILABLE |
| EP Plenary Sessions | `get_plenary_sessions?dateFrom=2026-05-01` | 0 May 2026 sessions returned | PARTIAL |
| IMF WEO (April 2026) | Not queried (API degraded) | Public data referenced | DEGRADED |

**Data Mode Declared:** `degraded-feeds`
**Prefetch Mode:** `full` (6/6 feed files written, all empty for today/one-week)

---

## Breaking News Tier Classification

| Tier | Texts | Summary |
|------|-------|---------|
| **Tier 1** (CRITICAL) | TA-10-2026-0160, -0161, -0162 | DMA enforcement, Ukraine accountability, Armenia |
| **Tier 2** (HIGH) | TA-10-2026-0163, -0112 | Cyberbullying directive, 2027 budget guidelines |
| **Tier 3** (MEDIUM) | TA-10-2026-0151, -0115, -0119, -0142 | Haiti, pets, EIB, Iceland PNR |

---

## Manifest Cross-Reference

All artifacts listed above are registered in `manifest.json` under `files.*` keys. The manifest's `articleType` is `breaking`. The `dataMode` is `degraded-feeds`. The `history[]` array contains a single entry (first run, no prior same-day runs).

*Generated: 2026-05-18 | Run: breaking-run262-1779068047*
