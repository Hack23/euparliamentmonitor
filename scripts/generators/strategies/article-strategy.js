// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Strategies/ArticleStrategy
 * @description Base interface and shared types for article generation strategies.
 * Each strategy encapsulates the fetch, build, and metadata logic for one
 * {@link ArticleCategory}, making it trivial to add new article types without
 * touching the orchestration layer.
 *
 * Includes utilities for loading analysis pipeline output so that strategies
 * can consume classification, threat assessment, risk scoring, and other
 * analysis artifacts produced by the analysis stage.
 */
import fs from 'fs';
import path from 'path';
import { escapeHTML } from '../../utils/file-utils.js';
import { ANALYSIS_INSIGHTS_HEADING, getLocalizedString } from '../../constants/languages.js';
// ─── Analysis loading defaults ───────────────────────────────────────────────
/** Default base directory for analysis output */
const DEFAULT_ANALYSIS_BASE_DIR = 'analysis';
/**
 * Environment variable name for overriding the analysis base directory.
 * Set by the orchestration layer when `--analysis-dir` is provided.
 */
const ENV_ANALYSIS_DIR = 'EP_ANALYSIS_DIR';
/**
 * Environment variable name for overriding the analysis slug.
 * Set by the orchestration layer with the resolved slug from
 * `deriveArticleTypeSlug()`, so multi-type runs and custom analysis
 * directories are correctly resolved without hard-coding per-strategy slugs.
 */
const ENV_ANALYSIS_SLUG = 'EP_ANALYSIS_SLUG';
/** Analysis subdirectories to scan for markdown files */
const ANALYSIS_SUBDIRS = [
    'classification',
    'threat-assessment',
    'risk-scoring',
    'existing',
];
/**
 * Load analysis context from the analysis pipeline output directory.
 *
 * Scans `{baseDir}/{date}/{articleTypeSlug}/` for a `manifest.json` and
 * analysis markdown files in known subdirectories.  When the directory
 * does not exist or contains no analysis files, returns `null` for graceful
 * degradation — strategies then behave exactly as before.
 *
 * Handles suffixed directories (e.g. `breaking-2`, `breaking-3`) by
 * scanning for the latest match.
 *
 * Resolution order for base directory:
 * 1. Explicit `baseDir` parameter (when non-default)
 * 2. `EP_ANALYSIS_DIR` environment variable (set by orchestration)
 * 3. Default `'analysis'`
 *
 * Resolution order for slug:
 * 1. `EP_ANALYSIS_SLUG` environment variable (set by orchestration)
 * 2. The `articleTypeSlug` parameter passed by each strategy
 *
 * @param date - ISO 8601 date (YYYY-MM-DD) of the analysis run
 * @param articleTypeSlug - Article type slug (e.g. 'breaking', 'week-ahead')
 * @param baseDir - Base analysis directory (defaults to 'analysis')
 * @returns Loaded analysis context or null when unavailable
 */
export function loadAnalysisContext(date, articleTypeSlug, baseDir = DEFAULT_ANALYSIS_BASE_DIR) {
    // Validate date format (YYYY-MM-DD) and reject path traversal
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(date))
        return null;
    // Resolve base dir: prefer explicit non-default param, then env var, then default
    const resolvedBaseDir = baseDir !== DEFAULT_ANALYSIS_BASE_DIR
        ? baseDir
        : process.env[ENV_ANALYSIS_DIR]?.trim() || DEFAULT_ANALYSIS_BASE_DIR;
    // Resolve slug: prefer env var override, then per-strategy slug
    const resolvedSlug = process.env[ENV_ANALYSIS_SLUG]?.trim() || articleTypeSlug;
    // Validate slug: alphanumeric, hyphens only — no path separators
    if (!/^[\da-z][\da-z-]*$/u.test(resolvedSlug))
        return null;
    const dateDir = path.resolve(resolvedBaseDir, date);
    if (!fs.existsSync(dateDir))
        return null;
    // Find the best matching analysis directory (exact or latest suffixed)
    const analysisDir = findAnalysisDirectory(dateDir, resolvedSlug);
    if (!analysisDir)
        return null;
    // Load manifest.json
    const manifest = loadManifest(analysisDir);
    // Load analysis markdown files from known subdirectories
    const files = loadAnalysisFiles(analysisDir);
    if (files.size === 0 && !manifest)
        return null;
    const overallConfidence = manifest && typeof manifest['overallConfidence'] === 'string'
        ? manifest['overallConfidence']
        : null;
    return { date, analysisDir, manifest, overallConfidence, files };
}
/**
 * Find the best matching analysis directory for an article type slug.
 * Checks exact match first, then scans for suffixed variants and picks
 * the latest (highest suffix number).
 *
 * @param dateDir - Date-scoped parent directory
 * @param slug - Article type slug
 * @returns Resolved directory path or null
 */
