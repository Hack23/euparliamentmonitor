<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Download Manifest — EU Parliament Breaking News — 2026-04-28

**Run:** breaking-run1777360024 | **Date:** 2026-04-28

---

## Stage A Data Collection Summary

All data collected via EU Parliament MCP Server (european-parliament-mcp-server@1.2.15).

---

## Tool Calls and Results

| # | Tool | Parameters | Result | Items | Status |
|---|------|-----------|--------|-------|--------|
| 1 | get_adopted_texts_feed | timeframe: today | 18 adopted texts | 18 | SUCCESS |
| 2 | get_plenary_sessions | dateFrom: 2026-04-27, dateTo: 2026-04-30 | 0 sessions | 0 | EXPECTED EMPTY |
| 3 | generate_political_landscape | (none) | Full landscape | 1 | SUCCESS |
| 4 | early_warning_system | sensitivity: high | 3 warnings | 3 | SUCCESS |
| 5 | analyze_coalition_dynamics | (none) | Coalition data | 1 | SUCCESS |
| 6 | get_adopted_texts | year: 2026, limit: 20 | 21 texts | 21 | SUCCESS |
| 7 | get_voting_records | dateFrom: 2026-03-01, dateTo: 2026-04-28 | 0 records | 0 | EXPECTED EMPTY |
| 8 | compare_political_groups | groupIds: all | All zeros | 1 | EXPECTED EMPTY |

---

## Data Quality Assessment

| Data Type | Availability | Completeness | Confidence |
|-----------|-------------|-------------|-----------|
| Adopted texts (current session) | HIGH | HIGH | B-1 |
| Political landscape | HIGH | HIGH | B-1 |
| Voting records (current) | NONE | 0% | N/A (EP delay) |
| Plenary session data | NONE | 0% | N/A (publication lag) |
| Coalition voting data | NONE | 0% | N/A (unavailable) |
| IMF economic data | NONE | 0% | N/A (MCP not connected) |

---

## Key Data Facts

- **Total EP group members:** 719 MEPs across 9 groups (April 2026)
- **Majority threshold:** 360/719 (absolute majority)
- **Working coalition:** EPP(185)+S&D(135)+Renew(77) = 397 seats (+37 buffer)
- **Adopted texts Q1 2026:** 21 items (pre-April session)
- **Breaking news texts:** 18 items from today's feed (TA-10-2026-0087 through TA-10-2026-0104)

---

## Data Files Written

- `analysis/daily/2026-04-28/breaking/data/stage-a-summary.json` — Stage A data (from prior run; still valid)

---

## Attribution

**Data Source:** European Parliament Open Data Portal (data.europarl.europa.eu) — CC BY 4.0
**MCP Server:** european-parliament-mcp-server@1.2.15
**Collection Date:** 2026-04-28 UTC
