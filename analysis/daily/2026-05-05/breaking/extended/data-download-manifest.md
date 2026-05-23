<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Download Manifest — Breaking News | 2026-05-05

**Classification:** Public | **Confidence:** 🟢 High | **Produced:** 2026-05-05T07:22Z
**Scope:** Complete record of all data collection attempts, successes, and failures for this run

---

## Run Identification

| Field | Value |
|-------|-------|
| Run ID | breaking-run-1777964477 |
| Run date | 2026-05-05 |
| Session | Run 2 (prior run: breaking-run-1777942844 at 01:00Z) |
| WORKFLOW_START_EPOCH | 1777964477 |
| Stage A start | ~07:02Z |
| Stage A end | ~07:06Z |

---

## Data Source Inventory

### European Parliament MCP Server

| Tool | Parameters | Status | Items Returned | Notes |
|------|-----------|--------|---------------|-------|
| `get_adopted_texts_feed` | `timeframe: "one-week"` | ✅ SUCCESS | 41 items | Feed IDs only; no titles in feed |
| `get_adopted_texts` | `year: 2026, limit: 20, offset: 0` | ✅ SUCCESS | 20 items | WITH titles; April 28–30 texts confirmed |
| `get_adopted_texts` | `year: 2026, limit: 20, offset: 20` | ✅ SUCCESS | 10 items | Additional April 28–30 texts |
| `generate_political_landscape` | (no params) | ✅ SUCCESS | 9 groups | EPP 185, S&D 135, etc. |
| `analyze_coalition_dynamics` | (no params) | ✅ SUCCESS (partial) | Cohesion null | EP API limitation: cohesion metrics not available |
| `get_plenary_sessions` | `year: 2026, limit: 20` | ✅ SUCCESS | 20 sessions | April 28–30 sessions confirmed |
| `get_voting_records` | `dateFrom: 2026-04-28, dateTo: 2026-05-05` | ❌ EMPTY | 0 | EP API: roll-call data delayed 4–6 weeks |
| `get_meps_feed` | `timeframe: "one-week"` | ⚠️ OVERSIZED | 200+ | OVERSIZED_PAYLOAD warning; saved to file |
| `get_meeting_decisions` | `sittingId: [Apr 28, Apr 30]` | ✅ SUCCESS | Large files | Saved to /tmp |
| `get_procedures_feed` | `timeframe: "one-week"` | ⚠️ STALE | Various | Historical/stale data; STALENESS_WARNING |
| `early_warning_system` | `sensitivity: "high", focusArea: "all"` | ✅ SUCCESS | 3 warnings | Stability 84/100; HIGH dominant group risk |
| `get_events_feed` | `timeframe: "today"` | ❌ UNAVAILABLE | 0 | Events feed completely unavailable |
| `get_events_feed` | `timeframe: "one-week"` | ❌ UNAVAILABLE | 0 | Events feed completely unavailable |

### World Bank MCP Server

| Tool | Parameters | Status | Notes |
|------|-----------|--------|-------|
| World Bank tools | Not called in Stage A | — | WB data not critical for breaking news Stage A |

### IMF Data (via fetch-proxy)

| Tool | Parameters | Status | Notes |
|------|-----------|--------|-------|
| `fetch_url` (IMF SDMX) | IMF API endpoint | ❌ DEGRADED MODE | IMF SDMX API unavailable; degraded mode waiver applied per Stage C protocol |

---

## Data Quality Assessment

### A-Grade Data (High reliability)
- ✅ EP adopted texts (titles + document IDs) for April 28–30 session
- ✅ EP political landscape (seat counts, group composition)
- ✅ EP plenary session schedule (dates, locations, attendance counts)
- ✅ EP early warning system output (stability score, risk levels)

### B-Grade Data (Partial reliability)
- ⚠️ EP coalition dynamics (cohesion metrics null — API limitation; using proxy metrics)
- ⚠️ EP procedures feed (stale/historical; not current week content)
- ⚠️ EP MEPs feed (oversized payload; individual MEP data not fully processed)

### C-Grade Data (Not available / degraded)
- ❌ EP voting records (delayed 4–6 weeks — none for April 28–30)
- ❌ EP events feed (completely unavailable)
- ❌ IMF economic data (degraded mode — all IMF-dependent economic claims at LOW confidence)
- ❌ Adopted text full text (OJ publication delay — title-only analysis)

---

## Data Freshness Assessment

| Source | Freshness | Last Known Update | Assessment |
|--------|----------|------------------|-----------|
| EP adopted texts | 5 days old | April 30, 2026 | 🟢 FRESH (within normal EP reporting cycle) |
| EP political landscape | Current | Real-time EP API | 🟢 FRESH |
| EP plenary sessions | Current | Real-time EP API | 🟢 FRESH |
| EP voting records | 5+ weeks delayed | EP API delay | 🔴 STALE (expected) |
| IMF economic data | Unknown | IMF SDMX unavailable | 🔴 UNAVAILABLE |
| Events feed | Unknown | Feed unavailable | 🔴 UNAVAILABLE |

