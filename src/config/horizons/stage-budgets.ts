// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config/Horizons/StageBudgets
 * @description Shared stage-budget shapes and per-slug PR-call deadlines.
 *
 * Extracted from `src/config/article-horizons.ts` as part of Refactor 2/8
 * (issue Hack23/euparliamentmonitor#2030). Holds the shared budget shapes
 * referenced by the registry plus the per-slug PR-call deadline map enforced
 * by `.github/prompts/02-analysis-protocol.md` §3 ("Stage budgets").
 *
 * Deadlines (`PR_CALL_DEADLINE_BY_SLUG`) describe the latest minute at which
 * `safeoutputs___create_pull_request` may be invoked inside the 60-minute
 * `timeout-minutes` window:
 *
 *  - Standard prospective / retrospective horizons → minute ≤45 (target ≤42)
 *  - Long-horizon (quarter/year ahead / in review) → minute ≤45 (target ≤44)
 *  - Electoral (term-outlook, election-cycle, deep-analysis) → minute ≤47
 *
 * @see .github/prompts/02-analysis-protocol.md § Stage budgets
 * @see ./registry.ts — `ARTICLE_HORIZONS.stageBudgets` consumes the shared shapes below
 */

import type { StageBudgetConfig } from './types.js';

/** Stage budgets shared by the four short/mid prospective horizons.
 *  Sum 35 (A=5, B=22, C=4, D=2, E=2). Per-family B1→B2,
 *  Stage C exit, and PR-call tripwires are defined in
 *  `.github/prompts/02-analysis-protocol.md` §3. */
export const PROSPECTIVE_BUDGETS: StageBudgetConfig = { A: 5, B: 22, C: 4, D: 2, E: 2 };

/** Stage budgets shared by retrospective horizons. Sum 34 — same shape
 *  as PROSPECTIVE_BUDGETS but Stage A is one minute lighter (no
 *  forward-statements registry pre-read). */
export const RETROSPECTIVE_BUDGETS: StageBudgetConfig = { A: 4, B: 22, C: 4, D: 2, E: 2 };

/** Stage budgets for long-horizon electoral runs. Sum 41 — extended
 *  Stage B (28 min) for the larger Family-D + electoral-overlay
 *  artifact set (mandate-scorecard, seat-projection, term-arc, etc.)
 *  while keeping the same Stage C/D/E budgets. PR-call still lands by
 *  minute ~45 inside the 60-min cap and 65-min MCP session window. */
export const ELECTORAL_BUDGETS: StageBudgetConfig = { A: 5, B: 28, C: 4, D: 2, E: 2 };

/**
 * Latest minute at which `safeoutputs___create_pull_request` may be invoked,
 * per article-type slug. Authoritative for the operational tripwires in
 * `.github/prompts/02-analysis-protocol.md` §3. The 60-minute
 * `timeout-minutes` cap minus this deadline is the slack budget for sandbox
 * teardown, render, commit, and the safe-output round-trip.
 */
export const PR_CALL_DEADLINE_BY_SLUG: Readonly<Record<string, number>> = Object.freeze({
  'week-ahead': 42,
  'month-ahead': 42,
  'quarter-ahead': 45,
  'year-ahead': 45,
  'week-in-review': 42,
  'month-in-review': 42,
  'quarter-in-review': 45,
  'year-in-review': 45,
  'term-outlook': 47,
  'election-cycle': 47,
  breaking: 42,
  'committee-reports': 42,
  motions: 42,
  propositions: 42,
  'deep-analysis': 47,
});
