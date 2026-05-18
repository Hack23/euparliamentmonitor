// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/ArticleStrings/Breaking
 * @description Localized strings for breaking-news articles plus the deep
 * "5W + Impact" analysis data structures and their localized labels.
 * `DeepAnalysis` / `PoliticalMistake` / `ActionConsequence` /
 * `StakeholderOutcome` live here because every article-type analysis
 * pipeline composes them, and the breaking-news pipeline is their primary
 * consumer.
 */

import type {
  StakeholderPerspective,
  StakeholderOutcomeMatrix,
} from '../stakeholder.js';

/** Localized section heading strings for breaking news articles */
export interface BreakingStrings {
  breakingBanner: string;
  votingAnomalyIntel: string;
  coalitionDynamics: string;
  analyticalReport: string;
  keyMEPInfluence: string;
  intelligenceBriefing: string;
  votingAnomalyAlert: string;
  coalitionDynamicsSection: string;
  keyPlayers: string;
  placeholderNotice: string;
  placeholderLede: string;
  lede: string;
  /** Neutral feed-first lede used when analytical data is absent */
  feedLede: string;
  /** Section heading for recently adopted texts from EP feeds */
  adoptedTextsHeading: string;
  /** Section heading for recent EP events from feeds */
  recentEventsHeading: string;
  /** Section heading for legislative procedure updates from feeds */
  procedureUpdatesHeading: string;
  /** Section heading for MEP updates from feeds */
  mepUpdatesHeading: string;
  /** Label for the no-feed-data notice */
  noFeedDataNotice: string;
  /** Localized "as of" phrase used in lede section (e.g. "as of", "zum", "au") */
  asOf: string;
  /** Template function for "what happened" deep-analysis text */
  breakingWhatFn: (
    date: string,
    adopted: number,
    events: number,
    procedures: number,
    meps: number
  ) => string;
  /** "Why it matters" text when voting anomalies are present */
  breakingWhyAnomalies: string;
  /** "Why it matters" text for normal parliamentary activity */
  breakingWhyNormal: string;
  /** Localized name for the legislative majority stakeholder */
  breakingWinnerActor: string;
  /** Template function for winner stakeholder reason */
  breakingWinnerReasonFn: (count: number) => string;
  /** Localized name for the opposition groups stakeholder */
  breakingNeutralActor: string;
  /** Neutral stakeholder reason text */
  breakingNeutralReason: string;
  /** Template function for active-legislative-phase outlook */
  breakingOutlookActiveFn: (date: string) => string;
  /** Template function for transitional-period outlook */
  breakingOutlookTransitionalFn: (date: string) => string;
  /** Consequence text for adopted texts ("New legal obligations…") */
  breakingLegalObligationsConsequence: string;
  /** Consequence text for procedure updates ("Legislative trajectory altered…") */
  breakingProcedureConsequence: string;
  /** Political impact text when voting anomalies are present */
  breakingImpactPoliticalAnomalies: string;
  /** Template function for political impact text in normal activity */
  breakingImpactPoliticalNormalFn: (count: number) => string;
  /** Economic impact text */
  breakingImpactEconomic: string;
  /** Social impact text */
  breakingImpactSocial: string;
  /** Template function for legal impact text */
  breakingImpactLegalFn: (count: number) => string;
  /** Geopolitical impact text when coalition data available */
  breakingImpactGeopoliticalCoalition: string;
  /** Geopolitical impact text for normal activity */
  breakingImpactGeopoliticalNormal: string;
  /** "Political group whips" mistake actor name */
  breakingMistakeActor: string;
  /** Mistake description text */
  breakingMistakeDescription: string;
  /** Mistake alternative text */
  breakingMistakeAlternative: string;
  /** Localized prefix for adopted text items in the "Who" list (e.g. "Adopted:", "Angenommen:") */
  breakingAdoptedPrefix: string;
  /** Localized prefix for MEP items in the "Who" list (e.g. "MEP:", "MdEP:") */
  breakingMEPPrefix: string;
  /** User-friendly fallback shown when voting anomaly data is unavailable */
  anomalyUnavailable: string;
  /** User-friendly fallback shown when coalition dynamics data is unavailable */
  coalitionUnavailable: string;
  /** Human-readable localized label for the adopted-text type (replaces raw "[TEXT_ADOPTED]" token) */
  adoptedTextTypeLabel: string;
  /** Template to format an adopted-text item title from its label/identifier (e.g. "T10-0315/2025") */
  adoptedTextItemLabelFn: (label: string) => string;
  /** Template to show truncation note: "Showing {shown} of {total}" */
  showingXofNFn: (shown: number, total: number) => string;
}

