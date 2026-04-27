// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Runs/Discover
 * @description Walk `analysis/daily/<date>/` recursively and return every
 * subdirectory that carries a valid `manifest.json`. Pure read-only
 * filesystem operation; no side effects beyond `fs.readdirSync` /
 * `fs.readFileSync`.
 *
 * Centralising this walk in a dedicated module deduplicates the manifest
 * reader (now backed by `aggregator/manifest`) and the `dateFromRunPath`
 * heuristic (now shared with `analysis-aggregator.guessDateFromRunDir`).
 */
import fs from 'fs';
import path from 'path';
import { readManifest, resolveArticleType, resolveDate, resolveRunId, } from '../manifest/index.js';
/**
 * Pull a `YYYY-MM-DD` date from a path segment (typically the run
 * directory). Falls back to the epoch date when no ISO date is embedded —
 * matching {@link guessDateFromRunDir} in `analysis-aggregator.ts`.
 *
 * @param p - Any path string
 * @returns ISO date string in `YYYY-MM-DD` form
 */
export function dateFromPath(p) {
    const match = /(\d{4}-\d{2}-\d{2})/.exec(p);
    return match ? (match[1] ?? '1970-01-01') : '1970-01-01';
}
/**
 * Read the manifest for a candidate run directory and return a
 * {@link DiscoveredRun} when the manifest declares a valid article type.
 *
 * @param runDir - Absolute path of the candidate directory
 * @returns A {@link DiscoveredRun}, or `null` when the manifest is missing,
 *          malformed, or its article type is `'unknown'`
 */
export function readRunCandidate(runDir) {
    const { manifest } = readManifest(runDir);
    if (!manifest)
        return null;
    const articleType = resolveArticleType(manifest);
    if (!articleType || articleType === 'unknown')
        return null;
    const date = resolveDate(manifest) ?? dateFromPath(runDir);
    const runId = resolveRunId(manifest, path.basename(runDir));
    return { runDir, articleType, date, runId };
}
/**
 * Walk `analysis/daily/` recursively and return every subdirectory that
 * contains a `manifest.json` with a non-empty, non-`unknown` `articleType`.
 *
 * The walk stops descending into a directory the moment it sees a
 * `manifest.json`, so nested artifact subdirectories never get reported
 * as separate runs. Results are sorted by date ascending then by path
 * lexically — the same order used by the legacy implementation in
 * `article-generator.ts`.
 *
 * @param repoRoot - Absolute repository root
 * @returns Sorted list of discovered runs (oldest date first, then lexical)
 */
export function discoverAnalysisRuns(repoRoot) {
    const root = path.join(repoRoot, 'analysis', 'daily');
    if (!fs.existsSync(root))
        return [];
    const results = [];
    const walk = (dir) => {
        const manifestPath = path.join(dir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
            const run = readRunCandidate(dir);
            if (run)
                results.push(run);
            return;
        }
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory())
                walk(path.join(dir, entry.name));
        }
    };
    walk(root);
    results.sort((a, b) => a.date === b.date ? a.runDir.localeCompare(b.runDir) : a.date.localeCompare(b.date));
    return results;
}
//# sourceMappingURL=discover.js.map