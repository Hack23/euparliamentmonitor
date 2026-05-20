// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/tools-feeds
 * @description EP API v2 feed endpoint method mixins for
 * {@link EuropeanParliamentMCPClient}. Augments the class prototype with
 * all feed-related methods, plus getServerHealth and getProcedureEventById.
 */

import { EuropeanParliamentMCPClient } from './client.js';
import type {
  MCPToolResult,
  MCPContentItem,
  GetMEPsFeedOptions,
  GetEventsFeedOptions,
  GetProceduresFeedOptions,
  GetAdoptedTextsFeedOptions,
  GetMEPDeclarationsFeedOptions,
  GetDocumentsFeedOptions,
  GetPlenaryDocumentsFeedOptions,
  GetCommitteeDocumentsFeedOptions,
  GetPlenarySessionDocumentsFeedOptions,
  GetExternalDocumentsFeedOptions,
  GetParliamentaryQuestionsFeedOptions,
  GetCorporateBodiesFeedOptions,
  GetControlledVocabulariesFeedOptions,
  GetProcedureEventByIdOptions,
} from '../../types/index.js';
import { PROCEDURE_EVENT_FALLBACK, SERVER_HEALTH_FALLBACK } from './fallbacks.js';
import { _parseResultPayload } from './parse.js';
import { classifyToolError, isFeedUnavailable } from './error-classifier.js';
import { detectProceduresFeedStaleTail } from './staleness.js';

/** Fallback payload for feed tools */
const FEED_FALLBACK = '{"feed": []}';

// \u2500\u2500\u2500 Declaration merging \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare module './client.js' {
  interface EuropeanParliamentMCPClient {
    getMEPsFeed(options?: GetMEPsFeedOptions): Promise<MCPToolResult>;
    getEventsFeed(options?: GetEventsFeedOptions): Promise<MCPToolResult>;
    getProceduresFeed(options?: GetProceduresFeedOptions): Promise<MCPToolResult>;
    getAdoptedTextsFeed(options?: GetAdoptedTextsFeedOptions): Promise<MCPToolResult>;
    getMEPDeclarationsFeed(options?: GetMEPDeclarationsFeedOptions): Promise<MCPToolResult>;
    getDocumentsFeed(options?: GetDocumentsFeedOptions): Promise<MCPToolResult>;
    getPlenaryDocumentsFeed(options?: GetPlenaryDocumentsFeedOptions): Promise<MCPToolResult>;
    getCommitteeDocumentsFeed(options?: GetCommitteeDocumentsFeedOptions): Promise<MCPToolResult>;
    getPlenarySessionDocumentsFeed(
      options?: GetPlenarySessionDocumentsFeedOptions
    ): Promise<MCPToolResult>;
    getExternalDocumentsFeed(options?: GetExternalDocumentsFeedOptions): Promise<MCPToolResult>;
    getCommissionWorkProgramme(
      options?: Omit<GetExternalDocumentsFeedOptions, 'workType'>
    ): Promise<MCPToolResult>;
    getCouncilPresidencyProgramme(
      options?: Omit<GetExternalDocumentsFeedOptions, 'workType'>
    ): Promise<MCPToolResult>;
    getParliamentaryQuestionsFeed(
      options?: GetParliamentaryQuestionsFeedOptions
    ): Promise<MCPToolResult>;
    getCorporateBodiesFeed(options?: GetCorporateBodiesFeedOptions): Promise<MCPToolResult>;
    getControlledVocabulariesFeed(
      options?: GetControlledVocabulariesFeedOptions
    ): Promise<MCPToolResult>;
    getProcedureEventById(options: GetProcedureEventByIdOptions): Promise<MCPToolResult>;
    getServerHealth(): Promise<MCPToolResult>;
  }
}

// \u2500\u2500\u2500 Type helper for accessing protected internals from prototype methods \u2500\u2500\u2500\u2500
type ClientInternal = {
  safeCallTool(name: string, args: object | (() => object), fallback: string): Promise<MCPToolResult>;
  safeCallToolWithReliabilityTimeout(
    name: string,
    args: object | (() => object),
    fallback: string
  ): Promise<MCPToolResult>;
  callToolWithRetry(name: string, args: object, maxRetries?: number): Promise<MCPToolResult>;
  _calledTools: Set<string>;
  _failedTools: Map<string, string>;
  _slowFeedWarnings: Map<string, string>;
  _recordToolFailure(name: string, error: string, fallback: string): MCPToolResult;
};

