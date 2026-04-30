#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Prior-run diff helper for the re-run improve/extend rule.
 *
 * Reads `manifest.json.history[]` from a same-day analysis folder and
 * classifies every artifact as **at-floor** (must-extend / carry-forward) or
 * **below-floor** (rewrite). The result — a `priorRunDiff` plan with
 * `mode: "improve-and-extend"` — is written to stdout as JSON and is
 * consumed by Stage B of the analysis workflow.
 *
 * **Re-run semantics (never no-op).** Entries listed under `carryForward[]`
 * are **NOT** skipped on re-runs — they are must-extend targets. Stage B
 * MUST raise their depth: each prior artifact's `priorLines` becomes the new
 * floor and the agent must add ≥1 new section, ≥3 new evidence citations, or
 * ≥1 new chart, ending at `lines >= max(floor, priorLines + 20)`. Entries in
 * `rewrite[]` are still written from scratch to the catalog floor.
 *
 * Always-on. The `ENABLE_PRIOR_RUN_MERGE` environment variable is no longer
 * read — the helper runs unconditionally so re-runs cannot accidentally
 * regress to the legacy "skip-write" behaviour. The `buildPriorRunDiff(..,
 * enabled)` parameter is kept for back-compat with unit tests but the CLI
 * always passes `true`.
 *
 * Invocation:
 *   node scripts/aggregator/prior-run-diff.js <runDir>
 *   npm run prior-run-diff -- analysis/daily/2026-04-26/week-in-review
 *
 * Exit codes:
 *   0  — plan emitted successfully
 *   1  — runDir missing or invalid
 *   2  — bad CLI usage
 *
 * Output (stdout, JSON):
 * ```json
 * {
 *   "enabled": true,
 *   "mode": "improve-and-extend",
 *   "runDir": "analysis/daily/2026-04-26/week-in-review",
 *   "articleType": "week-in-review",
 *   "priorRunId": "week-in-review-run-1714128000",
 *   "carryForward": [
 *     {
 *       "relativePath": "intelligence/synthesis-summary.md",
 *       "lines": 250,
 *       "priorLines": 250,
 *       "floor": 180,
 *       "extendFloor": 270,
 *       "source": "extend-from-prior:week-in-review-run-1714128000"
 *     }
 *   ],
 *   "rewrite": [
 *     {
 *       "relativePath": "intelligence/stakeholder-map.md",
 *       "lines": 120,
 *       "floor": 240,
 *       "reason": "short:120<240"
 *     }
 *   ]
 * }
 * ```
 *
 * - `priorLines` exposes the prior-run line count so Stage B knows the lower
 *   bound it must beat.
 * - `extendFloor` = `max(floor, priorLines + 20)` — the minimum line count
 *   the new pass MUST reach for this artifact.
 * - The `source` value follows the schema `"extend-from-prior:<runId>"`,
 *   which Stage B writes into `manifest.json.artifactSources` (additive,
 *   back-compat with prior `"carry-forward-from:<runId>"` consumers).
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const DEFAULT_MIN_LINES = 30;
const EXTEND_DELTA_LINES = 20;

// Artifacts that must contain at least one Mermaid fenced block.
// Mirrors the directory-based heuristic in validate-analysis-completeness.js.
const DIAGRAM_DIRS = new Set(['intelligence', 'classification', 'risk-scoring', 'threat-assessment']);

const PLACEHOLDER_PATTERNS = [
  /\[AI_ANALYSIS_REQUIRED\]/,
  /AI_ANALYSIS_PENDING/,
  /\[TO BE FILLED\]/,
  /\[TBD\]/i,
  /^TODO:/m,
];

const META_DOC_HINT_RE = /(template-instructions|placeholder reference|TODO list of)/i;

// ─── helpers ────────────────────────────────────────────────────────────────

