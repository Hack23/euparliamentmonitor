// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/MCP
 * @description Types for MCP (Model Context Protocol) client — connection options,
 * JSON-RPC transport, tool results, and all EP MCP tool option interfaces.
 */

/** MCP client options */
export interface MCPClientOptions {
  serverPath?: string | undefined;
  maxConnectionAttempts?: number | undefined;
  connectionRetryDelay?: number | undefined;
  /** Maximum retries for callToolWithRetry() (default: 2) */
  maxRetries?: number | undefined;
  /** MCP Gateway URL for HTTP transport (e.g., http://host.docker.internal:80/mcp/european-parliament) */
  gatewayUrl?: string | undefined;
  /** API key for MCP Gateway authentication */
  gatewayApiKey?: string | undefined;
  /** Human-readable server name used in operational log messages (default: 'European Parliament MCP Server') */
  serverLabel?: string | undefined;
}

/** MCP tool call result content item */
export interface MCPContentItem {
  type: string;
  text: string;
}

/** MCP tool call result */
export interface MCPToolResult {
  content?: MCPContentItem[] | undefined;
}

/** JSON-RPC 2.0 request */
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: Record<string, unknown>;
}

/** JSON-RPC 2.0 response */
export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: number | undefined;
  method?: string | undefined;
  result?: unknown | undefined;
  error?: {
    code: number;
    message: string;
    data?: unknown | undefined;
  };
}

/** Pending request handler */
export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

