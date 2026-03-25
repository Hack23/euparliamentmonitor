// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for the analysis pipeline stage:
 *   - countDataItems
 *   - deriveConfidence
 *   - generateFrontmatter
 *   - buildAnalysisMarkdown
 *   - buildAnalysisManifest
 *   - runAnalysisStage (with file-system writes)
 *   - ensureDir / writeAnalysisFile helpers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── Imports from compiled output ────────────────────────────────────────────

import {
  countDataItems,
  deriveConfidence,
  generateFrontmatter,
  buildAnalysisMarkdown,
  buildAnalysisManifest,
  runAnalysisStage,
  ensureDir,
  writeAnalysisFile,
} from '../../scripts/generators/pipeline/analysis-stage.js';

// ─── countDataItems tests ─────────────────────────────────────────────────────

describe('countDataItems', () => {
  it('returns 0 for an empty object', () => {
    expect(countDataItems({})).toBe(0);
  });

  it('counts array lengths', () => {
    expect(countDataItems({ events: [1, 2, 3], sessions: [4, 5] })).toBe(5);
  });

  it('counts object keys', () => {
    expect(countDataItems({ info: { a: 1, b: 2 } })).toBe(2);
  });

  it('counts primitives as 1', () => {
    expect(countDataItems({ count: 42, name: 'test' })).toBe(2);
  });

  it('counts empty objects as 1 (still a data item)', () => {
    expect(countDataItems({ meta: {} })).toBe(1);
  });

  it('skips null and undefined values', () => {
    expect(countDataItems({ a: null, b: undefined, c: 'ok' })).toBe(1);
  });

  it('handles mixed data types', () => {
    const data = {
      events: [1, 2],
      info: { x: 1 },
      count: 99,
      nothing: null,
    };
    // [1,2] = 2, {x:1} = 1, 99 = 1, null = 0
    expect(countDataItems(data)).toBe(4);
  });
});

// ─── deriveConfidence tests ───────────────────────────────────────────────────

describe('deriveConfidence', () => {
  it('returns "low" for empty data', () => {
    expect(deriveConfidence({})).toBe('low');
  });

  it('returns "low" for very little data', () => {
    expect(deriveConfidence({ tool1: 'x' })).toBe('low');
  });

  it('returns "medium" for moderate data', () => {
    expect(deriveConfidence({ tool1: [1, 2, 3] })).toBe('medium');
  });

  it('returns "high" for rich data from multiple tools', () => {
    expect(
      deriveConfidence({
        tool1: [1, 2, 3, 4],
        tool2: [5, 6, 7],
        tool3: [8, 9, 10],
      }),
    ).toBe('high');
  });

  it('returns "medium" when tool count is high but item count is low', () => {
    expect(deriveConfidence({ a: 'x', b: 'y', c: 'z' })).toBe('medium');
  });
});

// ─── generateFrontmatter tests ────────────────────────────────────────────────

describe('generateFrontmatter', () => {
  it('generates valid YAML frontmatter with correct fields', () => {
    const result = generateFrontmatter(
      'data-summary',
      'week-ahead',
      'high',
      '2026-03-25T06:00:00Z',
    );
    expect(result).toContain('---');
    expect(result).toContain('method: "data-summary"');
    expect(result).toContain('articleType: "week-ahead"');
    expect(result).toContain('confidence: "high"');
    expect(result).toContain('generatedAt: "2026-03-25T06:00:00Z"');
    expect(result).toContain('classification: "PUBLIC"');
  });

  it('starts and ends with YAML delimiters', () => {
    const result = generateFrontmatter(
      'risk-assessment',
      'breaking',
      'medium',
      '2026-01-01T00:00:00Z',
    );
    const lines = result.split('\n');
    expect(lines[0]).toBe('---');
    expect(lines[lines.length - 1]).toBe('---');
  });
});

// ─── buildAnalysisMarkdown tests ──────────────────────────────────────────────

