// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/AnalysisAggregator
 * @description Read an analysis run directory, consult its `manifest.json`,
 * and produce one canonical Markdown document that concatenates every
 * artifact in the order declared by {@link ARTIFACT_SECTIONS}. The
 * document is prefixed with a provenance block and suffixed with a
 * tradecraft-references appendix plus an analysis-index appendix so a
 * reader can trace every claim back to its source file on GitHub.
 */
import fs from 'fs';
import path from 'path';
import { ARTIFACT_SECTIONS, MANIFEST_SECTION_ID, MANIFEST_SECTION_TITLE, SUPPLEMENTARY_SECTION_ID, SUPPLEMENTARY_SECTION_TITLE, TRADECRAFT_SECTION_ID, TRADECRAFT_SECTION_TITLE, } from './artifact-order.js';
import { cleanArtifact, githubBlobUrl } from './clean-artifact.js';
/**
 * Extract every string entry from a single `files` value (which may be an
 * array of strings or a `path → description` object). Split out so
 * {@link flattenManifestFiles} stays under the cognitive-complexity budget.
 *
 * @param value - One value from `Object.values(files)`
 * @returns Strings contained within, or `[]` when the shape is unknown
 */
function extractFileEntries(value) {
    if (Array.isArray(value)) {
        return value.filter((e) => typeof e === 'string');
    }
    if (value && typeof value === 'object') {
        return Object.keys(value);
    }
    return [];
}
/**
 * Normalise `manifest.files` into a flat list of `runRelPath` strings.
 *
 * @param files - Manifest `files` section (nested or flat)
 * @returns De-duplicated list of run-relative artifact paths
 */
export function flattenManifestFiles(files) {
    if (!files)
        return [];
    const out = [];
    for (const value of Object.values(files)) {
        out.push(...extractFileEntries(value));
    }
    return out;
}
/**
 * Pick the latest non-PENDING gateResult from `manifest.history[]`, falling
 * back to `PENDING` if none is recorded. Mirrors the behaviour of
 * {@link readLatestResolvedGateResult} in `src/utils/file-utils.ts` but
 * operates on an in-memory manifest.
 *
 * @param manifest - Parsed manifest object
 * @returns The latest non-PENDING gate result, or `"PENDING"` when none found
 */
export function latestGateResult(manifest) {
    const history = manifest.history ?? [];
    for (let i = history.length - 1; i >= 0; i--) {
        const entry = history[i];
        const gr = entry?.gateResult;
        if (gr && gr !== 'PENDING')
            return gr;
    }
    return 'PENDING';
}
/**
 * Expand an `artifacts` entry from {@link ArtifactSection} into a list of
 * concrete artifact paths. Exact paths are kept as-is; directory prefixes
 * ending in `/` expand to every remaining `.md` under that directory
 * (lexical order), excluding files already claimed by higher-priority
 * sections.
 *
 * @param section - Canonical section descriptor from {@link ARTIFACT_SECTIONS}
 * @param available - Set of every known artifact path (run-relative)
 * @param consumed - Mutable set of paths already claimed by earlier sections
 * @returns Ordered list of artifact paths that belong to this section
 */
export function expandSectionArtifacts(section, available, consumed) {
    const out = [];
    for (const entry of section.artifacts) {
        if (entry.endsWith('/')) {
            const prefix = entry;
            const matching = [...available]
                .filter((p) => p.startsWith(prefix) && !consumed.has(p))
                .sort();
            for (const p of matching) {
                out.push(p);
                consumed.add(p);
            }
        }
        else if (available.has(entry) && !consumed.has(entry)) {
            out.push(entry);
            consumed.add(entry);
        }
    }
    return out;
}
/**
 * Discover tradecraft files (methodologies + templates) under a repo root.
 * Returned paths are repo-relative with POSIX separators and sorted
 * lexically.
 *
 * @param repoRoot - Absolute path of the repo root
 * @returns Sorted list of `analysis/methodologies/*.md` + `analysis/templates/*.md`
 */
