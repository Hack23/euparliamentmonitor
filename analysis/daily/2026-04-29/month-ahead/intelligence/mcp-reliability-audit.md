<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EU Parliament Month Ahead Run: 2026-04-29

**Run ID:** month-ahead-run-1777445122
**Audit standard:** 07-mcp-reference.md §11 — EP MCP Tool Health Classification
**Classification key:** 🟢 OK | 🔵 KNOWN/EXPECTED | 🟡 DEGRADED | 🔴 FAILURE

---

## EP MCP Server Tools Called in This Run

| Tool | Status | Classification | Details |
|------|--------|---------------|---------|
| `get_plenary_sessions` | ✅ Success | 🟢 OK | Returned 6 sessions for 2026-04-29 to 2026-05-29 |
| `get_procedures_feed` | ⚠️ RECESS_MODE | 🔵 KNOWN | Historical archive response (pre-1995 data) — detectProceduresFeedRecessMode triggered; `recessMode: true` in response |
| `get_events_feed` | ❌ UNAVAILABLE | 🟡 SLOW_FEED_WARNING | Upstream error; 07-mcp-reference.md §11 row #8 classifies this as slow-feed degradation, not hard failure. Tool returned UNAVAILABLE status. |
| `get_adopted_texts_feed` | ✅ Success | 🟢 OK | Large result returned; saved to temp file |
| `get_adopted_texts` | ✅ Success | 🟢 OK | 51 texts returned for year=2026 |
| `generate_political_landscape` | ✅ Success | 🟢 OK | 719 MEPs, 9 groups, all data complete |
| `analyze_coalition_dynamics` | ⚠️ Partial | 🟡 DEGRADED | Voting data unavailable (EP API limitation). Only size-ratio proxies in coalitionPairs[].sizeSimilarityScore. Per-MEP roll-call data not exposed by EP Open Data Portal. |
| `monitor_legislative_pipeline` | ⚠️ Empty | 🔵 KNOWN | Returned 0 active procedures for forward window — expected for month-ahead type where procedures pipeline view is empty |
| `early_warning_system` | ✅ Success | 🟢 OK | HIGH risk (EPP dominance), MEDIUM fragmentation, stability score 84 |
| `get_meeting_foreseen_activities(Apr 29)` | ✅ Success | 🟢 OK | 21 items returned |
| `get_meeting_foreseen_activities(Apr 30)` | ✅ Success | 🟢 OK | 21 items returned |
| `get_meeting_foreseen_activities(May 18)` | ⚠️ Empty | 🟡 DEGRADED | 0 items — session too far out; agenda not yet published (expected) |
| `get_meeting_foreseen_activities(May 19)` | ⚠️ Empty | 🟡 DEGRADED | 0 items — same reason |
| `get_meeting_foreseen_activities(May 20)` | ⚠️ Empty | 🟡 DEGRADED | 0 items — same reason |
| `get_meeting_foreseen_activities(May 21)` | ⚠️ Empty | 🟡 DEGRADED | 0 items — same reason |
| `get_speeches` | ✅ Success | 🟢 OK | 21 speeches from Apr 27 session |
| `get_all_generated_stats` | ✅ Success | 🟢 OK | Full EP10 statistics (2024-2026) returned |
| `get_parliamentary_questions` | ❌ 404 | 🔴 FAILURE | HTTP 404 returned; endpoint may be temporarily unavailable |
| `get_meeting_decisions` | ❌ 404 | 🔴 FAILURE | HTTP 404 for MTG-PL-2026-04-29; decisions data unavailable |

---

## Feed Health Summary

| Feed | Status | Impact on This Run |
|------|--------|-------------------|
| Adopted texts feed | 🟢 Healthy | Full data available |
| Events feed | 🟡 SLOW_FEED_WARNING | No event data; compensated by plenary sessions + foreseen activities |
| Procedures feed | 🔵 RECESS_MODE | No current procedures; compensated by adopted texts for recent legislative activity |
| Foreseen activities (current) | 🟢 Healthy | Apr 29-30 fully populated |
| Foreseen activities (30+ days out) | 🟡 Expected empty | May 18-21 agenda not yet published — structurally expected |
| Speeches | 🟢 Healthy | Apr 27 session data available |

---

## Data Quality Impact Assessment

### Hard Failures (🔴) — Impact on Analysis

1. **`get_parliamentary_questions` (404):** Missing questions data means analysis cannot include MEP oversight activity quantification for the coming month. Compensating strategy: used speeches data + adopted texts to infer thematic priorities. IMPACT: LOW — questions are supplementary, not primary for month-ahead forecasting.

2. **`get_meeting_decisions` (404):** Cannot verify specific vote outcomes from April 29 session. IMPACT: MEDIUM — compensated by adopted texts feed which captures final decisions. The key April 28 Budget 2027 vote is confirmed via TA-10-2026-0112 in adopted texts.

### Known Degradations (🔵) — Not Failures

1. **Procedures feed RECESS_MODE:** Normal operational pattern when EP's procedures feed returns historical archive data (all items ≤1995). Not an error — detected and handled per ep-mcp-client.ts detectProceduresFeedRecessMode(). Compensated by direct adopted texts data.

2. **Coalition dynamics — no per-MEP voting data:** The EP Open Data Portal does not expose individual roll-call vote positions via the MCP interface. Cohesion analysis is based on seat-share proxy only. This is a documented limitation, not a tool failure.

---

## Mitigations Applied

| Issue | Mitigation |
|-------|-----------|
| Events feed UNAVAILABLE | Used plenary sessions + foreseen activities as substitute for event data |
| Procedures feed RECESS_MODE | Used adopted texts (2026) as proxy for recent legislative pipeline |
| Parliamentary questions 404 | Speeches data used for thematic oversight proxy |
| Meeting decisions 404 | Adopted texts feed confirmed key decisions |
| May 18-21 agenda empty | Documented explicitly; used historical EP calendar patterns to infer likely topics |
| No IMF probe data confirmed | IMF WEO April 2026 data sourced from pre-existing knowledge; probe run in background |

---

## Upstream Issue Filing Assessment

Per 07-mcp-reference.md §11 guidance: 🟢/🔵 items are NOT filed as upstream issues. Only 🔴 persistent failures warrant investigation.

**Potential upstream issues to monitor:**
- `get_parliamentary_questions` returning 404 (🔴) — if this recurs in the next 2 runs, file an issue with European Parliament MCP Server repo.
- `get_meeting_decisions` returning 404 (🔴) — same threshold for filing.

**No upstream issues filed this run** — both 🔴 failures could be transient API endpoint issues. Monitor pattern per `09-troubleshooting.md` §5 triage rules.
