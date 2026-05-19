// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/CleanArtifact
 * @description Normalise a single analysis-artifact Markdown file so it can be
 * merged into the aggregate document without producing duplicate banners,
 * competing H1 headings, or broken relative links.
 *
 * Applied transformations (in order):
 *   1. Strip leading YAML front-matter (`---\n…\n---\n`).
 *   2. Strip ISMS/owner/classification banners (emoji rows, shields.io badges,
 *      `<p align="center">` blocks, and the separator `---` that usually
 *      follows them).
 *   3. Remove the artifact's own H1; the aggregator owns the document outline.
 *   4. Demote every remaining heading by one level (H2→H3, etc.) so the
 *      aggregate has a single H1.
 *   5. Rewrite repo-relative links/images to absolute GitHub URLs so the
 *      published HTML is portable.
 *   6. Deduplicate mermaid fence bodies on a per-document basis (caller-owned
 *      state) — identical blocks are replaced with a reference comment.
 *
 * This module is a thin barrel that re-exports the per-step implementations
 * from `./clean/*`. New code should import directly from the step modules
 * (or from `./clean/pipeline.js` for the composed `cleanArtifact`); this
 * barrel exists to preserve the existing public import surface.
 */
export { dedupMermaid } from './clean/dedupe-mermaid.js';
export { demoteHeadings } from './clean/demote-headings.js';
export { cleanArtifact, } from './clean/pipeline.js';
export { githubBlobUrl, githubRawUrl, resolveLink, rewriteLinks } from './clean/rewrite-links.js';
export { stripBanners } from './clean/strip-banners.js';
export { stripFrontMatter } from './clean/strip-frontmatter.js';
export { stripArtifactMetadataPreamble } from './clean/strip-preamble.js';
export { stripSpdxTags } from './clean/strip-spdx.js';
//# sourceMappingURL=clean-artifact.js.map