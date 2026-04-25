// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

// @ts-check

/**
 * Unit tests for pending-documents.js
 * Tests the EP indexing-lag retry-scheduling sidecar module.
 *
 * @typedef {import('../../scripts/mcp/pending-documents.js').PendingDocument} PendingDocument
 * @typedef {import('../../scripts/mcp/pending-documents.js').PendingDocumentsStore} PendingDocumentsStore
 */

/* eslint-disable no-undef */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import {
  computeNextProbeAfter,
  isDueForProbe,
  isExpiredPending,
  loadPendingDocuments,
  savePendingDocuments,
  recordPendingDocument,
  markDocumentResolved,
  getPendingDocumentsForReprobe,
  escalateExpiredDocuments,
  getPendingDocumentsSummary,
  INITIAL_BACKOFF_MS,
  MAX_BACKOFF_MS,
  MAX_AGE_MS,
  STORE_VERSION,
} from '../../scripts/mcp/pending-documents.js';
import { createTempDir, cleanupTempDir } from '../helpers/test-utils.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** @param {string} dir */
function storePath(dir) {
  return path.join(dir, 'pending-documents.json');
}

/**
 * Build a minimal PendingDocument for test assertions.
 * @param {Partial<PendingDocument>} overrides
 * @returns {PendingDocument}
 */
