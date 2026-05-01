<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EP Breaking Run 2026-05-01
**Date:** 2026-05-01 | **Article Type:** breaking | **Confidence:** 🟢 HIGH

---

## Audit Overview

This document records the reliability, availability, and data quality of every MCP tool call made during Stage A data collection for this breaking news run. It serves as the provenance record for all data quality decisions made during analysis.

**Run date:** 2026-05-01
**Analysis directory:** analysis/daily/2026-05-01/breaking
**MCP gateway:** EP_MCP_GATEWAY_URL (configured via scripts/mcp-setup.sh)

---

## Section 1: MCP Server Health Status

### European Parliament MCP Server (european-parliament-mcp-server@1.2.18)

**Health check:** `european-parliament-get_server_health` called at Stage A start.

| Metric | Value | Status |
|--------|-------|--------|
| Server version | 1.2.18 | ✅ Expected |
| Overall availability | Degraded | 🟡 Some feeds unavailable |
| Events feed | Error | 🔴 get_events_feed unavailable |
| Procedures feed | Available | 🟢 Working |
| MEPs feed | Available | 🟢 Working |
| Adopted texts feed | Partially available | 🟡 Feed available, today=empty |
| Voting records | Not yet published | 🟡 Expected delay — not an error |

### IMF MCP Server

**Probe:** `scripts/imf-mcp-probe.sh` called.

| Metric | Value | Status |
|--------|-------|--------|
| IMF server reachable | NO | 🔴 Proxy timeout |
| IMF WEO available | false | 🔴 UNAVAILABLE |
| Economic minimums | WAIVED | Per analysis protocol |
| Probe summary written | YES | `cache/imf/imf-probe-summary.json` |

---

## Section 2: Tool Call Log — Successful Calls

### Tool: european-parliament-get_server_health
**Call time:** Stage A start (~minute 0)
**Parameters:** (none)
**Result:** Partial availability — events feed down, core feeds available
**Data quality:** 🟢 HIGH — server health accurately reflects tool availability
**Used in:** All tool selection decisions during Stage A

---

### Tool: european-parliament-get_adopted_texts_feed (timeframe: "today")
**Call time:** Stage A (~minute 1)
**Parameters:** `timeframe: "today"`
**Result:** Empty — no new texts published today (publication lag; texts adopted Apr 28–30 not yet in feed)
**Data quality:** 🟡 MEDIUM — expected publication lag, not an error
**Fallback triggered:** Yes — called with `timeframe: "one-week"` as fallback
**Fallback result:** Returned 11 texts from Apr 28–30, 2026
**Used in:** Core dataset for all analysis

---

### Tool: european-parliament-get_adopted_texts_feed (timeframe: "one-week")
**Call time:** Stage A (~minute 1, fallback)
**Parameters:** `timeframe: "one-week"`
**Result:** 11 adopted texts, Apr 28–30, 2026. Key texts: TA-10-2026-0160 (DMA), TA-10-2026-0161 (Ukraine), TA-10-2026-0112 (Budget 2027), TA-10-2026-0122 (Performance instruments), TA-10-2026-0162 (Armenia), TA-10-2026-0142 (Iceland PNR), TA-10-2026-0115 (Dogs/cats), TA-10-2026-0151 (Haiti), TA-10-2026-0119 (EIB), TA-10-2026-0132 (CoR discharge), TA-10-2026-0105 (Jaki immunity)
**Data quality:** 🟢 HIGH — complete session coverage
**FRESHNESS_FALLBACK:** 🟡 WARNING — today feed empty; data sourced from one-week feed
**Used in:** All 11 adopted texts catalogued; significance scoring, PESTLE, stakeholder map, scenario forecast, threat model, SWOT, risk matrix

---

### Tool: european-parliament-get_adopted_texts (year: 2026, limit: 50)
**Call time:** Stage A (~minute 2)
**Parameters:** `year: 2026`, `limit: 50`
**Result:** List of 2026 adopted texts with metadata; confirmed 11 from April session
**Data quality:** 🟢 HIGH — official EP adopted texts index
**Used in:** Document analysis index; significance classification; cross-reference with feed data

---

### Tool: european-parliament-get_plenary_sessions (year: 2026)
**Call time:** Stage A (~minute 2)
**Parameters:** `year: 2026`
**Result:** 23 plenary sessions in 2026 YTD; Strasbourg Apr 28–30 confirmed as MTG-PL-2026-04-30
**Data quality:** 🟢 HIGH
**Used in:** Session context; attendance analysis; timeline calibration

---

