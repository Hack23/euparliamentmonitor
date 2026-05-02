// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Extended unit tests for prior-run-diff.js — covers collectArtifactPaths
 * edge cases, nested manifest file structures, and additional classifyArtifact
 * scenarios.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { classifyArtifact, buildPriorRunDiff } from '../../scripts/aggregator/prior-run-diff.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeLines(n, opts = {}) {
  const lines = ['# Title', ''];
  if (opts.mermaid) {
    lines.push('```mermaid', 'flowchart LR', 'A --> B', '```', '');
  }
  if (opts.placeholder) {
    lines.push('[AI_ANALYSIS_REQUIRED]', '');
  }
  if (opts.tbdPlaceholder) {
    lines.push('[TBD]', '');
  }
  if (opts.todoPlaceholder) {
    lines.push('TODO: fill in details', '');
  }
  while (lines.length < n) lines.push(`Filler line ${lines.length}`);
  return lines.join('\n');
}

let tmp;
let runDir;

function writeManifest(overrides = {}) {
  const base = {
    articleType: 'week-in-review',
    files: {},
    history: [],
    ...overrides,
  };
  fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(base, null, 2), 'utf8');
}

function writeArtifact(relativePath, content) {
  const abs = path.join(runDir, relativePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
}

const THRESHOLDS = {
  thresholds: {
    'week-in-review': {
      'executive-brief.md': 180,
      'intelligence/synthesis-summary.md': 180,
    },
  },
  structuralRequirements: {
    mermaidRequired: ['intelligence/synthesis-summary.md'],
  },
};

// ─── tests ───────────────────────────────────────────────────────────────────

describe('prior-run-diff extended', () => {
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prior-run-diff-ext-'));
    runDir = path.join(tmp, 'week-in-review');
    fs.mkdirSync(path.join(runDir, 'intelligence'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'classification'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'risk-scoring'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  describe('classifyArtifact - placeholder variants', () => {
    it('detects [TBD] placeholder', () => {
      writeArtifact('intelligence/test.md', makeLines(200, { tbdPlaceholder: true, mermaid: true }));
      const r = classifyArtifact(runDir, 'intelligence/test.md', 30, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('placeholders');
    });

    it('detects TODO: placeholder', () => {
      writeArtifact('intelligence/test.md', makeLines(200, { todoPlaceholder: true, mermaid: true }));
      const r = classifyArtifact(runDir, 'intelligence/test.md', 30, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('placeholders');
    });

    it('does not flag template-instructions as placeholder', () => {
      // META_DOC_HINT_RE should suppress placeholder detection
      const content = [
        '# Template Instructions Reference',
        '',
        'This is a template-instructions document.',
        '',
        '[TBD]', // Would normally be flagged but META_DOC_HINT suppresses
        '',
      ];
      while (content.length < 50) content.push(`Line ${content.length}`);
      writeArtifact('executive-brief.md', content.join('\n'));
      const r = classifyArtifact(runDir, 'executive-brief.md', 30, []);
      expect(r.atFloor).toBe(true);
    });
  });

  describe('classifyArtifact - diagram requirements by directory', () => {
    it('requires mermaid in classification/ directory', () => {
      writeArtifact('classification/impact-matrix.md', makeLines(100));
      const r = classifyArtifact(runDir, 'classification/impact-matrix.md', 30, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('mermaid:missing');
    });

    it('requires mermaid in risk-scoring/ directory', () => {
      writeArtifact('risk-scoring/risk-map.md', makeLines(100));
      const r = classifyArtifact(runDir, 'risk-scoring/risk-map.md', 30, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('mermaid:missing');
    });

    it('does not require mermaid for top-level files', () => {
      writeArtifact('executive-brief.md', makeLines(200));
      const r = classifyArtifact(runDir, 'executive-brief.md', 30, []);
      expect(r.atFloor).toBe(true);
    });

    it('passes when mermaid is present in diagram directory', () => {
      writeArtifact('classification/impact-matrix.md', makeLines(100, { mermaid: true }));
      const r = classifyArtifact(runDir, 'classification/impact-matrix.md', 30, []);
      expect(r.atFloor).toBe(true);
    });
  });

  describe('buildPriorRunDiff - collectArtifactPaths edge cases', () => {
    it('collects paths from nested object file entries', () => {
      writeManifest({
        history: [{ runId: 'run-nested', gateResult: 'GREEN', filesWritten: [] }],
        files: {
          intelligence: {
            summary: { path: 'intelligence/synthesis-summary.md' },
            extra: 'intelligence/extra-analysis.md',
          },
        },
      });
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));
      writeArtifact('intelligence/extra-analysis.md', makeLines(50, { mermaid: true }));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      const allPaths = [
        ...plan.carryForward.map((e) => e.relativePath),
        ...plan.rewrite.map((e) => e.relativePath),
      ];
      expect(allPaths).toContain('intelligence/synthesis-summary.md');
      expect(allPaths).toContain('intelligence/extra-analysis.md');
    });

    it('collects paths from array file entries', () => {
      writeManifest({
        history: [{ runId: 'run-array', gateResult: 'GREEN', filesWritten: [] }],
        files: {
          analysis: ['analysis/doc1.md', 'analysis/doc2.md'],
        },
      });
      writeArtifact('analysis/doc1.md', makeLines(50));
      writeArtifact('analysis/doc2.md', makeLines(50));

      const plan = buildPriorRunDiff(runDir, null, true);
      const allPaths = [
        ...plan.carryForward.map((e) => e.relativePath),
        ...plan.rewrite.map((e) => e.relativePath),
      ];
      expect(allPaths).toContain('analysis/doc1.md');
      expect(allPaths).toContain('analysis/doc2.md');
    });

    it('deduplicates paths from thresholds and manifest files', () => {
      writeManifest({
        history: [{ runId: 'run-dedup', gateResult: 'GREEN', filesWritten: [] }],
        files: {
          // Same path as in THRESHOLDS.thresholds['week-in-review']
          intelligence: ['intelligence/synthesis-summary.md'],
        },
      });
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      // Should not appear twice
      const synthPaths = plan.carryForward.filter(
        (e) => e.relativePath === 'intelligence/synthesis-summary.md'
      );
      expect(synthPaths).toHaveLength(1);
    });

    it('handles manifest with no files section', () => {
      writeManifest({
        history: [{ runId: 'run-no-files', gateResult: 'GREEN', filesWritten: [] }],
        // No 'files' key
      });
      writeArtifact('executive-brief.md', makeLines(200));
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      // Should still find artifacts from thresholds keys
      const allPaths = [
        ...plan.carryForward.map((e) => e.relativePath),
        ...plan.rewrite.map((e) => e.relativePath),
      ];
      expect(allPaths).toContain('executive-brief.md');
      expect(allPaths).toContain('intelligence/synthesis-summary.md');
    });

    it('handles nested path objects without string values gracefully', () => {
      writeManifest({
        history: [{ runId: 'run-complex', gateResult: 'GREEN', filesWritten: [] }],
        files: {
          translations: {
            en: { path: 'translations/en.md' },
            sv: { path: 'translations/sv.md' },
          },
          metadata: null, // Should not crash
          empty: {},
        },
      });
      writeArtifact('translations/en.md', makeLines(50));
      writeArtifact('translations/sv.md', makeLines(50));

      const plan = buildPriorRunDiff(runDir, null, true);
      const allPaths = [
        ...plan.carryForward.map((e) => e.relativePath),
        ...plan.rewrite.map((e) => e.relativePath),
      ];
      expect(allPaths).toContain('translations/en.md');
      expect(allPaths).toContain('translations/sv.md');
    });
  });

  describe('buildPriorRunDiff - extendFloor calculation', () => {
    it('extendFloor is at least floor+20 when priorLines < floor+20', () => {
      writeManifest({
        history: [{ runId: 'run-floor', gateResult: 'GREEN', filesWritten: [] }],
      });
      // File has exactly 180 lines (floor=180), so priorLines=180, extendFloor=max(180, 200)=200
      writeArtifact('executive-brief.md', makeLines(180));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      const cf = plan.carryForward.find((e) => e.relativePath === 'executive-brief.md');
      expect(cf).toBeDefined();
      expect(cf.extendFloor).toBe(200); // max(180, 180+20)
    });

    it('extendFloor uses priorLines+20 when file exceeds floor significantly', () => {
      writeManifest({
        history: [{ runId: 'run-big', gateResult: 'GREEN', filesWritten: [] }],
      });
      // File has 500 lines (floor=180), so priorLines=500, extendFloor=max(180, 520)=520
      writeArtifact('executive-brief.md', makeLines(500));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      const cf = plan.carryForward.find((e) => e.relativePath === 'executive-brief.md');
      expect(cf).toBeDefined();
      expect(cf.extendFloor).toBe(520); // max(180, 500+20)
    });
  });
});
