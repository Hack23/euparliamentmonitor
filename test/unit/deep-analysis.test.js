// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { buildDeepAnalysisSection } from '../../scripts/generators/deep-analysis-content.js';
import {
  buildVotingAnalysis,
  buildProspectiveAnalysis,
  buildBreakingAnalysis,
  buildPropositionsAnalysis,
  buildCommitteeAnalysis,
  buildVotingSwot,
  buildProspectiveSwot,
  buildBreakingSwot,
  buildPropositionsSwot,
  buildCommitteeSwot,
  buildVotingDashboard,
  buildProspectiveDashboard,
  buildBreakingDashboard,
  buildPropositionsDashboard,
  buildCommitteeDashboard,
} from '../../scripts/generators/analysis-builders.js';
import {
  PLACEHOLDER_CHAIR,
  PLACEHOLDER_MEMBERS,
} from '../../scripts/generators/committee-helpers.js';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SAMPLE_ANALYSIS = {
  what: 'Test legislative update on the Digital Markets Act.',
  who: ['EPP Group', 'S&D Group', 'Commissioner Vestager'],
  when: ['2026-02-24: Plenary vote', '2026-02-25: Committee hearing'],
  why: 'Regulatory alignment with digital economy developments.',
  stakeholderOutcomes: [
    { actor: 'EPP Group', outcome: 'winner', reason: 'Secured key amendment' },
    { actor: 'S&D Group', outcome: 'loser', reason: 'Amendment rejected' },
    { actor: 'Greens/EFA', outcome: 'neutral', reason: 'Abstained from vote' },
  ],
  impactAssessment: {
    political: 'Shifts power balance in digital policy.',
    economic: 'New compliance requirements for tech firms.',
    social: 'Improved consumer protection.',
    legal: 'Creates binding EU-wide framework.',
    geopolitical: 'Sets global standard for digital regulation.',
  },
  actionConsequences: [
    {
      action: 'Vote on DMA Article 5',
      consequence: 'Gatekeeper obligations now enforceable',
      severity: 'high',
    },
    {
      action: 'Committee amendment rejected',
      consequence: 'Weaker sustainability provisions remain',
      severity: 'medium',
    },
  ],
  mistakes: [
    {
      actor: 'S&D leadership',
      description: 'Failed to build cross-group coalition before vote',
      alternative: 'Early engagement with Renew Europe could have secured majority',
    },
  ],
  outlook: 'Implementation will test enforcement capacity. Watch for national transposition challenges.',
};

const VOTING_RECORDS = [
  { title: 'Digital Markets Act', date: '2026-02-20', result: 'Adopted', votes: { for: 400, against: 150, abstain: 30 } },
  { title: 'Climate Budget', date: '2026-02-21', result: 'Rejected', votes: { for: 200, against: 350, abstain: 20 } },
];

const VOTING_PATTERNS = [
  { group: 'EPP', cohesion: 0.92, participation: 0.85 },
  { group: 'S&D', cohesion: 0.45, participation: 0.78 },
  { group: 'Renew', cohesion: 0.75, participation: 0.60 },
];

const VOTING_ANOMALIES = [
  { type: 'Party defection', description: 'EPP rebels voted against party line on climate', severity: 'HIGH' },
  { type: 'Unusual coalition', description: 'Left-right alliance on digital policy', severity: 'medium' },
];

const MOTIONS_QUESTIONS = [
  { author: 'MEP Schmidt', topic: 'Fiscal governance', date: '2026-02-19', status: 'pending' },
];

const WEEK_AHEAD_DATA = {
  events: [
    { date: '2026-03-01', title: 'Plenary debate on migration', type: 'Plenary', description: 'Full debate' },
    { date: '2026-03-02', title: 'Question time with Council', type: 'QA', description: '' },
  ],
  committees: [
    { committee: 'ECON', committeeName: 'Economic Affairs', date: '2026-03-01', agenda: [{ title: 'Fiscal rules' }] },
    { committee: 'LIBE', committeeName: 'Civil Liberties', date: '2026-03-02', agenda: [] },
  ],
  documents: [
    { title: 'Annual Budget Report', type: 'Report', date: '2026-03-01' },
  ],
  pipeline: [
    { title: 'Migration Pact', stage: 'trilogue', bottleneck: true },
    { title: 'Digital Services Act II', stage: 'committee', bottleneck: false },
  ],
  questions: [
    { subject: 'Foreign aid allocation', author: 'MEP Jensen', date: '2026-03-01' },
  ],
};

