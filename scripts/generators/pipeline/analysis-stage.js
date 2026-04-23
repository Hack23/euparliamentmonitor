// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Generators/Pipeline/AnalysisStage
 * @description Lightweight analysis discovery module.
 *
 * Provides types, constants, and a discovery function for consuming analysis
 * `.md` files that were produced by AI agentic workflows.  The heavy
 * analysis-generation pipeline (classification, threat, risk, existing
 * builders) has been removed in favour of the superior AI-driven analysis
 * produced by agentic workflows.
 *
 * This module retains the same exported types ({@link AnalysisContext},
 * {@link AnalysisManifest}, etc.) so that downstream consumers
 * (`news-enhanced.ts`, article strategies) continue to work unchanged.
 */
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ensureDirectoryExists, resolveUniqueAnalysisDir, discoverAnalysisFileEntries, mergeManifestHistory, } from '../../utils/file-utils.js';
/**
 * Default set of analysis methods (all methods).
 */
export const ALL_ANALYSIS_METHODS = [
    'significance-classification',
    'significance-scoring',
    'impact-matrix',
    'actor-mapping',
    'forces-analysis',
    'political-threat-landscape',
    'actor-threat-profiling',
    'consequence-trees',
    'legislative-disruption',
    'risk-matrix',
    'political-capital-risk',
    'quantitative-swot',
    'legislative-velocity-risk',
    'agent-risk-workflow',
    'deep-analysis',
    'stakeholder-analysis',
    'coalition-analysis',
    'voting-patterns',
    'cross-session-intelligence',
    'synthesis-summary',
];
/**
 * Complete set of valid analysis method names that can appear in CLI
 * flags (e.g. `--analysis-methods`).
 */
export const VALID_ANALYSIS_METHODS = Array.from(new Set([...ALL_ANALYSIS_METHODS, 'document-analysis']));
// ─── Pre-resolved analysis directory heuristic ───────────────────────────────
/**
 * Canonical per-run analysis subdirectories created by agentic workflows.
 * Used to auto-detect when `--analysis-dir` already points at a fully
 * resolved analysis directory (instead of a base like `analysis/daily`).
 */
const RESOLVED_ANALYSIS_SUBDIRS = [
    'classification',
    'threat-assessment',
    'risk-scoring',
    'intelligence',
    'existing',
    'documents',
    'data',
];
/**
 * Detect whether `candidate` looks like a pre-populated, fully-resolved
 * analysis run directory.
 *
 * Returns `true` when the directory exists AND either contains a
 * `manifest.json` from a prior run or at least one of the canonical
 * analysis subdirectories in {@link RESOLVED_ANALYSIS_SUBDIRS}.
 *
 * @param candidate - Directory path to inspect.
 * @returns `true` when the directory is a resolved analysis run dir.
 */
export function isResolvedAnalysisDir(candidate) {
    if (!candidate || !fs.existsSync(candidate))
        return false;
    try {
        if (!fs.statSync(candidate).isDirectory())
            return false;
    }
    catch {
        return false;
    }
    if (fs.existsSync(path.join(candidate, 'manifest.json')))
        return true;
    for (const sub of RESOLVED_ANALYSIS_SUBDIRS) {
        if (fs.existsSync(path.join(candidate, sub)))
            return true;
    }
    return false;
}
// ─── Data checks ──────────────────────────────────────────────────────────────
/** Keys in fetchedData that count as substantive EP data */
const SUBSTANTIVE_DATA_KEYS = [
    'events',
    'procedures',
    'adoptedTexts',
    'documents',
    'votingRecords',
    'coalitions',
    'questions',
    'mepUpdates',
    'plenaryDocuments',
    'committeeDocuments',
    'plenarySessionDocuments',
    'externalDocuments',
    'declarations',
    'corporateBodies',
];
/**
 * Safely extract an array from fetchedData by key.
 *
 * @param data - Raw fetched data record
 * @param key - Key to extract
 * @returns Array or empty array if missing/invalid
 */
function safeArr(data, key) {
    const val = data[key]; // eslint-disable-line security/detect-object-injection
    return Array.isArray(val) ? val : [];
}
/**
 * Check whether the fetched data contains any substantive EP data.
 *
 * @param data - Raw fetched data record
 * @returns true if any substantive data is present
 */
