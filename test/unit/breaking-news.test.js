// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for breaking news content builder
 * Tests buildBreakingNewsContent() with mock OSINT data and fallback paths
 */

import { describe, it, expect } from 'vitest';
import { buildBreakingNewsContent, scoreBreakingNewsSignificance, SIGNIFICANCE_THRESHOLD } from '../../scripts/generators/news-enhanced.js';
import { generateArticleHTML } from '../../scripts/templates/article-template.js';
import {
  BREAKING_NEWS_TITLES,
  ALL_LANGUAGES,
  getLocalizedString,
  BREAKING_STRINGS,
} from '../../scripts/constants/languages.js';
import { validateHTML } from '../helpers/test-utils.js';
import { breakingNewsData } from '../fixtures/ep-data.js';

describe('Breaking News Generator', () => {
  describe('buildBreakingNewsContent', () => {
    it('should return HTML with placeholder notice when no MCP data', () => {
      const html = buildBreakingNewsContent('2025-01-15', '', '', '', '');
      expect(html).toContain('placeholder content');
      expect(html).toContain('MCP Server is unavailable');
      expect(html).toContain('breaking-banner');
    });

    it('should include the date in the breaking banner timestamp', () => {
      const html = buildBreakingNewsContent('2025-01-15', '', '', '', '');
      expect(html).toContain('BREAKING');
    });

    it('should render anomaly section when anomaly data provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        'Anomaly: EPP defection detected in budget vote',
        '',
        '',
        ''
      );
      expect(html).toContain('Voting Anomaly Intelligence');
      expect(html).toContain('EPP defection detected in budget vote');
      expect(html).not.toContain('placeholder content');
    });

    it('should render coalition section when coalition data provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        'Coalition stress: S&D-Renew alliance weakening',
        '',
        ''
      );
      expect(html).toContain('Coalition Dynamics Assessment');
      expect(html).toContain('S&amp;D-Renew alliance weakening');
    });

    it('should render report section when report data provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        '',
        'Report: High abstention rate',
        ''
      );
      expect(html).toContain('Analytical Report');
      expect(html).toContain('High abstention rate');
    });

    it('should render key players section when influence data provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        '',
        '',
        'MEP Ursula Faber influence score: 87'
      );
      expect(html).toContain('Key MEP Influence Analysis');
      expect(html).toContain('MEP Ursula Faber influence score: 87');
    });

    it('should escape HTML in all MCP data fields to prevent XSS', () => {
      const xssPayload = '<script>alert("xss")</script>';
      const html = buildBreakingNewsContent(
        '2025-01-15',
        xssPayload,
        xssPayload,
        xssPayload,
        xssPayload
      );
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should truncate very long MCP data to 2000 characters', () => {
      const longData = 'x'.repeat(5000);
      const html = buildBreakingNewsContent('2025-01-15', longData, '', '', '');
      const occurrences = (html.match(/x{2000}/g) ?? []).length;
      expect(occurrences).toBeGreaterThan(0);
      expect(html).not.toContain('x'.repeat(2001));
    });

    it('should render lede section when MCP data is present', () => {
      const html = buildBreakingNewsContent('2025-01-15', 'some data', '', '', '');
      expect(html).toContain('Intelligence analysis from the European Parliament MCP Server');
    });

    it('should include all four sections when all data provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        'anomaly data',
        'coalition data',
        'report data',
        'influence data'
      );
      expect(html).toContain('Voting Anomaly Intelligence');
      expect(html).toContain('Coalition Dynamics Assessment');
      expect(html).toContain('Analytical Report');
      expect(html).toContain('Key MEP Influence Analysis');
    });
  });

  describe('structured intelligence sections', () => {
    const sampleAnomalies = [
      {
        anomalyId: 'A-001',
        significance: 'high',
        description: 'EPP defection detected',
        affectedGroups: ['EPP'],
        deviationPercentage: 15.5,
        historicalContext: 'First EPP defection in 2 years',
        implication: 'Potential coalition shift',
      },
    ];

    const sampleCoalitions = [
      {
        coalitionId: 'C-001',
        groups: ['EPP', 'Renew'],
        cohesionScore: 0.72,
        alignmentTrend: 'weakening',
        keyVotes: 10,
        riskLevel: 'medium',
      },
    ];

    const sampleMEPs = [
      {
        mepId: 'MEP-001',
        mepName: 'Jane Smith',
        overallScore: 82,
        votingActivity: 90,
        legislativeOutput: 75,
        committeeEngagement: 80,
        rank: 'top-10%',
      },
    ];

    it('should render intelligence briefing when anomalies array provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        '',
        '',
        '',
        'en',
        sampleAnomalies,
        [],
        []
      );
      expect(html).toContain('intelligence-briefing');
      expect(html).toContain('Voting Anomaly Alert');
      expect(html).toContain('EPP defection detected');
      expect(html).toContain('anomaly-high');
    });

    it('should render coalition dynamics section when coalitions array provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        '',
        '',
        '',
        'en',
        [],
        sampleCoalitions,
        []
      );
      expect(html).toContain('coalition-dynamics');
      expect(html).toContain('Coalition Dynamics');
      expect(html).toContain('EPP');
      expect(html).toContain('Renew');
    });

    it('should render key players section when mepScores array provided', () => {
      const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', 'en', [], [], sampleMEPs);
      expect(html).toContain('key-players-intel');
      expect(html).toContain('Key Parliamentary Players');
      expect(html).toContain('Jane Smith');
      expect(html).toContain('82');
    });

    it('should show non-placeholder lede when only structured intel provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        '',
        '',
        '',
        'en',
        sampleAnomalies,
        [],
        []
      );
      expect(html).not.toContain('placeholder content');
      expect(html).toContain('Intelligence analysis from the European Parliament MCP Server');
      expect(html).toContain('intelligence-briefing');
    });

    it('should render all three intel sections when all structured data provided', () => {
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        '',
        '',
        '',
        'en',
        sampleAnomalies,
        sampleCoalitions,
        sampleMEPs
      );
      expect(html).toContain('Voting Anomaly Alert');
      expect(html).toContain('Coalition Dynamics');
      expect(html).toContain('Key Parliamentary Players');
    });

    it('should escape XSS in structured anomaly description', () => {
      const xssAnomalies = [
        {
          anomalyId: 'A-XSS',
          significance: 'high',
          description: '<script>alert("xss")</script>',
          affectedGroups: [],
          deviationPercentage: 10,
          historicalContext: 'context',
          implication: 'implication',
        },
      ];
      const html = buildBreakingNewsContent(
        '2025-01-15',
        '',
        '',
        '',
        '',
        'en',
        xssAnomalies,
        [],
        []
      );
      expect(html).not.toContain('<script>alert("xss")</script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('Breaking News article HTML generation', () => {
    it('should produce valid HTML for breaking news article', () => {
      const content = buildBreakingNewsContent(
        '2025-01-15',
        'anomaly',
        'coalition',
        'report',
        'influence'
      );
      const html = generateArticleHTML({
        slug: 'breaking',
        title: 'Breaking: Significant Parliamentary Developments — 2025-01-15',
        subtitle: 'Intelligence analysis of voting anomalies',
        date: '2025-01-15',
        category: 'breaking',
        readTime: 5,
        lang: 'en',
        content,
        keywords: ['breaking news', 'European Parliament'],
        sources: [],
      });
      const result = validateHTML(html);
      expect(result.valid).toBe(true);
    });

    it('should generate articles for all 14 EU languages using BREAKING_NEWS_TITLES', () => {
      const date = '2025-01-15';
      for (const lang of ALL_LANGUAGES) {
        const titleGenerator = getLocalizedString(BREAKING_NEWS_TITLES, lang);
        const localizedTitles = titleGenerator(date);
        expect(localizedTitles.title).toBeDefined();
        expect(localizedTitles.subtitle).toBeDefined();

        const content = buildBreakingNewsContent(date, '', '', '', '');
        const html = generateArticleHTML({
          slug: 'breaking',
          title: localizedTitles.title,
          subtitle: localizedTitles.subtitle,
          date,
          category: 'breaking',
          readTime: 3,
          lang,
          content,
          keywords: ['breaking news'],
          sources: [],
        });
        expect(html).toContain(`lang="${lang}"`);
        const result = validateHTML(html);
        expect(result.valid).toBe(true);
      }
    });

    it('should generate placeholder breaking news when MCP is unavailable', () => {
      const content = buildBreakingNewsContent('2025-01-15', '', '', '', '');
      const html = generateArticleHTML({
        slug: 'breaking',
        title: 'Breaking: Significant Parliamentary Developments — 2025-01-15',
        subtitle: 'Intelligence analysis of voting anomalies',
        date: '2025-01-15',
        category: 'breaking',
        readTime: 3,
        lang: 'en',
        content,
        keywords: ['breaking news'],
        sources: [],
      });
      expect(html).toContain('placeholder content');
      expect(html).toContain('MCP Server is unavailable');
      const result = validateHTML(html);
      expect(result.valid).toBe(true);
    });
  });
});

