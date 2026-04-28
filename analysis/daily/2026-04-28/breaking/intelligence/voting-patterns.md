<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Voting Patterns Analysis — EP Breaking News
**Date:** 2026-04-28 | **Confidence:** 🟡 Medium (roll-call data delayed)

---

## 1. Data Availability Note

Per EP publishing norms, roll-call voting data for April 2026 is not yet available via the EP Open Data Portal (typical delay: 4–6 weeks from vote date). Voting patterns for March 2026 votes are being prepared for publication. This analysis draws on:

- Plenary session records (attendance counts, vote item counts)
- Political group size data (current MEP roster)
- Adopted text metadata (adoption dates, procedure types)
- Historical EP10 voting pattern evidence from earlier terms

## 2. March 26, 2026 Voting Session — Pattern Reconstruction

The Brussels mini-plenary (March 25–26, 2026) produced the highest legislative output of any 2026 session to date, with multiple adopted texts on the same day. Structural analysis:

**Session attendance:** 627 MEPs (MTG-PL-2026-03-26)  
**Majority threshold for this session:** 314 (absolute majority based on 627 attending)  
**Estimated voting range:** 590–620 MEPs voted on major items (accounting for procedural abstentions)

### 2.1 US Tariff Counter-Response Vote Pattern (TA-10-2026-0096)
Based on group composition and policy alignment data:

| Group | Expected Position | Seats Available | Estimated Vote |
|-------|------------------|-----------------|----------------|
| EPP | FOR (trade defence) | 185 | ~170 FOR |
| S&D | FOR (worker protection framing) | 135 | ~128 FOR |
| PfE | AGAINST (sovereignty/consumer cost) | 85 | ~78 AGAINST |
| ECR | SPLIT (national interest variation) | 81 | ~40 FOR, ~35 AGAINST |
| Renew | FOR (with reservations on specific products) | 77 | ~68 FOR |
| Greens/EFA | FOR (strategic autonomy + anti-US aggression) | 53 | ~48 FOR |
| The Left | FOR (anti-neoliberal trade defence framing) | 46 | ~40 FOR |
| NI | MIXED | 30 | ~15 FOR, ~12 AGAINST, ~3 ABS |
| ESN | AGAINST | 27 | ~24 AGAINST |

**Estimated outcome:** ~509 FOR, ~149 AGAINST, ~18 ABS/Absent  
**Result:** Adopted by substantial majority — consistent with EP12 pro-EU trade bloc cohesion

### 2.2 SRMR3 Vote Pattern (TA-10-2026-0092)
Banking union reform typically commands a strong centre-right to centre-left coalition:

| Group | Expected Position | Rationale |
|-------|------------------|-----------|
| EPP | FOR | Business community and banking sector support; Commission alignment |
| S&D | FOR (with conditions) | Worker protection additions secured in trialogue |
| Renew | FOR | Financial stability framing; supports deeper banking union |
| Greens/EFA | SPLIT | Environmental/sustainability conditions on bank resolution criteria |
| The Left | AGAINST | Opposes bail-in precedence over depositor/worker protection |
| PfE | AGAINST | Supranational resolution authority expansion |
| ECR | SPLIT | National banking sovereignty concerns |

**Estimated outcome:** ~390 FOR, ~200 AGAINST, ~40 ABS  
**Result:** Adopted with solid majority

### 2.3 Grzegorz Braun Immunity Waiver Pattern (TA-10-2026-0088)
Immunity waivers typically attract broad support across ideological lines:

| Group | Expected Position | Rationale |
|-------|------------------|-----------|
| EPP | FOR | Strong institutional position against antisemitism |
| S&D | FOR | Rights-based and rule-of-law framing |
| Renew | FOR | Liberalism and anti-extremism |
| Greens/EFA | FOR | Strong position on discrimination/rights |
| The Left | FOR | Antifascist tradition |
| ECR | MIXED | Braun is ECR-adjacent; some loyalty conflict |
| PfE | AGAINST/ABSTAIN | Protecting far-right figures from prosecution |

**Estimated outcome:** ~510 FOR, ~80 AGAINST, ~40 ABS  
**Result:** Adopted by absolute majority (required under Rule 9)

## 3. April 27, 2026 Voting Session

**Session attendance:** Not yet available (API: 0)  
**Votes conducted:** 2 (document IDs: DEC-191134, DEC-191135)  
**Vote titles/results:** Not yet published (standard API lag for same-day/day-after data)

Based on the nature of the document IDs (REPORT type), these were likely committee report adoptions — probably on non-controversial legislative business or procedural/institutional items.

## 4. Longitudinal Session Attendance Analysis (2026)

| Session | Date | Location | Attendance | Context |
|---------|------|----------|-----------|---------|
| Jan 19–22 | 2026-01-19 | Strasbourg | 620–671 | High – opening session of 2026 |
| Jan 27 | 2026-01-27 | Brussels | 431 | Mini-plenary |
| Feb 9–12 | 2026-02-09 | Strasbourg | 604–655 | Regular session |
| Feb 24 | 2026-02-24 | Brussels | 553 | Mini-plenary |
| Mar 9–12 | 2026-03-09 | Strasbourg | 575–650 | Regular |
| Mar 25–26 | 2026-03-25 | Brussels | 561–627 | Mini-plenary (key votes) |
| Apr 27–30 | 2026-04-27 | Strasbourg | TBD | Current session |

**Pattern:** Mini-plenaries (Brussels) show lower average attendance (490–630) than Strasbourg sessions (600–670), consistent with structural patterns across EP terms. The March 25–26 mini-plenary saw unusually high attendance (627) for Brussels, reflecting the political significance of the tariff and SRMR3 votes.

## 5. Voting Data Freshness
**Status:** 🟡 DELAYED  
Roll-call voting data for March–April 2026 is not yet published by the EP. The data above is reconstructed from structural group analysis, attendance records, and adopted text confirmations. Actual roll-call breakdowns will be available approximately 4–6 weeks post-session.

**Fallback analysis:** EP Open Data Portal `/api/v2/decision` — no records available for April 2026 at time of analysis.

---
*Sources: EP Open Data Portal (plenary sessions, adopted texts, MEP records) | Analysis: 2026-04-28*
