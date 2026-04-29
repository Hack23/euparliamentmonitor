// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Cli/Parse
 * @description Pure CLI parser that returns a discriminated union instead
 * of calling `process.exit` mid-parse. The original `parseCliArgs` entry
 * point in `article-generator.ts` is preserved for backward compatibility
 * with existing callers and tests; new callers and unit tests should
 * prefer {@link parseCliArgsSafe} so the `--help` and error branches are
 * fully testable without spying on `process.exit`.
 */

import fs from 'fs';
import path from 'path';
import { ALL_LANGUAGES } from '../../constants/language-core.js';
import type { LanguageCode } from '../../types/index.js';

/** Successful parse → ready-to-execute options. */
export interface ParsedOptions {
  readonly kind: 'options';
  readonly value: {
    readonly runDir: string | null;
    readonly all: boolean;
    readonly since?: string;
    readonly langs: readonly LanguageCode[];
    readonly outDir: string;
    readonly repoRoot: string;
    readonly title?: string;
    readonly description?: string;
    readonly markdownOnly: boolean;
  };
}

/** `--help` / `-h` was passed; CLI driver should print help and exit 0. */
export interface ParsedHelp {
  readonly kind: 'help';
}

/** Argv parse failed; CLI driver should print message to stderr and exit non-zero. */
export interface ParsedError {
  readonly kind: 'error';
  readonly message: string;
}

/** Discriminated parse result. */
export type ParsedCli = ParsedOptions | ParsedHelp | ParsedError;

/** Default text printed by `parseCliArgs(...)` when `--help` is seen. */
export const HELP_TEXT: string = [
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
  '  --run, --analysis-dir <path>',
  '                        Analysis run directory (single-run mode)',
  '  --all                 Batch-regenerate every run under analysis/daily/',
  '  --since YYYY-MM-DD    With --all: skip runs dated before this cut-off',
  '  --lang, --language <code>',
  '                        Language to render (repeatable; default: all 14)',
  '  --out-dir, --output <path>',
  '                        Output directory (default: news/)',
  '  --title <text>        Override article title (single-run only)',
  '  --description <text>  Override article meta description (single-run only)',
  '  --markdown-only       Write only the source .md (skip HTML)',
  '  --help, -h            Show this help',
  '',
].join('\n');

/** Internal accumulator used while folding flags. */
interface Accumulator {
  runDir: string | null;
  all: boolean;
  since?: string;
  langs: LanguageCode[];
  outDir: string;
  title?: string;
  description?: string;
  markdownOnly: boolean;
}

/** Result of resolving a single flag. */
type FlagResult =
  | { kind: 'runDir'; value: string }
  | { kind: 'all' }
  | { kind: 'since'; value: string }
  | { kind: 'lang'; value: LanguageCode }
  | { kind: 'outDir'; value: string }
  | { kind: 'title'; value: string }
  | { kind: 'description'; value: string }
  | { kind: 'markdownOnly' }
  | { kind: 'help' };

/** Token returned by {@link applyCliFlag} when an unsupported flag is seen. */
class UnknownFlagError extends Error {}
/** Token returned when a value-bearing flag's value is rejected. */
class FlagValueError extends Error {}

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
 * Resolve one CLI flag to a {@link FlagResult}. Throws {@link UnknownFlagError}
 * for unsupported flags and {@link FlagValueError} for invalid values.
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
        throw new FlagValueError(`--since expects a YYYY-MM-DD date, got: ${value}`);
      }
      return { kind: 'since', value };
    }
    case '--lang':
    case '--language': {
      const value = takeValue();
      if (!ALL_LANGUAGES.includes(value as LanguageCode)) {
        throw new FlagValueError(`Unsupported language code: ${value}`);
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
      return { kind: 'help' };
    default:
      throw new UnknownFlagError(`Unknown argument: ${flag}`);
  }
}

/**
 * Fold a {@link FlagResult} into the accumulator. Returns `'help'` when
 * `--help` / `-h` was seen so the parser can short-circuit.
 *
 * @param acc - Mutable accumulator
 * @param result - Parsed flag result
 * @returns `'help'` when the parser should short-circuit, otherwise `void`
 */
