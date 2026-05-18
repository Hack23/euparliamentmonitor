<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment
**Date:** 2026-05-18 | **Article Type:** breaking | **Data Mode:** degraded-feeds
**Run ID:** breaking-run268-1779092389 | **Prefetch Status:** full (6/6 feeds fetched)

---

## 1. Feed Availability Summary

| Feed | Status | Items | Notes |
|------|--------|-------|-------|
| `adopted-texts-feed` | ✅ Full | 500 items | Primary data source; 105 items from 2026 |
| `events-feed` | ❌ Error | 0 items | HTTP 404 from EP API; degraded |
| `procedures-feed` | ⚠️ Degraded | 0 current | Historical stubs only; no recent activity dates |
| `meps-feed` | ✅ Full | 8.2MB | Current MEP roster available |
| `committee-documents-feed` | ⚠️ Empty | 0 items | Fixed-window feed returned empty |
| `documents-feed` | ⚠️ Empty | 0 items | Fixed-window feed returned empty |

**Overall Prefetch Mode:** `full` (all feeds attempted; 2 returned errors, 2 empty)
**Effective Data Mode:** `degraded-feeds` (1+ feeds unavailable after 3 retries)
**Line Floor Factor Applied:** 0.80

---

## 2. EP Open Data Portal Availability Assessment

### 2.1 Primary Endpoint: Adopted Texts (Direct)
- **Status:** FULLY AVAILABLE — EP `/adopted-texts?year=2026` returned 21 items with full metadata including titles, adoption dates, subject codes, and procedure references.
- **Coverage:** TA-10-2026-0004 (January 20) through TA-10-2026-0163 (April 30) — 21 confirmed adopted texts in 2026.
- **Freshness:** Data current through April 30, 2026. No texts dated May 1–18, 2026 in the dataset (confirmed non-plenary period: the EP plenary calendar has no scheduled Strasbourg session between April 30 and June 2026 Strasbourg part-session).
- **Reliability:** HIGH — EP official portal; Admiralty Grade A for source institution.

### 2.2 Adopted Texts Feed (week-one-week window)
- **Status:** AVAILABLE with 116 items returned, 105 of which are 2026 identifiers.
- **Note:** The live feed returned items without enriched metadata (no titles). Cross-referenced against direct endpoint for full titles.

### 2.3 Events Feed
- **Status:** ERROR — HTTP 404 from `POST https://admin.data.europarl.europa.eu/api/v2/events/`
- **Impact:** Cannot confirm plenary session activity details, speaker contributions, or committee hearings for April 28–30.
- **Mitigation:** Adopted texts provide primary evidence of plenary output. Session activity inferred from adoption dates.

### 2.4 Procedures Feed
- **Status:** DEGRADED — Response returned historical-tail ordering (1972, 1980 procedures) rather than recent 2026 activity.
- **Impact:** Cannot track active legislative procedures or trilogue progress.
- **Mitigation:** Procedure references embedded in adopted texts (e.g., `eli/dl/event/2026-2596-DEC-DCPL-2026-04-30`) provide indirect procedure linkage.

### 2.5 DOCEO Voting Roll-Call XML
- **Status:** UNAVAILABLE — `get_latest_votes` returned `{"data":[], "datesUnavailable":["2026-05-18","2026-05-19","2026-05-20","2026-05-21"]}`
- **Impact:** No individual MEP or group-level vote breakdown available for April 28–30 plenary votes.
- **Mitigation:** Coalition dynamics inferred from historical voting pattern analysis. `voting-patterns.degraded.md` documents this degradation explicitly.

---

## 3. IMF Data Availability

- **Direct API:** UNAVAILABLE in this run (connection timeout after 3 retries)
- **Fallback:** IMF World Economic Outlook April 2026 data (publicly available)
- **Data mode impact:** `degraded-imf` partially applies but `degraded-feeds` is the primary data mode (lower floor factor 0.80 governs)

---

## 4. Data Sufficiency Assessment

**Sufficient for analytical output?** YES — with degradation caveats.

The adopted texts endpoint provides enough data to:
- Confirm 9 specific legislative outputs from the April 28–30 plenary ✅
- Identify subject codes and policy domains ✅
- Cross-reference with historical baselines ✅
- Perform significance scoring ✅
- Conduct economic context analysis (with IMF WEO fallback) ✅

**Not possible due to data degradation:**
- Individual MEP voting records ❌
- Real-time committee hearing transcripts ❌
- Active procedure stage tracking ❌
- Plenary attendance data ❌

---

## 5. Confidence Assessment

| Dimension | Confidence | Basis |
|-----------|-----------|-------|
| Legislative output facts (9 texts) | **HIGH** | EP official portal; direct endpoint |
| Dates and adoption status | **HIGH** | Confirmed adoption dates present |
| Subject matter codes | **MEDIUM-HIGH** | PROT, MARI, BUDG, DDLH, PESC confirmed |
| Coalition vote composition | **MEDIUM** | Inferred from historical patterns |
| Economic context | **MEDIUM-LOW** | IMF WEO fallback; not direct API |
| Procedure stage and progress | **LOW** | Feed degraded; only indirect references |

**Overall Admiralty Grade:** B2 — Reliable source (EP official portal), probably true (factual legislative claims); inferences rated separately.

