// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests: MCP fallback sentinel constants.
 *
 * Verifies that each exported fallback constant:
 * - is a non-empty string.
 * - parses as valid JSON.
 * - contains the expected top-level key(s).
 *
 * This acts as a drift guard: if a fallback sentinel's shape changes in a
 * way that would break downstream consumers, this test will fail.
 */

import { describe, it, expect } from 'vitest';
import {
  EFFECTIVENESS_FALLBACK,
  MEPS_FALLBACK,
  DOCUMENTS_FALLBACK,
  EVENTS_FALLBACK,
  ACTIVITIES_FALLBACK,
  ITEMS_FALLBACK,
  INTELLIGENCE_FALLBACK,
  STATS_FALLBACK,
  PROCEDURE_EVENT_FALLBACK,
  SERVER_HEALTH_FALLBACK,
  ADOPTED_TEXTS_FALLBACK,
  FEED_UNAVAILABLE_REASON,
  CONTENT_NOT_YET_AVAILABLE_SUBSTRING,
} from '../../scripts/mcp/ep-mcp-client.js';

describe('EP MCP fallback sentinel constants', () => {
  describe('string sentinels', () => {
    it('FEED_UNAVAILABLE_REASON is a non-empty string', () => {
      expect(typeof FEED_UNAVAILABLE_REASON).toBe('string');
      expect(FEED_UNAVAILABLE_REASON.length).toBeGreaterThan(0);
    });

    it('CONTENT_NOT_YET_AVAILABLE_SUBSTRING is a non-empty string', () => {
      expect(typeof CONTENT_NOT_YET_AVAILABLE_SUBSTRING).toBe('string');
      expect(CONTENT_NOT_YET_AVAILABLE_SUBSTRING.length).toBeGreaterThan(0);
    });
  });

  describe('JSON fallback shapes', () => {
    const jsonFallbacks = [
      { name: 'EFFECTIVENESS_FALLBACK', value: EFFECTIVENESS_FALLBACK },
      { name: 'MEPS_FALLBACK', value: MEPS_FALLBACK },
      { name: 'DOCUMENTS_FALLBACK', value: DOCUMENTS_FALLBACK },
      { name: 'EVENTS_FALLBACK', value: EVENTS_FALLBACK },
      { name: 'ACTIVITIES_FALLBACK', value: ACTIVITIES_FALLBACK },
      { name: 'ITEMS_FALLBACK', value: ITEMS_FALLBACK },
      { name: 'INTELLIGENCE_FALLBACK', value: INTELLIGENCE_FALLBACK },
      { name: 'STATS_FALLBACK', value: STATS_FALLBACK },
      { name: 'PROCEDURE_EVENT_FALLBACK', value: PROCEDURE_EVENT_FALLBACK },
      { name: 'SERVER_HEALTH_FALLBACK', value: SERVER_HEALTH_FALLBACK },
      { name: 'ADOPTED_TEXTS_FALLBACK', value: ADOPTED_TEXTS_FALLBACK },
    ];

    for (const { name, value } of jsonFallbacks) {
      it(`${name} is a non-empty string`, () => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });

      it(`${name} parses as valid JSON`, () => {
        expect(() => JSON.parse(value)).not.toThrow();
      });
    }

    it('MEPS_FALLBACK JSON contains meps array', () => {
      const parsed = JSON.parse(MEPS_FALLBACK);
      expect(parsed).toHaveProperty('meps');
      expect(Array.isArray(parsed.meps)).toBe(true);
    });

    it('DOCUMENTS_FALLBACK JSON contains documents array', () => {
      const parsed = JSON.parse(DOCUMENTS_FALLBACK);
      expect(parsed).toHaveProperty('documents');
      expect(Array.isArray(parsed.documents)).toBe(true);
    });

    it('EVENTS_FALLBACK JSON contains events array', () => {
      const parsed = JSON.parse(EVENTS_FALLBACK);
      expect(parsed).toHaveProperty('events');
      expect(Array.isArray(parsed.events)).toBe(true);
    });

    it('ADOPTED_TEXTS_FALLBACK JSON contains texts array', () => {
      const parsed = JSON.parse(ADOPTED_TEXTS_FALLBACK);
      expect(parsed).toHaveProperty('texts');
      expect(Array.isArray(parsed.texts)).toBe(true);
    });

    it('SERVER_HEALTH_FALLBACK JSON contains server field', () => {
      const parsed = JSON.parse(SERVER_HEALTH_FALLBACK);
      expect(parsed).toHaveProperty('server');
    });
  });
});
