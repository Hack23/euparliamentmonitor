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
import {
  ARTIFACT_SECTIONS,
  MANIFEST_SECTION_ID,
  MANIFEST_SECTION_TITLE,
  SUPPLEMENTARY_SECTION_ID,
  SUPPLEMENTARY_SECTION_TITLE,
  TRADECRAFT_SECTION_ID,
  TRADECRAFT_SECTION_TITLE,
  type ArtifactSection,
} from './artifact-order.js';
import { cleanArtifact, githubBlobUrl } from './clean-artifact.js';

/** Raw manifest shape as committed by the analysis pipeline. */
export interface AnalysisManifest {
  readonly articleType: string;
  readonly runId?: string;
  readonly date?: string;
  readonly analysisDir?: string;
  readonly files?: ManifestFiles;
  readonly history?: readonly ManifestHistoryEntry[];
}

/** `manifest.files` can be nested category → paths or flat path → description. */
export type ManifestFiles = Record<string, readonly string[] | Record<string, string>>;

/** One entry in `manifest.history[]`; only fields we read are typed. */
export interface ManifestHistoryEntry {
  readonly stage?: string;
  readonly completedAt?: string;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly runId?: string;
  readonly gateResult?: string;
  readonly summary?: string;
  readonly filesWritten?: readonly string[];
}

/** Result of {@link aggregateAnalysisRun}. */
export interface AggregatedRun {
  /** Final Markdown document (provenance + sections + appendices). */
  readonly markdown: string;
  /** Repo-relative path of the run dir (e.g. `analysis/daily/2026-01-15/breaking-run1`). */
  readonly runDirRelPath: string;
  /** Article type slug from the manifest. */
  readonly articleType: string;
  /** ISO date string of the run (YYYY-MM-DD). */
  readonly date: string;
  /** List of every artifact included, in the order they appear. */
  readonly includedArtifacts: readonly IncludedArtifact[];
  /** Latest resolved gate result read from `manifest.history[]`. */
  readonly gateResult: string;
  /**
   * Ordered list of top-level (H2) sections that were actually emitted into
   * the aggregate — used by the HTML renderer to build the article
   * table-of-contents sidebar. Includes canonical sections, the
   * supplementary-intelligence bucket, the tradecraft-references appendix,
   * and the analysis-index appendix, in document order.
   */
  readonly sectionToc: readonly TocSection[];
}

/** One entry in the article-level table of contents (H2 level). */
export interface TocSection {
  /** Fragment identifier — matches the `id="…"` on the rendered H2. */
  readonly id: string;
  /** Display title shown in the sidebar nav. */
  readonly title: string;
}

/** Metadata for one artifact included in the aggregate. */
export interface IncludedArtifact {
  /** Path relative to the run dir. */
  readonly runRelPath: string;
  /** Path relative to the repo root. */
  readonly repoRelPath: string;
  /** Id of the section this artifact belongs to. */
  readonly sectionId: string;
}

/** Options for {@link aggregateAnalysisRun}. */
export interface AggregateOptions {
  /** Absolute path to the analysis run directory. */
  readonly runDir: string;
  /** Absolute path to the repo root (used to build repo-relative paths). */
  readonly repoRoot: string;
  /**
   * Optional: all methodology files and template files that should be
   * listed in the tradecraft appendix. If omitted, the aggregator
   * discovers them under `analysis/methodologies/*.md` +
   * `analysis/templates/*.md`.
   */
  readonly tradecraftFiles?: readonly string[];
}

/**
 * Extract every string entry from a single `files` value (which may be an
 * array of strings or a `path → description` object). Split out so
 * {@link flattenManifestFiles} stays under the cognitive-complexity budget.
 *
 * @param value - One value from `Object.values(files)`
 * @returns Strings contained within, or `[]` when the shape is unknown
 */
function extractFileEntries(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((e): e is string => typeof e === 'string');
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>);
  }
  return [];
}

/**
 * Normalise `manifest.files` into a flat list of `runRelPath` strings.
 *
 * @param files - Manifest `files` section (nested or flat)
 * @returns De-duplicated list of run-relative artifact paths
 */
