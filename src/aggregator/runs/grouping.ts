// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Runs/Grouping
 * @description Pure grouping helpers used by the batch driver to detect
 * `(date, articleType)` collisions. Two runs that share both keys would
 * otherwise produce overlapping article filenames; the batch driver
 * disambiguates by appending the sanitised `runId` as a slug suffix.
 */

import type { DiscoveredRun } from './discover.js';

/**
 * Build a stable `"<date>|<articleType>"` collision key for a discovered
 * run. Exposed so callers can look up a run's group without re-importing
 * the grouping function.
 *
 * @param run - Discovered run
 * @returns Pipe-separated collision key
 */
export function collisionKey(
  run: Pick<DiscoveredRun, 'date' | 'articleType'>
): string {
  return `${run.date}|${run.articleType}`;
}

/**
 * Group discovered runs by `(date, articleType)` so callers can decide
 * whether a collision-suffix is needed when writing articles.
 *
 * Insertion order is preserved within each bucket — the batch driver
 * iterates the original `runs` list in order and looks up its own bucket
 * by key, so the collision-suffix is appended deterministically.
 *
 * @param runs - Discovered runs
 * @returns Map from `"<date>|<articleType>"` to the runs in that group
 */
export function groupRunsForCollision(
  runs: readonly DiscoveredRun[]
): Map<string, DiscoveredRun[]> {
  const groups = new Map<string, DiscoveredRun[]>();
  for (const run of runs) {
    const key = collisionKey(run);
    const bucket = groups.get(key) ?? [];
    bucket.push(run);
    groups.set(key, bucket);
  }
  return groups;
}
