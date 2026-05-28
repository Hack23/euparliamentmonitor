// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Generator/RenderOne
 * @description Single-run aggregate → render → write orchestrator.
 * Reads a single analysis run, aggregates its artifacts into one
 * canonical Markdown document, writes the `article.md` /
 * `article-meta.json` run sidecars, and renders one HTML variant per
 * supported language under the output directory.
 */

import fs from 'fs';
import path from 'path';
import {
  aggregateAnalysisRun,
  resolveArticleTypeFromManifest,
  type AggregatedRun,
} from '../analysis-aggregator.js';
import type { Manifest } from '../manifest/index.js';
import { resolveRunId as _resolveRunId } from '../manifest/index.js';
import {
  resolveArticleMetadata,
  extractStrongProseLine,
  type MetadataManifest,
  type ResolvedMetadata,
  type ResolvedMetadataEntry,
} from '../article-metadata.js';
import { buildArticleMeta, serializeArticleMeta } from '../article-meta.js';
import { renderMarkdown } from '../markdown-renderer.js';
import {
  wrapArticleHtml,
  getArticleFilename,
  localizeArticleBody,
  enhanceTradecraftCards,
  enhanceAnalysisIndexCards,
} from '../article-html.js';
import { replaceExecutiveBriefSection } from '../html/localize-body.js';
import { readLocalizedBriefBody } from '../editorial-brief-resolver.js';
import { extractRunMentions } from '../seo-entity-extractor.js';
import { SECTION_TITLE_LABELS } from '../../constants/ui/related-analysis.js';
import { getLocalizedString } from '../../constants/language-core.js';
import {
  buildReaderIntelligenceGuideHtml,
  stripInlineReaderGuide,
} from '../reader-intelligence-guide.js';
import { ALL_LANGUAGES } from '../../constants/language-core.js';
import type { LanguageCode } from '../../types/index.js';
import { blobUrl } from '../infra/github-urls.js';
import type { CliOptions } from './cli.js';
import { buildArticleSlug } from './slug.js';
import { discoverAnalysisRuns } from './discovery.js';
import { insertReaderGuideAfterExecutiveBrief } from './reader-guide-insertion.js';
import { buildLayerReadingTimes, splitBodyIntoDisclosureLayers } from '../progressive-disclosure.js';

