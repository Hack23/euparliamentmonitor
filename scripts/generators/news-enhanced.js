#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/NewsEnhanced
 * @description CLI orchestrator for European Parliament news generation.
 *
 * Coordinates the four-stage pipeline (fetch → analysis → generate → output)
 * via dedicated pipeline-stage modules and a strategy registry.  Each article
 * type is handled by its own {@link ArticleStrategy} implementation.
 *
 * When the `--analysis` flag is supplied (all 9 agentic workflows do this),
 * the analysis stage runs **before** article generation, producing structured
 * political intelligence artifacts under `analysis/{date}/{article-type}/`.  These
 * artifacts are committed to the repository for review and improvement.
 *
 * Pipeline stages:
 * - {@link module:Generators/Pipeline/FetchStage}
 * - {@link module:Generators/Pipeline/AnalysisStage}  (political intelligence: classification, threat assessment, risk scoring)
 * - {@link module:Generators/Pipeline/GenerateStage}
 * - {@link module:Generators/Pipeline/OutputStage}
 *
 * Article strategies:
 * - {@link module:Generators/Strategies/WeekAheadStrategy}
 * - {@link module:Generators/Strategies/MonthAheadStrategy}
 * - {@link module:Generators/Strategies/BreakingNewsStrategy}
 * - {@link module:Generators/Strategies/CommitteeReportsStrategy}
 * - {@link module:Generators/Strategies/PropositionsStrategy}
 * - {@link module:Generators/Strategies/MotionsStrategy}
 * - {@link module:Generators/Strategies/WeeklyReviewStrategy}
 * - {@link module:Generators/Strategies/MonthlyReviewStrategy}
 *
 * Bounded-context content modules (re-exported for backward compatibility):
 * - {@link module:Generators/WeekAheadContent}
 * - {@link module:Generators/BreakingContent}
 * - {@link module:Generators/CommitteeHelpers}
 * - {@link module:Generators/MotionsContent}
 * - {@link module:Generators/PropositionsContent}
 */
import path, { resolve } from 'path';
import { pathToFileURL } from 'url';
import { NEWS_DIR, METADATA_DIR, VALID_ARTICLE_CATEGORIES, ARTICLE_TYPE_WEEK_AHEAD, ARG_SEPARATOR, } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_PRESETS, isSupportedLanguage } from '../constants/languages.js';
import { closeEPMCPClient } from '../mcp/ep-mcp-client.js';
import { ensureDirectoryExists } from '../utils/file-utils.js';
// ─── Pipeline-stage imports ───────────────────────────────────────────────────
import { initializeMCPClient, fetchEPFeedData } from './pipeline/fetch-stage.js';
import { createStrategyRegistry, generateArticleForStrategy } from './pipeline/generate-stage.js';
import { writeGenerationMetadata } from './pipeline/output-stage.js';
import { runAnalysisStage, ALL_ANALYSIS_METHODS, VALID_ANALYSIS_METHODS, hasSubstantiveData, deriveArticleTypeSlug, } from './pipeline/analysis-stage.js';
// ─── Content-module imports (bounded contexts) ───────────────────────────────
import { parsePlenarySessions, parseEPEvents, parseCommitteeMeetings, parseLegislativeDocuments, parseLegislativePipeline, parseParliamentaryQuestions, buildWeekAheadContent, buildKeywords, PLACEHOLDER_EVENTS, buildWhatToWatchSection, buildStakeholderImpactMatrix, computeWeekPoliticalTemperature, } from './week-ahead-content.js';
import { buildBreakingNewsContent, scoreBreakingNewsSignificance, SIGNIFICANCE_THRESHOLD, } from './breaking-content.js';
import { applyCommitteeInfo, applyDocuments, applyEffectiveness, FEATURED_COMMITTEES, } from './committee-helpers.js';
import { PLACEHOLDER_MARKER, getMotionsFallbackData, generateMotionsContent, buildPoliticalAlignmentSection, } from './motions-content.js';
import { buildPropositionsContent } from './propositions-content.js';
// ─── Re-exports for backward compatibility (tests import from this module) ───
export { parsePlenarySessions, parseEPEvents, parseCommitteeMeetings, parseLegislativeDocuments, parseLegislativePipeline, parseParliamentaryQuestions, buildWeekAheadContent, buildKeywords, PLACEHOLDER_EVENTS, buildWhatToWatchSection, buildStakeholderImpactMatrix, computeWeekPoliticalTemperature, };
export { buildBreakingNewsContent, scoreBreakingNewsSignificance, SIGNIFICANCE_THRESHOLD };
export { applyCommitteeInfo, applyDocuments, applyEffectiveness, FEATURED_COMMITTEES };
export { PLACEHOLDER_MARKER, getMotionsFallbackData, generateMotionsContent, buildPoliticalAlignmentSection, };
export { buildPropositionsContent };
// ─── CLI argument parsing ─────────────────────────────────────────────────────
const useMCP = process.env['USE_EP_MCP'] !== 'false';
const args = process.argv.slice(2);
const typesArg = args.find((arg) => arg.startsWith('--types='));
const languagesArg = args.find((arg) => arg.startsWith('--languages='));
const feedDataArg = args.find((arg) => arg.startsWith('--feed-data='));
const dryRunArg = args.includes('--dry-run');
const skipExistingArg = args.includes('--skip-existing');
const runAnalysisArg = args.includes('--analysis');
const analysisOnlyArg = args.includes('--analysis-only');
const analysisVerboseArg = args.includes('--analysis-verbose');
const analysisDirArg = args.find((arg) => arg.startsWith('--analysis-dir='));
const analysisMethodsArg = args.find((arg) => arg.startsWith('--analysis-methods='));
/** Path to a JSON file containing pre-fetched EP feed data (optional). */
const feedDataPath = feedDataArg?.startsWith('--feed-data=')
    ? feedDataArg.slice('--feed-data='.length).trim()
    : '';
