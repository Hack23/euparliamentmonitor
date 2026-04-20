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
import { pathToFileURL } from 'node:url';
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
function loadPerArtifactThresholds(articleType, overrideFile) {
    // `overrideFile` may be absolute or relative. Relative paths are resolved
    // against `PROJECT_ROOT` (matching how `--analysis-dir` is resolved) so that
    // callers invoking the CLI from any working directory get consistent
    // behaviour; otherwise the file is silently treated as missing and Rule 22
    // floors fall back to the flat `--min-lines` value.
    let file;
    if (overrideFile === undefined) {
        file = THRESHOLDS_FILE;
    }
    else if (path.isAbsolute(overrideFile)) {
        file = overrideFile;
    }
    else {
        file = path.join(PROJECT_ROOT, overrideFile);
    }
    if (!fs.existsSync(file))
        return new Map();
    let parsed;
    try {
        parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    catch {
        return new Map();
    }
    const entry = parsed.thresholds?.[articleType];
    if (!entry || typeof entry !== 'object')
        return new Map();
    const result = new Map();
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
 * When a Rule 22 per-artifact threshold is defined for the active
 * `articleType`, the effective floor is `max(perArtifactFloor, flatFallback)`
 * so `--min-lines` can raise (but never silently lower) a per-artifact floor.
 * This keeps behaviour consistent between required-set artifacts and
 * supplemental (manifest-listed) artifacts — both paths apply the same rule.
 *
 * @param relPath - Artifact path relative to the run directory.
 * @param perArtifact - Per-artifact threshold map for the active article type.
 * @param fallback - Flat floor supplied by the CLI (`--min-lines`, default
 *                   `DEFAULT_MIN_LINES`). Used directly when no per-artifact
 *                   entry exists; otherwise combined via `max` with the
 *                   per-artifact entry.
 * @returns Effective `minLines` threshold.
 */
function effectiveMinLines(relPath, perArtifact, fallback) {
    const configured = perArtifact.get(relPath);
    if (configured === undefined)
        return fallback;
    return Math.max(configured, fallback);
}
/** Placeholder markers that indicate an incomplete analysis artifact */
const PLACEHOLDER_MARKERS = [
    '[AI_ANALYSIS_REQUIRED]',
    'AI_ANALYSIS_PENDING',
    '[TO BE FILLED BY AI AGENT]',
    '[TBD]',
    'TODO:',
];
/**
 * Location of the Rule 22 per-artifact depth-floor catalogue.
 * When present, per-artifact thresholds defined here override the flat
 * `DEFAULT_MIN_LINES` floor for matching `articleType × relativePath` tuples.
 */
const THRESHOLDS_FILE = path.join(PROJECT_ROOT, 'analysis', 'methodologies', 'reference-quality-thresholds.json');
/**
 * The seven reference-quality intelligence artifacts per
 * `analysis/methodologies/ai-driven-analysis-guide.md` §Reference-Quality Depth
 * Requirements (basis: breaking-run184).
 */
const REFERENCE_QUALITY_INTELLIGENCE = [
    'intelligence/pestle-analysis.md',
    'intelligence/stakeholder-map.md',
    'intelligence/scenario-forecast.md',
    'intelligence/threat-model.md',
    'intelligence/historical-baseline.md',
    'intelligence/economic-context.md',
    'intelligence/wildcards-blackswans.md',
];
/**
 * Artifacts required on top of the reference-quality seven.
 * These provide the pre-flight entry point (analysis-index) and the
 * composition layer (synthesis-summary) per Rule 19.
 */
const COMMON_REQUIRED = [
    'intelligence/analysis-index.md',
    'intelligence/synthesis-summary.md',
];
/**
 * Per-article-type additional mandatory artifacts.
 * Weekly / monthly reviews require a historical-baseline (already in the seven);
 * breaking additionally requires coalition-dynamics and an MCP reliability audit
 * during plenary-recess windows when API availability is degraded.
 */
const ARTICLE_TYPE_EXTRAS = {
    breaking: ['intelligence/coalition-dynamics.md'],
    'week-in-review': [],
    'month-in-review': [],
    'week-ahead': [],
    'month-ahead': [],
    'committee-reports': [],
    motions: [],
    propositions: [],
};
// ─── CLI parsing ──────────────────────────────────────────────────────────────
/**
 * Apply a single CLI argument token to an in-progress options object.
 *
 * @param arg - The raw CLI token.
 * @param opts - Mutable options being built.
 * @returns `true` when the arg is recognised, `false` otherwise.
 */
function applyArg(arg, opts) {
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
        if (Number.isFinite(parsed) && parsed > 0)
            opts.minLines = parsed;
        return true;
    }
    if (arg.startsWith('--thresholds-file=')) {
        opts.thresholdsFile = arg.slice('--thresholds-file='.length);
        return true;
    }
    if (arg.startsWith('--article-html=')) {
        opts.articleHtmlPaths.push(arg.slice('--article-html='.length));
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
function parseArgs(argv) {
    const opts = {
        analysisDir: '',
        minLines: DEFAULT_MIN_LINES,
        json: false,
        warnOnly: false,
        articleHtmlPaths: [],
    };
    for (const arg of argv) {
        if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        }
        applyArg(arg, opts);
    }
    if (!opts.analysisDir && opts.articleHtmlPaths.length === 0) {
        console.error('❌ Missing required argument: --analysis-dir=<path> or --article-html=<path>');
        printHelp();
        process.exit(2);
    }
    return opts;
}
function printHelp() {
    console.log(`
validate-analysis-completeness — pre-article-generation blocking gate

Usage:
  npx tsx src/utils/validate-analysis-completeness.ts \\
      --analysis-dir=analysis/daily/<date>/<type>-run<id> \\
      [--article-type=<slug>] \\
      [--min-lines=30] \\
      [--article-html=<path>]... \\
      [--json] \\
      [--warn-only]

Options:
  --analysis-dir=<path>    Run directory to validate (required unless only
                           --article-html is used). Resolved relative to
                           PROJECT_ROOT.
  --article-type=<slug>    Article category slug (breaking, week-in-review, …).
                           When omitted, inferred from manifest.json.
  --min-lines=<n>          Minimum line count per artifact (default 30).
                           Used as fallback when no Rule 22 per-artifact
                           threshold is defined for this article type × path.
  --thresholds-file=<path> Override the Rule 22 thresholds catalogue (default:
                           analysis/methodologies/reference-quality-thresholds.json).
                           Primarily for tests.
  --article-html=<path>    Scan a rendered HTML article for AI-First fallback-
                           template leaks (AI_MARKER sentinels, generic
                           stakeholder-reasoning phrases, date-only topic
                           placeholders). May be repeated. Each file is
                           checked independently and any match fails the run.
  --json                   Emit a JSON report on stdout instead of text.
  --warn-only              Exit 0 on validation failure (report only). Use for
                           local exploration; workflows MUST NOT pass this flag.

Exit codes:
  0 = all mandatory artifacts present, no placeholders, manifest consistent,
      and (when --article-html is given) no fallback-template leaks in HTML
  1 = validation failed
  2 = usage error (missing args, unreadable dir, invalid manifest)
`);
}
/**
 * Extract all analysis file paths from the manifest's `files` field.
 * Supports two shapes: nested `{ intelligence: [...] }` or flat `{ "path": "desc" }`.
 *
 * @param filesField - The `files` object from manifest.json.
 * @returns Array of relative artifact paths listed in the manifest.
 */
function extractListedPaths(filesField) {
    if (!filesField || typeof filesField !== 'object')
        return [];
    const allListed = [];
    const firstValue = Object.values(filesField)[0];
    if (Array.isArray(firstValue)) {
        // Nested shape: { category: string[] }
        for (const arr of Object.values(filesField)) {
            if (!Array.isArray(arr))
                continue;
            for (const rel of arr) {
                if (typeof rel === 'string')
                    allListed.push(rel);
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
function loadManifest(runDir) {
    const manifestPath = path.join(runDir, 'manifest.json');
    const errors = [];
    if (!fs.existsSync(manifestPath)) {
        return { raw: {}, allListedPaths: [], errors: ['manifest.json is missing'] };
    }
    let raw;
    try {
        const text = fs.readFileSync(manifestPath, 'utf-8');
        raw = JSON.parse(text);
    }
    catch (err) {
        return {
            raw: {},
            allListedPaths: [],
            errors: [`manifest.json is not valid JSON: ${err.message}`],
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
function inspectArtifact(runDir, relPath, listedInManifest, minLines) {
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
function isMetaDocumentationLine(raw, trimmed, marker) {
    if (trimmed.startsWith('|'))
        return true;
    if (/\b(zero|no|none|without|absent|replaced|replace every)\b/i.test(trimmed))
        return true;
    if (raw.includes('`' + marker + '`'))
        return true;
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
function findUnfilledPlaceholders(lines) {
    const found = new Set();
    let inCodeFence = false;
    for (const raw of lines) {
        const line = raw.trimStart();
        if (line.startsWith('```')) {
            inCodeFence = !inCodeFence;
            continue;
        }
        if (inCodeFence)
            continue;
        for (const marker of PLACEHOLDER_MARKERS) {
            if (!raw.includes(marker))
                continue;
            if (isMetaDocumentationLine(raw, line, marker))
                continue;
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
function walkIntelligenceDir(runDir) {
    const intelDir = path.join(runDir, 'intelligence');
    if (!fs.existsSync(intelDir) || !fs.statSync(intelDir).isDirectory()) {
        return [];
    }
    const out = [];
    for (const entry of fs.readdirSync(intelDir)) {
        if (entry.endsWith('.md'))
            out.push(path.posix.join('intelligence', entry));
    }
    return out;
}
// ─── Validation orchestration ────────────────────────────────────────────────
/** Type-safe Map view of `ARTICLE_TYPE_EXTRAS` that avoids property-access injection. */
const ARTICLE_TYPE_EXTRAS_MAP = new Map(Object.entries(ARTICLE_TYPE_EXTRAS));
/**
 * Compute the set of mandatory artifacts for a given article type.
 *
 * Combines the common `COMMON_REQUIRED` set, the seven reference-quality
 * intelligence artifacts, and any article-type-specific extras.
 *
 * @param articleType - The article category slug (e.g. `breaking`).
 * @returns Sorted list of required relative artifact paths.
 */
function computeRequired(articleType) {
    const extras = ARTICLE_TYPE_EXTRAS_MAP.get(articleType) ?? [];
    const set = new Set([...COMMON_REQUIRED, ...REFERENCE_QUALITY_INTELLIGENCE, ...extras]);
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
function countErrors(checks, manifestErrorCount) {
    let errorCount = manifestErrorCount;
    for (const c of checks) {
        if (!c.present)
            errorCount++;
        else if (c.lineCount < c.minLines)
            errorCount++;
        else if (c.placeholdersFound.length > 0)
            errorCount++;
        else if (!c.listedInManifest)
            errorCount++;
    }
    return errorCount;
}
/**
 * Thrown by `validate()` for usage errors (missing/unreadable run directory).
 * Carries the exit code that `main()` should use, so all `process.exit(…)`
 * calls live in one place and the `validate()` function stays unit-testable.
 */
class ValidationUsageError extends Error {
    exitCode;
    constructor(message, exitCode = 2) {
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
function validate(options) {
    const absRunDir = path.isAbsolute(options.analysisDir)
        ? options.analysisDir
        : path.join(PROJECT_ROOT, options.analysisDir);
    if (!fs.existsSync(absRunDir) || !fs.statSync(absRunDir).isDirectory()) {
        throw new ValidationUsageError(`Analysis directory not found or not a directory: ${absRunDir}`, 2);
    }
    const manifest = loadManifest(absRunDir);
    const articleType = options.articleType ?? manifest.raw.articleType ?? 'unknown';
    const required = computeRequired(articleType);
    const listedSet = new Set(manifest.allListedPaths);
    const perArtifactThresholds = loadPerArtifactThresholds(articleType, options.thresholdsFile);
    const checks = required.map((rel) => inspectArtifact(absRunDir, rel, listedSet.has(rel), effectiveMinLines(rel, perArtifactThresholds, options.minLines)));
    // Rule 22 supplemental enforcement: any manifest-listed file that has a
    // per-artifact threshold entry but is NOT in the mandatory `required` set
    // (e.g. `risk-scoring/*`, `documents/*`, `classification/*`) also has its
    // depth floor enforced. This keeps `reference-quality-thresholds.json` and
    // `.github/prompts/SHARED_PROMPT_PATTERNS.md §Per-Artifact Budgets` truthful
    // about which files are machine-enforced.
    const requiredSet = new Set(required);
    const supplementalChecks = [];
    for (const rel of perArtifactThresholds.keys()) {
        if (requiredSet.has(rel))
            continue;
        if (!listedSet.has(rel))
            continue;
        supplementalChecks.push(inspectArtifact(absRunDir, rel, true, effectiveMinLines(rel, perArtifactThresholds, options.minLines)));
    }
    supplementalChecks.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    checks.push(...supplementalChecks);
    const onDiskIntel = walkIntelligenceDir(absRunDir);
    // O(1)-per-path lookup: build a lookup set that includes both required and
    // supplemental-threshold artifacts so the orphan filter doesn't flag them.
    const inspectedSet = new Set(checks.map((c) => c.relativePath));
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
function artifactIssues(c) {
    if (!c.present)
        return ['MISSING'];
    const parts = [];
    if (c.lineCount < c.minLines)
        parts.push(`SHORT (${c.lineCount} < ${c.minLines} lines)`);
    if (c.placeholdersFound.length > 0) {
        parts.push(`PLACEHOLDERS (${c.placeholdersFound.join(', ')})`);
    }
    if (!c.listedInManifest)
        parts.push('NOT_LISTED_IN_MANIFEST');
    return parts;
}
/**
 * Print the header block of a text-mode report.
 *
 * @param result - Validation result.
 * @param minLines - Flat fallback line floor (displayed as the default).
 */
function printHeader(result, minLines) {
    console.log('━'.repeat(72));
    console.log('🔍 Analysis Completeness Validator (Rule 19 + Rule 22 pre-flight gate)');
    console.log('━'.repeat(72));
    console.log(`📁 Run dir        : ${path.relative(PROJECT_ROOT, result.analysisDir)}`);
    console.log(`🏷️  Article type   : ${result.articleType}`);
    console.log(`📋 Required count : ${result.required.length}`);
    console.log(`🧾 Min lines/file : ${minLines} (default) — per-artifact floors from Rule 22 thresholds`);
    console.log('');
}
/**
 * Print the pass/fail footer of a text-mode report.
 *
 * @param result - Validation result.
 */
function printFooter(result) {
    console.log('');
    if (result.passed) {
        console.log('✅ Pre-flight gate PASSED — article generation may proceed.');
    }
    else {
        console.log(`❌ Pre-flight gate FAILED — ${result.errorCount} error(s). ` +
            'Article generation MUST NOT proceed.');
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
function renderTextReport(result, minLines) {
    printHeader(result, minLines);
    if (!result.manifestValid) {
        console.log('❌ Manifest errors:');
        for (const err of result.manifestErrors)
            console.log(`   • ${err}`);
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
        for (const rel of result.orphanedOnDisk)
            console.log(`   • ${rel}`);
        console.log('   → Update manifest.files.intelligence[] to include these');
        console.log('     (or delete them if they are leftovers from a prior run).');
    }
    printFooter(result);
}
// ─── Article HTML validation (AI-First fallback-template leak detector) ─────
/**
 * Regex patterns matching script-generated fallback text that must never
 * appear in a published article.
 *
 * **Source of each pattern** (grep-anchored to the code that could emit it):
 *
 * - `AI_MARKER` — the canonical unfilled-slot sentinel
 *   (`src/constants/analysis-constants.ts`).  If this leaks through, the AI
 *   agent failed to author the slot.
 * - *"This parliamentary activity on ..."*, *"Civil society organisations
 *   monitoring ..."*, *"Industry and business stakeholders observe ..."*,
 *   *"National governments assess ..."*, *"EU citizens experience ..."*,
 *   *"EU institutional dynamics show ..."* — legacy `deriveStakeholderReasoning`
 *   template sentences.  New code emits `AI_MARKER` instead, so any match is
 *   an article that regenerated against the old logic or copied the text
 *   verbatim from a template.
 * - *"Voting outcomes 2026-MM-DD–2026-MM-DD"* and *"voting period
 *   2026-MM-DD–2026-MM-DD"* — `buildVotingAnalysis` date-range topic fallback
 *   (`src/generators/builders/voting-builders.ts`).  Indicates the AI did not
 *   supply a substantive topic label for the stakeholder outcome matrix.
 * - *"EP activity 2026-MM-DD"* — `buildBreakingAnalysis` date-only topic
 *   fallback (`src/generators/builders/breaking-builders.ts`).
 * - *"Stakeholder impact assessment for ... indicates ... relevance."* —
 *   the legacy `default` branch of `deriveStakeholderReasoning`.
 *
 * All patterns are case-insensitive and whitespace-tolerant.
 *
 * Update this list whenever a new fallback-sentinel is introduced in the
 * generators; the test suite asserts that every new sentinel is added here
 * so that the validator can detect it.
 */
export const FALLBACK_TEMPLATE_PATTERNS = [
    /\[AI_ANALYSIS_REQUIRED\]/,
    /\[REQUIRED\]/,
    /\bAI_ANALYSIS_PENDING\b/,
    /This parliamentary activity on .{0,200}?has (?:significant|moderate|limited) implications for political group dynamics/i,
    /Civil society organisations monitoring .{0,200}?face (?:significant|moderate|limited) impact on transparency/i,
    /Industry and business stakeholders observe (?:significant|moderate|limited) regulatory implications from/i,
    /National governments assess (?:significant|moderate|limited) impact from .{0,200}?on subsidiarity/i,
    /EU citizens experience (?:significant|moderate|limited) consequences from/i,
    /EU institutional dynamics show (?:significant|moderate|limited) effects from/i,
    /Stakeholder impact assessment for .{0,200}?indicates (?:significant|moderate|limited) relevance/i,
    /\bVoting outcomes \d{4}-\d{2}-\d{2}[–-]\d{4}-\d{2}-\d{2}\b/i,
    /\bvoting period \d{4}-\d{2}-\d{2}[–-]\d{4}-\d{2}-\d{2}\b/i,
    /\bEP activity \d{4}-\d{2}-\d{2}\b/i,
    /\bEP breaking news \d{4}-\d{2}-\d{2}\b/i,
];
/**
 * Scan rendered HTML for AI-First fallback-template leaks.
 *
 * This enforces the
 * [Analysis-to-Article Data Contract](../../.github/prompts/SHARED_PROMPT_PATTERNS.md#analysis-to-article-data-contract)
 * at publish time: the AI agent must have authored every stakeholder /
 * outcome / impact slot by reading the run's analysis markdown as context.
 * If any {@link FALLBACK_TEMPLATE_PATTERNS} pattern matches, the AI did not
 * do its job and publication must fail.
 *
 * @param html - Full HTML document or `.article-content` fragment.
 * @returns Array of leak records (empty when clean).
 */
export function scanHtmlForFallbackLeaks(html) {
    const leaks = [];
    for (let i = 0; i < FALLBACK_TEMPLATE_PATTERNS.length; i++) {
        const pattern = FALLBACK_TEMPLATE_PATTERNS[i];
        if (!pattern)
            continue;
        // Create a new global regex each iteration so we can use exec() with lastIndex
        const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
        let m;
        while ((m = global.exec(html)) !== null) {
            leaks.push({
                patternIndex: i,
                match: m[0].length > 240 ? m[0].slice(0, 237) + '…' : m[0],
                offset: m.index,
            });
            if (m[0].length === 0)
                global.lastIndex++;
        }
    }
    return leaks;
}
/**
 * Scan one or more article HTML files for fallback-template leaks.
 *
 * @param paths - File paths (absolute or relative to CWD) to scan.
 * @returns Map of `path → leaks`.  Paths that do not exist or cannot be read
 *   yield a synthetic leak describing the read error.
 */
export function scanArticleHtmlFiles(paths) {
    const result = new Map();
    for (const p of paths) {
        const abs = path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p);
        if (!fs.existsSync(abs)) {
            result.set(p, [{ patternIndex: -1, match: `File not found: ${abs}`, offset: 0 }]);
            continue;
        }
        try {
            const html = fs.readFileSync(abs, 'utf-8');
            result.set(p, scanHtmlForFallbackLeaks(html));
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            result.set(p, [{ patternIndex: -1, match: `Read error: ${msg}`, offset: 0 }]);
        }
    }
    return result;
}
// ─── Main ─────────────────────────────────────────────────────────────────────
/**
 * CLI entrypoint — parses args, runs validation, renders output, and owns
 * every `process.exit(…)` decision for this module.
 */
/**
 * Run the Rule 22 analysis-dir validation when `--analysis-dir=<path>` is
 * supplied, handling `ValidationUsageError` as a CLI-level exit.
 *
 * @param options - Parsed CLI options.
 * @returns Validation result, or `null` when no analysis dir was supplied.
 */
function runAnalysisValidation(options) {
    if (!options.analysisDir)
        return null;
    try {
        return validate(options);
    }
    catch (err) {
        if (err instanceof ValidationUsageError) {
            console.error(`❌ ${err.message}`);
            process.exit(err.exitCode);
        }
        throw err;
    }
}
/**
 * Render the per-file HTML-scan report to stdout in text mode.
 *
 * @param htmlScan - Map of scanned HTML paths to detected leaks.
 */
function renderHtmlScanReport(htmlScan) {
    console.log('');
    console.log('🔍 Article HTML fallback-template scan');
    for (const [p, leaks] of htmlScan.entries()) {
        if (leaks.length === 0) {
            console.log(`  ✅ ${p} (clean)`);
            continue;
        }
        console.log(`  ❌ ${p} — ${leaks.length} leak(s):`);
        for (const leak of leaks.slice(0, 10)) {
            console.log(`     • [pattern ${leak.patternIndex} @${leak.offset}] ${leak.match}`);
        }
        if (leaks.length > 10) {
            console.log(`     • … and ${leaks.length - 10} more`);
        }
    }
}
/**
 * Emit JSON or text output for the combined analysis + HTML scan result.
 *
 * @param options - Parsed CLI options (controls `--json` vs text output).
 * @param result - Analysis-dir validation result, or `null` when skipped.
 * @param htmlScan - Per-file HTML scan map, or `null` when `--article-html`
 *   was not supplied.
 */
function renderCombinedReport(options, result, htmlScan) {
    if (options.json) {
        console.log(JSON.stringify({
            analysis: result,
            htmlScan: htmlScan ? Object.fromEntries(htmlScan.entries()) : null,
        }, null, 2));
        return;
    }
    if (result)
        renderTextReport(result, options.minLines);
    if (htmlScan)
        renderHtmlScanReport(htmlScan);
}
/**
 * CLI entrypoint — parses args, runs validation, renders output, and owns
 * every `process.exit(…)` decision for this module.
 */
function main() {
    const options = parseArgs(process.argv.slice(2));
    // HTML-only mode: skip analysis-dir validation, just scan rendered articles.
    const htmlScan = options.articleHtmlPaths.length > 0
        ? scanArticleHtmlFiles(options.articleHtmlPaths)
        : null;
    const result = runAnalysisValidation(options);
    renderCombinedReport(options, result, htmlScan);
    const htmlFailed = htmlScan ? Array.from(htmlScan.values()).some((v) => v.length > 0) : false;
    const analysisPassed = result ? result.passed : true;
    const passed = analysisPassed && !htmlFailed;
    if (!passed && !options.warnOnly) {
        process.exit(1);
    }
}
// Only run the CLI when this file is executed directly (not when imported by
// tests or other modules).  Matches the conventional guard used by sibling
// CLI utilities in `src/utils/` (e.g. `validate-ep-api.ts`).
if (process.argv[1] &&
    import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main();
}
//# sourceMappingURL=validate-analysis-completeness.js.map