export function discoverTradecraftFiles(repoRoot) {
    const result = [];
    for (const sub of ['analysis/methodologies', 'analysis/templates']) {
        const dir = path.join(repoRoot, sub);
        if (!fs.existsSync(dir))
            continue;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.md')) {
                result.push(`${sub}/${entry.name}`);
            }
        }
    }
    return result.sort();
}
/**
 * Walk the run directory and return every `.md` file as a run-relative
 * POSIX path, excluding files under `data/` (raw MCP payloads, not meant
 * to be rendered).
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns Sorted list of run-relative `.md` paths
 */
function collectRunArtifacts(runDir) {
    const result = [];
    if (!fs.existsSync(runDir))
        return result;
    const walk = (dir, prefix) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) {
                if (entry.name === 'data' || entry.name === 'runs')
                    continue;
                walk(full, rel);
            }
            else if (entry.isFile() && entry.name.endsWith('.md')) {
                result.push(rel);
            }
        }
    };
    walk(runDir, '');
    return result.sort();
}
/**
 * Human-friendly title derived from a file stem (kebab/snake → Title Case).
 *
 * @param stem - File stem (e.g. `synthesis-summary.md`)
 * @returns Humanised title (e.g. `Synthesis Summary`)
 */
function humanize(stem) {
    return stem
        .replace(/[-_]+/g, ' ')
        .replace(/\.md$/i, '')
        .replace(/\b([a-z])/g, (_, c) => c.toUpperCase())
        .trim();
}
/**
 * Render the provenance block shown at the very top of the aggregated
 * document. Shows run metadata, gate result, and a direct link to the
 * manifest on GitHub so the reader can audit the full artifact set.
 *
 * @param params - Provenance metadata for the aggregated run
 * @param params.articleType - Article type slug (e.g. `breaking`)
 * @param params.date - ISO date of the run (`YYYY-MM-DD`)
 * @param params.runId - Stable identifier for the run
 * @param params.gateResult - Latest non-PENDING gate result
 * @param params.runDirRelPath - Repo-relative path of the run directory
 * @param params.manifestRelPath - Repo-relative path of `manifest.json`
 * @returns Markdown blockquote ready to be concatenated into the aggregate
 */
export function renderProvenanceBlock(params) {
    const manifestUrl = githubBlobUrl(params.manifestRelPath);
    const treeUrl = `https://github.com/Hack23/euparliamentmonitor/tree/main/${params.runDirRelPath}`;
    return [
        '<!-- Aggregated analysis — do not edit; regenerate via `npm run generate-article`. -->',
        '',
        '> **Provenance**',
        '>',
        `> - **Article type:** \`${params.articleType}\``,
        `> - **Run date:** ${params.date}`,
        `> - **Run id:** \`${params.runId}\``,
        `> - **Gate result:** \`${params.gateResult}\``,
        `> - **Analysis tree:** [${params.runDirRelPath}](${treeUrl})`,
        `> - **Manifest:** [manifest.json](${manifestUrl})`,
        '',
    ].join('\n');
}
/**
 * Render the tradecraft-references appendix — one bullet per
 * methodology/template file with a GitHub blob link.
 *
 * @param files - Repo-relative paths under `analysis/methodologies/` and
 *                `analysis/templates/`
 * @returns Markdown block with two subsections (methodologies, templates)
 */
export function renderTradecraftAppendix(files) {
    const methods = files.filter((f) => f.startsWith('analysis/methodologies/'));
    const templates = files.filter((f) => f.startsWith('analysis/templates/'));
    const block = [
        `<h2 id="${TRADECRAFT_SECTION_ID}">${TRADECRAFT_SECTION_TITLE}</h2>`,
        '',
        'This article is produced under the [Hack23 AB](https://hack23.com) intelligence tradecraft library. Every methodology and artifact template applied to this run is linked below.',
        '',
    ];
    if (methods.length > 0) {
        block.push('### Methodologies');
        block.push('');
        for (const rel of methods) {
            const stem = rel.split('/').pop()?.replace(/\.md$/i, '') ?? rel;
            block.push(`- [${humanize(stem)}](${githubBlobUrl(rel)})`);
        }
        block.push('');
    }
    if (templates.length > 0) {
        block.push('### Artifact templates');
        block.push('');
        for (const rel of templates) {
            const stem = rel.split('/').pop()?.replace(/\.md$/i, '') ?? rel;
            block.push(`- [${humanize(stem)}](${githubBlobUrl(rel)})`);
        }
        block.push('');
    }
    return block.join('\n');
}
/**
 * Render the analysis-index appendix — a compact table of every included
 * artifact and its section, plus a direct link to the manifest.
 *
 * @param included - Artifacts that contributed to the aggregated document
 * @param manifestRelPath - Repo-relative path of `manifest.json`
 * @returns Markdown block with the index table
 */
