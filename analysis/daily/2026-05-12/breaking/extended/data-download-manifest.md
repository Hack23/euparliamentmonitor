<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Download Manifest — EP Breaking News
**Date:** 2026-05-12 | **Article Type:** breaking | **Run:** breaking-run-1778577220

## Data Download Manifest Overview

This document records all MCP API calls made during Stage A and Stage B data collection for this analysis run, including the tools used, parameters, results, data quality assessments, and any limitations or errors encountered.

---

## Stage A — Primary Data Collection

### Call 1: EP Adopted Texts Feed (Today)
**Tool:** `european-parliament-get_adopted_texts_feed`
**Parameters:** `timeframe: "today"`
**Response:** 50 items (April 28–30, 2026 adopted texts)
**Data quality:** 🟢 GOOD — full result set; includes TA-10-2026-0098 through 0165 range
**Data gaps:** None for this specific call
**Analysis impact:** Primary data source for all legislative analysis

### Call 2: Political Landscape
**Tool:** `european-parliament-generate_political_landscape`
**Parameters:** (none — defaults to current term)
**Response:** Full 9-group breakdown; 717 MEPs total
**Data quality:** 🟢 GOOD — complete and reliable
**Analysis impact:** Foundation for all coalition mathematics

### Call 3: Early Warning System
**Tool:** `european-parliament-early_warning_system`
**Parameters:** `sensitivity: "medium"`, `focusArea: "all"`
**Response:** stability=84/100; HIGH warning on EPP dominance
**Data quality:** 🟢 GOOD
**Analysis impact:** EPP dominance finding incorporated in coalition-dynamics

### Call 4: Get Adopted Texts (Full EP10)
**Tool:** `european-parliament-get_adopted_texts`
**Parameters:** Multiple pages retrieved; no year filter (EP10 term)
**Response:** 164 total texts confirmed in EP10 term
**Data quality:** 🟢 GOOD — pagination worked correctly
**Analysis impact:** Document-analysis-index, significance-scoring comprehensive counts

### Call 5: Coalition Dynamics
**Tool:** `european-parliament-analyze_coalition_dynamics`
**Parameters:** (defaults)
**Response:** Structure data available; vote cohesion data not available
**Data quality:** 🟡 PARTIAL — size-proxy only per tool description (no per-MEP roll-call data exposed by EP API)
**Data gaps:** ⚠️ Vote-level cohesion data unavailable from EP Open Data Portal
**Analysis impact:** Coalition analysis is structural/arithmetic, not empirically cohesion-based

### Call 6: Plenary Sessions Check
**Tool:** `european-parliament-get_plenary_sessions`
**Parameters:** `dateFrom: "2026-05-05"`, `dateTo: "2026-05-12"`
**Response:** Empty — no sessions in this window
**Data quality:** 🟢 GOOD (expected result; EP in recess)
**Analysis impact:** Confirms no new session data; April 28-30 is the most recent

### Call 7: Voting Records Check
**Tool:** `european-parliament-get_voting_records`
**Parameters:** `dateFrom: "2026-04-01"`, `dateTo: "2026-05-12"`
**Response:** Empty — publication lag
**Data quality:** 🟢 GOOD (expected result — EP publishes voting records 4-6 weeks after session)
**Data gaps:** ⚠️ No confirmed roll-call voting data available for April 28-30, 2026
**Analysis impact:** All voting pattern analysis is structural/estimated, not confirmed roll-call data

---

## Stage B — Additional Data Calls

### (No additional Stage B MCP calls made)
All Stage B analysis is derived from Stage A data, carry-forward artifact analysis, and qualitative synthesis. The IMF API and World Bank API were not called due to access limitations (IMF) and scope (World Bank data not primary for breaking news type).

---

## Data Gaps and Limitations Summary

| Data Type | Gap | Impact | Resolution Path |
|-----------|-----|--------|----------------|
| Roll-call voting data | Not available (publication lag 4-6 weeks) | voting-patterns.md is structural, not empirical | Next run ~June 2026 when data published |
| IMF economic data | API not accessible this run | economic-context.md uses EP qualitative proxy | Verify IMF API gateway configuration for next run |
| World Bank indicators | Not called (not primary for breaking news) | No health/social indicator analysis | Not required for this article type |
| Plenary session details | No session in window | Cannot analyse session dynamics | N/A — no session occurred |
| Committee document feed | Not called | Committee activity not primary for breaking news | Available if needed |

---

## Data Currency Assessment

| Data source | Currency | Reliability |
|-------------|----------|-------------|
| EP adopted texts | Current (April 28-30, 2026 — most recent) | HIGH |
| Political landscape | Real-time (May 12, 2026) | HIGH |
| Early warning | Real-time | HIGH |
| Coalition dynamics (structure) | Real-time | HIGH |
| Coalition dynamics (cohesion) | Not available | N/A |
| Voting records | Not available (publication lag) | N/A |
| IMF economic data | Not available this run | N/A |

**Overall data currency:** 🟡 MEDIUM-HIGH — primary EP structural data is current and reliable; economic data and voting record confirmation are unavailable

---

## Reproducibility Notes

To reproduce this analysis:
1. Run `get_adopted_texts_feed` with `timeframe: "today"` (or `timeframe: "one-week"` after May 2026)
2. Run `generate_political_landscape` to get current seat distribution
3. Run `early_warning_system` for current stability assessment
4. Run `get_adopted_texts` with full pagination to confirm EP10 text count
5. Check `get_voting_records` (4-6 weeks after session for confirmed data)
6. IMF API: requires valid gateway configuration (`fetch-proxy` with `EP_MCP_GATEWAY_URL`)

---

## Source Attribution
Data download manifest methodology: EU Parliament Monitor data provenance tracking
Purpose: Reproducibility, data quality assurance, gap documentation
Data sources: EP Open Data Portal via european-parliament-mcp-server@1.3.3
Cross-references: `intelligence/workflow-audit.md`, `intelligence/mcp-reliability-audit.md`
