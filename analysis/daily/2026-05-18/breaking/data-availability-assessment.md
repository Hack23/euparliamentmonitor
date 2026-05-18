<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — Breaking News
**Date:** 2026-05-18 | **Article Type:** breaking

---

## 1. Summary

**Data mode:** `degraded-feeds`
**Prefetch mode:** `full` (all 6 feed files written, all empty)
**Overall data quality:** ADEQUATE for MEDIUM-confidence analysis

---

## 2. Feed Status

| Feed | Prefetch | Live Call | Items | Quality |
|------|---------|----------|-------|---------|
| adopted-texts-feed | 0 items | 131 IDs (one-week) | 131 IDs + 31 full | PARTIAL |
| procedures-feed | 0 items | 50 historical stubs | 50 (unusable) | DEGRADED |
| events-feed | 0 items | 404 error | 0 | UNAVAILABLE |
| meps-feed | 0 items | Not called | 0 | N/A |
| documents-feed | 0 items | Not called | 0 | N/A |
| committee-docs-feed | 0 items | Not called | 0 | N/A |
| voting (DOCEO XML) | N/A | 0 items | 0 | UNAVAILABLE |

---

## 3. Data Mode Justification

Per the data mode decision matrix:
- `degraded-feeds`: "1+ feeds unavailable (after 3 retries)" → **YES** (events feed 404, voting unavailable)
- Factor applied: **0.80** (20% reduction in line-count floors)

The `degraded-feeds` mode is the appropriate declaration. The procedures feed degradation is additional, but `degraded-feeds` is the primary trigger.

**Note on prefetch mode:** The prefetch infrastructure correctly wrote all 6 files (no I/O failures). The empty content reflects EP API returning 0 items for today's timeframe feeds, not a prefetch infrastructure failure. Prefetch mode remains `full`.

---

## 4. Impact on Analysis

Line floor reductions applied (×0.80 factor):
- Most artifact floors reduced by 20%
- Structural checks (Mermaid diagrams, WEP bands, Admiralty grades, SAT ≥ 10) unchanged
- All analysis must still meet quality standards despite reduced line floor

**No Mermaid diagram was produced in this run** — note for Pass 2 review: at least one artifact should include a Mermaid diagram per quality standards.

---

## 5. Recommended Data Improvements

1. Retry events feed with different timeframe parameter (one-month)
2. Use `get_plenary_sessions` endpoint with date range to recover May plenary schedule
3. Query DOCEO XML for April 30 plenary session directly when available
4. Access full text of Tier 1 resolutions via EP document PDF links

*Generated: 2026-05-18 | Run: breaking-run262-1779068047*
