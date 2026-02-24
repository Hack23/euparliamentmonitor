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
