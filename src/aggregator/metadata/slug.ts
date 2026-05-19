// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Metadata/Slug
 * @description Pure slug-humanisation helper extracted from
 * `article-metadata.ts`. Kept as a leaf module so heading-rule and
 * template-fallback helpers can depend on it without pulling in the
 * full metadata resolver.
 */

/**
 * Humanise an `article-type` slug the same way `humanizeStem` does in
 * `src/aggregator/analysis-aggregator.ts`. Kept in sync by value — we
 * deliberately do not import the private helper.
 *
 * @param slug - Slug like `week-ahead` or `breaking_news`
 * @returns Title-cased humanised form (`Week Ahead`, `Breaking News`)
 */
export function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_]/g)
    .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg))
    .join(' ')
    .trim();
}
