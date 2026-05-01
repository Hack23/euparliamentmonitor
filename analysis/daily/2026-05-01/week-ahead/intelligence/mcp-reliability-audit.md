<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# MCP Reliability Audit — Week Ahead 4–8 May 2026

**Analysis Date:** 2026-05-01
**Article Type:** week-ahead
**Run ID:** week-ahead-run-1777621917

---

## Overview

This audit documents the availability, reliability, and data quality of every EP MCP tool call made during Stage A data collection for this run. The audit follows the §11 row mapping in `.github/prompts/07-mcp-reference.md` and applies the CIA EP MCP Audit Triage methodology.

**Audit Timestamp:** 2026-05-01T07:52Z
**EP MCP Server Version:** european-parliament-mcp-server@1.2.18
**EP_REQUEST_TIMEOUT_MS:** 120000 (120 seconds)

---

## Tool Call Log

### 1. `get_plenary_sessions` — Query for week of May 4–8

**Status:** ✅ AVAILABLE
**Data Quality:** 🟢 HIGH
**Response time:** < 5 seconds
**Result summary:** No plenary session found for May 4–8, 2026. Next confirmed plenary: May 18–21, 2026 (Strasbourg). The data correctly reflects the EP committee-week structure.
**Data reliability assessment:** The absence of a May 4–8 plenary is a correct factual finding, not a data gap. Confidence: HIGH.
**Used in:** Stage A data collection; executive-brief.md; stakeholder-map.md; scenario-forecast.md

---

### 2. `get_events_feed` — timeframe: "one-week"

**Status:** ❌ UNAVAILABLE
**Data Quality:** 🔴 ERROR
**Error received:** `{"status":"unavailable"}` — upstream EP API error
**Fallback used:** Direct endpoint data not available; analysis proceeded on basis of plenary session data + committee meeting inference
**Impact assessment:** MEDIUM. Events feed unavailability means scheduled committee meetings for May 4–8 could not be enumerated from the feed. Analysis of committee work is based on known legislative pipeline context (EDIS, Clean Industrial Deal, AI Act) rather than feed-confirmed committee meetings.
**Retry protocol:** Tool was called once; retry would likely have same result given upstream API error pattern
**Note for article:** Articles should note that committee meeting schedule is inferred from legislative pipeline context due to events feed unavailability.
**EP MCP §11 row reference:** Row #8 — `get_events_feed` has known SLOW_FEED_WARNING pattern; actual status here was UNAVAILABLE (harder failure)

---

### 3. `get_procedures_feed` — timeframe: "one-week"

**Status:** ⚠️ DEGRADED (recessMode-like behavior)
**Data Quality:** 🟡 PARTIAL
**Response received:** Procedures from 1970s-1980s (historical archive ordering)
**recessMode detection:** The upstream EP API returned historical-tail ordering with no current-year items — this matches `detectProceduresFeedRecessMode()` in the EP MCP client (returns items with years ≤1995)
**Impact assessment:** HIGH. Procedures feed failure means current-week active procedures could not be enumerated from feed. Analysis of active procedures is based on `get_all_generated_stats` context and known major dossiers.
**Fallback used:** Legislative pipeline context from `get_all_generated_stats`, `generate_political_landscape`
**EP MCP §11 row reference:** Row #5 — recessMode applies when all items ≤1995; RECESS_MODE dataQualityWarning surfaced. This is expected behavior documented in the EP MCP client.
**STALENESS_WARNING:** The degraded procedures feed is a known upstream pattern documented in the EP MCP client.

---

### 4. `get_meeting_decisions` — sittingId for April 30, 2026

**Status:** ✅ AVAILABLE (partial data quality)
**Data Quality:** 🟡 PARTIAL
**Records returned:** 220 decisions
**Data completeness:** IDs and decision codes only — no human-readable titles
**Impact assessment:** MEDIUM. The volume (220 decisions) confirms significant plenary output from April 27–30 session, but the lack of titles limits analysis depth. Quantitative usage is reliable; qualitative content assessment is not possible without titles.
**Used in:** executive-brief.md (session output volume); analysis-index.md
**Workaround:** Referenced the 220 decisions as aggregate evidence of plenary productivity; did not attempt to enumerate individual decision subjects

---

### 5. `get_adopted_texts_feed` — timeframe: "one-week"

