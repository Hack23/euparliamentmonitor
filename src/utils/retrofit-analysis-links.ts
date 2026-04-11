// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/RetrofitAnalysisLinks
 * @description Retroactively injects analysis transparency sections into existing
 * news articles that have matching analysis directories on disk but lack the
 * `<section class="analysis-transparency">` section.
 *
 * This tool scans all articles in `news/`, matches them against available analysis
 * directories under `analysis/daily/{date}/{type}*`, discovers all `.md` analysis
 * files on disk, and injects the rendered section before the `<nav class="article-nav">`
 * element.
 *
 * Usage: npx tsx src/utils/retrofit-analysis-links.ts [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN } from '../constants/config.js';
import { ALL_LANGUAGES } from '../constants/language-core.js';
import type { LanguageCode } from '../types/index.js';
import { discoverAnalysisFileEntries } from './file-utils.js';
import { renderAnalysisTransparencySection } from '../templates/article-template.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const ANALYSIS_BASE_DIR = 'analysis/daily';

/** Regex to detect analysis transparency section already present */
const ANALYSIS_SECTION_REGEX = /<section\s+class="analysis-transparency"/;

/** Regex to match the full analysis transparency section for replacement */
const ANALYSIS_SECTION_FULL_REGEX =
  /\s*<section\s+class="analysis-transparency"[\s\S]*?<\/section>/;

/** Injection point — insert the analysis section just before the article-nav */
const INJECTION_REGEX = /(\s*<nav\s+class="article-nav")/;

// ─── Analysis directory resolution ──────────────────────────────────────────

/**
 * Parse a directory suffix into a numeric priority.
 * Exact match (no suffix) = 0, numeric suffix = its value, runN = N+1000.
 *
 * @param suffixStr - The suffix string from the regex capture, or undefined
 * @returns Numeric priority value
 */
function parseSuffixPriority(suffixStr: string | undefined): number {
  if (!suffixStr) return 0;
  if (suffixStr.startsWith('run')) {
    return parseInt(suffixStr.slice(3), 10) + 1000;
  }
  return parseInt(suffixStr, 10);
}

/**
 * Find the best matching analysis directory for a given date and article type.
 *
 * Checks for exact match first (e.g. `propositions`), then scans for suffixed
 * variants (e.g. `propositions-2`, `propositions-run12`) and returns the one
 * with the highest suffix number.
 *
 * @param date - Article date (YYYY-MM-DD)
 * @param articleType - Article type slug (e.g. 'committee-reports')
 * @returns Absolute path to the best matching analysis directory, or null
 */
function findBestAnalysisDir(date: string, articleType: string): string | null {
  const dateDir = path.resolve(ANALYSIS_BASE_DIR, date);
  if (!fs.existsSync(dateDir)) return null;

  try {
    const entries = fs.readdirSync(dateDir, { withFileTypes: true });
    const escaped = articleType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escaped}(?:-(\\d+|run\\d+))?$`);

    let bestPath: string | null = null;
    let bestSuffix = -1;

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const match = pattern.exec(entry.name);
      if (!match) continue;
      const suffix = parseSuffixPriority(match[1]);
      if (suffix > bestSuffix) {
        bestSuffix = suffix;
        bestPath = path.join(dateDir, entry.name);
      }
    }

    return bestPath;
  } catch {
    return null;
  }
}

// ─── Article parsing ────────────────────────────────────────────────────────

/**
 * Parse a news article filename into its components.
 *
 * @param filename - Filename like '2026-04-01-propositions-en.html'
 * @returns Parsed components or null if filename doesn't match
 */
function parseArticleComponents(
  filename: string
): { date: string; articleType: string; lang: LanguageCode } | null {
  const match = ARTICLE_FILENAME_PATTERN.exec(filename);
  if (!match?.[1] || !match[2] || !match[3]) return null;

  const date = match[1];
  const articleType = match[2];
  const lang = match[3] as LanguageCode;

  if (!ALL_LANGUAGES.includes(lang)) return null;
  return { date, articleType, lang };
}

// ─── Retrofit logic ─────────────────────────────────────────────────────────

interface RetrofitResult {
  readonly file: string;
  readonly analysisDir: string;
  readonly fileCount: number;
}

/**
 * Retrofit a single article file with an analysis transparency section.
 *
 * @param filePath - Absolute path to the article HTML file
 * @param date - Article date
 * @param articleType - Article type slug
 * @param lang - Language code
 * @param analysisDirPath - Absolute path to the analysis directory
 * @param dryRun - If true, don't write changes
 * @param force - If true, replace existing analysis sections
 * @returns Retrofit result or null if no changes needed
 */
function retrofitArticle(
  filePath: string,
  date: string,
  articleType: string,
  lang: LanguageCode,
  analysisDirPath: string,
  dryRun: boolean,
  force: boolean
): RetrofitResult | null {
  let html = fs.readFileSync(filePath, 'utf-8');

  const hasExisting = ANALYSIS_SECTION_REGEX.test(html);

  // Skip if already has analysis section (unless force mode)
  if (hasExisting && !force) return null;

  // In force mode, remove existing section before re-injecting
  if (hasExisting && force) {
    html = html.replace(ANALYSIS_SECTION_FULL_REGEX, '');
  }

  // Find the injection point
  const injectionMatch = INJECTION_REGEX.exec(html);
  if (!injectionMatch) {
    console.warn(`  ⚠️  No injection point found in ${path.basename(filePath)}`);
    return null;
  }

  // Discover analysis files on disk
  const analysisFiles = discoverAnalysisFileEntries(analysisDirPath);
  const analysisDirName = path.basename(analysisDirPath);

  // Render the analysis section
  const sectionHtml = renderAnalysisTransparencySection(
    date,
    articleType,
    lang,
    analysisDirName,
    analysisFiles.length > 0 ? analysisFiles : undefined
  );

  // Inject before the article-nav
  const injectionIndex = injectionMatch.index;
  const newHtml =
    html.slice(0, injectionIndex) +
    '\n    ' +
    sectionHtml.trim() +
    '\n    ' +
    html.slice(injectionIndex);

  if (!dryRun) {
    fs.writeFileSync(filePath, newHtml, 'utf-8');
  }

  return {
    file: path.basename(filePath),
    analysisDir: analysisDirName,
    fileCount: analysisFiles.length,
  };
}

// ─── Main execution ─────────────────────────────────────────────────────────

/**
 * Log the result of a single article retrofit operation.
 *
 * @param result - The retrofit result, or null if skipped
 * @param filename - Article filename
 * @param analysisDirName - Analysis directory name
 * @param dryRun - Whether this is a dry run
 */
function logRetrofitResult(
  result: RetrofitResult | null,
  filename: string,
  analysisDirName: string,
  dryRun: boolean
): void {
  if (!result) return;
  const prefix = dryRun ? '🔍 Would retrofit' : '✅ Retrofitted';
  console.log(`  ${prefix}: ${filename} → ${analysisDirName} (${result.fileCount} analysis files)`);
}

/**
 * Process a single article group (one date+type with all its language variants).
 *
 * @param group - The article group containing date, type, and language variants
 * @param group.date - Article date
 * @param group.articleType - Article type slug
 * @param group.files - Array of filename + language code tuples
 * @param newsDir - Absolute path to the news directory
 * @param dryRun - Whether to skip writing changes
 * @param force - Whether to replace existing analysis sections
 * @returns Count of retrofitted, skipped, and errored articles
 */
function processArticleGroup(
  group: {
    date: string;
    articleType: string;
    files: Array<{ filename: string; lang: LanguageCode }>;
  },
  newsDir: string,
  dryRun: boolean,
  force: boolean
): { total: number; retrofitted: number; skipped: number; errors: number } {
  const analysisDirPath = findBestAnalysisDir(group.date, group.articleType);
  if (!analysisDirPath) return { total: 0, retrofitted: 0, skipped: 0, errors: 0 };

  const analysisDirName = path.basename(analysisDirPath);
  let total = 0;
  let retrofitted = 0;
  let skipped = 0;
  let errors = 0;

  for (const { filename, lang } of group.files) {
    total++;
    try {
      const result = retrofitArticle(
        path.join(newsDir, filename),
        group.date,
        group.articleType,
        lang,
        analysisDirPath,
        dryRun,
        force
      );
      if (result) {
        retrofitted++;
        logRetrofitResult(result, filename, analysisDirName, dryRun);
      } else {
        skipped++;
      }
    } catch (err) {
      errors++;
      console.error(
        `  ❌ Error processing ${filename}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return { total, retrofitted, skipped, errors };
}

