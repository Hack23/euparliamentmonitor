// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Generators/Pipeline/OutputStage
 * @description File writing and metadata update pipeline stage.
 *
 * All functions accept explicit options/path arguments rather than reading
 * module-level state, so they are trivial to test in isolation.
 */

import fs from 'fs';
import path from 'path';
import type { GenerationStats, GenerationResult } from '../../types/index.js';
import { formatDateForSlug } from '../../utils/file-utils.js';
import { NEWS_DIR } from '../../constants/config.js';

// ─── Output options ───────────────────────────────────────────────────────────

/** Runtime flags that control how articles are written to disk */
export interface OutputOptions {
  /** When true no files are written (dry run mode) */
  dryRun: boolean;
  /** When true skip articles that already exist on disk */
  skipExisting: boolean;
  /** Absolute path to the news output directory */
  newsDir: string;
}

// ─── File-write helpers ───────────────────────────────────────────────────────

/** Log prefix for write operations */
const DRY_RUN_PREFIX = '  [DRY RUN]';

/**
 * Write a single HTML file to the news directory.
 *
 * Respects `dryRun` and `skipExisting` flags: returns `false` without writing
 * in either case.
 *
 * @param html - Full HTML content to write
 * @param filename - Target filename (relative to `options.newsDir`)
 * @param options - Output flags and directory path
 * @returns `true` when the file was actually written
 */
export function writeArticleFile(html: string, filename: string, options: OutputOptions): boolean {
  const filepath = path.join(options.newsDir, filename);

  if (options.skipExisting && fs.existsSync(filepath)) {
    if (options.dryRun) {
      console.log(`${DRY_RUN_PREFIX} Would skip (already exists): ${filename}`);
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${filename}`);
    }
    return false;
  }

  if (options.dryRun) {
    console.log(`${DRY_RUN_PREFIX} Would write: ${filename}`);
    return false;
  }

  fs.writeFileSync(filepath, html, 'utf-8');
  console.log(`  ✅ Wrote: ${filename}`);
  return true;
}

/**
 * Write a language-specific article file and update the generation stats.
 *
 * @param html - Full HTML content to write
 * @param slug - Article slug (e.g. `"2025-01-15-week-ahead"`)
 * @param lang - Language code suffix (e.g. `"en"`)
 * @param options - Output flags and directory path
 * @param stats - Mutable stats object to increment counters on
 * @returns `true` when the file was actually written
 */
export function writeSingleArticle(
  html: string,
  slug: string,
  lang: string,
  options: OutputOptions,
  stats: GenerationStats
): boolean {
  const filename = `${slug}-${lang}.html`;
  const written = writeArticleFile(html, filename, options);

  if (written) {
    stats.generated += 1;
    stats.articles.push(filename);
  } else if (options.skipExisting && fs.existsSync(path.join(options.newsDir, filename))) {
    stats.skipped += 1;
  } else if (options.dryRun) {
    stats.dryRun += 1;
  }

  return written;
}

/**
 * Persist a generation metadata JSON file to the metadata directory.
 * If a metadata file already exists for today, merges the current run's stats
 * and results with the existing ones so multiple workflow runs on the same day
 * do not overwrite each other's data.
 * Skips writing when `dryRun` is true.
 *
 * @param stats - Final generation statistics
 * @param results - Per-article-type generation results
 * @param usedMCP - Whether the MCP client was connected during this run
 * @param metadataDir - Absolute path to the metadata output directory
 * @param dryRun - When true the file is not written
 */
export function writeGenerationMetadata(
  stats: GenerationStats,
  results: GenerationResult[],
  usedMCP: boolean,
  metadataDir: string,
  dryRun: boolean
): void {
  if (dryRun) return;

  const metadataPath = path.join(metadataDir, `generation-${formatDateForSlug()}.json`);

  // Merge with existing metadata when another workflow already ran today
  let mergedStats = { ...stats };
  let mergedResults = [...results];
  let mergedUsedMCP = usedMCP;

  if (fs.existsSync(metadataPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as {
        generated?: number | undefined;
        skipped?: number | undefined;
        dryRun?: number | undefined;
        errors?: number | undefined;
        articles?: string[] | undefined;
        results?: GenerationResult[] | undefined;
        usedMCP?: boolean | undefined;
      };

      // Accumulate counters from both runs
      mergedStats = {
        ...mergedStats,
        generated: (existing.generated ?? 0) + stats.generated,
        skipped: (existing.skipped ?? 0) + stats.skipped,
        dryRun: (existing.dryRun ?? 0) + stats.dryRun,
        errors: (existing.errors ?? 0) + stats.errors,
        // Merge article lists, removing any duplicates
        articles: [...new Set([...(existing.articles ?? []), ...stats.articles])],
      };

      // Keep prior results; append new ones (dedup by slug if present)
      const existingResults: GenerationResult[] = existing.results ?? [];
      const newSlugs = new Set(results.map((r) => r.slug).filter(Boolean));
      const priorResults = existingResults.filter((r) => !newSlugs.has(r.slug));
      const combinedResults = [...priorResults, ...results];

      // Additionally de-duplicate entries that do not have a slug by using a
      // stable structural key (JSON representation). This prevents repeated
      // same-day runs from accumulating duplicate slug-less error entries.
      const seenAnonymousKeys = new Set<string>();
      mergedResults = combinedResults.filter((result) => {
        if (result.slug) {
          return true;
        }
        const key = JSON.stringify(result);
        if (seenAnonymousKeys.has(key)) {
          return false;
        }
        seenAnonymousKeys.add(key);
        return true;
      });
      // usedMCP is true if either run connected to MCP
      mergedUsedMCP = mergedUsedMCP || (existing.usedMCP ?? false);
    } catch {
      // If the existing file is malformed, proceed with current run's data only
    }
  }

  const metadata = {
    timestamp: mergedStats.timestamp,
    generated: mergedStats.generated,
    skipped: mergedStats.skipped,
    dryRun: mergedStats.dryRun,
    errors: mergedStats.errors,
    articles: mergedStats.articles,
    results: mergedResults,
    usedMCP: mergedUsedMCP,
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`📝 Metadata written to: ${metadataPath}`);
}

// ─── Intelligence Index update helpers ───────────────────────────────────────

import type { ArticleIndexEntry, IntelligenceIndex } from '../../types/intelligence.js';
import {
  addArticleToIndex,
  detectTrends,
  saveIntelligenceIndex,
} from '../../utils/intelligence-index.js';

/** Default path for the intelligence index file */
const DEFAULT_INTELLIGENCE_INDEX_PATH = path.join(NEWS_DIR, 'intelligence-index.json');

/**
 * Add a newly generated article entry to the intelligence index and refresh
 * trend detections.
 *
 * @param index - The current intelligence index
 * @param entry - The article index entry to add
 * @returns Updated intelligence index with refreshed trends
 */
export function updateIndexWithArticle(
  index: IntelligenceIndex,
  entry: ArticleIndexEntry
): IntelligenceIndex {
  const updated = addArticleToIndex(index, entry);
  const trends = detectTrends(updated);
  return { ...updated, trends, lastUpdated: new Date().toISOString() };
}

/**
 * Persist the intelligence index to disk after article generation.
 *
 * @param index - Intelligence index to save
 * @param indexPath - Path to write the index JSON file
 */
export function saveUpdatedIndex(
  index: IntelligenceIndex,
  indexPath: string = DEFAULT_INTELLIGENCE_INDEX_PATH
): void {
  saveIntelligenceIndex(index, indexPath);
  console.log(
    `  🧠 Intelligence index saved: ${index.articles.length} articles, ${index.trends.length} trends`
  );
}
