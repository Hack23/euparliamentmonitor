// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for procedure-seen-cache.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  ProcedureSeenCache,
  DEFAULT_PROCEDURE_SEEN_CACHE_PATH,
} from '../../scripts/mcp/procedure-seen-cache.js';

describe('ProcedureSeenCache', () => {
  let tmpDir;
  let cachePath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'proc-seen-cache-'));
    cachePath = path.join(tmpDir, 'test-cache.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('should create an empty cache when the file does not exist', () => {
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.size()).toBe(0);
    });

    it('should export DEFAULT_PROCEDURE_SEEN_CACHE_PATH', () => {
      expect(typeof DEFAULT_PROCEDURE_SEEN_CACHE_PATH).toBe('string');
      expect(DEFAULT_PROCEDURE_SEEN_CACHE_PATH).toContain('procedure-seen-cache.json');
    });

    it('should load existing entries from disk', () => {
      const fileData = {
        version: 1,
        updatedAt: '2026-04-25T00:00:00.000Z',
        entries: {
          '2026-0001': { dateLastActivity: '2026-04-20', seenAt: '2026-04-20T10:00:00.000Z' },
          '2026-0002': { dateLastActivity: '2026-04-18', seenAt: '2026-04-18T10:00:00.000Z' },
        },
      };
      fs.writeFileSync(cachePath, JSON.stringify(fileData), 'utf-8');
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.size()).toBe(2);
      expect(cache.has('2026-0001')).toBe(true);
      expect(cache.has('2026-0002')).toBe(true);
      expect(cache.getDateLastActivity('2026-0001')).toBe('2026-04-20');
    });

    it('should return empty cache when file is malformed JSON', () => {
      fs.writeFileSync(cachePath, 'not-json', 'utf-8');
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.size()).toBe(0);
    });

    it('should return empty cache when file has wrong version', () => {
      const fileData = { version: 999, updatedAt: '2026-04-25T00:00:00.000Z', entries: {} };
      fs.writeFileSync(cachePath, JSON.stringify(fileData), 'utf-8');
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.size()).toBe(0);
    });

    it('should return empty cache when file is an array', () => {
      fs.writeFileSync(cachePath, '[]', 'utf-8');
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.size()).toBe(0);
    });

    it('should skip entries with missing required fields', () => {
      const fileData = {
        version: 1,
        updatedAt: '2026-04-25T00:00:00.000Z',
        entries: {
          '2026-0001': { dateLastActivity: '2026-04-20', seenAt: '2026-04-20T10:00:00.000Z' },
          '2026-bad': { notAField: 'oops' },
        },
      };
      fs.writeFileSync(cachePath, JSON.stringify(fileData), 'utf-8');
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.size()).toBe(1);
      expect(cache.has('2026-0001')).toBe(true);
      expect(cache.has('2026-bad')).toBe(false);
    });
  });

  describe('upsert', () => {
    it('should add a new entry', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-20');
      expect(cache.has('2026-0001')).toBe(true);
      expect(cache.getDateLastActivity('2026-0001')).toBe('2026-04-20');
      expect(cache.size()).toBe(1);
    });

    it('should update an existing entry when dateLastActivity changes', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-20');
      cache.upsert('2026-0001', '2026-04-25'); // updated
      expect(cache.getDateLastActivity('2026-0001')).toBe('2026-04-25');
      expect(cache.size()).toBe(1);
    });

    it('should not mark dirty when dateLastActivity is unchanged', () => {
      const fileData = {
        version: 1,
        updatedAt: '2026-04-20T00:00:00.000Z',
        entries: {
          '2026-0001': { dateLastActivity: '2026-04-20', seenAt: '2026-04-20T10:00:00.000Z' },
        },
      };
      fs.writeFileSync(cachePath, JSON.stringify(fileData), 'utf-8');
      const cache = new ProcedureSeenCache(cachePath);
      const statBefore = fs.statSync(cachePath).mtimeMs;
      cache.upsert('2026-0001', '2026-04-20'); // same value — not dirty
      cache.save();
      const statAfter = fs.statSync(cachePath).mtimeMs;
      expect(statAfter).toBe(statBefore); // file not rewritten
    });
  });

  describe('getDateLastActivity', () => {
    it('should return undefined for unknown procedure ID', () => {
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.getDateLastActivity('2026-9999')).toBeUndefined();
    });

    it('should return the stored dateLastActivity', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-22');
      expect(cache.getDateLastActivity('2026-0001')).toBe('2026-04-22');
    });
  });

  describe('has', () => {
    it('should return false for unknown ID', () => {
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.has('2026-9999')).toBe(false);
    });

    it('should return true after upsert', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-22');
      expect(cache.has('2026-0001')).toBe(true);
    });
  });

  describe('getNewOrUpdatedIds', () => {
    it('should return all IDs when cache is empty', () => {
      const cache = new ProcedureSeenCache(cachePath);
      const items = [
        { id: '2026-0001', dateLastActivity: '2026-04-20' },
        { id: '2026-0002', dateLastActivity: '2026-04-19' },
      ];
      expect(cache.getNewOrUpdatedIds(items)).toEqual(['2026-0001', '2026-0002']);
    });

    it('should exclude IDs whose dateLastActivity is unchanged', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-20');
      const items = [
        { id: '2026-0001', dateLastActivity: '2026-04-20' }, // unchanged
        { id: '2026-0002', dateLastActivity: '2026-04-19' }, // new
      ];
      expect(cache.getNewOrUpdatedIds(items)).toEqual(['2026-0002']);
    });

    it('should include IDs whose dateLastActivity has changed', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-15');
      const items = [{ id: '2026-0001', dateLastActivity: '2026-04-25' }]; // updated
      expect(cache.getNewOrUpdatedIds(items)).toEqual(['2026-0001']);
    });

    it('should return empty array when all items are unchanged', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-20');
      cache.upsert('2026-0002', '2026-04-19');
      const items = [
        { id: '2026-0001', dateLastActivity: '2026-04-20' },
        { id: '2026-0002', dateLastActivity: '2026-04-19' },
      ];
      expect(cache.getNewOrUpdatedIds(items)).toEqual([]);
    });
  });

  describe('save', () => {
    it('should persist entries to disk', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-20');
      cache.upsert('2026-0002', '2026-04-18');
      cache.save();

      expect(fs.existsSync(cachePath)).toBe(true);
      const saved = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      expect(saved.version).toBe(1);
      expect(saved.entries['2026-0001'].dateLastActivity).toBe('2026-04-20');
      expect(saved.entries['2026-0002'].dateLastActivity).toBe('2026-04-18');
    });

    it('should create parent directories if they do not exist', () => {
      const deepPath = path.join(tmpDir, 'sub', 'dir', 'cache.json');
      const cache = new ProcedureSeenCache(deepPath);
      cache.upsert('2026-0001', '2026-04-20');
      cache.save();
      expect(fs.existsSync(deepPath)).toBe(true);
    });

    it('should be idempotent when not dirty', () => {
      const fileData = {
        version: 1,
        updatedAt: '2026-04-20T00:00:00.000Z',
        entries: {
          '2026-0001': { dateLastActivity: '2026-04-20', seenAt: '2026-04-20T10:00:00.000Z' },
        },
      };
      fs.writeFileSync(cachePath, JSON.stringify(fileData), 'utf-8');
      const cache = new ProcedureSeenCache(cachePath);
      const mtimeBefore = fs.statSync(cachePath).mtimeMs;
      cache.save(); // nothing changed — should not rewrite
      const mtimeAfter = fs.statSync(cachePath).mtimeMs;
      expect(mtimeAfter).toBe(mtimeBefore);
    });

    it('should round-trip correctly (save then reload)', () => {
      const cache1 = new ProcedureSeenCache(cachePath);
      cache1.upsert('2026-0001', '2026-04-25');
      cache1.upsert('2026-0002', '');
      cache1.save();

      const cache2 = new ProcedureSeenCache(cachePath);
      expect(cache2.size()).toBe(2);
      expect(cache2.getDateLastActivity('2026-0001')).toBe('2026-04-25');
      expect(cache2.getDateLastActivity('2026-0002')).toBe('');
    });
  });

  describe('size', () => {
    it('should return 0 for a new empty cache', () => {
      const cache = new ProcedureSeenCache(cachePath);
      expect(cache.size()).toBe(0);
    });

    it('should reflect the number of upserted entries', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-20');
      cache.upsert('2026-0002', '2026-04-19');
      expect(cache.size()).toBe(2);
    });

    it('should not double-count when upserting the same ID', () => {
      const cache = new ProcedureSeenCache(cachePath);
      cache.upsert('2026-0001', '2026-04-20');
      cache.upsert('2026-0001', '2026-04-25');
      expect(cache.size()).toBe(1);
    });
  });
});
