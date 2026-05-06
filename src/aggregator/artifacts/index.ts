// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Artifacts
 * @description Public re-exports for the artifacts bounded context.
 * Provides artifact ordering, sanitization, and type definitions.
 */

export type { ArtifactContent, CleanedArtifactWithPath, ResolvedSection } from './types.js';

export type { ArtifactSection } from '../artifact-order.js';
export {
  ARTIFACT_SECTIONS,
  MANIFEST_SECTION_ID,
  MANIFEST_SECTION_TITLE,
  SUPPLEMENTARY_SECTION_ID,
  SUPPLEMENTARY_SECTION_TITLE,
  TRADECRAFT_SECTION_ID,
  TRADECRAFT_SECTION_TITLE,
} from '../artifact-order.js';

export type { CleanArtifactOptions, CleanArtifactResult } from '../clean-artifact.js';
export {
  cleanArtifact,
  dedupMermaid,
  demoteHeadings,
  githubBlobUrl,
  githubRawUrl,
  resolveLink,
  rewriteLinks,
  stripArtifactMetadataPreamble,
  stripBanners,
  stripFrontMatter,
  stripSpdxTags,
} from '../clean-artifact.js';
