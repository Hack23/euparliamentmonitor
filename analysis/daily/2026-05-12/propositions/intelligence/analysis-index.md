<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Analysis Index — EU Parliament Propositions 2026-05-12
**Date:** 2026-05-12 | **Run ID:** propositions-run270-1778566185
**Analysis Dir:** analysis/daily/2026-05-12/propositions

---

## Artifact Inventory

| File | Stage | Status | Chars (approx) |
|------|:-----:|:------:|:--------------:|
| `executive-brief.md` | B1 | ✅ Complete | ~6600 |
| `intelligence/pestle-analysis.md` | B1 | ✅ Complete | ~11920 |
| `intelligence/stakeholder-map.md` | B1 | ✅ Complete | ~15500 |
| `intelligence/scenario-forecast.md` | B1 | ✅ Complete | ~11200 |
| `intelligence/economic-context.md` | B1 | ✅ Complete | ~10350 |
| `intelligence/synthesis-summary.md` | B1 | ✅ Complete | ~9300 |
| `intelligence/coalition-dynamics.md` | B1 | ✅ Complete | ~7850 |
| `intelligence/wildcards-blackswans.md` | B1 | ✅ Complete | ~8500 |
| `intelligence/historical-baseline.md` | B1 | ✅ Complete | ~7600 |
| `intelligence/threat-model.md` | B1 | ✅ Complete | ~8650 |
| `intelligence/mcp-reliability-audit.md` | B1 | ✅ Complete | ~3000 |
| `intelligence/analysis-index.md` | B1 | ✅ This file | — |
| `classification/significance-classification.md` | B1 | ⏳ Pending | — |
| `classification/actor-mapping.md` | B1 | ⏳ Pending | — |
| `classification/forces-analysis.md` | B1 | ⏳ Pending | — |
| `classification/impact-matrix.md` | B1 | ⏳ Pending | — |
| `risk-scoring/risk-matrix.md` | B1 | ⏳ Pending | — |
| `risk-scoring/quantitative-swot.md` | B1 | ⏳ Pending | — |
| `risk-scoring/political-capital-risk.md` | B1 | ⏳ Pending | — |
| `risk-scoring/legislative-velocity-risk.md` | B1 | ⏳ Pending | — |
| `threat-assessment/political-threat-landscape.md` | B1 | ⏳ Pending | — |
| `threat-assessment/actor-threat-profiles.md` | B1 | ⏳ Pending | — |
| `threat-assessment/consequence-trees.md` | B1 | ⏳ Pending | — |
| `threat-assessment/legislative-disruption.md` | B1 | ⏳ Pending | — |
| `extended/media-framing-analysis.md` | B1 | ⏳ Pending | — |
| `documents/document-analysis-index.md` | B1 | ⏳ Pending | — |
| `existing/pipeline-health.md` | B1 | ⏳ Pending | — |
| `manifest.json` | E | ⏳ Pending | — |

## Key Data Sources

| Source | Tool | Status |
|--------|------|:------:|
| EP Procedures Feed (1 week) | `get_procedures_feed` | ✅ Retrieved (empty current; historical records) |
| EP External Documents Feed | `get_external_documents_feed` | ✅ 12 ACT_FOLLOWUP docs |
| EP Committee Documents Feed | `get_committee_documents_feed` | ❌ Unavailable |
| EP Adopted Texts 2026 | `get_adopted_texts` | ✅ 51 records |
| EP Latest Votes | `get_latest_votes` | ⚠️ Empty (EP publication delay) |
| EP Speeches (April 29) | `get_speeches` | ✅ Retrieved |
| EP Political Landscape | `generate_political_landscape` | ✅ Retrieved |
| EP Coalition Dynamics | `analyze_coalition_dynamics` | ✅ Retrieved |
| EP Early Warning | `early_warning_system` | ✅ Retrieved |
| EP Group Comparison | `compare_political_groups` | ✅ Retrieved |
| IMF WEO (DEU/FRA/ITA) | `fetch-proxy-fetch_url` | ✅ Live SDMX data |
| Track Legislation: SRMR3 | `track_legislation` | ✅ Published OJ 2026-04-20 |
| Track Legislation: Anti-Corruption | `track_legislation` | ✅ Published OJ 2026-05-11 |
| Track Legislation: Dogs&Cats | `track_legislation` | ✅ Adopted 2026-04-28 |
| Track Legislation: DMA RSP | `track_legislation` | ✅ Adopted 2026-04-30 |

## Coverage Summary

- **EP legislative developments:** FULL (Anti-Corruption OJ pub, SRMR3 OJ pub, Animal Welfare adopted, DMA resolution, Budget guidelines, Council follow-up batch)
- **IMF economic context:** FULL (live WEO data for DEU/FRA/ITA; September 2025 vintage)
- **Political landscape/coalition:** FULL (9 groups, seat shares, fragmentation analysis; no vote data)
- **Plenary debate record:** PARTIAL (April 29 speeches retrieved; full debate text not individually indexed)
- **Committee documents:** UNAVAILABLE (API error this run)
- **Roll-call vote data:** UNAVAILABLE (EP 4–6 week publication delay)
