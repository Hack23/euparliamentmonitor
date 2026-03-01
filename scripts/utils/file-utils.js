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
    // split('T') on an ISO string always produces at least one element
    return stats.mtime.toISOString().split('T')[0];
}
/**
 * Format date for article slug
 *
 * @param date - Date to format (defaults to now)
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForSlug(date = new Date()) {
    // split('T') on an ISO string always produces at least one element
    return date.toISOString().split('T')[0];
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
/**
 * Decode the 5 HTML entities produced by escapeHTML() back to plain text.
 * Used when extracting text from our own generated HTML to obtain unescaped values.
 *
 * IMPORTANT: `&amp;` MUST be decoded last. Decoding it first would convert
 * `&amp;lt;` to `&lt;` before the `&lt;` → `<` replacement runs, causing
 * double-decoding. The correct order is: decode all specific entities first,
 * then decode `&amp;` as the final step.
 *
 * @param str - HTML string with entities
 * @returns Plain text with entities decoded
 */
function decodeHtmlEntities(str) {
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}
/**
 * Extract title and description from a generated article HTML file.
 * Reads the predictable template structure produced by article-template.ts.
 * Falls back to empty strings when the file cannot be read.
 * HTML entities from the template are decoded to produce plain text.
 *
 * NOTE: The meta description regex relies on the template's use of escapeHTML(),
 * which converts `"` to `&quot;`. Because descriptions are always stored with
 * double-quote delimiters and inner quotes are HTML-encoded, the `[^"]+` pattern
 * safely captures the full value. If the template ever changes its quoting
 * convention this regex must be updated accordingly.
 *
 * @param filepath - Path to the article HTML file
 * @returns Object with title (from first h1) and description (from meta description)
 */
export function extractArticleMeta(filepath) {
    let title = '';
    let description = '';
    try {
        const content = fs.readFileSync(filepath, 'utf-8');
        // Matches h1 with any attributes but only plain-text content (no nested tags).
        // The template always writes plain escaped text in h1, so this is correct.
        const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/u);
        if (titleMatch?.[1]) {
            title = decodeHtmlEntities(titleMatch[1].trim());
        }
        const descMatch = content.match(/<meta name="description" content="([^"]+)"/u);
        if (descMatch?.[1]) {
            description = decodeHtmlEntities(descMatch[1]);
        }
    }
    catch {
        // File not readable – return empty strings
    }
    return { title, description };
}
/**
 * Escape special HTML characters to prevent XSS
 *
 * @param str - Raw string to escape
 * @returns HTML-safe string
 */
export function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
/**
 * Validate that a URL uses a safe scheme (http or https)
 *
 * @param url - URL string to validate
 * @returns true if URL has a safe scheme
 */
export function isSafeURL(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}
/** Required structural elements that every article must contain */
const REQUIRED_ARTICLE_ELEMENTS = [
    { selector: 'class="language-switcher"', label: 'language-switcher nav' },
    { selector: 'class="article-top-nav"', label: 'article-top-nav (back button)' },
    { selector: 'class="site-header"', label: 'site-header' },
    { selector: 'class="skip-link"', label: 'skip-link' },
    { selector: 'class="reading-progress"', label: 'reading-progress bar' },
    { selector: '<main id="main"', label: 'main content wrapper' },
    { selector: 'class="site-footer"', label: 'site-footer' },
];
/**
 * Validate that generated article HTML includes all required structural elements.
 *
 * This is the primary validation gate — articles must be generated correctly
 * by the template. The fix-articles script is only a fallback for legacy articles.
 *
 * @param html - Complete HTML string of the article
 * @returns Validation result with errors list (empty if valid)
 */
export function validateArticleHTML(html) {
    const errors = [];
    for (const element of REQUIRED_ARTICLE_ELEMENTS) {
        if (!html.includes(element.selector)) {
            errors.push(`Missing required element: ${element.label}`);
        }
    }
    return { valid: errors.length === 0, errors };
}
//# sourceMappingURL=file-utils.js.map