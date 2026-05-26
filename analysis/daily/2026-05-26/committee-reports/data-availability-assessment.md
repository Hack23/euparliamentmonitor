<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Data Availability Assessment — Committee Reports | 2026-05-26

**Run ID:** committee-reports-run260-1779774042  
**Data Mode:** `degraded-feeds` (factor: 0.80)  
**Generated:** 2026-05-26T05:45:00Z  
**Article Type:** committee-reports  

---

## EP API Feed Status

| Feed | Status | HTTP Code | Note |
|------|--------|-----------|------|
| `get_committee_documents_feed` | ❌ UNAVAILABLE | 404 | Fixed-window feed returning no items |
| `get_procedures_feed` | ⚠️ DEGRADED | 200-fallback | Fallback to `/procedures` endpoint; returned 50 old procedures (1972–2000 era, no 2025–2026 data) |
| `get_events_feed` | ❌ UNAVAILABLE | 404 | Upstream enrichment failed |
| `get_committee_documents` | ⚠️ PARTIAL | 200 | 50 AFCO documents returned; minimal metadata (no dates, no full text) |
| Plenary sessions (7-day window) | ❌ EMPTY | 200 | Zero sessions returned for 2026-05-19 to 2026-05-26 |
| Pre-fetch: committee-documents-feed | ❌ PLACEHOLDER | 404 | Set during pre-agent step |
| Pre-fetch: documents-feed | ❌ ERROR | 404 | Enrichment failed |
| Pre-fetch: events-feed | ❌ ERROR | 404 | Enrichment failed |
| Pre-fetch: procedures-feed | ❌ ERROR | 404 | Enrichment failed |

## Live MCP Calls Made (Stage A — 5 of 5 cap used)

1. `get_committee_documents_feed` → 404 UNAVAILABLE
2. `get_procedures_feed` → DEGRADED (50 old procedures, fallback endpoint)
3. `get_events_feed` → 404 UNAVAILABLE
4. `get_committee_documents` → PARTIAL (50 AFCO documents, minimal metadata)
5. `get_plenary_sessions` → EMPTY (0 sessions in date range)

**EP MCP call cap reached.** No further calls executed.

## Data Mode Determination

**Selected mode:** `degraded-feeds`  
**Rationale:** Multiple EP feeds unavailable (committee-documents-feed 404, events-feed 404, procedures-feed returning only fallback data with no current-year items). The `degraded-feeds` trigger independently applies: ≥1 feeds returned 404 after pre-fetch. The EP Open Data Portal is exhibiting widespread 404 errors across enrichment endpoints on this date, indicating a possible upstream maintenance window or API version issue.

**Line-floor factor applied:** 0.80 (20% reduction on all artifact floors).

## Structural Checks Status

- Mermaid diagrams: **REQUIRED** (not reduced by data mode)
- WEP bands: **REQUIRED** for designated artifacts
- Admiralty grades: **REQUIRED** for designated artifacts  
- SATs ≥10: **REQUIRED** for methodology-reflection.md

## Contextual Data Used

Despite feed degradation, the following context has been applied to produce substantive analysis:

- **AFCO documents** (50 items): Constitutional Affairs Committee activity confirmed active in EP 10th term (2024–2029); document IDs AFCO-AD-*, AFCO-PR-*, AFCO-PA-* series confirm ongoing opinion/report pipeline.
- **EP Political Landscape (known):** EPP (189 seats), S&D (136), ECR (78), Renew (77), Greens/EFA (53), Patriots for Europe (84), ESN (25), Left (46), NI (~20). 705-seat parliament; EPP largest group.
- **Legislative context (known):** EP 10th term active on AI Act implementation, Competitiveness agenda (Draghi report follow-up), Defense Industrial Strategy, Green Deal revision, Migration Pact implementation, Digital Single Market measures.
- **Committee calendar (inferred):** Late May 2026 falls in the parliamentary week of May 26–29, 2026. Major committee weeks typically involve votes, rapporteur presentations, and trilogue coordination.

## Confidence Assessment

**Overall data confidence:** 🟡 MEDIUM-LOW  
The absence of live feed data necessitates reliance on known EP context and inferred committee activity. Factual claims about specific documents are limited to confirmed AFCO document IDs. All forward projections carry `Unlikely` to `Roughly Even` WEP bands given data uncertainty.

**Admiralty Source Grade:** F2 (Cannot be judged reliability; secondary; degraded-feeds run with no primary documentary evidence for most committees)
