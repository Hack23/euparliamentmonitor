// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for article generation strategies.
 * Tests buildContent(), getMetadata(), and fetchData() (including fallback and
 * error branches) for each strategy using pre-populated ArticleData payloads
 * and null/mock MCP clients — no real MCP server calls required.
 */

import { describe, it, expect } from 'vitest';

// ─── Imports from compiled output ────────────────────────────────────────────

import { WeekAheadStrategy } from '../../scripts/generators/strategies/week-ahead-strategy.js';
import { BreakingNewsStrategy } from '../../scripts/generators/strategies/breaking-news-strategy.js';
import {
  CommitteeReportsStrategy,
} from '../../scripts/generators/strategies/committee-reports-strategy.js';
import {
  PropositionsStrategy,
} from '../../scripts/generators/strategies/propositions-strategy.js';
import { MotionsStrategy } from '../../scripts/generators/strategies/motions-strategy.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const DATE = '2025-01-15';

/** Minimal WeekAheadArticleData fixture */
const weekAheadData = {
  date: DATE,
  dateRange: { start: '2025-01-16', end: '2025-01-23' },
  weekData: {
    events: [{ date: '2025-01-16', title: 'Plenary Session', type: 'Plenary', description: '' }],
    committees: [],
    documents: [],
    pipeline: [],
    questions: [],
  },
  keywords: ['European Parliament', 'plenary'],
};

/** WeekAheadArticleData fixture with a bottlenecked pipeline procedure */
const weekAheadDataWithPipeline = {
  ...weekAheadData,
  weekData: {
    ...weekAheadData.weekData,
    pipeline: [
      { title: 'Climate Regulation', stage: 'committee', bottleneck: true },
    ],
  },
};

/** Minimal BreakingNewsArticleData fixture */
const breakingNewsData = {
  date: DATE,
  anomalyRaw: 'EPP defection detected',
  coalitionRaw: 'Coalition stress rising',
  reportRaw: 'High abstention rate',
};

/** Minimal CommitteeReportsArticleData fixture */
const committeeReportsData = {
  date: DATE,
  committeeDataList: [
    {
      name: 'Environment Committee',
      abbreviation: 'ENVI',
      chair: 'Jane Doe',
      members: 42,
      documents: [{ title: 'Draft Report', type: 'REPORT', date: '2025-01-10' }],
      effectiveness: '85 / Rank 2',
    },
  ],
};

/** Minimal PropositionsArticleData fixture */
const propositionsData = {
  date: DATE,
  proposalsHtml:
    '<div class="proposal-card"><h3>Green Deal Directive</h3></div>',
  pipelineData: { healthScore: 0.85, throughput: 12, procRowsHtml: '' },
  procedureHtml: '',
};

/** Minimal MotionsArticleData fixture */
const motionsData = {
  date: DATE,
  dateFromStr: '2024-12-16',
  votingRecords: [
    { title: 'Budget 2025', date: DATE, result: 'Adopted', votes: { for: 400, against: 100, abstain: 50 } },
  ],
  votingPatterns: [{ group: 'EPP', cohesion: 0.9, participation: 0.95 }],
  anomalies: [{ type: 'Defection', description: 'EPP defection', severity: 'HIGH' }],
  questions: [{ author: 'MEP Smith', topic: 'Energy policy', date: DATE, status: 'PENDING' }],
};

// ─── WeekAheadStrategy tests ──────────────────────────────────────────────────

