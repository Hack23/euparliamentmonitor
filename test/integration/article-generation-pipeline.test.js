// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Integration test for the article.md generation pipeline end-to-end.
 * Validates the full flow from manifest reading through artifact aggregation
 * to final Markdown output, exercising all bounded contexts.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { generateArticle } from '../../scripts/aggregator/article-generator.js';
import { aggregateAnalysisRun } from '../../scripts/aggregator/analysis-aggregator.js';
import { ARTIFACT_SECTIONS } from '../../scripts/aggregator/artifact-order.js';

const REPO_ROOT = path.resolve('.');
const FIXTURE_RUN_SOURCE = path.resolve(
  'test/fixtures/analysis/2026-01-15/breaking-run-test'
);

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

describe('article.md generation pipeline — integration', () => {
  let tmpDir;
  let isolatedRun;
  let isolatedRepo;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-integration-'));
    isolatedRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-integration-repo-'));
    const fixtureRelPath = path.relative(REPO_ROOT, FIXTURE_RUN_SOURCE);
    isolatedRun = path.join(isolatedRepo, fixtureRelPath);
    copyDir(FIXTURE_RUN_SOURCE, isolatedRun);
    // Copy required repo-level assets
    const methodDir = path.join(isolatedRepo, 'analysis/methodologies');
    fs.mkdirSync(methodDir, { recursive: true });
    fs.writeFileSync(path.join(methodDir, 'ai-driven-analysis-guide.md'), '# Guide\n');
    const templateDir = path.join(isolatedRepo, 'analysis/templates');
    fs.mkdirSync(templateDir, { recursive: true });
    fs.writeFileSync(path.join(templateDir, 'executive-brief.md'), '# Template\n');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.rmSync(isolatedRepo, { recursive: true, force: true });
  });

  describe('aggregateAnalysisRun', () => {
    it('produces a valid AggregatedRun from fixture data', () => {
      const result = aggregateAnalysisRun({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
      });

      expect(result).toBeDefined();
      expect(result.markdown).toContain('#');
      expect(result.articleType).toBe('breaking');
      expect(result.date).toBe('2026-01-15');
      expect(result.gateResult).toBe('GREEN');
      expect(result.includedArtifacts.length).toBeGreaterThan(0);
      expect(result.sectionToc.length).toBeGreaterThan(0);
    });

    it('includes the run-dir relative path', () => {
      const result = aggregateAnalysisRun({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
      });

      expect(result.runDirRelPath).toContain('test/fixtures/analysis/2026-01-15/breaking-run-test');
    });

    it('includes a provenance block in the generated markdown', () => {
      const result = aggregateAnalysisRun({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
      });

      expect(result.markdown).toContain('breaking');
      expect(result.markdown).toContain('2026-01-15');
    });

    it('produces sectionToc entries with id and title', () => {
      const result = aggregateAnalysisRun({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
      });

      for (const section of result.sectionToc) {
        expect(section.id).toBeTruthy();
        expect(section.title).toBeTruthy();
      }
    });

    it('includedArtifacts list has runRelPath and sectionId for each entry', () => {
      const result = aggregateAnalysisRun({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
      });

      for (const artifact of result.includedArtifacts) {
        expect(artifact.runRelPath).toBeTruthy();
        expect(artifact.sectionId).toBeTruthy();
      }
    });
  });

  describe('generateArticle', () => {
    it('writes article.md into the run directory', () => {
      const result = generateArticle(
        {
          runDir: isolatedRun,
          repoRoot: isolatedRepo,
          outDir: tmpDir,
          markdownOnly: true,
        }
      );

      expect(result.runArticleMdRelPath).toContain('article.md');
      const articleMd = path.join(isolatedRun, 'article.md');
      expect(fs.existsSync(articleMd)).toBe(true);
      const content = fs.readFileSync(articleMd, 'utf-8');
      expect(content.length).toBeGreaterThan(100);
    });

    it('writes article-meta.json sidecar', () => {
      const result = generateArticle(
        {
          runDir: isolatedRun,
          repoRoot: isolatedRepo,
          outDir: tmpDir,
          markdownOnly: true,
        }
      );

      expect(result.runArticleMetaRelPath).toContain('article-meta.json');
      const metaPath = path.join(isolatedRun, 'article-meta.json');
      expect(fs.existsSync(metaPath)).toBe(true);
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      expect(meta.date).toBe('2026-01-15');
      expect(meta.articleType).toBe('breaking');
      expect(meta.runId).toBe('breaking-run-test');
      expect(meta.gateResult).toBe('GREEN');
      expect(meta.slug).toContain('2026-01-15');
      expect(meta.articlePath).toContain('article.md');
    });

    it('article-meta.json has non-empty topFinding', () => {
      generateArticle({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
        outDir: tmpDir,
        markdownOnly: true,
      });

      const metaPath = path.join(isolatedRun, 'article-meta.json');
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      expect(meta.topFinding).toBeTruthy();
      expect(meta.topFinding.length).toBeGreaterThan(0);
    });

    it('article-meta.json sources array lists contributing artifacts', () => {
      generateArticle({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
        outDir: tmpDir,
        markdownOnly: true,
      });

      const metaPath = path.join(isolatedRun, 'article-meta.json');
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      expect(Array.isArray(meta.sources)).toBe(true);
      expect(meta.sources.length).toBeGreaterThan(0);
    });

    it('returns aggregated data in the result', () => {
      const result = generateArticle({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
        outDir: tmpDir,
        markdownOnly: true,
      });

      expect(result.aggregated).toBeDefined();
      expect(result.aggregated.articleType).toBe('breaking');
      expect(result.aggregated.date).toBe('2026-01-15');
      expect(result.aggregated.markdown.length).toBeGreaterThan(0);
    });

    it('generateArticle produces news markdown in outDir', () => {
      const result = generateArticle({
        runDir: isolatedRun,
        repoRoot: isolatedRepo,
        outDir: tmpDir,
        markdownOnly: true,
      });

      expect(result.sourceMarkdownRelPath).toContain('article.md');
      expect(result.writtenFiles.length).toBeGreaterThan(0);
      expect(result.writtenFiles[0]).toContain('.en.md');
    });
  });

  describe('ARTIFACT_SECTIONS ordering', () => {
    it('has unique section ids', () => {
      const ids = ARTIFACT_SECTIONS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every section has at least one artifact entry', () => {
      for (const section of ARTIFACT_SECTIONS) {
        expect(section.artifacts.length).toBeGreaterThan(0);
      }
    });

    it('executive-brief is the first section', () => {
      expect(ARTIFACT_SECTIONS[0].id).toBe('executive-brief');
    });
  });
});
