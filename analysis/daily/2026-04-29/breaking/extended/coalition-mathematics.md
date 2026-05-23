<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Coalition Mathematics — EU Parliament April 28, 2026

**Classification:** PUBLIC | **Confidence:** 🟢 HIGH
**Admiralty Grade:** B2 | **Date:** 2026-04-29 | **Article Type:** breaking

---

## Framework

This artifact applies quantitative coalition analysis to the April 28, 2026 EP plenary session, computing vote mathematics, coalition compositions, and coalition stability metrics for each primary decision.

---

## Parliament Composition (10th Parliament, April 2026)

| Group | Seats | Share | Bloc |
|-------|-------|-------|------|
| EPP | 185 | 25.7% | Centrist |
| PfE | 85 | 11.8% | Far-Right |
| ECR | 81 | 11.3% | Conservative-Nationalist |
| S&D | 135 | 18.8% | Centrist |
| Renew | 77 | 10.7% | Centrist |
| Greens/EFA | 53 | 7.4% | Progressive |
| The Left | 46 | 6.4% | Radical Left |
| NI | 57 | 7.9% | Non-Attached |
| **Total** | **719** | **100%** | |

**Absolute Majority Threshold:** 360 seats

---

## Vote 1: MFF 2028–2034 Interim Report (TA-10-2026-0111)

### Estimated Coalition Composition

| Group | Seats | Vote | Votes For |
|-------|-------|------|-----------|
| EPP | 185 | YES (full) | 185 |
| S&D | 135 | YES (full) | 135 |
| Renew | 77 | YES (full) | 77 |
| Greens/EFA | 53 | YES (full) | 53 |
| The Left | 46 | SPLIT (social content +, defence −) | 35 |
| ECR | 81 | NO | 0 |
| PfE | 85 | NO | 0 |
| NI | 57 | SPLIT | 15 |
| **TOTAL FOR** | | | **~500** |

**Margin:** ~500 for vs. ~166 against = **strong majority (70%)**

**Coalition Size Analysis:**
- Core centrist coalition (EPP+S&D+Renew+Greens): 450 seats, 62.6%
- With Left partial support: ~485 seats, 67.5%
- Total approximate YES: ~500 seats, 69.5%

**Coalition Stability Score:** 🟢 HIGH
- No group in the centrist coalition had a structural reason to defect
- EPP's competitiveness framing and S&D's social framing both fit within the interim report
- Coalition withstood despite MFF being inherently divisive

---

## Vote 2: Immunity Waivers (TA-10-2026-0114 through 0119) — Six Decisions

### Estimated Coalition Composition (per waiver)

| Group | Seats | Vote | Notes |
|-------|-------|------|-------|
| EPP | 185 | YES | Procedural compliance; no interest in defending PiS-affiliated MEPs |
| S&D | 135 | YES | Strong accountability advocates |
| Renew | 77 | YES | Rule-of-law commitment |
| Greens/EFA | 53 | YES | Strong accountability support |
| The Left | 46 | YES | Rule-of-law and accountability |
| ECR | 81 | MIXED/NO | Some ECR members may have abstained; majority likely voted NO |
| PfE | 85 | NO | Şoşoacă is PfE; solidarity voting |
| NI | 57 | MIXED | Braun is NI; NI split |

**Estimated Voting:**
- For: EPP + S&D + Renew + Greens + Left + fraction NI = ~550 seats (76%)
- Against/Abstain: ECR + PfE + fraction NI = ~170 seats (24%)

**Coalition Stability Score:** 🟢 VERY HIGH
- Supermajority based on unified centrist + progressive coalition
- No cross-cutting pressure from ECR on accountability decisions (ECR directly affected, no credible pro-immunity lobby within centrist groups)
- JURI unanimous recommendation provided procedural cover for all groups

---

## Vote 3: Consent-Based Rape Legislation Resolution (TA-10-2026-0120)

### Estimated Coalition Composition

