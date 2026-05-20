// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module MCP/ep/tools-data
 * @description Core data retrieval and analysis method mixins for
 * {@link EuropeanParliamentMCPClient}. Augments the class prototype with
 * getMEPs, getPlenarySessions, search/analysis wrappers, and related methods.
 */

import { EuropeanParliamentMCPClient } from './client.js';
import type {
  MCPToolResult,
  GetMEPsOptions,
  GetPlenarySessionsOptions,
  SearchDocumentsOptions,
  GetParliamentaryQuestionsOptions,
  GetCommitteeInfoOptions,
  MonitorLegislativePipelineOptions,
  AnalyzeLegislativeEffectivenessOptions,
  AssessMEPInfluenceOptions,
  AnalyzeCoalitionDynamicsOptions,
  DetectVotingAnomaliesOptions,
  ComparePoliticalGroupsOptions,
  VotingRecordsOptions,
  VotingPatternsOptions,
  GenerateReportOptions,
  AnalyzeCommitteeActivityOptions,
  TrackMEPAttendanceOptions,
  AnalyzeCountryDelegationOptions,
  GeneratePoliticalLandscapeOptions,
  GetCurrentMEPsOptions,
  GetSpeechesOptions,
} from '../../types/index.js';
import { EFFECTIVENESS_FALLBACK, MEPS_FALLBACK, DOCUMENTS_FALLBACK } from './fallbacks.js';

