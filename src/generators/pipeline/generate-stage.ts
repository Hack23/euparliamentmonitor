// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/GenerateStage
 * @description Article content generation orchestration pipeline stage.
 *
 * Provides a {@link StrategyRegistry} that maps each {@link ArticleCategory}
 * to its concrete {@link ArticleStrategy} implementation, and a single
 * {@link generateArticleForStrategy} function that runs the full fetch →
 * build → write cycle for one article type across all requested languages.
 */

import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { ArticleCategory } from '../../types/index.js';
import type {
  LanguageCode,
  GenerationStats,
  GenerationResult,
  ArticleIndexEntry,
  IntelligenceIndex,
  ArticleCrossReference,
  TrendDetection,
} from '../../types/index.js';
import { generateArticleHTML } from '../../templates/article-template.js';
import {
  calculateReadTime,
  formatDateForSlug,
  validateArticleHTML,
} from '../../utils/file-utils.js';
import type { ArticleStrategyBase, ArticleData } from '../strategies/article-strategy.js';
import { validateArticleContent } from '../../utils/content-validator.js';
import { weekAheadStrategy } from '../strategies/week-ahead-strategy.js';
import { breakingNewsStrategy } from '../strategies/breaking-news-strategy.js';
import { committeeReportsStrategy } from '../strategies/committee-reports-strategy.js';
import { propositionsStrategy } from '../strategies/propositions-strategy.js';
import { motionsStrategy } from '../strategies/motions-strategy.js';
import { monthAheadStrategy } from '../strategies/month-ahead-strategy.js';
import { weeklyReviewStrategy } from '../strategies/weekly-review-strategy.js';
import { monthlyReviewStrategy } from '../strategies/monthly-review-strategy.js';
import type { OutputOptions } from './output-stage.js';
import { writeSingleArticle } from './output-stage.js';
import {
  findRelatedArticles,
  generateCrossReferences,
  buildRelatedArticlesHTML,
} from '../../utils/intelligence-index.js';

// ─── Registry ────────────────────────────────────────────────────────────────

/** Map from {@link ArticleCategory} to its registered strategy */
export type StrategyRegistry = Map<ArticleCategory, ArticleStrategyBase>;

/**
 * Build the default strategy registry containing all built-in strategies.
 *
 * Each concrete strategy implements `ArticleStrategy<ConcreteData>` which
 * extends `ArticleStrategyBase`.  Because TypeScript's method-parameter
 * checking is bivariant, a strategy whose methods accept a narrower `TData`
 * is structurally assignable to `ArticleStrategyBase` without any cast.
 *
 * @returns A populated registry ready for use by {@link generateArticleForStrategy}
 */
export function createStrategyRegistry(): StrategyRegistry {
  const registry: StrategyRegistry = new Map();
  registry.set(ArticleCategory.WEEK_AHEAD, weekAheadStrategy);
  registry.set(ArticleCategory.BREAKING_NEWS, breakingNewsStrategy);
  registry.set(ArticleCategory.COMMITTEE_REPORTS, committeeReportsStrategy);
  registry.set(ArticleCategory.PROPOSITIONS, propositionsStrategy);
  registry.set(ArticleCategory.MOTIONS, motionsStrategy);
  registry.set(ArticleCategory.MONTH_AHEAD, monthAheadStrategy);
  registry.set(ArticleCategory.WEEK_IN_REVIEW, weeklyReviewStrategy);
  registry.set(ArticleCategory.MONTH_IN_REVIEW, monthlyReviewStrategy);
  return registry;
}

// ─── Emoji map ────────────────────────────────────────────────────────────────

/** Display emoji for each article category */
const ARTICLE_EMOJIS: Partial<Record<ArticleCategory, string>> = {
  [ArticleCategory.WEEK_AHEAD]: '📅',
  [ArticleCategory.MONTH_AHEAD]: '📅',
  [ArticleCategory.BREAKING_NEWS]: '🚨',
  [ArticleCategory.COMMITTEE_REPORTS]: '🏛️',
  [ArticleCategory.PROPOSITIONS]: '📜',
  [ArticleCategory.MOTIONS]: '🗳️',
  [ArticleCategory.WEEK_IN_REVIEW]: '📊',
  [ArticleCategory.MONTH_IN_REVIEW]: '📊',
};

