// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for motions content builder
 * Tests generateMotionsContent() with mock MCP data and fallback paths
 */

import { describe, it, expect } from 'vitest';
import {
  generateMotionsContent,
  getMotionsFallbackData,
  PLACEHOLDER_MARKER,
} from '../../scripts/generators/news-enhanced.js';
import { MOTIONS_TITLES, ALL_LANGUAGES, getLocalizedString, MOTIONS_STRINGS } from '../../scripts/constants/languages.js';

const DATE_STR = '2025-01-15';
const DATE_FROM_STR = '2024-12-16';

describe('Motions Generator', () => {
  describe('getMotionsFallbackData', () => {
    it('should return placeholder-marked data when MCP is unavailable', () => {
      const fallback = getMotionsFallbackData(DATE_STR, DATE_FROM_STR);
      expect(fallback.votingRecords.length).toBeGreaterThan(0);
      expect(fallback.votingPatterns.length).toBeGreaterThan(0);
      expect(fallback.anomalies.length).toBeGreaterThan(0);
      expect(fallback.questions.length).toBeGreaterThan(0);
    });

    it('should mark voting record results as data unavailable', () => {
      const fallback = getMotionsFallbackData(DATE_STR, DATE_FROM_STR);
      for (const record of fallback.votingRecords) {
        expect(record.result).toBe(PLACEHOLDER_MARKER);
        expect(record.votes.for).toBe(0);
        expect(record.votes.against).toBe(0);
        expect(record.votes.abstain).toBe(0);
      }
    });

    it('should use generic placeholder names for MEPs', () => {
      const fallback = getMotionsFallbackData(DATE_STR, DATE_FROM_STR);
      for (const q of fallback.questions) {
        expect(q.author).toMatch(/^Placeholder MEP/);
        expect(q.status).toBe(PLACEHOLDER_MARKER);
      }
    });

    it('should use clearly synthetic group names', () => {
      const fallback = getMotionsFallbackData(DATE_STR, DATE_FROM_STR);
      for (const p of fallback.votingPatterns) {
        expect(p.group).toContain('placeholder');
        expect(p.cohesion).toBe(0.0);
        expect(p.participation).toBe(0.0);
      }
    });

    it('should mark anomaly as illustrative only', () => {
      const fallback = getMotionsFallbackData(DATE_STR, DATE_FROM_STR);
      expect(fallback.anomalies[0].description).toContain('illustrative placeholder content only');
    });
  });

  describe('generateMotionsContent', () => {
    const mockRecords = [
      {
        title: 'Motion on Climate Change',
        date: DATE_STR,
        result: 'Adopted',
        votes: { for: 420, against: 180, abstain: 30 },
      },
    ];
    const mockPatterns = [{ group: 'EPP', cohesion: 0.88, participation: 0.94 }];
    const mockAnomalies = [
      { type: 'Party Defection', description: 'Some EPP members voted against group', severity: 'MEDIUM' },
    ];
    const mockQuestions = [
      { author: 'Some MEP', topic: 'Climate policy questions', date: DATE_STR, status: 'ANSWERED' },
    ];

    it('should return HTML containing required section classes', () => {
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, mockRecords, mockPatterns, mockAnomalies, mockQuestions);
      expect(html).toContain('class="lede"');
      expect(html).toContain('class="voting-results"');
      expect(html).toContain('class="voting-patterns"');
      expect(html).toContain('class="anomalies"');
      expect(html).toContain('class="questions"');
    });

    it('should escape HTML in all MCP-sourced data (XSS prevention)', () => {
      const xssRecords = [
        {
          title: '<script>alert("xss")</script>',
          date: DATE_STR,
          result: '"><img onerror=alert(1)>',
          votes: { for: 0, against: 0, abstain: 0 },
        },
      ];
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, xssRecords, [], [], []);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
      // The " before > should be escaped, preventing attribute injection
      expect(html).toContain('&quot;&gt;&lt;img');
    });

    it('should include vote counts for each voting record', () => {
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, mockRecords, mockPatterns, mockAnomalies, mockQuestions);
      expect(html).toContain('Motion on Climate Change');
      expect(html).toContain('420');
      expect(html).toContain('180');
    });

    it('should include party cohesion data', () => {
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, mockRecords, mockPatterns, mockAnomalies, mockQuestions);
      expect(html).toContain('EPP');
      expect(html).toContain('88');
    });

    it('should render anomalies with safe severity class', () => {
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, mockRecords, mockPatterns, mockAnomalies, mockQuestions);
      expect(html).toContain('severity-medium');
      expect(html).toContain('Party Defection');
    });

    it('should coerce non-string severity without throwing', () => {
      const anomalyWithNumericSeverity = [
        { type: 'Low Turnout', description: 'Attendance dropped', severity: 'HIGH' },
      ];
      expect(() =>
        generateMotionsContent(DATE_FROM_STR, DATE_STR, mockRecords, mockPatterns, anomalyWithNumericSeverity, mockQuestions)
      ).not.toThrow();
    });

    it('should include parliamentary questions section', () => {
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, mockRecords, mockPatterns, mockAnomalies, mockQuestions);
      expect(html).toContain('Some MEP');
      expect(html).toContain('Climate policy questions');
    });

    it('should produce valid HTML structure (fragment check)', () => {
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, mockRecords, mockPatterns, mockAnomalies, mockQuestions);
      // generateMotionsContent returns an HTML fragment, not a full page
      expect(html).toContain('article-content');
      expect(html).not.toContain('undefined');
      expect(html).not.toContain('null');
    });

    it('should render fallback placeholder content without throwing', () => {
      const fallback = getMotionsFallbackData(DATE_STR, DATE_FROM_STR);
      expect(() =>
        generateMotionsContent(
          DATE_FROM_STR,
          DATE_STR,
          fallback.votingRecords,
          fallback.votingPatterns,
          fallback.anomalies,
          fallback.questions
        )
      ).not.toThrow();
    });

    it('should handle empty arrays gracefully', () => {
      const html = generateMotionsContent(DATE_FROM_STR, DATE_STR, [], [], [], []);
      expect(html).toContain('article-content');
      expect(html).not.toContain('undefined');
    });
  });

  describe('MOTIONS_TITLES multi-language', () => {
    it('should generate title containing the date for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const generator = getLocalizedString(MOTIONS_TITLES, lang);
        const result = generator(DATE_STR);
        expect(result.title).toBeDefined();
        expect(result.subtitle).toBeDefined();
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.subtitle.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Motions editorial quality', () => {
  const mockRecords = [
    {
      title: 'Motion on Climate',
      date: '2025-01-15',
      result: 'Adopted',
      votes: { for: 400, against: 200, abstain: 30 },
    },
  ];
  const mockPatterns = [{ group: 'EPP', cohesion: 0.88, participation: 0.94 }];
  const mockAnomalies = [{ type: 'Defection', description: 'Cross-party vote', severity: 'LOW' }];
  const mockQuestions = [{ author: 'MEP Smith', topic: 'Climate policy', date: '2025-01-15', status: 'ANSWERED' }];

  it('should include "Why This Matters" section', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions);
    expect(html).toContain('why-this-matters');
    expect(html).toContain('Why This Matters');
  });

  it('should include source attribution in lede', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions);
    expect(html).toContain('According to European Parliament data');
  });

  it('should include parliamentary context label in party cohesion section', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions);
    expect(html).toContain('Parliamentary Context');
  });

  it('should include analysis note label in anomalies section', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions);
    expect(html).toContain('Analysis Note');
  });

  it('should use localized editorial strings for French', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions, 'fr');
    expect(html).toContain('Pourquoi');
    expect(html).toContain('Constat Clé');
  });

  it('should include key takeaway in "Why This Matters" section', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions);
    expect(html).toContain('Key Finding');
  });
});

