// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Significance
 * @description Type definitions for the significance scoring engine and
 * synthesis summary generator.
 *
 * The significance scoring engine produces a 5-dimension composite score
 * (0–10) used for publication prioritisation decisions.  Dimensions and
 * weights follow the analysis template specification:
 *
 * | Dimension                  | Weight |
 * |----------------------------|--------|
 * | Parliamentary Significance | 0.25   |
 * | Policy Impact              | 0.25   |
 * | Public Interest            | 0.20   |
 * | Temporal Urgency           | 0.15   |
 * | Institutional Relevance    | 0.15   |
 *
 * The synthesis summary generator aggregates per-file analysis outputs
 * into a single editorial briefing consumed by article generators.
 */

import type { ConfidenceLevel } from './analysis.js';

// ─── Significance Scoring ─────────────────────────────────────────────────────

/** Publication decision produced by the scoring engine */
export type PublicationDecision = 'publish' | 'hold' | 'skip';

/** Names of the five scoring dimensions */
export type SignificanceDimension =
  | 'parliamentarySignificance'
  | 'policyImpact'
  | 'publicInterest'
  | 'temporalUrgency'
  | 'institutionalRelevance';

/**
 * Result of scoring a single EP event / document across five dimensions.
 *
 * Each dimension is scored 0–10.  The `composite` value is the weighted
 * average.  The `decision` is derived from composite thresholds:
 *
 * | Score      | Decision  |
 * |------------|-----------|
 * | 0.0 – 3.9  | skip      |
 * | 4.0 – 5.9  | hold      |
 * | ≥ 6.0      | publish   |
 */
export interface SignificanceScore {
  /** Parliamentary significance dimension (0–10) */
  readonly parliamentarySignificance: number;
  /** Policy impact dimension (0–10) */
  readonly policyImpact: number;
  /** Public interest dimension (0–10) */
  readonly publicInterest: number;
  /** Temporal urgency dimension (0–10) */
  readonly temporalUrgency: number;
  /** Institutional / cross-group relevance dimension (0–10) */
  readonly institutionalRelevance: number;
  /** Weighted composite score (0–10) */
  readonly composite: number;
  /** Publication decision derived from composite thresholds */
  readonly decision: PublicationDecision;
}

/** Input for a single event to be scored */
export interface SignificanceScoringInput {
  /** Human-readable event title */
  readonly title: string;
  /** EP reference identifier (procedure ID, adopted text ref, etc.) */
  readonly reference?: string;
  /** Raw dimension scores provided by the caller (each 0–10) */
  readonly parliamentarySignificance: number;
  readonly policyImpact: number;
  readonly publicInterest: number;
  readonly temporalUrgency: number;
  readonly institutionalRelevance: number;
}

/** Batch scoring result for multiple events */
export interface SignificanceBatchResult {
  /** Individual event scores, ranked by composite descending */
  readonly scores: readonly SignificanceScore[];
  /** Count of events per decision category */
  readonly summary: {
    readonly publish: number;
    readonly hold: number;
    readonly skip: number;
  };
}

// ─── Synthesis Summary ────────────────────────────────────────────────────────

/** A single finding extracted from a per-file analysis */
export interface SynthesisFinding {
  /** Source analysis method that produced this finding */
  readonly method: string;
  /** Source filename */
  readonly file: string;
  /** Confidence level from the analysis frontmatter */
  readonly confidence: ConfidenceLevel;
  /** One-line summary of the finding */
  readonly summary: string;
}

/** Aggregated SWOT counts across all per-file analyses */
export interface AggregatedSWOT {
  /** Number of strength entries found across all files */
  readonly strengths: number;
  /** Number of weakness entries found across all files */
  readonly weaknesses: number;
  /** Number of opportunity entries found across all files */
  readonly opportunities: number;
  /** Number of threat entries found across all files */
  readonly threats: number;
}

/** Risk level distribution across all per-file analyses */
export interface RiskOverview {
  /** Number of critical-level risk items */
  readonly critical: number;
  /** Number of high-level risk items */
  readonly high: number;
  /** Number of medium-level risk items */
  readonly medium: number;
  /** Number of low-level risk items */
  readonly low: number;
}

/** Complete synthesis summary aggregating all per-file analyses */
export interface SynthesisSummary {
  /** Unique synthesis identifier (SYN-YYYY-MM-DD-NNN) */
  readonly synthesisId: string;
  /** ISO date of the analysis */
  readonly date: string;
  /** Number of analysis files processed */
  readonly documentsAnalyzed: number;
  /** Aggregated confidence across all sources */
  readonly overallConfidence: ConfidenceLevel;
  /** Top findings ranked by significance */
  readonly topFindings: readonly SynthesisFinding[];
  /** Aggregated SWOT summary */
  readonly swot: AggregatedSWOT;
  /** Risk level distribution */
  readonly riskOverview: RiskOverview;
  /** Editorial recommendations */
  readonly editorialRecommendations: readonly string[];
}
