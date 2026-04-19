// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Utils/ValidateAnalysisCompleteness
 * @description Pre-article-generation blocking gate that enforces
 * `analysis/methodologies/ai-driven-analysis-guide.md` §Reference-Quality Depth
 * Requirements and Rule 19 (Mandatory Pre-Flight Analysis Reading).
 *
 * This validator is the hard precondition that agentic news workflows MUST pass
 * before invoking any article generator. It verifies that the analysis run
 * directory contains the mandatory intelligence artifacts with sufficient depth,
 * no placeholder markers, and a well-formed `manifest.json` listing every
 * artifact under `files.*`.
 *
 * Exit codes:
 * - 0 — all mandatory artifacts present, each ≥ `--min-lines` (default 30),
 *       no placeholder markers, manifest lists every on-disk artifact.
 * - 1 — one or more mandatory artifacts missing, too short, contain
 *       placeholder markers, or manifest omits an on-disk artifact.
 * - 2 — usage error (missing `--analysis-dir`, unreadable directory, invalid
 *       `manifest.json`, etc.).
 *
 * Usage:
 *   npx tsx src/utils/validate-analysis-completeness.ts --analysis-dir=analysis/daily/2026-04-18/breaking-run184
 *   npx tsx src/utils/validate-analysis-completeness.ts --analysis-dir=<dir> --article-type=week-in-review
 *   npx tsx src/utils/validate-analysis-completeness.ts --analysis-dir=<dir> --json
 */

import fs from 'node:fs';
import path from 'node:path';
import { PROJECT_ROOT } from '../constants/config.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Minimum line count below which an artifact is considered a stub */
const DEFAULT_MIN_LINES = 30;

/**
 * Load the Rule 22 per-artifact threshold catalogue for a given article type.
 *
 * Returns a `Map<relativePath, minLines>` containing every per-file floor
 * defined under `thresholds.<articleType>` in
 * `analysis/methodologies/reference-quality-thresholds.json`. When the
 * catalogue file is missing, unreadable, malformed, or lacks an entry for the
 * article type, an empty map is returned and the caller's flat
 * `DEFAULT_MIN_LINES` floor applies to every artifact.
 *
 * This load is deliberately tolerant: a missing catalogue must not break
 * existing article types whose depth is still enforced only by the flat floor.
 *
 * @param articleType - Article category slug (e.g. `breaking`).
 * @param overrideFile - Optional absolute path to a thresholds JSON file,
 *                       overriding the default `THRESHOLDS_FILE`. Intended for
 *                       tests that need fixture thresholds without touching the
 *                       repo-wide catalogue.
 * @returns Map from `relativePath` → per-file `minLines` threshold.
 */
function loadPerArtifactThresholds(
  articleType: string,
  overrideFile?: string
): ReadonlyMap<string, number> {
  const file = overrideFile ?? THRESHOLDS_FILE;
  if (!fs.existsSync(file)) return new Map();
  let parsed: ReferenceQualityThresholds;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as ReferenceQualityThresholds;
  } catch {
    return new Map();
  }
  const entry = parsed.thresholds?.[articleType];
  if (!entry || typeof entry !== 'object') return new Map();
  const result = new Map<string, number>();
  for (const [rel, n] of Object.entries(entry)) {
    if (typeof n === 'number' && Number.isFinite(n) && n > 0) {
      result.set(rel, n);
    }
  }
  return result;
}

/**
 * Resolve the effective `minLines` floor for a specific artifact.
 *
 * Prefers the Rule 22 per-artifact threshold when defined for the active
 * `articleType`; otherwise falls back to the flat floor supplied by the CLI
 * (`--min-lines`, default `DEFAULT_MIN_LINES`).
 *
 * @param relPath - Artifact path relative to the run directory.
 * @param perArtifact - Per-artifact threshold map for the active article type.
 * @param fallback - Flat floor to apply when no per-artifact entry exists.
 * @returns Effective `minLines` threshold.
 */
