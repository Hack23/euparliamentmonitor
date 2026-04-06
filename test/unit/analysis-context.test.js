// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for analysis context loading and strategy consumption.
 * Tests loadAnalysisContext(), extractAnalysisSummary(),
 * buildAnalysisInsightsSection(), and each strategy's use of analysis context.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

import {
  loadAnalysisContext,
  extractAnalysisSummary,
  extractFrontmatterMethod,
  buildAnalysisInsightsSection,
} from '../../scripts/generators/strategies/article-strategy.js';

import { BreakingNewsStrategy } from '../../scripts/generators/strategies/breaking-news-strategy.js';
import { WeekAheadStrategy } from '../../scripts/generators/strategies/week-ahead-strategy.js';
import { CommitteeReportsStrategy } from '../../scripts/generators/strategies/committee-reports-strategy.js';
import { MotionsStrategy } from '../../scripts/generators/strategies/motions-strategy.js';
import { PropositionsStrategy } from '../../scripts/generators/strategies/propositions-strategy.js';
import { WeeklyReviewStrategy } from '../../scripts/generators/strategies/weekly-review-strategy.js';
import { MonthlyReviewStrategy } from '../../scripts/generators/strategies/monthly-review-strategy.js';
import { MonthAheadStrategy } from '../../scripts/generators/strategies/month-ahead-strategy.js';

import {
  breakingNewsData,
  weekAheadData,
  committeeReportsData,
  motionsData,
  propositionsData,
  weeklyReviewData,
  monthlyReviewData,
  monthAheadData,
} from '../fixtures/ep-data.js';

// ─── Test helpers ────────────────────────────────────────────────────────────

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-ctx-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  // Clean up env vars used by loadAnalysisContext
  delete process.env['EP_ANALYSIS_DIR'];
  delete process.env['EP_ANALYSIS_SLUG'];
});

/**
 * Create a fake analysis directory structure with markdown files.
 *
 * @param {string} baseDir - Temp base directory
 * @param {string} date - ISO date
 * @param {string} slug - Article type slug
 * @param {object} options - Files and manifest to create
 */
function createAnalysisDir(baseDir, date, slug, options = {}) {
  const analysisDir = path.join(baseDir, date, slug);
  fs.mkdirSync(analysisDir, { recursive: true });

  // Create manifest.json if provided
  if (options.manifest) {
    fs.writeFileSync(
      path.join(analysisDir, 'manifest.json'),
      JSON.stringify(options.manifest, null, 2)
    );
  }

  // Create subdirectories and files
  if (options.files) {
    for (const [subdir, files] of Object.entries(options.files)) {
      const subdirPath = path.join(analysisDir, subdir);
      fs.mkdirSync(subdirPath, { recursive: true });
      for (const [filename, content] of Object.entries(files)) {
        fs.writeFileSync(path.join(subdirPath, filename), content);
      }
    }
  }

  return analysisDir;
}

// ─── loadAnalysisContext tests ────────────────────────────────────────────────

