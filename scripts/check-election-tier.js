#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Election-imminent tier checker for the scheduler workflow.
 *
 * Self-contained script (no heavy transitive dependencies) that computes the
 * current election imminence tier and determines whether the news-election-cycle
 * workflow should be dispatched based on the current day of the week and tier.
 *
 * Tier → dispatch schedule:
 *   NONE  — no auto-dispatch (annual cron + manual only)
 *   T-180 — weekly: Monday only
 *   T-90  — twice-weekly: Monday and Thursday
 *   T-30  — daily: every day
 *
 * Post-election guard: once daysToElection < 0 (election has started), no
 * dispatch occurs — prevents runaway daily dispatches after election day.
 *
 * Outputs (for GitHub Actions):
 *   tier=<NONE|T-180|T-90|T-30>
 *   days_to_election=<number>
 *   should_dispatch=<true|false>
 *
 * On any error, writes tier=NONE and should_dispatch=false (fail-closed).
 */

import { appendFileSync } from 'node:fs';

// ─── Inlined constants (from src/constants/config.ts) ───────────────────────
// Kept in sync with EP_NEXT_ELECTION_START / EP_NEXT_ELECTION_END.
const EP_NEXT_ELECTION_START = '2029-06-04';
const EP_NEXT_ELECTION_END = '2029-06-09';

/**
 * Compute the election imminence tier.
 * Mirrors getElectionCalendarContext() from src/mcp/ep-mcp-client.ts but
 * without transitive dependencies (MCPConnection, ProcedureSeenCache, etc.).
 */
function computeElectionTier(referenceDate) {
  const ref = referenceDate || new Date();
  const electionStart = new Date(EP_NEXT_ELECTION_START + 'T00:00:00Z');
  const diffMs = electionStart.getTime() - ref.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysToElection =
    diffMs >= 0 ? Math.ceil(diffMs / msPerDay) : Math.floor(diffMs / msPerDay);

  let tier;
  if (daysToElection > 180) {
    tier = 'NONE';
  } else if (daysToElection > 90) {
    tier = 'T-180';
  } else if (daysToElection > 30) {
    tier = 'T-90';
  } else if (daysToElection >= 0) {
    tier = 'T-30';
  } else {
    // Post-election: no auto-dispatch
    tier = 'NONE';
  }

  return { tier, daysToElection };
}

/**
 * Determine if the workflow should dispatch based on tier and day-of-week.
 */
function shouldDispatchForTier(tier, dayOfWeek) {
  if (tier === 'T-30') return true;
  if (tier === 'T-90') return dayOfWeek === 1 || dayOfWeek === 4;
  if (tier === 'T-180') return dayOfWeek === 1;
  return false;
}

/**
 * Write outputs to $GITHUB_OUTPUT (or log if not in CI).
 */
function writeOutputs(tier, days, shouldDispatch) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `tier=${tier}\n`);
    appendFileSync(outputFile, `days_to_election=${days}\n`);
    appendFileSync(outputFile, `should_dispatch=${shouldDispatch}\n`);
  }
  console.log(`Election tier: ${tier}`);
  console.log(`Days to election: ${days}`);
  console.log(`Day of week (UTC): ${new Date().getUTCDay()}`);
  console.log(`Should dispatch: ${shouldDispatch}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────
try {
  const { tier, daysToElection } = computeElectionTier();
  const dayOfWeek = new Date().getUTCDay();
  const dispatch = shouldDispatchForTier(tier, dayOfWeek);
  writeOutputs(tier, daysToElection, dispatch);
} catch (err) {
  // Fail-closed: write safe defaults so the workflow never dispatches on error
  console.error('Error computing election tier:', err.message);
  writeOutputs('NONE', -1, false);
}

// Exported for testing
export { computeElectionTier, shouldDispatchForTier };
