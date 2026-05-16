// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/discover-untranslated-briefs.js.
 *
 * Builds a temporary `analysis/daily/` layout in `os.tmpdir()` so the
 * discovery logic can be exercised without touching the real repo state.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  TARGET_LANGS,
  parseArgs,
  findExecutiveBriefSources,
  findMissingLangs,
  buildQueue,
  main,
} from '../../scripts/discover-untranslated-briefs.js';

let tmpRoot;

function makeBrief(date, slug, opts = {}) {
  const dir = path.join(tmpRoot, 'analysis', 'daily', date, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'executive-brief.md'), '# Brief\n' + 'x\n'.repeat(150));
  for (const lang of opts.existing || []) {
    fs.writeFileSync(path.join(dir, `executive-brief_${lang}.md`), '# Translated\n' + 'y\n'.repeat(120));
  }
  if (opts.extended) {
    const ed = path.join(dir, 'extended');
    fs.mkdirSync(ed, { recursive: true });
    fs.writeFileSync(path.join(ed, 'executive-brief.md'), '# Extended\n' + 'z\n'.repeat(150));
  }
}

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-briefs-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('discover-untranslated-briefs', () => {
  describe('TARGET_LANGS', () => {
    it('contains exactly the 13 non-English language codes', () => {
      expect(TARGET_LANGS).toHaveLength(13);
      expect(TARGET_LANGS).not.toContain('en');
      for (const code of ['sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl', 'ar', 'he', 'ja', 'ko', 'zh']) {
        expect(TARGET_LANGS).toContain(code);
      }
    });

    it('is immutable (frozen) to prevent accidental mutation', () => {
      expect(Object.isFrozen(TARGET_LANGS)).toBe(true);
    });
  });

  describe('parseArgs', () => {
    it('returns sensible defaults', () => {
      const opts = parseArgs([]);
      expect(opts.maxBriefs).toBe(2);
      expect(opts.maxAgeDays).toBe(180);
      expect(opts.includeExtended).toBe(false);
      expect(opts.output).toBe(null);
    });

    it('parses every supported flag', () => {
      const opts = parseArgs([
        '--repo-root', '/tmp/x',
        '--max-briefs', '5',
        '--max-age-days', '30',
        '--output', '/tmp/q.json',
        '--include-extended',
      ]);
      expect(opts.repoRoot).toBe('/tmp/x');
      expect(opts.maxBriefs).toBe(5);
      expect(opts.maxAgeDays).toBe(30);
      expect(opts.output).toBe('/tmp/q.json');
      expect(opts.includeExtended).toBe(true);
    });

    it('throws on unknown flag', () => {
      expect(() => parseArgs(['--bogus'])).toThrow(/Unknown flag/);
    });

    it('rejects non-positive --max-briefs', () => {
      expect(() => parseArgs(['--max-briefs', '0'])).toThrow(/positive integer/);
    });

    it('rejects non-positive --max-age-days', () => {
      expect(() => parseArgs(['--max-age-days', '-1'])).toThrow(/positive integer/);
    });
  });

  describe('findExecutiveBriefSources', () => {
    it('returns empty array when analysis/daily does not exist', () => {
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      expect(sources).toEqual([]);
    });

    it('discovers every canonical brief', () => {
      makeBrief('2026-05-15', 'breaking');
      makeBrief('2026-05-15', 'propositions');
      makeBrief('2026-05-14', 'motions');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      expect(sources).toHaveLength(3);
      expect(sources.map((s) => s.slug).sort()).toEqual(['breaking', 'motions', 'propositions']);
    });

    it('skips translate-run* analysis directories (legacy artifacts)', () => {
      makeBrief('2026-05-15', 'breaking');
      const legacy = path.join(tmpRoot, 'analysis', 'daily', '2026-05-15', 'translate-run42');
      fs.mkdirSync(legacy, { recursive: true });
      fs.writeFileSync(path.join(legacy, 'executive-brief.md'), '# Legacy\n');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      expect(sources.map((s) => s.slug)).toEqual(['breaking']);
    });

    it('includes extended/executive-brief.md only when --include-extended is set', () => {
      makeBrief('2026-05-15', 'breaking', { extended: true });
      const without = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      expect(without).toHaveLength(1);
      expect(without[0].isExtended).toBe(false);
      const withExt = findExecutiveBriefSources(tmpRoot, { includeExtended: true, maxAgeDays: 180 });
      expect(withExt).toHaveLength(2);
      expect(withExt.some((s) => s.isExtended)).toBe(true);
    });

    it('respects --max-age-days cutoff', () => {
      makeBrief('2020-01-01', 'breaking');
      makeBrief('2026-05-15', 'breaking');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 365 });
      expect(sources).toHaveLength(1);
      expect(sources[0].date).toBe('2026-05-15');
    });

    it('skips non-date directory names', () => {
      const bogus = path.join(tmpRoot, 'analysis', 'daily', 'README');
      fs.mkdirSync(bogus, { recursive: true });
      fs.writeFileSync(path.join(bogus, 'executive-brief.md'), '# Bogus');
      makeBrief('2026-05-15', 'breaking');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      expect(sources).toHaveLength(1);
    });
  });

  describe('findMissingLangs', () => {
    it('returns every TARGET_LANGS code when no translation exists', () => {
      makeBrief('2026-05-15', 'breaking');
      const source = {
        absPath: path.join(tmpRoot, 'analysis', 'daily', '2026-05-15', 'breaking', 'executive-brief.md'),
      };
      const missing = findMissingLangs(source);
      expect(missing).toHaveLength(13);
      expect(missing).toEqual([...TARGET_LANGS]);
    });

    it('omits languages whose companion already exists', () => {
      makeBrief('2026-05-15', 'breaking', { existing: ['sv', 'de', 'zh'] });
      const source = {
        absPath: path.join(tmpRoot, 'analysis', 'daily', '2026-05-15', 'breaking', 'executive-brief.md'),
      };
      const missing = findMissingLangs(source);
      expect(missing).toHaveLength(10);
      expect(missing).not.toContain('sv');
      expect(missing).not.toContain('de');
      expect(missing).not.toContain('zh');
    });

    it('returns an empty array when every translation is present', () => {
      makeBrief('2026-05-15', 'breaking', { existing: [...TARGET_LANGS] });
      const source = {
        absPath: path.join(tmpRoot, 'analysis', 'daily', '2026-05-15', 'breaking', 'executive-brief.md'),
      };
      expect(findMissingLangs(source)).toEqual([]);
    });
  });

  describe('buildQueue', () => {
    it('caps the queue at maxBriefs', () => {
      makeBrief('2026-05-15', 'a');
      makeBrief('2026-05-15', 'b');
      makeBrief('2026-05-15', 'c');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 2);
      expect(result.queue).toHaveLength(2);
      expect(result.totals.queued).toBe(2);
      expect(result.totals.sourcesWithGaps).toBe(3);
      expect(result.totals.translationsMissing).toBe(3 * 13);
      expect(result.totals.queuedTranslations).toBe(2 * 13);
    });

    it('sorts newest-date first, then more-missing first, then slug-alphabetical', () => {
      makeBrief('2026-05-14', 'zeta');
      makeBrief('2026-05-15', 'alpha', { existing: ['sv'] });            // 12 missing
      makeBrief('2026-05-15', 'beta');                                    // 13 missing
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      expect(result.queue.map((q) => `${q.date}/${q.slug}`)).toEqual([
        '2026-05-15/beta',     // newest + 13 missing
        '2026-05-15/alpha',    // newest + 12 missing
        '2026-05-14/zeta',
      ]);
    });

    it('omits fully-translated briefs from the queue', () => {
      makeBrief('2026-05-15', 'done', { existing: [...TARGET_LANGS] });
      makeBrief('2026-05-15', 'pending');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      expect(result.queue).toHaveLength(1);
      expect(result.queue[0].slug).toBe('pending');
      expect(result.totals.sourcesScanned).toBe(2);
      expect(result.totals.sourcesWithGaps).toBe(1);
    });

    it('prefers the canonical source over its extended/ sibling on the same slug', () => {
      makeBrief('2026-05-15', 'breaking', { extended: true });
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: true, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      // Canonical comes first when both have the same missing count + slug + date.
      expect(result.queue[0].isExtended).toBe(false);
    });
  });

  describe('main (integration)', () => {
    it('writes a JSON queue to --output', () => {
      makeBrief('2026-05-15', 'breaking');
      const outFile = path.join(tmpRoot, 'queue.json');
      const payload = main([
        '--repo-root', tmpRoot,
        '--output', outFile,
        '--max-briefs', '1',
      ]);
      expect(fs.existsSync(outFile)).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      expect(parsed.queue).toHaveLength(1);
      expect(parsed.queue[0].slug).toBe('breaking');
      expect(parsed.queue[0].missingLangs).toEqual([...TARGET_LANGS]);
      expect(parsed.totals.queuedTranslations).toBe(13);
      expect(payload.totals.queuedTranslations).toBe(13);
    });
  });
});
