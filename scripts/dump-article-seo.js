#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/dump-article-seo
 * @description Read-only preview of the SEO `<head>` metadata that the
 * deterministic article generator **would produce** for every executive
 * brief committed under `analysis/daily/`. Use this before running
 * `npm run generate-article:all` to audit and improve titles,
 * descriptions, and keywords without touching any `news/*.html` file.
 *
 * **Source: executive briefs, not HTML.**
 * The script reads each analysis run's `executive-brief.md` (and its
 * translated siblings) via the same resolver chain that the real
 * article generator uses. No HTML files are read or written; the script
 * is purely additive and fully idempotent.
 *
 * **Identical code path to the real renderer.** The script intentionally
 * imports the same helpers that `scripts/aggregator/article-generator.js`
 * (the engine behind `npm run generate-article:all` and the
 * `regenerate-articles.yml` workflow) uses:
 *
 *   1. `discoverAnalysisRuns(repoRoot)` — same run discovery as the batch
 *      renderer (`generator/render-batch.js`).
 *   2. `aggregateAnalysisRun({ runDir, repoRoot })` — same Markdown
 *      aggregation that feeds `resolveArticleMetadata`, which in turn
 *      reads `executive-brief.md` and its translated siblings.
 *   3. `resolveArticleMetadata({ articleType, date, markdown, manifest,
 *      runDir })` — the single source of truth for per-language `(title,
 *      description, extendedDescription, keywords, source)` documented in
 *      `src/aggregator/article-metadata.ts`. The entry returned here is
 *      *bit-for-bit identical* to the one passed into
 *      `src/aggregator/html/shell.ts` for the `<title>`,
 *      `<meta name="description">`, and `<meta name="keywords">` tags.
 *
 * **Two-part output per run.**
 *   - *Field analysis* — human-readable breakdown of each SEO field
 *     (length, content, resolution tier) for quick editorial review.
 *   - *HTML head snippet* — the exact `<title>`, `<meta name="description">`,
 *     `<meta name="keywords">`, `<meta property="og:*">`, and
 *     `<meta name="twitter:*">` tags that the article generator will
 *     emit. Copy-paste these into a browser extension or SEO tool to
 *     preview how the article will appear in search results and social
 *     cards before committing to HTML generation.
 *
 * Invocation:
 *   node scripts/dump-article-seo.js \
 *     [--repo-root <path>]   # defaults to process.cwd()
 *     [--lang en]            # defaults to en
 *     [--out <path>]         # also write the human-readable dump here
 *     [--json <path>]        # also write a machine-readable JSONL dump
 *     [--limit <N>]          # only process the first N runs (debug)
 *     [--quiet]              # suppress per-run stdout (file output only)
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { discoverAnalysisRuns } from './aggregator/generator/discovery.js';
import {
  aggregateAnalysisRun,
  resolveArticleTypeFromManifest,
} from './aggregator/analysis-aggregator.js';
import { resolveArticleMetadata } from './aggregator/article-metadata.js';
import { buildArticleSlug } from './aggregator/generator/slug.js';
import { getArticleFilename } from './aggregator/html/hreflang.js';
import { getTitleSeparator } from './aggregator/html/headline.js';
import { escapeHTML } from './utils/file-utils.js';
import {
  ALL_LANGUAGES,
  isSupportedLanguage,
  getLocalizedString,
} from './constants/language-core.js';
import { PAGE_TITLES } from './constants/languages.js';

const SUPPORTED_LANGS = new Set(ALL_LANGUAGES);

/** Fallback site name when PAGE_TITLES lookup yields nothing. */
const SITE_NAME = 'EU Parliament Monitor';

/**
 * Derive the site title the same way as `wrapArticleHtml()` in
 * `src/aggregator/html/shell.ts`: use the localized PAGE_TITLES string,
 * splitting on ' - ' and taking the first segment.
 * @param {string} lang
 * @returns {string}
 */
function getSiteTitle(lang) {
  return getLocalizedString(PAGE_TITLES, lang).split(' - ')[0] ?? SITE_NAME;
}