function effectiveMinLines(
  relPath: string,
  perArtifact: ReadonlyMap<string, number>,
  fallback: number
): number {
  const configured = perArtifact.get(relPath);
  return configured ?? fallback;
}

/** Placeholder markers that indicate an incomplete analysis artifact */
const PLACEHOLDER_MARKERS: readonly string[] = [
  '[AI_ANALYSIS_REQUIRED]',
  'AI_ANALYSIS_PENDING',
  '[TO BE FILLED BY AI AGENT]',
  '[TBD]',
  'TODO:',
] as const;

/**
 * Location of the Rule 22 per-artifact depth-floor catalogue.
 * When present, per-artifact thresholds defined here override the flat
 * `DEFAULT_MIN_LINES` floor for matching `articleType × relativePath` tuples.
 */
const THRESHOLDS_FILE = path.join(
  PROJECT_ROOT,
  'analysis',
  'methodologies',
  'reference-quality-thresholds.json'
);

/**
 * Rule 22 threshold catalogue shape. Keys under `thresholds.<articleType>`
 * map artifact `relativePath` strings (e.g. `intelligence/pestle-analysis.md`)
 * to minimum line-count floors. Missing entries fall back to `DEFAULT_MIN_LINES`.
 */
interface ReferenceQualityThresholds {
  version?: string;
  description?: string;
  thresholds?: Record<string, Record<string, number>>;
}

/**
 * The seven reference-quality intelligence artifacts per
 * `analysis/methodologies/ai-driven-analysis-guide.md` §Reference-Quality Depth
 * Requirements (basis: breaking-run184).
 */
const REFERENCE_QUALITY_INTELLIGENCE: readonly string[] = [
  'intelligence/pestle-analysis.md',
  'intelligence/stakeholder-map.md',
  'intelligence/scenario-forecast.md',
  'intelligence/threat-model.md',
  'intelligence/historical-baseline.md',
  'intelligence/economic-context.md',
  'intelligence/wildcards-blackswans.md',
] as const;

/**
 * Artifacts required on top of the reference-quality seven.
 * These provide the pre-flight entry point (analysis-index) and the
 * composition layer (synthesis-summary) per Rule 19.
 */
const COMMON_REQUIRED: readonly string[] = [
  'intelligence/analysis-index.md',
  'intelligence/synthesis-summary.md',
] as const;

/**
 * Per-article-type additional mandatory artifacts.
 * Weekly / monthly reviews require a historical-baseline (already in the seven);
 * breaking additionally requires coalition-dynamics and an MCP reliability audit
 * during plenary-recess windows when API availability is degraded.
 */
const ARTICLE_TYPE_EXTRAS: Record<string, readonly string[]> = {
  breaking: ['intelligence/coalition-dynamics.md'],
  'week-in-review': [],
  'month-in-review': [],
  'week-ahead': [],
  'month-ahead': [],
  'committee-reports': [],
  motions: [],
  propositions: [],
};

interface CliOptions {
  analysisDir: string;
  articleType?: string | undefined;
  minLines: number;
  /** Optional override for the Rule 22 thresholds file (used by tests). */
  thresholdsFile?: string | undefined;
  json: boolean;
  warnOnly: boolean;
}

interface ArtifactCheck {
  relativePath: string;
  present: boolean;
  lineCount: number;
  /** Effective `minLines` floor applied to this artifact (Rule 22). */
  minLines: number;
  placeholdersFound: readonly string[];
  listedInManifest: boolean;
}

interface ValidationResult {
  analysisDir: string;
  articleType: string;
  required: readonly string[];
  checks: readonly ArtifactCheck[];
  orphanedOnDisk: readonly string[];
  manifestValid: boolean;
  manifestErrors: readonly string[];
  passed: boolean;
  errorCount: number;
}

// ─── CLI parsing ──────────────────────────────────────────────────────────────