describe('WeekAheadStrategy', () => {
  const strategy = new WeekAheadStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('week-ahead');
  });

  it('declares required MCP tools', () => {
    expect(strategy.requiredMCPTools).toContain('get_plenary_sessions');
    expect(strategy.requiredMCPTools).toContain('get_committee_info');
    expect(strategy.requiredMCPTools).toContain('search_documents');
  });

  it('buildContent returns non-empty HTML for the given language', () => {
    const content = strategy.buildContent(weekAheadData, 'en');
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('buildContent returns non-empty content for multiple languages', () => {
    const en = strategy.buildContent(weekAheadData, 'en');
    const de = strategy.buildContent(weekAheadData, 'de');
    expect(typeof en).toBe('string');
    expect(en.length).toBeGreaterThan(0);
    expect(typeof de).toBe('string');
    expect(de.length).toBeGreaterThan(0);
  });

  it('buildContent injects What-to-Watch section inside .article-content when pipeline has bottleneck', () => {
    const content = strategy.buildContent(weekAheadDataWithPipeline, 'en');
    expect(content).toContain('class="what-to-watch"');
    expect(content).toContain('Climate Regulation');
    // marker is consumed during injection and must NOT appear in final HTML
    expect(content).not.toContain('<!-- /article-content -->');
    // section must appear before the final closing </div>
    const watchIdx = content.lastIndexOf('what-to-watch');
    const closingDivIdx = content.lastIndexOf('</div>');
    expect(watchIdx).toBeGreaterThan(-1);
    expect(watchIdx).toBeLessThan(closingDivIdx);
  });

  it('getMetadata returns en title containing "Week Ahead" or equivalent', () => {
    const meta = strategy.getMetadata(weekAheadData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.subtitle).toBeTruthy();
    expect(meta.category).toBe('week-ahead');
    expect(meta.keywords.length).toBeGreaterThan(0);
  });

  it('getMetadata returns different titles for different languages', () => {
    const en = strategy.getMetadata(weekAheadData, 'en');
    const de = strategy.getMetadata(weekAheadData, 'de');
    expect(en.title).not.toBe(de.title);
  });

  it('getMetadata keywords match the weekData keywords', () => {
    const meta = strategy.getMetadata(weekAheadData, 'en');
    expect(meta.keywords).toContain('European Parliament');
  });
});

// ─── BreakingNewsStrategy tests ───────────────────────────────────────────────

describe('BreakingNewsStrategy', () => {
  const strategy = new BreakingNewsStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('breaking');
  });

  it('declares required MCP tools', () => {
    expect(strategy.requiredMCPTools).toContain('detect_voting_anomalies');
    expect(strategy.requiredMCPTools).toContain('analyze_coalition_dynamics');
    expect(strategy.requiredMCPTools).toContain('generate_report');
  });

  it('buildContent returns non-empty HTML for the given language', () => {
    const content = strategy.buildContent(breakingNewsData, 'en');
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('buildContent returns valid content for multiple languages', () => {
    const enContent = strategy.buildContent(breakingNewsData, 'en');
    const frContent = strategy.buildContent(breakingNewsData, 'fr');
    expect(typeof enContent).toBe('string');
    expect(enContent).toBeTruthy();
    expect(typeof frContent).toBe('string');
    expect(frContent).toBeTruthy();
  });

  it('getMetadata en has title and "breaking" category', () => {
    const meta = strategy.getMetadata(breakingNewsData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.category).toBe('breaking');
    expect(meta.keywords).toContain('breaking news');
  });

  it('getMetadata differs by language', () => {
    const en = strategy.getMetadata(breakingNewsData, 'en');
    const de = strategy.getMetadata(breakingNewsData, 'de');
    expect(en.title).not.toBe(de.title);
  });
});

// ─── CommitteeReportsStrategy tests ──────────────────────────────────────────

