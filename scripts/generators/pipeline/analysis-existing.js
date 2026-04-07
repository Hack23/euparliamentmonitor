// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Pipeline/AnalysisExisting
 * @description Existing analysis method builders for the analysis pipeline.
 *
 * Contains markdown builders for the **Existing** analysis method group and
 * cross-cutting meta methods:
 * - `deep-analysis` — deep multi-perspective analysis
 * - `stakeholder-analysis` — stakeholder impact analysis
 * - `coalition-analysis` — coalition cohesion analysis
 * - `voting-patterns` — voting pattern trend analysis
 * - `cross-session-intelligence` — cross-session coalition intelligence
 * - `synthesis-summary` — aggregated synthesis from all per-file analyses
 * - `document-analysis` — per-document intelligence analysis (opt-in)
 */
import path from 'path';
import { detectVotingTrends, computeCrossSessionCoalitionStability, } from '../../utils/intelligence-analysis.js';
import { assessPoliticalSignificance } from '../../utils/political-classification.js';
import { assessPoliticalThreats } from '../../utils/political-threat-assessment.js';
import { buildQuantitativeSWOT, createScoredSWOTItem, createScoredOpportunityOrThreat, } from '../../utils/political-risk-assessment.js';
import { ensureDirectoryExists } from '../../utils/file-utils.js';
import { buildSynthesisSummary, formatSynthesisMarkdown } from '../synthesis-summary.js';
import { sanitizeCell, sanitizeDocumentId, DOCUMENT_FEED_KEYS, extractDocumentId, extractDocumentTitle, safeArr, toClassificationInput, toThreatInput, buildMarkdownHeader, writeTextFile, } from './analysis-helpers.js';
/** Analysis method identifier for synthesis summary */
export const METHOD_SYNTHESIS_SUMMARY_ID = 'synthesis-summary';
/** Analysis method identifier for per-document intelligence analysis */
export const METHOD_DOCUMENT_ANALYSIS = 'document-analysis';
// ─── Per-method markdown builders ────────────────────────────────────────────
/**
 * Build markdown for the deep multi-perspective analysis.
 * Outputs raw data metrics per stakeholder group for AI agent enrichment.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildDeepAnalysisMarkdown(fetchedData, date) {
    const header = buildMarkdownHeader('deep-analysis', date, 'high');
    const events = safeArr(fetchedData, 'events');
    const procedures = safeArr(fetchedData, 'procedures');
    const documents = safeArr(fetchedData, 'documents');
    const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
    const questions = safeArr(fetchedData, 'questions');
    const mepUpdates = safeArr(fetchedData, 'mepUpdates');
    const total = events.length +
        procedures.length +
        documents.length +
        adoptedTexts.length +
        questions.length +
        mepUpdates.length;
    return (header +
        `# Deep Multi-Perspective Analysis

## Pipeline Data Context

> **Note:** This section contains script-generated data inventory. The AI agent must replace the entire content below the "---" separator with substantive political intelligence analysis.

| Data Source | Count |
|-------------|-------|
| Events | ${events.length} |
| Procedures | ${procedures.length} |
| Documents | ${documents.length} |
| Adopted Texts | ${adoptedTexts.length} |
| Questions | ${questions.length} |
| MEP Updates | ${mepUpdates.length} |
| **Total** | **${total}** |

| Stakeholder Group | Data Points Available |
|-------------------|---------------------|
| Political Groups | ${procedures.length + adoptedTexts.length} (procedures + adopted texts) |
| Civil Society | ${documents.length + questions.length} (documents + questions) |
| Industry | ${procedures.length} (procedures) |
| National Governments | ${adoptedTexts.length} (adopted texts) |
| Citizens | ${questions.length + mepUpdates.length} (questions + MEP updates) |
| EU Institutions | ${events.length + procedures.length} (events + procedures) |

---

## AI Agent Instructions

> **Instructions for AI Agent (Opus 4.6):** Read ALL methodology documents in analysis/methodologies/ before writing. Using the data inventory above and the raw EP MCP data files, produce a deep multi-perspective analysis following the political-style-guide.md depth Level 3 format. Your analysis MUST:
>
> 1. **Identify the 3-5 most politically significant items** from the available data, citing specific document IDs
> 2. **Analyse each from ≥3 stakeholder perspectives** (Political Groups, Civil Society, Industry, National Governments, Citizens, EU Institutions)
> 3. **Apply the SWOT framework** to the overall parliamentary activity pattern for this date
> 4. **Assess coalition dynamics** — which groups are aligning/diverging based on the adopted texts?
> 5. **Rate confidence** for each analytical claim: HIGH / MEDIUM / LOW
> 6. **Provide forward-looking indicators** — what should be monitored in the next 7-14 days?
> 7. **Never leave scaffold markers** — replace this entire section with real analysis
>
> Evidence requirement: ≥3 citations per section from EP MCP data (document IDs, vote references, procedure numbers).
> Quality gate: minimum 500 words of original analytical prose with evidence citations.
> When done, REMOVE this instructions section entirely and write analysis prose directly.

[TO BE FILLED BY AI AGENT — This section must contain substantive political intelligence analysis, not data summaries. Quality gate: minimum 500 words of original analytical prose with evidence citations.]

## Date: ${date}
`);
}
/**
 * Build markdown for the stakeholder impact analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildStakeholderAnalysisMarkdown(fetchedData, date) {
    const header = buildMarkdownHeader('stakeholder-analysis', date, 'high');
    const procedures = safeArr(fetchedData, 'procedures');
    const adoptedTexts = safeArr(fetchedData, 'adoptedTexts');
    const documents = safeArr(fetchedData, 'documents');
    const events = safeArr(fetchedData, 'events');
    const questions = safeArr(fetchedData, 'questions');
    const mepUpdates = safeArr(fetchedData, 'mepUpdates');
    const votingRecords = safeArr(fetchedData, 'votingRecords');
    const coalitions = safeArr(fetchedData, 'coalitions');
    return (header +
        `# Stakeholder Impact Analysis

## Data Available for Stakeholder Assessment (Script-Generated Context)
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

## AI Agent Instructions

> **Instructions for AI Agent (Opus 4.6):** Read ALL methodology documents in analysis/methodologies/. Using the stakeholder-impact.md template and the data inventory above, produce a stakeholder impact analysis for each of the 6 stakeholder groups. For each group:
>
> 1. **Impact direction**: positive / negative / neutral / mixed
> 2. **Impact severity**: high / medium / low
> 3. **Specific evidence**: Cite ≥2 specific EP documents, votes, or procedures that affect this stakeholder
> 4. **Reasoning**: 2-3 sentences explaining WHY this stakeholder is affected and HOW
> 5. **Action items**: What should this stakeholder watch or do in response?
> 6. **Confidence level**: HIGH / MEDIUM / LOW
>
> Focus on the MOST RECENT adopted texts and procedures. Do not produce generic stakeholder descriptions — every assessment must be grounded in specific EP data from this date period.
> When done, REMOVE this instructions section entirely and write analysis prose directly.

[TO BE FILLED BY AI AGENT — Each stakeholder group must have impact direction, severity, evidence citations, and reasoning. Quality gate: minimum 300 words of original analytical prose.]

## Date: ${date}
`);
}
/**
 * Build markdown for coalition cohesion analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildCoalitionAnalysisMarkdown(fetchedData, date) {
    const header = buildMarkdownHeader('coalition-analysis', date, 'high');
    const rawPatterns = Array.isArray(fetchedData['patterns']) ? fetchedData['patterns'] : [];
    const stabilityReport = computeCrossSessionCoalitionStability(rawPatterns);
    return (header +
        `# Coalition Cohesion Analysis

## Computed Metrics (Script-Generated Context)
- **Overall Stability**: ${(stabilityReport.overallStability * 100).toFixed(1)}%
- **Forecast**: ${stabilityReport.forecast}
- **Patterns Analysed**: ${stabilityReport.patternCount}
- **Stable Groups**: ${stabilityReport.stableGroups.length > 0 ? stabilityReport.stableGroups.join(', ') : 'No stable groups identified from voting data'}
- **Declining Groups**: ${stabilityReport.decliningGroups.length > 0 ? stabilityReport.decliningGroups.join(', ') : 'No declining groups identified from voting data'}
- **Raw Patterns Evaluated**: ${rawPatterns.length}

## AI Agent Instructions

> **Instructions for AI Agent (Opus 4.6):** Read ALL methodology documents in analysis/methodologies/. Using the political-risk-methodology.md coalition risk framework and the computed metrics above, produce a coalition intelligence analysis. Your analysis MUST:
>
> 1. **Assess the Grand Coalition** (EPP + S&D + Renew): Is it holding? What are the stress points?
> 2. **Identify emerging alliances**: Are ECR, PfE, or Greens/EFA forming tactical voting blocs?
> 3. **Analyse abstention patterns**: High abstention rates signal internal group conflicts — identify which groups and why
> 4. **Cross-party voting**: Identify any cases where MEPs voted against their group line on recent adopted texts
> 5. **Predict coalition evolution**: Based on current patterns, which coalitions will strengthen/weaken in the next month?
> 6. **Confidence levels**: Rate each coalition assessment as HIGH / MEDIUM / LOW
>
> If voting data is limited (patterns analysed = 0), use adopted texts and political landscape data to infer coalition dynamics from the policy positions embedded in recent legislation.
> When done, REMOVE this instructions section entirely and write analysis prose directly.

[TO BE FILLED BY AI AGENT — Substantive coalition dynamics analysis with evidence citations, confidence levels, and forward-looking predictions. Quality gate: minimum 400 words.]

## Date: ${date}
`);
}
/**
 * Build markdown for voting pattern analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildVotingPatternsMarkdown(fetchedData, date) {
    const header = buildMarkdownHeader('voting-patterns', date, 'high');
    const rawRecords = Array.isArray(fetchedData['votingRecords'])
        ? fetchedData['votingRecords']
        : [];
    const trends = detectVotingTrends(rawRecords);
    const trendsText = trends
        .map((t) => `| ${t.trendId} | ${t.direction} | ${(t.confidence * 100).toFixed(0)}% | ${t.recordCount} records |`)
        .join('\n');
    return (header +
        `# Voting Pattern Analysis

## Detected Trends (Script-Generated Context)
| Trend ID | Direction | Confidence | Data Points |
|----------|-----------|------------|-------------|
${trendsText || '| No trend data available from voting records | — | — | — |'}

## Computed Summary
- **Trends identified**: ${trends.length}
- **Records analysed**: ${rawRecords.length}

## AI Agent Instructions

> **Instructions for AI Agent (Opus 4.6):** Read ALL methodology documents in analysis/methodologies/. Using the voting pattern data above and the adopted texts from EP MCP feeds, produce a voting pattern intelligence analysis. Your analysis MUST:
>
> 1. **Identify voting blocs**: Which groups consistently vote together on recent adopted texts?
> 2. **Detect anomalies**: Any unexpected votes, close margins (<50 vote difference), or high abstention rates?
> 3. **Analyse by policy domain**: Do voting patterns differ between economic, environmental, and social legislation?
> 4. **Group discipline assessment**: Rate each major group's internal cohesion (high/medium/low) with evidence
> 5. **Trend detection**: Compare recent voting patterns to historical trends — is the Parliament becoming more/less fragmented?
> 6. **Forward-looking**: Which upcoming votes are likely to be contested based on current alignment patterns?
>
> If voting records are limited, analyse the adopted texts' policy positions to infer likely voting alignments and coalition patterns.
> When done, REMOVE this instructions section entirely and write analysis prose directly.

[TO BE FILLED BY AI AGENT — Substantive voting pattern analysis with specific vote references, group cohesion ratings, and anomaly detection. Quality gate: minimum 300 words.]

## Date: ${date}
`);
}
/**
 * Build markdown for cross-session intelligence analysis.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildCrossSessionIntelligenceMarkdown(fetchedData, date) {
    const header = buildMarkdownHeader('cross-session-intelligence', date, 'high');
    const rawPatterns = Array.isArray(fetchedData['patterns']) ? fetchedData['patterns'] : [];
    const stabilityReport = computeCrossSessionCoalitionStability(rawPatterns);
    return (header +
        `# Cross-Session Coalition Intelligence

## Computed Stability Metrics (Script-Generated Context)
- **Overall Stability**: ${(stabilityReport.overallStability * 100).toFixed(1)}%
- **Forecast**: ${stabilityReport.forecast}
- **Patterns Analysed**: ${stabilityReport.patternCount}
- **Stable Groups**: ${stabilityReport.stableGroups.length > 0 ? stabilityReport.stableGroups.join(', ') : 'None identified from voting data'}
- **Declining Groups**: ${stabilityReport.decliningGroups.length > 0 ? stabilityReport.decliningGroups.join(', ') : 'None identified from voting data'}

## AI Agent Instructions

> **Instructions for AI Agent (Opus 4.6):** Read ALL methodology documents in analysis/methodologies/. Using the cross-session stability metrics above and the adopted texts/voting records from recent plenary sessions, produce a cross-session intelligence synthesis. Your analysis MUST:
>
> 1. **Compare coalition patterns** across the last 3-5 plenary sessions — are alliances strengthening or fragmenting?
> 2. **Identify session-over-session trends**: Which policy areas show increasing/decreasing consensus?
> 3. **Detect coalition realignment signals**: Are new voting blocs forming? Is the Grand Coalition showing stress?
> 4. **Institutional dynamics**: How are EP-Council-Commission dynamics evolving based on recent legislative outcomes?
> 5. **Predictive assessment**: Based on cross-session patterns, forecast likely coalition behavior for upcoming votes
> 6. **Confidence levels**: Rate each finding as HIGH / MEDIUM / LOW
>
> Cross-reference with adopted texts from the most recent plenary session to ground the analysis in specific legislative outcomes.
> When done, REMOVE this instructions section entirely and write analysis prose directly.

[TO BE FILLED BY AI AGENT — Cross-session trend analysis with specific plenary session references, coalition evolution assessment, and predictive indicators. Quality gate: minimum 400 words.]

## Date: ${date}
`);
}
/**
 * Build markdown for the synthesis-summary method.
 * Aggregates all per-file analyses into a synthesis summary.
 *
 * @param fetchedData - Raw fetched EP data (includes _dateOutputDir)
 * @param date - Analysis date
 * @returns Markdown content string
 */
