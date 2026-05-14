# MCP Reliability Audit — EU Parliament Year Ahead 2026-2027
**Date:** 2026-05-14 | **Article Type:** year-ahead

---

## MCP Tool Call Inventory

| # | Tool | Status | Items | Notes |
|---|------|--------|-------|-------|
| 1 | `get_plenary_sessions` (2026) | ✅ | 50 sessions | Full year 2026 data |
| 2 | `get_procedures_feed` (one-month) | ✅ | ~20 procedures | Active procedures |
| 3 | `get_adopted_texts` (2026) | ✅ | 31 texts | Jan-Apr 2026 |
| 4 | `generate_political_landscape` | ✅ | 1 landscape | 717 MEPs, 9 groups |
| 5 | `monitor_legislative_pipeline` | ✅ | 0 active | No active 30-day procedures |
| 6 | `analyze_coalition_dynamics` | ✅ | Group data | Voting cohesion unavailable |
| 7 | `early_warning_system` | ✅ | 1 report | Stability 84/100 |
| 8 | `get_latest_votes` | ❌ | 0 | DOCEO XML unavailable |

---

## Pre-Fetched Feed Status

| Feed File | Size | Status |
|-----------|------|--------|
| documents-feed.json | 0 bytes | ❌ Empty |
| events-feed.json | 0 bytes | ❌ Empty |
| external-documents-feed.json | 0 bytes | ❌ Empty |
| procedures-feed.json | 0 bytes | ❌ Empty |

All pre-fetched files were empty — data collection relied entirely on direct MCP calls.

---

## Data Coverage Assessment

| Data Domain | Coverage | Confidence |
|-------------|----------|-----------|
| Parliamentary calendar | 🟢 HIGH | 50 sessions for 2026 |
| Political group composition | 🟢 HIGH | Real-time MEP data |
| Adopted texts | 🟡 MEDIUM | Jan-Apr 2026 only |
| Legislative procedures | 🟡 MEDIUM | One-month window |
| Voting records | 🔴 LOW | DOCEO XML unavailable |
| Events/hearings | 🔴 LOW | Events feed unavailable |
| Economic data | 🟡 MEDIUM | IMF WEO cited indirectly |

---

## Reliability Findings

1. **EP Open Data Portal**: Largely functional; primary endpoints returned expected data
2. **DOCEO XML**: Unavailable — no voting records retrieved; gap noted in analysis
3. **Events feed**: Unavailable — scheduled events not populated
4. **Pre-fetch pipeline**: All 4 pre-fetch files empty — potential pre-agent step failure or feed degradation

**Impact on analysis:** Year-ahead analysis is primarily qualitative and structural; voting record gap has limited impact. Events gap affects foreseen-activities fan-out (no activity-level data available).

---

## Tool Call Budget Compliance

- Total EP MCP calls: 8 (guideline: ≤5 after deducting pre-fetched feeds; slightly over due to unavailable data requiring fallbacks)
- Stage A time: ~4 minutes (within budget)
- Shell-safety violations: None detected

*Audit covers Stage A data collection only. MCP tools used per `07-mcp-reference.md` catalog.*
