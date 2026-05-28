#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/validate-manifest-seo
 * @description Drift-guard / quality validator for the 14-language SEO
 * metadata embedded in `analysis/daily/<date>/<slug>/manifest.json`.
 *
 * Companion to `validate-brief-translations.js`. Where that script audits
 * translated brief artifacts, this one audits the per-language `(title,
 * description)` pairs that the Stage-B agent is contracted to copy from
 * the executive brief into `manifest.json` for the deterministic
 * Stage-D renderer.
 *
 * The SEO contract is documented at
 * [`.github/prompts/04-article-generation.md`](../.github/prompts/04-article-generation.md) § 6
 * and mirrored in [`Article-Generation.md`](../Article-Generation.md).
 *
 * Gates applied per manifest (only when `title` / `description` is an object —
 * legacy single-string overrides are reported but not failed):
 *
 *   1. **title-shape**       — when present as an object, every key must be
 *      one of the 14 supported language codes.
 *   2. **title-length**      — each title ≤ `TITLE_MAX_LENGTH` characters.
 *   3. **description-shape** — same shape rules as title-shape.
 *   4. **description-length** — each description in the inclusive range
 *      `[DESCRIPTION_MIN_LENGTH, DESCRIPTION_MAX_LENGTH]`.
 *   5. **forbidden-prefix**  — title/description must not start with a
 *      Stage-A→E preamble label such as `Run:`, `Purpose:`, `BLUF:`,
 *      `Stage A`, `scripts/...`, …
 *   6. **leaky-runid**       — title/description must not contain
 *      internal run-id tokens (`<slug>-run<N>-<unix-ts>`) or the
 *      English jargon "analysis run". Added 2026-05 after a live-site
 *      regression on https://euparliamentmonitor.com/news/.
 *   7. **english-fallthrough** — when a non-English value equals the `en`
 *      value verbatim, `manifest.metadataFallback[<lang>] = "en"` must be
 *      declared so the static-site layer can surface a "pending
 *      translation" editorial note. Recorded as a violation when the
 *      declaration is missing.
 *
 * The process exits with code 1 if any failure-class violations exist
 * (unless `--no-fail` is passed for advisory mode).
 *
 * Invocation:
 *   node scripts/validate-manifest-seo.js \
 *     [--repo-root <path>] \
 *     [--paths <manifest.json>...]  # validate specific manifests only
 *     [--report <path>]             # write JSON report; default stdout
 *     [--no-fail]                   # exit 0 even when violations found
 *     [--quiet]                     # suppress per-file logging
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { ALL_LANGUAGES } from './constants/language-core.js';
import { aggregateByKey } from './validate-brief-translations.js';

/** Canonical Set of supported language codes for membership tests. */
export const SUPPORTED_LANGS = Object.freeze(new Set(ALL_LANGUAGES));

/** Maximum allowed `<title>` length (matches `TITLE_MAX_LENGTH` in article-metadata.ts). */
export const TITLE_MAX_LENGTH = 140;

/**
 * Inclusive lower bound for `<title>` length. The editorial contract
 * documents 70 characters as the active-voice target; this floor is a
 * defense-in-depth guard so degenerate single-word titles cannot pass
 * the shape gate. CJK characters (`ja`, `ko`, `zh`) are weighted 2× via
 * {@link effectiveTextLength} so a legitimate 15-character CJK headline
 * still clears this floor.
 */
export const TITLE_MIN_LENGTH = 20;

/**
 * Inclusive lower bound for `<meta description>` length. Sized to admit
 * CJK locales (`ja`, `ko`, `zh`) which legitimately encode the same
 * editorial payload in 60–80 characters — Google's snippet display
 * still considers anything ≥50 useful.
 */
export const DESCRIPTION_MIN_LENGTH = 60;

/** Inclusive upper bound for `<meta description>` length. */
export const DESCRIPTION_MAX_LENGTH = 200;

/**
 * Stage-B preamble labels that must never appear at the start of an SEO
 * surface (they previously leaked into descriptions until the resolver's
 * `shouldSkipDescriptionLine` filter was added). Checked case-insensitively
 * against the trimmed first 40 characters.
 */
export const FORBIDDEN_PREFIXES = Object.freeze([
  'run:',
  'purpose:',
  'bluf:',
  'bluf (icd-203):',
  'composition layer:',
  'analysis date:',
  'classification:',
  'window:',
  'reporting window:',
  'admiralty grade:',
  'wep band:',
  'methodology:',
  'gate target:',
  'scope:',
  'stage a',
  'stage b',
  'stage c',
  'stage d',
  'stage e',
  'scripts/',
]);

