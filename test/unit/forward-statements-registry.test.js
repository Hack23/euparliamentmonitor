// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  shardPath,
  parseLine,
  newId,
  validateEntry,
  appendEntries,
  readEntries,
  updateEntry,
  buildSummary,
  normaliseHorizon,
} from '../../scripts/aggregator/forward-statements-registry.js';

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

    it('should accept YYYY-Www for expectedHorizon', () => {
      expect(validateEntry(makeEntry({ expectedHorizon: '2026-W18' }))).toHaveLength(0);
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
      fs.writeFileSync(shard, `${JSON.stringify(makeEntry())}\n\n{ bad json\n`, 'utf8');
      const all = readEntries({ registryDir: tmpDir });
      expect(all).toHaveLength(1);
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

      // readEntries returns ALL lines; last one for the id has status 'implemented'
      const all = readEntries({ registryDir: tmpDir });
      const byId = new Map();
      for (const e of all) {
        if (typeof e.id === 'string') byId.set(e.id, e);
      }
      expect(byId.get(id).status).toBe('implemented');
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

      const all = readEntries({ registryDir: tmpDir });
      const byId = new Map();
      for (const e of all) {
        if (typeof e.id === 'string') byId.set(e.id, e);
      }
      expect(byId.get(id).evidenceRefs).toContain('TA-10-2026-0142');
      expect(byId.get(id).evidenceRefs).toContain('A-10-2026-0067');
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
  });

  // -------------------------------------------------------------------------
  // Multi-day foreseen activities fan-out helper
  // -------------------------------------------------------------------------
  describe('multi-day foreseen activities fan-out', () => {
    it('should generate session day IDs for a 4-day plenary week', () => {
      // Simulate the fan-out logic: given a session start date (Monday),
      // generate sitting IDs for Mon–Thu.
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
});

// ---------------------------------------------------------------------------
// Inline test helpers (not exported — test-only logic for multi-day fan-out)
// ---------------------------------------------------------------------------

/**
 * Generate an array of EP plenary sitting IDs for consecutive session days.
 * The format is `MTG-PL-YYYY-MM-DD` — the canonical sitting ID pattern used
 * by the EP MCP `get_meeting_foreseen_activities` endpoint.
 *
 * @param {string} startDateStr - YYYY-MM-DD date of the first session day
 * @param {number} numDays - Number of consecutive session days (typically 4 for Strasbourg, 2 for Brussels mini)
 * @returns {string[]} Array of sitting IDs
 */
function generateSessionDayIds(startDateStr, numDays) {
  const ids = [];
  const [year, month, day] = startDateStr.split('-').map(Number);
  const startMs = Date.UTC(year, month - 1, day);
  for (let i = 0; i < numDays; i++) {
    const ms = startMs + i * 24 * 60 * 60 * 1000;
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    ids.push(`MTG-PL-${y}-${m}-${dd}`);
  }
  return ids;
}

/**
 * Return `true` when the given date string falls on a Monday (UTC).
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {boolean}
 */
function isMondayRun(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 1;
}
