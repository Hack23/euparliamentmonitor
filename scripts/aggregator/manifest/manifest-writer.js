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
 * article-horizons registry. No-op (returns the manifest unchanged) when:
 *   - the manifest has no resolvable article type, OR
 *   - the slug is legacy / unknown (no registry entry).
 *
 * The function is pure — the input manifest is never mutated. Callers that
 * need to overwrite an existing `horizonProfile` should pass `{ overwrite:
 * true }`; the default keeps a manifest-supplied value (rare, but allowed
 * for forward-compat).
 *
 * @param manifest - Manifest to enrich.
 * @param options - Behaviour options.
 * @param options.overwrite - When `true`, replaces any existing
 *                            `horizonProfile`. Default `false`.
 * @returns A new manifest with `horizonProfile` set, or the original
 *          manifest reference when no enrichment applies.
 */
export function applyHorizonProfile(manifest, options = {}) {
    if (manifest.horizonProfile && !options.overwrite)
        return manifest;
    const articleType = resolveArticleType(manifest);
    const profile = buildHorizonProfile(articleType);
    if (!profile)
        return manifest;
    return { ...manifest, horizonProfile: profile };
}
//# sourceMappingURL=manifest-writer.js.map