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

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Imports from compiled output ────────────────────────────────────────────

import {
  runAnalysisStage,
  ALL_ANALYSIS_METHODS,
  VALID_ANALYSIS_METHODS,
  hasSubstantiveData,
  deriveArticleTypeSlug,
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

/** Parse a manifest.json file from an article-type-scoped output directory */
function readScopedManifest(outputDir, date, slug) {
  const manifestPath = path.join(outputDir, date, slug, 'manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

// ─── ALL_ANALYSIS_METHODS tests ───────────────────────────────────────────────

describe('ALL_ANALYSIS_METHODS', () => {
  it('contains exactly 18 default analysis methods', () => {
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

  it('excludes document-analysis from defaults (opt-in only)', () => {
    expect(ALL_ANALYSIS_METHODS).not.toContain('document-analysis');
  });

  it('has no duplicate entries', () => {
    const unique = new Set(ALL_ANALYSIS_METHODS);
    expect(unique.size).toBe(ALL_ANALYSIS_METHODS.length);
  });
});

// ─── VALID_ANALYSIS_METHODS tests ─────────────────────────────────────────────

describe('VALID_ANALYSIS_METHODS', () => {
  it('contains all default methods plus document-analysis as a valid method', () => {
    expect(VALID_ANALYSIS_METHODS).toHaveLength(ALL_ANALYSIS_METHODS.length + 1);
  });

  it('includes all default analysis methods', () => {
    for (const method of ALL_ANALYSIS_METHODS) {
      expect(VALID_ANALYSIS_METHODS).toContain(method);
    }
  });

  it('includes document-analysis as a valid opt-in method', () => {
    expect(VALID_ANALYSIS_METHODS).toContain('document-analysis');
  });

  it('has no duplicate entries', () => {
    const unique = new Set(VALID_ANALYSIS_METHODS);
    expect(unique.size).toBe(VALID_ANALYSIS_METHODS.length);
  });
});

// ─── deriveArticleTypeSlug tests ──────────────────────────────────────────────

describe('deriveArticleTypeSlug', () => {
  it('returns a slug for a single article type', () => {
    expect(deriveArticleTypeSlug(['week-ahead'])).toBe('week-ahead');
  });

  it('returns sorted, hyphen-joined slug for multiple types', () => {
    expect(deriveArticleTypeSlug(['motions', 'month-ahead'])).toBe('month-ahead-motions');
  });

  it('returns "default" for empty array', () => {
    expect(deriveArticleTypeSlug([])).toBe('default');
  });

  it('lowercases the slug', () => {
    expect(deriveArticleTypeSlug(['Week-Ahead'])).toBe('week-ahead');
  });

  it('trims whitespace', () => {
    expect(deriveArticleTypeSlug([' breaking '])).toBe('breaking');
  });

  it('handles all known article types without error', () => {
    const types = [
      'week-ahead', 'month-ahead', 'breaking', 'committee-reports',
      'propositions', 'motions', 'week-in-review', 'month-in-review',
    ];
    for (const t of types) {
      expect(deriveArticleTypeSlug([t])).toBe(t);
    }
  });

  it('sanitises special characters from slug', () => {
    expect(deriveArticleTypeSlug(['week..ahead'])).toBe('week-ahead');
    expect(deriveArticleTypeSlug(['../../../etc'])).toBe('etc');
  });

  it('collapses multiple hyphens into one', () => {
    expect(deriveArticleTypeSlug(['week---ahead'])).toBe('week-ahead');
  });

  it('returns "default" when all input chars are stripped', () => {
    expect(deriveArticleTypeSlug(['...'])).toBe('default');
    expect(deriveArticleTypeSlug(['///'])).toBe('default');
  });

  it('strips leading and trailing hyphens after sanitisation', () => {
    expect(deriveArticleTypeSlug(['-breaking-'])).toBe('breaking');
  });
});

// ─── hasSubstantiveData tests ─────────────────────────────────────────────────

describe('hasSubstantiveData', () => {
  it('returns false for completely empty data', () => {
    expect(hasSubstantiveData({})).toBe(false);
  });

  it('returns false for data with only empty arrays', () => {
    expect(hasSubstantiveData({ events: [], procedures: [], documents: [] })).toBe(false);
  });

  it('returns true when events has data', () => {
    expect(hasSubstantiveData({ events: [{ id: '1' }] })).toBe(true);
  });

  it('returns true when procedures has data', () => {
    expect(hasSubstantiveData({ procedures: [{ id: '1' }] })).toBe(true);
  });

  it('returns true when documents has data', () => {
    expect(hasSubstantiveData({ documents: [{ id: '1' }] })).toBe(true);
  });

  it('returns false for non-array values', () => {
    expect(hasSubstantiveData({ events: 'string', procedures: 42 })).toBe(false);
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

  it('runs all 18 default methods when no enabledMethods is specified', async () => {
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

    it('stakeholder-analysis includes data inventory table', async () => {
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
      expect(content).toContain('Data Available for Stakeholder Assessment');
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
      expect(content).toContain('Overall Stability');
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

  // ─── Builder functions with populated data ───────────────────────────────────

  describe('builder output with populated data', () => {
    /** Minimal vote record that lets classification functions score > 0 */
    const sampleVotingRecords = [
      { title: 'Resolution on AI Act', date: '2026-03-20', result: 'adopted', votes: { for: 350, against: 200, abstain: 30 } },
      { title: 'Directive on Green Deal', date: '2026-03-21', result: 'adopted', votes: { for: 400, against: 100, abstain: 20 } },
    ];
    const sampleProcedures = [
      { procedureId: 'PROC-001', title: 'Digital Markets Act', stage: 'committee', daysInCurrentStage: 90 },
      { procedureId: 'PROC-002', title: 'Climate Law', stage: 'plenary', daysInCurrentStage: 30 },
    ];
    const sampleCoalitions = [
      { groups: ['EPP', 'S&D'], cohesionScore: 0.55, riskLevel: 'high' },
    ];
    const sampleAnomalies = [
      { severity: 'high', description: 'Unexpected voting pattern shift' },
    ];
    const sampleEvents = [
      { title: 'Plenary session', date: '2026-03-26' },
      { title: 'Committee hearing', date: '2026-03-27' },
    ];
    const sampleDocuments = [
      { title: 'Legislative report', type: 'report' },
    ];
    const samplePatterns = [
      { group: 'EPP', cohesion: 0.85, participation: 0.92 },
    ];

    function buildPopulatedFetchedData() {
      return {
        events: sampleEvents,
        sessions: [],
        documents: sampleDocuments,
        patterns: samplePatterns,
        votingRecords: sampleVotingRecords,
        procedures: sampleProcedures,
        coalitions: sampleCoalitions,
        anomalies: sampleAnomalies,
        mepUpdates: [],
        questions: [],
      };
    }

    it('significance-classification reflects data volume in markdown', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['significance-classification'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'classification', 'significance-assessment.md'),
        'utf-8'
      );
      expect(content).toContain('Political Significance Classification');
      expect(content).toContain('Overall Significance');
      // With populated data, should report non-zero data points
      expect(content).toContain(`${sampleEvents.length} events`);
      expect(content).toContain(`${sampleDocuments.length} documents`);
      // Should contain Mermaid chart
      expect(content).toContain('```mermaid');
      expect(content).toContain('quadrantChart');
    });

    it('impact-matrix includes Mermaid pie chart', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['impact-matrix'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'classification', 'impact-matrix.md'),
        'utf-8'
      );
      expect(content).toContain('Political Impact Matrix');
      expect(content).toContain('Overall Significance');
      expect(content).toContain('Legislative');
      expect(content).toContain('Coalition');
      // Mermaid chart
      expect(content).toContain('```mermaid');
      expect(content).toContain('pie title');
    });

    it('actor-mapping identifies actors from populated data', async () => {
      const data = buildPopulatedFetchedData();
      data.coalitions = [{ groups: ['EPP', 'S&D', 'Renew'], cohesionScore: 0.7, riskLevel: 'low' }];
      await runAnalysisStage(data, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['actor-mapping'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'classification', 'actor-mapping.md'),
        'utf-8'
      );
      expect(content).toContain('Political Actor Mapping');
      expect(content).toContain('Actor Classification');
    });

    it('forces-analysis includes Mermaid pie chart', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['forces-analysis'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'classification', 'forces-analysis.md'),
        'utf-8'
      );
      expect(content).toContain('Political Forces Analysis');
      expect(content).toContain('Coalition Power');
      expect(content).toContain('Opposition Power');
      // Mermaid chart
      expect(content).toContain('```mermaid');
      expect(content).toContain('pie title');
    });

    it('political-stride uses real threat assessment for markdown', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['political-stride'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'threat-assessment', 'political-stride-assessment.md'),
        'utf-8'
      );
      expect(content).toContain('Political Threat Assessment');
      expect(content).toContain('Overall Threat Level');
      // STRIDE categories should appear
      expect(content).toContain('STRIDE');
    });

    it('actor-threat-profiling generates profiles from data', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['actor-threat-profiling'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'threat-assessment', 'actor-threat-profiles.md'),
        'utf-8'
      );
      expect(content).toContain('Actor Threat Profiles');
      expect(content).toContain('Actor Threat Matrix');
    });

    it('consequence-trees generates tree analysis from procedures', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['consequence-trees'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'threat-assessment', 'consequence-trees.md'),
        'utf-8'
      );
      expect(content).toContain('Consequence Tree Analysis');
    });

    it('legislative-disruption analyses procedures for disruption signals', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['legislative-disruption'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'threat-assessment', 'legislative-disruption.md'),
        'utf-8'
      );
      expect(content).toContain('Legislative Disruption Analysis');
      expect(content).toContain('Disruption Assessment');
    });

    it('risk-matrix computes risk scores from populated data', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['risk-matrix'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'risk-scoring', 'risk-matrix.md'),
        'utf-8'
      );
      expect(content).toContain('Political Risk Scoring Matrix');
      // With procedures, coalitions, and anomalies, should have RISK entries
      expect(content).toContain('RISK-001');
      expect(content).toContain('RISK-002');
      expect(content).toContain('RISK-003');
    });

    it('risk-matrix shows no risk entries with empty data', async () => {
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
      expect(content).toContain('Political Risk Scoring Matrix');
      // Empty data -> empty table row
      expect(content).not.toContain('RISK-001');
    });

    it('political-capital-risk generates data inventory', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['political-capital-risk'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'risk-scoring', 'political-capital-risk.md'),
        'utf-8'
      );
      expect(content).toContain('Political Capital at Risk');
      // Should contain data inventory table (no hardcoded group names)
      expect(content).toContain('Data Inventory for Capital Risk Assessment');
      expect(content).toContain('Coalition data points');
    });

    it('quantitative-swot includes Mermaid quadrant chart', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['quantitative-swot'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'risk-scoring', 'quantitative-swot.md'),
        'utf-8'
      );
      expect(content).toContain('Full Political SWOT Analysis');
      expect(content).toContain('Strategic Position Score');
      expect(content).toContain('SWOT Overview');
      // Mermaid quadrant chart
      expect(content).toContain('```mermaid');
      expect(content).toContain('quadrantChart');
      expect(content).toContain('procedures');
      expect(content).toContain('voting records');
    });

    it('legislative-velocity-risk analyses procedure delays', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['legislative-velocity-risk'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'risk-scoring', 'legislative-velocity-risk.md'),
        'utf-8'
      );
      expect(content).toContain('Legislative Velocity Risk');
      // With procedures, should show velocity analysis
      expect(content).toContain(`${sampleProcedures.length} procedures`);
    });

    it('agent-risk-workflow produces full assessment workflow', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['agent-risk-workflow'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'risk-scoring', 'agent-risk-workflow.md'),
        'utf-8'
      );
      expect(content).toContain('Political Risk Assessment');
      expect(content).toContain('Assessment ID');
    });

    it('deep-analysis works with populated event data', async () => {
      await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });
      const content = fs.readFileSync(
        path.join(tmpDir, testDate, 'existing', 'deep-analysis.md'),
        'utf-8'
      );
      expect(content).toContain('Deep Multi-Perspective Analysis');
      expect(content).toContain(`${sampleEvents.length}`);
    });

    it('runs all 19 methods with populated data without errors', async () => {
      const ctx = await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
      });
      expect(ctx.completedMethods).toHaveLength(ALL_ANALYSIS_METHODS.length);
      expect(ctx.manifest.methods).toHaveLength(ALL_ANALYSIS_METHODS.length);
      // All methods should have completed status
      for (const m of ctx.manifest.methods) {
        expect(m.status).toBe('completed');
      }
    });

    it('all 19 methods produce valid markdown with frontmatter when data is populated', async () => {
      const ctx = await runAnalysisStage(buildPopulatedFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
      });
      for (const [, result] of ctx.results) {
        expect(result.status).toBe('completed');
        // Every completed method should have written a file
        const filePath = path.join(ctx.outputDir, result.outputFile);
        expect(fs.existsSync(filePath)).toBe(true);
        const md = fs.readFileSync(filePath, 'utf-8');
        // Every file should have YAML frontmatter
        expect(md).toMatch(/^---\n/);
        // Some builders use 'method:' (analysis-stage header), others use 'title:' (module-native)
        const hasMethod = md.includes('method:');
        const hasTitle = md.includes('title:');
        expect(hasMethod || hasTitle).toBe(true);
        expect(md).toContain('date:');
        expect(md).toContain('confidence:');
      }
    });
  });

  // ─── Document analysis tests ─────────────────────────────────────────────────

  describe('document-analysis method', () => {
    it('creates the document-analysis-index.md in documents/ subdirectory', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['document-analysis'],
      });

      const indexPath = path.join(tmpDir, testDate, 'documents', 'document-analysis-index.md');
      expect(fs.existsSync(indexPath)).toBe(true);
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain('Per-Document Intelligence Analysis Index');
      expect(content).toContain('Total Documents Analyzed');
    });

    it('creates per-document unique analysis files for each document', async () => {
      const data = {
        ...buildTestFetchedData(),
        documents: [
          { docId: 'DOC-001', title: 'Test Report A', type: 'report' },
          { docId: 'DOC-002', title: 'Test Report B', type: 'resolution' },
        ],
        procedures: [
          { procedureId: 'PROC-001', title: 'Digital Markets Act', stage: 'committee' },
        ],
      };

      await runAnalysisStage(data, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['document-analysis'],
      });

      const docsDir = path.join(tmpDir, testDate, 'documents');
      expect(fs.existsSync(docsDir)).toBe(true);

      // Should have unique files for each document
      const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('-analysis.md') && f !== 'document-analysis-index.md');
      expect(files.length).toBeGreaterThanOrEqual(3); // 2 documents + 1 procedure
    });

    it('generates unique filenames derived from document IDs', async () => {
      const data = {
        ...buildTestFetchedData(),
        adoptedTexts: [
          { docId: 'TA-10-2026-0094', title: 'Anti-Corruption Directive' },
        ],
      };

      await runAnalysisStage(data, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['document-analysis'],
      });

      const docsDir = path.join(tmpDir, testDate, 'documents');
      const files = fs.readdirSync(docsDir);
      // Should contain a file with the sanitized doc ID
      const hasDocFile = files.some((f) => f.includes('ta-10-2026-0094'));
      expect(hasDocFile).toBe(true);
    });

    it('deduplicates documents appearing in multiple feed categories', async () => {
      const sharedDoc = { docId: 'SHARED-DOC', title: 'Shared Document' };
      const data = {
        ...buildTestFetchedData(),
        documents: [sharedDoc],
        plenaryDocuments: [sharedDoc],
        committeeDocuments: [sharedDoc],
      };

      const ctx = await runAnalysisStage(data, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['document-analysis'],
      });

      // Manifest should track deduplicated count
      expect(ctx.manifest.documentsAnalyzed).toBe(1);
      expect(ctx.manifest.analyzedDocumentIds).toContain('shared-doc');
    });

    it('per-document files contain SWOT and threat assessment', async () => {
      const data = {
        ...buildTestFetchedData(),
        adoptedTexts: [
          { docId: 'TA-TEST-001', title: 'Test Adopted Text' },
        ],
      };

      await runAnalysisStage(data, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['document-analysis'],
      });

      const docsDir = path.join(tmpDir, testDate, 'documents');
      const files = fs.readdirSync(docsDir).filter((f) => f.includes('ta-test-001'));
      expect(files.length).toBe(1);

      const content = fs.readFileSync(path.join(docsDir, files[0]), 'utf-8');
      expect(content).toContain('Document Analysis:');
      expect(content).toContain('SWOT Analysis');
      expect(content).toContain('Threat Assessment');
      expect(content).toContain('Intelligence Summary');
    });

    it('stores raw document JSON alongside analysis markdown', async () => {
      const data = {
        ...buildTestFetchedData(),
        adoptedTexts: [
          { docId: 'RAW-DOC-001', title: 'Raw Test Document', type: 'resolution', status: 'adopted' },
        ],
      };

      await runAnalysisStage(data, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['document-analysis'],
      });

      // Check raw data directory exists
      const rawDataDir = path.join(tmpDir, testDate, 'documents', 'raw-data');
      expect(fs.existsSync(rawDataDir)).toBe(true);

      // Check raw JSON file exists
      const rawFiles = fs.readdirSync(rawDataDir).filter((f) => f.includes('raw-doc-001'));
      expect(rawFiles.length).toBe(1);

      // Verify raw JSON contains the original document data
      const rawContent = JSON.parse(fs.readFileSync(path.join(rawDataDir, rawFiles[0]), 'utf-8'));
      expect(rawContent.docId).toBe('RAW-DOC-001');
      expect(rawContent.title).toBe('Raw Test Document');
      expect(rawContent.type).toBe('resolution');
      expect(rawContent.status).toBe('adopted');
    });

    it('index file contains document count and category breakdown', async () => {
      const data = {
        ...buildTestFetchedData(),
        events: [
          { eventId: 'EVT-001', title: 'Plenary Session' },
          { eventId: 'EVT-002', title: 'Committee Hearing' },
        ],
        procedures: [
          { procedureId: 'PROC-001', title: 'Test Procedure' },
        ],
      };

      await runAnalysisStage(data, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['document-analysis'],
      });

      const indexPath = path.join(tmpDir, testDate, 'documents', 'document-analysis-index.md');
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toContain('Total Documents Analyzed');
      expect(content).toContain('Category Breakdown');
      expect(content).toContain('events');
      expect(content).toContain('procedures');
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
      expect(deepAnalysis.outputFile).toBe('existing/deep-analysis.md');
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

  // ─── Date validation tests ──────────────────────────────────────────────────

  describe('date validation', () => {
    it('rejects a path-traversal date string', async () => {
      await expect(
        runAnalysisStage(buildTestFetchedData(), {
          articleTypes: ['week-ahead'],
          date: '../../etc',
          outputDir: tmpDir,
          enabledMethods: ['deep-analysis'],
        })
      ).rejects.toThrow('Invalid analysis date');
    });

    it('rejects a date with extra characters', async () => {
      await expect(
        runAnalysisStage(buildTestFetchedData(), {
          articleTypes: ['week-ahead'],
          date: '2026-03-26T00:00',
          outputDir: tmpDir,
          enabledMethods: ['deep-analysis'],
        })
      ).rejects.toThrow('must match YYYY-MM-DD format');
    });

    it('accepts a valid YYYY-MM-DD date', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: '2026-12-31',
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });
      expect(ctx.date).toBe('2026-12-31');
    });
  });

  describe('enabledMethods deduplication', () => {
    it('deduplicates enabledMethods so each method runs only once', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: '2026-03-26',
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis', 'deep-analysis', 'stakeholder-analysis', 'deep-analysis'],
      });
      // Only 2 unique methods should appear in the manifest
      expect(ctx.manifest.methods).toHaveLength(2);
      const methodNames = ctx.manifest.methods.map((m) => m.method);
      expect(methodNames).toContain('deep-analysis');
      expect(methodNames).toContain('stakeholder-analysis');
      // Results map should also have exactly 2 entries
      expect(ctx.results.size).toBe(2);
      expect(ctx.completedMethods).toHaveLength(2);
    });
  });

  // ─── Error branch coverage tests ────────────────────────────────────────────

  describe('error handling edge cases', () => {
    it('records failed status when a builder write throws', async () => {
      // First run succeeds (creates the file)
      const ctx1 = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        skipCompleted: false,
        enabledMethods: ['deep-analysis'],
      });
      expect(ctx1.results.get('deep-analysis').status).toBe('completed');

      // Make the existing/ subdirectory read-only so the next write fails
      const existingDir = path.join(tmpDir, testDate, 'existing');
      fs.chmodSync(existingDir, 0o444);

      const ctx2 = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        skipCompleted: false,
        enabledMethods: ['deep-analysis'],
      });

      // Restore permissions for cleanup
      fs.chmodSync(existingDir, 0o755);

      // The method should have failed because atomicWrite cannot write to read-only dir
      const result = ctx2.results.get('deep-analysis');
      expect(result.status).toBe('failed');
      expect(result.confidence).toBe('low');
      expect(result.summary).toMatch(/failed/i);
    });

    it('returns low confidence when all methods fail', async () => {
      // Make the output directory read-only so all writes fail
      // First create the date dir
      const dateDir = path.join(tmpDir, testDate);
      fs.mkdirSync(dateDir, { recursive: true });

      // Create subdirectories then make them read-only
      for (const subdir of ['classification', 'threat-assessment', 'risk-scoring', 'existing']) {
        const dir = path.join(dateDir, subdir);
        fs.mkdirSync(dir, { recursive: true });
        fs.chmodSync(dir, 0o444);
      }

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        skipCompleted: false,
        enabledMethods: ['deep-analysis', 'stakeholder-analysis'],
      });

      // Restore permissions for cleanup
      for (const subdir of ['classification', 'threat-assessment', 'risk-scoring', 'existing']) {
        const dir = path.join(dateDir, subdir);
        if (fs.existsSync(dir)) fs.chmodSync(dir, 0o755);
      }

      // All methods should have failed
      for (const [, result] of ctx.results) {
        expect(result.status).toBe('failed');
      }

      // aggregateConfidence should return 'low' when all results are failed
      expect(ctx.manifest.overallConfidence).toBe('low');
    });

    it('failed method summary includes error message', async () => {
      // Make the output dir read-only to trigger write failure
      const dateDir = path.join(tmpDir, testDate);
      fs.mkdirSync(dateDir, { recursive: true });
      const existingDir = path.join(dateDir, 'existing');
      fs.mkdirSync(existingDir, { recursive: true });
      fs.chmodSync(existingDir, 0o444);

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        skipCompleted: false,
        enabledMethods: ['deep-analysis'],
      });

      // Restore permissions for cleanup
      fs.chmodSync(existingDir, 0o755);

      const result = ctx.results.get('deep-analysis');
      expect(result.status).toBe('failed');
      // The summary should include the error message from the exception
      expect(result.summary).toContain('deep-analysis failed:');
      expect(typeof result.duration).toBe('number');
    });

    it('handles non-Error exceptions in builder catch block', async () => {
      // Intentionally throw a string (not an Error) to verify the catch branch
      // at line 1377 of analysis-stage.ts handles non-Error exceptions via
      // String(err) rather than err.message. This is a deliberate test pattern.
      const spy = vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      });

      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        skipCompleted: false,
        enabledMethods: ['deep-analysis'],
      });

      spy.mockRestore();

      const result = ctx.results.get('deep-analysis');
      expect(result.status).toBe('failed');
      // Non-Error should be converted to string via String(err)
      expect(result.summary).toContain('string error');
    });
  });

  // ─── requireData option tests (agentic workflow pipeline enforcement) ────────

  describe('requireData option', () => {
    it('throws when requireData=true and no substantive data available', async () => {
      await expect(
        runAnalysisStage(buildTestFetchedData(), {
          articleTypes: ['week-ahead'],
          date: testDate,
          outputDir: tmpDir,
          enabledMethods: ['deep-analysis'],
          requireData: true,
        })
      ).rejects.toThrow('Analysis aborted: no substantive EP data available');
    });

    it('does not throw when requireData=true and substantive data is present', async () => {
      const dataWithEvents = buildTestFetchedData({ events: [{ id: 'ev-1', title: 'Test event' }] });
      const ctx = await runAnalysisStage(dataWithEvents, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
        requireData: true,
      });
      expect(ctx.completedMethods.length).toBeGreaterThan(0);
    });

    it('throws when requireData=true and all methods fail', async () => {
      const dataWithEvents = buildTestFetchedData({ events: [{ id: 'ev-1' }] });
      const dateDir = path.join(tmpDir, testDate);
      fs.mkdirSync(dateDir, { recursive: true });
      for (const subdir of ['classification', 'threat-assessment', 'risk-scoring', 'existing']) {
        const dir = path.join(dateDir, subdir);
        fs.mkdirSync(dir, { recursive: true });
        fs.chmodSync(dir, 0o444);
      }

      await expect(
        runAnalysisStage(dataWithEvents, {
          articleTypes: ['week-ahead'],
          date: testDate,
          outputDir: tmpDir,
          skipCompleted: false,
          enabledMethods: ['deep-analysis', 'stakeholder-analysis'],
          requireData: true,
        })
      ).rejects.toThrow('2 of 2 methods failed');

      // Restore permissions for cleanup
      for (const subdir of ['classification', 'threat-assessment', 'risk-scoring', 'existing']) {
        const dir = path.join(dateDir, subdir);
        if (fs.existsSync(dir)) fs.chmodSync(dir, 0o755);
      }
    });

    it('throws when requireData=true and ANY method fails (not just all)', async () => {
      const dataWithEvents = buildTestFetchedData({ events: [{ id: 'ev-1' }] });
      const dateDir = path.join(tmpDir, testDate);
      fs.mkdirSync(dateDir, { recursive: true });
      // Make ONLY the 'existing' subdir read-only so deep-analysis fails
      // but classification methods could succeed
      const existingDir = path.join(dateDir, 'existing');
      fs.mkdirSync(existingDir, { recursive: true });
      fs.chmodSync(existingDir, 0o444);

      await expect(
        runAnalysisStage(dataWithEvents, {
          articleTypes: ['week-ahead'],
          date: testDate,
          outputDir: tmpDir,
          skipCompleted: false,
          // significance-classification writes to classification/ (will succeed)
          // deep-analysis writes to existing/ (will fail — read-only)
          enabledMethods: ['significance-classification', 'deep-analysis'],
          requireData: true,
        })
      ).rejects.toThrow('1 of 2 methods failed');

      // Restore permissions for cleanup
      fs.chmodSync(existingDir, 0o755);
    });

    it('does NOT throw when requireData=false and no data (backward compat)', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
        requireData: false,
      });
      expect(ctx).toBeDefined();
      expect(ctx.manifest).toBeDefined();
    });

    it('defaults requireData to false (backward compat)', async () => {
      // No requireData option — should not throw even with empty data
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });
      expect(ctx).toBeDefined();
    });
  });

  // ─── Article-type-scoped output directory tests ─────────────────────────────

  describe('article-type-scoped output (articleTypeSlug)', () => {
    it('scopes output to {date}/{slug}/ when articleTypeSlug is provided', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        articleTypeSlug: 'week-ahead',
        enabledMethods: ['deep-analysis'],
      });

      expect(ctx.outputDir).toContain('week-ahead');
      const scopedDir = path.join(tmpDir, testDate, 'week-ahead');
      expect(fs.existsSync(scopedDir)).toBe(true);
      expect(fs.existsSync(path.join(scopedDir, 'manifest.json'))).toBe(true);
    });

    it('writes manifest with articleTypeSlug field', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        articleTypeSlug: 'week-ahead',
        enabledMethods: ['deep-analysis'],
      });

      const manifest = readScopedManifest(tmpDir, testDate, 'week-ahead');
      expect(manifest.articleTypeSlug).toBe('week-ahead');
    });

    it('isolates two different article types to separate directories', async () => {
      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        articleTypeSlug: 'week-ahead',
        enabledMethods: ['deep-analysis'],
      });

      await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['breaking'],
        date: testDate,
        outputDir: tmpDir,
        articleTypeSlug: 'breaking',
        enabledMethods: ['deep-analysis'],
      });

      // Both directories exist independently
      const weekDir = path.join(tmpDir, testDate, 'week-ahead');
      const breakingDir = path.join(tmpDir, testDate, 'breaking');
      expect(fs.existsSync(weekDir)).toBe(true);
      expect(fs.existsSync(breakingDir)).toBe(true);

      // Each has its own manifest
      const m1 = readScopedManifest(tmpDir, testDate, 'week-ahead');
      const m2 = readScopedManifest(tmpDir, testDate, 'breaking');
      expect(m1.articleTypeSlug).toBe('week-ahead');
      expect(m2.articleTypeSlug).toBe('breaking');
      expect(m1.runId).not.toBe(m2.runId);
    });

    it('falls back to {date}/ when articleTypeSlug is omitted (backward compat)', async () => {
      const ctx = await runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        enabledMethods: ['deep-analysis'],
      });

      // outputDir should be {tmpDir}/{date}/ — no extra slug level
      expect(ctx.outputDir).toBe(path.resolve(tmpDir, testDate));
    });

    it('persists OSINT singleton data to data/osint/ subdirectory', async () => {
      const fetchedData = buildTestFetchedData({
        politicalLandscape: { groups: ['EPP', 'S&D'], timestamp: '2026-03-26' },
        votingAnomalies: { anomalies: [] },
      });
      await runAnalysisStage(fetchedData, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        articleTypeSlug: 'week-ahead',
        enabledMethods: ['deep-analysis'],
      });

      const osintDir = path.join(tmpDir, testDate, 'week-ahead', 'data', 'osint');
      expect(fs.existsSync(osintDir)).toBe(true);
      expect(fs.existsSync(path.join(osintDir, 'political-landscape.json'))).toBe(true);
      expect(fs.existsSync(path.join(osintDir, 'voting-anomalies.json'))).toBe(true);
    });

    it('persists World Bank data to data/world-bank/ subdirectory', async () => {
      const fetchedData = buildTestFetchedData({
        worldBankIndicators: [
          { countryId: 'DEU', indicatorId: 'NY.GDP.MKTP.CD', year: 2024, value: 4.2 },
        ],
      });
      await runAnalysisStage(fetchedData, {
        articleTypes: ['week-ahead'],
        date: testDate,
        outputDir: tmpDir,
        articleTypeSlug: 'week-ahead',
        enabledMethods: ['deep-analysis'],
      });

      const wbDir = path.join(tmpDir, testDate, 'week-ahead', 'data', 'world-bank');
      expect(fs.existsSync(wbDir)).toBe(true);
    });

    it('persists MCP tool responses to data/mcp-responses/ subdirectory', async () => {
      const fetchedData = buildTestFetchedData({
        mcpResponses: {
          'get_current_meps': { meps: [{ name: 'Test MEP' }] },
          'get_plenary_sessions': { sessions: [] },
        },
      });
      await runAnalysisStage(fetchedData, {
        articleTypes: ['breaking'],
        date: testDate,
        outputDir: tmpDir,
        articleTypeSlug: 'breaking',
        enabledMethods: ['deep-analysis'],
      });

      const responseDir = path.join(tmpDir, testDate, 'breaking', 'data', 'mcp-responses');
      expect(fs.existsSync(responseDir)).toBe(true);
      expect(fs.existsSync(path.join(responseDir, 'get-current-meps.json'))).toBe(true);
      expect(fs.existsSync(path.join(responseDir, 'get-plenary-sessions.json'))).toBe(true);
    });
  });
});
