#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module scripts/cache-thresholds
 * @description Thresholds cache helper for Stage B analysis runs.
 *
 * The `analysis/methodologies/reference-quality-thresholds.json` file is large
 * (~1 000 lines). Without this helper, each artifact's Stage B write cycle
 * causes the agent to re-read the entire thresholds file to look up the floor
 * for a single relativePath. With 38+ artifacts per run, that amounts to 38+
 * wasted LLM invocations.
 *
 * This script:
 *   1. Reads the full `reference-quality-thresholds.json`
 *   2. Filters to the subset relevant to the given article-type slug
 *   3. Writes a compact `thresholds-cache.json` under the run directory
 *   4. Uses a content hash for the cache key so subsequent calls with identical
 *      inputs short-circuit without re-writing the file
 *
 * The output file is a flat map: `{ [relativePath]: number }` where the value
 * is the per-artifact line floor for that slug, plus a small set of metadata
 * fields.
 *
 * Invocation (Stage B start — called once per run):
 *   node scripts/cache-thresholds.js \
 *     --slug breaking \
 *     --run-id breaking-run-1234 \
 *     [--analysis-dir analysis/daily/2026-05-14/breaking] \
 *     [--repo-root /path/to/repo]
 *
 * Exports (for unit testing):
 *   loadThresholds(repoRoot)
 *   filterThresholdsForSlug(thresholds, slug)
 *   buildThresholdsCache(repoRoot, slug, runId, runDir)
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/** Path relative to repo root for the canonical thresholds file. */
const THRESHOLDS_REL_PATH = 'analysis/methodologies/reference-quality-thresholds.json';

/** Default minimum line floor when no per-artifact entry is found. */
const DEFAULT_MIN_LINES = 30;

/** Output filename written to the run directory. */
const CACHE_FILENAME = 'thresholds-cache.json';

// ---------------------------------------------------------------------------
// Article-type slug → thresholds key normalisation
// ---------------------------------------------------------------------------

/**
 * Normalise an article-type slug to the canonical key used in the thresholds
 * JSON. The slug might be a workflow slug (e.g. `breaking`) or a longer form
 * (e.g. `breaking-run-123456`). We strip any run-ID suffix.
 *
 * @param {string} slug - Raw slug value
 * @returns {string} Canonical article-type key
 */
export function normaliseSlug(slug) {
  // Strip run-ID suffixes like `-run-<digits>` or `-run-<digits>-<digits>`
  return slug.replace(/-run-\d+(-\d+)?$/, '');
}

// ---------------------------------------------------------------------------
// Thresholds file loader
// ---------------------------------------------------------------------------

/**
 * Load the full `reference-quality-thresholds.json` from the repo root.
 *
 * @param {string} repoRoot - Absolute path to the repository root
 * @returns {{ thresholds: object, raw: string }}
 * @throws {Error} If the file is missing or not valid JSON
 */
export function loadThresholds(repoRoot) {
  const filePath = path.join(repoRoot, THRESHOLDS_REL_PATH);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Thresholds file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return { thresholds: parsed, raw };
}

// ---------------------------------------------------------------------------
// Slug filter
// ---------------------------------------------------------------------------

/**
 * Filter the thresholds object to only the entries relevant to a given slug.
 *
 * The thresholds JSON has a `thresholds` object keyed by `articleType`.
 * For each article type, it contains a `files` map of `relativePath → number`.
 *
 * The output is a flat map: `{ [relativePath]: floor }` for the matching
 * article type(s). Cross-type entries (present in multiple article types)
 * use the maximum floor across all matched types.
 *
 * @param {object} thresholds - Parsed thresholds JSON root object
 * @param {string} slug       - Article-type slug (already normalised)
 * @returns {{ floors: Record<string, number>, matchedTypes: string[], defaultFloor: number }}
 */
export function filterThresholdsForSlug(thresholds, slug) {
  const floors = {};
  const matchedTypes = [];

  const thresholdsMap = thresholds?.thresholds ?? {};
  const defaultFloor =
    thresholds?.defaults?.minLines ?? DEFAULT_MIN_LINES;

  for (const [articleType, typeConfig] of Object.entries(thresholdsMap)) {
    // Match when the articleType equals the slug or contains it as a prefix
    const normType = normaliseSlug(articleType);
    if (normType !== slug && articleType !== slug) continue;

    matchedTypes.push(articleType);

    const filesMap = typeConfig?.files ?? typeConfig ?? {};
    for (const [relPath, floor] of Object.entries(filesMap)) {
      if (typeof floor === 'number') {
        // Use max floor across matched types for cross-type overlap
        floors[relPath] = Math.max(floors[relPath] ?? 0, floor);
      }
    }
  }

  return { floors, matchedTypes, defaultFloor };
}

