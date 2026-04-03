// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Utils/FileUtils
 * @description Shared file system utilities for news article operations
 */
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { NEWS_DIR, ARTICLE_FILENAME_PATTERN } from '../constants/config.js';
import { ALL_LANGUAGES } from '../constants/language-core.js';
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
    const langCandidate = match[3];
    if (!ALL_LANGUAGES.includes(langCandidate)) {
        return null;
    }
    return {
        date: match[1],
        slug: match[2],
        lang: langCandidate,
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
 * Resolve a unique directory path by appending a numeric suffix (-2, -3, …)
 * when the base directory already contains a completed analysis run
 * (indicated by the presence of a `manifest.json` file).
 *
 * This prevents repeated workflow runs (e.g. breaking news every 6 hours)
 * from overwriting previously committed analysis.
 *
 * @param baseDir - The preferred directory path (e.g. `analysis/2026-04-02/breaking`)
 * @returns The original `baseDir` when no completed run exists there, or a
 *          suffixed variant (e.g. `analysis/2026-04-02/breaking-2`) otherwise.
 */
export function resolveUniqueAnalysisDir(baseDir) {
    // If the directory doesn't exist yet or has no manifest from a prior
    // completed run, use it as-is.  A directory without manifest.json is
    // considered available (not yet finished by any run).
    if (!fs.existsSync(path.join(baseDir, 'manifest.json'))) {
        return baseDir;
    }
    // Directory already has a completed run — find the next available suffix.
    // Use atomic mkdirSync to prevent TOCTOU races when parallel workflow
    // runs attempt to claim the same suffixed candidate concurrently.
    let suffix = 2;
    // Safety cap to prevent runaway loops
    const MAX_SUFFIX = 100;
    while (suffix <= MAX_SUFFIX) {
        const candidate = `${baseDir}-${suffix}`;
        try {
            // Atomic claim: create the directory exclusively (non-recursive).
            // Ensure the parent exists first.
            fs.mkdirSync(path.dirname(candidate), { recursive: true });
            fs.mkdirSync(candidate, { recursive: false });
            // Successfully created — this run owns the directory
            return candidate;
        }
        catch (err) {
            // Only handle EEXIST (directory already claimed by another run).
            // Re-throw unexpected errors (permissions, I/O, etc.).
            if (err.code !== 'EEXIST') {
                throw err;
            }
            suffix++;
        }
    }
    // Fallback: use UUID-suffixed directory to guarantee uniqueness
    const candidate = `${baseDir}-${randomUUID().slice(0, 8)}`;
    fs.mkdirSync(candidate, { recursive: true });
    return candidate;
}
/**
 * Resolve a unique filename by appending a numeric suffix (-2, -3, …) before
 * the file extension when the file already exists.
 *
 * This prevents repeated workflow runs from overwriting previously committed
 * news articles.
 *
 * @param filepath - The preferred file path (e.g. `news/2026-04-02-breaking-en.html`)
 * @returns The original path when the file doesn't exist, or a suffixed
 *          variant (e.g. `news/2026-04-02-breaking-en-2.html`) otherwise.
 */
export function resolveUniqueFilePath(filepath) {
    if (!fs.existsSync(filepath)) {
        return filepath;
    }
    const dir = path.dirname(filepath);
    const ext = path.extname(filepath);
    const base = path.basename(filepath, ext);
    let suffix = 2;
    const MAX_SUFFIX = 100;
    while (suffix <= MAX_SUFFIX) {
        const candidate = path.join(dir, `${base}-${suffix}${ext}`);
        if (!fs.existsSync(candidate)) {
            return candidate;
        }
        suffix++;
    }
    return path.join(dir, `${base}-${randomUUID().slice(0, 8)}${ext}`);
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
 * Remove a file, ignoring ENOENT (file already deleted by another writer).
 *
 * @param filepath - Path to the file to remove
 */
function unlinkIfExists(filepath) {
    try {
        fs.unlinkSync(filepath);
    }
    catch (err) {
        const code = err instanceof Error ? err.code : '';
        if (code !== 'ENOENT') {
            throw err;
        }
    }
}
/**
 * Attempt to rename `src` to `dest` with a bounded retry loop.
 *
 * On each attempt the existing destination is removed first, then
 * `renameSync` is retried.  `EEXIST`/`EPERM` failures from concurrent
 * writers are tolerated for up to `maxRetries` attempts.
 *
 * @param src - Source (temp) file path
 * @param dest - Final destination path
 * @param maxRetries - Maximum number of unlink-then-rename attempts
 */
function renameWithRetry(src, dest, maxRetries) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        unlinkIfExists(dest);
        try {
            fs.renameSync(src, dest);
            return;
        }
        catch (retryErr) {
            const retryCode = retryErr instanceof Error ? retryErr.code : '';
            if ((retryCode === 'EEXIST' || retryCode === 'EPERM') && attempt < maxRetries - 1) {
                continue;
            }
            throw retryErr;
        }
    }
}
/**
 * Best-effort removal of a temporary file.  Ignores ENOENT (the file was
 * already renamed or never created) but logs a warning for other errors
 * (e.g. EBUSY, EACCES) so operators can detect leaked temp files.
 *
 * @param tempPath - Path to the temp file to remove
 */
