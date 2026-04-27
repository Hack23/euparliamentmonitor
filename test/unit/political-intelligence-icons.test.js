// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `Generators/PoliticalIntelligence/Icons` —
 * `pickDocumentIcon` and `pickRunIcon`. Covers the rule precedence,
 * case-insensitivity, fallback defaults, and the ZWJ-emoji edge cases
 * that previously lived only inside the political-intelligence
 * monolith.
 */

import { describe, it, expect } from 'vitest';
import {
  pickDocumentIcon,
  pickRunIcon,
  DEFAULT_DOCUMENT_ICON,
  DEFAULT_RUN_ICON,
} from '../../scripts/generators/political-intelligence/icons.js';

describe('pickDocumentIcon', () => {
  it('returns the SWOT icon for a swot stem', () => {
    expect(pickDocumentIcon('swot')).toBe('🧭');
  });

  it('matches case-insensitively', () => {
    expect(pickDocumentIcon('SWOT')).toBe('🧭');
    expect(pickDocumentIcon('SwOt')).toBe('🧭');
  });

  it('matches by includes (substring), not equality', () => {
    expect(pickDocumentIcon('political-swot-q4')).toBe('🧭');
    expect(pickDocumentIcon('strategic-pestle-2026')).toBe('🌍');
  });

  it('respects rule precedence — intelligence-brief beats intelligence', () => {
    // intelligence-brief comes first in the rule list
    expect(pickDocumentIcon('intelligence-brief-2026-04-27')).toBe('🗞️');
    // bare intelligence falls through to the magnifying glass
    expect(pickDocumentIcon('intelligence-snapshot')).toBe('🔍');
  });

  it('returns the default icon for unknown stems', () => {
    expect(pickDocumentIcon('zzz-nothing-matches')).toBe(DEFAULT_DOCUMENT_ICON);
    expect(DEFAULT_DOCUMENT_ICON).toBe('📄');
  });

  it('returns expected icons for the most common artifact types', () => {
    const cases = [
      ['readme', '📘'],
      ['pestle', '🌍'],
      ['stride-threat', '🛡️'],
      ['risk-matrix', '📊'],
      ['coalition-dynamics', '🤝'],
      ['stakeholder-impact', '👥'],
      ['scenario-forecast', '🔮'],
      ['economic-baseline', '💶'],
      ['historical-parallel', '🕰️'],
      ['committee-meeting', '🏛️'],
      ['voting-patterns', '🗳️'],
    ];
    for (const [stem, expected] of cases) {
      expect(pickDocumentIcon(stem)).toBe(expected);
    }
  });

  it('handles ZWJ-joined emoji (mep/parliamentarian icon)', () => {
    const icon = pickDocumentIcon('mep-portfolio');
    // The icon is `🧑\u200d💼` — a man-office-worker ZWJ sequence
    expect(icon).toContain('\u200d');
    expect([...icon].length).toBeGreaterThanOrEqual(2);
  });
});

describe('pickRunIcon', () => {
  it('matches by startsWith, not includes', () => {
    expect(pickRunIcon('breaking-run190')).toBe('🚨');
    // breaking inside a slug doesn't match because we only check startsWith
    expect(pickRunIcon('not-breaking-run10')).toBe(DEFAULT_RUN_ICON);
  });

  it('matches case-insensitively', () => {
    expect(pickRunIcon('BREAKING-RUN1')).toBe('🚨');
  });

  it('returns expected icons for every canonical run type', () => {
    const cases = [
      ['breaking-run190', '🚨'],
      ['week-ahead-run5', '🔭'],
      ['month-ahead-run2', '🔭'],
      ['week-in-review-run9', '📅'],
      ['month-in-review-run4', '🗓️'],
      ['year-in-review-run1', '📜'],
      ['motions-run46', '🗳️'],
      ['propositions-run12', '⚖️'],
      ['committee-reports-run3', '🏛️'],
      ['translate-run1', '🌐'],
      ['deep-dive-run1', '🔬'],
    ];
    for (const [slug, expected] of cases) {
      expect(pickRunIcon(slug)).toBe(expected);
    }
  });

  it('returns the default icon for unknown run prefixes', () => {
    expect(pickRunIcon('unknown-prefix-run1')).toBe(DEFAULT_RUN_ICON);
    expect(DEFAULT_RUN_ICON).toBe('📂');
  });
});
