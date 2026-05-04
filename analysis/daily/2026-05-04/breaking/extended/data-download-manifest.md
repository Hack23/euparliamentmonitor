<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Download Manifest — EP Breaking News | April 28–30, 2026

**Date:** 2026-05-04 | **Run:** breaking-run-1777919595 | **Type:** Data Provenance Record

## Overview

Complete record of all data files downloaded, their sources, checksums (where available), and usage in analysis.

---

## Data Files Downloaded This Run

### Stage A Primary Data Collection

| File | Source | Tool Call | Size | Status |
|------|--------|-----------|------|--------|
| analysis/daily/2026-05-04/breaking/data/adopted-texts-recent.json | EP API (get_adopted_texts_feed) | Run 1 Stage A (07:04Z) | ~54KB | ✅ Valid |
| analysis/daily/2026-05-04/breaking/data/political-landscape.json | EP API (generate_political_landscape) | Run 2 Stage A (18:33Z) | ~12KB | ✅ Valid |
| analysis/daily/2026-05-04/breaking/data/plenary-debates.json | EP API (get_speeches or plenary documents) | Run 1 Stage A | ~8KB | ✅ Valid |
| analysis/daily/2026-05-04/breaking/data/committee-activities.json | EP API (committee feeds) | Run 1 Stage A | ~10KB | ✅ Valid |

### Stage A Secondary Data Collection

| File | Source | Tool Call | Size | Status |
|------|--------|-----------|------|--------|
| /tmp early-warning output | EP API (early_warning_system) | Run 2 Stage A | In memory | ✅ Used in analysis |
| /tmp coalition-dynamics output | EP API (analyze_coalition_dynamics) | Run 2 Stage A | In memory | ✅ Used in analysis |
| /tmp voting-records output | EP API (get_voting_records) | Run 2 Stage A | 0 bytes (empty) | ⚠️ Expected empty |
| /tmp procedures-attempt-1 | EP API (get_procedures) | Run 2 Stage A | 0 bytes (404) | ❌ Error |
| /tmp procedures-attempt-2 | EP API (get_procedures) | Run 2 Stage A | 0 bytes (404) | ❌ Error |

---

## Data Provenance Chain

### TA-10-2026-0160 (DMA Enforcement)
**Primary source:** EP Open Data Portal adopted-texts feed
**Data confidence:** HIGH — Official EP publication
**Fields used:** identifier, title, date, subject, procedureReference, link
**Fields missing:** Full text (would require EUR-Lex fetch), vote breakdown (roll-call data unavailable), committee report reference
**Analysis artifacts using this data:** executive-brief.md, classification/significance-classification.md, documents/document-analysis-index.md, intelligence/pestle-analysis.md, extended/executive-brief.md, extended/historical-parallels.md, extended/comparative-international.md, extended/devils-advocate-analysis.md

### TA-10-2026-0161 (Ukraine STCA)
**Primary source:** EP Open Data Portal adopted-texts feed
**Data confidence:** HIGH — Official EP publication
**Fields used:** identifier, title, date, subject, procedureReference, link
**Analysis artifacts using this data:** executive-brief.md, intelligence/threat-model.md, intelligence/historical-baseline.md, extended/historical-parallels.md, extended/comparative-international.md, extended/devils-advocate-analysis.md, risk-scoring/risk-matrix.md

### TA-10-2026-0162 (Armenia)
**Primary source:** EP Open Data Portal adopted-texts feed
**Data confidence:** HIGH — Official EP publication
**Fields used:** identifier, title, date, subject, link
**Analysis artifacts using this data:** executive-brief.md, stakeholder-analysis.md, intelligence/political-threat-landscape.md, extended/comparative-international.md

### EP Group Composition
**Primary source:** EP API generate_political_landscape (real-time)
**Data confidence:** HIGH — Real-time API query
**Data points used:** 9 group seat counts, majority threshold, fragmentation assessment
**Analysis artifacts using this data:** All coalition-related artifacts

---

## Data Gaps (Not Downloaded)

| Data | Reason Not Available | Impact | Workaround |
|------|---------------------|--------|-----------|
| Roll-call votes (April 28–30) | EP data lag 2–4 weeks | HIGH — cannot verify vote coalitions | Structural proxy analysis |
| DMA resolution full text | EUR-Lex fetch not attempted | MEDIUM — analysis from title/subject only | Subject field analysis |
| Procedure-level data (DMA) | 404 on procedureReference format | MEDIUM | Subject/title analysis |
| MEP speeches April 28–30 | Not retrieved this run | LOW-MEDIUM | Historical pattern analysis |
| Parliamentary question full texts | EP API returning stubs | LOW | No impact for breaking news |
| IMF macroeconomic data (2026) | Not fetched via IMF SDMX API | MEDIUM for economic context | Historical knowledge used |

---

## Data Quality Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| Primary document completeness | 9/10 | All adopted texts confirmed from official EP API |
| Vote outcome verification | 3/10 | Roll-call data unavailable; adoption confirmed but margins unknown |
| Procedure detail completeness | 4/10 | Procedure API access failed; title/subject analysis only |
| Political landscape accuracy | 8/10 | Real-time EP API data; accurate for current EP10 composition |
| Economic context accuracy | 6/10 | Historical knowledge; not live IMF/WB data |
| **Overall** | **6/10** | **Adequate for breaking news; limited for forensic vote analysis** |

---

## Re-Run Differential (Run 1 vs Run 2)

| Data Category | Run 1 (07:04Z) | Run 2 (18:33Z) | Change |
|---------------|---------------|---------------|--------|
| Adopted texts count | 10 items | 10 items | No change |
| EP group composition | Not separately queried | Queried | Enhanced |
| Early warning | Not called | Called | Enhanced |
| Coalition dynamics | Not called | Called | Enhanced |
| Procedures | Not attempted | Attempted (failed) | No new data |

**Conclusion:** Run 2 (this run) enhanced the political landscape and coalition analysis data while confirming that the primary adopted texts data is stable and unchanged since Run 1.

---

## Data Freshness Timeline

| Data Category | As-of Date | Age at Run 2 | Freshness |
|--------------|-----------|-------------|-----------|
| EP adopted texts (April 28–30) | April 30, 2026 | 4 days | ✅ FRESH |
| EP group composition | May 4, 2026 | Same day | ✅ FRESH |
| Roll-call votes | Not yet published | N/A | ❌ MISSING |
| EU macroeconomic | Latest available (2025 Q3/Q4) | ~3–6 months | 🟡 DATED |
| IMF projections | Spring 2026 WEO | ~3 weeks | ✅ RECENT (not fetched) |
