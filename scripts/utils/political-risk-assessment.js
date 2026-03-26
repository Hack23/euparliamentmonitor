// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
// ─── Likelihood & Impact lookup tables ───────────────────────────────────────
/** Numeric values for each likelihood level */
const LIKELIHOOD_VALUES = {
  rare: 0.1,
  unlikely: 0.3,
  possible: 0.5,
  likely: 0.7,
  almost_certain: 0.9,
};
/** Numeric values for each impact level */
const IMPACT_VALUES = {
  negligible: 1,
  minor: 2,
  moderate: 3,
  major: 4,
  severe: 5,
};
/** Expected stage durations in days (historical parliamentary averages) */
const EXPECTED_STAGE_DAYS = {
  proposal: 90,
  committee: 180,
  plenary_first: 60,
  trilogue: 120,
  plenary_second: 45,
  adopted: 0,
  stalled: 365,
};
// ─── Risk level thresholds ───────────────────────────────────────────────────
/** Score thresholds for risk level bands (score = likelihood × impact) */
const RISK_LEVEL_THRESHOLDS = {
  LOW_MAX: 1.0,
  MEDIUM_MAX: 2.0,
  HIGH_MAX: 3.5,
};
/**
 * Cross-impact: fraction of strength score that reduces a threat's net effect.
 * A strength with score 5 reduces a threat by 5 × 0.2 = 1.0 units.
 */
const STRENGTH_MITIGATION_COEFFICIENT = 0.2;
/**
 * Cross-impact: fraction of weakness score that amplifies a threat's net effect.
 * A weakness with score 5 amplifies a threat by 5 × 0.15 = 0.75 units.
 */
const WEAKNESS_AMPLIFICATION_COEFFICIENT = 0.15;
/**
 * Default legislative stage used when the raw stage string is not recognised.
 * Committee is chosen as the most common intermediate stage in EP procedures.
 */
const DEFAULT_LEGISLATIVE_STAGE = 'committee';
// ─── Private helpers ─────────────────────────────────────────────────────────
/**
 * Derive risk level from a composite score.
 *
 * @param score - Risk score (likelihood × impact)
 * @returns Risk level band
 */
function deriveRiskLevel(score) {
  if (score <= RISK_LEVEL_THRESHOLDS.LOW_MAX) return 'low';
  if (score <= RISK_LEVEL_THRESHOLDS.MEDIUM_MAX) return 'medium';
  if (score <= RISK_LEVEL_THRESHOLDS.HIGH_MAX) return 'high';
  return 'critical';
}
/**
 * Clamp a number to [min, max].
 *
 * Non-finite values are normalised deterministically to avoid leaking
 * NaN/Infinity into downstream calculations:
 * - NaN → min
 * - +Infinity → max
 * - -Infinity → min
 *
 * @param value - Number to clamp
 * @param min - Lower bound
 * @param max - Upper bound
 * @returns Clamped value
 */
function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    if (value === Infinity) return max;
    // NaN or -Infinity
    return min;
  }
  return Math.min(max, Math.max(min, value));
}
/**
 * Round to two decimal places.
 *
 * @param value - Number to round
 * @returns Rounded value
 */
function round2(value) {
  return Math.round(value * 100) / 100;
}
/**
 * Safely coerce an unknown value to a string.
 *
 * @param val - Unknown value
 * @returns String or empty string
 */
function asStr(val) {
  return typeof val === 'string' ? val : '';
}
/**
 * Safely coerce an unknown value to a finite number.
 *
 * @param val - Unknown value
 * @param fallback - Default when not a finite number
 * @returns Finite number or fallback
 */
