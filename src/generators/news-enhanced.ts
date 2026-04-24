#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsEnhanced
 * @description CLI orchestrator for European Parliament news generation.
 *
 * Coordinates the four-stage pipeline (fetch → analysis discovery → generate → output)
 * via dedicated pipeline-stage modules and a strategy registry.  Each article
 * type is handled by its own {@link ArticleStrategy} implementation.
 *
 * When the `--analysis` flag is supplied (all 9 agentic workflows do this),
 * the analysis discovery stage runs **before** article generation, discovering
 * AI-generated analysis `.md` files under `analysis/daily/{date}/{article-type}/`.
 * The AI agentic workflows produce all analysis content directly — the TypeScript
 * pipeline only discovers and links to these artifacts.  Analysis artifacts are
 * committed to the repository for review and improvement.
 *
 * Pipeline stages:
 * - {@link module:Generators/Pipeline/FetchStage}
 * - {@link module:Generators/Pipeline/AnalysisStage}  (discovers AI-generated analysis artifacts)
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
import {
  NEWS_DIR,
  METADATA_DIR,
  VALID_ARTICLE_CATEGORIES,
  ARTICLE_TYPE_WEEK_AHEAD,
  ARG_SEPARATOR,
} from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_PRESETS, isSupportedLanguage } from '../constants/languages.js';
import { closeEPMCPClient } from '../mcp/ep-mcp-client.js';
import type { EuropeanParliamentMCPClient } from '../mcp/ep-mcp-client.js';
import { ensureDirectoryExists, type AnalysisManifestHistoryEntry } from '../utils/file-utils.js';
import type {
  LanguageCode,
  LanguagePreset,
  GenerationStats,
  GenerationResult,
} from '../types/index.js';
import type { ArticleCategory } from '../types/index.js';

// ─── Pipeline-stage imports ───────────────────────────────────────────────────

import { initializeMCPClient, fetchEPFeedData } from './pipeline/fetch-stage.js';
import {
  createStrategyRegistry,
  generateArticleForStrategy,
  setAIMetadata,
} from './pipeline/generate-stage.js';
import { writeGenerationMetadata } from './pipeline/output-stage.js';
import type { OutputOptions } from './pipeline/output-stage.js';
import {
  runAnalysisStage,
  ALL_ANALYSIS_METHODS,
  VALID_ANALYSIS_METHODS,
  hasSubstantiveData,
  deriveArticleTypeSlug,
  isResolvedAnalysisDir,
} from './pipeline/analysis-stage.js';
import type { AnalysisMethod, AnalysisContext } from './pipeline/analysis-stage.js';
import type { AnalysisFileEntry } from '../types/index.js';
import { discoverAnalysisFileEntries } from '../utils/file-utils.js';

// ─── Content-module imports (bounded contexts) ───────────────────────────────

import {
  parsePlenarySessions,
  parseEPEvents,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  parseParliamentaryQuestions,
  buildWeekAheadContent,
  buildKeywords,
  PLACEHOLDER_EVENTS,
  buildWhatToWatchSection,
  buildStakeholderImpactMatrix,
  computeWeekPoliticalTemperature,
} from './week-ahead-content.js';

import {
  buildBreakingNewsContent,
  scoreBreakingNewsSignificance,
  SIGNIFICANCE_THRESHOLD,
} from './breaking-content.js';

import {
  applyCommitteeInfo,
  applyDocuments,
  applyEffectiveness,
  FEATURED_COMMITTEES,
} from './committee-helpers.js';

import {
  PLACEHOLDER_MARKER,
  getMotionsFallbackData,
  generateMotionsContent,
  buildPoliticalAlignmentSection,
} from './motions-content.js';

import { buildPropositionsContent } from './propositions-content.js';
import type { PipelineData } from './propositions-content.js';

// ─── Re-exports for backward compatibility (tests import from this module) ───

