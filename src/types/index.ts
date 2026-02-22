// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types
 * @description Shared TypeScript type definitions for EU Parliament Monitor
 */

/** Supported language codes */
export type LanguageCode =
  | 'en'
  | 'de'
  | 'fr'
  | 'es'
  | 'it'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'sv'
  | 'da'
  | 'fi'
  | 'el'
  | 'hu';

/** RTL language codes */
export type RTLLanguageCode = 'ar' | 'he';

/** All possible language codes (including RTL) */
export type AnyLanguageCode = LanguageCode | RTLLanguageCode;

/** Article type identifiers */
export type ArticleType = 'prospective' | 'retrospective' | 'breaking';

/** Valid article generation types */
export type ArticleGenerationType =
  | 'week-ahead'
  | 'committee-reports'
  | 'propositions'
  | 'motions'
  | 'breaking';

/** Language preset names */
export type LanguagePreset = 'all' | 'eu-core' | 'nordic';

/** Map from language code to translated string */
export type LanguageMap<T = string> = Record<LanguageCode, T>;

/** Parsed article metadata from filename */
export interface ParsedArticle {
  date: string;
  slug: string;
  lang: string;
  filename: string;
}

/** Article source reference */
export interface ArticleSource {
  title: string;
  url: string;
}

/** Options for generating article HTML */
export interface ArticleOptions {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  type: ArticleType | string;
  readTime: number;
  lang: string;
  content: string;
  keywords?: string[];
  sources?: ArticleSource[];
}

/** Sitemap URL entry */
export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/** News article metadata entry */
export interface ArticleMetadataEntry {
  filename: string;
  date: string;
  slug: string;
  lang: string;
  title: string;
  type?: string;
}

/** News metadata database */
export interface NewsMetadataDatabase {
  lastUpdated: string;
  articles: ArticleMetadataEntry[];
}

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

/** Event data from MCP or fallback */
export interface ParliamentEvent {
  date: string;
  title: string;
  type: string;
  description: string;
}

/** Committee meeting data from MCP */
export interface CommitteeMeeting {
  id?: string;
  committee: string;
  committeeName?: string;
  date: string;
  time?: string;
  location?: string;
  agenda?: Array<{ item?: number; title: string; type?: string }>;
}

/** Legislative document from MCP */
export interface LegislativeDocument {
  id?: string;
  type?: string;
  title: string;
  date?: string;
  status?: string;
  committee?: string;
  rapporteur?: string;
}

/** Legislative pipeline procedure */
export interface LegislativeProcedure {
  id?: string;
  title: string;
  stage?: string;
  committee?: string;
  status?: string;
  bottleneck?: boolean;
}

/** Parliamentary question */
export interface ParliamentaryQuestion {
  id?: string;
  type?: string;
  author?: string;
  subject: string;
  date?: string;
  status?: string;
}

/** Aggregated week-ahead data from multiple MCP sources */
export interface WeekAheadData {
  events: ParliamentEvent[];
  committees: CommitteeMeeting[];
  documents: LegislativeDocument[];
  pipeline: LegislativeProcedure[];
  questions: ParliamentaryQuestion[];
}

/** Date range for article generation */
export interface DateRange {
  start: string;
  end: string;
}

/** Generation statistics */
export interface GenerationStats {
  generated: number;
  errors: number;
  articles: string[];
  timestamp: string;
}

/** Generation result */
export interface GenerationResult {
  success: boolean;
  files?: number;
  slug?: string;
  error?: string;
}

/** Article type labels for a single language */
export interface ArticleTypeLabels {
  prospective: string;
  retrospective: string;
  breaking: string;
  propositions: string;
}

/** Language-specific title and subtitle */
export interface LangTitleSubtitle {
  title: string;
  subtitle: string;
}

/** Committee document with type, title and date */
export interface CommitteeDocument {
  title: string;
  type: string;
  date: string;
}

/** Committee report data aggregated from MCP sources */
export interface CommitteeData {
  name: string;
  abbreviation: string;
  chair: string;
  members: number;
  documents: CommitteeDocument[];
  effectiveness: string | null;
}
/** Localized strings for propositions articles */
export interface PropositionsStrings {
  lede: string;
  proposalsHeading: string;
  pipelineHeading: string;
  procedureHeading: string;
  analysisHeading: string;
  analysis: string;
  pipelineHealthLabel: string;
  throughputRateLabel: string;
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

/** Voting record from MCP or fallback */
export interface VotingRecord {
  title: string;
  date: string;
  result: string;
  votes: { for: number; against: number; abstain: number };
}

/** Voting pattern (party cohesion) from MCP or fallback */
export interface VotingPattern {
  group: string;
  cohesion: number;
  participation: number;
}

/** Voting anomaly from MCP or fallback */
export interface VotingAnomaly {
  type: string;
  description: string;
  severity: string;
}

/** Parliamentary question for motions article (simplified MCP/fallback shape) */
export interface MotionsQuestion {
  author: string;
  topic: string;
  date: string;
  status: string;
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