| Group | Seats | Vote | Notes |
|-------|-------|------|-------|
| EPP | 185 | SPLIT | Social conservative wing likely abstained or voted NO; liberal wing voted YES |
| S&D | 135 | YES (full) | Primary driver of resolution |
| Renew | 77 | YES (full) | Liberal on rights; support with subsidiarity language |
| Greens/EFA | 53 | YES (full) | Strong feminist agenda |
| The Left | 46 | YES (full) | Feminist and progressive |
| ECR | 81 | NO/ABSTAIN | Subsidiarity concerns; social conservative opposition |
| PfE | 85 | NO | Values opposition |
| NI | 57 | MIXED | Varies by country/ideology |

**Estimated Voting (assuming EPP 40% YES / 30% NO / 30% ABSTAIN split):**
- For: 74 EPP (40%) + 135 S&D + 77 Renew + 53 Greens + 46 Left + 10 NI = ~395 seats (55%)
- Against: 55 EPP + 81 ECR + 85 PfE + 20 NI = ~241 seats (33%)
- Abstain: 56 EPP + 27 NI = ~83 seats (12%)

**Coalition Stability Score:** 🟡 MODERATE
- Resolution passed but with significantly smaller majority than immunity waivers
- EPP internal split is the primary coalition instability factor
- Non-legislative nature of resolution reduced the stakes for EPP dissenters

---

## Coalition Composition Over Time — Session Average

```
                     EPP  S&D  Ren  Grn  Lft  ECR  PfE  NI
MFF Interim Report:   YES  YES  YES  YES  ~Y   NO   NO   MX
Immunity Waivers:     YES  YES  YES  YES  YES  MX   NO   MX
Consent Resolution:   SPL  YES  YES  YES  YES  NO   NO   MX

MX = Mixed/Split; SPL = Split
```

**Overall Coalition Characterisation:** The April 28 session confirmed the **5-group centrist-progressive majority** (EPP/S&D/Renew/Greens/Left) as the primary governing coalition, with EPP the decisive swing element — voting with the majority on accountability and budget but splitting on rights/values.

---

## Sensitivity Analysis: What Would Have Changed Outcomes?

**Scenario A: EPP Defects on MFF Interim Report**
- If EPP voted NO: 450 votes against 185 (would still pass without EPP: 265 non-EPP YES, but not majority)
- Conclusion: EPP's participation was necessary for the MFF to pass as formulated. If EPP had substantially amended terms, the report would look different.

**Scenario B: Renew Breaks on Immunity Waivers**
- Without Renew (77 seats): Still ~473 YES (majority maintained)
- Conclusion: Immunity waiver majority was robust enough to absorb Renew defection without changing outcome

**Scenario C: Left Votes Against Consent Resolution**
- Without Left (46 seats): ~349 YES (below 360 majority threshold!)
- Conclusion: The Left's support was **critical** for consent resolution adoption. Without Left participation, the resolution would have failed.

---

## Effective Number of Parliamentary Parties (ENPP)

**Formula:** ENPP = 1/Σ(si²) where si = seat share of group i

**Calculation:**
- EPP: 0.257² = 0.0660
- PfE: 0.118² = 0.0139
- ECR: 0.113² = 0.0128
- S&D: 0.188² = 0.0353
- Renew: 0.107² = 0.0114
- Greens: 0.074² = 0.0055
- Left: 0.064² = 0.0041
- NI: 0.079² = 0.0062
- **Sum: 0.1552**
- **ENPP = 1/0.1552 = 6.44**

**Interpretation:** An ENPP of 6.44 indicates a highly fragmented parliament requiring broad coalitions. For comparison, a perfect two-party system would have ENPP=2. The EU Parliament is among the most fragmented supranational legislatures globally, making coalition maintenance on complex legislation genuinely challenging.

---

## Coalition Durability Outlook: Next 12 Months

| Legislative File | Coalition Likely? | Risk Factors |
|-----------------|-------------------|--------------|
| MFF Council negotiation support | YES (centrist coalition) | EPP-Council coordination pressure |
| European Defence cooperation funding | POSSIBLE (EPP/S&D/ECR triangle) | Greens/Left concerns; Progressive vs. security |
| EU AI Act implementation | YES (EPP/S&D/Renew) | Technical disagreements only |
| Migration Pact implementation | UNCERTAIN | EPP pressure from ECR/PfE positions |
| Green Deal implementation | POSSIBLE (EPP split) | EPP social conservative vs. liberal wing |

---

*EU Parliament Monitor | Coalition Mathematics | 2026-04-29*
