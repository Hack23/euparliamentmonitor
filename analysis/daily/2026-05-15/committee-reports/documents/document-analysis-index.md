# Document Analysis Index — EU Parliament Committee Reports
**Date:** 2026-05-15 | **Classification:** Public | **Admiralty Grade:** D2 (degraded)

---

## Document Corpus Status

**EP API Status:** Severely degraded — `get_committee_documents_feed` returned unavailable; `get_committee_documents` returned 51 documents from AFCO committee only with no dates, authors, or substantive summaries.

---

## AFCO Committee Documents Retrieved (51 total, degraded)

The retrieved documents are all from the Committee on Constitutional Affairs (AFCO) and include:

| Type | Count | Examples |
|---|---|---|
| OPINION (AD type) | ~18 | AD-PE592.152, AD-PE782.229 (range suggests multi-term span) |
| OPINION (AL type) | ~8 | AL-PE751.785, AL-PE770.215 |
| OPINION (PA type) | ~14 | PA-PE592.152, PA-PE782.229 |
| REPORT (PR type) | ~8 | PR-PE630.640, PR-PE751.801 |

**Data Quality Note:** All documents lack dates, authors, and meaningful summaries. Document IDs suggest they span multiple EP terms (PE592 = approximately 2014; PE782 = approximately 2025). Without dates or authors, no temporal analysis is possible.

---

## Document Analysis (Structural Knowledge Supplement)

Given the degraded API data, this section supplements with structural knowledge of AFCO's typical document output:

**AFCO Typical Mandate (Constitutional Affairs):**
- Electoral law reform opinions
- EU treaty interpretation opinions
- Political party and foundation funding rules
- EP composition and procedure
- Inter-institutional agreements

**Expected Active AFCO Files (May 2026):**
- EP composition for 2024 elections — post-election validation
- Transnational lists framework — ongoing legislative initiative
- Electoral authority independence standards — ongoing
- Rule of law mechanism refinements — ongoing

---

## Document Quality Assessment

**Overall document data quality:** 🔴 Very Low
**Usability for current analysis:** Limited — AFCO documents are valuable for constitutional/procedural matters but represent only 1 of 26 EP committees
**Recommended follow-up:** Future runs should use `get_committee_documents` with committee-specific IDs (ENVI, ITRE, LIBE, BUDG, AFET) to retrieve more relevant document sets

---

## Source Provenance

- **EP MCP tool:** `european-parliament-get_committee_documents` (D2 Admiralty — cannot judge reliability)
- **Structural knowledge:** A2 Admiralty — reliable for AFCO mandate description
- **Admiralty Grade for this artifact:** D2 overall (primary source unreliable for current analysis)
