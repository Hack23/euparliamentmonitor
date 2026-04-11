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

/** Injection point — insert the analysis section just before the article-nav */
const INJECTION_REGEX = /(\s*<nav\s+class="article-nav")/;

// ─── Analysis directory resolution ──────────────────────────────────────────

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
      if (match) {
        // Exact match gets suffix 0, numeric suffix gets its value, runN gets N+1000
        let suffix = 0;
        if (match[1]) {
          if (match[1].startsWith('run')) {
            suffix = parseInt(match[1].slice(3), 10) + 1000;
          } else {
            suffix = parseInt(match[1], 10);
          }
        }
        if (suffix > bestSuffix) {
          bestSuffix = suffix;
          bestPath = path.join(dateDir, entry.name);
        }
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
 * @returns Retrofit result or null if no changes needed
 */
function retrofitArticle(
  filePath: string,
  date: string,
  articleType: string,
  lang: LanguageCode,
  analysisDirPath: string,
  dryRun: boolean
): RetrofitResult | null {
  const html = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has analysis section
  if (ANALYSIS_SECTION_REGEX.test(html)) return null;

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
 * Retrofit all articles that have matching analysis directories.
 *
 * @param dryRun - If true, report what would be changed without writing
 * @returns Summary statistics
 */
export function retrofitAllArticles(dryRun: boolean = false): {
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
  let total = 0;
  let retrofitted = 0;
  let skipped = 0;
  let errors = 0;

  // Group by date+type to avoid redundant analysis dir lookups
  const articleGroups = new Map<string, { date: string; articleType: string; files: Array<{ filename: string; lang: LanguageCode }> }>();

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
    const analysisDirPath = findBestAnalysisDir(group.date, group.articleType);
    if (!analysisDirPath) continue;

    const analysisDirName = path.basename(analysisDirPath);

    for (const { filename, lang } of group.files) {
      total++;
      const filePath = path.join(newsDir, filename);

      try {
        const result = retrofitArticle(
          filePath,
          group.date,
          group.articleType,
          lang,
          analysisDirPath,
          dryRun
        );

        if (result) {
          retrofitted++;
          if (dryRun) {
            console.log(`  🔍 Would retrofit: ${filename} → ${analysisDirName} (${result.fileCount} analysis files)`);
          } else {
            console.log(`  ✅ Retrofitted: ${filename} → ${analysisDirName} (${result.fileCount} analysis files)`);
          }
        } else {
          skipped++;
        }
      } catch (err) {
        errors++;
        console.error(`  ❌ Error processing ${filename}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  return { total, retrofitted, skipped, errors };
}

// ─── CLI entry point ────────────────────────────────────────────────────────

const isDryRun = process.argv.includes('--dry-run');

console.log('');
console.log('🔗 Analysis Transparency Retrofit Tool');
console.log(`   Mode: ${isDryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be modified)'}`);
console.log('');

const result = retrofitAllArticles(isDryRun);

console.log('');
console.log('📊 Summary:');
console.log(`   Total articles with analysis dirs: ${result.total}`);
console.log(`   Retrofitted: ${result.retrofitted}`);
console.log(`   Already had section (skipped): ${result.skipped}`);
console.log(`   Errors: ${result.errors}`);
console.log('');
