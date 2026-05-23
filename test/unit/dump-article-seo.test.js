// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `scripts/dump-article-seo.js` — the read-only audit
 * tool that surfaces the SEO `<head>` metadata (title, description,
 * keywords, og:*, twitter:*) that the article generator **would produce**
 * from each executive brief, before any HTML file is generated.
 *
 * The script wraps `resolveArticleMetadata()` (the same resolver used by
 * `npm run generate-article:all`), so these tests focus on the dumper's
 * CLI surface, HTML head snippet generation, and verifying it returns
 * non-empty English head metadata for a real committed analysis run.
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
  buildHtmlHeadSnippet,
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

describe('scripts/dump-article-seo.js — parseArgs strict --limit validation', () => {
  it('rejects a partially-numeric --limit like "3junk"', () => {
    expect(() => parseArgs(['--limit', '3junk'])).toThrow(/limit/i);
  });

  it('rejects a float --limit like "1.5"', () => {
    expect(() => parseArgs(['--limit', '1.5'])).toThrow(/limit/i);
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
  // entry rather than hardcoding a specific run dir.
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
    'produces a formatted record containing each HTML head field label and the HTML snippet',
    () => {
      const record = resolveRunSeo({
        runDir: firstRun.runDir,
        repoRoot: REPO_ROOT,
        lang: 'en',
      });
      const text = formatRecord(record, 1, 1, 'en');
      // Field analysis section
      expect(text).toMatch(/<title>/);
      expect(text).toMatch(/<meta description>/);
      expect(text).toMatch(/<meta keywords>/);
      expect(text).toMatch(/resolution-tier/);
      expect(text).toMatch(/html-file/);
      // HTML head snippet section
      expect(text).toMatch(/HTML <head> block/);
      expect(text).toMatch(/<title>.*EU Parliament Monitor<\/title>/);
      expect(text).toMatch(/<meta name="description" content=/);
      expect(text).toMatch(/<meta property="og:title" content=/);
      expect(text).toMatch(/<meta name="twitter:title" content=/);
    },
  );
});

describe('scripts/dump-article-seo.js — buildHtmlHeadSnippet', () => {
  /** Minimal resolved record for HTML snippet tests. */
  function makeRecord({
    title = 'Test Article Title',
    description = 'A short article description for testing.',
    extendedDescription = 'A longer extended description for social cards.',
    keywords = ['keyword one', 'keyword two'],
    source = 'executive-brief',
  } = {}) {
    return {
      runDir: '/tmp/fake-run',
      runDirRel: 'analysis/daily/2026-01-01/breaking',
      date: '2026-01-01',
      articleType: 'breaking',
      slug: '2026-01-01-breaking',
      filename: '2026-01-01-breaking-en.html',
      entry: { title, description, extendedDescription, keywords, source },
    };
  }

  it('contains a <title> tag with site name suffix', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'en');
    expect(snippet).toMatch(/<title>Test Article Title » EU Parliament Monitor<\/title>/);
  });

  it('uses left-pointing separator for RTL languages', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'ar');
    expect(snippet).toMatch(/<title>Test Article Title « مراقب البرلمان الأوروبي<\/title>/);
  });

  it('contains <meta name="description">', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'en');
    expect(snippet).toMatch(/<meta name="description" content="A short article description for testing\.">/);
  });

  it('contains <meta name="keywords"> when keywords are present', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'en');
    expect(snippet).toMatch(/<meta name="keywords" content="keyword one, keyword two">/);
  });

  it('omits <meta name="keywords"> when keywords array is empty', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord({ keywords: [] }), 'en');
    expect(snippet).not.toMatch(/meta name="keywords"/);
  });

  it('contains og:title tag', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'en');
    expect(snippet).toMatch(/<meta property="og:title" content="Test Article Title">/);
  });

  it('uses extendedDescription for og:description when available', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'en');
    expect(snippet).toMatch(/<meta property="og:description" content="A longer extended description for social cards\.">/);
  });

  it('falls back to description for og:description when extendedDescription is empty', () => {
    const snippet = buildHtmlHeadSnippet(
      makeRecord({ extendedDescription: '' }),
      'en',
    );
    expect(snippet).toMatch(/<meta property="og:description" content="A short article description for testing\.">/);
  });

  it('contains twitter:title and twitter:description tags', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'en');
    expect(snippet).toMatch(/<meta name="twitter:title" content="Test Article Title">/);
    expect(snippet).toMatch(/<meta name="twitter:description" content="A longer extended description for social cards\.">/);
  });

  it('HTML-escapes special characters in title and description', () => {
    const record = makeRecord({
      title: 'Title with <angle> & "quotes"',
      description: 'Desc with <b>bold</b> & \'quotes\'',
    });
    const snippet = buildHtmlHeadSnippet(record, 'en');
    expect(snippet).not.toMatch(/<title>.*<angle>/);
    expect(snippet).toMatch(/&lt;angle&gt;/);
    expect(snippet).toMatch(/&amp;/);
  });

  it('is bit-for-bit identical to the <head> emitted by wrapArticleHtml for the same metadata', async () => {
    const { wrapArticleHtml } = await import('../../scripts/aggregator/html/shell.js');
    const record = makeRecord();
    const snippet = buildHtmlHeadSnippet(record, 'en');
    const html = wrapArticleHtml({
      lang: 'en',
      articleSlug: record.slug,
      body: '',
      title: record.entry.title,
      description: record.entry.description,
      extendedDescription: record.entry.extendedDescription,
      keywords: record.entry.keywords,
      date: record.date,
      articleType: record.articleType,
    });
    const headMatch = html.match(/<head>[\s\S]*?<\/head>/);
    expect(headMatch).not.toBeNull();
    expect(snippet).toBe(headMatch[0]);
  });

  it('contains canonical, og:url, og:site_name, og:type, twitter:card, and JSON-LD tags that wrapArticleHtml emits', () => {
    const snippet = buildHtmlHeadSnippet(makeRecord(), 'en');
    expect(snippet).toMatch(/<link rel="canonical"/);
    expect(snippet).toMatch(/<meta property="og:type" content="article">/);
    expect(snippet).toMatch(/<meta property="og:url"/);
    expect(snippet).toMatch(/<meta property="og:site_name"/);
    expect(snippet).toMatch(/<meta name="twitter:card" content="summary_large_image">/);
    expect(snippet).toMatch(/<script type="application\/ld\+json">/);
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
    'writes the text output file containing field analysis and HTML snippet sections',
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
      // Header
      expect(text).toMatch(/Executive Brief SEO Preview/);
      // Field analysis section
      expect(text).toMatch(/<title>/);
      // HTML snippet section
      expect(text).toMatch(/HTML <head> block/);
      expect(text).toMatch(/<title>.*EU Parliament Monitor<\/title>/);
      expect(text).toMatch(/<meta name="description" content=/);
    },
  );

  it.skipIf(!firstRun)(
    'writes the JSONL output file with htmlHeadSnippet field when jsonPath is supplied',
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
      // HTML snippet is now included in the JSONL record
      expect(typeof record.htmlHeadSnippet).toBe('string');
      expect(record.htmlHeadSnippet).toMatch(/<title>/);
      expect(record.htmlHeadSnippet).toMatch(/EU Parliament Monitor/);
    },
  );
});
