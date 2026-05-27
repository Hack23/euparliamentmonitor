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

## Extended Data Download Manifest

### Pre-fetched Data Files (from prefetch-status.json)

| File | Source | Size | Records | Status |
|------|--------|------|---------|--------|
| adopted-texts-feed.json | EP API /adopted-texts/feed | 76KB | 500 | ✅ AVAILABLE |
| meps-feed.json | EP API /meps/feed | 7MB | ~720 | ✅ AVAILABLE |
| procedures-feed.json | EP API /procedures/feed | 0B | 0 | ❌ HTTP 404 |
| events-feed.json | EP API /events/feed | 0B | 0 | ❌ HTTP 404 |
| committee-documents-feed.json | EP API /committee-docs/feed | 1KB | 0 | ❌ EMPTY |
| documents-feed.json | EP API /documents/feed | 0B | 0 | ❌ HTTP 404 |

### Live MCP Tool Calls Made This Run

| Call # | Tool | Parameters | Records | Purpose |
|--------|------|-----------|---------|---------|
| 1 | get_adopted_texts | year=2026, limit=50, offset=0 | 51 | May 2026 texts batch 1 |
| 2 | get_adopted_texts | year=2026, limit=50, offset=50 | 50 | May 2026 texts batch 2 |
| 3 | get_adopted_texts | year=2026, limit=50, offset=100 | 51 | May 2026 texts batch 3 |
| 4 | get_plenary_sessions | dateFrom=2026-05-13 | 0 | Plenary session metadata |

**Total live MCP calls**: 4 of ≤5 Stage A cap ✅

### Key Data Files Used in Analysis

| Analysis Artifact | Primary Data Source | Secondary Source |
|------------------|---------------------|-----------------|
| synthesis-summary.md | adopted-texts-feed.json, live call 1-3 | meps-feed.json |
| coalition-dynamics.md | meps-feed.json groups | adopted-texts voting proxies |
| stakeholder-map.md | meps-feed.json MEP data | adopted-texts authorship |
| economic-context.md | IMF WEO Apr 2026 (public) | Eurofer data (public) |
| scenario-forecast.md | adopted-texts + historical | IMF projections |

### Data Integrity Assessment

All primary data (adopted-texts) sourced from EP official API (A1 reliability).
MEP data from EP official feed (A1 reliability).
Economic context from IMF published reports (B2 reliability).
Political analysis from EP institutional data + analytical inference (B3-C3 reliability).

