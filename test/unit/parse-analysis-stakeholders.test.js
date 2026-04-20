// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Test/ParseAnalysisStakeholders
 * @description Unit tests for the Analysis-to-Article Data Contract parser.
 * Uses real reference-quality analysis markdown from the
 * `analysis/daily/2026-04-20/motions-run46` and
 * `analysis/daily/2026-04-20/breaking-run190` runs as fixtures.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  parseStakeholderPerspectives,
  parseStakeholderOutcomeMatrix,
  parseImpactAssessment,
  deriveAnalysisOverrides,
  classifyStakeholder,
  findFallbackTemplateLeaks,
  FALLBACK_TEMPLATE_PATTERNS,
} from '../../scripts/utils/parse-analysis-stakeholders.js';
import { ALL_STAKEHOLDER_TYPES } from '../../scripts/types/index.js';

const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * Build a `LoadedAnalysisContext`-shaped object from a list of
 * (method, subdir, filePath) tuples, mimicking what `loadAnalysisContext`
 * emits at runtime.
 */
function loadContextFromPaths(entries) {
  const files = new Map();
  for (const e of entries) {
    const abs = path.join(REPO_ROOT, e.path);
    if (!fs.existsSync(abs)) continue;
    files.set(e.method, {
      method: e.method,
      subdir: e.subdir,
      content: fs.readFileSync(abs, 'utf-8'),
      filePath: abs,
    });
  }
  return {
    date: '2026-04-20',
    analysisDir: path.join(REPO_ROOT, 'analysis/daily/2026-04-20'),
    manifest: null,
    overallConfidence: null,
    files,
  };
}

