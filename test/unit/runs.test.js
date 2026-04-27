// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/aggregator/runs — discovery walk, manifest schema
 * tolerance (canonical / plural-articleTypes / very-legacy runType),
 * malformed-JSON skip, and `(date, articleType)` collision grouping.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  discoverAnalysisRuns,
  readRunCandidate,
  dateFromPath,
  groupRunsForCollision,
  collisionKey,
} from '../../scripts/aggregator/runs/index.js';

/**
 * Build a fake repository root with `analysis/daily/<runs>` populated. The
 * `runs` array describes manifests to write; each entry becomes a
 * `manifest.json` under a freshly-created run directory.
 */
function buildFakeRepo(runs) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'runs-test-'));
  for (const run of runs) {
    const runDir = path.join(root, 'analysis', 'daily', run.dirSegments);
    fs.mkdirSync(runDir, { recursive: true });
    if (run.manifest !== undefined) {
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        typeof run.manifest === 'string' ? run.manifest : JSON.stringify(run.manifest)
      );
    }
  }
  return root;
}

describe('dateFromPath', () => {
  it('extracts ISO date from a typical run dir', () => {
    expect(dateFromPath('/tmp/repo/analysis/daily/2026-04-27/breaking-run1')).toBe('2026-04-27');
  });

  it('falls back to epoch when no ISO date is present', () => {
    expect(dateFromPath('/tmp/repo/analysis/daily/no-date/run')).toBe('1970-01-01');
  });

  it('picks the first match when several are present', () => {
    expect(dateFromPath('2026-04-27/sub/2025-01-01/x')).toBe('2026-04-27');
  });
});

describe('readRunCandidate', () => {
  let root;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'runs-cand-'));
  });
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns null when manifest is missing', () => {
    expect(readRunCandidate(root)).toBeNull();
  });

  it('returns null on malformed JSON without throwing', () => {
    fs.writeFileSync(path.join(root, 'manifest.json'), '{not valid');
    expect(readRunCandidate(root)).toBeNull();
  });

  it('returns null when articleType resolves to "unknown"', () => {
    fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({ date: '2026-04-27' }));
    expect(readRunCandidate(root)).toBeNull();
  });

  it('reads a canonical articleType manifest', () => {
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify({ articleType: 'breaking', date: '2026-04-27', runId: 'run1' })
    );
    expect(readRunCandidate(root)).toEqual({
      runDir: root,
      articleType: 'breaking',
      date: '2026-04-27',
      runId: 'run1',
    });
  });

  it('reads a legacy articleTypes[] manifest', () => {
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify({ articleTypes: ['propositions'], date: '2026-04-06' })
    );
    const r = readRunCandidate(root);
    expect(r?.articleType).toBe('propositions');
  });

  it('reads a very-legacy runType manifest', () => {
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify({ runType: 'breaking', date: '2026-04-17' })
    );
    expect(readRunCandidate(root)?.articleType).toBe('breaking');
  });

  it('falls back to directory basename when runId is missing', () => {
    const sub = path.join(root, 'breaking-run-fallback');
    fs.mkdirSync(sub);
    fs.writeFileSync(
      path.join(sub, 'manifest.json'),
      JSON.stringify({ articleType: 'breaking', date: '2026-04-27' })
    );
    expect(readRunCandidate(sub)?.runId).toBe('breaking-run-fallback');
  });

  it('coerces numeric runId to string', () => {
    fs.writeFileSync(
      path.join(root, 'manifest.json'),
      JSON.stringify({ articleType: 'breaking', date: '2026-04-27', runId: 42 })
    );
    expect(readRunCandidate(root)?.runId).toBe('42');
  });

  it('falls back to dateFromPath when manifest date is missing', () => {
    const sub = path.join(root, '2026-04-27-breaking');
    fs.mkdirSync(sub);
    fs.writeFileSync(
      path.join(sub, 'manifest.json'),
      JSON.stringify({ articleType: 'breaking', runId: 'r1' })
    );
    expect(readRunCandidate(sub)?.date).toBe('2026-04-27');
  });
});

