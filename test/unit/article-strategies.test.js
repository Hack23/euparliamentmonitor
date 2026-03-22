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
import { PLACEHOLDER_MARKER } from '../../scripts/generators/motions-content.js';
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

  it('getMetadata subtitle includes event counts from data', () => {
    const meta = strategy.getMetadata(weekAheadData, 'en');
    // weekAheadData has 1 event
    expect(meta.subtitle).toContain('1 scheduled event');
  });

  it('getMetadata title includes content-aware suffix when events exist', () => {
    const meta = strategy.getMetadata(weekAheadData, 'en');
    // weekAheadData has 1 event, so title should include suffix
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('1 Event');
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

  it('getMetadata title includes content-aware suffix from feed data', () => {
    const meta = strategy.getMetadata(breakingNewsData, 'en');
    // breakingNewsData has 1 adopted text, 1 event, 1 procedure — title should include suffix
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('1 Text');
  });

  it('getMetadata subtitle includes feed data highlights', () => {
    const meta = strategy.getMetadata(breakingNewsData, 'en');
    // subtitle should mention adopted text from feed data (singular since fixture has 1 item)
    expect(meta.subtitle).toContain('adopted text');
  });

  it('getMetadata keywords include adopted text titles from feed data', () => {
    const meta = strategy.getMetadata(breakingNewsData, 'en');
    expect(meta.keywords).toContain('Resolution on climate action');
  });

  it('getMetadata falls back gracefully when feedData is undefined', () => {
    const noFeedData = { ...breakingNewsData, feedData: undefined };
    const meta = strategy.getMetadata(noFeedData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.subtitle).toBeTruthy();
    expect(meta.keywords.length).toBeGreaterThan(0);
    expect(meta.keywords).toContain('breaking news');
  });

  it('getMetadata differs by language', () => {
    const en = strategy.getMetadata(breakingNewsData, 'en');
    const de = strategy.getMetadata(breakingNewsData, 'de');
    expect(en.title).not.toBe(de.title);
  });

  it('getMetadata includes significance keyword when feedData is present and score meets threshold', () => {
    const meta = strategy.getMetadata(breakingNewsData, 'en');
    const sigKeyword = meta.keywords.find((k) => k.startsWith('significance:'));
    expect(sigKeyword).toBeDefined();
    expect(sigKeyword).toMatch(/^significance:\d+$/);
  });

  it('getMetadata omits significance keyword when feedData is undefined', () => {
    const noFeedData = { ...breakingNewsData, feedData: undefined };
    const meta = strategy.getMetadata(noFeedData, 'en');
    const sigKeyword = meta.keywords.find((k) => k.startsWith('significance:'));
    expect(sigKeyword).toBeUndefined();
  });

  it('getMetadata omits significance keyword when score is below threshold', () => {
    const emptyFeedData = {
      ...breakingNewsData,
      feedData: { adoptedTexts: [], events: [], procedures: [], mepUpdates: [] },
    };
    const meta = strategy.getMetadata(emptyFeedData, 'en');
    const sigKeyword = meta.keywords.find((k) => k.startsWith('significance:'));
    expect(sigKeyword).toBeUndefined();
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

  it('buildContent shows "No recent documents available" when committee has real metadata but no docs', () => {
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: 'Test Committee',
          abbreviation: 'TEST',
          chair: 'Real Chair', // non-placeholder chair prevents metadata-unavailable path
          members: 10,
          documents: [],
          effectiveness: null,
        },
      ],
    };
    const content = strategy.buildContent(data, 'en');
    expect(content).toContain('No recent documents available');
  });

  it('shouldSkip returns true when committeeDataList is empty (all fetches failed)', () => {
    const data = { ...committeeReportsData, committeeDataList: [] };
    expect(strategy.shouldSkip(data)).toBe(true);
  });

  it('shouldSkip returns true when all committees are placeholder', () => {
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: 'Test Committee',
          abbreviation: 'TEST',
          chair: 'N/A',
          members: 0,
          documents: [],
          effectiveness: null,
        },
      ],
    };
    expect(strategy.shouldSkip(data)).toBe(true);
  });

  it('shouldSkip returns false when committees are all-placeholder but feedData has adoptedTexts', () => {
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: 'Test Committee',
          abbreviation: 'TEST',
          chair: 'N/A',
          members: 0,
          documents: [],
          effectiveness: null,
        },
      ],
      feedData: {
        adoptedTexts: [{ id: 'AT-1', title: 'Climate Decision', date: '2026-03-01' }],
      },
    };
    expect(strategy.shouldSkip(data)).toBe(false);
  });

  it('shouldSkip returns true when committees are all-placeholder and feedData has no items', () => {
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: 'Test Committee',
          abbreviation: 'TEST',
          chair: 'N/A',
          members: 0,
          documents: [],
          effectiveness: null,
        },
      ],
      feedData: {
        adoptedTexts: [],
        committeeDocuments: [],
        plenaryDocuments: [],
        documents: [],
        procedures: [],
      },
    };
    expect(strategy.shouldSkip(data)).toBe(true);
  });

  it('shouldSkip returns false when there is real committee data', () => {
    expect(strategy.shouldSkip(committeeReportsData)).toBe(false);
  });

  it('buildContent renders committee-card--unavailable for placeholder-shaped committee data', () => {
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: 'Test Committee',
          abbreviation: 'TEST',
          chair: 'N/A',
          members: 0,
          documents: [],
          effectiveness: null,
        },
      ],
    };
    // shouldSkip() would prevent this in production (all-placeholder triggers a skip),
    // but when buildContent is called directly it now renders an unavailable notice
    const content = strategy.buildContent(data, 'en');
    expect(content).toContain('committee-card--unavailable');
    expect(content).toContain('committee-metadata-unavailable');
  });

  it('buildContent escapes HTML in committee name', () => {
    const data = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: '<script>alert(1)</script>',
          abbreviation: 'XSS',
          chair: 'Real Chair', // non-placeholder chair
          members: 5,
          documents: [],
          effectiveness: null,
        },
      ],
    };
    const content = strategy.buildContent(data, 'en');
    expect(content).not.toContain('<script>');
  });

  it('buildContent renders adopted-texts-overview section when feedData has adoptedTexts', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [{ id: 'AT-1', title: 'Climate Decision', date: '2026-03-01' }],
      },
    };
    const content = strategy.buildContent(data, 'en');
    expect(content).toContain('adopted-texts-overview');
    expect(content).toContain('Climate Decision');
  });

  it('buildContent categorizes agri-food titles under AGRI not ENVI', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          {
            id: 'AT-2',
            title: 'Cooperation among enforcement authorities regarding unfair trading practices in the agri-food supply chain',
            date: '2026-03-01',
          },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    // Extract just the adopted-texts-overview section for targeted assertions
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    expect(overviewHtml).toContain('agri-food supply chain');
    // Should appear under Agriculture heading, not Environment heading
    expect(overviewHtml).toContain('Agriculture');
    expect(overviewHtml).not.toContain('Environment');
  });

  it('buildContent omits adopted-texts-overview section when feedData has no adoptedTexts', () => {
    const dataNoFeed = { ...committeeReportsData, feedData: undefined };
    const content = strategy.buildContent(dataNoFeed, 'en');
    expect(content).not.toContain('adopted-texts-overview');
  });

  it('buildContent uses singular summary when exactly one adopted text', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [{ id: 'AT-1', title: 'Climate Decision', date: '2026-03-01' }],
      },
    };
    const content = strategy.buildContent(data, 'en');
    // Should use singular form: "1 text" not "1 texts"
    expect(content).toContain('adopted 1 text in a recent session');
    expect(content).not.toContain('1 texts');
  });

  it('buildContent uses plural summary when multiple adopted texts', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-1', title: 'Climate Decision', date: '2026-03-01' },
          { id: 'AT-2', title: 'Financial Report', date: '2026-03-02' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    // Should use plural form with count
    expect(content).toContain('adopted 2 texts in recent sessions');
  });

  it('buildContent does not categorize civil aviation under LIBE', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-3', title: 'Civil aviation safety standards regulation', date: '2026-03-01' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    // Should not appear under Civil Liberties heading since 'civil aviation' is not 'civil liberties'
    expect(overviewHtml).not.toContain('Civil Liberties');
  });

  it('buildContent does not categorize social security under AFET', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-4', title: 'Social security coordination across member states', date: '2026-03-01' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    // Should not appear under Foreign Affairs heading since 'social security' is not 'security policy'
    expect(overviewHtml).not.toContain('Foreign Affairs');
  });

  it('buildContent categorizes Ukraine defence under AFET', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-5', title: 'Ukraine defence support and military assistance', date: '2026-03-01' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    // Should appear under Foreign Affairs heading
    expect(overviewHtml).toContain('Foreign Affairs');
  });

  it('buildContent categorizes asylum migration under LIBE', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-6', title: 'Safe countries of origin asylum migration rules', date: '2026-03-01' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    // Should appear under Civil Liberties heading
    expect(overviewHtml).toContain('Civil Liberties');
  });

  it('buildContent does not categorize "justice" alone under LIBE (too broad)', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-7', title: 'Environmental justice framework for green transition', date: '2026-03-01' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    // 'justice' alone should not route to LIBE — only specific multi-word phrases do
    expect(overviewHtml).not.toContain('Civil Liberties');
  });

  it('buildContent categorizes justice and home affairs under LIBE', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-8', title: 'Justice and home affairs cooperation framework', date: '2026-03-01' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    expect(overviewHtml).toContain('Civil Liberties');
  });

  it('buildContent does not categorize "peace" alone under AFET (too broad)', () => {
    const data = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [
          { id: 'AT-9', title: 'Peaceful nuclear energy cooperation', date: '2026-03-01' },
        ],
      },
    };
    const content = strategy.buildContent(data, 'en');
    const overviewStart = content.indexOf('class="adopted-texts-overview"');
    const overviewEnd = content.indexOf('</section>', overviewStart) + '</section>'.length;
    const overviewHtml = content.slice(overviewStart, overviewEnd);
    // 'peace' alone (e.g. 'peaceful') should not route to AFET — only 'peace agreement/process/mission/operation' does
    expect(overviewHtml).not.toContain('Foreign Affairs');
  });

  it('getMetadata returns "committee-reports" category', () => {
    const meta = strategy.getMetadata(committeeReportsData, 'en');
    expect(meta.category).toBe('committee-reports');
    expect(meta.title).toBeTruthy();
    expect(meta.keywords).toContain('committee');
  });

  it('getMetadata keywords include committee abbreviations', () => {
    const meta = strategy.getMetadata(committeeReportsData, 'en');
    expect(meta.keywords).toContain('ENVI');
    expect(meta.keywords).toContain('Environment Committee');
  });

  it('getMetadata subtitle includes committee document counts', () => {
    const meta = strategy.getMetadata(committeeReportsData, 'en');
    // committeeReportsData has 1 committee with 1 doc and a real chair
    expect(meta.subtitle).toContain('1 committee reporting');
    expect(meta.subtitle).toContain('1 recent document');
  });

  it('getMetadata title includes content-aware suffix', () => {
    const meta = strategy.getMetadata(committeeReportsData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('Document');
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

  it('getMetadata subtitle includes pipeline health when available', () => {
    const meta = strategy.getMetadata(propositionsData, 'en');
    // propositionsData has pipelineData with healthScore: 0.85
    expect(meta.subtitle).toContain('pipeline health 85%');
  });

  it('getMetadata keywords include legislative pipeline when pipelineData present', () => {
    const meta = strategy.getMetadata(propositionsData, 'en');
    expect(meta.keywords).toContain('legislative pipeline');
    expect(meta.keywords).toContain('healthy pipeline');
  });

  it('getMetadata title includes content-aware suffix', () => {
    const meta = strategy.getMetadata(propositionsData, 'en');
    // propositionsData has 1 proposal card in HTML
    expect(meta.title).toContain('—');
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

  it('getMetadata keywords include voting record titles', () => {
    const meta = strategy.getMetadata(motionsData, 'en');
    expect(meta.keywords).toContain('Budget 2025');
  });

  it('getMetadata keywords include anomaly types', () => {
    const meta = strategy.getMetadata(motionsData, 'en');
    expect(meta.keywords).toContain('Defection');
  });

  it('getMetadata keywords include question topics', () => {
    const meta = strategy.getMetadata(motionsData, 'en');
    expect(meta.keywords).toContain('Energy policy');
  });

  it('getMetadata subtitle includes vote count and anomaly count', () => {
    const meta = strategy.getMetadata(motionsData, 'en');
    expect(meta.subtitle).toContain('1 vote analysed');
    expect(meta.subtitle).toContain('1 anomaly detected');
  });

  it('getMetadata title includes content-aware suffix', () => {
    const meta = strategy.getMetadata(motionsData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('1 Vote');
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
      adoptedTexts: [{ id: 'TA-10-2026-0042', title: 'Test Adopted Text', date: '2026-03-04' }],
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

    // adopted texts are now in their own field, not in proposalsHtml
    expect(data.adoptedTextsHtml).toBeTruthy();
    expect(data.adoptedTextsHtml).toContain('Adopted Text on Climate Finance');
    expect(data.adoptedTextsHtml).toContain('TA-10-2026-0099');
    // RDF type "Work" must not appear as a status badge for adopted texts
    expect(data.adoptedTextsHtml).not.toContain('proposal-status');
    expect(data.adoptedTextsHtml).not.toContain('>Work<');
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
      searchDocuments: async () => {
        throw new Error('network failure');
      },
      monitorLegislativePipeline: async () => {
        throw new Error('timeout');
      },
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

  it('getMetadata subtitle includes event counts from data', () => {
    const meta = strategy.getMetadata(monthAheadData, 'en');
    // monthAheadData has 1 event
    expect(meta.subtitle).toContain('1 scheduled event');
  });

  it('getMetadata title includes content-aware suffix when events exist', () => {
    const meta = strategy.getMetadata(monthAheadData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('1 Event');
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

  it('buildContent injects adopted texts section when feedData is provided', () => {
    const content = strategy.buildContent(weeklyReviewData, 'en');
    expect(content).toContain('class="adopted-texts-feed"');
    expect(content).toContain('Resolution on climate action');
  });

  it('buildContent adopted texts count is localized per language', () => {
    const en = strategy.buildContent(weeklyReviewData, 'en');
    const zh = strategy.buildContent(weeklyReviewData, 'zh');
    expect(en).toContain('1 texts adopted in recent plenary sessions:');
    expect(zh).toContain('最近全体会议共通过了 1 份文本：');
  });

  it('buildContent omits adopted texts section when feedData is absent', () => {
    const dataWithoutFeed = { ...weeklyReviewData, feedData: undefined };
    const content = strategy.buildContent(dataWithoutFeed, 'en');
    expect(content).not.toContain('class="adopted-texts-feed"');
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

  it('getMetadata keywords include voting record titles', () => {
    const meta = strategy.getMetadata(weeklyReviewData, 'en');
    expect(meta.keywords).toContain('Digital Markets Act Amendment');
  });

  it('getMetadata keywords include adopted text titles from feed', () => {
    const meta = strategy.getMetadata(weeklyReviewData, 'en');
    expect(meta.keywords).toContain('Resolution on climate action');
  });

  it('getMetadata subtitle includes vote and anomaly counts', () => {
    const meta = strategy.getMetadata(weeklyReviewData, 'en');
    expect(meta.subtitle).toContain('1 vote analysed');
    expect(meta.subtitle).toContain('1 voting anomaly');
  });

  it('getMetadata title includes content-aware suffix', () => {
    const meta = strategy.getMetadata(weeklyReviewData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('1 Vote');
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

  it('getMetadata keywords include voting record titles', () => {
    const meta = strategy.getMetadata(monthlyReviewData, 'en');
    expect(meta.keywords).toContain('Green Deal Implementation');
  });

  it('getMetadata keywords include anomaly types', () => {
    const meta = strategy.getMetadata(monthlyReviewData, 'en');
    expect(meta.keywords).toContain('Cross-Party Vote');
  });

  it('getMetadata subtitle includes vote and anomaly counts', () => {
    const meta = strategy.getMetadata(monthlyReviewData, 'en');
    expect(meta.subtitle).toContain('1 vote analysed');
    expect(meta.subtitle).toContain('1 voting anomaly');
  });

  it('getMetadata title includes content-aware suffix', () => {
    const meta = strategy.getMetadata(monthlyReviewData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('1 Vote');
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

  it('MotionsStrategy.buildContent omits Dashboard section when all votingRecords have placeholder results', () => {
    const strategy = new MotionsStrategy();
    const placeholderMotionsData = {
      ...motionsData,
      votingRecords: motionsData.votingRecords.map((r) => ({
        ...r,
        result: PLACEHOLDER_MARKER,
      })),
    };
    const content = strategy.buildContent(placeholderMotionsData, 'en');
    expect(content).not.toContain('class="dashboard"');
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
    // Assert German-localized SWOT heading is present
    expect(content).toMatch(/SWOT-Analyse/);
  });

  it('Dashboard section is localized for French', () => {
    const strategy = new BreakingNewsStrategy();
    const content = strategy.buildContent(breakingNewsData, 'fr');
    expect(content).toContain('class="dashboard"');
    // Assert French-localized dashboard heading is present
    expect(content).toMatch(/Tableau de bord/);
  });
});

// ─── Non-English getMetadata branch coverage ─────────────────────────────────
// Covers the lang !== 'en' paths in every strategy's getMetadata() method:
// - suffix is empty → title equals baseTitle (no ' — ' separator)
// - description falls back to baseSubtitle

describe('getMetadata non-English branches', () => {
  const nonEnLangs = /** @type {const} */ (['sv', 'fr', 'de', 'ja', 'ar']);

  describe('WeekAheadStrategy', () => {
    const strategy = new WeekAheadStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns baseTitle without suffix`, () => {
        const meta = strategy.getMetadata(weekAheadData, lang);
        expect(meta.title).toBeTruthy();
        // Non-English titles should NOT contain the English suffix separator
        expect(meta.title).not.toContain('—');
        expect(meta.category).toBe('week-ahead');
      });

      it(`getMetadata(${lang}) subtitle uses localized base (not English description)`, () => {
        const enMeta = strategy.getMetadata(weekAheadData, 'en');
        const meta = strategy.getMetadata(weekAheadData, lang);
        expect(meta.subtitle).toBeTruthy();
        // Non-English subtitle differs from English enriched subtitle
        expect(meta.subtitle).not.toBe(enMeta.subtitle);
      });
    }
  });

  describe('BreakingNewsStrategy', () => {
    const strategy = new BreakingNewsStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns localized title without English suffix`, () => {
        const enMeta = strategy.getMetadata(breakingNewsData, 'en');
        const meta = strategy.getMetadata(breakingNewsData, lang);
        expect(meta.title).toBeTruthy();
        // Non-English title should differ from English enriched title
        expect(meta.title).not.toBe(enMeta.title);
        expect(meta.category).toBe('breaking');
      });
    }
  });

  describe('CommitteeReportsStrategy', () => {
    const strategy = new CommitteeReportsStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns baseTitle without suffix`, () => {
        const meta = strategy.getMetadata(committeeReportsData, lang);
        expect(meta.title).toBeTruthy();
        expect(meta.title).not.toContain('—');
        expect(meta.category).toBe('committee-reports');
      });
    }
  });

  describe('PropositionsStrategy', () => {
    const strategy = new PropositionsStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns baseTitle without suffix`, () => {
        const meta = strategy.getMetadata(propositionsData, lang);
        expect(meta.title).toBeTruthy();
        expect(meta.title).not.toContain('—');
        expect(meta.category).toBe('propositions');
      });
    }
  });

  describe('MotionsStrategy', () => {
    const strategy = new MotionsStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns baseTitle without suffix`, () => {
        const meta = strategy.getMetadata(motionsData, lang);
        expect(meta.title).toBeTruthy();
        expect(meta.title).not.toContain('—');
        expect(meta.category).toBe('motions');
      });
    }
  });

  describe('MonthAheadStrategy', () => {
    const strategy = new MonthAheadStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns baseTitle without suffix`, () => {
        const meta = strategy.getMetadata(monthAheadData, lang);
        expect(meta.title).toBeTruthy();
        expect(meta.title).not.toContain('—');
        expect(meta.category).toBe('month-ahead');
      });
    }
  });

  describe('WeeklyReviewStrategy', () => {
    const strategy = new WeeklyReviewStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns baseTitle without suffix`, () => {
        const meta = strategy.getMetadata(weeklyReviewData, lang);
        expect(meta.title).toBeTruthy();
        expect(meta.title).not.toContain('—');
        expect(meta.category).toBe('week-in-review');
      });
    }
  });

  describe('MonthlyReviewStrategy', () => {
    const strategy = new MonthlyReviewStrategy();
    for (const lang of nonEnLangs) {
      it(`getMetadata(${lang}) returns baseTitle without suffix`, () => {
        const meta = strategy.getMetadata(monthlyReviewData, lang);
        expect(meta.title).toBeTruthy();
        expect(meta.title).not.toContain('—');
        expect(meta.category).toBe('month-in-review');
      });
    }
  });
});

// ─── Empty-data getMetadata edge cases ────────────────────────────────────────

describe('getMetadata with empty data edge cases', () => {
  it('WeekAheadStrategy: empty weekData yields no suffix', () => {
    const strategy = new WeekAheadStrategy();
    const emptyData = {
      ...weekAheadData,
      weekData: { events: [], committees: [], documents: [], pipeline: [], questions: [] },
    };
    const meta = strategy.getMetadata(emptyData, 'en');
    expect(meta.title).toBeTruthy();
    // No suffix when all counts are 0
    expect(meta.title).not.toContain('—');
    // Subtitle falls back to generic description
    expect(meta.subtitle).toBeTruthy();
  });

  it('MonthAheadStrategy: empty monthData yields no suffix', () => {
    const strategy = new MonthAheadStrategy();
    const emptyData = {
      ...monthAheadData,
      monthData: { events: [], committees: [], documents: [], pipeline: [], questions: [] },
    };
    const meta = strategy.getMetadata(emptyData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.title).not.toContain('—');
    expect(meta.subtitle).toBeTruthy();
  });

  it('MotionsStrategy: empty records yields no suffix', () => {
    const strategy = new MotionsStrategy();
    const emptyData = {
      ...motionsData,
      votingRecords: [],
      votingPatterns: [],
      anomalies: [],
      questions: [],
    };
    const meta = strategy.getMetadata(emptyData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.title).not.toContain('—');
  });

  it('WeeklyReviewStrategy: empty records yields no suffix', () => {
    const strategy = new WeeklyReviewStrategy();
    const emptyData = {
      ...weeklyReviewData,
      votingRecords: [],
      votingPatterns: [],
      anomalies: [],
      questions: [],
      feedData: undefined,
    };
    const meta = strategy.getMetadata(emptyData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.title).not.toContain('—');
  });

  it('MonthlyReviewStrategy: empty records yields no suffix', () => {
    const strategy = new MonthlyReviewStrategy();
    const emptyData = {
      ...monthlyReviewData,
      votingRecords: [],
      votingPatterns: [],
      anomalies: [],
      questions: [],
    };
    const meta = strategy.getMetadata(emptyData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.title).not.toContain('—');
  });

  it('PropositionsStrategy: empty proposalsHtml yields no suffix', () => {
    const strategy = new PropositionsStrategy();
    const emptyData = {
      ...propositionsData,
      proposalsHtml: '',
      adoptedTextsHtml: '',
      pipelineData: null,
      procedureHtml: '',
    };
    const meta = strategy.getMetadata(emptyData, 'en');
    expect(meta.title).toBeTruthy();
    expect(meta.category).toBe('propositions');
  });
});

// ─── Enriched-data getMetadata branch coverage ────────────────────────────────
// Tests the branches for committees > 0, pipeline > 0, questions > 0 in title
// suffix and description builders.

describe('getMetadata with enriched data (all suffix branches)', () => {
  it('WeekAheadStrategy: committees and pipeline in suffix', () => {
    const strategy = new WeekAheadStrategy();
    const richData = {
      ...weekAheadData,
      weekData: {
        events: [{ date: '2025-01-16', title: 'Plenary Session', type: 'Plenary', description: '' }],
        committees: [{ name: 'ENVI', date: '2025-01-17' }],
        documents: [],
        pipeline: [{ title: 'New Regulation', stage: 'committee' }],
        questions: [{ author: 'MEP X', topic: 'Budget', date: '2025-01-16' }],
      },
    };
    const meta = strategy.getMetadata(richData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('Committee Meeting');
    expect(meta.title).toContain('Pipeline Item');
    // Description includes questions too
    expect(meta.subtitle).toContain('parliamentary question');
  });

  it('MonthAheadStrategy: committees and pipeline in suffix', () => {
    const strategy = new MonthAheadStrategy();
    const richData = {
      ...monthAheadData,
      monthData: {
        events: [{ date: '2025-01-20', title: 'Plenary Session', type: 'Plenary', description: '' }],
        committees: [{ name: 'ITRE', date: '2025-01-25' }],
        documents: [],
        pipeline: [{ title: 'Digital Act', stage: 'plenary' }],
        questions: [{ author: 'MEP Y', topic: 'Digital', date: '2025-01-22' }],
      },
    };
    const meta = strategy.getMetadata(richData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('Committee Meeting');
    expect(meta.title).toContain('Pipeline Item');
    expect(meta.subtitle).toContain('parliamentary question');
  });

  it('PropositionsStrategy: feedData procedures and adopted texts in suffix', () => {
    const strategy = new PropositionsStrategy();
    const richData = {
      ...propositionsData,
      feedData: {
        procedures: [{ id: 'P-1', title: 'Procedure A', date: '2025-01-10' }],
        adoptedTexts: [{ id: 'AT-1', title: 'Adopted Text A', date: '2025-01-12' }],
        events: [],
        mepUpdates: [],
      },
    };
    const meta = strategy.getMetadata(richData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('Procedure');
    expect(meta.title).toContain('Adopted Text');
    // Keywords should include feed data titles
    expect(meta.keywords).toContain('Procedure A');
    expect(meta.keywords).toContain('Adopted Text A');
  });

  it('PropositionsStrategy: pipelineData-only suffix when no feedData procedures', () => {
    const strategy = new PropositionsStrategy();
    const pipelineOnlyData = {
      ...propositionsData,
      feedData: undefined,
    };
    const meta = strategy.getMetadata(pipelineOnlyData, 'en');
    // With pipelineData healthScore 0.85 and no feed procs, suffix shows Pipeline %
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('Pipeline');
    expect(meta.subtitle).toContain('pipeline health');
  });

  it('WeeklyReviewStrategy: feedData adopted texts contribute to suffix', () => {
    const strategy = new WeeklyReviewStrategy();
    const meta = strategy.getMetadata(weeklyReviewData, 'en');
    // weeklyReviewData has 1 adopted text in feedData, 1 voting record, 1 anomaly
    expect(meta.title).toContain('—');
    // Keywords should include adopted text title from feed
    expect(meta.keywords).toContain('Resolution on climate action');
  });

  it('MotionsStrategy: multiple records and questions in suffix', () => {
    const strategy = new MotionsStrategy();
    const richData = {
      ...motionsData,
      votingRecords: [
        { title: 'Budget 2025', date: '2025-01-15', result: 'Adopted', votes: { for: 400, against: 100, abstain: 50 } },
        { title: 'Energy Act', date: '2025-01-15', result: 'Adopted', votes: { for: 300, against: 200, abstain: 30 } },
      ],
      anomalies: [
        { type: 'Defection', description: 'EPP defection', severity: 'HIGH' },
        { type: 'Abstention', description: 'S&D abstention spike', severity: 'MEDIUM' },
      ],
    };
    const meta = strategy.getMetadata(richData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('2 Votes');
    expect(meta.title).toContain('2 Anomalies');
  });

  it('MonthlyReviewStrategy: multiple records in suffix', () => {
    const strategy = new MonthlyReviewStrategy();
    const richData = {
      ...monthlyReviewData,
      votingRecords: [
        { title: 'Green Deal Implementation', date: '2025-01-05', result: 'Adopted', votes: { for: 420, against: 80, abstain: 40 } },
        { title: 'Budget Act', date: '2025-01-07', result: 'Adopted', votes: { for: 350, against: 150, abstain: 30 } },
      ],
    };
    const meta = strategy.getMetadata(richData, 'en');
    expect(meta.title).toContain('—');
    expect(meta.title).toContain('2 Votes');
  });

  it('MotionsStrategy: feedData adoptedTexts in keywords and suffix', () => {
    const strategy = new MotionsStrategy();
    const richData = {
      ...motionsData,
      feedData: {
        adoptedTexts: [{ id: 'AT-1', title: 'Resolution on AI', date: '2025-01-10' }],
        events: [],
        procedures: [],
        mepUpdates: [],
      },
    };
    const meta = strategy.getMetadata(richData, 'en');
    // Keywords should include adopted text title from feed
    expect(meta.keywords).toContain('Resolution on AI');
    // Suffix should include adopted text count
    expect(meta.title).toContain('Adopted Text');
    // Description should mention adopted text
    expect(meta.subtitle).toContain('adopted text');
  });

  it('CommitteeReportsStrategy: feedData adoptedTexts in keywords and suffix', () => {
    const strategy = new CommitteeReportsStrategy();
    const richData = {
      ...committeeReportsData,
      feedData: {
        adoptedTexts: [{ id: 'AT-1', title: 'Climate Regulation', date: '2025-01-10' }],
        events: [],
        procedures: [],
        mepUpdates: [],
        plenaryDocuments: [],
        committeeDocuments: [],
        parliamentaryQuestions: [],
      },
    };
    const meta = strategy.getMetadata(richData, 'en');
    // Keywords should include categorized theme from adopted text
    expect(meta.keywords.length).toBeGreaterThan(0);
    // Suffix should include adopted text count
    expect(meta.title).toContain('Adopted Text');
    // Description should include adopted text count
    expect(meta.subtitle).toContain('adopted text');
  });

  it('CommitteeReportsStrategy: committee without docs yields Active Committee in suffix', () => {
    const strategy = new CommitteeReportsStrategy();
    const noDocs = {
      ...committeeReportsData,
      committeeDataList: [
        {
          name: 'Environment Committee',
          abbreviation: 'ENVI',
          chair: 'Jane Doe',
          members: 42,
          documents: [],
          effectiveness: '85 / Rank 2',
        },
      ],
    };
    const meta = strategy.getMetadata(noDocs, 'en');
    // With 0 docs and 1 active committee, suffix should say "Active Committee"
    expect(meta.title).toContain('Active Committee');
  });

  it('BreakingNewsStrategy: empty feedData array still produces base keywords', () => {
    const strategy = new BreakingNewsStrategy();
    const emptyFeed = {
      ...breakingNewsData,
      feedData: { adoptedTexts: [], events: [], procedures: [], mepUpdates: [] },
    };
    const meta = strategy.getMetadata(emptyFeed, 'en');
    // With all empty arrays in feedData, the English suffix builder returns ''
    // but the base title already includes ' — date' from the localized title function
    expect(meta.keywords).toContain('breaking news');
    // Description should fallback (counts are empty)
    expect(meta.subtitle).toContain('breaking developments');
  });

  it('BreakingNewsStrategy: feedData with only mepUpdates in description', () => {
    const strategy = new BreakingNewsStrategy();
    const mepOnlyFeed = {
      ...breakingNewsData,
      feedData: {
        adoptedTexts: [],
        events: [],
        procedures: [],
        mepUpdates: [
          { id: 'MEP-1', name: 'Alice', date: '2025-01-15' },
          { id: 'MEP-2', name: 'Bob', date: '2025-01-15' },
        ],
      },
    };
    const meta = strategy.getMetadata(mepOnlyFeed, 'en');
    expect(meta.subtitle).toContain('MEP update');
  });

  it('WeeklyReviewStrategy: feedData adopted texts in keywords', () => {
    const strategy = new WeeklyReviewStrategy();
    const meta = strategy.getMetadata(weeklyReviewData, 'en');
    // feedData has 1 adopted text with title "Resolution on climate action"
    expect(meta.keywords).toContain('Resolution on climate action');
  });

  it('MonthlyReviewStrategy: feedData does not affect keywords (keywords are data-driven)', () => {
    const strategy = new MonthlyReviewStrategy();
    const richData = {
      ...monthlyReviewData,
      feedData: {
        adoptedTexts: [{ id: 'AT-1', title: 'Digital Services Act', date: '2025-01-05' }],
        events: [],
        procedures: [],
        mepUpdates: [],
        plenaryDocuments: [],
        committeeDocuments: [],
        parliamentaryQuestions: [],
      },
    };
    const meta = strategy.getMetadata(richData, 'en');
    // MonthlyReview buildKeywords does not include feedData titles
    // Keywords should include voting record titles
    expect(meta.keywords).toContain('Green Deal Implementation');
    // But should NOT include feedData title since monthly review doesn't use it
    expect(meta.keywords).not.toContain('Digital Services Act');
  });
});

// ─── buildContent with feedData absent (false branch) ─────────────────────────

describe('buildContent feedData absent branches', () => {
  it('MotionsStrategy: buildContent without feedData omits adopted-texts section', () => {
    const strategy = new MotionsStrategy();
    const noFeedData = { ...motionsData, feedData: undefined };
    const content = strategy.buildContent(noFeedData, 'en');
    expect(content).toBeTruthy();
    // Should not have adopted texts section when feedData is undefined
    expect(content).not.toContain('class="adopted-texts-overview"');
  });

  it('WeeklyReviewStrategy: buildContent without feedData omits adopted texts section', () => {
    const strategy = new WeeklyReviewStrategy();
    const noFeedData = { ...weeklyReviewData, feedData: undefined };
    const content = strategy.buildContent(noFeedData, 'en');
    expect(content).toBeTruthy();
    expect(content).not.toContain('class="adopted-texts-overview"');
  });

  it('WeeklyReviewStrategy: buildContent with empty adoptedTexts omits section', () => {
    const strategy = new WeeklyReviewStrategy();
    const emptyFeedData = {
      ...weeklyReviewData,
      feedData: { adoptedTexts: [], events: [], procedures: [], mepUpdates: [] },
    };
    const content = strategy.buildContent(emptyFeedData, 'en');
    expect(content).toBeTruthy();
    expect(content).not.toContain('class="adopted-texts-overview"');
  });
});

// ─── MonthAheadStrategy and WeeklyReviewStrategy fetchData ────────────────────

describe('MonthAheadStrategy.fetchData with null client', () => {
  it('returns valid payload with dateRange spanning 30 days', async () => {
    const strategy = new MonthAheadStrategy();
    const data = await strategy.fetchData(null, '2025-03-01');
    expect(data.date).toBe('2025-03-01');
    expect(data.dateRange).toHaveProperty('start');
    expect(data.dateRange).toHaveProperty('end');
    const start = new Date(data.dateRange.start);
    const end = new Date(data.dateRange.end);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(30);
    expect(data.monthLabel).toBeTruthy();
    expect(data.keywords.length).toBeGreaterThan(0);
  });
});

describe('WeeklyReviewStrategy.fetchData with null client', () => {
  it('returns valid payload with dateRange and placeholder arrays', async () => {
    const strategy = new WeeklyReviewStrategy();
    const data = await strategy.fetchData(null, '2025-03-01');
    expect(data.date).toBe('2025-03-01');
    expect(data.dateRange).toHaveProperty('start');
    expect(data.dateRange).toHaveProperty('end');
    expect(Array.isArray(data.votingRecords)).toBe(true);
    expect(Array.isArray(data.votingPatterns)).toBe(true);
    expect(Array.isArray(data.anomalies)).toBe(true);
  });
});

describe('MonthlyReviewStrategy.fetchData with null client', () => {
  it('returns valid payload with dateRange and monthLabel', async () => {
    const strategy = new MonthlyReviewStrategy();
    const data = await strategy.fetchData(null, '2025-03-01');
    expect(data.date).toBe('2025-03-01');
    expect(data.dateRange).toHaveProperty('start');
    expect(data.dateRange).toHaveProperty('end');
    expect(data.monthLabel).toBeTruthy();
    expect(Array.isArray(data.votingRecords)).toBe(true);
    expect(Array.isArray(data.anomalies)).toBe(true);
  });
});
