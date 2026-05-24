// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for keyword-filters — exercise the noise-token rejector
 * and the cross-site keyword catalogue used by `buildSeoKeywords`.
 */

import { describe, it, expect } from 'vitest';
import {
  CROSS_SITE_KEYWORDS,
  isNoiseKeywordToken,
} from '../../scripts/aggregator/metadata/keyword-filters.js';

describe('CROSS_SITE_KEYWORDS catalogue', () => {
  it('includes the four user-requested Riksdagsmonitor terms', () => {
    expect(CROSS_SITE_KEYWORDS).toContain('Riksdagsmonitor');
    expect(CROSS_SITE_KEYWORDS).toContain('Riksdag');
    expect(CROSS_SITE_KEYWORDS).toContain('Regeringen');
    expect(CROSS_SITE_KEYWORDS).toContain('political intelligence');
  });

  it('includes EU Parliament Monitor + European Parliament/Commission analogues', () => {
    expect(CROSS_SITE_KEYWORDS).toContain('EU Parliament Monitor');
    expect(CROSS_SITE_KEYWORDS).toContain('European Parliament');
    expect(CROSS_SITE_KEYWORDS).toContain('European Commission');
  });

  it('places EU Parliament Monitor first so the 16-entry budget cannot drop it', () => {
    expect(CROSS_SITE_KEYWORDS[0]).toBe('EU Parliament Monitor');
  });

  it('has no duplicates', () => {
    const seen = new Set(CROSS_SITE_KEYWORDS.map((k) => k.toLowerCase()));
    expect(seen.size).toBe(CROSS_SITE_KEYWORDS.length);
  });
});

describe('isNoiseKeywordToken', () => {
  it('rejects UUID hex fragments (mixed alpha + digits)', () => {
    expect(isNoiseKeywordToken('77fc920c')).toBe(true);
    expect(isNoiseKeywordToken('3a76')).toBe(true);
    expect(isNoiseKeywordToken('9db5')).toBe(true);
    expect(isNoiseKeywordToken('43a7e9ac')).toBe(true);
  });

  it('rejects long all-hex tokens even without a digit', () => {
    expect(isNoiseKeywordToken('aabbccdd')).toBe(true);
  });

  it('rejects pure-digit tokens', () => {
    expect(isNoiseKeywordToken('1779431162')).toBe(true);
    expect(isNoiseKeywordToken('2026')).toBe(true);
  });

  it('rejects digit-dominated tokens', () => {
    expect(isNoiseKeywordToken('2024k1234')).toBe(true);
  });

  it('rejects run-id slugs', () => {
    expect(isNoiseKeywordToken('run261')).toBe(true);
    expect(isNoiseKeywordToken('propositions-run261-1779431162')).toBe(true);
    expect(isNoiseKeywordToken('breaking-run17-1234567890')).toBe(true);
  });

  it('rejects tokens shorter than 4 characters', () => {
    expect(isNoiseKeywordToken('eu')).toBe(true);
    expect(isNoiseKeywordToken('')).toBe(true);
  });

  it('keeps ordinary editorial keywords', () => {
    expect(isNoiseKeywordToken('coalition')).toBe(false);
    expect(isNoiseKeywordToken('Mercosur')).toBe(false);
    expect(isNoiseKeywordToken('Paradox')).toBe(false);
    expect(isNoiseKeywordToken('legislation')).toBe(false);
    expect(isNoiseKeywordToken('political')).toBe(false);
  });

  it('keeps short hex-shaped English words via the allowlist', () => {
    expect(isNoiseKeywordToken('face')).toBe(false);
    expect(isNoiseKeywordToken('dead')).toBe(false);
    expect(isNoiseKeywordToken('cafe')).toBe(false);
  });
});
