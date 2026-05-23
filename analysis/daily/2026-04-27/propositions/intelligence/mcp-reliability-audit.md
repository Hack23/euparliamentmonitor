<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EU Parliament Propositions
**Date:** 2026-04-27 | **Run:** propositions | **Stage:** B (Post-data-collection)

---

## Overview

This audit documents the operational reliability of the EP MCP server tools used during Stage A of this run, triages all anomalies against `.github/prompts/07-mcp-reference.md` §11, and provides data quality flags for all downstream consumers. All known degraded-upstream patterns are excluded from upstream issue filing per the triage policy.

---

## Server Configuration

| Parameter | Value |
|-----------|-------|
| MCP Server | european-parliament-mcp-server@1.2.15 |
| World Bank MCP | worldbank-mcp@1.0.1 |
| Gateway | EP_MCP_GATEWAY_URL (localhost:8080 default) |
| Timeout | EP_REQUEST_TIMEOUT_MS = 120000ms |
| Run Date | 2026-04-27 |
| Run Epoch | 1777271418 |

---

## Tool Invocation Log

### T1: `get_procedures_feed(timeframe: "one-week")`

**Status:** 🔴 RECESS_MODE
**Items Returned:** Historical archive items (procedures from 1972–1987 era)
**Triage:** ⚠️ Known degraded-upstream pattern — see `07-mcp-reference.md` §11 row #5
**Classification:** `detectProceduresFeedRecessMode` returns `recessMode: true` when all items ≤ 1995
**Action Taken:** Used `track_legislation` for specific procedures; `get_procedures` (paginated) as fallback
**Upstream Issue Filing:** ❌ NOT REQUIRED — known behavior, tracked in §11

### T2: `get_external_documents_feed(timeframe: "one-week")`

**Status:** 🟢 OPERATIONAL
**Items Returned:** 6 ACT_FOLLOWUP documents (dated 2026-04-22)
**Coverage:** Commission follow-up actions for EP positions TA-10-2025-0300, 0314, 0327, TA-10-2026-0029, 0059, 0085
**Data Quality:** ✅ Fresh data (within 5 days of run date)
**Completeness Note:** External documents feed does not return full text; only document metadata and reference IDs
**Upstream Issue Filing:** N/A

### T3: `get_committee_documents_feed`

**Status:** 🔴 UNAVAILABLE
**Items Returned:** 0
**Error Type:** EP API error in body (malformed or empty response)
**Triage:** Known degraded feed behavior (committee documents EP API instability)
**Classification:** Per §11 — committee_documents_feed endpoint has known periodic unavailability
**Action Taken:** Proceeded without committee-level documents for this run
**Impact on Analysis:** Moderate — committee reports provide more granular procedure status but are supplemented by `track_legislation` data
**Upstream Issue Filing:** ❌ NOT REQUIRED for known-degraded endpoint

### T4: `get_adopted_texts(year: 2026)` (×3 pages)

**Status:** 🟢 OPERATIONAL
**Items Returned:** 71 adopted texts for 2026 (through early April 2026)
**Pagination:** 3 pages retrieved; offset=0,50,100
**Data Quality:** ✅ High — adopted texts catalog is authoritative
**Notable Finding:** Most recent texts stop at March 26, 2026 (T-10-2026-0100s range) — April items not yet in catalog (OJ publication lag ~3-4 weeks expected)
**Upstream Issue Filing:** N/A

### T5: `get_adopted_texts_feed(timeframe: "one-week")`

**Status:** 🟢 OPERATIONAL
**Items Returned:** 67 items with mixed dates
**FRESHNESS_FALLBACK:** Activated — EP /adopted-texts/feed returned no current-year items; fallback to /adopted-texts?year=2026
**Data Quality:** 🟡 Medium — FRESHNESS_FALLBACK means data may lag by 1–2 days
**Upstream Issue Filing:** N/A (FRESHNESS_FALLBACK is documented behavior)

### T6: `get_plenary_sessions(year: 2026)`

**Status:** 🟡 PARTIAL
**Items Returned:** 10 sessions (January–February 2026 only)
**Missing Data:** March–April 2026 sessions not returned
**Triage:** EP API plenary sessions endpoint has a ~4-6 week lag on populating recent sessions
**Action Taken:** Used `get_adopted_texts` as proxy for March 26 session content (TA-10-2026 numbering)
**Impact:** Moderate — session-level voting detail unavailable; procedure-level data unaffected
**Upstream Issue Filing:** N/A

### T7: `monitor_legislative_pipeline(dateFrom: 2026-03-28, dateTo: 2026-04-27)`

**Status:** 🔴 EMPTY RESULT
**Items Returned:** 0 active procedures with enrichment data
**Error Type:** "enrichment data missing for 20 procedures" — pipeline health endpoint returns no items when enrichment layer unavailable
**Triage:** Known behavior — `monitor_legislative_pipeline` requires enrichment cache that is periodically unavailable
**Action Taken:** Fell back to `track_legislation` for individual procedures
**Upstream Issue Filing:** N/A

### T8: `generate_political_landscape`

**Status:** 🟢 OPERATIONAL
**Items Returned:** Complete EP10 composition (9 groups, 719 MEPs, seat counts)
**Data Quality:** ✅ High
**Upstream Issue Filing:** N/A

