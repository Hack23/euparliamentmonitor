# MCP Reliability Audit — EU Parliament Propositions 2026-05-15
**Run ID:** propositions-run264-1778825897 | **Stage:** A Data Collection
**Purpose:** Endpoint-by-endpoint reliability record for this run

---

## 🔌 EP MCP Endpoint Status Summary

| Endpoint | Called | Status | Items | Quality |
|----------|--------|--------|-------|---------|
| `get_procedures_feed` | ✅ Yes | ❌ DEGRADED | 50 (1970s-87 data) | NONE |
| `get_adopted_texts` (year=2026) | ✅ Yes | ✅ OK | 51 items | HIGH |
| `get_procedures` | ✅ Yes | ❌ DEGRADED | 20 (1972-87 data) | NONE |
| `monitor_legislative_pipeline` | ✅ Yes | ❌ EMPTY | 0 procedures | NONE |
| `get_latest_votes` | ✅ Yes | ❌ UNAVAILABLE | 0 (no DOCEO XML) | NONE |
| Pre-fetched `procedures-feed.json` | N/A (pre-run) | ❌ ERROR 404 | Error | NONE |
| Pre-fetched `committee-documents-feed.json` | N/A (pre-run) | ❌ UNAVAILABLE | 0 | NONE |
| Pre-fetched `external-documents-feed.json` | N/A (pre-run) | ❌ EMPTY | 0 items | NONE |

**Overall EP MCP Reliability:** 🔴 SEVERELY DEGRADED — Only 1 of 8 endpoint calls returned usable data.

---

## 📋 Detailed Endpoint Analysis

### 1. `get_procedures_feed` — DEGRADED
**Status:** Called with `timeframe: "one-week"`
**Response:** 50 items returned, BUT all are historical procedures from 1972-1987
- Oldest: 1972/0003(COD)
- Most recent: 1987/1140(CNS)
- All items have empty stage, status, dateInitiated, dateLastActivity fields
- Response status: `"degraded"`
- Data quality: Completely unusable for current analysis

**Root Cause Hypothesis:**
The procedures feed is likely returning data from a paginated endpoint that starts from the beginning of the database (1972) rather than filtering by `dateLastActivity`. The `timeframe: "one-week"` parameter appears to be ignored or non-functional at the data layer.

**Impact:** Cannot identify procedures active in the last 7 days. Cannot track which proposals are currently in committee or awaiting plenary.

**Upstream Issue:** Should be filed with EP IT Services / Open Data Portal team.

---

### 2. `get_adopted_texts` (year=2026) — FUNCTIONAL ✅
**Status:** Called with `year: 2026, limit: 50`
**Response:** 51 items, complete data with titles, dates, procedure references
- Most recent: TA-10-2026-0163 (2026-04-30)
- Coverage: January to April 30, 2026
- Quality: HIGH — titles, dates, procedure IDs all populated

**Notes:**
- `hasMore: true` indicates >50 items exist; 51 retrieved in this call
- Some items have empty `procedureReference` fields (4 of 51)
- Some items have empty `subjectMatter` fields (several)
- The EP budget annex item (TA-10-2026-04-30-ANN01) has a non-standard reference format

**Reliability Rating:** ✅ HIGH CONFIDENCE

---

### 3. `get_procedures` (direct) — DEGRADED
**Status:** Called with `limit: 20, offset: 0`
**Response:** Same degraded data as procedures feed — 1972-1985 era procedures
**Root Cause:** Same underlying database cursor issue as procedures feed
**Impact:** No 2025-2026 procedures identifiable by ID for `track_legislation` calls without prior knowledge of procedure IDs

---

### 4. `monitor_legislative_pipeline` — EMPTY/DEGRADED
**Status:** Called with `status: "ACTIVE", limit: 30`
**Response:** `"pipeline": [], "totalProcedures": 0, "confidenceLevel": "LOW"`
**Root Cause:** Relies on the same `/procedures` endpoint that is returning only 1972-1987 data
**Impact:** Cannot generate pipeline health metrics based on real current data

---

### 5. `get_latest_votes` — UNAVAILABLE
**Status:** Called with `includeIndividualVotes: false, limit: 30`
**Response:** `"data": [], "datesAvailable": [], "datesUnavailable": ["2026-05-11","2026-05-12","2026-05-13","2026-05-14"]`
**Root Cause:** DOCEO XML vote documents not yet published for the week of May 11-15, 2026. This can mean:
  1. No plenary session this week (likely — EP plenary calendar may show a committee/non-voting week)
  2. DOCEO publication delay (votes typically published 24-48 hours after plenary)
  3. Technical issue with the DOCEO XML endpoint