describe('buildAnalysisMarkdown', () => {
  const sampleData = {
    plenaryData: [{ id: 1 }, { id: 2 }],
    votingData: { for: 100, against: 50 },
  };

  it('returns markdown with frontmatter and sections', () => {
    const { markdown } = buildAnalysisMarkdown(
      'data-summary',
      'week-ahead',
      sampleData,
      '2026-03-25T06:00:00Z',
    );

    expect(markdown).toContain('---');
    expect(markdown).toContain('# Data Summary');
    expect(markdown).toContain('**Article Type:** week-ahead');
    expect(markdown).toContain('## Data Sources');
    expect(markdown).toContain('## Analysis');
    expect(markdown).toContain('### Summary');
    expect(markdown).toContain('`plenaryData`');
    expect(markdown).toContain('`votingData`');
  });

  it('returns a non-empty summary string', () => {
    const { summary } = buildAnalysisMarkdown(
      'risk-assessment',
      'breaking',
      sampleData,
      '2026-01-01T00:00:00Z',
    );
    expect(summary.length).toBeGreaterThan(0);
    expect(summary).toContain('data source(s)');
    expect(summary).toContain('item(s)');
  });

  it('handles empty fetched data gracefully', () => {
    const { markdown, summary } = buildAnalysisMarkdown(
      'trend-detection',
      'month-ahead',
      {},
      '2026-01-01T00:00:00Z',
    );
    expect(markdown).toContain('# Trend Detection');
    expect(summary).toContain('0 data source(s)');
  });

  it('capitalizes multi-word method names in the title', () => {
    const { markdown } = buildAnalysisMarkdown(
      'coalition-stability-index',
      'month-in-review',
      { x: 1 },
      '2026-01-01T00:00:00Z',
    );
    expect(markdown).toContain('# Coalition Stability Index');
  });
});

// ─── buildAnalysisManifest tests ──────────────────────────────────────────────