/**
 * Forbidden substrings that must NEVER appear anywhere in an SEO surface,
 * not just as a leading prefix. These are internal artefact identifiers
 * and run-pipeline jargon that leak into search snippets if the
 * description-enrichment path embeds them.
 *
 * Live-site regression (2026-05-16, https://euparliamentmonitor.com/news/):
 * `<meta description>` contained strings like
 *   "Published 2026-05-16 · analysis run breaking-run255-1778894853, with …"
 * The fix in `src/aggregator/article-metadata.ts` removes the run-id and
 * "analysis run" token from `composeContextualDescription`. This list
 * is the drift-guard that fails CI if either ever returns.
 *
 * Matched case-insensitively as plain substrings. Run-id patterns are
 * matched as regex below.
 */
export const FORBIDDEN_SUBSTRINGS = Object.freeze([
  'analysis run',
  'analyse run',
]);

/**
 * Regex patterns that must not match anywhere in an SEO surface. These
 * catch the canonical run-id shape `<slug>-run<N>-<unix-ts>` even when
 * the surrounding label is missing or localized.
 */
export const FORBIDDEN_PATTERNS = Object.freeze([
  /\b[a-z][a-z-]*-run-?\d+-\d{8,}\b/iu,
  // Workflow run-number patterns like "— Run 271" or "Run 42" must never
  // appear in user-facing SEO surfaces (titles, descriptions, keywords).
  /(?:^|[\s—–-])Run\s+\d+/u,
  // Internal pipeline timestamps (e.g. 05:40:10Z).
  /\b\d{2}:\d{2}:\d{2}Z\b/u,
  // Internal script paths leaked into public SEO copy.
  /\bscripts\/[^\s,;:|)\]]+/iu,
]);

/**
 * Identify the article slug from a manifest path under `analysis/daily/`.
 * @param {string} manifestPath - Absolute or repo-relative manifest path
 * @returns {{date: string, slug: string} | null}
 */
export function parseManifestLocation(manifestPath) {
  const normalised = manifestPath.replaceAll('\\', '/');
  const match = normalised.match(/analysis\/daily\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/([^/]+)\/manifest\.json$/);
  if (!match) return null;
  return { date: match[1], slug: match[2] };
}

/**
 * Recursively find every `manifest.json` under `analysis/daily/`.
 * @param {string} repoRoot
 * @returns {string[]} absolute manifest paths
 */
export function findAllManifests(repoRoot) {
  const dailyDir = path.join(repoRoot, 'analysis', 'daily');
  if (!fs.existsSync(dailyDir)) return [];
  const out = [];
  const stack = [dailyDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name === 'manifest.json') {
        out.push(full);
      }
    }
  }
  return out;
}

/**
 * Load JSON safely; returns `null` on read or parse failure.
 * @param {string} absPath
 */
