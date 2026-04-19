// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for src/utils/validate-analysis-completeness.ts (Rule 22
 * per-artifact depth floors).
 *
 * These tests spawn the compiled CLI (`scripts/utils/validate-analysis-completeness.js`)
 * against a temporary fixture analysis-run directory. They exercise:
 *
 * 1. A per-artifact threshold is enforced when defined for the active article type.
 * 2. The flat fallback applies when no per-artifact threshold exists.
 * 3. A missing thresholds catalogue file falls back to the flat floor (no crash).
 * 4. Malformed thresholds JSON falls back to the flat floor (no crash).
 * 5. The displayed `lineCount/minLines` ratio uses the per-artifact threshold.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const CLI = path.join(REPO_ROOT, 'scripts', 'utils', 'validate-analysis-completeness.js');

const REQUIRED_FILES = [
  'intelligence/analysis-index.md',
  'intelligence/synthesis-summary.md',
  'intelligence/pestle-analysis.md',
  'intelligence/stakeholder-map.md',
  'intelligence/scenario-forecast.md',
  'intelligence/threat-model.md',
  'intelligence/historical-baseline.md',
  'intelligence/economic-context.md',
  'intelligence/wildcards-blackswans.md',
  'intelligence/coalition-dynamics.md',
];

/**
 * Build a synthetic artifact with exactly `lines` lines (as counted by
 * `text.split('\n').length`, which is what the validator uses). Content is
 * non-placeholder so the placeholder-marker check always passes.
 *
 * @param {number} n
 * @returns {string}
 */
function synthArtifact(n) {
  if (n <= 0) return '';
  const rows = [];
  rows.push('# Synthetic Artifact');
  rows.push('Fixture for Rule 22 tests — substantive prose.');
  for (let i = rows.length; i < n; i++) rows.push(`line ${i + 1}`);
  // Joining N items with '\n' produces N-1 newlines, and `split('\n').length`
  // of that string is exactly N — matching the validator's counting semantics.
  return rows.join('\n');
}

function writeRun(dir, lineCounts) {
  fs.mkdirSync(path.join(dir, 'intelligence'), { recursive: true });
  const manifestFiles = {};
  for (const rel of REQUIRED_FILES) {
    const count = lineCounts[rel] ?? 200;
    fs.writeFileSync(path.join(dir, rel), synthArtifact(count), 'utf-8');
    manifestFiles[rel] = 'fixture';
  }
  fs.writeFileSync(
    path.join(dir, 'manifest.json'),
    JSON.stringify(
      {
        runId: 'fixture',
        date: '2026-04-19',
        articleType: 'breaking',
        files: manifestFiles,
      },
      null,
      2
    ),
    'utf-8'
  );
}

/**
 * Spawn the CLI and return { status, stdout, stderr }.
 * @param {{ analysisDir: string, thresholdsFile?: string, articleType?: string, minLines?: number, warnOnly?: boolean }} opts
 */
