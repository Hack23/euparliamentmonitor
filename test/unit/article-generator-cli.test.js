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
} from '../../scripts/aggregator/article-generator.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

const FIXTURE_REPO = path.resolve('.');
const FIXTURE_RUN = path.resolve(
  'test/fixtures/analysis/2026-01-15/breaking-run-test'
);

describe('parseCliArgs', () => {
  it('requires --run', () => {
    expect(() => parseCliArgs([], FIXTURE_REPO)).toThrow(/--run/);
  });

  it('accepts --run=PATH inline-style', () => {
    const opts = parseCliArgs([`--run=${FIXTURE_RUN}`], FIXTURE_REPO);
    expect(opts.runDir).toBe(FIXTURE_RUN);
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
});

describe('buildArticleSlug', () => {
  it('joins date and article type with a dash', () => {
    expect(buildArticleSlug('2026-01-15', 'breaking')).toBe('2026-01-15-breaking');
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

  beforeEach(() => {
    tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-art-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpOut, { recursive: true, force: true });
  });

  it('writes source .md plus 14 HTML files and reports determinism', () => {
    const result = generateArticle({
      runDir: FIXTURE_RUN,
      repoRoot: FIXTURE_REPO,
      outDir: tmpOut,
      langs: [...ALL_LANGUAGES],
      markdownOnly: false,
    });

    // Source markdown written
    const mdPath = path.join(tmpOut, '2026-01-15-breaking.en.md');
    expect(fs.existsSync(mdPath)).toBe(true);
    const md = fs.readFileSync(mdPath, 'utf8');
    expect(md).toContain('**Provenance**');
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
      runDir: FIXTURE_RUN,
      repoRoot: FIXTURE_REPO,
      outDir: tmpOut,
      langs: [...ALL_LANGUAGES],
      markdownOnly: true,
    });
    expect(result.writtenFiles).toEqual(['2026-01-15-breaking.en.md']);
    const htmls = fs.readdirSync(tmpOut).filter((f) => f.endsWith('.html'));
    expect(htmls).toEqual([]);
  });

  it('is deterministic across runs (byte-identical output)', () => {
    const first = generateArticle({
      runDir: FIXTURE_RUN,
      repoRoot: FIXTURE_REPO,
      outDir: tmpOut,
      langs: ['en', 'sv'],
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
      runDir: FIXTURE_RUN,
      repoRoot: FIXTURE_REPO,
      outDir: tmpOut,
      langs: ['en', 'sv'],
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
});