/**
 * Retrofit all articles that have matching analysis directories.
 *
 * @param dryRun - If true, report what would be changed without writing
 * @param force - If true, replace existing analysis sections
 * @returns Summary statistics
 */
export function retrofitAllArticles(
  dryRun: boolean = false,
  force: boolean = false
): {
  total: number;
  retrofitted: number;
  skipped: number;
  errors: number;
} {
  const newsDir = path.resolve(NEWS_DIR);
  if (!fs.existsSync(newsDir)) {
    console.log('📁 News directory does not exist');
    return { total: 0, retrofitted: 0, skipped: 0, errors: 0 };
  }

  const files = fs.readdirSync(newsDir).filter((f) => f.endsWith('.html'));
  const counts = { total: 0, retrofitted: 0, skipped: 0, errors: 0 };

  // Group by date+type to avoid redundant analysis dir lookups
  const articleGroups = new Map<
    string,
    { date: string; articleType: string; files: Array<{ filename: string; lang: LanguageCode }> }
  >();

  for (const filename of files) {
    const parsed = parseArticleComponents(filename);
    if (!parsed) continue;

    const key = `${parsed.date}/${parsed.articleType}`;
    const group = articleGroups.get(key);
    if (group) {
      group.files.push({ filename, lang: parsed.lang });
    } else {
      articleGroups.set(key, {
        date: parsed.date,
        articleType: parsed.articleType,
        files: [{ filename, lang: parsed.lang }],
      });
    }
  }

  for (const [, group] of articleGroups) {
    const groupResult = processArticleGroup(group, newsDir, dryRun, force);
    counts.total += groupResult.total;
    counts.retrofitted += groupResult.retrofitted;
    counts.skipped += groupResult.skipped;
    counts.errors += groupResult.errors;
  }

  return counts;
}

// ─── CLI entry point ────────────────────────────────────────────────────────

const isDryRun = process.argv.includes('--dry-run');
const isForce = process.argv.includes('--force');

console.log('');
console.log('🔗 Analysis Transparency Retrofit Tool');
console.log(
  `   Mode: ${isDryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be modified)'}${isForce ? ' [FORCE: replacing existing sections]' : ''}`
);
console.log('');

const result = retrofitAllArticles(isDryRun, isForce);

console.log('');
console.log('📊 Summary:');
console.log(`   Total articles with analysis dirs: ${result.total}`);
console.log(`   Retrofitted: ${result.retrofitted}`);
console.log(`   Already had section (skipped): ${result.skipped}`);
console.log(`   Errors: ${result.errors}`);
console.log('');
