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
import {
  aggregateAnalysisRun,
  resolveArticleTypeFromManifest,
  type AggregatedRun,
} from './analysis-aggregator.js';
import type { Manifest } from './manifest/index.js';
import {
  resolveArticleMetadata,
  extractStrongProseLine,
  type MetadataManifest,
  type ResolvedMetadata,
} from './article-metadata.js';
import { renderMarkdown } from './markdown-renderer.js';
import { wrapArticleHtml, getArticleFilename } from './article-html.js';
import { ALL_LANGUAGES } from '../constants/language-core.js';
import type { LanguageCode } from '../types/index.js';
import { blobUrl } from './infra/github-urls.js';
import {
  buildArticleSlug as _buildArticleSlug,
  sanitizeRunSuffix as _sanitizeRunSuffix,
} from './slug/index.js';
import {
  discoverAnalysisRuns as _discoverAnalysisRuns,
  groupRunsForCollision as _groupRunsForCollision,
  type DiscoveredRun as _DiscoveredRun,
} from './runs/index.js';

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
  /**
   * Repo-relative path of the `article.md` written directly into the
   * analysis run directory — canonical Markdown source that lives alongside
   * the artifacts that produced it (riksdagsmonitor pattern).
   */
  readonly runArticleMdRelPath: string;
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
 * Thin re-export of the canonical implementation in
 * `aggregator/slug/index.js` preserved here for back-compat with the
 * existing test suite.
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @param articleType - Article-type slug (e.g. `breaking`)
 * @param runSuffix - Optional collision-suffix (e.g. `run191`)
 * @returns Combined slug used as the file-stem for every language variant
 */
export function buildArticleSlug(date: string, articleType: string, runSuffix?: string): string {
  return _buildArticleSlug(date, articleType, runSuffix);
}

/**
 * Turn an arbitrary run-id string into a short, filename-safe suffix.
 *
 * Thin re-export of the canonical implementation in
 * `aggregator/slug/index.js`.
 *
 * @param runId - Raw run identifier from the manifest (or directory name)
 * @returns Sanitised suffix usable in a filename
 */
export function sanitizeRunSuffix(runId: string): string {
  return _sanitizeRunSuffix(runId);
}

/**
 * Return `true` when a line should be skipped when hunting for the default
 * description. Thin wrapper preserved for back-compat — real logic lives
 * in `src/aggregator/article-metadata.ts`'s `shouldSkipDescriptionLine`.
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

/** Description used when no prose paragraph qualifies. */
const FALLBACK_DESCRIPTION =
  'EU Parliament intelligence summary derived from committed analysis artifacts.';

/**
 * Extract a short description from the first prose paragraph of the
 * aggregated Markdown — used as the default `<meta name="description">`.
 * Uses the stricter `extractStrongProseLine` filter from
 * `article-metadata.ts` so mermaid `%%{init}` blocks, `title …` directives,
 * emoji-banner metadata rows, and `Analysis Date:` / `Run:` / `Window:`
 * style banners no longer leak into `<meta description>`. Kept as an
 * exported thin wrapper for back-compat with the existing test suite.
 *
 * @param markdown - Aggregated Markdown document
 * @returns Plain-text description, truncated to ≤300 characters
 */
export function extractDefaultDescription(markdown: string): string {
  // Suppress unused warning: keep `shouldSkipDescriptionLine` for any
  // historic consumer importing it transitively.
  void shouldSkipDescriptionLine;
  const strong = extractStrongProseLine(markdown);
  return strong.length > 0 ? strong : FALLBACK_DESCRIPTION;
}

/**
 * Escape a string for a conservative double-quoted YAML scalar.
 *
 * @param value - Raw metadata value
 * @returns YAML-safe quoted string content (without surrounding quotes)
 */
function yamlEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ');
}

/**
 * Build the Jekyll-compatible Markdown source committed as `article.md`.
 * The renderer strips this front matter before HTML conversion, while the
 * source file stays portable to Jekyll/GitHub Pages and aligned with the
 * Riksdagsmonitor article contract.
 *
 * @param aggregated - Aggregated analysis body and run metadata
 * @param metadata - English metadata resolved for SEO
 * @param metadata.title - Resolved English article title
 * @param metadata.description - Resolved English article description
 * @param slug - Article slug used by generated news paths
 * @param sourceFolder - Repo-relative analysis run directory
 * @returns Markdown with YAML front matter followed by the aggregate body
 */
