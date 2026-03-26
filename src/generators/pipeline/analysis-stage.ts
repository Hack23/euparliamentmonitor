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
 * `manifest.json` to disk.  The returned {@link AnalysisContext} is
 * informational and currently not consumed by the generate stage; strategies
 * read the analysis output from disk instead.
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
import type { ArticleCategory, ConfidenceLevel } from '../../types/index.js';
import {
  detectVotingTrends,
  computeCrossSessionCoalitionStability,
  buildDefaultStakeholderPerspectives,
  buildStakeholderOutcomeMatrix,
} from '../../utils/intelligence-analysis.js';
import { ensureDirectoryExists, atomicWrite } from '../../utils/file-utils.js';

// ─── Analysis Method type ─────────────────────────────────────────────────────

/**
 * All analysis methods supported by the analysis pipeline stage.
 *
 * Methods prefixed with a group label:
 * - Classification (#804): significance-classification, impact-matrix, actor-mapping, forces-analysis
 * - Threat Assessment (#805): political-stride, actor-threat-profiling, consequence-trees, legislative-disruption
 * - Risk Scoring (#806): risk-matrix, political-capital-risk, quantitative-swot, legislative-velocity-risk, agent-risk-workflow
 * - Existing: deep-analysis, stakeholder-analysis, coalition-analysis, voting-patterns, cross-session-intelligence
 */
export type AnalysisMethod =
  // Classification (Issue #804)
  | 'significance-classification'
  | 'impact-matrix'
  | 'actor-mapping'
  | 'forces-analysis'
  // Threat Assessment (Issue #805)
  | 'political-stride'
  | 'actor-threat-profiling'
  | 'consequence-trees'
  | 'legislative-disruption'
  // Risk Scoring (Issue #806)
  | 'risk-matrix'
  | 'political-capital-risk'
  | 'quantitative-swot'
  | 'legislative-velocity-risk'
  | 'agent-risk-workflow'
  // Existing analysis methods
  | 'deep-analysis'
  | 'stakeholder-analysis'
  | 'coalition-analysis'
  | 'voting-patterns'
  | 'cross-session-intelligence';

/** All analysis methods in default execution order */
export const ALL_ANALYSIS_METHODS: readonly AnalysisMethod[] = [
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
] as const;

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Configuration for the analysis pipeline stage */
export interface AnalysisStageOptions {
  /** Article categories to analyse */
  readonly articleTypes: readonly ArticleCategory[];
  /** ISO date string (YYYY-MM-DD) for this analysis run */
  readonly date: string;
  /** Base output directory (e.g. 'analysis-output') */
  readonly outputDir: string;
  /** Which methods to run; defaults to {@link ALL_ANALYSIS_METHODS} */
  readonly enabledMethods?: readonly AnalysisMethod[];
  /** When true, skip already-completed methods from a prior run on the same date */
  readonly skipCompleted?: boolean;
  /** Emit verbose progress messages to stdout */
  readonly verbose?: boolean;
}

/** Status record written into the manifest for each method */
export interface AnalysisMethodStatus {
  /** The analysis method */
  readonly method: AnalysisMethod;
  /** Whether the method completed, was skipped, or failed */
  readonly status: 'completed' | 'skipped' | 'failed';
  /** Path to the markdown output file */
  readonly outputFile: string;
  /** Confidence level of the result */
  readonly confidence: ConfidenceLevel;
  /** Wall-clock duration in milliseconds */
  readonly duration: number;
  /** One-line human-readable summary */
  readonly summary: string;
}

/** Metadata record written to manifest.json for each analysis run */
export interface AnalysisManifest {
  /** Unique identifier for this analysis run */
  readonly runId: string;
  /** ISO date of the analysis */
  readonly date: string;
  /** ISO 8601 start timestamp */
  readonly startTime: string;
  /** ISO 8601 end timestamp */
  readonly endTime: string;
  /** Article types included in this run */
  readonly articleTypes: readonly ArticleCategory[];
  /** Per-method status entries */
  readonly methods: readonly AnalysisMethodStatus[];
  /** Aggregated confidence across all completed methods */
  readonly overallConfidence: ConfidenceLevel;
  /** Data source identifiers used during the run */
  readonly dataSourcesUsed: readonly string[];
}

