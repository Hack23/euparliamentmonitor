// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Generator/Cli
 * @description Pure CLI argument parsing for the article-generator. The
 * parser maps `process.argv.slice(2)` into a {@link CliOptions} struct
 * and rejects historical / removed flags with an actionable error. The
 * only side-effects are (a) `fs.existsSync` to validate the `--run`
 * argument and (b) `process.stdout.write` + `process.exit(0)` for the
 * built-in `--help` text — both required to keep CLI ergonomics intact.
 */
import fs from 'fs';
import path from 'path';
import { ALL_LANGUAGES } from '../../constants/language-core.js';
/**
 * Fold one parsed {@link FlagResult} into the accumulator. Split out so
 * {@link parseCliArgs} stays under the cognitive-complexity budget.
 *
 * @param acc - Mutable accumulator
 * @param result - Parsed flag result
 */
function applyFlagResult(acc, result) {
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
        case 'outDir':
            acc.outDir = result.value;
            return;
        case 'title':
            acc.title = result.value;
            return;
        case 'description':
            acc.description = result.value;
            return;
        default: {
            const exhaustive = result;
            throw new Error(`Unhandled flag result: ${JSON.stringify(exhaustive)}`);
        }
    }
}
/**
 * Parse the article-generator CLI argv into a {@link CliOptions} struct.
 *
 * Recognises `--run-dir <dir>` (or `--run-dir=<dir>`), `--all`, `--out-dir <dir>`,
 * `--title <s>`, `--description <s>`, `--help`/`-h`, and rejects the historical
 * `--lang` / `--language` / `--markdown-only` flags now that the CLI always
 * renders all 14 languages with HTML output.
 *
 * @param argv - Argument vector excluding `node` and the script path.
 * @param repoRoot - Absolute path to the repository root, used to default `outDir`.
 * @returns Parsed CLI options ready to feed into `generateArticle`.
 * @throws {Error} On unknown flags, missing values, or removed flags.
 */
export function parseCliArgs(argv, repoRoot) {
    const acc = {
        runDir: null,
        all: false,
        outDir: path.join(repoRoot, 'news'),
    };
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
    const opts = {
        runDir: acc.runDir,
        all: acc.all,
        langs: [...ALL_LANGUAGES],
        outDir: acc.outDir,
        repoRoot,
        markdownOnly: false,
        ...(acc.since !== undefined ? { since: acc.since } : {}),
        ...(acc.title !== undefined ? { title: acc.title } : {}),
        ...(acc.description !== undefined ? { description: acc.description } : {}),
    };
    return opts;
}
/**
 * Resolve one CLI flag to a {@link FlagResult}. Throws `Error` for any
 * unsupported flag.
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
        case '--all':
            return { kind: 'all' };
        case '--since': {
            const value = takeValue();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                throw new Error(`--since expects a YYYY-MM-DD date, got: ${value}`);
            }
            return { kind: 'since', value };
        }
        case '--out-dir':
        case '--output':
            return { kind: 'outDir', value: path.resolve(takeValue()) };
        case '--title':
            return { kind: 'title', value: takeValue() };
        case '--description':
            return { kind: 'description', value: takeValue() };
        case '--help':
        case '-h':
            printHelp();
            process.exit(0);
        // eslint-disable-next-line no-fallthrough
        case '--lang':
        case '--language':
        case '--markdown-only':
            throw new Error(`Flag ${flag} has been removed. The CLI always renders all 14 languages with HTML output. ` +
                `See Article-Generation.md § "CLI contract" for the new always-on contract.`);
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
        'Usage:',
        '  generate-article --run <path> [options]',
        '  generate-article --all [--since YYYY-MM-DD] [options]',
        '',
        'Aggregate analysis artifacts from an `analysis/daily/**/<run>` directory',
        'into a canonical Markdown document and render it to HTML in **all 14',
        'supported languages** (en, sv, da, no, fi, de, fr, es, nl, ar, he, ja,',
        'ko, zh). The `--all` form walks every run under `analysis/daily/` and',
        'regenerates the full historic catalogue in one pass.',
        '',
        'The 14-language HTML render is **always on** — there is no flag to',
        'scope a render to a single language or to skip HTML emission. Every',
        'article.md always produces 14 corresponding `<slug>-<lang>.html` files.',
        '',
        'Options:',
        '  --run <path>          Analysis run directory (single-run mode)',
        '  --all                 Batch-regenerate every run under analysis/daily/',
        '  --since YYYY-MM-DD    With --all: skip runs dated before this cut-off',
        '  --out-dir <path>      Output directory (default: news/)',
        '  --title <text>        Override article title (single-run only)',
        '  --description <text>  Override article meta description (single-run only)',
        '  --help, -h            Show this help',
        '',
    ].join('\n'));
}
//# sourceMappingURL=cli.js.map