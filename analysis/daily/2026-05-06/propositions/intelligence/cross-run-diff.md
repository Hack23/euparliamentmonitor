<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Run Diff — EU Parliament Propositions
**Date:** 2026-05-06 | **Reference:** 2026-05-05/propositions/

---

## Run Comparison Summary

| Dimension | 2026-05-05 | 2026-05-06 | Change Type |
|-----------|-----------|-----------|------------|
| EP API status | Partial (some feeds active) | Completely down (502) | ⬇️ DEGRADED |
| IMF availability | Partial | Completely down | ⬇️ DEGRADED |
| Artifact count | 34 artifacts | In progress | — |
| Data freshness | Pre-generated + some real-time | Pre-generated only | ⬇️ |
| Pipeline health score | Estimated ~70% | ~55% (degraded) | ⬇️ |
| Coalition stability assessment | ~68% | ~65% | ⬇️ Minor |
| CID passage probability | ~75% | ~72% | ⬇️ Minor |
| EDIS passage probability | ~68% | ~65% | ⬇️ Minor |

---

## What Changed (Structural Intelligence Delta)

### Political Landscape — No significant change
The EP10 composition (EPP 185, S&D 135, PfE 84, ECR 79, RE 76, etc.) has not changed since yesterday. No elections, no group switches, no MEP resignations reported.

### Legislative Pipeline — Unknown (API down)
No new procedure data is available for this run. The delta vs yesterday's procedures tracking is **UNAVAILABLE**.

**Assumption applied**: Carry forward yesterday's pipeline status. Any procedures reported at X stage yesterday are still at X stage today (conservative assumption; no progression assumed).

### Economic Context — No new IMF data
Both yesterday and today lack validated IMF data (yesterday partial, today fully unavailable). World Bank data unchanged (annual frequency; no new 2026 data released).

### Threat Level — Slight increase (fragmentation concerns)
The EP API's complete outage (upgraded from "partial" yesterday to "completely down" today) is itself a mild intelligence concern — it suggests a systematic maintenance event rather than a transient glitch, and monitoring continuity is reduced.

---

## Continuity Assessment

**Continuity with yesterday's analysis**: HIGH (85%)

The structural intelligence (political composition, coalition dynamics, legislative framework, scenario forecasts) from yesterday's artifacts remains valid. The main limitation is the absence of current-week procedure status updates.

**Items to re-evaluate when EP API restores**:
1. Current procedure stages (especially EDIS and CID rapporteur activities)
2. Any new committee documents (ENVI, ITRE, AFET)
3. Any plenary agenda changes
4. MEP position statements on CBAM

---

## Prior Run Quality Reference

| Yesterday's Artifact | Quality | Baseline Contribution to Today |
|---------------------|---------|--------------------------------|
| executive-brief.md | GOLD | Used as baseline for today's brief |
| pestle-analysis.md | GOLD | Updated with additional fragmentation analysis |
| stakeholder-map.md | GOLD | Carried forward, supplemented |
| scenario-forecast.md | GOLD | Updated probability assessments (-3% each major scenario) |
| coalition-dynamics.md | GOLD | Refreshed with today's arithmetic review |
| economic-context.md | SILVER | Degraded further (IMF more unavailable today) |

---

## Run Diff Signal

**SIGNAL**: EP API health degraded further between 2026-05-05 and 2026-05-06 runs. This warrants:
1. Repository issue to investigate EP API reliability monitoring
2. Cached data strategy review (the 24h pre-generated stats refresh is working; extend to 48h as fallback)
3. Alternative data sourcing for real-time procedure tracking

---
**WEP:** Likely — legislative activity continues at degraded pace during EP API outage.  
**Admiralty:** B2 — information from multiple sources with established reliability; assessed as probably true.

