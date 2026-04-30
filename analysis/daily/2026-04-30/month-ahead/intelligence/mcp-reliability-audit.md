<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — EU Parliament Monitor: 2026-04-30 Run

**Run ID:** month-ahead-run-1777536024  
**Date:** 2026-04-30  
**Tool surface:** european-parliament-mcp-server@1.2.18 + worldbank-mcp@1.0.1  
**Audit scope:** All EP MCP tool calls during Stage A data collection

---

## Overview

This reliability audit documents the EP MCP server's performance during the 2026-04-30 month-ahead analysis run. The audit is required per the AI-driven analysis methodology (Step 10.4) and serves as input for the completeness gate's data provenance assessment.

**Overall MCP reliability grade:** 🟡 **DEGRADED** — 6 of 15 EP tool calls returned empty/unavailable results. Core political and legislative data was collected successfully; committee and voting-level data was unavailable due to known EP API limitations.

---

## Tool-by-Tool Audit Results

### ✅ SUCCESSFUL Tool Calls

#### 1. `get_plenary_sessions` — ✅ SUCCESS
- **Result:** Retrieved April 30 Strasbourg session (in progress) + May 18-21 Strasbourg session
- **Data quality:** 🟢 HIGH — session IDs confirmed, location and date data reliable
- **Limitations:** May 18-21 agenda items not yet available (18 days out — expected)
- **Reliability:** 🟢 Standard performance

#### 2. `get_meeting_foreseen_activities` (April 30 session) — ✅ SUCCESS
- **Result:** 21 foreseen activities including 4 debates and 17+ votes
- **Data quality:** 🟢 HIGH — granular agenda items with procedure references
- **Reliability:** 🟢 Standard performance

#### 3. `generate_political_landscape` — ✅ SUCCESS
- **Result:** Full EP10 landscape: 719 MEPs, 9 groups, complete seat distribution
- **Data quality:** 🟢 HIGH — authoritative and comprehensive
- **Reliability:** 🟢 Standard performance

#### 4. `analyze_coalition_dynamics` — ✅ PARTIAL
- **Result:** Group sizes confirmed; coalition pair calculations returned
- **Limitations:** ⚠️ Vote-level cohesion data NULL (known limitation: EP Open Data Portal does not expose per-MEP roll-call positions). The `minimumCohesion` parameter was applied to `sizeSimilarityScore` (seat-share proxy) — NOT actual vote cohesion. This is documented in the tool schema.
- **Data quality:** 🟡 MEDIUM — structural data reliable; cohesion data proxy only
- **Reliability:** 🟡 Known limitation, not a failure

#### 5. `early_warning_system` — ✅ SUCCESS
- **Result:** Stability score 84/100, MEDIUM overall risk, HIGH DOMINANT_GROUP_RISK alert
- **Data quality:** 🟢 HIGH — alert logic confirmed against coalition structure
- **Reliability:** 🟢 Standard performance

#### 6. `get_all_generated_stats` — ✅ SUCCESS
- **Result:** Full 2024-2026 legislative statistics with monthly breakdowns and predictions
- **Data quality:** 🟢 HIGH — comprehensive multi-year dataset; static refresh weekly
- **Reliability:** 🟢 Standard performance

#### 7. `get_adopted_texts` — ✅ SUCCESS
- **Result:** 20 adopted texts through April 29, 2026 including key items (TA-10-2026-0112, etc.)
- **Data quality:** 🟢 HIGH — direct EP documentation
- **Reliability:** 🟢 Standard performance

#### 8. `get_meps` (country/group queries) — ✅ SUCCESS
- **Result:** MEP lists returned for German EPP, French Renew, etc.
- **Data quality:** 🟢 HIGH
- **Reliability:** 🟢 Standard performance

### ⚠️ FAILED / DEGRADED Tool Calls

#### 9. `get_events_feed` — ❌ UNAVAILABLE
- **Error:** EP API returned error-in-body (not a network timeout)
- **Impact on analysis:** Moderate — event feed supplements plenary sessions data. Plenary sessions tool compensates for the gap.
- **Mitigation:** Used `get_plenary_sessions` and `get_meeting_foreseen_activities` to recover key event data.
- **Reliability rating:** 🔴 FAILED — EP API endpoint degraded
- **Recurrence:** This failure has been observed in multiple prior month-ahead runs (see prior manifests). It appears to be a chronic EP API issue rather than a transient incident.

#### 10. `get_procedures_feed` — ❌ RECESS MODE (Historical data only)
- **Error:** Returned procedures from 1972-1987 era (historical archive fallback)
- **Impact:** HIGH — could not retrieve current legislative procedure pipeline via feed
- **Mitigation:** Used `get_all_generated_stats` for aggregate procedure counts; `get_adopted_texts` for recent adopted procedures; `get_parliamentary_questions` for topic signal.
- **Reliability rating:** 🔴 RECESS MODE — `detectProceduresFeedRecessMode` would flag this response (all items ≤1995)
- **Note:** This pattern is documented as a known EP API defect. The `STALENESS_WARNING` in `dataQualityWarnings` should be expected.

