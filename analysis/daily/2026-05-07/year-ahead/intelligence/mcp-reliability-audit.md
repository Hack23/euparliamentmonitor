<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 🔍 MCP Reliability Audit — Year Ahead 2026-05-07

**Date:** 2026-05-07 | **Scope:** EP MCP + IMF probe reliability assessment for this run

---

## Tool Invocation Results

| Tool | Status | Notes |
|---|---|---|
| `generate_political_landscape` | ✅ SUCCESS | 719 MEPs, 9 groups, full political data |
| `analyze_coalition_dynamics` | ✅ SUCCESS (limited) | LOW confidence; no per-MEP data |
| `get_plenary_sessions` (year=2026) | ✅ SUCCESS | 33 sessions returned; complete calendar |
| `get_meeting_foreseen_activities` (May 18) | ✅ SUCCESS | 8 agenda items; complete |
| `get_meeting_foreseen_activities` (June+) | ⚠️ EMPTY | Future sessions return empty (data not yet published) |
| `get_adopted_texts` (2026) | ✅ SUCCESS | 119+ texts including Jan–April 2026 |
| `get_voting_records` (2026) | ⚠️ PARTIAL | Only Jan 2026 data; votes show 0 counts (EP data delay) |
| `get_latest_votes` (DOCEO) | ⚠️ EMPTY | No DOCEO XML published this week |
| `get_speeches` (Apr–May 2026) | ✅ SUCCESS | 20 speech records (metadata only; no text) |
| `early_warning_system` | ✅ SUCCESS | Stability 84, MEDIUM risk |
| `monitor_legislative_pipeline` | ⚠️ EMPTY | 0 active procedures; data gap |
| `get_procedures_feed` (one-month) | ⚠️ PARTIAL | Historical data returned; minimal metadata |
| `get_events_feed` (one-week) | ❌ ERROR | `status: unavailable` in response body |
| **IMF SDMX probe** | ❌ BLOCKED | Squid proxy CONNECT aborted; `available: false` |

---

## IMF Degraded Mode Status

🔴 **IMF UNAVAILABLE** — proxy timeout blocks `dataservices.imf.org`.
Per protocol: economic-context.md documents unavailability; Stage C grants IMF waiver.
Probe evidence: `analysis/daily/2026-05-07/year-ahead/cache/imf/probe-summary.json`

---

## Data Quality Impact

- Coalition analysis: Limited to structural (size-based) — no per-MEP voting cohesion
- Legislative pipeline: No active procedure tracking (API data gap)
- Voting record analysis: Jan 2026 only (EP data delay for recent months)
- Economic context: World Bank structural data + knowledge base only (no live IMF)

**Overall data quality: 🟡 MEDIUM** — political landscape, session calendar, and adopted texts are complete; voting cohesion, pipeline, and economic context are limited/degraded.
