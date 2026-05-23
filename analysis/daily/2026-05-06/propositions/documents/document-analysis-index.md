<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Document Analysis Index — EU Parliament Propositions
**Date:** 2026-05-06

---

## Document Availability Status

⚠️ **DEGRADED**: EP API committee documents, external documents, and procedures feeds all returned 502 errors during Stage A. No real-time document data is available for this run.

**Available document intelligence**: Based on pre-generated statistics, prior run artifacts (2026-05-05), and structural EP10 knowledge.

---

## Expected Active Documents (Not Retrieved — EP API down)

Based on the EP10 propositions pipeline status as of 2026-05-06:

### CID-Related Documents (Expected)

| Document Type | Originator | Status | Retrieval Status |
|---------------|-----------|:------:|:----------------:|
| CID Framework Regulation draft | Commission (DG ENV) | Committee stage | ❌ API unavailable |
| ENVI committee rapporteur working document | ENVI | In preparation | ❌ API unavailable |
| ITRE committee opinion draft | ITRE | In preparation | ❌ API unavailable |
| CBAM Phase 2 impact assessment addendum | Commission | Expected | ❌ API unavailable |

### EDIS-Related Documents (Expected)

| Document Type | Originator | Status | Retrieval Status |
|---------------|-----------|:------:|:----------------:|
| EDIS proposal (Article 122 TFEU) | Commission (DG DEFIS) | AFET committee stage | ❌ API unavailable |
| AFET committee rapporteur designation | AFET | Pending | ❌ API unavailable |
| ITRE committee opinion | ITRE | Pending | ❌ API unavailable |

### AI Act Implementation Documents (Expected)

| Document Type | Originator | Status | Retrieval Status |
|---------------|-----------|:------:|:----------------:|
| AI Act delegated acts package | Commission (DG CNECT) | Scrutiny period | ❌ API unavailable |
| IMCO/LIBE committee scrutiny opinion | IMCO/LIBE | Active | ❌ API unavailable |
| AI Office workplan | AI Office | Published | ❌ API unavailable |

---

## Documents Available from Prior Run (2026-05-05)

The 2026-05-05 propositions analysis run had access to some document data. Key findings from prior run (carried forward as reference):
- CID consultation documents active in committee
- EDIS preliminary proposal under legal service review
- AI Act scrutiny timeline confirmation (delegated acts under 2-month clock)

---

## Document Gap Assessment

| File | Document Gap Impact | Severity |
|------|--------------------:|:--------:|
| executive-brief.md | Cannot reference specific procedure IDs | 🟡 MEDIUM |
| stakeholder-map.md | Cannot cite specific rapporteur positions | 🟡 MEDIUM |
| coalition-dynamics.md | Cannot reference committee votes | 🟡 MEDIUM |
| scenario-forecast.md | Cannot confirm timeline based on real documents | 🟡 MEDIUM |

**Mitigation applied**: All artifacts note "document data unavailable — EP API outage" and qualify procedural claims as structural analysis rather than real-time procedure tracking.

---

## Re-run Priority When API Restores

When EP API comes back online, Stage A should be re-run to retrieve:
1. `get_procedures_feed` — current week procedure status
2. `get_committee_documents_feed` — recent ENVI, ITRE, AFET documents
3. `get_external_documents_feed` — Council positions, Commission communications
4. `get_voting_records` — any votes since 2026-04-29

This would upgrade the document intelligence from "structural estimate" to "verified current status."
