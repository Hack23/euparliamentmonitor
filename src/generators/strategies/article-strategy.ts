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
import type { ArticleCategory } from '../../types/index.js';
import type { LanguageCode } from '../../types/index.js';
import type { ArticleSource } from '../../types/index.js';
import type { EuropeanParliamentMCPClient } from '../../mcp/ep-mcp-client.js';
import { escapeHTML } from '../../utils/file-utils.js';

// ─── Analysis context types ──────────────────────────────────────────────────

/** Content of a single loaded analysis file */
export interface AnalysisFileContent {
  /** Analysis method that produced this file */
  readonly method: string;
  /** Subdirectory category (e.g. 'classification', 'risk-scoring') */
  readonly subdir: string;
  /** Raw markdown content (frontmatter included) */
  readonly content: string;
  /** Absolute file path on disk */
  readonly filePath: string;
}

/**
 * Analysis context loaded from the analysis pipeline output directory.
 *
 * Strategies call {@link loadAnalysisContext} during {@link ArticleStrategy.fetchData}
 * and store the result in their data payload.  The context is then consumed by
 * {@link ArticleStrategy.buildContent} to enrich articles with analytical depth.
 *
 * When analysis files are not available (e.g. the analysis stage was skipped),
 * the context is `null` and strategies degrade gracefully to their existing
 * behaviour.
 */
export interface LoadedAnalysisContext {
  /** ISO date of the analysis */
  readonly date: string;
  /** Resolved analysis directory path */
  readonly analysisDir: string;
  /** Parsed manifest.json (null when manifest not found) */
  readonly manifest: Record<string, unknown> | null;
  /** Overall confidence from the manifest */
  readonly overallConfidence: string | null;
  /** Loaded analysis files keyed by method name */
  readonly files: ReadonlyMap<string, AnalysisFileContent>;
}

// ─── Analysis loading defaults ───────────────────────────────────────────────

/** Default base directory for analysis output */
const DEFAULT_ANALYSIS_BASE_DIR = 'analysis';

