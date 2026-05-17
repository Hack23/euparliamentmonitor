#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/discover-untranslated-briefs
 * @description Discovery worker for the scheduled `news-translate` workflow.
 *
 * Scans every `analysis/daily/<date>/<slug>/executive-brief.md` source brief
 * (including the legacy `extended/executive-brief.md` location) and computes,
 * for each source, which of the 13 non-English translation companions
 * (`executive-brief_<lang>.md`) are still missing.
 *
 * The script emits a prioritised JSON queue of work items that the AI
 * translator should pick up, bounded by `--max-briefs` so a single workflow
 * run cannot exceed its 60-minute budget. The default cap (2 briefs / run)
 * comes from the sizing analysis recorded in the PR description: 2 briefs ×
 * 13 languages × ~12 KB ≈ 26 markdown files / ~310 KB of generated output,
 * comfortably inside the gh-aw safe-outputs 10 MB patch ceiling and the
 * Claude Sonnet 4.6 60-minute wall-clock budget.
 *
 * Priority rules — `fresh-then-backlog` mode (default):
 *
 *   The queue is built from two pools so the day's newest brief still gets
 *   timely coverage on at least one of the three daily runs, while the
 *   long-tail backlog of older briefs (currently ~92 sources / ~1,196 missing
 *   translations) actually drains rather than being starved by today's wins.
 *
 *   1. **Fresh slice** (at most 1 entry per run): newest source with any
 *      missing language. Tie-breakers: more-missing first, slug asc,
 *      non-extended first.
 *   2. **Backlog slice** (remaining `max-briefs - 1` slots): every other
 *      source with gaps, sorted by `<date>` ASC (oldest first), then
 *      `missingCount` ASC (finish half-done briefs before starting new
 *      ones), then `<slug>` ASC, then non-extended first.
 *
 *   Final queue = `freshSlice.concat(backlogSlice)`.
 *
 *   When `--max-briefs 1`, alternate fresh/backlog by run-number parity
 *   (`--run-number`, default 0, normally driven by `$GITHUB_RUN_NUMBER`) so
 *   the scheduled cadence still drains backlog while preserving freshness.
 *
 * Alternative modes (via `--mode`):
 *
 *   - `backlog-only` — drop the fresh slot entirely; oldest-first across the
 *     entire backlog. Useful for catch-up batches.
 *   - `newest-first` — legacy behaviour: newest date first, more-missing
 *     first, slug asc. Retained for one-off operator dispatch where the
 *     operator explicitly wants today's brief covered first.
 *
 * Invocation:
 *
 *   node scripts/discover-untranslated-briefs.js \
 *     [--repo-root <path>] \
 *     [--max-briefs <n>]      # default 2
 *     [--max-age-days <n>]    # default 180; older briefs are skipped
 *     [--mode <name>]         # fresh-then-backlog | backlog-only | newest-first
 *     [--run-number <n>]      # parity selector when --max-briefs 1
 *     [--output <path>]       # default stdout
 *     [--include-extended]    # also scan extended/executive-brief.md
 *
 * Exit codes:
 *   0 — queue successfully written (may be empty if everything is translated)
 *   1 — unexpected error (I/O, invalid CLI input)
 *
 * Output JSON shape:
 *   {
 *     "generatedAt": "2026-05-16T08:24:16.909Z",
 *     "options": { "mode": "fresh-then-backlog", "runNumber": 207, ... },
 *     "totals": {
 *       "sourcesScanned": 92,
 *       "sourcesWithGaps": 92,
 *       "translationsMissing": 1196,
 *       "queued": 2,
 *       "queuedTranslations": 26,
 *       "freshNewestDate": "2026-05-16",
 *       "backlogOldestDate": "2025-11-19",
 *       "topMissingLangs": [
 *         { "lang": "ja", "count": 92 },
 *         { "lang": "ko", "count": 92 },
 *         { "lang": "zh", "count": 92 }
 *       ]
 *     },
 *     "queue": [
 *       {
 *         "date": "2026-05-15",
 *         "slug": "breaking",
 *         "sourcePath": "analysis/daily/2026-05-15/breaking/executive-brief.md",
 *         "missingLangs": ["sv","da","no","fi","de","fr","es","nl","ar","he","ja","ko","zh"],
 *         "missingCount": 13,
 *         "isExtended": false,
 *         "sourceH2Count": 8,
 *         "sourceH2Titles": [
 *           { "line": 7, "title": "Headline Intelligence" },
 *           { "line": 96, "title": "IMF Economic Context" },
 *           { "line": 146, "title": "IMF Economic Context — May 2026 Update" }
 *         ],
 *         "sourceFixedTokens": { "IMF": 17, "WEO": 2, "TA-id": 4 }
 *       },
 *       ...
 *     ]
 *   }
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { ALL_LANGUAGES } from './constants/language-core.js';

