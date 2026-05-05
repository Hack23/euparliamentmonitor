// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { getHorizonConfig } from '../../scripts/config/article-horizons.js';

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
    // Uses 'test-type' (not in the article-horizons registry) so the
    // validator falls back to threshold-keys-only mandatory-artifact logic.
    thresholdsPath = path.join(tmp, 'thresholds.json');
    fs.writeFileSync(
      thresholdsPath,
      JSON.stringify({
        thresholds: {
          'test-type': {
            'intelligence/synthesis-summary.md': 200,
          },
          // Keep a breaking entry for tests that explicitly use breaking
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
        articleType: 'test-type',
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
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN articleType=test-type/);
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
    expect(json.articleType).toBe('test-type');
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
        articleType: 'test-economic',
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

  describe('IMF-primary policy: World Bank rejected for economic context', () => {
    function writeWBEconomicArtifact(extraBody = '') {
      writeEconomicContextManifest();
      fs.mkdirSync(path.join(runDir, 'cache/imf'), { recursive: true });
      fs.writeFileSync(
        path.join(
          runDir,
          'cache/imf/weo-ea-deu-fra-ita-gdp-inflation-fiscal.json',
        ),
        JSON.stringify({
          data: { dataSets: [{ series: { '0:0:0': { observations: { 0: [1.1] } } } }] },
        }),
        'utf8',
      );
      const body = [
        '# Economic Context',
        '',
        '## Document Metadata',
        '',
        '| Field | Value |',
        '|-------|-------|',
        '| **IMF Source** | live |',
        '',
        '## IMF Evidence',
        '',
        'IMF WEO April 2026 reports Germany at 1.1% real GDP growth, anchoring the policy reading.',
        '',
        extraBody,
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
      fs.writeFileSync(
        path.join(runDir, 'intelligence/economic-context.md'),
        body,
        'utf8',
      );
    }

    it('returns RED when economic-context cites a WB economic indicator code (NY.GDP.*)', () => {
      writeWBEconomicArtifact(
        'World Bank NY.GDP.MKTP.KD.ZG reports Germany at -0.5% in 2024.',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(
        /economic-context\.md.*wb-economic-code:NY\.GDP\.MKTP\.KD\.ZG/,
      );
    });

    it('returns RED for FP.CPI.* WB code in economic-context', () => {
      writeWBEconomicArtifact(
        'Inflation cross-check: World Bank FP.CPI.TOTL.ZG shows 5.4% in 2024.',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(
        /economic-context\.md.*wb-economic-code:FP\.CPI\.TOTL\.ZG/,
      );
    });

    it('returns RED for SL.UEM.* WB code in economic-context', () => {
      writeWBEconomicArtifact(
        'Unemployment series: World Bank SL.UEM.TOTL.ZS at 6.1% (2024).',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(
        /economic-context\.md.*wb-economic-code:SL\.UEM\.TOTL\.ZS/,
      );
    });

    it('returns RED for "World Bank GDP" prose claim without an SDMX code', () => {
      writeWBEconomicArtifact(
        'According to the World Bank, GDP growth in Germany was -0.5% in 2024.',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/economic-context\.md.*wb-economic-claim/);
    });

    it('returns RED for "World Bank inflation" prose claim', () => {
      writeWBEconomicArtifact(
        'World Bank data on inflation in the euro area reached 5.4% in 2024.',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/economic-context\.md.*wb-economic-claim/);
    });

    it('passes GREEN when economic-context cites WB only for non-economic governance (WGI)', () => {
      // World Bank Governance Indicator references are non-economic and
      // therefore explicitly allowed. The detector
      // must not trigger here.
      writeWBEconomicArtifact(
        'World Bank WGI governance score for the rule of law is 1.6 in 2024 — non-economic cross-ref only.',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('passes GREEN when economic-context cites WB social/health/education (non-economic)', () => {
      writeWBEconomicArtifact(
        'World Bank social indicator: life expectancy at birth in DE is 81 years (SP.DYN.LE00.IN, 2024) — non-economic cross-ref.',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('reports multiple WB economic violations in a single Stage-C pass', () => {
      // Regression guard for the matchAll() fix — a single artifact
      // citing several distinct WB economic series must surface all of
      // them to the editor in one validator run, not just the first.
      writeWBEconomicArtifact(
        'World Bank NY.GDP.MKTP.KD.ZG, FP.CPI.TOTL.ZG, and SL.UEM.TOTL.ZS series cited in violation of IMF-primary policy.',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      // All three violations must appear in stderr (the validator's
      // human-readable issue list); they are independently surfaced as
      // wb-economic-code:<CODE> entries.
      expect(result.stderr).toContain('wb-economic-code:NY.GDP.MKTP.KD.ZG');
      expect(result.stderr).toContain('wb-economic-code:FP.CPI.TOTL.ZG');
      expect(result.stderr).toContain('wb-economic-code:SL.UEM.TOTL.ZS');
    });
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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
        articleType: 'test-type',
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

  // week-ahead mandatory artifacts from the registry
  const WEEK_AHEAD_MANDATORY = (() => {
    const mandatoryArtifacts = getHorizonConfig('week-ahead')?.mandatoryArtifacts;

    if (!Array.isArray(mandatoryArtifacts)) {
      throw new Error(
        'Expected getHorizonConfig("week-ahead").mandatoryArtifacts to be defined as an array',
      );
    }

    return mandatoryArtifacts;
  })();

  function writeWeekAheadManifest() {
    fs.writeFileSync(
      path.join(runDir, 'manifest.json'),
      JSON.stringify({
        articleType: 'week-ahead',
        runDate: '2026-05-01',
        files: {
          classification: WEEK_AHEAD_MANDATORY.filter((a) => a.startsWith('classification/')),
          'risk-scoring': WEEK_AHEAD_MANDATORY.filter((a) => a.startsWith('risk-scoring/')),
          intelligence: WEEK_AHEAD_MANDATORY.filter((a) => a.startsWith('intelligence/')),
        },
      }),
      'utf8',
    );
  }

  function writeAllWeekAheadArtifacts() {
    // Ensure directories exist
    fs.mkdirSync(path.join(runDir, 'classification'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'risk-scoring'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'intelligence'), { recursive: true });
    for (const artifact of WEEK_AHEAD_MANDATORY) {
      fs.writeFileSync(
        path.join(runDir, artifact),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
    }
  }

  it('passes GREEN for week-ahead when no forward-statements-open.json exists', () => {
    writeWeekAheadManifest();
    writeAllWeekAheadArtifacts();
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
  });

  it('passes GREEN for week-ahead when forward-statements-open.json is empty array', () => {
    writeWeekAheadManifest();
    writeAllWeekAheadArtifacts();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    fs.writeFileSync(path.join(runDir, 'data/forward-statements-open.json'), '[]', 'utf8');
    const result = runHere();
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
  });

  it('returns RED for week-ahead when open items exist but synthesis lacks the carried-forward section', () => {
    writeWeekAheadManifest();
    writeAllWeekAheadArtifacts();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    // Non-empty open items
    fs.writeFileSync(
      path.join(runDir, 'data/forward-statements-open.json'),
      JSON.stringify([{ id: 'abc', topic: 'banking-union', status: 'open' }]),
      'utf8',
    );
    // Synthesis without the required section (overwrite the one from writeAllWeekAheadArtifacts)
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
    writeAllWeekAheadArtifacts();
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
    writeAllWeekAheadArtifacts();
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

    // stdout contains the STAGE_C_GATE line followed by JSON
    const jsonStart = result.stdout.indexOf('{');
    expect(jsonStart).toBeGreaterThan(-1);
    const json = JSON.parse(result.stdout.slice(jsonStart));
    expect(json.results).toBeInstanceOf(Array);

    const issues = json.results.flatMap((entry) => entry.issues || []);
    expect(issues).toContain('forward-registry:missing-carried-forward-section');
  });

  it('passes GREEN for week-ahead when open items exist and synthesis has the carried-forward section', () => {
    writeWeekAheadManifest();
    writeAllWeekAheadArtifacts();
    fs.mkdirSync(path.join(runDir, 'data'), { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'data/forward-statements-open.json'),
      JSON.stringify([{ id: 'abc', topic: 'banking-union', status: 'open' }]),
      'utf8',
    );
    // Synthesis WITH the required section (overwrite)
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

  // ─── Forward-projection mandatory gate (§9.4) ──────────────────────────────

  // month-ahead mandatory artifacts from the registry
  const MONTH_AHEAD_MANDATORY = (() => {
    const mandatoryArtifacts = getHorizonConfig('month-ahead')?.mandatoryArtifacts;
    if (!Array.isArray(mandatoryArtifacts)) {
      throw new Error(
        'Expected getHorizonConfig("month-ahead").mandatoryArtifacts to be defined as an array',
      );
    }
    return mandatoryArtifacts;
  })();

  function writeMonthAheadManifest() {
    fs.writeFileSync(
      path.join(runDir, 'manifest.json'),
      JSON.stringify({
        articleType: 'month-ahead',
        runDate: '2026-05-01',
        files: {
          classification: MONTH_AHEAD_MANDATORY.filter((a) => a.startsWith('classification/')),
          'risk-scoring': MONTH_AHEAD_MANDATORY.filter((a) => a.startsWith('risk-scoring/')),
          intelligence: MONTH_AHEAD_MANDATORY.filter((a) => a.startsWith('intelligence/')),
        },
      }),
      'utf8',
    );
  }

  function writeAllMonthAheadArtifacts() {
    fs.mkdirSync(path.join(runDir, 'classification'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'risk-scoring'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'intelligence'), { recursive: true });
    for (const artifact of MONTH_AHEAD_MANDATORY) {
      fs.writeFileSync(
        path.join(runDir, artifact),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
    }
  }

  it('returns RED for week-ahead when forward-projection.md is missing (§9.4)', () => {
    writeWeekAheadManifest();
    writeAllWeekAheadArtifacts();
    // Remove forward-projection to simulate a missing artifact
    fs.unlinkSync(path.join(runDir, 'intelligence/forward-projection.md'));
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    expect(result.stderr).toMatch(/missing/);
  });

  it('returns RED for month-ahead when forward-projection.md is missing (§9.4)', () => {
    writeMonthAheadManifest();
    writeAllMonthAheadArtifacts();
    // Remove forward-projection to simulate a missing artifact
    fs.unlinkSync(path.join(runDir, 'intelligence/forward-projection.md'));
    const result = runHere();
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    expect(result.stderr).toMatch(/missing/);
  });

  it('returns RED for month-ahead when forward-projection.md is below floor (§9.4)', () => {
    writeMonthAheadManifest();
    writeAllMonthAheadArtifacts();
    // Overwrite with a too-short file (floor is 120 for month-ahead)
    fs.writeFileSync(
      path.join(runDir, 'intelligence/forward-projection.md'),
      makeArtifact(30, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    // Write a dedicated fixture with only the forward-projection floor
    const fpThresholds = path.join(tmp, 'fp-thresholds.json');
    fs.writeFileSync(
      fpThresholds,
      JSON.stringify({
        thresholds: {
          'month-ahead': {
            'intelligence/forward-projection.md': 120,
          },
        },
        tradecraftQualitySignals: {
          wepBandRequired: ['intelligence/forward-projection.md'],
          admiraltyGradeRequired: ['intelligence/forward-projection.md'],
        },
      }),
      'utf8',
    );
    const result = run(runDir, ['--thresholds', fpThresholds]);
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    expect(result.stderr).toMatch(/short/);
  });

  it('returns RED for week-ahead when forward-projection.md is below floor (§9.4)', () => {
    writeWeekAheadManifest();
    writeAllWeekAheadArtifacts();
    // Overwrite with a too-short file (floor is 80 for week-ahead)
    fs.writeFileSync(
      path.join(runDir, 'intelligence/forward-projection.md'),
      makeArtifact(20, { mermaid: true, wep: true, admiralty: true }),
      'utf8',
    );
    // Write a dedicated fixture with only the forward-projection floor
    const fpThresholds = path.join(tmp, 'fp-thresholds.json');
    fs.writeFileSync(
      fpThresholds,
      JSON.stringify({
        thresholds: {
          'week-ahead': {
            'intelligence/forward-projection.md': 80,
          },
        },
        tradecraftQualitySignals: {
          wepBandRequired: ['intelligence/forward-projection.md'],
          admiraltyGradeRequired: ['intelligence/forward-projection.md'],
        },
      }),
      'utf8',
    );
    const result = run(runDir, ['--thresholds', fpThresholds]);
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    expect(result.stderr).toMatch(/short/);
  });

  // ─── Re-run improve/extend enforcement ───────────────────────────────────

  describe('Re-run improve/extend enforcement', () => {
    function writeManifestRerun(extra = {}) {
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          history: [{ runId: 'breaking-run-1714128000', gateResult: 'GREEN', filesWritten: [] }],
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
          pass2: {
            startedAt: '2026-04-30T08:00:00Z',
            endedAt: '2026-04-30T08:15:00Z',
            rewriteCount: 3,
          },
          ...extra,
        }),
        'utf8',
      );
    }

    function writePriorRunDiff(carryForward = []) {
      fs.mkdirSync(path.join(runDir, 'runs'), { recursive: true });
      fs.writeFileSync(
        path.join(runDir, 'runs/prior-run-diff.json'),
        JSON.stringify({
          enabled: true,
          mode: 'improve-and-extend',
          runDir: 'analysis/daily/2026-04-30/breaking',
          articleType: 'test-type',
          priorRunId: 'breaking-run-1714128000',
          carryForward,
          rewrite: [],
        }),
        'utf8',
      );
    }

    it('passes GREEN on re-run when artifact meets extendFloor', () => {
      // extendFloor = max(200 floor, 250 priorLines + 20) = 270
      writePriorRunDiff([
        {
          relativePath: 'intelligence/synthesis-summary.md',
          lines: 250,
          priorLines: 250,
          floor: 200,
          extendFloor: 270,
          source: 'extend-from-prior:breaking-run-1714128000',
        },
      ]);
      writeManifestRerun();
      // Write artifact at 275 lines — above extendFloor of 270
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(275, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('returns RED on re-run when artifact is below extendFloor', () => {
      // extendFloor = 270 but artifact only has 250 lines
      writePriorRunDiff([
        {
          relativePath: 'intelligence/synthesis-summary.md',
          lines: 250,
          priorLines: 250,
          floor: 200,
          extendFloor: 270,
          source: 'extend-from-prior:breaking-run-1714128000',
        },
      ]);
      writeManifestRerun();
      // Write at exactly the prior-run size (250) — below extendFloor
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
      expect(result.stderr).toMatch(/extend:below-extendFloor/);
    });

    it('returns RED on re-run when pass2.rewriteCount === 0', () => {
      writePriorRunDiff([]);
      // Manifest with history but zero rewriteCount
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          history: [{ runId: 'breaking-run-1714128000', gateResult: 'GREEN', filesWritten: [] }],
          files: { intelligence: ['intelligence/synthesis-summary.md'] },
          pass2: {
            startedAt: '2026-04-30T08:00:00Z',
            endedAt: '2026-04-30T08:15:00Z',
            rewriteCount: 0,
          },
        }),
        'utf8',
      );
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(280, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
      expect(result.stderr).toMatch(/rerun-no-op/);
    });

    it('warns (not RED) on first run when pass2.rewriteCount === 0 and artifact at floor', () => {
      // No history[] → first run; the old WARN behaviour is preserved.
      writeManifest();
      // Override with a pass2 zero-rewrites manifest (no history)
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          files: { intelligence: ['intelligence/synthesis-summary.md'] },
          pass2: {
            startedAt: '2026-04-30T08:00:00Z',
            endedAt: '2026-04-30T08:15:00Z',
            rewriteCount: 0,
          },
        }),
        'utf8',
      );
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(200, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      // Should still be GREEN (just a warning, not RED) on first run
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
      expect(result.stderr).toMatch(/pass2-skipped-heuristic/);
      expect(result.stderr).not.toMatch(/rerun-no-op/);
    });

    it('passes GREEN on re-run with no prior-run-diff.json (extendFloor not enforced)', () => {
      // If prior-run-diff.json is absent, extendFloor is not checked — the
      // normal threshold floor is the only constraint.
      writeManifestRerun();
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(210, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('--json output includes isRerun:true on re-run', () => {
      writeManifestRerun();
      writePriorRunDiff([]);
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(210, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere(['--json']);
      expect(result.code).toBe(0);
      const jsonStart = result.stdout.indexOf('{');
      const json = JSON.parse(result.stdout.slice(jsonStart));
      expect(json.isRerun).toBe(true);
    });

    it('--json output includes isRerun:false on first run', () => {
      writeManifest();
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(210, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere(['--json']);
      expect(result.code).toBe(0);
      const jsonStart = result.stdout.indexOf('{');
      const json = JSON.parse(result.stdout.slice(jsonStart));
      expect(json.isRerun).toBe(false);
    });
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

  describe('Long-horizon scenario-count gate', () => {
    function writeLongHorizonThresholds(articleType) {
      fs.writeFileSync(
        thresholdsPath,
        JSON.stringify({
          thresholds: {
            [articleType]: {
              'intelligence/scenario-forecast.md': 360,
            },
          },
          tradecraftQualitySignals: {},
          structuralRequirements: {
            longHorizonScenarioGate: {
              articleTypes: ['test-term-outlook', 'test-election-cycle'],
              minScenarios: 6,
              artifact: 'intelligence/scenario-forecast.md',
            },
          },
        }),
        'utf8',
      );
    }

    function writeLongHorizonManifest(articleType) {
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType,
          files: {
            intelligence: ['intelligence/scenario-forecast.md'],
          },
        }),
        'utf8',
      );
    }

    function makeScenarioForecast(scenarioCount) {
      const lines = [
        '# Scenario Forecast',
        '',
        '## 1️⃣ Horizon Statement',
        '',
        'Horizon: 36 months.',
        '',
        '```mermaid',
        'flowchart TD',
        '    BASELINE[Baseline] --> S1[Scenario 1]',
        '```',
        '',
      ];
      for (let i = 1; i <= scenarioCount; i += 1) {
        lines.push(`### Scenario ${i}: Some Scenario`);
        lines.push('');
        lines.push('Narrative text here.');
        lines.push('');
      }
      // Pad to 400 lines for the floor
      while (lines.length < 400) lines.push(`Filler line ${lines.length}`);
      return lines.join('\n');
    }

    it('returns RED for term-outlook when scenario-forecast has fewer than 6 scenarios', () => {
      writeLongHorizonThresholds('test-term-outlook');
      writeLongHorizonManifest('test-term-outlook');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(4),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/long-horizon-scenario-count:4<6/);
      expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    });

    it('passes GREEN for term-outlook when scenario-forecast has exactly 6 scenarios', () => {
      writeLongHorizonThresholds('test-term-outlook');
      writeLongHorizonManifest('test-term-outlook');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(6),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('passes GREEN for term-outlook when scenario-forecast has more than 6 scenarios', () => {
      writeLongHorizonThresholds('test-term-outlook');
      writeLongHorizonManifest('test-term-outlook');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(8),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('returns RED for election-cycle when scenario-forecast has fewer than 6 scenarios', () => {
      writeLongHorizonThresholds('test-election-cycle');
      writeLongHorizonManifest('test-election-cycle');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(3),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/long-horizon-scenario-count:3<6/);
    });

    it('does NOT apply scenario-count gate to non-targeted article type', () => {
      // Use the long-horizon thresholds but a non-targeted article type —
      // the gate should not fire even if scenario-forecast has only 3 scenarios.
      writeLongHorizonThresholds('test-type');
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          files: {
            intelligence: ['intelligence/scenario-forecast.md'],
          },
        }),
        'utf8',
      );
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(3),
        'utf8',
      );
      const result = runHere();
      // Gate is not targeting test-type, so no long-horizon issue.
      expect(result.stderr).not.toMatch(/long-horizon-scenario-count/);
    });

    it('does NOT apply scenario-count gate when longHorizonScenarioGate is absent from thresholds', () => {
      // Use minimal thresholds with no longHorizonScenarioGate field
      fs.writeFileSync(
        thresholdsPath,
        JSON.stringify({
          thresholds: {
            'test-term-outlook': {
              'intelligence/scenario-forecast.md': 360,
            },
          },
          tradecraftQualitySignals: {},
          structuralRequirements: {},
        }),
        'utf8',
      );
      writeLongHorizonManifest('test-term-outlook');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(3),
        'utf8',
      );
      const result = runHere();
      expect(result.stderr).not.toMatch(/long-horizon-scenario-count/);
    });

    it('exits 1 with invalid-config error when longHorizonScenarioGate targets articleType but has missing artifact', () => {
      fs.writeFileSync(
        thresholdsPath,
        JSON.stringify({
          thresholds: {},
          tradecraftQualitySignals: {},
          structuralRequirements: {
            longHorizonScenarioGate: {
              articleTypes: ['test-term-outlook'],
              minScenarios: 6,
              // artifact field intentionally omitted
            },
          },
        }),
        'utf8',
      );
      writeLongHorizonManifest('test-term-outlook');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(6),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/long-horizon-scenario-gate:invalid-config/);
    });

    it('exits 1 with invalid-config error when longHorizonScenarioGate targets articleType but minScenarios is zero', () => {
      fs.writeFileSync(
        thresholdsPath,
        JSON.stringify({
          thresholds: {},
          tradecraftQualitySignals: {},
          structuralRequirements: {
            longHorizonScenarioGate: {
              articleTypes: ['test-term-outlook'],
              minScenarios: 0,
              artifact: 'intelligence/scenario-forecast.md',
            },
          },
        }),
        'utf8',
      );
      writeLongHorizonManifest('test-term-outlook');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(6),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/long-horizon-scenario-gate:invalid-config/);
    });

    it('counts hyphenated scenario IDs (e.g. A-24) correctly', () => {
      writeLongHorizonThresholds('test-term-outlook');
      writeLongHorizonManifest('test-term-outlook');
      // Build a scenario-forecast using hyphenated IDs
      const lines = [
        '# Scenario Forecast',
        '',
        '## 1️⃣ Horizon Statement',
        '',
        'Horizon: 36 months.',
        '',
        '```mermaid',
        'flowchart TD',
        '    BASELINE[Baseline] --> S1[Scenario A-1]',
        '```',
        '',
      ];
      const ids = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'C-1'];
      for (const id of ids) {
        lines.push(`### Scenario ${id}: Some Scenario`);
        lines.push('');
        lines.push('Narrative text here.');
        lines.push('');
      }
      while (lines.length < 400) lines.push(`Filler line ${lines.length}`);
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        lines.join('\n'),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('excludes scenario headings from worked-example section', () => {
      writeLongHorizonThresholds('test-term-outlook');
      writeLongHorizonManifest('test-term-outlook');
      // Only 3 real scenarios, plus 4 in the worked example — should fail
      const lines = [
        '# Scenario Forecast',
        '',
        '## 1️⃣ Horizon Statement',
        '',
        'Horizon: 36 months.',
        '',
        '```mermaid',
        'flowchart TD',
        '    BASELINE[Baseline] --> S1[Scenario 1]',
        '```',
        '',
      ];
      for (let i = 1; i <= 3; i += 1) {
        lines.push(`### Scenario ${i}: Real Scenario`);
        lines.push('');
        lines.push('Narrative text here.');
        lines.push('');
      }
      lines.push('## 🛠️ Worked example');
      lines.push('');
      for (let i = 1; i <= 4; i += 1) {
        lines.push(`### Scenario X${i}: Example Scenario`);
        lines.push('');
        lines.push('Example text.');
        lines.push('');
      }
      while (lines.length < 400) lines.push(`Filler line ${lines.length}`);
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        lines.join('\n'),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/long-horizon-scenario-count:3<6/);
    });

    it('rejects path-traversal in artifact config', () => {
      fs.writeFileSync(
        thresholdsPath,
        JSON.stringify({
          thresholds: {
            'test-term-outlook': {
              'intelligence/scenario-forecast.md': 360,
            },
          },
          tradecraftQualitySignals: {},
          structuralRequirements: {
            longHorizonScenarioGate: {
              articleTypes: ['test-term-outlook'],
              minScenarios: 6,
              artifact: '../../../etc/passwd',
            },
          },
        }),
        'utf8',
      );
      writeLongHorizonManifest('test-term-outlook');
      fs.writeFileSync(
        path.join(runDir, 'intelligence/scenario-forecast.md'),
        makeScenarioForecast(6),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('STAGE_C_GATE: RED');
    });
  });

  // ─── Registry-driven mandatory artifacts ──────────────────────────────────

  describe('Registry-driven mandatory artifacts', () => {
    it('uses registry mandatoryArtifacts when slug is in the registry', () => {
      // breaking is in the registry — validator should require registry artifacts
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'breaking',
          files: { intelligence: ['intelligence/synthesis-summary.md'] },
        }),
        'utf8',
      );
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      // Should be RED because registry mandates many more artifacts
      expect(result.code).toBe(1);
      expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
      // Some registry artifact should be flagged as missing
      expect(result.stderr).toMatch(/missing/);
    });

    it('falls back to threshold keys when slug is NOT in the registry', () => {
      // test-type is NOT in the registry — old behavior: threshold keys + manifest
      writeManifest();
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

  // ─── Electoral-overlay gate (requireElectoralOverlay) ─────────────────────

  describe('Electoral-overlay gate (requireElectoralOverlay)', () => {
    it('returns RED when electoralOverlay is true but Family-D artifacts are missing', () => {
      // term-outlook has electoralOverlay: true in the registry
      // Provide all registry mandatory artifacts EXCEPT the Family-D ones
      const cfg = getHorizonConfig('term-outlook');
      expect(cfg).toBeDefined();
      const allMandatory = cfg.mandatoryArtifacts;
      const familyD = [
        'intelligence/seat-projection.md',
        'intelligence/term-arc.md',
        'intelligence/mandate-fulfilment-scorecard.md',
      ];
      // Write manifest with all mandatory artifacts
      const byDir = {};
      for (const a of allMandatory) {
        const dir = a.split('/')[0];
        if (!byDir[dir]) byDir[dir] = [];
        byDir[dir].push(a);
      }
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({ articleType: 'term-outlook', files: byDir }),
        'utf8',
      );
      // Write all artifacts EXCEPT Family-D
      fs.mkdirSync(path.join(runDir, 'threat-assessment'), { recursive: true });
      for (const artifact of allMandatory) {
        if (familyD.includes(artifact)) continue;
        const dir = path.dirname(path.join(runDir, artifact));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(runDir, artifact),
          makeArtifact(400, { mermaid: true, wep: true, admiralty: true }),
          'utf8',
        );
      }
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/electoral-overlay:required/);
    });

    it('does NOT fire electoral-overlay gate for non-electoral article types', () => {
      // test-type is not in the registry, so electoralOverlay is not checked
      writeManifest();
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).not.toMatch(/electoral-overlay/);
    });
  });

  // ─── Long-horizon structural-break gate ───────────────────────────────────

  describe('Long-horizon structural-break gate', () => {
    it('returns RED when scenarioMaxHorizonMonths >= 36 and scenario-forecast lacks structural-break content', () => {
      // term-outlook has scenarioMaxHorizonMonths: 36
      // Write a minimal scenario-forecast without structural-break content
      const cfg = getHorizonConfig('term-outlook');
      expect(cfg).toBeDefined();
      const allMandatory = cfg.mandatoryArtifacts;
      const byDir = {};
      for (const a of allMandatory) {
        const dir = a.split('/')[0];
        if (!byDir[dir]) byDir[dir] = [];
        byDir[dir].push(a);
      }
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({ articleType: 'term-outlook', files: byDir }),
        'utf8',
      );
      fs.mkdirSync(path.join(runDir, 'threat-assessment'), { recursive: true });
      for (const artifact of allMandatory) {
        const dir = path.dirname(path.join(runDir, artifact));
        fs.mkdirSync(dir, { recursive: true });
        // scenario-forecast without structural-break content
        fs.writeFileSync(
          path.join(runDir, artifact),
          makeArtifact(400, { mermaid: true, wep: true, admiralty: true }),
          'utf8',
        );
      }
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/long-horizon-structural-break:missing/);
    });

    it('passes when scenario-forecast contains structural-break content', () => {
      const cfg = getHorizonConfig('term-outlook');
      expect(cfg).toBeDefined();
      const allMandatory = cfg.mandatoryArtifacts;
      const byDir = {};
      for (const a of allMandatory) {
        const dir = a.split('/')[0];
        if (!byDir[dir]) byDir[dir] = [];
        byDir[dir].push(a);
      }
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({ articleType: 'term-outlook', files: byDir }),
        'utf8',
      );
      fs.mkdirSync(path.join(runDir, 'threat-assessment'), { recursive: true });
      for (const artifact of allMandatory) {
        const dir = path.dirname(path.join(runDir, artifact));
        fs.mkdirSync(dir, { recursive: true });
        if (artifact === 'intelligence/scenario-forecast.md') {
          // Include structural-break and regime-change content + 6 scenarios
          const lines = [
            '# Scenario Forecast',
            '',
            '## Structural-Break Assessment',
            '',
            'Coalition-cohesion drop detected. Regime change branch activated.',
            '',
            '```mermaid',
            'flowchart TD',
            'A --> B',
            '```',
            '',
          ];
          for (let i = 1; i <= 6; i++) {
            lines.push(`### Scenario ${i}: Test`);
            lines.push('');
            lines.push('Narrative text.');
            lines.push('');
          }
          while (lines.length < 400) lines.push(`Filler line ${lines.length}`);
          fs.writeFileSync(path.join(runDir, artifact), lines.join('\n'), 'utf8');
        } else {
          fs.writeFileSync(
            path.join(runDir, artifact),
            makeArtifact(400, { mermaid: true, wep: true, admiralty: true }),
            'utf8',
          );
        }
      }
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
      expect(result.stderr).not.toMatch(/long-horizon-structural-break:missing/);
    });

    it('does NOT fire structural-break gate for short-horizon article types', () => {
      // test-type is not in the registry so scenarioMaxHorizonMonths is not checked
      writeManifest();
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).not.toMatch(/long-horizon-structural-break/);
    });
  });

  describe('dataMode threshold reduction', () => {
    it('passes GREEN when artifact meets reduced floor under degraded-imf mode', () => {
      // With floor=200 and degraded-imf reduction (0.85), effective floor = 170
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'degraded-imf',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Write 175 lines — above 170 (reduced floor) but below 200 (full floor)
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(175, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).toMatch(/dataMode="degraded-imf"/);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('still fails RED when artifact is below even the reduced floor', () => {
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'degraded-imf',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Write 100 lines — below 170 reduced floor
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(100, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
    });

    it('applies title-only mode with 0.75 reduction factor', () => {
      // With floor=200 and title-only reduction (0.75), effective floor = 150
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'title-only',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Write 155 lines — above 150 (reduced floor) but below 200 (full floor)
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(155, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).toMatch(/dataMode="title-only"/);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('applies minimal mode with 0.65 reduction factor', () => {
      // With floor=200 and minimal reduction (0.65), effective floor = 130
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'minimal',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Write 135 lines — above 130 (reduced floor) but below 200 (full floor)
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(135, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).toMatch(/dataMode="minimal"/);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('applies degraded-voting mode with 0.85 reduction factor', () => {
      // With floor=200 and degraded-voting reduction (0.85), effective floor = 170
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'degraded-voting',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Write 175 lines — above 170 (reduced floor) but below 200 (full floor)
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(175, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stderr).toMatch(/dataMode="degraded-voting"/);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });

    it('treats unknown dataMode as full (no reduction) and emits warning', () => {
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'unknown-mode',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Write 195 lines — below 200 full floor
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(195, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
      expect(result.stderr).toMatch(/not a recognized value/);
    });

    it('does not reduce structural checks (mermaid still required)', () => {
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'minimal',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Meets reduced line floor but missing mermaid
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(200, { mermaid: false, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(1);
      expect(result.stderr).toMatch(/mermaid:missing/);
    });

    it('does not reduce --min-lines CLI floor even under degraded mode', () => {
      // --min-lines 300 must NOT be reduced by dataMode; it always raises floors
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'minimal',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
          },
        }),
        'utf8',
      );
      // Write 250 lines — above reduced perFloor (200*0.65=130) but below --min-lines 300
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(250, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      const result = runHere(['--min-lines', '300']);
      expect(result.code).toBe(1);
      expect(result.stdout).toMatch(/STAGE_C_GATE: RED/);
      // The effective floor should be 300 (CLI), not 130 (reduced perFloor)
      expect(result.stderr).toMatch(/short:250<300/);
    });

    it('reduces default 30-line floor for artifacts without per-artifact threshold', () => {
      // classification/actor-mapping.md has no perArtifactFloors entry,
      // so it falls back to DEFAULT_MIN_LINES (30). Under minimal mode
      // (0.65 factor), effective floor = floor(30*0.65) = 19.
      fs.writeFileSync(
        path.join(runDir, 'manifest.json'),
        JSON.stringify({
          articleType: 'test-type',
          dataMode: 'minimal',
          files: {
            intelligence: ['intelligence/synthesis-summary.md'],
            classification: ['classification/actor-mapping.md'],
          },
        }),
        'utf8',
      );
      fs.writeFileSync(
        path.join(runDir, 'intelligence/synthesis-summary.md'),
        makeArtifact(200, { mermaid: true, wep: true, admiralty: true }),
        'utf8',
      );
      // Write 22 lines — above reduced default floor (19) but below unreduced 30
      fs.mkdirSync(path.join(runDir, 'classification'), { recursive: true });
      fs.writeFileSync(
        path.join(runDir, 'classification/actor-mapping.md'),
        makeArtifact(22, { mermaid: true }),
        'utf8',
      );
      const result = runHere();
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/STAGE_C_GATE: GREEN/);
    });
  });
});
