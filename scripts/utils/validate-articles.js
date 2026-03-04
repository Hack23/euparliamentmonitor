// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/ValidateArticles
 * @description CI-ready article validation tool that checks all news articles
 * for quality, structural correctness, language consistency, and meta tag alignment.
 *
 * Can be run standalone or integrated into CI pipelines as a quality gate.
 * Exits with code 1 if any article has validation errors.
 *
 * Usage:
 * - Validate all articles: `npx tsx src/utils/validate-articles.ts`
 * - Validate specific date: `npx tsx src/utils/validate-articles.ts --date=2026-03-04`
 * - Strict mode (warnings are errors): `npx tsx src/utils/validate-articles.ts --strict`
 * - Dry run (no exit code): `npx tsx src/utils/validate-articles.ts --dry-run`
 */
import fs from 'node:fs';
import path from 'node:path';
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN } from '../constants/config.js';
import { validateArticleContent } from './content-validator.js';
// ─── CLI argument parsing ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
/**
 * Extract a CLI flag value: --flag=value
 *
 * @param name - Flag name to extract
 * @returns Flag value or undefined if not found
 */
function getArg(name) {
    const prefix = `--${name}=`;
    const arg = args.find((a) => a.startsWith(prefix));
    return arg?.slice(prefix.length);
}
const filterDate = getArg('date');
const strictMode = args.includes('--strict');
const dryRun = args.includes('--dry-run');
// ─── Slug-to-article-type mapping ─────────────────────────────────────────────
/**
 * Map article slug to article type for validator word-count thresholds.
 * The slug is the middle portion of the filename: {date}-{slug}-{lang}.html
 *
 * @param slug - Article slug (e.g. "week-ahead", "breaking", "committee-reports")
 * @returns Article type string matching ArticleCategory values
 */
function slugToArticleType(slug) {
    const mapping = {
        'week-ahead': 'week-ahead',
        'month-ahead': 'month-ahead',
        breaking: 'breaking',
        'committee-reports': 'committee-reports',
        propositions: 'propositions',
        motions: 'motions',
        'week-in-review': 'week-in-review',
        'month-in-review': 'month-in-review',
        'weekly-review': 'week-in-review',
        'monthly-review': 'month-in-review',
    };
    return mapping[slug] ?? slug;
}
// ─── Main validation logic ────────────────────────────────────────────────────
/**
 * Validate all news articles in the news directory.
 *
 * @returns Validation report with per-article summaries
 */
function validateAllArticles() {
    if (!fs.existsSync(NEWS_DIR)) {
        console.error(`❌ News directory not found: ${NEWS_DIR}`);
        return { totalArticles: 0, passed: 0, failed: 0, warnings: 0, articles: [] };
    }
    const files = fs
        .readdirSync(NEWS_DIR)
        .filter((f) => f.endsWith('.html'))
        .filter((f) => ARTICLE_FILENAME_PATTERN.test(f))
        .filter((f) => (filterDate ? f.startsWith(filterDate) : true))
        .sort();
    const articles = [];
    let passed = 0;
    let failed = 0;
    let warningCount = 0;
    for (const filename of files) {
        const match = ARTICLE_FILENAME_PATTERN.exec(filename);
        if (!match)
            continue;
        const date = match[1] ?? '';
        const slug = match[2] ?? '';
        const lang = match[3] ?? '';
        const filePath = path.join(NEWS_DIR, filename);
        const html = fs.readFileSync(filePath, 'utf-8');
        const articleType = slugToArticleType(slug);
        const result = validateArticleContent(html, lang, articleType);
        const summary = {
            filename,
            lang,
            slug,
            date,
            valid: strictMode ? result.valid && result.warnings.length === 0 : result.valid,
            errors: [...result.errors],
            warnings: [...result.warnings],
            wordCount: result.metrics.wordCount,
        };
        if (strictMode && result.warnings.length > 0) {
            summary.errors.push(...result.warnings.map((w) => `[strict] ${w}`));
        }
        if (summary.valid) {
            passed++;
        }
        else {
            failed++;
        }
        if (result.warnings.length > 0) {
            warningCount++;
        }
        articles.push(summary);
    }
    return {
        totalArticles: files.length,
        passed,
        failed,
        warnings: warningCount,
        articles,
    };
}
/**
 * Print a formatted validation report to the console.
 *
 * @param report - Validation report to print
 */
function printReport(report) {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('  EU Parliament Monitor — Article Validation Report');
    console.log('════════════════════════════════════════════════════════════════\n');
    if (filterDate) {
        console.log(`  Filter: articles from ${filterDate}`);
    }
    if (strictMode) {
        console.log('  Mode: STRICT (warnings treated as errors)');
    }
    console.log(`  Total articles:  ${report.totalArticles}`);
    console.log(`  ✅ Passed:       ${report.passed}`);
    console.log(`  ❌ Failed:       ${report.failed}`);
    console.log(`  ⚠️  With warnings: ${report.warnings}\n`);
    printFailures(report);
    printWarnings(report);
    console.log('══════════════════════════════════════════════════════════════\n');
}
/**
 * Print failure details from the validation report.
 *
 * @param report - Validation report
 */
function printFailures(report) {
    const failures = report.articles.filter((a) => !a.valid);
    if (failures.length === 0)
        return;
    console.log('── FAILURES ──────────────────────────────────────────────────\n');
    for (const article of failures) {
        console.log(`  ❌ ${article.filename} (${article.wordCount} words)`);
        for (const error of article.errors) {
            console.log(`     ERROR: ${error}`);
        }
        for (const warning of article.warnings) {
            console.log(`     WARN:  ${warning}`);
        }
        console.log('');
    }
}
/**
 * Print warning details from the validation report.
 *
 * @param report - Validation report
 */
function printWarnings(report) {
    const withWarnings = report.articles.filter((a) => a.valid && a.warnings.length > 0);
    if (withWarnings.length === 0)
        return;
    console.log('── WARNINGS ──────────────────────────────────────────────────\n');
    for (const article of withWarnings) {
        console.log(`  ⚠️  ${article.filename} (${article.wordCount} words)`);
        for (const warning of article.warnings) {
            console.log(`     WARN:  ${warning}`);
        }
        console.log('');
    }
}
// ─── CLI execution ────────────────────────────────────────────────────────────
const report = validateAllArticles();
printReport(report);
if (!dryRun && report.failed > 0) {
    console.error(`❌ Validation failed: ${report.failed} article(s) have errors`);
    process.exit(1);
}
else if (report.failed === 0) {
    console.log('✅ All articles passed validation');
}
//# sourceMappingURL=validate-articles.js.map