describe('CommitteeReportsStrategy', () => {
  const strategy = new CommitteeReportsStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('committee-reports');
  });

  it('declares required MCP tools', () => {
    expect(strategy.requiredMCPTools).toContain('get_committee_info');
    expect(strategy.requiredMCPTools).toContain('search_documents');
    expect(strategy.requiredMCPTools).toContain('analyze_legislative_effectiveness');
  });

  it('buildContent renders committee name and abbreviation', () => {
    const content = strategy.buildContent(committeeReportsData, 'en');
    expect(content).toContain('Environment Committee');
    expect(content).toContain('ENVI');
    expect(content).toContain('Jane Doe');
  });

  it('buildContent renders document title', () => {
    const content = strategy.buildContent(committeeReportsData, 'en');
    expect(content).toContain('Draft Report');
  });

  it('buildContent shows "No recent documents available" when empty', () => {
    const data = { ...committeeReportsData, committeeDataList: [
      { name: 'Test', abbreviation: 'TEST', chair: 'N/A', members: 0, documents: [], effectiveness: null },
    ]};
    const content = strategy.buildContent(data, 'en');
    expect(content).toContain('No recent documents available');
  });

  it('buildContent escapes HTML in committee name', () => {
    const data = { ...committeeReportsData, committeeDataList: [
      { name: '<script>alert(1)</script>', abbreviation: 'XSS', chair: 'N/A', members: 0, documents: [], effectiveness: null },
    ]};
    const content = strategy.buildContent(data, 'en');
    expect(content).not.toContain('<script>');
  });

  it('getMetadata returns "committee-reports" category', () => {
    const meta = strategy.getMetadata(committeeReportsData, 'en');
    expect(meta.category).toBe('committee-reports');
    expect(meta.title).toBeTruthy();
    expect(meta.keywords).toContain('committee');
  });

  it('getMetadata includes EP source reference', () => {
    const meta = strategy.getMetadata(committeeReportsData, 'en');
    expect(meta.sources).toBeDefined();
    expect(meta.sources?.length).toBeGreaterThan(0);
    expect(meta.sources?.[0]?.url).toContain('europarl.europa.eu');
  });
});

// ─── PropositionsStrategy tests ───────────────────────────────────────────────

describe('PropositionsStrategy', () => {
  const strategy = new PropositionsStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('propositions');
  });

  it('declares required MCP tools', () => {
    expect(strategy.requiredMCPTools).toContain('search_documents');
    expect(strategy.requiredMCPTools).toContain('monitor_legislative_pipeline');
    expect(strategy.requiredMCPTools).toContain('track_legislation');
  });

  it('buildContent en includes localized lede text', () => {
    const content = strategy.buildContent(propositionsData, 'en');
    expect(content).toContain('lede');
    expect(content.length).toBeGreaterThan(50);
  });

  it('buildContent renders proposals HTML', () => {
    const content = strategy.buildContent(propositionsData, 'en');
    expect(content).toContain('Green Deal Directive');
  });

  it('buildContent differs by language (uses localized strings)', () => {
    const en = strategy.buildContent(propositionsData, 'en');
    const de = strategy.buildContent(propositionsData, 'de');
    expect(en).not.toBe(de);
  });

  it('buildContent handles null pipelineData gracefully', () => {
    const data = { ...propositionsData, pipelineData: null };
    const content = strategy.buildContent(data, 'en');
    expect(content).not.toContain('pipeline-metrics');
  });

  it('getMetadata returns "propositions" category', () => {
    const meta = strategy.getMetadata(propositionsData, 'en');
    expect(meta.category).toBe('propositions');
    expect(meta.title).toBeTruthy();
    expect(meta.keywords).toContain('legislation');
  });
});

// ─── MotionsStrategy tests ────────────────────────────────────────────────────

