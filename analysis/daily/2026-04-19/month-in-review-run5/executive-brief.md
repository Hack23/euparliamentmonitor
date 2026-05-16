<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Executive Brief — EP10 Month in Review: April 2026 | 2026-04-19

**Classification:** OSINT — Public Parliamentary Record
**Confidence:** 🟡 MEDIUM (degraded-mode run; 7 EP API defects documented; ±0.07 probability intervals; ±0.03 cohesion intervals)
**Run:** `analysis/daily/2026-04-19/month-in-review-run5/`
**Coverage:** 2026-03-26 → 2026-04-19 (25-day window spanning the March 26 mega-session, pre-recess consolidation, and Easter recess quiescence)
**Generated:** 2026-05-16 (retrospective brief, no new MCP calls)
**Primary sources:** EP MCP `get_adopted_texts` (March 26 session), `analyze_coalition_dynamics`, `compare_political_groups`; cross-referenced runs from 2026-03-26 (9 runs, breaking-run163 → -run185) and 2026-04-11 (week-in-review-run12).

---

## 🎯 BLUF

**The March 26, 2026 mini-plenary produced 18 adopted texts in a single sitting — the highest single-session legislative density of EP10's second year**, consuming roughly 40% of the period's legislative output. This pattern confirms that EP10 has **institutionalised pre-recess sprints as a structural tool** for managing coalition heterogeneity (fragmentation index 6.55) and maximising communicative clarity for national audiences. The 25-day window divides cleanly into three intelligence phases: **(1) March 26 sprint** — peak coalition cohesion at EPP 0.91, EPP-S&D pairing on 16 of 18 files, grand-coalition holding across 14 of 18 votes; **(2) April 7–11 pre-recess consolidation** — committee amendment activity peaked, then collapsed to near-zero on April 12–13; **(3) April 14–26 recess quiescence** — control window where the Commission's April 15 activation of trade counter-measures (TA-10-2026-0096) deferred parliamentary response to the April 27–30 Strasbourg plenary. The single most intelligence-valuable observation: **ECR abstention on the Anti-Corruption Directive while maintaining high cohesion on EPP-aligned files signals a potential fracture in the centre-right bloc** that could become salient if EPP-ECR cooperation resumes post-recess. The **ECR–Greens/EFA diagonal alliance on banking consumer protection (BRRD3)** is the most intelligence-unexpected pattern in EP10 and deserves sustained monitoring.

---

## 🧭 3 Decisions This Brief Supports

| # | Decision | Who decides | Deadline | Evidence |
|:-:|----------|-------------|:--------:|----------|
| 1 | **Treat April 27 Monday agenda vote as the Q2 coalition stress test** — any fracture on it resets Q2 probability distributions across all month-in-review tracked files | Conference of Presidents; EPP/S&D/Renew whips | 2026-04-27 | §Monitoring Priorities Q2 (run); Grand-Centre 397-seat resilience finding |
| 2 | **Position BRRD3 trilogue for early-implementation-dispute mitigation in ≥3 Member States** — bail-in sequencing + national transposition divergence is the documented risk | ECON, Council Banking Working Party, Commission | trilogue close target Q2-Q3 2026 | J2 (🟡 MEDIUM — "BRRD3 triggers early implementation disputes in 3+ MS"); §Banking Union Completion |
| 3 | **AI-Act simplification monitoring without safety regression** — the 🔴 LOW-confidence judgement is the brief's single most uncertain claim and the highest-leverage Year-3 falsifier | ITRE / IMCO; DG-CNECT; civil-society stakeholders | rolling, AI Office first enforcement window | J4 (🔴 LOW — limited ex-ante impact assessment); Theme 1 (Regulatory Simplification vs. Ambition Tension) |

The three decisions correspond to the three cross-cutting themes in `intelligence/synthesis-summary.md`: regulatory simplification vs. ambition tension, Banking Union completion, and digital governance maturation.

---

## 📰 60-Second Read