describe('loadAnalysisContext', () => {
  it('returns null when the date directory does not exist', () => {
    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).toBeNull();
  });

  it('returns null for path-traversal date values', () => {
    expect(loadAnalysisContext('../../etc', 'breaking', tmpDir)).toBeNull();
    expect(loadAnalysisContext('../..', 'breaking', tmpDir)).toBeNull();
    expect(loadAnalysisContext('2026-04-06/../../etc', 'breaking', tmpDir)).toBeNull();
    expect(loadAnalysisContext('not-a-date', 'breaking', tmpDir)).toBeNull();
  });

  it('returns null for invalid slug values', () => {
    expect(loadAnalysisContext('2026-04-06', '../etc', tmpDir)).toBeNull();
    expect(loadAnalysisContext('2026-04-06', 'slug/../../etc', tmpDir)).toBeNull();
    expect(loadAnalysisContext('2026-04-06', '', tmpDir)).toBeNull();
  });

  // ── EP_ANALYSIS_DIR / EP_ANALYSIS_SLUG env var resolution ─────────────────

  it('uses EP_ANALYSIS_DIR env var for base dir when default baseDir is used', () => {
    // Create analysis in a custom directory
    const customBase = path.join(tmpDir, 'custom-analysis');
    createAnalysisDir(customBase, '2026-04-06', 'breaking', {
      manifest: { date: '2026-04-06', overallConfidence: 'high' },
    });
    process.env['EP_ANALYSIS_DIR'] = customBase;

    // Passing 'analysis' (the default value) should resolve to the env var dir
    const ctx = loadAnalysisContext('2026-04-06', 'breaking', 'analysis');
    expect(ctx).not.toBeNull();
    expect(ctx.manifest).not.toBeNull();
    expect(ctx.overallConfidence).toBe('high');
  });

  it('uses EP_ANALYSIS_SLUG env var to override per-strategy slug', () => {
    // Analysis output lives under the derived multi-type slug
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking-week-ahead', {
      manifest: { date: '2026-04-06', overallConfidence: 'medium' },
      files: {
        classification: {
          'significance-classification.md':
            '---\nmethod: significance-classification\n---\n\n# Sig\n\nImportant findings.',
        },
      },
    });

    // Without env var, 'breaking' slug fails (dir doesn't exist)
    expect(loadAnalysisContext('2026-04-06', 'breaking', tmpDir)).toBeNull();

    // With env var set to the derived slug, it resolves
    process.env['EP_ANALYSIS_SLUG'] = 'breaking-week-ahead';
    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.files.has('significance-classification')).toBe(true);
  });

  it('prefers explicit non-default baseDir over EP_ANALYSIS_DIR env var', () => {
    // Set env var to a non-existent dir
    process.env['EP_ANALYSIS_DIR'] = '/nonexistent/dir';

    createAnalysisDir(tmpDir, '2026-04-06', 'breaking', {
      manifest: { date: '2026-04-06', overallConfidence: 'high' },
    });

    // Explicit baseDir should take precedence
    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
  });

  it('returns null when the slug directory does not exist', () => {
    fs.mkdirSync(path.join(tmpDir, '2026-04-06'), { recursive: true });
    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).toBeNull();
  });

  it('returns null when directory exists but has no manifest or files', () => {
    fs.mkdirSync(path.join(tmpDir, '2026-04-06', 'breaking'), { recursive: true });
    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).toBeNull();
  });

  it('loads manifest.json from the analysis directory', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking', {
      manifest: {
        runId: 'test-123',
        date: '2026-04-06',
        overallConfidence: 'high',
        methods: [],
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.date).toBe('2026-04-06');
    expect(ctx.manifest).not.toBeNull();
    expect(ctx.manifest.runId).toBe('test-123');
    expect(ctx.overallConfidence).toBe('high');
  });

  it('loads analysis markdown files from subdirectories', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking', {
      manifest: { date: '2026-04-06', overallConfidence: 'medium' },
      files: {
        classification: {
          'significance-classification.md':
            '---\nmethod: significance-classification\n---\n\n# Significance Classification\n\nThis analysis finds significant political shifts.',
        },
        'risk-scoring': {
          'risk-matrix.md':
            '---\nmethod: risk-matrix\n---\n\n# Risk Matrix\n\nOverall risk level is moderate with key drivers in climate policy.',
        },
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.files.size).toBe(2);
    expect(ctx.files.has('significance-classification')).toBe(true);
    expect(ctx.files.has('risk-matrix')).toBe(true);

    const sigFile = ctx.files.get('significance-classification');
    expect(sigFile.subdir).toBe('classification');
    expect(sigFile.content).toContain('Significance Classification');
  });

  it('finds suffixed directories (e.g. breaking-2)', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking-2', {
      manifest: { date: '2026-04-06', overallConfidence: 'low' },
      files: {
        existing: {
          'deep-analysis.md': '# Deep Analysis\n\nSample analysis content.',
        },
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.overallConfidence).toBe('low');
    expect(ctx.files.has('deep-analysis')).toBe(true);
  });

  it('picks the highest-suffixed directory when multiple exist', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking', {
      manifest: { date: '2026-04-06', overallConfidence: 'low' },
    });
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking-2', {
      manifest: { date: '2026-04-06', overallConfidence: 'medium' },
    });
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking-3', {
      manifest: { date: '2026-04-06', overallConfidence: 'high' },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.overallConfidence).toBe('high');
  });

  it('returns context even with only files and no manifest', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'week-ahead', {
      files: {
        classification: {
          'forces-analysis.md': '# Forces Analysis\n\nKey forces identified.',
        },
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'week-ahead', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.manifest).toBeNull();
    expect(ctx.files.has('forces-analysis')).toBe(true);
  });

  it('ignores non-.md files in subdirectories', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'motions', {
      files: {
        classification: {
          'significance-classification.md': '# Significance\n\nContent.',
          'data-cache.json': '{}',
          'notes.txt': 'Some notes',
        },
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'motions', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.files.size).toBe(1);
    expect(ctx.files.has('significance-classification')).toBe(true);
  });

  it('handles corrupted manifest.json gracefully', () => {
    const analysisDir = path.join(tmpDir, '2026-04-06', 'breaking');
    fs.mkdirSync(analysisDir, { recursive: true });
    fs.writeFileSync(path.join(analysisDir, 'manifest.json'), 'not valid json{{{');
    const classDir = path.join(analysisDir, 'classification');
    fs.mkdirSync(classDir, { recursive: true });
    fs.writeFileSync(
      path.join(classDir, 'significance-classification.md'),
      '# Test\n\nContent.'
    );

    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.manifest).toBeNull();
    expect(ctx.files.size).toBe(1);
  });

  it('keys files by frontmatter method when filename differs (coalition-dynamics.md → coalition-analysis)', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking', {
      manifest: { date: '2026-04-06', overallConfidence: 'medium' },
      files: {
        existing: {
          'coalition-dynamics.md':
            '---\nmethod: coalition-analysis\ndate: 2026-04-06\nconfidence: medium\n---\n\n# Coalition Dynamics\n\nCoalition alignment analysis reveals shifting alliances.',
        },
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    // Primary key is the frontmatter method, not the filename
    expect(ctx.files.has('coalition-analysis')).toBe(true);
    // Filename-derived alias is also registered for backward compatibility
    expect(ctx.files.has('coalition-dynamics')).toBe(true);
    // Both entries point to the same content
    const fromMethod = ctx.files.get('coalition-analysis');
    const fromFilename = ctx.files.get('coalition-dynamics');
    expect(fromMethod.method).toBe('coalition-analysis');
    expect(fromFilename.method).toBe('coalition-analysis');
    expect(fromMethod.content).toContain('Coalition Dynamics');
  });

  it('keys files by frontmatter method for stakeholder-impact.md → stakeholder-analysis', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'committee-reports', {
      manifest: { date: '2026-04-06', overallConfidence: 'high' },
      files: {
        existing: {
          'stakeholder-impact.md':
            '---\nmethod: stakeholder-analysis\ndate: 2026-04-06\nconfidence: high\n---\n\n# Stakeholder Impact\n\nKey stakeholders include national delegations.',
        },
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'committee-reports', tmpDir);
    expect(ctx).not.toBeNull();
    // Lookup by frontmatter method ID
    expect(ctx.files.has('stakeholder-analysis')).toBe(true);
    // Lookup by filename alias
    expect(ctx.files.has('stakeholder-impact')).toBe(true);
    expect(ctx.files.get('stakeholder-analysis').method).toBe('stakeholder-analysis');
  });

  it('falls back to filename key when frontmatter has no method field', () => {
    createAnalysisDir(tmpDir, '2026-04-06', 'breaking', {
      files: {
        existing: {
          'deep-analysis.md': '# Deep Analysis\n\nAnalysis without frontmatter.',
        },
      },
    });

    const ctx = loadAnalysisContext('2026-04-06', 'breaking', tmpDir);
    expect(ctx).not.toBeNull();
    expect(ctx.files.has('deep-analysis')).toBe(true);
    expect(ctx.files.get('deep-analysis').method).toBe('deep-analysis');
  });
});

