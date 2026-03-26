// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// @generated This file is compiled to scripts/utils/political-threat-assessment.js. DO NOT EDIT generated output directly.
// ─── Constants ─────────────────────────────────────────────────────────────────
/** All Political STRIDE categories in canonical order */
const ALL_STRIDE_CATEGORIES = [
  'shift',
  'transparency',
  'reversal',
  'institutional',
  'delay',
  'erosion',
];
/** All legislative stages in procedural order */
const ALL_LEGISLATIVE_STAGES = [
  'proposal',
  'committee',
  'plenary_first_reading',
  'council_position',
  'plenary_second_reading',
  'conciliation',
  'adoption',
];
/** Numeric weights for impact levels (used in composite scoring) */
const IMPACT_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
/** Display labels for Political STRIDE categories */
const STRIDE_LABELS = {
  shift: 'Coalition Shifts (S)',
  transparency: 'Transparency Concerns (T)',
  reversal: 'Policy Reversals (R)',
  institutional: 'Institutional Threats (I)',
  delay: 'Legislative Delays (D)',
  erosion: 'Democratic Erosion (E)',
};
/** Emoji threat level indicators for markdown output */
const THREAT_EMOJIS = {
  critical: '🔴',
  high: '🟠',
  medium: '⚠️',
  low: '🟢',
};
// ─── Private helpers ───────────────────────────────────────────────────────────
/**
 * Safely extract a string from an unknown value.
 *
 * @param val - Unknown value to coerce
 * @returns String value or empty string
 */
function asStr(val) {
  return typeof val === 'string' ? val : '';
}
/**
 * Safely extract a finite number from an unknown value.
 *
 * @param val - Unknown value to coerce
 * @param fallback - Default value when input is not a finite number
 * @returns Finite number or fallback
 */
function asNum(val, fallback = 0) {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}
/**
 * Safely extract an array of strings from an unknown value.
 *
 * @param val - Unknown value to coerce
 * @returns Array of strings, empty if input is not an array
 */
function asStrArr(val) {
  if (!Array.isArray(val)) return [];
  return val.filter((v) => typeof v === 'string');
}
/**
 * Coerce an unknown value to a non-null Record or return null.
 *
 * @param input - Value to cast
 * @returns Record or null
 */
function toRecord(input) {
  if (input === null || input === undefined || typeof input !== 'object' || Array.isArray(input))
    return null;
  return input;
}
/**
 * Coerce a value to an array, returning `[]` if it is not an actual array.
 *
 * Guards against malformed input where a field expected to be an array is
 * instead a string, object, number, or other non-array type.
 *
 * @param val - Value that should be an array
 * @returns The value itself if it is an array, otherwise `[]`
 */
function safeArray(val) {
  return Array.isArray(val) ? val : [];
}
/**
 * Resolve the voting anomaly array from a `ThreatAssessmentInput`.
 *
 * The real MCP pipeline exposes voting anomalies under the field `anomalies`,
 * while the original type used `votingAnomalies`. This helper reads from
 * `anomalies` first, falling back to `votingAnomalies` for backward compat.
 * Both fields are validated as arrays; non-array values are treated as empty.
 *
 * @param data - Article / threat-assessment data (may be null)
 * @returns Readonly array of anomaly items, never null
 */
function resolveAnomalies(data) {
  const anomalies = data?.anomalies;
  const votingAnomalies = data?.votingAnomalies;
  if (Array.isArray(anomalies)) {
    return anomalies;
  }
  if (Array.isArray(votingAnomalies)) {
    return votingAnomalies;
  }
  return [];
}
/**
 * Create a type-safe readonly array of {@link PoliticalActorType} values.
 *
 * Replaces `[...] as PoliticalActorType[]` casts with compile-time validation
 * so that invalid stakeholder strings are caught during development.
 *
 * @param actors - One or more actor type literals
 * @returns Readonly array of validated PoliticalActorType values
 */
function stakeholders(...actors) {
  return actors;
}
/**
 * Compute the summed composite of CMO (capability + motivation + opportunity).
 * Each dimension is scored: high=3, medium=2, low=1. Max composite = 9, min = 3.
 *
 * @param capability - Capability level
 * @param motivation - Motivation level
 * @param opportunity - Opportunity level
 * @returns Composite score (3–9)
 */
function cmoScore(capability, motivation, opportunity) {
  const levelMap = { high: 3, medium: 2, low: 1 };
  return levelMap[capability] + levelMap[motivation] + levelMap[opportunity];
}
/**
 * Derive overall threat level from a CMO composite score.
 *
 * @param score - CMO composite score (3–9)
 * @returns Impact level classification
 */
function cmoToThreatLevel(score) {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}
/**
 * Derive overall threat level from weighted average of impact levels.
 *
 * Computes the arithmetic mean of numeric impact weights and maps the result
 * back to an ImpactLevel using threshold bands: ≥3.5→critical, ≥2.5→high,
 * ≥1.5→medium, else→low.
 *
 * @param levels - Array of impact levels to aggregate
 * @returns Weighted-average impact level
 */
function aggregateImpactLevels(levels) {
  if (levels.length === 0) return 'low';
  const avg = levels.reduce((sum, l) => sum + IMPACT_WEIGHTS[l], 0) / levels.length;
  if (avg >= 3.5) return 'critical';
  if (avg >= 2.5) return 'high';
  if (avg >= 1.5) return 'medium';
  return 'low';
}
/**
 * Clamp a probability value to the valid range [0, 1].
 *
 * @param p - Probability to clamp
 * @returns Clamped value in [0, 1]
 */
function clampProbability(p) {
  return Math.max(0, Math.min(1, p));
}
// ─── STRIDE helper extractors ──────────────────────────────────────────────
/**
 * Convert a raw numeric threat score (1–3) to an ImpactLevel.
 *
 * STRIDE scanner helpers operate on a 1–3 scale where 1=low, 2=medium,
 * 3=high. Any value ≥3 is treated as `high` in this layer; the `critical`
 * impact level is reserved for higher-level analyses (e.g., actor profiles
 * or aggregated assessments) that assign `critical` directly.
 *
 * @param threatScore - Numeric score: 1=low, 2=medium, ≥3=high
 * @returns Corresponding impact level
 */
