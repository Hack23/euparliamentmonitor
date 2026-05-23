<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Session Baseline — EP Motions (intelligence/)
**Article type:** motions | **Date:** 2026-05-06 | **Run:** motions-run431-1778097237

---

## Session Identity

| Field | Value |
|-------|-------|
| Run ID | motions-run431-1778097237 |
| Start epoch | 1778097237 (2026-05-06T19:53:57Z) |
| Article type | motions |
| Analysis directory | `analysis/daily/2026-05-06/motions/` |
| Workflow | `news-motions.md` (unified, stages A-E) |
| Today | 2026-05-06 |
| Data window start | 2026-04-29 (7 days prior) |

---

## Data Collection Results

### EP API Status at Session Start
- Server health: UNHEALTHY (uptime 29s at first probe)
- get_adopted_texts_feed: ERROR (502)
- get_voting_records: ERROR (502)
- get_plenary_sessions: ERROR (502)
- get_meps: ERROR (502)
- get_current_meps: ERROR (502)
- get_procedures: ERROR (502)
- get_plenary_documents: ERROR (502)
- get_parliamentary_questions: ERROR (502)
- search_documents: ERROR (502)
- compare_political_groups: ERROR (502)
- early_warning_system: ERROR (502)
- monitor_legislative_pipeline: ERROR (502)

### Successful Data Sources
- **get_all_generated_stats** (EP10, 2024-2026): ✅ AVAILABLE — EP10 roll-call votes 2024: 399; projected 2026: 567; 6 committees; ENP 6.59
- **generate_political_landscape**: ✅ PARTIAL — seat counts available; MEP counts 0 (pagination failure)
- **analyze_coalition_dynamics**: ✅ PARTIAL — group pairs analyzed; sizeSimilarityScore as proxy (no direct cohesion data)
- **get_latest_votes** (DOCEO XML): ✅ RETURNED EMPTY — no plenary votes for 2026-05-04 to 2026-05-07 (committee week or index not yet updated)
- **World Bank GDP growth (DE)**: ✅ AVAILABLE — DE: -0.5% 2024, -0.1% 2023; FR: +1.19% 2024; IT: +0.69% 2024; ES: +3.46% 2024
- **World Bank inflation (DE)**: ✅ AVAILABLE — DE: 2.26% 2024
- **IMF fetch-proxy**: ❌ UNAVAILABLE — McpError: fetch failed

---

## Political Group Snapshot (at Session Start)

| Group | Seats | % of 720 |
|-------|-------|---------|
| EPP | 188 | 26.1% |
| S&D | 136 | 18.9% |
| RE | 77 | 10.7% |
| ECR | 78 | 10.8% |
| PfE | 84 | 11.7% |
| Greens/EFA | 53 | 7.4% |
| GUE/NGL | 46 | 6.4% |
| ESN | 28 | 3.9% |
| NI | 33 | 4.6% |
| **Total** | **720** | **100%** |
| **Majority threshold** | **361** | **50.1%** |

*Note: Seat counts from precomputed stats; some bylaw elections may have shifted numbers marginally.*

---

## Stage Timing (at Session Baseline Recording)

| Stage | Status | Elapsed |
|-------|--------|---------|
| Stage A | Complete | ~7 min |
| Stage B Pass 1 | In progress | ~15 min |
| Stage B Pass 2 | Not started | — |
| Stage C | Not started | — |
| Stage D | Not started | — |
| Stage E | Not started | — |

**Tripwires:**
- Stage B1→B2 tripwire: minute 22
- Stage C exit tripwire: minute 36
- PR deadline: minute ≤ 45

---

## Environment Notes

- **AWF gateway**: Not available (Copilot CLI context, not AWF sandbox)
- **EP MCP tools**: Called directly as Copilot tools (not via gateway)
- **Heredocs**: Avoided throughout — bash safety filter blocks content with "kill" keyword
- **File tool**: Used exclusively for artifact creation

*Generated: 2026-05-06T20:23Z | intelligence/session-baseline.md*