export function hasSubstantiveData(data) {
    for (const key of SUBSTANTIVE_DATA_KEYS) {
        const arr = safeArr(data, key);
        if (arr.length > 0)
            return true;
    }
    return false;
}
// ─── Slug derivation ──────────────────────────────────────────────────────────
/**
 * Derive a filesystem-safe slug from an array of article types.
 *
 * @param articleTypes - One or more article category strings
 * @returns Sanitised, sorted, hyphen-joined slug
 */
export function deriveArticleTypeSlug(articleTypes) {
    if (articleTypes.length === 0)
        return 'default';
    const raw = [...articleTypes]
        .map((t) => t.trim().toLowerCase())
        .sort()
        .join('-');
    const sanitised = raw.replace(/[^a-z0-9-]+/gu, '-').replace(/-{2,}/gu, '-');
    const trimmed = sanitised.replace(/^-/u, '').replace(/-$/u, '');
    return trimmed.length > 0 ? trimmed : 'default';
}
// ─── Analysis discovery ───────────────────────────────────────────────────────
/**
 * Resolve the preferred analysis directory for a run.
 *
 * When `outputDirIsResolved` is true, honour `outputDir` verbatim — this
 * supports agentic workflows that pass a pre-populated
 * `analysis/daily/<date>/<slug>-run<N>` path directly. Otherwise compose
 * the conventional `<outputDir>/<date>[/<slug>]` layout.
 *
 * @param outputDir - Base directory or a pre-resolved per-run dir.
 * @param date - ISO `YYYY-MM-DD` date segment.
 * @param articleTypeSlug - Optional slug segment appended under `date`.
 * @param outputDirIsResolved - When true, skip all composition.
 * @returns Absolute path to the preferred analysis directory.
 */
function computePreferredAnalysisDir(outputDir, date, articleTypeSlug, outputDirIsResolved) {
    if (outputDirIsResolved)
        return path.resolve(outputDir);
    if (articleTypeSlug)
        return path.resolve(outputDir, date, articleTypeSlug);
    return path.resolve(outputDir, date);
}
/**
 * Validate caller inputs and emit a warning when no substantive data is
 * available but `requireData` is false. Separating this from
 * {@link runAnalysisStage} keeps that function's cognitive complexity
 * inside the repo's SonarJS limit.
 *
 * @param fetchedData - Raw EP data (used only for the substantive-data check)
 * @param options - Subset of {@link AnalysisStageOptions} needed for validation
 */
function validateAnalysisInputs(fetchedData, options) {
    const { date, requireData = false, verbose = false } = options;
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
        throw new Error(`Invalid analysis date "${date}": must match YYYY-MM-DD format`);
    }
    if (hasSubstantiveData(fetchedData))
        return;
    if (requireData) {
        throw new Error('Analysis aborted: no substantive EP data available. ' +
            'MCP data fetch must succeed before analysis can run. ' +
            'Check MCP connection and feed data source.');
    }
    if (verbose) {
        console.warn('⚠️  [analysis] No substantive EP data — analysis will be data-sparse.');
    }
}
/**
 * Group discovered artifact relative paths by their first path segment.
 *
 * Produces the shape expected by
 * `src/utils/validate-analysis-completeness.ts` — keys are subdirectory
 * names (`intelligence`, `classification`, `risk-scoring`, `documents`,
 * `threat-assessment`, `existing`, …) and values are the full relative
 * paths. Root-level files (no `/`) are collected under the `root` key.
 *
 * Paths are normalised to POSIX separators (`/`) so that manifests are
 * portable across OSes — on Windows, `path.relative` may emit `\` which
 * would otherwise bucket every artifact under `root` and break the gate.
 *
 * A {@link Map} is used internally to sidestep generic object-injection
 * lint warnings; the returned object is created via `Object.create(null)`
 * so reserved keys (`__proto__`, `constructor`, `prototype`) cannot mutate
 * `Object.prototype` even if a malicious or buggy subdir name appears on
 * disk. As a defence-in-depth measure such names are also dropped before
 * assignment.
 *
 * @param relativePaths - Artifact paths relative to the analysis dir.
 * @returns `{ [subdir]: relativePath[] }` map, sorted alphabetically.
 */
