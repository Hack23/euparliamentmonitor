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
  parseEPEvents,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  buildWeekAheadContent,
  buildKeywords,
  buildStakeholderImpactMatrix,
  computeWeekPoliticalTemperature,
} from '../../scripts/generators/news-enhanced.js';
import {
  ALL_LANGUAGES,
  getLocalizedString,
  WEEK_AHEAD_STRINGS,
  WEEK_AHEAD_STAKEHOLDER_STRINGS,
} from '../../scripts/constants/languages.js';

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
            {
              date: '2026-03-03',
              title: 'Plenary Session',
              type: 'Plenary',
              description: 'Budget debate',
            },
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
      const result = parsePlenarySessions({ status: 'fulfilled', value: {} }, DATE_RANGE.start);
      expect(result).toEqual([]);
    });
  });

  describe('parseEPEvents', () => {
    it('should return events from a fulfilled MCP result', () => {
      const result = parseEPEvents(
        fulfilled({
          events: [
            {
              date: '2026-03-03',
              title: 'AI Act Hearing',
              type: 'Hearing',
              description: 'Public hearing on AI regulation',
            },
          ],
        }),
        DATE_RANGE.start
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('AI Act Hearing');
      expect(result[0].type).toBe('Hearing');
      expect(result[0].date).toBe('2026-03-03');
    });

    it('should use fallback date when event has no date', () => {
      const result = parseEPEvents(
        fulfilled({ events: [{ title: 'Conference', type: 'Conference' }] }),
        DATE_RANGE.start
      );
      expect(result[0].date).toBe(DATE_RANGE.start);
    });

    it('should use default title when event has none', () => {
      const result = parseEPEvents(
        fulfilled({ events: [{ date: '2026-03-03' }] }),
        DATE_RANGE.start
      );
      expect(result[0].title).toBe('EP Event');
    });

    it('should return empty array for rejected result', () => {
      const result = parseEPEvents(rejected(), DATE_RANGE.start);
      expect(result).toEqual([]);
    });

    it('should return empty array when events array is absent', () => {
      const result = parseEPEvents(fulfilled({}), DATE_RANGE.start);
      expect(result).toEqual([]);
    });

    it('should return empty array for invalid JSON', () => {
      const result = parseEPEvents(
        { status: 'fulfilled', value: { content: [{ type: 'text', text: 'not-json' }] } },
        DATE_RANGE.start
      );
      expect(result).toEqual([]);
    });

    it('should return empty array when no content text', () => {
      const result = parseEPEvents({ status: 'fulfilled', value: {} }, DATE_RANGE.start);
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
            {
              id: 'DOC-001',
              title: 'Climate Regulation',
              type: 'REGULATION',
              status: 'In progress',
            },
          ],
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Climate Regulation');
      expect(result[0].type).toBe('REGULATION');
    });

    it('should use "Untitled Document" when title absent', () => {
      const result = parseLegislativeDocuments(fulfilled({ documents: [{ id: 'DOC-002' }] }));
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
          procedures: [{ id: 'PROC-001', title: 'AI Act', stage: 'Trilogue', bottleneck: true }],
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('AI Act');
      expect(result[0].bottleneck).toBe(true);
    });

    it('should use "Unnamed Procedure" when title absent', () => {
      const result = parseLegislativePipeline(fulfilled({ procedures: [{ id: 'PROC-002' }] }));
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
          {
            date: '2026-03-03',
            title: '<script>alert("xss")</script>',
            type: 'Plenary',
            description: '',
          },
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
      const keywords = buildKeywords({
        events: [],
        committees: [],
        documents: [],
        pipeline: [],
        questions: [],
      });
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
      const keywords = buildKeywords({
        events: [],
        committees: [],
        documents: [],
        pipeline: [],
        questions: [],
      });
      expect(keywords).not.toContain('legislative pipeline');
      expect(keywords).not.toContain('parliamentary questions');
    });
  });
});

