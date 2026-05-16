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
 * Priority rules (newest-first, oldest-first within a brief):
 *
 *   1. Sort by `<date>` descending so today's briefs win.
 *   2. Within the same date, briefs with *more* missing languages outrank
 *      briefs with fewer missing languages so partial coverage gets completed
 *      quickly.
 *   3. Remaining ties sort by `<slug>` alphabetically so the run is
 *      deterministic and reviewers can predict which slugs land first.
 *
 * Invocation:
 *
 *   node scripts/discover-untranslated-briefs.js \
 *     [--repo-root <path>] \
 *     [--max-briefs <n>]      # default 2
 *     [--max-age-days <n>]    # default 180; older briefs are skipped
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
 *     "totals": {
 *       "sourcesScanned": 92,
 *       "sourcesWithGaps": 92,
 *       "translationsMissing": 1196,
 *       "queued": 2,
 *       "queuedTranslations": 26
 *     },
 *     "queue": [
 *       {
 *         "date": "2026-05-15",
 *         "slug": "breaking",
 *         "sourcePath": "analysis/daily/2026-05-15/breaking/executive-brief.md",
 *         "missingLangs": ["sv","da","no","fi","de","fr","es","nl","ar","he","ja","ko","zh"],
 *         "missingCount": 13,
 *         "isExtended": false
 *       },
 *       ...
 *     ]
 *   }
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/** Canonical 13 non-English target language codes. Mirrors ALL_LANGUAGES − ['en']. */
export const TARGET_LANGS = Object.freeze([
  'sv', 'da', 'no', 'fi', 'de', 'fr', 'es', 'nl',
  'ar', 'he', 'ja', 'ko', 'zh',
]);

/** Manual-dispatch upper bound that keeps one 60-minute run inside budget. */
export const MAX_BRIEFS_LIMIT = 4;

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
  return opts;
}

function printHelp() {
  process.stdout.write(
    'Usage: discover-untranslated-briefs.js [--repo-root <path>] ' +
      '[--max-briefs <n>] [--max-age-days <n>] [--output <path>] ' +
      '[--include-extended]\n'
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
 * Build the prioritised queue. See module docstring for ordering rules.
 *
 * @param {ReturnType<typeof findExecutiveBriefSources>} sources
 * @param {number} maxBriefs
 */
export function buildQueue(sources, maxBriefs) {
  const withGaps = [];
  let totalMissing = 0;
  for (const source of sources) {
    const missing = findMissingLangs(source);
    if (missing.length === 0) continue;
    totalMissing += missing.length;
    withGaps.push({
      date: source.date,
      slug: source.slug,
      sourcePath: source.relPath,
      missingLangs: missing,
      missingCount: missing.length,
      isExtended: source.isExtended,
    });
  }

  // Sort: newest date first; then more-missing first (finish partial briefs);
  // then slug alphabetical for determinism.
  withGaps.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (a.missingCount !== b.missingCount) return b.missingCount - a.missingCount;
    if (a.slug !== b.slug) return a.slug < b.slug ? -1 : 1;
    // Prefer non-extended over extended when both exist for the same slug
    if (a.isExtended !== b.isExtended) return a.isExtended ? 1 : -1;
    return 0;
  });

  const queue = withGaps.slice(0, maxBriefs);
  const queuedTranslations = queue.reduce((sum, item) => sum + item.missingCount, 0);

  return {
    totals: {
      sourcesScanned: sources.length,
      sourcesWithGaps: withGaps.length,
      translationsMissing: totalMissing,
      queued: queue.length,
      queuedTranslations,
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
  const { totals, queue } = buildQueue(sources, opts.maxBriefs);
  const payload = {
    generatedAt: new Date().toISOString(),
    options: {
      maxBriefs: opts.maxBriefs,
      maxAgeDays: opts.maxAgeDays,
      includeExtended: opts.includeExtended,
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
