// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { buildArticleToc, localizeArticleBody } from '../../scripts/aggregator/article-html.js';
import { ALL_LANGUAGES } from '../../scripts/constants/languages.js';

describe('article-localization', () => {
  describe('buildArticleToc', () => {
    it('should translate the Reader Intelligence Guide title for non-English languages', () => {
      const entries = [
        { id: 'reader-intelligence-guide', title: 'Reader Intelligence Guide' },
      ];
      const result = buildArticleToc(entries, 'sv');
      expect(result).toContain('Läsarguide för underrättelser');
      expect(result).not.toContain('Reader Intelligence Guide');
    });

    it('should translate Tradecraft References title for non-English languages', () => {
      const entries = [
        { id: 'aggregator-tradecraft-references', title: 'Tradecraft References' },
      ];
      const result = buildArticleToc(entries, 'de');
      expect(result).toContain('Tradecraft-Referenzen');
      expect(result).not.toContain('>Tradecraft References<');
    });

    it('should translate Analysis Index title for non-English languages', () => {
      const entries = [
        { id: 'aggregator-analysis-index', title: 'Analysis Index' },
      ];
      const result = buildArticleToc(entries, 'fr');
      expect(result).toContain("Index d&#39;analyse");
    });

    it('should translate Key Takeaways title for non-English languages', () => {
      const entries = [
        { id: 'section-key-takeaways', title: 'Key Takeaways' },
      ];
      const result = buildArticleToc(entries, 'ja');
      expect(result).toContain('重要ポイント');
      expect(result).not.toContain('Key Takeaways');
    });

    it('should translate Supplementary Intelligence title for non-English languages', () => {
      const entries = [
        { id: 'supplementary-intelligence', title: 'Supplementary Intelligence' },
      ];
      const result = buildArticleToc(entries, 'es');
      expect(result).toContain('Inteligencia complementaria');
    });

    it('should translate artifact section titles for non-English languages', () => {
      const entries = [
        { id: 'section-economic-context', title: 'Economic Context' },
        { id: 'section-risk', title: 'Risk Assessment' },
      ];
      const result = buildArticleToc(entries, 'sv');
      expect(result).toContain('Ekonomisk kontext');
      expect(result).toContain('Riskbedömning');
    });

    it('should use English titles when lang is en', () => {
      const entries = [
        { id: 'aggregator-tradecraft-references', title: 'Tradecraft References' },
        { id: 'aggregator-analysis-index', title: 'Analysis Index' },
      ];
      const result = buildArticleToc(entries, 'en');
      expect(result).toContain('Tradecraft References');
      expect(result).toContain('Analysis Index');
    });

    it('should translate the TOC aria-label for non-English languages', () => {
      const entries = [
        { id: 'section-risk', title: 'Risk Assessment' },
      ];
      const result = buildArticleToc(entries, 'de');
      expect(result).toContain('Inhaltsverzeichnis');
    });

    it('should return empty string when no entries', () => {
      const result = buildArticleToc([], 'sv');
      expect(result).toBe('');
    });
  });

  describe('localizeArticleBody', () => {
    const sampleBody = [
      '<h2 id="aggregator-tradecraft-references">Tradecraft References</h2>',
      '<p>This article is produced under the <a href="https://hack23.com">Hack23 AB</a> intelligence tradecraft library. Every methodology and artifact template applied to this run is linked below.</p>',
      '<h3>Methodologies</h3>',
      '<ul><li><a href="#">Test</a></li></ul>',
      '<h3>Artifact templates</h3>',
      '<ul><li><a href="#">Template</a></li></ul>',
      '<h2 id="aggregator-analysis-index">Analysis Index</h2>',
      '<p>Every artifact below was read by the aggregator and contributed to this article. The raw <a href="https://github.com/test/manifest.json">manifest.json</a> carries the full machine-readable list, including gate-result history.</p>',
      '<table><thead><tr><th>Section</th><th>Artifact</th><th>Path</th></tr></thead></table>',
      '<h2 id="section-key-takeaways">Key Takeaways</h2>',
      '<h2 id="supplementary-intelligence">Supplementary Intelligence</h2>',
    ].join('\n');

    it('should return body unchanged for English', () => {
      const result = localizeArticleBody(sampleBody, 'en');
      expect(result).toBe(sampleBody);
    });

    it('should translate Tradecraft References heading for Swedish', () => {
      const result = localizeArticleBody(sampleBody, 'sv');
      expect(result).toContain('Tradecraft-referenser');
      expect(result).not.toContain('>Tradecraft References<');
    });

    it('should translate Methodologies sub-heading', () => {
      const result = localizeArticleBody(sampleBody, 'de');
      expect(result).toContain('<h3>Methoden</h3>');
      expect(result).not.toContain('<h3>Methodologies</h3>');
    });

    it('should translate Artifact templates sub-heading', () => {
      const result = localizeArticleBody(sampleBody, 'fr');
      expect(result).toContain("Mod\u00E8les d&#39;artefacts");
    });

    it('should translate Analysis Index heading', () => {
      const result = localizeArticleBody(sampleBody, 'ja');
      expect(result).toContain('分析インデックス');
    });

    it('should translate Analysis Index table headers', () => {
      const result = localizeArticleBody(sampleBody, 'sv');
      expect(result).toContain('Avsnitt');
      expect(result).toContain('Artefakt');
      expect(result).toContain('Sökväg');
      expect(result).not.toMatch(/<th>Section<\/th>/);
    });

    it('should translate Key Takeaways heading', () => {
      const result = localizeArticleBody(sampleBody, 'ko');
      expect(result).toContain('핵심 요점');
      expect(result).not.toContain('>Key Takeaways<');
    });

    it('should translate Supplementary Intelligence heading', () => {
      const result = localizeArticleBody(sampleBody, 'ar');
      expect(result).toContain('معلومات استخباراتية تكميلية');
    });

    it('should translate tradecraft intro paragraph', () => {
      const result = localizeArticleBody(sampleBody, 'sv');
      expect(result).toContain('Hack23 AB');
      expect(result).not.toContain('intelligence tradecraft library');
    });

    it('should work for all 14 supported languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const result = localizeArticleBody(sampleBody, lang);
        expect(result).toBeDefined();
        if (lang !== 'en') {
          // Non-English should have translated the heading
          expect(result).not.toContain('>Tradecraft References<');
        }
      }
    });
  });
});