/** Result summary returned by `generateArticle`. */
export interface GenerateResult {
  /** Repo-relative path of the English source Markdown that was written. */
  readonly sourceMarkdownRelPath: string;
  /**
   * Repo-relative path of the `article.md` written directly into the
   * analysis run directory — canonical Markdown source that lives alongside
   * the artifacts that produced it (riksdagsmonitor pattern).
   */
  readonly runArticleMdRelPath: string;
  /**
   * Repo-relative path of the `article-meta.json` sidecar written next to
   * `article.md` — structured data consumed by HTML SEO, news indexes,
   * and RSS rendering. Always emitted, deterministic.
   */
  readonly runArticleMetaRelPath: string;
  /** Filenames written under `outDir`, relative to `outDir`. */
  readonly writtenFiles: readonly string[];
  /** Metadata from {@link aggregateAnalysisRun}. */
  readonly aggregated: AggregatedRun;
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
 * @param metadata.keywords - Resolved English SEO keywords
 * @param slug - Article slug used by generated news paths
 * @param sourceFolder - Repo-relative analysis run directory
 * @returns Markdown with YAML front matter followed by the aggregate body
 */
function buildJekyllArticleMarkdown(
  aggregated: AggregatedRun,
  metadata: {
    readonly title: string;
    readonly description: string;
    readonly keywords?: readonly string[];
  },
  slug: string,
  sourceFolder: string
): string {
  const keywords = metadata.keywords?.length
    ? `keywords: [${metadata.keywords.map((keyword) => `"${yamlEscape(keyword)}"`).join(', ')}]`
    : 'keywords: []';
  const frontMatter = [
    '---',
    `title: "${yamlEscape(metadata.title)}"`,
    `description: "${yamlEscape(metadata.description)}"`,
    keywords,
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
 * aggregate. Extracted from `generateArticle` so the outer function
 * stays under the cognitive-complexity budget.
 *
 * @param lang - Target language code
 * @param slug - Article slug (`<date>-<type>`)
 * @param aggregated - Aggregated-run metadata
 * @param englishHtml - Pre-rendered HTML of the English aggregate
 * @param chromeOptions - Shared chrome options
 * @param chromeOptions.metadata - Per-language `{title, description}` map
 *        resolved by `resolveArticleMetadata`
 * @param chromeOptions.sourceMarkdownRelPath - Repo-relative path of the
 *        canonical English Markdown source written by the same run
 * @param chromeOptions.articleCount - Total article count surfaced in the
 *        site footer's `<p class="footer-stats">…</p>` line
 * @param chromeOptions.mentions - SEO `mentions` list (organization names
 *        extracted from `intelligence/stakeholder-map.md` and
 *        `extended/media-framing-analysis.md`) emitted into JSON-LD on
 *        every language variant
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
    mentions: readonly string[];
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
  } else if (lang !== 'en') {
    // No full per-language source markdown — but the run may still
    // ship a translated `executive-brief_<lang>.md`. When present,
    // splice its rendered HTML into the `#section-executive-brief`
    // block so non-English readers see localized BLUF + key findings
    // instead of English fallback prose. SEO metadata (`<title>`,
    // `<meta description>`, JSON-LD `headline`) is already localized
    // via `resolveLocalizedBriefHighlight` upstream, so this hook
    // exclusively touches the rendered article body.
    const localized = opts.runDir !== null ? readLocalizedBriefBody(opts.runDir, lang) : null;
    if (localized) {
      const localizedRendered = renderMarkdown(localized.markdown).html;
      // Strip the first H1 from the translated brief —
      // `replaceExecutiveBriefSection` re-emits the canonical
      // `<h2 id="section-executive-brief">…</h2>` heading itself,
      // and the brief's own `# Headline` is duplicate chrome.
      const briefBodyHtml = localizedRendered.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/, '');
      const briefHeadingMap = SECTION_TITLE_LABELS['executive-brief'];
      const localizedHeading = briefHeadingMap
        ? getLocalizedString(briefHeadingMap, lang)
        : 'Executive Brief';
      bodyHtml = replaceExecutiveBriefSection(bodyHtml, localizedHeading, briefBodyHtml);
    }
  }
  bodyHtml = stripInlineReaderGuide(bodyHtml);
  bodyHtml = bodyHtml.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/, '');
  const guideHtml = buildReaderIntelligenceGuideHtml(
    lang,
    aggregated.sectionToc,
    aggregated.includedArtifacts
  );
  if (guideHtml) {
    bodyHtml = insertReaderGuideAfterExecutiveBrief(bodyHtml, guideHtml);
  }
  bodyHtml = localizeArticleBody(bodyHtml, lang);
  bodyHtml = enhanceTradecraftCards(bodyHtml, lang);
  bodyHtml = enhanceAnalysisIndexCards(bodyHtml, lang);
  const readingTimes = buildLayerReadingTimes(splitBodyIntoDisclosureLayers(bodyHtml).wordCounts);
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
    extendedDescription: entry.extendedDescription,
    keywords: entry.keywords,
    date: aggregated.date,
    articleType: aggregated.articleType,
    sourceMarkdownRelPath: chromeOptions.sourceMarkdownRelPath,
    toc: aggregated.sectionToc,
    articleCount: chromeOptions.articleCount,
    isBasedOn: aggregated.includedArtifacts.map((a) => blobUrl(a.repoRelPath)),
    mentions: chromeOptions.mentions,
    readingTimes,
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
 *          `resolveArticleMetadata`)
 */
function getMetadataEntry(map: ResolvedMetadata, lang: LanguageCode): ResolvedMetadataEntry {
  const descriptor = Object.getOwnPropertyDescriptor(map, lang);
  if (descriptor?.value) {
    return descriptor.value as ResolvedMetadataEntry;
  }
  const en = Object.getOwnPropertyDescriptor(map, 'en')?.value as ResolvedMetadataEntry | undefined;
  return (
    en ?? { title: '', description: '', extendedDescription: '', keywords: [], source: 'template' }
  );
}

