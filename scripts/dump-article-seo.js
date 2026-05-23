#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/dump-article-seo
 * @description Read-only dump of the `<title>` / `<meta description>` /
 * `<meta keywords>` values that the deterministic article generator
 * would write into every English `news/*-en.html` file.
 *
 * **Why this script exists.** Article HTML headers visible on
 * https://euparliamentmonitor.com/ and inside individual pages such as
 * https://euparliamentmonitor.com/news/2026-05-22-committee-reports-en.html
 * are produced by the aggregator-era pipeline documented in
 * `Article-Generation.md`. Operators need an auditable, side-effect-free
 * way to inspect those headers for every committed analysis run before
 * deciding which executive briefs need editorial rework. This dumper
 * provides that view without touching `news/*.html` or any other file
 * the pipeline writes.
 *
 * **Identical code path to the real renderer.** The script intentionally
 * imports the same helpers that `scripts/aggregator/article-generator.js`
 * (the engine behind `npm run generate-article:all` and the
 * `regenerate-articles.yml` workflow) uses:
 *
 *   1. `discoverAnalysisRuns(repoRoot)` — same run discovery as the batch
 *      renderer (`generator/render-batch.js`).
 *   2. `aggregateAnalysisRun({ runDir, repoRoot })` — same Markdown
 *      aggregation that feeds `resolveArticleMetadata`.
 *   3. `resolveArticleMetadata({ articleType, date, markdown, manifest,
 *      runDir })` — the single source of truth for per-language `(title,
 *      description, extendedDescription, keywords, source)` documented in
 *      `src/aggregator/article-metadata.ts`. The English entry returned
 *      here is *bit-for-bit identical* to the one passed into
 *      `src/aggregator/html/shell.ts` for the `<title>`,
 *      `<meta name="description">`, and `<meta name="keywords">` tags.
 *
 * **Output focus.** The problem statement asked for English only across
 * roughly 450 committed runs, so this dumper prints a human- and
 * AI-readable record per run plus a JSON summary suitable for follow-up
 * tooling (e.g. flagging template-fallback titles, short descriptions,
 * empty keyword arrays). Non-English variants are deliberately skipped
 * — extending the dumper to the full 14-language set is a single-line
 * change to the language filter below.
 *
 * Invocation:
 *   node scripts/dump-article-seo.js \
 *     [--repo-root <path>]   # defaults to process.cwd()
 *     [--lang en]            # defaults to en (problem statement scope)
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

const SUPPORTED_LANGS = new Set([
  'en',
  'sv',
  'da',
  'de',
  'es',
  'fi',
  'fr',
  'it',
  'ja',
  'ko',
  'nl',
  'no',
  'pt',
  'zh',
]);

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

  if (!SUPPORTED_LANGS.has(lang)) {
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
      'Read-only dump of the HTML head metadata (title, description,',
      'keywords) that the deterministic article generator produces for',
      'every English news/*-en.html article.',
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
 * Resolve the rendered SEO metadata for one analysis run, returning the
 * same `ResolvedMetadataEntry` shape that `generateArticle()` hands to
 * `wrapArticleHtml`. Pure: no files written, no stdout side-effects.
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
 * Format one resolved-SEO record as the human/AI-readable block used in
 * the stdout dump. Format is intentionally line-oriented and key-prefixed
 * so it greps cleanly and feeds large-language-model context windows
 * without ambiguity about which field is which.
 *
 * @param {ReturnType<typeof resolveRunSeo>} record
 * @param {number} index - 1-based position within the dump
 * @param {number} total - Total number of records being dumped
 * @returns {string}
 */
export function formatRecord(record, index, total) {
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
  return lines.join('\n');
}

function formatInline(value) {
  if (!value) return '(empty)';
  // Strip newlines so each field stays on one line.
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Run the full dump: discover, resolve, print, and (optionally) write to
 * disk. Returns the summary statistics computed along the way so unit
 * tests and downstream tooling can assert on histograms without
 * re-parsing the stdout/file artefacts.
 *
 * @param {ReturnType<typeof parseArgs>} opts
 * @returns {{
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
    `# Article HTML Header Dump\n` +
    `# repo-root      : ${repoRoot}\n` +
    `# language       : ${lang}\n` +
    `# total runs     : ${total}\n` +
    `# generated by   : scripts/dump-article-seo.js\n` +
    `# resolver       : src/aggregator/article-metadata.ts → resolveArticleMetadata()\n` +
    `# rendered by    : src/aggregator/html/shell.ts (same call path as npm run generate-article:all)\n\n`;

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

    const block = formatRecord(record, i + 1, total);
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
      })
    );
  }

  const summary = buildSummary({
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
    total,
    processed: records.length,
    resolutionTiers,
    emptyKeywordCount,
    shortDescriptionCount,
    records,
  };
}

function buildSummary({
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
  lines.push(`total runs discovered : ${total}`);
  lines.push(`successfully resolved : ${processed}`);
  lines.push(`failed runs           : ${failures.length}`);
  lines.push('');
  lines.push('Resolution-tier histogram (lower = higher priority in the resolver ladder):');
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