function buildJekyllArticleMarkdown(
  aggregated: AggregatedRun,
  metadata: { readonly title: string; readonly description: string },
  slug: string,
  sourceFolder: string
): string {
  const frontMatter = [
    '---',
    `title: "${yamlEscape(metadata.title)}"`,
    `description: "${yamlEscape(metadata.description)}"`,
    `date: ${aggregated.date}`,
    `article_type: ${aggregated.articleType}`,
    `slug: ${slug}`,
    `source_folder: ${sourceFolder}`,
    `generated_at: ${aggregated.date}T00:00:00.000Z`,
    'language: en',
    'layout: article',
    '---',
    '',
  ].join('\n');
  return `${frontMatter}${aggregated.markdown}`;
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
 * @param chromeOptions - Shared chrome options
 * @param chromeOptions.metadata - Per-language `{title, description}` map
 *        resolved by {@link resolveArticleMetadata}
 * @param chromeOptions.sourceMarkdownRelPath - Repo-relative path of the
 *        canonical English Markdown source written by the same run
 * @param chromeOptions.articleCount - Total article count surfaced in the
 *        site footer's `<p class="footer-stats">…</p>` line
 * @param opts - CLI options (needed for `outDir`)
 * @returns Relative filename of the HTML file written
 */
function writeLanguageVariant(
  lang: LanguageCode,
  slug: string,
  aggregated: AggregatedRun,
  englishHtml: string,
  chromeOptions: {
    metadata: ResolvedMetadata;
    sourceMarkdownRelPath: string;
    articleCount: number;
  },
  opts: CliOptions
): string {
  const langMdFilename = `${slug}.${lang}.md`;
  const langMdAbs = path.join(opts.outDir, langMdFilename);
  let bodyHtml = englishHtml;
  let metaSource = aggregated.markdown;
  if (lang !== 'en' && fs.existsSync(langMdAbs)) {
    metaSource = fs.readFileSync(langMdAbs, 'utf8');
    bodyHtml = renderMarkdown(metaSource).html;
  }
  // When a per-language translated source exists, prefer a summary derived
  // from it so the `<meta description>` matches the visible prose. The
  // editorial title still comes from the English resolver (per-language
  // translations of the headline are a future enhancement tracked as
  // out-of-scope).
  const entry = getMetadataEntry(chromeOptions.metadata, lang);
  const perLangDescription =
    lang !== 'en' && metaSource !== aggregated.markdown
      ? extractStrongProseLine(metaSource) || entry.description
      : entry.description;
  const html = wrapArticleHtml({
    lang,
    articleSlug: slug,
    body: bodyHtml,
    title: entry.title,
    description: perLangDescription,
    date: aggregated.date,
    articleType: aggregated.articleType,
    sourceMarkdownRelPath: chromeOptions.sourceMarkdownRelPath,
    toc: aggregated.sectionToc,
    articleCount: chromeOptions.articleCount,
    isBasedOn: aggregated.includedArtifacts.map((a) => blobUrl(a.repoRelPath)),
  });
  const filename = getArticleFilename(slug, lang);
  fs.writeFileSync(path.join(opts.outDir, filename), html, 'utf8');
  return filename;
}

/**
 * Safely look up one language entry in a {@link ResolvedMetadata} map.
 * The runtime shape is always complete (one entry per language), but the
 * access goes via `Object.getOwnPropertyDescriptor` to satisfy ESLint's
 * `security/detect-object-injection` rule.
 *
 * @param map - Resolved per-language metadata
 * @param lang - Target language code
 * @returns The entry for `lang` (always populated by
 *          {@link resolveArticleMetadata})
 */
function getMetadataEntry(
  map: ResolvedMetadata,
  lang: LanguageCode
): { readonly title: string; readonly description: string } {
  const descriptor = Object.getOwnPropertyDescriptor(map, lang);
  if (descriptor?.value) {
    return descriptor.value as { readonly title: string; readonly description: string };
  }
  const en = Object.getOwnPropertyDescriptor(map, 'en')?.value as
    | { readonly title: string; readonly description: string }
    | undefined;
  return en ?? { title: '', description: '' };
}

/**
 * Count the number of articles the site currently publishes, derived
 * from `analysis/daily/**` runs with a valid `articleType` — the same
 * set that `npm run generate-article:all` would materialise. Using the
 * analysis-run catalogue (rather than the `<outDir>` filesystem) keeps
 * the derived count stable across repeated invocations of
 * {@link generateArticle}, preserving determinism for reproducible-build
 * tests and preventing the footer from drifting as a batch run
 * progresses.
 *
 * @param repoRoot - Absolute path to the repository root
 * @returns Non-negative article count (zero when the analysis tree is empty)
 */
function countPublishedArticles(repoRoot: string): number {
  try {
    return discoverAnalysisRuns(repoRoot).length;
  } catch {
    return 0;
  }
}

/**
 * Run the full aggregate → render → write pipeline for one run.
 *
 * @param opts - Fully-populated {@link CliOptions} (typically from
 *               {@link parseCliArgs}) — must have a non-null `runDir`
 * @param runSuffix - Optional collision-suffix appended to the slug when
 *        multiple runs share the same (date, articleType) pair in batch mode
 * @param articleCountOverride - Optional total article count to surface in
 *        the footer's `<p class="footer-stats">…</p>`. When omitted the
 *        count is derived from `<outDir>/*-en.html` — accurate for single
 *        runs but misleading mid-batch, so {@link generateAllArticles}
 *        passes the final total here.
 * @returns Summary of the generated artefacts ({@link GenerateResult})
 */
export function generateArticle(
  opts: CliOptions,
  runSuffix?: string,
  articleCountOverride?: number
): GenerateResult {
  if (!opts.runDir) {
    throw new Error('generateArticle: runDir is required');
  }
  const aggregated = aggregateAnalysisRun({
    runDir: opts.runDir,
    repoRoot: opts.repoRoot,
  });
  const slug = buildArticleSlug(aggregated.date, aggregated.articleType, runSuffix);

  // Resolve per-language {title, description} from the real article
  // content (manifest override → artefact H1 → aggregated H1 → strong
  // prose → localized template). This replaces the previous
  // `defaultTitle()` + `extractDefaultDescription()` approach which
  // produced boring, repeated metadata.
  const manifestMetadata = readManifestMetadata(opts.runDir);
  const resolvedMetadata = resolveArticleMetadata({
    articleType: aggregated.articleType,
    date: aggregated.date,
    markdown: aggregated.markdown,
    manifest: manifestMetadata,
    runDir: opts.runDir,
  });

  // CLI `--title` / `--description` overrides still win over everything
  // (used by ad-hoc curator runs and by the existing test suite).
  const effectiveMetadata: ResolvedMetadata =
    opts.title || opts.description
      ? applyCliOverrides(resolvedMetadata, opts.title, opts.description)
      : resolvedMetadata;
  const runDirRelPath = path.relative(opts.repoRoot, opts.runDir).split(path.sep).join('/');
  const sourceMarkdown = buildJekyllArticleMarkdown(
    aggregated,
    getMetadataEntry(effectiveMetadata, 'en'),
    slug,
    runDirRelPath
  );

  // Write article.md INTO the analysis run directory — canonical Markdown
  // source that lives alongside the artifacts that produced it.
  // This mirrors the riksdagsmonitor pattern where `article.md` is committed
  // inside `analysis/daily/<date>/<type>/` so every run has a browsable,
  // version-controlled Markdown source in its own directory.
  const runArticleMdAbs = path.join(opts.runDir, 'article.md');
  fs.writeFileSync(runArticleMdAbs, sourceMarkdown, 'utf8');
  const runArticleMdRelPath = path
    .relative(opts.repoRoot, runArticleMdAbs)
    .split(path.sep)
    .join('/');

  // Also write source Markdown under <outDir>/<slug>.en.md for search
  // indexing and backwards compatibility with existing news-index scripts.
  ensureDir(opts.outDir);
  const sourceMdFilename = `${slug}.en.md`;
  const sourceMdAbs = path.join(opts.outDir, sourceMdFilename);
  fs.writeFileSync(sourceMdAbs, sourceMarkdown, 'utf8');

  const written: string[] = [sourceMdFilename];
  if (!opts.markdownOnly) {
    const rendered = renderMarkdown(sourceMarkdown);
    const chromeOptions = {
      metadata: effectiveMetadata,
      // Point the "View source Markdown" link at the canonical run-directory
      // article.md so readers can trace the HTML back to the analysis tree.
      sourceMarkdownRelPath: runArticleMdRelPath,
      articleCount: articleCountOverride ?? countPublishedArticles(opts.repoRoot),
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
  return {
    sourceMarkdownRelPath: runArticleMdRelPath,
    runArticleMdRelPath,
    writtenFiles: written,
    aggregated,
  };
}

/**
 * One run discovered by {@link discoverAnalysisRuns}.
 *
 * Thin re-export of {@link _DiscoveredRun} from `aggregator/runs/index.js`,
 * preserved here as the public type for `article-generator` consumers.
 */
export type DiscoveredRun = _DiscoveredRun;

/**
 * Walk `analysis/daily/` recursively and return every subdirectory that
 * contains a `manifest.json` with a non-empty, non-`unknown` `articleType`.
 *
 * Thin re-export of {@link _discoverAnalysisRuns} from
 * `aggregator/runs/index.js`.
 *
 * @param repoRoot - Absolute repository root
 * @returns Sorted list of discovered runs (oldest date first, then lexical)
 */
export function discoverAnalysisRuns(repoRoot: string): DiscoveredRun[] {
  return _discoverAnalysisRuns(repoRoot);
}

/**
 * Group discovered runs by `(date, articleType)` so callers can decide
 * whether a collision-suffix is needed when writing articles.
 *
 * Thin re-export of {@link _groupRunsForCollision} from
 * `aggregator/runs/index.js`.
 *
 * @param runs - Discovered runs
 * @returns Map from `"<date>|<articleType>"` to the runs in that group
 */
export function groupRunsForCollision(
  runs: readonly DiscoveredRun[]
): Map<string, DiscoveredRun[]> {
  return _groupRunsForCollision(runs);
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
  const filtered = opts.since ? allRuns.filter((r) => r.date >= (opts.since as string)) : allRuns;
  const groups = groupRunsForCollision(filtered);
  const results: GenerateResult[] = [];
  // Pre-compute the total article count so every footer in the batch
  // surfaces a stable number rather than the directory size at the moment
  // each run is rendered (which would grow from 0 → N during the batch).
  const articleCountOverride = filtered.length;
  for (const run of filtered) {
    const key = `${run.date}|${run.articleType}`;
    const bucket = groups.get(key) ?? [];
    const suffix = bucket.length > 1 ? sanitizeRunSuffix(run.runId) : undefined;
    const runOpts: CliOptions = { ...opts, runDir: run.runDir };
    results.push(generateArticle(runOpts, suffix, articleCountOverride));
  }
  return results;
}

/**
 * Read the raw manifest.json from a run directory and return the subset
 * of fields consumed by {@link resolveArticleMetadata}. Returns an empty
 * object when the manifest is missing or unreadable so the resolver
 * simply falls through to the artefact / aggregator tiers.
 *
 * @param runDir - Absolute run directory path
 * @returns Metadata-relevant manifest fields (never `undefined`)
 */
function readManifestMetadata(runDir: string): MetadataManifest {
  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    const manifest: MetadataManifest = {};
    const resolvedType = resolveArticleTypeFromManifest(parsed as unknown as Manifest);
    if (resolvedType && resolvedType !== 'unknown') {
      Object.assign(manifest, { articleType: resolvedType });
    }
    if (typeof parsed.date === 'string') {
      Object.assign(manifest, { date: parsed.date });
    }
    if (typeof parsed.runId === 'string') {
      Object.assign(manifest, { runId: parsed.runId });
    }
    if (typeof parsed.title === 'string' || isLanguageMapLike(parsed.title)) {
      Object.assign(manifest, { title: parsed.title });
    }
    if (typeof parsed.description === 'string' || isLanguageMapLike(parsed.description)) {
      Object.assign(manifest, { description: parsed.description });
    }
    if (typeof parsed.committee === 'string') {
      Object.assign(manifest, { committee: parsed.committee });
    }
    return manifest;
  } catch {
    return {};
  }
}

/**
 * Shallow-check that a value looks like a `LanguageMap<string>` without
 * pulling in the full `LanguageCode` list at the runtime import site.
 *
 * @param value - Arbitrary JSON value
 * @returns `true` when `value` is a plain object with string values
 */
function isLanguageMapLike(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  for (const entry of Object.values(value as Record<string, unknown>)) {
    if (typeof entry !== 'string') return false;
  }
  return true;
}

/**
 * Apply ad-hoc CLI `--title` / `--description` overrides on top of the
 * resolver output. Overrides are applied to every language so the operator
 * can hand-author a single headline for a one-off run without having to
 * know which language variant they're working in.
 *
 * @param base - Resolver output
 * @param titleOverride - CLI `--title` value, if any
 * @param descriptionOverride - CLI `--description` value, if any
 * @returns Metadata with overrides applied uniformly across languages
 */
function applyCliOverrides(
  base: ResolvedMetadata,
  titleOverride: string | undefined,
  descriptionOverride: string | undefined
): ResolvedMetadata {
  const result: Record<LanguageCode, { readonly title: string; readonly description: string }> =
    Object.create(null) as Record<
      LanguageCode,
      { readonly title: string; readonly description: string }
    >;
  for (const lang of ALL_LANGUAGES) {
    const entry = getMetadataEntry(base, lang);
    Object.defineProperty(result, lang, {
      value: {
        title: titleOverride ?? entry.title,
        description: descriptionOverride ?? entry.description,
      },
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return result;
}

/**
 * Derive a default article title from the aggregated run metadata.
 * Preserved as a thin back-compat wrapper — production callers now go
 * through {@link resolveArticleMetadata}.
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

// Retain the back-compat export even though the in-module callers no
// longer invoke it — some downstream curators import it via the bundled
// `scripts/` output. The `void` reference keeps ESLint's
// `no-unused-vars` happy without an explicit export.
void defaultTitle;

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