/**
 * Count the number of articles the site currently publishes, derived
 * from `analysis/daily/**` runs with a valid `articleType` — the same
 * set that `npm run generate-article:all` would materialise. Using the
 * analysis-run catalogue (rather than the `<outDir>` filesystem) keeps
 * the derived count stable across repeated invocations of
 * `generateArticle`, preserving determinism for reproducible-build
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

  const manifestMetadata = readManifestMetadata(opts.runDir);
  const resolvedMetadata = resolveArticleMetadata({
    articleType: aggregated.articleType,
    date: aggregated.date,
    markdown: aggregated.markdown,
    manifest: manifestMetadata,
    runDir: opts.runDir,
  });

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

  const runArticleMdAbs = path.join(opts.runDir, 'article.md');
  fs.writeFileSync(runArticleMdAbs, sourceMarkdown, 'utf8');
  const runArticleMdRelPath = path
    .relative(opts.repoRoot, runArticleMdAbs)
    .split(path.sep)
    .join('/');

  const runArticleMetaAbs = path.join(opts.runDir, 'article-meta.json');
  const articleMeta = buildArticleMeta({
    runDir: opts.runDir,
    repoRoot: opts.repoRoot,
    date: aggregated.date,
    articleType: aggregated.articleType,
    runId: readManifestRunId(opts.runDir, path.basename(opts.runDir)),
    gateResult: aggregated.gateResult,
    slug,
  });
  fs.writeFileSync(runArticleMetaAbs, serializeArticleMeta(articleMeta), 'utf8');
  const runArticleMetaRelPath = path
    .relative(opts.repoRoot, runArticleMetaAbs)
    .split(path.sep)
    .join('/');

  ensureDir(opts.outDir);
  const sourceMdFilename = `${slug}.en.md`;
  const sourceMdAbs = path.join(opts.outDir, sourceMdFilename);
  fs.writeFileSync(sourceMdAbs, sourceMarkdown, 'utf8');

  const written: string[] = [sourceMdFilename];
  if (!opts.markdownOnly) {
    const rendered = renderMarkdown(sourceMarkdown);
    const chromeOptions = {
      metadata: effectiveMetadata,
      sourceMarkdownRelPath: runArticleMdRelPath,
      articleCount: articleCountOverride ?? countPublishedArticles(opts.repoRoot),
      mentions: opts.runDir ? extractRunMentions(opts.runDir) : [],
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
    runArticleMetaRelPath,
    writtenFiles: written,
    aggregated,
  };
}

/**
 * Read the run identifier from `manifest.json`, falling back to the
 * directory basename when the manifest is missing or unparsable. Wraps
 * the canonical resolver from `aggregator/manifest/index.ts` so callers
 * outside the aggregator core (here, the article-meta sidecar emitter)
 * stay decoupled from the internal manifest schema.
 *
 * @param runDir - Absolute run directory path
 * @param defaultRunId - Fall-back run id (typically the directory basename)
 * @returns Resolved run id, never empty
 */
function readManifestRunId(runDir: string, defaultRunId: string): string {
  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return defaultRunId;
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest;
    return _resolveRunId(parsed, defaultRunId);
  } catch {
    return defaultRunId;
  }
}

/**
 * Read the raw manifest.json from a run directory and return the subset
 * of fields consumed by `resolveArticleMetadata`. Returns an empty
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
  const result: Record<LanguageCode, ResolvedMetadataEntry> = Object.create(null) as Record<
    LanguageCode,
    ResolvedMetadataEntry
  >;
  for (const lang of ALL_LANGUAGES) {
    const entry = getMetadataEntry(base, lang);
    Object.defineProperty(result, lang, {
      value: {
        title: titleOverride ?? entry.title,
        description: descriptionOverride ?? entry.description,
        keywords: entry.keywords,
        source: titleOverride || descriptionOverride ? 'manifest' : entry.source,
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
 * through `resolveArticleMetadata`.
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