**Impact:** No roll-call vote data for current week analysis. Coalition and cohesion analysis is impossible.

---

### 6. Pre-fetched `procedures-feed.json` — ERROR 404
**Status:** Pre-fetched by `scripts/prefetch-ep-feeds.sh` before agent start
**Content:** `{"@id":"https://data.europarl.europa.eu/eli/dl/proc/2025-0413","error":"404 Not Found from POST..."}`
**Root Cause:** The pre-fetch script attempted a specific procedure lookup (2025-0413) rather than the feed endpoint
**Impact:** Procedure-specific data not available in pre-fetch

---

### 7. Pre-fetched `committee-documents-feed.json` — UNAVAILABLE
**Content:** `{"status":"unavailable","items":[],"itemCount":0,...}`
**Root Cause:** The committee documents feed reports status "unavailable" — this is consistent with documented EP API behaviour during low-activity periods
**Impact:** No committee document data for recent EP committee meetings

---

### 8. Pre-fetched `external-documents-feed.json` — EMPTY
**Content:** `{"items":[]}` — zero items returned
**Root Cause:** The EP external documents feed may have a 24-48 hour publication delay or may not contain recent Commission documents
**Impact:** Cannot confirm what new Commission proposals were published in the last week

---

## 📊 Reliability Trend Assessment

### Historical Context
This run's data quality (1/8 endpoints functional) is significantly worse than expected. Based on prior run knowledge:
- `get_adopted_texts` is consistently the most reliable endpoint (✅ confirmed)
- `get_procedures_feed` has had intermittent quality issues (🔴 confirmed degraded today)
- Committee documents feed typically works (🔴 today unavailable)
- DOCEO votes are dependent on plenary week (🟡 no data for non-plenary week is expected)

### Reliability Score
| Component | Score | Trend |
|-----------|-------|-------|
| Procedures infrastructure | 1/10 | 📉 Declining |
| Adopted texts infrastructure | 9/10 | ➡️ Stable |
| Vote infrastructure | 3/10 | 🟡 Variable |
| Committee/document feeds | 2/10 | 📉 Declining |
| **Overall reliability** | **4/10** | **📉 Declining** |

---

## ⚡ Impact on Analysis Quality

| Analysis Domain | Impact | Mitigation |
|----------------|--------|-----------|
| Current procedure identification | 🔴 SEVERE | Used adopted texts procedure references |
| Pipeline health assessment | 🔴 SEVERE | Based on historical patterns + WB/IMF data |
| Coalition and vote analysis | 🔴 SEVERE | Inferred from group seat distribution |
| Adopted legislation analysis | 🟢 MINIMAL | 51 texts available |
| Forward-looking propositions | 🟡 MODERATE | Based on Commission WP knowledge |

---

## 🔧 Recommended Actions

1. **EP IT escalation:** The procedures feed is returning 1970s data — this is a critical data quality regression that affects all analytical workflows relying on current procedure tracking.

2. **DOCEO timing check:** Confirm whether May 11-15 2026 is a non-plenary week. If non-plenary, "no vote data" is expected. If plenary, this is a system failure.

3. **Pre-fetch script review:** The `prefetch-ep-feeds.sh` script's procedures-feed.sh appears to be calling a specific procedure URL rather than the feed endpoint — needs correction.

4. **Fallback data strategy:** For future runs where procedures feed is degraded, automatically fall back to adopted texts timeline analysis + EUR-Lex cross-reference.

---

## 📝 Upstream Issues Log

| Issue | Endpoint | Severity | Action |
|-------|---------|---------|--------|
| Procedures feed returns 1972-1987 data | /procedures | 🔴 CRITICAL | Report to EP Open Data |
| Pipeline monitor returns 0 procedures | /procedures | 🔴 CRITICAL | Same root cause |
| Committee docs unavailable | /committee-documents/feed | 🟠 HIGH | Report to EP IT |
| External docs 0 items | /external-documents/feed | 🟡 MEDIUM | Monitor; may be latency |

---

*MCP Reliability Audit v1.0 | 2026-05-15 | EU Parliament Monitor | Hack23 AB | Apache-2.0*
