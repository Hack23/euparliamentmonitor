# Data Availability Assessment — Committee Reports, 2026-05-25

**Run ID**: committee-reports-run267-1779688077
**Generated**: 2026-05-25T05:55:00Z
**Data Window**: 2026-05-18 → 2026-05-25
**Data Mode**: `degraded-feeds` 🟡 (line-floor factor: 0.80)

---

## 1. Prefetch Status

| Feed | Status | Items | Notes |
|------|--------|-------|-------|
| committee-documents-feed.json | ❌ 404 | 0 | EP API `POST /committee-documents/?view=uri` returned HTTP 404 |
| procedures-feed.json | ❌ 404 | 0 | EP API `POST /procedures/?view=uri` returned HTTP 404 |
| events-feed.json | ❌ 404 | 0 | EP API `POST /events/?timeframe=one-week` returned HTTP 404 |
| documents-feed.json | ❌ 404 | 0 | EP API `POST /documents/?view=uri` returned HTTP 404 |

Prefetch script reported `"prefetchMode":"full","fetched":4,"placeholders":0` — however, all four fetched files contain upstream 404 error bodies rather than valid EP data. The prefetch script logged HTTP 200 wrappers around the error-body responses.

**Root cause**: The EP Open Data Portal's batch-view API (`POST …?view=uri&view-version=v2.1`) endpoints appear to be returning 404 for all dynamic feed queries during this run window. This is a known intermittent upstream degradation pattern (see MCP reliability audit).

---

## 2. Live Stage A MCP Probe Results

| Tool | Outcome | Items Retrieved |
|------|---------|-----------------|
| `get_committee_documents_feed` | ❌ unavailable (UPSTREAM_ERROR 404) | 0 |
| `get_procedures_feed` (one-week) | ⚠️ historical data only (50 items, 1972–1987) | 0 current |
| `get_events_feed` (one-week) | ❌ unavailable (ENRICHMENT_FAILED 404) | 0 |
| `get_committee_documents` | ✅ paginated list | 20 AFCO opinions (SUBMITTED, no dates) |
| `get_adopted_texts` (year=2026) | ✅ | 20 texts (Jan–Apr 2026) |
| `analyze_committee_activity` ENVI | ⚠️ all sources TIMEOUT (5s) | 0 |
| `analyze_committee_activity` ECON | ⚠️ all sources TIMEOUT (5s) | 0 |
| `get_latest_votes` | ⚠️ no plenary week available | 0 |
| `get_voting_records` (May 2026) | ⚠️ empty (EP publication delay) | 0 |
| `get_all_generated_stats` committee_meetings | ✅ | 2024–2026 stats |
| `get_plenary_sessions` (May 2026) | ⚠️ 0 filtered results | 0 |

---

## 3. Available Data Summary

### Committee Documents (AFCO — 20 items)
All retrieved documents are AFCO committee opinions (AD- and AL-type, SUBMITTED status) with PE reference numbers ranging from PE592.152 to PE782.229. No dates, no authors, no summaries beyond reference codes. These represent AFCO constitutional opinions across multiple legislative terms.

### Adopted Texts 2026 (20 items)
High-quality legislative output data available:
- **TA-10-2026-0004** (2026-01-20): Financial stability amid economic uncertainties
- **TA-10-2026-0006** (2026-01-20): Electoral Act reform — ratification hurdles
- **TA-10-2026-0008** (2026-01-21): EU-Mercosur — Court of Justice opinion request
- **TA-10-2026-0010** (2026-01-21): Enhanced cooperation on Loan for Ukraine
- **TA-10-2026-0024** (2026-01-22): Lithuania public broadcaster (democracy threat)
- **TA-10-2026-0029** (2026-02-10): Measuring Instruments Directive amendment
- **TA-10-2026-0032** (2026-02-10): EU designs codification
- **TA-10-2026-0034** (2026-02-10): ECB annual report 2025
- **TA-10-2026-0050** (2026-02-12): Subcontracting chains and workers' rights
- **TA-10-2026-0051** (2026-02-12): EU priorities for 70th CSW
- **TA-10-2026-0053** (2026-02-12): Northeast Syria ceasefire
- **TA-10-2026-0112** (2026-04-28): Budget guidelines 2027
- **TA-10-2026-0115** (2026-04-28): Welfare of dogs and cats
- **TA-10-2026-0119** (2026-04-28): EIB annual report 2024
- **TA-10-2026-0142** (2026-04-29): Iceland PNR agreement
- **TA-10-2026-0151** (2026-04-30): Haiti trafficking/criminal groups
- **TA-10-2026-0160** (2026-04-30): Digital Markets Act enforcement
- **TA-10-2026-0161** (2026-04-30): Russia accountability/Ukraine
- **TA-10-2026-0162** (2026-04-30): Armenia democratic resilience
- **TA-10-2026-04-30-ANN01** (2026-04-30): EP 2027 draft budget estimates

### Generated Statistics (HIGH confidence)
Historical and projected EP10 data 2024–2026:
- 2026 projected: 2,363 committee meetings (+19.3% YoY), 114 legislative acts (+46.2%), 6,147 parliamentary questions (+24.2%)
- EP10 composition: EPP 185 seats (25.7%), S&D 135 (18.8%), PfE 84 (11.7%), ECR 79 (11%)
- Right bloc 52.3%, Left bloc 32.6%, Centre 10.6%
- Fragmentation index: 6.59 (ENP), minimum winning coalition = 3 groups

---

## 4. Data Mode Determination

**Declared mode**: `degraded-feeds`
**Rationale**: All 4 prefetched feed endpoints returned HTTP 404 error bodies. While alternative sources (adopted texts, committee documents list, generated stats) provide partial coverage, the absence of committee-specific activity feeds for the 7-day window means committee-level detail is unavailable. The `degraded-feeds` mode (floor factor 0.80) applies.

**IMF data**: Not probed in this run (EP committee data primary source). IMF data requirement: `not_required` for committee-reports article type.

---

## 5. Confidence Levels

| Data Category | Confidence | Basis |
|--------------|------------|-------|
| EP10 political composition | 🟢 HIGH | Generated stats (weekly refresh) |
| 2026 legislative statistics | 🟢 HIGH | Generated stats (verified) |
| Committee-specific activity (May 2026) | 🔴 LOW | All feeds 404, committee activity timeout |
| Adopted texts (Jan–Apr 2026) | 🟢 HIGH | Direct EP API endpoint functional |
| Committee documents (AFCO) | 🟡 MEDIUM | List endpoint works; no metadata |
| Voting records (May 2026) | 🔴 LOW | Publication delay + no plenary this week |

**Overall run confidence**: 🟡 MEDIUM-LOW — rich historical/legislative context available; real-time committee activity data absent.

**Admiralty Grade**: B3 — Source credibility B (EP Open Data Portal, authoritative but with 404 degradation); Information quality 3 (partial corroboration from multiple EP endpoints).
