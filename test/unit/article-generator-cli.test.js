// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test for src/aggregator/article-generator CLI — parses
 * arguments, runs the full pipeline on the committed fixture, and
 * verifies HTML + source Markdown outputs.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildArticleSlug,
  extractDefaultDescription,
  generateArticle,
  parseCliArgs,
  sanitizeRunSuffix,
  discoverAnalysisRuns,
  groupRunsForCollision,
  generateAllArticles,
} from '../../scripts/aggregator/article-generator.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

const FIXTURE_REPO = path.resolve('.');
const FIXTURE_RUN = path.resolve(
  'test/fixtures/analysis/2026-01-15/breaking-run-test'
);

describe('parseCliArgs', () => {
  it('requires --run or --all', () => {
    expect(() => parseCliArgs([], FIXTURE_REPO)).toThrow(/--run .* or --all/);
  });

  it('accepts --run=PATH inline-style', () => {
    const opts = parseCliArgs([`--run=${FIXTURE_RUN}`], FIXTURE_REPO);
    expect(opts.runDir).toBe(FIXTURE_RUN);
    expect(opts.all).toBe(false);
    expect(opts.langs.length).toBe(ALL_LANGUAGES.length);
    expect(opts.markdownOnly).toBe(false);
  });

  it('collects repeated --lang flags', () => {
    const opts = parseCliArgs(
      ['--run', FIXTURE_RUN, '--lang', 'en', '--lang', 'sv'],
      FIXTURE_REPO
    );
    expect([...opts.langs]).toEqual(['en', 'sv']);
  });

  it('rejects unknown languages', () => {
    expect(() =>
      parseCliArgs(['--run', FIXTURE_RUN, '--lang', 'xx'], FIXTURE_REPO)
    ).toThrow(/Unsupported language/);
  });

  it('rejects unknown flags', () => {
    expect(() =>
      parseCliArgs(['--run', FIXTURE_RUN, '--wat'], FIXTURE_REPO)
    ).toThrow(/Unknown argument/);
  });

  it('rejects a non-existent run directory', () => {
    expect(() =>
      parseCliArgs(['--run', '/does/not/exist/123'], FIXTURE_REPO)
    ).toThrow(/does not exist/);
  });

  it('honours --markdown-only', () => {
    const opts = parseCliArgs(
      ['--run', FIXTURE_RUN, '--markdown-only'],
      FIXTURE_REPO
    );
    expect(opts.markdownOnly).toBe(true);
  });

  it('accepts --all with no --run', () => {
    const opts = parseCliArgs(['--all'], FIXTURE_REPO);
    expect(opts.all).toBe(true);
    expect(opts.runDir).toBeNull();
  });

  it('accepts --since YYYY-MM-DD paired with --all', () => {
    const opts = parseCliArgs(['--all', '--since', '2026-04-20'], FIXTURE_REPO);
    expect(opts.since).toBe('2026-04-20');
  });

  it('rejects an ill-formed --since value', () => {
    expect(() =>
      parseCliArgs(['--all', '--since', 'yesterday'], FIXTURE_REPO)
    ).toThrow(/YYYY-MM-DD/);
  });
});

describe('buildArticleSlug', () => {
  it('joins date and article type with a dash', () => {
    expect(buildArticleSlug('2026-01-15', 'breaking')).toBe('2026-01-15-breaking');
  });

  it('appends a collision suffix when provided', () => {
    expect(buildArticleSlug('2026-01-15', 'breaking', 'run191')).toBe(
      '2026-01-15-breaking-run191'
    );
  });
});

describe('sanitizeRunSuffix', () => {
  it('keeps word characters, dashes, and dots', () => {
    expect(sanitizeRunSuffix('run191')).toBe('run191');
    expect(sanitizeRunSuffix('run-191.alpha')).toBe('run-191.alpha');
  });

  it('replaces unsafe characters with a single dash', () => {
    expect(sanitizeRunSuffix('run 191/alpha')).toBe('run-191-alpha');
  });

  it('trims leading and trailing dashes', () => {
    expect(sanitizeRunSuffix('///run///')).toBe('run');
  });

  it('caps output length at 32 characters', () => {
    expect(sanitizeRunSuffix('a'.repeat(64)).length).toBe(32);
  });

  it('falls back to `run` for empty input', () => {
    expect(sanitizeRunSuffix('')).toBe('run');
    expect(sanitizeRunSuffix('////')).toBe('run');
  });
});

