// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Pipeline/AnalysisStage
 * @description Analysis-first pre-generation pipeline stage — **orchestrator**.
 *
 * Executes between the Fetch and Generate stages, consuming already-fetched
 * European Parliament data and running the full suite of political intelligence
 * analysis methods.  Produces structured markdown analysis files that article
 * generation strategies then consume to produce higher-quality, deeply-analysed
 * news articles in all 14 languages.
 *
 * This stage is **side-effect-only**: it writes analysis markdown and a
 * `manifest.json` to disk under `analysis/{date}/{article-type}/`.  When
 * `articleTypeSlug` is provided (recommended for agentic workflows), each
 * article type writes to its own subdirectory, preventing merge conflicts
 * when multiple workflows run concurrently on the same date.
 *
 * Analysis methods are grouped into four categories (each in its own module):
 * - **Classification** (`analysis-classification.ts`): significance, impact-matrix, actor-mapping, forces
 * - **Threat Assessment** (`analysis-threats.ts`): political-threat-landscape, actor-threat, consequence-trees, disruption
 * - **Risk Scoring** (`analysis-risk.ts`): risk-matrix, capital-risk, quantitative-swot, velocity-risk, agent-workflow
 * - **Existing** (`analysis-existing.ts`): deep-analysis, stakeholder-analysis, coalition-analysis, voting-patterns, cross-session-intelligence
 *
 * Shared utilities live in `analysis-helpers.ts`.
 *
 * @example
 * ```ts
 * const ctx = await runAnalysisStage(fetchedData, {
 *   articleTypes: [ArticleCategory.WEEK_AHEAD],
 *   date: '2026-03-26',
 *   outputDir: 'analysis',
 * });
 * console.log(ctx.completedMethods);
 * ```
 */
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ensureDirectoryExists, resolveUniqueAnalysisDir } from '../../utils/file-utils.js';
// ─── Re-export shared helpers used by downstream consumers ────────────────────
import { hasSubstantiveData, sanitizeDocumentId, writeTextFile } from './analysis-helpers.js';
export { hasSubstantiveData } from './analysis-helpers.js';
// ─── Import category-specific builders ────────────────────────────────────────
import { CLASSIFICATION_BUILDERS, METHOD_SIGNIFICANCE_SCORING_ID, } from './analysis-classification.js';
import { THREAT_BUILDERS } from './analysis-threats.js';
import { RISK_BUILDERS } from './analysis-risk.js';
import { EXISTING_BUILDERS, METHOD_SYNTHESIS_SUMMARY_ID, METHOD_DOCUMENT_ANALYSIS, } from './analysis-existing.js';
/** All analysis methods in default execution order */
export const ALL_ANALYSIS_METHODS = [
    // Classification
    'significance-classification',
    'impact-matrix',
    'actor-mapping',
    'forces-analysis',
    // Threat Assessment
    'political-threat-landscape',
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
    // Publication scoring & synthesis
    'significance-scoring',
    'synthesis-summary',
    // NOTE: 'document-analysis' is intentionally excluded from the default set.
    // It writes one markdown + one JSON file per feed item and can significantly
    // increase runtime and repository output size.  Callers must opt-in by
    // explicitly listing it in `enabledMethods`.
];
/**
 * All valid analysis method names, including opt-in methods like
 * `document-analysis`.  Use this for **validation** of user-supplied method
 * names (e.g. the `--analysis-methods` CLI flag).  For the default execution
 * set, use {@link ALL_ANALYSIS_METHODS} instead.
 */
export const VALID_ANALYSIS_METHODS = Array.from(new Set([...ALL_ANALYSIS_METHODS, 'document-analysis']));
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
    if (counts.high >= counts.medium && counts.high >= counts.low)
        return 'high';
    if (counts.medium >= counts.low)
        return 'medium';
    return 'low';
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
    }
    catch {
        return false;
    }
}
/**
 * Check whether a legacy-named output exists for a method.
 *
 * @param method - The analysis method to check
 * @param dateOutputDir - Absolute path to the date-scoped output directory
 * @param subdir - The method's subdirectory
 * @returns The legacy filename that matched, or `undefined`
 */
function findLegacyOutput(method, dateOutputDir, subdir) {
    const legacyNames = LEGACY_FILENAMES[method];
    if (!legacyNames)
        return undefined;
    for (const legacy of legacyNames) {
        if (methodOutputExists(path.join(dateOutputDir, subdir, legacy))) {
            return legacy;
        }
    }
    return undefined;
}
/**
 * Attempt to migrate a legacy-named output file to its canonical path.
 *
 * @param legacyAbsolutePath - Absolute path to the existing legacy file
 * @param canonicalAbsolutePath - Absolute path to the target canonical file
 * @returns `true` if migration succeeded, `false` otherwise
 */
