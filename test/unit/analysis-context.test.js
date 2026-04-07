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
  isScaffoldContent,
  hasSubstantiveAIContent,
  extractAnalysisParagraphs,
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

  it('skips mermaid code blocks', () => {
    const content = '# Analysis\n\n```mermaid\npie title Test\n"A" : 50\n```\n\nActual prose analysis of political dynamics and coalition behavior patterns.';
    const summary = extractAnalysisSummary(content);
    expect(summary).not.toContain('mermaid');
    expect(summary).not.toContain('pie title');
    expect(summary).toContain('Actual prose analysis');
  });

  it('skips table rows', () => {
    const content = '# Analysis\n\n| Header | Value |\n|--------|-------|\n| A | B |\n\nSubstantive analytical findings from the assessment.';
    const summary = extractAnalysisSummary(content);
    expect(summary).not.toContain('Header');
    expect(summary).toContain('Substantive analytical findings');
  });

  it('skips table rows without trailing pipe', () => {
    const content = '# Analysis\n\n| Header | Value\n|--------|-------\n| A | B\n\nSubstantive analytical findings from the assessment.';
    const summary = extractAnalysisSummary(content);
    expect(summary).not.toContain('Header');
    expect(summary).toContain('Substantive analytical findings');
  });

  it('returns empty for scaffold content with TO BE FILLED markers', () => {
    const content = '# Analysis\n\n[TO BE FILLED BY AI AGENT — analysis pending]\n\nSome content.';
    expect(extractAnalysisSummary(content)).toBe('');
  });

  it('strips bold markdown formatting', () => {
    const content = '# Analysis\n\nThe **overall risk** is moderate across member states.';
    const summary = extractAnalysisSummary(content);
    expect(summary).toContain('overall risk');
    expect(summary).not.toContain('**');
  });
});

// ─── isScaffoldContent tests ─────────────────────────────────────────────────

describe('isScaffoldContent', () => {
  it('detects TO BE FILLED BY AI AGENT marker', () => {
    expect(isScaffoldContent('[TO BE FILLED BY AI AGENT — placeholder]')).toBe(true);
  });

  it('detects AI_ANALYSIS_REQUIRED marker', () => {
    expect(isScaffoldContent('Some text [AI_ANALYSIS_REQUIRED] more text')).toBe(true);
  });

  it('detects REQUIRED marker', () => {
    expect(isScaffoldContent('Content with [REQUIRED] fields')).toBe(true);
  });

  it('detects Instructions for AI Agent prompt', () => {
    expect(isScaffoldContent('Instructions for AI Agent (Opus 4.6): do analysis')).toBe(true);
  });

  it('detects quality gate markers', () => {
    expect(isScaffoldContent('Quality gate: minimum 500 words of analytical prose')).toBe(true);
  });

  it('returns false for substantive content', () => {
    expect(isScaffoldContent('The European Parliament adopted 18 texts on banking reform.')).toBe(false);
  });

  it('returns false for empty content', () => {
    expect(isScaffoldContent('')).toBe(false);
  });
});

// ─── hasSubstantiveAIContent tests ───────────────────────────────────────────

describe('hasSubstantiveAIContent', () => {
  it('returns true for content with substantive prose', () => {
    expect(hasSubstantiveAIContent('# Analysis\n\nThe parliament adopted significant banking reform legislation that affects member states.')).toBe(true);
  });

  it('returns false for scaffold content', () => {
    expect(hasSubstantiveAIContent('[TO BE FILLED BY AI AGENT — pending analysis]')).toBe(false);
  });

  it('returns false for content with only headings and tables', () => {
    expect(hasSubstantiveAIContent('# Title\n\n| A | B |\n|---|---|\n| 1 | 2 |')).toBe(false);
  });

  it('counts words excluding headings, tables, and blockquotes', () => {
    const content = '# Title\n\n> Blockquote instruction\n\nReal prose content here about the analysis results.';
    expect(hasSubstantiveAIContent(content)).toBe(true);
  });
});

// ─── extractAnalysisParagraphs tests ─────────────────────────────────────────