// \u2500\u2500\u2500 Declaration merging \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
declare module './client.js' {
  interface EuropeanParliamentMCPClient {
    getMEPs(options?: GetMEPsOptions): Promise<MCPToolResult>;
    getPlenarySessions(options?: GetPlenarySessionsOptions): Promise<MCPToolResult>;
    searchDocuments(options?: SearchDocumentsOptions): Promise<MCPToolResult>;
    getParliamentaryQuestions(options?: GetParliamentaryQuestionsOptions): Promise<MCPToolResult>;
    getCommitteeInfo(options?: GetCommitteeInfoOptions): Promise<MCPToolResult>;
    monitorLegislativePipeline(options?: MonitorLegislativePipelineOptions): Promise<MCPToolResult>;
    analyzeLegislativeEffectiveness(
      options: AnalyzeLegislativeEffectivenessOptions
    ): Promise<MCPToolResult>;
    assessMEPInfluence(options: AssessMEPInfluenceOptions): Promise<MCPToolResult>;
    analyzeCoalitionDynamics(options?: AnalyzeCoalitionDynamicsOptions): Promise<MCPToolResult>;
    detectVotingAnomalies(options?: DetectVotingAnomaliesOptions): Promise<MCPToolResult>;
    comparePoliticalGroups(options: ComparePoliticalGroupsOptions): Promise<MCPToolResult>;
    getMEPDetails(id: string): Promise<MCPToolResult>;
    getVotingRecords(options?: VotingRecordsOptions): Promise<MCPToolResult>;
    analyzeVotingPatterns(options: VotingPatternsOptions): Promise<MCPToolResult>;
    trackLegislation(procedureId: string): Promise<MCPToolResult>;
    generateReport(options: GenerateReportOptions): Promise<MCPToolResult>;
    analyzeCommitteeActivity(options?: AnalyzeCommitteeActivityOptions): Promise<MCPToolResult>;
    trackMEPAttendance(options?: TrackMEPAttendanceOptions): Promise<MCPToolResult>;
    analyzeCountryDelegation(options: AnalyzeCountryDelegationOptions): Promise<MCPToolResult>;
    generatePoliticalLandscape(options?: GeneratePoliticalLandscapeOptions): Promise<MCPToolResult>;
    getCurrentMEPs(options?: GetCurrentMEPsOptions): Promise<MCPToolResult>;
    getSpeeches(options?: GetSpeechesOptions): Promise<MCPToolResult>;
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
};

/**
 * Cast client to internal type for prototype method access.
 * @param client - The EP MCP client instance
 * @returns Client cast to internal accessor type
 */
function _self(client: EuropeanParliamentMCPClient): ClientInternal {
  return client as unknown as ClientInternal;
}

// \u2500\u2500\u2500 Prototype method implementations \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

EuropeanParliamentMCPClient.prototype.getMEPs = async function (
  this: EuropeanParliamentMCPClient,
  options: GetMEPsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_meps', options, MEPS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getPlenarySessions = async function (
  this: EuropeanParliamentMCPClient,
  options: GetPlenarySessionsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallToolWithReliabilityTimeout(
    'get_plenary_sessions',
    options,
    '{"data": [], "total": 0}'
  );
};

EuropeanParliamentMCPClient.prototype.searchDocuments = async function (
  this: EuropeanParliamentMCPClient,
  options: SearchDocumentsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('search_documents', options, DOCUMENTS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getParliamentaryQuestions = async function (
  this: EuropeanParliamentMCPClient,
  options: GetParliamentaryQuestionsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_parliamentary_questions', options, '{"questions": []}');
};

EuropeanParliamentMCPClient.prototype.getCommitteeInfo = async function (
  this: EuropeanParliamentMCPClient,
  options: GetCommitteeInfoOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_committee_info', options, '{"committees": []}');
};

EuropeanParliamentMCPClient.prototype.monitorLegislativePipeline = async function (
  this: EuropeanParliamentMCPClient,
  options: MonitorLegislativePipelineOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallToolWithReliabilityTimeout(
    'monitor_legislative_pipeline',
    options,
    '{"procedures": []}'
  );
};

EuropeanParliamentMCPClient.prototype.analyzeLegislativeEffectiveness = async function (
  this: EuropeanParliamentMCPClient,
  options: AnalyzeLegislativeEffectivenessOptions
): Promise<MCPToolResult> {
  const { subjectType, subjectId } = options;
  if (subjectId.trim().length === 0) {
    console.warn(
      'analyze_legislative_effectiveness called without valid subjectId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: EFFECTIVENESS_FALLBACK }] };
  }
  const trimmedSubjectId = subjectId.trim();
  return _self(this).safeCallTool(
    'analyze_legislative_effectiveness',
    { ...options, subjectType, subjectId: trimmedSubjectId },
    EFFECTIVENESS_FALLBACK
  );
};

EuropeanParliamentMCPClient.prototype.assessMEPInfluence = async function (
  this: EuropeanParliamentMCPClient,
  options: AssessMEPInfluenceOptions
): Promise<MCPToolResult> {
  const trimmedMepId = options && typeof options.mepId === 'string' ? options.mepId.trim() : '';
  if (trimmedMepId.length === 0) {
    console.warn('assess_mep_influence called without valid mepId (non-empty string required)');
    return { content: [{ type: 'text', text: '{"influence": {}}' }] };
  }
  return _self(this).safeCallTool(
    'assess_mep_influence',
    { ...options, mepId: trimmedMepId },
    '{"influence": {}}'
  );
};

EuropeanParliamentMCPClient.prototype.analyzeCoalitionDynamics = async function (
  this: EuropeanParliamentMCPClient,
  options: AnalyzeCoalitionDynamicsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('analyze_coalition_dynamics', options, '{"coalitions": []}');
};

EuropeanParliamentMCPClient.prototype.detectVotingAnomalies = async function (
  this: EuropeanParliamentMCPClient,
  options: DetectVotingAnomaliesOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('detect_voting_anomalies', options, '{"anomalies": []}');
};

EuropeanParliamentMCPClient.prototype.comparePoliticalGroups = async function (
  this: EuropeanParliamentMCPClient,
  options: ComparePoliticalGroupsOptions
): Promise<MCPToolResult> {
  const groupIds = (Array.isArray(options.groupIds) ? options.groupIds : [])
    .map((g) => (typeof g === 'string' ? g.trim() : ''))
    .filter((g) => g.length > 0);
  if (groupIds.length === 0) {
    console.warn(
      'compare_political_groups called without valid groupIds (non-empty string array required)'
    );
    return { content: [{ type: 'text', text: '{"comparison": {}}' }] };
  }
  return _self(this).safeCallTool(
    'compare_political_groups',
    { ...options, groupIds },
    '{"comparison": {}}'
  );
};

EuropeanParliamentMCPClient.prototype.getMEPDetails = async function (
  this: EuropeanParliamentMCPClient,
  id: string
): Promise<MCPToolResult> {
  if (typeof id !== 'string' || id.trim().length === 0) {
    console.warn('get_mep_details called without valid id (non-empty string required)');
    return { content: [{ type: 'text', text: '{"mep": null}' }] };
  }
  return _self(this).safeCallTool('get_mep_details', { id: id.trim() }, '{"mep": null}');
};

EuropeanParliamentMCPClient.prototype.getVotingRecords = async function (
  this: EuropeanParliamentMCPClient,
  options: VotingRecordsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_voting_records', options, '{"votes": []}');
};

EuropeanParliamentMCPClient.prototype.analyzeVotingPatterns = async function (
  this: EuropeanParliamentMCPClient,
  options: VotingPatternsOptions
): Promise<MCPToolResult> {
  if (typeof options.mepId !== 'string' || options.mepId.trim().length === 0) {
    console.warn(
      'analyze_voting_patterns called without valid mepId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: '{"patterns": null}' }] };
  }
  return _self(this).safeCallTool(
    'analyze_voting_patterns',
    { ...options, mepId: options.mepId.trim() },
    '{"patterns": null}'
  );
};

EuropeanParliamentMCPClient.prototype.trackLegislation = async function (
  this: EuropeanParliamentMCPClient,
  procedureId: string
): Promise<MCPToolResult> {
  if (typeof procedureId !== 'string' || procedureId.trim().length === 0) {
    console.warn(
      'track_legislation called without valid procedureId (non-empty string required)'
    );
    return { content: [{ type: 'text', text: '{"procedure": null}' }] };
  }
  return _self(this).safeCallTool(
    'track_legislation',
    { procedureId: procedureId.trim() },
    '{"procedure": null}'
  );
};

EuropeanParliamentMCPClient.prototype.generateReport = async function (
  this: EuropeanParliamentMCPClient,
  options: GenerateReportOptions
): Promise<MCPToolResult> {
  if (typeof options.reportType !== 'string' || options.reportType.trim().length === 0) {
    console.warn('generate_report called without valid reportType (non-empty string required)');
    return { content: [{ type: 'text', text: '{"report": null}' }] };
  }
  return _self(this).safeCallTool(
    'generate_report',
    { ...options, reportType: options.reportType.trim() },
    '{"report": null}'
  );
};

EuropeanParliamentMCPClient.prototype.analyzeCommitteeActivity = async function (
  this: EuropeanParliamentMCPClient,
  options: AnalyzeCommitteeActivityOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('analyze_committee_activity', options, '{"activity": null}');
};

EuropeanParliamentMCPClient.prototype.trackMEPAttendance = async function (
  this: EuropeanParliamentMCPClient,
  options: TrackMEPAttendanceOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('track_mep_attendance', options, '{"attendance": null}');
};

EuropeanParliamentMCPClient.prototype.analyzeCountryDelegation = async function (
  this: EuropeanParliamentMCPClient,
  options: AnalyzeCountryDelegationOptions
): Promise<MCPToolResult> {
  if (typeof options.country !== 'string' || options.country.trim().length === 0) {
    console.warn(
      'analyze_country_delegation called without valid country (non-empty string required)'
    );
    return { content: [{ type: 'text', text: '{"delegation": null}' }] };
  }
  return _self(this).safeCallTool(
    'analyze_country_delegation',
    { ...options, country: options.country.trim() },
    '{"delegation": null}'
  );
};

EuropeanParliamentMCPClient.prototype.generatePoliticalLandscape = async function (
  this: EuropeanParliamentMCPClient,
  options: GeneratePoliticalLandscapeOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallToolWithReliabilityTimeout(
    'generate_political_landscape',
    options,
    '{"landscape": null}'
  );
};

EuropeanParliamentMCPClient.prototype.getCurrentMEPs = async function (
  this: EuropeanParliamentMCPClient,
  options: GetCurrentMEPsOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_current_meps', options, MEPS_FALLBACK);
};

EuropeanParliamentMCPClient.prototype.getSpeeches = async function (
  this: EuropeanParliamentMCPClient,
  options: GetSpeechesOptions = {}
): Promise<MCPToolResult> {
  return _self(this).safeCallTool('get_speeches', options, '{"speeches": []}');
};
