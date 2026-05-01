<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EP Motions, 2026-05-01

**Classification:** UNCLASSIFIED // EU PUBLIC
**Purpose:** Document EP MCP server tool performance and data quality for this run

---

## Server Configuration

| Parameter | Value |
|-----------|-------|
| EP MCP Gateway | `http://host.docker.internal:8080/mcp/european-parliament` |
| Server version | `european-parliament-mcp-server@1.2.18` |
| Run date | 2026-05-01 |
| Article type | `motions` |

---

## Tool Invocations

| Tool | Status | Data Quality | Notes |
|------|:------:|:------------:|-------|
| `get_adopted_texts_feed(timeframe:"one-week")` | 🟢 OK | 🟡 MED | 50+ texts returned; recent texts show `DATA_UNAVAILABLE` on deep-fetch |
| `generate_political_landscape()` | 🟢 OK | 🟢 HIGH | 719 MEPs, 9 groups, full composition data |
| `get_voting_records(dateFrom, dateTo)` | 🟡 EMPTY | 🔴 LOW | Empty array — known 4-6 week publication delay |
| `get_plenary_sessions(dateFrom, dateTo)` | 🟡 DEGRADED | 🟡 MED | Date filter returns 0; without dates returns 10 sessions (Jan-Feb 2026) |
| `analyze_coalition_dynamics()` | 🟢 OK | 🟡 MED | Structural data only; no vote-level cohesion (API limitation) |
| `early_warning_system(sensitivity:"high")` | 🟢 OK | 🟡 MED | MEDIUM risk, stability=84, 1 HIGH warning (EPP dominance) |
| `get_adopted_texts(year:2026, limit:50)` | 🟢 OK | 🟢 HIGH | Full 2026 adopted texts list including April 28-30 metadata |
| `get_speeches(dateFrom:"2026-04-24")` | 🟢 OK | 🟡 MED | 20+ speeches returned from April 27 plenary |
| `get_all_generated_stats(2024-2026)` | 🟢 OK | 🟢 HIGH | Comprehensive EP statistics 2004-2026 |
| `monitor_legislative_pipeline()` | 🟡 DEGRADED | 🟡 MED | Returns 0 with status filter; limited data without filter |
| `get_adopted_texts(docId:"TA-10-2026-0105")` | 🔴 FAIL | 🔴 N/A | `DATA_UNAVAILABLE` — indexed but content not yet in portal |
| `get_adopted_texts(docId:"TA-10-2026-0160")` | 🔴 FAIL | 🔴 N/A | `DATA_UNAVAILABLE` |
| `get_adopted_texts(docId:"TA-10-2026-0161")` | 🔴 FAIL | 🔴 N/A | `DATA_UNAVAILABLE` |
| `track_legislation("2025/2171(IMM)")` | 🟢 OK | 🟢 HIGH | Jaki immunity procedure timeline confirmed |

---

## IMF Probe Result

| Probe | Status | Impact |
|-------|:------:|--------|
| `scripts/imf-mcp-probe.sh` | 🔴 UNAVAILABLE | IMF data unavailable; degraded mode activated; waiver applies to `motions` type |

**IMF probe summary path:** `analysis/daily/2026-05-01/motions/cache/imf/probe-summary.json`

---

## Data Quality Issues

### Issue 1: Voting Records Publication Delay (KNOWN)
**Severity:** 🟡 MEDIUM  
**Tool:** `get_voting_records`  
**Description:** EP publishes roll-call voting data with 4-6 week delay. April 28-30 data expected ~May 28–June 14, 2026.  
**Impact:** All vote margin estimates are structural inference only (🟡 MEDIUM confidence)  
**Mitigation:** EP Open Data Portal fallback activated; data gap documented in `voting-patterns.md`

### Issue 2: Deep-Fetch Unavailability for April 28-30 Adopted Texts
**Severity:** 🟡 MEDIUM  
**Affected texts:** TA-10-2026-0105, TA-10-2026-0160, TA-10-2026-0161, TA-10-2026-0162  
**Description:** Texts indexed in EP API but full content not yet available. Returns `DATA_UNAVAILABLE` (404).  
**Impact:** Motion content analysis based on title, subject codes, and procedure metadata only (🟡 MEDIUM confidence)  
**Mitigation:** Analysis supplemented with procedure tracking, speech analysis, and historical pattern inference

### Issue 3: Plenary Sessions Date Filter Non-Functional
**Severity:** 🟢 LOW  
**Tool:** `get_plenary_sessions(dateFrom, dateTo)`  
**Description:** Returns `filteredTotal:0` even when sessions exist in date range  
**Impact:** Limited — worked around by querying without date filter  
**Mitigation:** Used `get_plenary_sessions` without dates; cross-referenced with `get_adopted_texts`

### Issue 4: Legislative Pipeline Monitor Returns Zero
**Severity:** 🟢 LOW  
**Tool:** `monitor_legislative_pipeline(status:"ACTIVE")`  
**Description:** Returns 0 active procedures with status filter  
**Impact:** Pipeline velocity analysis based on indirect indicators  
**Mitigation:** Derived pipeline data from `get_procedures` and `get_adopted_texts`

---

## Feed Health Summary

| Feed | Health | Last Probed |
|------|:------:|-------------|
| `get_adopted_texts_feed` | 🟢 OK | This run |
| `get_meps_feed` | 🟢 OK | This run (current MEPs confirmed) |
| `get_procedures_feed` | 🟡 DEGRADED | Not probed this run (known slow feed) |
| `get_voting_records` | 🔴 UNAVAILABLE | This run (publication delay) |
| `get_events_feed` | 🟡 UNKNOWN | Not probed this run (slow feed warning) |

---

## Confidence Summary for Downstream Consumers

| Analysis Artifact | Confidence | Limiting Factor |
|-------------------|:----------:|-----------------|
| Political landscape composition | 🟢 HIGH | Direct API data |
| Jaki procedure timeline | 🟢 HIGH | `track_legislation` confirmed |
| Vote estimates (all motions) | 🟡 MEDIUM | No roll-call data; structural inference |
| Motion content analysis | 🟡 MEDIUM | Deep-fetch unavailable; metadata only |
| Economic impact analysis | 🔴 LIMITED | IMF unavailable |
| Coalition analysis | 🟡 MEDIUM | Historical patterns; no current vote data |

---

*Methodology: MCP Reliability Audit per `07-mcp-reference.md` §11 | Run: 2026-05-01 motions*