describe('extractAnalysisParagraphs', () => {
  it('extracts multiple paragraphs from analysis content', () => {
    const content = '# Analysis\n\nFirst paragraph with detailed analysis of parliamentary developments and coalition dynamics.\n\nSecond paragraph with additional findings about legislative procedures and policy outcomes across the EU.';
    const paragraphs = extractAnalysisParagraphs(content);
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0]).toContain('First paragraph');
    expect(paragraphs[1]).toContain('Second paragraph');
  });

  it('returns empty array for scaffold content', () => {
    expect(extractAnalysisParagraphs('[TO BE FILLED BY AI AGENT — pending]')).toEqual([]);
  });

  it('respects maxParagraphs limit', () => {
    const content = '# A\n\nParagraph one with sufficient length content for testing purposes here.\n\nParagraph two with sufficient length content for testing purposes here.\n\nParagraph three with sufficient length content for testing purposes here.';
    const paragraphs = extractAnalysisParagraphs(content, 2);
    expect(paragraphs.length).toBeLessThanOrEqual(2);
  });

  it('skips mermaid blocks and tables', () => {
    const content = '# Analysis\n\n```mermaid\npie\n```\n\n| A | B |\n|---|---|\n\nSubstantive analysis paragraph with real political intelligence about coalition dynamics.';
    const paragraphs = extractAnalysisParagraphs(content);
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0]).toContain('Substantive analysis');
  });

  it('truncates overlong first paragraph instead of returning empty', () => {
    const longParagraph = 'A'.repeat(200) + ' substantive political analysis content here.';
    const content = '# Analysis\n\n' + longParagraph;
    const paragraphs = extractAnalysisParagraphs(content, 3, 100);
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0].length).toBeLessThanOrEqual(100);
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
      content: '---\nmethod: risk-matrix\n---\n\n# Risk Matrix\n\nOverall risk is moderate based on the assessment of current parliamentary activity, including adopted texts and ongoing legislative procedures affecting EU member states.',
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
      content: '# Deep Analysis\n\nKey findings from deep analysis indicate significant political shifts in the European Parliament coalition dynamics affecting legislative outcomes across member states.',
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

  it('filters out scaffold/placeholder content from insights', () => {
    const files = new Map();
    files.set('deep-analysis', {
      method: 'deep-analysis',
      subdir: 'existing',
      content: '# Deep Analysis\n\n[TO BE FILLED BY AI AGENT — minimum 500 words of original analytical prose with evidence citations.]',
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
    expect(html).toBe('');
  });

  it('omits confidence badge when overallConfidence is null', () => {
    const files = new Map();
    files.set('deep-analysis', {
      method: 'deep-analysis',
      subdir: 'existing',
      content: '# Deep Analysis\n\nDetailed findings from deep political analysis of European Parliament activity and legislative developments.',
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
      content: '# Deep Analysis\n\nDetailed findings from deep political analysis of European Parliament activity and legislative developments.',
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
      content: '# Risk Matrix\n\nBreaking news risk assessment reveals moderate overall risk based on analysis of parliamentary activity, including adopted texts and ongoing legislative procedures.',
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

  it('BreakingNewsStrategy: enriches deep-analysis section with AI content from analysisContext', () => {
    const files = new Map();
    files.set('deep-analysis', {
      method: 'deep-analysis',
      subdir: 'intelligence',
      content:
        '# Deep Analysis\n\nThe European Parliament plenary session revealed significant cross-party coalition shifts driven by disagreements over the Green Deal legislative package and its economic implications for member states.',
      filePath: '/tmp/test/intelligence/deep-analysis.md',
    });
    files.set('synthesis-summary', {
      method: 'synthesis-summary',
      subdir: 'intelligence',
      content:
        '# Synthesis Summary\n\nOverall parliamentary dynamics indicate growing fragmentation as the EPP and S&D struggle to maintain their traditional grand coalition on key environmental and digital policy votes.',
      filePath: '/tmp/test/intelligence/synthesis-summary.md',
    });
    files.set('coalition-analysis', {
      method: 'coalition-analysis',
      subdir: 'intelligence',
      content:
        '# Coalition Analysis\n\nRenew Europe has emerged as the decisive swing group with increasing leverage in trilogue negotiations, particularly on digital markets regulation and AI governance frameworks.',
      filePath: '/tmp/test/intelligence/coalition-analysis.md',
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

    // Deep analysis section should contain AI-produced content
    expect(content).toContain('deep-analysis');
    expect(content).toContain('cross-party coalition shifts');
    // Outlook should use coalition-analysis AI content
    expect(content).toContain('Renew Europe');
  });

  it('BreakingNewsStrategy: scaffold analysis files do not override deep-analysis fields', () => {
    const files = new Map();
    files.set('deep-analysis', {
      method: 'deep-analysis',
      subdir: 'intelligence',
      content: '# Deep Analysis\n\n[TO BE FILLED BY AI AGENT]\n\n[AI_ANALYSIS_REQUIRED]',
      filePath: '/tmp/test/intelligence/deep-analysis.md',
    });
    files.set('synthesis-summary', {
      method: 'synthesis-summary',
      subdir: 'intelligence',
      content: '# Synthesis\n\n[REQUIRED]: Analysis pending.',
      filePath: '/tmp/test/intelligence/synthesis-summary.md',
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

    // Scaffold placeholders should NOT appear in the rendered HTML
    expect(content).not.toContain('TO BE FILLED BY AI AGENT');
    expect(content).not.toContain('AI_ANALYSIS_REQUIRED');
  });

  it('WeekAheadStrategy: buildContent includes insights when context is present', () => {
    const files = new Map();
    files.set('significance-classification', {
      method: 'significance-classification',
      subdir: 'classification',
      content: '# Significance\n\nUpcoming week shows high significance events based on scheduled plenary sessions and committee meetings affecting EU legislative priorities.',
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
      content: '# Stakeholder Impact\n\nKey stakeholders affected by committee decisions include political groups, civil society organizations, and national governments across EU member states.',
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
      content: '# Political Threat Landscape\n\nThreat assessment for motions period reveals evolving political dynamics with coalition stress points and shifting group alignments across policy domains.',
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
      content: '# Legislative Velocity Risk\n\nPipeline velocity analysis shows moderate risk with significant legislative backlog affecting committee schedules and plenary timelines.',
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
      content: '# Synthesis Summary\n\nWeekly synthesis of parliamentary activities reveals continued legislative momentum across key policy domains with notable coalition dynamics.',
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
      content: '# Synthesis Summary\n\nMonthly synthesis of parliamentary activities shows overall legislative progress with significant policy developments across economic and social domains.',
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
      content: '# Significance\n\nMonth ahead significance assessment indicates multiple high-priority legislative procedures and committee deliberations that will shape EU policy direction.',
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
