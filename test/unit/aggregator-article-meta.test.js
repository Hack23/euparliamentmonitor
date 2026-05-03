// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `src/aggregator/article-meta` — the deterministic
 * `article-meta.json` sidecar emitter.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildArticleMeta,
  extractKeyActors,
  extractKeyDates,
  extractKeyTakeaways,
  extractMacroContext,
  extractTopRisks,
  serializeArticleMeta,
} from '../../scripts/aggregator/article-meta.js';

/**
 * Lay down a minimal-but-realistic analysis run on disk so the meta
 * builders have content to harvest from. Returns the absolute run dir.
 */
function makeFixture(repo) {
  const run = path.join(repo, 'analysis', 'daily', '2026-04-24', 'breaking');
  fs.mkdirSync(path.join(run, 'intelligence'), { recursive: true });
  fs.mkdirSync(path.join(run, 'classification'), { recursive: true });
  fs.mkdirSync(path.join(run, 'risk-scoring'), { recursive: true });
  fs.mkdirSync(path.join(run, 'extended'), { recursive: true });

  fs.writeFileSync(
    path.join(run, 'executive-brief.md'),
    '# Brief\n\n## BLUF\n\nThe European Parliament finalises trade defence today.\n'
  );
  fs.writeFileSync(
    path.join(run, 'intelligence', 'synthesis-summary.md'),
    [
      '## Top Findings',
      '- Trade defence is operative across the Union.',
      '- Banking union closes BRRD3 SRMR3 DGSD2 reforms.',
      '- Digital omnibus eases AI Act compliance for SMEs.',
      '- Energy package returns to Strasbourg agenda.',
    ].join('\n')
  );
  fs.writeFileSync(
    path.join(run, 'risk-scoring', 'risk-matrix.md'),
    [
      '## Risk Register',
      '- Coalition fracture risk MEDIUM in JURI committee',
      '- Implementation slippage HIGH on trade defence rollout',
    ].join('\n')
  );
  fs.writeFileSync(
    path.join(run, 'intelligence', 'parliamentary-calendar-projection.md'),
    [
      '## Calendar',
      '- 2026-05-12 Plenary vote on banking union',
      '- 2026-05-20 ECON committee hearing on AI Act',
    ].join('\n')
  );
  fs.writeFileSync(
    path.join(run, 'classification', 'actor-mapping.md'),
    [
      '## Actor Mapping',
      '- EPP delivers grand-coalition swing on trade defence.',
      '- S&D anchors banking union centrist majority.',
    ].join('\n')
  );
  fs.writeFileSync(
    path.join(run, 'intelligence', 'economic-context.md'),
    [
      '## IMF Macro Context',
      'IMF projects euro area growth at 1.4 percent for 2026.',
    ].join('\n')
  );
  return run;
}

describe('article-meta — extractors', () => {
  it('extractTopRisks pulls bullets from risk-scoring/risk-matrix.md', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = makeFixture(repo);
    try {
      const out = extractTopRisks(run);
      expect(out.length).toBeGreaterThan(0);
      expect(out[0]).toMatch(/Coalition fracture/);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  it('extractKeyDates pulls dated bullets from the parliamentary calendar', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = makeFixture(repo);
    try {
      const out = extractKeyDates(run);
      expect(out).toEqual(
        expect.arrayContaining([expect.stringMatching(/2026-05-12/)])
      );
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  it('extractKeyActors pulls bullets from classification/actor-mapping.md', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = makeFixture(repo);
    try {
      const out = extractKeyActors(run);
      expect(out[0]).toMatch(/EPP/);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  it('extractMacroContext pulls IMF-flavoured paragraph from economic-context.md', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = makeFixture(repo);
    try {
      const out = extractMacroContext(run);
      expect(out).toMatch(/IMF projects/);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  it('extractKeyTakeaways respects MIN_TAKEAWAYS floor', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = makeFixture(repo);
    try {
      const out = extractKeyTakeaways(run);
      expect(out.length).toBeGreaterThanOrEqual(3);
      expect(out.length).toBeLessThanOrEqual(7);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });
});

describe('buildArticleMeta', () => {
  it('produces a fully populated meta record with deterministic source list', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = makeFixture(repo);
    try {
      const meta = buildArticleMeta({
        runDir: run,
        repoRoot: repo,
        date: '2026-04-24',
        articleType: 'breaking',
        runId: 'breaking-2026-04-24',
        gateResult: 'GREEN',
        slug: '2026-04-24-breaking',
      });
      expect(meta.date).toBe('2026-04-24');
      expect(meta.articleType).toBe('breaking');
      expect(meta.slug).toBe('2026-04-24-breaking');
      expect(meta.articlePath).toBe(
        'analysis/daily/2026-04-24/breaking/article.md'
      );
      expect(meta.topFinding).toMatch(/trade defence/i);
      expect(meta.keyTakeaways.length).toBeGreaterThanOrEqual(3);
      expect(meta.topRisks.length).toBeGreaterThan(0);
      expect(meta.keyDates.length).toBeGreaterThan(0);
      expect(meta.keyActors[0]).toMatch(/EPP/);
      expect(meta.macroContext).toMatch(/IMF/);
      // sources is sorted alphabetically and only includes existing files
      expect(meta.sources).toEqual([...meta.sources].sort());
      expect(meta.sources).toContain('intelligence/synthesis-summary.md');
      expect(meta.sources).not.toContain('extended/forward-indicators.md');
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  it('serializeArticleMeta produces stable, insertion-order JSON with a trailing newline', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = makeFixture(repo);
    try {
      const meta = buildArticleMeta({
        runDir: run,
        repoRoot: repo,
        date: '2026-04-24',
        articleType: 'breaking',
        runId: 'breaking-2026-04-24',
        gateResult: 'GREEN',
        slug: '2026-04-24-breaking',
      });
      const a = serializeArticleMeta(meta);
      const b = serializeArticleMeta(meta);
      expect(a).toBe(b);
      expect(a.endsWith('\n')).toBe(true);
      // Round-trip parses cleanly
      expect(JSON.parse(a)).toEqual(meta);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });

  it('returns empty arrays when artifacts are absent (graceful degradation)', () => {
    const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-meta-'));
    const run = path.join(repo, 'analysis', 'daily', '2026-04-24', 'empty-run');
    fs.mkdirSync(run, { recursive: true });
    try {
      const meta = buildArticleMeta({
        runDir: run,
        repoRoot: repo,
        date: '2026-04-24',
        articleType: 'breaking',
        runId: 'empty-run',
        gateResult: 'PENDING',
        slug: '2026-04-24-empty',
      });
      expect(meta.keyTakeaways).toEqual([]);
      expect(meta.topRisks).toEqual([]);
      expect(meta.keyDates).toEqual([]);
      expect(meta.keyActors).toEqual([]);
      expect(meta.topFinding).toBe('');
      expect(meta.macroContext).toBe('');
      expect(meta.sources).toEqual([]);
    } finally {
      fs.rmSync(repo, { recursive: true, force: true });
    }
  });
});