function usage(code = 2) {
  const msg = [
    'Usage: node scripts/aggregator/prior-run-diff.js <runDir>',
    '',
    '  <runDir>   Path to analysis/daily/<date>/<slug>/',
    '',
    'Always-on. The helper unconditionally classifies prior-run artifacts as',
    'must-extend (carryForward[]) or below-floor rewrite (rewrite[]) so re-runs',
    'can never accidentally no-op. The legacy ENABLE_PRIOR_RUN_MERGE env flag',
    'is no longer read.',
    '',
    'Example:',
    '  npm run prior-run-diff -- analysis/daily/2026-04-26/week-in-review',
  ].join('\n');
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0) usage(2);
  const opts = { runDir: null, thresholdsPath: null };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--help' || a === '-h') usage(0);
    else if (a === '--thresholds') {
      opts.thresholdsPath = args[i + 1];
      if (!opts.thresholdsPath) usage(2);
      i += 1;
    } else if (!opts.runDir) {
      opts.runDir = a;
    } else {
      usage(2);
    }
  }
  if (!opts.runDir) usage(2);
  return opts;
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function loadThresholds(customPath) {
  const p = customPath
    ? path.resolve(ROOT, customPath)
    : path.resolve(ROOT, 'analysis/methodologies/reference-quality-thresholds.json');
  if (!fs.existsSync(p)) return null;
  return safeReadJson(p);
}

function countLines(content) {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

function hasPlaceholders(content) {
  if (META_DOC_HINT_RE.test(content)) return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(content));
}

