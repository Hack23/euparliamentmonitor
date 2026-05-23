<!--
SPDX-FileCopyrightText: 2026 Hack23 AB
SPDX-License-Identifier: Apache-2.0
-->
# MCP Server Reliability Audit — Run 2026-05-08 breaking

## Server Status Summary

| Server | Status | Notes |
|--------|--------|-------|
| european-parliament | 🟡 PARTIALLY OPERATIONAL | Most tools working; procedures-feed timeout; adopted-text detail 404 |
| fetch-proxy (IMF) | 🔴 FAILED | McpError -1: fetch failed on all IMF SDMX endpoints |
| world-bank | ⬜ NOT TESTED | Not called in this run |
| memory | ⬜ NOT USED | Not applicable |
| sequential-thinking | ⬜ NOT USED | Analysis done via direct tool calls |

## EP MCP Tool Performance

| Tool | Result | Notes |
|------|--------|-------|
| get_adopted_texts_feed (today) | ✅ 9 items returned | Content of items 404 |
| get_adopted_texts_feed (one-week) | ✅ N/A (used today) | |
| get_adopted_texts (year=2026) | ✅ 41 total, 20+21 pages | Full data available |
| get_events_feed (today) | 🔴 UNAVAILABLE | EP API error response |
| get_plenary_sessions (year=2026) | ✅ 5 returned | Jan 2026 sessions |
| get_latest_votes | ✅ (empty) | No data for May 2026 week |
| get_voting_records | ✅ (empty) | EP publishing delay expected |
| get_procedures_feed | 🔴 TIMEOUT | McpError -32001 |
| get_parliamentary_questions | ✅ 11 returned | Meta-level only (no content) |
| early_warning_system | ✅ OPERATIONAL | Full analysis returned |
| generate_political_landscape | ✅ OPERATIONAL | Real MEP data |
| analyze_coalition_dynamics | ✅ OPERATIONAL | Size-proxy metrics only |
| monitor_legislative_pipeline | ✅ (empty pipeline) | API returns no active procedures |
| detect_voting_anomalies | ✅ (no anomalies) | Limited data basis |
| compare_political_groups | ✅ OPERATIONAL | Composition data only |

## IMF Fetch Proxy Failure Analysis

**Error:** McpError -1: fetch failed
**Attempted endpoints:**
1. `https://dataservices.imf.org/REST/SDMX_3.0/data/PGCS/A.EU+DE+FR.NGDPD?startPeriod=2024&endPeriod=2026` — FAILED
2. `https://dataservices.imf.org/REST/SDMX_3.0/data/WEO/A.EU.NGDP_RPCH?startPeriod=2024&endPeriod=2027` — FAILED

**Root cause assessment:** AWF sandbox network firewall may be blocking IMF SDMX API endpoints. The fetch-proxy server is operational but the outbound HTTP request fails at the Squid proxy allowlist level. IMF SDMX endpoints (`dataservices.imf.org`) may not be in the current AWF firewall allowlist.

**Impact on analysis:** Medium. EU/Eurozone GDP growth, inflation, and fiscal projections from IMF could not be confirmed with live data. Economic context in this run uses IMF WEO April 2025 published estimates as proxy (🟡 MEDIUM confidence).

**Recommended fix:** Add `dataservices.imf.org` to AWF firewall allowlist in network configuration.

## Data Quality Warnings from EP API

1. **Adopted text content (today's feed):** 9 texts indexed (TA-10-2026-0008 to -0015 + -0056) but API returns 404 on content. These are recently published texts; EP Open Data Portal has publication delay of hours-days.
2. **Voting records:** Empty for 2026-04-28 to 2026-05-08. EP publishes roll-call votes with several weeks delay. Normal.
3. **Procedures feed timeout:** The procedures/feed endpoint is documented as slow (can exceed 120s). This run hit the timeout.
4. **Coalition dynamics:** Per-MEP voting statistics unavailable from EP API — all cohesion/defection metrics null. Size-similarity proxy used instead.
5. **Events feed (today):** EP API returned error-in-body response.

## Confidence Assessment for This Run

| Analysis Area | Data Confidence | Notes |
|--------------|----------------|-------|
| Breaking news identification | 🟢 HIGH | From real EP adopted texts with dates |
| Political landscape | 🟢 HIGH | Real MEP counts from EP API |
| Coalition dynamics | 🟡 MEDIUM | Size proxy only, no vote data |
| Economic context | 🟡 MEDIUM | IMF API failed; prior publications used |
| Today's new texts (9 items) | 🔴 LOW | Indexed but content unavailable |
| Stakeholder analysis | 🟡 MEDIUM-HIGH | Analytical reconstruction from resolution IDs |