function scoreToImpact(threatScore) {
  if (threatScore >= 3) return 'high';
  if (threatScore === 2) return 'medium';
  return 'low';
}
/**
 * Build STRIDE result object with default evidence fallback.
 *
 * @param category - STRIDE category
 * @param threatScore - Raw numeric threat score
 * @param evidence - Collected evidence items
 * @param defaultEvidence - Fallback evidence when array is empty
 * @param lowAnalysis - Analysis text when threat is low
 * @param elevatedAnalysis - Analysis text when threat is elevated
 * @returns PoliticalStrideCategory result
 */
function buildStrideResult(
  category,
  threatScore,
  evidence,
  defaultEvidence,
  lowAnalysis,
  elevatedAnalysis
) {
  const threatLevel = scoreToImpact(threatScore);
  return {
    category,
    threatLevel,
    evidence: evidence.length > 0 ? evidence : [defaultEvidence],
    analysis: threatLevel === 'low' ? lowAnalysis : elevatedAnalysis(threatLevel),
  };
}
/**
 * Scan anomalies for shift signals and update evidence and score.
 *
 * @param anomalies - Voting anomaly data
 * @param evidence - Evidence array to mutate
 * @returns Updated threat score contribution
 */
function scanAnomaliesForShift(anomalies, evidence) {
  if (anomalies.length === 0) return 1;
  evidence.push(
    `${anomalies.length} voting anomal${anomalies.length === 1 ? 'y' : 'ies'} detected`
  );
  return 2;
}
/**
 * Scan coalitions for shift signals and update evidence and score.
 *
 * @param coalitions - Coalition data
 * @param evidence - Evidence array to mutate
 * @returns Maximum threat score detected
 */
function scanCoalitionsForShift(coalitions, evidence) {
  let maxScore = 1;
  for (const coalition of coalitions) {
    const rec = toRecord(coalition);
    if (!rec) continue;
    const cohesion = asNum(rec['cohesionScore'], 1);
    const trend = asStr(rec['alignmentTrend']);
    if (cohesion < 0.7) {
      evidence.push(`Coalition cohesion below 70%: ${(cohesion * 100).toFixed(0)}%`);
      maxScore = Math.max(maxScore, 3);
    }
    if (trend === 'weakening') {
      evidence.push('Coalition alignment trend weakening');
      maxScore = Math.max(maxScore, 2);
    }
  }
  return maxScore;
}
/**
 * Scan committees for transparency signals and update evidence and score.
 *
 * @param committees - Committee data
 * @param evidence - Evidence array to mutate
 * @returns Maximum threat score detected
 */
function scanCommitteesForTransparency(committees, evidence) {
  if (committees.length === 0) {
    evidence.push('No committee activity data available — potential information gap');
    return 2;
  }
  let maxScore = 1;
  for (const committee of committees) {
    const rec = toRecord(committee);
    if (!rec) continue;
    if (asNum(rec['meetingCount'], 0) === 0) {
      evidence.push(
        `Committee with no recorded meetings: ${asStr(rec['committeeId'] ?? rec['name'])}`
      );
      maxScore = Math.max(maxScore, 2);
    }
  }
  return maxScore;
}
/**
 * Scan procedures for reversal signals and update evidence and score.
 *
 * @param procedures - Procedure data
 * @param evidence - Evidence array to mutate
 * @returns Maximum threat score detected
 */
function scanProceduresForReversal(procedures, evidence) {
  let maxScore = 1;
  for (const proc of procedures) {
    const rec = toRecord(proc);
    if (!rec) continue;
    const stage = asStr(rec['currentStage'] ?? rec['stage']);
    const status = asStr(rec['status']);
    if (status === 'stalled' || status === 'blocked') {
      evidence.push(`Procedure stalled: ${asStr(rec['procedureId'] ?? rec['id'])}`);
      maxScore = Math.max(maxScore, 3);
    }
    if (stage === 'conciliation') {
      evidence.push('Procedure in conciliation — risk of legislative compromise or reversal');
      maxScore = Math.max(maxScore, 2);
    }
  }
  return maxScore;
}
/**
 * Check feed data for adopted texts blockage signals.
 *
 * @param feedData - Feed data record (may be null)
 * @param procedureCount - Number of active procedures
 * @param evidence - Evidence array to mutate
 * @returns Threat score contribution
 */
function checkFeedAdoptedTexts(feedData, procedureCount, evidence) {
  if (!feedData) return 1;
  const adoptedTexts = Array.isArray(feedData['adoptedTexts']) ? feedData['adoptedTexts'] : [];
  if (adoptedTexts.length === 0 && procedureCount > 0) {
    evidence.push('Legislative procedures active but no adopted texts — possible blockage');
    return 2;
  }
  return 1;
}
/**
 * Compute MEP influence concentration score and update evidence.
 *
 * @param mepInfluence - MEP influence data
 * @param evidence - Evidence array to mutate
 * @returns Threat score contribution
 */
function checkMEPInfluenceConcentration(mepInfluence, evidence) {
  const scores = [];
  for (const mep of mepInfluence) {
    const rec = toRecord(mep);
    if (rec) scores.push(asNum(rec['overallScore'], 0));
  }
  if (scores.length === 0) return 1;
  const max = scores.reduce(
    (currentMax, value) => (value > currentMax ? value : currentMax),
    scores[0] ?? 0
  );
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  if (max > avg * 2.5) {
    evidence.push(
      `Highly concentrated MEP influence detected — top score ${max.toFixed(0)} vs avg ${avg.toFixed(0)}`
    );
    return 2;
  }
  return 1;
}
/**
 * Check feed data for MEP turnover risk.
 *
 * @param feedData - Feed data record (may be null)
 * @param evidence - Evidence array to mutate
 * @returns Threat score contribution
 */
function checkMEPTurnover(feedData, evidence) {
  if (!feedData) return 1;
  const incoming = Array.isArray(feedData['incomingMEPs']) ? feedData['incomingMEPs'] : [];
  if (incoming.length > 20) {
    evidence.push(
      `High MEP turnover: ${incoming.length} incoming MEPs — institutional continuity risk`
    );
    return 2;
  }
  return 1;
}
/**
 * Scan procedures for delay/stall signals and update evidence.
 *
 * @param procedures - Procedure data
 * @param evidence - Evidence array to mutate
 * @returns Maximum threat score detected
 */
