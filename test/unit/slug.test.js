// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/slug — pure naming functions used by the
 * `news/<slug>-<lang>.html` filename convention. Exhaustive coverage of
 * `buildArticleSlug` and `sanitizeRunSuffix` plus a round-trip check that
 * validates filename safety after sanitisation.
 */

import { describe, it, expect } from 'vitest';
import {
  buildArticleSlug,
  sanitizeRunSuffix,
  RUN_SUFFIX_MAX_LENGTH,
  DEFAULT_RUN_SUFFIX,
} from '../../scripts/aggregator/slug/index.js';
import {
  buildArticleSlug as legacyBuildArticleSlug,
  sanitizeRunSuffix as legacySanitizeRunSuffix,
} from '../../scripts/aggregator/article-generator.js';

describe('buildArticleSlug', () => {
  it('builds a base slug without runSuffix', () => {
    expect(buildArticleSlug('2026-04-27', 'breaking')).toBe('2026-04-27-breaking');
  });

  it('appends a runSuffix when provided', () => {
    expect(buildArticleSlug('2026-04-27', 'breaking', 'run181')).toBe('2026-04-27-breaking-run181');
  });

  it('treats empty runSuffix as falsy and omits the suffix', () => {
    expect(buildArticleSlug('2026-04-27', 'breaking', '')).toBe('2026-04-27-breaking');
  });

  it('treats undefined runSuffix as no suffix', () => {
    expect(buildArticleSlug('2026-04-27', 'breaking', undefined)).toBe('2026-04-27-breaking');
  });

  it('matches the legacy article-generator export byte-for-byte', () => {
    expect(buildArticleSlug('2026-04-06', 'propositions', 'run42')).toBe(
      legacyBuildArticleSlug('2026-04-06', 'propositions', 'run42')
    );
  });
});

describe('sanitizeRunSuffix', () => {
  it('returns clean ASCII run-id unchanged', () => {
    expect(sanitizeRunSuffix('run181')).toBe('run181');
  });

  it('keeps dots and dashes', () => {
    expect(sanitizeRunSuffix('run.1.2-final')).toBe('run.1.2-final');
  });

  it('replaces spaces with dashes', () => {
    expect(sanitizeRunSuffix('run 181')).toBe('run-181');
  });

  it('strips non-word characters', () => {
    expect(sanitizeRunSuffix('run/181!@#')).toBe('run-181');
  });

  it('collapses runs of separators into a single dash', () => {
    expect(sanitizeRunSuffix('run//181!!!')).toBe('run-181');
  });

  it('trims leading and trailing dashes', () => {
    expect(sanitizeRunSuffix('---run181---')).toBe('run181');
  });

  it('caps length at the documented maximum', () => {
    const longInput = 'a'.repeat(100);
    const result = sanitizeRunSuffix(longInput);
    expect(result.length).toBeLessThanOrEqual(RUN_SUFFIX_MAX_LENGTH);
  });

  it(`uses "${DEFAULT_RUN_SUFFIX}" for inputs that sanitise to empty`, () => {
    expect(sanitizeRunSuffix('!!!')).toBe(DEFAULT_RUN_SUFFIX);
    expect(sanitizeRunSuffix('---')).toBe(DEFAULT_RUN_SUFFIX);
    expect(sanitizeRunSuffix('   ')).toBe(DEFAULT_RUN_SUFFIX);
  });

  it('matches the legacy article-generator export byte-for-byte', () => {
    expect(sanitizeRunSuffix('run/181 final!')).toBe(legacySanitizeRunSuffix('run/181 final!'));
  });

  it('produces a filename-safe round-trip via buildArticleSlug', () => {
    const samples = ['run181', 'run/with spaces', '!!!@@@', 'a'.repeat(100), 'pass2'];
    for (const raw of samples) {
      const sanitized = sanitizeRunSuffix(raw);
      const slug = buildArticleSlug('2026-04-27', 'breaking', sanitized);
      // Slug must contain only ASCII filename-safe chars
      expect(slug).toMatch(/^[\w.-]+$/);
      // Slug must always include the date/type prefix
      expect(slug.startsWith('2026-04-27-breaking-')).toBe(true);
    }
  });
});
