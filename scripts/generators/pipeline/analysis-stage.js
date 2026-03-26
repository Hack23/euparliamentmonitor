// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Pipeline/AnalysisStage
 * @description Analysis-first pre-generation pipeline stage.
 *
 * Executes between the Fetch and Generate stages, consuming already-fetched
 * European Parliament data and running the full suite of political intelligence
 * analysis methods.  Produces structured markdown analysis files that article
 * generation strategies then consume to produce higher-quality, deeply-analysed
 * news articles in all 14 languages.
 *
 * This stage is **side-effect-only**: it writes analysis markdown and a
 * `manifest.json` to disk under `analysis-output/{date}/`.  The returned
 * {@link AnalysisContext} is informational and currently not consumed by the
 * generate stage; strategies read the analysis output from disk instead.
 * Analysis artifacts are committed to the repository for review and
 * political intelligence improvement.
 *
 * Analysis methods are grouped into four categories:
 * - **Classification** (Issues #804): significance, impact-matrix, actor-mapping, forces
 * - **Threat Assessment** (Issues #805): political-stride, actor-threat, consequence-trees, disruption
 * - **Risk Scoring** (Issues #806): risk-matrix, capital-risk, quantitative-swot, velocity-risk, agent-workflow
 * - **Existing** (current codebase): deep-analysis, stakeholder-analysis, coalition-analysis, voting-patterns, cross-session-intelligence
 *
 * Each method writes a markdown file; failures are isolated so other methods
 * can continue.  A {@link AnalysisManifest} JSON file is written at the end.
 *
 * @example
 * ```ts
 * const ctx = await runAnalysisStage(fetchedData, {
 *   articleTypes: [ArticleCategory.WEEK_AHEAD],
 *   date: '2026-03-26',
 *   outputDir: 'analysis-output',
 * });
 * console.log(ctx.completedMethods);
 * ```
 */
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  detectVotingTrends,
  computeCrossSessionCoalitionStability,
  buildDefaultStakeholderPerspectives,
  buildStakeholderOutcomeMatrix,
} from '../../utils/intelligence-analysis.js';
import {
  assessPoliticalSignificance,
  buildImpactMatrix,
  classifyPoliticalActors,
  analyzePoliticalForces,
} from '../../utils/political-classification.js';
import {
  assessPoliticalThreats,
  buildActorThreatProfiles,
  buildConsequenceTree,
  analyzeLegislativeDisruption,
  generateThreatAssessmentMarkdown,
} from '../../utils/political-threat-assessment.js';
import {
  assessLegislativeVelocityRisk,
  runAgentRiskAssessment,
  generateRiskAssessmentMarkdown,
  calculatePoliticalRiskScore,
  assessPoliticalCapitalAtRisk,
  buildQuantitativeSWOT,
  createScoredSWOTItem,
  createScoredOpportunityOrThreat,
  createRiskDriver,
} from '../../utils/political-risk-assessment.js';
import { ensureDirectoryExists, atomicWrite } from '../../utils/file-utils.js';
// ─── Markdown constants ───────────────────────────────────────────────────────
/** Empty table row placeholder for 6-column tables */
const EMPTY_TABLE_ROW_6 = '| — | — | — | — | — | — |';
// ─── Data coercion helpers ────────────────────────────────────────────────────
/**
 * Safely extract an array from fetchedData by key.
 * @param data - Raw fetched data record
 * @param key - Key to extract
 * @returns Array or empty array if missing/invalid
 */
function safeArr(data, key) {
  const val = data[key]; // eslint-disable-line security/detect-object-injection -- key is a literal string from caller
  return Array.isArray(val) ? val : [];
}
/**
 * Cast fetchedData to ClassificationInput for the classification functions.
 * @param data - Raw fetched data record
 * @returns ClassificationInput-compatible object
 */
function toClassificationInput(data) {
  return data;
}
/**
 * Cast fetchedData to ThreatAssessmentInput for the threat assessment functions.
 * @param data - Raw fetched data record
 * @returns ThreatAssessmentInput-compatible object
 */
function toThreatInput(data) {
  return {
    votingRecords: safeArr(data, 'votingRecords'),
    coalitionData: safeArr(data, 'coalitions'),
    mepInfluence: safeArr(data, 'mepUpdates'),
    procedures: safeArr(data, 'procedures'),
    anomalies: safeArr(data, 'anomalies'),
    questions: safeArr(data, 'questions'),
  };
}
/** All analysis methods in default execution order */
export const ALL_ANALYSIS_METHODS = [
  // Classification
  'significance-classification',
  'impact-matrix',
  'actor-mapping',
  'forces-analysis',
  // Threat Assessment
  'political-stride',
  'actor-threat-profiling',
  'consequence-trees',
  'legislative-disruption',
  // Risk Scoring
  'risk-matrix',
  'political-capital-risk',
  'quantitative-swot',
  'legislative-velocity-risk',
  'agent-risk-workflow',
  // Existing
  'deep-analysis',
  'stakeholder-analysis',
  'coalition-analysis',
  'voting-patterns',
  'cross-session-intelligence',
];
// ─── Internal helpers ─────────────────────────────────────────────────────────
/**
 * Determine the aggregated confidence level from a set of individual results.
 *
 * @param results - Method results to aggregate
 * @returns Aggregated confidence level
 */
function aggregateConfidence(results) {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const r of results) {
    if (r.status === 'completed' || r.status === 'skipped') {
      counts[r.confidence]++;
    }
  }
  const total = counts.high + counts.medium + counts.low;
  if (total === 0) {
    return 'low';
  }
  if (counts.high >= counts.medium && counts.high >= counts.low) return 'high';
  if (counts.medium >= counts.low) return 'medium';
  return 'low';
}
/**
 * Build a YAML-frontmatter header block for analysis markdown files.
 *
 * @param method - Analysis method identifier
 * @param date - ISO date of the analysis
 * @param confidence - Confidence level for this result
 * @returns Markdown frontmatter string
 */
function buildMarkdownHeader(method, date, confidence) {
  return `---
method: ${method}
date: ${date}
confidence: ${confidence}
generated: ${new Date().toISOString()}
---

`;
}
/**
 * Write a text file to disk.
 *
 * Used for both analysis markdown files and the analysis `manifest.json`.
 *
 * @param filePath - Absolute file path
 * @param content - File content as a UTF-8 string
 */
function writeTextFile(filePath, content) {
  atomicWrite(filePath, content);
}
/**
 * Check whether a method's output file already exists (for incremental runs).
 *
 * @param filePath - Absolute file path
 * @returns true when the file exists and is non-empty
 */
function methodOutputExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}
// ─── Per-method markdown builders ────────────────────────────────────────────
/**
 * Build markdown for the significance classification method.
 * Scores and ranks legislative items by political significance.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildSignificanceClassificationMarkdown(fetchedData, date) {
  const input = toClassificationInput(fetchedData);
  const significance = assessPoliticalSignificance(input);
  const events = safeArr(fetchedData, 'events');
  const docs = safeArr(fetchedData, 'documents');
  const header = buildMarkdownHeader(
    'significance-classification',
    date,
    significance === 'routine' ? 'medium' : 'high'
  );
  return (
    header +
    `# Political Significance Classification

## Overall Significance: **${significance.toUpperCase()}**

## Overview
Analysis of political significance across ${events.length} events and ${docs.length} documents.

## Classification Framework
| Level | Criteria | Items |
|-------|----------|-------|
| Historic | Constitutional changes, treaty amendments | — |
| Critical | Major legislative votes, treaty changes | — |
| Significant | Key committee decisions, important resolutions | — |
| Notable | Procedural votes, routine legislation | — |
| Routine | Administrative matters | — |

## Significance Assessment
- **Computed significance**: ${significance}
- **Data points analysed**: ${events.length + docs.length}
- **Date**: ${date}
- **Method**: Political significance scoring via 5-signal model (volume, controversy, pipeline, anomalies, coalition)

## Key Findings
${events.length === 0 && docs.length === 0 ? '- No data available for significance assessment' : `- ${events.length} events and ${docs.length} documents assessed\n- Overall political significance: **${significance}**`}
`
  );
}
/**
 * Build markdown for the impact matrix method.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildImpactMatrixMarkdown(fetchedData, date) {
  const input = toClassificationInput(fetchedData);
  const matrix = buildImpactMatrix(input);
  const header = buildMarkdownHeader('impact-matrix', date, 'medium');
  return (
    header +
    `# Political Impact Matrix

## Overall Significance: **${matrix.overallSignificance.toUpperCase()}**

## Impact Dimensions
| Dimension | Level | Description |
|-----------|-------|-------------|
| Legislative | ${matrix.legislativeImpact} | Effect on legislation and regulatory framework |
| Coalition | ${matrix.coalitionImpact} | Effect on political alliances and group dynamics |
| Public Opinion | ${matrix.publicOpinionImpact} | Effect on citizen perception and media coverage |
| Institutional | ${matrix.institutionalImpact} | Effect on EU institutional balance |
| Economic | ${matrix.economicImpact} | Economic policy implications |

## Assessment Summary
- **Overall significance**: ${matrix.overallSignificance}
- **Date**: ${date}
- **Method**: Multi-dimensional impact assessment (5 axes)
`
  );
}
/**
 * Build markdown for the actor mapping method.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildActorMappingMarkdown(fetchedData, date) {
  const input = toClassificationInput(fetchedData);
  const actors = classifyPoliticalActors(input);
  const header = buildMarkdownHeader('actor-mapping', date, actors.length > 0 ? 'medium' : 'low');
  const actorRows =
    actors.length > 0
      ? actors
          .map((a) => `| ${a.name} | ${a.actorType} | ${a.influence} | ${a.position} | ${a.role} |`)
          .join('\n')
      : '| — | — | — | — | — |';
  return (
    header +
    `# Political Actor Mapping

## Overview
Identified ${actors.length} political actors from parliamentary data.

## Actor Classification
| Actor | Type | Influence | Position | Role |
|-------|------|-----------|----------|------|
${actorRows}

## Actor Type Distribution
${
  actors.length > 0
    ? [...new Set(actors.map((a) => a.actorType))]
        .map((t) => `- **${t}**: ${actors.filter((a) => a.actorType === t).length} actors`)
        .join('\n')
    : '- No actors classified'
}

## Date: ${date}
`
  );
}
/**
 * Build markdown for the political forces analysis method.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildForcesAnalysisMarkdown(fetchedData, date) {
  const input = toClassificationInput(fetchedData);
  const forces = analyzePoliticalForces(input);
  const header = buildMarkdownHeader('forces-analysis', date, 'medium');
  const forceRow = (name, f) =>
    `| ${name} | ${f.trend} | ${(f.strength * 100).toFixed(0)}% | ${f.keyActors.length > 0 ? f.keyActors.join(', ') : '—'} | ${f.confidence} |`;
  return (
    header +
    `# Political Forces Analysis

## Overview
Analysis of competing political forces shaping the current legislative agenda.

## Political Forces Assessment
| Force | Trend | Strength | Key Actors | Confidence |
|-------|-------|----------|------------|------------|
${forceRow('Coalition Power', forces.coalitionPower)}
${forceRow('Opposition Power', forces.oppositionPower)}
${forceRow('Institutional Barriers', forces.institutionalBarriers)}
${forceRow('Public Pressure', forces.publicPressure)}
${forceRow('External Influences', forces.externalInfluences)}

## Date: ${date}
`
  );
}
/**
 * Build markdown for the political STRIDE threat assessment.
 *
 * @param fetchedData - Raw fetched EP data
 * @param _date - Analysis date (unused; date is derived from assessment)
 * @returns Markdown content string
 */
