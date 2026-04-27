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
  /**
   * Path to the pending-documents sidecar JSON file used for UPSTREAM_404
   * indexing-lag retry scheduling.  Defaults to `<cwd>/data/pending-documents.json`.
   * Override for test isolation or custom deployment layouts.
   */
  pendingDocumentsStorePath?: string | undefined;
}

/** MCP tool call result content item */
export interface MCPContentItem {
  type: string;
  text: string;
}

/** MCP tool call result */
export interface MCPToolResult {
  content?: MCPContentItem[] | undefined;
  /** Set to `true` by the MCP server when the tool invocation produced an error response */
  isError?: boolean | undefined;
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
  /** Meeting event ID for single meeting lookup */
  eventId?: string | undefined;
  /** Filter by calendar year (recommended for annual counts) */
  year?: number | undefined;
  /** Start date in YYYY-MM-DD format */
  dateFrom?: string | undefined;
  /** End date in YYYY-MM-DD format */
  dateTo?: string | undefined;
  /** Session location (e.g., "Strasbourg", "Brussels") */
  location?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for searchDocuments */
export interface SearchDocumentsOptions {
  /** Document ID for single document lookup (bypasses keyword search) */
  docId?: string | undefined;
  /** Search keyword or phrase */
  keyword?: string | undefined;
  /** Document type: REPORT, RESOLUTION, DECISION, DIRECTIVE, REGULATION, OPINION, AMENDMENT */
  documentType?: string | undefined;
  committee?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getParliamentaryQuestions */
export interface GetParliamentaryQuestionsOptions {
  /** Document ID for single question lookup */
  docId?: string | undefined;
  /** Question type: WRITTEN or ORAL */
  type?: string | undefined;
  /** MEP identifier or name of question author */
  author?: string | undefined;
  /** Question topic or keyword to search */
  topic?: string | undefined;
  /** Question status: PENDING or ANSWERED */
  status?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getCommitteeInfo */
export interface GetCommitteeInfoOptions {
  /** Committee identifier */
  id?: string | undefined;
  /** Committee abbreviation (e.g., "ENVI", "AGRI") */
  abbreviation?: string | undefined;
  /** If true, returns all current active corporate bodies */
  showCurrent?: boolean | undefined;
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
  /** Political group identifiers to analyze (omit for all groups) */
  groupIds?: string[] | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  /** Minimum cohesion threshold for alliance detection (0-1) */
  minimumCohesion?: number | undefined;
}

/** Options for detectVotingAnomalies */
export interface DetectVotingAnomaliesOptions {
  mepId?: string | undefined;
  /** Political group to analyze */
  groupId?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  /** Anomaly sensitivity (0-1, lower = more anomalies detected) */
  sensitivityThreshold?: number | undefined;
}

/** Options for comparePoliticalGroups */
export interface ComparePoliticalGroupsOptions {
  /** Political group identifiers to compare (minimum 2, maximum 10) */
  groupIds: string[];
  /** Comparison dimensions: voting_discipline, activity_level, legislative_output, attendance, cohesion */
  dimensions?: string[] | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
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
  topic?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
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

/** Options for getSpeeches — v1.2.13 removed `year` (EP API ignores it for /speeches) */
export interface GetSpeechesOptions {
  speechId?: string | undefined;
  /** Filter by sitting date start (maps to sitting-date in EP API) */
  dateFrom?: string | undefined;
  /** Filter by sitting date end (maps to sitting-date-end in EP API) */
  dateTo?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

/** Options for getProcedures — v1.2.13 removed `year` (EP API ignores it for /procedures) */
export interface GetProceduresOptions {
  processId?: string | undefined;
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

/** Options for getEvents — v1.2.13 removed `year`, `dateFrom`, `dateTo` (EP API /events has no date filtering) */
export interface GetEventsOptions {
  eventId?: string | undefined;
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

/** Options for getCommitteeDocuments — v1.2.13 removed `year` (EP API ignores it for /committee-documents) */
export interface GetCommitteeDocumentsOptions {
  docId?: string | undefined;
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

/** Options for getExternalDocuments — v1.2.13 removed `year` (EP API ignores it for /external-documents) */
export interface GetExternalDocumentsOptions {
  docId?: string | undefined;
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
  /** MEP identifiers to cross-correlate (1-5 MEPs, required) */
  mepIds: string[];
  /** Political groups for coalition fracture analysis (max 8, omit for all) */
  groups?: string[] | undefined;
  /** Alert sensitivity: HIGH, MEDIUM, or LOW */
  sensitivityLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | undefined;
  /** Run network centrality analysis (increases response time) */
  includeNetworkAnalysis?: boolean | undefined;
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
export type FeedTimeframe = 'today' | 'one-day' | 'one-week' | 'one-month' | 'custom';

/**
 * Options accepted by the fixed-window EP API v2 feed endpoints
 * (`documents`, `plenary_documents`, `committee_documents`,
 * `plenary_session_documents`, `parliamentary_questions`,
 * `corporate_bodies`, `controlled_vocabularies`).
 *
 * These feeds serve a server-defined window. Historically (pre-v1.2.13) they
 * rejected `timeframe`/`startDate` with `INVALID_PARAMS`
 * (Hack23/European-Parliament-MCP-Server#377); as of
 * `european-parliament-mcp-server@1.2.15` (PR #379) the server silently
 * ignores those params on fixed-window tools. The client continues to omit
 * them so intent matches behaviour and so we remain compatible with any
 * older pinned server version in downstream environments.
 */
export interface FixedWindowFeedOptions {
  /** Maximum number of results to return */
  limit?: number | undefined;
  /** Pagination offset */
  offset?: number | undefined;
}

/**
 * Common options shared by the sliding-window EP API v2 feed endpoints
 * (`meps`, `events`, `procedures`, `adopted_texts`, `mep_declarations`,
 * `external_documents`). Accepts `timeframe` and `startDate` in addition to
 * the pagination options inherited from {@link FixedWindowFeedOptions}.
 */
export interface FeedBaseOptions extends FixedWindowFeedOptions {
  /** How far back to look for recently-updated items (default: `'one-day'`) */
  timeframe?: FeedTimeframe | undefined;
  /** Explicit start date (YYYY-MM-DD) — overrides `timeframe` when specified */
  startDate?: string | undefined;
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

/** Options for getDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getPlenaryDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetPlenaryDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getCommitteeDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetCommitteeDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getPlenarySessionDocumentsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetPlenarySessionDocumentsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getExternalDocumentsFeed */
export interface GetExternalDocumentsFeedOptions extends FeedBaseOptions {
  /** Filter by work type */
  workType?: string | undefined;
}

/** Options for getParliamentaryQuestionsFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetParliamentaryQuestionsFeedOptions extends FixedWindowFeedOptions {}

/** Options for getCorporateBodiesFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetCorporateBodiesFeedOptions extends FixedWindowFeedOptions {}

/** Options for getControlledVocabulariesFeed (fixed-window — server ignores `timeframe` as of v1.2.13) */
export interface GetControlledVocabulariesFeedOptions extends FixedWindowFeedOptions {}

/** Options for getProcedureEventById */
export interface GetProcedureEventByIdOptions {
  /** Procedure process ID (required) */
  processId: string;
  /** Event identifier (required) */
  eventId: string;
}

/**
 * A single normalised procedure item returned by {@link EuropeanParliamentMCPClient.getFreshProcedures}.
 * Fields mirror the EP `/procedures` JSON schema; all string fields may be empty when
 * the EP API has not yet populated them (see upstream indexing-lag issue).
 */
export interface FreshProcedureItem {
  /** Procedure identifier (e.g. `"2026-0042"`) */
  id: string;
  /** Human-readable title / reference string (e.g. `"2026/0042(COD)"`) */
  title: string;
  /** Procedure reference code */
  reference: string;
  /** Procedure type (COD, CNS, NLE, …) */
  type: string;
  /** Subject matter / policy area */
  subjectMatter: string;
  /** Current legislative stage */
  stage: string;
  /** Current status */
  status: string;
  /** ISO date the procedure was initiated (`YYYY-MM-DD` or empty) */
  dateInitiated: string;
  /** ISO date of the most recent activity (`YYYY-MM-DD` or empty) */
  dateLastActivity: string;
  /** Code of the responsible committee */
  responsibleCommittee: string;
  /** Rapporteur name */
  rapporteur: string;
  /** Associated document references */
  documents: unknown[];
}

/**
 * Options for {@link EuropeanParliamentMCPClient.getFreshProcedures}.
 *
 * Fresh-procedure discovery routes through `get_procedures(limit, offset=0)` and
 * applies client-side sorting by `dateLastActivity` DESC (falling back to
 * `dateInitiated`) because the EP `/procedures/feed` timeframe filter is
 * currently returning historical-tail pagination (regression since 2026-04-19,
 * reported to open-data-helpdesk@europarl.europa.eu).
 */
export interface GetFreshProceduresOptions {
  /**
   * How many procedures to fetch from the EP API in a single page
   * (passed as `limit` to `get_procedures`). Default: 100.
   */
  limit?: number | undefined;
  /**
   * Look-back window in days for the `dateLastActivity >= today-N` filter.
   * Procedures whose most-recent activity date (or initiation date when
   * `dateLastActivity` is empty) falls before this window are excluded.
   * Default: 30.
   */
  windowDays?: number | undefined;
  /**
   * Maximum number of procedures to return after sorting and filtering.
   * When omitted all procedures that pass the window filter are returned.
   */
  topN?: number | undefined;
  /**
   * Override path for the procedure-seen-cache JSON file. Intended for test
   * isolation only — leave unset in production to use the default
   * `data/procedure-seen-cache.json` path.
   */
  seenCacheStorePath?: string | undefined;
}