/**
 * Parse the small CLI surface used by this script. Kept inline so the
 * dumper has no extra dependencies beyond the same compiled-from-TS
 * helpers the real renderer uses.
 *
 * @param {readonly string[]} argv - `process.argv.slice(2)`
 * @returns {{repoRoot: string, lang: string, outPath: string|null,
 *           jsonPath: string|null, limit: number, quiet: boolean}}
 */
export function parseArgs(argv) {
  let repoRoot = process.cwd();
  let lang = 'en';
  let outPath = null;
  let jsonPath = null;
  let limit = Number.POSITIVE_INFINITY;
  let quiet = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--repo-root':
        repoRoot = path.resolve(requireValue(argv, i, arg));
        i += 1;
        break;
      case '--lang':
        lang = requireValue(argv, i, arg);
        i += 1;
        break;
      case '--out':
        outPath = path.resolve(requireValue(argv, i, arg));
        i += 1;
        break;
      case '--json':
        jsonPath = path.resolve(requireValue(argv, i, arg));
        i += 1;
        break;
      case '--limit': {
        const raw = requireValue(argv, i, arg);
        if (!/^\d+$/u.test(raw)) {
          throw new Error(`--limit expects a positive integer, got "${raw}"`);
        }
        const parsed = Number.parseInt(raw, 10);
        if (!Number.isFinite(parsed) || parsed < 1) {
          throw new Error(`--limit expects a positive integer, got "${raw}"`);
        }
        limit = parsed;
        i += 1;
        break;
      }
      case '--quiet':
        quiet = true;
        break;
      case '--help':
      case '-h':
        printHelpAndExit();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!isSupportedLanguage(lang)) {
    throw new Error(
      `Unsupported --lang "${lang}". Expected one of: ${[...SUPPORTED_LANGS].join(', ')}`
    );
  }

  return { repoRoot, lang, outPath, jsonPath, limit, quiet };
}

