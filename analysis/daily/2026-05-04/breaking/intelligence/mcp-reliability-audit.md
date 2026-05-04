<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Intelligence Summary — MCP Reliability Audit | 2026-05-04

**Run ID:** breaking-run-2026-05-04  
**Article Type:** Breaking News  
**Stage:** A-B (Data Collection + Analysis)

---

## MCP Tool Availability Assessment

### european-parliament MCP Server
**Status:** 🟢 OPERATIONAL (with noted limitations)

| Tool | Status | Notes |
|------|--------|-------|
| get_adopted_texts_feed | ✅ Operational | FRESHNESS_FALLBACK triggered — year=2026 fallback used |
| get_adopted_texts (by ID) | ❌ Content unavailable | Most recent items (TA-10-2026-0160 through 0162) indexed but content 404 |
| get_events_feed | ❌ Error | EP API error-in-body response; today + one-week returns empty |
| get_procedures_feed | ⚠️ Degraded | Returns historical data (1972+) not current period data |
| get_meps_feed | ✅ Operational (oversized) | Payload saved to file; full MEP census returned |
| get_plenary_sessions | ⚠️ Partial | Date filter not working for April 2026 range; year filter returns Jan only |
| get_meeting_decisions | ✅ Operational | April 28 session data returned (oversized) |
| get_speeches | ✅ Operational | April 28-30 speeches returned with session context |
| generate_political_landscape | ✅ Operational | 719 MEPs, 9 groups confirmed |
| analyze_coalition_dynamics | ✅ Operational (limited) | Structural data only; per-MEP voting data unavailable from EP API |
| early_warning_system | ✅ Operational | Stability score 84/100 |
| track_legislation | ⚠️ Partial | RSP procedure type returns limited data |

### worldbank-mcp Server
**Status:** Not queried this run (no World Bank non-economic indicators identified as essential for breaking news core topics)

### Key Data Gaps Identified

1. **Individual voting tallies for April 28-30 votes:** EP publishes roll-call data with 2-4 week delay. No for/against/abstain counts available for any April 30 resolution.

2. **Speech text content:** API returns speech metadata (title, speaker ID, date) but not speech text. Full debate transcript requires EP website scraping or external sources.

3. **Adopted text full content:** Most recent adopted texts (April 28-30) return 404 on full-content lookups — "indexed but content not yet available." Only metadata available from feed.

4. **Event feed error:** get_events_feed returns upstream API error — no event data available for recent period. Fallback to speeches + meeting decisions.

5. **Procedures feed historical bias:** The one-week procedures feed returned items from 1972-1980 rather than current week, indicating a known degraded upstream pattern.

---

## Data Quality Assessment for This Run

**Overall data quality:** 🟡 MEDIUM-HIGH

The absence of roll-call voting data is the primary limitation. However, the combination of:
- Adopted texts feed (confirming what was adopted and when)
- Speeches feed (confirming what was debated)
- Meeting decisions metadata (confirming session structure)
- Political landscape + coalition dynamics (structural seat data)
- Early warning system assessment

...provides sufficient data to:
✅ Confirm which resolutions were adopted on April 28-30
✅ Identify the key debate topics and their political salience
✅ Analyse coalition structure and likely voting patterns
✅ Assess geopolitical significance and risk vectors

The analysis must be appropriately hedged on voting margin precision (predicted rather than confirmed tallies).

---

## IMF Economic Context Assessment

**IMF data query result:** Not queried via imf-mcp-probe.sh this run.

**Relevance assessment:** The April 28-30 legislative package is primarily geopolitical and procedural:
- Ukraine accountability resolution: IMF data not primary (foreign policy instrument)
- DMA enforcement: Competition policy; no direct GDP/inflation metric required
- Armenia resilience: Geopolitical; IMF context optional
- MFF 2028-2034 debate: Budgetary policy; IMF growth projections would enhance analysis

**IMF requirement classification:** `not_required` for core geopolitical resolutions; `optional_enhancement` for MFF analysis

**Note:** IMF SDMX 3.0 REST API at dataservices.imf.org was not queried. For a full-depth analysis of the Middle East energy-fertilizer debate (April 29), IMF commodity price data and World Economic Outlook projections would be relevant. This is a data gap that could be addressed in a subsequent analysis run.

---

## Prior Run Merge Check

**Prior runs today:** None detected (first run of the day)  
**manifest.json.history[]:** Empty — fresh run  
**Prior run diff:** Not applicable

---

## Stage A Completion Summary

**Data collected:**
- ✅ 51 adopted texts from 2026 (all years via fallback)
- ✅ 30 most recent adopted texts identified and ranked by salience
- ✅ April 28-30 plenary debates mapped via speeches feed
- ✅ Political landscape: 719 MEPs, 9 groups, seat shares confirmed
- ✅ Coalition dynamics: structural analysis completed
- ✅ Early warning: stability score 84/100

**Data not collected (noted gaps):**
- ❌ Roll-call vote tallies for April 28-30 (EP publication lag)
- ❌ Full adopted text content for TA-10-2026-0160/0161/0162 (content not yet available)
- ❌ Event feed data (API error)

**Stage A completion time:** ~4 minutes (within budget)
