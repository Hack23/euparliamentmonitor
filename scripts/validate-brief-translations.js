#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/validate-brief-translations
 * @description Drift-guard / quality validator for executive-brief translations.
 *
 * Validates every `analysis/daily/<date>/<slug>/executive-brief_<lang>.md`
 * companion in the repo (or a caller-supplied subset) against seven gates:
 *
 *   1. **Filename ↔ language code**  — suffix `_<lang>.md` must use a code in
 *      `TARGET_LANGS`.
 *   2. **Source presence**           — a sibling `executive-brief.md` must exist.
 *   3. **Length floor**              — translation byte size ≥ 50% of source
 *      (CJK shrinks to ~70%; below 50% is almost certainly a stub).
 *   4. **No English fall-through**   — at most `MAX_ENGLISH_PATTERNS` (default 4)
 *      hits of the `EN_PATTERNS` regex set may appear in the body. Untranslated
 *      copies trip this gate.
 *   5. **Fixed-token preservation** — proper nouns that must NEVER be
 *      localised (`IMF`, `WEO`, `World Bank`, `Fiscal Monitor`,
 *      `data-vintage="WEO-…"`, EP
 *      adopted-text IDs like `TA-10-2026-0160`) must appear in the translation
 *      whenever they appear in the source.
 *   6. **Heading parity**             — H1/H2/H3 heading counts must match
 *      the source closely. H1 must match exactly (one per brief by style
 *      guide). H2 must match exactly (`H2_TOLERANCE = 0`): each `##` heading
 *      is a major section and dropping or merging one is the single most
 *      common AI failure mode. H3 may differ by at most `H3_TOLERANCE` (1)
 *      to allow legitimate sub-bullet fusion. The legacy `HEADING_TOLERANCE`
 *      export is preserved as an alias for `H3_TOLERANCE`.
 *   7. **Mermaid block parity**       — every ```` ```mermaid ```` block in the
 *      source must appear at least once in the translation. Mermaid syntax
 *      is a machine-readable fixed token; dropping a diagram silently breaks
 *      downstream HTML rendering.
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
/**
 * Tokens that MUST be preserved verbatim in every translation.
 *
 * Each pattern matches one class of "fixed token" — proper nouns, ID
 * formats, or machine-readable attributes — that the translator agent
 * must NOT localise. The fixed-token preservation gate applies the rule like this:
 * every exact token instance from the SOURCE must also appear in the
 * TRANSLATION at least the same number of times.
 *
 *  - `IMF`         — International Monetary Fund. Stays Latin-script even in
 *                    Arabic, Hebrew, Japanese, Korean, Chinese translations.
 *  - `WEO`         — IMF World Economic Outlook publication acronym.
 *  - `World Bank`  — proper noun, never translated.
 *  - `Fiscal Monitor` — IMF publication name; stays English.
 *  - `data-vintage="WEO-<Month>-YYYY"` — machine-readable HTML attribute used
 *                    by downstream renderers; the `WEO-Month-Year` shape
 *                    must round-trip exactly.
 *  - `TA-NN-YYYY-NNNN` — European Parliament adopted-text reference
 *                    (e.g. `TA-10-2026-0160`); cited verbatim in news articles.
 *  - `YYYY/NNNN(III)` — EP legislative procedure ID (e.g. `2024/0001(COD)`
 *                    where `III` is one of COD, INI, NLE, RSP, BUD …); used
 *                    as a stable handle by EUR-Lex / OEIL.
 *
 * Patterns are anchored with `\b` word boundaries where appropriate so that
 * sub-string false positives (e.g. `WEOlogical` or `IMFinity`) do not match.
 *
 * @type {readonly RegExp[]}
 */
export const FIXED_TOKEN_PATTERNS = Object.freeze([
  /\bIMF\b/,
  /\bWEO\b/,
  /\bWorld Bank\b/,
  /\bFiscal Monitor\b/,
  /data-vintage="WEO-[A-Za-z]+-\d{4}"/,
  /\bTA-\d{1,2}-\d{4}-\d{4}\b/,
  /\b\d{4}\/\d{4}\([A-Z]{3}\)/,
]);

/**
 * Pre-compiled `g`-flag variants of FIXED_TOKEN_PATTERNS.
 *
 * `String#match(regex)` only returns ALL matches when the regex has the
 * `g` flag. We pre-compile the global variants once at module load (instead
 * of in the per-translation validation loop) to avoid creating a fresh
 * RegExp object on every call to `validateTranslation`. Frozen so the
 * collection cannot be mutated by callers.
 *
 * @type {readonly RegExp[]}
 */
