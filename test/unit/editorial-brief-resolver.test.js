// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for `src/aggregator/editorial-brief-resolver` — the
 * language-aware brief lookup module.
 *
 * The compiled output under `scripts/aggregator/` is what the runtime
 * consumes; tests target the compiled JS to stay symmetric with the rest
 * of the aggregator test suite (see `test/unit/aggregator-lead.test.js`).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  discoverLocalizedBriefs,
  localizedBriefCandidates,
  resolveLocalizedBriefHighlight,
} from '../../scripts/aggregator/editorial-brief-resolver.js';

describe('localizedBriefCandidates', () => {
  it('returns an empty list for the "en" pseudo-language', () => {
    expect(localizedBriefCandidates('en')).toEqual([]);
  });
  it('returns the canonical two-path ladder for a non-English language', () => {
    expect(localizedBriefCandidates('sv')).toEqual([
      'executive-brief_sv.md',
      'extended/executive-brief_sv.md',
    ]);
  });
});

describe('resolveLocalizedBriefHighlight', () => {
  let tmp;
  let runDir;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'editorial-brief-resolver-'));
    runDir = path.join(tmp, 'analysis', 'daily', '2026-05-16', 'breaking');
    fs.mkdirSync(runDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  function writeBrief(lang, body) {
    const file = path.join(runDir, `executive-brief_${lang}.md`);
    fs.writeFileSync(file, body);
    return file;
  }

  function writeExtendedBrief(lang, body) {
    fs.mkdirSync(path.join(runDir, 'extended'), { recursive: true });
    const file = path.join(runDir, 'extended', `executive-brief_${lang}.md`);
    fs.writeFileSync(file, body);
    return file;
  }

  it('returns null for English (handled by the canonical resolver)', () => {
    writeBrief('sv', '# Title\n\n## 60-Second Read\n\nLede paragraph.\n');
    expect(resolveLocalizedBriefHighlight(runDir, 'en', 'breaking', '2026-05-16')).toBeNull();
  });

  it('returns null when no localized brief exists', () => {
    expect(resolveLocalizedBriefHighlight(runDir, 'sv', 'breaking', '2026-05-16')).toBeNull();
  });

  it('returns null for a missing run directory', () => {
    const missing = path.join(tmp, 'missing-run');
    expect(resolveLocalizedBriefHighlight(missing, 'sv', 'breaking', '2026-05-16')).toBeNull();
  });

  it('extracts headline and lede from a translated brief', () => {
    writeBrief(
      'sv',
      [
        '# Bankunionsuppgörelse prövar EPP–S&D-disciplin',
        '',
        '## 🎯 BLUF',
        '',
        'Parlamentets bankunionskompromiss skärper tillsynsfrister inför nästa plenarröstning.',
        '',
      ].join('\n')
    );
    const result = resolveLocalizedBriefHighlight(runDir, 'sv', 'breaking', '2026-05-16');
    expect(result).not.toBeNull();
    expect(result.sourceLang).toBe('sv');
    expect(result.sourceFile).toBe('executive-brief_sv.md');
    expect(result.headline).toBe('Bankunionsuppgörelse prövar EPP–S&D-disciplin');
    expect(result.summary).toContain('Parlamentets bankunionskompromiss');
  });

  it('prefers the run-root brief over the extended variant', () => {
    writeBrief('de', '# Root-Schlagzeile\n\n## BLUF\n\nKernpunkt aus dem Root-Brief.\n');
    writeExtendedBrief(
      'de',
      '# Extended-Schlagzeile\n\n## BLUF\n\nKernpunkt aus dem Extended-Brief.\n'
    );
    const result = resolveLocalizedBriefHighlight(runDir, 'de', 'breaking', '2026-05-16');
    expect(result.sourceFile).toBe('executive-brief_de.md');
    expect(result.headline).toBe('Root-Schlagzeile');
  });

  it('falls back to the extended brief when the root variant is missing', () => {
    writeExtendedBrief(
      'fr',
      '# Titre éditorial\n\n## TL;DR\n\nLa résolution fixe une nouvelle échéance.\n'
    );
    const result = resolveLocalizedBriefHighlight(runDir, 'fr', 'breaking', '2026-05-16');
    expect(result.sourceFile).toBe('extended/executive-brief_fr.md');
    expect(result.headline).toBe('Titre éditorial');
  });

  it('strips generic artefact-category H1 affixes before returning', () => {
    writeBrief(
      'es',
      [
        '# Executive Brief — Breaking News — Pacto bancario tensiona EPP–S&D',
        '',
        '## BLUF',
        '',
        'El pacto bancario tensiona la disciplina de coalición antes del voto plenario.',
      ].join('\n')
    );
    const result = resolveLocalizedBriefHighlight(runDir, 'es', 'breaking', '2026-05-16');
    expect(result).not.toBeNull();
    // The "Executive Brief — Breaking News — " category prefix is stripped.
    expect(result.headline).toContain('Pacto bancario tensiona');
    expect(result.headline).not.toContain('Executive Brief');
  });

  it('returns null when the brief is empty after preamble stripping', () => {
    writeBrief('fi', '<!-- SPDX-License-Identifier: Apache-2.0 -->\n');
    expect(
      resolveLocalizedBriefHighlight(runDir, 'fi', 'breaking', '2026-05-16')
    ).toBeNull();
  });

  it('returns a summary even when the H1 is generic', () => {
    writeBrief(
      'nl',
      [
        '# Executive Brief',
        '',
        '## BLUF',
        '',
        'Het bankuniecompromis verkort de toezichtstermijnen en raakt de coalitie.',
      ].join('\n')
    );
    const result = resolveLocalizedBriefHighlight(runDir, 'nl', 'breaking', '2026-05-16');
    expect(result).not.toBeNull();
    expect(result.headline).toBe('');
    expect(result.summary).toContain('Het bankuniecompromis');
  });
});

describe('discoverLocalizedBriefs', () => {
  it('returns an empty list when the run directory is missing', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-localized-empty-'));
    try {
      expect(discoverLocalizedBriefs(path.join(tmp, 'missing'), ['sv', 'de'])).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('discovers brief files at both run-root and extended paths', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-localized-walk-'));
    try {
      const runDir = path.join(tmp, 'analysis', 'daily', '2026-05-16', 'breaking');
      fs.mkdirSync(runDir, { recursive: true });
      fs.writeFileSync(path.join(runDir, 'executive-brief_sv.md'), '# sv\n');
      fs.mkdirSync(path.join(runDir, 'extended'), { recursive: true });
      fs.writeFileSync(path.join(runDir, 'extended', 'executive-brief_de.md'), '# de\n');
      const result = discoverLocalizedBriefs(runDir, ['en', 'sv', 'de', 'fr']);
      expect(result).toEqual(['sv', 'de']);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('skips the "en" pseudo-language', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-localized-en-'));
    try {
      const runDir = path.join(tmp, 'analysis', 'daily', '2026-05-16', 'breaking');
      fs.mkdirSync(runDir, { recursive: true });
      fs.writeFileSync(path.join(runDir, 'executive-brief.md'), '# en\n');
      expect(discoverLocalizedBriefs(runDir, ['en'])).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
