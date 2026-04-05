// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for generators/synthesis-summary module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  parseFrontmatter,
  aggregateSWOT,
  aggregateRisks,
  extractSummaryLine,
  aggregateConfidence,
  findMarkdownFiles,
  generateEditorialRecommendations,
  buildSynthesisSummary,
  formatSynthesisMarkdown,
} from '../../scripts/generators/synthesis-summary.js';

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Create a temporary directory for test files */
function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synthesis-test-'));
}

/** Write a test analysis markdown file with frontmatter */
function writeAnalysisFile(dir, filename, method, confidence, body = '') {
  const subdir = path.join(dir, 'existing');
  fs.mkdirSync(subdir, { recursive: true });
  const content = `---
method: ${method}
date: 2026-03-30
confidence: ${confidence}
generated: 2026-03-30T10:00:00Z
---

# ${method} Analysis

${body}
`;
  fs.writeFileSync(path.join(subdir, filename), content, 'utf-8');
}

/** Recursively remove a directory */
function removeTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ─── parseFrontmatter ────────────────────────────────────────────────────────

describe('parseFrontmatter', () => {
  it('parses valid frontmatter with all fields', () => {
    const content = `---
method: deep-analysis
date: 2026-03-30
confidence: high
generated: 2026-03-30T10:00:00Z
---

# Some Analysis
`;
    const result = parseFrontmatter(content);
    expect(result).not.toBeNull();
    expect(result?.method).toBe('deep-analysis');
    expect(result?.confidence).toBe('high');
    expect(result?.date).toBe('2026-03-30');
  });

  it('returns null for content without frontmatter', () => {
    expect(parseFrontmatter('# Just a heading')).toBeNull();
    expect(parseFrontmatter('')).toBeNull();
  });

  it('defaults to low confidence for unknown values', () => {
    const content = `---
method: test
confidence: unknown
---
`;
    const result = parseFrontmatter(content);
    expect(result?.confidence).toBe('low');
  });

  it('handles missing confidence field', () => {
    const content = `---
method: test
date: 2026-03-30
---
`;
    const result = parseFrontmatter(content);
    expect(result?.confidence).toBe('low');
  });

  it('handles missing method field', () => {
    const content = `---
date: 2026-03-30
confidence: medium
---
`;
    const result = parseFrontmatter(content);
    expect(result?.method).toBe('unknown');
  });
});

// ─── aggregateSWOT ───────────────────────────────────────────────────────────

describe('aggregateSWOT', () => {
  it('counts zero for empty text', () => {
    const result = aggregateSWOT('');
    expect(result.strengths).toBe(0);
    expect(result.weaknesses).toBe(0);
    expect(result.opportunities).toBe(0);
    expect(result.threats).toBe(0);
  });

  it('counts SWOT keyword mentions', () => {
    const text = `
      Strength: The coalition is strong. Another strength is unity.
      Weakness: Budget constraints. Additional weakness in oversight.
      Opportunity for reform. Great opportunities ahead.
      Threat to stability. Multiple threats detected.
    `;
    const result = aggregateSWOT(text);
    expect(result.strengths).toBe(2);
    expect(result.weaknesses).toBe(2);
    expect(result.opportunities).toBe(2);
    expect(result.threats).toBe(2);
  });

  it('handles case insensitivity', () => {
    const text = 'STRENGTH Strength strength';
    const result = aggregateSWOT(text);
    expect(result.strengths).toBe(3);
  });
});

// ─── aggregateRisks ──────────────────────────────────────────────────────────

describe('aggregateRisks', () => {
  it('counts zero for empty text', () => {
    const result = aggregateRisks('');
    expect(result.critical).toBe(0);
    expect(result.high).toBe(0);
    expect(result.medium).toBe(0);
    expect(result.low).toBe(0);
  });

  it('counts risk-level mentions', () => {
    const text = `
      This is a critical vulnerability.
      High-risk situation detected. Another high risk item.
      Medium-risk assessment. Medium risk noted.
      Low-risk observation.
    `;
    const result = aggregateRisks(text);
    expect(result.critical).toBe(1);
    expect(result.high).toBe(2);
    expect(result.medium).toBe(2);
    expect(result.low).toBe(1);
  });
});

// ─── extractSummaryLine ──────────────────────────────────────────────────────