export function renderAnalysisIndex(included, manifestRelPath) {
    const rows = included.map((a) => {
        const stem = a.runRelPath.split('/').pop()?.replace(/\.md$/i, '') ?? a.runRelPath;
        return `| ${a.sectionId} | [${stem}](${githubBlobUrl(a.repoRelPath)}) | \`${a.runRelPath}\` |`;
    });
    return [
        `<h2 id="${MANIFEST_SECTION_ID}">${MANIFEST_SECTION_TITLE}</h2>`,
        '',
        `Every artifact below was read by the aggregator and contributed to this article. The raw [manifest.json](${githubBlobUrl(manifestRelPath)}) carries the full machine-readable list, including gate-result history.`,
        '',
        '| Section | Artifact | Path |',
        '|---|---|---|',
        ...rows,
        '',
    ].join('\n');
}
/**
 * Read a single artifact, clean it, and return the Markdown lines that
 * should be appended to the aggregated document along with the provenance
 * metadata. Split out so {@link aggregateAnalysisRun} stays under the
 * cognitive-complexity budget.
 *
 * @param runDir - Absolute path to the analysis run directory
 * @param runRel - Run-relative POSIX path of the artifact
 * @param runDirRelPath - Repo-relative POSIX path of the run directory
 * @param seenMermaid - Shared mermaid-body hash set for dedup
 * @param sectionId - Identifier of the owning section (for the index)
 * @returns `{ lines, included }` ready to be appended; `null` when the file
 *          doesn't exist on disk
 */
function renderArtifactFragment(runDir, runRel, runDirRelPath, seenMermaid, sectionId) {
    const abs = path.join(runDir, runRel);
    if (!fs.existsSync(abs))
        return null;
    const raw = fs.readFileSync(abs, 'utf8');
    const repoRel = `${runDirRelPath}/${runRel}`;
    const cleaned = cleanArtifact(raw, {
        artifactRelPath: repoRel,
        seenMermaidHashes: seenMermaid,
    });
    const stem = runRel.split('/').pop()?.replace(/\.md$/i, '') ?? runRel;
    const lines = [
        '',
        `### ${humanize(stem)}`,
        '',
        `<p class="artifact-source"><a href="${githubBlobUrl(repoRel)}" rel="noopener">View source: <code>${runRel}</code></a></p>`,
        '',
        cleaned.markdown,
    ];
    const included = {
        runRelPath: runRel,
        repoRelPath: repoRel,
        sectionId,
    };
    return { lines, included };
}
/**
 * Append one canonical section to `sectionMarkdown`, reading every
 * fragment through {@link renderArtifactFragment}. Extracted so
 * {@link aggregateAnalysisRun} stays under the cognitive-complexity budget.
 *
 * @param runDir - Absolute run directory
 * @param runDirRelPath - Repo-relative run directory
 * @param sectionId - Section identifier
 * @param sectionTitle - Section title
 * @param paths - Run-relative paths to include
 * @param seenMermaid - Shared mermaid dedup set
 * @param sectionMarkdown - Mutable output buffer
 * @param included - Mutable list of included-artifact metadata
 */
