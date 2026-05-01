<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

<p align="center">
  <img src="https://hack23.com/icon-192.png" alt="Hack23 Logo" width="192" height="192">
</p>

<h1 align="center">🔭 Forward-Projection Methodology</h1>

<p align="center">
  <strong>📈 Multi-Horizon Forecasting Protocol — 7d / 30d / 90d / 12m / term-end / EP-election</strong><br>
  <em>🎯 WEP Decay · Structural-Break Detection · Reference-Class Forecasting · Outside-View Enforcement</em>
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
| **F3EAD Stage** | **ANALYZE** — forward projection synthesises analysis into horizon-conditional forecasts | Cross-cutting protocol used by every prospective horizon ≥ quarter |
| **PIRs Served** | Forward-looking PIRs: pipeline transit, coalition trajectory, presidency-cycle hand-overs, seat dynamics | See [`political-style-guide.md` §PIR/EEI](political-style-guide.md#-priority-intelligence-requirements-pir--essential-elements-of-information-eei) |
| **Admiralty Floor** | Procedural data: A1 (EP API); macro context: A2 (IMF/WB); polling: B2 | See [`political-style-guide.md` §Admiralty](political-style-guide.md#-admiralty-source-reliability-code-nato-stanag-2022) |
| **WEP Requirement** | Every probability claim carries WEP band + explicit horizon; bands tighten as horizon shortens (see §3) | See [`political-style-guide.md` §WEP + ODNI](political-style-guide.md#-words-of-estimative-probability-wep--odni-confidence-overlay) |
| **ICD 203 Gate** | Standard 3 (judgement vs assumption), 4 (alternative analysis — at least 6 scenarios for long-horizon), 5 (information sources), 7 (explain changes from prior run) | See [`political-style-guide.md` §ICD 203](political-style-guide.md#-icd-203-analytic-tradecraft-standards-mapping) |
| **SAT(s)** | Reference-Class Forecasting (Tetlock), Outside-In Thinking, Indicators & Warnings, Pre-Mortem, Morphological Analysis, Devil's Advocate | See [`political-style-guide.md` §SATs](political-style-guide.md#-structured-analytic-techniques-sats-catalog) |

---

## 🎯 Purpose

Replace ad-hoc "what's coming up" prose with a **horizon-conditional, evidence-anchored forecasting protocol**. Every prospective horizon ≥ 90 days produces a `forward-projection.md` artifact whose probability claims are calibrated against:

1. **Reference-class base-rates** (Tetlock outside view) drawn from `historical-baseline.md`.
2. **WEP decay tables** (§3) — bands tighten as the horizon shrinks.
3. **Structural-break tripwires** (§4) — explicit conditions that branch the projection into a "regime change" scenario.
4. **Pipeline transit-time priors** for legislative procedures (§5) — Monte-Carlo P10/P50/P90 transit times consumed by `legislative-pipeline-forecast.md`.

This methodology is the data-input contract for the eight new long-horizon and electoral artifacts catalogued in [`artifact-catalog.md`](artifact-catalog.md).

---

## 1. Horizon Lattice

| Horizon | Window | Anchor | Article types |
|---|---|---|---|
| **T+7d** | next week | run date | `breaking`, `week-ahead` |
| **T+30d** | next month | run date | `month-ahead` |
| **T+90d** | next quarter (≈ 3 plenary sessions) | run date | `quarter-ahead` |
| **T+12m** | next year | run date | `year-ahead` |
| **T+term-end** | run date → next EP-election week | next-election | `term-outlook` |
| **T+EP-election ±6m** | electoral window | next-election | `election-cycle` |

Every horizon shares the same artifact schema; what changes is (a) the WEP decay band (§3), (b) the minimum scenario count (§4) and (c) the mandatory inclusion of `forward-projection.md`.

---

## 2. Reference-Class Forecasting (Tetlock Outside View)

Before producing any probability claim, list the **reference class** — the set of historical analogues from which a base rate is computed. Pull at least **6** such analogues from `historical-baseline.md`. Examples:

| Forecast subject | Reference class | Lookup |
|---|---|---|
| Trilogue completion within 90 days | Last 24 months of trilogues on comparable file types | `data/voting-records.json` + `data/procedures-feed.json` |
| Coalition cohesion drop > 10pts | Past 3 EP terms — count of comparable drops per quarter | `historical-baseline.md` §Coalition baselines |
| Spitzenkandidaten arithmetic flip | EP9, EP10, EP11 lead-candidate dynamics | `historical-baseline.md` §Electoral baselines |
| Presidency-Trio rupture | Last 5 Trios — count of unilateral handover changes | `presidency-trio-context.md` |

The reference-class table MUST appear in every `forward-projection.md`, with at least one row per primary forecast.

---

## 3. WEP Decay Table

Words-of-Estimative-Probability bands tighten as the forecast horizon shrinks. Use the band that corresponds to the horizon **and** the reference-class size; widen one band when the reference class has fewer than 6 analogues.

> **Canonical surface for authors.** This table is the single source of truth for horizon-conditional WEP floors across the EU Parliament Monitor platform. The article-style cross-reference lives in [`political-style-guide.md` §Confidence Labels Are Horizon-Conditional](political-style-guide.md#confidence-labels-are-horizon-conditional), which deliberately does **not** duplicate the numbers — any change to the bands below propagates everywhere via that link.

| Horizon | Floor band (probability range) | Notes |
|---|---|---|
| T+7d | **Almost certain** (95–99%) / **Highly likely** (85–95%) | Pipeline data is dense — narrow bands required |
| T+30d | **Highly likely** (85–95%) / **Likely** (60–85%) | Roll-call publication delay tolerated |
| T+90d | **Likely** (60–85%) / **About even** (40–60%) | Three plenary cycles — multiple Council Trios may overlap |
| T+12m | **About even** (40–60%) / **Unlikely** (15–40%) | Commission Work Programme cycle complete; one Trio handover |
| T+term-end | **Unlikely** (15–40%) / **Highly unlikely** (5–15%) | Two EP elections may bracket the horizon |
| T+EP-election ±6m | **Highly unlikely** (5–15%) / **Almost no chance** (1–5%) | Outcome conditioned on election; widen bands accordingly |

**Calibration check (Pass-2):** every `forward-projection.md` § 4 must contain at least one judgement at the horizon's floor band — if every band is "About even" the analyst has avoided commitment.

---

## 4. Structural-Break Detection

Branch the projection into a "regime-change" alternative scenario when **any** of the following is true:

| Tripwire | Threshold | Source |
|---|---|---|
| **Coalition-cohesion drop** | ≥ 10 pts in any major group over the analysis window | `coalition-dynamics.md` §Cohesion trends |
| **National-government changes** | ≥ 3 EU governments change ruling party within the horizon | `historical-baseline.md` + open-source national tickers |
| **Presidency-Trio rupture** | Unilateral handover change or programme suspension | `presidency-trio-context.md` |
| **Treaty-revision IGC announcement** | European Council announces an IGC | `external-documents` feed |
| **Article-7 / sanctions escalation** | Trigger or formal step taken against a Member State | `external-documents` feed + `parliamentary-questions` |
| **EP president vacancy / removal** | Resignation, censure, or mid-term replacement | `corporate-bodies-feed` |

When any tripwire fires, `scenario-forecast.md` MUST contain a dedicated **regime-change** branch with its own WEP band and reference class.

For long-horizon (≥ 12m) and electoral runs, **at least 6 scenarios** are required (mainline + 2 adjacent + at least 1 regime-change branch + 2 wildcards/black-swans).

---

## 5. Legislative-Pipeline Transit Priors

`legislative-pipeline-forecast.md` consumes a Monte-Carlo prior produced from the trailing 24 months of stage-transition timings (rapporteur → committee → plenary → trilogue → adoption).

For each active procedure produce:

- **P10/P50/P90 transit time** per remaining stage.
- **Probability of completion** within the horizon, expressed as a WEP band.
- **Critical-path bottleneck**: name the stage with the highest variance.

Planned implementation: a future aggregator component, `scripts/aggregator/pipeline-transit-model.js`, is intended to generate this prior in a later slicing-plan PR. Until that component lands, treat the Monte-Carlo prior as a methodological requirement and have the Stage B agent reason directly over the trailing 24-month stage-transition timings — not a currently-available Stage A/B dependency in this PR.

---

## 6. Carry-Forward & Forward-Statement Quality Gate

Every prospective run carries forward open forward statements from prior runs via the JSONL `forward-statements-registry`. With long horizons (≥ 12 months), the registry windows extend to **1825 days** (~5 years).

A carried forward statement that has expired (`now > horizon-end` of original prediction) MUST receive a `status` update in Stage B:

| Status | Trigger | Action |
|---|---|---|
| `resolved` | Prediction confirmed by EP data | Cite roll-call vote / adopted text / procedure event |
| `stale` | Horizon passed without resolution | Mark as withdrawn; do not re-emit |
| `extended` | Horizon passed; analyst extends with fresh evidence | New WEP band + reference-class refresh required |

Stage C raises a **🔴 RED** when the run carries > 2 unresolved expired statements without status updates.

---

## 7. Outputs

| Artifact | Owner | Required by |
|---|---|---|
| `intelligence/forward-projection.md` | This methodology | `quarter-ahead`, `year-ahead`, `term-outlook`, `election-cycle`, `quarter-in-review` (optional) |
| `intelligence/legislative-pipeline-forecast.md` | This methodology + transit priors | `quarter-ahead`, `year-ahead`, `quarter-in-review`, `year-in-review` |
| `intelligence/parliamentary-calendar-projection.md` | This methodology | `quarter-ahead`, `year-ahead`, `term-outlook` |
| `extended/forward-indicators.md` | Extended layer (per [`strategic-extensions-methodology.md`](strategic-extensions-methodology.md)) | `quarter-ahead+`, `term-outlook`, `election-cycle` |

---

## 8. Quality Gates (Stage C)

| Gate | Threshold | Pass-2 trigger |
|---|---|---|
| Reference-class table | ≥ 6 entries with explicit base-rate | Re-author with deeper historical lookup |
| WEP decay compliance | Bands match horizon (§3) | Tighten or widen to match horizon |
| Structural-break section | Non-empty when any tripwire active | Add regime-change branch in `scenario-forecast.md` |
| Carry-forward hygiene | ≤ 2 expired-without-status statements | Set `status` per §6 |
| Pipeline forecast (where required) | ≥ P10/P50/P90 per active procedure | Re-run transit model |

---

## 9. Cross-References

- [`ai-driven-analysis-guide.md`](ai-driven-analysis-guide.md) — 10-step protocol; this methodology slots into Step 6 (Forecasting) for prospective horizons.
- [`electoral-cycle-methodology.md`](electoral-cycle-methodology.md) — extends this protocol with electoral-specific reference classes.
- [`strategic-extensions-methodology.md`](strategic-extensions-methodology.md) — long-horizon appendix raises `scenario-forecast.md` to 60 months when `electoralOverlay=true`.
- [`historical-baseline.md`](../templates/historical-baseline.md) — reference-class store.

---

**📅 Document History**

| Version | Date | Summary |
|---|---|---|
| 1.0 | 2026-05-01 | Initial release — multi-horizon forecasting protocol, WEP decay table, structural-break tripwires, carry-forward quality gate. |
| 1.1 | 2026-05-01 | Marked §3 WEP Decay Table as the canonical surface; cross-linked from `political-style-guide.md` §Confidence Labels Are Horizon-Conditional so the article style guide references rather than duplicates the table. |