function loadManifest(absPath) {
  let raw;
  try {
    raw = fs.readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Detect whether a value violates the forbidden-prefix gate.
 * @param {string} value
 * @returns {string | null} matching prefix, or null
 */
export function detectForbiddenPrefix(value) {
  if (typeof value !== 'string') return null;
  const head = value.trim().slice(0, 40).toLowerCase();
  for (const prefix of FORBIDDEN_PREFIXES) {
    if (head.startsWith(prefix)) return prefix;
  }
  return null;
}

/**
 * Detect whether a value contains any forbidden substring or run-id
 * regex pattern. Returns the first matching token for use in the
 * violation message, or null when the value is clean.
 *
 * @param {string} value
 * @returns {string | null} matching token, or null
 */
export function detectLeakyRunIdOrJargon(value) {
  if (typeof value !== 'string') return null;
  const lower = value.toLowerCase();
  for (const token of FORBIDDEN_SUBSTRINGS) {
    if (lower.includes(token)) return token;
  }
  for (const pattern of FORBIDDEN_PATTERNS) {
    const m = pattern.exec(value);
    if (m) return m[0];
  }
  return null;
}

/**
 * CJK Unified Ideographs, Hiragana, Katakana, Hangul Syllables, and the
 * common Halfwidth/Fullwidth forms. Used by {@link effectiveTextLength}
 * to weight CJK characters as 2× their raw codepoint count, so that
 * length floors expressed for Latin scripts still admit legitimately
 * shorter CJK editorial payloads.
 *
 * Ranges:
 *   - `\u3040-\u30ff` — Hiragana + Katakana
 *   - `\u3400-\u4dbf` — CJK Unified Ideographs Extension A
 *   - `\u4e00-\u9fff` — CJK Unified Ideographs (main block)
 *   - `\uac00-\ud7af` — Hangul Syllables
 *   - `\uff00-\uffef` — Halfwidth and Fullwidth Forms
 */
const CJK_RE =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uff00-\uffef]/u;

/**
 * Compute the effective length of a string for length-gate purposes,
 * weighting CJK script characters as 2× their codepoint width. A 17-char
 * `zh` headline therefore reports an effective length around 34, which
 * carries roughly the same information density as a 34-char Latin
 * headline. Surrogate pairs are counted as a single grapheme.
 *
 * @param {string} value
 * @returns {number}
 */
export function effectiveTextLength(value) {
  if (typeof value !== 'string') return 0;
  const trimmed = value.trim();
  let total = 0;
  for (const ch of trimmed) {
    total += CJK_RE.test(ch) ? 2 : 1;
  }
  return total;
}

/**
 * Validate one (kind, value-by-lang) projection of a manifest's SEO
 * metadata. Pushes violations into the supplied accumulator.
 *
 * @param {object} ctx
 * @param {string} ctx.manifestRel
 * @param {'title'|'description'} ctx.kind
 * @param {Record<string, string>} ctx.values
 * @param {Array<object>} ctx.violations
 */
function validateLangMap(ctx) {
  const { manifestRel, kind, values, violations } = ctx;
  const minLen = kind === 'title' ? TITLE_MIN_LENGTH : DESCRIPTION_MIN_LENGTH;
  const maxLen = kind === 'title' ? TITLE_MAX_LENGTH : DESCRIPTION_MAX_LENGTH;

  for (const [lang, value] of Object.entries(values)) {
    if (!SUPPORTED_LANGS.has(lang)) {
      violations.push({
        manifestPath: manifestRel,
        lang,
        gate: `${kind}-shape`,
        message: `Unsupported language key "${lang}" — expected one of ${ALL_LANGUAGES.join(', ')}`,
      });
      continue;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
      violations.push({
        manifestPath: manifestRel,
        lang,
        gate: `${kind}-shape`,
        message: `${kind} for "${lang}" must be a non-empty string`,
      });
      continue;
    }
    const length = effectiveTextLength(value);
    if (length < minLen || length > maxLen) {
      violations.push({
        manifestPath: manifestRel,
        lang,
        gate: `${kind}-length`,
        message: `${kind} for "${lang}" has effective length ${length}; expected ${minLen}–${maxLen}`,
      });
    }
    const prefix = detectForbiddenPrefix(value);
    if (prefix) {
      violations.push({
        manifestPath: manifestRel,
        lang,
        gate: 'forbidden-prefix',
        message: `${kind} for "${lang}" begins with reserved Stage-B label "${prefix}"`,
      });
    }
    const leaked = detectLeakyRunIdOrJargon(value);
    if (leaked) {
      violations.push({
        manifestPath: manifestRel,
        lang,
        gate: 'leaky-runid',
        message: `${kind} for "${lang}" contains internal token "${leaked}" — run-ids and "analysis run" jargon must not leak into SEO surfaces`,
      });
    }
  }
}

/**
 * Detect english-fallthrough cases: a non-English value identical to the
 * English value where `manifest.metadataFallback[<lang>] = "en"` is missing.
 *
 * The 13 non-English locales are collapsed into a **single** violation
 * entry per `(manifest, kind)` to keep the report compact when a whole
 * manifest is untranslated. The affected language list is preserved on
 * the entry as `affectedLangs` so downstream tools can still identify
 * each locale that needs attention.
 *
 * @param {object} ctx
 * @param {string} ctx.manifestRel
 * @param {'title'|'description'} ctx.kind
 * @param {Record<string, string>} ctx.values
 * @param {Record<string, string>} ctx.fallback
 * @param {Array<object>} ctx.violations
 */
function detectFallthrough(ctx) {
  const { manifestRel, kind, values, fallback, violations } = ctx;
  const en = typeof values.en === 'string' ? values.en.trim() : '';
  if (!en) return;
  const affected = [];
  for (const lang of ALL_LANGUAGES) {
    if (lang === 'en') continue;
    const value = typeof values[lang] === 'string' ? values[lang].trim() : '';
    if (!value || value !== en) continue;
    if (fallback?.[lang] === 'en') continue;
    affected.push(lang);
  }
  if (affected.length === 0) return;
  violations.push({
    manifestPath: manifestRel,
    lang: affected.length === 1 ? affected[0] : '*',
    gate: 'english-fallthrough',
    affectedLangs: affected,
    message:
      `${kind} duplicates the "en" value for ${affected.length} locale` +
      `${affected.length === 1 ? '' : 's'} (${affected.join(', ')}) but ` +
      `manifest.metadataFallback is not declared as "en" for ` +
      `${affected.length === 1 ? 'that locale' : 'those locales'}`,
  });
}

/**
 * Validate one manifest file. Returns an array of violation entries.
 * @param {string} manifestPath - absolute manifest path
 * @param {string} repoRoot - repository root (for relative-path reporting)
 */
export function validateManifest(manifestPath, repoRoot) {
  const manifestRel = path.relative(repoRoot, manifestPath);
  const data = loadManifest(manifestPath);
  if (data === null) {
    return [
      {
        manifestPath: manifestRel,
        lang: '',
        gate: 'parse',
        message: 'manifest.json missing or invalid JSON',
      },
    ];
  }

  const violations = [];
  const { title, description } = data;
  const fallback = data.metadataFallback ?? {};

  // Single-string overrides are legacy / emergency degraded form; we record
  // them as advisory violations so editors notice, but they do not block.
  if (typeof title === 'string') {
    violations.push({
      manifestPath: manifestRel,
      lang: 'en',
      gate: 'title-shape',
      message: 'title is a single string; expected a 14-language object (advisory)',
    });
  } else if (title && typeof title === 'object') {
    validateLangMap({ manifestRel, kind: 'title', values: title, violations });
    detectFallthrough({ manifestRel, kind: 'title', values: title, fallback, violations });
  }

  if (typeof description === 'string') {
    violations.push({
      manifestPath: manifestRel,
      lang: 'en',
      gate: 'description-shape',
      message: 'description is a single string; expected a 14-language object (advisory)',
    });
  } else if (description && typeof description === 'object') {
    validateLangMap({
      manifestRel,
      kind: 'description',
      values: description,
      violations,
    });
    detectFallthrough({
      manifestRel,
      kind: 'description',
      values: description,
      fallback,
      violations,
    });
  }

  return violations;
}

/**
 * Run validation across a list of manifests. Emits stderr lines for each
 * violation when `quiet` is false. Returns the flattened violation list.
 *
 * @param {string[]} manifestPaths
 * @param {string} repoRoot
 * @param {{ quiet?: boolean }} options
 */
export function runValidation(manifestPaths, repoRoot, { quiet = false } = {}) {
  const allViolations = [];
  for (const p of manifestPaths) {
    const v = validateManifest(p, repoRoot);
    if (v.length > 0) {
      allViolations.push(...v);
      if (!quiet) {
        for (const entry of v) {
          process.stderr.write(`❌ ${entry.manifestPath} [${entry.gate}] ${entry.message}\n`);
        }
      }
    } else if (!quiet) {
      process.stdout.write(`✅ ${path.relative(repoRoot, p)}\n`);
    }
  }
  return allViolations;
}

/**
 * Parse CLI argv. Exported for unit tests.
 *
 * The `--paths` flag accepts one or more positional values terminated by
 * either (a) the next `--…` flag, or (b) the conventional `--` sentinel
 * (consumed and not added to `paths`). This lets callers express
 * end-of-positional explicitly:
 *
 *   `validate-manifest-seo.js --paths a.json b.json -- --some-future-flag`
 *
 * Manifest paths that legitimately begin with `--` cannot be passed via
 * `--paths` without the `--` sentinel preceding them; this is a known
 * limitation matching standard POSIX argv conventions.
 */
export function parseArgs(argv) {
  const opts = {
    repoRoot: process.cwd(),
    paths: [],
    report: null,
    fail: true,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--repo-root':
        opts.repoRoot = argv[i + 1];
        i += 1;
        break;
      case '--paths':
        while (i + 1 < argv.length) {
          const next = argv[i + 1];
          if (next === '--') {
            // Conventional end-of-positional sentinel — consume and stop.
            i += 1;
            break;
          }
          if (next.startsWith('--')) break;
          opts.paths.push(next);
          i += 1;
        }
        break;
      case '--report':
        opts.report = argv[i + 1];
        i += 1;
        break;
      case '--no-fail':
        opts.fail = false;
        break;
      case '--quiet':
        opts.quiet = true;
        break;
      case '--help':
      case '-h':
        process.stdout.write(
          'Usage: validate-manifest-seo.js [--repo-root <path>] ' +
            '[--paths <manifest.json>... [--]] [--report <path>] [--no-fail] [--quiet]\n'
        );
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          throw new Error(`Unknown flag: ${arg}`);
        }
    }
  }
  return opts;
}

/** Main entry point. */
export function main(argv) {
  const opts = parseArgs(argv);
  const paths =
    opts.paths.length > 0
      ? opts.paths.map((p) => path.resolve(opts.repoRoot, p))
      : findAllManifests(opts.repoRoot);

  const violations = runValidation(paths, opts.repoRoot, { quiet: opts.quiet });

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      filesChecked: paths.length,
      violations: violations.length,
      byGate: aggregateByKey(violations, 'gate'),
      byLang: aggregateByKey(violations, 'lang'),
    },
    violations,
  };

  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (opts.report) {
    fs.mkdirSync(path.dirname(opts.report), { recursive: true });
    fs.writeFileSync(opts.report, json);
  } else if (!opts.quiet) {
    process.stdout.write(json);
  }

  if (violations.length > 0 && opts.fail) {
    process.exit(1);
  }
  return report;
}

/* c8 ignore start */
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`validate-manifest-seo: ${err.message}\n`);
    process.exit(1);
  }
}
/* c8 ignore stop */
