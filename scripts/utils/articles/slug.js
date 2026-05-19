// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/Articles/Slug
 * @description Pure string/date utilities for article slugs and read-time math.
 */
import fs from 'fs';
/**
 * Format slug for display (hyphen-separated to Title Case)
 *
 * @param slug - Hyphen-separated slug string
 * @returns Formatted title string
 */
export function formatSlug(slug) {
    return slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
/**
 * Get file modification time as YYYY-MM-DD string
 *
 * @param filepath - Path to file
 * @returns Last modified date in YYYY-MM-DD format
 */
export function getModifiedDate(filepath) {
    const stats = fs.statSync(filepath);
    return stats.mtime.toISOString().slice(0, 10);
}
/**
 * Format date for article slug
 *
 * @param date - Date to format (defaults to now)
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForSlug(date = new Date()) {
    return date.toISOString().slice(0, 10);
}
/**
 * Calculate read time estimate from content
 *
 * @param content - Article content text
 * @param wordsPerMinute - Reading speed (default 250)
 * @returns Estimated read time in minutes
 */
export function calculateReadTime(content, wordsPerMinute = 250) {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}
//# sourceMappingURL=slug.js.map