/** Canonical 13 non-English target language codes, derived from ALL_LANGUAGES. */
export const TARGET_LANGS = Object.freeze(ALL_LANGUAGES.filter((lang) => lang !== 'en'));

/** Manual-dispatch upper bound that keeps one 60-minute run inside budget. */
export const MAX_BRIEFS_LIMIT = 4;

/** Discovery prioritisation modes. */
export const DISCOVERY_MODES = Object.freeze([
  'fresh-then-backlog',
  'backlog-only',
  'newest-first',
]);

/**
 * Parse CLI argv into an options object. Exported for unit tests.
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  const opts = {
    repoRoot: process.cwd(),
    maxBriefs: 2,
    maxAgeDays: 180,
    output: null,
    includeExtended: false,
    mode: 'fresh-then-backlog',
    runNumber: 0,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--repo-root':
        opts.repoRoot = argv[i + 1];
        i += 1;
        break;
      case '--max-briefs':
        opts.maxBriefs = Number.parseInt(argv[i + 1], 10);
        i += 1;
        break;
      case '--max-age-days':
        opts.maxAgeDays = Number.parseInt(argv[i + 1], 10);
        i += 1;
        break;
      case '--output':
        opts.output = argv[i + 1];
        i += 1;
        break;
      case '--include-extended':
        opts.includeExtended = true;
        break;
      case '--mode':
        opts.mode = argv[i + 1];
        i += 1;
        break;
      case '--run-number':
        opts.runNumber = Number(argv[i + 1]);
        i += 1;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          throw new Error(`Unknown flag: ${arg}`);
        }
    }
  }
  if (
    !Number.isFinite(opts.maxBriefs) ||
    opts.maxBriefs < 1 ||
    opts.maxBriefs > MAX_BRIEFS_LIMIT
  ) {
    throw new Error(`--max-briefs must be an integer between 1 and ${MAX_BRIEFS_LIMIT}`);
  }
  if (!Number.isFinite(opts.maxAgeDays) || opts.maxAgeDays < 1) {
    throw new Error('--max-age-days must be a positive integer');
  }
  if (!DISCOVERY_MODES.includes(opts.mode)) {
    throw new Error(
      `--mode must be one of: ${DISCOVERY_MODES.join(', ')} (got "${opts.mode}")`,
    );
  }
  if (!Number.isInteger(opts.runNumber) || opts.runNumber < 0) {
    throw new Error('--run-number must be a non-negative integer');
  }
  return opts;
}

function printHelp() {
  process.stdout.write(
    'Usage: discover-untranslated-briefs.js [--repo-root <path>] ' +
      '[--max-briefs <n>] [--max-age-days <n>] [--mode <name>] ' +
      '[--run-number <n>] [--output <path>] [--include-extended]\n',
  );
}

/**
 * Return the absolute path of every `executive-brief.md` (and optionally
 * `extended/executive-brief.md`) under `analysis/daily/`. Sources are
 * filtered to the last `maxAgeDays` so the queue stays focused on recent
 * material.
 *
 * @param {string} repoRoot
 * @param {{ includeExtended: boolean, maxAgeDays: number }} options
 * @returns {Array<{ absPath: string, relPath: string, date: string, slug: string, isExtended: boolean }>}
 */