describe('week-ahead editorial quality', () => {
  function emptyWeekData() {
    return { events: [], committees: [], documents: [], pipeline: [], questions: [] };
  }

  it('should include "Why This Matters" section in every article', () => {
    const html = buildWeekAheadContent(emptyWeekData(), { start: '2026-03-01', end: '2026-03-08' });
    expect(html).toContain('why-this-matters');
    expect(html).toContain('Why This Matters');
  });

  it('should include source attribution in "Why This Matters" section', () => {
    const html = buildWeekAheadContent(emptyWeekData(), { start: '2026-03-01', end: '2026-03-08' });
    expect(html).toContain('Parliamentary Context');
    expect(html).toContain('According to European Parliament data');
  });

  it('should include committee count in lede when committees are present', () => {
    const weekData = {
      ...emptyWeekData(),
      committees: [
        { committee: 'ENVI', date: '2026-03-04' },
        { committee: 'ECON', date: '2026-03-05' },
      ],
    };
    const html = buildWeekAheadContent(weekData, { start: '2026-03-01', end: '2026-03-08' });
    expect(html).toContain('2 committee meetings are scheduled');
  });

  it('should use singular form for single committee meeting', () => {
    const weekData = {
      ...emptyWeekData(),
      committees: [{ committee: 'ENVI', date: '2026-03-04' }],
    };
    const html = buildWeekAheadContent(weekData, { start: '2026-03-01', end: '2026-03-08' });
    expect(html).toContain('1 committee meeting is scheduled');
  });

  it('should use localized editorial strings for Swedish', () => {
    const html = buildWeekAheadContent(
      emptyWeekData(),
      { start: '2026-03-01', end: '2026-03-08' },
      'sv'
    );
    expect(html).toContain('Varför Det Spelar Roll');
  });
});

describe('week-ahead multi-language section headings', () => {
  function emptyWeekData() {
    return {
      events: [],
      committees: [{ committee: 'ENVI', date: '2026-03-04' }],
      documents: [{ title: 'Test Doc', type: 'Report' }],
      pipeline: [{ title: 'Test Proc', stage: 'Committee' }],
      questions: [{ subject: 'Test Q', type: 'WRITTEN' }],
      velocities: [],
    };
  }

  it('should use localized section headings for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(WEEK_AHEAD_STRINGS, lang);
      const html = buildWeekAheadContent(
        emptyWeekData(),
        { start: '2026-03-01', end: '2026-03-08' },
        lang
      );
      expect(html).toContain(strings.plenarySessions);
      expect(html).toContain(strings.committeeMeetings);
      expect(html).toContain(strings.legislativeDocuments);
      expect(html).toContain(strings.legislativePipeline);
      expect(html).toContain(strings.parliamentaryQuestions);
    }
  });

  it('should use localized no-plenary message when events are empty', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(WEEK_AHEAD_STRINGS, lang);
      const data = {
        events: [],
        committees: [],
        documents: [],
        pipeline: [],
        questions: [],
        velocities: [],
      };
      const html = buildWeekAheadContent(data, { start: '2026-03-01', end: '2026-03-08' }, lang);
      expect(html).toContain(strings.noPlenary);
    }
  });

  it('should use Japanese section headings', () => {
    const html = buildWeekAheadContent(
      emptyWeekData(),
      { start: '2026-03-01', end: '2026-03-08' },
      'ja'
    );
    expect(html).toContain('本会議');
    expect(html).toContain('委員会会合');
    expect(html).toContain('今後の立法文書');
    expect(html).toContain('立法パイプライン');
    expect(html).toContain('議会質問');
  });

  it('should use Korean section headings', () => {
    const html = buildWeekAheadContent(
      emptyWeekData(),
      { start: '2026-03-01', end: '2026-03-08' },
      'ko'
    );
    expect(html).toContain('본회의');
    expect(html).toContain('위원회 회의');
    expect(html).toContain('예정된 입법 문서');
    expect(html).toContain('입법 파이프라인');
    expect(html).toContain('의회 질문');
  });

  it('should use Chinese section headings', () => {
    const html = buildWeekAheadContent(
      emptyWeekData(),
      { start: '2026-03-01', end: '2026-03-08' },
      'zh'
    );
    expect(html).toContain('全体会议');
    expect(html).toContain('委员会会议');
    expect(html).toContain('即将发布的立法文件');
    expect(html).toContain('立法管道');
    expect(html).toContain('议会质询');
  });

  it('should have WEEK_AHEAD_STRINGS for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(WEEK_AHEAD_STRINGS, lang);
      expect(strings.plenarySessions).toBeDefined();
      expect(strings.plenarySessions.length).toBeGreaterThan(0);
      expect(strings.committeeMeetings).toBeDefined();
      expect(strings.legislativeDocuments).toBeDefined();
      expect(strings.legislativePipeline).toBeDefined();
      expect(strings.parliamentaryQuestions).toBeDefined();
      expect(strings.noPlenary).toBeDefined();
      expect(strings.lede).toBeDefined();
    }
  });
});

