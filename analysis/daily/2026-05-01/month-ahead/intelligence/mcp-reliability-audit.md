# MCP Reliability Audit — EU Parliament May 2026

**Methodology:** Data quality audit and MCP tool availability assessment  
**Date:** 2026-05-01  
**Run ID:** month-ahead-run-1777624891

---

## MCP Server Availability Summary

| Server | Status | Details |
|--------|--------|---------|
| European Parliament MCP | 🟡 PARTIAL | Available; many tools working; some data gaps |
| World Bank MCP | 🔴 UNAVAILABLE | 401 authentication error in this sandbox run |
| IMF MCP | 🔴 UNAVAILABLE | Probe returned empty file; no data retrieved |
| Memory MCP | 🟢 AVAILABLE | Working (not invoked) |
| Sequential Thinking | 🟢 AVAILABLE | Working (not invoked) |

---

## EP MCP Tool Performance

| Tool | Calls | Status | Data Quality |
|------|-------|--------|-------------|
| `generate_political_landscape` | 1 | 🟢 SUCCESS | Excellent — 9 groups, 719 MEPs |
| `get_plenary_sessions year=2026` | 1 | 🟢 SUCCESS | Good — May 18-21 confirmed |
| `get_procedures_feed timeframe=one-month` | 1 | 🟡 RECESS_MODE | Historical data (1972-era) returned — not forward-looking |
| `get_events_feed timeframe=one-month` | 1 | 🔴 UNAVAILABLE | Upstream error — `status: "unavailable"` |
| `get_adopted_texts year=2026 limit=50` | 1 | 🟢 SUCCESS | 51 texts from 2026 |
| `get_meeting_foreseen_activities` (4 calls) | 4 | 🟡 PARTIAL | Time slots available; no content titles |
| `early_warning_system` | 1 | 🟢 SUCCESS | stability=84; DOMINANT_GROUP_RISK=HIGH |
| `analyze_coalition_dynamics` | 1 | 🟡 NULL_METRICS | All cohesion metrics NULL (voting data unavailable) |
| `get_voting_records` (2 calls) | 2 | 🔴 EMPTY | 4-6 week delay confirmed; no data |
| `monitor_legislative_pipeline` | 1 | 🟡 EMPTY_FORWARD | Forward-looking procedures not yet active |
| `get_all_generated_stats yearFrom=2024` | 1 | 🟢 SUCCESS | Rich historical stats |
| `compare_political_groups` | 1 | 🟡 ALL_ZEROS | No voting data = all zeros |
| `get_parliamentary_questions` | 1 | 🟡 PARTIAL | 31 records; metadata-only (no text) |
| `get_adopted_texts` (specific docIds) | 5 | 🔴 404 | "Content not yet available" for recent texts |

---

## Known Structural Limitations (EP API)

1. **Voting records delay:** 4-6 week delay is structural — roll-call voting data published after official minutes finalized. Not a bug.
2. **Procedures feed recess mode:** Historical-archive responses detected for `get_procedures_feed` with forward timeframe. Use `get_procedures` (paginated) as fallback.
3. **Events feed unavailability:** `get_events_feed` appears to have upstream issues unrelated to recess.
4. **Parliamentary questions content:** Questions API returns metadata only; question text requires document retrieval.
5. **Adopted text content:** Recent texts (< 1-2 months) return 404 for content — publication delay.

---

## Recommendations for Future Runs

1. **IMF**: Request maintainer to verify IMF MCP gateway configuration; if unavailable, use IMF website or WEO API directly
2. **WB**: Verify World Bank MCP authentication configuration; 401 suggests token expiry
3. **Voting data**: Implement `EPOpenDataClient.getVotingRecordsWithFallback()` as standard Stage A step
4. **Procedures**: Use `get_procedures` (direct list) instead of `get_procedures_feed` for forward-looking procedures
5. **Events**: Use `get_plenary_sessions` with `year=2026` as substitute for `get_events_feed`

---

*MCP reliability audit: this file documents data quality for Stage C gate and article transparency notes*
