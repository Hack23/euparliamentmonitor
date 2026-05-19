// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Generator/RenderBatch
 * @description Batch orchestrator that regenerates every analysis run
 * discovered under `analysis/daily/**`. Runs sharing the same
 * `(date, articleType)` pair are disambiguated by appending the
 * sanitised `runId` as a slug suffix so language variants are never
 * silently overwritten.
 */

import type { CliOptions } from './cli.js';
import { discoverAnalysisRuns, groupRunsForCollision } from './discovery.js';
import { sanitizeRunSuffix } from './slug.js';
import { generateArticle, type GenerateResult } from './render-one.js';

/**
 * Batch-generate articles for every discovered run. Runs that share a
 * `(date, articleType)` pair are disambiguated by appending the sanitised
 * `runId` as a slug suffix so none of the language variants are ever
 * silently overwritten.
 *
 * @param opts - CLI options (must have `all: true`)
 * @returns Per-run generation results in the order they were processed
 */
export function generateAllArticles(opts: CliOptions): GenerateResult[] {
  const allRuns = discoverAnalysisRuns(opts.repoRoot);
  const filtered = opts.since ? allRuns.filter((r) => r.date >= (opts.since as string)) : allRuns;
  const groups = groupRunsForCollision(filtered);
  const results: GenerateResult[] = [];
  const articleCountOverride = filtered.length;
  for (const run of filtered) {
    const key = `${run.date}|${run.articleType}`;
    const bucket = groups.get(key) ?? [];
    const suffix = bucket.length > 1 ? sanitizeRunSuffix(run.runId) : undefined;
    const runOpts: CliOptions = { ...opts, runDir: run.runDir };
    results.push(generateArticle(runOpts, suffix, articleCountOverride));
  }
  return results;
}