// ─── extractFrontmatterMethod tests ──────────────────────────────────────────

describe('extractFrontmatterMethod', () => {
  it('extracts method from valid frontmatter', () => {
    const content = '---\nmethod: coalition-analysis\ndate: 2026-04-06\n---\n\n# Heading';
    expect(extractFrontmatterMethod(content)).toBe('coalition-analysis');
  });

  it('returns null when no frontmatter present', () => {
    expect(extractFrontmatterMethod('# Just a heading\n\nBody text.')).toBeNull();
  });

  it('returns null when frontmatter has no method field', () => {
    const content = '---\ndate: 2026-04-06\nconfidence: high\n---\n\n# Heading';
    expect(extractFrontmatterMethod(content)).toBeNull();
  });

  it('returns null for empty content', () => {
    expect(extractFrontmatterMethod('')).toBeNull();
  });

  it('handles method with extra whitespace', () => {
    const content = '---\nmethod:   stakeholder-analysis  \ndate: 2026-04-06\n---\n\n# Heading';
    expect(extractFrontmatterMethod(content)).toBe('stakeholder-analysis');
  });

  it('returns null for unclosed frontmatter', () => {
    const content = '---\nmethod: risk-matrix\ndate: 2026-04-06\n# No closing delimiter';
    expect(extractFrontmatterMethod(content)).toBeNull();
  });
});

