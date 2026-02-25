// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/IntelligenceAnalysis
 * @description Pure intelligence analysis utility functions for structured
 * assessment of European Parliament data. All functions are stateless and
 * safely handle malformed or missing MCP data. No side effects.
 */

import { escapeHTML } from './file-utils.js';
import type {
  VotingAnomalyIntelligence,
  CoalitionIntelligence,
  MEPInfluenceScore,
  LegislativeVelocity,
} from '../types/index.js';

// ─── Internal type aliases ────────────────────────────────────────────────────

type SignificanceLevel = VotingAnomalyIntelligence['significance'];
type RiskLevel = CoalitionIntelligence['riskLevel'];
type AlignmentTrend = CoalitionIntelligence['alignmentTrend'];

// ─── Validation constants ─────────────────────────────────────────────────────

/** Valid significance levels in descending priority order */
const SIGNIFICANCE_LEVELS: readonly string[] = ['critical', 'high', 'medium', 'low'];

/** Valid risk levels for coalition and bottleneck assessment */
const RISK_LEVELS: readonly string[] = ['high', 'medium', 'low'];

/** Valid alignment trend values */
const ALIGNMENT_TRENDS: readonly string[] = ['strengthening', 'weakening', 'stable'];

/** Priority weights for significance-based ranking */
const SIGNIFICANCE_WEIGHTS: Readonly<Record<string, number>> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ─── Private value-extraction helpers ────────────────────────────────────────

/**
 * Safely extract a string from an unknown field value
 *
 * @param val - Unknown value to coerce
 * @returns The string value or empty string if not a string
 */
function asStr(val: unknown): string {
  return typeof val === 'string' ? val : '';
}

/**
 * Safely extract a finite number from an unknown field value
 *
 * @param val - Unknown value to coerce
 * @param fallback - Value returned when input is not a finite number
 * @returns Finite number or fallback
 */
function asNum(val: unknown, fallback = 0): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

/**
 * Safely extract an array of strings from an unknown field value
 *
 * @param val - Unknown value to coerce
 * @returns Array of strings (empty array if input is not an array)
 */
function asStrArr(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return (val as unknown[]).filter((v): v is string => typeof v === 'string');
}

/**
 * Coerce an unknown value to a non-null Record or return null
 *
 * @param input - Value to cast
 * @returns Record or null for null/undefined/non-object input
 */
function toRecord(input: unknown): Record<string, unknown> | null {
  if (input === null || input === undefined || typeof input !== 'object') return null;
  return input as Record<string, unknown>;
}

// ─── Private parsing validators ───────────────────────────────────────────────

/**
 * Validate and normalise a raw significance level string
 *
 * @param raw - Raw string from MCP data
 * @returns Validated SignificanceLevel, defaulting to 'low'
 */
function parseSignificance(raw: string): SignificanceLevel {
  const lower = raw.toLowerCase();
  return SIGNIFICANCE_LEVELS.includes(lower) ? (lower as SignificanceLevel) : 'low';
}

/**
 * Validate and normalise a raw risk level string
 *
 * @param raw - Raw string from MCP data
 * @returns Validated RiskLevel, defaulting to 'medium'
 */
function parseRiskLevel(raw: string): RiskLevel {
  const lower = raw.toLowerCase();
  return RISK_LEVELS.includes(lower) ? (lower as RiskLevel) : 'medium';
}

/**
 * Validate and normalise a raw alignment trend string
 *
 * @param raw - Raw string from MCP data
 * @returns Validated AlignmentTrend, defaulting to 'stable'
 */
function parseAlignmentTrend(raw: string): AlignmentTrend {
  const lower = raw.toLowerCase();
  return ALIGNMENT_TRENDS.includes(lower) ? (lower as AlignmentTrend) : 'stable';
}

// ─── Exported intelligence functions ─────────────────────────────────────────

/**
 * Parse and score a voting anomaly from raw MCP data.
 * Returns null for null, undefined, non-object, or inputs missing a valid
 * anomaly identifier.
 *
 * @param rawAnomaly - Raw MCP anomaly data (unknown shape)
 * @returns Structured VotingAnomalyIntelligence or null if input is invalid
 */
export function scoreVotingAnomaly(rawAnomaly: unknown): VotingAnomalyIntelligence | null {
  const a = toRecord(rawAnomaly);
  if (!a) return null;
  const anomalyId = asStr(a['anomalyId']) || asStr(a['id']);
  if (!anomalyId) return null;
  return {
    anomalyId,
    significance: parseSignificance(asStr(a['significance'])),
    description: asStr(a['description']),
    affectedGroups: asStrArr(a['affectedGroups']),
    deviationPercentage: asNum(a['deviationPercentage']),
    historicalContext: asStr(a['historicalContext']),
    implication: asStr(a['implication']),
  };
}