const articleTypes = typesArg
    ? (typesArg.split(ARG_SEPARATOR)[1] ?? '').split(',').map((t) => t.trim())
    : [ARTICLE_TYPE_WEEK_AHEAD];
let languagesInput = languagesArg
    ? (languagesArg.split(ARG_SEPARATOR)[1] ?? '').trim().toLowerCase()
    : 'en';
// Expand presets
if (LANGUAGE_PRESETS[languagesInput]) {
    languagesInput = LANGUAGE_PRESETS[languagesInput].join(',');
}
const languages = languagesInput
    .split(',')
    .map((l) => l.trim())
    .filter((l) => isSupportedLanguage(l));
if (languages.length === 0) {
    console.error('❌ No valid language codes provided. Valid codes:', ALL_LANGUAGES.join(', '));
    process.exit(1);
}
// Validate article types
const invalidTypes = articleTypes.filter((t) => !VALID_ARTICLE_CATEGORIES.includes(t.trim()));
if (invalidTypes.length > 0) {
    console.warn(`⚠️ Unknown article types ignored: ${invalidTypes.join(', ')}`);
}
console.log('📰 Enhanced News Generation Script');
console.log('Article types:', articleTypes.join(', '));
console.log('Languages:', languages.join(', '));
console.log('Dry run:', dryRunArg ? 'Yes (no files written)' : 'No');
console.log('Skip existing:', skipExistingArg ? 'Yes' : 'No');
if (runAnalysisArg || analysisOnlyArg) {
    console.log('Analysis stage:', analysisOnlyArg ? 'Analysis only (no article generation)' : 'Enabled');
}
if (feedDataPath) {
    console.log('Feed data file:', feedDataPath);
}
// Ensure directories exist
ensureDirectoryExists(METADATA_DIR);
ensureDirectoryExists(NEWS_DIR);
// Generation statistics
const stats = {
    generated: 0,
    skipped: 0,
    dryRun: 0,
    errors: 0,
    articles: [],
    timestamp: new Date().toISOString(),
};
// ─── Main orchestration ───────────────────────────────────────────────────────
/**
 * Type guard that narrows a string to {@link AnalysisMethod}.
 *
 * Uses {@link Array.some} so no type assertion is needed — the predicate
 * compares each element directly to the candidate string.
 *
 * @param name - The string to validate
 * @returns `true` when `name` is a recognised analysis method
 */