function applyFlagResult(acc: Accumulator, result: FlagResult): 'help' | void {
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
    case 'help':
      return 'help';
    default: {
      const exhaustive: never = result;
      throw new Error(`Unhandled flag result: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/**
 * Process a single argv token. Returns `'help'` to short-circuit the
 * outer loop, `null` on success, or a `{kind:'error', message}` envelope
 * when the flag/value is rejected. Extracted so {@link parseCliArgsSafe}
 * stays under the cognitive-complexity budget.
 *
 * @param argv - Full argv array
 * @param index - Current argv index (mutated via the returned `nextIndex`)
 * @param acc - Mutable accumulator
 * @returns Outcome — `'help'` short-circuit, error envelope, or new index
 */
function processArgvToken(
  argv: readonly string[],
  index: number,
  acc: Accumulator
): { kind: 'help' } | { kind: 'error'; message: string } | { kind: 'next'; nextIndex: number } {
  const arg = argv.at(index) ?? '';
  const [flag, inlineValue] = arg.includes('=') ? splitFlag(arg) : [arg, undefined];
  let consumedNext = 0;
  const takeValue = (): string => {
    // Treat `--flag=` (empty inline value) as missing — otherwise an empty
    // string sneaks past value-bearing flags and resolves to surprising
    // defaults (e.g. `path.resolve('')` → `process.cwd()`). Mirrors the
    // space-separated missing-value branch below for symmetry.
    if (inlineValue !== undefined) {
      if (inlineValue === '') {
        throw new FlagValueError(`Missing value for ${flag}`);
      }
      return inlineValue;
    }
    const next = argv.at(index + 1);
    if (next === undefined) {
      throw new FlagValueError(`Missing value for ${flag}`);
    }
    consumedNext = 1;
    return next;
  };
  let result: FlagResult;
  try {
    result = applyCliFlag(flag, takeValue);
  } catch (err) {
    if (err instanceof UnknownFlagError || err instanceof FlagValueError) {
      return { kind: 'error', message: err.message };
    }
    throw err;
  }
  const folded = applyFlagResult(acc, result);
  if (folded === 'help') return { kind: 'help' };
  return { kind: 'next', nextIndex: index + 1 + consumedNext };
}

/**
 * Pure, non-exiting CLI parser. Returns a discriminated union representing
 * each possible outcome:
 *
 * - `{kind:'help'}` — `--help` or `-h` was passed; print {@link HELP_TEXT}
 *   and exit 0.
 * - `{kind:'error', message}` — argv was rejected (unknown flag, missing
 *   value, invalid language, run dir not found, etc.); print message to
 *   stderr and exit non-zero.
 * - `{kind:'options', value}` — argv parsed cleanly; `value` is ready to
 *   pass to `generateArticle` / `generateAllArticles`.
 *
 * Compared to the original `parseCliArgs` in `article-generator.ts` (which
 * throws and calls `process.exit` on `--help`), this entry point keeps
 * tests self-contained.
 *
 * @param argv - Raw argv (without the `node` / script path prefix)
 * @param repoRoot - Absolute repo root used to resolve relative `--run`
 * @returns Discriminated parse result
 */
export function parseCliArgsSafe(argv: readonly string[], repoRoot: string): ParsedCli {
  const acc: Accumulator = {
    runDir: null,
    all: false,
    langs: [],
    outDir: path.join(repoRoot, 'news'),
    markdownOnly: false,
  };

  let i = 0;
  while (i < argv.length) {
    const outcome = processArgvToken(argv, i, acc);
    if (outcome.kind === 'help') return { kind: 'help' };
    if (outcome.kind === 'error') return { kind: 'error', message: outcome.message };
    i = outcome.nextIndex;
  }

  if (!acc.all) {
    if (!acc.runDir) {
      return { kind: 'error', message: '--run <path> or --all is required' };
    }
    if (!fs.existsSync(acc.runDir)) {
      return { kind: 'error', message: `Run directory does not exist: ${acc.runDir}` };
    }
  }

  return {
    kind: 'options',
    value: {
      runDir: acc.runDir,
      all: acc.all,
      langs: acc.langs.length > 0 ? acc.langs : [...ALL_LANGUAGES],
      outDir: acc.outDir,
      repoRoot,
      markdownOnly: acc.markdownOnly,
      ...(acc.since !== undefined ? { since: acc.since } : {}),
      ...(acc.title !== undefined ? { title: acc.title } : {}),
      ...(acc.description !== undefined ? { description: acc.description } : {}),
    },
  };
}
