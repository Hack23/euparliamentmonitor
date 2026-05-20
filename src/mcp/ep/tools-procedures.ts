// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/tools-procedures
 * @description Procedure & adopted-text method mixins for
 * {@link EuropeanParliamentMCPClient}. Augments the class prototype with
 * getProcedures, getFreshProcedures, getAdoptedTexts, and pending-document helpers.
 */

import { EuropeanParliamentMCPClient } from './client.js';
import { ProcedureSeenCache } from '../procedure-seen-cache.js';
import {
  recordPendingDocument,
  markDocumentResolved,
  getPendingDocumentsForReprobe,
  escalateExpiredDocuments,
  getPendingDocumentsSummary,
} from '../pending-documents.js';
import type {
  MCPToolResult,
  GetProceduresOptions,
  GetAdoptedTextsOptions,
  GetFreshProceduresOptions,
} from '../../types/index.js';
import { ADOPTED_TEXTS_FALLBACK, CONTENT_NOT_YET_AVAILABLE_SUBSTRING } from './fallbacks.js';
import { _parseResultPayload, _isEmptyStringSentinel } from './parse.js';

// \u2500\u2500\u2500 Declaration merging \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare module './client.js' {
  interface EuropeanParliamentMCPClient {
    getProcedures(options?: GetProceduresOptions): Promise<MCPToolResult>;
    getFreshProcedures(options?: GetFreshProceduresOptions): Promise<MCPToolResult>;
    getAdoptedTexts(options?: GetAdoptedTextsOptions): Promise<MCPToolResult>;
    getDueAdoptedTextsForReprobe(): Promise<string[]>;
    resolveAdoptedText(docId: string): Promise<void>;
    escalateStalePendingDocuments(): Promise<string[]>;
    getPendingDocumentsSummary(): Promise<string>;
  }
}

// \u2500\u2500\u2500 Type helper for accessing protected internals from prototype methods \u2500\u2500\u2500\u2500
type ClientInternal = {
  safeCallTool(
    name: string,
    args: object | (() => object),
    fallback: string
  ): Promise<MCPToolResult>;
  callToolWithRetry(name: string, args: object, maxRetries?: number): Promise<MCPToolResult>;
  _calledTools: Set<string>;
  _failedTools: Map<string, string>;
  _recordToolFailure(name: string, error: string, fallback: string): MCPToolResult;
  _pendingDocumentsStorePath: string | undefined;
};

function _self(client: EuropeanParliamentMCPClient): ClientInternal {
  return client as unknown as ClientInternal;
}

// \u2500\u2500\u2500 Prototype method implementations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

EuropeanParliamentMCPClient.prototype.getProcedures = async function (
  this: EuropeanParliamentMCPClient,
  options: GetProceduresOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_procedures', options, '{"procedures": []}');
};

EuropeanParliamentMCPClient.prototype.getFreshProcedures = async function (
  this: EuropeanParliamentMCPClient,
  options: GetFreshProceduresOptions = {}
): Promise<MCPToolResult> {
  const { limit = 100, windowDays = 30, topN, seenCacheStorePath } = options;

  const raw = await this.getProcedures({ limit });
  const payload = _parseResultPayload(raw);
  const payloadProcedures = payload?.['procedures'];
  const allProcedures: unknown[] = Array.isArray(payloadProcedures) ? payloadProcedures : [];

  const todayMinus = new Date();
  todayMinus.setUTCDate(todayMinus.getUTCDate() - windowDays);
  const cutoff = todayMinus.toISOString().slice(0, 10);

  const normalised = allProcedures.filter(
    (p): p is Record<string, unknown> => p !== null && typeof p === 'object' && !Array.isArray(p)
  );

  const withSortKey = normalised.map((p) => {
    const dla = typeof p['dateLastActivity'] === 'string' ? p['dateLastActivity'] : '';
    const di = typeof p['dateInitiated'] === 'string' ? p['dateInitiated'] : '';
    return { item: p, effectiveDate: dla.length > 0 ? dla : di };
  });

  withSortKey.sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

  const inWindow = withSortKey
    .filter(({ effectiveDate }) => effectiveDate >= cutoff)
    .map(({ item }) => item);

  const result = topN !== undefined ? inWindow.slice(0, topN) : inWindow;

  const cache = new ProcedureSeenCache(seenCacheStorePath);
  for (const p of result) {
    const id = typeof p['id'] === 'string' ? p['id'] : '';
    const dateLastActivity = typeof p['dateLastActivity'] === 'string' ? p['dateLastActivity'] : '';
    if (id.length > 0) {
      cache.upsert(id, dateLastActivity);
    }
  }
  cache.save();

  return {
    content: [{ type: 'text', text: JSON.stringify({ procedures: result }) }],
  };
};