describe('buildAnalysisManifest', () => {
  const sampleOutputs = [
    {
      method: 'data-summary',
      filePath: 'week-ahead/data-summary.md',
      summary: 'test',
      confidence: 'high',
      generatedAt: '2026-03-25T06:00:00Z',
    },
    {
      method: 'political-classification',
      filePath: 'week-ahead/political-classification.md',
      summary: 'test',
      confidence: 'medium',
      generatedAt: '2026-03-25T06:00:01Z',
    },
  ];

  it('creates a manifest with version and metadata', () => {
    const manifest = buildAnalysisManifest(
      sampleOutputs,
      'week-ahead',
      '2026-03-25T06:00:00Z',
    );
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.articleType).toBe('week-ahead');
    expect(manifest.generatedAt).toBe('2026-03-25T06:00:00Z');
  });

  it('includes all analysis outputs', () => {
    const manifest = buildAnalysisManifest(
      sampleOutputs,
      'week-ahead',
      '2026-03-25T06:00:00Z',
    );
    expect(manifest.analyses).toHaveLength(2);
  });

  it('includes cross-references when both sides are present', () => {
    const outputs = [
      {
        method: 'data-summary',
        filePath: 'x.md',
        summary: '',
        confidence: 'high',
        generatedAt: '2026-01-01T00:00:00Z',
      },
      {
        method: 'political-classification',
        filePath: 'y.md',
        summary: '',
        confidence: 'medium',
        generatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    const manifest = buildAnalysisManifest(outputs, 'week-ahead', '2026-01-01T00:00:00Z');
    expect(manifest.crossReferences.length).toBeGreaterThan(0);
    expect(manifest.crossReferences[0].from).toBe('data-summary');
    expect(manifest.crossReferences[0].to).toBe('political-classification');
    expect(manifest.crossReferences[0].relationship).toBe('informs');
  });

  it('excludes cross-references when one side is missing', () => {
    const outputs = [
      {
        method: 'data-summary',
        filePath: 'x.md',
        summary: '',
        confidence: 'high',
        generatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    const manifest = buildAnalysisManifest(outputs, 'breaking', '2026-01-01T00:00:00Z');
    // data-summary → political-classification rule should be excluded
    const hasCrossRef = manifest.crossReferences.some((cr) => cr.from === 'data-summary');
    expect(hasCrossRef).toBe(false);
  });

  it('returns empty cross-references for unrelated methods', () => {
    const outputs = [
      {
        method: 'emerging-themes',
        filePath: 'x.md',
        summary: '',
        confidence: 'low',
        generatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    const manifest = buildAnalysisManifest(outputs, 'breaking', '2026-01-01T00:00:00Z');
    expect(manifest.crossReferences).toHaveLength(0);
  });
});

// ─── ensureDir tests ──────────────────────────────────────────────────────────

describe('ensureDir', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates a directory that does not exist', () => {
    const newDir = path.join(tmpDir, 'sub', 'deep');
    ensureDir(newDir);
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it('does not throw when directory already exists', () => {
    ensureDir(tmpDir);
    expect(fs.existsSync(tmpDir)).toBe(true);
  });
});

// ─── writeAnalysisFile tests ──────────────────────────────────────────────────

describe('writeAnalysisFile', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes content to a file', () => {
    const filePath = path.join(tmpDir, 'test.md');
    writeAnalysisFile(filePath, '# Test');
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('# Test');
  });

  it('creates parent directories as needed', () => {
    const filePath = path.join(tmpDir, 'deep', 'nested', 'file.md');
    writeAnalysisFile(filePath, 'content');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

// ─── runAnalysisStage tests ───────────────────────────────────────────────────

describe('runAnalysisStage', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-stage-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('returns empty array when fetchedData is empty', async () => {
    const result = await runAnalysisStage({
      articleType: 'week-ahead',
      fetchedData: {},
      outputDir: tmpDir,
      enabledMethods: ['data-summary'],
    });
    expect(result).toHaveLength(0);
  });

  it('returns empty array when enabledMethods is empty', async () => {
    const result = await runAnalysisStage({
      articleType: 'week-ahead',
      fetchedData: { tool1: [1, 2] },
      outputDir: tmpDir,
      enabledMethods: [],
    });
    expect(result).toHaveLength(0);
  });

  it('writes analysis files and manifest for enabled methods', async () => {
    const result = await runAnalysisStage({
      articleType: 'week-ahead',
      fetchedData: { plenaryData: [1, 2, 3], votingData: [4, 5] },
      outputDir: tmpDir,
      enabledMethods: ['data-summary', 'risk-assessment'],
    });

    expect(result).toHaveLength(2);
    expect(result[0].method).toBe('data-summary');
    expect(result[1].method).toBe('risk-assessment');

    // Verify files exist on disk
    const articleDir = path.join(tmpDir, 'week-ahead');
    expect(fs.existsSync(path.join(articleDir, 'data-summary.md'))).toBe(true);
    expect(fs.existsSync(path.join(articleDir, 'risk-assessment.md'))).toBe(true);
    expect(fs.existsSync(path.join(articleDir, 'manifest.json'))).toBe(true);
  });

  it('produces valid manifest JSON', async () => {
    await runAnalysisStage({
      articleType: 'breaking',
      fetchedData: { feed: [1] },
      outputDir: tmpDir,
      enabledMethods: ['data-summary'],
    });

    const manifestPath = path.join(tmpDir, 'breaking', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.version).toBe('1.0.0');
    expect(manifest.articleType).toBe('breaking');
    expect(manifest.analyses).toHaveLength(1);
    expect(manifest.analyses[0].method).toBe('data-summary');
  });

  it('includes cross-references in the manifest when applicable', async () => {
    await runAnalysisStage({
      articleType: 'week-ahead',
      fetchedData: { a: [1, 2], b: [3], c: [4] },
      outputDir: tmpDir,
      enabledMethods: ['stakeholder-analysis', 'risk-assessment'],
    });

    const manifestPath = path.join(tmpDir, 'week-ahead', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.crossReferences.length).toBeGreaterThan(0);
    expect(manifest.crossReferences[0].from).toBe('stakeholder-analysis');
    expect(manifest.crossReferences[0].to).toBe('risk-assessment');
  });

  it('analysis markdown files contain frontmatter', async () => {
    await runAnalysisStage({
      articleType: 'motions',
      fetchedData: { data: [1] },
      outputDir: tmpDir,
      enabledMethods: ['voting-pattern'],
    });

    const content = fs.readFileSync(
      path.join(tmpDir, 'motions', 'voting-pattern.md'),
      'utf-8',
    );
    expect(content).toContain('---');
    expect(content).toContain('method: "voting-pattern"');
    expect(content).toContain('classification: "PUBLIC"');
  });

  it('output filePaths are relative (not absolute)', async () => {
    const result = await runAnalysisStage({
      articleType: 'committee-reports',
      fetchedData: { x: [1] },
      outputDir: tmpDir,
      enabledMethods: ['power-dynamics'],
    });

    expect(result[0].filePath).toBe('committee-reports/power-dynamics.md');
    expect(path.isAbsolute(result[0].filePath)).toBe(false);
  });

  it('each output has a valid generatedAt ISO timestamp', async () => {
    const result = await runAnalysisStage({
      articleType: 'propositions',
      fetchedData: { p: [1] },
      outputDir: tmpDir,
      enabledMethods: ['legislative-pipeline'],
    });

    const ts = result[0].generatedAt;
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(isNaN(new Date(ts).getTime())).toBe(false);
  });
});