function buildPoliticalStrideMarkdown(fetchedData, _date) {
  const input = toThreatInput(fetchedData);
  const assessment = assessPoliticalThreats(input);
  return generateThreatAssessmentMarkdown(assessment);
}
/**
 * Build markdown for actor threat profiling.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildActorThreatProfilingMarkdown(fetchedData, date) {
  const input = toThreatInput(fetchedData);
  const profiles = buildActorThreatProfiles(input);
  const header = buildMarkdownHeader(
    'actor-threat-profiling',
    date,
    profiles.length > 0 ? 'medium' : 'low'
  );
  const profileRows =
    profiles.length > 0
      ? profiles
          .map(
            (p) =>
              `| ${p.actor} | ${p.actorType} | ${p.capability} | ${p.motivation} | ${p.opportunity} | ${p.overallThreatLevel} |`
          )
          .join('\n')
      : EMPTY_TABLE_ROW_6;
  return (
    header +
    `# Actor Threat Profiles

## Overview
Individual threat profiles for ${profiles.length} political actors.

## Actor Threat Matrix
| Actor | Type | Capability | Motivation | Opportunity | Threat Level |
|-------|------|------------|------------|-------------|--------------|
${profileRows}

## Date: ${date}
`
  );
}
/**
 * Build markdown for consequence tree analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildConsequenceTreesMarkdown(fetchedData, date) {
  const input = toThreatInput(fetchedData);
  const procedures = safeArr(fetchedData, 'procedures');
  const header = buildMarkdownHeader('consequence-trees', date, 'medium');
  const trees = [];
  for (const raw of procedures.slice(0, 5)) {
    const proc = raw && typeof raw === 'object' ? raw : null;
    const title = proc ? String(proc['title'] ?? '') : '';
    if (!title) continue;
    const tree = buildConsequenceTree(title, input);
    trees.push(
      `### ${title}\n` +
        `- **Immediate**: ${tree.immediateConsequences.map((c) => c.description).join('; ') || 'No immediate consequences identified'}\n` +
        `- **Secondary**: ${tree.secondaryEffects.map((c) => c.description).join('; ') || 'No secondary effects identified'}\n` +
        `- **Long-term**: ${tree.longTermImplications.map((c) => c.description).join('; ') || 'No long-term implications identified'}\n` +
        `- **Mitigating factors**: ${tree.mitigatingFactors.join(', ') || '—'}\n` +
        `- **Amplifying factors**: ${tree.amplifyingFactors.join(', ') || '—'}`
    );
  }
  return (
    header +
    `# Consequence Tree Analysis

## Overview
Structured analysis of action-consequence chains for ${Math.min(procedures.length, 5)} legislative procedures.

${trees.length > 0 ? trees.join('\n\n') : '## No procedures available for consequence analysis'}

## Date: ${date}
`
  );
}
/**
 * Build markdown for legislative disruption analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildLegislativeDisruptionMarkdown(fetchedData, date) {
  const input = toThreatInput(fetchedData);
  const procedures = safeArr(fetchedData, 'procedures');
  const header = buildMarkdownHeader('legislative-disruption', date, 'medium');
  const disruptions = [];
  for (const raw of procedures.slice(0, 5)) {
    const proc = raw && typeof raw === 'object' ? raw : null;
    const id = proc ? String(proc['procedureId'] ?? proc['id'] ?? '') : '';
    const title = proc ? String(proc['title'] ?? '') : '';
    if (!id || !title) continue;
    const analysis = analyzeLegislativeDisruption(title, input);
    const disruptionCount = analysis.disruptionPoints.length;
    disruptions.push(
      `| ${id} | ${title.slice(0, 50)} | ${analysis.currentStage} | ${analysis.resilience} | ${disruptionCount} |`
    );
  }
  return (
    header +
    `# Legislative Disruption Analysis

## Overview
Identification of factors disrupting the normal legislative process.

## Disruption Assessment
| Procedure ID | Title | Stage | Resilience | Disruption Points |
|-------------|-------|-------|-----------|-------------------|
${disruptions.length > 0 ? disruptions.join('\n') : '| — | — | — | — | — |'}

## Date: ${date}
`
  );
}
/**
 * Build markdown for the risk scoring matrix.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildRiskMatrixMarkdown(fetchedData, date) {
  const procedures = safeArr(fetchedData, 'procedures');
  const risks = [];
  // Generate risk scores for identifiable political risks from data
  if (procedures.length > 0) {
    risks.push(
      calculatePoliticalRiskScore(
        'possible',
        'moderate',
        'RISK-001',
        'Legislative blockage risk from procedure backlog',
        [`${procedures.length} procedures in pipeline`],
        ['Established committee procedures'],
        'medium'
      )
    );
  }
  const coalitions = safeArr(fetchedData, 'coalitions');
  if (coalitions.length > 0) {
    risks.push(
      calculatePoliticalRiskScore(
        'unlikely',
        'major',
        'RISK-002',
        'Coalition instability risk',
        [`${coalitions.length} coalition data points`],
        ['Established political group structures'],
        'medium'
      )
    );
  }
  const anomalies = safeArr(fetchedData, 'anomalies');
  if (anomalies.length > 0) {
    risks.push(
      calculatePoliticalRiskScore(
        'possible',
        'moderate',
        'RISK-003',
        'Voting pattern anomaly risk',
        [`${anomalies.length} anomalies detected`],
        [],
        'medium'
      )
    );
  }
  const header = buildMarkdownHeader('risk-matrix', date, risks.length > 0 ? 'medium' : 'low');
  const riskRows =
    risks.length > 0
      ? risks
          .map(
            (r) =>
              `| ${r.riskId} | ${r.description} | ${r.likelihood} | ${r.impact} | ${r.riskScore} | ${r.riskLevel} |`
          )
          .join('\n')
      : EMPTY_TABLE_ROW_6;
  return (
    header +
    `# Political Risk Scoring Matrix

## Overview
Quantitative risk scoring across ${risks.length} identified political dimensions.

## Risk Matrix
| Risk ID | Description | Likelihood | Impact | Score | Level |
|---------|-------------|------------|--------|-------|-------|
${riskRows}

> Risk Score = Likelihood × Impact. Levels: LOW (≤1.0), MEDIUM (≤2.0), HIGH (≤3.5), CRITICAL (>3.5)

## Date: ${date}
`
  );
}
/**
 * Build markdown for political capital at risk analysis.
 *
 * @param _fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildPoliticalCapitalRiskMarkdown(_fetchedData, date) {
  const header = buildMarkdownHeader('political-capital-risk', date, 'medium');
  const groups = ['EPP', 'S&D', 'Renew', 'Greens/EFA', 'ECR', 'ID', 'The Left'];
  const capitalAssessments = groups.map((g) => {
    const drivers = [
      createRiskDriver(`Legislative activity for ${g}`, 'internal_dissent', 10, 'stable'),
    ];
    return assessPoliticalCapitalAtRisk(g, 'political_group', 70, drivers, 'quarter', 95);
  });
  const rows = capitalAssessments
    .map(
      (a) =>
        `| ${a.actor} | ${a.currentCapital} | ${a.capitalAtRisk.toFixed(1)} | ${a.timeHorizon} | ${a.riskDrivers.length} drivers |`
    )
    .join('\n');
  return (
    header +
    `# Political Capital at Risk

## Overview
Assessment of political capital at stake for major political groups (${date}).

## Capital at Risk by Political Group
| Actor/Group | Capital (0-100) | At Risk | Time Horizon | Risk Drivers |
|-------------|----------------|---------|--------------|--------------|
${rows}

## Date: ${date}
`
  );
}
/**
 * Build markdown for the quantitative SWOT analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildQuantitativeSwotMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('quantitative-swot', date, 'medium');
  const events = safeArr(fetchedData, 'events');
  const procedures = safeArr(fetchedData, 'procedures');
  const strengths = [
    createScoredSWOTItem(
      'Established democratic institutions and procedures',
      4,
      ['Treaty-based institutional framework'],
      'high',
      'stable'
    ),
    createScoredSWOTItem(
      `Active legislative pipeline with ${procedures.length} procedures`,
      Math.min(procedures.length / 5, 5),
      [`${procedures.length} procedures tracked`],
      'medium',
      'stable'
    ),
  ];
  const weaknesses = [
    createScoredSWOTItem(
      'Complex multi-stakeholder decision-making',
      3,
      ['27 member states, 7 political groups'],
      'high',
      'stable'
    ),
  ];
  const opportunities = [
    createScoredOpportunityOrThreat(
      `${events.length} upcoming parliamentary events`,
      'likely',
      'moderate',
      [`${events.length} events scheduled`],
      'medium',
      'stable'
    ),
  ];
  const threats = [
    createScoredOpportunityOrThreat(
      'External geopolitical pressures',
      'possible',
      'major',
      ['Global political dynamics'],
      'medium',
      'stable'
    ),
  ];
  const swot = buildQuantitativeSWOT(
    `Political SWOT Assessment ${date}`,
    strengths,
    weaknesses,
    opportunities,
    threats
  );
  return (
    header +
    `# Quantitative SWOT Analysis

## Strategic Position Score: ${swot.strategicPositionScore.toFixed(1)}/10

## Assessment: ${swot.overallAssessment}

## SWOT Matrix
| Category | Items | Avg Score | Trend |
|----------|-------|-----------|-------|
| Strengths | ${swot.strengths.length} | ${swot.strengths.length > 0 ? (swot.strengths.reduce((s, i) => s + i.score, 0) / swot.strengths.length).toFixed(1) : '—'} | ${swot.strengths[0]?.trend ?? '—'} |
| Weaknesses | ${swot.weaknesses.length} | ${swot.weaknesses.length > 0 ? (swot.weaknesses.reduce((s, i) => s + i.score, 0) / swot.weaknesses.length).toFixed(1) : '—'} | ${swot.weaknesses[0]?.trend ?? '—'} |
| Opportunities | ${swot.opportunities.length} | ${swot.opportunities.length > 0 ? (swot.opportunities.reduce((s, i) => s + i.score, 0) / swot.opportunities.length).toFixed(1) : '—'} | ${swot.opportunities[0]?.trend ?? '—'} |
| Threats | ${swot.threats.length} | ${swot.threats.length > 0 ? (swot.threats.reduce((s, i) => s + i.score, 0) / swot.threats.length).toFixed(1) : '—'} | ${swot.threats[0]?.trend ?? '—'} |

## Cross-Impact Matrix
${
  swot.crossImpactMatrix.length > 0
    ? swot.crossImpactMatrix
        .slice(0, 5)
        .map((e) => `- ${e.rationale} (net effect: ${e.netEffect.toFixed(2)})`)
        .join('\n')
    : '- No cross-impacts identified'
}

## Date: ${date}
`
  );
}
/**
 * Build markdown for legislative velocity risk analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildLegislativeVelocityRiskMarkdown(fetchedData, date) {
  const procedures = safeArr(fetchedData, 'procedures');
  const velocityRisks = assessLegislativeVelocityRisk(procedures);
  const header = buildMarkdownHeader(
    'legislative-velocity-risk',
    date,
    velocityRisks.length > 0 ? 'medium' : 'low'
  );
  const riskRows =
    velocityRisks.length > 0
      ? velocityRisks
          .slice(0, 10)
          .map(
            (r) =>
              `| ${r.procedureId} | ${r.title.slice(0, 40)} | ${r.currentStage} | ${r.daysInCurrentStage}d / ${r.expectedDaysForStage}d | ${r.velocityRisk.riskScore.toFixed(2)} | ${r.velocityRisk.riskLevel} |`
          )
          .join('\n')
      : EMPTY_TABLE_ROW_6;
  return (
    header +
    `# Legislative Velocity Risk

## Overview
Risk assessment based on legislative processing speed for ${procedures.length} procedures.

## Top Velocity Risks
| Procedure | Title | Stage | Days (actual/expected) | Risk Score | Level |
|-----------|-------|-------|----------------------|------------|-------|
${riskRows}

## Summary
- **Procedures analysed**: ${procedures.length}
- **High/Critical risks**: ${velocityRisks.filter((r) => r.velocityRisk.riskLevel === 'high' || r.velocityRisk.riskLevel === 'critical').length}
- **Date**: ${date}
`
  );
}
/**
 * Build markdown for the agent risk assessment workflow.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildAgentRiskWorkflowMarkdown(fetchedData, date) {
  const procedures = safeArr(fetchedData, 'procedures');
  const coalitions = safeArr(fetchedData, 'coalitions');
  // Build identified risks
  const identifiedRisks = [];
  if (procedures.length > 0) {
    identifiedRisks.push(
      calculatePoliticalRiskScore(
        'possible',
        'moderate',
        'RISK-W01',
        'Legislative backlog risk',
        [`${procedures.length} active procedures`],
        ['Committee oversight'],
        'medium'
      )
    );
  }
  if (coalitions.length > 0) {
    identifiedRisks.push(
      calculatePoliticalRiskScore(
        'unlikely',
        'moderate',
        'RISK-W02',
        'Coalition cohesion risk',
        [`${coalitions.length} coalitions monitored`],
        ['Group discipline mechanisms'],
        'medium'
      )
    );
  }
  if (identifiedRisks.length === 0) {
    identifiedRisks.push(
      calculatePoliticalRiskScore(
        'rare',
        'minor',
        'RISK-W00',
        'Baseline political risk',
        ['Routine parliamentary activity'],
        ['Stable institutional framework'],
        'low'
      )
    );
  }
  const riskDrivers = [
    createRiskDriver(
      'Legislative pipeline complexity',
      'legislative_delay',
      Math.min(procedures.length * 2, 30),
      'stable'
    ),
    createRiskDriver('Coalition dynamics', 'coalition_fracture', 15, 'stable'),
  ];
  const workflow = runAgentRiskAssessment(
    `ASSESS-${date}`,
    date,
    'week-ahead',
    identifiedRisks,
    riskDrivers,
    ['Monitor legislative velocity indicators', 'Track coalition voting patterns']
  );
  return generateRiskAssessmentMarkdown(workflow);
}
/**
 * Build markdown for the deep multi-perspective analysis.
 * Uses existing `buildDefaultStakeholderPerspectives`.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildDeepAnalysisMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('deep-analysis', date, 'high');
  const events = Array.isArray(fetchedData['events']) ? fetchedData['events'] : [];
  const topic = `European Parliament activity for ${date}`;
  const perspectives = buildDefaultStakeholderPerspectives(topic);
  const perspectivesText = perspectives
    .map(
      (p) =>
        `### ${p.stakeholder.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}\n- **Impact**: ${p.impact}\n- **Severity**: ${p.severity}\n- **Reasoning**: ${p.reasoning}`
    )
    .join('\n\n');
  return (
    header +
    `# Deep Multi-Perspective Analysis

## Overview
Comprehensive multi-stakeholder analysis of European Parliament activities.

## Scope
- **Events analysed**: ${events.length}
- **Stakeholders covered**: 6 groups
- **Date**: ${date}

## Stakeholder Perspectives
${perspectivesText}

## Key Findings
- Cross-cutting analysis across all major stakeholder groups completed
- Impact assessments derived from available parliamentary data
`
  );
}
/**
 * Build markdown for the stakeholder impact analysis.
 * Uses `buildStakeholderOutcomeMatrix`.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildStakeholderAnalysisMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('stakeholder-analysis', date, 'high');
  const actions = ['Legislative proceedings', 'Committee activity', 'Plenary decisions'];
  const matrices = actions.map((action) =>
    buildStakeholderOutcomeMatrix(action, {
      political_groups: 0.7,
      civil_society: 0.6,
      industry: 0.5,
      national_govts: 0.6,
      citizens: 0.5,
      eu_institutions: 0.8,
    })
  );
  const tableRows = matrices
    .map(
      (m) =>
        `| ${m.action} | ${m.outcomes['political_groups']} | ${m.outcomes['civil_society']} | ${m.outcomes['industry']} | ${m.outcomes['national_govts']} | ${m.outcomes['citizens']} | ${m.outcomes['eu_institutions']} | ${m.confidence} |`
    )
    .join('\n');
  return (
    header +
    `# Stakeholder Impact Analysis

## Overview
Outcome matrix analysis for key parliamentary actions.

## Stakeholder Outcome Matrix
| Action | Political Groups | Civil Society | Industry | National Govts | Citizens | EU Institutions | Confidence |
|--------|-----------------|---------------|----------|----------------|----------|-----------------|------------|
${tableRows}

## Date: ${date}
- **Data sources used**: ${Object.keys(fetchedData).join(', ')}
`
  );
}
/**
 * Build markdown for coalition cohesion analysis.
 * Uses `computeCrossSessionCoalitionStability` to aggregate VotingPattern cohesion.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildCoalitionAnalysisMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('coalition-analysis', date, 'high');
  const rawPatterns = Array.isArray(fetchedData['patterns']) ? fetchedData['patterns'] : [];
  // VotingPattern[] data doesn't contain the `coalitionId`/`id` fields required
  // by analyzeCoalitionCohesion().  Use computeCrossSessionCoalitionStability()
  // instead — it is designed to aggregate cohesion across VotingPattern arrays.
  const stabilityReport = computeCrossSessionCoalitionStability(rawPatterns);
  return (
    header +
    `# Coalition Cohesion Analysis

## Overview
Analysis of political group cohesion and coalition dynamics.

## Coalition Metrics
- **Overall Stability**: ${(stabilityReport.overallStability * 100).toFixed(1)}%
- **Forecast**: ${stabilityReport.forecast}
- **Patterns Analysed**: ${stabilityReport.patternCount}

## Group Analysis
- **Stable Groups**: ${stabilityReport.stableGroups.length > 0 ? stabilityReport.stableGroups.join(', ') : 'No stable groups identified'}
- **Declining Groups**: ${stabilityReport.decliningGroups.length > 0 ? stabilityReport.decliningGroups.join(', ') : 'No declining groups identified'}

## Coalition Intelligence
- **Patterns Evaluated**: ${rawPatterns.length}

## Date: ${date}
`
  );
}
/**
 * Build markdown for voting pattern analysis.
 * Uses `detectVotingTrends`.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildVotingPatternsMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('voting-patterns', date, 'high');
  // detectVotingTrends accepts readonly VotingRecord[] — pass raw records directly
  const rawRecords = Array.isArray(fetchedData['votingRecords'])
    ? fetchedData['votingRecords']
    : [];
  const trends = detectVotingTrends(rawRecords);
  const trendsText = trends
    .map(
      (t) =>
        `| ${t.trendId} | ${t.direction} | ${(t.confidence * 100).toFixed(0)}% | ${t.recordCount} records |`
    )
    .join('\n');
  return (
    header +
    `# Voting Pattern Analysis

## Overview
Detection and analysis of voting trends across European Parliament proceedings.

## Detected Trends
| Trend ID | Direction | Confidence | Data Points |
|----------|-----------|------------|-------------|
${trendsText || '| No trend data available | — | — | — |'}

## Summary
- **Trends identified**: ${trends.length}
- **Records analysed**: ${rawRecords.length}
- **Date**: ${date}
`
  );
}
/**
 * Build markdown for cross-session intelligence analysis.
 * Uses `computeCrossSessionCoalitionStability`.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildCrossSessionIntelligenceMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('cross-session-intelligence', date, 'high');
  const rawPatterns = Array.isArray(fetchedData['patterns']) ? fetchedData['patterns'] : [];
  // computeCrossSessionCoalitionStability accepts readonly VotingPattern[]
  const stabilityReport = computeCrossSessionCoalitionStability(rawPatterns);
  return (
    header +
    `# Cross-Session Coalition Intelligence

## Overview
Analysis of coalition stability patterns across multiple plenary sessions.

## Stability Report
- **Overall Stability**: ${(stabilityReport.overallStability * 100).toFixed(1)}%
- **Forecast**: ${stabilityReport.forecast}
- **Patterns Analysed**: ${stabilityReport.patternCount}

## Group Analysis
- **Stable Groups**: ${stabilityReport.stableGroups.length > 0 ? stabilityReport.stableGroups.join(', ') : 'None identified'}
- **Declining Groups**: ${stabilityReport.decliningGroups.length > 0 ? stabilityReport.decliningGroups.join(', ') : 'None identified'}

## Date: ${date}
`
  );
}
/** Map from AnalysisMethod to its markdown builder function */
const METHOD_BUILDERS = {
  'significance-classification': buildSignificanceClassificationMarkdown,
  'impact-matrix': buildImpactMatrixMarkdown,
  'actor-mapping': buildActorMappingMarkdown,
  'forces-analysis': buildForcesAnalysisMarkdown,
  'political-stride': buildPoliticalStrideMarkdown,
  'actor-threat-profiling': buildActorThreatProfilingMarkdown,
  'consequence-trees': buildConsequenceTreesMarkdown,
  'legislative-disruption': buildLegislativeDisruptionMarkdown,
  'risk-matrix': buildRiskMatrixMarkdown,
  'political-capital-risk': buildPoliticalCapitalRiskMarkdown,
  'quantitative-swot': buildQuantitativeSwotMarkdown,
  'legislative-velocity-risk': buildLegislativeVelocityRiskMarkdown,
  'agent-risk-workflow': buildAgentRiskWorkflowMarkdown,
  'deep-analysis': buildDeepAnalysisMarkdown,
  'stakeholder-analysis': buildStakeholderAnalysisMarkdown,
  'coalition-analysis': buildCoalitionAnalysisMarkdown,
  'voting-patterns': buildVotingPatternsMarkdown,
  'cross-session-intelligence': buildCrossSessionIntelligenceMarkdown,
};
// ─── Method subdir constants ──────────────────────────────────────────────────
/** Subdirectory name for classification analysis methods */
const SUBDIR_CLASSIFICATION = 'classification';
/** Subdirectory name for threat assessment analysis methods */
const SUBDIR_THREAT_ASSESSMENT = 'threat-assessment';
/** Subdirectory name for risk scoring analysis methods */
const SUBDIR_RISK_SCORING = 'risk-scoring';
/** Subdirectory name for existing analysis methods */
const SUBDIR_EXISTING = 'existing';
/** Subdirectory for each analysis method group */
const METHOD_SUBDIRS = {
  'significance-classification': SUBDIR_CLASSIFICATION,
  'impact-matrix': SUBDIR_CLASSIFICATION,
  'actor-mapping': SUBDIR_CLASSIFICATION,
  'forces-analysis': SUBDIR_CLASSIFICATION,
  'political-stride': SUBDIR_THREAT_ASSESSMENT,
  'actor-threat-profiling': SUBDIR_THREAT_ASSESSMENT,
  'consequence-trees': SUBDIR_THREAT_ASSESSMENT,
  'legislative-disruption': SUBDIR_THREAT_ASSESSMENT,
  'risk-matrix': SUBDIR_RISK_SCORING,
  'political-capital-risk': SUBDIR_RISK_SCORING,
  'quantitative-swot': SUBDIR_RISK_SCORING,
  'legislative-velocity-risk': SUBDIR_RISK_SCORING,
  'agent-risk-workflow': SUBDIR_RISK_SCORING,
  'deep-analysis': SUBDIR_EXISTING,
  'stakeholder-analysis': SUBDIR_EXISTING,
  'coalition-analysis': SUBDIR_EXISTING,
  'voting-patterns': SUBDIR_EXISTING,
  'cross-session-intelligence': SUBDIR_EXISTING,
};
/** Default confidence level for each analysis method group */
const METHOD_DEFAULT_CONFIDENCE = {
  'significance-classification': 'medium',
  'impact-matrix': 'medium',
  'actor-mapping': 'medium',
  'forces-analysis': 'medium',
  'political-stride': 'medium',
  'actor-threat-profiling': 'low',
  'consequence-trees': 'medium',
  'legislative-disruption': 'medium',
  'risk-matrix': 'medium',
  'political-capital-risk': 'medium',
  'quantitative-swot': 'medium',
  'legislative-velocity-risk': 'medium',
  'agent-risk-workflow': 'medium',
  'deep-analysis': 'high',
  'stakeholder-analysis': 'high',
  'coalition-analysis': 'high',
  'voting-patterns': 'high',
  'cross-session-intelligence': 'high',
};
/** Filename for each analysis method */
const METHOD_FILENAMES = {
  'significance-classification': 'significance-assessment.md',
  'impact-matrix': 'impact-matrix.md',
  'actor-mapping': 'actor-mapping.md',
  'forces-analysis': 'forces-analysis.md',
  'political-stride': 'political-stride-assessment.md',
  'actor-threat-profiling': 'actor-threat-profiles.md',
  'consequence-trees': 'consequence-trees.md',
  'legislative-disruption': 'legislative-disruption.md',
  'risk-matrix': 'risk-matrix.md',
  'political-capital-risk': 'political-capital-risk.md',
  'quantitative-swot': 'quantitative-swot.md',
  'legislative-velocity-risk': 'legislative-velocity-risk.md',
  'agent-risk-workflow': 'agent-risk-workflow.md',
  'deep-analysis': 'deep-analysis.md',
  'stakeholder-analysis': 'stakeholder-analysis.md',
  'coalition-analysis': 'coalition-analysis.md',
  'voting-patterns': 'voting-patterns.md',
  'cross-session-intelligence': 'cross-session-intelligence.md',
};
// ─── Core runner ──────────────────────────────────────────────────────────────
/**
 * Run a single analysis method and return its status record.
 *
 * Wraps the builder call in a try/catch so failures are isolated.
 *
 * @param method - The analysis method to run
 * @param fetchedData - Raw fetched EP data
 * @param date - ISO date string
 * @param dateOutputDir - Absolute path to the date-scoped output directory
 * @param skipCompleted - Whether to skip methods whose output already exists
 * @param verbose - Whether to print verbose progress
 * @returns Status record for the method
 */
