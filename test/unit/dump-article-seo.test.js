// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `scripts/dump-article-seo.js` — the read-only audit
 * dumper that surfaces `<title>`, `<meta description>`,
 * `<meta description-extended>`, and `<meta keywords>` values produced by
 * the deterministic article generator for every committed analysis run.
 *
 * The script wraps `resolveArticleMetadata()` (the same resolver used by
 * `npm run generate-article:all`), so these tests focus on the dumper's
 * CLI surface and on verifying it returns non-empty English head metadata
 * for a real committed analysis run.
 */

import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseArgs,
  readManifestMetadata,
  resolveRunSeo,
  formatRecord,
  dumpArticleSeo,
} from '../../scripts/dump-article-seo.js';
import { discoverAnalysisRuns } from '../../scripts/aggregator/generator/discovery.js';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

describe('scripts/dump-article-seo.js — parseArgs', () => {
  it('returns defaults when invoked without args', () => {
    const opts = parseArgs([]);
    expect(opts.lang).toBe('en');
    expect(opts.repoRoot).toBe(process.cwd());
    expect(opts.outPath).toBeNull();
    expect(opts.jsonPath).toBeNull();
    expect(opts.quiet).toBe(false);
    expect(opts.limit).toBe(Number.POSITIVE_INFINITY);
  });

  it('accepts --lang en (problem-statement scope)', () => {
    const opts = parseArgs(['--lang', 'en']);
    expect(opts.lang).toBe('en');
  });

  it('rejects an unsupported language code', () => {
    expect(() => parseArgs(['--lang', 'xx'])).toThrow(/unsupported/i);
  });

  it('rejects a non-numeric --limit', () => {
    expect(() => parseArgs(['--limit', 'NaN'])).toThrow(/limit/i);
  });

  it('rejects --limit <= 0', () => {
    expect(() => parseArgs(['--limit', '0'])).toThrow(/limit/i);
  });

  it('accepts --limit as a positive integer', () => {
    const opts = parseArgs(['--limit', '3']);
    expect(opts.limit).toBe(3);
  });

  it('captures --out and --json file paths', () => {
    const opts = parseArgs([
      '--out',
      '/tmp/a.txt',
      '--json',
      '/tmp/b.jsonl',
    ]);
    expect(opts.outPath).toBe('/tmp/a.txt');
    expect(opts.jsonPath).toBe('/tmp/b.jsonl');
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['--no-such-flag'])).toThrow(/unknown/i);
  });
});

describe('scripts/dump-article-seo.js — readManifestMetadata', () => {
  it('returns an empty object when the run directory has no manifest.json', () => {
    const result = readManifestMetadata(path.join(REPO_ROOT, 'src'));
    expect(result).toEqual({});
  });
});

describe('scripts/dump-article-seo.js — resolveRunSeo (real committed run)', () => {
  // Pick the first run discoverAnalysisRuns would surface deterministically.
  // We assert via formatRecord that the resolver returns a usable English
  // entry rather than hardcoding a specific run dir — the audit's whole
  // point is that committed runs change over time but the contract stays.
  const firstRun = discoverAnalysisRuns(REPO_ROOT)[0];

  it.skipIf(!firstRun)(
    'returns a non-empty English title and description for the first committed run',
    () => {
      const record = resolveRunSeo({
        runDir: firstRun.runDir,
        repoRoot: REPO_ROOT,
        lang: 'en',
      });

      expect(record).toBeDefined();
      expect(record.entry).toBeDefined();
      expect(typeof record.entry.title).toBe('string');
      expect(record.entry.title.length).toBeGreaterThan(0);
      expect(typeof record.entry.description).toBe('string');
      expect(record.entry.description.length).toBeGreaterThan(0);
      expect(Array.isArray(record.entry.keywords)).toBe(true);
      // The resolver always tags every entry with a known source tier.
      expect(typeof record.entry.source).toBe('string');
      expect(record.entry.source.length).toBeGreaterThan(0);
    },
  );

  it.skipIf(!firstRun)(
    'produces a formatted record containing each HTML head field label',
    () => {
      const record = resolveRunSeo({
        runDir: firstRun.runDir,
        repoRoot: REPO_ROOT,
        lang: 'en',
      });
      const text = formatRecord(record, 1, 1);
      expect(text).toMatch(/<title>/);
      expect(text).toMatch(/<meta description>/);
      expect(text).toMatch(/<meta keywords>/);
      expect(text).toMatch(/resolution-tier/);
      expect(text).toMatch(/html-file/);
    },
  );
});

describe('scripts/dump-article-seo.js — parseArgs strict --limit validation', () => {
  it('rejects a partially-numeric --limit like "3junk"', () => {
    expect(() => parseArgs(['--limit', '3junk'])).toThrow(/limit/i);
  });

  it('rejects a float --limit like "1.5"', () => {
    expect(() => parseArgs(['--limit', '1.5'])).toThrow(/limit/i);
  });
});

describe('scripts/dump-article-seo.js — dumpArticleSeo', () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  const firstRun = discoverAnalysisRuns(REPO_ROOT)[0];

  it.skipIf(!firstRun)(
    'returns a summary object with expected shape for limit=1',
    () => {
      const result = dumpArticleSeo({
        repoRoot: REPO_ROOT,
        lang: 'en',
        outPath: null,
        jsonPath: null,
        limit: 1,
        quiet: true,
      });

      expect(typeof result.total).toBe('number');
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(typeof result.processed).toBe('number');
      expect(result.processed).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(result.records)).toBe(true);
      expect(result.records.length).toBeGreaterThanOrEqual(1);
      expect(typeof result.resolutionTiers).toBe('object');
      expect(typeof result.emptyKeywordCount).toBe('number');
      expect(typeof result.shortDescriptionCount).toBe('number');
    },
  );

  it.skipIf(!firstRun)(
    'writes the text output file when outPath is supplied',
    () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dump-article-seo-'));
      const outPath = path.join(tmpDir, 'out.txt');

      dumpArticleSeo({
        repoRoot: REPO_ROOT,
        lang: 'en',
        outPath,
        jsonPath: null,
        limit: 1,
        quiet: true,
      });

      expect(fs.existsSync(outPath)).toBe(true);
      const text = fs.readFileSync(outPath, 'utf8');
      expect(text).toMatch(/Article HTML Header Dump/);
      expect(text).toMatch(/<title>/);
    },
  );

  it.skipIf(!firstRun)(
    'writes the JSONL output file when jsonPath is supplied',
    () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dump-article-seo-'));
      const jsonPath = path.join(tmpDir, 'out.jsonl');

      dumpArticleSeo({
        repoRoot: REPO_ROOT,
        lang: 'en',
        outPath: null,
        jsonPath,
        limit: 1,
        quiet: true,
      });

      expect(fs.existsSync(jsonPath)).toBe(true);
      const lines = fs.readFileSync(jsonPath, 'utf8').trim().split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(1);
      const record = JSON.parse(lines[0]);
      expect(typeof record.title).toBe('string');
      expect(record.title.length).toBeGreaterThan(0);
      expect(typeof record.description).toBe('string');
      expect(typeof record.slug).toBe('string');
      expect(record.lang).toBe('en');
    },
  );
});