/**
 * Analyse a coalition's cohesion from raw MCP coalition data.
 * Returns null for null, undefined, non-object, or inputs missing a valid
 * coalition identifier.
 *
 * @param rawCoalition - Raw MCP coalition data (unknown shape)
 * @returns Structured CoalitionIntelligence or null if input is invalid
 */
export function analyzeCoalitionCohesion(rawCoalition: unknown): CoalitionIntelligence | null {
  const c = toRecord(rawCoalition);
  if (!c) return null;
  const coalitionId = asStr(c['coalitionId']) || asStr(c['id']);
  if (!coalitionId) return null;
  return {
    coalitionId,
    groups: asStrArr(c['groups']),
    cohesionScore: Math.min(1, Math.max(0, asNum(c['cohesionScore']))),
    alignmentTrend: parseAlignmentTrend(asStr(c['alignmentTrend'])),
    keyVotes: Math.max(0, Math.round(asNum(c['keyVotes']))),
    riskLevel: parseRiskLevel(asStr(c['riskLevel'])),
  };
}

/**
 * Extract and score MEP influence from raw MCP influence data.
 * Returns null for null, undefined, non-object, or inputs missing both a
 * valid MEP identifier and display name.
 *
 * @param rawInfluence - Raw MCP MEP influence data (unknown shape)
 * @returns Structured MEPInfluenceScore or null if input is invalid
 */
export function scoreMEPInfluence(rawInfluence: unknown): MEPInfluenceScore | null {
  const m = toRecord(rawInfluence);
  if (!m) return null;
  const mepId = asStr(m['mepId']) || asStr(m['id']);
  const mepName = asStr(m['mepName']) || asStr(m['name']);
  if (!mepId || !mepName) return null;
  return {
    mepId,
    mepName,
    overallScore: Math.min(100, Math.max(0, asNum(m['overallScore']))),
    votingActivity: Math.min(100, Math.max(0, asNum(m['votingActivity']))),
    legislativeOutput: Math.min(100, Math.max(0, asNum(m['legislativeOutput']))),
    committeeEngagement: Math.min(100, Math.max(0, asNum(m['committeeEngagement']))),
    rank: asStr(m['rank']),
  };
}

/**
 * Calculate legislative velocity from raw MCP procedure data.
 * Returns null for null, undefined, non-object, or inputs missing a valid
 * procedure identifier or title.
 *
 * @param rawProcedure - Raw MCP procedure data (unknown shape)
 * @returns Structured LegislativeVelocity or null if input is invalid
 */
export function calculateLegislativeVelocity(rawProcedure: unknown): LegislativeVelocity | null {
  const p = toRecord(rawProcedure);
  if (!p) return null;
  const procedureId = asStr(p['procedureId']) || asStr(p['id']);
  const title = asStr(p['title']);
  if (!procedureId || !title) return null;
  return {
    procedureId,
    title,
    stage: asStr(p['stage']) || 'Unknown',
    daysInCurrentStage: Math.max(0, Math.round(asNum(p['daysInCurrentStage']))),
    velocityScore: Math.min(1, Math.max(0, asNum(p['velocityScore']))),
    bottleneckRisk: parseRiskLevel(asStr(p['bottleneckRisk'])),
    predictedCompletion: asStr(p['predictedCompletion']),
  };
}

/**
 * Sort items by significance level descending, with numeric score as
 * tie-breaker. Items with higher significance or scores appear first.
 * The original array is not mutated.
 *
 * @param items - Array of items with optional significance and score fields
 * @returns New sorted array ordered by significance then score
 */
export function rankBySignificance<
  T extends { significance?: string; overallScore?: number; cohesionScore?: number },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const sigA = SIGNIFICANCE_WEIGHTS[a.significance ?? ''] ?? 0;
    const sigB = SIGNIFICANCE_WEIGHTS[b.significance ?? ''] ?? 0;
    if (sigA !== sigB) return sigB - sigA;
    const scoreA = a.overallScore ?? a.cohesionScore ?? 0;
    const scoreB = b.overallScore ?? b.cohesionScore ?? 0;
    return scoreB - scoreA;
  });
}

/**
 * Build an HTML section element for displaying intelligence items as a list.
 * All title, className, and item strings are HTML-escaped to prevent XSS.
 * Returns an empty string when the items array is empty.
 *
 * @param title - Section heading text (will be HTML-escaped)
 * @param items - Array of text items to display as list entries (will be HTML-escaped)
 * @param className - CSS class name for the section element (will be HTML-escaped)
 * @returns HTML string for the intelligence section, or empty string if no items
 */
export function buildIntelligenceSection(title: string, items: string[], className: string): string {
  if (items.length === 0) return '';
  const safeClass = escapeHTML(className);
  const safeTitle = escapeHTML(title);
  const itemsHtml = items.map((item) => `<li>${escapeHTML(item)}</li>`).join('\n          ');
  return `<section class="${safeClass}">
        <h2>${safeTitle}</h2>
        <ul>
          ${itemsHtml}
        </ul>
      </section>`;
}
