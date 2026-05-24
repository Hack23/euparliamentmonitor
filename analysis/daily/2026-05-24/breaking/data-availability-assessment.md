# Data Availability Assessment — Breaking News Run 2026-05-24

**Article Type**: breaking  
**Run Date**: 2026-05-24  
**Data Mode**: degraded-feeds  
**Prefetch Mode**: degraded-feeds (3 fetched, 3 placeholders, 6 total feeds)  
**Line-Floor Factor**: 0.80

---

## Feed Status Summary

| Feed | Status | Items | Notes |
|------|--------|-------|-------|
| adopted-texts-feed | ✅ Available | 500 (disk) + 50 (live MCP) | FRESHNESS_FALLBACK: augmented with year=2026 query |
| meps-feed | ✅ Available | 484 MEPs | Current active MEPs with memberships |
| events-feed | ❌ Unavailable | 0 | 404 from EP API v2.1 endpoint |
| procedures-feed | ❌ Unavailable | 0 | 404 from EP API v2.1 endpoint |
| committee-documents-feed | ❌ Unavailable | 0 | 404 from EP API v2.1 endpoint |
| documents-feed | ❌ Unavailable | 0 | 404 from EP API v2.1 endpoint |

## Live MCP Calls (Stage A)

| Call | Tool | Result |
|------|------|--------|
| 1 | get_adopted_texts_feed(today) | 50 items (FRESHNESS_FALLBACK) |
| 2 | get_events_feed(today) | UNAVAILABLE (404) |
| 3 | get_procedures_feed(one-week) | 50 items (DEGRADED mode, historical) |
| 4 | get_plenary_sessions(2026-05-19 to 2026-05-24) | 0 results |
| 5 | get_latest_votes(2026-05-20) | UNAVAILABLE (DOCEO XML not yet published) |

## Data Quality Assessment

### Admiralty Grading

| Source | Reliability | Credibility | Grade |
|--------|-------------|-------------|-------|
| EP Adopted Texts (official) | A — Completely reliable | 1 — Confirmed | A1 |
| MEPs Feed (official) | A — Completely reliable | 1 — Confirmed | A1 |
| Events (unavailable) | F — Cannot be judged | 6 — Truth cannot be judged | F6 |
| Voting records (DOCEO) | B — Usually reliable | 3 — Possibly true | B3 |

### Breaking News Availability

The most recent plenary session for which data is available occurred on **20 May 2026** (Strasbourg session). Eight adopted texts from the May 19-20 session are confirmed:

1. **TA-10-2026-0166** — Immunity waiver: Nikos Pappas (19 May 2026)
2. **TA-10-2026-0168** — Forest reproductive material legislation (19 May 2026)
3. **TA-10-2026-0174** — EU–Uzbekistan Enhanced Partnership and Cooperation Agreement (20 May 2026)
4. **TA-10-2026-0177** — EU–Lebanon Eurojust Agreement (20 May 2026)
5. **TA-10-2026-0178** — EC–São Tomé and Príncipe Fisheries Partnership 2025-2029 (20 May 2026)
6. **TA-10-2026-0179** — EU–Cook Islands Sustainable Fisheries Partnership 2025-2032 (20 May 2026)
7. **TA-10-2026-0182** — Recommendation on 81st UNGA session (20 May 2026)
8. **TA-10-2026-0183** — AI strategy for EU trade (20 May 2026)

No plenary session is scheduled or recorded for 21-24 May 2026 (recess/committee week).

## Degradation Impact Analysis

The absence of the procedures feed, events feed, and committee documents feed constrains analysis in several ways:

- **Procedural context**: Cannot confirm current legislative stage for referenced procedures
- **Event verification**: Cannot cross-reference against scheduled committee hearings or intergroup meetings
- **Document depth**: Cannot access full text of adopted resolutions through feed; titles and references only
- **Coalition signals**: Voting breakdown by political group unavailable from DOCEO XML for the May session

These constraints are reflected in line-floor reductions (×0.80) and degraded voting-patterns artifact selection. Structural requirements (Mermaid diagrams, Admiralty grading, scenario forecasting) remain at full depth.

## IMF Data Status

IMF economic context data accessed via world-bank proxy. EU-wide macroeconomic indicators integrated into economic-context artifact. IMF data availability: **AVAILABLE** for key metrics (GDP growth, inflation, trade balance). The AI-trade nexus central to TA-10-2026-0183 analysis draws on IMF World Economic Outlook April 2026 projections.

## Mitigation Measures Taken

1. Used `adopted-texts-feed` year=2026 fallback to ensure 2026 completeness
2. Cross-referenced MEPs feed against political group composition for coalition analysis
3. Applied April-May 2026 voting record proxy from plenary session documents (pre-DOCEO publication)
4. Flagged all data gaps with explicit confidence labels in intelligence artifacts

**Final dataMode declaration**: `degraded-feeds`
