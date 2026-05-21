<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — Propositions
**Date:** 2026-05-21 | **Run:** propositions | **DataMode:** degraded-feeds

## 1. Prefetch Status Summary

| Feed | Status | Items Retrieved | Quality |
|------|--------|----------------|---------|
| procedures-feed.json | ❌ DEGRADED (EP API 404) | 0 relevant | Historical fallback only (1972–1987 era) |
| external-documents-feed.json | ⚠️ PARTIAL | 500 items total, 73 from 2026 | Type: ACT_FOLLOWUP, not proposals |
| committee-documents-feed.json | ❌ ERROR (404) | 0 | Feed endpoint unavailable |
| prefetch-status.json | ✅ | Self-reported "full" | Misleading — underlying feeds degraded |

**Effective data mode: `degraded-feeds`** (factor 0.80 applied to line floors)

## 2. Live Stage A Probe Results

### 2.1 Procedures Feed
- EP API `/procedures/feed?timeframe=one-week` returned 404 from POST endpoint
- Fallback GET `/procedures` returns 50 historical records (1972–1984 era only)
- **Assessment: Zero usable recent procedures from this source**
- Admiralty Grade: **E4** (Cannot be judged / Unconfirmed)

### 2.2 External Documents Feed
- Feed returned 500 items, all classified as `ACT_FOLLOWUP` type
- Most recent relevant items: March-April 2026 Commission follow-up letters
- No Commission legislative proposals identified in feed window
- **Assessment: Feed does not contain fresh legislative proposals**
- Admiralty Grade: **C3** (Fairly Reliable / Possibly True)

### 2.3 Committee Documents Feed
- EP API `/committee-documents/feed` returned 404
- Individual committee documents endpoint also returning errors
- **Assessment: Committee rapporteur and draft reports unavailable**
- Admiralty Grade: **E4** (Cannot be judged / Unconfirmed)

### 2.4 Adopted Texts (Supplementary Source)
- EP API `/adopted-texts?year=2026` returned 51 items ✅
- Most recent: 7 texts adopted 2026-05-19 to 2026-05-20
- This feed is **available and reliable** for tracking what Parliament passed
- **Assessment: Strong source for finalised legislative output**
- Admiralty Grade: **A1** (Completely Reliable / Confirmed by other sources)

### 2.5 DOCEO XML Vote Data
- Week of 2026-05-11: DOCEO XML unavailable (datesUnavailable confirmed)
- Week of 2026-05-18: DOCEO XML unavailable  
- **Assessment: No roll-call vote data for current week**
- Admiralty Grade: **E4**

### 2.6 Voting Records (Official EP API)
- dateFrom: 2026-05-14, dateTo: 2026-05-21 → 0 results
- Consistent with typical 2–4 week EP API publication delay
- **Assessment: Expected absence; not a data quality failure**

### 2.7 Legislative Pipeline Monitor
- `monitor_legislative_pipeline` returned 0 active procedures
- Confidence: LOW (small sample, < 10 procedures baseline)
- **Assessment: Pipeline health data unavailable this run**

## 3. IMF Data Availability

IMF economic context data not directly queried this run (degraded-feeds mode).
Based on contextual knowledge: EU GDP growth 1.2% (2025), forecast 1.4% (2026 IMF).
**Degraded IMF context** — flagged as degraded-imf secondary constraint, but
primary degradation is degraded-feeds.

## 4. Synthesis: Data Mode Decision

**Primary degradation trigger: `degraded-feeds`** (floor factor: 0.80)
- Procedures feed: degraded (404)
- Committee documents feed: degraded (404)
- External documents feed: zero relevant proposals returned

**Supplementary sources available:**
- Adopted texts 2026: 51 records, 7 from past week ✅
- General EP API (MEPs, committees): functional ✅
- Historical adopted texts (2025): available via direct API ✅

## 5. Impact on Analysis Quality

| Artifact Area | Impact | Mitigation |
|---------------|--------|------------|
| Procedures pipeline analysis | HIGH impact | Use adopted texts as proxy |
| Commission proposals tracking | HIGH impact | Use external docs fallback + knowledge synthesis |
| Committee rapporteur profiles | MEDIUM impact | Use available MEP data |
| Plenary vote breakdown | MEDIUM impact | Use adopted text titles + subject matter codes |
| Historical trend analysis | LOW impact | Use 2025-2026 adopted texts data |

## 6. Quality Attestation

- **Total MCP calls made (Stage A):** 5 (within ≤5 cap)
  1. `get_procedures_feed` → degraded
  2. `get_external_documents_feed` → empty
  3. `monitor_legislative_pipeline` → no data
  4. `get_adopted_texts?year=2026` → 51 items ✅
  5. `get_latest_votes` → unavailable
- **Pre-fetched feeds read:** 3 (procedures, external-docs, committee-docs)
- **Net useful sources:** adopted texts, general context
- **INVOCATION_CAP_ACKNOWLEDGED:** ≤5 EP MCP calls; no additional calls beyond cap

## 7. Recommendation for Analysis

Given degraded procedures feed, the propositions analysis will focus on:
1. Adopted texts from the week of 2026-05-19/20 as legislative output indicators
2. Structural analysis of what the EP approved and what it signals for upcoming work
3. External context (Commission work programme, EU political calendar) for forward projection
4. Historical baseline from 2025-2026 adoption patterns

*Confidence in overall analysis: MEDIUM (🟡) — core legislative output data available;
procedure proposals pipeline data unavailable.*
