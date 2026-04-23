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
  isResolvedAnalysisDir,
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

    const manifest = JSON.parse(fs.readFileSync(path.join(analysisDir, 'manifest.json'), 'utf-8'));
    expect(manifest.custom).toBe('data');
  });

  // Regression: committee-reports analysis run 24817014873 failed with
  // "manifest.json is missing 'articleType'" + "missing 'files' object"
  // because the pipeline wrote a manifest that lacked both fields. The
  // gate then forced a Pass-3 repair loop that exhausted the 45 min timeout.
  it('should include top-level articleType and files grouped by subdir in manifest', async () => {
    const analysisDir = path.join(tempDir, '2026-04-23', 'committee-reports');
    fs.mkdirSync(path.join(analysisDir, 'intelligence'), { recursive: true });
    fs.mkdirSync(path.join(analysisDir, 'classification'), { recursive: true });
    fs.writeFileSync(path.join(analysisDir, 'intelligence', 'pestle-analysis.md'), '# Pestle');
    fs.writeFileSync(path.join(analysisDir, 'intelligence', 'threat-model.md'), '# Threat');
    fs.writeFileSync(path.join(analysisDir, 'classification', 'actor-mapping.md'), '# Actors');

    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['committee-reports'],
      date: '2026-04-23',
      outputDir: tempDir,
      articleTypeSlug: 'committee-reports',
    });

    const manifest = JSON.parse(fs.readFileSync(path.join(analysisDir, 'manifest.json'), 'utf-8'));
    // Validator (validate-analysis-completeness.ts:loadManifest) requires both.
    // NOTE: `manifest.articleType` is sourced from the `articleTypeSlug` option
    // (not `articleTypes`) — this is the validator-facing top-level field that
    // matches the `--article-type` CLI argument, not the internal article-types
    // array used for data fetching.
    expect(manifest.articleType).toBe('committee-reports');
    expect(manifest.files).toBeDefined();
    expect(manifest.files.intelligence).toEqual([
      'intelligence/pestle-analysis.md',
      'intelligence/threat-model.md',
    ]);
    expect(manifest.files.classification).toEqual(['classification/actor-mapping.md']);
  });

  // Regression: subdirs literally named `__proto__`, `constructor`, or
  // `prototype` must NOT pollute Object.prototype or appear as keys on
  // `manifest.files` (defence-in-depth — the validator + Object.create(null)
  // backing object already block this, but we assert behaviour in case the
  // implementation regresses).
  it('should drop reserved-key subdirs and not pollute Object.prototype', async () => {
    const analysisDir = path.join(tempDir, '2026-04-23', 'reserved-keys');
    fs.mkdirSync(path.join(analysisDir, 'intelligence'), { recursive: true });
    fs.mkdirSync(path.join(analysisDir, '__proto__'), { recursive: true });
    fs.mkdirSync(path.join(analysisDir, 'constructor'), { recursive: true });
    fs.writeFileSync(path.join(analysisDir, 'intelligence', 'ok.md'), '# OK');
    fs.writeFileSync(path.join(analysisDir, '__proto__', 'evil.md'), 'polluted: true');
    fs.writeFileSync(path.join(analysisDir, 'constructor', 'evil.md'), 'polluted: true');

    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['reserved-keys'],
      date: '2026-04-23',
      outputDir: tempDir,
      articleTypeSlug: 'reserved-keys',
    });

    const manifest = JSON.parse(fs.readFileSync(path.join(analysisDir, 'manifest.json'), 'utf-8'));
    expect(manifest.files.intelligence).toEqual(['intelligence/ok.md']);
    // Reserved keys must not appear as own properties on manifest.files
    // (after JSON roundtrip the object has Object.prototype, so we check ownership).
    expect(Object.prototype.hasOwnProperty.call(manifest.files, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(manifest.files, 'constructor')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(manifest.files, 'prototype')).toBe(false);
    // Object.prototype must NOT have been mutated by the evil payloads.
    expect({}.polluted).toBeUndefined();
  });

  // Regression: when an agent pre-creates a partial manifest (e.g. one with
  // only runId + history[]), the pipeline wrap-up MUST augment it with
  // articleType + files rather than leaving it incomplete. Uses
  // outputDirIsResolved=true to match the real `--analysis-only` wrap-up
  // invocation in news-enhanced.ts (committee-reports failed run
  // #24817014873).
  it('should augment an existing manifest missing articleType and files', async () => {
    const analysisDir = path.join(tempDir, '2026-04-23', 'augment-me');
    fs.mkdirSync(path.join(analysisDir, 'intelligence'), { recursive: true });
    fs.writeFileSync(path.join(analysisDir, 'intelligence', 'synthesis-summary.md'), '# Synthesis');
    // Agent-written skeleton manifest without articleType or files.
    fs.writeFileSync(
      path.join(analysisDir, 'manifest.json'),
      JSON.stringify({ custom: 'preserve-me', existingField: 42 })
    );

    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: '2026-04-23',
      outputDir: analysisDir,
      articleTypeSlug: 'augment-me',
      outputDirIsResolved: true,
    });

    const manifest = JSON.parse(fs.readFileSync(path.join(analysisDir, 'manifest.json'), 'utf-8'));
    // Added fields satisfy the gate. `manifest.articleType` derives from
    // `articleTypeSlug` (NOT `articleTypes[0]`) — using different values here
    // (`articleTypes: ['week-ahead']` vs `articleTypeSlug: 'augment-me'`)
    // asserts that the slug is the authoritative source.
    expect(manifest.articleType).toBe('augment-me');
    expect(manifest.files).toBeDefined();
    expect(manifest.files.intelligence).toEqual(['intelligence/synthesis-summary.md']);
    // Pre-existing fields preserved
    expect(manifest.custom).toBe('preserve-me');
    expect(manifest.existingField).toBe(42);
  });

  // Regression: when the existing manifest already has a valid articleType,
  // the augmenter must not clobber it (even if a different slug would be
  // derived this run).
  it('should preserve existing articleType and files in a complete manifest', async () => {
    const analysisDir = path.join(tempDir, '2026-04-23', 'complete-manifest');
    fs.mkdirSync(path.join(analysisDir, 'intelligence'), { recursive: true });
    fs.writeFileSync(path.join(analysisDir, 'intelligence', 'new-file.md'), '# New');
    const preExisting = {
      articleType: 'breaking',
      files: { intelligence: ['intelligence/kept.md'] },
      custom: 'keep',
    };
    fs.writeFileSync(path.join(analysisDir, 'manifest.json'), JSON.stringify(preExisting));

    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: '2026-04-23',
      outputDir: analysisDir,
      articleTypeSlug: 'complete-manifest',
      outputDirIsResolved: true,
    });

    const manifest = JSON.parse(fs.readFileSync(path.join(analysisDir, 'manifest.json'), 'utf-8'));
    // Existing articleType + files are preserved verbatim.
    expect(manifest.articleType).toBe('breaking');
    expect(manifest.files.intelligence).toEqual(['intelligence/kept.md']);
    expect(manifest.custom).toBe('keep');
  });

  // Regression: when articleTypeSlug is omitted, manifest.articleType must
  // still be populated (Stage-C gate Rule 6) by deriving from articleTypes[].
  it('should derive articleType from articleTypes[] when articleTypeSlug omitted', async () => {
    // When articleTypeSlug is omitted, computePreferredAnalysisDir uses
    // `<outputDir>/<date>` (no slug subdir). resolveUniqueAnalysisDir only
    // suffixes when a completed-run manifest.json already exists in that
    // dir (see file-utils.ts:191-197), so here the manifest is written
    // directly to `<tempDir>/<date>/manifest.json`.
    const analysisDir = path.join(tempDir, '2026-04-23');
    fs.mkdirSync(path.join(analysisDir, 'intelligence'), { recursive: true });
    fs.writeFileSync(path.join(analysisDir, 'intelligence', 'a.md'), '# A');

    await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['week-ahead'],
      date: '2026-04-23',
      outputDir: tempDir,
      // articleTypeSlug intentionally omitted
    });

    const manifest = JSON.parse(fs.readFileSync(path.join(analysisDir, 'manifest.json'), 'utf-8'));
    expect(manifest.articleType).toBe('week-ahead');
    expect(manifest.files).toBeDefined();
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
      runAnalysisStage(
        {},
        {
          articleTypes: ['week-ahead'],
          date: '2026-04-01',
          outputDir: tempDir,
          requireData: true,
        }
      )
    ).rejects.toThrow('no substantive EP data');
  });

  it('should succeed without data when requireData is false', async () => {
    const ctx = await runAnalysisStage(
      {},
      {
        articleTypes: ['week-ahead'],
        date: '2026-04-01',
        outputDir: tempDir,
        requireData: false,
      }
    );
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

  it('should honour outputDirIsResolved and skip <date>/<slug> composition', async () => {
    // Pre-populate a fully-qualified agentic-workflow run directory with
    // an `intelligence/` subdir and one AI-authored artifact, then invoke
    // runAnalysisStage with that exact path — the discovery function must
    // use it as-is instead of appending `/<date>/<slug>`.
    //
    // The directory name (`-run-1776853275`) and the slug
    // (`committee-reports-run60`) deliberately differ to model the real
    // failure in run #24773038606: the workflow created the dir from
    // `$$-$(date +%s)` while news-enhanced.ts composes its slug from
    // `GITHUB_RUN_NUMBER`. With outputDirIsResolved=true the dir name must
    // be honoured verbatim regardless of the computed slug.
    const resolvedRunDir = path.join(tempDir, '2026-04-22', 'committee-reports-run-1776853275');
    fs.mkdirSync(path.join(resolvedRunDir, 'intelligence'), { recursive: true });
    fs.writeFileSync(
      path.join(resolvedRunDir, 'intelligence', 'synthesis-summary.md'),
      '# Synthesis Summary\n\nAI-authored content.\n'
    );

    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['committee-reports'],
      date: '2026-04-22',
      outputDir: resolvedRunDir,
      articleTypeSlug: 'committee-reports-run60',
      outputDirIsResolved: true,
    });

    expect(path.resolve(ctx.outputDir)).toBe(path.resolve(resolvedRunDir));
    expect(fs.existsSync(path.join(ctx.outputDir, 'manifest.json'))).toBe(true);
    expect(ctx.manifest.methods.length).toBeGreaterThan(0);
  });

  it('should honour outputDirIsResolved when resolvedRunDir already contains manifest.json', async () => {
    // Regression guard for PR #1336 review #1: Stage B typically writes
    // manifest.json BEFORE discovery runs. Without the
    // outputDirIsResolved→bypass, resolveUniqueAnalysisDir would see the
    // manifest, declare the dir "occupied", and redirect to an empty `-2`
    // suffix — yielding 0 discovered artifacts and an empty PR.
    const resolvedRunDir = path.join(tempDir, '2026-04-22', 'committee-reports-run-1776853275');
    const intelligenceDir = path.join(resolvedRunDir, 'intelligence');
    fs.mkdirSync(intelligenceDir, { recursive: true });
    fs.writeFileSync(
      path.join(intelligenceDir, 'synthesis-summary.md'),
      '# Synthesis Summary\n\nAI-authored content.\n'
    );
    fs.writeFileSync(
      path.join(resolvedRunDir, 'manifest.json'),
      JSON.stringify({
        runId: 'pre-existing-run-id',
        date: '2026-04-22',
        articleType: 'committee-reports',
        methods: [],
      })
    );
    // Also pre-create the `-2` suffixed sibling to prove discovery does NOT
    // fall through to it when the resolved flag is set.
    fs.mkdirSync(`${resolvedRunDir}-2`, { recursive: true });

    const ctx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['committee-reports'],
      date: '2026-04-22',
      outputDir: resolvedRunDir,
      articleTypeSlug: 'committee-reports-run60',
      outputDirIsResolved: true,
    });

    expect(path.resolve(ctx.outputDir)).toBe(path.resolve(resolvedRunDir));
    expect(path.basename(ctx.outputDir)).toBe('committee-reports-run-1776853275');
    expect(path.basename(ctx.outputDir)).not.toMatch(/-2$/u);
    expect(ctx.manifest.methods.length).toBeGreaterThan(0);
  });

  it('should accumulate manifest.history[] across repeated runs on a shared same-day folder', async () => {
    // Simulates the new stable-folder layout: analysis/daily/${DATE}/${TYPE}/
    // where the analysis workflow may run multiple times against the same dir
    // (to upgrade sub-threshold artifacts) and each run appends a history entry
    // rather than triggering the `-2` suffix.
    const sharedDir = path.join(tempDir, '2026-04-22', 'breaking');
    fs.mkdirSync(path.join(sharedDir, 'intelligence'), { recursive: true });
    fs.writeFileSync(
      path.join(sharedDir, 'intelligence', 'synthesis-summary.md'),
      '# Synthesis\n\nPass 1.\n'
    );

    const firstCtx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['breaking'],
      date: '2026-04-22',
      outputDir: sharedDir,
      articleTypeSlug: 'breaking',
      outputDirIsResolved: true,
      runId: 'breaking-run-100',
      gateResult: 'PENDING',
    });
    expect(firstCtx.manifest.runId).toBe('breaking-run-100');

    // Second run against the same folder, with an upgraded artifact.
    fs.writeFileSync(
      path.join(sharedDir, 'intelligence', 'synthesis-summary.md'),
      '# Synthesis\n\nPass 2 — deeper analysis with evidence citations.\n'
    );

    const secondCtx = await runAnalysisStage(buildTestFetchedData(), {
      articleTypes: ['breaking'],
      date: '2026-04-22',
      outputDir: sharedDir,
      articleTypeSlug: 'breaking',
      outputDirIsResolved: true,
      runId: 'breaking-run-200',
      gateResult: 'GREEN',
    });

    expect(path.resolve(secondCtx.outputDir)).toBe(path.resolve(sharedDir));
    expect(path.basename(secondCtx.outputDir)).not.toMatch(/-2$/u);

    const manifestJson = JSON.parse(
      fs.readFileSync(path.join(sharedDir, 'manifest.json'), 'utf-8')
    );
    expect(Array.isArray(manifestJson.history)).toBe(true);
    expect(manifestJson.history.length).toBe(2);
    expect(manifestJson.history[0].runId).toBe('breaking-run-100');
    expect(manifestJson.history[0].gateResult).toBe('PENDING');
    expect(manifestJson.history[1].runId).toBe('breaking-run-200');
    expect(manifestJson.history[1].gateResult).toBe('GREEN');
    expect(manifestJson.updatedAt).toBeTruthy();
  });
});

