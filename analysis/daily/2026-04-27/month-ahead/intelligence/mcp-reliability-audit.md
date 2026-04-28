<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EP Month Ahead: April 27 – May 27, 2026

**Run Date:** 2026-04-27 | **Admiralty Grade:** B2
**Reference:**.github/prompts/07-mcp-reference.md §11 triage table (mandatory before filing issues)

---

## Audit Summary

| Tool | Status | Classification | Impact on Analysis |
|------|--------|---------------|-------------------|
| get_plenary_sessions (year filter) | ✅ OK | Expected behaviour | Full 2026 session list retrieved |
| get_plenary_sessions (dateFrom/dateTo) | 🟡 DEGRADED | hasMore:true with empty results | Workaround: used year filter instead |
| get_procedures_feed | 🟡 DEGRADED | §11 row #5: Recess mode | No current procedures; historical 1970–1987 returned |
| get_procedures | 🟡 DEGRADED | §11 row #5: Recess mode (same) | Same historical archive issue |
| get_events_feed | 🔴 UNAVAILABLE | §11 row #8: Slow feed / upstream error | No events data retrieved |
| get_adopted_texts_feed | ✅ OK | Expected behaviour | Data retrieved successfully |
| get_adopted_texts (year:2026) | ✅ OK | Expected behaviour | 50 adopted texts retrieved |
| get_voting_records | 🟡 EXPECTED GAP | §11 row #6: 4–6 week delay | Empty (expected — April 2026 not yet published) |
| get_speeches | 🟡 EXPECTED GAP | Publication delay | Empty (expected) |
| get_parliamentary_questions | ✅ OK | Expected behaviour | 20 items retrieved (metadata-only) |
| generate_political_landscape | ✅ OK | Expected behaviour | Full landscape data |
| analyze_coalition_dynamics | ✅ OK (limited) | Per-MEP data unavailable | Group-level proxy only (§11 row #2) |
| compare_political_groups | 🟡 LIMITED | §11 row #2: Per-MEP voting unavailable | All dimension scores = 0 |
| early_warning_system | ✅ OK | Expected behaviour | Warnings generated |
| get_plenary_documents_feed | 🔴 UNAVAILABLE | Upstream EP API error | No plenary documents feed |
| get_meeting_foreseen_activities | ✅ OK | Expected behaviour | 4-day activities retrieved |
| monitor_legislative_pipeline | 🟡 DEGRADED | Empty with LOW confidence | Enrichment data gap |

---

## Detailed Defect Analysis

### Defect 1: get_procedures_feed — Recess Mode (Historical Archive)
**Classification:** 🟡 KNOWN DEFECT — §11 row #5 (detectProceduresFeedRecessMode)
**Status:** Documented upstream defect; NOT to be filed as new issue

**Observed behaviour:** `get_procedures_feed(timeframe: "one-month")` returned procedures from
1970–1987 (historical archive) rather than current 2026 procedures. Same issue observed with
direct `get_procedures(limit:20)`.

**Root cause (per §11 row #5):** The EP Open Data Portal's procedures feed periodically returns
historical-archive content instead of current procedures. The EP MCP client
`detectProceduresFeedRecessMode` detects this pattern and adds `recessMode:true` + RECESS_MODE
`dataQualityWarning`. Not counted as a failure in client health metrics.

**Impact on analysis:** Current legislative procedures (CID, EU-US tariff trilogue) could not be
retrieved via feed. Mitigated by using `get_adopted_texts` (year:2026) for legislative status and
prior-run analysis for procedure context.

**Recommended action:** None (upstream EP API issue; tracked by european-parliament-mcp-server).

---

### Defect 2: get_events_feed — UNAVAILABLE
**Classification:** 🔴 UPSTREAM ISSUE — §11 row #8 (events feed slow/unavailable)
**Status:** Known slow-feed behaviour; potentially exceeds timeout

**Observed behaviour:** `get_events_feed(timeframe: "one-month")` returned UNAVAILABLE error.
Tool returned `{feed:[], slowFeedWarning:true}` per MCP client handling.

**Root cause (per §11 row #8):** The EP API `events/feed` endpoint is documented as
"significantly slower" than other feeds. One-month queries can exceed the 120-second extended
timeout. This is a known degraded state, not a regression.

**Impact on analysis:** Committee meetings, institutional events, and hearing schedules for the
30-day window could not be retrieved from events feed. Mitigated by:
- `get_meeting_foreseen_activities` for April 27–30 sessions (successful)
- Political landscape and coalition data as proxy for event context
- Prior run analysis for institutional calendar

**Recommended action:** None (documented upstream limitation; mitigation applied).

---

### Defect 3: compare_political_groups — Per-MEP Voting Data Unavailable
**Classification:** 🟡 DATA LIMITATION — §11 row #2 (per-MEP voting unavailable)
**Status:** Structural EP API limitation; NOT a defect in the MCP server

**Observed behaviour:** `compare_political_groups(groupIds: [...], dimensions: [...])` returned all
dimension scores = 0 (voting_discipline, activity_level, legislative_output, attendance, cohesion).

**Root cause (per §11 row #2):** The EP Open Data Portal does not expose per-MEP roll-call vote
positions through the public API. Coalition cohesion and voting discipline metrics require per-MEP
data. The MCP client acknowledges this by returning proxy/structural data.

**Impact on analysis:** All cohesion assessments in this run are group-level structural proxies
(seat-share ratio, institutional positioning) — NOT actual vote-level cohesion. WEP bands are
wider than they would be with per-MEP data. All analysis files note this explicitly.

**Recommended action:** Analyst flag — data quality disclosure in executive-brief.md and
coalition-dynamics.md (both done).

---

### Defect 4: get_plenary_documents_feed — UNAVAILABLE
**Classification:** 🔴 UPSTREAM ISSUE — feed unavailable at time of query
**Status:** May be transient (EP API intermittent)

**Observed behaviour:** `get_plenary_documents_feed` returned UNAVAILABLE error.

**Impact on analysis:** Cannot retrieve recent plenary session documents (agendas, amendments in
final form, session protocols). Mitigated by `get_meeting_foreseen_activities` and prior-run
plenary context.

**Recommended action:** Monitor — if persistent across multiple runs, file upstream issue.

---

## Functional Tool Assessment

### Tools that worked correctly and provided high-value data:
1. ✅ `generate_political_landscape` — 719 MEPs, full group data, majority threshold
2. ✅ `get_plenary_sessions(year:2026)` — Full session schedule; identified April + May sessions
3. ✅ `get_meeting_foreseen_activities` — April 27–30 detailed agenda
4. ✅ `get_adopted_texts(year:2026)` — 50 Q1 2026 legislative texts
5. ✅ `early_warning_system` — MEDIUM risk, HIGH fragmentation warning
6. ✅ `analyze_coalition_dynamics` — Structure data (proxy cohesion acknowledged)
7. ✅ `get_parliamentary_questions` — 20 questions (metadata level)
8. ✅ World Bank API — Germany GDP, France inflation, unemployment data

### Overall data quality assessment
**Coverage:** 🟡 PARTIAL — 70% of planned data sources accessible
**Confidence level:** 🟡 MEDIUM — structural data excellent; current procedure/event data gap
**Analysis validity:** 🟢 VALID — comprehensive political intelligence derivable from available data;
gaps documented and mitigated

---

## Triage Summary (per §11 — do NOT file new issues for documented items)

| Item | §11 Row | Action |
|------|---------|--------|
| procedures_feed recess mode | Row #5 | No action — known defect |
| events_feed slow/unavailable | Row #8 | No action — known slow feed |
| per-MEP voting unavailable | Row #2 | No action — structural EP API limitation |
| voting_records empty (April 2026) | Row #6 | No action — expected 4–6 week delay |

**Items requiring potential upstream action:** None in this run (plenary_documents_feed may be
monitored but is likely transient).

---

*Reference:.github/prompts/07-mcp-reference.md §11 triage table; analysis/templates/mcp-reliability-audit.md*
*Generated: 2026-04-27 | SPDX: Apache-2.0*
