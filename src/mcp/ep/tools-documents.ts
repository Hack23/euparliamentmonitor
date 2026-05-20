// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/tools-documents
 * @description Document, event, and intelligence method mixins for
 * {@link EuropeanParliamentMCPClient}. Augments the class prototype with
 * getEvents, getMeeting*, document retrieval, and analysis intelligence methods.
 */

import { EuropeanParliamentMCPClient } from './client.js';
import type {
  MCPToolResult,
  GetEventsOptions,
  GetMeetingActivitiesOptions,
  GetMeetingDecisionsOptions,
  GetMEPDeclarationsOptions,
  GetIncomingMEPsOptions,
  GetOutgoingMEPsOptions,
  GetHomonymMEPsOptions,
  GetLatestVotesOptions,
  GetPlenaryDocumentsOptions,
  GetCommitteeDocumentsOptions,
  GetPlenarySessionDocumentsOptions,
  GetPlenarySessionDocumentItemsOptions,
  GetControlledVocabulariesOptions,
  GetExternalDocumentsOptions,
  GetMeetingForeseenActivitiesOptions,
  GetProcedureEventsOptions,
  GetMeetingPlenarySessionDocumentsOptions,
  GetMeetingPlenarySessionDocumentItemsOptions,
  NetworkAnalysisOptions,
  SentimentTrackerOptions,
  EarlyWarningSystemOptions,
  ComparativeIntelligenceOptions,
  CorrelateIntelligenceOptions,
  GetAllGeneratedStatsOptions,
} from '../../types/index.js';
import {
  MEPS_FALLBACK,
  DOCUMENTS_FALLBACK,
  EVENTS_FALLBACK,
  ACTIVITIES_FALLBACK,
  ITEMS_FALLBACK,
  INTELLIGENCE_FALLBACK,
  STATS_FALLBACK,
} from './fallbacks.js';

// \u2500\u2500\u2500 Declaration merging \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare module './client.js' {
  interface EuropeanParliamentMCPClient {
    getEvents(options?: GetEventsOptions): Promise<MCPToolResult>;
    getMeetingActivities(options: GetMeetingActivitiesOptions): Promise<MCPToolResult>;
    getMeetingDecisions(options: GetMeetingDecisionsOptions): Promise<MCPToolResult>;
    getMEPDeclarations(options?: GetMEPDeclarationsOptions): Promise<MCPToolResult>;
    getIncomingMEPs(options?: GetIncomingMEPsOptions): Promise<MCPToolResult>;
    getOutgoingMEPs(options?: GetOutgoingMEPsOptions): Promise<MCPToolResult>;
    getHomonymMEPs(options?: GetHomonymMEPsOptions): Promise<MCPToolResult>;
    getLatestVotes(options?: GetLatestVotesOptions): Promise<MCPToolResult>;
    getPlenaryDocuments(options?: GetPlenaryDocumentsOptions): Promise<MCPToolResult>;
    getCommitteeDocuments(options?: GetCommitteeDocumentsOptions): Promise<MCPToolResult>;
    getPlenarySessionDocuments(options?: GetPlenarySessionDocumentsOptions): Promise<MCPToolResult>;
    getPlenarySessionDocumentItems(
      options?: GetPlenarySessionDocumentItemsOptions
    ): Promise<MCPToolResult>;
    getControlledVocabularies(options?: GetControlledVocabulariesOptions): Promise<MCPToolResult>;
    getExternalDocuments(options?: GetExternalDocumentsOptions): Promise<MCPToolResult>;
    getMeetingForeseenActivities(
      options: GetMeetingForeseenActivitiesOptions
    ): Promise<MCPToolResult>;
    getProcedureEvents(options: GetProcedureEventsOptions): Promise<MCPToolResult>;
    getMeetingPlenarySessionDocuments(
      options: GetMeetingPlenarySessionDocumentsOptions
    ): Promise<MCPToolResult>;
    getMeetingPlenarySessionDocumentItems(
      options: GetMeetingPlenarySessionDocumentItemsOptions
    ): Promise<MCPToolResult>;
    networkAnalysis(options?: NetworkAnalysisOptions): Promise<MCPToolResult>;
    sentimentTracker(options?: SentimentTrackerOptions): Promise<MCPToolResult>;
    earlyWarningSystem(options?: EarlyWarningSystemOptions): Promise<MCPToolResult>;
    comparativeIntelligence(options: ComparativeIntelligenceOptions): Promise<MCPToolResult>;
    correlateIntelligence(options: CorrelateIntelligenceOptions): Promise<MCPToolResult>;
    getAllGeneratedStats(options?: GetAllGeneratedStatsOptions): Promise<MCPToolResult>;
  }
}