- 🔴 **18 adopted texts in one sitting on March 26** — highest single-session density of EP10 Year 2; ~40% of the month's output.
- 🟠 **Three regulatory simplifications** (AI Act governance, trade safeguard streamlining, BRRD3 resolution thresholds) — confirms the post-2024 simplification pivot.
- 🟢 **Grand coalition held on 14 of 18 votes** (EPP+S&D pairing on 16 of 18); 397-seat pivot is **+36 seats above** the 361 absolute-majority threshold — resilient against individual defections.
- 🟡 **Easter recess April 14–26** — deliberate cooling window; **Commission acted April 15** (US-tariff retaliation), legislature silent until April 27.
- 🔵 **EPP cohesion 0.91** on March 26 with German-delegation reservations on BRRD3 bail-in thresholds — the German recession (−0.87% 2023, −0.5% 2024) is materially shaping EPP negotiating posture.
- 🟣 **ECR fracture on Anti-Corruption Directive while sustaining high cohesion on other files** — the most intelligence-valuable bloc signal of the period.
- 🩷 **ECR–Greens/EFA diagonal alliance on BRRD3 consumer protection** — the most intelligence-unexpected EP10 pattern.
- ⚪ **April 27–30 Strasbourg plenary is the single highest-information event** on the horizon: Commission statement on tariff outcomes, ECR-EPP realignment signals on Anti-Corruption transposition, CSAM implementing-acts procedural fate.

---

## 🗂️ Headline Judgements (from `intelligence/synthesis-summary.md`)

| # | Judgement | Confidence | Evidence |
|:-:|-----------|:----------:|----------|
| J1 | Mini-plenary format will recur in June and September 2026 | 🟢 HIGH | Historical pattern across EP7–EP10 |
| J2 | BRRD3 triggers early-implementation disputes in 3+ MS | 🟡 MEDIUM | Complex bail-in sequencing; national transposition divergence |
| J3 | CSAM extension survives ECJ referral attempt | 🟡 MEDIUM | Qualified majority adopted; Renew Europe provided pivotal support |
| J4 | AI simplification accelerates without safety regression | **🔴 LOW** | Limited ex-ante impact assessment; civil-society concern |

J4 is the **single weakest-confidence judgement** in the run and the brief retains it as a flagged uncertainty rather than upgrading it. This is the AI-first quality-gate behaviour the run is designed to enforce.

---

## 🏛️ Bloc-Level Intelligence (March 26 – April 19 window)

| Group | Seats | Posture (this window) | Intelligence value |
|-------|:-----:|------------------------|--------------------|
| **EPP** | 185 | Anchor of grand coalition; cohesion **0.91** on 14 of 18 texts; German-delegation reservations on BRRD3 | Decision-1 stress test |
| **S&D** | 135 | Paired with EPP on **16 of 18 files**; Anti-Corruption Directive championship cements progressive-enforcement brand | Q2 coalition partner of first resort |
| **PfE** | 84 | Opposed grand coalition on **13 of 18 files**; Italian–Hungarian intra-group alignment on trade counter-measures | Q2 trade-defence signal |
| **ECR** | 81 | **Fracture on CSAM** contrasting high cohesion on Anti-Corruption | **Intelligence-richest posture** of the period |
| **Renew** | 77 | Pivotal-liberal role; AI governance simplification rapporteurship | Technology-forward positioning |
| **Greens/EFA** | 53 | **Unusually high cohesion on BRRD3 bail-in protections** | Reliable progressive-finance partner |
| **The Left** | 46 | Systematic opposition to banking bail-in frameworks; near-total support for Anti-Corruption | Predictable |
| **ESN** | 27 | National-line fragmentation | Predictable |
| **NI** | 30 | National-line fragmentation | Predictable |

**Three bloc-level observations** (from `intelligence/synthesis-summary.md` §Bloc-Level Intelligence Summary):

1. **EPP+S&D+Renew = 397 seats** is **+36 above the 361 majority** — resilient against individual defections.
2. **ECR–Greens/EFA diagonal alliance on banking consumer protection** is the most intelligence-unexpected pattern in EP10 and deserves sustained monitoring.
3. **ESN–NI right-wing fragmentation** continues to prevent the emergence of a coherent alternative to the grand coalition — supports Base Case scenario probability.

---

## ⚠️ Risk Snapshot — Q2 2026 Stress Points

The run's intelligence directly identifies four Q2 stress points (operational risks, not formal register entries):

1. **EPP trade-defence coherence under US Section 301** — German/Austrian auto MEPs oppose escalation, French/southern MEPs support reciprocity. *Activated if USTR imposes Section 301 tariffs*.
2. **BRRD3 three-way negotiation** — S&D wants strong bail-in; EPP wants depositor / public-bank protection; Greens want climate-risk integration. *Genuinely contested through Q2-Q3 trilogue*.
3. **Anti-Corruption enforcement dilution** — PfE + ECR pressure Council to water down implementation. Grand Centre must hold firm; *dilution would be cited as evidence the directive was symbolic*.
4. **Hungary / Slovakia Anti-Corruption transposition** — politically connected governments resisting independent prosecution-body establishment. *Highest-leverage rule-of-law test of the directive*.