export function buildSynthesisSummaryMarkdown(fetchedData, date) {
    const dateOutputDir = String(fetchedData['_dateOutputDir'] ?? '');
    if (!dateOutputDir) {
        const header = buildMarkdownHeader(METHOD_SYNTHESIS_SUMMARY_ID, date, 'low');
        return `${header}# 🧩 Synthesis Summary — ${date}\n\nNo output directory available for synthesis.\n`;
    }
    const summary = buildSynthesisSummary(dateOutputDir, date);
    return formatSynthesisMarkdown(summary);
}
/**
 * Build comprehensive analysis markdown for a single document.
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
    const docType = typeof item['type'] === 'string' ? item['type'] : category;
    const docDate = typeof item['date'] === 'string' ? item['date'] : date;
    const docStatus = typeof item['status'] === 'string' ? item['status'] : 'unknown';
    const docStage = typeof item['stage'] === 'string' ? item['stage'] : 'N/A';
    const docDescription = typeof item['description'] === 'string'
        ? item['description']
        : typeof item['summary'] === 'string'
            ? item['summary']
            : 'No description available';
    const docStrengths = [
        createScoredSWOTItem(`Document ${sanitizeDocumentId(docId)} available in ${category} feed`, 3, [`Document ID: ${docId}`, `Category: ${category}`, `Status: ${docStatus}`], 'medium', 'stable'),
    ];
    const docWeaknesses = [
        createScoredSWOTItem(`Document stage: ${docStage}, status: ${docStatus}`, 2, [`Current stage: ${docStage}`, `Type: ${docType}`, `Date: ${docDate}`], 'medium', 'stable'),
    ];
    const docOpportunities = [
        createScoredOpportunityOrThreat(`${category} document with ID ${sanitizeDocumentId(docId)}`, 'possible', 'moderate', [`Category: ${category}`, `Date: ${docDate}`], 'medium', 'stable'),
    ];
    const docThreats = [
        createScoredOpportunityOrThreat(`Document ${sanitizeDocumentId(docId)} — pipeline risk assessment`, 'possible', 'moderate', [`Stage: ${docStage}`, `Status: ${docStatus}`], 'medium', 'stable'),
    ];
    const docSwot = buildQuantitativeSWOT(`SWOT: ${title}`, docStrengths, docWeaknesses, docOpportunities, docThreats);
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

- **Threat Dimensions Evaluated**: ${threats.threatDimensions.length}
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
| Threat Dimensions | ${threats.threatDimensions.length} |
| Overall Threat Level | ${threats.overallThreatLevel} |

## Analysis Date: ${date}
`;
}
/**
 * Process a single feed item: deduplicate, write per-document files, and
 * collect the index entry.
 *
 * @param raw - Raw feed item
 * @param feedKey - Feed category key
 * @param date - Analysis date string
 * @param analyzedIds - Set of already-processed document IDs for deduplication
 * @param docDir - Output directory for per-document markdown
 * @param rawDataDir - Output directory for raw JSON data
 * @param significance - Precomputed global political significance
 * @param threats - Precomputed global threat assessment
 * @returns Document entry for the index, or undefined if skipped
 */
