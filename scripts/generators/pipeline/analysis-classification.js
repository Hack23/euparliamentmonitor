// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Pipeline/AnalysisClassification
 * @description Classification analysis method builders for the analysis pipeline.
 *
 * Contains markdown builders for the **Classification** analysis method group:
 * - `significance-classification` — political significance scoring
 * - `impact-matrix` — multi-dimensional impact assessment
 * - `actor-mapping` — political actor classification
 * - `forces-analysis` — political forces balance analysis
 * - `significance-scoring` — 5-dimension EP event significance scoring
 */
import { assessPoliticalSignificance, buildImpactMatrix, classifyPoliticalActors, analyzePoliticalForces, } from '../../utils/political-classification.js';
import { scoreSignificance, scoreBatch, formatBatchMarkdown, } from '../../utils/significance-scoring.js';
import { sanitizeCell, safeArr, toClassificationInput, buildMarkdownHeader, impactToNum, impactIndicator, highestImpactDimension, } from './analysis-helpers.js';
// ─── Heuristic scoring thresholds for EP event data ───────────────────────────
/** Event-count threshold above which parliamentary significance is elevated */
const EVENT_VOLUME_HIGH_THRESHOLD = 5;
/** Event-count threshold above which institutional relevance is elevated */
const EVENT_VOLUME_VERY_HIGH_THRESHOLD = 10;
/** Procedure-count threshold above which policy impact is elevated */
const PROCEDURE_VOLUME_THRESHOLD = 3;
/** Adopted-text-count threshold above which public interest is elevated */
const ADOPTED_TEXT_VOLUME_THRESHOLD = 2;
/** Base scores for EP event dimensions when data volume is high / low */
const EVENT_PARLIAMENTARY_HIGH = 6;
const EVENT_PARLIAMENTARY_LOW = 4;
const EVENT_POLICY_HIGH = 6;
const EVENT_POLICY_LOW = 3;
const EVENT_PUBLIC_HIGH = 5;
const EVENT_PUBLIC_LOW = 3;
/** Default temporal urgency for events (mid-range, adjusted at AI scoring) */
const EVENT_DEFAULT_URGENCY = 5;
const EVENT_INSTITUTIONAL_HIGH = 7;
const EVENT_INSTITUTIONAL_LOW = 4;
/** Base dimension scores for adopted texts (plenary-approved) */
const ADOPTED_PARLIAMENTARY_BASE = 6;
const ADOPTED_POLICY_BASE = 5;
const ADOPTED_PUBLIC_BASE = 4;
const ADOPTED_URGENCY_BASE = 3;
const ADOPTED_INSTITUTIONAL_BASE = 5;
// ─── Content-aware scoring keywords for adopted text differentiation ──────────
/** Title keywords indicating high-impact legislative texts (directives, regulations) */
const HIGH_IMPACT_TITLE_KEYWORDS = /\b(?:directive|regulation|regulation\s+\(eu\)|codecision|ordinary\s+legislative|COD|budget|defence|security|tariff|anti-corruption|banking|single\s+market)\b/i;
/** Title keywords indicating moderate-impact texts */
const MODERATE_IMPACT_TITLE_KEYWORDS = /\b(?:resolution|decision|recommendation|amendment|framework|strategy|agreement|trade|environment|climate|digital|data\s+protection|consumer|health)\b/i;
/** Procedure references indicating ordinary legislative procedure (highest significance) */
const COD_PROCEDURE_PATTERN = /\bCOD\b|\b\d{4}\/\d{4}\(COD\)/i;
/** Pattern for recent EP10 adopted texts (current term) */
const EP10_ADOPTED_TEXT_PATTERN = /TA-10-202[5-9]/i;
/**
 * Score an adopted text based on its actual content metadata.
 *
 * Analyses the title, reference, and any procedure type information to
 * produce differentiated scores rather than flat constants. High-impact
 * legislative texts (directives, regulations, COD procedures) score higher
 * than routine administrative texts.
 *
 * @param title - Adopted text title or label
 * @param reference - EP reference identifier
 * @param workType - Optional work type field from EP data
 * @param procedureReference - Optional procedure reference
 * @returns Per-dimension scoring input
 */