function makePendingDoc(overrides = {}) {
  const now = new Date('2026-04-25T00:00:00.000Z');
  const doc = {
    docId: 'TA-10-2026-0001',
    firstObservedAt: now.toISOString(),
    lastProbedAt: now.toISOString(),
    attempts: 1,
    nextProbeAfter: computeNextProbeAfter(now.toISOString(), 1),
    status: 'PENDING',
    ...overrides,
  };
  return /** @type {PendingDocument} */ (doc);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('pending-documents', () => {
  /** @type {string} */
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  // ─── computeNextProbeAfter ─────────────────────────────────────────────────

  describe('computeNextProbeAfter', () => {
    it('should return 24h ahead for attempt 1', () => {
      const base = '2026-04-25T00:00:00.000Z';
      const result = computeNextProbeAfter(base, 1);
      const expected = new Date(new Date(base).getTime() + INITIAL_BACKOFF_MS).toISOString();
      expect(result).toBe(expected);
    });

    it('should double the delay for attempt 2 (48 h)', () => {
      const base = '2026-04-25T00:00:00.000Z';
      const result = computeNextProbeAfter(base, 2);
      const expected = new Date(new Date(base).getTime() + INITIAL_BACKOFF_MS * 2).toISOString();
      expect(result).toBe(expected);
    });

    it('should cap the delay at MAX_BACKOFF_MS (72 h) for attempt 3+', () => {
      const base = '2026-04-25T00:00:00.000Z';
      const result3 = computeNextProbeAfter(base, 3);
      const result10 = computeNextProbeAfter(base, 10);
      const expected = new Date(new Date(base).getTime() + MAX_BACKOFF_MS).toISOString();
      expect(result3).toBe(expected);
      expect(result10).toBe(expected);
    });

    it('should cap to MAX_BACKOFF_MS but not exceed it', () => {
      const base = '2026-04-25T00:00:00.000Z';
      const result = computeNextProbeAfter(base, 5);
      const cappedDate = new Date(new Date(base).getTime() + MAX_BACKOFF_MS);
      expect(new Date(result).getTime()).toBe(cappedDate.getTime());
    });
  });

  // ─── isDueForProbe ─────────────────────────────────────────────────────────

  describe('isDueForProbe', () => {
    it('should return true when nextProbeAfter has passed', () => {
      const doc = makePendingDoc({
        nextProbeAfter: '2026-04-20T00:00:00.000Z',
        status: 'PENDING',
      });
      expect(isDueForProbe(doc, new Date('2026-04-25T00:00:00.000Z'))).toBe(true);
    });

    it('should return false when nextProbeAfter has not passed', () => {
      const doc = makePendingDoc({
        nextProbeAfter: '2026-04-30T00:00:00.000Z',
        status: 'PENDING',
      });
      expect(isDueForProbe(doc, new Date('2026-04-25T00:00:00.000Z'))).toBe(false);
    });

    it('should return false for RESOLVED documents', () => {
      const doc = makePendingDoc({
        nextProbeAfter: '2026-04-20T00:00:00.000Z',
        status: 'RESOLVED',
      });
      expect(isDueForProbe(doc, new Date('2026-04-25T00:00:00.000Z'))).toBe(false);
    });

    it('should return false for ESCALATED documents', () => {
      const doc = makePendingDoc({
        nextProbeAfter: '2026-04-20T00:00:00.000Z',
        status: 'ESCALATED',
      });
      expect(isDueForProbe(doc, new Date('2026-04-25T00:00:00.000Z'))).toBe(false);
    });

    it('should return true when nextProbeAfter equals now exactly', () => {
      const now = new Date('2026-04-25T12:00:00.000Z');
      const doc = makePendingDoc({
        nextProbeAfter: now.toISOString(),
        status: 'PENDING',
      });
      expect(isDueForProbe(doc, now)).toBe(true);
    });
  });

  // ─── isExpiredPending ──────────────────────────────────────────────────────

  describe('isExpiredPending', () => {
    it('should return true when document is older than 14 days', () => {
      const doc = makePendingDoc({
        firstObservedAt: '2026-04-01T00:00:00.000Z',
        status: 'PENDING',
      });
      // 25 days later
      expect(isExpiredPending(doc, new Date('2026-04-26T00:00:00.000Z'))).toBe(true);
    });

    it('should return false when document is within 14 days', () => {
      const doc = makePendingDoc({
        firstObservedAt: '2026-04-20T00:00:00.000Z',
        status: 'PENDING',
      });
      // Only 5 days later
      expect(isExpiredPending(doc, new Date('2026-04-25T00:00:00.000Z'))).toBe(false);
    });

    it('should return false for RESOLVED documents even if old', () => {
      const doc = makePendingDoc({
        firstObservedAt: '2026-01-01T00:00:00.000Z',
        status: 'RESOLVED',
      });
      expect(isExpiredPending(doc, new Date('2026-04-25T00:00:00.000Z'))).toBe(false);
    });

    it('should return false for ESCALATED documents', () => {
      const doc = makePendingDoc({
        firstObservedAt: '2026-01-01T00:00:00.000Z',
        status: 'ESCALATED',
      });
      expect(isExpiredPending(doc, new Date('2026-04-25T00:00:00.000Z'))).toBe(false);
    });
  });

  // ─── loadPendingDocuments ──────────────────────────────────────────────────

  describe('loadPendingDocuments', () => {
    it('should return an empty store when the file does not exist', async () => {
      const store = await loadPendingDocuments(storePath(tmpDir));
      expect(store.version).toBe(STORE_VERSION);
      expect(store.documents).toEqual({});
    });

    it('should load an existing store', async () => {
      const p = storePath(tmpDir);
      const initial = {
        version: '1.0',
        lastUpdatedAt: '2026-04-25T00:00:00.000Z',
        documents: { 'TA-10-2026-0001': makePendingDoc() },
      };
      fs.writeFileSync(p, JSON.stringify(initial), 'utf-8');

      const store = await loadPendingDocuments(p);
      expect(store.documents['TA-10-2026-0001']).toBeDefined();
      expect(store.documents['TA-10-2026-0001'].docId).toBe('TA-10-2026-0001');
    });

    it('should return an empty store when the file contains invalid JSON', async () => {
      const p = storePath(tmpDir);
      fs.writeFileSync(p, 'not json', 'utf-8');
      const store = await loadPendingDocuments(p);
      expect(store.documents).toEqual({});
    });
  });

  // ─── savePendingDocuments ──────────────────────────────────────────────────

  describe('savePendingDocuments', () => {
    it('should write the store and update lastUpdatedAt', async () => {
      const p = storePath(tmpDir);
      const store = {
        version: '1.0',
        lastUpdatedAt: '2000-01-01T00:00:00.000Z',
        documents: {},
      };
      const before = new Date();
      await savePendingDocuments(store, p);

      const raw = fs.readFileSync(p, 'utf-8');
      const parsed = JSON.parse(raw);
      expect(new Date(parsed.lastUpdatedAt).getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should create parent directories as needed', async () => {
      const nested = path.join(tmpDir, 'deep', 'nested', 'pending-documents.json');
      await savePendingDocuments({ version: '1.0', lastUpdatedAt: '', documents: {} }, nested);
      expect(fs.existsSync(nested)).toBe(true);
    });
  });

  // ─── recordPendingDocument ─────────────────────────────────────────────────

  describe('recordPendingDocument', () => {
    it('should create a new PENDING record on first observation', async () => {
      const p = storePath(tmpDir);
      const now = new Date('2026-04-25T12:00:00.000Z');
      const doc = await recordPendingDocument('TA-10-2026-0104', p, now);

      expect(doc.docId).toBe('TA-10-2026-0104');
      expect(doc.status).toBe('PENDING');
      expect(doc.attempts).toBe(1);
      expect(doc.firstObservedAt).toBe(now.toISOString());
      expect(doc.lastProbedAt).toBe(now.toISOString());
      // nextProbeAfter = 24 h from now
      const expectedNext = new Date(now.getTime() + INITIAL_BACKOFF_MS).toISOString();
      expect(doc.nextProbeAfter).toBe(expectedNext);
    });

    it('should persist the record to disk', async () => {
      const p = storePath(tmpDir);
      await recordPendingDocument('TA-10-2026-0104', p);
      const store = await loadPendingDocuments(p);
      expect(store.documents['TA-10-2026-0104']).toBeDefined();
    });

    it('should increment attempts and update lastProbedAt on subsequent calls', async () => {
      const p = storePath(tmpDir);
      const t1 = new Date('2026-04-25T00:00:00.000Z');
      await recordPendingDocument('TA-10-2026-0104', p, t1);

      const t2 = new Date('2026-04-26T12:00:00.000Z');
      const doc = await recordPendingDocument('TA-10-2026-0104', p, t2);

      expect(doc.attempts).toBe(2);
      expect(doc.lastProbedAt).toBe(t2.toISOString());
      // firstObservedAt must not change
      expect(doc.firstObservedAt).toBe(t1.toISOString());
    });

    it('should compute doubling back-off on second attempt', async () => {
      const p = storePath(tmpDir);
      const t1 = new Date('2026-04-25T00:00:00.000Z');
      await recordPendingDocument('TA-10-2026-0104', p, t1);

      const t2 = new Date('2026-04-26T12:00:00.000Z');
      const doc = await recordPendingDocument('TA-10-2026-0104', p, t2);

      // attempt 2 → 48 h back-off from t2
      const expected = new Date(t2.getTime() + INITIAL_BACKOFF_MS * 2).toISOString();
      expect(doc.nextProbeAfter).toBe(expected);
    });

    it('should not update a RESOLVED document', async () => {
      const p = storePath(tmpDir);
      const t1 = new Date('2026-04-25T00:00:00.000Z');
      await recordPendingDocument('TA-10-2026-0104', p, t1);
      await markDocumentResolved('TA-10-2026-0104', p, t1);

      const t2 = new Date('2026-04-28T00:00:00.000Z');
      const doc = await recordPendingDocument('TA-10-2026-0104', p, t2);

      expect(doc.status).toBe('RESOLVED');
      expect(doc.attempts).toBe(1); // unchanged
    });

    it('should handle multiple distinct docIds independently', async () => {
      const p = storePath(tmpDir);
      const now = new Date('2026-04-25T00:00:00.000Z');
      await recordPendingDocument('TA-10-2026-0104', p, now);
      await recordPendingDocument('TA-10-2026-0092', p, now);

      const store = await loadPendingDocuments(p);
      expect(Object.keys(store.documents)).toHaveLength(2);
    });
  });

  // ─── markDocumentResolved ──────────────────────────────────────────────────

  describe('markDocumentResolved', () => {
    it('should set status to RESOLVED', async () => {
      const p = storePath(tmpDir);
      await recordPendingDocument('TA-10-2026-0104', p);
      await markDocumentResolved('TA-10-2026-0104', p);

      const store = await loadPendingDocuments(p);
      expect(store.documents['TA-10-2026-0104'].status).toBe('RESOLVED');
    });

    it('should update lastProbedAt on resolution', async () => {
      const p = storePath(tmpDir);
      const t1 = new Date('2026-04-25T00:00:00.000Z');
      await recordPendingDocument('TA-10-2026-0104', p, t1);

      const t2 = new Date('2026-04-30T00:00:00.000Z');
      await markDocumentResolved('TA-10-2026-0104', p, t2);

      const store = await loadPendingDocuments(p);
      expect(store.documents['TA-10-2026-0104'].lastProbedAt).toBe(t2.toISOString());
    });

    it('should be a no-op for unknown docIds', async () => {
      const p = storePath(tmpDir);
      // Should not throw
      await expect(markDocumentResolved('TA-10-2099-9999', p)).resolves.toBeUndefined();
    });
  });

  // ─── getPendingDocumentsForReprobe ─────────────────────────────────────────

  describe('getPendingDocumentsForReprobe', () => {
    it('should return docIds due for reprobe', async () => {
      const p = storePath(tmpDir);
      const old = new Date('2026-04-01T00:00:00.000Z');
      const future = new Date('2099-01-01T00:00:00.000Z');

      // Manually write a store with one due and one not-due entry
      const store = {
        version: '1.0',
        lastUpdatedAt: old.toISOString(),
        documents: {
          'TA-10-2026-0104': {
            docId: 'TA-10-2026-0104',
            firstObservedAt: old.toISOString(),
            lastProbedAt: old.toISOString(),
            attempts: 1,
            nextProbeAfter: old.toISOString(), // already past
            status: 'PENDING',
          },
          'TA-10-2026-0092': {
            docId: 'TA-10-2026-0092',
            firstObservedAt: old.toISOString(),
            lastProbedAt: old.toISOString(),
            attempts: 1,
            nextProbeAfter: future.toISOString(), // not yet due
            status: 'PENDING',
          },
        },
      };
      fs.writeFileSync(p, JSON.stringify(store), 'utf-8');

      const due = await getPendingDocumentsForReprobe(p, new Date('2026-04-25T00:00:00.000Z'));
      expect(due).toContain('TA-10-2026-0104');
      expect(due).not.toContain('TA-10-2026-0092');
    });

    it('should return empty array when no docs are due', async () => {
      const p = storePath(tmpDir);
      const due = await getPendingDocumentsForReprobe(p);
      expect(due).toEqual([]);
    });

    it('should exclude ESCALATED and RESOLVED documents', async () => {
      const p = storePath(tmpDir);
      const old = new Date('2026-04-01T00:00:00.000Z');
      const store = {
        version: '1.0',
        lastUpdatedAt: old.toISOString(),
        documents: {
          'TA-10-2026-0104': {
            docId: 'TA-10-2026-0104',
            firstObservedAt: old.toISOString(),
            lastProbedAt: old.toISOString(),
            attempts: 1,
            nextProbeAfter: old.toISOString(),
            status: 'ESCALATED',
          },
          'TA-10-2026-0092': {
            docId: 'TA-10-2026-0092',
            firstObservedAt: old.toISOString(),
            lastProbedAt: old.toISOString(),
            attempts: 1,
            nextProbeAfter: old.toISOString(),
            status: 'RESOLVED',
          },
        },
      };
      fs.writeFileSync(p, JSON.stringify(store), 'utf-8');

      const due = await getPendingDocumentsForReprobe(p, new Date('2026-04-25T00:00:00.000Z'));
      expect(due).toEqual([]);
    });
  });

  // ─── escalateExpiredDocuments ──────────────────────────────────────────────

  describe('escalateExpiredDocuments', () => {
    it('should escalate PENDING docs older than MAX_AGE_MS', async () => {
      const p = storePath(tmpDir);
      const veryOld = new Date('2026-01-01T00:00:00.000Z');
      const recent = new Date('2026-04-20T00:00:00.000Z');
      const now = new Date('2026-04-25T00:00:00.000Z');

      const store = {
        version: '1.0',
        lastUpdatedAt: veryOld.toISOString(),
        documents: {
          'TA-10-2025-0345': {
            docId: 'TA-10-2025-0345',
            firstObservedAt: veryOld.toISOString(),
            lastProbedAt: veryOld.toISOString(),
            attempts: 5,
            nextProbeAfter: now.toISOString(),
            status: 'PENDING',
          },
          'TA-10-2026-0092': {
            docId: 'TA-10-2026-0092',
            firstObservedAt: recent.toISOString(),
            lastProbedAt: recent.toISOString(),
            attempts: 1,
            nextProbeAfter: now.toISOString(),
            status: 'PENDING',
          },
        },
      };
      fs.writeFileSync(p, JSON.stringify(store), 'utf-8');

      const escalated = await escalateExpiredDocuments(p, now);
      expect(escalated).toContain('TA-10-2025-0345');
      expect(escalated).not.toContain('TA-10-2026-0092');

      const updated = await loadPendingDocuments(p);
      expect(updated.documents['TA-10-2025-0345'].status).toBe('ESCALATED');
      expect(updated.documents['TA-10-2026-0092'].status).toBe('PENDING');
    });

    it('should return empty array when no docs are expired', async () => {
      const p = storePath(tmpDir);
      const escalated = await escalateExpiredDocuments(p);
      expect(escalated).toEqual([]);
    });
  });

  // ─── getPendingDocumentsSummary ────────────────────────────────────────────

  describe('getPendingDocumentsSummary', () => {
    it('should return "0 tracked" for an empty store', async () => {
      const p = storePath(tmpDir);
      const summary = await getPendingDocumentsSummary(p);
      expect(summary).toBe('Pending Documents: 0 tracked');
    });

    it('should include counts for each status', async () => {
      const p = storePath(tmpDir);
      const now = new Date('2026-04-25T00:00:00.000Z');
      const old = new Date('2026-04-01T00:00:00.000Z');

      const store = {
        version: '1.0',
        lastUpdatedAt: now.toISOString(),
        documents: {
          'TA-10-2026-0104': {
            docId: 'TA-10-2026-0104',
            firstObservedAt: now.toISOString(),
            lastProbedAt: now.toISOString(),
            attempts: 1,
            nextProbeAfter: old.toISOString(), // past → due
            status: 'PENDING',
          },
          'TA-10-2026-0092': {
            docId: 'TA-10-2026-0092',
            firstObservedAt: old.toISOString(),
            lastProbedAt: old.toISOString(),
            attempts: 3,
            nextProbeAfter: old.toISOString(),
            status: 'ESCALATED',
          },
          'TA-10-2025-0345': {
            docId: 'TA-10-2025-0345',
            firstObservedAt: old.toISOString(),
            lastProbedAt: old.toISOString(),
            attempts: 2,
            nextProbeAfter: old.toISOString(),
            status: 'RESOLVED',
          },
        },
      };
      fs.writeFileSync(p, JSON.stringify(store), 'utf-8');

      const summary = await getPendingDocumentsSummary(p, now);
      expect(summary).toContain('1 pending');
      expect(summary).toContain('1 resolved');
      expect(summary).toContain('1 escalated');
      expect(summary).toContain('Due for reprobe: TA-10-2026-0104');
      expect(summary).toContain('Escalated (>14d): TA-10-2026-0092');
    });
  });

  // ─── MAX_AGE_MS constant ───────────────────────────────────────────────────

  describe('constants', () => {
    it('INITIAL_BACKOFF_MS should be 24 hours', () => {
      expect(INITIAL_BACKOFF_MS).toBe(24 * 60 * 60 * 1000);
    });

    it('MAX_BACKOFF_MS should be 72 hours', () => {
      expect(MAX_BACKOFF_MS).toBe(72 * 60 * 60 * 1000);
    });

    it('MAX_AGE_MS should be 14 days', () => {
      expect(MAX_AGE_MS).toBe(14 * 24 * 60 * 60 * 1000);
    });
  });
});
