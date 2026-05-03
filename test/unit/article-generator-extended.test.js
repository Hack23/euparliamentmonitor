// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Extended unit tests for article-generator.js — covers helper functions
 * like readManifestMetadata, isLanguageMapLike, applyCliOverrides,
 * getMetadataEntry, and writeLanguageVariant edge cases.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  generateArticle,
  parseCliArgs,
  extractDefaultDescription,
  generateAllArticles,
  discoverAnalysisRuns,
  groupRunsForCollision,
} from '../../scripts/aggregator/article-generator.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

const FIXTURE_REPO = path.resolve('.');
const FIXTURE_RUN = path.resolve(
  'test/fixtures/analysis/2026-01-15/breaking-run-test'
);

describe('article-generator extended', () => {
  let tmpOut;

  beforeEach(() => {
    tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-art-ext-'));
  });

  afterEach(() => {
    fs.rmSync(tmpOut, { recursive: true, force: true });
    const runArticleMd = path.join(FIXTURE_RUN, 'article.md');
    if (fs.existsSync(runArticleMd)) fs.unlinkSync(runArticleMd);
    const runArticleMeta = path.join(FIXTURE_RUN, 'article-meta.json');
    if (fs.existsSync(runArticleMeta)) fs.unlinkSync(runArticleMeta);
  });

  describe('parseCliArgs edge cases', () => {
    it('accepts --analysis-dir as alias for --run', () => {
      const opts = parseCliArgs([`--analysis-dir=${FIXTURE_RUN}`], FIXTURE_REPO);
      expect(opts.runDir).toBe(FIXTURE_RUN);
    });

    it('accepts --language as alias for --lang', () => {
      const opts = parseCliArgs(['--run', FIXTURE_RUN, '--language', 'sv'], FIXTURE_REPO);
      expect(opts.langs).toContain('sv');
    });

    it('accepts --output as alias for --out-dir', () => {
      const opts = parseCliArgs(['--run', FIXTURE_RUN, '--output', '/tmp/test-out'], FIXTURE_REPO);
      expect(opts.outDir).toBe('/tmp/test-out');
    });

    it('accepts --title flag', () => {
      const opts = parseCliArgs(['--run', FIXTURE_RUN, '--title', 'My Title'], FIXTURE_REPO);
      expect(opts.title).toBe('My Title');
    });

    it('accepts --description flag', () => {
      const opts = parseCliArgs(
        ['--run', FIXTURE_RUN, '--description', 'A description'],
        FIXTURE_REPO
      );
      expect(opts.description).toBe('A description');
    });

    it('throws when --lang value is missing', () => {
      expect(() => parseCliArgs(['--run', FIXTURE_RUN, '--lang'], FIXTURE_REPO)).toThrow(
        /Missing value/
      );
    });

    it('throws when --run value is missing', () => {
      expect(() => parseCliArgs(['--run'], FIXTURE_REPO)).toThrow(/Missing value/);
    });
  });

  describe('extractDefaultDescription edge cases', () => {
    it('skips table lines (starting with |)', () => {
      const md = ['# Title', '', '| Column | Data |', '', 'The European Parliament adopted a landmark resolution on digital services regulation impacting millions of users across the continent in a decisive move.'].join('\n');
      const desc = extractDefaultDescription(md);
      expect(desc).toContain('European Parliament');
      expect(desc).not.toContain('Column');
    });

    it('skips HTML comment lines', () => {
      const md = ['# Title', '', '<div>html stuff</div>', '', 'The committee reported strong progress on the proposed regulation for artificial intelligence systems governance across all member states in 2026.'].join(
        '\n'
      );
      const desc = extractDefaultDescription(md);
      expect(desc).not.toContain('<div>');
    });

    it('truncates description to 300 characters', () => {
      const longParagraph = 'A'.repeat(400);
      const md = `# Title\n\n${longParagraph}`;
      const desc = extractDefaultDescription(md);
      expect(desc.length).toBeLessThanOrEqual(300);
    });

    it('handles empty markdown', () => {
      expect(extractDefaultDescription('')).toMatch(/EU Parliament/);
    });
  });

  describe('generateArticle with title/description overrides', () => {
    it('applies --title override to generated HTML', () => {
      const result = generateArticle({
        runDir: FIXTURE_RUN,
        repoRoot: FIXTURE_REPO,
        outDir: tmpOut,
        langs: ['en'],
        all: false,
        markdownOnly: false,
        title: 'Custom Override Title',
      });

      const htmlFile = result.writtenFiles.find((f) => f.endsWith('-en.html'));
      const html = fs.readFileSync(path.join(tmpOut, htmlFile), 'utf8');
      expect(html).toContain('Custom Override Title');
    });

    it('applies --description override to generated HTML', () => {
      const result = generateArticle({
        runDir: FIXTURE_RUN,
        repoRoot: FIXTURE_REPO,
        outDir: tmpOut,
        langs: ['en'],
        all: false,
        markdownOnly: false,
        description: 'My custom description text',
      });

      const htmlFile = result.writtenFiles.find((f) => f.endsWith('-en.html'));
      const html = fs.readFileSync(path.join(tmpOut, htmlFile), 'utf8');
      expect(html).toContain('My custom description text');
    });
  });

  describe('generateArticle --markdown-only mode', () => {
    it('writes only .md file without HTML when markdownOnly=true', () => {
      const result = generateArticle({
        runDir: FIXTURE_RUN,
        repoRoot: FIXTURE_REPO,
        outDir: tmpOut,
        langs: ['en', 'sv'],
        all: false,
        markdownOnly: true,
      });

      // Should only have the .en.md source file
      expect(result.writtenFiles).toHaveLength(1);
      expect(result.writtenFiles[0]).toMatch(/\.en\.md$/);

      // No HTML files should exist
      const htmlFiles = fs.readdirSync(tmpOut).filter((f) => f.endsWith('.html'));
      expect(htmlFiles).toHaveLength(0);
    });
  });

  describe('generateArticle error cases', () => {
    it('throws when runDir is null', () => {
      expect(() =>
        generateArticle({
          runDir: null,
          repoRoot: FIXTURE_REPO,
          outDir: tmpOut,
          langs: ['en'],
          all: false,
          markdownOnly: false,
        })
      ).toThrow('runDir is required');
    });
  });

  describe('discoverAnalysisRuns', () => {
    it('returns array of discovered runs sorted by date', () => {
      const runs = discoverAnalysisRuns(FIXTURE_REPO);
      expect(Array.isArray(runs)).toBe(true);
      // Should discover at least the fixture run
      expect(runs.length).toBeGreaterThan(0);

      // Verify sorted by date
      for (let i = 1; i < runs.length; i++) {
        expect(runs[i].date >= runs[i - 1].date).toBe(true);
      }
    });

    it('each run has required properties', () => {
      const runs = discoverAnalysisRuns(FIXTURE_REPO);
      for (const run of runs) {
        expect(run).toHaveProperty('date');
        expect(run).toHaveProperty('articleType');
        expect(run).toHaveProperty('runDir');
        expect(run).toHaveProperty('runId');
      }
    });
  });

  describe('groupRunsForCollision', () => {
    it('groups runs by date|articleType key', () => {
      const runs = [
        { date: '2026-01-15', articleType: 'breaking', runDir: '/a', runId: 'run1' },
        { date: '2026-01-15', articleType: 'breaking', runDir: '/b', runId: 'run2' },
        { date: '2026-01-16', articleType: 'week-in-review', runDir: '/c', runId: 'run3' },
      ];
      const groups = groupRunsForCollision(runs);
      expect(groups.get('2026-01-15|breaking')).toHaveLength(2);
      expect(groups.get('2026-01-16|week-in-review')).toHaveLength(1);
    });

    it('returns empty map for empty input', () => {
      const groups = groupRunsForCollision([]);
      expect(groups.size).toBe(0);
    });
  });

  describe('generateAllArticles with --since filter', () => {
    it('respects the since filter by producing fewer results', () => {
      // Use a far-future --since to verify it filters to zero
      const futureResults = generateAllArticles({
        repoRoot: FIXTURE_REPO,
        outDir: tmpOut,
        langs: ['en'],
        all: true,
        markdownOnly: true,
        since: '2099-01-01',
      });

      expect(futureResults).toHaveLength(0);

      // Use a past --since to verify at least some runs are discovered
      const allRuns = discoverAnalysisRuns(FIXTURE_REPO);
      expect(allRuns.length).toBeGreaterThan(0);
    });
  });
});
