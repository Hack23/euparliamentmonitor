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
import { treeUrl } from './infra/github-urls.js';
import {
  flattenManifestFiles as _flattenManifestFiles,
  latestGateResult as _latestGateResult,
  resolveArticleType as _resolveArticleType,
  resolveRunId as _resolveRunId,
  type Manifest,
  type ManifestFiles,
} from './manifest/index.js';

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

/** Id of the generated reader guide section. */
export const READER_GUIDE_SECTION_ID = 'reader-intelligence-guide';

/** Display title of the generated reader guide section. */
export const READER_GUIDE_SECTION_TITLE = 'Reader Intelligence Guide';

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
 * Normalise `manifest.files` into a flat list of `runRelPath` strings.
 *
 * Thin re-export of {@link _flattenManifestFiles} from
 * `aggregator/manifest/index.js`; preserved here so external callers
 * (`backport-article-seo`, curator scripts) keep resolving.
 *
 * @param files - Manifest `files` section (nested or flat)
 * @returns De-duplicated list of run-relative artifact paths
 */
export function flattenManifestFiles(files: ManifestFiles | undefined): string[] {
  return _flattenManifestFiles(files);
}

/**
 * Pick the latest non-PENDING gateResult from `manifest.history[]`, falling
 * back to `PENDING` if none is recorded.
 *
 * Thin re-export of {@link _latestGateResult} from
 * `aggregator/manifest/index.js`.
 *
 * @param manifest - Parsed manifest object
 * @returns The latest non-PENDING gate result, or `"PENDING"` when none found
 */