function runCli(opts) {
  const args = [CLI, `--analysis-dir=${opts.analysisDir}`];
  if (opts.articleType) args.push(`--article-type=${opts.articleType}`);
  if (opts.thresholdsFile !== undefined) args.push(`--thresholds-file=${opts.thresholdsFile}`);
  if (opts.minLines !== undefined) args.push(`--min-lines=${opts.minLines}`);
  if (opts.warnOnly) args.push('--warn-only');
  const result = spawnSync(process.execPath, args, { encoding: 'utf-8' });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

describe('validate-analysis-completeness — Rule 22 per-artifact depth floors', () => {
  let tmpDir;
  let runDir;
  let thresholdsFile;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vac-rule22-'));
    runDir = path.join(tmpDir, 'run');
    thresholdsFile = path.join(tmpDir, 'thresholds.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fails when an artifact is below its per-artifact threshold', () => {
    writeRun(runDir, { 'intelligence/pestle-analysis.md': 50 });
    fs.writeFileSync(
      thresholdsFile,
      JSON.stringify({
        thresholds: { breaking: { 'intelligence/pestle-analysis.md': 250 } },
      })
    );

    const { status, stdout } = runCli({ analysisDir: runDir, thresholdsFile });
    expect(status).toBe(1);
    expect(stdout).toMatch(/SHORT \(\d+ < 250 lines\)/);
    expect(stdout).toContain('pestle-analysis.md');
    expect(stdout).toContain('50/250 lines');
  });

  it('passes when artifacts meet their per-artifact thresholds', () => {
    writeRun(runDir, {}); // all 200 lines default
    fs.writeFileSync(
      thresholdsFile,
      JSON.stringify({
        thresholds: {
          breaking: {
            'intelligence/pestle-analysis.md': 150,
            'intelligence/stakeholder-map.md': 150,
          },
        },
      })
    );

    const { status, stdout } = runCli({ analysisDir: runDir, thresholdsFile });
    expect(status).toBe(0);
    expect(stdout).toContain('Pre-flight gate PASSED');
    // Per-artifact ratio displayed with configured minLines, not the flat default.
    expect(stdout).toContain('(200/150 lines)');
  });

  it('uses the flat --min-lines fallback when no per-artifact threshold exists', () => {
    writeRun(runDir, { 'intelligence/pestle-analysis.md': 40 });
    // Thresholds file has breaking entry but lacks pestle-analysis.md.
    fs.writeFileSync(
      thresholdsFile,
      JSON.stringify({
        thresholds: { breaking: { 'intelligence/stakeholder-map.md': 150 } },
      })
    );

    const passing = runCli({
      analysisDir: runDir,
      thresholdsFile,
      minLines: 30, // 40 > 30 → passes
    });
    expect(passing.status).toBe(0);

    const failing = runCli({
      analysisDir: runDir,
      thresholdsFile,
      minLines: 100, // 40 < 100 → fails
    });
    expect(failing.status).toBe(1);
    expect(failing.stdout).toMatch(/SHORT \(40 < 100 lines\)/);
  });

  it('falls back to the flat floor when the thresholds catalogue is missing', () => {
    writeRun(runDir, {});
    const missingPath = path.join(tmpDir, 'does-not-exist.json');
    const { status, stdout } = runCli({
      analysisDir: runDir,
      thresholdsFile: missingPath,
      minLines: 30,
    });
    expect(status).toBe(0);
    // No per-artifact floors applied → display uses flat 30.
    expect(stdout).toContain('(200/30 lines)');
  });

  it('falls back to the flat floor when the thresholds catalogue is malformed', () => {
    writeRun(runDir, {});
    fs.writeFileSync(thresholdsFile, 'not valid json {{{');

    const { status, stdout } = runCli({
      analysisDir: runDir,
      thresholdsFile,
      minLines: 30,
    });
    expect(status).toBe(0);
    expect(stdout).toContain('(200/30 lines)');
  });

  it('ignores per-artifact entries with non-positive or non-numeric values', () => {
    writeRun(runDir, { 'intelligence/pestle-analysis.md': 40 });
    fs.writeFileSync(
      thresholdsFile,
      JSON.stringify({
        thresholds: {
          breaking: {
            'intelligence/pestle-analysis.md': 'not a number',
            'intelligence/stakeholder-map.md': -5,
          },
        },
      })
    );
    // Both invalid entries should be dropped, falling back to --min-lines=30.
    const { status } = runCli({
      analysisDir: runDir,
      thresholdsFile,
      minLines: 30,
    });
    expect(status).toBe(0);
  });

  it('uses the articleType override when manifest and CLI differ', () => {
    writeRun(runDir, { 'intelligence/pestle-analysis.md': 200 });
    fs.writeFileSync(
      thresholdsFile,
      JSON.stringify({
        thresholds: {
          'week-in-review': { 'intelligence/pestle-analysis.md': 500 },
          breaking: { 'intelligence/pestle-analysis.md': 100 },
        },
      })
    );

    // Using week-in-review thresholds — 200 < 500 should fail.
    const failing = runCli({
      analysisDir: runDir,
      thresholdsFile,
      articleType: 'week-in-review',
    });
    expect(failing.status).toBe(1);
    expect(failing.stdout).toMatch(/SHORT \(200 < 500 lines\)/);
  });

  it('enforces thresholds on supplemental manifest-listed files (risk-scoring/*, documents/*, classification/*)', () => {
    // Write the mandatory required-set so the gate is not blocked by missing
    // intelligence artifacts, then add a short supplemental file (listed in
    // manifest, not part of the required set) with a per-artifact threshold.
    writeRun(runDir, {});
    const supplementalRel = 'risk-scoring/risk-matrix.md';
    fs.mkdirSync(path.join(runDir, 'risk-scoring'), { recursive: true });
    fs.writeFileSync(path.join(runDir, supplementalRel), synthArtifact(40), 'utf-8');

    // Extend manifest.files with the supplemental entry.
    const manifestPath = path.join(runDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.files[supplementalRel] = 'fixture';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    fs.writeFileSync(
      thresholdsFile,
      JSON.stringify({
        thresholds: { breaking: { [supplementalRel]: 150 } },
      })
    );

    const { status, stdout } = runCli({ analysisDir: runDir, thresholdsFile });
    expect(status).toBe(1);
    // Short-file diagnostic must surface the supplemental path and its
    // per-artifact floor (not the default 30).
    expect(stdout).toContain(supplementalRel);
    expect(stdout).toMatch(/SHORT \(40 < 150 lines\)/);
  });

  it('does NOT enforce supplemental thresholds on files absent from the manifest', () => {
    // Matches real behaviour: a supplemental threshold only fires when the
    // file is listed in manifest.files.*. Writing the file to disk without
    // registering it must not spuriously fail the gate — orphan detection
    // surfaces that separately.
    writeRun(runDir, {});
    fs.mkdirSync(path.join(runDir, 'risk-scoring'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'risk-scoring/risk-matrix.md'),
      synthArtifact(40),
      'utf-8'
    );

    fs.writeFileSync(
      thresholdsFile,
      JSON.stringify({
        thresholds: { breaking: { 'risk-scoring/risk-matrix.md': 150 } },
      })
    );

    const { status } = runCli({ analysisDir: runDir, thresholdsFile });
    // Required set is all >= 200 lines (writeRun default), manifest is valid,
    // supplemental file is not manifest-listed → gate passes.
    expect(status).toBe(0);
  });
});