const RESERVED_OBJECT_KEYS = new Set([
    '__proto__',
    'constructor',
    'prototype',
]);
function groupFilesBySubdir(relativePaths) {
    const groups = new Map();
    for (const rel of relativePaths) {
        const normalizedRel = rel.replaceAll('\\', '/');
        const slashIdx = normalizedRel.indexOf('/');
        const key = slashIdx === -1 ? 'root' : normalizedRel.slice(0, slashIdx);
        if (RESERVED_OBJECT_KEYS.has(key))
            continue;
        const list = groups.get(key);
        if (list) {
            list.push(normalizedRel);
        }
        else {
            groups.set(key, [normalizedRel]);
        }
    }
    const out = Object.create(null);
    for (const key of [...groups.keys()].sort()) {
        const list = groups.get(key);
        if (list)
            out[key] = [...list].sort();
    }
    return out;
}
/**
 * Persist `manifest.json` (when absent) and append a `history[]` entry for
 * shared same-day folders. Kept separate so {@link runAnalysisStage} stays
 * under the cognitive-complexity limit.
 *
 * When the manifest already exists but is missing Stage-C-gate-required
 * top-level fields (`articleType`, `files`), those fields are additively
 * merged in — this completes a skeleton manifest written by an agent
 * without clobbering any existing keys.
 *
 * @param manifestPath - Absolute path to the run's `manifest.json`
 * @param manifest - Manifest object to write when the file is absent
 * @param outputDirIsResolved - True when the caller passes a shared same-day folder; gates the history append
 * @param historyEntry - Entry to append to `manifest.json.history[]`
 */
function persistAnalysisArtifacts(manifestPath, manifest, outputDirIsResolved, historyEntry) {
    if (!fs.existsSync(manifestPath)) {
        try {
            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        }
        catch {
            // Non-fatal: manifest is informational
        }
    }
    else {
        augmentExistingManifest(manifestPath, manifest);
    }
    if (!outputDirIsResolved)
        return;
    try {
        mergeManifestHistory(manifestPath, historyEntry);
    }
    catch {
        // Non-fatal: the history entry is additive metadata.
    }
}
/**
 * Additively fill in Stage-C-gate-required top-level fields (`articleType`,
 * `files`) on an already-present manifest, leaving every other key
 * untouched. This completes a skeleton manifest that an agent may have
 * written with only partial metadata, so the completeness gate does not
 * fail on "missing articleType" / "missing files".
 *
 * @param manifestPath - Absolute path to an existing `manifest.json`.
 * @param manifest - Fully-populated manifest object used as the source of
 *                   the missing fields.
 */
function augmentExistingManifest(manifestPath, manifest) {
    try {
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
            return;
        const existing = parsed;
        let changed = false;
        if (manifest.articleType &&
            (typeof existing['articleType'] !== 'string' || existing['articleType'].length === 0)) {
            existing['articleType'] = manifest.articleType;
            changed = true;
        }
        if (manifest.files &&
            (!existing['files'] ||
                typeof existing['files'] !== 'object' ||
                Array.isArray(existing['files']))) {
            existing['files'] = manifest.files;
            changed = true;
        }
        if (changed) {
            fs.writeFileSync(manifestPath, JSON.stringify(existing, null, 2), 'utf-8');
        }
    }
    catch {
        // Non-fatal: the existing manifest is unreadable/corrupt. Leave it
        // alone — downstream validation will surface the error with full
        // diagnostics rather than silently overwriting user data.
    }
}
/**
 * Discover existing analysis files produced by AI agentic workflows and
 * return an {@link AnalysisContext} compatible with downstream consumers.
 *
 * This replaces the former `runAnalysisStage` which generated analysis
 * from scratch.  The AI agentic workflows now produce higher-quality
 * analysis directly, so this function merely discovers what exists on disk.
 *
 * When analysis files exist, a minimal `manifest.json` is written to disk
 * (if one doesn't already exist) so downstream consumers that check for
 * the manifest continue to work.
 *
 * When `options.outputDirIsResolved` is true, `outputDir` is honoured
 * verbatim and the uniqueness-suffix step is bypassed — agentic workflows
 * pre-populate `analysis/daily/<date>/<slug>-run<N>/` with `manifest.json`
 * plus artifacts during Stage B, and discovery must consume that exact
 * path rather than being redirected to a `-2` suffix.
 *
 * @param fetchedData - Raw EP data (used only for the requireData check)
 * @param options - Analysis stage configuration
 * @returns Analysis context with discovered methods
 */
