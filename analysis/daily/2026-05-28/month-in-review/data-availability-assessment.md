# Data Availability Assessment — Month in Review (April 28 – May 28, 2026)

**Generated:** 2026-05-28T11:35:00Z  
**Run ID:** month-in-review-run268-1779967929  
**Data Mode:** `degraded-feeds` (factor 0.80)

---

## Feed Availability Summary

| Feed | Status | Items | Notes |
|------|--------|-------|-------|
| `adopted-texts-feed.json` | ✅ Available | 500+ (125 for 2026) | Primary legislative output — high value |
| `procedures-feed.json` | ❌ 404 Error | 0 | `/api/v2/procedures/?view-version=v2.1` unavailable |
| `events-feed.json` | ❌ 404 Error | 0 | `/api/v2/events/?view-version=v2.1` unavailable |
| `documents-feed.json` | ❌ 404 Error | 0 | `/api/v2/documents/?view-version=v2.1` unavailable |
| DOCEO roll-call votes | 🕒 Expected lag | 0 | 2–4 week publication delay — not a failure |
| IMF SDMX data | 🟡 Degraded | Limited | World Bank EU country not found; proxy data used |

## Data Mode Declaration

**`degraded-feeds`** — Three of four primary EP feed endpoints returned HTTP 404 from the
`v2.1` view-version API layer. The adopted-texts feed functioned correctly and provides
substantial legislative output data (101+ items for 2026, with ~40 items adopted in the
April 28 – May 28 window). The Stage A fallback protocol was followed per Rule 2a:
- `get_adopted_texts(year=2026)` called once (MCP call 1) — primary substantive data
- `get_plenary_sessions(dateFrom=2026-04-28)` called — confirmed session data (MCP call 2)
- `analyze_coalition_dynamics(dateFrom=2026-04-28)` called — political group data (MCP call 3)

## Analytical Confidence

🟡 **MEDIUM** — The degraded-feeds mode reduces line-floor thresholds by 20% but does not
impair analysis of legislative output, which is the primary source for month-in-review
articles. The adopted texts data provides comprehensive coverage of parliamentary actions
adopted during April 28 – May 28, 2026.

## Fallback Measures Applied

1. Direct `get_adopted_texts(year=2026, limit=100)` endpoint used in place of procedures-feed
2. Political group composition drawn from live MEP records (718 MEPs across 9 groups)
3. Economic context sourced from World Bank developmental indicators and EU baseline
4. Voting patterns declared degraded due to DOCEO XML publication lag (expected behaviour)