function isValidAnalysisMethod(name) {
    return VALID_ANALYSIS_METHODS.some((m) => m === name);
}
/**
 * Parse the `--analysis-methods=` CLI flag into a validated, deduplicated list.
 * Warns on unrecognised method names and falls back to all methods when no valid
 * names remain.
 *
 * @returns Validated list of analysis methods
 */
function parseAnalysisMethods() {
    const raw = analysisMethodsArg?.split(ARG_SEPARATOR)[1]?.trim();
    if (!raw)
        return ALL_ANALYSIS_METHODS;
    const requestedNames = raw
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0);
    if (requestedNames.length === 0)
        return ALL_ANALYSIS_METHODS;
    const validMethods = new Set();
    const unknownMethods = [];
    for (const name of requestedNames) {
        if (isValidAnalysisMethod(name)) {
            validMethods.add(name);
        }
        else {
            unknownMethods.push(name);
        }
    }
    if (unknownMethods.length > 0) {
        console.warn(`⚠️ Unknown analysis methods ignored: ${unknownMethods.join(', ')}`);
    }
    const methods = Array.from(validMethods);
    if (methods.length === 0) {
        console.warn('⚠️ No valid analysis methods specified; defaulting to all analysis methods.');
        return ALL_ANALYSIS_METHODS;
    }
    return methods;
}
/**
 * Run the optional analysis stage (Fetch → Analysis) before article generation.
 *
 * This function is **side-effect-only**: it writes analysis markdown and a
 * `manifest.json` to disk under `analysis/{date}/{article-type}/`.  The returned
 * {@link AnalysisContext} is informational; strategies read analysis output
 * from disk rather than consuming the context object in-memory.  Analysis
 * artifacts are committed to the repository for review and political
 * intelligence improvement.
 *
 * The feed timeframe is derived from the requested article types: if any
 * month-level types (month-ahead, month-in-review, committee-reports, motions)
 * are present, the stage fetches 'one-month' of data; otherwise 'one-week'.
 *
 * **Note:** The analysis stage fetches EP feed data independently of the
 * generation stage.  Strategies also call `fetchEPFeedData()` during their own
 * `fetchData()`.  Sharing a single fetch result between analysis and generation
 * is a planned optimisation (tracked separately) to reduce MCP traffic.
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @param client - Connected MCP client or null
 * @returns Analysis context or null
 */