export function flattenManifestFiles(files: ManifestFiles | undefined): string[] {
  if (!files) return [];
  const out: string[] = [];
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
export function latestGateResult(manifest: AnalysisManifest): string {
  const history = manifest.history ?? [];
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    const gr = entry?.gateResult;
    if (gr && gr !== 'PENDING') return gr;
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
export function expandSectionArtifacts(
  section: ArtifactSection,
  available: Set<string>,
  consumed: Set<string>
): string[] {
  const out: string[] = [];
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
    } else if (available.has(entry) && !consumed.has(entry)) {
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
export function discoverTradecraftFiles(repoRoot: string): string[] {
  const result: string[] = [];
  for (const sub of ['analysis/methodologies', 'analysis/templates']) {
    const dir = path.join(repoRoot, sub);
    if (!fs.existsSync(dir)) continue;
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
 * Return `true` when a `.md` filename should be excluded from the run
 * artifact set. Keeps the walk closure under the cognitive-complexity limit.
 *
 * Excluded names:
 *  - `article.md` and translated variants (`article.sv.md`, etc.) — these are
 *    outputs of the aggregator, not inputs.
 *  - `README.md` (case-insensitive) — required for the analysis gate but not
 *    relevant to the published article.
 *
 * @param name - Bare filename (no directory prefix)
 * @returns `true` when the file should be skipped
 */
function isExcludedArtifact(name: string): boolean {
  if (name.toLowerCase() === 'readme.md') return true;
  return name.startsWith('article.') && name.endsWith('.md');
}

/**
 * Walk the run directory and return every `.md` file as a run-relative
 * POSIX path, excluding files under `data/` (raw MCP payloads, not meant
 * to be rendered).
 *
 * @param runDir - Absolute path to the analysis run directory
 * @returns Sorted list of run-relative `.md` paths
 */
function collectRunArtifacts(runDir: string): string[] {
  const result: string[] = [];
  if (!fs.existsSync(runDir)) return result;
  const walk = (dir: string, prefix: string): void => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        // Skip raw payloads, legacy run snapshots, and Pass-1 work-in-progress
        // snapshots so they are not rendered as supplementary artifacts.
        if (entry.name === 'data' || entry.name === 'runs' || entry.name === 'pass1') continue;
        walk(full, rel);
      } else if (entry.isFile() && entry.name.endsWith('.md') && !isExcludedArtifact(entry.name)) {
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
function humanize(stem: string): string {
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\.md$/i, '')
    .replace(/\b([a-z])/g, (_, c: string) => c.toUpperCase())
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
export function renderProvenanceBlock(params: {
  articleType: string;
  date: string;
  runId: string;
  gateResult: string;
  runDirRelPath: string;
  manifestRelPath: string;
}): string {
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
export function renderTradecraftAppendix(files: readonly string[]): string {
  const methods = files.filter((f) => f.startsWith('analysis/methodologies/'));
  const templates = files.filter((f) => f.startsWith('analysis/templates/'));
  const block: string[] = [
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
export function renderAnalysisIndex(
  included: readonly IncludedArtifact[],
  manifestRelPath: string
): string {
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
 * @param suppressHeader - When `true`, omit the `### {humanize(stem)}` heading
 *        (used when the section has a single artifact whose name already
 *        matches the section title, to avoid a redundant H3 immediately
 *        under the section H2)
 * @returns `{ lines, included }` ready to be appended; `null` when the file
 *          doesn't exist on disk
 */
function renderArtifactFragment(
  runDir: string,
  runRel: string,
  runDirRelPath: string,
  seenMermaid: Set<string>,
  sectionId: string,
  suppressHeader: boolean
): { lines: string[]; included: IncludedArtifact } | null {
  const abs = path.join(runDir, runRel);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs, 'utf8');
  const repoRel = `${runDirRelPath}/${runRel}`;
  const cleaned = cleanArtifact(raw, {
    artifactRelPath: repoRel,
    seenMermaidHashes: seenMermaid,
  });
  const stem = runRel.split('/').pop()?.replace(/\.md$/i, '') ?? runRel;
  const headerLines = suppressHeader ? [] : ['', `### ${humanize(stem)}`];
  const lines = [
    ...headerLines,
    '',
    `<p class="artifact-source"><a href="${githubBlobUrl(repoRel)}" rel="noopener">View source: <code>${runRel}</code></a></p>`,
    '',
    cleaned.markdown,
  ];
  const included: IncludedArtifact = {
    runRelPath: runRel,
    repoRelPath: repoRel,
    sectionId,
  };
  return { lines, included };
}

/**
 * Decide whether the `### {humanize(stem)}` sub-heading can be suppressed
 * for a single-artifact section. The rule: when a section contains exactly
 * one artifact AND the humanised stem matches the section title
 * (case-insensitive), the sub-heading would restate the section H2 and is
 * dropped. This fixes the visible `<h2>Synthesis Summary</h2><h3>Synthesis
 * Summary</h3>` duplication seen in first-pass aggregates.
 *
 * @param paths - Run-relative artifact paths that belong to the section
 * @param sectionTitle - Display title of the owning section
 * @returns `true` when the single-artifact header should be suppressed
 */
function shouldSuppressFragmentHeader(paths: readonly string[], sectionTitle: string): boolean {
  if (paths.length !== 1) return false;
  const onlyPath = paths[0];
  if (!onlyPath) return false;
  const stem = onlyPath.split('/').pop()?.replace(/\.md$/i, '') ?? onlyPath;
  return humanize(stem).toLowerCase() === sectionTitle.toLowerCase();
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
 * @param emittedSections - Mutable list of `(id, title)` pairs for the
 *        article-level TOC; a section is recorded only when at least one
 *        of its artifacts was actually rendered
 */
/**
 * Prefix applied to every article-level section id to avoid collisions
 * with artifact-generated heading anchors. A section like `stakeholder-map`
 * becomes `#section-stakeholder-map`, leaving the bare `#stakeholder-map`
 * slug free for an artifact that happens to contain a `### Stakeholder
 * Map` heading (which `markdown-it-anchor` will slug verbatim).
 */
const SECTION_ID_PREFIX = 'section-';

/**
 * Namespace a canonical section id so it cannot collide with an artifact
 * heading slug produced downstream by markdown-it-anchor.
 *
 * @param sectionId - Raw section identifier from `ARTIFACT_SECTIONS`
 * @returns Namespaced id like `section-stakeholder-map`
 */
function namespacedSectionId(sectionId: string): string {
  return `${SECTION_ID_PREFIX}${sectionId}`;
}

function appendSection(
  runDir: string,
  runDirRelPath: string,
  sectionId: string,
  sectionTitle: string,
  paths: readonly string[],
  seenMermaid: Set<string>,
  sectionMarkdown: string[],
  included: IncludedArtifact[],
  emittedSections: TocSection[]
): void {
  if (paths.length === 0) return;
  const emittedId = namespacedSectionId(sectionId);
  sectionMarkdown.push(`<h2 id="${emittedId}">${sectionTitle}</h2>`);
  const suppress = shouldSuppressFragmentHeader(paths, sectionTitle);
  let anyFragmentRendered = false;
  for (const runRel of paths) {
    const fragment = renderArtifactFragment(
      runDir,
      runRel,
      runDirRelPath,
      seenMermaid,
      emittedId,
      suppress
    );
    if (!fragment) continue;
    anyFragmentRendered = true;
    sectionMarkdown.push(...fragment.lines);
    included.push(fragment.included);
  }
  if (anyFragmentRendered) {
    emittedSections.push({ id: emittedId, title: sectionTitle });
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
export function aggregateAnalysisRun(options: AggregateOptions): AggregatedRun {
  const { runDir, repoRoot } = options;
  if (!fs.existsSync(runDir)) {
    throw new Error(`Run directory does not exist: ${runDir}`);
  }
  const manifestPath = path.join(runDir, 'manifest.json');
  let manifest: AnalysisManifest = { articleType: 'unknown' };
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as AnalysisManifest;
  }
  const manifestFiles = flattenManifestFiles(manifest.files);
  const discovered = collectRunArtifacts(runDir);
  // Merge manifest-declared files with discovered files; manifest gives order
  // priority, discovery ensures nothing is missed.
  const availableSet = new Set<string>([...manifestFiles, ...discovered]);
  const available = [...availableSet].sort();

  const consumed = new Set<string>();
  const includedArtifacts: IncludedArtifact[] = [];
  const emittedSections: TocSection[] = [];
  const sectionMarkdown: string[] = [];
  const seenMermaid = new Set<string>();
  const runDirRelPath = path.relative(repoRoot, runDir).split(path.sep).join('/');

  for (const section of ARTIFACT_SECTIONS) {
    const paths = expandSectionArtifacts(section, new Set(available), consumed);
    appendSection(
      runDir,
      runDirRelPath,
      section.id,
      section.title,
      paths,
      seenMermaid,
      sectionMarkdown,
      includedArtifacts,
      emittedSections
    );
  }

  // Supplementary bucket: anything that didn't match a declared section
  const leftovers = available.filter((p) => !consumed.has(p));
  if (leftovers.length > 0) {
    appendSection(
      runDir,
      runDirRelPath,
      SUPPLEMENTARY_SECTION_ID,
      SUPPLEMENTARY_SECTION_TITLE,
      leftovers,
      seenMermaid,
      sectionMarkdown,
      includedArtifacts,
      emittedSections
    );
    for (const p of leftovers) consumed.add(p);
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

  // Both appendices emit their own <h2 id="…"> blocks — record them so the
  // article TOC mirrors the rendered document in document order.
  emittedSections.push({ id: TRADECRAFT_SECTION_ID, title: TRADECRAFT_SECTION_TITLE });
  emittedSections.push({ id: MANIFEST_SECTION_ID, title: MANIFEST_SECTION_TITLE });

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
    sectionToc: emittedSections,
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
export function guessDateFromRunDir(runDirRelPath: string): string {
  const match = /(\d{4}-\d{2}-\d{2})/.exec(runDirRelPath);
  return match ? (match[1] ?? '1970-01-01') : '1970-01-01';
}
