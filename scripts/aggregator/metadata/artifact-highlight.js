// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Metadata/ArtifactHighlight
 * @description Thin re-export barrel that aggregates the three split
 * highlight modules back into the single public surface expected by
 * `article-metadata.ts`:
 *
 * - {@link extractArtifactHighlight} — primary editorial-artefact walker
 *   (see `editorial-highlight.ts`)
 * - {@link extractPriorityFindingHighlight} — fallback priority-finding
 *   extractor (see `priority-finding-highlight.ts`)
 * - {@link isTranslatedSiblingBrief} — translated-sibling filter predicate
 *   (see `translated-sibling.ts`)
 *
 * @see editorial-highlight.ts
 * @see priority-finding-highlight.ts
 * @see translated-sibling.ts
 */
export { extractArtifactHighlight } from './editorial-highlight.js';
export { extractPriorityFindingHighlight } from './priority-finding-highlight.js';
export { isTranslatedSiblingBrief } from './translated-sibling.js';
//# sourceMappingURL=artifact-highlight.js.map