function migrateLegacyFile(legacyAbsolutePath, canonicalAbsolutePath) {
    try {
        fs.renameSync(legacyAbsolutePath, canonicalAbsolutePath);
        return true;
    }
    catch {
        try {
            fs.copyFileSync(legacyAbsolutePath, canonicalAbsolutePath);
            fs.unlinkSync(legacyAbsolutePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
/**
 * Check whether a method's output already exists (canonical or legacy) and
 * return a skip status if so.
 *
 * @param method - The analysis method to check
 * @param dateOutputDir - Absolute path to the date-scoped output directory
 * @param subdir - The method's subdirectory
 * @param filename - The canonical output filename
 * @param absolutePath - Absolute path to the canonical output file
 * @param relativeOutputFile - Portable relative output path for manifests
 * @param confidence - Default confidence level for the method
 * @param verbose - Whether to print verbose progress
 * @returns A skip status record, or `undefined` to proceed with execution.
 */
function checkSkipCompleted(method, dateOutputDir, subdir, filename, absolutePath, relativeOutputFile, confidence, verbose) {
    if (methodOutputExists(absolutePath)) {
        if (verbose)
            console.log(`  ⏭️  [analysis] Skipping already-completed method: ${method}`);
        return {
            method,
            status: 'skipped',
            outputFile: relativeOutputFile,
            confidence,
            duration: 0,
            summary: `Skipped — output already exists at ${relativeOutputFile}`,
        };
    }
    const legacyHit = findLegacyOutput(method, dateOutputDir, subdir);
    if (!legacyHit)
        return undefined;
    const legacyAbsolutePath = path.join(dateOutputDir, subdir, legacyHit);
    const migrated = migrateLegacyFile(legacyAbsolutePath, absolutePath);
    if (migrated || methodOutputExists(absolutePath)) {
        if (verbose) {
            const action = migrated ? 'Migrated legacy output and skipped' : 'Skipping';
            console.log(`  ⏭️  [analysis] ${action} ${method} — output at ${relativeOutputFile}`);
        }
        return {
            method,
            status: 'skipped',
            outputFile: relativeOutputFile,
            confidence,
            duration: 0,
            summary: migrated
                ? `Skipped — migrated legacy ${legacyHit} → ${filename}`
                : `Skipped — output already exists at ${relativeOutputFile}`,
        };
    }
    if (verbose) {
        console.log(`  ↻ [analysis] Legacy output found for ${method} but migration failed: ${legacyHit}. Regenerating canonical output ${relativeOutputFile}`);
    }
    return undefined;
}
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
/**
 * Canonical subdirectory for each analysis method group.
 *
 * Exported so that agentic workflows and downstream consumers can
 * construct paths that are guaranteed to match the pipeline output.
 */
export const ANALYSIS_METHOD_SUBDIRS = Object.freeze({
    'significance-classification': SUBDIR_CLASSIFICATION,
    'impact-matrix': SUBDIR_CLASSIFICATION,
    'actor-mapping': SUBDIR_CLASSIFICATION,
    'forces-analysis': SUBDIR_CLASSIFICATION,
    'political-threat-landscape': SUBDIR_THREAT_ASSESSMENT,
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
    [METHOD_SIGNIFICANCE_SCORING_ID]: SUBDIR_CLASSIFICATION,
    [METHOD_SYNTHESIS_SUMMARY_ID]: SUBDIR_EXISTING,
    'document-analysis': SUBDIR_DOCUMENTS,
});
/**
 * Canonical filename for each analysis method.
 *
 * Exported so that agentic workflows and downstream consumers can
 * reference the exact file names the pipeline produces.
 */
export const ANALYSIS_METHOD_FILENAMES = Object.freeze({
    'significance-classification': 'significance-classification.md',
    'impact-matrix': 'impact-matrix.md',
    'actor-mapping': 'actor-mapping.md',
    'forces-analysis': 'forces-analysis.md',
    'political-threat-landscape': 'political-threat-landscape.md',
    'actor-threat-profiling': 'actor-threat-profiling.md',
    'consequence-trees': 'consequence-trees.md',
    'legislative-disruption': 'legislative-disruption.md',
    'risk-matrix': 'risk-matrix.md',
    'political-capital-risk': 'political-capital-risk.md',
    'quantitative-swot': 'quantitative-swot.md',
    'legislative-velocity-risk': 'legislative-velocity-risk.md',
    'agent-risk-workflow': 'agent-risk-workflow.md',
    'deep-analysis': 'deep-analysis.md',
    'stakeholder-analysis': 'stakeholder-impact.md',
    'coalition-analysis': 'coalition-dynamics.md',
    'voting-patterns': 'voting-patterns.md',
    'cross-session-intelligence': 'cross-session-intelligence.md',
    [METHOD_SIGNIFICANCE_SCORING_ID]: 'significance-scoring.md',
    [METHOD_SYNTHESIS_SUMMARY_ID]: 'synthesis-summary.md',
    'document-analysis': 'document-analysis-index.md',
});
/**
 * Legacy filenames that were renamed during the canonical normalization.
 *
 * Used by {@link runSingleMethod} so that `skipCompleted` recognises
 * previously-generated outputs that still exist under their old names.
 */
const LEGACY_FILENAMES = Object.freeze({
    'significance-classification': Object.freeze(['significance-assessment.md']),
    'stakeholder-analysis': Object.freeze(['stakeholder-analysis.md']),
    'coalition-analysis': Object.freeze(['coalition-analysis.md']),
    'actor-threat-profiling': Object.freeze(['actor-threat-profiles.md']),
});
// ─── Assembled method builders ────────────────────────────────────────────────
/** Map from AnalysisMethod to its markdown builder function */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- assembled from sub-module builders indexed by string
const METHOD_BUILDERS = {
    ...CLASSIFICATION_BUILDERS,
    ...THREAT_BUILDERS,
    ...RISK_BUILDERS,
    ...EXISTING_BUILDERS,
};
/** Default confidence level for each analysis method group */
const METHOD_DEFAULT_CONFIDENCE = {
    'significance-classification': 'medium',
    'impact-matrix': 'medium',
    'actor-mapping': 'medium',
    'forces-analysis': 'medium',
    'political-threat-landscape': 'medium',
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
    [METHOD_SIGNIFICANCE_SCORING_ID]: 'medium',
    [METHOD_SYNTHESIS_SUMMARY_ID]: 'medium',
    'document-analysis': 'medium',
};
// ─── MCP data persistence ─────────────────────────────────────────────────────
/** Subdirectory name for raw MCP data storage */
const SUBDIR_DATA = 'data';
/**
 * MCP data category → filesystem subdirectory mapping.
 */
const DATA_CATEGORY_DIRS = {
    events: 'events',
    procedures: 'procedures',
    adoptedTexts: 'adopted-texts',
    documents: 'documents',
    mepUpdates: 'meps',
    plenaryDocuments: 'plenary-documents',
    committeeDocuments: 'committee-documents',
    plenarySessionDocuments: 'plenary-session-documents',
    externalDocuments: 'external-documents',
    questions: 'questions',
    declarations: 'declarations',
    corporateBodies: 'corporate-bodies',
    votingRecords: 'votes',
    speeches: 'speeches',
    worldBankIndicators: 'world-bank',
    politicalLandscape: 'osint',
    votingAnomalies: 'osint',
    coalitionDynamics: 'osint',
    countryDelegations: 'osint',
    mepInfluence: 'osint',
    mcpResponses: 'mcp-responses',
};
/**
 * Extract a stable identifier from an MCP data item for consistent filenames.
 *
 * @param item - Single EP data item
 * @param index - Fallback index when no ID field is found
 * @returns Filesystem-safe identifier string
 */
function extractItemId(item, index) {
    if (typeof item !== 'object' || item === null)
        return `item-${String(index).padStart(4, '0')}`;
    const obj = item;
    const idFields = [
        'eventId',
        'procedureId',
        'docId',
        'documentId',
        'mepId',
        'id',
        'speechId',
        'questionId',
        'processId',
        'identifier',
        'alertNumber',
    ];
    for (const field of idFields) {
        const value = obj[field];
        if (typeof value === 'string' && value.length > 0)
            return sanitizeDocumentId(value);
        if (typeof value === 'number')
            return sanitizeDocumentId(String(value));
    }
    return `item-${String(index).padStart(4, '0')}`;
}
/**
 * Persist a singleton OSINT data category to a file.
 *
 * @param data - The singleton data object to persist
 * @param category - The fetchedData key name
 * @param dataBaseDir - Base directory for data persistence
 * @param subdir - Target subdirectory
 * @returns 1 if written, 0 if skipped
 */
function persistSingletonData(data, category, dataBaseDir, subdir) {
    if (data === null || data === undefined)
        return 0;
    const categoryDir = path.join(dataBaseDir, subdir);
    ensureDirectoryExists(categoryDir);
    const slug = category.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    writeTextFile(path.join(categoryDir, `${slug}.json`), JSON.stringify(data, null, 2));
    return 1;
}
/**
 * Persist MCP tool responses to individual files.
 *
 * @param data - Object keyed by MCP tool name
 * @param dataBaseDir - Base directory for data persistence
 * @param subdir - Target subdirectory
 * @returns Number of items written
 */
function persistMCPResponses(data, dataBaseDir, subdir) {
    if (data === null || data === undefined || typeof data !== 'object')
        return 0;
    const categoryDir = path.join(dataBaseDir, subdir);
    ensureDirectoryExists(categoryDir);
    let count = 0;
    const responses = data;
    for (const [toolName, response] of Object.entries(responses)) {
        if (response === null || response === undefined)
            continue;
        const safeName = sanitizeDocumentId(toolName);
        writeTextFile(path.join(categoryDir, `${safeName}.json`), JSON.stringify(response, null, 2));
        count++;
    }
    return count;
}
/**
 * Persist raw MCP-fetched data to structured subdirectories.
 *
 * @param fetchedData - Raw EP data keyed by data category
 * @param dateOutputDir - Absolute path to the date-scoped output directory
 * @param verbose - Emit progress messages
 */
function persistMCPData(fetchedData, dateOutputDir, verbose) {
    const dataBaseDir = path.join(dateOutputDir, SUBDIR_DATA);
    let totalItems = 0;
    const OSINT_SINGLETON_CATEGORIES = new Set([
        'politicalLandscape',
        'votingAnomalies',
        'coalitionDynamics',
        'countryDelegations',
        'mepInfluence',
    ]);
    for (const [category, subdir] of Object.entries(DATA_CATEGORY_DIRS)) {
        const items = fetchedData[category];
        if (OSINT_SINGLETON_CATEGORIES.has(category)) {
            totalItems += persistSingletonData(items, category, dataBaseDir, subdir);
            continue;
        }
        if (category === 'mcpResponses') {
            totalItems += persistMCPResponses(items, dataBaseDir, subdir);
            continue;
        }
        if (!Array.isArray(items) || items.length === 0)
            continue;
        const categoryDir = path.join(dataBaseDir, subdir);
        ensureDirectoryExists(categoryDir);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemId = extractItemId(item, i);
            const filename = `${itemId}.json`;
            writeTextFile(path.join(categoryDir, filename), JSON.stringify(item, null, 2));
            totalItems++;
        }
    }
    if (verbose && totalItems > 0) {
        console.log(`   📂 [analysis] Persisted ${totalItems} MCP data items to ${dataBaseDir}`);
    }
}
// ─── Core runner ──────────────────────────────────────────────────────────────
/**
 * Run a single analysis method and return its status record.
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
    const subdir = ANALYSIS_METHOD_SUBDIRS[method];
    const filename = ANALYSIS_METHOD_FILENAMES[method];
    const absolutePath = path.join(dateOutputDir, subdir, filename);
    const relativeOutputFile = path.posix.join(subdir, filename);
    const confidence = METHOD_DEFAULT_CONFIDENCE[method];
    if (skipCompleted) {
        const skipResult = checkSkipCompleted(method, dateOutputDir, subdir, filename, absolutePath, relativeOutputFile, confidence, verbose);
        if (skipResult)
            return skipResult;
    }
    const start = Date.now();
    try {
        const builder = METHOD_BUILDERS[method];
        // Inject dateOutputDir for the document-analysis builder to write per-document files
        // and for the synthesis-summary builder to read existing analysis outputs
        if (method === METHOD_DOCUMENT_ANALYSIS || method === METHOD_SYNTHESIS_SUMMARY_ID) {
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
    }
    catch (err) {
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
 * Derive a filesystem-safe slug from a list of article types.
 *
 * @param articleTypes - One or more article category identifiers
 * @returns Filesystem-safe slug (lowercase, alphanumeric + hyphens only)
 *
 * @example
 * ```ts
 * deriveArticleTypeSlug(['week-ahead']);       // 'week-ahead'
 * deriveArticleTypeSlug(['breaking']);          // 'breaking'
 * deriveArticleTypeSlug(['motions', 'month-ahead']); // 'month-ahead-motions'
 * ```
 */
export function deriveArticleTypeSlug(articleTypes) {
    if (articleTypes.length === 0)
        return 'default';
    const raw = [...articleTypes]
        .map((t) => t.trim().toLowerCase())
        .sort()
        .join('-');
    const sanitised = raw.replace(/[^a-z0-9-]+/gu, '-').replace(/-{2,}/gu, '-');
    const trimmed = sanitised.replace(/^-/u, '').replace(/-$/u, '');
    return trimmed.length > 0 ? trimmed : 'default';
}
/**
 * Run the full analysis pipeline stage.
 *
 * Executes all enabled analysis methods sequentially, writing markdown files
 * and a `manifest.json` summary.
 *
 * @param fetchedData - Raw EP data fetched by the fetch stage
 * @param options - Analysis stage configuration
 * @returns Analysis context object for consumption by the generate stage
 */
export async function runAnalysisStage(fetchedData, options) {
    const { articleTypes, date, outputDir, articleTypeSlug, enabledMethods = ALL_ANALYSIS_METHODS, skipCompleted = true, verbose = false, requireData = false, } = options;
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
        throw new Error(`Invalid analysis date "${date}": must match YYYY-MM-DD format`);
    }
    const deduplicatedMethods = [...new Set(enabledMethods)];
    if (!hasSubstantiveData(fetchedData)) {
        if (requireData) {
            throw new Error('Analysis aborted: no substantive EP data available. ' +
                'MCP data fetch must succeed before analysis can run. ' +
                'Check MCP connection and feed data source.');
        }
        console.warn('⚠️  [analysis] No substantive EP data in fetchedData — analysis output will be data-sparse. ' +
            'Ensure MCP connection succeeded and feed data was fetched before running analysis.');
    }
    const startTime = new Date().toISOString();
    const runId = randomUUID();
    const preferredDir = articleTypeSlug
        ? path.resolve(outputDir, date, articleTypeSlug)
        : path.resolve(outputDir, date);
    const dateOutputDir = resolveUniqueAnalysisDir(preferredDir);
    if (verbose) {
        console.log(`🔬 [analysis] Starting analysis stage (runId: ${runId})`);
        console.log(`   Date: ${date}`);
        if (articleTypeSlug)
            console.log(`   Article type: ${articleTypeSlug}`);
        console.log(`   Methods: ${deduplicatedMethods.length}`);
        console.log(`   Output: ${dateOutputDir}`);
    }
    ensureDirectoryExists(dateOutputDir);
    persistMCPData(fetchedData, dateOutputDir, verbose);
    const methodResults = [];
    for (const method of deduplicatedMethods) {
        const result = runSingleMethod(method, fetchedData, date, dateOutputDir, skipCompleted, verbose);
        methodResults.push(result);
    }
    const failedMethods = methodResults.filter((r) => r.status === 'failed');
    if (requireData && failedMethods.length > 0) {
        const failedNames = failedMethods.map((r) => r.method).join(', ');
        throw new Error(`Analysis aborted: ${failedMethods.length} of ${methodResults.length} methods failed (${failedNames}). ` +
            'Agentic workflow requires ALL analysis methods to succeed. ' +
            'Fix data fetch or method errors before retrying.');
    }
    const endTime = new Date().toISOString();
    const overallConfidence = aggregateConfidence(methodResults);
    const dataSourcesUsed = Object.keys(fetchedData).filter((k) => Array.isArray(fetchedData[k]) && fetchedData[k].length > 0);
    const analyzedDocIds = Array.isArray(fetchedData['_analyzedDocumentIds'])
        ? fetchedData['_analyzedDocumentIds']
        : [];
    const manifest = {
        runId,
        date,
        articleTypeSlug,
        startTime,
        endTime,
        articleTypes: [...articleTypes],
        methods: methodResults,
        overallConfidence,
        dataSourcesUsed,
        documentsAnalyzed: analyzedDocIds.length,
        analyzedDocumentIds: analyzedDocIds,
    };
    const manifestPath = path.join(dateOutputDir, 'manifest.json');
    writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));
    if (verbose) {
        const completed = methodResults.filter((r) => r.status === 'completed').length;
        const skipped = methodResults.filter((r) => r.status === 'skipped').length;
        const failed = methodResults.filter((r) => r.status === 'failed').length;
        console.log(`🔬 [analysis] Stage complete: ${completed} completed, ${skipped} skipped, ${failed} failed`);
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