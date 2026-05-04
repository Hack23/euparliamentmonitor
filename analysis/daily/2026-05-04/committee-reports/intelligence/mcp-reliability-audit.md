<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EP Committee Reports Run 2026-05-04

**Article Type:** committee-reports | **Date:** 2026-05-04
**Purpose:** Runtime audit of MCP server reliability during this run

---

## MCP Server Status Summary

| Server | Status | Notes |
|--------|--------|-------|
| european-parliament | ✅ PARTIAL — direct endpoints working; feeds down | |
| world-bank | ⚠️ NOT PROBED — no WB indicators collected | committee-reports not WB-primary |
| memory | ✅ AVAILABLE | Used for run-scoped scratch |
| sequential-thinking | ✅ AVAILABLE | Used for structured reasoning |
| IMF (via proxy) | 🔴 UNAVAILABLE | Proxy timeout (exit 28) |

---

## EP MCP Server — Tool-Level Audit

| Tool | Called | Status | Latency estimate | Data quality |
|------|--------|--------|-----------------|-------------|
| get_adopted_texts | ✅ Yes | SUCCESS | ~5-10s | 9 items; GOOD |
| get_committee_documents_feed | ✅ Yes | FAILURE | N/A | EP API error-in-body |
| get_events_feed | ✅ Yes | FAILURE | N/A | EP API error-in-body |
| get_procedures_feed | ✅ Yes | SUCCESS (partial) | ~20s | Historical data; FAIR |
| get_plenary_sessions | ✅ Yes | SUCCESS | ~5s | Jan-Feb 2026 data; FAIR |
| track_legislation | ✅ Yes | SUCCESS | ~10s | Full timeline; GOOD |
| analyze_committee_activity | ✅ Yes | SUCCESS (limited) | ~10s | Zero meeting counts; POOR |
| get_voting_records | ✅ Yes | SUCCESS (empty) | ~5s | Empty (API delay); EXPECTED |
| get_parliamentary_questions | ✅ Yes | SUCCESS (limited) | ~10s | Pending/no content; FAIR |

**EP API overall reliability this run: 🟡 PARTIAL (7/9 tools returned some data; 2 feed endpoints failed)**

---

## Known API Limitations Encountered

### 1. Feed endpoints failing
- `get_committee_documents_feed` → "EP API returned an error-in-body response"
- `get_events_feed` → "EP API returned an error-in-body response"
- **Impact:** No real-time committee meeting events data; no real-time committee document changes
- **Workaround used:** Direct endpoint `get_adopted_texts` with year filter — sufficient for this run's scope

### 2. Voting records API delay
- `get_voting_records` for 2026-04-27 to 2026-05-04 returned empty
- **Known issue:** EP publishes roll-call voting data with 2-4 week delay
- **Impact:** No voting margin data for any of the 9 adopted texts
- **Workaround:** Coalition analysis based on political group positions (structural analysis)

### 3. Committee activity meeting counts
- `analyze_committee_activity` returned 0 for meeting counts across BUDG, ITRE, AFET, LIBE
- **Likely issue:** API endpoint returns metadata without populated meeting count fields
- **Impact:** Committee productivity analysis based on plenary outputs only (not committee meetings)

### 4. IMF proxy timeout
- IMF probe returned `available: false` (curl exit 28: Proxy CONNECT aborted)
- **Impact:** No live economic data; all economic analysis qualitative/structural
- **See:** `cache/imf/probe-summary.json`

### 5. Procedures feed — historical ordering
- `get_procedures_feed` (one-week) returned mostly metadata without current-week detail
- **Known issue:** EP procedures feed sometimes returns historical-tail ordering
- **Impact:** Limited current-week procedure tracking
- **Workaround:** Used `track_legislation` for specific procedure IDs identified via `get_adopted_texts`

---

## Data Quality Assessment

### High-quality data (GOOD)
- `get_adopted_texts` (year=2026): 9 items with metadata, dates, URLs — PRIMARY DATA SOURCE ✅
- `track_legislation` (2025-2246, 2026-2596): Full timeline, committee opinions, vote dates ✅

### Fair-quality data (FAIR)
- `get_procedures_feed`: Some current-week data but incomplete
- `get_plenary_sessions`: January-February sessions only (no April-May data yet)

### Poor/empty data (POOR — documented but accepted)
- `get_voting_records`: Empty (API delay — expected behavior, documented)
- `analyze_committee_activity`: Meeting counts = 0 (API limitation)
- `get_parliamentary_questions`: Pending status, no content

### Unavailable data (FAIL — documented)
- `get_committee_documents_feed`: API error
- `get_events_feed`: API error
- IMF economic data: Proxy timeout

---

## Recommendations for Future Runs

1. **IMF probe first:** Execute IMF probe within first 2 minutes of Stage A to allow more time for error handling
2. **Feed endpoint fallback:** Always have direct endpoint fallback ready for committee_documents_feed and events_feed
3. **Voting records:** Never expect voting data for the past 1-4 weeks; always plan for structural coalition analysis
4. **Committee activity:** Until API is fixed, always supplement with plenary output analysis

---

## Run Reliability Rating

**Overall data reliability: 🟡 MEDIUM-FAIR**
- Sufficient data for TIER 1 analysis of adopted texts
- Economic context limited by IMF unavailability
- Committee-level granularity limited by API failures
- Core evidence base (9 adopted texts + 2 procedure timelines) is SOLID