export function findExecutiveBriefSources(repoRoot, options) {
  const dailyDir = path.join(repoRoot, 'analysis', 'daily');
  if (!fs.existsSync(dailyDir)) return [];

  const cutoffMs = Date.now() - options.maxAgeDays * 24 * 60 * 60 * 1000;
  const sources = [];

  for (const dateEntry of fs.readdirSync(dailyDir, { withFileTypes: true })) {
    if (!dateEntry.isDirectory()) continue;
    const date = dateEntry.name;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const dateMs = Date.parse(`${date}T00:00:00Z`);
    if (Number.isFinite(dateMs) && dateMs < cutoffMs) continue;

    const dateDir = path.join(dailyDir, date);
    for (const slugEntry of fs.readdirSync(dateDir, { withFileTypes: true })) {
      if (!slugEntry.isDirectory()) continue;
      const slug = slugEntry.name;
      // Skip translate-run* dirs (legacy artifacts from the previous workflow)
      if (slug.startsWith('translate-run')) continue;

      const direct = path.join(dateDir, slug, 'executive-brief.md');
      if (fs.existsSync(direct)) {
        sources.push({
          absPath: direct,
          relPath: path.relative(repoRoot, direct),
          date,
          slug,
          isExtended: false,
        });
      }
      if (options.includeExtended) {
        const extended = path.join(dateDir, slug, 'extended', 'executive-brief.md');
        if (fs.existsSync(extended)) {
          sources.push({
            absPath: extended,
            relPath: path.relative(repoRoot, extended),
            date,
            slug,
            isExtended: true,
          });
        }
      }
    }
  }
  return sources;
}

/**
 * For a single source brief, compute which `executive-brief_<lang>.md`
 * companions are missing in the same directory.
 *
 * @param {{ absPath: string }} source
 * @returns {string[]} sorted list of missing language codes (subset of TARGET_LANGS)
 */
export function findMissingLangs(source) {
  const dir = path.dirname(source.absPath);
  const missing = [];
  for (const lang of TARGET_LANGS) {
    const target = path.join(dir, `executive-brief_${lang}.md`);
    if (!fs.existsSync(target)) missing.push(lang);
  }
  return missing;
}

/**
 * Fixed-token classes the translator must preserve verbatim. Aligned with
 * `scripts/validate-brief-translations.js` `FIXED_TOKEN_PATTERNS` so the
 * discovery report and the validator surface the same shape of evidence.
 * Keys are stable identifiers (used by the agent prompt); values are the
 * global regex the count is computed against.
 *
 * @type {ReadonlyArray<{ key: string, pattern: RegExp }>}
 */
const FIXED_TOKEN_CLASSES = Object.freeze([
  { key: 'IMF', pattern: /\bIMF\b/g },
  { key: 'WEO', pattern: /\bWEO\b/g },
  { key: 'World Bank', pattern: /\bWorld Bank\b/g },
  { key: 'Fiscal Monitor', pattern: /\bFiscal Monitor\b/g },
  { key: 'data-vintage', pattern: /data-vintage="WEO-[A-Za-z]+-\d{4}"/g },
  { key: 'TA-id', pattern: /\bTA-\d{1,2}-\d{4}-\d{4}\b/g },
  { key: 'procedure-id', pattern: /\b\d{4}\/\d{4}\([A-Z]{3}\)/g },
]);

/**
 * Extract H2 section titles from a markdown source file. Returns the
 * 1-based line number and the visible title (with the leading `## `
 * stripped). The agent uses this to spot duplicate-titled sections such
 * as `## IMF Economic Context` followed by
 * `## IMF Economic Context — May 2026 Update`, which were silently
 * collapsed across all 13 translations in run #25983007788. Surfacing the
 * full title list at discovery time eliminates the ambiguity before any
 * translation work begins.
 *
 * @param {string} absPath
 * @returns {Array<{ line: number, title: string }>}
 */
