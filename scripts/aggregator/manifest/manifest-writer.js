// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Manifest/Writer
 * @description Helpers that mutate or enrich an in-memory {@link Manifest}
 * before it is serialised to `manifest.json`. The current writer surface is
 * intentionally narrow — it only owns the {@link HorizonProfile} bucket
 * derived from the canonical article-horizons registry. Workflows still
 * write the rest of the manifest (articleType, runId, history) directly
 * through `mergeManifestHistory` and equivalent shell helpers.
 */
import { getHorizonConfig } from '../../config/article-horizons.js';
import { resolveArticleType } from './resolver.js';
/**
 * Build a {@link HorizonProfile} for the given article-type slug from the
 * canonical {@link import('../../config/article-horizons.js').ARTICLE_HORIZONS}
 * registry.
 *
 * `horizonDays` derivation:
 *  - `forward` / `backward` → `dataWindow.days`
 *  - `span` / `point`        → `forwardStatementsHorizonDays` (covers
 *    `election-cycle` → 1825, `breaking` → 0, etc.)
 *  - When `dataWindow.days` is absent (e.g. `point`) the
 *    `forwardStatementsHorizonDays` fallback applies regardless of direction.
 *
 * @param articleType - Article-type slug (e.g. `month-ahead`,
 *                      `election-cycle`). Legacy / unknown slugs return
 *                      `undefined` so the manifest writer treats them as
 *                      no-ops.
 * @returns The matching {@link HorizonProfile}, or `undefined` when the
 *          slug does not resolve to a registry entry.
 */
export function buildHorizonProfile(articleType) {
    if (!articleType)
        return undefined;
    const cfg = getHorizonConfig(articleType);
    if (!cfg)
        return undefined;
    const { direction, days } = cfg.dataWindow;
    const useFallback = direction === 'span' || direction === 'point' || days === undefined;
    const horizonDays = useFallback ? cfg.forwardStatementsHorizonDays : days;
    return Object.freeze({
        horizonDays,
        electoralOverlay: cfg.electoralOverlay,
    });
}
/**
 * Return a copy of the manifest with `horizonProfile` populated from the
 * article-horizons registry.
 *
 * Behaviour matrix:
 *   - Slug resolves to a registry entry → `horizonProfile` is set from
 *     {@link buildHorizonProfile}.
 *   - Slug is legacy / unknown (no registry entry) AND `overwrite` is
 *     `true` → any existing `horizonProfile` is **stripped** so the
 *     "absent for unknown slugs" invariant holds even when the registry
 *     evolves (e.g. a slug is removed) or a manifest carries a stale
 *     value from a previous registry version.
 *   - Slug is legacy / unknown AND `overwrite` is `false` → no-op.
 *   - An existing `horizonProfile` is present AND `overwrite` is `false`
 *     → no-op (forward-compat: respect a manifest-supplied value).
 *
 * The function is pure — the input manifest is never mutated.
 *
 * @param manifest - Manifest to enrich.
 * @param options - Behaviour options.
 * @param options.overwrite - When `true`, replaces (or strips) any
 *                            existing `horizonProfile`. Default `false`.
 * @returns A new manifest with `horizonProfile` set or removed, or the
 *          original manifest reference when no change applies.
 */
export function applyHorizonProfile(manifest, options = {}) {
    if (manifest.horizonProfile && !options.overwrite)
        return manifest;
    const articleType = resolveArticleType(manifest);
    const profile = buildHorizonProfile(articleType);
    if (!profile) {
        // Slug is legacy / unknown. With overwrite=true we must actively
        // strip any stale `horizonProfile` to honour the documented
        // "absent for unknown slugs" invariant.
        if (options.overwrite && manifest.horizonProfile) {
            const { horizonProfile: _stale, ...rest } = manifest;
            return rest;
        }
        return manifest;
    }
    return { ...manifest, horizonProfile: profile };
}
//# sourceMappingURL=manifest-writer.js.map