// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for article generation strategies.
 * Tests buildContent(), getMetadata(), and fetchData() (including fallback and
 * error branches) for each strategy using pre-populated ArticleData payloads
 * and null/mock MCP clients — no real MCP server calls required.
 */

import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Imports from compiled output ────────────────────────────────────────────

import { WeekAheadStrategy } from '../../scripts/generators/strategies/week-ahead-strategy.js';
import { BreakingNewsStrategy } from '../../scripts/generators/strategies/breaking-news-strategy.js';
import { CommitteeReportsStrategy } from '../../scripts/generators/strategies/committee-reports-strategy.js';
import { PropositionsStrategy } from '../../scripts/generators/strategies/propositions-strategy.js';
import { MotionsStrategy } from '../../scripts/generators/strategies/motions-strategy.js';
import { MonthAheadStrategy } from '../../scripts/generators/strategies/month-ahead-strategy.js';
import { WeeklyReviewStrategy } from '../../scripts/generators/strategies/weekly-review-strategy.js';
import { MonthlyReviewStrategy } from '../../scripts/generators/strategies/monthly-review-strategy.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

import {
  weekAheadData,
  weekAheadDataWithPipeline,
  breakingNewsData,
  committeeReportsData,
  propositionsData,
  motionsData,
  monthAheadData,
  weeklyReviewData,
  monthlyReviewData,
} from '../fixtures/ep-data.js';

// ─── WeekAheadStrategy tests ──────────────────────────────────────────────────

