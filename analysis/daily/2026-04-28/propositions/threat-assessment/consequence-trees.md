<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Consequence Trees — EU Parliament Propositions
## April 28, 2026 | Legislative Consequence Analysis

**Admiralty Grade:** B2 | **Run Date:** 2026-04-28

---

## 1. Banking Union Consequence Tree (Mermaid)

```mermaid
graph TD
    BRRD3["BRRD3/SRMR3 Adopted\n26 March 2026"] --> IMPL1["Level 2 implementing acts\n(est. Q4 2026 – Q2 2027)"]
    BRRD3 --> TRANSP["Member State Transposition\n(18-24 month window)"]
    BRRD3 --> MREL["MREL calibration\nfor all banks"]

    IMPL1 --> |"Council agrees"| SMOOTH["Smooth implementation\n✅ Banking Union complete"]
    IMPL1 --> |"Council blocks (45%)"| DELAY["Delayed L2 acts\n+6-12 months"]

    TRANSP --> |"On time (70%)"| FULL_IMPL["Full BRRD3 operational\nQ1 2028"]
    TRANSP --> |"Late (30%)"| PARTIAL_IMPL["Fragmented national implementation\nrisk of uneven protection"]

    MREL --> |"Before crisis"| RESILIENCE["Higher bank resilience\n📈 Reduced taxpayer exposure"]
    MREL --> |"If bank fails\nbefore transposition"| GAP_SCENARIO["BRRD2 applies\n(weaker framework)\n⚠️ Resolution gap risk"]

    style SMOOTH fill:#00aa00,color:#fff
    style RESILIENCE fill:#00aa00,color:#fff
    style GAP_SCENARIO fill:#cc0000,color:#fff
    style PARTIAL_IMPL fill:#ffaa00
```

---

## 2. Climate Consequence Tree (Mermaid)

```mermaid
graph TD
    CLIMATE40["2040 Climate Target\n90% GHG reduction\n10 Feb 2026"] --> NATL_CONTRIB["National Contributions\n(Member State targets)"]
    CLIMATE40 --> ETS_REFORM["ETS Price Signal\n€60-100/tCO2"]
    CLIMATE40 --> INVEST_SIGNAL["Investment Signal\n15-year certainty"]

    NATL_CONTRIB --> |"Agreement by 2027"| ALIGNED["Aligned national plans\n📈 Clean investment confidence"]
    NATL_CONTRIB --> |"Dispute (35%)"| NATL_CONFLICT["Member state conflict\non target share"]

    ETS_REFORM --> INNOVATION["Green innovation\ncompetitiveness"]
    ETS_REFORM --> |"Carbon leakage risk"| CBAM["CBAM enforcement\ncritical"]

    INVEST_SIGNAL --> GREEN_BONDS["EU Green Bond market\ngrowth"]
    INVEST_SIGNAL --> INDUSTRY["Industrial decarbonisation\ninvestment cycle begins"]

    NATL_CONFLICT --> |"CJEU infringement"| COMPLIANCE["Forced compliance\n+2-3 years"]
    NATL_CONFLICT --> |"Political compromise"| DILUTED["Diluted implementation\n🔴 Targets miss"]

    style ALIGNED fill:#00aa00,color:#fff
    style GREEN_BONDS fill:#00aa00,color:#fff
    style DILUTED fill:#cc0000,color:#fff
```

---

## 3. Migration Consequence Tree

```mermaid
graph TD
    SAFE_CTRY["Safe Countries\n/ Safe Third Country\nAdopted Q1 2026"] --> NATIONAL_IMPL["National implementation\nof accelerated procedures"]
    SAFE_CTRY --> CJEU_CHALLENGE["CJEU Challenge\n40% probability"]

    NATIONAL_IMPL --> |"Smooth (60%)"| REDUCED_PROC["Reduced processing times\n📉 Asylum backlogs"]
    NATIONAL_IMPL --> |"Resistance (40%)"| UNEVEN["Uneven national\nimplementation"]

    CJEU_CHALLENGE --> |"Annulment (40%)"| VOID["Regulation void\nPending re-proposal\n⚠️ 18-36 months gap"]
    CJEU_CHALLENGE --> |"Upheld (60%)"| CONFIRMED["Legal certainty\n✅ Confirmed framework"]

    VOID --> POLITICAL_CRISIS["Political crisis\nFar-right gains exploit failure"]
    VOID --> COMMISSION_PROPOSAL["Commission re-proposal\nwith compatibility fixes"]

    style REDUCED_PROC fill:#00aa00,color:#fff
    style CONFIRMED fill:#00aa00,color:#fff
    style VOID fill:#cc0000,color:#fff
    style POLITICAL_CRISIS fill:#cc0000,color:#fff
```

---

## 4. Consequence Priority Assessment

| Consequence Branch | Probability | Impact | Priority |
|-------------------|------------|--------|----------|
| Banking Union smooth L2 implementation | 55% | Very High (positive) | 🟢 Monitor |
| Banking Union Council delay | 45% | High (negative) | 🔴 Watch |
| Climate 2040 aligned national plans | 65% | Very High (positive) | 🟢 Monitor |
| Climate diluted implementation | 35% | Very High (negative) | 🔴 Watch |
| Migration CJEU annulment | 40% | High (negative) | 🔴 Critical |
| Migration confirmed framework | 60% | High (positive) | 🟢 Track |

---

*Generated: 2026-04-28 | propositions-run-1777356258*