export function extractH2Titles(absPath) {
  if (!fs.existsSync(absPath)) return [];
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = /^##\s+(\S.*)$/.exec(lines[i]);
    if (match) out.push({ line: i + 1, title: match[1].trim() });
  }
  return out;
}

/**
 * Count occurrences of each FIXED_TOKEN class in the source brief. Only
 * classes with at least one match are emitted, so the queue entry stays
 * compact for short briefs.
 *
 * @param {string} absPath
 * @returns {Record<string, number>}
 */
export function countFixedTokens(absPath) {
  if (!fs.existsSync(absPath)) return {};
  const text = fs.readFileSync(absPath, 'utf8');
  const counts = {};
  for (const { key, pattern } of FIXED_TOKEN_CLASSES) {
    const re = new RegExp(pattern.source, pattern.flags);
    let n = 0;
    while (re.exec(text) !== null) n += 1;
    if (n > 0) counts[key] = n;
  }
  return counts;
}

/**
 * Build the prioritised queue. See module docstring for ordering rules.
 *
 * @param {ReturnType<typeof findExecutiveBriefSources>} sources
 * @param {number | { maxBriefs: number, mode?: string, runNumber?: number }} options
 *   Numeric form retained for backward compatibility — equivalent to
 *   `{ maxBriefs, mode: 'fresh-then-backlog', runNumber: 0 }`.
 */
