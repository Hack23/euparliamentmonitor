<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Pipeline Health — EU Parliament Legislative Pipeline 2026-05-01

**Scope:** Active EU legislative pipeline health assessment  
**Data source:** EP MCP data (April 28–30, 2026 plenary outputs + Stage A data collection)  

---

## PIPELINE HEALTH SUMMARY

**Overall pipeline health: 🟡 DEGRADED (RECESS_MODE)**

The primary procedures feed (`get_procedures_feed`) returned RECESS_MODE during Stage A of this analysis run — providing historical archive data (1972–1988) rather than current active procedures. This significantly limits visibility into the active legislative pipeline for procedures in committee or inter-institutional negotiation stages.

**Available data:** Adopted texts (final-stage outputs) provide good coverage of completed legislative acts. Track_legislation for specific procedure IDs works reliably. The absence of procedures feed coverage means proposals in early-to-mid pipeline stages are invisible in this run.

---

## COMPLETED PIPELINE ITEMS (April 28–30, 2026)

### Item 1: Anti-Corruption Regulation (2023/0135/COD)

**Stage completed:** Signed by EP President April 29, 2026  
**Status:** ✅ COMPLETE — Pending OJ publication  
**Pipeline velocity:** Proposal to signature in ~30 months (fast for EU criminal law)  
**Next step:** OJ publication (expected May 2026) → Entry into force  
**Health:** 🟢 HEALTHY — completed on schedule

### Item 2: SRMR3 (2023/0111/COD)

**Stage completed:** Published in Official Journal April 20, 2026  
**Status:** ✅ COMPLETE — In force  
**Pipeline velocity:** 26 months from Commission proposal to entry into force  
**Next step:** Technical implementing acts (EBA/SRB) — ongoing  
**Health:** 🟢 HEALTHY — completed and in force

### Item 3: Dogs and Cats Welfare Regulation (2023/0447/COD)

**Stage completed:** EP position post-trilogue adopted April 29, 2026  
**Status:** 🟡 PENDING COUNCIL — Formal Council second reading required  
**Pipeline velocity:** Plenary post-trilogue vote; Council formal adoption ~4–6 weeks  
**Next step:** Council formal adoption → OJ publication → 2-year implementation period  
**Health:** 🟢 HEALTHY — on track for completion

---

## URGENCY RESOLUTION PIPELINE (April 30, 2026)

### DMA Enforcement Resolution (TA-10-2026-0160)

**Status:** ✅ ADOPTED  
**Type:** Non-legislative urgency resolution  
**Impact on pipeline:** Requires Commission response on enforcement timeline within 30 days  
**Follow-up mechanism:** Commissioner to appear before IMCO committee — expected May/June 2026

### Ukraine Civilian Infrastructure Accountability Resolution

**Status:** ✅ ADOPTED  
**Type:** Non-legislative urgency resolution  
**Pipeline consequence:** Informs Budget 2027 guidelines and Ukraine Facility mid-term review

### Armenia Resilience Resolution

**Status:** ✅ ADOPTED  
**Type:** Non-legislative resolution on EU neighbourhood policy  
**Pipeline consequence:** May trigger formal AFET committee report on South Caucasus EU engagement

### Haiti Human Trafficking Resolution

**Status:** ✅ ADOPTED  
**Type:** Non-legislative urgency resolution on human rights  
**Pipeline consequence:** Informs EP position on EU development cooperation with CARICOM region

---

## ACTIVE PIPELINE (LIMITED VISIBILITY DUE TO RECESS_MODE)

**⚠️ WARNING:** Due to `get_procedures_feed` RECESS_MODE, active pipeline visibility is severely limited. The following represents best-available intelligence from Stage A data collection:

### Known Active Procedures (from track_legislation and feed data)

**Near completion (expected in coming months):**

1. **Savings and Investments Union (SIU)** — Commission expected to publish legislative proposal June 2026. Linked to SRMR3 completion. Legislative journey will take 18–24 months after proposal.

2. **EU Budget 2027** — Guidelines adopted April 28; Commission draft budget expected September 2026; full interinstitutional negotiation through autumn 2026.

3. **EPPO Regulation revision** — Mandate expansion under discussion post-Anti-Corruption Regulation signing. No formal proposal yet.

**Estimated pipeline health without procedures feed data:**

- Legislation in committee rapporteur phase: UNKNOWN (feed unavailable)
- Legislation in trilogue: UNKNOWN (feed unavailable; known items: ONLY Dogs/Cats completed April 29)
- Legislation awaiting plenary vote: UNKNOWN

---

## PIPELINE VELOCITY METRICS (Available Procedures)

Based on the three completed procedures tracked:

| Procedure | Commission Proposal | EP/Council Adoption | Velocity |
|-----------|--------------------|--------------------|---------|
| 2023/0135/COD (Anti-Corruption) | 2023 | April 2026 | ~30 months |
| 2023/0111/COD (SRMR3) | 2023 | April 2026 | ~26 months |
| 2023/0447/COD (Dogs/Cats) | 2023 | April 2026 (EP) | ~29 months |

**Average velocity for completed procedures:** ~28 months from Commission proposal to EP adoption.  
This is faster than the EP10 average for comparable legislation (estimated 30–36 months based on EP8/EP9 data), which may reflect the current political urgency around governance and regulatory completion.

---

## PIPELINE HEALTH ASSESSMENT

**Strengths:**
- Three major legislative acts completed in one plenary session (unusual for productivity)
- Anti-Corruption and SRMR3 both at or faster than projected timelines
- Strong majority coalition maintaining legislative throughput

**Weaknesses:**
- Procedures feed in RECESS_MODE limits active pipeline visibility
- Voting records unavailable for quality analysis
- Unknown number of stalled procedures in committee stage

**Overall assessment: 🟡 PRODUCTIVE BUT LOW VISIBILITY**

The April 28–30 session was exceptionally productive in terms of completed legislation. However, the RECESS_MODE limitation means the broader active pipeline health cannot be assessed from available data. Future runs during active parliamentary periods should have significantly better procedures feed coverage.
