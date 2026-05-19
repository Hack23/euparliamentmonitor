// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
import { discoverAnalysisRuns, groupRunsForCollision } from './discovery.js';
import { sanitizeRunSuffix } from './slug.js';
import { generateArticle } from './render-one.js';
/**
 * Batch-generate articles for every discovered run. Runs that share a
 * `(date, articleType)` pair are disambiguated by appending the sanitised
 * `runId` as a slug suffix so none of the language variants are ever
 * silently overwritten.
 *
 * @param opts - CLI options (must have `all: true`)
 * @returns Per-run generation results in the order they were processed
 */
export function generateAllArticles(opts) {
    const allRuns = discoverAnalysisRuns(opts.repoRoot);
    const filtered = opts.since ? allRuns.filter((r) => r.date >= opts.since) : allRuns;
    const groups = groupRunsForCollision(filtered);
    const results = [];
    const articleCountOverride = filtered.length;
    for (const run of filtered) {
        const key = `${run.date}|${run.articleType}`;
        const bucket = groups.get(key) ?? [];
        const suffix = bucket.length > 1 ? sanitizeRunSuffix(run.runId) : undefined;
        const runOpts = { ...opts, runDir: run.runDir };
        results.push(generateArticle(runOpts, suffix, articleCountOverride));
    }
    return results;
}
//# sourceMappingURL=render-batch.js.map