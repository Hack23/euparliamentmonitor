// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Run
 * @description Barrel re-exporting the per-phase rendering helpers used by
 * the analysis aggregator orchestrator. Internal aggregator consumers
 * import from this barrel so individual phase files can be relocated
 * without rippling through call sites.
 */

export { renderAnalysisIndex } from './analysis-index.js';
export {
  flattenManifestFiles,
  guessDateFromRunDir,
  latestGateResult,
  resolveArticleTypeFromManifest,
} from './manifest.js';
export { renderProvenanceBlock } from './provenance.js';
export { renderReaderIntelligenceGuide } from './reader-guide.js';
export { expandSectionArtifacts } from './section-expansion.js';
export { discoverTradecraftFiles, humanizeStem, renderTradecraftAppendix } from './tradecraft.js';
