// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Types/Stakeholder
 * @description Multi-stakeholder perspective types for the enhanced political
 * analysis engine. These types model how parliamentary actions affect each
 * major stakeholder group and support iterative multi-pass analysis.
 */

/**
 * The six major stakeholder groups that are assessed for every parliamentary action.
 * - **political_groups**: EP political groups and their electoral blocs
 * - **civil_society**: NGOs, advocacy organisations, think-tanks
 * - **industry**: Business associations, trade bodies, chambers of commerce
 * - **national_govts**: Member state governments and their ministries
 * - **citizens**: EU citizens in general; voters and rights-holders
 * - **eu_institutions**: Commission, Council, Court of Justice, ECB etc.
 */
export type StakeholderType =
  | 'political_groups'
  | 'civil_society'
  | 'industry'
  | 'national_govts'
  | 'citizens'
  | 'eu_institutions';

/**
 * Stable iteration order for all six stakeholder types.
 * Use this constant in any code that needs to iterate over all groups
 * to avoid duplicating the list in multiple files.
 */
export const ALL_STAKEHOLDER_TYPES: readonly StakeholderType[] = [
  'political_groups',
  'civil_society',
  'industry',
  'national_govts',
  'citizens',
  'eu_institutions',
];

/**
 * The direction of impact on a stakeholder group.
 * - **positive**: The action clearly benefits the stakeholder
 * - **negative**: The action clearly harms or disadvantages the stakeholder
 * - **neutral**: The action has no material effect
 * - **mixed**: The action has both positive and negative consequences
 */
export type StakeholderImpact = 'positive' | 'negative' | 'neutral' | 'mixed';

/**
 * How important the impact is for the stakeholder group.
 */
export type StakeholderSeverity = 'high' | 'medium' | 'low';

/**
 * A detailed perspective on how a parliamentary action affects one
 * specific stakeholder group. Used in multi-stakeholder analysis to
 * map every action to its full range of societal consequences.
 */
export interface StakeholderPerspective {
  /** Which stakeholder group this perspective describes */
  readonly stakeholder: StakeholderType;
  /** Direction of the impact on this stakeholder */
  readonly impact: StakeholderImpact;
  /** Magnitude of the impact */
  readonly severity: StakeholderSeverity;
  /** Human-readable reasoning explaining the impact */
  readonly reasoning: string;
  /** Evidence strings supporting the reasoning (data points, text references) */
  readonly evidence: readonly string[];
}

/**
 * Identifies which analysis pass produced a finding.
 * Mirrors the four-pass iterative refinement flow:
 * 1. `initial` — Baseline assessment from MCP data
 * 2. `stakeholder_challenge` — How each group's interests are affected
 * 3. `cross_perspective` — Conflicts and alignments across groups
 * 4. `final_refinement` — Balanced evidence-based conclusions
 */
export type AnalysisIterationType =
  | 'initial'
  | 'stakeholder_challenge'
  | 'cross_perspective'
  | 'final_refinement';

/**
 * A single pass in the iterative multi-pass analysis cycle.
 * Captures the intermediate thinking at each stage of refinement.
 */
export interface AnalysisIteration {
  /** Which pass number this is (1–4) */
  readonly pass: number;
  /** The type of analysis pass */
  readonly type: AnalysisIterationType;
  /** Short summary of what this pass adds or changes */
  readonly summary: string;
  /** Key findings produced in this pass */
  readonly findings: readonly string[];
}

/**
 * A row in the stakeholder outcome matrix: one parliamentary action mapped
 * to an outcome (winner / loser / neutral) for each of the six stakeholder
 * groups, plus a confidence rating.
 */
export interface StakeholderOutcomeMatrix {
  /** The parliamentary action being assessed */
  readonly action: string;
  /** How each stakeholder group fares as a result of the action */
  readonly outcomes: Readonly<Record<StakeholderType, 'winner' | 'loser' | 'neutral'>>;
  /** Confidence in the outcome assessments */
  readonly confidence: 'high' | 'medium' | 'low';
}
