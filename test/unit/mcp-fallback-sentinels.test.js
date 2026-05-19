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
import { IMF_FALLBACK } from '../../scripts/mcp/imf-mcp-client.js';
import { EMPTY_VOTES_FALLBACK } from '../../scripts/mcp/ep-open-data-client.js';

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

  describe('JSON fallback deep-equality snapshots', () => {
    it('EFFECTIVENESS_FALLBACK matches expected literal', () => {
      expect(JSON.parse(EFFECTIVENESS_FALLBACK)).toEqual({ effectiveness: null });
    });

    it('MEPS_FALLBACK matches expected literal', () => {
      expect(JSON.parse(MEPS_FALLBACK)).toEqual({ meps: [] });
    });

    it('DOCUMENTS_FALLBACK matches expected literal', () => {
      expect(JSON.parse(DOCUMENTS_FALLBACK)).toEqual({ documents: [] });
    });

    it('EVENTS_FALLBACK matches expected literal', () => {
      expect(JSON.parse(EVENTS_FALLBACK)).toEqual({ events: [] });
    });

    it('ACTIVITIES_FALLBACK matches expected literal', () => {
      expect(JSON.parse(ACTIVITIES_FALLBACK)).toEqual({ activities: [] });
    });

    it('ITEMS_FALLBACK matches expected literal', () => {
      expect(JSON.parse(ITEMS_FALLBACK)).toEqual({ items: [] });
    });

    it('INTELLIGENCE_FALLBACK matches expected literal', () => {
      expect(JSON.parse(INTELLIGENCE_FALLBACK)).toEqual({ analysis: null });
    });

    it('STATS_FALLBACK matches expected literal', () => {
      expect(JSON.parse(STATS_FALLBACK)).toEqual({ stats: null });
    });

    it('PROCEDURE_EVENT_FALLBACK matches expected literal', () => {
      expect(JSON.parse(PROCEDURE_EVENT_FALLBACK)).toEqual({ event: null });
    });

    it('SERVER_HEALTH_FALLBACK matches expected literal', () => {
      expect(JSON.parse(SERVER_HEALTH_FALLBACK)).toEqual({ server: null, feeds: [] });
    });

    it('ADOPTED_TEXTS_FALLBACK matches expected literal', () => {
      expect(JSON.parse(ADOPTED_TEXTS_FALLBACK)).toEqual({ texts: [] });
    });
  });

  describe('string sentinel exact values', () => {
    it('FEED_UNAVAILABLE_REASON matches expected value', () => {
      expect(FEED_UNAVAILABLE_REASON).toBe('feed unavailable');
    });

    it('CONTENT_NOT_YET_AVAILABLE_SUBSTRING matches expected value', () => {
      expect(CONTENT_NOT_YET_AVAILABLE_SUBSTRING).toBe(
        'document indexed but content not yet available'
      );
    });
  });
});

describe('IMF MCP fallback sentinel constants', () => {
  it('IMF_FALLBACK matches expected MCPToolResult literal', () => {
    expect(IMF_FALLBACK).toEqual({
      content: [{ type: 'text', text: '' }],
    });
  });
});

describe('EP Open Data fallback sentinel constants', () => {
  it('EMPTY_VOTES_FALLBACK matches expected MCPToolResult literal', () => {
    expect(EMPTY_VOTES_FALLBACK).toEqual({
      content: [{ type: 'text', text: '{"votes":[]}' }],
    });
  });

  it('EMPTY_VOTES_FALLBACK inner text parses to an empty votes array', () => {
    const text = EMPTY_VOTES_FALLBACK.content?.[0]?.text ?? '';
    expect(JSON.parse(text)).toEqual({ votes: [] });
  });
});
