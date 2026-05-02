<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🗳️ Electoral-Cycle Methodology</h1>

<p align="center">
  <strong>📊 Dual-Track Lens for the Election-Cycle Horizon — EP Term Retrospective + EPnext Forecast</strong><br>
  <em>🎯 Mandate-Fulfilment · Seat Projections · Coalition Viability · Spitzenkandidaten Arithmetic · National Spillover</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2026--05--01-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Classification-Public-green?style=for-the-badge" alt="Classification"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2026-05-01 (UTC)
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2026-08-01
**🏢 Owner:** Hack23 AB (Org.nr 5595347807) | **🏷️ Classification:** Public

---

## 🔄 Tradecraft Anchors

| Element | Value | Reference |
|---------|-------|-----------|
| **F3EAD Stage** | **ANALYZE** — electoral-cycle lens cross-cuts retrospective and prospective analysis | Domain extension of [`electoral-domain-methodology.md`](electoral-domain-methodology.md) |
| **PIRs Served** | Mandate fulfilment, seat trajectories, coalition viability, Spitzenkandidaten arithmetic, national-election spillover | See [`political-style-guide.md` §PIR/EEI](political-style-guide.md#-priority-intelligence-requirements-pir--essential-elements-of-information-eei) |
| **Admiralty Floor** | EP results: A1; Eurobarometer: A2; National election results: A1; National polls: B2; Exit polls: C2 | See [`political-style-guide.md` §Admiralty](political-style-guide.md#-admiralty-source-reliability-code-nato-stanag-2022) |
| **WEP Requirement** | Every seat-projection band tagged with WEP at 6/12/24/36-month horizons (see [`forward-projection-methodology.md` §3](forward-projection-methodology.md#3-wep-decay-table)) | See [`political-style-guide.md` §WEP + ODNI](political-style-guide.md#-words-of-estimative-probability-wep--odni-confidence-overlay) |
| **ICD 203 Gate** | Standard 3 (judgements vs assumptions), 4 (alternative analysis — at least 2 contrasting electoral scenarios), 7 (explain change vs prior baseline) | See [`political-style-guide.md` §ICD 203](political-style-guide.md#-icd-203-analytic-tradecraft-standards-mapping) |
| **SAT(s)** | Reference-Class Forecasting, Devil's Advocate, Outside-In Thinking, Indicators & Warnings, Pre-Mortem, Coalition Mathematics | See [`political-style-guide.md` §SATs](political-style-guide.md#-structured-analytic-techniques-sats-catalog) |

---

## 🎯 Purpose

Extend [`electoral-domain-methodology.md`](electoral-domain-methodology.md) with a **dual-track** protocol that the `election-cycle` and `term-outlook` workflows apply during their analysis stage. Where Family D treats the electoral lens as an extended layer, this methodology promotes it to the **primary** lens of the article.

The protocol is **dual-track**:

- **Track A — Term Retrospective** (e.g. EP10 outturn): vote-share delta vs prior baseline, mandate-fulfilment scorecard, defection-flow map.
- **Track B — Term Forecast** (e.g. EP11): seat projections per group at 6/12/24/36-month horizons, coalition viability matrix, Spitzenkandidaten arithmetic, treaty-revision feasibility.

Both tracks are produced in a single run; there is no split-PR layout (election-cycle and term-outlook always emit one PR per horizon).

---

## 1. EP-Term Anchors (canonical constants)

| Term | Start | End (electoral) | Notes |
|---|---|---|---|
| **EP9** | 2 Jul 2019 | 1 Jul 2024 | Reference baseline for EP10 retrospective |
| **EP10** | 16 Jul 2024 | ~end of Jun 2029 | Current term — primary scope of `term-outlook` and `election-cycle` until 2029 |
| **EP11** | ~Jul 2029 | ~Jun 2034 | Forecast scope of post-2029 `election-cycle` runs |

The election week is **the second Sunday of June** in the election year (Council Decision (EU) 2018/767 set the June 2024 window; subsequent dates follow the same statutory rule). `src/aggregator/article-metadata.ts` derives these dates via `deriveTermLabel()` and `deriveElectionCycleLabel()`.

---

## 2. Track A — Term Retrospective (`mandate-fulfilment-scorecard.md`)

### 2.1 Vote-share delta

For each major group, report:

| Group | EP-prior vote share | EP-current vote share | Δ (pts) | National-spillover note |
|---|---|---|---|---|
| EPP | … | … | ±N | Top-3 driver national elections |
| S&D | … | … | ±N | … |
| Renew | … | … | ±N | … |
| Greens/EFA | … | … | ±N | … |
| ECR | … | … | ±N | … |
| ID / PfE | … | … | ±N | … |
| The Left | … | … | ±N | … |
| Non-attached | … | … | ±N | … |

Source vote-share data from the EP results portal (Admiralty A1).

### 2.2 Mandate-fulfilment scorecard

For each group's headline 2024-campaign pledges, trace **pledge → adopted act**:

| Pledge | Status | Acts cited | Throughput delay (months) | Score |
|---|---|---|---|---|
| Climate package strengthen | ✅ delivered / 🟡 partial / ❌ failed | … | … | A–F |

Aggregate to a single A–F group score and a parliamentary-balance score.

### 2.3 Defection-flow map

Mermaid `flowchart LR` showing inter-group MEP migration during the term, with edge thickness proportional to defection volume. Source: `src/mcp/ep-mcp-client.ts:getMepDelta()` cross-run history.

---

## 3. Track B — Term Forecast (`seat-projection.md`, `term-arc.md`)

### 3.1 Seat-projection bands

For each major group produce **6/12/24/36-month** seat-band projections:

| Group | Current | T+6m | T+12m | T+24m | T+36m | T+EP-election (P50) |
|---|---|---|---|---|---|---|
| EPP | 188 | 175–195 (Likely) | 170–198 (Likely) | 165–202 (About even) | 160–205 (About even) | 175 |
| … | … | … | … | … | … | … |

Each band carries an explicit WEP label per [`forward-projection-methodology.md` §3](forward-projection-methodology.md#3-wep-decay-table). Bands widen at longer horizons; the longest horizon defaults to "About even" unless reference-class evidence supports tighter bands.

### 3.2 Coalition viability matrix

Cross-tab of plausible majorities (≥ 361 seats in EP10, ≥ 1/2+1 of seats in EP11):

| Coalition | Seats | Viability | Stress points |
|---|---|---|---|
| Grand (EPP+S&D+Renew) | … | 🟢/🟡/🔴 | … |
| Centre-right (EPP+ECR) | … | 🟢/🟡/🔴 | … |
| Climate (S&D+Renew+Greens+Left) | … | 🟢/🟡/🔴 | … |
| Conservative-populist (ECR+PfE) | … | 🟢/🟡/🔴 | … |

### 3.3 Spitzenkandidaten arithmetic

For each plausible Spitzenkandidaten, document:

- Group vote share threshold to claim Commission Presidency
- National-election dependencies (top-3 driver elections)
- Cross-group endorsement viability (≥ 1/2 group endorsements required)
- Black-swan blockers (treaty challenge, qualified-majority shifts)

### 3.4 Treaty-revision feasibility

A short bullet block on whether the projected EP composition + Council majority crosses the threshold for an IGC convocation under Art. 48 TEU.

---

## 4. National-Election Spillover Model

For each upcoming national election within the horizon, document:

| Country | Date | Polling EP-group composition | Likely shift | EP-group impact |
|---|---|---|---|---|
| DE | … | EPP=N, S&D=N, … | EPP +M, AfD/PfE +M | EPP gain via German list |

The model multiplies national projected vote share by the historic EP-list translation coefficient (per [`historical-baseline.md`](../templates/historical-baseline.md) §National translation factors).

---

## 5. Auto-Trigger Thresholds

The `news-election-cycle.md` workflow auto-runs when **any** of the following holds (computed from `src/mcp/ep-mcp-client.ts:getElectionCalendarContext()`):

| Threshold | Trigger | Stage budget bump |
|---|---|---|
| **T-180** | 180 days before election week | None — standard |
| **T-90** | 90 days before election week | +2 minutes to Stage B |
| **T-30** | 30 days before election week | Highest priority — runs daily |

Outside these windows the workflow runs only on the annual `0 8 1 12 *` cron and on `workflow_dispatch`.

---

## 6. Cross-Links to Existing Methodology

- **Voter-segmentation** layer is reused verbatim from [`electoral-domain-methodology.md` §Voter Segmentation](electoral-domain-methodology.md).
- **Coalition mathematics** is computed by [`coalition-mathematics.md`](../templates/coalition-mathematics.md) with the term-progress index (months elapsed / months remaining) added in §3.2 of this methodology.
- **Historical parallels** — every electoral-cycle run consumes [`historical-parallels.md`](../templates/historical-parallels.md) reference-class entries for the EP-prior term and inter-presidency rotations.

---

## 7. Outputs

| Artifact | Track | Required by |
|---|---|---|
| `intelligence/term-arc.md` | A + B | `term-outlook`, `election-cycle`, `year-in-review` |
| `intelligence/seat-projection.md` | B | `term-outlook`, `election-cycle`, optionally `year-in-review` |
| `intelligence/mandate-fulfilment-scorecard.md` | A | `year-in-review`, `election-cycle` |
| `intelligence/presidency-trio-context.md` | both | every horizon ≥ quarter |
| `intelligence/commission-wp-alignment.md` | both | every horizon ≥ quarter |

---

## 8. Quality Gates (Stage C, electoral overlay)

| Gate | Threshold | Pass-2 trigger |
|---|---|---|
| Vote-share delta table populated | All major groups present | Re-author from EP results portal |
| Mandate scorecard pledge → act | ≥ 5 pledges per group | Trace additional pledges to acts |
| Seat-projection bands at 4 horizons | All four populated with WEP | Re-derive from reference class |
| Coalition viability matrix | ≥ 4 coalitions classified | Add adjacent / wildcard coalitions |
| Spitzenkandidaten arithmetic | ≥ 2 candidates documented | Add devil's-advocate alternative |
| National spillover entries | ≥ 3 driver elections | Extend lookup window |

---

## 9. Cross-References

- [`electoral-domain-methodology.md`](electoral-domain-methodology.md) — base electoral lens (extended here for dual-track).
- [`forward-projection-methodology.md`](forward-projection-methodology.md) — horizon-conditional WEP, structural-break, reference-class protocol.
- [`strategic-extensions-methodology.md`](strategic-extensions-methodology.md) — long-horizon scenario appendix.
- [`historical-baseline.md`](../templates/historical-baseline.md) — reference-class store.

---

**📅 Document History**

| Version | Date | Summary |
|---|---|---|
| 1.0 | 2026-05-01 | Initial release — dual-track lens, EP-term anchors, seat-projection bands, coalition viability matrix, Spitzenkandidaten arithmetic, national-spillover model, T-180/T-90/T-30 auto-trigger thresholds. |