export {
  parsePlenarySessions,
  parseEPEvents,
  parseCommitteeMeetings,
  parseLegislativeDocuments,
  parseLegislativePipeline,
  parseParliamentaryQuestions,
  buildWeekAheadContent,
  buildKeywords,
  PLACEHOLDER_EVENTS,
  buildWhatToWatchSection,
  buildStakeholderImpactMatrix,
  computeWeekPoliticalTemperature,
};
export { buildBreakingNewsContent, scoreBreakingNewsSignificance, SIGNIFICANCE_THRESHOLD };
export { applyCommitteeInfo, applyDocuments, applyEffectiveness, FEATURED_COMMITTEES };
export {
  PLACEHOLDER_MARKER,
  getMotionsFallbackData,
  generateMotionsContent,
  buildPoliticalAlignmentSection,
};
export { buildPropositionsContent };
export type { PipelineData };

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
const runIdArg = args.find((arg) => arg.startsWith('--run-id='));
const gateResultArg = args.find((arg) => arg.startsWith('--gate-result='));
const titleArg = args.find((arg) => arg.startsWith('--title='));
const descriptionArg = args.find((arg) => arg.startsWith('--description='));

/**
 * Workflow run identifier (typically `GITHUB_RUN_NUMBER`) used to create
 * a unique analysis directory per workflow execution.  This prevents
 * multiple runs on the same date from overwriting each other's analysis
 * artifacts and ensures article transparency links point to the exact
 * analysis used for that specific article generation run.
 *
 * Falls back to `GITHUB_RUN_NUMBER` env var, then empty string (no suffix).
 * Sanitised to alphanumeric and hyphens only (supports both numeric run
 * numbers and custom identifiers passed via `--run-id`).
 */
export const runId: string = (
  runIdArg?.slice('--run-id='.length).trim() ||
  process.env['GITHUB_RUN_NUMBER'] ||
  ''
).replace(/[^a-z0-9-]/giu, '');

/**
 * Explicit Stage-C gate result passed by the agentic workflow via
 * `--gate-result=<value>`. When provided, it is forwarded to
 * `runAnalysisStage` as the `gateResult` option so the discovery history
 * entry records the correct result instead of the default `PENDING`.
 *
 * Valid values: `GREEN` | `GREEN_WITH_WARNINGS` | `ANALYSIS_ONLY` | `PENDING`.
 * Unrecognised values are silently treated as absent (falls back to
 * carry-forward logic in `runAnalysisStage`).
 */
const VALID_GATE_RESULTS: ReadonlyArray<AnalysisManifestHistoryEntry['gateResult']> = [
  'GREEN',
  'GREEN_WITH_WARNINGS',
  'ANALYSIS_ONLY',
  'PENDING',
];
const rawGateResult = gateResultArg?.slice('--gate-result='.length)?.trim()?.toUpperCase();
export const cliGateResult: AnalysisManifestHistoryEntry['gateResult'] | undefined =
  rawGateResult !== undefined &&
  VALID_GATE_RESULTS.includes(rawGateResult as AnalysisManifestHistoryEntry['gateResult'])
    ? (rawGateResult as AnalysisManifestHistoryEntry['gateResult'])
    : undefined;

/**
 * AI-generated article title passed by the agentic workflow.
 * When provided, this OVERRIDES any script-generated title.
 * The AI agent must analyse the content and produce this.
 */
export const aiTitle: string = titleArg ? titleArg.slice('--title='.length).trim() : '';

/**
 * AI-generated article description/subtitle passed by the agentic workflow.
 * When provided, this OVERRIDES any script-generated description.
 * The AI agent must analyse the content and produce this.
 */
export const aiDescription: string = descriptionArg
  ? descriptionArg.slice('--description='.length).trim()
  : '';

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
const presetLanguages = LANGUAGE_PRESETS[languagesInput as LanguagePreset];
if (presetLanguages) {
  languagesInput = presetLanguages.join(',');
}

