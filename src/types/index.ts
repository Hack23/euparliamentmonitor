// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types
 * @description Barrel re-export for all EU Parliament Monitor type definitions.
 *
 * Bounded contexts:
 * - **common** — Language codes, article enums, category mappings
 * - **parliament** — Domain entities (events, committees, documents, voting)
 * - **generation** — Article pipeline (options, metadata, stats)
 * - **mcp** — MCP client transport and tool option interfaces
 */

export {
  type LanguageCode,
  type RTLLanguageCode,
  type AnyLanguageCode,
  ArticleCategory,
  ArticlePerspective,
  TimePeriod,
  AnalysisPerspective,
  CATEGORY_PERSPECTIVE,
  CATEGORY_TIME_PERIOD,
  type LanguagePreset,
  type LanguageMap,
  type ArticleCategoryLabels,
  type LangTitleSubtitle,
  type PropositionsStrings,
  type EditorialStrings,
  type MotionsStrings,
  type WeekAheadStrings,
  type BreakingStrings,
} from './common.js';

export type {
  ParliamentEvent,
  CommitteeMeeting,
  LegislativeDocument,
  LegislativeProcedure,
  ParliamentaryQuestion,
  WeekAheadData,
  CommitteeDocument,
  CommitteeData,
  VotingRecord,
  VotingPattern,
  VotingAnomaly,
  MotionsQuestion,
  VotingAnomalyIntelligence,
  CoalitionIntelligence,
  MEPInfluenceScore,
  LegislativeVelocity,
} from './parliament.js';

export type {
  ParsedArticle,
  ArticleSource,
  ArticleOptions,
  SitemapUrl,
  ArticleMetadataEntry,
  NewsMetadataDatabase,
  DateRange,
  GenerationStats,
  GenerationResult,
} from './generation.js';

export {
  type MCPClientOptions,
  type MCPContentItem,
  type MCPToolResult,
  type JSONRPCRequest,
  type JSONRPCResponse,
  type PendingRequest,
  type GetMEPsOptions,
  type GetPlenarySessionsOptions,
  type SearchDocumentsOptions,
  type GetParliamentaryQuestionsOptions,
  type GetCommitteeInfoOptions,
  type MonitorLegislativePipelineOptions,
  type AssessMEPInfluenceOptions,
  type AnalyzeCoalitionDynamicsOptions,
  type DetectVotingAnomaliesOptions,
  type ComparePoliticalGroupsOptions,
  type AnalyzeLegislativeEffectivenessOptions,
  type VotingRecordsOptions,
  type VotingPatternsOptions,
  type ReportType,
  type GenerateReportOptions,
  type AnalyzeCommitteeActivityOptions,
  type TrackMEPAttendanceOptions,
  type AnalyzeCountryDelegationOptions,
  type GeneratePoliticalLandscapeOptions,
  type GetCurrentMEPsOptions,
  type GetSpeechesOptions,
  type GetProceduresOptions,
  type GetAdoptedTextsOptions,
  type GetEventsOptions,
  type GetMeetingActivitiesOptions,
  type GetMeetingDecisionsOptions,
  type GetMEPDeclarationsOptions,
  type GetIncomingMEPsOptions,
  type GetOutgoingMEPsOptions,
  type GetHomonymMEPsOptions,
  type GetPlenaryDocumentsOptions,
  type GetCommitteeDocumentsOptions,
  type GetPlenarySessionDocumentsOptions,
  type GetPlenarySessionDocumentItemsOptions,
  type GetControlledVocabulariesOptions,
  type GetExternalDocumentsOptions,
  type GetMeetingForeseenActivitiesOptions,
  type GetProcedureEventsOptions,
  type GetMeetingPlenarySessionDocumentsOptions,
  type GetMeetingPlenarySessionDocumentItemsOptions,
  type NetworkAnalysisOptions,
  type SentimentTrackerOptions,
  type EarlyWarningSystemOptions,
  type ComparativeIntelligenceOptions,
  type CorrelateIntelligenceOptions,
} from './mcp.js';
