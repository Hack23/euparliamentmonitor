// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { generateArticleHTML } from '../../templates/article-template.js';
import { calculateReadTime, formatDateForSlug, validateArticleHTML, } from '../../utils/file-utils.js';
import { weekAheadStrategy } from '../strategies/week-ahead-strategy.js';
import { breakingNewsStrategy } from '../strategies/breaking-news-strategy.js';
import { committeeReportsStrategy } from '../strategies/committee-reports-strategy.js';
import { propositionsStrategy } from '../strategies/propositions-strategy.js';
import { motionsStrategy } from '../strategies/motions-strategy.js';
import { monthAheadStrategy } from '../strategies/month-ahead-strategy.js';
import { weeklyReviewStrategy } from '../strategies/weekly-review-strategy.js';
import { monthlyReviewStrategy } from '../strategies/monthly-review-strategy.js';
import { writeSingleArticle } from './output-stage.js';
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
export function createStrategyRegistry() {
    const registry = new Map();
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
const ARTICLE_EMOJIS = {
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
function getIsoDatePart(date) {
    const parts = date.toISOString().split('T');
    if (!parts[0])
        throw new Error('Failed to extract date part from ISO string');
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
 * @returns true if a file was written
 */
function generateSingleLanguageArticle(strategy, data, lang, dateStr, slug, outputOptions, stats) {
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
    });
    // Validate generated HTML has all required structural elements
    const validation = validateArticleHTML(html);
    if (!validation.valid) {
        console.error(`  ❌ ${lang.toUpperCase()} article failed validation: ${validation.errors.join('; ')}`);
        stats.errors++;
        return false;
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
export async function generateArticleForStrategy(strategy, client, languages, outputOptions, stats) {
    const emoji = ARTICLE_EMOJIS[strategy.type] ?? '📄';
    console.log(`${emoji} Generating ${strategy.type} article...`);
    try {
        const today = new Date();
        const dateStr = getIsoDatePart(today);
        const slug = `${formatDateForSlug(today)}-${strategy.type}`;
        const data = await strategy.fetchData(client, dateStr);
        let writtenCount = 0;
        for (const lang of languages) {
            if (generateSingleLanguageArticle(strategy, data, lang, dateStr, slug, outputOptions, stats)) {
                writtenCount++;
            }
        }
        const totalLangs = languages.length;
        if (writtenCount === 0) {
            console.log(`  ✅ ${strategy.type} article generation completed: 0 files written (dry-run or all files skipped)`);
        }
        else {
            console.log(`  ✅ ${strategy.type} article generated: ${writtenCount}/${totalLangs} language(s) written`);
        }
        return { success: true, files: writtenCount, slug };
    }
    catch (error) {
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
//# sourceMappingURL=generate-stage.js.map