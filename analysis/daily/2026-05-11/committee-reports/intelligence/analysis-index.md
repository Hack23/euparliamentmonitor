<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Intelligence Analysis Index — EP Committee Reports, Week of 4–11 May 2026

**Date:** 2026-05-11 | **Article Type:** committee-reports
**Run ID:** committee-reports-run252-1778477039
**Data Mode:** degraded (committee document feed unavailable; direct endpoints used)

---

## 📋 Artifact Inventory

This index maps every analysis artifact produced in this run to its data source, methodology, and quality grade.

| Artifact | Path | Lines | Admiralty Grade | Status |
|----------|------|-------|-----------------|--------|
| Executive Brief | `executive-brief.md` | ~185 | B2 | ✅ COMPLETE |
| Synthesis Summary | `intelligence/synthesis-summary.md` | ~200 | B2 | ✅ COMPLETE |
| Historical Baseline | `intelligence/historical-baseline.md` | ~150 | B2 | ✅ COMPLETE |
| Economic Context | `intelligence/economic-context.md` | ~130 | C2 | ✅ COMPLETE |
| PESTLE Analysis | `intelligence/pestle-analysis.md` | ~200 | B2 | ✅ COMPLETE |
| Stakeholder Map | `intelligence/stakeholder-map.md` | ~220 | B2 | ✅ COMPLETE |
| Scenario Forecast | `intelligence/scenario-forecast.md` | ~190 | B2 | ✅ COMPLETE |
| Threat Model | `intelligence/threat-model.md` | ~175 | B2 | ✅ COMPLETE |
| Wildcards & Black Swans | `intelligence/wildcards-blackswans.md` | ~200 | C2 | ✅ COMPLETE |
| MCP Reliability Audit | `intelligence/mcp-reliability-audit.md` | ~210 | A1 | ✅ COMPLETE |
| Reference Quality Analysis | `intelligence/reference-analysis-quality.md` | ~150 | A1 | ✅ COMPLETE |
| Methodology Reflection | `intelligence/methodology-reflection.md` | ~200 | A1 | ✅ COMPLETE |
| Risk Matrix | `risk-scoring/risk-matrix.md` | ~110 | B2 | ✅ COMPLETE |
| Quantitative SWOT | `risk-scoring/quantitative-swot.md` | ~120 | B2 | ✅ COMPLETE |
| Media Framing Analysis | `extended/media-framing-analysis.md` | ~190 | B2 | ✅ COMPLETE |

---

## 🗂️ Data Sources Used

| Source | Tool | Status | Quality |
|--------|------|--------|---------|
| EP Adopted Texts (2026) | `get_adopted_texts` | ✅ Available | GOOD |
| EP Political Landscape | `generate_political_landscape` | ✅ Available | GOOD |
| Committee Activity Analysis | `analyze_committee_activity` | ⚠️ Partial | MEDIUM (attendance data missing) |
| Coalition Dynamics | `analyze_coalition_dynamics` | ⚠️ Partial | MEDIUM (voting data unavailable) |
| EP Procedures Feed | `get_procedures_feed` | ✅ Available | GOOD (historical data) |
| Early Warning System | `early_warning_system` | ✅ Available | MEDIUM |
| Committee Documents Feed | `get_committee_documents_feed` | ❌ Unavailable | DEGRADED |
| Events Feed | `get_events_feed` | ❌ Unavailable | DEGRADED |
| Latest Votes | `get_latest_votes` | ❌ Unavailable | N/A (non-plenary week) |
| IMF Economic Data | `fetch_url` (IMF SDMX) | ❌ Unavailable | N/A (firewall) |
| World Bank Data | `world-bank-*` | ✅ Available | GOOD |

---

## 🔍 Key Intelligence Themes

1. **Post-April consolidation** — Following the productive April plenary (DMA enforcement, animal welfare, budget guidelines), committees are in drafting/reconciliation mode for the June Strasbourg plenary.

2. **Structural fragmentation** — 9 political groups, HIGH fragmentation index, effective number of parties 6.58 — every legislative coalition requires careful construction.

3. **DMA implementation scrutiny** — IMCO and the legal affairs committee are monitoring Commission enforcement closely following the April resolution.

4. **2027 Budget inter-institutional battle** — BUDG's April resolution sets the Parliament's opening position; Council counter-position expected in Q2 2026.

5. **Transatlantic trade stabilisation** — INTA committee managing the aftermath of 2025 US tariff disputes; tariff quota adjustments represent the calibrated de-escalation strategy.

---

## 📐 Quality Assessment

**Overall Confidence:** MEDIUM (B-level data quality — EP API limitations on meeting-level detail, committee document feed unavailable, IMF economic data inaccessible via sandbox)

**Depth Grade:** ADEQUATE for public intelligence reporting; below reference-benchmark depth for quantitative economic analysis.

**Completeness:** 15/39 catalog artifacts produced (core intelligence set); extended artifacts deprioritised due to data degradation.

*Index produced: 2026-05-11 | Next assessment: 2026-05-18*
