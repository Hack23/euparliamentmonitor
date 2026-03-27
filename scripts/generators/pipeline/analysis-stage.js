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
import { ArticleCategory } from '../../types/index.js';
import {
  detectVotingTrends,
  computeCrossSessionCoalitionStability,
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
  buildQuantitativeSWOT,
  createScoredSWOTItem,
  createScoredOpportunityOrThreat,
  createRiskDriver,
} from '../../utils/political-risk-assessment.js';
import { ensureDirectoryExists, atomicWrite } from '../../utils/file-utils.js';
// ─── Markdown constants ───────────────────────────────────────────────────────
/** Empty table row placeholder for 6-column tables */
const EMPTY_TABLE_ROW_6 = '| — | — | — | — | — | — |';
// ─── Sanitization helpers ─────────────────────────────────────────────────────
/**
 * Sanitize untrusted text for safe use in a Markdown table cell.
 *
 * Escapes pipe characters, backslashes, and HTML entities, then normalizes
 * whitespace to prevent table layout corruption from external MCP data.
 *
 * @param input - Untrusted cell text
 * @returns Sanitized text safe for Markdown table cells
 */
function sanitizeCell(input) {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}
// ─── Data coercion helpers ────────────────────────────────────────────────────
/**
 * Sanitize a document identifier for safe use as a filesystem filename.
 *
 * Replaces characters unsafe for filenames with hyphens, collapses runs of
 * hyphens, trims, and lowercases.  When the result exceeds 80 characters,
 * a deterministic hash suffix is appended to avoid collisions between IDs
 * that share the same first 80 characters.  Falls back to a deterministic
 * hash of the input when the sanitized result is empty.
 *
 * @param id - Raw document identifier (e.g. "TA-10-2026-0094", procedure reference)
 * @returns Filesystem-safe identifier string (max 80 chars)
 */
function sanitizeDocumentId(id) {
  const full = id
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!full) {
    // Deterministic fallback: simple hash from input string for reproducibility
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
    return `anon-${Math.abs(hash).toString(36).slice(0, 12)}`;
  }
  // When truncation occurs, append a short hash to avoid collisions
  if (full.length > 80) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
    return `${full.slice(0, 72)}-${Math.abs(hash).toString(36).slice(0, 7)}`;
  }
  return full;
}
/** All feed array keys that contain individually-analysable documents */
const DOCUMENT_FEED_KEYS = [
  'adoptedTexts',
  'procedures',
  'documents',
  'plenaryDocuments',
  'committeeDocuments',
  'plenarySessionDocuments',
  'externalDocuments',
  'events',
];
/**
 * Extract a human-readable identifier from a raw feed item.
 *
 * Tries common EP data shapes (`docId`, `procedureId`, `id`, `eventId`,
 * `title`) and falls back to a deterministic hash of the item's JSON
 * representation for truly anonymous items, ensuring reproducibility.
 *
 * @param item - Raw feed item object
 * @returns Best-effort identifier string
 */
function extractDocumentId(item) {
  for (const key of ['docId', 'procedureId', 'id', 'eventId']) {
    const val = item[key]; // eslint-disable-line security/detect-object-injection -- keys are string literals
    if (typeof val === 'string' && val.length > 0) return val;
  }
  const title = item['title'];
  if (typeof title === 'string' && title.length > 0) {
    // Append a short hash to title-based IDs to avoid collisions when
    // multiple items share identical title prefixes
    const repr = JSON.stringify(item);
    let hash = 0;
    for (let i = 0; i < repr.length; i++) {
      hash = ((hash << 5) - hash + repr.charCodeAt(i)) | 0;
    }
    return `${title.slice(0, 50)}-${Math.abs(hash).toString(36).slice(0, 8)}`;
  }
  // Deterministic fallback: hash of stringified item for reproducible dedup
  const repr = JSON.stringify(item);
  let hash = 0;
  for (let i = 0; i < repr.length; i++) {
    hash = ((hash << 5) - hash + repr.charCodeAt(i)) | 0;
  }
  return `anonymous-${Math.abs(hash).toString(36)}`;
}
/**
 * Extract a human-readable title from a raw feed item.
 *
 * @param item - Raw feed item object
 * @returns Title string or fallback
 */
