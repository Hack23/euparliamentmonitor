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

// ─── EP Feed item types ──────────────────────────────────────────────────────

/** A single adopted-text item from the EP adopted-texts feed */
export interface AdoptedTextFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string;
  url?: string;
}

/** A single event item from the EP events feed */
export interface EventFeedItem {
  id: string;
  title: string;
  date: string;
  type?: string;
  location?: string;
  url?: string;
}

/** A single procedure item from the EP procedures feed */
export interface ProcedureFeedItem {
  id: string;
  title: string;
  date: string;
  stage?: string;
  type?: string;
  url?: string;
}

/** A single MEP update item from the EP MEPs feed */
export interface MEPFeedItem {
  id: string;
  name: string;
  date: string;
  country?: string;
  group?: string;
  url?: string;
}

/** Aggregated feed data for breaking news articles */
export interface BreakingNewsFeedData {
  adoptedTexts: readonly AdoptedTextFeedItem[];
  events: readonly EventFeedItem[];
  procedures: readonly ProcedureFeedItem[];
  mepUpdates: readonly MEPFeedItem[];
}
