// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { classifyArtifact, buildPriorRunDiff } from '../../scripts/aggregator/prior-run-diff.js';

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/aggregator/prior-run-diff.js',
);

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeLines(n, opts = {}) {
  const lines = ['# Title', ''];
  if (opts.mermaid) {
    lines.push('```mermaid', 'flowchart LR', 'A --> B', '```', '');
  }
  if (opts.placeholder) {
    lines.push('[AI_ANALYSIS_REQUIRED]', '');
  }
  while (lines.length < n) lines.push(`Filler line ${lines.length}`);
  return lines.join('\n');
}

function runCli(runDir, env = {}, extraArgs = []) {
  return spawnSync(process.execPath, [SCRIPT, runDir, ...extraArgs], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

// ─── fixtures ────────────────────────────────────────────────────────────────

let tmp;
let runDir;
let thresholdsPath;

const THRESHOLDS = {
  thresholds: {
    'week-in-review': {
      'executive-brief.md': 180,
      'intelligence/synthesis-summary.md': 180,
      'intelligence/stakeholder-map.md': 240,
    },
  },
  structuralRequirements: {
    mermaidRequired: ['intelligence/synthesis-summary.md'],
  },
};

function writeThresholds() {
  thresholdsPath = path.join(tmp, 'thresholds.json');
  fs.writeFileSync(thresholdsPath, JSON.stringify(THRESHOLDS), 'utf8');
}

function writeManifest(overrides = {}) {
  const base = {
    articleType: 'week-in-review',
    files: {
      intelligence: [
        'intelligence/synthesis-summary.md',
        'intelligence/stakeholder-map.md',
      ],
    },
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

// ─── tests ───────────────────────────────────────────────────────────────────

describe('scripts/aggregator/prior-run-diff.js', () => {
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prior-run-diff-'));
    runDir = path.join(tmp, 'week-in-review');
    fs.mkdirSync(path.join(runDir, 'intelligence'), { recursive: true });
    writeThresholds();
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  // ─── CLI smoke tests ────────────────────────────────────────────────────

  describe('CLI', () => {
    it('exits 2 with no arguments', () => {
      const r = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
      expect(r.status).toBe(2);
    });

    it('exits 1 when runDir does not exist', () => {
      const r = runCli(path.join(tmp, 'nonexistent'));
      expect(r.status).toBe(1);
    });

    it('emits valid JSON to stdout when feature is disabled (no env flag)', () => {
      writeManifest();
      const r = runCli(runDir, { ENABLE_PRIOR_RUN_MERGE: '' }, ['--thresholds', thresholdsPath]);
      expect(r.status).toBe(0);
      const plan = JSON.parse(r.stdout);
      expect(plan.enabled).toBe(false);
      expect(plan.carryForward).toEqual([]);
      expect(plan.rewrite).toEqual([]);
    });

    it('emits valid JSON with enabled=true when ENABLE_PRIOR_RUN_MERGE=true', () => {
      writeManifest();
      const r = runCli(runDir, { ENABLE_PRIOR_RUN_MERGE: 'true' }, ['--thresholds', thresholdsPath]);
      expect(r.status).toBe(0);
      const plan = JSON.parse(r.stdout);
      expect(plan.enabled).toBe(true);
    });
  });

  // ─── classifyArtifact unit tests ────────────────────────────────────────

  describe('classifyArtifact', () => {
    it('returns atFloor=false with reason=missing when file absent', () => {
      const r = classifyArtifact(runDir, 'intelligence/missing.md', 30, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('missing');
    });

    it('returns atFloor=false when file is shorter than floor', () => {
      writeArtifact('intelligence/short.md', makeLines(20));
      const r = classifyArtifact(runDir, 'intelligence/short.md', 50, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toMatch(/^short:/);
      expect(r.lines).toBe(20);
    });

    it('returns atFloor=true when file meets floor with no placeholders or mermaid required', () => {
      writeArtifact('executive-brief.md', makeLines(200));
      const r = classifyArtifact(runDir, 'executive-brief.md', 180, []);
      expect(r.atFloor).toBe(true);
      expect(r.reason).toBeNull();
      expect(r.lines).toBe(200);
    });

    it('returns atFloor=false when placeholder found', () => {
      writeArtifact('intelligence/bad.md', makeLines(200, { placeholder: true }));
      const r = classifyArtifact(runDir, 'intelligence/bad.md', 30, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('placeholders');
    });

    it('returns atFloor=false when mermaid is required but missing', () => {
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: false }));
      const r = classifyArtifact(
        runDir,
        'intelligence/synthesis-summary.md',
        30,
        ['intelligence/synthesis-summary.md'],
      );
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('mermaid:missing');
    });

    it('returns atFloor=true when mermaid is required and present', () => {
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));
      const r = classifyArtifact(
        runDir,
        'intelligence/synthesis-summary.md',
        30,
        ['intelligence/synthesis-summary.md'],
      );
      expect(r.atFloor).toBe(true);
    });

    it('returns atFloor=false for intelligence/ artifact lacking mermaid (dir heuristic)', () => {
      writeArtifact('intelligence/scenario-forecast.md', makeLines(100));
      const r = classifyArtifact(runDir, 'intelligence/scenario-forecast.md', 30, []);
      expect(r.atFloor).toBe(false);
      expect(r.reason).toBe('mermaid:missing');
    });
  });

  // ─── buildPriorRunDiff unit tests ────────────────────────────────────────

  describe('buildPriorRunDiff', () => {
    it('returns enabled=false when disabled flag is passed', () => {
      writeManifest({ history: [{ runId: 'run-1', gateResult: 'GREEN', filesWritten: [] }] });
      const plan = buildPriorRunDiff(runDir, THRESHOLDS, false);
      expect(plan.enabled).toBe(false);
      expect(plan.carryForward).toEqual([]);
      expect(plan.rewrite).toEqual([]);
    });

    it('returns empty carryForward and rewrite when history is empty', () => {
      writeManifest({ history: [] });
      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      expect(plan.enabled).toBe(true);
      expect(plan.priorRunId).toBeNull();
      expect(plan.carryForward).toEqual([]);
      expect(plan.rewrite).toEqual([]);
    });

    it('returns empty carryForward and rewrite when manifest is absent', () => {
      // no writeManifest() call
      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      expect(plan.enabled).toBe(true);
      expect(plan.priorRunId).toBeNull();
      expect(plan.carryForward).toHaveLength(0);
      expect(plan.rewrite).toHaveLength(0);
    });

    it('all artifacts at-floor → all in carryForward, rewrite empty', () => {
      writeManifest({
        history: [{ runId: 'wir-run-42', gateResult: 'GREEN', filesWritten: [] }],
      });
      // Write at-floor artifacts
      writeArtifact('executive-brief.md', makeLines(200));
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));
      writeArtifact('intelligence/stakeholder-map.md', makeLines(260, { mermaid: true }));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      expect(plan.priorRunId).toBe('wir-run-42');
      expect(plan.rewrite).toHaveLength(0);
      expect(plan.carryForward).toHaveLength(3);
      for (const cf of plan.carryForward) {
        expect(cf.source).toBe('carry-forward-from:wir-run-42');
        expect(cf.lines).toBeGreaterThanOrEqual(cf.floor);
      }
    });

    it('mixed: at-floor artifact carried forward, below-floor in rewrite', () => {
      writeManifest({
        history: [{ runId: 'wir-run-55', gateResult: 'GREEN', filesWritten: [] }],
      });
      // synthesis-summary at floor (mermaid + enough lines)
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));
      // stakeholder-map below floor
      writeArtifact('intelligence/stakeholder-map.md', makeLines(100, { mermaid: true }));
      // executive-brief missing entirely
      // (no writeArtifact for 'executive-brief.md')

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      const cfPaths = plan.carryForward.map((e) => e.relativePath);
      const rwPaths = plan.rewrite.map((e) => e.relativePath);

      expect(cfPaths).toContain('intelligence/synthesis-summary.md');
      expect(rwPaths).toContain('intelligence/stakeholder-map.md');
      expect(rwPaths).toContain('executive-brief.md');
    });

    it('uses the last history entry as priorRunId', () => {
      writeManifest({
        history: [
          { runId: 'wir-run-1', gateResult: 'GREEN', filesWritten: [] },
          { runId: 'wir-run-2', gateResult: 'GREEN', filesWritten: [] },
        ],
      });
      writeArtifact('executive-brief.md', makeLines(200));
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));
      writeArtifact('intelligence/stakeholder-map.md', makeLines(260, { mermaid: true }));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      expect(plan.priorRunId).toBe('wir-run-2');
      for (const cf of plan.carryForward) {
        expect(cf.source).toBe('carry-forward-from:wir-run-2');
      }
    });

    it('works with null thresholdsJson (falls back to DEFAULT_MIN_LINES)', () => {
      writeManifest({
        history: [{ runId: 'wir-run-10', gateResult: 'GREEN', filesWritten: [] }],
        files: { intelligence: ['intelligence/synthesis-summary.md'] },
      });
      writeArtifact('intelligence/synthesis-summary.md', makeLines(50, { mermaid: true }));

      const plan = buildPriorRunDiff(runDir, null, true);
      expect(plan.enabled).toBe(true);
      // With no thresholds, floor defaults to DEFAULT_MIN_LINES (30)
      // synthesis-summary has 50 lines so it should be at-floor IF mermaid dir heuristic passes
      // But intelligence/ dir requires mermaid — and we provided one — so it should be at-floor
      const cf = plan.carryForward.find((e) => e.relativePath === 'intelligence/synthesis-summary.md');
      expect(cf).toBeDefined();
      expect(cf.source).toBe('carry-forward-from:wir-run-10');
    });

    it('resolves articleType from legacy manifest.articleTypes[] schema', () => {
      const legacyManifest = {
        articleTypes: ['propositions'],
        files: {},
        history: [],
      };
      fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(legacyManifest), 'utf8');
      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      expect(plan.articleType).toBe('propositions');
    });

    it('resolves articleType from legacy manifest.runType schema', () => {
      const legacyManifest = {
        runType: 'breaking',
        files: {},
        history: [],
      };
      fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(legacyManifest), 'utf8');
      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      expect(plan.articleType).toBe('breaking');
    });

    it('handles manifest.files entries that are bare strings (e.g. "executiveBrief": "executive-brief.md")', () => {
      const stringValueManifest = {
        articleType: 'week-in-review',
        files: {
          executiveBrief: 'executive-brief.md',
          synthesis: { path: 'intelligence/synthesis-summary.md' },
        },
        history: [{ runId: 'sv-run-1', gateResult: 'GREEN', filesWritten: [] }],
      };
      fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(stringValueManifest), 'utf8');
      writeArtifact('executive-brief.md', makeLines(200));
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));

      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);
      const cfPaths = plan.carryForward.map((e) => e.relativePath);
      expect(cfPaths).toContain('executive-brief.md');
      expect(cfPaths).toContain('intelligence/synthesis-summary.md');
    });

    it('snapshot: plan shape is stable', () => {
      writeManifest({
        history: [{ runId: 'snap-run-1', gateResult: 'GREEN', filesWritten: [] }],
      });
      writeArtifact('executive-brief.md', makeLines(200));
      writeArtifact('intelligence/synthesis-summary.md', makeLines(200, { mermaid: true }));
      // stakeholder-map missing → rewrite
      const plan = buildPriorRunDiff(runDir, THRESHOLDS, true);

      expect(plan).toMatchObject({
        enabled: true,
        articleType: 'week-in-review',
        priorRunId: 'snap-run-1',
      });
      expect(Array.isArray(plan.carryForward)).toBe(true);
      expect(Array.isArray(plan.rewrite)).toBe(true);

      // Every carryForward entry has required shape
      for (const cf of plan.carryForward) {
        expect(typeof cf.relativePath).toBe('string');
        expect(typeof cf.lines).toBe('number');
        expect(typeof cf.floor).toBe('number');
        expect(cf.source).toMatch(/^carry-forward-from:/);
      }
      // Every rewrite entry has required shape
      for (const rw of plan.rewrite) {
        expect(typeof rw.relativePath).toBe('string');
        expect(typeof rw.lines).toBe('number');
        expect(typeof rw.floor).toBe('number');
        expect(typeof rw.reason).toBe('string');
      }
    });
  });
});