// \u2500\u2500\u2500 Type helper for accessing protected internals from prototype methods \u2500\u2500\u2500\u2500
type ClientInternal = {
  safeCallTool(
    name: string,
    args: object | (() => object),
    fallback: string
  ): Promise<MCPToolResult>;
  safeCallToolWithReliabilityTimeout(
    name: string,
    args: object | (() => object),
    fallback: string
  ): Promise<MCPToolResult>;
};

function _self(client: EuropeanParliamentMCPClient): ClientInternal {
  return client as unknown as ClientInternal;
}

// \u2500\u2500\u2500 Prototype method implementations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

EuropeanParliamentMCPClient.prototype.getEvents = async function (
  this: EuropeanParliamentMCPClient,
  options: GetEventsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_events', options, EVENTS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getMeetingActivities = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMeetingActivitiesOptions
): Promise<MCPToolResult> {
  if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
    console.warn(
      'get_meeting_activities called without valid sittingId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
  }
  return _self(this).safeCallTool(
    'get_meeting_activities',
    { ...options, sittingId: options.sittingId.trim() },
    ACTIVITIES_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.getMeetingDecisions = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMeetingDecisionsOptions
): Promise<MCPToolResult> {
  if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
    console.warn(
      'get_meeting_decisions called without valid sittingId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: '{"decisions": []}' }] };
  }
  return _self(this).safeCallTool(
    'get_meeting_decisions',
    { ...options, sittingId: options.sittingId.trim() },
    '{"decisions": []}'
  );
};

EuropeanParliamentMCPClient.prototype.getMEPDeclarations = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMEPDeclarationsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_mep_declarations', options, '{"declarations": []}');
};

EuropeanParliamentMCPClient.prototype.getIncomingMEPs = async function (
  this: EuropeanParliamentMCPClient,
  options: GetIncomingMEPsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_incoming_meps', options, MEPS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getOutgoingMEPs = async function (
  this: EuropeanParliamentMCPClient,
  options: GetOutgoingMEPsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_outgoing_meps', options, MEPS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getHomonymMEPs = async function (
  this: EuropeanParliamentMCPClient,
  options: GetHomonymMEPsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_homonym_meps', options, MEPS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getLatestVotes = async function (
  this: EuropeanParliamentMCPClient,
  options: GetLatestVotesOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallToolWithReliabilityTimeout(
    'get_latest_votes',
    options,
    '{"votes": [], "dataFreshness": "NEAR_REALTIME"}'
  );
};

EuropeanParliamentMCPClient.prototype.getPlenaryDocuments = async function (
  this: EuropeanParliamentMCPClient,
  options: GetPlenaryDocumentsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_plenary_documents', options, DOCUMENTS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getCommitteeDocuments = async function (
  this: EuropeanParliamentMCPClient,
  options: GetCommitteeDocumentsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_committee_documents', options, DOCUMENTS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getPlenarySessionDocuments = async function (
  this: EuropeanParliamentMCPClient,
  options: GetPlenarySessionDocumentsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_plenary_session_documents', options, DOCUMENTS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getPlenarySessionDocumentItems = async function (
  this: EuropeanParliamentMCPClient,
  options: GetPlenarySessionDocumentItemsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_plenary_session_document_items', options, ITEMS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getControlledVocabularies = async function (
  this: EuropeanParliamentMCPClient,
  options: GetControlledVocabulariesOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_controlled_vocabularies', options, '{"vocabularies": []}');
};

