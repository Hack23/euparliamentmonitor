<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 10 — Horizon Stage Helpers

**Summary:** Shared Stage-A → Stage-E primitives for every horizon-aware
`news-<type>.md` workflow. This prompt is *imported* by the new
long-horizon workflows (`news-quarter-ahead.md`, `news-quarter-in-review.md`,
`news-year-ahead.md`, `news-year-in-review.md`, `news-term-outlook.md`,
`news-election-cycle.md`) so each workflow body stays under ~120 lines.

## 1 · Horizon-Config Lookup

Every horizon-aware workflow declares its **horizon-config slug** in
frontmatter. At Stage A start, the workflow MUST look up the config from
`scripts/config/article-horizons.js` (TypeScript source: `src/config/article-horizons.ts`)
and bind these locals:

| Variable | Source | Purpose |
|---|---|---|
| `SLUG` | `cfg.slug` | Folder name under `analysis/daily/${DATE}/${SLUG}/` |
| `PERSPECTIVE` | `cfg.perspective` | Drives prompt selection (forward / electoral / retrospective) |
| `DATA_WINDOW` | `cfg.dataWindow` | Drives MCP query window selection |
| `MANDATORY_ARTIFACTS` | `cfg.mandatoryArtifacts` | Stage-C completeness checklist |
| `OPTIONAL_ARTIFACTS` | `cfg.optionalArtifacts` | Pass-2 enrichment list |
| `STAGE_BUDGETS` | `cfg.stageBudgets` | Minute caps for stages A/B/C/D/E |
| `FORWARD_HORIZON_DAYS` | `cfg.forwardStatementsHorizonDays` | Filter window for `forward-statements-registry` |
| `SCENARIO_MAX_MONTHS` | `cfg.scenarioMaxHorizonMonths` | Caps `scenario-forecast.md` long-horizon mode |
| `ELECTORAL_OVERLAY` | `cfg.electoralOverlay` | When `true`, import `12-electoral-cycle.md` as well |

The total minute spend across A+B+C+D+E MUST not exceed **45**.

## 2 · Stage-A Gateway Init (helper hook)

Every horizon-aware workflow starts Stage A with the canonical sequence:

1. `source scripts/mcp-setup.sh` to bind `EP_MCP_GATEWAY_URL` and tokens.
2. `node scripts/imf-mcp-probe.sh` to populate `cache/imf/imf-probe-summary.json`.
3. World Bank baseline pull via the standard helper.
4. Forward-statements seeding from `analysis/forward-statements/` JSONL via
   `scripts/aggregator/forward-statements-registry.js` with
   `--horizon-days $FORWARD_HORIZON_DAYS`.

For `quarter-ahead+` horizons (≥ 90 days), the Stage-A fan-out additionally
runs `get_plenary_sessions` per-month inside the data window and pulls
Trio Presidency / Commission Work Programme entries from
`get_external_documents`. See [`01-data-collection.md` §8d](01-data-collection.md).

## 3 · Stage-B Mandatory Artifacts (registry-driven)

Stage B reads `MANDATORY_ARTIFACTS` from §1 and produces every entry under
`analysis/daily/${DATE}/${SLUG}/…`. The registry already includes the
horizon-specific artifacts:

- For prospective horizons ≥ quarter, the list contains
  [`forward-projection.md`](../../analysis/templates/forward-projection.md),
  [`legislative-pipeline-forecast.md`](../../analysis/templates/legislative-pipeline-forecast.md),
  [`parliamentary-calendar-projection.md`](../../analysis/templates/parliamentary-calendar-projection.md),
  [`presidency-trio-context.md`](../../analysis/templates/presidency-trio-context.md),
  [`commission-wp-alignment.md`](../../analysis/templates/commission-wp-alignment.md).
- For electoral-overlay horizons (`term-outlook`, `election-cycle`), the
  list additionally contains [`term-arc.md`](../../analysis/templates/term-arc.md),
  [`seat-projection.md`](../../analysis/templates/seat-projection.md),
  [`mandate-fulfilment-scorecard.md`](../../analysis/templates/mandate-fulfilment-scorecard.md).