describe('extractDefaultDescription', () => {
  it('returns the first prose paragraph, truncated to 300 chars', () => {
    const md = [
      '# Title',
      '',
      '> blockquote provenance',
      '',
      '<!-- comment -->',
      '',
      'This is the actual description that should surface as the default meta description.',
    ].join('\n');
    expect(extractDefaultDescription(md)).toContain('actual description');
  });

  it('falls back when nothing qualifies', () => {
    expect(extractDefaultDescription('# x')).toMatch(/EU Parliament/);
  });
});

describe('generateArticle (end-to-end fixture)', () => {
  let tmpOut;
  let tmpRepo;
  let fixtureRun;

  beforeEach(() => {
    tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-art-test-'));
    tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-art-repo-'));
    fixtureRun = path.join(tmpRepo, 'analysis', '2026-01-15', 'breaking-run-test');
    fs.mkdirSync(path.dirname(fixtureRun), { recursive: true });
    fs.cpSync(FIXTURE_RUN, fixtureRun, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpOut, { recursive: true, force: true });
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  });

  it('writes article.md to the run directory (riksdagsmonitor pattern)', () => {
    const result = generateArticle({
      runDir: fixtureRun,
      repoRoot: tmpRepo,
      outDir: tmpOut,
      langs: ['en'],
      all: false,
      markdownOnly: false,
    });

    // article.md must be written directly into the analysis run directory
    const runArticleMd = path.join(fixtureRun, 'article.md');
    expect(fs.existsSync(runArticleMd)).toBe(true);
    const md = fs.readFileSync(runArticleMd, 'utf8');
    expect(md.startsWith('---\n')).toBe(true);
    expect(md).toContain('layout: article');
    expect(md).toContain('**Provenance & Audit**');
    expect(md).toContain('Reader Intelligence Guide');
    expect(md).toContain('Executive Brief');

    // sourceMarkdownRelPath should point to the run-dir article.md
    expect(result.sourceMarkdownRelPath).toMatch(/analysis.*article\.md$/);
    expect(result.runArticleMdRelPath).toMatch(/analysis.*article\.md$/);
    expect(result.runArticleMdRelPath).toBe(result.sourceMarkdownRelPath);
  });

  it('writes source .md plus 14 HTML files and reports determinism', () => {
    const result = generateArticle({
      runDir: fixtureRun,
      repoRoot: tmpRepo,
      outDir: tmpOut,
      langs: [...ALL_LANGUAGES],
      all: false,
      markdownOnly: false,
    });

    // Source markdown written in news/ for backwards compatibility
    const mdPath = path.join(tmpOut, '2026-01-15-breaking.en.md');
    expect(fs.existsSync(mdPath)).toBe(true);
    const md = fs.readFileSync(mdPath, 'utf8');
    const fixtureRunRelPath = path.relative(tmpRepo, fixtureRun).split(path.sep).join('/');
    expect(md.startsWith('---\n')).toBe(true);
    expect(md).toContain(`source_folder: ${fixtureRunRelPath}`);
    expect(md).toContain('**Provenance & Audit**');
    expect(md).toContain('Executive Brief');

    // One HTML per language
    for (const lang of ALL_LANGUAGES) {
      const htmlPath = path.join(tmpOut, `2026-01-15-breaking-${lang}.html`);
      expect(fs.existsSync(htmlPath)).toBe(true);
      const html = fs.readFileSync(htmlPath, 'utf8');
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
      expect(html).toContain(`<html lang="${lang}"`);
    }

    // Result summary is accurate
    expect(result.writtenFiles.length).toBe(ALL_LANGUAGES.length + 1);
    expect(result.aggregated.articleType).toBe('breaking');
    expect(result.aggregated.gateResult).toBe('GREEN');
  });

  it('supports --markdown-only (no HTML written)', () => {
    const result = generateArticle({
      runDir: fixtureRun,
      repoRoot: tmpRepo,
      outDir: tmpOut,
      langs: [...ALL_LANGUAGES],
      all: false,
      markdownOnly: true,
    });
    expect(result.writtenFiles).toEqual(['2026-01-15-breaking.en.md']);
    const htmls = fs.readdirSync(tmpOut).filter((f) => f.endsWith('.html'));
    expect(htmls).toEqual([]);
  });

  it('is deterministic across runs (byte-identical output)', () => {
    const first = generateArticle({
      runDir: fixtureRun,
      repoRoot: tmpRepo,
      outDir: tmpOut,
      langs: ['en', 'sv'],
      all: false,
      markdownOnly: false,
    });
    const firstMd = fs.readFileSync(
      path.join(tmpOut, first.writtenFiles[0]),
      'utf8'
    );
    const firstHtml = fs.readFileSync(
      path.join(tmpOut, '2026-01-15-breaking-en.html'),
      'utf8'
    );

    // Rerun
    generateArticle({
      runDir: fixtureRun,
      repoRoot: tmpRepo,
      outDir: tmpOut,
      langs: ['en', 'sv'],
      all: false,
      markdownOnly: false,
    });
    const secondMd = fs.readFileSync(
      path.join(tmpOut, '2026-01-15-breaking.en.md'),
      'utf8'
    );
    const secondHtml = fs.readFileSync(
      path.join(tmpOut, '2026-01-15-breaking-en.html'),
      'utf8'
    );

    expect(secondMd).toBe(firstMd);
    expect(secondHtml).toBe(firstHtml);
  });

  it('suppresses the redundant ### heading when a single-artifact section title matches', () => {
    generateArticle({
      runDir: fixtureRun,
      repoRoot: tmpRepo,
      outDir: tmpOut,
      langs: ['en'],
      all: false,
      markdownOnly: false,
    });
    const html = fs.readFileSync(path.join(tmpOut, '2026-01-15-breaking-en.html'), 'utf8');
    // The aggregator emits <h2 id="section-synthesis">Synthesis Summary</h2> — the
    // artifact's own "### Synthesis Summary" H3 must be suppressed so we do
    // not render two identically-titled headings in a row.
    const synthH2Count = (html.match(/<h2 id="section-synthesis">Synthesis Summary<\/h2>/g) ?? []).length;
    expect(synthH2Count).toBe(1);
    const duplicatePattern = /<h2 id="section-synthesis">Synthesis Summary<\/h2>\s*<h3[^>]*>[^<]*<a[^>]*><span>Synthesis Summary<\/span>/;
    expect(duplicatePattern.test(html)).toBe(false);
  });
});

