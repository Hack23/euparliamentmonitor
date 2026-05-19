// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Generator/Discovery
 * @description Discovery + collision-grouping for analysis runs. Thin
 * re-exports of the canonical implementations in
 * `aggregator/runs/index.js`, kept here so the article-generator
 * library API remains stable for downstream importers.
 */
import { discoverAnalysisRuns as _discoverAnalysisRuns, groupRunsForCollision as _groupRunsForCollision, } from '../runs/index.js';
/**
 * Walk `analysis/daily/` recursively and return every subdirectory that
 * contains a `manifest.json` with a non-empty, non-`unknown` `articleType`.
 *
 * Thin re-export of {@link _discoverAnalysisRuns} from
 * `aggregator/runs/index.js`.
 *
 * @param repoRoot - Absolute repository root
 * @returns Sorted list of discovered runs (oldest date first, then lexical)
 */
export function discoverAnalysisRuns(repoRoot) {
    return _discoverAnalysisRuns(repoRoot);
}
/**
 * Group discovered runs by `(date, articleType)` so callers can decide
 * whether a collision-suffix is needed when writing articles.
 *
 * Thin re-export of {@link _groupRunsForCollision} from
 * `aggregator/runs/index.js`.
 *
 * @param runs - Discovered runs
 * @returns Map from `"<date>|<articleType>"` to the runs in that group
 */
export function groupRunsForCollision(runs) {
    return _groupRunsForCollision(runs);
}
//# sourceMappingURL=discovery.js.map