function hasMermaid(content) {
  return /(^|\n)```mermaid\s/i.test(content);
}

function isDiagramRequired(relativePath, mermaidRequiredList) {
  if (mermaidRequiredList && mermaidRequiredList.includes(relativePath)) return true;
  const idx = relativePath.replace(/\\/g, '/').indexOf('/');
  const dir = idx === -1 ? '' : relativePath.slice(0, idx);
  return DIAGRAM_DIRS.has(dir);
}

// ─── classifier ─────────────────────────────────────────────────────────────

/**
 * Classify a single artifact as at-floor (carry-forward) or below-floor
 * (rewrite).
 *
 * @param {string} runDir        - Absolute path to the analysis run folder.
 * @param {string} relativePath  - Artifact path relative to runDir.
 * @param {number} floor         - Minimum line count for this artifact.
 * @param {string[]} mermaidRequiredList - Paths that must contain a mermaid block.
 * @returns {{ atFloor: boolean, lines: number, floor: number, reason: string|null }}
 */
export function classifyArtifact(runDir, relativePath, floor, mermaidRequiredList) {
  const abs = path.join(runDir, relativePath);
  if (!fs.existsSync(abs)) {
    return { atFloor: false, lines: 0, floor, reason: 'missing' };
  }
  const content = fs.readFileSync(abs, 'utf8');
  const lines = countLines(content);

  if (lines < floor) {
    return { atFloor: false, lines, floor, reason: `short:${lines}<${floor}` };
  }
  if (hasPlaceholders(content)) {
    return { atFloor: false, lines, floor, reason: 'placeholders' };
  }
  if (isDiagramRequired(relativePath, mermaidRequiredList) && !hasMermaid(content)) {
    return { atFloor: false, lines, floor, reason: 'mermaid:missing' };
  }
  return { atFloor: true, lines, floor, reason: null };
}

/**
 * Build the `priorRunDiff` plan for a same-day analysis folder.
 *
 * Mode is always **improve-and-extend**: `carryForward[]` entries are
 * must-extend targets (their `priorLines` and `extendFloor` exposed), not
 * skip-write targets. The `enabled` parameter is preserved for back-compat
 * with the legacy unit-test signature; the CLI always passes `true`.
 *
 * @param {string} runDir              - Absolute path to the run folder.
 * @param {object|null} thresholdsJson - Parsed reference-quality-thresholds.json.
 * @param {boolean} enabled            - Whether the feature is enabled (CLI: always true).
 * @returns {object} The diff plan (serialisable to JSON).
 */
export function buildPriorRunDiff(runDir, thresholdsJson, enabled) {
  const manifestPath = path.join(runDir, 'manifest.json');
  const manifest = safeReadJson(manifestPath);

  const relRunDir = path.relative(ROOT, runDir);
  const articleType =
    manifest?.articleType ||
    manifest?.article_type ||
    (Array.isArray(manifest?.articleTypes) ? manifest.articleTypes[0] : null) ||
    manifest?.runType ||
    'unknown';

  if (!enabled) {
    return {
      enabled: false,
      mode: 'improve-and-extend',
      runDir: relRunDir,
      articleType,
      priorRunId: null,
      carryForward: [],
      rewrite: [],
    };
  }

  const history = Array.isArray(manifest?.history) ? manifest.history : [];
  if (history.length === 0) {
    return {
      enabled: true,
      mode: 'improve-and-extend',
      runDir: relRunDir,
      articleType,
      priorRunId: null,
      carryForward: [],
      rewrite: [],
    };
  }

  // Use the most recent history entry as the "prior run".
  const priorEntry = history[history.length - 1];
  const priorRunId = priorEntry?.runId ?? 'unknown';

  const perArtifactFloors = thresholdsJson?.thresholds?.[articleType] ?? {};
  const mermaidRequiredList = thresholdsJson?.structuralRequirements?.mermaidRequired ?? [];

  // Build the candidate artifact path set from threshold keys and
  // manifest-declared files used by this prior-run diff helper.
  const allRelPaths = collectArtifactPaths(manifest, perArtifactFloors);

  const carryForward = [];
  const rewrite = [];

  for (const relativePath of allRelPaths) {
    const floor = Math.max(DEFAULT_MIN_LINES, perArtifactFloors[relativePath] ?? 0);
    const result = classifyArtifact(runDir, relativePath, floor, mermaidRequiredList);
    if (result.atFloor) {
      const extendFloor = Math.max(floor, result.lines + EXTEND_DELTA_LINES);
      carryForward.push({
        relativePath,
        lines: result.lines,
        priorLines: result.lines,
        floor: result.floor,
        extendFloor,
        source: `extend-from-prior:${priorRunId}`,
      });
    } else {
      rewrite.push({
        relativePath,
        lines: result.lines,
        floor: result.floor,
        reason: result.reason,
      });
    }
  }

  return {
    enabled: true,
    mode: 'improve-and-extend',
    runDir: relRunDir,
    articleType,
    priorRunId,
    carryForward,
    rewrite,
  };
}

/**
 * Collect all artifact relative paths from the manifest files section and
 * the per-artifact threshold keys — deduped and sorted.
 *
 * @param {object|null} manifest        - Parsed manifest.json.
 * @param {object}      perArtifactFloors - Per-artifact floor map.
 * @returns {string[]} Sorted unique relative paths.
 */
function collectArtifactPaths(manifest, perArtifactFloors) {
  const set = new Set(Object.keys(perArtifactFloors));

  /**
   * Recursively collect artifact paths from nested manifest file entries.
   * Only string values and `{ path: string }` objects are treated as paths;
   * arbitrary object keys (e.g. language codes like `en`/`sv`) are NOT added.
   *
   * @param {unknown} value - Manifest file entry or nested value.
   */
  function addArtifactPaths(value) {
    if (typeof value === 'string') {
      set.add(value);
      return;
    }

    if (Array.isArray(value)) {
      for (const entry of value) addArtifactPaths(entry);
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    if (typeof value.path === 'string') {
      set.add(value.path);
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key !== 'path') {
        addArtifactPaths(nestedValue);
      }
    }
  }

  const files = manifest?.files;
  if (files && typeof files === 'object') {
    for (const value of Object.values(files)) {
      addArtifactPaths(value);
    }
  }
  return Array.from(set).sort();
}

// ─── CLI entry point ─────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs(process.argv);
  const runDir = path.resolve(ROOT, opts.runDir);

  if (!fs.existsSync(runDir) || !fs.statSync(runDir).isDirectory()) {
    process.stderr.write(`error: runDir does not exist or is not a directory: ${runDir}\n`);
    process.exit(1);
  }

  // Re-run improve/extend rule is always-on. The legacy ENABLE_PRIOR_RUN_MERGE
  // env flag is no longer read — re-runs cannot accidentally regress to the
  // pre-2026-05 skip-write behaviour. See .github/prompts/02-analysis-protocol.md
  // §"Re-run improve/extend rule".
  const enabled = true;
  const thresholdsJson = loadThresholds(opts.thresholdsPath);
  const plan = buildPriorRunDiff(runDir, thresholdsJson, enabled);

  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  process.exit(0);
}

// Guard: only run as CLI, not when imported as a module by tests.
// Compare resolved/real paths so `npm run` (which may pass a relative argv[1])
// still triggers `main()`.
const currentModulePath = fileURLToPath(import.meta.url);
const invokedScriptPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (invokedScriptPath === currentModulePath) {
  main();
}
