// SPDX-FileCopyrightText: 2024-2026 Hack23 AB
// SPDX-License-Identifier: Apache-2.0
/**
 * @module Aggregator/Run/Provenance
 * @description Renders the provenance blockquote prefixed to every
 * aggregated analysis document.
 */
import { githubBlobUrl } from '../clean-artifact.js';
import { treeUrl } from '../infra/github-urls.js';
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
//# sourceMappingURL=provenance.js.map