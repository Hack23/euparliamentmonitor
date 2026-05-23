<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — EU Parliament Committee Reports, April 2026
**Date:** 2026-04-29 | **Confidence:** 🟢 High | **Methodology:** Systematic Document Catalogue + Procedural Reference

---

## Index Overview

This document catalogues all EP documents, procedures, and adopted texts referenced in this analysis run, with procedural context, committee assignments, and data source metadata.

**Data window:** April 22–29, 2026 | **Primary session:** April 28, 2026 Strasbourg Plenary

---

## Adopted Texts — April 28, 2026 Plenary Session

### AT-001: MFF Interim Report
**Reference:** TA-10-2026-0111 (estimated reference based on text sequence)
**Procedure:** 2025/0571R (INI — Own Initiative Report)
**Committee Lead:** BUDG
**Rapporteur:** Not confirmed (EP API enrichment failure)
**Vote type:** Simple majority required (INI procedure)
**Status:** ADOPTED — April 28, 2026
**Data source:** EP API get_adopted_texts (year=2026), offset 0; confirmed via get_procedures MCP tool tracking 2025/0571R
**Significance Tier:** T1-A (Score 47/50)

---

### AT-002: 2027 Budget Guidelines
**Reference:** TA-10-2026-0112 (estimated)
**Procedure:** 2025/2246 (INI)
**Committee Lead:** BUDG
**Status:** ADOPTED — April 28, 2026
**Data source:** EP API get_adopted_texts (year=2026)
**Significance Tier:** T2-A (Score 37)

---

### AT-003: GSP Reform
**Reference:** TA-10-2026-0XXX
**Procedure:** 2021/0297 (COD — Codecision)
**Committee Lead:** INTA
**Vote type:** Simple majority (codecision final reading)
**Status:** ADOPTED — April 28, 2026
**Data source:** EP API track_legislation + get_adopted_texts (year=2026)
**Legislative stage:** Final reading following trilogue agreement
**Significance Tier:** T1-B (Score 43/50)

---

### AT-004: GHG Transport Accounting Regulation
**Reference:** TA-10-2026-0XXX
**Procedure:** 2023/0266 (COD)
**Committee Lead:** TRAN/ENVI joint (CJ46)
**Status:** ADOPTED — April 28, 2026
**Data source:** EP API track_legislation (2023/0266) + get_adopted_texts
**Legislative stage:** Final reading, trilogue concluded December 2025
**Significance Tier:** T2-B (Score 37)

---

### AT-005: Dogs and Cats Welfare
**Reference:** TA-10-2026-0XXX
**Procedure:** 2023/0447 (COD)
**Committee Lead:** AGRI; ENVI (opinion)
**Status:** ADOPTED — April 28, 2026
**Data source:** EP API track_legislation (2023/0447); trilogue concluded January 2026
**Significance Tier:** T2-C (Score 32)

---

### AT-006: EIB Annual Report 2024
**Reference:** TA-10-2026-0XXX
**Procedure:** 2025/2237 (INI — Non-legislative)
**Committee Lead:** CONT
**Status:** ADOPTED — April 28, 2026
**Data source:** EP API get_adopted_texts (year=2026)
**Significance Tier:** T3-A (Score 22)

---

### AT-007–AT-011: Immunity Waivers × 5 (Polish MEPs)
**Procedures:** Various (IMM procedure)
**Committee Lead:** JURI
**Status:** ADOPTED — April 28, 2026
**Data source:** EP API get_adopted_texts (year=2026); 5 confirmed waiver texts
**Significance Tier:** T3-D (Score 12 each)
**Note:** Cluster of 5 Polish MEPs; post-PiS judicial proceedings context

---

## Tracked Procedures — Ongoing as of April 29

| Procedure ID | Title | Committee | Stage | Data Source | Last Updated |
|-------------|-------|-----------|-------|-------------|--------------|
| 2025/0571R | MFF 2028-2034 Interim | BUDG | EP position adopted | track_legislation | 2026-04-28 |
| 2025/2246 | 2027 Budget Guidelines | BUDG | EP guidelines adopted | track_legislation | 2026-04-28 |
| 2021/0297 | GSP Reform | INTA | Final adoption | track_legislation | 2026-04-28 |
| 2023/0266 | GHG Transport | TRAN/ENVI | Final adoption | track_legislation | 2026-04-28 |
| 2023/0447 | Dogs & Cats Welfare | AGRI | Final adoption | track_legislation | 2026-04-28 |
| 2025/2237 | EIB Annual Report 2024 | CONT | Non-legislative adopted | get_adopted_texts | 2026-04-28 |
| 2025/2032 | Performance Instruments | CONT | Non-legislative adopted | get_adopted_texts | 2026-04-28 |

---

## Data Quality Assessment

| Data Source | Call Status | Quality | Coverage |
|-------------|------------|---------|----------|
| `get_adopted_texts` (year=2026) | ✅ SUCCESS | 🟢 HIGH | 101 texts total; 18 from April 28 |
| `track_legislation` (5 procedures) | ✅ SUCCESS | 🟢 HIGH | Complete timelines for 5 key procedures |
| `get_committee_info` (current) | ✅ SUCCESS | 🟢 HIGH | All current committee names/IDs |
| `get_plenary_sessions` (2026) | ✅ SUCCESS | 🟢 HIGH | April 27-29 sessions identified |
| `get_meeting_decisions` (April 28) | ✅ SUCCESS | 🟢 HIGH | 79.6KB decisions data |
| `generate_political_landscape` | ✅ SUCCESS | 🟢 HIGH | Current group composition |
| `get_procedures_feed` | ⚠️ RECESS_MODE | 🔴 DEGRADED | Returned 1970s-1980s data; not used |
| `get_committee_documents_feed` | ❌ FAILED | 🔴 UNAVAILABLE | EP API error; fallback used |
| `get_voting_records` (April 2026) | ⚠️ EMPTY | 🟡 EXPECTED | 4-6 week delay; expected absence |

**Overall data completeness:** 🟡 MEDIUM-HIGH — Core adopted texts and procedural data is complete. Missing: individual MEP voting records (expected delay), rapporteur names (enrichment failure), committee documents feed (API degraded).

---

## References to Existing/Carry-Forward Files

`analysis/daily/2026-04-29/committee-reports/existing/committee-productivity.md` — expected to exist as carry-forward from prior analysis run. Contains committee workload, meeting frequency, and document production statistics. Status: directory confirmed present; file contents not confirmed via current API access.

**Instruction:** If `existing/committee-productivity.md` exists, cross-reference with this document analysis index's committee activity data to validate workload assessments in synthesis-summary.md.