describe('buildStakeholderImpactMatrix', () => {
  it('should return empty rows when no events or documents', () => {
    const result = buildStakeholderImpactMatrix([], []);
    expect(result.rows).toHaveLength(0);
  });

  it('should include political groups when events are present', () => {
    const events = [{ date: '2026-03-03', title: 'Plenary', type: 'Session', description: '' }];
    const result = buildStakeholderImpactMatrix(events, []);
    expect(result.rows.some((r) => r.stakeholder === 'Political Groups')).toBe(true);
  });

  it('should include civil society when documents are present', () => {
    const docs = [{ title: 'Climate Regulation' }];
    const result = buildStakeholderImpactMatrix([], docs);
    expect(result.rows.some((r) => r.stakeholder === 'Civil Society')).toBe(true);
  });

  it('should assign high impact to political groups with 3+ events', () => {
    const events = [
      { date: '2026-03-03', title: 'Session 1', type: 'Plenary', description: '' },
      { date: '2026-03-04', title: 'Session 2', type: 'Plenary', description: '' },
      { date: '2026-03-05', title: 'Session 3', type: 'Plenary', description: '' },
    ];
    const result = buildStakeholderImpactMatrix(events, []);
    const pgRow = result.rows.find((r) => r.stakeholder === 'Political Groups');
    expect(pgRow).toBeDefined();
    expect(pgRow.impact).toBe('high');
  });

  it('should assign medium impact to political groups with fewer than 3 events', () => {
    const events = [{ date: '2026-03-03', title: 'Session 1', type: 'Plenary', description: '' }];
    const result = buildStakeholderImpactMatrix(events, []);
    const pgRow = result.rows.find((r) => r.stakeholder === 'Political Groups');
    expect(pgRow).toBeDefined();
    expect(pgRow.impact).toBe('medium');
  });

  it('should include EU Citizens, EU Institutions and National Governments rows', () => {
    const events = [{ date: '2026-03-03', title: 'Plenary', type: 'Session', description: '' }];
    const docs = [{ title: 'Test Doc' }];
    const result = buildStakeholderImpactMatrix(events, docs);
    expect(result.rows.some((r) => r.stakeholder === 'EU Citizens')).toBe(true);
    expect(result.rows.some((r) => r.stakeholder === 'EU Institutions')).toBe(true);
    expect(result.rows.some((r) => r.stakeholder === 'National Governments')).toBe(true);
  });

  it('should include industry row when events or documents are present', () => {
    const events = [{ date: '2026-03-03', title: 'Session 1', type: 'Plenary', description: '' }];
    const result = buildStakeholderImpactMatrix(events, []);
    expect(result.rows.some((r) => r.stakeholder === 'Industry')).toBe(true);
  });
});

describe('computeWeekPoliticalTemperature', () => {
  it('should return score 0 when no events or questions', () => {
    const result = computeWeekPoliticalTemperature([], []);
    expect(result.score).toBe(0);
    expect(result.band).toBe('low');
  });

  it('should increase score with more events', () => {
    const events = [
      { date: '2026-03-03', title: 'Session 1', type: 'Plenary', description: '' },
      { date: '2026-03-04', title: 'Session 2', type: 'Plenary', description: '' },
      { date: '2026-03-05', title: 'Session 3', type: 'Committee', description: '' },
    ];
    const result = computeWeekPoliticalTemperature(events, []);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should increase score with more questions', () => {
    const questions = [
      { subject: 'Climate', type: 'WRITTEN' },
      { subject: 'AI Policy', type: 'ORAL' },
    ];
    const result = computeWeekPoliticalTemperature([], questions);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should award diversity bonus for distinct event types', () => {
    const singleType = [
      { date: '2026-03-03', title: 'S1', type: 'Plenary', description: '' },
      { date: '2026-03-04', title: 'S2', type: 'Plenary', description: '' },
    ];
    const multiType = [
      { date: '2026-03-03', title: 'S1', type: 'Plenary', description: '' },
      { date: '2026-03-04', title: 'S2', type: 'Committee', description: '' },
    ];
    const scoreSingle = computeWeekPoliticalTemperature(singleType, []);
    const scoreMulti = computeWeekPoliticalTemperature(multiType, []);
    expect(scoreMulti.score).toBeGreaterThan(scoreSingle.score);
  });

  it('should cap at 100', () => {
    // 10+ events, 10+ questions, diverse types
    const events = Array.from({ length: 10 }, (_, i) => ({
      date: '2026-03-03',
      title: `Event ${i}`,
      type: `Type${i}`,
      description: '',
    }));
    const questions = Array.from({ length: 10 }, (_, i) => ({
      subject: `Q${i}`,
      type: 'WRITTEN',
    }));
    const result = computeWeekPoliticalTemperature(events, questions);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should return "Very High" label for high scores', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      date: '2026-03-03',
      title: `Event ${i}`,
      type: `Type${i}`,
      description: '',
    }));
    const questions = Array.from({ length: 6 }, (_, i) => ({
      subject: `Q${i}`,
      type: 'WRITTEN',
    }));
    const result = computeWeekPoliticalTemperature(events, questions);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.band).toBe('veryHigh');
  });
});

