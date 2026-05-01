<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 12 — Electoral Cycle (Stage-B prompt)

**Summary:** Apply this prompt during Stage B when the horizon's
`electoralOverlay === true` (`term-outlook`, `election-cycle`, optionally
`year-in-review` for retrospective half). Wraps
[`electoral-cycle-methodology.md`](../../analysis/methodologies/electoral-cycle-methodology.md)
and [`electoral-domain-methodology.md`](../../analysis/methodologies/electoral-domain-methodology.md)
with the dual-track artifact contract.

This prompt is *imported by* [`10-horizon-stage-helpers.md`](10-horizon-stage-helpers.md) §4.

## 1 · Dual-Track Output Contract

Produce or update these artifacts under
`analysis/daily/${DATE}/${SLUG}/intelligence/`:

- **Track A — Term Retrospective**
  - [`term-arc.md`](../../analysis/templates/term-arc.md)
  - [`mandate-fulfilment-scorecard.md`](../../analysis/templates/mandate-fulfilment-scorecard.md)
- **Track B — Term Forecast**
  - [`seat-projection.md`](../../analysis/templates/seat-projection.md)
  - [`forward-projection.md`](../../analysis/templates/forward-projection.md) (extended for the electoral lens)

Plus the cross-cutting
[`presidency-trio-context.md`](../../analysis/templates/presidency-trio-context.md)
and
[`commission-wp-alignment.md`](../../analysis/templates/commission-wp-alignment.md)
already required by [`11-forward-projection.md`](11-forward-projection.md).

## 2 · Quality Gates (Stage-C will fail-fast on these)

| Gate | Threshold | Source artifact |
|---|---|---|
| Term-progress index | Numerically computed (months elapsed / months total) | `term-arc.md` header + §5 |
| Coalition-trajectory chart | Mermaid `xychart-beta` with ≥ 4 quarters | `term-arc.md` §3 |
| Pledge → adopted-act traceability | ≥ 5 pledges per major group | `mandate-fulfilment-scorecard.md` §2 |
| Defection-flow Mermaid block | Present | `mandate-fulfilment-scorecard.md` §3 |
| Vote-share delta vs prior term | Covers all major groups | `mandate-fulfilment-scorecard.md` §4 |
| Seat bands at four horizons | All groups × T+6/12/24/36m populated with WEP | `seat-projection.md` §2 |
| Coalition viability matrix | ≥ 4 plausible majorities classified | `seat-projection.md` §4 |
| Spitzenkandidaten arithmetic | ≥ 2 candidates documented | `seat-projection.md` §6 |
| National-spillover entries | ≥ 3 driver elections | `seat-projection.md` §5 |

## 3 · Pass-1 (≈ 60% of Stage-B budget)

Write the initial pass of every Track-A and Track-B artifact in §1. Pull:

- Term anchors and election dates from
  [`electoral-cycle-methodology.md` §1](../../analysis/methodologies/electoral-cycle-methodology.md)
  and from `src/mcp/ep-mcp-client.ts:getElectionCalendarContext()`.
- 2024 (or prior) campaign manifestos for §2 of `mandate-fulfilment-scorecard.md`.
- Trailing-term cohesion data from
  [`coalition-mathematics.md`](../../analysis/templates/coalition-mathematics.md)
  for the §3 Mermaid chart in `term-arc.md`.
- National-polling reference data for §5 of `seat-projection.md`.

## 4 · Pass-2 (≈ 40% of Stage-B budget)

Read every Track-A and Track-B artifact word-by-word. Apply the
AI-First Quality Principle
([`.github/skills/ai-first-quality.md`](../skills/ai-first-quality.md)):

- Reconcile Track A scoreboard with Track B forecast — does an A-grade
  group's seat projection trend up? If the two contradict without
  explanation, rewrite Track B's `seat-projection.md` §6 (drift vs prior).
- Stress-test seat bands by widening one band when the reference class
  has < 6 analogues per
  [`forward-projection-methodology.md` §2](../../analysis/methodologies/forward-projection-methodology.md#2-reference-class-forecasting-tetlock-outside-view).
- Re-check the EP-term anchors from §1 against
  [`electoral-cycle-methodology.md` §1](../../analysis/methodologies/electoral-cycle-methodology.md);
  any mismatch is a 🔴 error.
- Tick the Pass-2 self-audit grid in each artifact's final section.

## 5 · Auto-Trigger & T-180/T-90/T-30 Behaviour

When `getElectionCalendarContext()` reports a "days-to-next-election" value
in the bands [180, 90] or [90, 30] or [30, 0], the
[`news-election-cycle.md`](../workflows/news-election-cycle.md)
workflow auto-runs at the cadence specified by
[`electoral-cycle-methodology.md` §5](../../analysis/methodologies/electoral-cycle-methodology.md).
This prompt does not implement the trigger itself; it ensures the
artifacts produced under each trigger remain complete and consistent.

## 6 · Cross-References

- [`electoral-cycle-methodology.md`](../../analysis/methodologies/electoral-cycle-methodology.md) — dual-track lens.
- [`electoral-domain-methodology.md`](../../analysis/methodologies/electoral-domain-methodology.md) — base electoral lens.
- [`forward-projection-methodology.md`](../../analysis/methodologies/forward-projection-methodology.md) — horizon-conditional WEP and structural-break protocol.
- [`02-analysis-protocol.md`](02-analysis-protocol.md) — 2-pass iterative improvement.
- [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) — Stage-C gate definition.
