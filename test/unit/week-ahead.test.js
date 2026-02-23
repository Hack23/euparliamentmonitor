// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for week-ahead article generation helper functions
 * Tests parsePlenarySessions, parseCommitteeMeetings, parseLegislativeDocuments,
 * parseLegislativePipeline, buildWeekAheadContent, and buildKeywords
 */

import { describe, it, expect } from 'vitest';
import {
  parsePlenarySessions,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  buildWeekAheadContent,
  buildKeywords,
} from '../../scripts/generators/news-enhanced.js';

/**
 * Build a fulfilled Promise.allSettled result from a plain object
 * @param {object} payload
 * @returns {{ status: 'fulfilled', value: { content: Array<{ type: string, text: string }> } }}
 */
function fulfilled(payload) {
  return {
    status: 'fulfilled',
    value: { content: [{ type: 'text', text: JSON.stringify(payload) }] },
  };
}

/** Return a rejected Promise.allSettled result */
function rejected(reason = 'Network error') {
  return { status: 'rejected', reason };
}

/** Default date range for tests */
const DATE_RANGE = { start: '2026-03-01', end: '2026-03-08' };

describe('week-ahead helpers', () => {
  describe('parsePlenarySessions', () => {
    it('should return events from a fulfilled MCP result', () => {
      const result = parsePlenarySessions(
        fulfilled({
          sessions: [
            { date: '2026-03-03', title: 'Plenary Session', type: 'Plenary', description: 'Budget debate' },
          ],
        }),
        DATE_RANGE.start
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Plenary Session');
      expect(result[0].date).toBe('2026-03-03');
    });

    it('should use fallback date when session has no date', () => {
      const result = parsePlenarySessions(
        fulfilled({ sessions: [{ title: 'Mini Session', type: 'Plenary' }] }),
        DATE_RANGE.start
      );
      expect(result[0].date).toBe(DATE_RANGE.start);
    });

    it('should use default title when session has none', () => {
      const result = parsePlenarySessions(
        fulfilled({ sessions: [{ date: '2026-03-03' }] }),
        DATE_RANGE.start
      );
      expect(result[0].title).toBe('Parliamentary Session');
    });

    it('should return empty array for rejected result', () => {
      const result = parsePlenarySessions(rejected(), DATE_RANGE.start);
      expect(result).toEqual([]);
    });

    it('should return empty array when sessions array is absent', () => {
      const result = parsePlenarySessions(fulfilled({}), DATE_RANGE.start);
      expect(result).toEqual([]);
    });

    it('should return empty array for invalid JSON', () => {
      const result = parsePlenarySessions(
        { status: 'fulfilled', value: { content: [{ type: 'text', text: 'not-json' }] } },
        DATE_RANGE.start
      );
      expect(result).toEqual([]);
    });

    it('should return empty array when no content text', () => {
      const result = parsePlenarySessions(
        { status: 'fulfilled', value: {} },
        DATE_RANGE.start
      );
      expect(result).toEqual([]);
    });
  });

  describe('parseCommitteeMeetings', () => {
    it('should return committee meetings from a fulfilled result', () => {
      const result = parseCommitteeMeetings(
        fulfilled({
          committees: [
            { committee: 'ENVI', committeeName: 'Environment Committee', date: '2026-03-04' },
          ],
        }),
        DATE_RANGE.start
      );
      expect(result).toHaveLength(1);
      expect(result[0].committee).toBe('ENVI');
      expect(result[0].committeeName).toBe('Environment Committee');
    });

    it('should use fallback date when meeting has no date', () => {
      const result = parseCommitteeMeetings(
        fulfilled({ committees: [{ committee: 'AGRI' }] }),
        DATE_RANGE.start
      );
      expect(result[0].date).toBe(DATE_RANGE.start);
    });

    it('should use "Unknown" for committee with no name', () => {
      const result = parseCommitteeMeetings(
        fulfilled({ committees: [{ date: '2026-03-04' }] }),
        DATE_RANGE.start
      );
      expect(result[0].committee).toBe('Unknown');
    });

    it('should return empty array for rejected result', () => {
      const result = parseCommitteeMeetings(rejected(), DATE_RANGE.start);
      expect(result).toEqual([]);
    });

    it('should return empty array when committees array is absent', () => {
      const result = parseCommitteeMeetings(fulfilled({}), DATE_RANGE.start);
      expect(result).toEqual([]);
    });
  });

  describe('parseLegislativeDocuments', () => {
    it('should return documents from a fulfilled result', () => {
      const result = parseLegislativeDocuments(
        fulfilled({
          documents: [
            { id: 'DOC-001', title: 'Climate Regulation', type: 'REGULATION', status: 'In progress' },
          ],
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Climate Regulation');
      expect(result[0].type).toBe('REGULATION');
    });

    it('should use "Untitled Document" when title absent', () => {
      const result = parseLegislativeDocuments(
        fulfilled({ documents: [{ id: 'DOC-002' }] })
      );
      expect(result[0].title).toBe('Untitled Document');
    });

    it('should return empty array for rejected result', () => {
      const result = parseLegislativeDocuments(rejected());
      expect(result).toEqual([]);
    });

    it('should return empty array when documents array is absent', () => {
      const result = parseLegislativeDocuments(fulfilled({}));
      expect(result).toEqual([]);
    });
  });

  describe('parseLegislativePipeline', () => {
    it('should return procedures from a fulfilled result', () => {
      const result = parseLegislativePipeline(
        fulfilled({
          procedures: [
            { id: 'PROC-001', title: 'AI Act', stage: 'Trilogue', bottleneck: true },
          ],
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('AI Act');
      expect(result[0].bottleneck).toBe(true);
    });

    it('should use "Unnamed Procedure" when title absent', () => {
      const result = parseLegislativePipeline(
        fulfilled({ procedures: [{ id: 'PROC-002' }] })
      );
      expect(result[0].title).toBe('Unnamed Procedure');
    });

    it('should return empty array for rejected result', () => {
      const result = parseLegislativePipeline(rejected());
      expect(result).toEqual([]);
    });

    it('should return empty array when procedures array is absent', () => {
      const result = parseLegislativePipeline(fulfilled({}));
      expect(result).toEqual([]);
    });
  });

  describe('buildWeekAheadContent', () => {
    /** Create minimal week-ahead data with no entries */
    function emptyWeekData() {
      return { events: [], committees: [], documents: [], pipeline: [], questions: [] };
    }

    it('should contain the lede with date range', () => {
      const html = buildWeekAheadContent(emptyWeekData(), DATE_RANGE);
      expect(html).toContain('2026-03-01');
      expect(html).toContain('2026-03-08');
    });

    it('should show "No plenary sessions" when events array is empty', () => {
      const html = buildWeekAheadContent(emptyWeekData(), DATE_RANGE);
      expect(html).toContain('No plenary sessions scheduled for this period.');
    });

    it('should render plenary event titles in HTML', () => {
      const weekData = {
        ...emptyWeekData(),
        events: [{ date: '2026-03-03', title: 'Budget Debate', type: 'Plenary', description: '' }],
      };
      const html = buildWeekAheadContent(weekData, DATE_RANGE);
      expect(html).toContain('Budget Debate');
      expect(html).toContain('plenary-schedule');
    });

    it('should include committee-calendar section when committees present', () => {
      const weekData = {
        ...emptyWeekData(),
        committees: [{ committee: 'ENVI', date: '2026-03-04' }],
      };
      const html = buildWeekAheadContent(weekData, DATE_RANGE);
      expect(html).toContain('committee-calendar');
      expect(html).toContain('Committee Meetings');
    });

    it('should include legislative-documents section when documents present', () => {
      const weekData = {
        ...emptyWeekData(),
        documents: [{ title: 'Climate Regulation' }],
      };
      const html = buildWeekAheadContent(weekData, DATE_RANGE);
      expect(html).toContain('legislative-documents');
      expect(html).toContain('Climate Regulation');
    });

    it('should include legislative-pipeline section when pipeline present', () => {
      const weekData = {
        ...emptyWeekData(),
        pipeline: [{ title: 'AI Act', stage: 'Trilogue' }],
      };
      const html = buildWeekAheadContent(weekData, DATE_RANGE);
      expect(html).toContain('legislative-pipeline');
      expect(html).toContain('AI Act');
    });

    it('should include qa-schedule section when questions present', () => {
      const weekData = {
        ...emptyWeekData(),
        questions: [{ subject: 'Climate policy question', type: 'WRITTEN' }],
      };
      const html = buildWeekAheadContent(weekData, DATE_RANGE);
      expect(html).toContain('qa-schedule');
      expect(html).toContain('Climate policy question');
    });

    it('should escape HTML in event titles to prevent XSS', () => {
      const weekData = {
        ...emptyWeekData(),
        events: [
          { date: '2026-03-03', title: '<script>alert("xss")</script>', type: 'Plenary', description: '' },
        ],
      };
      const html = buildWeekAheadContent(weekData, DATE_RANGE);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include bottleneck indicator for stalled procedures', () => {
      const weekData = {
        ...emptyWeekData(),
        pipeline: [{ title: 'Stalled AI Act', stage: 'Committee', bottleneck: true }],
      };
      const html = buildWeekAheadContent(weekData, DATE_RANGE);
      expect(html).toContain('bottleneck');
      expect(html).toContain('Bottleneck');
    });

    it('should omit optional sections when data arrays are empty', () => {
      const html = buildWeekAheadContent(emptyWeekData(), DATE_RANGE);
      expect(html).not.toContain('committee-calendar');
      expect(html).not.toContain('legislative-documents');
      expect(html).not.toContain('legislative-pipeline');
      expect(html).not.toContain('qa-schedule');
    });
  });

  describe('buildKeywords', () => {
    it('should always include base keywords', () => {
      const keywords = buildKeywords({ events: [], committees: [], documents: [], pipeline: [], questions: [] });
      expect(keywords).toContain('European Parliament');
      expect(keywords).toContain('week ahead');
      expect(keywords).toContain('plenary');
      expect(keywords).toContain('committees');
    });

    it('should add committee names from committee meetings', () => {
      const keywords = buildKeywords({
        events: [],
        committees: [{ committee: 'ENVI', date: '2026-03-04' }],
        documents: [],
        pipeline: [],
        questions: [],
      });
      expect(keywords).toContain('ENVI');
    });

    it('should not duplicate committee names', () => {
      const keywords = buildKeywords({
        events: [],
        committees: [
          { committee: 'ENVI', date: '2026-03-04' },
          { committee: 'ENVI', date: '2026-03-05' },
        ],
        documents: [],
        pipeline: [],
        questions: [],
      });
      expect(keywords.filter((k) => k === 'ENVI')).toHaveLength(1);
    });

    it('should add "legislative pipeline" when pipeline has entries', () => {
      const keywords = buildKeywords({
        events: [],
        committees: [],
        documents: [],
        pipeline: [{ title: 'AI Act' }],
        questions: [],
      });
      expect(keywords).toContain('legislative pipeline');
    });

    it('should add "parliamentary questions" when questions has entries', () => {
      const keywords = buildKeywords({
        events: [],
        committees: [],
        documents: [],
        pipeline: [],
        questions: [{ subject: 'Climate', type: 'WRITTEN' }],
      });
      expect(keywords).toContain('parliamentary questions');
    });

    it('should not add "legislative pipeline" or "parliamentary questions" when empty', () => {
      const keywords = buildKeywords({ events: [], committees: [], documents: [], pipeline: [], questions: [] });
      expect(keywords).not.toContain('legislative pipeline');
      expect(keywords).not.toContain('parliamentary questions');
    });
  });
});