function scanProceduresForDelay(procedures, evidence) {
  let maxScore = 1;
  for (const proc of procedures) {
    const rec = toRecord(proc);
    if (!rec) continue;
    if (asStr(rec['status']) === 'stalled') {
      const stage = asStr(rec['currentStage'] ?? rec['stage']);
      evidence.push(`Stalled procedure: ${asStr(rec['procedureId'] ?? rec['id'])} at ${stage}`);
      maxScore = Math.max(maxScore, 3);
    }
  }
  return maxScore;
}
/**
 * Scan anomalies for abstention-based delay signals.
 *
 * @param anomalies - Voting anomaly data
 * @param evidence - Evidence array to mutate
 * @returns Threat score contribution
 */
function scanAbstentionAnomalies(anomalies, evidence) {
  const abstentionAnomalies = anomalies.filter((a) => {
    const rec = toRecord(a);
    return rec ? asStr(rec['description']).toLowerCase().includes('abstention') : false;
  });
  if (abstentionAnomalies.length > 0) {
    evidence.push(
      `${abstentionAnomalies.length} abstention anomal${abstentionAnomalies.length === 1 ? 'y' : 'ies'} — potential procedural obstruction`
    );
    return 2;
  }
  return 1;
}
/**
 * Count coalitions with critically low cohesion and update evidence.
 *
 * @param coalitions - Coalition data
 * @param evidence - Evidence array to mutate
 * @returns Threat score contribution
 */
function countWeakCohesionCoalitions(coalitions, evidence) {
  let weakCount = 0;
  for (const coalition of coalitions) {
    const rec = toRecord(coalition);
    if (rec && asNum(rec['cohesionScore'], 1) < 0.6) weakCount++;
  }
  if (weakCount >= 3) {
    evidence.push(
      `${weakCount} coalitions with critically low cohesion (<60%) — systemic erosion signal`
    );
    return 3;
  }
  if (weakCount >= 1) {
    evidence.push(`${weakCount} coalition(s) with below-threshold cohesion`);
    return 2;
  }
  return 1;
}
/**
 * Scan for high-significance anomalies as erosion signals.
 *
 * @param anomalies - Voting anomaly data
 * @param evidence - Evidence array to mutate
 * @returns Threat score contribution
 */
function scanCriticalAnomaliesForErosion(anomalies, evidence) {
  const critical = anomalies.filter((a) => {
    const rec = toRecord(a);
    if (!rec) return false;
    const sig = asStr(rec['significance']);
    return sig === 'critical' || sig === 'high';
  });
  if (critical.length > 0) {
    evidence.push(
      `${critical.length} high-significance voting anomal${critical.length === 1 ? 'y' : 'ies'} — norm deviation signals`
    );
    return 2;
  }
  return 1;
}
// ─── STRIDE Analysis ───────────────────────────────────────────────────────────
/**
 * Assess coalition shift threats from voting and coalition data.
 *
 * @param data - Article data containing voting records and coalition data
 * @returns Political STRIDE category assessment for coalition shifts
 */
function assessShiftThreats(data) {
  const records = safeArray(data.votingRecords);
  const coalitions = safeArray(data.coalitionData);
  const anomalies = resolveAnomalies(data);
  const evidence = [];
  const anomalyScore = scanAnomaliesForShift(anomalies, evidence);
  const coalitionScore = scanCoalitionsForShift(coalitions, evidence);
  const threatScore = Math.max(anomalyScore, coalitionScore);
  if (records.length > 10 && evidence.length === 0) {
    evidence.push(`${records.length} voting records analysed; no major shift signals detected`);
  }
  return buildStrideResult(
    'shift',
    threatScore,
    evidence,
    'No coalition shift signals detected in available data',
    'Coalition stability appears maintained. No significant realignment signals.',
    (level) => `Coalition dynamics show ${level}-level shift risk. Monitor cohesion trends closely.`
  );
}
/**
 * Assess transparency threats from procedural and committee data.
 *
 * @param data - Article data containing committee and procedural data
 * @returns Political STRIDE category assessment for transparency concerns
 */
function assessTransparencyThreats(data) {
  const committees = safeArray(data.committees);
  const questions = safeArray(data.questions);
  const evidence = [];
  const threatScore = scanCommitteesForTransparency(committees, evidence);
  if (questions.length > 0) {
    evidence.push(
      `${questions.length} parliamentary question${questions.length === 1 ? '' : 's'} submitted — active oversight`
    );
  }
  return buildStrideResult(
    'transparency',
    threatScore,
    evidence,
    'Procedural transparency within normal parameters',
    'Procedural transparency appears adequate. Committee activity within normal parameters.',
    (level) =>
      `Transparency concerns at ${level} level. Review committee meeting records and public documentation.`
  );
}
/**
 * Assess policy reversal threats from legislative procedure data.
 *
 * @param data - Article data containing procedure and feed data
 * @returns Political STRIDE category assessment for policy reversals
 */
function assessReversalThreats(data) {
  const procedures = safeArray(data.procedures);
  const evidence = [];
  const procScore = scanProceduresForReversal(procedures, evidence);
  const feedData = data.feedData ? toRecord(data.feedData) : null;
  const feedScore = checkFeedAdoptedTexts(feedData, procedures.length, evidence);
  const threatScore = Math.max(procScore, feedScore);
  return buildStrideResult(
    'reversal',
    threatScore,
    evidence,
    'No significant policy reversal signals detected',
    'Legislative trajectory appears stable. No major reversal signals.',
    (level) =>
      `Policy reversal risk at ${level} level. Monitor stalled procedures and conciliation stages.`
  );
}
/**
 * Assess institutional threats from MEP influence and procedural data.
 *
 * @param data - Article data containing MEP influence and committee data
 * @returns Political STRIDE category assessment for institutional threats
 */
