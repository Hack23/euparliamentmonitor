// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for backfill-reader-label module.
 * Tests truncated reader-label detection and stripping for CJK and Latin scripts.
 */

import { describe, it, expect } from 'vitest';

const {
  stripTruncatedReaderLabel,
  findTruncatedReaderLabelCut,
  hasTruncatedReaderLabelInBody,
} = await import('../../scripts/generators/news-indexes/backfill-reader-label.js');

describe('backfill-reader-label', () => {
  describe('findTruncatedReaderLabelCut', () => {
    it('returns -1 when text is too short', () => {
      expect(findTruncatedReaderLabelCut('short', 'en')).toBe(-1);
    });

    it('returns -1 when no reader label fragment is present', () => {
      const text = 'A completely unrelated description about EU policy developments and their impact on citizens.';
      expect(findTruncatedReaderLabelCut(text, 'en')).toBe(-1);
    });

    it('returns -1 when the full reader label is present (not truncated)', () => {
      const fullLabel = 'for democratic-accountability readers tracking EU institutional consequences';
      const text = `EU policy analysis ${fullLabel}`;
      expect(findTruncatedReaderLabelCut(text, 'en')).toBe(-1);
    });

    it('returns cut index when a truncated reader label suffix is found', () => {
      // Simulate a truncation: the label starts with "for democratic-accountability readers..."
      // but is cut after "for democratic-accountability re"
      const truncated = 'EU policy analysis for democratic-accountability re';
      const cut = findTruncatedReaderLabelCut(truncated, 'en');
      expect(cut).toBeGreaterThan(0);
      expect(cut).toBeLessThan(truncated.length);
    });

    it('handles Swedish reader label truncation', () => {
      // Swedish label: 'för läsare som följer EU-institutionernas demokratiska konsekvenser'
      const truncated = 'Svensk analys av EU för läsare som följer EU-institu';
      const cut = findTruncatedReaderLabelCut(truncated, 'sv');
      expect(cut).toBeGreaterThan(0);
    });
  });

  describe('stripTruncatedReaderLabel', () => {
    it('returns input unchanged when no truncated label is present', () => {
      const text = 'A normal description without any reader label fragments at all in this text.';
      expect(stripTruncatedReaderLabel(text, 'en')).toBe(text);
    });

    it('strips a truncated English reader label from the tail', () => {
      const body = 'EU policy impact analysis';
      const truncated = `${body} for democratic-accountability readers tra`;
      const result = stripTruncatedReaderLabel(truncated, 'en');
      expect(result).toBe(body);
    });

    it('trims trailing punctuation after stripping', () => {
      const body = 'EU policy impact analysis';
      const truncated = `${body}, for democratic-accountability readers tra.`;
      const result = stripTruncatedReaderLabel(truncated, 'en');
      // Should strip the punctuation and separator
      expect(result).not.toContain('for democratic');
      expect(result.length).toBeLessThan(truncated.length);
    });

    it('returns trimmed input when text is too short', () => {
      expect(stripTruncatedReaderLabel('  hi  ', 'en')).toBe('hi');
    });
  });

  describe('hasTruncatedReaderLabelInBody', () => {
    it('returns false for clean descriptions', () => {
      const text = 'A perfectly clean description about European Parliament monitoring and democratic accountability.';
      expect(hasTruncatedReaderLabelInBody(text, 'en')).toBe(false);
    });

    it('returns true when a truncated reader label is detected', () => {
      const truncated = 'EU policy developments for democratic-accountability readers tra';
      expect(hasTruncatedReaderLabelInBody(truncated, 'en')).toBe(true);
    });

    it('returns false when the full reader label is present', () => {
      const full = 'EU analysis for democratic-accountability readers tracking EU institutional consequences';
      expect(hasTruncatedReaderLabelInBody(full, 'en')).toBe(false);
    });
  });
});
