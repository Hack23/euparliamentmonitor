<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit: Year-Ahead Run (2026-05-11)

**Run ID:** year-ahead-run598-1778488878
**Date:** 2026-05-11 | **Audit Type:** Data quality assessment

---

## I. MCP Server Status

| Server | Status | Tools Used | Notes |
|--------|--------|-----------|-------|
| `european-parliament` | 🟢 AVAILABLE | 14+ tools called | Some tools returned empty or degraded data |
| `world-bank` | 🟡 PARTIAL | Not probed — no time in Stage A | World Bank data not collected |
| `fetch-proxy` (IMF) | 🔴 UNAVAILABLE | fetch_url attempted | IMF SDMX API unreachable from sandbox |
| `memory` | 🟢 AVAILABLE | Not explicitly used | Available if needed |
| `sequential-thinking` | 🟢 AVAILABLE | Not used this run | Available if needed |

---

## II. EP MCP Tool Results

| Tool | Status | Result Quality | Notes |
|------|--------|---------------|-------|
| `get_plenary_sessions` (year: 2026) | 🟢 SUCCESS | 54 sessions returned | dateFrom/dateTo filter broken; year filter works |
| `get_procedures_feed` | 🟢 SUCCESS | ~50 procedures | Some with no detail |
| `get_events_feed` | 🔴 FAILED | Empty / unavailable | Known upstream issue |
| `get_adopted_texts` (year: 2026) | 🟢 SUCCESS | 51 texts | High quality structured data |
| `get_latest_votes` | 🟡 EMPTY | No votes for May 2026 | EP voting data publication delay |
| `get_voting_records` | 🟡 EMPTY | No records returned | Known delay in EP API |
| `generate_political_landscape` | 🟢 SUCCESS | Full 9-group data | High quality |
| `analyze_coalition_dynamics` | 🟢 SUCCESS | Structural analysis | Cohesion proxied by group size ratios |
| `compare_political_groups` | 🟢 SUCCESS | Full comparison | High quality |
| `get_parliamentary_questions` | 🟢 SUCCESS | Multiple Q returned | |
| `monitor_legislative_pipeline` | 🟢 SUCCESS | ~120 active procedures | Stalled dossier data |
| `early_warning_system` | 🟢 SUCCESS | Warnings generated | Structural analysis |
| `get_meeting_foreseen_activities` | 🟢 SUCCESS | May 18-19 session data | Good quality |
| `get_meps` (sample) | 🟢 SUCCESS | 717 MEP total | |

---

## III. Known Data Limitations

### 3.1 IMF Economic Data — DEGRADED MODE
🔴 **CRITICAL LIMITATION**: IMF SDMX API was unreachable throughout Stage A. All economic analysis uses publicly known WEO Oct 2025/Jan 2026 estimates. No live GDP, inflation, or fiscal data.

**Affected artifacts:**
- `intelligence/economic-context.md` — all figures flagged 🔴 LOW confidence
- Forward projections with economic variables
- Any fiscal/monetary analysis in the executive brief

**Workaround applied:** Structural/qualitative economic analysis maintained; quantitative figures explicitly flagged as estimates with source disclosure.

### 3.2 EP Voting Data — PUBLICATION DELAY
🟡 **MEDIUM LIMITATION**: EP roll-call votes for 2026 are not yet published via the Open Data API (multi-week delay). Coalition cohesion analysis uses structural group size ratios as proxy.

**Affected artifacts:**
- `intelligence/coalition-dynamics.md` — cohesion figures are structural proxies
- Any voting pattern analysis

### 3.3 get_plenary_sessions dateFrom/dateTo Filter — BROKEN
🟡 **WORKAROUND APPLIED**: Direct date filtering returns `filteredTotal: 0` even when `total > 0`. Workaround: use `year: 2026` parameter and filter manually.

### 3.4 get_events_feed — UNAVAILABLE
🟡 **LOW IMPACT**: Events feed returned empty/unavailable. Compensated with `get_plenary_sessions` data for calendar projections.

---

## IV. Data Quality Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Political landscape data | 9/10 | Excellent structural data |
| Legislative pipeline data | 7/10 | Good; some procedure gaps |
| Economic context data | 3/10 | IMF unavailable; estimates only |
| Calendar data | 8/10 | Good plenary session data |
| Voting/coalition data | 5/10 | Structural proxies; no live cohesion |
| **Overall** | **6.4/10** | 🟡 ADEQUATE for structural analysis |

---

## V. Confidence Calibration for This Run

Given the data limitations above, confidence levels in artifacts are calibrated as follows:
- Political structure analysis (groups, seats, coalitions): 🟢 HIGH
- Calendar and schedule projections: 🟢 HIGH
- Legislative pipeline tracking: 🟡 MEDIUM
- Economic forecasts and macro analysis: 🔴 LOW (IMF degraded)
- Coalition cohesion scores: 🟡 MEDIUM (structural proxy)
- Threat assessments: 🟡 MEDIUM (qualitative)

**Recommendation for next run:** 
1. Retry IMF API at a different time
2. World Bank probe for economic context (GDP growth, inflation from World Bank data)
3. Re-probe voting data in 4–6 weeks for updated cohesion analysis
