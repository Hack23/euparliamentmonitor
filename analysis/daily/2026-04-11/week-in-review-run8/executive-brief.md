<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Executive Brief — EP Week in Review: April 4–11, 2026 (Easter Recess Week 3) | 2026-04-11

**Classification:** OSINT — Public Parliamentary Record
**Confidence:** 🟡 MEDIUM (no live feed data; risk-trajectory inferred from precomputed stats + 14 prior runs; **0 / 13 EP API feeds operational by April 10**)
**Run:** `analysis/daily/2026-04-11/week-in-review-run8/`
**Coverage:** 2026-04-04 → 2026-04-11 (Recess Week 3, Days 9–16 of an 18-day Easter recess)
**Generated:** 2026-05-16 (retrospective brief, no new MCP calls)
**Primary sources:** EP MCP precomputed stats (140 K chars), coalition-dynamics (11.6 K chars); 14 prior workflow analysis runs.

---

## 🎯 BLUF

**Parliament was in recess all week — yet the composite political risk score rose 31% in three days (10.10 → 13.17 on April 9 → 11).** This counter-intuitive escalation during legislative silence is the brief's most important single finding. It is driven by **three converging external pressures the legislature cannot respond to until April 14 committee restart**: (1) **US tariff crisis approaching April 15 deadline** (Geopolitical Standing Risk **20/25 CRITICAL**); (2) **Tariff-crisis risk 16/25 CRITICAL** — INTA emergency measures needed on Day 1 of committee restart; (3) **Legislative-backlog risk 13/25 HIGH** — 18-day recess compressed into 4-day committee week. The EP API failure mode is itself an intelligence signal: **all 13 endpoints progressively degraded reaching total unavailability by April 10**, which constrains operational monitoring at exactly the wrong moment. The week's structural finding: **the grand coalition (EPP+S&D+Renew = 396 seats, 55%) has a −5.5% surplus-deficit** — it falls short of the working majority needed for consistent governance, meaning **EPP must build ad-hoc majorities per dossier**. The **Renew-ECR cohesion at 0.95 on competitiveness/trade** is the most consequential new alignment of the recess period — *untested in post-recess votes* but if it holds, it creates a 340-seat EPP+Renew+ECR competitiveness coalition that **approaches but does not reach majority (361 needed)**, defining the post-recess coalition geometry.

---

## 🧭 3 Decisions This Brief Supports

| # | Decision | Who decides | Deadline | Evidence |
|:-:|----------|-------------|:--------:|----------|
| 1 | **April 14 committee restart prioritisation** — INTA must front-load tariff response; ECON-INTA dual bottleneck means a third committee cannot also be on critical path | Conference of Committee Chairs | **April 14 (T-3 at run time)** | §Risk Trajectory Acceleration; legislative-backlog 13/25 HIGH |
| 2 | **EP API contingency plan** — 0 / 13 feeds operational; the operational picture for committee restart depends on precomputed stats + prior-run cross-reference rather than live feeds | EP secretariat; data-pipeline team | rolling | §Parliament Status; companion `existing/api-outage-diagnostic.md` |
| 3 | **Read Renew-ECR 0.95 cohesion signal as the post-recess coalition test** — if it holds in the first post-recess trade vote, the EP10 coalition geometry pivots from grand-coalition default to ad-hoc-pivot default | EPP/Renew/ECR group leaderships | first post-recess trade vote | §Three-Pole Coalition Structure |

---

## 📰 60-Second Read

- 🔴 **Composite risk +31% in 3 days** (10.10 → 13.17) during a *legislative silence* week — the signal is in the trajectory, not the absolute level.
- 🟠 **Geopolitical standing risk 20/25 CRITICAL** (US tariff April 15 deadline); tariff-crisis risk 16/25 CRITICAL.
- 🟢 **Record legislative pace YTD:** +46.2% YoY (114 acts annualised vs. 78 in 2025).
- 🟡 **Grand coalition feasibility:** **NOT VIABLE** structurally — EPP+S&D = 44.5% (need 50.1%); **EPP+S&D+Renew = 55% but with −5.5% surplus-deficit**.
- 🔵 **Fragmentation index 6.59** — highest in EP history; minimum 3-group coalition required.
- 🟣 **Renew-ECR cohesion 0.95** on competitiveness/trade — most consequential alignment of the recess period.
- 🩷 **Right-bloc structural advantage:** EPP+ECR+PfE = **348 seats (48.3%)** — dominant on defence, deregulation, migration; 13 short of majority.
- ⚪ **EP API:** 0 / 13 feeds operational by April 10 — INTERNAL_ERROR across all endpoints; precomputed stats are the only signal source.

---

## 🏛️ Three-Pole Coalition Crystallisation

