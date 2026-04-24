// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/ArticleGenerator
 * @description CLI entry point for the analysis-artifact-driven article
 * pipeline. Given a run directory under `analysis/daily/`, it aggregates
 * every artifact into a canonical Markdown document, renders it to HTML,
 * and writes one HTML variant per language (plus the English source
 * Markdown).
 *
 * Usage:
 *   npm run generate-article -- --run analysis/daily/2026-01-15/breaking-run1
 *   npm run generate-article -- --run ... --lang en --lang sv
 *   npm run generate-article -- --run ... --out-dir news --title "Headline"
 *
 * Designed to be idempotent: running again with no changes overwrites
 * identical files byte-for-byte.
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { aggregateAnalysisRun, type AggregatedRun } from './analysis-aggregator.js';
import { renderMarkdown } from './markdown-renderer.js';
import { wrapArticleHtml, getArticleFilename } from './article-html.js';
import { ALL_LANGUAGES } from '../constants/language-core.js';
import type { LanguageCode } from '../types/index.js';

/** Parsed CLI arguments. */
export interface CliOptions {
  /**
   * Absolute path to a single analysis run directory, or `null` when
   * operating in `--all` mode (batch over every discovered run).
   */
  readonly runDir: string | null;
  /**
   * Batch mode: when `true`, walk `analysis/daily/**\/manifest.json` and
   * render every run that has a valid `articleType` in its manifest.
   */
  readonly all: boolean;
  /**
   * Optional lower bound (inclusive) on the `YYYY-MM-DD` run date when
   * `all === true`. Runs whose manifest `date` (or directory-derived date)
   * is earlier are skipped.
   */
  readonly since?: string;
  /** Languages to render (defaults to all 14). */
  readonly langs: readonly LanguageCode[];
  /** Output directory for HTML files (defaults to `news/`). */
  readonly outDir: string;
  /** Repo root used for relative path computation. */
  readonly repoRoot: string;
  /** Optional: override the auto-derived article title (single-run only). */
  readonly title?: string;
  /** Optional: override the auto-derived article description (single-run only). */
  readonly description?: string;
  /**
   * When true, only the source Markdown is written (no HTML) — useful for
   * upstream pipelines that translate first and then batch-render.
   */
  readonly markdownOnly: boolean;
}

/** Result summary returned by {@link generateArticle}. */
export interface GenerateResult {
  /** Repo-relative path of the English source Markdown that was written. */
  readonly sourceMarkdownRelPath: string;
  /** Filenames written under `outDir`, relative to `outDir`. */
  readonly writtenFiles: readonly string[];
  /** Metadata from {@link aggregateAnalysisRun}. */
  readonly aggregated: AggregatedRun;
}

/**
 * Parse a flat list of CLI args (no node/script entries) into {@link CliOptions}.
 * Supports `--flag value` and `--flag=value` styles, and repeatable `--lang`.
 *
 * @param argv - Argument list, typically `process.argv.slice(2)`
 * @param repoRoot - Absolute repo root used to resolve default output paths
 * @returns Fully-populated {@link CliOptions} ready for {@link generateArticle}
 */
/** Mutable accumulator backing {@link parseCliArgs}. */
interface CliParseAccumulator {
  runDir: string | null;
  all: boolean;
  since?: string;
  langs: LanguageCode[];
  outDir: string;
  title?: string;
  description?: string;
  markdownOnly: boolean;
}

/**
 * Fold one parsed {@link FlagResult} into the accumulator. Split out so
 * {@link parseCliArgs} stays under the cognitive-complexity budget.
 *
 * @param acc - Mutable accumulator
 * @param result - Parsed flag result
 */