const COMMITTEE_DATA = [
  {
    name: 'Economic and Monetary Affairs',
    abbreviation: 'ECON',
    chair: 'Carlos Tavares',
    members: 60,
    documents: [
      { title: 'Fiscal Policy Report', type: 'Report', date: '2026-02-20' },
      { title: 'Banking Union Update', type: 'Opinion', date: '2026-02-21' },
      { title: 'MFF Review', type: 'Report', date: '2026-02-22' },
    ],
    effectiveness: '8.5/10',
  },
  {
    name: 'Civil Liberties',
    abbreviation: 'LIBE',
    chair: 'Ana Rodriguez',
    members: 55,
    documents: [],
    effectiveness: null,
  },
];

/**
 * Create placeholder committee data from the fixture. Uses the exported
 * sentinel constants so the helper stays in sync with production code.
 */
function makePlaceholderCommittees(committees = COMMITTEE_DATA) {
  return committees.map((c) => ({
    ...c,
    chair: PLACEHOLDER_CHAIR,
    members: PLACEHOLDER_MEMBERS,
    documents: [],
    effectiveness: null,
  }));
}

// ─── buildDeepAnalysisSection ────────────────────────────────────────────────

describe('deep-analysis-content', () => {
  describe('buildDeepAnalysisSection', () => {
    it('should return empty string for null analysis', () => {
      expect(buildDeepAnalysisSection(null, 'en')).toBe('');
    });

    it('should return empty string for undefined analysis', () => {
      expect(buildDeepAnalysisSection(undefined, 'en')).toBe('');
    });

    it('should produce a section with class deep-analysis', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'en');
      expect(html).toContain('class="deep-analysis"');
    });

    it('should include all 5W headings', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'en');
      expect(html).toContain('analysis-what');
      expect(html).toContain('analysis-who');
      expect(html).toContain('analysis-when');
      expect(html).toContain('analysis-why');
    });

    it('should include stakeholder section with winners and losers', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'en');
      expect(html).toContain('analysis-stakeholders');
      expect(html).toContain('stakeholder-winner');
      expect(html).toContain('stakeholder-loser');
      expect(html).toContain('stakeholder-neutral');
      expect(html).toContain('stakeholder-item');
    });

    it('should include impact grid with all 5 perspectives', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'en');
      expect(html).toContain('impact-grid');
      expect(html).toContain('impact-card');
      // All 5 impact dimensions
      expect(html).toContain('Shifts power balance');
      expect(html).toContain('compliance requirements');
      expect(html).toContain('consumer protection');
      expect(html).toContain('binding EU-wide');
      expect(html).toContain('global standard');
    });

    it('should include consequences table', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'en');
      expect(html).toContain('consequences-table');
      expect(html).toContain('severity-high');
      expect(html).toContain('severity-medium');
      expect(html).toContain('Gatekeeper obligations');
    });

    it('should include mistakes section', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'en');
      expect(html).toContain('mistake-card');
      expect(html).toContain('S&amp;D leadership');
      expect(html).toContain('mistake-alternative');
    });

    it('should include outlook section', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'en');
      expect(html).toContain('analysis-outlook');
      expect(html).toContain('enforcement capacity');
    });

    it('should escape HTML in actor names', () => {
      const analysis = {
        ...SAMPLE_ANALYSIS,
        who: ['<script>alert("xss")</script>'],
      };
      const html = buildDeepAnalysisSection(analysis, 'en');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should produce localized headings for German', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'de');
      expect(html).toContain('Vertiefte Politische Analyse');
    });

    it('should produce localized headings for Swedish', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'sv');
      expect(html).toContain('Fördjupad Politisk Analys');
    });

    it('should produce localized headings for French', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'fr');
      expect(html).toContain('Analyse Politique Approfondie');
    });

    it('should produce localized headings for Japanese', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'ja');
      expect(html).toContain('深層政治分析');
    });

    it('should handle analysis with empty arrays gracefully', () => {
      const minimal = {
        what: 'Minimal test',
        who: [],
        when: [],
        why: 'Test reason',
        stakeholderOutcomes: [],
        impactAssessment: {
          political: '',
          economic: '',
          social: '',
          legal: '',
          geopolitical: '',
        },
        actionConsequences: [],
        mistakes: [],
        outlook: '',
      };
      const html = buildDeepAnalysisSection(minimal, 'en');
      expect(html).toContain('class="deep-analysis"');
      expect(html).toContain('Minimal test');
      // Should NOT contain empty sub-sections
      expect(html).not.toContain('actor-list');
      expect(html).not.toContain('timeline-list');
    });

    it('should fall back to English for unknown language', () => {
      const html = buildDeepAnalysisSection(SAMPLE_ANALYSIS, 'xx');
      expect(html).toContain('Deep Political Analysis');
    });
  });
});