function cleanupTempFile(tempPath) {
    try {
        fs.unlinkSync(tempPath);
    }
    catch (unlinkErr) {
        const errno = unlinkErr && typeof unlinkErr === 'object' ? unlinkErr : undefined;
        if (errno?.code !== 'ENOENT') {
            const message = errno && typeof errno.message === 'string' ? errno.message : String(unlinkErr);
            const code = errno?.code ?? 'UNKNOWN';
            console.warn(`atomicWrite: failed to remove temporary file "${tempPath}" (code: ${code}): ${message}`);
        }
    }
}
/**
 * Write content to a file atomically.
 *
 * Writes to a uniquely-named temporary file in the same directory first, then
 * renames it to the final path. The temp filename includes the PID and a random
 * UUID so that concurrent callers targeting the same destination never collide
 * on the intermediate file. If the rename fails the temp file is cleaned up in
 * a `finally` block. On platforms where `renameSync` does not overwrite an
 * existing destination (e.g. Windows), the error is caught and the target is
 * removed before retrying the rename.
 *
 * @param filepath - Final output file path
 * @param content - File content to write
 */
export function atomicWrite(filepath, content) {
    const dir = path.dirname(filepath);
    ensureDirectoryExists(dir);
    const uniqueSuffix = `${process.pid}-${randomUUID()}`;
    const tempPath = `${filepath}.${uniqueSuffix}.tmp`;
    try {
        fs.writeFileSync(tempPath, content, 'utf-8');
        try {
            fs.renameSync(tempPath, filepath);
        }
        catch (err) {
            const code = err instanceof Error ? err.code : '';
            if (code === 'EEXIST' || code === 'EPERM') {
                renameWithRetry(tempPath, filepath, 3);
            }
            else {
                throw err;
            }
        }
    }
    finally {
        cleanupTempFile(tempPath);
    }
}
/**
 * Check whether a news article file already exists on disk.
 *
 * This is used by generation pipelines to skip work when a prior workflow run
 * (or the same run) has already produced the article, avoiding unnecessary
 * regeneration and potential merge conflicts.
 *
 * @param slug - Article slug including date prefix (e.g. `"2025-01-15-week-ahead"`)
 * @param lang - Language code (e.g. `"en"`)
 * @param newsDir - Absolute path to the news output directory (defaults to NEWS_DIR)
 * @returns `true` when the article file exists
 */
export function checkArticleExists(slug, lang, newsDir = NEWS_DIR) {
    const filename = `${slug}-${lang}.html`;
    return fs.existsSync(path.join(newsDir, filename));
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
    {
        selector: ['class="site-header__langs"', 'class="language-switcher"'],
        label: 'language switcher nav',
    },
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
        const sel = element.selector;
        const found = Array.isArray(sel)
            ? sel.some((s) => html.includes(s))
            : html.includes(sel);
        if (!found) {
            errors.push(`Missing required element: ${element.label}`);
        }
    }
    return { valid: errors.length === 0, errors };
}
//# sourceMappingURL=file-utils.js.map