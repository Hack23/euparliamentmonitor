// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/ep/election-calendar
 * @description Election calendar context for EP10 → EP11 transition analysis.
 */
import { EP_NEXT_ELECTION_START, EP_NEXT_ELECTION_END, EP_CURRENT_TERM, EP_NEXT_TERM, } from '../../constants/config.js';
/**
 * Compute the election calendar context for the EP10 → EP11 transition.
 * Returns deterministic output for any reference date (defaults to `new Date()`).
 *
 * Tier mapping (per `analysis/methodologies/electoral-cycle-methodology.md`):
 * - `daysToElection > 180`  → `NONE`
 * - `180 ≥ d > 90`          → `T-180`
 * - `90 ≥ d > 30`           → `T-90`
 * - `30 ≥ d`                → `T-30`
 *
 * @param referenceDate - Date to compute from (default: now)
 * @returns Election calendar context with term, window, days, and tier
 */
export function getElectionCalendarContext(referenceDate) {
    const ref = referenceDate ?? new Date();
    const electionStart = new Date(EP_NEXT_ELECTION_START + 'T00:00:00Z');
    const diffMs = electionStart.getTime() - ref.getTime();
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysToElection = diffMs >= 0 ? Math.ceil(diffMs / millisecondsPerDay) : Math.floor(diffMs / millisecondsPerDay);
    let electionImminentTier;
    if (daysToElection > 180) {
        electionImminentTier = 'NONE';
    }
    else if (daysToElection > 90) {
        electionImminentTier = 'T-180';
    }
    else if (daysToElection > 30) {
        electionImminentTier = 'T-90';
    }
    else {
        electionImminentTier = 'T-30';
    }
    const electionEnd = new Date(EP_NEXT_ELECTION_END + 'T23:59:59Z');
    const termId = ref.getTime() > electionEnd.getTime() ? EP_NEXT_TERM : EP_CURRENT_TERM;
    return {
        termId,
        nextElectionWindow: { start: EP_NEXT_ELECTION_START, end: EP_NEXT_ELECTION_END },
        daysToElection,
        electionImminentTier,
    };
}
//# sourceMappingURL=election-calendar.js.map