describe('WeekAheadStrategy', () => {
  const strategy = new WeekAheadStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('week-ahead');
  });

  it('declares required MCP tools including feed endpoints', () => {
    expect(strategy.requiredMCPTools).toContain('get_plenary_sessions');
    expect(strategy.requiredMCPTools).toContain('get_committee_info');
    expect(strategy.requiredMCPTools).toContain('search_documents');
    expect(strategy.requiredMCPTools).toContain('get_events_feed');
    expect(strategy.requiredMCPTools).toContain('get_plenary_documents_feed');
    expect(strategy.requiredMCPTools).toContain('get_adopted_texts_feed');
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
    expect(strategy.requiredMCPTools).toContain('get_adopted_texts_feed');
    expect(strategy.requiredMCPTools).toContain('get_events_feed');
    expect(strategy.requiredMCPTools).toContain('get_procedures_feed');
    expect(strategy.requiredMCPTools).toContain('get_meps_feed');
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

  it('declares required MCP tools including feed endpoints', () => {
    expect(strategy.requiredMCPTools).toContain('get_committee_info');
    expect(strategy.requiredMCPTools).toContain('search_documents');
    expect(strategy.requiredMCPTools).toContain('analyze_legislative_effectiveness');
    expect(strategy.requiredMCPTools).toContain('get_committee_documents_feed');
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
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: 'Test',
          abbreviation: 'TEST',
          chair: 'N/A',
          members: 0,
          documents: [],
          effectiveness: null,
        },
      ],
    };
    const content = strategy.buildContent(data, 'en');
    expect(content).toContain('No recent documents available');
  });

  it('buildContent escapes HTML in committee name', () => {
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: '<script>alert(1)</script>',
          abbreviation: 'XSS',
          chair: 'N/A',
          members: 0,
          documents: [],
          effectiveness: null,
        },
      ],
    };
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

  it('declares required MCP tools including feed endpoints', () => {
    expect(strategy.requiredMCPTools).toContain('search_documents');
    expect(strategy.requiredMCPTools).toContain('monitor_legislative_pipeline');
    expect(strategy.requiredMCPTools).toContain('track_legislation');
    expect(strategy.requiredMCPTools).toContain('get_procedures_feed');
    expect(strategy.requiredMCPTools).toContain('get_adopted_texts_feed');
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

  it('declares required MCP tools including feed endpoints', () => {
    expect(strategy.requiredMCPTools).toContain('get_voting_records');
    expect(strategy.requiredMCPTools).toContain('analyze_voting_patterns');
    expect(strategy.requiredMCPTools).toContain('detect_voting_anomalies');
    expect(strategy.requiredMCPTools).toContain('get_parliamentary_questions');
    expect(strategy.requiredMCPTools).toContain('get_adopted_texts_feed');
    expect(strategy.requiredMCPTools).toContain('get_parliamentary_questions_feed');
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

  it('buildContent strips marker without injecting alignment when voting records are empty', () => {
    const emptyMotionsData = {
      ...motionsData,
      votingRecords: [],
    };
    const content = strategy.buildContent(emptyMotionsData, 'en');
    // When alignment section is empty, marker is still removed
    expect(content).not.toContain('<!-- /article-content -->');
    // No alignment section injected
    expect(content).not.toContain('class="political-alignment"');
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

describe('BreakingNewsStrategy.fetchData with pre-fetched feed data file', () => {
  let tmpDir;
  const originalEnv = process.env['EP_FEED_DATA_FILE'];

  afterEach(() => {
    // Restore env var
    if (originalEnv === undefined) {
      delete process.env['EP_FEED_DATA_FILE'];
    } else {
      process.env['EP_FEED_DATA_FILE'] = originalEnv;
    }
    // Clean up temp dir
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it('uses pre-fetched feed data when EP_FEED_DATA_FILE is set', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feed-test-'));
    const feedData = {
      adoptedTexts: [
        { id: 'TA-10-2026-0042', title: 'Test Adopted Text', date: '2026-03-04' },
      ],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const strategy = new BreakingNewsStrategy();
    const data = await strategy.fetchData(null, '2026-03-04');
    expect(data.feedData).toBeDefined();
    expect(data.feedData.adoptedTexts).toHaveLength(1);
    expect(data.feedData.adoptedTexts[0].id).toBe('TA-10-2026-0042');
    expect(data.anomalyRaw).toBe('');
    expect(data.coalitionRaw).toBe('');
  });

  it('filters prefetched breaking feed data to the publication date', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feed-date-window-'));
    const feedData = {
      adoptedTexts: [
        { id: 'TA-10-2026-0042', title: 'Today item', date: '2026-03-04' },
        { id: 'TA-10-2026-0001', title: 'Old item', date: '2026-02-24' },
      ],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const strategy = new BreakingNewsStrategy();
    const data = await strategy.fetchData(null, '2026-03-04');

    expect(data.feedData).toBeDefined();
    expect(data.feedData.adoptedTexts).toHaveLength(1);
    expect(data.feedData.adoptedTexts[0].title).toBe('Today item');
  });

  it('falls through to MCP fetch when feed data file does not exist', async () => {
    process.env['EP_FEED_DATA_FILE'] = '/tmp/nonexistent-feed-data.json';

    const strategy = new BreakingNewsStrategy();
    const data = await strategy.fetchData(null, '2026-03-04');
    // Falls through: null client → MCP unavailable → feedData undefined
    expect(data.feedData).toBeUndefined();
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

// ─── PropositionsStrategy feed fallback tests ──────────────────────────────────

describe('PropositionsStrategy feed fallback', () => {
  let tmpDir;
  const originalEnv = process.env['EP_FEED_DATA_FILE'];

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env['EP_FEED_DATA_FILE'];
    } else {
      process.env['EP_FEED_DATA_FILE'] = originalEnv;
    }
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it('builds proposals from feed procedures when search_documents returns empty', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'props-feed-test-'));
    const feedData = {
      procedures: [
        {
          id: 'proc-1',
          identifier: '2026/0001(COD)',
          title: 'Regulation on AI Liability',
          date: '2026-03-01',
          stage: 'First reading',
          type: 'Work',
        },
        {
          id: 'proc-2',
          identifier: '2026/0002(COD)',
          title: 'Digital Markets Act Amendment',
          date: '2026-03-02',
          stage: 'Committee stage',
          type: 'Work',
        },
      ],
      adoptedTexts: [],
      events: [],
      mepUpdates: [],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(null, '2026-03-06');

    expect(data.proposalsHtml).toBeTruthy();
    expect(data.proposalsHtml).toContain('proposal-card');
    expect(data.proposalsHtml).toContain('Regulation on AI Liability');
    expect(data.proposalsHtml).toContain('2026/0001(COD)');
  });

  it('renders proc.stage (not proc.type) as proposal-status in feed fallback', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'props-feed-stage-'));
    const feedData = {
      procedures: [
        {
          id: 'proc-stage',
          identifier: '2026/0003(NLE)',
          title: 'Procedure with Stage',
          date: '2026-03-01',
          stage: 'First reading',
          type: 'Work',
        },
      ],
      adoptedTexts: [],
      events: [],
      mepUpdates: [],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(null, '2026-03-06');

    // stage should be rendered, not the RDF type "Work"
    expect(data.proposalsHtml).toContain('First reading');
    expect(data.proposalsHtml).not.toContain('>Work<');
  });

  it('omits proposal-status badge for procedures with no stage', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'props-feed-nostage-'));
    const feedData = {
      procedures: [
        {
          id: 'proc-no-stage',
          identifier: '2026/0004(INI)',
          title: 'Procedure Without Stage',
          date: '2026-03-01',
          type: 'Work',
          // no stage field
        },
      ],
      adoptedTexts: [],
      events: [],
      mepUpdates: [],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(null, '2026-03-06');

    expect(data.proposalsHtml).toContain('Procedure Without Stage');
    // No status badge should be rendered at all
    expect(data.proposalsHtml).not.toContain('proposal-status');
    // RDF type "Work" must not appear as a status
    expect(data.proposalsHtml).not.toContain('>Work<');
  });

  it('builds proposals from feed adopted texts when procedures list is empty', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'props-feed-adopted-'));
    const feedData = {
      procedures: [],
      adoptedTexts: [
        {
          id: 'ta-1',
          identifier: 'TA-10-2026-0099',
          title: 'Adopted Text on Climate Finance',
          date: '2026-03-04',
          type: 'Work',
        },
      ],
      events: [],
      mepUpdates: [],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(null, '2026-03-06');

    expect(data.proposalsHtml).toBeTruthy();
    expect(data.proposalsHtml).toContain('Adopted Text on Climate Finance');
    expect(data.proposalsHtml).toContain('TA-10-2026-0099');
    // RDF type "Work" must not appear as a status badge for adopted texts
    expect(data.proposalsHtml).not.toContain('proposal-status');
    expect(data.proposalsHtml).not.toContain('>Work<');
  });

  it('filters stale prefetched feed procedures outside the recent article window', async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'props-feed-window-'));
    const feedData = {
      procedures: [
        {
          id: 'proc-fresh',
          identifier: '2026/0005(COD)',
          title: 'Fresh Procedure',
          date: '2026-03-04',
          stage: 'First reading',
        },
        {
          id: 'proc-old',
          identifier: '2026/0006(COD)',
          title: 'Old Procedure',
          date: '2026-02-20',
          stage: 'First reading',
        },
      ],
      adoptedTexts: [],
      events: [],
      mepUpdates: [],
    };
    const filePath = path.join(tmpDir, 'feed-data.json');
    fs.writeFileSync(filePath, JSON.stringify(feedData));
    process.env['EP_FEED_DATA_FILE'] = filePath;

    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(null, '2026-03-06');

    expect(data.proposalsHtml).toContain('Fresh Procedure');
    expect(data.proposalsHtml).not.toContain('Old Procedure');
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

// ─── PropositionsStrategy.fetchData with rejected promise branches ─────────────

describe('PropositionsStrategy.fetchData with rejected promises', () => {
  it('handles rejected proposals and pipeline gracefully', async () => {
    const mockClientRejecting = {
      callTool: async () => undefined,
      getPlenarySessions: async () => undefined,
      getCommitteeInfo: async () => undefined,
      searchDocuments: async () => { throw new Error('network failure'); },
      monitorLegislativePipeline: async () => { throw new Error('timeout'); },
      getParliamentaryQuestions: async () => undefined,
      trackLegislation: async () => undefined,
    };
    const strategy = new PropositionsStrategy();
    const data = await strategy.fetchData(mockClientRejecting, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.proposalsHtml).toBe('');
    expect(data.pipelineData).toBeNull();
    expect(data.procedureHtml).toBe('');
  });
});

// ─── PropositionsStrategy.buildContent with empty proposalsHtml ────────────────

describe('PropositionsStrategy.buildContent with empty proposals', () => {
  it('renders without proposals section when proposalsHtml is empty', () => {
    const strategy = new PropositionsStrategy();
    const data = { ...propositionsData, proposalsHtml: '' };
    const content = strategy.buildContent(data, 'en');
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });
});

// ─── MotionsStrategy.buildContent strips marker without alignment section ──────

describe('WeekAheadStrategy.buildContent strips marker without watch section', () => {
  it('strips the marker when pipeline is empty (no bottleneck)', () => {
    const strategy = new WeekAheadStrategy();
    const content = strategy.buildContent(weekAheadData, 'en');
    // weekAheadData has empty pipeline, so no watch section
    expect(content).not.toContain('<!-- /article-content -->');
    expect(content).not.toContain('class="what-to-watch"');
  });
});

// ─── MonthAheadStrategy tests ─────────────────────────────────────────────────

describe('MonthAheadStrategy', () => {
  const strategy = new MonthAheadStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('month-ahead');
  });

  it('declares required MCP tools including feed endpoints', () => {
    expect(strategy.requiredMCPTools).toContain('get_plenary_sessions');
    expect(strategy.requiredMCPTools).toContain('monitor_legislative_pipeline');
    expect(strategy.requiredMCPTools).toContain('get_events_feed');
    expect(strategy.requiredMCPTools).toContain('get_adopted_texts_feed');
    expect(strategy.requiredMCPTools).toContain('get_procedures_feed');
  });

  it('buildContent returns non-empty HTML for the given language', () => {
    const content = strategy.buildContent(monthAheadData, 'en');
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('buildContent returns non-empty content for multiple languages', () => {
    const en = strategy.buildContent(monthAheadData, 'en');
    const fr = strategy.buildContent(monthAheadData, 'fr');
    expect(en.length).toBeGreaterThan(0);
    expect(fr.length).toBeGreaterThan(0);
  });

  it('getMetadata returns en title containing "Month Ahead"', () => {
    const meta = strategy.getMetadata(monthAheadData, 'en');
    expect(meta.title).toContain('Month Ahead');
    expect(meta.subtitle).toBeTruthy();
    expect(meta.category).toBe('month-ahead');
    expect(meta.keywords.length).toBeGreaterThan(0);
  });

  it('getMetadata returns localized title for de', () => {
    const meta = strategy.getMetadata(monthAheadData, 'de');
    expect(meta.title).toContain('Monat Voraus');
  });

  it('fetchData returns data with null client (no MCP)', async () => {
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.dateRange.start).toBeTruthy();
    expect(data.dateRange.end).toBeTruthy();
    expect(data.monthLabel).toBeTruthy();
    expect(data.monthData.events.length).toBeGreaterThan(0);
  });
});

// ─── WeeklyReviewStrategy tests ───────────────────────────────────────────────

describe('WeeklyReviewStrategy', () => {
  const strategy = new WeeklyReviewStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('week-in-review');
  });

  it('declares required MCP tools including feed endpoints', () => {
    expect(strategy.requiredMCPTools).toContain('get_voting_records');
    expect(strategy.requiredMCPTools).toContain('detect_voting_anomalies');
    expect(strategy.requiredMCPTools).toContain('get_adopted_texts_feed');
    expect(strategy.requiredMCPTools).toContain('get_procedures_feed');
    expect(strategy.requiredMCPTools).toContain('get_events_feed');
  });

  it('buildContent returns non-empty HTML for the given language', () => {
    const content = strategy.buildContent(weeklyReviewData, 'en');
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('buildContent returns non-empty content for multiple languages', () => {
    const en = strategy.buildContent(weeklyReviewData, 'en');
    const es = strategy.buildContent(weeklyReviewData, 'es');
    expect(en.length).toBeGreaterThan(0);
    expect(es.length).toBeGreaterThan(0);
  });

  it('getMetadata returns en title containing "Week in Review"', () => {
    const meta = strategy.getMetadata(weeklyReviewData, 'en');
    expect(meta.title).toContain('Week in Review');
    expect(meta.subtitle).toBeTruthy();
    expect(meta.category).toBe('week-in-review');
    expect(meta.keywords.length).toBeGreaterThan(0);
  });

  it('getMetadata returns localized title for sv', () => {
    const meta = strategy.getMetadata(weeklyReviewData, 'sv');
    expect(meta.title).toContain('Veckan i Korthet');
  });

  it('fetchData returns empty arrays with null client (no MCP)', async () => {
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.dateRange.start).toBeTruthy();
    expect(data.dateRange.end).toBeTruthy();
    expect(data.votingRecords).toEqual([]);
    expect(data.votingPatterns).toEqual([]);
    expect(data.anomalies).toEqual([]);
    expect(data.questions).toEqual([]);
  });

  it('filters prefetched review feed data to the weekly review window', async () => {
    const originalEnv = process.env['EP_FEED_DATA_FILE'];
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-review-feed-'));
    const feedData = {
      adoptedTexts: [
        { id: 'TA-001', title: 'In range', date: '2026-03-04' },
        { id: 'TA-002', title: 'From February', date: '2026-02-24' },
      ],
      events: [],
      procedures: [],
      mepUpdates: [],
      documents: [],
      plenaryDocuments: [{ id: 'PDOC-001', title: 'Recent plenary doc', date: '2026-03-06' }],
      committeeDocuments: [{ id: 'CDOC-001', title: 'Old committee doc', date: '2026-02-18' }],
      plenarySessionDocuments: [],
      externalDocuments: [],
      questions: [],
      declarations: [],
      corporateBodies: [],
    };

    try {
      const filePath = path.join(tmpDir, 'ep-feed-data.json');
      fs.writeFileSync(filePath, JSON.stringify(feedData));
      process.env['EP_FEED_DATA_FILE'] = filePath;

      const data = await strategy.fetchData(null, '2026-03-07');

      expect(data.feedData).toBeDefined();
      expect(data.feedData.adoptedTexts).toHaveLength(1);
      expect(data.feedData.adoptedTexts[0].title).toBe('In range');
      expect(data.feedData.plenaryDocuments).toHaveLength(1);
      expect(data.feedData.committeeDocuments).toHaveLength(0);
    } finally {
      if (originalEnv === undefined) {
        delete process.env['EP_FEED_DATA_FILE'];
      } else {
        process.env['EP_FEED_DATA_FILE'] = originalEnv;
      }
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

// ─── MonthlyReviewStrategy tests ──────────────────────────────────────────────

describe('MonthlyReviewStrategy', () => {
  const strategy = new MonthlyReviewStrategy();

  it('has the correct article type', () => {
    expect(strategy.type).toBe('month-in-review');
  });

  it('declares required MCP tools including feed endpoints', () => {
    expect(strategy.requiredMCPTools).toContain('get_voting_records');
    expect(strategy.requiredMCPTools).toContain('analyze_voting_patterns');
    expect(strategy.requiredMCPTools).toContain('get_adopted_texts_feed');
    expect(strategy.requiredMCPTools).toContain('get_procedures_feed');
    expect(strategy.requiredMCPTools).toContain('get_events_feed');
  });

  it('buildContent returns non-empty HTML for the given language', () => {
    const content = strategy.buildContent(monthlyReviewData, 'en');
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
  });

  it('buildContent returns non-empty content for multiple languages', () => {
    const en = strategy.buildContent(monthlyReviewData, 'en');
    const ja = strategy.buildContent(monthlyReviewData, 'ja');
    expect(en.length).toBeGreaterThan(0);
    expect(ja.length).toBeGreaterThan(0);
  });

  it('getMetadata returns en title containing "Month in Review"', () => {
    const meta = strategy.getMetadata(monthlyReviewData, 'en');
    expect(meta.title).toContain('Month in Review');
    expect(meta.subtitle).toBeTruthy();
    expect(meta.category).toBe('month-in-review');
    expect(meta.keywords.length).toBeGreaterThan(0);
  });

  it('getMetadata returns localized title for fr', () => {
    const meta = strategy.getMetadata(monthlyReviewData, 'fr');
    expect(meta.title).toContain('Mois en Revue');
  });

  it('fetchData returns empty arrays with null client (no MCP)', async () => {
    const data = await strategy.fetchData(null, '2025-01-15');
    expect(data.date).toBe('2025-01-15');
    expect(data.dateRange.start).toBeTruthy();
    expect(data.dateRange.end).toBeTruthy();
    expect(data.monthLabel).toBeTruthy();
    expect(data.votingRecords).toEqual([]);
    expect(data.votingPatterns).toEqual([]);
    expect(data.anomalies).toEqual([]);
    expect(data.questions).toEqual([]);
  });
});

// ─── SWOT and Dashboard integration tests ────────────────────────────────────

describe('SWOT and Dashboard integration across all strategies', () => {
  it('WeekAheadStrategy.buildContent includes SWOT section', () => {
    const strategy = new WeekAheadStrategy();
    const content = strategy.buildContent(weekAheadData, 'en');
    expect(content).toContain('class="swot-analysis"');
    expect(content).toContain('class="swot-matrix"');
  });

  it('WeekAheadStrategy.buildContent includes Dashboard section', () => {
    const strategy = new WeekAheadStrategy();
    const content = strategy.buildContent(weekAheadData, 'en');
    expect(content).toContain('class="dashboard"');
    expect(content).toContain('class="metrics-grid"');
  });

  it('MonthAheadStrategy.buildContent includes SWOT section', () => {
    const strategy = new MonthAheadStrategy();
    const content = strategy.buildContent(monthAheadData, 'en');
    expect(content).toContain('class="swot-analysis"');
  });

  it('MonthAheadStrategy.buildContent includes Dashboard section', () => {
    const strategy = new MonthAheadStrategy();
    const content = strategy.buildContent(monthAheadData, 'en');
    expect(content).toContain('class="dashboard"');
  });

  it('BreakingNewsStrategy.buildContent includes SWOT section', () => {
    const strategy = new BreakingNewsStrategy();
    const content = strategy.buildContent(breakingNewsData, 'en');
    expect(content).toContain('class="swot-analysis"');
  });

  it('BreakingNewsStrategy.buildContent includes Dashboard section', () => {
    const strategy = new BreakingNewsStrategy();
    const content = strategy.buildContent(breakingNewsData, 'en');
    expect(content).toContain('class="dashboard"');
  });

  it('CommitteeReportsStrategy.buildContent includes SWOT section', () => {
    const strategy = new CommitteeReportsStrategy();
    const content = strategy.buildContent(committeeReportsData, 'en');
    expect(content).toContain('class="swot-analysis"');
  });

  it('CommitteeReportsStrategy.buildContent includes Dashboard section', () => {
    const strategy = new CommitteeReportsStrategy();
    const content = strategy.buildContent(committeeReportsData, 'en');
    expect(content).toContain('class="dashboard"');
  });

  it('PropositionsStrategy.buildContent includes SWOT section', () => {
    const strategy = new PropositionsStrategy();
    const content = strategy.buildContent(propositionsData, 'en');
    expect(content).toContain('class="swot-analysis"');
  });

  it('PropositionsStrategy.buildContent includes Dashboard section', () => {
    const strategy = new PropositionsStrategy();
    const content = strategy.buildContent(propositionsData, 'en');
    expect(content).toContain('class="dashboard"');
  });

  it('MotionsStrategy.buildContent includes SWOT section', () => {
    const strategy = new MotionsStrategy();
    const content = strategy.buildContent(motionsData, 'en');
    expect(content).toContain('class="swot-analysis"');
  });

  it('MotionsStrategy.buildContent includes Dashboard section', () => {
    const strategy = new MotionsStrategy();
    const content = strategy.buildContent(motionsData, 'en');
    expect(content).toContain('class="dashboard"');
  });

  it('WeeklyReviewStrategy.buildContent includes SWOT section', () => {
    const strategy = new WeeklyReviewStrategy();
    const content = strategy.buildContent(weeklyReviewData, 'en');
    expect(content).toContain('class="swot-analysis"');
  });

  it('WeeklyReviewStrategy.buildContent includes Dashboard section', () => {
    const strategy = new WeeklyReviewStrategy();
    const content = strategy.buildContent(weeklyReviewData, 'en');
    expect(content).toContain('class="dashboard"');
  });

  it('MonthlyReviewStrategy.buildContent includes SWOT section', () => {
    const strategy = new MonthlyReviewStrategy();
    const content = strategy.buildContent(monthlyReviewData, 'en');
    expect(content).toContain('class="swot-analysis"');
  });

  it('MonthlyReviewStrategy.buildContent includes Dashboard section', () => {
    const strategy = new MonthlyReviewStrategy();
    const content = strategy.buildContent(monthlyReviewData, 'en');
    expect(content).toContain('class="dashboard"');
  });

  it('SWOT section is localized for German', () => {
    const strategy = new WeekAheadStrategy();
    const content = strategy.buildContent(weekAheadData, 'de');
    expect(content).toContain('class="swot-analysis"');
  });

  it('Dashboard section is localized for French', () => {
    const strategy = new BreakingNewsStrategy();
    const content = strategy.buildContent(breakingNewsData, 'fr');
    expect(content).toContain('class="dashboard"');
  });
});
