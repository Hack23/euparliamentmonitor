// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/AnalysisRisk
 * @description Risk scoring analysis method builders for the analysis pipeline.
 *
 * Contains markdown builders for the **Risk Scoring** analysis method group:
 * - `risk-matrix` — political risk scoring matrix with heat map
 * - `political-capital-risk` — political capital at risk assessment
 * - `quantitative-swot` — full narrative SWOT analysis with scored items
 * - `legislative-velocity-risk` — legislative processing speed risk
 * - `agent-risk-workflow` — agent-driven risk assessment workflow
 */

import { ArticleCategory } from '../../types/index.js';
import type { ScoredSWOTItem, PoliticalRiskScore } from '../../types/political-risk.js';
import {
  assessLegislativeVelocityRisk,
  runAgentRiskAssessment,
  generateRiskAssessmentMarkdown,
  calculatePoliticalRiskScore,
  buildQuantitativeSWOT,
  createScoredSWOTItem,
  createScoredOpportunityOrThreat,
  createRiskDriver,
} from '../../utils/political-risk-assessment.js';
import {
  sanitizeCell,
  safeArr,
  buildMarkdownHeader,
  EMPTY_TABLE_ROW_6,
} from './analysis-helpers.js';
import type { MarkdownBuilder } from './analysis-helpers.js';
import type { AnalysisMethod } from './analysis-stage.js';

// ─── SWOT item builder ──────────────────────────────────────────────────────

/**
 * Build the data-driven SWOT items for the political SWOT analysis.
 *
 * Descriptions are derived purely from data metrics — no pre-written
 * political conclusions. AI enrichment markers indicate where the agentic
 * workflow should inject real political intelligence analysis.
 *
 * @param counts - Count of items per data category
 * @param counts.procedures - Number of active legislative procedures
 * @param counts.adoptedTexts - Number of adopted texts
 * @param counts.documents - Number of published documents
 * @param counts.votingRecords - Number of roll-call voting records
 * @param counts.questions - Number of parliamentary questions
 * @param counts.mepUpdates - Number of MEP activity updates
 * @param counts.events - Number of scheduled events
 * @param counts.coalitions - Number of coalition data points
 * @returns Object with strengths, weaknesses, opportunities, and threats arrays
 */
function buildPoliticalSwotItems(counts: {
  procedures: number;
  adoptedTexts: number;
  documents: number;
  votingRecords: number;
  questions: number;
  mepUpdates: number;
  events: number;
  coalitions: number;
}): {
  strengths: ScoredSWOTItem[];
  weaknesses: ScoredSWOTItem[];
  opportunities: ScoredSWOTItem[];
  threats: ScoredSWOTItem[];
} {
  const strengths = [
    createScoredSWOTItem(
      `${counts.procedures} procedures in active legislative pipeline`,
      Math.min(counts.procedures / 5, 5),
      [
        `${counts.procedures} procedures tracked in current period`,
        `${counts.adoptedTexts} texts adopted`,
        `${counts.documents} documents published`,
      ],
      counts.procedures > 0 ? 'medium' : 'low',
      counts.procedures > 5 ? 'improving' : 'stable'
    ),
    createScoredSWOTItem(
      `${counts.votingRecords} roll-call votes recorded with ${counts.questions} questions`,
      Math.min(counts.votingRecords / 3, 5),
      [
        `${counts.votingRecords} voting records available`,
        `${counts.questions} parliamentary questions filed`,
        `${counts.mepUpdates} MEP activity updates`,
      ],
      counts.votingRecords > 0 ? 'medium' : 'low',
      'stable'
    ),
  ];

  const weaknesses = [
    createScoredSWOTItem(
      `${counts.mepUpdates} MEP updates — data coverage gap assessment`,
      Math.max(2, 5 - counts.mepUpdates / 10),
      [
        `${counts.mepUpdates} MEP updates in current period`,
        `${counts.documents} documents vs ${counts.procedures} procedures ratio`,
        `Data freshness depends on EP feed update frequency`,
      ],
      'medium',
      'stable'
    ),
  ];

  const opportunities = [
    createScoredOpportunityOrThreat(
      `${counts.events} parliamentary events scheduled`,
      counts.events > 3 ? 'likely' : 'possible',
      counts.events > 5 ? 'major' : 'moderate',
      [
        `${counts.events} events in analysis period`,
        `${counts.adoptedTexts} texts adopted indicates legislative throughput`,
        `${counts.procedures} procedures in various stages`,
      ],
      'medium',
      counts.events > 3 ? 'improving' : 'stable'
    ),
  ];

  const threats = [
    createScoredOpportunityOrThreat(
      `${counts.coalitions} coalition data points — cohesion monitoring`,
      counts.coalitions > 0 ? 'possible' : 'unlikely',
      'moderate',
      [
        `${counts.coalitions} coalition observations recorded`,
        `Cross-reference with ${counts.votingRecords} voting records`,
        `${counts.procedures} procedures may be affected by coalition shifts`,
      ],
      counts.coalitions > 0 ? 'medium' : 'low',
      'stable'
    ),
  ];

  return { strengths, weaknesses, opportunities, threats };
}

