// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/PoliticalClassification
 * @description Political Intelligence Classification Framework types and interfaces.
 *
 * Inspired by ISMS classification methodologies (Hack23 ISMS-PUBLIC/CLASSIFICATION.md)
 * but adapted specifically for political intelligence analysis of European Parliament data.
 *
 * Key design principles:
 * - **Political Significance** mirrors ISMS confidentiality/integrity/availability levels
 * - **Impact Matrix** mirrors ISMS Business Impact Analysis dimensions
 * - **Actor Taxonomy** mirrors ISMS Threat Agent classification
 * - **Political Forces** adapts Porter's Five Forces for parliamentary dynamics
 *
 * All data originates from public European Parliament open data. No personal data
 * beyond publicly available MEP records is processed or stored.
 */

import type { ArticleCategory } from './common.js';

// ─── Significance ─────────────────────────────────────────────────────────────

/**
 * Political significance level for a parliamentary event or analysis.
 *
 * Levels are ordered from lowest to highest impact:
 * - `routine`     — Standard procedural activity with no notable deviation
 * - `notable`     — Noteworthy activity meriting monitoring but not urgent action
 * - `significant` — Materially important event affecting multiple stakeholders
 * - `critical`    — High-urgency event with broad institutional or societal consequences
 * - `historic`    — Unprecedented event with lasting, structural political consequences
 *
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md} Inspired by ISMS Classification
 */
export type PoliticalSignificance = 'routine' | 'notable' | 'significant' | 'critical' | 'historic';

// ─── Impact Levels ────────────────────────────────────────────────────────────

/**
 * Ordinal impact level used across all impact dimensions.
 *
 * Maps to ISMS Business Impact Analysis severity scale adapted for political context:
 * - `none`     — No discernible impact on this dimension
 * - `low`      — Minor, localised or short-lived effect
 * - `moderate` — Measurable effect requiring monitoring
 * - `high`     — Significant effect requiring active response
 * - `critical` — Severe, potentially irreversible effect
 */
export type ImpactLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

// ─── Impact Assessment ────────────────────────────────────────────────────────

/**
 * Multi-dimensional impact assessment for a parliamentary event.
 *
 * Inspired by ISMS Business Impact Analysis Matrix (financial / operational /
 * reputational / regulatory dimensions) adapted for political intelligence:
 * legislative, coalition, public opinion, institutional, and economic dimensions.
 */
export interface PoliticalImpactAssessment {
  /** Effect on the legislative process — votes, amendments, procedure stage */
  readonly legislativeImpact: ImpactLevel;
  /** Effect on political alliances and coalition stability */
  readonly coalitionImpact: ImpactLevel;
  /** Effect on citizen and media perception of EU institutions */
  readonly publicOpinionImpact: ImpactLevel;
  /** Effect on EU institutional powers, procedures, and legitimacy */
  readonly institutionalImpact: ImpactLevel;
  /** Economic policy implications — market regulation, fiscal policy, trade */
  readonly economicImpact: ImpactLevel;
  /** Aggregate significance derived from the five impact dimensions */
  readonly overallSignificance: PoliticalSignificance;
}

// ─── Confidence ───────────────────────────────────────────────────────────────

/**
 * Confidence level for a classification or assessment finding.
 * Used throughout the framework to communicate analytical certainty.
 */
export type ClassificationConfidence = 'high' | 'medium' | 'low';

// ─── Actor Classification ─────────────────────────────────────────────────────

/**
 * Taxonomy of political actor types in the EU Parliament ecosystem.
 *
 * Inspired by ISMS Threat Agent classification adapted for parliamentary
 * stakeholder mapping: identifies who drives or is affected by political events.
 */
export type PoliticalActorType =
  | 'eu_institution'
  | 'political_group'
  | 'national_delegation'
  | 'individual_mep'
  | 'civil_society'
  | 'media'
  | 'industry'
  | 'member_state';

/**
 * Classified political actor with type, role, and influence metadata.
 */
