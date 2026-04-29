// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/** Sentinel used when no schema variant supplies a usable article type. */
export const UNKNOWN_ARTICLE_TYPE = 'unknown';
/**
 * Resolve the article-type slug from a manifest, tolerating historic schemas.
 *
 * Resolution order (highest precedence first):
 *   1. `articleType` — canonical singular field
 *   2. `articleTypes[0]` — pre-aggregator-pipeline plural array
 *   3. `runType` — historic field on older breaking-run manifests
 *
 * Falls back to `'unknown'` when none of the above is a non-empty string.
 *
 * @param manifest - Parsed manifest (any of the supported schemas)
 * @returns Article-type slug usable as a filename component
 */
export function resolveArticleType(manifest) {
    if (typeof manifest.articleType === 'string' && manifest.articleType) {
        return manifest.articleType;
    }
    const first = manifest.articleTypes?.[0];
    if (typeof first === 'string' && first) {
        return first;
    }
    if (typeof manifest.runType === 'string' && manifest.runType) {
        return manifest.runType;
    }
    return UNKNOWN_ARTICLE_TYPE;
}
/**
 * Resolve the run-id from a manifest, falling back to a caller-provided
 * default (typically the run-directory basename) when the manifest carries
 * neither a string nor a numeric `runId`.
 *
 * @param manifest - Parsed manifest
 * @param fallback - Default returned when `runId` is missing or non-string
 * @returns Best-effort run identifier
 */
export function resolveRunId(manifest, fallback) {
    if (typeof manifest.runId === 'string' && manifest.runId) {
        return manifest.runId;
    }
    if (typeof manifest.runId === 'number') {
        return String(manifest.runId);
    }
    return fallback;
}
/**
 * Resolve the ISO date for a manifest, accepting only a strictly-formed
 * `YYYY-MM-DD` value. Returns `undefined` when the manifest has no usable
 * date so callers can fall through to a path-based heuristic.
 *
 * @param manifest - Parsed manifest
 * @returns Strict ISO date or `undefined`
 */
export function resolveDate(manifest) {
    const candidate = typeof manifest.date === 'string' ? manifest.date : '';
    return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : undefined;
}
/**
 * Pick the latest non-`PENDING` `gateResult` from `manifest.history[]`,
 * falling back to `'PENDING'` when no closed gate is recorded.
 *
 * @param manifest - Parsed manifest
 * @returns Latest non-PENDING gate result, or `'PENDING'`
 */
export function latestGateResult(manifest) {
    const history = manifest.history ?? [];
    for (let i = history.length - 1; i >= 0; i--) {
        const entry = history[i];
        const gr = entry?.gateResult;
        if (gr && gr !== 'PENDING')
            return gr;
    }
    return 'PENDING';
}
/**
 * Extract every string entry from a single `files` value (which may be an
 * array of strings or a `path → description` object).
 *
 * @param value - One value from `Object.values(files)`
 * @returns Strings contained within, or `[]` when the shape is unknown
 */
function extractFileEntries(value) {
    if (Array.isArray(value)) {
        return value.filter((e) => typeof e === 'string');
    }
    if (value && typeof value === 'object') {
        return Object.keys(value);
    }
    return [];
}
/**
 * Normalise `manifest.files` into a flat list of `runRelPath` strings.
 *
 * De-duplicates while preserving first-seen order so callers downstream
 * (the aggregator's `availableSet`, `materialiseManifestFiles`, etc.)
 * never observe the same path twice when a manifest section accidentally
 * lists it under two top-level keys.
 *
 * @param files - Manifest `files` section (nested or flat)
 * @returns De-duplicated, first-seen-ordered list of run-relative artifact paths
 */
export function flattenManifestFiles(files) {
    if (!files)
        return [];
    const seen = new Set();
    const out = [];
    for (const value of Object.values(files)) {
        for (const entry of extractFileEntries(value)) {
            if (seen.has(entry))
                continue;
            seen.add(entry);
            out.push(entry);
        }
    }
    return out;
}
//# sourceMappingURL=resolver.js.map