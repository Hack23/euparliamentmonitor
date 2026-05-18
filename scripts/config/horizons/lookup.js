// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Config/Horizons/Lookup
 * @description Helper functions for the article-horizon registry.
 *
 * Extracted from `src/config/article-horizons.ts` as part of Refactor 2/8
 * (issue Hack23/euparliamentmonitor#2030). Pure behaviour — operates only
 * on the public {@link ArticleHorizonConfig} interface, never on the
 * internal `as const` literal shape.
 *
 * @see ./registry.ts
 */
import { ArticlePerspective } from '../../types/index.js';
import { ARTICLE_HORIZONS } from './registry.js';
/**
 * Look up the horizon config for a slug. Returns `undefined` for unknown
 * slugs — callers should fall back to a generic humanise.
 *
 * @param slug - article-type slug (e.g. `quarter-ahead`)
 * @returns The matching {@link ArticleHorizonConfig} or `undefined`.
 */
export function getHorizonConfig(slug) {
    for (const cfg of Object.values(ARTICLE_HORIZONS)) {
        if (cfg.slug === slug)
            return cfg;
    }
    return undefined;
}
/**
 * Slugs of every prospective horizon (forward-looking).
 *
 * @returns Frozen array of slugs whose perspective is `PROSPECTIVE` or `ELECTORAL`
 *          with `direction: 'forward'`.
 */
export function getProspectiveSlugs() {
    return Object.freeze(Object.values(ARTICLE_HORIZONS)
        .filter((h) => h.perspective === ArticlePerspective.PROSPECTIVE ||
        (h.perspective === ArticlePerspective.ELECTORAL && h.dataWindow.direction === 'forward'))
        .map((h) => h.slug));
}
/**
 * Slugs that require electoral-overlay artifacts.
 *
 * @returns Frozen array of slugs whose `electoralOverlay` flag is true.
 */
export function getElectoralOverlaySlugs() {
    return Object.freeze(Object.values(ARTICLE_HORIZONS)
        .filter((h) => h.electoralOverlay)
        .map((h) => h.slug));
}
/**
 * Mandatory artifacts for a given slug, drawn from the registry.
 *
 * @param slug - article-type slug
 * @returns Frozen array of mandatory artifact paths, or empty when slug is unknown.
 */
export function getMandatoryArtifacts(slug) {
    const cfg = getHorizonConfig(slug);
    return cfg ? cfg.mandatoryArtifacts : [];
}
//# sourceMappingURL=lookup.js.map