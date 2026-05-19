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
} from './artifact-order.js';
import { cleanArtifact } from './clean-artifact.js';
import {
  buildKeyTakeaways,
  KEY_TAKEAWAYS_SECTION_ID,
  KEY_TAKEAWAYS_SECTION_TITLE,
} from './key-takeaways.js';
import { resolveRunId, type Manifest } from './manifest/index.js';
import type { TocSection, IncludedArtifact } from './reader-guide-constants.js';
import { READER_GUIDE_SECTION_ID, READER_GUIDE_SECTION_TITLE } from './reader-guide-constants.js';
import {
  expandSectionArtifacts,
  flattenManifestFiles,
  guessDateFromRunDir,
  humanizeStem,
  latestGateResult,
  renderAnalysisIndex,
  renderProvenanceBlock,
  renderReaderIntelligenceGuide,
  renderTradecraftAppendix,
  discoverTradecraftFiles,
  resolveArticleTypeFromManifest,
} from './run/index.js';

export type { TocSection, IncludedArtifact } from './reader-guide-constants.js';
export {
  READER_GUIDE_SECTION_ID,
  READER_GUIDE_SECTION_IDS,
  READER_GUIDE_SECTION_TITLE,
} from './reader-guide-constants.js';
export * from './run/index.js';

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

// Excludes aggregator outputs (article.md + translated article.*.md) and README.md (gate input).
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
 * Read a single artifact, clean it, and return the Markdown lines plus
 * provenance metadata to append. Returns `null` when the file is missing.
 * @param runDir - Absolute path to the run directory
 * @param runRel - Run-relative artifact path
 * @param runDirRelPath - Repo-relative path to the run directory
 * @param seenMermaid - Hashes of mermaid blocks already emitted
 * @param sectionId - Canonical (un-prefixed) section id for provenance
 * @param suppressHeader - Omit the `### {humanize(stem)}` sub-heading
 * @returns `{ lines, included }` or `null` when the artifact doesn't exist
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
  const headerLines = suppressHeader ? [] : ['', `### ${humanizeStem(stem)}`];
  const lines = [...headerLines, '', cleaned.markdown];
  const included: IncludedArtifact = {
    runRelPath: runRel,
    repoRelPath: repoRel,
    sectionId,
  };
  return { lines, included };
}

/**
 * Suppress the `### {humanizeStem(stem)}` sub-heading for single-artifact
 * sections whose stem matches the section title (avoids duplicate H2/H3).
 * @param paths - Run-relative artifact paths for the section
 * @param sectionTitle - Canonical section H2 title
 * @returns `true` when the sub-heading should be omitted
 */
function shouldSuppressFragmentHeader(paths: readonly string[], sectionTitle: string): boolean {
  if (paths.length !== 1) return false;
  const onlyPath = paths[0];
  if (!onlyPath) return false;
  const stem = onlyPath.split('/').pop()?.replace(/\.md$/i, '') ?? onlyPath;
  return humanizeStem(stem).toLowerCase() === sectionTitle.toLowerCase();
}

// Prefix for canonical section ids (e.g. `section-stakeholder-map`) so anchors
// don't collide with artifact heading slugs produced by `markdown-it-anchor`.
const SECTION_ID_PREFIX = 'section-';

// Namespace a canonical section id.
function namespacedSectionId(sectionId: string): string {
  return `${SECTION_ID_PREFIX}${sectionId}`;
}

/**
 * Append one canonical section to `sectionMarkdown`, reading every fragment
 * through {@link renderArtifactFragment}. Records the section in
 * `emittedSections` only when ≥1 of its artifacts was rendered.
 * @param runDir - Absolute path to the run directory
 * @param runDirRelPath - Repo-relative path to the run directory
 * @param sectionId - Canonical (un-prefixed) section id
 * @param sectionTitle - Section H2 title
 * @param paths - Run-relative artifact paths to include
 * @param seenMermaid - Hashes of mermaid blocks already emitted
 * @param sectionMarkdown - Output buffer for section markdown (mutated)
 * @param included - Provenance accumulator (mutated)
 * @param emittedSections - TOC accumulator (mutated)
 */
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
  if (fragments.length === 0) return;
  sectionMarkdown.push(`<h2 id="${emittedId}">${sectionTitle}</h2>`);
  sectionMarkdown.push(...fragments);
  emittedSections.push({ id: emittedId, title: sectionTitle });
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
  let manifest: Manifest = { articleType: 'unknown' };
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest;
  }
  const manifestFiles = flattenManifestFiles(manifest.files);
  const discovered = collectRunArtifacts(runDir);
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
  const runId = resolveRunId(manifest, path.basename(runDir));
  const gateResult = latestGateResult(manifest);
  const manifestRelPath = `${runDirRelPath}/manifest.json`;

  const documentTitle = `${humanizeStem(articleType)} — ${date}`;
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
  const keyTakeaways = buildKeyTakeaways({ runDir });

  let postBriefIdx =
    emittedSections.length > 0 &&
    emittedSections[0]?.id === namespacedSectionId(execBriefSection?.id ?? '')
      ? 1
      : 0;
  if (readerGuide) {
    emittedSections.splice(postBriefIdx, 0, {
      id: READER_GUIDE_SECTION_ID,
      title: READER_GUIDE_SECTION_TITLE,
    });
    postBriefIdx += 1;
  }
  if (keyTakeaways) {
    emittedSections.splice(postBriefIdx, 0, {
      id: KEY_TAKEAWAYS_SECTION_ID,
      title: KEY_TAKEAWAYS_SECTION_TITLE,
    });
  }
  emittedSections.push({ id: TRADECRAFT_SECTION_ID, title: TRADECRAFT_SECTION_TITLE });
  emittedSections.push({ id: MANIFEST_SECTION_ID, title: MANIFEST_SECTION_TITLE });

  const markdown = [
    `# ${documentTitle}`,
    '',
    ...execBriefMarkdown,
    '',
    ...(readerGuide ? [readerGuide, ''] : []),
    ...(keyTakeaways ? [keyTakeaways, ''] : []),
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
