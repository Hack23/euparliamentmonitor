// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getElectionCalendarContext } from '../../scripts/mcp/ep-mcp-client.js';

/**
 * Tests for the election-imminent tier dispatch logic.
 *
 * The check-election-tier.js script uses getElectionCalendarContext() to
 * determine the tier and then decides whether to dispatch based on the
 * day of the week:
 *   NONE  → never dispatch
 *   T-180 → Monday only
 *   T-90  → Monday and Thursday
 *   T-30  → every day
 */
describe('election-imminent-scheduler', () => {
  describe('getElectionCalendarContext tier computation', () => {
    it('should return NONE when daysToElection > 180', () => {
      // Well before election (e.g., 2027)
      const ctx = getElectionCalendarContext(new Date('2027-01-01T00:00:00Z'));
      expect(ctx.electionImminentTier).toBe('NONE');
      expect(ctx.daysToElection).toBeGreaterThan(180);
    });

    it('should return T-180 when 180 >= daysToElection > 90', () => {
      // ~150 days before 2029-06-04 → around 2029-01-05
      const ctx = getElectionCalendarContext(new Date('2029-01-05T00:00:00Z'));
      expect(ctx.electionImminentTier).toBe('T-180');
      expect(ctx.daysToElection).toBeGreaterThan(90);
      expect(ctx.daysToElection).toBeLessThanOrEqual(180);
    });

    it('should return T-90 when 90 >= daysToElection > 30', () => {
      // ~60 days before 2029-06-04 → around 2029-04-05
      const ctx = getElectionCalendarContext(new Date('2029-04-05T00:00:00Z'));
      expect(ctx.electionImminentTier).toBe('T-90');
      expect(ctx.daysToElection).toBeGreaterThan(30);
      expect(ctx.daysToElection).toBeLessThanOrEqual(90);
    });

    it('should return T-30 when daysToElection <= 30', () => {
      // 10 days before 2029-06-04 → 2029-05-25
      const ctx = getElectionCalendarContext(new Date('2029-05-25T00:00:00Z'));
      expect(ctx.electionImminentTier).toBe('T-30');
      expect(ctx.daysToElection).toBeLessThanOrEqual(30);
    });
  });

  describe('dispatch decision logic', () => {
    /**
     * Helper that mirrors the dispatch logic from check-election-tier.js
     */
    function shouldDispatch(tier, dayOfWeek) {
      if (tier === 'T-30') return true;
      if (tier === 'T-90') return dayOfWeek === 1 || dayOfWeek === 4;
      if (tier === 'T-180') return dayOfWeek === 1;
      return false; // NONE
    }

    it('should never dispatch for NONE tier', () => {
      for (let day = 0; day <= 6; day++) {
        expect(shouldDispatch('NONE', day)).toBe(false);
      }
    });

    it('should dispatch only on Monday for T-180 tier', () => {
      expect(shouldDispatch('T-180', 0)).toBe(false); // Sun
      expect(shouldDispatch('T-180', 1)).toBe(true);  // Mon
      expect(shouldDispatch('T-180', 2)).toBe(false); // Tue
      expect(shouldDispatch('T-180', 3)).toBe(false); // Wed
      expect(shouldDispatch('T-180', 4)).toBe(false); // Thu
      expect(shouldDispatch('T-180', 5)).toBe(false); // Fri
      expect(shouldDispatch('T-180', 6)).toBe(false); // Sat
    });

    it('should dispatch on Monday and Thursday for T-90 tier', () => {
      expect(shouldDispatch('T-90', 0)).toBe(false); // Sun
      expect(shouldDispatch('T-90', 1)).toBe(true);  // Mon
      expect(shouldDispatch('T-90', 2)).toBe(false); // Tue
      expect(shouldDispatch('T-90', 3)).toBe(false); // Wed
      expect(shouldDispatch('T-90', 4)).toBe(true);  // Thu
      expect(shouldDispatch('T-90', 5)).toBe(false); // Fri
      expect(shouldDispatch('T-90', 6)).toBe(false); // Sat
    });

    it('should dispatch every day for T-30 tier', () => {
      for (let day = 0; day <= 6; day++) {
        expect(shouldDispatch('T-30', day)).toBe(true);
      }
    });
  });

  describe('hysteresis (boundary behavior)', () => {
    it('should use ceil for positive daysToElection (rounds toward farther tier)', () => {
      // Exactly 180 days → T-180 (not NONE) because ceil(180) = 180 and 180 > 90 but not > 180
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 180 * 24 * 60 * 60 * 1000);
      const ctx = getElectionCalendarContext(refDate);
      expect(ctx.electionImminentTier).toBe('T-180');
    });

    it('should assign T-90 at exactly 90 days', () => {
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 90 * 24 * 60 * 60 * 1000);
      const ctx = getElectionCalendarContext(refDate);
      expect(ctx.electionImminentTier).toBe('T-90');
    });

    it('should assign T-30 at exactly 30 days', () => {
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ctx = getElectionCalendarContext(refDate);
      expect(ctx.electionImminentTier).toBe('T-30');
    });

    it('should not flap: 181 days is NONE', () => {
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 181 * 24 * 60 * 60 * 1000);
      const ctx = getElectionCalendarContext(refDate);
      expect(ctx.electionImminentTier).toBe('NONE');
    });
  });
});