describe('parse-analysis-stakeholders', () => {
  describe('classifyStakeholder', () => {
    it('classifies EP political group names to political_groups', () => {
      expect(classifyStakeholder('EPP Group')).toBe('political_groups');
      expect(classifyStakeholder('S&D Group (~135 seats)')).toBe('political_groups');
      expect(classifyStakeholder('Renew Europe')).toBe('political_groups');
      expect(classifyStakeholder('ECR-PfE Opposition')).toBe('political_groups');
    });

    it('classifies EU bodies to eu_institutions', () => {
      expect(classifyStakeholder('European Commission (DG TRADE, DG EMPL)')).toBe(
        'eu_institutions'
      );
      expect(classifyStakeholder('Von der Leyen Commission')).toBe('eu_institutions');
      expect(classifyStakeholder('Council of the EU (COREPER)')).toBe('eu_institutions');
    });

    it('classifies third-country governments to national_govts', () => {
      expect(classifyStakeholder('USTR / US Government')).toBe('national_govts');
      expect(classifyStakeholder('Chinese Government')).toBe('national_govts');
      expect(classifyStakeholder('EU Candidate Countries (Ukraine, Moldova)')).toBe(
        'national_govts'
      );
    });

    it('classifies industrial associations to industry', () => {
      expect(classifyStakeholder('European Industrial Associations (ACEA, ASD)')).toBe(
        'industry'
      );
      expect(classifyStakeholder('EU Banking Sector')).toBe('industry');
    });

    it('classifies NGOs to civil_society', () => {
      expect(classifyStakeholder('Civil Society and Housing NGOs (Feantsa)')).toBe(
        'civil_society'
      );
    });

    it('returns null for unmapped labels', () => {
      expect(classifyStakeholder('Random unmapped actor')).toBe(null);
    });
  });

  describe('parseStakeholderPerspectives', () => {
    it('returns null when context is null', () => {
      expect(parseStakeholderPerspectives(null)).toBe(null);
    });

    it('returns null when no stakeholder source file is loaded', () => {
      expect(parseStakeholderPerspectives(loadContextFromPaths([]))).toBe(null);
    });

    it('parses the motions-run46 existing/stakeholder-impact.md into canonical perspectives', () => {
      const ctx = loadContextFromPaths([
        {
          method: 'stakeholder-impact',
          subdir: 'existing',
          path: 'analysis/daily/2026-04-20/motions-run46/existing/stakeholder-impact.md',
        },
      ]);
      const perspectives = parseStakeholderPerspectives(ctx);
      expect(perspectives).not.toBe(null);
      expect(perspectives.length).toBeGreaterThanOrEqual(3);
      // Every returned perspective must be one of the six canonical types.
      for (const p of perspectives) {
        expect(ALL_STAKEHOLDER_TYPES).toContain(p.stakeholder);
      }
      // Every perspective must have substantive (>= 40-word) prose.
      for (const p of perspectives) {
        const words = p.reasoning.split(/\s+/).filter(Boolean);
        expect(words.length).toBeGreaterThanOrEqual(40);
      }
      // The Commission section must map to eu_institutions and contain the
      // substantive DG TRADE / DG GROW language from the source.
      const euBucket = perspectives.find((p) => p.stakeholder === 'eu_institutions');
      expect(euBucket).toBeDefined();
      expect(euBucket.reasoning.toLowerCase()).toMatch(/dg trade|dg grow|commission/);
      // Evidence field must reference the AI-authored source section name.
      expect(euBucket.evidence[0]).toMatch(/AI-authored analysis/);
    });

    it('parses the breaking-run190 intelligence/stakeholder-map.md', () => {
      const ctx = loadContextFromPaths([
        {
          method: 'stakeholder-map',
          subdir: 'intelligence',
          path: 'analysis/daily/2026-04-20/breaking-run190/intelligence/stakeholder-map.md',
        },
      ]);
      const perspectives = parseStakeholderPerspectives(ctx);
      expect(perspectives).not.toBe(null);
      // Breaking-run190 has Actor 1..8 covering EPP/S&D/Renew/Commission/Council/ECR-PfE/USTR/China.
      // Expect at least three canonical buckets populated.
      const buckets = new Set(perspectives.map((p) => p.stakeholder));
      expect(buckets.size).toBeGreaterThanOrEqual(3);
      expect(buckets.has('political_groups')).toBe(true);
      expect(buckets.has('eu_institutions')).toBe(true);
    });
  });

  describe('parseStakeholderOutcomeMatrix', () => {
    it('parses the aggregate stakeholder table from motions-run46', () => {
      const ctx = loadContextFromPaths([
        {
          method: 'stakeholder-impact',
          subdir: 'existing',
          path: 'analysis/daily/2026-04-20/motions-run46/existing/stakeholder-impact.md',
        },
      ]);
      const matrix = parseStakeholderOutcomeMatrix(ctx);
      expect(matrix).not.toBe(null);
      expect(matrix).toHaveLength(1);
      expect(matrix[0].outcomes).toBeDefined();
      // Every canonical stakeholder key is present in the outcomes record.
      for (const key of ALL_STAKEHOLDER_TYPES) {
        expect(matrix[0].outcomes[key]).toMatch(/winner|loser|neutral/);
      }
      // In the motions-run46 aggregate table, US is labelled "Net negative".
      expect(matrix[0].outcomes.national_govts).toBeDefined();
    });

    it('returns null when no matrix table is present', () => {
      expect(parseStakeholderOutcomeMatrix(null)).toBe(null);
      expect(parseStakeholderOutcomeMatrix(loadContextFromPaths([]))).toBe(null);
    });
  });

  describe('parseImpactAssessment', () => {
    it('returns null when no synthesis file is available', () => {
      expect(parseImpactAssessment(null)).toBe(null);
    });
    // Note: synthesis-summary.md in motions-run46 currently lacks a canonical
    // "## Impact Assessment" heading — parser is expected to return null on
    // that input. Parser behaviour is asserted on the classify / fallback
    // surfaces so real-world regressions are caught even when this optional
    // block is absent.
  });

  describe('deriveAnalysisOverrides', () => {
    it('returns an always-safe-to-spread object', () => {
      const res = deriveAnalysisOverrides(null);
      expect(typeof res).toBe('object');
      // All three fields are optional; accessing them must not throw.
      expect(res.stakeholderPerspectives).toBeUndefined();
      expect(res.stakeholderOutcomeMatrix).toBeUndefined();
      expect(res.impactAssessment).toBeUndefined();
    });

    it('populates perspectives + matrix when motions-run46 analysis is loaded', () => {
      const ctx = loadContextFromPaths([
        {
          method: 'stakeholder-impact',
          subdir: 'existing',
          path: 'analysis/daily/2026-04-20/motions-run46/existing/stakeholder-impact.md',
        },
      ]);
      const overrides = deriveAnalysisOverrides(ctx);
      expect(overrides.stakeholderPerspectives).toBeDefined();
      expect(overrides.stakeholderPerspectives.length).toBeGreaterThan(0);
      expect(overrides.stakeholderOutcomeMatrix).toBeDefined();
    });
  });

  describe('findFallbackTemplateLeaks', () => {
    it('matches the voting-period stakeholder-topic placeholder leak', () => {
      const bad =
        '<p>This parliamentary activity on "voting period 2026-03-21–2026-04-20" has moderate implications for political group dynamics.</p>';
      const hits = findFallbackTemplateLeaks(bad);
      expect(hits.length).toBeGreaterThanOrEqual(2);
    });

    it('matches the Voting outcomes date-range matrix action label', () => {
      const bad = '<h3>Voting outcomes 2026-03-21–2026-04-20</h3>';
      const hits = findFallbackTemplateLeaks(bad);
      expect(hits.length).toBeGreaterThan(0);
    });

    it('matches the EP activity date-only topic fallback', () => {
      const bad = '<p>Analysis topic: EP activity 2026-04-20</p>';
      const hits = findFallbackTemplateLeaks(bad);
      expect(hits.length).toBeGreaterThan(0);
    });

    it('matches AI_MARKER leaks', () => {
      expect(findFallbackTemplateLeaks('alt=[AI_ANALYSIS_REQUIRED]')).toHaveLength(1);
    });

    it('returns empty when the HTML is clean', () => {
      const good =
        '<section><h2>Stakeholder Perspectives</h2><p>The European Commission receives an ' +
        'unusually concentrated mandate convergence across five DGs simultaneously, forcing ' +
        'DG TRADE, DG GROW, DG EMPL/REGIO and DG NEAR to act in parallel.</p></section>';
      expect(findFallbackTemplateLeaks(good)).toHaveLength(0);
    });

    it('has at least one pattern per fallback builder category', () => {
      // Sanity check — the export should stay aligned with
      // `buildDefaultStakeholderPerspectives` / `buildFallbackImpactAssessment` /
      // voting-builder topic defaults. Update this constant deliberately.
      expect(FALLBACK_TEMPLATE_PATTERNS.length).toBeGreaterThanOrEqual(8);
    });
  });
});