EuropeanParliamentMCPClient.prototype.getAdoptedTexts = async function (
  this: EuropeanParliamentMCPClient,
  options: GetAdoptedTextsOptions = {}
): Promise<MCPToolResult> {
  if (typeof options.docId === 'string' && options.docId.trim().length > 0) {
    return _fetchAdoptedTextByDocId(this, options.docId.trim());
  }
  return _self(this).safeCallTool('get_adopted_texts', options, ADOPTED_TEXTS_FALLBACK);
};

/**
 * Contextual fetcher for single-document `get_adopted_texts` lookups.
 * Handles CONTENT_PENDING classification for indexing lag.
 * @param client - The EP MCP client instance
 * @param docId - Document identifier to fetch
 * @returns Tool result with adopted text or pending sentinel
 */
async function _fetchAdoptedTextByDocId(
  client: EuropeanParliamentMCPClient,
  docId: string
): Promise<MCPToolResult> {
  const internals = _self(client);
  internals._calledTools.add('get_adopted_texts');
  const persistPending = (label: string): Promise<void> =>
    recordPendingDocument(docId, internals._pendingDocumentsStorePath)
      .then(() => undefined)
      .catch((err) => {
        console.warn(
          `\u26a0\ufe0f pending-documents: failed to record pending doc (${label}):`,
          (err as Error).message
        );
      });
  try {
    const result = await internals.callToolWithRetry('get_adopted_texts', { docId });

    if (result.isError === true) {
      const text = result.content?.[0]?.text ?? '';
      if (text.toLowerCase().includes(CONTENT_NOT_YET_AVAILABLE_SUBSTRING)) {
        internals._failedTools.set(
          'get_adopted_texts',
          `CONTENT_PENDING: ${docId} EP indexing lag (tracked in pending-documents sidecar)`
        );
        console.warn(`\u26a0\ufe0f get_adopted_texts [CONTENT_PENDING]: ${docId} EP indexing lag`);
        await persistPending('isError');
        return { content: [{ type: 'text', text: ADOPTED_TEXTS_FALLBACK }] };
      }
      return internals._recordToolFailure('get_adopted_texts', text, ADOPTED_TEXTS_FALLBACK);
    }

    const payload = _parseResultPayload(result);
    if (_isEmptyStringSentinel(payload)) {
      await persistPending('sentinel');
      return internals._recordToolFailure(
        'get_adopted_texts',
        `CONTENT_PENDING: docId=${docId} returned empty-string sentinel (upstream #369)`,
        ADOPTED_TEXTS_FALLBACK
      );
    }

    internals._failedTools.delete('get_adopted_texts');
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes(CONTENT_NOT_YET_AVAILABLE_SUBSTRING)) {
      internals._failedTools.set(
        'get_adopted_texts',
        `CONTENT_PENDING: ${docId} EP indexing lag (tracked in pending-documents sidecar)`
      );
      console.warn(`\u26a0\ufe0f get_adopted_texts [CONTENT_PENDING]: ${docId} EP indexing lag`);
      await persistPending('upstream_404');
      return { content: [{ type: 'text', text: ADOPTED_TEXTS_FALLBACK }] };
    }
    return internals._recordToolFailure('get_adopted_texts', message, ADOPTED_TEXTS_FALLBACK);
  }
}

EuropeanParliamentMCPClient.prototype.getDueAdoptedTextsForReprobe = async function (
  this: EuropeanParliamentMCPClient
): Promise<string[]> {
  return getPendingDocumentsForReprobe(_self(this)._pendingDocumentsStorePath);
};

EuropeanParliamentMCPClient.prototype.resolveAdoptedText = async function (
  this: EuropeanParliamentMCPClient,
  docId: string
): Promise<void> {
  await markDocumentResolved(docId, _self(this)._pendingDocumentsStorePath);
};

EuropeanParliamentMCPClient.prototype.escalateStalePendingDocuments = async function (
  this: EuropeanParliamentMCPClient
): Promise<string[]> {
  return escalateExpiredDocuments(_self(this)._pendingDocumentsStorePath);
};

EuropeanParliamentMCPClient.prototype.getPendingDocumentsSummary = async function (
  this: EuropeanParliamentMCPClient
): Promise<string> {
  return getPendingDocumentsSummary(_self(this)._pendingDocumentsStorePath);
};
