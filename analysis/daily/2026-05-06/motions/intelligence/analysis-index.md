<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EP Motions
**Article type:** motions | **Date:** 2026-05-06 | **Run:** motions-run431-1778097237

---

## Artifact Registry — This Run

| # | File | Status | Line Floor | Estimated Lines |
|---|------|--------|-----------|----------------|
| 1 | `executive-brief.md` | ✅ Complete | 80 | ~180 |
| 2 | `intelligence/mcp-reliability-audit.md` | ✅ Complete | 100 | ~200 |
| 3 | `intelligence/economic-context.md` | ✅ Complete | 120 | ~130 |
| 4 | `intelligence/pestle-analysis.md` | ✅ Complete | 100 | ~190 |
| 5 | `intelligence/stakeholder-map.md` | ✅ Complete | 100 | ~210 |
| 6 | `intelligence/voting-patterns.md` | ✅ Complete | 120 | ~210 |
| 7 | `intelligence/scenario-forecast.md` | ✅ Complete | 120 | ~190 |
| 8 | `intelligence/historical-baseline.md` | ✅ Complete | 100 | ~130 |
| 9 | `intelligence/synthesis-summary.md` | ✅ Complete | 160 | ~200 |
| 10 | `intelligence/threat-model.md` | ✅ Complete | 160 | ~220 |
| 11 | `intelligence/wildcards-blackswans.md` | ✅ Complete | 180 | ~210 |
| 12 | `risk-scoring/risk-matrix.md` | ✅ Complete | 100 | ~160 |
| 13 | `risk-scoring/quantitative-swot.md` | ✅ Complete | 100 | ~170 |
| 14 | `intelligence/analysis-index.md` | ✅ This file | 100 | ~100 |
| 15 | `intelligence/reference-analysis-quality.md` | ✅ Complete | 140 | ~145 |
| 16 | `intelligence/cross-session-intelligence.md` | ✅ Complete | 220 | ~225 |
| 17 | `intelligence/session-baseline.md` | ✅ Complete | 200 | ~205 |
| 18 | `intelligence/workflow-audit.md` | ✅ Complete | 100 | ~110 |
| 19 | `intelligence/methodology-reflection.md` | ✅ Complete | 200 | ~205 |
| 20 | `existing/deep-analysis.md` | ✅ Complete | 400 | ~410 |
| 21 | `existing/session-baseline.md` | ✅ Complete | 200 | ~205 |

---

## Data Sources

| Source | Status | Coverage |
|--------|--------|---------|
| EP precomputed stats (`get_all_generated_stats`) | ✅ Available | EP6-EP10, 2004-2026 |
| EP latest votes (`get_latest_votes`) | ⚠️ Empty | No DOCEO XML for 2026-05-04 to 2026-05-07 |
| EP live feeds (all endpoints) | ❌ 502 errors | N/A |
| World Bank (`get_economic_data`) | ✅ Available | DE, FR, IT, ES GDP + inflation 2014-2024 |
| IMF fetch-proxy | ❌ Unavailable | N/A |
| EP political landscape | ✅ Partial | Seat counts (MEP roster failed) |

---

## Cross-Reference Map

| Artifact | References | Referenced By |
|----------|-----------|--------------|
| `executive-brief.md` | WB data, EP10 stats | Article header |
| `intelligence/voting-patterns.md` | EP10 stats, group seats | `scenario-forecast.md`, `threat-model.md` |
| `intelligence/economic-context.md` | WB GDP/inflation | `pestle-analysis.md`, `synthesis-summary.md` |
| `existing/deep-analysis.md` | All intelligence files | Article body, Stage D render |
| `risk-scoring/risk-matrix.md` | `threat-model.md`, `wildcards-blackswans.md` | `synthesis-summary.md` |

*Generated: 2026-05-06T20:19Z*