// ─── Analysis Builders ─────────────────────────────────────────────────────────

describe('analysis-builders', () => {
  describe('buildVotingAnalysis', () => {
    it('should produce a complete DeepAnalysis from voting data', () => {
      const result = buildVotingAnalysis(
        '2026-02-01',
        '2026-02-28',
        VOTING_RECORDS,
        VOTING_PATTERNS,
        VOTING_ANOMALIES,
        MOTIONS_QUESTIONS
      );
      expect(result.what).toContain('2 votes recorded');
      expect(result.what).toContain('1 adopted');
      expect(result.what).toContain('1 rejected');
      expect(result.who.length).toBeGreaterThan(0);
      expect(result.when.length).toBeGreaterThan(0);
      expect(result.why).toBeTruthy();
    });

    it('should identify high-cohesion groups as winners', () => {
      const result = buildVotingAnalysis(
        '2026-02-01', '2026-02-28',
        VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES, MOTIONS_QUESTIONS
      );
      const eppOutcome = result.stakeholderOutcomes.find((s) => s.actor === 'EPP');
      expect(eppOutcome).toBeDefined();
      expect(eppOutcome?.outcome).toBe('winner');
    });

    it('should identify low-cohesion groups as losers', () => {
      const result = buildVotingAnalysis(
        '2026-02-01', '2026-02-28',
        VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES, MOTIONS_QUESTIONS
      );
      const sdOutcome = result.stakeholderOutcomes.find((s) => s.actor === 'S&D');
      expect(sdOutcome).toBeDefined();
      expect(sdOutcome?.outcome).toBe('loser');
    });

    it('should derive consequences from voting records', () => {
      const result = buildVotingAnalysis(
        '2026-02-01', '2026-02-28',
        VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES, MOTIONS_QUESTIONS
      );
      expect(result.actionConsequences.length).toBeGreaterThan(0);
      expect(result.actionConsequences[0].action).toContain('Vote on');
    });

    it('should derive mistakes from high-severity anomalies', () => {
      const result = buildVotingAnalysis(
        '2026-02-01', '2026-02-28',
        VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES, MOTIONS_QUESTIONS
      );
      // At least one defection-type anomaly
      expect(result.mistakes.length).toBeGreaterThan(0);
    });

    it('should include anomaly count in the "what" field', () => {
      const result = buildVotingAnalysis(
        '2026-02-01', '2026-02-28',
        VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES, MOTIONS_QUESTIONS
      );
      expect(result.what).toContain('2 voting anomalies');
    });

    it('should handle empty data gracefully', () => {
      const result = buildVotingAnalysis('2026-02-01', '2026-02-28', [], [], [], []);
      expect(result.what).toContain('2026-02-01');
      expect(result.what).toContain('2026-02-28');
      expect(result.stakeholderOutcomes).toEqual([]);
      expect(result.actionConsequences).toEqual([]);
      expect(result.mistakes).toEqual([]);
    });

    it('should exclude placeholder records from actionConsequences', () => {
      const placeholderRecords = [
        { title: 'Example (placeholder)', date: '2026-02-01', result: 'DATA_UNAVAILABLE (placeholder)', votes: { for: 0, against: 0, abstain: 0 } },
      ];
      const result = buildVotingAnalysis('2026-02-01', '2026-02-28', placeholderRecords, [], [], []);
      expect(result.actionConsequences).toEqual([]);
    });

    it('should exclude placeholder anomalies from actionConsequences', () => {
      const placeholderAnomalies = [
        { type: 'Placeholder example', description: 'Illustrative placeholder only', severity: 'medium' },
      ];
      const result = buildVotingAnalysis('2026-02-01', '2026-02-28', [], [], placeholderAnomalies, []);
      expect(result.actionConsequences).toEqual([]);
    });
  });

  describe('buildProspectiveAnalysis', () => {
    it('should produce a complete DeepAnalysis from week-ahead data', () => {
      const result = buildProspectiveAnalysis(
        WEEK_AHEAD_DATA,
        { start: '2026-03-01', end: '2026-03-07' },
        'week'
      );
      expect(result.what).toContain('week ahead');
      expect(result.what).toContain('2 plenary events');
      expect(result.who.length).toBeGreaterThan(0);
      expect(result.when.length).toBeGreaterThan(0);
    });

    it('should detect bottleneck procedures', () => {
      const result = buildProspectiveAnalysis(
        WEEK_AHEAD_DATA,
        { start: '2026-03-01', end: '2026-03-07' },
        'week'
      );
      expect(result.why).toContain('bottleneck');
      expect(result.mistakes.length).toBeGreaterThan(0);
      expect(result.mistakes[0].description).toContain('Migration Pact');
    });

    it('should include events in timeline', () => {
      const result = buildProspectiveAnalysis(
        WEEK_AHEAD_DATA,
        { start: '2026-03-01', end: '2026-03-07' },
        'week'
      );
      expect(result.when.some((w) => w.includes('Plenary debate on migration'))).toBe(true);
    });

    it('should produce month label when appropriate', () => {
      const result = buildProspectiveAnalysis(
        WEEK_AHEAD_DATA,
        { start: '2026-03-01', end: '2026-03-30' },
        'month'
      );
      expect(result.what).toContain('month ahead');
    });

    it('should handle empty data gracefully', () => {
      const emptyData = { events: [], committees: [], documents: [], pipeline: [], questions: [] };
      const result = buildProspectiveAnalysis(emptyData, { start: '2026-03-01', end: '2026-03-07' }, 'week');
      expect(result.what).toContain('0 plenary events');
      expect(result.stakeholderOutcomes).toEqual([]);
    });
  });

  describe('buildBreakingAnalysis', () => {
    it('should produce analysis from feed data', () => {
      const feedData = {
        adoptedTexts: [{ id: '1', title: 'DMA Regulation', date: '2026-02-24', url: '' }],
        events: [{ id: '1', title: 'Emergency debate', date: '2026-02-24' }],
        procedures: [{ id: '1', title: 'Climate procedure', date: '2026-02-24' }],
        mepUpdates: [{ id: '1', name: 'MEP Smith', date: '2026-02-24' }],
      };
      const result = buildBreakingAnalysis('2026-02-24', feedData, '', '');
      expect(result.what).toContain('1 newly adopted texts');
      expect(result.who).toContain('Adopted: DMA Regulation (2026-02-24)');
    });

    it('should include anomaly context in why', () => {
      const result = buildBreakingAnalysis('2026-02-24', undefined, 'anomaly detected', '');
      expect(result.why).toContain('anomalies');
    });

    it('should handle undefined feedData', () => {
      const result = buildBreakingAnalysis('2026-02-24', undefined, '', '');
      expect(result.what).toContain('0 newly adopted texts');
    });

    it('should produce consequences from adopted texts', () => {
      const feedData = {
        adoptedTexts: [{ id: '1', title: 'Data Act', date: '2026-02-24', url: '' }],
        events: [],
        procedures: [],
        mepUpdates: [],
      };
      const result = buildBreakingAnalysis('2026-02-24', feedData, '', '');
      expect(result.actionConsequences.length).toBeGreaterThan(0);
      expect(result.actionConsequences[0].action).toContain('Data Act');
    });

    it('should include publish dates in all feed item references', () => {
      const feedData = {
        adoptedTexts: [{ id: '1', title: 'AI Act', date: '2026-03-04', url: '' }],
        events: [{ id: '1', title: 'Plenary debate', date: '2026-03-04' }],
        procedures: [{ id: '1', title: 'Green Deal', date: '2026-03-04' }],
        mepUpdates: [{ id: '1', name: 'MEP Jones', date: '2026-03-04' }],
      };
      const result = buildBreakingAnalysis('2026-03-04', feedData, '', '');
      // who section: adopted texts include date
      expect(result.who).toContain('Adopted: AI Act (2026-03-04)');
      // who section: MEP updates include date
      expect(result.who).toContain('MEP: MEP Jones (2026-03-04)');
      // when section: events include date
      expect(result.when).toContain('Plenary debate (2026-03-04)');
      // actionConsequences: adopted texts include date
      expect(result.actionConsequences[0].action).toContain('(2026-03-04)');
      // actionConsequences: procedures include date
      expect(result.actionConsequences[1].action).toContain('(2026-03-04)');
    });
  });

  describe('buildPropositionsAnalysis', () => {
    it('should produce analysis from pipeline data', () => {
      const pipeline = { healthScore: 0.85, throughput: 12, procRowsHtml: '' };
      const result = buildPropositionsAnalysis('<p>proposals</p>', pipeline, '2026-02-24');
      expect(result.what).toContain('85%');
      expect(result.what).toContain('Active proposals');
    });

    it('should flag low health as concerning', () => {
      const pipeline = { healthScore: 0.3, throughput: 2, procRowsHtml: '' };
      const result = buildPropositionsAnalysis('', pipeline, '2026-02-24');
      expect(result.why).toContain('congestion');
      expect(result.mistakes.length).toBeGreaterThan(0);
    });

    it('should mark high health as winner', () => {
      const pipeline = { healthScore: 0.85, throughput: 15, procRowsHtml: '' };
      const result = buildPropositionsAnalysis('<p>p</p>', pipeline, '2026-02-24');
      expect(result.stakeholderOutcomes[0].outcome).toBe('winner');
    });

    it('should handle null pipeline data', () => {
      const result = buildPropositionsAnalysis('', null, '2026-02-24');
      expect(result.what).toContain('0%');
      expect(result.outlook).toContain('weak');
    });

    it('should detect proposals from adoptedTextsHtml when proposalsHtml is empty', () => {
      const pipeline = { healthScore: 0.7, throughput: 8, procRowsHtml: '' };
      const result = buildPropositionsAnalysis('', pipeline, '2026-02-24', 'en', '<p>adopted text</p>');
      expect(result.what).toContain('Active proposals');
    });
  });

  describe('buildCommitteeAnalysis', () => {
    it('should produce analysis from committee data', () => {
      const result = buildCommitteeAnalysis(COMMITTEE_DATA, '2026-02-24');
      expect(result.what).toContain('2 committees monitored');
      expect(result.what).toContain('3 documents');
    });

    it('should include committee names in who', () => {
      const result = buildCommitteeAnalysis(COMMITTEE_DATA, '2026-02-24');
      expect(result.who.some((w) => w.includes('ECON'))).toBe(true);
      expect(result.who.some((w) => w.includes('LIBE'))).toBe(true);
    });

    it('should label active committees as winners', () => {
      const result = buildCommitteeAnalysis(COMMITTEE_DATA, '2026-02-24');
      const econOutcome = result.stakeholderOutcomes.find((s) => s.actor.includes('ECON'));
      expect(econOutcome?.outcome).toBe('winner');
    });

    it('should flag inactive committees in mistakes', () => {
      const result = buildCommitteeAnalysis(COMMITTEE_DATA, '2026-02-24');
      expect(result.mistakes.length).toBeGreaterThan(0);
      expect(result.mistakes[0].description).toContain('No recent documents');
    });

    it('should use low productivity descriptor when no committees are active', () => {
      const allInactive = COMMITTEE_DATA.map((c) => ({ ...c, documents: [] }));
      const result = buildCommitteeAnalysis(allInactive, '2026-02-24');
      expect(result.why).toContain('0% active rate');
      expect(result.why).toContain('low legislative productivity');
      expect(result.why).not.toContain('moderate');
    });

    it('should use impactPoliticalNone when no committees are active', () => {
      const baseline = buildCommitteeAnalysis(COMMITTEE_DATA, '2026-02-24');
      const allInactive = COMMITTEE_DATA.map((c) => ({ ...c, documents: [] }));
      const result = buildCommitteeAnalysis(allInactive, '2026-02-24');
      expect(result.impactAssessment.political).toContain('No committees');
      expect(result.impactAssessment.political).not.toBe(
        baseline.impactAssessment.political
      );
    });

    it('should handle empty committee list', () => {
      const result = buildCommitteeAnalysis([], '2026-02-24');
      expect(result.what).toContain('0 committees');
      expect(result.stakeholderOutcomes).toEqual([]);
    });

    it('should use whatNoData when no documents are available', () => {
      const allInactive = COMMITTEE_DATA.map((c) => ({ ...c, documents: [] }));
      const result = buildCommitteeAnalysis(allInactive, '2026-02-24');
      expect(result.what).not.toContain('documents processed');
      expect(result.what).not.toContain('committees with recent activity');
      expect(result.what).toContain('No recent documents');
    });

    it('should return null when all committees are placeholder (chair=N/A, members=0, docs=[])', () => {
      expect(buildCommitteeAnalysis(makePlaceholderCommittees(), '2026-02-24')).toBeNull();
    });
  });
});