function asNum(val, fallback = 0) {
  if (typeof val === 'number' && Number.isFinite(val)) {
    return val;
  }
  if (typeof val === 'string') {
    const parsed = Number(val.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}
/**
 * Coerce an unknown value to a Record or null.
 *
 * @param input - Value to coerce
 * @returns Record or null
 */
function toRecord(input) {
  if (input === null || input === undefined || typeof input !== 'object') return null;
  return input;
}
// ─── Risk heat map emoji ─────────────────────────────────────────────────────
/** Emoji cell for the risk heat map table */
const HEAT_MAP_CELLS = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
};
// ─── Exported core scoring functions ─────────────────────────────────────────
/**
 * Calculate a political risk score from likelihood and impact levels.
 * Implements the ISMS-inspired Likelihood × Impact framework adapted for
 * European Parliament political intelligence.
 *
 * Risk Score = likelihoodValue × impactValue
 * - low: 0–≤1.0 | medium: >1.0–≤2.0 | high: >2.0–≤3.5 | critical: >3.5
 *
 * @param likelihood - Likelihood level of the political risk
 * @param impact - Impact level if the risk occurs
 * @param riskId - Optional risk identifier (defaults to "RISK-AUTO")
 * @param description - Optional risk description
 * @param evidence - Optional supporting evidence strings
 * @param mitigatingFactors - Optional factors that reduce likelihood or impact
 * @param confidence - Optional confidence level (defaults to 'medium')
 * @returns Fully populated PoliticalRiskScore
 */
export function calculatePoliticalRiskScore(
  likelihood,
  impact,
  riskId = 'RISK-AUTO',
  description = '',
  evidence = [],
  mitigatingFactors = [],
  confidence = 'medium'
) {
  if (!Object.hasOwn(LIKELIHOOD_VALUES, likelihood)) {
    throw new Error(
      `Invalid likelihood: "${String(likelihood)}". Expected one of: ${Object.keys(LIKELIHOOD_VALUES).join(', ')}`
    );
  }
  if (!Object.hasOwn(IMPACT_VALUES, impact)) {
    throw new Error(
      `Invalid impact: "${String(impact)}". Expected one of: ${Object.keys(IMPACT_VALUES).join(', ')}`
    );
  }
  // eslint-disable-next-line security/detect-object-injection -- key validated via Object.hasOwn above
  const likelihoodValue = LIKELIHOOD_VALUES[likelihood];
  // eslint-disable-next-line security/detect-object-injection -- key validated via Object.hasOwn above
  const impactValue = IMPACT_VALUES[impact];
  const riskScore = round2(likelihoodValue * impactValue);
  const riskLevel = deriveRiskLevel(riskScore);
  return {
    riskId,
    description,
    likelihood,
    likelihoodValue,
    impact,
    impactValue,
    riskScore,
    riskLevel,
    confidence,
    evidence: [...evidence],
    mitigatingFactors: [...mitigatingFactors],
  };
}
/**
 * Assess Political Capital at Risk (PCaR) for a named political actor.
 * Adapted from ISMS Value at Risk: quantifies political capital exposure
 * given observable risk drivers derived from parliamentary data.
 *
 * Capital at Risk is estimated as: sum(driver contributions) * currentCapital / 100
 * clamped to [0, currentCapital].
 *
 * @param actor - Name or identifier of the political actor
 * @param actorType - Type classification of the actor
 * @param currentCapital - Current political capital score (0–100)
 * @param riskDrivers - List of risk drivers affecting this actor
 * @param timeHorizon - Assessment time horizon
 * @param confidenceInterval - Statistical confidence interval (e.g. 95)
 * @returns Populated PoliticalCapitalAtRisk structure
 */
export function assessPoliticalCapitalAtRisk(
  actor,
  actorType,
  currentCapital,
  riskDrivers,
  timeHorizon = 'quarter',
  confidenceInterval = 95
) {
  const cappedCapital = clamp(currentCapital, 0, 100);
  const totalContribution = riskDrivers.reduce((sum, d) => sum + d.contribution, 0);
  const capitalAtRisk = round2(clamp((totalContribution / 100) * cappedCapital, 0, cappedCapital));
  return {
    actor,
    actorType,
    currentCapital: round2(cappedCapital),
    capitalAtRisk,
    riskDrivers,
    timeHorizon,
    confidenceInterval: clamp(confidenceInterval, 0, 100),
  };
}
/**
 * Build a quantitative SWOT analysis from scored items.
 * Extends the existing SwotAnalysis pattern with numerical scoring and
 * a cross-impact matrix showing how strengths/weaknesses interact with threats.
 *
 * Strategic Position Score = (sumStrengths + sumOpportunities) /
 *                            ((sumStrengths + sumOpportunities + sumWeaknesses + sumThreats) / 10)
 * Range: 0–10; above 5 = net-positive strategic position.
 *
 * @param title - Optional title for the analysis
 * @param strengths - Scored strength items
 * @param weaknesses - Scored weakness items
 * @param opportunities - Scored opportunity items
 * @param threats - Scored threat items
 * @returns QuantitativeSWOT with cross-impact matrix and strategic position score
 */
export function buildQuantitativeSWOT(title, strengths, weaknesses, opportunities, threats) {
  const sumStrengths = strengths.reduce((s, i) => s + i.score, 0);
  const sumWeaknesses = weaknesses.reduce((s, i) => s + i.score, 0);
  const sumOpportunities = opportunities.reduce((s, i) => s + i.score, 0);
  const sumThreats = threats.reduce((s, i) => s + i.score, 0);
  const totalScore = sumStrengths + sumWeaknesses + sumOpportunities + sumThreats;
  const positiveScore = sumStrengths + sumOpportunities;
  // Strategic position: 0–10 scale; 5 = neutral
  const strategicPositionScore =
    totalScore > 0 ? round2(clamp((positiveScore / totalScore) * 10, 0, 10)) : 5;
  // Build cross-impact matrix: each strength/weakness × each threat
  const crossImpactMatrix = [];
  strengths.forEach((strength, si) => {
    threats.forEach((_threat, ti) => {
      // Strengths reduce threat impact; contribution proportional to strength score
      const netEffect = round2(-(strength.score * STRENGTH_MITIGATION_COEFFICIENT));
      crossImpactMatrix.push({
        swotIndex: si,
        swotType: 'strength',
        threatIndex: ti,
        netEffect,
        // eslint-disable-next-line security/detect-object-injection -- ti is array index from forEach
        rationale: `Strength "${strength.description}" partially mitigates threat "${threats[ti]?.description ?? ''}"`,
      });
    });
  });
  weaknesses.forEach((weakness, wi) => {
    threats.forEach((_threat, ti) => {
      // Weaknesses amplify threat impact; contribution proportional to weakness score
      const netEffect = round2(weakness.score * WEAKNESS_AMPLIFICATION_COEFFICIENT);
      crossImpactMatrix.push({
        swotIndex: wi,
        swotType: 'weakness',
        threatIndex: ti,
        netEffect,
        // eslint-disable-next-line security/detect-object-injection -- ti is array index from forEach
        rationale: `Weakness "${weakness.description}" amplifies threat "${threats[ti]?.description ?? ''}"`,
      });
    });
  });
  const overallAssessment =
    strategicPositionScore >= 7
      ? 'Strong strategic position: strengths and opportunities outweigh weaknesses and threats.'
      : strategicPositionScore >= 5
        ? 'Moderate strategic position: balanced strengths and risks requiring careful monitoring.'
        : 'Weak strategic position: weaknesses and threats dominate — urgent mitigation needed.';
  const result = {
    strengths,
    weaknesses,
    opportunities,
    threats,
    crossImpactMatrix,
    strategicPositionScore,
    overallAssessment,
    ...(title !== undefined ? { title } : {}),
  };
  return result;
}
/**
 * Assess legislative velocity risks for a set of procedures.
 * Adapted from ISMS Annual Rate of Occurrence: procedures spending significantly
 * longer than the historical average in a stage are assigned higher risk scores.
 *
 * @param procedures - Array of raw procedure objects (from MCP or fallback data)
 * @returns Array of LegislativeVelocityRisk objects sorted by risk score (highest first)
 */
export function assessLegislativeVelocityRisk(procedures) {
  const results = [];
  for (const raw of procedures) {
    const p = toRecord(raw);
    if (!p) continue;
    const procedureId = asStr(p['procedureId']) || asStr(p['id']);
    const title = asStr(p['title']);
    if (!procedureId || !title) continue;
    const stageRaw = asStr(p['stage']).toLowerCase().replace(/\s+/g, '_');
    const currentStage = isLegislativeStage(stageRaw) ? stageRaw : DEFAULT_LEGISLATIVE_STAGE;
    const daysInCurrentStage = Math.max(0, Math.round(asNum(p['daysInCurrentStage'])));
    // eslint-disable-next-line security/detect-object-injection -- key validated by isLegislativeStage
    const expectedDays = EXPECTED_STAGE_DAYS[currentStage];
    // Velocity ratio: how many times the expected duration has passed
    const velocityRatio = expectedDays > 0 ? daysInCurrentStage / expectedDays : 0;
    // Map velocity ratio to likelihood/impact for the risk score
    const likelihood = velocityRatioToLikelihood(velocityRatio);
    const impact = stageToImpact(currentStage);
    const velocityRisk = calculatePoliticalRiskScore(
      likelihood,
      impact,
      `VEL-${procedureId}`,
      `Legislative velocity risk: ${title} has been in ${currentStage} stage for ${daysInCurrentStage} days (expected: ${expectedDays})`,
      [
        `Stage: ${currentStage}`,
        `Days in stage: ${daysInCurrentStage}`,
        `Expected: ${expectedDays} days`,
      ],
      velocityRatio < 1 ? ['Procedure is within expected timeline'] : [],
      velocityRatio < 0.5 ? 'high' : 'medium'
    );
    const predictedCompletion = asStr(p['predictedCompletion']) || null;
    results.push({
      procedureId,
      title,
      currentStage,
      daysInCurrentStage,
      expectedDaysForStage: expectedDays,
      velocityRisk,
      predictedCompletion,
    });
  }
  // Sort by risk score descending
  return results.sort((a, b) => b.velocityRisk.riskScore - a.velocityRisk.riskScore);
}
/**
 * Run a full agentic risk assessment workflow (identify → analyze → evaluate → treat).
 * Inspired by ISMS AI Agent-Driven Risk Assessment methodology, providing a
 * structured, auditable trace for agentic processes.
 *
 * @param assessmentId - Unique identifier for this assessment run
 * @param date - ISO date string for the assessment
 * @param articleType - Article category this assessment is produced for
 * @param identifiedRisks - Risks identified in the identify step
 * @param riskDrivers - Risk drivers analysed in the analyze step
 * @param mitigations - Mitigations recommended in the treat step
 * @returns Fully populated AgentRiskAssessmentWorkflow
 */
export function runAgentRiskAssessment(
  assessmentId,
  date,
  articleType,
  identifiedRisks,
  riskDrivers,
  mitigations
) {
  // Step 1: Identify — clone to prevent external mutation of the audit trace
  const identifyStep = { type: 'identify', risks: [...identifiedRisks] };
  // Step 2: Analyze — clone to prevent external mutation
  const analyzeStep = { type: 'analyze', drivers: [...riskDrivers] };
  // Step 3: Evaluate — sort risks by score to build evaluation matrix
  const evaluateMatrix = [...identifiedRisks].sort((a, b) => b.riskScore - a.riskScore);
  const evaluateStep = { type: 'evaluate', matrix: evaluateMatrix };
  // Step 4: Treat — clone to prevent external mutation
  const treatStep = { type: 'treat', mitigations: [...mitigations] };
  const steps = [identifyStep, analyzeStep, evaluateStep, treatStep];
  // Synthesise an overall risk profile from all identified risks
  const overallRiskProfile = synthesiseOverallRisk(identifiedRisks, assessmentId, date);
  return {
    assessmentId,
    date,
    articleType,
    steps,
    overallRiskProfile,
    recommendations: [...mitigations],
  };
}
/**
 * Generate a structured markdown document from an agent risk assessment workflow.
 * Produces a YAML-frontmatter header and all risk sections in markdown format
 * suitable for writing to `analysis-output/{date}/risk-scoring/agent-risk-workflow.md`.
 *
 * @param assessment - Completed agent risk assessment workflow
 * @returns Markdown string with YAML frontmatter and full risk analysis
 */
export function generateRiskAssessmentMarkdown(assessment) {
  const { assessmentId, date, articleType, overallRiskProfile, steps, recommendations } =
    assessment;
  const riskCounts = countRisks(steps);
  const frontmatter = [
    '---',
    `title: "Political Risk Assessment"`,
    `date: "${sanitizeYamlValue(date)}"`,
    `assessmentId: "${sanitizeYamlValue(assessmentId)}"`,
    `articleType: "${sanitizeYamlValue(articleType)}"`,
    `analysisType: "risk-scoring"`,
    `overallRiskLevel: "${sanitizeYamlValue(overallRiskProfile.riskLevel)}"`,
    `confidence: "${sanitizeYamlValue(overallRiskProfile.confidence)}"`,
    `methods: ["risk-matrix"]`,
    `riskCount: { low: ${riskCounts.low}, medium: ${riskCounts.medium}, high: ${riskCounts.high}, critical: ${riskCounts.critical} }`,
    '---',
  ].join('\n');
  const safeAssessmentId = sanitizeMarkdownContent(assessmentId);
  const safeDate = sanitizeMarkdownContent(date);
  const safeArticleType = sanitizeMarkdownContent(articleType);
  const safeOverallRiskLevel = sanitizeMarkdownContent(overallRiskProfile.riskLevel).toUpperCase();
  const safeConfidence = sanitizeMarkdownContent(overallRiskProfile.confidence);
  const header = `\n# Political Risk Assessment\n\n**Assessment ID**: ${safeAssessmentId}  \n**Date**: ${safeDate}  \n**Article Type**: ${safeArticleType}  \n**Overall Risk Level**: ${safeOverallRiskLevel} (score: ${overallRiskProfile.riskScore})  \n**Confidence**: ${safeConfidence}\n`;
  const heatMap = buildRiskHeatMapMarkdown();
  const identifyStep = steps.find((s) => s.type === 'identify');
  const risksSection =
    identifyStep?.type === 'identify' ? buildRisksMarkdown(identifyStep.risks) : '';
  const evaluateStep = steps.find((s) => s.type === 'evaluate');
  const evaluateSection =
    evaluateStep?.type === 'evaluate' ? buildEvaluateMarkdown(evaluateStep.matrix) : '';
  const treatStep = steps.find((s) => s.type === 'treat');
  const treatSection = treatStep?.type === 'treat' ? buildTreatMarkdown(treatStep.mitigations) : '';
  const recommendationsSection =
    recommendations.length > 0
      ? `\n## Recommendations\n\n${recommendations.map((r) => `- ${sanitizeMarkdownContent(r)}`).join('\n')}\n`
      : '';
  return [
    frontmatter,
    header,
    heatMap,
    risksSection,
    evaluateSection,
    treatSection,
    recommendationsSection,
  ]
    .filter(Boolean)
    .join('\n');
}
/**
 * Generate a complete political risk summary combining all assessment outputs.
 *
 * @param date - ISO date string for the summary
 * @param topRisks - Top identified political risks (sorted by score)
 * @param capitalAtRisk - Political capital at risk for key actors
 * @param quantitativeSwot - Quantitative SWOT analysis
 * @param legislativeVelocityRisks - Legislative velocity risk indicators
 * @returns PoliticalRiskSummary with aggregated metrics
 */
export function generatePoliticalRiskSummary(
  date,
  topRisks,
  capitalAtRisk,
  quantitativeSwot,
  legislativeVelocityRisks
) {
  const riskCount = countRisksFromArray(topRisks);
  const overallRiskLevel = deriveOverallRiskLevel(topRisks);
  const confidence = deriveOverallConfidence(topRisks);
  return {
    date,
    overallRiskLevel,
    confidence,
    riskCount,
    topRisks,
    capitalAtRisk,
    quantitativeSwot,
    legislativeVelocityRisks,
  };
}
// ─── Private helper functions ─────────────────────────────────────────────────
/**
 * Check whether a string is a valid LegislativeStage.
 *
 * @param s - String to check
 * @returns True if valid stage
 */
function isLegislativeStage(s) {
  if (s === '__proto__' || s === 'constructor' || s === 'prototype') {
    return false;
  }
  return Object.hasOwn(EXPECTED_STAGE_DAYS, s);
}
/**
 * Map a velocity ratio to a risk likelihood level.
 *
 * @param ratio - daysInStage / expectedDays
 * @returns Likelihood level
 */
function velocityRatioToLikelihood(ratio) {
  if (ratio < 0.5) return 'rare';
  if (ratio < 1.0) return 'unlikely';
  if (ratio < 1.5) return 'possible';
  if (ratio < 2.0) return 'likely';
  return 'almost_certain';
}
/**
 * Map a legislative stage to a default risk impact level.
 *
 * @param stage - Legislative stage
 * @returns Impact level
 */
function stageToImpact(stage) {
  switch (stage) {
    case 'adopted':
      return 'negligible';
    case 'proposal':
      return 'minor';
    case 'committee':
    case 'plenary_first':
      return 'moderate';
    case 'trilogue':
    case 'plenary_second':
      return 'major';
    case 'stalled':
      return 'severe';
    default:
      return 'moderate';
  }
}
/**
 * Synthesise an overall risk profile from a set of individual risk scores.
 * Uses the highest risk score as the representative profile.
 *
 * @param risks - All identified risk scores
 * @param assessmentId - Assessment identifier
 * @param date - Assessment date
 * @returns Overall composite PoliticalRiskScore
 */
function synthesiseOverallRisk(risks, assessmentId, date) {
  if (risks.length === 0) {
    return calculatePoliticalRiskScore(
      'rare',
      'negligible',
      `OVERALL-${assessmentId}`,
      `Overall risk profile for assessment ${assessmentId} on ${date}`,
      [],
      [],
      'low'
    );
  }
  // Safe: risks.length > 0 is guaranteed by the guard above
  const firstRisk = risks[0];
  const maxRisk = risks.reduce((max, r) => (r.riskScore > max.riskScore ? r : max), firstRisk);
  // Count confidence levels to pick the dominant one
  const confidenceCounts = { high: 0, medium: 0, low: 0 };
  for (const r of risks) {
    confidenceCounts[r.confidence]++;
  }
  const dominantConfidence =
    confidenceCounts.high >= confidenceCounts.medium &&
    confidenceCounts.high >= confidenceCounts.low
      ? 'high'
      : confidenceCounts.medium >= confidenceCounts.low
        ? 'medium'
        : 'low';
  // Use maxRisk fields to maintain the invariant: riskScore = likelihoodValue × impactValue
  return {
    riskId: `OVERALL-${assessmentId}`,
    description: `Overall risk profile: ${risks.length} risks identified; highest: ${maxRisk.description}`,
    likelihood: maxRisk.likelihood,
    likelihoodValue: maxRisk.likelihoodValue,
    impact: maxRisk.impact,
    impactValue: maxRisk.impactValue,
    riskScore: maxRisk.riskScore,
    riskLevel: maxRisk.riskLevel,
    confidence: dominantConfidence,
    evidence: risks.flatMap((r) => r.evidence).slice(0, 5),
    mitigatingFactors: risks.flatMap((r) => r.mitigatingFactors).slice(0, 5),
  };
}
/**
 * Count risks by level from workflow steps.
 *
 * @param steps - Risk assessment steps
 * @returns Counts per risk level
 */
function countRisks(steps) {
  const identifyStep = steps.find((s) => s.type === 'identify');
  const risks = identifyStep && 'risks' in identifyStep ? (identifyStep.risks ?? []) : [];
  return countRisksFromArray(risks);
}
/**
 * Count risks by level from an array of risk scores.
 *
 * @param risks - Array of political risk scores
 * @returns Counts per risk level
 */
function countRisksFromArray(risks) {
  let low = 0;
  let medium = 0;
  let high = 0;
  let critical = 0;
  for (const r of risks) {
    if (r.riskLevel === 'low') low++;
    else if (r.riskLevel === 'medium') medium++;
    else if (r.riskLevel === 'high') high++;
    else if (r.riskLevel === 'critical') critical++;
  }
  return { low, medium, high, critical };
}
/**
 * Derive overall risk level from a set of risk scores.
 * Takes the highest level present.
 *
 * @param risks - Array of political risk scores
 * @returns Highest risk level present, or 'low' if empty
 */
function deriveOverallRiskLevel(risks) {
  if (risks.length === 0) return 'low';
  const ORDER = ['low', 'medium', 'high', 'critical'];
  return risks.reduce((max, r) => {
    return ORDER.indexOf(r.riskLevel) > ORDER.indexOf(max) ? r.riskLevel : max;
  }, 'low');
}
/**
 * Derive an overall confidence level from a set of risk scores.
 *
 * @param risks - Array of political risk scores
 * @returns Dominant confidence level
 */
function deriveOverallConfidence(risks) {
  if (risks.length === 0) return 'low';
  const counts = { high: 0, medium: 0, low: 0 };
  for (const r of risks) {
    counts[r.confidence]++;
  }
  if (counts.high >= counts.medium && counts.high >= counts.low) return 'high';
  if (counts.medium >= counts.low) return 'medium';
  return 'low';
}
/**
 * Build a markdown risk heat map table.
 *
 * @returns Markdown string with the risk heat map
 */
function buildRiskHeatMapMarkdown() {
  const impacts = ['severe', 'major', 'moderate', 'minor', 'negligible'];
  const likelihoods = ['rare', 'unlikely', 'possible', 'likely', 'almost_certain'];
  const header = `## Risk Heat Map\n\n| Impact ↓ / Likelihood → | Rare | Unlikely | Possible | Likely | Almost Certain |\n|--------------------------|------|----------|----------|--------|----------------|`;
  const rows = impacts.map((impact) => {
    const cells = likelihoods.map((likelihood) => {
      // eslint-disable-next-line security/detect-object-injection -- keys are typed PoliticalRiskLikelihood/Impact from const arrays
      const score = LIKELIHOOD_VALUES[likelihood] * IMPACT_VALUES[impact];
      const level = deriveRiskLevel(round2(score));
      // eslint-disable-next-line security/detect-object-injection -- key is a typed PoliticalRiskLevel
      return HEAT_MAP_CELLS[level];
    });
    const impactLabel = `**${impact.charAt(0).toUpperCase() + impact.slice(1)}**`;
    return `| ${impactLabel} | ${cells.join(' | ')} |`;
  });
  return `${header}\n${rows.join('\n')}\n`;
}
/**
 * Build markdown for identified risks.
 *
 * @param risks - Identified risk scores
 * @returns Markdown string
 */
function buildRisksMarkdown(risks) {
  if (risks.length === 0) return '';
  const lines = risks.map((r) => {
    const safeRiskId = sanitizeMarkdownContent(r.riskId);
    const headingId = safeRiskId.length > 0 ? safeRiskId : 'RISK-UNKNOWN';
    const safeDescription = sanitizeMarkdownContent(r.description);
    const headingDescription = safeDescription.length > 0 ? safeDescription : headingId;
    const safeEvidence = r.evidence.map((e) => sanitizeMarkdownContent(e)).filter(Boolean);
    const evidence = safeEvidence.length > 0 ? `\n- **Evidence**: ${safeEvidence.join('; ')}` : '';
    const safeMitigations = r.mitigatingFactors
      .map((m) => sanitizeMarkdownContent(m))
      .filter(Boolean);
    const mitigations =
      safeMitigations.length > 0 ? `\n- **Mitigating Factors**: ${safeMitigations.join('; ')}` : '';
    const safeLikelihood = sanitizeMarkdownContent(String(r.likelihood));
    const safeLikelihoodValue = sanitizeMarkdownContent(String(r.likelihoodValue));
    const safeImpact = sanitizeMarkdownContent(String(r.impact));
    const safeImpactValue = sanitizeMarkdownContent(String(r.impactValue));
    const safeRiskScore = sanitizeMarkdownContent(String(r.riskScore));
    const safeRiskLevel = sanitizeMarkdownContent(String(r.riskLevel)).toUpperCase();
    const safeConfidence = sanitizeMarkdownContent(String(r.confidence));
    return [
      `### ${headingId}: ${headingDescription}`,
      `- **Likelihood**: ${safeLikelihood} (${safeLikelihoodValue}) | **Impact**: ${safeImpact} (${safeImpactValue}) | **Score**: ${safeRiskScore} (${safeRiskLevel}) | **Confidence**: ${safeConfidence}${evidence}${mitigations}`,
    ].join('\n');
  });
  return `\n## Identified Risks\n\n${lines.join('\n\n')}\n`;
}
/**
 * Sanitize a value for safe inclusion in a Markdown table cell.
 * Escapes backslash and pipe characters and replaces newlines with spaces.
 *
 * @param value - Raw cell value
 * @returns Sanitized string safe for Markdown tables
 */
function sanitizeMarkdownTableCell(value) {
  const normalized = (value ?? '').trim();
  if (normalized === '') {
    return 'N/A';
  }
  const withoutNewlines = normalized.replace(/[\r\n]+/g, ' ');
  const escapedBackslashes = withoutNewlines.replace(/\\/g, '\\\\');
  return escapedBackslashes.replace(/\|/g, '\\|');
}
/**
 * Sanitize a value for safe inclusion in Markdown headings and bullet content.
 * Strips newlines to prevent document structure injection.
 *
 * @param value - Raw value
 * @returns Sanitized string safe for Markdown headings/bullets
 */
function sanitizeMarkdownContent(value) {
  const normalized = String(value ?? '').trim();
  if (normalized === '') {
    return '';
  }
  return normalized.replace(/[\r\n]+/g, ' ');
}
/**
 * Sanitize a YAML scalar value for safe inclusion in YAML frontmatter.
 * Escapes double quotes and strips newlines to prevent YAML injection.
 *
 * @param value - Raw value
 * @returns Sanitized string safe for YAML double-quoted scalars
 */
function sanitizeYamlValue(value) {
  const normalized = String(value ?? '').trim();
  if (normalized === '') {
    return '';
  }
  const withoutNewlines = normalized.replace(/[\r\n]+/g, ' ');
  const escapedBackslashes = withoutNewlines.replace(/\\/g, '\\\\');
  return escapedBackslashes.replace(/"/g, '\\"');
}
/**
 * Build markdown for the evaluation matrix (risks ranked by score).
 *
 * @param matrix - Risks sorted by score
 * @returns Markdown string
 */
function buildEvaluateMarkdown(matrix) {
  if (matrix.length === 0) return '';
  const header = `\n## Risk Evaluation Matrix\n\n| Rank | Risk ID | Description | Score | Level | Confidence |\n|------|---------|-------------|-------|-------|------------|`;
  const rows = matrix.map((r, i) => {
    const riskId = sanitizeMarkdownTableCell(r.riskId);
    const rawDesc = r.description ?? '';
    const truncatedDesc = rawDesc.length > 60 ? `${rawDesc.substring(0, 60)}…` : rawDesc;
    const descCell = sanitizeMarkdownTableCell(truncatedDesc);
    const levelCell = sanitizeMarkdownTableCell(String(r.riskLevel).toUpperCase());
    const confidenceCell = sanitizeMarkdownTableCell(String(r.confidence));
    return `| ${i + 1} | ${riskId} | ${descCell} | ${r.riskScore} | ${levelCell} | ${confidenceCell} |`;
  });
  return `${header}\n${rows.join('\n')}\n`;
}
/**
 * Build markdown for the risk treatment / mitigation section.
 *
 * @param mitigations - List of mitigation actions
 * @returns Markdown string
 */
function buildTreatMarkdown(mitigations) {
  if (!Array.isArray(mitigations) || mitigations.length === 0) return '';
  const sanitizedItems = mitigations
    .map((m) => sanitizeMarkdownContent(String(m ?? '')))
    .filter((m) => m.length > 0);
  if (sanitizedItems.length === 0) return '';
  const items = sanitizedItems.map((m) => `- ${m}`).join('\n');
  return `\n## Risk Treatment Plan\n\n${items}\n`;
}
// ─── Factory helpers for creating scored SWOT items ──────────────────────────
/**
 * Create a scored SWOT item for a strength or weakness (score 0–5).
 * A score of 0 represents a neutral or not-currently-relevant factor.
 *
 * @param description - Description of the factor
 * @param score - Magnitude score (0–5; clamped)
 * @param evidence - Supporting evidence
 * @param confidence - Confidence level
 * @param trend - Trend direction
 * @returns ScoredSWOTItem
 */
export function createScoredSWOTItem(
  description,
  score,
  evidence = [],
  confidence = 'medium',
  trend = 'stable'
) {
  return {
    description,
    score: round2(clamp(score, 0, 5)),
    evidence,
    confidence,
    trend,
  };
}
/**
 * Create a scored SWOT item for an opportunity or threat
 * (score = probability × impact, range 0–4.5).
 *
 * @param description - Description of the factor
 * @param likelihood - Likelihood of occurrence
 * @param impact - Impact if it occurs
 * @param evidence - Supporting evidence
 * @param confidence - Confidence level
 * @param trend - Trend direction
 * @returns ScoredSWOTItem
 */
export function createScoredOpportunityOrThreat(
  description,
  likelihood,
  impact,
  evidence = [],
  confidence = 'medium',
  trend = 'stable'
) {
  if (!Object.hasOwn(LIKELIHOOD_VALUES, likelihood)) {
    throw new Error(
      `Invalid likelihood: "${String(likelihood)}". Expected one of: ${Object.keys(LIKELIHOOD_VALUES).join(', ')}`
    );
  }
  if (!Object.hasOwn(IMPACT_VALUES, impact)) {
    throw new Error(
      `Invalid impact: "${String(impact)}". Expected one of: ${Object.keys(IMPACT_VALUES).join(', ')}`
    );
  }
  // eslint-disable-next-line security/detect-object-injection -- keys validated via Object.hasOwn above
  const score = round2(LIKELIHOOD_VALUES[likelihood] * IMPACT_VALUES[impact]);
  return {
    description,
    score,
    evidence,
    confidence,
    trend,
  };
}
/**
 * Create a political risk driver.
 *
 * @param description - Description of the driver
 * @param category - Threat category
 * @param contribution - Percentage contribution to total risk (0–100)
 * @param trend - Whether risk is increasing, stable, or decreasing
 * @returns PoliticalRiskDriver
 */
export function createRiskDriver(description, category, contribution, trend = 'stable') {
  return {
    description,
    category,
    contribution: round2(clamp(contribution, 0, 100)),
    trend,
  };
}
//# sourceMappingURL=political-risk-assessment.js.map