const languages: LanguageCode[] = languagesInput
  .split(',')
  .map((l) => l.trim())
  .filter((l): l is LanguageCode => isSupportedLanguage(l));

if (languages.length === 0) {
  console.error('❌ No valid language codes provided. Valid codes:', ALL_LANGUAGES.join(', '));
  process.exit(1);
}

// Validate article types
const invalidTypes = articleTypes.filter(
  (t) => !VALID_ARTICLE_CATEGORIES.includes(t.trim() as ArticleCategory)
);
if (invalidTypes.length > 0) {
  console.warn(`⚠️ Unknown article types ignored: ${invalidTypes.join(', ')}`);
}

console.log('📰 Enhanced News Generation Script');
console.log('Article types:', articleTypes.join(', '));
console.log('Languages:', languages.join(', '));
console.log('Dry run:', dryRunArg ? 'Yes (no files written)' : 'No');
console.log('Skip existing:', skipExistingArg ? 'Yes' : 'No');
if (runAnalysisArg || analysisOnlyArg) {
  console.log(
    'Analysis stage:',
    analysisOnlyArg ? 'Analysis only (no article generation)' : 'Enabled'
  );
}
if (feedDataPath) {
  console.log('Feed data file:', feedDataPath);
}

// Ensure directories exist
ensureDirectoryExists(METADATA_DIR);
ensureDirectoryExists(NEWS_DIR);