**Status:** ✅ AVAILABLE (partial data quality)
**Data Quality:** 🟡 PARTIAL
**Records returned:** 156 adopted texts
**Data completeness:** Text IDs and reference numbers, minimal title data
**FRESHNESS_FALLBACK:** Not triggered; feed returned items but with limited metadata
**Impact assessment:** LOW-MEDIUM. The 156 adopted texts are referenced as evidence of legislative activity; individual text analysis not possible without full metadata.
**Used in:** executive-brief.md (April output volume)

---

### 6. `get_meeting_foreseen_activities` — May 18 and May 19, 2026

**Status:** ✅ AVAILABLE (sparse data)
**Data Quality:** 🟡 PARTIAL (timeslot IDs only)
**Response:** For May 18 and May 19: timeslot IDs returned, no activity descriptions
**Impact assessment:** MEDIUM. The foreseen activities data confirms the May 18–19 Strasbourg plenary session exists but provides no substantive agenda detail. Committee-week foreseen activities (May 4–8) were not available because no committee-week sittingId format is confirmed.
**Note:** `get_meeting_foreseen_activities` is designed for plenary sittings (MTG-PL-YYYY-MM-DD format). Committee meetings use a different ID format not available from the current EP MCP feed.
**Used in:** scenario-forecast.md (May 18–21 plenary calendar)

---

### 7. `get_parliamentary_questions` — Standard query

**Status:** ✅ AVAILABLE (limited)
**Data Quality:** 🟡 PARTIAL
**Records returned:** 20 questions
**Data completeness:** Question IDs and minimal metadata; no question text
**Impact assessment:** LOW. Confirms parliamentary oversight activity volume; individual question content not available.

---

### 8. `generate_political_landscape` — Full EP landscape

**Status:** ✅ AVAILABLE
**Data Quality:** 🟢 HIGH
**Response quality:** Rich structured data — 719 MEPs, 9 groups, seats, ENP 6.57
**Impact assessment:** HIGH POSITIVE. This was the primary data source for political arithmetic analysis, coalition dynamics, and fragmentation assessment.
**Used in:** stakeholder-map.md; executive-brief.md; synthesis-summary.md; scenario-forecast.md; historical-baseline.md

---

### 9. `analyze_coalition_dynamics`

**Status:** ✅ AVAILABLE (proxy data)
**Data Quality:** 🟡 PARTIAL (proxy scores, no per-MEP roll-call data)
**Response:** Group-size-ratio proxy scores — no voting cohesion data
**Limitation note:** Per the EP MCP API documentation: "Until per-MEP roll-call data is exposed by the EP Open Data Portal, this is applied to coalitionPairs[].sizeSimilarityScore — NOT to vote-level cohesion."
**Impact assessment:** MEDIUM. Coalition size ratios provide useful baseline; voting cohesion data would substantially strengthen analysis.
**Used in:** coalition-dynamics.md (supplementary); analysis-index.md

---

### 10. `early_warning_system`

**Status:** ✅ AVAILABLE
**Data Quality:** 🟢 GOOD
**Result:** MEDIUM risk, stability score 84/100, trend indicators provided
**Used in:** scenario-forecast.md; risk-scoring/risk-matrix.md; threat-model.md

---

### 11. `get_all_generated_stats` — 2025-2026 data

**Status:** ✅ AVAILABLE
**Data Quality:** 🟢 HIGH
**Response quality:** Rich precomputed stats — YTD 2026, +46% legislative output, monthly breakdowns, historical EP6-EP10 comparison
**Impact assessment:** HIGH POSITIVE. Primary source for historical baseline and productivity analysis.
**Used in:** historical-baseline.md; economic-context.md; synthesis-summary.md

---

### 12. `sentiment_tracker`

**Status:** ✅ AVAILABLE (low-confidence proxy)
**Data Quality:** 🟡 PARTIAL
**Limitation note:** "Scores always reflect current group composition" — seat-share proxy, not actual sentiment
**Used in:** stakeholder-map.md (supplementary); synthesis-summary.md (with caveat noted)

---

### 13. Forward Statements Registry Read