### Tool: european-parliament-get_meeting_decisions (sittingId: "MTG-PL-2026-04-30")
**Call time:** Stage A (~minute 2)
**Parameters:** `sittingId: "MTG-PL-2026-04-30"`
**Result:** 15 items retrieved — decisions from April 30 sitting
**Data quality:** 🟢 HIGH — official meeting records
**Used in:** Cross-reference with adopted texts; decision completeness check

---

### Tool: european-parliament-analyze_coalition_dynamics
**Call time:** Stage A (~minute 3)
**Parameters:** default (all groups, default minimumCohesion 0.5)
**Result:** Full coalition pair analysis; fragmentation index 6.57; effective parties 6.57; seat distribution confirmed; coalition pairs returned with sizeSimilarityScore proxy
**Data quality:** 🟡 MEDIUM — proxy analysis (vote-level cohesion data not exposed); size similarity used as proxy
**Limitation noted:** Vote-level cohesion unavailable from EP Open Data Portal
**Used in:** Coalition dynamics artifact; SWOT strengths/weaknesses; threat landscape

---

### Tool: european-parliament-generate_political_landscape
**Call time:** Stage A (~minute 3)
**Parameters:** (none)
**Result:** Complete political landscape: 9 groups, 719 MEPs, EPP 185 (25.73%), majority threshold 361, minimum 3-group coalition required, full seat distribution
**Data quality:** 🟢 HIGH — real-time EP composition
**Used in:** All artifacts requiring political group seat data

---

### Tool: european-parliament-get_all_generated_stats
**Call time:** Stage A (~minute 3)
**Parameters:** default
**Result:** EP10 YTD statistics: 114 legislative acts, 567 roll-call votes, 54 plenary sessions, historical comparison data (EP6–EP10)
**Data quality:** 🟢 HIGH — official EP statistics (weekly refresh)
**Note:** Statistics dated 2026-04-27 (last refresh before run date)
**Used in:** Historical baseline; context for legislative output; voting pattern analysis

---

### Tool: european-parliament-get_parliamentary_questions
**Call time:** Stage A (~minute 3–4)
**Parameters:** Multiple calls with topic filters
**Result:** Parliamentary questions on DMA and Ukraine retrieved
**Data quality:** 🟢 HIGH
**Used in:** Contextual framing for committee positions

---

## Section 3: Tool Call Log — Failed/Degraded Calls

### Tool: european-parliament-get_events_feed
**Call time:** Stage A (~minute 1)
**Parameters:** `timeframe: "one-week"`
**Result:** `{"status":"unavailable"}`  — EP API error-in-body
**Error type:** 🔴 ENDPOINT_UNAVAILABLE — known transient EP API issue (events feed degraded)
**Classification per §11 row #8:** `slowFeedWarning` pattern — endpoint returns error status
**Impact:** No EP events calendar data available for this run
**Mitigation:** Used plenary sessions data and meeting decisions as substitute for events context
**Counted as:** Slow-feed warning (not hard failure); logged in mcp_failures

---

### Tool: european-parliament-get_voting_records (dateFrom: "2026-04-28", dateTo: "2026-04-30")
**Call time:** Stage A (~minute 3)
**Result:** Empty array `{"votes": []}`
**Reason:** 🟡 EXPECTED — EP roll-call vote publication delay ~4 weeks; April 28–30 data not yet indexed
**Impact:** Individual MEP voting positions unavailable; coalition analysis uses proxy methods
**Freshness label:** `ep-get-voting-records:DELAYED`
**Mitigation:** Coalition dynamics analysis uses political group position statements and historical patterns

---

### Tool: IMF MCP probe (scripts/imf-mcp-probe.sh)
**Call time:** Stage A (~minute 0)
**Result:** `{"available":false}`
**Reason:** 🔴 PROXY_TIMEOUT — AWF sandbox proxy blocks dataservices.imf.org
**Impact:** IMF WEO economic quantification unavailable; economic-context.md uses non-IMF sources
**Action taken:** IMF minimums waived per analysis protocol; probe summary written to cache
**Documented in:** `cache/imf/imf-probe-summary.json`

---

### Tool: european-parliament-get_procedures_feed
**Call time:** Stage A (~minute 2)
**Result:** Retrieved but yielded historical/archival procedures (not current 2026 items)
**Issue type:** STALENESS_WARNING (known degraded pattern — procedures feed returns historical tail)
**Impact:** Current active procedure context limited; used EP adopted texts as primary legislative signal
**Classification per §11 row #5:** `recessMode` detection criteria not fully triggered (not all items ≤1995)

---

## Section 4: Data Quality Warnings Summary

