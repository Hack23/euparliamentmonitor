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
 * - Quality scoring: `npx tsx src/utils/validate-articles.ts --quality`
 * - JSON output: `npx tsx src/utils/validate-articles.ts --quality --output=json`
 */
import fs from 'node:fs';
import path from 'node:path';
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN, PROJECT_ROOT } from '../constants/config.js';
import { validateArticleContent, articlePolicyHasEconomicContext, articlePolicyHasIMFEconomicEvidence, isWave3IMFStrictEnabled, hasWorldBankEvidence, hasIMFEvidence, } from './content-validator.js';
import { scoreArticleQuality } from './article-quality-scorer.js';
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
const qualityMode = args.includes('--quality');
const outputFormat = getArg('output');
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
 * For policy article types, verify that either **World Bank** or **IMF**
 * economic context is cited in the article body OR in any `.md` file under
 * the article's `analysis/daily/{date}/{slug}*` directory. Non-policy article
 * types are always considered satisfied.
 *
 * This is the Wave-2 OR-gate (see IMF migration plan §5 Wave 2) that
 * replaces the prior World-Bank-only strict gate. WB-only articles remain
 * green (backward compatible); IMF-only or dual-sourced articles are now
 * also accepted.
 *
 * @param html - Full HTML of the article being validated
 * @param articleType - Article category slug (e.g. `"committee-reports"`)
 * @param date - Article publication date (`YYYY-MM-DD`)
 * @param slug - Article slug used to locate the matching analysis directory
 * @returns Warning string when the gate fails, or `null` when satisfied.
 */
function checkEconomicContextEvidence(html, articleType, date, slug) {
    const strict = isWave3IMFStrictEnabled();
    // Short-circuit for non-policy article types. For policy types, take the
    // gate from the Wave-3 flag: when enabled, IMF alone is required; when
    // disabled, the legacy OR-gate (WB OR IMF) applies.
    const bodyGateSatisfied = strict
        ? articlePolicyHasIMFEconomicEvidence(html, articleType)
        : articlePolicyHasEconomicContext(html, articleType);
    if (bodyGateSatisfied)
        return null;
    const requiredDesc = strict
        ? 'IMF economic context (Wave-3 strict)'
        : 'economic context (World Bank or IMF)';
    // Sweep sibling analysis directories: analysis/daily/{date}/{slug}*
    const analysisRoot = path.join(PROJECT_ROOT, 'analysis', 'daily', date);
    if (!fs.existsSync(analysisRoot)) {
        return `Missing required ${requiredDesc} for "${articleType}" article; analysis directory ${analysisRoot} does not exist`;
    }
    const candidates = safeReaddir(analysisRoot).filter((entry) => entry === slug || entry.startsWith(`${slug}-`) || entry.startsWith(`${slug}_`));
    for (const dirName of candidates) {
        if (directoryContainsEconomicContextFingerprint(path.join(analysisRoot, dirName), 0, strict)) {
            return null;
        }
    }
    return `Missing required ${requiredDesc} for "${articleType}" article; neither article body nor analysis files under ${analysisRoot} reference ${strict ? 'any IMF indicator or tool' : 'any World Bank or IMF indicator'}`;
}
/**
 * List directory entries, returning `[]` on any error (tolerate missing paths).
 *
 * @param dir - Directory to list
 * @returns Array of entry names or `[]` when the directory cannot be read
 */
function safeReaddir(dir) {
    try {
        return fs.readdirSync(dir);
    }
    catch {
        return [];
    }
}
/**
 * Maximum recursion depth when searching an analysis directory for economic
 * context fingerprints (World Bank OR IMF). The starting directory is
 * depth 0; the guard `depth > ANALYSIS_SEARCH_MAX_DEPTH` stops recursion
 * once it would exceed this depth. With `ANALYSIS_SEARCH_MAX_DEPTH = 3` the
 * scanner reads files at depths 0, 1, 2 and 3 — enough to cover the expected
 * layout `analysis/daily/{date}/{slug}/<subdir>/<file>.md` (depth 2) with one
 * level of tolerance for deeper run artefacts. Trees deeper than this are
 * truncated to guarantee bounded I/O during validator runs.
 */
const ANALYSIS_SEARCH_MAX_DEPTH = 3;
/**
 * Depth-limited recursive search for an economic-context fingerprint in
 * `.md` files. Uses {@link hasIMFEvidence} (and, when `strict` is `false`,
 * {@link hasWorldBankEvidence}) so the gate enforces the same strong-phrase
 * / word-bounded-indicator rule used on article bodies.
 *
 * @param dir - Directory to scan
 * @param depth - Current recursion depth (callers should omit; max is
 *   {@link ANALYSIS_SEARCH_MAX_DEPTH}, inclusive)
 * @param strict - When `true` (Wave-3 strict mode), only IMF fingerprints
 *   satisfy the gate; World Bank citations are ignored for the purpose of
 *   the economic-context check.
 * @returns `true` when at least one `.md` file contains an IMF fingerprint
 *   (or a WB fingerprint when `strict=false`).
 */
