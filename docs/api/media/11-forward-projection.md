<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 11 — Forward Projection (Stage-B prompt)

**Summary:** Apply this prompt during Stage B of any prospective horizon
≥ 7 days (`week-ahead`, `month-ahead`, `quarter-ahead`, `year-ahead`,
`term-outlook`, `election-cycle`, optionally `quarter-in-review`/`year-in-review`
when carry-forward review of prior projections is required). Wraps
[`forward-projection-methodology.md`](../../analysis/methodologies/forward-projection-methodology.md)
with the quality gates Stage C will check.

This prompt is *imported by* [`10-horizon-stage-helpers.md`](10-horizon-stage-helpers.md) §4.

## 1 · Output Contract

Produce or update these artifacts under
`analysis/daily/${DATE}/${SLUG}/intelligence/`:

- [`forward-projection.md`](../../analysis/templates/forward-projection.md) — master forward-projection artifact (mandatory for all prospective ≥7d).
- [`legislative-pipeline-forecast.md`](../../analysis/templates/legislative-pipeline-forecast.md) — per-procedure transit-time forecast (≥90d horizons only).
- [`parliamentary-calendar-projection.md`](../../analysis/templates/parliamentary-calendar-projection.md) — walk-forward calendar (≥90d horizons only).
- [`presidency-trio-context.md`](../../analysis/templates/presidency-trio-context.md) — Trio overlay (≥90d horizons only).
- [`commission-wp-alignment.md`](../../analysis/templates/commission-wp-alignment.md) — Commission Work Programme alignment (≥90d horizons only).

## 2 · Quality Gates (Stage-C will fail-fast on these)

| Gate | Threshold | Source artifact |
|---|---|---|
| Reference-class table | ≥ 6 entries with explicit base-rate | `forward-projection.md` §2 |
| WEP decay compliance | Bands match horizon (per [`forward-projection-methodology.md` §3](../../analysis/methodologies/forward-projection-methodology.md#3-wep-decay-table)) | `forward-projection.md` §3 |
| Structural-break section | Non-empty when any tripwire active | `forward-projection.md` §4 |
| Mermaid timeline-with-branches | Present and renders cleanly | `forward-projection.md` §5 |
| Carry-forward hygiene | ≤ 2 expired-without-status forward statements | `forward-projection.md` §6 |
| Outside-view audit | Covers every headline forecast | `forward-projection.md` §7 |
| Pipeline forecast | P10/P50/P90 per active procedure | `legislative-pipeline-forecast.md` §2 |
| Calendar coverage | Every plenary week in the horizon | `parliamentary-calendar-projection.md` §1 |

## 3 · Pass-1 (≈ 60% of Stage-B budget)

Write the initial pass of every artifact in §1. Do not stop at "first
draft" quality — fill every section that the template defines, including
the Pass-2 self-audit grid (you will tick the boxes in Pass 2).

When pulling reference-class entries, prefer
[`historical-baseline.md`](../../analysis/templates/historical-baseline.md)
over ad-hoc historical lookups; the baseline is curated and audited.

## 4 · Pass-2 (≈ 40% of Stage-B budget)

Read every artifact word-by-word. Apply the AI-First Quality Principle
([`.github/skills/ai-first-quality.md`](../skills/ai-first-quality.md)):

- Identify shallow sections (< 80 words / item, missing evidence,
  placeholder text) and rewrite them.
- Re-check that the WEP decay table per
  [`forward-projection-methodology.md` §3](../../analysis/methodologies/forward-projection-methodology.md#3-wep-decay-table)
  contains at least one judgement at the horizon's floor band.
- Re-check structural-break tripwires against current data; flip any
  that have armed since Pass 1.
- Resolve every expired forward-statements entry per
  [`forward-projection-methodology.md` §6](../../analysis/methodologies/forward-projection-methodology.md#6-carry-forward--forward-statement-quality-gate).
- Tick the Pass-2 self-audit grid in each artifact's final section.

## 5 · Long-Horizon-Mode Hint

For `term-outlook` and `election-cycle` (where
`SCENARIO_MAX_MONTHS ≥ 36`), [`scenario-forecast.md`](../../analysis/templates/scenario-forecast.md)
opens its long-horizon-mode header — see
[`scenario-forecast.md §0`](../../analysis/templates/scenario-forecast.md#0️⃣-long-horizon-mode)
for the full specification. Key requirements in long-horizon mode:

- **≥ 6 scenarios** are mandatory (enforced by Stage-C validator on `term-outlook`/`election-cycle`).
- Mandatory **EP-election outcome branch** with three sub-paths: centre-right majority, centre-left majority, fragmented coalition.
- Mandatory **regime-change branch**; use tripwires from §2 to define and monitor the branch.
- At least **2 wildcard/black-swan branches**.
- Per-scenario WEP confidence band **drawn from the decay table** at [`forward-projection-methodology.md §3`](../../analysis/methodologies/forward-projection-methodology.md#3-wep-decay-table) — this is the **single source of truth** for horizon-conditional WEP numbers; do not copy the table into `scenario-forecast.md`.

**Forward indicators in long-horizon mode:** [`forward-indicators.md`](../../analysis/templates/forward-indicators.md) includes a **Multi-Horizon Decay Table** (§Multi-Horizon Decay Table) that maps every indicator type to the horizons at which it retains predictive signal. Ensure every indicator card carries a `**Horizons:**` tag so monitoring plans retire indicators at their decay horizon. Canonical WEP decay numbers are in [`forward-projection-methodology.md §3`](../../analysis/methodologies/forward-projection-methodology.md#3-wep-decay-table) — `forward-indicators.md` references but does not duplicate them.

## 6 · Cross-References

- [`forward-projection-methodology.md`](../../analysis/methodologies/forward-projection-methodology.md) — **protocol authority and canonical WEP decay table (§3)**.
- [`scenario-forecast.md §0`](../../analysis/templates/scenario-forecast.md#0️⃣-long-horizon-mode) — long-horizon-mode specification.
- [`forward-indicators.md §Multi-Horizon Decay Table`](../../analysis/templates/forward-indicators.md#-multi-horizon-decay-table) — horizon tags per indicator type.
- [`02-analysis-protocol.md`](02-analysis-protocol.md) — 2-pass iterative improvement.
- [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) — Stage-C gate definition.
- [`04-article-generation.md`](04-article-generation.md) — how the artifacts in §1 land in the rendered article.