// ─── Integration: buildDeepAnalysisSection + analysis builders ────────────────

describe('deep analysis integration', () => {
  it('should produce valid HTML when fed buildVotingAnalysis output', () => {
    const analysis = buildVotingAnalysis(
      '2026-02-01', '2026-02-28',
      VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES, MOTIONS_QUESTIONS
    );
    const html = buildDeepAnalysisSection(analysis, 'en');
    expect(html).toContain('class="deep-analysis"');
    expect(html).toContain('votes recorded');
    expect(html).toContain('impact-grid');
  });

  it('should produce valid HTML when fed buildProspectiveAnalysis output', () => {
    const analysis = buildProspectiveAnalysis(
      WEEK_AHEAD_DATA,
      { start: '2026-03-01', end: '2026-03-07' },
      'week'
    );
    const html = buildDeepAnalysisSection(analysis, 'en');
    expect(html).toContain('class="deep-analysis"');
    expect(html).toContain('week ahead');
  });

  it('should produce valid HTML when fed buildPropositionsAnalysis output', () => {
    const analysis = buildPropositionsAnalysis('<p>p</p>', { healthScore: 0.6, throughput: 8, procRowsHtml: '' }, '2026-02-24');
    const html = buildDeepAnalysisSection(analysis, 'en');
    expect(html).toContain('class="deep-analysis"');
    expect(html).toContain('pipeline');
  });

  it('should produce valid HTML when fed buildCommitteeAnalysis output', () => {
    const analysis = buildCommitteeAnalysis(COMMITTEE_DATA, '2026-02-24');
    const html = buildDeepAnalysisSection(analysis, 'en');
    expect(html).toContain('class="deep-analysis"');
    expect(html).toContain('ECON');
  });

  it('should work across all 14 supported languages', () => {
    const analysis = buildVotingAnalysis(
      '2026-02-01', '2026-02-28',
      VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES, MOTIONS_QUESTIONS
    );
    const languages = ['en', 'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh'];
    for (const lang of languages) {
      const html = buildDeepAnalysisSection(analysis, lang);
      expect(html).toContain('class="deep-analysis"');
      // Each language should produce non-empty content
      expect(html.length).toBeGreaterThan(100);
    }
  });
});

