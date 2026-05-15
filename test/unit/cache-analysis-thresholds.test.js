// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = path.join(ROOT, 'scripts', 'cache-analysis-thresholds.sh');
const THRESHOLDS_SRC = path.join(ROOT, 'analysis', 'methodologies', 'reference-quality-thresholds.json');

let tmpRoot;

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cache-thresholds-test-'));
  // The cache script derives REPO_ROOT via `dirname "$0"/..` (two single-level
  // command substitutions — no git rev-parse, no resolve-analysis-dir.sh
  // delegation). The fake repo only needs the source thresholds JSON at the
  // expected relative path; no git init is required.
  fs.mkdirSync(path.join(tmpRoot, 'analysis', 'methodologies'), { recursive: true });
  fs.copyFileSync(THRESHOLDS_SRC, path.join(tmpRoot, 'analysis', 'methodologies', 'reference-quality-thresholds.json'));
});

afterAll(() => {
  if (tmpRoot && fs.existsSync(tmpRoot)) {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

function runCacheScript(args, extraEnv = {}) {
  // The script uses `dirname "$0"/..` to find the repo root, so it must be
  // placed under a `scripts/` subdirectory of the fake repo root.
  const scriptsDir = path.join(tmpRoot, 'scripts');
  fs.mkdirSync(scriptsDir, { recursive: true });
  const localScript = path.join(scriptsDir, 'cache-analysis-thresholds.sh');
  fs.copyFileSync(SCRIPT, localScript);
  fs.chmodSync(localScript, 0o755);
  return spawnSync('bash', [localScript, ...args], {
    cwd: tmpRoot,
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  });
}

describe('scripts/cache-analysis-thresholds.sh', () => {
  it('exits 2 when called with fewer than 2 args', () => {
    const result = runCacheScript(['only-one-arg']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('usage:');
  });

  it('exits 2 when article-type-slug contains a path separator', () => {
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-01', 'breaking');
    fs.mkdirSync(analysisDir, { recursive: true });
    const result = runCacheScript([analysisDir, 'foo/bar']);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('path separators');
  });

  it('exits 2 when article-type-slug is empty', () => {
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-01', 'breaking');
    fs.mkdirSync(analysisDir, { recursive: true });
    const result = runCacheScript([analysisDir, '']);
    expect(result.status).toBe(2);
  });

  it('writes thresholds-cache.json to runs/ subdirectory', () => {
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-01', 'breaking');
    fs.mkdirSync(analysisDir, { recursive: true });
    const result = runCacheScript([analysisDir, 'breaking']);
    expect(result.status).toBe(0);

    const cacheFile = path.join(analysisDir, 'runs', 'thresholds-cache.json');
    expect(fs.existsSync(cacheFile)).toBe(true);
  });

  it('cache JSON contains filteredForArticleType and cachedAt fields', () => {
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-01', 'propositions');
    fs.mkdirSync(analysisDir, { recursive: true });
    runCacheScript([analysisDir, 'propositions']);

    const cacheFile = path.join(analysisDir, 'runs', 'thresholds-cache.json');
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

    expect(cache.filteredForArticleType).toBe('propositions');
    expect(typeof cache.cachedAt).toBe('string');
    expect(cache.cachedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(typeof cache.version).toBe('string');
  });

  it('cache JSON is a subset of the source thresholds (contains version field)', () => {
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-01', 'breaking-v2');
    fs.mkdirSync(analysisDir, { recursive: true });
    runCacheScript([analysisDir, 'breaking']);

    const cacheFile = path.join(analysisDir, 'runs', 'thresholds-cache.json');
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const source = JSON.parse(fs.readFileSync(THRESHOLDS_SRC, 'utf8'));

    // Version must match the source
    expect(cache.version).toBe(source.version);
    // Cache must be valid JSON
    expect(cache).toBeTruthy();
  });

  it('cache JSON contains the per-slug threshold entries for the active article type', () => {
    // Regression test: an earlier version treated `thresholds` as an array
    // and used `.find((t) => t.articleType === slug)`, which silently emitted
    // an empty array because the source schema keys `thresholds` by slug
    // (object). This test asserts the per-artifact floors are actually
    // present so a future schema/script mismatch fails loudly.
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-01', 'breaking-floors');
    fs.mkdirSync(analysisDir, { recursive: true });
    runCacheScript([analysisDir, 'breaking']);

    const cacheFile = path.join(analysisDir, 'runs', 'thresholds-cache.json');
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const source = JSON.parse(fs.readFileSync(THRESHOLDS_SRC, 'utf8'));

    expect(cache.thresholds).toBeTruthy();
    expect(typeof cache.thresholds).toBe('object');
    expect(Object.keys(cache.thresholds).length).toBeGreaterThan(0);
    expect(cache.thresholds.breaking).toBeTruthy();
    // The per-artifact floors must match the source file for the active slug.
    expect(cache.thresholds.breaking).toEqual(source.thresholds.breaking);
    // A representative known floor from the source (executive-brief.md = 180).
    expect(cache.thresholds.breaking['executive-brief.md']).toBe(
      source.thresholds.breaking['executive-brief.md'],
    );
  });

  it('cache JSON contains an empty thresholds object when the slug is absent from the source', () => {
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-01-01', 'unknown-slug');
    fs.mkdirSync(analysisDir, { recursive: true });
    const result = runCacheScript([analysisDir, 'no-such-article-type']);
    expect(result.status).toBe(0);

    const cacheFile = path.join(analysisDir, 'runs', 'thresholds-cache.json');
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    expect(cache.thresholds).toEqual({});
    expect(cache.filteredForArticleType).toBe('no-such-article-type');
  });

  it('creates the runs/ directory if it does not exist', () => {
    const analysisDir = path.join(tmpRoot, 'analysis', 'daily', '2026-02-01', 'motions');
    fs.mkdirSync(analysisDir, { recursive: true });
    // runs/ dir does NOT exist yet
    expect(fs.existsSync(path.join(analysisDir, 'runs'))).toBe(false);

    const result = runCacheScript([analysisDir, 'motions']);
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(analysisDir, 'runs'))).toBe(true);
  });

  it('script source passes shell-safety check (no forbidden expansions)', () => {
    const scriptSource = fs.readFileSync(SCRIPT, 'utf8');
    // Strip comment lines before checking (matching shell-safety.test.js behaviour)
    const executableLines = scriptSource
      .split('\n')
      .filter((line) => !/^\s*#/u.test(line))
      .join('\n');

    // No nested command substitution (simplified check)
    expect(executableLines).not.toMatch(/\$\([^)]*\$\(/);
    // No indirect expansion
    expect(executableLines).not.toMatch(/\$\{![a-zA-Z]/);
    // No parameter transformation operators (see shell-safety.test.js RULES)
    expect(executableLines).not.toMatch(/\$\{[A-Za-z_][A-Za-z_0-9]*@[PQEAKa]\}/);
    // No eval
    expect(executableLines).not.toMatch(/\beval\b/);
  });
});
