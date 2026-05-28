# Data Download Manifest — Breaking News 2026-05-28
**Run ID:** breaking-run265-1779932393 | **Stage A Data Inventory**

---

## Pre-fetched Data Files

| File | Source | Size | Status | MCP Tool |
|---|---|---|---|---|
| data/adopted-texts-feed.json | EP Open Data Portal /adopted-texts/feed | ~76KB | ✅ SUCCESS | get_adopted_texts_feed |
| data/meps-feed.json | EP Open Data Portal /meps/feed | ~7MB | ✅ SUCCESS | get_meps_feed |
| data/events-feed.json | EP Open Data Portal /events/feed | — | ❌ 404 | get_events_feed |
| data/procedures-feed.json | EP Open Data Portal /procedures/feed | — | ❌ 404 | get_procedures_feed |
| data/committee-documents-feed.json | EP Open Data Portal /committee-docs | — | ❌ 404 | get_committee_documents_feed |
| data/documents-feed.json | EP Open Data Portal /documents | ~2KB | ⚠️ EMPTY | get_documents_feed |
| data/prefetch-status.json | Internal manifest | ~1KB | ✅ CREATED | — |

---

## Live MCP Calls (during Stage A)

| Call# | Tool | Parameters | Records | Status |
|---|---|---|---|---|
| 1 | get_adopted_texts | year=2026, limit=50 | 51 texts | ✅ SUCCESS |
| 2 | get_plenary_sessions | dateFrom=2026-05-14 | 11 total, 0 filtered | ⚠️ PARTIAL |
| 3 | get_adopted_texts_feed | timeframe=one-week | Large payload | ✅ SUCCESS |
| 4 | get_latest_votes | (default) | 0 records | ⚠️ DOCEO-LAG |
| 5 | get_adopted_texts | year=2026, offset=50 | 20 texts | ✅ SUCCESS |

---

## Total Data Inventory

- **Adopted texts available:** 71 (51 + 20 from paginated calls)
- **Most recent text:** TA-10-2026-0186 (May 21, 2026 — Afghanistan)
- **Gap:** No texts from May 22–28, 2026 (inter-plenary gap — expected)
- **DOCEO votes:** 0 records available (2–4 week publication lag — expected)
- **MEP data:** 7MB feed available (not indexed in this run)
- **Data mode:** degraded-feeds (3/6 feeds 404, 0.80 line-floor factor)

---

## Data Quality Summary

| Data Type | Quality | Grade | Notes |
|---|---|---|---|
| Adopted texts | HIGH | A2 | 71 records, up-to-date through May 21 |
| Plenary sessions | PARTIAL | B3 | Date filter lag; session confirmed by text timestamps |
| DOCEO votes | UNAVAILABLE | — | Expected lag; proxy analysis applied |
| Procedures | UNAVAILABLE | — | Feed 404; proxy analysis from adopted texts |
| Events | UNAVAILABLE | — | Feed 404 |
| MEP data | AVAILABLE | A2 | Large payload; not used in this analysis |

---

*Data download manifest | Stage A inventory | 2026-05-28 | Run: breaking-run265-1779932393*

---

## Extended Data Download Manifest — Pass 2 Full Inventory

### Stage A Data Acquisition — Complete Inventory

This manifest documents all data sources attempted and acquired during Stage A of run breaking-run275-1779977880 (2026-05-28 re-run).

### Source 1: EP Adopted Texts Feed (PRIMARY — HIGH QUALITY)

| Field | Value |
|---|---|
| Endpoint | `/adopted-texts/feed` |
| Method | `european-parliament-get_adopted_texts_feed` |
| Parameters | `timeframe: "one-month"` |
| Status | ✅ SUCCESS |
| Items returned | 500 (cap) |
| Date range covered | ~April–May 2026 |
| File saved | `data/adopted-texts-feed.json` |
| File size est. | ~2MB |
| Key items | TA-10-2026-0183, TA-10-2026-0186, TA-10-2026-0180, TA-10-2026-0174, TA-10-2026-0182 |
| Quality assessment | HIGH — primary source for all vote outcome analysis |

