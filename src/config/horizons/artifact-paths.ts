// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config/Horizons/ArtifactPaths
 * @description Co-located artifact-path constants and shared mandatory-list
 * groups used by {@link ./registry.ts | the article-horizons registry}.
 *
 * Extracted from `src/config/article-horizons.ts` as part of Refactor 2/8
 * (issue Hack23/euparliamentmonitor#2030) to keep `registry.ts` under the
 * ≤350-LOC ceiling without duplicating these strings into the validator
 * (`scripts/validate-analysis-completeness.js` keeps its parallel map —
 * convergence tracked separately by the drift-guard in
 * `test/unit/horizon-registry.test.js`).
 *
 * @see ./registry.ts
 */

// ─── Per-artifact relative paths ─────────────────────────────────────────────

export const A_SIGNIFICANCE = 'classification/significance-classification.md';
export const A_ACTOR_MAP = 'classification/actor-mapping.md';
export const A_FORCES = 'classification/forces-analysis.md';
export const A_IMPACT = 'classification/impact-matrix.md';
export const A_RISK_MATRIX = 'risk-scoring/risk-matrix.md';
export const A_QUANT_SWOT = 'risk-scoring/quantitative-swot.md';
export const A_SYNTHESIS = 'intelligence/synthesis-summary.md';
export const A_COALITION = 'intelligence/coalition-dynamics.md';
export const A_SCENARIO = 'intelligence/scenario-forecast.md';
export const A_PESTLE = 'intelligence/pestle-analysis.md';
export const A_STAKEHOLDER = 'intelligence/stakeholder-map.md';
export const A_WILDCARDS = 'intelligence/wildcards-blackswans.md';
export const A_HISTORICAL = 'intelligence/historical-baseline.md';
export const A_ECONOMIC = 'intelligence/economic-context.md';
export const A_THREAT = 'intelligence/threat-model.md';
export const A_MCP_AUDIT = 'intelligence/mcp-reliability-audit.md';
export const A_INDEX = 'intelligence/analysis-index.md';
export const A_REFLECTION = 'intelligence/methodology-reflection.md';
export const A_VOTING = 'intelligence/voting-patterns.md';
export const A_FORWARD_PROJECTION = 'intelligence/forward-projection.md';
export const A_PIPELINE_FORECAST = 'intelligence/legislative-pipeline-forecast.md';
export const A_CALENDAR_PROJECTION = 'intelligence/parliamentary-calendar-projection.md';
export const A_TERM_ARC = 'intelligence/term-arc.md';
export const A_SEAT_PROJECTION = 'intelligence/seat-projection.md';
export const A_MANDATE_SCORECARD = 'intelligence/mandate-fulfilment-scorecard.md';
export const A_PRESIDENCY_TRIO = 'intelligence/presidency-trio-context.md';
export const A_COMMISSION_WP = 'intelligence/commission-wp-alignment.md';
export const A_FORWARD_INDICATORS = 'extended/forward-indicators.md';
export const A_HISTORICAL_PARALLELS = 'extended/historical-parallels.md';
export const A_COMPARATIVE_INTL = 'extended/comparative-international.md';
export const A_EXEC_BRIEF = 'extended/executive-brief.md';
export const A_DEVILS_ADVOCATE = 'extended/devils-advocate-analysis.md';
export const A_INTEL_ASSESSMENT = 'extended/intelligence-assessment.md';
export const A_MEDIA_FRAMING = 'extended/media-framing-analysis.md';
export const A_DEEP_ANALYSIS_EXISTING = 'existing/deep-analysis.md';

// ─── Shared feed list ────────────────────────────────────────────────────────

/** Standard EP MCP feeds reused across horizons. */
export const STANDARD_FEEDS = [
  'get_plenary_sessions',
  'get_meeting_foreseen_activities',
  'get_voting_records',
  'get_meps',
  'get_political_groups',
  'get_committee_info',
  'get_procedures',
  'get_external_documents',
] as const;

// ─── Shared mandatory-artifact lists ─────────────────────────────────────────

/** Mandatory artifacts shared by every prospective horizon. Long-horizon
 *  variants additionally require `forward-projection.md`.
 *
 *  `extended/media-framing-analysis.md` is mandatory for every horizon —
 *  see [`analytical-supplementary-methodology.md` §AS4](../../../analysis/methodologies/analytical-supplementary-methodology.md)
 *  and [`per-artifact-methodologies.md` §media-framing-analysis](../../../analysis/methodologies/per-artifact-methodologies.md).
 *  Agents produce it during Pass 2 (or late Pass 1) once the rest of the
 *  context is in place. */
export const PROSPECTIVE_MANDATORY = [
  A_SIGNIFICANCE,
  A_ACTOR_MAP,
  A_FORCES,
  A_IMPACT,
  A_RISK_MATRIX,
  A_QUANT_SWOT,
  A_SYNTHESIS,
  A_COALITION,
  A_SCENARIO,
  A_PESTLE,
  A_STAKEHOLDER,
  A_WILDCARDS,
  A_HISTORICAL,
  A_ECONOMIC,
  A_THREAT,
  A_MCP_AUDIT,
  A_INDEX,
  A_MEDIA_FRAMING,
  A_REFLECTION,
] as const;

/** Mandatory artifacts shared by every retrospective horizon.
 *
 *  `extended/media-framing-analysis.md` is mandatory across every horizon
 *  (see PROSPECTIVE_MANDATORY) — review runs build it from the same Pass-2
 *  read-back so framing analysis lands after the underlying voting,
 *  stakeholder and coalition artifacts are stable. */
export const RETROSPECTIVE_MANDATORY = [
  A_SIGNIFICANCE,
  A_ACTOR_MAP,
  A_FORCES,
  A_IMPACT,
  A_RISK_MATRIX,
  A_QUANT_SWOT,
  A_SYNTHESIS,
  A_COALITION,
  A_VOTING,
  A_PESTLE,
  A_STAKEHOLDER,
  A_HISTORICAL,
  A_ECONOMIC,
  A_THREAT,
  A_MCP_AUDIT,
  A_INDEX,
  A_MEDIA_FRAMING,
  A_REFLECTION,
] as const;

/** Mandatory artifacts unique to long-horizon prospective runs. */
export const LONG_HORIZON_PROSPECTIVE_EXTRA = [
  A_FORWARD_PROJECTION,
  A_PIPELINE_FORECAST,
  A_CALENDAR_PROJECTION,
  A_FORWARD_INDICATORS,
] as const;

/** Mandatory artifacts unique to electoral horizons. */
export const ELECTORAL_EXTRA = [
  A_FORWARD_PROJECTION,
  A_TERM_ARC,
  A_SEAT_PROJECTION,
  A_MANDATE_SCORECARD,
  A_PRESIDENCY_TRIO,
  A_COMMISSION_WP,
  A_FORWARD_INDICATORS,
  A_COMPARATIVE_INTL,
  A_HISTORICAL_PARALLELS,
] as const;