function assessInstitutionalThreats(data) {
  const mepInfluence = safeArray(data.mepInfluence);
  const evidence = [];
  const concentrationScore = checkMEPInfluenceConcentration(mepInfluence, evidence);
  const feedData = data.feedData ? toRecord(data.feedData) : null;
  const turnoverScore = checkMEPTurnover(feedData, evidence);
  const threatScore = Math.max(concentrationScore, turnoverScore);
  return buildStrideResult(
    'institutional',
    threatScore,
    evidence,
    'No institutional threat signals detected',
    'Institutional balance appears maintained. Power distribution within normal parameters.',
    (level) =>
      `Institutional threats at ${level} level. Monitor concentration of influence and procedural manipulation signals.`
  );
}
/**
 * Assess legislative delay threats from procedure and feed data.
 *
 * @param data - Article data containing procedures and timeline data
 * @returns Political STRIDE category assessment for legislative delays
 */
function assessDelayThreats(data) {
  const procedures = safeArray(data.procedures);
  const anomalies = resolveAnomalies(data);
  const evidence = [];
  const procScore = scanProceduresForDelay(procedures, evidence);
  const abstentionScore = scanAbstentionAnomalies(anomalies, evidence);
  const threatScore = Math.max(procScore, abstentionScore);
  return buildStrideResult(
    'delay',
    threatScore,
    evidence,
    'No significant legislative delay signals detected',
    'Legislative pace within normal parameters. No obstruction signals.',
    (level) =>
      `Delay threats at ${level} level. Monitor stalled procedures and abstention patterns.`
  );
}
/**
 * Assess democratic erosion threats from coalition and anomaly data.
 *
 * @param data - Article data containing coalition and voting data
 * @returns Political STRIDE category assessment for democratic erosion
 */
function assessErosionThreats(data) {
  const coalitions = safeArray(data.coalitionData);
  const anomalies = resolveAnomalies(data);
  const evidence = [];
  const cohesionScore = countWeakCohesionCoalitions(coalitions, evidence);
  const anomalyScore = scanCriticalAnomaliesForErosion(anomalies, evidence);
  const threatScore = Math.max(cohesionScore, anomalyScore);
  return buildStrideResult(
    'erosion',
    threatScore,
    evidence,
    'Democratic norms appear stable. No systematic erosion signals.',
    'Democratic norms appear stable. Institutional processes functioning within expected parameters.',
    (level) =>
      `Democratic erosion signals at ${level} level. Monitor norm deviations and coalition fragmentation patterns.`
  );
}
// ─── Exported assessment functions ────────────────────────────────────────────
/**
 * Assess political threats across all six Political STRIDE categories.
 *
 * Pure function that analyses article data and produces a complete political
 * threat assessment with STRIDE analysis, actor profiles, consequence trees,
 * and legislative disruption analysis.
 *
 * The function is null-safe and tolerates missing or malformed input data.
 *
 * @param data - Article data from MCP pipeline, or null/undefined for missing data
 * @returns Complete political threat assessment
 */
export function assessPoliticalThreats(data) {
  const safeData = data ?? {};
  const date = new Date().toISOString().slice(0, 10);
  const strideCategories = [
    assessShiftThreats(safeData),
    assessTransparencyThreats(safeData),
    assessReversalThreats(safeData),
    assessInstitutionalThreats(safeData),
    assessDelayThreats(safeData),
    assessErosionThreats(safeData),
  ];
  const actorProfiles = buildActorThreatProfiles(safeData);
  const consequenceTrees = buildConsequenceTrees(safeData);
  const legislativeDisruptions = buildLegislativeDisruptions(safeData);
  const aggregatedThreatLevels = [
    ...strideCategories.map((c) => c.threatLevel),
    ...actorProfiles.map((p) => p.overallThreatLevel),
  ];
  const overallThreatLevel = aggregateImpactLevels(aggregatedThreatLevels);
  const keyFindings = strideCategories
    .filter((c) => c.threatLevel === 'high' || c.threatLevel === 'critical')
    .map((c) => `${STRIDE_LABELS[c.category]}: ${c.analysis}`);
  for (const profile of actorProfiles) {
    if (profile.overallThreatLevel === 'high' || profile.overallThreatLevel === 'critical') {
      keyFindings.push(
        `High-threat actor: ${profile.actor} (${profile.actorType}) — CMO: ${profile.capability}/${profile.motivation}/${profile.opportunity}`
      );
    }
  }
  if (keyFindings.length === 0) {
    keyFindings.push('No high-priority threats detected across Political STRIDE categories');
  }
  const recommendations = [];
  for (const cat of strideCategories) {
    if (cat.threatLevel === 'critical' || cat.threatLevel === 'high') {
      recommendations.push(
        `Monitor ${STRIDE_LABELS[cat.category].toLowerCase()} — ${cat.evidence[0] ?? 'elevated threat level'}`
      );
    }
  }
  for (const profile of actorProfiles) {
    if (profile.overallThreatLevel === 'critical' || profile.overallThreatLevel === 'high') {
      recommendations.push(
        `Track ${profile.actor} (${profile.actorType}) — ${profile.threatCategories.join(', ')} threat categories`
      );
    }
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue routine monitoring of parliamentary activity');
  }
  const hasStrongActorSignals = actorProfiles.length > 0;
  const hasRichStrideEvidence = strideCategories.some((c) => c.evidence.length > 1);
  let confidence = 'low';
  if (hasStrongActorSignals && hasRichStrideEvidence) {
    confidence = 'high';
  } else if (hasStrongActorSignals || hasRichStrideEvidence) {
    confidence = 'medium';
  }
  return {
    date,
    overallThreatLevel,
    confidence,
    strideCategories,
    actorProfiles,
    consequenceTrees,
    legislativeDisruptions,
    keyFindings,
    recommendations,
  };
}
/**
 * Derive CMO levels for a coalition actor.
 *
 * @param groups - Coalition group names
 * @param cohesion - Coalition cohesion score
 * @param riskLevel - Coalition risk level string
 * @returns Object with capability, motivation, opportunity levels
 */
function coalitionCMO(groups, cohesion, riskLevel) {
  const capability = groups.length >= 3 ? 'high' : groups.length === 2 ? 'medium' : 'low';
  const motivation = riskLevel === 'high' ? 'high' : riskLevel === 'medium' ? 'medium' : 'low';
  const opportunity = cohesion < 0.6 ? 'high' : cohesion < 0.8 ? 'medium' : 'low';
  return { capability, motivation, opportunity };
}
/**
 * Build a coalition actor threat profile from a coalition record.
 *
 * @param rec - Coalition data record
 * @returns Actor threat profile or null if record is invalid
 */