// ─── Date helper ──────────────────────────────────────────────────────────────

/**
 * Extract the YYYY-MM-DD portion of a Date object's ISO string.
 * Throws explicitly instead of relying on non-null assertion.
 *
 * @param date - Date to extract from
 * @returns ISO date string (YYYY-MM-DD)
 */
function getIsoDatePart(date: Date): string {
  const parts = date.toISOString().split('T');
  if (!parts[0]) throw new Error('Failed to extract date part from ISO string');
  return parts[0];
}

/**
 * Generate, validate and write a single language version of an article.
 *
 * @param strategy - Article strategy providing content and metadata
 * @param data - Fetched article data
 * @param lang - Target language code
 * @param dateStr - ISO date string
 * @param slug - File slug (date-type)
 * @param outputOptions - Output configuration
 * @param stats - Mutable generation stats
 * @param availableLanguages - Languages for which the article exists; used to restrict language switcher links
 * @returns true if a file was written
 */
function generateSingleLanguageArticle(
  strategy: ArticleStrategyBase,
  data: ArticleData,
  lang: LanguageCode,
  dateStr: string,
  slug: string,
  outputOptions: OutputOptions,
  stats: GenerationStats,
  availableLanguages?: ReadonlyArray<LanguageCode>
): boolean {
  console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

  const content = strategy.buildContent(data, lang);
  const metadata = strategy.getMetadata(data, lang);

  const html = generateArticleHTML({
    slug: strategy.type,
    title: metadata.title,
    subtitle: metadata.subtitle,
    date: dateStr,
    category: metadata.category,
    readTime: calculateReadTime(content),
    lang,
    content,
    keywords: [...metadata.keywords],
    sources: metadata.sources ? [...metadata.sources] : [],
    availableLanguages,
  });

  // Validate generated HTML has all required structural elements
  const validation = validateArticleHTML(html);
  if (!validation.valid) {
    console.error(
      `  ❌ ${lang.toUpperCase()} article failed validation: ${validation.errors.join('; ')}`
    );
    stats.errors++;
    return false;
  }

  // Validate content quality (word count, placeholders, required elements)
  const contentValidation = validateArticleContent(html, lang, strategy.type);
  if (!contentValidation.valid) {
    console.error(
      `  ❌ ${lang.toUpperCase()} article failed content validation: ${contentValidation.errors.join('; ')}`
    );
    stats.errors++;
    return false;
  }
  for (const warning of contentValidation.warnings) {
    console.warn(`  ⚠️  ${lang.toUpperCase()} content warning: ${warning}`);
  }

  if (writeSingleArticle(html, slug, lang, outputOptions, stats)) {
    console.log(`  ✅ ${lang.toUpperCase()} version generated`);
    return true;
  }
  return false;
}

// ─── Generation orchestrator ──────────────────────────────────────────────────

/**
 * Run the complete fetch → build → write cycle for one article type.
 *
 * Iterates over `languages`, calls the strategy for content and metadata,
 * generates the full HTML wrapper and writes each file through the output
 * stage.  Catches all errors so the caller can continue with other types.
 *
 * @param strategy - Concrete strategy for the target article category
 * @param client - Connected MCP client or null
 * @param languages - Target language codes
 * @param outputOptions - Dry-run, skip-existing and directory flags
 * @param stats - Mutable stats object to increment counters on
 * @returns Generation result with success flag, file count and slug
 */