// ─── extractAnalysisSummary tests ────────────────────────────────────────────

describe('extractAnalysisSummary', () => {
  it('extracts first paragraph from markdown content', () => {
    const content = '# Heading\n\nFirst paragraph with key findings.\n\nSecond paragraph.';
    expect(extractAnalysisSummary(content)).toBe('First paragraph with key findings.');
  });

  it('strips YAML frontmatter', () => {
    const content =
      '---\nmethod: risk-matrix\ndate: 2026-04-06\n---\n\n# Risk Matrix\n\nRisk level is moderate.';
    expect(extractAnalysisSummary(content)).toBe('Risk level is moderate.');
  });

  it('truncates long summaries to maxLength', () => {
    const longContent = '# Heading\n\n' + 'A'.repeat(600);
    const summary = extractAnalysisSummary(longContent, 100);
    expect(summary.length).toBeLessThanOrEqual(100);
    expect(summary).toContain('...');
  });

  it('returns empty string for empty content', () => {
    expect(extractAnalysisSummary('')).toBe('');
  });

  it('returns empty string for content with only headings', () => {
    expect(extractAnalysisSummary('# Heading\n## Subheading\n### Sub-sub')).toBe('');
  });

  it('handles content without frontmatter', () => {
    const content = 'Some immediate content without frontmatter.';
    expect(extractAnalysisSummary(content)).toBe(
      'Some immediate content without frontmatter.'
    );
  });
});

// ─── buildAnalysisInsightsSection tests ──────────────────────────────────────

