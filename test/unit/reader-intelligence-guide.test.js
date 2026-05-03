// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import {
  buildReaderIntelligenceGuideHtml,
  stripInlineReaderGuide,
  READER_GUIDE_TITLE_LABELS,
  READER_GUIDE_INTRO_LABELS,
  READER_GUIDE_COL_NEED_LABELS,
  READER_GUIDE_COL_VALUE_LABELS,
  READER_GUIDE_COL_SOURCE_LABELS,
} from '../../scripts/aggregator/reader-intelligence-guide.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

describe('reader-intelligence-guide', () => {
  const sampleSections = [
    { id: 'section-executive-brief', title: 'Executive Brief' },
    { id: 'section-synthesis', title: 'Synthesis Summary' },
    { id: 'section-risk', title: 'Risk Assessment' },
  ];

  const sampleIncluded = [
    {
      runRelPath: 'executive-brief.md',
      repoRelPath: 'analysis/daily/2026-01-15/breaking/executive-brief.md',
      sectionId: 'section-executive-brief',
    },
    {
      runRelPath: 'synthesis.md',
      repoRelPath: 'analysis/daily/2026-01-15/breaking/synthesis.md',
      sectionId: 'section-synthesis',
    },
  ];

  describe('buildReaderIntelligenceGuideHtml', () => {
    it('emits exactly one component with data-component="reader-intelligence-guide"', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      const matches = html.match(/data-component="reader-intelligence-guide"/g);
      expect(matches).toHaveLength(1);
    });

    it('renders a translated title for each of the 14 supported languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const html = buildReaderIntelligenceGuideHtml(lang, sampleSections, sampleIncluded);
        expect(html).not.toBe('');
        // Title goes through escapeHTML; check for the escaped version
        const expectedTitle = READER_GUIDE_TITLE_LABELS[lang].replace(/'/g, '&#39;');
        expect(html).toContain(expectedTitle);
      }
    });

    it('renders translated table headers for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const html = buildReaderIntelligenceGuideHtml(lang, sampleSections, sampleIncluded);
        // Column headers go through escapeHTML; check that column content is present
        // (escapeHTML only affects &, <, >, ", ' → &#39;)
        const needLabel = READER_GUIDE_COL_NEED_LABELS[lang].replace(/'/g, '&#39;');
        const valueLabel = READER_GUIDE_COL_VALUE_LABELS[lang].replace(/'/g, '&#39;');
        const sourceLabel = READER_GUIDE_COL_SOURCE_LABELS[lang].replace(/'/g, '&#39;');
        expect(html).toContain(needLabel);
        expect(html).toContain(valueLabel);
        expect(html).toContain(sourceLabel);
      }
    });

    it('renders translated introduction text for all 14 languages', () => {
      for (const lang of ALL_LANGUAGES) {
        const html = buildReaderIntelligenceGuideHtml(lang, sampleSections, sampleIncluded);
        // The intro text is HTML-escaped; apply the same escaping to compare correctly
        const rawIntro = READER_GUIDE_INTRO_LABELS[lang];
        const escapedIntro = rawIntro
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        expect(html).toContain(`<p>${escapedIntro}</p>`);
      }
    });

    it('includes section anchors linking to the corresponding H2 IDs', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      expect(html).toContain('href="#section-executive-brief"');
      expect(html).toContain('href="#section-synthesis"');
      expect(html).toContain('href="#section-risk"');
    });

    it('shows the source artifact run-relative path as <code>', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      expect(html).toContain('<code>executive-brief.md</code>');
      expect(html).toContain('<code>synthesis.md</code>');
    });

    it('falls back to section title when no artifact is found for a section', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      // Risk section has no matching included artifact, so it uses the section title
      expect(html).toContain('Risk Assessment');
    });

    it('returns empty string when no sections match the guide rows', () => {
      const html = buildReaderIntelligenceGuideHtml('en', [
        { id: 'section-unknown', title: 'Unknown' },
      ], []);
      expect(html).toBe('');
    });

    it('sets dir="rtl" for Arabic', () => {
      const html = buildReaderIntelligenceGuideHtml('ar', sampleSections, sampleIncluded);
      expect(html).toContain('dir="rtl"');
    });

    it('sets dir="rtl" for Hebrew', () => {
      const html = buildReaderIntelligenceGuideHtml('he', sampleSections, sampleIncluded);
      expect(html).toContain('dir="rtl"');
    });

    it('does NOT set dir="rtl" for LTR languages', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      expect(html).not.toContain('dir="rtl"');
    });

    it('uses a semantic <section> wrapper with proper aria-label', () => {
      const html = buildReaderIntelligenceGuideHtml('de', sampleSections, sampleIncluded);
      expect(html).toContain('<section');
      expect(html).toContain('aria-label="Leser-Intelligenz-Leitfaden"');
    });

    it('wraps the table in a scrollable region for responsive layout', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      expect(html).toContain('class="table-scroll"');
      expect(html).toContain('role="region"');
      expect(html).toContain('tabindex="0"');
    });

    it('adds scope="col" to all table header cells for screen-reader nav', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      const thMatches = html.match(/<th scope="col">/g);
      expect(thMatches).toHaveLength(3);
    });

    it('adds a sr-only <caption> that matches the guide title', () => {
      const html = buildReaderIntelligenceGuideHtml('en', sampleSections, sampleIncluded);
      expect(html).toContain('<caption class="sr-only">Reader Intelligence Guide</caption>');
    });
  });

  describe('stripInlineReaderGuide', () => {
    it('removes an H2-based reader intelligence guide section from HTML', () => {
      const html = [
        '<h1>Article Title</h1>',
        '<h2 id="reader-intelligence-guide">Reader Intelligence Guide</h2>',
        '<p>Some guide content</p>',
        '<table><tr><td>Row</td></tr></table>',
        '<h2 id="section-risk">Risk Assessment</h2>',
        '<p>Risk content</p>',
      ].join('\n');
      const result = stripInlineReaderGuide(html);
      expect(result).not.toContain('Reader Intelligence Guide');
      expect(result).not.toContain('Some guide content');
      expect(result).toContain('Risk Assessment');
      expect(result).toContain('Risk content');
    });

    it('handles HTML where the guide is the last section', () => {
      const html = [
        '<h2 id="section-synthesis">Synthesis</h2>',
        '<p>Synthesis content</p>',
        '<h2 id="reader-intelligence-guide">Reader Intelligence Guide</h2>',
        '<p>Guide at end</p>',
      ].join('\n');
      const result = stripInlineReaderGuide(html);
      expect(result).toContain('Synthesis');
      expect(result).not.toContain('Guide at end');
    });

    it('leaves HTML intact when no reader guide is present', () => {
      const html = '<h2 id="section-risk">Risk</h2>\n<p>Content</p>';
      const result = stripInlineReaderGuide(html);
      expect(result).toBe(html);
    });

    it('handles single-quoted id attributes', () => {
      const html = "<h2 id='reader-intelligence-guide'>Guide</h2>\n<p>Data</p>\n<h2 id='other'>Other</h2>";
      const result = stripInlineReaderGuide(html);
      expect(result).not.toContain('Guide');
      expect(result).toContain('Other');
    });
  });

  describe('translation completeness', () => {
    it('all 14 languages have non-empty title labels', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(READER_GUIDE_TITLE_LABELS[lang]).toBeTruthy();
        expect(READER_GUIDE_TITLE_LABELS[lang].length).toBeGreaterThan(0);
      }
    });

    it('all 14 languages have non-empty intro labels', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(READER_GUIDE_INTRO_LABELS[lang]).toBeTruthy();
        expect(READER_GUIDE_INTRO_LABELS[lang].length).toBeGreaterThan(0);
      }
    });

    it('all 14 languages have non-empty column need labels', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(READER_GUIDE_COL_NEED_LABELS[lang]).toBeTruthy();
      }
    });

    it('all 14 languages have non-empty column value labels', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(READER_GUIDE_COL_VALUE_LABELS[lang]).toBeTruthy();
      }
    });

    it('all 14 languages have non-empty column source labels', () => {
      for (const lang of ALL_LANGUAGES) {
        expect(READER_GUIDE_COL_SOURCE_LABELS[lang]).toBeTruthy();
      }
    });
  });
});
