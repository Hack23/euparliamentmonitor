// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module MCP/PendingDocuments
 * @description Persistence sidecar for EP adopted texts that are indexed but
 * not yet available (EP Open Data Portal 5–15-day indexing lag).
 *
 * When Stage B deep-fetch receives `UPSTREAM_404: document indexed but content
 * not yet available` from the MCP server, the document identifier is recorded
 * here with `{ docId, firstObservedAt, lastProbedAt, attempts }` so that
 * subsequent workflow runs can re-probe with exponential back-off instead of
 * treating the item as a permanent retrieval failure.
 *
 * Back-off schedule: initial 24 h, doubling each attempt, capped at 72 h.
 * Documents older than 14 days are escalated (status = ESCALATED) so the
 * wildcards-blackswans family can handle them.
 *
 * @see {@link https://data.europarl.europa.eu/en/developer-corner EP Open Data Portal — Developer Corner}
 */
import * as fs from 'fs/promises';
import * as path from 'path';
// ─── Constants ───────────────────────────────────────────────────────────────
/** Schema version written to every store file */
export const STORE_VERSION = '1.0';
/** Initial back-off delay: 24 hours in milliseconds */
export const INITIAL_BACKOFF_MS = 24 * 60 * 60 * 1000;
/** Maximum back-off delay: 72 hours in milliseconds */
export const MAX_BACKOFF_MS = 72 * 60 * 60 * 1000;
/**
 * Maximum tracking age before escalation: 14 days in milliseconds.
 * After this period the document is escalated to the wildcards-blackswans
 * analysis family rather than continued re-probing.
 */
export const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
// ─── Pure computation helpers ─────────────────────────────────────────────────
/**
 * Compute the ISO timestamp after which the next probe is due.
 *
 * The delay doubles with each attempt (exponential back-off), capped at
 * {@link MAX_BACKOFF_MS}:
 * - attempt 1 → 24 h
 * - attempt 2 → 48 h
 * - attempt 3+ → 72 h (capped)
 *
 * @param fromTime - ISO timestamp used as the reference point (lastProbedAt)
 * @param attempts - Total probe attempts recorded so far (≥ 1)
 * @returns ISO timestamp after which the next probe should be issued
 */
export function computeNextProbeAfter(fromTime, attempts) {
    const backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempts - 1), MAX_BACKOFF_MS);
    return new Date(new Date(fromTime).getTime() + backoffMs).toISOString();
}
/**
 * Return `true` when a PENDING document is due for a re-probe.
 *
 * @param doc - Pending document record
 * @param now - Reference time (defaults to `new Date()`)
 * @returns `true` if `doc.status` is PENDING and `doc.nextProbeAfter` has passed
 */
export function isDueForProbe(doc, now = new Date()) {
    if (doc.status !== 'PENDING')
        return false;
    return new Date(doc.nextProbeAfter) <= now;
}
/**
 * Return `true` when a PENDING document has exceeded the maximum tracking age
 * and should be escalated to the wildcards-blackswans family.
 *
 * @param doc - Pending document record
 * @param now - Reference time (defaults to `new Date()`)
 * @returns `true` if `doc.status` is PENDING and `firstObservedAt + MAX_AGE_MS` is in the past
 */
export function isExpiredPending(doc, now = new Date()) {
    if (doc.status !== 'PENDING')
        return false;
    return new Date(doc.firstObservedAt).getTime() + MAX_AGE_MS < now.getTime();
}
// ─── I/O helpers ─────────────────────────────────────────────────────────────
/**
 * Resolve the default sidecar path: `<cwd>/data/pending-documents.json`.
 * The caller may override this (e.g., for test isolation) via the optional
 * `storePath` parameter accepted by every exported function.
 *
 * @returns Absolute path to the pending-documents sidecar file
 */
export function defaultStorePath() {
    return path.resolve(process.cwd(), 'data', 'pending-documents.json');
}
/**
 * Create an empty store with sensible defaults.
 *
 * @returns A fresh {@link PendingDocumentsStore} with no documents
 */
function emptyStore() {
    return {
        version: STORE_VERSION,
        lastUpdatedAt: new Date().toISOString(),
        documents: {},
    };
}
/**
 * Load the pending documents store from disk.
 * Returns an empty store when the file does not exist.
 * Logs a warning and returns an empty store on any other read/parse error
 * so a corrupted sidecar never blocks the workflow.
 *
 * @param storePath - Path override (defaults to `data/pending-documents.json`)
 * @returns The loaded {@link PendingDocumentsStore}, or an empty store on ENOENT/parse error
 */
export async function loadPendingDocuments(storePath) {
    const filePath = storePath ?? defaultStorePath();
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
        }
        return emptyStore();
    }
    catch (err) {
        const code = err.code;
        if (code !== 'ENOENT') {
            console.warn('⚠️ pending-documents: failed to load store:', err.message);
        }
        return emptyStore();
    }
}
/**
 * Persist the store to disk, creating the parent directory as needed.
 * Updates `store.lastUpdatedAt` before writing.
 *
 * @param store - Store object to write
 * @param storePath - Path override
 */