describe('Breaking News editorial quality', () => {
  it('should not use <pre> data dumps in anomaly section', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'anomaly data', '', '', '');
    expect(html).not.toContain('<pre');
    expect(html).not.toContain('data-summary');
  });

  it('should not use <pre> data dumps in coalition section', () => {
    const html = buildBreakingNewsContent('2025-01-15', '', 'coalition data', '', '');
    expect(html).not.toContain('<pre');
  });

  it('should include source attribution when anomaly data provided', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'some anomaly', '', '', '');
    expect(html).toContain('source-attribution');
    expect(html).toContain('According to European Parliament data');
  });

  it('should include "Why This Matters" section when MCP data is present', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'some anomaly', '', '', '');
    expect(html).toContain('why-this-matters');
    expect(html).toContain('Why This Matters');
  });

  it('should not include "Why This Matters" section when no MCP data', () => {
    const html = buildBreakingNewsContent('2025-01-15', '', '', '', '');
    expect(html).not.toContain('why-this-matters');
  });

  it('should use data-narrative class instead of data-summary', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'some data', '', '', '');
    expect(html).toContain('data-narrative');
    expect(html).not.toContain('data-summary');
  });

  it('should include localized editorial strings for French', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'anomaly data', '', '', '', 'fr');
    expect(html).toContain('Pourquoi');
    expect(html).toContain('why-this-matters');
  });

  it('should include localized editorial strings for German', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'anomaly data', '', '', '', 'de');
    expect(html).toContain('Warum Das Wichtig Ist');
  });
});

