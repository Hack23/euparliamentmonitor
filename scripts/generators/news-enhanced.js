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
import { NEWS_DIR, METADATA_DIR, VALID_ARTICLE_CATEGORIES, ARTICLE_TYPE_WEEK_AHEAD, ARG_SEPARATOR, } from '../constants/config.js';
import { ALL_LANGUAGES, LANGUAGE_PRESETS, isSupportedLanguage } from '../constants/languages.js';
import { closeEPMCPClient } from '../mcp/ep-mcp-client.js';
import { ensureDirectoryExists } from '../utils/file-utils.js';
// ─── Pipeline-stage imports ───────────────────────────────────────────────────
import { initializeMCPClient } from './pipeline/fetch-stage.js';
import { createStrategyRegistry, generateArticleForStrategy } from './pipeline/generate-stage.js';
import { writeGenerationMetadata } from './pipeline/output-stage.js';
// ─── Content-module imports (bounded contexts) ───────────────────────────────
import { parsePlenarySessions, parseEPEvents, parseCommitteeMeetings, parseLegislativeDocuments, parseLegislativePipeline, parseParliamentaryQuestions, buildWeekAheadContent, buildKeywords, PLACEHOLDER_EVENTS, buildWhatToWatchSection, buildStakeholderImpactMatrix, computeWeekPoliticalTemperature, } from './week-ahead-content.js';
import { buildBreakingNewsContent } from './breaking-content.js';
import { applyCommitteeInfo, applyDocuments, applyEffectiveness, FEATURED_COMMITTEES, } from './committee-helpers.js';
import { PLACEHOLDER_MARKER, getMotionsFallbackData, generateMotionsContent, buildPoliticalAlignmentSection, } from './motions-content.js';
import { buildPropositionsContent } from './propositions-content.js';
// ─── Re-exports for backward compatibility (tests import from this module) ───
export { parsePlenarySessions, parseEPEvents, parseCommitteeMeetings, parseLegislativeDocuments, parseLegislativePipeline, parseParliamentaryQuestions, buildWeekAheadContent, buildKeywords, PLACEHOLDER_EVENTS, buildWhatToWatchSection, buildStakeholderImpactMatrix, computeWeekPoliticalTemperature, };
export { buildBreakingNewsContent };
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
 * Main execution: initialise the MCP client, iterate over requested article
 * types, delegate to the appropriate strategy, then persist metadata.
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
    const outputOptions = {
        dryRun: dryRunArg,
        skipExisting: skipExistingArg,
        newsDir: path.resolve(NEWS_DIR),
    };
    const registry = createStrategyRegistry();
    try {
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
    }
    finally {
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
//# sourceMappingURL=news-enhanced.js.map