describe('MotionsStrategy', () => {
  const strategy = new MotionsStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('motions');
  });

  it('declares required MCP tools', () => {
    expect(strategy.requiredMCPTools).toContain('get_voting_records');
    expect(strategy.requiredMCPTools).toContain('analyze_voting_patterns');
    expect(strategy.requiredMCPTools).toContain('detect_voting_anomalies');
    expect(strategy.requiredMCPTools).toContain('get_parliamentary_questions');
  });

  it('buildContent renders voting record title', () => {
    const content = strategy.buildContent(motionsData, 'en');
    expect(content).toContain('Budget 2025');
  });

  it('buildContent renders voting patterns', () => {
    const content = strategy.buildContent(motionsData, 'en');
    expect(content).toContain('EPP');
  });

  it('buildContent renders anomaly type', () => {
    const content = strategy.buildContent(motionsData, 'en');
    expect(content).toContain('Defection');
  });

  it('buildContent renders parliamentary question author', () => {
    const content = strategy.buildContent(motionsData, 'en');
    expect(content).toContain('MEP Smith');
  });

  it('buildContent differs by language', () => {
    const en = strategy.buildContent(motionsData, 'en');
    const fr = strategy.buildContent(motionsData, 'fr');
    expect(en).not.toBe(fr);
  });

  it('buildContent injects Political Alignment section inside .article-content when voting records are present', () => {
    const content = strategy.buildContent(motionsData, 'en');
    expect(content).toContain('class="political-alignment"');
    expect(content).toContain('Budget 2025');
    // marker is consumed during injection and must NOT appear in final HTML
    expect(content).not.toContain('<!-- /article-content -->');
    // section must appear before the final closing </div>
    const alignIdx = content.lastIndexOf('political-alignment');
    const closingDivIdx = content.lastIndexOf('</div>');
    expect(alignIdx).toBeGreaterThan(-1);
    expect(alignIdx).toBeLessThan(closingDivIdx);
  });

  it('getMetadata returns "motions" category', () => {
    const meta = strategy.getMetadata(motionsData, 'en');
    expect(meta.category).toBe('motions');
    expect(meta.title).toBeTruthy();
    expect(meta.keywords).toContain('motions');
  });

  it('getMetadata differs by language', () => {
    const en = strategy.getMetadata(motionsData, 'en');
    const de = strategy.getMetadata(motionsData, 'de');
    expect(en.title).not.toBe(de.title);
  });
});

// ─── Strategy interface contract tests ───────────────────────────────────────

describe('ArticleStrategy interface contract', () => {
  const strategies = [
    { name: 'WeekAheadStrategy', instance: new WeekAheadStrategy(), data: weekAheadData },
    { name: 'BreakingNewsStrategy', instance: new BreakingNewsStrategy(), data: breakingNewsData },
    {
      name: 'CommitteeReportsStrategy',
      instance: new CommitteeReportsStrategy(),
      data: committeeReportsData,
    },
    { name: 'PropositionsStrategy', instance: new PropositionsStrategy(), data: propositionsData },
    { name: 'MotionsStrategy', instance: new MotionsStrategy(), data: motionsData },
  ];

  for (const { name, instance, data } of strategies) {
    describe(name, () => {
      it('has a non-empty type string', () => {
        expect(typeof instance.type).toBe('string');
        expect(instance.type.length).toBeGreaterThan(0);
      });

      it('has a non-empty requiredMCPTools array', () => {
        expect(Array.isArray(instance.requiredMCPTools)).toBe(true);
        expect(instance.requiredMCPTools.length).toBeGreaterThan(0);
      });

      it('buildContent returns a non-empty string for "en"', () => {
        const content = instance.buildContent(data, 'en');
        expect(typeof content).toBe('string');
        expect(content.length).toBeGreaterThan(0);
      });

      it('getMetadata returns valid metadata for "en"', () => {
        const meta = instance.getMetadata(data, 'en');
        expect(typeof meta.title).toBe('string');
        expect(typeof meta.subtitle).toBe('string');
        expect(typeof meta.category).toBe('string');
        expect(Array.isArray(meta.keywords)).toBe(true);
        expect(meta.title.length).toBeGreaterThan(0);
      });

      it('fetchData is an async function', () => {
        expect(typeof instance.fetchData).toBe('function');
      });
    });
  }
});

// ─── Strategy.fetchData(null, date) tests ─────────────────────────────────────

describe('WeekAheadStrategy.fetchData with null client', () => {
  it('returns valid payload with placeholder events when client is null', async () => {
    const strategy = new WeekAheadStrategy();
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.dateRange).toHaveProperty('start');
    expect(data.dateRange).toHaveProperty('end');
    expect(Array.isArray(data.weekData.events)).toBe(true);
    expect(data.weekData.events.length).toBeGreaterThan(0);
    expect(Array.isArray(data.weekData.committees)).toBe(true);
    expect(Array.isArray(data.weekData.documents)).toBe(true);
  });

  it('keywords array is non-empty', async () => {
    const strategy = new WeekAheadStrategy();
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(Array.isArray(data.keywords)).toBe(true);
    expect(data.keywords.length).toBeGreaterThan(0);
  });
});

