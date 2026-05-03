// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Tests for article-metadata resolution logic.
 *
 * Validates that `resolveArticleMetadata` produces deterministic, well-formed
 * metadata objects from analysis-run inputs. Covers title derivation,
 * description extraction, date formatting, and slug handling.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveArticleMetadata,
  humanizeSlug,
  extractFirstH1,
  truncateTitle,
  truncateDescription,
  shouldSkipDescriptionLine,
  stripInlineMarkdown,
  deriveWeekRange,
  deriveMonthLabel,
  deriveQuarterLabel,
  deriveYearLabel,
} from '../../scripts/aggregator/article-metadata.js';

describe('aggregator-article-meta', () => {
  describe('humanizeSlug', () => {
    it('converts kebab-case slug to title case', () => {
      expect(humanizeSlug('week-ahead')).toBe('Week Ahead');
      expect(humanizeSlug('month-in-review')).toBe('Month In Review');
      expect(humanizeSlug('breaking')).toBe('Breaking');
    });

    it('handles empty or undefined input gracefully', () => {
      expect(humanizeSlug('')).toBe('');
    });
  });

  describe('extractFirstH1', () => {
    it('extracts the first H1 from markdown', () => {
      const md = '# EU Parliament Week Ahead\n\nSome content here.';
      expect(extractFirstH1(md)).toBe('EU Parliament Week Ahead');
    });

    it('returns empty string when no H1 is present', () => {
      const md = '## Subtitle only\n\nNo heading-1 present.';
      expect(extractFirstH1(md)).toBe('');
    });
  });

  describe('truncateTitle', () => {
    it('does not truncate short titles', () => {
      const title = 'Short Title';
      expect(truncateTitle(title)).toBe(title);
    });

    it('truncates titles that exceed the limit', () => {
      // 200 chars exceeds any reasonable title limit — verify truncation occurs
      const longTitle = 'A'.repeat(200);
      const result = truncateTitle(longTitle);
      expect(result.length).toBeLessThan(200);
    });
  });

  describe('truncateDescription', () => {
    it('does not truncate short descriptions', () => {
      const desc = 'A short description.';
      expect(truncateDescription(desc)).toBe(desc);
    });

    it('truncates long descriptions at word boundary', () => {
      // 100 words far exceeds the ~160-char description limit
      const words = Array(100).fill('word').join(' ');
      const result = truncateDescription(words);
      expect(result.length).toBeLessThanOrEqual(320);
    });
  });

  describe('shouldSkipDescriptionLine', () => {
    it('skips empty lines', () => {
      expect(shouldSkipDescriptionLine('')).toBe(true);
    });

    it('skips markdown headings', () => {
      expect(shouldSkipDescriptionLine('# Title')).toBe(true);
      expect(shouldSkipDescriptionLine('## Subtitle')).toBe(true);
    });

    it('skips mermaid blocks', () => {
      expect(shouldSkipDescriptionLine('```mermaid')).toBe(true);
    });

    it('accepts normal prose lines', () => {
      expect(shouldSkipDescriptionLine('The European Parliament voted on...')).toBe(false);
    });
  });

  describe('stripInlineMarkdown', () => {
    it('removes bold markers', () => {
      expect(stripInlineMarkdown('**bold text**')).toBe('bold text');
    });

    it('removes italic markers', () => {
      expect(stripInlineMarkdown('*italic*')).toBe('italic');
    });

    it('removes inline code', () => {
      expect(stripInlineMarkdown('use `const`')).toBe('use const');
    });
  });

  describe('date derivation helpers', () => {
    it('deriveWeekRange returns an object with start and end', () => {
      const result = deriveWeekRange('2026-05-01');
      expect(result).toBeTruthy();
      expect(result).toHaveProperty('start');
      expect(result).toHaveProperty('end');
    });

    it('deriveMonthLabel returns a month string', () => {
      const result = deriveMonthLabel('2026-05-01');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('deriveQuarterLabel returns a quarter string', () => {
      const result = deriveQuarterLabel('2026-05-01');
      expect(result).toBeTruthy();
      expect(result).toContain('Q');
    });

    it('deriveYearLabel returns a year string', () => {
      const result = deriveYearLabel('2026-05-01');
      expect(result).toBeTruthy();
      expect(result).toContain('2026');
    });
  });

  describe('resolveArticleMetadata', () => {
    it('produces per-language metadata with title and description', () => {
      const meta = resolveArticleMetadata({
        articleType: 'breaking',
        date: '2026-05-01',
        markdown: '# Breaking: Key Vote\n\nThe EP voted today on...',
      });

      // Returns a map keyed by language code
      expect(meta).toHaveProperty('en');
      expect(meta.en).toHaveProperty('title');
      expect(meta.en).toHaveProperty('description');
      expect(meta.en.title.length).toBeGreaterThan(0);
    });

    it('returns deterministic results for same inputs', () => {
      const opts = {
        articleType: 'week-ahead',
        date: '2026-05-01',
        markdown: '# Week Ahead: Plenary Session\n\nKey items on the agenda.',
      };

      const meta1 = resolveArticleMetadata(opts);
      const meta2 = resolveArticleMetadata(opts);

      expect(meta1).toEqual(meta2);
    });

    it('produces entries for all 14 languages', () => {
      const meta = resolveArticleMetadata({
        articleType: 'breaking',
        date: '2026-05-01',
        markdown: '# Breaking News\n\nContent here.',
      });

      const langs = Object.keys(meta);
      expect(langs.length).toBe(14);
    });
  });
});