// ─── Per-method markdown builders ────────────────────────────────────────────

/**
 * Build markdown for the risk scoring matrix.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildRiskMatrixMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const procedures = safeArr(fetchedData, 'procedures');
  const risks: Array<{
    riskId: string;
    description: string;
    riskScore: number;
    riskLevel: string;
    likelihood: string;
    impact: string;
  }> = [];

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
This matrix uses a standardized likelihood × impact framework to quantify and
prioritize political risks affecting the European Parliament legislative process.

## Risk Heat Map

\`\`\`mermaid
quadrantChart
    title Political Risk Heat Map — ${date}
    x-axis Low Likelihood --> High Likelihood
    y-axis Low Impact --> High Impact
    quadrant-1 Critical Risk Zone
    quadrant-2 High Impact / Low Likelihood
    quadrant-3 Acceptable Risk Zone
    quadrant-4 High Likelihood / Low Impact
${risks
  .map((r) => {
    const likelihoodMap: Record<string, number> = {
      rare: 0.15,
      unlikely: 0.3,
      possible: 0.5,
      likely: 0.7,
      'almost certain': 0.9,
    };
    const impactMap: Record<string, number> = {
      minor: 0.2,
      moderate: 0.45,
      major: 0.7,
      critical: 0.9,
    };
    const lx = likelihoodMap[r.likelihood] ?? 0.5;
    const ly = impactMap[r.impact] ?? 0.45;
    return `    ${sanitizeCell(r.riskId)}: [${lx.toFixed(2)}, ${ly.toFixed(2)}]`;
  })
  .join('\n')}
\`\`\`

## Risk Matrix

| Risk ID | Description | Likelihood | Impact | Score | Level |
|---------|-------------|------------|--------|-------|-------|
${riskRows}

> **Risk Score** = Likelihood × Impact. **Levels**: 🟢 LOW (≤1.0), 🟡 MEDIUM (≤2.0), 🟠 HIGH (≤3.5), 🔴 CRITICAL (>3.5)

## Risk Assessment Details

${
  risks.length > 0
    ? risks
        .map(
          (r) => `### ${r.riskId}: ${r.description}

| Metric | Value |
|--------|-------|
| Risk Score | ${r.riskScore.toFixed(2)} |
| Risk Level | ${r.riskLevel.toUpperCase()} |
| Likelihood | ${r.likelihood} |
| Impact | ${r.impact} |
`
        )
        .join('\n')
    : '| — | — | — | — | — | — |'
}

## Risk Mitigation Framework

| Risk Level | Count | Tolerance | Action Required |
|------------|-------|-----------|-----------------|
| 🔴 CRITICAL | ${risks.filter((r) => r.riskLevel === 'critical').length} | Zero tolerance | Immediate escalation |
| 🟠 HIGH | ${risks.filter((r) => r.riskLevel === 'high').length} | Low tolerance | Active mitigation |
| 🟡 MEDIUM | ${risks.filter((r) => r.riskLevel === 'medium').length} | Moderate | Enhanced monitoring |
| 🟢 LOW | ${risks.filter((r) => r.riskLevel === 'low').length} | Acceptable | Routine tracking |

## Date: ${date}
`
  );
}

/**
 * Build markdown for political capital at risk analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildPoliticalCapitalRiskMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('political-capital-risk', date, 'medium');
  const coalitions = safeArr(fetchedData, 'coalitions');
  const votingRecords = safeArr(fetchedData, 'votingRecords');
  const patterns = safeArr(fetchedData, 'patterns');
  const procedures = safeArr(fetchedData, 'procedures');

  return (
    header +
    `# Political Capital at Risk

## Data Inventory for Capital Risk Assessment
| Data Source | Count | Relevance |
|-------------|-------|-----------|
| Coalition data points | ${coalitions.length} | Group cohesion indicators |
| Voting records | ${votingRecords.length} | Voting alignment metrics |
| Voting patterns | ${patterns.length} | Trend and anomaly data |
| Active procedures | ${procedures.length} | Legislative engagement |

## Date: ${date}
`
  );
}

/**
 * Build markdown for the quantitative SWOT analysis.
 *
 * Produces a full narrative SWOT analysis modelled after the repository's
 * SWOT.md — each quadrant item has a description, strategic value, evidence
 * bullets, and a scored impact rating derived from actual fetched EP data.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildQuantitativeSwotMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('quantitative-swot', date, 'medium');
  const events = safeArr(fetchedData, 'events');
  const procedures = safeArr(fetchedData, 'procedures');
  const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
  const documents = safeArr(fetchedData, 'documents');
  const votingRecords = safeArr(fetchedData, 'votingRecords');
  const coalitions = safeArr(fetchedData, 'coalitions');
  const questions = safeArr(fetchedData, 'questions');
  const mepUpdates = safeArr(fetchedData, 'mepUpdates');

  const counts = {
    procedures: procedures.length,
    adoptedTexts: adoptedTexts.length,
    documents: documents.length,
    votingRecords: votingRecords.length,
    questions: questions.length,
    mepUpdates: mepUpdates.length,
    events: events.length,
    coalitions: coalitions.length,
  };

  const { strengths, weaknesses, opportunities, threats } = buildPoliticalSwotItems(counts);

  const swot = buildQuantitativeSWOT(
    `Political SWOT Assessment ${date}`,
    strengths,
    weaknesses,
    opportunities,
    threats
  );

  const strengthsNarrative = swot.strengths
    .map(
      (s, i) =>
        `### S${i + 1}: ${s.description}\n` +
        `- **Score**: ${s.score.toFixed(1)}/5\n` +
        `- **Confidence**: ${s.confidence}\n` +
        `- **Trend**: ${s.trend}\n` +
        `- **Evidence**:\n${s.evidence.map((e) => `  - ${e}`).join('\n')}`
    )
    .join('\n\n');

  const weaknessesNarrative = swot.weaknesses
    .map(
      (w, i) =>
        `### W${i + 1}: ${w.description}\n` +
        `- **Score**: ${w.score.toFixed(1)}/5\n` +
        `- **Confidence**: ${w.confidence}\n` +
        `- **Trend**: ${w.trend}\n` +
        `- **Evidence**:\n${w.evidence.map((e) => `  - ${e}`).join('\n')}`
    )
    .join('\n\n');

  const opportunitiesNarrative = swot.opportunities
    .map(
      (o, i) =>
        `### O${i + 1}: ${o.description}\n` +
        `- **Score**: ${o.score.toFixed(1)}/5\n` +
        `- **Confidence**: ${o.confidence}\n` +
        `- **Trend**: ${o.trend}\n` +
        `- **Evidence**:\n${o.evidence.map((e) => `  - ${e}`).join('\n')}`
    )
    .join('\n\n');

  const threatsNarrative = swot.threats
    .map(
      (t, i) =>
        `### T${i + 1}: ${t.description}\n` +
        `- **Score**: ${t.score.toFixed(1)}/5\n` +
        `- **Confidence**: ${t.confidence}\n` +
        `- **Trend**: ${t.trend}\n` +
        `- **Evidence**:\n${t.evidence.map((e) => `  - ${e}`).join('\n')}`
    )
    .join('\n\n');

  return (
    header +
    `# Full Political SWOT Analysis

## Executive Summary

**Strategic Position Score**: ${swot.strategicPositionScore.toFixed(1)}/10
**Overall Assessment**: ${swot.overallAssessment}
**Analysis Date**: ${date}

> This SWOT analysis is derived from ${procedures.length} procedures, ${events.length} events, ${adoptedTexts.length} adopted texts, ${documents.length} documents, ${votingRecords.length} voting records, and ${coalitions.length} coalition data points fetched from the European Parliament.

## SWOT Quadrant Chart

\`\`\`mermaid
quadrantChart
    title Political SWOT — Strategic Position (${date})
    x-axis Low Impact --> High Impact
    y-axis Low Priority --> High Priority
    quadrant-1 Opportunities
    quadrant-2 Strengths
    quadrant-3 Weaknesses
    quadrant-4 Threats
${swot.strengths.map((s, i) => `    S${i + 1} ${sanitizeCell(s.description).slice(0, 25)}: [${Math.max(0.55, Math.min(0.95, 0.5 + s.score / 10)).toFixed(2)}, ${Math.max(0.55, Math.min(0.95, 0.5 + s.score / 10)).toFixed(2)}]`).join('\n')}
${swot.weaknesses.map((w, i) => `    W${i + 1} ${sanitizeCell(w.description).slice(0, 25)}: [${Math.max(0.05, Math.min(0.45, 0.5 - w.score / 10)).toFixed(2)}, ${Math.max(0.05, Math.min(0.45, 0.5 - w.score / 10)).toFixed(2)}]`).join('\n')}
${swot.opportunities.map((o, i) => `    O${i + 1} ${sanitizeCell(o.description).slice(0, 25)}: [${Math.max(0.55, Math.min(0.95, 0.5 + o.score / 10)).toFixed(2)}, ${Math.max(0.55, Math.min(0.95, 0.5 + o.score / 10)).toFixed(2)}]`).join('\n')}
${swot.threats.map((t, i) => `    T${i + 1} ${sanitizeCell(t.description).slice(0, 25)}: [${Math.max(0.55, Math.min(0.95, 0.5 + t.score / 10)).toFixed(2)}, ${Math.max(0.05, Math.min(0.45, 0.5 - t.score / 10)).toFixed(2)}]`).join('\n')}
\`\`\`

## SWOT Overview

| Category | Items | Avg Score | Trend |
|----------|-------|-----------|-------|
| 🟢 Strengths | ${swot.strengths.length} | ${swot.strengths.length > 0 ? (swot.strengths.reduce((s, i) => s + i.score, 0) / swot.strengths.length).toFixed(1) : '—'} | ${swot.strengths[0]?.trend ?? '—'} |
| 🔴 Weaknesses | ${swot.weaknesses.length} | ${swot.weaknesses.length > 0 ? (swot.weaknesses.reduce((s, i) => s + i.score, 0) / swot.weaknesses.length).toFixed(1) : '—'} | ${swot.weaknesses[0]?.trend ?? '—'} |
| 🔵 Opportunities | ${swot.opportunities.length} | ${swot.opportunities.length > 0 ? (swot.opportunities.reduce((s, i) => s + i.score, 0) / swot.opportunities.length).toFixed(1) : '—'} | ${swot.opportunities[0]?.trend ?? '—'} |
| 🟠 Threats | ${swot.threats.length} | ${swot.threats.length > 0 ? (swot.threats.reduce((s, i) => s + i.score, 0) / swot.threats.length).toFixed(1) : '—'} | ${swot.threats[0]?.trend ?? '—'} |

## 🟢 Strengths

${strengthsNarrative || '_No strengths identified from available data._'}

## 🔴 Weaknesses

${weaknessesNarrative || '_No weaknesses identified from available data._'}

## 🔵 Opportunities

${opportunitiesNarrative || '_No opportunities identified from available data._'}

## 🟠 Threats

${threatsNarrative || '_No threats identified from available data._'}

## Cross-Impact Matrix

${
  swot.crossImpactMatrix.length > 0
    ? '| Interaction | Net Effect | Rationale |\n|-------------|-----------|----------|\n' +
      swot.crossImpactMatrix
        .slice(0, 10)
        .map(
          (e) =>
            `| ${e.swotType} #${e.swotIndex + 1} × threat #${e.threatIndex + 1} | ${e.netEffect.toFixed(2)} | ${sanitizeCell(e.rationale)} |`
        )
        .join('\n')
    : '- No cross-impacts identified from available data'
}

## Strategic Priorities Matrix

## Data Summary

| Data Source | Count |
|-------------|-------|
| Procedures | ${procedures.length} |
| Events | ${events.length} |
| Documents | ${documents.length} |
| Voting Records | ${votingRecords.length} |
| Adopted Texts | ${adoptedTexts.length} |
| Coalitions | ${coalitions.length} |
| Questions | ${questions.length} |
| MEP Updates | ${mepUpdates.length} |
| **Total Data Points** | **${procedures.length + events.length + documents.length + votingRecords.length + adoptedTexts.length}** |

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
export function buildLegislativeVelocityRiskMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
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
              `| ${sanitizeCell(r.procedureId)} | ${sanitizeCell(r.title.slice(0, 40))} | ${sanitizeCell(r.currentStage)} | ${r.daysInCurrentStage}d / ${r.expectedDaysForStage}d | ${r.velocityRisk.riskScore.toFixed(2)} | ${sanitizeCell(r.velocityRisk.riskLevel)} |`
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
export function buildAgentRiskWorkflowMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const procedures = safeArr(fetchedData, 'procedures');
  const coalitions = safeArr(fetchedData, 'coalitions');

  const identifiedRisks: PoliticalRiskScore[] = [];
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
    ArticleCategory.WEEK_AHEAD,
    identifiedRisks,
    riskDrivers,
    ['Monitor legislative velocity indicators', 'Track coalition voting patterns']
  );

  return generateRiskAssessmentMarkdown(workflow);
}

/** All risk scoring method builders keyed by their AnalysisMethod identifier */
export const RISK_BUILDERS: Readonly<Partial<Record<AnalysisMethod, MarkdownBuilder>>> = {
  'risk-matrix': buildRiskMatrixMarkdown,
  'political-capital-risk': buildPoliticalCapitalRiskMarkdown,
  'quantitative-swot': buildQuantitativeSwotMarkdown,
  'legislative-velocity-risk': buildLegislativeVelocityRiskMarkdown,
  'agent-risk-workflow': buildAgentRiskWorkflowMarkdown,
};
