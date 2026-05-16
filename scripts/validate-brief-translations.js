#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/validate-brief-translations
 * @description Drift-guard / quality validator for executive-brief translations.
 *
 * Validates every `analysis/daily/<date>/<slug>/executive-brief_<lang>.md`
 * companion in the repo (or a caller-supplied subset) against five gates:
 *
 *   1. **Filename ↔ language code**  — suffix `_<lang>.md` must use a code in
 *      `TARGET_LANGS`.
 *   2. **Source presence**           — a sibling `executive-brief.md` must exist.
 *   3. **Length floor**              — translation byte size ≥ 50% of source
 *      (CJK shrinks to ~70%; below 50% is almost certainly a stub).
 *   4. **No English fall-through**   — at most `MAX_ENGLISH_PATTERNS` (default 4)
 *      hits of the `EN_PATTERNS` regex set may appear in the body. Untranslated
 *      copies trip this gate.
 *   5. **Frontmatter / fixed-string parity** — proper nouns that must NEVER be
 *      localised (`IMF`, `WEO`, `World Bank`, `data-vintage="WEO-…"`, EP
 *      adopted-text IDs like `TA-10-2026-0160`) must appear in the translation
 *      whenever they appear in the source.
 *
 * Each translation that fails any gate produces a structured report entry.
 * The process exits with code 1 if any failures are present (unless
 * `--no-fail` is passed for advisory mode).
 *
 * This script is invoked by:
 *   - `npm run validate:translations`             (CI + local)
 *   - `news-translate` workflow Step 4            (per-run gate)
 *
 * Invocation:
 *   node scripts/validate-brief-translations.js \
 *     [--repo-root <path>] \
 *     [--paths <glob>...]     # validate specific translation files only
 *     [--report <path>]       # write JSON report; default stdout
 *     [--no-fail]             # exit 0 even when violations found
 *     [--quiet]               # suppress per-file logging
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { TARGET_LANGS } from './discover-untranslated-briefs.js';

/**
 * Minimum translated-byte-size as a fraction of the source size.
 * CJK languages routinely shrink to ~60% (kanji are denser than English),
 * so we set the floor at 50% rather than 80%.
 */
export const LENGTH_FLOOR_RATIO = 0.5;

/** Maximum number of English-only sentence patterns tolerated in a translation. */
export const MAX_ENGLISH_PATTERNS = 4;

/**
 * Conservative set of English-only sentence patterns. A translation that
 * contains more than `MAX_ENGLISH_PATTERNS` matches is almost certainly an
 * untranslated copy of the English source. The patterns are intentionally
 * narrow: short function words (`the`, `of`, `and`) match every European
 * Latin-script language and would generate too many false positives.
 */
export const EN_PATTERNS = [
  /\bthe European Parliament\b/i,
  /\bbottom line up front\b/i,
  /\bkey judgments?\b/i,
  /\bbased on official EP\b/i,
  /\bplenary session\b/i,
  /\b60-second read\b/i,
  /\bconfidence:\s*🟢\s*high\b/i,
  /\bnext steps\b/i,
  /\bin favour\b/i,
];

/**
 * Proper-noun / fixed-string tokens that translators MUST preserve verbatim
 * when they appear in the source. Tokens are matched case-sensitively.
 */
export const FIXED_TOKEN_PATTERNS = [
  /\bIMF\b/,
  /\bWEO\b/,
  /\bWorld Bank\b/,
  /\bFiscal Monitor\b/,
  /data-vintage="WEO-[A-Za-z]+-\d{4}"/,
  /\bTA-\d{1,2}-\d{4}-\d{4}\b/,        // EP adopted-text references
  /\b\d{4}\/\d{4}\([A-Z]{3}\)/,         // EP procedure IDs (e.g. 2024/0001(COD))
];

/**
 * @typedef {Object} Violation
 * @property {string} translationPath
 * @property {string} sourcePath
 * @property {string} lang
 * @property {string} gate
 * @property {string} message
 */

/** Parse CLI argv. Exported for unit tests. */
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
        while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
          opts.paths.push(argv[i + 1]);
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
          'Usage: validate-brief-translations.js [--repo-root <path>] ' +
            '[--paths <file>...] [--report <path>] [--no-fail] [--quiet]\n'
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

/** Recursively find every `executive-brief_*.md` under `analysis/daily/`. */
export function findAllTranslations(repoRoot) {
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
      } else if (entry.isFile() && /^executive-brief_[a-z]{2}\.md$/.test(entry.name)) {
        out.push(full);
      }
    }
  }
  return out;
}

