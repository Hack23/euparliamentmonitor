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
import { formatDateForSlug } from '../../utils/file-utils.js';
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
export function writeArticleFile(html, filename, options) {
    const filepath = path.join(options.newsDir, filename);
    if (options.skipExisting && fs.existsSync(filepath)) {
        if (options.dryRun) {
            console.log(`${DRY_RUN_PREFIX} Would skip (already exists): ${filename}`);
        }
        else {
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
export function writeSingleArticle(html, slug, lang, options, stats) {
    const filename = `${slug}-${lang}.html`;
    const written = writeArticleFile(html, filename, options);
    if (written) {
        stats.generated += 1;
        stats.articles.push(filename);
    }
    else if (options.skipExisting && fs.existsSync(path.join(options.newsDir, filename))) {
        stats.skipped += 1;
    }
    else if (options.dryRun) {
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
export function writeGenerationMetadata(stats, results, usedMCP, metadataDir, dryRun) {
    if (dryRun)
        return;
    const metadataPath = path.join(metadataDir, `generation-${formatDateForSlug()}.json`);
    // Merge with existing metadata when another workflow already ran today
    let mergedStats = { ...stats };
    let mergedResults = [...results];
    let mergedUsedMCP = usedMCP;
    if (fs.existsSync(metadataPath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
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
            const existingResults = existing.results ?? [];
            const newSlugs = new Set(results.map((r) => r.slug).filter(Boolean));
            const priorResults = existingResults.filter((r) => !newSlugs.has(r.slug));
            mergedResults = [...priorResults, ...results];
            // usedMCP is true if either run connected to MCP
            mergedUsedMCP = mergedUsedMCP || (existing.usedMCP ?? false);
        }
        catch {
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
//# sourceMappingURL=output-stage.js.map