function extractDocumentTitle(item) {
  const title = item['title'];
  if (typeof title === 'string' && title.length > 0) return title;
  const label = item['label'] ?? item['name'] ?? item['description'];
  if (typeof label === 'string' && label.length > 0) return label;
  return 'Untitled document';
}
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
/** Keys in fetchedData that count as substantive EP data */
const SUBSTANTIVE_DATA_KEYS = [
  'events',
  'procedures',
  'adoptedTexts',
  'documents',
  'votingRecords',
  'coalitions',
  'questions',
  'mepUpdates',
  'plenaryDocuments',
  'committeeDocuments',
  'plenarySessionDocuments',
  'externalDocuments',
  'declarations',
  'corporateBodies',
];
/**
 * Check whether the fetched data contains any substantive EP data.
 *
 * Returns `true` when at least one data category has non-empty arrays.
 * Used to gate analysis execution — analysis should not run on empty data.
 *
 * @param data - Raw fetched data record
 * @returns true if any substantive data is present
 */
export function hasSubstantiveData(data) {
  for (const key of SUBSTANTIVE_DATA_KEYS) {
    const arr = safeArr(data, key);
    if (arr.length > 0) return true;
  }
  return false;
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
  // NOTE: 'document-analysis' is intentionally excluded from the default set.
  // It writes one markdown + one JSON file per feed item and can significantly
  // increase runtime and repository output size.  Callers must opt-in by
  // explicitly listing it in `enabledMethods`.
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
// ─── Mermaid chart helpers ────────────────────────────────────────────────────
/**
 * Map an impact level to a numeric value for Mermaid pie charts.
 *
 * @param level - Impact level string (e.g. 'none', 'low', 'moderate', 'high', 'critical')
 * @returns Numeric value for chart rendering
 */
function impactToNum(level) {
  const map = {
    none: 5,
    low: 20,
    moderate: 45,
    high: 70,
    critical: 90,
  };
  return map[level.toLowerCase()] ?? 30;
}
/**
 * Map an impact level string to a coloured indicator emoji.
 *
 * @param level - Impact level string
 * @returns Emoji indicator
 */
function impactIndicator(level) {
  const lower = level.toLowerCase();
  return lower === 'high' || lower === 'critical' ? '🔴' : lower === 'moderate' ? '🟡' : '🟢';
}
/**
 * Return the name of the highest-impact dimension from an impact matrix.
 *
 * @param matrix - Impact matrix with five dimension levels
 * @param matrix.legislativeImpact - Legislative impact level
 * @param matrix.coalitionImpact - Coalition impact level
 * @param matrix.publicOpinionImpact - Public opinion impact level
 * @param matrix.institutionalImpact - Institutional impact level
 * @param matrix.economicImpact - Economic impact level
 * @returns Name of the dimension with the highest impact score
 */
function highestImpactDimension(matrix) {
  return (
    [
      { name: 'Legislative', level: matrix.legislativeImpact },
      { name: 'Coalition', level: matrix.coalitionImpact },
      { name: 'Public Opinion', level: matrix.publicOpinionImpact },
      { name: 'Institutional', level: matrix.institutionalImpact },
      { name: 'Economic', level: matrix.economicImpact },
    ].sort((a, b) => impactToNum(b.level) - impactToNum(a.level))[0]?.name ?? 'N/A'
  );
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
  const procedures = safeArr(fetchedData, 'procedures');
  const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
  const header = buildMarkdownHeader(
    'significance-classification',
    date,
    significance === 'routine' ? 'medium' : 'high'
  );
  const sigMap = {
    historic: 0.95,
    critical: 0.8,
    significant: 0.65,
    notable: 0.45,
    routine: 0.25,
  };
  const sigScore = sigMap[significance] ?? 0.25;
  return (
    header +
    `# Political Significance Classification

## Overall Significance: **${significance.toUpperCase()}**

\`\`\`mermaid
quadrantChart
    title Political Significance Assessment — ${date}
    x-axis Low Volume --> High Volume
    y-axis Low Impact --> High Impact
    quadrant-1 Critical Watch
    quadrant-2 Strategic Priority
    quadrant-3 Monitor
    quadrant-4 Routine Track
    Current Assessment: [${sigScore.toFixed(2)}, ${sigScore.toFixed(2)}]
    Events Signal: [${Math.min(events.length / 20, 0.95).toFixed(2)}, 0.60]
    Documents Signal: [${Math.min(docs.length / 20, 0.95).toFixed(2)}, 0.55]
    Procedures Signal: [${Math.min(procedures.length / 10, 0.95).toFixed(2)}, 0.75]
    Adopted Texts: [${Math.min(adoptedTexts.length / 10, 0.95).toFixed(2)}, 0.85]
\`\`\`

## 5-Signal Model Scores

| Signal | Raw Data | Score |
|--------|----------|-------|
| Volume | ${events.length} events, ${docs.length} documents | ${Math.min((events.length + docs.length) / 10, 5).toFixed(1)}/5 |
| Pipeline | ${procedures.length} procedures | ${Math.min(procedures.length / 5, 5).toFixed(1)}/5 |
| Output | ${adoptedTexts.length} adopted texts | ${Math.min(adoptedTexts.length / 5, 5).toFixed(1)}/5 |
| Anomalies | Pattern deviation detection | — |
| Coalition | Group alignment analysis | — |

## Data Summary

| Metric | Value |
|--------|-------|
| Computed significance | ${significance.toUpperCase()} |
| Total data points | ${events.length + docs.length + procedures.length + adoptedTexts.length} |
| Events | ${events.length} |
| Documents | ${docs.length} |
| Procedures | ${procedures.length} |
| Adopted texts | ${adoptedTexts.length} |
| Date | ${date} |

## Date: ${date}
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

\`\`\`mermaid
pie title Impact Distribution by Dimension — ${date}
    "Legislative" : ${impactToNum(matrix.legislativeImpact)}
    "Coalition" : ${impactToNum(matrix.coalitionImpact)}
    "Public Opinion" : ${impactToNum(matrix.publicOpinionImpact)}
    "Institutional" : ${impactToNum(matrix.institutionalImpact)}
    "Economic" : ${impactToNum(matrix.economicImpact)}
\`\`\`

## Impact Dimensions

| Dimension | Level | Indicator | Numeric |
|-----------|-------|-----------|---------|
| Legislative | ${matrix.legislativeImpact} | ${impactIndicator(matrix.legislativeImpact)} | ${impactToNum(matrix.legislativeImpact)} |
| Coalition | ${matrix.coalitionImpact} | ${impactIndicator(matrix.coalitionImpact)} | ${impactToNum(matrix.coalitionImpact)} |
| Public Opinion | ${matrix.publicOpinionImpact} | ${impactIndicator(matrix.publicOpinionImpact)} | ${impactToNum(matrix.publicOpinionImpact)} |
| Institutional | ${matrix.institutionalImpact} | ${impactIndicator(matrix.institutionalImpact)} | ${impactToNum(matrix.institutionalImpact)} |
| Economic | ${matrix.economicImpact} | ${impactIndicator(matrix.economicImpact)} | ${impactToNum(matrix.economicImpact)} |

## Summary

| Metric | Value |
|--------|-------|
| Overall significance | ${matrix.overallSignificance.toUpperCase()} |
| Highest impact | ${highestImpactDimension(matrix)} |
| Date | ${date} |

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
function buildActorMappingMarkdown(fetchedData, date) {
  const input = toClassificationInput(fetchedData);
  const actors = classifyPoliticalActors(input);
  const header = buildMarkdownHeader('actor-mapping', date, actors.length > 0 ? 'medium' : 'low');
  const actorRows =
    actors.length > 0
      ? actors
          .map(
            (a) =>
              `| ${sanitizeCell(a.name)} | ${sanitizeCell(a.actorType)} | ${sanitizeCell(String(a.influence))} | ${sanitizeCell(a.position)} | ${sanitizeCell(a.role)} |`
          )
          .join('\n')
      : '| — | — | — | — | — |';
  // Build actor type distribution for Mermaid
  const actorTypes = actors.length > 0 ? [...new Set(actors.map((a) => a.actorType))] : [];
  const typeCounts = actorTypes.map((t) => ({
    type: t,
    count: actors.filter((a) => a.actorType === t).length,
  }));
  const mermaidPie =
    typeCounts.length > 0
      ? typeCounts.map((tc) => `    "${tc.type}" : ${tc.count}`).join('\n')
      : '    "No actors classified" : 1';
  return (
    header +
    `# Political Actor Mapping

## Actors Identified: ${actors.length}

\`\`\`mermaid
pie title Actor Type Distribution — ${date}
${mermaidPie}
\`\`\`

## Actor Classification

| Actor | Type | Influence | Position | Role |
|-------|------|-----------|----------|------|
${actorRows}

## Type Counts

| Type | Count |
|------|-------|
${typeCounts.length > 0 ? typeCounts.map((tc) => `| ${tc.type} | ${tc.count} |`).join('\n') : '| — | 0 |'}

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
  const cp = Math.max(1, Math.min(99, Math.round(forces.coalitionPower.strength * 100)));
  const op = Math.max(1, Math.min(99, Math.round(forces.oppositionPower.strength * 100)));
  const ib = Math.max(1, Math.min(99, Math.round(forces.institutionalBarriers.strength * 100)));
  const pp = Math.max(1, Math.min(99, Math.round(forces.publicPressure.strength * 100)));
  const ei = Math.max(1, Math.min(99, Math.round(forces.externalInfluences.strength * 100)));
  return (
    header +
    `# Political Forces Analysis

\`\`\`mermaid
pie title Political Force Distribution — ${date}
    "Coalition Power" : ${cp}
    "Opposition Power" : ${op}
    "Institutional Barriers" : ${ib}
    "Public Pressure" : ${pp}
    "External Influences" : ${ei}
\`\`\`

## Forces Data

| Force | Trend | Strength | Key Actors | Confidence |
|-------|-------|----------|------------|------------|
${forceRow('Coalition Power', forces.coalitionPower)}
${forceRow('Opposition Power', forces.oppositionPower)}
${forceRow('Institutional Barriers', forces.institutionalBarriers)}
${forceRow('Public Pressure', forces.publicPressure)}
${forceRow('External Influences', forces.externalInfluences)}

## Balance

| Metric | Value |
|--------|-------|
| Coalition vs Opposition | ${cp}% vs ${op}% |
| Dominant force | ${cp > op ? 'Coalition' : op > cp ? 'Opposition' : 'Balanced'} |
| Date | ${date} |

## Date: ${date}
`
  );
}
/**
 * Build markdown for the political STRIDE threat assessment.
 *
 * Uses the pipeline `date` parameter to ensure the assessment date in the
 * generated markdown matches the `analysis-output/{date}/` folder, overriding
 * the `new Date()` timestamp that `assessPoliticalThreats()` stamps internally.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date (used to override assessment date for consistency)
 * @returns Markdown content string
 */
function buildPoliticalStrideMarkdown(fetchedData, date) {
  const input = toThreatInput(fetchedData);
  const assessment = assessPoliticalThreats(input);
  return generateThreatAssessmentMarkdown({ ...assessment, date });
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
    const analysis = analyzeLegislativeDisruption(id, input);
    const disruptionCount = analysis.disruptionPoints.length;
    disruptions.push(
      `| ${sanitizeCell(id)} | ${sanitizeCell(title.slice(0, 50))} | ${sanitizeCell(analysis.currentStage)} | ${sanitizeCell(analysis.resilience)} | ${disruptionCount} |`
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
    const likelihoodMap = {
      rare: 0.15,
      unlikely: 0.3,
      possible: 0.5,
      likely: 0.7,
      'almost certain': 0.9,
    };
    const impactMap = {
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
 * Outputs data-derived group metrics for AI agent to perform actual analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildPoliticalCapitalRiskMarkdown(fetchedData, date) {
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
 * Build the data-driven SWOT items for the political SWOT analysis.
 *
 * Descriptions are derived purely from data metrics — no pre-written
 * political conclusions. AI enrichment markers indicate where the agentic
 * workflow should inject real political intelligence analysis.
 *
 * Extracted from `buildQuantitativeSwotMarkdown` to reduce cognitive complexity.
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
function buildPoliticalSwotItems(counts) {
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
function buildQuantitativeSwotMarkdown(fetchedData, date) {
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
  // Build data-driven SWOT items with narrative descriptions
  const { strengths, weaknesses, opportunities, threats } = buildPoliticalSwotItems(counts);
  const swot = buildQuantitativeSWOT(
    `Political SWOT Assessment ${date}`,
    strengths,
    weaknesses,
    opportunities,
    threats
  );
  // Build narrative sections for each quadrant
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
    ArticleCategory.WEEK_AHEAD,
    identifiedRisks,
    riskDrivers,
    ['Monitor legislative velocity indicators', 'Track coalition voting patterns']
  );
  return generateRiskAssessmentMarkdown(workflow);
}
/**
 * Build markdown for the deep multi-perspective analysis.
 * Outputs raw data metrics per stakeholder group for AI agent enrichment.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildDeepAnalysisMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('deep-analysis', date, 'high');
  const events = safeArr(fetchedData, 'events');
  const procedures = safeArr(fetchedData, 'procedures');
  const documents = safeArr(fetchedData, 'documents');
  const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
  const questions = safeArr(fetchedData, 'questions');
  const mepUpdates = safeArr(fetchedData, 'mepUpdates');
  return (
    header +
    `# Deep Multi-Perspective Analysis

## Raw Data Inventory
| Data Source | Count |
|-------------|-------|
| Events | ${events.length} |
| Procedures | ${procedures.length} |
| Documents | ${documents.length} |
| Adopted Texts | ${adoptedTexts.length} |
| Questions | ${questions.length} |
| MEP Updates | ${mepUpdates.length} |
| **Total** | **${events.length + procedures.length + documents.length + adoptedTexts.length + questions.length + mepUpdates.length}** |

## Stakeholder Groups for AI Analysis
| Stakeholder Group | Data Points Available |
|-------------------|---------------------|
| Political Groups | ${procedures.length + adoptedTexts.length} (procedures + adopted texts) |
| Civil Society | ${documents.length + questions.length} (documents + questions) |
| Industry | ${procedures.length} (procedures) |
| National Governments | ${adoptedTexts.length} (adopted texts) |
| Citizens | ${questions.length + mepUpdates.length} (questions + MEP updates) |
| EU Institutions | ${events.length + procedures.length} (events + procedures) |

## Date: ${date}
`
  );
}
/**
 * Build markdown for the stakeholder impact analysis.
 * Outputs data inventory per stakeholder group for AI agent analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
function buildStakeholderAnalysisMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader('stakeholder-analysis', date, 'high');
  const procedures = safeArr(fetchedData, 'procedures');
  const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
  const documents = safeArr(fetchedData, 'documents');
  const events = safeArr(fetchedData, 'events');
  const questions = safeArr(fetchedData, 'questions');
  const mepUpdates = safeArr(fetchedData, 'mepUpdates');
  const votingRecords = safeArr(fetchedData, 'votingRecords');
  const coalitions = safeArr(fetchedData, 'coalitions');
  return (
    header +
    `# Stakeholder Impact Analysis

## Data Available for Stakeholder Assessment
| Stakeholder Group | Primary Data Sources | Data Points |
|-------------------|---------------------|-------------|
| Political Groups | Procedures, Adopted Texts, Voting Records, Coalitions | ${procedures.length + adoptedTexts.length + votingRecords.length + coalitions.length} |
| Civil Society | Documents, Questions, Events | ${documents.length + questions.length + events.length} |
| Industry | Procedures, Adopted Texts | ${procedures.length + adoptedTexts.length} |
| National Governments | Adopted Texts, Procedures, Coalitions | ${adoptedTexts.length + procedures.length + coalitions.length} |
| Citizens | Questions, MEP Updates, Events | ${questions.length + mepUpdates.length + events.length} |
| EU Institutions | Events, Procedures, Adopted Texts, Voting Records | ${events.length + procedures.length + adoptedTexts.length + votingRecords.length} |

## Data Source Summary
| Source | Count |
|--------|-------|
${Object.keys(fetchedData)
  .filter((k) => Array.isArray(fetchedData[k]))
  .map((k) => `| ${k} | ${fetchedData[k].length} |`)
  .join('\n')}

## Date: ${date}
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
/**
 * Process a single feed item: deduplicate, write per-document files, and
 * collect the index entry.  Returns `undefined` if the item is invalid or
 * already analyzed.
 *
 * @param raw - Raw feed item (may be null, non-object, or a valid record)
 * @param feedKey - Feed category key (e.g. 'adoptedTexts', 'procedures')
 * @param date - Analysis date string
 * @param analyzedIds - Set of already-processed document IDs for deduplication
 * @param docDir - Output directory for per-document markdown (empty string to skip writing)
 * @param rawDataDir - Output directory for raw JSON data
 * @param significance - Precomputed global political significance
 * @param threats - Precomputed global threat assessment
 * @returns Document entry for the index, or undefined if skipped
 */
function processDocumentItem(
  raw,
  feedKey,
  date,
  analyzedIds,
  docDir,
  rawDataDir,
  significance,
  threats
) {
  if (!raw || typeof raw !== 'object') return undefined;
  const item = raw;
  const docId = extractDocumentId(item);
  const dedupeKey = docId.toLowerCase().trim();
  if (analyzedIds.has(dedupeKey)) return undefined;
  analyzedIds.add(dedupeKey);
  const title = extractDocumentTitle(item);
  const safeId = sanitizeDocumentId(docId);
  const filename = `${sanitizeDocumentId(feedKey)}-${safeId}-analysis.md`;
  if (docDir) {
    const docContent = buildSingleDocumentAnalysis(
      item,
      docId,
      title,
      feedKey,
      date,
      significance,
      threats
    );
    writeTextFile(path.join(docDir, filename), docContent);
    const rawJsonFilename = `${sanitizeDocumentId(feedKey)}-${safeId}-raw.json`;
    writeTextFile(path.join(rawDataDir, rawJsonFilename), JSON.stringify(item, null, 2));
  }
  return { category: feedKey, id: docId, title, filename };
}
function buildDocumentAnalysisMarkdown(fetchedData, date) {
  const header = buildMarkdownHeader(METHOD_DOCUMENT_ANALYSIS, date, 'high');
  const dateOutputDir = fetchedData['_dateOutputDir'];
  const outputBase = typeof dateOutputDir === 'string' ? dateOutputDir : '';
  // Create output directories once, before iterating over items
  const docDir = outputBase ? path.join(outputBase, 'documents') : '';
  const rawDataDir = outputBase ? path.join(outputBase, 'documents', 'raw-data') : '';
  if (docDir) ensureDirectoryExists(docDir);
  if (rawDataDir) ensureDirectoryExists(rawDataDir);
  // Pre-compute global significance and threat assessments once per run
  // (both are based on the entire fetchedData, not individual documents)
  const globalInput = toClassificationInput(fetchedData);
  const globalSignificance = assessPoliticalSignificance(globalInput);
  const globalThreatInput = toThreatInput(fetchedData);
  const globalThreats = assessPoliticalThreats(globalThreatInput);
  // Collect all documents across feed categories with deduplication
  const analyzedIds = new Set();
  const documentEntries = [];
  for (const feedKey of DOCUMENT_FEED_KEYS) {
    const items = safeArr(fetchedData, feedKey);
    for (const raw of items) {
      const entry = processDocumentItem(
        raw,
        feedKey,
        date,
        analyzedIds,
        docDir,
        rawDataDir,
        globalSignificance,
        globalThreats
      );
      if (entry) documentEntries.push(entry);
    }
  }
  // Store analyzed IDs for manifest consumption as a non-enumerable property
  // to prevent leaking into dataSourcesUsed which iterates enumerable keys
  Object.defineProperty(fetchedData, '_analyzedDocumentIds', {
    value: [...analyzedIds],
    writable: false,
    configurable: true,
    enumerable: false,
  });
  // Build index table
  const tableRows =
    documentEntries.length > 0
      ? documentEntries
          .map(
            (d) =>
              `| ${sanitizeCell(d.id)} | ${sanitizeCell(d.title.slice(0, 60))} | ${sanitizeCell(d.category)} | [${d.filename}](${d.filename}) |`
          )
          .join('\n')
      : '| — | No documents available | — | — |';
  return (
    header +
    `# Per-Document Intelligence Analysis Index

## Executive Summary

Full per-document political intelligence analysis for ${documentEntries.length} unique documents
across ${DOCUMENT_FEED_KEYS.length} feed categories.  Each document has been individually
analyzed from fetched European Parliament data with comprehensive significance assessment,
SWOT analysis, and threat profiling.

- **Total Documents Analyzed**: ${documentEntries.length}
- **Feed Categories Scanned**: ${DOCUMENT_FEED_KEYS.length}
- **Duplicates Deduplicated**: ${[...DOCUMENT_FEED_KEYS].reduce((s, k) => s + safeArr(fetchedData, k).length, 0) - documentEntries.length}
- **Date**: ${date}

## Document Analysis Index

| Document ID | Title | Category | Analysis File |
|-------------|-------|----------|---------------|
${tableRows}

## Category Breakdown

${DOCUMENT_FEED_KEYS.map((k) => `- **${k}**: ${safeArr(fetchedData, k).length} items (${documentEntries.filter((d) => d.category === k).length} unique analyzed)`).join('\n')}

## Methodology

Each document receives:
1. **Raw Data Storage** — Full document JSON stored in \`documents/raw-data/\` for complete data preservation
2. **Significance Classification** — Political importance on 5-level scale
3. **SWOT Assessment** — Strengths, weaknesses, opportunities, threats specific to the document
4. **Threat Profiling** — Political STRIDE analysis for disruption potential
5. **Stakeholder Impact** — Projected effects on key stakeholder groups
6. **Intelligence Summary** — Key findings and actionable insights

## Document Storage

All ${documentEntries.length} documents have been stored in their entirety:
- **Analysis files**: \`documents/{category}-{id}-analysis.md\`
- **Raw JSON data**: \`documents/raw-data/{category}-{id}-raw.json\`
- **Deduplication**: Documents appearing in multiple feed categories are stored once with primary category reference

## Date: ${date}
`
  );
}
/**
 * Build comprehensive analysis markdown for a single document.
 *
 * Produces a standalone analysis file containing significance assessment,
 * full narrative SWOT, threat profiling, and stakeholder impact for one
 * individual EP document.
 *
 * @param item - Raw document item from feed data
 * @param docId - Document identifier
 * @param title - Document title
 * @param category - Feed category the document came from
 * @param date - Analysis date
 * @param significance - Precomputed global political significance
 * @param threats - Precomputed global threat assessment
 * @returns Markdown content for single document analysis
 */
function buildSingleDocumentAnalysis(item, docId, title, category, date, significance, threats) {
  // Extract available metadata from the document
  const docType = typeof item['type'] === 'string' ? item['type'] : category;
  const docDate = typeof item['date'] === 'string' ? item['date'] : date;
  const docStatus = typeof item['status'] === 'string' ? item['status'] : 'unknown';
  const docStage = typeof item['stage'] === 'string' ? item['stage'] : 'N/A';
  const docDescription =
    typeof item['description'] === 'string'
      ? item['description']
      : typeof item['summary'] === 'string'
        ? item['summary']
        : 'No description available';
  // Build document-specific SWOT items — data-derived only, no pre-written conclusions
  const docStrengths = [
    createScoredSWOTItem(
      `Document ${sanitizeDocumentId(docId)} available in ${category} feed`,
      3,
      [`Document ID: ${docId}`, `Category: ${category}`, `Status: ${docStatus}`],
      'medium',
      'stable'
    ),
  ];
  const docWeaknesses = [
    createScoredSWOTItem(
      `Document stage: ${docStage}, status: ${docStatus}`,
      2,
      [`Current stage: ${docStage}`, `Type: ${docType}`, `Date: ${docDate}`],
      'medium',
      'stable'
    ),
  ];
  const docOpportunities = [
    createScoredOpportunityOrThreat(
      `${category} document with ID ${sanitizeDocumentId(docId)}`,
      'possible',
      'moderate',
      [`Category: ${category}`, `Date: ${docDate}`],
      'medium',
      'stable'
    ),
  ];
  const docThreats = [
    createScoredOpportunityOrThreat(
      `Document ${sanitizeDocumentId(docId)} — pipeline risk assessment`,
      'possible',
      'moderate',
      [`Stage: ${docStage}`, `Status: ${docStatus}`],
      'medium',
      'stable'
    ),
  ];
  const docSwot = buildQuantitativeSWOT(
    `SWOT: ${title}`,
    docStrengths,
    docWeaknesses,
    docOpportunities,
    docThreats
  );
  return `---
method: ${METHOD_DOCUMENT_ANALYSIS}
documentId: ${JSON.stringify(docId)}
category: ${JSON.stringify(category)}
date: ${JSON.stringify(date)}
confidence: medium
generated: ${JSON.stringify(new Date().toISOString())}
---

# Document Analysis: ${sanitizeCell(title)}

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | ${sanitizeCell(docId)} |
| **Title** | ${sanitizeCell(title)} |
| **Type** | ${sanitizeCell(docType)} |
| **Category** | ${sanitizeCell(category)} |
| **Date** | ${sanitizeCell(docDate)} |
| **Status** | ${sanitizeCell(docStatus)} |
| **Stage** | ${sanitizeCell(docStage)} |

## Description

${sanitizeCell(docDescription)}

## Political Significance Assessment

- **Overall Significance**: ${significance.toUpperCase()}
- **Context**: Document ${sanitizeCell(docId)} within ${category} feed

## Document-Specific SWOT Analysis

### Strategic Position Score: ${docSwot.strategicPositionScore.toFixed(1)}/10

| Category | Score | Assessment |
|----------|-------|------------|
| Strengths | ${docSwot.strengths.reduce((s, i) => s + i.score, 0).toFixed(1)} | ${docSwot.strengths.map((s) => s.description).join('; ')} |
| Weaknesses | ${docSwot.weaknesses.reduce((s, i) => s + i.score, 0).toFixed(1)} | ${docSwot.weaknesses.map((w) => w.description).join('; ')} |
| Opportunities | ${docSwot.opportunities.reduce((s, i) => s + i.score, 0).toFixed(1)} | ${docSwot.opportunities.map((o) => o.description).join('; ')} |
| Threats | ${docSwot.threats.reduce((s, i) => s + i.score, 0).toFixed(1)} | ${docSwot.threats.map((t) => t.description).join('; ')} |

## Threat Assessment

- **STRIDE Categories Evaluated**: ${threats.strideCategories.length}
- **Overall Threat Level**: ${threats.overallThreatLevel}
- **Assessment Date**: ${threats.date}

## Stakeholder Impact

| Stakeholder Group | Impact Level |
|-------------------|-------------|
| Political Groups | ${significance === 'routine' ? 'Low' : 'Medium'} |
| Civil Society | ${significance === 'routine' ? 'Low' : 'Medium'} |
| Industry | ${String(docType).toLowerCase() === 'resolution' || String(docType).toLowerCase() === 'directive' ? 'Medium' : 'Low'} |
| National Governments | ${String(docStage).toLowerCase() === 'trilogue' ? 'High' : 'Low'} |
| Citizens | Low |
| EU Institutions | ${significance === 'critical' || significance === 'historic' ? 'High' : 'Low'} |

## Intelligence Summary

| Metric | Value |
|--------|-------|
| Document | ${sanitizeCell(docId)} |
| Category | ${sanitizeCell(category)} |
| Type | ${sanitizeCell(docType)} |
| Stage | ${sanitizeCell(docStage)} |
| Status | ${sanitizeCell(docStatus)} |
| Significance | ${significance} |
| SWOT Score | ${docSwot.strategicPositionScore.toFixed(1)}/10 |
| Overall Assessment | ${docSwot.overallAssessment} |
| STRIDE Categories | ${threats.strideCategories.length} |
| Overall Threat Level | ${threats.overallThreatLevel} |

## Analysis Date: ${date}
`;
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
  'document-analysis': buildDocumentAnalysisMarkdown,
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
/** Subdirectory name for per-document analysis methods */
const SUBDIR_DOCUMENTS = 'documents';
/** Analysis method identifier for per-document intelligence analysis */
const METHOD_DOCUMENT_ANALYSIS = 'document-analysis';
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
  'document-analysis': SUBDIR_DOCUMENTS,
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
  'document-analysis': 'medium',
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
  'document-analysis': 'document-analysis-index.md',
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
    // Inject dateOutputDir for the document-analysis builder to write per-document files
    if (method === METHOD_DOCUMENT_ANALYSIS) {
      fetchedData['_dateOutputDir'] = dateOutputDir;
    }
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
    requireData = false,
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
  // When requireData is set (agentic workflows), abort immediately when no
  // substantive EP data was fetched — running analysis on empty data produces
  // hollow output that should never feed into article generation.
  if (!hasSubstantiveData(fetchedData)) {
    if (requireData) {
      throw new Error(
        'Analysis aborted: no substantive EP data available. ' +
          'MCP data fetch must succeed before analysis can run. ' +
          'Check MCP connection and feed data source.'
      );
    }
    console.warn(
      '⚠️  [analysis] No substantive EP data in fetchedData — analysis output will be data-sparse. ' +
        'Ensure MCP connection succeeded and feed data was fetched before running analysis.'
    );
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
  // When requireData is set (agentic workflows), abort if ANY method failed.
  // Incomplete analysis must never feed into article generation — the agentic
  // workflow should fix issues rather than produce articles from partial data.
  const failedMethods = methodResults.filter((r) => r.status === 'failed');
  if (requireData && failedMethods.length > 0) {
    const failedNames = failedMethods.map((r) => r.method).join(', ');
    throw new Error(
      `Analysis aborted: ${failedMethods.length} of ${methodResults.length} methods failed (${failedNames}). ` +
        'Agentic workflow requires ALL analysis methods to succeed. ' +
        'Fix data fetch or method errors before retrying.'
    );
  }
  const endTime = new Date().toISOString();
  const overallConfidence = aggregateConfidence(methodResults);
  const dataSourcesUsed = Object.keys(fetchedData).filter(
    (k) => Array.isArray(fetchedData[k]) && fetchedData[k].length > 0
  );
  // Collect per-document analysis tracking from the document-analysis builder
  const analyzedDocIds = Array.isArray(fetchedData['_analyzedDocumentIds'])
    ? fetchedData['_analyzedDocumentIds']
    : [];
  const manifest = {
    runId,
    date,
    startTime,
    endTime,
    articleTypes: [...articleTypes],
    methods: methodResults,
    overallConfidence,
    dataSourcesUsed,
    documentsAnalyzed: analyzedDocIds.length,
    analyzedDocumentIds: analyzedDocIds,
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
