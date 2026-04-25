// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/analysis-aggregator — manifest reading,
 * section ordering, provenance + tradecraft appendix, analysis-index.
 */

import { describe, it, expect } from 'vitest';
import path from 'path';
import {
  aggregateAnalysisRun,
  discoverTradecraftFiles,
  expandSectionArtifacts,
  flattenManifestFiles,
  guessDateFromRunDir,
  latestGateResult,
  renderAnalysisIndex,
  renderReaderIntelligenceGuide,
  renderProvenanceBlock,
  renderTradecraftAppendix,
} from '../../scripts/aggregator/analysis-aggregator.js';
import { ARTIFACT_SECTIONS } from '../../scripts/aggregator/artifact-order.js';

const FIXTURE_REPO = path.resolve('.');
const FIXTURE_RUN_DIR = path.resolve(
  'test/fixtures/analysis/2026-01-15/breaking-run-test'
);

describe('flattenManifestFiles', () => {
  it('flattens nested category → string[] shape', () => {
    const out = flattenManifestFiles({
      intelligence: ['a.md', 'b.md'],
      classification: ['c.md'],
    });
    expect(out).toEqual(['a.md', 'b.md', 'c.md']);
  });

  it('flattens flat path → description shape', () => {
    const out = flattenManifestFiles({
      files: { 'a.md': 'desc a', 'b.md': 'desc b' },
    });
    expect(out.sort()).toEqual(['a.md', 'b.md']);
  });

  it('returns empty array for undefined', () => {
    expect(flattenManifestFiles(undefined)).toEqual([]);
  });
});

describe('latestGateResult', () => {
  it('returns the most recent non-PENDING gateResult', () => {
    expect(
      latestGateResult({
        articleType: 'x',
        history: [
          { gateResult: 'GREEN' },
          { gateResult: 'PENDING' },
          { gateResult: 'ANALYSIS_ONLY' },
          { gateResult: 'PENDING' },
        ],
      })
    ).toBe('ANALYSIS_ONLY');
  });

  it('returns PENDING when all entries are PENDING or empty', () => {
    expect(latestGateResult({ articleType: 'x', history: [] })).toBe('PENDING');
    expect(
      latestGateResult({ articleType: 'x', history: [{ gateResult: 'PENDING' }] })
    ).toBe('PENDING');
  });
});

describe('expandSectionArtifacts', () => {
  it('resolves exact paths and prefix directories in priority order', () => {
    const section = ARTIFACT_SECTIONS[0];
    const available = new Set(['extended/executive-brief.md', 'intelligence/x.md']);
    const consumed = new Set();
    const result = expandSectionArtifacts(section, available, consumed);
    expect(result).toContain('extended/executive-brief.md');
    expect(consumed.has('extended/executive-brief.md')).toBe(true);
  });

  it('prefers root executive-brief.md over extended compatibility fallback', () => {
    const section = ARTIFACT_SECTIONS[0];
    const available = new Set(['executive-brief.md', 'extended/executive-brief.md']);
    const consumed = new Set();
    const result = expandSectionArtifacts(section, available, consumed);
    expect(result).toEqual(['executive-brief.md']);
    expect(consumed.has('executive-brief.md')).toBe(true);
    expect(consumed.has('extended/executive-brief.md')).toBe(false);
  });

  it('does not re-consume already-claimed artifacts', () => {
    const section = { id: 'x', title: 'X', artifacts: ['intelligence/'] };
    const available = new Set([
      'intelligence/a.md',
      'intelligence/b.md',
      'intelligence/c.md',
    ]);
    const consumed = new Set(['intelligence/b.md']);
    const result = expandSectionArtifacts(section, available, consumed);
    expect(result).toEqual(['intelligence/a.md', 'intelligence/c.md']);
  });
});

describe('renderReaderIntelligenceGuide', () => {
  it('renders a Riksdagsmonitor-style navigation table for emitted sections', () => {
    const out = renderReaderIntelligenceGuide(
      [
        { id: 'section-executive-brief', title: 'Executive Brief' },
        { id: 'section-synthesis', title: 'Synthesis Summary' },
      ],
      [
        {
          runRelPath: 'executive-brief.md',
          repoRelPath: 'analysis/daily/2026-01-15/breaking/executive-brief.md',
          sectionId: 'section-executive-brief',
        },
      ]
    );
    expect(out).toContain('Reader Intelligence Guide');
    expect(out).toContain('[BLUF and editorial decisions](#section-executive-brief)');
    expect(out).toContain('`executive-brief.md`');
  });
});

