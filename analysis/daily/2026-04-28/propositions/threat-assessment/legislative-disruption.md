<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Legislative Disruption — EU Parliament Propositions
## April 28, 2026 | Disruption Risk Assessment

**Admiralty Grade:** B2 | **Run Date:** 2026-04-28

---

## 1. Disruption Flow Diagram (Mermaid)

```mermaid
flowchart TD
    START["Normal Legislative Process"] --> TRIGGER{"Disruption\nTrigger?"}

    TRIGGER --> |"CJEU Challenge"| COURT_TRACK["Court Track\n6-36 months"]
    TRIGGER --> |"Coalition Breakdown"| POLITICAL_TRACK["Political Track\n1-6 months"]
    TRIGGER --> |"Emergency Event"| EMERGENCY_TRACK["Emergency Track\n1-4 weeks"]
    TRIGGER --> |"Council Veto"| COUNCIL_TRACK["Council Track\n3-12 months"]
    TRIGGER --> |"No disruption"| NORMAL_TRACK["Normal Track ✅"]

    COURT_TRACK --> ANNULMENT{"Annulment?"}
    ANNULMENT --> |"Yes (35-45%)"| REPROPOSAL["Commission Re-proposal\n+18-36 months"]
    ANNULMENT --> |"No (55-65%)"| MODIFIED["Modified Implementation\nvia Interpretation"]

    POLITICAL_TRACK --> COALITION_REBUILT{"Coalition\nRebuilt?"}
    COALITION_REBUILT --> |"Yes (70%)"| DELAYED_PASSAGE["Delayed Passage\n+2-4 months"]
    COALITION_REBUILT --> |"No (30%)"| FILE_FALL["File Falls\nNext Parliament"]

    EMERGENCY_TRACK --> RESPONSE{"Emergency\nResolution"}
    RESPONSE --> CALENDAR_DISPLACED["Normal Calendar\nDisplaced 1-2 months"]
    RESPONSE --> |"Major crisis"| PROLONGED_DISRUPTION["Prolonged Disruption\n3-6 months"]

    COUNCIL_TRACK --> CONCILIATION["Conciliation\nProcess"]
    CONCILIATION --> |"Agreement (75%)"| DELAYED_PASSAGE
    CONCILIATION --> |"Failure (25%)"| FILE_FALL

    style NORMAL_TRACK fill:#00aa00,color:#fff
    style REPROPOSAL fill:#cc0000,color:#fff
    style FILE_FALL fill:#cc0000,color:#fff
    style PROLONGED_DISRUPTION fill:#cc8800,color:#fff
```

---

## 2. Current Disruption Risk Assessment

### Near-Term Disruption Indicators (April–June 2026)

| Indicator | Status | Disruption Risk |
|-----------|--------|-----------------|
| Procedures feed RECESS_MODE | Active (85% probability continues) | 🟡 MEDIUM (intelligence only) |
| Plenary session scheduled | April 27-30 confirmed | 🟢 LOW |
| Coalition stability score | 84/100 (early warning system) | 🟢 LOW-MEDIUM |
| US tariff dispute | Active, retaliation authorised | 🟡 MEDIUM |
| CJEU calendar | No EP cases scheduled (not visible in API) | 🟡 MEDIUM (unknown) |

### Files at Risk of Disruption

**HIGH disruption risk**:
1. **Safe Countries migration file implementation**: CJEU challenge highly probable; if preliminary ruling issued, all national decisions under the regulation suspended pending outcome
2. **Banking Union Level 2 acts**: Italian/Council resistance could delay MREL calibration implementing regulation by 6–12 months

**MEDIUM disruption risk**:
3. **Climate 2040 implementing legislation**: National contributions negotiation expected to be protracted; Polish Presidency may not close before handover to Denmark
4. **AI Act GPAI obligations**: Industry lobbying may delay Commission delegated act by 3–6 months

**LOW disruption risk**:
5. **EGF applications**: Procedural, annual cycle — minimal disruption risk
6. **Budget procedures**: Fixed calendar; disruption would require extraordinary circumstances

---

## 3. Disruption Mitigation

| Disruption type | Current mitigation | Adequacy |
|----------------|-------------------|----------|
| CJEU challenge | Commission legal proofing at proposal stage | 🟡 PARTIAL |
| Coalition breakdown | EPP flexibility to switch coalition partners | 🟢 ADEQUATE |
| Emergency session | Parliament's procedural rules allow emergency insertion | 🟢 ADEQUATE |
| Council veto | Trilogue process; Commission mediation role | 🟡 PARTIAL |
| Hybrid threats/cyber | NIS2 implementation; EP IT security | 🟡 PARTIAL |

---

*Generated: 2026-04-28 | propositions-run-1777356258*
