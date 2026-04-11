// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the Analysis Stage (discovery mode):
 *   - runAnalysisStage: discovers existing analysis files from disk
 *   - hasSubstantiveData: checks for non-empty EP data
 *   - deriveArticleTypeSlug: sanitizes article type arrays into slugs
 *   - ALL_ANALYSIS_METHODS constant completeness
 *   - AnalysisContext shape validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
    procedures: [],
    adoptedTexts: [],
    votingRecords: [],
    coalitions: [],
    questions: [],
    mepUpdates: [],
    plenaryDocuments: [],
    committeeDocuments: [],
    plenarySessionDocuments: [],
    externalDocuments: [],
    declarations: [],
    corporateBodies: [],
    ...overrides,
  };
}

let tempDir;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-test-'));
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

// ─── hasSubstantiveData tests ─────────────────────────────────────────────────

describe('hasSubstantiveData', () => {
  it('should return false for empty data', () => {
    expect(hasSubstantiveData({})).toBe(false);
  });

  it('should return false when all arrays are empty', () => {
    expect(hasSubstantiveData({ events: [], procedures: [], documents: [] })).toBe(false);
  });

  it('should return true when events has data', () => {
    expect(hasSubstantiveData({ events: [{ id: '1' }] })).toBe(true);
  });

  it('should return true when procedures has data', () => {
    expect(hasSubstantiveData({ procedures: [{ id: '1' }] })).toBe(true);
  });

  it('should return true when documents has data', () => {
    expect(hasSubstantiveData({ documents: [{ id: '1' }] })).toBe(true);
  });

  it('should return false for non-array values', () => {
    expect(hasSubstantiveData({ events: 'string', procedures: 42 })).toBe(false);
  });
});

// ─── runAnalysisStage (discovery mode) tests ──────────────────────────────────

describe('runAnalysisStage', () => {
  it('should return an AnalysisContext with expected shape', async () => {
    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: '2026-04-01',
      outputDir: tempDir,
    });
    expect(ctx).toHaveProperty('date', '2026-04-01');
    expect(ctx).toHaveProperty('outputDir');
    expect(ctx).toHaveProperty('completedMethods');
    expect(ctx).toHaveProperty('results');
    expect(ctx).toHaveProperty('manifest');
    expect(ctx.manifest).toHaveProperty('runId');
    expect(ctx.manifest).toHaveProperty('methods');
  });

  it('should discover existing analysis files on disk', async () => {
    // Pre-create analysis files before discovery
    const analysisDir = path.join(tempDir, '2026-04-01', 'week-ahead');
    const classDir = path.join(analysisDir, 'classification');
    fs.mkdirSync(classDir, { recursive: true });
    fs.writeFileSync(path.join(classDir, 'significance-classification.md'), '# Test');
    fs.writeFileSync(path.join(classDir, 'actor-mapping.md'), '# Actors');

    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: '2026-04-01',
      outputDir: tempDir,
      articleTypeSlug: 'week-ahead',
    });

    expect(ctx.completedMethods.length).toBe(2);
    expect(ctx.manifest.methods.length).toBe(2);
    expect(ctx.manifest.methods[0].status).toBe('completed');
  });

  it('should write manifest.json when none exists', async () => {
    const analysisDir = path.join(tempDir, '2026-04-01', 'test-type');
    const classDir = path.join(analysisDir, 'classification');
    fs.mkdirSync(classDir, { recursive: true });
    fs.writeFileSync(path.join(classDir, 'test.md'), '# Test');

    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: '2026-04-01',
      outputDir: tempDir,
      articleTypeSlug: 'test-type',
    });

    const manifestPath = path.join(analysisDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.date).toBe('2026-04-01');
    expect(manifest.methods.length).toBe(1);
  });

  it('should not overwrite existing manifest.json', async () => {
    const analysisDir = path.join(tempDir, '2026-04-01', 'keep-manifest');
    fs.mkdirSync(analysisDir, { recursive: true });
    fs.writeFileSync(path.join(analysisDir, 'manifest.json'), '{"custom":"data"}');

    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: '2026-04-01',
      outputDir: tempDir,
      articleTypeSlug: 'keep-manifest',
    });

    const manifest = JSON.parse(
      fs.readFileSync(path.join(analysisDir, 'manifest.json'), 'utf-8')
    );
    expect(manifest.custom).toBe('data');
  });

  it('should throw on invalid date format', async () => {
    await expect(
      runAnalysisStage(buildTestFetchedData(), {
        articleTypes: ['week-ahead'],
        date: '2026/04/01',
        outputDir: tempDir,
      })
    ).rejects.toThrow('Invalid analysis date');
  });

  it('should throw when requireData is true and no data', async () => {
    await expect(
      runAnalysisStage({}, {
        articleTypes: ['week-ahead'],
        date: '2026-04-01',
        outputDir: tempDir,
        requireData: true,
      })
    ).rejects.toThrow('no substantive EP data');
  });

  it('should succeed without data when requireData is false', async () => {
    const ctx = await runAnalysisStage({}, {
      articleTypes: ['week-ahead'],
      date: '2026-04-01',
      outputDir: tempDir,
      requireData: false,
    });
    expect(ctx.completedMethods.length).toBe(0);
  });

  it('should use articleTypeSlug for scoped output directory', async () => {
    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['propositions'],
      date: '2026-04-01',
      outputDir: tempDir,
      articleTypeSlug: 'propositions',
    });
    expect(ctx.outputDir).toContain('propositions');
  });
});

// ─── deriveArticleTypeSlug tests ──────────────────────────────────────────────

describe('deriveArticleTypeSlug', () => {
  it('should return "default" for empty array', () => {
    expect(deriveArticleTypeSlug([])).toBe('default');
  });

  it('should return single type as slug', () => {
    expect(deriveArticleTypeSlug(['week-ahead'])).toBe('week-ahead');
  });

  it('should sort multiple types', () => {
    expect(deriveArticleTypeSlug(['motions', 'breaking'])).toBe('breaking-motions');
  });

  it('should sanitize special characters', () => {
    expect(deriveArticleTypeSlug(['test/special!chars'])).toBe('test-special-chars');
  });

  it('should lowercase and trim', () => {
    expect(deriveArticleTypeSlug([' WEEK-AHEAD '])).toBe('week-ahead');
  });
});

// ─── Constants tests ──────────────────────────────────────────────────────────

describe('ALL_ANALYSIS_METHODS', () => {
  it('should contain at least 15 methods', () => {
    expect(ALL_ANALYSIS_METHODS.length).toBeGreaterThanOrEqual(15);
  });

  it('should include key methods', () => {
    expect(ALL_ANALYSIS_METHODS).toContain('significance-classification');
    expect(ALL_ANALYSIS_METHODS).toContain('risk-matrix');
    expect(ALL_ANALYSIS_METHODS).toContain('deep-analysis');
    expect(ALL_ANALYSIS_METHODS).toContain('political-threat-landscape');
  });
});

describe('VALID_ANALYSIS_METHODS', () => {
  it('should include document-analysis', () => {
    expect(VALID_ANALYSIS_METHODS).toContain('document-analysis');
  });

  it('should be a superset of ALL_ANALYSIS_METHODS', () => {
    for (const method of ALL_ANALYSIS_METHODS) {
      expect(VALID_ANALYSIS_METHODS).toContain(method);
    }
  });
});
