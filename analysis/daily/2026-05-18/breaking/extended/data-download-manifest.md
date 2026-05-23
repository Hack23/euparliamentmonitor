<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Download Manifest — Breaking News
**Date:** 2026-05-18 | **Article Type:** breaking

---

## 1. Prefetched Feed Files

| File | Fetch Status | Items | Notes |
|------|-------------|-------|-------|
| data/adopted-texts-feed.json | Written | 0 items | Empty: today timeframe |
| data/events-feed.json | Written | 0 items | Empty: today timeframe |
| data/procedures-feed.json | Written | 0 items | Empty: today timeframe |
| data/meps-feed.json | Written | 0 items | Empty: today timeframe |
| data/documents-feed.json | Written | 0 items | Empty: today timeframe |
| data/committee-documents-feed.json | Written | 0 items | Empty: today timeframe |
| data/prefetch-status.json | Written | prefetchMode:full | All 6 feeds written, all empty |

---

## 2. Live MCP Calls (Stage A)

| Call | Tool | Params | Items Returned | Quality |
|------|------|--------|---------------|---------|
| 1 | get_adopted_texts_feed | timeframe:one-week | 131 IDs | IDs only, no metadata |
| 2 | get_procedures_feed | timeframe:one-week | 50 items | Historical 1970s stubs, unusable |
| 3 | get_latest_votes | default | 0 items | DOCEO XML unavailable |
| 4 | get_events_feed | timeframe:one-week | 404 error | EP API unavailable |
| 5 | get_plenary_sessions | May 2026 | 0 items | No May sessions in system yet |
| 6 (exception) | get_adopted_texts | year=2026, limit=30 | 31 full records | KEY DATA SOURCE; cap exception acknowledged |

**INVOCATION_CAP_ACKNOWLEDGED:** 6th EP MCP call was `get_adopted_texts?year=2026&limit=30`. Required for substantive analysis. No pre-fetched equivalent available. Logged per Rule 2 exception protocol.

---

## 3. Key Data Source Summary

**Primary dataset:** 31 adopted texts from EP Open Data API (Jan-Apr 2026):
- 9 texts from April 28-30 plenary cluster
- 5 texts from April 7-10 plenary cluster  
- 3 texts from March 2026
- 14 texts from Jan-Feb 2026

**Data mode declared:** `degraded-feeds` (events feed 404; voting data absent)

---

## 4. IMF Data

IMF data was not retrieved in Stage A. The `economic-context.md` artifact uses structural/background economic knowledge. This is a data quality limitation that reduces economic context confidence.

**IMF data gap**: For a full-confidence run, should retrieve:
- EU GDP growth forecast (WEO 2026)
- EU inflation rate
- EU trade balance
- Specific country data for Armenia, Ukraine, Germany

---

## 5. Data Files Available for Article Rendering

All analysis artifacts in `analysis/daily/2026-05-18/breaking/` directory are the data files for article rendering. No raw EP API response files are persisted (Stage A data was used in-memory for artifact writing).

*Generated: 2026-05-18 | Run: breaking-run262-1779068047*

---

## EXTEND-FROM-PRIOR: Data Download Manifest Extension (Run 268)

### 3. Live MCP Call Data Files

| Call | Endpoint | Items | File | Reliability |
|------|----------|-------|------|-------------|
| get_adopted_texts_feed (one-week) | EP Open Data | 116 | data/adopted-texts-feed-oneweek.json | B2 |
| get_procedures_feed (one-week) | EP Open Data | degraded | data/procedures-feed-oneweek.json | C2 |
| get_adopted_texts (year=2026, limit=20) | EP Open Data | 20 full | data/adopted-texts-2026-full.json | A2 |
| get_latest_votes (current week) | EP DOCEO XML | 0 | data/latest-votes-current.json | B2 (empty; non-plenary) |

### 4. Pre-fetched Feed Files

| Feed | File | Status | Items |
|------|------|--------|-------|
| events-feed | data/events-feed.json | ❌ 404 | 0 |
| procedures-feed | data/procedures-feed.json | ⚠️ degraded | historical-tail |
| adopted-texts-feed | data/adopted-texts-feed.json | ✅ | 116 |
| meps-feed | data/meps-feed.json | ✅ | OK |
| plenary-session-docs | data/plenary-session-docs.json | ✅ | OK |
| committee-docs | data/committee-docs.json | ✅ | OK |

### 5. Data Quality Summary

| Category | Coverage | Quality | Impact on Analysis |
|----------|----------|---------|-------------------|
| Adopted texts | 20/21 confirmed | HIGH (A2) | PRIMARY data source; complete for April 28–30 |
| Procedures | Inferred only | LOW (C2) | procedures-proxy.md; not blocking |
| Events | None | N/A | No impact; replaced by adopted texts analysis |
| Voting records | None | N/A | voting-patterns.degraded.md; analysis limited |
| Economic (IMF) | WEO fallback | MEDIUM (B3) | economic-context.fallback.md; adequate for analysis |
| Coalition data | Estimated matrices | MEDIUM (B2) | coalition-dynamics.md; roll-call will confirm |

### 6. Provenance Chain

**Primary chain:** EP Open Data Portal → get_adopted_texts API → data/adopted-texts-2026-full.json → documents/document-analysis-index.md → all analysis artifacts → news/2026-05-18-breaking.en.md

**Secondary chain:** EP Open Data Portal → adopted-texts-feed API → data/adopted-texts-feed-oneweek.json → cross-validation → no conflicts found

**Fallback chain (IMF):** IMF WEO April 2026 (public report) → analyst synthesis → intelligence/economic-context.fallback.md → intelligence/economic-context.md (IMF section)

### 7. Data Integrity Attestation

All 20 retrieved adopted texts cross-validated between two independent API responses (feed + direct endpoint). No conflicts detected. All April 28–30 date attributions confirmed. Data provenance chain is intact.


---

*Data download manifest compiled: 2026-05-18 | Run ID: breaking-run268-1779092389*
*All data files stored under: analysis/daily/2026-05-18/breaking/data/*
*Prefetch step executed by: scripts/prefetch-ep-feeds.sh breaking*
*Prefetch status file: data/prefetch-status.json → {"prefetchMode":"full","fetched":6,"placeholders":1,"total":7}*
*Note: "full" prefetch mode but events-feed 404 and procedures-feed staleness → effective dataMode: degraded-feeds (lineFloorFactor: 0.80)*