describe('buildAnalysisInsightsSection', () => {
  it('returns empty string for null context', () => {
    expect(buildAnalysisInsightsSection(null, ['risk-matrix'], 'en')).toBe('');
  });

  it('returns empty string for undefined context', () => {
    expect(buildAnalysisInsightsSection(undefined, ['risk-matrix'], 'en')).toBe('');
  });

  it('returns empty string when no relevant methods have files', () => {
    const ctx = {
      date: '2026-04-06',
      analysisDir: '/tmp/test',
      manifest: null,
      overallConfidence: null,
      files: new Map(),
    };
    expect(buildAnalysisInsightsSection(ctx, ['risk-matrix'], 'en')).toBe('');
  });

  it('builds HTML section when relevant methods have files', () => {
    const files = new Map();
    files.set('risk-matrix', {
      method: 'risk-matrix',
      subdir: 'risk-scoring',
      content: '---\nmethod: risk-matrix\n---\n\n# Risk Matrix\n\nOverall risk is moderate.',
      filePath: '/tmp/test/risk-scoring/risk-matrix.md',
    });

    const ctx = {
      date: '2026-04-06',
      analysisDir: '/tmp/test',
      manifest: null,
      overallConfidence: 'medium',
      files,
    };

    const html = buildAnalysisInsightsSection(ctx, ['risk-matrix', 'deep-analysis'], 'en');
    expect(html).toContain('analysis-pipeline-insights');
    expect(html).toContain('Analysis Pipeline Insights');
    expect(html).toContain('confidence-badge');
    expect(html).toContain('medium');
    expect(html).toContain('Risk Matrix');
    expect(html).toContain('risk is moderate');
    expect(html).toContain('data-method="risk-matrix"');
    // Accessibility: role, aria-label, h2 heading level
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Analysis Pipeline Insights"');
    expect(html).toContain('<h2>');
  });

  it('only includes methods that have loaded files', () => {
    const files = new Map();
    files.set('deep-analysis', {
      method: 'deep-analysis',
      subdir: 'existing',
      content: '# Deep Analysis\n\nKey findings from deep analysis.',
      filePath: '/tmp/test/existing/deep-analysis.md',
    });

    const ctx = {
      date: '2026-04-06',
      analysisDir: '/tmp/test',
      manifest: null,
      overallConfidence: null,
      files,
    };

    const html = buildAnalysisInsightsSection(
      ctx,
      ['risk-matrix', 'deep-analysis', 'voting-patterns'],
      'en'
    );
    expect(html).toContain('deep-analysis');
    expect(html).not.toContain('risk-matrix');
    expect(html).not.toContain('voting-patterns');
  });

  it('omits confidence badge when overallConfidence is null', () => {
    const files = new Map();
    files.set('deep-analysis', {
      method: 'deep-analysis',
      subdir: 'existing',
      content: '# Deep Analysis\n\nFindings.',
      filePath: '/tmp/test/existing/deep-analysis.md',
    });

    const ctx = {
      date: '2026-04-06',
      analysisDir: '/tmp/test',
      manifest: null,
      overallConfidence: null,
      files,
    };

    const html = buildAnalysisInsightsSection(ctx, ['deep-analysis'], 'en');
    expect(html).not.toContain('confidence-badge');
  });

  it('uses localized heading for non-English languages', () => {
    const files = new Map();
    files.set('deep-analysis', {
      method: 'deep-analysis',
      subdir: 'existing',
      content: '# Deep Analysis\n\nFindings.',
      filePath: '/tmp/test/existing/deep-analysis.md',
    });

    const ctx = {
      date: '2026-04-06',
      analysisDir: '/tmp/test',
      manifest: null,
      overallConfidence: null,
      files,
    };

    const htmlDe = buildAnalysisInsightsSection(ctx, ['deep-analysis'], 'de');
    expect(htmlDe).toContain('Erkenntnisse der Analysepipeline');
    expect(htmlDe).not.toContain('Analysis Pipeline Insights');

    const htmlFr = buildAnalysisInsightsSection(ctx, ['deep-analysis'], 'fr');
    expect(htmlFr).toContain('pipeline d\u2019analyse');
  });
});

// ─── Strategy analysis context integration tests ─────────────────────────────