// Generation statistics
const stats: GenerationStats = {
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
function isValidAnalysisMethod(name: string): name is AnalysisMethod {
  return VALID_ANALYSIS_METHODS.some((m) => m === name);
}

/**
 * Parse the `--analysis-methods=` CLI flag into a validated, deduplicated list.
 * Warns on unrecognised method names and falls back to all methods when no valid
 * names remain.
 *
 * @returns Validated list of analysis methods
 */
function parseAnalysisMethods(): readonly AnalysisMethod[] {
  const raw = analysisMethodsArg?.split(ARG_SEPARATOR)[1]?.trim();
  if (!raw) return ALL_ANALYSIS_METHODS;

  const requestedNames = raw
    .split(',')
    .map((m) => m.trim())
    .filter((m) => m.length > 0);

  if (requestedNames.length === 0) return ALL_ANALYSIS_METHODS;

  const validMethods = new Set<AnalysisMethod>();
  const unknownMethods: string[] = [];

  for (const name of requestedNames) {
    if (isValidAnalysisMethod(name)) {
      validMethods.add(name);
    } else {
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
 * Fetch EP feed data (month-level timeframe for month-level article types,
 * one-week otherwise), populate `fetchedData` with the result, and enforce
 * the "substantive data required" check.
 *
 * Extracted from {@link maybeRunAnalysis} to keep that function's cognitive
 * complexity under the repo's SonarJS limit. Mutates `fetchedData` in place
 * and throws when no substantive EP data is available.
 *
 * @param fetchedData - Target record to populate (mutated)
 * @param client - Connected MCP client or null
 * @param articleTypes - Requested article types (drives timeframe selection)
 */
async function fetchAndValidateEPData(
  fetchedData: Record<string, unknown>,
  client: EuropeanParliamentMCPClient | null,
  articleTypes: readonly string[]
): Promise<void> {
  const MONTH_LEVEL_TYPES = ['month-ahead', 'month-in-review', 'committee-reports', 'motions'];
  const needsMonthData = articleTypes
    .map((t) => t.trim())
    .some((t) => MONTH_LEVEL_TYPES.includes(t));
  const feedTimeframe = needsMonthData ? 'one-month' : 'one-week';

  // fetchEPFeedData handles a null client gracefully (returns undefined) and
  // also loads from EP_FEED_DATA_FILE when set, so we call it unconditionally.
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

  // Agentic workflows must not proceed with empty data — analysis on empty
  // data produces hollow output that should never feed article generation.
  if (!hasSubstantiveData(fetchedData)) {
    throw new Error(
      '❌ Analysis aborted: no substantive EP data was fetched. ' +
        'MCP data fetch must succeed before analysis can run. ' +
        'Check MCP connection, feed data file, or EP API availability.'
    );
  }
}

/**
 * Run the analysis discovery stage (Fetch → Discover) before article generation.
 *
 * This function fetches EP feed data and then discovers the analysis `.md`
 * files that the AI agentic workflow wrote to `analysis/daily/{date}/{article-type}/`.
 * It writes a minimal `manifest.json` if one doesn't already exist, so that
 * downstream consumers (strategies, article template) can reference the analysis.
 *
 * The AI agent performs ALL analytical work directly — this function merely
 * discovers and catalogues what exists on disk.  The returned
 * {@link AnalysisContext} is informational; strategies read analysis output
 * from disk rather than consuming the context object in-memory.
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
async function maybeRunAnalysis(
  date: string,
  client: EuropeanParliamentMCPClient | null
): Promise<AnalysisContext | null> {
  if (!runAnalysisArg && !analysisOnlyArg) return null;

  const rawAnalysisDirBase = analysisDirArg?.split(ARG_SEPARATOR)[1];
  const trimmedAnalysisDirBase = rawAnalysisDirBase?.trim();
  const analysisDirBase =
    trimmedAnalysisDirBase && trimmedAnalysisDirBase.length > 0
      ? trimmedAnalysisDirBase
      : 'analysis/daily';
  const enabledMethods = parseAnalysisMethods();

  console.log('');
  console.log('🔬 Running analysis discovery stage...');
  console.log(`   Output dir: ${analysisDirBase}/${date}`);
  console.log(`   Methods: ${enabledMethods.length} enabled`);
  console.log('');

  // Detect whether `--analysis-dir` already points at a fully-resolved
  // per-run analysis directory (agentic workflows pre-populate
  // `analysis/daily/<date>/<slug>-run<N>` with AI-authored artifacts and
  // pass it verbatim).  When so, honour the path as-is; otherwise treat it
  // as a base and compose `<base>/<date>/<slug>` below.
  const analysisDirIsResolved = isResolvedAnalysisDir(analysisDirBase);
  if (analysisDirIsResolved) {
    console.log(`   Analysis dir treated as pre-resolved run directory`);
  }

  // Short-circuit for `--analysis-only` wrap-up on a pre-resolved dir:
  // the agent has already completed Stage A (data collection) and Stage B
  // (artifact authoring); runAnalysisStage with outputDirIsResolved=true
  // performs pure filesystem discovery and does not need EP data.  Skip
  // the expensive fetchEPFeedData call — a slow one-month feed pull here
  // can hang the pipeline wrap-up long enough for the safeoutputs MCP
  // session to expire, which then blocks PR creation (see failed run
  // #24802174815 for the cascade).
  const skipDataFetch = analysisOnlyArg && analysisDirIsResolved;

  // Always initialise voting-derived keys (`patterns`, `votingRecords`) to
  // empty arrays so coalition/voting/cross-session analyses never receive
  // undefined.  These feeds are not yet exposed by fetchEPFeedData, so they
  // stay empty until a future MCP voting-records endpoint is available.
  const fetchedData: Record<string, unknown> = {
    date,
    patterns: [],
    votingRecords: [],
  };

  if (skipDataFetch) {
    console.log(
      `   Skipping EP data fetch — --analysis-only wrap-up on pre-resolved dir (agent owns Stage A/B)`
    );
    // Populate empty arrays so downstream builders don't trip on undefined.
    fetchedData['events'] = [];
    fetchedData['sessions'] = [];
    fetchedData['documents'] = [];
  } else {
    await fetchAndValidateEPData(fetchedData, client, articleTypes);
  }

  const validArticleTypes = articleTypes
    .map((t) => t.trim())
    .filter((t): t is ArticleCategory =>
      VALID_ARTICLE_CATEGORIES.includes(t as ArticleCategory)
    ) as readonly ArticleCategory[];

  // Derive a slug from the article types to scope analysis output per workflow,
  // preventing merge conflicts when multiple workflows run on the same date.
  // When a run ID is provided (e.g. GITHUB_RUN_NUMBER), append it to the slug
  // so each workflow execution gets a unique analysis directory.  This prevents
  // overwrites when the same workflow runs multiple times on the same day.
  const baseSlugForAnalysis = deriveArticleTypeSlug(validArticleTypes);
  const slug = runId ? `${baseSlugForAnalysis}-run${runId}` : baseSlugForAnalysis;

  console.log(`   Article type slug: ${slug}`);
  if (runId) console.log(`   Run ID: ${runId}`);

  // Require data only when we actually fetched it.  The pre-resolved
  // --analysis-only wrap-up path performs discovery-only and needs no data.
  const ctx = await runAnalysisStage(fetchedData, {
    articleTypes: validArticleTypes,
    date,
    outputDir: analysisDirBase,
    articleTypeSlug: slug,
    enabledMethods,
    skipCompleted: true,
    verbose: analysisVerboseArg,
    requireData: !skipDataFetch,
    outputDirIsResolved: analysisDirIsResolved,
    // Propagate the CLI run ID so manifest history entries carry the workflow
    // run identifier rather than a random UUID, enabling audit-trail tracing.
    ...(runId ? { runId } : {}),
    // Forward the explicit --gate-result CLI value when provided; omit when
    // absent so runAnalysisStage can carry forward the latest resolved result
    // already committed by the AI agent during Stage C.
    ...(cliGateResult !== undefined ? { gateResult: cliGateResult } : {}),
  });

  const totalMethods = ctx.manifest.methods.length;
  const completedCount = ctx.manifest.methods.filter(
    (method) => method.status === 'completed'
  ).length;
  const skippedCount = ctx.manifest.methods.filter((method) => method.status === 'skipped').length;
  const failedMethods = ctx.manifest.methods.filter((method) => method.status === 'failed');
  const failedCount = failedMethods.length;

  console.log('');
  console.log(
    `🔬 Analysis discovery complete: ${completedCount} files found, ${skippedCount} skipped, ${failedCount} issues (of ${totalMethods})`
  );
  console.log(`   Confidence: ${ctx.manifest.overallConfidence}`);
  console.log(`   Manifest: ${ctx.outputDir}/manifest.json`);
  console.log('');

  // Verify analysis discovery found files — article generation must never
  // proceed without analysis artifacts.  Zero results mean the AI agent
  // needs to write analysis files before the generator can proceed.
  if (failedCount > 0) {
    const failedNames = failedMethods.map((m) => m.method).join(', ');
    throw new Error(
      `Analysis incomplete: ${failedCount} of ${totalMethods} discovered analysis files had issues (${failedNames}). ` +
        'Article generation requires analysis artifacts to exist.'
    );
  }

  if (ctx.completedMethods.length === 0) {
    throw new Error(
      `Analysis produced no discovered files (${failedCount} issues). ` +
        'Article generation requires AI-generated analysis artifacts in the analysis output directory.'
    );
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
async function runAnalysisWithGuard(
  date: string,
  client: EuropeanParliamentMCPClient | null
): Promise<AnalysisContext | null> {
  let analysisCtx: AnalysisContext | null;
  try {
    analysisCtx = await maybeRunAnalysis(date, client);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Analysis stage failed: ${message}`);
    console.error(
      '🛑 Aborting: agentic workflow requires successful data fetch and analysis before article generation.'
    );
    throw err instanceof Error ? err : new Error(message);
  }

  // Gate: when analysis was requested, verify it produced output before
  // proceeding to article generation.  Never produce articles without
  // completed analysis — this enforces the agentic workflow principle.
  if ((runAnalysisArg || analysisOnlyArg) && !analysisCtx) {
    const msg =
      '--analysis was requested but no analysis context was produced. ' +
      'Article generation requires completed analysis.';
    console.error(`🛑 Aborting: ${msg}`);
    throw new Error(msg);
  }

  return analysisCtx;
}

/**
 * Wire AI-provided title/description from CLI `--title` and `--description` flags.
 * The AI agent passes these after analysing the content.
 * They override ALL script-generated metadata for the English version.
 */
function wireAIMetadata(): void {
  if (aiTitle || aiDescription) {
    setAIMetadata(aiTitle, aiDescription);
    if (aiTitle) console.log(`📝 AI-provided title: "${aiTitle}"`);
    if (aiDescription) console.log(`📝 AI-provided description: "${aiDescription}"`);
  }
}

/**
 * Compute the dedup suffix by comparing the resolved analysis directory
 * basename with the original slug.  Examples:
 * - `('breaking', 'breaking-2')`    → `'-2'`
 * - `('breaking', 'breaking')`       → `''`
 * - `('breaking-run6', 'breaking-run6-2')` → `'-run6-2'`
 *
 * @param articleTypes - Article type strings to derive the base slug
 * @param analysisDir - Resolved analysis directory basename (may include suffix)
 * @returns Validated dedup suffix string (empty when no suffix applies)
 */
export function computeDedupSuffix(articleTypes: readonly string[], analysisDir?: string): string {
  const baseSlugNoRun = deriveArticleTypeSlug(
    articleTypes.filter((t): t is ArticleCategory =>
      VALID_ARTICLE_CATEGORIES.includes(t as ArticleCategory)
    )
  );
  const rawSuffix = analysisDir?.startsWith(baseSlugNoRun)
    ? analysisDir.slice(baseSlugNoRun.length)
    : '';
  // Suffix validation patterns for dedup suffix extraction.
  // Run IDs are sanitized to alphanumeric + hyphen, so preserve the same
  // character class here to avoid dropping custom run scopes such as
  // `-runabc-1` or `-runrelease-candidate`.
  // -run6, -runabc-1              → run-id only
  // -2, -3, -a1b2c3d4             → dedup only (numeric or UUID-fragment)
  // -run6-2, -runabc-1-a1b2c3d4   → combined run-id + dedup
  const RUN_ID_SUFFIX = /^-run[a-z0-9-]{1,64}$/iu;
  const DEDUP_SUFFIX = /^-[\da-f]{1,8}$/iu;
  const isValidSuffix =
    rawSuffix === '' || RUN_ID_SUFFIX.test(rawSuffix) || DEDUP_SUFFIX.test(rawSuffix);
  return isValidSuffix ? rawSuffix : '';
}

/**
 * Resolve analysis file entries for article transparency links.
 *
 * Extracts entries from the manifest when it uses the standard pipeline format
 * (methods[] with status and outputFile).  When the manifest lacks standard
 * entries (e.g. agentic workflow manifests), falls back to scanning the
 * analysis directory on disk for all `.md` files.  This ensures articles
 * link to ALL analysis artifacts regardless of manifest format.
 *
 * @param analysisCtx - Analysis context from the pipeline stage, or null
 * @returns Array of analysis file entries, or undefined when unavailable
 */
function resolveAnalysisFileEntries(
  analysisCtx: AnalysisContext | null
): AnalysisFileEntry[] | undefined {
  if (!analysisCtx) return undefined;

  const manifestMethods = analysisCtx.manifest.methods;
  const completedEntries = manifestMethods
    .filter((m) => m.status === 'completed')
    .map((m) => ({ method: m.method, outputFile: m.outputFile }));

  if (completedEntries.length > 0) {
    return completedEntries;
  }

  // Manifest may use agentic-workflow format without standard methods[].
  // Fall back to scanning the analysis directory on disk for all .md files.
  const discovered = discoverAnalysisFileEntries(analysisCtx.outputDir);
  if (discovered.length > 0) {
    console.log(
      `📂 Discovered ${discovered.length} analysis files from disk (manifest lacked standard methods)`
    );
    return discovered;
  }

  return undefined;
}

/**
 * Main execution: initialise the MCP client, optionally run analysis stage,
 * iterate over requested article types, delegate to the appropriate strategy,
 * then persist metadata.
 */
async function main(): Promise<void> {
  console.log('');
  console.log('🚀 Starting news generation...');
  console.log('');

  // Wire AI-provided title/description from CLI flags.
  wireAIMetadata();

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
    const analysisCtx = await runAnalysisWithGuard(todayDate, client);

    // Extract the resolved analysis directory basename (e.g. 'breaking-2')
    // so article transparency links point to the correct suffixed analysis
    // directory when suffix deduplication is active.
    const analysisDir = analysisCtx ? path.basename(analysisCtx.outputDir) : undefined;

    // Expose analysis dir/slug via env vars so strategies can locate analysis
    // artifacts without hard-coding paths.  Follows the EP_FEED_DATA_FILE pattern.
    if (analysisCtx) {
      // Base dir: parent of date-scoped dir (e.g. 'analysis/daily' from 'analysis/daily/2026-04-06/breaking')
      const analysisOutputParent = path.dirname(analysisCtx.outputDir);
      const analysisBaseDir = path.dirname(analysisOutputParent);
      process.env['EP_ANALYSIS_DIR'] = analysisBaseDir;
      // Slug: the resolved directory basename (may include dedup suffix like 'breaking-2')
      process.env['EP_ANALYSIS_SLUG'] = analysisDir;
    }

    // Compute dedup suffix by comparing resolved analysis dir with the base slug
    const dedupSuffix = computeDedupSuffix(articleTypes, analysisDir);

    // Extract analysis file entries for the article template's transparency section.
    const analysisFiles = resolveAnalysisFileEntries(analysisCtx);

    // If --analysis-only, skip article generation
    if (analysisOnlyArg) {
      console.log('ℹ️  --analysis-only specified. Skipping article generation.');
      return;
    }

    const outputOptions: OutputOptions = {
      dryRun: dryRunArg,
      skipExisting: skipExistingArg,
      newsDir: path.resolve(NEWS_DIR),
    };

    const registry = createStrategyRegistry();

    const results: GenerationResult[] = [];

    for (const articleType of articleTypes) {
      if (!VALID_ARTICLE_CATEGORIES.includes(articleType as ArticleCategory)) {
        console.log(`⏭️ Skipping unknown article type: ${articleType}`);
        continue;
      }

      const strategy = registry.get(articleType as ArticleCategory);
      if (!strategy) {
        console.log(`⏭️ Article type "${articleType}" not yet implemented`);
        continue;
      }

      results.push(
        await generateArticleForStrategy(
          strategy,
          client,
          languages,
          outputOptions,
          stats,
          dedupSuffix,
          analysisDir,
          analysisFiles
        )
      );
    }

    console.log('');
    console.log('📊 Generation Summary:');
    console.log(`  ✅ Generated: ${stats.generated} articles`);
    console.log(`  ⏭️ Skipped: ${stats.skipped} articles`);
    if (dryRunArg) console.log(`  🔍 Dry run: ${stats.dryRun} articles`);
    console.log(`  ❌ Errors: ${stats.errors}`);
    console.log('');

    writeGenerationMetadata(stats, results, client !== null, METADATA_DIR, dryRunArg);

    process.exitCode = stats.errors > 0 ? 1 : 0;
  } finally {
    if (client) {
      console.log('🔌 Closing MCP client connection...');
      await closeEPMCPClient();
    }
  }
}

// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`💥 Fatal: ${message}`);
    process.exitCode = 1;
  });
}
