<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — Committee Reports · 2026-05-21

## Executive Summary

**Data Mode:** `degraded-feeds` | **Floor Factor Applied:** 0.80  
**EP API Server Health:** Sparse (1/13 feeds operational at run time)  
**Run Date:** 2026-05-21 | **Article Type:** committee-reports

---

## Feed-by-Feed Status

| Feed | Status | Items Retrieved | Notes |
|------|--------|-----------------|-------|
| `get_committee_documents_feed` | ❌ ERROR | 0 | 404 from EP API enrichment endpoint |
| `get_procedures_feed` | ⚠️ DEGRADED | 50 (historical only) | Returns 1972–1987 records; no 2025–2026 data |
| `get_events_feed` | ❌ ERROR | 0 | 404 from EP API |
| `get_documents_feed` | ❌ ERROR | 0 | 404 from EP API |
| `get_adopted_texts_feed` | ✅ PARTIAL | 200 (71 EP10) | Feed returns but no titles enriched |
| `get_latest_votes` | ❌ EMPTY | 0 | No DOCEO XML available 2026-05-18–21 |
| `generate_political_landscape` | ✅ OK | 717 MEPs, 9 groups | Full seat composition available |
| `analyze_committee_activity` (ENVI) | ⚠️ DEGRADED | All zeros | API returns empty for date window |

---

## Live MCP Calls Made (Stage A)

1. `get_committee_documents_feed` — 404 error  
2. `get_procedures_feed` — degraded mode (historical data only)  
3. `get_latest_votes` — 0 votes (no DOCEO XML this week)  
4. `generate_political_landscape` — SUCCESS  
5. `get_adopted_texts_feed` — partial (71 EP10 texts, no title enrichment)  

**Total Stage A EP MCP calls:** 5 (at cap)

---

## Data Mode Determination

The trigger for `degraded-feeds` (factor 0.80) independently applies:
- Committee documents feed returned 404 (unavailable)
- Procedures feed returned only 1972–1987 records
- Events feed returned 404

**Final data mode: `degraded-feeds`** — line floors reduced by 20% for all artifacts.

---

## Structural Analysis Compensations

Given the API degradation, this run relies on:
1. **Political landscape data** (717 MEPs, full group composition) — HIGH confidence
2. **Adopted texts feed** (71 EP10 texts with identifiers, no titles) — MEDIUM confidence
3. **Institutional knowledge** of EP10 committee structure — B2/HUMINT source
4. **Historical baselines** from prior runs and public EP institutional records
5. **Structural analysis** of committee system architecture in 2026

**Admiralty Grade for primary data sources:** B2 (Usually reliable — established EP Open Data Portal, minor limitations)

---

## Implications for Analysis

- Analysis is grounded in EP10 parliamentary structure (verified composition data)
- Committee-specific document analysis replaced with thematic/structural analysis
- Voting pattern analysis deferred due to no DOCEO XML availability
- Economic context uses IMF structural proxy (no real-time EP voting impact data)

**Confidence Level:** MEDIUM (B3 — fairly reliable sources with known degradation)
