<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment
## Week in Review: 2026-04-10 to 2026-05-08 | Generated: 2026-05-16

---

## Data Collection Summary

| Source | Status | Items Retrieved | Quality |
|--------|--------|----------------|---------|
| EP Adopted Texts (MCP API) | ✅ AVAILABLE | 25 (in window) | 🟢 HIGH |
| EP Adopted Texts Feed (prefetch) | ⚠️ MINIMAL | 500 (ELI IDs only, no metadata) | 🟡 LOW |
| EP Events Feed (prefetch) | ❌ ERROR | 0 | 🔴 NONE |
| EP Procedures Feed (prefetch) | ❌ ERROR | 0 | 🔴 NONE |
| EP Documents Feed (prefetch) | ❌ ERROR | 0 | 🔴 NONE |
| EP Plenary Sessions | ⚠️ PARTIAL | 21 (total), 0 (filtered in window) | 🟡 PARTIAL |
| EP Voting Records | ❌ EMPTY | 0 (publication lag) | 🔴 NONE |
| EP Latest Votes (DOCEO XML) | ❌ UNAVAILABLE | 0 (April 30 unavailable) | 🔴 NONE |
| IMF Probe | ⚠️ DEGRADED | Probe failed | 🟡 DEGRADED |
| World Bank Probe | Not collected | — | — |

---

## Data Mode Declaration: **degraded-feeds**

**Trigger**: 3/4 EP feed endpoints returned HTTP 404 errors (events-feed, procedures-feed, documents-feed).

**Floor factor applied**: **0.80** (80% of full data mode line thresholds)

**Rationale for selecting `degraded-feeds` over `minimal`**: The adopted texts MCP API (direct endpoint, not feed) returned rich, actionable data for 25 texts in the reporting window. The data limitations affect breadth (no procedure tracking, no event metadata) but not depth (full text metadata, titles, references, dates, subject matter available).

---

## What We Have

### Strong data:
1. **Adopted texts (25 in-window)**: Full metadata including title, reference, dateAdopted, procedureReference, subjectMatter — sufficient for comprehensive legislative analysis
2. **Historical EP data**: Term 10 voting patterns (from published roll-call archives for prior sessions), coalition composition, group seat counts
3. **Institutional calendar**: Known from EP official calendar (not API-dependent)

### Missing data:
1. **Roll-call voting data for April 28–30**: Standard 2–6 week lag; expected available mid-May/early June 2026
2. **Procedure tracking metadata**: Would enable tracking of legislative stage, rapporteur, interinstitutional file status for adopted texts
3. **Event metadata**: Would enable schedule analysis, committee co-consideration tracking
4. **IMF specific figures**: Probe degraded; IMF WEO April 2026 estimates used from institutional knowledge

---

## Impact on Analysis Quality

| Artifact Type | Impact | Mitigation |
|--------------|--------|-----------|
| Executive Brief | 🟢 LOW | Adopted texts sufficient for high-level assessment |
| Voting Patterns | 🔴 HIGH | Roll-call data unavailable; inference from historical patterns |
| Coalition Dynamics | 🟡 MEDIUM | Group positions known; vote counts unavailable |
| Economic Context | 🟡 MEDIUM | IMF probe degraded; WEO April 2026 cited from knowledge |
| Scenario Forecast | 🟢 LOW | Scenario analysis not dependent on specific voting data |
| Geopolitical Analysis | 🟢 LOW | Adopted text metadata sufficient |

---

## Prefetch Status Detail

```json
{
  "prefetchMode": "full",
  "fetched": 4,
  "placeholders": 0,
  "total": 4
}
```

**Note**: The prefetch script reported "full" mode but the actual content of 3/4 prefetched files contained error responses (HTTP 404 from EP API). The prefetch status.json does not distinguish between successfully fetched and "fetched with error" — this is a known limitation of the prefetch-ep-feeds.sh script that should be addressed in a future iteration.

**Actual data mode**: `degraded-feeds` (corrected from prefetch-reported `full`)

---

## MCP Call Summary

Total EP MCP calls made in Stage A: **4** (within 5-call cap)
1. `get_adopted_texts` (year: 2026) — 50 items returned
2. `get_plenary_sessions` (dateFrom: 2026-04-10, dateTo: 2026-05-08) — 21 total, 0 filtered
3. `get_voting_records` (dateFrom: 2026-04-10, dateTo: 2026-05-08) — 0 items (publication lag)
4. `get_latest_votes` (date: 2026-04-30) — unavailable
*5th call (procedures feed) — partial data, returned historical items only*

---

*Data availability assessment methodology: automated inventory of collected data files + manual assessment of usable data for each artifact type. Data mode declared per Stage A data mode matrix.*