describe('Breaking News multi-language section headings', () => {
  it('should use localized section headings for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(BREAKING_STRINGS, lang);
      const html = buildBreakingNewsContent(
        '2025-01-15',
        'anomaly',
        'coalition',
        'report',
        'influence',
        lang
      );
      // Section headings are escaped — check for the CSS class markers instead of raw text for headings with special chars
      expect(html).toContain('class="analysis"');
      expect(html).toContain('class="coalition-impact"');
      expect(html).toContain('class="context"');
      expect(html).toContain('class="key-players"');
      expect(html).toContain(strings.breakingBanner);
    }
  });

  it('should use Japanese section headings', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'anomaly', '', '', '', 'ja');
    expect(html).toContain('投票異常 — 情報分析');
    expect(html).toContain('⚡ 速報');
  });

  it('should use Korean section headings', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'anomaly', '', '', '', 'ko');
    expect(html).toContain('투표 이상 — 정보 분석');
    expect(html).toContain('⚡ 속보');
  });

  it('should use Chinese section headings', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'anomaly', '', '', '', 'zh');
    expect(html).toContain('投票异常 — 情报分析');
    expect(html).toContain('⚡ 突发');
  });

  it('should have BREAKING_STRINGS for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(BREAKING_STRINGS, lang);
      expect(strings.breakingBanner).toBeDefined();
      expect(strings.breakingBanner.length).toBeGreaterThan(0);
      expect(strings.votingAnomalyIntel).toBeDefined();
      expect(strings.coalitionDynamics).toBeDefined();
      expect(strings.intelligenceBriefing).toBeDefined();
      expect(strings.lede).toBeDefined();
    }
  });
});