export async function generateArticleForStrategy(
  strategy: ArticleStrategyBase,
  client: EuropeanParliamentMCPClient | null,
  languages: ReadonlyArray<LanguageCode>,
  outputOptions: OutputOptions,
  stats: GenerationStats
): Promise<GenerationResult> {
  const emoji = ARTICLE_EMOJIS[strategy.type] ?? '📄';
  console.log(`${emoji} Generating ${strategy.type} article...`);

  try {
    const today = new Date();
    const dateStr = getIsoDatePart(today);
    const slug = `${formatDateForSlug(today)}-${strategy.type}`;

    const data = await strategy.fetchData(client, dateStr);

    // Check if the strategy wants to skip generation (e.g. all data is placeholder)
    if (strategy.shouldSkip?.(data)) {
      console.log(
        `  ⚠️  ${strategy.type} article skipped: all fetched data is placeholder (MCP unavailable or API gap). No files written.`
      );
      stats.skipped += languages.length;
      return { success: true, files: 0, slug };
    }

    let writtenCount = 0;
    for (const lang of languages) {
      if (
        generateSingleLanguageArticle(
          strategy,
          data,
          lang,
          dateStr,
          slug,
          outputOptions,
          stats,
          languages
        )
      ) {
        writtenCount++;
      }
    }

    const totalLangs = languages.length;
    if (writtenCount === 0) {
      console.log(
        `  ✅ ${strategy.type} article generation completed: 0 files written (dry-run or all files skipped)`
      );
    } else {
      console.log(
        `  ✅ ${strategy.type} article generated: ${writtenCount}/${totalLangs} language(s) written`
      );
    }

    return { success: true, files: writtenCount, slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`❌ Error generating ${strategy.type}:`, message);
    if (stack && process.env['DEBUG'] === 'true') {
      console.error('   Stack:', stack);
    }
    stats.errors++;
    return { success: false, error: message };
  }
}

// ─── Intelligence Index helpers ───────────────────────────────────────────────

/**
 * Build an {@link ArticleIndexEntry} for a freshly generated article so it can
 * be registered in the intelligence index by the output stage.
 *
 * @internal Not yet wired into the pipeline — will be exported once article
 * generation calls into the intelligence layer.
 *
 * @param slug - Article slug (e.g. "2025-01-15-week-ahead")
 * @param lang - Language code
 * @param category - Article category
 * @param date - ISO date string
 * @param keyTopics - Key topics extracted from the article data
 * @param keyActors - Key actors extracted from the article data
 * @param procedures - EP procedure references covered
 * @returns A populated {@link ArticleIndexEntry}
 */
// istanbul ignore next -- not yet wired into pipeline
function buildArticleIndexEntry(
  slug: string,
  lang: LanguageCode,
  category: ArticleCategory,
  date: string,
  keyTopics: string[] = [],
  keyActors: string[] = [],
  procedures: string[] = []
): ArticleIndexEntry {
  const id = `${slug}-${lang}`;
  return {
    id,
    date,
    type: category,
    lang,
    keyTopics,
    keyActors,
    procedures,
    crossReferences: [],
    trendContributions: [],
  };
}

/**
 * Use the intelligence index to find related articles and produce an HTML snippet
 * for inclusion in the generated article.
 *
 * @internal Not yet wired into the pipeline — will be exported once article
 * generation calls into the intelligence layer.
 *
 * @param index - The current intelligence index
 * @param entry - The article index entry being generated
 * @param lang - Language code for optional localisation
 * @returns HTML string for the "Related Analysis" section
 */
// istanbul ignore next -- not yet wired into pipeline
function enrichArticleWithIntelligence(
  index: IntelligenceIndex,
  entry: ArticleIndexEntry,
  lang?: LanguageCode
): string {
  const related = findRelatedArticles(index, entry.keyTopics, entry.keyActors);
  const crossRefs: ArticleCrossReference[] = generateCrossReferences(index, entry);
  const relevantTrends: TrendDetection[] = index.trends.filter((trend) =>
    entry.keyTopics.some((topic) => trend.name.toLowerCase().includes(topic.toLowerCase()))
  );
  return buildRelatedArticlesHTML(related, crossRefs, relevantTrends, lang);
}

// Suppress unused-variable warnings — these will be wired into the pipeline in a follow-up PR
void buildArticleIndexEntry;
void enrichArticleWithIntelligence;
