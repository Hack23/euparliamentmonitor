// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/MCP
 * @description Thin re-export barrel — preserves the legacy
 * `from '../types/mcp.js'` import path while the underlying type definitions
 * live in dedicated bounded-context sub-modules:
 *
 * - {@link ./mcp/client.ts}    — MCP client transport (JSON-RPC, options, results)
 * - {@link ./mcp/ep-tools.ts}  — European-Parliament MCP one-shot tool option / result shapes
 * - {@link ./mcp/ep-feeds.ts}  — EP API v2 sliding/fixed-window feed endpoint options
 * - {@link ./mcp/reports.ts}   — Report-type enum + `generateReport` options
 *
 * Consumers SHOULD import from `../types/index.js` instead — this file
 * exists for backwards compatibility only and may be removed in a
 * follow-up refactor once all direct importers are migrated.
 */

export type {
  MCPClientOptions,
  MCPContentItem,
  MCPToolResult,
  JSONRPCRequest,
  JSONRPCResponse,
  PendingRequest,
} from './mcp/client.js';

export type {
  GetMEPsOptions,
  GetPlenarySessionsOptions,
  SearchDocumentsOptions,
  GetParliamentaryQuestionsOptions,
  GetCommitteeInfoOptions,
  MonitorLegislativePipelineOptions,
  AssessMEPInfluenceOptions,
  AnalyzeCoalitionDynamicsOptions,
  DetectVotingAnomaliesOptions,
  ComparePoliticalGroupsOptions,
  AnalyzeLegislativeEffectivenessOptions,
  VotingRecordsOptions,
  VotingPatternsOptions,
  AnalyzeCommitteeActivityOptions,
  TrackMEPAttendanceOptions,
  AnalyzeCountryDelegationOptions,
  GeneratePoliticalLandscapeOptions,
  GetCurrentMEPsOptions,
  GetSpeechesOptions,
  GetProceduresOptions,
  GetAdoptedTextsOptions,
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
  GeneratedStatsCategory,
  GetAllGeneratedStatsOptions,
  GetProcedureEventByIdOptions,
  FreshProcedureItem,
  GetFreshProceduresOptions,
} from './mcp/ep-tools.js';

export type {
  FeedTimeframe,
  FixedWindowFeedOptions,
  FeedBaseOptions,
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
} from './mcp/ep-feeds.js';

export type { ReportType, GenerateReportOptions } from './mcp/reports.js';
