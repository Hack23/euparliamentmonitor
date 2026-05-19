// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Clean/Pipeline
 * @description Compose the per-step cleaners into the public
 * {@link cleanArtifact} entry point.
 *
 * Applied transformations (in order):
 *   1. Strip leading YAML front-matter (`---\n…\n---\n`).
 *   2. Strip per-artifact SPDX tags.
 *   3. Strip ISMS/owner/classification banners (emoji rows, shields.io badges,
 *      `<p align="center">` blocks, and the separator `---` that usually
 *      follows them).
 *   4. Remove the artifact's own H1 and demote every other heading by one
 *      level so the aggregate has a single H1.
 *   5. Strip the operational metadata preamble (`**Run:**`, `**Window:**`, …).
 *   6. Rewrite repo-relative links/images to absolute GitHub URLs.
 *   7. Deduplicate mermaid fence bodies on a per-document basis.
 *   8. Collapse runs of 3+ newlines and append a final `\n`.
 */

import { dedupMermaid } from './dedupe-mermaid.js';
import { demoteHeadings } from './demote-headings.js';
import { rewriteLinks } from './rewrite-links.js';
import { stripBanners } from './strip-banners.js';
import { stripFrontMatter } from './strip-frontmatter.js';
import { stripArtifactMetadataPreamble } from './strip-preamble.js';
import { stripSpdxTags } from './strip-spdx.js';

/** Options controlling artifact cleanup. */
export interface CleanArtifactOptions {
  /**
   * Repo-relative path of the artifact being cleaned (e.g.
   * `analysis/daily/2026-01-15/breaking-run1/intelligence/synthesis-summary.md`).
   * Used to resolve relative links/images against.
   */
  readonly artifactRelPath: string;
  /**
   * Shared set of mermaid-body hashes seen so far in the aggregate document.
   * Identical blocks are replaced with a cross-reference comment; the caller
   * owns the set so it persists across artifacts.
   */
  readonly seenMermaidHashes?: Set<string>;
}

/** Result of {@link cleanArtifact}. */
export interface CleanArtifactResult {
  /** Cleaned Markdown ready to be concatenated into the aggregate. */
  readonly markdown: string;
  /** Headings removed (for debugging/telemetry). */
  readonly strippedH1s: number;
  /** Banner/metadata lines removed. */
  readonly strippedBannerLines: number;
  /** Operational metadata preamble lines removed (e.g. **Run:** / **Window:** blocks). */
  readonly strippedMetaLines: number;
  /** Mermaid blocks deduplicated as a reference to a previous occurrence. */
  readonly dedupedMermaidBlocks: number;
}

/**
 * Apply all cleanup passes and return the normalised Markdown plus
 * simple counters for telemetry/tests.
 *
 * @param source - Raw Markdown contents of the artifact file
 * @param options - Cleanup options (artifact path, shared mermaid dedup set)
 * @returns {@link CleanArtifactResult} with the normalised Markdown
 */
export function cleanArtifact(source: string, options: CleanArtifactOptions): CleanArtifactResult {
  const seen = options.seenMermaidHashes ?? new Set<string>();
  let md = stripFrontMatter(source);
  md = stripSpdxTags(md).md;
  const { md: mdAfterBanners, lines: strippedBannerLines } = stripBanners(md);
  md = mdAfterBanners;
  const { md: mdAfterHeadings, h1Count } = demoteHeadings(md);
  md = mdAfterHeadings;
  const { md: mdAfterMeta, lines: strippedMetaLines } = stripArtifactMetadataPreamble(md);
  md = mdAfterMeta;
  md = rewriteLinks(md, options.artifactRelPath);
  const { md: mdAfterMermaid, deduped } = dedupMermaid(md, seen);
  md = mdAfterMermaid;
  md = md.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  return {
    markdown: md,
    strippedH1s: h1Count,
    strippedBannerLines,
    strippedMetaLines,
    dedupedMermaidBlocks: deduped,
  };
}