const FIXED_TOKEN_PATTERNS_GLOBAL = Object.freeze(
  FIXED_TOKEN_PATTERNS.map((re) => new RegExp(re.source, 'g')),
);

/**
 * Tolerance (in absolute count) for H3 heading-count drift between the
 * source and the translation.
 *
 * - **H1**: hard zero — every brief has exactly one H1 by style guide.
 * - **H2**: hard zero (see `H2_TOLERANCE` below). H2 is a major section;
 *   silently dropping or merging one is the single most common AI failure
 *   mode and the validator must catch it even when the dropped section
 *   contains no `FIXED_TOKEN_PATTERNS` matches to flag separately.
 * - **H3**: tolerance of 1. Translators sometimes legitimately fuse two
 *   very short sub-bullets into one paragraph, or split a long H3 into two
 *   for readability in CJK scripts where dense text harms scanability.
 *
 * `HEADING_TOLERANCE` is preserved as a backward-compatible alias for
 * `H3_TOLERANCE` so existing consumers (tests, downstream tooling that
 * imports the constant) keep working.
 */
export const H2_TOLERANCE = 0;
export const H3_TOLERANCE = 1;
export const HEADING_TOLERANCE = H3_TOLERANCE;

/**
 * Pattern that matches a fenced ```mermaid block opener (case-insensitive).
 * We match only the opening fence — counting openers is enough because
 * Mermaid blocks are always closed by a `` ``` `` line, and an unclosed
 * block in source would already break Markdown rendering elsewhere.
 */
const MERMAID_OPENER = /^```mermaid\s*$/gim;

/** Count occurrences of a global regex in a string. */
function countGlobal(text, regex) {
  // Clone to avoid lastIndex state bleeding across calls.
  const re = new RegExp(regex.source, regex.flags);
  let count = 0;
  while (re.exec(text) !== null) count += 1;
  return count;
}

/**
 * Count Markdown heading lines at a given ATX level. Only matches the
 * canonical leading-`#` form — setext (`===` / `---`) underlines are
 * outside the executive-brief style guide.
 *
 * @param {string} text
 * @param {1|2|3} level
 */
export function countHeadings(text, level) {
  const re = new RegExp(`^#{${level}}\\s+\\S`, 'gm');
  return countGlobal(text, re);
}

/** Count fenced \`\`\`mermaid blocks in the given text. */
export function countMermaidBlocks(text) {
  return countGlobal(text, MERMAID_OPENER);
}

/**
 * Extract H2 section titles from markdown text. Mirrors the shape returned
 * by `scripts/discover-untranslated-briefs.js#extractH2Titles` so the
 * validator can produce a precise "likely-dropped section" diagnostic when
 * the heading-parity gate fires.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function extractH2Titles(text) {
  const lines = text.split('\n');
  const out = [];
  for (const line of lines) {
    const match = /^##\s+(\S.*)$/.exec(line);
    if (match) out.push(match[1].trim());
  }
  return out;
}

/**
 * Compute the set of source H2 titles that have no fuzzy match in the
 * translation. We do NOT require translated titles to be identical — they
 * are localised — but every source H2 should map to *some* translation
 * H2. We treat two titles as "potentially matched" when they share any
 * fixed-token prefix (`IMF`, `WEO`, `TA-…`, `data-vintage="…"`) or when
 * the translation has exactly the same count of H2s. The output is purely
 * advisory: the gate itself still fires on count mismatch.
 *
 * Heuristic: a source title is reported as "likely dropped" only when
 *   (a) it contains at least one FIXED_TOKEN_PATTERNS match, AND
 *   (b) no translation title contains that same token, AND
 *   (c) the H2 count mismatch is exactly 1 (so we're confident a single
 *       section vanished rather than a wholesale restructure).
 *
 * @param {string[]} sourceTitles
 * @param {string[]} targetTitles
 * @returns {string[]}
 */