export async function runAnalysisStage(fetchedData, options) {
    const { articleTypes, date, outputDir, articleTypeSlug, verbose = false, outputDirIsResolved = false, runId: optionRunId, gateResult = 'PENDING', } = options;
    validateAnalysisInputs(fetchedData, options);
    const startTime = new Date().toISOString();
    const runId = optionRunId && optionRunId.length > 0 ? optionRunId : randomUUID();
    // When the caller passes a fully-resolved analysis directory (e.g. an
    // agentic workflow's per-run dir `analysis/daily/<date>/<slug>-run<N>`),
    // honour it verbatim — including any existing `manifest.json` from Stage B.
    // Passing through `resolveUniqueAnalysisDir` in that case would suffix to
    // a `-2` empty directory and discovery would find 0 artifacts. Otherwise
    // compose the conventional per-article-type per-date path and let the
    // uniqueness helper avoid clobbering completed runs.
    const preferredDir = computePreferredAnalysisDir(outputDir, date, articleTypeSlug, outputDirIsResolved);
    const dateOutputDir = outputDirIsResolved ? preferredDir : resolveUniqueAnalysisDir(preferredDir);
    if (verbose) {
        console.log(`🔬 [analysis] Discovering existing analysis (runId: ${runId})`);
        console.log(`   Date: ${date}`);
        if (articleTypeSlug)
            console.log(`   Article type: ${articleTypeSlug}`);
        console.log(`   Output: ${dateOutputDir}`);
    }
    ensureDirectoryExists(dateOutputDir);
    // Discover analysis .md files that already exist on disk
    const discoveredEntries = discoverAnalysisFileEntries(dateOutputDir);
    // Build method status entries from discovered files
    const methods = discoveredEntries.map((entry) => ({
        method: entry.method,
        status: 'completed',
        outputFile: entry.outputFile,
        confidence: 'medium',
        duration: 0,
        summary: `Discovered from AI-generated analysis: ${entry.outputFile}`,
    }));
    const completedMethods = methods.map((m) => m.method);
    const endTime = new Date().toISOString();
    const discoveredPaths = discoveredEntries.map((e) => e.outputFile);
    const files = groupFilesBySubdir(discoveredPaths);
    // Stage-C completeness gate (see `validate-analysis-completeness.ts:loadManifest`)
    // requires top-level `articleType`. Fall back to a slug derived from
    // `articleTypes[]` when the caller omitted `articleTypeSlug` so the gate
    // is always green by default — matches the directory-resolution fallback
    // performed by `computePreferredAnalysisDir` / `deriveArticleTypeSlug`.
    const resolvedArticleType = articleTypeSlug && articleTypeSlug.length > 0
        ? articleTypeSlug
        : deriveArticleTypeSlug(articleTypes);
    const manifest = {
        runId,
        date,
        articleType: resolvedArticleType,
        articleTypeSlug: resolvedArticleType,
        startTime,
        endTime,
        articleTypes,
        methods,
        files,
        overallConfidence: methods.length > 0 ? 'medium' : 'low',
        dataSourcesUsed: ['ai-agentic-workflow', 'filesystem-discovery'],
    };
    // Write manifest.json (when absent) and append shared-folder history.
    const manifestPath = path.join(dateOutputDir, 'manifest.json');
    persistAnalysisArtifacts(manifestPath, manifest, outputDirIsResolved, {
        runId,
        startedAt: startTime,
        finishedAt: endTime,
        gateResult,
        filesWritten: discoveredPaths,
    });
    if (verbose) {
        console.log(`🔬 Analysis discovery complete: ${methods.length} files found`);
    }
    return {
        date,
        outputDir: dateOutputDir,
        completedMethods,
        results: new Map(methods.map((m) => [m.method, m])),
        manifest,
    };
}
//# sourceMappingURL=analysis-stage.js.map