function _self(client: EuropeanParliamentMCPClient): ClientInternal {
  return client as unknown as ClientInternal;
}

// \u2500\u2500\u2500 Prototype method implementations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

EuropeanParliamentMCPClient.prototype.getMEPsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMEPsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_meps_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getEventsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetEventsFeedOptions = {}
): Promise<MCPToolResult> {
  const internals = _self(this);
  internals._calledTools.add('get_events_feed');
  try {
    const result = await internals.callToolWithRetry('get_events_feed', options);

    if (result.isError === true) {
      internals._slowFeedWarnings.delete('get_events_feed');
      return internals._recordToolFailure(
        'get_events_feed',
        result.content?.[0]?.text ?? '',
        FEED_FALLBACK
      );
    }

    if (isFeedUnavailable(result)) {
      internals._slowFeedWarnings.delete('get_events_feed');
      return internals._recordToolFailure(
        'get_events_feed',
        `UPSTREAM_404: ${result.content?.[0]?.text?.slice(0, 200) ?? 'feed unavailable'}`,
        FEED_FALLBACK
      );
    }

    internals._failedTools.delete('get_events_feed');
    internals._slowFeedWarnings.delete('get_events_feed');
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (classifyToolError(message) === 'TIMEOUT') {
      const warningMsg = `SLOW_FEED: ${message.slice(0, 200)}`;
      internals._failedTools.delete('get_events_feed');
      internals._slowFeedWarnings.set('get_events_feed', warningMsg);
      console.warn('\ud83d\udfe1 get_events_feed slow-feed warning [SLOW_FEED]:', message.slice(0, 200));
      return { content: [{ type: 'text', text: '{"feed":[],"slowFeedWarning":true}' }] };
    }

    internals._slowFeedWarnings.delete('get_events_feed');
    return internals._recordToolFailure('get_events_feed', message, FEED_FALLBACK);
  }
};

EuropeanParliamentMCPClient.prototype.getProceduresFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetProceduresFeedOptions = {}
): Promise<MCPToolResult> {
  const result = await _self(this).safeCallTool('get_procedures_feed', options, FEED_FALLBACK);

  const payload = _parseResultPayload(result);
  if (detectProceduresFeedStaleTail(payload)) {
    console.warn(
      '\ud83d\udfe1 procedures-feed: stale historical tail \u2014 newest procedure year is <2020; use get_adopted_texts({ year: $YEAR }) or track_legislation({ procedureId }) instead'
    );
    const existingWarnings = Array.isArray(payload?.['dataQualityWarnings'])
      ? (payload['dataQualityWarnings'] as string[])
      : [];
    const augmented: Record<string, unknown> = {
      ...(payload as Record<string, unknown>),
      staleTail: true,
      dataQualityWarnings: [
        ...existingWarnings,
        'STALE_TAIL: procedures-feed returned stale historical tail (max year <2020) \u2014 likely upstream ordering degradation; fallback: get_adopted_texts({ year: $YEAR }) or track_legislation({ procedureId })',
      ],
    };
    const augmentedText = JSON.stringify(augmented);
    const originalContent = result.content;
    const updatedContent: MCPContentItem[] =
      Array.isArray(originalContent) && originalContent.length > 0
        ? originalContent.map((item, index) =>
            index === 0 ? { ...item, text: augmentedText } : item
          )
        : [{ type: 'text', text: augmentedText }];
    return { ...result, content: updatedContent };
  }

  return result;
};