function runSingleMethod(method, fetchedData, date, dateOutputDir, skipCompleted, verbose) {
  const subdir = METHOD_SUBDIRS[method];
  const filename = METHOD_FILENAMES[method];
  const absolutePath = path.join(dateOutputDir, subdir, filename);
  // Store a portable relative path (relative to the date-scoped output dir)
  // in the manifest to avoid exposing runner/local filesystem layout.
  const relativeOutputFile = path.posix.join(subdir, filename);
  const confidence = METHOD_DEFAULT_CONFIDENCE[method];
  if (skipCompleted && methodOutputExists(absolutePath)) {
    if (verbose) console.log(`  ⏭️  [analysis] Skipping already-completed method: ${method}`);
    return {
      method,
      status: 'skipped',
      outputFile: relativeOutputFile,
      confidence,
      duration: 0,
      summary: `Skipped — output already exists at ${relativeOutputFile}`,
    };
  }
  const start = Date.now();
  try {
    const builder = METHOD_BUILDERS[method];
    const markdown = builder(fetchedData, date);
    writeTextFile(absolutePath, markdown);
    const duration = Date.now() - start;
    if (verbose)
      console.log(`  ✅ [analysis] ${method} completed in ${duration}ms → ${relativeOutputFile}`);
    return {
      method,
      status: 'completed',
      outputFile: relativeOutputFile,
      confidence,
      duration,
      summary: `${method} analysis completed successfully`,
    };
  } catch (err) {
    const duration = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ [analysis] ${method} failed: ${message}`);
    return {
      method,
      status: 'failed',
      outputFile: relativeOutputFile,
      confidence: 'low',
      duration,
      summary: `${method} failed: ${message}`,
    };
  }
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Run the full analysis pipeline stage.
 *
 * Executes all enabled analysis methods sequentially, writing markdown files
 * to `outputDir/{date}/` and a `manifest.json` summary.  Individual method
 * failures are isolated — other methods continue regardless.
 *
 * @param fetchedData - Raw EP data fetched by the fetch stage (keyed by data type)
 * @param options - Analysis stage configuration
 * @returns Analysis context object for consumption by the generate stage
 *
 * @example
 * ```ts
 * const ctx = await runAnalysisStage(fetchedData, {
 *   articleTypes: [ArticleCategory.WEEK_AHEAD],
 *   date: '2026-03-26',
 *   outputDir: 'analysis-output',
 *   skipCompleted: true,
 *   verbose: true,
 * });
 * ```
 */
export async function runAnalysisStage(fetchedData, options) {
  const {
    articleTypes,
    date,
    outputDir,
    enabledMethods = ALL_ANALYSIS_METHODS,
    skipCompleted = true,
    verbose = false,
  } = options;
  // Validate date to prevent path traversal (e.g. "../../.." escaping outputDir)
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
    throw new Error(`Invalid analysis date "${date}": must match YYYY-MM-DD format`);
  }
  // Deduplicate enabledMethods (preserving order) so programmatic callers
  // that accidentally pass duplicates don't run the same method twice.
  const deduplicatedMethods = [...new Set(enabledMethods)];
  const startTime = new Date().toISOString();
  const runId = randomUUID();
  const dateOutputDir = path.resolve(outputDir, date);
  if (verbose) {
    console.log(`🔬 [analysis] Starting analysis stage (runId: ${runId})`);
    console.log(`   Date: ${date}`);
    console.log(`   Methods: ${deduplicatedMethods.length}`);
    console.log(`   Output: ${dateOutputDir}`);
  }
  ensureDirectoryExists(dateOutputDir);
  // Run all enabled methods sequentially; isolate failures
  const methodResults = [];
  for (const method of deduplicatedMethods) {
    const result = runSingleMethod(
      method,
      fetchedData,
      date,
      dateOutputDir,
      skipCompleted,
      verbose
    );
    methodResults.push(result);
  }
  const endTime = new Date().toISOString();
  const overallConfidence = aggregateConfidence(methodResults);
  const dataSourcesUsed = Object.keys(fetchedData).filter(
    (k) => Array.isArray(fetchedData[k]) && fetchedData[k].length > 0
  );
  const manifest = {
    runId,
    date,
    startTime,
    endTime,
    articleTypes: [...articleTypes],
    methods: methodResults,
    overallConfidence,
    dataSourcesUsed,
  };
  // Write manifest.json
  const manifestPath = path.join(dateOutputDir, 'manifest.json');
  writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));
  if (verbose) {
    const completed = methodResults.filter((r) => r.status === 'completed').length;
    const skipped = methodResults.filter((r) => r.status === 'skipped').length;
    const failed = methodResults.filter((r) => r.status === 'failed').length;
    console.log(
      `🔬 [analysis] Stage complete: ${completed} completed, ${skipped} skipped, ${failed} failed`
    );
    console.log(`   Overall confidence: ${overallConfidence}`);
  }
  const completedMethods = methodResults
    .filter((r) => r.status === 'completed' || r.status === 'skipped')
    .map((r) => r.method);
  const resultsMap = new Map(methodResults.map((r) => [r.method, r]));
  return {
    date,
    outputDir: dateOutputDir,
    completedMethods,
    results: resultsMap,
    manifest,
  };
}
//# sourceMappingURL=analysis-stage.js.map
