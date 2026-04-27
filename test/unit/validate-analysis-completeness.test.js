// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const VALIDATOR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/validate-analysis-completeness.js',
);

function run(runDir, extraArgs = []) {
  const result = spawnSync(
    process.execPath,
    [VALIDATOR, runDir, ...extraArgs],
    { encoding: 'utf8' },
  );
  return {
    code: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function makeArtifact(targetLines, opts = {}) {
  const headers = opts.h2 || ['Section A', 'Section B'];
  const body = [];
  body.push('# Title');
  body.push('');
  for (const h of headers) {
    body.push(`## ${h}`);
    body.push('');
    body.push('Filler paragraph.');
    body.push('');
  }
  if (opts.mermaid) {
    body.push('```mermaid');
    body.push('flowchart LR');
    body.push('A --> B');
    body.push('```');
    body.push('');
  }
  if (opts.wep) body.push('Almost Certain (WEP: 95%+).');
  if (opts.admiralty) body.push('| Source | A1 | EP plenary record |');
  if (opts.bluf) body.push('BLUF: thing happens.');
  // Pad to EXACTLY targetLines (each entry becomes one line in the joined
  // string + trailing newline; the file's `lines` count equals body.length).
  while (body.length < targetLines) body.push(`Filler line ${body.length}`);
  // If we somehow over-shot (e.g. caller passed a tiny target), trim — but
  // never below the structural minimum of 5 lines so the file remains a
  // recognisable artifact.
  while (body.length > targetLines && body.length > 5) body.pop();
  // Join WITHOUT a trailing newline so the file's reported line count equals
  // body.length exactly (validator uses `body.split('\n').length`, which would
  // otherwise produce an extra empty trailing element).
  return body.join('\n');
}

describe('scripts/validate-analysis-completeness.js', () => {
  let tmp;
  let runDir;
  let thresholdsPath;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-analysis-'));
    runDir = path.join(tmp, 'run');
    fs.mkdirSync(path.join(runDir, 'intelligence'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'risk-scoring'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'classification'), { recursive: true });

    // Minimal thresholds doc — keeps tests independent of the production
    // reference-quality-thresholds.json contents.
    thresholdsPath = path.join(tmp, 'thresholds.json');
    fs.writeFileSync(
      thresholdsPath,
      JSON.stringify({
        thresholds: {
          breaking: {
            'intelligence/synthesis-summary.md': 200,
          },
        },
        tradecraftQualitySignals: {
          admiraltyGradeRequired: ['intelligence/synthesis-summary.md'],
        },
      }),
      'utf8',
    );
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  function writeManifest(extra = {}) {
    fs.writeFileSync(
      path.join(runDir, 'manifest.json'),
      JSON.stringify({
        articleType: 'breaking',
        files: {
          intelligence: ['intelligence/synthesis-summary.md'],
          ...extra,
        },
      }),
      'utf8',
    );
  }

  function runHere(extraArgs = []) {
    return run(runDir, ['--thresholds', thresholdsPath, ...extraArgs]);
  }

  it('exits 2 with usage when no runDir given', () => {
    const result = run('');
    expect(result.code).toBe(2);
  });

  it('returns RED when manifest.json is missing', () => {
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    expect(result.stdout).toMatch(/missing=1/);
  });

  it('flags missing artifacts listed in manifest', () => {
    writeManifest();
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/intelligence\/synthesis-summary\.md.*missing/);
  });

  it('flags artifacts under intelligence/ that lack mermaid', () => {
    writeManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: false, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.stderr).toMatch(/synthesis-summary\.md.*mermaid:missing/);
  });

  it('flags placeholder markers', () => {
    writeManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      `# Title\n\n## Section\n\n[AI_ANALYSIS_REQUIRED]\n` +
        Array.from({ length: 250 }, (_, i) => `line ${i}`).join('\n'),
      'utf8',
    );
    const result = runHere();
    expect(result.stdout).toMatch(/placeholders=1/);
    expect(result.stderr).toMatch(/placeholders:1/);
  });

  it('passes GREEN when every requirement is met', () => {
    writeManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN articleType=breaking/);
  });

  it('emits machine-readable JSON when --json passed', () => {
    writeManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere(['--json']);
    const lines = result.stdout.trim().split('\n');
    const lastJsonLineIdx = lines.findIndex((l) => l.startsWith('{'));
    expect(lastJsonLineIdx).toBeGreaterThan(-1);
    const json = JSON.parse(lines.slice(lastJsonLineIdx).join('\n'));
    expect(json.gate).toBe('GREEN');
    expect(json.articleType).toBe('breaking');
    expect(Array.isArray(json.results)).toBe(true);
  });

  it('flags artifacts shorter than per-articleType floor', () => {
    writeManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(50, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.stderr).toMatch(/short:50<200/);
    expect(result.stdout).toMatch(/short=1/);
  });

  it('reports orphans (on-disk artifacts not listed in manifest) as warnings, not blockers', () => {
    writeManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    fs.writeFileSync(
      path.join(runDir, 'intelligence/extra.md'),
      makeArtifact(100, { mermaid: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stderr).toMatch(/orphan artifacts/);
  });

  describe('Pass 2 skipped heuristic', () => {
    it('warns when pass2 block is absent and an artifact sits exactly at its floor', () => {
      // Artifact at exactly the 200-line floor (minLines for synthesis-summary.md)
      writeManifest();
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(200, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      // Gate should still be GREEN (line count meets floor exactly)
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
      // But the heuristic warning must appear
      expect(result.stderr).toMatch(/pass2-skipped-heuristic/);
      expect(result.stderr).toMatch(/pass2-block-missing/);
    });

    it('warns when pass2.rewriteCount === 0 and an artifact is exactly at its floor', () => {
      const manifest = {
        articleType: 'breaking',
        files: {
          intelligence: ['intelligence/synthesis-summary.md'],
        },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          endedAt: '2026-04-22T10:24:00Z',
          rewriteCount: 0,
        },
      };
      fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(manifest), 'utf8');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(200, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
      expect(result.stderr).toMatch(/pass2-skipped-heuristic/);
      expect(result.stderr).toMatch(/pass2\.rewriteCount=0/);
    });

    it('does NOT warn when pass2.rewriteCount === 0 but artifact is strictly above its floor', () => {
      const manifest = {
        articleType: 'breaking',
        files: {
          intelligence: ['intelligence/synthesis-summary.md'],
        },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          endedAt: '2026-04-22T10:24:00Z',
          rewriteCount: 0,
        },
      };
      fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(manifest), 'utf8');
      // 250 lines > 200-line floor — no heuristic trigger
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).not.toMatch(/pass2-skipped-heuristic/);
    });

    it('does NOT warn when pass2.rewriteCount > 0 even if artifact is at its floor', () => {
      const manifest = {
        articleType: 'breaking',
        files: {
          intelligence: ['intelligence/synthesis-summary.md'],
        },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          endedAt: '2026-04-22T10:24:00Z',
          rewriteCount: 3,
        },
      };
      fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(manifest), 'utf8');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(200, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).not.toMatch(/pass2-skipped-heuristic/);
    });

    it('does NOT warn when pass2 block is absent but artifact is strictly above its floor', () => {
      writeManifest();
      // 300 lines > 200-line floor — heuristic should not fire
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(300, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).not.toMatch(/pass2-skipped-heuristic/);
    });
  });
});
