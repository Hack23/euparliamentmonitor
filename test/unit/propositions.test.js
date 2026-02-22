// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for propositions content builder
 * Tests buildPropositionsContent() with mock data and fallback paths
 */

import { describe, it, expect } from 'vitest';
import { buildPropositionsContent } from '../../scripts/generators/news-enhanced.js';
import { generateArticleHTML } from '../../scripts/templates/article-template.js';
import { PROPOSITIONS_TITLES, PROPOSITIONS_STRINGS, ALL_LANGUAGES, getLocalizedString } from '../../scripts/constants/languages.js';
import { validateHTML } from '../helpers/test-utils.js';

const EN_STRINGS = PROPOSITIONS_STRINGS.en;

describe('Propositions Generator', () => {
  describe('buildPropositionsContent', () => {
    it('should return HTML with localized section headings', () => {
      const html = buildPropositionsContent(
        '<div class="proposal-card"><h3>Test Proposal</h3></div>',
        '<div class="pipeline-metrics"></div>',
        '',
        EN_STRINGS
      );
      expect(html).toContain(EN_STRINGS.proposalsHeading);
      expect(html).toContain(EN_STRINGS.pipelineHeading);
      expect(html).toContain(EN_STRINGS.analysisHeading);
      // lede and analysis are HTML-escaped; check for stable substring without apostrophes
      expect(html).toContain('European Parliament is actively processing');
      expect(html).toContain('sustainable finance, digital governance');
    });

    it('should omit procedure section when procedureHtml is empty', () => {
      const html = buildPropositionsContent('<p>proposals</p>', '<p>pipeline</p>', '', EN_STRINGS);
      expect(html).not.toContain('procedure-status');
      expect(html).not.toContain(EN_STRINGS.procedureHeading);
    });

    it('should include procedure section when procedureHtml is provided', () => {
      const html = buildPropositionsContent(
        '<p>proposals</p>',
        '<p>pipeline</p>',
        '<pre>{"status": "first_reading"}</pre>',
        EN_STRINGS
      );
      expect(html).toContain('procedure-status');
      expect(html).toContain(EN_STRINGS.procedureHeading);
    });

    it('should escape HTML in localized string fields to prevent XSS', () => {
      const maliciousStrings = {
        ...EN_STRINGS,
        lede: '<script>alert("xss")</script>',
        proposalsHeading: '<img onerror=alert(1)>',
        analysis: '<b>bold</b>',
        pipelineHeading: 'Pipeline',
        procedureHeading: 'Procedure',
        analysisHeading: 'Analysis',
      };
      const html = buildPropositionsContent('', '', '', maliciousStrings);
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;b&gt;');
    });

    it('should include proposals HTML verbatim (proposals content is pre-sanitized)', () => {
      const proposalsHtml = '<div class="proposal-card"><h3>Test Proposal</h3></div>';
      const html = buildPropositionsContent(proposalsHtml, '', '', EN_STRINGS);
      expect(html).toContain('proposal-card');
      expect(html).toContain('Test Proposal');
    });

    it('should include pipeline HTML verbatim (pipeline content is pre-sanitized)', () => {
      const pipelineHtml = '<div class="pipeline-metrics"><p>Active: 5</p></div>';
      const html = buildPropositionsContent('', pipelineHtml, '', EN_STRINGS);
      expect(html).toContain('pipeline-metrics');
      expect(html).toContain('Active: 5');
    });
  });

  describe('Propositions article HTML generation', () => {
    it('should produce valid HTML for propositions article', () => {
      const strings = getLocalizedString(PROPOSITIONS_STRINGS, 'en');
      const content = buildPropositionsContent(
        '<div class="proposal-card"><h3>Test</h3></div>',
        '<div class="pipeline-metrics"></div>',
        '',
        strings
      );
      const titles = getLocalizedString(PROPOSITIONS_TITLES, 'en')();
      const html = generateArticleHTML({
        slug: '2025-01-15-propositions-en.html',
        title: titles.title,
        subtitle: titles.subtitle,
        date: '2025-01-15',
        type: 'propositions',
        readTime: 5,
        lang: 'en',
        content,
        keywords: ['European Parliament', 'legislation', 'proposals'],
        sources: [],
      });
      const result = validateHTML(html);
      expect(result.valid).toBe(true);
    });

    it('should generate articles for all 14 EU languages using PROPOSITIONS_TITLES and PROPOSITIONS_STRINGS', () => {
      const date = '2025-01-15';
      for (const lang of ALL_LANGUAGES) {
        const titles = getLocalizedString(PROPOSITIONS_TITLES, lang)();
        const strings = getLocalizedString(PROPOSITIONS_STRINGS, lang);

        expect(titles.title).toBeDefined();
        expect(titles.subtitle).toBeDefined();
        expect(strings.lede.length).toBeGreaterThan(0);

        const content = buildPropositionsContent('<p>proposals</p>', '<p>pipeline</p>', '', strings);
        const html = generateArticleHTML({
          slug: `2025-01-15-propositions-${lang}.html`,
          title: titles.title,
          subtitle: titles.subtitle,
          date,
          type: 'propositions',
          readTime: 4,
          lang,
          content,
          keywords: ['European Parliament', 'legislation'],
          sources: [],
        });
        expect(html).toContain(`lang="${lang}"`);
        const result = validateHTML(html);
        expect(result.valid).toBe(true);
      }
    });

    it('should generate placeholder propositions when MCP is unavailable', () => {
      const strings = getLocalizedString(PROPOSITIONS_STRINGS, 'en');
      const content = buildPropositionsContent(
        '<div class="proposal-card"><h3>Proposal for a Regulation on Sustainable Finance Reporting</h3></div>',
        '<div class="pipeline-metrics"></div>',
        '',
        strings
      );
      const titles = getLocalizedString(PROPOSITIONS_TITLES, 'en')();
      const html = generateArticleHTML({
        slug: '2025-01-15-propositions-en.html',
        title: titles.title,
        subtitle: titles.subtitle,
        date: '2025-01-15',
        type: 'propositions',
        readTime: 4,
        lang: 'en',
        content,
        keywords: ['legislation'],
        sources: [],
      });
      expect(html).toContain('proposals-list');
      expect(html).toContain('pipeline-status');
      const result = validateHTML(html);
      expect(result.valid).toBe(true);
    });
  });
});
