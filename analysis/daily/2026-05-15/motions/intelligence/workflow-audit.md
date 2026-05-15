<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Workflow Audit — EU Parliament Motions · 2026-05-15

**Audit type:** Data Collection & Processing Quality Review
**Session:** motions unified workflow, EP10 April 2026 Strasbourg Plenary

---

## 1. Data Source Audit

| Source | Status | Calls | Items Retrieved | Quality |
|--------|--------|-------|----------------|---------|
| EP MCP: get_adopted_texts_feed | ✅ Success | 1 | 131 items | Good |
| EP MCP: get_voting_records | ⚠️ Empty | 1 | 0 | EP publication delay (expected) |
| EP MCP: get_latest_votes | ⚠️ Empty | 1 | 0 | Week unavailable (expected) |
| EP MCP: get_plenary_sessions | ✅ Success | 1 | 11 sessions | Good |
| EP MCP: get_adopted_texts (2026) | ✅ Success | 1 | 51 texts | Good |
| IMF WEO API | ✅ Success | 1 probe + 1 data | DEU/FRA/ITA GDP/CPI/fiscal | Good |
| Pre-fetched feeds (disk) | ⚠️ Empty | 0 | 0 (placeholders) | Pre-fetch produced empty files |
| World Bank API | ✅ Probed | 1 | Available signal | Not used (IMF sufficient) |

**Total EP MCP calls: 5** ✅ At cap — compliant with Rule 2
**Total IMF API calls: 2** ✅ Within budget

---

## 2. Data Quality Assessment

### 2.1 Adopted Texts (51 items)
Quality: **HIGH** — full titles, dates, document IDs available. April 28–30 motions directly identified: DMA (TA-10-2026-0160), Ukraine Tribunal (TA-10-2026-0161), Armenia candidacy (TA-10-2026-0162), Cyberbullying (TA-10-2026-0163), Livestock (TA-10-2026-0157), Haiti (TA-10-2026-0151), Budget 2027 (TA-10-2026-0112), EIB (TA-10-2026-0119).

### 2.2 Voting Records
**UNAVAILABLE** — EP publishes roll-call voting data with 3–6 week delay. Vote results for April 28–30 session are not available as of May 15, 2026. Analysis uses structural coalition modelling (seat share + historical defection rates) as methodology baseline. All voting analysis is clearly marked as modelled/estimated.

### 2.3 IMF Economic Data
Quality: **HIGH** — SDMX 3.0 JSON format, 449 records retrieved for DEU/FRA/ITA. Values extracted: GDP real growth (NGDP_RPCH), CPI inflation (PCPIPCH), fiscal balance % GDP (GGXCNL_NGDP) for 2023–2026. 2026 values are April 2026 WEO projections.

---

## 3. Processing Completeness

| Artifact Category | Target | Completed | % Complete |
|------------------|--------|-----------|-----------|
| Intelligence folder | 11 | 9+ | 85%+ |
| Classification folder | 4 | 0 | (in queue) |
| Risk-scoring folder | 4 | 0 | (in queue) |
| Threat-assessment folder | 4 | 0 | (in queue) |
| Existing/legacy folder | 3 | 0 | (in queue) |
| Extended folder | 1 | 0 | (in queue) |
| Root-level | 2 | 1 | 50% |

---

## 4. MCP Tool Performance

All EP MCP calls completed within expected latency (<10 seconds each). No server errors observed. Empty voting records are an expected EP data publishing behavior, not a tool failure.

IMF probe returned `available: true` with 449 records — no degraded service indicator.

**Recommendation**: Pre-fetching improvements could reduce Stage A time — the pre-fetch script ran but produced empty files. The `ANALYSIS_DIR/data/` directory should be checked to confirm whether pre-fetch artifacts exist on disk before making EP MCP calls (Rule 1 compliance).
