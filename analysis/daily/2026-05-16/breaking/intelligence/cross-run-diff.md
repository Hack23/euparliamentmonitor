<!-- SPDX-FileCopyrightText: 2026 Hack23 AB -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Cross-Run Diff — Breaking News 2026-05-16
**Date:** 2026-05-16 | **Run:** breaking-run255-1778894853 | **Grade:** B2

## First Run Declaration

This is the **first run** for date 2026-05-16 / article type `breaking`.
No prior `manifest.json.history[]` entries exist for this date and type.

The `npm run prior-run-diff` helper is a no-op in this context: with no prior run to compare
against, there are no `carryForward[]` or `rewrite[]` entries to process.

## Baseline Establishment

This run establishes the baseline for any future same-day breaking news runs. Key metrics:

| Metric | Value |
|--------|-------|
| Total artifacts written | ~18 |
| dataMode | degraded-feeds |
| Stage A MCP calls | 5 |
| Primary data source | adopted-texts-feed (50 items) |
| Top story | Ukraine Accountability TA-10-2026-0161 |
| Significance | SAT 14/20 — TIER 2 SIGNIFICANT |

## Instructions for Future Same-Day Runs

If a subsequent run occurs on 2026-05-16 for article type `breaking`:
1. Read `manifest.json.history[0]` from this run
2. Run `npm run prior-run-diff -- "${ANALYSIS_DIR}"`
3. Apply extend rule: every carryForward artifact must gain `priorLines + 20` lines minimum
4. Append new `history[]` entry to manifest
5. `manifest.pass2.rewriteCount` MUST equal total artifact count on re-run

## Analysis Delta Available

No delta (first run). Future runs should focus on:
- Any new EP data published after 2026-05-16T01:30:00Z
- Events feed recovery (if available in subsequent run)
- Roll-call vote data if plenary week begins (EP10 next plenary: likely May 19-22 Brussels mini-plenary)