/** Options for getMEPs */
export interface GetMEPsOptions {
  country?: string | undefined;
  group?: string | undefined;
  committee?: string | undefined;
  active?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getPlenarySessions */
export interface GetPlenarySessionsOptions {
  /** Tool schema field name */
  startDate?: string | undefined;
  /** Tool schema field name */
  endDate?: string | undefined;
  /** Alternative field name used by generators */
  dateFrom?: string | undefined;
  /** Alternative field name used by generators */
  dateTo?: string | undefined;
  location?: string | undefined;
  limit?: number | undefined;
}

/** Options for searchDocuments */
export interface SearchDocumentsOptions {
  query?: string | undefined;
  keyword?: string | undefined;
  type?: string | undefined;
  committee?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
}

/** Options for getParliamentaryQuestions */
export interface GetParliamentaryQuestionsOptions {
  type?: string | undefined;
  startDate?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
}

/** Options for getCommitteeInfo */
export interface GetCommitteeInfoOptions {
  committeeId?: string | undefined;
  /** Alternative field name used by callers — maps to `abbreviation` in the MCP tool schema */
  abbreviation?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
}

/** Options for monitorLegislativePipeline */
export interface MonitorLegislativePipelineOptions {
  committeeId?: string | undefined;
  status?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
}

/** Options for assessMEPInfluence */
export interface AssessMEPInfluenceOptions {
  mepId: string;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

/** Options for analyzeCoalitionDynamics */
export interface AnalyzeCoalitionDynamicsOptions {
  politicalGroups?: string[] | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

/** Options for detectVotingAnomalies */
export interface DetectVotingAnomaliesOptions {
  mepId?: string | undefined;
  politicalGroup?: string | undefined;
  dateFrom?: string | undefined;
}

/** Options for comparePoliticalGroups */
export interface ComparePoliticalGroupsOptions {
  groups: string[];
  metrics?: string[] | undefined;
  dateFrom?: string | undefined;
}

/** Options for analyzeLegislativeEffectiveness */
export interface AnalyzeLegislativeEffectivenessOptions {
  subjectId: string;
  subjectType: 'MEP' | 'COMMITTEE';
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

/** Options for getting voting records */
export interface VotingRecordsOptions {
  mepId?: string | undefined;
  sessionId?: string | undefined;
  limit?: number | undefined;
}

/** Options for analyzing voting patterns */
export interface VotingPatternsOptions {
  mepId: string;
  dateFrom?: string | undefined;
  compareWithGroup?: boolean | undefined;
}

/** Allowed report types for analytical reports */
export type ReportType =
  | 'MEP_ACTIVITY'
  | 'COMMITTEE_PERFORMANCE'
  | 'VOTING_STATISTICS'
  | 'LEGISLATION_PROGRESS';

/** Options for generating analytical reports */
export interface GenerateReportOptions {
  reportType: ReportType;
  subjectId?: string | undefined;
  dateFrom?: string | undefined;
}

/** Options for analyzeCommitteeActivity */
export interface AnalyzeCommitteeActivityOptions {
  committeeId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

/** Options for trackMEPAttendance */
export interface TrackMEPAttendanceOptions {
  mepId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

/** Options for analyzeCountryDelegation */
export interface AnalyzeCountryDelegationOptions {
  country: string;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

/** Options for generatePoliticalLandscape */
export interface GeneratePoliticalLandscapeOptions {
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  includeDetails?: boolean | undefined;
}

/** Options for getCurrentMEPs */
export interface GetCurrentMEPsOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getSpeeches */
export interface GetSpeechesOptions {
  speechId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getProcedures */
export interface GetProceduresOptions {
  processId?: string | undefined;
  year?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getAdoptedTexts */
export interface GetAdoptedTextsOptions {
  docId?: string | undefined;
  year?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getEvents */
export interface GetEventsOptions {
  eventId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getMeetingActivities */
export interface GetMeetingActivitiesOptions {
  sittingId: string;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getMeetingDecisions */
export interface GetMeetingDecisionsOptions {
  sittingId: string;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getMEPDeclarations */
export interface GetMEPDeclarationsOptions {
  docId?: string | undefined;
  year?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getIncomingMEPs */
export interface GetIncomingMEPsOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getOutgoingMEPs */
export interface GetOutgoingMEPsOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getHomonymMEPs */
export interface GetHomonymMEPsOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getPlenaryDocuments */
export interface GetPlenaryDocumentsOptions {
  docId?: string | undefined;
  year?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getCommitteeDocuments */
export interface GetCommitteeDocumentsOptions {
  docId?: string | undefined;
  year?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getPlenarySessionDocuments */
export interface GetPlenarySessionDocumentsOptions {
  docId?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getPlenarySessionDocumentItems */
export interface GetPlenarySessionDocumentItemsOptions {
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getControlledVocabularies */
export interface GetControlledVocabulariesOptions {
  vocId?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getExternalDocuments */
export interface GetExternalDocumentsOptions {
  docId?: string | undefined;
  year?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getMeetingForeseenActivities */
export interface GetMeetingForeseenActivitiesOptions {
  sittingId: string;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getProcedureEvents */
export interface GetProcedureEventsOptions {
  processId: string;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getMeetingPlenarySessionDocuments */
export interface GetMeetingPlenarySessionDocumentsOptions {
  sittingId: string;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getMeetingPlenarySessionDocumentItems */
export interface GetMeetingPlenarySessionDocumentItemsOptions {
  sittingId: string;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for networkAnalysis */
export interface NetworkAnalysisOptions {
  mepId?: number | undefined;
  analysisType?: 'committee' | 'voting' | 'combined' | undefined;
  depth?: number | undefined;
}

/** Options for sentimentTracker */
export interface SentimentTrackerOptions {
  groupId?: string | undefined;
  timeframe?: 'last_month' | 'last_quarter' | 'last_year' | undefined;
}

/** Options for earlyWarningSystem */
export interface EarlyWarningSystemOptions {
  sensitivity?: 'low' | 'medium' | 'high' | undefined;
  focusArea?: 'coalitions' | 'attendance' | 'all' | undefined;
}

/** Options for comparativeIntelligence */
export interface ComparativeIntelligenceOptions {
  mepIds: number[];
  dimensions?: ('voting' | 'committee' | 'legislative' | 'attendance')[] | undefined;
}

/** Options for correlateIntelligence */
export interface CorrelateIntelligenceOptions {
  mepId?: number | undefined;
  correlationScenarios?: ('influence_anomaly' | 'coalition_stress' | 'network_activity')[] | undefined;
}

/** Allowed category values for getAllGeneratedStats */
export type GeneratedStatsCategory =
  | 'all'
  | 'plenary_sessions'
  | 'legislative_acts'
  | 'roll_call_votes'
  | 'committee_meetings'
  | 'parliamentary_questions'
  | 'resolutions'
  | 'speeches'
  | 'adopted_texts'
  | 'political_groups'
  | 'procedures'
  | 'events'
  | 'documents'
  | 'mep_turnover'
  | 'declarations';

/** Options for getAllGeneratedStats */
export interface GetAllGeneratedStatsOptions {
  yearFrom?: number | undefined;
  yearTo?: number | undefined;
  category?: GeneratedStatsCategory | undefined;
  includePredictions?: boolean | undefined;
  includeMonthlyBreakdown?: boolean | undefined;
  includeRankings?: boolean | undefined;
}

// ─── EP API v2 Feed Endpoint Options ───────────────────────────────────────────

/**
 * Allowed timeframe values for EP API v2 feed endpoints.
 * Controls how far back the feed looks for recently updated items.
 */
export type FeedTimeframe =
  | 'today'
  | 'one-day'
  | 'one-week'
  | 'one-month'
  | 'three-months'
  | 'one-year';

/** Common options shared by all EP API v2 feed endpoints */
export interface FeedBaseOptions {
  /** How far back to look for recently-updated items (default: `'one-day'`) */
  timeframe?: FeedTimeframe | undefined;
  /** Explicit start date (YYYY-MM-DD) — overrides `timeframe` when specified */
  startDate?: string | undefined;
  /** Maximum number of results to return */
  limit?: number | undefined;
  /** Pagination offset */
  offset?: number | undefined;
}

/** Options for getMEPsFeed */
export interface GetMEPsFeedOptions extends FeedBaseOptions {}

/** Options for getEventsFeed */
export interface GetEventsFeedOptions extends FeedBaseOptions {
  /** Filter by activity type */
  activityType?: string | undefined;
}

/** Options for getProceduresFeed */
export interface GetProceduresFeedOptions extends FeedBaseOptions {
  /** Filter by process type */
  processType?: string | undefined;
}

/** Options for getAdoptedTextsFeed */
export interface GetAdoptedTextsFeedOptions extends FeedBaseOptions {
  /** Filter by work type */
  workType?: string | undefined;
}

/** Options for getMEPDeclarationsFeed */
export interface GetMEPDeclarationsFeedOptions extends FeedBaseOptions {
  /** Filter by work type */
  workType?: string | undefined;
}

/** Options for getDocumentsFeed */
export interface GetDocumentsFeedOptions extends FeedBaseOptions {}

/** Options for getPlenaryDocumentsFeed */
export interface GetPlenaryDocumentsFeedOptions extends FeedBaseOptions {}

/** Options for getCommitteeDocumentsFeed */
export interface GetCommitteeDocumentsFeedOptions extends FeedBaseOptions {}

/** Options for getPlenarySessionDocumentsFeed */
export interface GetPlenarySessionDocumentsFeedOptions extends FeedBaseOptions {}

/** Options for getExternalDocumentsFeed */
export interface GetExternalDocumentsFeedOptions extends FeedBaseOptions {
  /** Filter by work type */
  workType?: string | undefined;
}

/** Options for getParliamentaryQuestionsFeed */
export interface GetParliamentaryQuestionsFeedOptions extends FeedBaseOptions {}

/** Options for getCorporateBodiesFeed */
export interface GetCorporateBodiesFeedOptions extends FeedBaseOptions {}

/** Options for getControlledVocabulariesFeed */
export interface GetControlledVocabulariesFeedOptions extends FeedBaseOptions {}
