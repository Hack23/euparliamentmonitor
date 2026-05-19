// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ArticleHtml
 * @description Barrel re-export for the article HTML chrome / shell /
 * enhancement layer. The previous monolithic module was split
 * (Refactor 7/8) into focused sub-modules under `./html/`:
 *
 *   - `./html/shell.ts`                — `wrapArticleHtml` + `WrapArticleOptions`
 *   - `./html/toc.ts`                  — `buildArticleToc` + helpers
 *   - `./html/hreflang.ts`             — language switcher + alternate links
 *   - `./html/headline.ts`             — title / headline / separator helpers
 *   - `./html/localize-body.ts`        — appendix-section localization
 *   - `./html/tradecraft-cards.ts`     — Tradecraft References card grid
 *   - `./html/analysis-index-cards.ts` — Analysis Index card grid
 *
 * Public API is preserved for downstream importers (production code in
 * `src/aggregator/article-generator.ts`, `src/index.ts`, tests in
 * `test/unit/article-html.test.js` + siblings, and any compiled
 * `scripts/aggregator/*.js` consumers).
 */

// Shell + entry point
export {
  wrapArticleHtml,
  PUBLISHER_NAME,
  SITE_NAME,
  type WrapArticleOptions,
  type ArticleTocEntry,
} from './html/shell.js';

// Hreflang & language switcher
export {
  getArticleFilename,
  buildArticleHreflangLinks,
  buildLanguageSwitcher,
} from './html/hreflang.js';

// TOC
export { buildArticleToc, getLocalizedTocTitle, getTocSectionIcon } from './html/toc.js';

// Headline helpers
export {
  truncateHeadline,
  getTitleSeparator,
  getLocalizedArticleType,
  getLocalizedArticleTypePlain,
  HEADLINE_LIMIT,
} from './html/headline.js';

// Body localization
export {
  localizeArticleBody,
  replaceFirstStringIn,
  replaceHeadingById,
} from './html/localize-body.js';

// Tradecraft / artifact card grids
export {
  enhanceTradecraftCards,
  extractTradecraftLinks,
  renderTradecraftCard,
  getViewMethodologyLabel,
  getStemIcon,
  STEM_ICONS,
  DEFAULT_CARD_ICON,
  type ExtractedLink,
} from './html/tradecraft-cards.js';

export { enhanceAnalysisIndexCards } from './html/analysis-index-cards.js';