describe('extractSummaryLine', () => {
  it('extracts the first heading from markdown', () => {
    const content = `---
method: test
---

# My Analysis Heading

Some body text.
`;
    expect(extractSummaryLine(content)).toBe('My Analysis Heading');
  });

  it('falls back to first non-empty line when no heading', () => {
    const content = `---
method: test
---

This is the first paragraph.
`;
    expect(extractSummaryLine(content)).toBe('This is the first paragraph.');
  });

  it('returns default message for empty content', () => {
    expect(extractSummaryLine('')).toBe('No summary available');
  });

  it('skips table rows and code block delimiters', () => {
    const content = `---
method: test
---

| header | header |
Actual content here.
`;
    expect(extractSummaryLine(content)).toBe('Actual content here.');
  });
});

// ─── aggregateConfidence ─────────────────────────────────────────────────────

describe('aggregateConfidence', () => {
  it('returns low for empty findings array', () => {
    expect(aggregateConfidence([])).toBe('low');
  });

  it('returns high when majority is high confidence', () => {
    const findings = [
      { method: 'a', file: 'a.md', confidence: 'high', summary: '' },
      { method: 'b', file: 'b.md', confidence: 'high', summary: '' },
      { method: 'c', file: 'c.md', confidence: 'low', summary: '' },
    ];
    expect(aggregateConfidence(findings)).toBe('high');
  });

  it('returns medium when majority is medium confidence', () => {
    const findings = [
      { method: 'a', file: 'a.md', confidence: 'medium', summary: '' },
      { method: 'b', file: 'b.md', confidence: 'medium', summary: '' },
      { method: 'c', file: 'c.md', confidence: 'low', summary: '' },
    ];
    expect(aggregateConfidence(findings)).toBe('medium');
  });

  it('returns low when majority is low confidence', () => {
    const findings = [
      { method: 'a', file: 'a.md', confidence: 'low', summary: '' },
      { method: 'b', file: 'b.md', confidence: 'low', summary: '' },
      { method: 'c', file: 'c.md', confidence: 'high', summary: '' },
    ];
    expect(aggregateConfidence(findings)).toBe('low');
  });
});

// ─── findMarkdownFiles ───────────────────────────────────────────────────────

describe('findMarkdownFiles', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('returns empty array for non-existent directory', () => {
    expect(findMarkdownFiles('/tmp/does-not-exist-9999')).toEqual([]);
  });

  it('returns empty array for empty directory', () => {
    expect(findMarkdownFiles(tempDir)).toEqual([]);
  });

  it('finds markdown files in nested directories', () => {
    const subdir = path.join(tempDir, 'sub');
    fs.mkdirSync(subdir);
    fs.writeFileSync(path.join(tempDir, 'root.md'), '# Root');
    fs.writeFileSync(path.join(subdir, 'nested.md'), '# Nested');
    fs.writeFileSync(path.join(subdir, 'other.txt'), 'Not markdown');

    const files = findMarkdownFiles(tempDir);
    expect(files).toHaveLength(2);
    expect(files.some((f) => f.endsWith('root.md'))).toBe(true);
    expect(files.some((f) => f.endsWith('nested.md'))).toBe(true);
  });
});

// ─── generateEditorialRecommendations ────────────────────────────────────────

describe('generateEditorialRecommendations', () => {
  it('recommends pipeline verification for empty findings', () => {
    const recs = generateEditorialRecommendations(
      [],
      { strengths: 0, weaknesses: 0, opportunities: 0, threats: 0 },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0]).toContain('No analysis files');
  });

  it('mentions high-confidence findings when present', () => {
    const findings = [
      { method: 'test', file: 'test.md', confidence: 'high', summary: 'Test' },
    ];
    const recs = generateEditorialRecommendations(
      findings,
      { strengths: 1, weaknesses: 1, opportunities: 1, threats: 1 },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );
    expect(recs.some((r) => r.includes('high-confidence'))).toBe(true);
  });

  it('flags critical risk mentions', () => {
    const findings = [
      { method: 'test', file: 'test.md', confidence: 'medium', summary: 'Test' },
    ];
    const recs = generateEditorialRecommendations(
      findings,
      { strengths: 0, weaknesses: 0, opportunities: 0, threats: 0 },
      { critical: 3, high: 0, medium: 0, low: 0 }
    );
    expect(recs.some((r) => r.includes('critical-risk'))).toBe(true);
  });

  it('warns about threat-heavy SWOT balance', () => {
    const findings = [
      { method: 'test', file: 'test.md', confidence: 'medium', summary: 'Test' },
    ];
    const recs = generateEditorialRecommendations(
      findings,
      { strengths: 1, weaknesses: 1, opportunities: 1, threats: 10 },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );
    expect(recs.some((r) => r.includes('Threat-heavy'))).toBe(true);
  });
});

