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
import type { LanguageCode } from '../../types/index.js';

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
  /**
   * Languages to render. Defaults to all 14. The CLI always populates
   * this with `[...ALL_LANGUAGES]` (the `--lang/--language` flags have
   * been removed); programmatic callers (tests) can override it.
   */
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
   * When true, only the source Markdown is written (no HTML) — preserved
   * for programmatic callers (tests) that need to skip HTML emission for
   * speed. The CLI no longer exposes a flag for this and always sets
   * `false`; every workflow-driven invocation emits HTML for all 14
   * languages.
   */
  readonly markdownOnly: boolean;
}

/**
 * Parse a flat list of CLI args (no node/script entries) into {@link CliOptions}.
 * Supports `--flag value` and `--flag=value` styles.
 *
 * **Always-14-languages-always-HTML contract**: this parser does NOT
 * accept `--lang/--language` or `--markdown-only` — they are rejected
 * with a clear error. Every CLI-driven render produces HTML for all
 * 14 supported languages.
 *
 * @param argv - Argument list, typically `process.argv.slice(2)`
 * @param repoRoot - Absolute repo root used to resolve default output paths
 * @returns Fully-populated {@link CliOptions} ready for `generateArticle`
 */
/** Mutable accumulator backing {@link parseCliArgs}. */
interface CliParseAccumulator {
  runDir: string | null;
  all: boolean;
  since?: string;
  outDir: string;
  title?: string;
  description?: string;
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
      const exhaustive: never = result;
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
export function parseCliArgs(argv: readonly string[], repoRoot: string): CliOptions {
  const acc: CliParseAccumulator = {
    runDir: null,
    all: false,
    outDir: path.join(repoRoot, 'news'),
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
 * Result of applying a single CLI flag. Each kind corresponds to one of
 * the accumulator variables in {@link parseCliArgs}. Extracted so the main
 * parser stays under the cognitive-complexity budget.
 */
type FlagResult =
  | { kind: 'runDir'; value: string }
  | { kind: 'all' }
  | { kind: 'since'; value: string }
  | { kind: 'outDir'; value: string }
  | { kind: 'title'; value: string }
  | { kind: 'description'; value: string };

/**
 * Resolve one CLI flag to a {@link FlagResult}. Throws `Error` for any
 * unsupported flag.
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
      throw new Error(
        `Flag ${flag} has been removed. The CLI always renders all 14 languages with HTML output. ` +
          `See Article-Generation.md § "CLI contract" for the new always-on contract.`
      );
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
    ].join('\n')
  );
}