export function latestGateResult(manifest: Manifest): string {
  return _latestGateResult(manifest);
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
      // `executive-brief.md` is the canonical Riksdagsmonitor-aligned path;
      // `extended/executive-brief.md` remains a compatibility fallback. When
      // both exist, render only the canonical root file.
      if (section.id === 'executive-brief') break;
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
  const treeHref = treeUrl(params.runDirRelPath);
  return [
    '> **Provenance & Audit**',
    '>',
    `> - **Article type:** \`${params.articleType}\``,
    `> - **Run date:** ${params.date}`,
    `> - **Run id:** \`${params.runId}\``,
    `> - **Gate result:** \`${params.gateResult}\``,
    `> - **Analysis tree:** [${params.runDirRelPath}](${treeHref})`,
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

/** Reader-guide copy for high-value intelligence sections. */
const READER_GUIDE_VALUES: Readonly<Record<string, { need: string; value: string }>> = {
  'section-executive-brief': {
    need: 'BLUF and editorial decisions',
    value:
      'fast answer to what happened, why it matters, who is accountable, and the next dated trigger',
  },
  'section-synthesis': {
    need: 'Integrated thesis',
    value: 'the lead political reading that connects facts, actors, risks, and confidence',
  },
  'section-significance': {
    need: 'Significance scoring',
    value: 'why this story outranks or trails other same-day European Parliament signals',
  },
  'section-coalitions-voting': {
    need: 'Coalitions and voting',
    value: 'political group alignment, voting evidence, and coalition pressure points',
  },
  'section-stakeholder-map': {
    need: 'Stakeholder impact',
    value: 'who gains, who loses, and which institutions or citizens feel the policy effect',
  },
  'section-economic-context': {
    need: 'IMF-backed economic context',
    value: 'macro, fiscal, trade, or monetary evidence that changes the political interpretation',
  },
  'section-scenarios': {
    need: 'Forward indicators',
    value: 'dated watch items that let readers verify or falsify the assessment later',
  },
  'section-risk': {
    need: 'Risk assessment',
    value: 'policy, institutional, coalition, communications, and implementation risk register',
  },
};

/**
 * Render the generated reader-intelligence guide that appears before the
 * artifact sections. It gives readers a Riksdagsmonitor-style navigation layer
 * without requiring agents to hand-author another artifact.
 *
 * @param sections - Emitted section TOC entries, in document order
 * @param included - Included artifacts, used to name each section's source
 * @returns Markdown block containing the guide table
 */
export function renderReaderIntelligenceGuide(
  sections: readonly TocSection[],
  included: readonly IncludedArtifact[]
): string {
  const rows = sections
    .map((section) => {
      const copy = Object.getOwnPropertyDescriptor(READER_GUIDE_VALUES, section.id)?.value as
        | { need: string; value: string }
        | undefined;
      if (!copy) return '';
      const source = included.find((artifact) => artifact.sectionId === section.id)?.runRelPath;
      const label = source ? `\`${source}\`` : section.title;
      return `| [${copy.need}](#${section.id}) | ${copy.value} | ${label} |`;
    })
    .filter(Boolean);

  if (rows.length === 0) return '';
  return [
    `<h2 id="${READER_GUIDE_SECTION_ID}">${READER_GUIDE_SECTION_TITLE}</h2>`,
    '',
    'Use this guide to read the article as a political-intelligence product rather than a raw artifact dump. High-value reader lenses appear first; technical provenance remains available in the audit appendices.',
    '',
    "| Reader need | What you'll get | Source artifact |",
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
  // Per-section "View source" links are intentionally omitted — references
  // are consolidated in the end-of-document Analysis Index appendix so the
  // body reads as a journalistic / political-intelligence narrative rather
  // than as a per-paragraph artifact dump.
  const lines = [...headerLines, '', cleaned.markdown];
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
  const suppress = shouldSuppressFragmentHeader(paths, sectionTitle);
  const fragments: string[] = [];
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
    fragments.push(...fragment.lines);
    included.push(fragment.included);
  }
  // Only emit the section H2 + body when at least one artifact was rendered;
  // an empty heading with no content is a workflow-metadata leak (used to
  // happen for the Supplementary bucket when leftovers were missing on disk).
  if (fragments.length === 0) return;
  sectionMarkdown.push(`<h2 id="${emittedId}">${sectionTitle}</h2>`);
  sectionMarkdown.push(...fragments);
  emittedSections.push({ id: emittedId, title: sectionTitle });
  sectionMarkdown.push('');
}

/**
 * Resolve the article-type slug from a manifest, tolerating legacy schemas.
 *
 * Thin re-export of {@link _resolveArticleType} from
 * `aggregator/manifest/index.js`. Resolution order: `articleType` →
 * `articleTypes[0]` → `runType` → `'unknown'`.
 *
 * @param manifest - Parsed manifest (any of the supported schemas)
 * @returns Article-type slug usable as a filename component
 */
export function resolveArticleTypeFromManifest(manifest: Manifest): string {
  return _resolveArticleType(manifest);
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
  let manifest: Manifest = { articleType: 'unknown' };
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest;
  }
  const manifestFiles = flattenManifestFiles(manifest.files);
  const discovered = collectRunArtifacts(runDir);
  // Merge manifest-declared files with discovered files; manifest gives order
  // priority, discovery ensures nothing is missed. Filter to renderable
  // markdown only and exclude raw payload directories (`data/`, `runs/`,
  // `pass1/`) — these are workflow-internal and would leak into the
  // Supplementary bucket as JSON dumps if the manifest declared them.
  const availableSet = new Set<string>(
    [...manifestFiles, ...discovered].filter(
      (p) =>
        p.endsWith('.md') &&
        !p.startsWith('data/') &&
        !p.startsWith('runs/') &&
        !p.startsWith('pass1/')
    )
  );
  const available = [...availableSet].sort();

  const consumed = new Set<string>();
  const includedArtifacts: IncludedArtifact[] = [];
  const emittedSections: TocSection[] = [];
  const sectionMarkdown: string[] = [];
  const seenMermaid = new Set<string>();
  const runDirRelPath = path.relative(repoRoot, runDir).split(path.sep).join('/');

  // Render the Executive Brief section first into a dedicated buffer so it
  // can be placed BEFORE the Reader Intelligence Guide — analysts and
  // journalists need the BLUF up front; the TOC-style guide then orients
  // the reader for the deeper sections that follow.
  const execBriefMarkdown: string[] = [];
  const [execBriefSection, ...remainingSections] = ARTIFACT_SECTIONS;
  if (execBriefSection) {
    const paths = expandSectionArtifacts(execBriefSection, new Set(available), consumed);
    appendSection(
      runDir,
      runDirRelPath,
      execBriefSection.id,
      execBriefSection.title,
      paths,
      seenMermaid,
      execBriefMarkdown,
      includedArtifacts,
      emittedSections
    );
  }

  for (const section of remainingSections) {
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
  const articleType = resolveArticleTypeFromManifest(manifest);
  const date = manifest.date ?? guessDateFromRunDir(runDirRelPath);
  const runId = _resolveRunId(manifest, path.basename(runDir));
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
  const readerGuide = renderReaderIntelligenceGuide(emittedSections, includedArtifacts);

  // TOC ordering reflects the rendered document:
  // Executive Brief (already first in emittedSections via appendSection) →
  // Reader Intelligence Guide (inserted at position 1, after Exec Brief) →
  // remaining sections → audit appendices.
  if (readerGuide) {
    const insertIdx =
      emittedSections.length > 0 &&
      emittedSections[0]?.id === namespacedSectionId(execBriefSection?.id ?? '')
        ? 1
        : 0;
    emittedSections.splice(insertIdx, 0, {
      id: READER_GUIDE_SECTION_ID,
      title: READER_GUIDE_SECTION_TITLE,
    });
  }
  emittedSections.push({ id: TRADECRAFT_SECTION_ID, title: TRADECRAFT_SECTION_TITLE });
  emittedSections.push({ id: MANIFEST_SECTION_ID, title: MANIFEST_SECTION_TITLE });

  const markdown = [
    `# ${documentTitle}`,
    '',
    ...execBriefMarkdown,
    '',
    readerGuide,
    '',
    ...sectionMarkdown,
    '',
    provenance,
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
