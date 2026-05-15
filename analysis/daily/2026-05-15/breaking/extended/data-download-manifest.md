# Data Download Manifest — EP Breaking News 2026-05-15
**Article Type:** Breaking | **Analysis Date:** 2026-05-15

---

## 📁 Data Download Manifest

Complete record of all data files acquired, attempted, and used in the 2026-05-15 breaking news analysis run.

---

## Pre-fetched Feed Files

| File | Path | Status | Items | Quality |
|------|------|--------|-------|---------|
| adopted-texts-feed.json | data/adopted-texts-feed.json | ✅ WRITTEN | 500 items | 🟡 MEDIUM — no dates in items |
| meps-feed.json | data/meps-feed.json | ✅ WRITTEN | 637 MEPs | 🟢 GOOD — full MEP data |
| events-feed.json | data/events-feed.json | ❌ ERROR | 0 items | 🔴 Feed endpoint 404 |
| procedures-feed.json | data/procedures-feed.json | ❌ ERROR | 0 items | 🔴 Feed endpoint 404 |
| committee-documents-feed.json | data/committee-documents-feed.json | ✅ WRITTEN | 0 items | Empty but valid |
| documents-feed.json | data/documents-feed.json | ✅ WRITTEN | 0 items | Empty but valid |

---

## MCP Tool Call Data

| Call # | Tool | Date/Filter | Status | Items | Written to |
|--------|------|------------|--------|-------|-----------|
| 1 | get_adopted_texts | year=2026, limit=30 | ✅ SUCCESS | 31 items | data/adopted-texts.json |
| 2 | get_latest_votes | limit=20 | ✅ SUCCESS | 0 items | data/votes-latest.json |
| 3 | get_plenary_sessions | 2026-04-27/05-01 | ✅ SUCCESS | 0 filtered | data/plenary-sessions.json |
| 4 | get_adopted_texts | docId=TA-10-2026-0160 | ⚠️ DATA_UNAVAILABLE | — | — |
| 5 | get_voting_records | 2026-04-28/04-30 | ✅ SUCCESS | 0 items | data/voting-records.json |

**Total MCP calls:** 5 (at Stage A budget cap)

---

## External API Attempts

| API | Endpoint | Status | Reason | Alternative used |
|-----|---------|--------|--------|-----------------|
| IMF SDMX API | GDP indicators (EU) | ❌ HTTP 404 | No subscription key | Legislative-inference economic analysis |
| IMF SDMX API | Inflation indicators | ❌ HTTP 404 | No subscription key | — |
| IMF SDMX API | Unemployment indicators | ❌ HTTP 204 | No data available | — |
| World Bank API | GDP growth | ❌ Connection refused | Service unavailable | — |
| World Bank API | Fiscal balance | ❌ Connection refused | Service unavailable | — |

**IMF_API_PRIMARY_KEY:** Not set in environment. All IMF calls failed.

---

## Data Files Used in Analysis

| File | Used in | Key data extracted |
|------|---------|--------------------|
| data/adopted-texts.json (Call 1) | documents/document-analysis-index.md; classification/; significance-scoring/ | TA-10-2026-0112 to 0163 list; text types; dates |
| data/meps-feed.json | intelligence/coalition-dynamics.md; extended/coalition-mathematics.md | Group seat counts; MEP totals |
| data/adopted-texts-feed.json | intelligence/significance-scoring.md | Supplementary context (no dates; limited) |

---

## Data Coverage Assessment

### Covered ✅
- Adopted texts April 2026 (31 items confirmed): TA-10-2026-0112 through TA-10-2026-0163 range
- MEP composition (637 current MEPs with group affiliations)
- Calendar confirmation (no May 2026 plenary session this week)

### Not Covered ❌
- Individual DMA resolution text (TA-10-2026-0160): Not yet published in EP portal
- April 30, 2026 roll-call votes: EP publication delay (2–3 weeks)
- Economic data: IMF API unavailable; World Bank API unavailable
- Event agenda details: Events feed returning 404

### Impact Assessment
Data gaps affect: 🟡 confidence of voting pattern analysis; 🟢 low impact on document classification; 🟢 low impact on political analysis (which relies primarily on institutional knowledge and adopted texts list, not full text content)

---

## Caching Notes

- `analysis/daily/2026-05-15/breaking/data/` created and populated by pre-fetch script
- Analysis artifacts written to `analysis/daily/2026-05-15/breaking/` (stable canonical directory)
- No cache-memory files written this run (no prior-run merge executed)

---

*Generated: 2026-05-15 | Run ID: breaking-run343-1778808690*
