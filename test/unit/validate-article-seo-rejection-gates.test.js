// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the resolver-aligned rejection gates added to
 * `scripts/validate-article-seo.js` as the deferred PR #2163 follow-up.
 *
 * Five new gates extend the validator so the same regressions the
 * resolver already rejects (`title-rejection.ts`) can never sneak
 * through into a shipped `<title>` / `<meta description>`:
 *
 *   - `title-ellipsis-cut`
 *   - `title-doc-id`
 *   - `title-section-header`
 *   - `title-sentence-fragment`
 *   - `description-leaky-section-header`
 */

import { describe, it, expect } from 'vitest';

import { evaluateResolverRejectionGates } from '../../scripts/validate-article-seo.js';

describe('validate-article-seo · resolver-aligned rejection gates', () => {
  describe('title rejection', () => {
    it('fires title-ellipsis-cut for ellipsis-truncated titles', () => {
      expect(evaluateResolverRejectionGates('title', 'Banking Union vote approaches…')).toEqual([
        'title-ellipsis-cut',
      ]);
      expect(evaluateResolverRejectionGates('title', 'Banking Union vote approaches...')).toEqual([
        'title-ellipsis-cut',
      ]);
    });

    it('fires title-doc-id for bare adopted-text doc-IDs', () => {
      expect(evaluateResolverRejectionGates('title', 'TA-10-2026-0160')).toEqual([
        'title-doc-id',
      ]);
      expect(evaluateResolverRejectionGates('title', 'ta-9-2024-0001')).toEqual([
        'title-doc-id',
      ]);
    });

    it('fires title-section-header for bold-prose section labels', () => {
      for (const label of [
        'Strategic significance',
        'Threat Level',
        'Key Assumptions Check',
        'BLUF',
        'TL;DR',
      ]) {
        expect(evaluateResolverRejectionGates('title', label)).toEqual([
          'title-section-header',
        ]);
      }
    });

    it('fires title-sentence-fragment for leaked full sentences', () => {
      expect(
        evaluateResolverRejectionGates(
          'title',
          'EP10 enters the second half of its mandate with a structurally constrained but operational grand coalition.'
        )
      ).toEqual(['title-sentence-fragment']);
    });

    it('stays quiet for clean noun-phrase headlines', () => {
      for (const clean of [
        'Banking Union Deal Tests EPP–S&D Discipline',
        'EU Parliament Year Ahead (May 2026 – May 2027)',
        'EP Committee Reports · Week of 2026-05-14–21',
      ]) {
        expect(evaluateResolverRejectionGates('title', clean)).toEqual([]);
      }
    });
  });

  describe('description rejection', () => {
    it('fires description-leaky-section-header when description lead is a denylisted label', () => {
      expect(
        evaluateResolverRejectionGates(
          'description',
          'Strategic significance: this matters because the EPP needs S&D to maintain a working majority on the banking dossier.'
        )
      ).toEqual(['description-leaky-section-header']);
      expect(
        evaluateResolverRejectionGates(
          'description',
          'Threat Level. Routine inter-sessional day with no breaking signal.'
        )
      ).toEqual(['description-leaky-section-header']);
    });

    it('stays quiet for clean editorial descriptions', () => {
      expect(
        evaluateResolverRejectionGates(
          'description',
          'Banking Union dossier tests EPP–S&D discipline as votes converge on the Council mandate this week.'
        )
      ).toEqual([]);
    });

    it('does not apply title predicates to descriptions', () => {
      // Doc-ID, sentence-fragment, ellipsis are intentionally NOT
      // checked for descriptions — these are caught by the existing
      // `description-ellipsis`, `forbidden-prefix`, and length gates.
      expect(evaluateResolverRejectionGates('description', 'TA-10-2026-0160')).toEqual([]);
      expect(
        evaluateResolverRejectionGates(
          'description',
          'This is a complete sentence that ends with a period.'
        )
      ).toEqual([]);
    });
  });

  describe('input hygiene', () => {
    it('returns an empty array for empty / non-string values', () => {
      expect(evaluateResolverRejectionGates('title', '')).toEqual([]);
      expect(evaluateResolverRejectionGates('description', '')).toEqual([]);
      // @ts-expect-error — intentional bad input
      expect(evaluateResolverRejectionGates('title', null)).toEqual([]);
      // @ts-expect-error — intentional bad input
      expect(evaluateResolverRejectionGates('title', undefined)).toEqual([]);
    });
  });

  describe('severity routing (advisory vs failure-class)', () => {
    it('routes the 5 resolver-aligned gates to advisory severity (excluded from fail-count)', async () => {
      // Use a known-bad legacy run (the resolver-tightening work post-dates
      // these articles, so they still leak BLUF sentences into <title>).
      // Asserting that `totals.violations` stays 0 while
      // `totals.advisories` records the catch locks the severity contract.
      const { main } = await import('../../scripts/validate-article-seo.js');
      const fs = await import('node:fs');
      const path = await import('node:path');
      const os = await import('node:os');
      const { fileURLToPath } = await import('node:url');
      const here = path.dirname(fileURLToPath(import.meta.url));
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-advisory-'));
      const reportPath = path.join(tmp, 'report.json');
      const repoRoot = path.resolve(here, '..', '..');
      const runDir = path.join(repoRoot, 'analysis', 'daily', '2026-03-27');
      if (!fs.existsSync(runDir)) return; // skip if fixture missing
      const report = main([
        '--repo-root',
        repoRoot,
        '--paths',
        runDir,
        '--report',
        reportPath,
        '--no-fail',
        '--quiet',
      ]);
      expect(report.totals.violations).toBe(0);
      expect(report.totals.advisories).toBeGreaterThanOrEqual(1);
      const advisoryGates = Object.keys(report.totals.byGateAdvisory || {});
      expect(advisoryGates.some((g) => g.startsWith('title-') || g.startsWith('description-'))).toBe(
        true,
      );
      for (const v of report.violations) {
        if (
          v.gate === 'title-ellipsis-cut' ||
          v.gate === 'title-doc-id' ||
          v.gate === 'title-section-header' ||
          v.gate === 'title-sentence-fragment' ||
          v.gate === 'description-leaky-section-header'
        ) {
          expect(v.severity).toBe('advisory');
        }
      }
    });
  });
});
