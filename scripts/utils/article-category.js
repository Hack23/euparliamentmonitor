// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/ArticleCategory
 * @description Shared slug→ArticleCategory detection logic.
 *
 * Extracted here so that both `generators/news-indexes.ts` and
 * `utils/news-metadata.ts` can reuse the same classification without
 * creating a circular dependency.
 */
import { ArticleCategory } from '../types/index.js';
/**
 * Default category for articles that don't match specific patterns.
 */
const DEFAULT_CATEGORY = ArticleCategory.WEEK_AHEAD;
/**
 * Detect the article category from a slug.
 * Returns the matching {@link ArticleCategory} value used for badge/accent colours.
 *
 * @param slug - Hyphenated slug string
 * @returns Matching ArticleCategory value
 */
export function detectCategory(slug) {
  const s = slug.toLowerCase();
  if (s.includes('week-ahead')) return ArticleCategory.WEEK_AHEAD;
  if (s.includes('month-ahead')) return ArticleCategory.MONTH_AHEAD;
  if (s.includes('year-ahead')) return ArticleCategory.YEAR_AHEAD;
  if (s.includes('week-in-review')) return ArticleCategory.WEEK_IN_REVIEW;
  if (s.includes('month-in-review')) return ArticleCategory.MONTH_IN_REVIEW;
  if (s.includes('year-in-review')) return ArticleCategory.YEAR_IN_REVIEW;
  if (s.includes('committee')) return ArticleCategory.COMMITTEE_REPORTS;
  if (s.includes('motion') || s.includes('vote') || s.includes('voting'))
    return ArticleCategory.MOTIONS;
  if (s.includes('propos') || s.includes('legislat')) return ArticleCategory.PROPOSITIONS;
  if (s.includes('breaking') || s.includes('urgent')) return ArticleCategory.BREAKING_NEWS;
  if (s.includes('deep-analysis') || s.includes('5-whys')) return ArticleCategory.DEEP_ANALYSIS;
  return DEFAULT_CATEGORY;
}
//# sourceMappingURL=article-category.js.map