/** Validate one translation file. Returns an array of Violation entries. */
export function validateTranslation(translationPath, repoRoot) {
  const violations = [];
  const rel = path.relative(repoRoot, translationPath);
  const base = path.basename(translationPath);
  const match = base.match(/^executive-brief_([a-z]{2})\.md$/);

  if (!match) {
    violations.push({
      translationPath: rel,
      sourcePath: '',
      lang: '',
      gate: 'filename',
      message: `Filename must match executive-brief_<lang>.md`,
    });
    return violations;
  }

  const lang = match[1];
  const sourcePath = path.join(path.dirname(translationPath), 'executive-brief.md');
  const sourceRel = path.relative(repoRoot, sourcePath);

  if (!TARGET_LANGS.includes(lang)) {
    violations.push({
      translationPath: rel,
      sourcePath: sourceRel,
      lang,
      gate: 'language-code',
      message: `Language code "${lang}" is not one of the 13 supported target languages: ${TARGET_LANGS.join(', ')}`,
    });
  }

  if (!fs.existsSync(sourcePath)) {
    violations.push({
      translationPath: rel,
      sourcePath: sourceRel,
      lang,
      gate: 'source-presence',
      message: `Source executive-brief.md missing — orphaned translation`,
    });
    return violations;
  }

  const sourceBytes = fs.statSync(sourcePath).size;
  const targetBytes = fs.statSync(translationPath).size;
  if (sourceBytes > 0 && targetBytes < sourceBytes * LENGTH_FLOOR_RATIO) {
    violations.push({
      translationPath: rel,
      sourcePath: sourceRel,
      lang,
      gate: 'length-floor',
      message:
        `Translation byte size ${targetBytes} is below ` +
        `${Math.round(LENGTH_FLOOR_RATIO * 100)}% of source ${sourceBytes} — likely a stub`,
    });
  }

  const targetText = fs.readFileSync(translationPath, 'utf8');
  let englishHits = 0;
  for (const re of EN_PATTERNS) {
    if (re.test(targetText)) englishHits += 1;
  }
  if (englishHits > MAX_ENGLISH_PATTERNS) {
    violations.push({
      translationPath: rel,
      sourcePath: sourceRel,
      lang,
      gate: 'english-fallthrough',
      message:
        `Translation contains ${englishHits} English-only sentence patterns ` +
        `(max ${MAX_ENGLISH_PATTERNS}); content was likely copied from the English source`,
    });
  }

  const sourceText = fs.readFileSync(sourcePath, 'utf8');
  for (const re of FIXED_TOKEN_PATTERNS) {
    const sourceMatches = sourceText.match(new RegExp(re, 'g')) || [];
    if (sourceMatches.length === 0) continue;
    const targetMatches = targetText.match(new RegExp(re, 'g')) || [];
    if (targetMatches.length === 0) {
      violations.push({
        translationPath: rel,
        sourcePath: sourceRel,
        lang,
        gate: 'fixed-token-preservation',
        message:
          `Source contains ${sourceMatches.length} matches of ${re} ` +
          `but translation contains none — proper noun / data-vintage MUST be preserved verbatim`,
      });
    }
  }

  return violations;
}

/** Run validation against a list of translation paths. */
export function runValidation(translationPaths, repoRoot, { quiet = false } = {}) {
  const allViolations = [];
  for (const p of translationPaths) {
    const v = validateTranslation(p, repoRoot);
    if (v.length > 0) {
      allViolations.push(...v);
      if (!quiet) {
        for (const entry of v) {
          process.stderr.write(
            `❌ ${entry.translationPath} [${entry.gate}] ${entry.message}\n`
          );
        }
      }
    } else if (!quiet) {
      process.stdout.write(`✅ ${path.relative(repoRoot, p)}\n`);
    }
  }
  return allViolations;
}

/** Main entry point. */
export function main(argv) {
  const opts = parseArgs(argv);
  const paths = opts.paths.length > 0
    ? opts.paths.map((p) => path.resolve(opts.repoRoot, p))
    : findAllTranslations(opts.repoRoot);

  const violations = runValidation(paths, opts.repoRoot, { quiet: opts.quiet });

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      filesChecked: paths.length,
      violations: violations.length,
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
    process.stderr.write(`validate-brief-translations: ${err.message}\n`);
    process.exit(1);
  }
}
/* c8 ignore stop */