describe('renderProvenanceBlock', () => {
  it('emits a blockquote with article type, date, run id, gate, and manifest link', () => {
    const out = renderProvenanceBlock({
      articleType: 'breaking',
      date: '2026-01-15',
      runId: 'breaking-run-test',
      gateResult: 'GREEN',
      runDirRelPath: 'analysis/daily/2026-01-15/breaking-run-test',
      manifestRelPath: 'analysis/daily/2026-01-15/breaking-run-test/manifest.json',
    });
    expect(out).toContain('**Provenance**');
    expect(out).toContain('`breaking`');
    expect(out).toContain('2026-01-15');
    expect(out).toContain('`GREEN`');
    expect(out).toContain(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-01-15/breaking-run-test/manifest.json'
    );
  });
});

describe('renderTradecraftAppendix', () => {
  it('lists methodologies and templates separately with GitHub blob links', () => {
    const out = renderTradecraftAppendix([
      'analysis/methodologies/ai-driven-analysis-guide.md',
      'analysis/methodologies/artifact-catalog.md',
      'analysis/templates/SWOT.md',
      'analysis/templates/PESTLE.md',
    ]);
    expect(out).toContain('### Methodologies');
    expect(out).toContain('### Artifact templates');
    expect(out).toContain(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/methodologies/ai-driven-analysis-guide.md'
    );
    expect(out).toContain(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/templates/SWOT.md'
    );
  });

  it('omits section headings when no files of that kind exist', () => {
    const out = renderTradecraftAppendix(['analysis/templates/SWOT.md']);
    expect(out).not.toContain('### Methodologies');
    expect(out).toContain('### Artifact templates');
  });
});

describe('discoverTradecraftFiles', () => {
  it('discovers all committed methodology and template MD files', () => {
    const files = discoverTradecraftFiles(FIXTURE_REPO);
    // Be permissive — at least methodologies OR templates exist in this repo
    const hasAny =
      files.some((f) => f.startsWith('analysis/methodologies/')) ||
      files.some((f) => f.startsWith('analysis/templates/'));
    expect(hasAny).toBe(true);
    for (const f of files) expect(f.endsWith('.md')).toBe(true);
  });
});

