# Data Availability Assessment — EU Parliament Motions, Week 18–25 May 2026

**Date**: 2026-05-25  
**Data Mode**: degraded-voting  
**Confidence**: 🟢 HIGH

---

## Summary

| Data Type | Status | Impact on Analysis |
|-----------|--------|-------------------|
| Adopted texts (year=2026) | 🟢 FULL | High quality primary dataset |
| Adopted texts feed (one-week) | 🟢 FULL | Confirmed motion identification |
| EP voting records | 🔴 EMPTY | Expected; EP publication delay |
| DOCEO XML (roll-call) | 🔴 UNAVAILABLE | Expected; week of May 22 not published |
| Plenary session metadata | 🟡 PARTIAL | Available but no detailed activity data |
| IMF economic data | 🟢 FULL | WEO April 2026 authoritative |
| World Bank country data | 🟢 FULL | 2025 estimates available |
| Pre-fetched feeds | 🟢 4/4 | Confirmed non-empty in prefetch-status.json |

## Data Mode Declaration

**Final dataMode**: `degraded-voting`

**Trigger applied**: EP roll-call voting data is unavailable for the plenary week of 19–20 May 2026. This is a structural limitation of the EP Open Data Portal (typical publication delay: 2–6 weeks). All other data feeds are functioning normally.

**Line-floor factor applied**: 0.80 (degraded-voting). However, all artifacts in this run were produced above the standard (1.00 factor) floors, making the 0.80 factor irrelevant for Stage C validation purposes.

## Data Completeness Score: 78/100

| Category | Score | Notes |
|----------|-------|-------|
| Motion identification | 100/100 | All 7 texts confirmed |
| Political group positions | 60/100 | Estimated from patterns; not confirmed |
| Economic context | 95/100 | IMF/WB authoritative |
| Historical context | 90/100 | EP term comparative data |
| Voting patterns | 30/100 | Estimates only; structural limitation |
| Procedural detail | 55/100 | Procedure references available; event details not deep-fetched |
| Media/public context | 65/100 | Framing analysis based on pattern projection |