function directoryContainsEconomicContextFingerprint(dir, depth = 0, strict = false) {
    if (depth > ANALYSIS_SEARCH_MAX_DEPTH)
        return false;
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    }
    catch {
        return false;
    }
    for (const entry of entries) {
        if (entryContainsEconomicContextFingerprint(dir, entry, depth, strict))
            return true;
    }
    return false;
}
/**
 * Test a single directory entry for economic-context fingerprints, recursing
 * into subdirectories up to the shared depth cap.
 *
 * @param dir - Parent directory of `entry`
 * @param entry - Directory entry to test
 * @param depth - Current recursion depth of the caller
 * @param strict - When `true` (Wave-3 strict mode), only IMF fingerprints
 *   satisfy the gate; World Bank citations are ignored.
 * @returns `true` when this entry (or any descendant) matches a fingerprint
 */
function entryContainsEconomicContextFingerprint(dir, entry, depth, strict = false) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
        return directoryContainsEconomicContextFingerprint(full, depth + 1, strict);
    }
    if (!entry.isFile() || !entry.name.endsWith('.md'))
        return false;
    let content;
    try {
        content = fs.readFileSync(full, 'utf-8');
    }
    catch {
        return false;
    }
    return strict ? hasIMFEvidence(content) : hasWorldBankEvidence(content) || hasIMFEvidence(content);
}
/**
 * Validate a single article file and return a summary.
 *
 * @param filename - Filename of the article to validate
 * @returns Article validation summary or null if the filename does not match
 */
function validateSingleFile(filename) {
    const match = ARTICLE_FILENAME_PATTERN.exec(filename);
    if (!match)
        return null;
    const date = match[1] ?? '';
    const slug = match[2] ?? '';
    const lang = match[3] ?? '';
    const filePath = path.join(NEWS_DIR, filename);
    const html = fs.readFileSync(filePath, 'utf-8');
    const articleType = slugToArticleType(slug);
    const result = validateArticleContent(html, lang, articleType);
    // Economic context gate — accepts World Bank OR IMF evidence (Wave 2 OR-gate);
    // extends search to linked analysis markdown files.
    const econWarning = checkEconomicContextEvidence(html, articleType, date, slug);
    if (econWarning) {
        result.warnings.push(econWarning);
    }
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
    if (qualityMode) {
        summary.qualityReport = scoreArticleQuality(html, `${date}-${slug}`, lang, articleType);
    }
    return summary;
}
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
        const summary = validateSingleFile(filename);
        if (!summary)
            continue;
        if (summary.valid) {
            passed++;
        }
        else {
            failed++;
        }
        if (summary.warnings.length > 0) {
            warningCount++;
        }
        articles.push(summary);
    }
    const report = {
        totalArticles: files.length,
        passed,
        failed,
        warnings: warningCount,
        articles,
    };
    if (qualityMode) {
        report.gradeDistribution = buildGradeDistribution(articles);
    }
    return report;
}
/**
 * Build a grade distribution map from article quality reports.
 *
 * @param articles - Array of article validation summaries
 * @returns Grade distribution counts
 */
function buildGradeDistribution(articles) {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const article of articles) {
        if (article.qualityReport) {
            distribution[article.qualityReport.grade]++;
        }
    }
    return distribution;
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
    if (qualityMode) {
        console.log('  Mode: QUALITY scoring enabled');
    }
    console.log(`  Total articles:  ${report.totalArticles}`);
    console.log(`  ✅ Passed:       ${report.passed}`);
    console.log(`  ❌ Failed:       ${report.failed}`);
    console.log(`  ⚠️  With warnings: ${report.warnings}\n`);
    printFailures(report);
    printWarnings(report);
    if (qualityMode) {
        printQualityScores(report);
        printGradeDistribution(report);
    }
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
/**
 * Print quality scores for all articles (only in --quality mode).
 *
 * @param report - Validation report
 */
function printQualityScores(report) {
    const articlesWithQuality = report.articles.filter((a) => a.qualityReport);
    if (articlesWithQuality.length === 0)
        return;
    console.log('── QUALITY SCORES ────────────────────────────────────────────\n');
    for (const article of articlesWithQuality) {
        const qr = article.qualityReport;
        if (!qr)
            continue;
        const gate = qr.passesQualityGate ? '✅' : '⚠️ ';
        console.log(`  ${gate} ${article.filename} — Grade: ${qr.grade} (${qr.overallScore}/100, ${qr.wordCount} words)`);
        if (!qr.passesQualityGate && qr.recommendations.length > 0) {
            for (const rec of qr.recommendations.slice(0, 3)) {
                console.log(`       💡 ${rec}`);
            }
        }
    }
    console.log('');
}
/**
 * Print the grade distribution summary (only in --quality mode).
 *
 * @param report - Validation report
 */
function printGradeDistribution(report) {
    if (!report.gradeDistribution)
        return;
    const dist = report.gradeDistribution;
    console.log('── GRADE DISTRIBUTION ────────────────────────────────────────\n');
    console.log(`  A (≥80): ${dist['A']}   B (≥65): ${dist['B']}   C (≥40): ${dist['C']}   D (≥25): ${dist['D']}   F (<25): ${dist['F']}`);
    console.log('');
}
// ─── CLI execution ────────────────────────────────────────────────────────────
const report = validateAllArticles();
printReport(report);
if (qualityMode && outputFormat === 'json') {
    const outputPath = path.join(process.cwd(), 'quality-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📄 Quality report written to ${outputPath}`);
}
if (!dryRun && report.failed > 0) {
    console.error(`❌ Validation failed: ${report.failed} article(s) have errors`);
    process.exit(1);
}
else if (report.failed === 0) {
    console.log('✅ All articles passed validation');
}
//# sourceMappingURL=validate-articles.js.map