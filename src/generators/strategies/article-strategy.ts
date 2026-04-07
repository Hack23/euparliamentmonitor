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
import { ANALYSIS_INSIGHTS_HEADING, getLocalizedString } from '../../constants/languages.js';

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
export function loadAnalysisContext(
  date: string,
  articleTypeSlug: string,
  baseDir: string = DEFAULT_ANALYSIS_BASE_DIR
): LoadedAnalysisContext | null {
  // Validate date format (YYYY-MM-DD) and reject path traversal
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) return null;

  // Resolve base dir: prefer explicit non-default param, then env var, then default
  const resolvedBaseDir =
    baseDir !== DEFAULT_ANALYSIS_BASE_DIR
      ? baseDir
      : process.env[ENV_ANALYSIS_DIR]?.trim() || DEFAULT_ANALYSIS_BASE_DIR;

  // Resolve slug: prefer env var override, then per-strategy slug
  const resolvedSlug = process.env[ENV_ANALYSIS_SLUG]?.trim() || articleTypeSlug;

  // Validate slug: alphanumeric, hyphens only — no path separators
  if (!/^[\da-z][\da-z-]*$/u.test(resolvedSlug)) return null;

  const dateDir = path.resolve(resolvedBaseDir, date);
  if (!fs.existsSync(dateDir)) return null;

  // Find the best matching analysis directory (exact or latest suffixed)
  const analysisDir = findAnalysisDirectory(dateDir, resolvedSlug);
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
export function extractFrontmatterMethod(content: string): string | null {
  if (!content.startsWith('---')) return null;
  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return null;
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
function loadSingleAnalysisFile(
  files: Map<string, AnalysisFileContent>,
  filePath: string,
  entry: string,
  subdir: string
): void {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filenameKey = entry.replace(/\.md$/u, '');
    const frontmatterMethod = extractFrontmatterMethod(content);
    // Primary key: frontmatter method (canonical ID), fallback to filename
    const method = frontmatterMethod ?? filenameKey;
    const fileContent: AnalysisFileContent = { method, subdir, content, filePath };
    files.set(method, fileContent);
    // Register filename alias when it differs from the frontmatter method
    if (frontmatterMethod && frontmatterMethod !== filenameKey) {
      files.set(filenameKey, fileContent);
    }
  } catch {
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
function loadAnalysisFiles(analysisDir: string): Map<string, AnalysisFileContent> {
  const files = new Map<string, AnalysisFileContent>();

  for (const subdir of ANALYSIS_SUBDIRS) {
    const subdirPath = path.join(analysisDir, subdir);
    try {
      if (!fs.existsSync(subdirPath) || !fs.statSync(subdirPath).isDirectory()) continue;
      const entries = fs.readdirSync(subdirPath);
      for (const entry of entries) {
        if (!entry.endsWith('.md')) continue;
        loadSingleAnalysisFile(files, path.join(subdirPath, entry), entry, subdir);
      }
    } catch {
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
function isNonProseContent(trimmed: string): boolean {
  // Fenced code block delimiters
  if (trimmed.startsWith('```')) return true;
  // Markdown table rows (contain | separators)
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) return true;
  // Table separator rows
  if (/^\|[\s:|-]+\|$/u.test(trimmed)) return true;
  // Blockquote instructions for AI agents
  if (trimmed.startsWith('>') && /instructions for ai/iu.test(trimmed)) return true;
  // HTML-like content
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) return true;
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
] as const;

/**
 * Check whether an analysis file contains only scaffold/template content
 * (i.e. the AI agent did not fill in the analysis).
 *
 * @param content - Raw markdown file content
 * @returns `true` when the file is an unfilled scaffold
 */
export function isScaffoldContent(content: string): boolean {
  return SCAFFOLD_PATTERNS.some((pattern) => pattern.test(content));
}

/**
 * Check whether a line should be included as prose content.
 *
 * @param trimmed - Trimmed line text
 * @returns `true` when the line is valid prose (not heading, separator, or non-prose)
 */
function isProseContent(trimmed: string): boolean {
  if (trimmed === '') return false;
  if (trimmed.startsWith('#')) return false;
  if (trimmed.startsWith('---')) return false;
  if (isNonProseContent(trimmed)) return false;
  return true;
}

/**
 * Strip markdown formatting (bold, italic) from a text string.
 *
 * @param text - Raw markdown text
 * @returns Plain text with bold/italic markers removed
 */
function stripMarkdownFormatting(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
}

/**
 * Prepare analysis content body by stripping frontmatter and code blocks.
 *
 * @param content - Raw markdown content
 * @returns Body text ready for paragraph extraction, or empty string for scaffold content
 */
function prepareAnalysisBody(content: string): string {
  if (isScaffoldContent(content)) return '';

  let body = content;
  if (body.startsWith('---')) {
    const endIdx = body.indexOf('---', 3);
    if (endIdx !== -1) body = body.slice(endIdx + 3);
  }
  return body.replace(/```[\s\S]*?```/g, '');
}

/**
 * Collect prose paragraphs from prepared analysis body text.
 *
 * @param body - Analysis body with frontmatter/code blocks removed
 * @returns Array of prose paragraphs
 */
function collectParagraphs(body: string): readonly string[] {
  const lines = body.split('\n');
  const paragraphs: string[] = [];
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' && current) {
      paragraphs.push(current.trim());
      current = '';
    } else if (isProseContent(trimmed)) {
      current += (current ? ' ' : '') + stripMarkdownFormatting(trimmed);
    }
  }
  if (current) paragraphs.push(current.trim());
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
export function extractAnalysisSummary(content: string, maxLength: number = 500): string {
  const body = prepareAnalysisBody(content);
  if (!body) return '';

  const paragraphs = collectParagraphs(body);

  // Filter out short fragments and data-only paragraphs
  const meaningful = paragraphs.filter(
    (p) => p.length > 20 && !/^[\d\s|—–-]+$/u.test(p) && !/^\s*—\s*$/u.test(p)
  );

  const summary = meaningful[0] ?? '';
  return summary.length > maxLength ? summary.slice(0, maxLength - 3) + '...' : summary;
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
export function extractAnalysisParagraphs(
  content: string,
  maxParagraphs: number = 3,
  maxTotalLength: number = 1500
): readonly string[] {
  const body = prepareAnalysisBody(content);
  if (!body) return [];

  const paragraphs = collectParagraphs(body);

  // Filter out short fragments and data-only paragraphs
  const meaningful = paragraphs.filter(
    (p) => p.length > 50 && !/^[\d\s|—–-]+$/u.test(p) && !/^\s*—\s*$/u.test(p)
  );

  const result: string[] = [];
  let totalLength = 0;
  for (const p of meaningful) {
    if (result.length >= maxParagraphs) break;
    if (totalLength + p.length > maxTotalLength) break;
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
export function hasSubstantiveAIContent(content: string): boolean {
  const body = prepareAnalysisBody(content);
  if (!body) return false;

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
    // Skip scaffold/placeholder files and files without substantive content
    if (isScaffoldContent(file.content)) continue;
    if (!hasSubstantiveAIContent(file.content)) continue;

    const paragraphs = extractAnalysisParagraphs(file.content, 2, 800);
    if (paragraphs.length === 0) continue;
    const label = formatMethodLabel(method);
    const paragraphHtml = paragraphs
      .map((p) => `<p>${escapeHTML(p)}</p>`)
      .join('\n');
    items.push(
      `<div class="analysis-insight-item" data-method="${escapeHTML(method)}">\n` +
        `<h4>${escapeHTML(label)}</h4>\n` +
        paragraphHtml + '\n' +
        `</div>`
    );
  }

  if (items.length === 0) return '';

  const heading = getLocalizedString(ANALYSIS_INSIGHTS_HEADING, lang);
  const confidence = ctx.overallConfidence
    ? ` <span class="confidence-badge">${escapeHTML(ctx.overallConfidence)}</span>`
    : '';

  return (
    `<section class="analysis-pipeline-insights" role="region" aria-label="${escapeHTML(heading)}">\n` +
    `<h2>${escapeHTML(heading)}${confidence}</h2>\n` +
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
