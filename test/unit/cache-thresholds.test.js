// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/cache-thresholds.js
 *
 * Tests:
 * - normaliseSlug: run-ID suffix stripping
 * - loadThresholds: file loading and error handling
 * - filterThresholdsForSlug: exact match, no match, default floor
 * - buildThresholdsCache: full flow, content-hash short-circuit, dir creation
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  normaliseSlug,
  loadThresholds,
  filterThresholdsForSlug,
  buildThresholdsCache,
} from '../../scripts/cache-thresholds.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/** Minimal thresholds JSON matching the real file structure. */
function makeThresholds(extraTypes = {}) {
  return {
    version: '1.5.0',
    description: 'Test thresholds fixture',
    defaults: { minLines: 30 },
    thresholds: {
      breaking: {
        files: {
          'executive-brief.md': 60,
          'intelligence/synthesis-summary.md': 80,
          'intelligence/scenario-forecast.md': 100,
          'risk-scoring/risk-matrix.md': 50,
        },
      },
      'week-in-review': {
        files: {
          'executive-brief.md': 55,
          'intelligence/synthesis-summary.md': 75,
        },
      },
      ...extraTypes,
    },
  };
}

// ---------------------------------------------------------------------------
// normaliseSlug
// ---------------------------------------------------------------------------

describe('normaliseSlug', () => {
  it('returns unchanged slug with no run-ID suffix', () => {
    expect(normaliseSlug('breaking')).toBe('breaking');
    expect(normaliseSlug('week-in-review')).toBe('week-in-review');
  });

  it('strips -run-<digits> suffix', () => {
    expect(normaliseSlug('breaking-run-1234567890')).toBe('breaking');
  });

  it('strips -run-<digits>-<digits> suffix', () => {
    expect(normaliseSlug('breaking-run-123-456')).toBe('breaking');
  });

  it('strips legacy -run<digits> suffix (no hyphen between run and digits)', () => {
    // Legacy run-folder names like `breaking-run184` were used pre-aggregator;
    // some external callers still pass that form. See analysis/daily/2026-04-18/
    // for examples (breaking-run183, breaking-run184, breaking-run185).
    expect(normaliseSlug('breaking-run184')).toBe('breaking');
    expect(normaliseSlug('week-in-review-run12')).toBe('week-in-review');
    expect(normaliseSlug('translate-run129')).toBe('translate');
  });

  it('leaves complex slugs without run-ID unchanged', () => {
    expect(normaliseSlug('committee-reports')).toBe('committee-reports');
  });
});

// ---------------------------------------------------------------------------
// loadThresholds
// ---------------------------------------------------------------------------

