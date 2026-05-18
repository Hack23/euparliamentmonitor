// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/** Stage budgets shared by the four short/mid prospective horizons.
 *  Sum 35 (A=5, B=22, C=4, D=2, E=2). Per-family B1→B2,
 *  Stage C exit, and PR-call tripwires are defined in
 *  `.github/prompts/02-analysis-protocol.md` §3. */
export const PROSPECTIVE_BUDGETS = { A: 5, B: 22, C: 4, D: 2, E: 2 };
/** Stage budgets shared by retrospective horizons. Sum 34 — same shape
 *  as PROSPECTIVE_BUDGETS but Stage A is one minute lighter (no
 *  forward-statements registry pre-read). */
export const RETROSPECTIVE_BUDGETS = { A: 4, B: 22, C: 4, D: 2, E: 2 };
/** Stage budgets for long-horizon electoral runs. Sum 41 — extended
 *  Stage B (28 min) for the larger Family-D + electoral-overlay
 *  artifact set (mandate-scorecard, seat-projection, term-arc, etc.)
 *  while keeping the same Stage C/D/E budgets. PR-call still lands by
 *  minute ~45 inside the 60-min cap and 65-min MCP session window. */
export const ELECTORAL_BUDGETS = { A: 5, B: 28, C: 4, D: 2, E: 2 };
/**
 * Latest minute at which `safeoutputs___create_pull_request` may be invoked,
 * per article-type slug. Authoritative for the operational tripwires in
 * `.github/prompts/02-analysis-protocol.md` §3. The 60-minute
 * `timeout-minutes` cap minus this deadline is the slack budget for sandbox
 * teardown, render, commit, and the safe-output round-trip.
 */
export const PR_CALL_DEADLINE_BY_SLUG = Object.freeze({
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
//# sourceMappingURL=stage-budgets.js.map