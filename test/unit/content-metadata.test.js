// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for content-metadata.ts
 * Tests content-based metadata enrichment: title, description, keyword extraction
 */

import { describe, it, expect } from 'vitest';
import { enrichMetadataFromContent } from '../../scripts/utils/content-metadata.js';

const baseMetadata = {
  title: 'Week Ahead: 2026-03-21 to 2026-03-28',
  subtitle: 'Generic fallback subtitle',
  keywords: ['European Parliament', 'week ahead'],
  category: 'week-ahead',
};

describe('content-metadata', () => {
  describe('enrichMetadataFromContent', () => {
    it('should enrich title with content-derived heading when available', () => {
      const content = `
        <div class="article-content">
          <p class="lede">The European Parliament faces a critical vote on defence spending.</p>
          <h2>Defence Budget Debate Intensifies</h2>
          <p>MEPs will vote on the 150 billion EUR package.</p>
          <h3>ENVI Committee Reviews Climate Package</h3>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.title).toContain('Week Ahead');
      // Title should be enriched with heading or stat
      expect(enriched.title).toContain('—');
    });

    it('should use lede paragraph as description', () => {
      const content = `
        <div class="article-content">
          <p class="lede">The European Parliament will debate 5 key legislative proposals this week including the Clean Industrial Deal.</p>
          <h2>Key Legislation</h2>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.subtitle).toContain('European Parliament');
      expect(enriched.subtitle).toContain('Clean Industrial Deal');
    });

    it('should use section lede paragraph as description', () => {
      const content = `
        <div class="article-content">
          <section class="lede">
            <p>The European Parliament enters a decisive week with negotiations on defence procurement and climate targets.</p>
          </section>
          <h2>Strategic Priorities</h2>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.subtitle).toContain('European Parliament');
      expect(enriched.subtitle).toContain('defence procurement');
      expect(enriched.subtitle).toContain('climate targets');
    });

    it('should fall back to base subtitle when content has no lede', () => {
      const content = '<div class="article-content"><span>tiny</span></div>';

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.subtitle).toBe('Generic fallback subtitle');
    });

    it('should extract committee abbreviations as keywords', () => {
      const content = `
        <div class="article-content">
          <h2>ENVI Committee Activity</h2>
          <p>The ECON and AFET committees also met this week.</p>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.keywords).toContain('ENVI');
      expect(enriched.keywords).toContain('ECON');
      expect(enriched.keywords).toContain('AFET');
    });

    it('should extract political group names as keywords', () => {
      const content = `
        <div class="article-content">
          <p class="lede">EPP and S&amp;D voted together on the defence package while ECR opposed.</p>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.keywords).toContain('EPP');
      expect(enriched.keywords).toContain('ECR');
    });

    it('should extract headings as keywords', () => {
      const content = `
        <div class="article-content">
          <h2>Clean Industrial Deal Progress</h2>
          <h3>Defence Spending Resolution</h3>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.keywords).toContain('Clean Industrial Deal Progress');
      expect(enriched.keywords).toContain('Defence Spending Resolution');
    });

    it('should preserve base keywords', () => {
      const content = '<div class="article-content"><p>Simple content.</p></div>';

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.keywords).toContain('European Parliament');
      expect(enriched.keywords).toContain('week ahead');
    });

    it('should preserve base category', () => {
      const content = '<div class="article-content"><p>Test.</p></div>';

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.category).toBe('week-ahead');
    });

    it('should not modify title if it already has a long suffix', () => {
      const alreadyEnrichedMeta = {
        ...baseMetadata,
        title: 'March Plenary Surge: 86 Adopted Texts — Defence and Climate Dominate EP10 Agenda',
      };
      const content = '<div><h2>Test heading</h2></div>';

      const enriched = enrichMetadataFromContent(content, alreadyEnrichedMeta);
      // Title already has a long suffix with —, should not be modified
      expect(enriched.title).toBe(alreadyEnrichedMeta.title);
    });

    it('should extract statistics from content for title suffix', () => {
      const content = `
        <div class="article-content">
          <p class="lede">The Parliament adopted 42 adopted texts this session.</p>
          <h2>Plenary Session Results</h2>
          <p>With 85% approval rate, the session was highly productive.</p>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      // Title should include a statistic
      expect(enriched.title).toContain('—');
      expect(enriched.title).toMatch(/\d+/);
    });

    it('should limit description to 200 characters', () => {
      const longLede =
        'The European Parliament held an extraordinary session covering defence, climate, digital regulation, agricultural reform, and economic governance. ' +
        'MEPs debated twenty-five legislative proposals across three committees in an unprecedented day of parliamentary activity that set new records for legislative throughput.';
      const content = `<div><p class="lede">${longLede}</p></div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.subtitle.length).toBeLessThanOrEqual(200);
    });

    it('should limit keywords to 15', () => {
      const headings = Array.from(
        { length: 20 },
        (_, i) => `<h2>Topic Number ${i + 1} With Extra Words</h2>`
      ).join('');
      const content = `<div>${headings}</div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      expect(enriched.keywords.length).toBeLessThanOrEqual(15);
    });

    it('should deduplicate keywords', () => {
      const content = `
        <div>
          <h2>ENVI Committee Report</h2>
          <h3>ENVI Climate Action Plan</h3>
          <p>ENVI leads on environment policy.</p>
        </div>`;

      const enriched = enrichMetadataFromContent(content, baseMetadata);
      const enviCount = enriched.keywords.filter((k) => k === 'ENVI').length;
      expect(enviCount).toBeLessThanOrEqual(1);
    });
  });
});