// ---------------------------------------------------------------------------
// Cache builder
// ---------------------------------------------------------------------------

/**
 * Build and write a slug-filtered thresholds cache file.
 *
 * If an existing cache file with the same content hash already exists,
 * the write is skipped and `{ cached: true }` is returned.
 *
 * @param {string} repoRoot   - Absolute path to the repository root
 * @param {string} slug       - Article-type slug
 * @param {string} runId      - Run identifier (used for the output path)
 * @param {string} [runDir]   - Override for the run directory (defaults to
 *                              `analysis/runs/<runId>` relative to repoRoot)
 * @returns {{
 *   outputFile: string,
 *   floors: Record<string, number>,
 *   matchedTypes: string[],
 *   defaultFloor: number,
 *   contentHash: string,
 *   cached: boolean
 * }}
 */
export function buildThresholdsCache(repoRoot, slug, runId, runDir) {
  const normSlug = normaliseSlug(slug);

  const { thresholds, raw } = loadThresholds(repoRoot);

  // Content hash of the source thresholds file (not the filtered output).
  const contentHash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);

  const { floors, matchedTypes, defaultFloor } = filterThresholdsForSlug(thresholds, normSlug);

  const outputDir = runDir
    ? runDir
    : path.join(repoRoot, 'analysis', 'runs', runId);

  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, CACHE_FILENAME);

  const payload = {
    generatedAt: new Date().toISOString(),
    slug: normSlug,
    runId,
    contentHash,
    defaultFloor,
    matchedTypes,
    artifactCount: Object.keys(floors).length,
    floors,
  };

  const payloadJson = JSON.stringify(payload, null, 2);

  // Short-circuit if file already exists with identical content hash
  if (fs.existsSync(outputFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      if (existing.contentHash === contentHash && existing.slug === normSlug) {
        return { outputFile, floors, matchedTypes, defaultFloor, contentHash, cached: true };
      }
    } catch {
      // Fall through to (re)write
    }
  }

  fs.writeFileSync(outputFile, payloadJson, 'utf8');

  return { outputFile, floors, matchedTypes, defaultFloor, contentHash, cached: false };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

/**
 * Parse minimalist `--key value` CLI args.
 *
 * @param {string[]} argv
 * @returns {Record<string, string|boolean>}
 */
/* c8 ignore start */
function parseArgs(argv) {
  const out = {};
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
        i += 1;
      } else {
        out[key] = next;
        i += 2;
      }
    } else {
      i += 1;
    }
  }
  return out;
}

/**
 * CLI main entry point.
 *
 * @param {string[]} [argv]
 * @returns {void}
 */
export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (!args.slug || !args['run-id']) {
    process.stderr.write(
      'Usage: node scripts/cache-thresholds.js --slug <slug> --run-id <run-id>' +
        ' [--analysis-dir <dir>] [--repo-root <path>]\n',
    );
    process.exit(2);
  }

  const slug = String(args.slug);
  const runId = String(args['run-id']);
  const repoRoot = args['repo-root']
    ? String(args['repo-root'])
    : process.cwd();
  const runDir = args['analysis-dir']
    ? path.join(String(args['analysis-dir']), 'runs', runId)
    : undefined;

  try {
    const result = buildThresholdsCache(repoRoot, slug, runId, runDir);

    process.stdout.write(
      JSON.stringify({
        status: 'ok',
        outputFile: result.outputFile,
        slug,
        matchedTypes: result.matchedTypes,
        artifactCount: Object.keys(result.floors).length,
        defaultFloor: result.defaultFloor,
        contentHash: result.contentHash,
        cached: result.cached,
      }) + '\n',
    );
  } catch (err) {
    process.stderr.write(`Error: ${err}\n`);
    process.exit(1);
  }
}

// Standard ESM CLI guard
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  (process.argv[1] === fileURLToPath(import.meta.url) ||
    process.argv[1].endsWith('/cache-thresholds.js'));

if (isMain) {
  main();
}
/* c8 ignore stop */
