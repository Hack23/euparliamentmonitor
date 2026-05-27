# Data Availability Assessment — Breaking News, 2026-05-27

**Run ID**: breaking-run266-1779846371
**Generated**: 2026-05-27T01:50:00Z
**Data Mode**: `degraded-feeds` (line-floor factor: 0.80)

## Feed Status Summary

| Feed | Status | Items | Notes |
|------|--------|-------|-------|
| `adopted-texts-feed.json` | ✅ AVAILABLE | 500 items (2026 subset: 101+) | Primary legislative record — fully operational |
| `meps-feed.json` | ✅ AVAILABLE | 484 MEPs | Current EP10 membership feed operational |
| `committee-documents-feed.json` | ❌ 404 NOT FOUND | 0 | POST `/committee-documents/?view-version=v2.1` returning 404 |
| `documents-feed.json` | ❌ 404 NOT FOUND | 0 | POST `/documents/?view-version=v2.1` returning 404 |
| `events-feed.json` | ❌ 404 NOT FOUND | 0 | POST `/events/?view-version=v2.1` returning 404 |
| `procedures-feed.json` | ❌ STALE/404 | 0 | Historical-tail ordering; STALENESS_WARNING |

## Data Mode Declaration

**Declared mode**: `degraded-feeds`
- Trigger: 4 of 6 feeds returning 404 or empty placeholder responses
- Floor factor applied: 0.80 (all per-artifact line minimums scaled)
- IMF data: not independently verified this run (degraded-imf not declared as primary; degraded-feeds more severe)

## Available Data Sources Used

1. **EP Open Data Portal — Adopted Texts 2026**: 101+ texts fetched via `get_adopted_texts(year=2026)` — A2 grade, ~90% success rate, most reliable EP endpoint. Covers January–May 21, 2026.
2. **MEPs Feed**: 484 current EP10 MEPs with political group affiliations and biographical data.
3. **Stage A fallback**: `get_adopted_texts(year=2026, limit=50, offset=0/50/100)` used as canonical substitute for degraded procedures/documents feeds.

## Primary Breaking News Items Identified (May 19–21, 2026)

| Ref | Title | Date Adopted | Significance |
|-----|-------|-------------|--------------|
| TA-10-2026-0186 | Situation of women and girls in Afghanistan — Taliban's Criminal Procedure Code | 2026-05-21 | HIGH — humanitarian/geopolitical |
| TA-10-2026-0183 | AI strategy for EU trade | 2026-05-20 | HIGH — strategic autonomy/tech |
| TA-10-2026-0182 | Recommendation on 81st UN General Assembly session | 2026-05-20 | MEDIUM — multilateral |
| TA-10-2026-0180 | EU–Canada Agreement on SAFE Instrument procurement | 2026-05-20 | HIGH — defence/PESC |
| TA-10-2026-0171 | Screening of foreign investments in the Union | 2026-05-19 | HIGH — economic security |
| TA-10-2026-0170 | Steel overcapacity and EU market protection | 2026-05-19 | HIGH — trade/industry |
| TA-10-2026-0174/0173 | EU–Uzbekistan Enhanced Partnership | 2026-05-20 | MEDIUM — eastern partnership |
| TA-10-2026-0169 | Single European railway area capacity | 2026-05-19 | MEDIUM — transport |

## Quality Assessment

- **Source confidence**: Admiralty Grade B2 (EP Open Data Portal, official government source, corroborated by multiple direct endpoints)
- **Temporal freshness**: Most recent item May 21, 2026 (6 days ago from run date May 27)
- **Coverage gaps**: Committee deliberations, individual voting records, debate transcripts unavailable due to feed failures
- **Analytical floor**: All artifacts will be written to 80% of standard thresholds given `degraded-feeds` mode

## Detailed Feed Status

| Feed | Status | Records | Note |
|------|--------|---------|------|
| adopted-texts-feed | ✅ AVAILABLE | 500 | Pre-fetched, 76KB |
| meps-feed | ✅ AVAILABLE | ~720 | Pre-fetched, 7MB |
| procedures-feed | ❌ DEGRADED | 0 | HTTP 404 |
| events-feed | ❌ DEGRADED | 0 | HTTP 404 |
| committee-documents-feed | ❌ EMPTY | 0 | HTTP 200 but empty |
| documents-feed | ❌ DEGRADED | 0 | HTTP 404 |


*Data availability assessment complete. 2/6 feeds fully available, 4/6 degraded. degraded-feeds mode declared.*