function processDocumentItem(raw, feedKey, date, analyzedIds, docDir, rawDataDir, significance, threats) {
    if (!raw || typeof raw !== 'object')
        return undefined;
    const item = raw;
    const docId = extractDocumentId(item);
    const dedupeKey = docId.toLowerCase().trim();
    if (analyzedIds.has(dedupeKey))
        return undefined;
    analyzedIds.add(dedupeKey);
    const title = extractDocumentTitle(item);
    const safeId = sanitizeDocumentId(docId);
    const filename = `${sanitizeDocumentId(feedKey)}-${safeId}-analysis.md`;
    if (docDir) {
        const docContent = buildSingleDocumentAnalysis(item, docId, title, feedKey, date, significance, threats);
        writeTextFile(path.join(docDir, filename), docContent);
        const rawJsonFilename = `${sanitizeDocumentId(feedKey)}-${safeId}-raw.json`;
        writeTextFile(path.join(rawDataDir, rawJsonFilename), JSON.stringify(item, null, 2));
    }
    return { category: feedKey, id: docId, title, filename };
}
/**
 * Build per-document intelligence analysis index and files.
 *
 * @param fetchedData - Raw fetched EP data
 * @param date - Analysis date
 * @returns Markdown index content string
 */
export function buildDocumentAnalysisMarkdown(fetchedData, date) {
    const header = buildMarkdownHeader(METHOD_DOCUMENT_ANALYSIS, date, 'medium');
    const dateOutputDir = fetchedData['_dateOutputDir'];
    const outputBase = typeof dateOutputDir === 'string' ? dateOutputDir : '';
    const docDir = outputBase ? path.join(outputBase, 'documents') : '';
    const rawDataDir = outputBase ? path.join(outputBase, 'documents', 'raw-data') : '';
    if (docDir)
        ensureDirectoryExists(docDir);
    if (rawDataDir)
        ensureDirectoryExists(rawDataDir);
    const globalInput = toClassificationInput(fetchedData);
    const globalSignificance = assessPoliticalSignificance(globalInput);
    const globalThreatInput = toThreatInput(fetchedData);
    const globalThreats = assessPoliticalThreats(globalThreatInput);
    const analyzedIds = new Set();
    const documentEntries = [];
    for (const feedKey of DOCUMENT_FEED_KEYS) {
        const items = safeArr(fetchedData, feedKey);
        for (const raw of items) {
            const entry = processDocumentItem(raw, feedKey, date, analyzedIds, docDir, rawDataDir, globalSignificance, globalThreats);
            if (entry)
                documentEntries.push(entry);
        }
    }
    Object.defineProperty(fetchedData, '_analyzedDocumentIds', {
        value: [...analyzedIds],
        writable: false,
        configurable: true,
        enumerable: false,
    });
    const tableRows = documentEntries.length > 0
        ? documentEntries
            .map((d) => `| ${sanitizeCell(d.id)} | ${sanitizeCell(d.title.slice(0, 60))} | ${sanitizeCell(d.category)} | [${d.filename}](${d.filename}) |`)
            .join('\n')
        : '| — | No documents available | — | — |';
    return (header +
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
4. **Threat Profiling** — Political threat landscape analysis for disruption potential
5. **Stakeholder Impact** — Projected effects on key stakeholder groups
6. **Intelligence Summary** — Key findings and actionable insights

## Document Storage

All ${documentEntries.length} documents have been stored in their entirety:
- **Analysis files**: \`documents/{category}-{id}-analysis.md\`
- **Raw JSON data**: \`documents/raw-data/{category}-{id}-raw.json\`
- **Deduplication**: Documents appearing in multiple feed categories are stored once with primary category reference

## Date: ${date}
`);
}
/** All existing analysis method builders keyed by their AnalysisMethod identifier */
export const EXISTING_BUILDERS = {
    'deep-analysis': buildDeepAnalysisMarkdown,
    'stakeholder-analysis': buildStakeholderAnalysisMarkdown,
    'coalition-analysis': buildCoalitionAnalysisMarkdown,
    'voting-patterns': buildVotingPatternsMarkdown,
    'cross-session-intelligence': buildCrossSessionIntelligenceMarkdown,
    [METHOD_SYNTHESIS_SUMMARY_ID]: buildSynthesisSummaryMarkdown,
    [METHOD_DOCUMENT_ANALYSIS]: buildDocumentAnalysisMarkdown,
};
//# sourceMappingURL=analysis-existing.js.map