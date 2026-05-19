// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0

/**
 * @module Aggregator/Run/AnalysisIndex
 * @description Renders the analysis-index appendix listing every artifact
 * that contributed to the aggregated document.
 */

import { MANIFEST_SECTION_ID, MANIFEST_SECTION_TITLE } from '../artifact-order.js';
import { githubBlobUrl } from '../clean-artifact.js';
import type { IncludedArtifact } from '../reader-guide-constants.js';

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
