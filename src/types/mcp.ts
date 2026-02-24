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
