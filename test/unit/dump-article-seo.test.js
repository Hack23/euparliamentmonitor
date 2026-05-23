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

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseArgs,
  readManifestMetadata,
  resolveRunSeo,
  formatRecord,
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