function buildCoalitionProfile(rec) {
  const groups = asStrArr(rec['groups']);
  const cohesion = asNum(rec['cohesionScore'], 1);
  const riskLevel = asStr(rec['riskLevel']);
  const trend = asStr(rec['alignmentTrend']);
  const { capability, motivation, opportunity } = coalitionCMO(groups, cohesion, riskLevel);
  const score = cmoScore(capability, motivation, opportunity);
  const overallThreatLevel = cmoToThreatLevel(score);
  const threatCategories = ['shift'];
  if (riskLevel === 'high') threatCategories.push('erosion');
  if (trend === 'weakening') threatCategories.push('delay');
  return {
    actor: groups.join('-') || 'Unknown Coalition',
    actorType: 'political_group',
    capability,
    motivation,
    opportunity,
    trackRecord: trend === 'weakening' ? ['Coalition alignment weakening trend detected'] : [],
    threatCategories,
    overallThreatLevel,
  };
}
/**
 * Derive CMO levels for a MEP actor.
 *
 * @param mepScore - MEP overall influence score
 * @param rank - MEP rank string
 * @returns Object with capability, motivation, opportunity levels
 */
function mepCMO(mepScore, rank) {
  const capability = mepScore >= 80 ? 'high' : mepScore >= 60 ? 'medium' : 'low';
  const motivation = rank === 'top-25%' ? 'high' : 'medium';
  return { capability, motivation, opportunity: 'medium' };
}
/**
 * Build a MEP actor threat profile from an influence record.
 *
 * @param rec - MEP influence data record
 * @returns Actor threat profile or null if MEP is not high-influence
 */
function buildMEPProfile(rec) {
  const mepScore = asNum(rec['overallScore'], 0);
  const rank = asStr(rec['rank']);
  if (mepScore < 60 && rank !== 'top-25%') return null;
  const { capability, motivation, opportunity } = mepCMO(mepScore, rank);
  const score = cmoScore(capability, motivation, opportunity);
  const overallThreatLevel = cmoToThreatLevel(score);
  return {
    actor: asStr(rec['mepName']) || asStr(rec['name']) || 'Unknown MEP',
    actorType: 'mep',
    capability,
    motivation,
    opportunity,
    trackRecord: [`MEP influence score: ${mepScore.toFixed(0)}, rank: ${rank}`],
    threatCategories: ['institutional'],
    overallThreatLevel,
  };
}
/**
 * Build political actor threat profiles from article data.
 *
 * Extracts actors from voting, coalition, and MEP influence data and applies
 * CMO (capability + motivation + opportunity) threat scoring, adapted from
 * ISMS threat agent classification methodology.
 *
 * @param data - Article data from MCP pipeline, or null/undefined for missing data
 * @returns Array of actor threat profiles, sorted by overall threat level
 */
export function buildActorThreatProfiles(data) {
  const profiles = [];
  const coalitions = safeArray(data?.coalitionData);
  for (const coalition of coalitions) {
    const rec = toRecord(coalition);
    if (!rec) continue;
    const profile = buildCoalitionProfile(rec);
    if (profile) profiles.push(profile);
  }
  const mepInfluence = safeArray(data?.mepInfluence);
  for (const mep of mepInfluence) {
    const rec = toRecord(mep);
    if (!rec) continue;
    const profile = buildMEPProfile(rec);
    if (profile) profiles.push(profile);
  }
  return profiles.sort(
    (a, b) => IMPACT_WEIGHTS[b.overallThreatLevel] - IMPACT_WEIGHTS[a.overallThreatLevel]
  );
}
/**
 * Build a political consequence tree for a given root action.
 *
 * Models how a political action cascades through institutions, adapted from
 * attack tree methodology in ISMS threat modeling.
 *
 * @param action - The initiating political action to analyse, or null/undefined
 * @param data - Article data providing context for consequence assessment, or null/undefined
 * @returns Political consequence tree with immediate, secondary, and long-term effects
 */
export function buildConsequenceTree(action, data) {
  const safeAction =
    typeof action === 'string' && action.trim().length > 0
      ? action.trim()
      : 'Unknown political action';
  const coalitions = safeArray(data?.coalitionData);
  const anomalies = resolveAnomalies(data);
  const mitigatingFactors = [
    'Institutional resilience mechanisms',
    'Cross-party dialogue channels',
  ];
  const amplifyingFactors = [];
  // Assess coalition strain amplifier
  const weakCoalitions = coalitions.filter((c) => {
    const rec = toRecord(c);
    return rec ? asNum(rec['cohesionScore'], 1) < 0.7 : false;
  });
  if (weakCoalitions.length > 0) {
    amplifyingFactors.push(`${weakCoalitions.length} weakened coalition(s) reduce buffer capacity`);
  }
  if (anomalies.length > 0) {
    amplifyingFactors.push(
      `${anomalies.length} existing voting anomal${anomalies.length === 1 ? 'y' : 'ies'} amplify instability`
    );
  }
  // Build immediate consequences
  const immediateConsequences = [
    {
      description: 'Legislative process disruption requiring procedural recalibration',
      probability: clampProbability(0.4 + anomalies.length * 0.05),
      impact: anomalies.length > 2 ? 'high' : 'medium',
      affectedStakeholders: stakeholders('political_group', 'eu_institution'),
      timeframe: 'immediate',
    },
    {
      description: 'Coalition communication and coordination burden increases',
      probability: clampProbability(0.3 + weakCoalitions.length * 0.1),
      impact: weakCoalitions.length > 1 ? 'high' : 'medium',
      affectedStakeholders: stakeholders('political_group'),
      timeframe: 'immediate',
    },
  ];
  // Build secondary effects
  const secondaryEffects = [
    {
      description: 'Stakeholder confidence shifts in legislative outcome predictability',
      probability: 0.5,
      impact: 'medium',
      affectedStakeholders: stakeholders('civil_society', 'industry', 'member_state'),
      timeframe: 'short-term',
    },
    {
      description: 'Political group internal pressure and positioning adjustments',
      probability: clampProbability(0.35 + weakCoalitions.length * 0.08),
      impact: weakCoalitions.length > 0 ? 'high' : 'medium',
      affectedStakeholders: stakeholders('political_group', 'mep'),
      timeframe: 'short-term',
    },
  ];
  // Build long-term implications
  const longTermImplications = [
    {
      description: 'Precedent set for similar procedural challenges in future legislative cycles',
      probability: 0.4,
      impact: 'medium',
      affectedStakeholders: stakeholders('eu_institution', 'political_group'),
      timeframe: 'long-term',
    },
    {
      description: 'Structural adjustment of coalition formation strategies',
      probability: weakCoalitions.length > 1 ? 0.6 : 0.3,
      impact: weakCoalitions.length > 1 ? 'high' : 'low',
      affectedStakeholders: stakeholders('political_group'),
      timeframe: 'long-term',
    },
  ];
  return {
    rootAction: safeAction,
    immediateConsequences,
    secondaryEffects,
    longTermImplications,
    mitigatingFactors,
    amplifyingFactors:
      amplifyingFactors.length > 0
        ? amplifyingFactors
        : ['No significant amplifying factors identified'],
  };
}
/**
 * Build consequence trees for all identified high-risk actions.
 * Internal helper for assessPoliticalThreats.
 *
 * @param data - Article data from MCP pipeline
 * @returns Array of consequence trees for significant political actions
 */