// ─── buildSynthesisSummary ───────────────────────────────────────────────────

describe('buildSynthesisSummary', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(tempDir);
  });

  it('handles empty directory gracefully', () => {
    const summary = buildSynthesisSummary(tempDir, '2026-03-30');
    expect(summary.documentsAnalyzed).toBe(0);
    expect(summary.topFindings).toHaveLength(0);
    expect(summary.overallConfidence).toBe('low');
    expect(summary.synthesisId).toMatch(/^SYN-2026-03-30-[A-Z0-9]{8}$/);
  });

  it('processes analysis files and produces summary', () => {
    writeAnalysisFile(tempDir, 'deep-analysis.md', 'deep-analysis', 'high',
      'Strength in coalition. Threat to stability. Critical vulnerability detected.');
    writeAnalysisFile(tempDir, 'risk-matrix.md', 'risk-matrix', 'medium',
      'Medium-risk assessment. Opportunity for reform.');

    const summary = buildSynthesisSummary(tempDir, '2026-03-30');
    expect(summary.documentsAnalyzed).toBe(2);
    expect(summary.topFindings.length).toBeGreaterThanOrEqual(2);
    expect(summary.swot.strengths).toBeGreaterThanOrEqual(1);
    expect(summary.swot.threats).toBeGreaterThanOrEqual(1);
    expect(summary.riskOverview.critical).toBeGreaterThanOrEqual(1);
  });

  it('ranks high-confidence findings first', () => {
    writeAnalysisFile(tempDir, 'low.md', 'low-method', 'low', 'Low confidence analysis.');
    writeAnalysisFile(tempDir, 'high.md', 'high-method', 'high', 'High confidence analysis.');

    const summary = buildSynthesisSummary(tempDir, '2026-03-30');
    expect(summary.topFindings[0].confidence).toBe('high');
  });

  it('limits top findings to 5', () => {
    for (let i = 0; i < 8; i++) {
      writeAnalysisFile(tempDir, `analysis-${i}.md`, `method-${i}`, 'medium',
        `Analysis content ${i}`);
    }

    const summary = buildSynthesisSummary(tempDir, '2026-03-30');
    expect(summary.topFindings.length).toBeLessThanOrEqual(5);
  });
});

// ─── formatSynthesisMarkdown ─────────────────────────────────────────────────

describe('formatSynthesisMarkdown', () => {
  it('produces valid markdown with all sections', () => {
    const summary = {
      synthesisId: 'SYN-2026-03-30-ABC',
      date: '2026-03-30',
      documentsAnalyzed: 5,
      overallConfidence: 'medium',
      topFindings: [
        { method: 'deep-analysis', file: 'deep.md', confidence: 'high', summary: 'Key finding' },
      ],
      swot: { strengths: 3, weaknesses: 2, opportunities: 4, threats: 1 },
      riskOverview: { critical: 0, high: 1, medium: 3, low: 2 },
      editorialRecommendations: ['Consider lead story on policy reform.'],
    };

    const md = formatSynthesisMarkdown(summary);
    expect(md).toContain('Synthesis Summary');
    expect(md).toContain('SYN-2026-03-30-ABC');
    expect(md).toContain('2026-03-30');
    expect(md).toContain('Key finding');
    expect(md).toContain('Strengths');
    expect(md).toContain('Weaknesses');
    expect(md).toContain('Critical');
    expect(md).toContain('Editorial Recommendations');
    expect(md).toContain('Consider lead story');
  });

  it('includes frontmatter', () => {
    const summary = {
      synthesisId: 'SYN-2026-03-30-XYZ',
      date: '2026-03-30',
      documentsAnalyzed: 0,
      overallConfidence: 'low',
      topFindings: [],
      swot: { strengths: 0, weaknesses: 0, opportunities: 0, threats: 0 },
      riskOverview: { critical: 0, high: 0, medium: 0, low: 0 },
      editorialRecommendations: [],
    };

    const md = formatSynthesisMarkdown(summary);
    expect(md).toContain('method: synthesis-summary');
    expect(md).toContain('confidence: low');
  });
});