function findAnalysisDirectory(dateDir, slug) {
    // Always scan for all matching directories (exact + suffixed) to find the latest
    try {
        const entries = fs.readdirSync(dateDir, { withFileTypes: true });
        const suffixPattern = new RegExp(`^${escapeRegExp(slug)}(?:-(\\d+))?$`);
        let bestPath = null;
        let bestSuffix = -1;
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const match = suffixPattern.exec(entry.name);
            if (match) {
                const suffix = match[1] ? parseInt(match[1], 10) : 0;
                if (suffix > bestSuffix) {
                    bestSuffix = suffix;
                    bestPath = path.join(dateDir, entry.name);
                }
            }
        }
        return bestPath;
    }
    catch {
        return null;
    }
}
/**
 * Escape special regex characters in a string.
 *
 * @param str - Input string to escape
 * @returns Escaped string safe for use in RegExp constructor
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
/**
 * Load and parse `manifest.json` from an analysis directory.
 *
 * @param analysisDir - Analysis output directory
 * @returns Parsed manifest or null
 */
function loadManifest(analysisDir) {
    const manifestPath = path.join(analysisDir, 'manifest.json');
    try {
        if (!fs.existsSync(manifestPath))
            return null;
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
/**
 * Extract the `method:` value from YAML frontmatter in a markdown string.
 *
 * Analysis files produced by the pipeline embed the canonical method ID in
 * their frontmatter (e.g. `method: coalition-analysis`).  When this differs
 * from the filename (e.g. `coalition-dynamics.md`), the frontmatter value is
 * the authoritative key for strategy lookups.
 *
 * @param content - Raw markdown content
 * @returns The frontmatter `method` value, or `null` if absent/unparseable
 */
export function extractFrontmatterMethod(content) {
    if (!content.startsWith('---'))
        return null;
    const endIdx = content.indexOf('---', 3);
    if (endIdx === -1)
        return null;
    const frontmatter = content.slice(3, endIdx);
    const match = /^method:\s*(.+)$/mu.exec(frontmatter);
    return match?.[1]?.trim() ?? null;
}
/**
 * Load a single analysis markdown file, register it in the map by both its
 * frontmatter-derived method key and filename-derived alias.
 *
 * @param files - Map to register the file content into
 * @param filePath - Absolute path to the .md file
 * @param entry - Filename (e.g. `coalition-dynamics.md`)
 * @param subdir - Parent subdirectory name (e.g. `existing`)
 */
function loadSingleAnalysisFile(files, filePath, entry, subdir) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const filenameKey = entry.replace(/\.md$/u, '');
        const frontmatterMethod = extractFrontmatterMethod(content);
        // Primary key: frontmatter method (canonical ID), fallback to filename
        const method = frontmatterMethod ?? filenameKey;
        const fileContent = { method, subdir, content, filePath };
        files.set(method, fileContent);
        // Register filename alias when it differs from the frontmatter method
        if (frontmatterMethod && frontmatterMethod !== filenameKey) {
            files.set(filenameKey, fileContent);
        }
    }
    catch {
        // Skip unreadable files
    }
}
/**
 * Load analysis markdown files from known subdirectories.
 *
 * Keys the returned map by the `method:` value extracted from the file's
 * YAML frontmatter (canonical method ID).  When the filename differs from
 * the frontmatter method (e.g. `coalition-dynamics.md` with frontmatter
 * `method: coalition-analysis`), both the frontmatter key and the
 * filename-derived key are registered so that callers can look up files
 * by either identifier.
 *
 * @param analysisDir - Analysis output directory
 * @returns Map of method name → file content
 */
function loadAnalysisFiles(analysisDir) {
    const files = new Map();
    for (const subdir of ANALYSIS_SUBDIRS) {
        const subdirPath = path.join(analysisDir, subdir);
        try {
            if (!fs.existsSync(subdirPath) || !fs.statSync(subdirPath).isDirectory())
                continue;
            const entries = fs.readdirSync(subdirPath);
            for (const entry of entries) {
                if (!entry.endsWith('.md'))
                    continue;
                loadSingleAnalysisFile(files, path.join(subdirPath, entry), entry, subdir);
            }
        }
        catch {
            // Skip unreadable directories
        }
    }
    return files;
}
/**
 * Check whether a line is part of a fenced code block delimiter or table row.
 * Used to filter out non-prose content from analysis summaries.
 *
 * @param trimmed - Trimmed line of text to check
 * @returns `true` when the line is non-prose content (code, table, blockquote instruction, HTML)
 */