function requireValue(argv, i, flag) {
  const value = argv[i + 1];
  if (value === undefined) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function printHelpAndExit() {
  process.stdout.write(
    [
      'Usage: node scripts/dump-article-seo.js [options]',
      '',
      'Read-only preview of the SEO <head> metadata (title, description,',
      'keywords, og:*, twitter:*) that the article generator would produce',
      'from each executive brief — without generating any HTML files.',
      '',
      'Options:',
      '  --repo-root <path>   Repository root (default: cwd)',
      '  --lang <code>        Language to dump (default: en)',
      '  --out <path>         Write the human-readable report here',
      '  --json <path>        Also write a JSONL record per run',
      '  --limit <N>          Process only the first N runs (debug)',
      '  --quiet              Suppress per-run stdout',
      '  -h, --help           Show this help',
      '',
    ].join('\n')
  );
  process.exit(0);
}

/**
 * Mirror of the private `readManifestMetadata` helper inside
 * `scripts/aggregator/generator/render-one.js`. We re-implement it here
 * rather than export it from the renderer because the metadata-relevant
 * subset of a manifest is intentionally a *contract*, not a public API:
 * the resolver only consumes the seven keys listed below and silently
 * ignores everything else. Re-implementing keeps the dumper aligned
 * with that contract without leaking unrelated manifest fields into
 * `resolveArticleMetadata`.
 *
 * @param {string} runDir - Absolute path to the analysis run
 * @returns {object} Metadata-relevant manifest fields (possibly empty)
 */
export function readManifestMetadata(runDir) {
  const manifestPath = path.join(runDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return {};

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return {};
  }

  const manifest = {};
  const resolvedType = resolveArticleTypeFromManifest(parsed);
  if (resolvedType && resolvedType !== 'unknown') {
    manifest.articleType = resolvedType;
  }
  if (typeof parsed.date === 'string') manifest.date = parsed.date;
  if (typeof parsed.runId === 'string') manifest.runId = parsed.runId;
  if (typeof parsed.title === 'string' || isLanguageMapLike(parsed.title)) {
    manifest.title = parsed.title;
  }
  if (
    typeof parsed.description === 'string' ||
    isLanguageMapLike(parsed.description)
  ) {
    manifest.description = parsed.description;
  }
  if (typeof parsed.committee === 'string') {
    manifest.committee = parsed.committee;
  }
  return manifest;
}

function isLanguageMapLike(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  for (const entry of Object.values(value)) {
    if (typeof entry !== 'string') return false;
  }
  return true;
}

/**
 * Resolve the SEO metadata for one analysis run by reading its executive
 * brief and applying the same resolver chain as the article generator.
 * Pure: no files written, no stdout side-effects.
 *
 * @param {object} opts
 * @param {string} opts.runDir  - Absolute path to the analysis run
 * @param {string} opts.repoRoot - Repository root (for relative paths)
 * @param {string} opts.lang    - Language code to extract
 * @returns {{
 *   runDir: string,
 *   runDirRel: string,
 *   date: string,
 *   articleType: string,
 *   slug: string,
 *   filename: string,
 *   entry: {title: string, description: string,
 *           extendedDescription: string, keywords: readonly string[],
 *           source: string}
 * }}
 */
export function resolveRunSeo({ runDir, repoRoot, lang }) {
  const aggregated = aggregateAnalysisRun({ runDir, repoRoot });
  const manifestMetadata = readManifestMetadata(runDir);
  const resolved = resolveArticleMetadata({
    articleType: aggregated.articleType,
    date: aggregated.date,
    markdown: aggregated.markdown,
    manifest: manifestMetadata,
    runDir,
  });

  const entry = resolved[lang];
  if (!entry) {
    throw new Error(
      `resolveArticleMetadata returned no entry for lang="${lang}" in ${runDir}`
    );
  }

  const slug = buildArticleSlug(aggregated.date, aggregated.articleType);
  const filename = getArticleFilename(slug, lang);
  const runDirRel = path.relative(repoRoot, runDir).split(path.sep).join('/');

  return {
    runDir,
    runDirRel,
    date: aggregated.date,
    articleType: aggregated.articleType,
    slug,
    filename,
    entry: {
      title: entry.title,
      description: entry.description,
      extendedDescription: entry.extendedDescription,
      keywords: entry.keywords ?? [],
      source: entry.source,
    },
  };
}

/**
 * Build the SEO-relevant `<head>` snippet that the article generator will
 * emit for this run. The output is bit-for-bit identical to the tags
 * produced by `src/aggregator/html/shell.ts` for the same metadata:
 *
 *   - `<title>` — article title + separator + site name
 *   - `<meta name="description">` — short description (≤160 chars)
 *   - `<meta name="keywords">` — comma-joined keywords (omitted when empty)
 *   - `<meta property="og:title">` — Open Graph title (raw, no site suffix)
 *   - `<meta property="og:description">` — extendedDescription or description
 *   - `<meta name="twitter:title">` — Twitter card title
 *   - `<meta name="twitter:description">` — Twitter card description
 *
 * Use this to preview how the article will appear in search results and
 * social-card previews **before** running the full HTML generator.
 *
 * @param {ReturnType<typeof resolveRunSeo>} record
 * @param {string} lang - Language code (used for bidi-aware title separator)
 * @returns {string} Indented HTML tag block, ready to paste into a `<head>`
 */
export function buildHtmlHeadSnippet(record, lang) {
  const { entry } = record;
  const separator = getTitleSeparator(lang);
  const pageTitle = `${entry.title}${separator}${getSiteTitle(lang)}`;
  const socialDescription = entry.extendedDescription || entry.description;
  const keywords = (entry.keywords ?? []).map((k) => k.trim()).filter(Boolean);

  const lines = [];
  lines.push(`  <title>${escapeHTML(pageTitle)}</title>`);
  lines.push(
    `  <meta name="description" content="${escapeHTML(entry.description)}">`
  );
  if (keywords.length > 0) {
    lines.push(
      `  <meta name="keywords" content="${escapeHTML(keywords.join(', '))}">`
    );
  }
  lines.push(
    `  <meta property="og:title" content="${escapeHTML(entry.title)}">`
  );
  lines.push(
    `  <meta property="og:description" content="${escapeHTML(socialDescription)}">`
  );
  lines.push(
    `  <meta name="twitter:title" content="${escapeHTML(entry.title)}">`
  );
  lines.push(
    `  <meta name="twitter:description" content="${escapeHTML(socialDescription)}">`
  );

  return lines.join('\n');
}

/**
 * Format one resolved-SEO record as the human/AI-readable block used in
 * the stdout dump. Each block contains two sections:
 *   1. *Field analysis* — per-field character/term counts and the
 *      resolution tier so editors can spot template fallbacks instantly.
 *   2. *HTML head snippet* — the exact tags the article generator will
 *      emit, ready to paste into a browser/SEO tool for preview.
 *
 * @param {ReturnType<typeof resolveRunSeo>} record
 * @param {number} index - 1-based position within the dump
 * @param {number} total - Total number of records being dumped
 * @param {string} [lang] - Language code (used for the HTML snippet; defaults to 'en')
 * @returns {string}
 */
export function formatRecord(record, index, total, lang = 'en') {
  const lines = [];
  lines.push('='.repeat(80));
  lines.push(`[${index}/${total}] ${record.slug}`);
  lines.push('='.repeat(80));
  lines.push(`run-dir         : ${record.runDirRel}`);
  lines.push(`date            : ${record.date}`);
  lines.push(`article-type    : ${record.articleType}`);
  lines.push(`resolution-tier : ${record.entry.source}`);
  lines.push(`html-file       : news/${record.filename}`);
  lines.push('');
  lines.push('--- Field analysis (from executive-brief.md → resolveArticleMetadata) ---');
  lines.push(
    `<title>            (${record.entry.title.length} chars): ${formatInline(record.entry.title)}`
  );
  lines.push(
    `<meta description> (${record.entry.description.length} chars): ${formatInline(record.entry.description)}`
  );
  lines.push(
    `<meta description-extended> (${record.entry.extendedDescription.length} chars): ${formatInline(record.entry.extendedDescription)}`
  );
  const keywords = record.entry.keywords;
  lines.push(
    `<meta keywords>    (${keywords.length} terms): ${keywords.length ? keywords.join(', ') : '(empty)'}`
  );
  lines.push('');
  lines.push('--- HTML head snippet (preview of tags the article generator will emit) ---');
  lines.push(buildHtmlHeadSnippet(record, lang));
  lines.push('');
  return lines.join('\n');
}

function formatInline(value) {
  if (!value) return '(empty)';
  // Strip newlines so each field stays on one line.
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Run the full dump: discover analysis runs, resolve SEO metadata from
 * each executive brief, print field analysis + HTML head snippet, and
 * optionally write to disk. Returns summary statistics so unit tests and
 * downstream tooling can assert on histograms without re-parsing stdout.
 *
 * @param {ReturnType<typeof parseArgs>} opts
 * @returns {{
 *   discovered: number,
 *   total: number,
 *   processed: number,
 *   resolutionTiers: Record<string, number>,
 *   emptyKeywordCount: number,
 *   shortDescriptionCount: number,
 *   records: ReadonlyArray<ReturnType<typeof resolveRunSeo>>
 * }}
 */
export function dumpArticleSeo(opts) {
  const { repoRoot, lang, outPath, jsonPath, limit, quiet } = opts;

  const allRuns = discoverAnalysisRuns(repoRoot).map((run) => run.runDir);
  const discovered = allRuns.length;
  const targetRuns = Number.isFinite(limit) ? allRuns.slice(0, limit) : allRuns;
  const total = targetRuns.length;

  const records = [];
  const failures = [];
  const resolutionTiers = Object.create(null);
  let emptyKeywordCount = 0;
  let shortDescriptionCount = 0;

  const textChunks = [];
  const jsonLines = [];
  const header =
    `# Executive Brief SEO Preview\n` +
    `# Source         : executive-brief.md under analysis/daily/*/\n` +
    `# repo-root      : ${repoRoot}\n` +
    `# language       : ${lang}\n` +
    `# total runs     : ${discovered}\n` +
    `# selected runs  : ${total}\n` +
    `# generated by   : scripts/dump-article-seo.js\n` +
    `# resolver       : src/aggregator/article-metadata.ts → resolveArticleMetadata()\n` +
    `# rendered by    : src/aggregator/html/shell.ts (same call path as npm run generate-article:all)\n` +
    `# purpose        : review and improve SEO before generating HTML\n\n`;

  if (!quiet) process.stdout.write(header);
  textChunks.push(header);

  for (let i = 0; i < targetRuns.length; i += 1) {
    const runDir = targetRuns[i];
    let record;
    try {
      record = resolveRunSeo({ runDir, repoRoot, lang });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ runDir, message });
      const failBlock = `--- FAILED ${path.relative(repoRoot, runDir)}: ${message}\n\n`;
      if (!quiet) process.stderr.write(failBlock);
      textChunks.push(failBlock);
      continue;
    }
    records.push(record);

    const tier = record.entry.source;
    resolutionTiers[tier] = (resolutionTiers[tier] ?? 0) + 1;
    if (record.entry.keywords.length === 0) emptyKeywordCount += 1;
    if (record.entry.description.length < 70) shortDescriptionCount += 1;

    const block = formatRecord(record, i + 1, total, lang);
    if (!quiet) process.stdout.write(`${block}\n`);
    textChunks.push(`${block}\n`);

    jsonLines.push(
      JSON.stringify({
        slug: record.slug,
        runDir: record.runDirRel,
        date: record.date,
        articleType: record.articleType,
        lang,
        filename: record.filename,
        source: record.entry.source,
        title: record.entry.title,
        description: record.entry.description,
        extendedDescription: record.entry.extendedDescription,
        keywords: record.entry.keywords,
        htmlHeadSnippet: buildHtmlHeadSnippet(record, lang),
      })
    );
  }

  const summary = buildSummary({
    discovered,
    total,
    processed: records.length,
    failures,
    resolutionTiers,
    emptyKeywordCount,
    shortDescriptionCount,
  });
  if (!quiet) process.stdout.write(summary);
  textChunks.push(summary);

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, textChunks.join(''), 'utf8');
  }
  if (jsonPath) {
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, `${jsonLines.join('\n')}\n`, 'utf8');
  }

  return {
    discovered,
    total,
    processed: records.length,
    resolutionTiers,
    emptyKeywordCount,
    shortDescriptionCount,
    records,
  };
}

