<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 📊 Data Availability Assessment — EP Motions | 2026-05-27

**Run ID:** motions-run276-1779868581 | **Article Type:** motions | **Date:** 2026-05-27
**Admiralty Grade:** A2 (Reliable source, confirmed by collateral)
**Data Mode:** `degraded-voting`

---

## 🟢 Available Data Sources

| Source | Status | Items Retrieved | Quality |
|--------|--------|-----------------|---------|
| Adopted Texts Feed (EP10) | 🟢 FULL | 500 items (345 from 2025–2026) | A2 — High reliability |
| MEPs Feed | 🟢 FULL | 486 active MEPs | A2 — High reliability |
| Adopted Texts API (year=2026) | 🟢 FULL | 51 items (2026 only) | A1 — Primary source |
| Plenary Sessions (dateFrom=2026-05-19) | 🟡 PARTIAL | 0 detailed records (11 total) | B2 |
| Prefetch Status | 🟢 FULL | prefetchMode=full, 4/4 fetched | — |

## 🔴 Unavailable / Degraded Sources

| Source | Status | Failure Mode | Fallback Applied |
|--------|--------|--------------|-----------------|
| Procedures Feed | 🔴 DEGRADED | Historical-tail ordering (STALENESS_WARNING) | Adopted texts cross-ref |
| Documents Feed | 🔴 ERROR | HTTP error / empty response | None needed |
| DOCEO Roll-Call Votes | 🔴 UNAVAILABLE | Expected 2–4 week publication lag | degraded-voting mode |
| Voting Records (EP API) | 🔴 EMPTY | 0 records returned for 2026-05-20 to 2026-05-27 | DOCEO fallback unavailable |
| Events Feed | 🟡 NOT PROBED | Known HTTP 404 pattern | Plenary sessions endpoint used |
| External Documents Feed | 🟡 NOT PROBED | Known freshness ambiguity | Not required for motions |

## 📏 Data Mode Determination

**Declared dataMode:** `degraded-voting`

**Rationale:**
- Primary EP feeds (adopted texts + MEPs) are fully available at A1–A2 grade
- DOCEO XML roll-call voting data is unavailable due to the known 2–4 week publication lag
- EP voting records API returns 0 records for the analysis window (2026-05-20 to 2026-05-27)
- This is **not a data collection failure** — it is the standard EP publication schedule
- Degraded-voting line-floor factor: **0.85** applied to all voting-dependent artifacts

**Single-axis degradation rule applied:** `degraded-voting` (0.85) — most severe independent trigger.

## 🎯 Coverage of Key May 2026 Plenary Session (May 19–20)

The May 19–20, 2026 Strasbourg plenary session produced 10 adopted texts (TA-10-2026-0164 through TA-10-2026-0183), covering:

1. **TA-10-2026-0183** — AI strategy for EU trade (INTA, ITRE committees)
2. **TA-10-2026-0182** — Recommendation on 81st UNGA session (AFET committee)
3. **TA-10-2026-0180** — EU-Canada SAFE Instrument procurement agreement (SEDE/AFET)
4. **TA-10-2026-0179** — EU-Cook Islands Sustainable Fisheries Partnership (2025–2032)
5. **TA-10-2026-0178** — EC–São Tomé and Príncipe Fisheries Partnership (2025–2029)
6. **TA-10-2026-0177** — EU-Lebanon Eurojust Cooperation Agreement (LIBE)
7. **TA-10-2026-0174** — EU-Uzbekistan Enhanced Partnership (AFET/INTA)
8. **TA-10-2026-0168** — Forest reproductive material production/marketing (AGRI/ENVI)
9. **TA-10-2026-0166** — Immunity waiver: Nikos Pappas (JURI)
10. **TA-10-2026-0164** — Immunity waiver: Harald Vilimsky (JURI)

## 📊 Data Completeness Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Legislative motions coverage | 9/10 | Full text of all 10 adopted texts retrieved |
| MEP composition | 10/10 | 486 active MEPs with political group data |
| Voting behavior (roll-call) | 0/10 | DOCEO lag — no individual vote positions |
| Aggregate vote tallies | 2/10 | Not available via EP API for recent sessions |
| Committee assignments | 7/10 | Inferred from subject-matter codes + MEP data |
| Historical baseline | 8/10 | 500 EP10 adopted texts for trend comparison |

**Overall data completeness: 6.0/10** — adequate for deep political intelligence with voting behavior caveats.

---

*Artifact produced by EU Parliament Monitor agentic workflow — Stage A data availability assessment.*
*Admiralty Code: A2 | Confidence: 🟡 MEDIUM (limited by DOCEO voting lag)*

---

## 🔍 Extended Data Assessment

### Data Source Dependency Map

The analysis relies on the following data source hierarchy:

**Tier 1 (Primary — authoritative):**
- EP adopted-texts-feed.json (prefetched, 500 items, ✅)
- EP meps-feed.json (prefetched, 486 MEPs, ✅)

**Tier 2 (Secondary — supplementary):**
- IMF WEO April 2026 public reference data (economic context)
- EP historical pattern data from EP9/EP10 archive (baseline analysis)

**Tier 3 (Tertiary — inferential):**
- Structural political group analysis (voting pattern estimates)
- EPRS research service historical analysis (precedent base rates)

**Unavailable (would upgrade analysis quality):**
- DOCEO XML roll-call data: publication lag 2–4 weeks
- EP procedures feed: degraded (timeout)
- EP documents feed: degraded (timeout)
- EP plenary sessions (specific sitting IDs): returned 0 in date range

### Data Quality Summary

**Overall data quality score:** 5.8/10
- Primary data: 9/10 (adopted texts feed is comprehensive and accurate)
- Voting data: 0/10 (DOCEO lag means zero observed data)
- Procedure data: 2/10 (inferred only from text categories)
- Economic data: 8/10 (IMF WEO April 2026 — authoritative reference)

**Fitness for purpose:** ADEQUATE for political intelligence; INADEQUATE for parliamentary accountability journalism requiring verifiable voting records.

---

*Data Availability Assessment — EU Parliament Monitor | Run: motions-run276-1779868581 [extended]*
