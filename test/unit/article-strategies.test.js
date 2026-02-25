// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for article generation strategies.
 * Tests buildContent() and getMetadata() for each strategy using
 * pre-populated ArticleData payloads — no MCP calls required.
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
  prebuiltContent: '<section class="week-ahead">Plenary preview content</section>',
};

/** Minimal BreakingNewsArticleData fixture */
const breakingNewsData = {
  date: DATE,
  anomalyRaw: 'EPP defection detected',
  coalitionRaw: 'Coalition stress rising',
  reportRaw: 'High abstention rate',
  influenceRaw: '',
  prebuiltContent: '<section class="breaking">Breaking content</section>',
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

  it('buildContent returns the prebuilt content unchanged', () => {
    const content = strategy.buildContent(weekAheadData, 'en');
    expect(content).toBe(weekAheadData.prebuiltContent);
  });

  it('buildContent is the same for all languages', () => {
    const en = strategy.buildContent(weekAheadData, 'en');
    const de = strategy.buildContent(weekAheadData, 'de');
    expect(en).toBe(de);
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

  it('buildContent returns the prebuilt content unchanged', () => {
    const content = strategy.buildContent(breakingNewsData, 'en');
    expect(content).toBe(breakingNewsData.prebuiltContent);
  });

  it('buildContent is the same for all languages', () => {
    expect(strategy.buildContent(breakingNewsData, 'fr')).toBe(
      strategy.buildContent(breakingNewsData, 'sv')
    );
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

  it('buildContent is the same for all languages', () => {
    const en = strategy.buildContent(motionsData, 'en');
    const fr = strategy.buildContent(motionsData, 'fr');
    expect(en).toBe(fr);
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
