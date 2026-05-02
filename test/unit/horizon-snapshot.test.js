// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Snapshot tests for the 6 new analysis horizons:
 *   quarter-ahead, quarter-in-review, year-ahead, year-in-review,
 *   term-outlook, election-cycle
 *
 * Each test calls `aggregateAnalysisRun()` against a synthetic-minimal
 * fixture under `test/fixtures/horizons/<slug>/` and asserts:
 *   1. Correct articleType resolved from the manifest
 *   2. Correct date (2026-01-15 — stable for snapshot determinism)
 *   3. Gate result GREEN (from fixture history)
 *   4. Provenance block contains the horizon slug
 *   5. Synthesis summary content is present in the aggregated markdown
 *   6. Forward-projection content present (for prospective horizons)
 *   7. includedArtifacts lists the fixture files
 *   8. Markdown snapshot — catches drift between registry, aggregator,
 *      artifact ordering, and templates (regenerate with `npm run test --
 *      --update-snapshots`)
 *
 * Snapshot golden files live in `test/unit/__snapshots__/horizon-snapshot.test.js.snap`.
 * To refresh all goldens after an intentional change:
 *   npm run test -- --update-snapshots
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import { aggregateAnalysisRun } from '../../scripts/aggregator/analysis-aggregator.js';

const REPO_ROOT = path.resolve('.');

/** Resolve the absolute path to a horizon fixture directory. */
function fixtureDir(slug) {
  return path.resolve('test/fixtures/horizons', slug);
}

// ============================================================================
// Horizons under test — one entry per new horizon
// ============================================================================
const NEW_HORIZONS = [
  {
    slug: 'quarter-ahead',
    prospective: true,
    keyArtifact: 'intelligence/synthesis-summary.md',
    fwdArtifact: 'forward/forward-projection.md',
    syntheticTitle: 'Quarter Ahead',
    syntheticContent: '90-Day Scenario Map',
  },
  {
    slug: 'quarter-in-review',
    prospective: false,
    keyArtifact: 'intelligence/synthesis-summary.md',
    fwdArtifact: null,
    syntheticTitle: 'Quarter in Review',
    syntheticContent: 'Quarterly Retrospective',
  },
  {
    slug: 'year-ahead',
    prospective: true,
    keyArtifact: 'intelligence/synthesis-summary.md',
    fwdArtifact: 'forward/forward-projection.md',
    syntheticTitle: 'Year Ahead',
    syntheticContent: '12-Month Scenario Map',
  },
  {
    slug: 'year-in-review',
    prospective: false,
    keyArtifact: 'intelligence/synthesis-summary.md',
    fwdArtifact: null,
    syntheticTitle: 'Year in Review',
    syntheticContent: 'Annual Retrospective',
  },
  {
    slug: 'term-outlook',
    prospective: true,
    keyArtifact: 'intelligence/synthesis-summary.md',
    fwdArtifact: 'forward/forward-projection.md',
    syntheticTitle: 'Term Outlook',
    syntheticContent: 'Multi-Year Electoral Scenario Map',
  },
  {
    slug: 'election-cycle',
    prospective: true,
    keyArtifact: 'intelligence/synthesis-summary.md',
    fwdArtifact: 'forward/forward-projection.md',
    syntheticTitle: 'Election Cycle',
    syntheticContent: 'Electoral Cycle Scenario Map',
  },
];

// ============================================================================
// Parameterised tests — one describe block per horizon
// ============================================================================
for (const horizon of NEW_HORIZONS) {
  describe(`horizon: ${horizon.slug}`, () => {
    // Compute once per describe block (synchronous, no hooks needed)
    const runDir = fixtureDir(horizon.slug);
    const result = aggregateAnalysisRun({ runDir, repoRoot: REPO_ROOT });

    it('resolves the correct articleType from the manifest', () => {
      expect(result.articleType).toBe(horizon.slug);
    });

    it('reads the date 2026-01-15 from the manifest', () => {
      expect(result.date).toBe('2026-01-15');
    });

    it('reads gateResult GREEN from manifest history', () => {
      expect(result.gateResult).toBe('GREEN');
    });

    it('includes the horizon slug in the provenance block', () => {
      expect(result.markdown).toContain(`\`${horizon.slug}\``);
    });

    it('includes the synthesis summary section', () => {
      expect(result.markdown).toContain('Synthesis Summary');
    });

    it('contains the fixture-specific synthesis content', () => {
      expect(result.markdown).toContain(horizon.syntheticContent);
    });

    if (horizon.prospective && horizon.fwdArtifact) {
      it('includes the forward-projection artifact content', () => {
        // forward-projection.md exists for all prospective horizons
        expect(result.markdown).toContain('Forward Projection');
      });

      it('lists the forward-projection artifact in includedArtifacts', () => {
        const paths = result.includedArtifacts.map((a) => a.runRelPath);
        expect(paths).toContain(horizon.fwdArtifact);
      });
    }

    it('lists the synthesis artifact in includedArtifacts', () => {
      const paths = result.includedArtifacts.map((a) => a.runRelPath);
      expect(paths).toContain(horizon.keyArtifact);
    });

    it('every included artifact has a non-empty sectionId', () => {
      for (const art of result.includedArtifacts) {
        expect(typeof art.sectionId).toBe('string');
        expect(art.sectionId.length).toBeGreaterThan(0);
      }
    });

    it('every includedArtifact has a repo-relative path under test/fixtures/horizons/', () => {
      for (const art of result.includedArtifacts) {
        expect(art.repoRelPath.startsWith('test/fixtures/horizons/')).toBe(true);
      }
    });

    it('appends the Tradecraft References appendix', () => {
      expect(result.markdown).toContain('Tradecraft References');
    });

    it('appends the Analysis Index appendix', () => {
      expect(result.markdown).toContain('Analysis Index');
      expect(result.markdown).toContain('manifest.json');
    });

    it('includes the Provenance & Audit block at the end', () => {
      expect(result.markdown).toContain('**Provenance & Audit**');
      // Provenance must appear AFTER the body (synthesis content)
      const provenancePos = result.markdown.indexOf('**Provenance & Audit**');
      const bodyContentPos = result.markdown.indexOf(horizon.syntheticContent);
      expect(provenancePos).toBeGreaterThan(bodyContentPos);
    });

    it('sectionToc is non-empty and terminates with tradecraft + analysis-index', () => {
      const toc = result.sectionToc ?? [];
      expect(toc.length).toBeGreaterThan(0);
      const lastTwo = toc.slice(-2).map((e) => e.id);
      expect(lastTwo).toEqual([
        'aggregator-tradecraft-references',
        'aggregator-analysis-index',
      ]);
    });

    it('matches the markdown snapshot (golden — regenerate with --update-snapshots)', () => {
      // Strip the dynamic GitHub blob/tree URLs from the snapshot so that
      // branch-name changes don't invalidate the golden. We keep structure,
      // content, and section ordering intact.
      const normalised = result.markdown.replace(
        /https:\/\/github\.com\/Hack23\/euparliamentmonitor\/(blob|tree)\/[^\s)]+/g,
        'GITHUB_URL'
      );
      expect(normalised).toMatchSnapshot();
    });
  });
}
