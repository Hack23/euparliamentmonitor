// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for per-language-resolver appendRunNumberSuffix
 * Covers word-boundary-aware truncation fix.
 */
import { describe, it, expect } from 'vitest';

const { appendRunNumberSuffix } = await import(
  '../../scripts/aggregator/metadata/per-language-resolver.js'
);

describe('appendRunNumberSuffix', () => {
  it('appends suffix when title fits within budget', () => {
    const result = appendRunNumberSuffix('Short Title', 'en', 'run-3');
    expect(result).toBe('Short Title — Run 3');
  });

  it('returns original when no runId', () => {
    const result = appendRunNumberSuffix('Title', 'en', '');
    expect(result).toBe('Title');
  });

  it('does not produce mid-word truncation for Latin titles', () => {
    // English budget is 60. "— Run 1" = 8 chars → headroom = 52.
    // A 55-char title should be trimmed to a word boundary
    const longTitle = 'European Parliament Discusses Important Legislation Today Now';
    const result = appendRunNumberSuffix(longTitle, 'en', 'run-1');
    // Should NOT end with a mid-word fragment like "Parlia" or "Legislat"
    const titlePart = result.replace(/ — Run \d+$/, '');
    // Every word in the title part should be a complete word from the original
    const words = titlePart.split(/\s+/);
    const originalWords = longTitle.split(/\s+/);
    for (const word of words) {
      expect(originalWords).toContain(word);
    }
  });

  it('trims to last complete word for Latin scripts', () => {
    // Create a title that's exactly budget+1 with suffix
    // en budget = 60, suffix " — Run 1" = 8 chars, headroom = 52
    // "Parliament Discusses Important Climate Change" = 46 chars
    // "Parliament Discusses Important Climate Changes" = 47 chars
    // "Parliament Discusses Important Climate Changess" = 48 chars
    const title = 'Parliament Discusses Important Climate Legislation Bills';
    const result = appendRunNumberSuffix(title, 'en', 'run-1');
    expect(result).toContain(' — Run 1');
    // Should not end with a partial word before the suffix
    const editorial = result.replace(/ — Run 1$/, '');
    expect(editorial).not.toMatch(/[a-z][A-Z]/); // no camelCase mid-word
    // Verify each word is complete
    const words = editorial.split(/\s+/);
    for (const w of words) {
      expect(title).toContain(w);
    }
  });

  it('handles CJK titles without word-boundary trimming', () => {
    // CJK budget = 30, each grapheme is a "word"
    // suffix " — Run 1" = 8 chars → headroom = 22
    const title = '欧州議会の重要な法律の投票結果を報告する文書です全世界';
    const result = appendRunNumberSuffix(title, 'ja', 'run-1');
    expect(result).toContain(' — Run 1');
  });

  it('returns original when suffix alone exceeds budget', () => {
    const result = appendRunNumberSuffix('A', 'ja', 'run-123456789012345678901234567890');
    // If suffix length >= budget, should return original
    expect(result).toBe('A');
  });

  it('does not duplicate Run N if already present', () => {
    const result = appendRunNumberSuffix('Title — Run 3', 'en', 'run-3');
    expect(result).toBe('Title — Run 3');
  });
});
