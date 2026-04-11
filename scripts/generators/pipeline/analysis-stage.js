// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Pipeline/AnalysisStage
 * @description Lightweight analysis discovery module.
 *
 * Provides types, constants, and a discovery function for consuming analysis
 * `.md` files that were produced by AI agentic workflows.  The heavy
 * analysis-generation pipeline (classification, threat, risk, existing
 * builders) has been removed in favour of the superior AI-driven analysis
 * produced by agentic workflows.
 *
 * This module retains the same exported types ({@link AnalysisContext},
 * {@link AnalysisManifest}, etc.) so that downstream consumers
 * (`news-enhanced.ts`, article strategies) continue to work unchanged.
 */
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ensureDirectoryExists, resolveUniqueAnalysisDir, discoverAnalysisFileEntries, } from '../../utils/file-utils.js';
/**
 * Default set of analysis methods (all methods).
 */
export const ALL_ANALYSIS_METHODS = [
    'significance-classification',
    'significance-scoring',
    'impact-matrix',
    'actor-mapping',
    'forces-analysis',
    'political-threat-landscape',
    'actor-threat-profiling',
    'consequence-trees',
    'legislative-disruption',
    'risk-matrix',
    'political-capital-risk',
    'quantitative-swot',
    'legislative-velocity-risk',
    'agent-risk-workflow',
    'deep-analysis',
    'stakeholder-analysis',
    'coalition-analysis',
    'voting-patterns',
    'cross-session-intelligence',
    'synthesis-summary',
];
/**
 * Complete set of valid analysis method names that can appear in CLI
 * flags (e.g. `--analysis-methods`).
 */
export const VALID_ANALYSIS_METHODS = Array.from(new Set([...ALL_ANALYSIS_METHODS, 'document-analysis']));
// ─── Data checks ──────────────────────────────────────────────────────────────
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
 * Safely extract an array from fetchedData by key.
 *
 * @param data - Raw fetched data record
 * @param key - Key to extract
 * @returns Array or empty array if missing/invalid
 */
function safeArr(data, key) {
    const val = data[key]; // eslint-disable-line security/detect-object-injection
    return Array.isArray(val) ? val : [];
}
/**
 * Check whether the fetched data contains any substantive EP data.
 *
 * @param data - Raw fetched data record
 * @returns true if any substantive data is present
 */
export function hasSubstantiveData(data) {
    for (const key of SUBSTANTIVE_DATA_KEYS) {
        const arr = safeArr(data, key);
        if (arr.length > 0)
            return true;
    }
    return false;
}
// ─── Slug derivation ──────────────────────────────────────────────────────────
/**
 * Derive a filesystem-safe slug from an array of article types.
 *
 * @param articleTypes - One or more article category strings
 * @returns Sanitised, sorted, hyphen-joined slug
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
// ─── Analysis discovery ───────────────────────────────────────────────────────
/**
 * Discover existing analysis files produced by AI agentic workflows and
 * return an {@link AnalysisContext} compatible with downstream consumers.
 *
 * This replaces the former `runAnalysisStage` which generated analysis
 * from scratch.  The AI agentic workflows now produce higher-quality
 * analysis directly, so this function merely discovers what exists on disk.
 *
 * When analysis files exist, a minimal `manifest.json` is written to disk
 * (if one doesn't already exist) so downstream consumers that check for
 * the manifest continue to work.
 *
 * @param fetchedData - Raw EP data (used only for the requireData check)
 * @param options - Analysis stage configuration
 * @returns Analysis context with discovered methods
 */
export async function runAnalysisStage(fetchedData, options) {
    const { articleTypes, date, outputDir, articleTypeSlug, verbose = false, requireData = false, } = options;
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
        throw new Error(`Invalid analysis date "${date}": must match YYYY-MM-DD format`);
    }
    if (!hasSubstantiveData(fetchedData)) {
        if (requireData) {
            throw new Error('Analysis aborted: no substantive EP data available. ' +
                'MCP data fetch must succeed before analysis can run. ' +
                'Check MCP connection and feed data source.');
        }
        if (verbose) {
            console.warn('⚠️  [analysis] No substantive EP data — analysis will be data-sparse.');
        }
    }
    const startTime = new Date().toISOString();
    const runId = randomUUID();
    const preferredDir = articleTypeSlug
        ? path.resolve(outputDir, date, articleTypeSlug)
        : path.resolve(outputDir, date);
    const dateOutputDir = resolveUniqueAnalysisDir(preferredDir);
    if (verbose) {
        console.log(`🔬 [analysis] Discovering existing analysis (runId: ${runId})`);
        console.log(`   Date: ${date}`);
        if (articleTypeSlug)
            console.log(`   Article type: ${articleTypeSlug}`);
        console.log(`   Output: ${dateOutputDir}`);
    }
    ensureDirectoryExists(dateOutputDir);
    // Discover analysis .md files that already exist on disk
    const discoveredEntries = discoverAnalysisFileEntries(dateOutputDir);
    // Build method status entries from discovered files
    const methods = discoveredEntries.map((entry) => ({
        method: entry.method,
        status: 'completed',
        outputFile: entry.outputFile,
        confidence: 'medium',
        duration: 0,
        summary: `Discovered from AI-generated analysis: ${entry.outputFile}`,
    }));
    const completedMethods = methods.map((m) => m.method);
    const endTime = new Date().toISOString();
    const manifest = {
        runId,
        date,
        articleTypeSlug,
        startTime,
        endTime,
        articleTypes,
        methods,
        overallConfidence: methods.length > 0 ? 'medium' : 'low',
        dataSourcesUsed: ['ai-agentic-workflow', 'filesystem-discovery'],
    };
    // Write manifest.json if one doesn't already exist
    const manifestPath = path.join(dateOutputDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        try {
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        }
        catch {
            // Non-fatal: manifest is informational
        }
    }
    if (verbose) {
        console.log(`🔬 Analysis discovery complete: ${methods.length} files found`);
    }
    return {
        date,
        outputDir: dateOutputDir,
        completedMethods,
        results: new Map(methods.map((m) => [m.method, m])),
        manifest,
    };
}
//# sourceMappingURL=analysis-stage.js.map