/** Analysis subdirectories to scan for markdown files */
const ANALYSIS_SUBDIRS = [
  'classification',
  'threat-assessment',
  'risk-scoring',
  'existing',
] as const;

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
export function loadAnalysisContext(
  date: string,
  articleTypeSlug: string,
  baseDir: string = DEFAULT_ANALYSIS_BASE_DIR
): LoadedAnalysisContext | null {
  const dateDir = path.resolve(baseDir, date);
  if (!fs.existsSync(dateDir)) return null;

  // Find the best matching analysis directory (exact or latest suffixed)
  const analysisDir = findAnalysisDirectory(dateDir, articleTypeSlug);
  if (!analysisDir) return null;

  // Load manifest.json
  const manifest = loadManifest(analysisDir);

  // Load analysis markdown files from known subdirectories
  const files = loadAnalysisFiles(analysisDir);
  if (files.size === 0 && !manifest) return null;

  const overallConfidence =
    manifest && typeof manifest['overallConfidence'] === 'string'
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
function findAnalysisDirectory(dateDir: string, slug: string): string | null {
  // Always scan for all matching directories (exact + suffixed) to find the latest
  try {
    const entries = fs.readdirSync(dateDir, { withFileTypes: true });
    const suffixPattern = new RegExp(`^${escapeRegExp(slug)}(?:-(\\d+))?$`);
    let bestPath: string | null = null;
    let bestSuffix = -1;

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
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
  } catch {
    return null;
  }
}

/**
 * Escape special regex characters in a string.
 *
 * @param str - Input string to escape
 * @returns Escaped string safe for use in RegExp constructor
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * Load and parse `manifest.json` from an analysis directory.
 *
 * @param analysisDir - Analysis output directory
 * @returns Parsed manifest or null
 */
function loadManifest(analysisDir: string): Record<string, unknown> | null {
  const manifestPath = path.join(analysisDir, 'manifest.json');
  try {
    if (!fs.existsSync(manifestPath)) return null;
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Load analysis markdown files from known subdirectories.
 *
 * @param analysisDir - Analysis output directory
 * @returns Map of method name → file content
 */
function loadAnalysisFiles(analysisDir: string): Map<string, AnalysisFileContent> {
  const files = new Map<string, AnalysisFileContent>();

  for (const subdir of ANALYSIS_SUBDIRS) {
    const subdirPath = path.join(analysisDir, subdir);
    if (!fs.existsSync(subdirPath) || !fs.statSync(subdirPath).isDirectory()) continue;

    try {
      const entries = fs.readdirSync(subdirPath);
      for (const entry of entries) {
        if (!entry.endsWith('.md')) continue;
        const filePath = path.join(subdirPath, entry);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          // Derive method name from filename (strip .md extension)
          const method = entry.replace(/\.md$/u, '');
          files.set(method, { method, subdir, content, filePath });
        } catch {
          // Skip unreadable files
        }
      }
    } catch {
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
export function extractAnalysisSummary(content: string, maxLength: number = 500): string {
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
  const paragraphs: string[] = [];
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' && current) {
      paragraphs.push(current.trim());
      current = '';
    } else if (!trimmed.startsWith('#') && !trimmed.startsWith('---') && trimmed !== '') {
      current += (current ? ' ' : '') + trimmed;
    }
  }
  if (current) paragraphs.push(current.trim());

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
export function buildAnalysisInsightsSection(
  ctx: LoadedAnalysisContext | null | undefined,
  relevantMethods: readonly string[],
  lang: LanguageCode
): string {
  if (!ctx) return '';

  const items: string[] = [];
  for (const method of relevantMethods) {
    const file = ctx.files.get(method);
    if (!file) continue;
    const summary = extractAnalysisSummary(file.content);
    if (!summary) continue;
    const label = formatMethodLabel(method);
    items.push(
      `<div class="analysis-insight-item" data-method="${escapeHTML(method)}">\n` +
        `<h4>${escapeHTML(label)}</h4>\n` +
        `<p>${escapeHTML(summary)}</p>\n` +
        `</div>`
    );
  }

  if (items.length === 0) return '';

  const heading = lang === 'en' ? 'Analysis Pipeline Insights' : 'Analysis Pipeline Insights';
  const confidence = ctx.overallConfidence
    ? ` <span class="confidence-badge">${escapeHTML(ctx.overallConfidence)}</span>`
    : '';

  return (
    `<section class="analysis-pipeline-insights">\n` +
    `<h3>${escapeHTML(heading)}${confidence}</h3>\n` +
    items.join('\n') +
    `\n</section>\n`
  );
}

/**
 * Format an analysis method identifier into a human-readable label.
 *
 * @param method - Method identifier (e.g. 'significance-classification')
 * @returns Formatted label (e.g. 'Significance Classification')
 */
function formatMethodLabel(method: string): string {
  return method
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Article data and strategy interfaces ─────────────────────────────────────

/**
 * Minimum payload every strategy must carry: the article's publication date.
 * Strategy-specific data interfaces extend this base.
 */
export interface ArticleData {
  /** ISO 8601 publication date (YYYY-MM-DD) */
  readonly date: string;
  /** Loaded analysis context from the analysis pipeline (when available) */
  readonly analysisContext?: LoadedAnalysisContext | null | undefined;
}

/**
 * Resolved title, subtitle, keywords, and optional sources for one
 * language version of an article.
 */
export interface ArticleMetadata {
  /** Localized article title */
  readonly title: string;
  /** Localized article subtitle */
  readonly subtitle: string;
  /** SEO keywords */
  readonly keywords: readonly string[];
  /** Article category */
  readonly category: ArticleCategory;
  /** Optional source references */
  readonly sources?: readonly ArticleSource[] | undefined;
}

/**
 * Non-generic base interface for {@link ArticleStrategy} used by the strategy
 * registry.  Expresses the common operations with {@link ArticleData} as the
 * data payload type so that concrete strategies parameterised on a subtype can
 * be stored in a single {@link StrategyRegistry} map without unsafe casts.
 *
 * This interface deliberately relies on TypeScript's bivariant method-parameter
 * checking: a concrete strategy whose methods accept a narrower `TData`
 * (extending {@link ArticleData}) still satisfies this interface structurally.
 * That means the type is not fully sound — a caller that only sees
 * {@link ArticleStrategyBase} could, in principle, pass an {@link ArticleData}
 * value that does not match the concrete strategy's expected `TData` shape.
 *
 * To use this interface safely:
 * - Only pass the `data` object returned by a given strategy's own
 *   {@link ArticleStrategyBase.fetchData | fetchData} to that same strategy's
 *   {@link ArticleStrategyBase.buildContent | buildContent} and
 *   {@link ArticleStrategyBase.getMetadata | getMetadata} methods.
 * - Never mix data payloads between different strategies, even if they share
 *   the {@link ArticleData} base type.
 *
 * External callers that need strong typing for a specific strategy should
 * prefer the generic {@link ArticleStrategy} interface, which preserves the
 * concrete `TData` type and avoids this intentional unsoundness. The
 * {@link ArticleStrategyBase} interface is intended primarily for the internal
 * orchestration / pipeline layer that manages a heterogeneous strategy
 * registry.
 */
export interface ArticleStrategyBase {
  /** The article category this strategy handles */
  readonly type: ArticleCategory;
  /** Names of MCP tools this strategy calls */
  readonly requiredMCPTools: readonly string[];
  /**
   * Fetch all domain data needed to render this article type.
   *
   * @param client - Connected MCP client, or null when MCP is unavailable
   * @param date - ISO 8601 publication date (YYYY-MM-DD)
   * @returns Populated article data payload
   */
  fetchData(client: EuropeanParliamentMCPClient | null, date: string): Promise<ArticleData>;
  /**
   * Build the article HTML body for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article body HTML string
   */
  buildContent(data: ArticleData, lang: LanguageCode): string;
  /**
   * Return title, subtitle, keywords, and sources for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article metadata
   */
  getMetadata(data: ArticleData, lang: LanguageCode): ArticleMetadata;
  /**
   * Optional guard that lets a strategy opt out of generation when the
   * fetched data contains only placeholder / fallback values (e.g. MCP
   * unavailable).  When `true` is returned the orchestrator skips writing
   * all language variants and logs a notice rather than publishing empty
   * placeholder articles.
   *
   * Strategies that do not implement this method are treated as always
   * wanting to generate (i.e. the default is `false`).
   *
   * @param data - Data payload returned by {@link fetchData}
   * @returns `true` when all fetched data is placeholder and generation should be skipped
   */
  shouldSkip?(data: ArticleData): boolean;
}

/**
 * Strategy interface for article generation.
 *
 * Each concrete implementation handles one {@link ArticleCategory}:
 * - {@link module:Generators/Strategies/WeekAheadStrategy}
 * - {@link module:Generators/Strategies/BreakingNewsStrategy}
 * - {@link module:Generators/Strategies/CommitteeReportsStrategy}
 * - {@link module:Generators/Strategies/PropositionsStrategy}
 * - {@link module:Generators/Strategies/MotionsStrategy}
 *
 * @template TData - Concrete data payload type returned by {@link fetchData}
 */
export interface ArticleStrategy<
  TData extends ArticleData = ArticleData,
> extends ArticleStrategyBase {
  /**
   * Fetch all domain data needed to render this article type.
   *
   * @param client - Connected MCP client, or null when MCP is unavailable
   * @param date - ISO 8601 publication date (YYYY-MM-DD)
   * @returns Populated article data payload
   */
  fetchData(client: EuropeanParliamentMCPClient | null, date: string): Promise<TData>;
  /**
   * Build the article HTML body for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article body HTML string
   */
  buildContent(data: TData, lang: LanguageCode): string;
  /**
   * Return title, subtitle, keywords, and sources for the given language.
   *
   * @param data - Data payload returned by {@link fetchData}
   * @param lang - Target language code
   * @returns Article metadata
   */
  getMetadata(data: TData, lang: LanguageCode): ArticleMetadata;
}