### T9: `analyze_coalition_dynamics(groupIds: ["EPP","S&D","Renew","Greens/EFA","ECR","PfE","Left","NI"])`

**Status:** 🟡 PARTIAL (vote-level data unavailable)
**Coalition Pairs:** sizeSimilarityScore available (proxy)
**Vote-Level Cohesion:** NULL — EP API does not expose per-MEP roll-call data
**Triage:** Known EP Open Data Portal limitation — per §11, sizeSimilarityScore is group-size ratio proxy, NOT vote cohesion. The `minimumCohesion` parameter applies to this proxy.
**Action Taken:** Used sizeSimilarityScore for alliance signal detection; explicitly labeled in synthesis as proxy
**Upstream Issue Filing:** ❌ NOT REQUIRED — documented limitation

### T10: `get_voting_records(dateFrom: 2026-04-01)`

**Status:** 🔴 EMPTY (expected)
**Items Returned:** 0 records for April 2026
**Triage:** EP publishes roll-call voting data with a delay of 4–6 weeks. Queries for the most recent 1–2 months routinely return empty results. Per §11 documented behavior.
**Action Taken:** Used get_adopted_texts as proxy for votes (TA numbers = adopted positions)
**Upstream Issue Filing:** N/A

### T11: `track_legislation(procedureId: "2023/0111(COD)")` — SRMR3

**Status:** 🟢 OPERATIONAL
**Events Returned:** Full timeline from proposal through OJ publication
**Data Quality:** ✅ High
**Upstream Issue Filing:** N/A

### T12: `track_legislation(procedureId: "2023/0135(COD)")` — Anti-Corruption

**Status:** 🟢 OPERATIONAL
**Events Returned:** Full timeline including EP first reading March 26
**Data Quality:** ✅ High
**Upstream Issue Filing:** N/A

### T13: `track_legislation(procedureId: "2025/0261(COD)")` — US Tariffs

**Status:** 🟢 OPERATIONAL
**Events Returned:** Timeline through first trilogue April 13
**Data Quality:** ✅ High
**Upstream Issue Filing:** N/A

### T14: `get_all_generated_stats(category: "legislative_acts", yearFrom: 2024, yearTo: 2026)`

**Status:** 🟢 OPERATIONAL
**Data Quality:** ✅ High — pre-computed static data with weekly refresh
**Q1 2026 data confirmed:** Yes
**Upstream Issue Filing:** N/A

### T15: `world-bank-get-economic-data(countryCode: "DE", indicator: "GDP_GROWTH")`

**Status:** 🟢 OPERATIONAL
**Data Quality:** ✅ High
**Data Points:** 10 years (2015–2024)
**Upstream Issue Filing:** N/A

---

## Summary Reliability Score

| Tier | Status | Count | Notes |
|------|--------|-------|-------|
| 🟢 OPERATIONAL | Fully functional | 9 | Political landscape, procedure tracking, adopted texts, stats, WB |
| 🟡 PARTIAL | Degraded but usable | 4 | Plenary sessions, coalition dynamics, adopted texts feed, voting records |
| 🔴 UNAVAILABLE | No data returned | 3 | Procedures feed (RECESS_MODE), committee docs, pipeline monitor |
| **Total** | | **16** | |

**Overall Assessment:** 🟡 DEGRADED — key feeds partially unavailable, but sufficient data obtained via alternative endpoints for HIGH-quality analysis.

---

## Triage Classification (per 07-mcp-reference.md §11)

| Tool | Classification | Triage Result | File Upstream Issue? |
|------|---------------|--------------|---------------------|
| get_procedures_feed | 🔵 KNOWN DEGRADED (row #5) | RECESS_MODE | ❌ No |
| get_committee_documents_feed | 🟡 KNOWN INTERMITTENT | Unavailable | ❌ No |
| monitor_legislative_pipeline | 🟡 KNOWN INTERMITTENT | Empty enrichment | ❌ No |
| get_voting_records (April) | 🔵 KNOWN DELAYED | EP publication lag | ❌ No |
| analyze_coalition_dynamics | 🔵 KNOWN LIMITATION | Size proxy only | ❌ No |

**No upstream issues to file for this run.** All anomalies are documented known-degraded patterns.

---

## Data Completeness Impact on Article

| Analysis Area | Data Completeness | Article Impact |
|--------------|------------------|----------------|
| SRMR3 status | 🟢 HIGH | Full procedure timeline available |
| Anti-Corruption Directive | 🟢 HIGH | Full procedure timeline available |
| US Tariff Counter-measures | 🟢 HIGH | Trilogue timeline confirmed |
| Political composition | 🟢 HIGH | Current seat counts confirmed |
| Coalition dynamics | 🟡 MEDIUM | Size proxies only; no vote data |
| Commission follow-ups | 🟡 MEDIUM | 6 documents confirmed; full text not retrieved |
| Recent voting records | 🔴 LOW | EP API lag; adopted texts proxy used |
| Committee-level proceedings | 🔴 LOW | Committee docs unavailable; narrative gap |

---

*MCP Reliability Audit: 2026-04-27 | Version: european-parliament-mcp-server@1.2.15*
