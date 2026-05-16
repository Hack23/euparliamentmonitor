// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/validate-brief-translations.js.
 *
 * Exercises each of the five quality gates in isolation against a temporary
 * `analysis/daily/` layout.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  LENGTH_FLOOR_RATIO,
  MAX_ENGLISH_PATTERNS,
  HEADING_TOLERANCE,
  EN_PATTERNS,
  FIXED_TOKEN_PATTERNS,
  parseArgs,
  findAllTranslations,
  validateTranslation,
  runValidation,
  countHeadings,
  countMermaidBlocks,
  aggregateByKey,
  main,
} from '../../scripts/validate-brief-translations.js';

let tmpRoot;

function writeSource(date, slug, body) {
  const dir = path.join(tmpRoot, 'analysis', 'daily', date, slug);
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, 'executive-brief.md');
  fs.writeFileSync(p, body);
  return p;
}

function writeTranslation(date, slug, lang, body) {
  const dir = path.join(tmpRoot, 'analysis', 'daily', date, slug);
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, `executive-brief_${lang}.md`);
  fs.writeFileSync(p, body);
  return p;
}

const REALISTIC_SOURCE = [
  '# Executive Brief — Breaking News',
  '**Date:** 2026-05-15',
  '**Classification:** UNCLASSIFIED // OPEN SOURCE',
  '',
  '## 🎯 BLUF',
  'The European Parliament adopted TA-10-2026-0160 on DMA enforcement.',
  'The IMF World Economic Outlook (WEO) data-vintage="WEO-April-2026" forecasts 1.4% growth.',
  'Procedure 2024/0001(COD) advances to trilogue.',
  '**Confidence: 🟢 HIGH** — based on official EP adopted texts.',
  '',
  '## 📋 60-Second Read',
  'Five key facts about the plenary session.',
  '',
  'Repeat content to give the file a meaningful byte size '.repeat(40),
].join('\n');

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-brief-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('validate-brief-translations', () => {
  describe('constants', () => {
    it('exports a 50% length floor', () => {
      expect(LENGTH_FLOOR_RATIO).toBe(0.5);
    });

    it('caps tolerated English patterns at 4', () => {
      expect(MAX_ENGLISH_PATTERNS).toBe(4);
    });

    it('includes a representative English-only pattern set', () => {
      expect(EN_PATTERNS.length).toBeGreaterThanOrEqual(5);
      expect(EN_PATTERNS.some((re) => re.test('the European Parliament adopted'))).toBe(true);
      expect(EN_PATTERNS.some((re) => re.test('Bottom Line Up Front'))).toBe(true);
    });

    it('includes IMF / WEO / TA-id / procedure-id fixed tokens', () => {
      const hay = 'IMF WEO TA-10-2026-0160 2024/0001(COD) data-vintage="WEO-April-2026" World Bank';
      let matched = 0;
      for (const re of FIXED_TOKEN_PATTERNS) {
        if (re.test(hay)) matched += 1;
      }
      expect(matched).toBeGreaterThanOrEqual(5);
    });
  });

  describe('parseArgs', () => {
    it('returns defaults', () => {
      const opts = parseArgs([]);
      expect(opts.paths).toEqual([]);
      expect(opts.fail).toBe(true);
      expect(opts.quiet).toBe(false);
    });

    it('collects multiple --paths until the next flag', () => {
      const opts = parseArgs(['--paths', 'a.md', 'b.md', '--quiet']);
      expect(opts.paths).toEqual(['a.md', 'b.md']);
      expect(opts.quiet).toBe(true);
    });

    it('honours --no-fail', () => {
      const opts = parseArgs(['--no-fail']);
      expect(opts.fail).toBe(false);
    });
  });

  describe('findAllTranslations', () => {
    it('returns empty array when analysis/daily missing', () => {
      expect(findAllTranslations(tmpRoot)).toEqual([]);
    });

    it('walks every nested executive-brief_<lang>.md', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      writeTranslation('2026-05-15', 'breaking', 'sv', REALISTIC_SOURCE);
      writeTranslation('2026-05-15', 'breaking', 'de', REALISTIC_SOURCE);
      writeSource('2026-05-14', 'motions', REALISTIC_SOURCE);
      writeTranslation('2026-05-14', 'motions', 'fr', REALISTIC_SOURCE);
      const out = findAllTranslations(tmpRoot);
      expect(out).toHaveLength(3);
    });
  });

  describe('validateTranslation gates', () => {
    it('passes a high-fidelity translation', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      // Plausible Swedish translation: contains FIXED TOKENS verbatim, no
      // English sentence patterns, length close to source.
      const sv = [
        '# Sammanfattning — Brådskande nyheter',
        '**Datum:** 2026-05-15',
        '**Klassificering:** UNCLASSIFIED // OPEN SOURCE',
        '',
        '## 🎯 BLUF',
        'Europaparlamentet antog TA-10-2026-0160 om DMA-tillsyn.',
        'IMF World Economic Outlook (WEO) data-vintage="WEO-April-2026" prognosticerar 1,4 % tillväxt.',
        'Förfarande 2024/0001(COD) går vidare till trilog.',
        '**Säkerhet: 🟢 HÖG** — baserat på officiella EP-texter.',
        '',
        '## 📋 60-sekunders sammanfattning',
        'Fem nyckelfakta om plenarsammanträdet.',
        '',
        'Upprepa innehåll för att ge filen en meningsfull byte-storlek '.repeat(40),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', sv);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations).toEqual([]);
    });

    it('flags an invalid filename', () => {
      const dir = path.join(tmpRoot, 'analysis', 'daily', '2026-05-15', 'breaking');
      fs.mkdirSync(dir, { recursive: true });
      const bad = path.join(dir, 'executive-brief_xx-bogus.md');
      fs.writeFileSync(bad, '# stub');
      const violations = validateTranslation(bad, tmpRoot);
      expect(violations).toHaveLength(1);
      expect(violations[0].gate).toBe('filename');
    });

    it('rejects unsupported language codes that still match the suffix pattern', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      // 'pt' has the right shape (two lowercase letters) but is not in TARGET_LANGS.
      const target = writeTranslation('2026-05-15', 'breaking', 'pt', REALISTIC_SOURCE);
      const violations = validateTranslation(target, tmpRoot);
      const gates = violations.map((v) => v.gate);
      expect(gates).toContain('language-code');
    });

    it('flags missing source file (orphan translation)', () => {
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', REALISTIC_SOURCE);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.some((v) => v.gate === 'source-presence')).toBe(true);
    });

    it('flags translation below the length floor', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', '# Stub\nKorts.');
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.some((v) => v.gate === 'length-floor')).toBe(true);
    });

    it('flags English fall-through when the translation is a copy of the source', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', REALISTIC_SOURCE);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.some((v) => v.gate === 'english-fallthrough')).toBe(true);
    });

    it('flags missing fixed tokens (e.g. IMF dropped from the translation)', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      const bodyWithoutImf = [
        '# Resumen — Noticias urgentes',
        '**Fecha:** 2026-05-15',
        '**Clasificación:** UNCLASSIFIED // OPEN SOURCE',
        '',
        '## 🎯 BLUF',
        'El Parlamento Europeo adoptó TA-10-2026-0160 sobre la aplicación de la DMA.',
        'El procedimiento 2024/0001(COD) avanza al trílogo.',
        '**Confianza: 🟢 ALTA** — basado en textos oficiales del PE.',
        '',
        '## 📋 Lectura de 60 segundos',
        'Cinco datos clave sobre la sesión plenaria.',
        '',
        'Repetir contenido para dar al archivo un tamaño significativo '.repeat(40),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'es', bodyWithoutImf);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.some((v) => v.gate === 'fixed-token-preservation')).toBe(true);
    });

    it('flags altered or dropped exact fixed-token instances', () => {
      writeSource('2026-05-15', 'breaking', [
        REALISTIC_SOURCE,
        'Follow-up TA-10-2026-0161 cites data-vintage="WEO-October-2026".',
        'Extra content '.repeat(80),
      ].join('\n'));
      const altered = [
        '# Sammanfattning — Brådskande nyheter',
        '**Datum:** 2026-05-15',
        '**Klassificering:** UNCLASSIFIED // OPEN SOURCE',
        '',
        '## 🎯 BLUF',
        'Europaparlamentet antog TA-10-2026-0160 om DMA-tillsyn.',
        'IMF World Economic Outlook (WEO) data-vintage="WEO-April-2026" prognosticerar 1,4 % tillväxt.',
        'Förfarande 2024/0001(COD) går vidare till trilog.',
        'Uppföljningen TA-10-2026-9999 hänvisar till data-vintage="WEO-November-2026".',
        '',
        'Upprepa innehåll för att ge filen en meningsfull byte-storlek '.repeat(80),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', altered);
      const violations = validateTranslation(target, tmpRoot);
      const fixed = violations.filter((v) => v.gate === 'fixed-token-preservation');
      expect(fixed.length).toBeGreaterThan(0);
      expect(fixed.map((v) => v.message).join('\n')).toContain('TA-10-2026-0161');
      expect(fixed.map((v) => v.message).join('\n')).toContain('data-vintage="WEO-October-2026"');
    });
  });

  describe('runValidation', () => {
    it('aggregates violations across multiple files', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      const stub = writeTranslation('2026-05-15', 'breaking', 'sv', '# Stub');
      const copy = writeTranslation('2026-05-15', 'breaking', 'de', REALISTIC_SOURCE);
      const result = runValidation([stub, copy], tmpRoot, { quiet: true });
      const gates = result.map((v) => v.gate);
      expect(gates).toContain('length-floor');
      expect(gates).toContain('english-fallthrough');
    });

    it('returns an empty array when every file passes', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      // The Swedish-style copy used in the happy-path test is reused here.
      const sv = REALISTIC_SOURCE
        .replace('Executive Brief', 'Sammanfattning')
        .replace('The European Parliament adopted', 'Europaparlamentet antog')
        .replace('The IMF World Economic Outlook', 'IMF World Economic Outlook')
        .replace('Procedure', 'Förfarande')
        .replace('Confidence', 'Säkerhet')
        .replace('Five key facts', 'Fem nyckelfakta')
        .replace(/Repeat content.*/g, 'Upprepa innehåll för att ge filen en meningsfull byte-storlek '.repeat(50));
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', sv);
      expect(runValidation([target], tmpRoot, { quiet: true })).toEqual([]);
    });
  });

  describe('heading-parity gate', () => {
    it('exposes a small non-zero tolerance for H2/H3', () => {
      expect(HEADING_TOLERANCE).toBe(1);
    });

    it('counts H1/H2/H3 occurrences correctly', () => {
      const sample = '# H1\n## H2 one\n## H2 two\n### H3 a\n### H3 b\n### H3 c\nbody\n';
      expect(countHeadings(sample, 1)).toBe(1);
      expect(countHeadings(sample, 2)).toBe(2);
      expect(countHeadings(sample, 3)).toBe(3);
    });

    it('flags a translation that drops H2 sections beyond tolerance', () => {
      const richSource = [
        '# Brief',
        '## Section A',
        'body a',
        '## Section B',
        'body b',
        '## Section C',
        'body c',
        '## Section D',
        'body d ' + 'filler '.repeat(40),
      ].join('\n');
      writeSource('2026-05-15', 'breaking', richSource);
      // Translation drops 3 of 4 H2 sections — well beyond the ±1 tolerance.
      const stripped = [
        '# Resumé',
        '## Avsnitt A',
        'kropp ' + 'utfyllnad '.repeat(80),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', stripped);
      const violations = validateTranslation(target, tmpRoot);
      const gates = violations.map((v) => v.gate);
      expect(gates).toContain('heading-parity');
      const headingViolation = violations.find((v) => v.gate === 'heading-parity');
      expect(headingViolation.message).toContain('H2');
    });

    it('does not flag a translation that drops a single H3 within tolerance', () => {
      const richSource = [
        '# Brief',
        '## Section',
        '### Sub one',
        '### Sub two',
        '### Sub three',
        'body ' + 'filler '.repeat(80),
      ].join('\n');
      writeSource('2026-05-15', 'breaking', richSource);
      // Drops exactly one H3 — within HEADING_TOLERANCE (1).
      const ok = [
        '# Sammanfattning',
        '## Avsnitt',
        '### Underavsnitt ett',
        '### Underavsnitt två',
        'kropp ' + 'utfyllnad '.repeat(80),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', ok);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.filter((v) => v.gate === 'heading-parity')).toEqual([]);
    });

    it('flags an H1-count mismatch (zero tolerance for H1)', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      // Two H1s where source has one — zero tolerance.
      const twoH1 = [
        '# Sammanfattning',
        '# En till rubrik',
        REALISTIC_SOURCE.replace('# Executive Brief — Breaking News', ''),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', twoH1);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.some((v) => v.gate === 'heading-parity' && v.message.includes('H1'))).toBe(true);
    });
  });

  describe('mermaid-parity gate', () => {
    it('counts ```mermaid block openers case-insensitively', () => {
      const sample = '```mermaid\ngraph TD\n```\n\nintro\n\n```Mermaid\nflowchart\n```\n';
      expect(countMermaidBlocks(sample)).toBe(2);
    });

    it('flags a translation that drops a mermaid diagram', () => {
      const withDiagram = [
        REALISTIC_SOURCE,
        '',
        '```mermaid',
        'graph TD',
        '  A --> B',
        '```',
        '',
        'Aftermath text ' + 'filler '.repeat(40),
      ].join('\n');
      writeSource('2026-05-15', 'breaking', withDiagram);
      // Translation contains no mermaid block at all.
      const noDiagram = [
        '# Sammanfattning',
        '## 🎯 BLUF',
        'Europaparlamentet antog TA-10-2026-0160 om DMA-tillsyn.',
        'IMF (WEO) data-vintage="WEO-April-2026" prognosticerar 1,4 %.',
        'Förfarande 2024/0001(COD) går vidare till trilog.',
        '## 📋 60-sekunders sammanfattning',
        'Fem nyckelfakta. ' + 'utfyllnad '.repeat(80),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', noDiagram);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.some((v) => v.gate === 'mermaid-parity')).toBe(true);
    });

    it('does not run the gate when the source has no mermaid block', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      // Plausible Swedish translation, no mermaid block in either side.
      const sv = [
        '# Sammanfattning — Brådskande nyheter',
        '**Datum:** 2026-05-15',
        '**Klassificering:** UNCLASSIFIED // OPEN SOURCE',
        '',
        '## 🎯 BLUF',
        'Europaparlamentet antog TA-10-2026-0160 om DMA-tillsyn.',
        'IMF World Economic Outlook (WEO) data-vintage="WEO-April-2026" prognosticerar 1,4 % tillväxt.',
        'Förfarande 2024/0001(COD) går vidare till trilog.',
        '**Säkerhet: 🟢 HÖG** — baserat på officiella EP-texter.',
        '',
        '## 📋 60-sekunders sammanfattning',
        'Fem nyckelfakta om plenarsammanträdet.',
        '',
        'Upprepa innehåll för att ge filen en meningsfull byte-storlek '.repeat(40),
      ].join('\n');
      const target = writeTranslation('2026-05-15', 'breaking', 'sv', sv);
      const violations = validateTranslation(target, tmpRoot);
      expect(violations.filter((v) => v.gate === 'mermaid-parity')).toEqual([]);
    });
  });

  describe('aggregateByKey helper', () => {
    it('groups violations by gate and skips empty values', () => {
      const items = [
        { gate: 'length-floor', lang: 'sv' },
        { gate: 'length-floor', lang: 'de' },
        { gate: 'english-fallthrough', lang: 'sv' },
        { gate: 'filename', lang: '' },
      ];
      expect(aggregateByKey(items, 'gate')).toEqual({
        'english-fallthrough': 1,
        filename: 1,
        'length-floor': 2,
      });
      // Empty `lang` from the filename gate is omitted from the byLang map.
      expect(aggregateByKey(items, 'lang')).toEqual({ de: 1, sv: 2 });
    });

    it('returns an empty object for no input', () => {
      expect(aggregateByKey([], 'gate')).toEqual({});
    });

    it('emits keys in alphabetical order for byte-stable JSON', () => {
      const items = [{ gate: 'zeta' }, { gate: 'alpha' }, { gate: 'mu' }];
      expect(Object.keys(aggregateByKey(items, 'gate'))).toEqual(['alpha', 'mu', 'zeta']);
    });
  });

  describe('main report aggregation', () => {
    it('emits byGate and byLang totals in the report JSON', () => {
      writeSource('2026-05-15', 'breaking', REALISTIC_SOURCE);
      // Two violations of different gates across two languages.
      writeTranslation('2026-05-15', 'breaking', 'sv', '# Stub');
      writeTranslation('2026-05-15', 'breaking', 'de', REALISTIC_SOURCE);
      const reportPath = path.join(tmpRoot, 'report.json');
      const report = main([
        '--repo-root', tmpRoot,
        '--report', reportPath,
        '--no-fail',
        '--quiet',
      ]);
      expect(report.totals.byGate).toBeDefined();
      expect(report.totals.byLang).toBeDefined();
      // length-floor (sv stub) + english-fallthrough (de copy) at minimum.
      expect(report.totals.byGate['length-floor']).toBeGreaterThanOrEqual(1);
      expect(report.totals.byGate['english-fallthrough']).toBeGreaterThanOrEqual(1);
      expect(report.totals.byLang.sv).toBeGreaterThanOrEqual(1);
      expect(report.totals.byLang.de).toBeGreaterThanOrEqual(1);
      const onDisk = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      expect(onDisk.totals.byGate).toEqual(report.totals.byGate);
    });
  });
});