EuropeanParliamentMCPClient.prototype.getExternalDocuments = async function (
  this: EuropeanParliamentMCPClient,
  options: GetExternalDocumentsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_external_documents', options, DOCUMENTS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getMeetingForeseenActivities = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMeetingForeseenActivitiesOptions
): Promise<MCPToolResult> {
  if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
    console.warn(
      'get_meeting_foreseen_activities called without valid sittingId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: ACTIVITIES_FALLBACK }] };
  }
  return _self(this).safeCallTool(
    'get_meeting_foreseen_activities',
    { ...options, sittingId: options.sittingId.trim() },
    ACTIVITIES_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.getProcedureEvents = async function (
  this: EuropeanParliamentMCPClient,
  options: GetProcedureEventsOptions
): Promise<MCPToolResult> {
  if (typeof options.processId !== 'string' || options.processId.trim().length === 0) {
    console.warn('get_procedure_events called without valid processId (non-empty string required)');
    return { content: [{ type: 'text', text: EVENTS_FALLBACK }] };
  }
  return _self(this).safeCallTool(
    'get_procedure_events',
    { ...options, processId: options.processId.trim() },
    EVENTS_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.getMeetingPlenarySessionDocuments = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMeetingPlenarySessionDocumentsOptions
): Promise<MCPToolResult> {
  if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
    console.warn(
      'get_meeting_plenary_session_documents called without valid sittingId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: DOCUMENTS_FALLBACK }] };
  }
  return _self(this).safeCallTool(
    'get_meeting_plenary_session_documents',
    { ...options, sittingId: options.sittingId.trim() },
    DOCUMENTS_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.getMeetingPlenarySessionDocumentItems = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMeetingPlenarySessionDocumentItemsOptions
): Promise<MCPToolResult> {
  if (typeof options.sittingId !== 'string' || options.sittingId.trim().length === 0) {
    console.warn(
      'get_meeting_plenary_session_document_items called without valid sittingId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: ITEMS_FALLBACK }] };
  }
  return _self(this).safeCallTool(
    'get_meeting_plenary_session_document_items',
    { ...options, sittingId: options.sittingId.trim() },
    ITEMS_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.networkAnalysis = async function (
  this: EuropeanParliamentMCPClient,
  options: NetworkAnalysisOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('network_analysis', options, INTELLIGENCE_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.sentimentTracker = async function (
  this: EuropeanParliamentMCPClient,
  options: SentimentTrackerOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('sentiment_tracker', options, INTELLIGENCE_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.earlyWarningSystem = async function (
  this: EuropeanParliamentMCPClient,
  options: EarlyWarningSystemOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('early_warning_system', options, INTELLIGENCE_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.comparativeIntelligence = async function (
  this: EuropeanParliamentMCPClient,
  options: ComparativeIntelligenceOptions
): Promise<MCPToolResult> {
  if (!Array.isArray(options.mepIds) || options.mepIds.length < 2) {
    console.warn(
      'comparative_intelligence called without valid mepIds (array of at least 2 required)'
    );
    return { content: [{ type: 'text', text: INTELLIGENCE_FALLBACK }] };
  }
  return _self(this).safeCallTool('comparative_intelligence', options, INTELLIGENCE_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.correlateIntelligence = async function (
  this: EuropeanParliamentMCPClient,
  options: CorrelateIntelligenceOptions
): Promise<MCPToolResult> {
  if (!Array.isArray(options.mepIds) || options.mepIds.length === 0) {
    console.warn(
      'correlate_intelligence called without valid mepIds (non-empty string array required)'
    );
    return { content: [{ type: 'text', text: INTELLIGENCE_FALLBACK }] };
  }
  return _self(this).safeCallTool('correlate_intelligence', options, INTELLIGENCE_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getAllGeneratedStats = async function (
  this: EuropeanParliamentMCPClient,
  options: GetAllGeneratedStatsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_all_generated_stats', options, STATS_FALLBACK);
};