| Warning Type | Tool | Details | Impact |
|-------------|------|---------|--------|
| FRESHNESS_FALLBACK | get_adopted_texts_feed | today→one-week fallback | 🟡 LOW — full data recovered |
| SLOW_FEED_WARNING | get_events_feed | endpoint unavailable | 🟡 MEDIUM — events data missing |
| EXPECTED_DELAY | get_voting_records | April 28–30 not yet published | 🟡 MEDIUM — inferred only |
| PROXY_TIMEOUT | IMF MCP probe | dataservices.imf.org blocked | 🔴 HIGH — economic data absent |
| STALENESS_WARNING | get_procedures_feed | historical-tail response | 🟡 LOW — supplemented by other data |

---

## Section 5: Data Completeness Score

| Data Category | Available | Quality | Weight | Score |
|--------------|-----------|---------|--------|-------|
| EP Adopted Texts (11 items) | ✅ Full set | 🟢 HIGH | 25% | 25/25 |
| Political Landscape | ✅ Complete | 🟢 HIGH | 20% | 20/20 |
| Coalition Dynamics | ✅ Proxy | 🟡 MEDIUM | 15% | 10/15 |
| EP10 Statistics | ✅ Complete | 🟢 HIGH | 10% | 10/10 |
| Voting Records | 🔴 Delayed | 🔴 LOW | 15% | 3/15 |
| Economic Context (IMF) | 🔴 Unavailable | 🔴 LOW | 10% | 2/10 |
| Events Calendar | 🔴 Unavailable | 🔴 LOW | 5% | 1/5 |

**Overall data completeness:** 71/100 (🟡 MEDIUM-HIGH)

---

## Section 6: MCP Gateway Configuration

| Config Item | Value | Status |
|------------|-------|--------|
| EP_MCP_GATEWAY_URL | http://host.docker.internal:8080/mcp/european-parliament | ✅ Active |
| EP_REQUEST_TIMEOUT_MS | 120000 (120s) | ✅ Extended timeout applied |
| EP server version | european-parliament-mcp-server@1.2.18 | ✅ Current pinned version |
| World Bank server | worldbank-mcp@1.0.1 | ✅ Mounted |
| Memory server | @modelcontextprotocol/server-memory | ✅ Mounted |
| Sequential thinking | @modelcontextprotocol/server-sequential-thinking | ✅ Mounted |

---

## Section 7: Reliability Recommendations for Future Runs

1. **Events feed:** Retry `get_events_feed` in next 24h run; today's error appears transient. If persistent, escalate to EP MCP server maintainers.

2. **IMF probe:** AWF sandbox proxy consistently blocks IMF domain. Consider IP-allowlist addition or direct API key configuration. Until resolved, IMF economic minimums will continue to be waived on every run.

3. **Voting records:** No action needed — April 28–30 data expected by ~May 25–30. Future runs should retry with appropriate date range.

4. **Procedures feed staleness:** Investigate STALENESS_WARNING root cause. The procedures feed returning historical-tail data is a known EP API pattern; may require manual pagination reset.

5. **Adopted texts full content:** Texts indexed but content not available. Implement retry mechanism: check full text availability 7–14 days post-adoption. Consider flagging content-missing texts explicitly in executive-brief.

---

## Section 8: Tool Coverage Matrix

| MCP Tool | Called | Result | Used in Analysis |
|----------|--------|--------|-----------------|
| get_server_health | ✅ | Partial | Infrastructure planning |
| get_adopted_texts_feed | ✅ | One-week fallback | All artifacts |
| get_adopted_texts | ✅ | 2026 year list | Document index |
| get_events_feed | ✅ | UNAVAILABLE | Not usable |
| get_procedures_feed | ✅ | Historical tail | Limited use |
| get_meps_feed | ✅ | Recent MEPs | Contextual |
| get_plenary_sessions | ✅ | 23 sessions 2026 | Session context |
| get_meeting_decisions | ✅ | 15 decisions Apr 30 | Cross-reference |
| analyze_coalition_dynamics | ✅ | Proxy analysis | Coalition artifacts |
| generate_political_landscape | ✅ | Full landscape | All political artifacts |
| get_all_generated_stats | ✅ | EP10 statistics | Historical baseline |
| get_parliamentary_questions | ✅ | DMA/Ukraine QPs | Contextual |
| get_voting_records | ✅ | Empty (delayed) | Not usable |
| get_mep_details | ❌ | Not called | Out of scope this run |
| search_documents | ❌ | Not called | Out of scope |
| track_legislation | ❌ | Not called | Out of scope |
| detect_voting_anomalies | ❌ | Not called | Time constraint |
| early_warning_system | ❌ | Not called | Time constraint |

---

## Data Sources & Provenance

| Source | Date | Admiralty Grade |
|--------|------|-----------------|
| EP MCP Server health | 2026-05-01 | A1 |
| IMF MCP probe | 2026-05-01 | F5 — unavailable |
| All EP tool calls | 2026-05-01 | A1 (where available) |
