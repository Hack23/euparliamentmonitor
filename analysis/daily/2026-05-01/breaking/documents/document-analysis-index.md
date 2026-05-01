<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — EP Breaking: April 28–30 Plenary
**Date:** 2026-05-01 | **Article Type:** breaking | **Confidence:** 🟢 HIGH

---

## Document Inventory

This index catalogues all documents retrieved, analysed, or referenced during Stage A data collection for this breaking news run. Documents are grouped by type and source.

---

## Group A: EP Adopted Texts (Primary Source)

| Doc ID | Title | Date | Procedure | Status | Intelligence Grade |
|--------|-------|------|-----------|--------|-------------------|
| TA-10-2026-0160 | Enforcement of the Digital Markets Act | 2026-04-30 | Plenary own-initiative | Adopted | A1 — CRITICAL TIER |
| TA-10-2026-0161 | Ensuring accountability for Russia's attacks on Ukraine | 2026-04-30 | Plenary own-initiative | Adopted | A1 — CRITICAL TIER |
| TA-10-2026-0112 | Guidelines for the 2027 budget — Section III | 2026-04-28 | Annual budget procedure | Adopted | A1 — HIGH TIER |
| TA-10-2026-0122 | Control, transparency and traceability of performance-based instruments | 2026-04-28 | BUDG — ordinary legislative | Adopted | A1 — HIGH TIER |
| TA-10-2026-0162 | Supporting democratic resilience in Armenia | 2026-04-30 | AFET — own-initiative | Adopted | A1 — HIGH TIER |
| TA-10-2026-0142 | EU-Iceland PNR data agreement | 2026-04-29 | International agreement | Adopted | A1 — SIGNIFICANT |
| TA-10-2026-0115 | Welfare of dogs and cats and their traceability | 2026-04-28 | AGRI/IMCO — ordinary legislative | Adopted | A1 — SIGNIFICANT |
| TA-10-2026-0151 | Escalating trafficking in Haiti | 2026-04-30 | Emergency resolution | Adopted | A1 — ROUTINE/HUMANITARIAN |
| TA-10-2026-0119 | EIB Group financial activities report 2024 | 2026-04-28 | BUDG — annual | Adopted | A1 — ROUTINE/GOVERNANCE |
| TA-10-2026-0132 | Discharge 2024 — Committee of the Regions | 2026-04-29 | CONT — discharge | Adopted | A1 — ADMINISTRATIVE |
| TA-10-2026-0105 | Immunity waiver — Patryk Jaki | 2026-04-28 | JURI — immunity | Adopted | A1 — ADMINISTRATIVE |

**Total adopted texts:** 11 (from April 28–30 Strasbourg session)
**Full text availability:** ALL returned DATA_UNAVAILABLE — indexed but content not yet published by EP Open Data Portal

---

## Group B: EP Plenary Session Records

| Session ID | Location | Dates | Status |
|-----------|----------|-------|--------|
| MTG-PL-2026-04-30 | Strasbourg | April 28–30, 2026 | Session completed |
| MTG-PL-2026-04-30 | — | Decisions retrieved | ✅ Via get_meeting_decisions |

**Meeting decisions retrieved:** 15 items from April 30 session
**Attendance data:** Present in session metadata; ~685–700 MEPs estimated

---

## Group C: EP Statistical Data

| Source | Type | Date | Key Metrics |
|--------|------|------|-------------|
| get_all_generated_stats (EP10 full) | Statistical aggregate | 2026-04-27 | 114 legislative acts, 567 roll-call votes, 54 plenary sessions (EP10 YTD) |
| get_plenary_sessions (year=2026) | Session list | 2026-05-01 | 23 sessions in 2026 YTD |
| generate_political_landscape | Political analysis | 2026-05-01 | 9 groups, fragmentation index 6.57, EPP 185 seats (25.73%) |
| analyze_coalition_dynamics | Coalition analysis | 2026-05-01 | Pair analysis, effective parties: 6.57 |

---

## Group D: EP Parliamentary Questions

| Query | Parameters | Results |
|-------|-----------|---------|
| get_parliamentary_questions | topic: "Digital Markets Act" | Retrieved — used for DMA context |
| get_parliamentary_questions | topic: "Ukraine accountability" | Retrieved — used for Ukraine context |

---

## Group E: External Data Sources

| Source | Type | Status | Notes |
|--------|------|--------|-------|
| IMF WEO 2026 | Economic projections | 🔴 UNAVAILABLE | Proxy timeout — imf-mcp-probe.sh returned available:false |
| World Bank indicators | Health/economic indicators | 🟡 PARTIAL | wb-mcp-probe.sh called but limited data retrieved |
| EP Voting Records (April 28–30) | Roll-call votes | 🔴 NOT YET AVAILABLE | EP publishes with ~4 week delay |
| EP Events Feed | Events calendar | 🔴 UNAVAILABLE | EP API returned {"status":"unavailable"} — transient error |

---

## Group F: Analysis Reference Documents

| Path | Purpose | Status |
|------|---------|--------|
| analysis/methodologies/ai-driven-analysis-guide.md | 10-step protocol | ✅ Read at session start |
| analysis/methodologies/artifact-catalog.md | Artifact master map | ✅ Read at session start |
| analysis/methodologies/per-artifact-methodologies.md | Per-artifact construction rules | ✅ Read at session start |
| analysis/methodologies/reference-quality-thresholds.json | Line count floors | ✅ Read at Stage B start |
| analysis/templates/README.md | Template index | ✅ Read at Stage B start |

---

## Document Quality Assessment

**High-confidence documents (A-grade sources):**
- 11 EP adopted texts: Official EP Open Data Portal indexed records ✅
- EP plenary session records: Official meeting data ✅
- EP10 statistics: Official aggregate statistics ✅
- Political landscape: Real-time EP group composition data ✅

**Partial-confidence documents (B-grade):**
- Coalition dynamics: Proxy (seat-size similarity) used; roll-call vote data not available
- Voting patterns: Inferred from political group positions; not actual vote counts

**Unavailable documents (F-grade):**
- IMF WEO: Proxy timeout
- Full text of adopted texts: Content not yet published
- Events feed: API error
- April 28–30 roll-call votes: EP publication delay

---

## Data Gaps and Mitigation

| Gap | Impact | Mitigation Approach |
|-----|--------|---------------------|
| Full text of adopted texts (esp. DMA + Ukraine) | Cannot cite specific operative clauses | Analysis based on titles, committee context, precedent |
| April 28–30 voting data | Cannot verify coalition positions | Historical pattern analysis + political position statements |
| IMF economic data | Economic context incomplete | ECB/Commission/World Bank estimates used with lower confidence |
| Events feed data | Missing event calendar context | Plenary session records used as substitute |

---

## Data Sources & Provenance

| Source | Tool | Date | Admiralty Grade |
|--------|------|------|-----------------|
| EP Adopted Texts | european-parliament-get_adopted_texts | 2026-05-01 | A1 |
| EP Plenary Sessions | european-parliament-get_plenary_sessions | 2026-05-01 | A1 |
| Meeting Decisions | european-parliament-get_meeting_decisions | 2026-05-01 | A1 |
| Political Landscape | european-parliament-generate_political_landscape | 2026-05-01 | A1 |
| EP10 Statistics | european-parliament-get_all_generated_stats | 2026-04-27 | A1 |
| IMF probe | scripts/imf-mcp-probe.sh | 2026-05-01 | F5 — unavailable |