EuropeanParliamentMCPClient.prototype.getAdoptedTextsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetAdoptedTextsFeedOptions = {}
): Promise<MCPToolResult> {
  const internals = _self(this);
  const result = await internals.safeCallTool('get_adopted_texts_feed', options, FEED_FALLBACK);

  const payload = _parseResultPayload(result);
  const rawWarnings = payload?.['dataQualityWarnings'];
  const warnings: string[] = Array.isArray(rawWarnings)
    ? rawWarnings.filter((w): w is string => typeof w === 'string')
    : [];

  const freshnessWarnings = warnings.filter((w) => w.startsWith('FRESHNESS_FALLBACK'));

  if (freshnessWarnings.length === 0) {
    return result;
  }

  const failedWarning = freshnessWarnings.find((w) => w.startsWith('FRESHNESS_FALLBACK_FAILED'));
  if (failedWarning !== undefined) {
    return internals._recordToolFailure(
      'get_adopted_texts_feed',
      `ANALYSIS_ONLY: ${failedWarning.slice(0, 200)}`,
      FEED_FALLBACK
    );
  }

  const augmented: Record<string, unknown> = {
    ...(payload as Record<string, unknown>),
    freshness: 'augmented',
    dataFreshnessWarnings: freshnessWarnings,
  };
  const augmentedText = JSON.stringify(augmented);
  const originalContent = result.content;
  const updatedContent: MCPContentItem[] =
    Array.isArray(originalContent) && originalContent.length > 0
      ? originalContent.map((item, index) =>
          index === 0 ? { ...item, text: augmentedText } : item
        )
      : [{ type: 'text', text: augmentedText }];
  return { ...result, content: updatedContent };
};

EuropeanParliamentMCPClient.prototype.getMEPDeclarationsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMEPDeclarationsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_mep_declarations_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getDocumentsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetDocumentsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_documents_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getPlenaryDocumentsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetPlenaryDocumentsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_plenary_documents_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getCommitteeDocumentsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetCommitteeDocumentsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallToolWithReliabilityTimeout(
    'get_committee_documents_feed',
    options,
    FEED_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.getPlenarySessionDocumentsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetPlenarySessionDocumentsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_plenary_session_documents_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getExternalDocumentsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetExternalDocumentsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallToolWithReliabilityTimeout(
    'get_external_documents_feed',
    options,
    FEED_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.getCommissionWorkProgramme = async function (
  this: EuropeanParliamentMCPClient,
  options: Omit<GetExternalDocumentsFeedOptions, 'workType'> = {}
): Promise<MCPToolResult> {
  return this.getExternalDocumentsFeed({ ...options, workType: 'COM_WORK_PROGRAMME' });
};

EuropeanParliamentMCPClient.prototype.getCouncilPresidencyProgramme = async function (
  this: EuropeanParliamentMCPClient,
  options: Omit<GetExternalDocumentsFeedOptions, 'workType'> = {}
): Promise<MCPToolResult> {
  return this.getExternalDocumentsFeed({ ...options, workType: 'COUNCIL_PRESIDENCY_PROGRAMME' });
};

EuropeanParliamentMCPClient.prototype.getParliamentaryQuestionsFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetParliamentaryQuestionsFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_parliamentary_questions_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getCorporateBodiesFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetCorporateBodiesFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_corporate_bodies_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getControlledVocabulariesFeed = async function (
  this: EuropeanParliamentMCPClient,
  options: GetControlledVocabulariesFeedOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_controlled_vocabularies_feed', options, FEED_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getProcedureEventById = async function (
  this: EuropeanParliamentMCPClient,
  options: GetProcedureEventByIdOptions
): Promise<MCPToolResult> {
  if (typeof options.processId !== 'string' || options.processId.trim().length === 0) {
    console.warn(
      'get_procedure_event_by_id called without valid processId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: PROCEDURE_EVENT_FALLBACK }] };
  }
  if (typeof options.eventId !== 'string' || options.eventId.trim().length === 0) {
    console.warn(
      'get_procedure_event_by_id called without valid eventId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: PROCEDURE_EVENT_FALLBACK }] };
  }
  return _self(this).safeCallTool(
    'get_procedure_event_by_id',
    { processId: options.processId.trim(), eventId: options.eventId.trim() },
    PROCEDURE_EVENT_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.getServerHealth = async function (
  this: EuropeanParliamentMCPClient
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_server_health', {}, SERVER_HEALTH_FALLBACK);
};
