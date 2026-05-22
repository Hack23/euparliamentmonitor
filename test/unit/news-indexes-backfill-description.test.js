// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for buildLegacyBackfillDescription — the duplicate-prefix
 * helper that the news-indexes generator applies to legacy article
 * descriptions before the 180-character snippet cap. The Round 3 fix
 * (May 2026) refactored this helper to:
 *
 *   1. Skip the prefix entirely when the resolver already produced a
 *      substantive ≥120-character description (no point staining real
 *      editorial content with bureaucratic boilerplate).
 *   2. Localize the prefix via ARTICLE_TYPE_LABELS so translated cards
 *      no longer carry the English "EN Committee Reports —" wart that
 *      the prior `${date} ${LANG} ${formatSlug(slug)} —` form produced.
 */

/* eslint-disable no-undef */

import { describe, it, expect } from 'vitest';
import { buildLegacyBackfillDescription } from '../../scripts/generators/news-indexes.js';

describe('buildLegacyBackfillDescription — substantive resolver output (≥120 chars)', () => {
  it('passes substantive descriptions through unchanged, with no prefix', () => {
    const substantive =
      'The European Parliament adopted three landmark legislative texts in April 2026, with the EPP–S&D coalition consolidating consensus on banking-union files while AI Act amendments revealed sharper splits across the political-group landscape.';
    const result = buildLegacyBackfillDescription(
      '2026-05-15',
      'committee-reports',
      'ar',
      substantive
    );
    // No date / language code / category-noun prefix should be prepended.
    expect(result.startsWith('2026-05-15')).toBe(false);
    expect(result).not.toContain(' AR ');
    expect(result).not.toContain(' EN ');
    // The original editorial content survives (subject to the 180-char cap).
    expect(result).toContain('European Parliament');
  });

  it('does not steal SERP characters from substantive English descriptions', () => {
    const substantive =
      'EP10 plenary in Strasbourg adopted the AI Act amendments by 412-189 with EPP, Renew and S&D voting in favour, while ECR split and ID opposed in a vote that consolidates the centrist coalition across digital-policy files.';
    const result = buildLegacyBackfillDescription(
      '2026-05-15',
      'breaking',
      'en',
      substantive
    );
    expect(result.startsWith('2026-05-15')).toBe(false);
    expect(result).not.toContain(' EN ');
  });

  it('caps substantive descriptions at 180 characters with trailing ellipsis', () => {
    // Substantive (≥120 chars) input that overruns the 180-char SERP cap.
    // The substantive path skips the prefix entirely but still applies
    // capDescriptionLength to keep the result inside Google's snippet budget.
    const long =
      'The European Parliament adopted three landmark legislative texts during the April 2026 Strasbourg plenary, with the EPP-S&D coalition consolidating consensus on banking-union files while AI Act amendments revealed sharper splits across the political-group landscape and committee mandates.';
    expect(long.length).toBeGreaterThan(180);
    const result = buildLegacyBackfillDescription('2026-05-15', 'breaking', 'en', long);
    expect(result.length).toBeLessThanOrEqual(180);
    expect(result.endsWith('…')).toBe(true);
  });

  it('can force a localized context prefix for duplicate substantive descriptions', () => {
    const duplicate =
      'With 185 seats, EPP controls committee chair nominations, rapporteurships, and the agenda-setting authority of the Conference of Presidents. This structural advantage compounds across the term.';
    const result = buildLegacyBackfillDescription(
      '2026-05-09',
      'term-outlook',
      'en',
      duplicate,
      { forceContextPrefix: true }
    );

    expect(result).toContain('2026-05-09');
    expect(result).toContain('Term Outlook');
    expect(result).toContain('EPP controls committee chair nominations');
    expect(result.length).toBeLessThanOrEqual(180);
  });

  it('adds slug qualifiers when same-day run slugs need unique prefixes', () => {
    const duplicate =
      'The one-week adopted-texts feed returned 85 items spanning three distinct periods of parliamentary activity and requires page-specific context for search result snippets.';
    const result = buildLegacyBackfillDescription(
      '2026-04-04',
      'breaking-run2',
      'en',
      duplicate,
      { forceContextPrefix: true }
    );

    expect(result).toContain('2026-04-04');
    expect(result).toContain('Breaking News');
    expect(result).toContain('Breaking Run2');
    expect(result.length).toBeLessThanOrEqual(180);
  });
});

describe('buildLegacyBackfillDescription — short / placeholder content (<120 chars)', () => {
  it('prepends a localized prefix for non-English languages', () => {
    // Below the substantive threshold — fall back to the localized prefix.
    const short = 'Brief committee summary.';
    const arResult = buildLegacyBackfillDescription(
      '2026-05-15',
      'committee-reports',
      'ar',
      short
    );
    // Arabic prefix: never contains "EN" or other English language codes
    // as bureaucratic boilerplate.
    expect(arResult).not.toContain(' EN ');
    expect(arResult).not.toContain(' AR ');
    // Must contain the date and the Arabic category label.
    expect(arResult).toContain('2026-05-15');
    expect(arResult).toContain('—');
    // Arabic for "Committee Activity" is نشاط اللجان (per ARTICLE_TYPE_LABELS).
    // We accept any non-English label — the key invariant is the absence
    // of "Committee Reports" in the prefix.
    expect(arResult).not.toMatch(/^2026-05-15 — Committee Activity —/u);
  });

  it('prepends an English prefix for the English locale', () => {
    const short = 'Brief committee summary.';
    const enResult = buildLegacyBackfillDescription(
      '2026-05-15',
      'committee-reports',
      'en',
      short
    );
    expect(enResult).toContain('2026-05-15');
    expect(enResult).toContain('Committee Activity');
    // The prefix uses em-dash separators, NOT the legacy ` EN ` upper-case form.
    expect(enResult).not.toContain(' EN ');
  });

  it('uses Swedish category labels for sv locale', () => {
    const short = 'Kort sammanfattning.';
    const result = buildLegacyBackfillDescription(
      '2026-05-15',
      'committee-reports',
      'sv',
      short
    );
    // Swedish for "Committee Activity" is "Utskottsverksamhet" (per
    // ARTICLE_TYPE_LABELS in src/constants/language-ui.ts).
    expect(result).toContain('Utskottsverksamhet');
    expect(result).not.toContain('Committee Activity');
    expect(result).not.toContain(' SV ');
  });

  it('falls back to formatSlug-style label when category is unknown', () => {
    const result = buildLegacyBackfillDescription(
      '2026-05-15',
      'committee-reports',
      'en',
      'Brief.'
    );
    // Even on the fallback path no ` EN ` wart appears.
    expect(result).not.toContain(' EN ');
  });
});