export interface PoliticalActorClassification {
  /** Name or identifier of the actor (e.g. "EPP", "MEP-124810", "Germany") */
  readonly name: string;
  /** Structural category of the actor */
  readonly actorType: PoliticalActorType;
  /** Brief description of the actor's role or interest in this context */
  readonly role: string;
  /** How actively the actor is driving or shaping the political event */
  readonly influence: ImpactLevel;
  /** Whether the actor supports or opposes the primary political action */
  readonly position: 'supportive' | 'opposed' | 'neutral' | 'ambiguous';
}

// ─── Political Forces ─────────────────────────────────────────────────────────

/**
 * Assessment of a single political force.
 *
 * Provides a structured evaluation of a force's strength and trajectory,
 * enabling quadrant-chart visualisation of the overall political landscape.
 */
export interface ForceAssessment {
  /** Qualitative description of the force and its current state */
  readonly description: string;
  /** Current strength of this force on a 0–1 scale */
  readonly strength: number;
  /** Whether the force is growing, diminishing, or stable */
  readonly trend: 'increasing' | 'decreasing' | 'stable';
  /** Key actors driving this force */
  readonly keyActors: readonly string[];
  /** Confidence in this assessment */
  readonly confidence: ClassificationConfidence;
}

/**
 * Political Forces Analysis for a parliamentary event.
 *
 * Adapted from Porter's Five Forces (as referenced in the ISMS Classification
 * framework) to map the power dynamics of European Parliament proceedings:
 *
 * | Porter's Force          | Political Equivalent         |
 * |-------------------------|------------------------------|
 * | Supplier power          | Coalition Power              |
 * | Buyer power             | Opposition Power             |
 * | Barriers to entry       | Institutional Barriers       |
 * | Threat of substitutes   | Public Pressure              |
 * | Competitive rivalry     | External Influences          |
 */
export interface PoliticalForcesAnalysis {
  /** Governing coalition strength — ability to pass or block legislation */
  readonly coalitionPower: ForceAssessment;
  /** Opposition effectiveness — capacity to challenge or delay proceedings */
  readonly oppositionPower: ForceAssessment;
  /** Procedural and institutional constraints on political action */
  readonly institutionalBarriers: ForceAssessment;
  /** Civil society and media pressure on political actors */
  readonly publicPressure: ForceAssessment;
  /** External geopolitical factors influencing internal EU dynamics */
  readonly externalInfluences: ForceAssessment;
}

// ─── Analysis Manifest ────────────────────────────────────────────────────────

/**
 * Supported analytical methods that can be applied during classification.
 */
export type ClassificationMethod =
  | 'impact-matrix'
  | 'actor-mapping'
  | 'forces-analysis'
  | 'significance-assessment';

/**
 * Metadata record written to `analysis/{date}/manifest.json`.
 * Describes a single analysis run: when it ran, which article types were
 * analysed, and which analytical methods were applied.
 */
export interface AnalysisRunManifest {
  /** ISO 8601 timestamp of when this analysis run started */
  readonly runDate: string;
  /** Semantic version of the classification framework used */
  readonly frameworkVersion: string;
  /** Article types included in this run */
  readonly articleTypes: readonly ArticleCategory[];
  /** Analytical methods applied during this run */
  readonly methodsUsed: readonly ClassificationMethod[];
  /** ISO 8601 timestamp of when this analysis run completed */
  readonly completedAt: string;
}

// ─── YAML Frontmatter ─────────────────────────────────────────────────────────

/**
 * YAML frontmatter block written at the top of every analysis markdown file.
 * Provides machine-readable metadata for downstream consumers.
 */
export interface AnalysisFrontmatter {
  /** Human-readable title of this analysis document */
  readonly title: string;
  /** ISO date of the analysis (YYYY-MM-DD) */
  readonly date: string;
  /** Classification method that produced this document */
  readonly analysisType: ClassificationMethod;
  /** Overall political significance of the subject */
  readonly significance: PoliticalSignificance;
  /** Confidence in the overall assessment */
  readonly confidence: ClassificationConfidence;
  /** Methods applied to produce this document */
  readonly methods: readonly ClassificationMethod[];
  /** Article types covered by this assessment */
  readonly articleTypes: readonly ArticleCategory[];
}

// ─── Convenience re-exports ───────────────────────────────────────────────────

