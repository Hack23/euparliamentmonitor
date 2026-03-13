// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Analysis
 * @description Extended analysis types for multi-iteration AI refinement with structured
 * reasoning chains, scenario planning, confidence indicators, and evidence links.
 */

import type { DeepAnalysis } from './common.js';

// ─── Confidence ───────────────────────────────────────────────────────────────

/** Confidence level for analysis findings */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// ─── Evidence ────────────────────────────────────────────────────────────────

/** Reference to a primary source that supports a claim */
export interface EvidenceReference {
  /** Unique identifier of the source document / event */
  readonly id: string;
  /** Source type */
  readonly type: 'vote' | 'document' | 'speech' | 'question' | 'procedure';
  /** Human-readable title */
  readonly title: string;
  /** ISO 8601 date string, if available */
  readonly date?: string;
  /** Canonical URL for the source, if available */
  readonly url?: string;
}

// ─── Reasoning ───────────────────────────────────────────────────────────────

/** A single step in a structured reasoning chain */
export interface ReasoningChain {
  /** The starting assertion or observation */
  readonly premise: string;
  /** Supporting evidence documents */
  readonly evidence: readonly EvidenceReference[];
  /** The logical step derived from the premise and evidence */
  readonly inference: string;
  /** How confident the analyst is in this chain */
  readonly confidence: ConfidenceLevel;
  /** Plausible objections to the inference */
  readonly counterArguments: readonly string[];
  /** The final deduction drawn from this chain */
  readonly conclusion: string;
}

// ─── Scenario Planning ───────────────────────────────────────────────────────

/** Impact on a specific stakeholder within a scenario */
export interface StakeholderImpact {
  /** Name or description of the stakeholder */
  readonly stakeholder: string;
  /** Description of how they are affected */
  readonly impact: string;
  /** Severity of the impact */
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

/** A single plausible future scenario */
export interface Scenario {
  /** Narrative description of the scenario */
  readonly description: string;
  /** Probability estimate in the range [0, 1] */
  readonly probability: number;
  /** Conditions that would trigger or confirm this scenario */
  readonly triggers: readonly string[];
  /** How different stakeholders are affected */
  readonly implications: readonly StakeholderImpact[];
  /** Expected timeframe for the scenario to materialise */
  readonly timeline: string;
}

/** Three-scenario planning framework plus wildcard signals */
export interface ScenarioPlanning {
  /** Optimistic future state */
  readonly bestCase: Scenario;
  /** Pessimistic future state */
  readonly worstCase: Scenario;
  /** Most probable future state */
  readonly mostLikely: Scenario;
  /** Low-probability, high-impact events that could invalidate all scenarios */
  readonly wildcards: readonly string[];
}

// ─── Multi-Iteration Analysis Metadata ───────────────────────────────────────

/** A single refinement pass in the multi-iteration analysis process */
export interface AnalysisIteration {
  /** Pass number (1 = initial, 4 = synthesis) */
  readonly pass: 1 | 2 | 3 | 4;
  /** Type of analytical work performed in this pass */
  readonly type: 'initial' | 'stakeholder_challenge' | 'evidence_validation' | 'synthesis';
  /** Overall confidence level for findings in this pass */
  readonly confidence: ConfidenceLevel;
  /** Key findings from this pass */
  readonly findings: readonly string[];
  /** Evidence references consulted */
  readonly evidenceRefs: readonly EvidenceReference[];
  /** How this pass refined the previous pass's conclusions */
  readonly refinements: readonly string[];
}

/** Quality and provenance metadata for a completed analysis */
export interface AnalysisQualityMetadata {
  /** Aggregate confidence across all iterations */
  readonly overallConfidence: ConfidenceLevel;
  /** Strength of the evidence base */
  readonly evidenceStrength: 'strong' | 'moderate' | 'weak';
  /** Total number of refinement iterations performed */
  readonly iterationCount: number;
  /** Individual iteration records */
  readonly iterations: readonly AnalysisIteration[];
}

// ─── Enhanced Deep Analysis ───────────────────────────────────────────────────

/**
 * Extended deep analysis that adds multi-iteration AI refinement on top of
 * the base "5W + Impact" framework defined in `DeepAnalysis`.
 *
 * All additional fields are optional so that existing `DeepAnalysis` objects
 * remain valid.
 */
export interface EnhancedDeepAnalysis extends DeepAnalysis {
  /** Quality and provenance metadata produced by the multi-iteration pipeline */
  readonly qualityMetadata?: AnalysisQualityMetadata;
  /** Three-scenario forward-looking planning section */
  readonly scenarioPlanning?: ScenarioPlanning;
  /** Structured reasoning chains that support the main conclusions */
  readonly reasoningChains?: readonly ReasoningChain[];
  /** One-paragraph executive summary of the entire analysis */
  readonly executiveSummary?: string;
  /** Comparative context: how this event compares with historical precedents */
  readonly comparativeContext?: string;
}