function scoreAdoptedText(title, reference, workType, procedureReference) {
    let parliamentary = ADOPTED_PARLIAMENTARY_BASE;
    let policy = ADOPTED_POLICY_BASE;
    let publicInterest = ADOPTED_PUBLIC_BASE;
    let urgency = ADOPTED_URGENCY_BASE;
    let institutional = ADOPTED_INSTITUTIONAL_BASE;
    const combined = `${title} ${reference} ${workType ?? ''} ${procedureReference ?? ''}`;
    // Boost for high-impact legislative keywords
    if (HIGH_IMPACT_TITLE_KEYWORDS.test(combined)) {
        parliamentary += 2;
        policy += 2;
        publicInterest += 2;
        institutional += 2;
    }
    else if (MODERATE_IMPACT_TITLE_KEYWORDS.test(combined)) {
        parliamentary += 1;
        policy += 1;
        publicInterest += 1;
        institutional += 1;
    }
    // Boost for ordinary legislative procedure (COD) — highest parliamentary significance
    if (COD_PROCEDURE_PATTERN.test(combined)) {
        parliamentary += 1;
        policy += 1;
    }
    // Boost urgency for current-term (EP10) adopted texts
    if (EP10_ADOPTED_TEXT_PATTERN.test(reference)) {
        urgency += 2;
    }
    // Boost for legislative resolution work types
    if (workType &&
        /legislative.*resolution|position.*first.*reading/i.test(workType)) {
        parliamentary += 1;
        policy += 1;
    }
    return {
        parliamentarySignificance: Math.min(10, parliamentary),
        policyImpact: Math.min(10, policy),
        publicInterest: Math.min(10, publicInterest),
        temporalUrgency: Math.min(10, urgency),
        institutionalRelevance: Math.min(10, institutional),
    };
}
/** Analysis method identifier for significance scoring */
export const METHOD_SIGNIFICANCE_SCORING_ID = 'significance-scoring';
// ─── Per-method markdown builders ────────────────────────────────────────────
/**
 * Build markdown for the significance classification method.
 * Scores and ranks legislative items by political significance.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildSignificanceClassificationMarkdown(fetchedData, date) {
    const input = toClassificationInput(fetchedData);
    const significance = assessPoliticalSignificance(input);
    const events = safeArr(fetchedData, 'events');
    const docs = safeArr(fetchedData, 'documents');
    const procedures = safeArr(fetchedData, 'procedures');
    const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
    const header = buildMarkdownHeader('significance-classification', date, significance === 'routine' ? 'medium' : 'high');
    const sigMap = {
        historic: 0.95,
        critical: 0.8,
        significant: 0.65,
        notable: 0.45,
        routine: 0.25,
    };
    const sigScore = sigMap[significance] ?? 0.25;
    return (header +
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
`);
}
/**
 * Build markdown for the impact matrix method.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildImpactMatrixMarkdown(fetchedData, date) {
    const input = toClassificationInput(fetchedData);
    const matrix = buildImpactMatrix(input);
    const header = buildMarkdownHeader('impact-matrix', date, 'medium');
    return (header +
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
`);
}
/**
 * Build markdown for the actor mapping method.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildActorMappingMarkdown(fetchedData, date) {
    const input = toClassificationInput(fetchedData);
    const actors = classifyPoliticalActors(input);
    const header = buildMarkdownHeader('actor-mapping', date, actors.length > 0 ? 'medium' : 'low');
    const actorRows = actors.length > 0
        ? actors
            .map((a) => `| ${sanitizeCell(a.name)} | ${sanitizeCell(a.actorType)} | ${sanitizeCell(String(a.influence))} | ${sanitizeCell(a.position)} | ${sanitizeCell(a.role)} |`)
            .join('\n')
        : '| — | — | — | — | — |';
    const actorTypes = actors.length > 0 ? [...new Set(actors.map((a) => a.actorType))] : [];
    const typeCounts = actorTypes.map((t) => ({
        type: t,
        count: actors.filter((a) => a.actorType === t).length,
    }));
    const mermaidPie = typeCounts.length > 0
        ? typeCounts.map((tc) => `    "${tc.type}" : ${tc.count}`).join('\n')
        : '    "No actors classified" : 1';
    return (header +
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
`);
}
/**
 * Build markdown for the political forces analysis method.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildForcesAnalysisMarkdown(fetchedData, date) {
    const input = toClassificationInput(fetchedData);
    const forces = analyzePoliticalForces(input);
    const header = buildMarkdownHeader('forces-analysis', date, 'medium');
    const forceRow = (name, f) => `| ${sanitizeCell(name)} | ${sanitizeCell(f.trend)} | ${(f.strength * 100).toFixed(0)}% | ${f.keyActors.length > 0 ? sanitizeCell(f.keyActors.join(', ')) : '—'} | ${sanitizeCell(f.confidence)} |`;
    const cp = Math.max(1, Math.min(99, Math.round(forces.coalitionPower.strength * 100)));
    const op = Math.max(1, Math.min(99, Math.round(forces.oppositionPower.strength * 100)));
    const ib = Math.max(1, Math.min(99, Math.round(forces.institutionalBarriers.strength * 100)));
    const pp = Math.max(1, Math.min(99, Math.round(forces.publicPressure.strength * 100)));
    const ei = Math.max(1, Math.min(99, Math.round(forces.externalInfluences.strength * 100)));
    return (header +
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
`);
}
/**
 * Build markdown for the significance-scoring method.
 * Uses the 5-dimension scoring engine to score all EP events.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildSignificanceScoringMarkdown(fetchedData, date) {
    const events = safeArr(fetchedData, 'events');
    const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
    const procedures = safeArr(fetchedData, 'procedures');
    const header = buildMarkdownHeader(METHOD_SIGNIFICANCE_SCORING_ID, date, 'medium');
    const inputs = [
        ...events.map((e) => {
            const ev = e;
            return {
                title: String(ev['title'] ?? ev['label'] ?? 'Unknown Event'),
                reference: String(ev['id'] ?? ''),
                parliamentarySignificance: Math.min(10, events.length > EVENT_VOLUME_HIGH_THRESHOLD
                    ? EVENT_PARLIAMENTARY_HIGH
                    : EVENT_PARLIAMENTARY_LOW),
                policyImpact: Math.min(10, procedures.length > PROCEDURE_VOLUME_THRESHOLD ? EVENT_POLICY_HIGH : EVENT_POLICY_LOW),
                publicInterest: Math.min(10, adoptedTexts.length > ADOPTED_TEXT_VOLUME_THRESHOLD ? EVENT_PUBLIC_HIGH : EVENT_PUBLIC_LOW),
                temporalUrgency: EVENT_DEFAULT_URGENCY,
                institutionalRelevance: Math.min(10, events.length > EVENT_VOLUME_VERY_HIGH_THRESHOLD
                    ? EVENT_INSTITUTIONAL_HIGH
                    : EVENT_INSTITUTIONAL_LOW),
            };
        }),
        ...adoptedTexts.map((t) => {
            const at = t;
            const title = String(at['title'] ?? at['label'] ?? 'Adopted Text');
            const reference = String(at['id'] ?? '');
            const workType = typeof at['work_type'] === 'string' ? at['work_type'] : undefined;
            const procedureRef = typeof at['procedure_reference'] === 'string' ? at['procedure_reference'] : undefined;
            const scores = scoreAdoptedText(title, reference, workType, procedureRef);
            return {
                title,
                reference,
                ...scores,
            };
        }),
    ];
    if (inputs.length === 0) {
        return `${header}# 📈 Significance Scoring — ${date}\n\nNo events or adopted texts available for scoring.\n`;
    }
    const batch = scoreBatch(inputs);
    const alignedScores = inputs.map((input) => scoreSignificance(input));
    const batchTable = formatBatchMarkdown(inputs, alignedScores);
    return `${header}# 📈 Significance Scoring — ${date}

## Summary

| Decision | Count |
|----------|:-----:|
| 📰 Publish | ${batch.summary.publish} |
| 📋 Hold | ${batch.summary.hold} |
| 🗄️ Skip | ${batch.summary.skip} |

## Batch Scoring

${batchTable}
`;
}
/** All classification method builders keyed by their AnalysisMethod identifier */
export const CLASSIFICATION_BUILDERS = {
    'significance-classification': buildSignificanceClassificationMarkdown,
    'impact-matrix': buildImpactMatrixMarkdown,
    'actor-mapping': buildActorMappingMarkdown,
    'forces-analysis': buildForcesAnalysisMarkdown,
    [METHOD_SIGNIFICANCE_SCORING_ID]: buildSignificanceScoringMarkdown,
};
//# sourceMappingURL=analysis-classification.js.map