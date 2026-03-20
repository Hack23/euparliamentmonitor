// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Parliament
 * @description Domain types for European Parliament entities — events, committees,
 * documents, procedures, questions, and voting data.
 */

/** Event data from MCP or fallback */
export interface ParliamentEvent {
  date: string;
  title: string;
  type: string;
  description: string;
}

/** Committee meeting data from MCP */
export interface CommitteeMeeting {
  id?: string | undefined;
  committee: string;
  committeeName?: string | undefined;
  date: string;
  time?: string | undefined;
  location?: string | undefined;
  agenda?:
    | Array<{ item?: number | undefined; title: string; type?: string | undefined }>
    | undefined;
}

/** Legislative document from MCP */
export interface LegislativeDocument {
  id?: string | undefined;
  type?: string | undefined;
  title: string;
  date?: string | undefined;
  status?: string | undefined;
  committee?: string | undefined;
  rapporteur?: string | undefined;
}

/** Legislative pipeline procedure */
export interface LegislativeProcedure {
  id?: string | undefined;
  title: string;
  stage?: string | undefined;
  committee?: string | undefined;
  status?: string | undefined;
  bottleneck?: boolean | undefined;
}

/** Parliamentary question */
export interface ParliamentaryQuestion {
  id?: string | undefined;
  type?: string | undefined;
  author?: string | undefined;
  subject: string;
  date?: string | undefined;
  status?: string | undefined;
}

/** Aggregated week-ahead data from multiple MCP sources */
export interface WeekAheadData {
  events: ParliamentEvent[];
  committees: CommitteeMeeting[];
  documents: LegislativeDocument[];
  pipeline: LegislativeProcedure[];
  questions: ParliamentaryQuestion[];
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

/** Intelligence analysis for a detected voting anomaly */
export interface VotingAnomalyIntelligence {
  anomalyId: string;
  significance: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedGroups: string[];
  deviationPercentage: number;
  historicalContext: string;
  implication: string;
}

/** Coalition cohesion and alignment intelligence */
export interface CoalitionIntelligence {
  coalitionId: string;
  groups: string[];
  cohesionScore: number;
  alignmentTrend: 'strengthening' | 'weakening' | 'stable';
  keyVotes: number;
  riskLevel: 'high' | 'medium' | 'low';
}

/** MEP influence score across multiple parliamentary dimensions */
export interface MEPInfluenceScore {
  mepId: string;
  mepName: string;
  overallScore: number;
  votingActivity: number;
  legislativeOutput: number;
  committeeEngagement: number;
  rank: string;
}

/** Legislative velocity for procedure pipeline monitoring */
export interface LegislativeVelocity {
  procedureId: string;
  title: string;
  stage: string;
  daysInCurrentStage: number;
  velocityScore: number;
  bottleneckRisk: 'high' | 'medium' | 'low';
  predictedCompletion: string;
}

// ─── Advanced political intelligence types ────────────────────────────────────

/** Voting intensity metrics for a set of voting records */
export interface VotingIntensity {
  /** Consensus level: 0 = perfect split, 1 = unanimity */
  unanimity: number;
  /** Polarization: 0 = consensus, 1 = highly polarized */
  polarization: number;
  /** Average margin of victory across votes */
  averageMargin: number;
  /** Number of close votes (margin < 10%) */
  closeVoteCount: number;
  /** Number of decisive votes (margin > 60%) */
  decisiveVoteCount: number;
}

/** Coalition shift detection result */
export interface CoalitionShift {
  /** Name of the political group */
  group: string;
  /** Previous cohesion (or baseline) */
  previousCohesion: number;
  /** Current cohesion */
  currentCohesion: number;
  /** Signed change in cohesion (currentCohesion - previousCohesion) */
  cohesionDelta: number;
  /** Direction of the shift */
  direction: 'strengthening' | 'weakening' | 'stable';
  /** Severity of the shift for political intelligence */
  significance: 'critical' | 'high' | 'medium' | 'low';
}

/** Polarization index for a parliamentary period */
export interface PolarizationIndex {
  /** Overall index 0-1 (0 = consensus, 1 = completely polarized) */
  overallIndex: number;
  /** Effective number of voting blocs (Laakso-Taagepera style) */
  effectiveBlocs: number;
  /** Groups above 80% cohesion — potential blocking minorities */
  highCohesionGroups: string[];
  /** Groups below 50% cohesion — internally divided */
  fragmentedGroups: string[];
  /** Assessment label */
  assessment: 'consensus' | 'moderate' | 'polarized' | 'highly-polarized';
}

// ─── EP Feed item types ──────────────────────────────────────────────────────

/** A single item from any EP API v2 feed response (`data[]` array) */
export interface EPFeedItem {
  /** Full ELI identifier (e.g. `"eli/dl/doc/TA-10-2025-0281"`) */
  id: string;
  /** RDF type (usually `"Work"`) */
  type?: string | undefined;
  /** EP document type URI (e.g. `"def/ep-document-types/TEXT_ADOPTED"`) */
  work_type?: string | undefined;
  /** Short document identifier (e.g. `"TA-10-2025-0281"`) */
  identifier?: string | undefined;
  /** Human-readable label (e.g. `"T10-0281/2025"`) */
  label?: string | undefined;
  /** Title, when available */
  title?: string | undefined;
  /** Date string (ISO 8601 or free-form) */
  date?: string | undefined;
  /** URL link to the source document */
  url?: string | undefined;
}

/** A single adopted-text item from the EP adopted-texts feed */
export interface AdoptedTextFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string | undefined;
  url?: string | undefined;
  /** Short identifier (e.g. `"TA-10-2025-0281"`) */
  identifier?: string | undefined;
  /** Human-readable label (e.g. `"T10-0281/2025"`) */
  label?: string | undefined;
}

