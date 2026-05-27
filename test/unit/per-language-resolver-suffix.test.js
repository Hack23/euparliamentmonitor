// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for per-language-resolver appendRunNumberSuffix
 * Verifies that run numbers are never appended to article titles.
 */
import { describe, it, expect } from 'vitest';

const { appendRunNumberSuffix } = await import(
  '../../scripts/aggregator/metadata/per-language-resolver.js'
);

describe('appendRunNumberSuffix', () => {
  it('never appends run number — titles must be readable articles', () => {
    const result = appendRunNumberSuffix('Short Title', 'en', 'run-3');
    expect(result).toBe('Short Title');
  });

  it('returns original when no runId', () => {
    const result = appendRunNumberSuffix('Title', 'en', '');
    expect(result).toBe('Title');
  });

  it('does not modify titles regardless of budget', () => {
    const longTitle = 'European Parliament Discusses Important Legislation Today Now';
    const result = appendRunNumberSuffix(longTitle, 'en', 'run-1');
    expect(result).toBe(longTitle);
  });

  it('does not modify CJK titles', () => {
    const title = '欧州議会の重要な法律の投票結果を報告する文書です全世界';
    const result = appendRunNumberSuffix(title, 'ja', 'run-1');
    expect(result).toBe(title);
  });

  it('never contains Run N in output', () => {
    const result = appendRunNumberSuffix('Any Title', 'en', 'run-42');
    expect(result).not.toContain('Run 42');
  });
});