/**
 * Apply a single CLI argument token to an in-progress options object.
 *
 * @param arg - The raw CLI token.
 * @param opts - Mutable options being built.
 * @returns `true` when the arg is recognised, `false` otherwise.
 */
function applyArg(arg: string, opts: CliOptions): boolean {
  if (arg.startsWith('--analysis-dir=')) {
    opts.analysisDir = arg.slice('--analysis-dir='.length);
    return true;
  }
  if (arg.startsWith('--article-type=')) {
    opts.articleType = arg.slice('--article-type='.length);
    return true;
  }
  if (arg.startsWith('--min-lines=')) {
    const parsed = parseInt(arg.slice('--min-lines='.length), 10);
    if (Number.isFinite(parsed) && parsed > 0) opts.minLines = parsed;
    return true;
  }
  if (arg.startsWith('--thresholds-file=')) {
    opts.thresholdsFile = arg.slice('--thresholds-file='.length);
    return true;
  }
  if (arg === '--json') {
    opts.json = true;
    return true;
  }
  if (arg === '--warn-only') {
    opts.warnOnly = true;
    return true;
  }
  return false;
}

/**
 * Parse command-line arguments into a `CliOptions` record.
 *
 * @param argv - CLI arguments excluding the `node` + script entries.
 * @returns Parsed options; exits with code 2 if required args are missing.
 */
function parseArgs(argv: readonly string[]): CliOptions {
  const opts: CliOptions = {
    analysisDir: '',
    minLines: DEFAULT_MIN_LINES,
    json: false,
    warnOnly: false,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    applyArg(arg, opts);
  }

  if (!opts.analysisDir) {
    console.error('❌ Missing required argument: --analysis-dir=<path>');
    printHelp();
    process.exit(2);
  }

  return opts;
}

function printHelp(): void {
  console.log(`
validate-analysis-completeness — pre-article-generation blocking gate

Usage:
  npx tsx src/utils/validate-analysis-completeness.ts \\
      --analysis-dir=analysis/daily/<date>/<type>-run<id> \\
      [--article-type=<slug>] \\
      [--min-lines=30] \\
      [--json] \\
      [--warn-only]

Options:
  --analysis-dir=<path>    Run directory to validate (required).
                           Path is resolved relative to PROJECT_ROOT.
  --article-type=<slug>    Article category slug (breaking, week-in-review, …).
                           When omitted, inferred from manifest.json.
  --min-lines=<n>          Minimum line count per artifact (default 30).
                           Used as fallback when no Rule 22 per-artifact
                           threshold is defined for this article type × path.
  --thresholds-file=<path> Override the Rule 22 thresholds catalogue (default:
                           analysis/methodologies/reference-quality-thresholds.json).
                           Primarily for tests.
  --json                   Emit a JSON report on stdout instead of text.
  --warn-only              Exit 0 on validation failure (report only). Use for
                           local exploration; workflows MUST NOT pass this flag.

Exit codes:
  0 = all mandatory artifacts present, no placeholders, manifest consistent
  1 = validation failed
  2 = usage error (missing args, unreadable dir, invalid manifest)
`);
}

// ─── Manifest handling ────────────────────────────────────────────────────────

interface ManifestFiles {
  classification?: readonly string[];
  risk_scoring?: readonly string[];
  intelligence?: readonly string[];
  documents?: readonly string[];
  [key: string]: readonly string[] | undefined;
}

interface Manifest {
  runId?: string | number;
  date?: string;
  articleType?: string;
  files?: ManifestFiles | Record<string, string>;
}

interface ParsedManifest {
  raw: Manifest;
  allListedPaths: readonly string[];
  errors: readonly string[];
}

/**
 * Extract all analysis file paths from the manifest's `files` field.
 * Supports two shapes: nested `{ intelligence: [...] }` or flat `{ "path": "desc" }`.
 *
 * @param filesField - The `files` object from manifest.json.
 * @returns Array of relative artifact paths listed in the manifest.
 */
