// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/PoliticalThreats
 * @description Political Threat Assessment types adapted from ISMS threat modeling
 * (STRIDE, MITRE ATT&CK, attack trees) applied to parliamentary political dynamics.
 *
 * The Political STRIDE framework maps information-security threat categories to
 * equivalent political intelligence threat categories for structured analysis of
 * European Parliament activity.
 *
 * @see {@link https://github.com/Hack23/ISMS-PUBLIC/blob/main/Threat_Modeling.md} ISMS Threat Modeling Policy
 */

// ─── Local type aliases for standalone use ────────────────────────────────────
// These mirror the types expected from the political-classification module (#804).
// When that module is available, replace these with direct imports.

/**
 * Political actor types in the European Parliament context.
 * Adapted from ISMS threat agent classification for political intelligence.
 */
export type PoliticalActorType =
  | 'political_group' // EP political groups (EPP, S&D, Renew, etc.)
  | 'member_state' // EU member state governments
  | 'eu_institution' // Commission, Council, Court of Justice, ECB
  | 'committee' // EP committees (ECON, ENVI, LIBE, etc.)
  | 'mep' // Individual Members of European Parliament
  | 'civil_society' // NGOs, advocacy organisations, think-tanks
  | 'industry' // Business associations, trade bodies
  | 'rapporteur' // Legislative rapporteur for a specific procedure
  | 'shadow_rapporteur'; // Shadow rapporteur from opposing group

/**
 * Impact severity levels for political consequences.
 * Aligned with ISMS risk impact classification.
 */
export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';

// ─── Political STRIDE Categories ──────────────────────────────────────────────

/**
 * Political STRIDE threat categories — adapted from information security STRIDE.
 *
 * Each category maps a classic security threat to its political equivalent:
 * - **Shift** ← Spoofing: Coalition shifts, political realignment, defections
 * - **Transparency** ← Tampering: Information asymmetry, procedural opacity
 * - **Reversal** ← Repudiation: Policy reversals, legislative rollbacks
 * - **Institutional** ← Information Disclosure: Institutional power grabs
 * - **Delay** ← Denial of Service: Legislative delays, procedural obstruction
 * - **Erosion** ← Elevation of Privilege: Democratic norm degradation
 */
export type PoliticalThreatCategory =
  | 'shift' // Coalition shifts, political realignment, defections
  | 'transparency' // Information asymmetry, procedural opacity, hidden agendas
  | 'reversal' // Policy reversals, legislative rollbacks, abandoned positions
  | 'institutional' // Institutional power grabs, procedural manipulation
  | 'delay' // Legislative delays, filibustering, procedural obstruction
  | 'erosion'; // Public trust erosion, democratic norm degradation

// ─── Actor Threat Profiles ────────────────────────────────────────────────────

/**
 * Political actor threat profile — adapted from ISMS threat agent classification.
 *
 * Models capability × motivation × opportunity (CMO) for each political actor,
 * parallel to the threat agent classification in ISMS security assessments.
 */
export interface PoliticalActorThreatProfile {
  /** Name of the political actor (group, institution, individual) */
  readonly actor: string;
  /** Classification of the actor type */
  readonly actorType: PoliticalActorType;
  /** Resources and influence capacity: high = major EP group or institution */
  readonly capability: 'high' | 'medium' | 'low';
  /** Incentive to act against current political trajectory */
  readonly motivation: 'high' | 'medium' | 'low';
  /** Current political window of opportunity to act effectively */
  readonly opportunity: 'high' | 'medium' | 'low';
  /** Past similar actions or demonstrated threat behaviours */
  readonly trackRecord: readonly string[];
  /** Which Political STRIDE categories this actor threatens */
  readonly threatCategories: readonly PoliticalThreatCategory[];
  /** Overall threat level derived from CMO composite score */
  readonly overallThreatLevel: ImpactLevel;
}

// ─── Political Consequence Trees ──────────────────────────────────────────────

/**
 * A single node in a political consequence tree — adapted from attack trees.
 * Represents a downstream effect of a political action at a specific timeframe.
 */
export interface ConsequenceNode {
  /** Human-readable description of the consequence */
  readonly description: string;
  /** Estimated probability of this consequence materialising (0–1) */
  readonly probability: number;
  /** Impact severity if the consequence occurs */
  readonly impact: ImpactLevel;
  /** Stakeholder groups affected by this consequence */
  readonly affectedStakeholders: readonly PoliticalActorType[];
  /** Expected timeframe for this consequence to materialise */
  readonly timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
}

/**
 * Political consequence tree — adapted from attack trees in ISMS threat modeling.
 *
 * Traces how a root political action cascades through institutions and actors,
 * including mitigating and amplifying factors that affect overall impact.
 */
export interface PoliticalConsequenceTree {
  /** The initiating political action being analysed */
  readonly rootAction: string;
  /** Direct, near-term consequences (days to weeks) */
  readonly immediateConsequences: readonly ConsequenceNode[];
  /** Secondary effects triggered by immediate consequences (weeks to months) */
  readonly secondaryEffects: readonly ConsequenceNode[];
  /** Long-term structural implications (months to years) */
  readonly longTermImplications: readonly ConsequenceNode[];
  /** Factors that could reduce the severity or probability of consequences */
  readonly mitigatingFactors: readonly string[];
  /** Factors that could increase the severity or probability of consequences */
  readonly amplifyingFactors: readonly string[];
}

// ─── Legislative Process Disruption Analysis ─────────────────────────────────

/**
 * Stages in the EU legislative process — adapted from kill chain analysis.
 * Maps the legislative procedure stages where disruption can occur.
 */
export type LegislativeStage =
  | 'proposal' // Commission proposal / own-initiative
  | 'committee' // Committee phase (rapporteur, amendments, vote)
  | 'plenary_first_reading' // EP first reading plenary vote
  | 'council_position' // Council common position adoption
  | 'plenary_second_reading' // EP second reading with amendments
  | 'conciliation' // Conciliation committee (trilogue)
  | 'adoption'; // Final adoption and entry into force

/**
 * A disruption point in the legislative process — adapted from kill chain stages.
 * Identifies where, how, and by whom the legislative process can be blocked.
 */
export interface DisruptionPoint {
  /** The legislative stage where disruption could occur */
  readonly stage: LegislativeStage;
  /** Which Political STRIDE category the disruption falls under */
  readonly threatCategory: PoliticalThreatCategory;
  /** Estimated likelihood of disruption at this stage (0–1) */
  readonly likelihood: number;
  /** Names of actors with capability and motivation to disrupt at this stage */
  readonly potentialDisruptors: readonly string[];
  /** Available countermeasures to prevent or mitigate disruption */
  readonly countermeasures: readonly string[];
}

/**
 * Legislative process disruption analysis — adapted from kill chain analysis.
 *
 * Maps the complete legislative procedure to identify vulnerability points,
 * assess overall resilience, and document alternative pathways.
 */
export interface LegislativeDisruptionAnalysis {
  /** Name or ID of the legislative procedure being analysed */
  readonly procedure: string;
  /** Current stage of the procedure */
  readonly currentStage: LegislativeStage;
  /** All identified potential disruption points across procedure stages */
  readonly disruptionPoints: readonly DisruptionPoint[];
  /** Overall resilience of the legislative procedure to disruption */
  readonly resilience: 'high' | 'medium' | 'low';
  /** Alternative legislative pathways if primary route is disrupted */
  readonly alternativePathways: readonly string[];
}

// ─── Political STRIDE Assessment ──────────────────────────────────────────────

/**
 * Assessment result for a single Political STRIDE threat category.
 * Contains threat level, evidence, and analysis for one STRIDE dimension.
 */
export interface PoliticalStrideCategory {
  /** Which Political STRIDE category this assessment covers */
  readonly category: PoliticalThreatCategory;
  /** Assessed threat level for this category */
  readonly threatLevel: ImpactLevel;
  /** Evidence supporting the threat level assessment */
  readonly evidence: readonly string[];
  /** Human-readable analysis narrative for this category */
  readonly analysis: string;
}

/**
 * Complete Political Threat Assessment — the top-level output of the
 * political threat assessment pipeline.
 *
 * Combines all STRIDE categories, actor profiles, consequence trees, and
 * legislative disruption analyses into a single structured assessment report.
 */
export interface PoliticalThreatAssessment {
  /** Date of the assessment (ISO 8601) */
  readonly date: string;
  /** Overall threat level across all dimensions */
  readonly overallThreatLevel: ImpactLevel;
  /** Confidence level in the assessment */
  readonly confidence: 'high' | 'medium' | 'low';
  /** Political STRIDE analysis for each of the six categories */
  readonly strideCategories: readonly PoliticalStrideCategory[];
  /** Threat profiles for key political actors */
  readonly actorProfiles: readonly PoliticalActorThreatProfile[];
  /** Consequence trees for identified high-risk political actions */
  readonly consequenceTrees: readonly PoliticalConsequenceTree[];
  /** Legislative disruption analyses for active procedures */
  readonly legislativeDisruptions: readonly LegislativeDisruptionAnalysis[];
  /** Key findings and executive summary points */
  readonly keyFindings: readonly string[];
  /** Recommended monitoring actions */
  readonly recommendations: readonly string[];
}

// ─── Input data type ──────────────────────────────────────────────────────────

/**
 * Input data for political threat assessment functions.
 *
 * Named `ThreatAssessmentInput` to avoid collision with the separate
 * `ArticleData` interface in article strategy modules.
 * Mirrors the structure of MCP-fetched data used throughout the pipeline.
 */
export interface ThreatAssessmentInput {
  /** Voting records from plenary sessions */
  readonly votingRecords?: readonly unknown[];
  /** Coalition dynamics data */
  readonly coalitionData?: readonly unknown[];
  /** MEP influence scores */
  readonly mepInfluence?: readonly unknown[];
  /** Legislative procedure data */
  readonly procedures?: readonly unknown[];
  /** Voting anomaly intelligence */
  readonly votingAnomalies?: readonly unknown[];
  /** Parliamentary questions */
  readonly questions?: readonly unknown[];
  /** Committee data */
  readonly committees?: readonly unknown[];
  /** Feed data (adopted texts, procedures, MEPs) */
  readonly feedData?: Record<string, unknown>;
}