- For retrospective long-horizon (`year-in-review`,
  `quarter-in-review`), the list contains
  `mandate-fulfilment-scorecard.md` and `legislative-pipeline-forecast.md`
  in their backward-window form.

Apply the **2-pass iterative-improvement principle** ([`02-analysis-protocol.md`](02-analysis-protocol.md))
to every artifact. The mandatory floor for each is enforced by Stage C
through [`reference-quality-thresholds.json`](../../analysis/methodologies/reference-quality-thresholds.json).

## 4 · Stage-B Prospective Hooks

When `PERSPECTIVE === 'prospective'` import [`11-forward-projection.md`](11-forward-projection.md):

- Reference-class table ≥ 6 entries, each cited.
- WEP decay table populated per the horizon's floor band.
- Structural-break tripwire status evaluated.
- Carry-forward forward-statements have `status` set per
  [`forward-projection-methodology.md` §6](../../analysis/methodologies/forward-projection-methodology.md#6-carry-forward--forward-statement-quality-gate).

When `ELECTORAL_OVERLAY === true` additionally import [`12-electoral-cycle.md`](12-electoral-cycle.md):

- Term-progress index numerically computed in `term-arc.md`.
- ≥ 6 driver pledges traced per major group in
  `mandate-fulfilment-scorecard.md`.
- ≥ 4 plausible coalitions assessed in `seat-projection.md`.
- ≥ 3 driver national elections in §5 of `seat-projection.md`.
- Spitzenkandidaten arithmetic populated for ≥ 2 candidates.

## 5 · Stage-C Completeness Gate (registry-driven)

Stage C MUST consume `MANDATORY_ARTIFACTS` from §1 and check each entry:

- Existence on disk under `analysis/daily/${DATE}/${SLUG}/…`.
- Line count ≥ floor from `reference-quality-thresholds.json` for this slug.
- Pass-2 quality self-audit checkboxes ticked in §N of each artifact.

Stage C tripwire-clamps at **minute 22** of the 45-minute budget. If a
mandatory artifact is missing or short, the agent restarts that single
artifact's Pass-2 only — do not retry the entire run.

When `ELECTORAL_OVERLAY === true`, Stage C also enforces the electoral
overlay gate:

- `term-arc.md` term-progress index numerically populated.
- `seat-projection.md` covers all major groups at all four horizons.
- `mandate-fulfilment-scorecard.md` carries a headline letter score per group.

## 6 · Stage-D Article Render (canonical)

Identical to existing horizons:

```bash
npm run generate-article -- --run "$ANALYSIS_DIR" --type "$SLUG"
```

The aggregator picks up the new artifact-order sections (`forward-projection`,
`electoral-arc`) automatically — no aggregator-side opt-in is required.

## 7 · Stage-E Single PR

Identical to existing horizons. The PR call (`safeoutputs___create_pull_request`)
must land **by minute ≤ 28** of the 45-minute budget; target minute ≤ 25.
The unified `news-<type>.md` rule still holds: **exactly one PR per run**.

## 8 · Recess Mode for Long Horizons

For `quarter-ahead+` horizons:

- When the EP MCP returns `recessMode: true` from any feed within the data
  window, soft-fail that feed and surface a 🟡 dataQualityWarning entry in
  `mcp-reliability-audit.md`. Do not abort the run.
- When ≥ 2 mandatory feeds are in recess mode, downgrade the article from
  "Forward Projection" to "Calendar Projection" — keep the analysis
  artifacts but trim the article BLUF accordingly.

## 9 · Cross-References

- [`forward-projection-methodology.md`](../../analysis/methodologies/forward-projection-methodology.md) — multi-horizon forecasting protocol.
- [`electoral-cycle-methodology.md`](../../analysis/methodologies/electoral-cycle-methodology.md) — dual-track electoral lens.
- [`02-analysis-protocol.md`](02-analysis-protocol.md) — 2-pass iterative-improvement principle.
- [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) — Stage C details.