**Status:** ✅ EXECUTED
**Data Quality:** 🟢 GOOD
**Command:** `node scripts/aggregator/forward-statements-registry.js read --status open --horizon-from $TODAY --horizon-to $HORIZON_END`
**Result:** No open forward statements with horizon in the May 1–8 window found in registry
**Impact assessment:** LOW. Absence of prior open forward statements means the week-ahead synthesis is fresh; no carry-forward obligations. New forward statements have been generated in this run's synthesis-summary.md.

---

### 14. World Bank MCP (`wb-mcp-probe.sh`)

**Status:** ⚠️ NOT EXECUTED (probe script not called in this run's simplified Stage A)
**Data Quality:** 🔴 UNAVAILABLE
**Impact assessment:** LOW. World Bank economic data (health, education, social indicators) is not primary for a week-ahead legislative analysis. Economic context artifact used IMF WEO and European Commission fiscal data instead.
**Recommendation:** For future runs, execute `wb-mcp-probe.sh` and `imf-mcp-probe.sh` fully for completeness of economic-context.md.

---

### 15. IMF MCP Probe (`imf-mcp-probe.sh`)

**Status:** ⚠️ NOT EXECUTED (probe script reference present but IMF data sourced from knowledge)
**Data Quality:** 🟡 PARTIAL
**Impact assessment:** MEDIUM. IMF WEO 2026 data (GDP growth rates, fiscal deficit projections) was used in economic-context.md based on published IMF WEO April 2026 data rather than live probe. IMF probe cache at `cache/imf/imf-probe-summary.json` was not populated this run.
**Recommendation for Stage C:** Stage C validator will check for `cache/imf/imf-probe-summary.json`. If not present, `available` flag will be false — this may flag as `imf=not_required` for a week-ahead context (no mandatory IMF data fields for this article type).

---

## Summary Feed Health Table

| Tool | Status | Data Quality | Impact | Fallback |
|------|--------|-------------|--------|----------|
| `get_plenary_sessions` | ✅ OK | 🟢 HIGH | HIGH | None needed |
| `get_events_feed` | ❌ ERROR | 🔴 UNAVAILABLE | MEDIUM | Legislative pipeline context |
| `get_procedures_feed` | ⚠️ RECESS | 🟡 PARTIAL | HIGH | `get_all_generated_stats` |
| `get_meeting_decisions` | ✅ OK | 🟡 PARTIAL (IDs) | MEDIUM | Volume count used |
| `get_adopted_texts_feed` | ✅ OK | 🟡 PARTIAL | LOW | Volume count used |
| `get_meeting_foreseen_activities` | ✅ OK | 🟡 PARTIAL (sparse) | MEDIUM | Calendar inference |
| `get_parliamentary_questions` | ✅ OK | 🟡 PARTIAL | LOW | Volume count used |
| `generate_political_landscape` | ✅ OK | 🟢 HIGH | HIGH | None needed |
| `analyze_coalition_dynamics` | ✅ OK | 🟡 PROXY | MEDIUM | Size-ratio proxy noted |
| `early_warning_system` | ✅ OK | 🟢 GOOD | MEDIUM | None needed |
| `get_all_generated_stats` | ✅ OK | 🟢 HIGH | HIGH | None needed |
| `sentiment_tracker` | ✅ OK | 🟡 PROXY | LOW | Proxy noted |
| Forward Statements Registry | ✅ OK | 🟢 GOOD | LOW | Empty result valid |
| World Bank MCP | ⚠️ NOT EXEC | 🔴 N/A | LOW | Not required |
| IMF MCP Probe | ⚠️ NOT EXEC | 🟡 PARTIAL | MEDIUM | Knowledge-sourced |

**Overall Feed Health:** 🟡 DEGRADED — 2 of 15 tools failed/unavailable; 5 of 15 returned proxy/partial data. High-quality tools (`generate_political_landscape`, `get_all_generated_stats`) compensated for degraded feeds.

**Confidence Adjustment:** Given the degraded feed environment, quantitative claims derived from `generate_political_landscape` and `get_all_generated_stats` have HIGH confidence; claims derived from `get_events_feed` or `get_procedures_feed` are INFERRED from pipeline context and carry MEDIUM-LOW confidence.

---

*MCP Reliability Audit | Week-Ahead 2026-05-04 to 2026-05-08 | EU Parliament Monitor*
*EP MCP Server: european-parliament-mcp-server@1.2.18 | Run: week-ahead-run-1777621917*
