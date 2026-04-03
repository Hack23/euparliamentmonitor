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
import type { LanguageCode, GenerationStats, GenerationResult } from '../../types/index.js';
import { generateArticleHTML } from '../../templates/article-template.js';
import {
  calculateReadTime,
  formatDateForSlug,
  validateArticleHTML,
} from '../../utils/file-utils.js';
import type { ArticleStrategyBase, ArticleData } from '../strategies/article-strategy.js';
import {
  validateArticleContent,
  validateTranslationCompleteness,
} from '../../utils/content-validator.js';
import { scoreArticleQuality } from '../../utils/article-quality-scorer.js';
import { enrichMetadataFromContent } from '../../utils/content-metadata.js';
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

// ─── Dedup helper ─────────────────────────────────────────────────────────────

/**
 * Extract the deduplication suffix from a resolved analysis directory name
 * and apply it to the given strategy type.
 *
 * If `analysisDir` is `"breaking-2"` and `strategyType` is `"breaking"`,
 * returns `"breaking-2"`.  For UUID-based fallbacks like `"breaking-a1b2c3d4"`,
 * returns `"breaking-a1b2c3d4"`.  When no suffix applies, returns the
 * `strategyType` unchanged.
 *
 * @param strategyType - Base article type (e.g. `"breaking"`)
 * @param analysisDir - Resolved analysis directory basename, if any
 * @returns The type slug with any dedup suffix appended
 */
function deriveTypeSlug(strategyType: string, analysisDir?: string): string {
  const prefix = `${strategyType}-`;
  if (analysisDir !== undefined && analysisDir.startsWith(prefix)) {
    return analysisDir;
  }
  return strategyType;
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
 * @param analysisDir - Optional resolved analysis directory name (e.g. 'breaking-2') for provenance links
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
  availableLanguages?: ReadonlyArray<LanguageCode>,
  analysisDir?: string
): boolean {
  console.log(`  🌐 Generating ${lang.toUpperCase()} version...`);

  const content = strategy.buildContent(data, lang);
  const baseMetadata = strategy.getMetadata(data, lang);

  // Enrich metadata by analysing the actual rendered content.
  // This produces insightful titles, descriptions, and keywords
  // that reflect the article's coverage — not generic template text.
  // Title/description enrichment is English-only because the heuristics
  // (statistic extraction, generic-heading filter) use English keywords.
  // Language-agnostic keyword additions (committee abbreviations, etc.)
  // are preserved for all languages.
  const enrichedMetadata = enrichMetadataFromContent(content, baseMetadata);
  const metadata =
    lang === 'en'
      ? enrichedMetadata
      : {
          ...baseMetadata,
          keywords: enrichedMetadata.keywords ?? baseMetadata.keywords,
          sources: enrichedMetadata.sources ?? baseMetadata.sources,
        };

  const html = generateArticleHTML({
    // Extract the type-slug portion from the file slug (which is
    // "{date}-{typeSlug}") so canonical URLs, og:url, and language-
    // switcher links include any dedup suffix (e.g. "breaking-2").
    slug: slug.replace(/^\d{4}-\d{2}-\d{2}-/, ''),
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
    analysisDir,
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

  // Translation completeness — informational only, never blocks generation
  const translationValidation = validateTranslationCompleteness(html, lang);
  for (const warning of translationValidation.warnings) {
    console.warn(`  🌐 ${lang.toUpperCase()} ${warning}`);
    stats.translationWarnings = (stats.translationWarnings ?? 0) + 1;
  }

  // Quality scoring — informational only, never blocks generation
  const qualityReport = scoreArticleQuality(html, slug, lang, strategy.type);
  console.log(
    `  📊 ${lang.toUpperCase()} quality: Grade ${qualityReport.grade} (${qualityReport.overallScore}/100)`
  );
  if (!qualityReport.passesQualityGate) {
    console.warn(
      `  ⚠️  ${lang.toUpperCase()} article did not pass quality gate (score ${qualityReport.overallScore} < 40). Recommendations:`
    );
    for (const rec of qualityReport.recommendations.slice(0, 3)) {
      console.warn(`       💡 ${rec}`);
    }
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
 * @param analysisDir - Optional resolved analysis directory name (e.g. 'breaking-2') for provenance links
 * @returns Generation result with success flag, file count and slug
 */
export async function generateArticleForStrategy(
  strategy: ArticleStrategyBase,
  client: EuropeanParliamentMCPClient | null,
  languages: ReadonlyArray<LanguageCode>,
  outputOptions: OutputOptions,
  stats: GenerationStats,
  analysisDir?: string
): Promise<GenerationResult> {
  const emoji = ARTICLE_EMOJIS[strategy.type] ?? '📄';
  console.log(`${emoji} Generating ${strategy.type} article...`);

  try {
    const today = new Date();
    const dateStr = getIsoDatePart(today);
    const typeSlug = deriveTypeSlug(strategy.type, analysisDir);
    const slug = `${formatDateForSlug(today)}-${typeSlug}`;

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
          languages,
          analysisDir
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