// ─── isResolvedAnalysisDir tests ──────────────────────────────────────────────

describe('isResolvedAnalysisDir', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resolved-dir-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return false for non-existent path', () => {
    expect(isResolvedAnalysisDir(path.join(tempDir, 'does-not-exist'))).toBe(false);
  });

  it('should return false for empty directory', () => {
    expect(isResolvedAnalysisDir(tempDir)).toBe(false);
  });

  it('should return true when directory contains manifest.json', () => {
    fs.writeFileSync(path.join(tempDir, 'manifest.json'), '{}');
    expect(isResolvedAnalysisDir(tempDir)).toBe(true);
  });

  it('should return true when directory contains an intelligence/ subdir', () => {
    fs.mkdirSync(path.join(tempDir, 'intelligence'));
    expect(isResolvedAnalysisDir(tempDir)).toBe(true);
  });

  it('should return true for any canonical analysis subdir', () => {
    const subdirs = [
      'classification',
      'threat-assessment',
      'risk-scoring',
      'existing',
      'documents',
      'data',
    ];
    for (const sub of subdirs) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), `resolved-${sub}-`));
      fs.mkdirSync(path.join(dir, sub));
      expect(isResolvedAnalysisDir(dir)).toBe(true);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should return false for a path pointing to a regular file', () => {
    const file = path.join(tempDir, 'file.txt');
    fs.writeFileSync(file, 'hello');
    expect(isResolvedAnalysisDir(file)).toBe(false);
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
