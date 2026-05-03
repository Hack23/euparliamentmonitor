// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Byte-equality determinism test for the article-generation pipeline.
 *
 * The aggregator + renderer + HTML chrome MUST be deterministic: given the
 * same analysis run as input, two consecutive invocations must produce the
 * exact same output bytes for every file. Any new non-determinism (random
 * IDs, timestamps, Set/Map iteration order, locale-sensitive sorts) would
 * surface here as a checksum mismatch, blocking the regression from
 * landing.
 *
 * Runs the pipeline twice on the committed fixture under
 * `test/fixtures/analysis/2026-01-15/breaking-run-test/` and asserts that
 * the on-disk byte representation of every output file matches.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';
import { generateArticle } from '../../scripts/aggregator/article-generator.js';

const REPO_ROOT = path.resolve('.');
const FIXTURE_RUN_SOURCE = path.resolve('test/fixtures/analysis/2026-01-15/breaking-run-test');

/**
 * Recursively copy a directory to `dest`.
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

/**
 * Compute SHA-256 of every regular file under a directory tree, returning
 * a `relPath → hex digest` map. POSIX-normalises relative paths so the
 * comparison works on Windows.
 */
function hashTree(root) {
  const out = {};
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      const rel = path.relative(root, abs).replace(/\\/g, '/');
      const buf = fs.readFileSync(abs);
      out[rel] = crypto.createHash('sha256').update(buf).digest('hex');
    }
  };
  walk(root);
  return out;
}

describe('article-generation pipeline — determinism', () => {
  let tmpA;
  let tmpB;
  let isolatedRun;
  let isolatedRepo;

  beforeEach(() => {
    tmpA = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-deterministic-a-'));
    tmpB = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-deterministic-b-'));
    // Copy the fixture run into a private location so concurrent tests
    // (e.g. article-generator-cli.test.js) cannot wipe its `article.md`
    // mid-test. Keep the same on-disk path layout so `repoRelPath`
    // computation matches the original fixture.
    isolatedRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-deterministic-repo-'));
    isolatedRun = path.join(
      isolatedRepo,
      'test',
      'fixtures',
      'analysis',
      '2026-01-15',
      'breaking-run-test'
    );
    copyDir(FIXTURE_RUN_SOURCE, isolatedRun);
  });

  afterEach(() => {
    fs.rmSync(tmpA, { recursive: true, force: true });
    fs.rmSync(tmpB, { recursive: true, force: true });
    fs.rmSync(isolatedRepo, { recursive: true, force: true });
  });

  it('produces byte-identical output across two consecutive runs (English only)', () => {
    const cli = {
      runDir: isolatedRun,
      repoRoot: isolatedRepo,
      outDir: tmpA,
      langs: ['en'],
      all: false,
      markdownOnly: false,
    };

    generateArticle(cli);
    const first = hashTree(tmpA);

    // Snapshot run-dir article.md too — it's written into the run dir
    const articleMd = path.join(isolatedRun, 'article.md');
    const articleMeta = path.join(isolatedRun, 'article-meta.json');
    const articleMdHashFirst = crypto
      .createHash('sha256')
      .update(fs.readFileSync(articleMd))
      .digest('hex');
    const articleMetaHashFirst = crypto
      .createHash('sha256')
      .update(fs.readFileSync(articleMeta))
      .digest('hex');

    // Second run, fresh out dir
    generateArticle({ ...cli, outDir: tmpB });
    const second = hashTree(tmpB);
    const articleMdHashSecond = crypto
      .createHash('sha256')
      .update(fs.readFileSync(articleMd))
      .digest('hex');
    const articleMetaHashSecond = crypto
      .createHash('sha256')
      .update(fs.readFileSync(articleMeta))
      .digest('hex');

    expect(Object.keys(first).sort()).toEqual(Object.keys(second).sort());
    for (const key of Object.keys(first)) {
      expect(second[key]).toBe(first[key]);
    }
    expect(articleMdHashSecond).toBe(articleMdHashFirst);
    // article-meta.json is a deterministic sidecar; same artifact bytes in
    // → same JSON bytes out across consecutive invocations.
    expect(articleMetaHashSecond).toBe(articleMetaHashFirst);
  });

  it('produces byte-identical output across two consecutive runs (all 14 languages)', () => {
    const cli = {
      runDir: isolatedRun,
      repoRoot: isolatedRepo,
      outDir: tmpA,
      langs: [...ALL_LANGUAGES],
      all: false,
      markdownOnly: false,
    };

    generateArticle(cli);
    const first = hashTree(tmpA);

    generateArticle({ ...cli, outDir: tmpB });
    const second = hashTree(tmpB);

    expect(Object.keys(first).sort()).toEqual(Object.keys(second).sort());
    // Verify we actually emitted the expected file count: 1 source .md
    // plus one HTML per language (14)
    const htmlFiles = Object.keys(first).filter((k) => k.endsWith('.html'));
    expect(htmlFiles.length).toBe(ALL_LANGUAGES.length);
    for (const key of Object.keys(first)) {
      expect(second[key]).toBe(first[key]);
    }
  });

  it('produces byte-identical output in --markdown-only mode', () => {
    const cli = {
      runDir: isolatedRun,
      repoRoot: isolatedRepo,
      outDir: tmpA,
      langs: ['en'],
      all: false,
      markdownOnly: true,
    };

    generateArticle(cli);
    const first = hashTree(tmpA);
    generateArticle({ ...cli, outDir: tmpB });
    const second = hashTree(tmpB);

    // markdown-only: no HTML files emitted
    expect(Object.keys(first).every((k) => !k.endsWith('.html'))).toBe(true);
    for (const key of Object.keys(first)) {
      expect(second[key]).toBe(first[key]);
    }
  });
});
