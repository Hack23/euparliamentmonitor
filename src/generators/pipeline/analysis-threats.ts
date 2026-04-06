// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/AnalysisThreats
 * @description Threat assessment analysis method builders for the analysis pipeline.
 *
 * Contains markdown builders for the **Threat Assessment** analysis method group:
 * - `political-threat-landscape` — overall political threat assessment
 * - `actor-threat-profiling` — individual actor threat profiles
 * - `consequence-trees` — action-consequence chain analysis
 * - `legislative-disruption` — legislative process disruption identification
 */

import {
  assessPoliticalThreats,
  buildActorThreatProfiles,
  buildConsequenceTree,
  analyzeLegislativeDisruption,
  generateThreatAssessmentMarkdown,
} from '../../utils/political-threat-assessment.js';
import {
  sanitizeCell,
  safeArr,
  toThreatInput,
  buildMarkdownHeader,
  EMPTY_TABLE_ROW_6,
} from './analysis-helpers.js';
import type { MarkdownBuilder } from './analysis-helpers.js';

// ─── Per-method markdown builders ────────────────────────────────────────────

/**
 * Build markdown for the political threat landscape assessment.
 *
 * Uses the pipeline `date` parameter to ensure the assessment date in the
 * generated markdown matches the `analysis/{date}/` folder, overriding
 * the `new Date()` timestamp that `assessPoliticalThreats()` stamps internally.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date (used to override assessment date for consistency)
 * @returns Markdown content string
 */
export function buildThreatLandscapeMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
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
export function buildActorThreatProfilingMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
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
export function buildConsequenceTreesMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const input = toThreatInput(fetchedData);
  const procedures = safeArr(fetchedData, 'procedures');
  const header = buildMarkdownHeader('consequence-trees', date, 'medium');

  const trees: string[] = [];
  for (const raw of procedures.slice(0, 5)) {
    const proc = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
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
export function buildLegislativeDisruptionMarkdown(
  fetchedData: Record<string, unknown>,
  date: string
): string {
  const input = toThreatInput(fetchedData);
  const procedures = safeArr(fetchedData, 'procedures');
  const header = buildMarkdownHeader('legislative-disruption', date, 'medium');

  const disruptions: string[] = [];
  for (const raw of procedures.slice(0, 5)) {
    const proc = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
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

/** All threat assessment method builders keyed by their AnalysisMethod identifier */
export const THREAT_BUILDERS: Readonly<Record<string, MarkdownBuilder>> = {
  'political-threat-landscape': buildThreatLandscapeMarkdown,
  'actor-threat-profiling': buildActorThreatProfilingMarkdown,
  'consequence-trees': buildConsequenceTreesMarkdown,
  'legislative-disruption': buildLegislativeDisruptionMarkdown,
};
