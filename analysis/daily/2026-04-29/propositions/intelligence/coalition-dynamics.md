<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Coalition Dynamics — EU Parliament Propositions
**Date:** 2026-04-29 | **Session:** Strasbourg April 28–29, 2026

## 1 · Parliament Composition (EP10, April 2026)

| Group | Seats | Share | Ideological Axis |
|-------|-------|-------|-----------------|
| EPP | 185 | 25.7% | Centre-right, pro-EU, pro-market |
| S&D | 135 | 18.8% | Centre-left, social Europe |
| PfE | 85 | 11.8% | Right, Eurosceptic, nationalist |
| ECR | 81 | 11.3% | Conservative-nationalist, soft Eurosceptic |
| Renew | 77 | 10.7% | Liberal, pro-EU, market |
| Greens/EFA | 53 | 7.4% | Green, federalist |
| The Left | 46 | 6.4% | Progressive left, anti-austerity |
| ESN | 27 | 3.8% | Far-right, sovereignist |
| NI | 30 | 4.2% | Non-attached (mixed ideologies) |
| **Total** | **719** | | Majority: 361 |

**Data quality note:** `analyze_coalition_dynamics` returns null cohesion/defection metrics because per-MEP roll-call vote data is not yet published for April 2026 sessions. Seat-share analysis and structural inference are the sole available proxies at this time. 🔴 **Vote-level confirmation pending — treat all coalition analysis as structural inference only.**

## 2 · Core Coalition Arithmetic

### "Grand Pro-EU Coalition" (EPP + S&D + Renew)
**Combined seats:** 185 + 135 + 77 = **397** (majority = 361; surplus: **+36**)

This coalition is the backbone of EP10 legislation. It commands a comfortable majority and has produced most major legislative outputs in EP10. However:
- Internal coherence is fragile on fiscal/social splits (EPP vs. S&D on MFF, state aid, social rights)
- The +36 surplus is thinner than EP9's ~50-seat margin, requiring more careful whip management
- Renew group has fragmented in EP10 (pro-Ukraine vs. socially conservative Renew MEPs)

**April 28 voting pattern inference:** The GSP reform and ocean diplomacy resolutions likely passed on this coalition. Animal welfare regulation (dogs/cats) likely attracted broader support including Greens/EFA and portions of ECR.

### "Consent-Based Rape Majority" (S&D + Greens + Left + Renew [part])
**Conservative estimate:** 135 + 53 + 46 + ~50 = **~284** — below majority without EPP

**With EPP liberal wing:** ~40-50 EPP MEPs (Nordic + Benelux + German) → total ~324-334 — still short of 361

**Inference:** The consent-based rape legislation resolution adopted April 28 suggests either (a) the EPP as a whole supported a non-binding resolution framing (consistent with prior pattern on "urging Commission to act" language) or (b) a broader coalition including some ECR moderates. Non-binding resolutions require a simple majority of votes cast, not of all MEPs, which reduces the threshold significantly.

### MFF Coalition Scenario Analysis

#### Scenario A — Full "Grand Coalition" MFF at EP ambitions (€1.1-1.2T)
- Requires: EPP + S&D + Renew unified
- Probability: **30%** — Germany's fiscal consolidation creates EPP-internal splits; Renew's liberal fiscal wing resists high ceilings
- Key variable: German EPP MEPs' willingness to defy Bundestag coalition position

#### Scenario B — Compromise MFF (€1.05T + defence uplift carve-out)
- Requires: EPP + S&D + Renew + Greens on core text; ECR partial support on defence elements
- Probability: **55%** — Most likely outcome if French and Polish EPP can negotiate a compromise between fiscal hawks and social spenders
- Key variable: How "defence" is defined and whether off-balance-sheet instruments (EDIP) satisfy EPP's demand

#### Scenario C — Council prevails at €1.0T flat
- Requires: EP coalition fracture; German fiscal hawks win
- Probability: **15%** — Parliament historically recovers budget ambitions in trilogue; EP has strong institutional incentive to maintain high opening position

**Confidence across MFF scenarios:** 🟡 Medium — structural/historical inference; no vote-level data available

## 3 · Right-Wing Opposition Dynamics

### PfE–ECR Non-Cooperation Pattern
PfE (85) and ECR (81) together have **166 seats** — enough to create a blocking minority on procedural votes and to influence the agenda when the Grand Coalition fractures. However:
- PfE and ECR compete for the same voter base and MEP recruits; coordination is episodic rather than systematic
- ECR has shown more willingness to negotiate with EPP on trade, defence, and agricultural policy; PfE is more strictly sovereignist
- Combined PfE+ECR+ESN+NI hard-right bloc: ~224 seats — significant but well below blocking minority on legislation

**April 28 immunity waivers:** All Polish PiS-affiliated MEPs targeted by the waivers belong to ECR. The ECR group likely voted against the waivers but was unsuccessful — consistent with the Grand Coalition delivering.

### ESN (27 seats) — Isolated Far-Right
ESN is too small and ideologically extreme to form sustainable coalitions. Its influence is primarily through European Council pressure via domestically governing parties (Viktor Orbán's Fidesz has observer-level ties). ESN's ability to delay procedures through procedural obstruction has been constrained by EP10's reformed rules of procedure.

## 4 · Cross-Cutting Alliances by Policy Domain

| Policy Domain | Majority Coalition | Opposition | Confidence |
|--------------|-------------------|-----------|-----------|
| MFF 2028-2034 (ambition level) | EPP+S&D+Renew (uncertain internally) | PfE+ECR+Germany-specific EPP | 🟡 Medium |
| Defence spending in EU budget | EPP+ECR+Renew+part-S&D | Greens+Left+part-Renew | 🟡 Medium |
| GSP/trade with conditionality | EPP+S&D+Greens+Renew | ECR+PfE | 🟢 High |
| Social rights (consent laws) | S&D+Greens+Left+(part-Renew) | ECR+PfE+ESN | 🟡 Medium |
| Animal welfare | EPP+S&D+Greens+Renew+Left | ECR-agriculture wing+PfE | 🟢 High |
| US tariff response | INTA cross-party (broad) | — | 🟢 High |
| EIB climate alignment | S&D+Greens+Left+Renew | EPP-right+ECR+PfE | 🟡 Medium |
| MEP immunity waivers | Grand Coalition (case-by-case) | ECR (national solidarity) | 🟢 High |

*Source: EP Open Data Portal structural data | Run: propositions-run-1777442543 | 2026-04-29*