function extractListedPaths(filesField: Manifest['files']): readonly string[] {
  if (!filesField || typeof filesField !== 'object') return [];

  const allListed: string[] = [];
  const firstValue = Object.values(filesField)[0];

  if (Array.isArray(firstValue)) {
    // Nested shape: { category: string[] }
    for (const arr of Object.values(filesField as ManifestFiles)) {
      if (!Array.isArray(arr)) continue;
      for (const rel of arr) {
        if (typeof rel === 'string') allListed.push(rel);
      }
    }
    return allListed;
  }

  if (firstValue !== undefined) {
    // Flat shape: { "path": "description" }
    return Object.keys(filesField);
  }

  return allListed;
}

/**
 * Load and parse `manifest.json` from a run directory, returning any schema
 * errors and the set of listed artifact paths.
 *
 * @param runDir - Absolute path to the analysis run directory.
 * @returns Parsed manifest, list of artifact paths, and any schema errors.
 */
function loadManifest(runDir: string): ParsedManifest {
  const manifestPath = path.join(runDir, 'manifest.json');
  const errors: string[] = [];

  if (!fs.existsSync(manifestPath)) {
    return { raw: {}, allListedPaths: [], errors: ['manifest.json is missing'] };
  }

  let raw: Manifest;
  try {
    const text = fs.readFileSync(manifestPath, 'utf-8');
    raw = JSON.parse(text) as Manifest;
  } catch (err) {
    return {
      raw: {},
      allListedPaths: [],
      errors: [`manifest.json is not valid JSON: ${(err as Error).message}`],
    };
  }

  if (!raw.articleType || typeof raw.articleType !== 'string') {
    errors.push('manifest.json is missing top-level "articleType" (Rule 6)');
  }

  const filesField = raw.files;
  if (!filesField || typeof filesField !== 'object') {
    errors.push('manifest.json is missing "files" object');
    return { raw, allListedPaths: [], errors };
  }

  return { raw, allListedPaths: extractListedPaths(filesField), errors };
}

// ─── Artifact inspection ─────────────────────────────────────────────────────

/**
 * Read and inspect a single artifact, producing the data needed by the
 * aggregate pass/fail logic in `countErrors` / `artifactIssues`.
 *
 * @param runDir - Absolute path to the analysis run directory.
 * @param relPath - Path relative to `runDir` of the artifact to inspect.
 * @param listedInManifest - Whether the artifact appears under `manifest.files.*`.
 * @param minLines - Effective `minLines` floor (Rule 22 per-artifact threshold
 *                   when defined for this path, or the flat fallback otherwise).
 * @returns Presence, line count, placeholder findings, and manifest-listing flag.
 */
function inspectArtifact(
  runDir: string,
  relPath: string,
  listedInManifest: boolean,
  minLines: number
): ArtifactCheck {
  const abs = path.join(runDir, relPath);
  if (!fs.existsSync(abs)) {
    return {
      relativePath: relPath,
      present: false,
      lineCount: 0,
      minLines,
      placeholdersFound: [],
      listedInManifest,
    };
  }

  const text = fs.readFileSync(abs, 'utf-8');
  const lines = text.split('\n');
  const lineCount = lines.length;
  const placeholders = findUnfilledPlaceholders(lines);

  // NOTE: `lineCount < minLines` is intentionally not flagged here — the caller
  // (`countErrors` / `artifactIssues`) is the single source of truth for
  // short-file failures so the validator can report them with the correct
  // formatting and exit semantics.

  return {
    relativePath: relPath,
    present: true,
    lineCount,
    minLines,
    placeholdersFound: placeholders,
    listedInManifest,
  };
}

/**
 * Tests whether a given line is a meta-documentation reference to the placeholder
 * marker (rather than a real unfilled slot). Table rows, negation sentences, and
 * backtick-quoted marker names are considered documentation.
 *
 * @param raw - Raw line from the artifact file (with original indentation).
 * @param trimmed - The same line after leading whitespace is stripped.
 * @param marker - The placeholder marker being checked.
 * @returns `true` when the line describes the marker rather than requiring it.
 */
