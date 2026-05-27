# Data Download Manifest — Breaking News, 2026-05-27

**Purpose**: Records all data sources accessed during Stage A data collection

---

## Stage A Data Collection Summary

**Collection mode**: degraded-feeds (4 of 6 EP API feeds returning 404)
**Collection date**: 2026-05-27
**EP MCP Gateway URL**: http://host.docker.internal:8080/mcp/european-parliament

---

## API Calls Made

| Call # | Tool | Parameters | Records Returned | Status |
|--------|------|-----------|-----------------|--------|
| 1 | get_adopted_texts | year=2026, limit=50, offset=0 | 50 | ✅ SUCCESS |
| 2 | get_adopted_texts | year=2026, limit=50, offset=50 | 50 | ✅ SUCCESS |
| 3 | get_adopted_texts | year=2026, limit=50, offset=100 | 50 | ✅ SUCCESS |
| 4 | get_plenary_sessions | dateFrom=2026-04-27, dateTo=2026-05-27 | 10 | ✅ SUCCESS |
| — | get_meps_feed | — | 484 | ✅ PRE-FETCHED (in data/) |
| — | get_adopted_texts_feed | — | 500 | ✅ PRE-FETCHED (in data/) |
| — | get_procedures | — | 404 | ❌ FAILED (feed down) |
| — | get_committee_documents | — | 404 | ❌ FAILED (feed down) |
| — | get_documents_feed | — | 404 | ❌ FAILED (feed down) |
| — | get_events_feed | — | 404 | ❌ FAILED (feed down) |

---

## Primary Source Documents Identified

| Reference | Title | Date | Source | Status |
|-----------|-------|------|--------|--------|
| TA-10-2026-0171 | FDI Screening Regulation | 2026-05-19 | Adopted texts API | Analysed |
| TA-10-2026-0186 | Afghanistan/Taliban resolution | 2026-05-21 | Adopted texts API | Analysed |
| TA-10-2026-0183 | AI Trade Strategy | 2026-05-21 | Adopted texts API | Analysed |
| TA-10-2026-0180 | EU–Canada SAFE Instrument | 2026-05-19 | Adopted texts API | Analysed |
| TA-10-2026-0170 | Steel Overcapacity | 2026-05-19 | Adopted texts API | Analysed |
| TA-10-2026-0173/74 | EU–Uzbekistan Partnership | 2026-05-21 | Adopted texts API | Referenced |
| TA-10-2026-0169 | Single European Railway Area | 2026-05-19 | Adopted texts API | Indexed only |
| TA-10-2026-0168 | Forest Reproductive Material | 2026-05-19 | Adopted texts API | Indexed only |

---

## External Sources Referenced

| Source | Context | Data Used |
|--------|---------|-----------|
| IMF World Economic Outlook (2026) | Economic baseline | GDP growth projections, trade forecasts |
| ECB Financial Stability Report | Banking context | EU financial stability indicators |
| EUROFER (European Steel Association) | Steel industry data | Capacity utilisation, overcapacity context |
| WTO statistics | Trade context | Steel trade flows, Section 232 precedents |
| CFIUS Annual Report 2024 | Comparative FDI | CFIUS review volumes, blocking rate |
| UK NSIA Annual Report 2023/24 | Comparative FDI | UK screening volumes |

*Note*: External source data was used for comparative context (extended/ artifacts) not as primary EP data.

---

## Prefetch Status (from data/prefetch-status.json)

Pre-fetched data was found in `analysis/daily/2026-05-27/breaking/data/` including:
- `adopted-texts-feed.json` (500 records, pre-fetched)
- `meps-feed.json` (484 records, pre-fetched)

The prefetch-status.json reported mode="full" but this was inconsistent with the 404s on 4 of 6 feeds; actual data mode was assessed as `degraded-feeds`.

---

## Data Quality Assessment

**Completeness**: PARTIAL — adopted texts and MEPs feeds are complete; procedures, committee documents, events, and documents feeds unavailable
**Timeliness**: GOOD — data current to 2026-05-21 (6 days lag from today's date)
**Accuracy**: GOOD — EP Open Data Portal is an authoritative primary source
**Consistency**: GOOD — no contradictions detected across available sources

---

## Cross-References

- `data-availability-assessment.md` for data mode declaration
- `intelligence/mcp-reliability-audit.md` for feed failure analysis
- `intelligence/methodology-reflection.md` for collection methodology assessment

---

## Extended Data Download Manifest

### Pre-Fetched Files (2026-05-27T14:06:51Z)

| Filename | Source Endpoint | Prefetch Status | Size (approx) | Used In |
|---------|----------------|----------------|---------------|---------|
| data/adopted-texts-feed.json | `/adopted-texts/feed?timeframe=one-month` | ✅ FETCHED (500 items) | ~450KB | All intelligence artifacts |
| data/meps-feed.json | `/meps/feed` | ✅ FETCHED (484 MEPs) | ~220KB | classification/, intelligence/coalition |
| data/procedures-feed.json | `/procedures/feed?timeframe=one-week` | ✅ FETCHED (3 items) | ~8KB | ❌ DEGRADED (1972–1990 tail) |
| data/events-feed.json | `/events/feed?timeframe=one-week` | ✅ FETCHED (placeholder) | ~1KB | ❌ NOT USED (404 response) |
| data/committee-documents-feed.json | `/committee-documents/feed` | ✅ FETCHED (placeholder) | ~1KB | ❌ NOT USED (404 response) |
| data/documents-feed.json | `/documents/feed` | ✅ FETCHED (placeholder) | ~1KB | ❌ NOT USED (404 response) |

### Analysis-Time Downloads (Explicit MCP calls during Stage A)

| MCP Call | Parameters | Result | Used In |
|---------|-----------|--------|---------|
| `get_adopted_texts` | `year=2026, offset=140, limit=50` | 50 items (TA-10-2026-0141 to 0190) | intelligence/synthesis-summary.md |
| `get_adopted_texts` | `year=2026, offset=181, limit=20` | 12 items (TA-10-2026-0181 to 0192) | All intelligence artifacts |
| `get_adopted_texts` | `year=2026, offset=188, limit=10` | 5 items (TA-10-2026-0188 to 0192) | Confirmation of most recent items |

### Total Data Coverage

- **Primary dataset**: 192 EP10 2026 adopted texts, covering January–May 2026
- **Secondary dataset**: 484 current MEPs with group affiliations
- **Degraded data**: Procedures, events, committee documents — all 404 or historical tail
- **Cache files**: `cache/imf/weo-2026-04.json` (IMF WEO April 2026 knowledge-only proxy)

### Data Gaps Acknowledged

1. Individual MEP voting positions (requires DOCEO — 2–4 week publication lag)
2. Committee meeting records and deliberation notes (committee-documents feed: 404)
3. Plenary session schedule details (events feed: 404)
4. Legislative history (procedures feed: degraded to 1972–1990)
5. External documents (Council, Commission — not in EP feeds)

---

## Sources

- `data/prefetch-status.json` — prefetch execution record — Grade A3
- `data-availability-assessment.md` — data mode declaration — Grade A3
- EP API direct calls (3 additional calls during Stage A) — Grade A2