/** A single event item from the EP events feed */
export interface EventFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string | undefined;
  location?: string | undefined;
  url?: string | undefined;
  identifier?: string | undefined;
  label?: string | undefined;
}

/** A single procedure item from the EP procedures feed */
export interface ProcedureFeedItem {
  id: string;
  title: string;
  date: string;
  stage?: string | undefined;
  type?: string | undefined;
  url?: string | undefined;
  identifier?: string | undefined;
  label?: string | undefined;
}

/** A single MEP update item from the EP MEPs feed */
export interface MEPFeedItem {
  id: string;
  name: string;
  date: string;
  country?: string | undefined;
  group?: string | undefined;
  url?: string | undefined;
  identifier?: string | undefined;
  label?: string | undefined;
}

/** A single document item from EP document feeds */
export interface DocumentFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string | undefined;
  url?: string | undefined;
  identifier?: string | undefined;
  label?: string | undefined;
}

/** A single parliamentary question item from the EP questions feed */
export interface QuestionFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string | undefined;
  url?: string | undefined;
  identifier?: string | undefined;
  label?: string | undefined;
}

/** A single MEP declaration item from the EP declarations feed */
export interface DeclarationFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string | undefined;
  url?: string | undefined;
  identifier?: string | undefined;
  label?: string | undefined;
}

/** A single corporate body item from the EP corporate bodies feed */
export interface CorporateBodyFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string | undefined;
  url?: string | undefined;
  identifier?: string | undefined;
  label?: string | undefined;
}

/** Aggregated feed data for breaking news articles (legacy compat) */
export interface BreakingNewsFeedData {
  adoptedTexts: readonly AdoptedTextFeedItem[];
  events: readonly EventFeedItem[];
  procedures: readonly ProcedureFeedItem[];
  mepUpdates: readonly MEPFeedItem[];
  /** Total number of MEP updates reported by the feed API (may exceed the fetched/displayed count) */
  totalMEPUpdates?: number | undefined;
}

/**
 * Comprehensive feed data aggregation from all EP API v2 feed endpoints.
 * Used by all article strategies as the primary data source for current/recent events.
 */
export interface EPFeedData {
  /** Recently adopted texts (resolutions, directives, regulations) */
  adoptedTexts: readonly AdoptedTextFeedItem[];
  /** Recent parliamentary events, hearings, conferences */
  events: readonly EventFeedItem[];
  /** Recently updated legislative procedures */
  procedures: readonly ProcedureFeedItem[];
  /** Recent MEP updates (new members, departures, changes) */
  mepUpdates: readonly MEPFeedItem[];
  /** Recently published or updated documents */
  documents: readonly DocumentFeedItem[];
  /** Recently published plenary documents */
  plenaryDocuments: readonly DocumentFeedItem[];
  /** Recently published committee documents */
  committeeDocuments: readonly DocumentFeedItem[];
  /** Recently published plenary session documents */
  plenarySessionDocuments: readonly DocumentFeedItem[];
  /** Recently published external documents */
  externalDocuments: readonly DocumentFeedItem[];
  /** Recently tabled parliamentary questions */
  questions: readonly QuestionFeedItem[];
  /** Recently updated MEP declarations */
  declarations: readonly DeclarationFeedItem[];
  /** Recently updated corporate bodies */
  corporateBodies: readonly CorporateBodyFeedItem[];
}
