<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EP Breaking News, 2026-05-11

**Article Type:** breaking  
**ANALYSIS_DIR:** `analysis/daily/2026-05-11/breaking/`  
**Run ID:** breaking-run397-1778462980  
**Generated:** 2026-05-11

---

## Complete Artifact Inventory

### Root Level

| File | Description | Lines (est.) |
|------|-------------|--------------|
| `executive-brief.md` | BLUF executive summary — top 5 stories, strategic significance, monitoring priorities | ~100 |
| `manifest.json` | Run metadata, pass2 tracking, gate result, artifact inventory | — |

### `intelligence/` (Core Intelligence Artifacts)

| File | Description |
|------|-------------|
| `synthesis-summary.md` | Master intelligence synthesis — 5 major developments with source attribution |
| `pestle-analysis.md` | Full PESTLE framework: 6 dimensions × 3 stories |
| `stakeholder-map.md` | 11 stakeholders, power/interest matrix, coalition tests |
| `economic-context.md` | IMF WEO data tables (DEU/FRA/ITA/ESP/POL), ETS2 fiscal impact, Ukraine loan economics |
| `scenario-forecast.md` | 3 scenarios (A=50%, B=35%, C=15%), ACH matrix, 30-day forecasts |
| `coalition-dynamics.md` | EP10 coalition composition, voting pattern estimates, stress tests |
| `historical-baseline.md` | Ukraine timeline, ETS history, immunity precedents |
| `wildcards-blackswans.md` | BS/WC taxonomy, monitoring dashboard |
| `mcp-reliability-audit.md` | Tool call log, data quality assessment, degraded API documentation |
| `analysis-index.md` | This file — complete artifact inventory |
| `threat-model.md` | Political threat model — actor profiles, attack trees, kill chain |

### `classification/` (Significance Classification)

| File | Description |
|------|-------------|
| `significance-classification.md` | 5-dimension significance scoring, Tier 1–3 classification |
| `actor-mapping.md` | (planned — time-constrained) |
| `forces-analysis.md` | (planned — time-constrained) |
| `impact-matrix.md` | (planned — time-constrained) |

### `threat-assessment/` (Threat Intelligence)

| File | Description |
|------|-------------|
| `political-threat-landscape.md` | 5-framework political threat assessment (6-dimension model, attack trees, kill chain, diamond model, ICO profiling) |
| `actor-threat-profiles.md` | (planned — time-constrained) |
| `consequence-trees.md` | (planned — time-constrained) |
| `legislative-disruption.md` | (planned — time-constrained) |

### `risk-scoring/` (Risk Assessment)

| File | Description |
|------|-------------|
| `risk-matrix.md` | Quantitative risk register, probability × impact scoring, deep-dives on top 3 risks |
| `quantitative-swot.md` | Weighted SWOT — 2 strengths, 2 weaknesses, 2 opportunities, 2 threats; per-item composite scoring |
| `political-capital-risk.md` | (planned — time-constrained) |
| `legislative-velocity-risk.md` | (planned — time-constrained) |

### `extended/` (Extended Analysis)

| File | Description |
|------|-------------|
| `media-framing-analysis.md` | Media framing patterns, narrative frames, monitoring signals |

### `data/` (Raw Data)

| File | Description |
|------|-------------|
| `adopted-texts-2026.json` | EP adopted texts — 15 key items from 101 total (Stage A data collection) |

### `cache/imf/` (IMF Data Cache)

| File | Description |
|------|-------------|
| `probe-summary.json` | IMF availability probe (available=true, September 2025 WEO vintage) |

---

## Coverage Assessment

### Mandatory Artifacts (per reference-quality-thresholds.json)

| Artifact | Status |
|----------|--------|
| executive-brief.md | ✅ Created |
| synthesis-summary.md | ✅ Created |
| pestle-analysis.md | ✅ Created |
| stakeholder-map.md | ✅ Created |
| economic-context.md | ✅ Created (IMF-anchored) |
| scenario-forecast.md | ✅ Created |
| coalition-dynamics.md | ✅ Created (required by breaking article type) |
| historical-baseline.md | ✅ Created |
| wildcards-blackswans.md | ✅ Created |
| mcp-reliability-audit.md | ✅ Created (required by breaking article type) |
| significance-classification.md | ✅ Created |
| political-threat-landscape.md | ✅ Created |
| risk-matrix.md | ✅ Created |
| quantitative-swot.md | ✅ Created |
| media-framing-analysis.md | ✅ Created |
| manifest.json | ✅ Created |

---

## Source Attribution

- EP Adopted Texts: data.europarl.europa.eu (April 28–30, 2026; TA-10-2026 series)
- EP Political Landscape: EP MCP `generate_political_landscape`
- IMF WEO: September 2025 SDMX 3.0 vintage via `fetch_url`
- EP Early Warning System: stability=84/100
- Coalition Dynamics: EP MCP `analyze_coalition_dynamics`
