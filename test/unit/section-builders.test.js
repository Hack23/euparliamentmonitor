// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

import { describe, it, expect } from 'vitest';
import {
  computeArticleQualityScore,
  buildTableOfContents,
  buildQualityScoreBadge,
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
});