function isNonProseContent(trimmed) {
    // Fenced code block delimiters
    if (trimmed.startsWith('```'))
        return true;
    // Markdown table rows — lines starting with | or containing multiple | separators
    if (trimmed.startsWith('|') && trimmed.includes('|', 1))
        return true;
    // Table separator rows (e.g. |---|---|)
    if (/^[\s|:|-]+$/u.test(trimmed) && trimmed.includes('|'))
        return true;
    // Blockquote instructions for AI agents
    if (trimmed.startsWith('>') && /instructions for ai/iu.test(trimmed))
        return true;
    // HTML-like content
    if (trimmed.startsWith('<') && trimmed.endsWith('>'))
        return true;
    return false;
}
/** Patterns that indicate scaffold/placeholder content — not real analysis */
const SCAFFOLD_PATTERNS = [
    /\[TO BE FILLED BY AI AGENT/i,
    /\[AI_ANALYSIS_REQUIRED\]/i,
    /\[REQUIRED\]/i,
    /\[\?\]/,
    /Quality gate: minimum \d+ words/i,
    /Instructions for AI Agent/i,
];
/**
 * Check whether an analysis file contains only scaffold/template content
 * (i.e. the AI agent did not fill in the analysis).
 *
 * @param content - Raw markdown file content
 * @returns `true` when the file is an unfilled scaffold
 */
export function isScaffoldContent(content) {
    return SCAFFOLD_PATTERNS.some((pattern) => pattern.test(content));
}
/**
 * Check whether a line should be included as prose content.
 *
 * @param trimmed - Trimmed line text
 * @returns `true` when the line is valid prose (not heading, separator, or non-prose)
 */
function isProseContent(trimmed) {
    if (trimmed === '')
        return false;
    if (trimmed.startsWith('#'))
        return false;
    if (trimmed.startsWith('---'))
        return false;
    if (isNonProseContent(trimmed))
        return false;
    return true;
}
/**
 * Strip markdown formatting (bold, italic) from a text string.
 *
 * @param text - Raw markdown text
 * @returns Plain text with bold/italic markers removed
 */
function stripMarkdownFormatting(text) {
    return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
}
/**
 * Prepare analysis content body by stripping frontmatter and code blocks.
 *
 * @param content - Raw markdown content
 * @returns Body text ready for paragraph extraction, or empty string for scaffold content
 */
function prepareAnalysisBody(content) {
    if (isScaffoldContent(content))
        return '';
    let body = content;
    if (body.startsWith('---')) {
        const endIdx = body.indexOf('---', 3);
        if (endIdx !== -1)
            body = body.slice(endIdx + 3);
    }
    return body.replace(/```[\s\S]*?```/g, '');
}
/**
 * Collect prose paragraphs from prepared analysis body text.
 *
 * @param body - Analysis body with frontmatter/code blocks removed
 * @returns Array of prose paragraphs
 */
function collectParagraphs(body) {
    const lines = body.split('\n');
    const paragraphs = [];
    let current = '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' && current) {
            paragraphs.push(current.trim());
            current = '';
        }
        else if (isProseContent(trimmed)) {
            current += (current ? ' ' : '') + stripMarkdownFormatting(trimmed);
        }
    }
    if (current)
        paragraphs.push(current.trim());
    return paragraphs;
}
/**
 * Extract the first meaningful paragraph from an analysis markdown file.
 * Strips YAML frontmatter, headings, fenced code blocks, tables,
 * scaffold markers, and markdown formatting. Returns plain prose content.
 *
 * @param content - Raw markdown content
 * @param maxLength - Maximum character length to return (default 500)
 * @returns Extracted summary text or empty string
 */
export function extractAnalysisSummary(content, maxLength = 500) {
    const body = prepareAnalysisBody(content);
    if (!body)
        return '';
    const paragraphs = collectParagraphs(body);
    const meaningful = filterMeaningfulParagraphs(paragraphs, 20);
    const summary = meaningful[0] ?? '';
    return summary.length > maxLength ? summary.slice(0, maxLength - 3) + '...' : summary;
}
/**
 * Filter paragraphs to only include meaningful prose content.
 * Removes short fragments and data-only paragraphs (e.g. "— | — | —").
 *
 * @param paragraphs - Array of paragraph strings to filter
 * @param minLength - Minimum character length for a paragraph to be considered meaningful
 * @returns Filtered array of meaningful paragraphs
 */
