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
