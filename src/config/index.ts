// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Config
 * @description Public re-exports for the horizon-config registry.
 */

export {
  ARTICLE_HORIZONS,
  type ArticleHorizonConfig,
  type CadenceConfig,
  type DataWindowAnchor,
  type DataWindowConfig,
  type DataWindowDirection,
  type StageBudgetConfig,
  getElectoralOverlaySlugs,
  getHorizonConfig,
  getMandatoryArtifacts,
  getProspectiveSlugs,
} from './article-horizons.js';