function filterMeaningfulParagraphs(paragraphs, minLength) {
    return paragraphs.filter((p) => p.length > minLength && !/^[\d\s|—–-]+$/u.test(p) && !/^\s*—\s*$/u.test(p));
}
/**
 * Extract multiple meaningful paragraphs from an analysis markdown file.
 * Provides richer content than the single-paragraph extractAnalysisSummary.
 *
 * @param content - Raw markdown file content
 * @param maxParagraphs - Maximum number of paragraphs to return (default 3)
 * @param maxTotalLength - Maximum total character length (default 1500)
 * @returns Array of extracted prose paragraphs
 */
export function extractAnalysisParagraphs(content, maxParagraphs = 3, maxTotalLength = 1500) {
    const body = prepareAnalysisBody(content);
    if (!body)
        return [];
    const paragraphs = collectParagraphs(body);
    const meaningful = filterMeaningfulParagraphs(paragraphs, 50);
    const result = [];
    let totalLength = 0;
    for (const p of meaningful) {
        if (result.length >= maxParagraphs)
            break;
        const remaining = maxTotalLength - totalLength;
        if (remaining <= 0)
            break;
        if (p.length > remaining) {
            // Truncate overlong paragraph when result is still empty so we
            // never return [] for content that has substantive prose.
            if (result.length === 0) {
                result.push(p.slice(0, remaining).trimEnd());
            }
            break;
        }
        result.push(p);
        totalLength += p.length;
    }
    return result;
}
/**
 * Check whether an analysis file contains substantive AI-produced content
 * (as opposed to pipeline scaffolding or empty templates).
 *
 * @param content - Raw markdown file content
 * @returns `true` when the file contains real analytical prose
 */
export function hasSubstantiveAIContent(content) {
    const body = prepareAnalysisBody(content);
    if (!body)
        return false;
    // Count words in prose lines (not tables, not headings, not blockquotes)
    let wordCount = 0;
    for (const line of body.split('\n')) {
        const trimmed = line.trim();
        if (isProseContent(trimmed) && !trimmed.startsWith('>')) {
            wordCount += trimmed.split(/\s+/u).length;
        }
    }
    // Minimum 5 words of prose — primarily relies on scaffold detection above
    return wordCount >= 5;
}
/**
 * Build an HTML section summarising analysis pipeline insights.
 *
 * Creates a structured `<section class="analysis-pipeline-insights">` element
 * containing key findings from loaded analysis files.  Each strategy passes
 * the methods it considers relevant; only those with loaded content are rendered.
 *
 * Filters out scaffold/template files and files with no substantive AI content.
 * Uses extended paragraph extraction for richer insight content.
 *
 * @param ctx - Loaded analysis context (null-safe: returns empty string)
 * @param relevantMethods - Method names this strategy wants to display
 * @param lang - Target language code (used for localized section heading)
 * @returns HTML string (empty when no context or no relevant files)
 */
export function buildAnalysisInsightsSection(ctx, relevantMethods, lang) {
    if (!ctx)
        return '';
    const items = [];
    for (const method of relevantMethods) {
        const file = ctx.files.get(method);
        if (!file)
            continue;
        // `extractAnalysisParagraphs()` already filters scaffold, empty, and
        // non-substantive analysis bodies, so use it as the single gate here.
        const paragraphs = extractAnalysisParagraphs(file.content, 2, 800);
        if (paragraphs.length === 0)
            continue;
        const label = formatMethodLabel(method);
        const paragraphHtml = paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join('\n');
        items.push(`<div class="analysis-insight-item" data-method="${escapeHTML(method)}">\n` +
            `<h4>${escapeHTML(label)}</h4>\n` +
            paragraphHtml +
            '\n' +
            `</div>`);
    }
    if (items.length === 0)
        return '';
    const heading = getLocalizedString(ANALYSIS_INSIGHTS_HEADING, lang);
    const confidence = ctx.overallConfidence
        ? ` <span class="confidence-badge">${escapeHTML(ctx.overallConfidence)}</span>`
        : '';
    return (`<section class="analysis-pipeline-insights" role="region" aria-label="${escapeHTML(heading)}">\n` +
        `<h2>${escapeHTML(heading)}${confidence}</h2>\n` +
        items.join('\n') +
        `\n</section>\n`);
}
/**
 * Format an analysis method identifier into a human-readable label.
 *
 * @param method - Method identifier (e.g. 'significance-classification')
 * @returns Formatted label (e.g. 'Significance Classification')
 */
function formatMethodLabel(method) {
    return method
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
//# sourceMappingURL=article-strategy.js.map