describe('stakeholder impact HTML integration', () => {
  function emptyWeekData() {
    return { events: [], committees: [], documents: [], pipeline: [], questions: [] };
  }

  it('should not include stakeholder section when no events or documents', () => {
    const html = buildWeekAheadContent(emptyWeekData(), { start: '2026-03-01', end: '2026-03-08' });
    expect(html).not.toContain('stakeholder-impact');
  });

  it('should include stakeholder section when events are present', () => {
    const weekData = {
      ...emptyWeekData(),
      events: [{ date: '2026-03-03', title: 'Plenary Session', type: 'Plenary', description: '' }],
    };
    const html = buildWeekAheadContent(weekData, { start: '2026-03-01', end: '2026-03-08' });
    expect(html).toContain('stakeholder-impact');
    expect(html).toContain('Stakeholder Impact Analysis');
    expect(html).toContain('political-temperature');
    expect(html).toContain('stakeholder-matrix');
  });

  it('should include stakeholder section when documents are present', () => {
    const weekData = {
      ...emptyWeekData(),
      documents: [{ title: 'Climate Regulation' }],
    };
    const html = buildWeekAheadContent(weekData, { start: '2026-03-01', end: '2026-03-08' });
    expect(html).toContain('stakeholder-impact');
    expect(html).toContain('stakeholder-matrix');
  });

  it('should escape HTML in stakeholder section to prevent XSS', () => {
    const weekData = {
      ...emptyWeekData(),
      events: [
        { date: '2026-03-03', title: '<script>xss</script>', type: 'Plenary', description: '' },
      ],
    };
    const html = buildWeekAheadContent(weekData, { start: '2026-03-01', end: '2026-03-08' });
    expect(html).not.toContain('<script>xss</script>');
    expect(html).toContain('stakeholder-impact');
  });

  it('should use localized stakeholder headings for all 14 languages', () => {
    const weekData = {
      ...emptyWeekData(),
      events: [{ date: '2026-03-03', title: 'Plenary', type: 'Plenary', description: '' }],
    };
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(WEEK_AHEAD_STAKEHOLDER_STRINGS, lang);
      const html = buildWeekAheadContent(
        weekData,
        { start: '2026-03-01', end: '2026-03-08' },
        lang
      );
      expect(html).toContain(strings.heading);
    }
  });

  it('should have WEEK_AHEAD_STAKEHOLDER_STRINGS for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(WEEK_AHEAD_STAKEHOLDER_STRINGS, lang);
      expect(strings.heading).toBeDefined();
      expect(strings.heading.length).toBeGreaterThan(0);
      expect(strings.temperatureLabel).toBeDefined();
      expect(strings.impactHeader).toBeDefined();
      expect(strings.stakeholderHeader).toBeDefined();
      expect(strings.reasonHeader).toBeDefined();
      expect(strings.tempLow).toBeDefined();
      expect(strings.tempModerate).toBeDefined();
      expect(strings.tempHigh).toBeDefined();
      expect(strings.tempVeryHigh).toBeDefined();
    }
  });

  it('should use localized temperature descriptors in HTML output', () => {
    const weekData = {
      ...emptyWeekData(),
      events: [{ date: '2026-03-03', title: 'Plenary', type: 'Plenary', description: '' }],
    };
    const frStrings = getLocalizedString(WEEK_AHEAD_STAKEHOLDER_STRINGS, 'fr');
    const html = buildWeekAheadContent(weekData, { start: '2026-03-01', end: '2026-03-08' }, 'fr');
    // With 1 event: score = 10 (event) + 5 (diversity) = 15 → Low / Faible
    expect(html).toContain(frStrings.tempLow);
  });

  it('should use "parliamentary event(s)" not "plenary event(s)" in reason string', () => {
    const events = [{ date: '2026-03-03', title: 'Session', type: 'Committee', description: '' }];
    const result = buildStakeholderImpactMatrix(events, []);
    const pgRow = result.rows.find((r) => r.stakeholder === 'Political Groups');
    expect(pgRow).toBeDefined();
    expect(pgRow.reason).toContain('parliamentary event');
    expect(pgRow.reason).not.toContain('plenary event');
  });
});