async function maybeRunAnalysis(date, client) {
    if (!runAnalysisArg && !analysisOnlyArg)
        return null;
    const rawAnalysisDirBase = analysisDirArg?.split(ARG_SEPARATOR)[1];
    const trimmedAnalysisDirBase = rawAnalysisDirBase?.trim();
    const analysisDirBase = trimmedAnalysisDirBase && trimmedAnalysisDirBase.length > 0
        ? trimmedAnalysisDirBase
        : 'analysis';
    const enabledMethods = parseAnalysisMethods();
    console.log('');
    console.log('🔬 Running analysis stage...');
    console.log(`   Output dir: ${analysisDirBase}/${date}`);
    console.log(`   Methods: ${enabledMethods.length} enabled`);
    console.log('');
    // Derive the feed timeframe from the requested article types so the analysis
    // window matches the generation window.  Month-level types need 'one-month'.
    const MONTH_LEVEL_TYPES = ['month-ahead', 'month-in-review', 'committee-reports', 'motions'];
    const normalizedArticleTypes = articleTypes.map((t) => t.trim());
    const needsMonthData = normalizedArticleTypes.some((t) => MONTH_LEVEL_TYPES.includes(t));
    const feedTimeframe = needsMonthData ? 'one-month' : 'one-week';
    // Fetch comprehensive EP feed data.  fetchEPFeedData handles a null client
    // gracefully (returns undefined) and also loads from EP_FEED_DATA_FILE when
    // set, so we call it unconditionally.
    //
    // Always initialise voting-derived keys (`patterns`, `votingRecords`) to
    // empty arrays so coalition/voting/cross-session analyses never receive
    // undefined.  These feeds are not yet exposed by fetchEPFeedData, so they
    // stay empty until a future MCP voting-records endpoint is available.
    const fetchedData = {
        date,
        patterns: [],
        votingRecords: [],
    };
    const feedData = await fetchEPFeedData(client, feedTimeframe);
    if (feedData) {
        fetchedData['events'] = feedData.events ?? [];
        fetchedData['documents'] = feedData.documents ?? [];
        fetchedData['adoptedTexts'] = feedData.adoptedTexts ?? [];
        fetchedData['procedures'] = feedData.procedures ?? [];
        fetchedData['mepUpdates'] = feedData.mepUpdates ?? [];
        fetchedData['plenaryDocuments'] = feedData.plenaryDocuments ?? [];
        fetchedData['committeeDocuments'] = feedData.committeeDocuments ?? [];
        fetchedData['plenarySessionDocuments'] = feedData.plenarySessionDocuments ?? [];
        fetchedData['externalDocuments'] = feedData.externalDocuments ?? [];
        fetchedData['questions'] = feedData.questions ?? [];
        fetchedData['declarations'] = feedData.declarations ?? [];
        fetchedData['corporateBodies'] = feedData.corporateBodies ?? [];
    }
    if (!fetchedData['events']) {
        // No MCP or feed-data file available — populate empty arrays so builders don't fail
        fetchedData['events'] = [];
        fetchedData['sessions'] = [];
        fetchedData['documents'] = [];
    }
    // Validate that substantive EP data was actually fetched.
    // Agentic workflows must not proceed with empty data — analysis on empty
    // data produces hollow output that should never feed article generation.
    if (!hasSubstantiveData(fetchedData)) {
        const msg = '❌ Analysis aborted: no substantive EP data was fetched. ' +
            'MCP data fetch must succeed before analysis can run. ' +
            'Check MCP connection, feed data file, or EP API availability.';
        throw new Error(msg);
    }
    const validArticleTypes = normalizedArticleTypes.filter((t) => VALID_ARTICLE_CATEGORIES.includes(t));
    // Derive a slug from the article types to scope analysis output per workflow,
    // preventing merge conflicts when multiple workflows run on the same date.
    const slug = deriveArticleTypeSlug(validArticleTypes);
    console.log(`   Article type slug: ${slug}`);
    // Pass requireData=true so runAnalysisStage enforces data availability
    // and aborts on any failed method — no hollow or partially failed analysis should exist.
    const ctx = await runAnalysisStage(fetchedData, {
        articleTypes: validArticleTypes,
        date,
        outputDir: analysisDirBase,
        articleTypeSlug: slug,
        enabledMethods,
        skipCompleted: true,
        verbose: analysisVerboseArg,
        requireData: true,
    });
    const totalMethods = ctx.manifest.methods.length;
    const completedCount = ctx.manifest.methods.filter((method) => method.status === 'completed').length;
    const skippedCount = ctx.manifest.methods.filter((method) => method.status === 'skipped').length;
    const failedMethods = ctx.manifest.methods.filter((method) => method.status === 'failed');
    const failedCount = failedMethods.length;
    console.log('');
    console.log(`🔬 Analysis complete: ${completedCount} completed, ${skippedCount} skipped, ${failedCount} failed (of ${totalMethods})`);
    console.log(`   Confidence: ${ctx.manifest.overallConfidence}`);
    console.log(`   Manifest: ${ctx.outputDir}/manifest.json`);
    console.log('');
    // Verify ALL analysis methods succeeded — article generation must never
    // proceed with incomplete analysis.  Any failures mean the agentic workflow
    // should fix issues rather than produce articles from partial analysis.
    if (failedCount > 0) {
        const failedNames = failedMethods.map((m) => m.method).join(', ');
        throw new Error(`Analysis incomplete: ${failedCount} of ${totalMethods} methods failed (${failedNames}). ` +
            'Article generation requires ALL analysis methods to succeed.');
    }
    if (ctx.completedMethods.length === 0) {
        throw new Error(`Analysis produced no completed methods (${failedCount} failed). ` +
            'Article generation requires successful analysis output.');
    }
    return ctx;
}
/**
 * Run the analysis stage and enforce agentic workflow pipeline guards.
 *
 * Wraps `maybeRunAnalysis()` with error handling that aborts the process
 * when analysis was requested but fails (data fetch or method execution).
 *
 * @param date - ISO date string
 * @param client - MCP client or null
 * @returns Analysis context or null (when analysis not requested)
 */
