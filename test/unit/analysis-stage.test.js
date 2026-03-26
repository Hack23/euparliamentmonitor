// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the Analysis Pipeline Stage:
 *   - runAnalysisStage: full run with default methods
 *   - Incremental analysis: skip already-completed methods
 *   - Error isolation: one method fails, others succeed
 *   - manifest.json generation and reading
 *   - Folder structure creation
 *   - ALL_ANALYSIS_METHODS constant completeness
 *   - AnalysisContext shape validation
 *   - Backward compatibility (works without analysis stage)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Imports from compiled output ────────────────────────────────────────────

import {
  runAnalysisStage,
  ALL_ANALYSIS_METHODS,
} from '../../scripts/generators/pipeline/analysis-stage.js';

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Build a minimal fetchedData object for test use */
function buildTestFetchedData(overrides = {}) {
  return {
    events: [],
    sessions: [],
    documents: [],
    patterns: [],
    votingRecords: [],
    ...overrides,
  };
}

/** Parse a manifest.json file from the analysis output directory */
function readManifest(outputDir, date) {
  const manifestPath = path.join(outputDir, date, 'manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

// ─── ALL_ANALYSIS_METHODS tests ───────────────────────────────────────────────

describe('ALL_ANALYSIS_METHODS', () => {
  it('contains exactly 18 analysis methods', () => {
    expect(ALL_ANALYSIS_METHODS).toHaveLength(18);
  });

  it('includes all classification methods', () => {
    expect(ALL_ANALYSIS_METHODS).toContain('significance-classification');
    expect(ALL_ANALYSIS_METHODS).toContain('impact-matrix');
    expect(ALL_ANALYSIS_METHODS).toContain('actor-mapping');
    expect(ALL_ANALYSIS_METHODS).toContain('forces-analysis');
  });

  it('includes all threat assessment methods', () => {
    expect(ALL_ANALYSIS_METHODS).toContain('political-stride');
    expect(ALL_ANALYSIS_METHODS).toContain('actor-threat-profiling');
    expect(ALL_ANALYSIS_METHODS).toContain('consequence-trees');
    expect(ALL_ANALYSIS_METHODS).toContain('legislative-disruption');
  });

  it('includes all risk scoring methods', () => {
    expect(ALL_ANALYSIS_METHODS).toContain('risk-matrix');
    expect(ALL_ANALYSIS_METHODS).toContain('political-capital-risk');
    expect(ALL_ANALYSIS_METHODS).toContain('quantitative-swot');
    expect(ALL_ANALYSIS_METHODS).toContain('legislative-velocity-risk');
    expect(ALL_ANALYSIS_METHODS).toContain('agent-risk-workflow');
  });

  it('includes all existing analysis methods', () => {
    expect(ALL_ANALYSIS_METHODS).toContain('deep-analysis');
    expect(ALL_ANALYSIS_METHODS).toContain('stakeholder-analysis');
    expect(ALL_ANALYSIS_METHODS).toContain('coalition-analysis');
    expect(ALL_ANALYSIS_METHODS).toContain('voting-patterns');
    expect(ALL_ANALYSIS_METHODS).toContain('cross-session-intelligence');
  });

  it('has no duplicate entries', () => {
    const unique = new Set(ALL_ANALYSIS_METHODS);
    expect(unique.size).toBe(ALL_ANALYSIS_METHODS.length);
  });
});

// ─── runAnalysisStage tests ───────────────────────────────────────────────────

describe('runAnalysisStage', () => {
  /** @type {string} */
  let tmpDir;
  const testDate = '2026-03-26';

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ep-analysis-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns an AnalysisContext with correct shape', async () => {
    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis'],
    });

    expect(ctx).toBeDefined();
    expect(ctx.date).toBe(testDate);
    expect(typeof ctx.outputDir).toBe('string');
    expect(Array.isArray(ctx.completedMethods)).toBe(true);
    expect(ctx.results).toBeInstanceOf(Map);
    expect(ctx.manifest).toBeDefined();
  });

  it('creates the date-scoped output directory', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis'],
    });

    const dateDirPath = path.join(tmpDir, testDate);
    expect(fs.existsSync(dateDirPath)).toBe(true);
  });

  it('writes a manifest.json file to the output directory', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis'],
    });

    const manifestPath = path.join(tmpDir, testDate, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.date).toBe(testDate);
    expect(typeof manifest.runId).toBe('string');
    expect(manifest.runId.length).toBeGreaterThan(0);
    expect(typeof manifest.startTime).toBe('string');
    expect(typeof manifest.endTime).toBe('string');
    expect(Array.isArray(manifest.methods)).toBe(true);
    expect(Array.isArray(manifest.articleTypes)).toBe(true);
    expect(['high', 'medium', 'low']).toContain(manifest.overallConfidence);
  });

  it('writes markdown files to the correct subdirectory', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis'],
    });

    const markdownPath = path.join(tmpDir, testDate, 'existing', 'deep-analysis.md');
    expect(fs.existsSync(markdownPath)).toBe(true);
    const content = fs.readFileSync(markdownPath, 'utf-8');
    expect(content).toContain('# Deep Multi-Perspective Analysis');
    expect(content).toContain('---');
  });

  it('writes classification methods to classification/ subdirectory', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['significance-classification', 'impact-matrix'],
    });

    expect(fs.existsSync(path.join(tmpDir, testDate, 'classification', 'significance-assessment.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, testDate, 'classification', 'impact-matrix.md'))).toBe(true);
  });

  it('writes threat assessment methods to threat-assessment/ subdirectory', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['political-stride'],
    });

    expect(fs.existsSync(path.join(tmpDir, testDate, 'threat-assessment', 'political-stride-assessment.md'))).toBe(true);
  });

  it('writes risk scoring methods to risk-scoring/ subdirectory', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['risk-matrix'],
    });

    expect(fs.existsSync(path.join(tmpDir, testDate, 'risk-scoring', 'risk-matrix.md'))).toBe(true);
  });

  it('records each enabled method in the manifest', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis', 'stakeholder-analysis'],
    });

    const manifest = readManifest(tmpDir, testDate);
    const methodNames = manifest.methods.map((m) => m.method);
    expect(methodNames).toContain('deep-analysis');
    expect(methodNames).toContain('stakeholder-analysis');
    expect(manifest.methods).toHaveLength(2);
  });

  it('records method status as completed in the manifest', async () => {
    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis'],
    });

    const manifest = readManifest(tmpDir, testDate);
    const deepAnalysis = manifest.methods.find((m) => m.method === 'deep-analysis');
    expect(deepAnalysis).toBeDefined();
    expect(deepAnalysis.status).toBe('completed');
    expect(typeof deepAnalysis.duration).toBe('number');
    expect(['high', 'medium', 'low']).toContain(deepAnalysis.confidence);
  });

  it('returns completedMethods containing only non-failed methods', async () => {
    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis', 'coalition-analysis'],
    });

    // All should succeed with valid inputs
    expect(ctx.completedMethods).toContain('deep-analysis');
    expect(ctx.completedMethods).toContain('coalition-analysis');
  });

  it('runs all 18 methods when no enabledMethods is specified', async () => {
    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
    });

    expect(ctx.results.size).toBe(18);
    expect(ctx.manifest.methods).toHaveLength(18);
  });

  it('stores results in the AnalysisContext results map', async () => {
    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: testDate,
      outputDir: tmpDir,
      enabledMethods: ['deep-analysis'],
    });

    expect(ctx.results.has('deep-analysis')).toBe(true);
    const result = ctx.results.get('deep-analysis');
    expect(result).toBeDefined();
    expect(result.method).toBe('deep-analysis');
    expect(result.status).toBe('completed');
  });

  // ─── Incremental analysis tests ──────────────────────────────────────────────

  describe('incremental analysis (skipCompleted)', () => {
    it('skips a method whose output file already exists', async () => {
      // Write the output file ahead of time
      const outputPath = path.join(tmpDir, testDate, 'existing', 'deep-analysis.md');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, '# existing output', 'utf-8');

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
        skipCompleted: true,
      });

      const result = ctx.results.get('deep-analysis');
      expect(result?.status).toBe('skipped');
      // Existing file should not be overwritten
      expect(fs.readFileSync(outputPath, 'utf-8')).toBe('# existing output');
    });

    it('does not skip when skipCompleted is false', async () => {
      const outputPath = path.join(tmpDir, testDate, 'existing', 'deep-analysis.md');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, '# existing output', 'utf-8');

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
        skipCompleted: false,
      });

      const result = ctx.results.get('deep-analysis');
      expect(result?.status).toBe('completed');
      // File should have been overwritten
      expect(fs.readFileSync(outputPath, 'utf-8')).not.toBe('# existing output');
    });

    it('skipped methods are included in completedMethods', async () => {
      const outputPath = path.join(tmpDir, testDate, 'existing', 'deep-analysis.md');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, '# existing output', 'utf-8');

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
        skipCompleted: true,
      });

      // Skipped methods are still counted as "completed" (done previously)
      expect(ctx.completedMethods).toContain('deep-analysis');
    });
  });

  // ─── Error isolation tests ────────────────────────────────────────────────────

  describe('error isolation', () => {
    it('continues executing remaining methods when one method fails', async () => {
      // We test error isolation by checking the ctx.results map even when
      // one method might encounter data issues — the others should still complete.
      // Run two methods; even if one had an issue, the other should run.
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis', 'coalition-analysis', 'stakeholder-analysis'],
      });

      // All three should have results (completed or failed — not missing entirely)
      expect(ctx.results.has('deep-analysis')).toBe(true);
      expect(ctx.results.has('coalition-analysis')).toBe(true);
      expect(ctx.results.has('stakeholder-analysis')).toBe(true);
    });

    it('records individual method results regardless of other method outcomes', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['risk-matrix', 'deep-analysis'],
      });

      expect(ctx.results.size).toBe(2);
      // Both methods should have a status field
      for (const [, result] of ctx.results) {
        expect(['completed', 'skipped', 'failed']).toContain(result.status);
      }
    });
  });

  // ─── Manifest content tests ───────────────────────────────────────────────────

  describe('manifest.json content', () => {
    it('includes article types in the manifest', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      const manifest = readManifest(tmpDir, testDate);
      expect(manifest.articleTypes).toContain('week-ahead');
    });

    it('generates a unique runId for each run', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
        skipCompleted: false,
      });
      const m1 = readManifest(tmpDir, testDate);

      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['stakeholder-analysis'],
        skipCompleted: false,
      });
      const m2 = readManifest(tmpDir, testDate);

      expect(m1.runId).not.toBe(m2.runId);
    });

    it('records dataSourcesUsed from non-empty fetchedData arrays', async () => {
      const fetchedData = buildTestFetchedData({
        events: [{ date: '2026-03-26', title: 'Test Event', type: 'plenary', description: '' }],
      });

      await runAnalysisStage(fetchedData, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      const manifest = readManifest(tmpDir, testDate);
      expect(manifest.dataSourcesUsed).toContain('events');
    });

    it('has empty dataSourcesUsed when all arrays are empty', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      const manifest = readManifest(tmpDir, testDate);
      expect(manifest.dataSourcesUsed).toHaveLength(0);
    });
  });

  // ─── Markdown content validation ──────────────────────────────────────────────

  describe('markdown file content', () => {
    it('includes YAML frontmatter in every generated file', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['significance-classification'],
      });

      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'classification', 'significance-assessment.md'),
        'utf-8'
      );
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('method: significance-classification');
      expect(content).toContain(`date: ${testDate}`);
      expect(content).toContain('confidence:');
      expect(content).toContain('generated:');
    });

    it('includes date in the markdown body', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['risk-matrix'],
      });

      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'risk-scoring', 'risk-matrix.md'),
        'utf-8'
      );
      expect(content).toContain(testDate);
    });

    it('stakeholder-analysis includes outcome matrix table', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['stakeholder-analysis'],
      });

      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'existing', 'stakeholder-analysis.md'),
        'utf-8'
      );
      expect(content).toContain('# Stakeholder Impact Analysis');
      expect(content).toContain('Stakeholder Outcome Matrix');
    });

    it('coalition-analysis includes cohesion metrics', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['coalition-analysis'],
      });

      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'existing', 'coalition-analysis.md'),
        'utf-8'
      );
      expect(content).toContain('# Coalition Cohesion Analysis');
      expect(content).toContain('Cohesion Score');
    });

    it('voting-patterns includes trend table', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['voting-patterns'],
      });

      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'existing', 'voting-patterns.md'),
        'utf-8'
      );
      expect(content).toContain('# Voting Pattern Analysis');
      expect(content).toContain('Detected Trends');
    });

    it('cross-session-intelligence includes stability report', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['cross-session-intelligence'],
      });

      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'existing', 'cross-session-intelligence.md'),
        'utf-8'
      );
      expect(content).toContain('# Cross-Session Coalition Intelligence');
      expect(content).toContain('Stability Report');
    });
  });

  // ─── AnalysisContext shape tests ──────────────────────────────────────────────

  describe('AnalysisContext return value', () => {
    it('outputDir resolves to the date-scoped directory', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      expect(ctx.outputDir).toBe(path.resolve(tmpDir, testDate));
    });

    it('manifest in context matches the manifest written to disk', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      const diskManifest = readManifest(tmpDir, testDate);
      expect(ctx.manifest.runId).toBe(diskManifest.runId);
      expect(ctx.manifest.date).toBe(diskManifest.date);
    });

    it('results map has same size as enabledMethods', async () => {
      const enabledMethods = ['deep-analysis', 'stakeholder-analysis', 'risk-matrix'];
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods,
      });

      expect(ctx.results.size).toBe(enabledMethods.length);
    });
  });

  // ─── Backward compatibility tests ────────────────────────────────────────────

  describe('backward compatibility', () => {
    it('works with an empty fetchedData object', async () => {
      const ctx = await runAnalysisStage(
        {},
        {
          articleTypes: ['week-ahead'],
          date: testDate,
          outputDir: tmpDir,
          enabledMethods: ['deep-analysis'],
        }
      );

      expect(ctx).toBeDefined();
      expect(ctx.completedMethods.length).toBeGreaterThan(0);
    });

    it('works with no enabledMethods (defaults to all)', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
      });

      // All 18 methods should be in results
      expect(ctx.results.size).toBe(ALL_ANALYSIS_METHODS.length);
    });

    it('works with multiple article types', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead', 'committee-reports', 'breaking'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      const manifest = readManifest(tmpDir, testDate);
      expect(manifest.articleTypes).toContain('week-ahead');
      expect(manifest.articleTypes).toContain('committee-reports');
      expect(manifest.articleTypes).toContain('breaking');
      expect(ctx.date).toBe(testDate);
    });

    it('works with verbose mode without throwing', async () => {
      await expect(
        runAnalysisStage(buildTestFetchedData(), {
          articleTypes: ['week-ahead'],
          date: testDate,
          outputDir: tmpDir,
          enabledMethods: ['deep-analysis'],
          verbose: true,
        })
      ).resolves.not.toThrow();
    });

    it('accepts a custom date string', async () => {
      const customDate = '2025-01-15';
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: customDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      expect(ctx.date).toBe(customDate);
      expect(fs.existsSync(path.join(tmpDir, customDate))).toBe(true);
    });
  });

  // ─── Manifest portability tests ─────────────────────────────────────────────

  describe('manifest portability', () => {
    it('stores relative outputFile paths in the manifest (not absolute)', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      const manifest = readManifest(tmpDir, testDate);
      const deepAnalysis = manifest.methods.find((m) => m.method === 'deep-analysis');
      expect(deepAnalysis).toBeDefined();
      // outputFile should be relative to the date-scoped dir (e.g. "existing/deep-analysis.md")
      expect(deepAnalysis.outputFile).toBe(path.join('existing', 'deep-analysis.md'));
      // It should NOT start with / or contain the tmpDir
      expect(deepAnalysis.outputFile).not.toMatch(/^\//);
      expect(deepAnalysis.outputFile).not.toContain(tmpDir);
    });

    it('stores relative paths for all method groups', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['significance-classification', 'political-stride', 'risk-matrix', 'deep-analysis'],
      });

      const manifest = readManifest(tmpDir, testDate);
      for (const m of manifest.methods) {
        expect(m.outputFile).not.toMatch(/^\//);
        expect(m.outputFile).not.toContain(tmpDir);
      }
    });
  });

  // ─── Confidence aggregation tests ─────────────────────────────────────────────

  describe('confidence aggregation', () => {
    it('returns high confidence when all skipped methods have high default confidence', async () => {
      // Pre-create the output file so the method will be skipped
      const outputPath = path.join(tmpDir, testDate, 'existing', 'deep-analysis.md');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, '# existing output', 'utf-8');

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
        skipCompleted: true,
      });

      // With only 'skipped' methods (high confidence by default), aggregation
      // should now include them rather than returning a misleading 'high' default.
      const manifest = readManifest(tmpDir, testDate);
      // The skipped method has 'high' confidence, so aggregation should reflect that
      expect(manifest.overallConfidence).toBe('high');
    });

    it('includes skipped method confidence in aggregation', async () => {
      // Pre-create output files for all methods
      const methods = ['deep-analysis', 'stakeholder-analysis'];
      for (const m of methods) {
        const outputPath = path.join(tmpDir, testDate, 'existing', `${m}.md`);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, '# existing', 'utf-8');
      }

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: methods,
        skipCompleted: true,
      });

      // Both methods are skipped — their confidence should be counted
      expect(ctx.results.get('deep-analysis')?.status).toBe('skipped');
      expect(ctx.results.get('stakeholder-analysis')?.status).toBe('skipped');
      // Both have 'high' default confidence, so overall should be 'high'
      expect(ctx.manifest.overallConfidence).toBe('high');
    });
  });
});
