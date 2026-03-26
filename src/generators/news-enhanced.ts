#!/usr/bin/env node

// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/NewsEnhanced
 * @description CLI orchestrator for European Parliament news generation.
 *
 * Coordinates the three-stage pipeline (fetch → generate → output)
 * via dedicated pipeline-stage modules and a strategy registry.  Each article
 * type is handled by its own {@link ArticleStrategy} implementation.
 *
 * Pipeline stages:
 * - {@link module:Generators/Pipeline/FetchStage}
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
import { ensureDirectoryExists } from '../utils/file-utils.js';
import type {
  LanguageCode,
  LanguagePreset,
  GenerationStats,
  GenerationResult,
} from '../types/index.js';
import type { ArticleCategory } from '../types/index.js';

// ─── Pipeline-stage imports ───────────────────────────────────────────────────

import { initializeMCPClient, fetchEPFeedData } from './pipeline/fetch-stage.js';
import { createStrategyRegistry, generateArticleForStrategy } from './pipeline/generate-stage.js';
import { writeGenerationMetadata } from './pipeline/output-stage.js';
import type { OutputOptions } from './pipeline/output-stage.js';
import { runAnalysisStage, ALL_ANALYSIS_METHODS } from './pipeline/analysis-stage.js';
import type { AnalysisMethod, AnalysisContext } from './pipeline/analysis-stage.js';

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
if (LANGUAGE_PRESETS[languagesInput as LanguagePreset]) {
  languagesInput = LANGUAGE_PRESETS[languagesInput as LanguagePreset]!.join(',');
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
    if ((ALL_ANALYSIS_METHODS as readonly string[]).includes(name)) {
      validMethods.add(name as AnalysisMethod);
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
 * Run the optional analysis stage (Fetch → Analysis) before article generation.
 *
 * This function is **side-effect-only**: it writes analysis markdown and a
 * `manifest.json` to disk under `analysis-output/{date}/`.  The returned
 * {@link AnalysisContext} is informational; strategies read analysis output
 * from disk rather than consuming the context object in-memory.
 *
 * When an MCP client is available, comprehensive EP feed data is fetched and
 * passed to the analysis stage.  When no client is available, the stage runs
 * over an empty data set (analysis output reflects this).
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

  const analysisDirBase = analysisDirArg?.split(ARG_SEPARATOR)[1]?.trim() ?? 'analysis-output';
  const enabledMethods = parseAnalysisMethods();

  console.log('');
  console.log('🔬 Running analysis stage...');
  console.log(`   Output dir: ${analysisDirBase}/${date}`);
  console.log(`   Methods: ${enabledMethods.length} enabled`);
  console.log('');

  // Fetch comprehensive EP feed data.  fetchEPFeedData handles a null client
  // gracefully (returns undefined) and also loads from EP_FEED_DATA_FILE when
  // set, so we call it unconditionally.
  const fetchedData: Record<string, unknown> = { date };
  const feedData = await fetchEPFeedData(client, 'one-week');
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
    fetchedData['patterns'] = [];
    fetchedData['votingRecords'] = [];
  }

  try {
    const normalizedArticleTypes = articleTypes.map((t) => t.trim());
    const validArticleTypes = normalizedArticleTypes.filter((t): t is ArticleCategory =>
      VALID_ARTICLE_CATEGORIES.includes(t as ArticleCategory)
    ) as readonly ArticleCategory[];

    const ctx = await runAnalysisStage(fetchedData, {
      articleTypes: validArticleTypes,
      date,
      outputDir: analysisDirBase,
      enabledMethods,
      skipCompleted: true,
      verbose: true,
    });
    console.log('');
    console.log(`🔬 Analysis complete: ${ctx.completedMethods.length} methods run`);
    console.log(`   Confidence: ${ctx.manifest.overallConfidence}`);
    console.log(`   Manifest: ${ctx.outputDir}/manifest.json`);
    console.log('');
    return ctx;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Analysis stage failed: ${message}`);
    // Analysis failure does not block article generation
    return null;
  }
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

  // Run optional analysis stage (Fetch → Analysis)
  // Side-effect-only: writes markdown + manifest to disk under analysis-output/{date}/
  await maybeRunAnalysis(todayDate, client);

  // If --analysis-only, skip article generation
  if (analysisOnlyArg) {
    console.log('ℹ️  --analysis-only specified. Skipping article generation.');
    if (client) await closeEPMCPClient();
    process.exit(0);
  }

  const outputOptions: OutputOptions = {
    dryRun: dryRunArg,
    skipExisting: skipExistingArg,
    newsDir: path.resolve(NEWS_DIR),
  };

  const registry = createStrategyRegistry();

  try {
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
        await generateArticleForStrategy(strategy, client, languages, outputOptions, stats)
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
  } finally {
    if (client) {
      console.log('🔌 Closing MCP client connection...');
      await closeEPMCPClient();
    }
  }

  process.exit(stats.errors > 0 ? 1 : 0);
}

// Only run main when executed directly (not when imported)
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