function detectLikelyDroppedH2s(sourceTitles, targetTitles) {
  if (sourceTitles.length - targetTitles.length !== 1) return [];
  const dropped = [];
  // Count, per FIXED TOKEN, how many source H2 titles contain it vs how
  // many target H2 titles contain it. When a source H2 contains a token
  // whose translation-side count is strictly smaller, that source H2 is
  // very likely the dropped section.
  for (const title of sourceTitles) {
    const tokens = [];
    for (const re of FIXED_TOKEN_PATTERNS) {
      const m = new RegExp(re.source).exec(title);
      if (m) tokens.push(m[0]);
    }
    if (tokens.length === 0) continue;
    let lostToken = false;
    for (const tok of tokens) {
      const sourceHits = sourceTitles.filter((t) => t.includes(tok)).length;
      const targetHits = targetTitles.filter((t) => t.includes(tok)).length;
      if (targetHits < sourceHits) {
        lostToken = true;
        break;
      }
    }
    if (lostToken) dropped.push(title);
  }
  // If the heuristic flagged multiple, prefer the *last-occurring* source
  // title with a lost token — the second-of-two duplicate-titled section
  // is the prototypical regression (run #25983007788). When no token
  // signal at all is available, we return [] so the message stays clean
  // rather than guessing.
  if (dropped.length > 1) return [dropped[dropped.length - 1]];
  return dropped;
}


/** Count exact token occurrences returned by one fixed-token pattern. */
function countMatches(text, regex) {
  const counts = new Map();
  const matches = text.match(regex) || [];
  for (const token of matches) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return counts;
}

/**
 * Quote one shell argument for safe copy/paste in POSIX shells.
 *
 * @param {string} arg
 * @returns {string}
 */
function shellQuote(arg) {
  return `'${String(arg).replace(/'/g, `'\"'\"'`)}'`;
}

/**
 * Aggregate a violation list into a `{ key: count }` map for the validator
 * report. Items with falsy values at `key` are skipped so the filename-gate
 * violation (which has `lang: ''`) doesn't pollute the byLang summary.
 * Keys in the returned object are sorted alphabetically so the emitted JSON
 * is byte-stable across runs.
 *
 * @param {Array<Object>} items
 * @param {string} key
 * @returns {Object<string, number>}
 */
