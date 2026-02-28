// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/MCP
 * @description Types for MCP (Model Context Protocol) client — connection options,
 * JSON-RPC transport, tool results, and all EP MCP tool option interfaces.
 */

/** MCP client options */
export interface MCPClientOptions {
  serverPath?: string;
  maxConnectionAttempts?: number;
  connectionRetryDelay?: number;
  /** MCP Gateway URL for HTTP transport (e.g., http://host.docker.internal:80/mcp/european-parliament) */
  gatewayUrl?: string;
  /** API key for MCP Gateway authentication */
  gatewayApiKey?: string;
  /** Human-readable server name used in operational log messages (default: 'European Parliament MCP Server') */
  serverLabel?: string;
}

/** MCP tool call result content item */
export interface MCPContentItem {
  type: string;
  text: string;
}

/** MCP tool call result */
export interface MCPToolResult {
  content?: MCPContentItem[];
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
  id?: number;
  method?: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/** Pending request handler */
export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

/** Options for getMEPs */
export interface GetMEPsOptions {
  country?: string;
  group?: string;
  committee?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

/** Options for getPlenarySessions */
export interface GetPlenarySessionsOptions {
  /** Tool schema field name */
  startDate?: string;
  /** Tool schema field name */
  endDate?: string;
  /** Alternative field name used by generators */
  dateFrom?: string;
  /** Alternative field name used by generators */
  dateTo?: string;
  location?: string;
  limit?: number;
}

/** Options for searchDocuments */
export interface SearchDocumentsOptions {
  query?: string;
  keyword?: string;
  type?: string;
  committee?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

/** Options for getParliamentaryQuestions */
export interface GetParliamentaryQuestionsOptions {
  type?: string;
  startDate?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

/** Options for getCommitteeInfo */
export interface GetCommitteeInfoOptions {
  committeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

/** Options for monitorLegislativePipeline */
export interface MonitorLegislativePipelineOptions {
  committeeId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

/** Options for assessMEPInfluence */
export interface AssessMEPInfluenceOptions {
  mepId: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Options for analyzeCoalitionDynamics */
export interface AnalyzeCoalitionDynamicsOptions {
  politicalGroups?: string[];
  dateFrom?: string;
  dateTo?: string;
}

/** Options for detectVotingAnomalies */
export interface DetectVotingAnomaliesOptions {
  mepId?: string;
  politicalGroup?: string;
  dateFrom?: string;
}

/** Options for comparePoliticalGroups */
export interface ComparePoliticalGroupsOptions {
  groups: string[];
  metrics?: string[];
  dateFrom?: string;
}

/** Options for analyzeLegislativeEffectiveness */
export interface AnalyzeLegislativeEffectivenessOptions {
  subjectId: string;
  subjectType: 'MEP' | 'COMMITTEE';
  dateFrom?: string;
  dateTo?: string;
}

/** Options for getting voting records */
export interface VotingRecordsOptions {
  mepId?: string;
  sessionId?: string;
  limit?: number;
}

/** Options for analyzing voting patterns */
export interface VotingPatternsOptions {
  mepId: string;
  dateFrom?: string;
  compareWithGroup?: boolean;
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
  subjectId?: string;
  dateFrom?: string;
}

/** Options for analyzeCommitteeActivity */
export interface AnalyzeCommitteeActivityOptions {
  committeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Options for trackMEPAttendance */
export interface TrackMEPAttendanceOptions {
  mepId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Options for analyzeCountryDelegation */
export interface AnalyzeCountryDelegationOptions {
  country: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Options for generatePoliticalLandscape */
export interface GeneratePoliticalLandscapeOptions {
  dateFrom?: string;
  dateTo?: string;
  includeDetails?: boolean;
}

/** Options for getCurrentMEPs */
export interface GetCurrentMEPsOptions {
  limit?: number;
  offset?: number;
}

/** Options for getSpeeches */
export interface GetSpeechesOptions {
  speechId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/** Options for getProcedures */
export interface GetProceduresOptions {
  processId?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/** Options for getAdoptedTexts */
export interface GetAdoptedTextsOptions {
  docId?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/** Options for getEvents */
export interface GetEventsOptions {
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/** Options for getMeetingActivities */
export interface GetMeetingActivitiesOptions {
  sittingId: string;
  limit?: number;
  offset?: number;
}

/** Options for getMeetingDecisions */
export interface GetMeetingDecisionsOptions {
  sittingId: string;
  limit?: number;
  offset?: number;
}

/** Options for getMEPDeclarations */
export interface GetMEPDeclarationsOptions {
  docId?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/** Options for getIncomingMEPs */
export interface GetIncomingMEPsOptions {
  limit?: number;
  offset?: number;
}

/** Options for getOutgoingMEPs */
export interface GetOutgoingMEPsOptions {
  limit?: number;
  offset?: number;
}

/** Options for getHomonymMEPs */
export interface GetHomonymMEPsOptions {
  limit?: number;
  offset?: number;
}

/** Options for getPlenaryDocuments */
export interface GetPlenaryDocumentsOptions {
  docId?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/** Options for getCommitteeDocuments */
export interface GetCommitteeDocumentsOptions {
  docId?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/** Options for getPlenarySessionDocuments */
export interface GetPlenarySessionDocumentsOptions {
  docId?: string;
  limit?: number;
  offset?: number;
}

/** Options for getPlenarySessionDocumentItems */
export interface GetPlenarySessionDocumentItemsOptions {
  limit?: number;
  offset?: number;
}

/** Options for getControlledVocabularies */
export interface GetControlledVocabulariesOptions {
  vocId?: string;
  limit?: number;
  offset?: number;
}

/** Options for getExternalDocuments */
export interface GetExternalDocumentsOptions {
  docId?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

/** Options for getMeetingForeseenActivities */
export interface GetMeetingForeseenActivitiesOptions {
  sittingId: string;
  limit?: number;
  offset?: number;
}

/** Options for getProcedureEvents */
export interface GetProcedureEventsOptions {
  processId: string;
  limit?: number;
  offset?: number;
}

/** Options for getMeetingPlenarySessionDocuments */
export interface GetMeetingPlenarySessionDocumentsOptions {
  sittingId: string;
  limit?: number;
  offset?: number;
}

/** Options for getMeetingPlenarySessionDocumentItems */
export interface GetMeetingPlenarySessionDocumentItemsOptions {
  sittingId: string;
  limit?: number;
  offset?: number;
}

/** Options for networkAnalysis */
export interface NetworkAnalysisOptions {
  mepId?: number;
  analysisType?: 'committee' | 'voting' | 'combined';
  depth?: number;
}

/** Options for sentimentTracker */
export interface SentimentTrackerOptions {
  groupId?: string;
  timeframe?: 'last_month' | 'last_quarter' | 'last_year';
}

/** Options for earlyWarningSystem */
export interface EarlyWarningSystemOptions {
  sensitivity?: 'low' | 'medium' | 'high';
  focusArea?: 'coalitions' | 'attendance' | 'all';
}

/** Options for comparativeIntelligence */
export interface ComparativeIntelligenceOptions {
  mepIds: number[];
  dimensions?: ('voting' | 'committee' | 'legislative' | 'attendance')[];
}

/** Options for correlateIntelligence */
export interface CorrelateIntelligenceOptions {
  mepId?: number;
  correlationScenarios?: ('influence_anomaly' | 'coalition_stress' | 'network_activity')[];
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
  yearFrom?: number;
  yearTo?: number;
  category?: GeneratedStatsCategory;
  includePredictions?: boolean;
  includeMonthlyBreakdown?: boolean;
  includeRankings?: boolean;
}
