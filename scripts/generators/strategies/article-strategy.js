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
 * Extract the first meaningful paragraph from an analysis markdown file.
 * Strips YAML frontmatter and headings, returning plain prose content.
 *
 * @param content - Raw markdown content
 * @param maxLength - Maximum character length to return (default 500)
 * @returns Extracted summary text or empty string
 */
export function extractAnalysisSummary(content, maxLength = 500) {
    // Strip YAML frontmatter
    let body = content;
    if (body.startsWith('---')) {
        const endIdx = body.indexOf('---', 3);
        if (endIdx !== -1) {
            body = body.slice(endIdx + 3);
        }
    }
    // Find first non-heading, non-empty paragraph
    const lines = body.split('\n');
    const paragraphs = [];
    let current = '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' && current) {
            paragraphs.push(current.trim());
            current = '';
        }
        else if (!trimmed.startsWith('#') && !trimmed.startsWith('---') && trimmed !== '') {
            current += (current ? ' ' : '') + trimmed;
        }
    }
    if (current)
        paragraphs.push(current.trim());
    const summary = paragraphs[0] ?? '';
    return summary.length > maxLength ? summary.slice(0, maxLength - 3) + '...' : summary;
}
/**
 * Build an HTML section summarising analysis pipeline insights.
 *
 * Creates a structured `<section class="analysis-pipeline-insights">` element
 * containing key findings from loaded analysis files.  Each strategy passes
 * the methods it considers relevant; only those with loaded content are rendered.
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
        const summary = extractAnalysisSummary(file.content);
        if (!summary)
            continue;
        const label = formatMethodLabel(method);
        items.push(`<div class="analysis-insight-item" data-method="${escapeHTML(method)}">\n` +
            `<h4>${escapeHTML(label)}</h4>\n` +
            `<p>${escapeHTML(summary)}</p>\n` +
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