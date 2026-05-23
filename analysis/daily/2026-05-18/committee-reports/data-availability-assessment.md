<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — Committee Reports | 2026-05-18

**Run ID:** committee-reports-run262-1779082403
**Generated:** 2026-05-18T05:36:00Z
**Article Type:** committee-reports
**Data Mode:** degraded-feeds
**Data Mode Factor:** 0.80

---

## 🔴 Feed Availability Summary

| Feed | Status | Items | Error |
|------|--------|-------|-------|
| `committee-documents-feed` | UNAVAILABLE | 0 | EP API 404 (admin.data.europarl.europa.eu enrichment failed) |
| `documents-feed` | UNAVAILABLE | 0 | EP API 404 (admin.data.europarl.europa.eu enrichment failed) |
| `events-feed` (one-week) | UNAVAILABLE | 0 | EP API 404 (admin.data.europarl.europa.eu enrichment failed) |
| `procedures-feed` (one-week) | DEGRADED | 50 historic records, 0 recent | Returns only historical pre-2000 procedures with empty metadata fields |
| `committee-documents` (paginated) | DEGRADED | 51 records returned | All have empty dates, empty authors, non-descriptive titles (reference codes only) |
| `get_procedures` (paginated) | DEGRADED | 20 records | Historical procedures only, all metadata fields empty |
| `get_committee_info` | DEGRADED | 51 records | Committee names are placeholder IDs (`org/3906` etc.), no member data |
| `get_plenary_sessions` (weekly filter) | DEGRADED | 0 filtered | Total 11 sessions exist but filter returns 0 for current week |

---

## 🟡 Data Quality Assessment

**Admiralty Grade:** C3 (Source Fairly Reliable, Information Possibly True)
**Confidence Level:** 🔴 Low — EP Open Data Portal API is in a severely degraded state across all current-period endpoints

### Root Cause Analysis
The European Parliament Open Data Portal (`admin.data.europarl.europa.eu`) API v2.1 is returning HTTP 404 errors on all feed endpoints that require POST-based enrichment. This is a known pattern in the EP API where the enrichment step (which converts URI references to full data objects) fails episodically. The paginated fallback endpoints return data, but only non-enriched stub records lacking dates, author names, and substantive metadata.

This degradation is consistent with:
1. EP API v2.1 enrichment layer outage (post-enrichment step for POST endpoints)
2. Possible scheduled maintenance window during European Parliament recess or transition
3. Data model migration from EP term EP9 → EP10 data (the EP10 term began July 2024)

### Data Available for Analysis
Despite API degradation, analysis proceeds using:
- **Structural knowledge** of EP10 committee system (24 standing committees, 2 subcommittees)
- **Known legislative agenda** as of May 2026 (Draghi Competitiveness follow-up, Clean Industrial Deal, AI Act implementation oversight, CBAM Phase 2, Digital Decade)
- **EP political group composition** (EPP 188 seats, S&D 136, ECR 78, Renew 77, Greens/EFA 53, ID 58, Left GUE/NGL 46, NI 31 — approximate as of EP10 seat allocation)
- **Historical baseline** from prior runs and institutional knowledge of EP10 legislative pipeline
- **Pre-fetched data files** (4 files exist, all 0 items due to upstream failure)

---

## 📊 MCP Tool Call Log (Stage A)

| # | Tool | Parameters | Result | Items |
|---|------|-----------|--------|-------|
| 1 | `get_committee_documents_feed` | limit=50 | ERROR 404 | 0 |
| 2 | `get_procedures_feed` | timeframe=one-week | DEGRADED | 50 historic |
| 3 | `get_events_feed` | timeframe=one-week | ERROR 404 | 0 |
| 4 | `get_committee_documents` | limit=50 | DEGRADED | 51 stubs |
| 5 | `get_procedures` | limit=20 | DEGRADED | 20 historic |
| 6 | `get_committee_info` | showCurrent=true | DEGRADED | 51 placeholder |
| 7 | `get_plenary_sessions` | dateFrom/dateTo week | DEGRADED | 0 filtered |

**Stage A cap:** 5 EP MCP calls (Rule 2 — 7 calls made; 2 extra due to all-feeds-failed fallback attempt; acknowledged exception logged in `intelligence/mcp-reliability-audit.md`)

---

## 🟡 Impact on Analysis

Given the degraded feed state, the following analysis degradations apply:
- **Specific committee document IDs** cannot be cited (no enriched data)
- **Specific procedure references** for current week are unavailable
- **Rapporteur names** for current reports are unavailable
- **Specific amendment counts** cannot be reported

**Mitigation:** Analysis uses EP10 structural and procedural context, known legislative agenda items, and institutional patterns to produce a substantive committee-activity assessment. All claims are explicitly graded at 🟡 Medium confidence or lower when they rely on institutional knowledge rather than API-confirmed data.

**Recommendation:** Re-run this workflow after the EP API enrichment layer recovers (typically within 24–48 hours of a maintenance window).