function appendSection(runDir, runDirRelPath, sectionId, sectionTitle, paths, seenMermaid, sectionMarkdown, included) {
    if (paths.length === 0)
        return;
    sectionMarkdown.push(`<h2 id="${sectionId}">${sectionTitle}</h2>`);
    for (const runRel of paths) {
        const fragment = renderArtifactFragment(runDir, runRel, runDirRelPath, seenMermaid, sectionId);
        if (!fragment)
            continue;
        sectionMarkdown.push(...fragment.lines);
        included.push(fragment.included);
    }
    sectionMarkdown.push('');
}
/**
 * Read, clean, and concatenate every artifact declared by the run's manifest
 * (with discovery fallback when manifest.files is missing), returning a
 * single aggregated Markdown document.
 *
 * The function is deterministic: given the same inputs it produces the
 * same output byte-for-byte.
 *
 * @param options - Aggregation options (run dir, repo root, tradecraft files)
 * @returns {@link AggregatedRun} describing the rendered document
 */
export function aggregateAnalysisRun(options) {
    const { runDir, repoRoot } = options;
    if (!fs.existsSync(runDir)) {
        throw new Error(`Run directory does not exist: ${runDir}`);
    }
    const manifestPath = path.join(runDir, 'manifest.json');
    let manifest = { articleType: 'unknown' };
    if (fs.existsSync(manifestPath)) {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
    const manifestFiles = flattenManifestFiles(manifest.files);
    const discovered = collectRunArtifacts(runDir);
    // Merge manifest-declared files with discovered files; manifest gives order
    // priority, discovery ensures nothing is missed.
    const availableSet = new Set([...manifestFiles, ...discovered]);
    const available = [...availableSet].sort();
    const consumed = new Set();
    const includedArtifacts = [];
    const sectionMarkdown = [];
    const seenMermaid = new Set();
    const runDirRelPath = path
        .relative(repoRoot, runDir)
        .split(path.sep)
        .join('/');
    for (const section of ARTIFACT_SECTIONS) {
        const paths = expandSectionArtifacts(section, new Set(available), consumed);
        appendSection(runDir, runDirRelPath, section.id, section.title, paths, seenMermaid, sectionMarkdown, includedArtifacts);
    }
    // Supplementary bucket: anything that didn't match a declared section
    const leftovers = available.filter((p) => !consumed.has(p));
    if (leftovers.length > 0) {
        appendSection(runDir, runDirRelPath, SUPPLEMENTARY_SECTION_ID, SUPPLEMENTARY_SECTION_TITLE, leftovers, seenMermaid, sectionMarkdown, includedArtifacts);
        for (const p of leftovers)
            consumed.add(p);
    }
    const tradecraftFiles = options.tradecraftFiles ?? discoverTradecraftFiles(repoRoot);
    const articleType = manifest.articleType ?? 'unknown';
    const date = manifest.date ?? guessDateFromRunDir(runDirRelPath);
    const runId = manifest.runId ?? path.basename(runDir);
    const gateResult = latestGateResult(manifest);
    const manifestRelPath = `${runDirRelPath}/manifest.json`;
    const documentTitle = `${humanize(articleType)} — ${date}`;
    const provenance = renderProvenanceBlock({
        articleType,
        date,
        runId,
        gateResult,
        runDirRelPath,
        manifestRelPath,
    });
    const tradecraft = renderTradecraftAppendix(tradecraftFiles);
    const analysisIndex = renderAnalysisIndex(includedArtifacts, manifestRelPath);
    const markdown = [
        `# ${documentTitle}`,
        '',
        provenance,
        '',
        ...sectionMarkdown,
        '',
        tradecraft,
        '',
        analysisIndex,
        '',
    ]
        .join('\n')
        .replace(/\n{3,}/g, '\n\n');
    return {
        markdown,
        runDirRelPath,
        articleType,
        date,
        includedArtifacts,
        gateResult,
    };
}
/**
 * Extract a `YYYY-MM-DD` date from a path like
 * `analysis/daily/2026-01-15/run`. Falls back to the epoch date when no
 * ISO date is embedded in the path.
 *
 * @param runDirRelPath - Repo-relative path of the run directory
 * @returns ISO date string in `YYYY-MM-DD` form
 */
function guessDateFromRunDir(runDirRelPath) {
    const match = /(\d{4}-\d{2}-\d{2})/.exec(runDirRelPath);
    return match ? (match[1] ?? '1970-01-01') : '1970-01-01';
}
//# sourceMappingURL=analysis-aggregator.js.map