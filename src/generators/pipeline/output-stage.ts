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
import { formatDateForSlug, atomicWrite, resolveUniqueFilePath } from '../../utils/file-utils.js';

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
 * Respects `dryRun` and `skipExisting` flags: returns `null` without writing
 * in either case.
 *
 * When suffix-based deduplication activates (file already exists and
 * `skipExisting` is false), the returned filename reflects the actual
 * written path (e.g. `"slug-en-2.html"`) so callers can record the
 * correct filename in stats/metadata.
 *
 * @param html - Full HTML content to write
 * @param filename - Target filename (relative to `options.newsDir`)
 * @param options - Output flags and directory path
 * @returns The basename of the actually-written file, or `null` when nothing was written
 */
export function writeArticleFile(
  html: string,
  filename: string,
  options: OutputOptions
): string | null {
  const filepath = path.join(options.newsDir, filename);

  if (options.skipExisting && fs.existsSync(filepath)) {
    if (options.dryRun) {
      console.log(`${DRY_RUN_PREFIX} Would skip (already exists): ${filename}`);
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${filename}`);
    }
    return null;
  }

  if (options.dryRun) {
    console.log(`${DRY_RUN_PREFIX} Would write: ${filename}`);
    return null;
  }

  // When not in skip mode: resolve a unique path to avoid overwriting
  // existing articles from prior workflow runs on the same date.
  const uniquePath = resolveUniqueFilePath(filepath);
  atomicWrite(uniquePath, html);
  const writtenName = path.basename(uniquePath);
  if (writtenName !== filename) {
    console.log(`  ✅ Wrote: ${writtenName} (unique — original ${filename} already existed)`);
  } else {
    console.log(`  ✅ Wrote: ${filename}`);
  }
  return writtenName;
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
  const writtenName = writeArticleFile(html, filename, options);

  if (writtenName !== null) {
    stats.generated += 1;
    stats.articles.push(writtenName);
  } else if (options.skipExisting && fs.existsSync(path.join(options.newsDir, filename))) {
    stats.skipped += 1;
  } else if (options.dryRun) {
    stats.dryRun += 1;
  }

  return writtenName !== null;
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

  atomicWrite(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`📝 Metadata written to: ${metadataPath}`);
}