// ─── SWOT builder tests ──────────────────────────────────────────────────────

describe('SWOT builders', () => {
  describe('buildVotingSwot', () => {
    it('returns a valid SwotAnalysis without hardcoded title (uses localized heading)', () => {
      const result = buildVotingSwot(VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES);
      expect(result.title).toBeUndefined();
      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.threats.length).toBeGreaterThan(0);
    });

    it('includes high-cohesion groups in strengths', () => {
      const result = buildVotingSwot(VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES);
      const strengthTexts = result.strengths.map((s) => s.text);
      expect(strengthTexts.some((t) => t.includes('cohesion above 80%'))).toBe(true);
    });

    it('includes anomalies in weaknesses', () => {
      const result = buildVotingSwot(VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES);
      const weaknessTexts = result.weaknesses.map((w) => w.text);
      expect(weaknessTexts.some((t) => t.includes('anomalies'))).toBe(true);
    });

    it('handles empty inputs gracefully', () => {
      const result = buildVotingSwot([], [], []);
      expect(result.strengths).toEqual([]);
      expect(result.weaknesses).toEqual([]);
      expect(result.opportunities.length).toBeGreaterThan(0);
      expect(result.threats.length).toBeGreaterThan(0);
    });
  });

  describe('buildProspectiveSwot', () => {
    it('returns a valid SwotAnalysis without hardcoded title', () => {
      const result = buildProspectiveSwot(WEEK_AHEAD_DATA, 'week');
      expect(result.title).toBeUndefined();
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('includes bottleneck risk in weaknesses', () => {
      const result = buildProspectiveSwot(WEEK_AHEAD_DATA, 'week');
      const weaknessTexts = result.weaknesses.map((w) => w.text);
      expect(weaknessTexts.some((t) => t.includes('bottleneck'))).toBe(true);
    });
  });

  describe('buildBreakingSwot', () => {
    it('returns a valid SwotAnalysis with adopted texts as strengths', () => {
      const feedData = {
        adoptedTexts: [{ title: 'Tax Reform', date: '2026-01-15' }],
        events: [{ title: 'Summit', date: '2026-01-15' }],
        procedures: [],
        mepUpdates: [],
      };
      const result = buildBreakingSwot(feedData, '', '');
      expect(result.title).toBeUndefined();
      expect(result.strengths.some((s) => s.text.includes('adopted'))).toBe(true);
    });

    it('handles undefined feedData', () => {
      const result = buildBreakingSwot(undefined, '', '');
      expect(result.strengths).toEqual([]);
    });
  });

  describe('buildPropositionsSwot', () => {
    it('returns healthy pipeline as strength', () => {
      const result = buildPropositionsSwot({ healthScore: 0.8, throughput: 10 });
      expect(result.strengths.some((s) => s.text.includes('80%'))).toBe(true);
    });

    it('returns unhealthy pipeline as weakness', () => {
      const result = buildPropositionsSwot({ healthScore: 0.3, throughput: 2 });
      expect(result.weaknesses.some((w) => w.text.includes('congestion'))).toBe(true);
    });

    it('handles null pipeline data', () => {
      const result = buildPropositionsSwot(null);
      expect(result.weaknesses.length).toBeGreaterThan(0);
    });
  });

  describe('buildCommitteeSwot', () => {
    it('returns active committees as strengths', () => {
      const result = buildCommitteeSwot(COMMITTEE_DATA);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('identifies inactive committees as weaknesses', () => {
      const result = buildCommitteeSwot(COMMITTEE_DATA);
      const weaknessTexts = result.weaknesses.map((w) => w.text);
      // LIBE has 0 docs so it should appear
      expect(weaknessTexts.some((t) => t.includes('no recent document'))).toBe(true);
    });

    it('returns null when all committees are placeholder (chair=N/A, members=0, docs=[])', () => {
      expect(buildCommitteeSwot(makePlaceholderCommittees())).toBeNull();
    });
  });
});

// ─── Dashboard builder tests ─────────────────────────────────────────────────

describe('Dashboard builders', () => {
  describe('buildVotingDashboard', () => {
    it('returns a valid DashboardConfig with panels (no hardcoded title)', () => {
      const result = buildVotingDashboard(VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES);
      expect(result.title).toBeUndefined();
      expect(result.panels.length).toBeGreaterThan(0);
    });

    it('includes voting overview metrics', () => {
      const result = buildVotingDashboard(VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES);
      const overviewPanel = result.panels[0];
      expect(overviewPanel.metrics.length).toBeGreaterThan(0);
      expect(overviewPanel.metrics.some((m) => m.label === 'Total Votes')).toBe(true);
    });

    it('includes cohesion chart when patterns available', () => {
      const result = buildVotingDashboard(VOTING_RECORDS, VOTING_PATTERNS, VOTING_ANOMALIES);
      expect(result.panels.length).toBeGreaterThanOrEqual(2);
      // The cohesion panel (panel[1]) should have a bar chart
      const cohesionPanel = result.panels.find((p) => p.chart?.type === 'bar');
      expect(cohesionPanel).toBeDefined();
      expect(cohesionPanel.chart.type).toBe('bar');
    });

    it('handles empty inputs', () => {
      const result = buildVotingDashboard([], [], []);
      expect(result.panels.length).toBe(1);
    });
  });

  describe('buildProspectiveDashboard', () => {
    it('returns panels with scheduled activity metrics (no hardcoded title)', () => {
      const result = buildProspectiveDashboard(WEEK_AHEAD_DATA, 'week');
      expect(result.title).toBeUndefined();
      expect(result.panels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('buildBreakingDashboard', () => {
    it('returns panels with feed activity metrics', () => {
      const feedData = {
        adoptedTexts: [{ title: 'Tax Reform', date: '2026-01-15' }],
        events: [],
        procedures: [],
        mepUpdates: [],
      };
      const result = buildBreakingDashboard(feedData);
      expect(result.title).toBeUndefined();
      expect(result.panels[0].metrics.some((m) => m.label === 'Adopted Texts')).toBe(true);
    });

    it('handles undefined feedData', () => {
      const result = buildBreakingDashboard(undefined);
      expect(result.panels.length).toBeGreaterThan(0);
    });
  });

  describe('buildPropositionsDashboard', () => {
    it('returns pipeline health metrics', () => {
      const result = buildPropositionsDashboard({ healthScore: 0.85, throughput: 12 });
      expect(result.panels[0].metrics.some((m) => m.label === 'Health Score')).toBe(true);
      expect(result.panels[0].metrics.some((m) => m.value === '85%')).toBe(true);
    });

    it('handles null pipeline data', () => {
      const result = buildPropositionsDashboard(null);
      expect(result.panels[0].metrics.some((m) => m.value === '0%')).toBe(true);
    });
  });

  describe('buildCommitteeDashboard', () => {
    it('returns committee overview and chart (no hardcoded title)', () => {
      const result = buildCommitteeDashboard(COMMITTEE_DATA);
      expect(result.title).toBeUndefined();
      expect(result.panels.length).toBeGreaterThanOrEqual(2);
      // There should be a panel with a chart
      const chartPanel = result.panels.find((p) => p.chart !== undefined);
      expect(chartPanel).toBeDefined();
    });

    it('handles empty committee list', () => {
      const result = buildCommitteeDashboard([]);
      expect(result.panels.length).toBe(1);
    });

    it('returns null when all committees are placeholder (chair=N/A, members=0, docs=[])', () => {
      expect(buildCommitteeDashboard(makePlaceholderCommittees())).toBeNull();
    });
  });
});
