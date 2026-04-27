// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * Build a stable `"<date>|<articleType>"` collision key for a discovered
 * run. Exposed so callers can look up a run's group without re-importing
 * the grouping function.
 *
 * @param run - Discovered run
 * @returns Pipe-separated collision key
 */
export function collisionKey(run) {
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
export function groupRunsForCollision(runs) {
    const groups = new Map();
    for (const run of runs) {
        const key = collisionKey(run);
        const bucket = groups.get(key) ?? [];
        bucket.push(run);
        groups.set(key, bucket);
    }
    return groups;
}
//# sourceMappingURL=grouping.js.map