describe('Strategy analysis context integration', () => {
  it('BreakingNewsStrategy: buildContent includes analysis insights when context is present', () => {
    const files = new Map();
    files.set('risk-matrix', {
      method: 'risk-matrix',
      subdir: 'risk-scoring',
      content: '# Risk Matrix\n\nBreaking news risk assessment reveals moderate overall risk.',
      filePath: '/tmp/test/risk-scoring/risk-matrix.md',
    });

    const dataWithContext = {
      ...breakingNewsData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: 'high',
        files,
      },
    };

    const strategy = new BreakingNewsStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
    expect(content).toContain('risk assessment');
  });

  it('BreakingNewsStrategy: buildContent works without analysis context', () => {
    const strategy = new BreakingNewsStrategy();
    const content = strategy.buildContent(breakingNewsData, 'en');
    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(0);
    expect(content).not.toContain('analysis-pipeline-insights');
  });

  it('WeekAheadStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('significance-classification', {
      method: 'significance-classification',
      subdir: 'classification',
      content: '# Significance\n\nUpcoming week shows high significance events.',
      filePath: '/tmp/test/classification/significance-classification.md',
    });

    const dataWithContext = {
      ...weekAheadData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: 'medium',
        files,
      },
    };

    const strategy = new WeekAheadStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
  });

  it('CommitteeReportsStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('stakeholder-analysis', {
      method: 'stakeholder-analysis',
      subdir: 'existing',
      content: '# Stakeholder Impact\n\nKey stakeholders affected by committee decisions.',
      filePath: '/tmp/test/existing/stakeholder-impact.md',
    });

    const dataWithContext = {
      ...committeeReportsData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: null,
        files,
      },
    };

    const strategy = new CommitteeReportsStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
    expect(content).toContain('Stakeholder Analysis');
  });

  it('MotionsStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('political-threat-landscape', {
      method: 'political-threat-landscape',
      subdir: 'threat-assessment',
      content: '# Political Threat Landscape\n\nThreat assessment for motions period.',
      filePath: '/tmp/test/threat-assessment/political-threat-landscape.md',
    });

    const dataWithContext = {
      ...motionsData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: null,
        files,
      },
    };

    const strategy = new MotionsStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
  });

  it('PropositionsStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('legislative-velocity-risk', {
      method: 'legislative-velocity-risk',
      subdir: 'risk-scoring',
      content: '# Legislative Velocity Risk\n\nPipeline velocity analysis shows moderate risk.',
      filePath: '/tmp/test/risk-scoring/legislative-velocity-risk.md',
    });

    const dataWithContext = {
      ...propositionsData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: null,
        files,
      },
    };

    const strategy = new PropositionsStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
  });

  it('WeeklyReviewStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('synthesis-summary', {
      method: 'synthesis-summary',
      subdir: 'existing',
      content: '# Synthesis Summary\n\nWeekly synthesis of parliamentary activities.',
      filePath: '/tmp/test/existing/synthesis-summary.md',
    });

    const dataWithContext = {
      ...weeklyReviewData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: null,
        files,
      },
    };

    const strategy = new WeeklyReviewStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
  });

  it('MonthlyReviewStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('synthesis-summary', {
      method: 'synthesis-summary',
      subdir: 'existing',
      content: '# Synthesis Summary\n\nMonthly synthesis of parliamentary activities.',
      filePath: '/tmp/test/existing/synthesis-summary.md',
    });

    const dataWithContext = {
      ...monthlyReviewData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: null,
        files,
      },
    };

    const strategy = new MonthlyReviewStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
  });

  it('MonthAheadStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('significance-classification', {
      method: 'significance-classification',
      subdir: 'classification',
      content: '# Significance\n\nMonth ahead significance assessment.',
      filePath: '/tmp/test/classification/significance-classification.md',
    });

    const dataWithContext = {
      ...monthAheadData,
      analysisContext: {
        date: '2026-04-06',
        analysisDir: '/tmp/test',
        manifest: null,
        overallConfidence: null,
        files,
      },
    };

    const strategy = new MonthAheadStrategy();
    const content = strategy.buildContent(dataWithContext, 'en');
    expect(content).toContain('analysis-pipeline-insights');
  });

  it('all strategies degrade gracefully with null analysisContext', () => {
    const strategies = [
      { strategy: new BreakingNewsStrategy(), data: breakingNewsData },
      { strategy: new WeekAheadStrategy(), data: weekAheadData },
      { strategy: new CommitteeReportsStrategy(), data: committeeReportsData },
      { strategy: new MotionsStrategy(), data: motionsData },
      { strategy: new PropositionsStrategy(), data: propositionsData },
      { strategy: new WeeklyReviewStrategy(), data: weeklyReviewData },
      { strategy: new MonthlyReviewStrategy(), data: monthlyReviewData },
      { strategy: new MonthAheadStrategy(), data: monthAheadData },
    ];

    for (const { strategy, data } of strategies) {
      const content = strategy.buildContent(data, 'en');
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
      expect(content).not.toContain('analysis-pipeline-insights');
    }
  });
});
