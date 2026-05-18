// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config/ArticleHorizons
 * @description Thin re-export barrel for the article-horizon registry.
 *
 * The original 603-LOC file was split into focused, single-responsibility
 * modules under `./horizons/` as part of Refactor 2/8
 * (issue Hack23/euparliamentmonitor#2030):
 *
 *  | Module | Contents |
 *  |---|---|
 *  | {@link ./horizons/types.ts}             | `ArticleHorizonConfig` and supporting types |
 *  | {@link ./horizons/artifact-paths.ts}    | Artifact-path constants + shared mandatory lists |
 *  | {@link ./horizons/stage-budgets.ts}     | Shared stage-budget shapes + per-slug PR-call deadlines |
 *  | {@link ./horizons/forward-projection.ts}| Forward-statement horizon + scenario-depth helpers |
 *  | {@link ./horizons/registry.ts}          | `ARTICLE_HORIZONS` constant (pure data) |
 *  | {@link ./horizons/lookup.ts}            | `getHorizonConfig` / `getProspectiveSlugs` / `getElectoralOverlaySlugs` / `getMandatoryArtifacts` |
 *
 * Consumers continue to import from `src/config/article-horizons.js` — no
 * import-path changes are required downstream.
 *
 * **Adding a new article horizon** remains a four-step change:
 *   1. New `ArticleCategory` enum value (`src/types/article-categories.ts`).
 *   2. New entry in `ARTICLE_HORIZONS` keyed by that category (`./horizons/registry.ts`).
 *   3. Per-language title generator in `src/constants/language-articles.ts`.
 *   4. New `news-<slug>.md` workflow under `.github/workflows/`.
 *
 * @see analysis/methodologies/forward-projection-methodology.md
 * @see analysis/methodologies/electoral-cycle-methodology.md
 */

export type {
  ArticleHorizonConfig,
  CadenceConfig,
  DataWindowAnchor,
  DataWindowConfig,
  DataWindowDirection,
  StageBudgetConfig,
} from './horizons/types.js';

export { ARTICLE_HORIZONS } from './horizons/registry.js';

export {
  getElectoralOverlaySlugs,
  getHorizonConfig,
  getMandatoryArtifacts,
  getProspectiveSlugs,
} from './horizons/lookup.js';