function applyFlagResult(acc: CliParseAccumulator, result: FlagResult): void {
  switch (result.kind) {
    case 'runDir':
      acc.runDir = result.value;
      return;
    case 'all':
      acc.all = true;
      return;
    case 'since':
      acc.since = result.value;
      return;
    case 'lang':
      acc.langs.push(result.value);
      return;
    case 'outDir':
      acc.outDir = result.value;
      return;
    case 'title':
      acc.title = result.value;
      return;
    case 'description':
      acc.description = result.value;
      return;
    case 'markdownOnly':
      acc.markdownOnly = true;
      return;
    default: {
      // Exhaustiveness guard — if a new FlagResult kind is added without a
      // matching case the compiler will surface the gap.
      const exhaustive: never = result;
      throw new Error(`Unhandled flag result: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function parseCliArgs(argv: readonly string[], repoRoot: string): CliOptions {
  const acc: CliParseAccumulator = {
    runDir: null,
    all: false,
    langs: [],
    outDir: path.join(repoRoot, 'news'),
    markdownOnly: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? '';
    const [flag, inlineValue] = arg.includes('=') ? splitFlag(arg) : [arg, undefined];
    const takeValue = (): string => {
      if (inlineValue !== undefined) return inlineValue;
      const next = argv[i + 1];
      if (next === undefined) {
        throw new Error(`Missing value for ${flag}`);
      }
      i++;
      return next;
    };
    applyFlagResult(acc, applyCliFlag(flag, takeValue));
  }
  if (!acc.all) {
    if (!acc.runDir) {
      throw new Error('--run <path> or --all is required');
    }
    if (!fs.existsSync(acc.runDir)) {
      throw new Error(`Run directory does not exist: ${acc.runDir}`);
    }
  }
  const opts: CliOptions = {
    runDir: acc.runDir,
    all: acc.all,
    langs: acc.langs.length > 0 ? acc.langs : [...ALL_LANGUAGES],
    outDir: acc.outDir,
    repoRoot,
    markdownOnly: acc.markdownOnly,
    ...(acc.since !== undefined ? { since: acc.since } : {}),
    ...(acc.title !== undefined ? { title: acc.title } : {}),
    ...(acc.description !== undefined ? { description: acc.description } : {}),
  };
  return opts;
}

/**
 * Result of applying a single CLI flag. Each kind corresponds to one of
 * the accumulator variables in {@link parseCliArgs}. Extracted so the main
 * parser stays under the cognitive-complexity budget.
 */
type FlagResult =
  | { kind: 'runDir'; value: string }
  | { kind: 'all' }
  | { kind: 'since'; value: string }
  | { kind: 'lang'; value: LanguageCode }
  | { kind: 'outDir'; value: string }
  | { kind: 'title'; value: string }
  | { kind: 'description'; value: string }
  | { kind: 'markdownOnly' };

/**
 * Resolve one CLI flag to a {@link FlagResult}. Throws `Error` for any
 * unsupported flag or language code.
 *
 * @param flag - Flag name (e.g. `--run`)
 * @param takeValue - Lazily returns the value argument for value-bearing flags
 * @returns Parsed {@link FlagResult}
 */
function applyCliFlag(flag: string, takeValue: () => string): FlagResult {
  switch (flag) {
    case '--run':
    case '--analysis-dir':
      return { kind: 'runDir', value: path.resolve(takeValue()) };
    case '--all':
      return { kind: 'all' };
    case '--since': {
      const value = takeValue();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error(`--since expects a YYYY-MM-DD date, got: ${value}`);
      }
      return { kind: 'since', value };
    }
    case '--lang':
    case '--language': {
      const value = takeValue();
      if (!ALL_LANGUAGES.includes(value as LanguageCode)) {
        throw new Error(`Unsupported language code: ${value}`);
      }
      return { kind: 'lang', value: value as LanguageCode };
    }
    case '--out-dir':
    case '--output':
      return { kind: 'outDir', value: path.resolve(takeValue()) };
    case '--title':
      return { kind: 'title', value: takeValue() };
    case '--description':
      return { kind: 'description', value: takeValue() };
    case '--markdown-only':
      return { kind: 'markdownOnly' };
    case '--help':
    case '-h':
      printHelp();
      process.exit(0);
    // eslint-disable-next-line no-fallthrough
    default:
      throw new Error(`Unknown argument: ${flag}`);
  }
}

/**
 * Split `--flag=value` into `["--flag", "value"]`.
 *
 * @param arg - Raw argument in `--flag=value` form
 * @returns Tuple of `[flag, value]`
 */
function splitFlag(arg: string): [string, string] {
  const eq = arg.indexOf('=');
  return [arg.slice(0, eq), arg.slice(eq + 1)];
}

/**
 * Print CLI help text to stdout.
 */
function printHelp(): void {
  process.stdout.write(
    [
      'Usage:',
      '  generate-article --run <path> [options]',
      '  generate-article --all [--since YYYY-MM-DD] [options]',
      '',
      'Aggregate analysis artifacts from an `analysis/daily/**/<run>` directory',
      'into a canonical Markdown document and render it to HTML in all 14',
      'languages. The `--all` form walks every run under `analysis/daily/`',
      'and regenerates the full historic catalogue in one pass.',
      '',
      'Options:',
      '  --run <path>          Analysis run directory (single-run mode)',
      '  --all                 Batch-regenerate every run under analysis/daily/',
      '  --since YYYY-MM-DD    With --all: skip runs dated before this cut-off',
      '  --lang <code>         Language to render (repeatable; default: all 14)',
      '  --out-dir <path>      Output directory (default: news/)',
      '  --title <text>        Override article title (single-run only)',
      '  --description <text>  Override article meta description (single-run only)',
      '  --markdown-only       Write only the source .md (skip HTML)',
      '  --help, -h            Show this help',
      '',
    ].join('\n')
  );
}

/**
 * Build the article slug `YYYY-MM-DD-<article-type>[-<runSuffix>]`.
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @param articleType - Article-type slug (e.g. `breaking`)
 * @param runSuffix - Optional collision-suffix (e.g. `run191`) appended when
 *        multiple runs share the same (date, articleType) pair
 * @returns Combined slug used as the file-stem for every language variant
 */
export function buildArticleSlug(
  date: string,
  articleType: string,
  runSuffix?: string
): string {
  const base = `${date}-${articleType}`;
  return runSuffix ? `${base}-${runSuffix}` : base;
}

/**
 * Turn an arbitrary run-id string into a short, filename-safe suffix.
 * Keeps ASCII word/dash characters only and caps the length at 32 to avoid
 * filesystem-path-length surprises.
 *
 * @param runId - Raw run identifier from the manifest (or directory name)
 * @returns Sanitised suffix usable in a filename
 */
export function sanitizeRunSuffix(runId: string): string {
  const cleaned = runId.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned.slice(0, 32) || 'run';
}

/**
 * Return true when a line should be skipped when hunting for the default
 * description (provenance, HTML, headings, tables, comments, etc.).
 *
 * @param line - Trimmed line from the aggregated Markdown source
 * @returns `true` when the line is not prose and should be skipped
 */
function shouldSkipDescriptionLine(line: string): boolean {
  if (line.length === 0) return true;
  if (line.startsWith('#')) return true;
  if (line.startsWith('>')) return true;
  if (line.startsWith('<')) return true;
  if (line.startsWith('|')) return true;
  return false;
}

/**
 * Extract a short description from the first prose paragraph of the
 * aggregated Markdown — used as the default `<meta name="description">`.
 * Skips provenance blockquote, HTML wrappers, headings, and table rows.
 *
 * @param markdown - Aggregated Markdown document
 * @returns Plain-text description, truncated to ≤300 characters
 */
export function extractDefaultDescription(markdown: string): string {
  const lines = markdown.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (shouldSkipDescriptionLine(line)) continue;
    // Strip inline markdown
    const text = line
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .trim();
    if (text.length > 40) {
      return text.length > 300 ? `${text.slice(0, 297)}...` : text;
    }
  }
  return 'EU Parliament intelligence summary derived from committed analysis artifacts.';
}

/**
 * Render a single language-variant article. Pulls from a pre-translated
 * `<slug>.<lang>.md` file when it exists, otherwise renders the English
 * aggregate. Extracted from {@link generateArticle} so the outer function
 * stays under the cognitive-complexity budget.
 *
 * @param lang - Target language code
 * @param slug - Article slug (`<date>-<type>`)
 * @param aggregated - Aggregated-run metadata
 * @param englishHtml - Pre-rendered HTML of the English aggregate
 * @param chromeOptions - Shared chrome options (title/description/source path)
 * @param chromeOptions.title - Article title
 * @param chromeOptions.description - Article meta description
 * @param chromeOptions.sourceMarkdownRelPath - Repo-relative path of the
 *        canonical English Markdown source written by the same run
 * @param opts - CLI options (needed for `outDir`)
 * @returns Relative filename of the HTML file written
 */
function writeLanguageVariant(
  lang: LanguageCode,
  slug: string,
  aggregated: AggregatedRun,
  englishHtml: string,
  chromeOptions: {
    title: string;
    description: string;
    sourceMarkdownRelPath: string;
  },
  opts: CliOptions
): string {
  const langMdFilename = `${slug}.${lang}.md`;
  const langMdAbs = path.join(opts.outDir, langMdFilename);
  let bodyHtml = englishHtml;
  if (lang !== 'en' && fs.existsSync(langMdAbs)) {
    const source = fs.readFileSync(langMdAbs, 'utf8');
    bodyHtml = renderMarkdown(source).html;
  }
  const html = wrapArticleHtml({
    lang,
    articleSlug: slug,
    body: bodyHtml,
    title: chromeOptions.title,
    description: chromeOptions.description,
    date: aggregated.date,
    articleType: aggregated.articleType,
    sourceMarkdownRelPath: chromeOptions.sourceMarkdownRelPath,
  });
  const filename = getArticleFilename(slug, lang);
  fs.writeFileSync(path.join(opts.outDir, filename), html, 'utf8');
  return filename;
}

/**
 * Run the full aggregate → render → write pipeline for one run.
 *
 * @param opts - Fully-populated {@link CliOptions} (typically from
 *               {@link parseCliArgs}) — must have a non-null `runDir`
 * @param runSuffix - Optional collision-suffix appended to the slug when
 *        multiple runs share the same (date, articleType) pair in batch mode
 * @returns Summary of the generated artefacts ({@link GenerateResult})
 */
export function generateArticle(opts: CliOptions, runSuffix?: string): GenerateResult {
  if (!opts.runDir) {
    throw new Error('generateArticle: runDir is required');
  }
  const aggregated = aggregateAnalysisRun({
    runDir: opts.runDir,
    repoRoot: opts.repoRoot,
  });
  const slug = buildArticleSlug(aggregated.date, aggregated.articleType, runSuffix);
  const title = opts.title ?? defaultTitle(aggregated);
  const description = opts.description ?? extractDefaultDescription(aggregated.markdown);

  // Write source Markdown under <outDir>/<slug>.en.md for transparency.
  ensureDir(opts.outDir);
  const sourceMdFilename = `${slug}.en.md`;
  const sourceMdAbs = path.join(opts.outDir, sourceMdFilename);
  fs.writeFileSync(sourceMdAbs, aggregated.markdown, 'utf8');
  const sourceMdRelPath = path.relative(opts.repoRoot, sourceMdAbs).split(path.sep).join('/');

  const written: string[] = [sourceMdFilename];
  if (!opts.markdownOnly) {
    const rendered = renderMarkdown(aggregated.markdown);
    const chromeOptions = {
      title,
      description,
      sourceMarkdownRelPath: sourceMdRelPath,
    };
    for (const lang of opts.langs) {
      const filename = writeLanguageVariant(
        lang,
        slug,
        aggregated,
        rendered.html,
        chromeOptions,
        opts
      );
      written.push(filename);
    }
  }
  return { sourceMarkdownRelPath: sourceMdRelPath, writtenFiles: written, aggregated };
}

/** Candidate run discovered under `analysis/daily/`. */
export interface DiscoveredRun {
  /** Absolute run directory path. */
  readonly runDir: string;
  /** Article type from the manifest (never `"unknown"`). */
  readonly articleType: string;
  /** Run date resolved from the manifest or directory name. */
  readonly date: string;
  /** Run identifier from the manifest, or the directory basename. */
  readonly runId: string;
}

/**
 * Walk `analysis/daily/` recursively and return every subdirectory that
 * contains a `manifest.json` with a non-empty, non-`unknown` `articleType`.
 * Runs missing a manifest or carrying a default `articleType` are skipped
 * so batch runs don't emit garbage articles like
 * `2026-04-13-unknown-en.html`.
 *
 * @param repoRoot - Absolute repository root
 * @returns Sorted list of discovered runs (oldest date first, then lexical)
 */
export function discoverAnalysisRuns(repoRoot: string): DiscoveredRun[] {
  const root = path.join(repoRoot, 'analysis', 'daily');
  if (!fs.existsSync(root)) return [];
  const results: DiscoveredRun[] = [];
  const walk = (dir: string): void => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    // If this dir has a manifest, consider it a run and do not descend.
    const manifestPath = path.join(dir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const run = readRunCandidate(dir, manifestPath);
      if (run) results.push(run);
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
    }
  };
  walk(root);
  results.sort(
    (a, b) => (a.date === b.date ? a.runDir.localeCompare(b.runDir) : a.date.localeCompare(b.date))
  );
  return results;
}

/**
 * Read and validate the manifest for a candidate run directory.
 *
 * @param runDir - Absolute path of the candidate directory
 * @param manifestPath - Absolute path of its `manifest.json`
 * @returns {@link DiscoveredRun} when the manifest declares a valid
 *          article type, `null` otherwise (silently skipped by `--all`)
 */
function readRunCandidate(runDir: string, manifestPath: string): DiscoveredRun | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
  const articleType = typeof parsed.articleType === 'string' ? parsed.articleType : '';
  if (!articleType || articleType === 'unknown') return null;
  const dateFromManifest = typeof parsed.date === 'string' ? parsed.date : '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateFromManifest)
    ? dateFromManifest
    : dateFromRunPath(runDir);
  const runId = typeof parsed.runId === 'string' && parsed.runId ? parsed.runId : path.basename(runDir);
  return { runDir, articleType, date, runId };
}

/**
 * Pull the `YYYY-MM-DD` date from a run-dir path segment. Falls back to the
 * epoch date when no ISO date is embedded.
 *
 * @param runDir - Absolute run directory path
 * @returns ISO date string
 */
function dateFromRunPath(runDir: string): string {
  const match = /(\d{4}-\d{2}-\d{2})/.exec(runDir);
  return match ? (match[1] ?? '1970-01-01') : '1970-01-01';
}

/**
 * Group discovered runs by `(date, articleType)` so callers can decide
 * whether a collision-suffix is needed when writing articles.
 *
 * @param runs - Discovered runs
 * @returns Map from `"<date>|<articleType>"` to the runs in that group
 */
export function groupRunsForCollision(
  runs: readonly DiscoveredRun[]
): Map<string, DiscoveredRun[]> {
  const groups = new Map<string, DiscoveredRun[]>();
  for (const run of runs) {
    const key = `${run.date}|${run.articleType}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(run);
    groups.set(key, bucket);
  }
  return groups;
}

/**
 * Batch-generate articles for every discovered run. Runs that share a
 * `(date, articleType)` pair are disambiguated by appending the sanitised
 * `runId` as a slug suffix so none of the language variants are ever
 * silently overwritten.
 *
 * @param opts - CLI options (must have `all: true`)
 * @returns Per-run generation results in the order they were processed
 */
export function generateAllArticles(opts: CliOptions): GenerateResult[] {
  const allRuns = discoverAnalysisRuns(opts.repoRoot);
  const filtered = opts.since
    ? allRuns.filter((r) => r.date >= (opts.since as string))
    : allRuns;
  const groups = groupRunsForCollision(filtered);
  const results: GenerateResult[] = [];
  for (const run of filtered) {
    const key = `${run.date}|${run.articleType}`;
    const bucket = groups.get(key) ?? [];
    const suffix = bucket.length > 1 ? sanitizeRunSuffix(run.runId) : undefined;
    const runOpts: CliOptions = { ...opts, runDir: run.runDir };
    results.push(generateArticle(runOpts, suffix));
  }
  return results;
}

/**
 * Derive a default article title from the aggregated run metadata.
 *
 * @param run - Aggregated run metadata
 * @returns Human-readable title like `EU Parliament Breaking — 2026-01-15`
 */
function defaultTitle(run: AggregatedRun): string {
  const typeLabel = run.articleType
    .split(/[-_]/g)
    .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg))
    .join(' ')
    .trim();
  return `EU Parliament ${typeLabel || 'Intelligence'} — ${run.date}`;
}

