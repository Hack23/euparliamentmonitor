#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * Prior-run diff helper for the re-run merge rule.
 *
 * Reads `manifest.json.history[]` from a same-day analysis folder and
 * classifies every artifact as **at-floor** (carry-forward) or **below-floor**
 * (rewrite). The result — a `priorRunDiff` plan — is written to stdout as
 * JSON and can be consumed by Stage A of the analysis workflow.
 *
 * Controlled by the `ENABLE_PRIOR_RUN_MERGE` environment variable:
 *   - `ENABLE_PRIOR_RUN_MERGE=true`  → normal operation (produce plan)
 *   - unset / any other value        → short-circuit: emit plan with
 *                                       `enabled: false` and empty arrays
 *
 * Invocation:
 *   node scripts/aggregator/prior-run-diff.js <runDir>
 *   npm run prior-run-diff -- analysis/daily/2026-04-26/week-in-review
 *
 * Exit codes:
 *   0  — plan emitted successfully (or feature disabled)
 *   1  — runDir missing or invalid
 *   2  — bad CLI usage
 *
 * Output (stdout, JSON):
 * ```json
 * {
 *   "enabled": true,
 *   "runDir": "analysis/daily/2026-04-26/week-in-review",
 *   "articleType": "week-in-review",
 *   "priorRunId": "week-in-review-run-1714128000",
 *   "carryForward": [
 *     {
 *       "relativePath": "intelligence/synthesis-summary.md",
 *       "lines": 250,
 *       "floor": 180,
 *       "source": "carry-forward-from:week-in-review-run-1714128000"
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
 * The `source` value on each carry-forward entry follows the schema:
 *   `"carry-forward-from:<runId>"`
 * which Stage B writes into `manifest.json.artifactSources` (additive,
 * backward-compatible with the existing schema).
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const DEFAULT_MIN_LINES = 30;

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
    'Environment:',
    '  ENABLE_PRIOR_RUN_MERGE=true   Enable the carry-forward classifier',
    '                                (default: disabled — emits empty plan)',
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
 * @param {string} runDir              - Absolute path to the run folder.
 * @param {object|null} thresholdsJson - Parsed reference-quality-thresholds.json.
 * @param {boolean} enabled            - Whether the feature is enabled.
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

  // Union of threshold keys + manifest files — same logic as the validator.
  const allRelPaths = collectArtifactPaths(manifest, perArtifactFloors);

  const carryForward = [];
  const rewrite = [];

  for (const relativePath of allRelPaths) {
    const floor = Math.max(DEFAULT_MIN_LINES, perArtifactFloors[relativePath] ?? 0);
    const result = classifyArtifact(runDir, relativePath, floor, mermaidRequiredList);
    if (result.atFloor) {
      carryForward.push({
        relativePath,
        lines: result.lines,
        floor: result.floor,
        source: `carry-forward-from:${priorRunId}`,
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
  const files = manifest?.files;
  if (files && typeof files === 'object') {
    for (const value of Object.values(files)) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (typeof entry === 'string') set.add(entry);
          else if (entry && typeof entry.path === 'string') set.add(entry.path);
        }
      } else if (value && typeof value === 'object') {
        for (const k of Object.keys(value)) set.add(k);
      }
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

  const enabled = process.env['ENABLE_PRIOR_RUN_MERGE'] === 'true';
  const thresholdsJson = loadThresholds(opts.thresholdsPath);
  const plan = buildPriorRunDiff(runDir, thresholdsJson, enabled);

  process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  process.exit(0);
}

// Guard: only run as CLI, not when imported as a module by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