async function runAnalysisWithGuard(date, client) {
    let analysisCtx;
    try {
        analysisCtx = await maybeRunAnalysis(date, client);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ Analysis stage failed: ${message}`);
        console.error('🛑 Aborting: agentic workflow requires successful data fetch and analysis before article generation.');
        throw err instanceof Error ? err : new Error(message);
    }
    // Gate: when analysis was requested, verify it produced output before
    // proceeding to article generation.  Never produce articles without
    // completed analysis — this enforces the agentic workflow principle.
    if ((runAnalysisArg || analysisOnlyArg) && !analysisCtx) {
        const msg = '--analysis was requested but no analysis context was produced. ' +
            'Article generation requires completed analysis.';
        console.error(`🛑 Aborting: ${msg}`);
        throw new Error(msg);
    }
    return analysisCtx;
}
/**
 * Main execution: initialise the MCP client, optionally run analysis stage,
 * iterate over requested article types, delegate to the appropriate strategy,
 * then persist metadata.
 */
async function main() {
    console.log('');
    console.log('🚀 Starting news generation...');
    console.log('');
    // When --feed-data is provided, expose the path via env so strategies can
    // load pre-fetched data without requiring a live MCP connection.
    if (feedDataPath) {
        process.env['EP_FEED_DATA_FILE'] = feedDataPath;
        console.log(`📂 Pre-fetched feed data will be loaded from: ${feedDataPath}`);
    }
    const client = await initializeMCPClient(useMCP);
    // Determine today's date for the analysis stage
    // split('T')[0] on a valid ISO string always returns the date portion
    const isoToday = new Date().toISOString();
    const todayDate = isoToday.slice(0, 10);
    try {
        // Run analysis stage with pipeline enforcement guards
        await runAnalysisWithGuard(todayDate, client);
        // If --analysis-only, skip article generation
        if (analysisOnlyArg) {
            console.log('ℹ️  --analysis-only specified. Skipping article generation.');
            return;
        }
        const outputOptions = {
            dryRun: dryRunArg,
            skipExisting: skipExistingArg,
            newsDir: path.resolve(NEWS_DIR),
        };
        const registry = createStrategyRegistry();
        const results = [];
        for (const articleType of articleTypes) {
            if (!VALID_ARTICLE_CATEGORIES.includes(articleType)) {
                console.log(`⏭️ Skipping unknown article type: ${articleType}`);
                continue;
            }
            const strategy = registry.get(articleType);
            if (!strategy) {
                console.log(`⏭️ Article type "${articleType}" not yet implemented`);
                continue;
            }
            results.push(await generateArticleForStrategy(strategy, client, languages, outputOptions, stats));
        }
        console.log('');
        console.log('📊 Generation Summary:');
        console.log(`  ✅ Generated: ${stats.generated} articles`);
        console.log(`  ⏭️ Skipped: ${stats.skipped} articles`);
        if (dryRunArg)
            console.log(`  🔍 Dry run: ${stats.dryRun} articles`);
        console.log(`  ❌ Errors: ${stats.errors}`);
        console.log('');
        writeGenerationMetadata(stats, results, client !== null, METADATA_DIR, dryRunArg);
        process.exitCode = stats.errors > 0 ? 1 : 0;
    }
    finally {
        if (client) {
            console.log('🔌 Closing MCP client connection...');
            await closeEPMCPClient();
        }
    }
}
// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main().catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`💥 Fatal: ${message}`);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=news-enhanced.js.map