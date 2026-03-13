// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

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

    it('should count dashboard and mindmap as visualizations', () => {
      const content =
        '<div class="dashboard-section">x</div><div class="mindmap-section">y</div>';
      const score = computeArticleQualityScore(content);
      expect(score.visualizationCount).toBe(2);
    });

    it('should rate excellent for rich content', () => {
      // 810 words exceeds the 800-word threshold required for 'excellent' rating
      const words = Array(810).fill('word').join(' ');
      const sections =
        '<section>a</section><section>b</section><section>c</section>';
      const visuals =
        '<div class="dashboard-section">x</div><div class="mindmap-section">y</div>';
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
