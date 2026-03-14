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
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN } from '../constants/config.js';
import { validateArticleContent } from './content-validator.js';
import { scoreArticleQuality } from './article-quality-scorer.js';
import type { ArticleQualityReport, ArticleGrade } from '../types/quality.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Validation summary for a single article */
interface ArticleValidationSummary {
  filename: string;
  lang: string;
  slug: string;
  date: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  wordCount: number;
  qualityReport?: ArticleQualityReport;
}

/** Overall validation report */
interface ValidationReport {
  totalArticles: number;
  passed: number;
  failed: number;
  warnings: number;
  articles: ArticleValidationSummary[];
  gradeDistribution?: Record<ArticleGrade, number>;
}

// ─── CLI argument parsing ─────────────────────────────────────────────────────

const args = process.argv.slice(2);

/**
 * Extract a CLI flag value: --flag=value
 *
 * @param name - Flag name to extract
 * @returns Flag value or undefined if not found
 */
function getArg(name: string): string | undefined {
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
function slugToArticleType(slug: string): string {
  const mapping: Record<string, string> = {
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
 * Validate a single article file and return a summary.
 *
 * @param filename - Filename of the article to validate
 * @returns Article validation summary or null if the filename does not match
 */
function validateSingleFile(filename: string): ArticleValidationSummary | null {
  // Reset lastIndex to avoid stateful regex issues when the pattern has g/y flags
  ARTICLE_FILENAME_PATTERN.lastIndex = 0;
  const match = ARTICLE_FILENAME_PATTERN.exec(filename);
  if (!match) return null;

  const date = match[1] ?? '';
  const slug = match[2] ?? '';
  const lang = match[3] ?? '';
  const filePath = path.join(NEWS_DIR, filename);
  const html = fs.readFileSync(filePath, 'utf-8');
  const articleType = slugToArticleType(slug);

  const result = validateArticleContent(html, lang, articleType);

  const summary: ArticleValidationSummary = {
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
    summary.qualityReport = scoreArticleQuality(html, filename, lang, articleType);
  }

  return summary;
}

/**
 * Validate all news articles in the news directory.
 *
 * @returns Validation report with per-article summaries
 */
function validateAllArticles(): ValidationReport {
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

  const articles: ArticleValidationSummary[] = [];
  let passed = 0;
  let failed = 0;
  let warningCount = 0;

  for (const filename of files) {
    const summary = validateSingleFile(filename);
    if (!summary) continue;

    if (summary.valid) {
      passed++;
    } else {
      failed++;
    }
    if (summary.warnings.length > 0) {
      warningCount++;
    }
    articles.push(summary);
  }

  const report: ValidationReport = {
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
function buildGradeDistribution(articles: ArticleValidationSummary[]): Record<ArticleGrade, number> {
  const distribution: Record<ArticleGrade, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
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
function printReport(report: ValidationReport): void {
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
function printFailures(report: ValidationReport): void {
  const failures = report.articles.filter((a) => !a.valid);
  if (failures.length === 0) return;

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
function printWarnings(report: ValidationReport): void {
  const withWarnings = report.articles.filter((a) => a.valid && a.warnings.length > 0);
  if (withWarnings.length === 0) return;

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
function printQualityScores(report: ValidationReport): void {
  const articlesWithQuality = report.articles.filter((a) => a.qualityReport);
  if (articlesWithQuality.length === 0) return;

  console.log('── QUALITY SCORES ────────────────────────────────────────────\n');
  for (const article of articlesWithQuality) {
    const qr = article.qualityReport;
    if (!qr) continue;
    const gate = qr.passesQualityGate ? '✅' : '⚠️ ';
    console.log(
      `  ${gate} ${article.filename} — Grade: ${qr.grade} (${qr.overallScore}/100, ${qr.wordCount} words)`
    );
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
function printGradeDistribution(report: ValidationReport): void {
  if (!report.gradeDistribution) return;
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
} else if (report.failed === 0) {
  console.log('✅ All articles passed validation');
}
