// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import { describe, it, expect } from 'vitest';
import {
  computeArticleQualityScore,
  buildTableOfContents,
  buildQualityScoreBadge,
  buildTimelineSection,
  buildComparisonTable,
  buildKeyFiguresBar,
} from '../../scripts/templates/section-builders.js';

describe('section-builders', () => {
  describe('computeArticleQualityScore', () => {
    it('should return needs-improvement for empty content', () => {
      const score = computeArticleQualityScore('');
      expect(score.wordCount).toBe(0);
      expect(score.overallScore).toBe('needs-improvement');
    });

    it('should strip HTML tags when counting words', () => {
      const score = computeArticleQualityScore('<p>Hello world</p>');
      expect(score.wordCount).toBe(2);
    });

    it('should count section elements as analysisSections', () => {
      const content = '<section id="a">foo</section><section id="b">bar</section>';
      const score = computeArticleQualityScore(content);
      expect(score.analysisSections).toBe(2);
    });

    it('should count dashboard, mindmap, and SWOT as visualizations not analysis sections', () => {
      const content =
        '<section class="dashboard" role="region">x</section>' +
        '<section class="mindmap-section" role="region">y</section>' +
        '<section class="swot-analysis" role="region">z</section>';
      const score = computeArticleQualityScore(content);
      expect(score.visualizationCount).toBe(3);
      expect(score.analysisSections).toBe(0);
    });

    it('should detect multi-class SWOT sections like swot-multidimensional', () => {
      const content =
        '<section class="swot-analysis swot-multidimensional" role="region">z</section>';
      const score = computeArticleQualityScore(content);
      expect(score.visualizationCount).toBe(1);
      expect(score.analysisSections).toBe(0);
    });

    it('should not count nested dashboard-grid/dashboard-panel as dashboard sections', () => {
      const content =
        '<section class="dashboard" role="region">' +
        '<div class="dashboard-grid">' +
        '<div class="dashboard-panel">p1</div>' +
        '<div class="dashboard-panel coalition-panel">p2</div>' +
        '<canvas class="dashboard-chart" data-chart-config="{}"></canvas>' +
        '</div>' +
        '</section>';
      const score = computeArticleQualityScore(content);
      // Only 1 dashboard section, not 1 per nested dashboard-* class
      expect(score.visualizationCount).toBe(2); // 1 dashboard + 1 chart (data-chart-config)
      expect(score.analysisSections).toBe(0); // 1 total section - 1 dashboard = 0
    });

    it('should rate excellent for rich content', () => {
      // 810 words exceeds the 800-word threshold required for 'excellent' rating
      const words = Array(810).fill('word').join(' ');
      const sections = '<section>a</section><section>b</section><section>c</section>';
      const visuals =
        '<section class="dashboard" role="region">x</section><section class="mindmap-section" role="region">y</section>';
      const score = computeArticleQualityScore(words + sections + visuals);
      expect(score.overallScore).toBe('excellent');
    });

    it('should rate good for medium content', () => {
      // 550 words exceeds the 500-word threshold required for 'good' rating
      const words = Array(550).fill('word').join(' ');
      const sections = '<section>a</section><section>b</section>';
      const score = computeArticleQualityScore(words + sections);
      expect(score.overallScore).toBe('good');
    });

    it('should exclude script content from word count', () => {
      const content =
        '<p>Hello world</p><script type="application/json">{"lots":"of","fake":"words","that":"inflate","the":"count"}</script>';
      const score = computeArticleQualityScore(content);
      expect(score.wordCount).toBe(2);
    });

    it('should count EP document links as evidence references', () => {
      const content =
        '<p>See <a href="https://www.europarl.europa.eu/doceo/document/TA-9-2024-0001_EN.html">this text</a></p>';
      const score = computeArticleQualityScore(content);
      expect(score.evidenceReferences).toBe(1);
    });

    it('should not count bare EP homepage link as evidence', () => {
      const content =
        '<footer><a href="https://www.europarl.europa.eu/">European Parliament</a></footer>';
      const score = computeArticleQualityScore(content);
      expect(score.evidenceReferences).toBe(0);
    });

    it('should not count europarl links inside script blocks as evidence', () => {
      const content =
        '<p>Hello</p>' +
        '<script type="application/ld+json">{"url":"https://www.europarl.europa.eu/doceo/document/A-9-2024-0001_EN.html"}</script>';
      const score = computeArticleQualityScore(content);
      expect(score.evidenceReferences).toBe(0);
    });

    it('should not count section tags inside script blocks', () => {
      const content =
        '<p>Hello</p>' +
        '<script>var html = "<section class=\\"dashboard\\">fake</section>";</script>';
      const score = computeArticleQualityScore(content);
      expect(score.analysisSections).toBe(0);
      expect(score.visualizationCount).toBe(0);
    });
  });

  describe('buildTableOfContents', () => {
    it('should return empty string for empty entries', () => {
      expect(buildTableOfContents([], 'en')).toBe('');
    });

    it('should render nav with list items', () => {
      const entries = [{ id: 'intro', label: 'Introduction', level: /** @type {1} */ (1) }];
      const html = buildTableOfContents(entries, 'en');
      expect(html).toContain('<nav');
      expect(html).toContain('href="#intro"');
      expect(html).toContain('Introduction');
      expect(html).toContain('aria-label="Table of contents"');
    });

    it('should use localised aria-label for non-English languages', () => {
      const entries = [{ id: 'intro', label: 'Einleitung', level: /** @type {1} */ (1) }];
      const html = buildTableOfContents(entries, 'de');
      expect(html).toContain('aria-label="Inhaltsverzeichnis"');
    });

    it('should add toc-sub class for level-2 entries', () => {
      const entries = [
        { id: 'main', label: 'Main', level: /** @type {1} */ (1) },
        { id: 'sub', label: 'Sub', level: /** @type {2} */ (2) },
      ];
      const html = buildTableOfContents(entries, 'en');
      expect(html).toContain('class="toc-sub"');
    });

    it('should escape HTML in labels', () => {
      const entries = [
        { id: 'test', label: '<script>alert(1)</script>', level: /** @type {1} */ (1) },
      ];
      const html = buildTableOfContents(entries, 'en');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should strip leading # from entry ids', () => {
      const entries = [{ id: '#section', label: 'Section', level: /** @type {1} */ (1) }];
      const html = buildTableOfContents(entries, 'en');
      expect(html).toContain('href="#section"');
      expect(html).not.toContain('href="##section"');
    });
  });

  describe('buildQualityScoreBadge', () => {
    it('should return empty string for needs-improvement score', () => {
      const score = {
        wordCount: 10,
        analysisSections: 0,
        visualizationCount: 0,
        evidenceReferences: 0,
        overallScore: /** @type {'needs-improvement'} */ ('needs-improvement'),
      };
      expect(buildQualityScoreBadge(score)).toBe('');
    });

    it('should render badge for good score', () => {
      const score = {
        wordCount: 600,
        analysisSections: 2,
        visualizationCount: 1,
        evidenceReferences: 3,
        overallScore: /** @type {'good'} */ ('good'),
      };
      const html = buildQualityScoreBadge(score);
      expect(html).toContain('article-quality-score');
      expect(html).toContain('data-score="good"');
    });

    it('should include aria-hidden attribute', () => {
      const score = {
        wordCount: 600,
        analysisSections: 2,
        visualizationCount: 1,
        evidenceReferences: 3,
        overallScore: /** @type {'excellent'} */ ('excellent'),
      };
      const html = buildQualityScoreBadge(score);
      expect(html).toContain('aria-hidden="true"');
    });
  });

  describe('buildTimelineSection', () => {
    it('should return empty string for empty items', () => {
      expect(buildTimelineSection([], 'en')).toBe('');
    });

    it('should render a timeline section with items', () => {
      const items = [
        { date: '2026-01-15', label: 'First reading' },
        { date: '2026-03-10', label: 'Committee vote', description: 'Vote in ENVI' },
      ];
      const html = buildTimelineSection(items, 'en');
      expect(html).toContain('<section class="timeline-section"');
      expect(html).toContain('Legislative Timeline');
      expect(html).toContain('First reading');
      expect(html).toContain('Committee vote');
      expect(html).toContain('Vote in ENVI');
    });

    it('should use localized heading for German', () => {
      const html = buildTimelineSection([{ date: '2026-01-01', label: 'Start' }], 'de');
      expect(html).toContain('Legislativer Zeitplan');
    });

    it('should use English fallback for unknown language', () => {
      const html = buildTimelineSection([{ date: '2026-01-01', label: 'Start' }], 'xx');
      expect(html).toContain('Legislative Timeline');
    });

    it('should escape HTML in date and label', () => {
      const items = [{ date: '<b>date</b>', label: '<script>alert(1)</script>' }];
      const html = buildTimelineSection(items, 'en');
      expect(html).not.toContain('<b>date</b>');
      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).toContain('&lt;b&gt;date&lt;/b&gt;');
    });

    it('should include aria-label on section', () => {
      const html = buildTimelineSection([{ date: '2026-01-01', label: 'Start' }], 'en');
      expect(html).toContain('aria-label="Legislative Timeline"');
    });

    it('should render an ordered list', () => {
      const html = buildTimelineSection([{ date: '2026-01-01', label: 'Start' }], 'en');
      expect(html).toContain('<ol class="timeline-list"');
    });

    it('should render optional description when provided', () => {
      const items = [{ date: '2026-01-01', label: 'Event', description: 'Details here' }];
      const html = buildTimelineSection(items, 'en');
      expect(html).toContain('timeline-description');
      expect(html).toContain('Details here');
    });

    it('should not render description element when not provided', () => {
      const items = [{ date: '2026-01-01', label: 'Event' }];
      const html = buildTimelineSection(items, 'en');
      expect(html).not.toContain('timeline-description');
    });
  });

  describe('buildComparisonTable', () => {
    it('should return empty string for empty before array', () => {
      expect(buildComparisonTable([], ['After change'], 'en')).toBe('');
    });

    it('should return empty string for empty after array', () => {
      expect(buildComparisonTable(['Before change'], [], 'en')).toBe('');
    });

    it('should render a comparison table', () => {
      const html = buildComparisonTable(
        ['Old rule A', 'Old rule B'],
        ['New rule A', 'New rule B'],
        'en'
      );
      expect(html).toContain('<table class="comparison-table">');
      expect(html).toContain('Old rule A');
      expect(html).toContain('New rule A');
    });

    it('should use localized column headers', () => {
      const html = buildComparisonTable(['Alte Regel'], ['Neue Regel'], 'de');
      expect(html).toContain('<th scope="col">Vorher</th>');
      expect(html).toContain('<th scope="col">Nachher</th>');
    });

    it('should escape HTML in cell content', () => {
      const html = buildComparisonTable(['<script>alert(1)</script>'], ['After'], 'en');
      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include scope attributes for accessibility', () => {
      const html = buildComparisonTable(['A'], ['B'], 'en');
      expect(html).toContain('scope="col"');
    });

    it('should include role="region" on wrapper', () => {
      const html = buildComparisonTable(['A'], ['B'], 'en');
      expect(html).toContain('role="region"');
    });

    it('should handle mismatched array lengths using max length', () => {
      const html = buildComparisonTable(['A', 'B', 'C'], ['X'], 'en');
      expect(html).toContain('comparison-before');
      // 3 body rows + 1 header row = 4 total <tr> elements
      const rowMatches = html.match(/<tr>/g);
      expect(rowMatches).toHaveLength(4);
    });
  });

  describe('buildKeyFiguresBar', () => {
    it('should return empty string for empty figures', () => {
      expect(buildKeyFiguresBar([], 'en')).toBe('');
    });

    it('should render a key figures bar', () => {
      const figures = [
        { label: 'Votes cast', value: '400' },
        { label: 'In favour', value: '280', unit: 'MEPs' },
      ];
      const html = buildKeyFiguresBar(figures, 'en');
      expect(html).toContain('key-figures-bar');
      expect(html).toContain('Votes cast');
      expect(html).toContain('400');
      expect(html).toContain('280');
      expect(html).toContain('MEPs');
    });

    it('should use localized heading', () => {
      const html = buildKeyFiguresBar([{ label: 'Test', value: '1' }], 'de');
      expect(html).toContain('Schlüsselzahlen');
    });

    it('should include sr-only heading', () => {
      const html = buildKeyFiguresBar([{ label: 'Test', value: '1' }], 'en');
      expect(html).toContain('class="sr-only"');
    });

    it('should include aria-label on figure cards', () => {
      const html = buildKeyFiguresBar([{ label: 'Votes', value: '400', unit: 'MEPs' }], 'en');
      expect(html).toContain('aria-label="Votes: 400 MEPs"');
    });

    it('should render optional description as sr-only', () => {
      const figures = [{ label: 'Votes', value: '400', description: 'Total votes cast' }];
      const html = buildKeyFiguresBar(figures, 'en');
      expect(html).toContain('Total votes cast');
      expect(html).toContain('sr-only');
    });

    it('should escape HTML in labels and values', () => {
      const figures = [{ label: '<b>Label</b>', value: '<em>100</em>' }];
      const html = buildKeyFiguresBar(figures, 'en');
      expect(html).not.toContain('<b>Label</b>');
      expect(html).toContain('&lt;b&gt;Label&lt;/b&gt;');
    });

    it('should include unit with aria-hidden', () => {
      const figures = [{ label: 'Votes', value: '400', unit: 'MEPs' }];
      const html = buildKeyFiguresBar(figures, 'en');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('kf-unit');
    });

    it('should not render unit span when unit is not provided', () => {
      const figures = [{ label: 'Votes', value: '400' }];
      const html = buildKeyFiguresBar(figures, 'en');
      expect(html).not.toContain('kf-unit');
    });
  });
});
