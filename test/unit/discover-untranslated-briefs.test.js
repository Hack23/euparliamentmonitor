// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit tests for scripts/discover-untranslated-briefs.js.
 *
 * Builds a temporary `analysis/daily/` layout in `os.tmpdir()` so the
 * discovery logic can be exercised without touching the real repo state.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  TARGET_LANGS,
  MAX_BRIEFS_LIMIT,
  DISCOVERY_MODES,
  parseArgs,
  findExecutiveBriefSources,
  findMissingLangs,
  buildQueue,
  main,
} from '../../scripts/discover-untranslated-briefs.js';
import { ALL_LANGUAGES } from '../../scripts/constants/language-core.js';

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
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-05-16T12:00:00Z'));
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-briefs-'));
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe('discover-untranslated-briefs', () => {
  describe('TARGET_LANGS', () => {
    it('contains exactly the 13 non-English language codes', () => {
      expect(TARGET_LANGS).toHaveLength(13);
      expect(TARGET_LANGS).not.toContain('en');
      expect(TARGET_LANGS).toEqual(ALL_LANGUAGES.filter((lang) => lang !== 'en'));
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
      expect(opts.mode).toBe('fresh-then-backlog');
      expect(opts.runNumber).toBe(0);
    });

    it('parses every supported flag', () => {
      const opts = parseArgs([
        '--repo-root', '/tmp/x',
        '--max-briefs', '4',
        '--max-age-days', '30',
        '--output', '/tmp/q.json',
        '--include-extended',
        '--mode', 'backlog-only',
        '--run-number', '17',
      ]);
      expect(opts.repoRoot).toBe('/tmp/x');
      expect(opts.maxBriefs).toBe(4);
      expect(opts.maxAgeDays).toBe(30);
      expect(opts.output).toBe('/tmp/q.json');
      expect(opts.includeExtended).toBe(true);
      expect(opts.mode).toBe('backlog-only');
      expect(opts.runNumber).toBe(17);
    });

    it('throws on unknown flag', () => {
      expect(() => parseArgs(['--bogus'])).toThrow(/Unknown flag/);
    });

    it('rejects non-positive --max-briefs', () => {
      expect(() => parseArgs(['--max-briefs', '0'])).toThrow(/between 1 and 4/);
    });

    it('rejects --max-briefs values above the workflow budget', () => {
      expect(MAX_BRIEFS_LIMIT).toBe(4);
      expect(() => parseArgs(['--max-briefs', '40'])).toThrow(/between 1 and 4/);
    });

    it('rejects non-positive --max-age-days', () => {
      expect(() => parseArgs(['--max-age-days', '-1'])).toThrow(/positive integer/);
    });

    it('rejects unknown --mode values', () => {
      expect(() => parseArgs(['--mode', 'random'])).toThrow(/--mode must be one of/);
    });

    it('rejects negative --run-number values', () => {
      expect(() => parseArgs(['--run-number', '-2'])).toThrow(/non-negative integer/);
    });

    it('advertises the documented set of discovery modes', () => {
      expect(DISCOVERY_MODES).toEqual([
        'fresh-then-backlog',
        'backlog-only',
        'newest-first',
      ]);
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
    it('caps the queue at maxBriefs (default mode)', () => {
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

    it('fresh-then-backlog: queue is [newest, oldest, ...] for maxBriefs >= 2', () => {
      makeBrief('2026-05-14', 'zeta');
      makeBrief('2026-05-15', 'alpha', { existing: ['sv'] });            // 12 missing
      makeBrief('2026-05-15', 'beta');                                    // 13 missing
      makeBrief('2026-05-10', 'gamma');                                   // backlog
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, { maxBriefs: 3, mode: 'fresh-then-backlog' });
      // Slot 0 = fresh slice (newest source with gaps, tie-break more-missing
      // → beta). Slots 1+ = oldest-first backlog excluding the fresh entry.
      expect(result.queue.map((q) => `${q.date}/${q.slug}`)).toEqual([
        '2026-05-15/beta',     // fresh slot
        '2026-05-10/gamma',    // backlog oldest
        '2026-05-14/zeta',     // backlog next
      ]);
      expect(result.totals.freshNewestDate).toBe('2026-05-15');
      expect(result.totals.backlogOldestDate).toBe('2026-05-10');
    });

    it('fresh-then-backlog: backlog tie-breaks by missingCount ASC then slug', () => {
      makeBrief('2026-05-14', 'half', { existing: ['sv', 'de', 'fr', 'es', 'nl', 'da', 'no'] }); // 6 missing
      makeBrief('2026-05-14', 'fresh-zero');                                                       // 13 missing
      makeBrief('2026-05-16', 'today');                                                            // newest
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, { maxBriefs: 3, mode: 'fresh-then-backlog' });
      // Fresh slot = today; backlog drains the half-done brief first (finish
      // partial coverage before starting a fully-blank one).
      expect(result.queue.map((q) => `${q.date}/${q.slug}`)).toEqual([
        '2026-05-16/today',
        '2026-05-14/half',
        '2026-05-14/fresh-zero',
      ]);
    });

    it('fresh-then-backlog with maxBriefs=1 alternates by run-number parity', () => {
      makeBrief('2026-05-10', 'oldest');
      makeBrief('2026-05-16', 'newest');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const even = buildQueue(sources, { maxBriefs: 1, mode: 'fresh-then-backlog', runNumber: 0 });
      const odd = buildQueue(sources, { maxBriefs: 1, mode: 'fresh-then-backlog', runNumber: 1 });
      const even2 = buildQueue(sources, { maxBriefs: 1, mode: 'fresh-then-backlog', runNumber: 2 });
      expect(even.queue.map((q) => q.slug)).toEqual(['newest']);
      expect(odd.queue.map((q) => q.slug)).toEqual(['oldest']);
      expect(even2.queue.map((q) => q.slug)).toEqual(['newest']);
    });

    it('backlog-only: drains oldest-first across the entire backlog', () => {
      makeBrief('2026-05-15', 'newest');
      makeBrief('2026-05-10', 'oldest');
      makeBrief('2026-05-12', 'middle');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, { maxBriefs: 3, mode: 'backlog-only' });
      expect(result.queue.map((q) => q.slug)).toEqual(['oldest', 'middle', 'newest']);
    });

    it('newest-first: legacy ordering (newest date, more-missing, slug asc)', () => {
      makeBrief('2026-05-14', 'zeta');
      makeBrief('2026-05-15', 'alpha', { existing: ['sv'] });            // 12 missing
      makeBrief('2026-05-15', 'beta');                                    // 13 missing
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, { maxBriefs: 10, mode: 'newest-first' });
      expect(result.queue.map((q) => `${q.date}/${q.slug}`)).toEqual([
        '2026-05-15/beta',     // newest + 13 missing
        '2026-05-15/alpha',    // newest + 12 missing
        '2026-05-14/zeta',
      ]);
    });

    it('throws on invalid mode', () => {
      expect(() => buildQueue([], { maxBriefs: 1, mode: 'bogus' })).toThrow(/invalid mode/);
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

    it('drops sources that already have all 13 translations (skip-when-exists guarantee)', () => {
      makeBrief('2026-05-15', 'fully-translated', { existing: [...TARGET_LANGS] });
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      // sourcesWithGaps === 0; queue empty; no zero-missing entries leak in.
      expect(result.queue).toEqual([]);
      expect(result.totals.sourcesWithGaps).toBe(0);
      expect(result.totals.translationsMissing).toBe(0);
      expect(result.totals.freshNewestDate).toBeNull();
      expect(result.totals.backlogOldestDate).toBeNull();
    });

    it('excludes already-translated languages from missingLangs (sv+de present → 11 missing)', () => {
      makeBrief('2026-05-15', 'partial', { existing: ['sv', 'de'] });
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      expect(result.queue).toHaveLength(1);
      const entry = result.queue[0];
      expect(entry.missingLangs).not.toContain('sv');
      expect(entry.missingLangs).not.toContain('de');
      expect(entry.missingLangs).toHaveLength(11);
      expect(entry.missingCount).toBe(11);
    });

    it('prefers the canonical source over its extended/ sibling on the same slug', () => {
      makeBrief('2026-05-15', 'breaking', { extended: true });
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: true, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      // Canonical comes first when both have the same missing count + slug + date.
      expect(result.queue[0].isExtended).toBe(false);
    });

    it('reports topMissingLangs aggregated across the whole backlog', () => {
      // Three briefs: brief A is fully translated, brief B is missing only ja,
      // brief C is missing every language. Expected top: ja=2 (B+C), then
      // every other language=1, capped at 3 entries.
      makeBrief('2026-05-15', 'fully-done', { existing: [...TARGET_LANGS] });
      makeBrief('2026-05-15', 'partial', { existing: TARGET_LANGS.filter((l) => l !== 'ja') });
      makeBrief('2026-05-15', 'fresh');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      expect(result.totals.topMissingLangs).toHaveLength(3);
      expect(result.totals.topMissingLangs[0]).toEqual({ lang: 'ja', count: 2 });
      // Remaining slots are count=1 entries sorted alphabetically by lang.
      for (const entry of result.totals.topMissingLangs.slice(1)) {
        expect(entry.count).toBe(1);
        expect(TARGET_LANGS).toContain(entry.lang);
      }
    });

    it('returns an empty topMissingLangs when nothing is missing', () => {
      makeBrief('2026-05-15', 'done', { existing: [...TARGET_LANGS] });
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 10);
      expect(result.totals.topMissingLangs).toEqual([]);
    });

    it('reports freshNewestDate and backlogOldestDate spanning all sources with gaps', () => {
      makeBrief('2026-05-10', 'old');
      makeBrief('2026-05-13', 'mid');
      makeBrief('2026-05-16', 'new');
      const sources = findExecutiveBriefSources(tmpRoot, { includeExtended: false, maxAgeDays: 180 });
      const result = buildQueue(sources, 2);
      expect(result.totals.freshNewestDate).toBe('2026-05-16');
      expect(result.totals.backlogOldestDate).toBe('2026-05-10');
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