describe('discoverAnalysisRuns', () => {
  let tmpRepo;

  beforeEach(() => {
    tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-discover-'));
    fs.mkdirSync(path.join(tmpRepo, 'analysis', 'daily'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  });

  const writeManifest = (relPath, manifest) => {
    const abs = path.join(tmpRepo, 'analysis', 'daily', relPath);
    fs.mkdirSync(abs, { recursive: true });
    fs.writeFileSync(path.join(abs, 'manifest.json'), JSON.stringify(manifest), 'utf8');
  };

  it('returns nothing when analysis/daily is missing', () => {
    const freshRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-empty-'));
    try {
      expect(discoverAnalysisRuns(freshRepo)).toEqual([]);
    } finally {
      fs.rmSync(freshRepo, { recursive: true, force: true });
    }
  });

  it('finds runs at any nesting depth and sorts by date then path', () => {
    writeManifest('2026-03-15', {
      articleType: 'breaking',
      date: '2026-03-15',
      runId: 'breaking-run1',
    });
    writeManifest('2026-04-01/breaking-run2', {
      articleType: 'breaking',
      date: '2026-04-01',
      runId: 'breaking-run2',
    });
    writeManifest('2026-04-01/motions-run3', {
      articleType: 'motions',
      date: '2026-04-01',
      runId: 'motions-run3',
    });
    const runs = discoverAnalysisRuns(tmpRepo);
    expect(runs.map((r) => `${r.date}/${r.articleType}`)).toEqual([
      '2026-03-15/breaking',
      '2026-04-01/breaking',
      '2026-04-01/motions',
    ]);
  });

  it('skips runs with missing or "unknown" articleType', () => {
    writeManifest('2026-04-10/good', {
      articleType: 'breaking',
      date: '2026-04-10',
      runId: 'good',
    });
    writeManifest('2026-04-10/bad', {
      articleType: 'unknown',
      date: '2026-04-10',
    });
    writeManifest('2026-04-10/empty', { date: '2026-04-10' });
    const runs = discoverAnalysisRuns(tmpRepo);
    expect(runs.map((r) => r.runId)).toEqual(['good']);
  });

  it('recovers the date from the directory name when the manifest lacks it', () => {
    writeManifest('2026-05-20/breaking-run7', {
      articleType: 'breaking',
      runId: 'breaking-run7',
    });
    const runs = discoverAnalysisRuns(tmpRepo);
    expect(runs).toHaveLength(1);
    expect(runs[0].date).toBe('2026-05-20');
  });
});

describe('groupRunsForCollision', () => {
  it('buckets runs by (date, articleType) pair', () => {
    const runs = [
      { runDir: '/a', articleType: 'breaking', date: '2026-04-01', runId: 'r1' },
      { runDir: '/b', articleType: 'breaking', date: '2026-04-01', runId: 'r2' },
      { runDir: '/c', articleType: 'motions', date: '2026-04-01', runId: 'r3' },
    ];
    const groups = groupRunsForCollision(runs);
    expect(groups.get('2026-04-01|breaking')).toHaveLength(2);
    expect(groups.get('2026-04-01|motions')).toHaveLength(1);
  });
});

describe('generateAllArticles (batch mode)', () => {
  let tmpRepo;
  let tmpOut;

  beforeEach(() => {
    tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-batch-'));
    tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-batch-out-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
    fs.rmSync(tmpOut, { recursive: true, force: true });
  });

  /** Write a minimal analysis run with a single intelligence artifact. */
  const writeRun = (relPath, manifest, artifactBody = '# Intel\n\nBody text.') => {
    const abs = path.join(tmpRepo, 'analysis', 'daily', relPath);
    fs.mkdirSync(path.join(abs, 'intelligence'), { recursive: true });
    fs.writeFileSync(
      path.join(abs, 'intelligence', 'synthesis-summary.md'),
      artifactBody,
      'utf8'
    );
    fs.writeFileSync(path.join(abs, 'manifest.json'), JSON.stringify(manifest), 'utf8');
  };

  it('applies a collision suffix when two runs share (date, articleType)', () => {
    writeRun('2026-04-20/breaking-run190', {
      articleType: 'breaking',
      date: '2026-04-20',
      runId: 'breaking-run190',
    });
    writeRun('2026-04-20/breaking-run191', {
      articleType: 'breaking',
      date: '2026-04-20',
      runId: 'breaking-run191',
    });
    const results = generateAllArticles({
      repoRoot: tmpRepo,
      outDir: tmpOut,
      runDir: null,
      all: true,
      langs: ['en'],
      markdownOnly: true,
    });
    expect(results).toHaveLength(2);
    const filenames = fs.readdirSync(tmpOut).sort();
    expect(filenames).toEqual([
      '2026-04-20-breaking-breaking-run190.en.md',
      '2026-04-20-breaking-breaking-run191.en.md',
    ]);
  });

  it('uses the bare slug when a (date, articleType) pair is unique', () => {
    writeRun('2026-04-21/breaking-run192', {
      articleType: 'breaking',
      date: '2026-04-21',
      runId: 'breaking-run192',
    });
    generateAllArticles({
      repoRoot: tmpRepo,
      outDir: tmpOut,
      runDir: null,
      all: true,
      langs: ['en'],
      markdownOnly: true,
    });
    expect(fs.existsSync(path.join(tmpOut, '2026-04-21-breaking.en.md'))).toBe(true);
  });

  it('honours --since to skip earlier runs', () => {
    writeRun('2026-03-01/breaking-old', {
      articleType: 'breaking',
      date: '2026-03-01',
      runId: 'old',
    });
    writeRun('2026-04-20/breaking-new', {
      articleType: 'breaking',
      date: '2026-04-20',
      runId: 'new',
    });
    const results = generateAllArticles({
      repoRoot: tmpRepo,
      outDir: tmpOut,
      runDir: null,
      all: true,
      since: '2026-04-01',
      langs: ['en'],
      markdownOnly: true,
    });
    expect(results).toHaveLength(1);
    expect(results[0].aggregated.date).toBe('2026-04-20');
  });
});
