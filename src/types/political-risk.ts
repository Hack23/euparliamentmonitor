// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/PoliticalRisk
 * @description Quantitative political risk assessment types adapted from ISMS risk assessment
 * methodologies (Likelihood × Impact framework, Value at Risk, Annual Rate of Occurrence).
 * Applied to European Parliament political intelligence — NOT cybersecurity risk assessment.
 *
 * Inspiration: Hack23 ISMS Risk Assessment Methodology
 * (https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md)
 */

import type { ConfidenceLevel } from './analysis.js';
import type { ArticleCategory } from './common.js';

// ─── Likelihood & Impact (adapted from ISMS Likelihood × Impact framework) ──

/**
 * Political risk likelihood level (adapted from ISMS Likelihood Assessment).
 * Maps to numeric values used in risk score calculation.
 *
 * | Level          | Value | Meaning                                        |
 * |----------------|-------|------------------------------------------------|
 * | rare           | 0.1   | Could occur only in exceptional circumstances  |
 * | unlikely       | 0.3   | Not expected but possible                      |
 * | possible       | 0.5   | Could occur at some time                        |
 * | likely         | 0.7   | Will probably occur in most circumstances      |
 * | almost_certain | 0.9   | Expected to occur in most circumstances        |
 */
export type PoliticalRiskLikelihood =
  | 'rare'
  | 'unlikely'
  | 'possible'
  | 'likely'
  | 'almost_certain';

/**
 * Political risk impact level (adapted from ISMS Impact Assessment).
 * Maps to numeric values used in risk score calculation.
 *
 * | Level      | Value | Parliamentary Meaning                            |
 * |------------|-------|--------------------------------------------------|
 * | negligible | 1     | Minimal effect on parliamentary outcomes         |
 * | minor      | 2     | Limited, localised political consequences        |
 * | moderate   | 3     | Significant but recoverable political impact     |
 * | major      | 4     | Serious consequences for legislative agenda      |
 * | severe     | 5     | Critical threat to democratic process or outcome |
 */
export type PoliticalRiskImpact = 'negligible' | 'minor' | 'moderate' | 'major' | 'severe';

/**
 * Overall risk level derived from the risk score (likelihood × impact).
 *
 * | Level    | Score Range | Description                                 |
 * |----------|-------------|---------------------------------------------|
 * | low      | 0–1.0       | Acceptable; monitor periodically            |
 * | medium   | 1.0–2.0     | Elevated; review and consider mitigation    |
 * | high     | 2.0–3.5     | Significant; mitigate and track closely     |
 * | critical | 3.5–4.5     | Immediate attention required                |
 */
export type PoliticalRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ─── Political Actor & Threat Categories ─────────────────────────────────────

/**
 * Type of political actor in the European Parliament ecosystem.
 * Minimal local definition; compatible with the full PoliticalActorType
 * from the political-classification module (Issue #804) if available.
 */
export type PoliticalActorType =
  | 'political_group'
  | 'mep'
  | 'committee'
  | 'member_state'
  | 'institution'
  | 'civil_society';

/**
 * Category of political threat for risk driver classification.
 * Minimal local definition; compatible with PoliticalThreatCategory
 * from the political-threats module (Issue #805) if available.
 */
export type PoliticalThreatCategory =
  | 'coalition_fracture'
  | 'legislative_delay'
  | 'procedural_obstruction'
  | 'external_pressure'
  | 'internal_dissent'
  | 'public_opposition'
  | 'institutional_conflict';

// ─── Core Risk Score ─────────────────────────────────────────────────────────

/**
 * Quantitative political risk score for a single identified risk.
 * Risk Score = Likelihood × Impact (adapted from ISMS Likelihood × Impact matrix).
 */
export interface PoliticalRiskScore {
  /** Unique risk identifier (e.g. "RISK-001") */
  readonly riskId: string;
  /** Short human-readable description of the risk */
  readonly description: string;
  /** Probability category of the risk occurring */
  readonly likelihood: PoliticalRiskLikelihood;
  /** Numeric likelihood value (0.1–0.9) */
  readonly likelihoodValue: number;
  /** Severity category of the risk if it occurs */
  readonly impact: PoliticalRiskImpact;
  /** Numeric impact value (1–5) */
  readonly impactValue: number;
  /** Composite risk score = likelihoodValue × impactValue */
  readonly riskScore: number;
  /** Risk level band derived from riskScore */
  readonly riskLevel: PoliticalRiskLevel;
  /** Confidence in this assessment */
  readonly confidence: ConfidenceLevel;
  /** Supporting evidence for the risk assessment */
  readonly evidence: readonly string[];
  /** Factors that reduce the risk's likelihood or impact */
  readonly mitigatingFactors: readonly string[];
}