describe('loadThresholds', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cache-thresh-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads and parses a valid thresholds file', () => {
    const repoRoot = tmpDir;
    const threshDir = path.join(repoRoot, 'analysis', 'methodologies');
    fs.mkdirSync(threshDir, { recursive: true });
    const filePath = path.join(threshDir, 'reference-quality-thresholds.json');
    const data = makeThresholds();
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');

    const result = loadThresholds(repoRoot);
    expect(result.thresholds).toEqual(data);
    expect(typeof result.raw).toBe('string');
  });

  it('throws when thresholds file does not exist', () => {
    expect(() => loadThresholds(tmpDir)).toThrow('Thresholds file not found');
  });

  it('throws when file has invalid JSON', () => {
    const repoRoot = tmpDir;
    const threshDir = path.join(repoRoot, 'analysis', 'methodologies');
    fs.mkdirSync(threshDir, { recursive: true });
    fs.writeFileSync(
      path.join(threshDir, 'reference-quality-thresholds.json'),
      'not-json',
      'utf8',
    );
    expect(() => loadThresholds(repoRoot)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// filterThresholdsForSlug
// ---------------------------------------------------------------------------

describe('filterThresholdsForSlug', () => {
  const thresholds = makeThresholds();

  it('returns correct floors for matching slug', () => {
    const result = filterThresholdsForSlug(thresholds, 'breaking');
    expect(result.matchedTypes).toContain('breaking');
    expect(result.floors['executive-brief.md']).toBe(60);
    expect(result.floors['intelligence/synthesis-summary.md']).toBe(80);
  });

  it('returns empty floors for non-matching slug', () => {
    const result = filterThresholdsForSlug(thresholds, 'election-cycle');
    expect(result.matchedTypes).toHaveLength(0);
    expect(Object.keys(result.floors)).toHaveLength(0);
  });

  it('uses defaultFloor from thresholds.defaults.minLines', () => {
    const result = filterThresholdsForSlug(thresholds, 'breaking');
    expect(result.defaultFloor).toBe(30);
  });

  it('uses 30 as defaultFloor when defaults not present', () => {
    const noDefaults = { ...makeThresholds(), defaults: undefined };
    const result = filterThresholdsForSlug(noDefaults, 'breaking');
    expect(result.defaultFloor).toBe(30);
  });

  it('handles thresholds with no thresholds map gracefully', () => {
    const result = filterThresholdsForSlug({}, 'breaking');
    expect(result.floors).toEqual({});
    expect(result.matchedTypes).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// buildThresholdsCache
// ---------------------------------------------------------------------------

describe('buildThresholdsCache', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cache-thresh-build-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function setupRepo(thresholds) {
    const threshDir = path.join(tmpDir, 'analysis', 'methodologies');
    fs.mkdirSync(threshDir, { recursive: true });
    fs.writeFileSync(
      path.join(threshDir, 'reference-quality-thresholds.json'),
      JSON.stringify(thresholds),
      'utf8',
    );
    return tmpDir;
  }

  it('creates cache file in analysis/runs/<runId> by default', () => {
    const repoRoot = setupRepo(makeThresholds());
    const result = buildThresholdsCache(repoRoot, 'breaking', 'breaking-run-001');

    expect(result.cached).toBe(false);
    expect(fs.existsSync(result.outputFile)).toBe(true);
    expect(result.outputFile).toContain('breaking-run-001');
    expect(result.outputFile).toContain('thresholds-cache.json');
  });

  it('writes correct floors to cache file', () => {
    const repoRoot = setupRepo(makeThresholds());
    const result = buildThresholdsCache(repoRoot, 'breaking', 'breaking-run-001');

    const cached = JSON.parse(fs.readFileSync(result.outputFile, 'utf8'));
    expect(cached.slug).toBe('breaking');
    expect(cached.floors['executive-brief.md']).toBe(60);
    expect(cached.floors['intelligence/synthesis-summary.md']).toBe(80);
    expect(cached.contentHash).toBeTruthy();
    expect(cached.generatedAt).toBeTruthy();
  });

  it('short-circuits on second call with same inputs (cached=true)', () => {
    const repoRoot = setupRepo(makeThresholds());
    const r1 = buildThresholdsCache(repoRoot, 'breaking', 'breaking-run-001');
    const r2 = buildThresholdsCache(repoRoot, 'breaking', 'breaking-run-001');

    expect(r1.cached).toBe(false);
    expect(r2.cached).toBe(true);
    expect(r1.contentHash).toBe(r2.contentHash);
  });

  it('normalises slug with run-ID suffix', () => {
    const repoRoot = setupRepo(makeThresholds());
    const result = buildThresholdsCache(
      repoRoot,
      'breaking-run-9999',
      'breaking-run-9999',
    );

    const cached = JSON.parse(fs.readFileSync(result.outputFile, 'utf8'));
    expect(cached.slug).toBe('breaking');
    expect(cached.floors['executive-brief.md']).toBe(60);
  });

  it('uses custom runDir when provided', () => {
    const repoRoot = setupRepo(makeThresholds());
    const customRunDir = path.join(tmpDir, 'custom-output');
    const result = buildThresholdsCache(repoRoot, 'breaking', 'run-1', customRunDir);

    expect(result.outputFile).toContain('custom-output');
    expect(fs.existsSync(result.outputFile)).toBe(true);
  });

  it('includes artifactCount in cache payload', () => {
    const repoRoot = setupRepo(makeThresholds());
    const result = buildThresholdsCache(repoRoot, 'breaking', 'breaking-run-001');

    const cached = JSON.parse(fs.readFileSync(result.outputFile, 'utf8'));
    expect(cached.artifactCount).toBeGreaterThan(0);
    expect(cached.artifactCount).toBe(Object.keys(result.floors).length);
  });
});

// ---------------------------------------------------------------------------
// main() CLI function — via spawnSync
// ---------------------------------------------------------------------------

describe('cache-thresholds.js main() CLI', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cache-thresh-cli-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const SCRIPT = path.join(ROOT, 'scripts', 'cache-thresholds.js');

  function runScript(args) {
    return spawnSync(process.execPath, [SCRIPT, ...args], {
      encoding: 'utf8',
      env: { ...process.env },
    });
  }

  it('exits 2 and prints usage when slug or run-id is missing', () => {
    const result = runScript(['--slug', 'breaking']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('--run-id');
  });

  it('exits 2 when run-id is provided but slug is missing', () => {
    const result = runScript(['--run-id', 'test-run-1']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('--slug');
  });

  it('exits 2 when neither slug nor run-id is provided', () => {
    const result = runScript([]);
    expect(result.status).toBe(2);
  });

  it('exits 1 when thresholds file is missing in repo-root', () => {
    const result = runScript([
      '--slug', 'breaking',
      '--run-id', 'test-run-1',
      '--repo-root', tmpDir,
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Thresholds file not found');
  });

  it('exits 0 and prints JSON when all args are valid', () => {
    // Create a minimal thresholds file in tmpDir
    const threshDir = path.join(tmpDir, 'analysis', 'methodologies');
    fs.mkdirSync(threshDir, { recursive: true });
    const thresholds = {
      version: '1.0',
      defaults: { minLines: 30 },
      thresholds: { breaking: { files: { 'executive-brief.md': 60 } } },
    };
    fs.writeFileSync(
      path.join(threshDir, 'reference-quality-thresholds.json'),
      JSON.stringify(thresholds),
      'utf8',
    );

    const result = runScript([
      '--slug', 'breaking',
      '--run-id', 'test-run-1',
      '--repo-root', tmpDir,
    ]);
    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.status).toBe('ok');
    expect(parsed.slug).toBe('breaking');
    expect(parsed.artifactCount).toBeGreaterThan(0);
  });
});