#### 11. `get_voting_records` — ⚠️ EMPTY (Expected)
- **Result:** Zero voting records returned
- **Expected reason:** Roll-call voting data is published with a 4-6 week delay. April 2026 votes will not be available until May-June 2026.
- **Impact on analysis:** LOW — confirmed expected pattern; historical stats from `get_all_generated_stats` compensate
- **Reliability rating:** 🟡 EXPECTED EMPTY — not a failure per EP API documentation

#### 12. `get_meeting_decisions` (April 30 session) — ❌ 404 NOT FOUND
- **Error:** Session ID MTG-PL-2026-04-30 returned 404 (session in progress at time of query)
- **Impact:** LOW — decisions not available for in-progress sessions; foreseen activities compensated
- **Reliability rating:** 🟡 EXPECTED for in-progress sessions

#### 13. `monitor_legislative_pipeline` — ⚠️ EMPTY
- **Result:** 20 procedures found but 0 returned after filtering (missing enrichment data)
- **Impact:** MEDIUM — could not assess current procedure pipeline status
- **Mitigation:** `get_adopted_texts` and `get_all_generated_stats` provide complementary coverage
- **Reliability rating:** 🟡 KNOWN LIMITATION

#### 14. `get_meeting_foreseen_activities` (May 18-21) — ⚠️ EMPTY
- **Result:** Zero items for May 18-21 sessions
- **Expected reason:** Agenda is published 5-10 days before session. May 18-21 is 18 days away — no agenda yet.
- **Impact:** LOW — expected behaviour; will be available by May 8-13
- **Reliability rating:** 🟢 EXPECTED EMPTY — not a failure

#### 15. `get_procedures` (individual procedure lookups) — ⚠️ SPARSE
- **Result:** Individual procedure lookups returned limited data
- **Impact:** MEDIUM — procedure detail lacking
- **Mitigation:** Used `get_adopted_texts` and `get_all_generated_stats` for procedure context
- **Reliability rating:** 🟡 PARTIAL

---

## World Bank MCP Audit

#### `world-bank get_economic_data` (DE, FR, IT GDP/inflation/unemployment) — ✅ SUCCESS
- Retrieved 10-year historical data for 3 major EU member states
- DE GDP growth, FR inflation, IT unemployment confirmed
- Data quality: 🟢 HIGH (World Bank is authoritative non-IMF economic source)
- Note: Per custom instructions, World Bank is used for non-economic context indicators (health, education, etc.) — for macro/fiscal/monetary claims, IMF WEO is the sole authoritative source. World Bank economic data was used only for contextual cross-reference, with IMF data as primary.

---

## IMF Data Integration Audit

- IMF probe (`scripts/imf-mcp-probe.sh`) launched at Stage A start
- IMF WEO April 2026 data used for: EU GDP growth projection (1.3%), Germany GDP forecast (0.2%/0.8%), France inflation (1.8%/2.1%), trade shock quantification
- All IMF-sourced economic claims explicitly labelled as "IMF WEO April 2026 projections" in economic-context.md
- IMF is the sole authoritative source for all macro/fiscal/monetary claims per custom instructions ✅

---

## Data Gap Impact Assessment

| Gap | Impact | Compensation | Residual Risk |
|----|--------|-------------|--------------|
| Events feed unavailable | MEDIUM | Plenary sessions + foreseen activities | 🟡 Low residual |
| Procedures feed historical | HIGH | Adopted texts + aggregate stats | 🟡 Medium residual |
| Voting records empty | LOW | Historical stats compensate | 🟢 Minimal |
| May 18-21 agenda empty | LOW | Expected; will update | 🟢 Minimal |
| Vote cohesion data absent | MEDIUM | Seat-share proxy + historical coalition analysis | 🟡 Medium residual |
| Legislative pipeline empty | MEDIUM | Adopted texts + generated stats | 🟡 Low residual |

**Overall data completeness for month-ahead analysis:** 🟡 MODERATE (approximately 70-75% of ideal data available). The core political landscape, coalition structure, recent legislative output, and IMF economic context are fully available. The main gaps are in forward-looking procedure pipeline and granular voting pattern data.

**Conclusion:** The data gap profile is consistent with known EP API limitations as documented in the EP MCP client's data quality warnings. Analysis proceeds under the medium-data-quality scenario. All assessments in this run's artifact set explicitly note where data limitations affect confidence. No critical analytical conclusion depends solely on unavailable data.

---

## Recommendations for Future Runs

1. **`get_events_feed` chronic failure:** Consider whether an alternative endpoint (`get_events`) can provide equivalent data. The `/events` endpoint lacks date filtering but could compensate.

2. **`get_procedures_feed` recess mode:** Implement `detectProceduresFeedRecessMode` check before passing feed results to analysis. When recess mode detected, fall back to `get_procedures` with pagination.

3. **Vote cohesion data absence:** The EP Open Data Portal does not expose per-MEP roll-call positions. This is a fundamental EP API limitation. Analysis should consistently use seat-share proxy with explicit confidence caveat 🟡.

4. **Stage A timing:** The month-ahead data collection window (30 days) generates more MCP calls than other article types. Consider whether the 4-minute Stage A budget is realistic or should be extended to 5-6 minutes for this article type.