function buildConsequenceTrees(data) {
  const MAX_TREES = 3;
  const trees = [];
  const procedures = safeArray(data.procedures);
  // Build trees for stalled procedures
  for (const proc of procedures) {
    if (trees.length >= MAX_TREES) break;
    const rec = toRecord(proc);
    if (!rec) continue;
    const status = asStr(rec['status']);
    if (status === 'stalled' || status === 'blocked') {
      const id = asStr(rec['procedureId'] ?? rec['id'] ?? 'Unknown procedure');
      trees.push(buildConsequenceTree(`Stalled procedure: ${id}`, data));
    }
  }
  // Build trees for high-significance anomalies
  const anomalies = resolveAnomalies(data);
  for (const anomaly of anomalies) {
    if (trees.length >= MAX_TREES) break;
    const rec = toRecord(anomaly);
    if (!rec) continue;
    const significance = asStr(rec['significance']);
    if (significance === 'critical' || significance === 'high') {
      const desc = asStr(rec['description'] ?? 'Significant voting anomaly');
      trees.push(buildConsequenceTree(desc, data));
    }
  }
  // Always include at least one default tree
  if (trees.length === 0) {
    trees.push(buildConsequenceTree('Standard legislative activity assessment', data));
  }
  return trees;
}
/** Stage-level risk multipliers for the legislative kill chain */
const STAGE_RISK_MULTIPLIERS = {
  proposal: 0.5,
  committee: 1.2,
  plenary_first_reading: 1.5,
  council_position: 0.8,
  plenary_second_reading: 1.4,
  conciliation: 1.1,
  adoption: 0.3,
};
/**
 * Determine the Political STRIDE threat category for a legislative stage.
 *
 * @param stage - Legislative stage
 * @returns Corresponding threat category
 */
function stageThreatCategory(stage) {
  if (stage === 'committee') return 'transparency';
  if (stage === 'conciliation') return 'reversal';
  if (stage === 'plenary_first_reading' || stage === 'plenary_second_reading') return 'shift';
  return 'delay';
}
/**
 * Build a single disruption point for a legislative stage.
 *
 * @param stage - Legislative stage
 * @param baseRisk - Base disruption risk
 * @param coalitionRisk - Additional coalition-derived risk
 * @returns Disruption point
 */
function buildDisruptionPoint(stage, baseRisk, coalitionRisk) {
  const likelihood = clampProbability((baseRisk + coalitionRisk) * STAGE_RISK_MULTIPLIERS[stage]);
  const isHighRisk = likelihood > 0.3;
  return {
    stage,
    threatCategory: stageThreatCategory(stage),
    likelihood,
    potentialDisruptors: isHighRisk
      ? ['Opposing political groups', 'Veto-seeking member states']
      : ['Standard procedural opposition'],
    countermeasures: isHighRisk
      ? [
          'Reinforce coalition commitments',
          'Engage rapporteur for compromise',
          'Activate trilogue early',
        ]
      : ['Monitor voting intentions', 'Maintain procedural compliance'],
  };
}
/**
 * Find the current legislative stage for a procedure from data.
 *
 * @param safeProcedure - Sanitised procedure identifier
 * @param procedures - Procedure data items
 * @returns Current legislative stage or 'proposal' as default
 */
function findCurrentStage(safeProcedure, procedures) {
  const normalizedSafeProcedure = safeProcedure.trim();
  if (normalizedSafeProcedure.length === 0) {
    return 'proposal';
  }
  for (const proc of procedures) {
    const rec = toRecord(proc);
    if (!rec) continue;
    const rawId = asStr(rec['procedureId'] ?? rec['id']);
    const id = rawId.trim();
    if (id.length === 0) {
      continue;
    }
    if (id === normalizedSafeProcedure) {
      const stage = asStr(rec['currentStage'] ?? rec['stage']);
      if (ALL_LEGISLATIVE_STAGES.includes(stage)) {
        return stage;
      }
    }
  }
  return 'proposal';
}
/**
 * Calculate coalition risk contribution for disruption likelihood.
 *
 * @param coalitions - Coalition data
 * @returns Coalition risk value (0 or 0.15)
 */
function calcCoalitionRisk(coalitions) {
  const hasWeakCoalition = coalitions.some((c) => {
    const rec = toRecord(c);
    return rec ? asNum(rec['cohesionScore'], 1) < 0.7 : false;
  });
  return hasWeakCoalition ? 0.15 : 0;
}
/**
 * Analyse legislative process disruption risk for a specific procedure.
 *
 * Maps the complete legislative kill chain to identify vulnerability points,
 * adapted from ISMS kill chain analysis applied to parliamentary procedures.
 *
 * @param procedure - Name or ID of the legislative procedure, or null/undefined
 * @param data - Article data providing context for disruption assessment, or null/undefined
 * @returns Legislative disruption analysis for all stages of the procedure
 */