export async function savePendingDocuments(store, storePath) {
    const filePath = storePath ?? defaultStorePath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    store.lastUpdatedAt = new Date().toISOString();
    await fs.writeFile(filePath, JSON.stringify(store, null, 2) + '\n', 'utf-8');
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Record a document as CONTENT_PENDING.
 *
 * **Idempotent**: if the docId is already tracked as PENDING the function
 * increments `attempts`, updates `lastProbedAt`, and recomputes
 * `nextProbeAfter` — `firstObservedAt` is never overwritten.
 * If the docId already has a terminal status (RESOLVED, ESCALATED) it is
 * left unchanged.
 *
 * @param docId - Adopted-text identifier (e.g., "TA-10-2026-0104")
 * @param storePath - Path override (for test isolation)
 * @param now - Reference time (defaults to `new Date()`)
 * @returns The updated or newly created {@link PendingDocument}
 */
export async function recordPendingDocument(docId, storePath, now = new Date()) {
    const store = await loadPendingDocuments(storePath);
    const nowIso = now.toISOString();
    const existing = store.documents[docId];
    if (existing) {
        if (existing.status === 'PENDING') {
            // Update tracking fields; preserve firstObservedAt
            existing.attempts += 1;
            existing.lastProbedAt = nowIso;
            existing.nextProbeAfter = computeNextProbeAfter(nowIso, existing.attempts);
            await savePendingDocuments(store, storePath);
            return existing;
        }
        // Terminal status — return as-is without write
        return existing;
    }
    // New entry
    const doc = {
        docId,
        firstObservedAt: nowIso,
        lastProbedAt: nowIso,
        attempts: 1,
        nextProbeAfter: computeNextProbeAfter(nowIso, 1),
        status: 'PENDING',
    };
    store.documents[docId] = doc;
    await savePendingDocuments(store, storePath);
    return doc;
}
/**
 * Mark a pending document as RESOLVED (content successfully retrieved on
 * a subsequent probe).
 *
 * No-op when the docId is not in the store.
 *
 * @param docId - Adopted-text identifier
 * @param storePath - Path override
 * @param now - Reference time (defaults to `new Date()`)
 */
export async function markDocumentResolved(docId, storePath, now = new Date()) {
    const store = await loadPendingDocuments(storePath);
    const doc = store.documents[docId];
    if (!doc)
        return;
    doc.status = 'RESOLVED';
    doc.lastProbedAt = now.toISOString();
    await savePendingDocuments(store, storePath);
}
/**
 * Return the docIds of PENDING documents whose `nextProbeAfter` has passed.
 *
 * @param storePath - Path override
 * @param now - Reference time (defaults to `new Date()`)
 * @returns Array of docIds due for reprobe (may be empty)
 */
export async function getPendingDocumentsForReprobe(storePath, now = new Date()) {
    const store = await loadPendingDocuments(storePath);
    return Object.values(store.documents)
        .filter((doc) => isDueForProbe(doc, now))
        .map((doc) => doc.docId);
}
/**
 * Escalate PENDING documents that have exceeded the 14-day maximum tracking
 * age. Escalated documents are no longer returned by
 * {@link getPendingDocumentsForReprobe} and should be handled by the
 * wildcards-blackswans family instead.
 *
 * @param storePath - Path override
 * @param now - Reference time (defaults to `new Date()`)
 * @returns Array of docIds that were escalated
 */
export async function escalateExpiredDocuments(storePath, now = new Date()) {
    const store = await loadPendingDocuments(storePath);
    const escalated = [];
    for (const doc of Object.values(store.documents)) {
        if (isExpiredPending(doc, now)) {
            doc.status = 'ESCALATED';
            escalated.push(doc.docId);
        }
    }
    if (escalated.length > 0) {
        await savePendingDocuments(store, storePath);
    }
    return escalated;
}
/**
 * Return a human-readable summary of the sidecar for Stage B observability
 * logging. Shows counts by status and lists docIds due for reprobe and
 * docIds that have been escalated.
 *
 * @param storePath - Path override
 * @param now - Reference time (defaults to `new Date()`)
 */
export async function getPendingDocumentsSummary(storePath, now = new Date()) {
    const store = await loadPendingDocuments(storePath);
    const docs = Object.values(store.documents);
    if (docs.length === 0) {
        return 'Pending Documents: 0 tracked';
    }
    const pending = docs.filter((d) => d.status === 'PENDING');
    const resolved = docs.filter((d) => d.status === 'RESOLVED');
    const escalated = docs.filter((d) => d.status === 'ESCALATED');
    const due = pending.filter((d) => isDueForProbe(d, now));
    const lines = [
        `Pending Documents: ${pending.length} pending, ${resolved.length} resolved, ${escalated.length} escalated`,
    ];
    if (due.length > 0) {
        lines.push(`  Due for reprobe: ${due.map((d) => d.docId).join(', ')}`);
    }
    if (escalated.length > 0) {
        lines.push(`  Escalated (>14d): ${escalated.map((d) => d.docId).join(', ')}`);
    }
    return lines.join('\n');
}
//# sourceMappingURL=pending-documents.js.map