// ─── Political Capital at Risk (adapted from ISMS Value at Risk) ─────────────

/**
 * A driver contributing to political capital risk for a specific actor.
 */
export interface PoliticalRiskDriver {
  /** Description of the risk driver */
  readonly description: string;
  /** Threat category this driver belongs to */
  readonly category: PoliticalThreatCategory;
  /** Percentage contribution to total political capital at risk (0–100) */
  readonly contribution: number;
  /** Whether the risk driver is increasing, stable, or decreasing */
  readonly trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Political Capital at Risk (PCaR) for a key political actor.
 * Adapted from ISMS Value at Risk: quantifies political capital exposure.
 *
 * Political capital = accumulated influence, credibility, and coalition support
 * that an actor can deploy to achieve legislative or procedural goals.
 */
export interface PoliticalCapitalAtRisk {
  /** Name or identifier of the political actor */
  readonly actor: string;
  /** Type of political actor */
  readonly actorType: PoliticalActorType;
  /** Current political capital score (0–100) */
  readonly currentCapital: number;
  /** Maximum potential political capital loss within the time horizon (0–100) */
  readonly capitalAtRisk: number;
  /** Risk drivers contributing to capital exposure */
  readonly riskDrivers: readonly PoliticalRiskDriver[];
  /** Time horizon for the risk assessment */
  readonly timeHorizon: 'week' | 'month' | 'quarter' | 'year';
  /** Statistical confidence interval for the PCaR estimate (e.g. 95 for 95%) */
  readonly confidenceInterval: number;
}

// ─── Legislative Velocity Risk ───────────────────────────────────────────────

/**
 * Legislative stage in the EP procedure lifecycle.
 */
export type LegislativeStage =
  | 'proposal'
  | 'committee'
  | 'plenary_first'
  | 'trilogue'
  | 'plenary_second'
  | 'adopted'
  | 'stalled';

/**
 * Legislative velocity risk indicator for a single procedure.
 * Adapted from ISMS Annual Rate of Occurrence: tracks pace of legislative
 * progress and identifies bottleneck risks.
 */
export interface LegislativeVelocityRisk {
  /** Procedure identifier */
  readonly procedureId: string;
  /** Procedure title */
  readonly title: string;
  /** Current stage in the legislative lifecycle */
  readonly currentStage: LegislativeStage;
  /** Days spent in the current stage */
  readonly daysInCurrentStage: number;
  /** Expected days for this stage (based on historical averages) */
  readonly expectedDaysForStage: number;
  /** Velocity risk score for this procedure */
  readonly velocityRisk: PoliticalRiskScore;
  /** Predicted completion date (ISO date string) or null if uncertain */
  readonly predictedCompletion: string | null;
}

// ─── Quantitative SWOT ───────────────────────────────────────────────────────

/**
 * Trend direction for a SWOT item.
 */
export type SwotItemTrend = 'improving' | 'stable' | 'deteriorating';

/**
 * A SWOT item with a quantitative score and supporting evidence.
 * - Strengths/Weaknesses: scored 1–5 (internal factor magnitude)
 * - Opportunities/Threats: scored as probability × impact
 */
export interface ScoredSWOTItem {
  /** Description of the SWOT factor */
  readonly description: string;
  /** Quantitative score:
   *  - Strengths/Weaknesses: 1 (minor) to 5 (critical)
   *  - Opportunities/Threats: likelihood × impact (0–4.5)
   */
  readonly score: number;
  /** Supporting evidence for the score */
  readonly evidence: readonly string[];
  /** Confidence in the scoring */
  readonly confidence: ConfidenceLevel;
  /** Whether the factor is improving, stable, or deteriorating */
  readonly trend: SwotItemTrend;
}

/**
 * Cross-impact matrix entry: how a strength or weakness interacts with
 * a specific threat, showing whether it mitigates or amplifies it.
 */
export interface CrossImpactEntry {
  /** Index of the strength or weakness in its respective array */
  readonly swotIndex: number;
  /** Type of the SWOT item */
  readonly swotType: 'strength' | 'weakness';
  /** Index of the threat in the threats array */
  readonly threatIndex: number;
  /** Effect on threat probability: negative = mitigation, positive = amplification */
  readonly netEffect: number;
  /** Human-readable description of the interaction */
  readonly rationale: string;
}

/**
 * Quantitative SWOT analysis extending the base SwotAnalysis with
 * numerical scoring, cross-impact matrix, and strategic position score.
 */
export interface QuantitativeSWOT {
  /** Optional title for the analysis */
  readonly title?: string;
  /** Scored internal strengths */
  readonly strengths: readonly ScoredSWOTItem[];
  /** Scored internal weaknesses */
  readonly weaknesses: readonly ScoredSWOTItem[];
  /** Scored external opportunities (probability × impact) */
  readonly opportunities: readonly ScoredSWOTItem[];
  /** Scored external threats (probability × impact) */
  readonly threats: readonly ScoredSWOTItem[];
  /** Cross-impact matrix: how strengths/weaknesses interact with threats */
  readonly crossImpactMatrix: readonly CrossImpactEntry[];
  /**
   * Strategic position score: composite ratio of (S+O) vs (W+T).
   * Range: 0–10. Values above 5 indicate a net-positive strategic position.
   */
  readonly strategicPositionScore: number;
  /** Overall strategic assessment narrative */
  readonly overallAssessment: string;
}

// ─── Agent Risk Assessment Workflow ─────────────────────────────────────────

/**
 * A single step in the structured agent risk assessment workflow.
 * Inspired by the ISMS AI Agent-Driven Risk Assessment methodology.
 */
export type RiskAssessmentStep =
  | { readonly type: 'identify'; readonly risks: readonly PoliticalRiskScore[] }
  | { readonly type: 'analyze'; readonly drivers: readonly PoliticalRiskDriver[] }
  | { readonly type: 'evaluate'; readonly matrix: readonly PoliticalRiskScore[] }
  | { readonly type: 'treat'; readonly mitigations: readonly string[] };

/**
 * Full agent risk assessment workflow trace.
 * Provides a structured, auditable record of the risk assessment process
 * that agentic workflows can follow consistently.
 */
export interface AgentRiskAssessmentWorkflow {
  /** Unique assessment identifier */
  readonly assessmentId: string;
  /** ISO date string of the assessment */
  readonly date: string;
  /** Article category this assessment was produced for */
  readonly articleType: ArticleCategory;
  /** Ordered workflow steps: identify → analyze → evaluate → treat */
  readonly steps: readonly RiskAssessmentStep[];
  /** Composite overall risk profile synthesised from all identified risks */
  readonly overallRiskProfile: PoliticalRiskScore;
  /** Actionable recommendations produced by the risk treatment step */
  readonly recommendations: readonly string[];
}

// ─── Risk Summary ────────────────────────────────────────────────────────────

/**
 * Aggregated risk counts by level for dashboard display.
 */
export interface RiskLevelCounts {
  readonly low: number;
  readonly medium: number;
  readonly high: number;
  readonly critical: number;
}

/**
 * Executive risk summary combining all risk assessment outputs.
 */
export interface PoliticalRiskSummary {
  /** Date of assessment (ISO date string) */
  readonly date: string;
  /** Overall risk level across all identified risks */
  readonly overallRiskLevel: PoliticalRiskLevel;
  /** Confidence in the overall assessment */
  readonly confidence: ConfidenceLevel;
  /** Risk counts by level */
  readonly riskCount: RiskLevelCounts;
  /** Top risks ranked by score (highest first) */
  readonly topRisks: readonly PoliticalRiskScore[];
  /** Political capital at risk for key actors */
  readonly capitalAtRisk: readonly PoliticalCapitalAtRisk[];
  /** Quantitative SWOT with strategic position */
  readonly quantitativeSwot: QuantitativeSWOT;
  /** Legislative velocity risks */
  readonly legislativeVelocityRisks: readonly LegislativeVelocityRisk[];
}
