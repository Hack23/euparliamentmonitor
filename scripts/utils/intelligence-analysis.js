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
    if (!Array.isArray(val))
        return [];
    return val.filter((v) => typeof v === 'string');
}
/**
 * Coerce an unknown value to a non-null Record or return null
 *
 * @param input - Value to cast
 * @returns Record or null for null/undefined/non-object input
 */
function toRecord(input) {
    if (input === null || input === undefined || typeof input !== 'object')
        return null;
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
    if (!a)
        return null;
    const anomalyId = asStr(a['anomalyId']) || asStr(a['id']);
    if (!anomalyId)
        return null;
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
    if (!c)
        return null;
    const coalitionId = asStr(c['coalitionId']) || asStr(c['id']);
    if (!coalitionId)
        return null;
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
    if (!m)
        return null;
    const mepId = asStr(m['mepId']) || asStr(m['id']);
    const mepName = asStr(m['mepName']) || asStr(m['name']);
    if (!mepId || !mepName)
        return null;
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
    if (!p)
        return null;
    const procedureId = asStr(p['procedureId']) || asStr(p['id']);
    const title = asStr(p['title']);
    if (!procedureId || !title)
        return null;
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
        if (sigA !== sigB)
            return sigB - sigA;
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
    if (items.length === 0)
        return '';
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
    if (score >= 0.7)
        return 'high';
    if (score >= 0.4)
        return 'medium';
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
            impact: score >= 0.6
                ? 'positive'
                : score <= 0.3
                    ? 'negative'
                    : 'neutral',
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
    if (!d)
        return null;
    const stakeholderRaw = asStr(d['stakeholder']);
    if (!ALL_STAKEHOLDER_TYPES.includes(stakeholderRaw))
        return null;
    const stakeholder = stakeholderRaw;
    const impactRaw = asStr(d['impact']).toLowerCase();
    const validImpacts = ['positive', 'negative', 'neutral', 'mixed'];
    const impact = validImpacts.includes(impactRaw)
        ? impactRaw
        : 'neutral';
    const severityRaw = asStr(d['severity']).toLowerCase();
    const validSeverities = ['high', 'medium', 'low'];
    const severity = validSeverities.includes(severityRaw)
        ? severityRaw
        : 'medium';
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
    const outcomes = Object.fromEntries(ALL_STAKEHOLDER_TYPES.map((stakeholder) => {
        const score = scores[stakeholder] ?? 0.5;
        const outcome = score > 0.6 ? 'winner' : score < 0.4 ? 'loser' : 'neutral';
        return [stakeholder, outcome];
    }));
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
        if (sw !== 0)
            return sw;
        const iw = impactWeight[b.impact] - impactWeight[a.impact];
        if (iw !== 0)
            return iw;
        // Deterministic tie-breaker: canonical ALL_STAKEHOLDER_TYPES order
        return (ALL_STAKEHOLDER_TYPES.indexOf(a.stakeholder) - ALL_STAKEHOLDER_TYPES.indexOf(b.stakeholder));
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
 * @returns VotingIntensity metrics, or null if records array is empty
 */
export function computeVotingIntensity(records) {
    if (records.length === 0)
        return null;
    let totalUnanimity = 0;
    let totalPolarization = 0;
    let totalMargin = 0;
    let closeVoteCount = 0;
    let decisiveVoteCount = 0;
    for (const record of records) {
        const total = record.votes.for + record.votes.against + record.votes.abstain;
        if (total === 0)
            continue;
        const forPct = record.votes.for / total;
        const againstPct = record.votes.against / total;
        const margin = Math.abs(forPct - againstPct);
        // Unanimity: how close is the largest faction to 100%?
        const maxPct = Math.max(forPct, againstPct);
        totalUnanimity += maxPct;
        // Polarization: how evenly split is for vs against? (excluding abstentions)
        const forAgainstTotal = record.votes.for + record.votes.against;
        if (forAgainstTotal > 0) {
            const balance = Math.min(record.votes.for, record.votes.against) / forAgainstTotal;
            totalPolarization += balance * 2; // normalise: 0 = one-sided, 1 = perfectly split
        }
        totalMargin += margin;
        if (margin < 0.1)
            closeVoteCount++;
        if (margin > 0.6)
            decisiveVoteCount++;
    }
    const n = records.length;
    return {
        unanimity: Math.round((totalUnanimity / n) * 100) / 100,
        polarization: Math.round((totalPolarization / n) * 100) / 100,
        averageMargin: Math.round((totalMargin / n) * 100) / 100,
        closeVoteCount,
        decisiveVoteCount,
    };
}
/**
 * Detect coalition shifts by comparing current cohesion patterns against
 * a baseline. A shift is flagged when cohesion changes significantly
 * (>10% delta), suggesting evolving internal dynamics.
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
        if (delta > 0.05)
            direction = 'strengthening';
        else if (delta < -0.05)
            direction = 'weakening';
        else
            direction = 'stable';
        let significance;
        if (absDelta > 0.2)
            significance = 'critical';
        else if (absDelta > 0.1)
            significance = 'high';
        else if (absDelta > 0.05)
            significance = 'medium';
        else
            significance = 'low';
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
        if (sigDiff !== 0)
            return sigDiff;
        return Math.abs(b.cohesionDelta) - Math.abs(a.cohesionDelta);
    });
}
/**
 * Compute a polarization index for a parliamentary period based on
 * voting pattern cohesion data. Uses a Laakso-Taagepera–inspired
 * "effective number of blocs" calculation alongside cohesion analysis.
 *
 * @param patterns - Voting patterns for the period
 * @returns PolarizationIndex assessment, or null if patterns are empty
 */
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
        if (p.cohesion > 0.8)
            high.push(p.group);
        if (p.cohesion < 0.5)
            fragmented.push(p.group);
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
    for (const p of patterns)
        totalParticipation += p.participation;
    if (totalParticipation <= 0)
        return patterns.length;
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
    if (index >= 0.75)
        return 'highly-polarized';
    if (index >= 0.5)
        return 'polarized';
    if (index >= 0.25)
        return 'moderate';
    return 'consensus';
}
export function computePolarizationIndex(patterns) {
    if (patterns.length === 0)
        return null;
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
//# sourceMappingURL=intelligence-analysis.js.map