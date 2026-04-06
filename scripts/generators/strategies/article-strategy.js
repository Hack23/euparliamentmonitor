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
// ─── Analysis loading defaults ───────────────────────────────────────────────
/** Default base directory for analysis output */
const DEFAULT_ANALYSIS_BASE_DIR = 'analysis';
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
 * @param date - ISO 8601 date (YYYY-MM-DD) of the analysis run
 * @param articleTypeSlug - Article type slug (e.g. 'breaking', 'week-ahead')
 * @param baseDir - Base analysis directory (defaults to 'analysis')
 * @returns Loaded analysis context or null when unavailable
 */
export function loadAnalysisContext(date, articleTypeSlug, baseDir = DEFAULT_ANALYSIS_BASE_DIR) {
    const dateDir = path.resolve(baseDir, date);
    if (!fs.existsSync(dateDir))
        return null;
    // Find the best matching analysis directory (exact or latest suffixed)
    const analysisDir = findAnalysisDirectory(dateDir, articleTypeSlug);
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
 * Load analysis markdown files from known subdirectories.
 *
 * @param analysisDir - Analysis output directory
 * @returns Map of method name → file content
 */
function loadAnalysisFiles(analysisDir) {
    const files = new Map();
    for (const subdir of ANALYSIS_SUBDIRS) {
        const subdirPath = path.join(analysisDir, subdir);
        if (!fs.existsSync(subdirPath) || !fs.statSync(subdirPath).isDirectory())
            continue;
        try {
            const entries = fs.readdirSync(subdirPath);
            for (const entry of entries) {
                if (!entry.endsWith('.md'))
                    continue;
                const filePath = path.join(subdirPath, entry);
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    // Derive method name from filename (strip .md extension)
                    const method = entry.replace(/\.md$/u, '');
                    files.set(method, { method, subdir, content, filePath });
                }
                catch {
                    // Skip unreadable files
                }
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
 * @param lang - Target language code (used for section heading)
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
    const heading = lang === 'en' ? 'Analysis Pipeline Insights' : 'Analysis Pipeline Insights';
    const confidence = ctx.overallConfidence
        ? ` <span class="confidence-badge">${escapeHTML(ctx.overallConfidence)}</span>`
        : '';
    return (`<section class="analysis-pipeline-insights">\n` +
        `<h3>${escapeHTML(heading)}${confidence}</h3>\n` +
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