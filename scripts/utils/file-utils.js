// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/FileUtils
 * @description Shared file system utilities for news article operations
 */
import fs from 'fs';
import path from 'path';
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN } from '../constants/config.js';
/**
 * Get all news article HTML files from the news directory
 *
 * @param newsDir - News directory path (defaults to NEWS_DIR)
 * @returns List of article filenames
 */
export function getNewsArticles(newsDir = NEWS_DIR) {
    if (!fs.existsSync(newsDir)) {
        console.log('📁 News directory does not exist yet');
        return [];
    }
    const files = fs.readdirSync(newsDir);
    return files.filter((f) => f.endsWith('.html') && !f.startsWith('index-'));
}
/**
 * Parse article filename to extract metadata
 *
 * @param filename - Article filename (e.g., "2025-01-15-week-ahead-en.html")
 * @returns Parsed metadata or null if filename doesn't match pattern
 */
export function parseArticleFilename(filename) {
    const match = filename.match(ARTICLE_FILENAME_PATTERN);
    if (!match) {
        return null;
    }
    return {
        date: match[1],
        slug: match[2],
        lang: match[3],
        filename,
    };
}
/**
 * Group articles by language code
 *
 * @param articles - List of article filenames
 * @param languages - Supported language codes
 * @returns Articles grouped by language, sorted newest first
 */
export function groupArticlesByLanguage(articles, languages) {
    const grouped = {};
    for (const lang of languages) {
        grouped[lang] = [];
    }
    for (const article of articles) {
        const parsed = parseArticleFilename(article);
        if (parsed && grouped[parsed.lang] !== undefined) {
            grouped[parsed.lang].push(parsed);
        }
    }
    // Sort by date (newest first)
    for (const lang in grouped) {
        grouped[lang].sort((a, b) => b.date.localeCompare(a.date));
    }
    return grouped;
}
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
    return stats.mtime.toISOString().split('T')[0] ?? '';
}
/**
 * Format date for article slug
 *
 * @param date - Date to format (defaults to now)
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForSlug(date = new Date()) {
    return date.toISOString().split('T')[0] ?? '';
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
/**
 * Ensure a directory exists, creating it recursively if needed
 *
 * @param dirPath - Directory path to ensure
 */
export function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Write content to a file with UTF-8 encoding
 *
 * @param filepath - Output file path
 * @param content - File content
 */
export function writeFileContent(filepath, content) {
    const dir = path.dirname(filepath);
    ensureDirectoryExists(dir);
    fs.writeFileSync(filepath, content, 'utf-8');
}
//# sourceMappingURL=file-utils.js.map