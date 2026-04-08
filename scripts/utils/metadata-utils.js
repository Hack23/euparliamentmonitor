// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/MetadataUtils
 * @description Shared helpers for article metadata generation.
 */
/** Maximum length for a title suffix before truncation */
const MAX_SUFFIX_LENGTH = 60;
/** Minimum title length to be considered meaningful (not placeholder) */
export const MIN_MEANINGFUL_TITLE_LENGTH = 10;
/**
 * Return singular or plural form based on count.
 *
 * @param n - Item count
 * @param singular - Singular form
 * @param plural - Plural form
 * @returns `"N singular"` or `"N plural"`
 */
export function pl(n, singular, plural) {
    return `${n} ${n === 1 ? singular : plural}`;
}
/**
 * Truncate a title string to the suffix length limit with ellipsis.
 * Used by all strategy title suffix builders for consistent truncation.
 *
 * @param title - Title string to truncate
 * @param maxLength - Maximum length (default: {@link MAX_SUFFIX_LENGTH})
 * @returns Truncated title with `...` suffix if over limit, else unchanged
 */
export function truncateTitle(title, maxLength = MAX_SUFFIX_LENGTH) {
    if (title.length <= maxLength)
        return title;
    return title.slice(0, maxLength - 3) + '...';
}
//# sourceMappingURL=metadata-utils.js.map