// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  shardPath,
  parseLine,
  newId,
  validateEntry,
  appendEntries,
  readEntries,
  readExpiredUnresolved,
  updateEntry,
  buildSummary,
  normaliseHorizon,
  generateSessionDayIds,
  isMondayRun,
} from '../../scripts/aggregator/forward-statements-registry.js';

const REGISTRY_SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/aggregator/forward-statements-registry.js',
);

/** Minimal valid entry factory. */
function makeEntry(overrides = {}) {
  return {
    topic: 'banking-union',
    originatingRunId: 'week-ahead-run1-1714204800',
    originatingDate: '2026-04-27',
    statement: 'SRMR3 trilogue expected to conclude by end of May 2026.',
    expectedHorizon: '2026-05-31',
    status: 'open',
    evidenceRefs: ['A-10-2026-0067'],
    ...overrides,
  };
}

describe('forward-statements-registry', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fwd-reg-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // shardPath
  // -------------------------------------------------------------------------
  describe('shardPath', () => {
    it('should return YYYY-MM.jsonl path for a given date', () => {
      const p = shardPath('2026-04-27', '/tmp/reg');
      expect(p).toBe('/tmp/reg/2026-04.jsonl');
    });

    it('should handle month boundaries', () => {
      expect(shardPath('2026-01-01', '/r')).toBe('/r/2026-01.jsonl');
      expect(shardPath('2026-12-31', '/r')).toBe('/r/2026-12.jsonl');
    });
  });

  // -------------------------------------------------------------------------
  // parseLine
  // -------------------------------------------------------------------------
  describe('parseLine', () => {
    it('should parse a valid JSON line', () => {
      const obj = { id: '1', topic: 'ai-act' };
      expect(parseLine(JSON.stringify(obj))).toEqual(obj);
    });

    it('should return null for blank lines', () => {
      expect(parseLine('')).toBeNull();
      expect(parseLine('   ')).toBeNull();
    });

    it('should return null for malformed JSON', () => {
      expect(parseLine('{ bad json')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // newId
  // -------------------------------------------------------------------------
  describe('newId', () => {
    it('should return a UUID v4 string', () => {
      const id = newId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should return unique values on each call', () => {
      expect(newId()).not.toBe(newId());
    });
  });

  // -------------------------------------------------------------------------
  // validateEntry
  // -------------------------------------------------------------------------
  describe('validateEntry', () => {
    it('should return no errors for a valid entry', () => {
      expect(validateEntry(makeEntry())).toHaveLength(0);
    });

    it('should error when topic is missing', () => {
      const errs = validateEntry(makeEntry({ topic: '' }));
      expect(errs.some((e) => e.includes('topic'))).toBe(true);
    });

    it('should error when originatingDate is not YYYY-MM-DD', () => {
      const errs = validateEntry(makeEntry({ originatingDate: '27-04-2026' }));
      expect(errs.some((e) => e.includes('originatingDate'))).toBe(true);
    });

    it('should error when originatingDate is an impossible calendar date', () => {
      const errs = validateEntry(makeEntry({ originatingDate: '2026-13-99' }));
      expect(errs.some((e) => e.includes('originatingDate'))).toBe(true);
    });

    it('should accept YYYY-Www for expectedHorizon', () => {
      expect(validateEntry(makeEntry({ expectedHorizon: '2026-W18' }))).toHaveLength(0);
    });

    it('should reject out-of-range ISO weeks and impossible horizon dates', () => {
      const weekErrs = validateEntry(makeEntry({ expectedHorizon: '2026-W54' }));
      const dateErrs = validateEntry(makeEntry({ expectedHorizon: '2026-02-31' }));
      expect(weekErrs.some((e) => e.includes('expectedHorizon'))).toBe(true);
      expect(dateErrs.some((e) => e.includes('expectedHorizon'))).toBe(true);
    });

    it('should error when status is not in the allowed enum', () => {
      const errs = validateEntry(makeEntry({ status: 'unknown' }));
      expect(errs.some((e) => e.includes('status'))).toBe(true);
    });

    it('should error when evidenceRefs is not an array', () => {
      const errs = validateEntry(makeEntry({ evidenceRefs: 'not-array' }));
      expect(errs.some((e) => e.includes('evidenceRefs'))).toBe(true);
    });

    it('should error for null entry', () => {
      const errs = validateEntry(null);
      expect(errs.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // appendEntries
  // -------------------------------------------------------------------------
  describe('appendEntries', () => {
    it('should write a JSONL shard and return { written: 1, errors: [] }', () => {
      const result = appendEntries([makeEntry()], tmpDir);
      expect(result.written).toBe(1);
      expect(result.errors).toHaveLength(0);
      const shard = path.join(tmpDir, '2026-04.jsonl');
      expect(fs.existsSync(shard)).toBe(true);
    });

    it('should auto-generate an id if missing', () => {
      appendEntries([makeEntry()], tmpDir);
      const shard = path.join(tmpDir, '2026-04.jsonl');
      const line = JSON.parse(fs.readFileSync(shard, 'utf8').split('\n')[0]);
      expect(typeof line.id).toBe('string');
      expect(line.id).toMatch(/^[0-9a-f-]{36}$/i);
    });

    it('should preserve a provided id', () => {
      const id = newId();
      appendEntries([makeEntry({ id })], tmpDir);
      const shard = path.join(tmpDir, '2026-04.jsonl');
      const line = JSON.parse(fs.readFileSync(shard, 'utf8').split('\n')[0]);
      expect(line.id).toBe(id);
    });

    it('should default status to open when not provided', () => {
      const entry = makeEntry();
      delete entry.status;
      appendEntries([entry], tmpDir);
      const shard = path.join(tmpDir, '2026-04.jsonl');
      const line = JSON.parse(fs.readFileSync(shard, 'utf8').split('\n')[0]);
      expect(line.status).toBe('open');
    });

    it('should collect errors for invalid entries without aborting valid ones', () => {
      const valid = makeEntry();
      const invalid = makeEntry({ originatingDate: 'not-a-date' });
      const result = appendEntries([valid, invalid], tmpDir);
      expect(result.written).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should append multiple entries to the same shard on the same date', () => {
      appendEntries([makeEntry(), makeEntry({ topic: 'ai-act' })], tmpDir);
      const shard = path.join(tmpDir, '2026-04.jsonl');
      const lines = fs
        .readFileSync(shard, 'utf8')
        .split('\n')
        .filter(Boolean);
      expect(lines).toHaveLength(2);
    });

    it('should write entries to different shards for different months', () => {
      appendEntries(
        [
          makeEntry({ originatingDate: '2026-04-27' }),
          makeEntry({ originatingDate: '2026-05-01', expectedHorizon: '2026-06-01' }),
        ],
        tmpDir,
      );
      expect(fs.existsSync(path.join(tmpDir, '2026-04.jsonl'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '2026-05.jsonl'))).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // readEntries
  // -------------------------------------------------------------------------
  describe('readEntries', () => {
    it('should return empty array when registry dir does not exist', () => {
      expect(readEntries({ registryDir: path.join(tmpDir, 'non-existent') })).toEqual([]);
    });

    it('should read all entries when no filters are applied', () => {
      appendEntries([makeEntry(), makeEntry({ topic: 'ai-act', status: 'implemented' })], tmpDir);
      const all = readEntries({ registryDir: tmpDir });
      expect(all).toHaveLength(2);
    });

    it('should filter by status', () => {
      appendEntries(
        [makeEntry({ status: 'open' }), makeEntry({ topic: 'ai-act', status: 'implemented' })],
        tmpDir,
      );
      const open = readEntries({ status: 'open', registryDir: tmpDir });
      expect(open).toHaveLength(1);
      expect(open[0].topic).toBe('banking-union');
    });

    it('should apply status filters to canonical last-occurrence entries only', () => {
      appendEntries([makeEntry({ id: 'tracked-item', status: 'open' })], tmpDir);
      updateEntry({
        id: 'tracked-item',
        status: 'implemented',
        date: '2026-05-10',
        registryDir: tmpDir,
      });
      const rawRows = ['2026-04.jsonl', '2026-05.jsonl']
        .map((file) => path.join(tmpDir, file))
        .filter((file) => fs.existsSync(file))
        .flatMap((file) => fs.readFileSync(file, 'utf8').trim().split('\n'));
      expect(rawRows.filter((line) => JSON.parse(line).id === 'tracked-item')).toHaveLength(2);

      expect(readEntries({ status: 'open', registryDir: tmpDir })).toHaveLength(0);
      const implemented = readEntries({ status: 'implemented', registryDir: tmpDir });
      expect(implemented).toHaveLength(1);
      expect(implemented[0].id).toBe('tracked-item');
    });

    it('should filter by horizonFrom', () => {
      appendEntries(
        [
          makeEntry({ expectedHorizon: '2026-04-30' }),
          makeEntry({ topic: 'ai-act', expectedHorizon: '2026-06-01' }),
        ],
        tmpDir,
      );
      const after = readEntries({ horizonFrom: '2026-05-01', registryDir: tmpDir });
      expect(after).toHaveLength(1);
      expect(after[0].topic).toBe('ai-act');
    });

    it('should filter by horizonTo', () => {
      appendEntries(
        [
          makeEntry({ expectedHorizon: '2026-04-30' }),
          makeEntry({ topic: 'ai-act', expectedHorizon: '2026-06-01' }),
        ],
        tmpDir,
      );
      const before = readEntries({ horizonTo: '2026-05-31', registryDir: tmpDir });
      expect(before).toHaveLength(1);
      expect(before[0].topic).toBe('banking-union');
    });

    it('should skip blank and malformed lines', () => {
      const shard = path.join(tmpDir, '2026-04.jsonl');
      fs.mkdirSync(tmpDir, { recursive: true });
      fs.writeFileSync(shard, `${JSON.stringify(makeEntry({ id: 'valid' }))}\n\n{ bad json\n`, 'utf8');
      const all = readEntries({ registryDir: tmpDir });
      expect(all).toHaveLength(1);
    });

    it('should skip entries with missing or invalid horizons during filtered reads', () => {
      const shard = path.join(tmpDir, '2026-04.jsonl');
      fs.mkdirSync(tmpDir, { recursive: true });
      const invalid = makeEntry({ id: 'bad-week', expectedHorizon: '2026-W54' });
      const invalidDate = makeEntry({ id: 'bad-date', expectedHorizon: '2026-13-99' });
      const missing = makeEntry({ id: 'missing-horizon' });
      delete missing.expectedHorizon;
      const valid = makeEntry({ id: 'valid-week', topic: 'ai-act', expectedHorizon: '2026-W18' });
      fs.writeFileSync(
        shard,
        `${JSON.stringify(invalid)}\n${JSON.stringify(invalidDate)}\n${JSON.stringify(missing)}\n${JSON.stringify(valid)}\n`,
        'utf8',
      );

      expect(() => readEntries({ horizonFrom: '2026-04-01', registryDir: tmpDir })).not.toThrow();
      const entries = readEntries({ horizonFrom: '2026-04-01', registryDir: tmpDir });
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('valid-week');
    });

    it('should filter to electoral-mode entries via category or tags', () => {
      const electoralByCategory = makeEntry({
        id: 'electoral-by-category',
        topic: 'spitzenkandidaten',
        category: 'electoral',
      });
      const electoralByTag = makeEntry({
        id: 'electoral-by-tag',
        topic: 'seat-projection-EPP',
        tags: ['electoral', 'EPP'],
      });
      const economic = makeEntry({
        id: 'economic-only',
        topic: 'banking-union',
        category: 'economic',
      });
      appendEntries([electoralByCategory, electoralByTag, economic], tmpDir);

      const all = readEntries({ registryDir: tmpDir });
      expect(all).toHaveLength(3);

      const electoral = readEntries({ electoralMode: true, registryDir: tmpDir });
      expect(electoral.map((e) => e.id).sort()).toEqual(['electoral-by-category', 'electoral-by-tag']);
    });

    it('should accept long-horizon (5 year) filters without exception', () => {
      const longHorizon = makeEntry({
        id: 'long-horizon',
        topic: 'EP11-seat-projection',
        expectedHorizon: '2030-06-15',
        category: 'electoral',
      });
      appendEntries([longHorizon], tmpDir);

      const fiveYearWindow = readEntries({
        horizonFrom: '2026-04-01',
        horizonTo: '2031-04-01',
        registryDir: tmpDir,
      });
      expect(fiveYearWindow).toHaveLength(1);
      expect(fiveYearWindow[0].id).toBe('long-horizon');
    });
  });

  // -------------------------------------------------------------------------
  // updateEntry
  // -------------------------------------------------------------------------
  describe('updateEntry', () => {
    it('should append an update line and return { updated: true }', () => {
      appendEntries([makeEntry()], tmpDir);
      const before = readEntries({ registryDir: tmpDir });
      const id = /** @type {string} */ (before[0].id);

      const result = updateEntry({
        id,
        status: 'implemented',
        evidence: 'TA-10-2026-0142',
        date: '2026-05-10',
        registryDir: tmpDir,
      });
      expect(result.updated).toBe(true);

      // The update line lands in the current-month shard
      const shard = path.join(tmpDir, '2026-05.jsonl');
      expect(fs.existsSync(shard)).toBe(true);
    });

    it('should return last-occurrence semantics — updated status visible in readEntries', () => {
      appendEntries([makeEntry()], tmpDir);
      const id = /** @type {string} */ (readEntries({ registryDir: tmpDir })[0].id);

      updateEntry({ id, status: 'implemented', date: '2026-05-10', registryDir: tmpDir });

      const all = readEntries({ registryDir: tmpDir });
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(id);
      expect(all[0].status).toBe('implemented');
    });

    it('should return { updated: false } for an unknown id', () => {
      const result = updateEntry({
        id: 'non-existent-id',
        status: 'abandoned',
        registryDir: tmpDir,
      });
      expect(result.updated).toBe(false);
    });

    it('should return { updated: false } for an invalid status', () => {
      appendEntries([makeEntry()], tmpDir);
      const id = /** @type {string} */ (readEntries({ registryDir: tmpDir })[0].id);
      const result = updateEntry({ id, status: 'bogus', registryDir: tmpDir });
      expect(result.updated).toBe(false);
    });

    it('should append evidenceRefs without duplicating existing refs', () => {
      appendEntries([makeEntry({ evidenceRefs: ['A-10-2026-0067'] })], tmpDir);
      const id = /** @type {string} */ (readEntries({ registryDir: tmpDir })[0].id);

      updateEntry({ id, status: 'open', evidence: 'TA-10-2026-0142', date: '2026-05-01', registryDir: tmpDir });

      const [updated] = readEntries({ registryDir: tmpDir });
      expect(updated.evidenceRefs).toContain('TA-10-2026-0142');
      expect(updated.evidenceRefs).toContain('A-10-2026-0067');
    });

    it('should deduplicate evidenceRefs when the same ref is added twice', () => {
      appendEntries([makeEntry({ evidenceRefs: ['A-10-2026-0067'] })], tmpDir);
      const id = /** @type {string} */ (readEntries({ registryDir: tmpDir })[0].id);

      // Add the same ref a second time
      updateEntry({ id, status: 'open', evidence: 'A-10-2026-0067', date: '2026-05-01', registryDir: tmpDir });

      const [updated] = readEntries({ registryDir: tmpDir });
      const refs = updated.evidenceRefs;
      expect(refs.filter((r) => r === 'A-10-2026-0067')).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // CLI
  // -------------------------------------------------------------------------
  describe('cli', () => {
    it('should append JSON entries from stdin via fd 0', () => {
      const entry = makeEntry({ id: 'stdin-entry' });
      const result = spawnSync(
        process.execPath,
        [REGISTRY_SCRIPT, 'append'],
        {
          cwd: tmpDir,
          input: JSON.stringify([entry]),
          encoding: 'utf8',
        },
      );

      expect(result.status).toBe(0);
      expect(result.stdout).toMatch(/"written": 1/);
      const shard = shardPath(
        entry.originatingDate,
        path.join(tmpDir, 'analysis/forward-statements'),
      );
      expect(fs.existsSync(shard)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // buildSummary
  // -------------------------------------------------------------------------
  describe('buildSummary', () => {
    it('should include status counts', () => {
      appendEntries(
        [
          makeEntry({ status: 'open' }),
          makeEntry({ topic: 'ai-act', status: 'implemented' }),
          makeEntry({ topic: 'defence', status: 'open' }),
        ],
        tmpDir,
      );
      const summary = buildSummary(tmpDir);
      expect(summary).toContain('open: 2');
      expect(summary).toContain('implemented: 1');
      expect(summary).toContain('superseded: 0');
      expect(summary).toContain('abandoned: 0');
      expect(summary).toContain('Total entries: 3');
    });

    it('should handle empty registry', () => {
      const summary = buildSummary(tmpDir);
      expect(summary).toContain('Total entries: 0');
    });
  });

  // -------------------------------------------------------------------------
  // normaliseHorizon
  // -------------------------------------------------------------------------
  describe('normaliseHorizon', () => {
    it('should pass through YYYY-MM-DD unchanged', () => {
      expect(normaliseHorizon('2026-05-31')).toBe('2026-05-31');
    });

    it('should convert ISO week to Monday date', () => {
      // 2026-W18 starts on Monday 2026-04-27
      expect(normaliseHorizon('2026-W18')).toBe('2026-04-27');
    });

    it('should handle week 1 of a year', () => {
      // ISO week 1 of 2026: Monday 2025-12-29 (Jan 4 2026 falls in W1)
      const result = normaliseHorizon('2026-W01');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should throw for an out-of-range ISO week number', () => {
      expect(() => normaliseHorizon('2026-W00')).toThrow(/Invalid ISO week/);
      expect(() => normaliseHorizon('2026-W54')).toThrow(/Invalid ISO week/);
    });

    it('should throw for invalid calendar dates and malformed horizons', () => {
      expect(() => normaliseHorizon('2026-13-99')).toThrow(/Invalid calendar date/);
      expect(() => normaliseHorizon('soon')).toThrow(/expectedHorizon must be/);
    });
  });

  // -------------------------------------------------------------------------
  // Multi-day foreseen activities fan-out helper
  // -------------------------------------------------------------------------
  describe('multi-day foreseen activities fan-out', () => {
    it('should generate session day IDs for a 4-day plenary week', () => {
      const startDate = '2026-04-28'; // Monday of the April 2026 Strasbourg session
      const days = generateSessionDayIds(startDate, 4);
      expect(days).toHaveLength(4);
      expect(days[0]).toBe('MTG-PL-2026-04-28');
      expect(days[1]).toBe('MTG-PL-2026-04-29');
      expect(days[2]).toBe('MTG-PL-2026-04-30');
      expect(days[3]).toBe('MTG-PL-2026-05-01');
    });

    it('should generate session day IDs for a 2-day mini-session', () => {
      const days = generateSessionDayIds('2026-10-21', 2);
      expect(days).toHaveLength(2);
      expect(days[0]).toBe('MTG-PL-2026-10-21');
      expect(days[1]).toBe('MTG-PL-2026-10-22');
    });

    it('should detect a Monday run date for urgency motion sweep', () => {
      expect(isMondayRun('2026-04-27')).toBe(true);
      expect(isMondayRun('2026-04-28')).toBe(false);
      expect(isMondayRun('2026-04-29')).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // readExpiredUnresolved
  // -------------------------------------------------------------------------
  describe('readExpiredUnresolved', () => {
    it('should return empty array when no entries exist', () => {
      const result = readExpiredUnresolved({ today: '2026-05-02', registryDir: tmpDir });
      expect(result).toHaveLength(0);
    });

    it('should return empty array when all entries have future horizons', () => {
      appendEntries([
        makeEntry({ id: 'future-1', expectedHorizon: '2026-06-15', status: 'open' }),
        makeEntry({ id: 'future-2', expectedHorizon: '2026-07-01', status: 'open' }),
      ], tmpDir);
      const result = readExpiredUnresolved({ today: '2026-05-02', registryDir: tmpDir });
      expect(result).toHaveLength(0);
    });

    it('should return expired entries that are not resolved/stale/extended', () => {
      appendEntries([
        makeEntry({ id: 'expired-open', expectedHorizon: '2026-04-01', status: 'open' }),
        makeEntry({ id: 'expired-implemented', expectedHorizon: '2026-03-15', status: 'implemented' }),
        makeEntry({ id: 'not-expired', expectedHorizon: '2026-06-01', status: 'open' }),
      ], tmpDir);
      const result = readExpiredUnresolved({ today: '2026-05-02', registryDir: tmpDir });
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id).sort()).toEqual(['expired-implemented', 'expired-open']);
    });

    it('should exclude entries with status resolved, stale, or extended', () => {
      appendEntries([
        makeEntry({ id: 'resolved-one', expectedHorizon: '2026-03-01', status: 'resolved' }),
        makeEntry({ id: 'stale-one', expectedHorizon: '2026-02-01', status: 'stale' }),
        makeEntry({ id: 'extended-one', expectedHorizon: '2026-01-01', status: 'extended' }),
        makeEntry({ id: 'open-expired', expectedHorizon: '2026-04-01', status: 'open' }),
      ], tmpDir);
      const result = readExpiredUnresolved({ today: '2026-05-02', registryDir: tmpDir });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('open-expired');
    });

    it('should handle ISO week horizons correctly', () => {
      // 2026-W10 = Monday 2026-03-02
      appendEntries([
        makeEntry({ id: 'week-expired', expectedHorizon: '2026-W10', status: 'open' }),
      ], tmpDir);
      const result = readExpiredUnresolved({ today: '2026-05-02', registryDir: tmpDir });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('week-expired');
    });

    it('should skip entries with missing or invalid expectedHorizon and log warnings', () => {
      // Write raw JSONL directly to bypass appendEntries validation
      const shard = path.join(tmpDir, '2026-04.jsonl');
      fs.mkdirSync(tmpDir, { recursive: true });
      const noHorizon = JSON.stringify({ id: 'no-horizon', topic: 'test', originatingRunId: 'r1', originatingDate: '2026-04-01', statement: 's', status: 'open', evidenceRefs: [] });
      const badHorizon = JSON.stringify({ id: 'bad-horizon', topic: 'test', originatingRunId: 'r1', originatingDate: '2026-04-01', statement: 's', expectedHorizon: 'soon', status: 'open', evidenceRefs: [] });
      const validExpired = JSON.stringify({ id: 'valid-expired', topic: 'test', originatingRunId: 'r1', originatingDate: '2026-04-01', statement: 's', expectedHorizon: '2026-04-01', status: 'open', evidenceRefs: [] });
      fs.writeFileSync(shard, `${noHorizon}\n${badHorizon}\n${validExpired}\n`, 'utf8');
      const result = readExpiredUnresolved({ today: '2026-05-02', registryDir: tmpDir });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid-expired');
    });

    it('should use today UTC when no today option provided', () => {
      // An entry far in the past should always be expired
      appendEntries([
        makeEntry({ id: 'old-one', expectedHorizon: '2020-01-01', status: 'open' }),
      ], tmpDir);
      const result = readExpiredUnresolved({ registryDir: tmpDir });
      expect(result).toHaveLength(1);
    });
  });
});
