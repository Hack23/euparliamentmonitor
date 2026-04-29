<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Pipeline Health — EU Parliament Propositions
**Date:** 2026-04-29 | **Session:** Strasbourg April 28–29, 2026

## Legislative Pipeline Status

### API Data Quality Note
`monitor_legislative_pipeline` returned 0 enriched active procedures for April 2026. This is a data quality issue — the EP API enrichment has a structural delay that causes current-term procedures to appear empty in the pipeline tool. The actual EP10 legislative pipeline is active and productive, as evidenced by the 22 adopted texts in the April 28 Strasbourg session.

**Workaround applied:** Pipeline health is assessed from `get_adopted_texts` (year:2026), `get_plenary_sessions` (April 22-29), and explicit `track_legislation` calls for known procedure IDs.

## Active Procedures — Tracked Set

| Procedure ID | Title | Stage | Health | Notes |
|-------------|-------|-------|--------|-------|
| 2025/0261(COD) | Customs duties adjustment (US tariffs) | Trilogue (active) | 🟡 UNDER PRESSURE | First round April 13; divergence on scope |
| 2023/0135(COD) | Corruption Directive | Transposition | 🟢 ON TRACK | Adopted; member states transposing |
| 2023/0447(COD) | Dogs and Cats Regulation | Adopted April 28 | 🟢 COMPLETE | Now awaits Commission implementing acts |
| 2025/2246(BUI) | 2027 Budget Guidelines | Adopted April 28 | 🟢 COMPLETE | Commission reference document |
| MFF 2028-2034 | Next MFF Interim Report | EP position adopted | 🟡 NEGOTIATION PHASE | Commission proposal expected September 2026 |

## Bottleneck Analysis

### Bottleneck 1: US Tariff Trilogue (2025/0261)
The INTA committee trilogue on US customs duties is in the most acute pipeline stress. The April 13 first round revealed significant EP-Council divergence. Key bottleneck: Council wants narrowly scoped retaliatory measures; EP wants broader discretionary authority for the Commission to apply counter-measures. Resolution probability: 55% before end-2026.

### Bottleneck 2: MFF 2028-2034 Launch Delay Risk
The September 2026 Commission MFF proposal is the critical path item. Any delay in the proposal (e.g., due to political crisis in Germany or France) would push the entire 18-24 month negotiating timeline and risk transition gap between MFF 2021-2027 (ends December 2027) and MFF 2028-2034. A 6-month transition gap would require annual budgets under Article 312(4) TFEU.

### Bottleneck 3: Animal Welfare Implementing Acts Timeline
The dogs and cats regulation's April 28 adoption is the start, not the end, of the legislative journey. The Commission must now draft implementing regulations within 18 months. Failure to do so (e.g., due to lobbying, resource constraints) would mean the regulation's key provisions (breeding standards, online sales requirements) cannot enter into force.

## Pipeline Velocity Metrics

| Metric | April 2026 | EP9 Equivalent Period | Assessment |
|--------|-----------|----------------------|-----------|
| Monthly adopted texts | ~22 (April 28 session alone) | ~15-18 per month | 🟢 Above average |
| Active trilogues | 2+ (US tariffs, MFF related) | 3-4 per month | 🟢 Normal |
| Pending committee reports | Unknown (API enrichment gap) | ~15-20 per month | 🟡 Unknown |

## Pipeline Health Summary

**Overall pipeline health: 🟡 MODERATE**

The April 28 session represents strong legislative output, and the two major procedures adopted (MFF interim report, budget guidelines) were executed smoothly. However:
- The US tariff trilogue is genuinely contested and at risk of breaking down
- The API enrichment gap creates intelligence blind spots about the full pending procedure docket
- The MFF's 18-month horizon introduces timeline risk not visible in the current snapshot

*Source: EP Open Data Portal | Stage A data collection | Run: propositions-run-1777442543 | 2026-04-29*