export function analyzeLegislativeDisruption(procedure, data) {
  const safeProcedure =
    typeof procedure === 'string' && procedure.trim().length > 0
      ? procedure.trim()
      : 'Unknown procedure';
  const procedures = safeArray(data?.procedures);
  const coalitions = safeArray(data?.coalitionData);
  const anomalies = resolveAnomalies(data);
  const currentStage = findCurrentStage(safeProcedure, procedures);
  const baseRisk = anomalies.length > 0 ? 0.2 + Math.min(anomalies.length * 0.05, 0.3) : 0.15;
  const coalitionRisk = calcCoalitionRisk(coalitions);
  const disruptionPoints = ALL_LEGISLATIVE_STAGES.map((stage) =>
    buildDisruptionPoint(stage, baseRisk, coalitionRisk)
  );
  const maxLikelihood = Math.max(...disruptionPoints.map((d) => d.likelihood));
  const resilience = maxLikelihood < 0.25 ? 'high' : maxLikelihood < 0.45 ? 'medium' : 'low';
  const alternativePathways = [
    'Commission resubmission with revised proposal',
    'Enhanced informal trilogue engagement',
    'Interim resolution as procedural bridge',
  ];
  if (coalitionRisk > 0) {
    alternativePathways.push('Cross-group rapporteur team to broaden coalition base');
  }
  return {
    procedure: safeProcedure,
    currentStage,
    disruptionPoints,
    resilience,
    alternativePathways,
  };
}
/**
 * Build legislative disruption analyses for active procedures.
 * Internal helper for assessPoliticalThreats.
 *
 * @param data - Article data from MCP pipeline
 * @returns Array of legislative disruption analyses
 */
function buildLegislativeDisruptions(data) {
  const procedures = safeArray(data.procedures);
  const analyses = [];
  for (const proc of procedures) {
    const rec = toRecord(proc);
    if (!rec) continue;
    const id = asStr(rec['procedureId'] ?? rec['id'] ?? '');
    if (id) {
      analyses.push(analyzeLegislativeDisruption(id, data));
    }
    if (analyses.length >= 3) break; // Limit for manageability
  }
  if (analyses.length === 0) {
    analyses.push(analyzeLegislativeDisruption('General legislative pipeline', data));
  }
  return analyses;
}
// ─── Markdown generation ───────────────────────────────────────────────────────
/**
 * Sanitize untrusted text for safe use as a Mermaid diagram node label.
 *
 * Removes control characters/newlines and escapes Mermaid-reserved characters
 * that can break label syntax or allow diagram injection.
 *
 * @param input - Untrusted label text
 * @returns Sanitized label safe for Mermaid node definitions
 */
