<!-- SPDX-FileCopyrightText: 2024-2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# 02a — Re-run Improve/Extend Rule (Stage B re-run contract)

**Owner of the canonical re-run merge rule.** Lifted out of
[`02-analysis-protocol.md`](02-analysis-protocol.md) §2 (which still owns the
broader Stage B protocol) and out of the 14
`.github/workflows/news-*.md` workflow bodies (which used to re-inline this
rule almost verbatim). Single source of truth — referenced from both the
canonical Stage B protocol and the shared
[`news-unified-stages.md`](../workflows/shared/prompts/news-unified-stages.md)
import that every article workflow now pulls in.

## 1 · The rule

When `${ANALYSIS_DIR}/manifest.json` already exists with a non-empty
`history[]`, every re-run MUST **detect** the prior analysis (and any
already-rendered article under `news/`) and **deepen** it. Re-running a
workflow on the same date+type is **never** a no-op: every artifact is
either *extended* (raised in line count, evidence, or new sections) or
*rewritten*. Article markdown and HTML are always regenerated from the
updated analysis.

1. Load existing `manifest.json` — treat the folder as a resume candidate,
   not a conflict.
2. Always run the prior-run diff helper (no env flag, always-on):
   ```bash
   npm run prior-run-diff -- "${ANALYSIS_DIR}"
   ```
   The helper emits a `priorRunDiff` plan with `mode: "improve-and-extend"`:
   - `carryForward[]` — artifacts already at/above floor in the prior run.
     **These are must-extend targets, not skip-write targets.** Each entry
     exposes `priorLines` (current on-disk size from the prior run) and
     `extendFloor` (= `max(threshold floor, priorLines + 20)`). Stage B
     MUST raise each artifact past `extendFloor` AND add at least one of:
     a new section, ≥3 new evidence citations, or ≥1 new chart/diagram.
   - `rewrite[]` — artifacts below floor or missing. Write a stronger
     version from scratch, sized to the catalog floor.

   Persist the plan to `${ANALYSIS_DIR}/runs/prior-run-diff.json` for
   Stage C.
3. Run Stage-B Pass 1 + Pass 2 producing every mandatory artifact. For
   each carry-forward entry, log a single line per artifact when it is
   re-written so the Stage-C reviewer can see the delta:
   ```text
   [EXTEND-FROM-PRIOR: <relativePath> prior=<priorLines>L → new=<newLines>L (+<delta>)]
   ```
   Skip-writes (`[CARRY-FORWARD: …]`) are forbidden — emitting one is a
   Stage-C RED.
4. For artifacts in `rewrite[]`, write a stronger version (overwriting
   the prior file) sized to the catalog floor.
5. Run Stage C — if GREEN, append a history entry with
   `gateResult: "GREEN"`. Stage C validates every artifact via
   `npm run validate-analysis` and additionally checks each
   carry-forward artifact's new line count exceeds its `extendFloor`.

## 2 · Invariants

- **Always-on.** The legacy `ENABLE_PRIOR_RUN_MERGE` env flag is no longer
  read by `scripts/aggregator/prior-run-diff.js`. The helper runs
  unconditionally so re-runs cannot accidentally regress to the
  pre-2026-05 skip-write behaviour. Do not gate this rule on any env
  variable in workflow `env:` blocks.
- **Article render is always re-rendered on re-runs.** Stage D
  (`npm run generate-article`) is invoked on every workflow run regardless
  of analysis mtime; the renderer is byte-for-byte deterministic so an
  unchanged analysis still produces an identical, freshly written
  output. There is therefore no need to short-circuit Stage D for
  "unchanged-since-last-run" cases — let the renderer run.
- **`manifest.pass2.rewriteCount` on re-runs.** Every re-run MUST raise
  `rewriteCount` to **the total artifact count**. A re-run with
  `rewriteCount === 0` is a Stage-C hard RED (the validator emits an
  explicit RED finding).

## 3 · Where this is invoked

- **Workflow body:** Every `news-<slug>.md` (except `news-translate.md`)
  imports
  [`shared/prompts/news-unified-stages.md`](../workflows/shared/prompts/news-unified-stages.md),
  whose Stage B section cites this file by relative path so the agent
  reads the canonical rule once per run.
- **Canonical Stage B protocol:** [`02-analysis-protocol.md`](02-analysis-protocol.md)
  §2 retains the full Stage B contract and now cross-references this file
  for the re-run merge rule specifically (the rule moved here; the rest
  of §2 stays in 02).
- **Stage C validator:** `scripts/validate-analysis-completeness.js`
  enforces the `rewriteCount > 0` invariant and the
  `extendFloor` check on every carry-forward artifact.

## 4 · References

- [`02-analysis-protocol.md`](02-analysis-protocol.md) — full Stage B
  contract (this file is its §2 extracted)
- [`03-analysis-completeness-gate.md`](03-analysis-completeness-gate.md) §6b — resuming a same-day folder
- [`09-troubleshooting.md`](09-troubleshooting.md) — re-run diagnostics
- [`shared/prompts/news-unified-stages.md`](../workflows/shared/prompts/news-unified-stages.md)
  Stage B — workflow-side entry point that imports this rule
