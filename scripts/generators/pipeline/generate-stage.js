// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { ArticleCategory } from '../../types/index.js';
import { generateArticleHTML } from '../../templates/article-template.js';
import { calculateReadTime, formatDateForSlug } from '../../utils/file-utils.js';
import { weekAheadStrategy } from '../strategies/week-ahead-strategy.js';
import { breakingNewsStrategy } from '../strategies/breaking-news-strategy.js';
import { committeeReportsStrategy } from '../strategies/committee-reports-strategy.js';
import { propositionsStrategy } from '../strategies/propositions-strategy.js';
import { motionsStrategy } from '../strategies/motions-strategy.js';
import { writeSingleArticle } from './output-stage.js';
/**
 * Build the default strategy registry containing all five built-in strategies.
 *
 * Each concrete strategy implements `ArticleStrategy<ConcreteData>` where
 * `ConcreteData` extends `ArticleData`.  TypeScript's invariant generic
 * parameter means the concrete type is not directly assignable to the base
 * `ArticleStrategy<ArticleData>` without a boundary cast; the
 * `as unknown as ArticleStrategy<ArticleData>` casts below are therefore
 * intentional and safe — the registry delegates back to each strategy's own
 * typed `fetchData`/`buildContent`/`getMetadata` methods at call-site.
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
    return registry;
}
// ─── Emoji map ────────────────────────────────────────────────────────────────
/** Display emoji for each article category */
const ARTICLE_EMOJIS = {
    [ArticleCategory.WEEK_AHEAD]: '📅',
    [ArticleCategory.BREAKING_NEWS]: '🚨',
    [ArticleCategory.COMMITTEE_REPORTS]: '🏛️',
    [ArticleCategory.PROPOSITIONS]: '📜',
    [ArticleCategory.MOTIONS]: '🗳️',
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
            if (writeSingleArticle(html, slug, lang, outputOptions, stats)) {
                writtenCount++;
                console.log(`  ✅ ${lang.toUpperCase()} version generated`);
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
        if (stack) {
            console.error('   Stack:', stack);
        }
        stats.errors++;
        return { success: false, error: message };
    }
}
//# sourceMappingURL=generate-stage.js.map