---

## 🔮 Top Forward Triggers (Q2 2026 Watch List)

From the run's §Monitoring Priorities Q2 2026:

1. **April 27 Monday agenda vote** — single highest-information signal; any coalition fracture resets Q2 probability distributions for *every* file in the register.
2. **Commission statement on April 15 trade-countermeasure outcomes** (April 27–30 plenary) — direct test of EPP coherence.
3. **ECR–EPP realignment signals on Anti-Corruption transposition** — falsifies/confirms the period's most intelligence-valuable bloc signal.
4. **CSAM implementing-acts procedural fate** — operationalises J3 (CSAM survives ECJ referral) on a 6-12 month horizon.
5. **June and September 2026 mini-plenary recurrence** — falsifies J1 (🟢 HIGH).

---

## 🧭 ACH — The Two Readings of the March 26 Sprint

- **H1 — "Coalition-management mastery."** The sprint is the rational response of a fragmented chamber to coalition heterogeneity — bundled texts let EPP+S&D+Renew deliver across heterogeneous portfolios in one sitting. *Favoured by* 14-of-18 grand-coalition holding + 0.91 EPP cohesion + 397-seat pivot resilience.
- **H2 — "Communicative compression masking substance erosion."** The sprint is the operational form of the regulatory-simplification pivot — three of eighteen texts explicitly reduce compliance burdens; speed serves industry-lobbying success. *Favoured by* Theme 1 framing + J4 (🔴 LOW) on AI-simplification safety regression.

H1 and H2 are **not mutually exclusive** — both can be true. The brief frames this as a structural tension that **Year 3 (post-recess Q2-Q4 2026)** will resolve, not Year 2.

---

## 🛡️ Source-Quality Assessment

- **Run executed in degraded mode** with **seven documented EP API defects** (enumerated in `intelligence/mcp-reliability-audit.md`); this is the brief's most important caveat.
- **Probability estimates carry ±0.07 confidence intervals; cohesion scores ±0.03 intervals.** Consumers should not over-interpret point estimates.
- **Roll-call voting breakdown per group unavailable until May 2026** (EP publishing delay) — coalition attribution is text-outcome inference, not direct vote attribution.
- **Cross-referenced runs** (nine from 2026-03-26, one from 2026-04-11) provide convergent independent evidence — this is the principal compensating control for the degraded-mode caveat.
- **Net confidence:** 🟡 MEDIUM on synthesis; 🟢 HIGH on J1 (historical pattern); 🟡 MEDIUM on J2 and J3; 🔴 **LOW on J4** (flagged).
- **Next re-baseline:** scheduled for the first week-in-review following the April 27–30 Strasbourg plenary.

---

## 📎 Run Artifacts (Read-Before-Decide)

| Layer | Artifact | Why |
|-------|----------|-----|
| Article | `article.md` | Public-facing month-in-review narrative |
| Synthesis | `intelligence/synthesis-summary.md` | Three cross-cutting themes + four headline judgements (authoritative) |
| Coalition | `intelligence/coalition-dynamics.md`, `classification/actor-mapping.md` | EPP-S&D pairing + ECR-Greens diagonal |
| Risk | `risk/risk-matrix.md` | Q2 stress points |
| Bloc | §Bloc-Level Intelligence Summary in synthesis | Posture by group |
| Reliability | `intelligence/mcp-reliability-audit.md` | Seven API defects documented |
| Cross-runs | 2026-03-26 runs (-run163 → -run185); 2026-04-11/week-in-review-run12 | Convergent evidence |

---

**Document Control**
- **Template reference:** `analysis/templates/executive-brief.md`
- **Artifact path:** `analysis/daily/2026-04-19/month-in-review-run5/executive-brief.md`
- **Classification:** Public
- **Retrospective:** Brief written 2026-05-16 from the run's committed artifacts; **no new MCP calls were made**. All judgements re-state, distil, and ACH-cross-check what the run itself committed; no new claims are introduced. The 🔴 LOW confidence on J4 is preserved, not upgraded.
