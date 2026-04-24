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
import { aggregateAnalysisRun } from './analysis-aggregator.js';
import { renderMarkdown } from './markdown-renderer.js';
import { wrapArticleHtml, getArticleFilename } from './article-html.js';
import { ALL_LANGUAGES } from '../constants/language-core.js';
/**
 * Parse a flat list of CLI args (no node/script entries) into {@link CliOptions}.
 * Supports `--flag value` and `--flag=value` styles, and repeatable `--lang`.
 *
 * @param argv - Argument list, typically `process.argv.slice(2)`
 * @param repoRoot - Absolute repo root used to resolve default output paths
 * @returns Fully-populated {@link CliOptions} ready for {@link generateArticle}
 */
export function parseCliArgs(argv, repoRoot) {
    let runDir = null;
    const langs = [];
    let outDir = path.join(repoRoot, 'news');
    let title;
    let description;
    let markdownOnly = false;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i] ?? '';
        const [flag, inlineValue] = arg.includes('=') ? splitFlag(arg) : [arg, undefined];
        const takeValue = () => {
            if (inlineValue !== undefined)
                return inlineValue;
            const next = argv[i + 1];
            if (next === undefined) {
                throw new Error(`Missing value for ${flag}`);
            }
            i++;
            return next;
        };
        const result = applyCliFlag(flag, takeValue);
        if (result.kind === 'runDir')
            runDir = result.value;
        else if (result.kind === 'lang')
            langs.push(result.value);
        else if (result.kind === 'outDir')
            outDir = result.value;
        else if (result.kind === 'title')
            title = result.value;
        else if (result.kind === 'description')
            description = result.value;
        else if (result.kind === 'markdownOnly')
            markdownOnly = true;
    }
    if (!runDir) {
        throw new Error('--run <path> is required');
    }
    if (!fs.existsSync(runDir)) {
        throw new Error(`Run directory does not exist: ${runDir}`);
    }
    const opts = {
        runDir,
        langs: langs.length > 0 ? langs : [...ALL_LANGUAGES],
        outDir,
        repoRoot,
        markdownOnly,
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
    };
    return opts;
}
/**
 * Resolve one CLI flag to a {@link FlagResult}. Throws `Error` for any
 * unsupported flag or language code.
 *
 * @param flag - Flag name (e.g. `--run`)
 * @param takeValue - Lazily returns the value argument for value-bearing flags
 * @returns Parsed {@link FlagResult}
 */