/** Result context passed from the analysis stage to article generation strategies */
export interface AnalysisContext {
  /** ISO date of the analysis */
  readonly date: string;
  /** Absolute path to the date-scoped output directory */
  readonly outputDir: string;
  /** Methods that completed successfully or were skipped */
  readonly completedMethods: readonly AnalysisMethod[];
  /** Detailed results keyed by method */
  readonly results: ReadonlyMap<AnalysisMethod, AnalysisMethodStatus>;
  /** Manifest written to disk */
  readonly manifest: AnalysisManifest;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Determine the aggregated confidence level from a set of individual results.
 *
 * @param results - Method results to aggregate
 * @returns Aggregated confidence level
 */
function aggregateConfidence(results: AnalysisMethodStatus[]): ConfidenceLevel {
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
function buildMarkdownHeader(
  method: AnalysisMethod,
  date: string,
  confidence: ConfidenceLevel
): string {
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
function writeTextFile(filePath: string, content: string): void {
  atomicWrite(filePath, content);
}

/**
 * Check whether a method's output file already exists (for incremental runs).
 *
 * @param filePath - Absolute file path
 * @returns true when the file exists and is non-empty
 */
function methodOutputExists(filePath: string): boolean {
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
function buildSignificanceClassificationMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('significance-classification', date, 'medium');
  const events = Array.isArray(fetchedData['events']) ? fetchedData['events'] : [];
  const docs = Array.isArray(fetchedData['documents']) ? fetchedData['documents'] : [];
  return (
    header +
    `# Political Significance Classification

## Overview
Analysis of political significance across ${events.length} events and ${docs.length} documents.

## Classification Framework
| Level | Criteria | Items |
|-------|----------|-------|
| Critical | Major legislative votes, treaty changes | — |
| High | Committee decisions, key resolutions | — |
| Medium | Procedural votes, routine documents | — |
| Low | Administrative matters | — |

## Significance Assessment
- **Data points analysed**: ${events.length + docs.length}
- **Date**: ${date}
- **Method**: Political significance scoring via legislative impact indicators

## Key Findings
${events.length === 0 && docs.length === 0 ? '- No data available for significance assessment' : `- ${events.length} events and ${docs.length} documents assessed for political significance`}
`
  );
}

/**
 * Build markdown for the impact matrix method.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildImpactMatrixMarkdown(_fetchedData: Record<string, unknown>, date: string): string {
  const header = buildMarkdownHeader('impact-matrix', date, 'medium');
  return (
    header +
    `# Political Impact Matrix

## Overview
Cross-dimensional impact analysis across political, economic, social, and legal axes.

## Impact Dimensions
| Dimension | Short-term | Medium-term | Long-term |
|-----------|------------|-------------|-----------|
| Political | — | — | — |
| Economic  | — | — | — |
| Social    | — | — | — |
| Legal     | — | — | — |

## Date: ${date}
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
function buildActorMappingMarkdown(fetchedData: Record<string, unknown>, date: string): string {
  const header = buildMarkdownHeader('actor-mapping', date, 'medium');
  return (
    header +
    `# Political Actor Mapping

## Overview
Identification and mapping of key political actors and their influence networks.

## Actor Categories
- **Political Groups**: EPP, S&D, Renew, Greens/EFA, ECR, ID, The Left, NI
- **Key MEPs**: Rapporteurs, Committee Chairs, Political Group Leaders
- **External Actors**: European Commission, Council Presidency, NGOs

## Network Analysis
- **Date**: ${date}
- **Data sources**: ${Object.keys(fetchedData).join(', ')}
`
  );
}

/**
 * Build markdown for the political forces analysis method.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildForcesAnalysisMarkdown(_fetchedData: Record<string, unknown>, date: string): string {
  const header = buildMarkdownHeader('forces-analysis', date, 'medium');
  return (
    header +
    `# Political Forces Analysis

## Overview
Analysis of competing political forces shaping the current legislative agenda.

## Force Categories
| Force | Direction | Strength | Key Actors |
|-------|-----------|----------|------------|
| Pro-integration | — | — | — |
| Eurosceptic | — | — | — |
| Green/Progressive | — | — | — |
| Conservative | — | — | — |

## Current Balance of Forces
- **Date**: ${date}
- **Assessment**: Moderate balance with shifting coalitions
`
  );
}

/**
 * Build markdown for the political STRIDE threat assessment.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildPoliticalStrideMarkdown(_fetchedData: Record<string, unknown>, date: string): string {
  const header = buildMarkdownHeader('political-stride', date, 'medium');
  return (
    header +
    `# Political STRIDE Threat Assessment

## Overview
STRIDE-adapted threat assessment for the political intelligence context.

## Political STRIDE Categories
| Category | Description | Threats Identified |
|----------|-------------|-------------------|
| **S**hift | Sudden policy or alliance shifts | — |
| **T**ransparency | Opaque decision-making, hidden agendas | — |
| **R**eversal | Reversal of previous positions or commitments | — |
| **I**nstitutional | Institutional norm erosion or procedural abuse | — |
| **D**elay | Deliberate legislative delay or obstruction | — |
| **E**rosion | Gradual erosion of democratic safeguards | — |

## Assessment Date: ${date}
`
  );
}

/**
 * Build markdown for actor threat profiling.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildActorThreatProfilingMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('actor-threat-profiling', date, 'low');
  return (
    header +
    `# Actor Threat Profiles

## Overview
Individual threat profiles for key political actors in the European Parliament.

## Profile Framework
Each actor profile includes:
- **Intent**: Policy objectives and political agenda
- **Capability**: Resources, positions, coalition strength
- **Activity**: Recent actions and legislative participation
- **Threat Level**: LOW / MEDIUM / HIGH / CRITICAL

## Date: ${date}
- **Data sources**: ${Object.keys(fetchedData).join(', ')}
`
  );
}

/**
 * Build markdown for consequence tree analysis.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildConsequenceTreesMarkdown(
  _fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('consequence-trees', date, 'medium');
  return (
    header +
    `# Consequence Tree Analysis

## Overview
Structured analysis of action-consequence chains for key legislative decisions.

## Tree Structure
\`\`\`
Legislative Decision
├── If Adopted
│   ├── Immediate: Implementation begins
│   ├── Short-term: Policy changes take effect
│   └── Long-term: Structural impacts materialise
└── If Rejected
    ├── Immediate: Status quo maintained
    ├── Short-term: Policy gap continues
    └── Long-term: Alternative solutions needed
\`\`\`

## Date: ${date}
`
  );
}

/**
 * Build markdown for legislative disruption analysis.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildLegislativeDisruptionMarkdown(
  _fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('legislative-disruption', date, 'medium');
  return (
    header +
    `# Legislative Disruption Analysis

## Overview
Identification of factors disrupting the normal legislative process.

## Disruption Indicators
| Indicator | Level | Impact |
|-----------|-------|--------|
| Coalition fragmentation | — | — |
| Procedural delays | — | — |
| External pressures | — | — |
| Institutional conflicts | — | — |

## Date: ${date}
`
  );
}

/**
 * Build markdown for the risk scoring matrix.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildRiskMatrixMarkdown(_fetchedData: Record<string, unknown>, date: string): string {
  const header = buildMarkdownHeader('risk-matrix', date, 'medium');
  return (
    header +
    `# Political Risk Scoring Matrix

## Overview
Quantitative risk scoring across political dimensions.

## Risk Matrix
| Risk Category | Likelihood (1-5) | Impact (1-5) | Risk Score | Level |
|---------------|-----------------|--------------|------------|-------|
| Coalition collapse | — | — | — | — |
| Legislative blockage | — | — | — | — |
| External shock | — | — | — | — |
| Reputational risk | — | — | — | — |

> Risk Score = Likelihood × Impact. Levels: LOW (≤1.0), MEDIUM (≤2.0), HIGH (≤3.5), CRITICAL (>3.5)

## Date: ${date}
`
  );
}

/**
 * Build markdown for political capital at risk analysis.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildPoliticalCapitalRiskMarkdown(
  _fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('political-capital-risk', date, 'medium');
  return (
    header +
    `# Political Capital at Risk

## Overview
Assessment of political capital at stake in current legislative proceedings.

## Capital at Risk by Actor
| Actor/Group | Capital at Stake | Risk Level | Key Issues |
|-------------|-----------------|------------|------------|
| EPP | — | — | — |
| S&D | — | — | — |
| Renew | — | — | — |

## Date: ${date}
`
  );
}

/**
 * Build markdown for the quantitative SWOT analysis.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildQuantitativeSwotMarkdown(
  _fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('quantitative-swot', date, 'medium');
  return (
    header +
    `# Quantitative SWOT Analysis

## Overview
Scored SWOT analysis with quantitative confidence indicators.

## SWOT Matrix (Scores: 0-1)
| Category | Items | Avg Score | Confidence |
|----------|-------|-----------|------------|
| Strengths | — | — | — |
| Weaknesses | — | — | — |
| Opportunities | — | — | — |
| Threats | — | — | — |

## Date: ${date}
`
  );
}

/**
 * Build markdown for legislative velocity risk analysis.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildLegislativeVelocityRiskMarkdown(
  _fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('legislative-velocity-risk', date, 'medium');
  return (
    header +
    `# Legislative Velocity Risk

## Overview
Risk assessment based on the speed of legislative processing.

## Velocity Metrics
| Metric | Value | Risk Level |
|--------|-------|------------|
| Average procedure duration | — | — |
| Queue depth | — | — |
| Throughput rate | — | — |
| Stalled procedure rate | — | — |

## Date: ${date}
`
  );
}

/**
 * Build markdown for the agent risk assessment workflow.
 *
 * @param _fetchedData - Raw fetched EP data (unused; reserved for future enrichment)
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildAgentRiskWorkflowMarkdown(
  _fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('agent-risk-workflow', date, 'medium');
  return (
    header +
    `# Agent Risk Assessment Workflow

## Overview
AI agent-driven risk assessment workflow following ISMS methodology.

## Workflow Stages
1. **Data Collection**: Fetch all available EP data via MCP
2. **Threat Identification**: Apply STRIDE to political context
3. **Vulnerability Assessment**: Map legislative weaknesses
4. **Risk Calculation**: Score = Likelihood × Impact
5. **Mitigation Planning**: Identify risk reduction measures
6. **Monitoring**: Track key risk indicators

## Date: ${date}
- **Inspired by**: [ISMS AI Agent-Driven Risk Assessment](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Risk_Assessment_Methodology.md)
`
  );
}

/**
 * Build markdown for the deep multi-perspective analysis.
 * Uses existing `buildDefaultStakeholderPerspectives`.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildDeepAnalysisMarkdown(fetchedData: Record<string, unknown>, date: string): string {
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
function buildStakeholderAnalysisMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
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
function buildCoalitionAnalysisMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('coalition-analysis', date, 'high');
  const rawPatterns = Array.isArray(fetchedData['patterns']) ? fetchedData['patterns'] : [];
  // VotingPattern[] data doesn't contain the `coalitionId`/`id` fields required
  // by analyzeCoalitionCohesion().  Use computeCrossSessionCoalitionStability()
  // instead — it is designed to aggregate cohesion across VotingPattern arrays.
  const stabilityReport = computeCrossSessionCoalitionStability(
    rawPatterns as Parameters<typeof computeCrossSessionCoalitionStability>[0]
  );
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
function buildVotingPatternsMarkdown(fetchedData: Record<string, unknown>, date: string): string {
  const header = buildMarkdownHeader('voting-patterns', date, 'high');
  // detectVotingTrends accepts readonly VotingRecord[] — pass raw records directly
  const rawRecords = Array.isArray(fetchedData['votingRecords'])
    ? fetchedData['votingRecords']
    : [];
  const trends = detectVotingTrends(rawRecords as Parameters<typeof detectVotingTrends>[0]);
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
function buildCrossSessionIntelligenceMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const header = buildMarkdownHeader('cross-session-intelligence', date, 'high');
  const rawPatterns = Array.isArray(fetchedData['patterns']) ? fetchedData['patterns'] : [];
  // computeCrossSessionCoalitionStability accepts readonly VotingPattern[]
  const stabilityReport = computeCrossSessionCoalitionStability(
    rawPatterns as Parameters<typeof computeCrossSessionCoalitionStability>[0]
  );
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

// ─── Method-to-builder map ────────────────────────────────────────────────────

type MarkdownBuilder = (fetchedData: Record<string, unknown>, date: string) => string;

/** Map from AnalysisMethod to its markdown builder function */
const METHOD_BUILDERS: Readonly<Record<AnalysisMethod, MarkdownBuilder>> = {
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
const METHOD_SUBDIRS: Readonly<Record<AnalysisMethod, string>> = {
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
const METHOD_DEFAULT_CONFIDENCE: Readonly<Record<AnalysisMethod, ConfidenceLevel>> = {
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
const METHOD_FILENAMES: Readonly<Record<AnalysisMethod, string>> = {
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
function runSingleMethod(
  method: AnalysisMethod,
  fetchedData: Record<string, unknown>,
  date: string,
  dateOutputDir: string,
  skipCompleted: boolean,
  verbose: boolean
): AnalysisMethodStatus {
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
  } catch (err: unknown) {
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
export async function runAnalysisStage(
  fetchedData: Record<string, unknown>,
  options: AnalysisStageOptions
): Promise<AnalysisContext> {
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
  const methodResults: AnalysisMethodStatus[] = [];
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
    (k) => Array.isArray(fetchedData[k]) && (fetchedData[k] as unknown[]).length > 0
  );

  const manifest: AnalysisManifest = {
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

  const resultsMap = new Map<AnalysisMethod, AnalysisMethodStatus>(
    methodResults.map((r) => [r.method, r])
  );

  return {
    date,
    outputDir: dateOutputDir,
    completedMethods,
    results: resultsMap,
    manifest,
  };
}
