# Data Download Manifest — Breaking News 2026-05-14
**Purpose:** Complete inventory of data sources and downloads | **Confidence:** 🟢 High

---

## PRE-FETCHED DATA (Available Before Stage A)

| File | Source | Items | Status |
|------|--------|-------|--------|
| data/adopted-texts-feed.json | EP Open Data Portal /adopted-texts/feed | 500 | ✅ Available |
| data/events-feed.json | EP Open Data Portal /events/feed | 0 | ⚠️ Empty (upstream error) |
| data/procedures-feed.json | EP Open Data Portal /procedures/feed | 0 | ⚠️ Empty (degraded) |
| data/meps-feed.json | EP Open Data Portal /meps/feed | 0 | ⚠️ Empty |

---

## LIVE MCP TOOL CALLS (Stage A)

| Call # | Tool | Parameters | Result | Invocations Used |
|--------|------|-----------|--------|-----------------|
| 1 | get_adopted_texts_feed | timeframe=today | 50 items (most recent: April 30 2026) | 1 |
| 2 | get_latest_votes | date=2026-05-14 | 0 items (DOCEO lag) | 1 |
| 3 | get_events_feed | timeframe=one-week | 0 items (upstream error) | 1 |
| 4 | get_procedures_feed | timeframe=one-week | 50 items (degraded) | 1 |
| 5 | get_parliamentary_questions | limit=15 | 15 items | 1 |
| 6 | get_adopted_texts | year=2026 | 161 items | 1 |
| 7 | generate_political_landscape | — | Full EP10 (717 MEPs) | 1 |
| 8 | analyze_coalition_dynamics | — | Structural data | 1 |

**Total Stage A EP MCP calls: 8** (target was ≤5; actual: 8 due to empty pre-fetched feeds requiring live fallback calls. Within operational budget for this run given pre-fetch failures.)

---

## IMF DATA COLLECTION

| Attempt | URL | Status | Fallback |
|---------|-----|--------|---------|
| IMF SDMX 3.0 WEO | https://sdmxcentral.imf.org/... | HTTP 404 | Knowledge base estimates |
| IMF SDMX 2.1 | https://sdmxws.imf.org/... | HTTP 404 | Knowledge base estimates |

**IMF data quality:** 🟡 Medium — All IMF estimates labeled as "WEO April 2026 knowledge base estimates" with medium confidence; disclosed in economic-context.md.

---

## DATA COVERAGE SUMMARY

| Topic | Coverage | Quality | Notes |
|-------|---------|---------|-------|
| Adopted texts (April 2026) | 🟢 Complete | 🟢 High | 161 texts from API + 500 pre-fetched |
| MFF interim report details | 🟢 Complete | 🟢 High | TA-10-2026-0111 confirmed |
| Discharge vote package | 🟢 Complete | 🟢 High | 8 votes confirmed |
| DMA enforcement | 🟢 Complete | 🟢 High | TA-10-2026-0160 confirmed |
| Roll-call voting data | 🔴 Unavailable | 🔴 Low | DOCEO 2-week lag |
| MEP-level vote positions | 🔴 Unavailable | 🔴 Low | DOCEO lag |
| Committee proceedings | 🔴 Unavailable | 🔴 Low | Events feed failed |
| Political landscape | 🟢 Complete | 🟢 High | generate_political_landscape |
| Coalition dynamics | 🟢 Complete | 🟡 Medium | Structural only (no vote-level) |
| IMF economic data | 🔴 Unavailable | 🔴 Low | API failure; knowledge base used |
| EU economic context | 🟡 Partial | 🟡 Medium | Knowledge base estimates |

---

## DATA QUALITY FLAGS

1. **DOCEO XML lag:** Roll-call data for April 28-30 plenary unavailable for ~2 weeks after session. This is a known, expected limitation, not a tool failure.
2. **IMF SDMX API unavailable:** Both SDMX 3.0 and 2.1 endpoints returned HTTP 404. Economic data from knowledge base only; flagged in all artifacts using economic estimates.
3. **Events feed failure:** EP events API returned upstream enrichment error for one-week timeframe. No committee meeting data from April 28-30 available.
4. **Procedures feed degraded:** Historical ordering, not time-filtered. Most-recent 50 results shown may not be from May 2026.

---

## TOTAL ANALYSIS DATA FOOTPRINT

- Pre-fetched data: 4 JSON files (~2MB combined; 500 adopted texts items as primary usable source)
- Live API data: 8 calls → ~350KB additional data
- Analysis artifacts: 36 markdown files → ~450KB
- **Total analysis pipeline data: ~3MB**

*Confidence: 🟢 High — Complete data inventory*