/**
 * Ordered array of all significance levels from lowest to highest.
 * Useful for comparison and range-check operations.
 */
export const SIGNIFICANCE_ORDER: readonly PoliticalSignificance[] = [
  'routine',
  'notable',
  'significant',
  'critical',
  'historic',
] as const;

/**
 * Ordered array of all impact levels from lowest to highest.
 * Useful for comparison and range-check operations.
 */
export const IMPACT_ORDER: readonly ImpactLevel[] = [
  'none',
  'low',
  'moderate',
  'high',
  'critical',
] as const;

// ─── Classification input ─────────────────────────────────────────────────────

/**
 * Generic input data structure for classification functions.
 *
 * Accepts data from any article type. All fields are optional so that
 * partial or missing MCP data is safely handled by every classifier.
 *
 * This type will be consumed by the Analysis-First Pipeline Stage (Issue 4).
 */
export interface ClassificationInput {
  /** Voting records from MCP or fallback */
  readonly votingRecords?: readonly {
    readonly title?: string | undefined;
    readonly date?: string | undefined;
    readonly result?: string | undefined;
    readonly votes?:
      | {
          readonly for?: number | undefined;
          readonly against?: number | undefined;
          readonly abstain?: number | undefined;
        }
      | undefined;
  }[];
  /** Voting patterns (group cohesion) from MCP or fallback */
  readonly votingPatterns?: readonly {
    readonly group?: string | undefined;
    readonly cohesion?: number | undefined;
    readonly participation?: number | undefined;
  }[];
  /** Voting anomalies detected in the period */
  readonly votingAnomalies?: readonly {
    readonly type?: string | undefined;
    readonly description?: string | undefined;
    readonly severity?: string | undefined;
  }[];
  /**
   * Alias for votingAnomalies — matches existing article payloads
   * (e.g. Motions/WeeklyReview strategies) that expose anomalies as `anomalies`.
   * When both fields are present they are merged internally.
   */
  readonly anomalies?: readonly {
    readonly type?: string | undefined;
    readonly description?: string | undefined;
    readonly severity?: string | undefined;
  }[];
  /** Legislative documents from MCP */
  readonly documents?: readonly {
    readonly title?: string | undefined;
    readonly type?: string | undefined;
    readonly date?: string | undefined;
    readonly status?: string | undefined;
    readonly committee?: string | undefined;
    readonly rapporteur?: string | undefined;
  }[];
  /** Active legislative procedures from pipeline */
  readonly procedures?: readonly {
    readonly id?: string | undefined;
    readonly title?: string | undefined;
    readonly stage?: string | undefined;
    readonly committee?: string | undefined;
    readonly status?: string | undefined;
    readonly bottleneck?: boolean | undefined;
  }[];
  /** Parliamentary questions from MCP */
  readonly questions?: readonly {
    readonly author?: string | undefined;
    readonly subject?: string | undefined;
    readonly topic?: string | undefined;
    readonly date?: string | undefined;
    readonly status?: string | undefined;
    readonly type?: string | undefined;
  }[];
  /** Committee meetings from MCP */
  readonly committees?: readonly {
    readonly committee?: string | undefined;
    readonly committeeName?: string | undefined;
    readonly date?: string | undefined;
    readonly agenda?: readonly { readonly title?: string | undefined }[] | undefined;
  }[];
  /** Upcoming or ongoing plenary events */
  readonly events?: readonly {
    readonly title?: string | undefined;
    readonly type?: string | undefined;
    readonly date?: string | undefined;
    readonly description?: string | undefined;
  }[];
  /** Coalition intelligence data */
  readonly coalitions?: readonly {
    readonly groups?: readonly string[] | undefined;
    readonly cohesionScore?: number | undefined;
    readonly alignmentTrend?: string | undefined;
    readonly riskLevel?: string | undefined;
  }[];
  /** MEP influence scores from MCP */
  readonly mepScores?: readonly {
    readonly mepName?: string | undefined;
    readonly overallScore?: number | undefined;
    readonly rank?: string | undefined;
  }[];
  /** Free-form article type label for context */
  readonly articleType?: string | undefined;
}
