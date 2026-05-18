// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Visualization/SWOT
 * @description Type definitions for SWOT analysis visualizations and the
 * localized strings consumed by the SWOT builder/renderer.
 */

/**
 * A single item within a SWOT quadrant.
 * Represents one strength, weakness, opportunity, or threat.
 */
export interface SwotItem {
  /** Description of the SWOT item */
  readonly text: string;
  /** Optional severity/importance level */
  readonly severity?: 'low' | 'medium' | 'high' | undefined;
}

/**
 * Complete SWOT analysis data structure.
 * Used by agentic workflows to generate strategic analysis visualizations
 * for any article type using data from European Parliament MCP or other sources.
 *
 * @example
 * ```typescript
 * const swot: SwotAnalysis = {
 *   title: 'Digital Markets Act — Strategic Assessment',
 *   strengths: [{ text: 'Broad political support', severity: 'high' }],
 *   weaknesses: [{ text: 'Complex enforcement mechanisms', severity: 'medium' }],
 *   opportunities: [{ text: 'Global regulatory leadership', severity: 'high' }],
 *   threats: [{ text: 'Industry lobbying resistance', severity: 'medium' }],
 * };
 * ```
 */
export interface SwotAnalysis {
  /** Optional title for the SWOT analysis */
  readonly title?: string | undefined;
  /** Internal strengths — positive factors within EU Parliament control */
  readonly strengths: readonly SwotItem[];
  /** Internal weaknesses — negative factors within EU Parliament control */
  readonly weaknesses: readonly SwotItem[];
  /** External opportunities — positive external factors */
  readonly opportunities: readonly SwotItem[];
  /** External threats — negative external factors */
  readonly threats: readonly SwotItem[];
}

/**
 * Localized strings for SWOT analysis section headings, quadrant labels,
 * and accessible descriptions. Used by SWOT visualization generators
 * (including `buildSwotSection()`) for multi-language article rendering.
 */
export interface SwotStrings {
  /** Section heading (e.g. "SWOT Analysis") */
  readonly sectionHeading: string;
  /** Quadrant labels */
  readonly strengthsLabel: string;
  readonly weaknessesLabel: string;
  readonly opportunitiesLabel: string;
  readonly threatsLabel: string;
  /** Accessible quadrant descriptions */
  readonly strengthsDesc: string;
  readonly weaknessesDesc: string;
  readonly opportunitiesDesc: string;
  readonly threatsDesc: string;
  /** Axis labels */
  readonly internalLabel: string;
  readonly externalLabel: string;
}

/**
 * Localized strings for SWOT builder item text across all 5 analysis types.
 * Template functions accept dynamic counts; plain strings are static prose.
 */
export interface SwotBuilderStrings {
  // ── Voting SWOT ──
  readonly votingHighCohesion: (count: number) => string;
  readonly votingAdopted: (count: number) => string;
  readonly votingActiveVotes: (count: number) => string;
  readonly votingLowCohesion: (count: number) => string;
  readonly votingAnomalies: (count: number) => string;
  readonly votingCrossParty: string;
  readonly votingDiverseGroups: (count: number) => string;
  readonly votingHighSeverity: (count: number) => string;
  readonly votingShiftingAlliances: string;
  // ── Prospective SWOT ──
  readonly prospectiveEvents: (count: number) => string;
  readonly prospectiveCommittees: (count: number) => string;
  readonly prospectiveBottlenecks: (count: number) => string;
  readonly prospectiveHighDensity: (count: number) => string;
  readonly prospectiveDocuments: (count: number) => string;
  readonly prospectiveQuestions: (count: number) => string;
  readonly prospectiveBottleneckRisk: string;
  readonly prospectiveSchedulingRisk: string;
  // ── Breaking SWOT ──
  readonly breakingAdopted: (count: number) => string;
  readonly breakingEvents: (count: number) => string;
  readonly breakingAnomalyWeakness: string;
  readonly breakingNoProcedures: string;
  readonly breakingProceduresActive: (count: number) => string;
  readonly breakingCoalitionOpportunity: string;
  readonly breakingAnomalyThreat: string;
  readonly breakingRapidEvents: string;
  // ── Propositions SWOT ──
  readonly propositionsHealthStrong: (pct: string) => string;
  readonly propositionsThroughputGood: (rate: number) => string;
  readonly propositionsHealthWeak: (pct: string) => string;
  readonly propositionsThroughputLow: (rate: number) => string;
  readonly propositionsPrioritisation: string;
  readonly propositionsTrilogueAcceleration: string;
  readonly propositionsCriticalCongestion: string;
  readonly propositionsOverlapping: string;
  // ── Committee SWOT ──
  readonly committeeActive: (active: number, total: number) => string;
  readonly committeeDocuments: (count: number) => string;
  readonly committeeInactive: (count: number) => string;
  readonly committeeCrossCollaboration: string;
  readonly committeeHearings: string;
  readonly committeeLowActivity: string;
  readonly committeeCompetingPriorities: string;
}
