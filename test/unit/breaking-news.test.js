// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for breaking news content builder
 * Tests buildBreakingNewsContent() with mock OSINT data and fallback paths
 */

import { describe, it, expect } from 'vitest';
import { buildBreakingNewsContent } from '../../scripts/generators/news-enhanced.js';
import { generateArticleHTML } from '../../scripts/templates/article-template.js';
import { BREAKING_NEWS_TITLES, ALL_LANGUAGES, getLocalizedString } from '../../scripts/constants/languages.js';
import { validateHTML } from '../helpers/test-utils.js';

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
      const html = buildBreakingNewsContent('2025-01-15', '', '', 'Report: High abstention rate', '');
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

  describe('Breaking News article HTML generation', () => {
    it('should produce valid HTML for breaking news article', () => {
      const content = buildBreakingNewsContent('2025-01-15', 'anomaly', 'coalition', 'report', 'influence');
      const html = generateArticleHTML({
        slug: '2025-01-15-breaking-en.html',
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
          slug: `2025-01-15-breaking-${lang}.html`,
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
        slug: '2025-01-15-breaking-en.html',
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