export function aggregateByKey(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = item[key];
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  const sorted = {};
  for (const k of [...counts.keys()].sort()) {
    sorted[k] = counts.get(k);
  }
  return sorted;
}

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
  for (let i = 0; i < FIXED_TOKEN_PATTERNS_GLOBAL.length; i++) {
    const reGlobal = FIXED_TOKEN_PATTERNS_GLOBAL[i];
    const reSingle = FIXED_TOKEN_PATTERNS[i];
    const sourceCounts = countMatches(sourceText, reGlobal);
    if (sourceCounts.size === 0) continue;
    const targetCounts = countMatches(targetText, reGlobal);
    const missingTokens = [];
    for (const [token, sourceCount] of sourceCounts.entries()) {
      const targetCount = targetCounts.get(token) || 0;
      if (targetCount < sourceCount) {
        missingTokens.push(`${token} (${targetCount}/${sourceCount})`);
      }
    }
    if (missingTokens.length > 0) {
      const relQuoted = shellQuote(rel);
      const siblingGlobQuoted = shellQuote(`${path.posix.dirname(rel)}/executive-brief_*.md`);
      violations.push({
        translationPath: rel,
        sourcePath: sourceRel,
        lang,
        gate: 'fixed-token-preservation',
        message:
          `Translation is missing exact ${reSingle} token(s): ${missingTokens.join(', ')} ` +
          `— proper noun / data-vintage identifiers MUST be preserved verbatim. ` +
          `Self-check before flush: \`node scripts/validate-brief-translations.js --paths ${relQuoted}\` ` +
          `(or \`--paths ${siblingGlobQuoted}\` to validate every sibling). ` +
          `Dutch example: \`IMF\` stays \`IMF\` (never \`IMV\`); \`WEO\` stays \`WEO\` ` +
          `(never \`Wereldwijde Economische Vooruitzichten\`).`,
      });
    }
  }

  // Gate 6 — heading parity. H1 and H2 must match exactly (briefs have
  // exactly one H1 by style guide; each H2 is a major section that must
  // round-trip). H3 may drift by H3_TOLERANCE in absolute count.
  for (const level of [1, 2, 3]) {
    const sourceCount = countHeadings(sourceText, level);
    if (sourceCount === 0) continue;
    const targetCount = countHeadings(targetText, level);
    let tolerance;
    if (level === 1) tolerance = 0;
    else if (level === 2) tolerance = H2_TOLERANCE;
    else tolerance = H3_TOLERANCE;
    if (Math.abs(sourceCount - targetCount) > tolerance) {
      let detail = '';
      if (level === 2) {
        // Surface the actual H2 titles so reviewers/agents can pinpoint
        // which section was dropped — regression hardening from run
        // #25983007788 where 13 sibling translations identically dropped
        // `## IMF Economic Context — May 2026 Update` and the validator
        // report only said "8 vs 7 H2".
        const sourceTitles = extractH2Titles(sourceText);
        const targetTitles = extractH2Titles(targetText);
        const dropped = detectLikelyDroppedH2s(sourceTitles, targetTitles);
        const sourceList = sourceTitles.map((t) => `"${t}"`).join(', ');
        detail = ` Source H2 titles: [${sourceList}].`;
        if (dropped.length > 0) {
          detail +=
            ` Likely dropped: [${dropped.map((t) => `"${t}"`).join(', ')}].` +
            ` Re-translate the missing section and keep its FIXED TOKEN(S) verbatim.`;
        }
      }
      violations.push({
        translationPath: rel,
        sourcePath: sourceRel,
        lang,
        gate: 'heading-parity',
        message:
          `Translation has ${targetCount} H${level} heading(s); source has ${sourceCount} ` +
          `(tolerance ±${tolerance}). Whole subsections appear to be missing or merged.` +
          detail,
      });
    }
  }

  // Gate 7 — Mermaid block parity. Every ```mermaid opener in the source
  // must appear at least once in the translation. Diagrams are fixed
  // machine-readable assets and must round-trip verbatim.
  const sourceMermaid = countMermaidBlocks(sourceText);
  if (sourceMermaid > 0) {
    const targetMermaid = countMermaidBlocks(targetText);
    if (targetMermaid < sourceMermaid) {
      violations.push({
        translationPath: rel,
        sourcePath: sourceRel,
        lang,
        gate: 'mermaid-parity',
        message:
          `Translation contains ${targetMermaid} \`\`\`mermaid block(s); source has ${sourceMermaid}. ` +
          `Mermaid diagram syntax MUST be preserved verbatim — the downstream renderer parses these blocks.`,
      });
    }
  }

  return violations;
}

/**
 * Expand a list of paths that may contain glob patterns into resolved file paths.
 * Uses Node's built-in fs.globSync (Node 22+) for any entry containing `*` or `?`.
 */
export function expandPathGlobs(rawPaths, repoRoot) {
  const expanded = [];
  for (const p of rawPaths) {
    const resolved = path.resolve(repoRoot, p);
    if (/[*?]/.test(resolved)) {
      const matches = fs.globSync(resolved);
      expanded.push(...matches);
    } else {
      expanded.push(resolved);
    }
  }
  return expanded;
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
    ? expandPathGlobs(opts.paths, opts.repoRoot)
    : findAllTranslations(opts.repoRoot);

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
    process.stderr.write(`validate-brief-translations: ${err.message}\n`);
    process.exit(1);
  }
}
/* c8 ignore stop */