function sanitizeMermaidLabel(input) {
  // eslint-disable-next-line no-control-regex
  const withoutControlChars = input.replace(/[\r\n\t\f\v\u0000-\u001F\u007F]/g, ' ');
  const escaped = withoutControlChars
    .replace(/\\/g, '\\\\')
    .replace(/"/g, "'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\|/g, '\\|');
  return escaped.trim();
}
/**
 * Sanitize untrusted text for safe use in a Markdown table cell.
 *
 * Escapes pipe characters and normalizes whitespace to prevent
 * table layout corruption from external data.
 *
 * @param input - Untrusted cell text
 * @returns Sanitized text safe for Markdown table cells
 */
function sanitizeTableCell(input) {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}
/**
 * Sanitize untrusted text for safe embedding in Markdown prose or headings.
 *
 * Strips control characters, escapes Markdown link/image metacharacters, and
 * escapes HTML entities to prevent Markdown structure corruption and HTML/script
 * injection from external MCP data.
 *
 * @param input - Untrusted text to sanitize
 * @returns Sanitized text safe for Markdown prose
 */
function sanitizeMarkdownText(input) {
  const normalizedChars = [];
  for (const char of input) {
    const code = char.charCodeAt(0);
    if (code <= 31 || code === 127) {
      normalizedChars.push(' ');
      continue;
    }
    switch (char) {
      case '\\':
      case '!':
      case '[':
      case ']':
      case '(':
      case ')':
        normalizedChars.push(`\\${char}`);
        break;
      default:
        normalizedChars.push(char);
    }
  }
  return normalizedChars
    .join('')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}
/**
 * Generate a risk heat map row for an actor profile.
 *
 * @param profile - Actor threat profile
 * @returns Markdown table row string
 */
function buildActorTableRow(profile) {
  const emoji = THREAT_EMOJIS[profile.overallThreatLevel];
  const actor = sanitizeTableCell(profile.actor);
  return `| ${actor} | ${profile.capability} | ${profile.motivation} | ${profile.opportunity} | ${emoji} ${profile.overallThreatLevel} |`;
}
/**
 * Generate a consequence tree section in Mermaid diagram format.
 *
 * @param tree - Political consequence tree
 * @returns Markdown string with Mermaid diagram
 */
function buildConsequenceTreeMarkdown(tree) {
  const rootLabel = sanitizeMermaidLabel(tree.rootAction);
  const lines = [
    `### Consequence Tree: ${rootLabel}`,
    '',
    '```mermaid',
    'graph TD',
    `    A["${rootLabel}"]`,
  ];
  tree.immediateConsequences.forEach((c, i) => {
    const nodeId = `B${i}`;
    const rawDescription = c.description;
    const truncated =
      rawDescription.length > 40 ? rawDescription.slice(0, 40) + '...' : rawDescription;
    const label = sanitizeMermaidLabel(truncated);
    lines.push(`    ${nodeId}["${label}"]`);
    lines.push(`    A --> ${nodeId}`);
  });
  tree.secondaryEffects.forEach((c, i) => {
    const nodeId = `C${i}`;
    const hasImmediateNodes = tree.immediateConsequences.length > 0;
    const parentId = hasImmediateNodes ? `B${i % tree.immediateConsequences.length}` : 'A';
    const rawDescription = c.description;
    const truncated =
      rawDescription.length > 40 ? rawDescription.slice(0, 40) + '...' : rawDescription;
    const label = sanitizeMermaidLabel(truncated);
    lines.push(`    ${nodeId}["${label}"]`);
    lines.push(`    ${parentId} --> ${nodeId}`);
  });
  tree.longTermImplications.forEach((c, i) => {
    const nodeId = `D${i}`;
    const hasSecondaryNodes = tree.secondaryEffects.length > 0;
    const hasImmediateNodes = tree.immediateConsequences.length > 0;
    const parentId = hasSecondaryNodes
      ? `C${i % tree.secondaryEffects.length}`
      : hasImmediateNodes
        ? `B${i % tree.immediateConsequences.length}`
        : 'A';
    const rawDescription = c.description;
    const truncated =
      rawDescription.length > 40 ? rawDescription.slice(0, 40) + '...' : rawDescription;
    const label = sanitizeMermaidLabel(truncated);
    lines.push(`    ${nodeId}["${label}"]`);
    lines.push(`    ${parentId} --> ${nodeId}`);
  });
  lines.push('```', '');
  if (tree.mitigatingFactors.length > 0) {
    lines.push('**Mitigating Factors:**');
    tree.mitigatingFactors.forEach((f) => lines.push(`- ${sanitizeMarkdownText(f)}`));
    lines.push('');
  }
  if (tree.amplifyingFactors.length > 0) {
    lines.push('**Amplifying Factors:**');
    tree.amplifyingFactors.forEach((f) => lines.push(`- ${sanitizeMarkdownText(f)}`));
    lines.push('');
  }
  return lines.join('\n');
}
/**
 * Generate a legislative disruption analysis table.
 *
 * @param analysis - Legislative disruption analysis
 * @returns Markdown string with disruption table
 */
function buildDisruptionTableMarkdown(analysis) {
  const safeProcedure = sanitizeMarkdownText(analysis.procedure);
  const lines = [
    `### Procedure: ${safeProcedure}`,
    '',
    `**Current Stage**: ${analysis.currentStage} | **Resilience**: ${analysis.resilience}`,
    '',
    '| Stage | Threat Category | Likelihood | Risk Level |',
    '|-------|----------------|------------|------------|',
  ];
  for (const point of analysis.disruptionPoints) {
    const riskLevel =
      point.likelihood > 0.4 ? '🔴 High' : point.likelihood > 0.25 ? '⚠️ Medium' : '🟢 Low';
    lines.push(
      `| ${point.stage.replace(/_/g, ' ')} | ${point.threatCategory} | ${(point.likelihood * 100).toFixed(0)}% | ${riskLevel} |`
    );
  }
  lines.push('', '**Alternative Pathways:**');
  analysis.alternativePathways.forEach((p) => {
    const safePathway = sanitizeMarkdownText(p);
    lines.push(`- ${safePathway}`);
  });
  lines.push('');
  return lines.join('\n');
}
/**
 * Generate structured markdown analysis from a political threat assessment.
 *
 * Produces a complete markdown document with YAML frontmatter, Political STRIDE
 * analysis, actor threat profiles table, consequence trees with Mermaid diagrams,
 * and legislative disruption analysis.
 *
 * If {@link assessment} is `null` or `undefined`, a default low-threat,
 * low-confidence assessment is generated using {@link assessPoliticalThreats}
 * to preserve the module's null-safe contract.
 *
 * @param assessment - Complete political threat assessment to render, or null/undefined to use defaults
 * @returns Markdown string suitable for writing to analysis-output directory
 */
export function generateThreatAssessmentMarkdown(assessment) {
  const safeAssessment = assessment ?? assessPoliticalThreats(null);
  const lines = [
    '---',
    'title: "Political Threat Assessment"',
    `date: "${safeAssessment.date}"`,
    'analysisType: "threat-assessment"',
    `threatLevel: "${safeAssessment.overallThreatLevel}"`,
    `confidence: "${safeAssessment.confidence}"`,
    'methods: ["political-stride", "actor-profiling", "consequence-trees", "disruption-analysis"]',
    '---',
    '',
    '# Political Threat Assessment',
    '',
    `**Overall Threat Level**: ${THREAT_EMOJIS[safeAssessment.overallThreatLevel]} ${safeAssessment.overallThreatLevel.toUpperCase()}  `,
    `**Confidence**: ${safeAssessment.confidence}  `,
    `**Date**: ${safeAssessment.date}`,
    '',
    '## Political STRIDE Analysis',
    '',
  ];
  for (const cat of safeAssessment.strideCategories) {
    const emoji = THREAT_EMOJIS[cat.threatLevel];
    lines.push(
      `### ${STRIDE_LABELS[cat.category]}`,
      `**Threat Level**: ${emoji} ${cat.threatLevel.charAt(0).toUpperCase() + cat.threatLevel.slice(1)}`,
      '',
      sanitizeMarkdownText(cat.analysis),
      ''
    );
    if (cat.evidence.length > 0) {
      lines.push('**Evidence:**');
      cat.evidence.forEach((e) => lines.push(`- ${sanitizeMarkdownText(e)}`));
      lines.push('');
    }
  }
  lines.push('## Actor Threat Profiles', '');
  if (safeAssessment.actorProfiles.length > 0) {
    lines.push(
      '| Actor | Capability | Motivation | Opportunity | Overall |',
      '|-------|-----------|------------|-------------|---------|'
    );
    safeAssessment.actorProfiles.forEach((p) => lines.push(buildActorTableRow(p)));
    lines.push('');
  } else {
    lines.push('*No actor threat profiles generated from available data.*', '');
  }
  lines.push('## Consequence Trees', '');
  safeAssessment.consequenceTrees.forEach((tree) => lines.push(buildConsequenceTreeMarkdown(tree)));
  lines.push('## Legislative Disruption Analysis', '');
  safeAssessment.legislativeDisruptions.forEach((analysis) =>
    lines.push(buildDisruptionTableMarkdown(analysis))
  );
  lines.push('## Key Findings', '');
  safeAssessment.keyFindings.forEach((f) => lines.push(`- ${sanitizeMarkdownText(f)}`));
  lines.push('');
  lines.push('## Recommendations', '');
  safeAssessment.recommendations.forEach((r) => lines.push(`- ${sanitizeMarkdownText(r)}`));
  lines.push('');
  lines.push(
    '---',
    '*Assessment generated by EU Parliament Monitor Political Threat Assessment Pipeline.*  ',
    '*Based on public European Parliament data. GDPR-compliant.*'
  );
  return lines.join('\n');
}
// ─── All Political STRIDE categories constant (for external use) ──────────────
/**
 * All Political STRIDE categories in canonical order.
 * Useful for iterating over all categories without hardcoding the list.
 */
export const ALL_POLITICAL_STRIDE_CATEGORIES = ALL_STRIDE_CATEGORIES;
//# sourceMappingURL=political-threat-assessment.js.map
