// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/IntelligenceAnalysis
 * @description Pure intelligence analysis utility functions for structured
 * assessment of European Parliament data. All functions are stateless and
 * safely handle malformed or missing MCP data. No side effects.
 */
import { escapeHTML } from './file-utils.js';
import { ALL_STAKEHOLDER_TYPES } from '../types/index.js';
// ─── Validation constants ─────────────────────────────────────────────────────
/** Valid significance levels in descending priority order */
const SIGNIFICANCE_LEVELS = ['critical', 'high', 'medium', 'low'];
/** Valid risk levels for coalition and bottleneck assessment */
const RISK_LEVELS = ['high', 'medium', 'low'];
/** Valid alignment trend values */
const ALIGNMENT_TRENDS = ['strengthening', 'weakening', 'stable'];
/** Priority weights for significance-based ranking */
const SIGNIFICANCE_WEIGHTS = {
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
function asStr(val) {
  return typeof val === 'string' ? val : '';
}
/**
 * Safely extract a finite number from an unknown field value
 *
 * @param val - Unknown value to coerce
 * @param fallback - Value returned when input is not a finite number
 * @returns Finite number or fallback
 */
function asNum(val, fallback = 0) {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}
/**
 * Safely extract an array of strings from an unknown field value
 *
 * @param val - Unknown value to coerce
 * @returns Array of strings (empty array if input is not an array)
 */
function asStrArr(val) {
  if (!Array.isArray(val)) return [];
  return val.filter((v) => typeof v === 'string');
}
/**
 * Coerce an unknown value to a non-null Record or return null
 *
 * @param input - Value to cast
 * @returns Record or null for null/undefined/non-object input
 */
function toRecord(input) {
  if (input === null || input === undefined || typeof input !== 'object') return null;
  return input;
}
// ─── Private parsing validators ───────────────────────────────────────────────
/**
 * Validate and normalise a raw significance level string
 *
 * @param raw - Raw string from MCP data
 * @returns Validated SignificanceLevel, defaulting to 'low'
 */
function parseSignificance(raw) {
  const lower = raw.toLowerCase();
  return SIGNIFICANCE_LEVELS.includes(lower) ? lower : 'low';
}
/**
 * Validate and normalise a raw risk level string
 *
 * @param raw - Raw string from MCP data
 * @returns Validated RiskLevel, defaulting to 'medium'
 */
function parseRiskLevel(raw) {
  const lower = raw.toLowerCase();
  return RISK_LEVELS.includes(lower) ? lower : 'medium';
}
/**
 * Validate and normalise a raw alignment trend string
 *
 * @param raw - Raw string from MCP data
 * @returns Validated AlignmentTrend, defaulting to 'stable'
 */
function parseAlignmentTrend(raw) {
  const lower = raw.toLowerCase();
  return ALIGNMENT_TRENDS.includes(lower) ? lower : 'stable';
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
export function scoreVotingAnomaly(rawAnomaly) {
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
export function analyzeCoalitionCohesion(rawCoalition) {
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
export function scoreMEPInfluence(rawInfluence) {
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
export function calculateLegislativeVelocity(rawProcedure) {
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
export function rankBySignificance(items) {
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
export function buildIntelligenceSection(title, items, className) {
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
// ─── Stakeholder scoring functions ───────────────────────────────────────────
/**
 * Derive a severity level from a numeric 0-1 importance score.
 *
 * @param score - Normalised importance score (0 = least important, 1 = most)
 * @returns Severity level
 */
function severityFromScore(score) {
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}
/**
 * Build a default set of stakeholder perspectives for a parliamentary action.
 * Each perspective is seeded with a reasoning string and evidence items derived
 * from the provided topic and impact scores. All six stakeholder groups receive
 * a perspective entry.
 *
 * @param topic - Short description of the parliamentary action (e.g. vote title)
 * @param scores - Optional per-stakeholder importance scores (0-1); defaults to 0.5
 * @returns Array of six StakeholderPerspective objects, one per stakeholder group
 */
export function buildDefaultStakeholderPerspectives(topic, scores) {
  return ALL_STAKEHOLDER_TYPES.map((stakeholder) => {
    const score = scores?.[stakeholder] ?? 0.5;
    const severity = severityFromScore(score);
    return {
      stakeholder,
      impact: score >= 0.6 ? 'positive' : score <= 0.3 ? 'negative' : 'neutral',
      severity,
      reasoning: `Impact on this stakeholder group: ${severity} significance based on "${topic}".`,
      evidence: [topic],
    };
  });
}
/**
 * Score stakeholder influence from raw MCP data.
 * Returns null for null, undefined, non-object, or missing stakeholder type.
 *
 * @param rawData - Raw stakeholder influence data (unknown shape)
 * @returns Structured StakeholderPerspective or null if input is invalid
 */
export function scoreStakeholderInfluence(rawData) {
  const d = toRecord(rawData);
  if (!d) return null;
  const stakeholderRaw = asStr(d['stakeholder']);
  if (!ALL_STAKEHOLDER_TYPES.includes(stakeholderRaw)) return null;
  const stakeholder = stakeholderRaw;
  const impactRaw = asStr(d['impact']).toLowerCase();
  const validImpacts = ['positive', 'negative', 'neutral', 'mixed'];
  const impact = validImpacts.includes(impactRaw) ? impactRaw : 'neutral';
  const severityRaw = asStr(d['severity']).toLowerCase();
  const validSeverities = ['high', 'medium', 'low'];
  const severity = validSeverities.includes(severityRaw) ? severityRaw : 'medium';
  return {
    stakeholder,
    impact,
    severity,
    reasoning: asStr(d['reasoning']),
    evidence: asStrArr(d['evidence']),
  };
}
/**
 * Build a StakeholderOutcomeMatrix row for a single parliamentary action.
 * Derives outcomes from per-stakeholder scores: score > 0.6 → winner,
 * score < 0.4 → loser, otherwise neutral.
 *
 * @param action - The parliamentary action being assessed
 * @param scores - Per-stakeholder importance scores (0-1); defaults to 0.5
 * @param confidence - Confidence level for the outcome assessments
 * @returns A StakeholderOutcomeMatrix row
 */
export function buildStakeholderOutcomeMatrix(action, scores = {}, confidence = 'medium') {
  const outcomes = Object.fromEntries(
    ALL_STAKEHOLDER_TYPES.map((stakeholder) => {
      const score = scores[stakeholder] ?? 0.5;
      const outcome = score > 0.6 ? 'winner' : score < 0.4 ? 'loser' : 'neutral';
      return [stakeholder, outcome];
    })
  );
  return { action, outcomes, confidence };
}
/**
 * Map an array of StakeholderPerspective objects to a simple influence ranking.
 * Returns stakeholder types sorted by severity (high → medium → low), then by
 * impact direction (negative before positive, as negative impacts require more
 * political attention).
 *
 * @param perspectives - Array of stakeholder perspectives to rank
 * @returns Stakeholder types sorted by influence priority
 */
export function rankStakeholdersByInfluence(perspectives) {
  const severityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };
  const impactWeight = {
    negative: 3,
    mixed: 2,
    positive: 1,
    neutral: 0,
  };
  return [...perspectives]
    .sort((a, b) => {
      const sw = severityWeight[b.severity] - severityWeight[a.severity];
      if (sw !== 0) return sw;
      const iw = impactWeight[b.impact] - impactWeight[a.impact];
      if (iw !== 0) return iw;
      // Deterministic tie-breaker: canonical ALL_STAKEHOLDER_TYPES order
      return (
        ALL_STAKEHOLDER_TYPES.indexOf(a.stakeholder) - ALL_STAKEHOLDER_TYPES.indexOf(b.stakeholder)
      );
    })
    .map((p) => p.stakeholder);
}
// ─── Advanced political intelligence functions ──────────────────────────────
/**
 * Compute voting intensity metrics from a set of voting records.
 * Analyses the distribution of for/against/abstain votes to determine
 * unanimity, polarization, and margin characteristics.
 *
 * @param records - Voting records to analyse
 * @returns VotingIntensity metrics, or null if the records array is empty or contains no
 * valid vote counts (for example, when all records have a total vote count of 0)
 */
export function computeVotingIntensity(records) {
  if (records.length === 0) return null;
  let totalUnanimity = 0;
  let totalPolarization = 0;
  let totalMargin = 0;
  let closeVoteCount = 0;
  let decisiveVoteCount = 0;
  let validCount = 0;
  let polarizationCount = 0;
  for (const record of records) {
    const total = record.votes.for + record.votes.against + record.votes.abstain;
    if (total === 0) continue;
    validCount++;
    const forPct = record.votes.for / total;
    const againstPct = record.votes.against / total;
    const abstainPct = record.votes.abstain / total;
    const margin = Math.abs(forPct - againstPct);
    // Largest-position share: max share among for/against/abstain
    const maxPct = Math.max(forPct, againstPct, abstainPct);
    totalUnanimity += maxPct;
    // Margin, close/decisive, and polarization only meaningful when for+against > 0
    const forAgainstTotal = record.votes.for + record.votes.against;
    if (forAgainstTotal > 0) {
      polarizationCount++;
      const balance = Math.min(record.votes.for, record.votes.against) / forAgainstTotal;
      totalPolarization += balance * 2; // normalise: 0 = one-sided, 1 = perfectly split
      totalMargin += margin;
      if (margin < 0.1) closeVoteCount++;
      if (margin > 0.6) decisiveVoteCount++;
    }
  }
  if (validCount === 0) return null;
  return {
    unanimity: Math.round((totalUnanimity / validCount) * 100) / 100,
    polarization:
      polarizationCount > 0 ? Math.round((totalPolarization / polarizationCount) * 100) / 100 : 0,
    averageMargin:
      polarizationCount > 0 ? Math.round((totalMargin / polarizationCount) * 100) / 100 : 0,
    closeVoteCount,
    decisiveVoteCount,
  };
}
/**
 * Detect coalition shifts by comparing current cohesion patterns against
 * a baseline. Stability threshold is ±5%; severity tiers are >5% (medium),
 * >10% (high), and >20% (critical).
 *
 * @param currentPatterns - Current period voting patterns
 * @param baselinePatterns - Previous period patterns (or estimated baseline)
 * @returns Array of detected coalition shifts, sorted by significance
 */
export function detectCoalitionShifts(currentPatterns, baselinePatterns) {
  const baselineMap = new Map();
  for (const bp of baselinePatterns) {
    baselineMap.set(bp.group, bp.cohesion);
  }
  const shifts = [];
  for (const current of currentPatterns) {
    const previous = baselineMap.get(current.group) ?? current.cohesion;
    const delta = current.cohesion - previous;
    const absDelta = Math.abs(delta);
    let direction;
    if (delta > 0.05) direction = 'strengthening';
    else if (delta < -0.05) direction = 'weakening';
    else direction = 'stable';
    let significance;
    if (absDelta > 0.2) significance = 'critical';
    else if (absDelta > 0.1) significance = 'high';
    else if (absDelta > 0.05) significance = 'medium';
    else significance = 'low';
    shifts.push({
      group: current.group,
      previousCohesion: Math.round(previous * 100) / 100,
      currentCohesion: Math.round(current.cohesion * 100) / 100,
      cohesionDelta: Math.round(delta * 100) / 100,
      direction,
      significance,
    });
  }
  // Sort by significance (critical first), then by absolute delta descending
  const sigOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  return shifts.sort((a, b) => {
    const sigDiff = (sigOrder[b.significance] ?? 0) - (sigOrder[a.significance] ?? 0);
    if (sigDiff !== 0) return sigDiff;
    return Math.abs(b.cohesionDelta) - Math.abs(a.cohesionDelta);
  });
}
/**
 * Classify cohesion groups into high-cohesion and fragmented categories.
 *
 * @param patterns - Voting patterns
 * @returns Tuple of [highCohesionGroups, fragmentedGroups]
 */
function classifyCohesionGroups(patterns) {
  const high = [];
  const fragmented = [];
  for (const p of patterns) {
    if (p.cohesion > 0.8) high.push(p.group);
    if (p.cohesion < 0.5) fragmented.push(p.group);
  }
  return [high, fragmented];
}
/**
 * Compute effective number of voting blocs using Laakso-Taagepera style.
 *
 * @param patterns - Voting patterns
 * @returns Effective number of blocs
 */
function computeEffectiveBlocs(patterns) {
  let totalParticipation = 0;
  for (const p of patterns) totalParticipation += p.participation;
  if (totalParticipation <= 0) return patterns.length;
  let sumSquares = 0;
  for (const p of patterns) {
    const share = p.participation / totalParticipation;
    sumSquares += share * share;
  }
  return sumSquares > 0 ? 1 / sumSquares : patterns.length;
}
/**
 * Map an overall index to a polarization assessment label.
 *
 * @param index - Polarization index (0-1)
 * @returns Assessment label
 */
function assessPolarization(index) {
  if (index >= 0.75) return 'highly-polarized';
  if (index >= 0.5) return 'polarized';
  if (index >= 0.25) return 'moderate';
  return 'consensus';
}
/**
 * Compute a polarization index for a parliamentary period based on
 * voting pattern cohesion data. Uses a Laakso-Taagepera–inspired
 * "effective number of blocs" calculation alongside cohesion analysis.
 *
 * @param patterns - Voting patterns for the period
 * @returns PolarizationIndex assessment, or null if patterns are empty
 */
export function computePolarizationIndex(patterns) {
  if (patterns.length === 0) return null;
  const [highCohesionGroups, fragmentedGroups] = classifyCohesionGroups(patterns);
  const effectiveBlocs = computeEffectiveBlocs(patterns);
  const extremeCount = highCohesionGroups.length + fragmentedGroups.length;
  const overallIndex = Math.round((extremeCount / patterns.length) * 100) / 100;
  return {
    overallIndex,
    effectiveBlocs: Math.round(effectiveBlocs * 100) / 100,
    highCohesionGroups,
    fragmentedGroups,
    assessment: assessPolarization(overallIndex),
  };
}
// ─── Cross-session analysis functions ─────────────────────────────────────────
/**
 * Compute average of a numeric array.
 *
 * @param values - Array of numbers
 * @returns Arithmetic mean, or 0 for empty arrays
 */
function avg(values) {
  return values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
}
/**
 * Extract valid vote margins and result tallies from voting records.
 * Skips records with missing/malformed vote data, non-finite or negative
 * vote counts, or where for + against is zero (abstain-only votes) to avoid
 * skewing margin and polarization calculations. Only records where
 * `votes.for` and `votes.against` are finite, non-negative numbers are used;
 * numeric-string encodings and other non-numeric values are ignored.
 *
 * @param records - Voting records to process
 * @returns Object containing margins array and per-record result classifications
 */
function extractMarginData(records) {
  const margins = [];
  const results = [];
  for (const r of records) {
    const votes = r.votes;
    if (!votes || typeof votes !== 'object') continue;
    // Require actual finite numbers — asNum() would silently map non-numbers to 0,
    // which would include malformed records and skew margins/polarization metrics.
    const forCount = votes.for;
    const againstCount = votes.against;
    if (typeof forCount !== 'number' || !Number.isFinite(forCount) || forCount < 0) continue;
    if (typeof againstCount !== 'number' || !Number.isFinite(againstCount) || againstCount < 0)
      continue;
    const forAgainstTotal = forCount + againstCount;
    if (forAgainstTotal <= 0) continue;
    margins.push(Math.abs(forCount - againstCount) / forAgainstTotal);
    const result = asStr(r.result).toLowerCase();
    if (result === 'adopted' || result === 'approved') {
      results.push('adopted');
    } else if (result === 'rejected') {
      results.push('rejected');
    } else {
      results.push('other');
    }
  }
  return { margins, results };
}
/**
 * Compute adoption rate from a results slice.
 *
 * @param results - Array of result classifications
 * @returns Adoption rate (0-1), or 0 if no decided records
 */
function computeAdoptionRate(results) {
  const adopted = results.filter((r) => r === 'adopted').length;
  const decided = results.filter((r) => r === 'adopted' || r === 'rejected').length;
  return decided > 0 ? adopted / decided : 0;
}
/**
 * Derive adoption-rate direction by comparing first-half and second-half rates.
 *
 * @param firstRate - Adoption rate of the first chronological half
 * @param secondRate - Adoption rate of the second chronological half
 * @returns Direction label based on delta between halves
 */
function adoptionDirection(firstRate, secondRate) {
  const delta = secondRate - firstRate;
  if (delta > 0.05) return 'increasing';
  if (delta < -0.05) return 'decreasing';
  return 'stable';
}
/**
 * Build a margin-shift trend if the delta exceeds 5%.
 *
 * @param firstHalf - Margins from the first half of records
 * @param secondHalf - Margins from the second half of records
 * @param total - Total number of valid records
 * @returns VotingTrend or null if delta is within threshold
 */
function buildMarginTrend(firstHalf, secondHalf, total) {
  const marginDelta = avg(secondHalf) - avg(firstHalf);
  if (Math.abs(marginDelta) <= 0.05) return null;
  const isIncreasing = marginDelta > 0;
  return {
    trendId: isIncreasing ? 'increasing-margins' : 'decreasing-margins',
    description: isIncreasing
      ? 'Voting margins are widening — greater decisiveness'
      : 'Voting margins are narrowing — increasing contention',
    direction: isIncreasing ? 'increasing' : 'decreasing',
    confidence: Math.min(1, Math.round(Math.abs(marginDelta) * 5 * 100) / 100),
    recordCount: total,
    metricValue: Math.round(marginDelta * 100) / 100,
  };
}
/**
 * Build a polarization trend if the close-vote frequency delta exceeds 10%.
 *
 * @param firstHalf - Margins from the first half of records
 * @param secondHalf - Margins from the second half of records
 * @param total - Total number of valid records
 * @returns VotingTrend or null if delta is within threshold
 */
function buildPolarizationTrend(firstHalf, secondHalf, total) {
  const closeFirst = firstHalf.filter((m) => m < 0.1).length / firstHalf.length;
  const closeSecond = secondHalf.filter((m) => m < 0.1).length / secondHalf.length;
  const closeDelta = closeSecond - closeFirst;
  if (Math.abs(closeDelta) <= 0.1) return null;
  const isIncreasing = closeDelta > 0;
  return {
    trendId: isIncreasing ? 'increasing-polarization' : 'decreasing-polarization',
    description: isIncreasing
      ? 'More close votes detected — increasing polarization'
      : 'Fewer close votes — declining polarization',
    direction: isIncreasing ? 'increasing' : 'decreasing',
    confidence: Math.min(1, Math.round(Math.abs(closeDelta) * 3 * 100) / 100),
    recordCount: total,
    metricValue: Math.round(closeDelta * 100) / 100,
  };
}
/**
 * Detect voting trends across multiple voting records by analysing
 * margin distribution, polarization patterns, and result consistency.
 * Records are sorted by date (ascending) before analysis to ensure
 * chronological trend detection. Returns an array of detected trends
 * sorted by confidence.
 *
 * @param records - Voting records to analyse across sessions
 * @returns Array of detected VotingTrend objects (empty if fewer than 2 valid records)
 */
export function detectVotingTrends(records) {
  if (records.length < 2) return [];
  const toTimestamp = (d) => {
    const t = Date.parse(d ?? '');
    return Number.isFinite(t) ? t : Infinity;
  };
  const sorted = [...records].sort((a, b) => {
    const ta = toTimestamp(a.date);
    const tb = toTimestamp(b.date);
    if (ta === tb) return 0;
    return ta < tb ? -1 : 1;
  });
  const { margins, results } = extractMarginData(sorted);
  if (margins.length < 2) return [];
  const mid = Math.floor(margins.length / 2);
  const firstHalf = margins.slice(0, mid);
  const secondHalf = margins.slice(mid);
  const trends = [];
  const marginTrend = buildMarginTrend(firstHalf, secondHalf, margins.length);
  if (marginTrend) trends.push(marginTrend);
  const polTrend = buildPolarizationTrend(firstHalf, secondHalf, margins.length);
  if (polTrend) trends.push(polTrend);
  const firstResults = results.slice(0, mid);
  const secondResults = results.slice(mid);
  const totalDecided = results.filter((r) => r === 'adopted' || r === 'rejected').length;
  if (totalDecided > 0) {
    const overallRate = computeAdoptionRate(results);
    const firstRate = computeAdoptionRate(firstResults);
    const secondRate = computeAdoptionRate(secondResults);
    trends.push({
      trendId: 'adoption-rate',
      description: `Adoption rate is ${Math.round(overallRate * 100)}% across ${totalDecided} decided votes`,
      direction: adoptionDirection(firstRate, secondRate),
      confidence: Math.min(1, Math.round((totalDecided / margins.length) * 100) / 100),
      recordCount: totalDecided,
      metricValue: Math.round(overallRate * 100) / 100,
    });
  }
  return trends.sort((a, b) => b.confidence - a.confidence);
}
/**
 * Compute cross-session coalition stability by analysing average cohesion
 * across a set of voting patterns. Groups with high cohesion are reported
 * as stable; those with low cohesion are flagged.
 *
 * @param patterns - Voting patterns from multiple sessions
 * @returns CoalitionStabilityReport (empty report if no patterns)
 */
export function computeCrossSessionCoalitionStability(patterns) {
  if (patterns.length === 0) {
    return {
      overallStability: 0,
      patternCount: 0,
      stableGroups: [],
      decliningGroups: [],
      forecast: 'volatile',
    };
  }
  // Aggregate cohesion per group, coercing and clamping to [0, 1]
  const groupCohesions = new Map();
  let includedPatterns = 0;
  for (const p of patterns) {
    const groupKey = asStr(p.group).trim();
    if (groupKey.length === 0) continue;
    includedPatterns++;
    const raw = asNum(p.cohesion);
    const clamped = Math.max(0, Math.min(1, raw));
    const existing = groupCohesions.get(groupKey);
    if (existing) {
      existing.push(clamped);
    } else {
      groupCohesions.set(groupKey, [clamped]);
    }
  }
  const stableGroups = [];
  const decliningGroups = [];
  let totalAvgCohesion = 0;
  let groupCount = 0;
  for (const [group, cohesions] of groupCohesions) {
    const avgCohesion = cohesions.reduce((s, v) => s + v, 0) / cohesions.length;
    totalAvgCohesion += avgCohesion;
    groupCount++;
    if (avgCohesion >= 0.7) {
      stableGroups.push(group);
    } else if (avgCohesion < 0.5) {
      decliningGroups.push(group);
    }
  }
  const overallStability =
    groupCount > 0 ? Math.round((totalAvgCohesion / groupCount) * 100) / 100 : 0;
  let forecast;
  if (overallStability >= 0.7) forecast = 'stable';
  else if (overallStability >= 0.5) forecast = 'at-risk';
  else forecast = 'volatile';
  return {
    overallStability,
    patternCount: includedPatterns,
    stableGroups,
    decliningGroups,
    forecast,
  };
}
/**
 * Rank MEP influence scores filtered by topic relevance.
 * Matches scores whose mepName, mepId, or rank contains the topic substring
 * (case-insensitive). Returns the filtered list sorted by overallScore
 * descending. If topic is empty or no matches found, returns all scores
 * sorted by overallScore.
 *
 * @param scores - MEP influence scores to rank
 * @param topic - Topic keyword to filter by; if null/undefined/empty, all
 * scores are returned sorted by overallScore
 * @returns Sorted array of matching MEPInfluenceScore entries
 */
export function rankMEPInfluenceByTopic(scores, topic) {
  if (scores.length === 0) return [];
  const lowerTopic = String(topic ?? '')
    .toLowerCase()
    .trim();
  const getSafeScore = (entry) => {
    const raw = asNum(entry.overallScore);
    return Number.isFinite(raw) ? raw : 0;
  };
  // If topic is empty, return all sorted by score
  if (lowerTopic.length === 0) {
    return [...scores].sort((a, b) => getSafeScore(b) - getSafeScore(a));
  }
  const matched = scores.filter((s) => {
    const safeName = typeof s.mepName === 'string' ? s.mepName.toLowerCase() : '';
    const safeRank = typeof s.rank === 'string' ? s.rank.toLowerCase() : '';
    const safeId = typeof s.mepId === 'string' ? s.mepId.toLowerCase() : '';
    return (
      safeName.includes(lowerTopic) || safeRank.includes(lowerTopic) || safeId.includes(lowerTopic)
    );
  });
  // If no matches, return all sorted
  const pool = matched.length > 0 ? matched : [...scores];
  return pool.sort((a, b) => getSafeScore(b) - getSafeScore(a));
}
/**
 * Count stages whose document count exceeds 1.5× the average (bottlenecks).
 *
 * @param stageValues - Array of per-stage document counts
 * @returns Number of bottleneck stages
 */
function countBottleneckStages(stageValues) {
  if (stageValues.length === 0) return 0;
  const avgPerStage = stageValues.reduce((s, v) => s + v, 0) / stageValues.length;
  let count = 0;
  for (const val of stageValues) {
    if (val > avgPerStage * 1.5 && val > 1) count++;
  }
  return count;
}
/**
 * Compute average days per stage from a set of valid timestamps and the
 * number of stages. Returns 0 when fewer than 2 dates are available.
 *
 * @param dates - Array of valid timestamp numbers (ms since epoch)
 * @param stageCount - Number of distinct stages
 * @returns Estimated average days per stage (rounded)
 */
function computeDaysPerStage(dates, stageCount) {
  if (dates.length < 2 || stageCount <= 0) return 0;
  let minDate = dates[0];
  let maxDate = dates[0];
  for (let i = 1; i < dates.length; i++) {
    const current = dates[i];
    if (current < minDate) minDate = current;
    if (current > maxDate) maxDate = current;
  }
  const spanDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  return Math.round(spanDays / stageCount);
}
/**
 * Determine throughput assessment label based on date availability and
 * average days per stage.
 *
 * @param hasDateData - Whether sufficient date data was available
 * @param avgDays - Average days per stage
 * @returns Throughput label: 'fast', 'normal', or 'slow'
 */
function assessThroughput(hasDateData, avgDays) {
  if (!hasDateData) return 'normal';
  if (avgDays <= 30) return 'fast';
  if (avgDays <= 90) return 'normal';
  return 'slow';
}
/**
 * Build a legislative velocity report with stage-by-stage breakdown from
 * a set of legislative documents. Analyses document status distribution
 * and identifies potential bottlenecks.
 *
 * @param docs - Legislative documents to analyse
 * @returns LegislativeVelocityReport summary
 */
export function buildLegislativeVelocityReport(docs) {
  if (docs.length === 0) {
    return {
      documentCount: 0,
      stageBreakdown: Object.create(null),
      averageDaysPerStage: 0,
      bottleneckCount: 0,
      throughputAssessment: assessThroughput(false, 0),
    };
  }
  const stageBreakdown = Object.create(null);
  for (const doc of docs) {
    const status = typeof doc.status === 'string' ? doc.status.trim() : '';
    const type = typeof doc.type === 'string' ? doc.type.trim() : '';
    const rawStage = status || type || 'Unknown';
    const stage =
      rawStage === '__proto__' || rawStage === 'constructor' || rawStage === 'prototype'
        ? 'Unknown'
        : rawStage;
    stageBreakdown[stage] = (stageBreakdown[stage] ?? 0) + 1;
  }
  const bottleneckCount = countBottleneckStages(Object.values(stageBreakdown));
  const dates = docs
    .map((d) => (d.date ? new Date(d.date).getTime() : NaN))
    .filter((t) => !Number.isNaN(t));
  const hasDateData = dates.length >= 2;
  const averageDaysPerStage = computeDaysPerStage(dates, Object.keys(stageBreakdown).length);
  return {
    documentCount: docs.length,
    stageBreakdown,
    averageDaysPerStage,
    bottleneckCount,
    throughputAssessment: assessThroughput(hasDateData, averageDaysPerStage),
  };
}
//# sourceMappingURL=intelligence-analysis.js.map