/**
 * Create `dir` recursively if it doesn't already exist.
 *
 * @param dir - Absolute directory path to ensure
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Main entry when invoked as a script. Uses `process.argv.slice(2)` and the
 * current working directory as repo root unless overridden by `REPO_ROOT`.
 *
 * @param argv - Argument list (defaults to `process.argv.slice(2)`)
 */
export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<void> {
  const repoRoot = process.env.REPO_ROOT ? path.resolve(process.env.REPO_ROOT) : process.cwd();
  const opts = parseCliArgs(argv, repoRoot);
  if (opts.all) {
    const results = generateAllArticles(opts);
    let totalFiles = 0;
    let totalArtifacts = 0;
    for (const r of results) {
      totalFiles += r.writtenFiles.length;
      totalArtifacts += r.aggregated.includedArtifacts.length;
      process.stdout.write(
        `  [${r.aggregated.date}/${r.aggregated.articleType}] ${r.writtenFiles.length} file(s) · ${r.aggregated.includedArtifacts.length} artifact(s) · gate ${r.aggregated.gateResult}\n`
      );
    }
    process.stdout.write(
      `Generated ${totalFiles} file(s) across ${results.length} run(s) from ${totalArtifacts} total artifact(s)\n`
    );
    return;
  }
  const result = generateArticle(opts);
  process.stdout.write(
    `Generated ${result.writtenFiles.length} file(s) from ${result.aggregated.includedArtifacts.length} artifact(s) — gate: ${result.aggregated.gateResult}\n`
  );
  for (const f of result.writtenFiles) process.stdout.write(`  ${f}\n`);
}

// Only run when invoked directly, not when imported by tests.
const isMain = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(entry).href;
  } catch {
    return false;
  }
})();

if (isMain) {
  main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`generate-article: ${msg}\n`);
    process.exit(1);
  });
}
