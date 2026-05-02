#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Election-imminent tier checker for the scheduler workflow.
 *
 * Computes the current election imminence tier using getElectionCalendarContext()
 * and determines whether the news-election-cycle workflow should be dispatched
 * based on the current day of the week and the tier.
 *
 * Tier → dispatch schedule:
 *   NONE  — no auto-dispatch (annual cron + manual only)
 *   T-180 — weekly: Monday only
 *   T-90  — twice-weekly: Monday and Thursday
 *   T-30  — daily: every day
 *
 * Outputs (for GitHub Actions):
 *   tier=<NONE|T-180|T-90|T-30>
 *   days_to_election=<number>
 *   should_dispatch=<true|false>
 *
 * Exit code 0 always (GitHub Actions reads outputs).
 */

import { getElectionCalendarContext } from './mcp/ep-mcp-client.js';

const ctx = getElectionCalendarContext();
const tier = ctx.electionImminentTier;
const days = ctx.daysToElection;

// Day of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const dayOfWeek = new Date().getUTCDay();

let shouldDispatch = false;

if (tier === 'T-30') {
  // Daily dispatch
  shouldDispatch = true;
} else if (tier === 'T-90') {
  // Twice-weekly: Monday (1) and Thursday (4)
  shouldDispatch = dayOfWeek === 1 || dayOfWeek === 4;
} else if (tier === 'T-180') {
  // Weekly: Monday (1) only
  shouldDispatch = dayOfWeek === 1;
}
// tier === 'NONE' → shouldDispatch remains false

// Write outputs for GitHub Actions
const outputFile = process.env.GITHUB_OUTPUT;
if (outputFile) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(outputFile, `tier=${tier}\n`);
  appendFileSync(outputFile, `days_to_election=${days}\n`);
  appendFileSync(outputFile, `should_dispatch=${shouldDispatch}\n`);
}

// Also log for visibility
console.log(`Election tier: ${tier}`);
console.log(`Days to election: ${days}`);
console.log(`Day of week (UTC): ${dayOfWeek}`);
console.log(`Should dispatch: ${shouldDispatch}`);