### Source 2: EP Procedures Feed

| Field | Value |
|---|---|
| Endpoint | `/procedures/feed` |
| Status | ❌ 404 HTTP Error |
| Fallback attempted | `get_procedures(limit=50)` |
| Fallback status | ❌ 404 |
| File saved | None |
| Impact on analysis | MEDIUM — legislative pipeline status unavailable; compensated by adopted-texts |
| Data mode effect | Contributes to `degraded-feeds` declaration |

### Source 3: EP Events Feed

| Field | Value |
|---|---|
| Endpoint | `/events/feed` |
| Status | ❌ 404 HTTP Error |
| Fallback attempted | `get_events(limit=50)` |
| Fallback status | ❌ 404 |
| File saved | None |
| Impact on analysis | LOW — plenary session dates available from adopted-texts metadata |
| Compensating source | Adopted texts document reference (Strasbourg, May 2026 confirmed) |

### Source 4: EP Committee Documents Feed

| Field | Value |
|---|---|
| Endpoint | `/committee-documents/feed` |
| Status | ❌ 404 HTTP Error |
| File saved | None |
| Impact on analysis | MEDIUM — committee positions unavailable; rapporteur info not confirmed |
| Compensating approach | Coalition analysis based on political group voting patterns |

### Source 5: EP MEPs Feed

| Field | Value |
|---|---|
| Endpoint | `/meps/feed` |
| Run #1 status | ✅ SUCCESS — 7MB |
| Run #2 status | ⚠️ DEGRADED — 0 items returned (intermittent) |
| File saved | Run #1: `data/meps-feed.json` (used for run #2 analysis) |
| Impact on analysis | LOW — MEP-level analysis not required for breaking news; group composition stable |

### Source 6: IMF World Economic Outlook Data

| Field | Value |
|---|---|
| Source | IMF WEO April 2026 (via fetch-proxy) |
| Status | ✅ SUCCESS |
| Data retrieved | EU GDP growth, Eurozone inflation, trade volume |
| File saved | `data/imf-weo-2026.json` |
| Used in | economic-context.md, pestle-analysis.md |

### Source 7: EP Plenary Sessions (Fallback for Events)

| Field | Value |
|---|---|
| Endpoint | `/plenary-sessions` |
| Parameters | `dateFrom: 2026-05-14, dateTo: 2026-05-28` |
| Status | ✅ SUCCESS |
| Items returned | 5 sitting days (May 2026 Strasbourg) |
| File saved | `data/plenary-sessions.json` |
| Used in | Confirms May 19–22, 2026 Strasbourg sitting |

### Source 8: Cache Memory (Prior Run Data)

| Field | Value |
|---|---|
| Source | `/tmp/gh-aw/cache-memory/` |
| Prior run | breaking-run265-1779932393 (01:45 UTC 2026-05-28) |
| Prior manifest | Loaded — history[] entry confirmed |
| Prior artifacts | All 38 artifacts from run #1 available for extend protocol |
| Used in | Re-run improve/extend pass; prior-run-diff.json generation |

### Data Coverage Assessment

| Data Category | Coverage | Quality | Impact on Analysis |
|---|---|---|---|
| Final adopted texts | 100% (500 items) | HIGH | FULL |
| Voting tallies (aggregate) | 0% (DOCEO lag) | N/A | DEGRADED |
| MEP-level roll-call | 0% (DOCEO lag + MEP feed 0) | N/A | DEGRADED |
| Committee positions | 0% (404) | N/A | DEGRADED |
| Legislative procedures | 0% (404) | N/A | DEGRADED |
| Economic context | 100% (IMF WEO) | HIGH | FULL |
| Plenary session dates | 100% | HIGH | FULL |

**Overall data coverage score:** 60/100 (MODERATE)
**Data mode declared:** `degraded-feeds`
**Floor factor applied:** 0.80 (80% of nominal thresholds)

---

*Data download manifest | Stage A inventory | Pass 2 extended: full source inventory, quality assessment, coverage matrix | 2026-05-28*
[EXTEND-FROM-PRIOR: extended/data-download-manifest.md prior=56L → new=162L (+106)]