---

## Caching and Storage

| File | Location | Size estimate | Purpose |
|------|----------|--------------|---------|
| `data/adopted-texts-feed.json` | `analysis/daily/2026-05-05/breaking/` | ~10KB | Stage A data cache |
| Meeting decisions | `/tmp/gh-aw/agent/` (ephemeral) | ~50KB | Large API response, not committed |
| MEPs feed | `/tmp/gh-aw/agent/` (ephemeral) | ~100KB | Large API response, not committed |

---

## Prior Run Data Continuity

This run (run 2) extends the prior run (breaking-run-1777942844) which completed Stage B but did not reach Stage C/D/E. Data from prior run carryforward:

- All Stage B artifacts from prior run preserved and extended
- Prior run gateResult was "PENDING" — this run updates to PASS or ANALYSIS_ONLY
- Prior run notes included: "IMF degraded mode; events feed unavailable; procedures feed stale; all April texts 404 (publication delay)"
- This run improvement: April texts now AVAILABLE (feed confirmed 41 items); IMF still degraded; events feed still unavailable

---

## Completeness Rating

| Domain | Coverage | Rating |
|--------|---------|--------|
| April 28–30 adopted texts | 14 key items identified and analyzed | 🟢 COMPLETE |
| Political landscape | Full group breakdown, coalition dynamics | 🟢 COMPLETE |
| Economic context | Available without IMF; partial IMF waiver | 🟡 PARTIAL |
| Geopolitical context | Based on adopted text titles + EP history | 🟡 PARTIAL |
| Voting patterns | No roll-call data; coalition projections only | 🔴 LIMITED |
| Events context | Events feed unavailable | 🔴 UNAVAILABLE |

**Overall data coverage**: MEDIUM-HIGH for political/legislative analysis; LOW for economic/events/voting detail.

---

*Data download manifest produced for 2026-05-05 breaking analysis, run 2. This is the definitive record of data collection scope and limitations for this analysis run.*

---

## Run 3 Data Collection Addendum (2026-05-05T15:40Z)

### Fresh Data Collected — Run 3

| Source | Tool | Result | Items |
|--------|------|--------|-------|
| EP Adopted Texts (2026) | `get_adopted_texts` year=2026 | ✅ SUCCESS | 21 texts |
| EP Adopted Texts Feed | `get_adopted_texts_feed` one-week | ✅ SUCCESS | 294 items |
| EP Political Landscape | `generate_political_landscape` | ✅ SUCCESS | Full composition |
| EP Coalition Dynamics | `analyze_coalition_dynamics` dateFrom=2026-04-01 | ✅ SUCCESS | 9 groups, size-proxy only |
| EP Voting Anomalies | `detect_voting_anomalies` dateFrom=2026-04-28 | ✅ SUCCESS | 0 anomalies detected |
| EP Plenary Sessions | `get_plenary_sessions` dateFrom=2026-04-28 | ⚠️ EMPTY | filteredTotal=0 |
| EP Voting Records | `get_voting_records` dateFrom=2026-04-28 | ⚠️ EMPTY | 0 records (delayed 4-6w) |
| EP Early Warning System | `early_warning_system` sensitivity=high | ✅ SUCCESS | 3 warnings, score=84 |

### Key Confirmed Texts — Run 3

| ID | Title | Date | Tier |
|----|-------|------|------|
| TA-10-2026-0160 | DMA Enforcement Against Designated Gatekeepers | 2026-04-30 | 1 |
| TA-10-2026-0161 | Russia Accountability for Ukraine Attacks | 2026-04-30 | 1 |
| TA-10-2026-0162 | Supporting Democratic Resilience in Armenia | 2026-04-30 | 2 |
| TA-10-2026-04-30-ANN01 | EP Estimates for Financial Year 2027 | 2026-04-30 | 2 |
| TA-10-2026-0112 | Guidelines for 2027 Budget — Section III | 2026-04-28 | 2 |
| TA-10-2026-0142 | EU-Iceland PNR Data Agreement | 2026-04-29 | 3 |
| TA-10-2026-0115 | Dog and Cat Welfare and Traceability | 2026-04-28 | 4 |

### Persistent Data Limitations

- **Events feed**: Unavailable (feed endpoint slow/timing out)
- **Voting records**: Delayed 4–6 weeks from EP adoption — no roll-call data for April 28–30
- **Full resolution text**: EP API returns metadata only; document parsing not implemented
- **IMF SDMX**: Degraded mode — WorldBank GDP proxy used for economic context
- **MEP-level data**: No individual MEP activity data collected this run

*[EXTEND-FROM-PRIOR: extended/data-download-manifest.md — extended with Run-3 data collection table, confirmed texts table, persistent limitations summary]*