describe('Motions multi-language section headings', () => {
  const mockRecords = [
    {
      title: 'Motion on Climate',
      date: '2025-01-15',
      result: 'Adopted',
      votes: { for: 400, against: 200, abstain: 30 },
    },
  ];
  const mockPatterns = [{ group: 'EPP', cohesion: 0.88, participation: 0.94 }];
  const mockAnomalies = [{ type: 'Defection', description: 'Cross-party vote', severity: 'LOW' }];
  const mockQuestions = [{ author: 'MEP Smith', topic: 'Climate policy', date: '2025-01-15', status: 'ANSWERED' }];

  it('should use localized section headings for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(MOTIONS_STRINGS, lang);
      const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions, lang);
      expect(html).toContain(strings.votingRecordsHeading);
      expect(html).toContain(strings.partyCohesionHeading);
      expect(html).toContain(strings.anomaliesHeading);
      expect(html).toContain(strings.questionsHeading);
    }
  });

  it('should use localized labels for Japanese', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions, 'ja');
    expect(html).toContain('最近の投票記録');
    expect(html).toContain('政党結束分析');
    expect(html).toContain('検出された投票異常');
    expect(html).toContain('最近の議会質問');
    expect(html).toContain('日付');
    expect(html).toContain('賛成');
    expect(html).toContain('反対');
    expect(html).toContain('棄権');
  });

  it('should use localized labels for Korean', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions, 'ko');
    expect(html).toContain('최근 투표 기록');
    expect(html).toContain('정당 결속 분석');
    expect(html).toContain('감지된 투표 이상');
    expect(html).toContain('최근 의회 질문');
  });

  it('should use localized labels for Chinese', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions, 'zh');
    expect(html).toContain('最近投票记录');
    expect(html).toContain('政党凝聚力分析');
    expect(html).toContain('检测到的投票异常');
    expect(html).toContain('最近议会质询');
  });

  it('should use localized labels for German', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions, 'de');
    expect(html).toContain('Aktuelle Abstimmungsergebnisse');
    expect(html).toContain('Analyse der Fraktionskohäsion');
    expect(html).toContain('Erkannte Abstimmungsanomalien');
    expect(html).toContain('Aktuelle Parlamentarische Anfragen');
    expect(html).toContain('Schweregrad');
  });

  it('should use localized labels for Arabic', () => {
    const html = generateMotionsContent('2024-12-16', '2025-01-15', mockRecords, mockPatterns, mockAnomalies, mockQuestions, 'ar');
    expect(html).toContain('سجلات التصويت الأخيرة');
    expect(html).toContain('تحليل تماسك الأحزاب');
    expect(html).toContain('شذوذ التصويت المكتشف');
    expect(html).toContain('الأسئلة البرلمانية الأخيرة');
  });

  it('should have MOTIONS_STRINGS for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(MOTIONS_STRINGS, lang);
      expect(strings.votingRecordsHeading).toBeDefined();
      expect(strings.votingRecordsHeading.length).toBeGreaterThan(0);
      expect(strings.partyCohesionHeading).toBeDefined();
      expect(strings.anomaliesHeading).toBeDefined();
      expect(strings.questionsHeading).toBeDefined();
      expect(strings.lede).toBeDefined();
      expect(strings.keyTakeawayText).toBeDefined();
    }
  });
});