function buildSummary({
  discovered,
  total,
  processed,
  failures,
  resolutionTiers,
  emptyKeywordCount,
  shortDescriptionCount,
}) {
  const tierEntries = Object.entries(resolutionTiers).sort(
    ([a], [b]) => a.localeCompare(b)
  );
  const lines = [];
  lines.push('='.repeat(80));
  lines.push('SUMMARY');
  lines.push('='.repeat(80));
  lines.push(`total runs discovered : ${discovered}`);
  lines.push(`selected for preview  : ${total}`);
  lines.push(`successfully resolved : ${processed}`);
  lines.push(`failed runs           : ${failures.length}`);
  lines.push('');
  lines.push('Resolution-tier histogram (alphabetical by source label):');
  if (tierEntries.length === 0) {
    lines.push('  (no runs resolved)');
  } else {
    for (const [tier, count] of tierEntries) {
      lines.push(`  ${tier.padEnd(20)} ${count}`);
    }
  }
  lines.push('');
  lines.push('Quality flags:');
  lines.push(`  runs with empty <meta keywords>           : ${emptyKeywordCount}`);
  lines.push(`  runs with <meta description> shorter than 70 chars : ${shortDescriptionCount}`);
  if (failures.length > 0) {
    lines.push('');
    lines.push('Failures:');
    for (const fail of failures) {
      lines.push(`  - ${fail.runDir}: ${fail.message}`);
    }
  }
  lines.push('');
  return `${lines.join('\n')}`;
}

// Run as a script only when invoked directly (not when imported by tests).
const invokedDirectly =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('dump-article-seo.js');

if (invokedDirectly) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    dumpArticleSeo(opts);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`dump-article-seo: ${message}\n`);
    process.exit(1);
  }
}