function applyCliFlag(flag, takeValue) {
    switch (flag) {
        case '--run':
        case '--analysis-dir':
            return { kind: 'runDir', value: path.resolve(takeValue()) };
        case '--lang':
        case '--language': {
            const value = takeValue();
            if (!ALL_LANGUAGES.includes(value)) {
                throw new Error(`Unsupported language code: ${value}`);
            }
            return { kind: 'lang', value: value };
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
function splitFlag(arg) {
    const eq = arg.indexOf('=');
    return [arg.slice(0, eq), arg.slice(eq + 1)];
}
/**
 * Print CLI help text to stdout.
 */
function printHelp() {
    process.stdout.write([
        'Usage: generate-article --run <path> [options]',
        '',
        'Aggregate every analysis artifact in a run directory into a canonical',
        'Markdown document and render it to HTML in all 14 languages.',
        '',
        'Options:',
        '  --run <path>          Analysis run directory (required)',
        '  --lang <code>         Language to render (repeatable; default: all 14)',
        '  --out-dir <path>      Output directory (default: news/)',
        '  --title <text>        Override article title',
        '  --description <text>  Override article meta description',
        '  --markdown-only       Write only the source .md (skip HTML)',
        '  --help, -h            Show this help',
        '',
    ].join('\n'));
}
/**
 * Build the article slug `YYYY-MM-DD-<article-type>`.
 *
 * @param date - ISO date string (`YYYY-MM-DD`)
 * @param articleType - Article-type slug (e.g. `breaking`)
 * @returns Combined slug used as the file-stem for every language variant
 */
export function buildArticleSlug(date, articleType) {
    return `${date}-${articleType}`;
}
/**
 * Return true when a line should be skipped when hunting for the default
 * description (provenance, HTML, headings, tables, comments, etc.).
 *
 * @param line - Trimmed line from the aggregated Markdown source
 * @returns `true` when the line is not prose and should be skipped
 */
function shouldSkipDescriptionLine(line) {
    if (line.length === 0)
        return true;
    if (line.startsWith('#'))
        return true;
    if (line.startsWith('>'))
        return true;
    if (line.startsWith('<'))
        return true;
    if (line.startsWith('|'))
        return true;
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
export function extractDefaultDescription(markdown) {
    const lines = markdown.split('\n');
    for (const raw of lines) {
        const line = raw.trim();
        if (shouldSkipDescriptionLine(line))
            continue;
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
function writeLanguageVariant(lang, slug, aggregated, englishHtml, chromeOptions, opts) {
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
 * Run the full aggregate → render → write pipeline.
 *
 * @param opts - Fully-populated {@link CliOptions} (typically from
 *               {@link parseCliArgs})
 * @returns Summary of the generated artefacts ({@link GenerateResult})
 */
export function generateArticle(opts) {
    const aggregated = aggregateAnalysisRun({
        runDir: opts.runDir,
        repoRoot: opts.repoRoot,
    });
    const slug = buildArticleSlug(aggregated.date, aggregated.articleType);
    const title = opts.title ?? defaultTitle(aggregated);
    const description = opts.description ?? extractDefaultDescription(aggregated.markdown);
    // Write source Markdown under <outDir>/<slug>.en.md for transparency.
    ensureDir(opts.outDir);
    const sourceMdFilename = `${slug}.en.md`;
    const sourceMdAbs = path.join(opts.outDir, sourceMdFilename);
    fs.writeFileSync(sourceMdAbs, aggregated.markdown, 'utf8');
    const sourceMdRelPath = path.relative(opts.repoRoot, sourceMdAbs).split(path.sep).join('/');
    const written = [sourceMdFilename];
    if (!opts.markdownOnly) {
        const rendered = renderMarkdown(aggregated.markdown);
        const chromeOptions = {
            title,
            description,
            sourceMarkdownRelPath: sourceMdRelPath,
        };
        for (const lang of opts.langs) {
            const filename = writeLanguageVariant(lang, slug, aggregated, rendered.html, chromeOptions, opts);
            written.push(filename);
        }
    }
    return { sourceMarkdownRelPath: sourceMdRelPath, writtenFiles: written, aggregated };
}
/**
 * Derive a default article title from the aggregated run metadata.
 *
 * @param run - Aggregated run metadata
 * @returns Human-readable title like `EU Parliament Breaking — 2026-01-15`
 */
function defaultTitle(run) {
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
function ensureDir(dir) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
/**
 * Main entry when invoked as a script. Uses `process.argv.slice(2)` and the
 * current working directory as repo root unless overridden by `REPO_ROOT`.
 *
 * @param argv - Argument list (defaults to `process.argv.slice(2)`)
 */
export async function main(argv = process.argv.slice(2)) {
    const repoRoot = process.env.REPO_ROOT ? path.resolve(process.env.REPO_ROOT) : process.cwd();
    const opts = parseCliArgs(argv, repoRoot);
    const result = generateArticle(opts);
    process.stdout.write(`Generated ${result.writtenFiles.length} file(s) from ${result.aggregated.includedArtifacts.length} artifact(s) — gate: ${result.aggregated.gateResult}\n`);
    for (const f of result.writtenFiles)
        process.stdout.write(`  ${f}\n`);
}
// Only run when invoked directly, not when imported by tests.
const isMain = (() => {
    const entry = process.argv[1];
    if (!entry)
        return false;
    try {
        return import.meta.url === pathToFileURL(entry).href;
    }
    catch {
        return false;
    }
})();
if (isMain) {
    main().catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        process.stderr.write(`generate-article: ${msg}\n`);
        process.exit(1);
    });
}
//# sourceMappingURL=article-generator.js.map