describe('aggregateAnalysisRun (fixture)', () => {
  it('produces a deterministic aggregated document with executive brief first', () => {
    const result = aggregateAnalysisRun({
      runDir: FIXTURE_RUN_DIR,
      repoRoot: FIXTURE_REPO,
    });

    // Metadata
    expect(result.articleType).toBe('breaking');
    expect(result.date).toBe('2026-01-15');
    expect(result.gateResult).toBe('GREEN');
    expect(result.runDirRelPath).toBe(
      'test/fixtures/analysis/2026-01-15/breaking-run-test'
    );

    // Provenance block at the top
    expect(result.markdown).toMatch(/^# /);
    expect(result.markdown).toContain('**Provenance**');
    expect(result.markdown).toContain('Reader Intelligence Guide');
    expect(result.markdown).toContain('`breaking`');
    expect(result.markdown).toContain('`GREEN`');

    // Executive brief appears before synthesis summary
    const execPos = result.markdown.indexOf('Executive Brief');
    const synthPos = result.markdown.indexOf('Synthesis Summary');
    expect(execPos).toBeGreaterThan(-1);
    expect(synthPos).toBeGreaterThan(-1);
    expect(execPos).toBeLessThan(synthPos);

    // Link rewriting happened in the body
    expect(result.markdown).toContain(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/'
    );

    // Tradecraft appendix
    expect(result.markdown).toContain('Tradecraft References');

    // Analysis index appendix + link to manifest
    expect(result.markdown).toContain('Analysis Index');
    expect(result.markdown).toContain('manifest.json');

    // Mermaid dedup: the fixture has two identical mermaid blocks across
    // exec-brief and synthesis, so at most one fence remains
    const fenceCount = (result.markdown.match(/```mermaid/g) ?? []).length;
    expect(fenceCount).toBeLessThanOrEqual(2);
  });

  it('lists every artifact in includedArtifacts with a stable section id', () => {
    const result = aggregateAnalysisRun({
      runDir: FIXTURE_RUN_DIR,
      repoRoot: FIXTURE_REPO,
    });
    const paths = result.includedArtifacts.map((a) => a.runRelPath).sort();
    expect(paths).toContain('extended/executive-brief.md');
    expect(paths).toContain('intelligence/synthesis-summary.md');
    expect(paths).toContain('classification/actor-mapping.md');
    for (const art of result.includedArtifacts) {
      expect(art.repoRelPath.startsWith('test/fixtures/analysis/')).toBe(true);
      expect(typeof art.sectionId).toBe('string');
      expect(art.sectionId.length).toBeGreaterThan(0);
    }
  });

  it('throws a clear error for a non-existent run directory', () => {
    expect(() =>
      aggregateAnalysisRun({
        runDir: path.resolve('test/fixtures/analysis/does-not-exist'),
        repoRoot: FIXTURE_REPO,
      })
    ).toThrow(/does not exist/);
  });

  it('returns a sectionToc that mirrors the emitted H2 sections in document order', () => {
    const result = aggregateAnalysisRun({
      runDir: FIXTURE_RUN_DIR,
      repoRoot: FIXTURE_REPO,
    });
    const toc = result.sectionToc ?? [];
    expect(toc.length).toBeGreaterThan(0);
    expect(toc[0]).toEqual({
      id: 'reader-intelligence-guide',
      title: 'Reader Intelligence Guide',
    });
    // Every TOC entry must correspond to an <h2 id="…">Title</h2> in the output
    for (const entry of toc) {
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
      expect(result.markdown).toContain(
        `<h2 id="${entry.id}">${entry.title}</h2>`
      );
    }
    // Tradecraft + analysis-index appendices should always be last, in order.
    const lastTwo = toc.slice(-2).map((e) => e.id);
    expect(lastTwo).toEqual(['aggregator-tradecraft-references', 'aggregator-analysis-index']);
  });

  it('suppresses the redundant ### artifact header when a section has one matching artifact', () => {
    const result = aggregateAnalysisRun({
      runDir: FIXTURE_RUN_DIR,
      repoRoot: FIXTURE_REPO,
    });
    // The fixture's synthesis section contains a single artifact named
    // synthesis-summary.md — the aggregator should emit
    // <h2 id="section-synthesis">Synthesis Summary</h2> but NOT a
    // follow-up "### Synthesis Summary" restating the same title.
    const pattern = /<h2 id="section-synthesis">Synthesis Summary<\/h2>[\s\S]*?### Synthesis Summary/;
    expect(pattern.test(result.markdown)).toBe(false);
  });

  it('does NOT include README.md in the aggregated output', () => {
    const result = aggregateAnalysisRun({
      runDir: FIXTURE_RUN_DIR,
      repoRoot: FIXTURE_REPO,
    });
    // README.md should never appear as an included artifact
    const readmePaths = result.includedArtifacts.filter((a) =>
      a.runRelPath.toLowerCase() === 'readme.md'
    );
    expect(readmePaths).toHaveLength(0);
  });
});

describe('guessDateFromRunDir', () => {
  it('extracts YYYY-MM-DD from a path with an ISO date segment', () => {
    expect(guessDateFromRunDir('analysis/daily/2026-04-24/breaking')).toBe('2026-04-24');
  });

  it('returns 1970-01-01 when no ISO date is present', () => {
    expect(guessDateFromRunDir('some/path/without/date')).toBe('1970-01-01');
  });

  it('handles a path with only the date component', () => {
    expect(guessDateFromRunDir('2025-12-31')).toBe('2025-12-31');
  });
});

describe('renderAnalysisIndex', () => {
  it('produces a table with section, artifact stem, and path columns', () => {
    const included = [
      {
        runRelPath: 'intelligence/synthesis-summary.md',
        repoRelPath: 'analysis/daily/2026-01-15/breaking/intelligence/synthesis-summary.md',
        sectionId: 'synthesis',
      },
    ];
    const out = renderAnalysisIndex(included, 'analysis/daily/2026-01-15/breaking/manifest.json');
    expect(out).toContain('synthesis-summary');
    expect(out).toContain('synthesis');
    expect(out).toContain('manifest.json');
    expect(out).toContain('| Section | Artifact | Path |');
  });

  it('lists the manifest.json link in the preamble', () => {
    const out = renderAnalysisIndex([], 'analysis/daily/2026-01-15/breaking/manifest.json');
    expect(out).toContain(
      'https://github.com/Hack23/euparliamentmonitor/blob/main/analysis/daily/2026-01-15/breaking/manifest.json'
    );
  });

  it('renders a row for every included artifact', () => {
    const included = [
      {
        runRelPath: 'extended/executive-brief.md',
        repoRelPath: 'analysis/daily/2026-01-15/breaking/extended/executive-brief.md',
        sectionId: 'executive-brief',
      },
      {
        runRelPath: 'intelligence/synthesis-summary.md',
        repoRelPath: 'analysis/daily/2026-01-15/breaking/intelligence/synthesis-summary.md',
        sectionId: 'synthesis',
      },
    ];
    const out = renderAnalysisIndex(included, 'analysis/daily/2026-01-15/breaking/manifest.json');
    expect(out).toContain('executive-brief');
    expect(out).toContain('synthesis-summary');
  });
});
