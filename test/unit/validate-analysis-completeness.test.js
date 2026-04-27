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
const ECONOMIC_CONTEXT_PADDING_LINES = 230;

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

  function writeEconomicContextManifest() {
    fs.writeFileSync(
      path.join(runDir, 'manifest.json'),
      JSON.stringify({
        articleType: 'week-in-review',
        files: {
          intelligence: ['intelligence/economic-context.md'],
        },
      }),
      'utf8',
    );
  }

  function makeEconomicContext(imfSource) {
    return [
      '# Economic Context',
      '',
      '## Document Metadata',
      '',
      '| Field | Value |',
      '|-------|-------|',
      `| **IMF Source** | ${imfSource} |`,
      '',
      '## IMF Evidence',
      '',
      'IMF WEO April 2026 reports Germany at 1.1% real GDP growth, anchoring the policy reading.',
      '',
      '```mermaid',
      'flowchart LR',
      'IMF --> EP',
      '```',
      '',
      ...Array.from(
        { length: ECONOMIC_CONTEXT_PADDING_LINES },
        (_, i) => `Filler line ${i}`,
      ),
    ].join('\n');
  }

  it('returns RED when economic-context cites IMF figures with knowledge-only provenance', () => {
    writeEconomicContextManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/economic-context.md'),
      makeEconomicContext('knowledge-only'),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/economic-context\.md.*imf-source:knowledge-only/);
  });

  it('returns RED when economic-context cites live IMF figures without an IMF cache file', () => {
    writeEconomicContextManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/economic-context.md'),
      makeEconomicContext('live'),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/economic-context\.md.*imf-cache:missing/);
  });

  it('passes GREEN when economic-context cites live IMF figures with cached probe JSON', () => {
    writeEconomicContextManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/economic-context.md'),
      makeEconomicContext('live'),
      'utf8',
    );
    fs.mkdirSync(path.join(runDir, 'cache/imf'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'cache/imf/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json'),
      JSON.stringify({ data: { dataSets: [{ series: { '0:0:0': { observations: { 0: [1.1] } } } }] } }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
  });

  it('returns RED when IMF Source field holds an unrecognised template placeholder', () => {
    writeEconomicContextManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/economic-context.md'),
      makeEconomicContext('<live | cache | knowledge-only>'),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/economic-context\.md.*imf-source:missing/);
  });

  it('returns RED when only a non-WEO json sits in cache/imf (failed probe summary)', () => {
    writeEconomicContextManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/economic-context.md'),
      makeEconomicContext('live'),
      'utf8',
    );
    fs.mkdirSync(path.join(runDir, 'cache/imf'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'cache/imf/imf-probe-summary.json'),
      JSON.stringify({ available: false, source: 'live', records: 0 }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/economic-context\.md.*imf-cache:missing/);
  });

  it('returns RED when WEO file exists but probe summary reports available:false', () => {
    writeEconomicContextManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/economic-context.md'),
      makeEconomicContext('live'),
      'utf8',
    );
    fs.mkdirSync(path.join(runDir, 'cache/imf'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'cache/imf/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json'),
      JSON.stringify({ data: { dataSets: [{ series: { '0:0:0': { observations: { 0: [1.1] } } } }] } }),
      'utf8',
    );
    fs.writeFileSync(
      path.join(runDir, 'cache/imf/imf-probe-summary.json'),
      JSON.stringify({ available: false, source: 'live', records: 0 }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/economic-context\.md.*imf-cache:missing/);
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

    it('treats malformed pass2.rewriteCount (non-numeric) as invalid schema and still triggers heuristic at-floor', () => {
      const manifest = {
        articleType: 'breaking',
        files: {
          intelligence: ['intelligence/synthesis-summary.md'],
        },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          endedAt: '2026-04-22T10:24:00Z',
          rewriteCount: 'four', // typo / wrong type
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
      // Both the schema warning and the heuristic warning must fire
      expect(result.stderr).toMatch(/manifest\.pass2 invalid schema/);
      expect(result.stderr).toMatch(/pass2-skipped-heuristic/);
      expect(result.stderr).toMatch(/pass2-schema-invalid/);
    });

    it('treats missing rewriteCount field as invalid schema', () => {
      const manifest = {
        articleType: 'breaking',
        files: {
          intelligence: ['intelligence/synthesis-summary.md'],
        },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          endedAt: '2026-04-22T10:24:00Z',
          // rewriteCount missing
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
      expect(result.stderr).toMatch(/manifest\.pass2 invalid schema/);
      expect(result.stderr).toMatch(/pass2-schema-invalid/);
    });

    it('treats negative rewriteCount as invalid schema', () => {
      const manifest = {
        articleType: 'breaking',
        files: { intelligence: ['intelligence/synthesis-summary.md'] },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          endedAt: '2026-04-22T10:24:00Z',
          rewriteCount: -1,
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
      expect(result.stderr).toMatch(/non-negative integer/);
      expect(result.stderr).toMatch(/pass2-schema-invalid/);
    });

    it('treats non-integer rewriteCount as invalid schema', () => {
      const manifest = {
        articleType: 'breaking',
        files: { intelligence: ['intelligence/synthesis-summary.md'] },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          endedAt: '2026-04-22T10:24:00Z',
          rewriteCount: 0.5,
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
      expect(result.stderr).toMatch(/non-negative integer/);
      expect(result.stderr).toMatch(/pass2-schema-invalid/);
    });

    it('treats missing startedAt as invalid schema', () => {
      const manifest = {
        articleType: 'breaking',
        files: { intelligence: ['intelligence/synthesis-summary.md'] },
        pass2: {
          // startedAt missing
          endedAt: '2026-04-22T10:24:00Z',
          rewriteCount: 2,
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
      expect(result.stderr).toMatch(/startedAt must be a non-empty string/);
      expect(result.stderr).toMatch(/pass2-schema-invalid/);
    });

    it('treats missing endedAt as invalid schema', () => {
      const manifest = {
        articleType: 'breaking',
        files: { intelligence: ['intelligence/synthesis-summary.md'] },
        pass2: {
          startedAt: '2026-04-22T10:18:00Z',
          // endedAt missing
          rewriteCount: 2,
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
      expect(result.stderr).toMatch(/endedAt must be a non-empty string/);
      expect(result.stderr).toMatch(/pass2-schema-invalid/);
    });
  });

  // -------------------------------------------------------------------------
  // Forward-statements registry check (week-ahead / month-ahead)
  // -------------------------------------------------------------------------

  function writeWeekAheadManifest() {
    fs.writeFileSync(
      path.join(runDir, 'manifest.json'),
      JSON.stringify({
        articleType: 'week-ahead',
        files: {
          intelligence: ['intelligence/synthesis-summary.md'],
        },
      }),
      'utf8',
    );
  }

  it('passes GREEN for week-ahead when no forward-statements-open.json exists', () => {
    writeWeekAheadManifest();
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
  });

  it('passes GREEN for week-ahead when forward-statements-open.json is empty array', () => {
    writeWeekAheadManifest();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    fs.writeFileSync(path.join(runDir, 'data/forward-statements-open.json'), '[]', 'utf8');
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
  });

  it('returns RED for week-ahead when open items exist but synthesis lacks the carried-forward section', () => {
    writeWeekAheadManifest();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    // Non-empty open items
    fs.writeFileSync(
      path.join(runDir, 'data/forward-statements-open.json'),
      JSON.stringify([{ id: 'abc', topic: 'banking-union', status: 'open' }]),
      'utf8',
    );
    // Synthesis without the required section
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    expect(result.stderr).toMatch(/forward-registry:missing-carried-forward-section/);
  });

  it('returns RED for week-ahead when forward-statements-open.json is non-array JSON', () => {
    writeWeekAheadManifest();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    // Valid JSON but unexpected shape should not bypass the section gate.
    fs.writeFileSync(
      path.join(runDir, 'data/forward-statements-open.json'),
      JSON.stringify({ id: 'abc', topic: 'banking-union', status: 'open' }),
      'utf8',
    );
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/forward-registry:missing-carried-forward-section/);
  });

  it('reports forward-registry failures once and includes them in --json results', () => {
    writeWeekAheadManifest();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'data/forward-statements-open.json'),
      JSON.stringify([{ id: 'abc', topic: 'banking-union', status: 'open' }]),
      'utf8',
    );
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere(['--json']);
    const occurrences = result.stderr.match(/forward-registry:missing-carried-forward-section/g) || [];
    expect(occurrences).toHaveLength(1);
    expect(result.stdout).toMatch(/"forward-registry:missing-carried-forward-section"/);
    const jsonLines = result.stdout.split('\n');
    const jsonStart = jsonLines.findIndex((line) => line.trim() === '{');
    expect(jsonStart).toBeGreaterThanOrEqual(0);
    const json = JSON.parse(jsonLines.slice(jsonStart).join('\n'));
    expect(json.artifacts).toBe(1);
    expect(json.results).toHaveLength(1);
    expect(json.results[0].relativePath).toBe('intelligence/synthesis-summary.md');
    expect(json.results[0].issues).toContain('forward-registry:missing-carried-forward-section');
  });

  it('passes GREEN for week-ahead when open items exist and synthesis has the carried-forward section', () => {
    writeWeekAheadManifest();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'data/forward-statements-open.json'),
      JSON.stringify([{ id: 'abc', topic: 'banking-union', status: 'open' }]),
      'utf8',
    );
    // Synthesis WITH the required section
    const synthBody = makeArtifact(250, { mermaid: true, wep: true, admiralty: true });
    const synthWithSection = `${synthBody}\n\n## Carried-Forward Forward Statements\n\nNo open items resolved this run.\n`;
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      synthWithSection,
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
  });

  it('does NOT apply forward-registry check to breaking article type', () => {
    // breaking manifest — even with a non-empty open.json, no section needed
    writeManifest();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'data/forward-statements-open.json'),
      JSON.stringify([{ id: 'abc', topic: 'defence', status: 'open' }]),
      'utf8',
    );
    fs.writeFileSync(
      path.join(runDir, 'intelligence/synthesis-summary.md'),
      makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
  });
});