describe('BreakingNewsStrategy.fetchData with null client', () => {
  it('returns empty strings for all raw fields when client is null', async () => {
    const strategy = new BreakingNewsStrategy();
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.anomalyRaw).toBe('');
    expect(data.coalitionRaw).toBe('');
    expect(data.reportRaw).toBe('');
  });
});

describe('CommitteeReportsStrategy.fetchData with null client', () => {
  it('returns committeeDataList with default entries when client is null', async () => {
    const strategy = new CommitteeReportsStrategy();
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(Array.isArray(data.committeeDataList)).toBe(true);
    expect(data.committeeDataList.length).toBeGreaterThan(0);
    // each item should have the committee fields
    const first = data.committeeDataList[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('abbreviation');
    expect(first).toHaveProperty('documents');
  });
});

describe('PropositionsStrategy.fetchData with null client', () => {
  it('returns empty proposals and null pipeline when client is null', async () => {
    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.proposalsHtml).toBe('');
    expect(data.pipelineData).toBeNull();
    expect(data.procedureHtml).toBe('');
  });
});

describe('MotionsStrategy.fetchData with null client', () => {
  it('returns fallback data with placeholder arrays when client is null', async () => {
    const strategy = new MotionsStrategy();
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(typeof data.dateFromStr).toBe('string');
    expect(data.dateFromStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Array.isArray(data.votingRecords)).toBe(true);
    expect(Array.isArray(data.votingPatterns)).toBe(true);
    expect(Array.isArray(data.anomalies)).toBe(true);
    expect(Array.isArray(data.questions)).toBe(true);
    // fallback should have at least one item each
    expect(data.votingRecords.length).toBeGreaterThan(0);
  });

  it('dateFromStr is 30 days before date', async () => {
    const strategy = new MotionsStrategy();
    const data = await strategy.fetchData(null, '2025-02-01');
    const dateFrom = new Date(data.dateFromStr);
    const dateEnd = new Date('2025-02-01');
    const diffDays = (dateEnd - dateFrom) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(30);
  });
});

// ─── Strategy.fetchData with mock client (covers if(client) true branches) ────

/**
 * Minimal mock MCP client — all methods return undefined so all fetch
 * functions see a non-null client but get empty/undefined responses.
 */
const mockClientEmpty = {
  callTool: async () => undefined,
  getPlenarySessions: async () => undefined,
  getCommitteeInfo: async () => undefined,
  searchDocuments: async () => undefined,
  monitorLegislativePipeline: async () => undefined,
  getParliamentaryQuestions: async () => undefined,
  trackLegislation: async () => undefined,
};

describe('BreakingNewsStrategy.fetchData with mock client', () => {
  it('returns empty raw strings when client returns undefined', async () => {
    const strategy = new BreakingNewsStrategy();
    const data = await strategy.fetchData(mockClientEmpty, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.anomalyRaw).toBe('');
    expect(data.coalitionRaw).toBe('');
    expect(data.reportRaw).toBe('');
  });
});

describe('PropositionsStrategy.fetchData with mock client', () => {
  it('returns empty proposals when client returns undefined', async () => {
    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(mockClientEmpty, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.proposalsHtml).toBe('');
    expect(data.pipelineData).toBeNull();
  });
});

describe('WeekAheadStrategy — error branch', () => {
  it('fetchData throws on invalid date input', async () => {
    const strategy = new WeekAheadStrategy();
    // 'invalid-date' produces NaN-based ISO that may fail the parts check
    // or V8's Date may produce 'Invalid Date'
    await expect(strategy.fetchData(null, 'not-a-date')).rejects.toThrow();
  });
});