describe('Breaking News feed-based sections', () => {
  // Use shared fixture from test/fixtures/ep-data.js
  const sampleFeedData = breakingNewsData.feedData;

  const emptyFeedData = {
    adoptedTexts: [],
    events: [],
    procedures: [],
    mepUpdates: [],
  };

  it('should render adopted texts section when feed data is provided', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).toContain('adopted-texts-feed');
    expect(html).toContain('Resolution on climate action');
    expect(html).toContain('Recently Adopted Texts');
  });

  it('should render events section when feed data is provided', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).toContain('events-feed');
    expect(html).toContain('Plenary session');
    expect(html).toContain('Recent Parliamentary Events');
  });

  it('should render procedures section when feed data is provided', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).toContain('procedures-feed');
    expect(html).toContain('New regulation proposal');
    expect(html).toContain('Legislative Procedure Updates');
  });

  it('should render MEP updates section when feed data is provided', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).toContain('mep-updates-feed');
    expect(html).toContain('Jane Smith');
    expect(html).toContain('MEP Updates');
  });

  it('should include publish dates in MEP updates section', () => {
    // Use MEP-only feed data with distinctive date to ensure the test
    // validates MEP section specifically, not other sections
    const mepOnlyFeedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [
        {
          id: 'mep-1',
          name: 'Test MEP',
          date: '2030-12-31',
          country: 'SE',
          group: 'Test Group',
        },
      ],
    };

    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      mepOnlyFeedData
    );

    const mepSectionIndex = html.indexOf('mep-updates-feed');
    const feedDateIndex = html.indexOf('feed-date');
    const dateIndex = html.indexOf('2030-12-31');

    expect(mepSectionIndex).toBeGreaterThan(-1);
    expect(feedDateIndex).toBeGreaterThan(mepSectionIndex);
    expect(dateIndex).toBeGreaterThan(feedDateIndex);
  });

  it('should show feed-first lede when only feed data is present (no analytical data)', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).not.toContain('placeholder content');
    expect(html).not.toContain('Intelligence analysis from the European Parliament MCP Server');
    expect(html).toContain(
      'The latest European Parliament feed data highlights recent parliamentary activity'
    );
  });

  it('should show placeholder when MCP is truly unavailable (no feedData, no analytical data)', () => {
    const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', 'en', [], [], []);
    expect(html).toContain('placeholder content');
    expect(html).toContain('MCP Server is unavailable');
  });

  it('should render noFeedDataNotice when feedData is present but empty', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      emptyFeedData
    );
    // noFeedDataNotice appears in the lede (not duplicated in feed-empty-notice section)
    expect(html).toContain('No recent feed data available from the European Parliament');
    expect(html).not.toContain('MCP Server is unavailable');
    // Lede should not claim "recent parliamentary activity" when feeds are empty
    expect(html).not.toContain('highlights recent parliamentary activity');
    // No duplicate: feed-empty-notice section should NOT render when lede already conveys it
    expect(html).not.toContain('feed-empty-notice');
  });

  it('should not render feed sections when feedData is undefined', () => {
    const html = buildBreakingNewsContent('2025-01-15', 'anomaly', '', '', '', 'en');
    expect(html).not.toContain('adopted-texts-feed');
    expect(html).not.toContain('events-feed');
    expect(html).not.toContain('procedures-feed');
    expect(html).not.toContain('mep-updates-feed');
  });

  it('should not render empty feed sections', () => {
    const partialFeed = {
      adoptedTexts: [{ id: 'AT-001', title: 'Test', date: '2025-01-15' }],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      partialFeed
    );
    expect(html).toContain('adopted-texts-feed');
    expect(html).not.toContain('events-feed');
    expect(html).not.toContain('procedures-feed');
    expect(html).not.toContain('mep-updates-feed');
  });

  it('should escape XSS in feed item titles', () => {
    const xssFeed = {
      adoptedTexts: [{ id: 'XSS', title: '<script>alert("xss")</script>', date: '2025-01-15' }],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', 'en', [], [], [], xssFeed);
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should render feed sections before analytical sections', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      'anomaly data',
      '',
      '',
      '',
      'en',
      [],
      [],
      [],
      sampleFeedData
    );
    const feedPos = html.indexOf('adopted-texts-feed');
    const analysisPos = html.indexOf('class="analysis"');
    expect(feedPos).toBeLessThan(analysisPos);
  });

  it('should have BREAKING_STRINGS with feed-related fields for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(BREAKING_STRINGS, lang);
      expect(strings.adoptedTextsHeading).toBeDefined();
      expect(strings.adoptedTextsHeading.length).toBeGreaterThan(0);
      expect(strings.recentEventsHeading).toBeDefined();
      expect(strings.recentEventsHeading.length).toBeGreaterThan(0);
      expect(strings.procedureUpdatesHeading).toBeDefined();
      expect(strings.procedureUpdatesHeading.length).toBeGreaterThan(0);
      expect(strings.mepUpdatesHeading).toBeDefined();
      expect(strings.mepUpdatesHeading.length).toBeGreaterThan(0);
      expect(strings.noFeedDataNotice).toBeDefined();
      expect(strings.noFeedDataNotice.length).toBeGreaterThan(0);
      expect(strings.feedLede).toBeDefined();
      expect(strings.feedLede.length).toBeGreaterThan(0);
    }
  });

  it('should use localized feed headings for German', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'de',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).toContain('Kürzlich Angenommene Texte');
    expect(html).toContain('Aktuelle Parlamentarische Ereignisse');
  });

  it('should use localized feed headings for French', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'fr',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).toContain('Textes Récemment Adoptés');
    expect(html).toContain('Événements Parlementaires Récents');
  });

  it('should use localized feed headings for Japanese', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      '',
      '',
      '',
      '',
      'ja',
      [],
      [],
      [],
      sampleFeedData
    );
    expect(html).toContain('最近採択されたテキスト');
  });

  it('should render feed data alongside analytical context', () => {
    const html = buildBreakingNewsContent(
      '2025-01-15',
      'anomaly data',
      'coalition data',
      '',
      '',
      'en',
      [],
      [],
      [],
      sampleFeedData
    );
    // Feed sections (primary)
    expect(html).toContain('adopted-texts-feed');
    expect(html).toContain('events-feed');
    // Analytical context (secondary)
    expect(html).toContain('Voting Anomaly Intelligence');
    expect(html).toContain('Coalition Dynamics Assessment');
    // Analytical lede should appear when analytical data is present
    expect(html).toContain('Intelligence analysis from the European Parliament MCP Server');
    // Both should not show placeholder
    expect(html).not.toContain('placeholder content');
  });
});

