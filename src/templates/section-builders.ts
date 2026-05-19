// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Templates/SectionBuilders
 * @description Reusable section builder utilities for article template architecture.
 *
 * This file is a thin re-export barrel — Refactor 8/8 split the original
 * 758-LOC monolith into focused per-section modules under `./sections/`.
 * Every public export listed here is preserved verbatim so downstream
 * consumers (article HTML, news indexes, political-intelligence landing,
 * sitemap) keep importing from `templates/section-builders` without churn.
 *
 * Each section builder lives in its own file:
 *   - `./sections/quality-score.ts` — quality scoring + badge
 *   - `./sections/toc.ts` — table of contents
 *   - `./sections/timeline.ts` — legislative/procedural timeline
 *   - `./sections/comparison.ts` — before/after comparison table
 *   - `./sections/key-figures.ts` — numeric key-figures bar
 *   - `./sections/banner.ts` — responsive banner/picture, icon links, social meta
 *   - `./sections/header.ts` — shared site header
 *   - `./sections/footer.ts` — Hack23 AB footer
 */

export { computeArticleQualityScore, buildQualityScoreBadge } from './sections/quality-score.js';
export { buildTableOfContents } from './sections/toc.js';
export { buildTimelineSection, type TimelineItem } from './sections/timeline.js';
export { buildComparisonTable } from './sections/comparison.js';
export { buildKeyFiguresBar, type KeyFigure } from './sections/key-figures.js';
export {
  buildResponsiveBannerPicture,
  buildResponsiveIconLinks,
  buildResponsiveSocialImageMeta,
  buildPageBanner,
  type ResponsiveBannerPictureOptions,
} from './sections/banner.js';
export { buildSiteHeader, type SiteHeaderOptions } from './sections/header.js';
export { buildSiteFooter, type SiteFooterOptions } from './sections/footer.js';