export function buildQueue(sources, options) {
  const opts =
    typeof options === 'number'
      ? { maxBriefs: options, mode: 'fresh-then-backlog', runNumber: 0 }
      : {
          maxBriefs: options.maxBriefs,
          mode: options.mode || 'fresh-then-backlog',
          runNumber: Number.isFinite(options.runNumber) ? options.runNumber : 0,
        };
  if (!DISCOVERY_MODES.includes(opts.mode)) {
    throw new Error(
      `buildQueue: invalid mode "${opts.mode}" (expected one of ${DISCOVERY_MODES.join(', ')})`,
    );
  }

  const withGaps = [];
  let totalMissing = 0;
  const missingByLang = new Map();
  for (const source of sources) {
    const missing = findMissingLangs(source);
    if (missing.length === 0) continue;
    totalMissing += missing.length;
    for (const lang of missing) {
      missingByLang.set(lang, (missingByLang.get(lang) || 0) + 1);
    }
    // Pre-compute structural targets for the translator agent so it has
    // explicit visibility into duplicate-titled H2 sections and the
    // verbatim-preserve token budget BEFORE any translation is written.
    // Surfacing these here (rather than relying on the agent to discover
    // them) prevents the regression observed in run #25983007788, where
    // 13 sibling translations of a single brief silently collapsed a
    // `## IMF Economic Context — May 2026 Update` section because the
    // agent treated it as a duplicate of `## IMF Economic Context`.
    const sourceH2Titles = extractH2Titles(source.absPath);
    const sourceFixedTokens = countFixedTokens(source.absPath);
    withGaps.push({
      date: source.date,
      slug: source.slug,
      sourcePath: source.relPath,
      missingLangs: missing,
      missingCount: missing.length,
      isExtended: source.isExtended,
      sourceH2Titles,
      sourceH2Count: sourceH2Titles.length,
      sourceFixedTokens,
    });
  }

  // Two canonical orderings drive the three modes.
  const newestFirst = (a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (a.missingCount !== b.missingCount) return b.missingCount - a.missingCount;
    if (a.slug !== b.slug) return a.slug < b.slug ? -1 : 1;
    if (a.isExtended !== b.isExtended) return a.isExtended ? 1 : -1;
    return 0;
  };
  const oldestFirstFinishPartial = (a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    // Within the same date, finish briefs that are closer to completion
    // first (fewer missing languages → ascending).
    if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
    if (a.slug !== b.slug) return a.slug < b.slug ? -1 : 1;
    if (a.isExtended !== b.isExtended) return a.isExtended ? 1 : -1;
    return 0;
  };

  let queue;
  if (opts.mode === 'newest-first') {
    queue = [...withGaps].sort(newestFirst).slice(0, opts.maxBriefs);
  } else if (opts.mode === 'backlog-only') {
    queue = [...withGaps].sort(oldestFirstFinishPartial).slice(0, opts.maxBriefs);
  } else {
    // fresh-then-backlog
    const newestSorted = [...withGaps].sort(newestFirst);
    const oldestSorted = [...withGaps].sort(oldestFirstFinishPartial);
    if (opts.maxBriefs === 1) {
      // Alternate fresh/backlog by run-number parity so the scheduled
      // cadence still drains backlog while preserving freshness on every
      // other slot. Even run-numbers (0, 2, ...) take the fresh slot;
      // odd run-numbers take the oldest backlog slot.
      const pool = opts.runNumber % 2 === 0 ? newestSorted : oldestSorted;
      queue = pool.slice(0, 1);
    } else {
      const freshSlice = newestSorted.slice(0, 1);
      const freshKey = freshSlice[0]
        ? `${freshSlice[0].date}\u0000${freshSlice[0].slug}\u0000${freshSlice[0].isExtended}`
        : null;
      const backlogSlice = oldestSorted
        .filter(
          (entry) => `${entry.date}\u0000${entry.slug}\u0000${entry.isExtended}` !== freshKey,
        )
        .slice(0, Math.max(0, opts.maxBriefs - 1));
      queue = [...freshSlice, ...backlogSlice];
    }
  }
  const queuedTranslations = queue.reduce((sum, item) => sum + item.missingCount, 0);

  // Top 3 most-blocked target languages across the entire backlog. Operators
  // skim this to spot e.g. "Japanese keeps falling behind" without parsing
  // the full queue. Sort by count desc, then language code asc for stable
  // tie-breaking.
  const topMissingLangs = [...missingByLang.entries()]
    .sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))
    .slice(0, 3)
    .map(([lang, count]) => ({ lang, count }));

  // Operator-visibility extents: newest source still carrying gaps (the
  // candidate for the fresh slot) and oldest source still carrying gaps
  // (the candidate for the backlog slot). Both fall back to null when the
  // backlog is empty.
  let freshNewestDate = null;
  let backlogOldestDate = null;
  for (const entry of withGaps) {
    if (freshNewestDate === null || entry.date > freshNewestDate) freshNewestDate = entry.date;
    if (backlogOldestDate === null || entry.date < backlogOldestDate) backlogOldestDate = entry.date;
  }

  return {
    totals: {
      sourcesScanned: sources.length,
      sourcesWithGaps: withGaps.length,
      translationsMissing: totalMissing,
      queued: queue.length,
      queuedTranslations,
      freshNewestDate,
      backlogOldestDate,
      topMissingLangs,
    },
    queue,
  };
}

/**
 * Main entry point.
 * @param {string[]} argv
 */
export function main(argv) {
  const opts = parseArgs(argv);
  const sources = findExecutiveBriefSources(opts.repoRoot, {
    includeExtended: opts.includeExtended,
    maxAgeDays: opts.maxAgeDays,
  });
  const { totals, queue } = buildQueue(sources, {
    maxBriefs: opts.maxBriefs,
    mode: opts.mode,
    runNumber: opts.runNumber,
  });
  const payload = {
    generatedAt: new Date().toISOString(),
    options: {
      maxBriefs: opts.maxBriefs,
      maxAgeDays: opts.maxAgeDays,
      includeExtended: opts.includeExtended,
      mode: opts.mode,
      runNumber: opts.runNumber,
    },
    totals,
    queue,
  };
  const out = `${JSON.stringify(payload, null, 2)}\n`;
  if (opts.output) {
    fs.mkdirSync(path.dirname(opts.output), { recursive: true });
    fs.writeFileSync(opts.output, out);
  } else {
    process.stdout.write(out);
  }
  return payload;
}

/* c8 ignore start */
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`discover-untranslated-briefs: ${err.message}\n`);
    process.exit(1);
  }
}
/* c8 ignore stop */