describe('discoverAnalysisRuns', () => {
  let root;
  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns [] when analysis/daily does not exist', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'runs-empty-'));
    expect(discoverAnalysisRuns(root)).toEqual([]);
  });

  it('discovers a flat run directory', () => {
    root = buildFakeRepo([
      {
        dirSegments: '2026-04-27/breaking',
        manifest: { articleType: 'breaking', date: '2026-04-27', runId: 'r1' },
      },
    ]);
    const runs = discoverAnalysisRuns(root);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.articleType).toBe('breaking');
  });

  it('sorts results by date ascending then by path lexically', () => {
    root = buildFakeRepo([
      {
        dirSegments: '2026-04-27/breaking',
        manifest: { articleType: 'breaking', date: '2026-04-27', runId: 'r1' },
      },
      {
        dirSegments: '2026-04-25/motions',
        manifest: { articleType: 'motions', date: '2026-04-25', runId: 'r2' },
      },
      {
        dirSegments: '2026-04-25/breaking',
        manifest: { articleType: 'breaking', date: '2026-04-25', runId: 'r3' },
      },
    ]);
    const runs = discoverAnalysisRuns(root);
    expect(runs.map((r) => r.date)).toEqual(['2026-04-25', '2026-04-25', '2026-04-27']);
    // For the two 2026-04-25 entries, the earlier path comes first
    expect(runs[0]?.runDir.endsWith('breaking')).toBe(true);
    expect(runs[1]?.runDir.endsWith('motions')).toBe(true);
  });

  it('skips dirs whose manifest is malformed JSON', () => {
    root = buildFakeRepo([
      {
        dirSegments: '2026-04-27/breaking',
        manifest: { articleType: 'breaking', date: '2026-04-27', runId: 'good' },
      },
      {
        dirSegments: '2026-04-27/broken',
        manifest: '{not valid',
      },
    ]);
    const runs = discoverAnalysisRuns(root);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.runId).toBe('good');
  });

  it('skips dirs without a manifest, descending into their children', () => {
    root = buildFakeRepo([
      // Outer dir: no manifest, must be descended into
      {
        dirSegments: '2026-04-27/intermediate/breaking',
        manifest: { articleType: 'breaking', date: '2026-04-27', runId: 'nested' },
      },
    ]);
    const runs = discoverAnalysisRuns(root);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.runId).toBe('nested');
  });

  it('does not descend once a manifest is found (no nested-run pollution)', () => {
    root = buildFakeRepo([
      {
        dirSegments: '2026-04-27/breaking',
        manifest: { articleType: 'breaking', date: '2026-04-27', runId: 'top' },
      },
    ]);
    // Inject a fake nested manifest under analysis-of-the-run
    const nested = path.join(root, 'analysis', 'daily', '2026-04-27', 'breaking', 'subrun');
    fs.mkdirSync(nested);
    fs.writeFileSync(
      path.join(nested, 'manifest.json'),
      JSON.stringify({ articleType: 'shouldNotShow', date: '2026-04-27', runId: 'nested' })
    );
    const runs = discoverAnalysisRuns(root);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.runId).toBe('top');
  });

  it('handles legacy schema variants in the same walk', () => {
    root = buildFakeRepo([
      {
        dirSegments: '2026-04-27/canonical',
        manifest: { articleType: 'breaking', date: '2026-04-27', runId: 'r1' },
      },
      {
        dirSegments: '2026-04-06/plural',
        manifest: { articleTypes: ['propositions'], date: '2026-04-06', runId: 'r2' },
      },
      {
        dirSegments: '2026-04-17/legacy',
        manifest: { runType: 'breaking', date: '2026-04-17', runId: 'r3' },
      },
    ]);
    const runs = discoverAnalysisRuns(root);
    expect(runs).toHaveLength(3);
    const byRunId = Object.fromEntries(runs.map((r) => [r.runId, r.articleType]));
    expect(byRunId.r1).toBe('breaking');
    expect(byRunId.r2).toBe('propositions');
    expect(byRunId.r3).toBe('breaking');
  });
});

describe('collisionKey', () => {
  it('joins date and articleType with a pipe', () => {
    expect(collisionKey({ date: '2026-04-27', articleType: 'breaking' })).toBe(
      '2026-04-27|breaking'
    );
  });
});

describe('groupRunsForCollision', () => {
  it('returns empty map for empty input', () => {
    expect(groupRunsForCollision([]).size).toBe(0);
  });

  it('groups one run into its own bucket', () => {
    const groups = groupRunsForCollision([
      { runDir: '/x', articleType: 'breaking', date: '2026-04-27', runId: 'r1' },
    ]);
    expect(groups.size).toBe(1);
    expect(groups.get('2026-04-27|breaking')).toHaveLength(1);
  });

  it('detects 2-way collisions on shared (date, articleType)', () => {
    const groups = groupRunsForCollision([
      { runDir: '/a', articleType: 'breaking', date: '2026-04-27', runId: 'r1' },
      { runDir: '/b', articleType: 'breaking', date: '2026-04-27', runId: 'r2' },
    ]);
    expect(groups.get('2026-04-27|breaking')).toHaveLength(2);
  });

  it('separates distinct (date, articleType) tuples', () => {
    const groups = groupRunsForCollision([
      { runDir: '/a', articleType: 'breaking', date: '2026-04-27', runId: 'r1' },
      { runDir: '/b', articleType: 'motions', date: '2026-04-27', runId: 'r2' },
      { runDir: '/c', articleType: 'breaking', date: '2026-04-26', runId: 'r3' },
    ]);
    expect(groups.size).toBe(3);
    for (const bucket of groups.values()) {
      expect(bucket).toHaveLength(1);
    }
  });

  it('preserves insertion order within a bucket', () => {
    const groups = groupRunsForCollision([
      { runDir: '/first', articleType: 'breaking', date: '2026-04-27', runId: 'r1' },
      { runDir: '/second', articleType: 'breaking', date: '2026-04-27', runId: 'r2' },
      { runDir: '/third', articleType: 'breaking', date: '2026-04-27', runId: 'r3' },
    ]);
    const bucket = groups.get('2026-04-27|breaking');
    expect(bucket?.map((r) => r.runId)).toEqual(['r1', 'r2', 'r3']);
  });
});