// ─── Deep Analysis types ───────────────────────────────────────────────────

/**
 * Single consequence resulting from a parliamentary action.
 * Maps an action to its downstream political, economic, or social effects.
 */
export interface ActionConsequence {
  /** The parliamentary action taken */
  readonly action: string;
  /** The resulting consequence or ripple effect */
  readonly consequence: string;
  /** How significant is this consequence: low, medium, high, critical */
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Political stakeholder assessment: winners, losers, and their reasons.
 */
export interface StakeholderOutcome {
  /** Name of stakeholder, political group, institution, or member state */
  readonly actor: string;
  /** Whether this actor benefits or is disadvantaged */
  readonly outcome: 'winner' | 'loser' | 'neutral';
  /** Explanation of why */
  readonly reason: string;
}

/**
 * A single identified mistake, miscalculation, or missed opportunity
 * in parliamentary proceedings.
 */
export interface PoliticalMistake {
  /** Who made the mistake */
  readonly actor: string;
  /** What the mistake or miscalculation was */
  readonly description: string;
  /** What they should have done differently */
  readonly alternative: string;
}

/**
 * Comprehensive deep political analysis using the "5W + Impact" framework.
 * Every article type populates this from its available data to provide
 * parliament-intelligence-grade analysis for sophisticated readers.
 *
 * Fields map to the framework:
 * - **What**: What happened / what is proposed
 * - **Who**: Key actors, political groups, rapporteurs, shadows
 * - **When**: Timeline, deadlines, key dates
 * - **Why**: Root causes, political motivations, strategic calculations
 * - **Winners/Losers**: Who benefits, who loses, stakeholder impact
 * - **Impact**: Multi-perspective consequences (political, economic, social, legal)
 * - **Actions → Consequences**: Causal chains from decisions to outcomes
 * - **Mistakes**: Miscalculations, missed opportunities
 * - **Outlook**: What happens next, strategic implications
 * - **Stakeholder Perspectives**: Multi-stakeholder impact assessment per group
 * - **Stakeholder Outcome Matrix**: Winner/loser/neutral matrix per action per group
 */
export interface DeepAnalysis {
  /** WHAT: Core subject — what happened or is being proposed */
  readonly what: string;
  /** WHO: Key actors — political groups, rapporteurs, MEPs, institutions */
  readonly who: readonly string[];
  /** WHEN: Key dates — timeline, deadlines, procedural milestones */
  readonly when: readonly string[];
  /** WHY: Root causes — political motivations, strategic calculations */
  readonly why: string;
  /** WINNERS & LOSERS: Stakeholder impact assessment */
  readonly stakeholderOutcomes: readonly StakeholderOutcome[];
  /** IMPACT: Multi-perspective analysis of consequences */
  readonly impactAssessment: {
    readonly political: string;
    readonly economic: string;
    readonly social: string;
    readonly legal: string;
    readonly geopolitical: string;
  };
  /** ACTIONS → CONSEQUENCES: Causal chains */
  readonly actionConsequences: readonly ActionConsequence[];
  /** MISTAKES: Miscalculations and missed opportunities */
  readonly mistakes: readonly PoliticalMistake[];
  /** OUTLOOK: What happens next — strategic forward look */
  readonly outlook: string;
  /**
   * MULTI-STAKEHOLDER PERSPECTIVES: Detailed impact per stakeholder group.
   * Optional — populated by enhanced analysis builders.
   */
  readonly stakeholderPerspectives?: readonly StakeholderPerspective[];
  /**
   * STAKEHOLDER OUTCOME MATRIX: Winner/loser/neutral per action per group.
   * Optional — populated by enhanced analysis builders.
   */
  readonly stakeholderOutcomeMatrix?: readonly StakeholderOutcomeMatrix[];
}

/** Localized strings for deep analysis section headings */
export interface DeepAnalysisStrings {
  /** Main section heading */
  readonly sectionHeading: string;
  /** Sub-heading for "What" */
  readonly whatHeading: string;
  /** Sub-heading for "Who" */
  readonly whoHeading: string;
  /** Sub-heading for "When" */
  readonly whenHeading: string;
  /** Sub-heading for "Why" */
  readonly whyHeading: string;
  /** Sub-heading for Winners & Losers */
  readonly stakeholderHeading: string;
  /** Label for winner outcome */
  readonly winnerLabel: string;
  /** Label for loser outcome */
  readonly loserLabel: string;
  /** Label for neutral outcome */
  readonly neutralLabel: string;
  /** Sub-heading for impact assessment */
  readonly impactHeading: string;
  /** Impact perspective labels */
  readonly politicalLabel: string;
  readonly economicLabel: string;
  readonly socialLabel: string;
  readonly legalLabel: string;
  readonly geopoliticalLabel: string;
  /** Sub-heading for actions → consequences */
  readonly consequencesHeading: string;
  /** Label for action column */
  readonly actionLabel: string;
  /** Label for consequence column */
  readonly consequenceLabel: string;
  /** Label for severity column header */
  readonly severityColumnLabel: string;
  /** Sub-heading for mistakes */
  readonly mistakesHeading: string;
  /** Label for "should have" alternative */
  readonly alternativeLabel: string;
  /** Sub-heading for outlook */
  readonly outlookHeading: string;
  /** Severity labels */
  readonly severityLow: string;
  readonly severityMedium: string;
  readonly severityHigh: string;
  readonly severityCritical: string;
  /** Sub-heading for multi-stakeholder perspectives section */
  readonly perspectivesHeading: string;
  /** Sub-heading for stakeholder outcome matrix section */
  readonly outcomeMatrixHeading: string;
  /** Column header for "Confidence" in the outcome matrix */
  readonly confidenceLabel: string;
  /** Localized stakeholder group labels for the outcome matrix columns */
  readonly politicalGroupsLabel: string;
  readonly civilSocietyLabel: string;
  readonly industryLabel: string;
  readonly nationalGovtsLabel: string;
  readonly citizensLabel: string;
  readonly euInstitutionsLabel: string;
  /** Impact direction labels for stakeholder perspective cards */
  readonly positiveLabel: string;
  readonly negativeLabel: string;
  readonly mixedLabel: string;
  // ─── Enhanced analysis strings ───────────────────────────────────────────
  /** Heading for executive summary section */
  readonly executiveSummaryHeading: string;
  /** Confidence level labels */
  readonly confidenceHigh: string;
  readonly confidenceMedium: string;
  readonly confidenceLow: string;
  /** Evidence references heading */
  readonly evidenceRefsHeading: string;
  /** Counter-arguments heading */
  readonly counterArgumentsHeading: string;
  /** Section labels for reasoning chains */
  readonly conclusionLabel: string;
  readonly premiseLabel: string;
  readonly inferenceLabel: string;
  /** Heading for reasoning chains section */
  readonly reasoningChainsHeading: string;
  /** Heading for scenario planning section */
  readonly scenarioPlanningHeading: string;
  /** Scenario labels */
  readonly bestCaseLabel: string;
  readonly worstCaseLabel: string;
  readonly mostLikelyLabel: string;
  readonly wildcardsLabel: string;
  readonly probabilityLabel: string;
  readonly triggersLabel: string;
  readonly impliedImpactsLabel: string;
  readonly timelineLabel: string;
  /** Heading for analysis methodology section */
  readonly analysisMethodologyHeading: string;
  /** Methodology metadata labels */
  readonly iterationCountLabel: string;
  readonly evidenceStrengthLabel: string;
  /** Evidence strength values */
  readonly evidenceStrong: string;
  readonly evidenceModerate: string;
  readonly evidenceWeak: string;
  /** Iteration type labels */
  readonly iterationInitial: string;
  readonly iterationStakeholderChallenge: string;
  readonly iterationEvidenceValidation: string;
  readonly iterationSynthesis: string;
  /** Label for overall confidence in methodology stats */
  readonly overallConfidenceLabel: string;
  /** Generic AI-pending notice shown when analysis is not yet available */
  readonly pendingNotice: string;
}