describe('Breaking News adoptedTextItemLabelFn', () => {
  it('should render adopted-text label directly without duplication for English', () => {
    const feedWithLabel = {
      adoptedTexts: [{ id: 'TA-10-2026-0035', title: 'Ukraine Support Loan', date: '2025-01-15', label: 'T10-0035/2026', type: 'TEXT_ADOPTED' }],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', 'en', [], [], [], feedWithLabel);
    // Should contain label (not duplicated as "label — adopted text")
    expect(html).toContain('T10-0035/2026');
    // Should NOT contain "T10-0035/2026 — adopted text" (duplication)
    expect(html).not.toContain('T10-0035/2026 — adopted text');
    // Should show type label in the separate feed-type span
    expect(html).toContain('Adopted text');
  });

  it('should render adopted-text identifier when label is absent', () => {
    const feedWithIdentifier = {
      adoptedTexts: [{ id: 'TA-10-2026-0048', title: 'Agri-food enforcement', date: '2025-01-15', identifier: 'TA-10-2026-0048' }],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', 'en', [], [], [], feedWithIdentifier);
    expect(html).toContain('TA-10-2026-0048');
  });

  it('should have adoptedTextTypeLabel and adoptedTextItemLabelFn for all 14 languages', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(BREAKING_STRINGS, lang);
      expect(strings.adoptedTextTypeLabel).toBeDefined();
      expect(strings.adoptedTextTypeLabel.length).toBeGreaterThan(0);
      expect(typeof strings.adoptedTextItemLabelFn).toBe('function');
      // Function should preserve the original label within the returned string
      const result = strings.adoptedTextItemLabelFn('T10-0035/2026');
      expect(result).toContain('T10-0035/2026');
    }
  });

  it('should render adopted-text items with label across all 14 languages', () => {
    const feedWithLabel = {
      adoptedTexts: [{ id: 'TA-10-2026-0035', title: 'Ukraine Support Loan', date: '2025-01-15', label: 'T10-0035/2026', type: 'TEXT_ADOPTED' }],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    for (const lang of ALL_LANGUAGES) {
      const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', lang, [], [], [], feedWithLabel);
      // All languages should display the label identifier (as secondary label alongside the title)
      expect(html).toContain('T10-0035/2026');
      // None should duplicate type info in the title
      expect(html).not.toContain('T10-0035/2026 — adopted text');
    }
  });
});

describe('Breaking News feed truncation', () => {
  it('should have showingXofNFn for all 14 languages that returns a localized string with both counts', () => {
    for (const lang of ALL_LANGUAGES) {
      const strings = getLocalizedString(BREAKING_STRINGS, lang);
      expect(typeof strings.showingXofNFn).toBe('function');
      const result = strings.showingXofNFn(10, 25);
      expect(result).toContain('10');
      expect(result).toContain('25');
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('should show truncation note when adopted texts exceed MAX_FEED_ITEMS for all 14 languages', () => {
    const manyAdoptedTexts = Array.from({ length: 15 }, (_, i) => ({
      id: `AT-00${i}`,
      title: `Adopted Text ${i}`,
      date: '2025-01-15',
    }));
    const feedData = {
      adoptedTexts: manyAdoptedTexts,
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    for (const lang of ALL_LANGUAGES) {
      const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', lang, [], [], [], feedData);
      expect(html).toContain('feed-truncation-note');
    }
  });

  it('should show truncation note when MEP updates exceed MAX_FEED_ITEMS for all 14 languages', () => {
    const manyMEPs = Array.from({ length: 15 }, (_, i) => ({
      id: `mep-${i}`,
      name: `MEP ${i}`,
      date: '2025-01-15',
    }));
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: manyMEPs,
    };
    for (const lang of ALL_LANGUAGES) {
      const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', lang, [], [], [], feedData);
      expect(html).toContain('feed-truncation-note');
    }
  });

  it('should show truncation note using totalMEPUpdates even when fetched items fit within limit', () => {
    // Simulate: API fetched only 10 MEPs but reported total=525 (more available in feed)
    const tenMEPs = Array.from({ length: 10 }, (_, i) => ({
      id: `mep-${i}`,
      name: `MEP ${i}`,
      date: '2025-01-15',
    }));
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: tenMEPs,
      totalMEPUpdates: 525,
    };
    const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', 'en', [], [], [], feedData);
    expect(html).toContain('feed-truncation-note');
    expect(html).toContain('525');
  });

  it('should not show truncation note when feed items are within limit', () => {
    const fewItems = Array.from({ length: 5 }, (_, i) => ({
      id: `AT-00${i}`,
      title: `Adopted Text ${i}`,
      date: '2025-01-15',
    }));
    const feedData = {
      adoptedTexts: fewItems,
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const html = buildBreakingNewsContent('2025-01-15', '', '', '', '', 'en', [], [], [], feedData);
    expect(html).not.toContain('feed-truncation-note');
  });
});

describe('scoreBreakingNewsSignificance', () => {
  it('should return zero scores for empty feed data', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.adoptedTextsScore).toBe(0);
    expect(score.affectedMEPsScore).toBe(0);
    expect(score.legislativeStageScore).toBe(0);
    expect(score.committeeInvolvementScore).toBe(0);
    expect(score.overallScore).toBe(0);
  });

  it('should score adopted texts (20 pts each, capped at 100)', () => {
    const feedData = {
      adoptedTexts: [
        { id: 'AT-001', title: 'Text 1', date: '2025-01-15' },
        { id: 'AT-002', title: 'Text 2', date: '2025-01-15' },
        { id: 'AT-003', title: 'Text 3', date: '2025-01-15' },
      ],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.adoptedTextsScore).toBe(60);
    expect(score.overallScore).toBeGreaterThan(0);
  });

  it('should cap adopted texts sub-score at 100', () => {
    const feedData = {
      adoptedTexts: Array.from({ length: 10 }, (_, i) => ({
        id: `AT-${i}`,
        title: `Text ${i}`,
        date: '2025-01-15',
      })),
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.adoptedTextsScore).toBe(100);
  });

  it('should score MEP updates (10 pts each, capped at 100)', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [
        { id: 'MEP-1', name: 'MEP A', date: '2025-01-15' },
        { id: 'MEP-2', name: 'MEP B', date: '2025-01-15' },
      ],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.affectedMEPsScore).toBe(20);
  });

  it('should prefer totalMEPUpdates over mepUpdates.length when available', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [{ id: 'MEP-1', name: 'MEP A', date: '2025-01-15' }],
      totalMEPUpdates: 8,
    };
    const score = scoreBreakingNewsSignificance(feedData);
    // 8 * 10 = 80, not 1 * 10 = 10
    expect(score.affectedMEPsScore).toBe(80);
  });

  it('should fall back to mepUpdates.length when totalMEPUpdates is undefined', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [
        { id: 'MEP-1', name: 'MEP A', date: '2025-01-15' },
        { id: 'MEP-2', name: 'MEP B', date: '2025-01-15' },
        { id: 'MEP-3', name: 'MEP C', date: '2025-01-15' },
      ],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.affectedMEPsScore).toBe(30);
  });

  it('should score procedures with final stage higher than non-final', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [
        { id: 'P-1', title: 'Proc 1', date: '2025-01-15', stage: 'final reading' },
        { id: 'P-2', title: 'Proc 2', date: '2025-01-15', stage: 'committee' },
      ],
      mepUpdates: [],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    // final: 25 pts, non-final: 10 pts = 35 total
    expect(score.legislativeStageScore).toBe(35);
  });

  it('should score events for committee involvement (15 pts each)', () => {
    const feedData = {
      adoptedTexts: [],
      events: [
        { id: 'E-1', title: 'Event 1', date: '2025-01-15' },
        { id: 'E-2', title: 'Event 2', date: '2025-01-15' },
        { id: 'E-3', title: 'Event 3', date: '2025-01-15' },
      ],
      procedures: [],
      mepUpdates: [],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.committeeInvolvementScore).toBe(45);
  });

  it('should compute correct weighted overall score', () => {
    const feedData = {
      adoptedTexts: [{ id: 'AT-001', title: 'Text 1', date: '2025-01-15' }],
      events: [{ id: 'E-1', title: 'Event 1', date: '2025-01-15' }],
      procedures: [{ id: 'P-1', title: 'Proc 1', date: '2025-01-15', stage: 'adopted' }],
      mepUpdates: [{ id: 'MEP-1', name: 'MEP A', date: '2025-01-15' }],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    // adopted: 20*0.4=8, mep: 10*0.2=2, stage: 25*0.3=7.5, events: 15*0.1=1.5 → round(19) = 19
    expect(score.overallScore).toBe(19);
  });

  it('should handle null/undefined fields gracefully', () => {
    // Simulate a feed with missing optional fields
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [{ id: 'P-1', title: 'Proc', date: '2025-01-15' }],
      mepUpdates: [],
    };
    // procedure with no stage should contribute 0 points (missing stage → 0)
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.legislativeStageScore).toBe(0);
    expect(score.overallScore).toBe(0);
  });

  it('should recognise trilogue as a final stage', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [{ id: 'P-1', title: 'Proc 1', date: '2025-01-15', stage: 'trilogue negotiation' }],
      mepUpdates: [],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.legislativeStageScore).toBe(25);
  });

  it('should produce score above SIGNIFICANCE_THRESHOLD for rich feed data', () => {
    const feedData = {
      adoptedTexts: Array.from({ length: 5 }, (_, i) => ({
        id: `AT-${i}`,
        title: `Text ${i}`,
        date: '2025-01-15',
      })),
      events: Array.from({ length: 3 }, (_, i) => ({
        id: `E-${i}`,
        title: `Event ${i}`,
        date: '2025-01-15',
      })),
      procedures: Array.from({ length: 2 }, (_, i) => ({
        id: `P-${i}`,
        title: `Proc ${i}`,
        date: '2025-01-15',
        stage: 'final reading',
      })),
      mepUpdates: Array.from({ length: 4 }, (_, i) => ({
        id: `MEP-${i}`,
        name: `MEP ${i}`,
        date: '2025-01-15',
      })),
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.overallScore).toBeGreaterThan(SIGNIFICANCE_THRESHOLD);
  });

  it('should produce score below SIGNIFICANCE_THRESHOLD for minimal feed data', () => {
    const feedData = {
      adoptedTexts: [],
      events: [],
      procedures: [],
      mepUpdates: [],
    };
    const score = scoreBreakingNewsSignificance(feedData);
    expect(score.overallScore).toBeLessThan(SIGNIFICANCE_THRESHOLD);
  });
});

describe('SIGNIFICANCE_THRESHOLD constant', () => {
  it('should be a positive number', () => {
    expect(SIGNIFICANCE_THRESHOLD).toBeGreaterThan(0);
    expect(typeof SIGNIFICANCE_THRESHOLD).toBe('number');
  });
});