function isMetaDocumentationLine(raw: string, trimmed: string, marker: string): boolean {
  if (trimmed.startsWith('|')) return true;
  if (/\b(zero|no|none|without|absent|replaced|replace every)\b/i.test(trimmed)) return true;
  if (raw.includes('`' + marker + '`')) return true;
  return false;
}

/**
 * Detect placeholder markers that represent an unfilled content slot, while
 * ignoring lines where the marker is referenced in a meta-documentation context
 * (e.g. "Zero [AI_ANALYSIS_REQUIRED] markers", table rows that document absence,
 * or code fences quoting the marker for illustration).
 *
 * @param lines - Lines of the artifact file.
 * @returns Sorted array of placeholder markers that were found as real slots.
 */
function findUnfilledPlaceholders(lines: readonly string[]): readonly string[] {
  const found = new Set<string>();
  let inCodeFence = false;

  for (const raw of lines) {
    const line = raw.trimStart();

    if (line.startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    for (const marker of PLACEHOLDER_MARKERS) {
      if (!raw.includes(marker)) continue;
      if (isMetaDocumentationLine(raw, line, marker)) continue;
      found.add(marker);
    }
  }
  return Array.from(found).sort();
}

/**
 * List all `.md` files directly inside `<runDir>/intelligence/`.
 *
 * @param runDir - Absolute path to the analysis run directory.
 * @returns Array of paths relative to `runDir` (POSIX-style).
 */
function walkIntelligenceDir(runDir: string): readonly string[] {
  const intelDir = path.join(runDir, 'intelligence');
  if (!fs.existsSync(intelDir) || !fs.statSync(intelDir).isDirectory()) {
    return [];
  }
  const out: string[] = [];
  for (const entry of fs.readdirSync(intelDir)) {
    if (entry.endsWith('.md')) out.push(path.posix.join('intelligence', entry));
  }
  return out;
}

// ─── Validation orchestration ────────────────────────────────────────────────

/** Type-safe Map view of `ARTICLE_TYPE_EXTRAS` that avoids property-access injection. */
const ARTICLE_TYPE_EXTRAS_MAP: ReadonlyMap<string, readonly string[]> = new Map(
  Object.entries(ARTICLE_TYPE_EXTRAS)
);

/**
 * Compute the set of mandatory artifacts for a given article type.
 *
 * Combines the common `COMMON_REQUIRED` set, the seven reference-quality
 * intelligence artifacts, and any article-type-specific extras.
 *
 * @param articleType - The article category slug (e.g. `breaking`).
 * @returns Sorted list of required relative artifact paths.
 */
function computeRequired(articleType: string): readonly string[] {
  const extras = ARTICLE_TYPE_EXTRAS_MAP.get(articleType) ?? [];
  const set = new Set<string>([...COMMON_REQUIRED, ...REFERENCE_QUALITY_INTELLIGENCE, ...extras]);
  return Array.from(set).sort();
}

/**
 * Count how many artifact checks failed, combined with any manifest errors.
 *
 * Each check carries its own `minLines` threshold (Rule 22 per-artifact floor
 * or the flat fallback), so no single `minLines` argument is needed here.
 *
 * @param checks - Per-artifact inspection results.
 * @param manifestErrorCount - Number of manifest-level errors.
 * @returns Total error count used for the pass/fail decision.
 */
function countErrors(checks: readonly ArtifactCheck[], manifestErrorCount: number): number {
  let errorCount = manifestErrorCount;
  for (const c of checks) {
    if (!c.present) errorCount++;
    else if (c.lineCount < c.minLines) errorCount++;
    else if (c.placeholdersFound.length > 0) errorCount++;
    else if (!c.listedInManifest) errorCount++;
  }
  return errorCount;
}

/**
 * Thrown by `validate()` for usage errors (missing/unreadable run directory).
 * Carries the exit code that `main()` should use, so all `process.exit(…)`
 * calls live in one place and the `validate()` function stays unit-testable.
 */
class ValidationUsageError extends Error {
  public readonly exitCode: number;
  constructor(message: string, exitCode = 2) {
    super(message);
    this.name = 'ValidationUsageError';
    this.exitCode = exitCode;
  }
}

/**
 * Run the full validation pipeline for a given analysis run directory.
 *
 * @param options - Parsed CLI options.
 * @returns Validation result with per-artifact checks and pass/fail flag.
 * @throws {ValidationUsageError} When the analysis directory does not exist
 *         or is not a directory — the CLI entrypoint translates this into
 *         `process.exit(2)`.
 */
function validate(options: CliOptions): ValidationResult {
  const absRunDir = path.isAbsolute(options.analysisDir)
    ? options.analysisDir
    : path.join(PROJECT_ROOT, options.analysisDir);

  if (!fs.existsSync(absRunDir) || !fs.statSync(absRunDir).isDirectory()) {
    throw new ValidationUsageError(
      `Analysis directory not found or not a directory: ${absRunDir}`,
      2
    );
  }

  const manifest = loadManifest(absRunDir);
  const articleType = options.articleType ?? manifest.raw.articleType ?? 'unknown';
  const required = computeRequired(articleType);
  const listedSet = new Set<string>(manifest.allListedPaths);
  const perArtifactThresholds = loadPerArtifactThresholds(articleType, options.thresholdsFile);

  const checks: ArtifactCheck[] = required.map((rel) =>
    inspectArtifact(
      absRunDir,
      rel,
      listedSet.has(rel),
      effectiveMinLines(rel, perArtifactThresholds, options.minLines)
    )
  );

  // Rule 22 supplemental enforcement: any manifest-listed file that has a
  // per-artifact threshold entry but is NOT in the mandatory `required` set
  // (e.g. `risk-scoring/*`, `documents/*`, `classification/*`) also has its
  // depth floor enforced. This keeps `reference-quality-thresholds.json` and
  // `.github/prompts/SHARED_PROMPT_PATTERNS.md §Per-Artifact Budgets` truthful
  // about which files are machine-enforced.
  const requiredSet = new Set<string>(required);
  const supplementalChecks: ArtifactCheck[] = [];
  for (const [rel, floor] of perArtifactThresholds) {
    if (requiredSet.has(rel)) continue;
    if (!listedSet.has(rel)) continue;
    supplementalChecks.push(
      inspectArtifact(absRunDir, rel, true, Math.max(floor, options.minLines))
    );
  }
  supplementalChecks.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  checks.push(...supplementalChecks);

  const onDiskIntel = walkIntelligenceDir(absRunDir);
  // O(1)-per-path lookup: build a lookup set that includes both required and
  // supplemental-threshold artifacts so the orphan filter doesn't flag them.
  const inspectedSet = new Set<string>(checks.map((c) => c.relativePath));
  const orphaned = onDiskIntel.filter((rel) => !listedSet.has(rel) && !inspectedSet.has(rel));

  // Orphaned files are warnings, not errors (per Rule 6 "contamination risk"
  // they're a signal but not a blocker — a second workflow may legitimately add files)
  const errorCount = countErrors(checks, manifest.errors.length);

  return {
    analysisDir: absRunDir,
    articleType,
    required,
    checks,
    orphanedOnDisk: orphaned,
    manifestValid: manifest.errors.length === 0,
    manifestErrors: manifest.errors,
    passed: errorCount === 0,
    errorCount,
  };
}

// ─── Reporting ────────────────────────────────────────────────────────────────

/**
 * Build a list of issue labels for a single artifact check.
 *
 * Uses the per-check `minLines` (Rule 22 per-artifact floor or flat fallback).
 *
 * @param c - The artifact check result.
 * @returns Array of short issue labels; empty if the artifact passes.
 */
function artifactIssues(c: ArtifactCheck): readonly string[] {
  if (!c.present) return ['MISSING'];
  const parts: string[] = [];
  if (c.lineCount < c.minLines) parts.push(`SHORT (${c.lineCount} < ${c.minLines} lines)`);
  if (c.placeholdersFound.length > 0) {
    parts.push(`PLACEHOLDERS (${c.placeholdersFound.join(', ')})`);
  }
  if (!c.listedInManifest) parts.push('NOT_LISTED_IN_MANIFEST');
  return parts;
}

/**
 * Print the header block of a text-mode report.
 *
 * @param result - Validation result.
 * @param minLines - Flat fallback line floor (displayed as the default).
 */
function printHeader(result: ValidationResult, minLines: number): void {
  console.log('━'.repeat(72));
  console.log('🔍 Analysis Completeness Validator (Rule 19 + Rule 22 pre-flight gate)');
  console.log('━'.repeat(72));
  console.log(`📁 Run dir        : ${path.relative(PROJECT_ROOT, result.analysisDir)}`);
  console.log(`🏷️  Article type   : ${result.articleType}`);
  console.log(`📋 Required count : ${result.required.length}`);
  console.log(
    `🧾 Min lines/file : ${minLines} (default) — per-artifact floors from Rule 22 thresholds`
  );
  console.log('');
}

/**
 * Print the pass/fail footer of a text-mode report.
 *
 * @param result - Validation result.
 */
function printFooter(result: ValidationResult): void {
  console.log('');
  if (result.passed) {
    console.log('✅ Pre-flight gate PASSED — article generation may proceed.');
  } else {
    console.log(
      `❌ Pre-flight gate FAILED — ${result.errorCount} error(s). ` +
        'Article generation MUST NOT proceed.'
    );
    console.log('   See analysis/methodologies/ai-driven-analysis-guide.md §Rule 19 / Rule 22 and');
    console.log('   .github/prompts/SHARED_PROMPT_PATTERNS.md §Article Generation Pre-Flight.');
  }
  console.log('━'.repeat(72));
}

/**
 * Render the full text-mode report to stdout.
 *
 * @param result - Validation result.
 * @param minLines - Flat fallback line floor (per-artifact floors live on each check).
 */
function renderTextReport(result: ValidationResult, minLines: number): void {
  printHeader(result, minLines);

  if (!result.manifestValid) {
    console.log('❌ Manifest errors:');
    for (const err of result.manifestErrors) console.log(`   • ${err}`);
    console.log('');
  }

  console.log('📊 Artifact checks:');
  for (const c of result.checks) {
    const issues = artifactIssues(c);
    const status = issues.length === 0 ? '✅ ok' : `❌ ${issues.join('; ')}`;
    const lineInfo = c.present ? ` (${c.lineCount}/${c.minLines} lines)` : '';
    console.log(`   ${status.padEnd(60)} ${c.relativePath}${lineInfo}`);
  }

  if (result.orphanedOnDisk.length > 0) {
    console.log('');
    console.log('⚠️  Intelligence files on disk not listed in manifest.files.*:');
    for (const rel of result.orphanedOnDisk) console.log(`   • ${rel}`);
    console.log('   → Update manifest.files.intelligence[] to include these');
    console.log('     (or delete them if they are leftovers from a prior run).');
  }

  printFooter(result);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * CLI entrypoint — parses args, runs validation, renders output, and owns
 * every `process.exit(…)` decision for this module.
 */
function main(): void {
  const options = parseArgs(process.argv.slice(2));

  let result: ValidationResult;
  try {
    result = validate(options);
  } catch (err) {
    if (err instanceof ValidationUsageError) {
      console.error(`❌ ${err.message}`);
      process.exit(err.exitCode);
    }
    throw err;
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    renderTextReport(result, options.minLines);
  }

  if (!result.passed && !options.warnOnly) {
    process.exit(1);
  }
}

main();
