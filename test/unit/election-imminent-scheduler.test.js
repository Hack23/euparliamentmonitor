// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeElectionTier, shouldDispatchForTier } from '../../scripts/check-election-tier.js';

/**
 * Tests for the election-imminent tier dispatch logic.
 *
 * The check-election-tier.js script computes the election tier and then
 * decides whether to dispatch based on the day of the week:
 *   NONE  → never dispatch
 *   T-180 → Monday only
 *   T-90  → Monday and Thursday
 *   T-30  → every day
 */
describe('election-imminent-scheduler', () => {
  describe('computeElectionTier', () => {
    it('should return NONE when daysToElection > 180', () => {
      // Well before election (e.g., 2027)
      const { tier, daysToElection } = computeElectionTier(new Date('2027-01-01T00:00:00Z'));
      expect(tier).toBe('NONE');
      expect(daysToElection).toBeGreaterThan(180);
    });

    it('should return T-180 when 180 >= daysToElection > 90', () => {
      // ~150 days before 2029-06-04 → around 2029-01-05
      const { tier, daysToElection } = computeElectionTier(new Date('2029-01-05T00:00:00Z'));
      expect(tier).toBe('T-180');
      expect(daysToElection).toBeGreaterThan(90);
      expect(daysToElection).toBeLessThanOrEqual(180);
    });

    it('should return T-90 when 90 >= daysToElection > 30', () => {
      // ~60 days before 2029-06-04 → around 2029-04-05
      const { tier, daysToElection } = computeElectionTier(new Date('2029-04-05T00:00:00Z'));
      expect(tier).toBe('T-90');
      expect(daysToElection).toBeGreaterThan(30);
      expect(daysToElection).toBeLessThanOrEqual(90);
    });

    it('should return T-30 when 0 <= daysToElection <= 30', () => {
      // 10 days before 2029-06-04 → 2029-05-25
      const { tier, daysToElection } = computeElectionTier(new Date('2029-05-25T00:00:00Z'));
      expect(tier).toBe('T-30');
      expect(daysToElection).toBeLessThanOrEqual(30);
      expect(daysToElection).toBeGreaterThanOrEqual(0);
    });

    it('should return NONE when daysToElection < 0 (post-election guard)', () => {
      // After election start: 2029-06-10
      const { tier, daysToElection } = computeElectionTier(new Date('2029-06-10T00:00:00Z'));
      expect(tier).toBe('NONE');
      expect(daysToElection).toBeLessThan(0);
    });

    it('should return NONE well after election end', () => {
      // Months after election: 2029-12-01
      const { tier, daysToElection } = computeElectionTier(new Date('2029-12-01T00:00:00Z'));
      expect(tier).toBe('NONE');
      expect(daysToElection).toBeLessThan(0);
    });
  });

  describe('shouldDispatchForTier', () => {
    it('should never dispatch for NONE tier', () => {
      for (let day = 0; day <= 6; day++) {
        expect(shouldDispatchForTier('NONE', day)).toBe(false);
      }
    });

    it('should dispatch only on Monday for T-180 tier', () => {
      expect(shouldDispatchForTier('T-180', 0)).toBe(false); // Sun
      expect(shouldDispatchForTier('T-180', 1)).toBe(true);  // Mon
      expect(shouldDispatchForTier('T-180', 2)).toBe(false); // Tue
      expect(shouldDispatchForTier('T-180', 3)).toBe(false); // Wed
      expect(shouldDispatchForTier('T-180', 4)).toBe(false); // Thu
      expect(shouldDispatchForTier('T-180', 5)).toBe(false); // Fri
      expect(shouldDispatchForTier('T-180', 6)).toBe(false); // Sat
    });

    it('should dispatch on Monday and Thursday for T-90 tier', () => {
      expect(shouldDispatchForTier('T-90', 0)).toBe(false); // Sun
      expect(shouldDispatchForTier('T-90', 1)).toBe(true);  // Mon
      expect(shouldDispatchForTier('T-90', 2)).toBe(false); // Tue
      expect(shouldDispatchForTier('T-90', 3)).toBe(false); // Wed
      expect(shouldDispatchForTier('T-90', 4)).toBe(true);  // Thu
      expect(shouldDispatchForTier('T-90', 5)).toBe(false); // Fri
      expect(shouldDispatchForTier('T-90', 6)).toBe(false); // Sat
    });

    it('should dispatch every day for T-30 tier', () => {
      for (let day = 0; day <= 6; day++) {
        expect(shouldDispatchForTier('T-30', day)).toBe(true);
      }
    });
  });

  describe('hysteresis (boundary behavior)', () => {
    it('should use ceil for positive daysToElection (rounds day-count up to less-frequent tier)', () => {
      // Exactly 180 days → T-180 (not NONE) because 180 > 90 but not > 180
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 180 * 24 * 60 * 60 * 1000);
      const { tier } = computeElectionTier(refDate);
      expect(tier).toBe('T-180');
    });

    it('should assign T-90 at exactly 90 days', () => {
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 90 * 24 * 60 * 60 * 1000);
      const { tier } = computeElectionTier(refDate);
      expect(tier).toBe('T-90');
    });

    it('should assign T-30 at exactly 30 days', () => {
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      const { tier } = computeElectionTier(refDate);
      expect(tier).toBe('T-30');
    });

    it('should not flap: 181 days is NONE', () => {
      const electionStart = new Date('2029-06-04T00:00:00Z');
      const refDate = new Date(electionStart.getTime() - 181 * 24 * 60 * 60 * 1000);
      const { tier } = computeElectionTier(refDate);
      expect(tier).toBe('NONE');
    });
  });
});