| Pole | Composition | Seats | Share | Where it wins |
|------|-------------|:-----:|:-----:|---------------|
| **Conservative-Right** | EPP 185 + ECR 79 + PfE 84 | 348 | 48.3% | Defence, deregulation, migration |
| **Centre-Liberal Pivot** | Renew 76 | 76 | 10.6% | **Kingmaker on every flagship vote** |
| **Progressive-Left** | S&D 135 + Greens/EFA 53 + GUE/NGL 46 | 234 | 32.5% | Green Deal, social policy, civil liberties |

The structural finding is that **Renew is the every-vote pivot** — neither bloc reaches majority without it, and the recess-period 0.95 cohesion with ECR on competitiveness signals which way Renew is being courted.

---

## ⚠️ Risk Indicators Summary (from run dashboard)

| Indicator | Value | Trend | Confidence |
|-----------|-------|:-----:|:----------:|
| Composite Risk | **13.17/25 (HIGH)** | ↑ +31% in 3 days | 🟡 |
| EP API Availability | 0 / 13 feeds | Degraded | 🟢 (confirmed) |
| Legislative Output Pace | +46.2% YoY | Record | 🟢 |
| Fragmentation Index | 6.59 | Stable | 🟢 |
| Grand-Coalition Feasibility | NOT VIABLE | Structural | 🟢 |
| Renew-ECR Cohesion | 0.95 | Stable high | 🟡 (untested post-recess) |
| Right-Bloc Dominance | 52.3% seats | Stable | 🟢 |
| **Tariff Crisis** | **16/25 CRITICAL** | Approaching deadline | 🟢 |

---

## 🔮 Top Forward Triggers (next 7 days)

1. **April 14 (T-3 from run) — committee restart.** INTA Day-1 emergency tariff session is the binary trigger for whether the parliamentary response is timely or symbolic.
2. **April 15 — US tariff implementation deadline.** Activates TA-10-2026-0096 counter-measures; ECR vote behaviour will be the first post-recess fracture test.
3. **First post-recess vote with Renew on a trade file** — falsifier for the Renew-ECR 0.95 cohesion signal.
4. **April 27–30 Strasbourg plenary** — Q2 agenda-setting; companion month-ahead briefs cover this in detail.

---

## 🧭 ACH — The "Quiet but Loaded" Reading

- **H1 — "Routine recess + external noise."** Risk trajectory is artefact of converging external events the legislature did not cause; April 14 committee restart absorbs the load on schedule. *Favoured by* record YTD pace, structural stability score (84/100 from companion runs).
- **H2 — "Pre-fracture loading."** Renew-ECR 0.95 cohesion is the precursor to a competitiveness-coalition pivot; the grand coalition's −5.5% surplus-deficit is the underlying weakness, not the external pressures. *Favoured by* prior-run risk trajectory + fragmentation 6.59 + structural NOT-VIABLE finding on grand coalition.

The brief reads H1 as the planning baseline and H2 as the operationally relevant stress case — *the first post-recess trade vote* is the falsifier between them.

---

## 🛡️ Source-Quality Assessment

- **No live feed data this week — 0 / 13 EP API feeds operational by April 10.** Every indicator is precomputed-stat or prior-run-derived; this is the brief's most important caveat.
- **MCP server health report** (confirmed in run) provides 🟢 HIGH confidence on the API outage itself.
- **Risk trajectory** uses 7 prior daily runs (Runs 3, 4, 5, 6, 12, 157, 158); convergence across independent runs is the principal compensating evidence.
- **Net confidence:** 🟡 MEDIUM on synthesis; 🟢 HIGH on tariff risk (external publication record); 🟡 MEDIUM on Renew-ECR alignment (cohesion data is structural, behaviour untested post-recess).

---

## 📎 Run Artifacts (Read-Before-Decide)

| Layer | Artifact | Why |
|-------|----------|-----|
| Article | `article.md` | Public-facing recess-week narrative |
| Synthesis | `existing/synthesis-summary.md` | 8 indicators + 3-pole structure (authoritative) |
| Significance | `classification/significance-scoring.md` | Event inventory (recess, tariff, Renew-ECR) |
| Risk | `risk-scoring/risk-assessment.md` | Composite 13.17/25, 7-source trajectory |
| Threat | `threat-assessment/threat-analysis.md` | External-pressure threat surface |
| Stakeholders | `existing/stakeholder-impact.md` | INTA, EU industry, EPP business wing |
| API outage | `existing/api-outage-diagnostic.md` | 0 / 13 feeds — confidence floor |
| SWOT | `existing/swot-analysis.md` | Strengths/weaknesses through recess |
| Companion | `analysis/daily/2026-04-13/month-ahead-run4/` | Forward-looking pair of this retrospective |

---

**Document Control**
- **Template reference:** `analysis/templates/executive-brief.md`
- **Artifact path:** `analysis/daily/2026-04-11/week-in-review-run8/executive-brief.md`
- **Classification:** Public
- **Retrospective:** Brief written 2026-05-16 from the run's committed artifacts; **no new MCP calls were made**. The 🟡 MEDIUM confidence on synthesis is preserved, not upgraded, because the underlying API outage in the run period is a permanent constraint on that week's data quality.
